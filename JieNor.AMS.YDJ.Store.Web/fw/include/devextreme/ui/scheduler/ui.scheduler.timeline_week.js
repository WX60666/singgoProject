/** 
 * DevExtreme (ui/scheduler/ui.scheduler.timeline_week.js)
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
        SchedulerTimeline = require("./ui.scheduler.timeline"),
        dateLocalization = require("../../localization/date");
    var TIMELINE_CLASS = "dx-scheduler-timeline-week",
        HEADER_PANEL_CELL_CLASS = "dx-scheduler-header-panel-cell",
        HEADER_ROW_CLASS = "dx-scheduler-header-row",
        CELL_WIDTH = 200;
    var SchedulerTimelineWeek = SchedulerTimeline.inherit({
        _getElementClass: function() {
            return TIMELINE_CLASS
        },
        _getCellCount: function() {
            return this.callBase() * this._getWeekDuration()
        },
        _renderDateHeader: function() {
            var $headerRow = this.callBase(),
                firstViewDate = new Date(this._firstViewDate),
                $cells = [],
                colspan = this._getCellCountInDay(),
                headerCellWidth = colspan * CELL_WIDTH;
            for (var i = 0; i < this._getWeekDuration(); i++) {
                $cells.push($("<th>").addClass(HEADER_PANEL_CELL_CLASS).text(dateLocalization.format(firstViewDate, "E d")).attr("colspan", colspan).width(headerCellWidth));
                firstViewDate.setDate(firstViewDate.getDate() + 1)
            }
            var $row = $("<tr>").addClass(HEADER_ROW_CLASS).append($cells);
            $headerRow.before($row)
        },
        _getWeekDuration: function() {
            return 7
        }
    });
    registerComponent("dxSchedulerTimelineWeek", SchedulerTimelineWeek);
    module.exports = SchedulerTimelineWeek
});
