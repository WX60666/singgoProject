/** 
 * DevExtreme (ui/map/ui.map.js)
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
        errors = require("../widget/ui.errors"),
        devices = require("../../core/devices"),
        Widget = require("../widget/ui.widget"),
        support = require("../../core/utils/support"),
        inflector = require("../../core/utils/inflector"),
        eventUtils = require("../../events/utils"),
        pointerEvents = require("../../events/pointer"),
        config = require("../../core/config"),
        wrapToArray = require("../../core/utils/array").wrapToArray;
    var PROVIDERS = {
        googleStatic: require("./ui.map.provider.google_static"),
        google: require("./ui.map.provider.dynamic.google"),
        bing: require("./ui.map.provider.dynamic.bing")
    };
    var MAP_CLASS = "dx-map",
        MAP_CONTAINER_CLASS = "dx-map-container",
        MAP_SHIELD_CLASS = "dx-map-shield",
        NATIVE_CLICK_CLASS = "dx-native-click";
    var Map = Widget.inherit({
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                bounds: {
                    northEast: null,
                    southWest: null
                },
                center: {
                    lat: 0,
                    lng: 0
                },
                zoom: 1,
                width: 300,
                height: 300,
                type: "roadmap",
                provider: "google",
                autoAdjust: true,
                markers: [],
                markerIconSrc: null,
                onMarkerAdded: null,
                onMarkerRemoved: null,
                routes: [],
                onRouteAdded: null,
                onRouteRemoved: null,
                key: {
                    bing: "",
                    google: "",
                    googleStatic: ""
                },
                controls: false,
                onReady: null,
                onUpdated: null,
                onClick: null
            })
        },
        _defaultOptionsRules: function() {
            return this.callBase().concat([{
                device: function(device) {
                    return "desktop" === devices.real().deviceType && !devices.isSimulator()
                },
                options: {
                    focusStateEnabled: true
                }
            }])
        },
        _init: function() {
            this.callBase();
            this.element().addClass(MAP_CLASS).addClass(NATIVE_CLICK_CLASS);
            this._asyncQueue = [];
            this._checkOption("provider");
            this._checkOption("markers");
            this._checkOption("routes");
            this._initContainer();
            this._grabEvents();
            this._rendered = {}
        },
        _checkOption: function(option) {
            var value = this.option(option);
            if ("provider" === option && support.winJS && "google" === value) {
                throw errors.Error("E1024")
            }
            if ("markers" === option && !$.isArray(value)) {
                throw errors.Error("E1022")
            }
            if ("routes" === option && !$.isArray(value)) {
                throw errors.Error("E1023")
            }
        },
        _initContainer: function() {
            this._$container = $("<div />").addClass(MAP_CONTAINER_CLASS);
            this.element().append(this._$container)
        },
        _grabEvents: function() {
            var eventName = eventUtils.addNamespace(pointerEvents.down, this.NAME);
            this.element().on(eventName, $.proxy(this._cancelEvent, this))
        },
        _cancelEvent: function(e) {
            var cancelByProvider = this._provider.cancelEvents && !this.option("disabled");
            if (!config.designMode && cancelByProvider) {
                e.stopPropagation()
            }
        },
        _saveRendered: function(option) {
            var value = this.option(option);
            this._rendered[option] = value.slice()
        },
        _render: function() {
            this.callBase();
            this._renderShield();
            this._saveRendered("markers");
            this._saveRendered("routes");
            this._queueAsyncAction("render", this._rendered.markers, this._rendered.routes)
        },
        _renderShield: function() {
            var $shield;
            if (window.DevExpress && DevExpress.designMode || this.option("disabled")) {
                $shield = $("<div/>").addClass(MAP_SHIELD_CLASS);
                this.element().append($shield)
            } else {
                $shield = this.element().find("." + MAP_SHIELD_CLASS);
                $shield.remove()
            }
        },
        _clean: function() {
            this._cleanFocusState();
            if (!this._provider) {
                return
            }
            var that = this;
            this._queueAsyncAction("clean").done(function() {
                that.setOptionSilent("bounds", {
                    northEast: null,
                    southWest: null
                })
            })
        },
        _dispose: function() {
            this.callBase();
            this._currentAsyncAction && this._currentAsyncAction.reject()
        },
        _optionChanged: function(args) {
            var name = args.name;
            if (this._cancelOptionChange) {
                return
            }
            var changeBag = this._optionChangeBag;
            this._optionChangeBag = null;
            switch (name) {
                case "disabled":
                    this._renderShield();
                    this.callBase(args);
                    break;
                case "width":
                case "height":
                    this.callBase(args);
                    this._dimensionChanged();
                    break;
                case "provider":
                    this._invalidate();
                    break;
                case "key":
                    errors.log("W1001");
                    break;
                case "bounds":
                    this._queueAsyncAction("updateBounds");
                    break;
                case "center":
                    this._queueAsyncAction("updateCenter");
                    break;
                case "zoom":
                    this._queueAsyncAction("updateZoom");
                    break;
                case "type":
                    this._queueAsyncAction("updateMapType");
                    break;
                case "controls":
                    this._queueAsyncAction("updateControls", this._rendered.markers, this._rendered.routes);
                    break;
                case "autoAdjust":
                    this._queueAsyncAction("adjustViewport");
                    break;
                case "markers":
                case "routes":
                    this._checkOption(name);
                    var prevValue = this._rendered[name];
                    this._saveRendered(name);
                    this._queueAsyncAction("update" + inflector.titleize(name), changeBag ? changeBag.removed : prevValue, changeBag ? changeBag.added : this._rendered[name]).done(function() {
                        if (changeBag) {
                            var deferred = changeBag.deferred;
                            deferred.resolve.apply(deferred, arguments)
                        }
                    });
                    break;
                case "markerIconSrc":
                    this._queueAsyncAction("updateMarkers", this._rendered.markers, this._rendered.markers);
                    break;
                case "onReady":
                case "onUpdated":
                case "onMarkerAdded":
                case "onMarkerRemoved":
                case "onRouteAdded":
                case "onRouteRemoved":
                case "onClick":
                    break;
                default:
                    this.callBase.apply(this, arguments)
            }
        },
        _visibilityChanged: function(visible) {
            if (visible) {
                this._dimensionChanged()
            }
        },
        _dimensionChanged: function() {
            this._queueAsyncAction("updateDimensions")
        },
        _queueAsyncAction: function(name) {
            var deferred = $.Deferred(),
                emptyQueue = !this._asyncQueue.length;
            this._asyncQueue.push({
                name: name,
                options: $.makeArray(arguments).slice(1),
                deferred: deferred
            });
            if (emptyQueue) {
                this._enqueueAsyncAction()
            }
            return deferred.promise()
        },
        _enqueueAsyncAction: function() {
            var asyncQueue = this._asyncQueue,
                emptyQueue = !asyncQueue.length;
            if (emptyQueue) {
                return
            }
            var that = this;
            this._execAsyncAction(asyncQueue[0]).done(function() {
                asyncQueue.shift();
                that._enqueueAsyncAction()
            })
        },
        _execAsyncAction: function(action) {
            var deferred = this._currentAsyncAction = $.Deferred();
            var actionName = action.name,
                actionOptions = action.options,
                actionDeferred = action.deferred,
                provider = this._getProvider(actionName);
            provider[actionName].apply(provider, actionOptions).done($.proxy(function(mapRefreshed) {
                if ("rejected" === deferred.state()) {
                    return
                }
                actionDeferred.resolve.apply(actionDeferred, $.makeArray(arguments).slice(1));
                if (mapRefreshed) {
                    this._triggerReadyAction()
                }
                deferred.resolve()
            }, this));
            return deferred.promise()
        },
        _getProvider: function(actionName) {
            var currentProvider = this.option("provider");
            if ("clean" !== actionName && this._usedProvider !== currentProvider) {
                this._provider = new PROVIDERS[currentProvider](this, this._$container);
                this._usedProvider = currentProvider
            }
            return this._provider
        },
        _triggerReadyAction: function() {
            this._createActionByOption("onReady")({
                originalMap: this._provider.map()
            })
        },
        _triggerUpdateAction: function() {
            this._createActionByOption("onUpdated")()
        },
        setOptionSilent: function(name, value) {
            this._cancelOptionChange = true;
            this.option(name, value);
            this._cancelOptionChange = false
        },
        addMarker: function(marker) {
            return this._addFunction("markers", marker)
        },
        removeMarker: function(marker) {
            return this._removeFunction("markers", marker)
        },
        addRoute: function(route) {
            return this._addFunction("routes", route)
        },
        removeRoute: function(route) {
            return this._removeFunction("routes", route)
        },
        _addFunction: function(optionName, addingValue) {
            var optionValue = this.option(optionName),
                addingValues = wrapToArray(addingValue);
            optionValue.push.apply(optionValue, addingValues);
            return this._partialArrayOptionChange(optionName, optionValue, addingValues, [])
        },
        _removeFunction: function(optionName, removingValue) {
            var optionValue = this.option(optionName),
                removingValues = wrapToArray(removingValue);
            $.each(removingValues, function(removingIndex, removingValue) {
                var index = $.isNumeric(removingValue) ? removingValue : $.inArray(removingValue, optionValue);
                if (index !== -1) {
                    var removing = optionValue.splice(index, 1)[0];
                    removingValues.splice(removingIndex, 1, removing)
                } else {
                    throw errors.log("E1021", inflector.titleize(optionName.substring(0, optionName.length - 1)), removingValue)
                }
            });
            return this._partialArrayOptionChange(optionName, optionValue, [], removingValues)
        },
        _partialArrayOptionChange: function(optionName, optionValue, addingValues, removingValues) {
            var deferred = $.Deferred(),
                that = this,
                changeDeferred = $.Deferred();
            this._optionChangeBag = {
                deferred: changeDeferred,
                added: addingValues,
                removed: removingValues
            };
            this.option(optionName, optionValue);
            changeDeferred.done(function(result) {
                deferred.resolveWith(that, result && result.length > 1 ? [result] : result)
            });
            return deferred.promise()
        }
    });
    module.exports = Map
});
