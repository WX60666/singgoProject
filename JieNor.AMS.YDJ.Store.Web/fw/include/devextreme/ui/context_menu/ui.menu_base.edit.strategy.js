/** 
 * DevExtreme (ui/context_menu/ui.menu_base.edit.strategy.js)
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
        errors = require("../widget/ui.errors"),
        PlainEditStrategy = require("../collection/ui.collection_widget.edit.strategy.plain");
    var MenuBaseEditStrategy = PlainEditStrategy.inherit({
        _getPlainItems: function() {
            return $.map(this._collectionWidget.option("items"), function getMenuItems(item) {
                return item.items ? [item].concat($.map(item.items, getMenuItems)) : item
            })
        },
        _stringifyItem: function(item) {
            var that = this;
            return JSON.stringify(item, function(key, value) {
                if ("template" === key) {
                    return that._getTemplateString(value)
                }
                return value
            })
        },
        _getTemplateString: function(template) {
            var result;
            if ("object" === typeof template) {
                result = $(template).text()
            } else {
                result = template.toString()
            }
            return result
        },
        selectedItemIndices: function() {
            var selectedIndices = [],
                dataAdapter = this._collectionWidget._dataAdapter,
                items = dataAdapter.getData(),
                selectedItem = dataAdapter.getNodeByKey(dataAdapter.getSelectedNodesKeys()[0]);
            if (selectedItem) {
                var index = $.inArray(selectedItem, items);
                if (index !== -1) {
                    selectedIndices.push(index)
                } else {
                    errors.log("W1002", selectedItem)
                }
            }
            return selectedIndices
        },
        fetchSelectedItems: function(indices) {
            indices = indices || this._collectionWidget._selectedItemIndices;
            var items = this._getPlainItems(),
                selectedItems = [];
            $.each(indices, function(_, index) {
                selectedItems.push(items[index])
            });
            return selectedItems
        }
    });
    module.exports = MenuBaseEditStrategy
});
