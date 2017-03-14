/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

// filter for noisy stack trace lines
const FILTER_NOISE =
  /(\/|\\)jest(-.*?)?(\/|\\)(vendor|build|node_modules|packages)(\/|\\)/;

const toDiscard = (filename: string, index: number): boolean => {
  return index !== 0 && FILTER_NOISE.test(filename);
};

class TestStacktrace extends String {
  message: string;
  error: Error;
  stack: Array<CallSite>;
  constructor(message, error, stack) {
    super(message);
    this.message = message;
    this.error = error;
    this.stack = stack;
  }
}

const setPrepareStackTrace = (Error: Class<Error>) => {
  Error.prepareStackTrace = (error, stacktrace) => {
    const filteredStacktrace = stacktrace.filter(
      (callsite, index) => !toDiscard(callsite.getFileName() || '', index)
    );
    const atArray = filteredStacktrace.map(callsite => {
      const functionName = callsite.getFunctionName() || '<anonymous>';
      const filename = callsite.getFileName() || '';
      const line = callsite.getLineNumber() || '0';
      const column = callsite.getColumnNumber() || '0';
      return `at ${functionName} (${filename}:${line}:${column})`;
    });
    const message = (
      `${error.name}: ${error.message}\n${atArray.join('\n')}`
    );
    return new TestStacktrace(message, error, filteredStacktrace);
  };
};

module.exports = {
  setPrepareStackTrace,
  toDiscard,
};
