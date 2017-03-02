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

const chalk = require('chalk');
Object.keys(chalk.styles).forEach(style => {
  chalk.styles[style].open = '<span class="chalk-' + style + '">';
  chalk.styles[style].close = '</span>'
});

module.exports = () => {};
