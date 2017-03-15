/** 
 * DevExtreme (ui/scheduler/ui.scheduler.appointments.strategy.base.js)
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
        errors = require("../widget/ui.errors");
    var abstract = Class.abstract;
    var APPOINTMENT_MIN_SIZE = 2,
        COMPACT_APPOINTMENT_DEFAULT_SIZE = 15,
        COMPACT_APPOINTMENT_DEFAULT_OFFSET = 3;
    var BaseRenderingStrategy = Class.inherit({
        ctor: function(instance) {
            this.instance = instance
        },
        getAppointmentMinSize: function() {
            return APPOINTMENT_MIN_SIZE
        },
        getDeltaTime: abstract,
        getAppointmentGeometry: function(coordinates) {
            return coordinates
        },
        createTaskPositionMap: function(items) {
            var length = items.length;
            if (!length) {
                return
            }
            this._defaultWidth = this.instance._cellWidth;
            this._defaultHeight = this.instance._cellHeight;
            this._allDayHeight = this.instance._allDayCellHeight;
            var map = [];
            for (var i = 0; i < length; i++) {
                var coordinates = this._getItemPosition(items[i]);
                if (this._isRtl()) {
                    coordinates = this._correctRtlCoordinates(coordinates)
                }
                map.push(coordinates)
            }
            var positionArray = this._getSortedPositions(map),
                resultPositions = this._getResultPositions(positionArray);
            return this._getExtendedPositionMap(map, resultPositions)
        },
        _getDeltaWidth: function(args, initialSize) {
            var cellWidth = this._defaultWidth || this.getAppointmentMinSize(),
                initialWidth = initialSize.width;
            return Math.round((args.width - initialWidth) / cellWidth)
        },
        _correctRtlCoordinates: function(coordinates) {
            var width = coordinates[0].width || this._getAppointmentMaxWidth();
            if (!coordinates[0].appointmentReduced) {
                coordinates[0].left -= width
            }
            this._correctRtlCoordinatesParts(coordinates, width);
            return coordinates
        },
        _correctRtlCoordinatesParts: $.noop,
        _getAppointmentMaxWidth: function() {
            return this._defaultWidth
        },
        _getItemPosition: function(item) {
            var height = this.calculateAppointmentHeight(item),
                width = this.calculateAppointmentWidth(item),
                position = this._getAppointmentCoordinates(item),
                allDay = this.isAllDay(item),
                result = [],
                startDate = this.instance.invoke("getField", "startDate", item);
            for (var j = 0; j < position.length; j++) {
                var resultWidth = width,
                    appointmentReduced = null,
                    multiWeekAppointmentParts = [];
                if (this._needVerifyItemSize() || allDay) {
                    var currentMaxAllowedPosition = position[j].max;
                    if (this.isAppointmentGreaterThan(currentMaxAllowedPosition, {
                            left: position[j].left,
                            width: width
                        })) {
                        appointmentReduced = "head";
                        resultWidth = this._reduceMultiWeekAppointment(width, {
                            left: position[j].left,
                            right: currentMaxAllowedPosition
                        });
                        multiWeekAppointmentParts = this._getMultiWeekAppointmentParts({
                            sourceAppointmentWidth: width,
                            reducedWidth: resultWidth,
                            height: height
                        }, position[j], startDate, j);
                        if (this._isRtl()) {
                            position[j].left = currentMaxAllowedPosition
                        }
                    }
                }
                $.extend(position[j], {
                    height: height,
                    width: resultWidth,
                    allDay: allDay,
                    appointmentReduced: appointmentReduced
                });
                if (multiWeekAppointmentParts.length) {
                    multiWeekAppointmentParts.unshift(position[j]);
                    result = result.concat(multiWeekAppointmentParts)
                } else {
                    result.push(position[j])
                }
            }
            return result
        },
        _getAppointmentCoordinates: function(itemData) {
            var coordinates = [{
                top: 0,
                left: 0
            }];
            this.instance.notifyObserver("needCoordinates", {
                startDate: this._startDate(itemData),
                originalStartDate: this._startDate(itemData, true),
                appointmentData: itemData,
                callback: function(value) {
                    coordinates = value
                }
            });
            return coordinates
        },
        _needVerifyItemSize: function() {
            return false
        },
        _isRtl: function() {
            return this.instance.option("rtlEnabled")
        },
        _getMultiWeekAppointmentParts: function() {
            return []
        },
        _getCompactAppointmentParts: function(appointmentWidth) {
            var cellWidth = this._defaultWidth || this.getAppointmentMinSize();
            return Math.round(appointmentWidth / cellWidth)
        },
        _reduceMultiWeekAppointment: function(sourceAppointmentWidth, bound) {
            if (this._isRtl()) {
                sourceAppointmentWidth = Math.floor(bound.left - bound.right)
            } else {
                sourceAppointmentWidth = bound.right - Math.floor(bound.left)
            }
            return sourceAppointmentWidth
        },
        calculateAppointmentHeight: function() {
            return 0
        },
        calculateAppointmentWidth: function() {
            return 0
        },
        isAppointmentGreaterThan: function(etalon, comparisonParameters) {
            var result = comparisonParameters.left + comparisonParameters.width - etalon;
            if (this._isRtl()) {
                result = etalon + comparisonParameters.width - comparisonParameters.left
            }
            return result > this._defaultWidth / 2
        },
        isAllDay: function() {
            return false
        },
        _getSortedPositions: function(arr) {
            var result = [],
                __tmpIndex = 0;
            for (var i = 0, arrLength = arr.length; i < arrLength; i++) {
                for (var j = 0, itemLength = arr[i].length; j < itemLength; j++) {
                    var item = arr[i][j];
                    var start = {
                        i: i,
                        j: j,
                        top: item.top,
                        left: item.left,
                        isStart: true,
                        allDay: item.allDay,
                        __tmpIndex: __tmpIndex
                    };
                    __tmpIndex++;
                    var end = {
                        i: i,
                        j: j,
                        top: item.top + item.height,
                        left: item.left + item.width,
                        isStart: false,
                        allDay: item.allDay,
                        __tmpIndex: __tmpIndex
                    };
                    result.push(start, end);
                    __tmpIndex++
                }
            }
            result.sort($.proxy(function(a, b) {
                return this._sortCondition(a, b)
            }, this));
            return result
        },
        _fixUnstableSorting: function(comparisonResult, a, b) {
            if (0 === comparisonResult) {
                if (a.__tmpIndex < b.__tmpIndex) {
                    return -1
                }
                if (a.__tmpIndex > b.__tmpIndex) {
                    return 1
                }
            }
            return comparisonResult
        },
        _sortCondition: abstract,
        _rowCondition: function(a, b) {
            var columnCondition = this._normalizeCondition(a.left, b.left),
                rowCondition = this._normalizeCondition(a.top, b.top);
            return columnCondition ? columnCondition : rowCondition ? rowCondition : a.isStart - b.isStart
        },
        _columnCondition: function(a, b) {
            var columnCondition = this._normalizeCondition(a.left, b.left),
                rowCondition = this._normalizeCondition(a.top, b.top);
            return rowCondition ? rowCondition : columnCondition ? columnCondition : a.isStart - b.isStart
        },
        _normalizeCondition: function(first, second) {
            var result = first - second;
            return Math.abs(result) > 1.001 ? result : 0
        },
        _getResultPositions: function(sortedArray) {
            var position, stack = [],
                indexes = [],
                result = [],
                intersectPositions = [],
                intersectPositionCount = 0,
                sortedIndex = 0;
            for (var i = 0; i < sortedArray.length; i++) {
                var j, current = sortedArray[i];
                if (current.isStart) {
                    position = void 0;
                    for (j = 0; j < indexes.length; j++) {
                        if (!indexes[j]) {
                            position = j;
                            indexes[j] = true;
                            break
                        }
                    }
                    if (void 0 === position) {
                        position = indexes.length;
                        indexes.push(true);
                        for (j = 0; j < stack.length; j++) {
                            stack[j].count++
                        }
                    }
                    stack.push({
                        index: position,
                        count: indexes.length,
                        i: current.i,
                        j: current.j,
                        sortedIndex: sortedIndex++
                    });
                    if (intersectPositionCount < indexes.length) {
                        intersectPositionCount = indexes.length
                    }
                } else {
                    var removeIndex = this._findIndexByKey(stack, "i", "j", current.i, current.j),
                        resultItem = stack[removeIndex];
                    stack.splice(removeIndex, 1);
                    indexes[resultItem.index] = false;
                    intersectPositions.push(resultItem);
                    if (!stack.length) {
                        indexes = [];
                        for (var k = 0; k < intersectPositions.length; k++) {
                            intersectPositions[k].count = intersectPositionCount
                        }
                        intersectPositions = [];
                        intersectPositionCount = 0
                    }
                    result.push(resultItem)
                }
            }
            return result.sort(function(a, b) {
                var columnCondition = a.j - b.j,
                    rowCondition = a.i - b.i;
                return rowCondition ? rowCondition : columnCondition
            })
        },
        _findIndexByKey: function(arr, ikey, jkey, ivalue, jvalue) {
            var result = 0;
            for (var i = 0, len = arr.length; i < len; i++) {
                if (arr[i][ikey] === ivalue && arr[i][jkey] === jvalue) {
                    result = i;
                    break
                }
            }
            return result
        },
        _getExtendedPositionMap: function(map, positions) {
            var positionCounter = 0,
                result = [];
            for (var i = 0, mapLength = map.length; i < mapLength; i++) {
                var resultString = [];
                for (var j = 0, itemLength = map[i].length; j < itemLength; j++) {
                    map[i][j].index = positions[positionCounter].index;
                    map[i][j].sortedIndex = positions[positionCounter].sortedIndex;
                    map[i][j].count = positions[positionCounter++].count;
                    resultString.push(map[i][j]);
                    this._checkLongCompactAppointment(map[i][j], resultString)
                }
                result.push(resultString)
            }
            return result
        },
        _checkLongCompactAppointment: $.noop,
        _splitLongCompactAppointment: function(item, result) {
            var compactCount = 0;
            if (item.index > 1) {
                item.isCompact = true;
                compactCount = this._getCompactAppointmentParts(item.width);
                for (var k = 1; k < compactCount; k++) {
                    var compactPart = $.extend(true, {}, item);
                    compactPart.left = this._getCompactLeftCoordinate(item.left, k);
                    compactPart.cellIndex = compactPart.cellIndex + k;
                    compactPart.sortedIndex = null;
                    result.push(compactPart)
                }
            }
            return result
        },
        _startDate: function(appointment, skipNormalize) {
            var startDate = this.instance._getStartDate(appointment, skipNormalize),
                text = this.instance.invoke("getField", "text", appointment);
            if (isNaN(startDate.getTime())) {
                throw errors.Error("E1032", text)
            }
            return startDate
        },
        _endDate: function(appointment) {
            var endDate = this.instance._getEndDate(appointment),
                realStartDate = this._startDate(appointment, true),
                viewStartDate = this._startDate(appointment);
            if (!endDate || realStartDate.getTime() >= endDate.getTime()) {
                endDate = new Date(realStartDate.getTime() + 6e4 * this.instance.option("appointmentDurationInMinutes"));
                this.instance.invoke("setField", "endDate", appointment, endDate)
            }
            if (viewStartDate >= endDate) {
                var duration = endDate.getTime() - realStartDate.getTime();
                endDate = new Date(viewStartDate.getTime() + duration)
            }
            return endDate
        },
        _getMaxNeighborAppointmentCount: function() {
            var outerAppointmentWidth = this.getCompactAppointmentDefaultSize() + this.getCompactAppointmentDefaultOffset();
            return Math.floor(this.getCompactAppointmentGroupMaxWidth() / outerAppointmentWidth)
        },
        _markAppointmentAsVirtual: function(coordinates, isAllDay) {
            var countFullWidthAppointmentInCell = 2;
            if (coordinates.count - countFullWidthAppointmentInCell > this._getMaxNeighborAppointmentCount()) {
                coordinates.virtual = {
                    top: coordinates.top,
                    left: coordinates.left,
                    index: coordinates.rowIndex + "-" + coordinates.cellIndex,
                    isAllDay: isAllDay
                }
            }
        },
        getCompactAppointmentGroupMaxWidth: function() {
            var widthInPercents = 75;
            return widthInPercents * this.getDefaultCellWidth() / 100
        },
        getDefaultCellWidth: function() {
            return this._defaultWidth
        },
        getCompactAppointmentDefaultSize: function() {
            return COMPACT_APPOINTMENT_DEFAULT_SIZE
        },
        getCompactAppointmentDefaultOffset: function() {
            return COMPACT_APPOINTMENT_DEFAULT_OFFSET
        },
        getAppointmentDataCalculator: $.noop
    });
    module.exports = BaseRenderingStrategy
});
