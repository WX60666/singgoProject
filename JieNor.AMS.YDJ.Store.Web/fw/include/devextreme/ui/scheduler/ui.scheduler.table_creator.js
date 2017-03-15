/** 
 * DevExtreme (ui/scheduler/ui.scheduler.table_creator.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery");
    var SchedulerTableCreator = {
        VERTICAL: "vertical",
        HORIZONTAL: "horizontal",
        makeTable: function(options) {
            var tableBody = document.createElement("tbody");
            for (var i = 0; i < options.rowCount; i++) {
                var row = document.createElement("tr");
                if (options.rowClass) {
                    row.className = options.rowClass
                }
                for (var j = 0; j < options.cellCount; j++) {
                    var td = document.createElement("td");
                    if (options.getCellText) {
                        td.innerHTML = options.getCellText(i, j)
                    }
                    if (options.cellClass) {
                        td.className = options.cellClass
                    }
                    if (options.dataGenerator) {
                        options.dataGenerator(td, i, j)
                    }
                    row.appendChild(td)
                }
                tableBody.appendChild(row)
            }
            return tableBody
        },
        makeGroupedTable: function(type, groups, cssClasses, cellCount) {
            var rows = [];
            if (type === this.VERTICAL) {
                rows = this._makeVerticalGroupedRows(groups, cssClasses)
            } else {
                rows = this._makeHorizontalGroupedRows(groups, cssClasses, cellCount)
            }
            return rows
        },
        makeGroupedTableFromJSON: function(type, data, config) {
            var table, cellStorage = [],
                rowIndex = 0;
            config = config || {};
            var cellTag = config.cellTag || "td",
                childrenField = config.childrenField || "children",
                titleField = config.titleField || "title",
                groupTableClass = config.groupTableClass,
                groupRowClass = config.groupRowClass,
                groupCellClass = config.groupCellClass,
                groupCellCustomContent = config.groupCellCustomContent;

            function createTable() {
                table = document.createElement("table");
                if (groupTableClass) {
                    table.className = groupTableClass
                }
            }

            function getChildCount(item) {
                if (item[childrenField]) {
                    return item[childrenField].length
                }
                return 0
            }

            function createCell(text, childCount) {
                var cell = {
                    element: document.createElement(cellTag),
                    childCount: childCount
                };
                if (groupCellClass) {
                    cell.element.className = groupCellClass
                }
                var cellText = document.createTextNode(text);
                if ("function" === typeof groupCellCustomContent) {
                    groupCellCustomContent(cell.element, cellText)
                } else {
                    cell.element.appendChild(cellText)
                }
                return cell
            }

            function generateCells(data) {
                for (var i = 0; i < data.length; i++) {
                    var childCount = getChildCount(data[i]),
                        cell = createCell(data[i][titleField], childCount);
                    if (!cellStorage[rowIndex]) {
                        cellStorage[rowIndex] = []
                    }
                    cellStorage[rowIndex].push(cell);
                    if (childCount) {
                        generateCells(data[i][childrenField])
                    } else {
                        rowIndex++
                    }
                }
            }

            function putCellsToRows() {
                cellStorage.forEach(function(cells) {
                    var row = document.createElement("tr");
                    if (groupRowClass) {
                        row.className = groupRowClass
                    }
                    var rowspans = [];
                    for (var i = cells.length - 1; i >= 0; i--) {
                        var prev = cells[i + 1],
                            rowspan = cells[i].childCount;
                        if (prev && prev.childCount) {
                            rowspan *= prev.childCount
                        }
                        rowspans.push(rowspan)
                    }
                    rowspans.reverse();
                    cells.forEach(function(cell, index) {
                        if (rowspans[index]) {
                            cell.element.setAttribute("rowspan", rowspans[index])
                        }
                        row.appendChild(cell.element)
                    });
                    table.appendChild(row)
                })
            }
            createTable();
            generateCells(data);
            putCellsToRows();
            return table
        },
        _makeVerticalGroupedRows: function(groups, cssClasses) {
            var i, repeatCount = 1,
                arr = [];
            for (i = 0; i < groups.length; i++) {
                if (i > 0) {
                    repeatCount = groups[i - 1].items.length * repeatCount
                }
                var cells = this._makeGroupedRowCells(groups[i].items, repeatCount, cssClasses);
                arr.push(cells)
            }
            var rows = [],
                groupCount = arr.length,
                maxCellCount = arr[groupCount - 1].length;
            for (i = 0; i < maxCellCount; i++) {
                rows.push($("<tr>").addClass(cssClasses.groupHeaderRowClass))
            }
            for (i = groupCount - 1; i >= 0; i--) {
                var currentColumnLength = arr[i].length,
                    rowspan = maxCellCount / currentColumnLength;
                for (var j = 0; j < currentColumnLength; j++) {
                    var currentRowIndex = j * rowspan,
                        row = rows[currentRowIndex];
                    row.prepend(arr[i][j].attr("rowspan", rowspan))
                }
            }
            return rows
        },
        _makeHorizontalGroupedRows: function(groups, cssClasses, cellCount) {
            var repeatCount = 1,
                groupCount = groups.length,
                rows = [];
            for (var i = 0; i < groupCount; i++) {
                if (i > 0) {
                    repeatCount = groups[i - 1].items.length * repeatCount
                }
                var cells = this._makeGroupedRowCells(groups[i].items, repeatCount, cssClasses);
                rows.push($("<tr>").addClass(cssClasses.groupRowClass).append(cells))
            }
            var maxCellCount = rows[groupCount - 1].find("th").length;
            for (var j = 0; j < groupCount; j++) {
                var $cell = rows[j].find("th"),
                    colspan = maxCellCount / $cell.length * cellCount;
                if (colspan > 1) {
                    $cell.attr("colspan", colspan)
                }
            }
            return rows
        },
        _makeGroupedRowCells: function(items, repeatCount, cssClasses) {
            var cells = [],
                itemCount = items.length;
            for (var i = 0; i < repeatCount; i++) {
                for (var j = 0; j < itemCount; j++) {
                    cells.push($("<th>").addClass(cssClasses.groupHeaderClass).html("<div class='" + cssClasses.groupHeaderContentClass + "'><div>" + items[j].text + "</div></div>"))
                }
            }
            return cells
        }
    };
    module.exports = SchedulerTableCreator
});
