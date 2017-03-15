/** 
 * DevExtreme (ui/date_box/ui.date_utils.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery"),
        dateLocalization = require("../../localization/date");
    var dateComponents = function() {
        return ["year", "day", "month", "day"]
    };
    var ONE_MINUTE = 6e4;
    var ONE_DAY = 60 * ONE_MINUTE * 24;
    var ONE_YEAR = 365 * ONE_DAY;
    var getStringFormat = function(format) {
        var formatType = typeof format;
        if ("string" === formatType) {
            return "format"
        }
        if ("object" === formatType && void 0 !== format.type) {
            return format.type
        }
        return null
    };
    var dateUtils = {
        SUPPORTED_FORMATS: ["date", "time", "datetime"],
        DEFAULT_FORMATTER: function(value) {
            return value
        },
        DATE_COMPONENT_TEXT_FORMATTER: function(value, name) {
            var $container = $("<div>").addClass("dx-dateview-formatter-container");
            $("<span>").text(value).addClass("dx-dateview-value-formatter").appendTo($container);
            $("<span>").text(name).addClass("dx-dateview-name-formatter").appendTo($container);
            return $container
        },
        ONE_MINUTE: ONE_MINUTE,
        ONE_DAY: ONE_DAY,
        ONE_YEAR: ONE_YEAR,
        MIN_DATEVIEW_DEFAULT_DATE: new Date(1900, 0, 1),
        MAX_DATEVIEW_DEFAULT_DATE: function() {
            var newDate = new Date;
            return new Date(newDate.getFullYear() + 50, newDate.getMonth(), newDate.getDate(), 23, 59, 59)
        }(),
        FORMATS_INFO: {
            date: {
                getStandardPattern: function() {
                    return "yyyy-MM-dd"
                },
                components: dateComponents()
            },
            time: {
                getStandardPattern: function() {
                    return "HH':'mm"
                },
                components: ["hours", "minutes"]
            },
            datetime: {
                getStandardPattern: function() {
                    var standardPattern;
                    ! function() {
                        var androidFormatPattern = "yyyy-MM-ddTHH':'mm'Z'";
                        var $input = $("<input>").attr("type", "datetime");
                        $input.val(dateUtils.toStandardDateFormat(new Date, "datetime", androidFormatPattern));
                        if ($input.val()) {
                            standardPattern = androidFormatPattern
                        }
                    }();
                    if (!standardPattern) {
                        standardPattern = "yyyy-MM-ddTHH':'mm':'ss'Z'"
                    }
                    dateUtils.FORMATS_INFO.datetime.getStandardPattern = function() {
                        return standardPattern
                    };
                    return standardPattern
                },
                components: dateComponents().concat(["hours", "minutes", "seconds", "milliseconds"])
            },
            "datetime-local": {
                getStandardPattern: function() {
                    return "yyyy-MM-ddTHH':'mm':'ss"
                },
                components: dateComponents().concat(["hours", "minutes", "seconds"])
            }
        },
        FORMATS_MAP: {
            date: "shortdate",
            time: "shorttime",
            datetime: "shortdateshorttime",
            "datetime-local": "datetime-local"
        },
        toStandardDateFormat: function(date, mode, pattern) {
            pattern = pattern || dateUtils.FORMATS_INFO[mode].getStandardPattern();
            return dateLocalization.format(date, pattern)
        },
        fromStandardDateFormat: function(date) {
            return dateLocalization.parse(date, dateUtils.FORMATS_INFO.datetime.getStandardPattern()) || dateLocalization.parse(date, dateUtils.FORMATS_INFO["datetime-local"].getStandardPattern()) || dateLocalization.parse(date, dateUtils.FORMATS_INFO.time.getStandardPattern()) || dateLocalization.parse(date, dateUtils.FORMATS_INFO.date.getStandardPattern()) || Date.parse && Date.parse(date) && new Date(Date.parse(date))
        },
        getMaxMonthDay: function(year, month) {
            return new Date(year, month + 1, 0).getDate()
        },
        mergeDates: function(target, source, format) {
            if (!source) {
                return
            }
            if (isNaN(target.getTime())) {
                target = new Date(0, 0, 0, 0, 0, 0)
            }
            var formatInfo = dateUtils.FORMATS_INFO[format];
            $.each(formatInfo.components, function() {
                var componentInfo = dateUtils.DATE_COMPONENTS_INFO[this];
                target[componentInfo.setter](source[componentInfo.getter]())
            });
            return target
        },
        getLongestCaptionIndex: function(captionArray) {
            var i, longestIndex = 0,
                longestCaptionLength = 0;
            for (i = 0; i < captionArray.length; ++i) {
                if (captionArray[i].length > longestCaptionLength) {
                    longestIndex = i;
                    longestCaptionLength = captionArray[i].length
                }
            }
            return longestIndex
        },
        expandPattern: function(pattern) {
            return dateLocalization.getPatternByFormat(pattern) || pattern
        },
        formatUsesMonthName: function(format) {
            return dateUtils.expandPattern(format).indexOf("MMMM") !== -1
        },
        formatUsesDayName: function(format) {
            return dateUtils.expandPattern(format).indexOf("EEEE") !== -1
        },
        getLongestDate: function(format, monthNames, dayNames) {
            var stringFormat = getStringFormat(format),
                month = 9;
            if (!stringFormat || dateUtils.formatUsesMonthName(stringFormat)) {
                month = dateUtils.getLongestCaptionIndex(monthNames)
            }
            var longestDate = new Date(1888, month, 21, 23, 59, 59, 999);
            if (!stringFormat || dateUtils.formatUsesDayName(stringFormat)) {
                var date = longestDate.getDate() - longestDate.getDay() + dateUtils.getLongestCaptionIndex(dayNames);
                longestDate.setDate(date)
            }
            return longestDate
        }
    };
    dateUtils.DATE_COMPONENTS_INFO = {
        year: {
            getter: "getFullYear",
            setter: "setFullYear",
            possibleFormats: ["y", "yy", "yyyy"],
            formatter: dateUtils.DEFAULT_FORMATTER,
            startValue: void 0,
            endValue: void 0
        },
        day: {
            getter: "getDate",
            setter: "setDate",
            possibleFormats: ["d", "dd"],
            formatter: function(value, showNames, date) {
                if (!showNames) {
                    return value
                }
                var formatDate = new Date(date.getTime());
                formatDate.setDate(value);
                return dateUtils.DATE_COMPONENT_TEXT_FORMATTER(value, dateLocalization.getDayNames()[formatDate.getDay()])
            },
            startValue: 1,
            endValue: void 0
        },
        month: {
            getter: "getMonth",
            setter: "setMonth",
            possibleFormats: ["M", "MM", "MMM", "MMMM"],
            formatter: function(value, showNames) {
                var monthName = dateLocalization.getMonthNames()[value];
                return showNames ? dateUtils.DATE_COMPONENT_TEXT_FORMATTER(value + 1, monthName) : monthName
            },
            startValue: 0,
            endValue: 11
        },
        hours: {
            getter: "getHours",
            setter: "setHours",
            possibleFormats: ["H", "HH", "h", "hh"],
            formatter: function(value) {
                return dateLocalization.format(new Date(0, 0, 0, value), "hour")
            },
            startValue: 0,
            endValue: 23
        },
        minutes: {
            getter: "getMinutes",
            setter: "setMinutes",
            possibleFormats: ["m", "mm"],
            formatter: function(value) {
                return dateLocalization.format(new Date(0, 0, 0, 0, value), "minute")
            },
            startValue: 0,
            endValue: 59
        },
        seconds: {
            getter: "getSeconds",
            setter: "setSeconds",
            possibleFormats: ["s", "ss"],
            formatter: function(value) {
                return dateLocalization.format(new Date(0, 0, 0, 0, 0, value), "second")
            },
            startValue: 0,
            endValue: 59
        },
        milliseconds: {
            getter: "getMilliseconds",
            setter: "setMilliseconds",
            possibleFormats: ["S", "SS", "SSS"],
            formatter: function(value) {
                return dateLocalization.format(new Date(0, 0, 0, 0, 0, 0, value), "millisecond")
            },
            startValue: 0,
            endValue: 999
        }
    };
    module.exports = dateUtils
});
