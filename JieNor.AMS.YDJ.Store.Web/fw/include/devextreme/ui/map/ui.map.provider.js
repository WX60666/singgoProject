/** 
 * DevExtreme (ui/map/ui.map.provider.js)
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
        Class = require("../../core/class"),
        eventUtils = require("../../events/utils");
    var abstract = Class.abstract;
    var Provider = Class.inherit({
        _defaultRouteWeight: function() {
            return 5
        },
        _defaultRouteOpacity: function() {
            return .5
        },
        _defaultRouteColor: function() {
            return "#0000FF"
        },
        cancelEvents: false,
        ctor: function(map, $container) {
            this._mapWidget = map;
            this._$container = $container
        },
        render: function(markerOptions, routeOptions) {
            var deferred = $.Deferred();
            this._renderImpl().done($.proxy(function() {
                var markersPromise = this._applyFunctionIfNeeded("addMarkers", markerOptions);
                var routesPromise = this._applyFunctionIfNeeded("addRoutes", routeOptions);
                $.when(markersPromise, routesPromise).done(function() {
                    deferred.resolve(true)
                })
            }, this));
            return deferred.promise()
        },
        _renderImpl: abstract,
        updateDimensions: abstract,
        updateMapType: abstract,
        updateBounds: abstract,
        updateCenter: abstract,
        updateZoom: abstract,
        updateControls: abstract,
        updateMarkers: function(markerOptionsToRemove, markerOptionsToAdd) {
            var deferred = $.Deferred(),
                that = this;
            this._applyFunctionIfNeeded("removeMarkers", markerOptionsToRemove).done(function() {
                that._applyFunctionIfNeeded("addMarkers", markerOptionsToAdd).done(function() {
                    deferred.resolve.apply(deferred, arguments)
                })
            });
            return deferred.promise()
        },
        addMarkers: abstract,
        removeMarkers: abstract,
        adjustViewport: abstract,
        updateRoutes: function(routeOptionsToRemove, routeOptionsToAdd) {
            var deferred = $.Deferred(),
                that = this;
            this._applyFunctionIfNeeded("removeRoutes", routeOptionsToRemove).done(function() {
                that._applyFunctionIfNeeded("addRoutes", routeOptionsToAdd).done(function() {
                    deferred.resolve.apply(deferred, arguments)
                })
            });
            return deferred.promise()
        },
        addRoutes: abstract,
        removeRoutes: abstract,
        clean: abstract,
        map: function() {
            return this._map
        },
        _option: function(name, value) {
            if (void 0 === value) {
                return this._mapWidget.option(name)
            }
            this._mapWidget.setOptionSilent(name, value)
        },
        _keyOption: function(providerName) {
            var key = this._option("key");
            return void 0 === key[providerName] ? key : key[providerName]
        },
        _parseTooltipOptions: function(option) {
            return {
                text: option.text || option,
                visible: option.isShown || false
            }
        },
        _getLatLng: function(location) {
            if ("string" === typeof location) {
                var coords = $.map(location.split(","), $.trim),
                    numericRegex = /^[-+]?[0-9]*\.?[0-9]*$/;
                if (2 === coords.length && coords[0].match(numericRegex) && coords[1].match(numericRegex)) {
                    return {
                        lat: parseFloat(coords[0]),
                        lng: parseFloat(coords[1])
                    }
                }
            } else {
                if ($.isArray(location) && 2 === location.length) {
                    return {
                        lat: location[0],
                        lng: location[1]
                    }
                } else {
                    if ($.isPlainObject(location) && $.isNumeric(location.lat) && $.isNumeric(location.lng)) {
                        return location
                    }
                }
            }
            return null
        },
        _isBoundsSetted: function() {
            return this._option("bounds.northEast") && this._option("bounds.southWest")
        },
        _addEventNamespace: function(name) {
            return eventUtils.addNamespace(name, this._mapWidget.NAME)
        },
        _applyFunctionIfNeeded: function(fnName, array) {
            if (!array.length) {
                return $.Deferred().resolve().promise()
            }
            return this[fnName](array)
        },
        _fireAction: function(name, actionArguments) {
            this._mapWidget._createActionByOption(name)(actionArguments)
        },
        _fireClickAction: function(actionArguments) {
            this._fireAction("onClick", actionArguments)
        },
        _fireMarkerAddedAction: function(actionArguments) {
            this._fireAction("onMarkerAdded", actionArguments)
        },
        _fireMarkerRemovedAction: function(actionArguments) {
            this._fireAction("onMarkerRemoved", actionArguments)
        },
        _fireRouteAddedAction: function(actionArguments) {
            this._fireAction("onRouteAdded", actionArguments)
        },
        _fireRouteRemovedAction: function(actionArguments) {
            this._fireAction("onRouteRemoved", actionArguments)
        }
    });
    module.exports = Provider
});
