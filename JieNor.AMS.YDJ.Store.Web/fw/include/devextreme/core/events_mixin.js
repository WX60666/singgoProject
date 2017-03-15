/** 
 * DevExtreme (core/events_mixin.js)
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
    module.exports = {
        ctor: function() {
            this._events = {}
        },
        hasEvent: function(eventName) {
            var callbacks = this._events[eventName];
            if (callbacks) {
                return callbacks.has()
            }
            return false
        },
        fireEvent: function(eventName, eventArgs) {
            var callbacks = this._events[eventName];
            if (callbacks) {
                callbacks.fireWith(this, eventArgs)
            }
            return this
        },
        on: function(eventName, eventHandler) {
            if ($.isPlainObject(eventName)) {
                $.each(eventName, $.proxy(function(e, h) {
                    this.on(e, h)
                }, this))
            } else {
                var addFn, callbacks = this._events[eventName];
                if (!callbacks) {
                    callbacks = $.Callbacks();
                    this._events[eventName] = callbacks
                }
                addFn = callbacks.originalAdd || callbacks.add;
                addFn.call(callbacks, eventHandler)
            }
            return this
        },
        off: function(eventName, eventHandler) {
            var callbacks = this._events[eventName];
            if (callbacks) {
                if ($.isFunction(eventHandler)) {
                    callbacks.remove(eventHandler)
                } else {
                    callbacks.empty()
                }
            }
            return this
        },
        _disposeEvents: function() {
            $.each(this._events, function() {
                this.empty()
            })
        }
    }
});
