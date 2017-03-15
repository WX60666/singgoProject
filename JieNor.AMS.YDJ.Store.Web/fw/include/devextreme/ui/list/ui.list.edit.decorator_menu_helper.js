/** 
 * DevExtreme (ui/list/ui.list.edit.decorator_menu_helper.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var EditDecoratorMenuHelperMixin = {
        _menuEnabled: function() {
            return !!this._menuItems().length
        },
        _menuItems: function() {
            return this._list.option("menuItems")
        },
        _deleteEnabled: function() {
            return this._list.option("allowItemDeleting")
        },
        _fireMenuAction: function($itemElement, action) {
            this._list._itemEventHandlerByHandler($itemElement, action, {}, {
                excludeValidators: ["disabled", "readOnly"]
            })
        }
    };
    module.exports = EditDecoratorMenuHelperMixin
});
