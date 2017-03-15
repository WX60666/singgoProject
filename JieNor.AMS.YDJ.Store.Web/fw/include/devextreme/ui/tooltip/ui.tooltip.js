/** 
 * DevExtreme (ui/tooltip/ui.tooltip.js)
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
        Tooltip = require("./tooltip"),
        viewPortUtils = require("../../core/utils/view_port");
    var tooltip = null;
    var removeTooltipElement = null;
    var createTooltip = function(options) {
        options = $.extend({
            position: "top"
        }, options);
        var content = options.content;
        delete options.content;
        var $tooltip = $("<div />").html(content).appendTo(viewPortUtils.value());
        removeTooltipElement = function() {
            $tooltip.remove()
        };
        tooltip = new Tooltip($tooltip, options)
    };
    var removeTooltip = function() {
        if (!tooltip) {
            return
        }
        removeTooltipElement();
        tooltip = null
    };
    exports.show = function(options) {
        removeTooltip();
        createTooltip(options);
        return tooltip.show()
    };
    exports.hide = function() {
        if (!tooltip) {
            return $.when()
        }
        return tooltip.hide().done(removeTooltip).promise()
    }
});
