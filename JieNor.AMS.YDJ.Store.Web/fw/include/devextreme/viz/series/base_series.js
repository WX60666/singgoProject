/** 
 * DevExtreme (viz/series/base_series.js)
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
        seriesNS = {},
        commonUtils = require("../../core/utils/common"),
        pointModule = require("./points/base_point"),
        _isDefined = commonUtils.isDefined,
        vizUtils = require("../core/utils"),
        _map = vizUtils.map,
        _each = $.each,
        _extend = $.extend,
        _isEmptyObject = $.isEmptyObject,
        _normalizeEnum = vizUtils.normalizeEnum,
        _Event = $.Event,
        _noop = $.noop,
        _inArray = $.inArray,
        states = require("../components/consts").states,
        scatterSeries = require("./scatter_series"),
        lineSeries = require("./line_series"),
        areaSeries = require("./area_series"),
        barSeries = require("./bar_series"),
        rangeSeries = require("./range_series"),
        bubbleSeries = require("./bubble_series"),
        pieSeries = require("./pie_series"),
        financialSeries = require("./financial_series"),
        stackedSeries = require("./stacked_series"),
        DISCRETE = "discrete",
        SELECTED_STATE = states.selectedMark,
        HOVER_STATE = states.hoverMark,
        HOVER = states.hover,
        NORMAL = states.normal,
        SELECTION = states.selection,
        APPLY_SELECTED = states.applySelected,
        APPLY_HOVER = states.applyHover,
        RESET_ITEM = states.resetItem,
        NONE_MODE = "none",
        INCLUDE_POINTS = "includepoints",
        EXLUDE_POINTS = "excludepoints",
        NEAREST_POINT = "nearestpoint",
        getEmptyBusinessRange = function() {
            return {
                arg: {},
                val: {}
            }
        };

    function triggerEvent(element, event, point) {
        element && element.trigger(event, point)
    }
    seriesNS.mixins = {
        chart: {},
        pie: {},
        polar: {}
    };
    seriesNS.mixins.chart.scatter = scatterSeries.chart;
    seriesNS.mixins.polar.scatter = scatterSeries.polar;
    $.extend(seriesNS.mixins.pie, pieSeries);
    $.extend(seriesNS.mixins.chart, lineSeries.chart, areaSeries.chart, barSeries.chart, rangeSeries.chart, bubbleSeries.chart, financialSeries, stackedSeries.chart);
    $.extend(seriesNS.mixins.polar, lineSeries.polar, areaSeries.polar, barSeries.polar, rangeSeries.polar, bubbleSeries.polar, stackedSeries.polar);

    function includePointsMode(mode) {
        return mode === INCLUDE_POINTS || "allseriespoints" === mode
    }

    function getLabelOptions(labelOptions, defaultColor) {
        var opt = labelOptions || {},
            labelFont = _extend({}, opt.font) || {},
            labelBorder = opt.border || {},
            labelConnector = opt.connector || {},
            backgroundAttr = {
                fill: opt.backgroundColor || defaultColor,
                "stroke-width": labelBorder.visible ? labelBorder.width || 0 : 0,
                stroke: labelBorder.visible && labelBorder.width ? labelBorder.color : "none",
                dashStyle: labelBorder.dashStyle
            },
            connectorAttr = {
                stroke: labelConnector.visible && labelConnector.width ? labelConnector.color || defaultColor : "none",
                "stroke-width": labelConnector.visible ? labelConnector.width || 0 : 0
            };
        labelFont.color = "none" === opt.backgroundColor && "#ffffff" === _normalizeEnum(labelFont.color) && "inside" !== opt.position ? defaultColor : labelFont.color;
        return {
            alignment: opt.alignment,
            format: opt.format,
            argumentFormat: opt.argumentFormat,
            precision: opt.precision,
            argumentPrecision: opt.argumentPrecision,
            percentPrecision: opt.percentPrecision,
            customizeText: $.isFunction(opt.customizeText) ? opt.customizeText : void 0,
            attributes: {
                font: labelFont
            },
            visible: 0 !== labelFont.size ? opt.visible : false,
            showForZeroValues: opt.showForZeroValues,
            horizontalOffset: opt.horizontalOffset,
            verticalOffset: opt.verticalOffset,
            radialOffset: opt.radialOffset,
            background: backgroundAttr,
            position: opt.position,
            connector: connectorAttr,
            rotationAngle: opt.rotationAngle
        }
    }

    function applyPointStyle(point, styleName) {
        !point.isSelected() && !point.hasSelectedView && point.applyStyle(styleName)
    }

    function Series(renderSettings, options) {
        var that = this;
        that.fullState = 0;
        that._extGroups = renderSettings;
        that._renderer = renderSettings.renderer;
        that._group = renderSettings.renderer.g().attr({
            "class": "dxc-series"
        });
        that.updateOptions(options)
    }
    exports.Series = Series;
    exports.mixins = seriesNS.mixins;
    Series.prototype = {
        constructor: Series,
        _createLegendState: _noop,
        getLegendStyles: function() {
            return this._styles.legendStyles
        },
        _createStyles: function(options) {
            var that = this,
                mainSeriesColor = options.mainSeriesColor,
                specialMainColor = that._getSpecialColor(mainSeriesColor);
            that._styles = {
                normal: that._parseStyle(options, mainSeriesColor, mainSeriesColor),
                hover: that._parseStyle(options.hoverStyle || {}, specialMainColor, mainSeriesColor),
                selection: that._parseStyle(options.selectionStyle || {}, specialMainColor, mainSeriesColor),
                legendStyles: {
                    normal: that._createLegendState(options, mainSeriesColor),
                    hover: that._createLegendState(options.hoverStyle || {}, specialMainColor),
                    selection: that._createLegendState(options.selectionStyle || {}, specialMainColor)
                }
            }
        },
        setClippingParams: function(baseId, wideId, forceClipping) {
            this._paneClipRectID = baseId;
            this._widePaneClipRectID = wideId;
            this._forceClipping = forceClipping
        },
        applyClip: function() {
            this._group.attr({
                clipId: this._paneClipRectID
            })
        },
        resetClip: function() {
            this._group.attr({
                clipId: null
            })
        },
        getTagField: function() {
            return this._options.tagField || "tag"
        },
        getValueFields: _noop,
        getSizeField: _noop,
        getArgumentField: _noop,
        getPoints: function() {
            return this._points
        },
        _createPoint: function(data, pointsArray, index) {
            data.index = index;
            var options, arg, pba, that = this,
                point = pointsArray[index],
                pointsByArgument = that.pointsByArgument;
            if (that._checkData(data)) {
                options = that._customizePoint(data) || that._getCreatingPointOptions(data);
                if (point) {
                    point.update(data, options)
                } else {
                    point = new pointModule.Point(that, data, options);
                    pointsArray.push(point)
                }
                arg = point.argument.valueOf();
                pba = pointsByArgument[arg];
                if (pba) {
                    pba.push(point)
                } else {
                    pointsByArgument[arg] = [point]
                }
                return true
            }
        },
        getRangeData: function(zoomArgs, calcIntervalFunction) {
            return this._visible ? _extend(true, {}, this._getRangeData(zoomArgs, calcIntervalFunction)) : getEmptyBusinessRange()
        },
        _deleteGroup: function(groupName) {
            var group = this[groupName];
            if (group) {
                group.dispose();
                this[groupName] = null
            }
        },
        _saveOldAnimationMethods: function() {
            var that = this;
            that._oldClearingAnimation = that._clearingAnimation;
            that._oldUpdateElement = that._updateElement;
            that._oldgetAffineCoordOptions = that._getAffineCoordOptions
        },
        _deleteOldAnimationMethods: function() {
            this._oldClearingAnimation = null;
            this._oldUpdateElement = null;
            this._oldgetAffineCoordOptions = null
        },
        updateOptions: function(newOptions) {
            var that = this,
                widgetType = newOptions.widgetType,
                oldType = that.type,
                newType = newOptions.type;
            that.type = newType && _normalizeEnum(newType.toString());
            if (!that._checkType(widgetType) || that._checkPolarBarType(widgetType, newOptions)) {
                that.dispose();
                that.isUpdated = false;
                return
            }
            if (oldType !== that.type) {
                that._firstDrawing = true;
                that._saveOldAnimationMethods();
                that._resetType(oldType, widgetType);
                that._setType(that.type, widgetType)
            }
            that._options = newOptions;
            that._pointOptions = null;
            that._deletePatterns();
            that.name = newOptions.name;
            that.pane = newOptions.pane;
            that.axis = newOptions.axis;
            that.tag = newOptions.tag;
            that._createStyles(newOptions);
            that._updateOptions(newOptions);
            that._visible = newOptions.visible;
            that.isUpdated = true;
            that._createGroups()
        },
        _disposePoints: function(points) {
            _each(points || [], function(_, p) {
                p.dispose()
            })
        },
        _correctPointsLength: function(length, points) {
            this._disposePoints(this._oldPoints);
            this._oldPoints = points.splice(length, points.length)
        },
        getErrorBarRangeCorrector: _noop,
        updateDataType: function(settings) {
            var that = this;
            that.argumentType = settings.argumentType;
            that.valueType = settings.valueType;
            that.argumentAxisType = settings.argumentAxisType;
            that.valueAxisType = settings.valueAxisType;
            that.showZero = settings.showZero;
            return that
        },
        getOptions: function() {
            return this._options
        },
        _resetRangeData: function() {
            this._rangeData = getEmptyBusinessRange()
        },
        updateData: function(data) {
            var curPoint, that = this,
                points = that._originalPoints || [],
                lastPointIndex = 0,
                options = that._options,
                i = 0,
                len = data.length,
                lastPoint = null,
                rangeCorrector = that.getErrorBarRangeCorrector();
            that.pointsByArgument = {};
            that._resetRangeData();
            if (data && data.length) {
                that._canRenderCompleteHandle = true
            }
            that._beginUpdateData(data);
            while (i < len) {
                if (that._createPoint(that._getPointData(data[i], options), points, lastPointIndex)) {
                    curPoint = points[lastPointIndex];
                    that._processRange(curPoint, lastPoint, rangeCorrector);
                    lastPoint = curPoint;
                    lastPointIndex++
                }
                i++
            }
            that._disposePoints(that._aggregatedPoints);
            that._aggregatedPoints = null;
            that._points = that._originalPoints = points;
            that._correctPointsLength(lastPointIndex, points);
            that._endUpdateData()
        },
        getTemplateFields: function() {
            return this.getValueFields().concat(this.getTagField(), this.getSizeField()).map(function(field) {
                return {
                    templateField: field + this.name,
                    originalField: field
                }
            }, this)
        },
        resamplePoints: function(argTranslator, min, max) {
            var categories, discreteMin, discreteMax, count, tickInterval, that = this,
                sizePoint = that._getPointSize(),
                pointsLength = that.getAllPoints().length,
                isDiscrete = that.argumentAxisType === DISCRETE || that.valueAxisType === DISCRETE,
                businessRange = argTranslator.getBusinessRange();
            if (pointsLength && pointsLength > 1) {
                count = argTranslator.canvasLength / sizePoint;
                count = count <= 1 ? 1 : count;
                if (isDiscrete) {
                    if (that.argumentAxisType === DISCRETE) {
                        categories = businessRange.categories;
                        discreteMin = _inArray(min, categories);
                        discreteMax = _inArray(max, categories);
                        if (discreteMin !== -1 && discreteMax !== -1) {
                            categories = categories.slice(discreteMin, discreteMax + 1)
                        }
                        pointsLength = categories.length
                    }
                    tickInterval = Math.ceil(pointsLength / count)
                } else {
                    tickInterval = (businessRange.maxVisible - businessRange.minVisible) / count
                }
                that._points = that._resample(tickInterval, min - tickInterval, max + tickInterval, _isDefined(min) && _isDefined(max))
            }
        },
        _removeOldSegments: function(startIndex) {
            var that = this;
            _each(that._graphics.splice(startIndex, that._graphics.length) || [], function(_, elem) {
                that._removeElement(elem)
            });
            if (that._trackers) {
                _each(that._trackers.splice(startIndex, that._trackers.length) || [], function(_, elem) {
                    elem.remove()
                })
            }
        },
        draw: function(translators, animationEnabled, hideLayoutLabels, legendCallback) {
            var drawComplete, that = this;
            if (that._oldClearingAnimation && animationEnabled && that._firstDrawing) {
                drawComplete = function() {
                    that._draw(translators, true, hideLayoutLabels)
                };
                that._oldClearingAnimation(translators, drawComplete)
            } else {
                that._draw(translators, animationEnabled, hideLayoutLabels, legendCallback)
            }
        },
        _draw: function(translators, animationEnabled, hideLayoutLabels, legendCallback) {
            var groupForPoint, that = this,
                points = that._points || [],
                segment = [],
                segmentCount = 0,
                firstDrawing = that._firstDrawing,
                closeSegment = points[0] && points[0].hasValue() && that._options.closed;
            that._graphics = that._graphics || [];
            that._prepareSeriesToDrawing();
            if (!that._visible) {
                animationEnabled = false;
                that._group.remove();
                return
            }
            that._appendInGroup();
            that.translators = translators;
            that._applyVisibleArea();
            that._setGroupsSettings(animationEnabled, firstDrawing);
            that._segments = [];
            that._drawnPoints = [];
            that._firstDrawing = points.length ? false : true;
            groupForPoint = {
                markers: that._markersGroup,
                errorBars: that._errorBarGroup
            };
            _each(points, function(i, p) {
                p.translate(translators);
                if (p.hasValue()) {
                    that._drawPoint({
                        point: p,
                        groups: groupForPoint,
                        hasAnimation: animationEnabled,
                        firstDrawing: firstDrawing,
                        legendCallback: legendCallback
                    });
                    segment.push(p)
                } else {
                    if (segment.length) {
                        that._drawSegment(segment, animationEnabled, segmentCount++);
                        segment = []
                    }
                }
            });
            segment.length && that._drawSegment(segment, animationEnabled, segmentCount++, closeSegment);
            that._removeOldSegments(segmentCount);
            that._defaultSegments = that._generateDefaultSegments();
            hideLayoutLabels && that.hideLabels();
            animationEnabled && that._animate(firstDrawing);
            if (that.isSelected()) {
                that._changeStyle(legendCallback, APPLY_SELECTED)
            } else {
                if (that.isHovered()) {
                    that._changeStyle(legendCallback, APPLY_HOVER)
                }
            }
        },
        _setLabelGroupSettings: function(animationEnabled) {
            var settings = {
                "class": "dxc-labels"
            };
            this._applyElementsClipRect(settings);
            this._applyClearingSettings(settings);
            animationEnabled && (settings.opacity = .001);
            this._labelsGroup.attr(settings).append(this._extGroups.labelsGroup)
        },
        _checkType: function(widgetType) {
            return !!seriesNS.mixins[widgetType][this.type]
        },
        _checkPolarBarType: function(widgetType, options) {
            return "polar" === widgetType && options.spiderWidget && this.type.indexOf("bar") !== -1
        },
        _resetType: function(seriesType, widgetType) {
            var methodName, methods;
            if (seriesType) {
                methods = seriesNS.mixins[widgetType][seriesType];
                for (methodName in methods) {
                    delete this[methodName]
                }
            }
        },
        _setType: function(seriesType, widgetType) {
            var methodName, methods = seriesNS.mixins[widgetType][seriesType];
            for (methodName in methods) {
                this[methodName] = methods[methodName]
            }
        },
        setSelectedState: function(state, mode, legendCallback) {
            var that = this;
            that.lastSelectionMode = _normalizeEnum(mode || that._options.selectionMode);
            if (state && !that.isSelected()) {
                that.fullState = that.fullState | SELECTED_STATE;
                that._nearestPoint && applyPointStyle(that._nearestPoint, NORMAL);
                that._nearestPoint = null;
                that._changeStyle(legendCallback, APPLY_SELECTED)
            } else {
                if (!state && that.isSelected()) {
                    that.fullState = that.fullState & ~SELECTED_STATE;
                    if (that.isHovered()) {
                        that._changeStyle(legendCallback, APPLY_HOVER, SELECTION)
                    } else {
                        that._changeStyle(legendCallback, RESET_ITEM)
                    }
                }
            }
        },
        setHoverState: function(state, mode, legendCallback) {
            var that = this;
            that.lastHoverMode = _normalizeEnum(mode || that._options.hoverMode);
            if (state && !that.isHovered()) {
                that.fullState = that.fullState | HOVER_STATE;
                !that.isSelected() && that._changeStyle(legendCallback, APPLY_HOVER)
            } else {
                if (!state && that.isHovered()) {
                    that._nearestPoint = null;
                    that.fullState = that.fullState & ~HOVER_STATE;
                    !that.isSelected() && that._changeStyle(legendCallback, RESET_ITEM)
                }
            }
        },
        setHoverView: function() {
            if (this._canChangeView()) {
                this._applyStyle(this._styles.hover);
                return this
            }
            return null
        },
        releaseHoverView: function(legendCallback) {
            this._canChangeView() && this._applyStyle(this._styles.normal)
        },
        isFullStackedSeries: function() {
            return 0 === this.type.indexOf("fullstacked")
        },
        isStackedSeries: function() {
            return 0 === this.type.indexOf("stacked")
        },
        isFinancialSeries: function() {
            return "stock" === this.type || "candlestick" === this.type
        },
        _canChangeView: function() {
            return !this.isSelected() && _normalizeEnum(this._options.hoverMode) !== NONE_MODE
        },
        _changeStyle: function(legendCallBack, legendAction, prevStyle) {
            var pointStyle, that = this,
                style = that._calcStyle(prevStyle);
            if (style.mode === NONE_MODE) {
                return
            }
            legendCallBack(legendAction);
            if (includePointsMode(style.mode)) {
                pointStyle = style.pointStyle;
                _each(that._points || [], function(_, p) {
                    applyPointStyle(p, pointStyle)
                })
            }
            that._applyStyle(style.series)
        },
        _calcStyle: function(prevStyle) {
            var result, that = this,
                styles = that._styles,
                pointNormalState = false;
            switch (that.fullState) {
                case 0:
                    result = {
                        pointStyle: NORMAL,
                        mode: INCLUDE_POINTS,
                        series: styles.normal
                    };
                    break;
                case 1:
                    pointNormalState = prevStyle && that.lastHoverMode === EXLUDE_POINTS || that.lastHoverMode === NEAREST_POINT && includePointsMode(that.lastSelectionMode);
                    result = {
                        pointStyle: pointNormalState ? NORMAL : HOVER,
                        mode: pointNormalState ? INCLUDE_POINTS : that.lastHoverMode,
                        series: styles.hover
                    };
                    break;
                case 2:
                    result = {
                        pointStyle: SELECTION,
                        mode: that.lastSelectionMode,
                        series: styles.selection
                    };
                    break;
                case 3:
                    pointNormalState = that.lastSelectionMode === EXLUDE_POINTS && includePointsMode(that.lastHoverMode);
                    result = {
                        pointStyle: pointNormalState ? NORMAL : SELECTION,
                        mode: pointNormalState ? INCLUDE_POINTS : that.lastSelectionMode,
                        series: styles.selection
                    }
            }
            return result
        },
        updateHover: function(x, y) {
            var that = this,
                currentNearestPoint = that._nearestPoint,
                point = that.isHovered() && that.lastHoverMode === NEAREST_POINT && that.getNeighborPoint(x, y);
            if (point !== currentNearestPoint && !that.isSelected()) {
                currentNearestPoint && applyPointStyle(currentNearestPoint, NORMAL);
                if (point) {
                    applyPointStyle(point, HOVER);
                    that._nearestPoint = point
                }
            }
        },
        _getMainAxisName: function() {
            return this._options.rotated ? "X" : "Y"
        },
        areLabelsVisible: function() {
            return !_isDefined(this._options.maxLabelCount) || this._points.length <= this._options.maxLabelCount
        },
        getLabelVisibility: function() {
            return this.areLabelsVisible() && this._options.label && this._options.label.visible
        },
        _customizePoint: function(pointData) {
            var customizeObject, pointOptions, customLabelOptions, customOptions, useLabelCustomOptions, usePointCustomOptions, that = this,
                options = that._options,
                customizePoint = options.customizePoint,
                customizeLabel = options.customizeLabel;
            if (customizeLabel && customizeLabel.call) {
                customizeObject = _extend({
                    seriesName: that.name
                }, pointData);
                customizeObject.series = that;
                customLabelOptions = customizeLabel.call(customizeObject, customizeObject);
                useLabelCustomOptions = customLabelOptions && !_isEmptyObject(customLabelOptions);
                customLabelOptions = useLabelCustomOptions ? _extend(true, {}, options.label, customLabelOptions) : null
            }
            if (customizePoint && customizePoint.call) {
                customizeObject = customizeObject || _extend({
                    seriesName: that.name
                }, pointData);
                customizeObject.series = that;
                customOptions = customizePoint.call(customizeObject, customizeObject);
                usePointCustomOptions = customOptions && !_isEmptyObject(customOptions)
            }
            if (useLabelCustomOptions || usePointCustomOptions) {
                pointOptions = that._parsePointOptions(that._preparePointOptions(customOptions), customLabelOptions || options.label, pointData);
                pointOptions.styles.useLabelCustomOptions = useLabelCustomOptions;
                pointOptions.styles.usePointCustomOptions = usePointCustomOptions
            }
            return pointOptions
        },
        show: function() {
            if (!this._visible) {
                this._changeVisibility(true)
            }
        },
        hide: function() {
            if (this._visible) {
                this._changeVisibility(false)
            }
        },
        _changeVisibility: function(visibility) {
            var that = this;
            that._visible = that._options.visible = visibility;
            that._updatePointsVisibility();
            that.hidePointTooltip();
            that._options.visibilityChanged()
        },
        _updatePointsVisibility: _noop,
        hideLabels: function() {
            _each(this._points, function(_, point) {
                point._label.hide()
            })
        },
        _parsePointOptions: function(pointOptions, labelOptions, data) {
            var that = this,
                options = that._options,
                styles = that._createPointStyles(pointOptions, data),
                parsedOptions = _extend(true, {}, pointOptions, {
                    type: options.type,
                    tag: that.tag,
                    rotated: options.rotated,
                    styles: styles,
                    widgetType: options.widgetType,
                    visibilityChanged: options.visibilityChanged
                });
            parsedOptions.label = getLabelOptions(labelOptions, styles.normal.fill);
            if (that.areErrorBarsVisible()) {
                parsedOptions.errorBars = options.valueErrorBar
            }
            return parsedOptions
        },
        _preparePointOptions: function(customOptions) {
            var point = this._getOptionsForPoint();
            return customOptions ? _extend(true, {}, point, customOptions) : point
        },
        _getMarkerGroupOptions: function() {
            return _extend(false, {}, this._getOptionsForPoint(), {
                hoverStyle: {},
                selectionStyle: {}
            })
        },
        _resample: function(ticksInterval, min, max, isDefinedMinMax) {
            var pointData, minTick, that = this,
                fusPoints = [],
                nowIndexTicks = 0,
                lastPointIndex = 0,
                state = 0,
                originalPoints = that.getAllPoints();

            function addFirstFusPoint(point) {
                fusPoints.push(point);
                minTick = point.argument;
                if (isDefinedMinMax) {
                    if (point.argument < min) {
                        state = 1
                    } else {
                        if (point.argument > max) {
                            state = 2
                        } else {
                            state = 0
                        }
                    }
                }
            }
            if (that.argumentAxisType === DISCRETE || that.valueAxisType === DISCRETE) {
                return _map(originalPoints, function(point, index) {
                    if (index % ticksInterval === 0) {
                        return point
                    }
                    point.setInvisibility();
                    return null
                })
            }
            that._aggregatedPoints = that._aggregatedPoints || [];
            _each(originalPoints, function(_, point) {
                point.setInvisibility();
                if (!fusPoints.length) {
                    addFirstFusPoint(point)
                } else {
                    if (!state && Math.abs(minTick - point.argument) < ticksInterval) {
                        fusPoints.push(point)
                    } else {
                        if (!(1 === state && point.argument < min) && !(2 === state && point.argument > max)) {
                            pointData = that._fusionPoints(fusPoints, minTick, nowIndexTicks);
                            nowIndexTicks++;
                            if (that._createPoint(pointData, that._aggregatedPoints, lastPointIndex)) {
                                lastPointIndex++
                            }
                            fusPoints = [];
                            addFirstFusPoint(point)
                        }
                    }
                }
            });
            if (fusPoints.length) {
                pointData = that._fusionPoints(fusPoints, minTick, nowIndexTicks);
                if (that._createPoint(pointData, that._aggregatedPoints, lastPointIndex)) {
                    lastPointIndex++
                }
            }
            that._correctPointsLength(lastPointIndex, that._aggregatedPoints);
            that._endUpdateData();
            return that._aggregatedPoints
        },
        canRenderCompleteHandle: function() {
            var result = this._canRenderCompleteHandle;
            delete this._canRenderCompleteHandle;
            return !!result
        },
        isHovered: function() {
            return !!(1 & this.fullState)
        },
        isSelected: function() {
            return !!(2 & this.fullState)
        },
        isVisible: function() {
            return this._visible
        },
        getAllPoints: function() {
            return (this._originalPoints || []).slice()
        },
        getPointByPos: function(pos) {
            return (this._points || [])[pos]
        },
        getVisiblePoints: function() {
            return (this._drawnPoints || []).slice()
        },
        setPointHoverState: function(data) {
            var point = data.point;
            if (data.setState) {
                point.fullState |= HOVER_STATE
            }
            if (!(this.isSelected() && includePointsMode(this.lastSelectionMode)) && !point.isSelected() && !point.hasSelectedView) {
                point.applyStyle(HOVER)
            }
        },
        releasePointHoverState: function(data) {
            var that = this,
                point = data.point;
            if (data.setState) {
                point.fullState &= ~HOVER_STATE
            }
            if (!(that.isSelected() && includePointsMode(that.lastSelectionMode)) && !point.isSelected() && !point.hasSelectedView) {
                if (!(that.isHovered() && includePointsMode(that.lastHoverMode)) || that.isSelected() && that.lastSelectionMode === EXLUDE_POINTS) {
                    point.applyStyle(NORMAL)
                }
            }
            point.releaseHoverState()
        },
        setPointSelectedState: function(data) {
            var point = data.point;
            if (data.setState) {
                point.fullState |= SELECTED_STATE
            } else {
                point.hasSelectedView = true
            }
            point.applyStyle(SELECTION)
        },
        releasePointSelectedState: function(data) {
            var pointStyle, that = this,
                point = data.point;
            if (data.setState) {
                point.fullState &= ~SELECTED_STATE
            } else {
                point.hasSelectedView = false
            }
            if (that.isHovered() && includePointsMode(that.lastHoverMode) || point.isHovered()) {
                pointStyle = HOVER
            } else {
                if (that.isSelected() && includePointsMode(that.lastSelectionMode)) {
                    pointStyle = SELECTION
                } else {
                    pointStyle = NORMAL
                }
            }
            point.applyStyle(pointStyle)
        },
        selectPoint: function(point) {
            triggerEvent(this._extGroups.seriesGroup, new _Event("selectpoint"), point)
        },
        deselectPoint: function(point) {
            triggerEvent(this._extGroups.seriesGroup, new _Event("deselectpoint"), point)
        },
        showPointTooltip: function(point) {
            triggerEvent(this._extGroups.seriesGroup, new _Event("showpointtooltip"), point)
        },
        hidePointTooltip: function(point) {
            triggerEvent(this._extGroups.seriesGroup, new _Event("hidepointtooltip"), point)
        },
        select: function() {
            var that = this;
            triggerEvent(that._extGroups.seriesGroup, new _Event("selectseries", {
                target: that
            }), that._options.selectionMode);
            that._group.toForeground()
        },
        clearSelection: function() {
            var that = this;
            triggerEvent(that._extGroups.seriesGroup, new _Event("deselectseries", {
                target: that
            }), that._options.selectionMode)
        },
        getPointsByArg: function(arg) {
            return this.pointsByArgument[arg.valueOf()] || []
        },
        _deletePoints: function() {
            var that = this;
            that._disposePoints(that._originalPoints);
            that._disposePoints(that._aggregatedPoints);
            that._disposePoints(that._oldPoints);
            that._points = that._oldPoints = that._aggregatedPoints = that._originalPoints = that._drawnPoints = null
        },
        _deletePatterns: function() {
            _each(this._patterns || [], function(_, pattern) {
                pattern && pattern.dispose()
            });
            this._patterns = []
        },
        _deleteTrackers: function() {
            var that = this;
            _each(that._trackers || [], function(_, tracker) {
                tracker.remove()
            });
            that._trackersGroup && that._trackersGroup.dispose();
            that._trackers = that._trackersGroup = null
        },
        dispose: function() {
            var that = this;
            that._deletePoints();
            that._group.dispose();
            that._labelsGroup && that._labelsGroup.dispose();
            that._errorBarGroup && that._errorBarGroup.dispose();
            that._deletePatterns();
            that._deleteTrackers();
            that._group = that._extGroups = that._markersGroup = that._elementsGroup = that._bordersGroup = that._labelsGroup = that._errorBarGroup = that._graphics = that._rangeData = that._renderer = that.translators = that._styles = that._options = that._pointOptions = that._drawnPoints = that._aggregatedPoints = that.pointsByArgument = that._segments = that._prevSeries = that._patterns = null
        },
        correctPosition: _noop,
        drawTrackers: _noop,
        getNeighborPoint: _noop,
        areErrorBarsVisible: _noop,
        getColor: function() {
            return this.getLegendStyles().normal.fill
        },
        getOpacity: function() {
            return this._options.opacity
        },
        getStackName: function() {
            return "stackedbar" === this.type || "fullstackedbar" === this.type ? this._stackName : null
        },
        getPointByCoord: function(x, y) {
            var point = this.getNeighborPoint(x, y);
            return point && point.coordsIn(x, y) ? point : null
        }
    }
});
