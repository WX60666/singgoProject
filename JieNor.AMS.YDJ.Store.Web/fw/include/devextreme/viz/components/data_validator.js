/** 
 * DevExtreme (viz/components/data_validator.js)
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
        STRING = "string",
        NUMERIC = "numeric",
        DATETIME = "datetime",
        DISCRETE = "discrete",
        SEMIDISCRETE = "semidiscrete",
        CONTINUOUS = "continuous",
        LOGARITHMIC = "logarithmic",
        VALUE_TYPE = "valueType",
        ARGUMENT_TYPE = "argumentType",
        axisTypeParser = require("../core/utils").enumParser([STRING, NUMERIC, DATETIME]),
        _getParser = require("./parse_utils").getParser,
        _isDefined = commonUtils.isDefined,
        _isFunction = commonUtils.isFunction,
        _isArray = commonUtils.isArray,
        _isString = commonUtils.isString,
        _isDate = commonUtils.isDate,
        _isNumber = commonUtils.isNumber,
        _isObject = commonUtils.isObject,
        _each = $.each;

    function groupingValues(data, others, valueField, index) {
        if (index >= 0) {
            _each(data.slice(index), function(_, cell) {
                if (_isDefined(cell[valueField])) {
                    others[valueField] += cell[valueField];
                    cell[valueField] = cell["original" + valueField] = void 0
                }
            })
        }
    }

    function processGroup(_, group) {
        group.valueType = group.valueAxisType = null;
        _each(group.series, processSeries);
        group.valueAxis && group.valueAxis.resetTypes(VALUE_TYPE)
    }

    function parseCategories(categories, parser) {
        var newArray = [];
        _each(categories, function(_, category) {
            var parsedCategory = parser(category);
            void 0 !== parsedCategory && newArray.push(parsedCategory)
        });
        return newArray
    }

    function parseAxisCategories(groupsData, parsers) {
        var argumentCategories = groupsData.argumentOptions && groupsData.argumentOptions.categories,
            valueParser = parsers[1];
        _each(groupsData.groups, function(_, valueGroup) {
            var categories = valueGroup.valueOptions && valueGroup.valueOptions.categories;
            if (categories) {
                valueGroup.valueOptions.categories = parseCategories(categories, valueParser)
            }
        });
        if (argumentCategories) {
            groupsData.argumentOptions.categories = parseCategories(argumentCategories, parsers[0])
        }
    }

    function processSeries(_, series) {
        series.updateDataType({})
    }

    function resetAxisTypes(_, axis) {
        axis.resetTypes(ARGUMENT_TYPE)
    }

    function filterForLogAxis(val, field, incidentOccurred) {
        if (val <= 0) {
            incidentOccurred("E2004", [field]);
            val = null
        }
        return val
    }

    function eigen(x) {
        return x
    }

    function getType(unit, type) {
        var result = type;
        if (type === STRING || _isString(unit)) {
            result = STRING
        } else {
            if (type === DATETIME || _isDate(unit)) {
                result = DATETIME
            } else {
                if (_isNumber(unit)) {
                    result = NUMERIC
                }
            }
        }
        return result
    }

    function correctAxisType(type, axisType, hasCategories, incidentOccurred) {
        if (type === STRING && (axisType === CONTINUOUS || axisType === LOGARITHMIC || axisType === SEMIDISCRETE)) {
            incidentOccurred("E2002")
        }
        return axisType === LOGARITHMIC ? LOGARITHMIC : hasCategories || axisType === DISCRETE || type === STRING ? DISCRETE : axisType === SEMIDISCRETE ? SEMIDISCRETE : CONTINUOUS
    }

    function validUnit(unit, field, incidentOccurred) {
        if (unit) {
            incidentOccurred(!_isNumber(unit) && !_isDate(unit) && !_isString(unit) ? "E2003" : "E2004", [field])
        }
    }

    function createParserUnit(type, axisType, ignoreEmptyPoints, skipFields, incidentOccurred) {
        var parser = type ? _getParser(type) : eigen,
            filter = axisType === LOGARITHMIC ? filterForLogAxis : eigen;
        return function(unit, field) {
            var parseUnit = filter(parser(unit), field, incidentOccurred);
            null === parseUnit && ignoreEmptyPoints && (parseUnit = void 0);
            if (void 0 === parseUnit) {
                skipFields[field] = (skipFields[field] || 0) + 1;
                validUnit(unit, field, incidentOccurred)
            }
            return parseUnit
        }
    }

    function prepareParsers(groupsData, skipFields, incidentOccurred) {
        var sizeParser, valueParser, iep, argumentParser = createParserUnit(groupsData.argumentType, groupsData.argumentAxisType, false, skipFields, incidentOccurred),
            categoryParsers = [argumentParser],
            cache = {},
            list = [];
        _each(groupsData.groups, function(_, group) {
            _each(group.series, function(_, series) {
                iep = series.getOptions().ignoreEmptyPoints;
                valueParser = createParserUnit(group.valueType, group.valueAxisType, iep, skipFields, incidentOccurred);
                sizeParser = createParserUnit(NUMERIC, CONTINUOUS, iep, skipFields, incidentOccurred);
                cache[series.getArgumentField()] = argumentParser;
                _each(series.getValueFields(), function(_, field) {
                    !categoryParsers[1] && (categoryParsers[1] = valueParser);
                    cache[field] = valueParser
                });
                if (series.getSizeField()) {
                    cache[series.getSizeField()] = sizeParser
                }
                if (series.getTagField()) {
                    cache[series.getTagField()] = eigen
                }
            })
        });
        _each(cache, function(field, parser) {
            list.push([field, parser])
        });
        list.length && parseAxisCategories(groupsData, categoryParsers);
        return list
    }

    function getParsedCell(cell, parsers) {
        var i, field, value, ii = parsers.length,
            obj = {};
        for (i = 0; i < ii; ++i) {
            field = parsers[i][0];
            value = cell[field];
            obj[field] = parsers[i][1](value, field);
            obj["original" + field] = value
        }
        return obj
    }

    function parse(data, parsers) {
        var i, parsedData = [],
            ii = data.length;
        parsedData.length = ii;
        for (i = 0; i < ii; ++i) {
            parsedData[i] = getParsedCell(data[i], parsers)
        }
        return parsedData
    }

    function findIndexByThreshold(data, valueField, threshold) {
        var i, value, ii = data.length;
        for (i = 0; i < ii; ++i) {
            value = data[i][valueField];
            if (_isDefined(value) && threshold > value) {
                break
            }
        }
        return i
    }

    function groupMinSlices(originalData, argumentField, valueField, smallValuesGrouping) {
        smallValuesGrouping = smallValuesGrouping || {};
        var data, mode = smallValuesGrouping.mode,
            others = {};
        if (!mode || "none" === mode) {
            return
        }
        others[argumentField] = String(smallValuesGrouping.groupName || "others");
        others[valueField] = 0;
        data = originalData.slice();
        data.sort(function(a, b) {
            var isA = _isDefined(a[valueField]) ? 1 : 0,
                isB = _isDefined(b[valueField]) ? 1 : 0;
            return isA && isB ? b[valueField] - a[valueField] : isB - isA
        });
        groupingValues(data, others, valueField, "smallValueThreshold" === mode ? findIndexByThreshold(data, valueField, smallValuesGrouping.threshold) : smallValuesGrouping.topCount);
        others[valueField] && originalData.push(others)
    }

    function groupPieData(data, groupsData) {
        var firstSeries = groupsData.groups[0] && groupsData.groups[0].series[0],
            isPie = firstSeries && ("pie" === firstSeries.type || "doughnut" === firstSeries.type || "donut" === firstSeries.type);
        if (!isPie) {
            return
        }
        _each(groupsData.groups, function(_, group) {
            _each(group.series, function(_, series) {
                groupMinSlices(data, series.getArgumentField(), series.getValueFields()[0], series.getOptions().smallValuesGrouping)
            })
        })
    }

    function addUniqueItemToCollection(item, collection, itemsHash) {
        if (!itemsHash[item]) {
            collection.push(item);
            itemsHash[item] = true
        }
    }

    function getUniqueArgumentFields(groupsData) {
        var uniqueArgumentFields = [],
            hash = {};
        _each(groupsData.groups, function(_, group) {
            _each(group.series, function(__, series) {
                addUniqueItemToCollection(series.getArgumentField(), uniqueArgumentFields, hash)
            })
        });
        return uniqueArgumentFields
    }

    function discreteDataProcessing(data, groupsData, uniqueArgumentFields) {
        if (groupsData.argumentAxisType !== DISCRETE) {
            return
        }
        var userArgumentCategories = groupsData.argumentOptions ? groupsData.argumentOptions.categories : [],
            categories = groupsData.categories = $.extend([], userArgumentCategories),
            hash = {};
        categories.length && _each(categories, function(_, currentCategory) {
            hash[currentCategory] = true
        });
        _each(uniqueArgumentFields, function(_, field) {
            _each(data, function(_, item) {
                _isDefined(item[field]) && addUniqueItemToCollection(item[field], categories, hash)
            })
        })
    }

    function compareWithoutHash(argumentField) {
        return function(a, b) {
            var cmpResult = a[argumentField] - b[argumentField];
            if (isNaN(cmpResult)) {
                if (!a[argumentField]) {
                    return 1
                }
                if (!b[argumentField]) {
                    return -1
                }
                return 0
            }
            return cmpResult
        }
    }

    function sortAndCollectCategories(data, groupsData, sortingMethodOption, uniqueArgumentFields) {
        var getSortingMethod, itemsHash = {},
            dataByArguments = {},
            getSortMethodByType = function(sortingByHash, hash) {
                return sortingByHash ? function(argumentField) {
                    return function(a, b) {
                        return hash[a[argumentField]] - hash[b[argumentField]]
                    }
                } : compareWithoutHash
            };
        if (_isFunction(sortingMethodOption)) {
            data.sort(sortingMethodOption);
            discreteDataProcessing(data, groupsData, uniqueArgumentFields)
        } else {
            discreteDataProcessing(data, groupsData, uniqueArgumentFields);
            if (groupsData.categories) {
                _each(groupsData.categories, function(index, value) {
                    itemsHash[value] = index
                });
                getSortingMethod = getSortMethodByType(true, itemsHash)
            } else {
                if (true === sortingMethodOption && groupsData.argumentType !== STRING) {
                    getSortingMethod = getSortMethodByType(false, itemsHash)
                }
            }
        }
        _each(uniqueArgumentFields, function(_, argumentField) {
            var sortMethod, currentDataItem;
            if (getSortingMethod) {
                sortMethod = getSortingMethod(argumentField);
                currentDataItem = data.slice().sort(sortMethod)
            } else {
                currentDataItem = data
            }
            dataByArguments[argumentField] = currentDataItem
        });
        return dataByArguments
    }

    function checkValueTypeOfGroup(group, cell) {
        _each(group.series, function(_, series) {
            _each(series.getValueFields(), function(_, field) {
                group.valueType = getType(cell[field], group.valueType)
            })
        });
        return group.valueType
    }

    function checkArgumentTypeOfGroup(series, cell, groupsData) {
        _each(series, function(_, currentCeries) {
            groupsData.argumentType = getType(cell[currentCeries.getArgumentField()], groupsData.argumentType)
        });
        return groupsData.argumentType
    }

    function checkType(data, groupsData, checkTypeForAllData) {
        var groupsIndexes, groupsWithUndefinedValueType = [],
            groupsWithUndefinedArgumentType = [],
            argumentTypeGroup = groupsData.argumentOptions && axisTypeParser(groupsData.argumentOptions.argumentType);
        _each(groupsData.groups, function(_, group) {
            if (!group.series.length) {
                return null
            }
            var valueTypeGroup = group.valueOptions && axisTypeParser(group.valueOptions.valueType);
            group.valueType = valueTypeGroup;
            groupsData.argumentType = argumentTypeGroup;
            !valueTypeGroup && groupsWithUndefinedValueType.push(group);
            !argumentTypeGroup && groupsWithUndefinedArgumentType.push(group)
        });
        if (groupsWithUndefinedValueType.length || groupsWithUndefinedArgumentType.length) {
            groupsIndexes = groupsWithUndefinedValueType.map(function(_, index) {
                return index
            });
            _each(data, function(_, cell) {
                var defineArg;
                _each(groupsWithUndefinedValueType, function(groupIndex, group) {
                    if (checkValueTypeOfGroup(group, cell) && groupsIndexes.indexOf(groupIndex) >= 0) {
                        groupsIndexes.splice(groupIndex, 1)
                    }
                });
                if (!defineArg) {
                    _each(groupsWithUndefinedArgumentType, function(_, group) {
                        defineArg = checkArgumentTypeOfGroup(group.series, cell, groupsData)
                    })
                }
                if (!checkTypeForAllData && defineArg && 0 === groupsIndexes.length) {
                    return false
                }
            })
        }
    }

    function checkAxisType(groupsData, userArgumentCategories, incidentOccurred) {
        var argumentOptions = groupsData.argumentOptions || {},
            argumentAxisType = correctAxisType(groupsData.argumentType, argumentOptions.type, !!userArgumentCategories.length, incidentOccurred);
        _each(groupsData.groups, function(_, group) {
            var valueOptions = group.valueOptions || {},
                valueCategories = valueOptions.categories || [],
                valueAxisType = correctAxisType(group.valueType, valueOptions.type, !!valueCategories.length, incidentOccurred);
            _each(group.series, function(_, series) {
                var optionsSeries = {};
                optionsSeries.argumentAxisType = argumentAxisType;
                optionsSeries.valueAxisType = valueAxisType;
                groupsData.argumentAxisType = groupsData.argumentAxisType || optionsSeries.argumentAxisType;
                group.valueAxisType = group.valueAxisType || optionsSeries.valueAxisType;
                optionsSeries.argumentType = groupsData.argumentType;
                optionsSeries.valueType = group.valueType;
                optionsSeries.showZero = valueOptions.showZero;
                series.updateDataType(optionsSeries)
            });
            group.valueAxisType = group.valueAxisType || valueAxisType;
            if (group.valueAxis) {
                group.valueAxis.setTypes(group.valueAxisType, group.valueType, VALUE_TYPE);
                group.valueAxis.validate(false)
            }
        });
        groupsData.argumentAxisType = groupsData.argumentAxisType || argumentAxisType;
        if (groupsData.argumentAxes) {
            _each(groupsData.argumentAxes, function(_, axis) {
                axis.setTypes(groupsData.argumentAxisType, groupsData.argumentType, ARGUMENT_TYPE);
                axis.validate(true)
            })
        }
    }

    function verifyData(source, incidentOccurred) {
        var i, ii, k, item, data = [],
            hasError = !_isArray(source);
        if (!hasError) {
            for (i = 0, ii = source.length, k = 0; i < ii; ++i) {
                item = source[i];
                if (_isObject(item)) {
                    data[k++] = item
                } else {
                    if (item) {
                        hasError = true
                    }
                }
            }
        }
        if (hasError) {
            incidentOccurred("E2001")
        }
        return data
    }

    function validateData(data, groupsData, incidentOccurred, options) {
        var parsers, dataLength, dataByArgumentFields, skipFields = {},
            argumentOptions = groupsData.argumentOptions,
            userArgumentCategories = argumentOptions && argumentOptions.categories || [],
            uniqueArgumentFields = getUniqueArgumentFields(groupsData);
        data = verifyData(data, incidentOccurred);
        groupsData.argumentType = groupsData.argumentAxisType = null;
        _each(groupsData.groups, processGroup);
        if (groupsData.argumentAxes) {
            _each(groupsData.argumentAxes, resetAxisTypes)
        }
        checkType(data, groupsData, options.checkTypeForAllData);
        checkAxisType(groupsData, userArgumentCategories, incidentOccurred);
        if (options.convertToAxisDataType) {
            parsers = prepareParsers(groupsData, skipFields, incidentOccurred);
            data = parse(data, parsers)
        }
        groupPieData(data, groupsData);
        dataByArgumentFields = sortAndCollectCategories(data, groupsData, options.sortingMethod, uniqueArgumentFields);
        dataLength = data.length;
        _each(skipFields, function(field, fieldValue) {
            if (fieldValue === dataLength) {
                incidentOccurred("W2002", [field])
            }
        });
        return dataByArgumentFields
    }
    exports.validateData = validateData
});
