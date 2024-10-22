// As LangChain.js uses the ReadableStream class, we need to polyfill it in the Jest environment.
globalThis.ReadableStream = require("readable-stream");
