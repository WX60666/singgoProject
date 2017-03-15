/** 
 * DevExtreme (ui/scheduler/ui.scheduler.agenda.js)
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
        registerComponent = require("../../core/component_registrator"),
        SchedulerWorkSpace = require("./ui.scheduler.work_space"),
        dateUtils = require("../../core/utils/date"),
        dateLocalization = require("../../localization/date"),
        tableCreator = require("./ui.scheduler.table_creator");
    var AGENDA_CLASS = "dx-scheduler-agenda",
        AGENDA_DATE_CLASS = "dx-scheduler-agenda-date",
        AGENDA_WEEK_DAY_CLASS = "dx-scheduler-agenda-week-day",
        GROUP_TABLE_CLASS = "dx-scheduler-group-table",
        NODATA_CONTAINER_CLASS = "dx-scheduler-agenda-nodata",
        LAST_ROW_CLASS = "dx-scheduler-date-table-last-row",
        INNER_CELL_MARGIN = 5,
        OUTER_CELL_MARGIN = 20;
    var SchedulerAgenda = SchedulerWorkSpace.inherit({
        _activeStateUnit: void 0,
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                agendaDuration: 7,
                rowHeight: 60,
                noDataText: ""
            })
        },
        _optionChanged: function(args) {
            var name = args.name,
                value = args.value;
            switch (name) {
                case "agendaDuration":
                    break;
                case "noDataText":
                case "rowHeight":
                    this._cleanView();
                    this._renderView();
                    break;
                case "groups":
                    if (!value || !value.length) {
                        if (this._$groupTable) {
                            this._$groupTable.remove();
                            this._$groupTable = null
                        }
                    } else {
                        if (!this._$groupTable) {
                            this._initGroupTable();
                            this._dateTableScrollable.content().prepend(this._$groupTable)
                        }
                    }
                    this.callBase(args);
                    break;
                default:
                    this.callBase(args)
            }
        },
        _renderFocusState: $.noop,
        _cleanFocusState: $.noop,
        _getElementClass: function() {
            return AGENDA_CLASS
        },
        _setFirstViewDate: function() {
            this._firstViewDate = dateUtils.makeDate(this.option("currentDate"));
            this._setStartDayHour(this._firstViewDate)
        },
        _getRowCount: function() {
            return this.option("agendaDuration")
        },
        _getCellCount: function() {
            return 1
        },
        _getTimePanelRowCount: function() {
            return this.option("agendaDuration")
        },
        _getDateByIndex: $.noop,
        _getFormat: function() {
            return "d ddd"
        },
        _renderAllDayPanel: $.noop,
        _toggleAllDayVisibility: $.noop,
        _initWorkSpaceUnits: function() {
            this._initGroupTable();
            this._$timePanel = $("<table>").addClass(this._getTimePanelClass());
            this._$dateTable = $("<table>").addClass(this._getDateTableClass())
        },
        _initGroupTable: function() {
            var groups = this.option("groups");
            if (groups && groups.length) {
                this._$groupTable = $("<table>").addClass(GROUP_TABLE_CLASS)
            }
        },
        _renderView: function() {
            this._setFirstViewDate();
            this._rows = [];
            this.invoke("getAgendaRows", {
                agendaDuration: this.option("agendaDuration"),
                currentDate: dateUtils.makeDate(this.option("currentDate"))
            }).done($.proxy(function(rows) {
                this._cleanView();
                if (this._rowsIsEmpty(rows)) {
                    this._renderNoData();
                    return
                }
                this._rows = rows;
                if (this._$groupTable) {
                    this._renderGroupHeader();
                    this._setGroupHeaderCellsHeight()
                }
                this._renderTimePanel();
                this._renderDateTable();
                this.invoke("agendaIsReady", rows, INNER_CELL_MARGIN, OUTER_CELL_MARGIN);
                this._dateTableScrollable.update()
            }, this))
        },
        _renderNoData: function() {
            this._$noDataContainer = $("<div>").addClass(NODATA_CONTAINER_CLASS).html(this.option("noDataText"));
            this._dateTableScrollable.content().append(this._$noDataContainer)
        },
        _setTableSizes: $.noop,
        _toggleHorizontalScrollClass: $.noop,
        _createCrossScrollingConfig: $.noop,
        _setGroupHeaderCellsHeight: function() {
            var $cells = this._getGroupHeaderCells().filter(function(_, element) {
                    return !element.getAttribute("rowspan")
                }),
                rows = this._removeEmptyRows(this._rows);
            if (!rows.length) {
                return
            }
            for (var i = 0; i < $cells.length; i++) {
                var $cellContent = $cells.eq(i).find(".dx-scheduler-group-header-content");
                $cellContent.outerHeight(this._getGroupRowHeight(rows[i]))
            }
        },
        _rowsIsEmpty: function(rows) {
            var result = true;
            for (var i = 0; i < rows.length; i++) {
                var groupRow = rows[i];
                for (var j = 0; j < groupRow.length; j++) {
                    if (groupRow[j]) {
                        result = false;
                        break
                    }
                }
            }
            return result
        },
        _attachGroupCountAttr: function() {
            this.element().attr("dx-group-column-count", this.option("groups").length)
        },
        _removeEmptyRows: function(rows) {
            var result = [],
                isEmpty = function(data) {
                    return !data.some(function(value) {
                        return value > 0
                    })
                };
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].length && !isEmpty(rows[i])) {
                    result.push(rows[i])
                }
            }
            return result
        },
        _getGroupHeaderContainer: function() {
            return this._$groupTable
        },
        _makeGroupRows: function(groups) {
            var tree = this.invoke("createReducedResourcesTree"),
                getGroupHeaderContentClass = this._getGroupHeaderContentClass();
            var table = tableCreator.makeGroupedTableFromJSON(tableCreator.VERTICAL, tree, {
                cellTag: "th",
                groupTableClass: GROUP_TABLE_CLASS,
                groupRowClass: this._getGroupRowClass(),
                groupCellClass: this._getGroupHeaderClass(),
                groupCellCustomContent: function(cell, cellText) {
                    var container = document.createElement("div"),
                        contentWrapper = document.createElement("div");
                    container.className = getGroupHeaderContentClass;
                    contentWrapper.appendChild(cellText);
                    container.appendChild(contentWrapper);
                    cell.appendChild(container)
                }
            });
            return $(table).find("." + this._getGroupRowClass())
        },
        _cleanView: function() {
            this._$dateTable.empty();
            this._$timePanel.empty();
            if (this._$groupTable) {
                this._$groupTable.empty()
            }
            if (this._$noDataContainer) {
                this._$noDataContainer.empty();
                this._$noDataContainer.remove();
                delete this._$noDataContainer
            }
        },
        _createWorkSpaceElements: function() {
            this._createWorkSpaceStaticElements()
        },
        _createWorkSpaceStaticElements: function() {
            if (this._$groupTable) {
                this._dateTableScrollable.content().prepend(this._$groupTable)
            }
            this._dateTableScrollable.content().append(this._$timePanel, this._$dateTable);
            this.element().append(this._dateTableScrollable.element())
        },
        _renderDateTable: function() {
            this._renderTableBody({
                container: this._$dateTable,
                rowClass: this._getDateTableRowClass(),
                cellClass: this._getDateTableCellClass()
            })
        },
        _attachTablesEvents: $.noop,
        _attachEvents: $.noop,
        _cleanCellDataCache: $.noop,
        _renderTableBody: function(options) {
            this._$rows = [];
            var fillTableBody = $.proxy(function(rowIndex, rowSize) {
                if (rowSize) {
                    var $row = $("<tr>");
                    if (options.rowClass) {
                        $row.addClass(options.rowClass)
                    }
                    var $td = $("<td>").height(this._getRowHeight(rowSize));
                    if (options.cellClass) {
                        $td.addClass(options.cellClass)
                    }
                    if ($.isFunction(options.dataGenerator)) {
                        options.dataGenerator($td[0], rowIndex)
                    }
                    $row.append($td);
                    this._$rows.push($row)
                }
            }, this);
            for (var i = 0; i < this._rows.length; i++) {
                $.each(this._rows[i], fillTableBody);
                this._setLastRowClass()
            }
            options.container.append($("<tbody>").append(this._$rows))
        },
        _setLastRowClass: function() {
            if (this._rows.length > 1 && this._$rows.length) {
                var $lastRow = this._$rows[this._$rows.length - 1];
                $lastRow.addClass(LAST_ROW_CLASS)
            }
        },
        _setTimePanelText: function(cell, rowIndex) {
            var current = dateUtils.makeDate(this.option("currentDate")),
                cellDate = new Date(current.setDate(current.getDate() + rowIndex)),
                cellDateNumber = dateLocalization.format(cellDate, "d"),
                cellDayName = dateLocalization.format(cellDate, "E");
            $(cell).append([$("<span />").addClass(AGENDA_DATE_CLASS).text(cellDateNumber), $("<span />").addClass(AGENDA_WEEK_DAY_CLASS).text(cellDayName)])
        },
        _getRowHeight: function(rowSize) {
            var baseHeight = this.option("rowHeight"),
                innerOffset = (rowSize - 1) * INNER_CELL_MARGIN;
            return rowSize ? baseHeight * rowSize + innerOffset + OUTER_CELL_MARGIN : 0
        },
        _getGroupRowHeight: function(groupRows) {
            if (!groupRows) {
                return
            }
            var result = 0;
            for (var i = 0; i < groupRows.length; i++) {
                result += this._getRowHeight(groupRows[i])
            }
            return result
        },
        getAgendaVerticalStepHeight: function() {
            return this.option("rowHeight")
        },
        getEndViewDate: function() {
            var currentDate = dateUtils.makeDate(this.option("currentDate")),
                agendaDuration = this.option("agendaDuration");
            currentDate.setHours(this.option("endDayHour"));
            var result = currentDate.setDate(currentDate.getDate() + agendaDuration - 1) - 6e4;
            return new Date(result)
        },
        getCoordinatesByDate: function() {
            return {
                top: 0,
                left: 0,
                max: 0,
                groupIndex: 0
            }
        },
        getCellDataByCoordinates: function() {
            return {
                startDate: null,
                endDate: null
            }
        }
    });
    registerComponent("dxSchedulerAgenda", SchedulerAgenda);
    module.exports = SchedulerAgenda
});
