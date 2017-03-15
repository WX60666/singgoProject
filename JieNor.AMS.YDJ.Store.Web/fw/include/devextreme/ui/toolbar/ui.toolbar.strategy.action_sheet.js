/** 
 * DevExtreme (ui/toolbar/ui.toolbar.strategy.action_sheet.js)
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
        ToolbarStrategy = require("./ui.toolbar.strategy"),
        ActionSheet = require("../action_sheet");
    var ActionSheetStrategy = ToolbarStrategy.inherit({
        NAME: "actionSheet",
        _getMenuItemTemplate: function() {
            return this._toolbar._getTemplate("actionSheetItem")
        },
        render: function() {
            if (!this._hasVisibleMenuItems()) {
                return
            }
            this.callBase()
        },
        _menuWidgetClass: function() {
            return ActionSheet
        },
        _menuContainer: function() {
            return this._toolbar.element()
        },
        _widgetOptions: function() {
            return $.extend({}, this.callBase(), {
                target: this._$button,
                showTitle: false
            })
        },
        _menuButtonOptions: function() {
            return $.extend({}, this.callBase(), {
                icon: "overflow"
            })
        },
        _toggleMenu: function(visible, animate) {
            this.callBase.apply(this, arguments);
            this._menu.toggle(this._menuShown);
            this._menuShown = false
        }
    });
    module.exports = ActionSheetStrategy
});
