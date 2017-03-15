/** 
 * DevExtreme (viz/vector_map/projection.main.js)
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
        eventEmitterModule = require("./event_emitter");
    var _Number = Number,
        _min = Math.min,
        _max = Math.max,
        _abs = Math.abs,
        _round = Math.round,
        _ln = Math.log,
        _pow = Math.pow,
        TWO_TO_LN2 = 2 / Math.LN2,
        MIN_BOUNDS_RANGE = 1 / 3600 / 180 / 10,
        DEFAULT_MIN_ZOOM = 1,
        DEFAULT_MAX_ZOOM = 256,
        DEFAULT_CENTER = [NaN, NaN],
        DEFAULT_ENGINE_NAME = "mercator";

    function floatsEqual(f1, f2) {
        return _abs(f1 - f2) < 1e-8
    }

    function arraysEqual(a1, a2) {
        return floatsEqual(a1[0], a2[0]) && floatsEqual(a1[1], a2[1])
    }

    function parseAndClamp(value, minValue, maxValue, defaultValue) {
        var val = _Number(value);
        return isFinite(val) ? _min(_max(val, minValue), maxValue) : defaultValue
    }

    function parseAndClampArray(value, minValue, maxValue, defaultValue) {
        return [parseAndClamp(value[0], minValue[0], maxValue[0], defaultValue[0]), parseAndClamp(value[1], minValue[1], maxValue[1], defaultValue[1])]
    }

    function getEngine(engine) {
        return engine instanceof Engine && engine || projection.get(engine) || projection.get(DEFAULT_ENGINE_NAME)
    }

    function Projection(parameters) {
        var that = this;
        that._initEvents();
        that._params = parameters;
        that._engine = getEngine();
        that._center = that._engine.center();
        that._adjustCenter()
    }
    Projection.prototype = {
        constructor: Projection,
        _minZoom: DEFAULT_MIN_ZOOM,
        _maxZoom: DEFAULT_MAX_ZOOM,
        _zoom: DEFAULT_MIN_ZOOM,
        _center: DEFAULT_CENTER,
        _canvas: {},
        _scale: [],
        dispose: function() {
            this._disposeEvents()
        },
        setEngine: function(value) {
            var that = this,
                engine = getEngine(value);
            if (that._engine !== engine) {
                that._engine = engine;
                that._fire("engine");
                if (that._changeCenter(engine.center())) {
                    that._triggerCenterChanged()
                }
                if (that._changeZoom(that._minZoom)) {
                    that._triggerZoomChanged()
                }
                that._adjustCenter();
                that._setupScreen()
            }
        },
        setBounds: function(bounds) {
            if (void 0 !== bounds) {
                this.setEngine(this._engine.original().bounds(bounds))
            }
        },
        _setupScreen: function() {
            var that = this,
                canvas = that._canvas,
                width = canvas.width,
                height = canvas.height,
                aspectRatio = that._engine.ar();
            that._x0 = canvas.left + width / 2;
            that._y0 = canvas.top + height / 2;
            if (width / height <= aspectRatio) {
                that._xradius = width / 2;
                that._yradius = width / 2 / aspectRatio
            } else {
                that._xradius = height / 2 * aspectRatio;
                that._yradius = height / 2
            }
            that._fire("screen")
        },
        setSize: function(canvas) {
            var that = this;
            that._canvas = canvas;
            that._setupScreen()
        },
        _toScreen: function(coordinates) {
            return [this._x0 + this._xradius * coordinates[0], this._y0 + this._yradius * coordinates[1]]
        },
        _fromScreen: function(coordinates) {
            return [(coordinates[0] - this._x0) / this._xradius, (coordinates[1] - this._y0) / this._yradius]
        },
        _toTransformed: function(coordinates) {
            return [coordinates[0] * this._zoom + this._dxcenter, coordinates[1] * this._zoom + this._dycenter]
        },
        _toTransformedFast: function(coordinates) {
            return [coordinates[0] * this._zoom, coordinates[1] * this._zoom]
        },
        _fromTransformed: function(coordinates) {
            return [(coordinates[0] - this._dxcenter) / this._zoom, (coordinates[1] - this._dycenter) / this._zoom]
        },
        _adjustCenter: function() {
            var that = this,
                center = that._engine.project(that._center);
            that._dxcenter = -center[0] * that._zoom || 0;
            that._dycenter = -center[1] * that._zoom || 0
        },
        project: function(coordinates) {
            return this._engine.project(coordinates)
        },
        transform: function(coordinates) {
            return this._toScreen(this._toTransformedFast(coordinates))
        },
        isInvertible: function() {
            return this._engine.isinv()
        },
        getSquareSize: function(size) {
            return [size[0] * this._zoom * this._xradius, size[1] * this._zoom * this._yradius]
        },
        getZoom: function() {
            return this._zoom
        },
        _changeZoom: function(value) {
            var that = this,
                oldZoom = that._zoom,
                newZoom = that._zoom = parseAndClamp(value, that._minZoom, that._maxZoom, that._minZoom),
                isChanged = !floatsEqual(oldZoom, newZoom);
            if (isChanged) {
                that._adjustCenter();
                that._fire("zoom")
            }
            return isChanged
        },
        setZoom: function(value) {
            if (this._engine.isinv() && this._changeZoom(value)) {
                this._triggerZoomChanged()
            }
        },
        getScaledZoom: function() {
            return _round((this._scale.length - 1) * _ln(this._zoom) / _ln(this._maxZoom))
        },
        setScaledZoom: function(scaledZoom) {
            this.setZoom(this._scale[_round(scaledZoom)])
        },
        changeScaledZoom: function(deltaZoom) {
            this.setZoom(this._scale[_max(_min(_round(this.getScaledZoom() + deltaZoom), this._scale.length - 1), 0)])
        },
        getZoomScalePartition: function() {
            return this._scale.length - 1
        },
        _setupScaling: function() {
            var step, zoom, that = this,
                k = _round(TWO_TO_LN2 * _ln(that._maxZoom)),
                i = 1;
            k = k > 4 ? k : 4;
            step = _pow(that._maxZoom, 1 / k);
            zoom = that._minZoom;
            that._scale = [zoom];
            for (; i <= k; ++i) {
                that._scale.push(zoom *= step)
            }
        },
        setMaxZoom: function(maxZoom) {
            var that = this;
            that._minZoom = DEFAULT_MIN_ZOOM;
            that._maxZoom = parseAndClamp(maxZoom, that._minZoom, _Number.MAX_VALUE, DEFAULT_MAX_ZOOM);
            that._setupScaling();
            if (that._zoom > that._maxZoom) {
                that.setZoom(that._maxZoom)
            }
            that._fire("max-zoom")
        },
        getCenter: function() {
            return this._center.slice()
        },
        setCenter: function(value) {
            if (this._engine.isinv() && this._changeCenter(value || [])) {
                this._triggerCenterChanged()
            }
        },
        _changeCenter: function(value) {
            var that = this,
                engine = that._engine,
                oldCenter = that._center,
                newCenter = that._center = parseAndClampArray(value, engine.min(), engine.max(), engine.center()),
                isChanged = !arraysEqual(oldCenter, newCenter);
            if (isChanged) {
                that._adjustCenter();
                that._fire("center")
            }
            return isChanged
        },
        _triggerCenterChanged: function() {
            this._params.centerChanged(this.getCenter())
        },
        _triggerZoomChanged: function() {
            this._params.zoomChanged(this.getZoom())
        },
        setCenterByPoint: function(coordinates, screenPosition) {
            var that = this,
                p = that._engine.project(coordinates),
                q = that._fromScreen(screenPosition);
            that.setCenter(that._engine.unproject([-q[0] / that._zoom + p[0], -q[1] / that._zoom + p[1]]))
        },
        beginMoveCenter: function() {
            if (this._engine.isinv()) {
                this._moveCenter = this._center
            }
        },
        endMoveCenter: function() {
            var that = this;
            if (that._moveCenter) {
                if (!arraysEqual(that._moveCenter, that._center)) {
                    that._triggerCenterChanged()
                }
                that._moveCenter = null
            }
        },
        moveCenter: function(shift) {
            var current, center, that = this;
            if (that._moveCenter) {
                current = that._toScreen(that._toTransformed(that._engine.project(that._center)));
                center = that._engine.unproject(that._fromTransformed(that._fromScreen([current[0] + shift[0], current[1] + shift[1]])));
                that._changeCenter(center)
            }
        },
        getViewport: function() {
            var that = this,
                unproject = that._engine.unproject,
                lt = unproject(that._fromTransformed([-1, -1])),
                lb = unproject(that._fromTransformed([-1, 1])),
                rt = unproject(that._fromTransformed([1, -1])),
                rb = unproject(that._fromTransformed([1, 1])),
                minmax = findMinMax([selectFarthestPoint(lt[0], lb[0], rt[0], rb[0]), selectFarthestPoint(lt[1], rt[1], lb[1], rb[1])], [selectFarthestPoint(rt[0], rb[0], lt[0], lb[0]), selectFarthestPoint(lb[1], rb[1], lt[1], rt[1])]);
            return [].concat(minmax.min, minmax.max)
        },
        setViewport: function(viewport) {
            var engine = this._engine,
                data = viewport ? getZoomAndCenterFromViewport(engine.project, engine.unproject, viewport) : [this._minZoom, engine.center()];
            this.setZoom(data[0]);
            this.setCenter(data[1])
        },
        getTransform: function() {
            return {
                translateX: this._dxcenter * this._xradius,
                translateY: this._dycenter * this._yradius
            }
        },
        fromScreenPoint: function(coordinates) {
            return this._engine.unproject(this._fromTransformed(this._fromScreen(coordinates)))
        },
        _eventNames: ["engine", "screen", "center", "zoom", "max-zoom"]
    };
    eventEmitterModule.makeEventEmitter(Projection);

    function selectFarthestPoint(point1, point2, basePoint1, basePoint2) {
        var basePoint = (basePoint1 + basePoint2) / 2;
        return _abs(point1 - basePoint) > _abs(point2 - basePoint) ? point1 : point2
    }

    function selectClosestPoint(point1, point2, basePoint1, basePoint2) {
        var basePoint = (basePoint1 + basePoint2) / 2;
        return _abs(point1 - basePoint) < _abs(point2 - basePoint) ? point1 : point2
    }

    function getZoomAndCenterFromViewport(project, unproject, viewport) {
        var lt = project([viewport[0], viewport[3]]),
            lb = project([viewport[0], viewport[1]]),
            rt = project([viewport[2], viewport[3]]),
            rb = project([viewport[2], viewport[1]]),
            l = selectClosestPoint(lt[0], lb[0], rt[0], rb[0]),
            r = selectClosestPoint(rt[0], rb[0], lt[0], lb[0]),
            t = selectClosestPoint(lt[1], rt[1], lb[1], rb[1]),
            b = selectClosestPoint(lb[1], rb[1], lt[1], rt[1]);
        return [2 / _max(_abs(l - r), _abs(t - b)), unproject([(l + r) / 2, (t + b) / 2])]
    }

    function Engine(parameters, _original) {
        var that = this,
            aspectRatio = parameters.aspectRatio > 0 ? _Number(parameters.aspectRatio) : 1,
            project = createProjectMethod(parameters.to),
            unproject = parameters.from ? createUnprojectMethod(parameters.from) : returnValue(DEFAULT_CENTER),
            center = unproject([0, 0]),
            minmax = findMinMax([unproject([-1, 0])[0], unproject([0, 1])[1]], [unproject([1, 0])[0], unproject([0, -1])[1]]);
        that.project = project;
        that.unproject = unproject;
        that.original = returnValue(_original || that);
        that.source = function() {
            return $.extend({}, parameters)
        };
        that.isinv = returnValue(!!parameters.from);
        that.ar = returnValue(aspectRatio);
        that.center = returnArray(center);
        that.min = returnArray(minmax.min);
        that.max = returnArray(minmax.max)
    }
    Engine.prototype.aspectRatio = function(aspectRatio) {
        var parameters = this.source();
        parameters.aspectRatio = aspectRatio;
        return new Engine(parameters, this)
    };
    Engine.prototype.bounds = function(bounds) {
        bounds = bounds || [];
        var parameters = this.source(),
            min = this.min(),
            max = this.max(),
            p1 = parameters.to(parseAndClampArray([bounds[0], bounds[1]], min, max, min)),
            p2 = parameters.to(parseAndClampArray([bounds[2], bounds[3]], min, max, max)),
            delta = _min(_abs(p2[0] - p1[0]) > MIN_BOUNDS_RANGE ? _abs(p2[0] - p1[0]) : 2, _abs(p2[1] - p1[1]) > MIN_BOUNDS_RANGE ? _abs(p2[1] - p1[1]) : 2);
        if (delta < 2) {
            $.extend(parameters, createProjectUnprojectMethods(parameters.to, parameters.from, p1, p2, delta))
        }
        return new Engine(parameters, this)
    };

    function isEngine(engine) {
        return engine instanceof Engine
    }

    function invertVerticalAxis(pair) {
        return [pair[0], -pair[1]]
    }

    function createProjectMethod(method) {
        return function(arg) {
            return invertVerticalAxis(method(arg))
        }
    }

    function createUnprojectMethod(method) {
        return function(arg) {
            return method(invertVerticalAxis(arg))
        }
    }

    function returnValue(value) {
        return function() {
            return value
        }
    }

    function returnArray(value) {
        return function() {
            return value.slice()
        }
    }

    function projection(parameters) {
        return parameters && parameters.to ? new Engine(parameters) : null
    }

    function findMinMax(p1, p2) {
        return {
            min: [_min(p1[0], p2[0]), _min(p1[1], p2[1])],
            max: [_max(p1[0], p2[0]), _max(p1[1], p2[1])]
        }
    }
    var projectionsCache = {};
    projection.get = function(name) {
        return projectionsCache[name] || null
    };
    projection.add = function(name, engine) {
        if (!projectionsCache[name] && isEngine(engine)) {
            projectionsCache[name] = engine
        }
        return projection
    };

    function createProjectUnprojectMethods(project, unproject, p1, p2, delta) {
        var x0 = (p1[0] + p2[0]) / 2 - delta / 2,
            y0 = (p1[1] + p2[1]) / 2 - delta / 2,
            k = 2 / delta;
        return {
            to: function(coordinates) {
                var p = project(coordinates);
                return [-1 + (p[0] - x0) * k, -1 + (p[1] - y0) * k]
            },
            from: function(coordinates) {
                var p = [x0 + (coordinates[0] + 1) / k, y0 + (coordinates[1] + 1) / k];
                return unproject(p)
            }
        }
    }
    exports.Projection = Projection;
    exports.projection = projection
});
