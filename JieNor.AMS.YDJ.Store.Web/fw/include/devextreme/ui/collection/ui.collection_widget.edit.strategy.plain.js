/** 
 * DevExtreme (ui/collection/ui.collection_widget.edit.strategy.plain.js)
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
        errors = require("../widget/ui.errors"),
        arrayUtils = require("../../core/utils/array"),
        EditStrategy = require("./ui.collection_widget.edit.strategy");
    var PlainEditStrategy = EditStrategy.inherit({
        _getPlainItems: function() {
            return this._collectionWidget.option("items") || []
        },
        getIndexByItemData: function(itemData) {
            return $.inArray(itemData, this._getPlainItems())
        },
        getItemDataByIndex: function(index) {
            return this._getPlainItems()[index]
        },
        deleteItemAtIndex: function(index) {
            this._getPlainItems().splice(index, 1)
        },
        updateSelectionAfterDelete: function(fromIndex) {
            var selectedItemIndices = this._collectionWidget._selectedItemIndices;
            $.each(selectedItemIndices, function(i, index) {
                if (index > fromIndex) {
                    selectedItemIndices[i] -= 1
                }
            })
        },
        fetchSelectedItems: function(indices) {
            indices = indices || this._collectionWidget._selectedItemIndices;
            indices.sort(function(a, b) {
                return a - b
            });
            var items = this._getPlainItems(),
                selectedItems = [];
            $.each(indices, function(_, index) {
                selectedItems.push(items[index])
            });
            if (this._collectionWidget._dataSource && "single" !== this._collectionWidget.option("selectionMode")) {
                var allSelectedItems = this._collectionWidget.option("selectedItems"),
                    unavailableItems = $.grep(allSelectedItems, function(item) {
                        return $.inArray(item, items) === -1
                    });
                selectedItems = selectedItems.concat(unavailableItems)
            }
            return selectedItems
        },
        fetchSelectionDifference: function(addedSelection, removedSelection) {
            var difference = this.callBase(addedSelection, removedSelection);
            if (this._collectionWidget._dataSource) {
                var addedItems = difference.addedItems,
                    removedItems = difference.removedItems,
                    duplicatedItems = arrayUtils.intersection(addedItems, removedItems);
                $.each(duplicatedItems, function(_, item) {
                    var addedItemIndex = $.inArray(item, addedItems),
                        removedItemIndex = $.inArray(item, removedItems);
                    addedItems.splice(addedItemIndex, 1);
                    removedItems.splice(removedItemIndex, 1)
                })
            }
            return difference
        },
        selectedItemIndices: function() {
            var selectedIndices = [],
                items = this._getPlainItems(),
                selected = this._collectionWidget.option("selectedItems"),
                dataSource = this._collectionWidget._dataSource;
            $.each(selected, function(_, selectedItem) {
                var index = $.inArray(selectedItem, items);
                if (index !== -1) {
                    selectedIndices.push(index)
                } else {
                    if (!dataSource) {
                        errors.log("W1002", selectedItem)
                    }
                }
            });
            return selectedIndices
        },
        moveItemAtIndexToIndex: function(movingIndex, destinationIndex) {
            var items = this._getPlainItems(),
                movedItemData = items[movingIndex];
            items.splice(movingIndex, 1);
            items.splice(destinationIndex, 0, movedItemData)
        },
        _isItemIndex: function(index) {
            return "number" === typeof index && Math.round(index) === index
        },
        _getNormalizedItemIndex: function(itemElement) {
            return this._collectionWidget._itemElements().index(itemElement)
        },
        _normalizeItemIndex: function(index) {
            return index
        },
        _denormalizeItemIndex: function(index) {
            return index
        },
        _getItemByNormalizedIndex: function(index) {
            return index > -1 ? this._collectionWidget._itemElements().eq(index) : null
        },
        _itemsFromSameParent: function() {
            return true
        }
    });
    module.exports = PlainEditStrategy
});
