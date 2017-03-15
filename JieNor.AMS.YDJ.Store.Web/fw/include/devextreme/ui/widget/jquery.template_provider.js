/** 
 * DevExtreme (ui/widget/jquery.template_provider.js)
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
        TemplateProviderBase = require("./ui.template_provider_base"),
        Template = require("./jquery.template"),
        FunctionTemplate = require("./ui.template.function"),
        defaultTemplates = require("./jquery.default_templates");
    var TemplateProvider = TemplateProviderBase.inherit({
        createTemplate: function(element, owner) {
            return new Template(element, owner)
        },
        _templatesForWidget: function(widgetName) {
            var templateGenerators = defaultTemplates[widgetName] || {},
                templates = {};
            $.each(templateGenerators, function(name, generator) {
                templates[name] = new FunctionTemplate(function() {
                    var $markup = generator.apply(this, arguments);
                    if ("itemFrame" !== name) {
                        $markup = $markup.contents()
                    }
                    return $markup
                }, templateProvider)
            });
            return templates
        }
    });
    var templateProvider = new TemplateProvider;
    module.exports = templateProvider
});
