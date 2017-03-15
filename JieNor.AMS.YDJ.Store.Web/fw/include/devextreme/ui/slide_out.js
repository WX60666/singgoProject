/** 
 * DevExtreme (ui/slide_out.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery"),
        commonUtils = require("../core/utils/common"),
        registerComponent = require("../core/component_registrator"),
        PlainEditStrategy = require("./collection/ui.collection_widget.edit.strategy.plain"),
        SlideOutView = require("./slide_out_view"),
        CollectionWidget = require("./collection/ui.collection_widget.edit"),
        List = require("./list");
    var SLIDEOUT_CLASS = "dx-slideout",
        SLIDEOUT_ITEM_CONTAINER_CLASS = "dx-slideout-item-container",
        SLIDEOUT_MENU = "dx-slideout-menu",
        SLIDEOUT_ITEM_CLASS = "dx-slideout-item",
        SLIDEOUT_ITEM_DATA_KEY = "dxSlideoutItemData";
    var SlideOut = CollectionWidget.inherit({
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                activeStateEnabled: false,
                menuItemTemplate: "menuItem",
                swipeEnabled: true,
                menuVisible: false,
                menuPosition: "normal",
                menuGrouped: false,
                menuGroupTemplate: "menuGroup",
                onMenuItemRendered: null,
                onMenuGroupRendered: null,
                contentTemplate: "content",
                selectionMode: "single",
                selectionRequired: true
            })
        },
        _itemClass: function() {
            return SLIDEOUT_ITEM_CLASS
        },
        _itemDataKey: function() {
            return SLIDEOUT_ITEM_DATA_KEY
        },
        _itemContainer: function() {
            return this._slideOutView.content()
        },
        _init: function() {
            this.callBase();
            this.element().addClass(SLIDEOUT_CLASS);
            this._initSlideOutView()
        },
        _initEditStrategy: function() {
            if (this.option("menuGrouped")) {
                var strategy = PlainEditStrategy.inherit({
                    _getPlainItems: function() {
                        return $.map(this.callBase(), function(group) {
                            return group.items
                        })
                    }
                });
                this._editStrategy = new strategy(this)
            } else {
                this.callBase()
            }
        },
        _initSlideOutView: function() {
            this._slideOutView = this._createComponent(this.element(), SlideOutView, {
                _templates: [],
                menuVisible: this.option("menuVisible"),
                swipeEnabled: this.option("swipeEnabled"),
                menuPosition: this.option("menuPosition"),
                onOptionChanged: $.proxy(this._slideOutViewOptionChanged, this)
            });
            this._itemContainer().addClass(SLIDEOUT_ITEM_CONTAINER_CLASS)
        },
        _slideOutViewOptionChanged: function(args) {
            if ("menuVisible" === args.name) {
                this.option(args.name, args.value)
            }
        },
        _render: function() {
            this._slideOutView._renderShield();
            this._renderList();
            this._renderContentTemplate();
            this.callBase()
        },
        _renderList: function() {
            this._$list = this._$list || $("<div>").addClass(SLIDEOUT_MENU).appendTo(this._slideOutView.menuContent());
            this._renderItemClickAction();
            this._createComponent(this._$list, List, {
                itemTemplateProperty: "menuTemplate",
                indicateLoading: false,
                onItemClick: $.proxy(this._listItemClickHandler, this),
                items: this.option("items"),
                dataSource: this.option("dataSource"),
                itemTemplate: this._getTemplateByOption("menuItemTemplate"),
                grouped: this.option("menuGrouped"),
                groupTemplate: this._getTemplateByOption("menuGroupTemplate"),
                onItemRendered: this.option("onMenuItemRendered"),
                onGroupRendered: this.option("onMenuGroupRendered"),
                onContentReady: $.proxy(this._updateSlideOutView, this)
            })
        },
        _updateSlideOutView: function() {
            this._slideOutView._dimensionChanged()
        },
        _renderItemClickAction: function() {
            this._itemClickAction = this._createActionByOption("onItemClick")
        },
        _listItemClickHandler: function(e) {
            var selectedIndex = this._$list.find(".dx-list-item").index(e.itemElement);
            this.option("selectedIndex", selectedIndex);
            this._itemClickAction(e)
        },
        _renderContentTemplate: function() {
            if (commonUtils.isDefined(this._singleContent)) {
                return
            }
            var itemsLength = this._itemContainer().html().length;
            this._getTemplateByOption("contentTemplate").render({
                container: this._itemContainer()
            });
            this._singleContent = this._itemContainer().html().length !== itemsLength
        },
        _itemClickHandler: $.noop,
        _renderContentImpl: function(template) {
            if (this._singleContent) {
                return
            }
            var items = this.option("items"),
                selectedIndex = this.option("selectedIndex");
            if (items.length && selectedIndex > -1) {
                var selectedItem = this._$list.dxList("instance").getItemByIndex(selectedIndex);
                this._renderItems([selectedItem])
            }
        },
        _renderItem: function(index, item, container) {
            this._itemContainer().find("." + SLIDEOUT_ITEM_CLASS).remove();
            this.callBase(index, item)
        },
        _selectedItemElement: function(index) {
            return this._itemElements().eq(0)
        },
        _renderSelection: function() {
            this._renderContent()
        },
        _getListWidth: function() {
            return this._slideOutView._getMenuWidth()
        },
        _changeMenuOption: function(name, value) {
            this._$list.dxList("instance").option(name, value);
            this._updateSlideOutView()
        },
        _cleanItemContainer: function() {
            if (this._singleContent) {
                return
            }
            this.callBase()
        },
        beginUpdate: function() {
            this.callBase();
            this._$list && this._$list.dxList("beginUpdate")
        },
        endUpdate: function() {
            this._$list && this._$list.dxList("endUpdate");
            this.callBase()
        },
        _optionChanged: function(args) {
            var name = args.name;
            var value = args.value;
            switch (name) {
                case "menuVisible":
                case "swipeEnabled":
                case "rtlEnabled":
                case "menuPosition":
                    this._slideOutView.option(name, value);
                    break;
                case "width":
                    this.callBase(args);
                    this._updateSlideOutView();
                    break;
                case "menuItemTemplate":
                    this._changeMenuOption("itemTemplate", this._getTemplate(value));
                    break;
                case "items":
                    this._changeMenuOption("items", this.option("items"));
                    break;
                case "dataSource":
                    this._changeMenuOption(name, value);
                    this.callBase(args);
                    break;
                case "menuGrouped":
                    this._initEditStrategy();
                    this._changeMenuOption("grouped", value);
                    break;
                case "menuGroupTemplate":
                    this._changeMenuOption("groupTemplate", this._getTemplate(value));
                    break;
                case "onMenuItemRendered":
                    this._changeMenuOption("onItemRendered", value);
                    break;
                case "onMenuGroupRendered":
                    this._changeMenuOption("onGroupRendered", value);
                    break;
                case "onItemClick":
                    this._renderItemClickAction();
                    break;
                case "contentTemplate":
                    this._singleContent = null;
                    this._invalidate();
                    break;
                default:
                    this.callBase(args)
            }
        },
        showMenu: function() {
            return this._slideOutView.toggleMenuVisibility(true)
        },
        hideMenu: function() {
            return this._slideOutView.toggleMenuVisibility(false)
        },
        toggleMenuVisibility: function(showing) {
            return this._slideOutView.toggleMenuVisibility(showing)
        }
    });
    registerComponent("dxSlideOut", SlideOut);
    module.exports = SlideOut
});
