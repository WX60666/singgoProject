/** 
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.export.js)
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
        Class = require("../../core/class"),
        utils = require("../../core/utils/common"),
        formatHelper = require("../../format_helper"),
        clientExporter = require("../../client_exporter"),
        excelExporter = clientExporter.excel,
        DEFAULT_DATA_TYPE = "string",
        gridCoreUtils = require("../grid_core/ui.grid_core.utils");
    exports.ExportMixin = $.extend({}, gridCoreUtils.exportMixin, {
        exportToExcel: function() {
            var that = this;
            clientExporter.export(that.getDataProvider(), {
                fileName: that.option("export.fileName"),
                proxyUrl: that.option("export.proxyUrl"),
                format: "EXCEL",
                rtlEnabled: that.option("rtlEnabled"),
                exportingAction: that._actions.onExporting,
                exportedAction: that._actions.onExported,
                fileSavingAction: that._actions.onFileSaving
            }, excelExporter.getData)
        },
        _getLength: function(items) {
            var cellIndex, cellCount = 0;
            for (cellIndex in items[0]) {
                cellCount += items[0][cellIndex].colspan ? items[0][cellIndex].colspan : 1
            }
            return cellCount
        },
        _getAllItems: function(columnsInfo, rowsInfoItems, cellsInfo) {
            var cellIndex, rowIndex, sourceItems = columnsInfo.concat(cellsInfo),
                rowsLength = this._getLength(rowsInfoItems),
                colsLength = this._getLength(columnsInfo),
                headerRowsCount = columnsInfo.length;
            for (rowIndex = 0; rowIndex < rowsInfoItems.length; rowIndex++) {
                for (cellIndex = rowsInfoItems[rowIndex].length - 1; cellIndex >= 0; cellIndex--) {
                    if (!utils.isDefined(sourceItems[rowIndex + headerRowsCount])) {
                        sourceItems[rowIndex + headerRowsCount] = []
                    }
                    sourceItems[rowIndex + headerRowsCount].splice(0, 0, $.extend({}, rowsInfoItems[rowIndex][cellIndex]))
                }
            }
            sourceItems[0].splice(0, 0, $.extend({}, this._getEmptyCell(), {
                alignment: this._options.rtlEnabled ? "right" : "left",
                colspan: rowsLength,
                rowspan: headerRowsCount
            }));
            return this._prepareItems(rowsLength + colsLength, sourceItems)
        },
        getDataProvider: function() {
            var that = this,
                dataController = this._dataController,
                items = $.Deferred();
            dataController.beginLoading();
            setTimeout(function() {
                var columnsInfo = $.extend(true, [], dataController.getColumnsInfo(true)),
                    rowsInfoItems = $.extend(true, [], dataController.getRowsInfo(true)),
                    cellsInfo = dataController.getCellsInfo(true);
                items.resolve(that._getAllItems(columnsInfo, rowsInfoItems, cellsInfo));
                dataController.endLoading()
            });
            return new exports.DataProvider({
                items: items,
                dataFields: this.getDataSource().getAreaFields("data")
            })
        }
    });

    function getCellDataType(cell, field) {
        if (field && field.customizeText) {
            return "string"
        }
        if (cell.dataType) {
            return cell.dataType
        }
        if (cell.format) {
            if (formatHelper.format(1, cell.format)) {
                return "number"
            }
            if (formatHelper.format(new Date, cell.format)) {
                return "date"
            }
        }
        return DEFAULT_DATA_TYPE
    }
    exports.DataProvider = Class.inherit({
        ctor: function(options) {
            this._options = options
        },
        ready: function() {
            var options = this._options,
                dataFields = options.dataFields;
            return $.when(options.items).done(function(items) {
                var cellItem, headerSize = items[0][0].rowspan,
                    columns = items[headerSize - 1];
                $.each(columns, function(columnIndex, column) {
                    column.width = 100;
                    column.alignment = column.alignment || "center";
                    cellItem = items[headerSize] && items[headerSize][columnIndex];
                    if (cellItem) {
                        column.dataType = getCellDataType(cellItem, dataFields[cellItem.dataIndex]);
                        column.format = cellItem.format;
                        column.precision = cellItem.precision
                    }
                });
                options.columns = columns;
                options.items = items
            })
        },
        getColumns: function() {
            return this._options.columns
        },
        getRowsCount: function() {
            return this._options.items.length
        },
        isGroupRow: function() {
            return false
        },
        isHeadersVisible: function() {
            return false
        },
        isTotalCell: function() {
            return false
        },
        getGroupLevel: function() {
            return 0
        },
        getCellMerging: function(rowIndex, cellIndex) {
            var items = this._options.items,
                item = items[rowIndex] && items[rowIndex][cellIndex];
            return item ? {
                colspan: item.colspan - 1,
                rowspan: item.rowspan - 1
            } : {
                colspan: 0,
                rowspan: 0
            }
        },
        getFrozenArea: function() {
            var items = this._options.items;
            return {
                x: items[0][0].colspan,
                y: items[0][0].rowspan
            }
        },
        getCellType: function(rowIndex, cellIndex) {
            var items = this._options.items,
                rowHeaderCellCount = items[0][0].rowspan,
                columnHeaderCellCount = items[0][0].colspan,
                column = this._options.columns[cellIndex],
                dataType = column && column.dataType;
            if (rowIndex < rowHeaderCellCount || cellIndex < columnHeaderCellCount) {
                return DEFAULT_DATA_TYPE
            }
            return dataType || DEFAULT_DATA_TYPE
        },
        getCellValue: function(rowIndex, cellIndex) {
            var items = this._options.items,
                item = items[rowIndex] && items[rowIndex][cellIndex] || {};
            if ("string" === this.getCellType(rowIndex, cellIndex)) {
                return item.text
            } else {
                return item.value
            }
        }
    })
});
