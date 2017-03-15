/** 
 * DevExtreme (core/dom_component.js)
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
        config = require("./config"),
        errors = require("./errors"),
        windowResizeCallbacks = require("./utils/window").resizeCallbacks,
        commonUtils = require("./utils/common"),
        publicComponentUtils = require("./utils/public_component"),
        Component = require("./component"),
        abstract = Component.abstract;
    var RTL_DIRECTION_CLASS = "dx-rtl",
        VISIBILITY_CHANGE_CLASS = "dx-visibility-change-handler",
        VISIBILITY_CHANGE_EVENTNAMESPACE = "VisibilityChange";
    var DOMComponent = Component.inherit({
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                width: void 0,
                height: void 0,
                rtlEnabled: config().rtlEnabled,
                disabled: false
            })
        },
        ctor: function(element, options) {
            this._$element = $(element);
            publicComponentUtils.attachInstanceToElement(this._$element, this.constructor.publicName(), this, this._dispose);
            this.callBase(options)
        },
        _visibilityChanged: abstract,
        _dimensionChanged: abstract,
        _init: function() {
            this.callBase();
            this._attachWindowResizeCallback()
        },
        _attachWindowResizeCallback: function() {
            if (this._isDimensionChangeSupported()) {
                var windowResizeCallBack = this._windowResizeCallBack = $.proxy(this._dimensionChanged, this);
                windowResizeCallbacks.add(windowResizeCallBack)
            }
        },
        _isDimensionChangeSupported: function() {
            return this._dimensionChanged !== abstract
        },
        _render: function() {
            this._toggleRTLDirection(this.option("rtlEnabled"));
            this._renderVisibilityChange();
            this._renderDimensions()
        },
        _renderVisibilityChange: function() {
            if (this._isDimensionChangeSupported()) {
                this._attachDimensionChangeHandlers()
            }
            if (!this._isVisibilityChangeSupported()) {
                return
            }
            this.element().addClass(VISIBILITY_CHANGE_CLASS);
            this._attachVisibilityChangeHandlers()
        },
        _renderDimensions: function() {
            var width = this.option("width"),
                height = this.option("height"),
                $element = this.element();
            $element.outerWidth(width);
            $element.outerHeight(height)
        },
        _attachDimensionChangeHandlers: function() {
            var that = this;
            var resizeEventName = "dxresize." + this.NAME + VISIBILITY_CHANGE_EVENTNAMESPACE;
            that.element().off(resizeEventName).on(resizeEventName, function() {
                that._dimensionChanged()
            })
        },
        _attachVisibilityChangeHandlers: function() {
            var that = this;
            var hidingEventName = "dxhiding." + this.NAME + VISIBILITY_CHANGE_EVENTNAMESPACE;
            var shownEventName = "dxshown." + this.NAME + VISIBILITY_CHANGE_EVENTNAMESPACE;
            that._isHidden = !that._isVisible();
            that.element().off(hidingEventName).on(hidingEventName, function() {
                that._checkVisibilityChanged("hiding")
            }).off(shownEventName).on(shownEventName, function() {
                that._checkVisibilityChanged("shown")
            })
        },
        _isVisible: function() {
            return this.element().is(":visible")
        },
        _checkVisibilityChanged: function(event) {
            if ("hiding" === event && this._isVisible() && !this._isHidden) {
                this._visibilityChanged(false);
                this._isHidden = true
            } else {
                if ("shown" === event && this._isVisible() && this._isHidden) {
                    this._isHidden = false;
                    this._visibilityChanged(true)
                }
            }
        },
        _isVisibilityChangeSupported: function() {
            return this._visibilityChanged !== abstract
        },
        _clean: $.noop,
        _modelByElement: function() {
            var modelByElement = this.option("modelByElement") || $.noop;
            return modelByElement(this.element())
        },
        _invalidate: function() {
            if (!this._updateLockCount) {
                throw errors.Error("E0007")
            }
            this._requireRefresh = true
        },
        _refresh: function() {
            this._clean();
            this._render()
        },
        _dispose: function() {
            this.callBase();
            this._clean();
            this._detachWindowResizeCallback()
        },
        _detachWindowResizeCallback: function() {
            if (this._isDimensionChangeSupported()) {
                windowResizeCallbacks.remove(this._windowResizeCallBack)
            }
        },
        _toggleRTLDirection: function(rtl) {
            this.element().toggleClass(RTL_DIRECTION_CLASS, rtl)
        },
        _createComponent: function(element, component, config) {
            var that = this;
            config = config || {};
            var synchronizableOptions = $.grep(["rtlEnabled", "disabled"], function(value) {
                return !(value in config)
            });
            var nestedComponentOptions = that.option("nestedComponentOptions") || $.noop;
            that._extendConfig(config, $.extend({
                templatesRenderAsynchronously: this.option("templatesRenderAsynchronously"),
                rtlEnabled: this.option("rtlEnabled"),
                disabled: this.option("disabled")
            }, nestedComponentOptions(this)));
            var instance;
            if (commonUtils.isString(component)) {
                var $element = $(element)[component](config);
                instance = $element[component]("instance")
            } else {
                if (element) {
                    instance = component.getInstance(element);
                    if (instance) {
                        instance.option(config)
                    } else {
                        instance = new component(element, config)
                    }
                }
            }
            if (instance) {
                var optionChangedHandler = function(args) {
                    if ($.inArray(args.name, synchronizableOptions) >= 0) {
                        instance.option(args.name, args.value)
                    }
                };
                that.on("optionChanged", optionChangedHandler);
                instance.on("disposing", function() {
                    that.off("optionChanged", optionChangedHandler)
                })
            }
            return instance
        },
        _extendConfig: function(config, extendConfig) {
            $.each(extendConfig, function(key, value) {
                config[key] = config.hasOwnProperty(key) ? config[key] : value
            })
        },
        _defaultActionConfig: function() {
            return $.extend(this.callBase(), {
                context: this._modelByElement(this.element())
            })
        },
        _defaultActionArgs: function() {
            var element = this.element(),
                model = this._modelByElement(this.element());
            return $.extend(this.callBase(), {
                element: element,
                model: model
            })
        },
        _optionChanged: function(args) {
            switch (args.name) {
                case "width":
                case "height":
                    this._renderDimensions();
                    break;
                case "rtlEnabled":
                    this._invalidate();
                    break;
                case "disabled":
                    break;
                default:
                    this.callBase(args)
            }
        },
        endUpdate: function() {
            var requireRender = !this._initializing && !this._initialized;
            this.callBase.apply(this, arguments);
            if (!this._updateLockCount) {
                if (requireRender) {
                    this._render()
                } else {
                    if (this._requireRefresh) {
                        this._requireRefresh = false;
                        this._refresh()
                    }
                }
            }
        },
        element: function() {
            return this._$element
        }
    });
    DOMComponent.getInstance = function($element) {
        return publicComponentUtils.getInstanceByElement($element, this.publicName())
    };
    DOMComponent.defaultOptions = function(rule) {
        this.prototype._customRules = this.prototype._customRules || [];
        this.prototype._customRules.push(rule)
    };
    module.exports = DOMComponent
});
