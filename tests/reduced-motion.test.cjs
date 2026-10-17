const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const babel = require("@babel/core");

function setup(preference) {
  let value, mounted = false, cleanup, listener, updates = 0, removals = 0;
  const React = {
    useState(initial) {
      if (!mounted) value = initial;
      return [value, (next) => { value = next; updates++; }];
    },
    useEffect(effect) { if (!mounted) cleanup = effect(); }
  };
  const { code } = babel.transformSync(fs.readFileSync("src/hooks/useReducedMotion.js", "utf8"), {
    configFile: false, babelrc: false, plugins: ["@babel/plugin-transform-modules-commonjs"]
  });
  const context = { exports: {}, require(name) {
    if (name === "react") return React;
    return { AccessibilityInfo: {
      isReduceMotionEnabled: () => preference,
      addEventListener(event, callback) {
        assert.equal(event, "reduceMotionChanged");
        listener = callback;
        return { remove() { removals++; } };
      }
    } };
  } };
  vm.runInNewContext(code, context);
  return {
    render() { const result = context.exports.default(); mounted = true; return result; },
    emit: (enabled) => listener(enabled),
    unmount: () => cleanup(),
    counts: () => ({ updates, removals })
  };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test("reads reduced-motion preference and follows live setting changes", async () => {
  const app = setup(Promise.resolve(false));
  assert.equal(app.render(), null);
  await settle();
  assert.equal(app.render(), false);
  app.emit(true);
  assert.equal(app.render(), true);
  app.emit(false);
  assert.equal(app.render(), false);
});

test("a live preference change wins over a stale initial read", async () => {
  let resolve;
  const app = setup(new Promise((done) => { resolve = done; }));
  app.render();
  app.emit(true);
  resolve(false);
  await settle();
  assert.equal(app.render(), true);
});

test("unmount removes the listener and ignores late results", async () => {
  let resolve;
  const app = setup(new Promise((done) => { resolve = done; }));
  app.render();
  app.unmount();
  resolve(false);
  await settle();
  assert.deepEqual(app.counts(), { updates: 0, removals: 1 });
});

test("unavailable preferences default to reduced motion", async () => {
  const app = setup(Promise.reject(new Error("Unavailable")));
  app.render();
  await settle();
  assert.equal(app.render(), true);
});
