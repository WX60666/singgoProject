/** 
 * DevExtreme (viz/tree_map/tiling.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var defaultAlgorithm, _isFunction = require("../../core/utils/common").isFunction,
        _normalizeEnum = require("../core/utils").normalizeEnum,
        _round = Math.round,
        algorithms = {};
    exports.getAlgorithm = function(value) {
        return algorithms[_normalizeEnum(value)] || _isFunction(value) && value || defaultAlgorithm
    };
    exports.addAlgorithm = function(name, callback) {
        algorithms[name] = callback
    };
    exports.setDefaultAlgorithm = function(name) {
        defaultAlgorithm = algorithms[name]
    };
    var directionToIndexOffsets = {};
    directionToIndexOffsets[-1] = [2, 0];
    directionToIndexOffsets[1] = [0, 2];
    exports.buildSidesData = function(rect, directions, _staticSideIndex) {
        var sides = [rect[2] - rect[0], rect[3] - rect[1]],
            staticSideIndex = void 0 !== _staticSideIndex ? _staticSideIndex : sides[0] < sides[1] ? 0 : 1,
            variedSideIndex = 1 - staticSideIndex,
            staticSideDirection = directions[staticSideIndex],
            variedSideDirection = directions[variedSideIndex],
            staticSideIndexOffsets = directionToIndexOffsets[staticSideDirection],
            variedSideIndexOffsets = directionToIndexOffsets[variedSideDirection];
        return {
            staticSide: sides[staticSideIndex],
            variedSide: sides[variedSideIndex],
            static1: staticSideIndex + staticSideIndexOffsets[0],
            static2: staticSideIndex + staticSideIndexOffsets[1],
            varied1: variedSideIndex + variedSideIndexOffsets[0],
            varied2: variedSideIndex + variedSideIndexOffsets[1],
            staticDir: staticSideDirection,
            variedDir: variedSideDirection
        }
    };
    exports.calculateRectangles = function(nodes, head, totalRect, sidesData, rowData) {
        var i, ii, rect, delta, variedSidePart = [0, 0, 0, 0],
            static1 = sidesData.static1,
            static2 = sidesData.static2,
            position = totalRect[static1],
            dir = sidesData.staticDir,
            side = sidesData.staticSide,
            sum = rowData.sum;
        variedSidePart[sidesData.varied1] = totalRect[sidesData.varied1];
        variedSidePart[sidesData.varied2] = totalRect[sidesData.varied1] + sidesData.variedDir * rowData.side;
        for (i = head, ii = head + rowData.count; i < ii; ++i) {
            rect = variedSidePart.slice();
            rect[static1] = position;
            delta = _round(side * nodes[i].value / sum) || 0;
            sum -= nodes[i].value;
            side -= delta;
            position += dir * delta;
            rect[static2] = position;
            nodes[i].rect = rect
        }
        totalRect[sidesData.varied1] = variedSidePart[sidesData.varied2]
    }
});
