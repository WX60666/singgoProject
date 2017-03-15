/** 
 * DevExtreme (core/utils/public_component.js)
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
        WeakMap = require("./weak_map"),
        commonUtils = require("./common"),
        removeEvent = require("../remove_event");
    var COMPONENT_NAMES_DATA_KEY = "dxComponents",
        ANONYMOUS_COMPONENT_DATA_KEY = "dxPrivateComponent";
    var componentNames = new WeakMap,
        nextAnonymousComponent = 0;
    exports.attachInstanceToElement = function($element, name, component, disposeFn) {
        var element = $element.get(0),
            data = $.data(element);
        disposeFn = disposeFn || $.noop;
        data[name] = component;
        $element.one(removeEvent, function() {
            disposeFn.call(component)
        });
        if (!data[COMPONENT_NAMES_DATA_KEY]) {
            data[COMPONENT_NAMES_DATA_KEY] = []
        }
        data[COMPONENT_NAMES_DATA_KEY].push(name)
    };
    exports.getInstanceByElement = function(element, name) {
        element = $(element).get(0);
        return $.data(element, name)
    };
    exports.getName = function(newName) {
        if (commonUtils.isDefined(newName)) {
            componentNames.set(this, newName);
            return
        }
        if (!componentNames.has(this)) {
            var generatedName = ANONYMOUS_COMPONENT_DATA_KEY + nextAnonymousComponent++;
            componentNames.set(this, generatedName);
            return generatedName
        }
        return componentNames.get(this)
    }
});
