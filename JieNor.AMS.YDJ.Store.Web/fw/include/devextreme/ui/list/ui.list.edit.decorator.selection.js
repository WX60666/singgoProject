/** 
 * DevExtreme (ui/list/ui.list.edit.decorator.selection.js)
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
        clickEvent = require("../../events/click"),
        CheckBox = require("../check_box"),
        RadioButton = require("../radio_group/radio_button"),
        eventUtils = require("../../events/utils"),
        registerDecorator = require("./ui.list.edit.decorator_registry").register,
        EditDecorator = require("./ui.list.edit.decorator");
    var SELECT_DECORATOR_ENABLED_CLASS = "dx-list-select-decorator-enabled",
        SELECT_DECORATOR_SELECT_ALL_CLASS = "dx-list-select-all",
        SELECT_DECORATOR_SELECT_ALL_CHECKBOX_CLASS = "dx-list-select-all-checkbox",
        SELECT_DECORATOR_SELECT_ALL_LABEL_CLASS = "dx-list-select-all-label",
        SELECT_CHECKBOX_CONTAINER_CLASS = "dx-list-select-checkbox-container",
        SELECT_CHECKBOX_CLASS = "dx-list-select-checkbox",
        SELECT_RADIO_BUTTON_CONTAINER_CLASS = "dx-list-select-radiobutton-container",
        SELECT_RADIO_BUTTON_CLASS = "dx-list-select-radiobutton";
    var CLICK_EVENT_NAME = eventUtils.addNamespace(clickEvent.name, "dxListEditDecorator");
    registerDecorator("selection", "default", EditDecorator.inherit({
        _init: function() {
            this.callBase.apply(this, arguments);
            var selectionMode = this._list.option("selectionMode");
            this._singleStrategy = "single" === selectionMode;
            this._containerClass = this._singleStrategy ? SELECT_RADIO_BUTTON_CONTAINER_CLASS : SELECT_CHECKBOX_CONTAINER_CLASS;
            this._controlClass = this._singleStrategy ? SELECT_RADIO_BUTTON_CLASS : SELECT_CHECKBOX_CLASS;
            this._controlWidget = this._singleStrategy ? RadioButton.publicName() : CheckBox.publicName();
            this._list.element().addClass(SELECT_DECORATOR_ENABLED_CLASS)
        },
        beforeBag: function(config) {
            var $itemElement = config.$itemElement,
                $container = config.$container;
            var $control = $("<div />").addClass(this._controlClass);
            $control[this._controlWidget]($.extend(this._commonOptions(), {
                value: this._isSelected($itemElement),
                focusStateEnabled: false,
                hoverStateEnabled: false,
                onValueChanged: $.proxy(function(e) {
                    this._processCheckedState($itemElement, e.value);
                    e.jQueryEvent && e.jQueryEvent.stopPropagation()
                }, this)
            }));
            $container.addClass(this._containerClass);
            $container.append($control)
        },
        modifyElement: function(config) {
            this.callBase.apply(this, arguments);
            var $itemElement = config.$itemElement,
                control = $itemElement.find("." + this._controlClass)[this._controlWidget]("instance");
            $itemElement.on("stateChanged", $.proxy(function() {
                control.option("value", this._isSelected($itemElement));
                this._updateSelectAllState()
            }, this))
        },
        _updateSelectAllState: function() {
            if (!this._$selectAll) {
                return
            }
            var items = this._list.option("items");
            var selectedItems = this._list.option("selectedItems");
            var dataSource = this._list._dataSource;
            var itemsCount = dataSource && dataSource.totalCount() >= 0 ? dataSource.totalCount() : items.length;
            var isSelectedAll = itemsCount > 0 && itemsCount === selectedItems.length ? true : 0 === selectedItems.length ? false : void 0;
            this._selectAllCheckBox.option("value", isSelectedAll)
        },
        afterRender: function() {
            if ("all" !== this._list.option("selectionMode")) {
                return
            }
            if (!this._$selectAll) {
                this._renderSelectAll()
            }
        },
        _renderSelectAll: function() {
            var $selectAll = this._$selectAll = $("<div>").addClass(SELECT_DECORATOR_SELECT_ALL_CLASS);
            this._selectAllCheckBox = this._list._createComponent($("<div>").addClass(SELECT_DECORATOR_SELECT_ALL_CHECKBOX_CLASS).appendTo($selectAll), CheckBox);
            $("<div>").addClass(SELECT_DECORATOR_SELECT_ALL_LABEL_CLASS).text(this._list.option("selectAllText")).appendTo($selectAll);
            this._list.itemsContainer().prepend($selectAll);
            this._updateSelectAllState();
            this._attachSelectAllHandler()
        },
        _attachSelectAllHandler: function() {
            this._selectAllCheckBox.option("onValueChanged", $.proxy(this._selectAllHandler, this));
            this._$selectAll.off(CLICK_EVENT_NAME).on(CLICK_EVENT_NAME, $.proxy(this._selectAllClickHandler, this))
        },
        _selectAllHandler: function(e) {
            e.jQueryEvent && e.jQueryEvent.stopPropagation();
            var isSelectedAll = this._selectAllCheckBox.option("value");
            var result = this._list._createActionByOption("onSelectAllValueChanged")({
                value: isSelectedAll
            });
            if (false === result) {
                return
            }
            if (true === isSelectedAll) {
                this._selectAllItems()
            } else {
                if (false === isSelectedAll) {
                    this._unselectAllItems()
                }
            }
        },
        _selectAllItems: function() {
            this._list.option("selectedItems", this._list.option("items").slice())
        },
        _unselectAllItems: function() {
            this._list.option("selectedItems", [])
        },
        _selectAllClickHandler: function() {
            this._selectAllCheckBox.option("value", !this._selectAllCheckBox.option("value"))
        },
        _isSelected: function($itemElement) {
            return this._list.isItemSelected($itemElement)
        },
        _processCheckedState: function($itemElement, checked) {
            if (checked) {
                this._list.selectItem($itemElement)
            } else {
                this._list.unselectItem($itemElement)
            }
        },
        dispose: function() {
            this._disposeSelectAll();
            this._list.element().removeClass(SELECT_DECORATOR_ENABLED_CLASS);
            this.callBase.apply(this, arguments)
        },
        _disposeSelectAll: function() {
            if (this._$selectAll) {
                this._$selectAll.remove();
                this._$selectAll = null
            }
        },
        handleClick: function($itemElement) {
            var newState = !this._isSelected($itemElement) || this._singleStrategy;
            this._processCheckedState($itemElement, newState);
            return true
        }
    }))
});
