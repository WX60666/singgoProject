/** 
 * DevExtreme (viz/core/utils.js)
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
        commonUtils = require("../../core/utils/common"),
        _isDefined = commonUtils.isDefined,
        _inArray = $.inArray,
        _each = $.each,
        _math = Math,
        _round = _math.round,
        _sqrt = Math.sqrt,
        _extend = $.extend;
    var PI = Math.PI,
        MAX_PIXEL_COUNT = 1e10,
        PI_DIV_180 = PI / 180,
        LN10 = Math.LN10;
    var cosFunc = Math.cos,
        sinFunc = Math.sin,
        abs = Math.abs,
        log = Math.log,
        floor = Math.floor,
        ceil = Math.ceil,
        max = Math.max,
        isNaN = window.isNaN,
        Number = window.Number,
        NaN = window.NaN;
    var isNumber = commonUtils.isNumber,
        isExponential = commonUtils.isExponential;
    var getPrecision = function(value) {
        var stringFraction, startIndex, precision, stringValue = value.toString(),
            pointIndex = stringValue.indexOf(".");
        if (isExponential(value)) {
            precision = getDecimalOrder(value);
            if (precision < 0) {
                return Math.abs(precision)
            } else {
                return 0
            }
        }
        if (pointIndex !== -1) {
            startIndex = pointIndex + 1;
            stringFraction = stringValue.substring(startIndex, startIndex + 20);
            return stringFraction.length
        }
        return 0
    };
    var getLog = function(value, base) {
        if (!value) {
            return NaN
        }
        return Math.log(value) / Math.log(base)
    };
    var raiseTo = function(power, base) {
        return Math.pow(base, power)
    };
    var normalizeAngle = function(angle) {
        return (angle % 360 + 360) % 360
    };
    var convertAngleToRendererSpace = function(angle) {
        return 90 - angle
    };
    var degreesToRadians = function(value) {
        return PI * value / 180
    };
    var getCosAndSin = function(angle) {
        var angleInRadians = degreesToRadians(angle);
        return {
            cos: cosFunc(angleInRadians),
            sin: sinFunc(angleInRadians)
        }
    };
    var DECIMAL_ORDER_THRESHOLD = 1e-14;
    var getDistance = function(x1, y1, x2, y2) {
        var diffX = x2 - x1,
            diffY = y2 - y1;
        return Math.sqrt(diffY * diffY + diffX * diffX)
    };
    var getDecimalOrder = function(number) {
        var cn, n = abs(number);
        if (!isNaN(n)) {
            if (n > 0) {
                n = log(n) / LN10;
                cn = ceil(n);
                return cn - n < DECIMAL_ORDER_THRESHOLD ? cn : floor(n)
            }
            return 0
        }
        return NaN
    };
    var getAppropriateFormat = function(start, end, count) {
        var format, order = max(getDecimalOrder(start), getDecimalOrder(end)),
            precision = -getDecimalOrder(abs(end - start) / count);
        if (!isNaN(order) && !isNaN(precision)) {
            if (abs(order) <= 4) {
                format = "fixedPoint";
                precision < 0 && (precision = 0);
                precision > 4 && (precision = 4)
            } else {
                format = "exponential";
                precision += order - 1;
                precision > 3 && (precision = 3)
            }
            return {
                type: format,
                precision: precision
            }
        }
        return null
    };
    var getFraction = function(value) {
        var valueString, dotIndex;
        if (isNumber(value)) {
            valueString = value.toString();
            dotIndex = valueString.indexOf(".");
            if (dotIndex >= 0) {
                if (isExponential(value)) {
                    return valueString.substr(dotIndex + 1, valueString.indexOf("e") - dotIndex - 1)
                } else {
                    valueString = value.toFixed(20);
                    return valueString.substr(dotIndex + 1, valueString.length - dotIndex + 1)
                }
            }
        }
        return ""
    };
    var getSignificantDigitPosition = function(value) {
        var i, fraction = getFraction(value);
        if (fraction) {
            for (i = 0; i < fraction.length; i++) {
                if ("0" !== fraction.charAt(i)) {
                    return i + 1
                }
            }
        }
        return 0
    };
    var adjustValue = function(value) {
        var nextValue, i, fraction = getFraction(value);
        if (fraction) {
            for (i = 1; i <= fraction.length; i++) {
                nextValue = roundValue(value, i);
                if (0 !== nextValue && fraction[i - 2] && fraction[i - 1] && fraction[i - 2] === fraction[i - 1]) {
                    return nextValue
                }
            }
        }
        return value
    };
    var roundValue = function(value, precision) {
        if (precision > 20) {
            precision = 20
        }
        if (isNumber(value)) {
            if (isExponential(value)) {
                return Number(value.toExponential(precision))
            } else {
                return Number(value.toFixed(precision))
            }
        }
    };
    var applyPrecisionByMinDelta = function(min, delta, value) {
        var minPrecision = getPrecision(min),
            deltaPrecision = getPrecision(delta);
        return roundValue(value, minPrecision < deltaPrecision ? deltaPrecision : minPrecision)
    };
    var getPower = function(value) {
        return value.toExponential().split("e")[1]
    };

    function map(array, callback) {
        var value, i = 0,
            len = array.length,
            ret = [];
        while (i < len) {
            value = callback(array[i], i);
            if (null !== value) {
                ret.push(value)
            }
            i++
        }
        return ret
    }

    function selectByKeys(object, keys) {
        return map(keys, function(key) {
            return object[key] ? object[key] : null
        })
    }

    function decreaseFields(object, keys, eachDecrease, decrease) {
        var dec = decrease;
        _each(keys, function(_, key) {
            if (object[key]) {
                object[key] -= eachDecrease;
                dec -= eachDecrease
            }
        });
        return dec
    }

    function normalizeEnum(value) {
        return String(value).toLowerCase()
    }

    function setCanvasValues(canvas) {
        if (canvas) {
            canvas.originalTop = canvas.top;
            canvas.originalBottom = canvas.bottom;
            canvas.originalLeft = canvas.left;
            canvas.originalRight = canvas.right
        }
    }

    function normalizeBBoxField(value) {
        return -MAX_PIXEL_COUNT < value && value < +MAX_PIXEL_COUNT ? value : 0
    }

    function normalizeBBox(bbox) {
        var rxl = normalizeBBoxField(floor(bbox.x)),
            ryt = normalizeBBoxField(floor(bbox.y)),
            rxr = normalizeBBoxField(ceil(bbox.width + bbox.x)),
            ryb = normalizeBBoxField(ceil(bbox.height + bbox.y)),
            result = {
                x: rxl,
                y: ryt,
                width: rxr - rxl,
                height: ryb - ryt
            };
        result.isEmpty = !result.x && !result.y && !result.width && !result.height;
        return result
    }

    function rotateBBox(bbox, center, angle) {
        var cos = Number(cosFunc(angle * PI_DIV_180).toFixed(3)),
            sin = Number(sinFunc(angle * PI_DIV_180).toFixed(3)),
            w2 = bbox.width / 2,
            h2 = bbox.height / 2,
            xc = bbox.x + w2,
            yc = bbox.y + h2,
            w2_ = abs(w2 * cos) + abs(h2 * sin),
            h2_ = abs(w2 * sin) + abs(h2 * cos),
            xc_ = center[0] + (xc - center[0]) * cos + (yc - center[1]) * sin,
            yc_ = center[1] - (xc - center[0]) * sin + (yc - center[1]) * cos;
        return normalizeBBox({
            x: xc_ - w2_,
            y: yc_ - h2_,
            width: 2 * w2_,
            height: 2 * h2_
        })
    }
    $.extend(exports, {
        decreaseGaps: function(object, keys, decrease) {
            var arrayGaps;
            do {
                arrayGaps = selectByKeys(object, keys);
                arrayGaps.push(_math.ceil(decrease / arrayGaps.length));
                decrease = decreaseFields(object, keys, _math.min.apply(null, arrayGaps), decrease)
            } while (decrease > 0 && arrayGaps.length > 1);
            return decrease
        },
        normalizeEnum: normalizeEnum,
        parseScalar: function(value, defaultValue) {
            return void 0 !== value ? value : defaultValue
        },
        enumParser: function(values) {
            var i, ii, stored = {};
            for (i = 0, ii = values.length; i < ii; ++i) {
                stored[normalizeEnum(values[i])] = 1
            }
            return function(value, defaultValue) {
                var _value = normalizeEnum(value);
                return stored[_value] ? _value : defaultValue
            }
        },
        patchFontOptions: function(options) {
            var fontOptions = {};
            _each(options || {}, function(key, value) {
                if (/^(cursor|opacity)$/i.test(key)) {} else {
                    if ("color" === key) {
                        key = "fill"
                    } else {
                        key = "font-" + key
                    }
                }
                fontOptions[key] = value
            });
            return fontOptions
        },
        convertPolarToXY: function(centerCoords, startAngle, angle, radius) {
            var cossin, shiftAngle = 90;
            angle = _isDefined(angle) ? angle + startAngle - shiftAngle : 0;
            cossin = getCosAndSin(angle);
            return {
                x: _round(centerCoords.x + radius * cossin.cos),
                y: _round(centerCoords.y + radius * cossin.sin)
            }
        },
        convertXYToPolar: function(centerCoords, x, y) {
            var radius = getDistance(centerCoords.x, centerCoords.y, x, y),
                angle = _math.atan2(y - centerCoords.y, x - centerCoords.x);
            return {
                phi: _round(normalizeAngle(180 * angle / _math.PI)),
                r: _round(radius)
            }
        },
        processSeriesTemplate: function(seriesTemplate, items) {
            var series, length, data, customizeSeries = commonUtils.isFunction(seriesTemplate.customizeSeries) ? seriesTemplate.customizeSeries : $.noop,
                nameField = seriesTemplate.nameField || "series",
                generatedSeries = {},
                seriesOrder = [],
                i = 0;
            for (length = items.length; i < length; i++) {
                data = items[i];
                if (nameField in data) {
                    series = generatedSeries[data[nameField]];
                    if (!series) {
                        series = generatedSeries[data[nameField]] = {
                            name: data[nameField],
                            data: []
                        };
                        seriesOrder.push(series.name)
                    }
                    series.data.push(data)
                }
            }
            return map(seriesOrder, function(orderedName) {
                var group = generatedSeries[orderedName];
                return $.extend(group, customizeSeries.call(null, group.name))
            })
        },
        getCategoriesInfo: function(categories, startValue, endValue) {
            if (!(categories && categories.length > 0)) {
                return {}
            }
            startValue = _isDefined(startValue) ? startValue : categories[0];
            endValue = _isDefined(endValue) ? endValue : categories[categories.length - 1];
            var visibleCategories, swapBuf, hasVisibleCategories, visibleCategoriesLen, categoriesValue = map(categories, function(category) {
                    return _isDefined(category) ? category.valueOf() : null
                }),
                indexStartValue = _isDefined(startValue) ? _inArray(startValue.valueOf(), categoriesValue) : 0,
                indexEndValue = _isDefined(endValue) ? _inArray(endValue.valueOf(), categoriesValue) : categories.length - 1,
                inverted = false;
            indexStartValue < 0 && (indexStartValue = 0);
            indexEndValue < 0 && (indexEndValue = categories.length - 1);
            if (indexEndValue < indexStartValue) {
                swapBuf = indexEndValue;
                indexEndValue = indexStartValue;
                indexStartValue = swapBuf;
                inverted = true
            }
            visibleCategories = categories.slice(indexStartValue, indexEndValue + 1);
            visibleCategoriesLen = visibleCategories.length;
            hasVisibleCategories = visibleCategoriesLen > 0;
            return {
                categories: hasVisibleCategories ? visibleCategories : null,
                start: hasVisibleCategories ? visibleCategories[inverted ? visibleCategoriesLen - 1 : 0] : null,
                end: hasVisibleCategories ? visibleCategories[inverted ? 0 : visibleCategoriesLen - 1] : null,
                inverted: inverted
            }
        },
        setCanvasValues: setCanvasValues,
        updatePanesCanvases: function(panes, canvas, rotated) {
            var weightSum = 0;
            _each(panes, function(_, pane) {
                pane.weight = pane.weight || 1;
                weightSum += pane.weight
            });
            var distributedSpace = 0,
                padding = panes.padding || 10,
                paneSpace = rotated ? canvas.width - canvas.left - canvas.right : canvas.height - canvas.top - canvas.bottom,
                oneWeight = (paneSpace - padding * (panes.length - 1)) / weightSum,
                startName = rotated ? "left" : "top",
                endName = rotated ? "right" : "bottom";
            _each(panes, function(_, pane) {
                var calcLength = _round(pane.weight * oneWeight);
                pane.canvas = pane.canvas || {};
                _extend(pane.canvas, {
                    deltaLeft: 0,
                    deltaRight: 0,
                    deltaTop: 0,
                    deltaBottom: 0
                }, canvas);
                pane.canvas[startName] = canvas[startName] + distributedSpace;
                pane.canvas[endName] = canvas[endName] + (paneSpace - calcLength - distributedSpace);
                distributedSpace = distributedSpace + calcLength + padding;
                setCanvasValues(pane.canvas)
            })
        },
        unique: function(array) {
            var values = {};
            return map(array, function(item) {
                var result = !values[item] ? item : null;
                values[item] = true;
                return result
            })
        },
        map: map,
        getVerticallyShiftedAngularCoords: function(bbox, dy, center) {
            var isPositive = bbox.x + bbox.width / 2 >= center.x,
                dx1 = (isPositive ? bbox.x : bbox.x + bbox.width) - center.x,
                dy1 = bbox.y - center.y,
                dy2 = dy1 + dy,
                dx2 = _round(_sqrt(dx1 * dx1 + dy1 * dy1 - dy2 * dy2)),
                dx = (isPositive ? +dx2 : -dx2) || dx1;
            return {
                x: center.x + (isPositive ? dx : dx - bbox.width),
                y: bbox.y + dy
            }
        }
    });
    exports.getPrecision = getPrecision;
    exports.getLog = getLog;
    exports.raiseTo = raiseTo;
    exports.normalizeAngle = normalizeAngle;
    exports.convertAngleToRendererSpace = convertAngleToRendererSpace;
    exports.degreesToRadians = degreesToRadians;
    exports.getCosAndSin = getCosAndSin;
    exports.getDecimalOrder = getDecimalOrder;
    exports.getAppropriateFormat = getAppropriateFormat;
    exports.getDistance = getDistance;
    exports.getFraction = getFraction;
    exports.adjustValue = adjustValue;
    exports.roundValue = roundValue;
    exports.applyPrecisionByMinDelta = applyPrecisionByMinDelta;
    exports.getSignificantDigitPosition = getSignificantDigitPosition;
    exports.getPower = getPower;
    exports.rotateBBox = rotateBBox;
    exports.normalizeBBox = normalizeBBox
});
