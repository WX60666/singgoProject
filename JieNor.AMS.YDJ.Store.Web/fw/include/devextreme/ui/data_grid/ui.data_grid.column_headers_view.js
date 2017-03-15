/** 
 * DevExtreme (ui/data_grid/ui.data_grid.column_headers_view.js)
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
        columnsView = require("./ui.data_grid.columns_view"),
        commonUtils = require("../../core/utils/common"),
        messageLocalization = require("../../localization/message");
    var DATAGRID_CELL_CONTENT_CLASS = "dx-datagrid-text-content",
        DATAGRID_HEADERS_CLASS = "dx-datagrid-headers",
        DATAGRID_HEADER_ROW_CLASS = "dx-header-row",
        DATAGRID_NOWRAP_CLASS = "dx-datagrid-nowrap",
        DATAGRID_COLUMN_LINES_CLASS = "dx-column-lines",
        DATAGRID_CONTEXT_MENU_SORT_ASC_ICON = "context-menu-sort-asc",
        DATAGRID_CONTEXT_MENU_SORT_DESC_ICON = "context-menu-sort-desc",
        DATAGRID_CONTEXT_MENU_SORT_NONE_ICON = "context-menu-sort-none",
        DATAGRID_CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled",
        DATAGRID_COLUMN_INDICATORS_CLASS = "dx-column-indicators";
    var createCellContent = function($cell, showColumnLines) {
        return $("<div />").addClass(DATAGRID_CELL_CONTENT_CLASS).appendTo($cell)
    };
    exports.ColumnHeadersView = columnsView.ColumnsView.inherit({
        _createTable: function() {
            var $table = this.callBase.apply(this, arguments);
            $table.on("mousedown selectstart", this.createAction(function(e) {
                var event = e.jQueryEvent;
                if (event.shiftKey) {
                    event.preventDefault()
                }
            }));
            return $table
        },
        _getDefaultTemplate: function(column) {
            var template, that = this,
                showColumnLines = that.option("showColumnLines");
            if (column.command) {
                template = function($container, options) {
                    var column = options.column;
                    $container.html("&nbsp;");
                    $container.addClass(column.cssClass)
                }
            } else {
                template = function($container, options) {
                    var $content = createCellContent($container, showColumnLines);
                    $content.text(column.caption)
                }
            }
            return template
        },
        _getHeaderTemplate: function(column) {
            return !column.command && column.headerCellTemplate || {
                allowRenderToDetachedContainer: true,
                render: this._getDefaultTemplate(column)
            }
        },
        _processTemplate: function(template, options) {
            var resultTemplate, that = this,
                column = options.column,
                renderingTemplate = this.callBase(template);
            if (renderingTemplate && column.headerCellTemplate) {
                resultTemplate = {
                    render: function(options) {
                        var $content = createCellContent(options.container, that.option("showColumnLines"));
                        renderingTemplate.render($.extend({}, options, {
                            container: $content
                        }))
                    }
                }
            } else {
                resultTemplate = renderingTemplate
            }
            return resultTemplate
        },
        _handleDataChanged: function(e) {
            if (this._isGroupingChanged || this._requireReady) {
                this._isGroupingChanged = false;
                this.render()
            }
        },
        _renderCell: function($row, options) {
            var $cell = this.callBase($row, options);
            if ("header" === options.row.rowType) {
                $cell.addClass(DATAGRID_CELL_FOCUS_DISABLED_CLASS);
                if (!commonUtils.isDefined(options.column.command)) {
                    this.setAria("role", "columnheader", $cell);
                    this.setAria("label", options.column.caption + " " + messageLocalization.format("dxDataGrid-ariaColumn"), $cell)
                }
            }
            return $cell
        },
        _createRow: function(row) {
            var $row = this.callBase(row).toggleClass(DATAGRID_COLUMN_LINES_CLASS, this.option("showColumnLines"));
            if ("header" === row.rowType) {
                $row.addClass(DATAGRID_HEADER_ROW_CLASS)
            }
            return $row
        },
        _renderCore: function() {
            var that = this,
                $container = that.element();
            if (that._tableElement && !that._dataController.isLoaded() && !that._hasRowElements) {
                return
            }
            $container.addClass(DATAGRID_HEADERS_CLASS).toggleClass(DATAGRID_NOWRAP_CLASS, !that.option("wordWrapEnabled")).empty();
            that._updateContent(that._renderTable());
            that.callBase.apply(that, arguments)
        },
        _renderRows: function() {
            var that = this;
            if (that._dataController.isLoaded() || that._hasRowElements) {
                that.callBase.apply(that, arguments);
                that._hasRowElements = true
            }
        },
        _getRowVisibleColumns: function(rowIndex) {
            return this._columnsController.getVisibleColumns(rowIndex)
        },
        _renderRow: function($table, options) {
            options.columns = this._getRowVisibleColumns(options.row.rowIndex);
            this.callBase($table, options)
        },
        _createCell: function(options) {
            var column = options.column,
                $cellElement = this.callBase.apply(this, arguments);
            column.rowspan > 1 && $cellElement.attr("rowspan", column.rowspan);
            return $cellElement
        },
        _getRows: function() {
            var i, result = [],
                rowCount = this.getRowCount();
            if (this.option("showColumnHeaders")) {
                for (i = 0; i < rowCount; i++) {
                    result.push({
                        rowType: "header",
                        rowIndex: i
                    })
                }
            }
            return result
        },
        _getCellTemplate: function(options) {
            if ("header" === options.rowType) {
                return this._getHeaderTemplate(options.column)
            }
        },
        _columnOptionChanged: function(e) {
            var changeTypes = e.changeTypes,
                optionNames = e.optionNames,
                showColumnLines = this.option("showColumnLines");
            if (changeTypes.grouping) {
                this._isGroupingChanged = true;
                return
            }
            this.callBase(e);
            if (optionNames.width || optionNames.visibleWidth) {
                !showColumnLines && this._updateColumnTextWidths();
                this.resizeCompleted.fire()
            }
        },
        _updateColumnTextWidths: function() {
            var indicatorWidth, $indicatorContainer, that = this,
                widths = [],
                columns = that.getColumns(),
                $cells = that.getColumnElements();
            if (!$cells) {
                return
            }
            $.each(columns, function(index, column) {
                indicatorWidth = 0;
                $indicatorContainer = that._getIndicatorContainer($($cells[index]));
                if ($indicatorContainer.length) {
                    indicatorWidth = $indicatorContainer.outerWidth()
                }
                widths[index] = $($cells[index]).width() - ("center" === column.alignment ? 2 * indicatorWidth : indicatorWidth)
            });
            $.each($cells, function(index, cell) {
                if (widths.length && widths[index] > 0) {
                    $(cell).find("." + DATAGRID_CELL_CONTENT_CLASS).css("max-width", widths[index])
                }
            })
        },
        _isElementVisible: function(elementOptions) {
            return elementOptions && elementOptions.visible
        },
        getHeadersRowHeight: function() {
            var $tableElement = this._getTableElement(),
                $headerRows = $tableElement && $tableElement.find("." + DATAGRID_HEADER_ROW_CLASS);
            if ($headerRows && $headerRows.length) {
                return $headerRows.first().height() * $headerRows.length
            }
            return 0
        },
        getHeaderElement: function(index) {
            var columnElements = this.getColumnElements();
            return columnElements && columnElements.eq(index)
        },
        getColumnElements: function(index, bandColumnIndex) {
            var rowIndex, result, $cellElement, visibleColumns, that = this,
                columnsController = that._columnsController,
                rowCount = that.getRowCount();
            if (that.option("showColumnHeaders")) {
                if (rowCount > 1 && (!commonUtils.isDefined(index) || commonUtils.isDefined(bandColumnIndex))) {
                    result = $();
                    visibleColumns = commonUtils.isDefined(bandColumnIndex) ? columnsController.getChildrenByBandColumn(bandColumnIndex, index) : columnsController.getVisibleColumns();
                    $.each(visibleColumns, function(_, column) {
                        rowIndex = commonUtils.isDefined(index) ? index : columnsController.getRowIndex(column.index);
                        $cellElement = that.getCellElement(rowIndex, columnsController.getVisibleIndex(column.index, rowIndex));
                        $cellElement && result.push($cellElement.get(0))
                    });
                    return result
                } else {
                    if (!index || index < rowCount) {
                        return that.getCellElements(index || 0)
                    }
                }
            }
        },
        getColumnWidths: function() {
            var indicatorWidth, $indicatorElements, that = this,
                resultWidths = [],
                columns = that.getColumns(),
                $columnElements = that.getColumnElements();
            if ($columnElements && $columnElements.length) {
                resultWidths = that._getWidths($columnElements);
                if (that.option("showColumnLines")) {
                    $.each($columnElements, function(index, columnElement) {
                        $indicatorElements = $(columnElement).find("." + DATAGRID_COLUMN_INDICATORS_CLASS);
                        if ($indicatorElements.length) {
                            $.each($indicatorElements.children(), function(_, indicator) {
                                if ("none" !== $(indicator).css("display")) {
                                    indicatorWidth = $indicatorElements.outerWidth(true);
                                    resultWidths[index] += "center" === columns[index].alignment ? 2 * indicatorWidth : indicatorWidth;
                                    return false
                                }
                            })
                        }
                    })
                }
                return resultWidths
            }
            return this.callBase.apply(that, arguments)
        },
        allowDragging: function(column, sourceLocation, draggingPanels) {
            var i, draggingPanel, rowIndex = column && this._columnsController.getRowIndex(column.index),
                columns = this.getColumns(0 === rowIndex ? 0 : null),
                draggableColumnCount = 0,
                allowDrag = function(column) {
                    return column.allowReordering || column.allowGrouping || column.allowHiding
                };
            for (i = 0; i < columns.length; i++) {
                if (allowDrag(columns[i])) {
                    draggableColumnCount++
                }
            }
            if (draggableColumnCount <= 1) {
                return false
            } else {
                if (!draggingPanels) {
                    return (this.option("allowColumnReordering") || this._columnsController.isColumnOptionUsed("allowReordering")) && column && column.allowReordering
                }
            }
            for (i = 0; i < draggingPanels.length; i++) {
                draggingPanel = draggingPanels[i];
                if (draggingPanel && draggingPanel.allowDragging(column, sourceLocation)) {
                    return true
                }
            }
            return false
        },
        getBoundingRect: function() {
            var offset, that = this,
                $columnElements = that.getColumnElements();
            if ($columnElements && $columnElements.length) {
                offset = that._getTableElement().offset();
                return {
                    top: offset.top
                }
            }
            return null
        },
        getName: function() {
            return "headers"
        },
        getColumnCount: function() {
            var $columnElements = this.getColumnElements();
            return $columnElements ? $columnElements.length : 0
        },
        isVisible: function() {
            return this.option("showColumnHeaders")
        },
        optionChanged: function(args) {
            var that = this;
            switch (args.name) {
                case "showColumnHeaders":
                case "wordWrapEnabled":
                case "showColumnLines":
                    that._invalidate(true, true);
                    args.handled = true;
                    break;
                default:
                    that.callBase(args)
            }
        },
        getHeight: function() {
            var $element = this.element();
            return $element ? $element.outerHeight(true) : 0
        },
        getContextMenuItems: function(options) {
            var onItemClick, sortingOptions, that = this,
                column = options.column;
            if (options.row && "header" === options.row.rowType) {
                sortingOptions = that.option("sorting");
                if (sortingOptions && "none" !== sortingOptions.mode && column && column.allowSorting) {
                    onItemClick = function(params) {
                        setTimeout(function() {
                            that._columnsController.changeSortOrder(column.index, params.itemData.value)
                        })
                    };
                    return [{
                        text: sortingOptions.ascendingText,
                        value: "asc",
                        disabled: "asc" === column.sortOrder,
                        icon: DATAGRID_CONTEXT_MENU_SORT_ASC_ICON,
                        onItemClick: onItemClick
                    }, {
                        text: sortingOptions.descendingText,
                        value: "desc",
                        disabled: "desc" === column.sortOrder,
                        icon: DATAGRID_CONTEXT_MENU_SORT_DESC_ICON,
                        onItemClick: onItemClick
                    }, {
                        text: sortingOptions.clearText,
                        value: "none",
                        disabled: !column.sortOrder,
                        icon: DATAGRID_CONTEXT_MENU_SORT_NONE_ICON,
                        onItemClick: onItemClick
                    }]
                }
            }
        },
        getRowCount: function() {
            return this._columnsController && this._columnsController.getRowCount()
        },
        setRowsOpacity: function(columnIndex, value, rowIndex) {
            var i, columnElements, that = this,
                rowCount = that.getRowCount(),
                columns = that._columnsController.getColumns(),
                column = columns && columns[columnIndex],
                columnID = column && column.isBand && column.index,
                setColumnOpacity = function(index, column) {
                    if (column.ownerBand === columnID) {
                        columnElements.eq(index).css({
                            opacity: value
                        });
                        if (column.isBand) {
                            that.setRowsOpacity(column.index, value, i + 1)
                        }
                    }
                };
            if (commonUtils.isDefined(columnID)) {
                rowIndex = rowIndex || 0;
                for (i = rowIndex; i < rowCount; i++) {
                    columnElements = that.getCellElements(i);
                    $.each(that.getColumns(i), setColumnOpacity)
                }
            }
        }
    });
    gridCore.registerModule("columnHeaders", {
        defaultOptions: function() {
            return {
                showColumnHeaders: true,
                cellHintEnabled: true
            }
        },
        views: {
            columnHeadersView: exports.ColumnHeadersView
        }
    })
});
