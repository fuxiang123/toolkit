'use strict';
const moduleC = require('module-c');

module.exports = moduleB;

function moduleB() {
    return "Hello from moduleB";
}

console.log(moduleC());