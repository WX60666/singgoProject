/** 
 * DevExtreme (viz/series/bar_series.js)
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
        scatterSeries = require("./scatter_series"),
        areaSeries = require("./area_series").chart.area,
        chartSeries = scatterSeries.chart,
        polarSeries = scatterSeries.polar,
        _extend = $.extend,
        _each = $.each,
        DEFAULT_BAR_POINT_SIZE = 3;
    exports.chart = {};
    exports.polar = {};
    var baseBarSeriesMethods = {
        _getSpecialColor: areaSeries._getSpecialColor,
        _createPattern: areaSeries._createPattern,
        _updateOptions: function(options) {
            this._stackName = "axis_" + (options.axis || "default") + "_stack_" + (options.stack || "default")
        },
        _parsePointStyle: function(style, defaultColor, defaultBorderColor) {
            var color = this._createPattern(style.color || defaultColor, style.hatching),
                base = chartSeries._parsePointStyle.call(this, style, color, defaultBorderColor);
            base.fill = color;
            base.dashStyle = style.border && style.border.dashStyle || "solid";
            delete base.r;
            return base
        },
        _applyMarkerClipRect: function(settings) {
            settings.clipId = null
        },
        _clearingAnimation: function(translators, drawComplete) {
            var that = this,
                settings = that._oldgetAffineCoordOptions(translators) || that._getAffineCoordOptions(translators);
            that._labelsGroup && that._labelsGroup.animate({
                opacity: .001
            }, {
                duration: that._defaultDuration,
                partitionDuration: .5
            }, function() {
                that._markersGroup.animate(settings, {
                    partitionDuration: .5
                }, function() {
                    that._markersGroup.attr({
                        scaleX: null,
                        scaleY: null,
                        translateX: 0,
                        translateY: 0
                    });
                    drawComplete()
                })
            })
        },
        _setGroupsSettings: function(animationEnabled, firstDrawing) {
            var that = this,
                settings = {};
            chartSeries._setGroupsSettings.apply(that, arguments);
            if (animationEnabled && firstDrawing) {
                settings = this._getAffineCoordOptions(that.translators, true)
            } else {
                if (!animationEnabled) {
                    settings = {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: 0,
                        translateY: 0
                    }
                }
            }
            that._markersGroup.attr(settings)
        },
        _drawPoint: function(options) {
            options.hasAnimation = options.hasAnimation && !options.firstDrawing;
            options.firstDrawing = false;
            chartSeries._drawPoint.call(this, options)
        },
        _getMainColor: function() {
            return this._options.mainSeriesColor
        },
        _createPointStyles: function(pointOptions) {
            var that = this,
                mainColor = pointOptions.color || that._getMainColor(),
                specialMainColor = that._getSpecialColor(mainColor);
            return {
                normal: that._parsePointStyle(pointOptions, mainColor, mainColor),
                hover: that._parsePointStyle(pointOptions.hoverStyle || {}, specialMainColor, mainColor),
                selection: that._parsePointStyle(pointOptions.selectionStyle || {}, specialMainColor, mainColor)
            }
        },
        _updatePointsVisibility: function() {
            var visibility = this._options.visible;
            $.each(this._points, function(_, point) {
                point._options.visible = visibility
            })
        },
        _getOptionsForPoint: function() {
            return this._options
        },
        _animate: function(firstDrawing) {
            var that = this,
                complete = function() {
                    that._animateComplete()
                },
                animateFunc = function(drawnPoints, complete) {
                    var lastPointIndex = drawnPoints.length - 1;
                    _each(drawnPoints || [], function(i, point) {
                        point.animate(i === lastPointIndex ? complete : void 0, point.getMarkerCoords())
                    })
                };
            that._animatePoints(firstDrawing, complete, animateFunc)
        },
        _getPointSize: function() {
            return DEFAULT_BAR_POINT_SIZE
        },
        _beginUpdateData: function(data) {
            chartSeries._beginUpdateData.call(this, data);
            this._deletePatterns()
        }
    };
    exports.chart.bar = _extend({}, chartSeries, baseBarSeriesMethods, {
        _getAffineCoordOptions: function(translators) {
            var rotated = this._options.rotated,
                direction = rotated ? "x" : "y",
                settings = {
                    scaleX: rotated ? .001 : 1,
                    scaleY: rotated ? 1 : .001
                };
            settings["translate" + direction.toUpperCase()] = translators[direction].translate("canvas_position_default");
            return settings
        },
        _getRangeData: function() {
            var rangeData = areaSeries._getRangeData.apply(this, arguments);
            rangeData.arg.stick = false;
            return rangeData
        },
        _animatePoints: function(firstDrawing, complete, animateFunc) {
            var that = this;
            that._markersGroup.animate({
                scaleX: 1,
                scaleY: 1,
                translateY: 0,
                translateX: 0
            }, void 0, complete);
            if (!firstDrawing) {
                animateFunc(that._drawnPoints, complete)
            }
        }
    });
    exports.polar.bar = _extend({}, polarSeries, baseBarSeriesMethods, {
        _animatePoints: function(firstDrawing, complete, animateFunc) {
            animateFunc(this._drawnPoints, complete)
        },
        _setGroupsSettings: chartSeries._setGroupsSettings,
        _drawPoint: function(point, groups, animationEnabled) {
            chartSeries._drawPoint.call(this, point, groups, animationEnabled)
        },
        _parsePointStyle: function(style) {
            var base = baseBarSeriesMethods._parsePointStyle.apply(this, arguments);
            base.opacity = style.opacity;
            return base
        },
        _createGroups: chartSeries._createGroups,
        _setMarkerGroupSettings: function() {
            var groupSettings, that = this,
                markersSettings = that._createPointStyles(that._getMarkerGroupOptions()).normal;
            markersSettings.class = "dxc-markers";
            that._applyMarkerClipRect(markersSettings);
            groupSettings = _extend({}, markersSettings);
            delete groupSettings.opacity;
            that._markersGroup.attr(groupSettings)
        },
        _createLegendState: areaSeries._createLegendState,
        _getRangeData: areaSeries._getRangeData
    })
});
