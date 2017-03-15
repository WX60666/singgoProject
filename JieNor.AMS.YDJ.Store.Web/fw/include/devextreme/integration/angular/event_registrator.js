/** 
 * DevExtreme (integration/angular/event_registrator.js)
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
        eventRegistrator = require("../../events/core/event_registrator"),
        ngModule = require("./module");
    eventRegistrator.callbacks.add(function(name, eventObject) {
        var ngEventName = name.slice(0, 2) + name.charAt(2).toUpperCase() + name.slice(3);
        ngModule.directive(ngEventName, ["$parse", function($parse) {
            return function(scope, element, attr) {
                var handler, attrValue = $.trim(attr[ngEventName]),
                    eventOptions = {};
                if ("{" === attrValue.charAt(0)) {
                    eventOptions = scope.$eval(attrValue);
                    handler = $parse(eventOptions.execute)
                } else {
                    handler = $parse(attr[ngEventName])
                }
                element.on(name, eventOptions, function(e) {
                    scope.$apply(function() {
                        handler(scope, {
                            $event: e
                        })
                    })
                })
            }
        }])
    })
});
