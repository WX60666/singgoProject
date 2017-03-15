/** 
 * DevExtreme (ui/map/ui.map.provider.dynamic.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery"),
        Provider = require("./ui.map.provider"),
        abstract = Provider.abstract;
    var DynamicProvider = Provider.inherit({
        cancelEvents: true,
        _geocodeLocation: function(location) {
            var d = $.Deferred();
            var cache = this._geocodedLocations,
                cachedLocation = cache[location];
            if (cachedLocation) {
                d.resolve(cachedLocation)
            } else {
                this._geocodeLocationImpl(location).done(function(geocodedLocation) {
                    cache[location] = geocodedLocation;
                    d.resolve(geocodedLocation)
                })
            }
            return d.promise()
        },
        _renderImpl: function(markerOptions, routeOptions) {
            var deferred = $.Deferred();
            this._load().done($.proxy(function() {
                this._init().done($.proxy(function() {
                    var mapTypePromise = this.updateMapType(),
                        boundsPromise = this._isBoundsSetted() ? this.updateBounds() : this.updateCenter();
                    $.when(mapTypePromise, boundsPromise).done($.proxy(function() {
                        this._attachHandlers();
                        setTimeout(function() {
                            deferred.resolve()
                        })
                    }, this))
                }, this))
            }, this));
            return deferred.promise()
        },
        _load: function() {
            if (!this._mapsLoader) {
                this._mapsLoader = $.Deferred();
                this._loadImpl().done($.proxy(function() {
                    this._mapsLoader.resolve()
                }, this))
            }
            this._markers = [];
            this._routes = [];
            return this._mapsLoader.promise()
        },
        _loadImpl: abstract,
        _init: abstract,
        _attachHandlers: abstract,
        addMarkers: function(options) {
            var deferred = $.Deferred(),
                that = this;
            var markerPromises = $.map(options, function(options) {
                return that._addMarker(options)
            });
            $.when.apply($, markerPromises).done(function() {
                var instances = $.map($.makeArray(arguments), function(markerObject) {
                    return markerObject.marker
                });
                deferred.resolve(false, instances)
            });
            deferred.done(function() {
                that._fitBounds()
            });
            return deferred.promise()
        },
        _addMarker: function(options) {
            var that = this;
            return this._renderMarker(options).done(function(markerObject) {
                that._markers.push($.extend({
                    options: options
                }, markerObject));
                that._fireMarkerAddedAction({
                    options: options,
                    originalMarker: markerObject.marker
                })
            })
        },
        _renderMarker: abstract,
        removeMarkers: function(markersOptionsToRemove) {
            var that = this;
            $.each(markersOptionsToRemove, function(_, markerOptionToRemove) {
                that._removeMarker(markerOptionToRemove)
            });
            return $.Deferred().resolve().promise()
        },
        _removeMarker: function(markersOptionToRemove) {
            var that = this;
            $.each(this._markers, function(markerIndex, markerObject) {
                if (markerObject.options !== markersOptionToRemove) {
                    return true
                }
                that._destroyMarker(markerObject);
                that._markers.splice(markerIndex, 1);
                that._fireMarkerRemovedAction({
                    options: markerObject.options
                });
                return false
            })
        },
        _destroyMarker: abstract,
        _clearMarkers: function() {
            while (this._markers.length > 0) {
                this._removeMarker(this._markers[0].options)
            }
        },
        addRoutes: function(options) {
            var deferred = $.Deferred(),
                that = this;
            var routePromises = $.map(options, function(options) {
                return that._addRoute(options)
            });
            $.when.apply($, routePromises).done(function() {
                var instances = $.map($.makeArray(arguments), function(routeObject) {
                    return routeObject.instance
                });
                deferred.resolve(false, instances)
            });
            deferred.done(function() {
                that._fitBounds()
            });
            return deferred.promise()
        },
        _addRoute: function(options) {
            var that = this;
            return this._renderRoute(options).done(function(routeObject) {
                that._routes.push($.extend({
                    options: options
                }, routeObject));
                that._fireRouteAddedAction({
                    options: options,
                    originalRoute: routeObject.instance
                })
            })
        },
        _renderRoute: abstract,
        removeRoutes: function(options) {
            var that = this;
            $.each(options, function(routeIndex, options) {
                that._removeRoute(options)
            });
            return $.Deferred().resolve().promise()
        },
        _removeRoute: function(options) {
            var that = this;
            $.each(this._routes, function(routeIndex, routeObject) {
                if (routeObject.options !== options) {
                    return true
                }
                that._destroyRoute(routeObject);
                that._routes.splice(routeIndex, 1);
                that._fireRouteRemovedAction({
                    options: options
                });
                return false
            })
        },
        _destroyRoute: abstract,
        _clearRoutes: function() {
            while (this._routes.length > 0) {
                this._removeRoute(this._routes[0].options)
            }
        },
        adjustViewport: function() {
            return this._fitBounds()
        },
        _fitBounds: abstract,
        _updateBounds: function() {
            var that = this;
            this._clearBounds();
            if (!this._option("autoAdjust")) {
                return
            }
            $.each(this._markers, function(_, markerObject) {
                that._extendBounds(markerObject.location)
            });
            $.each(this._routes, function(_, routeObject) {
                that._extendBounds(routeObject.northEast);
                that._extendBounds(routeObject.southWest)
            })
        },
        _clearBounds: function() {
            this._bounds = null
        },
        _extendBounds: abstract
    });
    module.exports = DynamicProvider
});
