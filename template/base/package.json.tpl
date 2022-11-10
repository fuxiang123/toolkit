{
  "name": "{{ projectName }}",
  "version": "0.0.1",
  "description": "> TODO: description",
  "homepage": "{{ gitrepo }}/{{ dirPath }}#readme",
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
    "prepublish": "npm run build",
    "test": "node ./__tests__/test.test.js"
  },
  "devDependencies": {
    "@neuton/tsconfig": "workspace:*"
  },
  "bugs": {
    "url": "{{ gitrepo }}/issues"
  }
}
