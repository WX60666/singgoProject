/** 
 * DevExtreme (integration/angular/action_executors.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var Action = require("../../core/action");
    Action.registerExecutor({
        ngExpression: {
            execute: function(e) {
                if ("string" === typeof e.action) {
                    e.context.$eval(e.action)
                }
            }
        }
    })
});
