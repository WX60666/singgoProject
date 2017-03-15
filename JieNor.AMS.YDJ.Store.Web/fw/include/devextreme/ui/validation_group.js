/** 
 * DevExtreme (ui/validation_group.js)
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
        registerComponent = require("../core/component_registrator"),
        DOMComponent = require("../core/dom_component"),
        ValidationSummary = require("./validation_summary"),
        ValidationEngine = require("./validation_engine"),
        Validator = require("./validator");
    var VALIDATION_ENGINE_CLASS = "dx-validationgroup";
    var ValidationGroup = DOMComponent.inherit({
        _getDefaultOptions: function() {
            return this.callBase()
        },
        _init: function() {
            this.callBase()
        },
        _render: function() {
            var $element = this.element();
            $element.addClass(VALIDATION_ENGINE_CLASS);
            $element.find(".dx-validator").each(function(_, validatorContainer) {
                Validator.getInstance($(validatorContainer))._initGroupRegistration()
            });
            $element.find(".dx-validationsummary").each(function(_, summaryContainer) {
                ValidationSummary.getInstance($(summaryContainer))._initGroupRegistration()
            });
            this.callBase()
        },
        validate: function() {
            return ValidationEngine.validateGroup(this)
        },
        reset: function() {
            return ValidationEngine.resetGroup(this)
        },
        _optionChanged: function(args) {
            switch (args.name) {
                default: this.callBase(args)
            }
        },
        _dispose: function() {
            ValidationEngine.removeGroup(this);
            this.element().removeClass(VALIDATION_ENGINE_CLASS);
            this.callBase()
        }
    });
    registerComponent("dxValidationGroup", ValidationGroup);
    module.exports = ValidationGroup
});
