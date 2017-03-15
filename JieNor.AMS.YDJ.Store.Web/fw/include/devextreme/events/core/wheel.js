/** 
 * DevExtreme (events/core/wheel.js)
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
        registerEvent = require("./event_registrator"),
        eventUtils = require("../utils");
    var EVENT_NAME = "dxmousewheel",
        EVENT_NAMESPACE = "dxWheel";
    $.event.fixHooks.wheel = $.event.mouseHooks;
    var wheelEvent = void 0 !== document.onwheel ? "wheel" : "mousewheel";
    var wheel = {
        setup: function(element, data) {
            var $element = $(element);
            $element.on(eventUtils.addNamespace(wheelEvent, EVENT_NAMESPACE), $.proxy(wheel._wheelHandler, wheel))
        },
        teardown: function(element) {
            var $element = $(element);
            $element.off("." + EVENT_NAMESPACE)
        },
        _wheelHandler: function(e) {
            var delta = this._getWheelDelta(e.originalEvent);
            eventUtils.fireEvent({
                type: EVENT_NAME,
                originalEvent: e,
                delta: delta,
                pointerType: "mouse"
            });
            e.stopPropagation()
        },
        _getWheelDelta: function(event) {
            return event.wheelDelta ? event.wheelDelta : 30 * -event.deltaY
        }
    };
    registerEvent(EVENT_NAME, wheel);
    exports.name = EVENT_NAME
});
