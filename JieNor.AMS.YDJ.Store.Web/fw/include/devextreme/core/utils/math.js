/** 
 * DevExtreme (core/utils/math.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var sign = function(value) {
        if (0 === value) {
            return 0
        }
        return value / Math.abs(value)
    };
    var fitIntoRange = function(value, minValue, maxValue) {
        return Math.min(Math.max(value, minValue), maxValue)
    };
    exports.sign = sign;
    exports.fitIntoRange = fitIntoRange
});
