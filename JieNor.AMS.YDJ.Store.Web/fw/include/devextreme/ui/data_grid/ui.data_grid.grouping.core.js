/** 
 * DevExtreme (ui/data_grid/ui.data_grid.grouping.core.js)
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
        gridCore = require("./ui.data_grid.core"),
        normalizeSortingInfo = require("../../data/utils").normalizeSortingInfo;
    exports.createGroupFilter = function(path, storeLoadOptions) {
        var i, groups = normalizeSortingInfo(storeLoadOptions.group),
            filter = [];
        for (i = 0; i < path.length; i++) {
            filter.push([groups[i].selector, "=", path[i]])
        }
        if (storeLoadOptions.filter) {
            filter.push(storeLoadOptions.filter)
        }
        return gridCore.combineFilters(filter)
    };
    exports.GroupingHelper = Class.inherit(function() {
        var findGroupInfoByKey = function(groupsInfo, key) {
            var hash = groupsInfo.hash;
            return hash && hash[key]
        };
        var getGroupInfoIndexByOffset = function(groupsInfo, offset) {
            var index;
            for (index = 0; index < groupsInfo.length; index++) {
                if (groupsInfo[index].offset > offset) {
                    break
                }
            }
            return index
        };
        var updateGroupInfoOffsets = function(groupsInfo, parents) {
            var groupInfo, index, newIndex;
            for (index = 0; index < groupsInfo.length; index++) {
                groupInfo = groupsInfo[index];
                if (groupInfo.data && groupInfo.data.offset !== groupInfo.offset) {
                    groupsInfo.splice(index, 1);
                    groupInfo.offset = groupInfo.data.offset;
                    if (parents) {
                        for (var parentIndex = 0; parentIndex < parents.length; parentIndex++) {
                            parents[parentIndex].offset = groupInfo.offset
                        }
                    }
                    newIndex = getGroupInfoIndexByOffset(groupsInfo, groupInfo.offset);
                    groupsInfo.splice(newIndex, 0, groupInfo);
                    if (newIndex > index) {
                        index--
                    }
                }
            }
        };
        var cleanGroupsInfo = function(groupsInfo, groupIndex, groupsCount) {
            var i;
            for (i = 0; i < groupsInfo.length; i++) {
                if (groupIndex + 1 >= groupsCount) {
                    groupsInfo[i].children = []
                } else {
                    cleanGroupsInfo(groupsInfo[i].children, groupIndex + 1, groupsCount)
                }
            }
        };
        return {
            ctor: function(dataSourceAdapter) {
                this._dataSource = dataSourceAdapter;
                this.reset()
            },
            reset: function() {
                this._groupsInfo = [];
                this._totalCountCorrection = 0;
                this._itemsCount = 0
            },
            totalCountCorrection: function() {
                return this._totalCountCorrection
            },
            updateTotalItemsCount: function(totalCountCorrection) {
                this._totalCountCorrection = totalCountCorrection || 0
            },
            _isGroupItemCountable: function(item) {
                return !this._isVirtualPaging() || !item.isContinuation
            },
            _isVirtualPaging: function() {
                var scrollingMode = this._dataSource.option("scrolling.mode");
                return "virtual" === scrollingMode || "infinite" === scrollingMode
            },
            itemsCount: function() {
                return this._itemsCount
            },
            updateItemsCount: function(data, groupsCount) {
                function calculateItemsCount(that, items, groupsCount) {
                    var i, result = 0;
                    if (items) {
                        if (!groupsCount) {
                            result = items.length
                        } else {
                            for (i = 0; i < items.length; i++) {
                                if (that._isGroupItemCountable(items[i])) {
                                    result++
                                }
                                result += calculateItemsCount(that, items[i].items, groupsCount - 1)
                            }
                        }
                    }
                    return result
                }
                this._itemsCount = calculateItemsCount(this, data, groupsCount)
            },
            foreachGroups: function(callback, childrenAtFirst, foreachCollapsedGroups, updateOffsets, updateParentOffsets) {
                var that = this;

                function foreachGroupsCore(groupsInfo, callback, childrenAtFirst, parents) {
                    var i, callbackResult, callbackResults = [];

                    function executeCallback(callback, data, parents, callbackResults) {
                        var callbackResult = data && callback(data, parents);
                        callbackResults.push(callbackResult);
                        return callbackResult
                    }
                    for (i = 0; i < groupsInfo.length; i++) {
                        parents.push(groupsInfo[i].data);
                        if (!childrenAtFirst && false === executeCallback(callback, groupsInfo[i].data, parents, callbackResults)) {
                            return false
                        }
                        if (!groupsInfo[i].data || groupsInfo[i].data.isExpanded || foreachCollapsedGroups) {
                            callbackResult = foreachGroupsCore(groupsInfo[i].children, callback, childrenAtFirst, parents);
                            callbackResults.push(callbackResult);
                            if (false === callbackResult) {
                                return false
                            }
                        }
                        if (childrenAtFirst && false === executeCallback(callback, groupsInfo[i].data, parents, callbackResults)) {
                            return false
                        }
                        if (!groupsInfo[i].data || groupsInfo[i].data.offset !== groupsInfo[i].offset) {
                            updateOffsets = true
                        }
                        parents.pop()
                    }
                    var currentParents = updateParentOffsets && parents.slice(0);
                    return updateOffsets && $.when.apply($, callbackResults).always(function() {
                        updateGroupInfoOffsets(groupsInfo, currentParents)
                    })
                }
                return foreachGroupsCore(that._groupsInfo, callback, childrenAtFirst, [])
            },
            findGroupInfo: function(path) {
                var pathIndex, groupInfo, that = this,
                    groupsInfo = that._groupsInfo;
                for (pathIndex = 0; groupsInfo && pathIndex < path.length; pathIndex++) {
                    groupInfo = findGroupInfoByKey(groupsInfo, path[pathIndex]);
                    groupsInfo = groupInfo && groupInfo.children
                }
                return groupInfo && groupInfo.data
            },
            addGroupInfo: function(groupInfoData) {
                var index, groupInfo, pathIndex, that = this,
                    path = groupInfoData.path,
                    groupsInfo = that._groupsInfo;
                for (pathIndex = 0; pathIndex < path.length; pathIndex++) {
                    groupInfo = findGroupInfoByKey(groupsInfo, path[pathIndex]);
                    if (!groupInfo) {
                        groupInfo = {
                            key: path[pathIndex],
                            offset: groupInfoData.offset,
                            data: {
                                offset: groupInfoData.offset,
                                isExpanded: true,
                                path: path.slice(0, pathIndex + 1)
                            },
                            children: []
                        };
                        index = getGroupInfoIndexByOffset(groupsInfo, groupInfoData.offset);
                        groupsInfo.splice(index, 0, groupInfo);
                        groupsInfo.hash = groupsInfo.hash || {};
                        groupsInfo.hash[groupInfo.key] = groupInfo
                    }
                    if (pathIndex === path.length - 1) {
                        groupInfo.data = groupInfoData;
                        if (groupInfo.offset !== groupInfoData.offset) {
                            updateGroupInfoOffsets(groupsInfo)
                        }
                    }
                    groupsInfo = groupInfo.children
                }
            },
            allowCollapseAll: function() {
                return true
            },
            refresh: function(options) {
                var groupIndex, that = this,
                    storeLoadOptions = options.storeLoadOptions,
                    oldGroups = normalizeSortingInfo(that._group || []),
                    groups = normalizeSortingInfo(storeLoadOptions.group || []),
                    groupsCount = Math.min(oldGroups.length, groups.length);
                that._group = storeLoadOptions.group;
                for (groupIndex = 0; groupIndex < groupsCount; groupIndex++) {
                    if (oldGroups[groupIndex].selector !== groups[groupIndex].selector) {
                        groupsCount = groupIndex;
                        break
                    }
                }
                if (!groupsCount) {
                    that.reset()
                } else {
                    cleanGroupsInfo(that._groupsInfo, 0, groupsCount)
                }
            },
            handleDataLoading: function(options) {},
            handleDataLoaded: function(options, callBase) {
                callBase(options)
            },
            handleDataLoadedCore: function(options, callBase) {
                callBase(options)
            }
        }
    }())
});
