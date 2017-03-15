/** 
 * DevExtreme (viz/tree_map/tiling.squarified.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var _max = Math.max,
        _squarify = require("./tiling.squarified.base");

    function accumulate(total, current) {
        return _max(total, current)
    }

    function squarified(data) {
        return _squarify(data, accumulate, false)
    }
    require("./tiling").addAlgorithm("squarified", squarified);
    module.exports = squarified
});
