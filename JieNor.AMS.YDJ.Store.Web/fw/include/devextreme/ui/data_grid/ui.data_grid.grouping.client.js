/** 
 * DevExtreme (ui/data_grid/ui.data_grid.grouping.client.js)
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
        gridCore = require("./ui.data_grid.core"),
        normalizeSortingInfo = gridCore.normalizeSortingInfo,
        groupingCore = require("./ui.data_grid.grouping.core"),
        dataQuery = require("../../data/query"),
        errors = require("../widget/ui.errors");
    exports.GroupingHelper = groupingCore.GroupingHelper.inherit(function() {
        var foreachExpandedGroups = function(that, callback) {
            return that.foreachGroups(function(groupInfo, parents) {
                if (groupInfo.isExpanded) {
                    return callback(groupInfo, parents)
                }
            }, true)
        };
        var processGroupItems = function(that, items, groupsCount, expandedInfo, path, isCustomLoading, isLastGroupExpanded) {
            var i, item, groupInfo, isExpanded;
            expandedInfo.items = expandedInfo.items || [];
            expandedInfo.paths = expandedInfo.paths || [];
            expandedInfo.count = expandedInfo.count || 0;
            expandedInfo.lastCount = expandedInfo.lastCount || 0;
            if (!groupsCount) {
                return
            }
            for (i = 0; i < items.length; i++) {
                item = items[i];
                if (void 0 !== item.items) {
                    path.push(item.key);
                    if (isCustomLoading) {
                        isExpanded = true
                    } else {
                        groupInfo = that.findGroupInfo(path);
                        isExpanded = groupInfo && groupInfo.isExpanded
                    }
                    if (!isExpanded) {
                        item.collapsedItems = item.items;
                        item.items = null
                    } else {
                        if (item.items) {
                            processGroupItems(that, item.items, groupsCount - 1, expandedInfo, path, isCustomLoading, isLastGroupExpanded)
                        } else {
                            if (1 === groupsCount && item.count && (!isCustomLoading || isLastGroupExpanded)) {
                                expandedInfo.items.push(item);
                                expandedInfo.paths.push(path.slice(0));
                                expandedInfo.count += expandedInfo.lastCount;
                                expandedInfo.lastCount = item.count
                            }
                        }
                    }
                    path.pop()
                }
            }
        };
        var updateGroupInfos = function(that, items, groupsCount, offset) {
            return updateGroupInfosCore(that, items, 0, groupsCount, [], offset)
        };
        var updateGroupInfosCore = function(that, items, groupIndex, groupsCount, path, offset) {
            var item, count, i, groupInfo, totalCount = 0;
            if (groupIndex >= groupsCount) {
                return items.length
            }
            for (i = 0; i < items.length; i++) {
                item = items[i];
                if (item) {
                    path.push(item.key);
                    if (!item.count && !item.items || void 0 === item.items) {
                        return -1
                    }
                    groupInfo = that.findGroupInfo(path);
                    if (!groupInfo) {
                        that.addGroupInfo({
                            isExpanded: that._isGroupExpanded(groupIndex),
                            path: path.slice(0),
                            offset: offset + i,
                            count: item.count > 0 ? item.count : item.items.length
                        })
                    } else {
                        groupInfo.count = item.count > 0 ? item.count : item.items.length;
                        groupInfo.offset = offset + i
                    }
                    count = item.items || !item.count ? updateGroupInfosCore(that, item.items, groupIndex + 1, groupsCount, path, 0) : item.count;
                    if (count < 0) {
                        return -1
                    }
                    totalCount += count;
                    path.pop()
                }
            }
            return totalCount
        };
        var isGroupExpanded = function(groups, groupIndex) {
            return groups && groups.length && groups[groupIndex] && !!groups[groupIndex].isExpanded
        };
        var getTotalOffset = function(groupInfos, pageSize, offset) {
            var groupIndex, groupSize, totalOffset = offset;
            for (groupIndex = 0; groupIndex < groupInfos.length; groupIndex++) {
                groupSize = groupInfos[groupIndex].offset + 1;
                if (groupIndex > 0) {
                    groupSize += groupInfos[groupIndex - 1].childrenTotalCount;
                    if (pageSize) {
                        groupSize += getContinuationGroupCount(totalOffset, pageSize, groupSize, groupIndex - 1) * groupIndex
                    }
                }
                totalOffset += groupSize
            }
            return totalOffset
        };
        var getContinuationGroupCount = function(groupOffset, pageSize, groupSize, groupIndex) {
            groupIndex = groupIndex || 0;
            if (pageSize > 1 && groupSize > 0) {
                var pageOffset = groupOffset - Math.floor(groupOffset / pageSize) * pageSize || pageSize;
                pageOffset += groupSize - groupIndex - 2;
                if (pageOffset < 0) {
                    pageOffset += pageSize
                }
                return Math.floor(pageOffset / (pageSize - groupIndex - 1))
            }
            return 0
        };

        function loadLastLevelGroupItems(that, options, expandedInfo) {
            var expandedFilters = [],
                data = options.data;
            $.each(expandedInfo.paths, function(_, expandedPath) {
                expandedFilters.push(groupingCore.createGroupFilter(expandedPath, {
                    group: options.storeLoadOptions.group
                }))
            });
            var filter = options.storeLoadOptions.filter;
            if (!options.storeLoadOptions.isLoadingAll) {
                filter = gridCore.combineFilters([filter, gridCore.combineFilters(expandedFilters, "or")])
            }
            options.data = $.Deferred();
            var loadOptions = $.extend({}, options.storeLoadOptions, {
                group: null,
                filter: filter,
                skip: expandedInfo.skip,
                take: expandedInfo.take
            });
            $.when(0 === expandedInfo.take ? [] : that._dataSource.store().load(loadOptions)).done(function(items, extra) {
                $.each(expandedInfo.items, function(index, item) {
                    dataQuery(items).filter(expandedFilters[index]).enumerate().done(function(expandedItems) {
                        item.items = expandedItems
                    })
                });
                options.data.resolve(data)
            }).fail(options.data.reject)
        }
        return {
            updateTotalItemsCount: function(options) {
                var totalItemsCount = 0,
                    totalCount = options.extra && options.extra.totalCount || 0,
                    totalGroupCount = options.extra && options.extra.totalGroupCount || 0,
                    pageSize = this._dataSource.pageSize(),
                    isVirtualPaging = this._isVirtualPaging();
                foreachExpandedGroups(this, function(groupInfo, parents) {
                    groupInfo.childrenTotalCount = 0
                });
                foreachExpandedGroups(this, function(groupInfo, parents) {
                    var totalOffset = getTotalOffset(parents, isVirtualPaging ? 0 : pageSize, totalItemsCount),
                        count = groupInfo.count + groupInfo.childrenTotalCount;
                    if (!isVirtualPaging) {
                        count += getContinuationGroupCount(totalOffset, pageSize, count, parents.length - 1)
                    }
                    if (parents[parents.length - 2]) {
                        parents[parents.length - 2].childrenTotalCount += count
                    } else {
                        totalItemsCount += count
                    }
                });
                this.callBase(totalItemsCount - totalCount + totalGroupCount)
            },
            _isGroupExpanded: function(groupIndex) {
                var groups = this._dataSource.group();
                return isGroupExpanded(groups, groupIndex)
            },
            _updatePagingOptions: function(options) {
                var that = this,
                    isVirtualPaging = that._isVirtualPaging(),
                    pageSize = that._dataSource.pageSize(),
                    skips = [],
                    takes = [],
                    skipChildrenTotalCount = 0,
                    childrenTotalCount = 0;
                if (options.take) {
                    foreachExpandedGroups(this, function(groupInfo) {
                        groupInfo.childrenTotalCount = 0;
                        groupInfo.skipChildrenTotalCount = 0
                    });
                    foreachExpandedGroups(that, function(groupInfo, parents) {
                        var skip, take, takeCorrection = 0,
                            parentTakeCorrection = 0,
                            totalOffset = getTotalOffset(parents, isVirtualPaging ? 0 : pageSize, childrenTotalCount),
                            continuationGroupCount = 0,
                            skipContinuationGroupCount = 0,
                            groupInfoCount = groupInfo.count + groupInfo.childrenTotalCount,
                            childrenGroupInfoCount = groupInfoCount;
                        skip = options.skip - totalOffset;
                        if (totalOffset <= options.skip + options.take && groupInfoCount) {
                            take = options.take;
                            if (!isVirtualPaging) {
                                continuationGroupCount = getContinuationGroupCount(totalOffset, pageSize, groupInfoCount, parents.length - 1);
                                groupInfoCount += continuationGroupCount * parents.length;
                                childrenGroupInfoCount += continuationGroupCount;
                                if (pageSize && skip >= 0) {
                                    takeCorrection = parents.length;
                                    parentTakeCorrection = parents.length - 1;
                                    skipContinuationGroupCount = Math.floor(skip / pageSize)
                                }
                            }
                            if (skip >= 0) {
                                if (totalOffset + groupInfoCount > options.skip) {
                                    skips.unshift(skip - skipContinuationGroupCount * takeCorrection - groupInfo.skipChildrenTotalCount)
                                }
                                if (totalOffset + groupInfoCount >= options.skip + take) {
                                    takes.unshift(take - takeCorrection - groupInfo.childrenTotalCount + groupInfo.skipChildrenTotalCount)
                                }
                            } else {
                                if (totalOffset + groupInfoCount >= options.skip + take) {
                                    takes.unshift(take + skip - groupInfo.childrenTotalCount)
                                }
                            }
                        }
                        if (totalOffset <= options.skip) {
                            if (parents[parents.length - 2]) {
                                parents[parents.length - 2].skipChildrenTotalCount += Math.min(childrenGroupInfoCount, skip + 1 - skipContinuationGroupCount * parentTakeCorrection)
                            } else {
                                skipChildrenTotalCount += Math.min(childrenGroupInfoCount, skip + 1)
                            }
                        }
                        if (totalOffset <= options.skip + take) {
                            groupInfoCount = Math.min(childrenGroupInfoCount, skip + take - (skipContinuationGroupCount + 1) * parentTakeCorrection);
                            if (parents[parents.length - 2]) {
                                parents[parents.length - 2].childrenTotalCount += groupInfoCount
                            } else {
                                childrenTotalCount += groupInfoCount
                            }
                        }
                    });
                    options.skip -= skipChildrenTotalCount;
                    options.take -= childrenTotalCount - skipChildrenTotalCount
                }
                options.skips = skips;
                options.takes = takes
            },
            changeRowExpand: function(path) {
                var that = this,
                    groupInfo = that.findGroupInfo(path);
                if (groupInfo) {
                    groupInfo.isExpanded = !groupInfo.isExpanded;
                    return $.Deferred().resolve()
                }
                return $.Deferred().reject()
            },
            handleDataLoadedCore: function(options, callBase) {
                var totalCount, that = this,
                    groupCount = normalizeSortingInfo(options.storeLoadOptions.group || options.loadOptions.group).length,
                    expandedInfo = {};
                if (options.isCustomLoading) {
                    callBase(options);
                    processGroupItems(that, options.data, groupCount, expandedInfo, [], options.isCustomLoading, options.storeLoadOptions.isLoadingAll)
                } else {
                    totalCount = updateGroupInfos(that, options.data, groupCount, 0);
                    if (totalCount < 0) {
                        options.data = $.Deferred().reject(errors.Error("E1037"));
                        return
                    }
                    if (!options.remoteOperations.paging) {
                        if (groupCount && options.extra && options.loadOptions.requireTotalCount) {
                            options.extra.totalCount = totalCount;
                            options.extra.totalGroupCount = options.data.length
                        }
                    }
                    that.updateTotalItemsCount(options);
                    that._updatePagingOptions(options);
                    callBase(options);
                    that._processPaging(options, groupCount);
                    processGroupItems(that, options.data, groupCount, expandedInfo, []);
                    expandedInfo.skip = options.skips[groupCount - 1];
                    if (void 0 !== options.takes[groupCount - 1]) {
                        expandedInfo.take = expandedInfo.count ? expandedInfo.count - (expandedInfo.skip || 0) : 0;
                        expandedInfo.take += options.takes[groupCount - 1]
                    }
                }
                if (expandedInfo.paths.length && options.storeLoadOptions.group) {
                    loadLastLevelGroupItems(that, options, expandedInfo)
                }
                if (!options.isCustomLoading) {
                    $.when(options.data).done(function(data) {
                        that.updateItemsCount(data, groupCount)
                    })
                }
            },
            _processPaging: function(options, groupCount) {
                var skips, takes, i, item, items;
                skips = options.skips;
                takes = options.takes;
                items = options.data;
                for (i = 0; items && i < groupCount; i++) {
                    item = items[0];
                    items = item && item.items;
                    if (void 0 !== skips[i]) {
                        item.isContinuation = true;
                        if (items) {
                            items = items.slice(skips[i]);
                            item.items = items
                        }
                    }
                }
                items = options.data;
                for (i = 0; items && i < groupCount; i++) {
                    item = items[items.length - 1];
                    items = item && item.items;
                    if (item) {
                        var maxTakeCount = item.count - (item.isContinuation && skips[i] || 0) || items.length;
                        if (void 0 !== takes[i] && maxTakeCount > takes[i]) {
                            item.isContinuationOnNextPage = true;
                            if (items) {
                                items = items.slice(0, takes[i]);
                                item.items = items
                            }
                        }
                    }
                }
            },
            refresh: function(options) {
                var isExpanded, groupIndex, that = this,
                    storeLoadOptions = options.storeLoadOptions,
                    oldGroups = normalizeSortingInfo(that._group);

                function handleGroup(groupInfo, parents) {
                    if (parents.length === groupIndex + 1) {
                        groupInfo.isExpanded = isExpanded
                    }
                }
                for (groupIndex = 0; groupIndex < oldGroups.length; groupIndex++) {
                    isExpanded = isGroupExpanded(storeLoadOptions.group, groupIndex);
                    if (isGroupExpanded(that._group, groupIndex) !== isExpanded) {
                        that.foreachGroups(handleGroup)
                    }
                }
                that.callBase.apply(this, arguments);
                that.foreachGroups(function(groupInfo) {
                    groupInfo.count = 0
                })
            }
        }
    }())
});
