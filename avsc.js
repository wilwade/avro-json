function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			var isInstance = false;
      try {
        isInstance = this instanceof a;
      } catch {}
			if (isInstance) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var _polyfillNode_crypto = {};

var _polyfillNode_crypto$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: _polyfillNode_crypto
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_crypto$1);

var platform;
var hasRequiredPlatform;

function requirePlatform () {
	if (hasRequiredPlatform) return platform;
	hasRequiredPlatform = 1;
	let crypto = require$$0;

	/**
	 * Compute a string's hash.
	 *
	 * @param str {String} The string to hash.
	 * @param algorithm {String} The algorithm used. Defaults to MD5.
	 */
	function getHash(str, algorithm) {
	  algorithm = algorithm || 'md5';
	  let hash = crypto.createHash(algorithm);
	  hash.end(str);
	  let buf = hash.read();
	  return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
	}

	platform = {
	  getHash,
	};
	return platform;
}

var utils;
var hasRequiredUtils;

function requireUtils () {
	if (hasRequiredUtils) return utils;
	hasRequiredUtils = 1;

	/** Various utilities used across this library. */

	let platform = requirePlatform();

	// Valid (field, type, and symbol) name regex.
	const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

	function isBufferLike(data) {
	  return (data instanceof Uint8Array);
	}

	/**
	 * Uppercase the first letter of a string.
	 *
	 * @param s {String} The string.
	 */
	function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

	/**
	 * Compare two numbers.
	 *
	 * @param n1 {Number} The first one.
	 * @param n2 {Number} The second one.
	 */
	function compare(n1, n2) { return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1); }

	let bufCompare, bufEqual;
	if (typeof Buffer == 'function') {
	  bufCompare = Buffer.compare;
	  bufEqual = function(buf1, buf2) {
	    return Buffer.prototype.equals.call(buf1, buf2);
	  };
	} else {
	  bufCompare = function(buf1, buf2) {
	    if (buf1 === buf2) {
	      return 0;
	    }
	    let len = Math.min(buf1.length, buf2.length);
	    for (let i = 0; i < len; i++) {
	      if (buf1[i] !== buf2[i]) {
	        return Math.sign(buf1[i] - buf2[i]);
	      }
	    }
	    return Math.sign(buf1.length - buf2.length);
	  };
	  bufEqual = function(buf1, buf2) {
	    if (buf1.length !== buf2.length) {
	      return false;
	    }
	    return bufCompare(buf1, buf2) === 0;
	  };
	}

	/**
	 * Get option or default if undefined.
	 *
	 * @param opts {Object} Options.
	 * @param key {String} Name of the option.
	 * @param def {...} Default value.
	 *
	 * This is useful mostly for true-ish defaults and false-ish values (where the
	 * usual `||` idiom breaks down).
	 */
	function getOption(opts, key, def) {
	  let value = opts[key];
	  return value === undefined ? def : value;
	}

	/**
	 * Find index of value in array.
	 *
	 * @param arr {Array} Can also be a false-ish value.
	 * @param v {Object} Value to find.
	 *
	 * Returns -1 if not found, -2 if found multiple times.
	 */
	function singleIndexOf(arr, v) {
	  let pos = -1;
	  if (!arr) {
	    return -1;
	  }
	  for (let i = 0, l = arr.length; i < l; i++) {
	    if (arr[i] === v) {
	      if (pos >= 0) {
	        return -2;
	      }
	      pos = i;
	    }
	  }
	  return pos;
	}

	/**
	 * Convert array to map.
	 *
	 * @param arr {Array} Elements.
	 * @param fn {Function} Function returning an element's key.
	 */
	function toMap(arr, fn) {
	  let obj = {};
	  for (let i = 0; i < arr.length; i++) {
	    let elem = arr[i];
	    obj[fn(elem)] = elem;
	  }
	  return obj;
	}

	/**
	 * Convert map to array of values (polyfill for `Object.values`).
	 *
	 * @param obj {Object} Map.
	 */
	function objectValues(obj) {
	  return Object.keys(obj).map((key) => { return obj[key]; });
	}

	/**
	 * Check whether an array has duplicates.
	 *
	 * @param arr {Array} The array.
	 * @param fn {Function} Optional function to apply to each element.
	 */
	function hasDuplicates(arr, fn) {
	  let obj = Object.create(null);
	  for (let i = 0, l = arr.length; i < l; i++) {
	    let elem = arr[i];
	    if (fn) {
	      elem = fn(elem);
	    }
	    if (obj[elem]) {
	      return true;
	    }
	    obj[elem] = true;
	  }
	  return false;
	}

	/**
	 * Copy properties from one object to another.
	 *
	 * @param src {Object} The source object.
	 * @param dst {Object} The destination object.
	 * @param overwrite {Boolean} Whether to overwrite existing destination
	 * properties. Defaults to false.
	 */
	function copyOwnProperties(src, dst, overwrite) {
	  let names = Object.getOwnPropertyNames(src);
	  for (let i = 0, l = names.length; i < l; i++) {
	    let name = names[i];
	    if (!Object.prototype.hasOwnProperty.call(dst, name) || overwrite) {
	      let descriptor = Object.getOwnPropertyDescriptor(src, name);
	      Object.defineProperty(dst, name, descriptor);
	    }
	  }
	  return dst;
	}

	/**
	 * Check whether a string is a valid Avro identifier.
	 */
	function isValidName(str) { return NAME_PATTERN.test(str); }

	/**
	 * Verify and return fully qualified name.
	 *
	 * @param name {String} Full or short name. It can be prefixed with a dot to
	 * force global namespace.
	 * @param namespace {String} Optional namespace.
	 */
	function qualify(name, namespace) {
	  if (~name.indexOf('.')) {
	    name = name.replace(/^\./, ''); // Allow absolute referencing.
	  } else if (namespace) {
	    name = namespace + '.' + name;
	  }
	  name.split('.').forEach((part) => {
	    if (!isValidName(part)) {
	      throw new Error(`invalid name: ${printJSON(name)}`);
	    }
	  });
	  return name;
	}

	/**
	 * Remove namespace from a name.
	 *
	 * @param name {String} Full or short name.
	 */
	function unqualify(name) {
	  let parts = name.split('.');
	  return parts[parts.length - 1];
	}

	/**
	 * Return the namespace implied by a name.
	 *
	 * @param name {String} Full or short name. If short, the returned namespace
	 *  will be empty.
	 */
	function impliedNamespace(name) {
	  let match = /^(.*)\.[^.]+$/.exec(name);
	  return match ? match[1] : undefined;
	}

	/**
	 * Returns offset in the string of the end of JSON object (-1 if past the end).
	 *
	 * To keep the implementation simple, this function isn't a JSON validator. It
	 * will gladly return a result for invalid JSON (which is OK since that will be
	 * promptly rejected by the JSON parser). What matters is that it is guaranteed
	 * to return the correct end when presented with valid JSON.
	 *
	 * @param str {String} Input string containing serialized JSON..
	 * @param pos {Number} Starting position.
	 */
	function jsonEnd(str, pos) {
	  pos = pos | 0;

	  // Handle the case of a simple literal separately.
	  let c = str.charAt(pos++);
	  if (/[\d-]/.test(c)) {
	    while (/[eE\d.+-]/.test(str.charAt(pos))) {
	      pos++;
	    }
	    return pos;
	  } else if (/true|null/.test(str.slice(pos - 1, pos + 3))) {
	    return pos + 3;
	  } else if (/false/.test(str.slice(pos - 1, pos + 4))) {
	    return pos + 4;
	  }

	  // String, object, or array.
	  let depth = 0;
	  let literal = false;
	  do {
	    switch (c) {
	      case '{':
	      case '[':
	        if (!literal) { depth++; }
	        break;
	      case '}':
	      case ']':
	        if (!literal && !--depth) {
	          return pos;
	        }
	        break;
	      case '"':
	        literal = !literal;
	        if (!depth && !literal) {
	          return pos;
	        }
	        break;
	      case '\\':
	        pos++; // Skip the next character.
	    }
	  } while ((c = str.charAt(pos++)));

	  return -1;
	}

	/** "Abstract" function to help with "subclassing". */
	function abstractFunction() { throw new Error('abstract'); }

	/**
	 * Generator of random things.
	 *
	 * Inspired by: http://stackoverflow.com/a/424445/1062617
	 */
	class Lcg {
	  constructor (seed) {
	    let a = 1103515245;
	    let c = 12345;
	    let m = Math.pow(2, 31);
	    let state = Math.floor(seed || Math.random() * (m - 1));

	    this._max = m;
	    this._nextInt = function () {
	      state = (a * state + c) % m;
	      return state;
	    };
	  }

	  nextBoolean () {
	    return !!(this._nextInt() % 2);
	  }

	  nextInt (start, end) {
	    if (end === undefined) {
	      end = start;
	      start = 0;
	    }
	    end = end === undefined ? this._max : end;
	    return start + Math.floor(this.nextFloat() * (end - start));
	  }

	  nextFloat (start, end) {
	    if (end === undefined) {
	      end = start;
	      start = 0;
	    }
	    end = end === undefined ? 1 : end;
	    return start + (end - start) * this._nextInt() / this._max;
	  }

	  nextString(len, flags) {
	    len |= 0;
	    flags = flags || 'aA';
	    let mask = '';
	    if (flags.indexOf('a') > -1) {
	      mask += 'abcdefghijklmnopqrstuvwxyz';
	    }
	    if (flags.indexOf('A') > -1) {
	      mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	    }
	    if (flags.indexOf('#') > -1) {
	      mask += '0123456789';
	    }
	    if (flags.indexOf('!') > -1) {
	      mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
	    }
	    let result = [];
	    for (let i = 0; i < len; i++) {
	      result.push(this.choice(mask));
	    }
	    return result.join('');
	  }

	  nextBuffer (len) {
	    let arr = new Uint8Array(len);
	    for (let i = 0; i < len; i++) {
	      arr[i] = this.nextInt(256);
	    }
	    return arr;
	  }

	  choice (arr) {
	    let len = arr.length;
	    if (!len) {
	      throw new Error('choosing from empty array');
	    }
	    return arr[this.nextInt(len)];
	  }
	}

	/**
	 * Ordered queue which returns items consecutively.
	 *
	 * This is actually a heap by index, with the added requirements that elements
	 * can only be retrieved consecutively.
	 */
	class OrderedQueue {
	  constructor () {
	    this._index = 0;
	    this._items = [];
	  }

	  push (item) {
	    let items = this._items;
	    let i = items.length | 0;
	    let j;
	    items.push(item);
	    while (i > 0 && items[i].index < items[j = ((i - 1) >> 1)].index) {
	      item = items[i];
	      items[i] = items[j];
	      items[j] = item;
	      i = j;
	    }
	  }

	  pop () {
	    let items = this._items;
	    let len = (items.length - 1) | 0;
	    let first = items[0];
	    if (!first || first.index > this._index) {
	      return null;
	    }
	    this._index++;
	    if (!len) {
	      items.pop();
	      return first;
	    }
	    items[0] = items.pop();
	    let mid = len >> 1;
	    let i = 0;
	    let i1, i2, j, item, c, c1, c2;
	    while (i < mid) {
	      item = items[i];
	      i1 = (i << 1) + 1;
	      i2 = (i + 1) << 1;
	      c1 = items[i1];
	      c2 = items[i2];
	      if (!c2 || c1.index <= c2.index) {
	        c = c1;
	        j = i1;
	      } else {
	        c = c2;
	        j = i2;
	      }
	      if (c.index >= item.index) {
	        break;
	      }
	      items[j] = item;
	      items[i] = c;
	      i = j;
	    }
	    return first;
	  }
	}

	let decodeSlice;
	if (typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function') {
	  // Note that calling `Buffer.prototype.toString.call(buf, 'utf-8')` on a
	  // `Uint8Array` throws because Node's internal implementation expects the
	  // argument to be a `Buffer` specifically.
	  decodeSlice = Function.prototype.call.bind(Buffer.prototype.utf8Slice);
	} else {
	  const DECODER = new TextDecoder();

	  decodeSlice = function(arr, start, end) {
	    return DECODER.decode(arr.subarray(start, end));
	  };
	}

	const ENCODER = new TextEncoder();
	const encodeBuf = new Uint8Array(4096);
	const encodeBufs = [];

	function encodeSlice(str) {
	  const {read, written} = ENCODER.encodeInto(str, encodeBuf);
	  if (read === str.length) {
	    // Believe it or not, `subarray` is actually quite expensive. To avoid the
	    // cost, we cache and reuse `subarray`s.
	    if (!encodeBufs[written]) {
	      encodeBufs[written] = encodeBuf.subarray(0, written);
	    }
	    return encodeBufs[written];
	  }

	  return ENCODER.encode(str);
	}

	let utf8Length;
	if (typeof Buffer === 'function') {
	  utf8Length = Buffer.byteLength;
	} else {
	  utf8Length = function(str) {
	    let len = 0;
	    for (;;) {
	      // encodeInto is faster than any manual implementation (or even
	      // Buffer.byteLength), provided the string fits entirely within the
	      // buffer. Past that, it slows down but is still faster than other
	      // options.
	      const {read, written} = ENCODER.encodeInto(str, encodeBuf);
	      len += written;
	      if (read === str.length) break;
	      str = str.slice(read);
	    }
	    return len;
	  };
	}

	let bufferToBinaryString;
	if (typeof Buffer === 'function' && typeof Buffer.prototype.latin1Slice === 'function') {
	  // Note that calling `Buffer.prototype.toString.call(buf, 'binary')` on a
	  // `Uint8Array` throws because Node's internal implementation expects the
	  // argument to be a `Buffer` specifically.
	  bufferToBinaryString = Function.prototype.call.bind(
	    Buffer.prototype.latin1Slice);
	} else {
	  bufferToBinaryString = function(buf) {
	    let str = '';
	    let i = 0, len = buf.length;
	    for (; i + 7 < len; i += 8) {
	      str += String.fromCharCode(
	        buf[i],
	        buf[i + 1],
	        buf[i + 2],
	        buf[i + 3],
	        buf[i + 4],
	        buf[i + 5],
	        buf[i + 6],
	        buf[i + 7]
	      );
	    }
	    for (; i < len; i++) {
	      str += String.fromCharCode(buf[i]);
	    }
	    return str;
	  };
	}

	let binaryStringToBuffer;
	if (typeof Buffer === 'function') {
	  binaryStringToBuffer = function(str) {
	    let buf = Buffer.from(str, 'binary');
	    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
	  };
	} else {
	  binaryStringToBuffer = function(str) {
	    let buf = new Uint8Array(str.length);
	    for (let i = 0; i < str.length; i++) {
	      buf[i] = str.charCodeAt(i);
	    }
	    return Buffer.from(buf);
	  };
	}

	// Having multiple views into the same buffer seems to massively decrease read
	// performance. To read and write float and double types, copy them to and from
	// this data view instead.
	const FLOAT_VIEW = new DataView(new ArrayBuffer(8));

	/**
	 * A tap is a buffer which remembers what has been already read.
	 *
	 * It is optimized for performance, at the cost of failing silently when
	 * overflowing the buffer. This is a purposeful trade-off given the expected
	 * rarity of this case and the large performance hit necessary to enforce
	 * validity. See `isValid` below for more information.
	 */
	class Tap {
	  constructor (buf, pos) {
	    this.setData(buf, pos);
	  }

	  setData (buf, pos) {
	    if (typeof Buffer === 'function' && buf instanceof Buffer) {
	      buf = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
	    }
	    this.arr = buf;
	    this.pos = pos | 0;
	    if (this.pos < 0) {
	      throw new Error('negative offset');
	    }
	  }

	  get length() {
	    return this.arr.length;
	  }

	  reinitialize (capacity) {
	    this.setData(new Uint8Array(capacity));
	  }

	  static fromBuffer (buf, pos) {
	    return new Tap(buf, pos);
	  }

	  static withCapacity (capacity) {
	    let buf = new Uint8Array(capacity);
	    return new Tap(buf);
	  }

	  toBuffer () {
	    return this.arr.slice(0, this.pos);
	  }

	  subarray (start, end) {
	    return this.arr.subarray(start, end);
	  }

	  append (newBuf) {
	    const newArr = new Uint8Array(this.arr.length + newBuf.length);
	    newArr.set(this.arr, 0);
	    newArr.set(newBuf, this.arr.length);
	    this.setData(newArr, 0);
	  }

	  forward (newBuf) {
	    const subArr = this.arr.subarray(this.pos);
	    const newArr = new Uint8Array(subArr.length + newBuf.length);
	    newArr.set(subArr, 0);
	    newArr.set(newBuf, subArr.length);
	    this.setData(newArr, 0);
	  }

	  /**
	   * Check that the tap is in a valid state.
	   *
	   * For efficiency reasons, none of the methods below will fail if an overflow
	   * occurs (either read, skip, or write). For this reason, it is up to the
	   * caller to always check that the read, skip, or write was valid by calling
	   * this method.
	   */
	  isValid () { return this.pos <= this.arr.length; }

	  _invalidate () { this.pos = this.arr.length + 1; }

	  // Read, skip, write methods.
	  //
	  // These should fail silently when the buffer overflows. Note this is only
	  // required to be true when the functions are decoding valid objects. For
	  // example errors will still be thrown if a bad count is read, leading to a
	  // negative position offset (which will typically cause a failure in
	  // `readFixed`).

	  readBoolean () { return !!this.arr[this.pos++]; }

	  skipBoolean () { this.pos++; }

	  writeBoolean (b) { this.arr[this.pos++] = !!b; }

	  readLong () {
	    let n = 0;
	    let k = 0;
	    let buf = this.arr;
	    let b, h, f, fk;

	    do {
	      b = buf[this.pos++];
	      h = b & 0x80;
	      n |= (b & 0x7f) << k;
	      k += 7;
	    } while (h && k < 28);

	    if (h) {
	      // Switch to float arithmetic, otherwise we might overflow.
	      f = n;
	      fk = 268435456; // 2 ** 28.
	      do {
	        b = buf[this.pos++];
	        f += (b & 0x7f) * fk;
	        fk *= 128;
	      } while (b & 0x80);
	      return (f % 2 ? -(f + 1) : f) / 2;
	    }

	    return (n >> 1) ^ -(n & 1);
	  }

	  skipLong () {
	    let buf = this.arr;
	    while (buf[this.pos++] & 0x80) {}
	  }

	  writeLong (n) {
	    let buf = this.arr;
	    let f, m;

	    if (n >= -1073741824 && n < 1073741824) {
	      // Won't overflow, we can use integer arithmetic.
	      m = n >= 0 ? n << 1 : (~n << 1) | 1;
	      do {
	        buf[this.pos] = m & 0x7f;
	        m >>= 7;
	      } while (m && (buf[this.pos++] |= 0x80));
	    } else {
	      // We have to use slower floating arithmetic.
	      f = n >= 0 ? n * 2 : (-n * 2) - 1;
	      do {
	        buf[this.pos] = f & 0x7f;
	        f /= 128;
	      } while (f >= 1 && (buf[this.pos++] |= 0x80));
	    }
	    this.pos++;
	  }

	  readFloat () {
	    let pos = this.pos;
	    this.pos += 4;
	    if (this.pos > this.arr.length) {
	      return 0;
	    }
	    FLOAT_VIEW.setUint32(
	      0,
	      this.arr[pos] |
	      (this.arr[pos + 1] << 8) |
	      (this.arr[pos + 2] << 16) |
	      (this.arr[pos + 3] << 24),
	      true);
	    return FLOAT_VIEW.getFloat32(0, true);
	  }

	  skipFloat () { this.pos += 4; }

	  writeFloat (f) {
	    let pos = this.pos;
	    this.pos += 4;
	    if (this.pos > this.arr.length) {
	      return;
	    }

	    FLOAT_VIEW.setFloat32(0, f, true);
	    const n = FLOAT_VIEW.getUint32(0, true);
	    this.arr[pos] = n & 0xff;
	    this.arr[pos + 1] = (n >> 8) & 0xff;
	    this.arr[pos + 2] = (n >> 16) & 0xff;
	    this.arr[pos + 3] = n >> 24;
	  }

	  readDouble () {
	    let pos = this.pos;
	    this.pos += 8;
	    if (this.pos > this.arr.length) {
	      return 0;
	    }
	    FLOAT_VIEW.setUint32(
	      0,
	      this.arr[pos] |
	      (this.arr[pos + 1] << 8) |
	      (this.arr[pos + 2] << 16) |
	      (this.arr[pos + 3] << 24),
	      true
	    );
	    FLOAT_VIEW.setUint32(
	      4,
	      this.arr[pos + 4] |
	      (this.arr[pos + 5] << 8) |
	      (this.arr[pos + 6] << 16) |
	      (this.arr[pos + 7] << 24),
	      true
	    );
	    return FLOAT_VIEW.getFloat64(0, true);
	  }

	  skipDouble () { this.pos += 8; }

	  writeDouble (d) {
	    let pos = this.pos;
	    this.pos += 8;
	    if (this.pos > this.arr.length) {
	      return;
	    }
	    FLOAT_VIEW.setFloat64(0, d, true);
	    const a = FLOAT_VIEW.getUint32(0, true);
	    const b = FLOAT_VIEW.getUint32(4, true);
	    this.arr[pos] = a & 0xff;
	    this.arr[pos + 1] = (a >> 8) & 0xff;
	    this.arr[pos + 2] = (a >> 16) & 0xff;
	    this.arr[pos + 3] = a >> 24;
	    this.arr[pos + 4] = b & 0xff;
	    this.arr[pos + 5] = (b >> 8) & 0xff;
	    this.arr[pos + 6] = (b >> 16) & 0xff;
	    this.arr[pos + 7] = b >> 24;
	  }

	  readFixed (len) {
	    let pos = this.pos;
	    this.pos += len;
	    if (this.pos > this.arr.length) {
	      return;
	    }
	    return this.arr.slice(pos, pos + len);
	  }

	  skipFixed (len) { this.pos += len; }

	  writeFixed (buf, len) {
	    len = len || buf.length;
	    let pos = this.pos;
	    this.pos += len;
	    if (this.pos > this.arr.length) {
	      return;
	    }
	    this.arr.set(buf.subarray(0, len), pos);
	  }

	  readBytes () {
	    let len = this.readLong();
	    if (len < 0) {
	      this._invalidate();
	      return;
	    }
	    return this.readFixed(len);
	  }

	  skipBytes () {
	    let len = this.readLong();
	    if (len < 0) {
	      this._invalidate();
	      return;
	    }
	    this.pos += len;
	  }

	  writeBytes (buf) {
	    let len = buf.length;
	    this.writeLong(len);
	    this.writeFixed(buf, len);
	  }

	  skipString () {
	    let len = this.readLong();
	    if (len < 0) {
	      this._invalidate();
	      return;
	    }
	    this.pos += len;
	  }

	  readString () {
	    let len = this.readLong();
	    if (len < 0) {
	      this._invalidate();
	      return '';
	    }
	    let pos = this.pos;
	    this.pos += len;
	    if (this.pos > this.arr.length) {
	      return;
	    }

	    let arr = this.arr;
	    let end = pos + len;
	    if (len > 24) {
	      return decodeSlice(arr, pos, end);
	    }

	    let output = '';
	    // Consume the string in 4-byte chunks. The performance benefit comes not
	    // from *reading* in chunks, but calling fromCharCode with 4 characters per
	    // call.
	    while (pos + 3 < end) {
	      let a = arr[pos], b = arr[pos + 1], c = arr[pos + 2], d = arr[pos + 3];
	      // If the high bit of any character is set, it's a non-ASCII character.
	      // Fall back to TextDecoder for the remaining characters.
	      if ((a | b | c | d) & 0x80) {
	        output += decodeSlice(arr, pos, end);
	        return output;
	      }
	      output += String.fromCharCode(a, b, c, d);
	      pos += 4;
	    }

	    // Handle the remainder of the string.
	    while (pos < end) {
	      let char = arr[pos];
	      if (char & 0x80) {
	        output += decodeSlice(arr, pos, end);
	        return output;
	      }
	      output += String.fromCharCode(char);
	      pos++;
	    }

	    return output;
	  }

	  writeString (s) {
	    let buf = this.arr;
	    const stringLen = s.length;
	    // The maximum number that a signed varint can store in a single byte is 63.
	    // The maximum size of a UTF-8 representation of a UTF-16 string is 3 times
	    // its length, as one UTF-16 character can be represented by up to 3 bytes
	    // in UTF-8. Therefore, if the string is 21 characters or less, we know that
	    // its length can be stored in a single byte, which is why we choose 21 as
	    // the small-string threshold specifically.
	    if (stringLen > 21) {
	      let encodedLength, encoded;

	      // If we're already over the buffer size, we don't need to encode the
	      // string. While encodeInto is actually faster than Buffer.byteLength, we
	      // could still overflow the preallocated encoding buffer and have to fall
	      // back to allocating, which is really really slow.
	      if (this.isValid()) {
	        encoded = encodeSlice(s);
	        encodedLength = encoded.length;
	      } else {
	        encodedLength = utf8Length(s);
	      }
	      this.writeLong(encodedLength);
	      let pos = this.pos;
	      this.pos += encodedLength;

	      if (this.isValid() && typeof encoded != 'undefined') {
	        buf.set(encoded, pos);
	      }
	    } else {
	      // For small strings, this manual implementation is faster.

	      // Set aside 1 byte to write the string length.
	      let pos = this.pos + 1;
	      let startPos = pos;
	      let bufLen = buf.length;

	      // This is not a micro-optimization: caching the string length for the
	      // loop predicate really does make a difference!
	      for (let i = 0; i < stringLen; i++) {
	        let c1 = s.charCodeAt(i);
	        let c2;
	        if (c1 < 0x80) {
	          if (pos < bufLen) buf[pos] = c1;
	          pos++;
	        } else if (c1 < 0x800) {
	          if (pos + 1 < bufLen) {
	            buf[pos] = c1 >> 6 | 0xc0;
	            buf[pos + 1] = c1 & 0x3f | 0x80;
	          }
	          pos += 2;
	        } else if (
	          (c1 & 0xfc00) === 0xd800 &&
	          ((c2 = s.charCodeAt(i + 1)) & 0xfc00) === 0xdc00
	        ) {
	          c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
	          i++;
	          if (pos + 3 < bufLen) {
	            buf[pos] = c1 >> 18 | 0xf0;
	            buf[pos + 1] = c1 >> 12 & 0x3f | 0x80;
	            buf[pos + 2] = c1 >> 6 & 0x3f | 0x80;
	            buf[pos + 3] = c1 & 0x3f | 0x80;
	          }
	          pos += 4;
	        } else {
	          if (pos + 2 < bufLen) {
	            buf[pos] = c1 >> 12 | 0xe0;
	            buf[pos + 1] = c1 >> 6 & 0x3f | 0x80;
	            buf[pos + 2] = c1 & 0x3f | 0x80;
	          }
	          pos += 3;
	        }
	      }

	      // Note that we've not yet updated this.pos, so it's currently pointing to
	      // the place where we want to write the string length.
	      if (this.pos <= bufLen) {
	        this.writeLong(pos - startPos);
	      }

	      this.pos = pos;
	    }
	  }

	  // Binary comparison methods.
	  //
	  // These are not guaranteed to consume the objects they are comparing when
	  // returning a non-zero result (allowing for performance benefits), so no
	  // other operations should be done on either tap after a compare returns a
	  // non-zero value. Also, these methods do not have the same silent failure
	  // requirement as read, skip, and write since they are assumed to be called on
	  // valid buffers.

	  matchBoolean (tap) {
	    return this.arr[this.pos++] - tap.arr[tap.pos++];
	  }

	  matchLong (tap) {
	    let n1 = this.readLong();
	    let n2 = tap.readLong();
	    return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
	  }

	  matchFloat (tap) {
	    let n1 = this.readFloat();
	    let n2 = tap.readFloat();
	    return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
	  }

	  matchDouble (tap) {
	    let n1 = this.readDouble();
	    let n2 = tap.readDouble();
	    return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1);
	  }

	  matchFixed (tap, len) {
	    return bufCompare(this.readFixed(len), tap.readFixed(len));
	  }

	  matchBytes (tap) {
	    let l1 = this.readLong();
	    let p1 = this.pos;
	    this.pos += l1;
	    let l2 = tap.readLong();
	    let p2 = tap.pos;
	    tap.pos += l2;
	    let b1 = this.arr.subarray(p1, this.pos);
	    let b2 = tap.arr.subarray(p2, tap.pos);
	    return bufCompare(b1, b2);
	  }

	  // Functions for supporting custom long classes.
	  //
	  // The two following methods allow the long implementations to not have to
	  // worry about Avro's zigzag encoding, we directly expose longs as unpacked.

	  unpackLongBytes () {
	    let res = new Uint8Array(8);
	    let n = 0;
	    let i = 0; // Byte index in target buffer.
	    let j = 6; // Bit offset in current target buffer byte.
	    let buf = this.arr;

	    let b = buf[this.pos++];
	    let neg = b & 1;
	    res.fill(0);

	    n |= (b & 0x7f) >> 1;
	    while (b & 0x80) {
	      b = buf[this.pos++];
	      n |= (b & 0x7f) << j;
	      j += 7;
	      if (j >= 8) {
	        // Flush byte.
	        j -= 8;
	        res[i++] = n;
	        n >>= 8;
	      }
	    }
	    res[i] = n;

	    if (neg) {
	      invert(res, 8);
	    }

	    return res;
	  }

	  packLongBytes (buf) {
	    let neg = (buf[7] & 0x80) >> 7;
	    let res = this.arr;
	    let j = 1;
	    let k = 0;
	    let m = 3;
	    let n;

	    if (neg) {
	      invert(buf, 8);
	      n = 1;
	    } else {
	      n = 0;
	    }

	    let parts = [
	      (buf[0] | (buf[1] << 8) | (buf[2] << 16)),
	      (buf[3] | (buf[4] << 8) | (buf[5] << 16)),
	      (buf[6] | (buf[7] << 8))
	    ];
	    // Not reading more than 24 bits because we need to be able to combine the
	    // "carry" bits from the previous part and JavaScript only supports bitwise
	    // operations on 32 bit integers.
	    while (m && !parts[--m]) {} // Skip trailing 0s.

	    // Leading parts (if any), we never bail early here since we need the
	    // continuation bit to be set.
	    while (k < m) {
	      n |= parts[k++] << j;
	      j += 24;
	      while (j > 7) {
	        res[this.pos++] = (n & 0x7f) | 0x80;
	        n >>= 7;
	        j -= 7;
	      }
	    }

	    // Final part, similar to normal packing aside from the initial offset.
	    n |= parts[m] << j;
	    do {
	      res[this.pos] = n & 0x7f;
	      n >>= 7;
	    } while (n && (res[this.pos++] |= 0x80));
	    this.pos++;

	    // Restore original buffer (could make this optional?).
	    if (neg) {
	      invert(buf, 8);
	    }
	  }
	}

	// Helpers.

	/**
	 * Invert all bits in a buffer.
	 *
	 * @param {Uint8Array} buf Non-empty buffer to invert.
	 * @param {number} len Buffer length (must be positive).
	 */
	function invert(buf, len) {
	  while (len--) {
	    buf[len] = ~buf[len];
	  }
	}

	/**
	 * Prints an object as a string; mostly used for printing objects in errors.
	 * @param {object} obj The object to display.
	 * @returns The object as JSON.
	 */
	function printJSON (obj) {
	  let seen = new Set();
	  try {
	    return JSON.stringify(obj, (key, value) => {
	      if (seen.has(value)) return '[Circular]';
	      if (typeof value === 'object' && value !== null) seen.add(value);
	      // eslint-disable-next-line no-undef
	      if (typeof BigInt !== 'undefined' && (value instanceof BigInt)) {
	        return `[BigInt ${value.toString()}n]`;
	      }
	      return value;
	    });
	  } catch (err) {
	    return '[object]';
	  }
	}

	utils = {
	  abstractFunction,
	  bufCompare,
	  bufEqual,
	  bufferToBinaryString,
	  binaryStringToBuffer,
	  capitalize,
	  copyOwnProperties,
	  getHash: platform.getHash,
	  compare,
	  getOption,
	  impliedNamespace,
	  isBufferLike,
	  isValidName,
	  jsonEnd,
	  objectValues,
	  qualify,
	  toMap,
	  singleIndexOf,
	  hasDuplicates,
	  unqualify,
	  Lcg,
	  OrderedQueue,
	  Tap,
	  printJSON
	};
	return utils;
}

var types;
var hasRequiredTypes;

function requireTypes () {
	if (hasRequiredTypes) return types;
	hasRequiredTypes = 1;

	/**
	 * This module defines all Avro data types and their serialization logic.
	 *
	 */

	let utils = requireUtils();

	// Convenience imports.
	let {Tap, isBufferLike} = utils;
	let j = utils.printJSON;

	// All non-union concrete (i.e. non-logical) Avro types.
	// Defined after all the type classes are defined.
	let TYPES;

	// Random generator.
	let RANDOM = new utils.Lcg();

	// Encoding tap (shared for performance).
	let TAP = Tap.withCapacity(1024);

	// Currently active logical type, used for name redirection.
	let LOGICAL_TYPE = null;

	// Underlying types of logical types currently being instantiated. This is used
	// to be able to reference names (i.e. for branches) during instantiation.
	let UNDERLYING_TYPES = [];

	/**
	 * "Abstract" base Avro type.
	 *
	 * This class' constructor will register any named types to support recursive
	 * schemas. All type values are represented in memory similarly to their JSON
	 * representation, except for:
	 *
	 * + `bytes` and `fixed` which are represented as `Uint8Array`s.
	 * + `union`s which will be "unwrapped" unless the `wrapUnions` option is set.
	 *
	 *  See individual subclasses for details.
	 */
	class Type {
	  constructor (schema, opts) {
	    let type;
	    if (LOGICAL_TYPE) {
	      type = LOGICAL_TYPE;
	      UNDERLYING_TYPES.push([LOGICAL_TYPE, this]);
	      LOGICAL_TYPE = null;
	    } else {
	      type = this;
	    }

	    // Lazily instantiated hash string. It will be generated the first time the
	    // type's default fingerprint is computed (for example when using `equals`).
	    // We use a mutable object since types are frozen after instantiation.
	    this._hash = new Hash();
	    this.name = undefined;
	    this.aliases = undefined;
	    this.doc = (schema && schema.doc) ? '' + schema.doc : undefined;

	    if (schema) {
	      // This is a complex (i.e. non-primitive) type.
	      let name = schema.name;
	      let namespace = schema.namespace === undefined ?
	        opts && opts.namespace :
	        schema.namespace;
	      if (name !== undefined) {
	        // This isn't an anonymous type.
	        name = maybeQualify(name, namespace);
	        if (isPrimitive(name)) {
	          // Avro doesn't allow redefining primitive names.
	          throw new Error(`cannot rename primitive type: ${j(name)}`);
	        }
	        let registry = opts && opts.registry;
	        if (registry) {
	          if (registry[name] !== undefined) {
	            throw new Error(`duplicate type name: ${name}`);
	          }
	          registry[name] = type;
	        }
	      } else if (opts && opts.noAnonymousTypes) {
	        throw new Error(`missing name property in schema: ${j(schema)}`);
	      }
	      this.name = name;
	      this.aliases = schema.aliases ?
	        schema.aliases.map((s) => { return maybeQualify(s, namespace); }) :
	        [];
	    }
	  }

	  static forSchema (schema, opts) {
	    opts = Object.assign({}, opts);
	    opts.registry = opts.registry || {};

	    let UnionType = (function (wrapUnions) {
	      if (wrapUnions === true) {
	        wrapUnions = 'always';
	      } else if (wrapUnions === false) {
	        wrapUnions = 'never';
	      } else if (wrapUnions === undefined) {
	        wrapUnions = 'auto';
	      } else if (typeof wrapUnions == 'string') {
	        wrapUnions = wrapUnions.toLowerCase();
	      } else if (typeof wrapUnions === 'function') {
	        wrapUnions = 'auto';
	      }
	      switch (wrapUnions) {
	        case 'always':
	          return WrappedUnionType;
	        case 'never':
	          return UnwrappedUnionType;
	        case 'auto':
	          return undefined; // Determined dynamically later on.
	        default:
	          throw new Error(`invalid wrap unions option: ${j(wrapUnions)}`);
	      }
	    })(opts.wrapUnions);

	    if (schema === null) {
	      // Let's be helpful for this common error.
	      throw new Error('invalid type: null (did you mean "null"?)');
	    }

	    if (Type.isType(schema)) {
	      return schema;
	    }

	    let type;
	    if (opts.typeHook && (type = opts.typeHook(schema, opts))) {
	      if (!Type.isType(type)) {
	        throw new Error(`invalid typehook return value: ${j(type)}`);
	      }
	      return type;
	    }

	    if (typeof schema == 'string') { // Type reference.
	      schema = maybeQualify(schema, opts.namespace);
	      type = opts.registry[schema];
	      if (type) {
	        // Type was already defined, return it.
	        return type;
	      }
	      if (isPrimitive(schema)) {
	        // Reference to a primitive type. These are also defined names by
	        // default so we create the appropriate type and it to the registry for
	        // future reference.
	        type = Type.forSchema({type: schema}, opts);
	        opts.registry[schema] = type;
	        return type;
	      }
	      throw new Error(`undefined type name: ${schema}`);
	    }

	    if (schema.logicalType && opts.logicalTypes && !LOGICAL_TYPE) {
	      let DerivedType = opts.logicalTypes[schema.logicalType];
	      // TODO: check to ensure DerivedType was derived from LogicalType via ES6
	      // subclassing; otherwise it will not work properly
	      if (DerivedType) {
	        let namespace = opts.namespace;
	        let registry = {};
	        Object.keys(opts.registry).forEach((key) => {
	          registry[key] = opts.registry[key];
	        });
	        try {
	          return new DerivedType(schema, opts);
	        } catch (err) {
	          if (opts.assertLogicalTypes) {
	            // The spec mandates that we fall through to the underlying type if
	            // the logical type is invalid. We provide this option to ease
	            // debugging.
	            throw err;
	          }
	          LOGICAL_TYPE = null;
	          opts.namespace = namespace;
	          opts.registry = registry;
	        }
	      }
	    }

	    if (Array.isArray(schema)) { // Union.
	      // We temporarily clear the logical type since we instantiate the branch's
	      // types before the underlying union's type (necessary to decide whether
	      // the union is ambiguous or not).
	      let logicalType = LOGICAL_TYPE;
	      LOGICAL_TYPE = null;
	      let types = schema.map((obj) => {
	        return Type.forSchema(obj, opts);
	      });
	      let projectionFn;
	      if (!UnionType) {
	        if (typeof opts.wrapUnions === 'function') {
	          // we have a projection function
	          projectionFn = opts.wrapUnions(types);
	          UnionType = typeof projectionFn !== 'undefined'
	            ? UnwrappedUnionType
	            : WrappedUnionType;
	        } else {
	          UnionType = isAmbiguous(types) ? WrappedUnionType : UnwrappedUnionType;
	        }
	      }
	      LOGICAL_TYPE = logicalType;
	      type = new UnionType(types, opts, projectionFn);
	    } else { // New type definition.
	      type = (function (typeName) {
	        let Type = TYPES[typeName];
	        if (Type === undefined) {
	          throw new Error(`unknown type: ${j(typeName)}`);
	        }
	        return new Type(schema, opts);
	      })(schema.type);
	    }
	    return type;
	  }

	  static forValue (val, opts) {
	    opts = Object.assign({}, opts);

	    // Sentinel used when inferring the types of empty arrays.
	    opts.emptyArrayType = opts.emptyArrayType || Type.forSchema({
	      type: 'array', items: 'null'
	    });

	    // Optional custom inference hook.
	    if (opts.valueHook) {
	      let type = opts.valueHook(val, opts);
	      if (type !== undefined) {
	        if (!Type.isType(type)) {
	          throw new Error(`invalid value hook return value: ${j(type)}`);
	        }
	        return type;
	      }
	    }

	    // Default inference logic.
	    switch (typeof val) {
	      case 'string':
	        return Type.forSchema('string', opts);
	      case 'boolean':
	        return Type.forSchema('boolean', opts);
	      case 'number':
	        if ((val | 0) === val) {
	          return Type.forSchema('int', opts);
	        } else if (Math.abs(val) < 9007199254740991) {
	          return Type.forSchema('float', opts);
	        }
	        return Type.forSchema('double', opts);
	      case 'object': {
	        if (val === null) {
	          return Type.forSchema('null', opts);
	        } else if (Array.isArray(val)) {
	          if (!val.length) {
	            return opts.emptyArrayType;
	          }
	          return Type.forSchema({
	            type: 'array',
	            items: Type.forTypes(
	              val.map((v) => { return Type.forValue(v, opts); }),
	              opts
	            )
	          }, opts);
	        } else if (isBufferLike(val)) {
	          return Type.forSchema('bytes', opts);
	        }
	        let fieldNames = Object.keys(val);
	        if (fieldNames.some((s) => { return !utils.isValidName(s); })) {
	          // We have to fall back to a map.
	          return Type.forSchema({
	            type: 'map',
	            values: Type.forTypes(fieldNames.map((s) => {
	              return Type.forValue(val[s], opts);
	            }), opts)
	          }, opts);
	        }
	        return Type.forSchema({
	          type: 'record',
	          fields: fieldNames.map((s) => {
	            return {name: s, type: Type.forValue(val[s], opts)};
	          })
	        }, opts);
	      }
	      default:
	        throw new Error(`cannot infer type from: ${j(val)}`);
	    }
	  }

	  static forTypes (types, opts) {
	    if (!types.length) {
	      throw new Error('no types to combine');
	    }
	    if (types.length === 1) {
	      return types[0]; // Nothing to do.
	    }
	    opts = Object.assign({}, opts);

	    // Extract any union types, with special care for wrapped unions (see
	    // below).
	    let expanded = [];
	    let numWrappedUnions = 0;
	    let isValidWrappedUnion = true;
	    types.forEach((type) => {
	      switch (type.typeName) {
	        case 'union:unwrapped':
	          isValidWrappedUnion = false;
	          expanded = expanded.concat(type.types);
	          break;
	        case 'union:wrapped':
	          numWrappedUnions++;
	          expanded = expanded.concat(type.types);
	          break;
	        case 'null':
	          expanded.push(type);
	          break;
	        default:
	          isValidWrappedUnion = false;
	          expanded.push(type);
	      }
	    });
	    if (numWrappedUnions) {
	      if (!isValidWrappedUnion) {
	        // It is only valid to combine wrapped unions when no other type is
	        // present other than wrapped unions and nulls (otherwise the values of
	        // others wouldn't be valid in the resulting union).
	        throw new Error('cannot combine wrapped union');
	      }
	      let branchTypes = {};
	      expanded.forEach((type) => {
	        let name = type.branchName;
	        let branchType = branchTypes[name];
	        if (!branchType) {
	          branchTypes[name] = type;
	        } else if (!type.equals(branchType)) {
	          throw new Error('inconsistent branch type');
	        }
	      });
	      let wrapUnions = opts.wrapUnions;
	      let unionType;
	      opts.wrapUnions = true;
	      try {
	        unionType = Type.forSchema(Object.keys(branchTypes).map((name) => {
	          return branchTypes[name];
	        }), opts);
	      } catch (err) {
	        throw err;
	      } finally {
	        opts.wrapUnions = wrapUnions;
	      }
	      return unionType;
	    }

	    // Group types by category, similar to the logic for unwrapped unions.
	    let bucketized = {};
	    expanded.forEach((type) => {
	      let bucket = getTypeBucket(type);
	      let bucketTypes = bucketized[bucket];
	      if (!bucketTypes) {
	        bucketized[bucket] = bucketTypes = [];
	      }
	      bucketTypes.push(type);
	    });

	    // Generate the "augmented" type for each group.
	    let buckets = Object.keys(bucketized);
	    let augmented = buckets.map((bucket) => {
	      let bucketTypes = bucketized[bucket];
	      if (bucketTypes.length === 1) {
	        return bucketTypes[0];
	      } else {
	        switch (bucket) {
	          case 'null':
	          case 'boolean':
	            return bucketTypes[0];
	          case 'number':
	            return combineNumbers(bucketTypes);
	          case 'string':
	            return combineStrings(bucketTypes, opts);
	          case 'buffer':
	            return combineBuffers(bucketTypes, opts);
	          case 'array':
	            // Remove any sentinel arrays (used when inferring from empty
	            // arrays) to avoid making things nullable when they shouldn't be.
	            bucketTypes = bucketTypes.filter((t) => {
	              return t !== opts.emptyArrayType;
	            });
	            if (!bucketTypes.length) {
	              // We still don't have a real type, just return the sentinel.
	              return opts.emptyArrayType;
	            }
	            return Type.forSchema({
	              type: 'array',
	              items: Type.forTypes(bucketTypes.map((t) => {
	                return t.itemsType;
	              }), opts)
	            }, opts);
	          default:
	            return combineObjects(bucketTypes, opts);
	        }
	      }
	    });

	    if (augmented.length === 1) {
	      return augmented[0];
	    } else {
	      // We return an (unwrapped) union of all augmented types.
	      return Type.forSchema(augmented, opts);
	    }
	  }

	  static isType (/* any, [prefix] ... */) {
	    let l = arguments.length;
	    if (!l) {
	      return false;
	    }

	    let any = arguments[0];
	    if (
	      !any ||
	      typeof any._update != 'function' ||
	      typeof any.fingerprint != 'function'
	    ) {
	      // Not fool-proof, but most likely good enough.
	      return false;
	    }

	    if (l === 1) {
	      // No type names specified, we are done.
	      return true;
	    }

	    // We check if at least one of the prefixes matches.
	    let typeName = any.typeName;
	    for (let i = 1; i < l; i++) {
	      if (typeName.indexOf(arguments[i]) === 0) {
	        return true;
	      }
	    }
	    return false;
	  }

	  static __reset (size) {
	    TAP.reinitialize(size);
	  }

	  get branchName () {
	    let type = Type.isType(this, 'logical') ? this.underlyingType : this;
	    if (type.name) {
	      return type.name;
	    }
	    if (Type.isType(type, 'abstract')) {
	      return type._concreteTypeName;
	    }
	    return Type.isType(type, 'union') ? undefined : type.typeName;
	  }

	  clone (val, opts) {
	    if (opts) {
	      opts = {
	        coerce: !!opts.coerceBuffers | 0, // Coerce JSON to Buffer.
	        fieldHook: opts.fieldHook,
	        qualifyNames: !!opts.qualifyNames,
	        skip: !!opts.skipMissingFields,
	        wrap: !!opts.wrapUnions | 0 // Wrap first match into union.
	      };
	      return this._copy(val, opts);
	    } else {
	      // If no modifications are required, we can get by with a serialization
	      // roundtrip (generally much faster than a standard deep copy).
	      return this.fromBuffer(this.toBuffer(val));
	    }
	  }

	  compareBuffers (buf1, buf2) {
	    return this._match(Tap.fromBuffer(buf1), Tap.fromBuffer(buf2));
	  }

	  createResolver (type, opts) {
	    if (!Type.isType(type)) {
	      // More explicit error message than the "incompatible type" thrown
	      // otherwise (especially because of the overridden `toJSON` method).
	      throw new Error(`not a type: ${j(type)}`);
	    }

	    if (!Type.isType(this, 'union', 'logical') && Type.isType(type, 'logical')) {
	      // Trying to read a logical type as a built-in: unwrap the logical type.
	      // Note that we exclude unions to support resolving into unions containing
	      // logical types.
	      return this.createResolver(type.underlyingType, opts);
	    }

	    opts = Object.assign({}, opts);
	    opts.registry = opts.registry || {};

	    let resolver, key;
	    if (
	      Type.isType(this, 'record', 'error') &&
	      Type.isType(type, 'record', 'error')
	    ) {
	      // We allow conversions between records and errors.
	      key = this.name + ':' + type.name; // ':' is illegal in Avro type names.
	      resolver = opts.registry[key];
	      if (resolver) {
	        return resolver;
	      }
	    }

	    resolver = new Resolver(this);
	    if (key) { // Register resolver early for recursive schemas.
	      opts.registry[key] = resolver;
	    }

	    if (Type.isType(type, 'union')) {
	      let resolvers = type.types.map(function (t) {
	        return this.createResolver(t, opts);
	      }, this);
	      resolver._read = function (tap) {
	        let index = tap.readLong();
	        let resolver = resolvers[index];
	        if (resolver === undefined) {
	          throw new Error(`invalid union index: ${index}`);
	        }
	        return resolvers[index]._read(tap);
	      };
	    } else {
	      this._update(resolver, type, opts);
	    }

	    if (!resolver._read) {
	      throw new Error(`cannot read ${type} as ${this}`);
	    }
	    return Object.freeze(resolver);
	  }

	  decode (buf, pos, resolver) {
	    let tap = Tap.fromBuffer(buf, pos);
	    let val = readValue(this, tap, resolver);
	    if (!tap.isValid()) {
	      return {value: undefined, offset: -1};
	    }
	    return {value: val, offset: tap.pos};
	  }

	  encode (val, buf, pos) {
	    let tap = Tap.fromBuffer(buf, pos);
	    this._write(tap, val);
	    if (!tap.isValid()) {
	      // Don't throw as there is no way to predict this. We also return the
	      // number of missing bytes to ease resizing.
	      return buf.length - tap.pos;
	    }
	    return tap.pos;
	  }

	  equals (type, opts) {
	    let canon = ( // Canonical equality.
	      Type.isType(type) &&
	      this._getCachedHash() === type._getCachedHash()
	    );
	    if (!canon || !(opts && opts.strict)) {
	      return canon;
	    }
	    return (
	      JSON.stringify(this.schema({exportAttrs: true})) ===
	      JSON.stringify(type.schema({exportAttrs: true}))
	    );
	  }

	  /**
	   * Get this type's schema fingerprint (lazily calculated and cached).
	   * Differs from {@link fingerprint} in that it returns the string
	   * representation of the fingerprint as it's stored internally.
	   * @returns {string}
	   */
	  _getCachedHash() {
	    if (!this._hash.hash) {
	      let schemaStr = JSON.stringify(this.schema());
	      // Cache the hash as a binary string to avoid overhead and also return a
	      // fresh copy every time
	      // https://stackoverflow.com/questions/45803829/memory-overhead-of-typed-arrays-vs-strings/45808835#45808835
	      this._hash.hash = utils.bufferToBinaryString(utils.getHash(schemaStr));
	    }
	    return this._hash.hash;
	  }

	  fingerprint (algorithm) {
	    if (!algorithm) {
	      return utils.binaryStringToBuffer(this._getCachedHash());
	    }
	    return utils.getHash(JSON.stringify(this.schema()), algorithm);
	  }

	  fromBuffer (buf, resolver, noCheck) {
	    let tap = Tap.fromBuffer(buf, 0);
	    let val = readValue(this, tap, resolver, noCheck);
	    if (!tap.isValid()) {
	      throw new Error('truncated buffer');
	    }
	    if (!noCheck && tap.pos < buf.length) {
	      throw new Error('trailing data');
	    }
	    return val;
	  }

	  fromString (str) {
	    return this._copy(JSON.parse(str), {coerce: 2});
	  }

	  inspect () {
	    let typeName = this.typeName;
	    let className = getClassName(typeName);
	    if (isPrimitive(typeName)) {
	      // The class name is sufficient to identify the type.
	      return `<${className}>`;
	    } else {
	      // We add a little metadata for convenience.
	      let obj = this.schema({exportAttrs: true, noDeref: true});
	      if (typeof obj == 'object' && !Type.isType(this, 'logical')) {
	        obj.type = undefined; // Would be redundant with constructor name.
	      }
	      return `<${className} ${j(obj)}>`;
	    }
	  }

	  isValid (val, opts) {
	    // We only have a single flag for now, so no need to complicate things.
	    let flags = (opts && opts.noUndeclaredFields) | 0;
	    let errorHook = opts && opts.errorHook;
	    let hook, path;
	    if (errorHook) {
	      path = [];
	      hook = function (any, type) {
	        errorHook.call(this, path.slice(), any, type, val);
	      };
	    }
	    return this._check(val, flags, hook, path);
	  }

	  schema (opts) {
	    // Copy the options to avoid mutating the original options object when we
	    // add the registry of dereferenced types.
	    return this._attrs({}, {
	      exportAttrs: !!(opts && opts.exportAttrs),
	      noDeref: !!(opts && opts.noDeref)
	    });
	  }

	  toBuffer (val) {
	    TAP.pos = 0;
	    this._write(TAP, val);
	    if (TAP.isValid()) {
	      return TAP.toBuffer();
	    }
	    let buf = new Uint8Array(TAP.pos);
	    this._write(Tap.fromBuffer(buf), val);
	    return buf;
	  }

	  toJSON () {
	    // Convenience to allow using `JSON.stringify(type)` to get a type's schema.
	    return this.schema({exportAttrs: true});
	  }

	  toString (val) {
	    if (val === undefined) {
	      // Consistent behavior with standard `toString` expectations.
	      return JSON.stringify(this.schema({noDeref: true}));
	    }
	    return JSON.stringify(this._copy(val, {coerce: 3}));
	  }

	  wrap (val) {
	    let Branch = this._branchConstructor;
	    return Branch === null ? null : new Branch(val);
	  }

	  _attrs (derefed, opts) {
	    // This function handles a lot of the common logic to schema generation
	    // across types, for example keeping track of which types have already been
	    // de-referenced (i.e. derefed).
	    let name = this.name;
	    if (name !== undefined) {
	      if (opts.noDeref || derefed[name]) {
	        return name;
	      }
	      derefed[name] = true;
	    }
	    let schema = {};
	    // The order in which we add fields to the `schema` object matters here.
	    // Since JS objects are unordered, this implementation (unfortunately)
	    // relies on engines returning properties in the same order that they are
	    // inserted in. This is not in the JS spec, but can be "somewhat" safely
	    // assumed (see http://stackoverflow.com/q/5525795/1062617).
	    if (this.name !== undefined) {
	      schema.name = name;
	    }
	    schema.type = this.typeName;
	    let derefedSchema = this._deref(schema, derefed, opts);
	    if (derefedSchema !== undefined) {
	      // We allow the original schema to be overridden (this will happen for
	      // primitive types and logical types).
	      schema = derefedSchema;
	    }
	    if (opts.exportAttrs) {
	      if (this.aliases && this.aliases.length) {
	        schema.aliases = this.aliases;
	      }
	      if (this.doc !== undefined) {
	        schema.doc = this.doc;
	      }
	    }
	    return schema;
	  }

	  _createBranchConstructor () {
	    let name = this.branchName;
	    if (name === 'null') {
	      return null;
	    }
	    let attr = ~name.indexOf('.') ? 'this[\'' + name + '\']' : 'this.' + name;
	    let body = 'return function Branch$(val) { ' + attr + ' = val; };';
	    // eslint-disable-next-line no-new-func
	    let Branch = (new Function(body))();
	    Branch.type = this;
	    // eslint-disable-next-line no-new-func
	    Branch.prototype.unwrap = new Function('return ' + attr + ';');
	    Branch.prototype.unwrapped = Branch.prototype.unwrap; // Deprecated.
	    return Branch;
	  }

	  _peek (tap) {
	    let pos = tap.pos;
	    let val = this._read(tap);
	    tap.pos = pos;
	    return val;
	  }

	  compare () { utils.abstractFunction(); }
	  random () { utils.abstractFunction(); }
	  _check () { utils.abstractFunction(); }
	  _copy () { utils.abstractFunction(); }
	  _deref () { utils.abstractFunction(); }
	  _match () { utils.abstractFunction(); }
	  _read () { utils.abstractFunction(); }
	  _skip () { utils.abstractFunction(); }
	  _update () { utils.abstractFunction(); }
	  _write () { utils.abstractFunction(); }
	}

	// "Deprecated" getters (will be explicitly deprecated in 5.1).

	Type.prototype.getAliases = function () { return this.aliases; };

	Type.prototype.getFingerprint = Type.prototype.fingerprint;

	Type.prototype.getName = function (asBranch) {
	  return (this.name || !asBranch) ? this.name : this.branchName;
	};

	Type.prototype.getSchema = Type.prototype.schema;

	Type.prototype.getTypeName = function () { return this.typeName; };

	// Implementations.

	/**
	 * Base primitive Avro type.
	 *
	 * Most of the primitive types share the same cloning and resolution
	 * mechanisms, provided by this class. This class also lets us conveniently
	 * check whether a type is a primitive using `instanceof`.
	 */
	class PrimitiveType extends Type {
	  constructor (noFreeze) {
	    super();
	    this._branchConstructor = this._createBranchConstructor();
	    if (!noFreeze) {
	      // Abstract long types can't be frozen at this stage.
	      Object.freeze(this);
	    }
	  }

	  _update (resolver, type) {
	    if (type.typeName === this.typeName) {
	      resolver._read = this._read;
	    }
	  }

	  _copy (val) {
	    this._check(val, undefined, throwInvalidError);
	    return val;
	  }

	  _deref () { return this.typeName; }

	  compare (a, b) {
	    return utils.compare(a, b);
	  }
	}

	/** Nulls. */
	class NullType extends PrimitiveType {
	  _check (val, flags, hook) {
	    let b = val === null;
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read () { return null; }

	  _skip () {}

	  _write (tap, val) {
	    if (val !== null) {
	      throwInvalidError(val, this);
	    }
	  }

	  _match () { return 0; }
	}

	NullType.prototype.compare = NullType.prototype._match;

	NullType.prototype.typeName = 'null';

	NullType.prototype.random = NullType.prototype._read;

	/** Booleans. */
	class BooleanType extends PrimitiveType {
	  _check (val, flags, hook) {
	    let b = typeof val == 'boolean';
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) { return tap.readBoolean(); }

	  _skip (tap) { tap.skipBoolean(); }

	  _write (tap, val) {
	    if (typeof val != 'boolean') {
	      throwInvalidError(val, this);
	    }
	    tap.writeBoolean(val);
	  }

	  _match (tap1, tap2) {
	    return tap1.matchBoolean(tap2);
	  }

	  random () { return RANDOM.nextBoolean(); }
	}

	BooleanType.prototype.typeName = 'boolean';

	/** Integers. */
	class IntType extends PrimitiveType {
	  _check (val, flags, hook) {
	    let b = val === (val | 0);
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) { return tap.readLong(); }

	  _skip (tap) { tap.skipLong(); }

	  _write (tap, val) {
	    if (val !== (val | 0)) {
	      throwInvalidError(val, this);
	    }
	    tap.writeLong(val);
	  }

	  _match (tap1, tap2) {
	    return tap1.matchLong(tap2);
	  }

	  random () { return RANDOM.nextInt(1000) | 0; }
	}

	IntType.prototype.typeName = 'int';

	/**
	 * Longs.
	 *
	 * We can't capture all the range unfortunately since JavaScript represents all
	 * numbers internally as `double`s, so the default implementation plays safe
	 * and throws rather than potentially silently change the data. See `__with` or
	 * `AbstractLongType` below for a way to implement a custom long type.
	 */
	class LongType extends PrimitiveType {
	  // TODO: rework AbstractLongType so we don't need to accept noFreeze here
	  constructor (noFreeze) { super(noFreeze); }

	  _check (val, flags, hook) {
	    let b = typeof val == 'number' && val % 1 === 0 && isSafeLong(val);
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) {
	    let n = tap.readLong();
	    if (!isSafeLong(n)) {
	      throw new Error('potential precision loss');
	    }
	    return n;
	  }

	  _skip (tap) { tap.skipLong(); }

	  _write (tap, val) {
	    if (typeof val != 'number' || val % 1 || !isSafeLong(val)) {
	      throwInvalidError(val, this);
	    }
	    tap.writeLong(val);
	  }

	  _match (tap1, tap2) {
	    return tap1.matchLong(tap2);
	  }

	  _update (resolver, type) {
	    switch (type.typeName) {
	      case 'int':
	        resolver._read = type._read;
	        break;
	      case 'abstract:long':
	      case 'long':
	        resolver._read = this._read; // In case `type` is an `AbstractLongType`.
	    }
	  }

	  random () { return RANDOM.nextInt(); }

	  static __with (methods, noUnpack) {
	    methods = methods || {}; // Will give a more helpful error message.
	    // We map some of the methods to a different name to be able to intercept
	    // their input and output (otherwise we wouldn't be able to perform any
	    // unpacking logic, and the type wouldn't work when nested).
	    let mapping = {
	      toBuffer: '_toBuffer',
	      fromBuffer: '_fromBuffer',
	      fromJSON: '_fromJSON',
	      toJSON: '_toJSON',
	      isValid: '_isValid',
	      compare: 'compare'
	    };
	    let type = new AbstractLongType(noUnpack);
	    Object.keys(mapping).forEach((name) => {
	      if (methods[name] === undefined) {
	        throw new Error(`missing method implementation: ${name}`);
	      }
	      type[mapping[name]] = methods[name];
	    });
	    return Object.freeze(type);
	  }
	}

	LongType.prototype.typeName = 'long';

	/** Floats. */
	class FloatType extends PrimitiveType {
	  _check (val, flags, hook) {
	    let b = typeof val == 'number';
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) { return tap.readFloat(); }

	  _skip (tap) { tap.skipFloat(); }

	  _write (tap, val) {
	    if (typeof val != 'number') {
	      throwInvalidError(val, this);
	    }
	    tap.writeFloat(val);
	  }

	  _match (tap1, tap2) {
	    return tap1.matchFloat(tap2);
	  }

	  _update (resolver, type) {
	    switch (type.typeName) {
	      case 'float':
	      case 'int':
	        resolver._read = type._read;
	        break;
	      case 'abstract:long':
	      case 'long':
	        // No need to worry about precision loss here since we're always
	        // rounding to float anyway.
	        resolver._read = function (tap) { return tap.readLong(); };
	    }
	  }

	  random () { return RANDOM.nextFloat(1e3); }
	}

	FloatType.prototype.typeName = 'float';

	/** Doubles. */
	class DoubleType extends PrimitiveType {
	  _check (val, flags, hook) {
	    let b = typeof val == 'number';
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) { return tap.readDouble(); }

	  _skip (tap) { tap.skipDouble(); }

	  _write (tap, val) {
	    if (typeof val != 'number') {
	      throwInvalidError(val, this);
	    }
	    tap.writeDouble(val);
	  }

	  _match (tap1, tap2) {
	    return tap1.matchDouble(tap2);
	  }

	  _update (resolver, type) {
	    switch (type.typeName) {
	      case 'double':
	      case 'float':
	      case 'int':
	        resolver._read = type._read;
	        break;
	      case 'abstract:long':
	      case 'long':
	        // Similar to inside `FloatType`, no need to worry about precision loss
	        // here since we're always rounding to double anyway.
	        resolver._read = function (tap) { return tap.readLong(); };
	    }
	  }

	  random () { return RANDOM.nextFloat(); }
	}

	DoubleType.prototype.typeName = 'double';

	/** Strings. */
	class StringType extends PrimitiveType {
	  _check (val, flags, hook) {
	    let b = typeof val == 'string';
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) { return tap.readString(); }

	  _skip (tap) { tap.skipString(); }

	  _write (tap, val) {
	    if (typeof val != 'string') {
	      throwInvalidError(val, this);
	    }
	    tap.writeString(val);
	  }

	  _match (tap1, tap2) {
	    return tap1.matchBytes(tap2);
	  }

	  _update (resolver, type) {
	    switch (type.typeName) {
	      case 'bytes':
	      case 'string':
	        resolver._read = this._read;
	    }
	  }

	  random () {
	    return RANDOM.nextString(RANDOM.nextInt(32));
	  }
	}

	StringType.prototype.typeName = 'string';

	/**
	 * Bytes.
	 *
	 * These are represented in memory as `Uint8Array`s rather than binary-encoded
	 * strings. This is more efficient (when decoding/encoding from bytes, the
	 * common use-case), idiomatic, and convenient.
	 *
	 * Note the coercion in `_copy`.
	 */
	class BytesType extends PrimitiveType {
	  _check (val, flags, hook) {
	    let b = isBufferLike(val);
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) { return tap.readBytes(); }

	  _skip (tap) { tap.skipBytes(); }

	  _write (tap, val) {
	    if (!isBufferLike(val)) {
	      throwInvalidError(val, this);
	    }
	    tap.writeBytes(val);
	  }

	  _match (tap1, tap2) {
	    return tap1.matchBytes(tap2);
	  }

	  _update (resolver, type) {
	    switch (type.typeName) {
	      case 'bytes':
	      case 'string':
	        resolver._read = this._read;
	    }
	  }

	  _copy (obj, opts) {
	    let buf;
	    switch ((opts && opts.coerce) | 0) {
	      case 3: // Coerce buffers to strings.
	        this._check(obj, undefined, throwInvalidError);
	        return utils.bufferToBinaryString(obj);
	      case 2: // Coerce strings to buffers.
	        if (typeof obj != 'string') {
	          throw new Error(`cannot coerce to buffer: ${j(obj)}`);
	        }
	        buf = utils.binaryStringToBuffer(obj);
	        this._check(buf, undefined, throwInvalidError);
	        return buf;
	      case 1: // Coerce buffer JSON representation to buffers.
	        if (!isJsonBuffer(obj)) {
	          throw new Error(`cannot coerce to buffer: ${j(obj)}`);
	        }
	        buf = new Uint8Array(obj.data);
	        this._check(buf, undefined, throwInvalidError);
	        return buf;
	      default: // Copy buffer.
	        this._check(obj, undefined, throwInvalidError);
	        return new Uint8Array(obj);
	    }
	  }

	  random () {
	    return RANDOM.nextBuffer(RANDOM.nextInt(32));
	  }
	}

	BytesType.prototype.compare = utils.bufCompare;

	BytesType.prototype.typeName = 'bytes';

	/** Base "abstract" Avro union type. */
	class UnionType extends Type {
	  constructor (schema, opts) {
	    super();

	    if (!Array.isArray(schema)) {
	      throw new Error(`non-array union schema: ${j(schema)}`);
	    }
	    if (!schema.length) {
	      throw new Error('empty union');
	    }
	    this.types = Object.freeze(schema.map((obj) => {
	      return Type.forSchema(obj, opts);
	    }));

	    this._branchIndices = {};
	    this.types.forEach(function (type, i) {
	      if (Type.isType(type, 'union')) {
	        throw new Error('unions cannot be directly nested');
	      }
	      let branch = type.branchName;
	      if (this._branchIndices[branch] !== undefined) {
	        throw new Error(`duplicate union branch name: ${j(branch)}`);
	      }
	      this._branchIndices[branch] = i;
	    }, this);
	  }

	  _skip (tap) {
	    this.types[tap.readLong()]._skip(tap);
	  }

	  _match (tap1, tap2) {
	    let n1 = tap1.readLong();
	    let n2 = tap2.readLong();
	    if (n1 === n2) {
	      return this.types[n1]._match(tap1, tap2);
	    } else {
	      return n1 < n2 ? -1 : 1;
	    }
	  }

	  _deref (schema, derefed, opts) {
	    return this.types.map((t) => { return t._attrs(derefed, opts); });
	  }

	  getTypes () { return this.types; }
	}

	// Cannot be defined as a class method because it's used as a constructor.
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions#method_definitions_are_not_constructable
	UnionType.prototype._branchConstructor = function () {
	  throw new Error('unions cannot be directly wrapped');
	};


	function generateProjectionIndexer(projectionFn) {
	  return (val) => {
	    const index = projectionFn(val);
	    if (typeof index !== 'number') {
	      throw new Error(`Projected index '${index}' is not valid`);
	    }
	    return index;
	  };
	}

	function generateDefaultIndexer(types, self) {
	  const dynamicBranches = [];
	  const bucketIndices = {};

	  const getBranchIndex = (any, index) => {
	    let logicalBranches = dynamicBranches;
	    for (let i = 0, l = logicalBranches.length; i < l; i++) {
	      let branch = logicalBranches[i];
	      if (branch.type._check(any)) {
	        if (index === undefined) {
	          index = branch.index;
	        } else {
	          // More than one branch matches the value so we aren't guaranteed to
	          // infer the correct type. We throw rather than corrupt data. This can
	          // be fixed by "tightening" the logical types.
	          throw new Error('ambiguous conversion');
	        }
	      }
	    }
	    return index;
	  };

	  types.forEach(function (type, index) {
	    if (Type.isType(type, 'abstract', 'logical')) {
	      dynamicBranches.push({index, type});
	    } else {
	      let bucket = getTypeBucket(type);
	      if (bucketIndices[bucket] !== undefined) {
	        throw new Error(`ambiguous unwrapped union: ${j(self)}`);
	      }
	      bucketIndices[bucket] = index;
	    }
	  });
	  return (val) => {
	    let index = bucketIndices[getValueBucket(val)];
	    if (dynamicBranches.length) {
	      // Slower path, we must run the value through all branches.
	      index = getBranchIndex(val, index);
	    }
	    return index;
	  };
	}

	/**
	 * "Natural" union type.
	 *
	 * This representation doesn't require a wrapping object and is therefore
	 * simpler and generally closer to what users expect. However it cannot be used
	 * to represent all Avro unions since some lead to ambiguities (e.g. if two
	 * number types are in the union).
	 *
	 * Currently, this union supports at most one type in each of the categories
	 * below:
	 *
	 * + `null`
	 * + `boolean`
	 * + `int`, `long`, `float`, `double`
	 * + `string`, `enum`
	 * + `bytes`, `fixed`
	 * + `array`
	 * + `map`, `record`
	 */
	class UnwrappedUnionType extends UnionType {
	  constructor (schema, opts, /* @private parameter */ _projectionFn) {
	    super(schema, opts);

	    if (!_projectionFn && opts && typeof opts.wrapUnions === 'function') {
	      _projectionFn = opts.wrapUnions(this.types);
	    }
	    this._getIndex = _projectionFn
	      ? generateProjectionIndexer(_projectionFn)
	      : generateDefaultIndexer(this.types, this);

	    Object.freeze(this);
	  }

	  _check (val, flags, hook, path) {
	    let index = this._getIndex(val);
	    let b = index !== undefined;
	    if (b) {
	      return this.types[index]._check(val, flags, hook, path);
	    }
	    if (hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) {
	    let index = tap.readLong();
	    let branchType = this.types[index];
	    if (branchType) {
	      return branchType._read(tap);
	    } else {
	      throw new Error(`invalid union index: ${index}`);
	    }
	  }

	  _write (tap, val) {
	    let index = this._getIndex(val);
	    if (index === undefined) {
	      throwInvalidError(val, this);
	    }
	    tap.writeLong(index);
	    if (val !== null) {
	      this.types[index]._write(tap, val);
	    }
	  }

	  _update (resolver, type, opts) {
	    for (let i = 0, l = this.types.length; i < l; i++) {
	      let typeResolver;
	      try {
	        typeResolver = this.types[i].createResolver(type, opts);
	      } catch (err) {
	        continue;
	      }
	      resolver._read = function (tap) { return typeResolver._read(tap); };
	      return;
	    }
	  }

	  _copy (val, opts) {
	    let coerce = opts && opts.coerce | 0;
	    let wrap = opts && opts.wrap | 0;
	    let index;
	    if (wrap === 2) {
	      // We are parsing a default, so always use the first branch's type.
	      index = 0;
	    } else {
	      switch (coerce) {
	        case 1:
	          // Using the `coerceBuffers` option can cause corruption and erroneous
	          // failures with unwrapped unions (in rare cases when the union also
	          // contains a record which matches a buffer's JSON representation).
	          if (isJsonBuffer(val)) {
	            let bufIndex = this.types.findIndex(t => getTypeBucket(t) === 'buffer');
	            if (bufIndex !== -1) {
	              index = bufIndex;
	            }
	          }
	          index ??= this._getIndex(val);
	          break;
	        case 2:
	          // Decoding from JSON, we must unwrap the value.
	          if (val === null) {
	            index = this._getIndex(null);
	          } else if (typeof val === 'object') {
	            let keys = Object.keys(val);
	            if (keys.length === 1) {
	              index = this._branchIndices[keys[0]];
	              val = val[keys[0]];
	            }
	          }
	          break;
	        default:
	          index = this._getIndex(val);
	      }
	      if (index === undefined) {
	        throwInvalidError(val, this);
	      }
	    }
	    let type = this.types[index];
	    if (val === null || wrap === 3) {
	      return type._copy(val, opts);
	    } else {
	      switch (coerce) {
	        case 3: {
	          // Encoding to JSON, we wrap the value.
	          let obj = {};
	          obj[type.branchName] = type._copy(val, opts);
	          return obj;
	        }
	        default:
	          return type._copy(val, opts);
	      }
	    }
	  }

	  compare (val1, val2) {
	    let index1 = this._getIndex(val1);
	    let index2 = this._getIndex(val2);
	    if (index1 === undefined) {
	      throwInvalidError(val1, this);
	    } else if (index2 === undefined) {
	      throwInvalidError(val2, this);
	    } else if (index1 === index2) {
	      return this.types[index1].compare(val1, val2);
	    } else {
	      return utils.compare(index1, index2);
	    }
	  }

	  random () {
	    let index = RANDOM.nextInt(this.types.length);
	    return this.types[index].random();
	  }
	}

	UnwrappedUnionType.prototype.typeName = 'union:unwrapped';

	/**
	 * Compatible union type.
	 *
	 * Values of this type are represented in memory similarly to their JSON
	 * representation (i.e. inside an object with single key the name of the
	 * contained type).
	 *
	 * This is not ideal, but is the most efficient way to unambiguously support
	 * all unions. Here are a few reasons why the wrapping object is necessary:
	 *
	 * + Unions with multiple number types would have undefined behavior, unless
	 *   numbers are wrapped (either everywhere, leading to large performance and
	 *   convenience costs; or only when necessary inside unions, making it hard to
	 *   understand when numbers are wrapped or not).
	 * + Fixed types would have to be wrapped to be distinguished from bytes.
	 * + Using record's constructor names would work (after a slight change to use
	 *   the fully qualified name), but would mean that generic objects could no
	 *   longer be valid records (making it inconvenient to do simple things like
	 *   creating new records).
	 */
	class WrappedUnionType extends UnionType {
	  constructor (schema, opts) {
	    super(schema, opts);
	    Object.freeze(this);
	  }

	  _check (val, flags, hook, path) {
	    let b = false;
	    if (val === null) {
	      // Shortcut type lookup in this case.
	      b = this._branchIndices['null'] !== undefined;
	    } else if (typeof val == 'object') {
	      let keys = Object.keys(val);
	      if (keys.length === 1) {
	        // We require a single key here to ensure that writes are correct and
	        // efficient as soon as a record passes this check.
	        let name = keys[0];
	        let index = this._branchIndices[name];
	        if (index !== undefined) {
	          if (hook) {
	            // Slow path.
	            path.push(name);
	            b = this.types[index]._check(val[name], flags, hook, path);
	            path.pop();
	            return b;
	          } else {
	            return this.types[index]._check(val[name], flags);
	          }
	        }
	      }
	    }
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) {
	    let type = this.types[tap.readLong()];
	    if (!type) {
	      throw new Error('invalid union index');
	    }
	    let Branch = type._branchConstructor;
	    if (Branch === null) {
	      return null;
	    } else {
	      return new Branch(type._read(tap));
	    }
	  }

	  _write (tap, val) {
	    let index;
	    if (val === null) {
	      index = this._branchIndices['null'];
	      if (index === undefined) {
	        throwInvalidError(val, this);
	      }
	      tap.writeLong(index);
	    } else {
	      let keys = Object.keys(val), name;
	      if (keys.length === 1) {
	        name = keys[0];
	        index = this._branchIndices[name];
	      }
	      if (index === undefined) {
	        throwInvalidError(val, this);
	      }
	      tap.writeLong(index);
	      this.types[index]._write(tap, val[name]);
	    }
	  }

	  _update (resolver, type, opts) {
	    for (let i = 0, l = this.types.length; i < l; i++) {
	      let typeResolver;
	      try {
	        typeResolver = this.types[i].createResolver(type, opts);
	      } catch (err) {
	        continue;
	      }
	      let Branch = this.types[i]._branchConstructor;
	      if (Branch) {
	        // The loop exits after the first function is created.
	        // eslint-disable-next-line no-loop-func
	        resolver._read = function (tap) {
	          return new Branch(typeResolver._read(tap));
	        };
	      } else {
	        resolver._read = function () { return null; };
	      }
	      return;
	    }
	  }

	  _copy (val, opts) {
	    let wrap = opts && opts.wrap | 0;
	    if (wrap === 2) {
	      let firstType = this.types[0];
	      // Promote into first type (used for schema defaults).
	      if (val === null && firstType.typeName === 'null') {
	        return null;
	      }
	      return new firstType._branchConstructor(firstType._copy(val, opts));
	    }
	    if (val === null && this._branchIndices['null'] !== undefined) {
	      return null;
	    }

	    let i, l, obj;
	    if (typeof val == 'object') {
	      let keys = Object.keys(val);
	      if (keys.length === 1) {
	        let name = keys[0];
	        i = this._branchIndices[name];
	        if (i === undefined && opts.qualifyNames) {
	          // We are a bit more flexible than in `_check` here since we have
	          // to deal with other serializers being less strict, so we fall
	          // back to looking up unqualified names.
	          let j, type;
	          for (j = 0, l = this.types.length; j < l; j++) {
	            type = this.types[j];
	            if (type.name && name === utils.unqualify(type.name)) {
	              i = j;
	              break;
	            }
	          }
	        }
	        if (i !== undefined) {
	          obj = this.types[i]._copy(val[name], opts);
	        }
	      }
	    }
	    if (wrap === 1 && obj === undefined) {
	      // Try promoting into first match (convenience, slow).
	      i = 0;
	      l = this.types.length;
	      while (i < l && obj === undefined) {
	        try {
	          obj = this.types[i]._copy(val, opts);
	        } catch (err) {
	          i++;
	        }
	      }
	    }
	    if (obj !== undefined) {
	      return wrap === 3 ? obj : new this.types[i]._branchConstructor(obj);
	    }
	    throwInvalidError(val, this);
	  }

	  compare (val1, val2) {
	    let name1 = val1 === null ? 'null' : Object.keys(val1)[0];
	    let name2 = val2 === null ? 'null' : Object.keys(val2)[0];
	    let index = this._branchIndices[name1];
	    if (name1 === name2) {
	      return name1 === 'null' ?
	        0 :
	        this.types[index].compare(val1[name1], val2[name1]);
	    } else {
	      return utils.compare(index, this._branchIndices[name2]);
	    }
	  }

	  random () {
	    let index = RANDOM.nextInt(this.types.length);
	    let type = this.types[index];
	    let Branch = type._branchConstructor;
	    if (!Branch) {
	      return null;
	    }
	    return new Branch(type.random());
	  }
	}

	WrappedUnionType.prototype.typeName = 'union:wrapped';

	/**
	 * Avro enum type.
	 *
	 * Represented as strings (with allowed values from the set of symbols). Using
	 * integers would be a reasonable option, but the performance boost is arguably
	 * offset by the legibility cost and the extra deviation from the JSON encoding
	 * convention.
	 *
	 * An integer representation can still be used (e.g. for compatibility with
	 * TypeScript `enum`s) by overriding the `EnumType` with a `LongType` (e.g. via
	 * `parse`'s registry).
	 */
	class EnumType extends Type {
	  constructor (schema, opts) {
	    super(schema, opts);
	    if (!Array.isArray(schema.symbols) || !schema.symbols.length) {
	      throw new Error(`invalid enum symbols: ${j(schema.symbols)}`);
	    }
	    this.symbols = Object.freeze(schema.symbols.slice());
	    this._indices = {};
	    this.symbols.forEach(function (symbol, i) {
	      if (!utils.isValidName(symbol)) {
	        throw new Error(`invalid ${this} symbol: ${j(symbol)}`);
	      }
	      if (this._indices[symbol] !== undefined) {
	        throw new Error(`duplicate ${this} symbol: ${j(symbol)}`);
	      }
	      this._indices[symbol] = i;
	    }, this);
	    this.default = schema.default;
	    if (
	      this.default !== undefined &&
	      this._indices[this.default] === undefined
	    ) {
	      throw new Error(`invalid ${this} default: ${j(this.default)}`);
	    }
	    this._branchConstructor = this._createBranchConstructor();
	    Object.freeze(this);
	  }

	  _check (val, flags, hook) {
	    let b = this._indices[val] !== undefined;
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) {
	    let index = tap.readLong();
	    let symbol = this.symbols[index];
	    if (symbol === undefined) {
	      throw new Error(`invalid ${this.name} enum index: ${index}`);
	    }
	    return symbol;
	  }

	  _skip (tap) { tap.skipLong(); }

	  _write (tap, val) {
	    let index = this._indices[val];
	    if (index === undefined) {
	      throwInvalidError(val, this);
	    }
	    tap.writeLong(index);
	  }

	  _match (tap1, tap2) {
	    return tap1.matchLong(tap2);
	  }

	  compare (val1, val2) {
	    return utils.compare(this._indices[val1], this._indices[val2]);
	  }

	  _update (resolver, type, opts) {
	    let symbols = this.symbols;
	    if (
	      type.typeName === 'enum' &&
	      hasCompatibleName(this, type, !opts.ignoreNamespaces) &&
	      (
	        type.symbols.every((s) => { return ~symbols.indexOf(s); }) ||
	        this.default !== undefined
	      )
	    ) {
	      resolver.symbols = type.symbols.map(function (s) {
	        return this._indices[s] === undefined ? this.default : s;
	      }, this);
	      resolver._read = type._read;
	    }
	  }

	  _copy (val) {
	    this._check(val, undefined, throwInvalidError);
	    return val;
	  }

	  _deref (schema) {
	    schema.symbols = this.symbols;
	  }

	  getSymbols () { return this.symbols; }

	  random () {
	    return RANDOM.choice(this.symbols);
	  }
	}

	EnumType.prototype.typeName = 'enum';

	/** Avro fixed type. Represented simply as a `Uint8Array`. */
	class FixedType extends Type {
	  constructor (schema, opts) {
	    super(schema, opts);
	    if (schema.size !== (schema.size | 0) || schema.size < 0) {
	      throw new Error(`invalid ${this.branchName} size`);
	    }
	    this.size = schema.size | 0;
	    this._branchConstructor = this._createBranchConstructor();
	    Object.freeze(this);
	  }

	  _check (val, flags, hook) {
	    let b = isBufferLike(val) && val.length === this.size;
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) {
	    return tap.readFixed(this.size);
	  }

	  _skip (tap) {
	    tap.skipFixed(this.size);
	  }

	  _write (tap, val) {
	    if (!isBufferLike(val) || val.length !== this.size) {
	      throwInvalidError(val, this);
	    }
	    tap.writeFixed(val, this.size);
	  }

	  _match (tap1, tap2) {
	    return tap1.matchFixed(tap2, this.size);
	  }

	  _update (resolver, type, opts) {
	    if (
	      type.typeName === 'fixed' &&
	      this.size === type.size &&
	      hasCompatibleName(this, type, !opts.ignoreNamespaces)
	    ) {
	      resolver.size = this.size;
	      resolver._read = this._read;
	    }
	  }

	  _deref (schema) { schema.size = this.size; }

	  getSize () { return this.size; }

	  random () {
	    return RANDOM.nextBuffer(this.size);
	  }
	}

	FixedType.prototype._copy = BytesType.prototype._copy;

	FixedType.prototype.compare = utils.bufCompare;

	FixedType.prototype.typeName = 'fixed';

	/** Avro map. Represented as vanilla objects. */
	class MapType extends Type {
	  constructor (schema, opts) {
	    super();
	    if (!schema.values) {
	      throw new Error(`missing map values: ${j(schema)}`);
	    }
	    this.valuesType = Type.forSchema(schema.values, opts);
	    this._branchConstructor = this._createBranchConstructor();
	    Object.freeze(this);
	  }

	  _check (val, flags, hook, path) {
	    if (!val || typeof val != 'object' || Array.isArray(val)) {
	      if (hook) {
	        hook(val, this);
	      }
	      return false;
	    }

	    let keys = Object.keys(val);
	    let b = true;
	    if (hook) {
	      // Slow path.
	      let j = path.length;
	      path.push('');
	      for (let i = 0, l = keys.length; i < l; i++) {
	        let key = path[j] = keys[i];
	        if (!this.valuesType._check(val[key], flags, hook, path)) {
	          b = false;
	        }
	      }
	      path.pop();
	    } else {
	      for (let i = 0, l = keys.length; i < l; i++) {
	        if (!this.valuesType._check(val[keys[i]], flags)) {
	          return false;
	        }
	      }
	    }
	    return b;
	  }

	  _read (tap) {
	    let values = this.valuesType;
	    let val = {};
	    let n;
	    while ((n = readArraySize(tap))) {
	      while (n--) {
	        let key = tap.readString();
	        val[key] = values._read(tap);
	      }
	    }
	    return val;
	  }

	  _skip (tap) {
	    let values = this.valuesType;
	    let n;
	    while ((n = tap.readLong())) {
	      if (n < 0) {
	        let len = tap.readLong();
	        tap.pos += len;
	      } else {
	        while (n--) {
	          tap.skipString();
	          values._skip(tap);
	        }
	      }
	    }
	  }

	  _write (tap, val) {
	    if (!val || typeof val != 'object' || Array.isArray(val)) {
	      throwInvalidError(val, this);
	    }

	    let values = this.valuesType;
	    let keys = Object.keys(val);
	    let n = keys.length;
	    if (n) {
	      tap.writeLong(n);
	      for (let i = 0; i < n; i++) {
	        let key = keys[i];
	        tap.writeString(key);
	        values._write(tap, val[key]);
	      }
	    }
	    tap.writeLong(0);
	  }

	  _match () {
	    throw new Error('maps cannot be compared');
	  }

	  _update (rsv, type, opts) {
	    if (type.typeName === 'map') {
	      rsv.valuesType = this.valuesType.createResolver(type.valuesType, opts);
	      rsv._read = this._read;
	    }
	  }

	  _copy (val, opts) {
	    if (val && typeof val == 'object' && !Array.isArray(val)) {
	      let values = this.valuesType;
	      let keys = Object.keys(val);
	      let copy = {};
	      for (let i = 0, l = keys.length; i < l; i++) {
	        let key = keys[i];
	        copy[key] = values._copy(val[key], opts);
	      }
	      return copy;
	    }
	    throwInvalidError(val, this);
	  }

	  getValuesType () { return this.valuesType; }

	  random () {
	    let val = {};
	    for (let i = 0, l = RANDOM.nextInt(10); i < l; i++) {
	      val[RANDOM.nextString(RANDOM.nextInt(20))] = this.valuesType.random();
	    }
	    return val;
	  }

	  _deref (schema, derefed, opts) {
	    schema.values = this.valuesType._attrs(derefed, opts);
	  }
	}

	MapType.prototype.compare = MapType.prototype._match;

	MapType.prototype.typeName = 'map';

	/** Avro array. Represented as vanilla arrays. */
	class ArrayType extends Type {
	  constructor (schema, opts) {
	    super();
	    if (!schema.items) {
	      throw new Error(`missing array items: ${j(schema)}`);
	    }
	    this.itemsType = Type.forSchema(schema.items, opts);
	    this._branchConstructor = this._createBranchConstructor();
	    Object.freeze(this);
	  }

	  _check (val, flags, hook, path) {
	    if (!Array.isArray(val)) {
	      if (hook) {
	        hook(val, this);
	      }
	      return false;
	    }
	    let items = this.itemsType;
	    let b = true;
	    if (hook) {
	      // Slow path.
	      let j = path.length;
	      path.push('');
	      for (let i = 0, l = val.length; i < l; i++) {
	        path[j] = '' + i;
	        if (!items._check(val[i], flags, hook, path)) {
	          b = false;
	        }
	      }
	      path.pop();
	    } else {
	      for (let i = 0, l = val.length; i < l; i++) {
	        if (!items._check(val[i], flags)) {
	          return false;
	        }
	      }
	    }
	    return b;
	  }

	  _read (tap) {
	    let items = this.itemsType;
	    let i = 0;
	    let val, n;
	    while ((n = tap.readLong())) {
	      if (n < 0) {
	        n = -n;
	        tap.skipLong(); // Skip size.
	      }
	      // Initializing the array on the first batch gives a ~10% speedup. See
	      // https://github.com/mtth/avsc/pull/338 for more context.
	      val = val || new Array(n);
	      while (n--) {
	        val[i++] = items._read(tap);
	      }
	    }
	    return val || [];
	  }

	  _skip (tap) {
	    let items = this.itemsType;
	    let n;
	    while ((n = tap.readLong())) {
	      if (n < 0) {
	        let len = tap.readLong();
	        tap.pos += len;
	      } else {
	        while (n--) {
	          items._skip(tap);
	        }
	      }
	    }
	  }

	  _write (tap, val) {
	    if (!Array.isArray(val)) {
	      throwInvalidError(val, this);
	    }
	    let items = this.itemsType;
	    let n = val.length;
	    if (n) {
	      tap.writeLong(n);
	      for (let i = 0; i < n; i++) {
	        items._write(tap, val[i]);
	      }
	    }
	    tap.writeLong(0);
	  }

	  _match (tap1, tap2) {
	    let n1 = tap1.readLong();
	    let n2 = tap2.readLong();
	    while (n1 && n2) {
	      let f = this.itemsType._match(tap1, tap2);
	      if (f) {
	        return f;
	      }
	      if (!--n1) {
	        n1 = readArraySize(tap1);
	      }
	      if (!--n2) {
	        n2 = readArraySize(tap2);
	      }
	    }
	    return utils.compare(n1, n2);
	  }

	  _update (resolver, type, opts) {
	    if (type.typeName === 'array') {
	      resolver.itemsType = this.itemsType.createResolver(type.itemsType, opts);
	      resolver._read = this._read;
	    }
	  }

	  _copy (val, opts) {
	    if (!Array.isArray(val)) {
	      throwInvalidError(val, this);
	    }
	    let items = new Array(val.length);
	    for (let i = 0, l = val.length; i < l; i++) {
	      items[i] = this.itemsType._copy(val[i], opts);
	    }
	    return items;
	  }

	  _deref (schema, derefed, opts) {
	    schema.items = this.itemsType._attrs(derefed, opts);
	  }

	  compare (val1, val2) {
	    let n1 = val1.length;
	    let n2 = val2.length;
	    let f;
	    for (let i = 0, l = Math.min(n1, n2); i < l; i++) {
	      if ((f = this.itemsType.compare(val1[i], val2[i]))) {
	        return f;
	      }
	    }
	    return utils.compare(n1, n2);
	  }

	  getItemsType () { return this.itemsType; }

	  random () {
	    let arr = [];
	    for (let i = 0, l = RANDOM.nextInt(10); i < l; i++) {
	      arr.push(this.itemsType.random());
	    }
	    return arr;
	  }
	}

	ArrayType.prototype.typeName = 'array';

	/**
	 * Avro record.
	 *
	 * Values are represented as instances of a programmatically generated
	 * constructor (similar to a "specific record"), available via the
	 * `getRecordConstructor` method. This "specific record class" gives
	 * significant speedups over using generics objects.
	 *
	 * Note that vanilla objects are still accepted as valid as long as their
	 * fields match (this makes it much more convenient to do simple things like
	 * update nested records).
	 *
	 * This type is also used for errors (similar, except for the extra `Error`
	 * constructor call) and for messages (see comment below).
	 */
	class RecordType extends Type {
	  constructor (schema, opts) {
	    opts = Object.assign({}, opts);

	    if (schema.namespace !== undefined) {
	      opts.namespace = schema.namespace;
	    } else if (schema.name) {
	      // Fully qualified names' namespaces are used when no explicit namespace
	      // attribute was specified.
	      let ns = utils.impliedNamespace(schema.name);
	      if (ns !== undefined) {
	        opts.namespace = ns;
	      }
	    }
	    super(schema, opts);

	    if (!Array.isArray(schema.fields)) {
	      throw new Error(`non-array record fields: ${j(schema.fields)}`);
	    }
	    if (utils.hasDuplicates(schema.fields, (f) => { return f.name; })) {
	      throw new Error(`duplicate field name:${j(schema.fields)}`);
	    }
	    this._fieldsByName = {};
	    this.fields = Object.freeze(schema.fields.map(function (f) {
	      let field = new Field(f, opts);
	      this._fieldsByName[field.name] = field;
	      return field;
	    }, this));
	    this._branchConstructor = this._createBranchConstructor();
	    this._isError = schema.type === 'error';
	    this.recordConstructor = this._createConstructor(
	      opts.errorStackTraces,
	      opts.omitRecordMethods
	    );
	    this._read = this._createReader();
	    this._skip = this._createSkipper();
	    this._write = this._createWriter();
	    this._check = this._createChecker();

	    Object.freeze(this);
	  }

	  _getConstructorName () {
	    return this.name ?
	      utils.capitalize(utils.unqualify(this.name)) :
	      this._isError ? 'Error$' : 'Record$';
	  }

	  _createConstructor (errorStack, plainRecords) {
	    let outerArgs = [];
	    let innerArgs = [];
	    let ds = []; // Defaults.
	    let innerBody = '';
	    let stackField;
	    for (let i = 0, l = this.fields.length; i < l; i++) {
	      let field = this.fields[i];
	      let defaultValue = field.defaultValue;
	      let hasDefault = defaultValue() !== undefined;
	      let name = field.name;
	      if (
	        errorStack && this._isError && name === 'stack' &&
	        Type.isType(field.type, 'string') && !hasDefault
	      ) {
	        // We keep track of whether we've encountered a valid stack field (in
	        // particular, without a default) to populate a stack trace below.
	        stackField = field;
	      }
	      innerArgs.push('v' + i);
	      innerBody += '  ';
	      if (!hasDefault) {
	        innerBody += 'this.' + name + ' = v' + i + ';\n';
	      } else {
	        innerBody += 'if (v' + i + ' === undefined) { ';
	        innerBody += 'this.' + name + ' = d' + ds.length + '(); ';
	        innerBody += '} else { this.' + name + ' = v' + i + '; }\n';
	        outerArgs.push('d' + ds.length);
	        ds.push(defaultValue);
	      }
	    }
	    if (stackField) {
	      // We should populate a stack trace.
	      innerBody += '  if (this.stack === undefined) { ';
	      /* istanbul ignore else */
	      if (typeof Error.captureStackTrace == 'function') {
	        // v8 runtimes, the easy case.
	        innerBody += 'Error.captureStackTrace(this, this.constructor);';
	      } else {
	        // A few other runtimes (e.g. SpiderMonkey), might not work everywhere.
	        innerBody += 'this.stack = Error().stack;';
	      }
	      innerBody += ' }\n';
	    }
	    let outerBody = 'return function ' + this._getConstructorName() + '(';
	    outerBody += innerArgs.join() + ') {\n' + innerBody + '};';
	    // eslint-disable-next-line no-new-func
	    let Record = new Function(outerArgs.join(), outerBody).apply(undefined, ds);
	    if (plainRecords) {
	      return Record;
	    }

	    let self = this;
	    Record.getType = function () { return self; };
	    Record.type = self;
	    if (this._isError) {
	      Record.prototype = Object.create(Error.prototype, {
	        constructor: {
	          value: Record,
	          enumerable: false,
	          writable: true,
	          configurable: true
	        }
	      });
	      Record.prototype.name = this._getConstructorName();
	    }
	    Record.prototype.clone = function (o) { return self.clone(this, o); };
	    Record.prototype.compare = function (v) { return self.compare(this, v); };
	    Record.prototype.isValid = function (o) { return self.isValid(this, o); };
	    Record.prototype.toBuffer = function () { return self.toBuffer(this); };
	    Record.prototype.toString = function () { return self.toString(this); };
	    Record.prototype.wrap = function () { return self.wrap(this); };
	    Record.prototype.wrapped = Record.prototype.wrap; // Deprecated.
	    return Record;
	  }

	  _createChecker () {
	    let names = [];
	    let values = [];
	    let name = this._getConstructorName();
	    let body = 'return function check' + name + '(v, f, h, p) {\n';
	    body += '  if (\n';
	    body += '    v === null ||\n';
	    body += '    typeof v != \'object\' ||\n';
	    body += '    (f && !this._checkFields(v))\n';
	    body += '  ) {\n';
	    body += '    if (h) { h(v, this); }\n';
	    body += '    return false;\n';
	    body += '  }\n';
	    if (!this.fields.length) {
	      // Special case, empty record. We handle this directly.
	      body += '  return true;\n';
	    } else {
	      let field;
	      for (let i = 0, l = this.fields.length; i < l; i++) {
	        field = this.fields[i];
	        names.push('t' + i);
	        values.push(field.type);
	        if (field.defaultValue() !== undefined) {
	          body += '  var v' + i + ' = v.' + field.name + ';\n';
	        }
	      }
	      body += '  if (h) {\n';
	      body += '    var b = 1;\n';
	      body += '    var j = p.length;\n';
	      body += '    p.push(\'\');\n';
	      for (let i = 0, l = this.fields.length; i < l; i++) {
	        field = this.fields[i];
	        body += '    p[j] = \'' + field.name + '\';\n';
	        body += '    b &= ';
	        if (field.defaultValue() === undefined) {
	          body += 't' + i + '._check(v.' + field.name + ', f, h, p);\n';
	        } else {
	          body += 'v' + i + ' === undefined || ';
	          body += 't' + i + '._check(v' + i + ', f, h, p);\n';
	        }
	      }
	      body += '    p.pop();\n';
	      body += '    return !!b;\n';
	      body += '  } else {\n    return (\n      ';
	      body += this.fields.map((field, i) => {
	        return field.defaultValue() === undefined ?
	          't' + i + '._check(v.' + field.name + ', f)' :
	          '(v' + i + ' === undefined || t' + i + '._check(v' + i + ', f))';
	      }).join(' &&\n      ');
	      body += '\n    );\n  }\n';
	    }
	    body += '};';
	    // eslint-disable-next-line no-new-func
	    return new Function(names.join(), body).apply(undefined, values);
	  }

	  _createReader () {
	    let names = [];
	    let values = [this.recordConstructor];
	    for (let i = 0, l = this.fields.length; i < l; i++) {
	      names.push('t' + i);
	      values.push(this.fields[i].type);
	    }
	    let name = this._getConstructorName();
	    let body = 'return function read' + name + '(t) {\n';
	    body += '  return new ' + name + '(\n    ';
	    body += names.map((s) => { return s + '._read(t)'; }).join(',\n    ');
	    body += '\n  );\n};';
	    names.unshift(name);
	    // We can do this since the JS spec guarantees that function arguments are
	    // evaluated from left to right.
	    // eslint-disable-next-line no-new-func
	    return new Function(names.join(), body).apply(undefined, values);
	  }

	  _createSkipper () {
	    let args = [];
	    let body = 'return function skip' + this._getConstructorName() + '(t) {\n';
	    let values = [];
	    for (let i = 0, l = this.fields.length; i < l; i++) {
	      args.push('t' + i);
	      values.push(this.fields[i].type);
	      body += '  t' + i + '._skip(t);\n';
	    }
	    body += '}';
	    // eslint-disable-next-line no-new-func
	    return new Function(args.join(), body).apply(undefined, values);
	  }

	  _createWriter () {
	    // We still do default handling here, in case a normal JS object is passed.
	    let args = [];
	    let name = this._getConstructorName();
	    let body = 'return function write' + name + '(t, v) {\n';
	    let values = [];
	    for (let i = 0, l = this.fields.length; i < l; i++) {
	      let field = this.fields[i];
	      args.push('t' + i);
	      values.push(field.type);
	      body += '  ';
	      if (field.defaultValue() === undefined) {
	        body += 't' + i + '._write(t, v.' + field.name + ');\n';
	      } else {
	        let value = field.type.toBuffer(field.defaultValue());
	        args.push('d' + i);
	        values.push(value);
	        body += 'var v' + i + ' = v.' + field.name + ';\n';
	        body += 'if (v' + i + ' === undefined) {\n';
	        body += '    t.writeFixed(d' + i + ', ' + value.length + ');\n';
	        body += '  } else {\n    t' + i + '._write(t, v' + i + ');\n  }\n';
	      }
	    }
	    body += '}';
	    // eslint-disable-next-line no-new-func
	    return new Function(args.join(), body).apply(undefined, values);
	  }

	  _update (resolver, type, opts) {
	    if (!hasCompatibleName(this, type, !opts.ignoreNamespaces)) {
	      throw new Error(`no alias found for ${type.name}`);
	    }

	    let rFields = this.fields;
	    let wFields = type.fields;
	    let wFieldsMap = utils.toMap(wFields, (f) => { return f.name; });

	    let innerArgs = []; // Arguments for reader constructor.
	    let resolvers = {}; // Resolvers keyed by writer field name.
	    for (let i = 0; i < rFields.length; i++) {
	      let field = rFields[i];
	      let names = getAliases(field);
	      let matches = [];
	      for (let j = 0; j < names.length; j++) {
	        let name = names[j];
	        if (wFieldsMap[name]) {
	          matches.push(name);
	        }
	      }
	      if (matches.length > 1) {
	        throw new Error(
	          `ambiguous aliasing for ${type.name}.${field.name} (${matches.join(', ')})`
	        );
	      }
	      if (!matches.length) {
	        if (field.defaultValue() === undefined) {
	          throw new Error(
	            `no matching field for default-less ${type.name}.${field.name}`
	          );
	        }
	        innerArgs.push('undefined');
	      } else {
	        let name = matches[0];
	        let fieldResolver = {
	          resolver: field.type.createResolver(wFieldsMap[name].type, opts),
	          name: '_' + field.name, // Reader field name.
	        };
	        if (!resolvers[name]) {
	          resolvers[name] = [fieldResolver];
	        } else {
	          resolvers[name].push(fieldResolver);
	        }
	        innerArgs.push(fieldResolver.name);
	      }
	    }

	    // See if we can add a bypass for unused fields at the end of the record.
	    let lazyIndex = -1;
	    let i = wFields.length;
	    while (i && resolvers[wFields[--i].name] === undefined) {
	      lazyIndex = i;
	    }

	    let uname = this._getConstructorName();
	    let args = [uname];
	    let values = [this.recordConstructor];
	    let body = '  return function read' + uname + '(t, b) {\n';
	    for (let i = 0; i < wFields.length; i++) {
	      if (i === lazyIndex) {
	        body += '  if (!b) {\n';
	      }
	      let field = type.fields[i];
	      let name = field.name;
	      if (resolvers[name] === undefined) {
	        body += (~lazyIndex && i >= lazyIndex) ? '    ' : '  ';
	        args.push('r' + i);
	        values.push(field.type);
	        body += 'r' + i + '._skip(t);\n';
	      } else {
	        let j = resolvers[name].length;
	        while (j--) {
	          body += (~lazyIndex && i >= lazyIndex) ? '    ' : '  ';
	          args.push('r' + i + 'f' + j);
	          let fieldResolver = resolvers[name][j];
	          values.push(fieldResolver.resolver);
	          body += 'var ' + fieldResolver.name + ' = ';
	          body += 'r' + i + 'f' + j + '._' + (j ? 'peek' : 'read') + '(t);\n';
	        }
	      }
	    }
	    if (~lazyIndex) {
	      body += '  }\n';
	    }
	    body += '  return new ' + uname + '(' + innerArgs.join() + ');\n};';

	    // eslint-disable-next-line no-new-func
	    resolver._read = new Function(args.join(), body).apply(undefined, values);
	  }

	  _match (tap1, tap2) {
	    let fields = this.fields;
	    for (let i = 0, l = fields.length; i < l; i++) {
	      let field = fields[i];
	      let order = field._order;
	      let type = field.type;
	      if (order) {
	        order *= type._match(tap1, tap2);
	        if (order) {
	          return order;
	        }
	      } else {
	        type._skip(tap1);
	        type._skip(tap2);
	      }
	    }
	    return 0;
	  }

	  _checkFields (obj) {
	    let keys = Object.keys(obj);
	    for (let i = 0, l = keys.length; i < l; i++) {
	      if (!this._fieldsByName[keys[i]]) {
	        return false;
	      }
	    }
	    return true;
	  }

	  _copy (val, opts) {
	    let hook = opts && opts.fieldHook;
	    let values = [undefined];
	    for (let i = 0, l = this.fields.length; i < l; i++) {
	      let field = this.fields[i];
	      let value = val[field.name];
	      if (value === undefined &&
	          Object.prototype.hasOwnProperty.call(field, 'defaultValue')) {
	        value = field.defaultValue();
	      }
	      if ((opts && !opts.skip) || value !== undefined) {
	        value = field.type._copy(value, opts);
	      }
	      if (hook) {
	        value = hook(field, value, this);
	      }
	      values.push(value);
	    }
	    let Record = this.recordConstructor;
	    return new (Record.bind.apply(Record, values))();
	  }

	  _deref (schema, derefed, opts) {
	    schema.fields = this.fields.map((field) => {
	      let fieldType = field.type;
	      let fieldSchema = {
	        name: field.name,
	        type: fieldType._attrs(derefed, opts)
	      };
	      if (opts.exportAttrs) {
	        let val = field.defaultValue();
	        if (val !== undefined) {
	          // We must both unwrap all unions and coerce buffers to strings.
	          fieldSchema['default'] = fieldType._copy(val, {coerce: 3, wrap: 3});
	        }
	        let fieldOrder = field.order;
	        if (fieldOrder !== 'ascending') {
	          fieldSchema.order = fieldOrder;
	        }
	        let fieldAliases = field.aliases;
	        if (fieldAliases.length) {
	          fieldSchema.aliases = fieldAliases;
	        }
	        let fieldDoc = field.doc;
	        if (fieldDoc !== undefined) {
	          fieldSchema.doc = fieldDoc;
	        }
	      }
	      return fieldSchema;
	    });
	  }

	  compare (val1, val2) {
	    let fields = this.fields;
	    for (let i = 0, l = fields.length; i < l; i++) {
	      let field = fields[i];
	      let name = field.name;
	      let order = field._order;
	      let type = field.type;
	      if (order) {
	        order *= type.compare(val1[name], val2[name]);
	        if (order) {
	          return order;
	        }
	      }
	    }
	    return 0;
	  }

	  random () {
	    let fields = this.fields.map((f) => { return f.type.random(); });
	    fields.unshift(undefined);
	    let Record = this.recordConstructor;
	    return new (Record.bind.apply(Record, fields))();
	  }

	  field (name) {
	    return this._fieldsByName[name];
	  }

	  getField (name) {
	    return this._fieldsByName[name];
	  }

	  getFields () { return this.fields; }

	  getRecordConstructor () {
	    return this.recordConstructor;
	  }

	  get typeName () { return this._isError ? 'error' : 'record'; }
	}

	/** Derived type abstract class. */
	class LogicalType extends Type {
	  constructor (schema, opts) {
	    super();
	    this._logicalTypeName = schema.logicalType;
	    LOGICAL_TYPE = this;
	    try {
	      this._underlyingType = Type.forSchema(schema, opts);
	    } finally {
	      LOGICAL_TYPE = null;
	      // Remove the underlying type now that we're done instantiating. Note that
	      // in some (rare) cases, it might not have been inserted; for example, if
	      // this constructor was manually called with an already instantiated type.
	      let l = UNDERLYING_TYPES.length;
	      if (l && UNDERLYING_TYPES[l - 1][0] === this) {
	        UNDERLYING_TYPES.pop();
	      }
	    }
	    // We create a separate branch constructor for logical types to keep them
	    // monomorphic.
	    if (Type.isType(this.underlyingType, 'union')) {
	      this._branchConstructor = this.underlyingType._branchConstructor;
	    } else {
	      this._branchConstructor = this.underlyingType._createBranchConstructor();
	    }
	    // We don't freeze derived types to allow arbitrary properties. Implementors
	    // can still do so in the subclass' constructor at their convenience.
	  }

	  get typeName () { return 'logical:' + this._logicalTypeName; }

	  get underlyingType () {
	    if (this._underlyingType) {
	      return this._underlyingType;
	    }
	    // If the field wasn't present, it means the logical type isn't complete
	    // yet: we're waiting on its underlying type to be fully instantiated. In
	    // this case, it will be present in the `UNDERLYING_TYPES` array.
	    for (let i = 0, l = UNDERLYING_TYPES.length; i < l; i++) {
	      let arr = UNDERLYING_TYPES[i];
	      if (arr[0] === this) {
	        return arr[1];
	      }
	    }
	    return undefined;
	  }

	  getUnderlyingType () {
	    return this.underlyingType;
	  }

	  _read (tap) {
	    return this._fromValue(this.underlyingType._read(tap));
	  }

	  _write (tap, any) {
	    this.underlyingType._write(tap, this._toValue(any));
	  }

	  _check (any, flags, hook, path) {
	    let val;
	    try {
	      val = this._toValue(any);
	    } catch (err) {
	      // Handled below.
	    }
	    if (val === undefined) {
	      if (hook) {
	        hook(any, this);
	      }
	      return false;
	    }
	    return this.underlyingType._check(val, flags, hook, path);
	  }

	  _copy (any, opts) {
	    let type = this.underlyingType;
	    switch (opts && opts.coerce) {
	      case 3: // To string.
	        return type._copy(this._toValue(any), opts);
	      case 2: // From string.
	        return this._fromValue(type._copy(any, opts));
	      default: // Normal copy.
	        return this._fromValue(type._copy(this._toValue(any), opts));
	    }
	  }

	  _update (resolver, type, opts) {
	    let _fromValue = this._resolve(type, opts);
	    if (_fromValue) {
	      resolver._read = function (tap) { return _fromValue(type._read(tap)); };
	    }
	  }

	  compare (obj1, obj2) {
	    let val1 = this._toValue(obj1);
	    let val2 = this._toValue(obj2);
	    return this.underlyingType.compare(val1, val2);
	  }

	  random () {
	    return this._fromValue(this.underlyingType.random());
	  }

	  _deref (schema, derefed, opts) {
	    let type = this.underlyingType;
	    let isVisited = type.name !== undefined && derefed[type.name];
	    schema = type._attrs(derefed, opts);
	    if (!isVisited && opts.exportAttrs) {
	      if (typeof schema == 'string') {
	        schema = {type: schema};
	      }
	      schema.logicalType = this._logicalTypeName;
	      this._export(schema);
	    }
	    return schema;
	  }

	  _skip (tap) {
	    this.underlyingType._skip(tap);
	  }

	  // Unlike the other methods below, `_export` has a reasonable default which we
	  // can provide (not exporting anything).
	  _export (/* schema */) {}

	  // Methods to be implemented.
	  _fromValue () { utils.abstractFunction(); }
	  _toValue () { utils.abstractFunction(); }
	  _resolve () { utils.abstractFunction(); }
	}



	// General helpers.

	/**
	 * Customizable long.
	 *
	 * This allows support of arbitrarily large long (e.g. larger than
	 * `Number.MAX_SAFE_INTEGER`). See `LongType.__with` method above. Note that we
	 * can't use a logical type because we need a "lower-level" hook here: passing
	 * through through the standard long would cause a loss of precision.
	 */
	class AbstractLongType extends LongType {
	  constructor (noUnpack) {
	    super(true);
	    this._noUnpack = !!noUnpack;
	  }

	  _check (val, flags, hook) {
	    let b = this._isValid(val);
	    if (!b && hook) {
	      hook(val, this);
	    }
	    return b;
	  }

	  _read (tap) {
	    let buf;
	    if (this._noUnpack) {
	      let pos = tap.pos;
	      tap.skipLong();
	      buf = tap.subarray(pos, tap.pos);
	    } else {
	      buf = tap.unpackLongBytes(tap);
	    }
	    if (tap.isValid()) {
	      return this._fromBuffer(buf);
	    }
	  }

	  _write (tap, val) {
	    if (!this._isValid(val)) {
	      throwInvalidError(val, this);
	    }
	    let buf = this._toBuffer(val);
	    if (this._noUnpack) {
	      tap.writeFixed(buf);
	    } else {
	      tap.packLongBytes(buf);
	    }
	  }

	  _copy (val, opts) {
	    switch (opts && opts.coerce) {
	      case 3: // To string.
	        return this._toJSON(val);
	      case 2: // From string.
	        return this._fromJSON(val);
	      default: // Normal copy.
	        // Slow but guarantees most consistent results. Faster alternatives
	        // would require assumptions on the long class used (e.g. immutability).
	        return this._fromJSON(this._toJSON(val));
	    }
	  }

	  _deref () { return 'long'; }

	  _update (resolver, type) {
	    let self = this;
	    switch (type.typeName) {
	      case 'int':
	        resolver._read = function (tap) {
	          return self._fromJSON(type._read(tap));
	        };
	        break;
	      case 'abstract:long':
	      case 'long':
	        resolver._read = function (tap) { return self._read(tap); };
	    }
	  }

	  random () {
	    return this._fromJSON(LongType.prototype.random());
	  }

	  // Methods to be implemented by the user.
	  _fromBuffer () { utils.abstractFunction(); }
	  _toBuffer () { utils.abstractFunction(); }
	  _fromJSON () { utils.abstractFunction(); }
	  _toJSON () { utils.abstractFunction(); }
	  _isValid () { utils.abstractFunction(); }
	  compare () { utils.abstractFunction(); }
	}

	AbstractLongType.prototype.typeName = 'abstract:long';
	// Must be defined *before* calling the constructor
	AbstractLongType.prototype._concreteTypeName = 'long';

	/** A record field. */
	class Field {
	  constructor (schema, opts) {
	    let name = schema.name;
	    if (typeof name != 'string' || !utils.isValidName(name)) {
	      throw new Error(`invalid field name: ${name}`);
	    }

	    this.name = name;
	    this.type = Type.forSchema(schema.type, opts);
	    this.aliases = schema.aliases || [];
	    this.doc = schema.doc !== undefined ? '' + schema.doc : undefined;

	    this._order = (function (order) {
	      switch (order) {
	        case 'ascending':
	          return 1;
	        case 'descending':
	          return -1;
	        case 'ignore':
	          return 0;
	        default:
	          throw new Error(`invalid order: ${j(order)}`);
	      }
	    })(schema.order === undefined ? 'ascending' : schema.order);

	    let value = schema['default'];
	    if (value !== undefined) {
	      // We need to convert defaults back to a valid format (unions are
	      // disallowed in default definitions, only the first type of each union is
	      // allowed instead).
	      // http://apache-avro.679487.n3.nabble.com/field-union-default-in-Java-td1175327.html
	      let type = this.type;
	      let val;
	      try {
	        val = type._copy(value, {coerce: 2, wrap: 2});
	      } catch (err) {
	        let msg = `incompatible field default ${j(value)} (${err.message})`;
	        if (Type.isType(type, 'union')) {
	          let t = j(type.types[0]);
	          msg += `, union defaults must match the first branch's type (${t})`;
	        }
	        throw new Error(msg);
	      }
	      // The clone call above will throw an error if the default is invalid.
	      if (isPrimitive(type.typeName) && type.typeName !== 'bytes') {
	        // These are immutable.
	        this.defaultValue = function () { return val; };
	      } else {
	        this.defaultValue = function () { return type._copy(val); };
	      }
	    }

	    Object.freeze(this);
	  }

	  defaultValue () {} // Undefined default.

	  getDefault () {}

	  getAliases () { return this.aliases; }

	  getName () { return this.name; }

	  getOrder () { return this.order; }

	  getType () { return this.type; }

	  get order () {
	    return ['descending', 'ignore', 'ascending'][this._order + 1];
	  }
	}

	/**
	 * Resolver to read a writer's schema as a new schema.
	 *
	 * @param readerType {Type} The type to convert to.
	 */
	class Resolver {
	  constructor (readerType) {
	    // Add all fields here so that all resolvers share the same hidden class.
	    this._readerType = readerType;
	    this._read = null;
	    this.itemsType = null;
	    this.size = 0;
	    this.symbols = null;
	    this.valuesType = null;
	  }

	  inspect () { return '<Resolver>'; }
	}

	Resolver.prototype._peek = Type.prototype._peek;

	/** Mutable hash container. */
	class Hash {
	  constructor () {
	    this.hash = undefined;
	  }
	}

	/**
	 * Read a value from a tap.
	 *
	 * @param type {Type} The type to decode.
	 * @param tap {Tap} The tap to read from. No checks are performed here.
	 * @param resolver {Resolver} Optional resolver. It must match the input type.
	 * @param lazy {Boolean} Skip trailing fields when using a resolver.
	 */
	function readValue(type, tap, resolver, lazy) {
	  if (resolver) {
	    if (resolver._readerType !== type) {
	      throw new Error('invalid resolver');
	    }
	    return resolver._read(tap, lazy);
	  } else {
	    return type._read(tap);
	  }
	}

	/**
	 * Get all aliases for a type (including its name).
	 *
	 * @param obj {Type|Object} Typically a type or a field. Its aliases property
	 * must exist and be an array.
	 */
	function getAliases(obj) {
	  let names = {};
	  if (obj.name) {
	    names[obj.name] = true;
	  }
	  let aliases = obj.aliases;
	  for (let i = 0, l = aliases.length; i < l; i++) {
	    names[aliases[i]] = true;
	  }
	  return Object.keys(names);
	}

	/** Checks if a type can be read as another based on name resolution rules. */
	function hasCompatibleName(reader, writer, strict) {
	  if (!writer.name) {
	    return true;
	  }
	  let name = strict ? writer.name : utils.unqualify(writer.name);
	  let aliases = getAliases(reader);
	  for (let i = 0, l = aliases.length; i < l; i++) {
	    let alias = aliases[i];
	    if (!strict) {
	      alias = utils.unqualify(alias);
	    }
	    if (alias === name) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Check whether a type's name is a primitive.
	 *
	 * @param name {String} Type name (e.g. `'string'`, `'array'`).
	 */
	function isPrimitive(typeName) {
	  // Since we use this module's own `TYPES` object, we can use `instanceof`.
	  let type = TYPES[typeName];
	  return type && type.prototype instanceof PrimitiveType;
	}

	/**
	 * Return a type's class name from its Avro type name.
	 *
	 * We can't simply use `constructor.name` since it isn't supported in all
	 * browsers.
	 *
	 * @param typeName {String} Type name.
	 */
	function getClassName(typeName) {
	  if (typeName === 'error') {
	    typeName = 'record';
	  } else {
	    let match = /^([^:]+):(.*)$/.exec(typeName);
	    if (match) {
	      if (match[1] === 'union') {
	        typeName = match[2] + 'Union';
	      } else {
	        // Logical type.
	        typeName = match[1];
	      }
	    }
	  }
	  return utils.capitalize(typeName) + 'Type';
	}

	/**
	 * Get the number of elements in an array block.
	 *
	 * @param tap {Tap} A tap positioned at the beginning of an array block.
	 */
	function readArraySize(tap) {
	  let n = tap.readLong();
	  if (n < 0) {
	    n = -n;
	    tap.skipLong(); // Skip size.
	  }
	  return n;
	}

	/**
	 * Check whether a long can be represented without precision loss.
	 *
	 * @param n {Number} The number.
	 *
	 * Two things to note:
	 *
	 * + We are not using the `Number` constants for compatibility with older
	 *   browsers.
	 * + We divide the bounds by two to avoid rounding errors during zigzag encoding
	 *   (see https://github.com/mtth/avsc/issues/455).
	 */
	function isSafeLong(n) {
	  return n >= -4503599627370496 && n <= 4503599627370496;
	}

	/**
	 * Check whether an object is the JSON representation of a buffer.
	 */
	function isJsonBuffer(obj) {
	  return obj && obj.type === 'Buffer' && Array.isArray(obj.data);
	}

	/**
	 * Throw a somewhat helpful error on invalid object.
	 *
	 * @param path {Array} Passed from hook, but unused (because empty where this
	 * function is used, since we aren't keeping track of it for effiency).
	 * @param val {...} The object to reject.
	 * @param type {Type} The type to check against.
	 *
	 * This method is mostly used from `_write` to signal an invalid object for a
	 * given type. Note that this provides less information than calling `isValid`
	 * with a hook since the path is not propagated (for efficiency reasons).
	 */
	function throwInvalidError(val, type) {
	  throw new Error(`invalid ${j(type.schema())}: ${j(val)}`);
	}

	function maybeQualify(name, ns) {
	  let unqualified = utils.unqualify(name);
	  // Primitives are always in the global namespace.
	  return isPrimitive(unqualified) ? unqualified : utils.qualify(name, ns);
	}

	/**
	 * Get a type's bucket when included inside an unwrapped union.
	 *
	 * @param type {Type} Any type.
	 */
	function getTypeBucket(type) {
	  let typeName = type.typeName;
	  switch (typeName) {
	    case 'double':
	    case 'float':
	    case 'int':
	    case 'long':
	      return 'number';
	    case 'bytes':
	    case 'fixed':
	      return 'buffer';
	    case 'enum':
	      return 'string';
	    case 'map':
	    case 'error':
	    case 'record':
	      return 'object';
	    default:
	      return typeName;
	  }
	}

	/**
	 * Infer a value's bucket (see unwrapped unions for more details).
	 *
	 * @param val {...} Any value.
	 */
	function getValueBucket(val) {
	  if (val === null) {
	    return 'null';
	  }
	  let bucket = typeof val;
	  if (bucket === 'object') {
	    // Could be bytes, fixed, array, map, or record.
	    if (Array.isArray(val)) {
	      return 'array';
	    } else if (isBufferLike(val)) {
	      return 'buffer';
	    }
	  }
	  return bucket;
	}

	/**
	 * Check whether a collection of types leads to an ambiguous union.
	 *
	 * @param types {Array} Array of types.
	 */
	function isAmbiguous(types) {
	  let buckets = {};
	  for (let i = 0, l = types.length; i < l; i++) {
	    let type = types[i];
	    if (!Type.isType(type, 'logical')) {
	      let bucket = getTypeBucket(type);
	      if (buckets[bucket]) {
	        return true;
	      }
	      buckets[bucket] = true;
	    }
	  }
	  return false;
	}

	/**
	 * Combine number types.
	 *
	 * Note that never have to create a new type here, we are guaranteed to be able
	 * to reuse one of the input types as super-type.
	 */
	function combineNumbers(types) {
	  let typeNames = ['int', 'long', 'float', 'double'];
	  let superIndex = -1;
	  let superType = null;
	  for (let i = 0, l = types.length; i < l; i++) {
	    let type = types[i];
	    let index = typeNames.indexOf(type.typeName);
	    if (index > superIndex) {
	      superIndex = index;
	      superType = type;
	    }
	  }
	  return superType;
	}

	/**
	 * Combine enums and strings.
	 *
	 * The order of the returned symbols is undefined and the returned enum is
	 *
	 */
	function combineStrings(types, opts) {
	  let symbols = {};
	  for (let i = 0, l = types.length; i < l; i++) {
	    let type = types[i];
	    if (type.typeName === 'string') {
	      // If at least one of the types is a string, it will be the supertype.
	      return type;
	    }
	    let typeSymbols = type.symbols;
	    for (let j = 0, m = typeSymbols.length; j < m; j++) {
	      symbols[typeSymbols[j]] = true;
	    }
	  }
	  return Type.forSchema({type: 'enum', symbols: Object.keys(symbols)}, opts);
	}

	/**
	 * Combine bytes and fixed.
	 *
	 * This function is optimized to avoid creating new types when possible: in
	 * case of a size mismatch between fixed types, it will continue looking
	 * through the array to find an existing bytes type (rather than exit early by
	 * creating one eagerly).
	 */
	function combineBuffers(types, opts) {
	  let size = -1;
	  for (let i = 0, l = types.length; i < l; i++) {
	    let type = types[i];
	    if (type.typeName === 'bytes') {
	      return type;
	    }
	    if (size === -1) {
	      size = type.size;
	    } else if (type.size !== size) {
	      // Don't create a bytes type right away, we might be able to reuse one
	      // later on in the types array. Just mark this for now.
	      size = -2;
	    }
	  }
	  return size < 0 ? Type.forSchema('bytes', opts) : types[0];
	}

	/**
	 * Combine maps and records.
	 *
	 * Field defaults are kept when possible (i.e. when no coercion to a map
	 * happens), with later definitions overriding previous ones.
	 */
	function combineObjects(types, opts) {
	  let allTypes = []; // Field and value types.
	  let fieldTypes = {}; // Record field types grouped by field name.
	  let fieldDefaults = {};
	  let isValidRecord = true;

	  // Check whether the final type will be a map or a record.
	  for (let i = 0, l = types.length; i < l; i++) {
	    let type = types[i];
	    if (type.typeName === 'map') {
	      isValidRecord = false;
	      allTypes.push(type.valuesType);
	    } else {
	      let fields = type.fields;
	      for (let j = 0, m = fields.length; j < m; j++) {
	        let field = fields[j];
	        let fieldName = field.name;
	        let fieldType = field.type;
	        allTypes.push(fieldType);
	        if (isValidRecord) {
	          if (!fieldTypes[fieldName]) {
	            fieldTypes[fieldName] = [];
	          }
	          fieldTypes[fieldName].push(fieldType);
	          let fieldDefault = field.defaultValue();
	          if (fieldDefault !== undefined) {
	            // Later defaults will override any previous ones.
	            fieldDefaults[fieldName] = fieldDefault;
	          }
	        }
	      }
	    }
	  }

	  let fieldNames;
	  if (isValidRecord) {
	    // Check that no fields are missing and that we have the approriate
	    // defaults for those which are.
	    fieldNames = Object.keys(fieldTypes);
	    for (let i = 0, l = fieldNames.length; i < l; i++) {
	      let fieldName = fieldNames[i];
	      if (
	        fieldTypes[fieldName].length < types.length &&
	        fieldDefaults[fieldName] === undefined
	      ) {
	        // At least one of the records is missing a field with no default.
	        if (opts && opts.strictDefaults) {
	          isValidRecord = false;
	        } else {
	          fieldTypes[fieldName].unshift(Type.forSchema('null', opts));
	          fieldDefaults[fieldName] = null;
	        }
	      }
	    }
	  }

	  let schema;
	  if (isValidRecord) {
	    schema = {
	      type: 'record',
	      fields: fieldNames.map((s) => {
	        let fieldType = Type.forTypes(fieldTypes[s], opts);
	        let fieldDefault = fieldDefaults[s];
	        if (
	          fieldDefault !== undefined &&
	          ~fieldType.typeName.indexOf('union')
	        ) {
	          // Ensure that the default's corresponding type is first.
	          let unionTypes = fieldType.types.slice();
	          let i = 0, l = unionTypes.length;
	          for (; i < l; i++) {
	            if (unionTypes[i].isValid(fieldDefault)) {
	              break;
	            }
	          }
	          if (i > 0) {
	            let unionType = unionTypes[0];
	            unionTypes[0] = unionTypes[i];
	            unionTypes[i] = unionType;
	            fieldType = Type.forSchema(unionTypes, opts);
	          }
	        }
	        return {
	          name: s,
	          type: fieldType,
	          'default': fieldDefaults[s]
	        };
	      })
	    };
	  } else {
	    schema = {
	      type: 'map',
	      values: Type.forTypes(allTypes, opts)
	    };
	  }
	  return Type.forSchema(schema, opts);
	}

	TYPES = {
	  'array': ArrayType,
	  'boolean': BooleanType,
	  'bytes': BytesType,
	  'double': DoubleType,
	  'enum': EnumType,
	  'error': RecordType,
	  'fixed': FixedType,
	  'float': FloatType,
	  'int': IntType,
	  'long': LongType,
	  'map': MapType,
	  'null': NullType,
	  'record': RecordType,
	  'string': StringType
	};

	types = {
	  Type,
	  getTypeBucket,
	  getValueBucket,
	  isPrimitive,
	  builtins: (function () {
	    let types = {
	      LogicalType,
	      UnwrappedUnionType,
	      WrappedUnionType
	    };
	    let typeNames = Object.keys(TYPES);
	    for (let i = 0, l = typeNames.length; i < l; i++) {
	      let typeName = typeNames[i];
	      types[getClassName(typeName)] = TYPES[typeName];
	    }
	    return types;
	  })()
	};
	return types;
}

var domain;

// This constructor is used to store event handlers. Instantiating this is
// faster than explicitly calling `Object.create(null)` to get a "clean" empty
// object (tested with v8 v4.9).
function EventHandlers() {}
EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}

// nodejs oddity
// require('events') === require('events').EventEmitter
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    if (domain.active && !(this instanceof domain.Domain)) {
      this.domain = domain.active;
    }
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events, domain;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  domain = this.domain;

  // If there is no 'error' event listener then throw.
  if (doError) {
    er = arguments[1];
    if (domain) {
      if (!er)
        er = new Error('Uncaught, unspecified "error" event');
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] :
                                          [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' ' + type + ' listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}
function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function _onceWrap(target, type, listener) {
  var fired = false;
  function g() {
    target.removeListener(type, g);
    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }
  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || (list.listener && list.listener === listener)) {
        if (--this._eventsCount === 0)
          this._events = new EventHandlers();
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length; i-- > 0;) {
          if (list[i] === listener ||
              (list[i].listener && list[i].listener === listener)) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (list.length === 1) {
          list[0] = undefined;
          if (--this._eventsCount === 0) {
            this._events = new EventHandlers();
            return this;
          } else {
            delete events[type];
          }
        } else {
          spliceOne(list, position);
        }

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };
    
// Alias for removeListener added in NodeJS 10.0
// https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
EventEmitter.prototype.off = function(type, listener){
    return this.removeListener(type, listener);
};

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = new EventHandlers();
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        for (var i = 0, key; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = new EventHandlers();
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        do {
          this.removeListener(type, listeners[listeners.length - 1]);
        } while (listeners[0]);
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    ret = [];
  else {
    evlistener = events[type];
    if (!evlistener)
      ret = [];
    else if (typeof evlistener === 'function')
      ret = [evlistener.listener || evlistener];
    else
      ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount$1.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount$1;
function listenerCount$1(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);
  while (i--)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

var global$1 = (typeof global !== "undefined" ? global :
  typeof self !== "undefined" ? self :
  typeof window !== "undefined" ? window : {});

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init () {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray (b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders);

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = (tmp >> 16) & 0xFF;
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
    output.push(tripletToBase64(tmp));
  }
  return output.join('')
}

function fromByteArray (uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[(tmp << 4) & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
    output += lookup[tmp >> 10];
    output += lookup[(tmp >> 4) & 0x3F];
    output += lookup[(tmp << 2) & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('')
}

function read (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

function write (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString = {}.toString;

var isArray$1 = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */


var INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer$1.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
  ? global$1.TYPED_ARRAY_SUPPORT
  : true;

/*
 * Export kMaxLength after typed array support is determined.
 */
kMaxLength();

function kMaxLength () {
  return Buffer$1.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer$1.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer$1(length);
    }
    that.length = length;
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer$1 (arg, encodingOrOffset, length) {
  if (!Buffer$1.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer$1)) {
    return new Buffer$1(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer$1.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer$1._augment = function (arr) {
  arr.__proto__ = Buffer$1.prototype;
  return arr
};

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer$1.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
};

if (Buffer$1.TYPED_ARRAY_SUPPORT) {
  Buffer$1.prototype.__proto__ = Uint8Array.prototype;
  Buffer$1.__proto__ = Uint8Array;
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer$1[Symbol.species] === Buffer$1) ;
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer$1.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
};

function allocUnsafe (that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer$1.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer$1.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer$1.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
};

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer$1.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer$1.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that
}

function fromObject (that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len);
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray$1(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}
Buffer$1.isBuffer = isBuffer;
function internalIsBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer$1.compare = function compare (a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

Buffer$1.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
};

Buffer$1.concat = function concat (list, length) {
  if (!isArray$1(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer$1.alloc(0)
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer$1.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer
};

function byteLength (string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer$1.byteLength = byteLength;

function slowToString (encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer$1.prototype._isBuffer = true;

function swap (b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer$1.prototype.swap16 = function swap16 () {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this
};

Buffer$1.prototype.swap32 = function swap32 () {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this
};

Buffer$1.prototype.swap64 = function swap64 () {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this
};

Buffer$1.prototype.toString = function toString () {
  var length = this.length | 0;
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
};

Buffer$1.prototype.equals = function equals (b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer$1.compare(this, b) === 0
};

Buffer$1.prototype.inspect = function inspect () {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>'
};

Buffer$1.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -2147483648) {
    byteOffset = -2147483648;
  }
  byteOffset = +byteOffset;  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer$1.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer$1.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer$1.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
};

Buffer$1.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
};

Buffer$1.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
};

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed;
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer$1.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer$1.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
};

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf)
  } else {
    return fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res
}

Buffer$1.prototype.slice = function slice (start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer$1.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer$1(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer$1.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val
};

Buffer$1.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val
};

Buffer$1.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset]
};

Buffer$1.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | (this[offset + 1] << 8)
};

Buffer$1.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return (this[offset] << 8) | this[offset + 1]
};

Buffer$1.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
};

Buffer$1.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
};

Buffer$1.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer$1.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer$1.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
};

Buffer$1.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | (this[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer$1.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | (this[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer$1.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
};

Buffer$1.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
};

Buffer$1.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4)
};

Buffer$1.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4)
};

Buffer$1.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8)
};

Buffer$1.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8)
};

function checkInt (buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer$1.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer$1.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer$1.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = (value & 0xff);
  return offset + 1
};

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer$1.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer$1.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
  }
}

Buffer$1.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer$1.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

Buffer$1.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer$1.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer$1.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -128);
  if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = (value & 0xff);
  return offset + 1
};

Buffer$1.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer$1.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

Buffer$1.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer$1.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4
}

Buffer$1.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
};

Buffer$1.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
};

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8
}

Buffer$1.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
};

Buffer$1.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer$1.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer$1.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }

  return len
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer$1.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer$1.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val)
      ? val
      : utf8ToBytes(new Buffer$1(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        }

        // valid lead
        leadSurrogate = codePoint;

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray
}


function base64ToBytes (str) {
  return toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i];
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
}

function isFastBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
}

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof global$1.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$1.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
var env = {};

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = global$1.performance || {};
performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

var browser$1 = {
  env: env};

var inherits;
if (typeof Object.create === 'function'){
  inherits = function inherits(ctor, superCtor) {
    // implementation from standard node.js 'util' module
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  inherits = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}

var formatRegExp = /%[sdj%]/g;
function format(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
}

// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
function deprecate(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global$1.process)) {
    return function() {
      return deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (browser$1.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (browser$1.throwDeprecation) {
        throw new Error(msg);
      } else if (browser$1.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

var debugs = {};
var debugEnviron;
function debuglog(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = browser$1.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = 0;
      debugs[set] = function() {
        var msg = format.apply(null, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
}

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    _extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var length = output.reduce(function(prev, cur) {
    if (cur.indexOf('\n') >= 0) ;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}

function isBoolean(arg) {
  return typeof arg === 'boolean';
}

function isNull(arg) {
  return arg === null;
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isString(arg) {
  return typeof arg === 'string';
}

function isUndefined(arg) {
  return arg === void 0;
}

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}

function isFunction(arg) {
  return typeof arg === 'function';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function _extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return Buffer$1.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = Buffer$1.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var isBufferEncoding = Buffer$1.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     };


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
function StringDecoder(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer$1(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
}

// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

Readable.ReadableState = ReadableState;

var debug = debuglog('stream');
inherits(Readable, EventEmitter);

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event])
      emitter.on(event, fn);
    else if (Array.isArray(emitter._events[event]))
      emitter._events[event].unshift(fn);
    else
      emitter._events[event] = [fn, emitter._events[event]];
  }
}
function listenerCount (emitter, type) {
  return emitter.listeners(type).length;
}
function ReadableState(options, stream) {

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  EventEmitter.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = Buffer$1.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer$1.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false);

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (listenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && src.listeners('data').length) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var _i = 0; _i < len; _i++) {
      dests[_i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1) return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = EventEmitter.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer$1.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

Writable.WritableState = WritableState;
inherits(Writable, EventEmitter);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Object.defineProperty(this, 'buffer', {
    get: deprecate(function () {
      return this.getBuffer();
    }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
  });
  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function writableStateGetBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};
function Writable(options) {

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  EventEmitter.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  nextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;
  // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.
  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer$1.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer$1.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) nextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
        nextTick(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
        afterWrite(stream, state, finished, cb);
      }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}

inherits(Duplex, Readable);

var keys = Object.keys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er) {
      done(stream, er);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('Not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er) {
  if (er) return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

inherits(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

inherits(Stream, EventEmitter);
Stream.Readable = Readable;
Stream.Writable = Writable;
Stream.Duplex = Duplex;
Stream.Transform = Transform;
Stream.PassThrough = PassThrough;

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EventEmitter.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EventEmitter.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

var _polyfillNode_stream = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Duplex: Duplex,
	PassThrough: PassThrough,
	Readable: Readable,
	Stream: Stream,
	Transform: Transform,
	Writable: Writable,
	default: Stream
});

var require$$2 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_stream);

var containers;
var hasRequiredContainers;

function requireContainers () {
	if (hasRequiredContainers) return containers;
	hasRequiredContainers = 1;

	/**
	 * This module defines custom streams to write and read Avro files.
	 *
	 * In particular, the `Block{En,De}coder` streams are able to deal with Avro
	 * container files. None of the streams below depend on the filesystem however,
	 * this way they can also be used in the browser (for example to parse HTTP
	 * responses).
	 */

	let types = requireTypes(),
	    utils = requireUtils(),
	    stream = require$$2;

	const DECODER = new TextDecoder();
	const ENCODER = new TextEncoder();

	let OPTS = {namespace: 'org.apache.avro.file', registry: {}};

	let LONG_TYPE = types.Type.forSchema('long', OPTS);

	let MAP_BYTES_TYPE = types.Type.forSchema({type: 'map', values: 'bytes'}, OPTS);

	let HEADER_TYPE = types.Type.forSchema({
	  name: 'Header',
	  type: 'record',
	  fields : [
	    {name: 'magic', type: {type: 'fixed', name: 'Magic', size: 4}},
	    {name: 'meta', type: MAP_BYTES_TYPE},
	    {name: 'sync', type: {type: 'fixed', name: 'Sync', size: 16}}
	  ]
	}, OPTS);

	let BLOCK_TYPE = types.Type.forSchema({
	  name: 'Block',
	  type: 'record',
	  fields : [
	    {name: 'count', type: 'long'},
	    {name: 'data', type: 'bytes'},
	    {name: 'sync', type: 'Sync'}
	  ]
	}, OPTS);

	// First 4 bytes of an Avro object container file.
	let MAGIC_BYTES = ENCODER.encode('Obj\x01');

	// Convenience.
	let Tap = utils.Tap;


	/** Duplex stream for decoding fragments. */
	class RawDecoder extends stream.Duplex {
	  constructor (schema, opts) {
	    opts = opts || {};

	    let noDecode = !!opts.noDecode;
	    super({
	      readableObjectMode: !noDecode,
	      allowHalfOpen: false
	    });

	    this._type = types.Type.forSchema(schema);
	    this._tap = Tap.withCapacity(0);
	    this._writeCb = null;
	    this._needPush = false;
	    this._readValue = createReader(noDecode, this._type);
	    this._finished = false;

	    this.on('finish', function () {
	      this._finished = true;
	      this._read();
	    });
	  }

	  _write (chunk, encoding, cb) {
	    // Store the write callback and call it when we are done decoding all
	    // records in this chunk. If we call it right away, we risk loading the
	    // entire input in memory. We only need to store the latest callback since
	    // the stream API guarantees that `_write` won't be called again until we
	    // call the previous.
	    this._writeCb = cb;

	    let tap = this._tap;
	    tap.forward(chunk);
	    if (this._needPush) {
	      this._needPush = false;
	      this._read();
	    }
	  }

	  _read () {
	    this._needPush = false;

	    let tap = this._tap;
	    let pos = tap.pos;
	    let val = this._readValue(tap);
	    if (tap.isValid()) {
	      this.push(val);
	    } else if (!this._finished) {
	      tap.pos = pos;
	      this._needPush = true;
	      if (this._writeCb) {
	        // This should only ever be false on the first read, and only if it
	        // happens before the first write.
	        this._writeCb();
	      }
	    } else {
	      this.push(null);
	    }
	  }
	}

	/** Duplex stream for decoding object container files. */
	class BlockDecoder extends stream.Duplex {
	  constructor (opts) {
	    opts = opts || {};

	    let noDecode = !!opts.noDecode;
	    super({
	      allowHalfOpen: true, // For async decompressors.
	      readableObjectMode: !noDecode
	    });

	    this._rType = opts.readerSchema !== undefined ?
	      types.Type.forSchema(opts.readerSchema) :
	      undefined;
	    this._wType = null;
	    this._codecs = opts.codecs;
	    this._codec = undefined;
	    this._parseHook = opts.parseHook;
	    this._tap = Tap.withCapacity(0);
	    this._blockTap = Tap.withCapacity(0);
	    this._syncMarker = null;
	    this._readValue = null;
	    this._noDecode = noDecode;
	    this._queue = new utils.OrderedQueue();
	    this._decompress = null; // Decompression function.
	    this._index = 0; // Next block index.
	    this._remaining = undefined; // In the current block.
	    this._needPush = false;
	    this._finished = false;

	    this.on('finish', function () {
	      this._finished = true;
	      if (this._needPush) {
	        this._read();
	      }
	    });
	  }

	  static defaultCodecs () {
	    return {
	      'null': function (buf, cb) { cb(null, buf); }
	    };
	  }

	  static getDefaultCodecs () {
	    return BlockDecoder.defaultCodecs();
	  }

	  _decodeHeader () {
	    let tap = this._tap;
	    if (tap.length < MAGIC_BYTES.length) {
	      // Wait until more data arrives.
	      return false;
	    }

	    if (!utils.bufEqual(
	      MAGIC_BYTES,
	      tap.subarray(0, MAGIC_BYTES.length)
	    )) {
	      this.emit('error', new Error('invalid magic bytes'));
	      return false;
	    }

	    let header = HEADER_TYPE._read(tap);
	    if (!tap.isValid()) {
	      return false;
	    }

	    this._codec = DECODER.decode(header.meta['avro.codec']) || 'null';
	    let codecs = this._codecs || BlockDecoder.getDefaultCodecs();
	    this._decompress = codecs[this._codec];
	    if (!this._decompress) {
	      this.emit('error', new Error(`unknown codec: ${this._codec}`));
	      return;
	    }

	    try {
	      let schema = JSON.parse(DECODER.decode(header.meta['avro.schema']));
	      if (this._parseHook) {
	        schema = this._parseHook(schema);
	      }
	      this._wType = types.Type.forSchema(schema);
	    } catch (err) {
	      this.emit('error', err);
	      return;
	    }

	    try {
	      this._readValue = createReader(this._noDecode, this._wType, this._rType);
	    } catch (err) {
	      this.emit('error', err);
	      return;
	    }

	    this._syncMarker = header.sync;
	    this.emit('metadata', this._wType, this._codec, header);
	    return true;
	  }

	  _write (chunk, encoding, cb) {
	    let tap = this._tap;
	    tap.append(chunk);

	    if (!this._decodeHeader()) {
	      process.nextTick(cb);
	      return;
	    }

	    // We got the header, switch to block decoding mode. Also, call it directly
	    // in case we already have all the data (in which case `_write` wouldn't get
	    // called anymore).
	    this._write = this._writeChunk;
	    this._write(new Uint8Array(0), encoding, cb);
	  }

	  _writeChunk (chunk, encoding, cb) {
	    let tap = this._tap;
	    tap.forward(chunk);

	    let nBlocks = 1;
	    let block;
	    while ((block = tryReadBlock(tap))) {
	      if (!utils.bufEqual(this._syncMarker, block.sync)) {
	        this.emit('error', new Error('invalid sync marker'));
	        return;
	      }
	      nBlocks++;
	      this._decompress(
	        block.data,
	        this._createBlockCallback(block.data.length, block.count, chunkCb)
	      );
	    }
	    chunkCb();

	    function chunkCb() {
	      if (!--nBlocks) {
	        cb();
	      }
	    }
	  }

	  _createBlockCallback (size, count, cb) {
	    let self = this;
	    let index = this._index++;

	    return function (cause, data) {
	      if (cause) {
	        let err = new Error(`${self._codec} codec decompression error`);
	        err.cause = cause;
	        self.emit('error', err);
	        cb();
	      } else {
	        self.emit('block', new BlockInfo(count, data.length, size));
	        self._queue.push(new BlockData(index, data, cb, count));
	        if (self._needPush) {
	          self._read();
	        }
	      }
	    };
	  }

	  _read () {
	    this._needPush = false;

	    let tap = this._blockTap;
	    if (!this._remaining) {
	      let data = this._queue.pop();
	      if (!data || !data.count) {
	        if (this._finished) {
	          this.push(null);
	        } else {
	          this._needPush = true;
	        }
	        if (data) {
	          data.cb();
	        }
	        return; // Wait for more data.
	      }
	      data.cb();
	      this._remaining = data.count;
	      tap.setData(data.buf);
	    }

	    this._remaining--;
	    let val;
	    try {
	      val = this._readValue(tap);
	      if (!tap.isValid()) {
	        throw new Error('truncated block');
	      }
	    } catch (err) {
	      this._remaining = 0;
	      this.emit('error', err); // Corrupt data.
	      return;
	    }
	    this.push(val);
	  }
	}


	/** Duplex stream for encoding. */
	class RawEncoder extends stream.Transform {
	  constructor (schema, opts) {
	    opts = opts || {};

	    super({
	      writableObjectMode: true,
	      allowHalfOpen: false
	    });

	    this._type = types.Type.forSchema(schema);
	    this._writeValue = function (tap, val) {
	      try {
	        this._type._write(tap, val);
	      } catch (err) {
	        this.emit('typeError', err, val, this._type);
	      }
	    };
	    this._tap = Tap.withCapacity(opts.batchSize || 65536);

	    this.on('typeError', function (err) { this.emit('error', err); });
	  }

	  _transform (val, encoding, cb) {
	    let tap = this._tap;
	    let pos = tap.pos;

	    this._writeValue(tap, val);
	    if (!tap.isValid()) {
	      if (pos) {
	        // Emit any valid data.
	        this.push(tap.toBuffer());
	      }
	      let len = tap.pos - pos;
	      if (len > tap.length) {
	        // Not enough space for last written object, need to resize.
	        tap.reinitialize(2 * len);
	      }
	      tap.pos = 0;
	      this._writeValue(tap, val); // Rewrite last failed write.
	    }

	    cb();
	  }

	  _flush (cb) {
	    let tap = this._tap;
	    let pos = tap.pos;
	    if (pos) {
	      // This should only ever be false if nothing is written to the stream.
	      this.push(tap.subarray(0, pos));
	    }
	    cb();
	  }
	}


	/**
	 * Duplex stream to write object container files.
	 *
	 * @param schema
	 * @param opts {Object}
	 *
	 *  + `blockSize`, uncompressed.
	 *  + `codec`
	 *  + `codecs`
	 *  + `metadata``
	 *  + `noCheck`
	 *  + `omitHeader`, useful to append to an existing block file.
	 */
	class BlockEncoder extends stream.Duplex {
	  constructor (schema, opts) {
	    opts = opts || {};

	    super({
	      allowHalfOpen: true, // To support async compressors.
	      writableObjectMode: true
	    });

	    let type;
	    if (types.Type.isType(schema)) {
	      type = schema;
	      schema = undefined;
	    } else {
	      // Keep full schema to be able to write it to the header later.
	      type = types.Type.forSchema(schema);
	    }

	    this._schema = schema;
	    this._type = type;
	    this._writeValue = function (tap, val) {
	      try {
	        this._type._write(tap, val);
	      } catch (err) {
	        this.emit('typeError', err, val, this._type);
	        return false;
	      }
	      return true;
	    };
	    this._blockSize = opts.blockSize || 65536;
	    this._tap = Tap.withCapacity(this._blockSize);
	    this._codecs = opts.codecs;
	    this._codec = opts.codec || 'null';
	    this._blockCount = 0;
	    this._syncMarker = opts.syncMarker || new utils.Lcg().nextBuffer(16);
	    this._queue = new utils.OrderedQueue();
	    this._pending = 0;
	    this._finished = false;
	    this._needHeader = false;
	    this._needPush = false;

	    this._metadata = opts.metadata || {};
	    if (!MAP_BYTES_TYPE.isValid(this._metadata)) {
	      throw new Error('invalid metadata');
	    }

	    let codec = this._codec;
	    this._compress = (this._codecs || BlockEncoder.getDefaultCodecs())[codec];
	    if (!this._compress) {
	      throw new Error(`unsupported codec: ${codec}`);
	    }

	    if (opts.omitHeader !== undefined) { // Legacy option.
	      opts.writeHeader = opts.omitHeader ? 'never' : 'auto';
	    }
	    switch (opts.writeHeader) {
	      case false:
	      case 'never':
	        break;
	      // Backwards-compatibility (eager default would be better).
	      case undefined:
	      case 'auto':
	        this._needHeader = true;
	        break;
	      default:
	        this._writeHeader();
	    }

	    this.on('finish', function () {
	      this._finished = true;
	      if (this._blockCount) {
	        this._flushChunk();
	      } else if (this._finished && this._needPush) {
	        // We don't need to check `_isPending` since `_blockCount` is always
	        // positive after the first flush.
	        this.push(null);
	      }
	    });

	    this.on('typeError', function (err) { this.emit('error', err); });
	  }

	  static defaultCodecs () {
	    return {
	      'null': function (buf, cb) { cb(null, buf); }
	    };
	  }

	  static getDefaultCodecs () {
	    return BlockEncoder.defaultCodecs();
	  }

	  _writeHeader () {
	    let schema = JSON.stringify(
	      this._schema ? this._schema : this._type.getSchema({exportAttrs: true})
	    );
	    let meta = utils.copyOwnProperties(
	      this._metadata,
	      {
	        'avro.schema': ENCODER.encode(schema),
	        'avro.codec': ENCODER.encode(this._codec)
	      },
	      true // Overwrite.
	    );
	    let Header = HEADER_TYPE.getRecordConstructor();
	    let header = new Header(MAGIC_BYTES, meta, this._syncMarker);
	    this.push(header.toBuffer());
	  }

	  _write (val, encoding, cb) {
	    if (this._needHeader) {
	      this._writeHeader();
	      this._needHeader = false;
	    }

	    let tap = this._tap;
	    let pos = tap.pos;
	    let flushing = false;

	    if (this._writeValue(tap, val)) {
	      if (!tap.isValid()) {
	        if (pos) {
	          this._flushChunk(pos, cb);
	          flushing = true;
	        }
	        let len = tap.pos - pos;
	        if (len > this._blockSize) {
	          // Not enough space for last written object, need to resize.
	          this._blockSize = len * 2;
	        }
	        tap.reinitialize(this._blockSize);
	        this._writeValue(tap, val); // Rewrite last failed write.
	      }
	      this._blockCount++;
	    } else {
	      tap.pos = pos;
	    }

	    if (!flushing) {
	      cb();
	    }
	  }

	  _flushChunk (pos, cb) {
	    let tap = this._tap;
	    pos = pos || tap.pos;
	    this._compress(
	      tap.subarray(0, pos),
	      this._createBlockCallback(pos, cb)
	    );
	    this._blockCount = 0;
	  }

	  _read () {
	    let self = this;
	    let data = this._queue.pop();
	    if (!data) {
	      if (this._finished && !this._pending) {
	        process.nextTick(() => { self.push(null); });
	      } else {
	        this._needPush = true;
	      }
	      return;
	    }

	    this.push(LONG_TYPE.toBuffer(data.count, true));
	    this.push(LONG_TYPE.toBuffer(data.buf.length, true));
	    this.push(data.buf);
	    this.push(this._syncMarker);

	    if (!this._finished) {
	      data.cb();
	    }
	  }

	  _createBlockCallback (size, cb) {
	    let self = this;
	    let index = this._index++;
	    let count = this._blockCount;
	    this._pending++;

	    return function (cause, data) {
	      if (cause) {
	        let err = new Error(`${self._codec} codec compression error`);
	        err.cause = cause;
	        self.emit('error', err);
	        return;
	      }
	      self._pending--;
	      self.emit('block', new BlockInfo(count, size, data.length));
	      self._queue.push(new BlockData(index, data, cb, count));
	      if (self._needPush) {
	        self._needPush = false;
	        self._read();
	      }
	    };
	  }
	}


	// Helpers.

	/** Summary information about a block. */
	class BlockInfo {
	  constructor (count, raw, compressed) {
	    this.valueCount = count;
	    this.rawDataLength = raw;
	    this.compressedDataLength = compressed;
	  }
	}

	/**
	 * An indexed block.
	 *
	 * This can be used to preserve block order since compression and decompression
	 * can cause some some blocks to be returned out of order.
	 */
	class BlockData {
	  constructor (index, buf, cb, count) {
	    this.index = index;
	    this.buf = buf;
	    this.cb = cb;
	    this.count = count | 0;
	  }
	}

	/** Maybe get a block. */
	function tryReadBlock(tap) {
	  let pos = tap.pos;
	  let block = BLOCK_TYPE._read(tap);
	  if (!tap.isValid()) {
	    tap.pos = pos;
	    return null;
	  }
	  return block;
	}

	/** Create bytes consumer, either reading or skipping records. */
	function createReader(noDecode, writerType, readerType) {
	  if (noDecode) {
	    return (function (skipper) {
	      return function (tap) {
	        let pos = tap.pos;
	        skipper(tap);
	        return tap.subarray(pos, tap.pos);
	      };
	    })(writerType._skip);
	  } else if (readerType) {
	    let resolver = readerType.createResolver(writerType);
	    return function (tap) { return resolver._read(tap); };
	  } else {
	    return function (tap) { return writerType._read(tap); };
	  }
	}


	containers = {
	  BLOCK_TYPE, // For tests.
	  HEADER_TYPE, // Idem.
	  MAGIC_BYTES, // Idem.
	  streams: {
	    BlockDecoder,
	    BlockEncoder,
	    RawDecoder,
	    RawEncoder
	  }
	};
	return containers;
}

var _polyfillNode_fs = {};

var _polyfillNode_fs$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: _polyfillNode_fs
});

var require$$4 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_fs$1);

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
function resolve() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : '/';

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
}
// path.normalize(path)
// posix version
function normalize(path) {
  var isPathAbsolute = isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isPathAbsolute).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}
// posix version
function isAbsolute(path) {
  return path.charAt(0) === '/';
}

// posix version
function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}


// path.relative(from, to)
// posix version
function relative(from, to) {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
}

var sep = '/';
var delimiter = ':';

function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

function basename(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
}


function extname(path) {
  return splitPath(path)[3];
}
var _polyfillNode_path = {
  extname: extname,
  basename: basename,
  dirname: dirname,
  sep: sep,
  delimiter: delimiter,
  relative: relative,
  join: join,
  isAbsolute: isAbsolute,
  normalize: normalize,
  resolve: resolve
};
function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b' ?
    function (str, start, len) { return str.substr(start, len) } :
    function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

var _polyfillNode_path$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	basename: basename,
	default: _polyfillNode_path,
	delimiter: delimiter,
	dirname: dirname,
	extname: extname,
	isAbsolute: isAbsolute,
	join: join,
	normalize: normalize,
	relative: relative,
	resolve: resolve,
	sep: sep
});

var require$$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_path$1);

var files;
var hasRequiredFiles;

function requireFiles () {
	if (hasRequiredFiles) return files;
	hasRequiredFiles = 1;

	/**
	 * Filesystem specifics.
	 *
	 * This module contains functions only used by node.js. It is shimmed by
	 * another module when `avsc` is required from `browserify`.
	 */

	let fs = require$$4,
	    path = require$$1;

	/** Default (asynchronous) file loading function for assembling IDLs. */
	function createImportHook() {
	  let imports = {};
	  return function ({path: fpath, importerPath}, cb) {
	    fpath = path.resolve(path.dirname(importerPath), fpath);
	    if (imports[fpath]) {
	      // Already imported, return nothing to avoid duplicating attributes.
	      process.nextTick(cb);
	      return;
	    }
	    imports[fpath] = true;
	    fs.readFile(fpath, {encoding: 'utf8'}, (err, data) => {
	      if (err) return cb(err);
	      return cb(null, {contents: data, path: fpath});
	    });
	  };
	}

	/**
	 * Synchronous file loading function for assembling IDLs.
	 *
	 * This is only for internal use (inside `specs.parse`). The returned
	 * hook should only be called on paths that are guaranteed to exist (where
	 * `fs.readFileSync` will not throw, otherwise the calling `assemble` call will
	 * throw rather than return the error to the callback).
	 */
	function createSyncImportHook() {
	  let imports = {};
	  return function ({path: fpath, importerPath}, cb) {
	    fpath = path.resolve(path.dirname(importerPath), fpath);
	    if (imports[fpath]) {
	      cb();
	    } else {
	      imports[fpath] = true;
	      cb(null, {
	        contents: fs.readFileSync(fpath, {encoding: 'utf8'}),
	        path: fpath
	      });
	    }
	  };
	}

	/**
	 * Check if the given input string is "path-like" or a path to an existing file,
	 * and if so, read it. This requires it to contain a path separator
	 * (`path.sep`). If not, this will return `null`.
	 */
	function tryReadFileSync(str) {
	  if (
	    typeof str == 'string' &&
	    str.indexOf(path.sep) !== -1
	  ) {
	    try {
	      // Try interpreting `str` as path to a file.
	      return fs.readFileSync(str, {encoding: 'utf8'});
	    } catch (err) {
	      // If the file doesn't exist, return `null`. Rethrow all other errors.
	      if (err.code !== 'ENOENT') throw err;
	    }
	  }
	  return null;
	}

	files = {
	  createImportHook,
	  createSyncImportHook,
	  tryReadFileSync
	};
	return files;
}

var specs;
var hasRequiredSpecs;

function requireSpecs () {
	if (hasRequiredSpecs) return specs;
	hasRequiredSpecs = 1;

	/** IDL parsing logic. */

	let files = requireFiles(),
	    utils = requireUtils();


	// Default type references defined by Avro.
	let TYPE_REFS = {
	  date: {type: 'int', logicalType: 'date'},
	  decimal: {type: 'bytes', logicalType: 'decimal'},
	  time_ms: {type: 'long', logicalType: 'time-millis'},
	  timestamp_ms: {type: 'long', logicalType: 'timestamp-millis'}
	};


	/** Assemble an IDL file into a decoded protocol. */
	function assembleProtocol(fpath, opts, cb) {
	  if (!cb && typeof opts == 'function') {
	    cb = opts;
	    opts = undefined;
	  }
	  opts = opts || {};
	  if (!opts.importHook) {
	    opts.importHook = files.createImportHook();
	  }

	  importFile(fpath, '', (err, protocol) => {
	    if (err) {
	      cb(err);
	      return;
	    }
	    if (!protocol) {
	      cb(new Error('empty root import'));
	      return;
	    }
	    let schemas = protocol.types;
	    if (schemas) {
	      // Strip redundant namespaces from types before returning the protocol.
	      // Note that we keep empty (`''`) nested namespaces when the outer one is
	      // non-empty. This allows figuring out whether unqualified imported names
	      // should be qualified by the protocol's namespace: they should if their
	      // namespace is `undefined` and should not if it is empty.
	      let namespace = protocolNamespace(protocol) || '';
	      schemas.forEach((schema) => {
	        if (schema.namespace === namespace) {
	          delete schema.namespace;
	        }
	      });
	    }
	    cb(null, protocol);
	  });

	  function importFile(fpath, importerPath, cb) {
	    opts.importHook({path: fpath, importerPath, kind: 'idl'}, (err, payload) => {
	      if (err) {
	        cb(err);
	        return;
	      }
	      if (!payload) {
	        // This signals an already imported file by the default import hooks.
	        // Implementors who wish to disallow duplicate imports should provide a
	        // custom hook which throws an error when a duplicate is detected.
	        cb();
	        return;
	      }
	      const {contents: str, path: fpath} = payload;
	      let obj;
	      try {
	        let reader = new Reader(str, opts);
	        obj = reader._readProtocol(str, opts);
	      } catch (err) {
	        err.path = fpath; // To help debug which file caused the error.
	        cb(err);
	        return;
	      }
	      fetchImports(obj.protocol, obj.imports, fpath, cb);
	    });
	  }

	  function fetchImports(protocol, imports, fpath, cb) {
	    let importedProtocols = [];
	    next();

	    function next() {
	      let info = imports.shift();
	      if (!info) {
	        // We are done with this file. We prepend all imported types to this
	        // file's and we can return the final result.
	        importedProtocols.reverse();
	        try {
	          importedProtocols.forEach((imported) => {
	            mergeImport(protocol, imported);
	          });
	        } catch (err) {
	          cb(err);
	          return;
	        }
	        cb(null, protocol);
	        return;
	      }
	      if (info.kind === 'idl') {
	        importFile(info.name, fpath, (err, imported) => {
	          if (err) {
	            cb(err);
	            return;
	          }
	          if (imported) {
	            importedProtocols.push(imported);
	          }
	          next();
	        });
	      } else {
	        // We are importing a protocol or schema file.
	        opts.importHook({
	          path: info.name,
	          importerPath: fpath,
	          kind: info.kind
	        }, (err, payload) => {
	          if (err) {
	            cb(err);
	            return;
	          }
	          switch (info.kind) {
	            case 'protocol':
	            case 'schema': {
	              if (!payload) {
	                // Skip duplicate import (see related comment above).
	                next();
	                return;
	              }
	              let obj;
	              try {
	                obj = JSON.parse(payload.contents);
	              } catch (err) {
	                err.path = payload.path;
	                cb(err);
	                return;
	              }
	              let imported = info.kind === 'schema' ? {types: [obj]} : obj;
	              importedProtocols.push(imported);
	              next();
	              return;
	            }
	            default:
	              cb(new Error(`invalid import kind: ${info.kind}`));
	          }
	        });
	      }
	    }
	  }

	  function mergeImport(protocol, imported) {
	    // Merge first the types (where we don't need to check for duplicates
	    // since instantiating the service will take care of it), then the messages
	    // (where we need to, as duplicates will overwrite each other).
	    let schemas = imported.types || [];
	    schemas.reverse();
	    schemas.forEach((schema) => {
	      if (!protocol.types) {
	        protocol.types = [];
	      }
	      // Ensure the imported protocol's namespace is inherited correctly (it
	      // might be different from the current one).
	      if (schema.namespace === undefined) {
	        schema.namespace = protocolNamespace(imported) || '';
	      }
	      protocol.types.unshift(schema);
	    });
	    Object.keys(imported.messages || {}).forEach((name) => {
	      if (!protocol.messages) {
	        protocol.messages = {};
	      }
	      if (protocol.messages[name]) {
	        throw new Error(`duplicate message: ${name}`);
	      }
	      protocol.messages[name] = imported.messages[name];
	    });
	  }
	}

	// Parsing functions.

	/**
	 * Convenience function to parse multiple inputs into protocols and schemas.
	 *
	 * It should cover most basic use-cases but has a few limitations:
	 *
	 * + It doesn't allow passing options to the parsing step.
	 * + The protocol/type inference logic can be deceived.
	 *
	 * The parsing logic is as follows:
	 *
	 * + If `str` contains `/` and is a path
	 *   to an existing file, it will first be read as JSON, then as an IDL
	 *   specification if JSON parsing failed. If either succeeds, the result is
	 *   returned, otherwise the next steps are run using the file's content
	 *   instead of the input path.
	 * + If `str` is a valid JSON string, it is parsed then returned.
	 * + If `str` is a valid IDL protocol specification, it is parsed and returned
	 *   if no imports are present (and an error is thrown if there are any
	 *   imports).
	 * + If `str` is a valid IDL type specification, it is parsed and returned.
	 * + If neither of the above cases apply, `str` is returned.
	 */
	function read(str) {
	  let schema;
	  let contents = files.tryReadFileSync(str);

	  if (contents === null) {
	    schema = str;
	  } else {
	    try {
	      return JSON.parse(contents);
	    } catch (err) {
	      let opts = {importHook: files.createSyncImportHook()};
	      assembleProtocol(str, opts, (err, protocolSchema) => {
	        schema = err ? contents : protocolSchema;
	      });
	    }
	  }
	  if (typeof schema != 'string' || schema === 'null') {
	    // This last predicate is to allow `read('null')` to work similarly to
	    // `read('int')` and other primitives (null needs to be handled separately
	    // since it is also a valid JSON identifier).
	    return schema;
	  }
	  try {
	    return JSON.parse(schema);
	  } catch (err) {
	    try {
	      return Reader.readProtocol(schema);
	    } catch (err) {
	      try {
	        return Reader.readSchema(schema);
	      } catch (err) {
	        return schema;
	      }
	    }
	  }
	}

	class Reader {
	  constructor (str, opts) {
	    opts = opts || {};

	    this._tk = new Tokenizer(str);
	    this._ackVoidMessages = !!opts.ackVoidMessages;
	    this._implicitTags = !opts.delimitedCollections;
	    this._typeRefs = opts.typeRefs || TYPE_REFS;
	  }

	  static readProtocol (str, opts) {
	    let reader = new Reader(str, opts);
	    let protocol = reader._readProtocol();
	    if (protocol.imports.length) {
	      // Imports can only be resolved when the IDL file is provided via its
	      // path, we fail rather than silently ignore imports.
	      throw new Error('unresolvable import');
	    }
	    return protocol.protocol;
	  }

	  static readSchema (str, opts) {
	    let reader = new Reader(str, opts);
	    let doc = reader._readJavadoc();
	    let schema = reader._readType(doc === undefined ? {} : {doc}, true);
	    reader._tk.next({id: '(eof)'}); // Check that we have read everything.
	    return schema;
	  }

	  _readProtocol () {
	    let tk = this._tk;
	    let imports = [];
	    let types = [];
	    let messages = {};

	    // Outer declarations (outside of the protocol block).
	    this._readImports(imports);
	    let protocolSchema = {};
	    let protocolJavadoc = this._readJavadoc();
	    if (protocolJavadoc !== undefined) {
	      protocolSchema.doc = protocolJavadoc;
	    }
	    this._readAnnotations(protocolSchema);
	    tk.next({val: 'protocol'});
	    if (!tk.next({val: '{', silent: true})) {
	      // Named protocol.
	      protocolSchema.protocol = tk.next({id: 'name'}).val;
	      tk.next({val: '{'});
	    }

	    // Inner declarations.
	    while (!tk.next({val: '}', silent: true})) {
	      if (!this._readImports(imports)) {
	        let javadoc = this._readJavadoc();
	        let typeSchema = this._readType({}, true);
	        let numImports = this._readImports(imports, true);
	        let message = undefined;
	        // We mark our position and try to parse a message from here.
	        let pos = tk.pos;
	        if (!numImports && (message = this._readMessage(typeSchema))) {
	          // Note that if any imports were found, we cannot be parsing a
	          // message.
	          if (javadoc !== undefined && message.schema.doc === undefined) {
	            message.schema.doc = javadoc;
	          }
	          let oneWay = false;
	          if (
	            message.schema.response === 'void' ||
	            message.schema.response.type === 'void'
	          ) {
	            oneWay = !this._ackVoidMessages && !message.schema.errors;
	            if (message.schema.response === 'void') {
	              message.schema.response = 'null';
	            } else {
	              message.schema.response.type = 'null';
	            }
	          }
	          if (oneWay) {
	            message.schema['one-way'] = true;
	          }
	          if (messages[message.name]) {
	            // We have to do this check here otherwise the duplicate will be
	            // overwritten (and service instantiation won't be able to catch
	            // it).
	            throw new Error(`duplicate message: ${message.name}`);
	          }
	          messages[message.name] = message.schema;
	        } else {
	          // This was a standalone type definition.
	          if (javadoc) {
	            if (typeof typeSchema == 'string') {
	              typeSchema = {doc: javadoc, type: typeSchema};
	            } else if (typeSchema.doc === undefined) {
	              typeSchema.doc = javadoc;
	            }
	          }
	          types.push(typeSchema);
	          // We backtrack until just before the type's type name and swallow an
	          // eventual semi-colon (to make type declarations more consistent).
	          tk.pos = pos;
	          tk.next({val: ';', silent: true});
	        }
	        javadoc = undefined;
	      }
	    }
	    tk.next({id: '(eof)'});
	    if (types.length) {
	      protocolSchema.types = types;
	    }
	    if (Object.keys(messages).length) {
	      protocolSchema.messages = messages;
	    }
	    return {protocol: protocolSchema, imports};
	  }

	  _readAnnotations (schema) {
	    let tk = this._tk;
	    while (tk.next({val: '@', silent: true})) {
	      // Annotations are allowed to have names which aren't valid Avro names,
	      // we must advance until we hit the first left parenthesis.
	      let parts = [];
	      while (!tk.next({val: '(', silent: true})) {
	        parts.push(tk.next().val);
	      }
	      schema[parts.join('')] = tk.next({id: 'json'}).val;
	      tk.next({val: ')'});
	    }
	  }

	  _readMessage (responseSchema) {
	    let tk = this._tk;
	    let schema = {request: [], response: responseSchema};
	    this._readAnnotations(schema);
	    let name = tk.next().val;
	    if (tk.next().val !== '(') {
	      // This isn't a message.
	      return;
	    }
	    if (!tk.next({val: ')', silent: true})) {
	      do {
	        schema.request.push(this._readField());
	      } while (!tk.next({val: ')', silent: true}) && tk.next({val: ','}));
	    }
	    let token = tk.next();
	    switch (token.val) {
	      case 'throws':
	        // It doesn't seem like the IDL is explicit about which syntax to used
	        // for multiple errors. We will assume a comma-separated list.
	        schema.errors = [];
	        do {
	          schema.errors.push(this._readType());
	        } while (!tk.next({val: ';', silent: true}) && tk.next({val: ','}));
	        break;
	      case 'oneway':
	        schema['one-way'] = true;
	        tk.next({val: ';'});
	        break;
	      case ';':
	        break;
	      default:
	        throw tk.error('invalid message suffix', token);
	    }
	    return {name, schema};
	  }

	  _readJavadoc () {
	    let token = this._tk.next({id: 'javadoc', emitJavadoc: true, silent: true});
	    if (token) {
	      return token.val;
	    }
	  }

	  _readField () {
	    let tk = this._tk;
	    let javadoc = this._readJavadoc();
	    let schema = {type: this._readType()};
	    if (javadoc !== undefined && schema.doc === undefined) {
	      schema.doc = javadoc;
	    }
	    const isOptional = tk.next({id: 'operator', val: '?', silent: true});
	    this._readAnnotations(schema);
	    schema.name = tk.next({id: 'name'}).val;
	    if (tk.next({val: '=', silent: true})) {
	      schema['default'] = tk.next({id: 'json'}).val;
	    }
	    if (isOptional) {
	      schema.type = 'default' in schema && schema.default !== null ? [schema.type, 'null'] : ['null', schema.type];
	    }
	    return schema;
	  }

	  _readType (schema, top) {
	    schema = schema || {};
	    this._readAnnotations(schema);
	    schema.type = this._tk.next({id: 'name'}).val;
	    switch (schema.type) {
	      case 'record':
	      case 'error':
	        return this._readRecord(schema);
	      case 'fixed':
	        return this._readFixed(schema);
	      case 'enum':
	        return this._readEnum(schema, top);
	      case 'map':
	        return this._readMap(schema);
	      case 'array':
	        return this._readArray(schema);
	      case 'union':
	        if (Object.keys(schema).length > 1) {
	          throw new Error('union annotations are not supported');
	        }
	        return this._readUnion();
	      default: {
	        // Reference.
	        let ref = this._typeRefs[schema.type];
	        if (ref) {
	          delete schema.type; // Always overwrite the type.
	          utils.copyOwnProperties(ref, schema);
	        }
	        return Object.keys(schema).length > 1 ? schema : schema.type;
	      }
	    }
	  }

	  _readFixed (schema) {
	    let tk = this._tk;
	    if (!tk.next({val: '(', silent: true})) {
	      schema.name = tk.next({id: 'name'}).val;
	      tk.next({val: '('});
	    }
	    schema.size = parseInt(tk.next({id: 'number'}).val);
	    tk.next({val: ')'});
	    return schema;
	  }

	  _readMap (schema) {
	    let tk = this._tk;
	    // Brackets are unwieldy when declaring inline types. We allow for them to
	    // be omitted (but we keep the consistency that if the entry bracket is
	    // present, the exit one must be as well). Note that this is non-standard.
	    let silent = this._implicitTags;
	    let implicitTags = tk.next({val: '<', silent}) === undefined;
	    schema.values = this._readType();
	    tk.next({val: '>', silent: implicitTags});
	    return schema;
	  }

	  _readArray (schema) {
	    let tk = this._tk;
	    let silent = this._implicitTags;
	    let implicitTags = tk.next({val: '<', silent}) === undefined;
	    schema.items = this._readType();
	    tk.next({val: '>', silent: implicitTags});
	    return schema;
	  }

	  _readEnum (schema, top) {
	    let tk = this._tk;
	    if (!tk.next({val: '{', silent: true})) {
	      schema.name = tk.next({id: 'name'}).val;
	      tk.next({val: '{'});
	    }
	    schema.symbols = [];
	    do {
	      schema.symbols.push(tk.next().val);
	    } while (!tk.next({val: '}', silent: true}) && tk.next({val: ','}));
	    // To avoid confusing syntax, reader enums (i.e. enums with a default value)
	    // can only be defined top-level.
	    if (top && tk.next({val: '=', silent: true})) {
	      schema.default = tk.next().val;
	      tk.next({val: ';'});
	    }
	    return schema;
	  }

	  _readUnion () {
	    let tk = this._tk;
	    let arr = [];
	    tk.next({val: '{'});
	    do {
	      arr.push(this._readType());
	    } while (!tk.next({val: '}', silent: true}) && tk.next({val: ','}));
	    return arr;
	  }

	  _readRecord (schema) {
	    let tk = this._tk;
	    if (!tk.next({val: '{', silent: true})) {
	      schema.name = tk.next({id: 'name'}).val;
	      tk.next({val: '{'});
	    }
	    schema.fields = [];
	    while (!tk.next({val: '}', silent: true})) {
	      schema.fields.push(this._readField());
	      tk.next({val: ';'});
	    }
	    return schema;
	  }

	  _readImports (imports, maybeMessage) {
	    let tk = this._tk;
	    let numImports = 0;
	    let pos = tk.pos;
	    while (tk.next({val: 'import', silent: true})) {
	      if (!numImports && maybeMessage && tk.next({val: '(', silent: true})) {
	        // This will happen if a message is named import.
	        tk.pos = pos;
	        return;
	      }
	      let kind = tk.next({id: 'name'}).val;
	      let fname = JSON.parse(tk.next({id: 'string'}).val);
	      tk.next({val: ';'});
	      imports.push({kind, name: fname});
	      numImports++;
	    }
	    return numImports;
	  }
	}

	// Helpers.

	/**
	 * Simple class to split an input string into tokens.
	 *
	 * There are different types of tokens, characterized by their `id`:
	 *
	 * + `number` numbers.
	 * + `name` references.
	 * + `string` double-quoted.
	 * + `operator`, anything else, always single character.
	 * + `javadoc`, only emitted when `next` is called with `emitJavadoc` set.
	 * + `json`, only emitted when `next` is called with `'json'` as `id` (the
	 *   tokenizer doesn't have enough context to predict these).
	 */
	class Tokenizer {
	  constructor (str) {
	    this._str = str;
	    this.pos = 0;
	  }

	  next (opts) {
	    let token = {pos: this.pos, id: undefined, val: undefined};
	    let javadoc = this._skip(opts && opts.emitJavadoc);
	    if (typeof javadoc == 'string') {
	      token.id = 'javadoc';
	      token.val = javadoc;
	    } else {
	      let pos = this.pos;
	      let str = this._str;
	      let c = str.charAt(pos);
	      if (!c) {
	        token.id = '(eof)';
	      } else {
	        if (opts && opts.id === 'json') {
	          token.id = 'json';
	          this.pos = this._endOfJson();
	        } else if (c === '"') {
	          token.id = 'string';
	          this.pos = this._endOfString();
	        } else if (/[0-9]/.test(c)) {
	          token.id = 'number';
	          this.pos = this._endOf(/[0-9]/);
	        } else if (/[`A-Za-z_.]/.test(c)) {
	          token.id = 'name';
	          this.pos = this._endOf(/[`A-Za-z0-9_.]/);
	        } else {
	          token.id = 'operator';
	          this.pos = pos + 1;
	        }
	        token.val = str.slice(pos, this.pos);
	        if (token.id === 'json') {
	          // Let's be nice and give a more helpful error message when this
	          // occurs (JSON parsing errors wouldn't let us find the location
	          // otherwise).
	          try {
	            token.val = JSON.parse(token.val);
	          } catch (err) {
	            throw this.error('invalid JSON', token);
	          }
	        } else if (token.id === 'name') {
	          // Unescape names (our parser doesn't need them).
	          token.val = token.val.replace(/`/g, '');
	        }
	      }
	    }

	    let err;
	    if (opts && opts.id && opts.id !== token.id) {
	      err = this.error(`expected ID ${opts.id}`, token);
	    } else if (opts && opts.val && opts.val !== token.val) {
	      err = this.error(`expected value ${opts.val}`, token);
	    }
	    if (!err) {
	      return token;
	    } else if (opts && opts.silent) {
	      this.pos = token.pos; // Backtrack to start of token.
	      return undefined;
	    } else {
	      throw err;
	    }
	  }

	  error (reason, context) {
	    // Context must be either a token or a position.
	    let isToken = typeof context != 'number';
	    let pos = isToken ? context.pos : context;
	    let str = this._str;
	    let lineNum = 1;
	    let lineStart = 0;
	    for (let i = 0; i < pos; i++) {
	      if (str.charAt(i) === '\n') {
	        lineNum++;
	        lineStart = i;
	      }
	    }
	    let msg = isToken ?
	      `invalid token ${utils.printJSON(context)}: ${reason}` :
	      reason;
	    let err = new Error(msg);
	    err.token = isToken ? context : undefined;
	    err.lineNum = lineNum;
	    err.colNum = pos - lineStart;
	    return err;
	  }

	  /** Skip whitespace and comments. */
	  _skip (emitJavadoc) {
	    let str = this._str;
	    let isJavadoc = false;
	    let c;

	    while ((c = str.charAt(this.pos)) && /\s/.test(c)) {
	      this.pos++;
	    }
	    let pos = this.pos;
	    if (c === '/') {
	      switch (str.charAt(this.pos + 1)) {
	        case '/':
	          this.pos += 2;
	          while ((c = str.charAt(this.pos)) && c !== '\n') {
	            this.pos++;
	          }
	          return this._skip(emitJavadoc);
	        case '*':
	          this.pos += 2;
	          if (str.charAt(this.pos) === '*') {
	            isJavadoc = true;
	          }
	          while ((c = str.charAt(this.pos++))) {
	            if (c === '*' && str.charAt(this.pos) === '/') {
	              this.pos++;
	              if (isJavadoc && emitJavadoc) {
	                return extractJavadoc(str.slice(pos + 3, this.pos - 2));
	              }
	              return this._skip(emitJavadoc);
	            }
	          }
	          throw this.error('unterminated comment', pos);
	      }
	    }
	  }

	  /** Generic end of method. */
	  _endOf (pat) {
	    let pos = this.pos;
	    let str = this._str;
	    while (pat.test(str.charAt(pos))) {
	      pos++;
	    }
	    return pos;
	  }

	  /** Find end of a string. */
	  _endOfString () {
	    let pos = this.pos + 1; // Skip first double quote.
	    let str = this._str;
	    let c;
	    while ((c = str.charAt(pos))) {
	      if (c === '"') {
	        // The spec doesn't explicitly say so, but IDLs likely only
	        // allow double quotes for strings (C- and Java-style).
	        return pos + 1;
	      }
	      if (c === '\\') {
	        pos += 2;
	      } else {
	        pos++;
	      }
	    }
	    throw this.error('unterminated string', pos - 1);
	  }

	  /** Find end of JSON object, throwing an error if the end is reached first. */
	  _endOfJson () {
	    let pos = utils.jsonEnd(this._str, this.pos);
	    if (pos < 0) {
	      throw this.error('invalid JSON', pos);
	    }
	    return pos;
	  }
	}

	/**
	 * Extract Javadoc contents from the comment.
	 *
	 * The parsing done is very simple and simply removes the line prefixes and
	 * leading / trailing empty lines. It's better to be conservative with
	 * formatting rather than risk losing information.
	 */
	function extractJavadoc(str) {
	  let lines = str
	    .replace(/^[ \t]+|[ \t]+$/g, '') // Trim whitespace.
	    .split('\n').map((line, i) => {
	      return i ? line.replace(/^\s*\*\s?/, '') : line;
	    });
	  while (lines.length && !lines[0]) {
	    lines.shift();
	  }
	  while (lines.length && !lines[lines.length - 1]) {
	    lines.pop();
	  }
	  return lines.join('\n');
	}

	/** Returns the namespace generated by a protocol. */
	function protocolNamespace(protocol) {
	  if (protocol.namespace) {
	    return protocol.namespace;
	  }
	  let match = /^(.*)\.[^.]+$/.exec(protocol.protocol);
	  return match ? match[1] : undefined;
	}


	specs = {
	  Tokenizer,
	  assembleProtocol,
	  read,
	  readProtocol: Reader.readProtocol,
	  readSchema: Reader.readSchema
	};
	return specs;
}

var lib;
var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;

	/**
	 * Node.js entry point (see `etc/browser/` for browserify's entry points).
	 *
	 * It also adds Node.js specific functionality (for example a few convenience
	 * functions to read Avro files from the local filesystem).
	 */

	let containers = requireContainers(),
	    specs = requireSpecs(),
	    types = requireTypes(),
	    utils = requireUtils(),
	    fs = require$$4;


	const DECODER = new TextDecoder();

	/** Extract a container file's header synchronously. */
	function extractFileHeader(path, opts) {
	  opts = opts || {};

	  let decode = opts.decode === undefined ? true : !!opts.decode;
	  let size = Math.max(opts.size || 4096, 4);
	  let buf = new Uint8Array(size);
	  let tap = new utils.Tap(buf);
	  let fd = fs.openSync(path, 'r');

	  try {
	    let pos = fs.readSync(fd, buf, 0, size);
	    if (
	      pos < 4 ||
	      !utils.bufEqual(containers.MAGIC_BYTES, buf.subarray(0, 4))
	    ) {
	      return null;
	    }

	    let header = null;
	    do {
	      header = containers.HEADER_TYPE._read(tap);
	    } while (!isValid());
	    if (decode !== false) {
	      let meta = header.meta;
	      meta['avro.schema'] = JSON.parse(DECODER.decode(meta['avro.schema']));
	      if (meta['avro.codec'] !== undefined) {
	        meta['avro.codec'] = DECODER.decode(meta['avro.codec']);
	      }
	    }
	    return header;
	  } finally {
	    fs.closeSync(fd);
	  }

	  function isValid() {
	    if (tap.isValid()) {
	      return true;
	    }
	    let len = 2 * tap.length;
	    let buf = new Uint8Array(len);
	    len = fs.readSync(fd, buf, 0, len);
	    tap.append(buf);
	    return false;
	  }
	}

	/** Readable stream of records from a local Avro file. */
	function createFileDecoder(path, opts) {
	  return fs.createReadStream(path)
	    .pipe(new containers.streams.BlockDecoder(opts));
	}

	/** Writable stream of records to a local Avro file. */
	function createFileEncoder(path, schema, opts) {
	  let encoder = new containers.streams.BlockEncoder(schema, opts);
	  encoder.pipe(fs.createWriteStream(path, {defaultEncoding: 'binary'}));
	  return encoder;
	}


	lib = {
	  Type: types.Type,
	  assembleProtocol: specs.assembleProtocol,
	  createFileDecoder,
	  createFileEncoder,
	  extractFileHeader,
	  readProtocol: specs.readProtocol,
	  readSchema: specs.readSchema,
	  streams: containers.streams,
	  types: types.builtins,
	};
	return lib;
}

var libExports = requireLib();
var index = /*@__PURE__*/getDefaultExportFromCjs(libExports);

export { index as default };
