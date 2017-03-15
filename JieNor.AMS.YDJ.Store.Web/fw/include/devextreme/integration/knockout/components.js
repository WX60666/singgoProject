/** 
 * DevExtreme (integration/knockout/components.js)
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
        Action = require("../../core/action"),
        compileGetter = require("../../core/utils/data").compileGetter,
        ko = require("knockout"),
        iconUtils = require("../../core/utils/icon"),
        inflector = require("../../core/utils/inflector"),
        clickEvent = require("../../events/click"),
        dateUtils = require("../../core/utils/date"),
        dateLocalization = require("../../localization/date");
    ko.bindingHandlers.dxAction = {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var $element = $(element);
            var unwrappedValue = ko.utils.unwrapObservable(valueAccessor()),
                actionSource = unwrappedValue,
                actionOptions = {
                    context: element
                };
            if (unwrappedValue.execute) {
                actionSource = unwrappedValue.execute;
                $.extend(actionOptions, unwrappedValue)
            }
            var action = new Action(actionSource, actionOptions);
            $element.off(".dxActionBinding").on(clickEvent.name + ".dxActionBinding", function(e) {
                action.execute({
                    element: $element,
                    model: viewModel,
                    evaluate: function(expression) {
                        var context = viewModel;
                        if (expression.length > 0 && "$" === expression[0]) {
                            context = ko.contextFor(element)
                        }
                        var getter = compileGetter(expression);
                        return getter(context)
                    },
                    jQueryEvent: e
                });
                if (!actionOptions.bubbling) {
                    e.stopPropagation()
                }
            })
        }
    };
    ko.bindingHandlers.dxControlsDescendantBindings = {
        init: function(_, valueAccessor) {
            return {
                controlsDescendantBindings: ko.unwrap(valueAccessor())
            }
        }
    };
    ko.bindingHandlers.dxPolymorphWidget = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var widgetName = ko.utils.unwrapObservable(valueAccessor()).name;
            if (!widgetName) {
                return
            }
            ko.virtualElements.emptyNode(element);
            if ("button" === widgetName || "tabs" === widgetName || "dropDownMenu" === widgetName) {
                var depricatedName = widgetName;
                widgetName = inflector.camelize("dx-" + widgetName);
                errors.log("W0001", "dxToolbar - 'widget' item field", depricatedName, "16.1", "Use: '" + widgetName + "' instead")
            }
            var markup = $('<div data-bind="' + widgetName + ': options">').get(0);
            ko.virtualElements.prepend(element, markup);
            var innerBindingContext = bindingContext.extend(valueAccessor);
            ko.applyBindingsToDescendants(innerBindingContext, element);
            return {
                controlsDescendantBindings: true
            }
        }
    };
    ko.virtualElements.allowedBindings.dxPolymorphWidget = true;
    ko.bindingHandlers.dxIcon = {
        init: function(element, valueAccessor) {
            var options = ko.utils.unwrapObservable(valueAccessor()) || {},
                iconElement = iconUtils.getImageContainer(options);
            ko.virtualElements.emptyNode(element);
            if (iconElement) {
                ko.virtualElements.prepend(element, iconElement.get(0))
            }
        },
        update: function(element, valueAccessor) {
            var options = ko.utils.unwrapObservable(valueAccessor()) || {},
                iconElement = iconUtils.getImageContainer(options);
            ko.virtualElements.emptyNode(element);
            if (iconElement) {
                ko.virtualElements.prepend(element, iconElement.get(0))
            }
        }
    };
    ko.virtualElements.allowedBindings.dxIcon = true;
    ko.bindingHandlers.dxShorttimeDate = {
        update: function(element, valueAccessor, allBindingsAccessor) {
            return ko.bindingHandlers.text.update(element, function() {
                var value = ko.utils.unwrapObservable(valueAccessor());
                return dateUtils.serializeDate(dateUtils.makeDate(value), "shorttime", $.proxy(dateLocalization.format, dateLocalization))
            }, allBindingsAccessor, null, null)
        }
    }
});
