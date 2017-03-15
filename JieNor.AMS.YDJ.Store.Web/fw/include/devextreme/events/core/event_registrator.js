/** 
 * DevExtreme (events/core/event_registrator.js)
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
        MemorizedCallbacks = require("../../core/memorized_callbacks");
    var eventNS = $.event,
        hooksNS = eventNS.fixHooks,
        specialNS = $.event.special;
    var DX_EVENT_HOOKS = {
        props: eventNS.mouseHooks.props.concat(["pointerType", "pointerId", "pointers"])
    };
    var callbacks = new MemorizedCallbacks;
    var registerEvent = function(name, eventObject) {
        var strategy = {};
        if ("noBubble" in eventObject) {
            strategy.noBubble = eventObject.noBubble
        }
        if ("bindType" in eventObject) {
            strategy.bindType = eventObject.bindType
        }
        if ("delegateType" in eventObject) {
            strategy.delegateType = eventObject.delegateType
        }
        $.each(["setup", "teardown", "add", "remove", "trigger", "handle", "_default", "dispose"], function(_, methodName) {
            if (!eventObject[methodName]) {
                return
            }
            strategy[methodName] = function() {
                var args = $.makeArray(arguments);
                args.unshift(this);
                return eventObject[methodName].apply(eventObject, args)
            }
        });
        hooksNS[name] = DX_EVENT_HOOKS;
        callbacks.fire(name, strategy)
    };
    registerEvent.callbacks = callbacks;
    var registerJQueryEvent = function(name, eventObject) {
        specialNS[name] = eventObject
    };
    callbacks.add(registerJQueryEvent);
    module.exports = registerEvent
});
