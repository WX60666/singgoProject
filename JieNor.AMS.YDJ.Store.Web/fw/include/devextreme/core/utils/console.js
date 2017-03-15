/** 
 * DevExtreme (core/utils/console.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery");
    var logger = function() {
        var console = window.console;

        function info(text) {
            if (!console || !$.isFunction(console.info)) {
                return
            }
            console.info(text)
        }

        function warn(text) {
            if (!console || !$.isFunction(console.warn)) {
                return
            }
            console.warn(text)
        }

        function error(text) {
            if (!console || !$.isFunction(console.error)) {
                return
            }
            console.error(text)
        }
        return {
            info: info,
            warn: warn,
            error: error
        }
    }();
    var debug = function() {
        function assert(condition, message) {
            if (!condition) {
                throw new Error(message)
            }
        }

        function assertParam(parameter, message) {
            assert(null !== parameter && void 0 !== parameter, message)
        }
        return {
            assert: assert,
            assertParam: assertParam
        }
    }();
    exports.logger = logger;
    exports.debug = debug
});
