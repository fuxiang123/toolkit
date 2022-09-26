'use strict';

const moduleC = require('..');
const assert = require('assert').strict;

assert.strictEqual(moduleC(), 'Hello from moduleC');
console.info("moduleC tests passed");
