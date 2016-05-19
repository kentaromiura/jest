/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+jsinfra
 */
'use strict';

let accessShouldThrow = false;

jest
  .autoMockOff()
  .mock('mkdirp', () => {
    return {
      sync: jest.fn(),
    };
  })
  .mock('fs', () => ({
    accessSync : jest.fn(() => {
      if (accessShouldThrow) {
        throw new Error();
      }
      return true;
    }),
    readFileSync : jest.fn(fileName => {
      const EXPECTED_FILE_NAME = '/foo/__tests__/__snapshots__/baz.js.snap';
      expect(fileName).toBe(EXPECTED_FILE_NAME);
      return '{}';
    }),
    writeFileSync : jest.fn((path, content) => {
      expect(content).toBe('{"foo":"bar"}');
    }),
  }));

const TEST_FILE = '/foo/__tests__/baz.js';
const SNAPSHOT = 'foo';
const SNAPSHOT_VALUE = 'bar';

let SnapshotFile;

describe('SnapshotFile', () => {
  beforeEach(() => {
    accessShouldThrow = false;
    SnapshotFile = require('../SnapshotFile');
  });

  it('can tell if a snapshot file exists or not', () => {
    const snapshotFile = SnapshotFile.forFile(TEST_FILE);
    accessShouldThrow = false;
    expect(snapshotFile.fileExists()).toBe(true);
    accessShouldThrow = true;
    expect(snapshotFile.fileExists()).toBe(false);
  });

  it('stores and retrieves snapshots', () => {
    const snapshotFile = SnapshotFile.forFile(TEST_FILE);
    snapshotFile.add(SNAPSHOT, SNAPSHOT_VALUE);
    expect(snapshotFile.get(SNAPSHOT)).toBe(SNAPSHOT_VALUE);
  });

  it('can tell if a snapshot file has a snapshot', () => {
    const NOT_A_SNAPSHOT = 'baz';
    const snapshotFile = SnapshotFile.forFile(TEST_FILE);
    snapshotFile.add(SNAPSHOT, SNAPSHOT_VALUE);
    expect(snapshotFile.has(SNAPSHOT)).toBe(true);
    expect(snapshotFile.has(NOT_A_SNAPSHOT)).toBe(false);
  });

  it('can tell if a snapshot matches a string', () => {
    const INCORRECT_VALUE = 'baz';
    const snapshotFile = SnapshotFile.forFile(TEST_FILE);
    snapshotFile.add(SNAPSHOT, SNAPSHOT_VALUE);
    expect(snapshotFile.matches(SNAPSHOT, SNAPSHOT_VALUE)).toBe(true);
    expect(snapshotFile.matches(SNAPSHOT, INCORRECT_VALUE)).toBe(false);
  });

  it('can replace snapshot values', () => {
    const NEW_VALUE = 'baz';
    const snapshotFile = SnapshotFile.forFile(TEST_FILE);
    snapshotFile.add(SNAPSHOT, SNAPSHOT_VALUE);
    expect(snapshotFile.matches(SNAPSHOT, SNAPSHOT_VALUE)).toBe(true);
    snapshotFile.replace(SNAPSHOT, NEW_VALUE);
    expect(snapshotFile.matches(SNAPSHOT, NEW_VALUE)).toBe(true);
  });

  it('cannot add the same key twice', () => {
    const snapshotFile = SnapshotFile.forFile(TEST_FILE);
    snapshotFile.add(SNAPSHOT, SNAPSHOT_VALUE);
    expect(() => {
      snapshotFile.add(SNAPSHOT, SNAPSHOT_VALUE);
    }).toThrow();
  });

  it('loads and saves file correctly', () => {
    const snapshotFile = SnapshotFile.forFile(TEST_FILE);
    snapshotFile.add(SNAPSHOT, SNAPSHOT_VALUE);
    expect(snapshotFile.get(SNAPSHOT)).toBe(SNAPSHOT_VALUE);
    snapshotFile.save();
  });
});
