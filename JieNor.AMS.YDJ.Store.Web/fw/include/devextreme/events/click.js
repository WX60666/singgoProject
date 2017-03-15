/** 
 * DevExtreme (events/click.js)
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
        devices = require("../core/devices"),
        domUtils = require("../core/utils/dom"),
        animationFrame = require("../animation/frame"),
        eventUtils = require("./utils"),
        pointerEvents = require("./pointer"),
        Emitter = require("./core/emitter"),
        registerEmitter = require("./core/emitter_registrator");
    var CLICK_EVENT_NAME = "dxclick",
        TOUCH_BOUNDARY = 10,
        abs = Math.abs;
    var isInput = function(element) {
        return $(element).is("input, textarea, select, button ,:focus, :focus *")
    };
    var misc = {
        requestAnimationFrame: animationFrame.requestAnimationFrame
    };
    var ClickEmitter = Emitter.inherit({
        ctor: function(element) {
            this.callBase(element);
            this._makeElementClickable($(element))
        },
        _makeElementClickable: function($element) {
            if (!$element.attr("onclick")) {
                $element.attr("onclick", "void(0)")
            }
        },
        start: function(e) {
            this._blurPrevented = e.isDefaultPrevented();
            this._startTarget = e.target;
            this._startEventData = eventUtils.eventData(e)
        },
        end: function(e) {
            if (this._eventOutOfElement(e, this.getElement().get(0)) || e.type === pointerEvents.cancel) {
                this._cancel(e);
                return
            }
            if (!isInput(e.target) && !this._blurPrevented) {
                domUtils.resetActiveElement()
            }
            this._accept(e);
            misc.requestAnimationFrame($.proxy(function() {
                this._fireClickEvent(e)
            }, this))
        },
        _eventOutOfElement: function(e, element) {
            var target = e.target,
                targetChanged = !$.contains(element, target) && element !== target,
                gestureDelta = eventUtils.eventDelta(eventUtils.eventData(e), this._startEventData),
                boundsExceeded = abs(gestureDelta.x) > TOUCH_BOUNDARY || abs(gestureDelta.y) > TOUCH_BOUNDARY;
            return targetChanged || boundsExceeded
        },
        _fireClickEvent: function(e) {
            this._fireEvent(CLICK_EVENT_NAME, e, {
                target: domUtils.closestCommonParent(this._startTarget, e.target)
            })
        }
    });
    ! function() {
        var NATIVE_CLICK_CLASS = "dx-native-click";
        var useNativeClick = devices.real().generic;
        var prevented = null;

        function isNativeClickEvent(e) {
            return useNativeClick || $(e.target).closest("." + NATIVE_CLICK_CLASS).length
        }
        ClickEmitter = ClickEmitter.inherit({
            configurate: function(data) {
                this.callBase(data);
                if (data.useNative) {
                    this.getElement().addClass(NATIVE_CLICK_CLASS)
                }
            },
            start: function(e) {
                prevented = null;
                if (!isNativeClickEvent(e)) {
                    this.callBase(e)
                }
            },
            end: function(e) {
                if (!isNativeClickEvent(e)) {
                    this.callBase(e)
                }
            },
            cancel: function() {
                prevented = true
            }
        });
        var clickHandler = function(e) {
            if ((!e.which || 1 === e.which) && !prevented && isNativeClickEvent(e)) {
                eventUtils.fireEvent({
                    type: CLICK_EVENT_NAME,
                    originalEvent: e
                })
            }
        };
        $(document).on(eventUtils.addNamespace("click", "NATIVE_DXCLICK_STRATEGY"), clickHandler)
    }();
    ! function() {
        var desktopDevice = devices.real().generic;
        if (!desktopDevice) {
            var startTarget = null,
                blurPrevented = false;
            var pointerDownHandler = function(e) {
                startTarget = e.target;
                blurPrevented = e.isDefaultPrevented()
            };
            var clickHandler = function(e) {
                var $target = $(e.target);
                if (!blurPrevented && startTarget && !$target.is(startTarget) && !$(startTarget).is("label") && isInput($target)) {
                    domUtils.resetActiveElement()
                }
                startTarget = null;
                blurPrevented = false
            };
            var NATIVE_CLICK_FIXER_NAMESPACE = "NATIVE_CLICK_FIXER";
            $(document).on(eventUtils.addNamespace(pointerEvents.down, NATIVE_CLICK_FIXER_NAMESPACE), pointerDownHandler).on(eventUtils.addNamespace("click", NATIVE_CLICK_FIXER_NAMESPACE), clickHandler)
        }
    }();
    registerEmitter({
        emitter: ClickEmitter,
        bubble: true,
        events: [CLICK_EVENT_NAME]
    });
    exports.name = CLICK_EVENT_NAME
});
