/** 
 * DevExtreme (core/utils/storage.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var getSessionStorage = function() {
        var sessionStorage;
        try {
            sessionStorage = window.sessionStorage
        } catch (e) {}
        return sessionStorage
    };
    exports.sessionStorage = getSessionStorage
});
