/** 
 * DevExtreme (ui/data_grid/ui.data_grid.header_panel.js)
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
        Toolbar = require("../toolbar"),
        columnsView = require("./ui.data_grid.columns_view"),
        commonUtils = require("../../core/utils/common");
    require("../drop_down_menu");
    var DATAGRID_HEADER_PANEL_CLASS = "dx-datagrid-header-panel",
        DATAGRID_TOOLBAR_BUTTON_CLASS = "dx-datagrid-toolbar-button";
    exports.HeaderPanel = columnsView.ColumnsView.inherit({
        _resizeCore: $.noop,
        _invalidateToolbarItems: function() {
            var toolbarItems = this._getToolbarItems(),
                toolbarInstance = this._toolbar;
            if (toolbarInstance) {
                toolbarInstance.option("items", toolbarItems)
            }
        },
        _renderCore: function() {
            var toolbarInstance = this._toolbar;
            if (!toolbarInstance) {
                var toolbarItems = this._getToolbarItems();
                this.element().addClass(DATAGRID_HEADER_PANEL_CLASS);
                this._toolbar = this._createComponent($("<div />").appendTo(this.element()), Toolbar, {
                    items: toolbarItems
                })
            }
        },
        updateToolbarItemOption: function(name, optionName, optionValue) {
            var toolbarInstance = this._toolbar;
            if (toolbarInstance) {
                var items = toolbarInstance.option("items");
                if (items && items.length) {
                    var itemIndex;
                    $.each(items, function(index, item) {
                        if (item.name === name) {
                            itemIndex = index;
                            return false
                        }
                    });
                    if (void 0 !== itemIndex) {
                        if (commonUtils.isObject(optionName)) {
                            toolbarInstance.option("items[" + itemIndex + "]", optionName)
                        } else {
                            toolbarInstance.option("items[" + itemIndex + "]." + optionName, optionValue);
                            if ("disabled" === optionName) {
                                var widgetOptions = toolbarInstance.option("items[" + itemIndex + "].options") || {};
                                widgetOptions.disabled = optionValue;
                                toolbarInstance.option("items[" + itemIndex + "].options", widgetOptions)
                            }
                        }
                    }
                }
            }
        },
        getToolbarItemOption: function(name, optionName) {
            var toolbarInstance = this._toolbar;
            if (toolbarInstance) {
                var items = toolbarInstance.option("items");
                if (items && items.length) {
                    var optionValue;
                    $.each(items, function(index, item) {
                        if (item.name === name) {
                            optionValue = item[optionName];
                            return false
                        }
                    });
                    return optionValue
                }
            }
        },
        _getToolbarItems: function() {
            return []
        },
        _getButtonContainer: function() {
            return $("<div />").addClass(DATAGRID_TOOLBAR_BUTTON_CLASS)
        },
        _getToolbarButtonClass: function(specificClass) {
            var secondClass = specificClass ? " " + specificClass : "";
            return DATAGRID_TOOLBAR_BUTTON_CLASS + secondClass
        },
        getHeaderPanel: function() {
            return this.element()
        },
        getHeight: function() {
            var $element = this.element();
            return $element ? $element.outerHeight(true) : 0
        },
        isVisible: function() {
            return false
        }
    });
    gridCore.registerModule("headerPanel", {
        defaultOptions: function() {
            return {}
        },
        views: {
            headerPanel: exports.HeaderPanel
        }
    })
});
