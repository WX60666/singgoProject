/** 
 * DevExtreme (ui/notify.js)
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
        Action = require("../core/action"),
        viewPortUtils = require("../core/utils/view_port"),
        Toast = require("./toast");
    var $notify = null;
    var notify = function(message, type, displayTime) {
        var options = $.isPlainObject(message) ? message : {
            message: message
        };
        var userHiddenAction = options.onHidden;
        $.extend(options, {
            type: type,
            displayTime: displayTime,
            onHidden: function(args) {
                args.element.remove();
                new Action(userHiddenAction, {
                    context: args.model
                }).execute(arguments)
            }
        });
        $notify = $("<div>").appendTo(viewPortUtils.value());
        new Toast($notify, options).show()
    };
    module.exports = notify
});
