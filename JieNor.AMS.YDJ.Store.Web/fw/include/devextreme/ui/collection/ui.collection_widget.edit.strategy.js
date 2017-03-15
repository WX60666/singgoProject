/** 
 * DevExtreme (ui/collection/ui.collection_widget.edit.strategy.js)
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
        Class = require("../../core/class"),
        abstract = Class.abstract;
    var EditStrategy = Class.inherit({
        ctor: function(collectionWidget) {
            this._collectionWidget = collectionWidget
        },
        getIndexByItemData: abstract,
        getItemDataByIndex: abstract,
        getNormalizedIndex: function(value) {
            if (this._isNormalizedItemIndex(value)) {
                return value
            }
            if (this._isItemIndex(value)) {
                return this._normalizeItemIndex(value)
            }
            if (this._isDOMNode(value)) {
                return this._getNormalizedItemIndex(value)
            }
            return this._normalizeItemIndex(this.getIndexByItemData(value))
        },
        getIndex: function(value) {
            if (this._isNormalizedItemIndex(value)) {
                return this._denormalizeItemIndex(value)
            }
            if (this._isItemIndex(value)) {
                return value
            }
            if (this._isDOMNode(value)) {
                return this._denormalizeItemIndex(this._getNormalizedItemIndex(value))
            }
            return this.getIndexByItemData(value)
        },
        getItemElement: function(value) {
            if (this._isNormalizedItemIndex(value)) {
                return this._getItemByNormalizedIndex(value)
            }
            if (this._isItemIndex(value)) {
                return this._getItemByNormalizedIndex(this._normalizeItemIndex(value))
            }
            if (this._isDOMNode(value)) {
                return $(value)
            }
            return this._getItemByNormalizedIndex(this.getIndexByItemData(value))
        },
        deleteItemAtIndex: abstract,
        updateSelectionAfterDelete: abstract,
        fetchSelectedItems: abstract,
        fetchSelectionDifference: function(addedSelection, removedSelection) {
            return {
                addedItems: this.fetchSelectedItems(addedSelection),
                removedItems: this.fetchSelectedItems(removedSelection)
            }
        },
        selectedItemIndices: abstract,
        itemPlacementFunc: function(movingIndex, destinationIndex) {
            return this._itemsFromSameParent(movingIndex, destinationIndex) && movingIndex < destinationIndex ? "after" : "before"
        },
        moveItemAtIndexToIndex: abstract,
        getSelectedItemsAfterReorderItem: function() {
            return this._collectionWidget.option("selectedItems")
        },
        _isNormalizedItemIndex: function(index) {
            return "number" === typeof index && Math.round(index) === index
        },
        _isDOMNode: function(value) {
            var $value;
            try {
                $value = $(value)
            } catch (error) {
                return false
            }
            return $value && $value.length && $value.get(0).nodeType
        },
        _isItemIndex: abstract,
        _getNormalizedItemIndex: abstract,
        _normalizeItemIndex: abstract,
        _denormalizeItemIndex: abstract,
        _getItemByNormalizedIndex: abstract,
        _itemsFromSameParent: abstract
    });
    module.exports = EditStrategy
});
