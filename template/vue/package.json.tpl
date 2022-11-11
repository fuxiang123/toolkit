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
    "build": "rollup -c",
    "prepublish": "npm run build",
    "test": "node ./__tests__/test.test.js"
  },
  "bugs": {
    "url": "{{ gitrepo }}/issues"
  },
  "peerDependencies": {
    "axios": ">=0.27.2",
    "less": ">=3.0.0",
    "vue": ">=3.0.0",
    "vue-router": ">=3.0.0"
  },
  "devDependencies": {
    "@babel/preset-typescript": "^7.18.6",
    "@rollup/plugin-babel": "^5.3.1",
    "@rollup/plugin-image": "^3.0.0",
    "@rollup/plugin-typescript": "^8.5.0",
    "@vue/compiler-sfc": "^3.2.41",
    "axios": "^1.1.3",
    "less": "^4.1.3",
    "rollup-plugin-postcss": "^3.1.4",
    "rollup-plugin-vue": "^6.0.0",
    "vue": "^3.2.41",
    "vue-router": "^4.1.5"
  }
}
