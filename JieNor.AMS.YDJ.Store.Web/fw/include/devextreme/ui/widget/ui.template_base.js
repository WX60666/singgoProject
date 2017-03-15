/** 
 * DevExtreme (ui/widget/ui.template_base.js)
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
        triggerShownEvent = require("../../core/utils/dom").triggerShownEvent,
        Class = require("../../core/class"),
        abstract = Class.abstract;
    var renderedCallbacks = $.Callbacks();
    var TemplateBase = Class.inherit({
        ctor: function(element, owner) {
            this._element = $(element);
            this._owner = owner
        },
        owner: function() {
            return this._owner
        },
        render: function(options) {
            options = options || {};
            var data = options.model;
            if (options.container) {
                data = this._prepareDataForContainer(data, options.container)
            }
            var $result = this._renderCore($.extend({}, options, {
                model: data
            }));
            this._ensureResultInContainer($result, options.container);
            renderedCallbacks.fire($result, options.container);
            return $result
        },
        _ensureResultInContainer: function($result, $container) {
            if (!$container) {
                return
            }
            var resultInContainer = $.contains($container.get(0), $result.get(0));
            $container.append($result);
            if (resultInContainer) {
                return
            }
            var resultInBody = $.contains(document.body, $container.get(0));
            if (!resultInBody) {
                return
            }
            triggerShownEvent($result)
        },
        source: function() {
            return this._element.clone()
        },
        _prepareDataForContainer: function(data) {
            return data
        },
        _renderCore: abstract,
        dispose: function() {
            this._owner = null
        }
    });
    module.exports = TemplateBase;
    module.exports.renderedCallbacks = renderedCallbacks
});
