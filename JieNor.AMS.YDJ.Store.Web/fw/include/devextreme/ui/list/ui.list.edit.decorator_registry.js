/** 
 * DevExtreme (ui/list/ui.list.edit.decorator_registry.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery");
    exports.registry = {};
    exports.register = function(option, type, decoratorClass) {
        var decoratorsRegistry = exports.registry;
        var decoratorConfig = {};
        decoratorConfig[option] = decoratorsRegistry[option] ? decoratorsRegistry[option] : {};
        decoratorConfig[option][type] = decoratorClass;
        decoratorsRegistry = $.extend(decoratorsRegistry, decoratorConfig)
    }
});
