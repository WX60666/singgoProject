/** 
 * DevExtreme (ui/tree_view.js)
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
        messageLocalization = require("../localization/message"),
        clickEvent = require("../events/click"),
        commonUtils = require("../core/utils/common"),
        registerComponent = require("../core/component_registrator"),
        CheckBox = require("./check_box"),
        HierarchicalCollectionWidget = require("./hierarchical_collection/ui.hierarchical_collection_widget"),
        eventUtils = require("../events/utils"),
        pointerEvents = require("../events/pointer"),
        dblclickEvent = require("../events/dblclick"),
        fx = require("../animation/fx"),
        Scrollable = require("./scroll_view/ui.scrollable").default,
        LoadIndicator = require("./load_indicator");
    var WIDGET_CLASS = "dx-treeview",
        NODE_CONTAINER_CLASS = "dx-treeview-node-container",
        OPENED_NODE_CONTAINER_CLASS = "dx-treeview-node-container-opened",
        NODE_CLASS = "dx-treeview-node",
        ITEM_CLASS = "dx-treeview-item",
        ITEM_WITH_CHECKBOX_CLASS = "dx-treeview-item-with-checkbox",
        ITEM_DATA_KEY = "dx-treeview-item-data",
        IS_LEAF = "dx-treeview-node-is-leaf",
        TOGGLE_ITEM_VISIBILITY_CLASS = "dx-treeview-toggle-item-visibility",
        TOGGLE_ITEM_VISIBILITY_OPENED_CLASS = "dx-treeview-toggle-item-visibility-opened",
        LOAD_INDICATOR_CLASS = "dx-treeview-loadindicator",
        LOAD_INDICATOR_WRAPPER_CLASS = "dx-treeview-loadindicator-wrapper",
        NODE_LOAD_INDICATOR_CLASS = "dx-treeview-node-loadindicator",
        SELECT_ALL_ITEM_CLASS = "dx-treeview-select-all-item",
        DISABLED_STATE_CLASS = "dx-state-disabled",
        SELECTED_ITEM_CLASS = "dx-state-selected",
        DATA_ITEM_ID = "data-item-id";
    var TreeView = HierarchicalCollectionWidget.inherit({
        _supportedKeys: function(e) {
            var click = function(e) {
                var $itemElement = this.option("focusedElement");
                if (!$itemElement) {
                    return
                }
                e.target = $itemElement;
                e.currentTarget = $itemElement;
                this._itemClickHandler(e, $itemElement.find(">." + ITEM_CLASS))
            };
            var select = function(e) {
                e.preventDefault();
                this._changeCheckBoxState(this.option("focusedElement"))
            };
            var toggleExpandedNestedItems = function(state, e) {
                if (!this.option("expandAllEnabled")) {
                    return
                }
                e.preventDefault();
                var $rootElement = this.option("focusedElement");
                if (!$rootElement) {
                    return
                }
                var rootItem = this._getItemData($rootElement.find("." + ITEM_CLASS));
                this._toggleExpandedNestedItems([rootItem], state)
            };
            return $.extend(this.callBase(), {
                enter: this._showCheckboxes() ? select : click,
                space: this._showCheckboxes() ? select : click,
                asterisk: $.proxy(toggleExpandedNestedItems, this, true),
                minus: $.proxy(toggleExpandedNestedItems, this, false)
            })
        },
        _changeCheckBoxState: function($element) {
            var checkboxInstance = this._getCheckBoxInstance($element),
                currentState = checkboxInstance.option("value");
            if (!checkboxInstance.option("disabled")) {
                this._updateItemSelection(!currentState, $element.find("." + ITEM_CLASS).get(0))
            }
        },
        _toggleExpandedNestedItems: function(items, state) {
            if (!items) {
                return
            }
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i],
                    node = this._dataAdapter.getNodeByItem(item);
                this._toggleExpandedState(node, state);
                this._toggleExpandedNestedItems(item.items, state)
            }
        },
        _getNodeElement: function(node) {
            return this.element().find("[" + DATA_ITEM_ID + "='" + commonUtils.normalizeKey(node.internalFields.key) + "']")
        },
        _activeStateUnit: "." + ITEM_CLASS,
        _widgetClass: function() {
            return WIDGET_CLASS
        },
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                animationEnabled: true,
                dataStructure: "tree",
                expandAllEnabled: false,
                hasItemsExpr: "hasItems",
                selectNodesRecursive: true,
                expandNodesRecursive: true,
                showCheckBoxesMode: "none",
                selectAllText: messageLocalization.format("dxList-selectAll"),
                onItemSelectionChanged: null,
                onItemExpanded: null,
                onItemCollapsed: null,
                scrollDirection: "vertical",
                virtualModeEnabled: false,
                rootValue: 0,
                searchValue: "",
                focusStateEnabled: false,
                selectionMode: "multiple",
                expandEvent: "dblclick",
                selectByClick: false
            })
        },
        _setDeprecatedOptions: function() {
            this.callBase();
            $.extend(this._deprecatedOptions, {
                showCheckBoxes: {
                    since: "15.2",
                    message: "use 'showCheckBoxesMode' option instead"
                },
                selectAllEnabled: {
                    since: "15.2",
                    message: "use 'showCheckBoxesMode' option instead"
                },
                onItemSelected: {
                    since: "16.1",
                    alias: "onItemSelectionChanged"
                }
            })
        },
        _initSelectedItems: $.noop,
        _syncSelectionOptions: $.noop,
        _fireSelectionChanged: function() {
            var selectionChangePromise = this._selectionChangePromise;
            $.when(selectionChangePromise).done($.proxy(function() {
                this._createActionByOption("onSelectionChanged", {
                    excludeValidators: ["disabled", "readOnly"]
                })()
            }, this))
        },
        _checkBoxModeChange: function(value, previousValue) {
            if ("none" === previousValue || "none" === value) {
                this.repaint();
                return
            }
            var selectAllExists = this._$selectAllItem && this._$selectAllItem.length;
            switch (value) {
                case "selectAll":
                    !selectAllExists && this._renderSelectAllItem();
                    break;
                case "normal":
                    if (selectAllExists) {
                        this._$selectAllItem.remove();
                        delete this._$selectAllItem
                    }
            }
        },
        _removeSelection: function() {
            var that = this;
            $.each(this._dataAdapter.getFullData(), function(_, node) {
                if (!that._hasChildren(node)) {
                    return
                }
                that._dataAdapter.toggleSelection(node.internalFields.key, false, true)
            })
        },
        _optionChanged: function(args) {
            var name = args.name,
                value = args.value,
                previousValue = args.previousValue;
            switch (name) {
                case "showCheckBoxes":
                    this.option("showCheckBoxesMode", value ? "normal" : "none");
                    break;
                case "selectAllEnabled":
                    this.option("showCheckBoxesMode", value ? "selectAll" : "normal");
                    break;
                case "selectAllText":
                    if (this._$selectAllItem) {
                        this._$selectAllItem.dxCheckBox("instance").option("text", value)
                    }
                    break;
                case "showCheckBoxesMode":
                    this._checkBoxModeChange(value, previousValue);
                    break;
                case "scrollDirection":
                    this._scrollableContainer.option("direction", value);
                    break;
                case "items":
                    delete this._$selectAllItem;
                    this.callBase(args);
                    break;
                case "dataSource":
                    this.callBase(args);
                    this._initDataAdapter();
                    this._filter = {};
                    break;
                case "hasItemsExpr":
                    this._initAccessors();
                    this.repaint();
                    break;
                case "expandEvent":
                    this._toggleExpandEvent(args.previousValue, args.value);
                    break;
                case "dataStructure":
                case "rootValue":
                case "searchValue":
                    if ((!value.length || value < previousValue) && "none" !== this.option("showCheckBoxesMode")) {
                        this._removeSelection()
                    }
                    this._initDataAdapter();
                    this.repaint();
                    break;
                case "selectNodesRecursive":
                case "expandNodesRecursive":
                case "onItemSelectionChanged":
                case "onItemExpanded":
                case "onItemCollapsed":
                case "expandAllEnabled":
                case "animationEnabled":
                case "virtualModeEnabled":
                case "selectByClick":
                    break;
                default:
                    this.callBase(args)
            }
        },
        _initDataSource: function() {
            var that = this,
                filter = this._filter;
            this.callBase();
            if (this._isVirtualMode()) {
                if (!filter.custom) {
                    filter.custom = this._dataSource.filter()
                }
                if (!filter.internal) {
                    filter.internal = [this.option("parentIdExpr"), this.option("rootValue")]
                }
                var resultFilter = this._combineFilter();
                this._dataSource.filter(resultFilter);
                this._dataSource.on("loadingChanged", function(isLoading) {
                    if (isLoading && !this.isLoaded()) {
                        that.option("items", []);
                        var $wrapper = $("<div>", {
                                "class": LOAD_INDICATOR_WRAPPER_CLASS
                            }),
                            $loadIndicator = $("<div>", {
                                "class": LOAD_INDICATOR_CLASS
                            }).appendTo($wrapper);
                        that._createComponent($loadIndicator, LoadIndicator, {});
                        that.itemsContainer().append($wrapper);
                        that._dataSource.filter() !== resultFilter && that._dataSource.filter([])
                    }
                })
            }
        },
        _combineFilter: function() {
            if (!this._filter.custom || !this._filter.custom.length) {
                return this._filter.internal
            }
            return [this._filter.custom, this._filter.internal]
        },
        _dataSourceLoadErrorHandler: function() {
            this._renderEmptyMessage()
        },
        _init: function() {
            this._filter = {};
            this.callBase();
            this._initStoreChangeHandlers();
            this._initCheckBoxesMode()
        },
        _dataSourceChangedHandler: function(newItems) {
            var isInArray = $.inArray(newItems[0], this.option("items")) + 1;
            if (!this._initialized || !this._isVirtualMode() || !this.option("items").length) {
                this.option("items", newItems);
                return
            }
            if (!isInArray) {
                this.option().items = this.option("items").concat(newItems);
                this._initDataAdapter()
            }!this._contentAlreadyRendered && this._renderContent()
        },
        _initStoreChangeHandlers: function() {
            if ("plain" !== this.option("dataStructure")) {
                return
            }
            var that = this;
            this._dataSource && this._dataSource.store().on("inserted", function(newItem) {
                that.option().items = that.option("items").concat(newItem);
                that._dataAdapter.addItem(newItem);
                if (!that._isFiltered(newItem)) {
                    return
                }
                that._updateLevel(that._parentIdGetter(newItem))
            }).on("removed", function(removedKey) {
                var node = that._dataAdapter.getNodeByKey(removedKey);
                that.option("items")[that._dataAdapter.getIndexByKey(node.internalFields.key)] = 0;
                that._markChildrenItemsToRemove(node);
                that._removeItems();
                that._dataAdapter.removeItem(removedKey);
                that._updateLevel(that._parentIdGetter(node))
            })
        },
        _markChildrenItemsToRemove: function(node) {
            var that = this,
                keys = node.internalFields.childrenKeys;
            $.each(keys, function(_, key) {
                that.option("items")[that._dataAdapter.getIndexByKey(key)] = 0;
                that._markChildrenItemsToRemove(that._dataAdapter.getNodeByKey(key))
            })
        },
        _removeItems: function() {
            var that = this,
                counter = 0,
                items = $.extend(true, [], this.option("items"));
            $.each(items, function(index, item) {
                if (!item) {
                    that.option("items").splice(index - counter, 1);
                    counter++
                }
            })
        },
        _isFiltered: function(item) {
            var value = this.option("searchValue"),
                reg = new RegExp(value, "i");
            return reg.test(this._displayGetter(item))
        },
        _updateLevel: function(parentId) {
            var $container = this._getContainerByParentKey(parentId);
            this._renderItems($container, this._dataAdapter.getChildrenNodes(parentId))
        },
        _getOldContainer: function($itemElement) {
            if ($itemElement.length) {
                return $itemElement.find(" > ." + NODE_CONTAINER_CLASS)
            }
            if (this._scrollableContainer) {
                return this._scrollableContainer.content().children()
            }
            return $()
        },
        _getContainerByParentKey: function(parentId) {
            var $container, node = this._dataAdapter.getNodeByKey(parentId),
                $itemElement = node ? this._getNodeElement(node) : [];
            this._getOldContainer($itemElement).remove();
            $container = this._renderNodeContainer($itemElement);
            if (this._isRootLevel(parentId)) {
                if (!this._scrollableContainer) {
                    this._renderScrollableContainer()
                }
                this._scrollableContainer.content().append($container)
            }
            return $container
        },
        _isRootLevel: function(parentId) {
            return parentId === this.option("rootValue")
        },
        _getAccessors: function() {
            return ["key", "display", "selected", "expanded", "items", "parentId", "disabled", "hasItems"]
        },
        _getDataAdapterOptions: function() {
            return {
                rootValue: this.option("rootValue"),
                multipleSelection: !this._isSingleSelection(),
                recursiveSelection: this._isRecursiveSelection(),
                recursiveExpansion: this.option("expandNodesRecursive"),
                searchValue: this.option("searchValue"),
                dataType: this.option("dataStructure")
            }
        },
        _render: function() {
            this.callBase();
            this.setAria("role", "tree")
        },
        _renderContentImpl: function() {
            if (!this.option("items") || !this.option("items").length) {
                return
            }
            var $nodeContainer = this._renderNodeContainer();
            this._renderScrollableContainer();
            this._scrollableContainer.content().append($nodeContainer);
            this._renderItems($nodeContainer, this._dataAdapter.getRootNodes());
            this._toggleExpandEvent(null, this.option("expandEvent"));
            if (this._selectAllEnabled()) {
                this._renderSelectAllItem($nodeContainer)
            }
        },
        _isVirtualMode: function() {
            return this.option("virtualModeEnabled") && this._isDataStructurePlain() && this.option("dataSource")
        },
        _isDataStructurePlain: function() {
            return "plain" === this.option("dataStructure")
        },
        _fireContentReadyAction: function() {
            this.callBase();
            if (this._scrollableContainer) {
                this._scrollableContainer.update()
            }
        },
        _renderScrollableContainer: function() {
            this._scrollableContainer = this._createComponent($("<div>").appendTo(this.element()), Scrollable, {
                direction: this.option("scrollDirection"),
                useKeyboard: false
            })
        },
        _renderNodeContainer: function($parent) {
            var $container = $("<ul>").addClass(NODE_CONTAINER_CLASS);
            this.setAria("role", "group", $container);
            if ($parent && $parent.length) {
                var itemData = this._getItemData($parent.find("> ." + ITEM_CLASS));
                if (this._expandedGetter(itemData)) {
                    $container.addClass(OPENED_NODE_CONTAINER_CLASS)
                }
                $container.appendTo($parent)
            }
            return $container
        },
        _createDOMElement: function($nodeContainer, node) {
            var $node = $("<li>").addClass(NODE_CLASS).attr(DATA_ITEM_ID, commonUtils.normalizeKey(node.internalFields.key)).prependTo($nodeContainer);
            this.setAria({
                role: "treeitem",
                label: this._displayGetter(node.internalFields.item) || "",
                expanded: node.internalFields.expanded || false,
                level: this._getLevel($nodeContainer)
            }, $node);
            return $node
        },
        _getLevel: function($nodeContainer) {
            var parent = $nodeContainer.parent();
            return parent.hasClass("dx-scrollable-content") ? 1 : parseInt(parent.attr("aria-level")) + 1
        },
        _showCheckboxes: function() {
            return "none" !== this.option("showCheckBoxesMode")
        },
        _selectAllEnabled: function() {
            return "selectAll" === this.option("showCheckBoxesMode")
        },
        _initCheckBoxesMode: function() {
            if (this._showCheckboxes()) {
                return
            }
            this._suppressDeprecatedWarnings();
            var showCheckboxes = this.option("showCheckBoxes"),
                selectAllEnabled = this.option("selectAllEnabled");
            this._resumeDeprecatedWarnings();
            this.option("showCheckBoxesMode", showCheckboxes ? selectAllEnabled ? "selectAll" : "normal" : "none")
        },
        _renderItems: function($nodeContainer, nodes) {
            var length = nodes.length - 1;
            for (var i = length; i >= 0; i--) {
                this._renderItem(nodes[i], $nodeContainer)
            }
            this._renderFocusTarget()
        },
        _renderItem: function(node, $nodeContainer) {
            var $node = this._createDOMElement($nodeContainer, node),
                nodeData = node.internalFields;
            this._showCheckboxes() && this._renderCheckBox($node, node);
            this.setAria("selected", nodeData.selected, $node);
            this._toggleSelectedClass($node, nodeData.selected);
            this.callBase(nodeData.key, nodeData.item, $node);
            if (false !== nodeData.item.visible) {
                this._renderChildren($node, node)
            }
        },
        _renderChildren: function($node, node) {
            if (!this._hasChildren(node)) {
                this._addLeafClass($node);
                return
            }
            this._renderToggleItemVisibilityIcon($node, node);
            this._renderSublevel($node, node)
        },
        _hasChildren: function(node) {
            if (this._isVirtualMode()) {
                return false !== this._hasItemsGetter(node.internalFields.item)
            }
            return this.callBase(node)
        },
        _renderSublevel: function($node, node) {
            var $nestedNodeContainer = this._renderNodeContainer($node, node);
            if (!node.internalFields.expanded) {
                return
            }
            var childrenNodes = this._getChildNodes(node);
            if (childrenNodes.length) {
                this._renderItems($nestedNodeContainer, childrenNodes)
            } else {
                this._renderNestedItems($nestedNodeContainer)
            }
            $nestedNodeContainer.addClass(OPENED_NODE_CONTAINER_CLASS)
        },
        _executeItemRenderAction: function(index, itemData, itemElement) {
            var node = this._dataAdapter.getNodeByItem(itemData);
            this._getItemRenderAction()({
                itemElement: itemElement,
                itemIndex: index,
                itemData: itemData,
                node: node
            })
        },
        _addLeafClass: function($node) {
            $node.addClass(IS_LEAF)
        },
        _toggleExpandEvent: function(detached, attached) {
            var that = this,
                detachedEventName = this._getEventNameByOption(detached) + "_expand",
                attachedEventName = this._getEventNameByOption(attached) + "_expand",
                $itemsContainer = this._itemContainer(),
                itemSelector = this._itemSelector();
            detachedEventName && $itemsContainer.off(detachedEventName, itemSelector);
            attachedEventName && $itemsContainer.on(attachedEventName, itemSelector, function(e) {
                that._toggleExpandedState(e.currentTarget, void 0, e)
            })
        },
        _getEventNameByOption: function(name) {
            switch (name) {
                case "click":
                    return eventUtils.addNamespace(clickEvent.name, this.NAME);
                case "dblclick":
                    return eventUtils.addNamespace(dblclickEvent.name, this.NAME);
                default:
                    return false
            }
        },
        _getNodeByItemElement: function(itemElement) {
            if (commonUtils.isPrimitive(itemElement)) {
                return this._dataAdapter.getNodeByKey(itemElement)
            }
            itemElement = $(itemElement).get(0);
            if (!itemElement) {
                return null
            }
            if (itemElement.nodeType) {
                return this._dataAdapter.getNodeByItem(this._getItemData(itemElement))
            }
            if (itemElement.internalFields) {
                return itemElement
            }
            return this._dataAdapter.getNodeByItem(itemElement)
        },
        _toggleExpandedState: function(itemElement, state, e) {
            var node = this._getNodeByItemElement(itemElement),
                currentState = node.internalFields.expanded;
            if (node.internalFields.disabled || currentState === state) {
                return
            }
            if (this._isVirtualMode()) {
                var $node = this._getNodeElement(node);
                this._hasChildren(node) && this._createLoadIndicator($node)
            }
            if (!commonUtils.isDefined(state)) {
                state = !currentState
            }
            this._dataAdapter.toggleExpansion(node.internalFields.key, state);
            node.internalFields.expanded = state;
            if (this._isVirtualMode() && !this._hasChildren(node)) {
                return
            }
            this._updateExpandedItemsUI(node, state, e)
        },
        _createLoadIndicator: function($node) {
            var $icon = $node.find(">." + TOGGLE_ITEM_VISIBILITY_CLASS),
                $nodeContainer = $node.find(" > ." + NODE_CONTAINER_CLASS);
            if ($icon.hasClass(TOGGLE_ITEM_VISIBILITY_OPENED_CLASS) || $nodeContainer.not(":empty").length) {
                return
            }
            this._createComponent($("<div>", {
                "class": NODE_LOAD_INDICATOR_CLASS
            }), LoadIndicator, {}).element().appendTo($node);
            $icon.hide()
        },
        _renderToggleItemVisibilityIcon: function($node, node) {
            var $icon = $("<div>").addClass(TOGGLE_ITEM_VISIBILITY_CLASS).appendTo($node);
            if (node.internalFields.expanded) {
                $icon.addClass(TOGGLE_ITEM_VISIBILITY_OPENED_CLASS);
                $node.parent().addClass(OPENED_NODE_CONTAINER_CLASS)
            }
            if (node.internalFields.disabled) {
                $icon.addClass(DISABLED_STATE_CLASS)
            }
            this._renderToggleItemVisibilityIconClick($icon, node)
        },
        _renderToggleItemVisibilityIconClick: function($icon, node) {
            var eventName = eventUtils.addNamespace(clickEvent.name, this.NAME),
                that = this;
            $icon.off(eventName).on(eventName, function(e) {
                that._toggleExpandedState(node, void 0, e)
            })
        },
        _updateExpandedItemsUI: function(node, state, e) {
            var $nodeContainer, that = this,
                $node = that._getNodeElement(node),
                $icon = $node.find(">." + TOGGLE_ITEM_VISIBILITY_CLASS);
            $icon.toggleClass(TOGGLE_ITEM_VISIBILITY_OPENED_CLASS, state);
            if (!state) {
                that._updateExpandedItem(node, state, e);
                return
            }
            $nodeContainer = $node.find(" > ." + NODE_CONTAINER_CLASS);
            that._renderNestedItems($nodeContainer).done(function(itemsLoaded) {
                if (itemsLoaded.wereLoaded) {
                    itemsLoaded.newLoaded && that._fireContentReadyAction();
                    that._updateExpandedItem(node, state, e)
                }
            })
        },
        _updateExpandedItem: function(node, state, e) {
            var $node = this._getNodeElement(node),
                $nodeContainer = $node.find(" > ." + NODE_CONTAINER_CLASS);
            this._animateNodeContainer($nodeContainer, state);
            this.setAria("expanded", state, $node);
            this._fireExpandedStateUpdatedEvt(state, node, e)
        },
        _animateNodeContainer: function($nodeContainer, state) {
            var nodeHeight = $nodeContainer.height();
            fx.stop($nodeContainer, true);
            fx.animate($nodeContainer, {
                type: "custom",
                duration: this.option("animationEnabled") ? 400 : 0,
                from: {
                    "max-height": state ? 0 : nodeHeight
                },
                to: {
                    "max-height": state ? nodeHeight : 0
                },
                start: function() {
                    $nodeContainer.addClass(OPENED_NODE_CONTAINER_CLASS)
                },
                complete: $.proxy(function() {
                    $nodeContainer.css("max-height", "none");
                    $nodeContainer.toggleClass(OPENED_NODE_CONTAINER_CLASS, state);
                    this._scrollableContainer.update()
                }, this)
            })
        },
        _fireExpandedStateUpdatedEvt: function(isExpanded, node, e) {
            var target, optionName = isExpanded ? "onItemExpanded" : "onItemCollapsed";
            if (!this.option(optionName) || !this._hasChildren(node)) {
                return
            }
            if (commonUtils.isDefined(e)) {
                this._itemJQueryEventHandler(e, optionName, {
                    node: this._dataAdapter.getPublicNode(node)
                })
            } else {
                target = this._getNodeElement(node);
                this._itemEventHandler(target, optionName, {
                    jQueryEvent: e,
                    node: this._dataAdapter.getPublicNode(node)
                })
            }
        },
        _renderNestedItems: function($container) {
            var deferred = $.Deferred();
            if (!$container.is(":empty")) {
                return deferred.resolve({
                    wereLoaded: true
                }).promise()
            }
            if (this._isVirtualMode()) {
                this._renderVirtualNodes($container).done(function(items) {
                    deferred.resolve({
                        wereLoaded: items && items.length,
                        newLoaded: true
                    })
                })
            } else {
                var itemElement = $container.parent().find(">." + ITEM_CLASS),
                    node = this._getNodeByItemElement(itemElement),
                    nestedItems = this._getChildNodes(node);
                this._renderItems($container, nestedItems);
                deferred.resolve({
                    wereLoaded: true,
                    newLoaded: true
                })
            }
            return deferred.promise()
        },
        _renderVirtualNodes: function($container) {
            var $node = $container.parent(),
                node = this._getNodeByItemElement($node.find(">." + ITEM_CLASS)),
                that = this;
            this._filter.internal = [this.option("parentIdExpr"), node.internalFields.key];
            this._dataSource.filter(this._combineFilter());
            return this._dataSource.load().done(function(data) {
                var virtualNodes = that._getVirtualNodes(data);
                that._renderItems($container, virtualNodes);
                if (virtualNodes.length && !node.internalFields.selected) {
                    var $firstChild = that._getNodeElement(virtualNodes[0]);
                    that._updateParentsState(virtualNodes[0], $firstChild)
                }
                that._normalizeIconState($node, virtualNodes.length)
            })
        },
        _getVirtualNodes: function(items) {
            var that = this,
                virtualNodes = [];
            $.each(items, function(_, item) {
                var virtualNode = that._dataAdapter.getNodeByItem(item);
                virtualNode && virtualNodes.push(virtualNode)
            });
            return virtualNodes
        },
        _normalizeIconState: function($node, hasNewItems) {
            var $icon, $loadIndicator = $node.find(".dx-loadindicator");
            $loadIndicator.length && LoadIndicator.getInstance($loadIndicator).option("visible", false);
            if (hasNewItems) {
                $icon = $node.find("." + TOGGLE_ITEM_VISIBILITY_CLASS);
                $icon.show();
                return
            }
            $node.find("." + TOGGLE_ITEM_VISIBILITY_CLASS).removeClass(TOGGLE_ITEM_VISIBILITY_CLASS);
            $node.addClass(IS_LEAF)
        },
        _renderContent: function() {
            this._renderEmptyMessage();
            var items = this.option("items");
            if (items && items.length) {
                this._contentAlreadyRendered = true
            }
            this.callBase()
        },
        _renderSelectAllItem: function($container) {
            $container = $container || this.element().find("." + NODE_CONTAINER_CLASS).first();
            this._$selectAllItem = $("<div>").addClass(SELECT_ALL_ITEM_CLASS);
            var value = this._dataAdapter.isAllSelected();
            this._createComponent(this._$selectAllItem, CheckBox, {
                value: value,
                text: this.option("selectAllText"),
                onValueChanged: $.proxy(this._toggleSelectAll, this)
            });
            this._toggleSelectedClass(this._$selectAllItem, value);
            $container.before(this._$selectAllItem)
        },
        _toggleSelectAll: function(args) {
            this._dataAdapter.toggleSelectAll(args.value);
            this._updateItemsUI();
            this._fireSelectionChanged()
        },
        _renderCheckBox: function($node, node) {
            $node.addClass(ITEM_WITH_CHECKBOX_CLASS);
            var $checkbox = $("<div>").appendTo($node);
            this._createComponent($checkbox, CheckBox, {
                value: node.internalFields.selected,
                onValueChanged: $.proxy(this._changeCheckboxValue, this),
                focusStateEnabled: false,
                disabled: this._disabledGetter(node)
            })
        },
        _toggleSelectedClass: function($node, value) {
            $node.toggleClass(SELECTED_ITEM_CLASS, !!value)
        },
        _toggleNodeDisabledState: function(node, state) {
            var $node = this._getNodeElement(node),
                $item = $node.find("." + ITEM_CLASS).eq(0);
            this._dataAdapter.toggleNodeDisabledState(node.internalFields.key, state);
            $item.toggleClass(DISABLED_STATE_CLASS, !!state);
            if (this._showCheckboxes()) {
                var checkbox = this._getCheckBoxInstance($node);
                checkbox.option("disabled", !!state)
            }
        },
        _itemOptionChanged: function(item, property, value) {
            var node = this._dataAdapter.getNodeByItem(item);
            switch (property) {
                case this.option("disabledExpr"):
                    this._toggleNodeDisabledState(node, value)
            }
        },
        _changeCheckboxValue: function(e) {
            var $node = e.element.parent("." + NODE_CLASS),
                item = this._getItemData($node.find("> ." + ITEM_CLASS)),
                node = this._dataAdapter.getNodeByItem(item),
                value = e.value;
            if (node.internalFields.selected === value) {
                return
            }
            this._updateItemSelection(value, item, e.jQueryEvent)
        },
        _isSingleSelection: function() {
            return "single" === this.option("selectionMode")
        },
        _isRecursiveSelection: function() {
            return this.option("selectNodesRecursive") && "single" !== this.option("selectionMode")
        },
        _updateItemSelection: function(value, itemElement, jQueryEvent) {
            var node = this._getNodeByItemElement(itemElement);
            if (!node || node.internalFields.selected === value) {
                return
            }
            if (this._isSingleSelection()) {
                this._toggleSelectAll({
                    value: false
                })
            }
            this._dataAdapter.toggleSelection(node.internalFields.key, value);
            this._updateItemsUI();
            var initiator = jQueryEvent || this._findItemElementByItem(node.internalFields.item),
                handler = jQueryEvent ? this._itemJQueryEventHandler : this._itemEventHandler;
            handler.call(this, initiator, "onItemSelectionChanged", {
                node: this._dataAdapter.getPublicNode(node),
                itemData: node.internalFields.item
            });
            this._fireSelectionChanged()
        },
        _getCheckBoxInstance: function($node) {
            return $node.find("> .dx-checkbox").dxCheckBox("instance")
        },
        _updateItemsUI: function() {
            var that = this;
            $.each(this._dataAdapter.getData(), function(_, node) {
                var $node = that._getNodeElement(node),
                    nodeSelection = node.internalFields.selected;
                if (!$node.length) {
                    return
                }
                that._toggleSelectedClass($node, nodeSelection);
                that.setAria("selected", nodeSelection, $node);
                if (that._showCheckboxes()) {
                    var checkbox = that._getCheckBoxInstance($node);
                    checkbox.option("value", nodeSelection)
                }
            });
            if (this._selectAllEnabled()) {
                this._$selectAllItem.dxCheckBox("instance").option("value", this._dataAdapter.isAllSelected())
            }
        },
        _updateParentsState: function(node, $node) {
            var parentValue, $parentNode, parentNode = this._dataAdapter.getNodeByKey(node.internalFields.parentKey);
            if ($node && this._showCheckboxes()) {
                parentValue = parentNode.internalFields.selected;
                $parentNode = $($node.parents("." + NODE_CLASS)[0]);
                this._getCheckBoxInstance($parentNode).option("value", parentValue);
                this._toggleSelectedClass($parentNode, parentValue)
            }
            if (parentNode.internalFields.parentKey !== this.option("rootValue")) {
                this._updateParentsState(parentNode, $parentNode)
            }
        },
        _itemEventHandlerImpl: function(initiator, action, actionArgs) {
            var $itemElement = $(initiator).closest("." + NODE_CLASS).find("> ." + ITEM_CLASS);
            return action($.extend(this._extendActionArgs($itemElement), actionArgs))
        },
        _itemContextMenuHandler: function(e) {
            this._createEventHandler("onItemContextMenu", e)
        },
        _itemHoldHandler: function(e) {
            this._createEventHandler("onItemHold", e)
        },
        _createEventHandler: function(eventName, e) {
            var itemData = this._getItemData(e.currentTarget),
                node = this._dataAdapter.getNodeByItem(itemData);
            this._itemJQueryEventHandler(e, eventName, {
                node: this._dataAdapter.getPublicNode(node)
            })
        },
        _itemClass: function() {
            return ITEM_CLASS
        },
        _itemDataKey: function() {
            return ITEM_DATA_KEY
        },
        _selectionEnabled: function() {
            return true
        },
        _attachClickEvent: function() {
            var that = this,
                itemSelector = that._itemSelector(),
                eventName = eventUtils.addNamespace(clickEvent.name, that.NAME),
                pointerDownEvent = eventUtils.addNamespace(pointerEvents.down, this.NAME);
            that._itemContainer().off(eventName, itemSelector).off(pointerDownEvent, itemSelector).on(eventName, itemSelector, function(e) {
                that._itemClickHandler(e, $(this))
            }).on(pointerDownEvent, itemSelector, function(e) {
                that._itemPointerDownHandler(e)
            })
        },
        _itemClickHandler: function(e, $item) {
            var itemData = this._getItemData($item),
                node = this._dataAdapter.getNodeByItem(itemData);
            this._itemJQueryEventHandler(e, "onItemClick", {
                node: this._dataAdapter.getPublicNode(node)
            });
            if (this.option("selectByClick")) {
                this._updateItemSelection(!node.internalFields.selected, itemData, e)
            }
        },
        _updateSelectionToFirstItem: function($items, startIndex) {
            var itemIndex = startIndex;
            while (itemIndex >= 0) {
                var $item = $($items[itemIndex]);
                this._updateItemSelection(true, $item.find("." + ITEM_CLASS).get(0));
                itemIndex--
            }
        },
        _updateSelectionToLastItem: function($items, startIndex) {
            var itemIndex = startIndex,
                length = $items.length;
            while (itemIndex < length) {
                var $item = $($items[itemIndex]);
                this._updateItemSelection(true, $item.find("." + ITEM_CLASS).get(0));
                itemIndex++
            }
        },
        _focusInHandler: function(e) {
            var currentTarget = e.currentTarget,
                focusTargets = this._focusTarget();
            if ($.inArray(currentTarget, focusTargets) !== -1) {
                this._toggleFocusClass(true, currentTarget)
            }
            if (this.option("focusedElement")) {
                this._setFocusedItem(this.option("focusedElement"));
                return
            }
            var $activeItem = this._getActiveItem();
            this.option("focusedElement", $activeItem.closest("." + NODE_CLASS))
        },
        _setFocusedItem: function($target) {
            if (!$target || !$target.length) {
                return
            }
            if (!$target.children().hasClass(DISABLED_STATE_CLASS)) {
                this.callBase($target)
            }
            this._scrollableContainer.scrollToElement($target.find("." + ITEM_CLASS).first())
        },
        _itemPointerDownHandler: function(e) {
            if (!this.option("focusStateEnabled")) {
                return
            }
            var $target = $(e.target).closest("." + NODE_CLASS);
            if (!$target.hasClass(NODE_CLASS)) {
                return
            }
            var itemElement = $target.hasClass(DISABLED_STATE_CLASS) ? null : $target;
            this.option("focusedElement", itemElement)
        },
        _findNonDisabledNodes: function($nodes) {
            return $nodes.not(function() {
                return $(this).find(">." + ITEM_CLASS).hasClass(DISABLED_STATE_CLASS)
            })
        },
        _moveFocus: function(location, e) {
            var FOCUS_UP = "up",
                FOCUS_DOWN = "down",
                FOCUS_FIRST = "first",
                FOCUS_LAST = "last",
                FOCUS_LEFT = this.option("rtlEnabled") ? "right" : "left",
                FOCUS_RIGHT = this.option("rtlEnabled") ? "left" : "right";
            this.element().find("." + NODE_CONTAINER_CLASS).each(function() {
                fx.stop(this, true)
            });
            var $items = this._findNonDisabledNodes(this._nodeElements());
            if (!$items || !$items.length) {
                return
            }
            switch (location) {
                case FOCUS_UP:
                    var $prevItem = this._prevItem($items);
                    this.option("focusedElement", $prevItem);
                    if (e.shiftKey && this._showCheckboxes()) {
                        this._updateItemSelection(true, $prevItem.find("." + ITEM_CLASS).get(0))
                    }
                    break;
                case FOCUS_DOWN:
                    var $nextItem = this._nextItem($items);
                    this.option("focusedElement", $nextItem);
                    if (e.shiftKey && this._showCheckboxes()) {
                        this._updateItemSelection(true, $nextItem.find("." + ITEM_CLASS).get(0))
                    }
                    break;
                case FOCUS_FIRST:
                    var $firstItem = $items.first();
                    if (e.shiftKey && this._showCheckboxes()) {
                        this._updateSelectionToFirstItem($items, $items.index(this._prevItem($items)))
                    }
                    this.option("focusedElement", $firstItem);
                    break;
                case FOCUS_LAST:
                    var $lastItem = $items.last();
                    if (e.shiftKey && this._showCheckboxes()) {
                        this._updateSelectionToLastItem($items, $items.index(this._nextItem($items)))
                    }
                    this.option("focusedElement", $lastItem);
                    break;
                case FOCUS_RIGHT:
                    this._expandFocusedContainer();
                    break;
                case FOCUS_LEFT:
                    this._collapseFocusedContainer();
                    break;
                default:
                    this.callBase.apply(this, arguments);
                    return
            }
        },
        _nodeElements: function() {
            return this.element().find("." + NODE_CLASS).not(":hidden")
        },
        _expandFocusedContainer: function() {
            var $focusedItem = this.option("focusedElement");
            if (!$focusedItem || $focusedItem.hasClass(IS_LEAF)) {
                return
            }
            var $node = $focusedItem.find("." + NODE_CONTAINER_CLASS).eq(0);
            if ($node.hasClass(OPENED_NODE_CONTAINER_CLASS)) {
                this.option("focusedElement", this._nextItem(this._findNonDisabledNodes(this._nodeElements())));
                return
            }
            var node = this._getNodeByItemElement($focusedItem.find(">." + ITEM_CLASS));
            this._toggleExpandedState(node, true)
        },
        _getClosestNonDisabledNode: function($node) {
            do {
                $node = $node.parent().closest("." + NODE_CLASS)
            } while ($node.children(".dx-treeview-item.dx-state-disabled").length);
            return $node
        },
        _collapseFocusedContainer: function() {
            var $focusedItem = this.option("focusedElement");
            if (!$focusedItem) {
                return
            }
            var nodeElement = $focusedItem.find("." + NODE_CONTAINER_CLASS).eq(0);
            if (!$focusedItem.hasClass(IS_LEAF) && nodeElement.hasClass(OPENED_NODE_CONTAINER_CLASS)) {
                var node = this._getNodeByItemElement($focusedItem.find(">." + ITEM_CLASS));
                this._toggleExpandedState(node, false)
            } else {
                var collapsedNode = this._getClosestNonDisabledNode($focusedItem);
                collapsedNode.length && this.option("focusedElement", collapsedNode)
            }
        },
        updateDimensions: function() {
            var that = this,
                deferred = $.Deferred();
            if (that._scrollableContainer) {
                that._scrollableContainer.update().done(function() {
                    deferred.resolveWith(that)
                })
            } else {
                deferred.resolveWith(that)
            }
            return deferred.promise()
        },
        selectItem: function(itemElement) {
            this._updateItemSelection(true, itemElement)
        },
        unselectItem: function(itemElement) {
            this._updateItemSelection(false, itemElement)
        },
        expandItem: function(itemElement) {
            this._toggleExpandedState(itemElement, true)
        },
        collapseItem: function(itemElement) {
            this._toggleExpandedState(itemElement, false)
        },
        getNodes: function() {
            return this._dataAdapter.getTreeNodes()
        },
        selectAll: function() {
            if (this._selectAllEnabled()) {
                this._$selectAllItem.dxCheckBox("instance").option("value", true)
            } else {
                this._toggleSelectAll({
                    value: true
                })
            }
        },
        unselectAll: function() {
            if (this._selectAllEnabled()) {
                this._$selectAllItem.dxCheckBox("instance").option("value", false)
            } else {
                this._toggleSelectAll({
                    value: false
                })
            }
        },
        collapseAll: function() {
            var that = this;
            $.each(this._dataAdapter.getExpandedNodesKeys(), function(_, key) {
                that._toggleExpandedState(key, false)
            })
        }
    });
    registerComponent("dxTreeView", TreeView);
    module.exports = TreeView
});
