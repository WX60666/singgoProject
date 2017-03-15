/** 
 * DevExtreme (ui/scheduler/utils.recurrence.js)
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
        errors = require("../../core/errors"),
        dateUtils = require("../../core/utils/date");
    var intervalMap = {
        secondly: "seconds",
        minutely: "minutes",
        hourly: "hours",
        daily: "days",
        weekly: "weeks",
        monthly: "months",
        yearly: "years"
    };
    var dateSetterMap = {
        bysecond: function(date, value) {
            date.setSeconds(value)
        },
        byminute: function(date, value) {
            date.setMinutes(value)
        },
        byhour: function(date, value) {
            date.setHours(value)
        },
        bymonth: function(date, value) {
            date.setMonth(value)
        },
        bymonthday: function(date, value) {
            date.setDate(value);
            correctDate(date, value)
        },
        byday: function(date, dayOfWeek) {
            date.setDate(date.getDate() - date.getDay() + dayOfWeek)
        }
    };
    var dateGetterMap = {
        bysecond: "getSeconds",
        byminute: "getMinutes",
        byhour: "getHours",
        bymonth: "getMonth",
        bymonthday: "getDate",
        byday: "getDay"
    };
    var ruleNames = ["freq", "interval", "byday", "bymonth", "bymonthday", "count", "until", "byhour", "byminute", "bysecond"],
        freqNames = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "SECONDLY", "MINUTELY", "HOURLY"],
        days = {
            SU: 0,
            MO: 1,
            TU: 2,
            WE: 3,
            TH: 4,
            FR: 5,
            SA: 6
        };
    var dateInRecurrenceRange = function(recurrenceString, currentDate, viewStartDate, viewEndDate, recurrenceException) {
        var result = [];
        if (recurrenceString) {
            result = getDatesByRecurrence(recurrenceString, currentDate, viewStartDate, viewEndDate, recurrenceException)
        }
        return !!result.length
    };
    var normalizeInterval = function(freq, interval) {
        var intervalObject = {},
            intervalField = intervalMap[freq.toLowerCase()];
        intervalObject[intervalField] = interval;
        return intervalObject
    };
    var getDatesByRecurrenceException = function(ruleValues) {
        var result = [];
        for (var i = 0, len = ruleValues.length; i < len; i++) {
            result[i] = getDateByAsciiString(ruleValues[i])
        }
        return result
    };
    var dateIsRecurrenceException = function(date, recurrenceException) {
        var result = false;
        if (!recurrenceException) {
            return result
        }
        var splittedDates = recurrenceException.split(","),
            exceptDates = getDatesByRecurrenceException(splittedDates),
            shortFormat = /\d{8}$/;
        for (var i = 0, len = exceptDates.length; i < len; i++) {
            if (splittedDates[i].match(shortFormat)) {
                var diffs = getDatePartDiffs(date, exceptDates[i]);
                if (0 === diffs.years && 0 === diffs.months && 0 === diffs.days) {
                    result = true
                }
            } else {
                if (date.getTime() === exceptDates[i].getTime()) {
                    result = true
                }
            }
        }
        return result
    };
    var doNextIteration = function(date, startIntervalDate, endIntervalDate, recurrenceRule, iterationCount) {
        var dateInInterval, matchCountIsCorrect = true;
        endIntervalDate = endIntervalDate.getTime();
        if (recurrenceRule.until) {
            if (recurrenceRule.until.getTime() < endIntervalDate) {
                endIntervalDate = recurrenceRule.until.getTime()
            }
        }
        if (recurrenceRule.count) {
            if (iterationCount === recurrenceRule.count) {
                matchCountIsCorrect = false
            }
        }
        dateInInterval = date.getTime() >= startIntervalDate.getTime() && date.getTime() <= endIntervalDate;
        return dateInInterval && matchCountIsCorrect
    };
    var getDatesByRecurrence = function(recurrenceString, recurrenceStartDate, viewStartDate, viewEndDate, recurrenceException) {
        var dateRules, result = [],
            recurrenceRule = getRecurrenceRule(recurrenceString),
            rule = recurrenceRule.rule,
            iterationCount = 0;
        if (!recurrenceRule.isValid || !rule.freq) {
            return result
        }
        rule.interval = normalizeInterval(rule.freq, rule.interval);
        dateRules = splitDateRules(rule);
        getDatesByRules(dateRules, new Date(recurrenceStartDate)).forEach(function(currentDate, i) {
            while (doNextIteration(currentDate, recurrenceStartDate, viewEndDate, rule, iterationCount)) {
                iterationCount++;
                if (!dateIsRecurrenceException(currentDate, recurrenceException)) {
                    if (currentDate.getTime() >= viewStartDate.getTime()) {
                        if (checkDateByRule(currentDate, [dateRules[i]])) {
                            result.push(currentDate)
                        }
                    }
                }
                currentDate = incrementDate(currentDate, recurrenceStartDate, rule, i)
            }
        });
        return result.sort(function(a, b) {
            return a - b
        })
    };
    var correctDate = function(originalDate, date) {
        if (originalDate.getDate() !== date) {
            originalDate.setDate(date)
        }
    };
    var incrementDate = function(date, originalStartDate, rule, iterationStep) {
        date = dateUtils.addInterval(date, rule.interval);
        if ("MONTHLY" === rule.freq) {
            var expectedDate = originalStartDate.getDate();
            if (rule.bymonthday) {
                expectedDate = Number(rule.bymonthday.split(",")[iterationStep])
            }
            correctDate(date, expectedDate)
        }
        return date
    };
    var getDatePartDiffs = function(date1, date2) {
        return {
            years: date1.getFullYear() - date2.getFullYear(),
            months: date1.getMonth() - date2.getMonth(),
            days: date1.getDate() - date2.getDate(),
            hours: date1.getHours() - date2.getHours(),
            minutes: date1.getMinutes() - date2.getMinutes(),
            seconds: date1.getSeconds() - date2.getSeconds()
        }
    };
    var getRecurrenceRule = function(recurrence) {
        var result = {
            rule: {},
            isValid: false
        };
        if (recurrence) {
            result.rule = parseRecurrenceRule(recurrence);
            result.isValid = validateRRule(result.rule, recurrence)
        }
        return result
    };
    var loggedWarnings = [];
    var validateRRule = function(rule, recurrence) {
        if (brokenRuleNameExists(rule) || $.inArray(rule.freq, freqNames) === -1 || wrongCountRule(rule) || wrongIntervalRule(rule) || wrongDayOfWeek(rule) || wrongByMonthDayRule(rule) || wrongByMonth(rule) || wrongUntilRule(rule)) {
            logBrokenRule(recurrence);
            return false
        }
        return true
    };
    var wrongUntilRule = function(rule) {
        var wrongUntil = false,
            until = rule.until;
        if (void 0 !== until && !(until instanceof Date)) {
            wrongUntil = true
        }
        return wrongUntil
    };
    var wrongCountRule = function(rule) {
        var wrongCount = false,
            count = rule.count;
        if (count && "string" === typeof count) {
            wrongCount = true
        }
        return wrongCount
    };
    var wrongByMonthDayRule = function(rule) {
        var wrongByMonthDay = false,
            byMonthDay = rule.bymonthday;
        if (byMonthDay && isNaN(parseInt(byMonthDay))) {
            wrongByMonthDay = true
        }
        return wrongByMonthDay
    };
    var wrongByMonth = function(rule) {
        var wrongByMonth = false,
            byMonth = rule.bymonth;
        if (byMonth && isNaN(parseInt(byMonth))) {
            wrongByMonth = true
        }
        return wrongByMonth
    };
    var wrongIntervalRule = function(rule) {
        var wrongInterval = false,
            interval = rule.interval;
        if (interval && "string" === typeof interval) {
            wrongInterval = true
        }
        return wrongInterval
    };
    var wrongDayOfWeek = function(rule) {
        var daysByRule = daysFromByDayRule(rule),
            brokenDaysExist = false;
        $.each(daysByRule, function(_, day) {
            if (!days.hasOwnProperty(day)) {
                brokenDaysExist = true;
                return false
            }
        });
        return brokenDaysExist
    };
    var brokenRuleNameExists = function(rule) {
        var brokenRuleExists = false;
        $.each(rule, function(ruleName, _) {
            if ($.inArray(ruleName, ruleNames) === -1) {
                brokenRuleExists = true;
                return false
            }
        });
        return brokenRuleExists
    };
    var logBrokenRule = function(recurrence) {
        if ($.inArray(recurrence, loggedWarnings) === -1) {
            errors.log("W0006", recurrence);
            loggedWarnings.push(recurrence)
        }
    };
    var parseRecurrenceRule = function(recurrence) {
        var ruleObject = {},
            ruleParts = recurrence.split(";");
        for (var i = 0, len = ruleParts.length; i < len; i++) {
            var rule = ruleParts[i].split("="),
                ruleName = rule[0].toLowerCase(),
                ruleValue = rule[1];
            ruleObject[ruleName] = ruleValue
        }
        var count = parseInt(ruleObject.count);
        if (!isNaN(count)) {
            ruleObject.count = count
        }
        if (ruleObject.interval) {
            var interval = parseInt(ruleObject.interval);
            if (!isNaN(interval)) {
                ruleObject.interval = interval
            }
        } else {
            ruleObject.interval = 1
        }
        if (ruleObject.freq && ruleObject.until) {
            ruleObject.until = getDateByAsciiString(ruleObject.until)
        }
        return ruleObject
    };
    var getDateByAsciiString = function(string) {
        if ("string" !== typeof string) {
            return string
        }
        var arrayDate = string.match(/(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2}))?(Z)?/);
        if (!arrayDate) {
            return null
        }
        var isUTC = void 0 !== arrayDate[8],
            currentOffset = 6e4 * (new Date).getTimezoneOffset(),
            date = new(Function.prototype.bind.apply(Date, prepareDateArrayToParse(arrayDate)));
        if (isUTC) {
            date = new Date(date.getTime() - currentOffset)
        }
        return date
    };
    var prepareDateArrayToParse = function(arrayDate) {
        arrayDate.shift();
        if (void 0 === arrayDate[3]) {
            arrayDate.splice(3)
        } else {
            arrayDate.splice(3, 1);
            arrayDate.splice(6)
        }
        arrayDate[1]--;
        arrayDate.unshift(null);
        return arrayDate
    };
    var daysFromByDayRule = function(rule) {
        var result = [];
        if (rule.byday) {
            result = rule.byday.split(",")
        }
        return result
    };
    var getAsciiStringByDate = function(date) {
        var currentOffset = 6e4 * (new Date).getTimezoneOffset();
        date = new Date(date.getTime() + currentOffset);
        return date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2) + "Z"
    };
    var splitDateRules = function(rule) {
        var result = [];
        for (var field in dateSetterMap) {
            if (!rule[field]) {
                continue
            }
            var ruleFieldValues = rule[field].split(","),
                ruleArray = getDateRuleArray(field, ruleFieldValues);
            result = result.length ? extendObjectArray(ruleArray, result) : ruleArray
        }
        return result
    };
    var getDateRuleArray = function(field, values) {
        var result = [];
        for (var i = 0, length = values.length; i < length; i++) {
            var dateRule = {};
            dateRule[field] = handleRuleFieldValue(field, values[i]);
            result.push(dateRule)
        }
        return result
    };
    var handleRuleFieldValue = function(field, value) {
        var result = parseInt(value);
        if ("bymonth" === field) {
            result -= 1
        }
        if ("byday" === field) {
            result = days[value]
        }
        return result
    };
    var extendObjectArray = function(firstArray, secondArray) {
        var result = [];
        for (var i = 0, firstArrayLength = firstArray.length; i < firstArrayLength; i++) {
            for (var j = 0, secondArrayLength = secondArray.length; j < secondArrayLength; j++) {
                result.push($.extend({}, firstArray[i], secondArray[j]))
            }
        }
        return result
    };
    var getDatesByRules = function(dateRules, startDate) {
        var updatedDate = new Date(startDate),
            result = [];
        for (var i = 0, len = dateRules.length; i < len; i++) {
            var current = dateRules[i];
            for (var field in current) {
                dateSetterMap[field](updatedDate, current[field])
            }
            result.push(new Date(updatedDate))
        }
        if (!result.length) {
            result.push(updatedDate)
        }
        return result
    };
    var checkDateByRule = function(date, rules) {
        var result = false;
        for (var i = 0; i < rules.length; i++) {
            var current = rules[i],
                currentRuleResult = true;
            for (var field in current) {
                if (current[field] !== date[dateGetterMap[field]]()) {
                    currentRuleResult = false
                }
            }
            result = result || currentRuleResult
        }
        return result || !rules.length
    };
    var getRecurrenceString = function(object) {
        if (!object || !object.freq) {
            return
        }
        var result = "";
        for (var field in object) {
            var value = object[field];
            if ("interval" === field && value < 2) {
                continue
            }
            if ("until" === field) {
                value = getAsciiStringByDate(value)
            }
            result += field + "=" + value + ";"
        }
        result = result.substring(0, result.length - 1);
        return result.toUpperCase()
    };
    module.exports = {
        getRecurrenceString: getRecurrenceString,
        getRecurrenceRule: getRecurrenceRule,
        getAsciiStringByDate: getAsciiStringByDate,
        getDatesByRecurrence: getDatesByRecurrence,
        dateInRecurrenceRange: dateInRecurrenceRange,
        getDateByAsciiString: getDateByAsciiString,
        daysFromByDayRule: daysFromByDayRule
    }
});
