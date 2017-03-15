/** 
 * DevExtreme (ui/scheduler/ui.scheduler.appointment_tooltip.js)
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
        Tooltip = require("../tooltip"),
        tooltip = require("../tooltip/ui.tooltip"),
        Button = require("../button"),
        FunctionTemplate = require("../widget/ui.template.function"),
        DynamicTemplate = require("../widget/ui.template.dynamic"),
        MoveTemplate = require("../widget/ui.template.move"),
        messageLocalization = require("../../localization/message"),
        dateUtils = require("../../core/utils/date");
    var APPOINTMENT_TOOLTIP_CLASS = "dx-scheduler-appointment-tooltip",
        APPOINTMENT_TOOLTIP_TITLE_CLASS = "dx-scheduler-appointment-tooltip-title",
        APPOINTMENT_TOOLTIP_DATE_CLASS = "dx-scheduler-appointment-tooltip-date",
        APPOINTMENT_TOOLTIP_BUTTONS_CLASS = "dx-scheduler-appointment-tooltip-buttons";
    var appointmentTooltip = {
        show: function(appointmentData, singleAppointmentData, $appointment, instance) {
            if (this._tooltip) {
                if (this._tooltip.option("visible") && this._tooltip.option("target").get(0) === $appointment.get(0)) {
                    return
                }
            }
            this.instance = instance;
            var isAllDay = instance.appointmentTakesAllDay(appointmentData);
            this._initDynamicTemplate(appointmentData, singleAppointmentData);
            var template = instance._getTemplateByOption("appointmentTooltipTemplate");
            this.hide();
            this._$tooltip = $("<div>").appendTo(instance.element());
            this._tooltip = instance._createComponent(this._$tooltip, Tooltip, {
                visible: true,
                target: $appointment,
                rtlEnabled: instance.option("rtlEnabled"),
                contentTemplate: new DynamicTemplate(function(options) {
                    return new MoveTemplate(template.render({
                        model: appointmentData,
                        container: options.container
                    }))
                }),
                position: {
                    my: "bottom",
                    at: "top",
                    of: $appointment,
                    boundary: isAllDay ? instance.element() : instance.getWorkSpaceScrollableContainer(),
                    collision: "fit flipfit"
                }
            })
        },
        hide: function() {
            if (!this._$tooltip) {
                return
            }
            this._$tooltip.remove();
            delete this._$tooltip;
            delete this._tooltip;
            tooltip.hide()
        },
        _initDynamicTemplate: function(appointmentData, singleAppointmentData) {
            var that = this;
            this.instance._dynamicTemplates.appointmentTooltip = new FunctionTemplate(function(data, index, $container) {
                var $tooltip = that._tooltipContent(appointmentData, singleAppointmentData);
                $tooltip.addClass($container.attr("class"));
                $container.replaceWith($tooltip);
                return $container
            })
        },
        _tooltipContent: function(appointmentData, singleAppointmentData) {
            var $tooltip = $("<div>").addClass(APPOINTMENT_TOOLTIP_CLASS);
            var isAllDay = this.instance.fire("getField", "allDay", appointmentData),
                startDate = this.instance.fire("getField", "startDate", singleAppointmentData),
                endDate = this.instance.fire("getField", "endDate", singleAppointmentData),
                text = this.instance.fire("getField", "text", appointmentData),
                startDateTimeZone = this.instance.fire("getField", "startDateTimeZone", appointmentData),
                endDateTimeZone = this.instance.fire("getField", "endDateTimeZone", appointmentData);
            startDate = this.instance.fire("convertDateByTimezone", startDate, startDateTimeZone);
            endDate = this.instance.fire("convertDateByTimezone", endDate, endDateTimeZone);
            $("<div>").text(text).addClass(APPOINTMENT_TOOLTIP_TITLE_CLASS).appendTo($tooltip);
            $("<div>").addClass(APPOINTMENT_TOOLTIP_DATE_CLASS).text(this._formatTooltipDate(startDate, endDate, isAllDay)).appendTo($tooltip);
            var $buttons = $("<div>").addClass(APPOINTMENT_TOOLTIP_BUTTONS_CLASS).appendTo($tooltip);
            if (this.instance._editing.allowDeleting) {
                this._getDeleteButton(appointmentData, singleAppointmentData).appendTo($buttons)
            }
            this._getOpenButton(appointmentData, singleAppointmentData).appendTo($buttons);
            return $tooltip
        },
        _formatTooltipDate: function(startDate, endDate, isAllDay) {
            var formatType = "month" !== this.instance.option("currentView") && dateUtils.sameDate(startDate, endDate) ? "TIME" : "DATETIME",
                formattedString = "";
            if (isAllDay) {
                formatType = "DATE"
            }
            this.instance.fire("formatDates", {
                startDate: startDate,
                endDate: endDate,
                formatType: formatType,
                callback: function(result) {
                    formattedString = result
                }
            });
            return formattedString
        },
        _getDeleteButton: function(appointmentData, singleAppointmentData) {
            var that = this;
            return new Button($("<div>"), {
                icon: "trash",
                onClick: function() {
                    var startDate = that.instance.fire("getField", "startDate", singleAppointmentData);
                    that.instance._checkRecurringAppointment(appointmentData, singleAppointmentData, startDate, function() {
                        that.instance.deleteAppointment(appointmentData)
                    }, true);
                    that.hide()
                }
            }).element()
        },
        _getOpenButton: function(appointmentData, singleAppointmentData) {
            var that = this,
                allowUpdating = that.instance._editing.allowUpdating;
            return new Button($("<div>"), {
                icon: allowUpdating ? "edit" : "",
                text: messageLocalization.format("dxScheduler-openAppointment"),
                onClick: function() {
                    that.instance.showAppointmentPopup(appointmentData, false, singleAppointmentData);
                    that.hide()
                }
            }).element()
        }
    };
    module.exports = appointmentTooltip
});
