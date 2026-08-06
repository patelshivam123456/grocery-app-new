const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "node_modules", "freeport-async", "index.js");

if (!fs.existsSync(target)) {
  process.exit(0);
}

let source = fs.readFileSync(target, "utf8");
const original = source;

if (!source.includes("MAX_PORT = 65535")) {
  source = source.replace(
    'const DEFAULT_PORT_RANGE_START = 11000;\n',
    'const DEFAULT_PORT_RANGE_START = 11000;\nconst MAX_PORT = 65535;\n'
  );
}

if (!source.includes("!Number.isInteger(port) || port < 0 || port > MAX_PORT")) {
  source = source.replace(
    'function testPortAsync(port, hostname) {\n',
    'function testPortAsync(port, hostname) {\n  if (!Number.isInteger(port) || port < 0 || port > MAX_PORT) {\n    return Promise.resolve(false);\n  }\n'
  );
}

if (!source.includes("lowPort > MAX_PORT")) {
  source = source.replace(
    '    var lowPort = rangeStart || DEFAULT_PORT_RANGE_START;\n    var awaitables = [];\n',
    '    var lowPort = rangeStart || DEFAULT_PORT_RANGE_START;\n    if (lowPort > MAX_PORT) {\n      fulfill([]);\n      return;\n    }\n    rangeSize = Math.min(rangeSize, MAX_PORT - lowPort + 1);\n    var awaitables = [];\n'
  );
}

if (!source.includes("return result[0] || null;")) {
  source = source.replace(
    '  return result[0];\n',
    '  return result[0] || null;\n'
  );
}

if (!source.includes('err.code === "EPERM" || err.code === "EACCES"')) {
  source = source.replace(
    '    server.on("error", function(err) {\n      setTimeout(() => fulfill(false), 0);\n    });\n',
    '    server.on("error", function(err) {\n      if (err && (err.code === "EPERM" || err.code === "EACCES")) {\n        reject(err);\n        return;\n      }\n      setTimeout(() => fulfill(false), 0);\n    });\n'
  );
}

if (source !== original) {
  fs.writeFileSync(target, source);
}
