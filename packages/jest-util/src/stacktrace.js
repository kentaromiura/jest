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

type TestStacktraceProps = {
  description: string,
  error: Error,
  message: string,
  stack: Array<CallSite>,
};

class TestStacktrace extends String {
  description: string;
  error: Error;
  message: string;
  stack: Array<CallSite>;
  constructor({
      description,
      error,
      message,
      stack,
  }: TestStacktraceProps) {
    super(message);
    this.description = description;
    this.error = error;
    this.message = message;
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
    const description = `${error.name}: ${error.message}`;
    const message = (
      `${description}\n${atArray.join('\n')}`
    );
    return new TestStacktrace({
      description,
      error,
      stack: filteredStacktrace,
      message,
    });
  };
};

module.exports = {
  setPrepareStackTrace,
  toDiscard,
};
