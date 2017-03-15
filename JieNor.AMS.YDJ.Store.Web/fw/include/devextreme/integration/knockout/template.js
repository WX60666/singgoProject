/** 
 * DevExtreme (integration/knockout/template.js)
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
        TemplateBase = require("../../ui/widget/ui.template_base"),
        domUtils = require("../../core/utils/dom");
    var KoTemplate = TemplateBase.inherit({
        ctor: function(element, owner) {
            this.callBase(element, owner);
            this._template = $("<div>").append(domUtils.normalizeTemplateElement(element));
            this._registerKoTemplate()
        },
        _registerKoTemplate: function() {
            var template = this._template.get(0);
            new ko.templateSources.anonymousTemplate(template).nodes(template)
        },
        _prepareDataForContainer: function(data, container) {
            var containerElement, containerContext, result = data;
            if (container.length) {
                containerElement = container.get(0);
                data = void 0 !== data ? data : ko.dataFor(containerElement) || {};
                containerContext = ko.contextFor(containerElement);
                if (containerContext) {
                    result = data === containerContext.$data ? containerContext : containerContext.createChildContext(data)
                } else {
                    result = data
                }
            }
            return result
        },
        _renderCore: function(options) {
            var $placeholder = $("<div>").appendTo(options.container);
            var $result;
            ko.renderTemplate(this._template.get(0), options.model, {
                afterRender: function(nodes) {
                    $result = $(nodes)
                }
            }, $placeholder.get(0), "replaceNode");
            return $result
        },
        dispose: function() {
            this.callBase();
            this._template.remove()
        }
    });
    module.exports = KoTemplate
});
