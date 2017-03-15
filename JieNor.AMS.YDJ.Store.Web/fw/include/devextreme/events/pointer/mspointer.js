/** 
 * DevExtreme (events/pointer/mspointer.js)
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
        BaseStrategy = require("./base"),
        Observer = require("./observer"),
        browser = require("../../core/utils/browser");
    require("./mspointer_hooks");
    var isIE10 = browser.msie && 10 === parseInt(browser.version);
    var eventMap = {
        dxpointerdown: "MSPointerDown pointerdown",
        dxpointermove: "MSPointerMove pointermove",
        dxpointerup: "MSPointerUp pointerup",
        dxpointercancel: "MSPointerCancel pointercancel",
        dxpointerover: "MSPointerOver pointerover",
        dxpointerout: "MSPointerOut pointerout",
        dxpointerenter: isIE10 ? "mouseenter" : "MSPointerEnter pointerenter",
        dxpointerleave: isIE10 ? "mouseleave" : "MSPointerLeave pointerleave"
    };
    var observer;
    var activated = false;
    var activateStrategy = function() {
        if (activated) {
            return
        }
        observer = new Observer(eventMap, function(a, b) {
            return a.pointerId === b.pointerId
        }, function(e) {
            if (e.isPrimary) {
                observer.reset()
            }
        });
        activated = true
    };
    var MsPointerStrategy = BaseStrategy.inherit({
        ctor: function() {
            this.callBase.apply(this, arguments);
            activateStrategy()
        },
        _fireEvent: function(args) {
            return this.callBase($.extend({
                pointers: observer.pointers(),
                pointerId: args.originalEvent.pointerId
            }, args))
        }
    });
    MsPointerStrategy.map = eventMap;
    MsPointerStrategy.resetObserver = function() {
        observer.reset()
    };
    module.exports = MsPointerStrategy
});
