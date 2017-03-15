/** 
 * DevExtreme (viz/pie_chart.js)
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
        errors = require("../core/errors"),
        seriesConsts = require("./components/consts"),
        vizUtils = require("./core/utils"),
        commonUtils = require("../core/utils/common"),
        rangeModule = require("./translators/range"),
        registerComponent = require("../core/component_registrator"),
        baseChartModule = require("./chart_components/base_chart"),
        BaseChart = baseChartModule.BaseChart,
        overlapping = baseChartModule.overlapping,
        seriesSpacing = seriesConsts.pieSeriesSpacing,
        translator1DModule = require("./translators/translator1d"),
        OPTIONS_FOR_REFRESH_SERIES = ["startAngle", "innerRadius", "segmentsDirection", "type"],
        _extend = $.extend,
        _each = $.each,
        _noop = $.noop,
        _getVerticallyShiftedAngularCoords = require("./core/utils").getVerticallyShiftedAngularCoords,
        states = seriesConsts.states,
        SELECTED_STATE = states.selectedMark,
        HOVER_STATE = states.hoverMark,
        HOVER = states.hover,
        NORMAL = states.normal,
        SELECTION = states.selection,
        APPLY_HOVER = states.applyHover,
        RESET_ITEM = states.resetItem;

    function AbstractSeries(index, points) {
        var that = this;
        that.index = index;
        that.fullState = 0;
        that._points = points;
        that._selectedPointsCount = 0;
        return that
    }
    AbstractSeries.prototype = {
        isHovered: function() {
            return !!(1 & this.fullState)
        },
        setHoverState: function(state, _, legendCallback) {
            var that = this;
            if (state && !that.isHovered()) {
                that._changeStyle(legendCallback, APPLY_HOVER, HOVER);
                that.fullState |= HOVER_STATE
            } else {
                if (!state && that.isHovered()) {
                    that._changeStyle(legendCallback, RESET_ITEM, NORMAL);
                    that.fullState &= ~HOVER_STATE
                }
            }
        },
        _changeStyle: function(legendCallback, legendAction, pointAction) {
            var that = this;
            !that._selectedPointsCount && legendCallback(legendAction);
            _each(that._points || [], function(_, p) {
                !p.isSelected() && p.applyStyle(pointAction)
            })
        },
        setPointHoverState: function(data) {
            var point = data.point;
            point.fullState |= HOVER_STATE;
            if (!point.isSelected()) {
                point.applyStyle(HOVER);
                if (!this._selectedPointsCount) {
                    data.legendCallback(APPLY_HOVER)
                }
            }
        },
        releasePointHoverState: function(data) {
            var point = data.point;
            point.fullState &= ~HOVER_STATE;
            if (!point.isSelected()) {
                point.applyStyle(NORMAL);
                if (!this._selectedPointsCount) {
                    data.legendCallback(RESET_ITEM)
                }
            }
        },
        setPointSelectedState: function(data) {
            var that = this,
                point = data.point;
            point.fullState |= SELECTED_STATE;
            point.applyStyle(SELECTION);
            !that._selectedPointsCount && data.legendCallback(states.applySelected);
            that._selectedPointsCount++
        },
        releasePointSelectedState: function(data) {
            var action, that = this,
                point = data.point;
            point.fullState &= ~SELECTED_STATE;
            if (point.isHovered() || that.isHovered()) {
                point.applyStyle(HOVER);
                action = APPLY_HOVER
            } else {
                point.applyStyle(NORMAL);
                action = RESET_ITEM
            }
            that._selectedPointsCount--;
            !that._selectedPointsCount && data.legendCallback(action)
        }
    };
    var dxPieChart = BaseChart.inherit({
        _setDeprecatedOptions: function() {
            this.callBase.apply(this, arguments);
            _extend(this._deprecatedOptions, {
                "series.innerRadius": {
                    since: "15.2",
                    message: "Use the 'innerRadius' option instead"
                },
                "series.startAngle": {
                    since: "15.2",
                    message: "Use the 'startAngle' option instead"
                },
                "series.segmentsDirection": {
                    since: "15.2",
                    message: "Use the 'segmentsDirection' option instead"
                },
                "series.type": {
                    since: "15.2",
                    message: "Use the 'type' option instead"
                }
            })
        },
        _chartType: "pie",
        _layoutManagerOptions: function() {
            var diameter = this._themeManager.getOptions("diameter");
            if (commonUtils.isNumber(diameter)) {
                if (diameter > 1) {
                    diameter = 1
                } else {
                    if (diameter < 0) {
                        diameter = 0
                    }
                }
            } else {
                diameter = void 0
            }
            return _extend(true, {}, this.callBase(), {
                piePercentage: diameter
            })
        },
        _optionChangesMap: {
            diameter: "REINIT"
        },
        _groupSeries: function() {
            var series = this.series;
            this._groupsData = {
                groups: [{
                    series: series,
                    valueOptions: {
                        valueType: "numeric"
                    }
                }],
                argumentOptions: series[0] && series[0].getOptions()
            }
        },
        _populateBusinessRange: function() {
            var singleSeriesRange, businessRanges = [],
                series = this.series;
            this.businessRanges = null;
            _each(series, function(_, singleSeries) {
                var range = new rangeModule.Range;
                singleSeriesRange = singleSeries.getRangeData();
                range.addRange(singleSeriesRange.val);
                if (!range.isDefined()) {
                    range.setStubData()
                }
                businessRanges.push(range)
            });
            this.businessRanges = businessRanges
        },
        _specialProcessSeries: function() {
            _each(this.series, function(_, singleSeries) {
                singleSeries.arrangePoints()
            })
        },
        _createTranslator: function(range) {
            return (new translator1DModule.Translator1D).setDomain(range.min, range.max).setCodomain(360, 0)
        },
        _checkPaneName: function() {
            return true
        },
        _processSingleSeries: function(singleSeries) {
            singleSeries.arrangePoints()
        },
        _collectPointsByArg: function() {
            var itemIndex, that = this,
                points = {},
                args = {},
                index = 0;
            _each(that.series, function(_, singleSeries) {
                var count, arrayArguments = {};
                _each(singleSeries.getPoints(), function(_, point) {
                    var argument = point.argument;
                    arrayArguments[argument] = ++arrayArguments[argument] || 0;
                    count = arrayArguments[argument];
                    itemIndex = args[argument + count];
                    if (void 0 === itemIndex) {
                        point.index = args[argument + count] = index;
                        points[index] = [point];
                        index++
                    } else {
                        point.index = itemIndex;
                        points[itemIndex].push(point)
                    }
                })
            });
            that._collectionPointsArg = points
        },
        _getLegendTargets: function() {
            var that = this,
                points = [];
            _each(that._collectionPointsArg, function(_, id) {
                _each(id, function(i, point) {
                    if (0 === i) {
                        points.push(that._getLegendOptions(point))
                    } else {
                        if (!points[points.length - 1].visible) {
                            points[points.length - 1].visible = point.isVisible()
                        }
                    }
                })
            });
            return points
        },
        _getAxisDrawingMethods: _noop,
        _getLayoutTargets: function() {
            return [{
                canvas: this._canvas
            }]
        },
        _getAxesForTransform: function() {
            return {
                verticalAxes: [],
                horizontalAxes: []
            }
        },
        _getLayoutSeries: function(series, drawOptions) {
            var layout, that = this,
                canvas = that._canvas,
                drawnLabels = false;
            layout = that.layoutManager.applyPieChartSeriesLayout(canvas, series, true);
            _each(series, function(i, singleSeries) {
                singleSeries.correctPosition(layout);
                drawnLabels = singleSeries.drawLabelsWOPoints(that._createTranslator(that.businessRanges[i])) || drawnLabels
            });
            if (drawnLabels) {
                layout = that.layoutManager.applyPieChartSeriesLayout(canvas, series, drawOptions.hideLayoutLabels)
            }
            return layout
        },
        _updateSeriesDimensions: function(drawOptions) {
            var innerRad, delta, layout, that = this,
                visibleSeries = that._getVisibleSeries(),
                lengthVisibleSeries = visibleSeries.length;
            if (lengthVisibleSeries) {
                layout = that._getLayoutSeries(visibleSeries, drawOptions);
                delta = (layout.radiusOuter - layout.radiusInner - seriesSpacing * (lengthVisibleSeries - 1)) / lengthVisibleSeries;
                innerRad = layout.radiusInner;
                that._setCenter({
                    x: layout.centerX,
                    y: layout.centerY
                });
                _each(visibleSeries, function(_, singleSeries) {
                    singleSeries.correctRadius({
                        radiusInner: innerRad,
                        radiusOuter: innerRad + delta
                    });
                    innerRad += delta + seriesSpacing
                })
            }
        },
        _prepareTranslators: function(_, i) {
            return this._createTranslator(this.businessRanges[i])
        },
        _getLegendCallBack: function() {
            var legend = this._legend;
            return function(point) {
                return legend.getActionCallback(point)
            }
        },
        _adjustSeries: function() {
            _each(this.series, function(_, singleSeries) {
                singleSeries.adjustLabels()
            })
        },
        _prepareStackPoints: _noop,
        _resetStackPoints: _noop,
        _applyExtraSettings: _noop,
        _resolveLabelOverlappingShift: function() {
            var that = this,
                series = that.series,
                center = that._center;
            _each(series, function(_, singleSeries) {
                if ("inside" === singleSeries.getOptions().label.position) {
                    return
                }
                var points = singleSeries.getVisiblePoints(),
                    lPoints = [],
                    rPoints = [];
                $.each(points, function(_, point) {
                    var angle = vizUtils.normalizeAngle(point.middleAngle);
                    (angle <= 90 || angle >= 270 ? rPoints : lPoints).push(point)
                });
                overlapping.resolveLabelOverlappingInOneDirection(lPoints, that._canvas, false, shiftFunction);
                overlapping.resolveLabelOverlappingInOneDirection(rPoints, that._canvas, false, shiftFunction)
            });

            function shiftFunction(box, length) {
                return _getVerticallyShiftedAngularCoords(box, -length, center)
            }
        },
        _setCenter: function(center) {
            this._center = center
        },
        _getStoredSeries: function() {
            var abstractSeries = this._abstractSeries;
            if (!abstractSeries) {
                abstractSeries = this._abstractSeries = []
            } else {
                abstractSeries.splice(0, abstractSeries.length)
            }
            _each(this._collectionPointsArg, function(i, points) {
                abstractSeries.push(new AbstractSeries(i, points))
            });
            return abstractSeries
        },
        _disposeSeries: function() {
            this.callBase.apply(this, arguments);
            this._abstractSeries = null
        },
        getSeries: function() {
            errors.log("W0002", "dxPieChart", "getSeries", "15.2", "Use the 'getAllSeries' method instead");
            return this.series[0]
        },
        _legendDataField: "point",
        _legendItemTextField: "argument",
        _updateLegendPosition: _noop,
        _renderTrackers: _noop,
        _trackerType: "PieTracker",
        _createScrollBar: _noop,
        _updateAxesLayout: _noop,
        _applyClipRects: _noop,
        _appendAdditionalSeriesGroups: _noop,
        _prepareToRender: _noop,
        _isLegendInside: _noop,
        _renderAxes: _noop,
        _isRotated: _noop,
        _seriesPopulatedHandlerCore: _noop,
        _reinitAxes: _noop,
        _correctAxes: _noop,
        _getExtraOptions: function() {
            var that = this;
            return {
                startAngle: that.option("startAngle"),
                innerRadius: that.option("innerRadius"),
                segmentsDirection: that.option("segmentsDirection"),
                type: that.option("type")
            }
        }
    });
    _each(OPTIONS_FOR_REFRESH_SERIES, function(_, name) {
        dxPieChart.prototype._optionChangesMap[name] = "REFRESH_SERIES_DATA_INIT"
    });
    registerComponent("dxPieChart", dxPieChart);
    module.exports = dxPieChart
});
