/** 
 * DevExtreme (viz/chart_components/tracker.js)
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
        clickEvent = require("../../events/click"),
        eventsConsts = require("../components/consts").events,
        vizUtils = require("../core/utils"),
        commonUtils = require("../../core/utils/common"),
        pointerEvents = require("../../events/pointer"),
        wheelEvent = require("../../events/core/wheel"),
        holdEvent = require("../../events/hold"),
        devices = require("../../core/devices"),
        isDefined = commonUtils.isDefined,
        _normalizeEnum = require("../core/utils").normalizeEnum,
        _floor = Math.floor,
        _each = $.each,
        _inArray = $.inArray,
        _noop = $.noop,
        MULTIPLE_MODE = "multiple",
        ALL_ARGUMENTS_POINTS_MODE = "allargumentpoints",
        ALL_SERIES_POINTS_MODE = "allseriespoints",
        NONE_MODE = "none",
        POINTER_ACTION = [pointerEvents.down, pointerEvents.move].join(" "),
        POINT_SELECTION_CHANGED = "pointSelectionChanged",
        LEGEND_CLICK = "legendClick",
        SERIES_CLICK = "seriesClick",
        POINT_CLICK = "pointClick",
        RELEASE_POINT_SELECTED_STATE = "releasePointSelectedState",
        SET_POINT_SELECTED_STATE = "setPointSelectedState",
        SET_POINT_HOVER_STATE = "setPointHoverState",
        SERIES_HOVER_CHANGED = "seriesHoverChanged",
        POINT_HOVER_CHANGED = "pointHoverChanged",
        RELEASE_POINT_HOVER_STATE = "releasePointHoverState",
        SERIES_SELECTION_CHANGED = "seriesSelectionChanged",
        ZOOM_START = "zoomStart",
        POINT_DATA = "chart-data-point",
        SERIES_DATA = "chart-data-series",
        ARG_DATA = "chart-data-argument",
        DELAY = 100;

    function getData(event, dataKey) {
        var target = event.target;
        return ("tspan" === target.tagName ? target.parentNode : target)[dataKey]
    }

    function eventCanceled(event, target) {
        return event.cancel || !target.getOptions()
    }

    function inCanvas(canvas, x, y) {
        return x >= canvas.left && x <= canvas.right && y >= canvas.top && y <= canvas.bottom
    }

    function setPointsSpecState(points, targetPoint, func, eventName, eventTrigger) {
        _each(points, function(_, currentPoint) {
            var series = currentPoint.series;
            if (currentPoint === targetPoint) {
                series[func]({
                    point: currentPoint,
                    setState: true
                });
                eventName && eventTrigger(eventName, {
                    target: currentPoint
                })
            } else {
                series[func]({
                    point: currentPoint
                })
            }
        })
    }
    var baseTrackerPrototype = {
        ctor: function(options) {
            var that = this,
                data = {
                    tracker: that
                };
            that._renderer = options.renderer;
            that._legend = options.legend;
            that._tooltip = options.tooltip;
            that._eventTrigger = options.eventTrigger;
            options.seriesGroup.off().on(eventsConsts.selectSeries, data, that._selectSeries).on(eventsConsts.deselectSeries, data, that._deselectSeries).on(eventsConsts.selectPoint, data, that._selectPoint).on(eventsConsts.deselectPoint, data, that._deselectPoint).on(eventsConsts.showPointTooltip, data, that._showPointTooltip).on(eventsConsts.hidePointTooltip, data, that._hidePointTooltip);
            that._renderer.root.off(POINTER_ACTION).off([clickEvent.name, holdEvent.name].join(" ")).on(POINTER_ACTION, data, that._pointerHandler).on(clickEvent.name, data, that._clickHandler).on(holdEvent.name, {
                timeout: 300
            }, _noop)
        },
        _setSelectedPoint: _noop,
        _releaseSelectedPoint: _noop,
        _releaseSelectedSeries: _noop,
        _setSelectedSeries: _noop,
        update: function(options) {
            var that = this;
            if (_normalizeEnum(options.pointSelectionMode) === MULTIPLE_MODE) {
                that._setSelectedPoint = that._selectPointMultipleMode;
                that._releaseSelectedPoint = that._releaseSelectedPointMultipleMode
            } else {
                that._setSelectedPoint = that._selectPointSingleMode;
                that._releaseSelectedPoint = that._releaseSelectedPointSingleMode
            }
            if (_normalizeEnum(options.seriesSelectionMode) === MULTIPLE_MODE) {
                that._releaseSelectedSeries = that._releaseSelectedSeriesMultipleMode;
                that._setSelectedSeries = that._setSelectedSeriesMultipleMode
            } else {
                that._releaseSelectedSeries = that._releaseSelectedSeriesSingleMode;
                that._setSelectedSeries = that._setSelectedSeriesSingleMode
            }
            that._prepare()
        },
        updateSeries: function(series) {
            var that = this;
            if (that._storedSeries !== series) {
                that._storedSeries = series || [];
                that._clean()
            } else {
                that._hideTooltip(that.pointAtShownTooltip);
                that._clearHover();
                that.clearSelection()
            }
        },
        setCanvases: function(mainCanvas, paneCanvases) {
            this._mainCanvas = mainCanvas;
            this._canvases = paneCanvases
        },
        repairTooltip: function() {
            var point = this.pointAtShownTooltip;
            if (point && !point.isVisible()) {
                this._hideTooltip(point, true)
            } else {
                this._showTooltip(point)
            }
        },
        _prepare: function() {
            this._toggleParentsScrollSubscription(true)
        },
        _toggleParentsScrollSubscription: function(subscribe) {
            var that = this,
                $parents = $(that._renderer.root.element).parents(),
                scrollEvents = "scroll.dxChartTracker";
            if ("generic" === devices.real().platform) {
                $parents = $parents.add(window)
            }
            $().add(that._$prevRootParents).off(scrollEvents);
            if (subscribe) {
                $parents.on(scrollEvents, function(e) {
                    that._pointerOut()
                });
                that._$prevRootParents = $parents
            }
        },
        _selectPointMultipleMode: function(point) {
            var that = this;
            that._selectedPoint = that._selectedPoint || [];
            if (_inArray(point, that._selectedPoint) < 0) {
                that._selectedPoint.push(point);
                that._setPointState(point, SET_POINT_SELECTED_STATE, _normalizeEnum(point.getOptions().selectionMode), POINT_SELECTION_CHANGED, that._legend.getActionCallback(point))
            }
        },
        _releaseSelectedPointMultipleMode: function(point) {
            var that = this,
                points = that._selectedPoint || [],
                pointIndex = _inArray(point, points);
            if (pointIndex >= 0) {
                that._setPointState(point, RELEASE_POINT_SELECTED_STATE, _normalizeEnum(point.getOptions().selectionMode), POINT_SELECTION_CHANGED, that._legend.getActionCallback(point));
                points.splice(pointIndex, 1)
            } else {
                if (!point) {
                    _each(points, function(_, point) {
                        that._releaseSelectedPoint(point)
                    })
                }
            }
        },
        _selectPointSingleMode: function(point) {
            var that = this;
            if (that._selectedPoint !== point) {
                that._releaseSelectedPoint();
                that._selectedPoint = point;
                that._setPointState(point, SET_POINT_SELECTED_STATE, _normalizeEnum(point.getOptions().selectionMode), POINT_SELECTION_CHANGED, that._legend.getActionCallback(point))
            }
        },
        _releaseSelectedPointSingleMode: function() {
            var that = this,
                point = that._selectedPoint;
            if (point) {
                that._setPointState(point, RELEASE_POINT_SELECTED_STATE, _normalizeEnum(point.getOptions().selectionMode), POINT_SELECTION_CHANGED, that._legend.getActionCallback(point));
                that._selectedPoint = null
            }
        },
        _setHoveredPoint: function(point, mode) {
            var that = this;
            if (that.hoveredPoint === point || !point.series) {
                return
            }
            that._releaseHoveredPoint();
            if (point && point.getOptions() && mode !== NONE_MODE) {
                that.hoveredPoint = point;
                that._setPointState(point, SET_POINT_HOVER_STATE, mode || _normalizeEnum(point.getOptions().hoverMode), POINT_HOVER_CHANGED, that._legend.getActionCallback(point))
            }
        },
        _releaseHoveredPoint: function() {
            var that = this,
                point = that.hoveredPoint,
                eventTrigger = that._eventTrigger;
            if (!point || !point.getOptions()) {
                return
            }
            that._releasePoint(point, eventTrigger);
            if (that._tooltip.isEnabled()) {
                that._hideTooltip(point)
            }
            that.hoveredPoint = null
        },
        _setSelectedSeriesMultipleMode: function(series, mode) {
            var that = this;
            that._selectedSeries = that._selectedSeries || [];
            if (_inArray(series, that._selectedSeries) < 0) {
                that._selectedSeries.push(series);
                series.setSelectedState(true, mode, that._legend.getActionCallback(series));
                that._eventTrigger(SERIES_SELECTION_CHANGED, {
                    target: series
                })
            }
        },
        _setSelectedSeriesSingleMode: function(series, mode) {
            var that = this;
            if (series !== that._selectedSeries || series.lastSelectionMode !== mode) {
                that._releaseSelectedSeries();
                that._selectedSeries = series;
                series.setSelectedState(true, mode, that._legend.getActionCallback(series));
                that._eventTrigger(SERIES_SELECTION_CHANGED, {
                    target: series
                })
            }
        },
        _releaseSelectedSeriesMultipleMode: function(series) {
            var that = this,
                selectedSeries = that._selectedSeries || [],
                seriesIndex = _inArray(series, selectedSeries);
            if (seriesIndex >= 0) {
                series.setSelectedState(false, void 0, that._legend.getActionCallback(series));
                that._eventTrigger(SERIES_SELECTION_CHANGED, {
                    target: series
                });
                selectedSeries.splice(seriesIndex, 1)
            } else {
                if (!series) {
                    _each(selectedSeries, function(_, series) {
                        that._releaseSelectedSeries(series)
                    })
                }
            }
        },
        _releaseSelectedSeriesSingleMode: function(series) {
            var that = this,
                selectedSeries = that._selectedSeries;
            if (selectedSeries && (!series || series === selectedSeries)) {
                selectedSeries.setSelectedState(false, void 0, that._legend.getActionCallback(selectedSeries));
                that._eventTrigger(SERIES_SELECTION_CHANGED, {
                    target: selectedSeries
                });
                that._selectedSeries = null
            }
        },
        _setHoveredSeries: function(series, mode) {
            var that = this;
            if (mode !== NONE_MODE && that.hoveredSeries !== series || that._isModeChanged(series, mode)) {
                that._clearHover();
                series.setHoverState(true, mode, that._legend.getActionCallback(series));
                that._eventTrigger(SERIES_HOVER_CHANGED, {
                    target: series
                });
                that.hoveredSeries = series
            }
        },
        _releaseHoveredSeries: function(needSetHoverView, hoveredPoint) {
            var that = this,
                hoveredSeries = that.hoveredSeries,
                seriesWithHoverView = that._seriesWithHoverView;
            if (hoveredSeries) {
                hoveredSeries.setHoverState(false, void 0, that._legend.getActionCallback(hoveredSeries));
                if (needSetHoverView && hoveredPoint && hoveredPoint.series === hoveredSeries) {
                    that._seriesWithHoverView = hoveredSeries.setHoverView()
                }
                that._eventTrigger(SERIES_HOVER_CHANGED, {
                    target: hoveredSeries
                });
                that.hoveredSeries = null
            } else {
                if (seriesWithHoverView && !needSetHoverView) {
                    seriesWithHoverView.releaseHoverView();
                    that._seriesWithHoverView = null
                }
            }
        },
        _selectSeries: function(event, mode) {
            event.data.tracker._setSelectedSeries(event.target, mode)
        },
        _deselectSeries: function(event, mode) {
            event.data.tracker._releaseSelectedSeries(event.target, mode)
        },
        _selectPoint: function(event, point) {
            event.data.tracker._setSelectedPoint(point)
        },
        _deselectPoint: function(event, point) {
            event.data.tracker._releaseSelectedPoint(point)
        },
        clearSelection: function() {
            this._releaseSelectedPoint();
            this._releaseSelectedSeries()
        },
        _clean: function() {
            var that = this;
            that._selectedPoint = that._selectedSeries = that.hoveredPoint = that.hoveredSeries = that._hoveredArgumentPoints = that._seriesWithHoverView = null;
            that._hideTooltip(that.pointAtShownTooltip)
        },
        _clearHover: function() {
            this._releaseHoveredSeries(false);
            this._releaseHoveredPoint()
        },
        _hideTooltip: function(point, silent) {
            var that = this;
            if (!that._tooltip || point && that.pointAtShownTooltip !== point) {
                return
            }
            if (!silent && that.pointAtShownTooltip) {
                that.pointAtShownTooltip = null
            }
            that._tooltip.hide()
        },
        _showTooltip: function(point) {
            var tooltipFormatObject, eventData, that = this;
            if (point && point.getOptions()) {
                tooltipFormatObject = point.getTooltipFormatObject(that._tooltip);
                if (!isDefined(tooltipFormatObject.valueText) && !tooltipFormatObject.points || !point.isVisible()) {
                    return
                }
                if (!that.pointAtShownTooltip || that.pointAtShownTooltip !== point) {
                    eventData = {
                        target: point
                    }
                }
                var coords = point.getTooltipParams(that._tooltip.getLocation()),
                    rootOffset = that._renderer.getRootOffset();
                coords.x += rootOffset.left;
                coords.y += rootOffset.top;
                if (!that._tooltip.show(tooltipFormatObject, coords, eventData)) {
                    return
                }
                that.pointAtShownTooltip = point
            }
        },
        _showPointTooltip: function(event, point) {
            var that = event.data.tracker,
                pointWithTooltip = that.pointAtShownTooltip;
            if (pointWithTooltip && pointWithTooltip !== point) {
                that._hideTooltip(pointWithTooltip)
            }
            that._showTooltip(point)
        },
        _hidePointTooltip: function(event, point) {
            event.data.tracker._hideTooltip(point)
        },
        _enableOutHandler: function() {
            if (this._outHandler) {
                return
            }
            var that = this,
                handler = function(e) {
                    var rootOffset = that._renderer.getRootOffset(),
                        x = _floor(e.pageX - rootOffset.left),
                        y = _floor(e.pageY - rootOffset.top);
                    if (!inCanvas(that._mainCanvas, x, y)) {
                        that._pointerOut();
                        that._disableOutHandler()
                    }
                };
            $(document).on(POINTER_ACTION, handler);
            this._outHandler = handler
        },
        _disableOutHandler: function() {
            this._outHandler && $(document).off(POINTER_ACTION, this._outHandler);
            this._outHandler = null
        },
        _pointerOut: function() {
            this._clearHover();
            this._tooltip.isEnabled() && this._hideTooltip(this.pointAtShownTooltip)
        },
        _triggerLegendClick: function(eventArgs, elementClick) {
            var eventTrigger = this._eventTrigger;
            eventTrigger(LEGEND_CLICK, eventArgs, function() {
                !eventCanceled(eventArgs.jQueryEvent, eventArgs.target) && eventTrigger(elementClick, eventArgs)
            })
        },
        _hoverLegendItem: function(x, y) {
            var series, that = this,
                item = that._legend.getItemByCoord(x, y);
            if (item) {
                series = that._storedSeries[item.id];
                that._setHoveredSeries(series, that._legend._options.hoverMode);
                that._tooltip.isEnabled() && that._hideTooltip(that.pointAtShownTooltip)
            } else {
                that._clearHover()
            }
        },
        _pointerHandler: function(e) {
            var that = e.data.tracker,
                rootOffset = that._renderer.getRootOffset(),
                x = _floor(e.pageX - rootOffset.left),
                y = _floor(e.pageY - rootOffset.top),
                canvas = that._getCanvas(x, y),
                series = getData(e, SERIES_DATA),
                point = getData(e, POINT_DATA) || series && series.getPointByCoord(x, y);
            that._enableOutHandler();
            if (that._checkGestureEvents(e, canvas, rootOffset)) {
                return
            }
            if (that._legend.coordsIn(x, y)) {
                that._hoverLegendItem(x, y);
                return
            }
            if (that.hoveredSeries && that.hoveredSeries !== that._stickedSeries) {
                that._releaseHoveredSeries()
            }
            if (that._hoverArgumentAxis(x, y, e)) {
                return
            }
            if (that._isPointerOut(canvas, point)) {
                that._pointerOut()
            }
            if (!canvas && !point) {
                return
            }
            if (series && !point) {
                point = series.getNeighborPoint(x, y);
                if (series !== that.hoveredSeries) {
                    that._setTimeout(function() {
                        that._setHoveredSeries(series, series.getOptions().hoverMode);
                        that._stickedSeries = series;
                        that._pointerComplete(point, x, y)
                    }, series);
                    return
                }
            } else {
                if (point) {
                    if (that.hoveredSeries) {
                        that._setTimeout(function() {
                            that._pointerOnPoint(point, x, y)
                        }, point)
                    } else {
                        that._pointerOnPoint(point, x, y);
                        that._setSeriesWithHoverView(point)
                    }
                    return
                } else {
                    if (that._setStickedSeries(x, y)) {
                        series = that._stickedSeries;
                        point = series.getNeighborPoint(x, y);
                        that._releaseHoveredSeries();
                        point && that._setHoveredPoint(point)
                    }
                }
            }
            that._pointerComplete(point, x, y)
        },
        _pointerOnPoint: function(point, x, y) {
            this._setHoveredPoint(point);
            this._pointerComplete(point, x, y)
        },
        _pointerComplete: function(point) {
            this.pointAtShownTooltip !== point && this._tooltip.isEnabled() && this._showTooltip(point)
        },
        _clickHandler: function(e) {
            var that = e.data.tracker,
                rootOffset = that._renderer.getRootOffset(),
                x = _floor(e.pageX - rootOffset.left),
                y = _floor(e.pageY - rootOffset.top),
                point = getData(e, POINT_DATA),
                series = that._stickedSeries || getData(e, SERIES_DATA) || point && point.series,
                axis = that._argumentAxis;
            if (that._legend.coordsIn(x, y)) {
                var item = that._legend.getItemByCoord(x, y);
                if (item) {
                    that._legendClick(item, e)
                }
            } else {
                if (axis && axis.coordsIn(x, y)) {
                    var argument = getData(e, ARG_DATA);
                    if (isDefined(argument)) {
                        that._eventTrigger("argumentAxisClick", {
                            argument: argument,
                            jQueryEvent: e
                        })
                    }
                } else {
                    if (series) {
                        point = point || series.getPointByCoord(x, y);
                        if (point) {
                            that._pointClick(point, e)
                        } else {
                            getData(e, SERIES_DATA) && that._eventTrigger(SERIES_CLICK, {
                                target: series,
                                jQueryEvent: e
                            })
                        }
                    }
                }
            }
        },
        dispose: function() {
            var that = this;
            that._disableOutHandler();
            that._toggleParentsScrollSubscription();
            _each(that, function(k) {
                that[k] = null
            })
        }
    };
    var ChartTracker = function(options) {
        this.ctor(options)
    };
    $.extend(ChartTracker.prototype, baseTrackerPrototype, {
        _pointClick: function(point, event) {
            var that = this,
                eventTrigger = that._eventTrigger,
                series = point.series;
            eventTrigger(POINT_CLICK, {
                target: point,
                jQueryEvent: event
            }, function() {
                !eventCanceled(event, series) && eventTrigger(SERIES_CLICK, {
                    target: series,
                    jQueryEvent: event
                })
            })
        },
        update: function(options) {
            var that = this;
            that._zoomingMode = _normalizeEnum(options.zoomingMode);
            that._scrollingMode = _normalizeEnum(options.scrollingMode);
            baseTrackerPrototype.update.call(this, options);
            that._argumentAxis = options.argumentAxis || {};
            that._axisHoverEnabled = that._argumentAxis && _normalizeEnum(that._argumentAxis.getOptions().hoverMode) === ALL_ARGUMENTS_POINTS_MODE;
            that._chart = options.chart;
            that._rotated = options.rotated;
            that._crosshair = options.crosshair
        },
        _getCanvas: function(x, y) {
            var that = this,
                canvases = that._canvases || [];
            for (var i = 0; i < canvases.length; i++) {
                var c = canvases[i];
                if (inCanvas(c, x, y)) {
                    return c
                }
            }
            return null
        },
        _getPointSeries: function(point) {
            return point.series
        },
        _isModeChanged: function(series, mode) {
            return series.lastHoverMode !== mode
        },
        _isPointerOut: function(canvas) {
            return !canvas && this._stickedSeries
        },
        _resetHoveredArgument: function() {
            if (isDefined(this.hoveredArgument)) {
                this._toAllArgumentPoints(this.hoveredArgument, RELEASE_POINT_HOVER_STATE);
                this.hoveredArgument = null
            }
        },
        _toAllArgumentPoints: function(argument, func, eventName, targetPoint) {
            var that = this;
            _each(that._storedSeries, function(_, series) {
                setPointsSpecState(series.getPointsByArg(argument), targetPoint, func, eventName, that._eventTrigger)
            })
        },
        _hideCrosshair: function() {
            this._crosshair && this._crosshair.hide()
        },
        _moveCrosshair: function(point, x, y) {
            if (point && this._crosshair && point.isVisible()) {
                this._crosshair.show({
                    point: point,
                    x: x,
                    y: y
                })
            }
        },
        _releasePoint: function(point, eventTrigger) {
            var that = this,
                mode = _normalizeEnum(point.getOptions().hoverMode);
            if (mode === ALL_SERIES_POINTS_MODE) {
                setPointsSpecState(point.series.getPoints(), point, RELEASE_POINT_HOVER_STATE, POINT_HOVER_CHANGED, eventTrigger)
            } else {
                if (mode === ALL_ARGUMENTS_POINTS_MODE) {
                    that._toAllArgumentPoints(point.argument, RELEASE_POINT_HOVER_STATE, POINT_HOVER_CHANGED, point)
                } else {
                    if ("none" !== mode) {
                        that._getPointSeries(point).releasePointHoverState({
                            point: point,
                            setState: true,
                            legendCallback: that._legend.getActionCallback(point)
                        });
                        eventTrigger(POINT_HOVER_CHANGED, {
                            target: point
                        })
                    }
                }
            }
        },
        _setPointState: function(point, action, mode, eventName, legendCallback) {
            var series, that = this,
                eventTrigger = that._eventTrigger;
            switch (mode) {
                case ALL_ARGUMENTS_POINTS_MODE:
                    that._toAllArgumentPoints(point.argument, action, eventName, point);
                    break;
                case ALL_SERIES_POINTS_MODE:
                    setPointsSpecState(point.series.getPoints(), point, action, eventName, eventTrigger);
                    break;
                case NONE_MODE:
                    break;
                default:
                    series = that._getPointSeries(point);
                    series[action]({
                        point: point,
                        legendCallback: legendCallback,
                        setState: true
                    });
                    eventTrigger(eventName, {
                        target: point
                    })
            }
        },
        _prepare: function() {
            var that = this,
                root = that._renderer.root,
                touchScrollingEnabled = "all" === that._scrollingMode || "touch" === that._scrollingMode,
                touchZoomingEnabled = "all" === that._zoomingMode || "touch" === that._zoomingMode,
                cssValue = (!touchScrollingEnabled ? "pan-x pan-y " : "") + (!touchZoomingEnabled ? "pinch-zoom" : "") || "none",
                rootStyles = {
                    "touch-action": cssValue,
                    "-ms-touch-action": cssValue
                },
                wheelzoomingEnabled = "all" === that._zoomingMode || "mouse" === that._zoomingMode;
            root.off(wheelEvent.name + " dxc-scroll-start dxc-scroll-move");
            baseTrackerPrototype._prepare.call(that);
            if (!that._gestureEndHandler) {
                that._gestureEndHandler = function() {
                    that._gestureEnd && that._gestureEnd()
                };
                $(document).on(pointerEvents.up, that._gestureEndHandler)
            }
            wheelzoomingEnabled && root.on(wheelEvent.name, function(e) {
                var rootOffset = that._renderer.getRootOffset(),
                    x = that._rotated ? e.pageY - rootOffset.top : e.pageX - rootOffset.left,
                    scale = that._argumentAxis.getTranslator().getMinScale(e.delta > 0),
                    translate = x - x * scale,
                    zoom = that._argumentAxis.getTranslator().zoom(-translate, scale);
                that._pointerOut();
                that._eventTrigger(ZOOM_START);
                that._chart.zoomArgument(zoom.min, zoom.max, true);
                e.preventDefault();
                e.stopPropagation()
            });
            root.on("dxc-scroll-start", function(e) {
                that._startScroll = true;
                that._gestureStart(that._getGestureParams(e, {
                    left: 0,
                    top: 0
                }))
            }).on("dxc-scroll-move", function(e) {
                that._gestureChange(that._getGestureParams(e, {
                    left: 0,
                    top: 0
                })) && e.preventDefault()
            });
            root.css(rootStyles)
        },
        _getGestureParams: function(e, offset) {
            var x1, x2, left, right, that = this,
                touches = e.pointers.length,
                eventCoordField = that._rotated ? "pageY" : "pageX";
            offset = that._rotated ? offset.top : offset.left;
            if (2 === touches) {
                x1 = e.pointers[0][eventCoordField] - offset, x2 = e.pointers[1][eventCoordField] - offset
            } else {
                if (1 === touches) {
                    x1 = x2 = e.pointers[0][eventCoordField] - offset
                }
            }
            left = Math.min(x1, x2);
            right = Math.max(x1, x2);
            return {
                center: left + (right - left) / 2,
                distance: right - left,
                touches: touches,
                scale: 1,
                pointerType: e.pointerType
            }
        },
        _gestureStart: function(gestureParams) {
            var that = this;
            that._startGesture = that._startGesture || gestureParams;
            if (that._startGesture.touches !== gestureParams.touches) {
                that._startGesture = gestureParams
            }
        },
        _gestureChange: function(gestureParams) {
            var that = this,
                startGesture = that._startGesture,
                gestureChanged = false,
                scrollingEnabled = "all" === that._scrollingMode || "none" !== that._scrollingMode && that._scrollingMode === gestureParams.pointerType,
                zoomingEnabled = "all" === that._zoomingMode || "touch" === that._zoomingMode;
            if (!startGesture) {
                return gestureChanged
            }
            if (1 === startGesture.touches && Math.abs(startGesture.center - gestureParams.center) < 3) {
                that._gestureStart(gestureParams);
                return gestureChanged
            }
            if (2 === startGesture.touches && zoomingEnabled) {
                gestureChanged = true;
                startGesture.scale = gestureParams.distance / startGesture.distance;
                startGesture.scroll = gestureParams.center - startGesture.center + (startGesture.center - startGesture.center * startGesture.scale)
            } else {
                if (1 === startGesture.touches && scrollingEnabled) {
                    gestureChanged = true;
                    startGesture.scroll = gestureParams.center - startGesture.center
                }
            }
            if (gestureChanged) {
                if (that._startScroll) {
                    that._eventTrigger(ZOOM_START);
                    that._startScroll = false
                }
                startGesture.changed = gestureChanged;
                that._chart._transformArgument(startGesture.scroll, startGesture.scale)
            }
            return gestureChanged
        },
        _gestureEnd: function() {
            var zoom, that = this,
                startGesture = that._startGesture,
                renderer = that._renderer;
            that._startGesture = null;
            that._startScroll = false;

            function complete() {
                that._chart.zoomArgument(zoom.min, zoom.max, true)
            }
            if (startGesture && startGesture.changed) {
                zoom = that._argumentAxis._translator.zoom(-startGesture.scroll, startGesture.scale);
                if (renderer.animationEnabled() && (-startGesture.scroll !== zoom.translate || startGesture.scale !== zoom.scale)) {
                    var translateDelta = -(startGesture.scroll + zoom.translate),
                        scaleDelta = startGesture.scale - zoom.scale;
                    renderer.root.animate({
                        _: 0
                    }, {
                        step: function(pos) {
                            var translateValue = -startGesture.scroll - translateDelta * pos,
                                scaleValue = startGesture.scale - scaleDelta * pos;
                            that._chart._transformArgument(-translateValue, scaleValue)
                        },
                        complete: complete,
                        duration: 250
                    })
                } else {
                    complete()
                }
            }
        },
        _clean: function() {
            var that = this;
            baseTrackerPrototype._clean.call(that);
            that._resetTimer();
            that._stickedSeries = null
        },
        _getSeriesForShared: function(x, y) {
            var that = this,
                points = [],
                point = null,
                distance = 1 / 0;
            if (that._tooltip.isShared() && !that.hoveredSeries) {
                _each(that._storedSeries, function(_, series) {
                    var point = series.getNeighborPoint(x, y);
                    point && points.push(point)
                });
                _each(points, function(_, p) {
                    var coords = p.getCrosshairData(x, y),
                        d = vizUtils.getDistance(x, y, coords.x, coords.y);
                    if (d < distance) {
                        point = p;
                        distance = d
                    }
                })
            }
            return point && point.series
        },
        _setTimeout: function(callback, keeper) {
            var that = this;
            if (that._timeoutKeeper !== keeper) {
                that._resetTimer();
                that._hoverTimeout = setTimeout(function() {
                    callback();
                    that._timeoutKeeper = null
                }, DELAY);
                that._timeoutKeeper = keeper
            }
        },
        _resetTimer: function() {
            clearTimeout(this._hoverTimeout);
            this._timeoutKeeper = this._hoverTimeout = null
        },
        _checkGestureEvents: function(e, canvas, rootOffset) {
            var that = this;
            if (e.type === pointerEvents.down) {
                if (canvas) {
                    that._startScroll = true;
                    that._gestureStart(that._getGestureParams(e, rootOffset))
                }
            } else {
                if (that._startGesture && canvas) {
                    if (that._gestureChange(that._getGestureParams(e, rootOffset))) {
                        that._pointerOut();
                        e.preventDefault();
                        return true
                    }
                }
            }
        },
        _setStickedSeries: function(x, y) {
            this._stickedSeries = this._stickedSeries || this._getSeriesForShared(x, y);
            return !!this._stickedSeries
        },
        _setSeriesWithHoverView: function(point) {
            this._seriesWithHoverView = point.series.setHoverView()
        },
        _pointerOut: function() {
            var that = this;
            that._stickedSeries = null;
            that._hideCrosshair();
            that._resetHoveredArgument();
            that._resetTimer();
            baseTrackerPrototype._pointerOut.call(that)
        },
        _hoverArgumentAxis: function(x, y, e) {
            var that = this;
            that._resetHoveredArgument();
            if (that._axisHoverEnabled && that._argumentAxis.coordsIn(x, y)) {
                var argument = getData(e, ARG_DATA);
                if (isDefined(argument) && that.hoveredArgument !== argument) {
                    that._clearHover();
                    that._toAllArgumentPoints(argument, SET_POINT_HOVER_STATE);
                    that.hoveredArgument = argument
                }
                return true
            }
        },
        _pointerComplete: function(point, x, y) {
            var that = this;
            that.hoveredSeries && that.hoveredSeries.updateHover(x, y);
            that._resetTimer();
            that._moveCrosshair(point, x, y);
            baseTrackerPrototype._pointerComplete.call(that, point)
        },
        _legendClick: function(item, e) {
            var series = this._storedSeries[item.id];
            this._triggerLegendClick({
                target: series,
                jQueryEvent: e
            }, SERIES_CLICK)
        },
        _hoverLegendItem: function(x, y) {
            this._stickedSeries = null;
            this._hideCrosshair();
            baseTrackerPrototype._hoverLegendItem.call(this, x, y)
        },
        _pointerOnPoint: function(point, x, y) {
            var that = this,
                seriesWithHoverView = that._seriesWithHoverView,
                seriesFromPoint = point.series;
            that._stickedSeries = seriesFromPoint;
            that._releaseHoveredSeries(!seriesWithHoverView || seriesWithHoverView === seriesFromPoint, point);
            baseTrackerPrototype._pointerOnPoint.call(that, point, x, y)
        },
        dispose: function() {
            this._gestureEndHandler && $(document).off(pointerEvents.up, this._gestureEndHandler);
            this._resetTimer();
            baseTrackerPrototype.dispose.call(this)
        }
    });
    var PieTracker = function(options) {
        this.ctor(options)
    };
    $.extend(PieTracker.prototype, baseTrackerPrototype, {
        _getPointSeries: function(point) {
            return this._storedSeries[point.index]
        },
        _isModeChanged: function() {
            return false
        },
        _isPointerOut: function(_, point) {
            return !point
        },
        _legendClick: function(item, e) {
            var that = this,
                series = that._storedSeries,
                points = series[item.id]._points;
            if (1 === series.length && 1 === points.length) {
                that._triggerLegendClick({
                    target: points[0],
                    jQueryEvent: e
                }, POINT_CLICK)
            } else {
                that._eventTrigger(LEGEND_CLICK, {
                    target: item.argument,
                    jQueryEvent: e
                })
            }
        },
        _pointClick: function(point, e) {
            this._eventTrigger(POINT_CLICK, {
                target: point,
                jQueryEvent: e
            })
        },
        _releasePoint: function(point, eventTrigger) {
            var that = this,
                mode = _normalizeEnum(point.getOptions().hoverMode);
            if ("none" !== mode) {
                that._getPointSeries(point).releasePointHoverState({
                    point: point,
                    setState: true,
                    legendCallback: that._legend.getActionCallback(point)
                });
                eventTrigger(POINT_HOVER_CHANGED, {
                    target: point
                })
            }
        },
        _setPointState: function(point, action, mode, eventName, legendCallback) {
            var series, that = this,
                eventTrigger = that._eventTrigger;
            if ("none" !== mode) {
                series = that._getPointSeries(point);
                series[action]({
                    point: point,
                    legendCallback: legendCallback,
                    setState: true
                });
                eventTrigger(eventName, {
                    target: point
                })
            }
        },
        _hoverArgumentAxis: _noop,
        _setStickedSeries: _noop,
        _setSeriesWithHoverView: _noop,
        _getCanvas: _noop,
        _checkGestureEvents: _noop
    });
    exports.ChartTracker = ChartTracker;
    exports.PieTracker = PieTracker
});
