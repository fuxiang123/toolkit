{
  "name": "@neuton/{{ dirName }}",
  "version": "1.0.0",
  "description": "> TODO: description",
  "homepage": "{{ gitrepo }}{{/{{ dirName }}#readme",
  "license": "ISC",
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "files": [
    "dist"
  ],
  "publishConfig": {
    "registry": "{{ registry }}"
  },
  "repository": {
    "type": "git",
    "url": "{{ gitrepo }}.git"
  },
  "scripts": {
    "build": "cross-env NODE_ENV=production rollup -c",
    "test": "node ./__tests__/test.test.js"
  },
  "bugs": {
    "url": "{{ gitrepo }}/issues"
  }
}
