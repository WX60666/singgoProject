/** 
 * DevExtreme (ui/data_grid/ui.data_grid.selection.js)
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
        gridCore = require("./ui.data_grid.core"),
        gridCoreUtils = require("../grid_core/ui.grid_core.utils"),
        equalKeys = gridCoreUtils.equalKeys,
        commonUtils = require("../../core/utils/common"),
        support = require("../../core/utils/support"),
        clickEvent = require("../../events/click"),
        messageLocalization = require("../../localization/message"),
        eventUtils = require("../../events/utils"),
        holdEvent = require("../../events/hold"),
        dataQuery = require("../../data/query"),
        ArrayStore = require("../../data/array_store"),
        getKeyHash = gridCore.getKeyHash;
    var DATAGRID_EDITOR_CELL_CLASS = "dx-editor-cell",
        DATAGRID_ROW_CLASS = "dx-row",
        DATAGRID_ROW_SELECTION_CLASS = "dx-selection",
        DATAGRID_SELECT_CHECKBOX_CLASS = "dx-select-checkbox",
        DATAGRID_CHECKBOXES_HIDDEN_CLASS = "dx-select-checkboxes-hidden",
        DATAGRID_COMMAND_SELECT_CLASS = "dx-command-select",
        DATAGRID_SELECTION_DISABLED_CLASS = "dx-selection-disabled",
        DATAGRID_DATA_ROW_CLASS = "dx-data-row";
    var SHOW_CHECKBOXES_MODE = "selection.showCheckBoxesMode",
        SELECTION_MODE = "selection.mode";
    var isSelectable = function(selectionMode) {
        return "single" === selectionMode || "multiple" === selectionMode
    };
    var processLongTap = function(that, jQueryEvent) {
        var selectionController = that.getController("selection"),
            rowsView = that.getView("rowsView"),
            $row = $(jQueryEvent.target).closest("." + DATAGRID_DATA_ROW_CLASS),
            rowIndex = rowsView.getRowIndex($row);
        if (rowIndex < 0) {
            return
        }
        if ("onLongTap" === that.option(SHOW_CHECKBOXES_MODE)) {
            if (selectionController.isSelectionWithCheckboxes()) {
                selectionController.stopSelectionWithCheckboxes()
            } else {
                selectionController.startSelectionWithCheckboxes()
            }
        } else {
            if ("onClick" === that.option(SHOW_CHECKBOXES_MODE)) {
                selectionController.startSelectionWithCheckboxes()
            }
            if ("always" !== that.option(SHOW_CHECKBOXES_MODE)) {
                selectionController.changeItemSelection(rowIndex, {
                    control: true
                })
            }
        }
    };
    exports.SelectionController = gridCore.Controller.inherit(function() {
        var indexOfSelectedItemKey = function(that, key, isSelectAll) {
            var index, indices, selectedItemKeys = isSelectAll ? that._unselectedItemKeys : that._selectedItemKeys;
            if (commonUtils.isObject(key)) {
                for (index = 0; index < selectedItemKeys.length; index++) {
                    if (equalKeys(selectedItemKeys[index], key)) {
                        return index
                    }
                }
                return -1
            } else {
                indices = that._selectedItemKeyHashIndices[key];
                return indices && indices[0] >= 0 ? indices[0] : -1
            }
        };
        var addSelectedItem = function(that, itemData) {
            var key = that.getController("data").keyOf(itemData),
                keyHash = getKeyHash(key);
            if (indexOfSelectedItemKey(that, keyHash) === -1) {
                if (!commonUtils.isObject(keyHash)) {
                    that._selectedItemKeyHashIndices[keyHash] = [that._selectedItemKeys.length]
                }
                that._selectedItemKeys.push(key);
                that._addedItemKeys.push(key);
                that._selectedItems.push(itemData)
            }
        };
        var removeSelectedItem = function(that, key) {
            var currentKeyIndex, currentKeyIndices, keyIndices, i, keyHash = getKeyHash(key),
                keyIndex = indexOfSelectedItemKey(that, keyHash);
            if (keyIndex >= 0) {
                that._selectedItemKeys.splice(keyIndex, 1);
                that._removedItemKeys.push(key);
                that._selectedItems.splice(keyIndex, 1);
                if (!commonUtils.isObject(keyHash)) {
                    keyIndices = that._selectedItemKeyHashIndices[keyHash];
                    if (keyIndices) {
                        keyIndices.shift();
                        if (!keyIndices.length) {
                            delete that._selectedItemKeyHashIndices[keyHash]
                        }
                        for (currentKeyIndex = keyIndex; currentKeyIndex < that._selectedItemKeys.length; currentKeyIndex++) {
                            currentKeyIndices = that._selectedItemKeyHashIndices[getKeyHash(that._selectedItemKeys[currentKeyIndex])];
                            if (currentKeyIndices) {
                                for (i = 0; i < currentKeyIndices.length; i++) {
                                    if (currentKeyIndices[i] > keyIndex) {
                                        currentKeyIndices[i]--
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        var clearSelectedItems = function(that) {
            setSelectedItems(that, [], [])
        };
        var setSelectedItems = function(that, keys, items) {
            var i, keyHash, keyIndices, oldSelectedItemKeys = that._selectedItemKeys;
            that._selectedItemKeys = keys;
            that._selectedItemKeyHashIndices = {};
            that._selectedItems = items;
            that._unselectedItemKeys = [];
            for (i = 0; i < oldSelectedItemKeys.length; i++) {
                if ($.inArray(oldSelectedItemKeys[i], keys) === -1) {
                    that._removedItemKeys.push(oldSelectedItemKeys[i])
                }
            }
            for (i = 0; i < keys.length; i++) {
                keyHash = getKeyHash(keys[i]);
                if (!commonUtils.isObject(keyHash)) {
                    keyIndices = that._selectedItemKeyHashIndices[keyHash] = that._selectedItemKeyHashIndices[keyHash] || [];
                    keyIndices.push(i)
                }
                if ($.inArray(keys[i], oldSelectedItemKeys) === -1) {
                    that._addedItemKeys.push(keys[i])
                }
            }
        };
        var resetItemSelectionWhenShiftKeyPressed = function(that) {
            delete that._shiftFocusedItemIndex
        };
        var isDataItem = function(row) {
            return row && "data" === row.rowType && !row.inserted
        };
        var changeItemSelectionWhenShiftKeyPressed = function(that, itemIndex, items) {
            var itemIndexStep, index, isSelectedItemsChanged = false,
                dataController = that.getController("data"),
                isFocusedItemSelected = items[that._focusedItemIndex] && that.isRowSelected(dataController.keyOf(items[that._focusedItemIndex].data));
            var addRemoveSelectedItem = function(that, data, isRemove) {
                if (isRemove) {
                    removeSelectedItem(that, dataController.keyOf(data))
                } else {
                    addSelectedItem(that, data)
                }
            };
            if (!commonUtils.isDefined(that._shiftFocusedItemIndex)) {
                that._shiftFocusedItemIndex = that._focusedItemIndex
            }
            if (that._shiftFocusedItemIndex !== that._focusedItemIndex) {
                itemIndexStep = that._focusedItemIndex < that._shiftFocusedItemIndex ? 1 : -1;
                for (index = that._focusedItemIndex; index !== that._shiftFocusedItemIndex; index += itemIndexStep) {
                    if (isDataItem(items[index])) {
                        addRemoveSelectedItem(that, items[index].data, true);
                        isSelectedItemsChanged = true
                    }
                }
            }
            if (itemIndex !== that._shiftFocusedItemIndex) {
                itemIndexStep = itemIndex < that._shiftFocusedItemIndex ? 1 : -1;
                for (index = itemIndex; index !== that._shiftFocusedItemIndex; index += itemIndexStep) {
                    if (isDataItem(items[index])) {
                        addRemoveSelectedItem(that, items[index].data, false);
                        isSelectedItemsChanged = true
                    }
                }
            }
            if (isDataItem(items[that._focusedItemIndex]) && !isFocusedItemSelected) {
                addRemoveSelectedItem(that, items[that._focusedItemIndex].data, false);
                isSelectedItemsChanged = true
            }
            return isSelectedItemsChanged
        };
        var createSelectedItemsFilterCriteria = function(dataSource, selectedItemKeys, isSelectAll) {
            var keyCriteria, i, key = dataSource && dataSource.key(),
                criteria = [];
            if (dataSource) {
                if (key) {
                    $.each(selectedItemKeys, function(index, keyValue) {
                        if (criteria.length > 0) {
                            criteria.push(isSelectAll ? "and" : "or")
                        }
                        if (commonUtils.isArray(key)) {
                            if (commonUtils.isObject(keyValue)) {
                                keyCriteria = [];
                                for (i = 0; i < key.length; i++) {
                                    if (i > 0) {
                                        keyCriteria.push(isSelectAll ? "or" : "and")
                                    }
                                    keyCriteria.push([key[i], isSelectAll ? "<>" : "=", keyValue[key[i]]])
                                }
                                criteria.push(keyCriteria)
                            }
                        } else {
                            criteria.push([key, isSelectAll ? "<>" : "=", keyValue])
                        }
                    })
                } else {
                    criteria = function(item) {
                        var i;
                        for (i = 0; i < selectedItemKeys.length; i++) {
                            if (equalKeys(selectedItemKeys[i], item)) {
                                return !isSelectAll
                            }
                        }
                        return isSelectAll
                    }
                }
            }
            if (criteria.length > 0 || $.isFunction(criteria)) {
                return criteria
            }
        };
        var updateSelectedItems = function(that, selectedRowKeys) {
            var addedItemKeys, removedItemKeys, changedItemIndexes = [],
                dataController = that.getController("data"),
                isSelectionWithCheckboxes = that.isSelectionWithCheckboxes();
            if (dataController) {
                $.each(dataController.items(), function(index, row) {
                    if (isDataItem(row) && row.isSelected !== that.isRowSelected(row.key)) {
                        changedItemIndexes.push(index)
                    }
                });
                if ("onClick" === that.option(SHOW_CHECKBOXES_MODE)) {
                    if (that._selectedItemKeys.length > 1) {
                        that.startSelectionWithCheckboxes()
                    } else {
                        if (0 === that._selectedItemKeys.length && that._removedItemKeys.length) {
                            that.stopSelectionWithCheckboxes()
                        }
                    }
                }
                if (changedItemIndexes.length || isSelectionWithCheckboxes !== that.isSelectionWithCheckboxes()) {
                    dataController.updateItems({
                        changeType: "updateSelection",
                        itemIndexes: changedItemIndexes
                    })
                }
                addedItemKeys = that._addedItemKeys;
                removedItemKeys = that._removedItemKeys;
                if (addedItemKeys.length || removedItemKeys.length) {
                    that._selectedItemsInternalChange = true;
                    selectedRowKeys = selectedRowKeys || that._selectedItemKeys.slice(0);
                    that.option("selectedRowKeys", selectedRowKeys);
                    that._selectedItemsInternalChange = false;
                    that.selectionChanged.fire(that._selectedItemKeys);
                    that._addedItemKeys = [];
                    that._removedItemKeys = [];
                    that.executeAction("onSelectionChanged", {
                        selectedRowsData: that._selectedItems,
                        selectedRowKeys: selectedRowKeys,
                        currentSelectedRowKeys: addedItemKeys,
                        currentDeselectedRowKeys: removedItemKeys
                    })
                }
            }
        };
        var updateSelectColumn = function(that) {
            var columnsController = that.getController("columns"),
                isSelectColumnVisible = that.isSelectColumnVisible();
            columnsController.addCommandColumn({
                command: "select",
                visible: isSelectColumnVisible,
                visibleIndex: -1,
                dataType: "boolean",
                alignment: "center",
                cssClass: DATAGRID_COMMAND_SELECT_CLASS,
                width: "auto"
            });
            columnsController.columnOption("command:select", "visible", isSelectColumnVisible)
        };
        return {
            init: function() {
                var that = this;
                that._isSelectionWithCheckboxes = false;
                that._focusedItemIndex = -1;
                that._selectedItemKeys = that.option("selectedRowKeys") || [];
                that._selectedItemKeyHashIndices = {};
                that._unselectedItemKeys = [];
                that._selectedItems = [];
                that._addedItemKeys = [];
                that._removedItemKeys = [];
                that._selectionMode = that.option(SELECTION_MODE);
                updateSelectColumn(that);
                that.createAction("onSelectionChanged", {
                    excludeValidators: ["disabled", "readOnly"]
                })
            },
            callbackNames: function() {
                return ["selectionChanged"]
            },
            optionChanged: function(args) {
                var that = this;
                that.callBase(args);
                switch (args.name) {
                    case "selection":
                        var oldSelectionMode = that._selectionMode;
                        that.init();
                        var selectionMode = that._selectionMode;
                        var selectedRowKeys = that.option("selectedRowKeys");
                        if (oldSelectionMode !== selectionMode) {
                            if ("single" === selectionMode) {
                                if (selectedRowKeys.length > 1) {
                                    selectedRowKeys = [selectedRowKeys[0]]
                                }
                            } else {
                                if ("multiple" !== selectionMode) {
                                    selectedRowKeys = []
                                }
                            }
                        }
                        that.selectRows(selectedRowKeys);
                        that.getController("columns").updateColumns();
                        args.handled = true;
                        break;
                    case "selectedRowKeys":
                        if (commonUtils.isArray(args.value) && !that._selectedItemsInternalChange) {
                            that.selectRows(args.value)
                        }
                        args.handled = true
                }
            },
            publicMethods: function() {
                return ["selectRows", "deselectRows", "selectRowsByIndexes", "getSelectedRowKeys", "getSelectedRowsData", "clearSelection", "selectAll", "deselectAll", "startSelectionWithCheckboxes", "stopSelectionWithCheckboxes", "isRowSelected"]
            },
            isRowSelected: function(key) {
                var keyHash = getKeyHash(key),
                    index = indexOfSelectedItemKey(this, keyHash);
                return index !== -1
            },
            isSelectColumnVisible: function() {
                var showCheckBoxesMode = this.option(SHOW_CHECKBOXES_MODE);
                return "multiple" === this.option(SELECTION_MODE) && ("always" === showCheckBoxesMode || "onClick" === showCheckBoxesMode || this._isSelectionWithCheckboxes)
            },
            isSelectAll: function() {
                var i, dataController = this.getController("data"),
                    items = dataController.items(),
                    combinedFilter = dataController.getCombinedFilter(),
                    selectedItems = this.getSelectedRowsData();
                if (combinedFilter) {
                    dataQuery(selectedItems).filter(combinedFilter).enumerate().done(function(items) {
                        selectedItems = items
                    })
                }
                if (!selectedItems.length) {
                    for (i = 0; i < items.length; i++) {
                        if (items[i].selected) {
                            return
                        }
                    }
                    return false
                } else {
                    if (selectedItems.length >= dataController.totalCount()) {
                        return true
                    }
                }
            },
            selectAll: function() {
                if ("onClick" === this.option(SHOW_CHECKBOXES_MODE)) {
                    this.startSelectionWithCheckboxes()
                }
                return this.selectedItemKeys([], true, false, true)
            },
            deselectAll: function() {
                return this.selectedItemKeys([], true, true, true)
            },
            clearSelection: function() {
                return this.selectedItemKeys([])
            },
            refresh: function() {
                return this.selectedItemKeys(this.option("selectedRowKeys") || [])
            },
            selectedItemKeys: function(value, preserve, isDeselect, isSelectAll) {
                var criteria, isFunctionCriteria, deferred, dataSourceFilter, filter, loadOptions, that = this,
                    keys = [],
                    dataController = that.getController("data"),
                    dataSource = dataController.dataSource(),
                    store = dataSource && dataSource.store(),
                    deselectItems = [];
                if (commonUtils.isDefined(value)) {
                    if (store) {
                        keys = commonUtils.isArray(value) ? value : [value];
                        if (keys.length || isSelectAll) {
                            criteria = createSelectedItemsFilterCriteria(dataSource, keys, isSelectAll);
                            isFunctionCriteria = $.isFunction(criteria);
                            if (isSelectAll) {
                                dataSourceFilter = dataController.getCombinedFilter();
                                if (isDeselect && !dataSourceFilter) {
                                    return that.clearSelection()
                                }
                            }
                            if (criteria || isSelectAll) {
                                if (criteria && !isFunctionCriteria && dataSourceFilter) {
                                    filter = [];
                                    filter.push(criteria);
                                    filter.push(dataSourceFilter)
                                } else {
                                    if (dataSourceFilter) {
                                        filter = dataSourceFilter
                                    } else {
                                        if (criteria && !isFunctionCriteria) {
                                            filter = criteria
                                        }
                                    }
                                }
                                deferred = $.Deferred();
                                if (isDeselect) {
                                    new ArrayStore(that._selectedItems).load({
                                        filter: filter
                                    }).done(function(items) {
                                        deselectItems = items
                                    })
                                }
                                loadOptions = {
                                    filter: filter,
                                    select: dataSource.select()
                                };
                                new ArrayStore(deselectItems.length ? deselectItems : dataSource.items()).load({
                                    filter: criteria
                                }).done(function(items) {
                                    if (!isSelectAll && (deselectItems.length || items.length === keys.length)) {
                                        deferred.resolve(items)
                                    } else {
                                        dataSource.load(loadOptions).done(function(items) {
                                            new ArrayStore(items).load({
                                                filter: criteria
                                            }).done(deferred.resolve)
                                        }).fail($.proxy(deferred.reject, deferred))
                                    }
                                })
                            }
                        }
                    }
                    deferred = deferred || $.Deferred().resolve([]);
                    deferred.done(function(items) {
                        var i, key, item, keepSelectedRowKeysInstance, internalKeys = [];
                        if (store && items.length > 0) {
                            for (i = 0; i < items.length; i++) {
                                item = items[i];
                                key = store.keyOf(item);
                                if (preserve) {
                                    if (isDeselect) {
                                        removeSelectedItem(that, key)
                                    } else {
                                        addSelectedItem(that, item)
                                    }
                                } else {
                                    internalKeys.push(key)
                                }
                            }
                        }
                        if (!preserve) {
                            setSelectedItems(that, internalKeys, items)
                        }
                        keepSelectedRowKeysInstance = !preserve && internalKeys.length === keys.length;
                        updateSelectedItems(that, keepSelectedRowKeysInstance && keys)
                    });
                    return deferred
                } else {
                    return that._selectedItemKeys
                }
            },
            getSelectedRowKeys: function() {
                return this.selectedItemKeys()
            },
            selectRows: function(keys, preserve) {
                return this.selectedItemKeys(keys, preserve)
            },
            deselectRows: function(keys) {
                return this.selectedItemKeys(keys, true, true)
            },
            selectRowsByIndexes: function(indexes) {
                var items = this.getController("data").items(),
                    keys = [];
                if (!commonUtils.isArray(indexes)) {
                    indexes = Array.prototype.slice.call(arguments, 0)
                }
                $.each(indexes, function() {
                    var item = items[this];
                    if (item && "data" === item.rowType) {
                        keys.push(item.key)
                    }
                });
                return this.selectRows(keys)
            },
            getSelectedRowsData: function() {
                return this._selectedItems
            },
            changeItemSelection: function(itemIndex, keys) {
                var isSelectedItemsChanged, isSelected, itemKey, that = this,
                    dataController = that.getController("data"),
                    items = dataController.items(),
                    item = items[itemIndex],
                    itemData = item && (item.oldData || item.data),
                    selectionMode = that.option(SELECTION_MODE);
                if (isSelectable(selectionMode) && isDataItem(item)) {
                    itemKey = dataController.keyOf(itemData);
                    keys = keys || {};
                    if (that.isSelectionWithCheckboxes()) {
                        keys.control = true
                    }
                    if (keys.shift && "multiple" === selectionMode && that._focusedItemIndex >= 0) {
                        isSelectedItemsChanged = changeItemSelectionWhenShiftKeyPressed(that, itemIndex, items)
                    } else {
                        if (keys.control) {
                            resetItemSelectionWhenShiftKeyPressed(that);
                            isSelected = that.isRowSelected(itemKey);
                            if ("single" === selectionMode) {
                                clearSelectedItems(that)
                            }
                            if (isSelected) {
                                removeSelectedItem(that, itemKey)
                            } else {
                                addSelectedItem(that, itemData)
                            }
                            isSelectedItemsChanged = true
                        } else {
                            resetItemSelectionWhenShiftKeyPressed(that);
                            if (1 !== that._selectedItemKeys.length || !equalKeys(that._selectedItemKeys[0], itemKey)) {
                                setSelectedItems(that, [itemKey], [itemData]);
                                isSelectedItemsChanged = true
                            }
                        }
                    }
                    if (isSelectedItemsChanged) {
                        that._focusedItemIndex = itemIndex;
                        updateSelectedItems(that);
                        return true
                    }
                }
                return false
            },
            focusedItemIndex: function(itemIndex) {
                var that = this;
                if (commonUtils.isDefined(itemIndex)) {
                    that._focusedItemIndex = itemIndex
                } else {
                    return that._focusedItemIndex
                }
            },
            isSelectionWithCheckboxes: function() {
                var selectionMode = this.option(SELECTION_MODE),
                    showCheckBoxesMode = this.option(SHOW_CHECKBOXES_MODE);
                return "multiple" === selectionMode && ("always" === showCheckBoxesMode || this._isSelectionWithCheckboxes)
            },
            startSelectionWithCheckboxes: function() {
                var that = this,
                    isSelectColumnVisible = that.isSelectColumnVisible();
                if ("multiple" === that.option(SELECTION_MODE) && !that.isSelectionWithCheckboxes()) {
                    that._isSelectionWithCheckboxes = true;
                    updateSelectColumn(that);
                    if (isSelectColumnVisible === that.isSelectColumnVisible() && "onClick" === that.option(SHOW_CHECKBOXES_MODE)) {
                        updateSelectedItems(that)
                    }
                    return true
                }
                return false
            },
            stopSelectionWithCheckboxes: function() {
                var that = this;
                if (that._isSelectionWithCheckboxes) {
                    that._isSelectionWithCheckboxes = false;
                    updateSelectColumn(that);
                    return true
                }
                return false
            }
        }
    }());
    gridCore.registerModule("selection", {
        defaultOptions: function() {
            return {
                selection: {
                    mode: "none",
                    showCheckBoxesMode: "onClick",
                    allowSelectAll: true
                },
                selectedRowKeys: []
            }
        },
        controllers: {
            selection: exports.SelectionController
        },
        extenders: {
            controllers: {
                data: {
                    setDataSource: function(dataSource) {
                        this.callBase(dataSource);
                        if (dataSource) {
                            this.getController("selection").refresh()
                        }
                    },
                    pageIndex: function(value) {
                        var that = this,
                            dataSource = that._dataSource;
                        if (dataSource && value && dataSource.pageIndex() !== value) {
                            that.getController("selection").focusedItemIndex(-1)
                        }
                        return that.callBase(value)
                    },
                    _processDataItem: function(item, options) {
                        var that = this,
                            selectionController = that.getController("selection"),
                            hasSelectColumn = selectionController.isSelectColumnVisible(),
                            dataItem = this.callBase.apply(this, arguments);
                        dataItem.isSelected = selectionController.isRowSelected(dataItem.key);
                        if (hasSelectColumn && dataItem.values) {
                            for (var i = 0; i < options.visibleColumns.length; i++) {
                                if ("select" === options.visibleColumns[i].command) {
                                    dataItem.values[i] = dataItem.isSelected;
                                    break
                                }
                            }
                        }
                        return dataItem
                    },
                    refresh: function() {
                        var that = this,
                            d = $.Deferred();
                        this.callBase.apply(this, arguments).done(function() {
                            that.getController("selection").refresh().done(d.resolve).fail(d.reject)
                        }).fail(d.reject);
                        return d.promise()
                    }
                },
                contextMenu: {
                    _contextMenuPrepared: function(options) {
                        var jQueryEvent = options.jQueryEvent;
                        if (jQueryEvent.originalEvent && "dxhold" !== jQueryEvent.originalEvent.type || options.items && options.items.length > 0) {
                            return
                        }
                        processLongTap(this, jQueryEvent)
                    }
                }
            },
            views: {
                columnHeadersView: {
                    init: function() {
                        var that = this;
                        that.callBase();
                        that.getController("selection").selectionChanged.add($.proxy(that._updateSelectAllValue, that))
                    },
                    _updateSelectAllValue: function() {
                        var that = this,
                            $element = that.element(),
                            $editor = $element && $element.find("." + DATAGRID_SELECT_CHECKBOX_CLASS);
                        if ($element && $editor.length && "multiple" === that.option("selection.mode")) {
                            $editor.dxCheckBox("instance").option("value", that.getController("selection").isSelectAll())
                        }
                    },
                    _handleDataChanged: function(e) {
                        this.callBase(e);
                        if (!e || "refresh" === e.changeType) {
                            this._updateSelectAllValue()
                        }
                    },
                    _getDefaultTemplate: function(column) {
                        var groupElement, that = this,
                            selectionController = that.getController("selection");
                        if ("select" === column.command) {
                            return function($cell, options) {
                                var column = options.column;
                                if ("select" === column.command) {
                                    $cell.addClass(DATAGRID_EDITOR_CELL_CLASS);
                                    groupElement = $("<div />").appendTo($cell).addClass(DATAGRID_SELECT_CHECKBOX_CLASS);
                                    that.setAria("label", messageLocalization.format("dxDataGrid-ariaSelectAll"), $cell);
                                    that.getController("editorFactory").createEditor(groupElement, $.extend({}, column, {
                                        parentType: "headerRow",
                                        value: selectionController.isSelectAll(),
                                        editorOptions: {
                                            visible: that.option("selection.allowSelectAll") || false !== selectionController.isSelectAll()
                                        },
                                        tabIndex: -1,
                                        setValue: function(value, e) {
                                            var allowSelectAll = that.option("selection.allowSelectAll");
                                            if (e.jQueryEvent && selectionController.isSelectAll() !== value) {
                                                if (void 0 === e.previousValue || e.previousValue) {
                                                    selectionController.deselectAll();
                                                    e.component.option("value", false)
                                                }
                                                if (false === e.previousValue) {
                                                    if (allowSelectAll) {
                                                        selectionController.selectAll()
                                                    } else {
                                                        e.component.option("value", false)
                                                    }
                                                }
                                                e.jQueryEvent.preventDefault()
                                            }
                                            e.component.option("visible", allowSelectAll || false !== e.component.option("value"))
                                        }
                                    }));
                                    $cell.on(clickEvent.name, that.createAction(function(e) {
                                        var event = e.jQueryEvent;
                                        if (!$(event.target).closest("." + DATAGRID_SELECT_CHECKBOX_CLASS).length) {
                                            $(event.currentTarget).children().trigger(clickEvent.name)
                                        }
                                        event.preventDefault()
                                    }))
                                }
                            }
                        } else {
                            return that.callBase(column)
                        }
                    }
                },
                rowsView: {
                    _getDefaultTemplate: function(column) {
                        var groupElement, that = this;
                        if ("select" === column.command) {
                            return function(container, options) {
                                if ("data" === options.rowType && !options.row.inserted) {
                                    container.addClass(DATAGRID_EDITOR_CELL_CLASS);
                                    container.on(clickEvent.name, that.createAction(function(e) {
                                        var selectionController = that.getController("selection"),
                                            event = e.jQueryEvent,
                                            rowIndex = that.getRowIndex($(event.currentTarget).closest("." + DATAGRID_ROW_CLASS));
                                        if (rowIndex >= 0) {
                                            selectionController.startSelectionWithCheckboxes();
                                            selectionController.changeItemSelection(rowIndex, {
                                                shift: event.shiftKey
                                            })
                                        }
                                    }));
                                    that.setAria("label", messageLocalization.format("dxDataGrid-ariaSelectRow"), container);
                                    groupElement = $("<div />").addClass(DATAGRID_SELECT_CHECKBOX_CLASS).appendTo(container);
                                    that.getController("editorFactory").createEditor(groupElement, $.extend({}, column, {
                                        parentType: "dataRow",
                                        value: options.value,
                                        tabIndex: -1,
                                        setValue: function(value, e) {
                                            if (e && e.jQueryEvent && "keydown" === e.jQueryEvent.type) {
                                                container.trigger(clickEvent.name, e)
                                            }
                                        }
                                    }))
                                }
                            }
                        } else {
                            return that.callBase(column)
                        }
                    },
                    _update: function(change) {
                        var that = this,
                            tableElements = that.getTableElements();
                        if ("updateSelection" === change.changeType) {
                            if (tableElements.length > 0) {
                                $.each(tableElements, function(_, tableElement) {
                                    $.each(change.itemIndexes || [], function(_, index) {
                                        var $row, isSelected;
                                        if (change.items[index]) {
                                            $row = that._getRowElements($(tableElement)).eq(index);
                                            isSelected = !!change.items[index].isSelected;
                                            $row.toggleClass(DATAGRID_ROW_SELECTION_CLASS, isSelected).find("." + DATAGRID_SELECT_CHECKBOX_CLASS).dxCheckBox("option", "value", isSelected);
                                            that.setAria("selected", isSelected, $row)
                                        }
                                    })
                                });
                                that._updateCheckboxesClass()
                            }
                        } else {
                            that.callBase(change)
                        }
                    },
                    _createTable: function() {
                        var that = this,
                            selectionMode = that.option("selection.mode"),
                            $table = that.callBase.apply(that, arguments);
                        if ("none" !== selectionMode) {
                            if ("onLongTap" === that.option(SHOW_CHECKBOXES_MODE) || !support.touch) {
                                $table.on(eventUtils.addNamespace(holdEvent.name, "dxDataGridRowsView"), "." + DATAGRID_DATA_ROW_CLASS, that.createAction(function(e) {
                                    processLongTap(that.component, e.jQueryEvent);
                                    e.jQueryEvent.stopPropagation()
                                }))
                            }
                            $table.on("mousedown selectstart", that.createAction(function(e) {
                                var event = e.jQueryEvent;
                                if (event.shiftKey) {
                                    event.preventDefault()
                                }
                            }))
                        }
                        return $table
                    },
                    _createRow: function(row) {
                        var isSelected, $row = this.callBase(row);
                        if (row) {
                            isSelected = !!row.isSelected;
                            if (isSelected) {
                                $row.addClass(DATAGRID_ROW_SELECTION_CLASS)
                            }
                            this.setAria("selected", isSelected, $row)
                        }
                        return $row
                    },
                    _rowClick: function(e) {
                        var that = this,
                            jQueryEvent = e.jQueryEvent,
                            isSelectionDisabled = $(jQueryEvent.target).closest("." + DATAGRID_SELECTION_DISABLED_CLASS).length;
                        if (!that.isClickableElement($(jQueryEvent.target))) {
                            if (!isSelectionDisabled && ("multiple" !== that.option(SELECTION_MODE) || "always" !== that.option(SHOW_CHECKBOXES_MODE))) {
                                if (that.getController("selection").changeItemSelection(e.rowIndex, {
                                        control: jQueryEvent.ctrlKey,
                                        shift: jQueryEvent.shiftKey
                                    })) {
                                    jQueryEvent.preventDefault();
                                    e.handled = true
                                }
                            }
                            that.callBase(e)
                        }
                    },
                    isClickableElement: function($target) {
                        var isCommandSelect = $target.closest("." + DATAGRID_COMMAND_SELECT_CLASS).length;
                        return !!isCommandSelect
                    },
                    _renderCore: function(change) {
                        this.callBase(change);
                        this._updateCheckboxesClass()
                    },
                    _updateCheckboxesClass: function() {
                        var tableElements = this.getTableElements(),
                            selectionController = this.getController("selection"),
                            isCheckBoxesHidden = selectionController.isSelectColumnVisible() && !selectionController.isSelectionWithCheckboxes();
                        $.each(tableElements, function(_, tableElement) {
                            $(tableElement).toggleClass(DATAGRID_CHECKBOXES_HIDDEN_CLASS, isCheckBoxesHidden)
                        })
                    }
                }
            }
        }
    })
});
