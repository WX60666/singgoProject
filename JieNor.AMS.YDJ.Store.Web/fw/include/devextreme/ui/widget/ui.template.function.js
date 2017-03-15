/** 
 * DevExtreme (ui/widget/ui.template.function.js)
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
        TemplateBase = require("./ui.template_base"),
        domUtils = require("../../core/utils/dom");
    var FunctionTemplate = TemplateBase.inherit({
        ctor: function(render, owner) {
            this.callBase($(), owner);
            this._render = render
        },
        _renderCore: function(options) {
            return domUtils.normalizeTemplateElement(this._render(options.model, options.index, options.container))
        }
    });
    module.exports = FunctionTemplate
});
