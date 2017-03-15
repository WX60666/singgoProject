/** 
 * DevExtreme (integration/angular/template.js)
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
        TemplateBase = require("../../ui/widget/ui.template_base"),
        domUtils = require("../../core/utils/dom");
    var NgTemplate = TemplateBase.inherit({
        ctor: function(element, owner) {
            this.callBase(element, owner);
            this.setCompiler(this._getParentTemplateCompiler())
        },
        _getParentTemplateCompiler: function() {
            var templateCompiler = null,
                owner = this.owner();
            while (!templateCompiler && owner) {
                templateCompiler = $.isFunction(owner.option) ? owner.option("templateCompiler") : null;
                owner = $.isFunction(owner.owner) ? owner.owner() : null
            }
            return templateCompiler
        },
        _renderCore: function(options) {
            var compiledTemplate = this._compiledTemplate,
                result = $.isFunction(compiledTemplate) ? compiledTemplate(options) : compiledTemplate;
            return result
        },
        setCompiler: function(templateCompiler) {
            if (!templateCompiler) {
                return
            }
            this._compiledTemplate = templateCompiler(domUtils.normalizeTemplateElement(this._element))
        }
    });
    module.exports = NgTemplate
});
