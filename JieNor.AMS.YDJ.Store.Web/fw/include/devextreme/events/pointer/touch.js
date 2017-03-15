/** 
 * DevExtreme (events/pointer/touch.js)
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
        devices = require("../../core/devices"),
        BaseStrategy = require("./base");
    require("./touch_hooks");
    var eventMap = {
        dxpointerdown: "touchstart",
        dxpointermove: "touchmove",
        dxpointerup: "touchend",
        dxpointercancel: "touchcancel",
        dxpointerover: "",
        dxpointerout: "",
        dxpointerenter: "",
        dxpointerleave: ""
    };
    var normalizeTouchEvent = function(e) {
        var pointers = [];
        $.each(e.touches, function(_, touch) {
            pointers.push($.extend({
                pointerId: touch.identifier
            }, touch))
        });
        return {
            pointers: pointers,
            pointerId: e.changedTouches[0].identifier
        }
    };
    var skipTouchWithSameIdentifier = function(pointerEvent) {
        return "ios" === devices.real().platform && ("dxpointerdown" === pointerEvent || "dxpointerup" === pointerEvent)
    };
    var TouchStrategy = BaseStrategy.inherit({
        ctor: function() {
            this.callBase.apply(this, arguments);
            this._pointerId = 0
        },
        _handler: function(e) {
            if (skipTouchWithSameIdentifier(this._eventName)) {
                var touch = e.changedTouches[0];
                if (this._pointerId === touch.identifier && 0 !== this._pointerId) {
                    return
                }
                this._pointerId = touch.identifier
            }
            return this.callBase.apply(this, arguments)
        },
        _fireEvent: function(args) {
            return this.callBase($.extend(normalizeTouchEvent(args.originalEvent), args))
        }
    });
    TouchStrategy.map = eventMap;
    TouchStrategy.normalize = normalizeTouchEvent;
    module.exports = TouchStrategy
});
