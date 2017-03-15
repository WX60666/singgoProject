/** 
 * DevExtreme (integration/knockout/clean_node_old.js)
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
        compareVersion = require("../../core/utils/version").compare;
    if (compareVersion($.fn.jquery, [2, 0]) < 0) {
        var cleanKoData = function(element, andSelf) {
            var cleanNode = function() {
                ko.cleanNode(this)
            };
            if (andSelf) {
                element.each(cleanNode)
            } else {
                element.find("*").each(cleanNode)
            }
        };
        var originalEmpty = $.fn.empty;
        $.fn.empty = function() {
            cleanKoData(this, false);
            return originalEmpty.apply(this, arguments)
        };
        var originalRemove = $.fn.remove;
        $.fn.remove = function(selector, keepData) {
            if (!keepData) {
                var subject = this;
                if (selector) {
                    subject = subject.filter(selector)
                }
                cleanKoData(subject, true)
            }
            return originalRemove.call(this, selector, keepData)
        };
        var originalHtml = $.fn.html;
        $.fn.html = function(value) {
            if ("string" === typeof value) {
                cleanKoData(this, false)
            }
            return originalHtml.apply(this, arguments)
        };
        var originalReplaceWith = $.fn.replaceWith;
        $.fn.replaceWith = function(value) {
            var result = originalReplaceWith.apply(this, arguments);
            if (!this.parent().length) {
                cleanKoData(this, true)
            }
            return result
        }
    }
});
