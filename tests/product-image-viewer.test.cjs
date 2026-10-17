const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const babel = require("@babel/core");

function setup(count = 3, initialIndex = 1) {
  const slots = [], changes = [], scrolls = [];
  let cursor = 0, closed = false;
  const React = {
    createElement(type, props, ...children) { return { type, props: { ...props, children: children.flat(Infinity) } }; },
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] || (slots[index] = { current: initial }); },
    useEffect() {}
  };
  const { code } = babel.transformSync(fs.readFileSync("src/components/ProductImageViewer.js", "utf8"), {
    configFile: false, babelrc: false,
    plugins: ["@babel/plugin-transform-react-jsx", "@babel/plugin-transform-modules-commonjs"]
  });
  const context = { exports: {}, require(name) {
    if (name === "react") return React;
    if (name === "react-native") return { Modal: "Modal", Pressable: "Pressable", ScrollView: "ScrollView", Text: "Text", View: "View", StyleSheet: { create: (styles) => styles }, useWindowDimensions: () => ({ width: 390, height: 844 }) };
    if (name === "react-native-safe-area-context") return { SafeAreaView: "SafeAreaView", useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
    if (name === "@expo/vector-icons") return { Feather: "Icon" };
    return "Image";
  } };
  vm.runInNewContext(code, context);
  const props = { images: Array.from({ length: count }, (_, i) => ({ label: `Photo ${i + 1}`, image: `image-${i}` })), initialIndex, productName: "Atta", onImageChange: (index) => changes.push(index), onClose: () => { closed = true; } };
  let nodes = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    nodes.push(node);
    if (node.props.ref) node.props.ref.current = { scrollTo: (options) => scrolls.push(options) };
    node.props.children.forEach(walk);
  };
  return {
    render() { cursor = 0; nodes = []; walk(context.exports.default(props)); },
    find: (predicate) => nodes.find(predicate),
    button: (label) => nodes.find((node) => node.props.accessibilityLabel === label),
    changes, scrolls,
    isClosed: () => closed
  };
}

test("viewer opens at the tapped photo and arrows and thumbnails navigate within bounds", () => {
  const app = setup();
  app.render();
  app.find((node) => node.type === "Modal").props.onShow();
  assert.equal(app.scrolls.at(-1).x, 390);
  app.button("Next photo").props.onPress();
  app.render();
  assert.equal(app.changes.at(-1), 2);
  assert.equal(app.button("Next photo").props.disabled, true);
  app.button("Next photo").props.onPress();
  assert.equal(app.changes.length, 1);
  app.button("Previous photo").props.onPress();
  app.render();
  assert.equal(app.changes.at(-1), 1);
  app.button("Show photo 1").props.onPress();
  app.render();
  assert.equal(app.changes.at(-1), 0);
  assert.equal(app.button("Previous photo").props.disabled, true);
  assert.equal(app.button("Show photo 1").props.accessibilityState.selected, true);
  app.button("Close photo viewer").props.onPress();
  assert.equal(app.isClosed(), true);
});

test("swiping synchronizes the selected photo and zooming pauses page swipes", () => {
  const app = setup();
  app.render();
  app.find((node) => node.props.maximumZoomScale === 3 && node.props.key === "1-true").props.onScroll({ nativeEvent: { zoomScale: 2 } });
  app.render();
  assert.equal(app.find((node) => node.props.pagingEnabled).props.scrollEnabled, false);
  app.button("Next photo").props.onPress();
  app.render();
  assert.equal(app.find((node) => node.props.pagingEnabled).props.scrollEnabled, true);
  app.find((node) => node.props.pagingEnabled).props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: 390 } } });
  app.render();
  assert.equal(app.changes.at(-1), 1);
  assert.equal(app.button("Show photo 2").props.accessibilityState.selected, true);
});

test("a single photo opens without navigation controls", () => {
  const app = setup(1, 8);
  app.render();
  app.find((node) => node.type === "Modal").props.onShow();
  assert.equal(app.scrolls.at(-1).x, 0);
  assert.equal(app.button("Next photo"), undefined);
  assert.equal(app.button("Previous photo"), undefined);
  assert.equal(app.find((node) => node.type === "Text" && node.props.children.join("") === "1 / 1").type, "Text");
});
