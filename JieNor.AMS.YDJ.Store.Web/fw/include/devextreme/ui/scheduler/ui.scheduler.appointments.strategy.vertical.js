/** 
 * DevExtreme (ui/scheduler/ui.scheduler.appointments.strategy.vertical.js)
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
    var WEEK_APPOINTMENT_DEFAULT_OFFSET = 15;
    var VerticalRenderingStrategy = BaseAppointmentsStrategy.inherit({
        getDeltaTime: function(args, initialSize, appointment) {
            var deltaTime = 0;
            if (this.isAllDay(appointment)) {
                deltaTime = 24 * this._getDeltaWidth(args, initialSize) * 60 * 6e4
            } else {
                var deltaHeight = args.height - initialSize.height;
                if (deltaHeight < 0) {
                    deltaHeight = this._correctOnePxGap(deltaHeight)
                }
                deltaTime = 6e4 * Math.round(deltaHeight / this._defaultHeight * this.instance.option("appointmentDurationInMinutes"))
            }
            return deltaTime
        },
        getAppointmentGeometry: function(coordinates) {
            var result, allDay = coordinates.allDay;
            if (allDay) {
                result = this._getAllDayAppointmentGeometry(coordinates)
            } else {
                result = this._getSimpleAppointmentGeometry(coordinates)
            }
            return this.callBase(result)
        },
        _correctOnePxGap: function(deltaHeight) {
            if (Math.abs(deltaHeight) % this._defaultHeight) {
                deltaHeight--
            }
            return deltaHeight
        },
        _getMinuteHeight: function() {
            return this._defaultHeight / this.instance.option("appointmentDurationInMinutes")
        },
        _getCompactLeftCoordinate: function(itemLeft, index) {
            var cellBorderSize = 1,
                cellWidth = this._defaultWidth || this.getAppointmentMinSize();
            return itemLeft + (cellBorderSize + cellWidth) * index
        },
        _checkLongCompactAppointment: function(item, result) {
            if (item.allDay) {
                this._splitLongCompactAppointment(item, result)
            }
            return result
        },
        _getAllDayAppointmentGeometry: function(coordinates) {
            var maxHeight = this._allDayHeight || this.getAppointmentMinSize(),
                index = coordinates.index,
                count = coordinates.count,
                height = maxHeight / (count > 3 ? 3 : count),
                width = coordinates.width,
                top = coordinates.top + index * height,
                left = coordinates.left,
                compactAppointmentDefaultSize = this.getCompactAppointmentDefaultSize(),
                compactAppointmentDefaultOffset = this.getCompactAppointmentDefaultOffset();
            if (!this.instance.option("allowResize") || !this.instance.option("allowAllDayResize")) {
                coordinates.skipResizing = true
            }
            if (count > 2) {
                if (coordinates.isCompact) {
                    top = coordinates.top + compactAppointmentDefaultOffset;
                    left = coordinates.left + (index - 2) * (compactAppointmentDefaultSize + compactAppointmentDefaultOffset) + compactAppointmentDefaultOffset;
                    height = compactAppointmentDefaultSize, width = compactAppointmentDefaultSize;
                    this._markAppointmentAsVirtual(coordinates, true)
                } else {
                    top += height
                }
            }
            return {
                height: height,
                width: width,
                top: top,
                left: left
            }
        },
        _getSimpleAppointmentGeometry: function(coordinates) {
            var width = this._getAppointmentMaxWidth() / coordinates.count,
                height = coordinates.height,
                top = coordinates.top,
                left = coordinates.left + coordinates.index * width;
            return {
                height: height,
                width: width,
                top: top,
                left: left
            }
        },
        isAllDay: function(appointmentData) {
            var appointmentTakesAllDay = false,
                startDate = this.instance.invoke("getField", "startDate", appointmentData),
                endDate = this.instance.invoke("getField", "endDate", appointmentData),
                allDay = this.instance.invoke("getField", "allDay", appointmentData);
            this.instance.notifyObserver("appointmentTakesAllDay", {
                startDate: startDate,
                endDate: endDate,
                callback: function(result) {
                    appointmentTakesAllDay = result
                }
            });
            return allDay || appointmentTakesAllDay
        },
        _getAppointmentMaxWidth: function() {
            return this._defaultWidth - WEEK_APPOINTMENT_DEFAULT_OFFSET || this.getAppointmentMinSize()
        },
        calculateAppointmentWidth: function(appointment) {
            if (!this.isAllDay(appointment)) {
                return 0
            }
            var startDate = new Date(this._startDate(appointment)),
                endDate = this._endDate(appointment),
                cellWidth = this._defaultWidth || this.getAppointmentMinSize();
            startDate = dateUtils.trimTime(startDate);
            var durationInHours = (endDate.getTime() - startDate.getTime()) / 36e5;
            var width = Math.ceil(durationInHours / 24) * cellWidth;
            return width
        },
        calculateAppointmentHeight: function(appointment) {
            if (this.isAllDay(appointment)) {
                return 0
            }
            var startDate = this._startDate(appointment),
                endDate = this._endDate(appointment);
            var durationInMinutes = (endDate.getTime() - startDate.getTime()) / 6e4,
                minHeight = this.getAppointmentMinSize();
            var height = Math.round(durationInMinutes * this._getMinuteHeight());
            if (height < minHeight) {
                height = minHeight
            }
            return height
        },
        _sortCondition: function(a, b) {
            var allDayCondition = a.allDay - b.allDay,
                result = allDayCondition ? allDayCondition : this._rowCondition(a, b);
            return this._fixUnstableSorting(result, a, b)
        }
    });
    module.exports = VerticalRenderingStrategy
});
