import test from '../src/test.js';
import { strict as assert } from 'assert';

assert.strictEqual(test(), 'Hello from test');
console.info("test tests passed");
