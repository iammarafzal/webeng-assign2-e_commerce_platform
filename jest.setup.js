// Jest setup file to mock localStorage
require('dotenv').config();
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
  };
}

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
