const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const babel = require("@babel/core");

function setup(platform = "android", verify = () => Promise.resolve()) {
  const slots = [], effects = [], calls = [], actions = [];
  let cursor = 0, nodes = [];
  const React = {
    createElement(type, props, ...children) { return { type, props: { ...props, children: children.flat(Infinity) } }; },
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = initial; return [slots[index], (value) => { slots[index] = value; }]; },
    useRef(initial) { const index = cursor++; return slots[index] || (slots[index] = { current: initial }); },
    useEffect(effect, deps) {
      const index = cursor++;
      if (!(index in slots) || deps.some((value, i) => value !== slots[index]?.[i])) { slots[index] = deps; effects.push(effect); }
    }
  };
  const dispatch = (action) => { actions.push(action); return { unwrap: () => action.type === "verify" ? verify() : Promise.resolve() }; };
  const { code } = babel.transformSync(fs.readFileSync("src/components/LoginOtpSheet.js", "utf8"), {
    configFile: false, babelrc: false, plugins: ["@babel/plugin-transform-react-jsx", "@babel/plugin-transform-modules-commonjs"]
  });
  const context = { exports: {}, require(name) {
    if (name === "react") return React;
    if (name === "react-native") return { Keyboard: { dismiss: () => calls.push("dismiss") }, KeyboardAvoidingView: "KeyboardAvoidingView", Modal: "Modal", Pressable: "Pressable", ScrollView: "ScrollView", Text: "Text", TextInput: "TextInput", View: "View", Platform: { OS: platform }, StyleSheet: { create: (styles) => styles, absoluteFillObject: {} } };
    if (name === "react-native-safe-area-context") return { useSafeAreaInsets: () => ({ top: 24, bottom: 16 }) };
    if (name === "react-redux") return { useDispatch: () => dispatch };
    if (name === "@expo/vector-icons") return { Feather: "Icon" };
    if (name.includes("auth.service")) return { STATIC_DEV_OTP: "123456" };
    if (name.includes("authSlice")) return { generateCustomerOtp: (mobile) => ({ type: "generate", mobile }), verifyCustomerOtp: (payload) => ({ type: "verify", payload }) };
    if (name.includes("appSlice")) return { showToast: (message) => ({ type: "toast", message }) };
    if (name.includes("colors")) return { colors: {} };
    if (name.includes("typography")) return { type: {} };
    return "AppButton";
  } };
  vm.runInNewContext(code, context);
  const walk = (node, ancestors = []) => {
    if (!node || typeof node !== "object") return;
    nodes.push({ node, ancestors });
    node.props.children.forEach((child) => walk(child, [...ancestors, node]));
  };
  return {
    render() { cursor = 0; nodes = []; walk(context.exports.default({ visible: true, onClose: () => calls.push("close"), onSuccess: (mobile) => calls.push(`success:${mobile}`) })); while (effects.length) effects.shift()(); },
    find: (predicate) => nodes.find(({ node }) => predicate(node))?.node,
    field: (label) => nodes.find(({ node }) => node.props.accessibilityLabel === label),
    calls, actions
  };
}

async function enterOtp(app) {
  app.render();
  app.field("Mobile number").node.props.onChangeText("9876543210");
  app.render();
  await app.find((node) => node.props.title === "Send OTP").props.onPress();
  app.render();
}

for (const platform of ["android", "ios"]) {
  test(`${platform} keeps mobile and OTP forms in the keyboard-aware scroll container`, async () => {
    const app = setup(platform);
    app.render();
    const mobile = app.field("Mobile number");
    assert.equal(mobile.ancestors.find((node) => node.type === "KeyboardAvoidingView").props.behavior, platform === "ios" ? "padding" : "height");
    assert.equal(mobile.ancestors.find((node) => node.type === "ScrollView").props.keyboardShouldPersistTaps, "handled");
    await enterOtp(app);
    const otp = app.field("Six digit OTP");
    assert.equal(otp.node.props.autoFocus, true);
    assert.ok(otp.ancestors.some((node) => node.type === "KeyboardAvoidingView"));
    assert.equal(otp.ancestors.find((node) => node.type === "ScrollView").props.keyboardShouldPersistTaps, "handled");
  });
}

test("successful OTP verification dismisses the keyboard and continues checkout", async () => {
  const app = setup();
  await enterOtp(app);
  app.field("Six digit OTP").node.props.onChangeText("123456");
  app.render();
  await app.find((node) => node.props.title === "Verify & continue").props.onPress();
  assert.deepEqual(app.calls, ["dismiss", "close", "success:9876543210"]);
  assert.equal(app.actions.at(-1).type, "verify");
});

test("dismissing a pending verification does not continue checkout later", async () => {
  let resolve;
  const app = setup("android", () => new Promise((done) => { resolve = done; }));
  await enterOtp(app);
  app.field("Six digit OTP").node.props.onChangeText("123456");
  app.render();
  const pending = app.find((node) => node.props.title === "Verify & continue").props.onPress();
  app.find((node) => node.props.accessibilityLabel === "Close login").props.onPress();
  resolve();
  await pending;
  assert.deepEqual(app.calls, ["dismiss", "close"]);
});
