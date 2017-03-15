/** 
 * DevExtreme (integration/knockout/variable_wrapper_utils.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var ko = require("knockout"),
        variableWrapper = require("../../core/utils/variable_wrapper");
    variableWrapper.inject({
        isWrapped: ko.isObservable,
        isWritableWrapped: ko.isWritableObservable,
        wrap: ko.observable,
        unwrap: function(value) {
            if (ko.isObservable(value)) {
                return ko.utils.unwrapObservable(value)
            }
            return this.callBase(value)
        },
        assign: function(variable, value) {
            if (ko.isObservable(variable)) {
                variable(value)
            } else {
                this.callBase(variable, value)
            }
        }
    })
});
