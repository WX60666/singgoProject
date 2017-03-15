/** 
 * DevExtreme (framework/html/command_container.js)
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
        MarkupComponent = require("./markup_component").MarkupComponent,
        registerComponent = require("../../core/component_registrator");
    require("../../integration/knockout");
    var CommandContainer = MarkupComponent.inherit({
        ctor: function(element, options) {
            if ($.isPlainObject(element)) {
                options = element;
                element = $("<div />")
            }
            this.callBase(element, options)
        },
        _setDefaultOptions: function() {
            this.callBase();
            this.option({
                id: null
            })
        },
        _render: function() {
            this.callBase();
            this.element().addClass("dx-command-container")
        }
    });
    registerComponent("dxCommandContainer", CommandContainer);
    module.exports = CommandContainer
});
