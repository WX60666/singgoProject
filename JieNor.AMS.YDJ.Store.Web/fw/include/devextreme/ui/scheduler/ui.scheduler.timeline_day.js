/** 
 * DevExtreme (ui/scheduler/ui.scheduler.timeline_day.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var registerComponent = require("../../core/component_registrator"),
        SchedulerTimeline = require("./ui.scheduler.timeline");
    var TIMELINE_CLASS = "dx-scheduler-timeline-day";
    var SchedulerTimelineDay = SchedulerTimeline.inherit({
        _getElementClass: function() {
            return TIMELINE_CLASS
        },
        _setFirstViewDate: function() {
            this._firstViewDate = this.option("currentDate");
            this._setStartDayHour(this._firstViewDate)
        }
    });
    registerComponent("dxSchedulerTimelineDay", SchedulerTimelineDay);
    module.exports = SchedulerTimelineDay
});
