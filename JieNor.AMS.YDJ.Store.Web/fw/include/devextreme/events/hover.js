/** 
 * DevExtreme (events/hover.js)
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
        Class = require("../core/class"),
        devices = require("../core/devices"),
        registerEvent = require("./core/event_registrator"),
        eventUtils = require("./utils"),
        pointerEvents = require("./pointer");
    var HOVERSTART_NAMESPACE = "dxHoverStart",
        HOVERSTART = "dxhoverstart",
        POINTERENTER_NAMESPACED_EVENT_NAME = eventUtils.addNamespace(pointerEvents.enter, HOVERSTART_NAMESPACE),
        HOVEREND_NAMESPACE = "dxHoverEnd",
        HOVEREND = "dxhoverend",
        POINTERLEAVE_NAMESPACED_EVENT_NAME = eventUtils.addNamespace(pointerEvents.leave, HOVEREND_NAMESPACE);
    var Hover = Class.inherit({
        noBubble: true,
        handlerCache: {},
        add: function(element, handleObj) {
            var that = this,
                $element = $(element),
                handler = function(e) {
                    that._handler(e)
                };
            $element.on(this._originalEventName, handleObj.selector, handler);
            this.handlerCache[handleObj.guid] = handler
        },
        _handler: function(e) {
            if (eventUtils.isTouchEvent(e) || devices.isSimulator()) {
                return
            }
            eventUtils.fireEvent({
                type: this._eventName,
                originalEvent: e,
                delegateTarget: e.delegateTarget
            })
        },
        remove: function(element, handleObj) {
            $(element).off(this._originalEventName, handleObj.selector, this.handlerCache[handleObj.guid]);
            delete this.handlerCache[handleObj.guid]
        }
    });
    var HoverStart = Hover.inherit({
        ctor: function() {
            this._eventName = HOVERSTART;
            this._originalEventName = POINTERENTER_NAMESPACED_EVENT_NAME;
            this._isMouseDown = false
        },
        _handler: function(e) {
            var pointers = e.pointers || [];
            if (!pointers.length) {
                this.callBase(e)
            }
        }
    });
    var HoverEnd = Hover.inherit({
        ctor: function() {
            this._eventName = HOVEREND;
            this._originalEventName = POINTERLEAVE_NAMESPACED_EVENT_NAME
        }
    });
    registerEvent(HOVERSTART, new HoverStart);
    registerEvent(HOVEREND, new HoverEnd);
    exports.start = HOVERSTART;
    exports.end = HOVEREND
});
