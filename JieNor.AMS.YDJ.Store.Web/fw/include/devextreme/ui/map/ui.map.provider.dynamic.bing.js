/** 
 * DevExtreme (ui/map/ui.map.provider.dynamic.bing.js)
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
        DynamicProvider = require("./ui.map.provider.dynamic"),
        Color = require("../../color"),
        support = require("../../core/utils/support");
    var BING_MAP_READY = "_bingScriptReady",
        BING_URL = "https://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&s=1&onScriptLoad=" + BING_MAP_READY,
        BING_LOCAL_FILES1 = "ms-appx:///Bing.Maps.JavaScript/js/veapicore.js",
        BING_LOCAL_FILES2 = "ms-appx:///Bing.Maps.JavaScript/js/veapiModules.js",
        BING_CREDENTIALS = "AhuxC0dQ1DBTNo8L-H9ToVMQStmizZzBJdraTSgCzDSWPsA1Qd8uIvFSflzxdaLH",
        MIN_LOCATION_RECT_LENGTH = 1e-16;
    var msMapsLoaded = function() {
        return window.Microsoft && window.Microsoft.Maps
    };
    var msMapsLoader;
    var BingProvider = DynamicProvider.inherit({
        _mapType: function(type) {
            var mapTypes = {
                roadmap: Microsoft.Maps.MapTypeId.road,
                hybrid: Microsoft.Maps.MapTypeId.aerial,
                satellite: Microsoft.Maps.MapTypeId.aerial
            };
            return mapTypes[type] || mapTypes.road
        },
        _movementMode: function(type) {
            var movementTypes = {
                driving: Microsoft.Maps.Directions.RouteMode.driving,
                walking: Microsoft.Maps.Directions.RouteMode.walking
            };
            return movementTypes[type] || movementTypes.driving
        },
        _resolveLocation: function(location) {
            var d = $.Deferred();
            var latLng = this._getLatLng(location);
            if (latLng) {
                d.resolve(new Microsoft.Maps.Location(latLng.lat, latLng.lng))
            } else {
                this._geocodeLocation(location).done(function(geocodedLocation) {
                    d.resolve(geocodedLocation)
                })
            }
            return d.promise()
        },
        _geocodedLocations: {},
        _geocodeLocationImpl: function(location) {
            var d = $.Deferred();
            var searchManager = new Microsoft.Maps.Search.SearchManager(this._map);
            var searchRequest = {
                where: location,
                count: 1,
                callback: function(searchResponse) {
                    var result = searchResponse.results[0];
                    if (result) {
                        var boundsBox = searchResponse.results[0].location;
                        d.resolve(new Microsoft.Maps.Location(boundsBox.latitude, boundsBox.longitude))
                    } else {
                        d.resolve(new Microsoft.Maps.Location(0, 0))
                    }
                }
            };
            searchManager.geocode(searchRequest);
            return d.promise()
        },
        _normalizeLocation: function(location) {
            return {
                lat: location.latitude,
                lng: location.longitude
            }
        },
        _normalizeLocationRect: function(locationRect) {
            var northWest = this._normalizeLocation(locationRect.getNorthwest()),
                southEast = this._normalizeLocation(locationRect.getSoutheast());
            return {
                northEast: {
                    lat: northWest.lat,
                    lng: southEast.lng
                },
                southWest: {
                    lat: southEast.lat,
                    lng: northWest.lng
                }
            }
        },
        _loadImpl: function() {
            this._msMapsLoader = $.Deferred();
            if (msMapsLoaded()) {
                this._mapReady()
            } else {
                if (!msMapsLoader || "resolved" === msMapsLoader.state() && !msMapsLoaded()) {
                    msMapsLoader = $.Deferred();
                    window[BING_MAP_READY] = $.proxy(msMapsLoader.resolve, msMapsLoader);
                    if (support.winJS) {
                        $.when($.getScript(BING_LOCAL_FILES1), $.getScript(BING_LOCAL_FILES2)).done(function() {
                            Microsoft.Maps.loadModule("Microsoft.Maps.Map", {
                                callback: window[BING_MAP_READY]
                            })
                        })
                    } else {
                        $.getScript(BING_URL)
                    }
                }
                msMapsLoader.done($.proxy(this._mapReady, this))
            }
            return this._msMapsLoader.promise()
        },
        _mapReady: function() {
            try {
                delete window[BING_MAP_READY]
            } catch (e) {
                window[BING_MAP_READY] = void 0
            }
            var searchModulePromise = $.Deferred();
            var directionsModulePromise = $.Deferred();
            Microsoft.Maps.loadModule("Microsoft.Maps.Search", {
                callback: $.proxy(searchModulePromise.resolve, searchModulePromise)
            });
            Microsoft.Maps.loadModule("Microsoft.Maps.Directions", {
                callback: $.proxy(directionsModulePromise.resolve, directionsModulePromise)
            });
            $.when(searchModulePromise, directionsModulePromise).done($.proxy(function() {
                this._msMapsLoader.resolve()
            }, this))
        },
        _init: function() {
            var deferred = $.Deferred(),
                initPromise = $.Deferred(),
                controls = this._option("controls");
            this._map = new Microsoft.Maps.Map(this._$container[0], {
                credentials: this._keyOption("bing") || BING_CREDENTIALS,
                zoom: this._option("zoom"),
                showDashboard: controls,
                showMapTypeSelector: controls,
                showScalebar: controls
            });
            var handler = Microsoft.Maps.Events.addHandler(this._map, "tiledownloadcomplete", $.proxy(initPromise.resolve, initPromise));
            $.when(initPromise).done($.proxy(function() {
                Microsoft.Maps.Events.removeHandler(handler);
                deferred.resolve()
            }, this));
            return deferred.promise()
        },
        _attachHandlers: function() {
            this._providerViewChangeHandler = Microsoft.Maps.Events.addHandler(this._map, "viewchange", $.proxy(this._viewChangeHandler, this));
            this._providerClickHandler = Microsoft.Maps.Events.addHandler(this._map, "click", $.proxy(this._clickActionHandler, this))
        },
        _viewChangeHandler: function() {
            var bounds = this._map.getBounds();
            this._option("bounds", this._normalizeLocationRect(bounds));
            var center = this._map.getCenter();
            this._option("center", this._normalizeLocation(center));
            if (!this._preventZoomChangeEvent) {
                this._option("zoom", this._map.getZoom())
            }
        },
        _clickActionHandler: function(e) {
            if ("map" === e.targetType) {
                var point = new Microsoft.Maps.Point(e.getX(), e.getY()),
                    location = e.target.tryPixelToLocation(point);
                this._fireClickAction({
                    location: this._normalizeLocation(location)
                })
            }
        },
        updateDimensions: function() {
            var $container = this._$container;
            this._map.setOptions({
                width: $container.width(),
                height: $container.height()
            });
            return $.Deferred().resolve().promise()
        },
        updateMapType: function() {
            var type = this._option("type"),
                labelOverlay = Microsoft.Maps.LabelOverlay;
            this._map.setView({
                animate: false,
                mapTypeId: this._mapType(type),
                labelOverlay: "satellite" === type ? labelOverlay.hidden : labelOverlay.visible
            });
            return $.Deferred().resolve().promise()
        },
        updateBounds: function() {
            var deferred = $.Deferred(),
                that = this;
            var northEastPromise = this._resolveLocation(this._option("bounds.northEast")),
                southWestPromise = this._resolveLocation(this._option("bounds.southWest"));
            $.when(northEastPromise, southWestPromise).done(function(northEast, southWest) {
                var bounds = new Microsoft.Maps.LocationRect.fromLocations(northEast, southWest);
                that._map.setView({
                    animate: false,
                    bounds: bounds
                });
                deferred.resolve()
            });
            return deferred.promise()
        },
        updateCenter: function() {
            var deferred = $.Deferred(),
                that = this;
            this._resolveLocation(this._option("center")).done(function(location) {
                that._map.setView({
                    animate: false,
                    center: location
                });
                deferred.resolve()
            });
            return deferred.promise()
        },
        updateZoom: function() {
            this._map.setView({
                animate: false,
                zoom: this._option("zoom")
            });
            return $.Deferred().resolve().promise()
        },
        updateControls: function() {
            this.clean();
            return this.render.apply(this, arguments)
        },
        _renderMarker: function(options) {
            var d = $.Deferred(),
                that = this;
            this._resolveLocation(options.location).done(function(location) {
                var pushpinOptions = {
                    icon: options.iconSrc || that._option("markerIconSrc")
                };
                if (options.html) {
                    $.extend(pushpinOptions, {
                        htmlContent: options.html,
                        width: null,
                        height: null
                    });
                    var htmlOffset = options.htmlOffset;
                    if (htmlOffset) {
                        pushpinOptions.anchor = new Microsoft.Maps.Point((-htmlOffset.left), (-htmlOffset.top))
                    }
                }
                var pushpin = new Microsoft.Maps.Pushpin(location, pushpinOptions);
                that._map.entities.push(pushpin);
                var infobox = that._renderTooltip(location, options.tooltip);
                var handler;
                if (options.onClick || options.tooltip) {
                    var markerClickAction = that._mapWidget._createAction(options.onClick || $.noop),
                        markerNormalizedLocation = that._normalizeLocation(location);
                    handler = Microsoft.Maps.Events.addHandler(pushpin, "click", function() {
                        markerClickAction({
                            location: markerNormalizedLocation
                        });
                        if (infobox) {
                            infobox.setOptions({
                                visible: true
                            })
                        }
                    })
                }
                d.resolve({
                    location: location,
                    marker: pushpin,
                    infobox: infobox,
                    handler: handler
                })
            });
            return d.promise()
        },
        _renderTooltip: function(location, options) {
            if (!options) {
                return
            }
            options = this._parseTooltipOptions(options);
            var infobox = new Microsoft.Maps.Infobox(location, {
                description: options.text,
                offset: new Microsoft.Maps.Point(0, 33),
                visible: options.visible
            });
            this._map.entities.push(infobox, null);
            return infobox
        },
        _destroyMarker: function(marker) {
            this._map.entities.remove(marker.marker);
            if (marker.infobox) {
                this._map.entities.remove(marker.infobox)
            }
            if (marker.handler) {
                Microsoft.Maps.Events.removeHandler(marker.handler)
            }
        },
        _renderRoute: function(options) {
            var d = $.Deferred(),
                that = this;
            var points = $.map(options.locations, function(point) {
                return that._resolveLocation(point)
            });
            $.when.apply($, points).done(function() {
                var locations = $.makeArray(arguments),
                    direction = new Microsoft.Maps.Directions.DirectionsManager(that._map),
                    color = new Color(options.color || that._defaultRouteColor()).toHex(),
                    routeColor = new Microsoft.Maps.Color.fromHex(color);
                routeColor.a = 255 * (options.opacity || that._defaultRouteOpacity());
                direction.setRenderOptions({
                    autoUpdateMapView: false,
                    displayRouteSelector: false,
                    waypointPushpinOptions: {
                        visible: false
                    },
                    drivingPolylineOptions: {
                        strokeColor: routeColor,
                        strokeThickness: options.weight || that._defaultRouteWeight()
                    },
                    walkingPolylineOptions: {
                        strokeColor: routeColor,
                        strokeThickness: options.weight || that._defaultRouteWeight()
                    }
                });
                direction.setRequestOptions({
                    routeMode: that._movementMode(options.mode),
                    routeDraggable: false
                });
                $.each(locations, function(_, location) {
                    var waypoint = new Microsoft.Maps.Directions.Waypoint({
                        location: location
                    });
                    direction.addWaypoint(waypoint)
                });
                var handler = Microsoft.Maps.Events.addHandler(direction, "directionsUpdated", function(args) {
                    Microsoft.Maps.Events.removeHandler(handler);
                    var routeSummary = args.routeSummary[0];
                    d.resolve({
                        instance: direction,
                        northEast: routeSummary.northEast,
                        southWest: routeSummary.southWest
                    })
                });
                direction.calculateDirections()
            });
            return d.promise()
        },
        _destroyRoute: function(routeObject) {
            routeObject.instance.dispose()
        },
        _fitBounds: function() {
            this._updateBounds();
            if (this._bounds && this._option("autoAdjust")) {
                var zoomBeforeFitting = this._map.getZoom();
                this._preventZoomChangeEvent = true;
                var bounds = this._bounds.clone();
                bounds.height = 1.1 * bounds.height;
                bounds.width = 1.1 * bounds.width;
                this._map.setView({
                    animate: false,
                    bounds: bounds,
                    zoom: zoomBeforeFitting
                });
                var zoomAfterFitting = this._map.getZoom();
                if (zoomBeforeFitting < zoomAfterFitting) {
                    this._map.setView({
                        animate: false,
                        zoom: zoomBeforeFitting
                    })
                } else {
                    this._option("zoom", zoomAfterFitting)
                }
                delete this._preventZoomChangeEvent
            }
            return $.Deferred().resolve().promise()
        },
        _extendBounds: function(location) {
            if (this._bounds) {
                this._bounds = new Microsoft.Maps.LocationRect.fromLocations(this._bounds.getNorthwest(), this._bounds.getSoutheast(), location)
            } else {
                this._bounds = new Microsoft.Maps.LocationRect(location, MIN_LOCATION_RECT_LENGTH, MIN_LOCATION_RECT_LENGTH)
            }
        },
        clean: function() {
            if (this._map) {
                Microsoft.Maps.Events.removeHandler(this._providerViewChangeHandler);
                Microsoft.Maps.Events.removeHandler(this._providerClickHandler);
                this._clearMarkers();
                this._clearRoutes();
                this._map.dispose()
            }
            return $.Deferred().resolve().promise()
        }
    });
    module.exports = BingProvider
});
