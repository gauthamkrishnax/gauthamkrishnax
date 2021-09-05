var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// node_modules/@sveltejs/kit/dist/install-fetch.js
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
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
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
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
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
    body = body.stream();
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
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    if (error2 instanceof FetchBaseError) {
      throw error2;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    }
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
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
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
              try {
                headers.set("Location", locationURL);
              } catch (error2) {
                reject(error2);
              }
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
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
        reject(error2);
      });
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
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error2) => {
          reject(error2);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
          reject(error2);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error2) => {
              reject(error2);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error2) => {
              reject(error2);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error2) => {
          reject(error2);
        });
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
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
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
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
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
          body.on("error", (err) => {
            const error2 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
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
    clone = (instance, highWaterMark) => {
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
    extractContentType = (body, request) => {
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
    getTotalBytes = (request) => {
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
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
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
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
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
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
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
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
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
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
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
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
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
    getNodeRequestOptions = (request) => {
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
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/gsap/dist/gsap.js
var require_gsap = __commonJS({
  "node_modules/gsap/dist/gsap.js"(exports, module2) {
    init_shims();
    (function(global, factory) {
      typeof exports === "object" && typeof module2 !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = global || self, factory(global.window = global.window || {}));
    })(exports, function(exports2) {
      "use strict";
      function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
      }
      function _assertThisInitialized(self2) {
        if (self2 === void 0) {
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }
        return self2;
      }
      var _config = {
        autoSleep: 120,
        force3D: "auto",
        nullTargetWarn: 1,
        units: {
          lineHeight: ""
        }
      }, _defaults = {
        duration: 0.5,
        overwrite: false,
        delay: 0
      }, _suppressOverwrites, _bigNum = 1e8, _tinyNum = 1 / _bigNum, _2PI = Math.PI * 2, _HALF_PI = _2PI / 4, _gsID = 0, _sqrt = Math.sqrt, _cos = Math.cos, _sin = Math.sin, _isString = function _isString2(value) {
        return typeof value === "string";
      }, _isFunction = function _isFunction2(value) {
        return typeof value === "function";
      }, _isNumber = function _isNumber2(value) {
        return typeof value === "number";
      }, _isUndefined = function _isUndefined2(value) {
        return typeof value === "undefined";
      }, _isObject = function _isObject2(value) {
        return typeof value === "object";
      }, _isNotFalse = function _isNotFalse2(value) {
        return value !== false;
      }, _windowExists = function _windowExists2() {
        return typeof window !== "undefined";
      }, _isFuncOrString = function _isFuncOrString2(value) {
        return _isFunction(value) || _isString(value);
      }, _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function() {
      }, _isArray = Array.isArray, _strictNumExp = /(?:-?\.?\d|\.)+/gi, _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, _relExp = /[+-]=-?[.\d]+/, _delimitedValueExp = /[^,'"\[\]\s]+/gi, _unitExp = /[\d.+\-=]+(?:e[-+]\d*)*/i, _globalTimeline, _win, _coreInitted, _doc, _globals = {}, _installScope = {}, _coreReady, _install = function _install2(scope) {
        return (_installScope = _merge(scope, _globals)) && gsap2;
      }, _missingPlugin = function _missingPlugin2(property, value) {
        return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
      }, _warn = function _warn2(message, suppress) {
        return !suppress && console.warn(message);
      }, _addGlobal = function _addGlobal2(name, obj) {
        return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
      }, _emptyFunc = function _emptyFunc2() {
        return 0;
      }, _reservedProps = {}, _lazyTweens = [], _lazyLookup = {}, _lastRenderedFrame, _plugins = {}, _effects = {}, _nextGCFrame = 30, _harnessPlugins = [], _callbackNames = "", _harness = function _harness2(targets) {
        var target = targets[0], harnessPlugin, i;
        _isObject(target) || _isFunction(target) || (targets = [targets]);
        if (!(harnessPlugin = (target._gsap || {}).harness)) {
          i = _harnessPlugins.length;
          while (i-- && !_harnessPlugins[i].targetTest(target)) {
          }
          harnessPlugin = _harnessPlugins[i];
        }
        i = targets.length;
        while (i--) {
          targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
        }
        return targets;
      }, _getCache = function _getCache2(target) {
        return target._gsap || _harness(toArray(target))[0]._gsap;
      }, _getProperty = function _getProperty2(target, property, v) {
        return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
      }, _forEachName = function _forEachName2(names, func) {
        return (names = names.split(",")).forEach(func) || names;
      }, _round = function _round2(value) {
        return Math.round(value * 1e5) / 1e5 || 0;
      }, _arrayContainsAny = function _arrayContainsAny2(toSearch, toFind) {
        var l = toFind.length, i = 0;
        for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l; ) {
        }
        return i < l;
      }, _lazyRender = function _lazyRender2() {
        var l = _lazyTweens.length, a = _lazyTweens.slice(0), i, tween;
        _lazyLookup = {};
        _lazyTweens.length = 0;
        for (i = 0; i < l; i++) {
          tween = a[i];
          tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
        }
      }, _lazySafeRender = function _lazySafeRender2(animation, time, suppressEvents, force) {
        _lazyTweens.length && _lazyRender();
        animation.render(time, suppressEvents, force);
        _lazyTweens.length && _lazyRender();
      }, _numericIfPossible = function _numericIfPossible2(value) {
        var n = parseFloat(value);
        return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
      }, _passThrough = function _passThrough2(p) {
        return p;
      }, _setDefaults = function _setDefaults2(obj, defaults) {
        for (var p in defaults) {
          p in obj || (obj[p] = defaults[p]);
        }
        return obj;
      }, _setKeyframeDefaults = function _setKeyframeDefaults2(obj, defaults) {
        for (var p in defaults) {
          p in obj || p === "duration" || p === "ease" || (obj[p] = defaults[p]);
        }
      }, _merge = function _merge2(base2, toMerge) {
        for (var p in toMerge) {
          base2[p] = toMerge[p];
        }
        return base2;
      }, _mergeDeep = function _mergeDeep2(base2, toMerge) {
        for (var p in toMerge) {
          p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base2[p] = _isObject(toMerge[p]) ? _mergeDeep2(base2[p] || (base2[p] = {}), toMerge[p]) : toMerge[p]);
        }
        return base2;
      }, _copyExcluding = function _copyExcluding2(obj, excluding) {
        var copy = {}, p;
        for (p in obj) {
          p in excluding || (copy[p] = obj[p]);
        }
        return copy;
      }, _inheritDefaults = function _inheritDefaults2(vars) {
        var parent = vars.parent || _globalTimeline, func = vars.keyframes ? _setKeyframeDefaults : _setDefaults;
        if (_isNotFalse(vars.inherit)) {
          while (parent) {
            func(vars, parent.vars.defaults);
            parent = parent.parent || parent._dp;
          }
        }
        return vars;
      }, _arraysMatch = function _arraysMatch2(a1, a2) {
        var i = a1.length, match = i === a2.length;
        while (match && i-- && a1[i] === a2[i]) {
        }
        return i < 0;
      }, _addLinkedListItem = function _addLinkedListItem2(parent, child, firstProp, lastProp, sortBy) {
        if (firstProp === void 0) {
          firstProp = "_first";
        }
        if (lastProp === void 0) {
          lastProp = "_last";
        }
        var prev = parent[lastProp], t;
        if (sortBy) {
          t = child[sortBy];
          while (prev && prev[sortBy] > t) {
            prev = prev._prev;
          }
        }
        if (prev) {
          child._next = prev._next;
          prev._next = child;
        } else {
          child._next = parent[firstProp];
          parent[firstProp] = child;
        }
        if (child._next) {
          child._next._prev = child;
        } else {
          parent[lastProp] = child;
        }
        child._prev = prev;
        child.parent = child._dp = parent;
        return child;
      }, _removeLinkedListItem = function _removeLinkedListItem2(parent, child, firstProp, lastProp) {
        if (firstProp === void 0) {
          firstProp = "_first";
        }
        if (lastProp === void 0) {
          lastProp = "_last";
        }
        var prev = child._prev, next = child._next;
        if (prev) {
          prev._next = next;
        } else if (parent[firstProp] === child) {
          parent[firstProp] = next;
        }
        if (next) {
          next._prev = prev;
        } else if (parent[lastProp] === child) {
          parent[lastProp] = prev;
        }
        child._next = child._prev = child.parent = null;
      }, _removeFromParent = function _removeFromParent2(child, onlyIfParentHasAutoRemove) {
        child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
        child._act = 0;
      }, _uncache = function _uncache2(animation, child) {
        if (animation && (!child || child._end > animation._dur || child._start < 0)) {
          var a = animation;
          while (a) {
            a._dirty = 1;
            a = a.parent;
          }
        }
        return animation;
      }, _recacheAncestors = function _recacheAncestors2(animation) {
        var parent = animation.parent;
        while (parent && parent.parent) {
          parent._dirty = 1;
          parent.totalDuration();
          parent = parent.parent;
        }
        return animation;
      }, _hasNoPausedAncestors = function _hasNoPausedAncestors2(animation) {
        return !animation || animation._ts && _hasNoPausedAncestors2(animation.parent);
      }, _elapsedCycleDuration = function _elapsedCycleDuration2(animation) {
        return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
      }, _animationCycle = function _animationCycle2(tTime, cycleDuration) {
        var whole = Math.floor(tTime /= cycleDuration);
        return tTime && whole === tTime ? whole - 1 : whole;
      }, _parentToChildTotalTime = function _parentToChildTotalTime2(parentTime, child) {
        return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
      }, _setEnd = function _setEnd2(animation) {
        return animation._end = _round(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
      }, _alignPlayhead = function _alignPlayhead2(animation, totalTime) {
        var parent = animation._dp;
        if (parent && parent.smoothChildTiming && animation._ts) {
          animation._start = _round(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
          _setEnd(animation);
          parent._dirty || _uncache(parent, animation);
        }
        return animation;
      }, _postAddChecks = function _postAddChecks2(timeline, child) {
        var t;
        if (child._time || child._initted && !child._dur) {
          t = _parentToChildTotalTime(timeline.rawTime(), child);
          if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
            child.render(t, true);
          }
        }
        if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
          if (timeline._dur < timeline.duration()) {
            t = timeline;
            while (t._dp) {
              t.rawTime() >= 0 && t.totalTime(t._tTime);
              t = t._dp;
            }
          }
          timeline._zTime = -_tinyNum;
        }
      }, _addToTimeline = function _addToTimeline2(timeline, child, position, skipChecks) {
        child.parent && _removeFromParent(child);
        child._start = _round((_isNumber(position) ? position : position || timeline !== _globalTimeline ? _parsePosition(timeline, position, child) : timeline._time) + child._delay);
        child._end = _round(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
        _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);
        _isFromOrFromStart(child) || (timeline._recent = child);
        skipChecks || _postAddChecks(timeline, child);
        return timeline;
      }, _scrollTrigger = function _scrollTrigger2(animation, trigger) {
        return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
      }, _attemptInitTween = function _attemptInitTween2(tween, totalTime, force, suppressEvents) {
        _initTween(tween, totalTime);
        if (!tween._initted) {
          return 1;
        }
        if (!force && tween._pt && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
          _lazyTweens.push(tween);
          tween._lazy = [totalTime, suppressEvents];
          return 1;
        }
      }, _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart2(_ref) {
        var parent = _ref.parent;
        return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart2(parent));
      }, _isFromOrFromStart = function _isFromOrFromStart2(_ref2) {
        var data = _ref2.data;
        return data === "isFromStart" || data === "isStart";
      }, _renderZeroDurationTween = function _renderZeroDurationTween2(tween, totalTime, suppressEvents, force) {
        var prevRatio = tween.ratio, ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1, repeatDelay = tween._rDelay, tTime = 0, pt, iteration, prevIteration;
        if (repeatDelay && tween._repeat) {
          tTime = _clamp(0, tween._tDur, totalTime);
          iteration = _animationCycle(tTime, repeatDelay);
          prevIteration = _animationCycle(tween._tTime, repeatDelay);
          tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
          if (iteration !== prevIteration) {
            prevRatio = 1 - ratio;
            tween.vars.repeatRefresh && tween._initted && tween.invalidate();
          }
        }
        if (ratio !== prevRatio || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
          if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents)) {
            return;
          }
          prevIteration = tween._zTime;
          tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
          suppressEvents || (suppressEvents = totalTime && !prevIteration);
          tween.ratio = ratio;
          tween._from && (ratio = 1 - ratio);
          tween._time = 0;
          tween._tTime = tTime;
          pt = tween._pt;
          while (pt) {
            pt.r(ratio, pt.d);
            pt = pt._next;
          }
          tween._startAt && totalTime < 0 && tween._startAt.render(totalTime, true, true);
          tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
          tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");
          if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
            ratio && _removeFromParent(tween, 1);
            if (!suppressEvents) {
              _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);
              tween._prom && tween._prom();
            }
          }
        } else if (!tween._zTime) {
          tween._zTime = totalTime;
        }
      }, _findNextPauseTween = function _findNextPauseTween2(animation, prevTime, time) {
        var child;
        if (time > prevTime) {
          child = animation._first;
          while (child && child._start <= time) {
            if (!child._dur && child.data === "isPause" && child._start > prevTime) {
              return child;
            }
            child = child._next;
          }
        } else {
          child = animation._last;
          while (child && child._start >= time) {
            if (!child._dur && child.data === "isPause" && child._start < prevTime) {
              return child;
            }
            child = child._prev;
          }
        }
      }, _setDuration = function _setDuration2(animation, duration, skipUncache, leavePlayhead) {
        var repeat = animation._repeat, dur = _round(duration) || 0, totalProgress = animation._tTime / animation._tDur;
        totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
        animation._dur = dur;
        animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _round(dur * (repeat + 1) + animation._rDelay * repeat);
        totalProgress && !leavePlayhead ? _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress) : animation.parent && _setEnd(animation);
        skipUncache || _uncache(animation.parent, animation);
        return animation;
      }, _onUpdateTotalDuration = function _onUpdateTotalDuration2(animation) {
        return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
      }, _zeroPosition = {
        _start: 0,
        endTime: _emptyFunc,
        totalDuration: _emptyFunc
      }, _parsePosition = function _parsePosition2(animation, position, percentAnimation) {
        var labels = animation.labels, recent = animation._recent || _zeroPosition, clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur, i, offset, isPercent;
        if (_isString(position) && (isNaN(position) || position in labels)) {
          offset = position.charAt(0);
          isPercent = position.substr(-1) === "%";
          i = position.indexOf("=");
          if (offset === "<" || offset === ">") {
            i >= 0 && (position = position.replace(/=/, ""));
            return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
          }
          if (i < 0) {
            position in labels || (labels[position] = clippedDuration);
            return labels[position];
          }
          offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
          if (isPercent && percentAnimation) {
            offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
          }
          return i > 1 ? _parsePosition2(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
        }
        return position == null ? clippedDuration : +position;
      }, _createTweenType = function _createTweenType2(type, params, timeline) {
        var isLegacy = _isNumber(params[1]), varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1), vars = params[varsIndex], irVars, parent;
        isLegacy && (vars.duration = params[1]);
        vars.parent = timeline;
        if (type) {
          irVars = vars;
          parent = timeline;
          while (parent && !("immediateRender" in irVars)) {
            irVars = parent.vars.defaults || {};
            parent = _isNotFalse(parent.vars.inherit) && parent.parent;
          }
          vars.immediateRender = _isNotFalse(irVars.immediateRender);
          type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
        }
        return new Tween(params[0], vars, params[varsIndex + 1]);
      }, _conditionalReturn = function _conditionalReturn2(value, func) {
        return value || value === 0 ? func(value) : func;
      }, _clamp = function _clamp2(min, max, value) {
        return value < min ? min : value > max ? max : value;
      }, getUnit = function getUnit2(value) {
        if (typeof value !== "string") {
          return "";
        }
        var v = _unitExp.exec(value);
        return v ? value.substr(v.index + v[0].length) : "";
      }, clamp = function clamp2(min, max, value) {
        return _conditionalReturn(value, function(v) {
          return _clamp(min, max, v);
        });
      }, _slice = [].slice, _isArrayLike = function _isArrayLike2(value, nonEmpty) {
        return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
      }, _flatten = function _flatten2(ar, leaveStrings, accumulator) {
        if (accumulator === void 0) {
          accumulator = [];
        }
        return ar.forEach(function(value) {
          var _accumulator;
          return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
        }) || accumulator;
      }, toArray = function toArray2(value, scope, leaveStrings) {
        return _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
      }, selector = function selector2(value) {
        value = toArray(value)[0] || _warn("Invalid scope") || {};
        return function(v) {
          var el = value.current || value.nativeElement || value;
          return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc.createElement("div") : value);
        };
      }, shuffle = function shuffle2(a) {
        return a.sort(function() {
          return 0.5 - Math.random();
        });
      }, distribute = function distribute2(v) {
        if (_isFunction(v)) {
          return v;
        }
        var vars = _isObject(v) ? v : {
          each: v
        }, ease = _parseEase(vars.ease), from = vars.from || 0, base2 = parseFloat(vars.base) || 0, cache = {}, isDecimal = from > 0 && from < 1, ratios = isNaN(from) || isDecimal, axis = vars.axis, ratioX = from, ratioY = from;
        if (_isString(from)) {
          ratioX = ratioY = {
            center: 0.5,
            edges: 0.5,
            end: 1
          }[from] || 0;
        } else if (!isDecimal && ratios) {
          ratioX = from[0];
          ratioY = from[1];
        }
        return function(i, target, a) {
          var l = (a || vars).length, distances = cache[l], originX, originY, x, y, d, j, max, min, wrapAt;
          if (!distances) {
            wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];
            if (!wrapAt) {
              max = -_bigNum;
              while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {
              }
              wrapAt--;
            }
            distances = cache[l] = [];
            originX = ratios ? Math.min(wrapAt, l) * ratioX - 0.5 : from % wrapAt;
            originY = ratios ? l * ratioY / wrapAt - 0.5 : from / wrapAt | 0;
            max = 0;
            min = _bigNum;
            for (j = 0; j < l; j++) {
              x = j % wrapAt - originX;
              y = originY - (j / wrapAt | 0);
              distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
              d > max && (max = d);
              d < min && (min = d);
            }
            from === "random" && shuffle(distances);
            distances.max = max - min;
            distances.min = min;
            distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
            distances.b = l < 0 ? base2 - l : base2;
            distances.u = getUnit(vars.amount || vars.each) || 0;
            ease = ease && l < 0 ? _invertEase(ease) : ease;
          }
          l = (distances[i] - distances.min) / distances.max || 0;
          return _round(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u;
        };
      }, _roundModifier = function _roundModifier2(v) {
        var p = v < 1 ? Math.pow(10, (v + "").length - 2) : 1;
        return function(raw) {
          var n = Math.round(parseFloat(raw) / v) * v * p;
          return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw));
        };
      }, snap = function snap2(snapTo, value) {
        var isArray = _isArray(snapTo), radius, is2D;
        if (!isArray && _isObject(snapTo)) {
          radius = isArray = snapTo.radius || _bigNum;
          if (snapTo.values) {
            snapTo = toArray(snapTo.values);
            if (is2D = !_isNumber(snapTo[0])) {
              radius *= radius;
            }
          } else {
            snapTo = _roundModifier(snapTo.increment);
          }
        }
        return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function(raw) {
          is2D = snapTo(raw);
          return Math.abs(is2D - raw) <= radius ? is2D : raw;
        } : function(raw) {
          var x = parseFloat(is2D ? raw.x : raw), y = parseFloat(is2D ? raw.y : 0), min = _bigNum, closest = 0, i = snapTo.length, dx, dy;
          while (i--) {
            if (is2D) {
              dx = snapTo[i].x - x;
              dy = snapTo[i].y - y;
              dx = dx * dx + dy * dy;
            } else {
              dx = Math.abs(snapTo[i] - x);
            }
            if (dx < min) {
              min = dx;
              closest = i;
            }
          }
          closest = !radius || min <= radius ? snapTo[closest] : raw;
          return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
        });
      }, random = function random2(min, max, roundingIncrement, returnFunction) {
        return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function() {
          return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * 0.99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
        });
      }, pipe = function pipe2() {
        for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
          functions[_key] = arguments[_key];
        }
        return function(value) {
          return functions.reduce(function(v, f) {
            return f(v);
          }, value);
        };
      }, unitize = function unitize2(func, unit) {
        return function(value) {
          return func(parseFloat(value)) + (unit || getUnit(value));
        };
      }, normalize2 = function normalize3(min, max, value) {
        return mapRange(min, max, 0, 1, value);
      }, _wrapArray = function _wrapArray2(a, wrapper, value) {
        return _conditionalReturn(value, function(index2) {
          return a[~~wrapper(index2)];
        });
      }, wrap = function wrap2(min, max, value) {
        var range = max - min;
        return _isArray(min) ? _wrapArray(min, wrap2(0, min.length), max) : _conditionalReturn(value, function(value2) {
          return (range + (value2 - min) % range) % range + min;
        });
      }, wrapYoyo = function wrapYoyo2(min, max, value) {
        var range = max - min, total = range * 2;
        return _isArray(min) ? _wrapArray(min, wrapYoyo2(0, min.length - 1), max) : _conditionalReturn(value, function(value2) {
          value2 = (total + (value2 - min) % total) % total || 0;
          return min + (value2 > range ? total - value2 : value2);
        });
      }, _replaceRandom = function _replaceRandom2(value) {
        var prev = 0, s7 = "", i, nums, end, isArray;
        while (~(i = value.indexOf("random(", prev))) {
          end = value.indexOf(")", i);
          isArray = value.charAt(i + 7) === "[";
          nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
          s7 += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
          prev = end + 1;
        }
        return s7 + value.substr(prev, value.length - prev);
      }, mapRange = function mapRange2(inMin, inMax, outMin, outMax, value) {
        var inRange = inMax - inMin, outRange = outMax - outMin;
        return _conditionalReturn(value, function(value2) {
          return outMin + ((value2 - inMin) / inRange * outRange || 0);
        });
      }, interpolate = function interpolate2(start, end, progress, mutate) {
        var func = isNaN(start + end) ? 0 : function(p2) {
          return (1 - p2) * start + p2 * end;
        };
        if (!func) {
          var isString = _isString(start), master = {}, p, i, interpolators, l, il;
          progress === true && (mutate = 1) && (progress = null);
          if (isString) {
            start = {
              p: start
            };
            end = {
              p: end
            };
          } else if (_isArray(start) && !_isArray(end)) {
            interpolators = [];
            l = start.length;
            il = l - 2;
            for (i = 1; i < l; i++) {
              interpolators.push(interpolate2(start[i - 1], start[i]));
            }
            l--;
            func = function func2(p2) {
              p2 *= l;
              var i2 = Math.min(il, ~~p2);
              return interpolators[i2](p2 - i2);
            };
            progress = end;
          } else if (!mutate) {
            start = _merge(_isArray(start) ? [] : {}, start);
          }
          if (!interpolators) {
            for (p in end) {
              _addPropTween.call(master, start, p, "get", end[p]);
            }
            func = function func2(p2) {
              return _renderPropTweens(p2, master) || (isString ? start.p : start);
            };
          }
        }
        return _conditionalReturn(progress, func);
      }, _getLabelInDirection = function _getLabelInDirection2(timeline, fromTime, backward) {
        var labels = timeline.labels, min = _bigNum, p, distance, label;
        for (p in labels) {
          distance = labels[p] - fromTime;
          if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
            label = p;
            min = distance;
          }
        }
        return label;
      }, _callback = function _callback2(animation, type, executeLazyFirst) {
        var v = animation.vars, callback = v[type], params, scope;
        if (!callback) {
          return;
        }
        params = v[type + "Params"];
        scope = v.callbackScope || animation;
        executeLazyFirst && _lazyTweens.length && _lazyRender();
        return params ? callback.apply(scope, params) : callback.call(scope);
      }, _interrupt = function _interrupt2(animation) {
        _removeFromParent(animation);
        animation.scrollTrigger && animation.scrollTrigger.kill(false);
        animation.progress() < 1 && _callback(animation, "onInterrupt");
        return animation;
      }, _quickTween, _createPlugin = function _createPlugin2(config) {
        config = !config.name && config["default"] || config;
        var name = config.name, isFunc = _isFunction(config), Plugin = name && !isFunc && config.init ? function() {
          this._props = [];
        } : config, instanceDefaults = {
          init: _emptyFunc,
          render: _renderPropTweens,
          add: _addPropTween,
          kill: _killPropTweensOf,
          modifier: _addPluginModifier,
          rawVars: 0
        }, statics = {
          targetTest: 0,
          get: 0,
          getSetter: _getSetter,
          aliases: {},
          register: 0
        };
        _wake();
        if (config !== Plugin) {
          if (_plugins[name]) {
            return;
          }
          _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics));
          _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics)));
          _plugins[Plugin.prop = name] = Plugin;
          if (config.targetTest) {
            _harnessPlugins.push(Plugin);
            _reservedProps[name] = 1;
          }
          name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
        }
        _addGlobal(name, Plugin);
        config.register && config.register(gsap2, Plugin, PropTween);
      }, _255 = 255, _colorLookup = {
        aqua: [0, _255, _255],
        lime: [0, _255, 0],
        silver: [192, 192, 192],
        black: [0, 0, 0],
        maroon: [128, 0, 0],
        teal: [0, 128, 128],
        blue: [0, 0, _255],
        navy: [0, 0, 128],
        white: [_255, _255, _255],
        olive: [128, 128, 0],
        yellow: [_255, _255, 0],
        orange: [_255, 165, 0],
        gray: [128, 128, 128],
        purple: [128, 0, 128],
        green: [0, 128, 0],
        red: [_255, 0, 0],
        pink: [_255, 192, 203],
        cyan: [0, _255, _255],
        transparent: [_255, _255, _255, 0]
      }, _hue = function _hue2(h, m1, m2) {
        h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
        return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < 0.5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + 0.5 | 0;
      }, splitColor = function splitColor2(v, toHSL, forceAlpha) {
        var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0, r, g, b, h, s7, l, max, min, d, wasHSL;
        if (!a) {
          if (v.substr(-1) === ",") {
            v = v.substr(0, v.length - 1);
          }
          if (_colorLookup[v]) {
            a = _colorLookup[v];
          } else if (v.charAt(0) === "#") {
            if (v.length < 6) {
              r = v.charAt(1);
              g = v.charAt(2);
              b = v.charAt(3);
              v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
            }
            if (v.length === 9) {
              a = parseInt(v.substr(1, 6), 16);
              return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
            }
            v = parseInt(v.substr(1), 16);
            a = [v >> 16, v >> 8 & _255, v & _255];
          } else if (v.substr(0, 3) === "hsl") {
            a = wasHSL = v.match(_strictNumExp);
            if (!toHSL) {
              h = +a[0] % 360 / 360;
              s7 = +a[1] / 100;
              l = +a[2] / 100;
              g = l <= 0.5 ? l * (s7 + 1) : l + s7 - l * s7;
              r = l * 2 - g;
              a.length > 3 && (a[3] *= 1);
              a[0] = _hue(h + 1 / 3, r, g);
              a[1] = _hue(h, r, g);
              a[2] = _hue(h - 1 / 3, r, g);
            } else if (~v.indexOf("=")) {
              a = v.match(_numExp);
              forceAlpha && a.length < 4 && (a[3] = 1);
              return a;
            }
          } else {
            a = v.match(_strictNumExp) || _colorLookup.transparent;
          }
          a = a.map(Number);
        }
        if (toHSL && !wasHSL) {
          r = a[0] / _255;
          g = a[1] / _255;
          b = a[2] / _255;
          max = Math.max(r, g, b);
          min = Math.min(r, g, b);
          l = (max + min) / 2;
          if (max === min) {
            h = s7 = 0;
          } else {
            d = max - min;
            s7 = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
            h *= 60;
          }
          a[0] = ~~(h + 0.5);
          a[1] = ~~(s7 * 100 + 0.5);
          a[2] = ~~(l * 100 + 0.5);
        }
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
      }, _colorOrderData = function _colorOrderData2(v) {
        var values = [], c = [], i = -1;
        v.split(_colorExp).forEach(function(v2) {
          var a = v2.match(_numWithUnitExp) || [];
          values.push.apply(values, a);
          c.push(i += a.length + 1);
        });
        values.c = c;
        return values;
      }, _formatColors = function _formatColors2(s7, toHSL, orderMatchData) {
        var result = "", colors = (s7 + result).match(_colorExp), type = toHSL ? "hsla(" : "rgba(", i = 0, c, shell, d, l;
        if (!colors) {
          return s7;
        }
        colors = colors.map(function(color) {
          return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
        });
        if (orderMatchData) {
          d = _colorOrderData(s7);
          c = orderMatchData.c;
          if (c.join(result) !== d.c.join(result)) {
            shell = s7.replace(_colorExp, "1").split(_numWithUnitExp);
            l = shell.length - 1;
            for (; i < l; i++) {
              result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
            }
          }
        }
        if (!shell) {
          shell = s7.split(_colorExp);
          l = shell.length - 1;
          for (; i < l; i++) {
            result += shell[i] + colors[i];
          }
        }
        return result + shell[l];
      }, _colorExp = function() {
        var s7 = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", p;
        for (p in _colorLookup) {
          s7 += "|" + p + "\\b";
        }
        return new RegExp(s7 + ")", "gi");
      }(), _hslExp = /hsl[a]?\(/, _colorStringFilter = function _colorStringFilter2(a) {
        var combined = a.join(" "), toHSL;
        _colorExp.lastIndex = 0;
        if (_colorExp.test(combined)) {
          toHSL = _hslExp.test(combined);
          a[1] = _formatColors(a[1], toHSL);
          a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
          return true;
        }
      }, _tickerActive, _ticker = function() {
        var _getTime = Date.now, _lagThreshold = 500, _adjustedLag = 33, _startTime = _getTime(), _lastUpdate = _startTime, _gap = 1e3 / 240, _nextTime = _gap, _listeners = [], _id, _req, _raf, _self, _delta, _i, _tick = function _tick2(v) {
          var elapsed = _getTime() - _lastUpdate, manual = v === true, overlap, dispatch, time, frame;
          elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
          _lastUpdate += elapsed;
          time = _lastUpdate - _startTime;
          overlap = time - _nextTime;
          if (overlap > 0 || manual) {
            frame = ++_self.frame;
            _delta = time - _self.time * 1e3;
            _self.time = time = time / 1e3;
            _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
            dispatch = 1;
          }
          manual || (_id = _req(_tick2));
          if (dispatch) {
            for (_i = 0; _i < _listeners.length; _i++) {
              _listeners[_i](time, _delta, frame, v);
            }
          }
        };
        _self = {
          time: 0,
          frame: 0,
          tick: function tick() {
            _tick(true);
          },
          deltaRatio: function deltaRatio(fps) {
            return _delta / (1e3 / (fps || 60));
          },
          wake: function wake() {
            if (_coreReady) {
              if (!_coreInitted && _windowExists()) {
                _win = _coreInitted = window;
                _doc = _win.document || {};
                _globals.gsap = gsap2;
                (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap2.version);
                _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});
                _raf = _win.requestAnimationFrame;
              }
              _id && _self.sleep();
              _req = _raf || function(f) {
                return setTimeout(f, _nextTime - _self.time * 1e3 + 1 | 0);
              };
              _tickerActive = 1;
              _tick(2);
            }
          },
          sleep: function sleep() {
            (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
            _tickerActive = 0;
            _req = _emptyFunc;
          },
          lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
            _lagThreshold = threshold || 1 / _tinyNum;
            _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
          },
          fps: function fps(_fps) {
            _gap = 1e3 / (_fps || 240);
            _nextTime = _self.time * 1e3 + _gap;
          },
          add: function add(callback) {
            _listeners.indexOf(callback) < 0 && _listeners.push(callback);
            _wake();
          },
          remove: function remove(callback) {
            var i;
            ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
          },
          _listeners
        };
        return _self;
      }(), _wake = function _wake2() {
        return !_tickerActive && _ticker.wake();
      }, _easeMap = {}, _customEaseExp = /^[\d.\-M][\d.\-,\s]/, _quotesExp = /["']/g, _parseObjectInString = function _parseObjectInString2(value) {
        var obj = {}, split = value.substr(1, value.length - 3).split(":"), key = split[0], i = 1, l = split.length, index2, val, parsedVal;
        for (; i < l; i++) {
          val = split[i];
          index2 = i !== l - 1 ? val.lastIndexOf(",") : val.length;
          parsedVal = val.substr(0, index2);
          obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
          key = val.substr(index2 + 1).trim();
        }
        return obj;
      }, _valueInParentheses = function _valueInParentheses2(value) {
        var open = value.indexOf("(") + 1, close = value.indexOf(")"), nested = value.indexOf("(", open);
        return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
      }, _configEaseFromString = function _configEaseFromString2(name) {
        var split = (name + "").split("("), ease = _easeMap[split[0]];
        return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
      }, _invertEase = function _invertEase2(ease) {
        return function(p) {
          return 1 - ease(1 - p);
        };
      }, _propagateYoyoEase = function _propagateYoyoEase2(timeline, isYoyo) {
        var child = timeline._first, ease;
        while (child) {
          if (child instanceof Timeline) {
            _propagateYoyoEase2(child, isYoyo);
          } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
            if (child.timeline) {
              _propagateYoyoEase2(child.timeline, isYoyo);
            } else {
              ease = child._ease;
              child._ease = child._yEase;
              child._yEase = ease;
              child._yoyo = isYoyo;
            }
          }
          child = child._next;
        }
      }, _parseEase = function _parseEase2(ease, defaultEase) {
        return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
      }, _insertEase = function _insertEase2(names, easeIn, easeOut, easeInOut) {
        if (easeOut === void 0) {
          easeOut = function easeOut2(p) {
            return 1 - easeIn(1 - p);
          };
        }
        if (easeInOut === void 0) {
          easeInOut = function easeInOut2(p) {
            return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
          };
        }
        var ease = {
          easeIn,
          easeOut,
          easeInOut
        }, lowercaseName;
        _forEachName(names, function(name) {
          _easeMap[name] = _globals[name] = ease;
          _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
          for (var p in ease) {
            _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
          }
        });
        return ease;
      }, _easeInOutFromOut = function _easeInOutFromOut2(easeOut) {
        return function(p) {
          return p < 0.5 ? (1 - easeOut(1 - p * 2)) / 2 : 0.5 + easeOut((p - 0.5) * 2) / 2;
        };
      }, _configElastic = function _configElastic2(type, amplitude, period) {
        var p1 = amplitude >= 1 ? amplitude : 1, p2 = (period || (type ? 0.3 : 0.45)) / (amplitude < 1 ? amplitude : 1), p3 = p2 / _2PI * (Math.asin(1 / p1) || 0), easeOut = function easeOut2(p) {
          return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
        }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
          return 1 - easeOut(1 - p);
        } : _easeInOutFromOut(easeOut);
        p2 = _2PI / p2;
        ease.config = function(amplitude2, period2) {
          return _configElastic2(type, amplitude2, period2);
        };
        return ease;
      }, _configBack = function _configBack2(type, overshoot) {
        if (overshoot === void 0) {
          overshoot = 1.70158;
        }
        var easeOut = function easeOut2(p) {
          return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
        }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
          return 1 - easeOut(1 - p);
        } : _easeInOutFromOut(easeOut);
        ease.config = function(overshoot2) {
          return _configBack2(type, overshoot2);
        };
        return ease;
      };
      _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function(name, i) {
        var power = i < 5 ? i + 1 : i;
        _insertEase(name + ",Power" + (power - 1), i ? function(p) {
          return Math.pow(p, power);
        } : function(p) {
          return p;
        }, function(p) {
          return 1 - Math.pow(1 - p, power);
        }, function(p) {
          return p < 0.5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
        });
      });
      _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
      _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
      (function(n, c) {
        var n1 = 1 / c, n2 = 2 * n1, n3 = 2.5 * n1, easeOut = function easeOut2(p) {
          return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + 0.75 : p < n3 ? n * (p -= 2.25 / c) * p + 0.9375 : n * Math.pow(p - 2.625 / c, 2) + 0.984375;
        };
        _insertEase("Bounce", function(p) {
          return 1 - easeOut(1 - p);
        }, easeOut);
      })(7.5625, 2.75);
      _insertEase("Expo", function(p) {
        return p ? Math.pow(2, 10 * (p - 1)) : 0;
      });
      _insertEase("Circ", function(p) {
        return -(_sqrt(1 - p * p) - 1);
      });
      _insertEase("Sine", function(p) {
        return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
      });
      _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
      _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
        config: function config(steps, immediateStart) {
          if (steps === void 0) {
            steps = 1;
          }
          var p1 = 1 / steps, p2 = steps + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max = 1 - _tinyNum;
          return function(p) {
            return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
          };
        }
      };
      _defaults.ease = _easeMap["quad.out"];
      _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(name) {
        return _callbackNames += name + "," + name + "Params,";
      });
      var GSCache = function GSCache2(target, harness) {
        this.id = _gsID++;
        target._gsap = this;
        this.target = target;
        this.harness = harness;
        this.get = harness ? harness.get : _getProperty;
        this.set = harness ? harness.getSetter : _getSetter;
      };
      var Animation = function() {
        function Animation2(vars) {
          this.vars = vars;
          this._delay = +vars.delay || 0;
          if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
            this._rDelay = vars.repeatDelay || 0;
            this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
          }
          this._ts = 1;
          _setDuration(this, +vars.duration, 1, 1);
          this.data = vars.data;
          _tickerActive || _ticker.wake();
        }
        var _proto = Animation2.prototype;
        _proto.delay = function delay(value) {
          if (value || value === 0) {
            this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
            this._delay = value;
            return this;
          }
          return this._delay;
        };
        _proto.duration = function duration(value) {
          return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
        };
        _proto.totalDuration = function totalDuration(value) {
          if (!arguments.length) {
            return this._tDur;
          }
          this._dirty = 0;
          return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
        };
        _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
          _wake();
          if (!arguments.length) {
            return this._tTime;
          }
          var parent = this._dp;
          if (parent && parent.smoothChildTiming && this._ts) {
            _alignPlayhead(this, _totalTime);
            !parent._dp || parent.parent || _postAddChecks(parent, this);
            while (parent.parent) {
              if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
                parent.totalTime(parent._tTime, true);
              }
              parent = parent.parent;
            }
            if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
              _addToTimeline(this._dp, this, this._start - this._delay);
            }
          }
          if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
            this._ts || (this._pTime = _totalTime);
            _lazySafeRender(this, _totalTime, suppressEvents);
          }
          return this;
        };
        _proto.time = function time(value, suppressEvents) {
          return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
        };
        _proto.totalProgress = function totalProgress(value, suppressEvents) {
          return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
        };
        _proto.progress = function progress(value, suppressEvents) {
          return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
        };
        _proto.iteration = function iteration(value, suppressEvents) {
          var cycleDuration = this.duration() + this._rDelay;
          return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
        };
        _proto.timeScale = function timeScale(value) {
          if (!arguments.length) {
            return this._rts === -_tinyNum ? 0 : this._rts;
          }
          if (this._rts === value) {
            return this;
          }
          var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
          this._rts = +value || 0;
          this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
          return _recacheAncestors(this.totalTime(_clamp(-this._delay, this._tDur, tTime), true));
        };
        _proto.paused = function paused(value) {
          if (!arguments.length) {
            return this._ps;
          }
          if (this._ps !== value) {
            this._ps = value;
            if (value) {
              this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
              this._ts = this._act = 0;
            } else {
              _wake();
              this._ts = this._rts;
              this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
            }
          }
          return this;
        };
        _proto.startTime = function startTime(value) {
          if (arguments.length) {
            this._start = value;
            var parent = this.parent || this._dp;
            parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
            return this;
          }
          return this._start;
        };
        _proto.endTime = function endTime(includeRepeats) {
          return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts);
        };
        _proto.rawTime = function rawTime(wrapRepeats) {
          var parent = this.parent || this._dp;
          return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
        };
        _proto.globalTime = function globalTime(rawTime) {
          var animation = this, time = arguments.length ? rawTime : animation.rawTime();
          while (animation) {
            time = animation._start + time / (animation._ts || 1);
            animation = animation._dp;
          }
          return time;
        };
        _proto.repeat = function repeat(value) {
          if (arguments.length) {
            this._repeat = value === Infinity ? -2 : value;
            return _onUpdateTotalDuration(this);
          }
          return this._repeat === -2 ? Infinity : this._repeat;
        };
        _proto.repeatDelay = function repeatDelay(value) {
          if (arguments.length) {
            var time = this._time;
            this._rDelay = value;
            _onUpdateTotalDuration(this);
            return time ? this.time(time) : this;
          }
          return this._rDelay;
        };
        _proto.yoyo = function yoyo(value) {
          if (arguments.length) {
            this._yoyo = value;
            return this;
          }
          return this._yoyo;
        };
        _proto.seek = function seek(position, suppressEvents) {
          return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
        };
        _proto.restart = function restart(includeDelay, suppressEvents) {
          return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
        };
        _proto.play = function play(from, suppressEvents) {
          from != null && this.seek(from, suppressEvents);
          return this.reversed(false).paused(false);
        };
        _proto.reverse = function reverse(from, suppressEvents) {
          from != null && this.seek(from || this.totalDuration(), suppressEvents);
          return this.reversed(true).paused(false);
        };
        _proto.pause = function pause(atTime, suppressEvents) {
          atTime != null && this.seek(atTime, suppressEvents);
          return this.paused(true);
        };
        _proto.resume = function resume() {
          return this.paused(false);
        };
        _proto.reversed = function reversed(value) {
          if (arguments.length) {
            !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
            return this;
          }
          return this._rts < 0;
        };
        _proto.invalidate = function invalidate() {
          this._initted = this._act = 0;
          this._zTime = -_tinyNum;
          return this;
        };
        _proto.isActive = function isActive() {
          var parent = this.parent || this._dp, start = this._start, rawTime;
          return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
        };
        _proto.eventCallback = function eventCallback(type, callback, params) {
          var vars = this.vars;
          if (arguments.length > 1) {
            if (!callback) {
              delete vars[type];
            } else {
              vars[type] = callback;
              params && (vars[type + "Params"] = params);
              type === "onUpdate" && (this._onUpdate = callback);
            }
            return this;
          }
          return vars[type];
        };
        _proto.then = function then(onFulfilled) {
          var self2 = this;
          return new Promise(function(resolve2) {
            var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough, _resolve = function _resolve2() {
              var _then = self2.then;
              self2.then = null;
              _isFunction(f) && (f = f(self2)) && (f.then || f === self2) && (self2.then = _then);
              resolve2(f);
              self2.then = _then;
            };
            if (self2._initted && self2.totalProgress() === 1 && self2._ts >= 0 || !self2._tTime && self2._ts < 0) {
              _resolve();
            } else {
              self2._prom = _resolve;
            }
          });
        };
        _proto.kill = function kill() {
          _interrupt(this);
        };
        return Animation2;
      }();
      _setDefaults(Animation.prototype, {
        _time: 0,
        _start: 0,
        _end: 0,
        _tTime: 0,
        _tDur: 0,
        _dirty: 0,
        _repeat: 0,
        _yoyo: false,
        parent: null,
        _initted: false,
        _rDelay: 0,
        _ts: 1,
        _dp: 0,
        ratio: 0,
        _zTime: -_tinyNum,
        _prom: 0,
        _ps: false,
        _rts: 1
      });
      var Timeline = function(_Animation) {
        _inheritsLoose(Timeline2, _Animation);
        function Timeline2(vars, position) {
          var _this;
          if (vars === void 0) {
            vars = {};
          }
          _this = _Animation.call(this, vars) || this;
          _this.labels = {};
          _this.smoothChildTiming = !!vars.smoothChildTiming;
          _this.autoRemoveChildren = !!vars.autoRemoveChildren;
          _this._sort = _isNotFalse(vars.sortChildren);
          _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
          vars.reversed && _this.reverse();
          vars.paused && _this.paused(true);
          vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
          return _this;
        }
        var _proto2 = Timeline2.prototype;
        _proto2.to = function to(targets, vars, position) {
          _createTweenType(0, arguments, this);
          return this;
        };
        _proto2.from = function from(targets, vars, position) {
          _createTweenType(1, arguments, this);
          return this;
        };
        _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
          _createTweenType(2, arguments, this);
          return this;
        };
        _proto2.set = function set(targets, vars, position) {
          vars.duration = 0;
          vars.parent = this;
          _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
          vars.immediateRender = !!vars.immediateRender;
          new Tween(targets, vars, _parsePosition(this, position), 1);
          return this;
        };
        _proto2.call = function call(callback, params, position) {
          return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
        };
        _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
          vars.duration = duration;
          vars.stagger = vars.stagger || stagger;
          vars.onComplete = onCompleteAll;
          vars.onCompleteParams = onCompleteAllParams;
          vars.parent = this;
          new Tween(targets, vars, _parsePosition(this, position));
          return this;
        };
        _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
          vars.runBackwards = 1;
          _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
          return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
        };
        _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
          toVars.startAt = fromVars;
          _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
          return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
        };
        _proto2.render = function render2(totalTime, suppressEvents, force) {
          var prevTime = this._time, tDur = this._dirty ? this.totalDuration() : this._tDur, dur = this._dur, tTime = this !== _globalTimeline && totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime, crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur), time, child, next, iteration, cycleDuration, prevPaused, pauseTween, timeScale, prevStart, prevIteration, yoyo, isYoyo;
          if (tTime !== this._tTime || force || crossingStart) {
            if (prevTime !== this._time && dur) {
              tTime += this._time - prevTime;
              totalTime += this._time - prevTime;
            }
            time = tTime;
            prevStart = this._start;
            timeScale = this._ts;
            prevPaused = !timeScale;
            if (crossingStart) {
              dur || (prevTime = this._zTime);
              (totalTime || !suppressEvents) && (this._zTime = totalTime);
            }
            if (this._repeat) {
              yoyo = this._yoyo;
              cycleDuration = dur + this._rDelay;
              if (this._repeat < -1 && totalTime < 0) {
                return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
              }
              time = _round(tTime % cycleDuration);
              if (tTime === tDur) {
                iteration = this._repeat;
                time = dur;
              } else {
                iteration = ~~(tTime / cycleDuration);
                if (iteration && iteration === tTime / cycleDuration) {
                  time = dur;
                  iteration--;
                }
                time > dur && (time = dur);
              }
              prevIteration = _animationCycle(this._tTime, cycleDuration);
              !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration);
              if (yoyo && iteration & 1) {
                time = dur - time;
                isYoyo = 1;
              }
              if (iteration !== prevIteration && !this._lock) {
                var rewinding = yoyo && prevIteration & 1, doesWrap = rewinding === (yoyo && iteration & 1);
                iteration < prevIteration && (rewinding = !rewinding);
                prevTime = rewinding ? 0 : dur;
                this._lock = 1;
                this.render(prevTime || (isYoyo ? 0 : _round(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
                this._tTime = tTime;
                !suppressEvents && this.parent && _callback(this, "onRepeat");
                this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
                if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
                  return this;
                }
                dur = this._dur;
                tDur = this._tDur;
                if (doesWrap) {
                  this._lock = 2;
                  prevTime = rewinding ? dur : -1e-4;
                  this.render(prevTime, true);
                  this.vars.repeatRefresh && !isYoyo && this.invalidate();
                }
                this._lock = 0;
                if (!this._ts && !prevPaused) {
                  return this;
                }
                _propagateYoyoEase(this, isYoyo);
              }
            }
            if (this._hasPause && !this._forcing && this._lock < 2) {
              pauseTween = _findNextPauseTween(this, _round(prevTime), _round(time));
              if (pauseTween) {
                tTime -= time - (time = pauseTween._start);
              }
            }
            this._tTime = tTime;
            this._time = time;
            this._act = !timeScale;
            if (!this._initted) {
              this._onUpdate = this.vars.onUpdate;
              this._initted = 1;
              this._zTime = totalTime;
              prevTime = 0;
            }
            if (!prevTime && time && !suppressEvents) {
              _callback(this, "onStart");
              if (this._tTime !== tTime) {
                return this;
              }
            }
            if (time >= prevTime && totalTime >= 0) {
              child = this._first;
              while (child) {
                next = child._next;
                if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
                  if (child.parent !== this) {
                    return this.render(totalTime, suppressEvents, force);
                  }
                  child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
                  if (time !== this._time || !this._ts && !prevPaused) {
                    pauseTween = 0;
                    next && (tTime += this._zTime = -_tinyNum);
                    break;
                  }
                }
                child = next;
              }
            } else {
              child = this._last;
              var adjustedTime = totalTime < 0 ? totalTime : time;
              while (child) {
                next = child._prev;
                if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
                  if (child.parent !== this) {
                    return this.render(totalTime, suppressEvents, force);
                  }
                  child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force);
                  if (time !== this._time || !this._ts && !prevPaused) {
                    pauseTween = 0;
                    next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
                    break;
                  }
                }
                child = next;
              }
            }
            if (pauseTween && !suppressEvents) {
              this.pause();
              pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
              if (this._ts) {
                this._start = prevStart;
                _setEnd(this);
                return this.render(totalTime, suppressEvents, force);
              }
            }
            this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
            if (tTime === tDur && tDur >= this.totalDuration() || !tTime && prevTime) {
              if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) {
                if (!this._lock) {
                  (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
                  if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
                    _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
                    this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
                  }
                }
              }
            }
          }
          return this;
        };
        _proto2.add = function add(child, position) {
          var _this2 = this;
          _isNumber(position) || (position = _parsePosition(this, position, child));
          if (!(child instanceof Animation)) {
            if (_isArray(child)) {
              child.forEach(function(obj) {
                return _this2.add(obj, position);
              });
              return this;
            }
            if (_isString(child)) {
              return this.addLabel(child, position);
            }
            if (_isFunction(child)) {
              child = Tween.delayedCall(0, child);
            } else {
              return this;
            }
          }
          return this !== child ? _addToTimeline(this, child, position) : this;
        };
        _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
          if (nested === void 0) {
            nested = true;
          }
          if (tweens === void 0) {
            tweens = true;
          }
          if (timelines === void 0) {
            timelines = true;
          }
          if (ignoreBeforeTime === void 0) {
            ignoreBeforeTime = -_bigNum;
          }
          var a = [], child = this._first;
          while (child) {
            if (child._start >= ignoreBeforeTime) {
              if (child instanceof Tween) {
                tweens && a.push(child);
              } else {
                timelines && a.push(child);
                nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
              }
            }
            child = child._next;
          }
          return a;
        };
        _proto2.getById = function getById(id) {
          var animations = this.getChildren(1, 1, 1), i = animations.length;
          while (i--) {
            if (animations[i].vars.id === id) {
              return animations[i];
            }
          }
        };
        _proto2.remove = function remove(child) {
          if (_isString(child)) {
            return this.removeLabel(child);
          }
          if (_isFunction(child)) {
            return this.killTweensOf(child);
          }
          _removeLinkedListItem(this, child);
          if (child === this._recent) {
            this._recent = this._last;
          }
          return _uncache(this);
        };
        _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
          if (!arguments.length) {
            return this._tTime;
          }
          this._forcing = 1;
          if (!this._dp && this._ts) {
            this._start = _round(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
          }
          _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
          this._forcing = 0;
          return this;
        };
        _proto2.addLabel = function addLabel(label, position) {
          this.labels[label] = _parsePosition(this, position);
          return this;
        };
        _proto2.removeLabel = function removeLabel(label) {
          delete this.labels[label];
          return this;
        };
        _proto2.addPause = function addPause(position, callback, params) {
          var t = Tween.delayedCall(0, callback || _emptyFunc, params);
          t.data = "isPause";
          this._hasPause = 1;
          return _addToTimeline(this, t, _parsePosition(this, position));
        };
        _proto2.removePause = function removePause(position) {
          var child = this._first;
          position = _parsePosition(this, position);
          while (child) {
            if (child._start === position && child.data === "isPause") {
              _removeFromParent(child);
            }
            child = child._next;
          }
        };
        _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
          var tweens = this.getTweensOf(targets, onlyActive), i = tweens.length;
          while (i--) {
            _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
          }
          return this;
        };
        _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
          var a = [], parsedTargets = toArray(targets), child = this._first, isGlobalTime = _isNumber(onlyActive), children;
          while (child) {
            if (child instanceof Tween) {
              if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
                a.push(child);
              }
            } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
              a.push.apply(a, children);
            }
            child = child._next;
          }
          return a;
        };
        _proto2.tweenTo = function tweenTo(position, vars) {
          vars = vars || {};
          var tl = this, endTime = _parsePosition(tl, position), _vars = vars, startAt = _vars.startAt, _onStart = _vars.onStart, onStartParams = _vars.onStartParams, immediateRender = _vars.immediateRender, initted, tween = Tween.to(tl, _setDefaults({
            ease: vars.ease || "none",
            lazy: false,
            immediateRender: false,
            time: endTime,
            overwrite: "auto",
            duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
            onStart: function onStart() {
              tl.pause();
              if (!initted) {
                var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
                tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
                initted = 1;
              }
              _onStart && _onStart.apply(tween, onStartParams || []);
            }
          }, vars));
          return immediateRender ? tween.render(0) : tween;
        };
        _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
          return this.tweenTo(toPosition, _setDefaults({
            startAt: {
              time: _parsePosition(this, fromPosition)
            }
          }, vars));
        };
        _proto2.recent = function recent() {
          return this._recent;
        };
        _proto2.nextLabel = function nextLabel(afterTime) {
          if (afterTime === void 0) {
            afterTime = this._time;
          }
          return _getLabelInDirection(this, _parsePosition(this, afterTime));
        };
        _proto2.previousLabel = function previousLabel(beforeTime) {
          if (beforeTime === void 0) {
            beforeTime = this._time;
          }
          return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
        };
        _proto2.currentLabel = function currentLabel(value) {
          return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
        };
        _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
          if (ignoreBeforeTime === void 0) {
            ignoreBeforeTime = 0;
          }
          var child = this._first, labels = this.labels, p;
          while (child) {
            if (child._start >= ignoreBeforeTime) {
              child._start += amount;
              child._end += amount;
            }
            child = child._next;
          }
          if (adjustLabels) {
            for (p in labels) {
              if (labels[p] >= ignoreBeforeTime) {
                labels[p] += amount;
              }
            }
          }
          return _uncache(this);
        };
        _proto2.invalidate = function invalidate() {
          var child = this._first;
          this._lock = 0;
          while (child) {
            child.invalidate();
            child = child._next;
          }
          return _Animation.prototype.invalidate.call(this);
        };
        _proto2.clear = function clear(includeLabels) {
          if (includeLabels === void 0) {
            includeLabels = true;
          }
          var child = this._first, next;
          while (child) {
            next = child._next;
            this.remove(child);
            child = next;
          }
          this._dp && (this._time = this._tTime = this._pTime = 0);
          includeLabels && (this.labels = {});
          return _uncache(this);
        };
        _proto2.totalDuration = function totalDuration(value) {
          var max = 0, self2 = this, child = self2._last, prevStart = _bigNum, prev, start, parent;
          if (arguments.length) {
            return self2.timeScale((self2._repeat < 0 ? self2.duration() : self2.totalDuration()) / (self2.reversed() ? -value : value));
          }
          if (self2._dirty) {
            parent = self2.parent;
            while (child) {
              prev = child._prev;
              child._dirty && child.totalDuration();
              start = child._start;
              if (start > prevStart && self2._sort && child._ts && !self2._lock) {
                self2._lock = 1;
                _addToTimeline(self2, child, start - child._delay, 1)._lock = 0;
              } else {
                prevStart = start;
              }
              if (start < 0 && child._ts) {
                max -= start;
                if (!parent && !self2._dp || parent && parent.smoothChildTiming) {
                  self2._start += start / self2._ts;
                  self2._time -= start;
                  self2._tTime -= start;
                }
                self2.shiftChildren(-start, false, -Infinity);
                prevStart = 0;
              }
              child._end > max && child._ts && (max = child._end);
              child = prev;
            }
            _setDuration(self2, self2 === _globalTimeline && self2._time > max ? self2._time : max, 1, 1);
            self2._dirty = 0;
          }
          return self2._tDur;
        };
        Timeline2.updateRoot = function updateRoot(time) {
          if (_globalTimeline._ts) {
            _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
            _lastRenderedFrame = _ticker.frame;
          }
          if (_ticker.frame >= _nextGCFrame) {
            _nextGCFrame += _config.autoSleep || 120;
            var child = _globalTimeline._first;
            if (!child || !child._ts) {
              if (_config.autoSleep && _ticker._listeners.length < 2) {
                while (child && !child._ts) {
                  child = child._next;
                }
                child || _ticker.sleep();
              }
            }
          }
        };
        return Timeline2;
      }(Animation);
      _setDefaults(Timeline.prototype, {
        _lock: 0,
        _hasPause: 0,
        _forcing: 0
      });
      var _addComplexStringPropTween = function _addComplexStringPropTween2(target, prop, start, end, setter, stringFilter, funcParam) {
        var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter), index2 = 0, matchIndex = 0, result, startNums, color, endNum, chunk, startNum, hasRandom, a;
        pt.b = start;
        pt.e = end;
        start += "";
        end += "";
        if (hasRandom = ~end.indexOf("random(")) {
          end = _replaceRandom(end);
        }
        if (stringFilter) {
          a = [start, end];
          stringFilter(a, target, prop);
          start = a[0];
          end = a[1];
        }
        startNums = start.match(_complexStringNumExp) || [];
        while (result = _complexStringNumExp.exec(end)) {
          endNum = result[0];
          chunk = end.substring(index2, result.index);
          if (color) {
            color = (color + 1) % 5;
          } else if (chunk.substr(-5) === "rgba(") {
            color = 1;
          }
          if (endNum !== startNums[matchIndex++]) {
            startNum = parseFloat(startNums[matchIndex - 1]) || 0;
            pt._pt = {
              _next: pt._pt,
              p: chunk || matchIndex === 1 ? chunk : ",",
              s: startNum,
              c: endNum.charAt(1) === "=" ? parseFloat(endNum.substr(2)) * (endNum.charAt(0) === "-" ? -1 : 1) : parseFloat(endNum) - startNum,
              m: color && color < 4 ? Math.round : 0
            };
            index2 = _complexStringNumExp.lastIndex;
          }
        }
        pt.c = index2 < end.length ? end.substring(index2, end.length) : "";
        pt.fp = funcParam;
        if (_relExp.test(end) || hasRandom) {
          pt.e = 0;
        }
        this._pt = pt;
        return pt;
      }, _addPropTween = function _addPropTween2(target, prop, start, end, index2, targets, modifier, stringFilter, funcParam) {
        _isFunction(end) && (end = end(index2 || 0, target, targets));
        var currentValue = target[prop], parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](), setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc, pt;
        if (_isString(end)) {
          if (~end.indexOf("random(")) {
            end = _replaceRandom(end);
          }
          if (end.charAt(1) === "=") {
            pt = parseFloat(parsedStart) + parseFloat(end.substr(2)) * (end.charAt(0) === "-" ? -1 : 1) + (getUnit(parsedStart) || 0);
            if (pt || pt === 0) {
              end = pt;
            }
          }
        }
        if (parsedStart !== end) {
          if (!isNaN(parsedStart * end) && end !== "") {
            pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
            funcParam && (pt.fp = funcParam);
            modifier && pt.modifier(modifier, this, target);
            return this._pt = pt;
          }
          !currentValue && !(prop in target) && _missingPlugin(prop, end);
          return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
        }
      }, _processVars = function _processVars2(vars, index2, target, targets, tween) {
        _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index2, target, targets));
        if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
          return _isString(vars) ? _parseFuncOrString(vars, tween, index2, target, targets) : vars;
        }
        var copy = {}, p;
        for (p in vars) {
          copy[p] = _parseFuncOrString(vars[p], tween, index2, target, targets);
        }
        return copy;
      }, _checkPlugin = function _checkPlugin2(property, vars, tween, index2, target, targets) {
        var plugin, pt, ptLookup, i;
        if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index2, target, targets, tween), tween, index2, targets) !== false) {
          tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
          if (tween !== _quickTween) {
            ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
            i = plugin._props.length;
            while (i--) {
              ptLookup[plugin._props[i]] = pt;
            }
          }
        }
        return plugin;
      }, _overwritingTween, _initTween = function _initTween2(tween, time) {
        var vars = tween.vars, ease = vars.ease, startAt = vars.startAt, immediateRender = vars.immediateRender, lazy = vars.lazy, onUpdate = vars.onUpdate, onUpdateParams = vars.onUpdateParams, callbackScope = vars.callbackScope, runBackwards = vars.runBackwards, yoyoEase = vars.yoyoEase, keyframes = vars.keyframes, autoRevert = vars.autoRevert, dur = tween._dur, prevStartAt = tween._startAt, targets = tween._targets, parent = tween.parent, fullTargets = parent && parent.data === "nested" ? parent.parent._targets : targets, autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites, tl = tween.timeline, cleanVars, i, p, pt, target, hasPriority, gsData, harness, plugin, ptLookup, index2, harnessVars, overwritten;
        tl && (!keyframes || !ease) && (ease = "none");
        tween._ease = _parseEase(ease, _defaults.ease);
        tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;
        if (yoyoEase && tween._yoyo && !tween._repeat) {
          yoyoEase = tween._yEase;
          tween._yEase = tween._ease;
          tween._ease = yoyoEase;
        }
        tween._from = !tl && !!vars.runBackwards;
        if (!tl) {
          harness = targets[0] ? _getCache(targets[0]).harness : 0;
          harnessVars = harness && vars[harness.prop];
          cleanVars = _copyExcluding(vars, _reservedProps);
          prevStartAt && prevStartAt.render(-1, true).kill();
          if (startAt) {
            _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
              data: "isStart",
              overwrite: false,
              parent,
              immediateRender: true,
              lazy: _isNotFalse(lazy),
              startAt: null,
              delay: 0,
              onUpdate,
              onUpdateParams,
              callbackScope,
              stagger: 0
            }, startAt)));
            time < 0 && !immediateRender && !autoRevert && tween._startAt.render(-1, true);
            if (immediateRender) {
              time > 0 && !autoRevert && (tween._startAt = 0);
              if (dur && time <= 0) {
                time && (tween._zTime = time);
                return;
              }
            } else if (autoRevert === false) {
              tween._startAt = 0;
            }
          } else if (runBackwards && dur) {
            if (prevStartAt) {
              !autoRevert && (tween._startAt = 0);
            } else {
              time && (immediateRender = false);
              p = _setDefaults({
                overwrite: false,
                data: "isFromStart",
                lazy: immediateRender && _isNotFalse(lazy),
                immediateRender,
                stagger: 0,
                parent
              }, cleanVars);
              harnessVars && (p[harness.prop] = harnessVars);
              _removeFromParent(tween._startAt = Tween.set(targets, p));
              time < 0 && tween._startAt.render(-1, true);
              if (!immediateRender) {
                _initTween2(tween._startAt, _tinyNum);
              } else if (!time) {
                return;
              }
            }
          }
          tween._pt = 0;
          lazy = dur && _isNotFalse(lazy) || lazy && !dur;
          for (i = 0; i < targets.length; i++) {
            target = targets[i];
            gsData = target._gsap || _harness(targets)[i]._gsap;
            tween._ptLookup[i] = ptLookup = {};
            _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
            index2 = fullTargets === targets ? i : fullTargets.indexOf(target);
            if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index2, fullTargets) !== false) {
              tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
              plugin._props.forEach(function(name) {
                ptLookup[name] = pt;
              });
              plugin.priority && (hasPriority = 1);
            }
            if (!harness || harnessVars) {
              for (p in cleanVars) {
                if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index2, target, fullTargets))) {
                  plugin.priority && (hasPriority = 1);
                } else {
                  ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index2, fullTargets, 0, vars.stringFilter);
                }
              }
            }
            tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
            if (autoOverwrite && tween._pt) {
              _overwritingTween = tween;
              _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(0));
              overwritten = !tween.parent;
              _overwritingTween = 0;
            }
            tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
          }
          hasPriority && _sortPropTweensByPriority(tween);
          tween._onInit && tween._onInit(tween);
        }
        tween._onUpdate = onUpdate;
        tween._initted = (!tween._op || tween._pt) && !overwritten;
      }, _addAliasesToVars = function _addAliasesToVars2(targets, vars) {
        var harness = targets[0] ? _getCache(targets[0]).harness : 0, propertyAliases = harness && harness.aliases, copy, p, i, aliases;
        if (!propertyAliases) {
          return vars;
        }
        copy = _merge({}, vars);
        for (p in propertyAliases) {
          if (p in copy) {
            aliases = propertyAliases[p].split(",");
            i = aliases.length;
            while (i--) {
              copy[aliases[i]] = copy[p];
            }
          }
        }
        return copy;
      }, _parseFuncOrString = function _parseFuncOrString2(value, tween, i, target, targets) {
        return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
      }, _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase", _staggerPropsToSkip = (_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger").split(",");
      var Tween = function(_Animation2) {
        _inheritsLoose(Tween2, _Animation2);
        function Tween2(targets, vars, position, skipInherit) {
          var _this3;
          if (typeof vars === "number") {
            position.duration = vars;
            vars = position;
            position = null;
          }
          _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
          var _this3$vars = _this3.vars, duration = _this3$vars.duration, delay = _this3$vars.delay, immediateRender = _this3$vars.immediateRender, stagger = _this3$vars.stagger, overwrite = _this3$vars.overwrite, keyframes = _this3$vars.keyframes, defaults = _this3$vars.defaults, scrollTrigger = _this3$vars.scrollTrigger, yoyoEase = _this3$vars.yoyoEase, parent = vars.parent || _globalTimeline, parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets), tl, i, copy, l, p, curTarget, staggerFunc, staggerVarsToMerge;
          _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
          _this3._ptLookup = [];
          _this3._overwrite = overwrite;
          if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
            vars = _this3.vars;
            tl = _this3.timeline = new Timeline({
              data: "nested",
              defaults: defaults || {}
            });
            tl.kill();
            tl.parent = tl._dp = _assertThisInitialized(_this3);
            tl._start = 0;
            if (keyframes) {
              _setDefaults(tl.vars.defaults, {
                ease: "none"
              });
              stagger ? parsedTargets.forEach(function(t, i2) {
                return keyframes.forEach(function(frame, j) {
                  return tl.to(t, frame, j ? ">" : i2 * stagger);
                });
              }) : keyframes.forEach(function(frame) {
                return tl.to(parsedTargets, frame, ">");
              });
            } else {
              l = parsedTargets.length;
              staggerFunc = stagger ? distribute(stagger) : _emptyFunc;
              if (_isObject(stagger)) {
                for (p in stagger) {
                  if (~_staggerTweenProps.indexOf(p)) {
                    staggerVarsToMerge || (staggerVarsToMerge = {});
                    staggerVarsToMerge[p] = stagger[p];
                  }
                }
              }
              for (i = 0; i < l; i++) {
                copy = {};
                for (p in vars) {
                  if (_staggerPropsToSkip.indexOf(p) < 0) {
                    copy[p] = vars[p];
                  }
                }
                copy.stagger = 0;
                yoyoEase && (copy.yoyoEase = yoyoEase);
                staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
                curTarget = parsedTargets[i];
                copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
                copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
                if (!stagger && l === 1 && copy.delay) {
                  _this3._delay = delay = copy.delay;
                  _this3._start += delay;
                  copy.delay = 0;
                }
                tl.to(curTarget, copy, staggerFunc(i, curTarget, parsedTargets));
              }
              tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
            }
            duration || _this3.duration(duration = tl.duration());
          } else {
            _this3.timeline = 0;
          }
          if (overwrite === true && !_suppressOverwrites) {
            _overwritingTween = _assertThisInitialized(_this3);
            _globalTimeline.killTweensOf(parsedTargets);
            _overwritingTween = 0;
          }
          _addToTimeline(parent, _assertThisInitialized(_this3), position);
          vars.reversed && _this3.reverse();
          vars.paused && _this3.paused(true);
          if (immediateRender || !duration && !keyframes && _this3._start === _round(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
            _this3._tTime = -_tinyNum;
            _this3.render(Math.max(0, -delay));
          }
          scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
          return _this3;
        }
        var _proto3 = Tween2.prototype;
        _proto3.render = function render2(totalTime, suppressEvents, force) {
          var prevTime = this._time, tDur = this._tDur, dur = this._dur, tTime = totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime, time, pt, iteration, cycleDuration, prevIteration, isYoyo, ratio, timeline, yoyoEase;
          if (!dur) {
            _renderZeroDurationTween(this, totalTime, suppressEvents, force);
          } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== totalTime < 0) {
            time = tTime;
            timeline = this.timeline;
            if (this._repeat) {
              cycleDuration = dur + this._rDelay;
              if (this._repeat < -1 && totalTime < 0) {
                return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
              }
              time = _round(tTime % cycleDuration);
              if (tTime === tDur) {
                iteration = this._repeat;
                time = dur;
              } else {
                iteration = ~~(tTime / cycleDuration);
                if (iteration && iteration === tTime / cycleDuration) {
                  time = dur;
                  iteration--;
                }
                time > dur && (time = dur);
              }
              isYoyo = this._yoyo && iteration & 1;
              if (isYoyo) {
                yoyoEase = this._yEase;
                time = dur - time;
              }
              prevIteration = _animationCycle(this._tTime, cycleDuration);
              if (time === prevTime && !force && this._initted) {
                return this;
              }
              if (iteration !== prevIteration) {
                timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo);
                if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
                  this._lock = force = 1;
                  this.render(_round(cycleDuration * iteration), true).invalidate()._lock = 0;
                }
              }
            }
            if (!this._initted) {
              if (_attemptInitTween(this, totalTime < 0 ? totalTime : time, force, suppressEvents)) {
                this._tTime = 0;
                return this;
              }
              if (dur !== this._dur) {
                return this.render(totalTime, suppressEvents, force);
              }
            }
            this._tTime = tTime;
            this._time = time;
            if (!this._act && this._ts) {
              this._act = 1;
              this._lazy = 0;
            }
            this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
            if (this._from) {
              this.ratio = ratio = 1 - ratio;
            }
            if (time && !prevTime && !suppressEvents) {
              _callback(this, "onStart");
              if (this._tTime !== tTime) {
                return this;
              }
            }
            pt = this._pt;
            while (pt) {
              pt.r(ratio, pt.d);
              pt = pt._next;
            }
            timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * ratio, suppressEvents, force) || this._startAt && (this._zTime = totalTime);
            if (this._onUpdate && !suppressEvents) {
              totalTime < 0 && this._startAt && this._startAt.render(totalTime, true, force);
              _callback(this, "onUpdate");
            }
            this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");
            if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
              totalTime < 0 && this._startAt && !this._onUpdate && this._startAt.render(totalTime, true, true);
              (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
              if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
                _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
                this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
              }
            }
          }
          return this;
        };
        _proto3.targets = function targets() {
          return this._targets;
        };
        _proto3.invalidate = function invalidate() {
          this._pt = this._op = this._startAt = this._onUpdate = this._lazy = this.ratio = 0;
          this._ptLookup = [];
          this.timeline && this.timeline.invalidate();
          return _Animation2.prototype.invalidate.call(this);
        };
        _proto3.kill = function kill(targets, vars) {
          if (vars === void 0) {
            vars = "all";
          }
          if (!targets && (!vars || vars === "all")) {
            this._lazy = this._pt = 0;
            return this.parent ? _interrupt(this) : this;
          }
          if (this.timeline) {
            var tDur = this.timeline.totalDuration();
            this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this);
            this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
            return this;
          }
          var parsedTargets = this._targets, killingTargets = targets ? toArray(targets) : parsedTargets, propTweenLookup = this._ptLookup, firstPT = this._pt, overwrittenProps, curLookup, curOverwriteProps, props, p, pt, i;
          if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
            vars === "all" && (this._pt = 0);
            return _interrupt(this);
          }
          overwrittenProps = this._op = this._op || [];
          if (vars !== "all") {
            if (_isString(vars)) {
              p = {};
              _forEachName(vars, function(name) {
                return p[name] = 1;
              });
              vars = p;
            }
            vars = _addAliasesToVars(parsedTargets, vars);
          }
          i = parsedTargets.length;
          while (i--) {
            if (~killingTargets.indexOf(parsedTargets[i])) {
              curLookup = propTweenLookup[i];
              if (vars === "all") {
                overwrittenProps[i] = vars;
                props = curLookup;
                curOverwriteProps = {};
              } else {
                curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
                props = vars;
              }
              for (p in props) {
                pt = curLookup && curLookup[p];
                if (pt) {
                  if (!("kill" in pt.d) || pt.d.kill(p) === true) {
                    _removeLinkedListItem(this, pt, "_pt");
                  }
                  delete curLookup[p];
                }
                if (curOverwriteProps !== "all") {
                  curOverwriteProps[p] = 1;
                }
              }
            }
          }
          this._initted && !this._pt && firstPT && _interrupt(this);
          return this;
        };
        Tween2.to = function to(targets, vars) {
          return new Tween2(targets, vars, arguments[2]);
        };
        Tween2.from = function from(targets, vars) {
          return _createTweenType(1, arguments);
        };
        Tween2.delayedCall = function delayedCall(delay, callback, params, scope) {
          return new Tween2(callback, 0, {
            immediateRender: false,
            lazy: false,
            overwrite: false,
            delay,
            onComplete: callback,
            onReverseComplete: callback,
            onCompleteParams: params,
            onReverseCompleteParams: params,
            callbackScope: scope
          });
        };
        Tween2.fromTo = function fromTo(targets, fromVars, toVars) {
          return _createTweenType(2, arguments);
        };
        Tween2.set = function set(targets, vars) {
          vars.duration = 0;
          vars.repeatDelay || (vars.repeat = 0);
          return new Tween2(targets, vars);
        };
        Tween2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
          return _globalTimeline.killTweensOf(targets, props, onlyActive);
        };
        return Tween2;
      }(Animation);
      _setDefaults(Tween.prototype, {
        _targets: [],
        _lazy: 0,
        _startAt: 0,
        _op: 0,
        _onInit: 0
      });
      _forEachName("staggerTo,staggerFrom,staggerFromTo", function(name) {
        Tween[name] = function() {
          var tl = new Timeline(), params = _slice.call(arguments, 0);
          params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
          return tl[name].apply(tl, params);
        };
      });
      var _setterPlain = function _setterPlain2(target, property, value) {
        return target[property] = value;
      }, _setterFunc = function _setterFunc2(target, property, value) {
        return target[property](value);
      }, _setterFuncWithParam = function _setterFuncWithParam2(target, property, value, data) {
        return target[property](data.fp, value);
      }, _setterAttribute = function _setterAttribute2(target, property, value) {
        return target.setAttribute(property, value);
      }, _getSetter = function _getSetter2(target, property) {
        return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
      }, _renderPlain = function _renderPlain2(ratio, data) {
        return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e6) / 1e6, data);
      }, _renderBoolean = function _renderBoolean2(ratio, data) {
        return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
      }, _renderComplexString = function _renderComplexString2(ratio, data) {
        var pt = data._pt, s7 = "";
        if (!ratio && data.b) {
          s7 = data.b;
        } else if (ratio === 1 && data.e) {
          s7 = data.e;
        } else {
          while (pt) {
            s7 = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 1e4) / 1e4) + s7;
            pt = pt._next;
          }
          s7 += data.c;
        }
        data.set(data.t, data.p, s7, data);
      }, _renderPropTweens = function _renderPropTweens2(ratio, data) {
        var pt = data._pt;
        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }
      }, _addPluginModifier = function _addPluginModifier2(modifier, tween, target, property) {
        var pt = this._pt, next;
        while (pt) {
          next = pt._next;
          pt.p === property && pt.modifier(modifier, tween, target);
          pt = next;
        }
      }, _killPropTweensOf = function _killPropTweensOf2(property) {
        var pt = this._pt, hasNonDependentRemaining, next;
        while (pt) {
          next = pt._next;
          if (pt.p === property && !pt.op || pt.op === property) {
            _removeLinkedListItem(this, pt, "_pt");
          } else if (!pt.dep) {
            hasNonDependentRemaining = 1;
          }
          pt = next;
        }
        return !hasNonDependentRemaining;
      }, _setterWithModifier = function _setterWithModifier2(target, property, value, data) {
        data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
      }, _sortPropTweensByPriority = function _sortPropTweensByPriority2(parent) {
        var pt = parent._pt, next, pt2, first, last;
        while (pt) {
          next = pt._next;
          pt2 = first;
          while (pt2 && pt2.pr > pt.pr) {
            pt2 = pt2._next;
          }
          if (pt._prev = pt2 ? pt2._prev : last) {
            pt._prev._next = pt;
          } else {
            first = pt;
          }
          if (pt._next = pt2) {
            pt2._prev = pt;
          } else {
            last = pt;
          }
          pt = next;
        }
        parent._pt = first;
      };
      var PropTween = function() {
        function PropTween2(next, target, prop, start, change, renderer, data, setter, priority) {
          this.t = target;
          this.s = start;
          this.c = change;
          this.p = prop;
          this.r = renderer || _renderPlain;
          this.d = data || this;
          this.set = setter || _setterPlain;
          this.pr = priority || 0;
          this._next = next;
          if (next) {
            next._prev = this;
          }
        }
        var _proto4 = PropTween2.prototype;
        _proto4.modifier = function modifier(func, tween, target) {
          this.mSet = this.mSet || this.set;
          this.set = _setterWithModifier;
          this.m = func;
          this.mt = target;
          this.tween = tween;
        };
        return PropTween2;
      }();
      _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(name) {
        return _reservedProps[name] = 1;
      });
      _globals.TweenMax = _globals.TweenLite = Tween;
      _globals.TimelineLite = _globals.TimelineMax = Timeline;
      _globalTimeline = new Timeline({
        sortChildren: false,
        defaults: _defaults,
        autoRemoveChildren: true,
        id: "root",
        smoothChildTiming: true
      });
      _config.stringFilter = _colorStringFilter;
      var _gsap = {
        registerPlugin: function registerPlugin() {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          args.forEach(function(config) {
            return _createPlugin(config);
          });
        },
        timeline: function timeline(vars) {
          return new Timeline(vars);
        },
        getTweensOf: function getTweensOf(targets, onlyActive) {
          return _globalTimeline.getTweensOf(targets, onlyActive);
        },
        getProperty: function getProperty(target, property, unit, uncache) {
          _isString(target) && (target = toArray(target)[0]);
          var getter = _getCache(target || {}).get, format2 = unit ? _passThrough : _numericIfPossible;
          unit === "native" && (unit = "");
          return !target ? target : !property ? function(property2, unit2, uncache2) {
            return format2((_plugins[property2] && _plugins[property2].get || getter)(target, property2, unit2, uncache2));
          } : format2((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
        },
        quickSetter: function quickSetter(target, property, unit) {
          target = toArray(target);
          if (target.length > 1) {
            var setters = target.map(function(t) {
              return gsap2.quickSetter(t, property, unit);
            }), l = setters.length;
            return function(value) {
              var i = l;
              while (i--) {
                setters[i](value);
              }
            };
          }
          target = target[0] || {};
          var Plugin = _plugins[property], cache = _getCache(target), p = cache.harness && (cache.harness.aliases || {})[property] || property, setter = Plugin ? function(value) {
            var p2 = new Plugin();
            _quickTween._pt = 0;
            p2.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
            p2.render(1, p2);
            _quickTween._pt && _renderPropTweens(1, _quickTween);
          } : cache.set(target, p);
          return Plugin ? setter : function(value) {
            return setter(target, p, unit ? value + unit : value, cache, 1);
          };
        },
        isTweening: function isTweening(targets) {
          return _globalTimeline.getTweensOf(targets, true).length > 0;
        },
        defaults: function defaults(value) {
          value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
          return _mergeDeep(_defaults, value || {});
        },
        config: function config(value) {
          return _mergeDeep(_config, value || {});
        },
        registerEffect: function registerEffect(_ref3) {
          var name = _ref3.name, effect = _ref3.effect, plugins = _ref3.plugins, defaults = _ref3.defaults, extendTimeline = _ref3.extendTimeline;
          (plugins || "").split(",").forEach(function(pluginName) {
            return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
          });
          _effects[name] = function(targets, vars, tl) {
            return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
          };
          if (extendTimeline) {
            Timeline.prototype[name] = function(targets, vars, position) {
              return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
            };
          }
        },
        registerEase: function registerEase(name, ease) {
          _easeMap[name] = _parseEase(ease);
        },
        parseEase: function parseEase(ease, defaultEase) {
          return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
        },
        getById: function getById(id) {
          return _globalTimeline.getById(id);
        },
        exportRoot: function exportRoot(vars, includeDelayedCalls) {
          if (vars === void 0) {
            vars = {};
          }
          var tl = new Timeline(vars), child, next;
          tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
          _globalTimeline.remove(tl);
          tl._dp = 0;
          tl._time = tl._tTime = _globalTimeline._time;
          child = _globalTimeline._first;
          while (child) {
            next = child._next;
            if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
              _addToTimeline(tl, child, child._start - child._delay);
            }
            child = next;
          }
          _addToTimeline(_globalTimeline, tl, 0);
          return tl;
        },
        utils: {
          wrap,
          wrapYoyo,
          distribute,
          random,
          snap,
          normalize: normalize2,
          getUnit,
          clamp,
          splitColor,
          toArray,
          selector,
          mapRange,
          pipe,
          unitize,
          interpolate,
          shuffle
        },
        install: _install,
        effects: _effects,
        ticker: _ticker,
        updateRoot: Timeline.updateRoot,
        plugins: _plugins,
        globalTimeline: _globalTimeline,
        core: {
          PropTween,
          globals: _addGlobal,
          Tween,
          Timeline,
          Animation,
          getCache: _getCache,
          _removeLinkedListItem,
          suppressOverwrites: function suppressOverwrites(value) {
            return _suppressOverwrites = value;
          }
        }
      };
      _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function(name) {
        return _gsap[name] = Tween[name];
      });
      _ticker.add(Timeline.updateRoot);
      _quickTween = _gsap.to({}, {
        duration: 0
      });
      var _getPluginPropTween = function _getPluginPropTween2(plugin, prop) {
        var pt = plugin._pt;
        while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
          pt = pt._next;
        }
        return pt;
      }, _addModifiers = function _addModifiers2(tween, modifiers) {
        var targets = tween._targets, p, i, pt;
        for (p in modifiers) {
          i = targets.length;
          while (i--) {
            pt = tween._ptLookup[i][p];
            if (pt && (pt = pt.d)) {
              if (pt._pt) {
                pt = _getPluginPropTween(pt, p);
              }
              pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
            }
          }
        }
      }, _buildModifierPlugin = function _buildModifierPlugin2(name, modifier) {
        return {
          name,
          rawVars: 1,
          init: function init2(target, vars, tween) {
            tween._onInit = function(tween2) {
              var temp, p;
              if (_isString(vars)) {
                temp = {};
                _forEachName(vars, function(name2) {
                  return temp[name2] = 1;
                });
                vars = temp;
              }
              if (modifier) {
                temp = {};
                for (p in vars) {
                  temp[p] = modifier(vars[p]);
                }
                vars = temp;
              }
              _addModifiers(tween2, vars);
            };
          }
        };
      };
      var gsap2 = _gsap.registerPlugin({
        name: "attr",
        init: function init2(target, vars, tween, index2, targets) {
          var p, pt;
          for (p in vars) {
            pt = this.add(target, "setAttribute", (target.getAttribute(p) || 0) + "", vars[p], index2, targets, 0, 0, p);
            pt && (pt.op = p);
            this._props.push(p);
          }
        }
      }, {
        name: "endArray",
        init: function init2(target, value) {
          var i = value.length;
          while (i--) {
            this.add(target, i, target[i] || 0, value[i]);
          }
        }
      }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
      Tween.version = Timeline.version = gsap2.version = "3.7.1";
      _coreReady = 1;
      _windowExists() && _wake();
      var Power0 = _easeMap.Power0, Power1 = _easeMap.Power1, Power2 = _easeMap.Power2, Power3 = _easeMap.Power3, Power4 = _easeMap.Power4, Linear = _easeMap.Linear, Quad = _easeMap.Quad, Cubic = _easeMap.Cubic, Quart = _easeMap.Quart, Quint = _easeMap.Quint, Strong = _easeMap.Strong, Elastic = _easeMap.Elastic, Back = _easeMap.Back, SteppedEase = _easeMap.SteppedEase, Bounce = _easeMap.Bounce, Sine = _easeMap.Sine, Expo = _easeMap.Expo, Circ = _easeMap.Circ;
      var _win$1, _doc$1, _docElement, _pluginInitted, _tempDiv, _tempDivStyler, _recentSetterPlugin, _windowExists$1 = function _windowExists2() {
        return typeof window !== "undefined";
      }, _transformProps = {}, _RAD2DEG = 180 / Math.PI, _DEG2RAD = Math.PI / 180, _atan2 = Math.atan2, _bigNum$1 = 1e8, _capsExp = /([A-Z])/g, _horizontalExp = /(?:left|right|width|margin|padding|x)/i, _complexExp = /[\s,\(]\S/, _propertyAliases = {
        autoAlpha: "opacity,visibility",
        scale: "scaleX,scaleY",
        alpha: "opacity"
      }, _renderCSSProp = function _renderCSSProp2(ratio, data) {
        return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
      }, _renderPropWithEnd = function _renderPropWithEnd2(ratio, data) {
        return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
      }, _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning2(ratio, data) {
        return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
      }, _renderRoundedCSSProp = function _renderRoundedCSSProp2(ratio, data) {
        var value = data.s + data.c * ratio;
        data.set(data.t, data.p, ~~(value + (value < 0 ? -0.5 : 0.5)) + data.u, data);
      }, _renderNonTweeningValue = function _renderNonTweeningValue2(ratio, data) {
        return data.set(data.t, data.p, ratio ? data.e : data.b, data);
      }, _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd2(ratio, data) {
        return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
      }, _setterCSSStyle = function _setterCSSStyle2(target, property, value) {
        return target.style[property] = value;
      }, _setterCSSProp = function _setterCSSProp2(target, property, value) {
        return target.style.setProperty(property, value);
      }, _setterTransform = function _setterTransform2(target, property, value) {
        return target._gsap[property] = value;
      }, _setterScale = function _setterScale2(target, property, value) {
        return target._gsap.scaleX = target._gsap.scaleY = value;
      }, _setterScaleWithRender = function _setterScaleWithRender2(target, property, value, data, ratio) {
        var cache = target._gsap;
        cache.scaleX = cache.scaleY = value;
        cache.renderTransform(ratio, cache);
      }, _setterTransformWithRender = function _setterTransformWithRender2(target, property, value, data, ratio) {
        var cache = target._gsap;
        cache[property] = value;
        cache.renderTransform(ratio, cache);
      }, _transformProp = "transform", _transformOriginProp = _transformProp + "Origin", _supports3D, _createElement = function _createElement2(type, ns) {
        var e = _doc$1.createElementNS ? _doc$1.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$1.createElement(type);
        return e.style ? e : _doc$1.createElement(type);
      }, _getComputedProperty = function _getComputedProperty2(target, property, skipPrefixFallback) {
        var cs = getComputedStyle(target);
        return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty2(target, _checkPropPrefix(property) || property, 1) || "";
      }, _prefixes = "O,Moz,ms,Ms,Webkit".split(","), _checkPropPrefix = function _checkPropPrefix2(property, element, preferPrefix) {
        var e = element || _tempDiv, s7 = e.style, i = 5;
        if (property in s7 && !preferPrefix) {
          return property;
        }
        property = property.charAt(0).toUpperCase() + property.substr(1);
        while (i-- && !(_prefixes[i] + property in s7)) {
        }
        return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
      }, _initCore = function _initCore2() {
        if (_windowExists$1() && window.document) {
          _win$1 = window;
          _doc$1 = _win$1.document;
          _docElement = _doc$1.documentElement;
          _tempDiv = _createElement("div") || {
            style: {}
          };
          _tempDivStyler = _createElement("div");
          _transformProp = _checkPropPrefix(_transformProp);
          _transformOriginProp = _transformProp + "Origin";
          _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
          _supports3D = !!_checkPropPrefix("perspective");
          _pluginInitted = 1;
        }
      }, _getBBoxHack = function _getBBoxHack2(swapIfPossible) {
        var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), oldParent = this.parentNode, oldSibling = this.nextSibling, oldCSS = this.style.cssText, bbox;
        _docElement.appendChild(svg);
        svg.appendChild(this);
        this.style.display = "block";
        if (swapIfPossible) {
          try {
            bbox = this.getBBox();
            this._gsapBBox = this.getBBox;
            this.getBBox = _getBBoxHack2;
          } catch (e) {
          }
        } else if (this._gsapBBox) {
          bbox = this._gsapBBox();
        }
        if (oldParent) {
          if (oldSibling) {
            oldParent.insertBefore(this, oldSibling);
          } else {
            oldParent.appendChild(this);
          }
        }
        _docElement.removeChild(svg);
        this.style.cssText = oldCSS;
        return bbox;
      }, _getAttributeFallbacks = function _getAttributeFallbacks2(target, attributesArray) {
        var i = attributesArray.length;
        while (i--) {
          if (target.hasAttribute(attributesArray[i])) {
            return target.getAttribute(attributesArray[i]);
          }
        }
      }, _getBBox = function _getBBox2(target) {
        var bounds;
        try {
          bounds = target.getBBox();
        } catch (error2) {
          bounds = _getBBoxHack.call(target, true);
        }
        bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true));
        return bounds && !bounds.width && !bounds.x && !bounds.y ? {
          x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
          y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
          width: 0,
          height: 0
        } : bounds;
      }, _isSVG = function _isSVG2(e) {
        return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
      }, _removeProperty = function _removeProperty2(target, property) {
        if (property) {
          var style = target.style;
          if (property in _transformProps && property !== _transformOriginProp) {
            property = _transformProp;
          }
          if (style.removeProperty) {
            if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
              property = "-" + property;
            }
            style.removeProperty(property.replace(_capsExp, "-$1").toLowerCase());
          } else {
            style.removeAttribute(property);
          }
        }
      }, _addNonTweeningPT = function _addNonTweeningPT2(plugin, target, property, beginning, end, onlySetAtEnd) {
        var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
        plugin._pt = pt;
        pt.b = beginning;
        pt.e = end;
        plugin._props.push(property);
        return pt;
      }, _nonConvertibleUnits = {
        deg: 1,
        rad: 1,
        turn: 1
      }, _convertToUnit = function _convertToUnit2(target, property, value, unit) {
        var curValue = parseFloat(value) || 0, curUnit = (value + "").trim().substr((curValue + "").length) || "px", style = _tempDiv.style, horizontal = _horizontalExp.test(property), isRootSVG = target.tagName.toLowerCase() === "svg", measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"), amount = 100, toPixels = unit === "px", toPercent = unit === "%", px, parent, cache, isSVG;
        if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
          return curValue;
        }
        curUnit !== "px" && !toPixels && (curValue = _convertToUnit2(target, property, value, "px"));
        isSVG = target.getCTM && _isSVG(target);
        if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
          px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
          return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
        }
        style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
        parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
        if (isSVG) {
          parent = (target.ownerSVGElement || {}).parentNode;
        }
        if (!parent || parent === _doc$1 || !parent.appendChild) {
          parent = _doc$1.body;
        }
        cache = parent._gsap;
        if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time) {
          return _round(curValue / cache.width * amount);
        } else {
          (toPercent || curUnit === "%") && (style.position = _getComputedProperty(target, "position"));
          parent === target && (style.position = "static");
          parent.appendChild(_tempDiv);
          px = _tempDiv[measureProperty];
          parent.removeChild(_tempDiv);
          style.position = "absolute";
          if (horizontal && toPercent) {
            cache = _getCache(parent);
            cache.time = _ticker.time;
            cache.width = parent[measureProperty];
          }
        }
        return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
      }, _get = function _get2(target, property, unit, uncache) {
        var value;
        _pluginInitted || _initCore();
        if (property in _propertyAliases && property !== "transform") {
          property = _propertyAliases[property];
          if (~property.indexOf(",")) {
            property = property.split(",")[0];
          }
        }
        if (_transformProps[property] && property !== "transform") {
          value = _parseTransform(target, uncache);
          value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
        } else {
          value = target.style[property];
          if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
            value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0);
          }
        }
        return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
      }, _tweenComplexCSSString = function _tweenComplexCSSString2(target, prop, start, end) {
        if (!start || start === "none") {
          var p = _checkPropPrefix(prop, target, 1), s7 = p && _getComputedProperty(target, p, 1);
          if (s7 && s7 !== start) {
            prop = p;
            start = s7;
          } else if (prop === "borderColor") {
            start = _getComputedProperty(target, "borderTopColor");
          }
        }
        var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString), index2 = 0, matchIndex = 0, a, result, startValues, startNum, color, startValue, endValue, endNum, chunk, endUnit, startUnit, relative, endValues;
        pt.b = start;
        pt.e = end;
        start += "";
        end += "";
        if (end === "auto") {
          target.style[prop] = end;
          end = _getComputedProperty(target, prop) || end;
          target.style[prop] = start;
        }
        a = [start, end];
        _colorStringFilter(a);
        start = a[0];
        end = a[1];
        startValues = start.match(_numWithUnitExp) || [];
        endValues = end.match(_numWithUnitExp) || [];
        if (endValues.length) {
          while (result = _numWithUnitExp.exec(end)) {
            endValue = result[0];
            chunk = end.substring(index2, result.index);
            if (color) {
              color = (color + 1) % 5;
            } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
              color = 1;
            }
            if (endValue !== (startValue = startValues[matchIndex++] || "")) {
              startNum = parseFloat(startValue) || 0;
              startUnit = startValue.substr((startNum + "").length);
              relative = endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;
              if (relative) {
                endValue = endValue.substr(2);
              }
              endNum = parseFloat(endValue);
              endUnit = endValue.substr((endNum + "").length);
              index2 = _numWithUnitExp.lastIndex - endUnit.length;
              if (!endUnit) {
                endUnit = endUnit || _config.units[prop] || startUnit;
                if (index2 === end.length) {
                  end += endUnit;
                  pt.e += endUnit;
                }
              }
              if (startUnit !== endUnit) {
                startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
              }
              pt._pt = {
                _next: pt._pt,
                p: chunk || matchIndex === 1 ? chunk : ",",
                s: startNum,
                c: relative ? relative * endNum : endNum - startNum,
                m: color && color < 4 || prop === "zIndex" ? Math.round : 0
              };
            }
          }
          pt.c = index2 < end.length ? end.substring(index2, end.length) : "";
        } else {
          pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
        }
        _relExp.test(end) && (pt.e = 0);
        this._pt = pt;
        return pt;
      }, _keywordToPercent = {
        top: "0%",
        bottom: "100%",
        left: "0%",
        right: "100%",
        center: "50%"
      }, _convertKeywordsToPercentages = function _convertKeywordsToPercentages2(value) {
        var split = value.split(" "), x = split[0], y = split[1] || "50%";
        if (x === "top" || x === "bottom" || y === "left" || y === "right") {
          value = x;
          x = y;
          y = value;
        }
        split[0] = _keywordToPercent[x] || x;
        split[1] = _keywordToPercent[y] || y;
        return split.join(" ");
      }, _renderClearProps = function _renderClearProps2(ratio, data) {
        if (data.tween && data.tween._time === data.tween._dur) {
          var target = data.t, style = target.style, props = data.u, cache = target._gsap, prop, clearTransforms, i;
          if (props === "all" || props === true) {
            style.cssText = "";
            clearTransforms = 1;
          } else {
            props = props.split(",");
            i = props.length;
            while (--i > -1) {
              prop = props[i];
              if (_transformProps[prop]) {
                clearTransforms = 1;
                prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
              }
              _removeProperty(target, prop);
            }
          }
          if (clearTransforms) {
            _removeProperty(target, _transformProp);
            if (cache) {
              cache.svg && target.removeAttribute("transform");
              _parseTransform(target, 1);
              cache.uncache = 1;
            }
          }
        }
      }, _specialProps = {
        clearProps: function clearProps(plugin, target, property, endValue, tween) {
          if (tween.data !== "isFromStart") {
            var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
            pt.u = endValue;
            pt.pr = -10;
            pt.tween = tween;
            plugin._props.push(property);
            return 1;
          }
        }
      }, _identity2DMatrix = [1, 0, 0, 1, 0, 0], _rotationalProperties = {}, _isNullTransform = function _isNullTransform2(value) {
        return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
      }, _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray2(target) {
        var matrixString = _getComputedProperty(target, _transformProp);
        return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
      }, _getMatrix = function _getMatrix2(target, force2D) {
        var cache = target._gsap || _getCache(target), style = target.style, matrix = _getComputedTransformMatrixAsArray(target), parent, nextSibling, temp, addedToDOM;
        if (cache.svg && target.getAttribute("transform")) {
          temp = target.transform.baseVal.consolidate().matrix;
          matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
          return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
        } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
          temp = style.display;
          style.display = "block";
          parent = target.parentNode;
          if (!parent || !target.offsetParent) {
            addedToDOM = 1;
            nextSibling = target.nextSibling;
            _docElement.appendChild(target);
          }
          matrix = _getComputedTransformMatrixAsArray(target);
          temp ? style.display = temp : _removeProperty(target, "display");
          if (addedToDOM) {
            nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
          }
        }
        return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
      }, _applySVGOrigin = function _applySVGOrigin2(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
        var cache = target._gsap, matrix = matrixArray || _getMatrix(target, true), xOriginOld = cache.xOrigin || 0, yOriginOld = cache.yOrigin || 0, xOffsetOld = cache.xOffset || 0, yOffsetOld = cache.yOffset || 0, a = matrix[0], b = matrix[1], c = matrix[2], d = matrix[3], tx = matrix[4], ty = matrix[5], originSplit = origin.split(" "), xOrigin = parseFloat(originSplit[0]) || 0, yOrigin = parseFloat(originSplit[1]) || 0, bounds, determinant, x, y;
        if (!originIsAbsolute) {
          bounds = _getBBox(target);
          xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
          yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
        } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
          x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
          y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
          xOrigin = x;
          yOrigin = y;
        }
        if (smooth || smooth !== false && cache.smooth) {
          tx = xOrigin - xOriginOld;
          ty = yOrigin - yOriginOld;
          cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
          cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
        } else {
          cache.xOffset = cache.yOffset = 0;
        }
        cache.xOrigin = xOrigin;
        cache.yOrigin = yOrigin;
        cache.smooth = !!smooth;
        cache.origin = origin;
        cache.originIsAbsolute = !!originIsAbsolute;
        target.style[_transformOriginProp] = "0px 0px";
        if (pluginToAddPropTweensTo) {
          _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);
          _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);
          _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);
          _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
        }
        target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
      }, _parseTransform = function _parseTransform2(target, uncache) {
        var cache = target._gsap || new GSCache(target);
        if ("x" in cache && !uncache && !cache.uncache) {
          return cache;
        }
        var style = target.style, invertedScaleX = cache.scaleX < 0, px = "px", deg = "deg", origin = _getComputedProperty(target, _transformOriginProp) || "0", x, y, z, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY, perspective, xOrigin, yOrigin, matrix, angle, cos, sin, a, b, c, d, a12, a22, t1, t2, t3, a13, a23, a33, a42, a43, a32;
        x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
        scaleX = scaleY = 1;
        cache.svg = !!(target.getCTM && _isSVG(target));
        matrix = _getMatrix(target, cache.svg);
        if (cache.svg) {
          t1 = (!cache.uncache || origin === "0px 0px") && !uncache && target.getAttribute("data-svg-origin");
          _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
        }
        xOrigin = cache.xOrigin || 0;
        yOrigin = cache.yOrigin || 0;
        if (matrix !== _identity2DMatrix) {
          a = matrix[0];
          b = matrix[1];
          c = matrix[2];
          d = matrix[3];
          x = a12 = matrix[4];
          y = a22 = matrix[5];
          if (matrix.length === 6) {
            scaleX = Math.sqrt(a * a + b * b);
            scaleY = Math.sqrt(d * d + c * c);
            rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
            skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
            skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
            if (cache.svg) {
              x -= xOrigin - (xOrigin * a + yOrigin * c);
              y -= yOrigin - (xOrigin * b + yOrigin * d);
            }
          } else {
            a32 = matrix[6];
            a42 = matrix[7];
            a13 = matrix[8];
            a23 = matrix[9];
            a33 = matrix[10];
            a43 = matrix[11];
            x = matrix[12];
            y = matrix[13];
            z = matrix[14];
            angle = _atan2(a32, a33);
            rotationX = angle * _RAD2DEG;
            if (angle) {
              cos = Math.cos(-angle);
              sin = Math.sin(-angle);
              t1 = a12 * cos + a13 * sin;
              t2 = a22 * cos + a23 * sin;
              t3 = a32 * cos + a33 * sin;
              a13 = a12 * -sin + a13 * cos;
              a23 = a22 * -sin + a23 * cos;
              a33 = a32 * -sin + a33 * cos;
              a43 = a42 * -sin + a43 * cos;
              a12 = t1;
              a22 = t2;
              a32 = t3;
            }
            angle = _atan2(-c, a33);
            rotationY = angle * _RAD2DEG;
            if (angle) {
              cos = Math.cos(-angle);
              sin = Math.sin(-angle);
              t1 = a * cos - a13 * sin;
              t2 = b * cos - a23 * sin;
              t3 = c * cos - a33 * sin;
              a43 = d * sin + a43 * cos;
              a = t1;
              b = t2;
              c = t3;
            }
            angle = _atan2(b, a);
            rotation = angle * _RAD2DEG;
            if (angle) {
              cos = Math.cos(angle);
              sin = Math.sin(angle);
              t1 = a * cos + b * sin;
              t2 = a12 * cos + a22 * sin;
              b = b * cos - a * sin;
              a22 = a22 * cos - a12 * sin;
              a = t1;
              a12 = t2;
            }
            if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
              rotationX = rotation = 0;
              rotationY = 180 - rotationY;
            }
            scaleX = _round(Math.sqrt(a * a + b * b + c * c));
            scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
            angle = _atan2(a12, a22);
            skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
            perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
          }
          if (cache.svg) {
            t1 = target.getAttribute("transform");
            cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
            t1 && target.setAttribute("transform", t1);
          }
        }
        if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
          if (invertedScaleX) {
            scaleX *= -1;
            skewX += rotation <= 0 ? 180 : -180;
            rotation += rotation <= 0 ? 180 : -180;
          } else {
            scaleY *= -1;
            skewX += skewX <= 0 ? 180 : -180;
          }
        }
        cache.x = x - ((cache.xPercent = x && (cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
        cache.y = y - ((cache.yPercent = y && (cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
        cache.z = z + px;
        cache.scaleX = _round(scaleX);
        cache.scaleY = _round(scaleY);
        cache.rotation = _round(rotation) + deg;
        cache.rotationX = _round(rotationX) + deg;
        cache.rotationY = _round(rotationY) + deg;
        cache.skewX = skewX + deg;
        cache.skewY = skewY + deg;
        cache.transformPerspective = perspective + px;
        if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
          style[_transformOriginProp] = _firstTwoOnly(origin);
        }
        cache.xOffset = cache.yOffset = 0;
        cache.force3D = _config.force3D;
        cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
        cache.uncache = 0;
        return cache;
      }, _firstTwoOnly = function _firstTwoOnly2(value) {
        return (value = value.split(" "))[0] + " " + value[1];
      }, _addPxTranslate = function _addPxTranslate2(target, start, value) {
        var unit = getUnit(start);
        return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
      }, _renderNon3DTransforms = function _renderNon3DTransforms2(ratio, cache) {
        cache.z = "0px";
        cache.rotationY = cache.rotationX = "0deg";
        cache.force3D = 0;
        _renderCSSTransforms(ratio, cache);
      }, _zeroDeg = "0deg", _zeroPx = "0px", _endParenthesis = ") ", _renderCSSTransforms = function _renderCSSTransforms2(ratio, cache) {
        var _ref = cache || this, xPercent = _ref.xPercent, yPercent = _ref.yPercent, x = _ref.x, y = _ref.y, z = _ref.z, rotation = _ref.rotation, rotationY = _ref.rotationY, rotationX = _ref.rotationX, skewX = _ref.skewX, skewY = _ref.skewY, scaleX = _ref.scaleX, scaleY = _ref.scaleY, transformPerspective = _ref.transformPerspective, force3D = _ref.force3D, target = _ref.target, zOrigin = _ref.zOrigin, transforms = "", use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true;
        if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
          var angle = parseFloat(rotationY) * _DEG2RAD, a13 = Math.sin(angle), a33 = Math.cos(angle), cos;
          angle = parseFloat(rotationX) * _DEG2RAD;
          cos = Math.cos(angle);
          x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
          y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
          z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
        }
        if (transformPerspective !== _zeroPx) {
          transforms += "perspective(" + transformPerspective + _endParenthesis;
        }
        if (xPercent || yPercent) {
          transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
        }
        if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
          transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
        }
        if (rotation !== _zeroDeg) {
          transforms += "rotate(" + rotation + _endParenthesis;
        }
        if (rotationY !== _zeroDeg) {
          transforms += "rotateY(" + rotationY + _endParenthesis;
        }
        if (rotationX !== _zeroDeg) {
          transforms += "rotateX(" + rotationX + _endParenthesis;
        }
        if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
          transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
        }
        if (scaleX !== 1 || scaleY !== 1) {
          transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
        }
        target.style[_transformProp] = transforms || "translate(0, 0)";
      }, _renderSVGTransforms = function _renderSVGTransforms2(ratio, cache) {
        var _ref2 = cache || this, xPercent = _ref2.xPercent, yPercent = _ref2.yPercent, x = _ref2.x, y = _ref2.y, rotation = _ref2.rotation, skewX = _ref2.skewX, skewY = _ref2.skewY, scaleX = _ref2.scaleX, scaleY = _ref2.scaleY, target = _ref2.target, xOrigin = _ref2.xOrigin, yOrigin = _ref2.yOrigin, xOffset = _ref2.xOffset, yOffset = _ref2.yOffset, forceCSS = _ref2.forceCSS, tx = parseFloat(x), ty = parseFloat(y), a11, a21, a12, a22, temp;
        rotation = parseFloat(rotation);
        skewX = parseFloat(skewX);
        skewY = parseFloat(skewY);
        if (skewY) {
          skewY = parseFloat(skewY);
          skewX += skewY;
          rotation += skewY;
        }
        if (rotation || skewX) {
          rotation *= _DEG2RAD;
          skewX *= _DEG2RAD;
          a11 = Math.cos(rotation) * scaleX;
          a21 = Math.sin(rotation) * scaleX;
          a12 = Math.sin(rotation - skewX) * -scaleY;
          a22 = Math.cos(rotation - skewX) * scaleY;
          if (skewX) {
            skewY *= _DEG2RAD;
            temp = Math.tan(skewX - skewY);
            temp = Math.sqrt(1 + temp * temp);
            a12 *= temp;
            a22 *= temp;
            if (skewY) {
              temp = Math.tan(skewY);
              temp = Math.sqrt(1 + temp * temp);
              a11 *= temp;
              a21 *= temp;
            }
          }
          a11 = _round(a11);
          a21 = _round(a21);
          a12 = _round(a12);
          a22 = _round(a22);
        } else {
          a11 = scaleX;
          a22 = scaleY;
          a21 = a12 = 0;
        }
        if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
          tx = _convertToUnit(target, "x", x, "px");
          ty = _convertToUnit(target, "y", y, "px");
        }
        if (xOrigin || yOrigin || xOffset || yOffset) {
          tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
          ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
        }
        if (xPercent || yPercent) {
          temp = target.getBBox();
          tx = _round(tx + xPercent / 100 * temp.width);
          ty = _round(ty + yPercent / 100 * temp.height);
        }
        temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
        target.setAttribute("transform", temp);
        forceCSS && (target.style[_transformProp] = temp);
      }, _addRotationalPropTween = function _addRotationalPropTween2(plugin, target, property, startNum, endValue, relative) {
        var cap = 360, isString = _isString(endValue), endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1), change = relative ? endNum * relative : endNum - startNum, finalValue = startNum + change + "deg", direction, pt;
        if (isString) {
          direction = endValue.split("_")[1];
          if (direction === "short") {
            change %= cap;
            if (change !== change % (cap / 2)) {
              change += change < 0 ? cap : -cap;
            }
          }
          if (direction === "cw" && change < 0) {
            change = (change + cap * _bigNum$1) % cap - ~~(change / cap) * cap;
          } else if (direction === "ccw" && change > 0) {
            change = (change - cap * _bigNum$1) % cap - ~~(change / cap) * cap;
          }
        }
        plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
        pt.e = finalValue;
        pt.u = "deg";
        plugin._props.push(property);
        return pt;
      }, _assign = function _assign2(target, source) {
        for (var p in source) {
          target[p] = source[p];
        }
        return target;
      }, _addRawTransformPTs = function _addRawTransformPTs2(plugin, transforms, target) {
        var startCache = _assign({}, target._gsap), exclude = "perspective,force3D,transformOrigin,svgOrigin", style = target.style, endCache, p, startValue, endValue, startNum, endNum, startUnit, endUnit;
        if (startCache.svg) {
          startValue = target.getAttribute("transform");
          target.setAttribute("transform", "");
          style[_transformProp] = transforms;
          endCache = _parseTransform(target, 1);
          _removeProperty(target, _transformProp);
          target.setAttribute("transform", startValue);
        } else {
          startValue = getComputedStyle(target)[_transformProp];
          style[_transformProp] = transforms;
          endCache = _parseTransform(target, 1);
          style[_transformProp] = startValue;
        }
        for (p in _transformProps) {
          startValue = startCache[p];
          endValue = endCache[p];
          if (startValue !== endValue && exclude.indexOf(p) < 0) {
            startUnit = getUnit(startValue);
            endUnit = getUnit(endValue);
            startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
            endNum = parseFloat(endValue);
            plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
            plugin._pt.u = endUnit || 0;
            plugin._props.push(p);
          }
        }
        _assign(endCache, startCache);
      };
      _forEachName("padding,margin,Width,Radius", function(name, index2) {
        var t = "Top", r = "Right", b = "Bottom", l = "Left", props = (index2 < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function(side) {
          return index2 < 2 ? name + side : "border" + side + name;
        });
        _specialProps[index2 > 1 ? "border" + name : name] = function(plugin, target, property, endValue, tween) {
          var a, vars;
          if (arguments.length < 4) {
            a = props.map(function(prop) {
              return _get(plugin, prop, property);
            });
            vars = a.join(" ");
            return vars.split(a[0]).length === 5 ? a[0] : vars;
          }
          a = (endValue + "").split(" ");
          vars = {};
          props.forEach(function(prop, i) {
            return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
          });
          plugin.init(target, vars, tween);
        };
      });
      var CSSPlugin = {
        name: "css",
        register: _initCore,
        targetTest: function targetTest(target) {
          return target.style && target.nodeType;
        },
        init: function init2(target, vars, tween, index2, targets) {
          var props = this._props, style = target.style, startAt = tween.vars.startAt, startValue, endValue, endNum, startNum, type, specialProp, p, startUnit, endUnit, relative, isTransformRelated, transformPropTween, cache, smooth, hasPriority;
          _pluginInitted || _initCore();
          for (p in vars) {
            if (p === "autoRound") {
              continue;
            }
            endValue = vars[p];
            if (_plugins[p] && _checkPlugin(p, vars, tween, index2, target, targets)) {
              continue;
            }
            type = typeof endValue;
            specialProp = _specialProps[p];
            if (type === "function") {
              endValue = endValue.call(tween, index2, target, targets);
              type = typeof endValue;
            }
            if (type === "string" && ~endValue.indexOf("random(")) {
              endValue = _replaceRandom(endValue);
            }
            if (specialProp) {
              specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
            } else if (p.substr(0, 2) === "--") {
              startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
              endValue += "";
              _colorExp.lastIndex = 0;
              if (!_colorExp.test(startValue)) {
                startUnit = getUnit(startValue);
                endUnit = getUnit(endValue);
              }
              endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
              this.add(style, "setProperty", startValue, endValue, index2, targets, 0, 0, p);
              props.push(p);
            } else if (type !== "undefined") {
              if (startAt && p in startAt) {
                startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index2, target, targets) : startAt[p];
                p in _config.units && !getUnit(startValue) && (startValue += _config.units[p]);
                (startValue + "").charAt(1) === "=" && (startValue = _get(target, p));
              } else {
                startValue = _get(target, p);
              }
              startNum = parseFloat(startValue);
              relative = type === "string" && endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;
              relative && (endValue = endValue.substr(2));
              endNum = parseFloat(endValue);
              if (p in _propertyAliases) {
                if (p === "autoAlpha") {
                  if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
                    startNum = 0;
                  }
                  _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
                }
                if (p !== "scale" && p !== "transform") {
                  p = _propertyAliases[p];
                  ~p.indexOf(",") && (p = p.split(",")[0]);
                }
              }
              isTransformRelated = p in _transformProps;
              if (isTransformRelated) {
                if (!transformPropTween) {
                  cache = target._gsap;
                  cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
                  smooth = vars.smoothOrigin !== false && cache.smooth;
                  transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1);
                  transformPropTween.dep = 1;
                }
                if (p === "scale") {
                  this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? relative * endNum : endNum - cache.scaleY) || 0);
                  props.push("scaleY", p);
                  p += "X";
                } else if (p === "transformOrigin") {
                  endValue = _convertKeywordsToPercentages(endValue);
                  if (cache.svg) {
                    _applySVGOrigin(target, endValue, 0, smooth, 0, this);
                  } else {
                    endUnit = parseFloat(endValue.split(" ")[2]) || 0;
                    endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);
                    _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
                  }
                  continue;
                } else if (p === "svgOrigin") {
                  _applySVGOrigin(target, endValue, 1, smooth, 0, this);
                  continue;
                } else if (p in _rotationalProperties) {
                  _addRotationalPropTween(this, cache, p, startNum, endValue, relative);
                  continue;
                } else if (p === "smoothOrigin") {
                  _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);
                  continue;
                } else if (p === "force3D") {
                  cache[p] = endValue;
                  continue;
                } else if (p === "transform") {
                  _addRawTransformPTs(this, endValue, target);
                  continue;
                }
              } else if (!(p in style)) {
                p = _checkPropPrefix(p) || p;
              }
              if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
                startUnit = (startValue + "").substr((startNum + "").length);
                endNum || (endNum = 0);
                endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
                startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
                this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, relative ? relative * endNum : endNum - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
                this._pt.u = endUnit || 0;
                if (startUnit !== endUnit) {
                  this._pt.b = startValue;
                  this._pt.r = _renderCSSPropWithBeginning;
                }
              } else if (!(p in style)) {
                if (p in target) {
                  this.add(target, p, startValue || target[p], endValue, index2, targets);
                } else {
                  _missingPlugin(p, endValue);
                  continue;
                }
              } else {
                _tweenComplexCSSString.call(this, target, p, startValue, endValue);
              }
              props.push(p);
            }
          }
          hasPriority && _sortPropTweensByPriority(this);
        },
        get: _get,
        aliases: _propertyAliases,
        getSetter: function getSetter(target, property, plugin) {
          var p = _propertyAliases[property];
          p && p.indexOf(",") < 0 && (property = p);
          return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
        },
        core: {
          _removeProperty,
          _getMatrix
        }
      };
      gsap2.utils.checkPrefix = _checkPropPrefix;
      (function(positionAndScale, rotation, others, aliases) {
        var all = _forEachName(positionAndScale + "," + rotation + "," + others, function(name) {
          _transformProps[name] = 1;
        });
        _forEachName(rotation, function(name) {
          _config.units[name] = "deg";
          _rotationalProperties[name] = 1;
        });
        _propertyAliases[all[13]] = positionAndScale + "," + rotation;
        _forEachName(aliases, function(name) {
          var split = name.split(":");
          _propertyAliases[split[1]] = all[split[0]];
        });
      })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
      _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(name) {
        _config.units[name] = "px";
      });
      gsap2.registerPlugin(CSSPlugin);
      var gsapWithCSS = gsap2.registerPlugin(CSSPlugin) || gsap2, TweenMaxWithCSS = gsapWithCSS.core.Tween;
      exports2.Back = Back;
      exports2.Bounce = Bounce;
      exports2.CSSPlugin = CSSPlugin;
      exports2.Circ = Circ;
      exports2.Cubic = Cubic;
      exports2.Elastic = Elastic;
      exports2.Expo = Expo;
      exports2.Linear = Linear;
      exports2.Power0 = Power0;
      exports2.Power1 = Power1;
      exports2.Power2 = Power2;
      exports2.Power3 = Power3;
      exports2.Power4 = Power4;
      exports2.Quad = Quad;
      exports2.Quart = Quart;
      exports2.Quint = Quint;
      exports2.Sine = Sine;
      exports2.SteppedEase = SteppedEase;
      exports2.Strong = Strong;
      exports2.TimelineLite = Timeline;
      exports2.TimelineMax = Timeline;
      exports2.TweenLite = Tween;
      exports2.TweenMax = TweenMaxWithCSS;
      exports2.default = gsapWithCSS;
      exports2.gsap = gsapWithCSS;
      if (typeof window === "undefined" || window !== exports2) {
        Object.defineProperty(exports2, "__esModule", { value: true });
      } else {
        delete window.default;
      }
    });
  }
});

// node_modules/gsap/dist/ScrollTrigger.js
var require_ScrollTrigger = __commonJS({
  "node_modules/gsap/dist/ScrollTrigger.js"(exports, module2) {
    init_shims();
    (function(global, factory) {
      typeof exports === "object" && typeof module2 !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = global || self, factory(global.window = global.window || {}));
    })(exports, function(exports2) {
      "use strict";
      var gsap2, _coreInitted, _win, _doc, _docEl, _body, _root, _resizeDelay, _raf, _request, _toArray, _clamp, _time2, _syncInterval, _refreshing, _pointerIsDown, _transformProp, _i, _prevWidth, _prevHeight, _autoRefresh, _sort, _suppressOverwrites, _ignoreResize, _limitCallbacks, _startup = 1, _proxies = [], _scrollers = [], _getTime = Date.now, _time1 = _getTime(), _lastScrollTime = 0, _enabled = 1, _passThrough = function _passThrough2(v) {
        return v;
      }, _round = function _round2(value) {
        return Math.round(value * 1e5) / 1e5 || 0;
      }, _windowExists = function _windowExists2() {
        return typeof window !== "undefined";
      }, _getGSAP = function _getGSAP2() {
        return gsap2 || _windowExists() && (gsap2 = window.gsap) && gsap2.registerPlugin && gsap2;
      }, _isViewport = function _isViewport2(e) {
        return !!~_root.indexOf(e);
      }, _getProxyProp = function _getProxyProp2(element, property) {
        return ~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property];
      }, _getScrollFunc = function _getScrollFunc2(element, _ref) {
        var s7 = _ref.s, sc = _ref.sc;
        var i = _scrollers.indexOf(element), offset = sc === _vertical.sc ? 1 : 2;
        !~i && (i = _scrollers.push(element) - 1);
        return _scrollers[i + offset] || (_scrollers[i + offset] = _getProxyProp(element, s7) || (_isViewport(element) ? sc : function(value) {
          return arguments.length ? element[s7] = value : element[s7];
        }));
      }, _getBoundsFunc = function _getBoundsFunc2(element) {
        return _getProxyProp(element, "getBoundingClientRect") || (_isViewport(element) ? function() {
          _winOffsets.width = _win.innerWidth;
          _winOffsets.height = _win.innerHeight;
          return _winOffsets;
        } : function() {
          return _getBounds(element);
        });
      }, _getSizeFunc = function _getSizeFunc2(scroller, isViewport, _ref2) {
        var d = _ref2.d, d22 = _ref2.d2, a = _ref2.a;
        return (a = _getProxyProp(scroller, "getBoundingClientRect")) ? function() {
          return a()[d];
        } : function() {
          return (isViewport ? _win["inner" + d22] : scroller["client" + d22]) || 0;
        };
      }, _getOffsetsFunc = function _getOffsetsFunc2(element, isViewport) {
        return !isViewport || ~_proxies.indexOf(element) ? _getBoundsFunc(element) : function() {
          return _winOffsets;
        };
      }, _maxScroll = function _maxScroll2(element, _ref3) {
        var s7 = _ref3.s, d22 = _ref3.d2, d = _ref3.d, a = _ref3.a;
        return (s7 = "scroll" + d22) && (a = _getProxyProp(element, s7)) ? a() - _getBoundsFunc(element)()[d] : _isViewport(element) ? Math.max(_docEl[s7], _body[s7]) - (_win["inner" + d22] || _docEl["client" + d22] || _body["client" + d22]) : element[s7] - element["offset" + d22];
      }, _iterateAutoRefresh = function _iterateAutoRefresh2(func, events) {
        for (var i = 0; i < _autoRefresh.length; i += 3) {
          (!events || ~events.indexOf(_autoRefresh[i + 1])) && func(_autoRefresh[i], _autoRefresh[i + 1], _autoRefresh[i + 2]);
        }
      }, _isString = function _isString2(value) {
        return typeof value === "string";
      }, _isFunction = function _isFunction2(value) {
        return typeof value === "function";
      }, _isNumber = function _isNumber2(value) {
        return typeof value === "number";
      }, _isObject = function _isObject2(value) {
        return typeof value === "object";
      }, _callIfFunc = function _callIfFunc2(value) {
        return _isFunction(value) && value();
      }, _combineFunc = function _combineFunc2(f1, f2) {
        return function() {
          var result1 = _callIfFunc(f1), result2 = _callIfFunc(f2);
          return function() {
            _callIfFunc(result1);
            _callIfFunc(result2);
          };
        };
      }, _abs = Math.abs, _scrollLeft = "scrollLeft", _scrollTop = "scrollTop", _left = "left", _top = "top", _right = "right", _bottom = "bottom", _width = "width", _height = "height", _Right = "Right", _Left = "Left", _Top = "Top", _Bottom = "Bottom", _padding = "padding", _margin = "margin", _Width = "Width", _Height = "Height", _px = "px", _horizontal = {
        s: _scrollLeft,
        p: _left,
        p2: _Left,
        os: _right,
        os2: _Right,
        d: _width,
        d2: _Width,
        a: "x",
        sc: function sc(value) {
          return arguments.length ? _win.scrollTo(value, _vertical.sc()) : _win.pageXOffset || _doc[_scrollLeft] || _docEl[_scrollLeft] || _body[_scrollLeft] || 0;
        }
      }, _vertical = {
        s: _scrollTop,
        p: _top,
        p2: _Top,
        os: _bottom,
        os2: _Bottom,
        d: _height,
        d2: _Height,
        a: "y",
        op: _horizontal,
        sc: function sc(value) {
          return arguments.length ? _win.scrollTo(_horizontal.sc(), value) : _win.pageYOffset || _doc[_scrollTop] || _docEl[_scrollTop] || _body[_scrollTop] || 0;
        }
      }, _getComputedStyle = function _getComputedStyle2(element) {
        return _win.getComputedStyle(element);
      }, _makePositionable = function _makePositionable2(element) {
        var position = _getComputedStyle(element).position;
        element.style.position = position === "absolute" || position === "fixed" ? position : "relative";
      }, _setDefaults = function _setDefaults2(obj, defaults) {
        for (var p in defaults) {
          p in obj || (obj[p] = defaults[p]);
        }
        return obj;
      }, _getBounds = function _getBounds2(element, withoutTransforms) {
        var tween = withoutTransforms && _getComputedStyle(element)[_transformProp] !== "matrix(1, 0, 0, 1, 0, 0)" && gsap2.to(element, {
          x: 0,
          y: 0,
          xPercent: 0,
          yPercent: 0,
          rotation: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          skewX: 0,
          skewY: 0
        }).progress(1), bounds = element.getBoundingClientRect();
        tween && tween.progress(0).kill();
        return bounds;
      }, _getSize = function _getSize2(element, _ref4) {
        var d22 = _ref4.d2;
        return element["offset" + d22] || element["client" + d22] || 0;
      }, _getLabelRatioArray = function _getLabelRatioArray2(timeline) {
        var a = [], labels = timeline.labels, duration = timeline.duration(), p;
        for (p in labels) {
          a.push(labels[p] / duration);
        }
        return a;
      }, _getClosestLabel = function _getClosestLabel2(animation) {
        return function(value) {
          return gsap2.utils.snap(_getLabelRatioArray(animation), value);
        };
      }, _getLabelAtDirection = function _getLabelAtDirection2(timeline) {
        return function(value, st) {
          var a = _getLabelRatioArray(timeline), i;
          a.sort(function(a2, b) {
            return a2 - b;
          });
          if (st.direction > 0) {
            value -= 1e-4;
            for (i = 0; i < a.length; i++) {
              if (a[i] >= value) {
                return a[i];
              }
            }
            return a.pop();
          } else {
            i = a.length;
            value += 1e-4;
            while (i--) {
              if (a[i] <= value) {
                return a[i];
              }
            }
          }
          return a[0];
        };
      }, _multiListener = function _multiListener2(func, element, types2, callback) {
        return types2.split(",").forEach(function(type) {
          return func(element, type, callback);
        });
      }, _addListener = function _addListener2(element, type, func) {
        return element.addEventListener(type, func, {
          passive: true
        });
      }, _removeListener = function _removeListener2(element, type, func) {
        return element.removeEventListener(type, func);
      }, _markerDefaults = {
        startColor: "green",
        endColor: "red",
        indent: 0,
        fontSize: "16px",
        fontWeight: "normal"
      }, _defaults = {
        toggleActions: "play",
        anticipatePin: 0
      }, _keywords = {
        top: 0,
        left: 0,
        center: 0.5,
        bottom: 1,
        right: 1
      }, _offsetToPx = function _offsetToPx2(value, size) {
        if (_isString(value)) {
          var eqIndex = value.indexOf("="), relative = ~eqIndex ? +(value.charAt(eqIndex - 1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;
          if (~eqIndex) {
            value.indexOf("%") > eqIndex && (relative *= size / 100);
            value = value.substr(0, eqIndex - 1);
          }
          value = relative + (value in _keywords ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
        }
        return value;
      }, _createMarker = function _createMarker2(type, name, container, direction, _ref5, offset, matchWidthEl) {
        var startColor = _ref5.startColor, endColor = _ref5.endColor, fontSize = _ref5.fontSize, indent = _ref5.indent, fontWeight = _ref5.fontWeight;
        var e = _doc.createElement("div"), useFixedPosition = _isViewport(container) || _getProxyProp(container, "pinType") === "fixed", isScroller = type.indexOf("scroller") !== -1, parent = useFixedPosition ? _body : container, isStart = type.indexOf("start") !== -1, color = isStart ? startColor : endColor, css2 = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";
        css2 += "position:" + (isScroller && useFixedPosition ? "fixed;" : "absolute;");
        (isScroller || !useFixedPosition) && (css2 += (direction === _vertical ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
        matchWidthEl && (css2 += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
        e._isStart = isStart;
        e.setAttribute("class", "gsap-marker-" + type);
        e.style.cssText = css2;
        e.innerText = name || name === 0 ? type + "-" + name : type;
        parent.children[0] ? parent.insertBefore(e, parent.children[0]) : parent.appendChild(e);
        e._offset = e["offset" + direction.op.d2];
        _positionMarker(e, 0, direction, isStart);
        return e;
      }, _positionMarker = function _positionMarker2(marker, start, direction, flipped) {
        var vars = {
          display: "block"
        }, side = direction[flipped ? "os2" : "p2"], oppositeSide = direction[flipped ? "p2" : "os2"];
        marker._isFlipped = flipped;
        vars[direction.a + "Percent"] = flipped ? -100 : 0;
        vars[direction.a] = flipped ? "1px" : 0;
        vars["border" + side + _Width] = 1;
        vars["border" + oppositeSide + _Width] = 0;
        vars[direction.p] = start + "px";
        gsap2.set(marker, vars);
      }, _triggers = [], _ids = {}, _sync = function _sync2() {
        return _request || (_request = _raf(_updateAll));
      }, _onScroll = function _onScroll2() {
        if (!_request) {
          _request = _raf(_updateAll);
          _lastScrollTime || _dispatch("scrollStart");
          _lastScrollTime = _getTime();
        }
      }, _onResize = function _onResize2() {
        return !_refreshing && !_ignoreResize && !_doc.fullscreenElement && _resizeDelay.restart(true);
      }, _listeners = {}, _emptyArray = [], _media = [], _creatingMedia, _lastMediaTick, _onMediaChange = function _onMediaChange2(e) {
        var tick = gsap2.ticker.frame, matches = [], i = 0, index2;
        if (_lastMediaTick !== tick || _startup) {
          _revertAll();
          for (; i < _media.length; i += 4) {
            index2 = _win.matchMedia(_media[i]).matches;
            if (index2 !== _media[i + 3]) {
              _media[i + 3] = index2;
              index2 ? matches.push(i) : _revertAll(1, _media[i]) || _isFunction(_media[i + 2]) && _media[i + 2]();
            }
          }
          _revertRecorded();
          for (i = 0; i < matches.length; i++) {
            index2 = matches[i];
            _creatingMedia = _media[index2];
            _media[index2 + 2] = _media[index2 + 1](e);
          }
          _creatingMedia = 0;
          _coreInitted && _refreshAll(0, 1);
          _lastMediaTick = tick;
          _dispatch("matchMedia");
        }
      }, _softRefresh = function _softRefresh2() {
        return _removeListener(ScrollTrigger2, "scrollEnd", _softRefresh2) || _refreshAll(true);
      }, _dispatch = function _dispatch2(type) {
        return _listeners[type] && _listeners[type].map(function(f) {
          return f();
        }) || _emptyArray;
      }, _savedStyles = [], _revertRecorded = function _revertRecorded2(media) {
        for (var i = 0; i < _savedStyles.length; i += 5) {
          if (!media || _savedStyles[i + 4] === media) {
            _savedStyles[i].style.cssText = _savedStyles[i + 1];
            _savedStyles[i].getBBox && _savedStyles[i].setAttribute("transform", _savedStyles[i + 2] || "");
            _savedStyles[i + 3].uncache = 1;
          }
        }
      }, _revertAll = function _revertAll2(kill, media) {
        var trigger;
        for (_i = 0; _i < _triggers.length; _i++) {
          trigger = _triggers[_i];
          if (!media || trigger.media === media) {
            if (kill) {
              trigger.kill(1);
            } else {
              trigger.revert();
            }
          }
        }
        media && _revertRecorded(media);
        media || _dispatch("revert");
      }, _refreshingAll, _refreshAll = function _refreshAll2(force, skipRevert) {
        if (_lastScrollTime && !force) {
          _addListener(ScrollTrigger2, "scrollEnd", _softRefresh);
          return;
        }
        _refreshingAll = true;
        var refreshInits = _dispatch("refreshInit");
        _sort && ScrollTrigger2.sort();
        skipRevert || _revertAll();
        _triggers.forEach(function(t) {
          return t.refresh();
        });
        refreshInits.forEach(function(result) {
          return result && result.render && result.render(-1);
        });
        _scrollers.forEach(function(obj) {
          return typeof obj === "function" && (obj.rec = 0);
        });
        _resizeDelay.pause();
        _refreshingAll = false;
        _dispatch("refresh");
      }, _lastScroll = 0, _direction = 1, _updateAll = function _updateAll2() {
        if (!_refreshingAll) {
          var l = _triggers.length, time = _getTime(), recordVelocity = time - _time1 >= 50, scroll = l && _triggers[0].scroll();
          _direction = _lastScroll > scroll ? -1 : 1;
          _lastScroll = scroll;
          if (recordVelocity) {
            if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
              _lastScrollTime = 0;
              _dispatch("scrollEnd");
            }
            _time2 = _time1;
            _time1 = time;
          }
          if (_direction < 0) {
            _i = l;
            while (_i-- > 0) {
              _triggers[_i] && _triggers[_i].update(0, recordVelocity);
            }
            _direction = 1;
          } else {
            for (_i = 0; _i < l; _i++) {
              _triggers[_i] && _triggers[_i].update(0, recordVelocity);
            }
          }
          _request = 0;
        }
      }, _propNamesToCopy = [_left, _top, _bottom, _right, _margin + _Bottom, _margin + _Right, _margin + _Top, _margin + _Left, "display", "flexShrink", "float", "zIndex", "grid-column-start", "grid-column-end", "grid-row-start", "grid-row-end", "grid-area", "justify-self", "align-self", "place-self"], _stateProps = _propNamesToCopy.concat([_width, _height, "boxSizing", "max" + _Width, "max" + _Height, "position", _margin, _padding, _padding + _Top, _padding + _Right, _padding + _Bottom, _padding + _Left]), _swapPinOut = function _swapPinOut2(pin, spacer, state) {
        _setState(state);
        if (pin.parentNode === spacer) {
          var parent = spacer.parentNode;
          if (parent) {
            parent.insertBefore(pin, spacer);
            parent.removeChild(spacer);
          }
        }
      }, _swapPinIn = function _swapPinIn2(pin, spacer, cs, spacerState) {
        if (pin.parentNode !== spacer) {
          var i = _propNamesToCopy.length, spacerStyle = spacer.style, pinStyle = pin.style, p;
          while (i--) {
            p = _propNamesToCopy[i];
            spacerStyle[p] = cs[p];
          }
          spacerStyle.position = cs.position === "absolute" ? "absolute" : "relative";
          cs.display === "inline" && (spacerStyle.display = "inline-block");
          pinStyle[_bottom] = pinStyle[_right] = "auto";
          spacerStyle.overflow = "visible";
          spacerStyle.boxSizing = "border-box";
          spacerStyle[_width] = _getSize(pin, _horizontal) + _px;
          spacerStyle[_height] = _getSize(pin, _vertical) + _px;
          spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";
          _setState(spacerState);
          pinStyle[_width] = pinStyle["max" + _Width] = cs[_width];
          pinStyle[_height] = pinStyle["max" + _Height] = cs[_height];
          pinStyle[_padding] = cs[_padding];
          pin.parentNode.insertBefore(spacer, pin);
          spacer.appendChild(pin);
        }
      }, _capsExp = /([A-Z])/g, _setState = function _setState2(state) {
        if (state) {
          var style = state.t.style, l = state.length, i = 0, p, value;
          (state.t._gsap || gsap2.core.getCache(state.t)).uncache = 1;
          for (; i < l; i += 2) {
            value = state[i + 1];
            p = state[i];
            if (value) {
              style[p] = value;
            } else if (style[p]) {
              style.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
            }
          }
        }
      }, _getState = function _getState2(element) {
        var l = _stateProps.length, style = element.style, state = [], i = 0;
        for (; i < l; i++) {
          state.push(_stateProps[i], style[_stateProps[i]]);
        }
        state.t = element;
        return state;
      }, _copyState = function _copyState2(state, override, omitOffsets) {
        var result = [], l = state.length, i = omitOffsets ? 8 : 0, p;
        for (; i < l; i += 2) {
          p = state[i];
          result.push(p, p in override ? override[p] : state[i + 1]);
        }
        result.t = state.t;
        return result;
      }, _winOffsets = {
        left: 0,
        top: 0
      }, _parsePosition = function _parsePosition2(value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self2, scrollerBounds, borderWidth, useFixedPosition, scrollerMax) {
        _isFunction(value) && (value = value(self2));
        if (_isString(value) && value.substr(0, 3) === "max") {
          value = scrollerMax + (value.charAt(4) === "=" ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
        }
        if (!_isNumber(value)) {
          _isFunction(trigger) && (trigger = trigger(self2));
          var element = _toArray(trigger)[0] || _body, bounds = _getBounds(element) || {}, offsets = value.split(" "), localOffset, globalOffset, display;
          if ((!bounds || !bounds.left && !bounds.top) && _getComputedStyle(element).display === "none") {
            display = element.style.display;
            element.style.display = "block";
            bounds = _getBounds(element);
            display ? element.style.display = display : element.style.removeProperty("display");
          }
          localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
          globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
          value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
          markerScroller && _positionMarker(markerScroller, globalOffset, direction, scrollerSize - globalOffset < 20 || markerScroller._isStart && globalOffset > 20);
          scrollerSize -= scrollerSize - globalOffset;
        } else if (markerScroller) {
          _positionMarker(markerScroller, scrollerSize, direction, true);
        }
        if (marker) {
          var position = value + scrollerSize, isStart = marker._isStart;
          scrollerMax = "scroll" + direction.d2;
          _positionMarker(marker, position, direction, isStart && position > 20 || !isStart && (useFixedPosition ? Math.max(_body[scrollerMax], _docEl[scrollerMax]) : marker.parentNode[scrollerMax]) <= position + 1);
          if (useFixedPosition) {
            scrollerBounds = _getBounds(markerScroller);
            useFixedPosition && (marker.style[direction.op.p] = scrollerBounds[direction.op.p] - direction.op.m - marker._offset + _px);
          }
        }
        return Math.round(value);
      }, _prefixExp = /(?:webkit|moz|length|cssText|inset)/i, _reparent = function _reparent2(element, parent, top, left) {
        if (element.parentNode !== parent) {
          var style = element.style, p, cs;
          if (parent === _body) {
            element._stOrig = style.cssText;
            cs = _getComputedStyle(element);
            for (p in cs) {
              if (!+p && !_prefixExp.test(p) && cs[p] && typeof style[p] === "string" && p !== "0") {
                style[p] = cs[p];
              }
            }
            style.top = top;
            style.left = left;
          } else {
            style.cssText = element._stOrig;
          }
          gsap2.core.getCache(element).uncache = 1;
          parent.appendChild(element);
        }
      }, _getTweenCreator = function _getTweenCreator2(scroller, direction) {
        var getScroll = _getScrollFunc(scroller, direction), prop = "_scroll" + direction.p2, lastScroll1, lastScroll2, getTween = function getTween2(scrollTo, vars, initialValue, change1, change2) {
          var tween = getTween2.tween, onComplete = vars.onComplete, modifiers = {};
          tween && tween.kill();
          lastScroll1 = Math.round(initialValue);
          vars[prop] = scrollTo;
          vars.modifiers = modifiers;
          modifiers[prop] = function(value) {
            value = _round(getScroll());
            if (value !== lastScroll1 && value !== lastScroll2 && Math.abs(value - lastScroll1) > 2) {
              tween.kill();
              getTween2.tween = 0;
            } else {
              value = initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio;
            }
            lastScroll2 = lastScroll1;
            return lastScroll1 = _round(value);
          };
          vars.onComplete = function() {
            getTween2.tween = 0;
            onComplete && onComplete.call(tween);
          };
          tween = getTween2.tween = gsap2.to(scroller, vars);
          return tween;
        };
        scroller[prop] = getScroll;
        scroller.addEventListener("wheel", function() {
          return getTween.tween && getTween.tween.kill() && (getTween.tween = 0);
        }, {
          passive: true
        });
        return getTween;
      };
      _horizontal.op = _vertical;
      var ScrollTrigger2 = function() {
        function ScrollTrigger3(vars, animation) {
          _coreInitted || ScrollTrigger3.register(gsap2) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
          this.init(vars, animation);
        }
        var _proto = ScrollTrigger3.prototype;
        _proto.init = function init2(vars, animation) {
          this.progress = this.start = 0;
          this.vars && this.kill(1);
          if (!_enabled) {
            this.update = this.refresh = this.kill = _passThrough;
            return;
          }
          vars = _setDefaults(_isString(vars) || _isNumber(vars) || vars.nodeType ? {
            trigger: vars
          } : vars, _defaults);
          var direction = vars.horizontal ? _horizontal : _vertical, _vars = vars, onUpdate = _vars.onUpdate, toggleClass = _vars.toggleClass, id = _vars.id, onToggle = _vars.onToggle, onRefresh = _vars.onRefresh, scrub = _vars.scrub, trigger = _vars.trigger, pin = _vars.pin, pinSpacing = _vars.pinSpacing, invalidateOnRefresh = _vars.invalidateOnRefresh, anticipatePin = _vars.anticipatePin, onScrubComplete = _vars.onScrubComplete, onSnapComplete = _vars.onSnapComplete, once = _vars.once, snap = _vars.snap, pinReparent = _vars.pinReparent, isToggle = !scrub && scrub !== 0, scroller = _toArray(vars.scroller || _win)[0], scrollerCache = gsap2.core.getCache(scroller), isViewport = _isViewport(scroller), useFixedPosition = "pinType" in vars ? vars.pinType === "fixed" : isViewport || _getProxyProp(scroller, "pinType") === "fixed", callbacks = [vars.onEnter, vars.onLeave, vars.onEnterBack, vars.onLeaveBack], toggleActions = isToggle && vars.toggleActions.split(" "), markers = "markers" in vars ? vars.markers : _defaults.markers, borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0, self2 = this, onRefreshInit = vars.onRefreshInit && function() {
            return vars.onRefreshInit(self2);
          }, getScrollerSize = _getSizeFunc(scroller, isViewport, direction), getScrollerOffsets = _getOffsetsFunc(scroller, isViewport), lastSnap = 0, tweenTo, pinCache, snapFunc, scroll1, scroll2, start, end, markerStart, markerEnd, markerStartTrigger, markerEndTrigger, markerVars, change, pinOriginalState, pinActiveState, pinState, spacer, offset, pinGetter, pinSetter, pinStart, pinChange, spacingStart, spacerState, markerStartSetter, markerEndSetter, cs, snap1, snap2, scrubTween, scrubSmooth, snapDurClamp, snapDelayedCall, prevProgress, prevScroll, prevAnimProgress;
          self2.media = _creatingMedia;
          anticipatePin *= 45;
          self2.scroller = scroller;
          self2.scroll = _getScrollFunc(scroller, direction);
          scroll1 = self2.scroll();
          self2.vars = vars;
          animation = animation || vars.animation;
          "refreshPriority" in vars && (_sort = 1);
          scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
            top: _getTweenCreator(scroller, _vertical),
            left: _getTweenCreator(scroller, _horizontal)
          };
          self2.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];
          if (animation) {
            animation.vars.lazy = false;
            animation._initted || animation.vars.immediateRender !== false && vars.immediateRender !== false && animation.render(0, true, true);
            self2.animation = animation.pause();
            animation.scrollTrigger = self2;
            scrubSmooth = _isNumber(scrub) && scrub;
            scrubSmooth && (scrubTween = gsap2.to(animation, {
              ease: "power3",
              duration: scrubSmooth,
              onComplete: function onComplete() {
                return onScrubComplete && onScrubComplete(self2);
              }
            }));
            snap1 = 0;
            id || (id = animation.vars.id);
          }
          _triggers.push(self2);
          if (snap) {
            if (!_isObject(snap) || snap.push) {
              snap = {
                snapTo: snap
              };
            }
            "scrollBehavior" in _body.style && gsap2.set(isViewport ? [_body, _docEl] : scroller, {
              scrollBehavior: "auto"
            });
            snapFunc = _isFunction(snap.snapTo) ? snap.snapTo : snap.snapTo === "labels" ? _getClosestLabel(animation) : snap.snapTo === "labelsDirectional" ? _getLabelAtDirection(animation) : gsap2.utils.snap(snap.snapTo);
            snapDurClamp = snap.duration || {
              min: 0.1,
              max: 2
            };
            snapDurClamp = _isObject(snapDurClamp) ? _clamp(snapDurClamp.min, snapDurClamp.max) : _clamp(snapDurClamp, snapDurClamp);
            snapDelayedCall = gsap2.delayedCall(snap.delay || scrubSmooth / 2 || 0.1, function() {
              if (Math.abs(self2.getVelocity()) < 10 && !_pointerIsDown && lastSnap !== self2.scroll()) {
                var totalProgress = animation && !isToggle ? animation.totalProgress() : self2.progress, velocity = (totalProgress - snap2) / (_getTime() - _time2) * 1e3 || 0, change1 = gsap2.utils.clamp(-self2.progress, 1 - self2.progress, _abs(velocity / 2) * velocity / 0.185), naturalEnd = self2.progress + (snap.inertia === false ? 0 : change1), endValue = _clamp(0, 1, snapFunc(naturalEnd, self2)), scroll = self2.scroll(), endScroll = Math.round(start + endValue * change), _snap = snap, onStart = _snap.onStart, _onInterrupt = _snap.onInterrupt, _onComplete = _snap.onComplete, tween = tweenTo.tween;
                if (scroll <= end && scroll >= start && endScroll !== scroll) {
                  if (tween && !tween._initted && tween.data <= Math.abs(endScroll - scroll)) {
                    return;
                  }
                  if (snap.inertia === false) {
                    change1 = endValue - self2.progress;
                  }
                  tweenTo(endScroll, {
                    duration: snapDurClamp(_abs(Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) * 0.185 / velocity / 0.05 || 0)),
                    ease: snap.ease || "power3",
                    data: Math.abs(endScroll - scroll),
                    onInterrupt: function onInterrupt() {
                      return snapDelayedCall.restart(true) && _onInterrupt && _onInterrupt(self2);
                    },
                    onComplete: function onComplete() {
                      lastSnap = self2.scroll();
                      snap1 = snap2 = animation && !isToggle ? animation.totalProgress() : self2.progress;
                      onSnapComplete && onSnapComplete(self2);
                      _onComplete && _onComplete(self2);
                    }
                  }, scroll, change1 * change, endScroll - scroll - change1 * change);
                  onStart && onStart(self2, tweenTo.tween);
                }
              } else if (self2.isActive) {
                snapDelayedCall.restart(true);
              }
            }).pause();
          }
          id && (_ids[id] = self2);
          trigger = self2.trigger = _toArray(trigger || pin)[0];
          pin = pin === true ? trigger : _toArray(pin)[0];
          _isString(toggleClass) && (toggleClass = {
            targets: trigger,
            className: toggleClass
          });
          if (pin) {
            pinSpacing === false || pinSpacing === _margin || (pinSpacing = !pinSpacing && _getComputedStyle(pin.parentNode).display === "flex" ? false : _padding);
            self2.pin = pin;
            vars.force3D !== false && gsap2.set(pin, {
              force3D: true
            });
            pinCache = gsap2.core.getCache(pin);
            if (!pinCache.spacer) {
              pinCache.spacer = spacer = _doc.createElement("div");
              spacer.setAttribute("class", "pin-spacer" + (id ? " pin-spacer-" + id : ""));
              pinCache.pinState = pinOriginalState = _getState(pin);
            } else {
              pinOriginalState = pinCache.pinState;
            }
            self2.spacer = spacer = pinCache.spacer;
            cs = _getComputedStyle(pin);
            spacingStart = cs[pinSpacing + direction.os2];
            pinGetter = gsap2.getProperty(pin);
            pinSetter = gsap2.quickSetter(pin, direction.a, _px);
            _swapPinIn(pin, spacer, cs);
            pinState = _getState(pin);
          }
          if (markers) {
            markerVars = _isObject(markers) ? _setDefaults(markers, _markerDefaults) : _markerDefaults;
            markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
            markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
            offset = markerStartTrigger["offset" + direction.op.d2];
            markerStart = _createMarker("start", id, scroller, direction, markerVars, offset);
            markerEnd = _createMarker("end", id, scroller, direction, markerVars, offset);
            if (!useFixedPosition && !(_proxies.length && _getProxyProp(scroller, "fixedMarkers") === true)) {
              _makePositionable(isViewport ? _body : scroller);
              gsap2.set([markerStartTrigger, markerEndTrigger], {
                force3D: true
              });
              markerStartSetter = gsap2.quickSetter(markerStartTrigger, direction.a, _px);
              markerEndSetter = gsap2.quickSetter(markerEndTrigger, direction.a, _px);
            }
          }
          self2.revert = function(revert) {
            var r = revert !== false || !self2.enabled, prevRefreshing = _refreshing;
            if (r !== self2.isReverted) {
              if (r) {
                self2.scroll.rec || (self2.scroll.rec = self2.scroll());
                prevScroll = Math.max(self2.scroll(), self2.scroll.rec || 0);
                prevProgress = self2.progress;
                prevAnimProgress = animation && animation.progress();
              }
              markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function(m) {
                return m.style.display = r ? "none" : "block";
              });
              r && (_refreshing = 1);
              self2.update(r);
              _refreshing = prevRefreshing;
              pin && (r ? _swapPinOut(pin, spacer, pinOriginalState) : (!pinReparent || !self2.isActive) && _swapPinIn(pin, spacer, _getComputedStyle(pin), spacerState));
              self2.isReverted = r;
            }
          };
          self2.refresh = function(soft, force) {
            if ((_refreshing || !self2.enabled) && !force) {
              return;
            }
            if (pin && soft && _lastScrollTime) {
              _addListener(ScrollTrigger3, "scrollEnd", _softRefresh);
              return;
            }
            _refreshing = 1;
            scrubTween && scrubTween.pause();
            invalidateOnRefresh && animation && animation.progress(0).invalidate();
            self2.isReverted || self2.revert();
            var size = getScrollerSize(), scrollerBounds = getScrollerOffsets(), max = _maxScroll(scroller, direction), offset2 = 0, otherPinOffset = 0, parsedEnd = vars.end, parsedEndTrigger = vars.endTrigger || trigger, parsedStart = vars.start || (vars.start === 0 || !trigger ? 0 : pin ? "0 0" : "0 100%"), pinnedContainer = vars.pinnedContainer && _toArray(vars.pinnedContainer)[0], triggerIndex = trigger && Math.max(0, _triggers.indexOf(self2)) || 0, i = triggerIndex, cs2, bounds, scroll, isVertical, override, curTrigger, curPin, oppositeScroll, initted, revertedPins;
            while (i--) {
              curTrigger = _triggers[i];
              curTrigger.end || curTrigger.refresh(0, 1) || (_refreshing = 1);
              curPin = curTrigger.pin;
              if (curPin && (curPin === trigger || curPin === pin) && !curTrigger.isReverted) {
                revertedPins || (revertedPins = []);
                revertedPins.unshift(curTrigger);
                curTrigger.revert();
              }
            }
            start = _parsePosition(parsedStart, trigger, size, direction, self2.scroll(), markerStart, markerStartTrigger, self2, scrollerBounds, borderWidth, useFixedPosition, max) || (pin ? -1e-3 : 0);
            _isFunction(parsedEnd) && (parsedEnd = parsedEnd(self2));
            if (_isString(parsedEnd) && !parsedEnd.indexOf("+=")) {
              if (~parsedEnd.indexOf(" ")) {
                parsedEnd = (_isString(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd;
              } else {
                offset2 = _offsetToPx(parsedEnd.substr(2), size);
                parsedEnd = _isString(parsedStart) ? parsedStart : start + offset2;
                parsedEndTrigger = trigger;
              }
            }
            end = Math.max(start, _parsePosition(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, self2.scroll() + offset2, markerEnd, markerEndTrigger, self2, scrollerBounds, borderWidth, useFixedPosition, max)) || -1e-3;
            change = end - start || (start -= 0.01) && 1e-3;
            offset2 = 0;
            i = triggerIndex;
            while (i--) {
              curTrigger = _triggers[i];
              curPin = curTrigger.pin;
              if (curPin && curTrigger.start - curTrigger._pinPush < start) {
                cs2 = curTrigger.end - curTrigger.start;
                (curPin === trigger || curPin === pinnedContainer) && (offset2 += cs2);
                curPin === pin && (otherPinOffset += cs2);
              }
            }
            start += offset2;
            end += offset2;
            self2._pinPush = otherPinOffset;
            if (markerStart && offset2) {
              cs2 = {};
              cs2[direction.a] = "+=" + offset2;
              pinnedContainer && (cs2[direction.p] = "-=" + self2.scroll());
              gsap2.set([markerStart, markerEnd], cs2);
            }
            if (pin) {
              cs2 = _getComputedStyle(pin);
              isVertical = direction === _vertical;
              scroll = self2.scroll();
              pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
              !max && end > 1 && ((isViewport ? _body : scroller).style["overflow-" + direction.a] = "scroll");
              _swapPinIn(pin, spacer, cs2);
              pinState = _getState(pin);
              bounds = _getBounds(pin, true);
              oppositeScroll = useFixedPosition && _getScrollFunc(scroller, isVertical ? _horizontal : _vertical)();
              if (pinSpacing) {
                spacerState = [pinSpacing + direction.os2, change + otherPinOffset + _px];
                spacerState.t = spacer;
                i = pinSpacing === _padding ? _getSize(pin, direction) + change + otherPinOffset : 0;
                i && spacerState.push(direction.d, i + _px);
                _setState(spacerState);
                useFixedPosition && self2.scroll(prevScroll);
              }
              if (useFixedPosition) {
                override = {
                  top: bounds.top + (isVertical ? scroll - start : oppositeScroll) + _px,
                  left: bounds.left + (isVertical ? oppositeScroll : scroll - start) + _px,
                  boxSizing: "border-box",
                  position: "fixed"
                };
                override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
                override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
                override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
                override[_padding] = cs2[_padding];
                override[_padding + _Top] = cs2[_padding + _Top];
                override[_padding + _Right] = cs2[_padding + _Right];
                override[_padding + _Bottom] = cs2[_padding + _Bottom];
                override[_padding + _Left] = cs2[_padding + _Left];
                pinActiveState = _copyState(pinOriginalState, override, pinReparent);
              }
              if (animation) {
                initted = animation._initted;
                _suppressOverwrites(1);
                animation.render(animation.duration(), true, true);
                pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
                change !== pinChange && pinActiveState.splice(pinActiveState.length - 2, 2);
                animation.render(0, true, true);
                initted || animation.invalidate();
                _suppressOverwrites(0);
              } else {
                pinChange = change;
              }
            } else if (trigger && self2.scroll()) {
              bounds = trigger.parentNode;
              while (bounds && bounds !== _body) {
                if (bounds._pinOffset) {
                  start -= bounds._pinOffset;
                  end -= bounds._pinOffset;
                }
                bounds = bounds.parentNode;
              }
            }
            revertedPins && revertedPins.forEach(function(t) {
              return t.revert(false);
            });
            self2.start = start;
            self2.end = end;
            scroll1 = scroll2 = self2.scroll();
            scroll1 < prevScroll && self2.scroll(prevScroll);
            self2.revert(false);
            _refreshing = 0;
            animation && isToggle && animation._initted && animation.progress() !== prevAnimProgress && animation.progress(prevAnimProgress, true).render(animation.time(), true, true);
            if (prevProgress !== self2.progress) {
              scrubTween && animation.totalProgress(prevProgress, true);
              self2.progress = prevProgress;
              self2.update();
            }
            pin && pinSpacing && (spacer._pinOffset = Math.round(self2.progress * pinChange));
            onRefresh && onRefresh(self2);
          };
          self2.getVelocity = function() {
            return (self2.scroll() - scroll2) / (_getTime() - _time2) * 1e3 || 0;
          };
          self2.update = function(reset, recordVelocity) {
            var scroll = self2.scroll(), p = reset ? 0 : (scroll - start) / change, clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0, prevProgress2 = self2.progress, isActive, wasActive, toggleState, action, stateChanged, toggled;
            if (recordVelocity) {
              scroll2 = scroll1;
              scroll1 = scroll;
              if (snap) {
                snap2 = snap1;
                snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
              }
            }
            anticipatePin && !clipped && pin && !_refreshing && !_startup && _lastScrollTime && start < scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin && (clipped = 1e-4);
            if (clipped !== prevProgress2 && self2.enabled) {
              isActive = self2.isActive = !!clipped && clipped < 1;
              wasActive = !!prevProgress2 && prevProgress2 < 1;
              toggled = isActive !== wasActive;
              stateChanged = toggled || !!clipped !== !!prevProgress2;
              self2.direction = clipped > prevProgress2 ? 1 : -1;
              self2.progress = clipped;
              if (!isToggle) {
                if (scrubTween && !_refreshing && !_startup) {
                  scrubTween.vars.totalProgress = clipped;
                  scrubTween.invalidate().restart();
                } else if (animation) {
                  animation.totalProgress(clipped, !!_refreshing);
                }
              }
              if (pin) {
                reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);
                if (!useFixedPosition) {
                  pinSetter(pinStart + pinChange * clipped);
                } else if (stateChanged) {
                  action = !reset && clipped > prevProgress2 && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction);
                  if (pinReparent) {
                    if (!reset && (isActive || action)) {
                      var bounds = _getBounds(pin, true), _offset = scroll - start;
                      _reparent(pin, _body, bounds.top + (direction === _vertical ? _offset : 0) + _px, bounds.left + (direction === _vertical ? 0 : _offset) + _px);
                    } else {
                      _reparent(pin, spacer);
                    }
                  }
                  _setState(isActive || action ? pinActiveState : pinState);
                  pinChange !== change && clipped < 1 && isActive || pinSetter(pinStart + (clipped === 1 && !action ? pinChange : 0));
                }
              }
              snap && !tweenTo.tween && !_refreshing && !_startup && snapDelayedCall.restart(true);
              toggleClass && (toggled || once && clipped && (clipped < 1 || !_limitCallbacks)) && _toArray(toggleClass.targets).forEach(function(el) {
                return el.classList[isActive || once ? "add" : "remove"](toggleClass.className);
              });
              onUpdate && !isToggle && !reset && onUpdate(self2);
              if (stateChanged && !_refreshing) {
                toggleState = clipped && !prevProgress2 ? 0 : clipped === 1 ? 1 : prevProgress2 === 1 ? 2 : 3;
                if (isToggle) {
                  action = !toggled && toggleActions[toggleState + 1] !== "none" && toggleActions[toggleState + 1] || toggleActions[toggleState];
                  if (animation && (action === "complete" || action === "reset" || action in animation)) {
                    if (action === "complete") {
                      animation.pause().totalProgress(1);
                    } else if (action === "reset") {
                      animation.restart(true).pause();
                    } else if (action === "restart") {
                      animation.restart(true);
                    } else {
                      animation[action]();
                    }
                  }
                  onUpdate && onUpdate(self2);
                }
                if (toggled || !_limitCallbacks) {
                  onToggle && toggled && onToggle(self2);
                  callbacks[toggleState] && callbacks[toggleState](self2);
                  once && (clipped === 1 ? self2.kill(false, 1) : callbacks[toggleState] = 0);
                  if (!toggled) {
                    toggleState = clipped === 1 ? 1 : 3;
                    callbacks[toggleState] && callbacks[toggleState](self2);
                  }
                }
              } else if (isToggle && onUpdate && !_refreshing) {
                onUpdate(self2);
              }
            }
            if (markerEndSetter) {
              markerStartSetter(scroll + (markerStartTrigger._isFlipped ? 1 : 0));
              markerEndSetter(scroll);
            }
          };
          self2.enable = function(reset, refresh) {
            if (!self2.enabled) {
              self2.enabled = true;
              _addListener(scroller, "resize", _onResize);
              _addListener(scroller, "scroll", _onScroll);
              onRefreshInit && _addListener(ScrollTrigger3, "refreshInit", onRefreshInit);
              if (reset !== false) {
                self2.progress = prevProgress = 0;
                scroll1 = scroll2 = lastSnap = self2.scroll();
              }
              refresh !== false && self2.refresh();
            }
          };
          self2.getTween = function(snap3) {
            return snap3 && tweenTo ? tweenTo.tween : scrubTween;
          };
          self2.disable = function(reset, allowAnimation) {
            if (self2.enabled) {
              reset !== false && self2.revert();
              self2.enabled = self2.isActive = false;
              allowAnimation || scrubTween && scrubTween.pause();
              prevScroll = 0;
              pinCache && (pinCache.uncache = 1);
              onRefreshInit && _removeListener(ScrollTrigger3, "refreshInit", onRefreshInit);
              if (snapDelayedCall) {
                snapDelayedCall.pause();
                tweenTo.tween && tweenTo.tween.kill() && (tweenTo.tween = 0);
              }
              if (!isViewport) {
                var i = _triggers.length;
                while (i--) {
                  if (_triggers[i].scroller === scroller && _triggers[i] !== self2) {
                    return;
                  }
                }
                _removeListener(scroller, "resize", _onResize);
                _removeListener(scroller, "scroll", _onScroll);
              }
            }
          };
          self2.kill = function(revert, allowAnimation) {
            self2.disable(revert, allowAnimation);
            id && delete _ids[id];
            var i = _triggers.indexOf(self2);
            _triggers.splice(i, 1);
            i === _i && _direction > 0 && _i--;
            i = 0;
            _triggers.forEach(function(t) {
              return t.scroller === self2.scroller && (i = 1);
            });
            i || (self2.scroll.rec = 0);
            if (animation) {
              animation.scrollTrigger = null;
              revert && animation.render(-1);
              allowAnimation || animation.kill();
            }
            markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function(m) {
              return m.parentNode && m.parentNode.removeChild(m);
            });
            if (pin) {
              pinCache && (pinCache.uncache = 1);
              i = 0;
              _triggers.forEach(function(t) {
                return t.pin === pin && i++;
              });
              i || (pinCache.spacer = 0);
            }
          };
          self2.enable(false, false);
          !animation || !animation.add || change ? self2.refresh() : gsap2.delayedCall(0.01, function() {
            return start || end || self2.refresh();
          }) && (change = 0.01) && (start = end = 0);
        };
        ScrollTrigger3.register = function register(core) {
          if (!_coreInitted) {
            gsap2 = core || _getGSAP();
            if (_windowExists() && window.document) {
              _win = window;
              _doc = document;
              _docEl = _doc.documentElement;
              _body = _doc.body;
            }
            if (gsap2) {
              _toArray = gsap2.utils.toArray;
              _clamp = gsap2.utils.clamp;
              _suppressOverwrites = gsap2.core.suppressOverwrites || _passThrough;
              gsap2.core.globals("ScrollTrigger", ScrollTrigger3);
              if (_body) {
                _raf = _win.requestAnimationFrame || function(f) {
                  return setTimeout(f, 16);
                };
                _addListener(_win, "wheel", _onScroll);
                _root = [_win, _doc, _docEl, _body];
                _addListener(_doc, "scroll", _onScroll);
                var bodyStyle = _body.style, border = bodyStyle.borderTop, bounds;
                bodyStyle.borderTop = "1px solid #000";
                bounds = _getBounds(_body);
                _vertical.m = Math.round(bounds.top + _vertical.sc()) || 0;
                _horizontal.m = Math.round(bounds.left + _horizontal.sc()) || 0;
                border ? bodyStyle.borderTop = border : bodyStyle.removeProperty("border-top");
                _syncInterval = setInterval(_sync, 200);
                gsap2.delayedCall(0.5, function() {
                  return _startup = 0;
                });
                _addListener(_doc, "touchcancel", _passThrough);
                _addListener(_body, "touchstart", _passThrough);
                _multiListener(_addListener, _doc, "pointerdown,touchstart,mousedown", function() {
                  return _pointerIsDown = 1;
                });
                _multiListener(_addListener, _doc, "pointerup,touchend,mouseup", function() {
                  return _pointerIsDown = 0;
                });
                _transformProp = gsap2.utils.checkPrefix("transform");
                _stateProps.push(_transformProp);
                _coreInitted = _getTime();
                _resizeDelay = gsap2.delayedCall(0.2, _refreshAll).pause();
                _autoRefresh = [_doc, "visibilitychange", function() {
                  var w = _win.innerWidth, h = _win.innerHeight;
                  if (_doc.hidden) {
                    _prevWidth = w;
                    _prevHeight = h;
                  } else if (_prevWidth !== w || _prevHeight !== h) {
                    _onResize();
                  }
                }, _doc, "DOMContentLoaded", _refreshAll, _win, "load", function() {
                  return _lastScrollTime || _refreshAll();
                }, _win, "resize", _onResize];
                _iterateAutoRefresh(_addListener);
              }
            }
          }
          return _coreInitted;
        };
        ScrollTrigger3.defaults = function defaults(config) {
          for (var p in config) {
            _defaults[p] = config[p];
          }
        };
        ScrollTrigger3.kill = function kill() {
          _enabled = 0;
          _triggers.slice(0).forEach(function(trigger) {
            return trigger.kill(1);
          });
        };
        ScrollTrigger3.config = function config(vars) {
          "limitCallbacks" in vars && (_limitCallbacks = !!vars.limitCallbacks);
          var ms = vars.syncInterval;
          ms && clearInterval(_syncInterval) || (_syncInterval = ms) && setInterval(_sync, ms);
          if ("autoRefreshEvents" in vars) {
            _iterateAutoRefresh(_removeListener) || _iterateAutoRefresh(_addListener, vars.autoRefreshEvents || "none");
            _ignoreResize = (vars.autoRefreshEvents + "").indexOf("resize") === -1;
          }
        };
        ScrollTrigger3.scrollerProxy = function scrollerProxy(target, vars) {
          var t = _toArray(target)[0], i = _scrollers.indexOf(t), isViewport = _isViewport(t);
          if (~i) {
            _scrollers.splice(i, isViewport ? 6 : 2);
          }
          isViewport ? _proxies.unshift(_win, vars, _body, vars, _docEl, vars) : _proxies.unshift(t, vars);
        };
        ScrollTrigger3.matchMedia = function matchMedia(vars) {
          var mq, p, i, func, result;
          for (p in vars) {
            i = _media.indexOf(p);
            func = vars[p];
            _creatingMedia = p;
            if (p === "all") {
              func();
            } else {
              mq = _win.matchMedia(p);
              if (mq) {
                mq.matches && (result = func());
                if (~i) {
                  _media[i + 1] = _combineFunc(_media[i + 1], func);
                  _media[i + 2] = _combineFunc(_media[i + 2], result);
                } else {
                  i = _media.length;
                  _media.push(p, func, result);
                  mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
                }
                _media[i + 3] = mq.matches;
              }
            }
            _creatingMedia = 0;
          }
          return _media;
        };
        ScrollTrigger3.clearMatchMedia = function clearMatchMedia(query) {
          query || (_media.length = 0);
          query = _media.indexOf(query);
          query >= 0 && _media.splice(query, 4);
        };
        return ScrollTrigger3;
      }();
      ScrollTrigger2.version = "3.7.1";
      ScrollTrigger2.saveStyles = function(targets) {
        return targets ? _toArray(targets).forEach(function(target) {
          if (target && target.style) {
            var i = _savedStyles.indexOf(target);
            i >= 0 && _savedStyles.splice(i, 5);
            _savedStyles.push(target, target.style.cssText, target.getBBox && target.getAttribute("transform"), gsap2.core.getCache(target), _creatingMedia);
          }
        }) : _savedStyles;
      };
      ScrollTrigger2.revert = function(soft, media) {
        return _revertAll(!soft, media);
      };
      ScrollTrigger2.create = function(vars, animation) {
        return new ScrollTrigger2(vars, animation);
      };
      ScrollTrigger2.refresh = function(safe) {
        return safe ? _onResize() : _refreshAll(true);
      };
      ScrollTrigger2.update = _updateAll;
      ScrollTrigger2.maxScroll = function(element, horizontal) {
        return _maxScroll(element, horizontal ? _horizontal : _vertical);
      };
      ScrollTrigger2.getScrollFunc = function(element, horizontal) {
        return _getScrollFunc(_toArray(element)[0], horizontal ? _horizontal : _vertical);
      };
      ScrollTrigger2.getById = function(id) {
        return _ids[id];
      };
      ScrollTrigger2.getAll = function() {
        return _triggers.slice(0);
      };
      ScrollTrigger2.isScrolling = function() {
        return !!_lastScrollTime;
      };
      ScrollTrigger2.addEventListener = function(type, callback) {
        var a = _listeners[type] || (_listeners[type] = []);
        ~a.indexOf(callback) || a.push(callback);
      };
      ScrollTrigger2.removeEventListener = function(type, callback) {
        var a = _listeners[type], i = a && a.indexOf(callback);
        i >= 0 && a.splice(i, 1);
      };
      ScrollTrigger2.batch = function(targets, vars) {
        var result = [], varsCopy = {}, interval = vars.interval || 0.016, batchMax = vars.batchMax || 1e9, proxyCallback = function proxyCallback2(type, callback) {
          var elements = [], triggers = [], delay = gsap2.delayedCall(interval, function() {
            callback(elements, triggers);
            elements = [];
            triggers = [];
          }).pause();
          return function(self2) {
            elements.length || delay.restart(true);
            elements.push(self2.trigger);
            triggers.push(self2);
            batchMax <= elements.length && delay.progress(1);
          };
        }, p;
        for (p in vars) {
          varsCopy[p] = p.substr(0, 2) === "on" && _isFunction(vars[p]) && p !== "onRefreshInit" ? proxyCallback(p, vars[p]) : vars[p];
        }
        if (_isFunction(batchMax)) {
          batchMax = batchMax();
          _addListener(ScrollTrigger2, "refresh", function() {
            return batchMax = vars.batchMax();
          });
        }
        _toArray(targets).forEach(function(target) {
          var config = {};
          for (p in varsCopy) {
            config[p] = varsCopy[p];
          }
          config.trigger = target;
          result.push(ScrollTrigger2.create(config));
        });
        return result;
      };
      ScrollTrigger2.sort = function(func) {
        return _triggers.sort(func || function(a, b) {
          return (a.vars.refreshPriority || 0) * -1e6 + a.start - (b.start + (b.vars.refreshPriority || 0) * -1e6);
        });
      };
      _getGSAP() && gsap2.registerPlugin(ScrollTrigger2);
      exports2.ScrollTrigger = ScrollTrigger2;
      exports2.default = ScrollTrigger2;
      Object.defineProperty(exports2, "__esModule", { value: true });
    });
  }
});

// node_modules/circletype/dist/circletype.min.js
var require_circletype_min = __commonJS({
  "node_modules/circletype/dist/circletype.min.js"(exports, module2) {
    init_shims();
    !function(t, e) {
      typeof exports == "object" && typeof module2 == "object" ? module2.exports = e() : typeof define == "function" && define.amd ? define([], e) : typeof exports == "object" ? exports.CircleType = e() : t.CircleType = e();
    }(typeof self != "undefined" ? self : exports, function() {
      return function(t) {
        function e(r) {
          if (n[r])
            return n[r].exports;
          var i = n[r] = { i: r, l: false, exports: {} };
          return t[r].call(i.exports, i, i.exports, e), i.l = true, i.exports;
        }
        var n = {};
        return e.m = t, e.c = n, e.d = function(t2, n2, r) {
          e.o(t2, n2) || Object.defineProperty(t2, n2, { configurable: false, enumerable: true, get: r });
        }, e.n = function(t2) {
          var n2 = t2 && t2.__esModule ? function() {
            return t2.default;
          } : function() {
            return t2;
          };
          return e.d(n2, "a", n2), n2;
        }, e.o = function(t2, e2) {
          return Object.prototype.hasOwnProperty.call(t2, e2);
        }, e.p = "", e(e.s = 29);
      }([function(t, e, n) {
        var r = n(24)("wks"), i = n(12), o = n(1).Symbol, u = typeof o == "function";
        (t.exports = function(t2) {
          return r[t2] || (r[t2] = u && o[t2] || (u ? o : i)("Symbol." + t2));
        }).store = r;
      }, function(t, e) {
        var n = t.exports = typeof window != "undefined" && window.Math == Math ? window : typeof self != "undefined" && self.Math == Math ? self : Function("return this")();
        typeof __g == "number" && (__g = n);
      }, function(t, e) {
        var n = t.exports = { version: "2.5.6" };
        typeof __e == "number" && (__e = n);
      }, function(t, e, n) {
        var r = n(4), i = n(11);
        t.exports = n(6) ? function(t2, e2, n2) {
          return r.f(t2, e2, i(1, n2));
        } : function(t2, e2, n2) {
          return t2[e2] = n2, t2;
        };
      }, function(t, e, n) {
        var r = n(5), i = n(34), o = n(35), u = Object.defineProperty;
        e.f = n(6) ? Object.defineProperty : function(t2, e2, n2) {
          if (r(t2), e2 = o(e2, true), r(n2), i)
            try {
              return u(t2, e2, n2);
            } catch (t3) {
            }
          if ("get" in n2 || "set" in n2)
            throw TypeError("Accessors not supported!");
          return "value" in n2 && (t2[e2] = n2.value), t2;
        };
      }, function(t, e, n) {
        var r = n(10);
        t.exports = function(t2) {
          if (!r(t2))
            throw TypeError(t2 + " is not an object!");
          return t2;
        };
      }, function(t, e, n) {
        t.exports = !n(17)(function() {
          return Object.defineProperty({}, "a", { get: function() {
            return 7;
          } }).a != 7;
        });
      }, function(t, e) {
        var n = {}.hasOwnProperty;
        t.exports = function(t2, e2) {
          return n.call(t2, e2);
        };
      }, function(t, e) {
        var n = Math.ceil, r = Math.floor;
        t.exports = function(t2) {
          return isNaN(t2 = +t2) ? 0 : (t2 > 0 ? r : n)(t2);
        };
      }, function(t, e) {
        t.exports = function(t2) {
          if (t2 == void 0)
            throw TypeError("Can't call method on  " + t2);
          return t2;
        };
      }, function(t, e) {
        t.exports = function(t2) {
          return typeof t2 == "object" ? t2 !== null : typeof t2 == "function";
        };
      }, function(t, e) {
        t.exports = function(t2, e2) {
          return { enumerable: !(1 & t2), configurable: !(2 & t2), writable: !(4 & t2), value: e2 };
        };
      }, function(t, e) {
        var n = 0, r = Math.random();
        t.exports = function(t2) {
          return "Symbol(".concat(t2 === void 0 ? "" : t2, ")_", (++n + r).toString(36));
        };
      }, function(t, e) {
        t.exports = {};
      }, function(t, e, n) {
        var r = n(24)("keys"), i = n(12);
        t.exports = function(t2) {
          return r[t2] || (r[t2] = i(t2));
        };
      }, function(t, e) {
        t.exports = false;
      }, function(t, e, n) {
        var r = n(1), i = n(2), o = n(3), u = n(19), c = n(20), f = function(t2, e2, n2) {
          var a, s7, l, p, h = t2 & f.F, d = t2 & f.G, v = t2 & f.S, y = t2 & f.P, _ = t2 & f.B, m = d ? r : v ? r[e2] || (r[e2] = {}) : (r[e2] || {}).prototype, g = d ? i : i[e2] || (i[e2] = {}), x = g.prototype || (g.prototype = {});
          d && (n2 = e2);
          for (a in n2)
            s7 = !h && m && m[a] !== void 0, l = (s7 ? m : n2)[a], p = _ && s7 ? c(l, r) : y && typeof l == "function" ? c(Function.call, l) : l, m && u(m, a, l, t2 & f.U), g[a] != l && o(g, a, p), y && x[a] != l && (x[a] = l);
        };
        r.core = i, f.F = 1, f.G = 2, f.S = 4, f.P = 8, f.B = 16, f.W = 32, f.U = 64, f.R = 128, t.exports = f;
      }, function(t, e) {
        t.exports = function(t2) {
          try {
            return !!t2();
          } catch (t3) {
            return true;
          }
        };
      }, function(t, e, n) {
        var r = n(10), i = n(1).document, o = r(i) && r(i.createElement);
        t.exports = function(t2) {
          return o ? i.createElement(t2) : {};
        };
      }, function(t, e, n) {
        var r = n(1), i = n(3), o = n(7), u = n(12)("src"), c = Function.toString, f = ("" + c).split("toString");
        n(2).inspectSource = function(t2) {
          return c.call(t2);
        }, (t.exports = function(t2, e2, n2, c2) {
          var a = typeof n2 == "function";
          a && (o(n2, "name") || i(n2, "name", e2)), t2[e2] !== n2 && (a && (o(n2, u) || i(n2, u, t2[e2] ? "" + t2[e2] : f.join(String(e2)))), t2 === r ? t2[e2] = n2 : c2 ? t2[e2] ? t2[e2] = n2 : i(t2, e2, n2) : (delete t2[e2], i(t2, e2, n2)));
        })(Function.prototype, "toString", function() {
          return typeof this == "function" && this[u] || c.call(this);
        });
      }, function(t, e, n) {
        var r = n(36);
        t.exports = function(t2, e2, n2) {
          if (r(t2), e2 === void 0)
            return t2;
          switch (n2) {
            case 1:
              return function(n3) {
                return t2.call(e2, n3);
              };
            case 2:
              return function(n3, r2) {
                return t2.call(e2, n3, r2);
              };
            case 3:
              return function(n3, r2, i) {
                return t2.call(e2, n3, r2, i);
              };
          }
          return function() {
            return t2.apply(e2, arguments);
          };
        };
      }, function(t, e, n) {
        var r = n(42), i = n(9);
        t.exports = function(t2) {
          return r(i(t2));
        };
      }, function(t, e) {
        var n = {}.toString;
        t.exports = function(t2) {
          return n.call(t2).slice(8, -1);
        };
      }, function(t, e, n) {
        var r = n(8), i = Math.min;
        t.exports = function(t2) {
          return t2 > 0 ? i(r(t2), 9007199254740991) : 0;
        };
      }, function(t, e, n) {
        var r = n(2), i = n(1), o = i["__core-js_shared__"] || (i["__core-js_shared__"] = {});
        (t.exports = function(t2, e2) {
          return o[t2] || (o[t2] = e2 !== void 0 ? e2 : {});
        })("versions", []).push({ version: r.version, mode: n(15) ? "pure" : "global", copyright: "\xA9 2018 Denis Pushkarev (zloirock.ru)" });
      }, function(t, e) {
        t.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
      }, function(t, e, n) {
        var r = n(4).f, i = n(7), o = n(0)("toStringTag");
        t.exports = function(t2, e2, n2) {
          t2 && !i(t2 = n2 ? t2 : t2.prototype, o) && r(t2, o, { configurable: true, value: e2 });
        };
      }, function(t, e, n) {
        var r = n(9);
        t.exports = function(t2) {
          return Object(r(t2));
        };
      }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", { value: true });
        var r = Math.PI / 180;
        e.default = function(t2) {
          return t2 * r;
        };
      }, function(t, e, n) {
        "use strict";
        n(30);
        var r = n(54), i = function(t2) {
          return t2 && t2.__esModule ? t2 : { default: t2 };
        }(r);
        t.exports = i.default;
      }, function(t, e, n) {
        n(31), n(47), t.exports = n(2).Array.from;
      }, function(t, e, n) {
        "use strict";
        var r = n(32)(true);
        n(33)(String, "String", function(t2) {
          this._t = String(t2), this._i = 0;
        }, function() {
          var t2, e2 = this._t, n2 = this._i;
          return n2 >= e2.length ? { value: void 0, done: true } : (t2 = r(e2, n2), this._i += t2.length, { value: t2, done: false });
        });
      }, function(t, e, n) {
        var r = n(8), i = n(9);
        t.exports = function(t2) {
          return function(e2, n2) {
            var o, u, c = String(i(e2)), f = r(n2), a = c.length;
            return f < 0 || f >= a ? t2 ? "" : void 0 : (o = c.charCodeAt(f), o < 55296 || o > 56319 || f + 1 === a || (u = c.charCodeAt(f + 1)) < 56320 || u > 57343 ? t2 ? c.charAt(f) : o : t2 ? c.slice(f, f + 2) : u - 56320 + (o - 55296 << 10) + 65536);
          };
        };
      }, function(t, e, n) {
        "use strict";
        var r = n(15), i = n(16), o = n(19), u = n(3), c = n(13), f = n(37), a = n(26), s7 = n(46), l = n(0)("iterator"), p = !([].keys && "next" in [].keys()), h = function() {
          return this;
        };
        t.exports = function(t2, e2, n2, d, v, y, _) {
          f(n2, e2, d);
          var m, g, x, b = function(t3) {
            if (!p && t3 in M)
              return M[t3];
            switch (t3) {
              case "keys":
              case "values":
                return function() {
                  return new n2(this, t3);
                };
            }
            return function() {
              return new n2(this, t3);
            };
          }, O = e2 + " Iterator", w = v == "values", j = false, M = t2.prototype, S = M[l] || M["@@iterator"] || v && M[v], P = S || b(v), A = v ? w ? b("entries") : P : void 0, T = e2 == "Array" ? M.entries || S : S;
          if (T && (x = s7(T.call(new t2()))) !== Object.prototype && x.next && (a(x, O, true), r || typeof x[l] == "function" || u(x, l, h)), w && S && S.name !== "values" && (j = true, P = function() {
            return S.call(this);
          }), r && !_ || !p && !j && M[l] || u(M, l, P), c[e2] = P, c[O] = h, v)
            if (m = { values: w ? P : b("values"), keys: y ? P : b("keys"), entries: A }, _)
              for (g in m)
                g in M || o(M, g, m[g]);
            else
              i(i.P + i.F * (p || j), e2, m);
          return m;
        };
      }, function(t, e, n) {
        t.exports = !n(6) && !n(17)(function() {
          return Object.defineProperty(n(18)("div"), "a", { get: function() {
            return 7;
          } }).a != 7;
        });
      }, function(t, e, n) {
        var r = n(10);
        t.exports = function(t2, e2) {
          if (!r(t2))
            return t2;
          var n2, i;
          if (e2 && typeof (n2 = t2.toString) == "function" && !r(i = n2.call(t2)))
            return i;
          if (typeof (n2 = t2.valueOf) == "function" && !r(i = n2.call(t2)))
            return i;
          if (!e2 && typeof (n2 = t2.toString) == "function" && !r(i = n2.call(t2)))
            return i;
          throw TypeError("Can't convert object to primitive value");
        };
      }, function(t, e) {
        t.exports = function(t2) {
          if (typeof t2 != "function")
            throw TypeError(t2 + " is not a function!");
          return t2;
        };
      }, function(t, e, n) {
        "use strict";
        var r = n(38), i = n(11), o = n(26), u = {};
        n(3)(u, n(0)("iterator"), function() {
          return this;
        }), t.exports = function(t2, e2, n2) {
          t2.prototype = r(u, { next: i(1, n2) }), o(t2, e2 + " Iterator");
        };
      }, function(t, e, n) {
        var r = n(5), i = n(39), o = n(25), u = n(14)("IE_PROTO"), c = function() {
        }, f = function() {
          var t2, e2 = n(18)("iframe"), r2 = o.length;
          for (e2.style.display = "none", n(45).appendChild(e2), e2.src = "javascript:", t2 = e2.contentWindow.document, t2.open(), t2.write("<script>document.F=Object<\/script>"), t2.close(), f = t2.F; r2--; )
            delete f.prototype[o[r2]];
          return f();
        };
        t.exports = Object.create || function(t2, e2) {
          var n2;
          return t2 !== null ? (c.prototype = r(t2), n2 = new c(), c.prototype = null, n2[u] = t2) : n2 = f(), e2 === void 0 ? n2 : i(n2, e2);
        };
      }, function(t, e, n) {
        var r = n(4), i = n(5), o = n(40);
        t.exports = n(6) ? Object.defineProperties : function(t2, e2) {
          i(t2);
          for (var n2, u = o(e2), c = u.length, f = 0; c > f; )
            r.f(t2, n2 = u[f++], e2[n2]);
          return t2;
        };
      }, function(t, e, n) {
        var r = n(41), i = n(25);
        t.exports = Object.keys || function(t2) {
          return r(t2, i);
        };
      }, function(t, e, n) {
        var r = n(7), i = n(21), o = n(43)(false), u = n(14)("IE_PROTO");
        t.exports = function(t2, e2) {
          var n2, c = i(t2), f = 0, a = [];
          for (n2 in c)
            n2 != u && r(c, n2) && a.push(n2);
          for (; e2.length > f; )
            r(c, n2 = e2[f++]) && (~o(a, n2) || a.push(n2));
          return a;
        };
      }, function(t, e, n) {
        var r = n(22);
        t.exports = Object("z").propertyIsEnumerable(0) ? Object : function(t2) {
          return r(t2) == "String" ? t2.split("") : Object(t2);
        };
      }, function(t, e, n) {
        var r = n(21), i = n(23), o = n(44);
        t.exports = function(t2) {
          return function(e2, n2, u) {
            var c, f = r(e2), a = i(f.length), s7 = o(u, a);
            if (t2 && n2 != n2) {
              for (; a > s7; )
                if ((c = f[s7++]) != c)
                  return true;
            } else
              for (; a > s7; s7++)
                if ((t2 || s7 in f) && f[s7] === n2)
                  return t2 || s7 || 0;
            return !t2 && -1;
          };
        };
      }, function(t, e, n) {
        var r = n(8), i = Math.max, o = Math.min;
        t.exports = function(t2, e2) {
          return t2 = r(t2), t2 < 0 ? i(t2 + e2, 0) : o(t2, e2);
        };
      }, function(t, e, n) {
        var r = n(1).document;
        t.exports = r && r.documentElement;
      }, function(t, e, n) {
        var r = n(7), i = n(27), o = n(14)("IE_PROTO"), u = Object.prototype;
        t.exports = Object.getPrototypeOf || function(t2) {
          return t2 = i(t2), r(t2, o) ? t2[o] : typeof t2.constructor == "function" && t2 instanceof t2.constructor ? t2.constructor.prototype : t2 instanceof Object ? u : null;
        };
      }, function(t, e, n) {
        "use strict";
        var r = n(20), i = n(16), o = n(27), u = n(48), c = n(49), f = n(23), a = n(50), s7 = n(51);
        i(i.S + i.F * !n(53)(function(t2) {
          Array.from(t2);
        }), "Array", { from: function(t2) {
          var e2, n2, i2, l, p = o(t2), h = typeof this == "function" ? this : Array, d = arguments.length, v = d > 1 ? arguments[1] : void 0, y = v !== void 0, _ = 0, m = s7(p);
          if (y && (v = r(v, d > 2 ? arguments[2] : void 0, 2)), m == void 0 || h == Array && c(m))
            for (e2 = f(p.length), n2 = new h(e2); e2 > _; _++)
              a(n2, _, y ? v(p[_], _) : p[_]);
          else
            for (l = m.call(p), n2 = new h(); !(i2 = l.next()).done; _++)
              a(n2, _, y ? u(l, v, [i2.value, _], true) : i2.value);
          return n2.length = _, n2;
        } });
      }, function(t, e, n) {
        var r = n(5);
        t.exports = function(t2, e2, n2, i) {
          try {
            return i ? e2(r(n2)[0], n2[1]) : e2(n2);
          } catch (e3) {
            var o = t2.return;
            throw o !== void 0 && r(o.call(t2)), e3;
          }
        };
      }, function(t, e, n) {
        var r = n(13), i = n(0)("iterator"), o = Array.prototype;
        t.exports = function(t2) {
          return t2 !== void 0 && (r.Array === t2 || o[i] === t2);
        };
      }, function(t, e, n) {
        "use strict";
        var r = n(4), i = n(11);
        t.exports = function(t2, e2, n2) {
          e2 in t2 ? r.f(t2, e2, i(0, n2)) : t2[e2] = n2;
        };
      }, function(t, e, n) {
        var r = n(52), i = n(0)("iterator"), o = n(13);
        t.exports = n(2).getIteratorMethod = function(t2) {
          if (t2 != void 0)
            return t2[i] || t2["@@iterator"] || o[r(t2)];
        };
      }, function(t, e, n) {
        var r = n(22), i = n(0)("toStringTag"), o = r(function() {
          return arguments;
        }()) == "Arguments", u = function(t2, e2) {
          try {
            return t2[e2];
          } catch (t3) {
          }
        };
        t.exports = function(t2) {
          var e2, n2, c;
          return t2 === void 0 ? "Undefined" : t2 === null ? "Null" : typeof (n2 = u(e2 = Object(t2), i)) == "string" ? n2 : o ? r(e2) : (c = r(e2)) == "Object" && typeof e2.callee == "function" ? "Arguments" : c;
        };
      }, function(t, e, n) {
        var r = n(0)("iterator"), i = false;
        try {
          var o = [7][r]();
          o.return = function() {
            i = true;
          }, Array.from(o, function() {
            throw 2;
          });
        } catch (t2) {
        }
        t.exports = function(t2, e2) {
          if (!e2 && !i)
            return false;
          var n2 = false;
          try {
            var o2 = [7], u = o2[r]();
            u.next = function() {
              return { done: n2 = true };
            }, o2[r] = function() {
              return u;
            }, t2(o2);
          } catch (t3) {
          }
          return n2;
        };
      }, function(t, e, n) {
        "use strict";
        function r(t2) {
          return t2 && t2.__esModule ? t2 : { default: t2 };
        }
        function i(t2, e2) {
          if (!(t2 instanceof e2))
            throw new TypeError("Cannot call a class as a function");
        }
        Object.defineProperty(e, "__esModule", { value: true });
        var o = function() {
          function t2(t3, e2) {
            for (var n2 = 0; n2 < e2.length; n2++) {
              var r2 = e2[n2];
              r2.enumerable = r2.enumerable || false, r2.configurable = true, "value" in r2 && (r2.writable = true), Object.defineProperty(t3, r2.key, r2);
            }
          }
          return function(e2, n2, r2) {
            return n2 && t2(e2.prototype, n2), r2 && t2(e2, r2), e2;
          };
        }(), u = n(55), c = r(u), f = n(56), a = r(f), s7 = n(57), l = r(s7), p = n(58), h = r(p), d = n(59), v = r(d), y = Math.PI, _ = Math.max, m = Math.min, g = function() {
          function t2(e2, n2) {
            i(this, t2), this.element = e2, this.originalHTML = this.element.innerHTML;
            var r2 = document.createElement("div"), o2 = document.createDocumentFragment();
            r2.setAttribute("aria-label", e2.innerText), r2.style.position = "relative", this.container = r2, this._letters = (0, a.default)(e2, n2), this._letters.forEach(function(t3) {
              return o2.appendChild(t3);
            }), r2.appendChild(o2), this.element.innerHTML = "", this.element.appendChild(r2);
            var u2 = window.getComputedStyle(this.element), f2 = u2.fontSize, s8 = u2.lineHeight;
            this._fontSize = parseFloat(f2), this._lineHeight = parseFloat(s8) || this._fontSize, this._metrics = this._letters.map(c.default);
            var l2 = this._metrics.reduce(function(t3, e3) {
              return t3 + e3.width;
            }, 0);
            this._minRadius = l2 / y / 2 + this._lineHeight, this._dir = 1, this._forceWidth = false, this._forceHeight = true, this._radius = this._minRadius, this._invalidate();
          }
          return o(t2, [{ key: "radius", value: function(t3) {
            return t3 !== void 0 ? (this._radius = _(this._minRadius, t3), this._invalidate(), this) : this._radius;
          } }, { key: "dir", value: function(t3) {
            return t3 !== void 0 ? (this._dir = t3, this._invalidate(), this) : this._dir;
          } }, { key: "forceWidth", value: function(t3) {
            return t3 !== void 0 ? (this._forceWidth = t3, this._invalidate(), this) : this._forceWidth;
          } }, { key: "forceHeight", value: function(t3) {
            return t3 !== void 0 ? (this._forceHeight = t3, this._invalidate(), this) : this._forceHeight;
          } }, { key: "refresh", value: function() {
            return this._invalidate();
          } }, { key: "destroy", value: function() {
            return this.element.innerHTML = this.originalHTML, this;
          } }, { key: "_invalidate", value: function() {
            var t3 = this;
            return cancelAnimationFrame(this._raf), this._raf = requestAnimationFrame(function() {
              t3._layout();
            }), this;
          } }, { key: "_layout", value: function() {
            var t3 = this, e2 = this._radius, n2 = this._dir, r2 = n2 === -1 ? -e2 + this._lineHeight : e2, i2 = "center " + r2 / this._fontSize + "em", o2 = e2 - this._lineHeight, u2 = (0, v.default)(this._metrics, o2), c2 = u2.rotations, f2 = u2.\u03B8;
            if (this._letters.forEach(function(e3, r3) {
              var o3 = e3.style, u3 = (-0.5 * f2 + c2[r3]) * n2, a3 = -0.5 * t3._metrics[r3].width / t3._fontSize, s9 = "translateX(" + a3 + "em) rotate(" + u3 + "deg)";
              o3.position = "absolute", o3.bottom = n2 === -1 ? 0 : "auto", o3.left = "50%", o3.transform = s9, o3.transformOrigin = i2, o3.webkitTransform = s9, o3.webkitTransformOrigin = i2;
            }), this._forceHeight) {
              var a2 = f2 > 180 ? (0, l.default)(e2, f2) : (0, l.default)(o2, f2) + this._lineHeight;
              this.container.style.height = a2 / this._fontSize + "em";
            }
            if (this._forceWidth) {
              var s8 = (0, h.default)(e2, m(180, f2));
              this.container.style.width = s8 / this._fontSize + "em";
            }
            return this;
          } }]), t2;
        }();
        e.default = g;
      }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", { value: true }), e.default = function(t2) {
          var e2 = t2.getBoundingClientRect();
          return { height: e2.height, left: e2.left + window.pageXOffset, top: e2.top + window.pageYOffset, width: e2.width };
        };
      }, function(t, e, n) {
        "use strict";
        function r(t2) {
          if (Array.isArray(t2)) {
            for (var e2 = 0, n2 = Array(t2.length); e2 < t2.length; e2++)
              n2[e2] = t2[e2];
            return n2;
          }
          return Array.from(t2);
        }
        Object.defineProperty(e, "__esModule", { value: true }), e.default = function(t2, e2) {
          var n2 = document.createElement("span"), i = t2.innerText.trim();
          return (e2 ? e2(i) : [].concat(r(i))).map(function(t3) {
            var e3 = n2.cloneNode();
            return e3.insertAdjacentHTML("afterbegin", t3 === " " ? "&nbsp;" : t3), e3;
          });
        };
      }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", { value: true });
        var r = n(28), i = function(t2) {
          return t2 && t2.__esModule ? t2 : { default: t2 };
        }(r);
        e.default = function(t2, e2) {
          return t2 * (1 - Math.cos((0, i.default)(e2 / 2)));
        };
      }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", { value: true });
        var r = n(28), i = function(t2) {
          return t2 && t2.__esModule ? t2 : { default: t2 };
        }(r);
        e.default = function(t2, e2) {
          return 2 * t2 * Math.sin((0, i.default)(e2 / 2));
        };
      }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", { value: true });
        var r = n(60), i = function(t2) {
          return t2 && t2.__esModule ? t2 : { default: t2 };
        }(r);
        e.default = function(t2, e2) {
          return t2.reduce(function(t3, n2) {
            var r2 = n2.width, o = (0, i.default)(r2 / e2);
            return { "\u03B8": t3.\u03B8 + o, rotations: t3.rotations.concat([t3.\u03B8 + o / 2]) };
          }, { "\u03B8": 0, rotations: [] });
        };
      }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", { value: true });
        var r = 180 / Math.PI;
        e.default = function(t2) {
          return t2 * r;
        };
      }]);
    });
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();
var import_gsap = __toModule(require_gsap());
var import_ScrollTrigger = __toModule(require_ScrollTrigger());
var import_circletype = __toModule(require_circletype_min());
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
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s7) {
  return typeof s7 === "string" || s7 instanceof String;
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
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
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
function noop$1() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop$1) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s7 = subscribers[i];
          s7[1]();
          subscriber_queue.push(s7, value);
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
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
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
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page: page2
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
      page: page2,
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
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
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
						host: ${page2 && page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page2 && page2.path)},
						query: new URLSearchParams(${page2 ? s$1(page2.query.toString()) : ""}),
						params: ${page2 && s$1(page2.params)}
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
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
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
      fail(err);
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
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  context,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  const page_proxy = new Proxy(page2, {
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
          }) : await fetch(`http://${page2.host}/${asset.file}`, opts);
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
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape$1(body)}}`
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
      context: { ...context }
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
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped$2 = {
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
function escape$1(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$2) {
      result += escaped$2[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
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
function coalesce_to_error(err) {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
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
    page: page2,
    node: default_layout,
    $session,
    context: {},
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
      page: page2,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
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
      page: page2
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
  ssr:
    if (page_config.ssr) {
      let context = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              context,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
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
                    context: node_loaded.context,
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
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            });
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    });
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
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
  const page2 = {
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
    page: page2
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
function noop() {
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
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
function getContext(key) {
  return get_current_component().$$.context.get(key);
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
      context: new Map(parent_component ? parent_component.$$.context : context || []),
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
var css$h = {
  code: "#svelte-announcer.svelte-9z6sc{position:absolute;left:0;top:0;clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\t-webkit-clip-path: inset(50%);\\n\\t\\t        clip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}</style>"],"names":[],"mappings":"AAsDC,iBAAiB,aAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,iBAAiB,CAAE,MAAM,GAAG,CAAC,CACrB,SAAS,CAAE,MAAM,GAAG,CAAC,CAC7B,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$h);
  {
    stores.page.set(page2);
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
var template = ({ head, body }) => `<!DOCTYPE html>\r
<html lang="en">\r
\r
<head>\r
	<!-- Google Tag Manager -->\r
	<script>(function (w, d, s, l, i) {\r
			w[l] = w[l] || []; w[l].push({\r
				'gtm.start':\r
					new Date().getTime(), event: 'gtm.js'\r
			}); var f = d.getElementsByTagName(s)[0],\r
				j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =\r
					'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);\r
		})(window, document, 'script', 'dataLayer', 'GTM-M24R49C');<\/script>\r
	<!-- End Google Tag Manager -->\r
	<meta charset="utf-8" />\r
	<link rel="icon" href="/favicon.png" />\r
	<meta name="viewport" content="width=device-width, initial-scale=1" />\r
	` + head + '\r\n</head>\r\n\r\n<body>\r\n	<!-- Google Tag Manager (noscript) -->\r\n	<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M24R49C" height="0" width="0"\r\n			style="display:none;visibility:hidden"></iframe></noscript>\r\n	<!-- End Google Tag Manager (noscript) -->\r\n	<div id="svelte">' + body + "</div>\r\n</body>\r\n\r\n</html>";
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
      file: assets + "/_app/start-df6ea331.js",
      css: [assets + "/_app/assets/start-c446e5f0.css"],
      js: [assets + "/_app/start-df6ea331.js", assets + "/_app/chunks/vendor-48fe2e09.js"]
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
  assets: [{ "file": "favicon.png", "size": 6604, "type": "image/png" }, { "file": "fonts/harmony.woff", "size": 28856, "type": "font/woff" }, { "file": "fonts/harmony.woff2", "size": 22228, "type": "font/woff2" }, { "file": "fonts/tenorsans.woff", "size": 23496, "type": "font/woff" }, { "file": "fonts/tenorsans.woff2", "size": 18532, "type": "font/woff2" }],
  layout: "src/routes/__layout.svelte",
  error: "src/routes/__error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/projects\/kanakoot\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/projects/kanakoot.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/contact\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/contact.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about.svelte"],
      b: ["src/routes/__error.svelte"]
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
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/__error.svelte": () => Promise.resolve().then(function() {
    return __error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/projects/kanakoot.svelte": () => Promise.resolve().then(function() {
    return kanakoot;
  }),
  "src/routes/contact.svelte": () => Promise.resolve().then(function() {
    return contact;
  }),
  "src/routes/about.svelte": () => Promise.resolve().then(function() {
    return about;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-a7b52db0.js", "css": ["assets/pages/__layout.svelte-2943a540.css"], "js": ["pages/__layout.svelte-a7b52db0.js", "chunks/vendor-48fe2e09.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-26da99ca.js", "css": ["assets/pages/__error.svelte-f085b6ea.css", "assets/Footer.svelte_svelte&type=style&lang-778f740b.css", "assets/flower-49f67a69.css"], "js": ["pages/__error.svelte-26da99ca.js", "chunks/vendor-48fe2e09.js", "chunks/flower-47301acc.js", "chunks/Footer-dbaeae94.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-ebd480ab.js", "css": ["assets/pages/index.svelte-27f51e9d.css", "assets/Footer.svelte_svelte&type=style&lang-778f740b.css", "assets/flower-49f67a69.css", "assets/Loader-1ab7113f.css"], "js": ["pages/index.svelte-ebd480ab.js", "chunks/vendor-48fe2e09.js", "chunks/flower-47301acc.js", "chunks/Loader-36a92828.js", "chunks/Footer-dbaeae94.js", "chunks/ProjectDetails-77998dbc.js"], "styles": [] }, "src/routes/projects/kanakoot.svelte": { "entry": "pages/projects/kanakoot.svelte-6408a789.js", "css": ["assets/pages/projects/kanakoot.svelte-af091a5f.css", "assets/Footer.svelte_svelte&type=style&lang-778f740b.css", "assets/Loader-1ab7113f.css"], "js": ["pages/projects/kanakoot.svelte-6408a789.js", "chunks/vendor-48fe2e09.js", "chunks/Loader-36a92828.js", "chunks/Footer-dbaeae94.js", "chunks/ProjectDetails-77998dbc.js"], "styles": [] }, "src/routes/contact.svelte": { "entry": "pages/contact.svelte-a126326c.js", "css": ["assets/pages/contact.svelte-f2ce5971.css", "assets/Footer.svelte_svelte&type=style&lang-778f740b.css", "assets/flower-49f67a69.css"], "js": ["pages/contact.svelte-a126326c.js", "chunks/vendor-48fe2e09.js", "chunks/flower-47301acc.js"], "styles": [] }, "src/routes/about.svelte": { "entry": "pages/about.svelte-cc5e1f81.js", "css": ["assets/pages/about.svelte-b20967b9.css", "assets/Footer.svelte_svelte&type=style&lang-778f740b.css", "assets/Loader-1ab7113f.css"], "js": ["pages/about.svelte-cc5e1f81.js", "chunks/vendor-48fe2e09.js", "chunks/Loader-36a92828.js", "chunks/Footer-dbaeae94.js"], "styles": [] } };
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
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender: prerender2 });
}
var css$g = {
  code: "svg.svelte-q6o08k{justify-self:end}@media only screen and (max-width: 1280px){svg.svelte-q6o08k{grid-area:1/3/2/4}}.pupil.svelte-q6o08k{margin:10px}",
  map: `{"version":3,"file":"navspot.svelte","sources":["navspot.svelte"],"sourcesContent":["<script>\\n\\timport { onMount } from 'svelte';\\n\\tlet eyeBall, pupil, centerX, centerY, R, r;\\n\\n\\tonMount(() => {\\n\\t\\tlet eyeArea = eyeBall.getBoundingClientRect(),\\n\\t\\t\\tpupilArea = pupil.getBoundingClientRect();\\n\\t\\tR = eyeArea.width / 2;\\n\\t\\tr = pupilArea.width / 2 + 4;\\n\\t\\tcenterX = eyeArea.left + R;\\n\\t\\tcenterY = eyeArea.top + R;\\n\\t});\\n\\n\\tconst followEye = (e) => {\\n\\t\\tlet x = e.clientX - centerX,\\n\\t\\t\\ty = e.clientY - centerY,\\n\\t\\t\\ttheta = Math.atan2(y, x),\\n\\t\\t\\tangle = (theta * 180) / Math.PI + 360;\\n\\t\\tpupil.style.transform = \`translateX(\${R - r + 'px'}) rotate(\${angle + 'deg'})\`;\\n\\t\\tpupil.style.transformOrigin = \`\${r + 'px'} center\`;\\n\\t};\\n<\/script>\\n\\n<svelte:window on:mousemove={(e) => followEye(e)} />\\n\\n<svg width=\\"26\\" height=\\"26\\" viewBox=\\"0 0 26 26\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\n\\t<circle bind:this={eyeBall} cx=\\"13\\" cy=\\"13\\" r=\\"12\\" stroke=\\"#505050\\" stroke-width=\\"2\\" />\\n\\t<circle class=\\"pupil\\" bind:this={pupil} cx=\\"13\\" cy=\\"13\\" r=\\"3\\" fill=\\"black\\" />\\n</svg>\\n\\n<style lang=\\"scss\\">svg {\\n  justify-self: end;\\n}\\n@media only screen and (max-width: 1280px) {\\n  svg {\\n    grid-area: 1/3/2/4;\\n  }\\n}\\n\\n.pupil {\\n  margin: 10px;\\n}</style>\\n"],"names":[],"mappings":"AA8BmB,GAAG,cAAC,CAAC,AACtB,YAAY,CAAE,GAAG,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,GAAG,cAAC,CAAC,AACH,SAAS,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,AACpB,CAAC,AACH,CAAC,AAED,MAAM,cAAC,CAAC,AACN,MAAM,CAAE,IAAI,AACd,CAAC"}`
};
var Navspot = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let eyeBall, pupil;
  $$result.css.add(css$g);
  return `

<svg width="${"26"}" height="${"26"}" viewBox="${"0 0 26 26"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-q6o08k"}"><circle cx="${"13"}" cy="${"13"}" r="${"12"}" stroke="${"#505050"}" stroke-width="${"2"}"${add_attribute("this", eyeBall, 0)}></circle><circle class="${"pupil svelte-q6o08k"}" cx="${"13"}" cy="${"13"}" r="${"3"}" fill="${"black"}"${add_attribute("this", pupil, 0)}></circle></svg>`;
});
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
var css$f = {
  code: '@font-face{font-family:"harmony";src:url("/fonts/harmony.woff2") format("woff2"), url("/fonts/harmony.woff") format("woff");font-weight:normal;font-style:normal;font-display:fallback}@font-face{font-family:"tenorsans";src:url("/fonts/tenorsans.woff2") format("woff2"), url("/fonts/tenorsans.woff") format("woff");font-weight:normal;font-style:normal;font-display:fallback}html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:before,blockquote:after,q:before,q:after{content:"";content:none}table{border-collapse:collapse;border-spacing:0}a{text-decoration:none}*{box-sizing:border-box}*{scrollbar-width:thin;scrollbar-color:#7E5923 #d1d1d1}*::-webkit-scrollbar{width:12px}*::-webkit-scrollbar-track{background:#d1d1d1}*::-webkit-scrollbar-thumb{background-color:#7E5923;border-radius:20px;border:3px solid #d1d1d1}html,body{min-height:100vh;background-color:#FFFFF5;font-family:"tenorsans", sans-serif;overflow-x:hidden}html{scroll-behavior:smooth}#svelte{height:100%}a:hover{opacity:0.8;transform:translateY(-0.1em);transition:all 0.1s ease-in}header.svelte-1t42gut.svelte-1t42gut{position:fixed;z-index:19;top:0;right:0;left:0;height:12vh;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:end;margin:0 120px 0}@media only screen and (max-width: 1280px){header.svelte-1t42gut.svelte-1t42gut{margin:0 64px 0;min-height:150px;grid-template-rows:1fr 0.5fr}}@media only screen and (max-width: 720px){header.svelte-1t42gut.svelte-1t42gut{margin:0 40px 0;min-height:100px}}@media only screen and (max-height: 480px){header.svelte-1t42gut.svelte-1t42gut{margin:0 40px 0;min-height:100px}}@media only screen and (max-width: 1280px){.logo.svelte-1t42gut.svelte-1t42gut{grid-area:1/1/2/4}}h3.svelte-1t42gut.svelte-1t42gut{font-family:"harmony", serif;color:#3c3c3c;text-decoration:none;font-size:18px;letter-spacing:0.25em}@media only screen and (max-width: 1280px){h3.svelte-1t42gut.svelte-1t42gut{grid-area:1/1/2/4;font-size:14px}}@media only screen and (max-width: 720px){h3.svelte-1t42gut.svelte-1t42gut{font-size:12px}}@media only screen and (max-height: 480px){h3.svelte-1t42gut.svelte-1t42gut{font-size:12px}}@media only screen and (max-width: 1280px){nav.svelte-1t42gut.svelte-1t42gut{grid-area:2/1/3/3;justify-content:start}}ul.svelte-1t42gut.svelte-1t42gut{display:flex;justify-content:space-between;align-items:flex-end;margin-right:4em}@media only screen and (max-width: 1280px){ul.svelte-1t42gut.svelte-1t42gut{justify-content:flex-start}}ul.svelte-1t42gut a.svelte-1t42gut{font-size:18px;padding-top:5px;color:#505050;letter-spacing:0.15em}@media only screen and (max-width: 1280px){ul.svelte-1t42gut a.svelte-1t42gut{margin-right:5em;font-size:14px}}@media only screen and (max-width: 720px){ul.svelte-1t42gut a.svelte-1t42gut{margin-right:3em;font-size:12px}}@media only screen and (max-height: 480px){ul.svelte-1t42gut a.svelte-1t42gut{margin-right:3em;font-size:12px}}.P.svelte-1t42gut a.svelte-1t42gut:nth-child(1){border-top:2px solid black}.aboutP.svelte-1t42gut a.svelte-1t42gut:nth-child(2){border-top:2px solid black}.contactP.svelte-1t42gut a.svelte-1t42gut:nth-child(3){border-top:2px solid black}',
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script>\\r\\n\\timport Navspot from '../svg/navspot.svelte';\\r\\n\\timport { page } from '$app/stores';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<header>\\r\\n\\t\\t<!-- <a class=\\"logo\\" href=\\"/\\">  -->\\r\\n\\t\\t<h3>GAUTHAM KRISHNA</h3>\\r\\n\\t\\t<!-- </a> -->\\r\\n\\t\\t<nav>\\r\\n\\t\\t\\t<ul class={\`\${$page.path}P\`.slice(1)}>\\r\\n\\t\\t\\t\\t<a href=\\"/\\"><li>HOME</li></a>\\r\\n\\t\\t\\t\\t<a href=\\"/about\\"><li>ABOUT</li></a>\\r\\n\\t\\t\\t\\t<a href=\\"/contact\\"><li>CONTACT</li></a>\\r\\n\\t\\t\\t</ul>\\r\\n\\t\\t</nav>\\r\\n\\t\\t<Navspot />\\r\\n\\t</header>\\r\\n\\r\\n\\r\\n<slot />\\r\\n\\r\\n<style lang=\\"scss\\">@font-face {\\n  font-family: \\"harmony\\";\\n  src: url(\\"/fonts/harmony.woff2\\") format(\\"woff2\\"), url(\\"/fonts/harmony.woff\\") format(\\"woff\\");\\n  font-weight: normal;\\n  font-style: normal;\\n  font-display: fallback;\\n}\\n@font-face {\\n  font-family: \\"tenorsans\\";\\n  src: url(\\"/fonts/tenorsans.woff2\\") format(\\"woff2\\"), url(\\"/fonts/tenorsans.woff\\") format(\\"woff\\");\\n  font-weight: normal;\\n  font-style: normal;\\n  font-display: fallback;\\n}\\n:global(html),\\n:global(body),\\n:global(div),\\n:global(span),\\n:global(applet),\\n:global(object),\\n:global(iframe),\\n:global(h1),\\n:global(h2),\\n:global(h3),\\n:global(h4),\\n:global(h5),\\n:global(h6),\\n:global(p),\\n:global(blockquote),\\n:global(pre),\\n:global(a),\\n:global(abbr),\\n:global(acronym),\\n:global(address),\\n:global(big),\\n:global(cite),\\n:global(code),\\n:global(del),\\n:global(dfn),\\n:global(em),\\n:global(img),\\n:global(ins),\\n:global(kbd),\\n:global(q),\\n:global(s),\\n:global(samp),\\n:global(small),\\n:global(strike),\\n:global(strong),\\n:global(sub),\\n:global(sup),\\n:global(tt),\\n:global(var),\\n:global(b),\\n:global(u),\\n:global(i),\\n:global(center),\\n:global(dl),\\n:global(dt),\\n:global(dd),\\n:global(ol),\\n:global(ul),\\n:global(li),\\n:global(fieldset),\\n:global(form),\\n:global(label),\\n:global(legend),\\n:global(table),\\n:global(caption),\\n:global(tbody),\\n:global(tfoot),\\n:global(thead),\\n:global(tr),\\n:global(th),\\n:global(td),\\n:global(article),\\n:global(aside),\\n:global(canvas),\\n:global(details),\\n:global(embed),\\n:global(figure),\\n:global(figcaption),\\n:global(footer),\\n:global(header),\\n:global(hgroup),\\n:global(menu),\\n:global(nav),\\n:global(output),\\n:global(ruby),\\n:global(section),\\n:global(summary),\\n:global(time),\\n:global(mark),\\n:global(audio),\\n:global(video) {\\n  margin: 0;\\n  padding: 0;\\n  border: 0;\\n  font-size: 100%;\\n  font: inherit;\\n  vertical-align: baseline;\\n}\\n:global(article),\\n:global(aside),\\n:global(details),\\n:global(figcaption),\\n:global(figure),\\n:global(footer),\\n:global(header),\\n:global(hgroup),\\n:global(menu),\\n:global(nav),\\n:global(section) {\\n  display: block;\\n}\\n:global(body) {\\n  line-height: 1;\\n}\\n:global(ol),\\n:global(ul) {\\n  list-style: none;\\n}\\n:global(blockquote),\\n:global(q) {\\n  quotes: none;\\n}\\n:global(blockquote:before),\\n:global(blockquote:after),\\n:global(q:before),\\n:global(q:after) {\\n  content: \\"\\";\\n  content: none;\\n}\\n:global(table) {\\n  border-collapse: collapse;\\n  border-spacing: 0;\\n}\\n:global(a) {\\n  text-decoration: none;\\n}\\n:global(*) {\\n  box-sizing: border-box;\\n}\\n:global(*) {\\n  scrollbar-width: thin;\\n  scrollbar-color: #7E5923 #d1d1d1;\\n}\\n:global(*::-webkit-scrollbar) {\\n  width: 12px;\\n}\\n:global(*::-webkit-scrollbar-track) {\\n  background: #d1d1d1;\\n}\\n:global(*::-webkit-scrollbar-thumb) {\\n  background-color: #7E5923;\\n  border-radius: 20px;\\n  border: 3px solid #d1d1d1;\\n}\\n:global(html),\\n:global(body) {\\n  min-height: 100vh;\\n  background-color: #FFFFF5;\\n  font-family: \\"tenorsans\\", sans-serif;\\n  overflow-x: hidden;\\n}\\n:global(html) {\\n  scroll-behavior: smooth;\\n}\\n:global(#svelte) {\\n  height: 100%;\\n}\\n:global(a:hover) {\\n  opacity: 0.8;\\n  transform: translateY(-0.1em);\\n  transition: all 0.1s ease-in;\\n}\\n\\nheader {\\n  position: fixed;\\n  z-index: 19;\\n  top: 0;\\n  right: 0;\\n  left: 0;\\n  height: 12vh;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  align-items: end;\\n  margin: 0 120px 0;\\n}\\n@media only screen and (max-width: 1280px) {\\n  header {\\n    margin: 0 64px 0;\\n    min-height: 150px;\\n    grid-template-rows: 1fr 0.5fr;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  header {\\n    margin: 0 40px 0;\\n    min-height: 100px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  header {\\n    margin: 0 40px 0;\\n    min-height: 100px;\\n  }\\n}\\n\\n@media only screen and (max-width: 1280px) {\\n  .logo {\\n    grid-area: 1/1/2/4;\\n  }\\n}\\n\\nh3 {\\n  font-family: \\"harmony\\", serif;\\n  color: #3c3c3c;\\n  text-decoration: none;\\n  font-size: 18px;\\n  letter-spacing: 0.25em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  h3 {\\n    grid-area: 1/1/2/4;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h3 {\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h3 {\\n    font-size: 12px;\\n  }\\n}\\n\\n@media only screen and (max-width: 1280px) {\\n  nav {\\n    grid-area: 2/1/3/3;\\n    justify-content: start;\\n  }\\n}\\n\\nul {\\n  display: flex;\\n  justify-content: space-between;\\n  align-items: flex-end;\\n  margin-right: 4em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  ul {\\n    justify-content: flex-start;\\n  }\\n}\\nul a {\\n  font-size: 18px;\\n  padding-top: 5px;\\n  color: #505050;\\n  letter-spacing: 0.15em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  ul a {\\n    margin-right: 5em;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  ul a {\\n    margin-right: 3em;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  ul a {\\n    margin-right: 3em;\\n    font-size: 12px;\\n  }\\n}\\n\\n.P a:nth-child(1) {\\n  border-top: 2px solid black;\\n}\\n\\n.aboutP a:nth-child(2) {\\n  border-top: 2px solid black;\\n}\\n\\n.contactP a:nth-child(3) {\\n  border-top: 2px solid black;\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
};
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css$f);
  $$unsubscribe_page();
  return `<header class="${"svelte-1t42gut"}">
		<h3 class="${"svelte-1t42gut"}">GAUTHAM KRISHNA</h3>
		
		<nav class="${"svelte-1t42gut"}"><ul class="${escape(null_to_empty(`${$page.path}P`.slice(1))) + " svelte-1t42gut"}"><a href="${"/"}" class="${"svelte-1t42gut"}"><li>HOME</li></a>
				<a href="${"/about"}" class="${"svelte-1t42gut"}"><li>ABOUT</li></a>
				<a href="${"/contact"}" class="${"svelte-1t42gut"}"><li>CONTACT</li></a></ul></nav>
		${validate_component(Navspot, "Navspot").$$render($$result, {}, {}, {})}</header>


${slots.default ? slots.default({}) : ``}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
var css$e = {
  code: "svg.svelte-1b8qfn3{width:35%;position:absolute;bottom:0;right:6%}@media only screen and (max-width: 1280px){svg.svelte-1b8qfn3{width:auto;height:45%;right:30%}}@media only screen and (max-width: 720px){svg.svelte-1b8qfn3{height:40%;right:25%}}@media only screen and (max-height: 480px){svg.svelte-1b8qfn3{height:40%;right:25%}}.back.svelte-1b8qfn3{opacity:0.3}",
  map: `{"version":3,"file":"flower.svelte","sources":["flower.svelte"],"sourcesContent":["<script>\\r\\n\\texport let type = '';\\r\\n\\r\\n\\timport { gsap } from 'gsap/dist/gsap.js';\\r\\n\\timport { ScrollTrigger } from 'gsap/dist/ScrollTrigger.js';\\r\\n\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\tgsap.registerPlugin(ScrollTrigger);\\r\\n\\tlet flower;\\r\\n\\tonMount(() => {\\r\\n\\t\\tgsap.to(flower, {\\r\\n\\t\\t\\tscrollTrigger: {\\r\\n\\t\\t\\t\\ttrigger: flower,\\r\\n\\t\\t\\t\\tstart: 'end 20px',\\r\\n\\t\\t\\t\\tscrub: true\\r\\n\\t\\t\\t},\\r\\n\\t\\t\\topacity: 0\\r\\n\\t\\t});\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n<svg\\r\\n\\tbind:this={flower}\\r\\n\\tclass={type}\\r\\n\\tviewBox=\\"0 0 771 981\\"\\r\\n\\tfill=\\"none\\"\\r\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\r\\n>\\r\\n\\t<path\\r\\n\\t\\td=\\"M584.95 885.022C591.169 913.775 596.156 943.032 597.306 972.639L596.5 977.5L595.153 980C595.03 976.872 594.882 973.742 594.706 970.606C593.315 949.611 590.043 928.611 586.409 907.537C575.784 848.516 559.509 791.362 531.135 738.155C522.709 722.136 515.081 705.901 507.091 689.593C504.427 684.157 502.052 679.156 499.751 673.794C486.727 645.167 475.659 616.184 466.331 586.047C458.797 561.923 453.291 537.081 449.305 512.17C446.179 490.447 443.2 468 440.148 445.915C438.732 434.329 436.88 423.033 435.464 411.447C435.249 410.651 435.758 410.001 435.905 409.277C436.843 410.221 437.058 411.018 437.273 411.814C440.755 435.493 445.034 458.957 447.793 482.489C452.398 519.2 459.32 555.627 470.662 590.691C475.758 606.412 481.216 622.207 487.183 637.351C494.874 656.988 503.289 676.771 513.445 695.401C518.845 705.911 523.448 716.637 528.487 727.074C538.49 748.309 548.929 769.256 558.062 791.068C570.792 821.142 578.233 853.155 584.95 885.022Z\\"\\r\\n\\t\\tfill=\\"url(#paint0_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M438.047 429.701C438.702 428.327 439.358 426.954 439.143 426.157C437.58 415.295 442.093 406.042 446.244 396.716C451.05 386.016 455.857 375.317 460.951 365.052C466.119 354.426 469.841 343.506 472.188 331.931C475.191 318.983 479.568 306.69 484.306 294.47C489.919 279.792 495.821 265.548 501.796 250.943C503.835 246.461 506.236 242.052 507.913 237.496C518.7 210.31 536.857 187.631 554.003 164.37C559.669 156.858 565.262 149.707 570.278 141.686C573.041 137.351 574.791 132.433 576.83 127.951C576.977 127.228 577.412 126.939 577.559 126.216C577.711 123.61 578.659 120.79 575.986 119.118C573.674 117.519 571.21 118.526 569.396 120.041C567.074 122.206 564.39 124.298 562.791 126.61C552.109 142.143 538.973 154.919 525.763 168.057C518.797 174.553 512.119 181.483 505.729 188.849C494.622 200.907 485.9 214.202 480.139 229.603C479.411 231.339 478.756 232.712 477.304 234.301C477.177 227.496 477.051 220.692 477.287 213.961C477.553 195.938 477.531 177.481 477.797 159.458C478.268 145.996 479.1 132.607 479.571 119.145C479.749 107.13 480 94.7534 479.454 82.5915C479.249 78.0308 478.032 72.8883 476.669 68.4693C472.789 57.8908 461.576 55.6164 453.519 63.7738C450.689 66.589 448.146 69.8393 446.328 73.2364C438.476 85.9545 429.035 97.2205 418.583 107.905C411.035 115.412 404.136 123.428 396.803 131.732C396.373 130.138 395.87 128.906 395.44 127.313C392.572 117.316 388.037 108.111 380.891 100.636C373.095 92.653 363.628 87.3433 353.143 83.3337C345.767 80.7078 338.098 79.5288 330.135 79.7967C320.652 80.1328 313.114 83.8762 308.098 91.8971C305.335 96.2326 302.861 101.003 299.737 105.265C293.851 113.863 287.676 122.025 281.789 130.623C274.886 140.521 267.621 150.345 263.03 161.841C261.945 161.621 261.51 161.91 260.786 161.763C245.311 156.364 230.612 158.279 216.044 165.116C211.117 167.129 206.766 170.012 202.127 172.461C196.617 175.486 191.035 178.873 185.237 181.463C173.715 186.281 165.947 194.873 160.705 205.861C154.3 218.873 153.394 232.623 155.093 246.525C156.856 263.83 161.879 279.912 169.654 295.424C161.43 311.832 150.606 326.207 132.925 333.542C126.765 336.059 120.459 339.299 114.153 342.539C110.311 344.772 106.756 347.441 104.429 351.488C101.808 356.982 103.533 361.474 109.247 363.01C115.323 364.619 121.472 365.866 127.768 366.39C150.708 368.407 174.083 370.135 196.798 375.119C210.108 378.195 223.272 381.995 236.435 385.795C247.428 389.154 258.783 392.587 269.629 396.67C281.922 401.046 294.142 405.785 306.362 410.523C323.934 416.723 341.213 424.37 359.734 427.75C372.106 429.883 384.194 429.699 396.146 426.474C404.476 424.398 412.806 422.321 421.492 422.2C427.138 422.215 432.055 423.966 436.605 427.525C436.747 428.684 437.035 429.119 438.047 429.701ZM285.577 254.915C292.015 256.597 297.44 257.698 302.793 259.16C314.436 263.028 325.932 267.619 336.7 273.946C343.133 277.51 349.057 281.725 354.907 286.301C359.169 289.425 361.329 293.629 362.472 299.133C366.038 318.686 372.068 337.233 380.053 355.422C388.473 373.324 398.634 390.072 414.089 402.998C416.039 404.524 416.757 406.552 415.882 409.011C414.493 414.002 411.081 417.829 406.515 419.915C393.106 426.611 379.057 429.033 364.006 427.11C347.509 424.894 331.745 419.061 316.417 412.939C304.197 408.201 291.977 403.462 279.684 399.086C267.029 394.636 254.736 390.26 242.007 386.172C231.376 382.886 221.106 379.673 210.328 377.11C199.188 374.474 187.975 372.199 176.327 370.213C166.487 368.594 156.863 367.772 146.876 366.876C136.89 365.98 126.903 365.085 116.99 363.827C114.023 363.602 110.914 362.218 107.732 361.196C104.624 359.812 104.194 358.219 104.854 354.963C105.514 351.708 107.978 350.701 110.73 350.13C118.116 348.992 125.938 347.565 133.324 346.427C145.344 344.723 156.573 341.351 167.23 335.228C180.062 327.662 191.091 317.848 200.605 306.221C206.559 299.143 212.226 291.631 218.18 284.553C225.514 276.249 232.847 267.945 241.695 261.455C249.6 255.903 258.15 252.741 267.56 252.767C274.652 253.076 280.44 254.249 285.577 254.915ZM363.112 223.567C364.354 219.3 365.822 212.065 368.374 205.051C373.914 190.734 382.49 178.163 393.089 166.755C405.575 153.471 417.772 139.751 429.608 125.958C440.427 113.465 447.199 98.6452 450.139 82.2946C451.02 77.9541 453.059 73.4718 454.301 69.2046C456.051 64.2873 459.82 62.4156 464.743 62.2843C469.303 62.0795 472.407 65.3452 473.844 69.4026C475.354 73.0982 477.005 77.9524 477.21 82.5131C477.541 93.8781 477.872 105.243 477.479 116.461C476.998 133.687 475.359 151.055 475.313 167.992C474.56 205.123 474.966 242.112 474.287 278.88C474.11 290.895 472.774 303.052 472.234 314.994C471.852 322.448 469.588 329.898 467.759 337.059C463.802 354.709 456.087 370.468 445.624 384.916C442.427 389.54 438.144 393.944 434.009 397.624C427.624 403.108 417.706 403.732 409.91 395.749C401.753 387.692 394.901 378.77 389.427 368.622C375.308 343.539 367.275 316.301 362.43 288.203C359.011 267.926 358.344 247.078 363.112 223.567ZM359.971 287.328C355.421 283.769 351.159 280.645 347.185 277.956C327.893 265.381 306.924 257.362 284.644 252.089C279.653 250.701 276.33 248.52 273.808 244.243C265.592 230.902 261.796 216.198 260.028 200.775C259.252 193.462 259.273 185.935 260.813 178.339C262.726 167.052 267.097 156.641 273.566 147.031C285.123 129.04 298.993 112.646 309.901 94.1459C313.974 87.0634 320.715 83.535 329.113 82.9788C338.234 82.5693 346.627 83.895 354.941 87.4644C364.703 91.3273 373.809 96.5636 380.446 104.689C388.383 113.83 392.625 124.482 394.764 136.214C363.66 181.876 352.665 232.369 359.971 287.328ZM261.499 165.673C253.166 195.617 258.955 222.777 274.301 249.238C272.057 249.16 270.175 249.155 268.293 249.15C261.201 248.841 254.255 247.809 247.377 248.297C216.176 249.876 190.086 261.532 173.433 289.788C172.852 290.8 171.835 292.1 170.818 293.4C169.953 292.095 169.449 290.863 168.873 289.993C163.766 278.036 159.456 265.864 157.537 253.047C156.257 244.502 155.701 236.104 156.665 227.638C157.776 218.448 160.622 209.987 165.276 201.893C168.767 195.822 173.196 190.695 179.502 187.455C190.883 181.478 201.901 175.428 213.282 169.451C224.227 163.762 235.744 160.826 247.901 162.162C252.388 162.319 257.237 162.549 261.499 165.673ZM259.602 251.153C259.167 251.441 258.732 251.729 258.37 251.656C246.491 254.519 237.208 261.298 229.078 269.817C221.891 277.398 215.355 285.487 208.53 293.141C203.084 299.568 197.999 306.069 192.265 312.061C174.988 330.399 154.471 342.431 128.842 344.388C124.208 344.955 119.862 345.956 115.228 346.523C114.431 346.738 113.272 346.879 112.187 346.659C114.871 344.567 117.482 342.837 120.381 341.542C125.381 339.167 130.309 337.154 135.31 334.779C146.979 329.237 156.556 321.012 163.317 309.955C167.825 302.585 172.259 295.575 176.767 288.205C181.128 281.557 185.851 274.983 192.162 269.861C211.605 253.845 234.78 249.131 259.602 251.153ZM476.229 310.155C476.353 290.974 476.693 272.59 476.671 254.132C476.706 240.958 480.936 229.388 489.721 219.496C499.959 208.015 512.073 198.421 523.825 188.753C538.261 176.994 549.3 163.416 555.501 145.844C558.127 138.468 562.199 131.386 567.211 125.247C569.171 123.008 571.131 120.77 574.749 121.503C576.405 124.476 575.457 127.296 574.22 129.681C571.672 134.813 569.198 139.584 566.001 144.208C559.606 153.455 552.561 162.195 545.878 171.007C532.873 188.706 519.868 206.404 510.187 226.283C499.778 247.897 491.103 270.24 482.502 292.221C480.532 298.224 478.634 303.864 476.229 310.155ZM449.295 73.4616C449.363 74.9818 449.29 75.3436 449.216 75.7053C446.13 92.7793 440.008 108.108 429.33 121.759C418.071 136.422 405.512 150.069 392.664 163.28C384.099 172.087 376.907 181.55 371.304 192.464C370.14 194.488 368.977 196.511 367.813 198.535C367.451 198.462 367.09 198.388 366.801 197.953C370.156 188.842 373.148 179.658 376.864 170.62C386.771 147.774 400.724 127.255 418.94 109.86C429.318 99.5376 439.047 88.7066 446.464 76.2769C447.261 76.0619 448.131 75.4852 449.295 73.4616ZM489.008 215.585C489.008 215.585 489.155 214.862 489.228 214.5C490.465 212.115 491.991 210.165 493.228 207.779C502.243 193.038 515.374 182.144 526.555 169.724C534.685 161.205 543.177 152.759 551.307 144.24C551.815 143.59 552.612 143.375 553.991 142.148C553.116 144.607 552.46 145.981 551.805 147.354C546.847 160.659 539.288 171.93 528.045 180.948C524.417 183.978 521.078 187.443 517.451 190.473C508.162 199.134 498.585 207.36 489.008 215.585Z\\"\\r\\n\\t\\tfill=\\"url(#paint1_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M418.267 410.248C417.182 410.028 415.809 409.373 414.65 409.514C390.478 408.001 369.514 398.1 349.499 385.378C337.142 377.6 324.933 369.098 312.65 360.957C303.402 354.562 294.154 348.168 284.76 342.496C291.622 347.654 298.338 353.535 305.274 358.331C317.483 366.833 330.055 375.409 342.338 383.549C354.259 391.616 366.4 398.598 379.705 403.556C391.563 408.221 403.788 411.077 416.527 411.401C416.889 411.475 417.324 411.186 417.685 411.26C418.12 410.971 418.194 410.61 418.267 410.248Z\\"\\r\\n\\t\\tfill=\\"url(#paint2_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M393.384 191.294C393.295 197.301 393.28 202.947 393.191 208.955C393.517 222.202 393.119 235.302 394.315 247.972C395.512 260.643 397.358 273.821 400.147 286.062C405.155 307.79 411.395 329.016 417.272 350.167C417.487 350.964 418.064 351.834 419.003 352.778C418.573 351.184 418.504 349.664 418.001 348.432C412.343 326.195 406.324 303.885 401.028 281.721C395.947 260.354 394.776 238.274 395.126 216.126C395.293 207.875 394.737 199.477 394.469 191.514C394.181 191.079 393.819 191.006 393.384 191.294Z\\"\\r\\n\\t\\tfill=\\"url(#paint3_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M359.418 410.739C365.783 412.783 372 415.551 378.076 417.16C384.513 418.842 390.736 419.728 397.1 421.772C388.917 423.125 381.321 421.584 373.363 419.97C351.66 415.568 331.414 407.695 311.897 398.088C311.247 397.579 310.524 397.433 309.292 397.936C317.171 401.794 325.05 405.651 332.568 409.436C346.738 415.699 361.636 420.228 376.828 423.309C380.807 424.116 384.86 424.561 388.624 424.572C393.111 424.729 397.31 424.45 402.594 424.392C402.091 423.161 401.441 422.652 401.226 421.855C402.384 421.714 403.904 421.645 405.063 421.504C405.136 421.142 405.21 420.78 405.21 420.78C400.072 420.115 394.935 419.45 390.232 418.496C384.807 417.395 379.816 416.006 374.464 414.544C369.473 413.155 364.482 411.766 359.13 410.304C359.492 410.378 359.492 410.378 359.418 410.739Z\\"\\r\\n\\t\\tfill=\\"url(#paint4_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M457.158 242.642C458.281 255.674 459.765 268.78 460.815 282.173C461.859 297.449 461.745 312.866 460.183 327.99C458.25 346.804 453.785 365.105 444.403 381.655C444.329 382.017 444.183 382.741 444.833 383.249C448.182 376.02 451.82 369.226 454.445 361.85C462.837 337.19 464.208 311.86 462.613 286.304C461.637 272.549 459.503 258.935 457.803 245.033C457.95 244.309 457.735 243.512 457.158 242.642Z\\"\\r\\n\\t\\tfill=\\"url(#paint5_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M309.979 251.579C309.114 250.274 308.611 249.042 307.673 248.099C297.942 232.944 289.879 216.998 282.612 200.837C276.352 187.139 272.555 172.435 271.438 157.521C271.155 155.204 271.16 153.322 270.877 151.005C269.346 154.837 269.336 158.601 269.687 162.438C271.743 178.296 275.54 193 282.811 207.279C289.795 221.123 296.27 235.618 305.791 248.093C307.017 249.472 307.882 250.777 308.674 252.444C309.183 251.794 309.544 251.868 309.979 251.579Z\\"\\r\\n\\t\\tfill=\\"url(#paint6_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M417.784 401.488C417.208 400.618 416.993 399.821 416.343 399.313C404.437 385.6 397.17 369.439 392.079 351.836C387.632 336.624 383.909 321.558 379.825 306.419C379.395 304.825 378.892 303.593 378.026 302.288C379.385 308.589 380.308 315.178 382.101 321.191C386.18 338.212 390.622 355.307 397.092 371.683C401.045 381.899 406.812 390.601 413.811 398.799C414.676 400.105 415.976 401.122 417.276 402.138C417.276 402.138 417.711 401.85 417.784 401.488Z\\"\\r\\n\\t\\tfill=\\"url(#paint7_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M121.23 348.493C123.112 348.499 125.356 348.577 127.238 348.582C136.359 348.173 145.26 348.848 154.377 350.321C163.131 351.72 171.959 352.757 180.205 354.806C192.792 357.736 205.667 361.101 218.254 364.03C221.147 364.617 224.041 365.204 226.573 365.718C204.084 357.767 180.645 352.636 156.987 348.591C147.509 347.045 137.738 346.946 128.04 346.485C125.796 346.407 123.406 347.052 120.654 347.623C121.015 347.697 121.304 348.132 121.23 348.493Z\\"\\r\\n\\t\\tfill=\\"url(#paint8_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M193.308 221.512C200.678 226.02 207.614 230.816 214.985 235.324C222.067 239.397 229.512 243.543 236.956 247.689C226.031 245.85 216.783 239.455 206.084 234.649C212.584 239.733 219.09 242.936 225.669 245.776C228.054 247.013 230.948 247.6 233.333 248.837C235.719 250.074 238.036 249.791 239.923 247.914C243.467 249.01 246.722 249.67 250.266 250.765C250.339 250.404 250.486 249.68 250.921 249.392C230.308 243.328 212.316 231.77 194.686 220.286C193.816 220.862 193.743 221.224 193.308 221.512Z\\"\\r\\n\\t\\tfill=\\"url(#paint9_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M452.874 300.899C454.009 336.153 447.474 370.227 428.426 401.011C429.37 400.072 429.878 399.422 430.822 398.484C436.996 390.321 441.509 381.069 444.649 371.161C447.5 360.818 450.713 350.548 452.84 340.058C455.408 327.398 455.444 314.224 453.959 301.119C454.033 300.757 453.671 300.684 453.745 300.322C453.021 300.176 452.948 300.537 452.874 300.899Z\\"\\r\\n\\t\\tfill=\\"url(#paint10_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M335.695 137.791C338.71 147.064 341.725 156.337 345.175 165.322C350.423 178.438 351.761 192.266 353.172 205.734C354.588 217.319 355.208 229.119 356.55 241.066C356.555 239.184 356.487 237.663 356.492 235.782C355.463 214.86 354.796 194.012 349.495 173.73C346.779 161.128 342.034 149.244 335.695 137.791Z\\"\\r\\n\\t\\tfill=\\"url(#paint11_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M304.429 269.66C327.338 282.968 350.247 296.277 367.417 317.459C367.852 317.171 367.852 317.171 368.287 316.883C367.71 316.012 367.569 314.854 366.919 314.345C361.938 309.193 357.105 303.317 351.254 298.74C337.823 286.978 322.646 278.251 306.526 270.462C306.311 269.665 305.152 269.807 304.429 269.66Z\\"\\r\\n\\t\\tfill=\\"url(#paint12_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M182.604 324.412C209.513 331 233.507 344.528 258.665 356.033C255.991 354.361 253.606 353.124 250.933 351.452C248.259 349.78 245.874 348.543 243.127 347.233C229.392 340.681 216.018 334.202 202.137 328.374C196.931 326.188 191.505 325.088 186.153 323.625C185.068 323.405 183.909 323.547 183.186 323.4C182.316 323.977 182.604 324.412 182.604 324.412Z\\"\\r\\n\\t\\tfill=\\"url(#paint13_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M462.589 162.022C463.299 193.8 471.033 224.367 474.495 255.574C474.857 255.647 475.292 255.359 475.654 255.432C474.306 245.367 473.031 234.94 471.684 224.876C470.047 214.376 468.411 203.876 466.775 193.376C465.139 182.876 463.864 172.449 462.589 162.022Z\\"\\r\\n\\t\\tfill=\\"url(#paint14_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M358.618 279.145C351.451 253.212 345.515 226.776 340.737 200.199C340.449 199.763 340.161 199.328 339.872 198.893C343.706 226.409 349.207 253.134 358.618 279.145Z\\"\\r\\n\\t\\tfill=\\"url(#paint15_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M485.265 287.886C489.935 274.146 494.678 260.044 499.348 246.304C504.018 232.564 509.338 219.332 516.105 206.394C500.401 231.83 493.158 260.112 485.265 287.886Z\\"\\r\\n\\t\\tfill=\\"url(#paint16_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M339.975 81.4159C341.123 85.0382 344.52 86.857 346.612 89.5408C348.704 92.2247 350.795 94.9086 352.526 97.5191C354.617 100.203 356.636 103.249 358.293 106.221C360.023 108.831 362.041 111.877 363.698 114.849C365.355 117.821 366.938 121.155 368.595 124.127C369.89 127.026 371.473 130.36 372.695 133.621C373.375 122.837 350.024 85.7138 339.975 81.4159Z\\"\\r\\n\\t\\tfill=\\"url(#paint17_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M300.73 219.199C305.753 235.282 314.619 249.131 324.716 262.477C327.961 266.901 331.641 271.037 337.135 273.658C337.282 272.934 337.429 272.211 337.067 272.137C324.213 261.245 316.217 246.819 307.787 232.681C305.265 228.404 303.178 223.838 300.73 219.199Z\\"\\r\\n\\t\\tfill=\\"url(#paint18_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M420.356 201.284C420.779 178.774 418.523 156.474 421.264 133.681C419.303 135.919 418.355 138.739 418.271 142.865C417.496 161.538 418.53 180.577 419.711 198.893C419.926 199.69 420.141 200.487 420.356 201.284Z\\"\\r\\n\\t\\tfill=\\"url(#paint19_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M465.224 124.897C468.442 112.745 466.101 68.5853 460.911 60.7538C460.748 67.123 462.762 72.0506 462.82 77.3347C463.239 82.6922 463.733 87.6879 464.152 93.0454C464.572 98.4029 464.63 103.687 464.976 109.406C465.108 114.329 465.166 119.613 465.224 124.897Z\\"\\r\\n\\t\\tfill=\\"url(#paint20_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M382.36 358.903C369.888 340.556 353.568 326.325 335.869 313.32C351.681 328.202 368.436 342.145 382.36 358.903Z\\"\\r\\n\\t\\tfill=\\"url(#paint21_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M430.381 320.816C430.741 294.903 426.908 267.387 422.712 239.798C425.314 267.817 427.989 295.475 430.381 320.816Z\\"\\r\\n\\t\\tfill=\\"url(#paint22_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M495.395 236.087C486.217 257.198 484.2 280.138 479.651 302.564C482.287 291.424 484.85 280.646 487.486 269.506C489.761 258.293 492.397 247.153 495.395 236.087Z\\"\\r\\n\\t\\tfill=\\"url(#paint23_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M404.857 390.958C393.753 375.148 387.649 356.963 380.75 338.993C380.891 340.152 381.321 341.746 381.463 342.904C385.191 356.088 389.789 368.695 396.343 380.946C397.638 383.845 399.729 386.528 401.459 389.139C402.398 390.082 403.336 391.026 404.275 391.97C404.348 391.608 404.421 391.246 404.857 390.958Z\\"\\r\\n\\t\\tfill=\\"url(#paint24_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M232.847 267.945C248.532 276.022 263.709 284.75 278.23 294.85C264.799 283.088 249.769 273.637 232.847 267.945Z\\"\\r\\n\\t\\tfill=\\"url(#paint25_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M311.121 151.259C307.398 136.194 303.963 121.563 300.529 106.932C298.416 111.776 305.212 141.399 311.121 151.259Z\\"\\r\\n\\t\\tfill=\\"url(#paint26_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M145.926 343.711C160.83 346.357 176.095 349.077 189.913 351.503C179.502 347.132 153.747 342.284 145.926 343.711Z\\"\\r\\n\\t\\tfill=\\"url(#paint27_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M353.217 162.81C346.165 147.446 342.374 130.86 333.293 116.214C332.717 115.344 332.575 114.185 331.998 113.315C331.563 113.603 331.201 113.53 331.128 113.892C334.725 122.153 338.757 130.126 342.353 138.388C345.95 146.649 349.111 155.199 352.346 163.387C352.42 163.025 352.855 162.737 353.217 162.81Z\\"\\r\\n\\t\\tfill=\\"url(#paint28_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M335.332 351.247C334.032 350.23 332.805 348.852 331.505 347.835C315.033 336.209 297.325 326.968 280.198 316.715C279.836 316.642 279.474 316.569 278.316 316.71C282.725 319.111 286.41 321.365 290.457 323.692C304.91 332.273 319.872 340.203 333.235 350.445C333.959 350.592 334.682 350.739 335.332 351.247Z\\"\\r\\n\\t\\tfill=\\"url(#paint29_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M360.144 117.518C352.432 105.409 346.025 92.4346 336.064 82.1291C335.556 82.7792 335.194 82.7058 335.121 83.0675L335.047 83.4292C334.974 83.791 335.262 84.226 335.262 84.226C343.918 95.3966 351.85 106.42 360.144 117.518Z\\"\\r\\n\\t\\tfill=\\"url(#paint30_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M492.704 214.075C488.783 218.552 482.426 240.612 481.887 252.554C485.54 240.114 489.193 227.674 492.704 214.075Z\\"\\r\\n\\t\\tfill=\\"url(#paint31_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M223.21 165.063C226.026 167.893 228.841 170.724 231.583 173.916C234.325 177.109 237.067 180.301 239.447 183.42C242.189 186.612 244.495 190.093 247.164 193.647C244.584 184.085 229.795 166.022 223.21 165.063Z\\"\\r\\n\\t\\tfill=\\"url(#paint32_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M391.186 254.116C392.225 271.274 395.943 288.222 400.458 304.955C397.102 288.08 394.181 270.917 391.186 254.116Z\\"\\r\\n\\t\\tfill=\\"url(#paint33_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M155.245 243.92C156.897 248.774 171.13 258.44 180.823 260.783C171.864 254.823 163.555 249.371 155.245 243.92Z\\"\\r\\n\\t\\tfill=\\"url(#paint34_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M189.725 181.62C198.322 187.506 207.208 193.828 215.806 199.714C208.298 192.166 199.774 185.918 190.38 180.246C190.233 180.97 190.16 181.331 189.725 181.62Z\\"\\r\\n\\t\\tfill=\\"url(#paint35_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M438.469 141.689C438.715 131.195 439.395 120.411 439.641 109.916C436.79 120.259 437.629 130.974 438.469 141.689Z\\"\\r\\n\\t\\tfill=\\"url(#paint36_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M354.742 320.537C361.887 328.012 368.96 335.849 376.105 343.324C376.54 343.035 376.614 342.674 376.975 342.747C370.773 334.334 363.193 327.147 354.742 320.537Z\\"\\r\\n\\t\\tfill=\\"url(#paint37_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M458.433 93.3918C458.967 83.332 458.993 73.9223 456.34 64.7224C455.978 64.649 455.543 64.9374 455.181 64.864C456.314 74.1321 457.373 83.762 458.433 93.3918Z\\"\\r\\n\\t\\tfill=\\"url(#paint38_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M189.415 268.551C181.824 265.128 174.595 261.779 167.004 258.356C171.046 262.565 176.252 264.751 181.023 267.225C183.046 268.389 185.578 268.902 187.748 269.342C188.037 269.778 188.545 269.128 189.415 268.551Z\\"\\r\\n\\t\\tfill=\\"url(#paint39_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M264.175 353.008C254.639 346.178 244.667 339.637 233.606 334.757C244.012 341.01 254.13 346.828 264.175 353.008Z\\"\\r\\n\\t\\tfill=\\"url(#paint40_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M252.564 283.995C245.481 279.923 238.037 275.777 230.955 271.704C230.881 272.066 230.446 272.354 230.299 273.077C233.55 275.62 237.382 277.15 240.779 278.969C244.538 280.861 248.223 283.115 251.982 285.007C252.417 284.719 252.49 284.357 252.564 283.995Z\\"\\r\\n\\t\\tfill=\\"url(#paint41_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M412.253 146.54C410.497 153.339 410.623 160.144 411.908 166.806C412.505 160.149 412.814 153.056 413.411 146.398C412.976 146.687 412.614 146.613 412.253 146.54Z\\"\\r\\n\\t\\tfill=\\"url(#paint42_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M218.068 166.279C222.545 170.2 227.31 174.556 231.787 178.477C228.401 172.894 223.997 168.611 219.085 164.979C219.011 165.341 218.503 165.991 218.068 166.279Z\\"\\r\\n\\t\\tfill=\\"url(#paint43_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M295.659 114.23C295.932 120.311 297.725 126.323 299.157 132.263C299.519 132.336 299.954 132.048 299.954 132.048C298.884 126.182 297.526 119.881 296.456 114.015C296.456 114.015 296.094 113.941 295.659 114.23Z\\"\\r\\n\\t\\tfill=\\"url(#paint44_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M174.276 272.635C177.097 273.584 180.206 274.968 183.026 275.916C183.099 275.555 183.173 275.193 183.681 274.543C180.499 273.521 177.752 272.211 174.57 271.189C174.423 271.912 174.35 272.274 174.276 272.635Z\\"\\r\\n\\t\\tfill=\\"url(#paint45_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M335.767 350.959C339.306 353.936 342.844 356.914 346.383 359.891C346.457 359.529 346.892 359.241 346.965 358.879C342.991 356.19 339.379 353.575 335.767 350.959Z\\"\\r\\n\\t\\tfill=\\"url(#paint46_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M274.127 313.224C271.453 311.552 268.706 310.242 266.033 308.57C265.959 308.932 265.959 308.932 265.524 309.22C268.198 310.892 270.945 312.202 273.618 313.875C273.692 313.513 274.054 313.586 274.127 313.224Z\\"\\r\\n\\t\\tfill=\\"url(#paint47_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M509.838 690.904C508.899 689.96 508.323 689.09 507.384 688.146C497.859 677.553 488.259 667.32 479.095 656.8C468.343 644.828 457.517 633.217 448.07 620.379C440.138 609.355 432.132 598.693 423.618 588.681C415.393 579.104 406.37 569.742 396.331 561.681C384.126 551.297 370.03 544.671 354.549 541.155C335.163 536.47 315.62 536.272 296.067 539.838C271.445 544.258 246.896 548.317 222.489 553.535C210.322 555.963 198.732 559.261 186.995 563.283C171.562 568.814 156.344 575.142 141.2 581.109C129.316 585.854 119.378 594.006 109.512 601.797C109.077 602.085 109.004 602.447 108.349 603.82C110.304 603.464 111.751 603.757 112.983 603.254C134.135 597.376 155.36 591.136 176.8 585.694C191.142 581.824 206.061 578.824 220.477 574.593C230.909 571.437 241.917 569.15 252.706 567.949C265.811 566.465 278.911 566.862 291.933 569.503C303.87 571.925 316.241 574.057 328.105 576.84C350.311 582.474 371.642 590.567 391.589 601.768C417.607 616.46 442.97 632.526 466.661 651.265C480.6 662.378 492.653 675.367 504.706 688.356C505.932 689.735 507.232 690.752 508.821 692.204C508.894 691.842 509.403 691.192 509.838 690.904ZM461.549 641.19C461.114 641.478 461.114 641.478 460.679 641.767C459.379 640.75 458.44 639.806 457.14 638.789C446.236 629.422 435.258 620.417 424.354 611.05C420.165 607.564 415.829 604.802 411.494 602.039C386.425 584.527 359.678 571.57 330.169 562.948C315.197 558.782 299.423 556.712 283.571 556.886C280.966 556.734 278.722 556.656 276.117 556.504C277.134 555.204 278.004 554.627 278.8 554.412C286.989 551.177 295.177 547.942 303.653 545.142C317.781 540.476 331.756 538.415 346.586 541.423C363.587 544.871 379.424 550.343 392.567 561.67C411.272 577.139 427.147 595.423 441.281 614.86C447.195 622.838 452.82 630.381 458.807 637.998C460.107 639.014 460.61 640.246 461.549 641.19ZM133.128 594.912C133.201 594.551 132.84 594.477 132.913 594.115C132.986 593.754 133.421 593.465 133.421 593.465C135.088 592.674 136.755 591.882 138.422 591.09C157.409 582.89 177.476 576.792 197.181 570.621C206.816 567.68 216.807 566.693 226.799 565.707C236.717 565.083 246.782 563.735 256.705 561.228C262.209 560.085 268.075 559.015 273.794 558.669C295.801 557.86 317.436 560.742 338.625 567.676C356.994 573.662 374.2 581.671 390.75 591.053C405.565 599.707 419.436 609.299 432.579 620.627C435.756 623.531 439.442 625.785 442.618 628.688C443.63 629.27 444.207 630.14 444.784 631.011C442.975 630.644 441.602 629.989 440.301 628.972C429.68 621.922 419.494 614.583 408.726 608.257C386.179 595.022 362.829 583.883 337.514 576.866C320.372 572.259 302.868 567.579 285.139 565.866C273.344 564.603 261.764 564.137 250.179 565.554C238.159 567.258 225.992 569.686 214.328 573.346C195.493 578.941 176.082 583.665 157.032 588.463C149.064 590.613 141.096 592.762 133.128 594.912ZM308.444 540.089C308.371 540.45 308.659 540.885 308.586 541.247C293.588 546.49 278.517 552.095 263.231 556.903C251.568 560.563 239.474 562.629 226.877 563.464C218.118 563.946 209.285 564.791 200.74 566.071C198.061 566.28 195.597 567.287 192.845 567.859C188.138 568.787 183.504 569.353 178.796 570.281C182.712 567.686 186.554 565.453 190.612 564.016C200.247 561.075 209.955 557.772 219.732 555.989C246.383 550.85 273.322 546.146 300.335 541.08C303.448 540.582 306.127 540.372 308.444 540.089ZM183.279 572.32C161.183 579.137 139.953 587.258 119.367 597.77C126.197 588.234 167.138 572.059 183.279 572.32Z\\"\\r\\n\\t\\tfill=\\"url(#paint48_linear)\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M676.985 286.447C667.555 293.95 658.051 301.814 648.186 309.604C627.076 326.412 607.771 345.469 588.177 364.09C568.001 383.723 551.149 405.537 536.247 428.876C522.435 450.554 509.2 473.101 499.797 497.179C495.059 509.399 490.394 521.257 487.826 533.917C484.603 547.951 481.018 561.911 478.519 576.091C476.313 588.825 475.265 601.417 477.546 614.307C478.118 617.059 479.486 619.596 480.493 622.06C480.854 622.133 481.29 621.845 481.651 621.918C481.583 620.398 481.515 618.878 481.085 617.284C479.449 606.784 480.779 596.509 483.557 586.528C491.974 552.459 509.57 523.264 531.937 496.543C542.247 484.7 553.281 473.004 564.242 461.67C568.089 457.554 572.949 454.021 576.796 449.905C593.712 431.494 610.989 413.155 624.365 391.766C635.053 374.351 644.079 355.846 652.381 337.193C659.227 322.012 666.072 306.83 674.579 292.738C675.019 290.568 676.183 288.544 676.985 286.447ZM665.144 302.122C665.505 302.196 665.505 302.196 665.794 302.631C665.647 303.354 665.574 303.716 665.065 304.366C658.513 318.101 651.961 331.836 645.336 345.933C636.017 365.885 625.901 386.052 612.823 404.113C598.728 423.473 582.394 440.873 565.049 457.691C552.348 470.179 540.297 483.175 528.896 496.679C514.591 513.361 502.672 531.279 493.352 551.232C490.585 557.449 488.179 563.74 485.412 569.957C484.908 568.726 485.129 567.64 485.349 566.555C486.664 561.926 487.691 556.862 489.368 552.307C493.31 540.302 497.324 527.935 501.989 516.077C514.448 486.217 532.039 458.904 551.58 433.116C560.297 421.704 569.953 411.234 579.681 400.403C607.993 370.369 636.665 340.408 660.788 306.888C662.528 305.734 663.98 304.146 665.144 302.122ZM662.25 301.535C662.538 301.971 662.538 301.971 662.827 302.406C662.318 303.056 661.81 303.706 661.663 304.429C645.246 325.955 627.89 346.537 609.523 366.537C597.981 378.883 585.715 391.082 574.46 403.863C563.788 415.633 553.404 427.837 544.32 441.059C533.784 455.869 523.972 470.825 515.098 486.725C504.987 505.011 496.973 524.098 490.332 543.841C487.486 552.302 485.437 560.548 482.953 569.082C482.376 568.212 482.523 567.489 482.67 566.765C485.379 555.264 487.8 543.327 491.233 531.972C494.666 520.617 498.172 508.901 502.617 498.128C511.873 474.773 524.527 453.238 537.83 432.21C552.223 409.521 568.567 388.357 587.873 369.301C604.275 353.421 619.953 337.395 637.655 322.532C645.203 315.025 653.69 308.461 662.25 301.535Z\\"\\r\\n\\t\\tfill=\\"url(#paint49_linear)\\"\\r\\n\\t/>\\r\\n\\t<defs>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint0_linear\\"\\r\\n\\t\\t\\tx1=\\"568.299\\"\\r\\n\\t\\t\\ty1=\\"436.131\\"\\r\\n\\t\\t\\tx2=\\"607\\"\\r\\n\\t\\t\\ty2=\\"1195.5\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#A78140\\" />\\r\\n\\t\\t\\t<stop offset=\\"1\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint1_linear\\"\\r\\n\\t\\t\\tx1=\\"863.208\\"\\r\\n\\t\\t\\ty1=\\"1734.39\\"\\r\\n\\t\\t\\tx2=\\"240.182\\"\\r\\n\\t\\t\\ty2=\\"-46.0365\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint2_linear\\"\\r\\n\\t\\t\\tx1=\\"830.659\\"\\r\\n\\t\\t\\ty1=\\"1745.77\\"\\r\\n\\t\\t\\tx2=\\"207.637\\"\\r\\n\\t\\t\\ty2=\\"-34.6446\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint3_linear\\"\\r\\n\\t\\t\\tx1=\\"912.073\\"\\r\\n\\t\\t\\ty1=\\"1717.29\\"\\r\\n\\t\\t\\tx2=\\"289.045\\"\\r\\n\\t\\t\\ty2=\\"-63.1357\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint4_linear\\"\\r\\n\\t\\t\\tx1=\\"826.084\\"\\r\\n\\t\\t\\ty1=\\"1747.38\\"\\r\\n\\t\\t\\tx2=\\"203.058\\"\\r\\n\\t\\t\\ty2=\\"-33.0482\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint5_linear\\"\\r\\n\\t\\t\\tx1=\\"939.097\\"\\r\\n\\t\\t\\ty1=\\"1707.84\\"\\r\\n\\t\\t\\tx2=\\"316.07\\"\\r\\n\\t\\t\\ty2=\\"-72.5899\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint6_linear\\"\\r\\n\\t\\t\\tx1=\\"826.902\\"\\r\\n\\t\\t\\ty1=\\"1747.09\\"\\r\\n\\t\\t\\tx2=\\"203.877\\"\\r\\n\\t\\t\\ty2=\\"-33.3301\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint7_linear\\"\\r\\n\\t\\t\\tx1=\\"877.18\\"\\r\\n\\t\\t\\ty1=\\"1729.5\\"\\r\\n\\t\\t\\tx2=\\"254.153\\"\\r\\n\\t\\t\\ty2=\\"-50.9311\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint8_linear\\"\\r\\n\\t\\t\\tx1=\\"678.557\\"\\r\\n\\t\\t\\ty1=\\"1799.01\\"\\r\\n\\t\\t\\tx2=\\"55.528\\"\\r\\n\\t\\t\\ty2=\\"18.5818\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint9_linear\\"\\r\\n\\t\\t\\tx1=\\"759.073\\"\\r\\n\\t\\t\\ty1=\\"1770.82\\"\\r\\n\\t\\t\\tx2=\\"136.048\\"\\r\\n\\t\\t\\ty2=\\"-9.5978\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint10_linear\\"\\r\\n\\t\\t\\tx1=\\"918.157\\"\\r\\n\\t\\t\\ty1=\\"1715.16\\"\\r\\n\\t\\t\\tx2=\\"295.131\\"\\r\\n\\t\\t\\ty2=\\"-65.2689\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint11_linear\\"\\r\\n\\t\\t\\tx1=\\"885.264\\"\\r\\n\\t\\t\\ty1=\\"1726.67\\"\\r\\n\\t\\t\\tx2=\\"262.241\\"\\r\\n\\t\\t\\ty2=\\"-53.7515\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint12_linear\\"\\r\\n\\t\\t\\tx1=\\"843.209\\"\\r\\n\\t\\t\\ty1=\\"1741.39\\"\\r\\n\\t\\t\\tx2=\\"220.184\\"\\r\\n\\t\\t\\ty2=\\"-39.0322\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint13_linear\\"\\r\\n\\t\\t\\tx1=\\"725.117\\"\\r\\n\\t\\t\\ty1=\\"1782.72\\"\\r\\n\\t\\t\\tx2=\\"102.09\\"\\r\\n\\t\\t\\ty2=\\"2.2924\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint14_linear\\"\\r\\n\\t\\t\\tx1=\\"987.161\\"\\r\\n\\t\\t\\ty1=\\"1691.02\\"\\r\\n\\t\\t\\tx2=\\"364.134\\"\\r\\n\\t\\t\\ty2=\\"-89.4134\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint15_linear\\"\\r\\n\\t\\t\\tx1=\\"871.647\\"\\r\\n\\t\\t\\ty1=\\"1731.44\\"\\r\\n\\t\\t\\tx2=\\"248.622\\"\\r\\n\\t\\t\\ty2=\\"-48.9836\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint16_linear\\"\\r\\n\\t\\t\\tx1=\\"1003.73\\"\\r\\n\\t\\t\\ty1=\\"1685.21\\"\\r\\n\\t\\t\\tx2=\\"380.706\\"\\r\\n\\t\\t\\ty2=\\"-95.2057\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint17_linear\\"\\r\\n\\t\\t\\tx1=\\"919.449\\"\\r\\n\\t\\t\\ty1=\\"1714.72\\"\\r\\n\\t\\t\\tx2=\\"296.421\\"\\r\\n\\t\\t\\ty2=\\"-65.7121\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint18_linear\\"\\r\\n\\t\\t\\tx1=\\"842.49\\"\\r\\n\\t\\t\\ty1=\\"1741.64\\"\\r\\n\\t\\t\\tx2=\\"219.464\\"\\r\\n\\t\\t\\ty2=\\"-38.7804\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint19_linear\\"\\r\\n\\t\\t\\tx1=\\"957.598\\"\\r\\n\\t\\t\\ty1=\\"1701.36\\"\\r\\n\\t\\t\\tx2=\\"334.573\\"\\r\\n\\t\\t\\ty2=\\"-79.0631\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint20_linear\\"\\r\\n\\t\\t\\tx1=\\"1018.69\\"\\r\\n\\t\\t\\ty1=\\"1679.99\\"\\r\\n\\t\\t\\tx2=\\"395.658\\"\\r\\n\\t\\t\\ty2=\\"-100.445\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint21_linear\\"\\r\\n\\t\\t\\tx1=\\"850.122\\"\\r\\n\\t\\t\\ty1=\\"1738.97\\"\\r\\n\\t\\t\\tx2=\\"227.096\\"\\r\\n\\t\\t\\ty2=\\"-41.4558\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint22_linear\\"\\r\\n\\t\\t\\tx1=\\"927.365\\"\\r\\n\\t\\t\\ty1=\\"1711.94\\"\\r\\n\\t\\t\\tx2=\\"304.338\\"\\r\\n\\t\\t\\ty2=\\"-68.4866\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint23_linear\\"\\r\\n\\t\\t\\tx1=\\"985.121\\"\\r\\n\\t\\t\\ty1=\\"1691.73\\"\\r\\n\\t\\t\\tx2=\\"362.094\\"\\r\\n\\t\\t\\ty2=\\"-88.6958\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint24_linear\\"\\r\\n\\t\\t\\tx1=\\"870.437\\"\\r\\n\\t\\t\\ty1=\\"1731.87\\"\\r\\n\\t\\t\\tx2=\\"247.41\\"\\r\\n\\t\\t\\ty2=\\"-48.563\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint25_linear\\"\\r\\n\\t\\t\\tx1=\\"774.838\\"\\r\\n\\t\\t\\ty1=\\"1765.32\\"\\r\\n\\t\\t\\tx2=\\"151.811\\"\\r\\n\\t\\t\\ty2=\\"-15.1114\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint26_linear\\"\\r\\n\\t\\t\\tx1=\\"866.759\\"\\r\\n\\t\\t\\ty1=\\"1733.16\\"\\r\\n\\t\\t\\tx2=\\"243.73\\"\\r\\n\\t\\t\\ty2=\\"-47.2785\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint27_linear\\"\\r\\n\\t\\t\\tx1=\\"676.098\\"\\r\\n\\t\\t\\ty1=\\"1799.87\\"\\r\\n\\t\\t\\tx2=\\"53.0745\\"\\r\\n\\t\\t\\ty2=\\"19.4384\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint28_linear\\"\\r\\n\\t\\t\\tx1=\\"896.405\\"\\r\\n\\t\\t\\ty1=\\"1722.78\\"\\r\\n\\t\\t\\tx2=\\"273.376\\"\\r\\n\\t\\t\\ty2=\\"-57.6513\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint29_linear\\"\\r\\n\\t\\t\\tx1=\\"804.335\\"\\r\\n\\t\\t\\ty1=\\"1754.99\\"\\r\\n\\t\\t\\tx2=\\"181.311\\"\\r\\n\\t\\t\\ty2=\\"-25.4356\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint30_linear\\"\\r\\n\\t\\t\\tx1=\\"913.365\\"\\r\\n\\t\\t\\ty1=\\"1716.84\\"\\r\\n\\t\\t\\tx2=\\"290.34\\"\\r\\n\\t\\t\\ty2=\\"-63.587\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint31_linear\\"\\r\\n\\t\\t\\tx1=\\"996.364\\"\\r\\n\\t\\t\\ty1=\\"1687.79\\"\\r\\n\\t\\t\\tx2=\\"373.339\\"\\r\\n\\t\\t\\ty2=\\"-92.6289\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint32_linear\\"\\r\\n\\t\\t\\tx1=\\"788.634\\"\\r\\n\\t\\t\\ty1=\\"1760.48\\"\\r\\n\\t\\t\\tx2=\\"165.608\\"\\r\\n\\t\\t\\ty2=\\"-19.9395\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint33_linear\\"\\r\\n\\t\\t\\tx1=\\"900.279\\"\\r\\n\\t\\t\\ty1=\\"1721.42\\"\\r\\n\\t\\t\\tx2=\\"277.253\\"\\r\\n\\t\\t\\ty2=\\"-59.0073\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint34_linear\\"\\r\\n\\t\\t\\tx1=\\"705.878\\"\\r\\n\\t\\t\\ty1=\\"1789.43\\"\\r\\n\\t\\t\\tx2=\\"82.8561\\"\\r\\n\\t\\t\\ty2=\\"9.02123\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint35_linear\\"\\r\\n\\t\\t\\tx1=\\"756.065\\"\\r\\n\\t\\t\\ty1=\\"1771.87\\"\\r\\n\\t\\t\\tx2=\\"133.042\\"\\r\\n\\t\\t\\ty2=\\"-8.5436\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint36_linear\\"\\r\\n\\t\\t\\tx1=\\"987.063\\"\\r\\n\\t\\t\\ty1=\\"1691.04\\"\\r\\n\\t\\t\\tx2=\\"364.041\\"\\r\\n\\t\\t\\ty2=\\"-89.3766\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint37_linear\\"\\r\\n\\t\\t\\tx1=\\"857.316\\"\\r\\n\\t\\t\\ty1=\\"1736.44\\"\\r\\n\\t\\t\\tx2=\\"234.296\\"\\r\\n\\t\\t\\ty2=\\"-43.9718\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint38_linear\\"\\r\\n\\t\\t\\tx1=\\"1017.91\\"\\r\\n\\t\\t\\ty1=\\"1680.26\\"\\r\\n\\t\\t\\tx2=\\"394.887\\"\\r\\n\\t\\t\\ty2=\\"-100.175\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint39_linear\\"\\r\\n\\t\\t\\tx1=\\"711.409\\"\\r\\n\\t\\t\\ty1=\\"1787.5\\"\\r\\n\\t\\t\\tx2=\\"88.3875\\"\\r\\n\\t\\t\\ty2=\\"7.08408\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint40_linear\\"\\r\\n\\t\\t\\tx1=\\"749.518\\"\\r\\n\\t\\t\\ty1=\\"1774.18\\"\\r\\n\\t\\t\\tx2=\\"126.489\\"\\r\\n\\t\\t\\ty2=\\"-6.25297\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint41_linear\\"\\r\\n\\t\\t\\tx1=\\"763.1\\"\\r\\n\\t\\t\\ty1=\\"1769.42\\"\\r\\n\\t\\t\\tx2=\\"140.075\\"\\r\\n\\t\\t\\ty2=\\"-11.0036\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint42_linear\\"\\r\\n\\t\\t\\tx1=\\"953.685\\"\\r\\n\\t\\t\\ty1=\\"1702.71\\"\\r\\n\\t\\t\\tx2=\\"330.665\\"\\r\\n\\t\\t\\ty2=\\"-77.697\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint43_linear\\"\\r\\n\\t\\t\\tx1=\\"781.626\\"\\r\\n\\t\\t\\ty1=\\"1762.95\\"\\r\\n\\t\\t\\tx2=\\"158.597\\"\\r\\n\\t\\t\\ty2=\\"-17.4867\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint44_linear\\"\\r\\n\\t\\t\\tx1=\\"862.217\\"\\r\\n\\t\\t\\ty1=\\"1734.74\\"\\r\\n\\t\\t\\tx2=\\"239.192\\"\\r\\n\\t\\t\\ty2=\\"-45.6902\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint45_linear\\"\\r\\n\\t\\t\\tx1=\\"708.797\\"\\r\\n\\t\\t\\ty1=\\"1788.4\\"\\r\\n\\t\\t\\tx2=\\"85.7818\\"\\r\\n\\t\\t\\ty2=\\"7.99883\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint46_linear\\"\\r\\n\\t\\t\\tx1=\\"828.178\\"\\r\\n\\t\\t\\ty1=\\"1746.65\\"\\r\\n\\t\\t\\tx2=\\"205.153\\"\\r\\n\\t\\t\\ty2=\\"-33.7786\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint47_linear\\"\\r\\n\\t\\t\\tx1=\\"778.175\\"\\r\\n\\t\\t\\ty1=\\"1764.13\\"\\r\\n\\t\\t\\tx2=\\"155.157\\"\\r\\n\\t\\t\\ty2=\\"-16.2773\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint48_linear\\"\\r\\n\\t\\t\\tx1=\\"708.61\\"\\r\\n\\t\\t\\ty1=\\"1789.19\\"\\r\\n\\t\\t\\tx2=\\"85.5847\\"\\r\\n\\t\\t\\ty2=\\"8.76404\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t\\t<linearGradient\\r\\n\\t\\t\\tid=\\"paint49_linear\\"\\r\\n\\t\\t\\tx1=\\"1008.75\\"\\r\\n\\t\\t\\ty1=\\"1684.16\\"\\r\\n\\t\\t\\tx2=\\"385.726\\"\\r\\n\\t\\t\\ty2=\\"-96.2663\\"\\r\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\r\\n\\t\\t>\\r\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\r\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\r\\n\\t\\t</linearGradient>\\r\\n\\t</defs>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg {\\n  width: 35%;\\n  position: absolute;\\n  bottom: 0;\\n  right: 6%;\\n}\\n@media only screen and (max-width: 1280px) {\\n  svg {\\n    width: auto;\\n    height: 45%;\\n    right: 30%;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  svg {\\n    height: 40%;\\n    right: 25%;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  svg {\\n    height: 40%;\\n    right: 25%;\\n  }\\n}\\n\\n.back {\\n  opacity: 0.3;\\n}</style>\\r\\n"],"names":[],"mappings":"AAg3BmB,GAAG,eAAC,CAAC,AACtB,KAAK,CAAE,GAAG,CACV,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,EAAE,AACX,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,GAAG,eAAC,CAAC,AACH,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,GAAG,eAAC,CAAC,AACH,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,GAAG,eAAC,CAAC,AACH,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC,AAED,KAAK,eAAC,CAAC,AACL,OAAO,CAAE,GAAG,AACd,CAAC"}`
};
var Flower = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "" } = $$props;
  import_gsap.gsap.registerPlugin(import_ScrollTrigger.ScrollTrigger);
  let flower;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$e);
  return `<svg class="${escape(null_to_empty(type)) + " svelte-1b8qfn3"}" viewBox="${"0 0 771 981"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"${add_attribute("this", flower, 0)}><path d="${"M584.95 885.022C591.169 913.775 596.156 943.032 597.306 972.639L596.5 977.5L595.153 980C595.03 976.872 594.882 973.742 594.706 970.606C593.315 949.611 590.043 928.611 586.409 907.537C575.784 848.516 559.509 791.362 531.135 738.155C522.709 722.136 515.081 705.901 507.091 689.593C504.427 684.157 502.052 679.156 499.751 673.794C486.727 645.167 475.659 616.184 466.331 586.047C458.797 561.923 453.291 537.081 449.305 512.17C446.179 490.447 443.2 468 440.148 445.915C438.732 434.329 436.88 423.033 435.464 411.447C435.249 410.651 435.758 410.001 435.905 409.277C436.843 410.221 437.058 411.018 437.273 411.814C440.755 435.493 445.034 458.957 447.793 482.489C452.398 519.2 459.32 555.627 470.662 590.691C475.758 606.412 481.216 622.207 487.183 637.351C494.874 656.988 503.289 676.771 513.445 695.401C518.845 705.911 523.448 716.637 528.487 727.074C538.49 748.309 548.929 769.256 558.062 791.068C570.792 821.142 578.233 853.155 584.95 885.022Z"}" fill="${"url(#paint0_linear)"}"></path><path d="${"M438.047 429.701C438.702 428.327 439.358 426.954 439.143 426.157C437.58 415.295 442.093 406.042 446.244 396.716C451.05 386.016 455.857 375.317 460.951 365.052C466.119 354.426 469.841 343.506 472.188 331.931C475.191 318.983 479.568 306.69 484.306 294.47C489.919 279.792 495.821 265.548 501.796 250.943C503.835 246.461 506.236 242.052 507.913 237.496C518.7 210.31 536.857 187.631 554.003 164.37C559.669 156.858 565.262 149.707 570.278 141.686C573.041 137.351 574.791 132.433 576.83 127.951C576.977 127.228 577.412 126.939 577.559 126.216C577.711 123.61 578.659 120.79 575.986 119.118C573.674 117.519 571.21 118.526 569.396 120.041C567.074 122.206 564.39 124.298 562.791 126.61C552.109 142.143 538.973 154.919 525.763 168.057C518.797 174.553 512.119 181.483 505.729 188.849C494.622 200.907 485.9 214.202 480.139 229.603C479.411 231.339 478.756 232.712 477.304 234.301C477.177 227.496 477.051 220.692 477.287 213.961C477.553 195.938 477.531 177.481 477.797 159.458C478.268 145.996 479.1 132.607 479.571 119.145C479.749 107.13 480 94.7534 479.454 82.5915C479.249 78.0308 478.032 72.8883 476.669 68.4693C472.789 57.8908 461.576 55.6164 453.519 63.7738C450.689 66.589 448.146 69.8393 446.328 73.2364C438.476 85.9545 429.035 97.2205 418.583 107.905C411.035 115.412 404.136 123.428 396.803 131.732C396.373 130.138 395.87 128.906 395.44 127.313C392.572 117.316 388.037 108.111 380.891 100.636C373.095 92.653 363.628 87.3433 353.143 83.3337C345.767 80.7078 338.098 79.5288 330.135 79.7967C320.652 80.1328 313.114 83.8762 308.098 91.8971C305.335 96.2326 302.861 101.003 299.737 105.265C293.851 113.863 287.676 122.025 281.789 130.623C274.886 140.521 267.621 150.345 263.03 161.841C261.945 161.621 261.51 161.91 260.786 161.763C245.311 156.364 230.612 158.279 216.044 165.116C211.117 167.129 206.766 170.012 202.127 172.461C196.617 175.486 191.035 178.873 185.237 181.463C173.715 186.281 165.947 194.873 160.705 205.861C154.3 218.873 153.394 232.623 155.093 246.525C156.856 263.83 161.879 279.912 169.654 295.424C161.43 311.832 150.606 326.207 132.925 333.542C126.765 336.059 120.459 339.299 114.153 342.539C110.311 344.772 106.756 347.441 104.429 351.488C101.808 356.982 103.533 361.474 109.247 363.01C115.323 364.619 121.472 365.866 127.768 366.39C150.708 368.407 174.083 370.135 196.798 375.119C210.108 378.195 223.272 381.995 236.435 385.795C247.428 389.154 258.783 392.587 269.629 396.67C281.922 401.046 294.142 405.785 306.362 410.523C323.934 416.723 341.213 424.37 359.734 427.75C372.106 429.883 384.194 429.699 396.146 426.474C404.476 424.398 412.806 422.321 421.492 422.2C427.138 422.215 432.055 423.966 436.605 427.525C436.747 428.684 437.035 429.119 438.047 429.701ZM285.577 254.915C292.015 256.597 297.44 257.698 302.793 259.16C314.436 263.028 325.932 267.619 336.7 273.946C343.133 277.51 349.057 281.725 354.907 286.301C359.169 289.425 361.329 293.629 362.472 299.133C366.038 318.686 372.068 337.233 380.053 355.422C388.473 373.324 398.634 390.072 414.089 402.998C416.039 404.524 416.757 406.552 415.882 409.011C414.493 414.002 411.081 417.829 406.515 419.915C393.106 426.611 379.057 429.033 364.006 427.11C347.509 424.894 331.745 419.061 316.417 412.939C304.197 408.201 291.977 403.462 279.684 399.086C267.029 394.636 254.736 390.26 242.007 386.172C231.376 382.886 221.106 379.673 210.328 377.11C199.188 374.474 187.975 372.199 176.327 370.213C166.487 368.594 156.863 367.772 146.876 366.876C136.89 365.98 126.903 365.085 116.99 363.827C114.023 363.602 110.914 362.218 107.732 361.196C104.624 359.812 104.194 358.219 104.854 354.963C105.514 351.708 107.978 350.701 110.73 350.13C118.116 348.992 125.938 347.565 133.324 346.427C145.344 344.723 156.573 341.351 167.23 335.228C180.062 327.662 191.091 317.848 200.605 306.221C206.559 299.143 212.226 291.631 218.18 284.553C225.514 276.249 232.847 267.945 241.695 261.455C249.6 255.903 258.15 252.741 267.56 252.767C274.652 253.076 280.44 254.249 285.577 254.915ZM363.112 223.567C364.354 219.3 365.822 212.065 368.374 205.051C373.914 190.734 382.49 178.163 393.089 166.755C405.575 153.471 417.772 139.751 429.608 125.958C440.427 113.465 447.199 98.6452 450.139 82.2946C451.02 77.9541 453.059 73.4718 454.301 69.2046C456.051 64.2873 459.82 62.4156 464.743 62.2843C469.303 62.0795 472.407 65.3452 473.844 69.4026C475.354 73.0982 477.005 77.9524 477.21 82.5131C477.541 93.8781 477.872 105.243 477.479 116.461C476.998 133.687 475.359 151.055 475.313 167.992C474.56 205.123 474.966 242.112 474.287 278.88C474.11 290.895 472.774 303.052 472.234 314.994C471.852 322.448 469.588 329.898 467.759 337.059C463.802 354.709 456.087 370.468 445.624 384.916C442.427 389.54 438.144 393.944 434.009 397.624C427.624 403.108 417.706 403.732 409.91 395.749C401.753 387.692 394.901 378.77 389.427 368.622C375.308 343.539 367.275 316.301 362.43 288.203C359.011 267.926 358.344 247.078 363.112 223.567ZM359.971 287.328C355.421 283.769 351.159 280.645 347.185 277.956C327.893 265.381 306.924 257.362 284.644 252.089C279.653 250.701 276.33 248.52 273.808 244.243C265.592 230.902 261.796 216.198 260.028 200.775C259.252 193.462 259.273 185.935 260.813 178.339C262.726 167.052 267.097 156.641 273.566 147.031C285.123 129.04 298.993 112.646 309.901 94.1459C313.974 87.0634 320.715 83.535 329.113 82.9788C338.234 82.5693 346.627 83.895 354.941 87.4644C364.703 91.3273 373.809 96.5636 380.446 104.689C388.383 113.83 392.625 124.482 394.764 136.214C363.66 181.876 352.665 232.369 359.971 287.328ZM261.499 165.673C253.166 195.617 258.955 222.777 274.301 249.238C272.057 249.16 270.175 249.155 268.293 249.15C261.201 248.841 254.255 247.809 247.377 248.297C216.176 249.876 190.086 261.532 173.433 289.788C172.852 290.8 171.835 292.1 170.818 293.4C169.953 292.095 169.449 290.863 168.873 289.993C163.766 278.036 159.456 265.864 157.537 253.047C156.257 244.502 155.701 236.104 156.665 227.638C157.776 218.448 160.622 209.987 165.276 201.893C168.767 195.822 173.196 190.695 179.502 187.455C190.883 181.478 201.901 175.428 213.282 169.451C224.227 163.762 235.744 160.826 247.901 162.162C252.388 162.319 257.237 162.549 261.499 165.673ZM259.602 251.153C259.167 251.441 258.732 251.729 258.37 251.656C246.491 254.519 237.208 261.298 229.078 269.817C221.891 277.398 215.355 285.487 208.53 293.141C203.084 299.568 197.999 306.069 192.265 312.061C174.988 330.399 154.471 342.431 128.842 344.388C124.208 344.955 119.862 345.956 115.228 346.523C114.431 346.738 113.272 346.879 112.187 346.659C114.871 344.567 117.482 342.837 120.381 341.542C125.381 339.167 130.309 337.154 135.31 334.779C146.979 329.237 156.556 321.012 163.317 309.955C167.825 302.585 172.259 295.575 176.767 288.205C181.128 281.557 185.851 274.983 192.162 269.861C211.605 253.845 234.78 249.131 259.602 251.153ZM476.229 310.155C476.353 290.974 476.693 272.59 476.671 254.132C476.706 240.958 480.936 229.388 489.721 219.496C499.959 208.015 512.073 198.421 523.825 188.753C538.261 176.994 549.3 163.416 555.501 145.844C558.127 138.468 562.199 131.386 567.211 125.247C569.171 123.008 571.131 120.77 574.749 121.503C576.405 124.476 575.457 127.296 574.22 129.681C571.672 134.813 569.198 139.584 566.001 144.208C559.606 153.455 552.561 162.195 545.878 171.007C532.873 188.706 519.868 206.404 510.187 226.283C499.778 247.897 491.103 270.24 482.502 292.221C480.532 298.224 478.634 303.864 476.229 310.155ZM449.295 73.4616C449.363 74.9818 449.29 75.3436 449.216 75.7053C446.13 92.7793 440.008 108.108 429.33 121.759C418.071 136.422 405.512 150.069 392.664 163.28C384.099 172.087 376.907 181.55 371.304 192.464C370.14 194.488 368.977 196.511 367.813 198.535C367.451 198.462 367.09 198.388 366.801 197.953C370.156 188.842 373.148 179.658 376.864 170.62C386.771 147.774 400.724 127.255 418.94 109.86C429.318 99.5376 439.047 88.7066 446.464 76.2769C447.261 76.0619 448.131 75.4852 449.295 73.4616ZM489.008 215.585C489.008 215.585 489.155 214.862 489.228 214.5C490.465 212.115 491.991 210.165 493.228 207.779C502.243 193.038 515.374 182.144 526.555 169.724C534.685 161.205 543.177 152.759 551.307 144.24C551.815 143.59 552.612 143.375 553.991 142.148C553.116 144.607 552.46 145.981 551.805 147.354C546.847 160.659 539.288 171.93 528.045 180.948C524.417 183.978 521.078 187.443 517.451 190.473C508.162 199.134 498.585 207.36 489.008 215.585Z"}" fill="${"url(#paint1_linear)"}"></path><path d="${"M418.267 410.248C417.182 410.028 415.809 409.373 414.65 409.514C390.478 408.001 369.514 398.1 349.499 385.378C337.142 377.6 324.933 369.098 312.65 360.957C303.402 354.562 294.154 348.168 284.76 342.496C291.622 347.654 298.338 353.535 305.274 358.331C317.483 366.833 330.055 375.409 342.338 383.549C354.259 391.616 366.4 398.598 379.705 403.556C391.563 408.221 403.788 411.077 416.527 411.401C416.889 411.475 417.324 411.186 417.685 411.26C418.12 410.971 418.194 410.61 418.267 410.248Z"}" fill="${"url(#paint2_linear)"}"></path><path d="${"M393.384 191.294C393.295 197.301 393.28 202.947 393.191 208.955C393.517 222.202 393.119 235.302 394.315 247.972C395.512 260.643 397.358 273.821 400.147 286.062C405.155 307.79 411.395 329.016 417.272 350.167C417.487 350.964 418.064 351.834 419.003 352.778C418.573 351.184 418.504 349.664 418.001 348.432C412.343 326.195 406.324 303.885 401.028 281.721C395.947 260.354 394.776 238.274 395.126 216.126C395.293 207.875 394.737 199.477 394.469 191.514C394.181 191.079 393.819 191.006 393.384 191.294Z"}" fill="${"url(#paint3_linear)"}"></path><path d="${"M359.418 410.739C365.783 412.783 372 415.551 378.076 417.16C384.513 418.842 390.736 419.728 397.1 421.772C388.917 423.125 381.321 421.584 373.363 419.97C351.66 415.568 331.414 407.695 311.897 398.088C311.247 397.579 310.524 397.433 309.292 397.936C317.171 401.794 325.05 405.651 332.568 409.436C346.738 415.699 361.636 420.228 376.828 423.309C380.807 424.116 384.86 424.561 388.624 424.572C393.111 424.729 397.31 424.45 402.594 424.392C402.091 423.161 401.441 422.652 401.226 421.855C402.384 421.714 403.904 421.645 405.063 421.504C405.136 421.142 405.21 420.78 405.21 420.78C400.072 420.115 394.935 419.45 390.232 418.496C384.807 417.395 379.816 416.006 374.464 414.544C369.473 413.155 364.482 411.766 359.13 410.304C359.492 410.378 359.492 410.378 359.418 410.739Z"}" fill="${"url(#paint4_linear)"}"></path><path d="${"M457.158 242.642C458.281 255.674 459.765 268.78 460.815 282.173C461.859 297.449 461.745 312.866 460.183 327.99C458.25 346.804 453.785 365.105 444.403 381.655C444.329 382.017 444.183 382.741 444.833 383.249C448.182 376.02 451.82 369.226 454.445 361.85C462.837 337.19 464.208 311.86 462.613 286.304C461.637 272.549 459.503 258.935 457.803 245.033C457.95 244.309 457.735 243.512 457.158 242.642Z"}" fill="${"url(#paint5_linear)"}"></path><path d="${"M309.979 251.579C309.114 250.274 308.611 249.042 307.673 248.099C297.942 232.944 289.879 216.998 282.612 200.837C276.352 187.139 272.555 172.435 271.438 157.521C271.155 155.204 271.16 153.322 270.877 151.005C269.346 154.837 269.336 158.601 269.687 162.438C271.743 178.296 275.54 193 282.811 207.279C289.795 221.123 296.27 235.618 305.791 248.093C307.017 249.472 307.882 250.777 308.674 252.444C309.183 251.794 309.544 251.868 309.979 251.579Z"}" fill="${"url(#paint6_linear)"}"></path><path d="${"M417.784 401.488C417.208 400.618 416.993 399.821 416.343 399.313C404.437 385.6 397.17 369.439 392.079 351.836C387.632 336.624 383.909 321.558 379.825 306.419C379.395 304.825 378.892 303.593 378.026 302.288C379.385 308.589 380.308 315.178 382.101 321.191C386.18 338.212 390.622 355.307 397.092 371.683C401.045 381.899 406.812 390.601 413.811 398.799C414.676 400.105 415.976 401.122 417.276 402.138C417.276 402.138 417.711 401.85 417.784 401.488Z"}" fill="${"url(#paint7_linear)"}"></path><path d="${"M121.23 348.493C123.112 348.499 125.356 348.577 127.238 348.582C136.359 348.173 145.26 348.848 154.377 350.321C163.131 351.72 171.959 352.757 180.205 354.806C192.792 357.736 205.667 361.101 218.254 364.03C221.147 364.617 224.041 365.204 226.573 365.718C204.084 357.767 180.645 352.636 156.987 348.591C147.509 347.045 137.738 346.946 128.04 346.485C125.796 346.407 123.406 347.052 120.654 347.623C121.015 347.697 121.304 348.132 121.23 348.493Z"}" fill="${"url(#paint8_linear)"}"></path><path d="${"M193.308 221.512C200.678 226.02 207.614 230.816 214.985 235.324C222.067 239.397 229.512 243.543 236.956 247.689C226.031 245.85 216.783 239.455 206.084 234.649C212.584 239.733 219.09 242.936 225.669 245.776C228.054 247.013 230.948 247.6 233.333 248.837C235.719 250.074 238.036 249.791 239.923 247.914C243.467 249.01 246.722 249.67 250.266 250.765C250.339 250.404 250.486 249.68 250.921 249.392C230.308 243.328 212.316 231.77 194.686 220.286C193.816 220.862 193.743 221.224 193.308 221.512Z"}" fill="${"url(#paint9_linear)"}"></path><path d="${"M452.874 300.899C454.009 336.153 447.474 370.227 428.426 401.011C429.37 400.072 429.878 399.422 430.822 398.484C436.996 390.321 441.509 381.069 444.649 371.161C447.5 360.818 450.713 350.548 452.84 340.058C455.408 327.398 455.444 314.224 453.959 301.119C454.033 300.757 453.671 300.684 453.745 300.322C453.021 300.176 452.948 300.537 452.874 300.899Z"}" fill="${"url(#paint10_linear)"}"></path><path d="${"M335.695 137.791C338.71 147.064 341.725 156.337 345.175 165.322C350.423 178.438 351.761 192.266 353.172 205.734C354.588 217.319 355.208 229.119 356.55 241.066C356.555 239.184 356.487 237.663 356.492 235.782C355.463 214.86 354.796 194.012 349.495 173.73C346.779 161.128 342.034 149.244 335.695 137.791Z"}" fill="${"url(#paint11_linear)"}"></path><path d="${"M304.429 269.66C327.338 282.968 350.247 296.277 367.417 317.459C367.852 317.171 367.852 317.171 368.287 316.883C367.71 316.012 367.569 314.854 366.919 314.345C361.938 309.193 357.105 303.317 351.254 298.74C337.823 286.978 322.646 278.251 306.526 270.462C306.311 269.665 305.152 269.807 304.429 269.66Z"}" fill="${"url(#paint12_linear)"}"></path><path d="${"M182.604 324.412C209.513 331 233.507 344.528 258.665 356.033C255.991 354.361 253.606 353.124 250.933 351.452C248.259 349.78 245.874 348.543 243.127 347.233C229.392 340.681 216.018 334.202 202.137 328.374C196.931 326.188 191.505 325.088 186.153 323.625C185.068 323.405 183.909 323.547 183.186 323.4C182.316 323.977 182.604 324.412 182.604 324.412Z"}" fill="${"url(#paint13_linear)"}"></path><path d="${"M462.589 162.022C463.299 193.8 471.033 224.367 474.495 255.574C474.857 255.647 475.292 255.359 475.654 255.432C474.306 245.367 473.031 234.94 471.684 224.876C470.047 214.376 468.411 203.876 466.775 193.376C465.139 182.876 463.864 172.449 462.589 162.022Z"}" fill="${"url(#paint14_linear)"}"></path><path d="${"M358.618 279.145C351.451 253.212 345.515 226.776 340.737 200.199C340.449 199.763 340.161 199.328 339.872 198.893C343.706 226.409 349.207 253.134 358.618 279.145Z"}" fill="${"url(#paint15_linear)"}"></path><path d="${"M485.265 287.886C489.935 274.146 494.678 260.044 499.348 246.304C504.018 232.564 509.338 219.332 516.105 206.394C500.401 231.83 493.158 260.112 485.265 287.886Z"}" fill="${"url(#paint16_linear)"}"></path><path d="${"M339.975 81.4159C341.123 85.0382 344.52 86.857 346.612 89.5408C348.704 92.2247 350.795 94.9086 352.526 97.5191C354.617 100.203 356.636 103.249 358.293 106.221C360.023 108.831 362.041 111.877 363.698 114.849C365.355 117.821 366.938 121.155 368.595 124.127C369.89 127.026 371.473 130.36 372.695 133.621C373.375 122.837 350.024 85.7138 339.975 81.4159Z"}" fill="${"url(#paint17_linear)"}"></path><path d="${"M300.73 219.199C305.753 235.282 314.619 249.131 324.716 262.477C327.961 266.901 331.641 271.037 337.135 273.658C337.282 272.934 337.429 272.211 337.067 272.137C324.213 261.245 316.217 246.819 307.787 232.681C305.265 228.404 303.178 223.838 300.73 219.199Z"}" fill="${"url(#paint18_linear)"}"></path><path d="${"M420.356 201.284C420.779 178.774 418.523 156.474 421.264 133.681C419.303 135.919 418.355 138.739 418.271 142.865C417.496 161.538 418.53 180.577 419.711 198.893C419.926 199.69 420.141 200.487 420.356 201.284Z"}" fill="${"url(#paint19_linear)"}"></path><path d="${"M465.224 124.897C468.442 112.745 466.101 68.5853 460.911 60.7538C460.748 67.123 462.762 72.0506 462.82 77.3347C463.239 82.6922 463.733 87.6879 464.152 93.0454C464.572 98.4029 464.63 103.687 464.976 109.406C465.108 114.329 465.166 119.613 465.224 124.897Z"}" fill="${"url(#paint20_linear)"}"></path><path d="${"M382.36 358.903C369.888 340.556 353.568 326.325 335.869 313.32C351.681 328.202 368.436 342.145 382.36 358.903Z"}" fill="${"url(#paint21_linear)"}"></path><path d="${"M430.381 320.816C430.741 294.903 426.908 267.387 422.712 239.798C425.314 267.817 427.989 295.475 430.381 320.816Z"}" fill="${"url(#paint22_linear)"}"></path><path d="${"M495.395 236.087C486.217 257.198 484.2 280.138 479.651 302.564C482.287 291.424 484.85 280.646 487.486 269.506C489.761 258.293 492.397 247.153 495.395 236.087Z"}" fill="${"url(#paint23_linear)"}"></path><path d="${"M404.857 390.958C393.753 375.148 387.649 356.963 380.75 338.993C380.891 340.152 381.321 341.746 381.463 342.904C385.191 356.088 389.789 368.695 396.343 380.946C397.638 383.845 399.729 386.528 401.459 389.139C402.398 390.082 403.336 391.026 404.275 391.97C404.348 391.608 404.421 391.246 404.857 390.958Z"}" fill="${"url(#paint24_linear)"}"></path><path d="${"M232.847 267.945C248.532 276.022 263.709 284.75 278.23 294.85C264.799 283.088 249.769 273.637 232.847 267.945Z"}" fill="${"url(#paint25_linear)"}"></path><path d="${"M311.121 151.259C307.398 136.194 303.963 121.563 300.529 106.932C298.416 111.776 305.212 141.399 311.121 151.259Z"}" fill="${"url(#paint26_linear)"}"></path><path d="${"M145.926 343.711C160.83 346.357 176.095 349.077 189.913 351.503C179.502 347.132 153.747 342.284 145.926 343.711Z"}" fill="${"url(#paint27_linear)"}"></path><path d="${"M353.217 162.81C346.165 147.446 342.374 130.86 333.293 116.214C332.717 115.344 332.575 114.185 331.998 113.315C331.563 113.603 331.201 113.53 331.128 113.892C334.725 122.153 338.757 130.126 342.353 138.388C345.95 146.649 349.111 155.199 352.346 163.387C352.42 163.025 352.855 162.737 353.217 162.81Z"}" fill="${"url(#paint28_linear)"}"></path><path d="${"M335.332 351.247C334.032 350.23 332.805 348.852 331.505 347.835C315.033 336.209 297.325 326.968 280.198 316.715C279.836 316.642 279.474 316.569 278.316 316.71C282.725 319.111 286.41 321.365 290.457 323.692C304.91 332.273 319.872 340.203 333.235 350.445C333.959 350.592 334.682 350.739 335.332 351.247Z"}" fill="${"url(#paint29_linear)"}"></path><path d="${"M360.144 117.518C352.432 105.409 346.025 92.4346 336.064 82.1291C335.556 82.7792 335.194 82.7058 335.121 83.0675L335.047 83.4292C334.974 83.791 335.262 84.226 335.262 84.226C343.918 95.3966 351.85 106.42 360.144 117.518Z"}" fill="${"url(#paint30_linear)"}"></path><path d="${"M492.704 214.075C488.783 218.552 482.426 240.612 481.887 252.554C485.54 240.114 489.193 227.674 492.704 214.075Z"}" fill="${"url(#paint31_linear)"}"></path><path d="${"M223.21 165.063C226.026 167.893 228.841 170.724 231.583 173.916C234.325 177.109 237.067 180.301 239.447 183.42C242.189 186.612 244.495 190.093 247.164 193.647C244.584 184.085 229.795 166.022 223.21 165.063Z"}" fill="${"url(#paint32_linear)"}"></path><path d="${"M391.186 254.116C392.225 271.274 395.943 288.222 400.458 304.955C397.102 288.08 394.181 270.917 391.186 254.116Z"}" fill="${"url(#paint33_linear)"}"></path><path d="${"M155.245 243.92C156.897 248.774 171.13 258.44 180.823 260.783C171.864 254.823 163.555 249.371 155.245 243.92Z"}" fill="${"url(#paint34_linear)"}"></path><path d="${"M189.725 181.62C198.322 187.506 207.208 193.828 215.806 199.714C208.298 192.166 199.774 185.918 190.38 180.246C190.233 180.97 190.16 181.331 189.725 181.62Z"}" fill="${"url(#paint35_linear)"}"></path><path d="${"M438.469 141.689C438.715 131.195 439.395 120.411 439.641 109.916C436.79 120.259 437.629 130.974 438.469 141.689Z"}" fill="${"url(#paint36_linear)"}"></path><path d="${"M354.742 320.537C361.887 328.012 368.96 335.849 376.105 343.324C376.54 343.035 376.614 342.674 376.975 342.747C370.773 334.334 363.193 327.147 354.742 320.537Z"}" fill="${"url(#paint37_linear)"}"></path><path d="${"M458.433 93.3918C458.967 83.332 458.993 73.9223 456.34 64.7224C455.978 64.649 455.543 64.9374 455.181 64.864C456.314 74.1321 457.373 83.762 458.433 93.3918Z"}" fill="${"url(#paint38_linear)"}"></path><path d="${"M189.415 268.551C181.824 265.128 174.595 261.779 167.004 258.356C171.046 262.565 176.252 264.751 181.023 267.225C183.046 268.389 185.578 268.902 187.748 269.342C188.037 269.778 188.545 269.128 189.415 268.551Z"}" fill="${"url(#paint39_linear)"}"></path><path d="${"M264.175 353.008C254.639 346.178 244.667 339.637 233.606 334.757C244.012 341.01 254.13 346.828 264.175 353.008Z"}" fill="${"url(#paint40_linear)"}"></path><path d="${"M252.564 283.995C245.481 279.923 238.037 275.777 230.955 271.704C230.881 272.066 230.446 272.354 230.299 273.077C233.55 275.62 237.382 277.15 240.779 278.969C244.538 280.861 248.223 283.115 251.982 285.007C252.417 284.719 252.49 284.357 252.564 283.995Z"}" fill="${"url(#paint41_linear)"}"></path><path d="${"M412.253 146.54C410.497 153.339 410.623 160.144 411.908 166.806C412.505 160.149 412.814 153.056 413.411 146.398C412.976 146.687 412.614 146.613 412.253 146.54Z"}" fill="${"url(#paint42_linear)"}"></path><path d="${"M218.068 166.279C222.545 170.2 227.31 174.556 231.787 178.477C228.401 172.894 223.997 168.611 219.085 164.979C219.011 165.341 218.503 165.991 218.068 166.279Z"}" fill="${"url(#paint43_linear)"}"></path><path d="${"M295.659 114.23C295.932 120.311 297.725 126.323 299.157 132.263C299.519 132.336 299.954 132.048 299.954 132.048C298.884 126.182 297.526 119.881 296.456 114.015C296.456 114.015 296.094 113.941 295.659 114.23Z"}" fill="${"url(#paint44_linear)"}"></path><path d="${"M174.276 272.635C177.097 273.584 180.206 274.968 183.026 275.916C183.099 275.555 183.173 275.193 183.681 274.543C180.499 273.521 177.752 272.211 174.57 271.189C174.423 271.912 174.35 272.274 174.276 272.635Z"}" fill="${"url(#paint45_linear)"}"></path><path d="${"M335.767 350.959C339.306 353.936 342.844 356.914 346.383 359.891C346.457 359.529 346.892 359.241 346.965 358.879C342.991 356.19 339.379 353.575 335.767 350.959Z"}" fill="${"url(#paint46_linear)"}"></path><path d="${"M274.127 313.224C271.453 311.552 268.706 310.242 266.033 308.57C265.959 308.932 265.959 308.932 265.524 309.22C268.198 310.892 270.945 312.202 273.618 313.875C273.692 313.513 274.054 313.586 274.127 313.224Z"}" fill="${"url(#paint47_linear)"}"></path><path d="${"M509.838 690.904C508.899 689.96 508.323 689.09 507.384 688.146C497.859 677.553 488.259 667.32 479.095 656.8C468.343 644.828 457.517 633.217 448.07 620.379C440.138 609.355 432.132 598.693 423.618 588.681C415.393 579.104 406.37 569.742 396.331 561.681C384.126 551.297 370.03 544.671 354.549 541.155C335.163 536.47 315.62 536.272 296.067 539.838C271.445 544.258 246.896 548.317 222.489 553.535C210.322 555.963 198.732 559.261 186.995 563.283C171.562 568.814 156.344 575.142 141.2 581.109C129.316 585.854 119.378 594.006 109.512 601.797C109.077 602.085 109.004 602.447 108.349 603.82C110.304 603.464 111.751 603.757 112.983 603.254C134.135 597.376 155.36 591.136 176.8 585.694C191.142 581.824 206.061 578.824 220.477 574.593C230.909 571.437 241.917 569.15 252.706 567.949C265.811 566.465 278.911 566.862 291.933 569.503C303.87 571.925 316.241 574.057 328.105 576.84C350.311 582.474 371.642 590.567 391.589 601.768C417.607 616.46 442.97 632.526 466.661 651.265C480.6 662.378 492.653 675.367 504.706 688.356C505.932 689.735 507.232 690.752 508.821 692.204C508.894 691.842 509.403 691.192 509.838 690.904ZM461.549 641.19C461.114 641.478 461.114 641.478 460.679 641.767C459.379 640.75 458.44 639.806 457.14 638.789C446.236 629.422 435.258 620.417 424.354 611.05C420.165 607.564 415.829 604.802 411.494 602.039C386.425 584.527 359.678 571.57 330.169 562.948C315.197 558.782 299.423 556.712 283.571 556.886C280.966 556.734 278.722 556.656 276.117 556.504C277.134 555.204 278.004 554.627 278.8 554.412C286.989 551.177 295.177 547.942 303.653 545.142C317.781 540.476 331.756 538.415 346.586 541.423C363.587 544.871 379.424 550.343 392.567 561.67C411.272 577.139 427.147 595.423 441.281 614.86C447.195 622.838 452.82 630.381 458.807 637.998C460.107 639.014 460.61 640.246 461.549 641.19ZM133.128 594.912C133.201 594.551 132.84 594.477 132.913 594.115C132.986 593.754 133.421 593.465 133.421 593.465C135.088 592.674 136.755 591.882 138.422 591.09C157.409 582.89 177.476 576.792 197.181 570.621C206.816 567.68 216.807 566.693 226.799 565.707C236.717 565.083 246.782 563.735 256.705 561.228C262.209 560.085 268.075 559.015 273.794 558.669C295.801 557.86 317.436 560.742 338.625 567.676C356.994 573.662 374.2 581.671 390.75 591.053C405.565 599.707 419.436 609.299 432.579 620.627C435.756 623.531 439.442 625.785 442.618 628.688C443.63 629.27 444.207 630.14 444.784 631.011C442.975 630.644 441.602 629.989 440.301 628.972C429.68 621.922 419.494 614.583 408.726 608.257C386.179 595.022 362.829 583.883 337.514 576.866C320.372 572.259 302.868 567.579 285.139 565.866C273.344 564.603 261.764 564.137 250.179 565.554C238.159 567.258 225.992 569.686 214.328 573.346C195.493 578.941 176.082 583.665 157.032 588.463C149.064 590.613 141.096 592.762 133.128 594.912ZM308.444 540.089C308.371 540.45 308.659 540.885 308.586 541.247C293.588 546.49 278.517 552.095 263.231 556.903C251.568 560.563 239.474 562.629 226.877 563.464C218.118 563.946 209.285 564.791 200.74 566.071C198.061 566.28 195.597 567.287 192.845 567.859C188.138 568.787 183.504 569.353 178.796 570.281C182.712 567.686 186.554 565.453 190.612 564.016C200.247 561.075 209.955 557.772 219.732 555.989C246.383 550.85 273.322 546.146 300.335 541.08C303.448 540.582 306.127 540.372 308.444 540.089ZM183.279 572.32C161.183 579.137 139.953 587.258 119.367 597.77C126.197 588.234 167.138 572.059 183.279 572.32Z"}" fill="${"url(#paint48_linear)"}"></path><path d="${"M676.985 286.447C667.555 293.95 658.051 301.814 648.186 309.604C627.076 326.412 607.771 345.469 588.177 364.09C568.001 383.723 551.149 405.537 536.247 428.876C522.435 450.554 509.2 473.101 499.797 497.179C495.059 509.399 490.394 521.257 487.826 533.917C484.603 547.951 481.018 561.911 478.519 576.091C476.313 588.825 475.265 601.417 477.546 614.307C478.118 617.059 479.486 619.596 480.493 622.06C480.854 622.133 481.29 621.845 481.651 621.918C481.583 620.398 481.515 618.878 481.085 617.284C479.449 606.784 480.779 596.509 483.557 586.528C491.974 552.459 509.57 523.264 531.937 496.543C542.247 484.7 553.281 473.004 564.242 461.67C568.089 457.554 572.949 454.021 576.796 449.905C593.712 431.494 610.989 413.155 624.365 391.766C635.053 374.351 644.079 355.846 652.381 337.193C659.227 322.012 666.072 306.83 674.579 292.738C675.019 290.568 676.183 288.544 676.985 286.447ZM665.144 302.122C665.505 302.196 665.505 302.196 665.794 302.631C665.647 303.354 665.574 303.716 665.065 304.366C658.513 318.101 651.961 331.836 645.336 345.933C636.017 365.885 625.901 386.052 612.823 404.113C598.728 423.473 582.394 440.873 565.049 457.691C552.348 470.179 540.297 483.175 528.896 496.679C514.591 513.361 502.672 531.279 493.352 551.232C490.585 557.449 488.179 563.74 485.412 569.957C484.908 568.726 485.129 567.64 485.349 566.555C486.664 561.926 487.691 556.862 489.368 552.307C493.31 540.302 497.324 527.935 501.989 516.077C514.448 486.217 532.039 458.904 551.58 433.116C560.297 421.704 569.953 411.234 579.681 400.403C607.993 370.369 636.665 340.408 660.788 306.888C662.528 305.734 663.98 304.146 665.144 302.122ZM662.25 301.535C662.538 301.971 662.538 301.971 662.827 302.406C662.318 303.056 661.81 303.706 661.663 304.429C645.246 325.955 627.89 346.537 609.523 366.537C597.981 378.883 585.715 391.082 574.46 403.863C563.788 415.633 553.404 427.837 544.32 441.059C533.784 455.869 523.972 470.825 515.098 486.725C504.987 505.011 496.973 524.098 490.332 543.841C487.486 552.302 485.437 560.548 482.953 569.082C482.376 568.212 482.523 567.489 482.67 566.765C485.379 555.264 487.8 543.327 491.233 531.972C494.666 520.617 498.172 508.901 502.617 498.128C511.873 474.773 524.527 453.238 537.83 432.21C552.223 409.521 568.567 388.357 587.873 369.301C604.275 353.421 619.953 337.395 637.655 322.532C645.203 315.025 653.69 308.461 662.25 301.535Z"}" fill="${"url(#paint49_linear)"}"></path><defs><linearGradient id="${"paint0_linear"}" x1="${"568.299"}" y1="${"436.131"}" x2="${"607"}" y2="${"1195.5"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#A78140"}"></stop><stop offset="${"1"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint1_linear"}" x1="${"863.208"}" y1="${"1734.39"}" x2="${"240.182"}" y2="${"-46.0365"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint2_linear"}" x1="${"830.659"}" y1="${"1745.77"}" x2="${"207.637"}" y2="${"-34.6446"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint3_linear"}" x1="${"912.073"}" y1="${"1717.29"}" x2="${"289.045"}" y2="${"-63.1357"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint4_linear"}" x1="${"826.084"}" y1="${"1747.38"}" x2="${"203.058"}" y2="${"-33.0482"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint5_linear"}" x1="${"939.097"}" y1="${"1707.84"}" x2="${"316.07"}" y2="${"-72.5899"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint6_linear"}" x1="${"826.902"}" y1="${"1747.09"}" x2="${"203.877"}" y2="${"-33.3301"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint7_linear"}" x1="${"877.18"}" y1="${"1729.5"}" x2="${"254.153"}" y2="${"-50.9311"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint8_linear"}" x1="${"678.557"}" y1="${"1799.01"}" x2="${"55.528"}" y2="${"18.5818"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint9_linear"}" x1="${"759.073"}" y1="${"1770.82"}" x2="${"136.048"}" y2="${"-9.5978"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint10_linear"}" x1="${"918.157"}" y1="${"1715.16"}" x2="${"295.131"}" y2="${"-65.2689"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint11_linear"}" x1="${"885.264"}" y1="${"1726.67"}" x2="${"262.241"}" y2="${"-53.7515"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint12_linear"}" x1="${"843.209"}" y1="${"1741.39"}" x2="${"220.184"}" y2="${"-39.0322"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint13_linear"}" x1="${"725.117"}" y1="${"1782.72"}" x2="${"102.09"}" y2="${"2.2924"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint14_linear"}" x1="${"987.161"}" y1="${"1691.02"}" x2="${"364.134"}" y2="${"-89.4134"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint15_linear"}" x1="${"871.647"}" y1="${"1731.44"}" x2="${"248.622"}" y2="${"-48.9836"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint16_linear"}" x1="${"1003.73"}" y1="${"1685.21"}" x2="${"380.706"}" y2="${"-95.2057"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint17_linear"}" x1="${"919.449"}" y1="${"1714.72"}" x2="${"296.421"}" y2="${"-65.7121"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint18_linear"}" x1="${"842.49"}" y1="${"1741.64"}" x2="${"219.464"}" y2="${"-38.7804"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint19_linear"}" x1="${"957.598"}" y1="${"1701.36"}" x2="${"334.573"}" y2="${"-79.0631"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint20_linear"}" x1="${"1018.69"}" y1="${"1679.99"}" x2="${"395.658"}" y2="${"-100.445"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint21_linear"}" x1="${"850.122"}" y1="${"1738.97"}" x2="${"227.096"}" y2="${"-41.4558"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint22_linear"}" x1="${"927.365"}" y1="${"1711.94"}" x2="${"304.338"}" y2="${"-68.4866"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint23_linear"}" x1="${"985.121"}" y1="${"1691.73"}" x2="${"362.094"}" y2="${"-88.6958"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint24_linear"}" x1="${"870.437"}" y1="${"1731.87"}" x2="${"247.41"}" y2="${"-48.563"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint25_linear"}" x1="${"774.838"}" y1="${"1765.32"}" x2="${"151.811"}" y2="${"-15.1114"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint26_linear"}" x1="${"866.759"}" y1="${"1733.16"}" x2="${"243.73"}" y2="${"-47.2785"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint27_linear"}" x1="${"676.098"}" y1="${"1799.87"}" x2="${"53.0745"}" y2="${"19.4384"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint28_linear"}" x1="${"896.405"}" y1="${"1722.78"}" x2="${"273.376"}" y2="${"-57.6513"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint29_linear"}" x1="${"804.335"}" y1="${"1754.99"}" x2="${"181.311"}" y2="${"-25.4356"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint30_linear"}" x1="${"913.365"}" y1="${"1716.84"}" x2="${"290.34"}" y2="${"-63.587"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint31_linear"}" x1="${"996.364"}" y1="${"1687.79"}" x2="${"373.339"}" y2="${"-92.6289"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint32_linear"}" x1="${"788.634"}" y1="${"1760.48"}" x2="${"165.608"}" y2="${"-19.9395"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint33_linear"}" x1="${"900.279"}" y1="${"1721.42"}" x2="${"277.253"}" y2="${"-59.0073"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint34_linear"}" x1="${"705.878"}" y1="${"1789.43"}" x2="${"82.8561"}" y2="${"9.02123"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint35_linear"}" x1="${"756.065"}" y1="${"1771.87"}" x2="${"133.042"}" y2="${"-8.5436"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint36_linear"}" x1="${"987.063"}" y1="${"1691.04"}" x2="${"364.041"}" y2="${"-89.3766"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint37_linear"}" x1="${"857.316"}" y1="${"1736.44"}" x2="${"234.296"}" y2="${"-43.9718"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint38_linear"}" x1="${"1017.91"}" y1="${"1680.26"}" x2="${"394.887"}" y2="${"-100.175"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint39_linear"}" x1="${"711.409"}" y1="${"1787.5"}" x2="${"88.3875"}" y2="${"7.08408"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint40_linear"}" x1="${"749.518"}" y1="${"1774.18"}" x2="${"126.489"}" y2="${"-6.25297"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint41_linear"}" x1="${"763.1"}" y1="${"1769.42"}" x2="${"140.075"}" y2="${"-11.0036"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint42_linear"}" x1="${"953.685"}" y1="${"1702.71"}" x2="${"330.665"}" y2="${"-77.697"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint43_linear"}" x1="${"781.626"}" y1="${"1762.95"}" x2="${"158.597"}" y2="${"-17.4867"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint44_linear"}" x1="${"862.217"}" y1="${"1734.74"}" x2="${"239.192"}" y2="${"-45.6902"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint45_linear"}" x1="${"708.797"}" y1="${"1788.4"}" x2="${"85.7818"}" y2="${"7.99883"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint46_linear"}" x1="${"828.178"}" y1="${"1746.65"}" x2="${"205.153"}" y2="${"-33.7786"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint47_linear"}" x1="${"778.175"}" y1="${"1764.13"}" x2="${"155.157"}" y2="${"-16.2773"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint48_linear"}" x1="${"708.61"}" y1="${"1789.19"}" x2="${"85.5847"}" y2="${"8.76404"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint49_linear"}" x1="${"1008.75"}" y1="${"1684.16"}" x2="${"385.726"}" y2="${"-96.2663"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient></defs></svg>`;
});
var css$d = {
  code: "svg.svelte-1a2oioy{width:var(--width-size);margin-left:var(--left-margin)}.left.svelte-1a2oioy{transform:rotate(90deg)}.right.svelte-1a2oioy{transform:rotate(-90deg)}.up.svelte-1a2oioy{transform:rotate(180deg)}",
  map: `{"version":3,"file":"arrow.svelte","sources":["arrow.svelte"],"sourcesContent":["<script>\\n\\texport let direction = '';\\n<\/script>\\n\\n<svg\\n\\tclass={direction}\\n\\twidth=\\"20\\"\\n\\theight=\\"30\\"\\n\\tviewBox=\\"0 0 20 30\\"\\n\\tfill=\\"none\\"\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\n>\\n\\t<path\\n\\t\\td=\\"M19.1 19.9L9.69998 29.7L0.0999756 19.9L0.599976 19.4L7.59998 23.5V0H11.8V23.4L18.6 19.4L19.1 19.9Z\\"\\n\\t\\tfill=\\"#3c3c3c\\"\\n\\t/>\\n</svg>\\n\\n<style lang=\\"scss\\">svg {\\n  width: var(--width-size);\\n  margin-left: var(--left-margin);\\n}\\n\\n.left {\\n  transform: rotate(90deg);\\n}\\n\\n.right {\\n  transform: rotate(-90deg);\\n}\\n\\n.up {\\n  transform: rotate(180deg);\\n}</style>\\n"],"names":[],"mappings":"AAkBmB,GAAG,eAAC,CAAC,AACtB,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,WAAW,CAAE,IAAI,aAAa,CAAC,AACjC,CAAC,AAED,KAAK,eAAC,CAAC,AACL,SAAS,CAAE,OAAO,KAAK,CAAC,AAC1B,CAAC,AAED,MAAM,eAAC,CAAC,AACN,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AAED,GAAG,eAAC,CAAC,AACH,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC"}`
};
var Arrow = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { direction = "" } = $$props;
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0)
    $$bindings.direction(direction);
  $$result.css.add(css$d);
  return `<svg class="${escape(null_to_empty(direction)) + " svelte-1a2oioy"}" width="${"20"}" height="${"30"}" viewBox="${"0 0 20 30"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M19.1 19.9L9.69998 29.7L0.0999756 19.9L0.599976 19.4L7.59998 23.5V0H11.8V23.4L18.6 19.4L19.1 19.9Z"}" fill="${"#3c3c3c"}"></path></svg>`;
});
var css$c = {
  code: '.container.footer.svelte-1wdppdi.svelte-1wdppdi{position:fixed;z-index:10;bottom:30px;right:5vw;display:flex;align-items:center}@media only screen and (max-width: 1280px){.container.footer.svelte-1wdppdi.svelte-1wdppdi{right:50px;bottom:10px}}.container.footer.svelte-1wdppdi div.svelte-1wdppdi{font-family:"tenorsans", sans-serif;font-size:12px;-webkit-animation:svelte-1wdppdi-rotation 15s linear infinite;animation:svelte-1wdppdi-rotation 15s linear infinite;-webkit-animation-delay:1s;animation-delay:1s}@media only screen and (max-width: 1280px){.container.footer.svelte-1wdppdi div.svelte-1wdppdi{font-size:8px}}.container.ending.svelte-1wdppdi.svelte-1wdppdi{position:static;display:flex;align-items:center;justify-content:center}@media only screen and (max-width: 1280px){.container.ending.svelte-1wdppdi.svelte-1wdppdi{margin-left:64px;justify-content:flex-start}}.container.ending.svelte-1wdppdi div.svelte-1wdppdi{-webkit-animation:svelte-1wdppdi-rotation 15s linear infinite;animation:svelte-1wdppdi-rotation 15s linear infinite;font-size:24px}@media only screen and (max-width: 1280px){.container.ending.svelte-1wdppdi div.svelte-1wdppdi{font-size:14px}}@-webkit-keyframes svelte-1wdppdi-rotation{from{transform:rotate(0deg)}to{transform:rotate(359deg)}}@keyframes svelte-1wdppdi-rotation{from{transform:rotate(0deg)}to{transform:rotate(359deg)}}',
  map: `{"version":3,"file":"CircleType.svelte","sources":["CircleType.svelte"],"sourcesContent":["<script>\\r\\n\\timport CircleType from 'circletype';\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\timport Arrow from '../svg/arrow.svelte';\\r\\n\\r\\n\\timport { gsap } from 'gsap/dist/gsap.js';\\r\\n\\timport { ScrollTrigger } from 'gsap/dist/ScrollTrigger.js';\\r\\n\\r\\n\\timport { ending } from './Ending.svelte';\\r\\n\\r\\n\\tgsap.registerPlugin(ScrollTrigger);\\r\\n\\r\\n\\texport let typeText,\\r\\n\\t\\ttype = 'footer',\\r\\n\\t\\tdirection = '';\\r\\n\\tlet circle, container;\\r\\n\\r\\n\\tonMount(() => {\\r\\n\\t\\tnew CircleType(circle);\\r\\n\\t\\tif (type == 'footer') {\\r\\n\\t\\t\\tgsap.to(container, {\\r\\n\\t\\t\\t\\tscrollTrigger: {\\r\\n\\t\\t\\t\\t\\ttrigger: ending,\\r\\n\\t\\t\\t\\t\\tscrub: 1,\\r\\n\\t\\t\\t\\t\\tstart: 'top bottom'\\r\\n\\t\\t\\t\\t},\\r\\n\\t\\t\\t\\topacity: 0,\\r\\n\\t\\t\\t\\ty: 250,\\r\\n\\t\\t\\t\\tduration: 1\\r\\n\\t\\t\\t});\\r\\n\\t\\t}\\r\\n\\t\\tgsap.from(container, {\\r\\n\\t\\t\\topacity: 0,\\r\\n\\t\\t\\ty: 100\\r\\n\\t\\t});\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<!--googleoff: index-->\\r\\n\\t<div bind:this={container} class=\\"container {type}\\">\\r\\n\\t\\t<div>\\r\\n\\t\\t\\t<span bind:this={circle}>{typeText}</span>\\r\\n\\t\\t</div>\\r\\n\\t\\t<Arrow --left-margin=\\"-10px\\" {direction} />\\r\\n\\t</div>\\r\\n\\t<!--googleon: index-->\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">.container.footer {\\n  position: fixed;\\n  z-index: 10;\\n  bottom: 30px;\\n  right: 5vw;\\n  display: flex;\\n  align-items: center;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .container.footer {\\n    right: 50px;\\n    bottom: 10px;\\n  }\\n}\\n.container.footer div {\\n  font-family: \\"tenorsans\\", sans-serif;\\n  font-size: 12px;\\n  -webkit-animation: rotation 15s linear infinite;\\n          animation: rotation 15s linear infinite;\\n  -webkit-animation-delay: 1s;\\n          animation-delay: 1s;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .container.footer div {\\n    font-size: 8px;\\n  }\\n}\\n\\n.container.ending {\\n  position: static;\\n  display: flex;\\n  align-items: center;\\n  justify-content: center;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .container.ending {\\n    margin-left: 64px;\\n    justify-content: flex-start;\\n  }\\n}\\n.container.ending div {\\n  -webkit-animation: rotation 15s linear infinite;\\n          animation: rotation 15s linear infinite;\\n  font-size: 24px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .container.ending div {\\n    font-size: 14px;\\n  }\\n}\\n\\n@-webkit-keyframes rotation {\\n  from {\\n    transform: rotate(0deg);\\n  }\\n  to {\\n    transform: rotate(359deg);\\n  }\\n}\\n\\n@keyframes rotation {\\n  from {\\n    transform: rotate(0deg);\\n  }\\n  to {\\n    transform: rotate(359deg);\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAiDmB,UAAU,OAAO,8BAAC,CAAC,AACpC,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,GAAG,CACV,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,UAAU,OAAO,8BAAC,CAAC,AACjB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACH,CAAC,AACD,UAAU,sBAAO,CAAC,GAAG,eAAC,CAAC,AACrB,WAAW,CAAE,WAAW,CAAC,CAAC,UAAU,CACpC,SAAS,CAAE,IAAI,CACf,iBAAiB,CAAE,uBAAQ,CAAC,GAAG,CAAC,MAAM,CAAC,QAAQ,CACvC,SAAS,CAAE,uBAAQ,CAAC,GAAG,CAAC,MAAM,CAAC,QAAQ,CAC/C,uBAAuB,CAAE,EAAE,CACnB,eAAe,CAAE,EAAE,AAC7B,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,UAAU,sBAAO,CAAC,GAAG,eAAC,CAAC,AACrB,SAAS,CAAE,GAAG,AAChB,CAAC,AACH,CAAC,AAED,UAAU,OAAO,8BAAC,CAAC,AACjB,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,UAAU,OAAO,8BAAC,CAAC,AACjB,WAAW,CAAE,IAAI,CACjB,eAAe,CAAE,UAAU,AAC7B,CAAC,AACH,CAAC,AACD,UAAU,sBAAO,CAAC,GAAG,eAAC,CAAC,AACrB,iBAAiB,CAAE,uBAAQ,CAAC,GAAG,CAAC,MAAM,CAAC,QAAQ,CACvC,SAAS,CAAE,uBAAQ,CAAC,GAAG,CAAC,MAAM,CAAC,QAAQ,CAC/C,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,UAAU,sBAAO,CAAC,GAAG,eAAC,CAAC,AACrB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AAED,mBAAmB,uBAAS,CAAC,AAC3B,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,OAAO,IAAI,CAAC,AACzB,CAAC,AACD,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AACH,CAAC,AAED,WAAW,uBAAS,CAAC,AACnB,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,OAAO,IAAI,CAAC,AACzB,CAAC,AACD,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AACH,CAAC"}`
};
var CircleType_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  import_gsap.gsap.registerPlugin(import_ScrollTrigger.ScrollTrigger);
  let { typeText, type = "footer", direction = "" } = $$props;
  let circle, container;
  if ($$props.typeText === void 0 && $$bindings.typeText && typeText !== void 0)
    $$bindings.typeText(typeText);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0)
    $$bindings.direction(direction);
  $$result.css.add(css$c);
  return `
	<div class="${"container " + escape(type) + " svelte-1wdppdi"}"${add_attribute("this", container, 0)}><div class="${"svelte-1wdppdi"}"><span${add_attribute("this", circle, 0)}>${escape(typeText)}</span></div>
		<div style="display: contents; --left-margin:${"-10px"};">${validate_component(Arrow, "Arrow").$$render($$result, { direction }, {}, {})}</div></div>
	`;
});
var css$b = {
  code: "section.svelte-1ljyvhi.svelte-1ljyvhi{width:-webkit-max-content;width:-moz-max-content;width:max-content;height:100vh;margin:0 auto;padding-right:5em;padding-top:25vh}@media only screen and (max-width: 1280px){section.svelte-1ljyvhi.svelte-1ljyvhi{margin:0 64px;padding-right:0;margin-top:30px;padding-top:220px}}@media only screen and (max-width: 720px){section.svelte-1ljyvhi.svelte-1ljyvhi{margin:0 40px;padding-right:0;padding-top:200px;padding-bottom:100px;margin-bottom:10px}}@media only screen and (max-height: 480px){section.svelte-1ljyvhi.svelte-1ljyvhi{margin:0 40px;padding-right:0;padding-top:200px;padding-bottom:100px;margin-bottom:10px}}p.svelte-1ljyvhi.svelte-1ljyvhi{margin-top:5em;text-align:center}@media only screen and (max-width: 1280px){p.svelte-1ljyvhi.svelte-1ljyvhi{font-size:12px;margin-top:3em}}a.svelte-1ljyvhi.svelte-1ljyvhi{color:#7E5923}.ending.svelte-1ljyvhi.svelte-1ljyvhi{position:static;display:flex;justify-content:center;margin-top:3em}.ending.svelte-1ljyvhi ul.svelte-1ljyvhi{display:flex;z-index:10}.ending.svelte-1ljyvhi ul a.svelte-1ljyvhi{color:#3c3c3c}@media only screen and (max-width: 1280px){.ending.svelte-1ljyvhi ul a.svelte-1ljyvhi{font-size:14px}}@media only screen and (max-width: 720px){.ending.svelte-1ljyvhi ul a.svelte-1ljyvhi{font-size:10px}}@media only screen and (max-height: 480px){.ending.svelte-1ljyvhi ul a.svelte-1ljyvhi{font-size:10px}}.ending.svelte-1ljyvhi ul a.svelte-1ljyvhi:nth-child(2){margin:0 40px}@media only screen and (max-width: 1280px){.ending.svelte-1ljyvhi ul a.svelte-1ljyvhi:nth-child(2){margin:0 20px}}@media only screen and (max-width: 1280px){.ending.svelte-1ljyvhi.svelte-1ljyvhi{justify-content:flex-start;margin-top:2em}}",
  map: `{"version":3,"file":"Ending.svelte","sources":["Ending.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport let ending;\\r\\n<\/script>\\r\\n\\r\\n<script>\\r\\n\\timport CircleType from './CircleType.svelte';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section bind:this={ending}>\\r\\n\\t\\t<a href=\\"#top\\">\\r\\n\\t\\t\\t<CircleType\\r\\n\\t\\t\\t\\ttypeText=\\"| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL UP &ensp; || &ensp; BACK TO TOP &ensp; |\\"\\r\\n\\t\\t\\t\\ttype=\\"ending\\"\\r\\n\\t\\t\\t\\tdirection=\\"up\\"\\r\\n\\t\\t\\t/>\\r\\n\\t\\t</a>\\r\\n\\t\\t<p>I am sorry ! Your scrolling have come to an end.</p>\\r\\n\\t\\t<nav class=\\"ending\\">\\r\\n\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t<a rel=\\"external\\" href=\\"https://www.behance.net/gauthamkrishnax\\"><li>Behance</li></a>\\r\\n\\t\\t\\t\\t<a rel=\\"external\\" href=\\"https://github.com/gauthamkrishnax\\"><li>Github</li></a>\\r\\n\\t\\t\\t\\t<a rel=\\"external\\" href=\\"https://www.linkedin.com/in/gauthamkrishnas/\\"><li>LinkedIn</li></a>\\r\\n\\t\\t\\t</ul>\\r\\n\\t\\t</nav>\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">section {\\n  width: -webkit-max-content;\\n  width: -moz-max-content;\\n  width: max-content;\\n  height: 100vh;\\n  margin: 0 auto;\\n  padding-right: 5em;\\n  padding-top: 25vh;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section {\\n    margin: 0 64px;\\n    padding-right: 0;\\n    margin-top: 30px;\\n    padding-top: 220px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 200px;\\n    padding-bottom: 100px;\\n    margin-bottom: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 200px;\\n    padding-bottom: 100px;\\n    margin-bottom: 10px;\\n  }\\n}\\n\\np {\\n  margin-top: 5em;\\n  text-align: center;\\n}\\n@media only screen and (max-width: 1280px) {\\n  p {\\n    font-size: 12px;\\n    margin-top: 3em;\\n  }\\n}\\n\\na {\\n  color: #7E5923;\\n}\\n\\n.ending {\\n  position: static;\\n  display: flex;\\n  justify-content: center;\\n  margin-top: 3em;\\n}\\n.ending ul {\\n  display: flex;\\n  z-index: 10;\\n}\\n.ending ul a {\\n  color: #3c3c3c;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .ending ul a {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .ending ul a {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .ending ul a {\\n    font-size: 10px;\\n  }\\n}\\n.ending ul a:nth-child(2) {\\n  margin: 0 40px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .ending ul a:nth-child(2) {\\n    margin: 0 20px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  .ending {\\n    justify-content: flex-start;\\n    margin-top: 2em;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
};
var ending;
var Ending = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$b);
  return `<section class="${"svelte-1ljyvhi"}"${add_attribute("this", ending, 0)}><a href="${"#top"}" class="${"svelte-1ljyvhi"}">${validate_component(CircleType_1, "CircleType").$$render($$result, {
    typeText: "| \u2002 PORTFOLIO \u2002 || \u2002 SCROLL UP \u2002 || \u2002 BACK TO TOP \u2002 |",
    type: "ending",
    direction: "up"
  }, {}, {})}</a>
		<p class="${"svelte-1ljyvhi"}">I am sorry ! Your scrolling have come to an end.</p>
		<nav class="${"ending svelte-1ljyvhi"}"><ul class="${"svelte-1ljyvhi"}"><a rel="${"external"}" href="${"https://www.behance.net/gauthamkrishnax"}" class="${"svelte-1ljyvhi"}"><li>Behance</li></a>
				<a rel="${"external"}" href="${"https://github.com/gauthamkrishnax"}" class="${"svelte-1ljyvhi"}"><li>Github</li></a>
				<a rel="${"external"}" href="${"https://www.linkedin.com/in/gauthamkrishnas/"}" class="${"svelte-1ljyvhi"}"><li>LinkedIn</li></a></ul></nav>
	</section>`;
});
var css$a = {
  code: "ul.svelte-49kx5s.svelte-49kx5s{display:flex;z-index:10}ul.svelte-49kx5s a.svelte-49kx5s{color:#3c3c3c}@media only screen and (max-width: 1280px){ul.svelte-49kx5s a.svelte-49kx5s{font-size:14px}}@media only screen and (max-width: 720px){ul.svelte-49kx5s a.svelte-49kx5s{font-size:10px}}@media only screen and (max-height: 480px){ul.svelte-49kx5s a.svelte-49kx5s{font-size:10px}}ul.svelte-49kx5s a.svelte-49kx5s:nth-child(2){margin:0 40px}@media only screen and (max-width: 1280px){ul.svelte-49kx5s a.svelte-49kx5s:nth-child(2){margin:0 20px}}.footer.svelte-49kx5s.svelte-49kx5s{position:fixed;z-index:10;bottom:30px;left:120px}@media only screen and (max-width: 1280px){.footer.svelte-49kx5s.svelte-49kx5s{bottom:20px;left:64px}}@media only screen and (max-width: 720px){.footer.svelte-49kx5s.svelte-49kx5s{bottom:20px;left:40px}}@media only screen and (max-height: 480px){.footer.svelte-49kx5s.svelte-49kx5s{bottom:20px;left:40px}}",
  map: `{"version":3,"file":"Footer.svelte","sources":["Footer.svelte"],"sourcesContent":["<script>\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\timport { gsap } from 'gsap/dist/gsap.js';\\r\\n\\timport { ScrollTrigger } from 'gsap/dist/ScrollTrigger.js';\\r\\n\\r\\n\\timport { ending } from './Ending.svelte';\\r\\n\\r\\n\\tgsap.registerPlugin(ScrollTrigger);\\r\\n\\r\\n\\tlet footer;\\r\\n\\r\\n\\tonMount(() => {\\r\\n\\t\\tgsap.to(footer, {\\r\\n\\t\\t\\tscrollTrigger: {\\r\\n\\t\\t\\t\\ttrigger: ending,\\r\\n\\t\\t\\t\\tscrub: 1,\\r\\n\\t\\t\\t\\tstart: 'top bottom'\\r\\n\\t\\t\\t},\\r\\n\\t\\t\\topacity: 0,\\r\\n\\t\\t\\ty: 100,\\r\\n\\t\\t\\tduration: 1\\r\\n\\t\\t});\\r\\n\\t\\tgsap.from(footer, {\\r\\n\\t\\t\\topacity: 0,\\r\\n\\t\\t\\ty: 100\\r\\n\\t\\t});\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<nav bind:this={footer} class=\\"footer\\">\\r\\n\\t\\t<ul>\\r\\n\\t\\t\\t<a rel=\\"external\\" href=\\"https://www.behance.net/gauthamkrishnax\\"><li>Behance</li></a>\\r\\n\\t\\t\\t<a rel=\\"external\\" href=\\"https://github.com/gauthamkrishnax\\"><li>Github</li></a>\\r\\n\\t\\t\\t<a rel=\\"external\\" href=\\"https://www.linkedin.com/in/gauthamkrishnas/\\"><li>LinkedIn</li></a>\\r\\n\\t\\t</ul>\\r\\n\\t</nav>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">ul {\\n  display: flex;\\n  z-index: 10;\\n}\\nul a {\\n  color: #3c3c3c;\\n}\\n@media only screen and (max-width: 1280px) {\\n  ul a {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  ul a {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  ul a {\\n    font-size: 10px;\\n  }\\n}\\nul a:nth-child(2) {\\n  margin: 0 40px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  ul a:nth-child(2) {\\n    margin: 0 20px;\\n  }\\n}\\n\\n.footer {\\n  position: fixed;\\n  z-index: 10;\\n  bottom: 30px;\\n  left: 120px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .footer {\\n    bottom: 20px;\\n    left: 64px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .footer {\\n    bottom: 20px;\\n    left: 40px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .footer {\\n    bottom: 20px;\\n    left: 40px;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAuCmB,EAAE,4BAAC,CAAC,AACrB,OAAO,CAAE,IAAI,CACb,OAAO,CAAE,EAAE,AACb,CAAC,AACD,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,KAAK,CAAE,OAAO,AAChB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,gBAAE,CAAC,eAAC,WAAW,CAAC,CAAC,AAAC,CAAC,AACjB,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,gBAAE,CAAC,eAAC,WAAW,CAAC,CAAC,AAAC,CAAC,AACjB,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AACH,CAAC,AAED,OAAO,4BAAC,CAAC,AACP,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,KAAK,AACb,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,OAAO,4BAAC,CAAC,AACP,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,IAAI,AACZ,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,OAAO,4BAAC,CAAC,AACP,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,IAAI,AACZ,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,OAAO,4BAAC,CAAC,AACP,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,IAAI,AACZ,CAAC,AACH,CAAC"}`
};
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  import_gsap.gsap.registerPlugin(import_ScrollTrigger.ScrollTrigger);
  let footer;
  $$result.css.add(css$a);
  return `<nav class="${"footer svelte-49kx5s"}"${add_attribute("this", footer, 0)}><ul class="${"svelte-49kx5s"}"><a rel="${"external"}" href="${"https://www.behance.net/gauthamkrishnax"}" class="${"svelte-49kx5s"}"><li>Behance</li></a>
			<a rel="${"external"}" href="${"https://github.com/gauthamkrishnax"}" class="${"svelte-49kx5s"}"><li>Github</li></a>
			<a rel="${"external"}" href="${"https://www.linkedin.com/in/gauthamkrishnas/"}" class="${"svelte-49kx5s"}"><li>LinkedIn</li></a></ul>
	</nav>`;
});
var css$9 = {
  code: 'section.svelte-1ex54m4.svelte-1ex54m4{padding-top:25vh;text-align:center;font-size:18px;padding-right:5em;width:80%;margin:0 auto}@media only screen and (max-width: 1280px){section.svelte-1ex54m4.svelte-1ex54m4{width:100%;margin:0 64px;text-align:left;padding-right:0;padding-top:200px;font-size:12px}}@media only screen and (max-width: 720px){section.svelte-1ex54m4.svelte-1ex54m4{margin:0 40px;padding-right:0;padding-top:120px}}@media only screen and (max-height: 480px){section.svelte-1ex54m4.svelte-1ex54m4{margin:0 40px;padding-right:0;padding-top:120px}}section.svelte-1ex54m4 p.svelte-1ex54m4{color:#505050}h1.svelte-1ex54m4.svelte-1ex54m4{position:relative;z-index:30;margin-top:0.5em;font-family:"harmony", serif;font-size:96px}@media only screen and (max-width: 1280px){h1.svelte-1ex54m4.svelte-1ex54m4{max-width:400px;margin-top:1em;font-size:48px}}@media only screen and (max-width: 720px){h1.svelte-1ex54m4.svelte-1ex54m4{max-width:200px;margin-top:0.5em;font-size:24px}}@media only screen and (max-height: 480px){h1.svelte-1ex54m4.svelte-1ex54m4{max-width:200px;margin-top:0.5em;font-size:24px}}',
  map: `{"version":3,"file":"__error.svelte","sources":["__error.svelte"],"sourcesContent":["<script>\\r\\n\\timport Flower from '../svg/flower.svelte';\\r\\n\\timport Footer from '../components/Footer.svelte';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section>\\r\\n\\t\\t<p>Please check your URL or try after some time</p>\\r\\n\\t\\t<h1>I am sorry, I think you are lost !</h1>\\r\\n\\t\\t<Footer typew=\\"ending\\" />\\r\\n\\t\\t<Flower type=\\"back\\" />\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">section {\\n  padding-top: 25vh;\\n  text-align: center;\\n  font-size: 18px;\\n  padding-right: 5em;\\n  width: 80%;\\n  margin: 0 auto;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section {\\n    width: 100%;\\n    margin: 0 64px;\\n    text-align: left;\\n    padding-right: 0;\\n    padding-top: 200px;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 120px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 120px;\\n  }\\n}\\nsection p {\\n  color: #505050;\\n}\\n\\nh1 {\\n  position: relative;\\n  z-index: 30;\\n  margin-top: 0.5em;\\n  font-family: \\"harmony\\", serif;\\n  font-size: 96px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  h1 {\\n    max-width: 400px;\\n    margin-top: 1em;\\n    font-size: 48px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h1 {\\n    max-width: 200px;\\n    margin-top: 0.5em;\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h1 {\\n    max-width: 200px;\\n    margin-top: 0.5em;\\n    font-size: 24px;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAcmB,OAAO,8BAAC,CAAC,AAC1B,WAAW,CAAE,IAAI,CACjB,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,IAAI,CACf,aAAa,CAAE,GAAG,CAClB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,OAAO,8BAAC,CAAC,AACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,CAClB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,OAAO,8BAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,OAAO,8BAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AACD,sBAAO,CAAC,CAAC,eAAC,CAAC,AACT,KAAK,CAAE,OAAO,AAChB,CAAC,AAED,EAAE,8BAAC,CAAC,AACF,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,SAAS,CAAC,CAAC,KAAK,CAC7B,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,GAAG,CACf,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC"}`
};
var _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$9);
  return `<section class="${"svelte-1ex54m4"}"><p class="${"svelte-1ex54m4"}">Please check your URL or try after some time</p>
		<h1 class="${"svelte-1ex54m4"}">I am sorry, I think you are lost !</h1>
		${validate_component(Footer, "Footer").$$render($$result, { typew: "ending" }, {}, {})}
		${validate_component(Flower, "Flower").$$render($$result, { type: "back" }, {}, {})}
	</section>`;
});
var __error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _error
});
var css$8 = {
  code: "svg.svelte-1yy8zfk{margin:0 20px}",
  map: '{"version":3,"file":"star.svelte","sources":["star.svelte"],"sourcesContent":["<svg width=\\"21\\" height=\\"21\\" viewBox=\\"0 0 21 21\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\n\\t<path\\n\\t\\td=\\"M12.4143 11.2921L20.3438 10.5L12.4143 9.70692L17.4608 3.53916L11.2928 8.58605L10.5 0.65625L9.70692 8.58605L3.53916 3.53916L8.58572 9.70692L0.65625 10.5L8.58572 11.2921L3.53916 17.4605L9.70692 12.4143L10.5 20.3438L11.2928 12.4143L17.4608 17.4605L12.4143 11.2921Z\\"\\n\\t\\tfill=\\"#505050\\"\\n\\t/>\\n</svg>\\n\\n<style>\\n\\tsvg {\\n\\t\\tmargin: 0 20px;\\n\\t}</style>\\n"],"names":[],"mappings":"AAQC,GAAG,eAAC,CAAC,AACJ,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC"}'
};
var Star = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$8);
  return `<svg width="${"21"}" height="${"21"}" viewBox="${"0 0 21 21"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-1yy8zfk"}"><path d="${"M12.4143 11.2921L20.3438 10.5L12.4143 9.70692L17.4608 3.53916L11.2928 8.58605L10.5 0.65625L9.70692 8.58605L3.53916 3.53916L8.58572 9.70692L0.65625 10.5L8.58572 11.2921L3.53916 17.4605L9.70692 12.4143L10.5 20.3438L11.2928 12.4143L17.4608 17.4605L12.4143 11.2921Z"}" fill="${"#505050"}"></path></svg>`;
});
var css$7 = {
  code: '.loader.svelte-ejfx4s.svelte-ejfx4s{background-color:#FFFFF5;position:fixed;overflow:hidden;z-index:50;top:0;bottom:0;left:0;right:0}.loader.svelte-ejfx4s h3.svelte-ejfx4s{font-family:"harmony", serif;letter-spacing:0.15em;position:absolute;width:100%;text-align:center;top:45%}',
  map: `{"version":3,"file":"Loader.svelte","sources":["Loader.svelte"],"sourcesContent":["<script>\\r\\n\\texport let pageName = 'GAUTHAM KRISHNA';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<div class=\\"loader\\">\\r\\n\\t\\t<h3>\\r\\n\\t\\t\\t{pageName}\\r\\n\\t\\t</h3>\\r\\n\\t</div>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">.loader {\\n  background-color: #FFFFF5;\\n  position: fixed;\\n  overflow: hidden;\\n  z-index: 50;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n}\\n.loader h3 {\\n  font-family: \\"harmony\\", serif;\\n  letter-spacing: 0.15em;\\n  position: absolute;\\n  width: 100%;\\n  text-align: center;\\n  top: 45%;\\n}</style>\\r\\n"],"names":[],"mappings":"AAYmB,OAAO,4BAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,CACzB,QAAQ,CAAE,KAAK,CACf,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,EAAE,CACX,GAAG,CAAE,CAAC,CACN,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,AACV,CAAC,AACD,qBAAO,CAAC,EAAE,cAAC,CAAC,AACV,WAAW,CAAE,SAAS,CAAC,CAAC,KAAK,CAC7B,cAAc,CAAE,MAAM,CACtB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,MAAM,CAClB,GAAG,CAAE,GAAG,AACV,CAAC"}`
};
var Loader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pageName = "GAUTHAM KRISHNA" } = $$props;
  if ($$props.pageName === void 0 && $$bindings.pageName && pageName !== void 0)
    $$bindings.pageName(pageName);
  $$result.css.add(css$7);
  return `<div class="${"loader svelte-ejfx4s"}"><h3 class="${"svelte-ejfx4s"}">${escape(pageName)}</h3>
	</div>`;
});
var s1 = "/_app/assets/s1-7a0ae9d9.png";
var s2 = "/_app/assets/s2-5cc3f145.png";
var s3 = "/_app/assets/s3-76b1d3b3.png";
var s4 = "/_app/assets/s4-901ef04f.png";
var s5 = "/_app/assets/s5-e369fa77.png";
var s6 = "/_app/assets/s6-94ade83a.png";
var d1 = "/_app/assets/d1-e899b540.png";
var d2 = "/_app/assets/d2-41da190c.png";
var d3 = "/_app/assets/d3-337815e9.png";
var d4 = "/_app/assets/d4-cc02a9cb.png";
var d5 = "/_app/assets/d5-2b2ae649.png";
var d6 = "/_app/assets/d6-23036b59.png";
var dev = "data:image/png;base64,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";
var projects = [
  {
    name: "Kanakoot",
    about: "Kanakoot is a online calculator that calculates expense per person to balance money spent among groups.",
    ProblemStatement: "Find the individual share in a group expense. Who owes whom and how to tally transaction.",
    Goal: "A website that calculates the group expense and other financial statistics.",
    role: ["Branding", "UX design", "Development"],
    progress: "Completed beta phase",
    route: "/projects/kanakoot",
    link: "https://kanakoot.netlify.app",
    behance: "https://www.behance.net/gallery/126104247/Kanakoot-UIUX",
    github: "https://github.com/gauthamkrishnax/Kanakoot",
    previewImage: [s1, s2, s3, s4, s5, s6],
    designImage: [d1, d2, d3, d4, d5, d6],
    design: {
      logo: "Logo Mark \u2018K\u2019 is formed out of keyline geometric  shapes. The tactile and physical quality of Kanakoot is reflected in the design.",
      typography: "Primary and only font face used is Lato. type scale includes a range of contrasting styles that support the needs of your product and its content.",
      colorPalette: "Color themes are designed to be harmonious, ensure accessible text, and distinguish UI elements and surfaces from one another.",
      components: "Components are grouped into shape categories based on their size. These categories provide a way to change multiple component values at once, by changing the category's values.",
      Elevation: "Shadows provide cues about depth, direction of movement, and surface edges. A surface\u2019s shadow is determined by its elevation and relationship to other surfaces.",
      Animation: "Subtle animations and microinteractions for better user experiance. Motion is used to express a brand\u2019s personality and style. Motion provides timely feedback and indicates the status of user or system actions."
    },
    dev: {
      tools: dev,
      programmingLangauges: "I choose Typescript because of the complex code base and data involved in this project. The intergrated typescript experiance that Gatsby has provide a great developer experiance.  ",
      frontendFrameworks: "Kanakoot is static site made with Gatsby overlayed on React. Gatsby websites are fast and provide good SEO to score all high in lighthouse reports. ",
      styling: "Using Sass, the challenge was to write custom types for each Sass modules. Fonts were pre-fetched from google. Assets are imported directly from the filesystem using webpack. ",
      testing: "All the computing functions and main  front-end components are tested using the jest library to ensure better scalability.",
      other: "Chart.js library for the data visualisations in the calculated report. React helmet to manage document head and gatsby plugins for added functionality.",
      hosting: "Google analytics to measure impact and get insights and Netlify for CI/CD, deployment and scaled hosting."
    },
    extras: "Kanakoot is a project that I started alone. The reason to create this project was a problem that myself encountered. My friends and I had a hard time splitting the expense between ourselve and could have really benefited from a software like Kanakoot. I choose the name Kanakoot because it means to calculate in Malayalam (my native). It took me about 2 weeks to finish of the first stages of this project and my priority was to build a modern website which was assesible and legible and in the process learn and get the experiance to work on more similar projects. "
  }
];
var css$6 = {
  code: 'section.top.svelte-1youaoq.svelte-1youaoq{position:relative;min-height:100vh;height:100%;padding:5em 120px}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq.svelte-1youaoq{min-height:100vh;height:100%;padding:160px 64px}}@media only screen and (max-width: 720px){section.top.svelte-1youaoq.svelte-1youaoq{height:100%;padding:115px 40px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq.svelte-1youaoq{height:100%;padding:115px 40px}}section.top.svelte-1youaoq .container.svelte-1youaoq{display:grid;position:relative;z-index:5;margin-top:3em;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto 1fr}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .container.svelte-1youaoq{margin-top:0;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr}}section.top.svelte-1youaoq .container .projectNo.svelte-1youaoq{position:relative}section.top.svelte-1youaoq .container .projectNo h3.svelte-1youaoq{transform:rotate(-90deg);position:absolute;top:130px;left:-130px;font-size:48px;letter-spacing:0.15em}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .container .projectNo h3.svelte-1youaoq{top:90px;left:-65px;font-size:24px}}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .container .projectNo h3.svelte-1youaoq{left:-40px;font-size:12px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .container .projectNo h3.svelte-1youaoq{left:-40px;font-size:12px}}section.top.svelte-1youaoq .container h2.svelte-1youaoq{grid-column:2/3;font-family:"harmony", serif;color:#3c3c3c}section.top.svelte-1youaoq .container h2.svelte-1youaoq{font-size:75px;line-height:91.35px}@media screen and (min-width: 1280px){section.top.svelte-1youaoq .container h2.svelte-1youaoq{font-size:calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));line-height:calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px)}}@media screen and (min-width: 1920px){section.top.svelte-1youaoq .container h2.svelte-1youaoq{font-size:96px;line-height:125.328px}}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .container h2.svelte-1youaoq{font-size:48px;grid-column:1/3}}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .container h2.svelte-1youaoq{font-size:24px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .container h2.svelte-1youaoq{font-size:24px}}section.top.svelte-1youaoq .content.svelte-1youaoq{grid-area:2/1/3/4}section.top.svelte-1youaoq .content section.svelte-1youaoq{margin:0 auto;margin-top:3em;padding-left:8em;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:150px 150px;max-width:1750px}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .content section.svelte-1youaoq{grid-template-columns:1fr 1fr;grid-template-rows:auto auto auto;margin:0 0;margin-top:1em;padding-left:3em}}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .content section.svelte-1youaoq{margin-top:0.2em;padding-left:0.2em}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .content section.svelte-1youaoq{margin-top:0.2em;padding-left:0.2em}}section.top.svelte-1youaoq .content section article.svelte-1youaoq{height:100px;margin-left:2em}section.top.svelte-1youaoq .content section article h5.svelte-1youaoq{font-family:"harmony", serif;font-size:24px;color:#3c3c3c;margin-bottom:0.2em}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .content section article h5.svelte-1youaoq{font-size:24px}}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .content section article h5.svelte-1youaoq{font-size:14px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .content section article h5.svelte-1youaoq{font-size:14px}}section.top.svelte-1youaoq .content section article h4.svelte-1youaoq{font-family:"harmony", serif;font-size:36px;color:#3c3c3c;margin-bottom:0.2em}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .content section article h4.svelte-1youaoq{font-size:18px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .content section article h4.svelte-1youaoq{font-size:18px}}section.top.svelte-1youaoq .content section article p.svelte-1youaoq{line-height:1.1em;max-width:300px;color:#505050}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .content section article p.svelte-1youaoq{font-size:14px}}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .content section article p.svelte-1youaoq{font-size:10px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .content section article p.svelte-1youaoq{font-size:10px}}section.top.svelte-1youaoq .content section article ul li.svelte-1youaoq{margin-bottom:0.3em;list-style:circle;margin-left:1em;color:#505050}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .content section article ul li.svelte-1youaoq{font-size:10px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .content section article ul li.svelte-1youaoq{font-size:10px}}section.top.svelte-1youaoq .content section .links.svelte-1youaoq{grid-column:1/2}section.top.svelte-1youaoq .content section .links span.svelte-1youaoq{display:flex;align-items:center}section.top.svelte-1youaoq .content section .links span.svelte-1youaoq:hover{transform:translateX(0.1em)}section.top.svelte-1youaoq .content section .links a.svelte-1youaoq{color:#3c3c3c}section.top.svelte-1youaoq .content section .links a.svelte-1youaoq:hover{color:#7E5923}section.top.svelte-1youaoq .content section .links p.svelte-1youaoq{font-size:18px;margin-left:0.2em}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .content section .links p.svelte-1youaoq{font-size:12px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .content section .links p.svelte-1youaoq{font-size:12px}}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .content section .links.svelte-1youaoq{grid-area:2/1/3/3}}section.top.svelte-1youaoq .content section .progress.svelte-1youaoq{grid-column:2/3}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .content section .progress.svelte-1youaoq{grid-area:3/1/4/3}}section.top.svelte-1youaoq .previewContainer.svelte-1youaoq{position:absolute;overflow:hidden;width:50vw;right:0;bottom:0;top:-12vh;z-index:0}section.top.svelte-1youaoq .previewContainer img.svelte-1youaoq{transform:rotate(30deg);position:absolute;overflow:none;bottom:-180px}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .previewContainer img.svelte-1youaoq{bottom:-60px;transform:rotate(0)}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .previewContainer img.svelte-1youaoq{bottom:-60px;transform:rotate(0)}}section.top.svelte-1youaoq .previewContainer .preview1.svelte-1youaoq{right:-15%;width:70%}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .previewContainer .preview1.svelte-1youaoq{width:400px;right:-150px}}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .previewContainer .preview1.svelte-1youaoq{width:250px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .previewContainer .preview1.svelte-1youaoq{width:250px}}section.top.svelte-1youaoq .previewContainer .preview2.svelte-1youaoq{right:15%;bottom:160px;width:45%}@media only screen and (max-width: 1280px){section.top.svelte-1youaoq .previewContainer .preview2.svelte-1youaoq{width:250px;right:0px;bottom:50px}}@media only screen and (max-width: 720px){section.top.svelte-1youaoq .previewContainer .preview2.svelte-1youaoq{width:200px;bottom:-50px;right:-60px}}@media only screen and (max-height: 480px){section.top.svelte-1youaoq .previewContainer .preview2.svelte-1youaoq{width:200px;bottom:-50px;right:-60px}}',
  map: `{"version":3,"file":"ProjectPreview.svelte","sources":["ProjectPreview.svelte"],"sourcesContent":["<script>\\r\\n\\timport Arrow from '../svg/arrow.svelte';\\r\\n\\r\\n\\texport let project;\\r\\n\\texport let no;\\r\\n\\tlet container;\\r\\n\\r\\n\\timport { gsap } from 'gsap/dist/gsap.js';\\r\\n\\timport { ScrollTrigger } from 'gsap/dist/ScrollTrigger.js';\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\r\\n\\tgsap.registerPlugin(ScrollTrigger);\\r\\n\\r\\n\\tonMount(() => {\\r\\n\\t\\tlet q = gsap.utils.selector(container);\\r\\n\\t\\tvar mainAnime = gsap.timeline();\\r\\n\\t\\tvar imageAnime = gsap.timeline();\\r\\n\\t\\tgsap.from(q('.img'), {\\r\\n\\t\\t\\tscrollTrigger: {\\r\\n\\t\\t\\t\\ttrigger: container,\\r\\n\\t\\t\\t\\tstart: 'end top',\\r\\n\\t\\t\\t\\ttoggleActions: 'play none none reset'\\r\\n\\t\\t\\t\\t// markers: true\\r\\n\\t\\t\\t},\\r\\n\\t\\t\\ty: -200,\\r\\n\\t\\t\\trotate: 35,\\r\\n\\t\\t\\topacity: 0,\\r\\n\\t\\t\\tstagger: 0.5,\\r\\n\\t\\t\\tease: 'elastic.out(1.2, 1)',\\r\\n\\t\\t\\tduration: 1\\r\\n\\t\\t});\\r\\n\\r\\n\\t\\tmainAnime\\r\\n\\t\\t\\t.from(q('.projectTitle'), {\\r\\n\\t\\t\\t\\topacity: 0\\r\\n\\t\\t\\t})\\r\\n\\t\\t\\t.from(q('.projectNo'), {\\r\\n\\t\\t\\t\\ty: 20,\\r\\n\\t\\t\\t\\topacity: 0\\r\\n\\t\\t\\t})\\r\\n\\t\\t\\t.from(q('.arti'), {\\r\\n\\t\\t\\t\\tx: 10,\\r\\n\\t\\t\\t\\topacity: 0,\\r\\n\\t\\t\\t\\tstagger: 0.5\\r\\n\\t\\t\\t})\\r\\n\\t\\t\\t.to(q('.img'), {\\r\\n\\t\\t\\t\\tbottom: 300\\r\\n\\t\\t\\t}),\\r\\n\\t\\t\\t'>-2';\\r\\n\\r\\n\\t\\tScrollTrigger.create({\\r\\n\\t\\t\\tanimation: mainAnime,\\r\\n\\t\\t\\ttrigger: container,\\r\\n\\t\\t\\tstart: 'top top',\\r\\n\\t\\t\\tend: '+=2500',\\r\\n\\t\\t\\tscrub: true,\\r\\n\\t\\t\\tpinSpacing: 'margin',\\r\\n\\t\\t\\tpin: true\\r\\n\\t\\t});\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section bind:this={container} class=\\"{project.name} top\\">\\r\\n\\t\\t<div class=\\"container\\">\\r\\n\\t\\t\\t<h2 class=\\"projectTitle\\">{project.name}</h2>\\r\\n\\t\\t\\t<div class=\\"content\\">\\r\\n\\t\\t\\t\\t<div class=\\"projectNo\\">\\r\\n\\t\\t\\t\\t\\t<h3>PROJECT-{no}</h3>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t<section>\\r\\n\\t\\t\\t\\t\\t<article class=\\"arti\\">\\r\\n\\t\\t\\t\\t\\t\\t<h5>About</h5>\\r\\n\\t\\t\\t\\t\\t\\t<p>{project.about}</p>\\r\\n\\t\\t\\t\\t\\t</article>\\r\\n\\t\\t\\t\\t\\t<article class=\\"arti\\">\\r\\n\\t\\t\\t\\t\\t\\t<h5>Role</h5>\\r\\n\\t\\t\\t\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t\\t\\t\\t{#each project.role as role}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<li>{role}</li>\\r\\n\\t\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t\\t\\t</article>\\r\\n\\t\\t\\t\\t\\t<article class=\\"links arti\\">\\r\\n\\t\\t\\t\\t\\t\\t<h4>\\r\\n\\t\\t\\t\\t\\t\\t\\t<a href={project.route}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t><span>Learn more<Arrow direction=\\"right\\" --left-margin=\\".5em\\" /></span></a\\r\\n\\t\\t\\t\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t\\t</h4>\\r\\n\\t\\t\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t\\t\\t<a href={project.link}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t><span\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t>Visit Site<Arrow\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tdirection=\\"right\\"\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t--left-margin=\\".5em\\"\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t--width-size=\\"15px\\"\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t/></span\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t></a\\r\\n\\t\\t\\t\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t\\t</article>\\r\\n\\t\\t\\t\\t\\t<article class=\\"progress arti\\">\\r\\n\\t\\t\\t\\t\\t\\t<h5>Progress</h5>\\r\\n\\t\\t\\t\\t\\t\\t<p>{project.progress}</p>\\r\\n\\t\\t\\t\\t\\t</article>\\r\\n\\t\\t\\t\\t</section>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t\\t<div class=\\"previewContainer\\">\\r\\n\\t\\t\\t<img class=\\"preview2 img\\" src={project.previewImage[1]} alt=\\"Screenshot\\" />\\r\\n\\t\\t\\t<img class=\\"preview1 img\\" src={project.previewImage[0]} alt=\\"Screenshot\\" />\\r\\n\\t\\t</div>\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">section.top {\\n  position: relative;\\n  min-height: 100vh;\\n  height: 100%;\\n  padding: 5em 120px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top {\\n    min-height: 100vh;\\n    height: 100%;\\n    padding: 160px 64px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top {\\n    height: 100%;\\n    padding: 115px 40px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top {\\n    height: 100%;\\n    padding: 115px 40px;\\n  }\\n}\\nsection.top .container {\\n  display: grid;\\n  position: relative;\\n  z-index: 5;\\n  margin-top: 3em;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  grid-template-rows: auto 1fr;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .container {\\n    margin-top: 0;\\n    grid-template-columns: 1fr 1fr;\\n    grid-template-rows: auto 1fr;\\n  }\\n}\\nsection.top .container .projectNo {\\n  position: relative;\\n}\\nsection.top .container .projectNo h3 {\\n  transform: rotate(-90deg);\\n  position: absolute;\\n  top: 130px;\\n  left: -130px;\\n  font-size: 48px;\\n  letter-spacing: 0.15em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .container .projectNo h3 {\\n    top: 90px;\\n    left: -65px;\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .container .projectNo h3 {\\n    left: -40px;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .container .projectNo h3 {\\n    left: -40px;\\n    font-size: 12px;\\n  }\\n}\\nsection.top .container h2 {\\n  grid-column: 2/3;\\n  font-family: \\"harmony\\", serif;\\n  color: #3c3c3c;\\n}\\nsection.top .container h2 {\\n  font-size: 75px;\\n  line-height: 91.35px;\\n}\\n@media screen and (min-width: 1280px) {\\n  section.top .container h2 {\\n    font-size: calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));\\n    line-height: calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px);\\n  }\\n}\\n@media screen and (min-width: 1920px) {\\n  section.top .container h2 {\\n    font-size: 96px;\\n    line-height: 125.328px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .container h2 {\\n    font-size: 48px;\\n    grid-column: 1/3;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .container h2 {\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .container h2 {\\n    font-size: 24px;\\n  }\\n}\\nsection.top .content {\\n  grid-area: 2/1/3/4;\\n}\\nsection.top .content section {\\n  margin: 0 auto;\\n  margin-top: 3em;\\n  padding-left: 8em;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  grid-template-rows: 150px 150px;\\n  max-width: 1750px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section {\\n    grid-template-columns: 1fr 1fr;\\n    grid-template-rows: auto auto auto;\\n    margin: 0 0;\\n    margin-top: 1em;\\n    padding-left: 3em;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section {\\n    margin-top: 0.2em;\\n    padding-left: 0.2em;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section {\\n    margin-top: 0.2em;\\n    padding-left: 0.2em;\\n  }\\n}\\nsection.top .content section article {\\n  height: 100px;\\n  margin-left: 2em;\\n}\\nsection.top .content section article h5 {\\n  font-family: \\"harmony\\", serif;\\n  font-size: 24px;\\n  color: #3c3c3c;\\n  margin-bottom: 0.2em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section article h5 {\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section article h5 {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section article h5 {\\n    font-size: 14px;\\n  }\\n}\\nsection.top .content section article h4 {\\n  font-family: \\"harmony\\", serif;\\n  font-size: 36px;\\n  color: #3c3c3c;\\n  margin-bottom: 0.2em;\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section article h4 {\\n    font-size: 18px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section article h4 {\\n    font-size: 18px;\\n  }\\n}\\nsection.top .content section article p {\\n  line-height: 1.1em;\\n  max-width: 300px;\\n  color: #505050;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section article p {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section article p {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section article p {\\n    font-size: 10px;\\n  }\\n}\\nsection.top .content section article ul li {\\n  margin-bottom: 0.3em;\\n  list-style: circle;\\n  margin-left: 1em;\\n  color: #505050;\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section article ul li {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section article ul li {\\n    font-size: 10px;\\n  }\\n}\\nsection.top .content section .links {\\n  grid-column: 1/2;\\n}\\nsection.top .content section .links span {\\n  display: flex;\\n  align-items: center;\\n}\\nsection.top .content section .links span:hover {\\n  transform: translateX(0.1em);\\n}\\nsection.top .content section .links a {\\n  color: #3c3c3c;\\n}\\nsection.top .content section .links a:hover {\\n  color: #7E5923;\\n}\\nsection.top .content section .links p {\\n  font-size: 18px;\\n  margin-left: 0.2em;\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section .links p {\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section .links p {\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section .links {\\n    grid-area: 2/1/3/3;\\n  }\\n}\\nsection.top .content section .progress {\\n  grid-column: 2/3;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section .progress {\\n    grid-area: 3/1/4/3;\\n  }\\n}\\nsection.top .previewContainer {\\n  position: absolute;\\n  overflow: hidden;\\n  width: 50vw;\\n  right: 0;\\n  bottom: 0;\\n  top: -12vh;\\n  z-index: 0;\\n}\\nsection.top .previewContainer img {\\n  transform: rotate(30deg);\\n  position: absolute;\\n  overflow: none;\\n  bottom: -180px;\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .previewContainer img {\\n    bottom: -60px;\\n    transform: rotate(0);\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .previewContainer img {\\n    bottom: -60px;\\n    transform: rotate(0);\\n  }\\n}\\nsection.top .previewContainer .preview1 {\\n  right: -15%;\\n  width: 70%;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .previewContainer .preview1 {\\n    width: 400px;\\n    right: -150px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .previewContainer .preview1 {\\n    width: 250px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .previewContainer .preview1 {\\n    width: 250px;\\n  }\\n}\\nsection.top .previewContainer .preview2 {\\n  right: 15%;\\n  bottom: 160px;\\n  width: 45%;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .previewContainer .preview2 {\\n    width: 250px;\\n    right: 0px;\\n    bottom: 50px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .previewContainer .preview2 {\\n    width: 200px;\\n    bottom: -50px;\\n    right: -60px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .previewContainer .preview2 {\\n    width: 200px;\\n    bottom: -50px;\\n    right: -60px;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
};
var ProjectPreview = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { project } = $$props;
  let { no } = $$props;
  let container;
  import_gsap.gsap.registerPlugin(import_ScrollTrigger.ScrollTrigger);
  if ($$props.project === void 0 && $$bindings.project && project !== void 0)
    $$bindings.project(project);
  if ($$props.no === void 0 && $$bindings.no && no !== void 0)
    $$bindings.no(no);
  $$result.css.add(css$6);
  return `<section class="${escape(project.name) + " top svelte-1youaoq"}"${add_attribute("this", container, 0)}><div class="${"container svelte-1youaoq"}"><h2 class="${"projectTitle svelte-1youaoq"}">${escape(project.name)}</h2>
			<div class="${"content svelte-1youaoq"}"><div class="${"projectNo svelte-1youaoq"}"><h3 class="${"svelte-1youaoq"}">PROJECT-${escape(no)}</h3></div>
				<section class="${"svelte-1youaoq"}"><article class="${"arti svelte-1youaoq"}"><h5 class="${"svelte-1youaoq"}">About</h5>
						<p class="${"svelte-1youaoq"}">${escape(project.about)}</p></article>
					<article class="${"arti svelte-1youaoq"}"><h5 class="${"svelte-1youaoq"}">Role</h5>
						<ul>${each(project.role, (role) => `<li class="${"svelte-1youaoq"}">${escape(role)}</li>`)}</ul></article>
					<article class="${"links arti svelte-1youaoq"}"><h4 class="${"svelte-1youaoq"}"><a${add_attribute("href", project.route, 0)} class="${"svelte-1youaoq"}"><span class="${"svelte-1youaoq"}">Learn more<div style="display: contents; --left-margin:${".5em"};">${validate_component(Arrow, "Arrow").$$render($$result, { direction: "right" }, {}, {})}</div></span></a></h4>
						<p class="${"svelte-1youaoq"}"><a${add_attribute("href", project.link, 0)} class="${"svelte-1youaoq"}"><span class="${"svelte-1youaoq"}">Visit Site<div style="display: contents; --left-margin:${".5em"}; --width-size:${"15px"};">${validate_component(Arrow, "Arrow").$$render($$result, { direction: "right" }, {}, {})}</div></span></a></p></article>
					<article class="${"progress arti svelte-1youaoq"}"><h5 class="${"svelte-1youaoq"}">Progress</h5>
						<p class="${"svelte-1youaoq"}">${escape(project.progress)}</p></article></section></div></div>
		<div class="${"previewContainer svelte-1youaoq"}"><img class="${"preview2 img svelte-1youaoq"}"${add_attribute("src", project.previewImage[1], 0)} alt="${"Screenshot"}">
			<img class="${"preview1 img svelte-1youaoq"}"${add_attribute("src", project.previewImage[0], 0)} alt="${"Screenshot"}"></div>
	</section>`;
});
var css$5 = {
  code: 'main.svelte-40f6vv.svelte-40f6vv{display:grid;grid-template-columns:1.5fr 1fr;margin-top:12vh;height:100vh}@media only screen and (max-width: 1280px){main.svelte-40f6vv.svelte-40f6vv{margin-top:100px;height:100vh;grid-template-columns:1fr;grid-template-rows:1.5fr 1fr}}@media only screen and (max-width: 720px){main.svelte-40f6vv.svelte-40f6vv{margin-top:30px}}@media only screen and (max-height: 480px){main.svelte-40f6vv.svelte-40f6vv{margin-top:30px}}main.svelte-40f6vv .hero.svelte-40f6vv{margin:8vh 20px 0 120px;max-width:1000px}main.svelte-40f6vv .hero div.svelte-40f6vv{margin-top:10px;display:flex;align-items:center;font-size:24px;color:#505050;letter-spacing:0.15em}@media only screen and (max-width: 1280px){main.svelte-40f6vv .hero div.svelte-40f6vv{margin-top:10px;font-size:18px}}@media only screen and (max-width: 720px){main.svelte-40f6vv .hero div.svelte-40f6vv{margin-top:5px;font-size:14px}}@media only screen and (max-height: 480px){main.svelte-40f6vv .hero div.svelte-40f6vv{margin-top:5px;font-size:14px}}@media only screen and (max-width: 1280px){main.svelte-40f6vv .hero.svelte-40f6vv{max-width:500px;margin:100px 20px 20px 64px}}@media only screen and (max-width: 720px){main.svelte-40f6vv .hero.svelte-40f6vv{max-width:250px;margin:100px 10px 10px 40px}}@media only screen and (max-height: 480px){main.svelte-40f6vv .hero.svelte-40f6vv{max-width:250px;margin:100px 10px 10px 40px}}main.svelte-40f6vv .hero-illu.svelte-40f6vv{position:absolute;width:35%;top:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 2fr 2fr}@media only screen and (max-width: 1280px){main.svelte-40f6vv .hero-illu .changePdivOne.svelte-40f6vv{grid-column:2/3;grid-row:2/3}}@media only screen and (max-width: 1280px){main.svelte-40f6vv .hero-illu .changePdivTwo.svelte-40f6vv{grid-column:3/4;grid-row:1/2}}@media only screen and (max-width: 1280px){main.svelte-40f6vv .hero-illu.svelte-40f6vv{opacity:30%;top:auto;bottom:0;right:0;width:100%;height:40%;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr}}main.svelte-40f6vv .hero-illu div.svelte-40f6vv{border-top:1px solid #d1d1d1;border-left:1px solid #d1d1d1}h1.svelte-40f6vv.svelte-40f6vv{font-family:"harmony", serif;line-height:119px;letter-spacing:0.015em;color:#3c3c3c}h1.svelte-40f6vv.svelte-40f6vv{font-size:75px;line-height:91.35px}@media screen and (min-width: 1280px){h1.svelte-40f6vv.svelte-40f6vv{font-size:calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));line-height:calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px)}}@media screen and (min-width: 1920px){h1.svelte-40f6vv.svelte-40f6vv{font-size:96px;line-height:125.328px}}@media only screen and (max-width: 1280px){h1.svelte-40f6vv.svelte-40f6vv{font-size:48px;line-height:60px}}@media only screen and (max-width: 720px){h1.svelte-40f6vv.svelte-40f6vv{font-size:24px;line-height:30px}}@media only screen and (max-height: 480px){h1.svelte-40f6vv.svelte-40f6vv{font-size:24px;line-height:30px}}.noiseBG.svelte-40f6vv.svelte-40f6vv{mix-blend-mode:multiply;opacity:0.15;height:100%;width:100%}@media only screen and (max-width: 1280px){.noiseBG.svelte-40f6vv.svelte-40f6vv{opacity:0.3}}',
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport const prerender = true;\\r\\n<\/script>\\r\\n\\r\\n<script>\\r\\n\\timport { gsap } from 'gsap/dist/gsap.js';\\r\\n\\timport { SteppedEase } from 'gsap/dist/gsap.js';\\r\\n\\timport { ScrollTrigger } from 'gsap/dist/ScrollTrigger.js';\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\r\\n\\timport noise from '../assets/noise.png';\\r\\n\\r\\n\\timport Star from '../svg/star.svelte';\\r\\n\\timport Flower from '../svg/flower.svelte';\\r\\n\\timport Loader from '../components/Loader.svelte';\\r\\n\\timport Footer from '../components/Footer.svelte';\\r\\n\\timport CircleType from '../components/CircleType.svelte';\\r\\n\\timport { projects } from '../Projects/ProjectDetails';\\r\\n\\timport ProjectPreview from '../components/ProjectPreview.svelte';\\r\\n\\timport Ending from '../components/Ending.svelte';\\r\\n\\r\\n\\tlet content = 'hide';\\r\\n\\tlet gridContainer, hero;\\r\\n\\r\\n\\tgsap.registerPlugin(ScrollTrigger);\\r\\n\\r\\n\\tonMount(() => {\\r\\n\\t\\tcontent = 'show';\\r\\n\\t\\tlet q = gsap.utils.selector(gridContainer);\\r\\n\\r\\n\\t\\t//ANIMATION\\r\\n\\t\\tvar staticAnime = gsap.timeline();\\r\\n\\t\\tvar mainAnime = gsap.timeline();\\r\\n\\t\\tgsap.from(hero, {\\r\\n\\t\\t\\topacity: 0,\\r\\n\\t\\t\\tx: -30,\\r\\n\\t\\t\\tduration: 1,\\r\\n\\t\\t\\tdelay: 0.5\\r\\n\\t\\t});\\r\\n\\t\\tgsap.to(q('.noiseBG'), {\\r\\n\\t\\t\\tduration: 0.03,\\r\\n\\t\\t\\trepeat: -1,\\r\\n\\t\\t\\tonRepeat: repeatStatic,\\r\\n\\t\\t\\tease: SteppedEase.config(1)\\r\\n\\t\\t});\\r\\n\\t\\tgsap.set(q('.noiseBG'), {\\r\\n\\t\\t\\tbackgroundImage: \`url(\${noise})\`\\r\\n\\t\\t});\\r\\n\\t\\tfunction repeatStatic() {\\r\\n\\t\\t\\tgsap.set(q('.noiseBG'), {\\r\\n\\t\\t\\t\\tbackgroundPosition:\\r\\n\\t\\t\\t\\t\\tMath.floor(Math.random() * 100) + 1 + '% ' + Math.floor(Math.random() * 10) + 1 + '%'\\r\\n\\t\\t\\t});\\r\\n\\t\\t}\\r\\n\\t\\tstaticAnime\\r\\n\\t\\t\\t.from(q('.changePdivTwo'), {\\r\\n\\t\\t\\t\\topacity: 0.5,\\r\\n\\t\\t\\t\\twidth: 0,\\r\\n\\t\\t\\t\\tduration: 1\\r\\n\\t\\t\\t})\\r\\n\\t\\t\\t.from(\\r\\n\\t\\t\\t\\tq('.changePdivOne'),\\r\\n\\t\\t\\t\\t{\\r\\n\\t\\t\\t\\t\\topacity: 0.5,\\r\\n\\t\\t\\t\\t\\theight: 0,\\r\\n\\t\\t\\t\\t\\tduration: 1\\r\\n\\t\\t\\t\\t},\\r\\n\\t\\t\\t\\t'>-0.4'\\r\\n\\t\\t\\t);\\r\\n\\t\\tmainAnime.to(gridContainer, {\\r\\n\\t\\t\\tscrollTrigger: {\\r\\n\\t\\t\\t\\ttrigger: gridContainer,\\r\\n\\t\\t\\t\\tstart: 'end top',\\r\\n\\t\\t\\t\\tscrub: true\\r\\n\\t\\t\\t},\\r\\n\\t\\t\\topacity: 0\\r\\n\\t\\t});\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>Gautham Krishna - Home</title>\\r\\n</svelte:head>\\r\\n\\r\\n\\r\\n\\t{#if content === 'hide'}\\r\\n\\t\\t<Loader />\\r\\n\\t{/if}\\r\\n\\t<Footer />\\r\\n\\t<CircleType\\r\\n\\t\\ttypeText=\\"| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL DOWN &ensp; || &ensp; MY WORKS &ensp; |\\"\\r\\n\\t/>\\r\\n\\t<div class={content}>\\r\\n\\t\\t<main>\\r\\n\\t\\t\\t<div bind:this={hero} class=\\"hero\\">\\r\\n\\t\\t\\t\\t<h1>Whatever the problem, being part of the solution.</h1>\\r\\n\\t\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t\\t<span>Designer</span>\\r\\n\\t\\t\\t\\t\\t<Star />\\r\\n\\t\\t\\t\\t\\t<span>Developer</span>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div bind:this={gridContainer} class=\\"hero-illu\\">\\r\\n\\t\\t\\t\\t<div />\\r\\n\\t\\t\\t\\t<div />\\r\\n\\t\\t\\t\\t<div />\\r\\n\\t\\t\\t\\t<div />\\r\\n\\t\\t\\t\\t<div />\\r\\n\\t\\t\\t\\t<div class=\\"noiseBG changePdivTwo\\" />\\r\\n\\t\\t\\t\\t<div class=\\"noiseBG changePdivOne\\" />\\r\\n\\t\\t\\t\\t<div />\\r\\n\\t\\t\\t\\t<div />\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<Flower />\\r\\n\\t\\t</main>\\r\\n\\t\\t<ProjectPreview project={projects[0]} no={1} />\\r\\n\\t\\t<Ending />\\r\\n\\t</div>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">main {\\n  display: grid;\\n  grid-template-columns: 1.5fr 1fr;\\n  margin-top: 12vh;\\n  height: 100vh;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main {\\n    margin-top: 100px;\\n    height: 100vh;\\n    grid-template-columns: 1fr;\\n    grid-template-rows: 1.5fr 1fr;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main {\\n    margin-top: 30px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main {\\n    margin-top: 30px;\\n  }\\n}\\nmain .hero {\\n  margin: 8vh 20px 0 120px;\\n  max-width: 1000px;\\n}\\nmain .hero div {\\n  margin-top: 10px;\\n  display: flex;\\n  align-items: center;\\n  font-size: 24px;\\n  color: #505050;\\n  letter-spacing: 0.15em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero div {\\n    margin-top: 10px;\\n    font-size: 18px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main .hero div {\\n    margin-top: 5px;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .hero div {\\n    margin-top: 5px;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero {\\n    max-width: 500px;\\n    margin: 100px 20px 20px 64px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main .hero {\\n    max-width: 250px;\\n    margin: 100px 10px 10px 40px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .hero {\\n    max-width: 250px;\\n    margin: 100px 10px 10px 40px;\\n  }\\n}\\nmain .hero-illu {\\n  position: absolute;\\n  width: 35%;\\n  top: 0;\\n  right: 0;\\n  bottom: 0;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  grid-template-rows: 1fr 2fr 2fr;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero-illu .changePdivOne {\\n    grid-column: 2/3;\\n    grid-row: 2/3;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero-illu .changePdivTwo {\\n    grid-column: 3/4;\\n    grid-row: 1/2;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero-illu {\\n    opacity: 30%;\\n    top: auto;\\n    bottom: 0;\\n    right: 0;\\n    width: 100%;\\n    height: 40%;\\n    grid-template-columns: 1fr 1fr 1fr;\\n    grid-template-rows: 1fr 1fr;\\n  }\\n}\\nmain .hero-illu div {\\n  border-top: 1px solid #d1d1d1;\\n  border-left: 1px solid #d1d1d1;\\n}\\n\\nh1 {\\n  font-family: \\"harmony\\", serif;\\n  line-height: 119px;\\n  letter-spacing: 0.015em;\\n  color: #3c3c3c;\\n}\\nh1 {\\n  font-size: 75px;\\n  line-height: 91.35px;\\n}\\n@media screen and (min-width: 1280px) {\\n  h1 {\\n    font-size: calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));\\n    line-height: calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px);\\n  }\\n}\\n@media screen and (min-width: 1920px) {\\n  h1 {\\n    font-size: 96px;\\n    line-height: 125.328px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  h1 {\\n    font-size: 48px;\\n    line-height: 60px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h1 {\\n    font-size: 24px;\\n    line-height: 30px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h1 {\\n    font-size: 24px;\\n    line-height: 30px;\\n  }\\n}\\n\\n.noiseBG {\\n  mix-blend-mode: multiply;\\n  opacity: 0.15;\\n  height: 100%;\\n  width: 100%;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .noiseBG {\\n    opacity: 0.3;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
};
var prerender$2 = true;
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let content = "hide";
  let gridContainer, hero;
  import_gsap.gsap.registerPlugin(import_ScrollTrigger.ScrollTrigger);
  $$result.css.add(css$5);
  return `${$$result.head += `${$$result.title = `<title>Gautham Krishna - Home</title>`, ""}`, ""}


	${`${validate_component(Loader, "Loader").$$render($$result, {}, {}, {})}`}
	${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}
	${validate_component(CircleType_1, "CircleType").$$render($$result, {
    typeText: "| \u2002 PORTFOLIO \u2002 || \u2002 SCROLL DOWN \u2002 || \u2002 MY WORKS \u2002 |"
  }, {}, {})}
	<div class="${escape(null_to_empty(content)) + " svelte-40f6vv"}"><main class="${"svelte-40f6vv"}"><div class="${"hero svelte-40f6vv"}"${add_attribute("this", hero, 0)}><h1 class="${"svelte-40f6vv"}">Whatever the problem, being part of the solution.</h1>
				<div class="${"svelte-40f6vv"}"><span>Designer</span>
					${validate_component(Star, "Star").$$render($$result, {}, {}, {})}
					<span>Developer</span></div></div>
			<div class="${"hero-illu svelte-40f6vv"}"${add_attribute("this", gridContainer, 0)}><div class="${"svelte-40f6vv"}"></div>
				<div class="${"svelte-40f6vv"}"></div>
				<div class="${"svelte-40f6vv"}"></div>
				<div class="${"svelte-40f6vv"}"></div>
				<div class="${"svelte-40f6vv"}"></div>
				<div class="${"noiseBG changePdivTwo svelte-40f6vv"}"></div>
				<div class="${"noiseBG changePdivOne svelte-40f6vv"}"></div>
				<div class="${"svelte-40f6vv"}"></div>
				<div class="${"svelte-40f6vv"}"></div></div>
			${validate_component(Flower, "Flower").$$render($$result, {}, {}, {})}</main>
		${validate_component(ProjectPreview, "ProjectPreview").$$render($$result, { project: projects[0], no: 1 }, {}, {})}
		${validate_component(Ending, "Ending").$$render($$result, {}, {}, {})}
	</div>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  prerender: prerender$2
});
var css$4 = {
  code: 'img.svelte-dye0nl{width:80%}h6.svelte-dye0nl{font-family:"harmony", serif;font-size:24px;color:#3c3c3c;margin-bottom:0.5em}@media only screen and (max-width: 1280px){h6.svelte-dye0nl{font-size:18px}}@media only screen and (max-width: 720px){h6.svelte-dye0nl{font-size:14px}}@media only screen and (max-height: 480px){h6.svelte-dye0nl{font-size:14px}}p.svelte-dye0nl{color:#505050;max-width:450px;line-height:18px}@media only screen and (max-width: 720px){p.svelte-dye0nl{line-height:1em;font-size:8px}}@media only screen and (max-height: 480px){p.svelte-dye0nl{line-height:1em;font-size:8px}}',
  map: '{"version":3,"file":"Card.svelte","sources":["Card.svelte"],"sourcesContent":["<script>\\r\\n\\texport let img, heading, para;\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<article>\\r\\n\\t\\t{#if img}\\r\\n\\t\\t\\t<img src={img} alt={heading} />\\r\\n\\t\\t{/if}\\r\\n\\t\\t<h6>{heading}</h6>\\r\\n\\t\\t<p>{para}</p>\\r\\n\\t</article>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">img {\\n  width: 80%;\\n}\\n\\nh6 {\\n  font-family: \\"harmony\\", serif;\\n  font-size: 24px;\\n  color: #3c3c3c;\\n  margin-bottom: 0.5em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  h6 {\\n    font-size: 18px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h6 {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h6 {\\n    font-size: 14px;\\n  }\\n}\\n\\np {\\n  color: #505050;\\n  max-width: 450px;\\n  line-height: 18px;\\n}\\n@media only screen and (max-width: 720px) {\\n  p {\\n    line-height: 1em;\\n    font-size: 8px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  p {\\n    line-height: 1em;\\n    font-size: 8px;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAcmB,GAAG,cAAC,CAAC,AACtB,KAAK,CAAE,GAAG,AACZ,CAAC,AAED,EAAE,cAAC,CAAC,AACF,WAAW,CAAE,SAAS,CAAC,CAAC,KAAK,CAC7B,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,OAAO,CACd,aAAa,CAAE,KAAK,AACtB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,EAAE,cAAC,CAAC,AACF,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,EAAE,cAAC,CAAC,AACF,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,EAAE,cAAC,CAAC,AACF,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AAED,CAAC,cAAC,CAAC,AACD,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,CAAC,cAAC,CAAC,AACD,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,GAAG,AAChB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,CAAC,cAAC,CAAC,AACD,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,GAAG,AAChB,CAAC,AACH,CAAC"}'
};
var Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { img, heading, para } = $$props;
  if ($$props.img === void 0 && $$bindings.img && img !== void 0)
    $$bindings.img(img);
  if ($$props.heading === void 0 && $$bindings.heading && heading !== void 0)
    $$bindings.heading(heading);
  if ($$props.para === void 0 && $$bindings.para && para !== void 0)
    $$bindings.para(para);
  $$result.css.add(css$4);
  return `<article>${img ? `<img${add_attribute("src", img, 0)}${add_attribute("alt", heading, 0)} class="${"svelte-dye0nl"}">` : ``}
		<h6 class="${"svelte-dye0nl"}">${escape(heading)}</h6>
		<p class="${"svelte-dye0nl"}">${escape(para)}</p>
	</article>`;
});
var css$3 = {
  code: "svg.svelte-wnviee{margin-left:0.5em}@media only screen and (max-width: 1280px){svg.svelte-wnviee{width:1.5em}}@media only screen and (max-width: 720px){svg.svelte-wnviee{width:1em}}@media only screen and (max-height: 480px){svg.svelte-wnviee{width:1em}}",
  map: '{"version":3,"file":"link.svelte","sources":["link.svelte"],"sourcesContent":["<svg width=\\"34\\" height=\\"34\\" viewBox=\\"0 0 34 34\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\r\\n\\t<path\\r\\n\\t\\td=\\"M25.5 18.4167V26.9167C25.5 27.6681 25.2015 28.3888 24.6701 28.9201C24.1388 29.4515 23.4181 29.75 22.6667 29.75H7.08333C6.33189 29.75 5.61122 29.4515 5.07986 28.9201C4.54851 28.3888 4.25 27.6681 4.25 26.9167V11.3333C4.25 10.5819 4.54851 9.86122 5.07986 9.32986C5.61122 8.79851 6.33189 8.5 7.08333 8.5H15.5833\\"\\r\\n\\t\\tstroke=\\"#4E4E4E\\"\\r\\n\\t\\tstroke-width=\\"2\\"\\r\\n\\t\\tstroke-linecap=\\"round\\"\\r\\n\\t\\tstroke-linejoin=\\"round\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M21.25 4.25H29.75V12.75\\"\\r\\n\\t\\tstroke=\\"#4E4E4E\\"\\r\\n\\t\\tstroke-width=\\"2\\"\\r\\n\\t\\tstroke-linecap=\\"round\\"\\r\\n\\t\\tstroke-linejoin=\\"round\\"\\r\\n\\t/>\\r\\n\\t<path\\r\\n\\t\\td=\\"M14.1666 19.8333L29.75 4.25\\"\\r\\n\\t\\tstroke=\\"#4E4E4E\\"\\r\\n\\t\\tstroke-width=\\"2\\"\\r\\n\\t\\tstroke-linecap=\\"round\\"\\r\\n\\t\\tstroke-linejoin=\\"round\\"\\r\\n\\t/>\\r\\n</svg>\\r\\n\\r\\n<style lang=\\"scss\\">svg {\\n  margin-left: 0.5em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  svg {\\n    width: 1.5em;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  svg {\\n    width: 1em;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  svg {\\n    width: 1em;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAwBmB,GAAG,cAAC,CAAC,AACtB,WAAW,CAAE,KAAK,AACpB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,GAAG,cAAC,CAAC,AACH,KAAK,CAAE,KAAK,AACd,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,GAAG,cAAC,CAAC,AACH,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,GAAG,cAAC,CAAC,AACH,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC"}'
};
var Link = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$3);
  return `<svg width="${"34"}" height="${"34"}" viewBox="${"0 0 34 34"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-wnviee"}"><path d="${"M25.5 18.4167V26.9167C25.5 27.6681 25.2015 28.3888 24.6701 28.9201C24.1388 29.4515 23.4181 29.75 22.6667 29.75H7.08333C6.33189 29.75 5.61122 29.4515 5.07986 28.9201C4.54851 28.3888 4.25 27.6681 4.25 26.9167V11.3333C4.25 10.5819 4.54851 9.86122 5.07986 9.32986C5.61122 8.79851 6.33189 8.5 7.08333 8.5H15.5833"}" stroke="${"#4E4E4E"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}"></path><path d="${"M21.25 4.25H29.75V12.75"}" stroke="${"#4E4E4E"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}"></path><path d="${"M14.1666 19.8333L29.75 4.25"}" stroke="${"#4E4E4E"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}"></path></svg>`;
});
var css$2 = {
  code: 'main.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{overflow:hidden}.content.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{min-height:100vh;margin:14vh 120px 0 120px}@media only screen and (max-width: 1280px){.content.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{margin:180px 64px 20px 64px}}@media only screen and (max-width: 720px){.content.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{margin:120px 40px 10px 40px}}@media only screen and (max-height: 480px){.content.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{margin:120px 40px 10px 40px}}@media only screen and (max-width: 720px){.content.svelte-7uqp3h .role.svelte-7uqp3h.svelte-7uqp3h{font-size:10px}}@media only screen and (max-height: 480px){.content.svelte-7uqp3h .role.svelte-7uqp3h.svelte-7uqp3h{font-size:10px}}.content.svelte-7uqp3h .hero.svelte-7uqp3h.svelte-7uqp3h{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}.content.svelte-7uqp3h .hero ul.svelte-7uqp3h.svelte-7uqp3h{margin-top:2em;margin-left:1em}.content.svelte-7uqp3h .hero ul li.svelte-7uqp3h.svelte-7uqp3h{list-style:circle;margin-top:2em}.content.svelte-7uqp3h .hero ul li p.svelte-7uqp3h.svelte-7uqp3h{color:#505050;margin-top:0.5em;max-width:450px;line-height:18px}@media only screen and (max-width: 720px){.content.svelte-7uqp3h .hero ul li p.svelte-7uqp3h.svelte-7uqp3h{line-height:1em;font-size:10px}}@media only screen and (max-height: 480px){.content.svelte-7uqp3h .hero ul li p.svelte-7uqp3h.svelte-7uqp3h{line-height:1em;font-size:10px}}.content.svelte-7uqp3h .hero ul h5.svelte-7uqp3h.svelte-7uqp3h{font-family:"harmony", serif;color:#3c3c3c;font-size:24px}@media only screen and (max-width: 1280px){.content.svelte-7uqp3h .hero ul h5.svelte-7uqp3h.svelte-7uqp3h{font-size:18px}}@media only screen and (max-width: 720px){.content.svelte-7uqp3h .hero ul h5.svelte-7uqp3h.svelte-7uqp3h{font-size:14px}}@media only screen and (max-height: 480px){.content.svelte-7uqp3h .hero ul h5.svelte-7uqp3h.svelte-7uqp3h{font-size:14px}}.content.svelte-7uqp3h .hero div.svelte-7uqp3h.svelte-7uqp3h{position:relative}.content.svelte-7uqp3h .hero div img.svelte-7uqp3h.svelte-7uqp3h{width:450px;position:absolute}@media only screen and (max-width: 1280px){.content.svelte-7uqp3h .hero div img.svelte-7uqp3h.svelte-7uqp3h{width:200px}}.content.svelte-7uqp3h .hero div .img1.svelte-7uqp3h.svelte-7uqp3h{top:-70px;right:0}@media only screen and (max-width: 1280px){.content.svelte-7uqp3h .hero div .img1.svelte-7uqp3h.svelte-7uqp3h{top:10px}}@media only screen and (max-width: 720px){.content.svelte-7uqp3h .hero div .img1.svelte-7uqp3h.svelte-7uqp3h{top:30px;right:-120px}}@media only screen and (max-height: 480px){.content.svelte-7uqp3h .hero div .img1.svelte-7uqp3h.svelte-7uqp3h{top:30px;right:-120px}}.content.svelte-7uqp3h .hero div .img2.svelte-7uqp3h.svelte-7uqp3h{top:100px;right:150px}@media only screen and (max-width: 1280px){.content.svelte-7uqp3h .hero div .img2.svelte-7uqp3h.svelte-7uqp3h{right:40px;top:90px}}@media only screen and (max-width: 720px){.content.svelte-7uqp3h .hero div .img2.svelte-7uqp3h.svelte-7uqp3h{right:-180px}}@media only screen and (max-height: 480px){.content.svelte-7uqp3h .hero div .img2.svelte-7uqp3h.svelte-7uqp3h{right:-180px}}.content.svelte-7uqp3h .designdev.svelte-7uqp3h.svelte-7uqp3h{margin-top:8em}@media only screen and (max-width: 1280px){.content.svelte-7uqp3h .designdev.svelte-7uqp3h.svelte-7uqp3h{margin-top:6em}}.content.svelte-7uqp3h .designdev .devtools.svelte-7uqp3h.svelte-7uqp3h{margin-top:1em}@media only screen and (max-width: 1280px){.content.svelte-7uqp3h .designdev .devtools.svelte-7uqp3h.svelte-7uqp3h{width:200px}}.content.svelte-7uqp3h .designdev .devinfo.svelte-7uqp3h.svelte-7uqp3h{max-width:1000px;color:#505050;line-height:1.2em}@media only screen and (max-width: 720px){.content.svelte-7uqp3h .designdev .devinfo.svelte-7uqp3h.svelte-7uqp3h{font-size:10px}}@media only screen and (max-height: 480px){.content.svelte-7uqp3h .designdev .devinfo.svelte-7uqp3h.svelte-7uqp3h{font-size:10px}}.content.svelte-7uqp3h .designdev div.svelte-7uqp3h.svelte-7uqp3h{display:grid;grid-template-columns:1fr 1fr 1fr;max-width:1200px;margin-top:2em;grid-gap:3em}@media only screen and (max-width: 1280px){.content.svelte-7uqp3h .designdev div.svelte-7uqp3h.svelte-7uqp3h{grid-template-columns:1fr 1fr}}.screenshots.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{margin-top:8em;display:grid;grid-template-columns:1fr 1fr;max-width:1200px;grid-gap:3em}.screenshots.svelte-7uqp3h img.svelte-7uqp3h.svelte-7uqp3h{display:block;width:100%;margin-bottom:3em}.extras.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{margin-top:8em;min-height:70vh;max-width:1000px}@media only screen and (max-width: 1280px){.extras.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{margin-top:6em}}.extras.svelte-7uqp3h div.svelte-7uqp3h.svelte-7uqp3h{display:grid;grid-template-columns:1fr 1fr;align-items:center}@media only screen and (max-width: 720px){.extras.svelte-7uqp3h div.svelte-7uqp3h.svelte-7uqp3h{grid-template-columns:1fr}}@media only screen and (max-height: 480px){.extras.svelte-7uqp3h div.svelte-7uqp3h.svelte-7uqp3h{grid-template-columns:1fr}}.extras.svelte-7uqp3h div.svelte-7uqp3h p.svelte-7uqp3h{color:#505050;font-size:18px;line-height:1.2em;max-width:550px}@media only screen and (max-width: 1280px){.extras.svelte-7uqp3h div.svelte-7uqp3h p.svelte-7uqp3h{font-size:14px}}@media only screen and (max-width: 720px){.extras.svelte-7uqp3h div.svelte-7uqp3h p.svelte-7uqp3h{font-size:12px}}@media only screen and (max-height: 480px){.extras.svelte-7uqp3h div.svelte-7uqp3h p.svelte-7uqp3h{font-size:12px}}.extras.svelte-7uqp3h .links.svelte-7uqp3h.svelte-7uqp3h{margin:0 auto}@media only screen and (max-width: 720px){.extras.svelte-7uqp3h .links.svelte-7uqp3h.svelte-7uqp3h{margin:0 0}}@media only screen and (max-height: 480px){.extras.svelte-7uqp3h .links.svelte-7uqp3h.svelte-7uqp3h{margin:0 0}}.extras.svelte-7uqp3h .links span.svelte-7uqp3h.svelte-7uqp3h{display:flex;align-items:center;margin-top:2em}.extras.svelte-7uqp3h .links a.svelte-7uqp3h.svelte-7uqp3h{color:#3c3c3c;font-family:"harmony", serif;color:#3c3c3c;font-size:24px}@media only screen and (max-width: 1280px){.extras.svelte-7uqp3h .links a.svelte-7uqp3h.svelte-7uqp3h{font-size:18px}}@media only screen and (max-width: 720px){.extras.svelte-7uqp3h .links a.svelte-7uqp3h.svelte-7uqp3h{font-size:14px}}@media only screen and (max-height: 480px){.extras.svelte-7uqp3h .links a.svelte-7uqp3h.svelte-7uqp3h{font-size:14px}}h1.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-family:"harmony", serif;line-height:119px;letter-spacing:0.015em;color:#3c3c3c}h1.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-size:75px;line-height:91.35px}@media screen and (min-width: 1280px){h1.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-size:calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));line-height:calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px)}}@media screen and (min-width: 1920px){h1.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-size:96px;line-height:125.328px}}@media only screen and (max-width: 1280px){h1.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-size:48px;line-height:60px}}@media only screen and (max-width: 720px){h1.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-size:24px;line-height:30px}}@media only screen and (max-height: 480px){h1.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-size:24px;line-height:30px}}h2.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-family:"harmony", serif;font-size:48px;color:#3c3c3c;margin-bottom:0.2em}@media only screen and (max-width: 1280px){h2.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-size:24px}}@media only screen and (max-width: 720px){h2.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-size:24px}}@media only screen and (max-height: 480px){h2.svelte-7uqp3h.svelte-7uqp3h.svelte-7uqp3h{font-size:24px}}',
  map: `{"version":3,"file":"kanakoot.svelte","sources":["kanakoot.svelte"],"sourcesContent":["<script>\\r\\n\\timport Loader from '../../components/Loader.svelte';\\r\\n\\timport Footer from '../../components/Footer.svelte';\\r\\n\\timport CircleType from '../../components/CircleType.svelte';\\r\\n\\timport { projects } from '../../Projects/ProjectDetails';\\r\\n\\timport Ending from '../../components/Ending.svelte';\\r\\n\\timport Card from '../../components/Card.svelte';\\r\\n\\timport Link from '../../svg/link.svelte';\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\tlet project = projects[0];\\r\\n\\tlet content = 'hide';\\r\\n\\tonMount(() => {\\r\\n\\t\\tcontent = 'show';\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>Gautham Krishna - Kanakoot</title>\\r\\n</svelte:head>\\r\\n\\r\\n\\r\\n\\t{#if content === 'hide'}\\r\\n\\t\\t<Loader />\\r\\n\\t{/if}\\r\\n\\t<Footer />\\r\\n\\t<CircleType\\r\\n\\t\\ttypeText=\\"| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL DOWN &ensp; || &ensp; MY WORKS &ensp; |\\"\\r\\n\\t/>\\r\\n\\t<main>\\r\\n\\t\\t<div class=\\"content\\">\\r\\n\\t\\t\\t<h1>{project.name}</h1>\\r\\n\\t\\t\\t<span class=\\"role\\">BRANDING | UX DESIGN | DEVELOPMENT</span>\\r\\n\\t\\t\\t<section class=\\"hero\\">\\r\\n\\t\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t\\t<li>\\r\\n\\t\\t\\t\\t\\t\\t<h5>Problem Statement</h5>\\r\\n\\t\\t\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t\\t\\t{project.ProblemStatement}\\r\\n\\t\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t\\t\\t<li>\\r\\n\\t\\t\\t\\t\\t\\t<h5>Goal/Idea</h5>\\r\\n\\t\\t\\t\\t\\t\\t<p>{project.Goal}</p>\\r\\n\\t\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t\\t\\t<li>\\r\\n\\t\\t\\t\\t\\t\\t<h5>About</h5>\\r\\n\\t\\t\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t\\t\\t{project.about}\\r\\n\\t\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t\\t<img class=\\"img1\\" src={project.previewImage[5]} alt=\\"ui wireframe\\" />\\r\\n\\t\\t\\t\\t\\t<img class=\\"img2\\" src={project.previewImage[4]} alt=\\"ui wireframe\\" />\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</section>\\r\\n\\t\\t\\t<section class=\\"designdev\\">\\r\\n\\t\\t\\t\\t<h2>Design</h2>\\r\\n\\t\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t\\t<Card img={project.designImage[0]} heading=\\"Logo\\" para={project.design.logo} />\\r\\n\\t\\t\\t\\t\\t<Card\\r\\n\\t\\t\\t\\t\\t\\timg={project.designImage[1]}\\r\\n\\t\\t\\t\\t\\t\\theading=\\"Typography\\"\\r\\n\\t\\t\\t\\t\\t\\tpara={project.design.typography}\\r\\n\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t\\t<Card\\r\\n\\t\\t\\t\\t\\t\\timg={project.designImage[2]}\\r\\n\\t\\t\\t\\t\\t\\theading=\\"Color Palette\\"\\r\\n\\t\\t\\t\\t\\t\\tpara={project.design.colorPalette}\\r\\n\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t\\t<Card img={project.designImage[3]} heading=\\"Component\\" para={project.design.components} />\\r\\n\\t\\t\\t\\t\\t<Card img={project.designImage[4]} heading=\\"Elevation\\" para={project.design.Elevation} />\\r\\n\\t\\t\\t\\t\\t<Card img={project.designImage[5]} heading=\\"Animation\\" para={project.design.Animation} />\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</section>\\r\\n\\t\\t\\t<section class=\\"screenshots\\">\\r\\n\\t\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t\\t<img class=\\"s1\\" src={project.previewImage[0]} alt=\\"ui\\" /><img\\r\\n\\t\\t\\t\\t\\t\\tclass=\\"s3\\"\\r\\n\\t\\t\\t\\t\\t\\tsrc={project.previewImage[2]}\\r\\n\\t\\t\\t\\t\\t\\talt=\\"ui\\"\\r\\n\\t\\t\\t\\t\\t/>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t\\t<img class=\\"s2\\" src={project.previewImage[3]} alt=\\"ui\\" />\\r\\n\\t\\t\\t\\t\\t<img class=\\"s4\\" src={project.previewImage[1]} alt=\\"ui\\" />\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</section>\\r\\n\\t\\t\\t<section class=\\"designdev\\">\\r\\n\\t\\t\\t\\t<h2>Development</h2>\\r\\n\\t\\t\\t\\t<p class=\\"devinfo\\">\\r\\n\\t\\t\\t\\t\\tKanakoot does not need any server applications and therefore I chose to develop a\\r\\n\\t\\t\\t\\t\\tserverless website. All the data is computed in the frontend. Used Test Driven Development\\r\\n\\t\\t\\t\\t\\tthe whole project.\\r\\n\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t<img class=\\"devtools\\" src={project.dev.tools} alt=\\"tools logo\\" />\\r\\n\\t\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t\\t<Card heading=\\"Programming Langauges\\" para={project.dev.programmingLangauges} />\\r\\n\\t\\t\\t\\t\\t<Card heading=\\"Frontend Frameworks\\" para={project.dev.frontendFrameworks} />\\r\\n\\t\\t\\t\\t\\t<Card heading=\\"Styling and Assets\\" para={project.dev.styling} />\\r\\n\\t\\t\\t\\t\\t<Card heading=\\"Testing\\" para={project.dev.testing} />\\r\\n\\t\\t\\t\\t\\t<Card heading=\\"Other dependencies\\" para={project.dev.other} />\\r\\n\\t\\t\\t\\t\\t<Card heading=\\"Hosting and Analytics\\" para={project.dev.hosting} />\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t<div />\\r\\n\\t\\t\\t</section>\\r\\n\\t\\t\\t<section class=\\"extras\\">\\r\\n\\t\\t\\t\\t<h2>Extras</h2>\\r\\n\\t\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t\\t<p>{project.extras}</p>\\r\\n\\t\\t\\t\\t\\t<article class=\\"links\\">\\r\\n\\t\\t\\t\\t\\t\\t<span><a rel=\\"external\\" href={project.link}>Visit Site</a><Link /></span>\\r\\n\\t\\t\\t\\t\\t\\t<span><a rel=\\"external\\" href={project.behance}>Visit Behance</a><Link /></span>\\r\\n\\t\\t\\t\\t\\t\\t<span><a rel=\\"external\\" href={project.github}>Visit Github</a><Link /></span>\\r\\n\\t\\t\\t\\t\\t</article>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</section>\\r\\n\\t\\t</div>\\r\\n\\t</main>\\r\\n\\t<Ending />\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">main {\\n  overflow: hidden;\\n}\\n\\n.content {\\n  min-height: 100vh;\\n  margin: 14vh 120px 0 120px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .content {\\n    margin: 180px 64px 20px 64px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .content {\\n    margin: 120px 40px 10px 40px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .content {\\n    margin: 120px 40px 10px 40px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .content .role {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .content .role {\\n    font-size: 10px;\\n  }\\n}\\n.content .hero {\\n  min-height: 100vh;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr;\\n}\\n.content .hero ul {\\n  margin-top: 2em;\\n  margin-left: 1em;\\n}\\n.content .hero ul li {\\n  list-style: circle;\\n  margin-top: 2em;\\n}\\n.content .hero ul li p {\\n  color: #505050;\\n  margin-top: 0.5em;\\n  max-width: 450px;\\n  line-height: 18px;\\n}\\n@media only screen and (max-width: 720px) {\\n  .content .hero ul li p {\\n    line-height: 1em;\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .content .hero ul li p {\\n    line-height: 1em;\\n    font-size: 10px;\\n  }\\n}\\n.content .hero ul h5 {\\n  font-family: \\"harmony\\", serif;\\n  color: #3c3c3c;\\n  font-size: 24px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .content .hero ul h5 {\\n    font-size: 18px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .content .hero ul h5 {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .content .hero ul h5 {\\n    font-size: 14px;\\n  }\\n}\\n.content .hero div {\\n  position: relative;\\n}\\n.content .hero div img {\\n  width: 450px;\\n  position: absolute;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .content .hero div img {\\n    width: 200px;\\n  }\\n}\\n.content .hero div .img1 {\\n  top: -70px;\\n  right: 0;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .content .hero div .img1 {\\n    top: 10px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .content .hero div .img1 {\\n    top: 30px;\\n    right: -120px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .content .hero div .img1 {\\n    top: 30px;\\n    right: -120px;\\n  }\\n}\\n.content .hero div .img2 {\\n  top: 100px;\\n  right: 150px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .content .hero div .img2 {\\n    right: 40px;\\n    top: 90px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .content .hero div .img2 {\\n    right: -180px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .content .hero div .img2 {\\n    right: -180px;\\n  }\\n}\\n.content .designdev {\\n  margin-top: 8em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .content .designdev {\\n    margin-top: 6em;\\n  }\\n}\\n.content .designdev .devtools {\\n  margin-top: 1em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .content .designdev .devtools {\\n    width: 200px;\\n  }\\n}\\n.content .designdev .devinfo {\\n  max-width: 1000px;\\n  color: #505050;\\n  line-height: 1.2em;\\n}\\n@media only screen and (max-width: 720px) {\\n  .content .designdev .devinfo {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .content .designdev .devinfo {\\n    font-size: 10px;\\n  }\\n}\\n.content .designdev div {\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  max-width: 1200px;\\n  margin-top: 2em;\\n  grid-gap: 3em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .content .designdev div {\\n    grid-template-columns: 1fr 1fr;\\n  }\\n}\\n.screenshots {\\n  margin-top: 8em;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr;\\n  max-width: 1200px;\\n  grid-gap: 3em;\\n}\\n.screenshots img {\\n  display: block;\\n  width: 100%;\\n  margin-bottom: 3em;\\n}\\n\\n.extras {\\n  margin-top: 8em;\\n  min-height: 70vh;\\n  max-width: 1000px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .extras {\\n    margin-top: 6em;\\n  }\\n}\\n.extras div {\\n  display: grid;\\n  grid-template-columns: 1fr 1fr;\\n  align-items: center;\\n}\\n@media only screen and (max-width: 720px) {\\n  .extras div {\\n    grid-template-columns: 1fr;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .extras div {\\n    grid-template-columns: 1fr;\\n  }\\n}\\n.extras div p {\\n  color: #505050;\\n  font-size: 18px;\\n  line-height: 1.2em;\\n  max-width: 550px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .extras div p {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .extras div p {\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .extras div p {\\n    font-size: 12px;\\n  }\\n}\\n.extras .links {\\n  margin: 0 auto;\\n}\\n@media only screen and (max-width: 720px) {\\n  .extras .links {\\n    margin: 0 0;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .extras .links {\\n    margin: 0 0;\\n  }\\n}\\n.extras .links span {\\n  display: flex;\\n  align-items: center;\\n  margin-top: 2em;\\n}\\n.extras .links a {\\n  color: #3c3c3c;\\n  font-family: \\"harmony\\", serif;\\n  color: #3c3c3c;\\n  font-size: 24px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .extras .links a {\\n    font-size: 18px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .extras .links a {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .extras .links a {\\n    font-size: 14px;\\n  }\\n}\\n\\nh1 {\\n  font-family: \\"harmony\\", serif;\\n  line-height: 119px;\\n  letter-spacing: 0.015em;\\n  color: #3c3c3c;\\n}\\nh1 {\\n  font-size: 75px;\\n  line-height: 91.35px;\\n}\\n@media screen and (min-width: 1280px) {\\n  h1 {\\n    font-size: calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));\\n    line-height: calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px);\\n  }\\n}\\n@media screen and (min-width: 1920px) {\\n  h1 {\\n    font-size: 96px;\\n    line-height: 125.328px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  h1 {\\n    font-size: 48px;\\n    line-height: 60px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h1 {\\n    font-size: 24px;\\n    line-height: 30px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h1 {\\n    font-size: 24px;\\n    line-height: 30px;\\n  }\\n}\\n\\nh2 {\\n  font-family: \\"harmony\\", serif;\\n  font-size: 48px;\\n  color: #3c3c3c;\\n  margin-bottom: 0.2em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  h2 {\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h2 {\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h2 {\\n    font-size: 24px;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
};
var Kanakoot = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let project = projects[0];
  $$result.css.add(css$2);
  return `${$$result.head += `${$$result.title = `<title>Gautham Krishna - Kanakoot</title>`, ""}`, ""}


	${`${validate_component(Loader, "Loader").$$render($$result, {}, {}, {})}`}
	${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}
	${validate_component(CircleType_1, "CircleType").$$render($$result, {
    typeText: "| \u2002 PORTFOLIO \u2002 || \u2002 SCROLL DOWN \u2002 || \u2002 MY WORKS \u2002 |"
  }, {}, {})}
	<main class="${"svelte-7uqp3h"}"><div class="${"content svelte-7uqp3h"}"><h1 class="${"svelte-7uqp3h"}">${escape(project.name)}</h1>
			<span class="${"role svelte-7uqp3h"}">BRANDING | UX DESIGN | DEVELOPMENT</span>
			<section class="${"hero svelte-7uqp3h"}"><ul class="${"svelte-7uqp3h"}"><li class="${"svelte-7uqp3h"}"><h5 class="${"svelte-7uqp3h"}">Problem Statement</h5>
						<p class="${"svelte-7uqp3h"}">${escape(project.ProblemStatement)}</p></li>
					<li class="${"svelte-7uqp3h"}"><h5 class="${"svelte-7uqp3h"}">Goal/Idea</h5>
						<p class="${"svelte-7uqp3h"}">${escape(project.Goal)}</p></li>
					<li class="${"svelte-7uqp3h"}"><h5 class="${"svelte-7uqp3h"}">About</h5>
						<p class="${"svelte-7uqp3h"}">${escape(project.about)}</p></li></ul>
				<div class="${"svelte-7uqp3h"}"><img class="${"img1 svelte-7uqp3h"}"${add_attribute("src", project.previewImage[5], 0)} alt="${"ui wireframe"}">
					<img class="${"img2 svelte-7uqp3h"}"${add_attribute("src", project.previewImage[4], 0)} alt="${"ui wireframe"}"></div></section>
			<section class="${"designdev svelte-7uqp3h"}"><h2 class="${"svelte-7uqp3h"}">Design</h2>
				<div class="${"svelte-7uqp3h"}">${validate_component(Card, "Card").$$render($$result, {
    img: project.designImage[0],
    heading: "Logo",
    para: project.design.logo
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    img: project.designImage[1],
    heading: "Typography",
    para: project.design.typography
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    img: project.designImage[2],
    heading: "Color Palette",
    para: project.design.colorPalette
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    img: project.designImage[3],
    heading: "Component",
    para: project.design.components
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    img: project.designImage[4],
    heading: "Elevation",
    para: project.design.Elevation
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    img: project.designImage[5],
    heading: "Animation",
    para: project.design.Animation
  }, {}, {})}</div></section>
			<section class="${"screenshots svelte-7uqp3h"}"><div class="${"svelte-7uqp3h"}"><img class="${"s1 svelte-7uqp3h"}"${add_attribute("src", project.previewImage[0], 0)} alt="${"ui"}"><img class="${"s3 svelte-7uqp3h"}"${add_attribute("src", project.previewImage[2], 0)} alt="${"ui"}"></div>
				<div class="${"svelte-7uqp3h"}"><img class="${"s2 svelte-7uqp3h"}"${add_attribute("src", project.previewImage[3], 0)} alt="${"ui"}">
					<img class="${"s4 svelte-7uqp3h"}"${add_attribute("src", project.previewImage[1], 0)} alt="${"ui"}"></div></section>
			<section class="${"designdev svelte-7uqp3h"}"><h2 class="${"svelte-7uqp3h"}">Development</h2>
				<p class="${"devinfo svelte-7uqp3h"}">Kanakoot does not need any server applications and therefore I chose to develop a
					serverless website. All the data is computed in the frontend. Used Test Driven Development
					the whole project.
				</p>
				<img class="${"devtools svelte-7uqp3h"}"${add_attribute("src", project.dev.tools, 0)} alt="${"tools logo"}">
				<div class="${"svelte-7uqp3h"}">${validate_component(Card, "Card").$$render($$result, {
    heading: "Programming Langauges",
    para: project.dev.programmingLangauges
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    heading: "Frontend Frameworks",
    para: project.dev.frontendFrameworks
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    heading: "Styling and Assets",
    para: project.dev.styling
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    heading: "Testing",
    para: project.dev.testing
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    heading: "Other dependencies",
    para: project.dev.other
  }, {}, {})}
					${validate_component(Card, "Card").$$render($$result, {
    heading: "Hosting and Analytics",
    para: project.dev.hosting
  }, {}, {})}</div>
				<div class="${"svelte-7uqp3h"}"></div></section>
			<section class="${"extras svelte-7uqp3h"}"><h2 class="${"svelte-7uqp3h"}">Extras</h2>
				<div class="${"svelte-7uqp3h"}"><p class="${"svelte-7uqp3h"}">${escape(project.extras)}</p>
					<article class="${"links svelte-7uqp3h"}"><span class="${"svelte-7uqp3h"}"><a rel="${"external"}"${add_attribute("href", project.link, 0)} class="${"svelte-7uqp3h"}">Visit Site</a>${validate_component(Link, "Link").$$render($$result, {}, {}, {})}</span>
						<span class="${"svelte-7uqp3h"}"><a rel="${"external"}"${add_attribute("href", project.behance, 0)} class="${"svelte-7uqp3h"}">Visit Behance</a>${validate_component(Link, "Link").$$render($$result, {}, {}, {})}</span>
						<span class="${"svelte-7uqp3h"}"><a rel="${"external"}"${add_attribute("href", project.github, 0)} class="${"svelte-7uqp3h"}">Visit Github</a>${validate_component(Link, "Link").$$render($$result, {}, {}, {})}</span></article></div></section></div></main>
	${validate_component(Ending, "Ending").$$render($$result, {}, {}, {})}`;
});
var kanakoot = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Kanakoot
});
var css$1 = {
  code: 'section.svelte-1p8og6q.svelte-1p8og6q{padding-top:25vh;text-align:center;font-size:18px;padding-right:5em;width:-webkit-max-content;width:-moz-max-content;width:max-content;margin:0 auto}@media only screen and (max-width: 1280px){section.svelte-1p8og6q.svelte-1p8og6q{text-align:left;margin:0 64px;padding-right:0;padding-top:220px;font-size:12px}}@media only screen and (max-width: 720px){section.svelte-1p8og6q.svelte-1p8og6q{margin:0 40px;padding-right:0;padding-top:130px}}@media only screen and (max-height: 480px){section.svelte-1p8og6q.svelte-1p8og6q{margin:0 40px;padding-right:0;padding-top:130px}}section.svelte-1p8og6q span.svelte-1p8og6q{color:#505050}h1.svelte-1p8og6q.svelte-1p8og6q{position:relative;z-index:30;margin-top:0.5em;font-family:"harmony", serif;font-size:96px;cursor:pointer;transition:all 0.15s ease-in}h1.svelte-1p8og6q.svelte-1p8og6q:hover{color:#7E5923}@media only screen and (max-width: 1280px){h1.svelte-1p8og6q.svelte-1p8og6q{margin:0 auto;margin-top:1em;font-size:48px}}@media only screen and (max-width: 720px){h1.svelte-1p8og6q.svelte-1p8og6q{margin:0 auto;margin-top:0.5em;font-size:24px}}@media only screen and (max-height: 480px){h1.svelte-1p8og6q.svelte-1p8og6q{margin:0 auto;margin-top:0.5em;font-size:24px}}.ending.svelte-1p8og6q.svelte-1p8og6q{position:static;display:flex;justify-content:center;margin-top:3em}.ending.svelte-1p8og6q ul.svelte-1p8og6q{display:flex;z-index:10}.ending.svelte-1p8og6q ul a.svelte-1p8og6q{color:#3c3c3c}@media only screen and (max-width: 1280px){.ending.svelte-1p8og6q ul a.svelte-1p8og6q{font-size:14px}}@media only screen and (max-width: 720px){.ending.svelte-1p8og6q ul a.svelte-1p8og6q{font-size:10px}}@media only screen and (max-height: 480px){.ending.svelte-1p8og6q ul a.svelte-1p8og6q{font-size:10px}}.ending.svelte-1p8og6q ul a.svelte-1p8og6q:nth-child(2){margin:0 40px}@media only screen and (max-width: 1280px){.ending.svelte-1p8og6q ul a.svelte-1p8og6q:nth-child(2){margin:0 20px}}@media only screen and (max-width: 1280px){.ending.svelte-1p8og6q.svelte-1p8og6q{justify-content:flex-start;margin-top:2em}}',
  map: `{"version":3,"file":"contact.svelte","sources":["contact.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport const prerender = true;\\r\\n<\/script>\\r\\n\\r\\n<script>\\r\\n\\timport Flower from '../svg/flower.svelte';\\r\\n\\timport Footer from '../components/Footer.svelte';\\r\\n\\tlet mail = '8.gautham@pm.me';\\r\\n\\tconst copyMail = () => {\\r\\n\\t\\tmail = 'Mail ID Copied !';\\r\\n\\t\\twindow.open('mailto:8.gautham@pm.me', '_top');\\r\\n\\t\\tsetTimeout(() => {\\r\\n\\t\\t\\tmail = '8.gautham@pm.me';\\r\\n\\t\\t\\tvar r = document.createRange();\\r\\n\\t\\t\\tr.selectNode(document.getElementById('mail'));\\r\\n\\t\\t\\twindow.getSelection().removeAllRanges();\\r\\n\\t\\t\\twindow.getSelection().addRange(r);\\r\\n\\t\\t\\tdocument.execCommand('copy');\\r\\n\\t\\t\\twindow.getSelection().removeAllRanges();\\r\\n\\t\\t}, 2000);\\r\\n\\t};\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>Gautham Krishna - Contact</title>\\r\\n</svelte:head>\\r\\n\\r\\n\\r\\n\\t<section>\\r\\n\\t\\t<span>I would love to hear from you ! </span>\\r\\n\\t\\t<h1 title=\\"\u{1F4E7} Open Mail Client / Copy Text\\" on:click={() => copyMail()} id=\\"mail\\">\\r\\n\\t\\t\\t{mail}\\r\\n\\t\\t</h1>\\r\\n\\t\\t<nav class=\\"ending\\">\\r\\n\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t<a rel=\\"external\\" href=\\"https://www.behance.net/gauthamkrishnax\\"><li>Behance</li></a>\\r\\n\\t\\t\\t\\t<a rel=\\"external\\" href=\\"https://github.com/gauthamkrishnax\\"><li>Github</li></a>\\r\\n\\t\\t\\t\\t<a rel=\\"external\\" href=\\"https://www.linkedin.com/in/gauthamkrishnas/\\"><li>LinkedIn</li></a>\\r\\n\\t\\t\\t</ul>\\r\\n\\t\\t</nav>\\r\\n\\t\\t<Flower type=\\"back\\" />\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">section {\\n  padding-top: 25vh;\\n  text-align: center;\\n  font-size: 18px;\\n  padding-right: 5em;\\n  width: -webkit-max-content;\\n  width: -moz-max-content;\\n  width: max-content;\\n  margin: 0 auto;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section {\\n    text-align: left;\\n    margin: 0 64px;\\n    padding-right: 0;\\n    padding-top: 220px;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 130px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 130px;\\n  }\\n}\\nsection span {\\n  color: #505050;\\n}\\n\\nh1 {\\n  position: relative;\\n  z-index: 30;\\n  margin-top: 0.5em;\\n  font-family: \\"harmony\\", serif;\\n  font-size: 96px;\\n  cursor: pointer;\\n  transition: all 0.15s ease-in;\\n}\\nh1:hover {\\n  color: #7E5923;\\n}\\n@media only screen and (max-width: 1280px) {\\n  h1 {\\n    margin: 0 auto;\\n    margin-top: 1em;\\n    font-size: 48px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h1 {\\n    margin: 0 auto;\\n    margin-top: 0.5em;\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h1 {\\n    margin: 0 auto;\\n    margin-top: 0.5em;\\n    font-size: 24px;\\n  }\\n}\\n\\n.ending {\\n  position: static;\\n  display: flex;\\n  justify-content: center;\\n  margin-top: 3em;\\n}\\n.ending ul {\\n  display: flex;\\n  z-index: 10;\\n}\\n.ending ul a {\\n  color: #3c3c3c;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .ending ul a {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .ending ul a {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .ending ul a {\\n    font-size: 10px;\\n  }\\n}\\n.ending ul a:nth-child(2) {\\n  margin: 0 40px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .ending ul a:nth-child(2) {\\n    margin: 0 20px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  .ending {\\n    justify-content: flex-start;\\n    margin-top: 2em;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
};
var prerender$1 = true;
var Contact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let mail = "8.gautham@pm.me";
  $$result.css.add(css$1);
  return `${$$result.head += `${$$result.title = `<title>Gautham Krishna - Contact</title>`, ""}`, ""}


	<section class="${"svelte-1p8og6q"}"><span class="${"svelte-1p8og6q"}">I would love to hear from you ! </span>
		<h1 title="${"\u{1F4E7} Open Mail Client / Copy Text"}" id="${"mail"}" class="${"svelte-1p8og6q"}">${escape(mail)}</h1>
		<nav class="${"ending svelte-1p8og6q"}"><ul class="${"svelte-1p8og6q"}"><a rel="${"external"}" href="${"https://www.behance.net/gauthamkrishnax"}" class="${"svelte-1p8og6q"}"><li>Behance</li></a>
				<a rel="${"external"}" href="${"https://github.com/gauthamkrishnax"}" class="${"svelte-1p8og6q"}"><li>Github</li></a>
				<a rel="${"external"}" href="${"https://www.linkedin.com/in/gauthamkrishnas/"}" class="${"svelte-1p8og6q"}"><li>LinkedIn</li></a></ul></nav>
		${validate_component(Flower, "Flower").$$render($$result, { type: "back" }, {}, {})}
	</section>`;
});
var contact = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Contact,
  prerender: prerender$1
});
var MyPhoto = "/_app/assets/myPhoto-5041a5bc.png";
var devTools = [
  "HTML",
  "CSS",
  "JAVASCRIPT",
  "SASS",
  "REACT",
  "WEBPACK",
  "GSAP",
  "GATSBY",
  "NEXT",
  "GRAPHQL",
  "REDUX",
  "TYPESCRIPT",
  "VSCODE",
  "SVELTE",
  "GIT"
];
var designTools = ["PHOTOSHOP", "ILLUSTRATOR", "XD", "FIGMA", "BLENDER", "PREMIER PRO"];
var css = {
  code: 'main.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{display:grid;grid-template-columns:1fr 1fr 1fr;margin-top:12vh;height:100vh}@media only screen and (max-width: 1280px){main.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{margin-top:100px;height:110vh;grid-template-columns:1.8fr 1fr;grid-template-rows:1.5fr 1fr}}@media only screen and (max-width: 720px){main.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{margin-top:20px}}@media only screen and (max-height: 480px){main.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{margin-top:20px}}main.svelte-1ye6fjm .hero.svelte-1ye6fjm.svelte-1ye6fjm{z-index:30;margin:8vh -20px 0 120px;max-width:1000px}@media only screen and (max-width: 1280px){main.svelte-1ye6fjm .hero.svelte-1ye6fjm.svelte-1ye6fjm{max-width:500px;margin:100px 20px 20px 64px}}@media only screen and (max-width: 720px){main.svelte-1ye6fjm .hero.svelte-1ye6fjm.svelte-1ye6fjm{max-width:250px;margin:100px 10px 10px 40px}}@media only screen and (max-height: 480px){main.svelte-1ye6fjm .hero.svelte-1ye6fjm.svelte-1ye6fjm{max-width:250px;margin:100px 10px 10px 40px}}main.svelte-1ye6fjm .hero div.svelte-1ye6fjm.svelte-1ye6fjm{margin-top:10px;color:#505050;letter-spacing:0.01em;line-height:22px}@media only screen and (max-width: 1280px){main.svelte-1ye6fjm .hero div.svelte-1ye6fjm.svelte-1ye6fjm{line-height:15px;margin-top:10px;font-size:14px}}@media only screen and (max-width: 720px){main.svelte-1ye6fjm .hero div.svelte-1ye6fjm.svelte-1ye6fjm{margin-top:5px;font-size:12px}}@media only screen and (max-height: 480px){main.svelte-1ye6fjm .hero div.svelte-1ye6fjm.svelte-1ye6fjm{margin-top:5px;font-size:12px}}main.svelte-1ye6fjm .hero .heroLinks.svelte-1ye6fjm.svelte-1ye6fjm{height:200px;margin-top:2em;display:flex;flex-direction:column;justify-content:space-around}@media only screen and (max-width: 720px){main.svelte-1ye6fjm .hero .heroLinks.svelte-1ye6fjm.svelte-1ye6fjm{height:150px}}@media only screen and (max-height: 480px){main.svelte-1ye6fjm .hero .heroLinks.svelte-1ye6fjm.svelte-1ye6fjm{height:150px}}main.svelte-1ye6fjm .hero .heroLinks span.svelte-1ye6fjm.svelte-1ye6fjm{display:flex;align-items:center;color:#3c3c3c;font-family:"harmony", serif;font-size:24px}@media only screen and (max-width: 1280px){main.svelte-1ye6fjm .hero .heroLinks span.svelte-1ye6fjm.svelte-1ye6fjm{font-size:18px}}main.svelte-1ye6fjm .hero .heroLinks li.svelte-1ye6fjm.svelte-1ye6fjm{list-style:none}main.svelte-1ye6fjm .myPhoto.svelte-1ye6fjm.svelte-1ye6fjm{position:relative;margin-left:80px}@media only screen and (max-width: 1280px){main.svelte-1ye6fjm .myPhoto.svelte-1ye6fjm.svelte-1ye6fjm{margin-left:40px}}@media only screen and (max-width: 720px){main.svelte-1ye6fjm .myPhoto.svelte-1ye6fjm.svelte-1ye6fjm{margin-left:10px}}@media only screen and (max-height: 480px){main.svelte-1ye6fjm .myPhoto.svelte-1ye6fjm.svelte-1ye6fjm{margin-left:10px}}main.svelte-1ye6fjm .myPhoto img.svelte-1ye6fjm.svelte-1ye6fjm{position:absolute;top:8vh;width:250px}@media only screen and (max-width: 1280px){main.svelte-1ye6fjm .myPhoto img.svelte-1ye6fjm.svelte-1ye6fjm{top:120px;width:180px}}@media only screen and (max-width: 720px){main.svelte-1ye6fjm .myPhoto img.svelte-1ye6fjm.svelte-1ye6fjm{width:100px}}@media only screen and (max-height: 480px){main.svelte-1ye6fjm .myPhoto img.svelte-1ye6fjm.svelte-1ye6fjm{width:100px}}main.svelte-1ye6fjm .myPhoto span.svelte-1ye6fjm.svelte-1ye6fjm{display:block;position:absolute;top:12vh;left:20px;width:250px;height:250px;border:1px solid black}@media only screen and (max-width: 1280px){main.svelte-1ye6fjm .myPhoto span.svelte-1ye6fjm.svelte-1ye6fjm{width:180px;height:180px;top:140px}}@media only screen and (max-width: 720px){main.svelte-1ye6fjm .myPhoto span.svelte-1ye6fjm.svelte-1ye6fjm{top:130px;left:10px;width:100px;height:100px}}@media only screen and (max-height: 480px){main.svelte-1ye6fjm .myPhoto span.svelte-1ye6fjm.svelte-1ye6fjm{top:130px;left:10px;width:100px;height:100px}}main.svelte-1ye6fjm .hero-illu.svelte-1ye6fjm.svelte-1ye6fjm{position:absolute;width:35%;top:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 2fr 2fr}@media only screen and (max-width: 1280px){main.svelte-1ye6fjm .hero-illu.svelte-1ye6fjm.svelte-1ye6fjm{opacity:30%;top:auto;bottom:0;right:0;width:100%;height:40%;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr}}main.svelte-1ye6fjm .hero-illu div.svelte-1ye6fjm.svelte-1ye6fjm{border-top:1px solid #d1d1d1;border-left:1px solid #d1d1d1}h2.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{font-family:"harmony", serif;line-height:119px;letter-spacing:0.015em;color:#3c3c3c}h2.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{font-size:48px;line-height:47.664px}@media screen and (min-width: 1280px){h2.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{font-size:calc(48px + strip-unit(12px) * ((100vw - 1280px) / strip-unit(640px)));line-height:calc(48px + strip-unit(12px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px)}}@media screen and (min-width: 1920px){h2.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{font-size:60px;line-height:67.08px}}@media only screen and (max-width: 1280px){h2.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{font-size:48px;line-height:60px}}@media only screen and (max-width: 720px){h2.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{font-size:24px;line-height:30px}}@media only screen and (max-height: 480px){h2.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{font-size:24px;line-height:30px}}section.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{min-height:100vh;padding-top:16vh;z-index:30;margin:0 -20px 0 120px;max-width:1000px}@media only screen and (max-width: 1280px){section.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{padding-top:22vh;margin:10px 20px 0 64px}}@media only screen and (max-width: 720px){section.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{max-width:250px;padding-top:14vh;margin:10px 10px 0 40px}}@media only screen and (max-height: 480px){section.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{max-width:250px;padding-top:14vh;margin:10px 10px 0 40px}}section.svelte-1ye6fjm div.svelte-1ye6fjm.svelte-1ye6fjm{display:grid;margin-top:10px;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;justify-content:space-around;grid-gap:40px}@media only screen and (max-width: 720px){section.svelte-1ye6fjm div.svelte-1ye6fjm.svelte-1ye6fjm{grid-template-columns:1fr;grid-template-rows:auto}}@media only screen and (max-height: 480px){section.svelte-1ye6fjm div.svelte-1ye6fjm.svelte-1ye6fjm{grid-template-columns:1fr;grid-template-rows:auto}}section.svelte-1ye6fjm div h4.svelte-1ye6fjm.svelte-1ye6fjm{font-family:"harmony", serif;font-size:24px}@media only screen and (max-width: 1280px){section.svelte-1ye6fjm div h4.svelte-1ye6fjm.svelte-1ye6fjm{font-size:18px}}@media only screen and (max-width: 720px){section.svelte-1ye6fjm div h4.svelte-1ye6fjm.svelte-1ye6fjm{font-size:14px}}@media only screen and (max-height: 480px){section.svelte-1ye6fjm div h4.svelte-1ye6fjm.svelte-1ye6fjm{font-size:14px}}section.svelte-1ye6fjm div.svelte-1ye6fjm p.svelte-1ye6fjm{color:#505050;letter-spacing:0.01em;line-height:22px;width:450px}@media only screen and (max-width: 1280px){section.svelte-1ye6fjm div.svelte-1ye6fjm p.svelte-1ye6fjm{width:auto;line-height:15px;margin-top:10px;font-size:14px}}@media only screen and (max-width: 720px){section.svelte-1ye6fjm div.svelte-1ye6fjm p.svelte-1ye6fjm{margin-top:5px;font-size:12px}}@media only screen and (max-height: 480px){section.svelte-1ye6fjm div.svelte-1ye6fjm p.svelte-1ye6fjm{margin-top:5px;font-size:12px}}section.svelte-1ye6fjm div ul.svelte-1ye6fjm.svelte-1ye6fjm{margin-top:1.5em;margin-left:1em;color:#505050;line-height:18px}@media only screen and (max-width: 1280px){section.svelte-1ye6fjm div ul.svelte-1ye6fjm.svelte-1ye6fjm{line-height:15px;margin-top:10px;font-size:14px}}@media only screen and (max-width: 720px){section.svelte-1ye6fjm div ul.svelte-1ye6fjm.svelte-1ye6fjm{margin-top:5px;font-size:12px}}@media only screen and (max-height: 480px){section.svelte-1ye6fjm div ul.svelte-1ye6fjm.svelte-1ye6fjm{margin-top:5px;font-size:12px}}section.svelte-1ye6fjm div.svelte-1ye6fjm ul li.svelte-1ye6fjm{list-style:circle;margin-top:1em}.tools.svelte-1ye6fjm.svelte-1ye6fjm.svelte-1ye6fjm{display:flex;flex-wrap:wrap;margin:0 0 0 0}.tools.svelte-1ye6fjm li.svelte-1ye6fjm.svelte-1ye6fjm{margin-right:1em;list-style:none}',
  map: `{"version":3,"file":"about.svelte","sources":["about.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport const prerender = true;\\r\\n<\/script>\\r\\n\\r\\n<script>\\r\\n\\timport Loader from '../components/Loader.svelte';\\r\\n\\timport Footer from '../components/Footer.svelte';\\r\\n\\timport CircleType from '../components/CircleType.svelte';\\r\\n\\timport Arrow from '../svg/arrow.svelte';\\r\\n\\timport MyPhoto from '../assets/myPhoto.png';\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\timport Ending from '../components/Ending.svelte';\\r\\n\\timport { devTools, designTools } from '../Projects/ToolsandTech';\\r\\n\\tlet content = 'hide';\\r\\n\\tonMount(() => {\\r\\n\\t\\tcontent = 'show';\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>Gautham Krishna - About</title>\\r\\n</svelte:head>\\r\\n\\r\\n\\r\\n\\t{#if content === 'hide'}\\r\\n\\t\\t<Loader />\\r\\n\\t{/if}\\r\\n\\t<Footer />\\r\\n\\t<CircleType\\r\\n\\t\\ttypeText=\\"| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL DOWN &ensp; || &ensp; MY WORKS &ensp; |\\"\\r\\n\\t/>\\r\\n\\t<main>\\r\\n\\t\\t<div class=\\"hero\\">\\r\\n\\t\\t\\t<h2>About</h2>\\r\\n\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\tHello, my name is Gautham Krishna S and I am currently an undergradute in Electronics and\\r\\n\\t\\t\\t\\t\\tComputer Engineering from Kerala, India.<br /> <br />I can Design and Code and I am\\r\\n\\t\\t\\t\\t\\tpassionate about creating artisan digital experiances. I have 2+ years of freelancing\\r\\n\\t\\t\\t\\t\\texperiance and have worked with many teams.\\r\\n\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div>\\r\\n\\t\\t\\t\\t<nav class=\\"heroLinks\\">\\r\\n\\t\\t\\t\\t\\t<a href=\\"#design\\">\\r\\n\\t\\t\\t\\t\\t\\t<li><span>Design <Arrow --left-margin=\\"10px\\" direction=\\"right\\" /></span></li></a\\r\\n\\t\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t<a href=\\"#development\\">\\r\\n\\t\\t\\t\\t\\t\\t<li><span>Development <Arrow --left-margin=\\"10px\\" direction=\\"right\\" /></span></li></a\\r\\n\\t\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t<a\\r\\n\\t\\t\\t\\t\\t\\thref=\\"https://drive.google.com/file/d/1axri1Y6nb8wD2g3ygU47SbE7LHjnnGqe/view?usp=sharing\\"\\r\\n\\t\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t\\t<li><span>Resume <Arrow --left-margin=\\"10px\\" direction=\\"right\\" /></span></li></a\\r\\n\\t\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t</nav>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t\\t<div class=\\"myPhoto\\">\\r\\n\\t\\t\\t<span />\\r\\n\\t\\t\\t<img src={MyPhoto} alt=\\"My potrait\\" />\\r\\n\\t\\t</div>\\r\\n\\t\\t<div class=\\"hero-illu\\">\\r\\n\\t\\t\\t<div />\\r\\n\\t\\t\\t<div />\\r\\n\\t\\t\\t<div />\\r\\n\\t\\t\\t<div />\\r\\n\\t\\t\\t<div />\\r\\n\\t\\t\\t<div />\\r\\n\\t\\t\\t<div />\\r\\n\\t\\t\\t<div />\\r\\n\\t\\t\\t<div />\\r\\n\\t\\t</div>\\r\\n\\t</main>\\r\\n\\t<section id=\\"development\\">\\r\\n\\t\\t<h2>Development</h2>\\r\\n\\t\\t<div>\\r\\n\\t\\t\\t<p>\\r\\n\\t\\t\\t\\tI am really passionate to code. I started learning Javascript to implement the user\\r\\n\\t\\t\\t\\tinterfaces and mockups that I design. With the designer\u2019s eye for details I am passionate\\r\\n\\t\\t\\t\\tabout implementing designs into highly interactive experiances by paying close attention to\\r\\n\\t\\t\\t\\tdetails, assesibility and performance.\\r\\n\\t\\t\\t</p>\\r\\n\\t\\t\\t<article>\\r\\n\\t\\t\\t\\t<h4>Tools and Technologies</h4>\\r\\n\\t\\t\\t\\t<ul class=\\"tools\\">\\r\\n\\t\\t\\t\\t\\t{#each devTools as devTool}\\r\\n\\t\\t\\t\\t\\t\\t<li>{devTool}</li>\\r\\n\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t</article>\\r\\n\\t\\t\\t<article>\\r\\n\\t\\t\\t\\t<h4>Certifications and Achievements</h4>\\r\\n\\t\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t\\t<li>\\r\\n\\t\\t\\t\\t\\t\\tWeb Design for Everybody: Basics of Web Development & Coding, University of Michigan\\r\\n\\t\\t\\t\\t\\t</li>\\r\\n\\t\\t\\t\\t\\t<li>Responsive Web Design Developer Certification, FreeCodeCamp</li>\\r\\n\\t\\t\\t\\t\\t<li>Front End Libraries Developer Certification, FreeCodeCamp</li>\\r\\n\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t</article>\\r\\n\\t\\t\\t<article>\\r\\n\\t\\t\\t\\t<h4>Experiance</h4>\\r\\n\\t\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t\\t<li>Web developer, KMV</li>\\r\\n\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t</article>\\r\\n\\t\\t</div>\\r\\n\\t</section>\\r\\n\\t<section id=\\"design\\">\\r\\n\\t\\t<h2>Design</h2>\\r\\n\\t\\t<div>\\r\\n\\t\\t\\t<p>\\r\\n\\t\\t\\t\\tMy creative journey started with graphics design. I started learning Adobe Photoshop when I\\r\\n\\t\\t\\t\\twas sixteen and has since then worked hard to stay relevant in the field. I have collabrated\\r\\n\\t\\t\\t\\twith many clients and have a lot of freelancing experiance. I now love to design simple,\\r\\n\\t\\t\\t\\tbeautiful and emotional websites.\\r\\n\\t\\t\\t</p>\\r\\n\\t\\t\\t<article>\\r\\n\\t\\t\\t\\t<h4>Tools and Technologies</h4>\\r\\n\\t\\t\\t\\t<ul class=\\"tools\\">\\r\\n\\t\\t\\t\\t\\t{#each designTools as designTool}\\r\\n\\t\\t\\t\\t\\t\\t<li>{designTool}</li>\\r\\n\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t</article>\\r\\n\\t\\t\\t<article>\\r\\n\\t\\t\\t\\t<h4>Certifications and Achievements</h4>\\r\\n\\t\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t\\t<li>Graphics Design Specialization, CAL ARTS</li>\\r\\n\\t\\t\\t\\t\\t<li>Adobe UX Foundation learning Journey, Adobe</li>\\r\\n\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t</article>\\r\\n\\t\\t\\t<article>\\r\\n\\t\\t\\t\\t<h4>Experiance</h4>\\r\\n\\t\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t\\t<li>Freelance Graphics Designer, MIO</li>\\r\\n\\t\\t\\t\\t\\t<li>UX design, CodeGreenBack</li>\\r\\n\\t\\t\\t\\t\\t<li>UX design / PR , VayuPure</li>\\r\\n\\t\\t\\t\\t\\t<li>Design Team Lead, Hack Club VIT Chennai</li>\\r\\n\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t</article>\\r\\n\\t\\t</div>\\r\\n\\t</section>\\r\\n\\t<Ending />\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">main {\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  margin-top: 12vh;\\n  height: 100vh;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main {\\n    margin-top: 100px;\\n    height: 110vh;\\n    grid-template-columns: 1.8fr 1fr;\\n    grid-template-rows: 1.5fr 1fr;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main {\\n    margin-top: 20px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main {\\n    margin-top: 20px;\\n  }\\n}\\nmain .hero {\\n  z-index: 30;\\n  margin: 8vh -20px 0 120px;\\n  max-width: 1000px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero {\\n    max-width: 500px;\\n    margin: 100px 20px 20px 64px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main .hero {\\n    max-width: 250px;\\n    margin: 100px 10px 10px 40px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .hero {\\n    max-width: 250px;\\n    margin: 100px 10px 10px 40px;\\n  }\\n}\\nmain .hero div {\\n  margin-top: 10px;\\n  color: #505050;\\n  letter-spacing: 0.01em;\\n  line-height: 22px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero div {\\n    line-height: 15px;\\n    margin-top: 10px;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main .hero div {\\n    margin-top: 5px;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .hero div {\\n    margin-top: 5px;\\n    font-size: 12px;\\n  }\\n}\\nmain .hero .heroLinks {\\n  height: 200px;\\n  margin-top: 2em;\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: space-around;\\n}\\n@media only screen and (max-width: 720px) {\\n  main .hero .heroLinks {\\n    height: 150px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .hero .heroLinks {\\n    height: 150px;\\n  }\\n}\\nmain .hero .heroLinks span {\\n  display: flex;\\n  align-items: center;\\n  color: #3c3c3c;\\n  font-family: \\"harmony\\", serif;\\n  font-size: 24px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero .heroLinks span {\\n    font-size: 18px;\\n  }\\n}\\nmain .hero .heroLinks li {\\n  list-style: none;\\n}\\nmain .myPhoto {\\n  position: relative;\\n  margin-left: 80px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .myPhoto {\\n    margin-left: 40px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main .myPhoto {\\n    margin-left: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .myPhoto {\\n    margin-left: 10px;\\n  }\\n}\\nmain .myPhoto img {\\n  position: absolute;\\n  top: 8vh;\\n  width: 250px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .myPhoto img {\\n    top: 120px;\\n    width: 180px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main .myPhoto img {\\n    width: 100px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .myPhoto img {\\n    width: 100px;\\n  }\\n}\\nmain .myPhoto span {\\n  display: block;\\n  position: absolute;\\n  top: 12vh;\\n  left: 20px;\\n  width: 250px;\\n  height: 250px;\\n  border: 1px solid black;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .myPhoto span {\\n    width: 180px;\\n    height: 180px;\\n    top: 140px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main .myPhoto span {\\n    top: 130px;\\n    left: 10px;\\n    width: 100px;\\n    height: 100px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .myPhoto span {\\n    top: 130px;\\n    left: 10px;\\n    width: 100px;\\n    height: 100px;\\n  }\\n}\\nmain .hero-illu {\\n  position: absolute;\\n  width: 35%;\\n  top: 0;\\n  right: 0;\\n  bottom: 0;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  grid-template-rows: 1fr 2fr 2fr;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero-illu {\\n    opacity: 30%;\\n    top: auto;\\n    bottom: 0;\\n    right: 0;\\n    width: 100%;\\n    height: 40%;\\n    grid-template-columns: 1fr 1fr 1fr;\\n    grid-template-rows: 1fr 1fr;\\n  }\\n}\\nmain .hero-illu div {\\n  border-top: 1px solid #d1d1d1;\\n  border-left: 1px solid #d1d1d1;\\n}\\n\\nh2 {\\n  font-family: \\"harmony\\", serif;\\n  line-height: 119px;\\n  letter-spacing: 0.015em;\\n  color: #3c3c3c;\\n}\\nh2 {\\n  font-size: 48px;\\n  line-height: 47.664px;\\n}\\n@media screen and (min-width: 1280px) {\\n  h2 {\\n    font-size: calc(48px + strip-unit(12px) * ((100vw - 1280px) / strip-unit(640px)));\\n    line-height: calc(48px + strip-unit(12px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px);\\n  }\\n}\\n@media screen and (min-width: 1920px) {\\n  h2 {\\n    font-size: 60px;\\n    line-height: 67.08px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  h2 {\\n    font-size: 48px;\\n    line-height: 60px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h2 {\\n    font-size: 24px;\\n    line-height: 30px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h2 {\\n    font-size: 24px;\\n    line-height: 30px;\\n  }\\n}\\n\\nsection {\\n  min-height: 100vh;\\n  padding-top: 16vh;\\n  z-index: 30;\\n  margin: 0 -20px 0 120px;\\n  max-width: 1000px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section {\\n    padding-top: 22vh;\\n    margin: 10px 20px 0 64px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section {\\n    max-width: 250px;\\n    padding-top: 14vh;\\n    margin: 10px 10px 0 40px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section {\\n    max-width: 250px;\\n    padding-top: 14vh;\\n    margin: 10px 10px 0 40px;\\n  }\\n}\\nsection div {\\n  display: grid;\\n  margin-top: 10px;\\n  grid-template-columns: 1fr 1fr;\\n  grid-template-rows: 1fr 1fr;\\n  justify-content: space-around;\\n  grid-gap: 40px;\\n}\\n@media only screen and (max-width: 720px) {\\n  section div {\\n    grid-template-columns: 1fr;\\n    grid-template-rows: auto;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section div {\\n    grid-template-columns: 1fr;\\n    grid-template-rows: auto;\\n  }\\n}\\nsection div h4 {\\n  font-family: \\"harmony\\", serif;\\n  font-size: 24px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section div h4 {\\n    font-size: 18px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section div h4 {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section div h4 {\\n    font-size: 14px;\\n  }\\n}\\nsection div p {\\n  color: #505050;\\n  letter-spacing: 0.01em;\\n  line-height: 22px;\\n  width: 450px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section div p {\\n    width: auto;\\n    line-height: 15px;\\n    margin-top: 10px;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section div p {\\n    margin-top: 5px;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section div p {\\n    margin-top: 5px;\\n    font-size: 12px;\\n  }\\n}\\nsection div ul {\\n  margin-top: 1.5em;\\n  margin-left: 1em;\\n  color: #505050;\\n  line-height: 18px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section div ul {\\n    line-height: 15px;\\n    margin-top: 10px;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section div ul {\\n    margin-top: 5px;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section div ul {\\n    margin-top: 5px;\\n    font-size: 12px;\\n  }\\n}\\nsection div ul li {\\n  list-style: circle;\\n  margin-top: 1em;\\n}\\n\\n.tools {\\n  display: flex;\\n  flex-wrap: wrap;\\n  margin: 0 0 0 0;\\n}\\n.tools li {\\n  margin-right: 1em;\\n  list-style: none;\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
};
var prerender = true;
var About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${$$result.head += `${$$result.title = `<title>Gautham Krishna - About</title>`, ""}`, ""}


	${`${validate_component(Loader, "Loader").$$render($$result, {}, {}, {})}`}
	${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}
	${validate_component(CircleType_1, "CircleType").$$render($$result, {
    typeText: "| \u2002 PORTFOLIO \u2002 || \u2002 SCROLL DOWN \u2002 || \u2002 MY WORKS \u2002 |"
  }, {}, {})}
	<main class="${"svelte-1ye6fjm"}"><div class="${"hero svelte-1ye6fjm"}"><h2 class="${"svelte-1ye6fjm"}">About</h2>
			<div class="${"svelte-1ye6fjm"}"><p class="${"svelte-1ye6fjm"}">Hello, my name is Gautham Krishna S and I am currently an undergradute in Electronics and
					Computer Engineering from Kerala, India.<br> <br>I can Design and Code and I am
					passionate about creating artisan digital experiances. I have 2+ years of freelancing
					experiance and have worked with many teams.
				</p></div>
			<div class="${"svelte-1ye6fjm"}"><nav class="${"heroLinks svelte-1ye6fjm"}"><a href="${"#design"}"><li class="${"svelte-1ye6fjm"}"><span class="${"svelte-1ye6fjm"}">Design <div style="display: contents; --left-margin:${"10px"};">${validate_component(Arrow, "Arrow").$$render($$result, { direction: "right" }, {}, {})}</div></span></li></a>
					<a href="${"#development"}"><li class="${"svelte-1ye6fjm"}"><span class="${"svelte-1ye6fjm"}">Development <div style="display: contents; --left-margin:${"10px"};">${validate_component(Arrow, "Arrow").$$render($$result, { direction: "right" }, {}, {})}</div></span></li></a>
					<a href="${"https://drive.google.com/file/d/1axri1Y6nb8wD2g3ygU47SbE7LHjnnGqe/view?usp=sharing"}"><li class="${"svelte-1ye6fjm"}"><span class="${"svelte-1ye6fjm"}">Resume <div style="display: contents; --left-margin:${"10px"};">${validate_component(Arrow, "Arrow").$$render($$result, { direction: "right" }, {}, {})}</div></span></li></a></nav></div></div>
		<div class="${"myPhoto svelte-1ye6fjm"}"><span class="${"svelte-1ye6fjm"}"></span>
			<img${add_attribute("src", MyPhoto, 0)} alt="${"My potrait"}" class="${"svelte-1ye6fjm"}"></div>
		<div class="${"hero-illu svelte-1ye6fjm"}"><div class="${"svelte-1ye6fjm"}"></div>
			<div class="${"svelte-1ye6fjm"}"></div>
			<div class="${"svelte-1ye6fjm"}"></div>
			<div class="${"svelte-1ye6fjm"}"></div>
			<div class="${"svelte-1ye6fjm"}"></div>
			<div class="${"svelte-1ye6fjm"}"></div>
			<div class="${"svelte-1ye6fjm"}"></div>
			<div class="${"svelte-1ye6fjm"}"></div>
			<div class="${"svelte-1ye6fjm"}"></div></div></main>
	<section id="${"development"}" class="${"svelte-1ye6fjm"}"><h2 class="${"svelte-1ye6fjm"}">Development</h2>
		<div class="${"svelte-1ye6fjm"}"><p class="${"svelte-1ye6fjm"}">I am really passionate to code. I started learning Javascript to implement the user
				interfaces and mockups that I design. With the designer\u2019s eye for details I am passionate
				about implementing designs into highly interactive experiances by paying close attention to
				details, assesibility and performance.
			</p>
			<article><h4 class="${"svelte-1ye6fjm"}">Tools and Technologies</h4>
				<ul class="${"tools svelte-1ye6fjm"}">${each(devTools, (devTool) => `<li class="${"svelte-1ye6fjm"}">${escape(devTool)}</li>`)}</ul></article>
			<article><h4 class="${"svelte-1ye6fjm"}">Certifications and Achievements</h4>
				<ul class="${"svelte-1ye6fjm"}"><li class="${"svelte-1ye6fjm"}">Web Design for Everybody: Basics of Web Development &amp; Coding, University of Michigan
					</li>
					<li class="${"svelte-1ye6fjm"}">Responsive Web Design Developer Certification, FreeCodeCamp</li>
					<li class="${"svelte-1ye6fjm"}">Front End Libraries Developer Certification, FreeCodeCamp</li></ul></article>
			<article><h4 class="${"svelte-1ye6fjm"}">Experiance</h4>
				<ul class="${"svelte-1ye6fjm"}"><li class="${"svelte-1ye6fjm"}">Web developer, KMV</li></ul></article></div></section>
	<section id="${"design"}" class="${"svelte-1ye6fjm"}"><h2 class="${"svelte-1ye6fjm"}">Design</h2>
		<div class="${"svelte-1ye6fjm"}"><p class="${"svelte-1ye6fjm"}">My creative journey started with graphics design. I started learning Adobe Photoshop when I
				was sixteen and has since then worked hard to stay relevant in the field. I have collabrated
				with many clients and have a lot of freelancing experiance. I now love to design simple,
				beautiful and emotional websites.
			</p>
			<article><h4 class="${"svelte-1ye6fjm"}">Tools and Technologies</h4>
				<ul class="${"tools svelte-1ye6fjm"}">${each(designTools, (designTool) => `<li class="${"svelte-1ye6fjm"}">${escape(designTool)}</li>`)}</ul></article>
			<article><h4 class="${"svelte-1ye6fjm"}">Certifications and Achievements</h4>
				<ul class="${"svelte-1ye6fjm"}"><li class="${"svelte-1ye6fjm"}">Graphics Design Specialization, CAL ARTS</li>
					<li class="${"svelte-1ye6fjm"}">Adobe UX Foundation learning Journey, Adobe</li></ul></article>
			<article><h4 class="${"svelte-1ye6fjm"}">Experiance</h4>
				<ul class="${"svelte-1ye6fjm"}"><li class="${"svelte-1ye6fjm"}">Freelance Graphics Designer, MIO</li>
					<li class="${"svelte-1ye6fjm"}">UX design, CodeGreenBack</li>
					<li class="${"svelte-1ye6fjm"}">UX design / PR , VayuPure</li>
					<li class="${"svelte-1ye6fjm"}">Design Team Lead, Hack Club VIT Chennai</li></ul></article></div></section>
	${validate_component(Ending, "Ending").$$render($$result, {}, {}, {})}`;
});
var about = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About,
  prerender
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
/*!
 * GSAP 3.7.1
 * https://greensock.com
 *
 * @license Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/
/*!
 * ScrollTrigger 3.7.1
 * https://greensock.com
 *
 * @license Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/
/*!
 * circletype 2.3.0
 * A JavaScript library that lets you curve type on the web.
 * Copyright © 2014-2018 Peter Hrynkow
 * Licensed MIT
 * https://github.com/peterhry/CircleType#readme
 */
