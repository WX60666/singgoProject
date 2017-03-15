/** 
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.utils.js)
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
        formatHelper = require("../../format_helper");
    exports.setFieldProperty = function(field, property, value, isInitialization) {
        var initProperties = field._initProperties = field._initProperties || {},
            initValue = isInitialization ? value : field[property];
        if (!initProperties.hasOwnProperty(property) || isInitialization) {
            initProperties[property] = initValue
        }
        field[property] = value
    };
    exports.sendRequest = function(options) {
        return $.ajax(options)
    };
    var foreachTreeAsyncDate = new Date;

    function createForeachTreeFunc(isAsync) {
        var foreachTreeFunc = function(items, callback, parentAtFirst, members, index, isChildrenProcessing) {
            members = members || [];
            items = items || [];
            var item, i, deferred, childrenDeferred;
            index = index || 0;

            function createForeachTreeAsyncHandler(deferred, i, isChildrenProcessing) {
                $.when(foreachTreeFunc(items, callback, parentAtFirst, members, i, isChildrenProcessing)).done(deferred.resolve)
            }
            for (i = index; i < items.length; i++) {
                if (isAsync && i > index && i % 1e4 === 0 && new Date - foreachTreeAsyncDate >= 300) {
                    foreachTreeAsyncDate = new Date;
                    deferred = $.Deferred();
                    setTimeout(createForeachTreeAsyncHandler(deferred, i, false), 0);
                    return deferred
                }
                item = items[i];
                if (!isChildrenProcessing) {
                    members.unshift(item);
                    if (parentAtFirst && false === callback(members, i)) {
                        return
                    }
                    if (item.children) {
                        childrenDeferred = foreachTreeFunc(item.children, callback, parentAtFirst, members);
                        if (isAsync && childrenDeferred) {
                            deferred = $.Deferred();
                            childrenDeferred.done(createForeachTreeAsyncHandler(deferred, i, true));
                            return deferred
                        }
                    }
                }
                isChildrenProcessing = false;
                if (!parentAtFirst && false === callback(members, i)) {
                    return
                }
                members.shift();
                if (items[i] !== item) {
                    i--
                }
            }
        };
        return foreachTreeFunc
    }
    exports.foreachTree = createForeachTreeFunc(false);
    exports.foreachTreeAsync = createForeachTreeFunc(true);
    exports.findField = function(fields, id) {
        var i, field;
        if (fields && commonUtils.isDefined(id)) {
            for (i = 0; i < fields.length; i++) {
                field = fields[i];
                if (field.name === id || field.caption === id || field.dataField === id || field.index === id) {
                    return i
                }
            }
        }
        return -1
    };
    exports.formatValue = function(value, options) {
        var formatObject = {
            value: value,
            valueText: formatHelper.format(value, options.format, options.precision) || ""
        };
        return options.customizeText ? options.customizeText.call(options, formatObject) : formatObject.valueText
    };
    exports.getCompareFunction = function(valueSelector) {
        return function(a, b) {
            var result = 0;
            if (valueSelector(a) > valueSelector(b)) {
                result = 1
            } else {
                if (valueSelector(a) < valueSelector(b)) {
                    result = -1
                }
            }
            return result
        }
    };
    exports.createPath = function(items) {
        var i, result = [];
        for (i = items.length - 1; i >= 0; i--) {
            result.push(items[i].key || items[i].value)
        }
        return result
    };
    exports.foreachDataLevel = function foreachDataLevel(data, callback, index, childrenField) {
        var item, i;
        index = index || 0;
        childrenField = childrenField || "children";
        if (data.length) {
            callback(data, index)
        }
        for (i = 0; i < data.length; i++) {
            item = data[i];
            if (item[childrenField] && item[childrenField].length) {
                foreachDataLevel(item[childrenField], callback, index + 1, childrenField)
            }
        }
    };
    exports.mergeArraysByMaxValue = function(values1, values2) {
        var i, result = [];
        for (i = 0; i < values1.length; i++) {
            result.push(Math.max(values1[i] || 0, values2[i] || 0))
        }
        return result
    }
});
