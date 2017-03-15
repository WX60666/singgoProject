/** 
 * DevExtreme (core/utils/browser.js)
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
    var webkitRegExp = /(webkit)[ \/]([\w.]+)/,
        ieRegExp = /(msie) (\d{1,2}\.\d)/,
        ie11RegExp = /(trident).*rv:(\d{1,2}\.\d)/,
        msEdge = /(edge)\/((\d+)?[\w\.]+)/,
        mozillaRegExp = /(mozilla)(?:.*? rv:([\w.]+))/;
    var browserFromUA = function(ua) {
        ua = ua.toLowerCase();
        var result = {},
            matches = ieRegExp.exec(ua) || ie11RegExp.exec(ua) || msEdge.exec(ua) || ua.indexOf("compatible") < 0 && mozillaRegExp.exec(ua) || webkitRegExp.exec(ua) || [],
            browserName = matches[1],
            browserVersion = matches[2];
        if ("trident" === browserName || "edge" === browserName) {
            browserName = "msie"
        }
        if (browserName) {
            result[browserName] = true;
            result.version = browserVersion
        }
        return result
    };
    module.exports = $.extend({
        _fromUA: browserFromUA
    }, browserFromUA(navigator.userAgent))
});
