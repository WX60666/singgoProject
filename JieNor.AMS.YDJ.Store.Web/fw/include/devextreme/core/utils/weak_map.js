/** 
 * DevExtreme (core/utils/weak_map.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery"),
        WeakMap = window.WeakMap;
    if (!WeakMap) {
        WeakMap = function() {
            var keys = [],
                values = [];
            this.set = function(key, value) {
                var index = $.inArray(key, keys);
                if (index === -1) {
                    keys.push(key);
                    values.push(value)
                } else {
                    values[index] = value
                }
            };
            this.get = function(key) {
                var index = $.inArray(key, keys);
                if (index === -1) {
                    return
                }
                return values[index]
            };
            this.has = function(key) {
                var index = $.inArray(key, keys);
                if (index === -1) {
                    return false
                }
                return true
            }
        }
    }
    module.exports = WeakMap
});
