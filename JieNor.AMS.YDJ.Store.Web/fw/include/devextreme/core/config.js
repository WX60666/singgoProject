/** 
 * DevExtreme (core/config.js)
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
        config = {
            rtlEnabled: false,
            defaultCurrency: "USD",
            designMode: false
        };
    module.exports = function() {
        if (!arguments.length) {
            return config
        }
        $.extend(config, arguments[0])
    }
});
