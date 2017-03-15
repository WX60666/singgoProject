/** 
 * DevExtreme (ui/widget/jquery.template.js)
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
        errors = require("../../core/errors"),
        commonUtils = require("../../core/utils/common"),
        TemplateBase = require("./ui.template_base"),
        domUtils = require("../../core/utils/dom");
    var templateEngines = {};
    var registerTemplateEngine = function(name, templateEngine) {
        templateEngines[name] = templateEngine
    };
    var outerHtml = function(element) {
        element = $(element);
        var templateTag = element.length && element[0].nodeName.toLowerCase();
        if ("script" === templateTag) {
            return element.html()
        } else {
            element = $("<div>").append(element);
            return element.html()
        }
    };
    registerTemplateEngine("default", {
        compile: function(element) {
            return domUtils.normalizeTemplateElement(element)
        },
        render: function(template, data) {
            return template.clone()
        }
    });
    registerTemplateEngine("jquery-tmpl", {
        compile: function(element) {
            return outerHtml(element)
        },
        render: function(template, data) {
            return $.tmpl(template, data)
        }
    });
    registerTemplateEngine("jsrender", {
        compile: function(element) {
            return $.templates(outerHtml(element))
        },
        render: function(template, data) {
            return template.render(data)
        }
    });
    registerTemplateEngine("mustache", {
        compile: function(element) {
            return Mustache.compile(outerHtml(element))
        },
        render: function(template, data) {
            return template(data)
        }
    });
    registerTemplateEngine("hogan", {
        compile: function(element) {
            return Hogan.compile(outerHtml(element))
        },
        render: function(template, data) {
            return template.render(data)
        }
    });
    registerTemplateEngine("underscore", {
        compile: function(element) {
            return _.template(outerHtml(element))
        },
        render: function(template, data) {
            return template(data)
        }
    });
    registerTemplateEngine("handlebars", {
        compile: function(element) {
            return Handlebars.compile(outerHtml(element))
        },
        render: function(template, data) {
            return template(data)
        }
    });
    registerTemplateEngine("doT", {
        compile: function(element) {
            return doT.template(outerHtml(element))
        },
        render: function(template, data) {
            return template(data)
        }
    });
    var currentTemplateEngine;
    var setTemplateEngine = function(templateEngine) {
        if (commonUtils.isString(templateEngine)) {
            currentTemplateEngine = templateEngines[templateEngine];
            if (!currentTemplateEngine) {
                throw errors.Error("E0020", templateEngine)
            }
        } else {
            currentTemplateEngine = templateEngine
        }
    };
    setTemplateEngine("default");
    var Template = TemplateBase.inherit({
        ctor: function(element, owner) {
            this.callBase(element, owner);
            this._compiledTemplate = currentTemplateEngine.compile(element)
        },
        _renderCore: function(options) {
            return $("<div>").append(currentTemplateEngine.render(this._compiledTemplate, options.model)).contents()
        }
    });
    module.exports = Template;
    module.exports.setTemplateEngine = setTemplateEngine
});
