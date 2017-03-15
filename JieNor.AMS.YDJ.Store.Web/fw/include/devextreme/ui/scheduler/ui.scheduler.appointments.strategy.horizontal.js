/** 
 * DevExtreme (ui/scheduler/ui.scheduler.appointments.strategy.horizontal.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var BaseAppointmentsStrategy = require("./ui.scheduler.appointments.strategy.base"),
        dateUtils = require("../../core/utils/date");
    var MAX_APPOINTMENT_HEIGHT = 100,
        BOTTOM_CELL_GAP = 20,
        toMs = dateUtils.dateToMilliseconds;
    var HorizontalRenderingStrategy = BaseAppointmentsStrategy.inherit({
        _needVerifyItemSize: function() {
            return true
        },
        calculateAppointmentWidth: function(appointment) {
            var width, cellWidth = this._defaultWidth || this.getAppointmentMinSize(),
                allDay = this.instance.invoke("getField", "allDay", appointment),
                minWidth = this.getAppointmentMinSize(),
                durationInCells = 0;
            var dayDuration = toMs("day"),
                startDate = this._startDate(appointment),
                endDate = this._endDate(appointment),
                appointmentDuration = endDate.getTime() - startDate.getTime();
            if (allDay) {
                var ceilQuantityOfDays = Math.ceil(appointmentDuration / dayDuration);
                durationInCells = ceilQuantityOfDays * (60 * this.instance.option("dayDuration") / this.instance.option("appointmentDurationInMinutes"))
            } else {
                var floorQuantityOfDays = Math.floor(appointmentDuration / dayDuration),
                    tailDuration = appointmentDuration % dayDuration,
                    visibleDayDuration = this.instance.option("dayDuration") * toMs("hour");
                if (tailDuration > visibleDayDuration) {
                    tailDuration = visibleDayDuration
                }
                var cellDuration = this.instance.option("appointmentDurationInMinutes") * toMs("minute");
                durationInCells = (floorQuantityOfDays * visibleDayDuration + tailDuration) / cellDuration
            }
            width = durationInCells * cellWidth;
            if (width < minWidth) {
                width = minWidth
            }
            return width
        },
        getAppointmentGeometry: function(coordinates) {
            var result = this._customizeAppointmentGeometry(coordinates);
            return this.callBase(result)
        },
        _customizeAppointmentGeometry: function(coordinates) {
            var cellHeight = (this._defaultHeight || this.getAppointmentMinSize()) - BOTTOM_CELL_GAP,
                height = cellHeight / coordinates.count;
            if (height > MAX_APPOINTMENT_HEIGHT) {
                height = MAX_APPOINTMENT_HEIGHT
            }
            var top = coordinates.top + coordinates.index * height;
            return {
                height: height,
                width: coordinates.width,
                top: top,
                left: coordinates.left
            }
        },
        _correctRtlCoordinatesParts: function(coordinates, width) {
            for (var i = 1; i < coordinates.length; i++) {
                coordinates[i].left -= width
            }
            return coordinates
        },
        _sortCondition: function(a, b) {
            var result = this._columnCondition(a, b);
            return this._fixUnstableSorting(result, a, b)
        },
        _getMaxAppointmentWidth: function(startDate) {
            var result;
            this.instance.notifyObserver("getMaxAppointmentWidth", {
                date: startDate,
                callback: function(width) {
                    result = width
                }
            });
            return result
        },
        getDeltaTime: function(args, initialSize) {
            var deltaTime = 0,
                deltaWidth = args.width - initialSize.width;
            deltaTime = 6e4 * Math.round(deltaWidth / this._defaultWidth * this.instance.option("appointmentDurationInMinutes"));
            return deltaTime
        },
        isAllDay: function(appointmentData) {
            return this.instance.invoke("getField", "allDay", appointmentData)
        }
    });
    module.exports = HorizontalRenderingStrategy
});
