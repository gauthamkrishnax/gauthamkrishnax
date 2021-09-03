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
          var a, s3, l, p, h = t2 & f.F, d = t2 & f.G, v = t2 & f.S, y = t2 & f.P, _ = t2 & f.B, m = d ? r : v ? r[e2] || (r[e2] = {}) : (r[e2] || {}).prototype, g = d ? i : i[e2] || (i[e2] = {}), x = g.prototype || (g.prototype = {});
          d && (n2 = e2);
          for (a in n2)
            s3 = !h && m && m[a] !== void 0, l = (s3 ? m : n2)[a], p = _ && s3 ? c(l, r) : y && typeof l == "function" ? c(Function.call, l) : l, m && u(m, a, l, t2 & f.U), g[a] != l && o(g, a, p), y && x[a] != l && (x[a] = l);
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
        var r = n(15), i = n(16), o = n(19), u = n(3), c = n(13), f = n(37), a = n(26), s3 = n(46), l = n(0)("iterator"), p = !([].keys && "next" in [].keys()), h = function() {
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
          if (T && (x = s3(T.call(new t2()))) !== Object.prototype && x.next && (a(x, O, true), r || typeof x[l] == "function" || u(x, l, h)), w && S && S.name !== "values" && (j = true, P = function() {
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
            var c, f = r(e2), a = i(f.length), s3 = o(u, a);
            if (t2 && n2 != n2) {
              for (; a > s3; )
                if ((c = f[s3++]) != c)
                  return true;
            } else
              for (; a > s3; s3++)
                if ((t2 || s3 in f) && f[s3] === n2)
                  return t2 || s3 || 0;
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
        var r = n(20), i = n(16), o = n(27), u = n(48), c = n(49), f = n(23), a = n(50), s3 = n(51);
        i(i.S + i.F * !n(53)(function(t2) {
          Array.from(t2);
        }), "Array", { from: function(t2) {
          var e2, n2, i2, l, p = o(t2), h = typeof this == "function" ? this : Array, d = arguments.length, v = d > 1 ? arguments[1] : void 0, y = v !== void 0, _ = 0, m = s3(p);
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
        }(), u = n(55), c = r(u), f = n(56), a = r(f), s3 = n(57), l = r(s3), p = n(58), h = r(p), d = n(59), v = r(d), y = Math.PI, _ = Math.max, m = Math.min, g = function() {
          function t2(e2, n2) {
            i(this, t2), this.element = e2, this.originalHTML = this.element.innerHTML;
            var r2 = document.createElement("div"), o2 = document.createDocumentFragment();
            r2.setAttribute("aria-label", e2.innerText), r2.style.position = "relative", this.container = r2, this._letters = (0, a.default)(e2, n2), this._letters.forEach(function(t3) {
              return o2.appendChild(t3);
            }), r2.appendChild(o2), this.element.innerHTML = "", this.element.appendChild(r2);
            var u2 = window.getComputedStyle(this.element), f2 = u2.fontSize, s4 = u2.lineHeight;
            this._fontSize = parseFloat(f2), this._lineHeight = parseFloat(s4) || this._fontSize, this._metrics = this._letters.map(c.default);
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
              var o3 = e3.style, u3 = (-0.5 * f2 + c2[r3]) * n2, a3 = -0.5 * t3._metrics[r3].width / t3._fontSize, s5 = "translateX(" + a3 + "em) rotate(" + u3 + "deg)";
              o3.position = "absolute", o3.bottom = n2 === -1 ? 0 : "auto", o3.left = "50%", o3.transform = s5, o3.transformOrigin = i2, o3.webkitTransform = s5, o3.webkitTransformOrigin = i2;
            }), this._forceHeight) {
              var a2 = f2 > 180 ? (0, l.default)(e2, f2) : (0, l.default)(o2, f2) + this._lineHeight;
              this.container.style.height = a2 / this._fontSize + "em";
            }
            if (this._forceWidth) {
              var s4 = (0, h.default)(e2, m(180, f2));
              this.container.style.width = s4 / this._fontSize + "em";
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
function is_string(s3) {
  return typeof s3 === "string" || s3 instanceof String;
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
          const s3 = subscribers[i];
          s3[1]();
          subscriber_queue.push(s3, value);
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
var css$d = {
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
  $$result.css.add(css$d);
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
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n\n<head>\n	<meta charset="utf-8" />\n	<link rel="icon" href="/favicon.png" />\n	<meta name="viewport" content="width=device-width, initial-scale=1" />\n	<link rel="preload" href="/fonts/harmony.woff2" as="font" crossorigin="anonymous" />\n	<link rel="preload" href="/fonts/tenorsans.woff2" as="font" crossorigin="anonymous" />\n	' + head + '\n</head>\n\n<body>\n	<div id="svelte">' + body + "</div>\n</body>\n\n</html>";
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
      file: assets + "/_app/start-4ec6d510.js",
      css: [assets + "/_app/assets/start-c446e5f0.css"],
      js: [assets + "/_app/start-4ec6d510.js", assets + "/_app/chunks/vendor-636cd1a8.js"]
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
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "fonts/harmony.woff", "size": 28856, "type": "font/woff" }, { "file": "fonts/harmony.woff2", "size": 22228, "type": "font/woff2" }, { "file": "fonts/tenorsans.woff", "size": 23496, "type": "font/woff" }, { "file": "fonts/tenorsans.woff2", "size": 18532, "type": "font/woff2" }],
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
  "src/routes/contact.svelte": () => Promise.resolve().then(function() {
    return contact;
  }),
  "src/routes/about.svelte": () => Promise.resolve().then(function() {
    return about;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-c9736ab7.js", "css": ["assets/pages/__layout.svelte-9adbf641.css"], "js": ["pages/__layout.svelte-c9736ab7.js", "chunks/vendor-636cd1a8.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-fc59a0d8.js", "css": ["assets/pages/__error.svelte-ee4a4753.css", "assets/Footer-5314022f.css"], "js": ["pages/__error.svelte-fc59a0d8.js", "chunks/vendor-636cd1a8.js", "chunks/Footer-1512c7af.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-a79bdcb2.js", "css": ["assets/pages/index.svelte-ce7f1d19.css", "assets/Footer-5314022f.css"], "js": ["pages/index.svelte-a79bdcb2.js", "chunks/vendor-636cd1a8.js", "chunks/Footer-1512c7af.js"], "styles": [] }, "src/routes/contact.svelte": { "entry": "pages/contact.svelte-72bedd36.js", "css": ["assets/pages/contact.svelte-03fb1889.css", "assets/Footer-5314022f.css"], "js": ["pages/contact.svelte-72bedd36.js", "chunks/vendor-636cd1a8.js", "chunks/Footer-1512c7af.js"], "styles": [] }, "src/routes/about.svelte": { "entry": "pages/about.svelte-8ffbc798.js", "css": [], "js": ["pages/about.svelte-8ffbc798.js", "chunks/vendor-636cd1a8.js"], "styles": [] } };
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
var css$c = {
  code: "svg.svelte-q6o08k{justify-self:end}@media only screen and (max-width: 1280px){svg.svelte-q6o08k{grid-area:1/3/2/4}}.pupil.svelte-q6o08k{margin:10px}",
  map: `{"version":3,"file":"navspot.svelte","sources":["navspot.svelte"],"sourcesContent":["<script>\\n\\timport { onMount } from 'svelte';\\n\\tlet eyeBall, pupil, centerX, centerY, R, r;\\n\\n\\tonMount(() => {\\n\\t\\tlet eyeArea = eyeBall.getBoundingClientRect(),\\n\\t\\t\\tpupilArea = pupil.getBoundingClientRect();\\n\\t\\tR = eyeArea.width / 2;\\n\\t\\tr = pupilArea.width / 2 + 4;\\n\\t\\tcenterX = eyeArea.left + R;\\n\\t\\tcenterY = eyeArea.top + R;\\n\\t});\\n\\n\\tconst followEye = (e) => {\\n\\t\\tlet x = e.clientX - centerX,\\n\\t\\t\\ty = e.clientY - centerY,\\n\\t\\t\\ttheta = Math.atan2(y, x),\\n\\t\\t\\tangle = (theta * 180) / Math.PI + 360;\\n\\t\\tpupil.style.transform = \`translateX(\${R - r + 'px'}) rotate(\${angle + 'deg'})\`;\\n\\t\\tpupil.style.transformOrigin = \`\${r + 'px'} center\`;\\n\\t};\\n<\/script>\\n\\n<svelte:window on:mousemove={(e) => followEye(e)} />\\n\\n<svg width=\\"26\\" height=\\"26\\" viewBox=\\"0 0 26 26\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\n\\t<circle bind:this={eyeBall} cx=\\"13\\" cy=\\"13\\" r=\\"12\\" stroke=\\"#505050\\" stroke-width=\\"2\\" />\\n\\t<circle class=\\"pupil\\" bind:this={pupil} cx=\\"13\\" cy=\\"13\\" r=\\"3\\" fill=\\"black\\" />\\n</svg>\\n\\n<style lang=\\"scss\\">svg {\\n  justify-self: end;\\n}\\n@media only screen and (max-width: 1280px) {\\n  svg {\\n    grid-area: 1/3/2/4;\\n  }\\n}\\n\\n.pupil {\\n  margin: 10px;\\n}</style>\\n"],"names":[],"mappings":"AA8BmB,GAAG,cAAC,CAAC,AACtB,YAAY,CAAE,GAAG,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,GAAG,cAAC,CAAC,AACH,SAAS,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,AACpB,CAAC,AACH,CAAC,AAED,MAAM,cAAC,CAAC,AACN,MAAM,CAAE,IAAI,AACd,CAAC"}`
};
var Navspot = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let eyeBall, pupil;
  $$result.css.add(css$c);
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
var css$b = {
  code: '@font-face{font-family:"harmony";src:url("/fonts/harmony.woff2") format("woff2"), url("/fonts/harmony.woff") format("woff");font-weight:normal;font-style:normal;font-display:fallback}@font-face{font-family:"tenorsans";src:url("/fonts/tenorsans.woff2") format("woff2"), url("/fonts/tenorsans.woff") format("woff");font-weight:normal;font-style:normal;font-display:fallback}html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:before,blockquote:after,q:before,q:after{content:"";content:none}table{border-collapse:collapse;border-spacing:0}a{text-decoration:none}*{box-sizing:border-box}*{scrollbar-width:thin;scrollbar-color:#7E5923 #d1d1d1}*::-webkit-scrollbar{width:12px}*::-webkit-scrollbar-track{background:#d1d1d1}*::-webkit-scrollbar-thumb{background-color:#7E5923;border-radius:20px;border:3px solid #d1d1d1}html,body{min-height:100vh;background-color:#FFFFF5;font-family:"tenorsans", sans-serif}html{scroll-behavior:smooth}#svelte{height:100%;overflow:hidden}.hide{display:none}header.svelte-1cniypu.svelte-1cniypu{position:fixed;z-index:19;top:0;right:0;left:0;height:12vh;display:grid;grid-template-columns:1fr 1fr 1fr;align-items:end;margin:0 120px 0}@media only screen and (max-width: 1280px){header.svelte-1cniypu.svelte-1cniypu{margin:0 64px 0;min-height:150px;grid-template-rows:1fr 0.5fr}}@media only screen and (max-width: 720px){header.svelte-1cniypu.svelte-1cniypu{margin:0 40px 0;min-height:100px}}@media only screen and (max-height: 480px){header.svelte-1cniypu.svelte-1cniypu{margin:0 40px 0;min-height:100px}}@media only screen and (max-width: 1280px){.logo.svelte-1cniypu.svelte-1cniypu{grid-area:1/1/2/4}}h3.svelte-1cniypu.svelte-1cniypu{font-family:"harmony", serif;color:#3c3c3c;text-decoration:none;font-size:18px;letter-spacing:0.25em}@media only screen and (max-width: 1280px){h3.svelte-1cniypu.svelte-1cniypu{grid-area:1/1/2/4;font-size:14px}}@media only screen and (max-width: 720px){h3.svelte-1cniypu.svelte-1cniypu{font-size:12px}}@media only screen and (max-height: 480px){h3.svelte-1cniypu.svelte-1cniypu{font-size:12px}}@media only screen and (max-width: 1280px){nav.svelte-1cniypu.svelte-1cniypu{grid-area:2/1/3/3;justify-content:start}}ul.svelte-1cniypu.svelte-1cniypu{display:flex;justify-content:space-between;align-items:flex-end;margin-right:4em}@media only screen and (max-width: 1280px){ul.svelte-1cniypu.svelte-1cniypu{justify-content:flex-start}}ul.svelte-1cniypu a.svelte-1cniypu{font-size:18px;padding-top:5px;color:#505050;letter-spacing:0.15em}@media only screen and (max-width: 1280px){ul.svelte-1cniypu a.svelte-1cniypu{margin-right:5em;font-size:14px}}@media only screen and (max-width: 720px){ul.svelte-1cniypu a.svelte-1cniypu{margin-right:3em;font-size:12px}}@media only screen and (max-height: 480px){ul.svelte-1cniypu a.svelte-1cniypu{margin-right:3em;font-size:12px}}.P.svelte-1cniypu a.svelte-1cniypu:nth-child(1){border-top:2px solid black}.aboutP.svelte-1cniypu a.svelte-1cniypu:nth-child(2){border-top:2px solid black}.contactP.svelte-1cniypu a.svelte-1cniypu:nth-child(3){border-top:2px solid black}',
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script>\\r\\n\\timport Navspot from '../svg/navspot.svelte';\\r\\n\\timport { page } from '$app/stores';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<header>\\r\\n\\t\\t<a class=\\"logo\\" href=\\"/\\"> <h3>GAUTHAM KRISHNA</h3></a>\\r\\n\\t\\t<nav>\\r\\n\\t\\t\\t<ul class={\`\${$page.path}P\`.slice(1)}>\\r\\n\\t\\t\\t\\t<a href=\\"/\\"><li>HOME</li></a>\\r\\n\\t\\t\\t\\t<a href=\\"/about\\"><li>ABOUT</li></a>\\r\\n\\t\\t\\t\\t<a href=\\"/contact\\"><li>CONTACT</li></a>\\r\\n\\t\\t\\t</ul>\\r\\n\\t\\t</nav>\\r\\n\\t\\t<Navspot />\\r\\n\\t</header>\\r\\n\\r\\n\\r\\n<slot />\\r\\n\\r\\n<style lang=\\"scss\\">@font-face {\\n  font-family: \\"harmony\\";\\n  src: url(\\"/fonts/harmony.woff2\\") format(\\"woff2\\"), url(\\"/fonts/harmony.woff\\") format(\\"woff\\");\\n  font-weight: normal;\\n  font-style: normal;\\n  font-display: fallback;\\n}\\n@font-face {\\n  font-family: \\"tenorsans\\";\\n  src: url(\\"/fonts/tenorsans.woff2\\") format(\\"woff2\\"), url(\\"/fonts/tenorsans.woff\\") format(\\"woff\\");\\n  font-weight: normal;\\n  font-style: normal;\\n  font-display: fallback;\\n}\\n:global(html),\\n:global(body),\\n:global(div),\\n:global(span),\\n:global(applet),\\n:global(object),\\n:global(iframe),\\n:global(h1),\\n:global(h2),\\n:global(h3),\\n:global(h4),\\n:global(h5),\\n:global(h6),\\n:global(p),\\n:global(blockquote),\\n:global(pre),\\n:global(a),\\n:global(abbr),\\n:global(acronym),\\n:global(address),\\n:global(big),\\n:global(cite),\\n:global(code),\\n:global(del),\\n:global(dfn),\\n:global(em),\\n:global(img),\\n:global(ins),\\n:global(kbd),\\n:global(q),\\n:global(s),\\n:global(samp),\\n:global(small),\\n:global(strike),\\n:global(strong),\\n:global(sub),\\n:global(sup),\\n:global(tt),\\n:global(var),\\n:global(b),\\n:global(u),\\n:global(i),\\n:global(center),\\n:global(dl),\\n:global(dt),\\n:global(dd),\\n:global(ol),\\n:global(ul),\\n:global(li),\\n:global(fieldset),\\n:global(form),\\n:global(label),\\n:global(legend),\\n:global(table),\\n:global(caption),\\n:global(tbody),\\n:global(tfoot),\\n:global(thead),\\n:global(tr),\\n:global(th),\\n:global(td),\\n:global(article),\\n:global(aside),\\n:global(canvas),\\n:global(details),\\n:global(embed),\\n:global(figure),\\n:global(figcaption),\\n:global(footer),\\n:global(header),\\n:global(hgroup),\\n:global(menu),\\n:global(nav),\\n:global(output),\\n:global(ruby),\\n:global(section),\\n:global(summary),\\n:global(time),\\n:global(mark),\\n:global(audio),\\n:global(video) {\\n  margin: 0;\\n  padding: 0;\\n  border: 0;\\n  font-size: 100%;\\n  font: inherit;\\n  vertical-align: baseline;\\n}\\n:global(article),\\n:global(aside),\\n:global(details),\\n:global(figcaption),\\n:global(figure),\\n:global(footer),\\n:global(header),\\n:global(hgroup),\\n:global(menu),\\n:global(nav),\\n:global(section) {\\n  display: block;\\n}\\n:global(body) {\\n  line-height: 1;\\n}\\n:global(ol),\\n:global(ul) {\\n  list-style: none;\\n}\\n:global(blockquote),\\n:global(q) {\\n  quotes: none;\\n}\\n:global(blockquote:before),\\n:global(blockquote:after),\\n:global(q:before),\\n:global(q:after) {\\n  content: \\"\\";\\n  content: none;\\n}\\n:global(table) {\\n  border-collapse: collapse;\\n  border-spacing: 0;\\n}\\n:global(a) {\\n  text-decoration: none;\\n}\\n:global(*) {\\n  box-sizing: border-box;\\n}\\n:global(*) {\\n  scrollbar-width: thin;\\n  scrollbar-color: #7E5923 #d1d1d1;\\n}\\n:global(*::-webkit-scrollbar) {\\n  width: 12px;\\n}\\n:global(*::-webkit-scrollbar-track) {\\n  background: #d1d1d1;\\n}\\n:global(*::-webkit-scrollbar-thumb) {\\n  background-color: #7E5923;\\n  border-radius: 20px;\\n  border: 3px solid #d1d1d1;\\n}\\n:global(html),\\n:global(body) {\\n  min-height: 100vh;\\n  background-color: #FFFFF5;\\n  font-family: \\"tenorsans\\", sans-serif;\\n}\\n:global(html) {\\n  scroll-behavior: smooth;\\n}\\n:global(#svelte) {\\n  height: 100%;\\n  overflow: hidden;\\n}\\n:global(.hide) {\\n  display: none;\\n}\\n\\nheader {\\n  position: fixed;\\n  z-index: 19;\\n  top: 0;\\n  right: 0;\\n  left: 0;\\n  height: 12vh;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  align-items: end;\\n  margin: 0 120px 0;\\n}\\n@media only screen and (max-width: 1280px) {\\n  header {\\n    margin: 0 64px 0;\\n    min-height: 150px;\\n    grid-template-rows: 1fr 0.5fr;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  header {\\n    margin: 0 40px 0;\\n    min-height: 100px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  header {\\n    margin: 0 40px 0;\\n    min-height: 100px;\\n  }\\n}\\n\\n@media only screen and (max-width: 1280px) {\\n  .logo {\\n    grid-area: 1/1/2/4;\\n  }\\n}\\n\\nh3 {\\n  font-family: \\"harmony\\", serif;\\n  color: #3c3c3c;\\n  text-decoration: none;\\n  font-size: 18px;\\n  letter-spacing: 0.25em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  h3 {\\n    grid-area: 1/1/2/4;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h3 {\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h3 {\\n    font-size: 12px;\\n  }\\n}\\n\\n@media only screen and (max-width: 1280px) {\\n  nav {\\n    grid-area: 2/1/3/3;\\n    justify-content: start;\\n  }\\n}\\n\\nul {\\n  display: flex;\\n  justify-content: space-between;\\n  align-items: flex-end;\\n  margin-right: 4em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  ul {\\n    justify-content: flex-start;\\n  }\\n}\\nul a {\\n  font-size: 18px;\\n  padding-top: 5px;\\n  color: #505050;\\n  letter-spacing: 0.15em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  ul a {\\n    margin-right: 5em;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  ul a {\\n    margin-right: 3em;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  ul a {\\n    margin-right: 3em;\\n    font-size: 12px;\\n  }\\n}\\n\\n.P a:nth-child(1) {\\n  border-top: 2px solid black;\\n}\\n\\n.aboutP a:nth-child(2) {\\n  border-top: 2px solid black;\\n}\\n\\n.contactP a:nth-child(3) {\\n  border-top: 2px solid black;\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
};
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css$b);
  $$unsubscribe_page();
  return `<header class="${"svelte-1cniypu"}"><a class="${"logo svelte-1cniypu"}" href="${"/"}"><h3 class="${"svelte-1cniypu"}">GAUTHAM KRISHNA</h3></a>
		<nav class="${"svelte-1cniypu"}"><ul class="${escape(null_to_empty(`${$page.path}P`.slice(1))) + " svelte-1cniypu"}"><a href="${"/"}" class="${"svelte-1cniypu"}"><li>HOME</li></a>
				<a href="${"/about"}" class="${"svelte-1cniypu"}"><li>ABOUT</li></a>
				<a href="${"/contact"}" class="${"svelte-1cniypu"}"><li>CONTACT</li></a></ul></nav>
		${validate_component(Navspot, "Navspot").$$render($$result, {}, {}, {})}</header>


${slots.default ? slots.default({}) : ``}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
var css$a = {
  code: "svg.svelte-1b8qfn3{width:35%;position:absolute;bottom:0;right:6%}@media only screen and (max-width: 1280px){svg.svelte-1b8qfn3{width:auto;height:45%;right:30%}}@media only screen and (max-width: 720px){svg.svelte-1b8qfn3{height:40%;right:25%}}@media only screen and (max-height: 480px){svg.svelte-1b8qfn3{height:40%;right:25%}}.back.svelte-1b8qfn3{opacity:0.3}",
  map: `{"version":3,"file":"flower.svelte","sources":["flower.svelte"],"sourcesContent":["<script>\\n\\texport let type = '';\\n<\/script>\\n\\n<svg class={type} viewBox=\\"0 0 771 981\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\n\\t<path\\n\\t\\td=\\"M584.95 885.022C591.169 913.775 596.156 943.032 597.306 972.639L596.5 977.5L595.153 980C595.03 976.872 594.882 973.742 594.706 970.606C593.315 949.611 590.043 928.611 586.409 907.537C575.784 848.516 559.509 791.362 531.135 738.155C522.709 722.136 515.081 705.901 507.091 689.593C504.427 684.157 502.052 679.156 499.751 673.794C486.727 645.167 475.659 616.184 466.331 586.047C458.797 561.923 453.291 537.081 449.305 512.17C446.179 490.447 443.2 468 440.148 445.915C438.732 434.329 436.88 423.033 435.464 411.447C435.249 410.651 435.758 410.001 435.905 409.277C436.843 410.221 437.058 411.018 437.273 411.814C440.755 435.493 445.034 458.957 447.793 482.489C452.398 519.2 459.32 555.627 470.662 590.691C475.758 606.412 481.216 622.207 487.183 637.351C494.874 656.988 503.289 676.771 513.445 695.401C518.845 705.911 523.448 716.637 528.487 727.074C538.49 748.309 548.929 769.256 558.062 791.068C570.792 821.142 578.233 853.155 584.95 885.022Z\\"\\n\\t\\tfill=\\"url(#paint0_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M438.047 429.701C438.702 428.327 439.358 426.954 439.143 426.157C437.58 415.295 442.093 406.042 446.244 396.716C451.05 386.016 455.857 375.317 460.951 365.052C466.119 354.426 469.841 343.506 472.188 331.931C475.191 318.983 479.568 306.69 484.306 294.47C489.919 279.792 495.821 265.548 501.796 250.943C503.835 246.461 506.236 242.052 507.913 237.496C518.7 210.31 536.857 187.631 554.003 164.37C559.669 156.858 565.262 149.707 570.278 141.686C573.041 137.351 574.791 132.433 576.83 127.951C576.977 127.228 577.412 126.939 577.559 126.216C577.711 123.61 578.659 120.79 575.986 119.118C573.674 117.519 571.21 118.526 569.396 120.041C567.074 122.206 564.39 124.298 562.791 126.61C552.109 142.143 538.973 154.919 525.763 168.057C518.797 174.553 512.119 181.483 505.729 188.849C494.622 200.907 485.9 214.202 480.139 229.603C479.411 231.339 478.756 232.712 477.304 234.301C477.177 227.496 477.051 220.692 477.287 213.961C477.553 195.938 477.531 177.481 477.797 159.458C478.268 145.996 479.1 132.607 479.571 119.145C479.749 107.13 480 94.7534 479.454 82.5915C479.249 78.0308 478.032 72.8883 476.669 68.4693C472.789 57.8908 461.576 55.6164 453.519 63.7738C450.689 66.589 448.146 69.8393 446.328 73.2364C438.476 85.9545 429.035 97.2205 418.583 107.905C411.035 115.412 404.136 123.428 396.803 131.732C396.373 130.138 395.87 128.906 395.44 127.313C392.572 117.316 388.037 108.111 380.891 100.636C373.095 92.653 363.628 87.3433 353.143 83.3337C345.767 80.7078 338.098 79.5288 330.135 79.7967C320.652 80.1328 313.114 83.8762 308.098 91.8971C305.335 96.2326 302.861 101.003 299.737 105.265C293.851 113.863 287.676 122.025 281.789 130.623C274.886 140.521 267.621 150.345 263.03 161.841C261.945 161.621 261.51 161.91 260.786 161.763C245.311 156.364 230.612 158.279 216.044 165.116C211.117 167.129 206.766 170.012 202.127 172.461C196.617 175.486 191.035 178.873 185.237 181.463C173.715 186.281 165.947 194.873 160.705 205.861C154.3 218.873 153.394 232.623 155.093 246.525C156.856 263.83 161.879 279.912 169.654 295.424C161.43 311.832 150.606 326.207 132.925 333.542C126.765 336.059 120.459 339.299 114.153 342.539C110.311 344.772 106.756 347.441 104.429 351.488C101.808 356.982 103.533 361.474 109.247 363.01C115.323 364.619 121.472 365.866 127.768 366.39C150.708 368.407 174.083 370.135 196.798 375.119C210.108 378.195 223.272 381.995 236.435 385.795C247.428 389.154 258.783 392.587 269.629 396.67C281.922 401.046 294.142 405.785 306.362 410.523C323.934 416.723 341.213 424.37 359.734 427.75C372.106 429.883 384.194 429.699 396.146 426.474C404.476 424.398 412.806 422.321 421.492 422.2C427.138 422.215 432.055 423.966 436.605 427.525C436.747 428.684 437.035 429.119 438.047 429.701ZM285.577 254.915C292.015 256.597 297.44 257.698 302.793 259.16C314.436 263.028 325.932 267.619 336.7 273.946C343.133 277.51 349.057 281.725 354.907 286.301C359.169 289.425 361.329 293.629 362.472 299.133C366.038 318.686 372.068 337.233 380.053 355.422C388.473 373.324 398.634 390.072 414.089 402.998C416.039 404.524 416.757 406.552 415.882 409.011C414.493 414.002 411.081 417.829 406.515 419.915C393.106 426.611 379.057 429.033 364.006 427.11C347.509 424.894 331.745 419.061 316.417 412.939C304.197 408.201 291.977 403.462 279.684 399.086C267.029 394.636 254.736 390.26 242.007 386.172C231.376 382.886 221.106 379.673 210.328 377.11C199.188 374.474 187.975 372.199 176.327 370.213C166.487 368.594 156.863 367.772 146.876 366.876C136.89 365.98 126.903 365.085 116.99 363.827C114.023 363.602 110.914 362.218 107.732 361.196C104.624 359.812 104.194 358.219 104.854 354.963C105.514 351.708 107.978 350.701 110.73 350.13C118.116 348.992 125.938 347.565 133.324 346.427C145.344 344.723 156.573 341.351 167.23 335.228C180.062 327.662 191.091 317.848 200.605 306.221C206.559 299.143 212.226 291.631 218.18 284.553C225.514 276.249 232.847 267.945 241.695 261.455C249.6 255.903 258.15 252.741 267.56 252.767C274.652 253.076 280.44 254.249 285.577 254.915ZM363.112 223.567C364.354 219.3 365.822 212.065 368.374 205.051C373.914 190.734 382.49 178.163 393.089 166.755C405.575 153.471 417.772 139.751 429.608 125.958C440.427 113.465 447.199 98.6452 450.139 82.2946C451.02 77.9541 453.059 73.4718 454.301 69.2046C456.051 64.2873 459.82 62.4156 464.743 62.2843C469.303 62.0795 472.407 65.3452 473.844 69.4026C475.354 73.0982 477.005 77.9524 477.21 82.5131C477.541 93.8781 477.872 105.243 477.479 116.461C476.998 133.687 475.359 151.055 475.313 167.992C474.56 205.123 474.966 242.112 474.287 278.88C474.11 290.895 472.774 303.052 472.234 314.994C471.852 322.448 469.588 329.898 467.759 337.059C463.802 354.709 456.087 370.468 445.624 384.916C442.427 389.54 438.144 393.944 434.009 397.624C427.624 403.108 417.706 403.732 409.91 395.749C401.753 387.692 394.901 378.77 389.427 368.622C375.308 343.539 367.275 316.301 362.43 288.203C359.011 267.926 358.344 247.078 363.112 223.567ZM359.971 287.328C355.421 283.769 351.159 280.645 347.185 277.956C327.893 265.381 306.924 257.362 284.644 252.089C279.653 250.701 276.33 248.52 273.808 244.243C265.592 230.902 261.796 216.198 260.028 200.775C259.252 193.462 259.273 185.935 260.813 178.339C262.726 167.052 267.097 156.641 273.566 147.031C285.123 129.04 298.993 112.646 309.901 94.1459C313.974 87.0634 320.715 83.535 329.113 82.9788C338.234 82.5693 346.627 83.895 354.941 87.4644C364.703 91.3273 373.809 96.5636 380.446 104.689C388.383 113.83 392.625 124.482 394.764 136.214C363.66 181.876 352.665 232.369 359.971 287.328ZM261.499 165.673C253.166 195.617 258.955 222.777 274.301 249.238C272.057 249.16 270.175 249.155 268.293 249.15C261.201 248.841 254.255 247.809 247.377 248.297C216.176 249.876 190.086 261.532 173.433 289.788C172.852 290.8 171.835 292.1 170.818 293.4C169.953 292.095 169.449 290.863 168.873 289.993C163.766 278.036 159.456 265.864 157.537 253.047C156.257 244.502 155.701 236.104 156.665 227.638C157.776 218.448 160.622 209.987 165.276 201.893C168.767 195.822 173.196 190.695 179.502 187.455C190.883 181.478 201.901 175.428 213.282 169.451C224.227 163.762 235.744 160.826 247.901 162.162C252.388 162.319 257.237 162.549 261.499 165.673ZM259.602 251.153C259.167 251.441 258.732 251.729 258.37 251.656C246.491 254.519 237.208 261.298 229.078 269.817C221.891 277.398 215.355 285.487 208.53 293.141C203.084 299.568 197.999 306.069 192.265 312.061C174.988 330.399 154.471 342.431 128.842 344.388C124.208 344.955 119.862 345.956 115.228 346.523C114.431 346.738 113.272 346.879 112.187 346.659C114.871 344.567 117.482 342.837 120.381 341.542C125.381 339.167 130.309 337.154 135.31 334.779C146.979 329.237 156.556 321.012 163.317 309.955C167.825 302.585 172.259 295.575 176.767 288.205C181.128 281.557 185.851 274.983 192.162 269.861C211.605 253.845 234.78 249.131 259.602 251.153ZM476.229 310.155C476.353 290.974 476.693 272.59 476.671 254.132C476.706 240.958 480.936 229.388 489.721 219.496C499.959 208.015 512.073 198.421 523.825 188.753C538.261 176.994 549.3 163.416 555.501 145.844C558.127 138.468 562.199 131.386 567.211 125.247C569.171 123.008 571.131 120.77 574.749 121.503C576.405 124.476 575.457 127.296 574.22 129.681C571.672 134.813 569.198 139.584 566.001 144.208C559.606 153.455 552.561 162.195 545.878 171.007C532.873 188.706 519.868 206.404 510.187 226.283C499.778 247.897 491.103 270.24 482.502 292.221C480.532 298.224 478.634 303.864 476.229 310.155ZM449.295 73.4616C449.363 74.9818 449.29 75.3436 449.216 75.7053C446.13 92.7793 440.008 108.108 429.33 121.759C418.071 136.422 405.512 150.069 392.664 163.28C384.099 172.087 376.907 181.55 371.304 192.464C370.14 194.488 368.977 196.511 367.813 198.535C367.451 198.462 367.09 198.388 366.801 197.953C370.156 188.842 373.148 179.658 376.864 170.62C386.771 147.774 400.724 127.255 418.94 109.86C429.318 99.5376 439.047 88.7066 446.464 76.2769C447.261 76.0619 448.131 75.4852 449.295 73.4616ZM489.008 215.585C489.008 215.585 489.155 214.862 489.228 214.5C490.465 212.115 491.991 210.165 493.228 207.779C502.243 193.038 515.374 182.144 526.555 169.724C534.685 161.205 543.177 152.759 551.307 144.24C551.815 143.59 552.612 143.375 553.991 142.148C553.116 144.607 552.46 145.981 551.805 147.354C546.847 160.659 539.288 171.93 528.045 180.948C524.417 183.978 521.078 187.443 517.451 190.473C508.162 199.134 498.585 207.36 489.008 215.585Z\\"\\n\\t\\tfill=\\"url(#paint1_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M418.267 410.248C417.182 410.028 415.809 409.373 414.65 409.514C390.478 408.001 369.514 398.1 349.499 385.378C337.142 377.6 324.933 369.098 312.65 360.957C303.402 354.562 294.154 348.168 284.76 342.496C291.622 347.654 298.338 353.535 305.274 358.331C317.483 366.833 330.055 375.409 342.338 383.549C354.259 391.616 366.4 398.598 379.705 403.556C391.563 408.221 403.788 411.077 416.527 411.401C416.889 411.475 417.324 411.186 417.685 411.26C418.12 410.971 418.194 410.61 418.267 410.248Z\\"\\n\\t\\tfill=\\"url(#paint2_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M393.384 191.294C393.295 197.301 393.28 202.947 393.191 208.955C393.517 222.202 393.119 235.302 394.315 247.972C395.512 260.643 397.358 273.821 400.147 286.062C405.155 307.79 411.395 329.016 417.272 350.167C417.487 350.964 418.064 351.834 419.003 352.778C418.573 351.184 418.504 349.664 418.001 348.432C412.343 326.195 406.324 303.885 401.028 281.721C395.947 260.354 394.776 238.274 395.126 216.126C395.293 207.875 394.737 199.477 394.469 191.514C394.181 191.079 393.819 191.006 393.384 191.294Z\\"\\n\\t\\tfill=\\"url(#paint3_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M359.418 410.739C365.783 412.783 372 415.551 378.076 417.16C384.513 418.842 390.736 419.728 397.1 421.772C388.917 423.125 381.321 421.584 373.363 419.97C351.66 415.568 331.414 407.695 311.897 398.088C311.247 397.579 310.524 397.433 309.292 397.936C317.171 401.794 325.05 405.651 332.568 409.436C346.738 415.699 361.636 420.228 376.828 423.309C380.807 424.116 384.86 424.561 388.624 424.572C393.111 424.729 397.31 424.45 402.594 424.392C402.091 423.161 401.441 422.652 401.226 421.855C402.384 421.714 403.904 421.645 405.063 421.504C405.136 421.142 405.21 420.78 405.21 420.78C400.072 420.115 394.935 419.45 390.232 418.496C384.807 417.395 379.816 416.006 374.464 414.544C369.473 413.155 364.482 411.766 359.13 410.304C359.492 410.378 359.492 410.378 359.418 410.739Z\\"\\n\\t\\tfill=\\"url(#paint4_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M457.158 242.642C458.281 255.674 459.765 268.78 460.815 282.173C461.859 297.449 461.745 312.866 460.183 327.99C458.25 346.804 453.785 365.105 444.403 381.655C444.329 382.017 444.183 382.741 444.833 383.249C448.182 376.02 451.82 369.226 454.445 361.85C462.837 337.19 464.208 311.86 462.613 286.304C461.637 272.549 459.503 258.935 457.803 245.033C457.95 244.309 457.735 243.512 457.158 242.642Z\\"\\n\\t\\tfill=\\"url(#paint5_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M309.979 251.579C309.114 250.274 308.611 249.042 307.673 248.099C297.942 232.944 289.879 216.998 282.612 200.837C276.352 187.139 272.555 172.435 271.438 157.521C271.155 155.204 271.16 153.322 270.877 151.005C269.346 154.837 269.336 158.601 269.687 162.438C271.743 178.296 275.54 193 282.811 207.279C289.795 221.123 296.27 235.618 305.791 248.093C307.017 249.472 307.882 250.777 308.674 252.444C309.183 251.794 309.544 251.868 309.979 251.579Z\\"\\n\\t\\tfill=\\"url(#paint6_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M417.784 401.488C417.208 400.618 416.993 399.821 416.343 399.313C404.437 385.6 397.17 369.439 392.079 351.836C387.632 336.624 383.909 321.558 379.825 306.419C379.395 304.825 378.892 303.593 378.026 302.288C379.385 308.589 380.308 315.178 382.101 321.191C386.18 338.212 390.622 355.307 397.092 371.683C401.045 381.899 406.812 390.601 413.811 398.799C414.676 400.105 415.976 401.122 417.276 402.138C417.276 402.138 417.711 401.85 417.784 401.488Z\\"\\n\\t\\tfill=\\"url(#paint7_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M121.23 348.493C123.112 348.499 125.356 348.577 127.238 348.582C136.359 348.173 145.26 348.848 154.377 350.321C163.131 351.72 171.959 352.757 180.205 354.806C192.792 357.736 205.667 361.101 218.254 364.03C221.147 364.617 224.041 365.204 226.573 365.718C204.084 357.767 180.645 352.636 156.987 348.591C147.509 347.045 137.738 346.946 128.04 346.485C125.796 346.407 123.406 347.052 120.654 347.623C121.015 347.697 121.304 348.132 121.23 348.493Z\\"\\n\\t\\tfill=\\"url(#paint8_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M193.308 221.512C200.678 226.02 207.614 230.816 214.985 235.324C222.067 239.397 229.512 243.543 236.956 247.689C226.031 245.85 216.783 239.455 206.084 234.649C212.584 239.733 219.09 242.936 225.669 245.776C228.054 247.013 230.948 247.6 233.333 248.837C235.719 250.074 238.036 249.791 239.923 247.914C243.467 249.01 246.722 249.67 250.266 250.765C250.339 250.404 250.486 249.68 250.921 249.392C230.308 243.328 212.316 231.77 194.686 220.286C193.816 220.862 193.743 221.224 193.308 221.512Z\\"\\n\\t\\tfill=\\"url(#paint9_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M452.874 300.899C454.009 336.153 447.474 370.227 428.426 401.011C429.37 400.072 429.878 399.422 430.822 398.484C436.996 390.321 441.509 381.069 444.649 371.161C447.5 360.818 450.713 350.548 452.84 340.058C455.408 327.398 455.444 314.224 453.959 301.119C454.033 300.757 453.671 300.684 453.745 300.322C453.021 300.176 452.948 300.537 452.874 300.899Z\\"\\n\\t\\tfill=\\"url(#paint10_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M335.695 137.791C338.71 147.064 341.725 156.337 345.175 165.322C350.423 178.438 351.761 192.266 353.172 205.734C354.588 217.319 355.208 229.119 356.55 241.066C356.555 239.184 356.487 237.663 356.492 235.782C355.463 214.86 354.796 194.012 349.495 173.73C346.779 161.128 342.034 149.244 335.695 137.791Z\\"\\n\\t\\tfill=\\"url(#paint11_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M304.429 269.66C327.338 282.968 350.247 296.277 367.417 317.459C367.852 317.171 367.852 317.171 368.287 316.883C367.71 316.012 367.569 314.854 366.919 314.345C361.938 309.193 357.105 303.317 351.254 298.74C337.823 286.978 322.646 278.251 306.526 270.462C306.311 269.665 305.152 269.807 304.429 269.66Z\\"\\n\\t\\tfill=\\"url(#paint12_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M182.604 324.412C209.513 331 233.507 344.528 258.665 356.033C255.991 354.361 253.606 353.124 250.933 351.452C248.259 349.78 245.874 348.543 243.127 347.233C229.392 340.681 216.018 334.202 202.137 328.374C196.931 326.188 191.505 325.088 186.153 323.625C185.068 323.405 183.909 323.547 183.186 323.4C182.316 323.977 182.604 324.412 182.604 324.412Z\\"\\n\\t\\tfill=\\"url(#paint13_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M462.589 162.022C463.299 193.8 471.033 224.367 474.495 255.574C474.857 255.647 475.292 255.359 475.654 255.432C474.306 245.367 473.031 234.94 471.684 224.876C470.047 214.376 468.411 203.876 466.775 193.376C465.139 182.876 463.864 172.449 462.589 162.022Z\\"\\n\\t\\tfill=\\"url(#paint14_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M358.618 279.145C351.451 253.212 345.515 226.776 340.737 200.199C340.449 199.763 340.161 199.328 339.872 198.893C343.706 226.409 349.207 253.134 358.618 279.145Z\\"\\n\\t\\tfill=\\"url(#paint15_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M485.265 287.886C489.935 274.146 494.678 260.044 499.348 246.304C504.018 232.564 509.338 219.332 516.105 206.394C500.401 231.83 493.158 260.112 485.265 287.886Z\\"\\n\\t\\tfill=\\"url(#paint16_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M339.975 81.4159C341.123 85.0382 344.52 86.857 346.612 89.5408C348.704 92.2247 350.795 94.9086 352.526 97.5191C354.617 100.203 356.636 103.249 358.293 106.221C360.023 108.831 362.041 111.877 363.698 114.849C365.355 117.821 366.938 121.155 368.595 124.127C369.89 127.026 371.473 130.36 372.695 133.621C373.375 122.837 350.024 85.7138 339.975 81.4159Z\\"\\n\\t\\tfill=\\"url(#paint17_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M300.73 219.199C305.753 235.282 314.619 249.131 324.716 262.477C327.961 266.901 331.641 271.037 337.135 273.658C337.282 272.934 337.429 272.211 337.067 272.137C324.213 261.245 316.217 246.819 307.787 232.681C305.265 228.404 303.178 223.838 300.73 219.199Z\\"\\n\\t\\tfill=\\"url(#paint18_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M420.356 201.284C420.779 178.774 418.523 156.474 421.264 133.681C419.303 135.919 418.355 138.739 418.271 142.865C417.496 161.538 418.53 180.577 419.711 198.893C419.926 199.69 420.141 200.487 420.356 201.284Z\\"\\n\\t\\tfill=\\"url(#paint19_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M465.224 124.897C468.442 112.745 466.101 68.5853 460.911 60.7538C460.748 67.123 462.762 72.0506 462.82 77.3347C463.239 82.6922 463.733 87.6879 464.152 93.0454C464.572 98.4029 464.63 103.687 464.976 109.406C465.108 114.329 465.166 119.613 465.224 124.897Z\\"\\n\\t\\tfill=\\"url(#paint20_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M382.36 358.903C369.888 340.556 353.568 326.325 335.869 313.32C351.681 328.202 368.436 342.145 382.36 358.903Z\\"\\n\\t\\tfill=\\"url(#paint21_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M430.381 320.816C430.741 294.903 426.908 267.387 422.712 239.798C425.314 267.817 427.989 295.475 430.381 320.816Z\\"\\n\\t\\tfill=\\"url(#paint22_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M495.395 236.087C486.217 257.198 484.2 280.138 479.651 302.564C482.287 291.424 484.85 280.646 487.486 269.506C489.761 258.293 492.397 247.153 495.395 236.087Z\\"\\n\\t\\tfill=\\"url(#paint23_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M404.857 390.958C393.753 375.148 387.649 356.963 380.75 338.993C380.891 340.152 381.321 341.746 381.463 342.904C385.191 356.088 389.789 368.695 396.343 380.946C397.638 383.845 399.729 386.528 401.459 389.139C402.398 390.082 403.336 391.026 404.275 391.97C404.348 391.608 404.421 391.246 404.857 390.958Z\\"\\n\\t\\tfill=\\"url(#paint24_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M232.847 267.945C248.532 276.022 263.709 284.75 278.23 294.85C264.799 283.088 249.769 273.637 232.847 267.945Z\\"\\n\\t\\tfill=\\"url(#paint25_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M311.121 151.259C307.398 136.194 303.963 121.563 300.529 106.932C298.416 111.776 305.212 141.399 311.121 151.259Z\\"\\n\\t\\tfill=\\"url(#paint26_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M145.926 343.711C160.83 346.357 176.095 349.077 189.913 351.503C179.502 347.132 153.747 342.284 145.926 343.711Z\\"\\n\\t\\tfill=\\"url(#paint27_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M353.217 162.81C346.165 147.446 342.374 130.86 333.293 116.214C332.717 115.344 332.575 114.185 331.998 113.315C331.563 113.603 331.201 113.53 331.128 113.892C334.725 122.153 338.757 130.126 342.353 138.388C345.95 146.649 349.111 155.199 352.346 163.387C352.42 163.025 352.855 162.737 353.217 162.81Z\\"\\n\\t\\tfill=\\"url(#paint28_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M335.332 351.247C334.032 350.23 332.805 348.852 331.505 347.835C315.033 336.209 297.325 326.968 280.198 316.715C279.836 316.642 279.474 316.569 278.316 316.71C282.725 319.111 286.41 321.365 290.457 323.692C304.91 332.273 319.872 340.203 333.235 350.445C333.959 350.592 334.682 350.739 335.332 351.247Z\\"\\n\\t\\tfill=\\"url(#paint29_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M360.144 117.518C352.432 105.409 346.025 92.4346 336.064 82.1291C335.556 82.7792 335.194 82.7058 335.121 83.0675L335.047 83.4292C334.974 83.791 335.262 84.226 335.262 84.226C343.918 95.3966 351.85 106.42 360.144 117.518Z\\"\\n\\t\\tfill=\\"url(#paint30_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M492.704 214.075C488.783 218.552 482.426 240.612 481.887 252.554C485.54 240.114 489.193 227.674 492.704 214.075Z\\"\\n\\t\\tfill=\\"url(#paint31_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M223.21 165.063C226.026 167.893 228.841 170.724 231.583 173.916C234.325 177.109 237.067 180.301 239.447 183.42C242.189 186.612 244.495 190.093 247.164 193.647C244.584 184.085 229.795 166.022 223.21 165.063Z\\"\\n\\t\\tfill=\\"url(#paint32_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M391.186 254.116C392.225 271.274 395.943 288.222 400.458 304.955C397.102 288.08 394.181 270.917 391.186 254.116Z\\"\\n\\t\\tfill=\\"url(#paint33_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M155.245 243.92C156.897 248.774 171.13 258.44 180.823 260.783C171.864 254.823 163.555 249.371 155.245 243.92Z\\"\\n\\t\\tfill=\\"url(#paint34_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M189.725 181.62C198.322 187.506 207.208 193.828 215.806 199.714C208.298 192.166 199.774 185.918 190.38 180.246C190.233 180.97 190.16 181.331 189.725 181.62Z\\"\\n\\t\\tfill=\\"url(#paint35_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M438.469 141.689C438.715 131.195 439.395 120.411 439.641 109.916C436.79 120.259 437.629 130.974 438.469 141.689Z\\"\\n\\t\\tfill=\\"url(#paint36_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M354.742 320.537C361.887 328.012 368.96 335.849 376.105 343.324C376.54 343.035 376.614 342.674 376.975 342.747C370.773 334.334 363.193 327.147 354.742 320.537Z\\"\\n\\t\\tfill=\\"url(#paint37_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M458.433 93.3918C458.967 83.332 458.993 73.9223 456.34 64.7224C455.978 64.649 455.543 64.9374 455.181 64.864C456.314 74.1321 457.373 83.762 458.433 93.3918Z\\"\\n\\t\\tfill=\\"url(#paint38_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M189.415 268.551C181.824 265.128 174.595 261.779 167.004 258.356C171.046 262.565 176.252 264.751 181.023 267.225C183.046 268.389 185.578 268.902 187.748 269.342C188.037 269.778 188.545 269.128 189.415 268.551Z\\"\\n\\t\\tfill=\\"url(#paint39_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M264.175 353.008C254.639 346.178 244.667 339.637 233.606 334.757C244.012 341.01 254.13 346.828 264.175 353.008Z\\"\\n\\t\\tfill=\\"url(#paint40_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M252.564 283.995C245.481 279.923 238.037 275.777 230.955 271.704C230.881 272.066 230.446 272.354 230.299 273.077C233.55 275.62 237.382 277.15 240.779 278.969C244.538 280.861 248.223 283.115 251.982 285.007C252.417 284.719 252.49 284.357 252.564 283.995Z\\"\\n\\t\\tfill=\\"url(#paint41_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M412.253 146.54C410.497 153.339 410.623 160.144 411.908 166.806C412.505 160.149 412.814 153.056 413.411 146.398C412.976 146.687 412.614 146.613 412.253 146.54Z\\"\\n\\t\\tfill=\\"url(#paint42_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M218.068 166.279C222.545 170.2 227.31 174.556 231.787 178.477C228.401 172.894 223.997 168.611 219.085 164.979C219.011 165.341 218.503 165.991 218.068 166.279Z\\"\\n\\t\\tfill=\\"url(#paint43_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M295.659 114.23C295.932 120.311 297.725 126.323 299.157 132.263C299.519 132.336 299.954 132.048 299.954 132.048C298.884 126.182 297.526 119.881 296.456 114.015C296.456 114.015 296.094 113.941 295.659 114.23Z\\"\\n\\t\\tfill=\\"url(#paint44_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M174.276 272.635C177.097 273.584 180.206 274.968 183.026 275.916C183.099 275.555 183.173 275.193 183.681 274.543C180.499 273.521 177.752 272.211 174.57 271.189C174.423 271.912 174.35 272.274 174.276 272.635Z\\"\\n\\t\\tfill=\\"url(#paint45_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M335.767 350.959C339.306 353.936 342.844 356.914 346.383 359.891C346.457 359.529 346.892 359.241 346.965 358.879C342.991 356.19 339.379 353.575 335.767 350.959Z\\"\\n\\t\\tfill=\\"url(#paint46_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M274.127 313.224C271.453 311.552 268.706 310.242 266.033 308.57C265.959 308.932 265.959 308.932 265.524 309.22C268.198 310.892 270.945 312.202 273.618 313.875C273.692 313.513 274.054 313.586 274.127 313.224Z\\"\\n\\t\\tfill=\\"url(#paint47_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M509.838 690.904C508.899 689.96 508.323 689.09 507.384 688.146C497.859 677.553 488.259 667.32 479.095 656.8C468.343 644.828 457.517 633.217 448.07 620.379C440.138 609.355 432.132 598.693 423.618 588.681C415.393 579.104 406.37 569.742 396.331 561.681C384.126 551.297 370.03 544.671 354.549 541.155C335.163 536.47 315.62 536.272 296.067 539.838C271.445 544.258 246.896 548.317 222.489 553.535C210.322 555.963 198.732 559.261 186.995 563.283C171.562 568.814 156.344 575.142 141.2 581.109C129.316 585.854 119.378 594.006 109.512 601.797C109.077 602.085 109.004 602.447 108.349 603.82C110.304 603.464 111.751 603.757 112.983 603.254C134.135 597.376 155.36 591.136 176.8 585.694C191.142 581.824 206.061 578.824 220.477 574.593C230.909 571.437 241.917 569.15 252.706 567.949C265.811 566.465 278.911 566.862 291.933 569.503C303.87 571.925 316.241 574.057 328.105 576.84C350.311 582.474 371.642 590.567 391.589 601.768C417.607 616.46 442.97 632.526 466.661 651.265C480.6 662.378 492.653 675.367 504.706 688.356C505.932 689.735 507.232 690.752 508.821 692.204C508.894 691.842 509.403 691.192 509.838 690.904ZM461.549 641.19C461.114 641.478 461.114 641.478 460.679 641.767C459.379 640.75 458.44 639.806 457.14 638.789C446.236 629.422 435.258 620.417 424.354 611.05C420.165 607.564 415.829 604.802 411.494 602.039C386.425 584.527 359.678 571.57 330.169 562.948C315.197 558.782 299.423 556.712 283.571 556.886C280.966 556.734 278.722 556.656 276.117 556.504C277.134 555.204 278.004 554.627 278.8 554.412C286.989 551.177 295.177 547.942 303.653 545.142C317.781 540.476 331.756 538.415 346.586 541.423C363.587 544.871 379.424 550.343 392.567 561.67C411.272 577.139 427.147 595.423 441.281 614.86C447.195 622.838 452.82 630.381 458.807 637.998C460.107 639.014 460.61 640.246 461.549 641.19ZM133.128 594.912C133.201 594.551 132.84 594.477 132.913 594.115C132.986 593.754 133.421 593.465 133.421 593.465C135.088 592.674 136.755 591.882 138.422 591.09C157.409 582.89 177.476 576.792 197.181 570.621C206.816 567.68 216.807 566.693 226.799 565.707C236.717 565.083 246.782 563.735 256.705 561.228C262.209 560.085 268.075 559.015 273.794 558.669C295.801 557.86 317.436 560.742 338.625 567.676C356.994 573.662 374.2 581.671 390.75 591.053C405.565 599.707 419.436 609.299 432.579 620.627C435.756 623.531 439.442 625.785 442.618 628.688C443.63 629.27 444.207 630.14 444.784 631.011C442.975 630.644 441.602 629.989 440.301 628.972C429.68 621.922 419.494 614.583 408.726 608.257C386.179 595.022 362.829 583.883 337.514 576.866C320.372 572.259 302.868 567.579 285.139 565.866C273.344 564.603 261.764 564.137 250.179 565.554C238.159 567.258 225.992 569.686 214.328 573.346C195.493 578.941 176.082 583.665 157.032 588.463C149.064 590.613 141.096 592.762 133.128 594.912ZM308.444 540.089C308.371 540.45 308.659 540.885 308.586 541.247C293.588 546.49 278.517 552.095 263.231 556.903C251.568 560.563 239.474 562.629 226.877 563.464C218.118 563.946 209.285 564.791 200.74 566.071C198.061 566.28 195.597 567.287 192.845 567.859C188.138 568.787 183.504 569.353 178.796 570.281C182.712 567.686 186.554 565.453 190.612 564.016C200.247 561.075 209.955 557.772 219.732 555.989C246.383 550.85 273.322 546.146 300.335 541.08C303.448 540.582 306.127 540.372 308.444 540.089ZM183.279 572.32C161.183 579.137 139.953 587.258 119.367 597.77C126.197 588.234 167.138 572.059 183.279 572.32Z\\"\\n\\t\\tfill=\\"url(#paint48_linear)\\"\\n\\t/>\\n\\t<path\\n\\t\\td=\\"M676.985 286.447C667.555 293.95 658.051 301.814 648.186 309.604C627.076 326.412 607.771 345.469 588.177 364.09C568.001 383.723 551.149 405.537 536.247 428.876C522.435 450.554 509.2 473.101 499.797 497.179C495.059 509.399 490.394 521.257 487.826 533.917C484.603 547.951 481.018 561.911 478.519 576.091C476.313 588.825 475.265 601.417 477.546 614.307C478.118 617.059 479.486 619.596 480.493 622.06C480.854 622.133 481.29 621.845 481.651 621.918C481.583 620.398 481.515 618.878 481.085 617.284C479.449 606.784 480.779 596.509 483.557 586.528C491.974 552.459 509.57 523.264 531.937 496.543C542.247 484.7 553.281 473.004 564.242 461.67C568.089 457.554 572.949 454.021 576.796 449.905C593.712 431.494 610.989 413.155 624.365 391.766C635.053 374.351 644.079 355.846 652.381 337.193C659.227 322.012 666.072 306.83 674.579 292.738C675.019 290.568 676.183 288.544 676.985 286.447ZM665.144 302.122C665.505 302.196 665.505 302.196 665.794 302.631C665.647 303.354 665.574 303.716 665.065 304.366C658.513 318.101 651.961 331.836 645.336 345.933C636.017 365.885 625.901 386.052 612.823 404.113C598.728 423.473 582.394 440.873 565.049 457.691C552.348 470.179 540.297 483.175 528.896 496.679C514.591 513.361 502.672 531.279 493.352 551.232C490.585 557.449 488.179 563.74 485.412 569.957C484.908 568.726 485.129 567.64 485.349 566.555C486.664 561.926 487.691 556.862 489.368 552.307C493.31 540.302 497.324 527.935 501.989 516.077C514.448 486.217 532.039 458.904 551.58 433.116C560.297 421.704 569.953 411.234 579.681 400.403C607.993 370.369 636.665 340.408 660.788 306.888C662.528 305.734 663.98 304.146 665.144 302.122ZM662.25 301.535C662.538 301.971 662.538 301.971 662.827 302.406C662.318 303.056 661.81 303.706 661.663 304.429C645.246 325.955 627.89 346.537 609.523 366.537C597.981 378.883 585.715 391.082 574.46 403.863C563.788 415.633 553.404 427.837 544.32 441.059C533.784 455.869 523.972 470.825 515.098 486.725C504.987 505.011 496.973 524.098 490.332 543.841C487.486 552.302 485.437 560.548 482.953 569.082C482.376 568.212 482.523 567.489 482.67 566.765C485.379 555.264 487.8 543.327 491.233 531.972C494.666 520.617 498.172 508.901 502.617 498.128C511.873 474.773 524.527 453.238 537.83 432.21C552.223 409.521 568.567 388.357 587.873 369.301C604.275 353.421 619.953 337.395 637.655 322.532C645.203 315.025 653.69 308.461 662.25 301.535Z\\"\\n\\t\\tfill=\\"url(#paint49_linear)\\"\\n\\t/>\\n\\t<defs>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint0_linear\\"\\n\\t\\t\\tx1=\\"568.299\\"\\n\\t\\t\\ty1=\\"436.131\\"\\n\\t\\t\\tx2=\\"607\\"\\n\\t\\t\\ty2=\\"1195.5\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#A78140\\" />\\n\\t\\t\\t<stop offset=\\"1\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint1_linear\\"\\n\\t\\t\\tx1=\\"863.208\\"\\n\\t\\t\\ty1=\\"1734.39\\"\\n\\t\\t\\tx2=\\"240.182\\"\\n\\t\\t\\ty2=\\"-46.0365\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint2_linear\\"\\n\\t\\t\\tx1=\\"830.659\\"\\n\\t\\t\\ty1=\\"1745.77\\"\\n\\t\\t\\tx2=\\"207.637\\"\\n\\t\\t\\ty2=\\"-34.6446\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint3_linear\\"\\n\\t\\t\\tx1=\\"912.073\\"\\n\\t\\t\\ty1=\\"1717.29\\"\\n\\t\\t\\tx2=\\"289.045\\"\\n\\t\\t\\ty2=\\"-63.1357\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint4_linear\\"\\n\\t\\t\\tx1=\\"826.084\\"\\n\\t\\t\\ty1=\\"1747.38\\"\\n\\t\\t\\tx2=\\"203.058\\"\\n\\t\\t\\ty2=\\"-33.0482\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint5_linear\\"\\n\\t\\t\\tx1=\\"939.097\\"\\n\\t\\t\\ty1=\\"1707.84\\"\\n\\t\\t\\tx2=\\"316.07\\"\\n\\t\\t\\ty2=\\"-72.5899\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint6_linear\\"\\n\\t\\t\\tx1=\\"826.902\\"\\n\\t\\t\\ty1=\\"1747.09\\"\\n\\t\\t\\tx2=\\"203.877\\"\\n\\t\\t\\ty2=\\"-33.3301\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint7_linear\\"\\n\\t\\t\\tx1=\\"877.18\\"\\n\\t\\t\\ty1=\\"1729.5\\"\\n\\t\\t\\tx2=\\"254.153\\"\\n\\t\\t\\ty2=\\"-50.9311\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint8_linear\\"\\n\\t\\t\\tx1=\\"678.557\\"\\n\\t\\t\\ty1=\\"1799.01\\"\\n\\t\\t\\tx2=\\"55.528\\"\\n\\t\\t\\ty2=\\"18.5818\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint9_linear\\"\\n\\t\\t\\tx1=\\"759.073\\"\\n\\t\\t\\ty1=\\"1770.82\\"\\n\\t\\t\\tx2=\\"136.048\\"\\n\\t\\t\\ty2=\\"-9.5978\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint10_linear\\"\\n\\t\\t\\tx1=\\"918.157\\"\\n\\t\\t\\ty1=\\"1715.16\\"\\n\\t\\t\\tx2=\\"295.131\\"\\n\\t\\t\\ty2=\\"-65.2689\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint11_linear\\"\\n\\t\\t\\tx1=\\"885.264\\"\\n\\t\\t\\ty1=\\"1726.67\\"\\n\\t\\t\\tx2=\\"262.241\\"\\n\\t\\t\\ty2=\\"-53.7515\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint12_linear\\"\\n\\t\\t\\tx1=\\"843.209\\"\\n\\t\\t\\ty1=\\"1741.39\\"\\n\\t\\t\\tx2=\\"220.184\\"\\n\\t\\t\\ty2=\\"-39.0322\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint13_linear\\"\\n\\t\\t\\tx1=\\"725.117\\"\\n\\t\\t\\ty1=\\"1782.72\\"\\n\\t\\t\\tx2=\\"102.09\\"\\n\\t\\t\\ty2=\\"2.2924\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint14_linear\\"\\n\\t\\t\\tx1=\\"987.161\\"\\n\\t\\t\\ty1=\\"1691.02\\"\\n\\t\\t\\tx2=\\"364.134\\"\\n\\t\\t\\ty2=\\"-89.4134\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint15_linear\\"\\n\\t\\t\\tx1=\\"871.647\\"\\n\\t\\t\\ty1=\\"1731.44\\"\\n\\t\\t\\tx2=\\"248.622\\"\\n\\t\\t\\ty2=\\"-48.9836\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint16_linear\\"\\n\\t\\t\\tx1=\\"1003.73\\"\\n\\t\\t\\ty1=\\"1685.21\\"\\n\\t\\t\\tx2=\\"380.706\\"\\n\\t\\t\\ty2=\\"-95.2057\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint17_linear\\"\\n\\t\\t\\tx1=\\"919.449\\"\\n\\t\\t\\ty1=\\"1714.72\\"\\n\\t\\t\\tx2=\\"296.421\\"\\n\\t\\t\\ty2=\\"-65.7121\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint18_linear\\"\\n\\t\\t\\tx1=\\"842.49\\"\\n\\t\\t\\ty1=\\"1741.64\\"\\n\\t\\t\\tx2=\\"219.464\\"\\n\\t\\t\\ty2=\\"-38.7804\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint19_linear\\"\\n\\t\\t\\tx1=\\"957.598\\"\\n\\t\\t\\ty1=\\"1701.36\\"\\n\\t\\t\\tx2=\\"334.573\\"\\n\\t\\t\\ty2=\\"-79.0631\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint20_linear\\"\\n\\t\\t\\tx1=\\"1018.69\\"\\n\\t\\t\\ty1=\\"1679.99\\"\\n\\t\\t\\tx2=\\"395.658\\"\\n\\t\\t\\ty2=\\"-100.445\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint21_linear\\"\\n\\t\\t\\tx1=\\"850.122\\"\\n\\t\\t\\ty1=\\"1738.97\\"\\n\\t\\t\\tx2=\\"227.096\\"\\n\\t\\t\\ty2=\\"-41.4558\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint22_linear\\"\\n\\t\\t\\tx1=\\"927.365\\"\\n\\t\\t\\ty1=\\"1711.94\\"\\n\\t\\t\\tx2=\\"304.338\\"\\n\\t\\t\\ty2=\\"-68.4866\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint23_linear\\"\\n\\t\\t\\tx1=\\"985.121\\"\\n\\t\\t\\ty1=\\"1691.73\\"\\n\\t\\t\\tx2=\\"362.094\\"\\n\\t\\t\\ty2=\\"-88.6958\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint24_linear\\"\\n\\t\\t\\tx1=\\"870.437\\"\\n\\t\\t\\ty1=\\"1731.87\\"\\n\\t\\t\\tx2=\\"247.41\\"\\n\\t\\t\\ty2=\\"-48.563\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint25_linear\\"\\n\\t\\t\\tx1=\\"774.838\\"\\n\\t\\t\\ty1=\\"1765.32\\"\\n\\t\\t\\tx2=\\"151.811\\"\\n\\t\\t\\ty2=\\"-15.1114\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint26_linear\\"\\n\\t\\t\\tx1=\\"866.759\\"\\n\\t\\t\\ty1=\\"1733.16\\"\\n\\t\\t\\tx2=\\"243.73\\"\\n\\t\\t\\ty2=\\"-47.2785\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint27_linear\\"\\n\\t\\t\\tx1=\\"676.098\\"\\n\\t\\t\\ty1=\\"1799.87\\"\\n\\t\\t\\tx2=\\"53.0745\\"\\n\\t\\t\\ty2=\\"19.4384\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint28_linear\\"\\n\\t\\t\\tx1=\\"896.405\\"\\n\\t\\t\\ty1=\\"1722.78\\"\\n\\t\\t\\tx2=\\"273.376\\"\\n\\t\\t\\ty2=\\"-57.6513\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint29_linear\\"\\n\\t\\t\\tx1=\\"804.335\\"\\n\\t\\t\\ty1=\\"1754.99\\"\\n\\t\\t\\tx2=\\"181.311\\"\\n\\t\\t\\ty2=\\"-25.4356\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint30_linear\\"\\n\\t\\t\\tx1=\\"913.365\\"\\n\\t\\t\\ty1=\\"1716.84\\"\\n\\t\\t\\tx2=\\"290.34\\"\\n\\t\\t\\ty2=\\"-63.587\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint31_linear\\"\\n\\t\\t\\tx1=\\"996.364\\"\\n\\t\\t\\ty1=\\"1687.79\\"\\n\\t\\t\\tx2=\\"373.339\\"\\n\\t\\t\\ty2=\\"-92.6289\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint32_linear\\"\\n\\t\\t\\tx1=\\"788.634\\"\\n\\t\\t\\ty1=\\"1760.48\\"\\n\\t\\t\\tx2=\\"165.608\\"\\n\\t\\t\\ty2=\\"-19.9395\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint33_linear\\"\\n\\t\\t\\tx1=\\"900.279\\"\\n\\t\\t\\ty1=\\"1721.42\\"\\n\\t\\t\\tx2=\\"277.253\\"\\n\\t\\t\\ty2=\\"-59.0073\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint34_linear\\"\\n\\t\\t\\tx1=\\"705.878\\"\\n\\t\\t\\ty1=\\"1789.43\\"\\n\\t\\t\\tx2=\\"82.8561\\"\\n\\t\\t\\ty2=\\"9.02123\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint35_linear\\"\\n\\t\\t\\tx1=\\"756.065\\"\\n\\t\\t\\ty1=\\"1771.87\\"\\n\\t\\t\\tx2=\\"133.042\\"\\n\\t\\t\\ty2=\\"-8.5436\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint36_linear\\"\\n\\t\\t\\tx1=\\"987.063\\"\\n\\t\\t\\ty1=\\"1691.04\\"\\n\\t\\t\\tx2=\\"364.041\\"\\n\\t\\t\\ty2=\\"-89.3766\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint37_linear\\"\\n\\t\\t\\tx1=\\"857.316\\"\\n\\t\\t\\ty1=\\"1736.44\\"\\n\\t\\t\\tx2=\\"234.296\\"\\n\\t\\t\\ty2=\\"-43.9718\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint38_linear\\"\\n\\t\\t\\tx1=\\"1017.91\\"\\n\\t\\t\\ty1=\\"1680.26\\"\\n\\t\\t\\tx2=\\"394.887\\"\\n\\t\\t\\ty2=\\"-100.175\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint39_linear\\"\\n\\t\\t\\tx1=\\"711.409\\"\\n\\t\\t\\ty1=\\"1787.5\\"\\n\\t\\t\\tx2=\\"88.3875\\"\\n\\t\\t\\ty2=\\"7.08408\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint40_linear\\"\\n\\t\\t\\tx1=\\"749.518\\"\\n\\t\\t\\ty1=\\"1774.18\\"\\n\\t\\t\\tx2=\\"126.489\\"\\n\\t\\t\\ty2=\\"-6.25297\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint41_linear\\"\\n\\t\\t\\tx1=\\"763.1\\"\\n\\t\\t\\ty1=\\"1769.42\\"\\n\\t\\t\\tx2=\\"140.075\\"\\n\\t\\t\\ty2=\\"-11.0036\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint42_linear\\"\\n\\t\\t\\tx1=\\"953.685\\"\\n\\t\\t\\ty1=\\"1702.71\\"\\n\\t\\t\\tx2=\\"330.665\\"\\n\\t\\t\\ty2=\\"-77.697\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint43_linear\\"\\n\\t\\t\\tx1=\\"781.626\\"\\n\\t\\t\\ty1=\\"1762.95\\"\\n\\t\\t\\tx2=\\"158.597\\"\\n\\t\\t\\ty2=\\"-17.4867\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint44_linear\\"\\n\\t\\t\\tx1=\\"862.217\\"\\n\\t\\t\\ty1=\\"1734.74\\"\\n\\t\\t\\tx2=\\"239.192\\"\\n\\t\\t\\ty2=\\"-45.6902\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint45_linear\\"\\n\\t\\t\\tx1=\\"708.797\\"\\n\\t\\t\\ty1=\\"1788.4\\"\\n\\t\\t\\tx2=\\"85.7818\\"\\n\\t\\t\\ty2=\\"7.99883\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint46_linear\\"\\n\\t\\t\\tx1=\\"828.178\\"\\n\\t\\t\\ty1=\\"1746.65\\"\\n\\t\\t\\tx2=\\"205.153\\"\\n\\t\\t\\ty2=\\"-33.7786\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint47_linear\\"\\n\\t\\t\\tx1=\\"778.175\\"\\n\\t\\t\\ty1=\\"1764.13\\"\\n\\t\\t\\tx2=\\"155.157\\"\\n\\t\\t\\ty2=\\"-16.2773\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint48_linear\\"\\n\\t\\t\\tx1=\\"708.61\\"\\n\\t\\t\\ty1=\\"1789.19\\"\\n\\t\\t\\tx2=\\"85.5847\\"\\n\\t\\t\\ty2=\\"8.76404\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t\\t<linearGradient\\n\\t\\t\\tid=\\"paint49_linear\\"\\n\\t\\t\\tx1=\\"1008.75\\"\\n\\t\\t\\ty1=\\"1684.16\\"\\n\\t\\t\\tx2=\\"385.726\\"\\n\\t\\t\\ty2=\\"-96.2663\\"\\n\\t\\t\\tgradientUnits=\\"userSpaceOnUse\\"\\n\\t\\t>\\n\\t\\t\\t<stop stop-color=\\"#E7C16D\\" />\\n\\t\\t\\t<stop offset=\\"0.2398\\" stop-color=\\"#B8822C\\" />\\n\\t\\t\\t<stop offset=\\"0.5153\\" stop-color=\\"#7E5923\\" />\\n\\t\\t\\t<stop offset=\\"0.8571\\" stop-color=\\"#E7C16D\\" />\\n\\t\\t</linearGradient>\\n\\t</defs>\\n</svg>\\n\\n<style lang=\\"scss\\">svg {\\n  width: 35%;\\n  position: absolute;\\n  bottom: 0;\\n  right: 6%;\\n}\\n@media only screen and (max-width: 1280px) {\\n  svg {\\n    width: auto;\\n    height: 45%;\\n    right: 30%;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  svg {\\n    height: 40%;\\n    right: 25%;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  svg {\\n    height: 40%;\\n    right: 25%;\\n  }\\n}\\n\\n.back {\\n  opacity: 0.3;\\n}</style>\\n"],"names":[],"mappings":"AAy1BmB,GAAG,eAAC,CAAC,AACtB,KAAK,CAAE,GAAG,CACV,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,EAAE,AACX,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,GAAG,eAAC,CAAC,AACH,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,GAAG,eAAC,CAAC,AACH,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,GAAG,eAAC,CAAC,AACH,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC,AAED,KAAK,eAAC,CAAC,AACL,OAAO,CAAE,GAAG,AACd,CAAC"}`
};
var Flower = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css$a);
  return `<svg class="${escape(null_to_empty(type)) + " svelte-1b8qfn3"}" viewBox="${"0 0 771 981"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M584.95 885.022C591.169 913.775 596.156 943.032 597.306 972.639L596.5 977.5L595.153 980C595.03 976.872 594.882 973.742 594.706 970.606C593.315 949.611 590.043 928.611 586.409 907.537C575.784 848.516 559.509 791.362 531.135 738.155C522.709 722.136 515.081 705.901 507.091 689.593C504.427 684.157 502.052 679.156 499.751 673.794C486.727 645.167 475.659 616.184 466.331 586.047C458.797 561.923 453.291 537.081 449.305 512.17C446.179 490.447 443.2 468 440.148 445.915C438.732 434.329 436.88 423.033 435.464 411.447C435.249 410.651 435.758 410.001 435.905 409.277C436.843 410.221 437.058 411.018 437.273 411.814C440.755 435.493 445.034 458.957 447.793 482.489C452.398 519.2 459.32 555.627 470.662 590.691C475.758 606.412 481.216 622.207 487.183 637.351C494.874 656.988 503.289 676.771 513.445 695.401C518.845 705.911 523.448 716.637 528.487 727.074C538.49 748.309 548.929 769.256 558.062 791.068C570.792 821.142 578.233 853.155 584.95 885.022Z"}" fill="${"url(#paint0_linear)"}"></path><path d="${"M438.047 429.701C438.702 428.327 439.358 426.954 439.143 426.157C437.58 415.295 442.093 406.042 446.244 396.716C451.05 386.016 455.857 375.317 460.951 365.052C466.119 354.426 469.841 343.506 472.188 331.931C475.191 318.983 479.568 306.69 484.306 294.47C489.919 279.792 495.821 265.548 501.796 250.943C503.835 246.461 506.236 242.052 507.913 237.496C518.7 210.31 536.857 187.631 554.003 164.37C559.669 156.858 565.262 149.707 570.278 141.686C573.041 137.351 574.791 132.433 576.83 127.951C576.977 127.228 577.412 126.939 577.559 126.216C577.711 123.61 578.659 120.79 575.986 119.118C573.674 117.519 571.21 118.526 569.396 120.041C567.074 122.206 564.39 124.298 562.791 126.61C552.109 142.143 538.973 154.919 525.763 168.057C518.797 174.553 512.119 181.483 505.729 188.849C494.622 200.907 485.9 214.202 480.139 229.603C479.411 231.339 478.756 232.712 477.304 234.301C477.177 227.496 477.051 220.692 477.287 213.961C477.553 195.938 477.531 177.481 477.797 159.458C478.268 145.996 479.1 132.607 479.571 119.145C479.749 107.13 480 94.7534 479.454 82.5915C479.249 78.0308 478.032 72.8883 476.669 68.4693C472.789 57.8908 461.576 55.6164 453.519 63.7738C450.689 66.589 448.146 69.8393 446.328 73.2364C438.476 85.9545 429.035 97.2205 418.583 107.905C411.035 115.412 404.136 123.428 396.803 131.732C396.373 130.138 395.87 128.906 395.44 127.313C392.572 117.316 388.037 108.111 380.891 100.636C373.095 92.653 363.628 87.3433 353.143 83.3337C345.767 80.7078 338.098 79.5288 330.135 79.7967C320.652 80.1328 313.114 83.8762 308.098 91.8971C305.335 96.2326 302.861 101.003 299.737 105.265C293.851 113.863 287.676 122.025 281.789 130.623C274.886 140.521 267.621 150.345 263.03 161.841C261.945 161.621 261.51 161.91 260.786 161.763C245.311 156.364 230.612 158.279 216.044 165.116C211.117 167.129 206.766 170.012 202.127 172.461C196.617 175.486 191.035 178.873 185.237 181.463C173.715 186.281 165.947 194.873 160.705 205.861C154.3 218.873 153.394 232.623 155.093 246.525C156.856 263.83 161.879 279.912 169.654 295.424C161.43 311.832 150.606 326.207 132.925 333.542C126.765 336.059 120.459 339.299 114.153 342.539C110.311 344.772 106.756 347.441 104.429 351.488C101.808 356.982 103.533 361.474 109.247 363.01C115.323 364.619 121.472 365.866 127.768 366.39C150.708 368.407 174.083 370.135 196.798 375.119C210.108 378.195 223.272 381.995 236.435 385.795C247.428 389.154 258.783 392.587 269.629 396.67C281.922 401.046 294.142 405.785 306.362 410.523C323.934 416.723 341.213 424.37 359.734 427.75C372.106 429.883 384.194 429.699 396.146 426.474C404.476 424.398 412.806 422.321 421.492 422.2C427.138 422.215 432.055 423.966 436.605 427.525C436.747 428.684 437.035 429.119 438.047 429.701ZM285.577 254.915C292.015 256.597 297.44 257.698 302.793 259.16C314.436 263.028 325.932 267.619 336.7 273.946C343.133 277.51 349.057 281.725 354.907 286.301C359.169 289.425 361.329 293.629 362.472 299.133C366.038 318.686 372.068 337.233 380.053 355.422C388.473 373.324 398.634 390.072 414.089 402.998C416.039 404.524 416.757 406.552 415.882 409.011C414.493 414.002 411.081 417.829 406.515 419.915C393.106 426.611 379.057 429.033 364.006 427.11C347.509 424.894 331.745 419.061 316.417 412.939C304.197 408.201 291.977 403.462 279.684 399.086C267.029 394.636 254.736 390.26 242.007 386.172C231.376 382.886 221.106 379.673 210.328 377.11C199.188 374.474 187.975 372.199 176.327 370.213C166.487 368.594 156.863 367.772 146.876 366.876C136.89 365.98 126.903 365.085 116.99 363.827C114.023 363.602 110.914 362.218 107.732 361.196C104.624 359.812 104.194 358.219 104.854 354.963C105.514 351.708 107.978 350.701 110.73 350.13C118.116 348.992 125.938 347.565 133.324 346.427C145.344 344.723 156.573 341.351 167.23 335.228C180.062 327.662 191.091 317.848 200.605 306.221C206.559 299.143 212.226 291.631 218.18 284.553C225.514 276.249 232.847 267.945 241.695 261.455C249.6 255.903 258.15 252.741 267.56 252.767C274.652 253.076 280.44 254.249 285.577 254.915ZM363.112 223.567C364.354 219.3 365.822 212.065 368.374 205.051C373.914 190.734 382.49 178.163 393.089 166.755C405.575 153.471 417.772 139.751 429.608 125.958C440.427 113.465 447.199 98.6452 450.139 82.2946C451.02 77.9541 453.059 73.4718 454.301 69.2046C456.051 64.2873 459.82 62.4156 464.743 62.2843C469.303 62.0795 472.407 65.3452 473.844 69.4026C475.354 73.0982 477.005 77.9524 477.21 82.5131C477.541 93.8781 477.872 105.243 477.479 116.461C476.998 133.687 475.359 151.055 475.313 167.992C474.56 205.123 474.966 242.112 474.287 278.88C474.11 290.895 472.774 303.052 472.234 314.994C471.852 322.448 469.588 329.898 467.759 337.059C463.802 354.709 456.087 370.468 445.624 384.916C442.427 389.54 438.144 393.944 434.009 397.624C427.624 403.108 417.706 403.732 409.91 395.749C401.753 387.692 394.901 378.77 389.427 368.622C375.308 343.539 367.275 316.301 362.43 288.203C359.011 267.926 358.344 247.078 363.112 223.567ZM359.971 287.328C355.421 283.769 351.159 280.645 347.185 277.956C327.893 265.381 306.924 257.362 284.644 252.089C279.653 250.701 276.33 248.52 273.808 244.243C265.592 230.902 261.796 216.198 260.028 200.775C259.252 193.462 259.273 185.935 260.813 178.339C262.726 167.052 267.097 156.641 273.566 147.031C285.123 129.04 298.993 112.646 309.901 94.1459C313.974 87.0634 320.715 83.535 329.113 82.9788C338.234 82.5693 346.627 83.895 354.941 87.4644C364.703 91.3273 373.809 96.5636 380.446 104.689C388.383 113.83 392.625 124.482 394.764 136.214C363.66 181.876 352.665 232.369 359.971 287.328ZM261.499 165.673C253.166 195.617 258.955 222.777 274.301 249.238C272.057 249.16 270.175 249.155 268.293 249.15C261.201 248.841 254.255 247.809 247.377 248.297C216.176 249.876 190.086 261.532 173.433 289.788C172.852 290.8 171.835 292.1 170.818 293.4C169.953 292.095 169.449 290.863 168.873 289.993C163.766 278.036 159.456 265.864 157.537 253.047C156.257 244.502 155.701 236.104 156.665 227.638C157.776 218.448 160.622 209.987 165.276 201.893C168.767 195.822 173.196 190.695 179.502 187.455C190.883 181.478 201.901 175.428 213.282 169.451C224.227 163.762 235.744 160.826 247.901 162.162C252.388 162.319 257.237 162.549 261.499 165.673ZM259.602 251.153C259.167 251.441 258.732 251.729 258.37 251.656C246.491 254.519 237.208 261.298 229.078 269.817C221.891 277.398 215.355 285.487 208.53 293.141C203.084 299.568 197.999 306.069 192.265 312.061C174.988 330.399 154.471 342.431 128.842 344.388C124.208 344.955 119.862 345.956 115.228 346.523C114.431 346.738 113.272 346.879 112.187 346.659C114.871 344.567 117.482 342.837 120.381 341.542C125.381 339.167 130.309 337.154 135.31 334.779C146.979 329.237 156.556 321.012 163.317 309.955C167.825 302.585 172.259 295.575 176.767 288.205C181.128 281.557 185.851 274.983 192.162 269.861C211.605 253.845 234.78 249.131 259.602 251.153ZM476.229 310.155C476.353 290.974 476.693 272.59 476.671 254.132C476.706 240.958 480.936 229.388 489.721 219.496C499.959 208.015 512.073 198.421 523.825 188.753C538.261 176.994 549.3 163.416 555.501 145.844C558.127 138.468 562.199 131.386 567.211 125.247C569.171 123.008 571.131 120.77 574.749 121.503C576.405 124.476 575.457 127.296 574.22 129.681C571.672 134.813 569.198 139.584 566.001 144.208C559.606 153.455 552.561 162.195 545.878 171.007C532.873 188.706 519.868 206.404 510.187 226.283C499.778 247.897 491.103 270.24 482.502 292.221C480.532 298.224 478.634 303.864 476.229 310.155ZM449.295 73.4616C449.363 74.9818 449.29 75.3436 449.216 75.7053C446.13 92.7793 440.008 108.108 429.33 121.759C418.071 136.422 405.512 150.069 392.664 163.28C384.099 172.087 376.907 181.55 371.304 192.464C370.14 194.488 368.977 196.511 367.813 198.535C367.451 198.462 367.09 198.388 366.801 197.953C370.156 188.842 373.148 179.658 376.864 170.62C386.771 147.774 400.724 127.255 418.94 109.86C429.318 99.5376 439.047 88.7066 446.464 76.2769C447.261 76.0619 448.131 75.4852 449.295 73.4616ZM489.008 215.585C489.008 215.585 489.155 214.862 489.228 214.5C490.465 212.115 491.991 210.165 493.228 207.779C502.243 193.038 515.374 182.144 526.555 169.724C534.685 161.205 543.177 152.759 551.307 144.24C551.815 143.59 552.612 143.375 553.991 142.148C553.116 144.607 552.46 145.981 551.805 147.354C546.847 160.659 539.288 171.93 528.045 180.948C524.417 183.978 521.078 187.443 517.451 190.473C508.162 199.134 498.585 207.36 489.008 215.585Z"}" fill="${"url(#paint1_linear)"}"></path><path d="${"M418.267 410.248C417.182 410.028 415.809 409.373 414.65 409.514C390.478 408.001 369.514 398.1 349.499 385.378C337.142 377.6 324.933 369.098 312.65 360.957C303.402 354.562 294.154 348.168 284.76 342.496C291.622 347.654 298.338 353.535 305.274 358.331C317.483 366.833 330.055 375.409 342.338 383.549C354.259 391.616 366.4 398.598 379.705 403.556C391.563 408.221 403.788 411.077 416.527 411.401C416.889 411.475 417.324 411.186 417.685 411.26C418.12 410.971 418.194 410.61 418.267 410.248Z"}" fill="${"url(#paint2_linear)"}"></path><path d="${"M393.384 191.294C393.295 197.301 393.28 202.947 393.191 208.955C393.517 222.202 393.119 235.302 394.315 247.972C395.512 260.643 397.358 273.821 400.147 286.062C405.155 307.79 411.395 329.016 417.272 350.167C417.487 350.964 418.064 351.834 419.003 352.778C418.573 351.184 418.504 349.664 418.001 348.432C412.343 326.195 406.324 303.885 401.028 281.721C395.947 260.354 394.776 238.274 395.126 216.126C395.293 207.875 394.737 199.477 394.469 191.514C394.181 191.079 393.819 191.006 393.384 191.294Z"}" fill="${"url(#paint3_linear)"}"></path><path d="${"M359.418 410.739C365.783 412.783 372 415.551 378.076 417.16C384.513 418.842 390.736 419.728 397.1 421.772C388.917 423.125 381.321 421.584 373.363 419.97C351.66 415.568 331.414 407.695 311.897 398.088C311.247 397.579 310.524 397.433 309.292 397.936C317.171 401.794 325.05 405.651 332.568 409.436C346.738 415.699 361.636 420.228 376.828 423.309C380.807 424.116 384.86 424.561 388.624 424.572C393.111 424.729 397.31 424.45 402.594 424.392C402.091 423.161 401.441 422.652 401.226 421.855C402.384 421.714 403.904 421.645 405.063 421.504C405.136 421.142 405.21 420.78 405.21 420.78C400.072 420.115 394.935 419.45 390.232 418.496C384.807 417.395 379.816 416.006 374.464 414.544C369.473 413.155 364.482 411.766 359.13 410.304C359.492 410.378 359.492 410.378 359.418 410.739Z"}" fill="${"url(#paint4_linear)"}"></path><path d="${"M457.158 242.642C458.281 255.674 459.765 268.78 460.815 282.173C461.859 297.449 461.745 312.866 460.183 327.99C458.25 346.804 453.785 365.105 444.403 381.655C444.329 382.017 444.183 382.741 444.833 383.249C448.182 376.02 451.82 369.226 454.445 361.85C462.837 337.19 464.208 311.86 462.613 286.304C461.637 272.549 459.503 258.935 457.803 245.033C457.95 244.309 457.735 243.512 457.158 242.642Z"}" fill="${"url(#paint5_linear)"}"></path><path d="${"M309.979 251.579C309.114 250.274 308.611 249.042 307.673 248.099C297.942 232.944 289.879 216.998 282.612 200.837C276.352 187.139 272.555 172.435 271.438 157.521C271.155 155.204 271.16 153.322 270.877 151.005C269.346 154.837 269.336 158.601 269.687 162.438C271.743 178.296 275.54 193 282.811 207.279C289.795 221.123 296.27 235.618 305.791 248.093C307.017 249.472 307.882 250.777 308.674 252.444C309.183 251.794 309.544 251.868 309.979 251.579Z"}" fill="${"url(#paint6_linear)"}"></path><path d="${"M417.784 401.488C417.208 400.618 416.993 399.821 416.343 399.313C404.437 385.6 397.17 369.439 392.079 351.836C387.632 336.624 383.909 321.558 379.825 306.419C379.395 304.825 378.892 303.593 378.026 302.288C379.385 308.589 380.308 315.178 382.101 321.191C386.18 338.212 390.622 355.307 397.092 371.683C401.045 381.899 406.812 390.601 413.811 398.799C414.676 400.105 415.976 401.122 417.276 402.138C417.276 402.138 417.711 401.85 417.784 401.488Z"}" fill="${"url(#paint7_linear)"}"></path><path d="${"M121.23 348.493C123.112 348.499 125.356 348.577 127.238 348.582C136.359 348.173 145.26 348.848 154.377 350.321C163.131 351.72 171.959 352.757 180.205 354.806C192.792 357.736 205.667 361.101 218.254 364.03C221.147 364.617 224.041 365.204 226.573 365.718C204.084 357.767 180.645 352.636 156.987 348.591C147.509 347.045 137.738 346.946 128.04 346.485C125.796 346.407 123.406 347.052 120.654 347.623C121.015 347.697 121.304 348.132 121.23 348.493Z"}" fill="${"url(#paint8_linear)"}"></path><path d="${"M193.308 221.512C200.678 226.02 207.614 230.816 214.985 235.324C222.067 239.397 229.512 243.543 236.956 247.689C226.031 245.85 216.783 239.455 206.084 234.649C212.584 239.733 219.09 242.936 225.669 245.776C228.054 247.013 230.948 247.6 233.333 248.837C235.719 250.074 238.036 249.791 239.923 247.914C243.467 249.01 246.722 249.67 250.266 250.765C250.339 250.404 250.486 249.68 250.921 249.392C230.308 243.328 212.316 231.77 194.686 220.286C193.816 220.862 193.743 221.224 193.308 221.512Z"}" fill="${"url(#paint9_linear)"}"></path><path d="${"M452.874 300.899C454.009 336.153 447.474 370.227 428.426 401.011C429.37 400.072 429.878 399.422 430.822 398.484C436.996 390.321 441.509 381.069 444.649 371.161C447.5 360.818 450.713 350.548 452.84 340.058C455.408 327.398 455.444 314.224 453.959 301.119C454.033 300.757 453.671 300.684 453.745 300.322C453.021 300.176 452.948 300.537 452.874 300.899Z"}" fill="${"url(#paint10_linear)"}"></path><path d="${"M335.695 137.791C338.71 147.064 341.725 156.337 345.175 165.322C350.423 178.438 351.761 192.266 353.172 205.734C354.588 217.319 355.208 229.119 356.55 241.066C356.555 239.184 356.487 237.663 356.492 235.782C355.463 214.86 354.796 194.012 349.495 173.73C346.779 161.128 342.034 149.244 335.695 137.791Z"}" fill="${"url(#paint11_linear)"}"></path><path d="${"M304.429 269.66C327.338 282.968 350.247 296.277 367.417 317.459C367.852 317.171 367.852 317.171 368.287 316.883C367.71 316.012 367.569 314.854 366.919 314.345C361.938 309.193 357.105 303.317 351.254 298.74C337.823 286.978 322.646 278.251 306.526 270.462C306.311 269.665 305.152 269.807 304.429 269.66Z"}" fill="${"url(#paint12_linear)"}"></path><path d="${"M182.604 324.412C209.513 331 233.507 344.528 258.665 356.033C255.991 354.361 253.606 353.124 250.933 351.452C248.259 349.78 245.874 348.543 243.127 347.233C229.392 340.681 216.018 334.202 202.137 328.374C196.931 326.188 191.505 325.088 186.153 323.625C185.068 323.405 183.909 323.547 183.186 323.4C182.316 323.977 182.604 324.412 182.604 324.412Z"}" fill="${"url(#paint13_linear)"}"></path><path d="${"M462.589 162.022C463.299 193.8 471.033 224.367 474.495 255.574C474.857 255.647 475.292 255.359 475.654 255.432C474.306 245.367 473.031 234.94 471.684 224.876C470.047 214.376 468.411 203.876 466.775 193.376C465.139 182.876 463.864 172.449 462.589 162.022Z"}" fill="${"url(#paint14_linear)"}"></path><path d="${"M358.618 279.145C351.451 253.212 345.515 226.776 340.737 200.199C340.449 199.763 340.161 199.328 339.872 198.893C343.706 226.409 349.207 253.134 358.618 279.145Z"}" fill="${"url(#paint15_linear)"}"></path><path d="${"M485.265 287.886C489.935 274.146 494.678 260.044 499.348 246.304C504.018 232.564 509.338 219.332 516.105 206.394C500.401 231.83 493.158 260.112 485.265 287.886Z"}" fill="${"url(#paint16_linear)"}"></path><path d="${"M339.975 81.4159C341.123 85.0382 344.52 86.857 346.612 89.5408C348.704 92.2247 350.795 94.9086 352.526 97.5191C354.617 100.203 356.636 103.249 358.293 106.221C360.023 108.831 362.041 111.877 363.698 114.849C365.355 117.821 366.938 121.155 368.595 124.127C369.89 127.026 371.473 130.36 372.695 133.621C373.375 122.837 350.024 85.7138 339.975 81.4159Z"}" fill="${"url(#paint17_linear)"}"></path><path d="${"M300.73 219.199C305.753 235.282 314.619 249.131 324.716 262.477C327.961 266.901 331.641 271.037 337.135 273.658C337.282 272.934 337.429 272.211 337.067 272.137C324.213 261.245 316.217 246.819 307.787 232.681C305.265 228.404 303.178 223.838 300.73 219.199Z"}" fill="${"url(#paint18_linear)"}"></path><path d="${"M420.356 201.284C420.779 178.774 418.523 156.474 421.264 133.681C419.303 135.919 418.355 138.739 418.271 142.865C417.496 161.538 418.53 180.577 419.711 198.893C419.926 199.69 420.141 200.487 420.356 201.284Z"}" fill="${"url(#paint19_linear)"}"></path><path d="${"M465.224 124.897C468.442 112.745 466.101 68.5853 460.911 60.7538C460.748 67.123 462.762 72.0506 462.82 77.3347C463.239 82.6922 463.733 87.6879 464.152 93.0454C464.572 98.4029 464.63 103.687 464.976 109.406C465.108 114.329 465.166 119.613 465.224 124.897Z"}" fill="${"url(#paint20_linear)"}"></path><path d="${"M382.36 358.903C369.888 340.556 353.568 326.325 335.869 313.32C351.681 328.202 368.436 342.145 382.36 358.903Z"}" fill="${"url(#paint21_linear)"}"></path><path d="${"M430.381 320.816C430.741 294.903 426.908 267.387 422.712 239.798C425.314 267.817 427.989 295.475 430.381 320.816Z"}" fill="${"url(#paint22_linear)"}"></path><path d="${"M495.395 236.087C486.217 257.198 484.2 280.138 479.651 302.564C482.287 291.424 484.85 280.646 487.486 269.506C489.761 258.293 492.397 247.153 495.395 236.087Z"}" fill="${"url(#paint23_linear)"}"></path><path d="${"M404.857 390.958C393.753 375.148 387.649 356.963 380.75 338.993C380.891 340.152 381.321 341.746 381.463 342.904C385.191 356.088 389.789 368.695 396.343 380.946C397.638 383.845 399.729 386.528 401.459 389.139C402.398 390.082 403.336 391.026 404.275 391.97C404.348 391.608 404.421 391.246 404.857 390.958Z"}" fill="${"url(#paint24_linear)"}"></path><path d="${"M232.847 267.945C248.532 276.022 263.709 284.75 278.23 294.85C264.799 283.088 249.769 273.637 232.847 267.945Z"}" fill="${"url(#paint25_linear)"}"></path><path d="${"M311.121 151.259C307.398 136.194 303.963 121.563 300.529 106.932C298.416 111.776 305.212 141.399 311.121 151.259Z"}" fill="${"url(#paint26_linear)"}"></path><path d="${"M145.926 343.711C160.83 346.357 176.095 349.077 189.913 351.503C179.502 347.132 153.747 342.284 145.926 343.711Z"}" fill="${"url(#paint27_linear)"}"></path><path d="${"M353.217 162.81C346.165 147.446 342.374 130.86 333.293 116.214C332.717 115.344 332.575 114.185 331.998 113.315C331.563 113.603 331.201 113.53 331.128 113.892C334.725 122.153 338.757 130.126 342.353 138.388C345.95 146.649 349.111 155.199 352.346 163.387C352.42 163.025 352.855 162.737 353.217 162.81Z"}" fill="${"url(#paint28_linear)"}"></path><path d="${"M335.332 351.247C334.032 350.23 332.805 348.852 331.505 347.835C315.033 336.209 297.325 326.968 280.198 316.715C279.836 316.642 279.474 316.569 278.316 316.71C282.725 319.111 286.41 321.365 290.457 323.692C304.91 332.273 319.872 340.203 333.235 350.445C333.959 350.592 334.682 350.739 335.332 351.247Z"}" fill="${"url(#paint29_linear)"}"></path><path d="${"M360.144 117.518C352.432 105.409 346.025 92.4346 336.064 82.1291C335.556 82.7792 335.194 82.7058 335.121 83.0675L335.047 83.4292C334.974 83.791 335.262 84.226 335.262 84.226C343.918 95.3966 351.85 106.42 360.144 117.518Z"}" fill="${"url(#paint30_linear)"}"></path><path d="${"M492.704 214.075C488.783 218.552 482.426 240.612 481.887 252.554C485.54 240.114 489.193 227.674 492.704 214.075Z"}" fill="${"url(#paint31_linear)"}"></path><path d="${"M223.21 165.063C226.026 167.893 228.841 170.724 231.583 173.916C234.325 177.109 237.067 180.301 239.447 183.42C242.189 186.612 244.495 190.093 247.164 193.647C244.584 184.085 229.795 166.022 223.21 165.063Z"}" fill="${"url(#paint32_linear)"}"></path><path d="${"M391.186 254.116C392.225 271.274 395.943 288.222 400.458 304.955C397.102 288.08 394.181 270.917 391.186 254.116Z"}" fill="${"url(#paint33_linear)"}"></path><path d="${"M155.245 243.92C156.897 248.774 171.13 258.44 180.823 260.783C171.864 254.823 163.555 249.371 155.245 243.92Z"}" fill="${"url(#paint34_linear)"}"></path><path d="${"M189.725 181.62C198.322 187.506 207.208 193.828 215.806 199.714C208.298 192.166 199.774 185.918 190.38 180.246C190.233 180.97 190.16 181.331 189.725 181.62Z"}" fill="${"url(#paint35_linear)"}"></path><path d="${"M438.469 141.689C438.715 131.195 439.395 120.411 439.641 109.916C436.79 120.259 437.629 130.974 438.469 141.689Z"}" fill="${"url(#paint36_linear)"}"></path><path d="${"M354.742 320.537C361.887 328.012 368.96 335.849 376.105 343.324C376.54 343.035 376.614 342.674 376.975 342.747C370.773 334.334 363.193 327.147 354.742 320.537Z"}" fill="${"url(#paint37_linear)"}"></path><path d="${"M458.433 93.3918C458.967 83.332 458.993 73.9223 456.34 64.7224C455.978 64.649 455.543 64.9374 455.181 64.864C456.314 74.1321 457.373 83.762 458.433 93.3918Z"}" fill="${"url(#paint38_linear)"}"></path><path d="${"M189.415 268.551C181.824 265.128 174.595 261.779 167.004 258.356C171.046 262.565 176.252 264.751 181.023 267.225C183.046 268.389 185.578 268.902 187.748 269.342C188.037 269.778 188.545 269.128 189.415 268.551Z"}" fill="${"url(#paint39_linear)"}"></path><path d="${"M264.175 353.008C254.639 346.178 244.667 339.637 233.606 334.757C244.012 341.01 254.13 346.828 264.175 353.008Z"}" fill="${"url(#paint40_linear)"}"></path><path d="${"M252.564 283.995C245.481 279.923 238.037 275.777 230.955 271.704C230.881 272.066 230.446 272.354 230.299 273.077C233.55 275.62 237.382 277.15 240.779 278.969C244.538 280.861 248.223 283.115 251.982 285.007C252.417 284.719 252.49 284.357 252.564 283.995Z"}" fill="${"url(#paint41_linear)"}"></path><path d="${"M412.253 146.54C410.497 153.339 410.623 160.144 411.908 166.806C412.505 160.149 412.814 153.056 413.411 146.398C412.976 146.687 412.614 146.613 412.253 146.54Z"}" fill="${"url(#paint42_linear)"}"></path><path d="${"M218.068 166.279C222.545 170.2 227.31 174.556 231.787 178.477C228.401 172.894 223.997 168.611 219.085 164.979C219.011 165.341 218.503 165.991 218.068 166.279Z"}" fill="${"url(#paint43_linear)"}"></path><path d="${"M295.659 114.23C295.932 120.311 297.725 126.323 299.157 132.263C299.519 132.336 299.954 132.048 299.954 132.048C298.884 126.182 297.526 119.881 296.456 114.015C296.456 114.015 296.094 113.941 295.659 114.23Z"}" fill="${"url(#paint44_linear)"}"></path><path d="${"M174.276 272.635C177.097 273.584 180.206 274.968 183.026 275.916C183.099 275.555 183.173 275.193 183.681 274.543C180.499 273.521 177.752 272.211 174.57 271.189C174.423 271.912 174.35 272.274 174.276 272.635Z"}" fill="${"url(#paint45_linear)"}"></path><path d="${"M335.767 350.959C339.306 353.936 342.844 356.914 346.383 359.891C346.457 359.529 346.892 359.241 346.965 358.879C342.991 356.19 339.379 353.575 335.767 350.959Z"}" fill="${"url(#paint46_linear)"}"></path><path d="${"M274.127 313.224C271.453 311.552 268.706 310.242 266.033 308.57C265.959 308.932 265.959 308.932 265.524 309.22C268.198 310.892 270.945 312.202 273.618 313.875C273.692 313.513 274.054 313.586 274.127 313.224Z"}" fill="${"url(#paint47_linear)"}"></path><path d="${"M509.838 690.904C508.899 689.96 508.323 689.09 507.384 688.146C497.859 677.553 488.259 667.32 479.095 656.8C468.343 644.828 457.517 633.217 448.07 620.379C440.138 609.355 432.132 598.693 423.618 588.681C415.393 579.104 406.37 569.742 396.331 561.681C384.126 551.297 370.03 544.671 354.549 541.155C335.163 536.47 315.62 536.272 296.067 539.838C271.445 544.258 246.896 548.317 222.489 553.535C210.322 555.963 198.732 559.261 186.995 563.283C171.562 568.814 156.344 575.142 141.2 581.109C129.316 585.854 119.378 594.006 109.512 601.797C109.077 602.085 109.004 602.447 108.349 603.82C110.304 603.464 111.751 603.757 112.983 603.254C134.135 597.376 155.36 591.136 176.8 585.694C191.142 581.824 206.061 578.824 220.477 574.593C230.909 571.437 241.917 569.15 252.706 567.949C265.811 566.465 278.911 566.862 291.933 569.503C303.87 571.925 316.241 574.057 328.105 576.84C350.311 582.474 371.642 590.567 391.589 601.768C417.607 616.46 442.97 632.526 466.661 651.265C480.6 662.378 492.653 675.367 504.706 688.356C505.932 689.735 507.232 690.752 508.821 692.204C508.894 691.842 509.403 691.192 509.838 690.904ZM461.549 641.19C461.114 641.478 461.114 641.478 460.679 641.767C459.379 640.75 458.44 639.806 457.14 638.789C446.236 629.422 435.258 620.417 424.354 611.05C420.165 607.564 415.829 604.802 411.494 602.039C386.425 584.527 359.678 571.57 330.169 562.948C315.197 558.782 299.423 556.712 283.571 556.886C280.966 556.734 278.722 556.656 276.117 556.504C277.134 555.204 278.004 554.627 278.8 554.412C286.989 551.177 295.177 547.942 303.653 545.142C317.781 540.476 331.756 538.415 346.586 541.423C363.587 544.871 379.424 550.343 392.567 561.67C411.272 577.139 427.147 595.423 441.281 614.86C447.195 622.838 452.82 630.381 458.807 637.998C460.107 639.014 460.61 640.246 461.549 641.19ZM133.128 594.912C133.201 594.551 132.84 594.477 132.913 594.115C132.986 593.754 133.421 593.465 133.421 593.465C135.088 592.674 136.755 591.882 138.422 591.09C157.409 582.89 177.476 576.792 197.181 570.621C206.816 567.68 216.807 566.693 226.799 565.707C236.717 565.083 246.782 563.735 256.705 561.228C262.209 560.085 268.075 559.015 273.794 558.669C295.801 557.86 317.436 560.742 338.625 567.676C356.994 573.662 374.2 581.671 390.75 591.053C405.565 599.707 419.436 609.299 432.579 620.627C435.756 623.531 439.442 625.785 442.618 628.688C443.63 629.27 444.207 630.14 444.784 631.011C442.975 630.644 441.602 629.989 440.301 628.972C429.68 621.922 419.494 614.583 408.726 608.257C386.179 595.022 362.829 583.883 337.514 576.866C320.372 572.259 302.868 567.579 285.139 565.866C273.344 564.603 261.764 564.137 250.179 565.554C238.159 567.258 225.992 569.686 214.328 573.346C195.493 578.941 176.082 583.665 157.032 588.463C149.064 590.613 141.096 592.762 133.128 594.912ZM308.444 540.089C308.371 540.45 308.659 540.885 308.586 541.247C293.588 546.49 278.517 552.095 263.231 556.903C251.568 560.563 239.474 562.629 226.877 563.464C218.118 563.946 209.285 564.791 200.74 566.071C198.061 566.28 195.597 567.287 192.845 567.859C188.138 568.787 183.504 569.353 178.796 570.281C182.712 567.686 186.554 565.453 190.612 564.016C200.247 561.075 209.955 557.772 219.732 555.989C246.383 550.85 273.322 546.146 300.335 541.08C303.448 540.582 306.127 540.372 308.444 540.089ZM183.279 572.32C161.183 579.137 139.953 587.258 119.367 597.77C126.197 588.234 167.138 572.059 183.279 572.32Z"}" fill="${"url(#paint48_linear)"}"></path><path d="${"M676.985 286.447C667.555 293.95 658.051 301.814 648.186 309.604C627.076 326.412 607.771 345.469 588.177 364.09C568.001 383.723 551.149 405.537 536.247 428.876C522.435 450.554 509.2 473.101 499.797 497.179C495.059 509.399 490.394 521.257 487.826 533.917C484.603 547.951 481.018 561.911 478.519 576.091C476.313 588.825 475.265 601.417 477.546 614.307C478.118 617.059 479.486 619.596 480.493 622.06C480.854 622.133 481.29 621.845 481.651 621.918C481.583 620.398 481.515 618.878 481.085 617.284C479.449 606.784 480.779 596.509 483.557 586.528C491.974 552.459 509.57 523.264 531.937 496.543C542.247 484.7 553.281 473.004 564.242 461.67C568.089 457.554 572.949 454.021 576.796 449.905C593.712 431.494 610.989 413.155 624.365 391.766C635.053 374.351 644.079 355.846 652.381 337.193C659.227 322.012 666.072 306.83 674.579 292.738C675.019 290.568 676.183 288.544 676.985 286.447ZM665.144 302.122C665.505 302.196 665.505 302.196 665.794 302.631C665.647 303.354 665.574 303.716 665.065 304.366C658.513 318.101 651.961 331.836 645.336 345.933C636.017 365.885 625.901 386.052 612.823 404.113C598.728 423.473 582.394 440.873 565.049 457.691C552.348 470.179 540.297 483.175 528.896 496.679C514.591 513.361 502.672 531.279 493.352 551.232C490.585 557.449 488.179 563.74 485.412 569.957C484.908 568.726 485.129 567.64 485.349 566.555C486.664 561.926 487.691 556.862 489.368 552.307C493.31 540.302 497.324 527.935 501.989 516.077C514.448 486.217 532.039 458.904 551.58 433.116C560.297 421.704 569.953 411.234 579.681 400.403C607.993 370.369 636.665 340.408 660.788 306.888C662.528 305.734 663.98 304.146 665.144 302.122ZM662.25 301.535C662.538 301.971 662.538 301.971 662.827 302.406C662.318 303.056 661.81 303.706 661.663 304.429C645.246 325.955 627.89 346.537 609.523 366.537C597.981 378.883 585.715 391.082 574.46 403.863C563.788 415.633 553.404 427.837 544.32 441.059C533.784 455.869 523.972 470.825 515.098 486.725C504.987 505.011 496.973 524.098 490.332 543.841C487.486 552.302 485.437 560.548 482.953 569.082C482.376 568.212 482.523 567.489 482.67 566.765C485.379 555.264 487.8 543.327 491.233 531.972C494.666 520.617 498.172 508.901 502.617 498.128C511.873 474.773 524.527 453.238 537.83 432.21C552.223 409.521 568.567 388.357 587.873 369.301C604.275 353.421 619.953 337.395 637.655 322.532C645.203 315.025 653.69 308.461 662.25 301.535Z"}" fill="${"url(#paint49_linear)"}"></path><defs><linearGradient id="${"paint0_linear"}" x1="${"568.299"}" y1="${"436.131"}" x2="${"607"}" y2="${"1195.5"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#A78140"}"></stop><stop offset="${"1"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint1_linear"}" x1="${"863.208"}" y1="${"1734.39"}" x2="${"240.182"}" y2="${"-46.0365"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint2_linear"}" x1="${"830.659"}" y1="${"1745.77"}" x2="${"207.637"}" y2="${"-34.6446"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint3_linear"}" x1="${"912.073"}" y1="${"1717.29"}" x2="${"289.045"}" y2="${"-63.1357"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint4_linear"}" x1="${"826.084"}" y1="${"1747.38"}" x2="${"203.058"}" y2="${"-33.0482"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint5_linear"}" x1="${"939.097"}" y1="${"1707.84"}" x2="${"316.07"}" y2="${"-72.5899"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint6_linear"}" x1="${"826.902"}" y1="${"1747.09"}" x2="${"203.877"}" y2="${"-33.3301"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint7_linear"}" x1="${"877.18"}" y1="${"1729.5"}" x2="${"254.153"}" y2="${"-50.9311"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint8_linear"}" x1="${"678.557"}" y1="${"1799.01"}" x2="${"55.528"}" y2="${"18.5818"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint9_linear"}" x1="${"759.073"}" y1="${"1770.82"}" x2="${"136.048"}" y2="${"-9.5978"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint10_linear"}" x1="${"918.157"}" y1="${"1715.16"}" x2="${"295.131"}" y2="${"-65.2689"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint11_linear"}" x1="${"885.264"}" y1="${"1726.67"}" x2="${"262.241"}" y2="${"-53.7515"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint12_linear"}" x1="${"843.209"}" y1="${"1741.39"}" x2="${"220.184"}" y2="${"-39.0322"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint13_linear"}" x1="${"725.117"}" y1="${"1782.72"}" x2="${"102.09"}" y2="${"2.2924"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint14_linear"}" x1="${"987.161"}" y1="${"1691.02"}" x2="${"364.134"}" y2="${"-89.4134"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint15_linear"}" x1="${"871.647"}" y1="${"1731.44"}" x2="${"248.622"}" y2="${"-48.9836"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint16_linear"}" x1="${"1003.73"}" y1="${"1685.21"}" x2="${"380.706"}" y2="${"-95.2057"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint17_linear"}" x1="${"919.449"}" y1="${"1714.72"}" x2="${"296.421"}" y2="${"-65.7121"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint18_linear"}" x1="${"842.49"}" y1="${"1741.64"}" x2="${"219.464"}" y2="${"-38.7804"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint19_linear"}" x1="${"957.598"}" y1="${"1701.36"}" x2="${"334.573"}" y2="${"-79.0631"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint20_linear"}" x1="${"1018.69"}" y1="${"1679.99"}" x2="${"395.658"}" y2="${"-100.445"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint21_linear"}" x1="${"850.122"}" y1="${"1738.97"}" x2="${"227.096"}" y2="${"-41.4558"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint22_linear"}" x1="${"927.365"}" y1="${"1711.94"}" x2="${"304.338"}" y2="${"-68.4866"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint23_linear"}" x1="${"985.121"}" y1="${"1691.73"}" x2="${"362.094"}" y2="${"-88.6958"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint24_linear"}" x1="${"870.437"}" y1="${"1731.87"}" x2="${"247.41"}" y2="${"-48.563"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint25_linear"}" x1="${"774.838"}" y1="${"1765.32"}" x2="${"151.811"}" y2="${"-15.1114"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint26_linear"}" x1="${"866.759"}" y1="${"1733.16"}" x2="${"243.73"}" y2="${"-47.2785"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint27_linear"}" x1="${"676.098"}" y1="${"1799.87"}" x2="${"53.0745"}" y2="${"19.4384"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint28_linear"}" x1="${"896.405"}" y1="${"1722.78"}" x2="${"273.376"}" y2="${"-57.6513"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint29_linear"}" x1="${"804.335"}" y1="${"1754.99"}" x2="${"181.311"}" y2="${"-25.4356"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint30_linear"}" x1="${"913.365"}" y1="${"1716.84"}" x2="${"290.34"}" y2="${"-63.587"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint31_linear"}" x1="${"996.364"}" y1="${"1687.79"}" x2="${"373.339"}" y2="${"-92.6289"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint32_linear"}" x1="${"788.634"}" y1="${"1760.48"}" x2="${"165.608"}" y2="${"-19.9395"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint33_linear"}" x1="${"900.279"}" y1="${"1721.42"}" x2="${"277.253"}" y2="${"-59.0073"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint34_linear"}" x1="${"705.878"}" y1="${"1789.43"}" x2="${"82.8561"}" y2="${"9.02123"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint35_linear"}" x1="${"756.065"}" y1="${"1771.87"}" x2="${"133.042"}" y2="${"-8.5436"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint36_linear"}" x1="${"987.063"}" y1="${"1691.04"}" x2="${"364.041"}" y2="${"-89.3766"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint37_linear"}" x1="${"857.316"}" y1="${"1736.44"}" x2="${"234.296"}" y2="${"-43.9718"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint38_linear"}" x1="${"1017.91"}" y1="${"1680.26"}" x2="${"394.887"}" y2="${"-100.175"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint39_linear"}" x1="${"711.409"}" y1="${"1787.5"}" x2="${"88.3875"}" y2="${"7.08408"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint40_linear"}" x1="${"749.518"}" y1="${"1774.18"}" x2="${"126.489"}" y2="${"-6.25297"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint41_linear"}" x1="${"763.1"}" y1="${"1769.42"}" x2="${"140.075"}" y2="${"-11.0036"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint42_linear"}" x1="${"953.685"}" y1="${"1702.71"}" x2="${"330.665"}" y2="${"-77.697"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint43_linear"}" x1="${"781.626"}" y1="${"1762.95"}" x2="${"158.597"}" y2="${"-17.4867"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint44_linear"}" x1="${"862.217"}" y1="${"1734.74"}" x2="${"239.192"}" y2="${"-45.6902"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint45_linear"}" x1="${"708.797"}" y1="${"1788.4"}" x2="${"85.7818"}" y2="${"7.99883"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint46_linear"}" x1="${"828.178"}" y1="${"1746.65"}" x2="${"205.153"}" y2="${"-33.7786"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint47_linear"}" x1="${"778.175"}" y1="${"1764.13"}" x2="${"155.157"}" y2="${"-16.2773"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint48_linear"}" x1="${"708.61"}" y1="${"1789.19"}" x2="${"85.5847"}" y2="${"8.76404"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient><linearGradient id="${"paint49_linear"}" x1="${"1008.75"}" y1="${"1684.16"}" x2="${"385.726"}" y2="${"-96.2663"}" gradientUnits="${"userSpaceOnUse"}"><stop stop-color="${"#E7C16D"}"></stop><stop offset="${"0.2398"}" stop-color="${"#B8822C"}"></stop><stop offset="${"0.5153"}" stop-color="${"#7E5923"}"></stop><stop offset="${"0.8571"}" stop-color="${"#E7C16D"}"></stop></linearGradient></defs></svg>`;
});
var css$9 = {
  code: "ul.svelte-ehymnt.svelte-ehymnt{display:flex;z-index:10}ul.svelte-ehymnt a.svelte-ehymnt{color:#3c3c3c}@media only screen and (max-width: 1280px){ul.svelte-ehymnt a.svelte-ehymnt{font-size:14px}}@media only screen and (max-width: 720px){ul.svelte-ehymnt a.svelte-ehymnt{font-size:10px}}@media only screen and (max-height: 480px){ul.svelte-ehymnt a.svelte-ehymnt{font-size:10px}}ul.svelte-ehymnt a.svelte-ehymnt:nth-child(2){margin:0 40px}@media only screen and (max-width: 1280px){ul.svelte-ehymnt a.svelte-ehymnt:nth-child(2){margin:0 20px}}.footer.svelte-ehymnt.svelte-ehymnt{position:fixed;z-index:10;bottom:30px;left:120px}@media only screen and (max-width: 1280px){.footer.svelte-ehymnt.svelte-ehymnt{bottom:20px;left:64px}}@media only screen and (max-width: 720px){.footer.svelte-ehymnt.svelte-ehymnt{bottom:20px;left:40px}}@media only screen and (max-height: 480px){.footer.svelte-ehymnt.svelte-ehymnt{bottom:20px;left:40px}}.ending.svelte-ehymnt.svelte-ehymnt{position:static;display:flex;justify-content:center;margin-top:3em}@media only screen and (max-width: 1280px){.ending.svelte-ehymnt.svelte-ehymnt{justify-content:flex-start;margin-top:1em}}",
  map: `{"version":3,"file":"Footer.svelte","sources":["Footer.svelte"],"sourcesContent":["<script>\\r\\n\\texport let typew = 'footer';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<nav class={typew}>\\r\\n\\t\\t<ul>\\r\\n\\t\\t\\t<a rel=\\"external\\" href=\\"https://www.behance.net/gauthamkrishnax\\"><li>Behance</li></a>\\r\\n\\t\\t\\t<a rel=\\"external\\" href=\\"https://github.com/gauthamkrishnax\\"><li>Github</li></a>\\r\\n\\t\\t\\t<a rel=\\"external\\" href=\\"https://www.linkedin.com/in/gauthamkrishnas/\\"><li>LinkedIn</li></a>\\r\\n\\t\\t</ul>\\r\\n\\t</nav>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">ul {\\n  display: flex;\\n  z-index: 10;\\n}\\nul a {\\n  color: #3c3c3c;\\n}\\n@media only screen and (max-width: 1280px) {\\n  ul a {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  ul a {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  ul a {\\n    font-size: 10px;\\n  }\\n}\\nul a:nth-child(2) {\\n  margin: 0 40px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  ul a:nth-child(2) {\\n    margin: 0 20px;\\n  }\\n}\\n\\n.footer {\\n  position: fixed;\\n  z-index: 10;\\n  bottom: 30px;\\n  left: 120px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .footer {\\n    bottom: 20px;\\n    left: 64px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  .footer {\\n    bottom: 20px;\\n    left: 40px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  .footer {\\n    bottom: 20px;\\n    left: 40px;\\n  }\\n}\\n\\n.ending {\\n  position: static;\\n  display: flex;\\n  justify-content: center;\\n  margin-top: 3em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .ending {\\n    justify-content: flex-start;\\n    margin-top: 1em;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAcmB,EAAE,4BAAC,CAAC,AACrB,OAAO,CAAE,IAAI,CACb,OAAO,CAAE,EAAE,AACb,CAAC,AACD,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,KAAK,CAAE,OAAO,AAChB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,gBAAE,CAAC,eAAC,WAAW,CAAC,CAAC,AAAC,CAAC,AACjB,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,gBAAE,CAAC,eAAC,WAAW,CAAC,CAAC,AAAC,CAAC,AACjB,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AACH,CAAC,AAED,OAAO,4BAAC,CAAC,AACP,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,KAAK,AACb,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,OAAO,4BAAC,CAAC,AACP,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,IAAI,AACZ,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,OAAO,4BAAC,CAAC,AACP,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,IAAI,AACZ,CAAC,AACH,CAAC,AACD,OAAO,EAAE,EAAE,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,OAAO,4BAAC,CAAC,AACP,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,IAAI,AACZ,CAAC,AACH,CAAC,AAED,OAAO,4BAAC,CAAC,AACP,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,UAAU,CAAE,GAAG,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,OAAO,4BAAC,CAAC,AACP,eAAe,CAAE,UAAU,CAC3B,UAAU,CAAE,GAAG,AACjB,CAAC,AACH,CAAC"}`
};
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { typew = "footer" } = $$props;
  if ($$props.typew === void 0 && $$bindings.typew && typew !== void 0)
    $$bindings.typew(typew);
  $$result.css.add(css$9);
  return `<nav class="${escape(null_to_empty(typew)) + " svelte-ehymnt"}"><ul class="${"svelte-ehymnt"}"><a rel="${"external"}" href="${"https://www.behance.net/gauthamkrishnax"}" class="${"svelte-ehymnt"}"><li>Behance</li></a>
			<a rel="${"external"}" href="${"https://github.com/gauthamkrishnax"}" class="${"svelte-ehymnt"}"><li>Github</li></a>
			<a rel="${"external"}" href="${"https://www.linkedin.com/in/gauthamkrishnas/"}" class="${"svelte-ehymnt"}"><li>LinkedIn</li></a></ul>
	</nav>`;
});
var css$8 = {
  code: 'section.svelte-hiuido{padding-top:25vh;text-align:center;font-size:18px;padding-right:5em}@media only screen and (max-width: 1280px){section.svelte-hiuido{margin:0 64px;text-align:left;padding-right:0;padding-top:200px;font-size:12px}}@media only screen and (max-width: 720px){section.svelte-hiuido{margin:0 40px;padding-right:0;padding-top:120px}}@media only screen and (max-height: 480px){section.svelte-hiuido{margin:0 40px;padding-right:0;padding-top:120px}}h1.svelte-hiuido{position:relative;z-index:30;margin-top:0.5em;font-family:"harmony", serif;font-size:96px}@media only screen and (max-width: 1280px){h1.svelte-hiuido{max-width:400px;margin-top:1em;font-size:48px}}@media only screen and (max-width: 720px){h1.svelte-hiuido{max-width:200px;margin-top:0.5em;font-size:24px}}@media only screen and (max-height: 480px){h1.svelte-hiuido{max-width:200px;margin-top:0.5em;font-size:24px}}',
  map: `{"version":3,"file":"__error.svelte","sources":["__error.svelte"],"sourcesContent":["<script>\\r\\n\\timport Flower from '../svg/flower.svelte';\\r\\n\\timport Footer from '../components/Footer.svelte';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section>\\r\\n\\t\\t<p>Please check your URL or try after some time</p>\\r\\n\\t\\t<h1>I am sorry, I think you are lost !</h1>\\r\\n\\t\\t<Footer typew=\\"ending\\" />\\r\\n\\t\\t<Flower type=\\"back\\" />\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">section {\\n  padding-top: 25vh;\\n  text-align: center;\\n  font-size: 18px;\\n  padding-right: 5em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section {\\n    margin: 0 64px;\\n    text-align: left;\\n    padding-right: 0;\\n    padding-top: 200px;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 120px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 120px;\\n  }\\n}\\n\\nh1 {\\n  position: relative;\\n  z-index: 30;\\n  margin-top: 0.5em;\\n  font-family: \\"harmony\\", serif;\\n  font-size: 96px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  h1 {\\n    max-width: 400px;\\n    margin-top: 1em;\\n    font-size: 48px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h1 {\\n    max-width: 200px;\\n    margin-top: 0.5em;\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h1 {\\n    max-width: 200px;\\n    margin-top: 0.5em;\\n    font-size: 24px;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAcmB,OAAO,cAAC,CAAC,AAC1B,WAAW,CAAE,IAAI,CACjB,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,IAAI,CACf,aAAa,CAAE,GAAG,AACpB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,OAAO,cAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,CAClB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,OAAO,cAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,OAAO,cAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AAED,EAAE,cAAC,CAAC,AACF,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,SAAS,CAAC,CAAC,KAAK,CAC7B,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,EAAE,cAAC,CAAC,AACF,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,GAAG,CACf,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,EAAE,cAAC,CAAC,AACF,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,EAAE,cAAC,CAAC,AACF,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC"}`
};
var _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$8);
  return `<section class="${"svelte-hiuido"}"><p>Please check your URL or try after some time</p>
		<h1 class="${"svelte-hiuido"}">I am sorry, I think you are lost !</h1>
		${validate_component(Footer, "Footer").$$render($$result, { typew: "ending" }, {}, {})}
		${validate_component(Flower, "Flower").$$render($$result, { type: "back" }, {}, {})}
	</section>`;
});
var __error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _error
});
var css$7 = {
  code: "svg.svelte-1yy8zfk{margin:0 20px}",
  map: '{"version":3,"file":"star.svelte","sources":["star.svelte"],"sourcesContent":["<svg width=\\"21\\" height=\\"21\\" viewBox=\\"0 0 21 21\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\n\\t<path\\n\\t\\td=\\"M12.4143 11.2921L20.3438 10.5L12.4143 9.70692L17.4608 3.53916L11.2928 8.58605L10.5 0.65625L9.70692 8.58605L3.53916 3.53916L8.58572 9.70692L0.65625 10.5L8.58572 11.2921L3.53916 17.4605L9.70692 12.4143L10.5 20.3438L11.2928 12.4143L17.4608 17.4605L12.4143 11.2921Z\\"\\n\\t\\tfill=\\"#505050\\"\\n\\t/>\\n</svg>\\n\\n<style>\\n\\tsvg {\\n\\t\\tmargin: 0 20px;\\n\\t}</style>\\n"],"names":[],"mappings":"AAQC,GAAG,eAAC,CAAC,AACJ,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC"}'
};
var Star = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$7);
  return `<svg width="${"21"}" height="${"21"}" viewBox="${"0 0 21 21"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-1yy8zfk"}"><path d="${"M12.4143 11.2921L20.3438 10.5L12.4143 9.70692L17.4608 3.53916L11.2928 8.58605L10.5 0.65625L9.70692 8.58605L3.53916 3.53916L8.58572 9.70692L0.65625 10.5L8.58572 11.2921L3.53916 17.4605L9.70692 12.4143L10.5 20.3438L11.2928 12.4143L17.4608 17.4605L12.4143 11.2921Z"}" fill="${"#505050"}"></path></svg>`;
});
var css$6 = {
  code: '.loader.svelte-1jhx9ki.svelte-1jhx9ki{background-color:#FFFFF5;position:fixed;width:100vw;height:100vh;overflow:hidden;z-index:20;top:0}.loader.svelte-1jhx9ki span.svelte-1jhx9ki{font-family:"harmony", serif;letter-spacing:0.15em;position:absolute;width:100%;height:100%;display:flex;justify-content:center;align-items:center}',
  map: `{"version":3,"file":"Loader.svelte","sources":["Loader.svelte"],"sourcesContent":["<script>\\r\\n\\texport let pageName = 'GAUTHAM KRISHNA',\\r\\n\\t\\tloader;\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<div class=\\"{loader} loader\\">\\r\\n\\t\\t<span>{pageName}</span>\\r\\n\\t</div>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">.loader {\\n  background-color: #FFFFF5;\\n  position: fixed;\\n  width: 100vw;\\n  height: 100vh;\\n  overflow: hidden;\\n  z-index: 20;\\n  top: 0;\\n}\\n.loader span {\\n  font-family: \\"harmony\\", serif;\\n  letter-spacing: 0.15em;\\n  position: absolute;\\n  width: 100%;\\n  height: 100%;\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n}</style>\\r\\n"],"names":[],"mappings":"AAWmB,OAAO,8BAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,CACzB,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,EAAE,CACX,GAAG,CAAE,CAAC,AACR,CAAC,AACD,sBAAO,CAAC,IAAI,eAAC,CAAC,AACZ,WAAW,CAAE,SAAS,CAAC,CAAC,KAAK,CAC7B,cAAc,CAAE,MAAM,CACtB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,AACrB,CAAC"}`
};
var Loader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pageName = "GAUTHAM KRISHNA", loader } = $$props;
  if ($$props.pageName === void 0 && $$bindings.pageName && pageName !== void 0)
    $$bindings.pageName(pageName);
  if ($$props.loader === void 0 && $$bindings.loader && loader !== void 0)
    $$bindings.loader(loader);
  $$result.css.add(css$6);
  return `<div class="${escape(loader) + " loader svelte-1jhx9ki"}"><span class="${"svelte-1jhx9ki"}">${escape(pageName)}</span>
	</div>`;
});
var css$5 = {
  code: "svg.svelte-1a2oioy{width:var(--width-size);margin-left:var(--left-margin)}.left.svelte-1a2oioy{transform:rotate(90deg)}.right.svelte-1a2oioy{transform:rotate(-90deg)}.up.svelte-1a2oioy{transform:rotate(180deg)}",
  map: `{"version":3,"file":"arrow.svelte","sources":["arrow.svelte"],"sourcesContent":["<script>\\n\\texport let direction = '';\\n<\/script>\\n\\n<svg\\n\\tclass={direction}\\n\\twidth=\\"20\\"\\n\\theight=\\"30\\"\\n\\tviewBox=\\"0 0 20 30\\"\\n\\tfill=\\"none\\"\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\n>\\n\\t<path\\n\\t\\td=\\"M19.1 19.9L9.69998 29.7L0.0999756 19.9L0.599976 19.4L7.59998 23.5V0H11.8V23.4L18.6 19.4L19.1 19.9Z\\"\\n\\t\\tfill=\\"#3c3c3c\\"\\n\\t/>\\n</svg>\\n\\n<style lang=\\"scss\\">svg {\\n  width: var(--width-size);\\n  margin-left: var(--left-margin);\\n}\\n\\n.left {\\n  transform: rotate(90deg);\\n}\\n\\n.right {\\n  transform: rotate(-90deg);\\n}\\n\\n.up {\\n  transform: rotate(180deg);\\n}</style>\\n"],"names":[],"mappings":"AAkBmB,GAAG,eAAC,CAAC,AACtB,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,WAAW,CAAE,IAAI,aAAa,CAAC,AACjC,CAAC,AAED,KAAK,eAAC,CAAC,AACL,SAAS,CAAE,OAAO,KAAK,CAAC,AAC1B,CAAC,AAED,MAAM,eAAC,CAAC,AACN,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AAED,GAAG,eAAC,CAAC,AACH,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC"}`
};
var Arrow = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { direction = "" } = $$props;
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0)
    $$bindings.direction(direction);
  $$result.css.add(css$5);
  return `<svg class="${escape(null_to_empty(direction)) + " svelte-1a2oioy"}" width="${"20"}" height="${"30"}" viewBox="${"0 0 20 30"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M19.1 19.9L9.69998 29.7L0.0999756 19.9L0.599976 19.4L7.59998 23.5V0H11.8V23.4L18.6 19.4L19.1 19.9Z"}" fill="${"#3c3c3c"}"></path></svg>`;
});
var css$4 = {
  code: '.container.footer.svelte-1wdppdi.svelte-1wdppdi{position:fixed;z-index:10;bottom:30px;right:5vw;display:flex;align-items:center}@media only screen and (max-width: 1280px){.container.footer.svelte-1wdppdi.svelte-1wdppdi{right:50px;bottom:10px}}.container.footer.svelte-1wdppdi div.svelte-1wdppdi{font-family:"tenorsans", sans-serif;font-size:12px;-webkit-animation:svelte-1wdppdi-rotation 15s linear infinite;animation:svelte-1wdppdi-rotation 15s linear infinite;-webkit-animation-delay:1s;animation-delay:1s}@media only screen and (max-width: 1280px){.container.footer.svelte-1wdppdi div.svelte-1wdppdi{font-size:8px}}.container.ending.svelte-1wdppdi.svelte-1wdppdi{position:static;display:flex;align-items:center;justify-content:center}@media only screen and (max-width: 1280px){.container.ending.svelte-1wdppdi.svelte-1wdppdi{margin-left:64px;justify-content:flex-start}}.container.ending.svelte-1wdppdi div.svelte-1wdppdi{-webkit-animation:svelte-1wdppdi-rotation 15s linear infinite;animation:svelte-1wdppdi-rotation 15s linear infinite;font-size:24px}@media only screen and (max-width: 1280px){.container.ending.svelte-1wdppdi div.svelte-1wdppdi{font-size:14px}}@-webkit-keyframes svelte-1wdppdi-rotation{from{transform:rotate(0deg)}to{transform:rotate(359deg)}}@keyframes svelte-1wdppdi-rotation{from{transform:rotate(0deg)}to{transform:rotate(359deg)}}',
  map: `{"version":3,"file":"CircleType.svelte","sources":["CircleType.svelte"],"sourcesContent":["<script>\\r\\n\\timport CircleType from 'circletype';\\r\\n\\timport { onMount } from 'svelte';\\r\\n\\timport Arrow from '../svg/arrow.svelte';\\r\\n\\texport let typeText,\\r\\n\\t\\ttype = 'footer',\\r\\n\\t\\tdirection = '';\\r\\n\\tlet circle;\\r\\n\\tonMount(() => {\\r\\n\\t\\tnew CircleType(circle);\\r\\n\\t});\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<div class=\\"container {type}\\">\\r\\n\\t\\t<div>\\r\\n\\t\\t\\t<span bind:this={circle}>{typeText}</span>\\r\\n\\t\\t</div>\\r\\n\\t\\t<Arrow --left-margin=\\"-10px\\" {direction} />\\r\\n\\t</div>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">.container.footer {\\n  position: fixed;\\n  z-index: 10;\\n  bottom: 30px;\\n  right: 5vw;\\n  display: flex;\\n  align-items: center;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .container.footer {\\n    right: 50px;\\n    bottom: 10px;\\n  }\\n}\\n.container.footer div {\\n  font-family: \\"tenorsans\\", sans-serif;\\n  font-size: 12px;\\n  -webkit-animation: rotation 15s linear infinite;\\n          animation: rotation 15s linear infinite;\\n  -webkit-animation-delay: 1s;\\n          animation-delay: 1s;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .container.footer div {\\n    font-size: 8px;\\n  }\\n}\\n\\n.container.ending {\\n  position: static;\\n  display: flex;\\n  align-items: center;\\n  justify-content: center;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .container.ending {\\n    margin-left: 64px;\\n    justify-content: flex-start;\\n  }\\n}\\n.container.ending div {\\n  -webkit-animation: rotation 15s linear infinite;\\n          animation: rotation 15s linear infinite;\\n  font-size: 24px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  .container.ending div {\\n    font-size: 14px;\\n  }\\n}\\n\\n@-webkit-keyframes rotation {\\n  from {\\n    transform: rotate(0deg);\\n  }\\n  to {\\n    transform: rotate(359deg);\\n  }\\n}\\n\\n@keyframes rotation {\\n  from {\\n    transform: rotate(0deg);\\n  }\\n  to {\\n    transform: rotate(359deg);\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AAsBmB,UAAU,OAAO,8BAAC,CAAC,AACpC,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,GAAG,CACV,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,UAAU,OAAO,8BAAC,CAAC,AACjB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AACH,CAAC,AACD,UAAU,sBAAO,CAAC,GAAG,eAAC,CAAC,AACrB,WAAW,CAAE,WAAW,CAAC,CAAC,UAAU,CACpC,SAAS,CAAE,IAAI,CACf,iBAAiB,CAAE,uBAAQ,CAAC,GAAG,CAAC,MAAM,CAAC,QAAQ,CACvC,SAAS,CAAE,uBAAQ,CAAC,GAAG,CAAC,MAAM,CAAC,QAAQ,CAC/C,uBAAuB,CAAE,EAAE,CACnB,eAAe,CAAE,EAAE,AAC7B,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,UAAU,sBAAO,CAAC,GAAG,eAAC,CAAC,AACrB,SAAS,CAAE,GAAG,AAChB,CAAC,AACH,CAAC,AAED,UAAU,OAAO,8BAAC,CAAC,AACjB,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,AACzB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,UAAU,OAAO,8BAAC,CAAC,AACjB,WAAW,CAAE,IAAI,CACjB,eAAe,CAAE,UAAU,AAC7B,CAAC,AACH,CAAC,AACD,UAAU,sBAAO,CAAC,GAAG,eAAC,CAAC,AACrB,iBAAiB,CAAE,uBAAQ,CAAC,GAAG,CAAC,MAAM,CAAC,QAAQ,CACvC,SAAS,CAAE,uBAAQ,CAAC,GAAG,CAAC,MAAM,CAAC,QAAQ,CAC/C,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,UAAU,sBAAO,CAAC,GAAG,eAAC,CAAC,AACrB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AAED,mBAAmB,uBAAS,CAAC,AAC3B,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,OAAO,IAAI,CAAC,AACzB,CAAC,AACD,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AACH,CAAC,AAED,WAAW,uBAAS,CAAC,AACnB,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,OAAO,IAAI,CAAC,AACzB,CAAC,AACD,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,OAAO,MAAM,CAAC,AAC3B,CAAC,AACH,CAAC"}`
};
var CircleType_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { typeText, type = "footer", direction = "" } = $$props;
  let circle;
  if ($$props.typeText === void 0 && $$bindings.typeText && typeText !== void 0)
    $$bindings.typeText(typeText);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0)
    $$bindings.direction(direction);
  $$result.css.add(css$4);
  return `<div class="${"container " + escape(type) + " svelte-1wdppdi"}"><div class="${"svelte-1wdppdi"}"><span${add_attribute("this", circle, 0)}>${escape(typeText)}</span></div>
		<div style="display: contents; --left-margin:${"-10px"};">${validate_component(Arrow, "Arrow").$$render($$result, { direction }, {}, {})}</div>
	</div>`;
});
var s1 = "/_app/assets/s1-7a0ae9d9.png";
var s2 = "/_app/assets/s2-5cc3f145.png";
var projects = [
  {
    name: "Kanakoot",
    about: "Kanakoot is a online calculator that calculates expense per person to balance money spent among groups.",
    role: ["Branding", "UX design", "Development"],
    progress: "Completed beta phase",
    link: "https://kanakoot.netlify.app",
    previewImage: [s1, s2]
  }
];
var css$3 = {
  code: 'section.top.svelte-wfo97f.svelte-wfo97f{position:relative;height:88vh;padding:5em 120px}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f.svelte-wfo97f{min-height:100vh;height:100%;padding:160px 64px}}@media only screen and (max-width: 720px){section.top.svelte-wfo97f.svelte-wfo97f{height:100%;padding:115px 40px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f.svelte-wfo97f{height:100%;padding:115px 40px}}section.top.svelte-wfo97f .container.svelte-wfo97f{display:grid;position:relative;z-index:5;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto 1fr}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .container.svelte-wfo97f{grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr}}section.top.svelte-wfo97f .container .projectNo.svelte-wfo97f{position:relative}section.top.svelte-wfo97f .container .projectNo h3.svelte-wfo97f{transform:rotate(-90deg);position:absolute;top:130px;left:-130px;font-size:48px;letter-spacing:0.15em}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .container .projectNo h3.svelte-wfo97f{top:90px;left:-65px;font-size:24px}}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .container .projectNo h3.svelte-wfo97f{left:-40px;font-size:12px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .container .projectNo h3.svelte-wfo97f{left:-40px;font-size:12px}}section.top.svelte-wfo97f .container h2.svelte-wfo97f{grid-column:2/3;font-family:"harmony", serif;color:#3c3c3c}section.top.svelte-wfo97f .container h2.svelte-wfo97f{font-size:75px;line-height:91.35px}@media screen and (min-width: 1280px){section.top.svelte-wfo97f .container h2.svelte-wfo97f{font-size:calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));line-height:calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px)}}@media screen and (min-width: 1920px){section.top.svelte-wfo97f .container h2.svelte-wfo97f{font-size:96px;line-height:125.328px}}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .container h2.svelte-wfo97f{font-size:48px;grid-column:1/3}}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .container h2.svelte-wfo97f{font-size:24px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .container h2.svelte-wfo97f{font-size:24px}}section.top.svelte-wfo97f .content.svelte-wfo97f{grid-area:2/1/3/4}section.top.svelte-wfo97f .content section.svelte-wfo97f{margin:0 auto;margin-top:3em;padding-left:8em;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:150px 150px;max-width:1750px}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .content section.svelte-wfo97f{grid-template-columns:1fr 1fr;grid-template-rows:auto auto auto;margin:0 0;margin-top:1em;padding-left:3em}}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .content section.svelte-wfo97f{margin-top:0.2em;padding-left:0.2em}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .content section.svelte-wfo97f{margin-top:0.2em;padding-left:0.2em}}section.top.svelte-wfo97f .content section article.svelte-wfo97f{height:100px;margin-left:2em}section.top.svelte-wfo97f .content section article h5.svelte-wfo97f{font-family:"harmony", serif;font-size:24px;color:#3c3c3c;margin-bottom:0.2em}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .content section article h5.svelte-wfo97f{font-size:24px}}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .content section article h5.svelte-wfo97f{font-size:14px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .content section article h5.svelte-wfo97f{font-size:14px}}section.top.svelte-wfo97f .content section article h4.svelte-wfo97f{font-family:"harmony", serif;font-size:36px;color:#3c3c3c;margin-bottom:0.2em}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .content section article h4.svelte-wfo97f{font-size:14px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .content section article h4.svelte-wfo97f{font-size:14px}}section.top.svelte-wfo97f .content section article p.svelte-wfo97f{line-height:1.1em;max-width:300px;color:#505050}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .content section article p.svelte-wfo97f{font-size:14px}}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .content section article p.svelte-wfo97f{font-size:10px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .content section article p.svelte-wfo97f{font-size:10px}}section.top.svelte-wfo97f .content section article ul li.svelte-wfo97f{margin-bottom:0.3em;list-style:circle;margin-left:1em;color:#505050}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .content section article ul li.svelte-wfo97f{font-size:10px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .content section article ul li.svelte-wfo97f{font-size:10px}}section.top.svelte-wfo97f .content section .links.svelte-wfo97f{grid-column:1/2}section.top.svelte-wfo97f .content section .links span.svelte-wfo97f{display:flex;align-items:center}section.top.svelte-wfo97f .content section .links a.svelte-wfo97f{color:#3c3c3c}section.top.svelte-wfo97f .content section .links p.svelte-wfo97f{font-size:18px;margin-left:0.2em}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .content section .links p.svelte-wfo97f{font-size:12px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .content section .links p.svelte-wfo97f{font-size:12px}}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .content section .links.svelte-wfo97f{grid-area:2/1/3/3}}section.top.svelte-wfo97f .content section .progress.svelte-wfo97f{grid-column:2/3}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .content section .progress.svelte-wfo97f{grid-area:3/1/4/3}}section.top.svelte-wfo97f .previewContainer.svelte-wfo97f{position:absolute;overflow:hidden;width:50vw;right:0;bottom:0;top:0;z-index:0}section.top.svelte-wfo97f .previewContainer img.svelte-wfo97f{transform:rotate(30deg);position:absolute;overflow:none;bottom:-180px}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .previewContainer img.svelte-wfo97f{bottom:-60px;transform:rotate(0)}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .previewContainer img.svelte-wfo97f{bottom:-60px;transform:rotate(0)}}section.top.svelte-wfo97f .previewContainer .preview1.svelte-wfo97f{right:-15%;width:70%}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .previewContainer .preview1.svelte-wfo97f{width:400px;right:-150px}}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .previewContainer .preview1.svelte-wfo97f{width:250px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .previewContainer .preview1.svelte-wfo97f{width:250px}}section.top.svelte-wfo97f .previewContainer .preview2.svelte-wfo97f{right:15%;bottom:160px;width:45%}@media only screen and (max-width: 1280px){section.top.svelte-wfo97f .previewContainer .preview2.svelte-wfo97f{width:250px;right:0px;bottom:50px}}@media only screen and (max-width: 720px){section.top.svelte-wfo97f .previewContainer .preview2.svelte-wfo97f{width:200px;bottom:-50px;right:-60px}}@media only screen and (max-height: 480px){section.top.svelte-wfo97f .previewContainer .preview2.svelte-wfo97f{width:200px;bottom:-50px;right:-60px}}',
  map: `{"version":3,"file":"ProjectPreview.svelte","sources":["ProjectPreview.svelte"],"sourcesContent":["<script>\\r\\n\\timport Arrow from '../svg/arrow.svelte';\\r\\n\\r\\n\\texport let project;\\r\\n\\texport let no;\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section class=\\"{project.name} top\\">\\r\\n\\t\\t<div class=\\"container\\">\\r\\n\\t\\t\\t<h2>{project.name}</h2>\\r\\n\\t\\t\\t<div class=\\"content\\">\\r\\n\\t\\t\\t\\t<div class=\\"projectNo\\">\\r\\n\\t\\t\\t\\t\\t<h3>PROJECT-{no}</h3>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t<section>\\r\\n\\t\\t\\t\\t\\t<article>\\r\\n\\t\\t\\t\\t\\t\\t<h5>About</h5>\\r\\n\\t\\t\\t\\t\\t\\t<p>{project.about}</p>\\r\\n\\t\\t\\t\\t\\t</article>\\r\\n\\t\\t\\t\\t\\t<article>\\r\\n\\t\\t\\t\\t\\t\\t<h5>Role</h5>\\r\\n\\t\\t\\t\\t\\t\\t<ul>\\r\\n\\t\\t\\t\\t\\t\\t\\t{#each project.role as role}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<li>{role}</li>\\r\\n\\t\\t\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t\\t\\t</ul>\\r\\n\\t\\t\\t\\t\\t</article>\\r\\n\\t\\t\\t\\t\\t<article class=\\"links\\">\\r\\n\\t\\t\\t\\t\\t\\t<h4>\\r\\n\\t\\t\\t\\t\\t\\t\\t<span><a href=\\"/\\">Learn more</a><Arrow direction=\\"right\\" --left-margin=\\".5em\\" /></span\\r\\n\\t\\t\\t\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t\\t</h4>\\r\\n\\t\\t\\t\\t\\t\\t<p>\\r\\n\\t\\t\\t\\t\\t\\t\\t<span\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t><a href={project.link}>Visit Site</a><Arrow\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tdirection=\\"right\\"\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t--left-margin=\\".5em\\"\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t--width-size=\\"15px\\"\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t/></span\\r\\n\\t\\t\\t\\t\\t\\t\\t>\\r\\n\\t\\t\\t\\t\\t\\t</p>\\r\\n\\t\\t\\t\\t\\t</article>\\r\\n\\t\\t\\t\\t\\t<article class=\\"progress\\">\\r\\n\\t\\t\\t\\t\\t\\t<h5>Progress</h5>\\r\\n\\t\\t\\t\\t\\t\\t<p>{project.progress}</p>\\r\\n\\t\\t\\t\\t\\t</article>\\r\\n\\t\\t\\t\\t</section>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t\\t<div class=\\"previewContainer\\">\\r\\n\\t\\t\\t<img class=\\"preview2\\" src={project.previewImage[1]} alt=\\"Screenshot\\" />\\r\\n\\t\\t\\t<img class=\\"preview1\\" src={project.previewImage[0]} alt=\\"Screenshot\\" />\\r\\n\\t\\t</div>\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">section.top {\\n  position: relative;\\n  height: 88vh;\\n  padding: 5em 120px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top {\\n    min-height: 100vh;\\n    height: 100%;\\n    padding: 160px 64px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top {\\n    height: 100%;\\n    padding: 115px 40px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top {\\n    height: 100%;\\n    padding: 115px 40px;\\n  }\\n}\\nsection.top .container {\\n  display: grid;\\n  position: relative;\\n  z-index: 5;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  grid-template-rows: auto 1fr;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .container {\\n    grid-template-columns: 1fr 1fr;\\n    grid-template-rows: auto 1fr;\\n  }\\n}\\nsection.top .container .projectNo {\\n  position: relative;\\n}\\nsection.top .container .projectNo h3 {\\n  transform: rotate(-90deg);\\n  position: absolute;\\n  top: 130px;\\n  left: -130px;\\n  font-size: 48px;\\n  letter-spacing: 0.15em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .container .projectNo h3 {\\n    top: 90px;\\n    left: -65px;\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .container .projectNo h3 {\\n    left: -40px;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .container .projectNo h3 {\\n    left: -40px;\\n    font-size: 12px;\\n  }\\n}\\nsection.top .container h2 {\\n  grid-column: 2/3;\\n  font-family: \\"harmony\\", serif;\\n  color: #3c3c3c;\\n}\\nsection.top .container h2 {\\n  font-size: 75px;\\n  line-height: 91.35px;\\n}\\n@media screen and (min-width: 1280px) {\\n  section.top .container h2 {\\n    font-size: calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));\\n    line-height: calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px);\\n  }\\n}\\n@media screen and (min-width: 1920px) {\\n  section.top .container h2 {\\n    font-size: 96px;\\n    line-height: 125.328px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .container h2 {\\n    font-size: 48px;\\n    grid-column: 1/3;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .container h2 {\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .container h2 {\\n    font-size: 24px;\\n  }\\n}\\nsection.top .content {\\n  grid-area: 2/1/3/4;\\n}\\nsection.top .content section {\\n  margin: 0 auto;\\n  margin-top: 3em;\\n  padding-left: 8em;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  grid-template-rows: 150px 150px;\\n  max-width: 1750px;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section {\\n    grid-template-columns: 1fr 1fr;\\n    grid-template-rows: auto auto auto;\\n    margin: 0 0;\\n    margin-top: 1em;\\n    padding-left: 3em;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section {\\n    margin-top: 0.2em;\\n    padding-left: 0.2em;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section {\\n    margin-top: 0.2em;\\n    padding-left: 0.2em;\\n  }\\n}\\nsection.top .content section article {\\n  height: 100px;\\n  margin-left: 2em;\\n}\\nsection.top .content section article h5 {\\n  font-family: \\"harmony\\", serif;\\n  font-size: 24px;\\n  color: #3c3c3c;\\n  margin-bottom: 0.2em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section article h5 {\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section article h5 {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section article h5 {\\n    font-size: 14px;\\n  }\\n}\\nsection.top .content section article h4 {\\n  font-family: \\"harmony\\", serif;\\n  font-size: 36px;\\n  color: #3c3c3c;\\n  margin-bottom: 0.2em;\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section article h4 {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section article h4 {\\n    font-size: 14px;\\n  }\\n}\\nsection.top .content section article p {\\n  line-height: 1.1em;\\n  max-width: 300px;\\n  color: #505050;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section article p {\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section article p {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section article p {\\n    font-size: 10px;\\n  }\\n}\\nsection.top .content section article ul li {\\n  margin-bottom: 0.3em;\\n  list-style: circle;\\n  margin-left: 1em;\\n  color: #505050;\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section article ul li {\\n    font-size: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section article ul li {\\n    font-size: 10px;\\n  }\\n}\\nsection.top .content section .links {\\n  grid-column: 1/2;\\n}\\nsection.top .content section .links span {\\n  display: flex;\\n  align-items: center;\\n}\\nsection.top .content section .links a {\\n  color: #3c3c3c;\\n}\\nsection.top .content section .links p {\\n  font-size: 18px;\\n  margin-left: 0.2em;\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .content section .links p {\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .content section .links p {\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section .links {\\n    grid-area: 2/1/3/3;\\n  }\\n}\\nsection.top .content section .progress {\\n  grid-column: 2/3;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .content section .progress {\\n    grid-area: 3/1/4/3;\\n  }\\n}\\nsection.top .previewContainer {\\n  position: absolute;\\n  overflow: hidden;\\n  width: 50vw;\\n  right: 0;\\n  bottom: 0;\\n  top: 0;\\n  z-index: 0;\\n}\\nsection.top .previewContainer img {\\n  transform: rotate(30deg);\\n  position: absolute;\\n  overflow: none;\\n  bottom: -180px;\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .previewContainer img {\\n    bottom: -60px;\\n    transform: rotate(0);\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .previewContainer img {\\n    bottom: -60px;\\n    transform: rotate(0);\\n  }\\n}\\nsection.top .previewContainer .preview1 {\\n  right: -15%;\\n  width: 70%;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .previewContainer .preview1 {\\n    width: 400px;\\n    right: -150px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .previewContainer .preview1 {\\n    width: 250px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .previewContainer .preview1 {\\n    width: 250px;\\n  }\\n}\\nsection.top .previewContainer .preview2 {\\n  right: 15%;\\n  bottom: 160px;\\n  width: 45%;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section.top .previewContainer .preview2 {\\n    width: 250px;\\n    right: 0px;\\n    bottom: 50px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section.top .previewContainer .preview2 {\\n    width: 200px;\\n    bottom: -50px;\\n    right: -60px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section.top .previewContainer .preview2 {\\n    width: 200px;\\n    bottom: -50px;\\n    right: -60px;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
};
var ProjectPreview = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { project } = $$props;
  let { no } = $$props;
  if ($$props.project === void 0 && $$bindings.project && project !== void 0)
    $$bindings.project(project);
  if ($$props.no === void 0 && $$bindings.no && no !== void 0)
    $$bindings.no(no);
  $$result.css.add(css$3);
  return `<section class="${escape(project.name) + " top svelte-wfo97f"}"><div class="${"container svelte-wfo97f"}"><h2 class="${"svelte-wfo97f"}">${escape(project.name)}</h2>
			<div class="${"content svelte-wfo97f"}"><div class="${"projectNo svelte-wfo97f"}"><h3 class="${"svelte-wfo97f"}">PROJECT-${escape(no)}</h3></div>
				<section class="${"svelte-wfo97f"}"><article class="${"svelte-wfo97f"}"><h5 class="${"svelte-wfo97f"}">About</h5>
						<p class="${"svelte-wfo97f"}">${escape(project.about)}</p></article>
					<article class="${"svelte-wfo97f"}"><h5 class="${"svelte-wfo97f"}">Role</h5>
						<ul>${each(project.role, (role) => `<li class="${"svelte-wfo97f"}">${escape(role)}</li>`)}</ul></article>
					<article class="${"links svelte-wfo97f"}"><h4 class="${"svelte-wfo97f"}"><span class="${"svelte-wfo97f"}"><a href="${"/"}" class="${"svelte-wfo97f"}">Learn more</a><div style="display: contents; --left-margin:${".5em"};">${validate_component(Arrow, "Arrow").$$render($$result, { direction: "right" }, {}, {})}</div></span></h4>
						<p class="${"svelte-wfo97f"}"><span class="${"svelte-wfo97f"}"><a${add_attribute("href", project.link, 0)} class="${"svelte-wfo97f"}">Visit Site</a><div style="display: contents; --left-margin:${".5em"}; --width-size:${"15px"};">${validate_component(Arrow, "Arrow").$$render($$result, { direction: "right" }, {}, {})}</div></span></p></article>
					<article class="${"progress svelte-wfo97f"}"><h5 class="${"svelte-wfo97f"}">Progress</h5>
						<p class="${"svelte-wfo97f"}">${escape(project.progress)}</p></article></section></div></div>
		<div class="${"previewContainer svelte-wfo97f"}"><img class="${"preview2 svelte-wfo97f"}"${add_attribute("src", project.previewImage[1], 0)} alt="${"Screenshot"}">
			<img class="${"preview1 svelte-wfo97f"}"${add_attribute("src", project.previewImage[0], 0)} alt="${"Screenshot"}"></div>
	</section>`;
});
var css$2 = {
  code: "section.svelte-11j5u5n{width:-webkit-max-content;width:-moz-max-content;width:max-content;height:100vh;margin:0 auto;padding-right:5em;padding-top:25vh}@media only screen and (max-width: 1280px){section.svelte-11j5u5n{margin:0 64px;padding-right:0;margin-top:30px;padding-top:220px}}@media only screen and (max-width: 720px){section.svelte-11j5u5n{margin:0 40px;padding-right:0;padding-top:150px;padding-bottom:100px;margin-bottom:10px}}@media only screen and (max-height: 480px){section.svelte-11j5u5n{margin:0 40px;padding-right:0;padding-top:150px;padding-bottom:100px;margin-bottom:10px}}p.svelte-11j5u5n{margin-top:5em;text-align:center}@media only screen and (max-width: 1280px){p.svelte-11j5u5n{font-size:12px;margin-top:3em}}a.svelte-11j5u5n{color:#7E5923}",
  map: `{"version":3,"file":"Ending.svelte","sources":["Ending.svelte"],"sourcesContent":["<script>\\r\\n\\timport CircleType from './CircleType.svelte';\\r\\n\\timport Footer from './Footer.svelte';\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section>\\r\\n\\t\\t<a href=\\"#top\\">\\r\\n\\t\\t\\t<CircleType\\r\\n\\t\\t\\t\\ttypeText=\\"| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL UP &ensp; || &ensp; BACK TO TOP &ensp; |\\"\\r\\n\\t\\t\\t\\ttype=\\"ending\\"\\r\\n\\t\\t\\t\\tdirection=\\"up\\"\\r\\n\\t\\t\\t/>\\r\\n\\t\\t</a>\\r\\n\\t\\t<p>I am sorry ! Your scrolling have come to an end.</p>\\r\\n\\t\\t<Footer typew=\\"ending\\" />\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">section {\\n  width: -webkit-max-content;\\n  width: -moz-max-content;\\n  width: max-content;\\n  height: 100vh;\\n  margin: 0 auto;\\n  padding-right: 5em;\\n  padding-top: 25vh;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section {\\n    margin: 0 64px;\\n    padding-right: 0;\\n    margin-top: 30px;\\n    padding-top: 220px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 150px;\\n    padding-bottom: 100px;\\n    margin-bottom: 10px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 150px;\\n    padding-bottom: 100px;\\n    margin-bottom: 10px;\\n  }\\n}\\n\\np {\\n  margin-top: 5em;\\n  text-align: center;\\n}\\n@media only screen and (max-width: 1280px) {\\n  p {\\n    font-size: 12px;\\n    margin-top: 3em;\\n  }\\n}\\n\\na {\\n  color: #7E5923;\\n}</style>\\r\\n"],"names":[],"mappings":"AAmBmB,OAAO,eAAC,CAAC,AAC1B,KAAK,CAAE,mBAAmB,CAC1B,KAAK,CAAE,gBAAgB,CACvB,KAAK,CAAE,WAAW,CAClB,MAAM,CAAE,KAAK,CACb,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,OAAO,eAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,OAAO,eAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,CAClB,cAAc,CAAE,KAAK,CACrB,aAAa,CAAE,IAAI,AACrB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,OAAO,eAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,CAClB,cAAc,CAAE,KAAK,CACrB,aAAa,CAAE,IAAI,AACrB,CAAC,AACH,CAAC,AAED,CAAC,eAAC,CAAC,AACD,UAAU,CAAE,GAAG,CACf,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,CAAC,eAAC,CAAC,AACD,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,GAAG,AACjB,CAAC,AACH,CAAC,AAED,CAAC,eAAC,CAAC,AACD,KAAK,CAAE,OAAO,AAChB,CAAC"}`
};
var Ending = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `<section class="${"svelte-11j5u5n"}"><a href="${"#top"}" class="${"svelte-11j5u5n"}">${validate_component(CircleType_1, "CircleType").$$render($$result, {
    typeText: "| \u2002 PORTFOLIO \u2002 || \u2002 SCROLL UP \u2002 || \u2002 BACK TO TOP \u2002 |",
    type: "ending",
    direction: "up"
  }, {}, {})}</a>
		<p class="${"svelte-11j5u5n"}">I am sorry ! Your scrolling have come to an end.</p>
		${validate_component(Footer, "Footer").$$render($$result, { typew: "ending" }, {}, {})}
	</section>`;
});
var css$1 = {
  code: 'main.svelte-1c5ym8i.svelte-1c5ym8i{display:grid;grid-template-columns:1.5fr 1fr;margin-top:12vh;height:100vh}@media only screen and (max-width: 1280px){main.svelte-1c5ym8i.svelte-1c5ym8i{margin-top:100px;height:100vh;grid-template-columns:1fr;grid-template-rows:1.5fr 1fr}}@media only screen and (max-width: 720px){main.svelte-1c5ym8i.svelte-1c5ym8i{margin-top:20px}}@media only screen and (max-height: 480px){main.svelte-1c5ym8i.svelte-1c5ym8i{margin-top:20px}}main.svelte-1c5ym8i .hero.svelte-1c5ym8i{margin:8vh 20px 0 120px;max-width:1000px}main.svelte-1c5ym8i .hero div.svelte-1c5ym8i{margin-top:10px;display:flex;align-items:center;font-size:24px;color:#505050;letter-spacing:0.15em}@media only screen and (max-width: 1280px){main.svelte-1c5ym8i .hero div.svelte-1c5ym8i{margin-top:10px;font-size:18px}}@media only screen and (max-width: 720px){main.svelte-1c5ym8i .hero div.svelte-1c5ym8i{margin-top:5px;font-size:14px}}@media only screen and (max-height: 480px){main.svelte-1c5ym8i .hero div.svelte-1c5ym8i{margin-top:5px;font-size:14px}}@media only screen and (max-width: 1280px){main.svelte-1c5ym8i .hero.svelte-1c5ym8i{max-width:500px;margin:100px 20px 20px 64px}}@media only screen and (max-width: 720px){main.svelte-1c5ym8i .hero.svelte-1c5ym8i{max-width:250px;margin:100px 10px 10px 40px}}@media only screen and (max-height: 480px){main.svelte-1c5ym8i .hero.svelte-1c5ym8i{max-width:250px;margin:100px 10px 10px 40px}}main.svelte-1c5ym8i .hero-illu.svelte-1c5ym8i{position:absolute;width:35%;top:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 2fr 2fr}@media only screen and (max-width: 1280px){main.svelte-1c5ym8i .hero-illu.svelte-1c5ym8i{opacity:30%;top:auto;bottom:0;right:0;width:100%;height:40%;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr}}main.svelte-1c5ym8i .hero-illu div.svelte-1c5ym8i{border-top:1px solid #d1d1d1;border-left:1px solid #d1d1d1}h1.svelte-1c5ym8i.svelte-1c5ym8i{font-family:"harmony", serif;line-height:119px;letter-spacing:0.015em;color:#3c3c3c}h1.svelte-1c5ym8i.svelte-1c5ym8i{font-size:75px;line-height:91.35px}@media screen and (min-width: 1280px){h1.svelte-1c5ym8i.svelte-1c5ym8i{font-size:calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));line-height:calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px)}}@media screen and (min-width: 1920px){h1.svelte-1c5ym8i.svelte-1c5ym8i{font-size:96px;line-height:125.328px}}@media only screen and (max-width: 1280px){h1.svelte-1c5ym8i.svelte-1c5ym8i{font-size:48px;line-height:60px}}@media only screen and (max-width: 720px){h1.svelte-1c5ym8i.svelte-1c5ym8i{font-size:24px;line-height:30px}}@media only screen and (max-height: 480px){h1.svelte-1c5ym8i.svelte-1c5ym8i{font-size:24px;line-height:30px}}',
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script>\\n\\timport Star from '../svg/star.svelte';\\n\\timport Flower from '../svg/flower.svelte';\\n\\timport Loader from '../components/Loader.svelte';\\n\\timport Footer from '../components/Footer.svelte';\\n\\timport CircleType from '../components/CircleType.svelte';\\n\\timport { projects } from '../Projects/ProjectDetails';\\n\\timport { onMount } from 'svelte';\\n\\timport ProjectPreview from '../components/ProjectPreview.svelte';\\n\\timport Ending from '../components/Ending.svelte';\\n\\tlet loader = '';\\n\\tlet content = 'hide';\\n\\tonMount(() => {\\n\\t\\tloader = 'hide';\\n\\t\\tcontent = '';\\n\\t});\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>Gautham Krishna - Portfolio - Home</title>\\n</svelte:head>\\n\\n\\n\\t<Loader {loader} />\\n\\t<Footer />\\n\\t<CircleType\\n\\t\\ttypeText=\\"| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL DOWN &ensp; || &ensp; MY WORKS &ensp; |\\"\\n\\t/>\\n\\t<main class={content}>\\n\\t\\t<div class=\\"hero\\">\\n\\t\\t\\t<h1>Whatever the problem, being part of the solution.</h1>\\n\\t\\t\\t<div>\\n\\t\\t\\t\\t<span>Designer</span>\\n\\t\\t\\t\\t<Star />\\n\\t\\t\\t\\t<span>Developer</span>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t\\t<div class=\\"hero-illu\\">\\n\\t\\t\\t<div />\\n\\t\\t\\t<div />\\n\\t\\t\\t<div />\\n\\t\\t\\t<div />\\n\\t\\t\\t<div />\\n\\t\\t\\t<div />\\n\\t\\t\\t<div />\\n\\t\\t\\t<div />\\n\\t\\t\\t<div />\\n\\t\\t</div>\\n\\t\\t<Flower />\\n\\t</main>\\n\\t<ProjectPreview project={projects[0]} no={1} />\\n\\t<Ending />\\n\\n\\n<style lang=\\"scss\\">main {\\n  display: grid;\\n  grid-template-columns: 1.5fr 1fr;\\n  margin-top: 12vh;\\n  height: 100vh;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main {\\n    margin-top: 100px;\\n    height: 100vh;\\n    grid-template-columns: 1fr;\\n    grid-template-rows: 1.5fr 1fr;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main {\\n    margin-top: 20px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main {\\n    margin-top: 20px;\\n  }\\n}\\nmain .hero {\\n  margin: 8vh 20px 0 120px;\\n  max-width: 1000px;\\n}\\nmain .hero div {\\n  margin-top: 10px;\\n  display: flex;\\n  align-items: center;\\n  font-size: 24px;\\n  color: #505050;\\n  letter-spacing: 0.15em;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero div {\\n    margin-top: 10px;\\n    font-size: 18px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main .hero div {\\n    margin-top: 5px;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .hero div {\\n    margin-top: 5px;\\n    font-size: 14px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero {\\n    max-width: 500px;\\n    margin: 100px 20px 20px 64px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  main .hero {\\n    max-width: 250px;\\n    margin: 100px 10px 10px 40px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  main .hero {\\n    max-width: 250px;\\n    margin: 100px 10px 10px 40px;\\n  }\\n}\\nmain .hero-illu {\\n  position: absolute;\\n  width: 35%;\\n  top: 0;\\n  right: 0;\\n  bottom: 0;\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n  grid-template-rows: 1fr 2fr 2fr;\\n}\\n@media only screen and (max-width: 1280px) {\\n  main .hero-illu {\\n    opacity: 30%;\\n    top: auto;\\n    bottom: 0;\\n    right: 0;\\n    width: 100%;\\n    height: 40%;\\n    grid-template-columns: 1fr 1fr 1fr;\\n    grid-template-rows: 1fr 1fr;\\n  }\\n}\\nmain .hero-illu div {\\n  border-top: 1px solid #d1d1d1;\\n  border-left: 1px solid #d1d1d1;\\n}\\n\\nh1 {\\n  font-family: \\"harmony\\", serif;\\n  line-height: 119px;\\n  letter-spacing: 0.015em;\\n  color: #3c3c3c;\\n}\\nh1 {\\n  font-size: 75px;\\n  line-height: 91.35px;\\n}\\n@media screen and (min-width: 1280px) {\\n  h1 {\\n    font-size: calc(75px + strip-unit(21px) * ((100vw - 1280px) / strip-unit(640px)));\\n    line-height: calc(75px + strip-unit(21px) * 1.618 * ((100vw - 1280px) / strip-unit(640px))- 30px);\\n  }\\n}\\n@media screen and (min-width: 1920px) {\\n  h1 {\\n    font-size: 96px;\\n    line-height: 125.328px;\\n  }\\n}\\n@media only screen and (max-width: 1280px) {\\n  h1 {\\n    font-size: 48px;\\n    line-height: 60px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h1 {\\n    font-size: 24px;\\n    line-height: 30px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h1 {\\n    font-size: 24px;\\n    line-height: 30px;\\n  }\\n}</style>\\n"],"names":[],"mappings":"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"}`
};
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let loader = "";
  let content = "hide";
  $$result.css.add(css$1);
  return `${$$result.head += `${$$result.title = `<title>Gautham Krishna - Portfolio - Home</title>`, ""}`, ""}


	${validate_component(Loader, "Loader").$$render($$result, { loader }, {}, {})}
	${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}
	${validate_component(CircleType_1, "CircleType").$$render($$result, {
    typeText: "| \u2002 PORTFOLIO \u2002 || \u2002 SCROLL DOWN \u2002 || \u2002 MY WORKS \u2002 |"
  }, {}, {})}
	<main class="${escape(null_to_empty(content)) + " svelte-1c5ym8i"}"><div class="${"hero svelte-1c5ym8i"}"><h1 class="${"svelte-1c5ym8i"}">Whatever the problem, being part of the solution.</h1>
			<div class="${"svelte-1c5ym8i"}"><span>Designer</span>
				${validate_component(Star, "Star").$$render($$result, {}, {}, {})}
				<span>Developer</span></div></div>
		<div class="${"hero-illu svelte-1c5ym8i"}"><div class="${"svelte-1c5ym8i"}"></div>
			<div class="${"svelte-1c5ym8i"}"></div>
			<div class="${"svelte-1c5ym8i"}"></div>
			<div class="${"svelte-1c5ym8i"}"></div>
			<div class="${"svelte-1c5ym8i"}"></div>
			<div class="${"svelte-1c5ym8i"}"></div>
			<div class="${"svelte-1c5ym8i"}"></div>
			<div class="${"svelte-1c5ym8i"}"></div>
			<div class="${"svelte-1c5ym8i"}"></div></div>
		${validate_component(Flower, "Flower").$$render($$result, {}, {}, {})}</main>
	${validate_component(ProjectPreview, "ProjectPreview").$$render($$result, { project: projects[0], no: 1 }, {}, {})}
	${validate_component(Ending, "Ending").$$render($$result, {}, {}, {})}`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
var css = {
  code: 'section.svelte-56tbx6{padding-top:25vh;text-align:center;font-size:18px;padding-right:5em;width:-webkit-max-content;width:-moz-max-content;width:max-content;margin:0 auto}@media only screen and (max-width: 1280px){section.svelte-56tbx6{text-align:left;margin:0 64px;padding-right:0;padding-top:220px;font-size:12px}}@media only screen and (max-width: 720px){section.svelte-56tbx6{margin:0 40px;padding-right:0;padding-top:130px}}@media only screen and (max-height: 480px){section.svelte-56tbx6{margin:0 40px;padding-right:0;padding-top:130px}}h1.svelte-56tbx6{position:relative;z-index:30;margin-top:0.5em;font-family:"harmony", serif;font-size:96px;cursor:pointer;transition:all 0.15s ease-in}h1.svelte-56tbx6:hover{color:#7E5923}@media only screen and (max-width: 1280px){h1.svelte-56tbx6{margin:0 auto;margin-top:1em;font-size:48px}}@media only screen and (max-width: 720px){h1.svelte-56tbx6{margin:0 auto;margin-top:0.5em;font-size:24px}}@media only screen and (max-height: 480px){h1.svelte-56tbx6{margin:0 auto;margin-top:0.5em;font-size:24px}}',
  map: `{"version":3,"file":"contact.svelte","sources":["contact.svelte"],"sourcesContent":["<script>\\r\\n\\timport Flower from '../svg/flower.svelte';\\r\\n\\timport Footer from '../components/Footer.svelte';\\r\\n\\tlet mail = '8.gautham@pm.me';\\r\\n\\tconst copyMail = () => {\\r\\n\\t\\tmail = 'Mail ID Copied !';\\r\\n\\t\\twindow.open('mailto:8.gautham@pm.me', '_top');\\r\\n\\t\\tsetTimeout(() => {\\r\\n\\t\\t\\tmail = '8.gautham@pm.me';\\r\\n\\t\\t\\tvar r = document.createRange();\\r\\n\\t\\t\\tr.selectNode(document.getElementById('mail'));\\r\\n\\t\\t\\twindow.getSelection().removeAllRanges();\\r\\n\\t\\t\\twindow.getSelection().addRange(r);\\r\\n\\t\\t\\tdocument.execCommand('copy');\\r\\n\\t\\t\\twindow.getSelection().removeAllRanges();\\r\\n\\t\\t}, 2000);\\r\\n\\t};\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\t<section>\\r\\n\\t\\t<span>I would love to hear from you ! </span>\\r\\n\\t\\t<h1 title=\\"\u{1F4E7} Open Mail Client / Copy Text\\" on:click={() => copyMail()} id=\\"mail\\">\\r\\n\\t\\t\\t{mail}\\r\\n\\t\\t</h1>\\r\\n\\t\\t<Footer typew=\\"ending\\" />\\r\\n\\t\\t<Flower type=\\"back\\" />\\r\\n\\t</section>\\r\\n\\r\\n\\r\\n<style lang=\\"scss\\">section {\\n  padding-top: 25vh;\\n  text-align: center;\\n  font-size: 18px;\\n  padding-right: 5em;\\n  width: -webkit-max-content;\\n  width: -moz-max-content;\\n  width: max-content;\\n  margin: 0 auto;\\n}\\n@media only screen and (max-width: 1280px) {\\n  section {\\n    text-align: left;\\n    margin: 0 64px;\\n    padding-right: 0;\\n    padding-top: 220px;\\n    font-size: 12px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 130px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  section {\\n    margin: 0 40px;\\n    padding-right: 0;\\n    padding-top: 130px;\\n  }\\n}\\n\\nh1 {\\n  position: relative;\\n  z-index: 30;\\n  margin-top: 0.5em;\\n  font-family: \\"harmony\\", serif;\\n  font-size: 96px;\\n  cursor: pointer;\\n  transition: all 0.15s ease-in;\\n}\\nh1:hover {\\n  color: #7E5923;\\n}\\n@media only screen and (max-width: 1280px) {\\n  h1 {\\n    margin: 0 auto;\\n    margin-top: 1em;\\n    font-size: 48px;\\n  }\\n}\\n@media only screen and (max-width: 720px) {\\n  h1 {\\n    margin: 0 auto;\\n    margin-top: 0.5em;\\n    font-size: 24px;\\n  }\\n}\\n@media only screen and (max-height: 480px) {\\n  h1 {\\n    margin: 0 auto;\\n    margin-top: 0.5em;\\n    font-size: 24px;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"AA8BmB,OAAO,cAAC,CAAC,AAC1B,WAAW,CAAE,IAAI,CACjB,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,IAAI,CACf,aAAa,CAAE,GAAG,CAClB,KAAK,CAAE,mBAAmB,CAC1B,KAAK,CAAE,gBAAgB,CACvB,KAAK,CAAE,WAAW,CAClB,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,OAAO,cAAC,CAAC,AACP,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,CAClB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,OAAO,cAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,OAAO,cAAC,CAAC,AACP,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,aAAa,CAAE,CAAC,CAChB,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC,AAED,EAAE,cAAC,CAAC,AACF,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,SAAS,CAAC,CAAC,KAAK,CAC7B,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AAC/B,CAAC,AACD,gBAAE,MAAM,AAAC,CAAC,AACR,KAAK,CAAE,OAAO,AAChB,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1C,EAAE,cAAC,CAAC,AACF,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,GAAG,CACf,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,EAAE,cAAC,CAAC,AACF,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,aAAa,KAAK,CAAC,AAAC,CAAC,AAC1C,EAAE,cAAC,CAAC,AACF,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,IAAI,AACjB,CAAC,AACH,CAAC"}`
};
var Contact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let mail = "8.gautham@pm.me";
  $$result.css.add(css);
  return `<section class="${"svelte-56tbx6"}"><span>I would love to hear from you ! </span>
		<h1 title="${"\u{1F4E7} Open Mail Client / Copy Text"}" id="${"mail"}" class="${"svelte-56tbx6"}">${escape(mail)}</h1>
		${validate_component(Footer, "Footer").$$render($$result, { typew: "ending" }, {}, {})}
		${validate_component(Flower, "Flower").$$render($$result, { type: "back" }, {}, {})}
	</section>`;
});
var contact = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Contact
});
var About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var about = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About
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
 * circletype 2.3.0
 * A JavaScript library that lets you curve type on the web.
 * Copyright © 2014-2018 Peter Hrynkow
 * Licensed MIT
 * https://github.com/peterhry/CircleType#readme
 */
