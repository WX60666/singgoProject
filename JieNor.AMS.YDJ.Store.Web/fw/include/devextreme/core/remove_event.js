/** 
 * DevExtreme (core/remove_event.js)
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
        cleanData = $.cleanData,
        specialEvents = $.event.special;
    var eventName = "dxremove",
        eventPropName = "dxRemoveEvent";
    $.cleanData = function(elements) {
        for (var i = 0; i < elements.length; i++) {
            var $element = $(elements[i]);
            if ($element.prop(eventPropName)) {
                $element.removeProp(eventPropName);
                $element.triggerHandler(eventName)
            }
        }
        return cleanData(elements)
    };
    specialEvents[eventName] = {
        noBubble: true,
        setup: function() {
            $(this).prop(eventPropName, true)
        }
    };
    module.exports = eventName
});
