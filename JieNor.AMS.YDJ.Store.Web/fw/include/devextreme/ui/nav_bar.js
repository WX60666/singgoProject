/** 
 * DevExtreme (ui/nav_bar.js)
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
        registerComponent = require("../core/component_registrator"),
        Tabs = require("./tabs");
    var NAVBAR_CLASS = "dx-navbar",
        ITEM_CLASS = "dx-item-content",
        NAVBAR_ITEM_CLASS = "dx-nav-item",
        NAVBAR_ITEM_CONTENT_CLASS = "dx-nav-item-content";
    var NavBar = Tabs.inherit({
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                scrollingEnabled: false
            })
        },
        _render: function() {
            this.callBase();
            this.element().addClass(NAVBAR_CLASS)
        },
        _postprocessRenderItem: function(args) {
            this.callBase(args);
            var $itemElement = args.itemElement,
                itemData = args.itemData;
            $itemElement.addClass(NAVBAR_ITEM_CLASS);
            $itemElement.find("." + ITEM_CLASS).addClass(NAVBAR_ITEM_CONTENT_CLASS);
            if (!itemData.icon && !itemData.iconSrc) {
                $itemElement.addClass("dx-navbar-text-item")
            }
        }
    });
    registerComponent("dxNavBar", NavBar);
    module.exports = NavBar
});
