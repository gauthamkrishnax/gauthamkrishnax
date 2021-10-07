var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});

// node_modules/@sveltejs/kit/dist/install-fetch.js
var import_http = __toModule(require("http"));
var import_https = __toModule(require("https"));
var import_zlib = __toModule(require("zlib"));
var import_stream = __toModule(require("stream"));
var import_util = __toModule(require("util"));
var import_crypto = __toModule(require("crypto"));
var import_url = __toModule(require("url"));
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
var src = dataUriToBuffer;
var dataUriToBuffer$1 = src;
var ponyfill_es2018 = { exports: {} };
(function(module2, exports) {
  (function(global2, factory) {
    factory(exports);
  })(commonjsGlobal, function(exports2) {
    const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
    function noop2() {
      return void 0;
    }
    function getGlobals() {
      if (typeof self !== "undefined") {
        return self;
      } else if (typeof window !== "undefined") {
        return window;
      } else if (typeof commonjsGlobal !== "undefined") {
        return commonjsGlobal;
      }
      return void 0;
    }
    const globals = getGlobals();
    function typeIsObject(x) {
      return typeof x === "object" && x !== null || typeof x === "function";
    }
    const rethrowAssertionErrorRejection = noop2;
    const originalPromise = Promise;
    const originalPromiseThen = Promise.prototype.then;
    const originalPromiseResolve = Promise.resolve.bind(originalPromise);
    const originalPromiseReject = Promise.reject.bind(originalPromise);
    function newPromise(executor) {
      return new originalPromise(executor);
    }
    function promiseResolvedWith(value) {
      return originalPromiseResolve(value);
    }
    function promiseRejectedWith(reason) {
      return originalPromiseReject(reason);
    }
    function PerformPromiseThen(promise, onFulfilled, onRejected) {
      return originalPromiseThen.call(promise, onFulfilled, onRejected);
    }
    function uponPromise(promise, onFulfilled, onRejected) {
      PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), void 0, rethrowAssertionErrorRejection);
    }
    function uponFulfillment(promise, onFulfilled) {
      uponPromise(promise, onFulfilled);
    }
    function uponRejection(promise, onRejected) {
      uponPromise(promise, void 0, onRejected);
    }
    function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
      return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
    }
    function setPromiseIsHandledToTrue(promise) {
      PerformPromiseThen(promise, void 0, rethrowAssertionErrorRejection);
    }
    const queueMicrotask = (() => {
      const globalQueueMicrotask = globals && globals.queueMicrotask;
      if (typeof globalQueueMicrotask === "function") {
        return globalQueueMicrotask;
      }
      const resolvedPromise = promiseResolvedWith(void 0);
      return (fn) => PerformPromiseThen(resolvedPromise, fn);
    })();
    function reflectCall(F, V, args) {
      if (typeof F !== "function") {
        throw new TypeError("Argument is not a function");
      }
      return Function.prototype.apply.call(F, V, args);
    }
    function promiseCall(F, V, args) {
      try {
        return promiseResolvedWith(reflectCall(F, V, args));
      } catch (value) {
        return promiseRejectedWith(value);
      }
    }
    const QUEUE_MAX_ARRAY_SIZE = 16384;
    class SimpleQueue {
      constructor() {
        this._cursor = 0;
        this._size = 0;
        this._front = {
          _elements: [],
          _next: void 0
        };
        this._back = this._front;
        this._cursor = 0;
        this._size = 0;
      }
      get length() {
        return this._size;
      }
      push(element) {
        const oldBack = this._back;
        let newBack = oldBack;
        if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
          newBack = {
            _elements: [],
            _next: void 0
          };
        }
        oldBack._elements.push(element);
        if (newBack !== oldBack) {
          this._back = newBack;
          oldBack._next = newBack;
        }
        ++this._size;
      }
      shift() {
        const oldFront = this._front;
        let newFront = oldFront;
        const oldCursor = this._cursor;
        let newCursor = oldCursor + 1;
        const elements = oldFront._elements;
        const element = elements[oldCursor];
        if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
          newFront = oldFront._next;
          newCursor = 0;
        }
        --this._size;
        this._cursor = newCursor;
        if (oldFront !== newFront) {
          this._front = newFront;
        }
        elements[oldCursor] = void 0;
        return element;
      }
      forEach(callback) {
        let i = this._cursor;
        let node = this._front;
        let elements = node._elements;
        while (i !== elements.length || node._next !== void 0) {
          if (i === elements.length) {
            node = node._next;
            elements = node._elements;
            i = 0;
            if (elements.length === 0) {
              break;
            }
          }
          callback(elements[i]);
          ++i;
        }
      }
      peek() {
        const front = this._front;
        const cursor = this._cursor;
        return front._elements[cursor];
      }
    }
    function ReadableStreamReaderGenericInitialize(reader, stream) {
      reader._ownerReadableStream = stream;
      stream._reader = reader;
      if (stream._state === "readable") {
        defaultReaderClosedPromiseInitialize(reader);
      } else if (stream._state === "closed") {
        defaultReaderClosedPromiseInitializeAsResolved(reader);
      } else {
        defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
      }
    }
    function ReadableStreamReaderGenericCancel(reader, reason) {
      const stream = reader._ownerReadableStream;
      return ReadableStreamCancel(stream, reason);
    }
    function ReadableStreamReaderGenericRelease(reader) {
      if (reader._ownerReadableStream._state === "readable") {
        defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
      } else {
        defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
      }
      reader._ownerReadableStream._reader = void 0;
      reader._ownerReadableStream = void 0;
    }
    function readerLockException(name) {
      return new TypeError("Cannot " + name + " a stream using a released reader");
    }
    function defaultReaderClosedPromiseInitialize(reader) {
      reader._closedPromise = newPromise((resolve2, reject) => {
        reader._closedPromise_resolve = resolve2;
        reader._closedPromise_reject = reject;
      });
    }
    function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
      defaultReaderClosedPromiseInitialize(reader);
      defaultReaderClosedPromiseReject(reader, reason);
    }
    function defaultReaderClosedPromiseInitializeAsResolved(reader) {
      defaultReaderClosedPromiseInitialize(reader);
      defaultReaderClosedPromiseResolve(reader);
    }
    function defaultReaderClosedPromiseReject(reader, reason) {
      if (reader._closedPromise_reject === void 0) {
        return;
      }
      setPromiseIsHandledToTrue(reader._closedPromise);
      reader._closedPromise_reject(reason);
      reader._closedPromise_resolve = void 0;
      reader._closedPromise_reject = void 0;
    }
    function defaultReaderClosedPromiseResetToRejected(reader, reason) {
      defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
    }
    function defaultReaderClosedPromiseResolve(reader) {
      if (reader._closedPromise_resolve === void 0) {
        return;
      }
      reader._closedPromise_resolve(void 0);
      reader._closedPromise_resolve = void 0;
      reader._closedPromise_reject = void 0;
    }
    const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
    const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
    const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
    const PullSteps = SymbolPolyfill("[[PullSteps]]");
    const NumberIsFinite = Number.isFinite || function(x) {
      return typeof x === "number" && isFinite(x);
    };
    const MathTrunc = Math.trunc || function(v) {
      return v < 0 ? Math.ceil(v) : Math.floor(v);
    };
    function isDictionary(x) {
      return typeof x === "object" || typeof x === "function";
    }
    function assertDictionary(obj, context) {
      if (obj !== void 0 && !isDictionary(obj)) {
        throw new TypeError(`${context} is not an object.`);
      }
    }
    function assertFunction(x, context) {
      if (typeof x !== "function") {
        throw new TypeError(`${context} is not a function.`);
      }
    }
    function isObject(x) {
      return typeof x === "object" && x !== null || typeof x === "function";
    }
    function assertObject(x, context) {
      if (!isObject(x)) {
        throw new TypeError(`${context} is not an object.`);
      }
    }
    function assertRequiredArgument(x, position, context) {
      if (x === void 0) {
        throw new TypeError(`Parameter ${position} is required in '${context}'.`);
      }
    }
    function assertRequiredField(x, field, context) {
      if (x === void 0) {
        throw new TypeError(`${field} is required in '${context}'.`);
      }
    }
    function convertUnrestrictedDouble(value) {
      return Number(value);
    }
    function censorNegativeZero(x) {
      return x === 0 ? 0 : x;
    }
    function integerPart(x) {
      return censorNegativeZero(MathTrunc(x));
    }
    function convertUnsignedLongLongWithEnforceRange(value, context) {
      const lowerBound = 0;
      const upperBound = Number.MAX_SAFE_INTEGER;
      let x = Number(value);
      x = censorNegativeZero(x);
      if (!NumberIsFinite(x)) {
        throw new TypeError(`${context} is not a finite number`);
      }
      x = integerPart(x);
      if (x < lowerBound || x > upperBound) {
        throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
      }
      if (!NumberIsFinite(x) || x === 0) {
        return 0;
      }
      return x;
    }
    function assertReadableStream(x, context) {
      if (!IsReadableStream(x)) {
        throw new TypeError(`${context} is not a ReadableStream.`);
      }
    }
    function AcquireReadableStreamDefaultReader(stream) {
      return new ReadableStreamDefaultReader(stream);
    }
    function ReadableStreamAddReadRequest(stream, readRequest) {
      stream._reader._readRequests.push(readRequest);
    }
    function ReadableStreamFulfillReadRequest(stream, chunk, done) {
      const reader = stream._reader;
      const readRequest = reader._readRequests.shift();
      if (done) {
        readRequest._closeSteps();
      } else {
        readRequest._chunkSteps(chunk);
      }
    }
    function ReadableStreamGetNumReadRequests(stream) {
      return stream._reader._readRequests.length;
    }
    function ReadableStreamHasDefaultReader(stream) {
      const reader = stream._reader;
      if (reader === void 0) {
        return false;
      }
      if (!IsReadableStreamDefaultReader(reader)) {
        return false;
      }
      return true;
    }
    class ReadableStreamDefaultReader {
      constructor(stream) {
        assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
        assertReadableStream(stream, "First parameter");
        if (IsReadableStreamLocked(stream)) {
          throw new TypeError("This stream has already been locked for exclusive reading by another reader");
        }
        ReadableStreamReaderGenericInitialize(this, stream);
        this._readRequests = new SimpleQueue();
      }
      get closed() {
        if (!IsReadableStreamDefaultReader(this)) {
          return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
        }
        return this._closedPromise;
      }
      cancel(reason = void 0) {
        if (!IsReadableStreamDefaultReader(this)) {
          return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
        }
        if (this._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("cancel"));
        }
        return ReadableStreamReaderGenericCancel(this, reason);
      }
      read() {
        if (!IsReadableStreamDefaultReader(this)) {
          return promiseRejectedWith(defaultReaderBrandCheckException("read"));
        }
        if (this._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("read from"));
        }
        let resolvePromise;
        let rejectPromise;
        const promise = newPromise((resolve2, reject) => {
          resolvePromise = resolve2;
          rejectPromise = reject;
        });
        const readRequest = {
          _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
          _closeSteps: () => resolvePromise({ value: void 0, done: true }),
          _errorSteps: (e) => rejectPromise(e)
        };
        ReadableStreamDefaultReaderRead(this, readRequest);
        return promise;
      }
      releaseLock() {
        if (!IsReadableStreamDefaultReader(this)) {
          throw defaultReaderBrandCheckException("releaseLock");
        }
        if (this._ownerReadableStream === void 0) {
          return;
        }
        if (this._readRequests.length > 0) {
          throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
        }
        ReadableStreamReaderGenericRelease(this);
      }
    }
    Object.defineProperties(ReadableStreamDefaultReader.prototype, {
      cancel: { enumerable: true },
      read: { enumerable: true },
      releaseLock: { enumerable: true },
      closed: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamDefaultReader",
        configurable: true
      });
    }
    function IsReadableStreamDefaultReader(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) {
        return false;
      }
      return x instanceof ReadableStreamDefaultReader;
    }
    function ReadableStreamDefaultReaderRead(reader, readRequest) {
      const stream = reader._ownerReadableStream;
      stream._disturbed = true;
      if (stream._state === "closed") {
        readRequest._closeSteps();
      } else if (stream._state === "errored") {
        readRequest._errorSteps(stream._storedError);
      } else {
        stream._readableStreamController[PullSteps](readRequest);
      }
    }
    function defaultReaderBrandCheckException(name) {
      return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
    }
    const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
    }).prototype);
    class ReadableStreamAsyncIteratorImpl {
      constructor(reader, preventCancel) {
        this._ongoingPromise = void 0;
        this._isFinished = false;
        this._reader = reader;
        this._preventCancel = preventCancel;
      }
      next() {
        const nextSteps = () => this._nextSteps();
        this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
        return this._ongoingPromise;
      }
      return(value) {
        const returnSteps = () => this._returnSteps(value);
        return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
      }
      _nextSteps() {
        if (this._isFinished) {
          return Promise.resolve({ value: void 0, done: true });
        }
        const reader = this._reader;
        if (reader._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("iterate"));
        }
        let resolvePromise;
        let rejectPromise;
        const promise = newPromise((resolve2, reject) => {
          resolvePromise = resolve2;
          rejectPromise = reject;
        });
        const readRequest = {
          _chunkSteps: (chunk) => {
            this._ongoingPromise = void 0;
            queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
          },
          _closeSteps: () => {
            this._ongoingPromise = void 0;
            this._isFinished = true;
            ReadableStreamReaderGenericRelease(reader);
            resolvePromise({ value: void 0, done: true });
          },
          _errorSteps: (reason) => {
            this._ongoingPromise = void 0;
            this._isFinished = true;
            ReadableStreamReaderGenericRelease(reader);
            rejectPromise(reason);
          }
        };
        ReadableStreamDefaultReaderRead(reader, readRequest);
        return promise;
      }
      _returnSteps(value) {
        if (this._isFinished) {
          return Promise.resolve({ value, done: true });
        }
        this._isFinished = true;
        const reader = this._reader;
        if (reader._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("finish iterating"));
        }
        if (!this._preventCancel) {
          const result = ReadableStreamReaderGenericCancel(reader, value);
          ReadableStreamReaderGenericRelease(reader);
          return transformPromiseWith(result, () => ({ value, done: true }));
        }
        ReadableStreamReaderGenericRelease(reader);
        return promiseResolvedWith({ value, done: true });
      }
    }
    const ReadableStreamAsyncIteratorPrototype = {
      next() {
        if (!IsReadableStreamAsyncIterator(this)) {
          return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
        }
        return this._asyncIteratorImpl.next();
      },
      return(value) {
        if (!IsReadableStreamAsyncIterator(this)) {
          return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
        }
        return this._asyncIteratorImpl.return(value);
      }
    };
    if (AsyncIteratorPrototype !== void 0) {
      Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
    }
    function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
      const reader = AcquireReadableStreamDefaultReader(stream);
      const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
      const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
      iterator._asyncIteratorImpl = impl;
      return iterator;
    }
    function IsReadableStreamAsyncIterator(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) {
        return false;
      }
      try {
        return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
      } catch (_a) {
        return false;
      }
    }
    function streamAsyncIteratorBrandCheckException(name) {
      return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
    }
    const NumberIsNaN = Number.isNaN || function(x) {
      return x !== x;
    };
    function CreateArrayFromList(elements) {
      return elements.slice();
    }
    function CopyDataBlockBytes(dest, destOffset, src2, srcOffset, n) {
      new Uint8Array(dest).set(new Uint8Array(src2, srcOffset, n), destOffset);
    }
    function TransferArrayBuffer(O) {
      return O;
    }
    function IsDetachedBuffer(O) {
      return false;
    }
    function ArrayBufferSlice(buffer, begin, end) {
      if (buffer.slice) {
        return buffer.slice(begin, end);
      }
      const length = end - begin;
      const slice = new ArrayBuffer(length);
      CopyDataBlockBytes(slice, 0, buffer, begin, length);
      return slice;
    }
    function IsNonNegativeNumber(v) {
      if (typeof v !== "number") {
        return false;
      }
      if (NumberIsNaN(v)) {
        return false;
      }
      if (v < 0) {
        return false;
      }
      return true;
    }
    function CloneAsUint8Array(O) {
      const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
      return new Uint8Array(buffer);
    }
    function DequeueValue(container) {
      const pair = container._queue.shift();
      container._queueTotalSize -= pair.size;
      if (container._queueTotalSize < 0) {
        container._queueTotalSize = 0;
      }
      return pair.value;
    }
    function EnqueueValueWithSize(container, value, size) {
      if (!IsNonNegativeNumber(size) || size === Infinity) {
        throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
      }
      container._queue.push({ value, size });
      container._queueTotalSize += size;
    }
    function PeekQueueValue(container) {
      const pair = container._queue.peek();
      return pair.value;
    }
    function ResetQueue(container) {
      container._queue = new SimpleQueue();
      container._queueTotalSize = 0;
    }
    class ReadableStreamBYOBRequest {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get view() {
        if (!IsReadableStreamBYOBRequest(this)) {
          throw byobRequestBrandCheckException("view");
        }
        return this._view;
      }
      respond(bytesWritten) {
        if (!IsReadableStreamBYOBRequest(this)) {
          throw byobRequestBrandCheckException("respond");
        }
        assertRequiredArgument(bytesWritten, 1, "respond");
        bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
        if (this._associatedReadableByteStreamController === void 0) {
          throw new TypeError("This BYOB request has been invalidated");
        }
        if (IsDetachedBuffer(this._view.buffer))
          ;
        ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
      }
      respondWithNewView(view) {
        if (!IsReadableStreamBYOBRequest(this)) {
          throw byobRequestBrandCheckException("respondWithNewView");
        }
        assertRequiredArgument(view, 1, "respondWithNewView");
        if (!ArrayBuffer.isView(view)) {
          throw new TypeError("You can only respond with array buffer views");
        }
        if (this._associatedReadableByteStreamController === void 0) {
          throw new TypeError("This BYOB request has been invalidated");
        }
        if (IsDetachedBuffer(view.buffer))
          ;
        ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
      }
    }
    Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
      respond: { enumerable: true },
      respondWithNewView: { enumerable: true },
      view: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamBYOBRequest",
        configurable: true
      });
    }
    class ReadableByteStreamController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get byobRequest() {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("byobRequest");
        }
        return ReadableByteStreamControllerGetBYOBRequest(this);
      }
      get desiredSize() {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("desiredSize");
        }
        return ReadableByteStreamControllerGetDesiredSize(this);
      }
      close() {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("close");
        }
        if (this._closeRequested) {
          throw new TypeError("The stream has already been closed; do not close it again!");
        }
        const state = this._controlledReadableByteStream._state;
        if (state !== "readable") {
          throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
        }
        ReadableByteStreamControllerClose(this);
      }
      enqueue(chunk) {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("enqueue");
        }
        assertRequiredArgument(chunk, 1, "enqueue");
        if (!ArrayBuffer.isView(chunk)) {
          throw new TypeError("chunk must be an array buffer view");
        }
        if (chunk.byteLength === 0) {
          throw new TypeError("chunk must have non-zero byteLength");
        }
        if (chunk.buffer.byteLength === 0) {
          throw new TypeError(`chunk's buffer must have non-zero byteLength`);
        }
        if (this._closeRequested) {
          throw new TypeError("stream is closed or draining");
        }
        const state = this._controlledReadableByteStream._state;
        if (state !== "readable") {
          throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
        }
        ReadableByteStreamControllerEnqueue(this, chunk);
      }
      error(e = void 0) {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("error");
        }
        ReadableByteStreamControllerError(this, e);
      }
      [CancelSteps](reason) {
        ReadableByteStreamControllerClearPendingPullIntos(this);
        ResetQueue(this);
        const result = this._cancelAlgorithm(reason);
        ReadableByteStreamControllerClearAlgorithms(this);
        return result;
      }
      [PullSteps](readRequest) {
        const stream = this._controlledReadableByteStream;
        if (this._queueTotalSize > 0) {
          const entry = this._queue.shift();
          this._queueTotalSize -= entry.byteLength;
          ReadableByteStreamControllerHandleQueueDrain(this);
          const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
          readRequest._chunkSteps(view);
          return;
        }
        const autoAllocateChunkSize = this._autoAllocateChunkSize;
        if (autoAllocateChunkSize !== void 0) {
          let buffer;
          try {
            buffer = new ArrayBuffer(autoAllocateChunkSize);
          } catch (bufferE) {
            readRequest._errorSteps(bufferE);
            return;
          }
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: autoAllocateChunkSize,
            byteOffset: 0,
            byteLength: autoAllocateChunkSize,
            bytesFilled: 0,
            elementSize: 1,
            viewConstructor: Uint8Array,
            readerType: "default"
          };
          this._pendingPullIntos.push(pullIntoDescriptor);
        }
        ReadableStreamAddReadRequest(stream, readRequest);
        ReadableByteStreamControllerCallPullIfNeeded(this);
      }
    }
    Object.defineProperties(ReadableByteStreamController.prototype, {
      close: { enumerable: true },
      enqueue: { enumerable: true },
      error: { enumerable: true },
      byobRequest: { enumerable: true },
      desiredSize: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableByteStreamController",
        configurable: true
      });
    }
    function IsReadableByteStreamController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) {
        return false;
      }
      return x instanceof ReadableByteStreamController;
    }
    function IsReadableStreamBYOBRequest(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) {
        return false;
      }
      return x instanceof ReadableStreamBYOBRequest;
    }
    function ReadableByteStreamControllerCallPullIfNeeded(controller) {
      const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
      if (!shouldPull) {
        return;
      }
      if (controller._pulling) {
        controller._pullAgain = true;
        return;
      }
      controller._pulling = true;
      const pullPromise = controller._pullAlgorithm();
      uponPromise(pullPromise, () => {
        controller._pulling = false;
        if (controller._pullAgain) {
          controller._pullAgain = false;
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
      }, (e) => {
        ReadableByteStreamControllerError(controller, e);
      });
    }
    function ReadableByteStreamControllerClearPendingPullIntos(controller) {
      ReadableByteStreamControllerInvalidateBYOBRequest(controller);
      controller._pendingPullIntos = new SimpleQueue();
    }
    function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
      let done = false;
      if (stream._state === "closed") {
        done = true;
      }
      const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
      if (pullIntoDescriptor.readerType === "default") {
        ReadableStreamFulfillReadRequest(stream, filledView, done);
      } else {
        ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
      }
    }
    function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
      const bytesFilled = pullIntoDescriptor.bytesFilled;
      const elementSize = pullIntoDescriptor.elementSize;
      return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
    }
    function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
      controller._queue.push({ buffer, byteOffset, byteLength });
      controller._queueTotalSize += byteLength;
    }
    function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
      const elementSize = pullIntoDescriptor.elementSize;
      const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
      const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
      const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
      const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
      let totalBytesToCopyRemaining = maxBytesToCopy;
      let ready = false;
      if (maxAlignedBytes > currentAlignedBytes) {
        totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
        ready = true;
      }
      const queue = controller._queue;
      while (totalBytesToCopyRemaining > 0) {
        const headOfQueue = queue.peek();
        const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
        const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
        CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
        if (headOfQueue.byteLength === bytesToCopy) {
          queue.shift();
        } else {
          headOfQueue.byteOffset += bytesToCopy;
          headOfQueue.byteLength -= bytesToCopy;
        }
        controller._queueTotalSize -= bytesToCopy;
        ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
        totalBytesToCopyRemaining -= bytesToCopy;
      }
      return ready;
    }
    function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
      pullIntoDescriptor.bytesFilled += size;
    }
    function ReadableByteStreamControllerHandleQueueDrain(controller) {
      if (controller._queueTotalSize === 0 && controller._closeRequested) {
        ReadableByteStreamControllerClearAlgorithms(controller);
        ReadableStreamClose(controller._controlledReadableByteStream);
      } else {
        ReadableByteStreamControllerCallPullIfNeeded(controller);
      }
    }
    function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
      if (controller._byobRequest === null) {
        return;
      }
      controller._byobRequest._associatedReadableByteStreamController = void 0;
      controller._byobRequest._view = null;
      controller._byobRequest = null;
    }
    function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
      while (controller._pendingPullIntos.length > 0) {
        if (controller._queueTotalSize === 0) {
          return;
        }
        const pullIntoDescriptor = controller._pendingPullIntos.peek();
        if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
        }
      }
    }
    function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
      const stream = controller._controlledReadableByteStream;
      let elementSize = 1;
      if (view.constructor !== DataView) {
        elementSize = view.constructor.BYTES_PER_ELEMENT;
      }
      const ctor = view.constructor;
      const buffer = TransferArrayBuffer(view.buffer);
      const pullIntoDescriptor = {
        buffer,
        bufferByteLength: buffer.byteLength,
        byteOffset: view.byteOffset,
        byteLength: view.byteLength,
        bytesFilled: 0,
        elementSize,
        viewConstructor: ctor,
        readerType: "byob"
      };
      if (controller._pendingPullIntos.length > 0) {
        controller._pendingPullIntos.push(pullIntoDescriptor);
        ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
        return;
      }
      if (stream._state === "closed") {
        const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
        readIntoRequest._closeSteps(emptyView);
        return;
      }
      if (controller._queueTotalSize > 0) {
        if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          ReadableByteStreamControllerHandleQueueDrain(controller);
          readIntoRequest._chunkSteps(filledView);
          return;
        }
        if (controller._closeRequested) {
          const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
          ReadableByteStreamControllerError(controller, e);
          readIntoRequest._errorSteps(e);
          return;
        }
      }
      controller._pendingPullIntos.push(pullIntoDescriptor);
      ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
      const stream = controller._controlledReadableByteStream;
      if (ReadableStreamHasBYOBReader(stream)) {
        while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
          const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
          ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
        }
      }
    }
    function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
      ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
      if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
        return;
      }
      ReadableByteStreamControllerShiftPendingPullInto(controller);
      const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
      if (remainderSize > 0) {
        const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
        const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
      }
      pullIntoDescriptor.bytesFilled -= remainderSize;
      ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
      ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
    }
    function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
      const firstDescriptor = controller._pendingPullIntos.peek();
      ReadableByteStreamControllerInvalidateBYOBRequest(controller);
      const state = controller._controlledReadableByteStream._state;
      if (state === "closed") {
        ReadableByteStreamControllerRespondInClosedState(controller);
      } else {
        ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
      }
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerShiftPendingPullInto(controller) {
      const descriptor = controller._pendingPullIntos.shift();
      return descriptor;
    }
    function ReadableByteStreamControllerShouldCallPull(controller) {
      const stream = controller._controlledReadableByteStream;
      if (stream._state !== "readable") {
        return false;
      }
      if (controller._closeRequested) {
        return false;
      }
      if (!controller._started) {
        return false;
      }
      if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
        return true;
      }
      if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
        return true;
      }
      const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
      if (desiredSize > 0) {
        return true;
      }
      return false;
    }
    function ReadableByteStreamControllerClearAlgorithms(controller) {
      controller._pullAlgorithm = void 0;
      controller._cancelAlgorithm = void 0;
    }
    function ReadableByteStreamControllerClose(controller) {
      const stream = controller._controlledReadableByteStream;
      if (controller._closeRequested || stream._state !== "readable") {
        return;
      }
      if (controller._queueTotalSize > 0) {
        controller._closeRequested = true;
        return;
      }
      if (controller._pendingPullIntos.length > 0) {
        const firstPendingPullInto = controller._pendingPullIntos.peek();
        if (firstPendingPullInto.bytesFilled > 0) {
          const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
          ReadableByteStreamControllerError(controller, e);
          throw e;
        }
      }
      ReadableByteStreamControllerClearAlgorithms(controller);
      ReadableStreamClose(stream);
    }
    function ReadableByteStreamControllerEnqueue(controller, chunk) {
      const stream = controller._controlledReadableByteStream;
      if (controller._closeRequested || stream._state !== "readable") {
        return;
      }
      const buffer = chunk.buffer;
      const byteOffset = chunk.byteOffset;
      const byteLength = chunk.byteLength;
      const transferredBuffer = TransferArrayBuffer(buffer);
      if (controller._pendingPullIntos.length > 0) {
        const firstPendingPullInto = controller._pendingPullIntos.peek();
        if (IsDetachedBuffer(firstPendingPullInto.buffer))
          ;
        firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
      }
      ReadableByteStreamControllerInvalidateBYOBRequest(controller);
      if (ReadableStreamHasDefaultReader(stream)) {
        if (ReadableStreamGetNumReadRequests(stream) === 0) {
          ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        } else {
          const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
          ReadableStreamFulfillReadRequest(stream, transferredView, false);
        }
      } else if (ReadableStreamHasBYOBReader(stream)) {
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
      } else {
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
      }
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerError(controller, e) {
      const stream = controller._controlledReadableByteStream;
      if (stream._state !== "readable") {
        return;
      }
      ReadableByteStreamControllerClearPendingPullIntos(controller);
      ResetQueue(controller);
      ReadableByteStreamControllerClearAlgorithms(controller);
      ReadableStreamError(stream, e);
    }
    function ReadableByteStreamControllerGetBYOBRequest(controller) {
      if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
        const firstDescriptor = controller._pendingPullIntos.peek();
        const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
        const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
        SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
        controller._byobRequest = byobRequest;
      }
      return controller._byobRequest;
    }
    function ReadableByteStreamControllerGetDesiredSize(controller) {
      const state = controller._controlledReadableByteStream._state;
      if (state === "errored") {
        return null;
      }
      if (state === "closed") {
        return 0;
      }
      return controller._strategyHWM - controller._queueTotalSize;
    }
    function ReadableByteStreamControllerRespond(controller, bytesWritten) {
      const firstDescriptor = controller._pendingPullIntos.peek();
      const state = controller._controlledReadableByteStream._state;
      if (state === "closed") {
        if (bytesWritten !== 0) {
          throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
        }
      } else {
        if (bytesWritten === 0) {
          throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
        }
        if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
          throw new RangeError("bytesWritten out of range");
        }
      }
      firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
      ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
    }
    function ReadableByteStreamControllerRespondWithNewView(controller, view) {
      const firstDescriptor = controller._pendingPullIntos.peek();
      const state = controller._controlledReadableByteStream._state;
      if (state === "closed") {
        if (view.byteLength !== 0) {
          throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
        }
      } else {
        if (view.byteLength === 0) {
          throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
        }
      }
      if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
        throw new RangeError("The region specified by view does not match byobRequest");
      }
      if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
        throw new RangeError("The buffer of view has different capacity than byobRequest");
      }
      if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
        throw new RangeError("The region specified by view is larger than byobRequest");
      }
      firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
      ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
    }
    function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
      controller._controlledReadableByteStream = stream;
      controller._pullAgain = false;
      controller._pulling = false;
      controller._byobRequest = null;
      controller._queue = controller._queueTotalSize = void 0;
      ResetQueue(controller);
      controller._closeRequested = false;
      controller._started = false;
      controller._strategyHWM = highWaterMark;
      controller._pullAlgorithm = pullAlgorithm;
      controller._cancelAlgorithm = cancelAlgorithm;
      controller._autoAllocateChunkSize = autoAllocateChunkSize;
      controller._pendingPullIntos = new SimpleQueue();
      stream._readableStreamController = controller;
      const startResult = startAlgorithm();
      uponPromise(promiseResolvedWith(startResult), () => {
        controller._started = true;
        ReadableByteStreamControllerCallPullIfNeeded(controller);
      }, (r) => {
        ReadableByteStreamControllerError(controller, r);
      });
    }
    function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
      const controller = Object.create(ReadableByteStreamController.prototype);
      let startAlgorithm = () => void 0;
      let pullAlgorithm = () => promiseResolvedWith(void 0);
      let cancelAlgorithm = () => promiseResolvedWith(void 0);
      if (underlyingByteSource.start !== void 0) {
        startAlgorithm = () => underlyingByteSource.start(controller);
      }
      if (underlyingByteSource.pull !== void 0) {
        pullAlgorithm = () => underlyingByteSource.pull(controller);
      }
      if (underlyingByteSource.cancel !== void 0) {
        cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
      }
      const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
      if (autoAllocateChunkSize === 0) {
        throw new TypeError("autoAllocateChunkSize must be greater than 0");
      }
      SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
    }
    function SetUpReadableStreamBYOBRequest(request, controller, view) {
      request._associatedReadableByteStreamController = controller;
      request._view = view;
    }
    function byobRequestBrandCheckException(name) {
      return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
    }
    function byteStreamControllerBrandCheckException(name) {
      return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
    }
    function AcquireReadableStreamBYOBReader(stream) {
      return new ReadableStreamBYOBReader(stream);
    }
    function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
      stream._reader._readIntoRequests.push(readIntoRequest);
    }
    function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
      const reader = stream._reader;
      const readIntoRequest = reader._readIntoRequests.shift();
      if (done) {
        readIntoRequest._closeSteps(chunk);
      } else {
        readIntoRequest._chunkSteps(chunk);
      }
    }
    function ReadableStreamGetNumReadIntoRequests(stream) {
      return stream._reader._readIntoRequests.length;
    }
    function ReadableStreamHasBYOBReader(stream) {
      const reader = stream._reader;
      if (reader === void 0) {
        return false;
      }
      if (!IsReadableStreamBYOBReader(reader)) {
        return false;
      }
      return true;
    }
    class ReadableStreamBYOBReader {
      constructor(stream) {
        assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
        assertReadableStream(stream, "First parameter");
        if (IsReadableStreamLocked(stream)) {
          throw new TypeError("This stream has already been locked for exclusive reading by another reader");
        }
        if (!IsReadableByteStreamController(stream._readableStreamController)) {
          throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
        }
        ReadableStreamReaderGenericInitialize(this, stream);
        this._readIntoRequests = new SimpleQueue();
      }
      get closed() {
        if (!IsReadableStreamBYOBReader(this)) {
          return promiseRejectedWith(byobReaderBrandCheckException("closed"));
        }
        return this._closedPromise;
      }
      cancel(reason = void 0) {
        if (!IsReadableStreamBYOBReader(this)) {
          return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
        }
        if (this._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("cancel"));
        }
        return ReadableStreamReaderGenericCancel(this, reason);
      }
      read(view) {
        if (!IsReadableStreamBYOBReader(this)) {
          return promiseRejectedWith(byobReaderBrandCheckException("read"));
        }
        if (!ArrayBuffer.isView(view)) {
          return promiseRejectedWith(new TypeError("view must be an array buffer view"));
        }
        if (view.byteLength === 0) {
          return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
        }
        if (view.buffer.byteLength === 0) {
          return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
        }
        if (IsDetachedBuffer(view.buffer))
          ;
        if (this._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("read from"));
        }
        let resolvePromise;
        let rejectPromise;
        const promise = newPromise((resolve2, reject) => {
          resolvePromise = resolve2;
          rejectPromise = reject;
        });
        const readIntoRequest = {
          _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
          _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
          _errorSteps: (e) => rejectPromise(e)
        };
        ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
        return promise;
      }
      releaseLock() {
        if (!IsReadableStreamBYOBReader(this)) {
          throw byobReaderBrandCheckException("releaseLock");
        }
        if (this._ownerReadableStream === void 0) {
          return;
        }
        if (this._readIntoRequests.length > 0) {
          throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
        }
        ReadableStreamReaderGenericRelease(this);
      }
    }
    Object.defineProperties(ReadableStreamBYOBReader.prototype, {
      cancel: { enumerable: true },
      read: { enumerable: true },
      releaseLock: { enumerable: true },
      closed: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamBYOBReader",
        configurable: true
      });
    }
    function IsReadableStreamBYOBReader(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) {
        return false;
      }
      return x instanceof ReadableStreamBYOBReader;
    }
    function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
      const stream = reader._ownerReadableStream;
      stream._disturbed = true;
      if (stream._state === "errored") {
        readIntoRequest._errorSteps(stream._storedError);
      } else {
        ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
      }
    }
    function byobReaderBrandCheckException(name) {
      return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
    }
    function ExtractHighWaterMark(strategy, defaultHWM) {
      const { highWaterMark } = strategy;
      if (highWaterMark === void 0) {
        return defaultHWM;
      }
      if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
        throw new RangeError("Invalid highWaterMark");
      }
      return highWaterMark;
    }
    function ExtractSizeAlgorithm(strategy) {
      const { size } = strategy;
      if (!size) {
        return () => 1;
      }
      return size;
    }
    function convertQueuingStrategy(init2, context) {
      assertDictionary(init2, context);
      const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
      const size = init2 === null || init2 === void 0 ? void 0 : init2.size;
      return {
        highWaterMark: highWaterMark === void 0 ? void 0 : convertUnrestrictedDouble(highWaterMark),
        size: size === void 0 ? void 0 : convertQueuingStrategySize(size, `${context} has member 'size' that`)
      };
    }
    function convertQueuingStrategySize(fn, context) {
      assertFunction(fn, context);
      return (chunk) => convertUnrestrictedDouble(fn(chunk));
    }
    function convertUnderlyingSink(original, context) {
      assertDictionary(original, context);
      const abort = original === null || original === void 0 ? void 0 : original.abort;
      const close = original === null || original === void 0 ? void 0 : original.close;
      const start = original === null || original === void 0 ? void 0 : original.start;
      const type = original === null || original === void 0 ? void 0 : original.type;
      const write = original === null || original === void 0 ? void 0 : original.write;
      return {
        abort: abort === void 0 ? void 0 : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
        close: close === void 0 ? void 0 : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
        start: start === void 0 ? void 0 : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
        write: write === void 0 ? void 0 : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
        type
      };
    }
    function convertUnderlyingSinkAbortCallback(fn, original, context) {
      assertFunction(fn, context);
      return (reason) => promiseCall(fn, original, [reason]);
    }
    function convertUnderlyingSinkCloseCallback(fn, original, context) {
      assertFunction(fn, context);
      return () => promiseCall(fn, original, []);
    }
    function convertUnderlyingSinkStartCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertUnderlyingSinkWriteCallback(fn, original, context) {
      assertFunction(fn, context);
      return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
    }
    function assertWritableStream(x, context) {
      if (!IsWritableStream(x)) {
        throw new TypeError(`${context} is not a WritableStream.`);
      }
    }
    function isAbortSignal2(value) {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      try {
        return typeof value.aborted === "boolean";
      } catch (_a) {
        return false;
      }
    }
    const supportsAbortController = typeof AbortController === "function";
    function createAbortController() {
      if (supportsAbortController) {
        return new AbortController();
      }
      return void 0;
    }
    class WritableStream {
      constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
        if (rawUnderlyingSink === void 0) {
          rawUnderlyingSink = null;
        } else {
          assertObject(rawUnderlyingSink, "First parameter");
        }
        const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
        const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
        InitializeWritableStream(this);
        const type = underlyingSink.type;
        if (type !== void 0) {
          throw new RangeError("Invalid type is specified");
        }
        const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
        const highWaterMark = ExtractHighWaterMark(strategy, 1);
        SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
      }
      get locked() {
        if (!IsWritableStream(this)) {
          throw streamBrandCheckException$2("locked");
        }
        return IsWritableStreamLocked(this);
      }
      abort(reason = void 0) {
        if (!IsWritableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$2("abort"));
        }
        if (IsWritableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
        }
        return WritableStreamAbort(this, reason);
      }
      close() {
        if (!IsWritableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$2("close"));
        }
        if (IsWritableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
        }
        if (WritableStreamCloseQueuedOrInFlight(this)) {
          return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
        }
        return WritableStreamClose(this);
      }
      getWriter() {
        if (!IsWritableStream(this)) {
          throw streamBrandCheckException$2("getWriter");
        }
        return AcquireWritableStreamDefaultWriter(this);
      }
    }
    Object.defineProperties(WritableStream.prototype, {
      abort: { enumerable: true },
      close: { enumerable: true },
      getWriter: { enumerable: true },
      locked: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStream",
        configurable: true
      });
    }
    function AcquireWritableStreamDefaultWriter(stream) {
      return new WritableStreamDefaultWriter(stream);
    }
    function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
      const stream = Object.create(WritableStream.prototype);
      InitializeWritableStream(stream);
      const controller = Object.create(WritableStreamDefaultController.prototype);
      SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
      return stream;
    }
    function InitializeWritableStream(stream) {
      stream._state = "writable";
      stream._storedError = void 0;
      stream._writer = void 0;
      stream._writableStreamController = void 0;
      stream._writeRequests = new SimpleQueue();
      stream._inFlightWriteRequest = void 0;
      stream._closeRequest = void 0;
      stream._inFlightCloseRequest = void 0;
      stream._pendingAbortRequest = void 0;
      stream._backpressure = false;
    }
    function IsWritableStream(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) {
        return false;
      }
      return x instanceof WritableStream;
    }
    function IsWritableStreamLocked(stream) {
      if (stream._writer === void 0) {
        return false;
      }
      return true;
    }
    function WritableStreamAbort(stream, reason) {
      var _a;
      if (stream._state === "closed" || stream._state === "errored") {
        return promiseResolvedWith(void 0);
      }
      stream._writableStreamController._abortReason = reason;
      (_a = stream._writableStreamController._abortController) === null || _a === void 0 ? void 0 : _a.abort();
      const state = stream._state;
      if (state === "closed" || state === "errored") {
        return promiseResolvedWith(void 0);
      }
      if (stream._pendingAbortRequest !== void 0) {
        return stream._pendingAbortRequest._promise;
      }
      let wasAlreadyErroring = false;
      if (state === "erroring") {
        wasAlreadyErroring = true;
        reason = void 0;
      }
      const promise = newPromise((resolve2, reject) => {
        stream._pendingAbortRequest = {
          _promise: void 0,
          _resolve: resolve2,
          _reject: reject,
          _reason: reason,
          _wasAlreadyErroring: wasAlreadyErroring
        };
      });
      stream._pendingAbortRequest._promise = promise;
      if (!wasAlreadyErroring) {
        WritableStreamStartErroring(stream, reason);
      }
      return promise;
    }
    function WritableStreamClose(stream) {
      const state = stream._state;
      if (state === "closed" || state === "errored") {
        return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
      }
      const promise = newPromise((resolve2, reject) => {
        const closeRequest = {
          _resolve: resolve2,
          _reject: reject
        };
        stream._closeRequest = closeRequest;
      });
      const writer = stream._writer;
      if (writer !== void 0 && stream._backpressure && state === "writable") {
        defaultWriterReadyPromiseResolve(writer);
      }
      WritableStreamDefaultControllerClose(stream._writableStreamController);
      return promise;
    }
    function WritableStreamAddWriteRequest(stream) {
      const promise = newPromise((resolve2, reject) => {
        const writeRequest = {
          _resolve: resolve2,
          _reject: reject
        };
        stream._writeRequests.push(writeRequest);
      });
      return promise;
    }
    function WritableStreamDealWithRejection(stream, error2) {
      const state = stream._state;
      if (state === "writable") {
        WritableStreamStartErroring(stream, error2);
        return;
      }
      WritableStreamFinishErroring(stream);
    }
    function WritableStreamStartErroring(stream, reason) {
      const controller = stream._writableStreamController;
      stream._state = "erroring";
      stream._storedError = reason;
      const writer = stream._writer;
      if (writer !== void 0) {
        WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
      }
      if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
        WritableStreamFinishErroring(stream);
      }
    }
    function WritableStreamFinishErroring(stream) {
      stream._state = "errored";
      stream._writableStreamController[ErrorSteps]();
      const storedError = stream._storedError;
      stream._writeRequests.forEach((writeRequest) => {
        writeRequest._reject(storedError);
      });
      stream._writeRequests = new SimpleQueue();
      if (stream._pendingAbortRequest === void 0) {
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return;
      }
      const abortRequest = stream._pendingAbortRequest;
      stream._pendingAbortRequest = void 0;
      if (abortRequest._wasAlreadyErroring) {
        abortRequest._reject(storedError);
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return;
      }
      const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
      uponPromise(promise, () => {
        abortRequest._resolve();
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
      }, (reason) => {
        abortRequest._reject(reason);
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
      });
    }
    function WritableStreamFinishInFlightWrite(stream) {
      stream._inFlightWriteRequest._resolve(void 0);
      stream._inFlightWriteRequest = void 0;
    }
    function WritableStreamFinishInFlightWriteWithError(stream, error2) {
      stream._inFlightWriteRequest._reject(error2);
      stream._inFlightWriteRequest = void 0;
      WritableStreamDealWithRejection(stream, error2);
    }
    function WritableStreamFinishInFlightClose(stream) {
      stream._inFlightCloseRequest._resolve(void 0);
      stream._inFlightCloseRequest = void 0;
      const state = stream._state;
      if (state === "erroring") {
        stream._storedError = void 0;
        if (stream._pendingAbortRequest !== void 0) {
          stream._pendingAbortRequest._resolve();
          stream._pendingAbortRequest = void 0;
        }
      }
      stream._state = "closed";
      const writer = stream._writer;
      if (writer !== void 0) {
        defaultWriterClosedPromiseResolve(writer);
      }
    }
    function WritableStreamFinishInFlightCloseWithError(stream, error2) {
      stream._inFlightCloseRequest._reject(error2);
      stream._inFlightCloseRequest = void 0;
      if (stream._pendingAbortRequest !== void 0) {
        stream._pendingAbortRequest._reject(error2);
        stream._pendingAbortRequest = void 0;
      }
      WritableStreamDealWithRejection(stream, error2);
    }
    function WritableStreamCloseQueuedOrInFlight(stream) {
      if (stream._closeRequest === void 0 && stream._inFlightCloseRequest === void 0) {
        return false;
      }
      return true;
    }
    function WritableStreamHasOperationMarkedInFlight(stream) {
      if (stream._inFlightWriteRequest === void 0 && stream._inFlightCloseRequest === void 0) {
        return false;
      }
      return true;
    }
    function WritableStreamMarkCloseRequestInFlight(stream) {
      stream._inFlightCloseRequest = stream._closeRequest;
      stream._closeRequest = void 0;
    }
    function WritableStreamMarkFirstWriteRequestInFlight(stream) {
      stream._inFlightWriteRequest = stream._writeRequests.shift();
    }
    function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
      if (stream._closeRequest !== void 0) {
        stream._closeRequest._reject(stream._storedError);
        stream._closeRequest = void 0;
      }
      const writer = stream._writer;
      if (writer !== void 0) {
        defaultWriterClosedPromiseReject(writer, stream._storedError);
      }
    }
    function WritableStreamUpdateBackpressure(stream, backpressure) {
      const writer = stream._writer;
      if (writer !== void 0 && backpressure !== stream._backpressure) {
        if (backpressure) {
          defaultWriterReadyPromiseReset(writer);
        } else {
          defaultWriterReadyPromiseResolve(writer);
        }
      }
      stream._backpressure = backpressure;
    }
    class WritableStreamDefaultWriter {
      constructor(stream) {
        assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
        assertWritableStream(stream, "First parameter");
        if (IsWritableStreamLocked(stream)) {
          throw new TypeError("This stream has already been locked for exclusive writing by another writer");
        }
        this._ownerWritableStream = stream;
        stream._writer = this;
        const state = stream._state;
        if (state === "writable") {
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
            defaultWriterReadyPromiseInitialize(this);
          } else {
            defaultWriterReadyPromiseInitializeAsResolved(this);
          }
          defaultWriterClosedPromiseInitialize(this);
        } else if (state === "erroring") {
          defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
          defaultWriterClosedPromiseInitialize(this);
        } else if (state === "closed") {
          defaultWriterReadyPromiseInitializeAsResolved(this);
          defaultWriterClosedPromiseInitializeAsResolved(this);
        } else {
          const storedError = stream._storedError;
          defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
          defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
        }
      }
      get closed() {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
        }
        return this._closedPromise;
      }
      get desiredSize() {
        if (!IsWritableStreamDefaultWriter(this)) {
          throw defaultWriterBrandCheckException("desiredSize");
        }
        if (this._ownerWritableStream === void 0) {
          throw defaultWriterLockException("desiredSize");
        }
        return WritableStreamDefaultWriterGetDesiredSize(this);
      }
      get ready() {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
        }
        return this._readyPromise;
      }
      abort(reason = void 0) {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
        }
        if (this._ownerWritableStream === void 0) {
          return promiseRejectedWith(defaultWriterLockException("abort"));
        }
        return WritableStreamDefaultWriterAbort(this, reason);
      }
      close() {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("close"));
        }
        const stream = this._ownerWritableStream;
        if (stream === void 0) {
          return promiseRejectedWith(defaultWriterLockException("close"));
        }
        if (WritableStreamCloseQueuedOrInFlight(stream)) {
          return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
        }
        return WritableStreamDefaultWriterClose(this);
      }
      releaseLock() {
        if (!IsWritableStreamDefaultWriter(this)) {
          throw defaultWriterBrandCheckException("releaseLock");
        }
        const stream = this._ownerWritableStream;
        if (stream === void 0) {
          return;
        }
        WritableStreamDefaultWriterRelease(this);
      }
      write(chunk = void 0) {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("write"));
        }
        if (this._ownerWritableStream === void 0) {
          return promiseRejectedWith(defaultWriterLockException("write to"));
        }
        return WritableStreamDefaultWriterWrite(this, chunk);
      }
    }
    Object.defineProperties(WritableStreamDefaultWriter.prototype, {
      abort: { enumerable: true },
      close: { enumerable: true },
      releaseLock: { enumerable: true },
      write: { enumerable: true },
      closed: { enumerable: true },
      desiredSize: { enumerable: true },
      ready: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStreamDefaultWriter",
        configurable: true
      });
    }
    function IsWritableStreamDefaultWriter(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) {
        return false;
      }
      return x instanceof WritableStreamDefaultWriter;
    }
    function WritableStreamDefaultWriterAbort(writer, reason) {
      const stream = writer._ownerWritableStream;
      return WritableStreamAbort(stream, reason);
    }
    function WritableStreamDefaultWriterClose(writer) {
      const stream = writer._ownerWritableStream;
      return WritableStreamClose(stream);
    }
    function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
      const stream = writer._ownerWritableStream;
      const state = stream._state;
      if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
        return promiseResolvedWith(void 0);
      }
      if (state === "errored") {
        return promiseRejectedWith(stream._storedError);
      }
      return WritableStreamDefaultWriterClose(writer);
    }
    function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error2) {
      if (writer._closedPromiseState === "pending") {
        defaultWriterClosedPromiseReject(writer, error2);
      } else {
        defaultWriterClosedPromiseResetToRejected(writer, error2);
      }
    }
    function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error2) {
      if (writer._readyPromiseState === "pending") {
        defaultWriterReadyPromiseReject(writer, error2);
      } else {
        defaultWriterReadyPromiseResetToRejected(writer, error2);
      }
    }
    function WritableStreamDefaultWriterGetDesiredSize(writer) {
      const stream = writer._ownerWritableStream;
      const state = stream._state;
      if (state === "errored" || state === "erroring") {
        return null;
      }
      if (state === "closed") {
        return 0;
      }
      return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
    }
    function WritableStreamDefaultWriterRelease(writer) {
      const stream = writer._ownerWritableStream;
      const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
      WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
      WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
      stream._writer = void 0;
      writer._ownerWritableStream = void 0;
    }
    function WritableStreamDefaultWriterWrite(writer, chunk) {
      const stream = writer._ownerWritableStream;
      const controller = stream._writableStreamController;
      const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
      if (stream !== writer._ownerWritableStream) {
        return promiseRejectedWith(defaultWriterLockException("write to"));
      }
      const state = stream._state;
      if (state === "errored") {
        return promiseRejectedWith(stream._storedError);
      }
      if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
        return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
      }
      if (state === "erroring") {
        return promiseRejectedWith(stream._storedError);
      }
      const promise = WritableStreamAddWriteRequest(stream);
      WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
      return promise;
    }
    const closeSentinel = {};
    class WritableStreamDefaultController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get abortReason() {
        if (!IsWritableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$2("abortReason");
        }
        return this._abortReason;
      }
      get signal() {
        if (!IsWritableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$2("signal");
        }
        if (this._abortController === void 0) {
          throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
        }
        return this._abortController.signal;
      }
      error(e = void 0) {
        if (!IsWritableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$2("error");
        }
        const state = this._controlledWritableStream._state;
        if (state !== "writable") {
          return;
        }
        WritableStreamDefaultControllerError(this, e);
      }
      [AbortSteps](reason) {
        const result = this._abortAlgorithm(reason);
        WritableStreamDefaultControllerClearAlgorithms(this);
        return result;
      }
      [ErrorSteps]() {
        ResetQueue(this);
      }
    }
    Object.defineProperties(WritableStreamDefaultController.prototype, {
      error: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStreamDefaultController",
        configurable: true
      });
    }
    function IsWritableStreamDefaultController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) {
        return false;
      }
      return x instanceof WritableStreamDefaultController;
    }
    function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
      controller._controlledWritableStream = stream;
      stream._writableStreamController = controller;
      controller._queue = void 0;
      controller._queueTotalSize = void 0;
      ResetQueue(controller);
      controller._abortReason = void 0;
      controller._abortController = createAbortController();
      controller._started = false;
      controller._strategySizeAlgorithm = sizeAlgorithm;
      controller._strategyHWM = highWaterMark;
      controller._writeAlgorithm = writeAlgorithm;
      controller._closeAlgorithm = closeAlgorithm;
      controller._abortAlgorithm = abortAlgorithm;
      const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
      WritableStreamUpdateBackpressure(stream, backpressure);
      const startResult = startAlgorithm();
      const startPromise = promiseResolvedWith(startResult);
      uponPromise(startPromise, () => {
        controller._started = true;
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
      }, (r) => {
        controller._started = true;
        WritableStreamDealWithRejection(stream, r);
      });
    }
    function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
      const controller = Object.create(WritableStreamDefaultController.prototype);
      let startAlgorithm = () => void 0;
      let writeAlgorithm = () => promiseResolvedWith(void 0);
      let closeAlgorithm = () => promiseResolvedWith(void 0);
      let abortAlgorithm = () => promiseResolvedWith(void 0);
      if (underlyingSink.start !== void 0) {
        startAlgorithm = () => underlyingSink.start(controller);
      }
      if (underlyingSink.write !== void 0) {
        writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
      }
      if (underlyingSink.close !== void 0) {
        closeAlgorithm = () => underlyingSink.close();
      }
      if (underlyingSink.abort !== void 0) {
        abortAlgorithm = (reason) => underlyingSink.abort(reason);
      }
      SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
    }
    function WritableStreamDefaultControllerClearAlgorithms(controller) {
      controller._writeAlgorithm = void 0;
      controller._closeAlgorithm = void 0;
      controller._abortAlgorithm = void 0;
      controller._strategySizeAlgorithm = void 0;
    }
    function WritableStreamDefaultControllerClose(controller) {
      EnqueueValueWithSize(controller, closeSentinel, 0);
      WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
      try {
        return controller._strategySizeAlgorithm(chunk);
      } catch (chunkSizeE) {
        WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
        return 1;
      }
    }
    function WritableStreamDefaultControllerGetDesiredSize(controller) {
      return controller._strategyHWM - controller._queueTotalSize;
    }
    function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
      try {
        EnqueueValueWithSize(controller, chunk, chunkSize);
      } catch (enqueueE) {
        WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
        return;
      }
      const stream = controller._controlledWritableStream;
      if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
        const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
        WritableStreamUpdateBackpressure(stream, backpressure);
      }
      WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
      const stream = controller._controlledWritableStream;
      if (!controller._started) {
        return;
      }
      if (stream._inFlightWriteRequest !== void 0) {
        return;
      }
      const state = stream._state;
      if (state === "erroring") {
        WritableStreamFinishErroring(stream);
        return;
      }
      if (controller._queue.length === 0) {
        return;
      }
      const value = PeekQueueValue(controller);
      if (value === closeSentinel) {
        WritableStreamDefaultControllerProcessClose(controller);
      } else {
        WritableStreamDefaultControllerProcessWrite(controller, value);
      }
    }
    function WritableStreamDefaultControllerErrorIfNeeded(controller, error2) {
      if (controller._controlledWritableStream._state === "writable") {
        WritableStreamDefaultControllerError(controller, error2);
      }
    }
    function WritableStreamDefaultControllerProcessClose(controller) {
      const stream = controller._controlledWritableStream;
      WritableStreamMarkCloseRequestInFlight(stream);
      DequeueValue(controller);
      const sinkClosePromise = controller._closeAlgorithm();
      WritableStreamDefaultControllerClearAlgorithms(controller);
      uponPromise(sinkClosePromise, () => {
        WritableStreamFinishInFlightClose(stream);
      }, (reason) => {
        WritableStreamFinishInFlightCloseWithError(stream, reason);
      });
    }
    function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
      const stream = controller._controlledWritableStream;
      WritableStreamMarkFirstWriteRequestInFlight(stream);
      const sinkWritePromise = controller._writeAlgorithm(chunk);
      uponPromise(sinkWritePromise, () => {
        WritableStreamFinishInFlightWrite(stream);
        const state = stream._state;
        DequeueValue(controller);
        if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
        }
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
      }, (reason) => {
        if (stream._state === "writable") {
          WritableStreamDefaultControllerClearAlgorithms(controller);
        }
        WritableStreamFinishInFlightWriteWithError(stream, reason);
      });
    }
    function WritableStreamDefaultControllerGetBackpressure(controller) {
      const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
      return desiredSize <= 0;
    }
    function WritableStreamDefaultControllerError(controller, error2) {
      const stream = controller._controlledWritableStream;
      WritableStreamDefaultControllerClearAlgorithms(controller);
      WritableStreamStartErroring(stream, error2);
    }
    function streamBrandCheckException$2(name) {
      return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
    }
    function defaultControllerBrandCheckException$2(name) {
      return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
    }
    function defaultWriterBrandCheckException(name) {
      return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
    }
    function defaultWriterLockException(name) {
      return new TypeError("Cannot " + name + " a stream using a released writer");
    }
    function defaultWriterClosedPromiseInitialize(writer) {
      writer._closedPromise = newPromise((resolve2, reject) => {
        writer._closedPromise_resolve = resolve2;
        writer._closedPromise_reject = reject;
        writer._closedPromiseState = "pending";
      });
    }
    function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
      defaultWriterClosedPromiseInitialize(writer);
      defaultWriterClosedPromiseReject(writer, reason);
    }
    function defaultWriterClosedPromiseInitializeAsResolved(writer) {
      defaultWriterClosedPromiseInitialize(writer);
      defaultWriterClosedPromiseResolve(writer);
    }
    function defaultWriterClosedPromiseReject(writer, reason) {
      if (writer._closedPromise_reject === void 0) {
        return;
      }
      setPromiseIsHandledToTrue(writer._closedPromise);
      writer._closedPromise_reject(reason);
      writer._closedPromise_resolve = void 0;
      writer._closedPromise_reject = void 0;
      writer._closedPromiseState = "rejected";
    }
    function defaultWriterClosedPromiseResetToRejected(writer, reason) {
      defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterClosedPromiseResolve(writer) {
      if (writer._closedPromise_resolve === void 0) {
        return;
      }
      writer._closedPromise_resolve(void 0);
      writer._closedPromise_resolve = void 0;
      writer._closedPromise_reject = void 0;
      writer._closedPromiseState = "resolved";
    }
    function defaultWriterReadyPromiseInitialize(writer) {
      writer._readyPromise = newPromise((resolve2, reject) => {
        writer._readyPromise_resolve = resolve2;
        writer._readyPromise_reject = reject;
      });
      writer._readyPromiseState = "pending";
    }
    function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
      defaultWriterReadyPromiseInitialize(writer);
      defaultWriterReadyPromiseReject(writer, reason);
    }
    function defaultWriterReadyPromiseInitializeAsResolved(writer) {
      defaultWriterReadyPromiseInitialize(writer);
      defaultWriterReadyPromiseResolve(writer);
    }
    function defaultWriterReadyPromiseReject(writer, reason) {
      if (writer._readyPromise_reject === void 0) {
        return;
      }
      setPromiseIsHandledToTrue(writer._readyPromise);
      writer._readyPromise_reject(reason);
      writer._readyPromise_resolve = void 0;
      writer._readyPromise_reject = void 0;
      writer._readyPromiseState = "rejected";
    }
    function defaultWriterReadyPromiseReset(writer) {
      defaultWriterReadyPromiseInitialize(writer);
    }
    function defaultWriterReadyPromiseResetToRejected(writer, reason) {
      defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterReadyPromiseResolve(writer) {
      if (writer._readyPromise_resolve === void 0) {
        return;
      }
      writer._readyPromise_resolve(void 0);
      writer._readyPromise_resolve = void 0;
      writer._readyPromise_reject = void 0;
      writer._readyPromiseState = "fulfilled";
    }
    const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : void 0;
    function isDOMExceptionConstructor(ctor) {
      if (!(typeof ctor === "function" || typeof ctor === "object")) {
        return false;
      }
      try {
        new ctor();
        return true;
      } catch (_a) {
        return false;
      }
    }
    function createDOMExceptionPolyfill() {
      const ctor = function DOMException2(message, name) {
        this.message = message || "";
        this.name = name || "Error";
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
      };
      ctor.prototype = Object.create(Error.prototype);
      Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
      return ctor;
    }
    const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
    function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
      const reader = AcquireReadableStreamDefaultReader(source);
      const writer = AcquireWritableStreamDefaultWriter(dest);
      source._disturbed = true;
      let shuttingDown = false;
      let currentWrite = promiseResolvedWith(void 0);
      return newPromise((resolve2, reject) => {
        let abortAlgorithm;
        if (signal !== void 0) {
          abortAlgorithm = () => {
            const error2 = new DOMException$1("Aborted", "AbortError");
            const actions = [];
            if (!preventAbort) {
              actions.push(() => {
                if (dest._state === "writable") {
                  return WritableStreamAbort(dest, error2);
                }
                return promiseResolvedWith(void 0);
              });
            }
            if (!preventCancel) {
              actions.push(() => {
                if (source._state === "readable") {
                  return ReadableStreamCancel(source, error2);
                }
                return promiseResolvedWith(void 0);
              });
            }
            shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error2);
          };
          if (signal.aborted) {
            abortAlgorithm();
            return;
          }
          signal.addEventListener("abort", abortAlgorithm);
        }
        function pipeLoop() {
          return newPromise((resolveLoop, rejectLoop) => {
            function next(done) {
              if (done) {
                resolveLoop();
              } else {
                PerformPromiseThen(pipeStep(), next, rejectLoop);
              }
            }
            next(false);
          });
        }
        function pipeStep() {
          if (shuttingDown) {
            return promiseResolvedWith(true);
          }
          return PerformPromiseThen(writer._readyPromise, () => {
            return newPromise((resolveRead, rejectRead) => {
              ReadableStreamDefaultReaderRead(reader, {
                _chunkSteps: (chunk) => {
                  currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), void 0, noop2);
                  resolveRead(false);
                },
                _closeSteps: () => resolveRead(true),
                _errorSteps: rejectRead
              });
            });
          });
        }
        isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
          if (!preventAbort) {
            shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
          } else {
            shutdown(true, storedError);
          }
        });
        isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
          if (!preventCancel) {
            shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
          } else {
            shutdown(true, storedError);
          }
        });
        isOrBecomesClosed(source, reader._closedPromise, () => {
          if (!preventClose) {
            shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
          } else {
            shutdown();
          }
        });
        if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
          const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
          if (!preventCancel) {
            shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
          } else {
            shutdown(true, destClosed);
          }
        }
        setPromiseIsHandledToTrue(pipeLoop());
        function waitForWritesToFinish() {
          const oldCurrentWrite = currentWrite;
          return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : void 0);
        }
        function isOrBecomesErrored(stream, promise, action) {
          if (stream._state === "errored") {
            action(stream._storedError);
          } else {
            uponRejection(promise, action);
          }
        }
        function isOrBecomesClosed(stream, promise, action) {
          if (stream._state === "closed") {
            action();
          } else {
            uponFulfillment(promise, action);
          }
        }
        function shutdownWithAction(action, originalIsError, originalError) {
          if (shuttingDown) {
            return;
          }
          shuttingDown = true;
          if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
            uponFulfillment(waitForWritesToFinish(), doTheRest);
          } else {
            doTheRest();
          }
          function doTheRest() {
            uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
          }
        }
        function shutdown(isError, error2) {
          if (shuttingDown) {
            return;
          }
          shuttingDown = true;
          if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
            uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error2));
          } else {
            finalize(isError, error2);
          }
        }
        function finalize(isError, error2) {
          WritableStreamDefaultWriterRelease(writer);
          ReadableStreamReaderGenericRelease(reader);
          if (signal !== void 0) {
            signal.removeEventListener("abort", abortAlgorithm);
          }
          if (isError) {
            reject(error2);
          } else {
            resolve2(void 0);
          }
        }
      });
    }
    class ReadableStreamDefaultController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get desiredSize() {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("desiredSize");
        }
        return ReadableStreamDefaultControllerGetDesiredSize(this);
      }
      close() {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("close");
        }
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
          throw new TypeError("The stream is not in a state that permits close");
        }
        ReadableStreamDefaultControllerClose(this);
      }
      enqueue(chunk = void 0) {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("enqueue");
        }
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
          throw new TypeError("The stream is not in a state that permits enqueue");
        }
        return ReadableStreamDefaultControllerEnqueue(this, chunk);
      }
      error(e = void 0) {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("error");
        }
        ReadableStreamDefaultControllerError(this, e);
      }
      [CancelSteps](reason) {
        ResetQueue(this);
        const result = this._cancelAlgorithm(reason);
        ReadableStreamDefaultControllerClearAlgorithms(this);
        return result;
      }
      [PullSteps](readRequest) {
        const stream = this._controlledReadableStream;
        if (this._queue.length > 0) {
          const chunk = DequeueValue(this);
          if (this._closeRequested && this._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(this);
            ReadableStreamClose(stream);
          } else {
            ReadableStreamDefaultControllerCallPullIfNeeded(this);
          }
          readRequest._chunkSteps(chunk);
        } else {
          ReadableStreamAddReadRequest(stream, readRequest);
          ReadableStreamDefaultControllerCallPullIfNeeded(this);
        }
      }
    }
    Object.defineProperties(ReadableStreamDefaultController.prototype, {
      close: { enumerable: true },
      enqueue: { enumerable: true },
      error: { enumerable: true },
      desiredSize: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamDefaultController",
        configurable: true
      });
    }
    function IsReadableStreamDefaultController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) {
        return false;
      }
      return x instanceof ReadableStreamDefaultController;
    }
    function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
      const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
      if (!shouldPull) {
        return;
      }
      if (controller._pulling) {
        controller._pullAgain = true;
        return;
      }
      controller._pulling = true;
      const pullPromise = controller._pullAlgorithm();
      uponPromise(pullPromise, () => {
        controller._pulling = false;
        if (controller._pullAgain) {
          controller._pullAgain = false;
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
      }, (e) => {
        ReadableStreamDefaultControllerError(controller, e);
      });
    }
    function ReadableStreamDefaultControllerShouldCallPull(controller) {
      const stream = controller._controlledReadableStream;
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
        return false;
      }
      if (!controller._started) {
        return false;
      }
      if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
        return true;
      }
      const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
      if (desiredSize > 0) {
        return true;
      }
      return false;
    }
    function ReadableStreamDefaultControllerClearAlgorithms(controller) {
      controller._pullAlgorithm = void 0;
      controller._cancelAlgorithm = void 0;
      controller._strategySizeAlgorithm = void 0;
    }
    function ReadableStreamDefaultControllerClose(controller) {
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
        return;
      }
      const stream = controller._controlledReadableStream;
      controller._closeRequested = true;
      if (controller._queue.length === 0) {
        ReadableStreamDefaultControllerClearAlgorithms(controller);
        ReadableStreamClose(stream);
      }
    }
    function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
        return;
      }
      const stream = controller._controlledReadableStream;
      if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
        ReadableStreamFulfillReadRequest(stream, chunk, false);
      } else {
        let chunkSize;
        try {
          chunkSize = controller._strategySizeAlgorithm(chunk);
        } catch (chunkSizeE) {
          ReadableStreamDefaultControllerError(controller, chunkSizeE);
          throw chunkSizeE;
        }
        try {
          EnqueueValueWithSize(controller, chunk, chunkSize);
        } catch (enqueueE) {
          ReadableStreamDefaultControllerError(controller, enqueueE);
          throw enqueueE;
        }
      }
      ReadableStreamDefaultControllerCallPullIfNeeded(controller);
    }
    function ReadableStreamDefaultControllerError(controller, e) {
      const stream = controller._controlledReadableStream;
      if (stream._state !== "readable") {
        return;
      }
      ResetQueue(controller);
      ReadableStreamDefaultControllerClearAlgorithms(controller);
      ReadableStreamError(stream, e);
    }
    function ReadableStreamDefaultControllerGetDesiredSize(controller) {
      const state = controller._controlledReadableStream._state;
      if (state === "errored") {
        return null;
      }
      if (state === "closed") {
        return 0;
      }
      return controller._strategyHWM - controller._queueTotalSize;
    }
    function ReadableStreamDefaultControllerHasBackpressure(controller) {
      if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
        return false;
      }
      return true;
    }
    function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
      const state = controller._controlledReadableStream._state;
      if (!controller._closeRequested && state === "readable") {
        return true;
      }
      return false;
    }
    function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
      controller._controlledReadableStream = stream;
      controller._queue = void 0;
      controller._queueTotalSize = void 0;
      ResetQueue(controller);
      controller._started = false;
      controller._closeRequested = false;
      controller._pullAgain = false;
      controller._pulling = false;
      controller._strategySizeAlgorithm = sizeAlgorithm;
      controller._strategyHWM = highWaterMark;
      controller._pullAlgorithm = pullAlgorithm;
      controller._cancelAlgorithm = cancelAlgorithm;
      stream._readableStreamController = controller;
      const startResult = startAlgorithm();
      uponPromise(promiseResolvedWith(startResult), () => {
        controller._started = true;
        ReadableStreamDefaultControllerCallPullIfNeeded(controller);
      }, (r) => {
        ReadableStreamDefaultControllerError(controller, r);
      });
    }
    function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
      const controller = Object.create(ReadableStreamDefaultController.prototype);
      let startAlgorithm = () => void 0;
      let pullAlgorithm = () => promiseResolvedWith(void 0);
      let cancelAlgorithm = () => promiseResolvedWith(void 0);
      if (underlyingSource.start !== void 0) {
        startAlgorithm = () => underlyingSource.start(controller);
      }
      if (underlyingSource.pull !== void 0) {
        pullAlgorithm = () => underlyingSource.pull(controller);
      }
      if (underlyingSource.cancel !== void 0) {
        cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
      }
      SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
    }
    function defaultControllerBrandCheckException$1(name) {
      return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
    }
    function ReadableStreamTee(stream, cloneForBranch2) {
      if (IsReadableByteStreamController(stream._readableStreamController)) {
        return ReadableByteStreamTee(stream);
      }
      return ReadableStreamDefaultTee(stream);
    }
    function ReadableStreamDefaultTee(stream, cloneForBranch2) {
      const reader = AcquireReadableStreamDefaultReader(stream);
      let reading = false;
      let canceled1 = false;
      let canceled2 = false;
      let reason1;
      let reason2;
      let branch1;
      let branch2;
      let resolveCancelPromise;
      const cancelPromise = newPromise((resolve2) => {
        resolveCancelPromise = resolve2;
      });
      function pullAlgorithm() {
        if (reading) {
          return promiseResolvedWith(void 0);
        }
        reading = true;
        const readRequest = {
          _chunkSteps: (chunk) => {
            queueMicrotask(() => {
              reading = false;
              const chunk1 = chunk;
              const chunk2 = chunk;
              if (!canceled1) {
                ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
              }
              if (!canceled2) {
                ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
              }
            });
          },
          _closeSteps: () => {
            reading = false;
            if (!canceled1) {
              ReadableStreamDefaultControllerClose(branch1._readableStreamController);
            }
            if (!canceled2) {
              ReadableStreamDefaultControllerClose(branch2._readableStreamController);
            }
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          },
          _errorSteps: () => {
            reading = false;
          }
        };
        ReadableStreamDefaultReaderRead(reader, readRequest);
        return promiseResolvedWith(void 0);
      }
      function cancel1Algorithm(reason) {
        canceled1 = true;
        reason1 = reason;
        if (canceled2) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function cancel2Algorithm(reason) {
        canceled2 = true;
        reason2 = reason;
        if (canceled1) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function startAlgorithm() {
      }
      branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
      branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
      uponRejection(reader._closedPromise, (r) => {
        ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
        ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
        if (!canceled1 || !canceled2) {
          resolveCancelPromise(void 0);
        }
      });
      return [branch1, branch2];
    }
    function ReadableByteStreamTee(stream) {
      let reader = AcquireReadableStreamDefaultReader(stream);
      let reading = false;
      let canceled1 = false;
      let canceled2 = false;
      let reason1;
      let reason2;
      let branch1;
      let branch2;
      let resolveCancelPromise;
      const cancelPromise = newPromise((resolve2) => {
        resolveCancelPromise = resolve2;
      });
      function forwardReaderError(thisReader) {
        uponRejection(thisReader._closedPromise, (r) => {
          if (thisReader !== reader) {
            return;
          }
          ReadableByteStreamControllerError(branch1._readableStreamController, r);
          ReadableByteStreamControllerError(branch2._readableStreamController, r);
          if (!canceled1 || !canceled2) {
            resolveCancelPromise(void 0);
          }
        });
      }
      function pullWithDefaultReader() {
        if (IsReadableStreamBYOBReader(reader)) {
          ReadableStreamReaderGenericRelease(reader);
          reader = AcquireReadableStreamDefaultReader(stream);
          forwardReaderError(reader);
        }
        const readRequest = {
          _chunkSteps: (chunk) => {
            queueMicrotask(() => {
              reading = false;
              const chunk1 = chunk;
              let chunk2 = chunk;
              if (!canceled1 && !canceled2) {
                try {
                  chunk2 = CloneAsUint8Array(chunk);
                } catch (cloneE) {
                  ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                  ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                  resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                  return;
                }
              }
              if (!canceled1) {
                ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
              }
              if (!canceled2) {
                ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
              }
            });
          },
          _closeSteps: () => {
            reading = false;
            if (!canceled1) {
              ReadableByteStreamControllerClose(branch1._readableStreamController);
            }
            if (!canceled2) {
              ReadableByteStreamControllerClose(branch2._readableStreamController);
            }
            if (branch1._readableStreamController._pendingPullIntos.length > 0) {
              ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
            }
            if (branch2._readableStreamController._pendingPullIntos.length > 0) {
              ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
            }
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          },
          _errorSteps: () => {
            reading = false;
          }
        };
        ReadableStreamDefaultReaderRead(reader, readRequest);
      }
      function pullWithBYOBReader(view, forBranch2) {
        if (IsReadableStreamDefaultReader(reader)) {
          ReadableStreamReaderGenericRelease(reader);
          reader = AcquireReadableStreamBYOBReader(stream);
          forwardReaderError(reader);
        }
        const byobBranch = forBranch2 ? branch2 : branch1;
        const otherBranch = forBranch2 ? branch1 : branch2;
        const readIntoRequest = {
          _chunkSteps: (chunk) => {
            queueMicrotask(() => {
              reading = false;
              const byobCanceled = forBranch2 ? canceled2 : canceled1;
              const otherCanceled = forBranch2 ? canceled1 : canceled2;
              if (!otherCanceled) {
                let clonedChunk;
                try {
                  clonedChunk = CloneAsUint8Array(chunk);
                } catch (cloneE) {
                  ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                  ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                  resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                  return;
                }
                if (!byobCanceled) {
                  ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                }
                ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
              } else if (!byobCanceled) {
                ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
              }
            });
          },
          _closeSteps: (chunk) => {
            reading = false;
            const byobCanceled = forBranch2 ? canceled2 : canceled1;
            const otherCanceled = forBranch2 ? canceled1 : canceled2;
            if (!byobCanceled) {
              ReadableByteStreamControllerClose(byobBranch._readableStreamController);
            }
            if (!otherCanceled) {
              ReadableByteStreamControllerClose(otherBranch._readableStreamController);
            }
            if (chunk !== void 0) {
              if (!byobCanceled) {
                ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
              }
              if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
              }
            }
            if (!byobCanceled || !otherCanceled) {
              resolveCancelPromise(void 0);
            }
          },
          _errorSteps: () => {
            reading = false;
          }
        };
        ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
      }
      function pull1Algorithm() {
        if (reading) {
          return promiseResolvedWith(void 0);
        }
        reading = true;
        const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
        if (byobRequest === null) {
          pullWithDefaultReader();
        } else {
          pullWithBYOBReader(byobRequest._view, false);
        }
        return promiseResolvedWith(void 0);
      }
      function pull2Algorithm() {
        if (reading) {
          return promiseResolvedWith(void 0);
        }
        reading = true;
        const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
        if (byobRequest === null) {
          pullWithDefaultReader();
        } else {
          pullWithBYOBReader(byobRequest._view, true);
        }
        return promiseResolvedWith(void 0);
      }
      function cancel1Algorithm(reason) {
        canceled1 = true;
        reason1 = reason;
        if (canceled2) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function cancel2Algorithm(reason) {
        canceled2 = true;
        reason2 = reason;
        if (canceled1) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function startAlgorithm() {
        return;
      }
      branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
      branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
      forwardReaderError(reader);
      return [branch1, branch2];
    }
    function convertUnderlyingDefaultOrByteSource(source, context) {
      assertDictionary(source, context);
      const original = source;
      const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
      const cancel = original === null || original === void 0 ? void 0 : original.cancel;
      const pull = original === null || original === void 0 ? void 0 : original.pull;
      const start = original === null || original === void 0 ? void 0 : original.start;
      const type = original === null || original === void 0 ? void 0 : original.type;
      return {
        autoAllocateChunkSize: autoAllocateChunkSize === void 0 ? void 0 : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
        cancel: cancel === void 0 ? void 0 : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
        pull: pull === void 0 ? void 0 : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
        start: start === void 0 ? void 0 : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
        type: type === void 0 ? void 0 : convertReadableStreamType(type, `${context} has member 'type' that`)
      };
    }
    function convertUnderlyingSourceCancelCallback(fn, original, context) {
      assertFunction(fn, context);
      return (reason) => promiseCall(fn, original, [reason]);
    }
    function convertUnderlyingSourcePullCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => promiseCall(fn, original, [controller]);
    }
    function convertUnderlyingSourceStartCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertReadableStreamType(type, context) {
      type = `${type}`;
      if (type !== "bytes") {
        throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
      }
      return type;
    }
    function convertReaderOptions(options2, context) {
      assertDictionary(options2, context);
      const mode = options2 === null || options2 === void 0 ? void 0 : options2.mode;
      return {
        mode: mode === void 0 ? void 0 : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
      };
    }
    function convertReadableStreamReaderMode(mode, context) {
      mode = `${mode}`;
      if (mode !== "byob") {
        throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
      }
      return mode;
    }
    function convertIteratorOptions(options2, context) {
      assertDictionary(options2, context);
      const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
      return { preventCancel: Boolean(preventCancel) };
    }
    function convertPipeOptions(options2, context) {
      assertDictionary(options2, context);
      const preventAbort = options2 === null || options2 === void 0 ? void 0 : options2.preventAbort;
      const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
      const preventClose = options2 === null || options2 === void 0 ? void 0 : options2.preventClose;
      const signal = options2 === null || options2 === void 0 ? void 0 : options2.signal;
      if (signal !== void 0) {
        assertAbortSignal(signal, `${context} has member 'signal' that`);
      }
      return {
        preventAbort: Boolean(preventAbort),
        preventCancel: Boolean(preventCancel),
        preventClose: Boolean(preventClose),
        signal
      };
    }
    function assertAbortSignal(signal, context) {
      if (!isAbortSignal2(signal)) {
        throw new TypeError(`${context} is not an AbortSignal.`);
      }
    }
    function convertReadableWritablePair(pair, context) {
      assertDictionary(pair, context);
      const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
      assertRequiredField(readable, "readable", "ReadableWritablePair");
      assertReadableStream(readable, `${context} has member 'readable' that`);
      const writable2 = pair === null || pair === void 0 ? void 0 : pair.writable;
      assertRequiredField(writable2, "writable", "ReadableWritablePair");
      assertWritableStream(writable2, `${context} has member 'writable' that`);
      return { readable, writable: writable2 };
    }
    class ReadableStream2 {
      constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
        if (rawUnderlyingSource === void 0) {
          rawUnderlyingSource = null;
        } else {
          assertObject(rawUnderlyingSource, "First parameter");
        }
        const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
        const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
        InitializeReadableStream(this);
        if (underlyingSource.type === "bytes") {
          if (strategy.size !== void 0) {
            throw new RangeError("The strategy for a byte stream cannot have a size function");
          }
          const highWaterMark = ExtractHighWaterMark(strategy, 0);
          SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
        } else {
          const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
          const highWaterMark = ExtractHighWaterMark(strategy, 1);
          SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
        }
      }
      get locked() {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("locked");
        }
        return IsReadableStreamLocked(this);
      }
      cancel(reason = void 0) {
        if (!IsReadableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$1("cancel"));
        }
        if (IsReadableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
        }
        return ReadableStreamCancel(this, reason);
      }
      getReader(rawOptions = void 0) {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("getReader");
        }
        const options2 = convertReaderOptions(rawOptions, "First parameter");
        if (options2.mode === void 0) {
          return AcquireReadableStreamDefaultReader(this);
        }
        return AcquireReadableStreamBYOBReader(this);
      }
      pipeThrough(rawTransform, rawOptions = {}) {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("pipeThrough");
        }
        assertRequiredArgument(rawTransform, 1, "pipeThrough");
        const transform = convertReadableWritablePair(rawTransform, "First parameter");
        const options2 = convertPipeOptions(rawOptions, "Second parameter");
        if (IsReadableStreamLocked(this)) {
          throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
        }
        if (IsWritableStreamLocked(transform.writable)) {
          throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
        }
        const promise = ReadableStreamPipeTo(this, transform.writable, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
        setPromiseIsHandledToTrue(promise);
        return transform.readable;
      }
      pipeTo(destination, rawOptions = {}) {
        if (!IsReadableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
        }
        if (destination === void 0) {
          return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
        }
        if (!IsWritableStream(destination)) {
          return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
        }
        let options2;
        try {
          options2 = convertPipeOptions(rawOptions, "Second parameter");
        } catch (e) {
          return promiseRejectedWith(e);
        }
        if (IsReadableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
        }
        if (IsWritableStreamLocked(destination)) {
          return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
        }
        return ReadableStreamPipeTo(this, destination, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
      }
      tee() {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("tee");
        }
        const branches = ReadableStreamTee(this);
        return CreateArrayFromList(branches);
      }
      values(rawOptions = void 0) {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("values");
        }
        const options2 = convertIteratorOptions(rawOptions, "First parameter");
        return AcquireReadableStreamAsyncIterator(this, options2.preventCancel);
      }
    }
    Object.defineProperties(ReadableStream2.prototype, {
      cancel: { enumerable: true },
      getReader: { enumerable: true },
      pipeThrough: { enumerable: true },
      pipeTo: { enumerable: true },
      tee: { enumerable: true },
      values: { enumerable: true },
      locked: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStream",
        configurable: true
      });
    }
    if (typeof SymbolPolyfill.asyncIterator === "symbol") {
      Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
        value: ReadableStream2.prototype.values,
        writable: true,
        configurable: true
      });
    }
    function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
      const stream = Object.create(ReadableStream2.prototype);
      InitializeReadableStream(stream);
      const controller = Object.create(ReadableStreamDefaultController.prototype);
      SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
      return stream;
    }
    function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
      const stream = Object.create(ReadableStream2.prototype);
      InitializeReadableStream(stream);
      const controller = Object.create(ReadableByteStreamController.prototype);
      SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, void 0);
      return stream;
    }
    function InitializeReadableStream(stream) {
      stream._state = "readable";
      stream._reader = void 0;
      stream._storedError = void 0;
      stream._disturbed = false;
    }
    function IsReadableStream(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) {
        return false;
      }
      return x instanceof ReadableStream2;
    }
    function IsReadableStreamLocked(stream) {
      if (stream._reader === void 0) {
        return false;
      }
      return true;
    }
    function ReadableStreamCancel(stream, reason) {
      stream._disturbed = true;
      if (stream._state === "closed") {
        return promiseResolvedWith(void 0);
      }
      if (stream._state === "errored") {
        return promiseRejectedWith(stream._storedError);
      }
      ReadableStreamClose(stream);
      const reader = stream._reader;
      if (reader !== void 0 && IsReadableStreamBYOBReader(reader)) {
        reader._readIntoRequests.forEach((readIntoRequest) => {
          readIntoRequest._closeSteps(void 0);
        });
        reader._readIntoRequests = new SimpleQueue();
      }
      const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
      return transformPromiseWith(sourceCancelPromise, noop2);
    }
    function ReadableStreamClose(stream) {
      stream._state = "closed";
      const reader = stream._reader;
      if (reader === void 0) {
        return;
      }
      defaultReaderClosedPromiseResolve(reader);
      if (IsReadableStreamDefaultReader(reader)) {
        reader._readRequests.forEach((readRequest) => {
          readRequest._closeSteps();
        });
        reader._readRequests = new SimpleQueue();
      }
    }
    function ReadableStreamError(stream, e) {
      stream._state = "errored";
      stream._storedError = e;
      const reader = stream._reader;
      if (reader === void 0) {
        return;
      }
      defaultReaderClosedPromiseReject(reader, e);
      if (IsReadableStreamDefaultReader(reader)) {
        reader._readRequests.forEach((readRequest) => {
          readRequest._errorSteps(e);
        });
        reader._readRequests = new SimpleQueue();
      } else {
        reader._readIntoRequests.forEach((readIntoRequest) => {
          readIntoRequest._errorSteps(e);
        });
        reader._readIntoRequests = new SimpleQueue();
      }
    }
    function streamBrandCheckException$1(name) {
      return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
    }
    function convertQueuingStrategyInit(init2, context) {
      assertDictionary(init2, context);
      const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
      assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
      return {
        highWaterMark: convertUnrestrictedDouble(highWaterMark)
      };
    }
    const byteLengthSizeFunction = (chunk) => {
      return chunk.byteLength;
    };
    Object.defineProperty(byteLengthSizeFunction, "name", {
      value: "size",
      configurable: true
    });
    class ByteLengthQueuingStrategy {
      constructor(options2) {
        assertRequiredArgument(options2, 1, "ByteLengthQueuingStrategy");
        options2 = convertQueuingStrategyInit(options2, "First parameter");
        this._byteLengthQueuingStrategyHighWaterMark = options2.highWaterMark;
      }
      get highWaterMark() {
        if (!IsByteLengthQueuingStrategy(this)) {
          throw byteLengthBrandCheckException("highWaterMark");
        }
        return this._byteLengthQueuingStrategyHighWaterMark;
      }
      get size() {
        if (!IsByteLengthQueuingStrategy(this)) {
          throw byteLengthBrandCheckException("size");
        }
        return byteLengthSizeFunction;
      }
    }
    Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
      highWaterMark: { enumerable: true },
      size: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
        value: "ByteLengthQueuingStrategy",
        configurable: true
      });
    }
    function byteLengthBrandCheckException(name) {
      return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
    }
    function IsByteLengthQueuingStrategy(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) {
        return false;
      }
      return x instanceof ByteLengthQueuingStrategy;
    }
    const countSizeFunction = () => {
      return 1;
    };
    Object.defineProperty(countSizeFunction, "name", {
      value: "size",
      configurable: true
    });
    class CountQueuingStrategy {
      constructor(options2) {
        assertRequiredArgument(options2, 1, "CountQueuingStrategy");
        options2 = convertQueuingStrategyInit(options2, "First parameter");
        this._countQueuingStrategyHighWaterMark = options2.highWaterMark;
      }
      get highWaterMark() {
        if (!IsCountQueuingStrategy(this)) {
          throw countBrandCheckException("highWaterMark");
        }
        return this._countQueuingStrategyHighWaterMark;
      }
      get size() {
        if (!IsCountQueuingStrategy(this)) {
          throw countBrandCheckException("size");
        }
        return countSizeFunction;
      }
    }
    Object.defineProperties(CountQueuingStrategy.prototype, {
      highWaterMark: { enumerable: true },
      size: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
        value: "CountQueuingStrategy",
        configurable: true
      });
    }
    function countBrandCheckException(name) {
      return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
    }
    function IsCountQueuingStrategy(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) {
        return false;
      }
      return x instanceof CountQueuingStrategy;
    }
    function convertTransformer(original, context) {
      assertDictionary(original, context);
      const flush = original === null || original === void 0 ? void 0 : original.flush;
      const readableType = original === null || original === void 0 ? void 0 : original.readableType;
      const start = original === null || original === void 0 ? void 0 : original.start;
      const transform = original === null || original === void 0 ? void 0 : original.transform;
      const writableType = original === null || original === void 0 ? void 0 : original.writableType;
      return {
        flush: flush === void 0 ? void 0 : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
        readableType,
        start: start === void 0 ? void 0 : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
        transform: transform === void 0 ? void 0 : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
        writableType
      };
    }
    function convertTransformerFlushCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => promiseCall(fn, original, [controller]);
    }
    function convertTransformerStartCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertTransformerTransformCallback(fn, original, context) {
      assertFunction(fn, context);
      return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
    }
    class TransformStream {
      constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
        if (rawTransformer === void 0) {
          rawTransformer = null;
        }
        const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
        const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
        const transformer = convertTransformer(rawTransformer, "First parameter");
        if (transformer.readableType !== void 0) {
          throw new RangeError("Invalid readableType specified");
        }
        if (transformer.writableType !== void 0) {
          throw new RangeError("Invalid writableType specified");
        }
        const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
        const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
        const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
        const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
        let startPromise_resolve;
        const startPromise = newPromise((resolve2) => {
          startPromise_resolve = resolve2;
        });
        InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
        SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
        if (transformer.start !== void 0) {
          startPromise_resolve(transformer.start(this._transformStreamController));
        } else {
          startPromise_resolve(void 0);
        }
      }
      get readable() {
        if (!IsTransformStream(this)) {
          throw streamBrandCheckException("readable");
        }
        return this._readable;
      }
      get writable() {
        if (!IsTransformStream(this)) {
          throw streamBrandCheckException("writable");
        }
        return this._writable;
      }
    }
    Object.defineProperties(TransformStream.prototype, {
      readable: { enumerable: true },
      writable: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
        value: "TransformStream",
        configurable: true
      });
    }
    function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
      function startAlgorithm() {
        return startPromise;
      }
      function writeAlgorithm(chunk) {
        return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
      }
      function abortAlgorithm(reason) {
        return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
      }
      function closeAlgorithm() {
        return TransformStreamDefaultSinkCloseAlgorithm(stream);
      }
      stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
      function pullAlgorithm() {
        return TransformStreamDefaultSourcePullAlgorithm(stream);
      }
      function cancelAlgorithm(reason) {
        TransformStreamErrorWritableAndUnblockWrite(stream, reason);
        return promiseResolvedWith(void 0);
      }
      stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
      stream._backpressure = void 0;
      stream._backpressureChangePromise = void 0;
      stream._backpressureChangePromise_resolve = void 0;
      TransformStreamSetBackpressure(stream, true);
      stream._transformStreamController = void 0;
    }
    function IsTransformStream(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) {
        return false;
      }
      return x instanceof TransformStream;
    }
    function TransformStreamError(stream, e) {
      ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
      TransformStreamErrorWritableAndUnblockWrite(stream, e);
    }
    function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
      TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
      WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
      if (stream._backpressure) {
        TransformStreamSetBackpressure(stream, false);
      }
    }
    function TransformStreamSetBackpressure(stream, backpressure) {
      if (stream._backpressureChangePromise !== void 0) {
        stream._backpressureChangePromise_resolve();
      }
      stream._backpressureChangePromise = newPromise((resolve2) => {
        stream._backpressureChangePromise_resolve = resolve2;
      });
      stream._backpressure = backpressure;
    }
    class TransformStreamDefaultController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get desiredSize() {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("desiredSize");
        }
        const readableController = this._controlledTransformStream._readable._readableStreamController;
        return ReadableStreamDefaultControllerGetDesiredSize(readableController);
      }
      enqueue(chunk = void 0) {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("enqueue");
        }
        TransformStreamDefaultControllerEnqueue(this, chunk);
      }
      error(reason = void 0) {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("error");
        }
        TransformStreamDefaultControllerError(this, reason);
      }
      terminate() {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("terminate");
        }
        TransformStreamDefaultControllerTerminate(this);
      }
    }
    Object.defineProperties(TransformStreamDefaultController.prototype, {
      enqueue: { enumerable: true },
      error: { enumerable: true },
      terminate: { enumerable: true },
      desiredSize: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "TransformStreamDefaultController",
        configurable: true
      });
    }
    function IsTransformStreamDefaultController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) {
        return false;
      }
      return x instanceof TransformStreamDefaultController;
    }
    function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
      controller._controlledTransformStream = stream;
      stream._transformStreamController = controller;
      controller._transformAlgorithm = transformAlgorithm;
      controller._flushAlgorithm = flushAlgorithm;
    }
    function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
      const controller = Object.create(TransformStreamDefaultController.prototype);
      let transformAlgorithm = (chunk) => {
        try {
          TransformStreamDefaultControllerEnqueue(controller, chunk);
          return promiseResolvedWith(void 0);
        } catch (transformResultE) {
          return promiseRejectedWith(transformResultE);
        }
      };
      let flushAlgorithm = () => promiseResolvedWith(void 0);
      if (transformer.transform !== void 0) {
        transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
      }
      if (transformer.flush !== void 0) {
        flushAlgorithm = () => transformer.flush(controller);
      }
      SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
    }
    function TransformStreamDefaultControllerClearAlgorithms(controller) {
      controller._transformAlgorithm = void 0;
      controller._flushAlgorithm = void 0;
    }
    function TransformStreamDefaultControllerEnqueue(controller, chunk) {
      const stream = controller._controlledTransformStream;
      const readableController = stream._readable._readableStreamController;
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
        throw new TypeError("Readable side is not in a state that permits enqueue");
      }
      try {
        ReadableStreamDefaultControllerEnqueue(readableController, chunk);
      } catch (e) {
        TransformStreamErrorWritableAndUnblockWrite(stream, e);
        throw stream._readable._storedError;
      }
      const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
      if (backpressure !== stream._backpressure) {
        TransformStreamSetBackpressure(stream, true);
      }
    }
    function TransformStreamDefaultControllerError(controller, e) {
      TransformStreamError(controller._controlledTransformStream, e);
    }
    function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
      const transformPromise = controller._transformAlgorithm(chunk);
      return transformPromiseWith(transformPromise, void 0, (r) => {
        TransformStreamError(controller._controlledTransformStream, r);
        throw r;
      });
    }
    function TransformStreamDefaultControllerTerminate(controller) {
      const stream = controller._controlledTransformStream;
      const readableController = stream._readable._readableStreamController;
      ReadableStreamDefaultControllerClose(readableController);
      const error2 = new TypeError("TransformStream terminated");
      TransformStreamErrorWritableAndUnblockWrite(stream, error2);
    }
    function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
      const controller = stream._transformStreamController;
      if (stream._backpressure) {
        const backpressureChangePromise = stream._backpressureChangePromise;
        return transformPromiseWith(backpressureChangePromise, () => {
          const writable2 = stream._writable;
          const state = writable2._state;
          if (state === "erroring") {
            throw writable2._storedError;
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        });
      }
      return TransformStreamDefaultControllerPerformTransform(controller, chunk);
    }
    function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
      TransformStreamError(stream, reason);
      return promiseResolvedWith(void 0);
    }
    function TransformStreamDefaultSinkCloseAlgorithm(stream) {
      const readable = stream._readable;
      const controller = stream._transformStreamController;
      const flushPromise = controller._flushAlgorithm();
      TransformStreamDefaultControllerClearAlgorithms(controller);
      return transformPromiseWith(flushPromise, () => {
        if (readable._state === "errored") {
          throw readable._storedError;
        }
        ReadableStreamDefaultControllerClose(readable._readableStreamController);
      }, (r) => {
        TransformStreamError(stream, r);
        throw readable._storedError;
      });
    }
    function TransformStreamDefaultSourcePullAlgorithm(stream) {
      TransformStreamSetBackpressure(stream, false);
      return stream._backpressureChangePromise;
    }
    function defaultControllerBrandCheckException(name) {
      return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
    }
    function streamBrandCheckException(name) {
      return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
    }
    exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
    exports2.CountQueuingStrategy = CountQueuingStrategy;
    exports2.ReadableByteStreamController = ReadableByteStreamController;
    exports2.ReadableStream = ReadableStream2;
    exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
    exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
    exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
    exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
    exports2.TransformStream = TransformStream;
    exports2.TransformStreamDefaultController = TransformStreamDefaultController;
    exports2.WritableStream = WritableStream;
    exports2.WritableStreamDefaultController = WritableStreamDefaultController;
    exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
    Object.defineProperty(exports2, "__esModule", { value: true });
  });
})(ponyfill_es2018, ponyfill_es2018.exports);
var POOL_SIZE$1 = 65536;
if (!globalThis.ReadableStream) {
  try {
    Object.assign(globalThis, require("stream/web"));
  } catch (error2) {
    Object.assign(globalThis, ponyfill_es2018.exports);
  }
}
try {
  const { Blob: Blob3 } = require("buffer");
  if (Blob3 && !Blob3.prototype.stream) {
    Blob3.prototype.stream = function name(params) {
      let position = 0;
      const blob = this;
      return new ReadableStream({
        type: "bytes",
        async pull(ctrl) {
          const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
          const buffer = await chunk.arrayBuffer();
          position += buffer.byteLength;
          ctrl.enqueue(new Uint8Array(buffer));
          if (position === blob.size) {
            ctrl.close();
          }
        }
      });
    };
  }
} catch (error2) {
}
var POOL_SIZE = 65536;
async function* toIterator(parts, clone2 = true) {
  for (let part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone2) {
        let position = part.byteOffset;
        let end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0;
      while (position !== part.size) {
        const chunk = part.slice(position, Math.min(part.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}
var _Blob = class Blob {
  #parts = [];
  #type = "";
  #size = 0;
  constructor(blobParts = [], options2 = {}) {
    let size = 0;
    const parts = blobParts.map((element) => {
      let part;
      if (ArrayBuffer.isView(element)) {
        part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
      } else if (element instanceof ArrayBuffer) {
        part = new Uint8Array(element.slice(0));
      } else if (element instanceof Blob) {
        part = element;
      } else {
        part = new TextEncoder().encode(element);
      }
      size += ArrayBuffer.isView(part) ? part.byteLength : part.size;
      return part;
    });
    const type = options2.type === void 0 ? "" : String(options2.type);
    this.#type = /[^\u0020-\u007E]/.test(type) ? "" : type;
    this.#size = size;
    this.#parts = parts;
  }
  get size() {
    return this.#size;
  }
  get type() {
    return this.#type;
  }
  async text() {
    const decoder = new TextDecoder();
    let str = "";
    for await (let part of toIterator(this.#parts, false)) {
      str += decoder.decode(part, { stream: true });
    }
    str += decoder.decode();
    return str;
  }
  async arrayBuffer() {
    const data = new Uint8Array(this.size);
    let offset = 0;
    for await (const chunk of toIterator(this.#parts, false)) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data.buffer;
  }
  stream() {
    const it = toIterator(this.#parts, true);
    return new ReadableStream({
      type: "bytes",
      async pull(ctrl) {
        const chunk = await it.next();
        chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
      }
    });
  }
  slice(start = 0, end = this.size, type = "") {
    const { size } = this;
    let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = this.#parts;
    const blobParts = [];
    let added = 0;
    for (const part of parts) {
      if (added >= span) {
        break;
      }
      const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size2 <= relativeStart) {
        relativeStart -= size2;
        relativeEnd -= size2;
      } else {
        let chunk;
        if (ArrayBuffer.isView(part)) {
          chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
          added += chunk.byteLength;
        } else {
          chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
          added += chunk.size;
        }
        blobParts.push(chunk);
        relativeStart = 0;
      }
    }
    const blob = new Blob([], { type: String(type).toLowerCase() });
    blob.#size = span;
    blob.#parts = blobParts;
    return blob;
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
  static [Symbol.hasInstance](object) {
    return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
  }
};
Object.defineProperties(_Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
});
var Blob2 = _Blob;
var Blob$1 = Blob2;
var FetchBaseError = class extends Error {
  constructor(message, type) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
};
var FetchError = class extends FetchBaseError {
  constructor(message, type, systemError) {
    super(message, type);
    if (systemError) {
      this.code = this.errno = systemError.code;
      this.erroredSysCall = systemError.syscall;
    }
  }
};
var NAME = Symbol.toStringTag;
var isURLSearchParameters = (object) => {
  return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
};
var isBlob = (object) => {
  return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
};
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
var isAbortSignal = (object) => {
  return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
};
var carriage = "\r\n";
var dashes = "-".repeat(2);
var carriageLength = Buffer.byteLength(carriage);
var getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
var getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    length += isBlob(value) ? value.size : Buffer.byteLength(String(value));
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
var INTERNALS$2 = Symbol("Body internals");
var Body = class {
  constructor(body, {
    size = 0
  } = {}) {
    let boundary = null;
    if (body === null) {
      body = null;
    } else if (isURLSearchParameters(body)) {
      body = Buffer.from(body.toString());
    } else if (isBlob(body))
      ;
    else if (Buffer.isBuffer(body))
      ;
    else if (import_util.types.isAnyArrayBuffer(body)) {
      body = Buffer.from(body);
    } else if (ArrayBuffer.isView(body)) {
      body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof import_stream.default)
      ;
    else if (isFormData(body)) {
      boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
      body = import_stream.default.Readable.from(formDataIterator(body, boundary));
    } else {
      body = Buffer.from(String(body));
    }
    this[INTERNALS$2] = {
      body,
      boundary,
      disturbed: false,
      error: null
    };
    this.size = size;
    if (body instanceof import_stream.default) {
      body.on("error", (error_) => {
        const error2 = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
        this[INTERNALS$2].error = error2;
      });
    }
  }
  get body() {
    return this[INTERNALS$2].body;
  }
  get bodyUsed() {
    return this[INTERNALS$2].disturbed;
  }
  async arrayBuffer() {
    const { buffer, byteOffset, byteLength } = await consumeBody(this);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  async blob() {
    const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
    const buf = await this.buffer();
    return new Blob$1([buf], {
      type: ct
    });
  }
  async json() {
    const buffer = await consumeBody(this);
    return JSON.parse(buffer.toString());
  }
  async text() {
    const buffer = await consumeBody(this);
    return buffer.toString();
  }
  buffer() {
    return consumeBody(this);
  }
};
Object.defineProperties(Body.prototype, {
  body: { enumerable: true },
  bodyUsed: { enumerable: true },
  arrayBuffer: { enumerable: true },
  blob: { enumerable: true },
  json: { enumerable: true },
  text: { enumerable: true }
});
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = import_stream.default.Readable.from(body.stream());
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error2 = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(error2);
        throw error2;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    const error_ = error2 instanceof FetchBaseError ? error2 : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    throw error_;
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
var clone = (instance, highWaterMark) => {
  let p1;
  let p2;
  let { body } = instance;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
    p1 = new import_stream.PassThrough({ highWaterMark });
    p2 = new import_stream.PassThrough({ highWaterMark });
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS$2].body = p1;
    body = p2;
  }
  return body;
};
var extractContentType = (body, request) => {
  if (body === null) {
    return null;
  }
  if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  }
  if (isURLSearchParameters(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  }
  if (isBlob(body)) {
    return body.type || null;
  }
  if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
    return null;
  }
  if (body && typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  }
  if (isFormData(body)) {
    return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
  }
  if (body instanceof import_stream.default) {
    return null;
  }
  return "text/plain;charset=UTF-8";
};
var getTotalBytes = (request) => {
  const { body } = request;
  if (body === null) {
    return 0;
  }
  if (isBlob(body)) {
    return body.size;
  }
  if (Buffer.isBuffer(body)) {
    return body.length;
  }
  if (body && typeof body.getLengthSync === "function") {
    return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
  }
  if (isFormData(body)) {
    return getFormDataLength(request[INTERNALS$2].boundary);
  }
  return null;
};
var writeToStream = (dest, { body }) => {
  if (body === null) {
    dest.end();
  } else if (isBlob(body)) {
    import_stream.default.Readable.from(body.stream()).pipe(dest);
  } else if (Buffer.isBuffer(body)) {
    dest.write(body);
    dest.end();
  } else {
    body.pipe(dest);
  }
};
var validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
    const error2 = new TypeError(`Header name must be a valid HTTP token [${name}]`);
    Object.defineProperty(error2, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
    throw error2;
  }
};
var validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
    const error2 = new TypeError(`Invalid character in header content ["${name}"]`);
    Object.defineProperty(error2, "code", { value: "ERR_INVALID_CHAR" });
    throw error2;
  }
};
var Headers = class extends URLSearchParams {
  constructor(init2) {
    let result = [];
    if (init2 instanceof Headers) {
      const raw = init2.raw();
      for (const [name, values] of Object.entries(raw)) {
        result.push(...values.map((value) => [name, value]));
      }
    } else if (init2 == null)
      ;
    else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
      const method = init2[Symbol.iterator];
      if (method == null) {
        result.push(...Object.entries(init2));
      } else {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        result = [...init2].map((pair) => {
          if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
            throw new TypeError("Each header pair must be an iterable object");
          }
          return [...pair];
        }).map((pair) => {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          return [...pair];
        });
      }
    } else {
      throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    }
    result = result.length > 0 ? result.map(([name, value]) => {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return [String(name).toLowerCase(), String(value)];
    }) : void 0;
    super(result);
    return new Proxy(this, {
      get(target, p, receiver) {
        switch (p) {
          case "append":
          case "set":
            return (name, value) => {
              validateHeaderName(name);
              validateHeaderValue(name, String(value));
              return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
            };
          case "delete":
          case "has":
          case "getAll":
            return (name) => {
              validateHeaderName(name);
              return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
            };
          case "keys":
            return () => {
              target.sort();
              return new Set(URLSearchParams.prototype.keys.call(target)).keys();
            };
          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(name) {
    const values = this.getAll(name);
    if (values.length === 0) {
      return null;
    }
    let value = values.join(", ");
    if (/^content-encoding$/i.test(name)) {
      value = value.toLowerCase();
    }
    return value;
  }
  forEach(callback, thisArg = void 0) {
    for (const name of this.keys()) {
      Reflect.apply(callback, thisArg, [this.get(name), name, this]);
    }
  }
  *values() {
    for (const name of this.keys()) {
      yield this.get(name);
    }
  }
  *entries() {
    for (const name of this.keys()) {
      yield [name, this.get(name)];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((result, key) => {
      result[key] = this.getAll(key);
      return result;
    }, {});
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((result, key) => {
      const values = this.getAll(key);
      if (key === "host") {
        result[key] = values[0];
      } else {
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    }, {});
  }
};
Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
  result[property] = { enumerable: true };
  return result;
}, {}));
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
var redirectStatus = new Set([301, 302, 303, 307, 308]);
var isRedirect = (code) => {
  return redirectStatus.has(code);
};
var INTERNALS$1 = Symbol("Response internals");
var Response = class extends Body {
  constructor(body = null, options2 = {}) {
    super(body, options2);
    const status = options2.status != null ? options2.status : 200;
    const headers = new Headers(options2.headers);
    if (body !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(body);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    this[INTERNALS$1] = {
      type: "default",
      url: options2.url,
      status,
      statusText: options2.statusText || "",
      headers,
      counter: options2.counter,
      highWaterMark: options2.highWaterMark
    };
  }
  get type() {
    return this[INTERNALS$1].type;
  }
  get url() {
    return this[INTERNALS$1].url || "";
  }
  get status() {
    return this[INTERNALS$1].status;
  }
  get ok() {
    return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
  }
  get redirected() {
    return this[INTERNALS$1].counter > 0;
  }
  get statusText() {
    return this[INTERNALS$1].statusText;
  }
  get headers() {
    return this[INTERNALS$1].headers;
  }
  get highWaterMark() {
    return this[INTERNALS$1].highWaterMark;
  }
  clone() {
    return new Response(clone(this, this.highWaterMark), {
      type: this.type,
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected,
      size: this.size
    });
  }
  static redirect(url, status = 302) {
    if (!isRedirect(status)) {
      throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    }
    return new Response(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    });
  }
  static error() {
    const response = new Response(null, { status: 0, statusText: "" });
    response[INTERNALS$1].type = "error";
    return response;
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
};
Object.defineProperties(Response.prototype, {
  type: { enumerable: true },
  url: { enumerable: true },
  status: { enumerable: true },
  ok: { enumerable: true },
  redirected: { enumerable: true },
  statusText: { enumerable: true },
  headers: { enumerable: true },
  clone: { enumerable: true }
});
var getSearch = (parsedURL) => {
  if (parsedURL.search) {
    return parsedURL.search;
  }
  const lastOffset = parsedURL.href.length - 1;
  const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
  return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
};
var INTERNALS = Symbol("Request internals");
var isRequest = (object) => {
  return typeof object === "object" && typeof object[INTERNALS] === "object";
};
var Request = class extends Body {
  constructor(input, init2 = {}) {
    let parsedURL;
    if (isRequest(input)) {
      parsedURL = new URL(input.url);
    } else {
      parsedURL = new URL(input);
      input = {};
    }
    let method = init2.method || input.method || "GET";
    method = method.toUpperCase();
    if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
    super(inputBody, {
      size: init2.size || input.size || 0
    });
    const headers = new Headers(init2.headers || input.headers || {});
    if (inputBody !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(inputBody, this);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    let signal = isRequest(input) ? input.signal : null;
    if ("signal" in init2) {
      signal = init2.signal;
    }
    if (signal != null && !isAbortSignal(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
    }
    this[INTERNALS] = {
      method,
      redirect: init2.redirect || input.redirect || "follow",
      headers,
      parsedURL,
      signal
    };
    this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
    this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
    this.counter = init2.counter || input.counter || 0;
    this.agent = init2.agent || input.agent;
    this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
    this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
  }
  get method() {
    return this[INTERNALS].method;
  }
  get url() {
    return (0, import_url.format)(this[INTERNALS].parsedURL);
  }
  get headers() {
    return this[INTERNALS].headers;
  }
  get redirect() {
    return this[INTERNALS].redirect;
  }
  get signal() {
    return this[INTERNALS].signal;
  }
  clone() {
    return new Request(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
};
Object.defineProperties(Request.prototype, {
  method: { enumerable: true },
  url: { enumerable: true },
  headers: { enumerable: true },
  redirect: { enumerable: true },
  clone: { enumerable: true },
  signal: { enumerable: true }
});
var getNodeRequestOptions = (request) => {
  const { parsedURL } = request[INTERNALS];
  const headers = new Headers(request[INTERNALS].headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }
  let contentLengthValue = null;
  if (request.body === null && /^(post|put)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body !== null) {
    const totalBytes = getTotalBytes(request);
    if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    headers.set("Content-Length", contentLengthValue);
  }
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "node-fetch");
  }
  if (request.compress && !headers.has("Accept-Encoding")) {
    headers.set("Accept-Encoding", "gzip,deflate,br");
  }
  let { agent } = request;
  if (typeof agent === "function") {
    agent = agent(parsedURL);
  }
  if (!headers.has("Connection") && !agent) {
    headers.set("Connection", "close");
  }
  const search = getSearch(parsedURL);
  const requestOptions = {
    path: parsedURL.pathname + search,
    pathname: parsedURL.pathname,
    hostname: parsedURL.hostname,
    protocol: parsedURL.protocol,
    port: parsedURL.port,
    hash: parsedURL.hash,
    search: parsedURL.search,
    query: parsedURL.query,
    href: parsedURL.href,
    method: request.method,
    headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
    insecureHTTPParser: request.insecureHTTPParser,
    agent
  };
  return requestOptions;
};
var AbortError = class extends FetchBaseError {
  constructor(message, type = "aborted") {
    super(message, type);
  }
};
var supportedSchemas = new Set(["data:", "http:", "https:"]);
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (error2) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error2.message}`, "system", error2));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error2) => {
      response.body.destroy(error2);
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error2 = new Error("Premature close");
            error2.code = "ERR_STREAM_PREMATURE_CLOSE";
            response.body.emit("error", error2);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              headers.set("Location", locationURL);
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
        raw.once("data", (chunk) => {
          body = (chunk[0] & 15) === 8 ? (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), reject) : (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), reject);
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request.on("response", (response) => {
    const { headers } = response;
    isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
  });
  request.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error2 = new Error("Premature close");
        error2.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error2);
      }
    };
    socket.prependListener("close", onSocketClose);
    request.on("abort", () => {
      socket.removeListener("close", onSocketClose);
    });
    socket.on("data", (buf) => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    });
  });
}

// .svelte-kit/output/server/app.js
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
var escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
var escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$o = {
  code: "#svelte-announcer.svelte-9z6sc{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\t-webkit-clip-path: inset(50%);\\n\\t\\t        clip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}</style>"],"names":[],"mappings":"AAsDC,iBAAiB,aAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,iBAAiB,CAAE,MAAM,GAAG,CAAC,CACrB,SAAS,CAAE,MAAM,GAAG,CAAC,CAC7B,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$o);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-b54edf67.js",
      css: [assets + "/_app/assets/start-c446e5f0.css"],
      js: [assets + "/_app/start-b54edf67.js", assets + "/_app/chunks/vendor-aeab3881.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "fonts/segoeui.woff", "size": 27332, "type": "font/woff" }, { "file": "fonts/segoeui.woff2", "size": 20456, "type": "font/woff2" }, { "file": "fonts/segoeuib.woff", "size": 29660, "type": "font/woff" }, { "file": "fonts/segoeuib.woff2", "size": 22332, "type": "font/woff2" }, { "file": "images/kanakoot.jpg", "size": 103410, "type": "image/jpeg" }, { "file": "images/me.jpg", "size": 58793, "type": "image/jpeg" }, { "file": "images/peckernote.jpg", "size": 432524, "type": "image/jpeg" }],
  layout: ".svelte-kit/build/components/layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
var module_lookup = {
  ".svelte-kit/build/components/layout.svelte": () => Promise.resolve().then(function() {
    return layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  })
};
var metadata_lookup = { ".svelte-kit/build/components/layout.svelte": { "entry": "layout.svelte-04f84264.js", "css": [], "js": ["layout.svelte-04f84264.js", "chunks/vendor-aeab3881.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-69d6b0fd.js", "css": [], "js": ["error.svelte-69d6b0fd.js", "chunks/vendor-aeab3881.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-26a29cbc.js", "css": ["assets/pages/index.svelte-80909b20.css"], "js": ["pages/index.svelte-26a29cbc.js", "chunks/vendor-aeab3881.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
var layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Layout
});
function load({ error: error2, status }) {
  return { props: { error: error2, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var css$n = {
  code: "svg.svelte-1c2i6j8.svelte-1c2i6j8{position:absolute;top:4em;bottom:0;left:2em;z-index:1}@media only screen and (max-width: 1280px){svg.svelte-1c2i6j8.svelte-1c2i6j8{left:auto;right:-1em;top:-5em;width:10em}svg.svelte-1c2i6j8 line.svelte-1c2i6j8{display:none}}@media only screen and (max-width: 720px){svg.svelte-1c2i6j8.svelte-1c2i6j8{width:6em;top:-11em}}",
  map: '{"version":3,"file":"PicSupportIcon.svelte","sources":["PicSupportIcon.svelte"],"sourcesContent":["<svg width=\\"279\\" height=\\"773\\" viewBox=\\"0 0 279 773\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\r\\n\\t<circle cx=\\"139.5\\" cy=\\"139.5\\" r=\\"139\\" stroke=\\"#9F9F9F\\" />\\r\\n\\t<line x1=\\"111.5\\" y1=\\"276\\" x2=\\"111.5\\" y2=\\"767\\" stroke=\\"#747474\\" />\\r\\n\\t<line x1=\\"209.5\\" y1=\\"261\\" x2=\\"209.5\\" y2=\\"773\\" stroke=\\"#747474\\" />\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg {\\n  position: absolute;\\n  top: 4em;\\n  bottom: 0;\\n  left: 2em;\\n  z-index: 1;\\n}\\n@media only screen and (max-width: 1280px) {\\n  svg {\\n    left: auto;\\n    right: -1em;\\n    top: -5em;\\n    width: 10em;\\n  }\\n  svg line {\\n    display: none;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  svg {\\n    width: 6em;\\n    top: -11em;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAMmB,GAAG,8BAAC,CAAC,AACtB,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,GAAG,CACT,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,GAAG,8BAAC,CAAC,AACH,IAAI,CAAE,IAAI,CACV,KAAK,CAAE,IAAI,CACX,GAAG,CAAE,IAAI,CACT,KAAK,CAAE,IAAI,AACb,CAAC,AACD,kBAAG,CAAC,IAAI,eAAC,CAAC,AACR,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,GAAG,8BAAC,CAAC,AACH,KAAK,CAAE,GAAG,CACV,GAAG,CAAE,KAAK,AACZ,CAAC,AACH,CAAC"}'
};
var PicSupportIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$n);
  return `<svg width="${"279"}" height="${"773"}" viewBox="${"0 0 279 773"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-1c2i6j8"}"><circle cx="${"139.5"}" cy="${"139.5"}" r="${"139"}" stroke="${"#9F9F9F"}"></circle><line x1="${"111.5"}" y1="${"276"}" x2="${"111.5"}" y2="${"767"}" stroke="${"#747474"}" class="${"svelte-1c2i6j8"}"></line><line x1="${"209.5"}" y1="${"261"}" x2="${"209.5"}" y2="${"773"}" stroke="${"#747474"}" class="${"svelte-1c2i6j8"}"></line></svg>`;
});
var css$m = {
  code: ".aboutInfoContainer.svelte-1aaaglf.svelte-1aaaglf{padding-top:4em;height:100%;display:grid;grid-template-columns:0.7fr 1fr;position:relative;z-index:0}@media only screen and (max-width: 1280px){.aboutInfoContainer.svelte-1aaaglf.svelte-1aaaglf{display:block;gap:2em}}.imageContainer.svelte-1aaaglf.svelte-1aaaglf{height:17em;width:17em;border-radius:50em;overflow:hidden;position:relative;z-index:4}@media only screen and (max-width: 1280px){.imageContainer.svelte-1aaaglf.svelte-1aaaglf{width:10em;height:10em;float:right;margin-left:1em;margin-bottom:1em}}@media only screen and (max-width: 720px){.imageContainer.svelte-1aaaglf.svelte-1aaaglf{width:6em;height:6em}}.imageContainer.svelte-1aaaglf img.svelte-1aaaglf{width:17em;-o-object-fit:contain;object-fit:contain}@media only screen and (max-width: 1280px){.imageContainer.svelte-1aaaglf img.svelte-1aaaglf{width:10em}}@media only screen and (max-width: 720px){.imageContainer.svelte-1aaaglf img.svelte-1aaaglf{width:6em}}.content.svelte-1aaaglf p.svelte-1aaaglf{color:#CDCDCD;font-weight:normal;margin-bottom:2em;line-height:140%}.content.svelte-1aaaglf p:first-child strong.svelte-1aaaglf:first-child{font-size:2rem}.content.svelte-1aaaglf ul.svelte-1aaaglf{padding:2em;display:grid;grid-template-columns:1fr 1fr 1fr;gap:2em}.content.svelte-1aaaglf ul li.svelte-1aaaglf{letter-spacing:0.05em;list-style:circle}@media only screen and (max-width: 720px){.content.svelte-1aaaglf ul.svelte-1aaaglf{padding:1em;gap:2em}.content.svelte-1aaaglf ul li.svelte-1aaaglf{font-size:0.8em;margin-left:0}}",
  map: `{"version":3,"file":"About.svelte","sources":["About.svelte"],"sourcesContent":["<script>\\r\\n\\timport PicSupportIcon from '../svg/PicSupportIcon.svelte';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section id=\\"about\\" class=\\"main\\">\\r\\n\\t\\t<div class=\\"container\\">\\r\\n\\t\\t\\t<h2>ABOUT</h2>\\r\\n\\t\\t\\t<div class=\\"aboutInfoContainer\\">\\r\\n\\t\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t\\t<PicSupportIcon />\\r\\n\\t\\t\\t\\t\\t<div class=\\"imageContainer\\">\\r\\n\\t\\t\\t\\t\\t\\t<img src=\\"/images/me.jpg\\" alt=\\"\\" />\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t<div class=\\"content\\">\\r\\n\\t\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t\\t<strong>Hello!</strong> My name is <strong>Gautham</strong> and I love creating things.\\r\\n\\t\\t\\t\\t\\t\\tI taught myself designing when I was 16 and started freelancing. My Intrest in coding\\r\\n\\t\\t\\t\\t\\t\\tstarted when I wanted to make my mockup UI designs real. Now I love combining both of\\r\\n\\t\\t\\t\\t\\t\\tthe skills to build <strong>creative</strong> softwares and designs.\\r\\n\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t\\tCurrently I am a <strong>Computer Science</strong> middler in Vellore Instistute of\\r\\n\\t\\t\\t\\t\\t\\tTechnology, Chennai while I reside in Kerala, India. My main focus these days is to\\r\\n\\t\\t\\t\\t\\t\\tlearn <strong>new technology</strong> and create\\r\\n\\t\\t\\t\\t\\t\\t<strong>user-centered products</strong>.\\r\\n\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t\\t<p>Here are a few technologies I\u2019ve been working with recently-</p>\\r\\n\\t\\t\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t\\t\\t<li>Javascript</li>\\r\\n\\t\\t\\t\\t\\t\\t<li>Sass</li>\\r\\n\\t\\t\\t\\t\\t\\t<li>Mongo DB</li>\\r\\n\\t\\t\\t\\t\\t\\t<li>Typescript</li>\\r\\n\\t\\t\\t\\t\\t\\t<li>React.js</li>\\r\\n\\t\\t\\t\\t\\t\\t<li>GSAP</li>\\r\\n\\t\\t\\t\\t\\t\\t<li>Node.js</li>\\r\\n\\t\\t\\t\\t\\t\\t<li>Svelte</li>\\r\\n\\t\\t\\t\\t\\t\\t<li>Docker</li>\\r\\n\\t\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">.aboutInfoContainer {\\n  padding-top: 4em;\\n  height: 100%;\\n  display: grid;\\n  grid-template-columns: 0.7fr 1fr;\\n  position: relative;\\n  z-index: 0;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .aboutInfoContainer {\\n    display: block;\\n    gap: 2em;\\n  }\\n}\\n\\n.imageContainer {\\n  height: 17em;\\n  width: 17em;\\n  border-radius: 50em;\\n  overflow: hidden;\\n  position: relative;\\n  z-index: 4;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .imageContainer {\\n    width: 10em;\\n    height: 10em;\\n    float: right;\\n    margin-left: 1em;\\n    margin-bottom: 1em;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .imageContainer {\\n    width: 6em;\\n    height: 6em;\\n  }\\n}\\n.imageContainer img {\\n  width: 17em;\\n  -o-object-fit: contain;\\n     object-fit: contain;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .imageContainer img {\\n    width: 10em;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .imageContainer img {\\n    width: 6em;\\n  }\\n}\\n\\n.content p {\\n  color: #CDCDCD;\\n  font-weight: normal;\\n  margin-bottom: 2em;\\n  line-height: 140%;\\n}\\n.content p:first-child strong:first-child {\\n  font-size: 2rem;\\n}\\n.content ul {\\n  padding: 2em;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  gap: 2em;\\n}\\n.content ul li {\\n  letter-spacing: 0.05em;\\n  list-style: circle;\\n}\\n@media only screen and (max-width: 720px) {\\n  .content ul {\\n    padding: 1em;\\n    gap: 2em;\\n  }\\n  .content ul li {\\n    font-size: 0.8em;\\n    margin-left: 0;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AA8CmB,mBAAmB,8BAAC,CAAC,AACtC,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,KAAK,CAAC,GAAG,CAChC,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,mBAAmB,8BAAC,CAAC,AACnB,OAAO,CAAE,KAAK,CACd,GAAG,CAAE,GAAG,AACV,CAAC,AACH,CAAC,AAED,eAAe,8BAAC,CAAC,AACf,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,IAAI,CACnB,QAAQ,CAAE,MAAM,CAChB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,eAAe,8BAAC,CAAC,AACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,KAAK,CACZ,WAAW,CAAE,GAAG,CAChB,aAAa,CAAE,GAAG,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,eAAe,8BAAC,CAAC,AACf,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACb,CAAC,AACH,CAAC,AACD,8BAAe,CAAC,GAAG,eAAC,CAAC,AACnB,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,OAAO,CACnB,UAAU,CAAE,OAAO,AACxB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,8BAAe,CAAC,GAAG,eAAC,CAAC,AACnB,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,8BAAe,CAAC,GAAG,eAAC,CAAC,AACnB,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC,AAED,uBAAQ,CAAC,CAAC,eAAC,CAAC,AACV,KAAK,CAAE,OAAO,CACd,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,uBAAQ,CAAC,CAAC,YAAY,CAAC,qBAAM,YAAY,AAAC,CAAC,AACzC,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,uBAAQ,CAAC,EAAE,eAAC,CAAC,AACX,OAAO,CAAE,GAAG,CACZ,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAClC,GAAG,CAAE,GAAG,AACV,CAAC,AACD,uBAAQ,CAAC,EAAE,CAAC,EAAE,eAAC,CAAC,AACd,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,uBAAQ,CAAC,EAAE,eAAC,CAAC,AACX,OAAO,CAAE,GAAG,CACZ,GAAG,CAAE,GAAG,AACV,CAAC,AACD,uBAAQ,CAAC,EAAE,CAAC,EAAE,eAAC,CAAC,AACd,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,CAAC,AAChB,CAAC,AACH,CAAC"}`
};
var About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$m);
  return `<section id="${"about"}" class="${"main"}"><div class="${"container"}"><h2>ABOUT</h2>
			<div class="${"aboutInfoContainer svelte-1aaaglf"}"><div>${validate_component(PicSupportIcon, "PicSupportIcon").$$render($$result, {}, {}, {})}
					<div class="${"imageContainer svelte-1aaaglf"}"><img src="${"/images/me.jpg"}" alt="${""}" class="${"svelte-1aaaglf"}"></div></div>
				<div class="${"content svelte-1aaaglf"}"><p class="${"svelte-1aaaglf"}"><strong class="${"svelte-1aaaglf"}">Hello!</strong> My name is <strong class="${"svelte-1aaaglf"}">Gautham</strong> and I love creating things.
						I taught myself designing when I was 16 and started freelancing. My Intrest in coding
						started when I wanted to make my mockup UI designs real. Now I love combining both of
						the skills to build <strong class="${"svelte-1aaaglf"}">creative</strong> softwares and designs.
					</p>
					<p class="${"svelte-1aaaglf"}">Currently I am a <strong class="${"svelte-1aaaglf"}">Computer Science</strong> middler in Vellore Instistute of
						Technology, Chennai while I reside in Kerala, India. My main focus these days is to
						learn <strong class="${"svelte-1aaaglf"}">new technology</strong> and create
						<strong class="${"svelte-1aaaglf"}">user-centered products</strong>.
					</p>
					<p class="${"svelte-1aaaglf"}">Here are a few technologies I\u2019ve been working with recently-</p>
					<ul class="${"svelte-1aaaglf"}"><li class="${"svelte-1aaaglf"}">Javascript</li>
						<li class="${"svelte-1aaaglf"}">Sass</li>
						<li class="${"svelte-1aaaglf"}">Mongo DB</li>
						<li class="${"svelte-1aaaglf"}">Typescript</li>
						<li class="${"svelte-1aaaglf"}">React.js</li>
						<li class="${"svelte-1aaaglf"}">GSAP</li>
						<li class="${"svelte-1aaaglf"}">Node.js</li>
						<li class="${"svelte-1aaaglf"}">Svelte</li>
						<li class="${"svelte-1aaaglf"}">Docker</li></ul></div></div></div>
	</section>`;
});
var css$l = {
  code: "div.svelte-lva02k.svelte-lva02k{z-index:0;position:absolute;top:50%;left:60%;transform:translate(-50%, -50%)}div.svelte-lva02k svg.svelte-lva02k:first-child{position:absolute;top:50%;left:20%;transform:translate(-50%, -50%)}",
  map: '{"version":3,"file":"AnimatedCircles.svelte","sources":["AnimatedCircles.svelte"],"sourcesContent":["<script>\\r\\n<\/script>\\r\\n\\r\\n<div>\\r\\n\\t<svg\\r\\n\\t\\twidth=\\"449\\"\\r\\n\\t\\theight=\\"449\\"\\r\\n\\t\\tviewBox=\\"0 0 449 449\\"\\r\\n\\t\\tfill=\\"none\\"\\r\\n\\t\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n\\t>\\r\\n\\t\\t<circle cx=\\"224.5\\" cy=\\"224.5\\" r=\\"224\\" stroke=\\"#00365C\\" />\\r\\n\\t</svg>\\r\\n\\t<svg\\r\\n\\t\\twidth=\\"585\\"\\r\\n\\t\\theight=\\"585\\"\\r\\n\\t\\tviewBox=\\"0 0 585 585\\"\\r\\n\\t\\tfill=\\"none\\"\\r\\n\\t\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n\\t>\\r\\n\\t\\t<circle cx=\\"292.5\\" cy=\\"292.5\\" r=\\"292\\" stroke=\\"#424242\\" />\\r\\n\\t</svg>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">div {\\n  z-index: 0;\\n  position: absolute;\\n  top: 50%;\\n  left: 60%;\\n  transform: translate(-50%, -50%);\\n}\\ndiv svg:first-child {\\n  position: absolute;\\n  top: 50%;\\n  left: 20%;\\n  transform: translate(-50%, -50%);\\n}</style>\\r\\n"],"names":[],"mappings":"AAwBmB,GAAG,4BAAC,CAAC,AACtB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,AAClC,CAAC,AACD,iBAAG,CAAC,iBAAG,YAAY,AAAC,CAAC,AACnB,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,AAClC,CAAC"}'
};
var AnimatedCircles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$l);
  return `<div class="${"svelte-lva02k"}"><svg width="${"449"}" height="${"449"}" viewBox="${"0 0 449 449"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-lva02k"}"><circle cx="${"224.5"}" cy="${"224.5"}" r="${"224"}" stroke="${"#00365C"}"></circle></svg>
	<svg width="${"585"}" height="${"585"}" viewBox="${"0 0 585 585"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-lva02k"}"><circle cx="${"292.5"}" cy="${"292.5"}" r="${"292"}" stroke="${"#424242"}"></circle></svg>
</div>`;
});
var css$k = {
  code: ".left.svelte-hlkg17.svelte-hlkg17{transform:rotate(180deg)}.up.svelte-hlkg17.svelte-hlkg17{transform:rotate(-90deg)}.down.svelte-hlkg17.svelte-hlkg17{transform:rotate(90deg)}svg.svelte-hlkg17.svelte-hlkg17{margin-top:0.2em}svg.svelte-hlkg17 path.svelte-hlkg17{transition:0.2s ease-in}",
  map: `{"version":3,"file":"ArrowIcon.svelte","sources":["ArrowIcon.svelte"],"sourcesContent":["<script>\\r\\n\\texport let direction = 'right';\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass={direction}\\r\\n\\twidth=\\"31\\"\\r\\n\\theight=\\"31\\"\\r\\n\\tviewBox=\\"0 0 31 31\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\tfill-rule=\\"evenodd\\"\\r\\n\\t\\tclip-rule=\\"evenodd\\"\\r\\n\\t\\td=\\"M7.75 15.5C7.75 15.2431 7.85206 14.9967 8.03374 14.815C8.21542 14.6333 8.46182 14.5312 8.71875 14.5312L19.9427 14.5312L15.7829 10.3734C15.6928 10.2833 15.6214 10.1764 15.5726 10.0587C15.5239 9.94101 15.4988 9.81488 15.4988 9.6875C15.4988 9.56012 15.5239 9.43399 15.5726 9.3163C15.6214 9.19862 15.6928 9.09169 15.7829 9.00162C15.8729 8.91155 15.9799 8.8401 16.0976 8.79136C16.2152 8.74261 16.3414 8.71752 16.4688 8.71752C16.5961 8.71752 16.7223 8.74261 16.8399 8.79136C16.9576 8.8401 17.0646 8.91155 17.1546 9.00162L22.9671 14.8141C23.0573 14.9041 23.1289 15.011 23.1778 15.1287C23.2266 15.2464 23.2517 15.3726 23.2517 15.5C23.2517 15.6274 23.2266 15.7536 23.1778 15.8713C23.1289 15.989 23.0573 16.0959 22.9671 16.1859L17.1546 21.9984C17.0646 22.0884 16.9576 22.1599 16.8399 22.2086C16.7223 22.2574 16.5961 22.2825 16.4688 22.2825C16.3414 22.2825 16.2152 22.2574 16.0976 22.2086C15.9799 22.1599 15.8729 22.0884 15.7829 21.9984C15.601 21.8165 15.4988 21.5697 15.4988 21.3125C15.4988 21.1851 15.5239 21.059 15.5726 20.9413C15.6214 20.8236 15.6928 20.7167 15.7829 20.6266L19.9427 16.4687L8.71875 16.4687C8.46182 16.4687 8.21542 16.3667 8.03374 16.185C7.85206 16.0033 7.75 15.7569 7.75 15.5Z\\"\\r\\n\\t\\tfill=\\"#CBCBCB\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">.left {\\n  transform: rotate(180deg);\\n}\\n\\n.up {\\n  transform: rotate(-90deg);\\n}\\n\\n.down {\\n  transform: rotate(90deg);\\n}\\n\\nsvg {\\n  margin-top: 0.2em;\\n}\\nsvg path {\\n  transition: 0.2s ease-in;\\n}</style>\\r\\n"],"names":[],"mappings":"AAoBmB,KAAK,4BAAC,CAAC,AACxB,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AAED,GAAG,4BAAC,CAAC,AACH,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AAED,KAAK,4BAAC,CAAC,AACL,SAAS,CAAE,OAAO,KAAK,CAAC,AAC1B,CAAC,AAED,GAAG,4BAAC,CAAC,AACH,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,iBAAG,CAAC,IAAI,cAAC,CAAC,AACR,UAAU,CAAE,IAAI,CAAC,OAAO,AAC1B,CAAC"}`
};
var ArrowIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { direction = "right" } = $$props;
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0)
    $$bindings.direction(direction);
  $$result.css.add(css$k);
  return `<svg class="${escape(null_to_empty(direction)) + " svelte-hlkg17"}" width="${"31"}" height="${"31"}" viewBox="${"0 0 31 31"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path fill-rule="${"evenodd"}" clip-rule="${"evenodd"}" d="${"M7.75 15.5C7.75 15.2431 7.85206 14.9967 8.03374 14.815C8.21542 14.6333 8.46182 14.5312 8.71875 14.5312L19.9427 14.5312L15.7829 10.3734C15.6928 10.2833 15.6214 10.1764 15.5726 10.0587C15.5239 9.94101 15.4988 9.81488 15.4988 9.6875C15.4988 9.56012 15.5239 9.43399 15.5726 9.3163C15.6214 9.19862 15.6928 9.09169 15.7829 9.00162C15.8729 8.91155 15.9799 8.8401 16.0976 8.79136C16.2152 8.74261 16.3414 8.71752 16.4688 8.71752C16.5961 8.71752 16.7223 8.74261 16.8399 8.79136C16.9576 8.8401 17.0646 8.91155 17.1546 9.00162L22.9671 14.8141C23.0573 14.9041 23.1289 15.011 23.1778 15.1287C23.2266 15.2464 23.2517 15.3726 23.2517 15.5C23.2517 15.6274 23.2266 15.7536 23.1778 15.8713C23.1289 15.989 23.0573 16.0959 22.9671 16.1859L17.1546 21.9984C17.0646 22.0884 16.9576 22.1599 16.8399 22.2086C16.7223 22.2574 16.5961 22.2825 16.4688 22.2825C16.3414 22.2825 16.2152 22.2574 16.0976 22.2086C15.9799 22.1599 15.8729 22.0884 15.7829 21.9984C15.601 21.8165 15.4988 21.5697 15.4988 21.3125C15.4988 21.1851 15.5239 21.059 15.5726 20.9413C15.6214 20.8236 15.6928 20.7167 15.7829 20.6266L19.9427 16.4687L8.71875 16.4687C8.46182 16.4687 8.21542 16.3667 8.03374 16.185C7.85206 16.0033 7.75 15.7569 7.75 15.5Z"}" fill="${"#CBCBCB"}" class="${"svelte-hlkg17"}"></path></svg>`;
});
var css$j = {
  code: '.container.svelte-7yru30.svelte-7yru30{display:flex;flex-direction:column;position:relative}.hero.svelte-7yru30.svelte-7yru30{z-index:5;margin:auto 0}.hero.svelte-7yru30 span.svelte-7yru30{color:#A9A9A9;font-family:"segoeui-bold", "Segoe UI", san-serif;font-weight:bolder;font-size:3.5rem}@media only screen and (max-width: 1280px){.hero.svelte-7yru30 span.svelte-7yru30{font-size:3rem;line-height:100%}}@media only screen and (max-width: 720px){.hero.svelte-7yru30 span.svelte-7yru30{font-size:2rem}}.hero.svelte-7yru30 p.svelte-7yru30{max-width:500px;color:#A9A9A9;margin-top:1.5rem}@media only screen and (max-width: 720px){.hero.svelte-7yru30 p.svelte-7yru30{margin-top:1rem}}a.svelte-7yru30.svelte-7yru30{width:-webkit-max-content;width:-moz-max-content;width:max-content;text-decoration:none;color:#CDCDCD;display:flex;align-items:center;margin-bottom:8em;padding-left:0.5em;z-index:1}@media only screen and (max-width: 1280px){a.svelte-7yru30.svelte-7yru30{margin-bottom:10em}}a.svelte-7yru30.svelte-7yru30:hover{color:#0094FF}svg.svelte-7yru30.svelte-7yru30{position:absolute;bottom:-420px;right:-300px;z-index:0}',
  map: `{"version":3,"file":"Home.svelte","sources":["Home.svelte"],"sourcesContent":["<script>\\r\\n\\timport AnimatedCircles from '../elements/AnimatedCircles.svelte';\\r\\n\\r\\n\\timport ArrowIcon from '../svg/ArrowIcon.svelte';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section id=\\"home\\" class=\\"main\\">\\r\\n\\t\\t<div class=\\"container\\">\\r\\n\\t\\t\\t<div class=\\"hero\\">\\r\\n\\t\\t\\t\\t<h1>Gautham Krishna</h1>\\r\\n\\t\\t\\t\\t<span>I create simply beautiful code.</span>\\r\\n\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\tI\u2019m a freelance <strong>developer</strong> and <strong>designer</strong> specializing in\\r\\n\\t\\t\\t\\t\\tbuilding\\r\\n\\t\\t\\t\\t\\t<strong>artisan digital experiances</strong> and <strong>passionate</strong> about\\r\\n\\t\\t\\t\\t\\tbuilding <strong>creative</strong>, <strong>user-centered designs</strong>.\\r\\n\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<a href=\\"#works\\" class=\\"btn-anim\\">My Works<ArrowIcon direction=\\"down\\" /></a>\\r\\n\\t\\t\\t<svg\\r\\n\\t\\t\\t\\twidth=\\"470\\"\\r\\n\\t\\t\\t\\theight=\\"838\\"\\r\\n\\t\\t\\t\\tviewBox=\\"0 0 470 838\\"\\r\\n\\t\\t\\t\\tfill=\\"none\\"\\r\\n\\t\\t\\t\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t\\t<rect\\r\\n\\t\\t\\t\\t\\tx=\\"50.2046\\"\\r\\n\\t\\t\\t\\t\\ty=\\"468.757\\"\\r\\n\\t\\t\\t\\t\\twidth=\\"70\\"\\r\\n\\t\\t\\t\\t\\theight=\\"591.923\\"\\r\\n\\t\\t\\t\\t\\ttransform=\\"rotate(-135 50.2046 468.757)\\"\\r\\n\\t\\t\\t\\t\\tstroke=\\"#353535\\"\\r\\n\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t<rect\\r\\n\\t\\t\\t\\t\\tx=\\"51.0638\\"\\r\\n\\t\\t\\t\\t\\ty=\\"468.561\\"\\r\\n\\t\\t\\t\\t\\twidth=\\"70\\"\\r\\n\\t\\t\\t\\t\\theight=\\"520.708\\"\\r\\n\\t\\t\\t\\t\\ttransform=\\"rotate(-45 51.0638 468.561)\\"\\r\\n\\t\\t\\t\\t\\tstroke=\\"#353535\\"\\r\\n\\t\\t\\t\\t/>\\r\\n\\t\\t\\t</svg>\\r\\n\\t\\t\\t<AnimatedCircles />\\r\\n\\t\\t</div>\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  display: flex;\\n  flex-direction: column;\\n  position: relative;\\n}\\n\\n.hero {\\n  z-index: 5;\\n  margin: auto 0;\\n}\\n.hero span {\\n  color: #A9A9A9;\\n  font-family: \\"segoeui-bold\\", \\"Segoe UI\\", san-serif;\\n  font-weight: bolder;\\n  font-size: 3.5rem;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .hero span {\\n    font-size: 3rem;\\n    line-height: 100%;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .hero span {\\n    font-size: 2rem;\\n  }\\n}\\n.hero p {\\n  max-width: 500px;\\n  color: #A9A9A9;\\n  margin-top: 1.5rem;\\n}\\n@media only screen and (max-width: 720px) {\\n  .hero p {\\n    margin-top: 1rem;\\n  }\\n}\\n\\na {\\n  width: -webkit-max-content;\\n  width: -moz-max-content;\\n  width: max-content;\\n  text-decoration: none;\\n  color: #CDCDCD;\\n  display: flex;\\n  align-items: center;\\n  margin-bottom: 8em;\\n  padding-left: 0.5em;\\n  z-index: 1;\\n}\\n@media only screen and (max-width: 1280px) {\\n  a {\\n    margin-bottom: 10em;\\n  }\\n}\\na:hover {\\n  color: #0094FF;\\n}\\n\\nsvg {\\n  position: absolute;\\n  bottom: -420px;\\n  right: -300px;\\n  z-index: 0;\\n}</style>\\r\\n"],"names":[],"mappings":"AAiDmB,UAAU,4BAAC,CAAC,AAC7B,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,QAAQ,CAAE,QAAQ,AACpB,CAAC,AAED,KAAK,4BAAC,CAAC,AACL,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,IAAI,CAAC,CAAC,AAChB,CAAC,AACD,mBAAK,CAAC,IAAI,cAAC,CAAC,AACV,KAAK,CAAE,OAAO,CACd,WAAW,CAAE,cAAc,CAAC,CAAC,UAAU,CAAC,CAAC,SAAS,CAClD,WAAW,CAAE,MAAM,CACnB,SAAS,CAAE,MAAM,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,mBAAK,CAAC,IAAI,cAAC,CAAC,AACV,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,AACnB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,mBAAK,CAAC,IAAI,cAAC,CAAC,AACV,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,mBAAK,CAAC,CAAC,cAAC,CAAC,AACP,SAAS,CAAE,KAAK,CAChB,KAAK,CAAE,OAAO,CACd,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,mBAAK,CAAC,CAAC,cAAC,CAAC,AACP,UAAU,CAAE,IAAI,AAClB,CAAC,AACH,CAAC,AAED,CAAC,4BAAC,CAAC,AACD,KAAK,CAAE,mBAAmB,CAC1B,KAAK,CAAE,gBAAgB,CACvB,KAAK,CAAE,WAAW,CAClB,eAAe,CAAE,IAAI,CACrB,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,GAAG,CAClB,YAAY,CAAE,KAAK,CACnB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,CAAC,4BAAC,CAAC,AACD,aAAa,CAAE,IAAI,AACrB,CAAC,AACH,CAAC,AACD,6BAAC,MAAM,AAAC,CAAC,AACP,KAAK,CAAE,OAAO,AAChB,CAAC,AAED,GAAG,4BAAC,CAAC,AACH,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,CACb,OAAO,CAAE,CAAC,AACZ,CAAC"}`
};
var Home = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$j);
  return `<section id="${"home"}" class="${"main"}"><div class="${"container svelte-7yru30"}"><div class="${"hero svelte-7yru30"}"><h1>Gautham Krishna</h1>
				<span class="${"svelte-7yru30"}">I create simply beautiful code.</span>
				<p class="${"svelte-7yru30"}">I\u2019m a freelance <strong>developer</strong> and <strong>designer</strong> specializing in
					building
					<strong>artisan digital experiances</strong> and <strong>passionate</strong> about
					building <strong>creative</strong>, <strong>user-centered designs</strong>.
				</p></div>
			<a href="${"#works"}" class="${"btn-anim svelte-7yru30"}">My Works${validate_component(ArrowIcon, "ArrowIcon").$$render($$result, { direction: "down" }, {}, {})}</a>
			<svg width="${"470"}" height="${"838"}" viewBox="${"0 0 470 838"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-7yru30"}"><rect x="${"50.2046"}" y="${"468.757"}" width="${"70"}" height="${"591.923"}" transform="${"rotate(-135 50.2046 468.757)"}" stroke="${"#353535"}"></rect><rect x="${"51.0638"}" y="${"468.561"}" width="${"70"}" height="${"520.708"}" transform="${"rotate(-45 51.0638 468.561)"}" stroke="${"#353535"}"></rect></svg>
			${validate_component(AnimatedCircles, "AnimatedCircles").$$render($$result, {}, {}, {})}</div>
	</section>`;
});
var css$i = {
  code: "svg.svelte-15fcrtt path.svelte-15fcrtt{transition:0.2s ease-in}",
  map: '{"version":3,"file":"Githubv2Icon.svelte","sources":["Githubv2Icon.svelte"],"sourcesContent":["<svg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\r\\n\\t<path\\r\\n\\t\\tfill-rule=\\"evenodd\\"\\r\\n\\t\\tclip-rule=\\"evenodd\\"\\r\\n\\t\\td=\\"M12 1.545C5.945 1.545 1.043 6.422 1.043 12.428C1.043 16.838 3.686 20.633 7.49 22.34C7.888 22.519 8.277 22.448 8.581 22.22C8.74912 22.0891 8.88464 21.921 8.97694 21.7289C9.06924 21.5369 9.11581 21.3261 9.113 21.113V20.543L7.756 20.359C7.74595 20.3576 7.73595 20.356 7.726 20.354C6.978 20.208 6.473 19.945 6.103 19.566C5.792 19.247 5.602 18.865 5.441 18.541L5.385 18.428C5.2362 18.1176 5.0737 17.814 4.898 17.518C4.763 17.304 4.658 17.194 4.554 17.125C4.29 16.95 4.036 16.653 4.036 16.282C4.0351 16.1752 4.05796 16.0696 4.10293 15.9727C4.1479 15.8759 4.21385 15.7902 4.296 15.722C4.45106 15.5992 4.6443 15.5348 4.842 15.54C5.064 15.54 5.273 15.608 5.447 15.686C5.625 15.766 5.802 15.872 5.967 15.982C6.369 16.25 6.765 16.567 7.1 16.958C7.449 17.364 7.696 17.622 8.068 17.675C8.374 17.719 8.686 17.72 8.929 17.709C8.96277 17.5166 9.01847 17.3287 9.095 17.149C8.79821 17.0797 8.50544 16.9943 8.218 16.893C7.564 16.661 6.835 16.3 6.345 15.753C5.807 15.151 5.474 14.614 5.288 13.986C5.107 13.374 5.077 12.711 5.077 11.895C5.077 10.645 5.618 9.592 6.024 9.033C5.86801 8.5436 5.7559 8.04128 5.689 7.532C5.64469 7.21083 5.64503 6.88508 5.69 6.564C5.74 6.271 5.865 5.911 6.194 5.694C6.511 5.483 6.883 5.492 7.173 5.546C7.474 5.603 7.787 5.728 8.075 5.871C8.544 6.103 9.01 6.413 9.359 6.676C9.961 6.499 11.026 6.271 11.989 6.25H12.011C12.975 6.271 13.992 6.499 14.579 6.675C14.929 6.413 15.394 6.102 15.862 5.871C16.15 5.728 16.462 5.603 16.764 5.546C17.054 5.492 17.426 5.483 17.744 5.693C18.072 5.911 18.198 6.271 18.247 6.564C18.298 6.869 18.286 7.21 18.247 7.532C18.1804 8.04125 18.0686 8.54356 17.913 9.033C18.319 9.593 18.86 10.646 18.86 11.895C18.86 12.711 18.83 13.374 18.65 13.985C18.463 14.615 18.13 15.151 17.592 15.753C17.102 16.3 16.373 16.661 15.719 16.893C15.3718 17.015 15.0171 17.1142 14.657 17.19C14.78 17.562 14.824 17.863 14.824 18.036V21.126C14.824 21.596 15.043 21.997 15.354 22.231C15.656 22.46 16.044 22.531 16.442 22.357C20.282 20.665 22.956 16.86 22.956 12.427C22.956 6.422 18.056 1.545 12 1.545ZM9.476 18.71C9.216 18.747 9.475 18.71 9.475 18.71H9.472L9.464 18.712L9.435 18.716C9.28647 18.7335 9.13738 18.7458 8.988 18.753C8.706 18.766 8.319 18.767 7.922 18.71C7.131 18.598 6.65 18.038 6.339 17.674L6.309 17.64C6.20732 17.522 6.09809 17.4108 5.982 17.307C6.085 17.497 6.192 17.709 6.307 17.937L6.317 17.957L6.368 18.061C6.543 18.409 6.658 18.641 6.849 18.835C7.035 19.025 7.325 19.209 7.911 19.325L9.705 19.568C9.8303 19.585 9.94518 19.6468 10.0283 19.7421C10.1114 19.8374 10.1572 19.9596 10.157 20.086V21.113C10.157 21.913 9.782 22.626 9.207 23.058C8.90511 23.2887 8.54598 23.4326 8.16833 23.4742C7.79069 23.5157 7.40885 23.4535 7.064 23.294C2.902 21.427 0 17.27 0 12.428C0 5.836 5.377 0.5 12 0.5C18.623 0.5 24 5.836 24 12.428C24 17.295 21.061 21.463 16.863 23.314C16.5179 23.4704 16.1367 23.5301 15.7603 23.4866C15.3839 23.4431 15.0264 23.298 14.726 23.067C14.429 22.8384 14.1891 22.544 14.0249 22.2071C13.8608 21.8702 13.777 21.4998 13.78 21.125V18.035C13.78 17.965 13.731 17.561 13.458 17.018C13.4203 16.9427 13.4013 16.8594 13.4027 16.7753C13.404 16.6911 13.4256 16.6084 13.4656 16.5344C13.5056 16.4603 13.5629 16.397 13.6326 16.3497C13.7023 16.3025 13.7824 16.2727 13.866 16.263C14.209 16.225 14.787 16.114 15.37 15.907C15.964 15.697 16.497 15.409 16.814 15.055C17.285 14.529 17.52 14.125 17.649 13.688C17.783 13.235 17.817 12.708 17.817 11.895C17.817 10.754 17.217 9.795 16.941 9.486C16.8783 9.41617 16.8356 9.33077 16.8173 9.23875C16.799 9.14673 16.8058 9.05149 16.837 8.963C16.977 8.569 17.147 7.956 17.212 7.409C17.244 7.134 17.246 6.904 17.218 6.738C17.2117 6.67731 17.1934 6.61848 17.164 6.565C17.0952 6.55309 17.0246 6.55616 16.957 6.574C16.787 6.606 16.57 6.686 16.324 6.808C15.834 7.05 15.324 7.408 15.008 7.664C14.9383 7.72054 14.8552 7.75808 14.7667 7.77297C14.6782 7.78787 14.5874 7.77961 14.503 7.749C13.6933 7.48415 12.8511 7.33172 12 7.296C10.993 7.32 9.831 7.606 9.434 7.749C9.34964 7.77961 9.2588 7.78787 9.17031 7.77297C9.08182 7.75808 8.99869 7.72054 8.929 7.664C8.52034 7.335 8.07942 7.0482 7.613 6.808C7.41271 6.70282 7.19959 6.62416 6.979 6.574C6.91177 6.5563 6.84152 6.55323 6.773 6.565C6.74361 6.61847 6.72524 6.6773 6.719 6.738C6.691 6.904 6.693 7.134 6.725 7.409C6.79 7.956 6.961 8.569 7.1 8.963C7.163 9.143 7.124 9.343 6.996 9.486C6.72 9.795 6.12 10.754 6.12 11.895C6.12 12.707 6.154 13.235 6.288 13.688C6.418 14.125 6.652 14.528 7.122 15.055C7.44 15.409 7.972 15.697 8.567 15.907C9.05377 16.0793 9.55768 16.1986 10.07 16.263C10.1754 16.2743 10.2749 16.3174 10.3552 16.3867C10.4354 16.4559 10.4928 16.5479 10.5195 16.6505C10.5462 16.7531 10.541 16.8614 10.5047 16.961C10.4683 17.0606 10.4025 17.1467 10.316 17.208C10.151 17.326 10.042 17.538 9.981 17.783C9.94951 17.9091 9.93075 18.0381 9.925 18.168V18.187C9.92628 18.3138 9.88144 18.4367 9.79885 18.5329C9.71626 18.6291 9.60152 18.6921 9.476 18.71Z\\"\\r\\n\\t\\tfill=\\"white\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg path {\\n  transition: 0.2s ease-in;\\n}</style>\\r\\n"],"names":[],"mappings":"AASmB,kBAAG,CAAC,IAAI,eAAC,CAAC,AAC3B,UAAU,CAAE,IAAI,CAAC,OAAO,AAC1B,CAAC"}'
};
var Githubv2Icon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$i);
  return `<svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-15fcrtt"}"><path fill-rule="${"evenodd"}" clip-rule="${"evenodd"}" d="${"M12 1.545C5.945 1.545 1.043 6.422 1.043 12.428C1.043 16.838 3.686 20.633 7.49 22.34C7.888 22.519 8.277 22.448 8.581 22.22C8.74912 22.0891 8.88464 21.921 8.97694 21.7289C9.06924 21.5369 9.11581 21.3261 9.113 21.113V20.543L7.756 20.359C7.74595 20.3576 7.73595 20.356 7.726 20.354C6.978 20.208 6.473 19.945 6.103 19.566C5.792 19.247 5.602 18.865 5.441 18.541L5.385 18.428C5.2362 18.1176 5.0737 17.814 4.898 17.518C4.763 17.304 4.658 17.194 4.554 17.125C4.29 16.95 4.036 16.653 4.036 16.282C4.0351 16.1752 4.05796 16.0696 4.10293 15.9727C4.1479 15.8759 4.21385 15.7902 4.296 15.722C4.45106 15.5992 4.6443 15.5348 4.842 15.54C5.064 15.54 5.273 15.608 5.447 15.686C5.625 15.766 5.802 15.872 5.967 15.982C6.369 16.25 6.765 16.567 7.1 16.958C7.449 17.364 7.696 17.622 8.068 17.675C8.374 17.719 8.686 17.72 8.929 17.709C8.96277 17.5166 9.01847 17.3287 9.095 17.149C8.79821 17.0797 8.50544 16.9943 8.218 16.893C7.564 16.661 6.835 16.3 6.345 15.753C5.807 15.151 5.474 14.614 5.288 13.986C5.107 13.374 5.077 12.711 5.077 11.895C5.077 10.645 5.618 9.592 6.024 9.033C5.86801 8.5436 5.7559 8.04128 5.689 7.532C5.64469 7.21083 5.64503 6.88508 5.69 6.564C5.74 6.271 5.865 5.911 6.194 5.694C6.511 5.483 6.883 5.492 7.173 5.546C7.474 5.603 7.787 5.728 8.075 5.871C8.544 6.103 9.01 6.413 9.359 6.676C9.961 6.499 11.026 6.271 11.989 6.25H12.011C12.975 6.271 13.992 6.499 14.579 6.675C14.929 6.413 15.394 6.102 15.862 5.871C16.15 5.728 16.462 5.603 16.764 5.546C17.054 5.492 17.426 5.483 17.744 5.693C18.072 5.911 18.198 6.271 18.247 6.564C18.298 6.869 18.286 7.21 18.247 7.532C18.1804 8.04125 18.0686 8.54356 17.913 9.033C18.319 9.593 18.86 10.646 18.86 11.895C18.86 12.711 18.83 13.374 18.65 13.985C18.463 14.615 18.13 15.151 17.592 15.753C17.102 16.3 16.373 16.661 15.719 16.893C15.3718 17.015 15.0171 17.1142 14.657 17.19C14.78 17.562 14.824 17.863 14.824 18.036V21.126C14.824 21.596 15.043 21.997 15.354 22.231C15.656 22.46 16.044 22.531 16.442 22.357C20.282 20.665 22.956 16.86 22.956 12.427C22.956 6.422 18.056 1.545 12 1.545ZM9.476 18.71C9.216 18.747 9.475 18.71 9.475 18.71H9.472L9.464 18.712L9.435 18.716C9.28647 18.7335 9.13738 18.7458 8.988 18.753C8.706 18.766 8.319 18.767 7.922 18.71C7.131 18.598 6.65 18.038 6.339 17.674L6.309 17.64C6.20732 17.522 6.09809 17.4108 5.982 17.307C6.085 17.497 6.192 17.709 6.307 17.937L6.317 17.957L6.368 18.061C6.543 18.409 6.658 18.641 6.849 18.835C7.035 19.025 7.325 19.209 7.911 19.325L9.705 19.568C9.8303 19.585 9.94518 19.6468 10.0283 19.7421C10.1114 19.8374 10.1572 19.9596 10.157 20.086V21.113C10.157 21.913 9.782 22.626 9.207 23.058C8.90511 23.2887 8.54598 23.4326 8.16833 23.4742C7.79069 23.5157 7.40885 23.4535 7.064 23.294C2.902 21.427 0 17.27 0 12.428C0 5.836 5.377 0.5 12 0.5C18.623 0.5 24 5.836 24 12.428C24 17.295 21.061 21.463 16.863 23.314C16.5179 23.4704 16.1367 23.5301 15.7603 23.4866C15.3839 23.4431 15.0264 23.298 14.726 23.067C14.429 22.8384 14.1891 22.544 14.0249 22.2071C13.8608 21.8702 13.777 21.4998 13.78 21.125V18.035C13.78 17.965 13.731 17.561 13.458 17.018C13.4203 16.9427 13.4013 16.8594 13.4027 16.7753C13.404 16.6911 13.4256 16.6084 13.4656 16.5344C13.5056 16.4603 13.5629 16.397 13.6326 16.3497C13.7023 16.3025 13.7824 16.2727 13.866 16.263C14.209 16.225 14.787 16.114 15.37 15.907C15.964 15.697 16.497 15.409 16.814 15.055C17.285 14.529 17.52 14.125 17.649 13.688C17.783 13.235 17.817 12.708 17.817 11.895C17.817 10.754 17.217 9.795 16.941 9.486C16.8783 9.41617 16.8356 9.33077 16.8173 9.23875C16.799 9.14673 16.8058 9.05149 16.837 8.963C16.977 8.569 17.147 7.956 17.212 7.409C17.244 7.134 17.246 6.904 17.218 6.738C17.2117 6.67731 17.1934 6.61848 17.164 6.565C17.0952 6.55309 17.0246 6.55616 16.957 6.574C16.787 6.606 16.57 6.686 16.324 6.808C15.834 7.05 15.324 7.408 15.008 7.664C14.9383 7.72054 14.8552 7.75808 14.7667 7.77297C14.6782 7.78787 14.5874 7.77961 14.503 7.749C13.6933 7.48415 12.8511 7.33172 12 7.296C10.993 7.32 9.831 7.606 9.434 7.749C9.34964 7.77961 9.2588 7.78787 9.17031 7.77297C9.08182 7.75808 8.99869 7.72054 8.929 7.664C8.52034 7.335 8.07942 7.0482 7.613 6.808C7.41271 6.70282 7.19959 6.62416 6.979 6.574C6.91177 6.5563 6.84152 6.55323 6.773 6.565C6.74361 6.61847 6.72524 6.6773 6.719 6.738C6.691 6.904 6.693 7.134 6.725 7.409C6.79 7.956 6.961 8.569 7.1 8.963C7.163 9.143 7.124 9.343 6.996 9.486C6.72 9.795 6.12 10.754 6.12 11.895C6.12 12.707 6.154 13.235 6.288 13.688C6.418 14.125 6.652 14.528 7.122 15.055C7.44 15.409 7.972 15.697 8.567 15.907C9.05377 16.0793 9.55768 16.1986 10.07 16.263C10.1754 16.2743 10.2749 16.3174 10.3552 16.3867C10.4354 16.4559 10.4928 16.5479 10.5195 16.6505C10.5462 16.7531 10.541 16.8614 10.5047 16.961C10.4683 17.0606 10.4025 17.1467 10.316 17.208C10.151 17.326 10.042 17.538 9.981 17.783C9.94951 17.9091 9.93075 18.0381 9.925 18.168V18.187C9.92628 18.3138 9.88144 18.4367 9.79885 18.5329C9.71626 18.6291 9.60152 18.6921 9.476 18.71Z"}" fill="${"white"}" class="${"svelte-15fcrtt"}"></path></svg>`;
});
var css$h = {
  code: "svg.svelte-15fcrtt path.svelte-15fcrtt{transition:0.2s ease-in}",
  map: '{"version":3,"file":"VisitSiteIcon.svelte","sources":["VisitSiteIcon.svelte"],"sourcesContent":["<svg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\r\\n\\t<path\\r\\n\\t\\td=\\"M20 4L10 14M10 6H6C5.46957 6 4.96086 6.21071 4.58579 6.58579C4.21071 6.96086 4 7.46957 4 8V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V14L10 6ZM14 4H20H14ZM20 4V10V4Z\\"\\r\\n\\t\\tstroke=\\"white\\"\\r\\n\\t\\tstroke-width=\\"2\\"\\r\\n\\t\\tstroke-linecap=\\"round\\"\\r\\n\\t\\tstroke-linejoin=\\"round\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg path {\\n  transition: 0.2s ease-in;\\n}</style>\\r\\n"],"names":[],"mappings":"AAUmB,kBAAG,CAAC,IAAI,eAAC,CAAC,AAC3B,UAAU,CAAE,IAAI,CAAC,OAAO,AAC1B,CAAC"}'
};
var VisitSiteIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$h);
  return `<svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-15fcrtt"}"><path d="${"M20 4L10 14M10 6H6C5.46957 6 4.96086 6.21071 4.58579 6.58579C4.21071 6.96086 4 7.46957 4 8V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V14L10 6ZM14 4H20H14ZM20 4V10V4Z"}" stroke="${"white"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"svelte-15fcrtt"}"></path></svg>`;
});
var css$g = {
  code: ".preveiewImageContainer.svelte-13bpjzt.svelte-13bpjzt{width:40%;max-width:460px}@media only screen and (max-width: 1280px){.preveiewImageContainer.svelte-13bpjzt.svelte-13bpjzt{width:100%}}.preveiewImageContainer.svelte-13bpjzt img.svelte-13bpjzt{width:100%;image-rendering:crisp-edges}.projectContainer.svelte-13bpjzt.svelte-13bpjzt{width:100%;height:350px;display:flex;justify-content:center;align-items:flex-start;text-align:right;margin-top:4em}@media only screen and (max-width: 1280px){.projectContainer.svelte-13bpjzt.svelte-13bpjzt{flex-direction:column;align-items:center;justify-content:flex-start;text-align:left;height:500px}}@media only screen and (max-width: 720px){.projectContainer.svelte-13bpjzt.svelte-13bpjzt{margin-top:2em;height:400px}}@media only screen and (min-width: 1600px){.projectContainer.svelte-13bpjzt.svelte-13bpjzt{height:440px}}.details.svelte-13bpjzt.svelte-13bpjzt{margin-left:-8em;margin-bottom:2em}@media only screen and (max-width: 1280px){.details.svelte-13bpjzt.svelte-13bpjzt{margin-left:0;margin-top:-8em;padding-top:1em;background-color:rgba(0, 0, 0, 0.7)}}.details.svelte-13bpjzt .projectno.svelte-13bpjzt{font-size:0.8rem}@media only screen and (max-width: 1280px){.details.svelte-13bpjzt .projectno.svelte-13bpjzt{margin-left:0.5em}}.details.svelte-13bpjzt h4.svelte-13bpjzt{margin:0.2em 0 0.6em}@media only screen and (max-width: 1280px){.details.svelte-13bpjzt h4.svelte-13bpjzt{margin-left:0.2em}}.details.svelte-13bpjzt p.svelte-13bpjzt{font-size:0.8rem;color:#CDCDCD;max-width:550px;line-height:140%;text-align:left;background-color:#1F1F1F;padding:2em 2.5em;box-shadow:rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px}@media only screen and (max-width: 720px){.details.svelte-13bpjzt p.svelte-13bpjzt{padding:1em 1.2em;line-height:120%}}.details.svelte-13bpjzt .btncontainer.svelte-13bpjzt{display:flex;justify-content:flex-end;gap:2em}@media only screen and (max-width: 1280px){.details.svelte-13bpjzt .btncontainer.svelte-13bpjzt{justify-content:center}}.details.svelte-13bpjzt button.svelte-13bpjzt{cursor:pointer;color:#FFFFFF;display:flex;align-items:center}.details.svelte-13bpjzt button span.svelte-13bpjzt{transition:0.2s ease-in;margin-top:0.3em;margin-left:0.3em;font-size:1.2rem}@media only screen and (max-width: 720px){.details.svelte-13bpjzt button span.svelte-13bpjzt{font-size:0.8rem;margin-top:1em}}",
  map: `{"version":3,"file":"Project.svelte","sources":["Project.svelte"],"sourcesContent":["<script>\\r\\n\\timport Githubv2Icon from '../svg/Githubv2Icon.svelte';\\r\\n\\timport VisitSiteIcon from '../svg/VisitSiteIcon.svelte';\\r\\n\\texport let project, current;\\r\\n\\r\\n\\tfunction handleOnLoad() {\\r\\n\\t\\tconsole.log('Image loaded');\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"projectContainer\\">\\r\\n\\t<div class=\\"preveiewImageContainer\\">\\r\\n\\t\\t<img on:load={handleOnLoad()} src={project.img} alt=\\"\\" />\\r\\n\\t</div>\\r\\n\\t<div class=\\"details\\">\\r\\n\\t\\t<span class=\\"projectno\\">Project {current + 1}</span>\\r\\n\\t\\t<h4>{project.Name}</h4>\\r\\n\\t\\t<p>{@html project.desc}</p>\\r\\n\\t\\t<div class=\\"btncontainer\\">\\r\\n\\t\\t\\t<a href={project.repo}>\\r\\n\\t\\t\\t\\t<button class=\\"btn-anim\\" tabindex=\\"-1\\">\\r\\n\\t\\t\\t\\t\\t<Githubv2Icon />\\r\\n\\t\\t\\t\\t\\t<span>Visit Repo</span>\\r\\n\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t</a>\\r\\n\\t\\t\\t<a href={project.site}>\\r\\n\\t\\t\\t\\t<button class=\\"btn-anim\\" tabindex=\\"-1\\">\\r\\n\\t\\t\\t\\t\\t<VisitSiteIcon />\\r\\n\\t\\t\\t\\t\\t<span>Visit Site</span>\\r\\n\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t</a>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.preveiewImageContainer {\\n  width: 40%;\\n  max-width: 460px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .preveiewImageContainer {\\n    width: 100%;\\n  }\\n}\\n.preveiewImageContainer img {\\n  width: 100%;\\n  image-rendering: crisp-edges;\\n}\\n\\n.projectContainer {\\n  width: 100%;\\n  height: 350px;\\n  display: flex;\\n  justify-content: center;\\n  align-items: flex-start;\\n  text-align: right;\\n  margin-top: 4em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .projectContainer {\\n    flex-direction: column;\\n    align-items: center;\\n    justify-content: flex-start;\\n    text-align: left;\\n    height: 500px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .projectContainer {\\n    margin-top: 2em;\\n    height: 400px;\\n  }\\n}\\n@media only screen and (min-width: 1600px) {\\n  .projectContainer {\\n    height: 440px;\\n  }\\n}\\n\\n.details {\\n  margin-left: -8em;\\n  margin-bottom: 2em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .details {\\n    margin-left: 0;\\n    margin-top: -8em;\\n    padding-top: 1em;\\n    background-color: rgba(0, 0, 0, 0.7);\\n  }\\n}\\n.details .projectno {\\n  font-size: 0.8rem;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .details .projectno {\\n    margin-left: 0.5em;\\n  }\\n}\\n.details h4 {\\n  margin: 0.2em 0 0.6em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .details h4 {\\n    margin-left: 0.2em;\\n  }\\n}\\n.details p {\\n  font-size: 0.8rem;\\n  color: #CDCDCD;\\n  max-width: 550px;\\n  line-height: 140%;\\n  text-align: left;\\n  background-color: #1F1F1F;\\n  padding: 2em 2.5em;\\n  box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;\\n}\\n@media only screen and (max-width: 720px) {\\n  .details p {\\n    padding: 1em 1.2em;\\n    line-height: 120%;\\n  }\\n}\\n.details .btncontainer {\\n  display: flex;\\n  justify-content: flex-end;\\n  gap: 2em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .details .btncontainer {\\n    justify-content: center;\\n  }\\n}\\n.details button {\\n  cursor: pointer;\\n  color: #FFFFFF;\\n  display: flex;\\n  align-items: center;\\n}\\n.details button span {\\n  transition: 0.2s ease-in;\\n  margin-top: 0.3em;\\n  margin-left: 0.3em;\\n  font-size: 1.2rem;\\n}\\n@media only screen and (max-width: 720px) {\\n  .details button span {\\n    font-size: 0.8rem;\\n    margin-top: 1em;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAmCmB,uBAAuB,8BAAC,CAAC,AAC1C,KAAK,CAAE,GAAG,CACV,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,uBAAuB,8BAAC,CAAC,AACvB,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACD,sCAAuB,CAAC,GAAG,eAAC,CAAC,AAC3B,KAAK,CAAE,IAAI,CACX,eAAe,CAAE,WAAW,AAC9B,CAAC,AAED,iBAAiB,8BAAC,CAAC,AACjB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,UAAU,CACvB,UAAU,CAAE,KAAK,CACjB,UAAU,CAAE,GAAG,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,iBAAiB,8BAAC,CAAC,AACjB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,UAAU,CAC3B,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,KAAK,AACf,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,iBAAiB,8BAAC,CAAC,AACjB,UAAU,CAAE,GAAG,CACf,MAAM,CAAE,KAAK,AACf,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,iBAAiB,8BAAC,CAAC,AACjB,MAAM,CAAE,KAAK,AACf,CAAC,AACH,CAAC,AAED,QAAQ,8BAAC,CAAC,AACR,WAAW,CAAE,IAAI,CACjB,aAAa,CAAE,GAAG,AACpB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,QAAQ,8BAAC,CAAC,AACR,WAAW,CAAE,CAAC,CACd,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,GAAG,CAChB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AACtC,CAAC,AACH,CAAC,AACD,uBAAQ,CAAC,UAAU,eAAC,CAAC,AACnB,SAAS,CAAE,MAAM,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,uBAAQ,CAAC,UAAU,eAAC,CAAC,AACnB,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AACD,uBAAQ,CAAC,EAAE,eAAC,CAAC,AACX,MAAM,CAAE,KAAK,CAAC,CAAC,CAAC,KAAK,AACvB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,uBAAQ,CAAC,EAAE,eAAC,CAAC,AACX,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AACD,uBAAQ,CAAC,CAAC,eAAC,CAAC,AACV,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,IAAI,CACjB,UAAU,CAAE,IAAI,CAChB,gBAAgB,CAAE,OAAO,CACzB,OAAO,CAAE,GAAG,CAAC,KAAK,CAClB,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,IAAI,AAClF,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,uBAAQ,CAAC,CAAC,eAAC,CAAC,AACV,OAAO,CAAE,GAAG,CAAC,KAAK,CAClB,WAAW,CAAE,IAAI,AACnB,CAAC,AACH,CAAC,AACD,uBAAQ,CAAC,aAAa,eAAC,CAAC,AACtB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,QAAQ,CACzB,GAAG,CAAE,GAAG,AACV,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,uBAAQ,CAAC,aAAa,eAAC,CAAC,AACtB,eAAe,CAAE,MAAM,AACzB,CAAC,AACH,CAAC,AACD,uBAAQ,CAAC,MAAM,eAAC,CAAC,AACf,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,uBAAQ,CAAC,MAAM,CAAC,IAAI,eAAC,CAAC,AACpB,UAAU,CAAE,IAAI,CAAC,OAAO,CACxB,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,KAAK,CAClB,SAAS,CAAE,MAAM,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,uBAAQ,CAAC,MAAM,CAAC,IAAI,eAAC,CAAC,AACpB,SAAS,CAAE,MAAM,CACjB,UAAU,CAAE,GAAG,AACjB,CAAC,AACH,CAAC"}`
};
var Project = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { project, current } = $$props;
  if ($$props.project === void 0 && $$bindings.project && project !== void 0)
    $$bindings.project(project);
  if ($$props.current === void 0 && $$bindings.current && current !== void 0)
    $$bindings.current(current);
  $$result.css.add(css$g);
  return `<div class="${"projectContainer svelte-13bpjzt"}"><div class="${"preveiewImageContainer svelte-13bpjzt"}"><img${add_attribute("src", project.img, 0)} alt="${""}" class="${"svelte-13bpjzt"}"></div>
	<div class="${"details svelte-13bpjzt"}"><span class="${"projectno svelte-13bpjzt"}">Project ${escape(current + 1)}</span>
		<h4 class="${"svelte-13bpjzt"}">${escape(project.Name)}</h4>
		<p class="${"svelte-13bpjzt"}"><!-- HTML_TAG_START -->${project.desc}<!-- HTML_TAG_END --></p>
		<div class="${"btncontainer svelte-13bpjzt"}"><a${add_attribute("href", project.repo, 0)}><button class="${"btn-anim svelte-13bpjzt"}" tabindex="${"-1"}">${validate_component(Githubv2Icon, "Githubv2Icon").$$render($$result, {}, {}, {})}
					<span class="${"svelte-13bpjzt"}">Visit Repo</span></button></a>
			<a${add_attribute("href", project.site, 0)}><button class="${"btn-anim svelte-13bpjzt"}" tabindex="${"-1"}">${validate_component(VisitSiteIcon, "VisitSiteIcon").$$render($$result, {}, {}, {})}
					<span class="${"svelte-13bpjzt"}">Visit Site</span></button></a></div></div>
</div>`;
});
var css$f = {
  code: ".circlesContainer.svelte-1mw1wxz.svelte-1mw1wxz{width:100%;display:flex;justify-content:center;margin-top:2em;gap:2em}@media only screen and (max-width: 720px){.circlesContainer.svelte-1mw1wxz.svelte-1mw1wxz{margin-top:3em}}.circlesContainer.svelte-1mw1wxz svg.svelte-1mw1wxz{margin:0}.circlesContainer.svelte-1mw1wxz .current.svelte-1mw1wxz{transform:scale(1.2)}.circlesContainer.svelte-1mw1wxz .current circle.svelte-1mw1wxz{stroke:#0094FF}",
  map: `{"version":3,"file":"ProjectCircles.svelte","sources":["ProjectCircles.svelte"],"sourcesContent":["<script>\\r\\n\\texport let count;\\r\\n\\texport let current;\\r\\n\\r\\n\\tlet arr = [];\\r\\n\\tfor (let i = 0; i < count; i++) {\\r\\n\\t\\tarr.push(i);\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"circlesContainer\\">\\r\\n\\t{#each arr as circleNo}\\r\\n\\t\\t<svg\\r\\n\\t\\t\\tclass={circleNo === current ? 'current' : ''}\\r\\n\\t\\t\\twidth=\\"20\\"\\r\\n\\t\\t\\theight=\\"20\\"\\r\\n\\t\\t\\tviewBox=\\"0 0 20 20\\"\\r\\n\\t\\t\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<circle cx=\\"10\\" cy=\\"10\\" r=\\"9.5\\" stroke=\\"#A9A9A9\\" />\\r\\n\\t\\t</svg>\\r\\n\\t{/each}\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.circlesContainer {\\n  width: 100%;\\n  display: flex;\\n  justify-content: center;\\n  margin-top: 2em;\\n  gap: 2em;\\n}\\n@media only screen and (max-width: 720px) {\\n  .circlesContainer {\\n    margin-top: 3em;\\n  }\\n}\\n.circlesContainer svg {\\n  margin: 0;\\n}\\n.circlesContainer .current {\\n  transform: scale(1.2);\\n}\\n.circlesContainer .current circle {\\n  stroke: #0094FF;\\n}</style>\\r\\n"],"names":[],"mappings":"AAwBmB,iBAAiB,8BAAC,CAAC,AACpC,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,UAAU,CAAE,GAAG,CACf,GAAG,CAAE,GAAG,AACV,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,iBAAiB,8BAAC,CAAC,AACjB,UAAU,CAAE,GAAG,AACjB,CAAC,AACH,CAAC,AACD,gCAAiB,CAAC,GAAG,eAAC,CAAC,AACrB,MAAM,CAAE,CAAC,AACX,CAAC,AACD,gCAAiB,CAAC,QAAQ,eAAC,CAAC,AAC1B,SAAS,CAAE,MAAM,GAAG,CAAC,AACvB,CAAC,AACD,gCAAiB,CAAC,QAAQ,CAAC,MAAM,eAAC,CAAC,AACjC,MAAM,CAAE,OAAO,AACjB,CAAC"}`
};
var ProjectCircles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { count } = $$props;
  let { current } = $$props;
  let arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(i);
  }
  if ($$props.count === void 0 && $$bindings.count && count !== void 0)
    $$bindings.count(count);
  if ($$props.current === void 0 && $$bindings.current && current !== void 0)
    $$bindings.current(current);
  $$result.css.add(css$f);
  return `<div class="${"circlesContainer svelte-1mw1wxz"}">${each(arr, (circleNo) => `<svg class="${escape(null_to_empty(circleNo === current ? "current" : "")) + " svelte-1mw1wxz"}" width="${"20"}" height="${"20"}" viewBox="${"0 0 20 20"}" xmlns="${"http://www.w3.org/2000/svg"}"><circle cx="${"10"}" cy="${"10"}" r="${"9.5"}" stroke="${"#A9A9A9"}" class="${"svelte-1mw1wxz"}"></circle></svg>`)}
</div>`;
});
var projects = [
  {
    Name: "Kanakoot",
    img: "/images/kanakoot.jpg",
    desc: "A <strong>serverless web app</strong> to share your group expenses easily and find the financial statistics involved. I choose <strong>Typescript</strong> with <strong>Gatsby.js</strong> to build a static site. <strong>Sass</strong> for styling and <strong>Jest</strong> for testing the app. <strong>Chart.js</strong> for data visualisations in the calculated report. Used <strong>Google ananytics</strong> for measurements and <strong>Netlify</strong> to host the website.",
    site: "https://kanakoot.netlify.app/",
    repo: "https://github.com/gauthamkrishnax/Kanakoot"
  },
  {
    Name: "Pecker Note",
    img: "/images/peckernote.jpg",
    desc: "A minimal note making app with a beautiful user interface designed in <strong>Figma</strong>. Used <strong>Next.js</strong> with <strong>Sass</strong>, <strong>Post CSS</strong>, <strong>Framer motion</strong> and <strong>X-masonry</strong> for creating the frontend. <strong>Node.js</strong> with <strong>Express.js</strong> for the server and <strong>Passport.js</strong> for authentication. <strong>Mongodb Atlas</strong> for database and interfaced <strong>Moongoose</strong> as ODM. API server and frontend web app distributed using <strong>Docker</strong> in separate containers and hosted on <strong>Heroku</strong>.",
    site: "https://peckernote-web.herokuapp.com/",
    repo: "https://github.com/gauthamkrishnax/peckernote"
  }
];
var projectArchive = [
  {
    name: "ClockTab",
    desc: "A Browser extension that displays time and date information and makes you new tabs look slick.",
    site: "https://clocktabs.netlify.app/",
    repo: "https://github.com/gauthamkrishnax/clocktab"
  },
  {
    name: "SuperChat",
    desc: "A world chat forum that allows you to send and chat with your fellow netizens. ",
    site: "https://superchatgk.netlify.app/",
    repo: "https://github.com/gauthamkrishnax/superchat"
  },
  {
    name: "UI-Experiments",
    desc: "A collection of modern UI Components made using React.js",
    site: "https://ui-experiments.netlify.app/",
    repo: "https://github.com/gauthamkrishnax/ui-experiments"
  },
  {
    name: "Currency Converter",
    desc: "A React Native application to covert an amount from one currency to another.",
    site: "https://expo.dev/accounts/gauthamkrishna/projects/currencyConverter",
    repo: "https://github.com/gauthamkrishnax/currencyConverter"
  }
];
var css$e = {
  code: ".archivesContainer.svelte-19re9h9.svelte-19re9h9{position:relative;display:flex;flex-direction:column;align-items:center;margin:4em}@media only screen and (max-width: 1280px){.archivesContainer.svelte-19re9h9.svelte-19re9h9{margin:2em}}.archivesContainer.svelte-19re9h9 h4.svelte-19re9h9{letter-spacing:0.05em}@media only screen and (max-width: 1280px){.archivesContainer.svelte-19re9h9 h4.svelte-19re9h9{text-align:center}}.archivesContainer.svelte-19re9h9 div.subContainer.svelte-19re9h9{padding-right:1em;padding-bottom:4em;margin-top:1em;width:100%;max-width:800px;min-width:230px;height:257px;display:grid;grid-template-columns:1fr 1fr;gap:1em;overflow-y:scroll}@media only screen and (max-width: 1280px){.archivesContainer.svelte-19re9h9 div.subContainer.svelte-19re9h9{grid-template-columns:1fr;height:470px}}@media only screen and (max-width: 720px){.archivesContainer.svelte-19re9h9 div.subContainer.svelte-19re9h9{height:340px}}@media only screen and (min-width: 1600px){.archivesContainer.svelte-19re9h9 div.subContainer.svelte-19re9h9{height:350px}}.archivesContainer.svelte-19re9h9 div.subContainer .aProjectContainer.svelte-19re9h9{background-color:#1F1F1F;padding:1.5em}.archivesContainer.svelte-19re9h9 div.subContainer .aProjectContainer span.svelte-19re9h9:first-child{font-size:0.8rem}.archivesContainer.svelte-19re9h9 div.subContainer .aProjectContainer p.svelte-19re9h9{font-size:0.8rem;max-width:250px}.archivesContainer.svelte-19re9h9 div.subContainer .aProjectContainer h5.svelte-19re9h9{font-size:1.2rem;margin-top:0.2em;margin-bottom:0.5em;letter-spacing:0.05em}.archivesContainer.svelte-19re9h9 .btncontainer.svelte-19re9h9{display:flex;justify-content:flex-start;gap:2em;margin-top:2em}@media only screen and (max-width: 1280px){.archivesContainer.svelte-19re9h9 .btncontainer.svelte-19re9h9{gap:1em}}.archivesContainer.svelte-19re9h9 button.svelte-19re9h9{cursor:pointer;color:#FFFFFF;display:flex;align-items:center}.archivesContainer.svelte-19re9h9 button span.svelte-19re9h9{margin-top:0.3em;margin-left:0.3em;font-size:1rem}@media only screen and (max-width: 720px){.archivesContainer.svelte-19re9h9 button span.svelte-19re9h9{font-size:0.8rem}}",
  map: `{"version":3,"file":"ProjectArchives.svelte","sources":["ProjectArchives.svelte"],"sourcesContent":["<script>\\r\\n\\timport projectArchive from '../../data/projectArchive';\\r\\n\\timport Githubv2Icon from '../svg/Githubv2Icon.svelte';\\r\\n\\timport VisitSiteIcon from '../svg/VisitSiteIcon.svelte';\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"archivesContainer\\">\\r\\n\\t<h4>Project Archives</h4>\\r\\n\\t<div class=\\"subContainer\\">\\r\\n\\t\\t{#each projectArchive as project}\\r\\n\\t\\t\\t<div class=\\"aProjectContainer\\">\\r\\n\\t\\t\\t\\t<span>Project {1}</span>\\r\\n\\t\\t\\t\\t<h5>{project.name}</h5>\\r\\n\\t\\t\\t\\t<p>{project.desc}</p>\\r\\n\\t\\t\\t\\t<div class=\\"btncontainer\\">\\r\\n\\t\\t\\t\\t\\t<a href={project.repo}>\\r\\n\\t\\t\\t\\t\\t\\t<button class=\\"btn-anim\\" tabindex=\\"-1\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t<Githubv2Icon />\\r\\n\\t\\t\\t\\t\\t\\t\\t<span>Visit Repo</span>\\r\\n\\t\\t\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t\\t\\t</a>\\r\\n\\t\\t\\t\\t\\t<a href={project.site}>\\r\\n\\t\\t\\t\\t\\t\\t<button class=\\"btn-anim\\" tabindex=\\"-1\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t<VisitSiteIcon />\\r\\n\\t\\t\\t\\t\\t\\t\\t<span>Visit Site</span>\\r\\n\\t\\t\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t\\t\\t</a>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t{/each}\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.archivesContainer {\\n  position: relative;\\n  display: flex;\\n  flex-direction: column;\\n  align-items: center;\\n  margin: 4em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .archivesContainer {\\n    margin: 2em;\\n  }\\n}\\n.archivesContainer h4 {\\n  letter-spacing: 0.05em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .archivesContainer h4 {\\n    text-align: center;\\n  }\\n}\\n.archivesContainer div.subContainer {\\n  padding-right: 1em;\\n  padding-bottom: 4em;\\n  margin-top: 1em;\\n  width: 100%;\\n  max-width: 800px;\\n  min-width: 230px;\\n  height: 257px;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr;\\n  gap: 1em;\\n  overflow-y: scroll;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .archivesContainer div.subContainer {\\n    grid-template-columns: 1fr;\\n    height: 470px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .archivesContainer div.subContainer {\\n    height: 340px;\\n  }\\n}\\n@media only screen and (min-width: 1600px) {\\n  .archivesContainer div.subContainer {\\n    height: 350px;\\n  }\\n}\\n.archivesContainer div.subContainer .aProjectContainer {\\n  background-color: #1F1F1F;\\n  padding: 1.5em;\\n}\\n.archivesContainer div.subContainer .aProjectContainer span:first-child {\\n  font-size: 0.8rem;\\n}\\n.archivesContainer div.subContainer .aProjectContainer p {\\n  font-size: 0.8rem;\\n  max-width: 250px;\\n}\\n.archivesContainer div.subContainer .aProjectContainer h5 {\\n  font-size: 1.2rem;\\n  margin-top: 0.2em;\\n  margin-bottom: 0.5em;\\n  letter-spacing: 0.05em;\\n}\\n.archivesContainer .btncontainer {\\n  display: flex;\\n  justify-content: flex-start;\\n  gap: 2em;\\n  margin-top: 2em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .archivesContainer .btncontainer {\\n    gap: 1em;\\n  }\\n}\\n.archivesContainer button {\\n  cursor: pointer;\\n  color: #FFFFFF;\\n  display: flex;\\n  align-items: center;\\n}\\n.archivesContainer button span {\\n  margin-top: 0.3em;\\n  margin-left: 0.3em;\\n  font-size: 1rem;\\n}\\n@media only screen and (max-width: 720px) {\\n  .archivesContainer button span {\\n    font-size: 0.8rem;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAiCmB,kBAAkB,8BAAC,CAAC,AACrC,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,GAAG,AACb,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,kBAAkB,8BAAC,CAAC,AAClB,MAAM,CAAE,GAAG,AACb,CAAC,AACH,CAAC,AACD,iCAAkB,CAAC,EAAE,eAAC,CAAC,AACrB,cAAc,CAAE,MAAM,AACxB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,iCAAkB,CAAC,EAAE,eAAC,CAAC,AACrB,UAAU,CAAE,MAAM,AACpB,CAAC,AACH,CAAC,AACD,iCAAkB,CAAC,GAAG,aAAa,eAAC,CAAC,AACnC,aAAa,CAAE,GAAG,CAClB,cAAc,CAAE,GAAG,CACnB,UAAU,CAAE,GAAG,CACf,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,CAChB,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,GAAG,CAAC,GAAG,CAC9B,GAAG,CAAE,GAAG,CACR,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,iCAAkB,CAAC,GAAG,aAAa,eAAC,CAAC,AACnC,qBAAqB,CAAE,GAAG,CAC1B,MAAM,CAAE,KAAK,AACf,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,iCAAkB,CAAC,GAAG,aAAa,eAAC,CAAC,AACnC,MAAM,CAAE,KAAK,AACf,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,iCAAkB,CAAC,GAAG,aAAa,eAAC,CAAC,AACnC,MAAM,CAAE,KAAK,AACf,CAAC,AACH,CAAC,AACD,iCAAkB,CAAC,GAAG,aAAa,CAAC,kBAAkB,eAAC,CAAC,AACtD,gBAAgB,CAAE,OAAO,CACzB,OAAO,CAAE,KAAK,AAChB,CAAC,AACD,iCAAkB,CAAC,GAAG,aAAa,CAAC,kBAAkB,CAAC,mBAAI,YAAY,AAAC,CAAC,AACvE,SAAS,CAAE,MAAM,AACnB,CAAC,AACD,iCAAkB,CAAC,GAAG,aAAa,CAAC,kBAAkB,CAAC,CAAC,eAAC,CAAC,AACxD,SAAS,CAAE,MAAM,CACjB,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,iCAAkB,CAAC,GAAG,aAAa,CAAC,kBAAkB,CAAC,EAAE,eAAC,CAAC,AACzD,SAAS,CAAE,MAAM,CACjB,UAAU,CAAE,KAAK,CACjB,aAAa,CAAE,KAAK,CACpB,cAAc,CAAE,MAAM,AACxB,CAAC,AACD,iCAAkB,CAAC,aAAa,eAAC,CAAC,AAChC,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,UAAU,CAC3B,GAAG,CAAE,GAAG,CACR,UAAU,CAAE,GAAG,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,iCAAkB,CAAC,aAAa,eAAC,CAAC,AAChC,GAAG,CAAE,GAAG,AACV,CAAC,AACH,CAAC,AACD,iCAAkB,CAAC,MAAM,eAAC,CAAC,AACzB,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,iCAAkB,CAAC,MAAM,CAAC,IAAI,eAAC,CAAC,AAC9B,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,KAAK,CAClB,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,iCAAkB,CAAC,MAAM,CAAC,IAAI,eAAC,CAAC,AAC9B,SAAS,CAAE,MAAM,AACnB,CAAC,AACH,CAAC"}`
};
var ProjectArchives = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$e);
  return `<div class="${"archivesContainer svelte-19re9h9"}"><h4 class="${"svelte-19re9h9"}">Project Archives</h4>
	<div class="${"subContainer svelte-19re9h9"}">${each(projectArchive, (project) => `<div class="${"aProjectContainer svelte-19re9h9"}"><span class="${"svelte-19re9h9"}">Project ${escape(1)}</span>
				<h5 class="${"svelte-19re9h9"}">${escape(project.name)}</h5>
				<p class="${"svelte-19re9h9"}">${escape(project.desc)}</p>
				<div class="${"btncontainer svelte-19re9h9"}"><a${add_attribute("href", project.repo, 0)}><button class="${"btn-anim svelte-19re9h9"}" tabindex="${"-1"}">${validate_component(Githubv2Icon, "Githubv2Icon").$$render($$result, {}, {}, {})}
							<span class="${"svelte-19re9h9"}">Visit Repo</span>
						</button></a>
					<a${add_attribute("href", project.site, 0)}><button class="${"btn-anim svelte-19re9h9"}" tabindex="${"-1"}">${validate_component(VisitSiteIcon, "VisitSiteIcon").$$render($$result, {}, {}, {})}
							<span class="${"svelte-19re9h9"}">Visit Site</span></button>
					</a></div>
			</div>`)}</div>
</div>`;
});
var css$d = {
  code: ".container.svelte-13zykhb.svelte-13zykhb{position:relative}.projectCarousel.svelte-13zykhb.svelte-13zykhb{width:100%;height:100%}.nextProjectBtn.svelte-13zykhb.svelte-13zykhb{display:flex;justify-content:center;margin-top:1.5em}@media only screen and (max-width: 720px){.nextProjectBtn.svelte-13zykhb.svelte-13zykhb{margin-top:1em}}.nextProjectBtn.svelte-13zykhb button.svelte-13zykhb{cursor:pointer;margin-left:1em;display:flex;align-items:center;color:#CDCDCD}.nextProjectBtn.svelte-13zykhb button span.svelte-13zykhb{margin-bottom:-0.3px;transition:0.2s ease-in}.workContent.svelte-13zykhb.svelte-13zykhb{min-height:300px}",
  map: `{"version":3,"file":"Works.svelte","sources":["Works.svelte"],"sourcesContent":["<script>\\r\\n\\timport Project from '../elements/Project.svelte';\\r\\n\\timport ProjectCircles from '../elements/ProjectCircles.svelte';\\r\\n\\timport ArrowIcon from '../svg/ArrowIcon.svelte';\\r\\n\\timport projects from '../../data/projects';\\r\\n\\timport ProjectArchives from '../elements/ProjectArchives.svelte';\\r\\n\\r\\n\\tlet current = 0,\\r\\n\\t\\tprojectCount = projects.length;\\r\\n\\r\\n\\tfunction handleNextProjectBtn() {\\r\\n\\t\\tcurrent = current + 1;\\r\\n\\t\\tif (current == projectCount + 1) {\\r\\n\\t\\t\\tcurrent = 0;\\r\\n\\t\\t}\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section id=\\"works\\" class=\\"main\\">\\r\\n\\t\\t<div class=\\"container\\">\\r\\n\\t\\t\\t<h2>WORKS</h2>\\r\\n\\t\\t\\t<div class=\\"workContent\\">\\r\\n\\t\\t\\t\\t{#if current < projectCount}\\r\\n\\t\\t\\t\\t\\t<div class=\\"projectCarousel\\"><Project {current} project={projects[current]} /></div>\\r\\n\\t\\t\\t\\t{:else}\\r\\n\\t\\t\\t\\t\\t<div><ProjectArchives /></div>\\r\\n\\t\\t\\t\\t{/if}\\r\\n\\t\\t\\t\\t<div class=\\"carouselButtonContainer\\">\\r\\n\\t\\t\\t\\t\\t<ProjectCircles count={projectCount + 1} {current} />\\r\\n\\t\\t\\t\\t\\t<div class=\\"nextProjectBtn\\">\\r\\n\\t\\t\\t\\t\\t\\t<button class=\\"btn-anim\\" on:click={() => handleNextProjectBtn()}>\\r\\n\\t\\t\\t\\t\\t\\t\\t<span>Next Project</span><ArrowIcon />\\r\\n\\t\\t\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  position: relative;\\n}\\n\\n.projectCarousel {\\n  width: 100%;\\n  height: 100%;\\n}\\n\\n.nextProjectBtn {\\n  display: flex;\\n  justify-content: center;\\n  margin-top: 1.5em;\\n}\\n@media only screen and (max-width: 720px) {\\n  .nextProjectBtn {\\n    margin-top: 1em;\\n  }\\n}\\n.nextProjectBtn button {\\n  cursor: pointer;\\n  margin-left: 1em;\\n  display: flex;\\n  align-items: center;\\n  color: #CDCDCD;\\n}\\n.nextProjectBtn button span {\\n  margin-bottom: -0.3px;\\n  transition: 0.2s ease-in;\\n}\\n\\n.workContent {\\n  min-height: 300px;\\n}</style>\\r\\n"],"names":[],"mappings":"AAyCmB,UAAU,8BAAC,CAAC,AAC7B,QAAQ,CAAE,QAAQ,AACpB,CAAC,AAED,gBAAgB,8BAAC,CAAC,AAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AAED,eAAe,8BAAC,CAAC,AACf,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,eAAe,8BAAC,CAAC,AACf,UAAU,CAAE,GAAG,AACjB,CAAC,AACH,CAAC,AACD,8BAAe,CAAC,MAAM,eAAC,CAAC,AACtB,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,GAAG,CAChB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,OAAO,AAChB,CAAC,AACD,8BAAe,CAAC,MAAM,CAAC,IAAI,eAAC,CAAC,AAC3B,aAAa,CAAE,MAAM,CACrB,UAAU,CAAE,IAAI,CAAC,OAAO,AAC1B,CAAC,AAED,YAAY,8BAAC,CAAC,AACZ,UAAU,CAAE,KAAK,AACnB,CAAC"}`
};
var Works = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let current = 0, projectCount = projects.length;
  $$result.css.add(css$d);
  return `<section id="${"works"}" class="${"main"}"><div class="${"container svelte-13zykhb"}"><h2>WORKS</h2>
			<div class="${"workContent svelte-13zykhb"}">${current < projectCount ? `<div class="${"projectCarousel svelte-13zykhb"}">${validate_component(Project, "Project").$$render($$result, { current, project: projects[current] }, {}, {})}</div>` : `<div>${validate_component(ProjectArchives, "ProjectArchives").$$render($$result, {}, {}, {})}</div>`}
				<div class="${"carouselButtonContainer"}">${validate_component(ProjectCircles, "ProjectCircles").$$render($$result, { count: projectCount + 1, current }, {}, {})}
					<div class="${"nextProjectBtn svelte-13zykhb"}"><button class="${"btn-anim svelte-13zykhb"}"><span class="${"svelte-13zykhb"}">Next Project</span>${validate_component(ArrowIcon, "ArrowIcon").$$render($$result, {}, {}, {})}</button></div></div></div></div>
	</section>`;
});
var css$c = {
  code: "svg.contact.svelte-1npeeiz path.svelte-1npeeiz{fill:#FFFFFF}",
  map: `{"version":3,"file":"BehanceIcon.svelte","sources":["BehanceIcon.svelte"],"sourcesContent":["<script>\\r\\n\\texport let type = '';\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass={type}\\r\\n\\twidth=\\"24\\"\\r\\n\\theight=\\"28\\"\\r\\n\\tviewBox=\\"0 0 24 28\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\td=\\"M9.99107 16.0234C9.99107 17.0789 9.24107 17.4125 8.31964 17.4125H5.90357V14.5195H8.36786C9.36429 14.525 9.99107 14.9461 9.99107 16.0234ZM9.57857 11.5227C9.57857 10.5547 8.84464 10.325 8.03036 10.325H5.90893V12.775H8.19643C9.00536 12.775 9.57857 12.4141 9.57857 11.5227ZM16.6661 12.7914C15.6857 12.7914 15.0321 13.4148 14.9679 14.4156H18.3C18.2089 13.4039 17.6946 12.7914 16.6661 12.7914ZM24 4.375V23.625C24 25.0742 22.8482 26.25 21.4286 26.25H2.57143C1.15179 26.25 0 25.0742 0 23.625V4.375C0 2.92578 1.15179 1.75 2.57143 1.75H21.4286C22.8482 1.75 24 2.92578 24 4.375ZM14.5554 10.1172H18.7232V9.08359H14.5554V10.1172ZM12.2518 16.1492C12.2518 14.8312 11.6411 13.6937 10.3768 13.3273C11.2982 12.8789 11.7804 12.3594 11.7804 11.3039C11.7804 9.21484 10.2536 8.70625 8.49107 8.70625H3.64286V19.2063H8.63036C10.5 19.1953 12.2518 18.282 12.2518 16.1492ZM20.3571 15.3398C20.3571 13.0922 19.0661 11.2164 16.7357 11.2164C14.4643 11.2164 12.9268 12.9555 12.9268 15.2414C12.9268 17.6094 14.3893 19.2336 16.7357 19.2336C18.5143 19.2336 19.6661 18.4187 20.2232 16.6742H18.4179C18.2196 17.325 17.4214 17.6641 16.8 17.6641C15.6 17.6641 14.9732 16.9477 14.9732 15.7336H20.3411C20.3464 15.6078 20.3571 15.4711 20.3571 15.3398Z\\"\\r\\n\\t\\tfill=\\"#2E2E2E\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg.contact path {\\n  fill: #FFFFFF;\\n}</style>\\r\\n"],"names":[],"mappings":"AAkBmB,GAAG,uBAAQ,CAAC,IAAI,eAAC,CAAC,AACnC,IAAI,CAAE,OAAO,AACf,CAAC"}`
};
var BehanceIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$c);
  return `<svg class="${escape(null_to_empty(type)) + " svelte-1npeeiz"}" width="${"24"}" height="${"28"}" viewBox="${"0 0 24 28"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M9.99107 16.0234C9.99107 17.0789 9.24107 17.4125 8.31964 17.4125H5.90357V14.5195H8.36786C9.36429 14.525 9.99107 14.9461 9.99107 16.0234ZM9.57857 11.5227C9.57857 10.5547 8.84464 10.325 8.03036 10.325H5.90893V12.775H8.19643C9.00536 12.775 9.57857 12.4141 9.57857 11.5227ZM16.6661 12.7914C15.6857 12.7914 15.0321 13.4148 14.9679 14.4156H18.3C18.2089 13.4039 17.6946 12.7914 16.6661 12.7914ZM24 4.375V23.625C24 25.0742 22.8482 26.25 21.4286 26.25H2.57143C1.15179 26.25 0 25.0742 0 23.625V4.375C0 2.92578 1.15179 1.75 2.57143 1.75H21.4286C22.8482 1.75 24 2.92578 24 4.375ZM14.5554 10.1172H18.7232V9.08359H14.5554V10.1172ZM12.2518 16.1492C12.2518 14.8312 11.6411 13.6937 10.3768 13.3273C11.2982 12.8789 11.7804 12.3594 11.7804 11.3039C11.7804 9.21484 10.2536 8.70625 8.49107 8.70625H3.64286V19.2063H8.63036C10.5 19.1953 12.2518 18.282 12.2518 16.1492ZM20.3571 15.3398C20.3571 13.0922 19.0661 11.2164 16.7357 11.2164C14.4643 11.2164 12.9268 12.9555 12.9268 15.2414C12.9268 17.6094 14.3893 19.2336 16.7357 19.2336C18.5143 19.2336 19.6661 18.4187 20.2232 16.6742H18.4179C18.2196 17.325 17.4214 17.6641 16.8 17.6641C15.6 17.6641 14.9732 16.9477 14.9732 15.7336H20.3411C20.3464 15.6078 20.3571 15.4711 20.3571 15.3398Z"}" fill="${"#2E2E2E"}" class="${"svelte-1npeeiz"}"></path></svg>`;
});
var css$b = {
  code: "svg.contact.svelte-1npeeiz path.svelte-1npeeiz{fill:#FFFFFF}",
  map: `{"version":3,"file":"CodepenIcon.svelte","sources":["CodepenIcon.svelte"],"sourcesContent":["<script>\\r\\n\\texport let type = '';\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass={type}\\r\\n\\twidth=\\"27\\"\\r\\n\\theight=\\"28\\"\\r\\n\\tviewBox=\\"0 0 27 28\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\td=\\"M20.412 15.2448V12.7552L18.6187 14L20.412 15.2448ZM21.8475 16.6378C21.8473 16.6702 21.8451 16.7026 21.8407 16.7347L21.8351 16.7673L21.8228 16.8292L21.8115 16.8653C21.8061 16.884 21.7997 16.9023 21.7924 16.9202L21.7766 16.9552C21.7692 16.9721 21.7614 16.9889 21.753 17.0053L21.7316 17.0403C21.7059 17.0826 21.6758 17.1217 21.6416 17.157L21.6124 17.1862C21.5993 17.1984 21.5858 17.21 21.5719 17.2212L21.5392 17.2468L21.528 17.2562L13.8983 22.5318C13.7804 22.6135 13.6418 22.6572 13.5 22.6572C13.3582 22.6572 13.2196 22.6135 13.1017 22.5318L5.472 17.255L5.46075 17.2457C5.43505 17.2272 5.41061 17.207 5.38763 17.185L5.35838 17.1558L5.32237 17.1162L5.29875 17.0835C5.26917 17.0437 5.24389 17.0007 5.22338 16.9552L5.20763 16.919C5.20057 16.901 5.19419 16.8827 5.1885 16.8642L5.17725 16.8292C5.17275 16.8082 5.16825 16.7872 5.166 16.7662L5.15925 16.7335C5.15494 16.7014 5.15268 16.6691 5.1525 16.6367V11.3622C5.15251 11.3298 5.15477 11.2974 5.15925 11.2653L5.16488 11.2338L5.17725 11.1708L5.1885 11.1358C5.21518 11.0423 5.26125 10.9558 5.3235 10.8827L5.35838 10.843L5.38763 10.8138C5.41066 10.7919 5.43509 10.7717 5.46075 10.7532L5.472 10.7438L13.1017 5.46933C13.2197 5.38777 13.3583 5.34424 13.5 5.34424C13.6417 5.34424 13.7803 5.38777 13.8983 5.46933L21.528 10.7438L21.5392 10.7532L21.573 10.7788L21.6124 10.8138C21.6236 10.8232 21.6315 10.8325 21.6416 10.843C21.6759 10.8781 21.7062 10.9172 21.7316 10.9597L21.753 10.9947C21.7615 11.0111 21.7694 11.0278 21.7766 11.0448L21.7924 11.0798C21.8003 11.0985 21.8059 11.1172 21.8115 11.1347L21.8228 11.1708C21.8273 11.1918 21.8318 11.2128 21.834 11.2338L21.8407 11.2653C21.8451 11.2974 21.8473 11.3298 21.8475 11.3622V16.6378ZM13.5 0C6.04463 0 0 6.26733 0 14C0 21.7315 6.04463 28 13.5 28C20.9565 28 27 21.7327 27 14C27 6.2685 20.9565 0 13.5 0ZM13.5 12.2407L10.9631 14L13.5 15.7617L16.0369 14L13.5 12.2407ZM14.2177 17.052V20.5228L19.8383 16.6378L17.3273 14.896L14.2177 17.052ZM7.16175 16.6367L12.7823 20.5217V17.052L9.67275 14.8948L7.16175 16.6367ZM19.8383 11.3633L14.2177 7.47833V10.948L17.3273 13.1063L19.8383 11.3633ZM12.7823 10.948V7.47833L7.16175 11.3633L9.67275 13.1052L12.7823 10.948ZM6.588 12.7552V15.2448L8.38125 14L6.588 12.7552Z\\"\\r\\n\\t\\tfill=\\"#2E2E2E\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg.contact path {\\n  fill: #FFFFFF;\\n}</style>\\r\\n"],"names":[],"mappings":"AAkBmB,GAAG,uBAAQ,CAAC,IAAI,eAAC,CAAC,AACnC,IAAI,CAAE,OAAO,AACf,CAAC"}`
};
var CodepenIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$b);
  return `<svg class="${escape(null_to_empty(type)) + " svelte-1npeeiz"}" width="${"27"}" height="${"28"}" viewBox="${"0 0 27 28"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M20.412 15.2448V12.7552L18.6187 14L20.412 15.2448ZM21.8475 16.6378C21.8473 16.6702 21.8451 16.7026 21.8407 16.7347L21.8351 16.7673L21.8228 16.8292L21.8115 16.8653C21.8061 16.884 21.7997 16.9023 21.7924 16.9202L21.7766 16.9552C21.7692 16.9721 21.7614 16.9889 21.753 17.0053L21.7316 17.0403C21.7059 17.0826 21.6758 17.1217 21.6416 17.157L21.6124 17.1862C21.5993 17.1984 21.5858 17.21 21.5719 17.2212L21.5392 17.2468L21.528 17.2562L13.8983 22.5318C13.7804 22.6135 13.6418 22.6572 13.5 22.6572C13.3582 22.6572 13.2196 22.6135 13.1017 22.5318L5.472 17.255L5.46075 17.2457C5.43505 17.2272 5.41061 17.207 5.38763 17.185L5.35838 17.1558L5.32237 17.1162L5.29875 17.0835C5.26917 17.0437 5.24389 17.0007 5.22338 16.9552L5.20763 16.919C5.20057 16.901 5.19419 16.8827 5.1885 16.8642L5.17725 16.8292C5.17275 16.8082 5.16825 16.7872 5.166 16.7662L5.15925 16.7335C5.15494 16.7014 5.15268 16.6691 5.1525 16.6367V11.3622C5.15251 11.3298 5.15477 11.2974 5.15925 11.2653L5.16488 11.2338L5.17725 11.1708L5.1885 11.1358C5.21518 11.0423 5.26125 10.9558 5.3235 10.8827L5.35838 10.843L5.38763 10.8138C5.41066 10.7919 5.43509 10.7717 5.46075 10.7532L5.472 10.7438L13.1017 5.46933C13.2197 5.38777 13.3583 5.34424 13.5 5.34424C13.6417 5.34424 13.7803 5.38777 13.8983 5.46933L21.528 10.7438L21.5392 10.7532L21.573 10.7788L21.6124 10.8138C21.6236 10.8232 21.6315 10.8325 21.6416 10.843C21.6759 10.8781 21.7062 10.9172 21.7316 10.9597L21.753 10.9947C21.7615 11.0111 21.7694 11.0278 21.7766 11.0448L21.7924 11.0798C21.8003 11.0985 21.8059 11.1172 21.8115 11.1347L21.8228 11.1708C21.8273 11.1918 21.8318 11.2128 21.834 11.2338L21.8407 11.2653C21.8451 11.2974 21.8473 11.3298 21.8475 11.3622V16.6378ZM13.5 0C6.04463 0 0 6.26733 0 14C0 21.7315 6.04463 28 13.5 28C20.9565 28 27 21.7327 27 14C27 6.2685 20.9565 0 13.5 0ZM13.5 12.2407L10.9631 14L13.5 15.7617L16.0369 14L13.5 12.2407ZM14.2177 17.052V20.5228L19.8383 16.6378L17.3273 14.896L14.2177 17.052ZM7.16175 16.6367L12.7823 20.5217V17.052L9.67275 14.8948L7.16175 16.6367ZM19.8383 11.3633L14.2177 7.47833V10.948L17.3273 13.1063L19.8383 11.3633ZM12.7823 10.948V7.47833L7.16175 11.3633L9.67275 13.1052L12.7823 10.948ZM6.588 12.7552V15.2448L8.38125 14L6.588 12.7552Z"}" fill="${"#2E2E2E"}" class="${"svelte-1npeeiz"}"></path></svg>`;
});
var css$a = {
  code: "svg.contact.svelte-1npeeiz path.svelte-1npeeiz{fill:#FFFFFF}",
  map: `{"version":3,"file":"GithubIcon.svelte","sources":["GithubIcon.svelte"],"sourcesContent":["<script>\\r\\n\\texport let type = '';\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass={type}\\r\\n\\twidth=\\"31\\"\\r\\n\\theight=\\"31\\"\\r\\n\\tviewBox=\\"0 0 31 31\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\td=\\"M15.5335 2.58331C12.4737 2.58292 9.51355 3.67152 7.183 5.65425C4.85245 7.63698 3.30361 10.3844 2.8137 13.4048C2.3238 16.4252 2.92481 19.5213 4.50917 22.1391C6.09352 24.7568 8.55779 26.7252 11.4609 27.692C12.1067 27.8083 12.3379 27.4117 12.3379 27.0707C12.3379 26.7646 12.3276 25.9534 12.3237 24.8749C8.73935 25.6499 7.98244 23.1466 7.98244 23.1466C7.74647 22.3677 7.23918 21.6991 6.55256 21.2621C5.39006 20.4626 6.64169 20.4806 6.64169 20.4806C7.46835 20.5943 8.19815 21.0839 8.61406 21.8085C8.7886 22.1258 9.02426 22.4055 9.30743 22.6313C9.5906 22.8571 9.91568 23.0246 10.2639 23.1242C10.6122 23.2237 10.9767 23.2534 11.3364 23.2113C11.6961 23.1693 12.044 23.0564 12.3599 22.8793C12.4193 22.2257 12.7112 21.6147 13.1801 21.1562C10.3204 20.832 7.31335 19.7263 7.31335 14.7883C7.29748 13.5111 7.77177 12.2764 8.6386 11.3382C8.24639 10.2265 8.29258 9.0071 8.76777 7.92823C8.76777 7.92823 9.8489 7.58077 12.3095 9.24702C14.4199 8.66836 16.6471 8.66836 18.7575 9.24702C21.2194 7.57948 22.2993 7.92823 22.2993 7.92823C22.7772 9.00677 22.8224 10.2274 22.4284 11.3382C23.2984 12.2763 23.7723 13.5142 23.7511 14.7934C23.7511 19.7444 20.7415 20.832 17.8714 21.151C18.4914 21.7839 18.8079 22.6519 18.7433 23.5354C18.7433 25.2585 18.7278 26.6484 18.7278 27.0707C18.7278 27.4156 18.9577 27.816 19.6152 27.6894C22.5171 26.721 24.9798 24.7516 26.5625 22.1335C28.1452 19.5155 28.7448 16.4198 28.2539 13.4001C27.763 10.3805 26.2136 7.63411 23.883 5.6523C21.5525 3.67049 18.5928 2.58261 15.5335 2.58331Z\\"\\r\\n\\t\\tfill=\\"#2E2E2E\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg.contact path {\\n  fill: #FFFFFF;\\n}</style>\\r\\n"],"names":[],"mappings":"AAkBmB,GAAG,uBAAQ,CAAC,IAAI,eAAC,CAAC,AACnC,IAAI,CAAE,OAAO,AACf,CAAC"}`
};
var GithubIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$a);
  return `<svg class="${escape(null_to_empty(type)) + " svelte-1npeeiz"}" width="${"31"}" height="${"31"}" viewBox="${"0 0 31 31"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M15.5335 2.58331C12.4737 2.58292 9.51355 3.67152 7.183 5.65425C4.85245 7.63698 3.30361 10.3844 2.8137 13.4048C2.3238 16.4252 2.92481 19.5213 4.50917 22.1391C6.09352 24.7568 8.55779 26.7252 11.4609 27.692C12.1067 27.8083 12.3379 27.4117 12.3379 27.0707C12.3379 26.7646 12.3276 25.9534 12.3237 24.8749C8.73935 25.6499 7.98244 23.1466 7.98244 23.1466C7.74647 22.3677 7.23918 21.6991 6.55256 21.2621C5.39006 20.4626 6.64169 20.4806 6.64169 20.4806C7.46835 20.5943 8.19815 21.0839 8.61406 21.8085C8.7886 22.1258 9.02426 22.4055 9.30743 22.6313C9.5906 22.8571 9.91568 23.0246 10.2639 23.1242C10.6122 23.2237 10.9767 23.2534 11.3364 23.2113C11.6961 23.1693 12.044 23.0564 12.3599 22.8793C12.4193 22.2257 12.7112 21.6147 13.1801 21.1562C10.3204 20.832 7.31335 19.7263 7.31335 14.7883C7.29748 13.5111 7.77177 12.2764 8.6386 11.3382C8.24639 10.2265 8.29258 9.0071 8.76777 7.92823C8.76777 7.92823 9.8489 7.58077 12.3095 9.24702C14.4199 8.66836 16.6471 8.66836 18.7575 9.24702C21.2194 7.57948 22.2993 7.92823 22.2993 7.92823C22.7772 9.00677 22.8224 10.2274 22.4284 11.3382C23.2984 12.2763 23.7723 13.5142 23.7511 14.7934C23.7511 19.7444 20.7415 20.832 17.8714 21.151C18.4914 21.7839 18.8079 22.6519 18.7433 23.5354C18.7433 25.2585 18.7278 26.6484 18.7278 27.0707C18.7278 27.4156 18.9577 27.816 19.6152 27.6894C22.5171 26.721 24.9798 24.7516 26.5625 22.1335C28.1452 19.5155 28.7448 16.4198 28.2539 13.4001C27.763 10.3805 26.2136 7.63411 23.883 5.6523C21.5525 3.67049 18.5928 2.58261 15.5335 2.58331Z"}" fill="${"#2E2E2E"}" class="${"svelte-1npeeiz"}"></path></svg>`;
});
var css$9 = {
  code: "svg.contact.svelte-1npeeiz path.svelte-1npeeiz{fill:#FFFFFF}",
  map: `{"version":3,"file":"HackerrankIcon.svelte","sources":["HackerrankIcon.svelte"],"sourcesContent":["<script>\\r\\n\\texport let type = '';\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass={type}\\r\\n\\twidth=\\"24\\"\\r\\n\\theight=\\"24\\"\\r\\n\\tviewBox=\\"0 0 24 24\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\td=\\"M0 0V24H24V0H0ZM9.95 8.002H11.755C11.816 8.002 11.866 8.052 11.866 8.113V15.88C11.866 15.941 11.816 15.991 11.756 15.991H9.95C9.92073 15.991 9.89265 15.9794 9.87186 15.9588C9.85107 15.9382 9.83926 15.9103 9.839 15.881V13.011H7.894V15.881C7.894 15.941 7.844 15.991 7.784 15.991H5.976C5.96155 15.991 5.94725 15.9882 5.9339 15.9826C5.92056 15.9771 5.90843 15.969 5.89822 15.9588C5.888 15.9486 5.8799 15.9364 5.87437 15.9231C5.86885 15.9097 5.866 15.8954 5.866 15.881V8.112C5.866 8.052 5.916 8.002 5.976 8.002H7.782C7.843 8.002 7.892 8.052 7.892 8.112V10.981H9.84V8.111C9.84 8.051 9.89 8.001 9.95 8.001V8.002ZM12.949 8.002H18.727C18.788 8.002 18.838 8.052 18.838 8.112V15.879C18.8383 15.8936 18.8356 15.9081 18.8302 15.9217C18.8248 15.9353 18.8167 15.9476 18.8065 15.9581C18.7963 15.9685 18.784 15.9768 18.7706 15.9824C18.7571 15.9881 18.7426 15.991 18.728 15.991H12.948C12.9188 15.991 12.8908 15.9794 12.8702 15.9588C12.8496 15.9382 12.838 15.9102 12.838 15.881V8.111C12.838 8.051 12.888 8.001 12.948 8.001L12.949 8.002Z\\"\\r\\n\\t\\tfill=\\"#2E2E2E\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg.contact path {\\n  fill: #FFFFFF;\\n}</style>\\r\\n"],"names":[],"mappings":"AAkBmB,GAAG,uBAAQ,CAAC,IAAI,eAAC,CAAC,AACnC,IAAI,CAAE,OAAO,AACf,CAAC"}`
};
var HackerrankIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$9);
  return `<svg class="${escape(null_to_empty(type)) + " svelte-1npeeiz"}" width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M0 0V24H24V0H0ZM9.95 8.002H11.755C11.816 8.002 11.866 8.052 11.866 8.113V15.88C11.866 15.941 11.816 15.991 11.756 15.991H9.95C9.92073 15.991 9.89265 15.9794 9.87186 15.9588C9.85107 15.9382 9.83926 15.9103 9.839 15.881V13.011H7.894V15.881C7.894 15.941 7.844 15.991 7.784 15.991H5.976C5.96155 15.991 5.94725 15.9882 5.9339 15.9826C5.92056 15.9771 5.90843 15.969 5.89822 15.9588C5.888 15.9486 5.8799 15.9364 5.87437 15.9231C5.86885 15.9097 5.866 15.8954 5.866 15.881V8.112C5.866 8.052 5.916 8.002 5.976 8.002H7.782C7.843 8.002 7.892 8.052 7.892 8.112V10.981H9.84V8.111C9.84 8.051 9.89 8.001 9.95 8.001V8.002ZM12.949 8.002H18.727C18.788 8.002 18.838 8.052 18.838 8.112V15.879C18.8383 15.8936 18.8356 15.9081 18.8302 15.9217C18.8248 15.9353 18.8167 15.9476 18.8065 15.9581C18.7963 15.9685 18.784 15.9768 18.7706 15.9824C18.7571 15.9881 18.7426 15.991 18.728 15.991H12.948C12.9188 15.991 12.8908 15.9794 12.8702 15.9588C12.8496 15.9382 12.838 15.9102 12.838 15.881V8.111C12.838 8.051 12.888 8.001 12.948 8.001L12.949 8.002Z"}" fill="${"#2E2E2E"}" class="${"svelte-1npeeiz"}"></path></svg>`;
});
var css$8 = {
  code: "svg.contact.svelte-1npeeiz path.svelte-1npeeiz{fill:#FFFFFF}",
  map: `{"version":3,"file":"InstagramIcon.svelte","sources":["InstagramIcon.svelte"],"sourcesContent":["<script>\\r\\n\\texport let type = '';\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass={type}\\r\\n\\twidth=\\"34\\"\\r\\n\\theight=\\"34\\"\\r\\n\\tviewBox=\\"0 0 34 34\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\td=\\"M29.6749 11.7654C29.6606 10.6924 29.4598 9.63015 29.0813 8.62605C28.7531 7.7791 28.2519 7.00992 27.6096 6.36765C26.9674 5.72538 26.1982 5.22414 25.3512 4.89597C24.36 4.52389 23.3129 4.3227 22.2544 4.30097C20.8916 4.24005 20.4595 4.22305 17 4.22305C13.5405 4.22305 13.0971 4.22305 11.7441 4.30097C10.6861 4.32286 9.63947 4.52405 8.64873 4.89597C7.80164 5.22391 7.03234 5.72507 6.39004 6.36737C5.74774 7.00967 5.24659 7.77897 4.91864 8.62605C4.54582 9.61649 4.34507 10.6634 4.32506 11.7215C4.26414 13.0857 4.24573 13.5178 4.24573 16.9773C4.24573 20.4368 4.24573 20.8788 4.32506 22.2331C4.34631 23.2928 4.54606 24.3383 4.91864 25.3314C5.24714 26.1782 5.74866 26.9472 6.39118 27.5892C7.03369 28.2313 7.80307 28.7322 8.65014 29.0601C9.63818 29.4471 10.685 29.6627 11.7456 29.6975C13.1098 29.7585 13.5419 29.7769 17.0014 29.7769C20.4609 29.7769 20.9043 29.7769 22.2572 29.6975C23.3157 29.6767 24.3629 29.476 25.3541 29.104C26.2008 28.7754 26.9698 28.2741 27.612 27.6318C28.2542 26.9896 28.7556 26.2206 29.0841 25.3739C29.4567 24.3822 29.6565 23.3367 29.6777 22.2756C29.7386 20.9128 29.7571 20.4807 29.7571 17.0198C29.7542 13.5603 29.7542 13.1211 29.6749 11.7654ZM16.9915 23.5195C13.3733 23.5195 10.4422 20.5884 10.4422 16.9702C10.4422 13.3521 13.3733 10.421 16.9915 10.421C18.7284 10.421 20.3943 11.111 21.6225 12.3392C22.8507 13.5674 23.5407 15.2333 23.5407 16.9702C23.5407 18.7072 22.8507 20.373 21.6225 21.6012C20.3943 22.8295 18.7284 23.5195 16.9915 23.5195ZM23.8014 11.7059C23.6008 11.7061 23.4021 11.6667 23.2168 11.59C23.0314 11.5133 22.863 11.4009 22.7211 11.259C22.5793 11.1172 22.4668 10.9487 22.3901 10.7634C22.3134 10.578 22.274 10.3793 22.2742 10.1787C22.2742 9.97826 22.3137 9.77977 22.3904 9.59457C22.4671 9.40937 22.5796 9.2411 22.7213 9.09935C22.8631 8.95761 23.0313 8.84517 23.2165 8.76846C23.4017 8.69174 23.6002 8.65226 23.8007 8.65226C24.0011 8.65226 24.1996 8.69174 24.3848 8.76846C24.57 8.84517 24.7383 8.95761 24.8801 9.09935C25.0218 9.2411 25.1342 9.40937 25.211 9.59457C25.2877 9.77977 25.3271 9.97826 25.3271 10.1787C25.3271 11.0231 24.6443 11.7059 23.8014 11.7059Z\\"\\r\\n\\t\\tfill=\\"#2E2E2E\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M16.9915 21.2245C19.3411 21.2245 21.2457 19.3198 21.2457 16.9702C21.2457 14.6207 19.3411 12.716 16.9915 12.716C14.6419 12.716 12.7372 14.6207 12.7372 16.9702C12.7372 19.3198 14.6419 21.2245 16.9915 21.2245Z\\"\\r\\n\\t\\tfill=\\"#2E2E2E\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg.contact path {\\n  fill: #FFFFFF;\\n}</style>\\r\\n"],"names":[],"mappings":"AAsBmB,GAAG,uBAAQ,CAAC,IAAI,eAAC,CAAC,AACnC,IAAI,CAAE,OAAO,AACf,CAAC"}`
};
var InstagramIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$8);
  return `<svg class="${escape(null_to_empty(type)) + " svelte-1npeeiz"}" width="${"34"}" height="${"34"}" viewBox="${"0 0 34 34"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M29.6749 11.7654C29.6606 10.6924 29.4598 9.63015 29.0813 8.62605C28.7531 7.7791 28.2519 7.00992 27.6096 6.36765C26.9674 5.72538 26.1982 5.22414 25.3512 4.89597C24.36 4.52389 23.3129 4.3227 22.2544 4.30097C20.8916 4.24005 20.4595 4.22305 17 4.22305C13.5405 4.22305 13.0971 4.22305 11.7441 4.30097C10.6861 4.32286 9.63947 4.52405 8.64873 4.89597C7.80164 5.22391 7.03234 5.72507 6.39004 6.36737C5.74774 7.00967 5.24659 7.77897 4.91864 8.62605C4.54582 9.61649 4.34507 10.6634 4.32506 11.7215C4.26414 13.0857 4.24573 13.5178 4.24573 16.9773C4.24573 20.4368 4.24573 20.8788 4.32506 22.2331C4.34631 23.2928 4.54606 24.3383 4.91864 25.3314C5.24714 26.1782 5.74866 26.9472 6.39118 27.5892C7.03369 28.2313 7.80307 28.7322 8.65014 29.0601C9.63818 29.4471 10.685 29.6627 11.7456 29.6975C13.1098 29.7585 13.5419 29.7769 17.0014 29.7769C20.4609 29.7769 20.9043 29.7769 22.2572 29.6975C23.3157 29.6767 24.3629 29.476 25.3541 29.104C26.2008 28.7754 26.9698 28.2741 27.612 27.6318C28.2542 26.9896 28.7556 26.2206 29.0841 25.3739C29.4567 24.3822 29.6565 23.3367 29.6777 22.2756C29.7386 20.9128 29.7571 20.4807 29.7571 17.0198C29.7542 13.5603 29.7542 13.1211 29.6749 11.7654ZM16.9915 23.5195C13.3733 23.5195 10.4422 20.5884 10.4422 16.9702C10.4422 13.3521 13.3733 10.421 16.9915 10.421C18.7284 10.421 20.3943 11.111 21.6225 12.3392C22.8507 13.5674 23.5407 15.2333 23.5407 16.9702C23.5407 18.7072 22.8507 20.373 21.6225 21.6012C20.3943 22.8295 18.7284 23.5195 16.9915 23.5195ZM23.8014 11.7059C23.6008 11.7061 23.4021 11.6667 23.2168 11.59C23.0314 11.5133 22.863 11.4009 22.7211 11.259C22.5793 11.1172 22.4668 10.9487 22.3901 10.7634C22.3134 10.578 22.274 10.3793 22.2742 10.1787C22.2742 9.97826 22.3137 9.77977 22.3904 9.59457C22.4671 9.40937 22.5796 9.2411 22.7213 9.09935C22.8631 8.95761 23.0313 8.84517 23.2165 8.76846C23.4017 8.69174 23.6002 8.65226 23.8007 8.65226C24.0011 8.65226 24.1996 8.69174 24.3848 8.76846C24.57 8.84517 24.7383 8.95761 24.8801 9.09935C25.0218 9.2411 25.1342 9.40937 25.211 9.59457C25.2877 9.77977 25.3271 9.97826 25.3271 10.1787C25.3271 11.0231 24.6443 11.7059 23.8014 11.7059Z"}" fill="${"#2E2E2E"}" class="${"svelte-1npeeiz"}"></path><path d="${"M16.9915 21.2245C19.3411 21.2245 21.2457 19.3198 21.2457 16.9702C21.2457 14.6207 19.3411 12.716 16.9915 12.716C14.6419 12.716 12.7372 14.6207 12.7372 16.9702C12.7372 19.3198 14.6419 21.2245 16.9915 21.2245Z"}" fill="${"#2E2E2E"}" class="${"svelte-1npeeiz"}"></path></svg>`;
});
var css$7 = {
  code: "svg.contact.svelte-1npeeiz path.svelte-1npeeiz{fill:#FFFFFF}",
  map: `{"version":3,"file":"LinkedinIcon.svelte","sources":["LinkedinIcon.svelte"],"sourcesContent":["<script>\\r\\n\\texport let type = '';\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass={type}\\r\\n\\twidth=\\"25\\"\\r\\n\\theight=\\"25\\"\\r\\n\\tviewBox=\\"0 0 25 25\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\td=\\"M3.86904 10.4167H7.44046V20.5357H3.86904V10.4167ZM15.8577 10.0714C16.8631 10.0774 18.1494 10.5714 18.9351 11.369C19.75 12.2798 19.9405 13.3089 19.9405 14.5833V20.5357H16.369V15.0059C16.369 13.994 15.9589 12.7613 14.6196 12.7202C13.8339 12.7327 13.328 13.1845 12.9524 13.9464C12.8452 14.1964 12.869 14.4768 12.869 14.7559L12.7976 20.5357H9.22618V10.4167H12.7976L12.869 11.7381C13.1271 11.3108 13.4694 10.9404 13.875 10.6494C14.4464 10.2381 15.1137 10.0827 15.8577 10.0714ZM5.65475 5.56547C6.57142 5.57797 7.48213 6.29762 7.51785 7.39285C7.54166 8.36964 6.69046 9.22023 5.63094 9.22023H5.60713C4.69642 9.22023 3.80356 8.47619 3.76189 7.39285C3.77975 6.42857 4.58927 5.58988 5.65475 5.56547ZM0.297607 0.892853V24.1071H23.5119V0.892853H0.297607Z\\"\\r\\n\\t\\tfill=\\"#2E2E2E\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg.contact path {\\n  fill: #FFFFFF;\\n}</style>\\r\\n"],"names":[],"mappings":"AAkBmB,GAAG,uBAAQ,CAAC,IAAI,eAAC,CAAC,AACnC,IAAI,CAAE,OAAO,AACf,CAAC"}`
};
var LinkedinIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$7);
  return `<svg class="${escape(null_to_empty(type)) + " svelte-1npeeiz"}" width="${"25"}" height="${"25"}" viewBox="${"0 0 25 25"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M3.86904 10.4167H7.44046V20.5357H3.86904V10.4167ZM15.8577 10.0714C16.8631 10.0774 18.1494 10.5714 18.9351 11.369C19.75 12.2798 19.9405 13.3089 19.9405 14.5833V20.5357H16.369V15.0059C16.369 13.994 15.9589 12.7613 14.6196 12.7202C13.8339 12.7327 13.328 13.1845 12.9524 13.9464C12.8452 14.1964 12.869 14.4768 12.869 14.7559L12.7976 20.5357H9.22618V10.4167H12.7976L12.869 11.7381C13.1271 11.3108 13.4694 10.9404 13.875 10.6494C14.4464 10.2381 15.1137 10.0827 15.8577 10.0714ZM5.65475 5.56547C6.57142 5.57797 7.48213 6.29762 7.51785 7.39285C7.54166 8.36964 6.69046 9.22023 5.63094 9.22023H5.60713C4.69642 9.22023 3.80356 8.47619 3.76189 7.39285C3.77975 6.42857 4.58927 5.58988 5.65475 5.56547ZM0.297607 0.892853V24.1071H23.5119V0.892853H0.297607Z"}" fill="${"#2E2E2E"}" class="${"svelte-1npeeiz"}"></path></svg>`;
});
var css$6 = {
  code: "svg.contact.svelte-1npeeiz path.svelte-1npeeiz{fill:#FFFFFF}",
  map: `{"version":3,"file":"TwitterIcon.svelte","sources":["TwitterIcon.svelte"],"sourcesContent":["<script>\\r\\n\\texport let type = '';\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass={type}\\r\\n\\twidth=\\"25\\"\\r\\n\\theight=\\"25\\"\\r\\n\\tviewBox=\\"0 0 25 25\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\td=\\"M24.951 4.76038C24.0151 5.17246 23.0235 5.44448 22.0083 5.56767C23.0772 4.92522 23.8775 3.91771 24.2615 2.73121C23.2708 3.30933 22.1729 3.73017 21.0042 3.96454C20.2331 3.13999 19.2113 2.59311 18.0975 2.40881C16.9838 2.22452 15.8403 2.41314 14.8447 2.94537C13.8491 3.47759 13.0571 4.32366 12.5917 5.35217C12.1263 6.38068 12.0135 7.53409 12.2708 8.63329C8.01042 8.43225 4.23646 6.38537 1.70833 3.29371C1.24874 4.07476 1.00902 4.96561 1.01458 5.87183C1.01458 7.65308 1.92083 9.21871 3.29375 10.1385C2.48006 10.1126 1.68435 9.8926 0.972917 9.49683V9.55933C0.972455 10.7431 1.38153 11.8905 2.13074 12.807C2.87994 13.7235 3.92314 14.3525 5.08333 14.5875C4.33156 14.7889 3.54418 14.8192 2.77917 14.676C3.10846 15.6948 3.74757 16.5853 4.60731 17.2234C5.46705 17.8615 6.50453 18.2153 7.575 18.2354C5.76201 19.6582 3.52341 20.4305 1.21875 20.4281C0.8125 20.4281 0.407292 20.4041 0 20.3583C2.3497 21.8628 5.08178 22.6614 7.87187 22.6593C17.3021 22.6593 22.4531 14.851 22.4531 8.09162C22.4531 7.87287 22.4531 7.65412 22.4375 7.43537C23.4437 6.71127 24.3117 5.81227 25 4.78121L24.951 4.76038Z\\"\\r\\n\\t\\tfill=\\"#2E2E2E\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg.contact path {\\n  fill: #FFFFFF;\\n}</style>\\r\\n"],"names":[],"mappings":"AAkBmB,GAAG,uBAAQ,CAAC,IAAI,eAAC,CAAC,AACnC,IAAI,CAAE,OAAO,AACf,CAAC"}`
};
var TwitterIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$6);
  return `<svg class="${escape(null_to_empty(type)) + " svelte-1npeeiz"}" width="${"25"}" height="${"25"}" viewBox="${"0 0 25 25"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M24.951 4.76038C24.0151 5.17246 23.0235 5.44448 22.0083 5.56767C23.0772 4.92522 23.8775 3.91771 24.2615 2.73121C23.2708 3.30933 22.1729 3.73017 21.0042 3.96454C20.2331 3.13999 19.2113 2.59311 18.0975 2.40881C16.9838 2.22452 15.8403 2.41314 14.8447 2.94537C13.8491 3.47759 13.0571 4.32366 12.5917 5.35217C12.1263 6.38068 12.0135 7.53409 12.2708 8.63329C8.01042 8.43225 4.23646 6.38537 1.70833 3.29371C1.24874 4.07476 1.00902 4.96561 1.01458 5.87183C1.01458 7.65308 1.92083 9.21871 3.29375 10.1385C2.48006 10.1126 1.68435 9.8926 0.972917 9.49683V9.55933C0.972455 10.7431 1.38153 11.8905 2.13074 12.807C2.87994 13.7235 3.92314 14.3525 5.08333 14.5875C4.33156 14.7889 3.54418 14.8192 2.77917 14.676C3.10846 15.6948 3.74757 16.5853 4.60731 17.2234C5.46705 17.8615 6.50453 18.2153 7.575 18.2354C5.76201 19.6582 3.52341 20.4305 1.21875 20.4281C0.8125 20.4281 0.407292 20.4041 0 20.3583C2.3497 21.8628 5.08178 22.6614 7.87187 22.6593C17.3021 22.6593 22.4531 14.851 22.4531 8.09162C22.4531 7.87287 22.4531 7.65412 22.4375 7.43537C23.4437 6.71127 24.3117 5.81227 25 4.78121L24.951 4.76038Z"}" fill="${"#2E2E2E"}" class="${"svelte-1npeeiz"}"></path></svg>`;
});
var css$5 = {
  code: ".sidemenu.svelte-gdz3wa.svelte-gdz3wa{display:flex;align-items:center;justify-content:flex-end}.sidemenu.svelte-gdz3wa li.svelte-gdz3wa{margin:1em}@media only screen and (max-width: 1280px){.sidemenu.svelte-gdz3wa.svelte-gdz3wa{margin-bottom:4em}}@media only screen and (max-width: 720px){.sidemenu.svelte-gdz3wa.svelte-gdz3wa{margin-bottom:5em;margin-left:-4em;flex-wrap:wrap}.sidemenu.svelte-gdz3wa li.svelte-gdz3wa{margin:1em}}.contact.svelte-gdz3wa.svelte-gdz3wa{display:flex;align-items:center;justify-content:flex-start;margin-bottom:1em}.contact.svelte-gdz3wa li.svelte-gdz3wa{margin-right:2em}.contact.svelte-gdz3wa li.svelte-gdz3wa:last-child{margin-right:0}@media only screen and (max-width: 1280px){.contact.svelte-gdz3wa.svelte-gdz3wa{margin-bottom:4em}}@media only screen and (max-width: 720px){.contact.svelte-gdz3wa.svelte-gdz3wa{margin-bottom:2em;flex-wrap:wrap;margin-top:1em}.contact.svelte-gdz3wa li.svelte-gdz3wa{margin-right:1.2em}}",
  map: `{"version":3,"file":"SocialMediaLinks.svelte","sources":["SocialMediaLinks.svelte"],"sourcesContent":["<script>\\r\\n\\timport BehanceIcon from '../svg/BehanceIcon.svelte';\\r\\n\\timport CodepenIcon from '../svg/CodepenIcon.svelte';\\r\\n\\timport GithubIcon from '../svg/GithubIcon.svelte';\\r\\n\\timport HackerrankIcon from '../svg/HackerrankIcon.svelte';\\r\\n\\timport InstagramIcon from '../svg/InstagramIcon.svelte';\\r\\n\\timport LinkedinIcon from '../svg/LinkedinIcon.svelte';\\r\\n\\timport TwitterIcon from '../svg/TwitterIcon.svelte';\\r\\n\\r\\n\\texport let type = 'sidemenu';\\r\\n<\/script>\\r\\n\\r\\n<ul class={type}>\\r\\n\\t<li class=\\"socialmedialinks-anim\\">\\r\\n\\t\\t<a rel=\\"external\\" href=\\"https://github.com/gauthamkrishnax\\"><GithubIcon {type} /></a>\\r\\n\\t</li>\\r\\n\\t<li class=\\"socialmedialinks-anim\\">\\r\\n\\t\\t<a rel=\\"external\\" href=\\"https://www.behance.net/gauthamkrishnax\\"><BehanceIcon {type} /></a>\\r\\n\\t</li>\\r\\n\\t<li class=\\"socialmedialinks-anim\\">\\r\\n\\t\\t<a rel=\\"external\\" href=\\"https://www.linkedin.com/in/gauthamkrishnas/\\"><LinkedinIcon {type} /></a\\r\\n\\t\\t>\\r\\n\\t</li>\\r\\n\\t<li class=\\"socialmedialinks-anim\\">\\r\\n\\t\\t<a rel=\\"external\\" href=\\"https://codepen.io/gauthamkrishnax\\"><CodepenIcon {type} /></a>\\r\\n\\t</li>\\r\\n\\t<li class=\\"socialmedialinks-anim\\">\\r\\n\\t\\t<a rel=\\"external\\" href=\\"https://www.hackerrank.com/gauthamkrishnax\\"><HackerrankIcon {type} /></a\\r\\n\\t\\t>\\r\\n\\t</li>\\r\\n\\t<li class=\\"socialmedialinks-anim\\">\\r\\n\\t\\t<a rel=\\"external\\" href=\\"https://twitter.com/8thumbi\\"><TwitterIcon {type} /></a>\\r\\n\\t</li>\\r\\n\\t<li class=\\"socialmedialinks-anim\\">\\r\\n\\t\\t<a rel=\\"external\\" href=\\"https://www.instagram.com/aestheticvisu4ls/\\"><InstagramIcon {type} /></a\\r\\n\\t\\t>\\r\\n\\t</li>\\r\\n</ul>\\r\\n\\r\\n<style lang=\\"scss\\">.sidemenu {\\n  display: flex;\\n  align-items: center;\\n  justify-content: flex-end;\\n}\\n.sidemenu li {\\n  margin: 1em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .sidemenu {\\n    margin-bottom: 4em;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .sidemenu {\\n    margin-bottom: 5em;\\n    margin-left: -4em;\\n    flex-wrap: wrap;\\n  }\\n  .sidemenu li {\\n    margin: 1em;\\n  }\\n}\\n\\n.contact {\\n  display: flex;\\n  align-items: center;\\n  justify-content: flex-start;\\n  margin-bottom: 1em;\\n}\\n.contact li {\\n  margin-right: 2em;\\n}\\n.contact li:last-child {\\n  margin-right: 0;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .contact {\\n    margin-bottom: 4em;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .contact {\\n    margin-bottom: 2em;\\n    flex-wrap: wrap;\\n    margin-top: 1em;\\n  }\\n  .contact li {\\n    margin-right: 1.2em;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAuCmB,SAAS,4BAAC,CAAC,AAC5B,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,QAAQ,AAC3B,CAAC,AACD,uBAAS,CAAC,EAAE,cAAC,CAAC,AACZ,MAAM,CAAE,GAAG,AACb,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,SAAS,4BAAC,CAAC,AACT,aAAa,CAAE,GAAG,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,SAAS,4BAAC,CAAC,AACT,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,IAAI,CACjB,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,uBAAS,CAAC,EAAE,cAAC,CAAC,AACZ,MAAM,CAAE,GAAG,AACb,CAAC,AACH,CAAC,AAED,QAAQ,4BAAC,CAAC,AACR,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,UAAU,CAC3B,aAAa,CAAE,GAAG,AACpB,CAAC,AACD,sBAAQ,CAAC,EAAE,cAAC,CAAC,AACX,YAAY,CAAE,GAAG,AACnB,CAAC,AACD,sBAAQ,CAAC,gBAAE,WAAW,AAAC,CAAC,AACtB,YAAY,CAAE,CAAC,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,QAAQ,4BAAC,CAAC,AACR,aAAa,CAAE,GAAG,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,QAAQ,4BAAC,CAAC,AACR,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,GAAG,AACjB,CAAC,AACD,sBAAQ,CAAC,EAAE,cAAC,CAAC,AACX,YAAY,CAAE,KAAK,AACrB,CAAC,AACH,CAAC"}`
};
var SocialMediaLinks = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "sidemenu" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$5);
  return `<ul class="${escape(null_to_empty(type)) + " svelte-gdz3wa"}"><li class="${"socialmedialinks-anim svelte-gdz3wa"}"><a rel="${"external"}" href="${"https://github.com/gauthamkrishnax"}">${validate_component(GithubIcon, "GithubIcon").$$render($$result, { type }, {}, {})}</a></li>
	<li class="${"socialmedialinks-anim svelte-gdz3wa"}"><a rel="${"external"}" href="${"https://www.behance.net/gauthamkrishnax"}">${validate_component(BehanceIcon, "BehanceIcon").$$render($$result, { type }, {}, {})}</a></li>
	<li class="${"socialmedialinks-anim svelte-gdz3wa"}"><a rel="${"external"}" href="${"https://www.linkedin.com/in/gauthamkrishnas/"}">${validate_component(LinkedinIcon, "LinkedinIcon").$$render($$result, { type }, {}, {})}</a></li>
	<li class="${"socialmedialinks-anim svelte-gdz3wa"}"><a rel="${"external"}" href="${"https://codepen.io/gauthamkrishnax"}">${validate_component(CodepenIcon, "CodepenIcon").$$render($$result, { type }, {}, {})}</a></li>
	<li class="${"socialmedialinks-anim svelte-gdz3wa"}"><a rel="${"external"}" href="${"https://www.hackerrank.com/gauthamkrishnax"}">${validate_component(HackerrankIcon, "HackerrankIcon").$$render($$result, { type }, {}, {})}</a></li>
	<li class="${"socialmedialinks-anim svelte-gdz3wa"}"><a rel="${"external"}" href="${"https://twitter.com/8thumbi"}">${validate_component(TwitterIcon, "TwitterIcon").$$render($$result, { type }, {}, {})}</a></li>
	<li class="${"socialmedialinks-anim svelte-gdz3wa"}"><a rel="${"external"}" href="${"https://www.instagram.com/aestheticvisu4ls/"}">${validate_component(InstagramIcon, "InstagramIcon").$$render($$result, { type }, {}, {})}</a></li>
</ul>`;
});
var css$4 = {
  code: ".container.svelte-149qgor.svelte-149qgor{background-color:#060606;z-index:4;position:relative}@media only screen and (max-width: 720px){.container.svelte-149qgor.svelte-149qgor{margin-bottom:2em}}.talk.svelte-149qgor.svelte-149qgor{margin-top:4em}.talk.svelte-149qgor p.svelte-149qgor{color:#CDCDCD;max-width:500px}@media only screen and (max-width: 720px){.talk.svelte-149qgor p.svelte-149qgor{font-size:0.8rem}}.talk.svelte-149qgor button.svelte-149qgor{border:1px solid #FFFFFF;font-size:3rem;color:#FFFFFF;padding:0.2em 0.5em;margin:1em 0 0.5em;cursor:pointer}@media only screen and (max-width: 1280px){.talk.svelte-149qgor button.svelte-149qgor{font-size:2rem}}@media only screen and (max-width: 720px){.talk.svelte-149qgor button.svelte-149qgor{font-size:1.5rem}}.talk.svelte-149qgor button.svelte-149qgor:hover{color:#0094FF;border-color:#0094FF;transition:0.2s ease-in}.talk.svelte-149qgor button.svelte-149qgor:focus{outline-color:#0094FF;outline-offset:0.1em}hr.svelte-149qgor.svelte-149qgor{margin:0 -14em;border:1px solid #424242}.thaagam.svelte-149qgor.svelte-149qgor{float:right;text-align:right}@media only screen and (max-width: 720px){.thaagam.svelte-149qgor.svelte-149qgor{margin-bottom:1em}}.thaagam.svelte-149qgor h3.svelte-149qgor{font-size:3rem;margin:-0.5em 3em 0.5em 0}.thaagam.svelte-149qgor p.svelte-149qgor{max-width:400px}@media only screen and (max-width: 720px){.thaagam.svelte-149qgor p.svelte-149qgor{font-size:0.8rem}}.thaagam.svelte-149qgor button.svelte-149qgor{border:1px solid #FFFFFF;font-size:1.5rem;cursor:pointer;color:#FFFFFF;padding:0.2em 0.5em;margin:1em 0}.thaagam.svelte-149qgor button.svelte-149qgor:hover{color:#0094FF;border-color:#0094FF;transition:0.2s ease-in}.thaagam.svelte-149qgor button.svelte-149qgor:focus{outline-color:#0094FF;outline-offset:0.1em}",
  map: `{"version":3,"file":"Contact.svelte","sources":["Contact.svelte"],"sourcesContent":["<script>\\r\\n\\timport SocialMediaLinks from '../elements/SocialMediaLinks.svelte';\\r\\n\\r\\n\\tlet mail = '8.gautham@pm.me';\\r\\n\\r\\n\\tconst copyMail = () => {\\r\\n\\t\\tmail = 'Mail ID Copied !';\\r\\n\\t\\twindow.open('mailto:8.gautham@pm.me', '_top');\\r\\n\\t\\tsetTimeout(() => {\\r\\n\\t\\t\\tmail = '8.gautham@pm.me';\\r\\n\\t\\t\\tnavigator.clipboard\\r\\n\\t\\t\\t\\t.writeText(mail)\\r\\n\\t\\t\\t\\t.then(() => {\\r\\n\\t\\t\\t\\t\\tconsole.log('Mail Copied !');\\r\\n\\t\\t\\t\\t})\\r\\n\\t\\t\\t\\t.catch(() => {\\r\\n\\t\\t\\t\\t\\tconsole.error('Error Copying Mail !');\\r\\n\\t\\t\\t\\t});\\r\\n\\t\\t}, 2000);\\r\\n\\t};\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section id=\\"contact\\" class=\\"main\\">\\r\\n\\t\\t<div class=\\"container\\">\\r\\n\\t\\t\\t<h2>CONTACT</h2>\\r\\n\\t\\t\\t<div class=\\"talk\\">\\r\\n\\t\\t\\t\\t<h3>Let's talk.</h3>\\r\\n\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\tOne little click of a button away from your big stuff & my future. I promise I\u2019ll get back\\r\\n\\t\\t\\t\\t\\tto you as soon as possible.\\r\\n\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t<button\\r\\n\\t\\t\\t\\t\\tclass=\\"btn-anim-2\\"\\r\\n\\t\\t\\t\\t\\ttitle=\\"\u{1F4E7} Open Mail Client / Copy Text\\"\\r\\n\\t\\t\\t\\t\\ton:click={() => copyMail()}\\r\\n\\t\\t\\t\\t\\tid=\\"mail\\"\\r\\n\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t{mail}\\r\\n\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t\\t<SocialMediaLinks type=\\"contact\\" />\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<hr />\\r\\n\\t\\t\\t<div class=\\"thaagam\\">\\r\\n\\t\\t\\t\\t<h3>Or</h3>\\r\\n\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t<em\\r\\n\\t\\t\\t\\t\\t\\t>\u201CIt is an eternal obligation toward the human being not to let him suffer from hunger\\r\\n\\t\\t\\t\\t\\t\\twhen one has a chance of coming to his assistance.\u201D</em\\r\\n\\t\\t\\t\\t\\t> \u2013Simone Weil\\r\\n\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t<a href=\\"https://www.thaagam.org/\\" rel=\\"external\\" tabindex=\\"-1\\">\\r\\n\\t\\t\\t\\t\\t<button class=\\"btn-anim-2\\">Feed the hungry</button>\\r\\n\\t\\t\\t\\t</a>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">.container {\\n  background-color: #060606;\\n  z-index: 4;\\n  position: relative;\\n}\\n@media only screen and (max-width: 720px) {\\n  .container {\\n    margin-bottom: 2em;\\n  }\\n}\\n\\n.talk {\\n  margin-top: 4em;\\n}\\n.talk p {\\n  color: #CDCDCD;\\n  max-width: 500px;\\n}\\n@media only screen and (max-width: 720px) {\\n  .talk p {\\n    font-size: 0.8rem;\\n  }\\n}\\n.talk button {\\n  border: 1px solid #FFFFFF;\\n  font-size: 3rem;\\n  color: #FFFFFF;\\n  padding: 0.2em 0.5em;\\n  margin: 1em 0 0.5em;\\n  cursor: pointer;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .talk button {\\n    font-size: 2rem;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .talk button {\\n    font-size: 1.5rem;\\n  }\\n}\\n.talk button:hover {\\n  color: #0094FF;\\n  border-color: #0094FF;\\n  transition: 0.2s ease-in;\\n}\\n.talk button:focus {\\n  outline-color: #0094FF;\\n  outline-offset: 0.1em;\\n}\\n\\nhr {\\n  margin: 0 -14em;\\n  border: 1px solid #424242;\\n}\\n\\n.thaagam {\\n  float: right;\\n  text-align: right;\\n}\\n@media only screen and (max-width: 720px) {\\n  .thaagam {\\n    margin-bottom: 1em;\\n  }\\n}\\n.thaagam h3 {\\n  font-size: 3rem;\\n  margin: -0.5em 3em 0.5em 0;\\n}\\n.thaagam p {\\n  max-width: 400px;\\n}\\n@media only screen and (max-width: 720px) {\\n  .thaagam p {\\n    font-size: 0.8rem;\\n  }\\n}\\n.thaagam button {\\n  border: 1px solid #FFFFFF;\\n  font-size: 1.5rem;\\n  cursor: pointer;\\n  color: #FFFFFF;\\n  padding: 0.2em 0.5em;\\n  margin: 1em 0;\\n}\\n.thaagam button:hover {\\n  color: #0094FF;\\n  border-color: #0094FF;\\n  transition: 0.2s ease-in;\\n}\\n.thaagam button:focus {\\n  outline-color: #0094FF;\\n  outline-offset: 0.1em;\\n}</style>\\r\\n"],"names":[],"mappings":"AA2DmB,UAAU,8BAAC,CAAC,AAC7B,gBAAgB,CAAE,OAAO,CACzB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,UAAU,8BAAC,CAAC,AACV,aAAa,CAAE,GAAG,AACpB,CAAC,AACH,CAAC,AAED,KAAK,8BAAC,CAAC,AACL,UAAU,CAAE,GAAG,AACjB,CAAC,AACD,oBAAK,CAAC,CAAC,eAAC,CAAC,AACP,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,oBAAK,CAAC,CAAC,eAAC,CAAC,AACP,SAAS,CAAE,MAAM,AACnB,CAAC,AACH,CAAC,AACD,oBAAK,CAAC,MAAM,eAAC,CAAC,AACZ,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CACzB,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,KAAK,CAAC,KAAK,CACpB,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,KAAK,CACnB,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,oBAAK,CAAC,MAAM,eAAC,CAAC,AACZ,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,oBAAK,CAAC,MAAM,eAAC,CAAC,AACZ,SAAS,CAAE,MAAM,AACnB,CAAC,AACH,CAAC,AACD,oBAAK,CAAC,qBAAM,MAAM,AAAC,CAAC,AAClB,KAAK,CAAE,OAAO,CACd,YAAY,CAAE,OAAO,CACrB,UAAU,CAAE,IAAI,CAAC,OAAO,AAC1B,CAAC,AACD,oBAAK,CAAC,qBAAM,MAAM,AAAC,CAAC,AAClB,aAAa,CAAE,OAAO,CACtB,cAAc,CAAE,KAAK,AACvB,CAAC,AAED,EAAE,8BAAC,CAAC,AACF,MAAM,CAAE,CAAC,CAAC,KAAK,CACf,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AAC3B,CAAC,AAED,QAAQ,8BAAC,CAAC,AACR,KAAK,CAAE,KAAK,CACZ,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,QAAQ,8BAAC,CAAC,AACR,aAAa,CAAE,GAAG,AACpB,CAAC,AACH,CAAC,AACD,uBAAQ,CAAC,EAAE,eAAC,CAAC,AACX,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,MAAM,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,AAC5B,CAAC,AACD,uBAAQ,CAAC,CAAC,eAAC,CAAC,AACV,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,uBAAQ,CAAC,CAAC,eAAC,CAAC,AACV,SAAS,CAAE,MAAM,AACnB,CAAC,AACH,CAAC,AACD,uBAAQ,CAAC,MAAM,eAAC,CAAC,AACf,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CACzB,SAAS,CAAE,MAAM,CACjB,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,KAAK,CAAC,KAAK,CACpB,MAAM,CAAE,GAAG,CAAC,CAAC,AACf,CAAC,AACD,uBAAQ,CAAC,qBAAM,MAAM,AAAC,CAAC,AACrB,KAAK,CAAE,OAAO,CACd,YAAY,CAAE,OAAO,CACrB,UAAU,CAAE,IAAI,CAAC,OAAO,AAC1B,CAAC,AACD,uBAAQ,CAAC,qBAAM,MAAM,AAAC,CAAC,AACrB,aAAa,CAAE,OAAO,CACtB,cAAc,CAAE,KAAK,AACvB,CAAC"}`
};
var Contact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let mail = "8.gautham@pm.me";
  $$result.css.add(css$4);
  return `<section id="${"contact"}" class="${"main"}"><div class="${"container svelte-149qgor"}"><h2>CONTACT</h2>
			<div class="${"talk svelte-149qgor"}"><h3>Let&#39;s talk.</h3>
				<p class="${"svelte-149qgor"}">One little click of a button away from your big stuff &amp; my future. I promise I\u2019ll get back
					to you as soon as possible.
				</p>
				<button class="${"btn-anim-2 svelte-149qgor"}" title="${"\u{1F4E7} Open Mail Client / Copy Text"}" id="${"mail"}">${escape(mail)}</button>
				${validate_component(SocialMediaLinks, "SocialMediaLinks").$$render($$result, { type: "contact" }, {}, {})}</div>
			<hr class="${"svelte-149qgor"}">
			<div class="${"thaagam svelte-149qgor"}"><h3 class="${"svelte-149qgor"}">Or</h3>
				<p class="${"svelte-149qgor"}"><em>\u201CIt is an eternal obligation toward the human being not to let him suffer from hunger
						when one has a chance of coming to his assistance.\u201D</em> \u2013Simone Weil
				</p>
				<a href="${"https://www.thaagam.org/"}" rel="${"external"}" tabindex="${"-1"}"><button class="${"btn-anim-2 svelte-149qgor"}">Feed the hungry</button></a></div></div>
	</section>`;
});
var css$3 = {
  code: "svg.svelte-1gv4gnw{height:100vh;position:fixed;margin-left:1em}",
  map: '{"version":3,"file":"LineIcon.svelte","sources":["LineIcon.svelte"],"sourcesContent":["<svg width=\\"1\\" height=\\"3024\\" viewBox=\\"0 0 1 3024\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\r\\n\\t<line x1=\\"0.5\\" y1=\\"3024\\" x2=\\"0.500045\\" y2=\\"-2.18556e-08\\" stroke=\\"#494949\\" />\\r\\n</svg>\\r\\n\\r\\n<style>\\r\\n\\tsvg {\\r\\n\\t\\theight: 100vh;\\r\\n\\t\\tposition: fixed;\\r\\n\\t\\tmargin-left: 1em;\\r\\n\\t}</style>\\r\\n"],"names":[],"mappings":"AAKC,GAAG,eAAC,CAAC,AACJ,MAAM,CAAE,KAAK,CACb,QAAQ,CAAE,KAAK,CACf,WAAW,CAAE,GAAG,AACjB,CAAC"}'
};
var LineIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$3);
  return `<svg width="${"1"}" height="${"3024"}" viewBox="${"0 0 1 3024"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-1gv4gnw"}"><line x1="${"0.5"}" y1="${"3024"}" x2="${"0.500045"}" y2="${"-2.18556e-08"}" stroke="${"#494949"}"></line></svg>`;
});
var LogoIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="${"30"}" height="${"20"}" viewBox="${"0 0 30 20"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><circle cx="${"10"}" cy="${"10"}" r="${"9.5"}" stroke="${"#CDCDCD"}"></circle><circle cx="${"20"}" cy="${"10"}" r="${"9.5"}" stroke="${"#0094FF"}"></circle></svg>`;
});
var css$2 = {
  code: ".dark.svelte-5p8xgh line.svelte-5p8xgh{stroke:#060606}",
  map: `{"version":3,"file":"MenuIcon.svelte","sources":["MenuIcon.svelte"],"sourcesContent":["<script>\\r\\n\\texport let toogleMenu;\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tclass={toogleMenu ? 'dark' : ''}\\r\\n\\twidth=\\"23\\"\\r\\n\\theight=\\"23\\"\\r\\n\\tviewBox=\\"0 0 23 23\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<line\\r\\n\\t\\tid=\\"menuline1\\"\\r\\n\\t\\tx1=\\"1\\"\\r\\n\\t\\ty1=\\"7\\"\\r\\n\\t\\tx2=\\"23\\"\\r\\n\\t\\ty2=\\"7\\"\\r\\n\\t\\tstroke=\\"white\\"\\r\\n\\t\\tstroke-width=\\"2\\"\\r\\n\\t\\tstroke-linecap=\\"round\\"\\r\\n\\t/>\\r\\n\\t<line\\r\\n\\t\\tid=\\"menuline2\\"\\r\\n\\t\\tx1=\\"1\\"\\r\\n\\t\\ty1=\\"14\\"\\r\\n\\t\\tx2=\\"23\\"\\r\\n\\t\\ty2=\\"14\\"\\r\\n\\t\\tstroke=\\"white\\"\\r\\n\\t\\tstroke-width=\\"2\\"\\r\\n\\t\\tstroke-linecap=\\"round\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<!-- <svg width=\\"20\\" height=\\"19\\" viewBox=\\"0 0 20 19\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\r\\n<line x1=\\"3.41421\\" y1=\\"2.00003\\" x2=\\"18.2635\\" y2=\\"16.8493\\" stroke=\\"#121212\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/>\\r\\n<line x1=\\"2.36816\\" y1=\\"16.7175\\" x2=\\"17.2174\\" y2=\\"1.86829\\" stroke=\\"#121212\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/>\\r\\n</svg> -->\\r\\n<style lang=\\"scss\\">.dark line {\\n  stroke: #060606;\\n}</style>\\r\\n"],"names":[],"mappings":"AAsCmB,mBAAK,CAAC,IAAI,cAAC,CAAC,AAC7B,MAAM,CAAE,OAAO,AACjB,CAAC"}`
};
var MenuIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { toogleMenu } = $$props;
  if ($$props.toogleMenu === void 0 && $$bindings.toogleMenu && toogleMenu !== void 0)
    $$bindings.toogleMenu(toogleMenu);
  $$result.css.add(css$2);
  return `<svg class="${escape(null_to_empty(toogleMenu ? "dark" : "")) + " svelte-5p8xgh"}" width="${"23"}" height="${"23"}" viewBox="${"0 0 23 23"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><line id="${"menuline1"}" x1="${"1"}" y1="${"7"}" x2="${"23"}" y2="${"7"}" stroke="${"white"}" stroke-width="${"2"}" stroke-linecap="${"round"}" class="${"svelte-5p8xgh"}"></line><line id="${"menuline2"}" x1="${"1"}" y1="${"14"}" x2="${"23"}" y2="${"14"}" stroke="${"white"}" stroke-width="${"2"}" stroke-linecap="${"round"}" class="${"svelte-5p8xgh"}"></line></svg>

`;
});
var css$1 = {
  code: "header.svelte-1ctho2o.svelte-1ctho2o{position:fixed;max-width:2000px;width:100%;padding:4em 8em 0;z-index:50}header.svelte-1ctho2o #menu.svelte-1ctho2o{float:right;cursor:pointer}@media only screen and (max-width: 1280px){header.svelte-1ctho2o.svelte-1ctho2o{padding:5em 4em 0}}@media only screen and (max-width: 720px){header.svelte-1ctho2o.svelte-1ctho2o{padding:3em 1.5em 0}}",
  map: `{"version":3,"file":"Header.svelte","sources":["Header.svelte"],"sourcesContent":["<script>\\r\\n\\timport SideMenu from '../elements/SideMenu.svelte';\\r\\n\\timport LineIcon from '../svg/LineIcon.svelte';\\r\\n\\timport LogoIcon from '../svg/LogoIcon.svelte';\\r\\n\\timport MenuIcon from '../svg/MenuIcon.svelte';\\r\\n\\r\\n\\tlet toogleMenu = false;\\r\\n\\tconst hideMenu = () => {\\r\\n\\t\\ttoogleMenu = false;\\r\\n\\t};\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<header>\\r\\n\\t\\t<span><LogoIcon /></span>\\r\\n\\t\\t<button\\r\\n\\t\\t\\ton:click={() => {\\r\\n\\t\\t\\t\\ttoogleMenu = !toogleMenu;\\r\\n\\t\\t\\t}}\\r\\n\\t\\t\\tid=\\"menu\\"><MenuIcon {toogleMenu} /></button\\r\\n\\t\\t>\\r\\n\\t</header>\\r\\n\\t{#if toogleMenu}\\r\\n\\t\\t<SideMenu {hideMenu} />\\r\\n\\t{/if}\\r\\n\\t<LineIcon />\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">header {\\n  position: fixed;\\n  max-width: 2000px;\\n  width: 100%;\\n  padding: 4em 8em 0;\\n  z-index: 50;\\n}\\nheader #menu {\\n  float: right;\\n  cursor: pointer;\\n}\\n@media only screen and (max-width: 1280px) {\\n  header {\\n    padding: 5em 4em 0;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  header {\\n    padding: 3em 1.5em 0;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AA4BmB,MAAM,8BAAC,CAAC,AACzB,QAAQ,CAAE,KAAK,CACf,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,GAAG,CAAC,GAAG,CAAC,CAAC,CAClB,OAAO,CAAE,EAAE,AACb,CAAC,AACD,qBAAM,CAAC,KAAK,eAAC,CAAC,AACZ,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,MAAM,8BAAC,CAAC,AACN,OAAO,CAAE,GAAG,CAAC,GAAG,CAAC,CAAC,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,MAAM,8BAAC,CAAC,AACN,OAAO,CAAE,GAAG,CAAC,KAAK,CAAC,CAAC,AACtB,CAAC,AACH,CAAC"}`
};
var Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let toogleMenu = false;
  $$result.css.add(css$1);
  return `<header class="${"svelte-1ctho2o"}"><span>${validate_component(LogoIcon, "LogoIcon").$$render($$result, {}, {}, {})}</span>
		<button id="${"menu"}" class="${"svelte-1ctho2o"}">${validate_component(MenuIcon, "MenuIcon").$$render($$result, { toogleMenu }, {}, {})}</button></header>
	${``}
	${validate_component(LineIcon, "LineIcon").$$render($$result, {}, {}, {})}`;
});
var css = {
  code: 'html,body,div,span,h1,h2,h3,h4,h5,h6,p,a,em,img,strong,article,aside,header,section,nav,ul{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}button{text-decoration:none;border:none;background:none}a{text-decoration:none;color:#1F1F1F}*{box-sizing:border-box}html{scrollbar-width:none;scroll-behavior:smooth}html,body{overflow-x:hidden;color:#FFFFFF;font-family:"segoeui", "Segoe UI", san-serif;font-weight:normal;background-color:#060606}body{max-width:2000px;margin:0 auto}body::-webkit-scrollbar{display:none}*{scrollbar-width:thin;scrollbar-color:#CDCDCD #1F1F1F}*::-webkit-scrollbar{width:12px}*::-webkit-scrollbar-track{background:#1F1F1F}*::-webkit-scrollbar-thumb{background-color:#CDCDCD;border-radius:20px;border:3px solid #1F1F1F}h1,h2,h3,h4,h5,h6{font-family:"segoeui-bold", "Segoe UI", san-serif;font-weight:bolder;margin-bottom:1rem}h1{font-size:3.5rem}@media only screen and (max-width: 1280px){h1{font-size:3rem}}@media only screen and (max-width: 720px){h1{font-size:2rem;margin-bottom:1rem}}h2{font-size:2.5rem}@media only screen and (max-width: 1280px){h2{font-size:2rem}}h3{font-size:2rem}@media only screen and (max-width: 1280px){h3{font-size:1.8rem}}h4{font-size:1.8rem;letter-spacing:0.02rem}h5{font-size:1.5rem;letter-spacing:0.02rem}h6{font-size:1.2rem;letter-spacing:0.02rem}p,a,span{font-family:"segoeui", "Segoe UI", san-serif;font-weight:normal;font-size:1rem;letter-spacing:0.04rem;margin-bottom:0.4em;line-height:130%}@media only screen and (max-width: 1280px){p,a,span{line-height:125%}}@media only screen and (max-width: 720px){p,a,span{letter-spacing:0.02rem}}strong{font-weight:600}em{font-style:italic}.main h2{font-size:1.2rem;font-family:"segoeui", "Segoe UI", san-serif;font-weight:normal;letter-spacing:0.62em;text-align:center}main{min-height:100vh;border-right:1px solid #1F1F1F}section.main{width:100%;min-height:100vh}section.main .container{min-height:100vh;padding:8em 14em 0}@media only screen and (max-width: 1280px){section.main .container{padding:8em 8em 0}}@media only screen and (max-width: 720px){section.main .container{padding:6em 4em 0}}.footer svg{width:1rem;margin-bottom:-0.4rem}.btn-anim{transition:0.2s ease-in}.btn-anim:hover{color:#0094FF}.btn-anim:hover span{color:#0094FF}.btn-anim:hover svg path{fill:#0094FF;stroke:#0094FF}.socialmedialinks-anim:hover svg path{fill:#0094FF;transition:0.2s ease-in}.socialmedialinks-anim:hover svg.contact path{fill:#0094FF}@font-face{font-family:"segoeui";src:url("/fonts/segoeui.woff2") format("woff2"), url("/fonts/segoeui.woff") format("woff");font-weight:normal;font-style:normal;font-display:fallback}@font-face{font-family:"segoeui-bold";src:url("/fonts/segoeuib.woff2") format("woff2"), url("/fonts/segoeuib.woff") format("woff");font-weight:bold;font-style:normal;font-display:fallback}footer.svelte-lwqmjj.svelte-lwqmjj{background-color:#060606;z-index:4;position:relative;bottom:1;margin-left:0.2em}footer.svelte-lwqmjj p.svelte-lwqmjj{font-size:0.7rem;color:#A9A9A9}@media only screen and (max-width: 1280px){footer.svelte-lwqmjj.svelte-lwqmjj{background:none;margin-left:1.2em}}@media only screen and (max-height: 650px){footer.svelte-lwqmjj.svelte-lwqmjj{display:none}}',
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script>\\r\\n\\timport { onMount, afterUpdate } from 'svelte';\\r\\n\\r\\n\\timport About from '../components/main/About.svelte';\\r\\n\\timport Home from '../components/main/Home.svelte';\\r\\n\\timport Works from '../components/main/Works.svelte';\\r\\n\\timport Contact from '../components/main/Contact.svelte';\\r\\n\\timport Header from '../components/main/Header.svelte';\\r\\n\\timport LogoIcon from '../components/svg/LogoIcon.svelte';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<Header />\\r\\n\\t<main>\\r\\n\\t\\t<Home />\\r\\n\\t\\t<Works />\\r\\n\\t\\t<About />\\r\\n\\t\\t<Contact />\\r\\n\\t</main>\\r\\n\\t<footer class=\\"footer\\">\\r\\n\\t\\t<p>\\r\\n\\t\\t\\t{@html \`Designed and Built by <strong>Gautham Krishna</strong>\`}\\r\\n\\t\\t\\t<LogoIcon />\\r\\n\\t\\t\\t{@html \`&nbsp; , <br />\\r\\n\\t\\t\\tInspired from <strong>brittanychiang.com</strong> & <strong>mylesnguyen.com.</strong>\`}\\r\\n\\t\\t</p>\\r\\n\\t</footer>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">:global(html),\\n:global(body),\\n:global(div),\\n:global(span),\\n:global(h1),\\n:global(h2),\\n:global(h3),\\n:global(h4),\\n:global(h5),\\n:global(h6),\\n:global(p),\\n:global(a),\\n:global(em),\\n:global(img),\\n:global(strong),\\n:global(article),\\n:global(aside),\\n:global(header),\\n:global(section),\\n:global(nav),\\n:global(ul) {\\n  margin: 0;\\n  padding: 0;\\n  border: 0;\\n  font-size: 100%;\\n  font: inherit;\\n  vertical-align: baseline;\\n}\\n:global(article),\\n:global(aside),\\n:global(details),\\n:global(figcaption),\\n:global(figure),\\n:global(footer),\\n:global(header),\\n:global(hgroup),\\n:global(menu),\\n:global(nav),\\n:global(section) {\\n  display: block;\\n}\\n:global(body) {\\n  line-height: 1;\\n}\\n:global(ol),\\n:global(ul) {\\n  list-style: none;\\n}\\n:global(button) {\\n  text-decoration: none;\\n  border: none;\\n  background: none;\\n}\\n:global(a) {\\n  text-decoration: none;\\n  color: #1F1F1F;\\n}\\n:global(*) {\\n  box-sizing: border-box;\\n}\\n:global(html) {\\n  scrollbar-width: none;\\n  scroll-behavior: smooth;\\n}\\n:global(html),\\n:global(body) {\\n  overflow-x: hidden;\\n  color: #FFFFFF;\\n  font-family: \\"segoeui\\", \\"Segoe UI\\", san-serif;\\n  font-weight: normal;\\n  background-color: #060606;\\n}\\n:global(body) {\\n  max-width: 2000px;\\n  margin: 0 auto;\\n}\\n:global(body::-webkit-scrollbar) {\\n  display: none;\\n}\\n:global(*) {\\n  scrollbar-width: thin;\\n  scrollbar-color: #CDCDCD #1F1F1F;\\n}\\n:global(*::-webkit-scrollbar) {\\n  width: 12px;\\n}\\n:global(*::-webkit-scrollbar-track) {\\n  background: #1F1F1F;\\n}\\n:global(*::-webkit-scrollbar-thumb) {\\n  background-color: #CDCDCD;\\n  border-radius: 20px;\\n  border: 3px solid #1F1F1F;\\n}\\n:global(h1),\\n:global(h2),\\n:global(h3),\\n:global(h4),\\n:global(h5),\\n:global(h6) {\\n  font-family: \\"segoeui-bold\\", \\"Segoe UI\\", san-serif;\\n  font-weight: bolder;\\n  margin-bottom: 1rem;\\n}\\n:global(h1) {\\n  font-size: 3.5rem;\\n}\\n@media only screen and (max-width: 1280px) {\\n  :global(h1) {\\n    font-size: 3rem;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  :global(h1) {\\n    font-size: 2rem;\\n    margin-bottom: 1rem;\\n  }\\n}\\n:global(h2) {\\n  font-size: 2.5rem;\\n}\\n@media only screen and (max-width: 1280px) {\\n  :global(h2) {\\n    font-size: 2rem;\\n  }\\n}\\n:global(h3) {\\n  font-size: 2rem;\\n}\\n@media only screen and (max-width: 1280px) {\\n  :global(h3) {\\n    font-size: 1.8rem;\\n  }\\n}\\n:global(h4) {\\n  font-size: 1.8rem;\\n  letter-spacing: 0.02rem;\\n}\\n:global(h5) {\\n  font-size: 1.5rem;\\n  letter-spacing: 0.02rem;\\n}\\n:global(h6) {\\n  font-size: 1.2rem;\\n  letter-spacing: 0.02rem;\\n}\\n:global(p),\\n:global(a),\\n:global(span) {\\n  font-family: \\"segoeui\\", \\"Segoe UI\\", san-serif;\\n  font-weight: normal;\\n  font-size: 1rem;\\n  letter-spacing: 0.04rem;\\n  margin-bottom: 0.4em;\\n  line-height: 130%;\\n}\\n@media only screen and (max-width: 1280px) {\\n  :global(p),\\n:global(a),\\n:global(span) {\\n    line-height: 125%;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  :global(p),\\n:global(a),\\n:global(span) {\\n    letter-spacing: 0.02rem;\\n  }\\n}\\n:global(strong) {\\n  font-weight: 600;\\n}\\n:global(em) {\\n  font-style: italic;\\n}\\n:global(.main) :global(h2) {\\n  font-size: 1.2rem;\\n  font-family: \\"segoeui\\", \\"Segoe UI\\", san-serif;\\n  font-weight: normal;\\n  letter-spacing: 0.62em;\\n  text-align: center;\\n}\\n:global(main) {\\n  min-height: 100vh;\\n  border-right: 1px solid #1F1F1F;\\n}\\n:global(section.main) {\\n  width: 100%;\\n  min-height: 100vh;\\n}\\n:global(section.main) :global(.container) {\\n  min-height: 100vh;\\n  padding: 8em 14em 0;\\n}\\n@media only screen and (max-width: 1280px) {\\n  :global(section.main) :global(.container) {\\n    padding: 8em 8em 0;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  :global(section.main) :global(.container) {\\n    padding: 6em 4em 0;\\n  }\\n}\\n:global(.footer) :global(svg) {\\n  width: 1rem;\\n  margin-bottom: -0.4rem;\\n}\\n:global(.btn-anim) {\\n  transition: 0.2s ease-in;\\n}\\n:global(.btn-anim:hover) {\\n  color: #0094FF;\\n}\\n:global(.btn-anim:hover) :global(span) {\\n  color: #0094FF;\\n}\\n:global(.btn-anim:hover) :global(svg) :global(path) {\\n  fill: #0094FF;\\n  stroke: #0094FF;\\n}\\n:global(.socialmedialinks-anim:hover) :global(svg) :global(path) {\\n  fill: #0094FF;\\n  transition: 0.2s ease-in;\\n}\\n:global(.socialmedialinks-anim:hover) :global(svg.contact) :global(path) {\\n  fill: #0094FF;\\n}\\n\\n@font-face {\\n  font-family: \\"segoeui\\";\\n  src: url(\\"/fonts/segoeui.woff2\\") format(\\"woff2\\"), url(\\"/fonts/segoeui.woff\\") format(\\"woff\\");\\n  font-weight: normal;\\n  font-style: normal;\\n  font-display: fallback;\\n}\\n@font-face {\\n  font-family: \\"segoeui-bold\\";\\n  src: url(\\"/fonts/segoeuib.woff2\\") format(\\"woff2\\"), url(\\"/fonts/segoeuib.woff\\") format(\\"woff\\");\\n  font-weight: bold;\\n  font-style: normal;\\n  font-display: fallback;\\n}\\nfooter {\\n  background-color: #060606;\\n  z-index: 4;\\n  position: relative;\\n  bottom: 1;\\n  margin-left: 0.2em;\\n}\\nfooter p {\\n  font-size: 0.7rem;\\n  color: #A9A9A9;\\n}\\n@media only screen and (max-width: 1280px) {\\n  footer {\\n    background: none;\\n    margin-left: 1.2em;\\n  }\\n}\\n@media only screen and (max-height: 650px) {\\n  footer {\\n    display: none;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AA6B2B,IAAI,AAAC,CACxB,IAAI,AAAC,CACL,GAAG,AAAC,CACJ,IAAI,AAAC,CACL,EAAE,AAAC,CACH,EAAE,AAAC,CACH,EAAE,AAAC,CACH,EAAE,AAAC,CACH,EAAE,AAAC,CACH,EAAE,AAAC,CACH,CAAC,AAAC,CACF,CAAC,AAAC,CACF,EAAE,AAAC,CACH,GAAG,AAAC,CACJ,MAAM,AAAC,CACP,OAAO,AAAC,CACR,KAAK,AAAC,CACN,MAAM,AAAC,CACP,OAAO,AAAC,CACR,GAAG,AAAC,CACJ,EAAE,AAAE,CAAC,AACX,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,SAAS,CAAE,IAAI,CACf,IAAI,CAAE,OAAO,CACb,cAAc,CAAE,QAAQ,AAC1B,CAAC,AACO,OAAO,AAAC,CACR,KAAK,AAAC,CACN,OAAO,AAAC,CACR,UAAU,AAAC,CACX,MAAM,AAAC,CACP,MAAM,AAAC,CACP,MAAM,AAAC,CACP,MAAM,AAAC,CACP,IAAI,AAAC,CACL,GAAG,AAAC,CACJ,OAAO,AAAE,CAAC,AAChB,OAAO,CAAE,KAAK,AAChB,CAAC,AACO,IAAI,AAAE,CAAC,AACb,WAAW,CAAE,CAAC,AAChB,CAAC,AACO,EAAE,AAAC,CACH,EAAE,AAAE,CAAC,AACX,UAAU,CAAE,IAAI,AAClB,CAAC,AACO,MAAM,AAAE,CAAC,AACf,eAAe,CAAE,IAAI,CACrB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,AAClB,CAAC,AACO,CAAC,AAAE,CAAC,AACV,eAAe,CAAE,IAAI,CACrB,KAAK,CAAE,OAAO,AAChB,CAAC,AACO,CAAC,AAAE,CAAC,AACV,UAAU,CAAE,UAAU,AACxB,CAAC,AACO,IAAI,AAAE,CAAC,AACb,eAAe,CAAE,IAAI,CACrB,eAAe,CAAE,MAAM,AACzB,CAAC,AACO,IAAI,AAAC,CACL,IAAI,AAAE,CAAC,AACb,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,OAAO,CACd,WAAW,CAAE,SAAS,CAAC,CAAC,UAAU,CAAC,CAAC,SAAS,CAC7C,WAAW,CAAE,MAAM,CACnB,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AACO,IAAI,AAAE,CAAC,AACb,SAAS,CAAE,MAAM,CACjB,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AACO,uBAAuB,AAAE,CAAC,AAChC,OAAO,CAAE,IAAI,AACf,CAAC,AACO,CAAC,AAAE,CAAC,AACV,eAAe,CAAE,IAAI,CACrB,eAAe,CAAE,OAAO,CAAC,OAAO,AAClC,CAAC,AACO,oBAAoB,AAAE,CAAC,AAC7B,KAAK,CAAE,IAAI,AACb,CAAC,AACO,0BAA0B,AAAE,CAAC,AACnC,UAAU,CAAE,OAAO,AACrB,CAAC,AACO,0BAA0B,AAAE,CAAC,AACnC,gBAAgB,CAAE,OAAO,CACzB,aAAa,CAAE,IAAI,CACnB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AAC3B,CAAC,AACO,EAAE,AAAC,CACH,EAAE,AAAC,CACH,EAAE,AAAC,CACH,EAAE,AAAC,CACH,EAAE,AAAC,CACH,EAAE,AAAE,CAAC,AACX,WAAW,CAAE,cAAc,CAAC,CAAC,UAAU,CAAC,CAAC,SAAS,CAClD,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,IAAI,AACrB,CAAC,AACO,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,MAAM,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAClC,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACjC,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,IAAI,CACf,aAAa,CAAE,IAAI,AACrB,CAAC,AACH,CAAC,AACO,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,MAAM,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAClC,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACO,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAClC,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,MAAM,AACnB,CAAC,AACH,CAAC,AACO,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,MAAM,CACjB,cAAc,CAAE,OAAO,AACzB,CAAC,AACO,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,MAAM,CACjB,cAAc,CAAE,OAAO,AACzB,CAAC,AACO,EAAE,AAAE,CAAC,AACX,SAAS,CAAE,MAAM,CACjB,cAAc,CAAE,OAAO,AACzB,CAAC,AACO,CAAC,AAAC,CACF,CAAC,AAAC,CACF,IAAI,AAAE,CAAC,AACb,WAAW,CAAE,SAAS,CAAC,CAAC,UAAU,CAAC,CAAC,SAAS,CAC7C,WAAW,CAAE,MAAM,CACnB,SAAS,CAAE,IAAI,CACf,cAAc,CAAE,OAAO,CACvB,aAAa,CAAE,KAAK,CACpB,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAClC,CAAC,AAAC,CACJ,CAAC,AAAC,CACF,IAAI,AAAE,CAAC,AACX,WAAW,CAAE,IAAI,AACnB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACjC,CAAC,AAAC,CACJ,CAAC,AAAC,CACF,IAAI,AAAE,CAAC,AACX,cAAc,CAAE,OAAO,AACzB,CAAC,AACH,CAAC,AACO,MAAM,AAAE,CAAC,AACf,WAAW,CAAE,GAAG,AAClB,CAAC,AACO,EAAE,AAAE,CAAC,AACX,UAAU,CAAE,MAAM,AACpB,CAAC,AACO,KAAK,AAAC,CAAC,AAAQ,EAAE,AAAE,CAAC,AAC1B,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,SAAS,CAAC,CAAC,UAAU,CAAC,CAAC,SAAS,CAC7C,WAAW,CAAE,MAAM,CACnB,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,MAAM,AACpB,CAAC,AACO,IAAI,AAAE,CAAC,AACb,UAAU,CAAE,KAAK,CACjB,YAAY,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AACjC,CAAC,AACO,YAAY,AAAE,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,AACnB,CAAC,AACO,YAAY,AAAC,CAAC,AAAQ,UAAU,AAAE,CAAC,AACzC,UAAU,CAAE,KAAK,CACjB,OAAO,CAAE,GAAG,CAAC,IAAI,CAAC,CAAC,AACrB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAClC,YAAY,AAAC,CAAC,AAAQ,UAAU,AAAE,CAAC,AACzC,OAAO,CAAE,GAAG,CAAC,GAAG,CAAC,CAAC,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACjC,YAAY,AAAC,CAAC,AAAQ,UAAU,AAAE,CAAC,AACzC,OAAO,CAAE,GAAG,CAAC,GAAG,CAAC,CAAC,AACpB,CAAC,AACH,CAAC,AACO,OAAO,AAAC,CAAC,AAAQ,GAAG,AAAE,CAAC,AAC7B,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,OAAO,AACxB,CAAC,AACO,SAAS,AAAE,CAAC,AAClB,UAAU,CAAE,IAAI,CAAC,OAAO,AAC1B,CAAC,AACO,eAAe,AAAE,CAAC,AACxB,KAAK,CAAE,OAAO,AAChB,CAAC,AACO,eAAe,AAAC,CAAC,AAAQ,IAAI,AAAE,CAAC,AACtC,KAAK,CAAE,OAAO,AAChB,CAAC,AACO,eAAe,AAAC,CAAC,AAAQ,GAAG,AAAC,CAAC,AAAQ,IAAI,AAAE,CAAC,AACnD,IAAI,CAAE,OAAO,CACb,MAAM,CAAE,OAAO,AACjB,CAAC,AACO,4BAA4B,AAAC,CAAC,AAAQ,GAAG,AAAC,CAAC,AAAQ,IAAI,AAAE,CAAC,AAChE,IAAI,CAAE,OAAO,CACb,UAAU,CAAE,IAAI,CAAC,OAAO,AAC1B,CAAC,AACO,4BAA4B,AAAC,CAAC,AAAQ,WAAW,AAAC,CAAC,AAAQ,IAAI,AAAE,CAAC,AACxE,IAAI,CAAE,OAAO,AACf,CAAC,AAED,UAAU,AAAC,CAAC,AACV,WAAW,CAAE,SAAS,CACtB,GAAG,CAAE,IAAI,sBAAsB,CAAC,CAAC,OAAO,OAAO,CAAC,CAAC,CAAC,IAAI,qBAAqB,CAAC,CAAC,OAAO,MAAM,CAAC,CAC3F,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,MAAM,CAClB,YAAY,CAAE,QAAQ,AACxB,CAAC,AACD,UAAU,AAAC,CAAC,AACV,WAAW,CAAE,cAAc,CAC3B,GAAG,CAAE,IAAI,uBAAuB,CAAC,CAAC,OAAO,OAAO,CAAC,CAAC,CAAC,IAAI,sBAAsB,CAAC,CAAC,OAAO,MAAM,CAAC,CAC7F,WAAW,CAAE,IAAI,CACjB,UAAU,CAAE,MAAM,CAClB,YAAY,CAAE,QAAQ,AACxB,CAAC,AACD,MAAM,4BAAC,CAAC,AACN,gBAAgB,CAAE,OAAO,CACzB,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,WAAW,CAAE,KAAK,AACpB,CAAC,AACD,oBAAM,CAAC,CAAC,cAAC,CAAC,AACR,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,OAAO,AAChB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,MAAM,4BAAC,CAAC,AACN,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,MAAM,4BAAC,CAAC,AACN,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC"}`
};
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}
	<main>${validate_component(Home, "Home").$$render($$result, {}, {}, {})}
		${validate_component(Works, "Works").$$render($$result, {}, {}, {})}
		${validate_component(About, "About").$$render($$result, {}, {}, {})}
		${validate_component(Contact, "Contact").$$render($$result, {}, {}, {})}</main>
	<footer class="${"footer svelte-lwqmjj"}"><p class="${"svelte-lwqmjj"}"><!-- HTML_TAG_START -->${`Designed and Built by <strong>Gautham Krishna</strong>`}<!-- HTML_TAG_END -->
			${validate_component(LogoIcon, "LogoIcon").$$render($$result, {}, {}, {})}
			<!-- HTML_TAG_START -->${`&nbsp; , <br />
			Inspired from <strong>brittanychiang.com</strong> & <strong>mylesnguyen.com.</strong>`}<!-- HTML_TAG_END --></p>
	</footer>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
