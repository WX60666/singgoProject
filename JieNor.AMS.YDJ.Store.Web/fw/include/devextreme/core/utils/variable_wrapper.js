/** 
 * DevExtreme (core/utils/variable_wrapper.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var logger = require("./console").logger,
        dependencyInjector = require("./dependency_injector");
    module.exports = dependencyInjector({
        isWrapped: function(value) {
            return false
        },
        isWritableWrapped: function(value) {
            return false
        },
        wrap: function(value) {
            return value
        },
        unwrap: function(value) {
            return value
        },
        assign: function(variable, value) {
            logger.error("Method 'assign' should not be used for not wrapped variables. Use 'isWrapped' method for enshuring.")
        }
    })
});
