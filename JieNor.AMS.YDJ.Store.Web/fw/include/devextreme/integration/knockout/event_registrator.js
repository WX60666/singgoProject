/** 
 * DevExtreme (integration/knockout/event_registrator.js)
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
        eventRegistrator = require("../../events/core/event_registrator"),
        eventUtils = require("../../events/utils");
    eventRegistrator.callbacks.add(function(name, eventObject) {
        var koBindingEventName = eventUtils.addNamespace(name, name + "Binding");
        ko.bindingHandlers[name] = {
            update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var $element = $(element),
                    unwrappedValue = ko.utils.unwrapObservable(valueAccessor()),
                    eventSource = unwrappedValue.execute ? unwrappedValue.execute : unwrappedValue;
                $element.off(koBindingEventName).on(koBindingEventName, $.isPlainObject(unwrappedValue) ? unwrappedValue : {}, function(e) {
                    eventSource.call(viewModel, viewModel, e)
                })
            }
        }
    })
});
