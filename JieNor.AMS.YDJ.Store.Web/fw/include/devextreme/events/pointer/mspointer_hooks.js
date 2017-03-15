/** 
 * DevExtreme (events/pointer/mspointer_hooks.js)
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
    var POINTER_TYPE_MAP = {
        2: "touch",
        3: "pen",
        4: "mouse"
    };
    var pointerEventHook = {
        filter: function(event, originalEvent) {
            var pointerType = originalEvent.pointerType;
            if ($.isNumeric(pointerType)) {
                event.pointerType = POINTER_TYPE_MAP[pointerType]
            }
            return event
        },
        props: $.event.mouseHooks.props.concat(["pointerId", "pointerType", "originalTarget", "width", "height", "pressure", "result", "tiltX", "charCode", "tiltY", "detail", "isPrimary", "prevValue"])
    };
    $.each(["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel", "MSPointerOver", "MSPointerOut", "mouseenter", "mouseleave", "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout", "pointerenter", "pointerleave"], function() {
        $.event.fixHooks[this] = pointerEventHook
    })
});
