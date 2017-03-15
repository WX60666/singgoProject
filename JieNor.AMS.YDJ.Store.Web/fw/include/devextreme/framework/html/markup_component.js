/** 
 * DevExtreme (framework/html/markup_component.js)
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
        Class = require("../../core/class"),
        publicComponentUtils = require("../../core/utils/public_component");
    var MarkupComponent = Class.inherit({
        ctor: function(element, options) {
            this.NAME = this.constructor.publicName();
            options = options || {};
            this._$element = $(element);
            publicComponentUtils.attachInstanceToElement(this._$element, this.NAME, this, this._dispose);
            if (options.fromCache) {
                this._options = options
            } else {
                this._options = {};
                this._setDefaultOptions();
                if (options) {
                    this.option(options)
                }
                this._render()
            }
        },
        _setDefaultOptions: $.noop,
        _render: $.noop,
        _dispose: $.noop,
        element: function() {
            return this._$element
        },
        option: function(name, value) {
            if (0 === arguments.length) {
                return this._options
            } else {
                if (1 === arguments.length) {
                    if ("string" === typeof name) {
                        return this._options[name]
                    } else {
                        value = name;
                        $.extend(this._options, value)
                    }
                } else {
                    this._options[name] = value
                }
            }
        },
        instance: function() {
            return this
        }
    });
    MarkupComponent.publicName = publicComponentUtils.getName;
    MarkupComponent.getInstance = function($element) {
        return publicComponentUtils.getInstanceByElement($element, this.publicName())
    };
    exports.MarkupComponent = MarkupComponent
});
