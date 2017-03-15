/** 
 * DevExtreme (ui/widget/ui.template_provider_base.js)
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
        Class = require("../../core/class");
    var abstract = Class.abstract;
    var TemplateProviderBase = Class.inherit({
        ctor: function() {
            this.widgetTemplatesCache = {}
        },
        createTemplate: abstract,
        getTemplates: function(widget) {
            return this._getWidgetTemplates(widget.constructor)
        },
        _getWidgetTemplates: function(widgetConstructor) {
            if (!widgetConstructor.publicName) {
                return {}
            }
            return this._getCachedWidgetTemplates(widgetConstructor)
        },
        _getCachedWidgetTemplates: function(widgetConstructor) {
            var widgetName = widgetConstructor.publicName(),
                templatesCache = this.widgetTemplatesCache;
            if (!templatesCache[widgetName]) {
                templatesCache[widgetName] = $.extend({}, this._getWidgetTemplates(widgetConstructor.parent), this._templatesForWidget(widgetName))
            }
            return templatesCache[widgetName]
        },
        _templatesForWidget: abstract
    });
    module.exports = TemplateProviderBase
});
