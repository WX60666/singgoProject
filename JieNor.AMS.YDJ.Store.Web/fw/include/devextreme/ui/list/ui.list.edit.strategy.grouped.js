/** 
 * DevExtreme (ui/list/ui.list.edit.strategy.grouped.js)
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
        EditStrategy = require("../collection/ui.collection_widget.edit.strategy.plain");
    var LIST_ITEM_CLASS = "dx-list-item",
        LIST_GROUP_CLASS = "dx-list-group";
    var SELECTION_SHIFT = 20,
        SELECTION_MASK = 2303;
    var combineIndex = function(indices) {
        return (indices.group << SELECTION_SHIFT) + indices.item
    };
    var splitIndex = function(combinedIndex) {
        return {
            group: combinedIndex >> SELECTION_SHIFT,
            item: combinedIndex & SELECTION_MASK
        }
    };
    var createGroupSelection = function(group, selectedItems) {
        var groupItems = group.items,
            groupSelection = {
                key: group.key,
                items: []
            };
        $.each(selectedItems, function(_, itemIndex) {
            groupSelection.items.push(groupItems[itemIndex])
        });
        return groupSelection
    };
    var groupByKey = function(groups, key) {
        var length = groups.length;
        for (var i = 0; i < length; i++) {
            if (groups[i].key === key) {
                return groups[i]
            }
        }
    };
    var GroupedEditStrategy = EditStrategy.inherit({
        _groupElements: function() {
            return this._collectionWidget._itemContainer().find("." + LIST_GROUP_CLASS)
        },
        _groupItemElements: function($group) {
            return $group.find("." + LIST_ITEM_CLASS)
        },
        getIndexByItemData: function(itemData) {
            var groups = this._collectionWidget.option("items"),
                index = false;
            $.each(groups, function(groupIndex, group) {
                if (!group.items) {
                    return false
                }
                $.each(group.items, function(itemIndex, item) {
                    if (item !== itemData) {
                        return true
                    }
                    index = {
                        group: groupIndex,
                        item: itemIndex
                    };
                    return false
                });
                if (index) {
                    return false
                }
            });
            return index
        },
        getItemDataByIndex: function(index) {
            if (!index || !index.group || !index.item) {
                return null
            }
            var items = this._collectionWidget.option("items");
            return items.length && items[index.group].items[index.item] || null
        },
        deleteItemAtIndex: function(index) {
            var indices = splitIndex(index),
                itemGroup = this._collectionWidget.option("items")[indices.group].items;
            itemGroup.splice(indices.item, 1)
        },
        updateSelectionAfterDelete: function(fromIndex) {
            var deletedIndices = splitIndex(fromIndex),
                selectedItemIndices = this._collectionWidget._selectedItemIndices;
            $.each(selectedItemIndices, function(i, index) {
                var indices = splitIndex(index);
                if (indices.group === deletedIndices.group && indices.item > deletedIndices.item) {
                    selectedItemIndices[i] -= 1
                }
            })
        },
        fetchSelectedItems: function(indices) {
            indices = indices || this._collectionWidget._selectedItemIndices;
            indices.sort(function(a, b) {
                return a - b
            });
            var items = this._collectionWidget.option("items"),
                selectedItems = [];
            var currentGroupIndex = 0,
                groupSelectedIndices = [];
            $.each(indices, function(_, combinedIndex) {
                var index = splitIndex(combinedIndex);
                if (index.group !== currentGroupIndex && groupSelectedIndices.length) {
                    selectedItems.push(createGroupSelection(items[currentGroupIndex], groupSelectedIndices));
                    groupSelectedIndices.length = 0
                }
                currentGroupIndex = index.group;
                groupSelectedIndices.push(index.item)
            });
            if (groupSelectedIndices.length) {
                selectedItems.push(createGroupSelection(items[currentGroupIndex], groupSelectedIndices))
            }
            return selectedItems
        },
        selectedItemIndices: function() {
            var selectedIndices = [],
                items = this._collectionWidget.option("items"),
                selected = this._collectionWidget.option("selectedItems"),
                dataSource = this._collectionWidget._dataSource;
            $.each(selected, function(_, selectionInGroup) {
                var group = groupByKey(items, selectionInGroup.key),
                    groupIndex = $.inArray(group, items);
                if (!group) {
                    if (!dataSource) {
                        errors.log("W1003", selectionInGroup.key)
                    }
                    return
                }
                $.each(selectionInGroup.items, function(_, selectedGroupItem) {
                    var itemIndex = $.inArray(selectedGroupItem, group.items);
                    if (itemIndex !== -1) {
                        selectedIndices.push(combineIndex({
                            group: groupIndex,
                            item: itemIndex
                        }))
                    } else {
                        if (!dataSource) {
                            errors.log("W1004", selectedGroupItem, selectionInGroup.key)
                        }
                    }
                })
            });
            return selectedIndices
        },
        moveItemAtIndexToIndex: function(movingIndex, destinationIndex) {
            var items = this._collectionWidget.option("items"),
                movingIndices = splitIndex(movingIndex),
                destinationIndices = splitIndex(destinationIndex),
                movingItemGroup = items[movingIndices.group].items,
                destinationItemGroup = items[destinationIndices.group].items,
                movedItemData = movingItemGroup[movingIndices.item];
            movingItemGroup.splice(movingIndices.item, 1);
            destinationItemGroup.splice(destinationIndices.item, 0, movedItemData)
        },
        getSelectedItemsAfterReorderItem: function(movingIndex, destinationIndex) {
            if (this._itemsFromSameParent(movingIndex, destinationIndex) || $.inArray(movingIndex, this._collectionWidget._selectedItemIndices)) {
                return this.callBase()
            }
            var items = this._collectionWidget.option("items"),
                selectedItems = this._collectionWidget.option("selectedItems"),
                movingIndices = splitIndex(movingIndex),
                destinationIndices = splitIndex(destinationIndex),
                movingSelectedItemGroup = selectedItems[movingIndices.group].items,
                destinationSelectedItemGroup = selectedItems[destinationIndices.group].items,
                movedItemData = items[movingIndices.group].items[movingIndices.item],
                movedItemSelectedIndex = $.inArray(movedItemData, movingSelectedItemGroup);
            movingSelectedItemGroup.splice(movedItemSelectedIndex, 1);
            destinationSelectedItemGroup.push(movedItemData);
            return selectedItems
        },
        _isItemIndex: function(index) {
            return $.isNumeric(index.group) && $.isNumeric(index.item)
        },
        _getNormalizedItemIndex: function(itemElement) {
            var $item = $(itemElement),
                $group = $item.closest("." + LIST_GROUP_CLASS);
            if (!$group.length) {
                return -1
            }
            return combineIndex({
                group: this._groupElements().index($group),
                item: this._groupItemElements($group).index($item)
            })
        },
        _normalizeItemIndex: function(index) {
            return combineIndex(index)
        },
        _denormalizeItemIndex: function(index) {
            return splitIndex(index)
        },
        _getItemByNormalizedIndex: function(index) {
            var indices = splitIndex(index),
                $group = this._groupElements().eq(indices.group);
            return this._groupItemElements($group).eq(indices.item)
        },
        _itemsFromSameParent: function(firstIndex, secondIndex) {
            return splitIndex(firstIndex).group === splitIndex(secondIndex).group
        }
    });
    module.exports = GroupedEditStrategy
});
