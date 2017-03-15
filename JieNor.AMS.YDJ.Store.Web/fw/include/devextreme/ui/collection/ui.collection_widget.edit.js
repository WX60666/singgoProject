/** 
 * DevExtreme (ui/collection/ui.collection_widget.edit.js)
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
        BaseCollectionWidget = require("./ui.collection_widget.base"),
        errors = require("../widget/ui.errors"),
        arrayUtils = require("../../core/utils/array"),
        commonUtils = require("../../core/utils/common"),
        PlainEditStrategy = require("./ui.collection_widget.edit.strategy.plain"),
        DataSource = require("../../data/data_source/data_source").DataSource;
    var ITEM_DELETING_DATA_KEY = "dxItemDeleting";
    var CollectionWidget = BaseCollectionWidget.inherit({
        _setOptionsByReference: function() {
            this.callBase();
            $.extend(this._optionsByReference, {
                selectedItem: true
            })
        },
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                selectionMode: "none",
                selectionRequired: false,
                selectionByClick: true,
                selectedItems: [],
                selectedIndex: -1,
                selectedItem: null,
                onSelectionChanged: null,
                onItemReordered: null,
                onItemDeleting: null,
                onItemDeleted: null
            })
        },
        _init: function() {
            this._initEditStrategy();
            this.callBase();
            this._selectedItemIndices = [];
            if ("multi" === this.option("selectionMode")) {
                this._showDeprecatedSelectionMode()
            }
        },
        _initEditStrategy: function() {
            var Strategy = PlainEditStrategy;
            this._editStrategy = new Strategy(this)
        },
        _forgetNextPageLoading: function() {
            this.callBase();
            this._selectedItemIndices = this._editStrategy.selectedItemIndices()
        },
        _render: function() {
            this._syncSelectionOptions();
            this._normalizeSelectedItems();
            this._initSelectedItems();
            this.callBase();
            this._renderSelection(this._selectedItemIndices, [])
        },
        _syncSelectionOptions: function(byOption) {
            byOption = byOption || this._chooseSelectOption();
            var selectedItem, selectedItems;
            switch (byOption) {
                case "selectedIndex":
                    selectedItem = this._editStrategy.getItemDataByIndex(this.option("selectedIndex"));
                    if (commonUtils.isDefined(selectedItem)) {
                        this._setOptionSilent("selectedItems", [selectedItem]);
                        this._setOptionSilent("selectedItem", selectedItem)
                    } else {
                        this._setOptionSilent("selectedItems", []);
                        this._setOptionSilent("selectedItem", null)
                    }
                    break;
                case "selectedItems":
                    selectedItems = this.option("selectedItems") || [];
                    this._setOptionSilent("selectedItem", selectedItems[0]);
                    this._setOptionSilent("selectedIndex", this._editStrategy.getIndexByItemData(selectedItems[0]));
                    break;
                case "selectedItem":
                    selectedItem = this.option("selectedItem");
                    if (commonUtils.isDefined(selectedItem)) {
                        this._setOptionSilent("selectedItems", [selectedItem]);
                        this._setOptionSilent("selectedIndex", this._editStrategy.getIndexByItemData(selectedItem))
                    } else {
                        this._setOptionSilent("selectedItems", []);
                        this._setOptionSilent("selectedIndex", -1)
                    }
            }
        },
        _chooseSelectOption: function() {
            var optionName = "selectedIndex";
            if (this.option("selectedItems").length) {
                optionName = "selectedItems"
            } else {
                if (commonUtils.isDefined(this.option("selectedItem"))) {
                    optionName = "selectedItem"
                }
            }
            return optionName
        },
        _normalizeSelectedItems: function() {
            if ("none" === this.option("selectionMode")) {
                this._setOptionSilent("selectedItems", []);
                this._syncSelectionOptions("selectedItems")
            } else {
                if ("single" === this.option("selectionMode")) {
                    var newSelection = this._editStrategy.selectedItemIndices(this.option("selectedItems"));
                    if (newSelection.length > 1 || !newSelection.length && this.option("selectionRequired") && this.option("items") && this.option("items").length) {
                        var normalizedSelection = [newSelection[0] || this._selectedItemIndices[0] || 0];
                        this._setOptionSilent("selectedItems", this._editStrategy.fetchSelectedItems(normalizedSelection));
                        this._syncSelectionOptions("selectedItems")
                    }
                }
            }
        },
        _initSelectedItems: function() {
            this._selectedItemIndices = this._editStrategy.selectedItemIndices(this.option("selectedItems"))
        },
        _renderSelection: $.noop,
        _itemClickHandler: function(e) {
            this._createAction($.proxy(function(e) {
                this._itemSelectHandler(e.jQueryEvent)
            }, this), {
                validatingTargetName: "itemElement"
            })({
                itemElement: $(e.currentTarget),
                jQueryEvent: e
            });
            this.callBase.apply(this, arguments)
        },
        _itemSelectHandler: function(e) {
            if (!this.option("selectionByClick")) {
                return
            }
            var $itemElement = e.currentTarget;
            if (this.isItemSelected($itemElement)) {
                this.unselectItem(e.currentTarget)
            } else {
                this.selectItem(e.currentTarget)
            }
        },
        _selectedItemElement: function(index) {
            return this._itemElements().eq(index)
        },
        _postprocessRenderItem: function(args) {
            var $itemElement = $(args.itemElement);
            if (this._isItemSelected(this._editStrategy.getNormalizedIndex($itemElement))) {
                $itemElement.addClass(this._selectedItemClass());
                this._setAriaSelected($itemElement, "true")
            } else {
                this._setAriaSelected($itemElement, "false")
            }
        },
        _updateSelectedItems: function() {
            var that = this,
                oldSelection = this._selectedItemIndices.slice(),
                newSelection = this._editStrategy.selectedItemIndices(),
                addedSelection = arrayUtils.removeDuplicates(newSelection, oldSelection),
                removedSelection = arrayUtils.removeDuplicates(oldSelection, newSelection);
            $.each(removedSelection, function(_, normalizedIndex) {
                that._removeSelection(normalizedIndex)
            });
            $.each(addedSelection, function(_, normalizedIndex) {
                that._addSelection(normalizedIndex)
            });
            if (removedSelection.length || addedSelection.length) {
                var selectionChangePromise = this._selectionChangePromise;
                this._updateSelection(addedSelection, removedSelection);
                $.when(selectionChangePromise).done(function() {
                    that._fireSelectionChangeEvent(addedSelection, removedSelection)
                })
            }
        },
        _fireSelectionChangeEvent: function(addedSelection, removedSelection) {
            this._createActionByOption("onSelectionChanged", {
                excludeValidators: ["disabled", "readOnly"]
            })(this._editStrategy.fetchSelectionDifference(addedSelection, removedSelection))
        },
        _updateSelection: function() {
            this._renderSelection.apply(this, arguments)
        },
        _setAriaSelected: function($target, value) {
            this.setAria("selected", value, $target)
        },
        _removeSelection: function(normalizedIndex) {
            var $itemElement = this._editStrategy.getItemElement(normalizedIndex),
                itemSelectionIndex = $.inArray(normalizedIndex, this._selectedItemIndices);
            if (itemSelectionIndex > -1) {
                $itemElement.removeClass(this._selectedItemClass());
                this._setAriaSelected($itemElement, "false");
                this._selectedItemIndices.splice(itemSelectionIndex, 1);
                $itemElement.triggerHandler("stateChanged")
            }
        },
        _showDeprecatedSelectionMode: function() {
            errors.log("W0001", this.NAME, "selectionMode: 'multi'", "16.1", "Use selectionMode: 'multiple' instead");
            this.option("selectionMode", "multiple")
        },
        _addSelection: function(normalizedIndex) {
            var $itemElement = this._editStrategy.getItemElement(normalizedIndex);
            if (normalizedIndex > -1 && !this._isItemSelected(normalizedIndex)) {
                $itemElement.addClass(this._selectedItemClass());
                this._setAriaSelected($itemElement, "true");
                this._selectedItemIndices.push(normalizedIndex);
                $itemElement.triggerHandler("stateChanged")
            }
        },
        _isItemSelected: function(index) {
            return $.inArray(index, this._selectedItemIndices) > -1
        },
        _optionChanged: function(args) {
            if (this._cancelOptionChange === args.name) {
                return
            }
            switch (args.name) {
                case "selectionMode":
                    if ("multi" === args.value) {
                        this._showDeprecatedSelectionMode()
                    } else {
                        this._invalidate()
                    }
                    break;
                case "selectedIndex":
                case "selectedItem":
                case "selectedItems":
                    this._syncSelectionOptions(args.name);
                    this._normalizeSelectedItems();
                    this._updateSelectedItems();
                    break;
                case "selectionRequired":
                    this._normalizeSelectedItems();
                    this._updateSelectedItems();
                    break;
                case "selectionByClick":
                case "onSelectionChanged":
                case "onItemDeleting":
                case "onItemDeleted":
                case "onItemReordered":
                    break;
                default:
                    this.callBase(args)
            }
        },
        _clearSelectedItems: function() {
            this._selectedItemIndices = [];
            this._setOptionSilent("selectedItems", []);
            this._syncSelectionOptions("selectedItems")
        },
        _setOptionSilent: function(name, value) {
            this._cancelOptionChange = name;
            this.option(name, value);
            this._cancelOptionChange = false
        },
        _waitDeletingPrepare: function($itemElement) {
            if ($itemElement.data(ITEM_DELETING_DATA_KEY)) {
                return $.Deferred().resolve().promise()
            }
            $itemElement.data(ITEM_DELETING_DATA_KEY, true);
            var deferred = $.Deferred(),
                deletePromise = this._itemEventHandler($itemElement, "onItemDeleting", {}, {
                    excludeValidators: ["disabled", "readOnly"]
                });
            $.when(deletePromise).always($.proxy(function(value) {
                var deletePromiseExists = !deletePromise,
                    deletePromiseResolved = !deletePromiseExists && "resolved" === deletePromise.state(),
                    argumentsSpecified = !!arguments.length,
                    shouldDelete = deletePromiseExists || deletePromiseResolved && !argumentsSpecified || deletePromiseResolved && value;
                $itemElement.data(ITEM_DELETING_DATA_KEY, false);
                shouldDelete ? deferred.resolve() : deferred.reject()
            }, this));
            return deferred.promise()
        },
        _deleteItemFromDS: function($item) {
            if (!this._dataSource) {
                return $.Deferred().resolve().promise()
            }
            var deferred = $.Deferred(),
                disabledState = this.option("disabled"),
                dataStore = this._dataSource.store();
            this.option("disabled", true);
            if (!dataStore.remove) {
                throw errors.Error("E1011")
            }
            dataStore.remove(dataStore.keyOf(this._getItemData($item))).done(function(key) {
                if (void 0 !== key) {
                    deferred.resolve()
                } else {
                    deferred.reject()
                }
            }).fail(function() {
                deferred.reject()
            });
            deferred.always($.proxy(function() {
                this.option("disabled", disabledState)
            }, this));
            return deferred
        },
        _tryRefreshLastPage: function() {
            var deferred = $.Deferred();
            if (this._isLastPage() || this.option("grouped")) {
                deferred.resolve()
            } else {
                this._refreshLastPage().done(function() {
                    deferred.resolve()
                })
            }
            return deferred.promise()
        },
        _refreshLastPage: function() {
            this._expectLastItemLoading();
            return this._dataSource.load()
        },
        _updateSelectionAfterDelete: function(fromIndex) {
            var itemIndex = $.inArray(fromIndex, this._selectedItemIndices);
            if (itemIndex > -1) {
                this._selectedItemIndices.splice(itemIndex, 1)
            }
            this._editStrategy.updateSelectionAfterDelete(fromIndex);
            this.option("selectedItems", this._editStrategy.fetchSelectedItems())
        },
        _simulateOptionChange: function(optionName) {
            var optionValue = this.option(optionName);
            if (optionValue instanceof DataSource) {
                return
            }
            this._optionChangedAction({
                name: optionName,
                fullName: optionName,
                value: optionValue
            })
        },
        isItemSelected: function(itemElement) {
            return this._isItemSelected(this._editStrategy.getNormalizedIndex(itemElement))
        },
        selectItem: function(itemElement) {
            var itemIndex = this._editStrategy.getNormalizedIndex(itemElement);
            if (itemIndex === -1) {
                return
            }
            var itemSelectionIndex = $.inArray(itemIndex, this._selectedItemIndices);
            if (itemSelectionIndex !== -1) {
                return
            }
            if ("single" === this.option("selectionMode")) {
                this.option("selectedItems", this._editStrategy.fetchSelectedItems([itemIndex]))
            } else {
                var newSelectedIndices = this._selectedItemIndices.slice();
                newSelectedIndices.push(itemIndex);
                this.option("selectedItems", this._editStrategy.fetchSelectedItems(newSelectedIndices))
            }
        },
        unselectItem: function(itemElement) {
            var itemIndex = this._editStrategy.getNormalizedIndex(itemElement);
            if (itemIndex === -1) {
                return
            }
            var itemSelectionIndex = $.inArray(itemIndex, this._selectedItemIndices);
            if (itemSelectionIndex === -1) {
                return
            }
            var newSelectedIndices = this._selectedItemIndices.slice();
            newSelectedIndices.splice(itemSelectionIndex, 1);
            if (this.option("selectionRequired") && 0 === newSelectedIndices.length) {
                return
            }
            this.option("selectedItems", this._editStrategy.fetchSelectedItems(newSelectedIndices))
        },
        deleteItem: function(itemElement) {
            var that = this,
                deferred = $.Deferred(),
                $item = this._editStrategy.getItemElement(itemElement),
                index = this._editStrategy.getNormalizedIndex(itemElement),
                changingOption = this._dataSource ? "dataSource" : "items",
                itemResponseWaitClass = this._itemResponseWaitClass();
            if (index > -1) {
                this._waitDeletingPrepare($item).done(function() {
                    $item.addClass(itemResponseWaitClass);
                    var deletedActionArgs = that._extendActionArgs($item);
                    that._deleteItemFromDS($item).done(function() {
                        that._editStrategy.deleteItemAtIndex(index);
                        that._simulateOptionChange(changingOption);
                        that._updateSelectionAfterDelete(index);
                        that._itemEventHandler($item, "onItemDeleted", deletedActionArgs, {
                            beforeExecute: function() {
                                $item.detach()
                            },
                            excludeValidators: ["disabled", "readOnly"]
                        });
                        that._renderEmptyMessage();
                        that._tryRefreshLastPage().done(function() {
                            deferred.resolveWith(that)
                        })
                    }).fail(function() {
                        $item.removeClass(itemResponseWaitClass);
                        deferred.rejectWith(that)
                    })
                }).fail(function() {
                    deferred.rejectWith(that)
                })
            } else {
                deferred.rejectWith(that)
            }
            return deferred.promise()
        },
        reorderItem: function(itemElement, toItemElement) {
            var deferred = $.Deferred(),
                that = this,
                strategy = this._editStrategy,
                $movingItem = strategy.getItemElement(itemElement),
                $destinationItem = strategy.getItemElement(toItemElement),
                movingIndex = strategy.getNormalizedIndex(itemElement),
                destinationIndex = strategy.getNormalizedIndex(toItemElement),
                changingOption = this._dataSource ? "dataSource" : "items";
            var canMoveItems = movingIndex > -1 && destinationIndex > -1 && movingIndex !== destinationIndex;
            if (canMoveItems) {
                deferred.resolveWith(this)
            } else {
                deferred.rejectWith(this)
            }
            return deferred.promise().done(function() {
                $destinationItem[strategy.itemPlacementFunc(movingIndex, destinationIndex)]($movingItem);
                var newSelectedItems = strategy.getSelectedItemsAfterReorderItem(movingIndex, destinationIndex);
                strategy.moveItemAtIndexToIndex(movingIndex, destinationIndex);
                that._selectedItemIndices = strategy.selectedItemIndices(newSelectedItems);
                that.option("selectedItems", strategy.fetchSelectedItems());
                if ("items" === changingOption) {
                    that._simulateOptionChange(changingOption)
                }
                that._itemEventHandler($movingItem, "onItemReordered", {
                    fromIndex: strategy.getIndex(movingIndex),
                    toIndex: strategy.getIndex(destinationIndex)
                }, {
                    excludeValidators: ["disabled", "readOnly"]
                })
            })
        }
    });
    module.exports = CollectionWidget
});
