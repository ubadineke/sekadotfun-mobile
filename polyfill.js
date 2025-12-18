import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto';

// Standard Polyfills
global.Buffer = Buffer;
global.TextEncoder = require('text-encoding').TextEncoder;
try {
  global.assert = require('assert');
} catch (e) {
  // Ignore if assert is missing, but it was requested
}

// CRITICAL FIX: Anchor 0.31+ Buffer.subarray issue on React Native
// When Anchor slices a buffer (e.g. for account data), it uses subarray.
// On RN, this returns a plain Uint8Array, stripping Buffer methods like readUIntLE.
// This patch ensures the result remains a Buffer.
Buffer.prototype.subarray = function subarray(begin, end) {
  const result = Uint8Array.prototype.subarray.apply(this, [begin, end]);
  Object.setPrototypeOf(result, Buffer.prototype);
  return result;
};

console.log('Polyfill.js: Applied Anchor 0.31+ Buffer fix');

// Crypto Polyfill
class Crypto {
  getRandomValues = expoCryptoGetRandomValues
}

const webCrypto = typeof crypto !== 'undefined' ? crypto : new Crypto()

  ; (() => {
    if (typeof crypto === 'undefined') {
      Object.defineProperty(window, 'crypto', {
        configurable: true,
        enumerable: true,
        get: () => webCrypto,
      })
    }
  })()
