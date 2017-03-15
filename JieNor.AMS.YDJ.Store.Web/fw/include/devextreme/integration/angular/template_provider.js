/** 
 * DevExtreme (integration/angular/template_provider.js)
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
        domUtils = require("../../core/utils/dom"),
        templateProvider = require("../../ui/widget/jquery.template_provider"),
        NgTemplate = require("./template"),
        defaultTemplates = require("./default_templates");
    var NgTemplateProvider = templateProvider.constructor.inherit({
        createTemplate: function(element, owner) {
            return new NgTemplate(element, owner)
        },
        getTemplates: function(widget) {
            var templateCompiler = widget.option("templateCompiler"),
                templates = this.callBase.apply(this, arguments);
            $.each(templates, function(_, template) {
                template.setCompiler && template.setCompiler(templateCompiler)
            });
            return templates
        },
        _templatesForWidget: function(widgetName) {
            var templateGenerators = defaultTemplates[widgetName];
            if (!templateGenerators) {
                return this.callBase(widgetName)
            }
            var templates = {};
            $.each(templateGenerators, function(name, generator) {
                var $markup = domUtils.createMarkupFromString(generator());
                templates[name] = new NgTemplate($markup.wrap(), ngTemplateProvider)
            });
            return templates
        }
    });
    var ngTemplateProvider = new NgTemplateProvider;
    module.exports = ngTemplateProvider
});
