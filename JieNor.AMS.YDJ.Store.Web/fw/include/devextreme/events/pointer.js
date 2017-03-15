/** 
 * DevExtreme (events/pointer.js)
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
        support = require("../core/utils/support"),
        devices = require("../core/devices"),
        registerEvent = require("./core/event_registrator"),
        TouchStrategy = require("./pointer/touch"),
        MsPointerStrategy = require("./pointer/mspointer"),
        MouseStrategy = require("./pointer/mouse"),
        MouseAndTouchStrategy = require("./pointer/mouse_and_touch");
    var EventStrategy = function() {
        if (support.pointerEvents) {
            return MsPointerStrategy
        }
        var device = devices.real();
        if (support.touch && !(device.tablet || device.phone)) {
            return MouseAndTouchStrategy
        }
        if (support.touch) {
            return TouchStrategy
        }
        return MouseStrategy
    }();
    $.each(EventStrategy.map, function(pointerEvent, originalEvents) {
        registerEvent(pointerEvent, new EventStrategy(pointerEvent, originalEvents))
    });
    module.exports = {
        down: "dxpointerdown",
        up: "dxpointerup",
        move: "dxpointermove",
        cancel: "dxpointercancel",
        enter: "dxpointerenter",
        leave: "dxpointerleave",
        over: "dxpointerover",
        out: "dxpointerout"
    }
});
