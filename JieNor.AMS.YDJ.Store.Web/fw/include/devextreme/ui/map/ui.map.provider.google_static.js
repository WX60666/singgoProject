/** 
 * DevExtreme (ui/map/ui.map.provider.google_static.js)
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
        Color = require("../../color"),
        clickEvent = require("../../events/click");
    var GOOGLE_STATIC_URL = "https://maps.google.com/maps/api/staticmap?";
    var GoogleStaticProvider = Provider.inherit({
        _locationToString: function(location) {
            var latlng = this._getLatLng(location);
            return latlng ? latlng.lat + "," + latlng.lng : location.toString().replace(/ /g, "+")
        },
        _renderImpl: function() {
            return this._updateMap()
        },
        updateDimensions: function() {
            return this._updateMap()
        },
        updateMapType: function() {
            return this._updateMap()
        },
        updateBounds: function() {
            return $.Deferred().resolve().promise()
        },
        updateCenter: function() {
            return this._updateMap()
        },
        updateZoom: function() {
            return this._updateMap()
        },
        updateControls: function() {
            return $.Deferred().resolve().promise()
        },
        addMarkers: function(options) {
            var that = this;
            return this._updateMap().done(function() {
                $.each(options, function(_, options) {
                    that._fireMarkerAddedAction({
                        options: options
                    })
                })
            })
        },
        removeMarkers: function(options) {
            var that = this;
            return this._updateMap().done(function() {
                $.each(options, function(_, options) {
                    that._fireMarkerRemovedAction({
                        options: options
                    })
                })
            })
        },
        adjustViewport: function() {
            return $.Deferred().resolve().promise()
        },
        addRoutes: function(options) {
            var that = this;
            return this._updateMap().done(function() {
                $.each(options, function(_, options) {
                    that._fireRouteAddedAction({
                        options: options
                    })
                })
            })
        },
        removeRoutes: function(options) {
            var that = this;
            return this._updateMap().done(function() {
                $.each(options, function(_, options) {
                    that._fireRouteRemovedAction({
                        options: options
                    })
                })
            })
        },
        clean: function() {
            this._$container.css("background-image", "none");
            this._$container.off(this._addEventNamespace(clickEvent.name));
            return $.Deferred().resolve().promise()
        },
        mapRendered: function() {
            return true
        },
        _updateMap: function() {
            var key = this._keyOption("googleStatic"),
                $container = this._$container;
            var requestOptions = ["sensor=false", "size=" + $container.width() + "x" + $container.height(), "maptype=" + this._option("type"), "center=" + this._locationToString(this._option("center")), "zoom=" + this._option("zoom"), this._markersSubstring()];
            requestOptions.push.apply(requestOptions, this._routeSubstrings());
            if (key) {
                requestOptions.push("key=" + key)
            }
            var request = GOOGLE_STATIC_URL + requestOptions.join("&");
            this._$container.css("background", 'url("' + request + '") no-repeat 0 0');
            this._attachClickEvent();
            return $.Deferred().resolve(true).promise()
        },
        _markersSubstring: function() {
            var that = this,
                markers = [],
                markerIcon = this._option("markerIconSrc");
            if (markerIcon) {
                markers.push("icon:" + markerIcon)
            }
            $.each(this._option("markers"), function(_, marker) {
                markers.push(that._locationToString(marker.location))
            });
            return "markers=" + markers.join("|")
        },
        _routeSubstrings: function() {
            var that = this,
                routes = [];
            $.each(this._option("routes"), function(_, route) {
                var color = new Color(route.color || that._defaultRouteColor()).toHex().replace("#", "0x"),
                    opacity = Math.round(255 * (route.opacity || that._defaultRouteOpacity())).toString(16),
                    width = route.weight || that._defaultRouteWeight(),
                    locations = [];
                $.each(route.locations, function(_, routePoint) {
                    locations.push(that._locationToString(routePoint))
                });
                routes.push("path=color:" + color + opacity + "|weight:" + width + "|" + locations.join("|"))
            });
            return routes
        },
        _attachClickEvent: function() {
            var that = this,
                eventName = this._addEventNamespace(clickEvent.name);
            this._$container.off(eventName).on(eventName, function(e) {
                that._fireClickAction({
                    jQueryEvent: e
                })
            })
        }
    });
    module.exports = GoogleStaticProvider
});
