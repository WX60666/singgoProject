/** 
 * DevExtreme (viz/range_selector/common.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var _format = require("../core/format"),
        isFunction = require("../../core/utils/common").isFunction,
        HEIGHT_COMPACT_MODE = 24,
        POINTER_SIZE = 4,
        EMPTY_SLIDER_MARKER_TEXT = ". . .";
    var utils = {
        trackerSettings: {
            fill: "grey",
            stroke: "grey",
            opacity: 1e-4
        },
        animationSettings: {
            duration: 250
        }
    };
    var consts = {
        emptySliderMarkerText: EMPTY_SLIDER_MARKER_TEXT,
        pointerSize: POINTER_SIZE
    };
    var formatValue = function(value, formatOptions) {
        var formatObject = {
            value: value,
            valueText: _format(value, formatOptions)
        };
        return String(isFunction(formatOptions.customizeText) ? formatOptions.customizeText.call(formatObject, formatObject) : formatObject.valueText)
    };
    exports.utils = utils;
    exports.consts = consts;
    exports.formatValue = formatValue;
    exports.HEIGHT_COMPACT_MODE = HEIGHT_COMPACT_MODE
});
