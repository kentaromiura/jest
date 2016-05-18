/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const createDirectory = require('jest-util').createDirectory;

const ensureDirectoryExists = filePath => {
  try {
    createDirectory(path.join(path.dirname(filePath)));
  } catch (e) {}
};
const fileExists = path => {
  let exists = true;
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    exists = false;
  }
  return exists;
};

class TestSnapshot {

  constructor(filename) {
    this._filename = filename;
    if (this.fileExists(filename)) {
      this._content = JSON.parse(fs.readFileSync(filename));
    } else {
      this._content = {};
    }

    return this._loaded;
  }

  fileExists() {
    return fileExists(this._filename);
  }

  save() {
    ensureDirectoryExists(this._filename);
    fs.writeFileSync(this._filename, JSON.stringify(this._content));
  }

  has(key) {
    return this._content[key] !== undefined;
  }

  get(key) {
    return this._content[key];
  }

  matches(key, value) {
    return this.get(key) === value;
  }

  replace(key, value) {
    this._content[key] = value;
  }

  add(key, value) {
    if (!this.has(key)) {
      this.replace(key, value);
    } else {
      throw new Error('Trying to add a snapshot that already exists');
    }
  }

}

module.exports = TestSnapshot;
