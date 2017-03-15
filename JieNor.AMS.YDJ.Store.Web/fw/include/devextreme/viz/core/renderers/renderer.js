/** 
 * DevExtreme (viz/core/renderers/renderer.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var browser = require("../../../core/utils/browser");

    function isSvg() {
        return !(browser.msie && browser.version < 9) || !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect
    }
    if (!isSvg()) {
        if (document.namespaces && !document.namespaces.vml) {
            document.namespaces.add("vml", "urn:schemas-microsoft-com:vml");
            document.createStyleSheet().cssText = "vml\\:* { behavior:url(#default#VML); display: inline-block; } "
        }
        exports.Renderer = require("./vml_renderer").VmlRenderer
    } else {
        exports.Renderer = require("./svg_renderer").SvgRenderer
    }
    exports.isSvg = isSvg
});
