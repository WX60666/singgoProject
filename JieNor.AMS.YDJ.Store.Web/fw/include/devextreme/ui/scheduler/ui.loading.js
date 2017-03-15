/** 
 * DevExtreme (ui/scheduler/ui.loading.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery"),
        viewPortUtils = require("../../core/utils/view_port"),
        LoadPanel = require("../load_panel");
    var loading = null;
    var createLoadPanel = function(options) {
        return new LoadPanel($("<div>").appendTo(options && options.container || viewPortUtils.value()), options)
    };
    var removeLoadPanel = function() {
        if (!loading) {
            return
        }
        loading.element().remove();
        loading = null
    };
    exports.show = function(options) {
        removeLoadPanel();
        loading = createLoadPanel(options);
        return loading.show()
    };
    exports.hide = function() {
        if (!loading) {
            return $.when()
        }
        return loading.hide().done(removeLoadPanel).promise()
    }
});
