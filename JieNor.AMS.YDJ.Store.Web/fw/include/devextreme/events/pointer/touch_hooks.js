/** 
 * DevExtreme (events/pointer/touch_hooks.js)
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
    var touchEventHook = {
        filter: function(event, originalEvent) {
            var touches = originalEvent.touches.length ? originalEvent.touches : originalEvent.changedTouches;
            $.each(["pageX", "pageY", "screenX", "screenY", "clientX", "clientY"], function() {
                event[this] = touches[0][this]
            });
            return event
        },
        props: $.event.mouseHooks.props.concat(["touches", "changedTouches", "targetTouches", "detail", "result", "originalTarget", "charCode", "prevValue"])
    };
    $.each(["touchstart", "touchmove", "touchend", "touchcancel"], function() {
        $.event.fixHooks[this] = touchEventHook
    })
});
