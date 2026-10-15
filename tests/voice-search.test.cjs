const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const babel = require("@babel/core");

function setup({ permission = Promise.resolve({ granted: true }), available = true, missing = false, platform = "android" } = {}) {
  const slots = [], cleanups = [], listeners = new Map(), transcripts = [];
  let cursor = 0, permissionCalls = 0, starts = 0, stops = 0, aborts = 0;
  const React = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => { slots[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] || (slots[index] = { current: initial });
    },
    useCallback(callback, deps) {
      const index = cursor++;
      const prior = slots[index];
      if (!prior || deps.some((value, i) => value !== prior.deps[i])) slots[index] = { callback, deps };
      return slots[index].callback;
    },
    useEffect(effect) {
      const index = cursor++;
      if (!(index in slots)) { slots[index] = true; cleanups.push(effect()); }
    }
  };
  const engine = {
    isRecognitionAvailable: () => available,
    requestPermissionsAsync() { permissionCalls++; return permission; },
    addListener(name, listener) { listeners.set(name, listener); return { remove: () => listeners.delete(name) }; },
    start(options) { starts++; assert.equal(options.lang, "en-IN"); listeners.get("start")?.(); },
    stop() { stops++; listeners.get("end")?.(); },
    abort() { aborts++; }
  };
  const source = fs.readFileSync("src/hooks/useVoiceSearch.js", "utf8");
  const { code } = babel.transformSync(source, { configFile: false, babelrc: false, plugins: ["@babel/plugin-transform-modules-commonjs"] });
  const box = { exports: {}, require(name) {
    if (name === "react") return React;
    if (name === "react-native") return { Keyboard: { dismiss() {} }, Platform: { OS: platform } };
    return { getSpeechRecognition: () => missing ? null : engine };
  } };
  vm.runInNewContext(code, box);
  return {
    render() { cursor = 0; return box.exports.default((...args) => transcripts.push(args)); },
    emit: (name, event) => listeners.get(name)?.(event),
    listener: (name) => listeners.get(name),
    unmount: () => cleanups.forEach((cleanup) => cleanup?.()),
    transcripts,
    counts: () => ({ starts, stops, aborts, permissionCalls, listeners: listeners.size })
  };
}

test("speech updates search with interim and final product/category names", async () => {
  const app = setup();
  await app.render().start();
  assert.equal(app.render().status, "listening");
  app.emit("result", { results: [{ transcript: "Fresh" }], isFinal: false });
  app.emit("result", { results: [{ transcript: " Fresh vegetables. " }], isFinal: true });
  assert.deepEqual(app.transcripts, [["Fresh", false], ["Fresh vegetables", true]]);
  app.render().toggle();
  assert.equal(app.counts().stops, 1);
  assert.equal(app.render().status, "idle");
  assert.equal(app.counts().listeners, 0);
});

test("permission denial leaves typing available and does not start microphone", async () => {
  const app = setup({ permission: Promise.resolve({ granted: false }) });
  await app.render().start();
  assert.match(app.render().error, /Allow microphone/);
  assert.equal(app.render().status, "idle");
  assert.equal(app.counts().starts, 0);
});

test("leaving search while permission is pending prevents a late start", async () => {
  let grant;
  const app = setup({ permission: new Promise((resolve) => { grant = resolve; }) });
  const pending = app.render().start();
  app.render().cancel();
  grant({ granted: true });
  await pending;
  assert.equal(app.counts().starts, 0);
  assert.equal(app.render().status, "idle");
});

test("unmount aborts recognition and ignores late speech callbacks", async () => {
  const app = setup();
  await app.render().start();
  const lateResult = app.listener("result");
  app.unmount();
  lateResult({ results: [{ transcript: "Milk" }], isFinal: true });
  assert.equal(app.counts().aborts, 1);
  assert.equal(app.counts().listeners, 0);
  assert.equal(app.transcripts.length, 0);
});

test("missing native module and unsupported browsers show an inline explanation", async () => {
  for (const options of [{ missing: true }, { available: false, platform: "web" }]) {
    const app = setup(options);
    await app.render().start();
    assert.match(app.render().error, /still type/);
    assert.equal(app.counts().starts, 0);
  }
});

test("web uses browser permissions and surfaces recognition errors", async () => {
  const app = setup({ platform: "web" });
  await app.render().start();
  assert.equal(app.counts().permissionCalls, 0);
  app.emit("error", { error: "no-speech" });
  assert.match(app.render().error, /No speech detected/);
  assert.equal(app.render().status, "idle");
  await app.render().start();
  assert.equal(app.render().error, null);
  assert.equal(app.counts().starts, 2);
});

test("repeated taps cannot create concurrent recognition sessions", async () => {
  const app = setup();
  const voice = app.render();
  await Promise.all([voice.start(), voice.start()]);
  assert.equal(app.counts().starts, 1);
});
