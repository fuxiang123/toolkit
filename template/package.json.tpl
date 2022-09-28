{
  "name": "@neuton/{{ dirName }}",
  "version": "1.0.0",
  "description": "> TODO: description",
  "homepage": "https://github.com/fuxiang123/{{ dirName }}#readme",
  "license": "ISC",
  "main": "dist/index.js",
  "module": "dist/index.module.js",
  "directories": {
    "lib": "dist",
    "test": "__tests__"
  },
  "files": [
    "dist"
  ],
  "publishConfig": {
    "registry": "http://82.157.120.5:4873/"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/fuxiang123/test-learn.git"
  },
  "scripts": {
    "test": "node ./__tests__/test.test.js"
  },
  "bugs": {
    "url": "https://github.com/fuxiang123/test-learn/issues"
  }
}
