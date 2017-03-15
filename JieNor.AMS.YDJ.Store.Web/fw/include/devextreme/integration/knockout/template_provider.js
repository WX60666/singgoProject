/** 
 * DevExtreme (integration/knockout/template_provider.js)
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
        ko = require("knockout"),
        domUtils = require("../../core/utils/dom"),
        templateProvider = require("../../ui/widget/jquery.template_provider"),
        KoTemplate = require("./template"),
        defaultTemplates = require("./default_templates");
    var KoTemplateProvider = templateProvider.constructor.inherit({
        createTemplate: function(element, owner) {
            return new KoTemplate(element, owner)
        },
        applyTemplate: function(element, model) {
            ko.applyBindings(model, element)
        },
        _templatesForWidget: function(widgetName) {
            var templateGenerators = defaultTemplates[widgetName];
            if (!templateGenerators) {
                return this.callBase(widgetName)
            }
            var templates = {};
            $.each(templateGenerators, function(name, generator) {
                var $markup = domUtils.createMarkupFromString(generator());
                if ("itemFrame" !== name) {
                    $markup = $markup.contents()
                }
                templates[name] = new KoTemplate($markup, koTemplateProvider)
            });
            return templates
        }
    });
    var koTemplateProvider = new KoTemplateProvider;
    module.exports = koTemplateProvider
});
