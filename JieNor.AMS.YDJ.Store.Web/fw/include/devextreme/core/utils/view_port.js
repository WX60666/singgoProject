/** 
 * DevExtreme (core/utils/view_port.js)
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
        changeCallback = $.Callbacks(),
        $originalViewPort = $();
    var value = function() {
        var $current;
        return function(element) {
            if (!arguments.length) {
                return $current
            }
            var $element = $(element);
            $originalViewPort = $element;
            var isNewViewportFound = !!$element.length;
            var prevViewPort = value();
            $current = isNewViewportFound ? $element : $("body");
            changeCallback.fire(isNewViewportFound ? value() : $(), prevViewPort)
        }
    }();
    $(function() {
        value(".dx-viewport")
    });
    exports.value = value;
    exports.changeCallback = changeCallback;
    exports.originalViewPort = function() {
        return $originalViewPort
    }
});
