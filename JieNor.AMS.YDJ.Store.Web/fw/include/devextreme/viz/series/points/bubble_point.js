/** 
 * DevExtreme (viz/series/points/bubble_point.js)
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
        symbolPoint = require("./symbol_point"),
        _extend = $.extend,
        MIN_BUBBLE_HEIGHT = 20;
    module.exports = _extend({}, symbolPoint, {
        correctCoordinates: function(diameter) {
            this.bubbleSize = diameter / 2
        },
        _drawMarker: function(renderer, group, animationEnabled) {
            var that = this,
                attr = _extend({
                    translateX: that.x,
                    translateY: that.y
                }, that._getStyle());
            that.graphic = renderer.circle(0, 0, animationEnabled ? 0 : that.bubbleSize).attr(attr).data({
                "chart-data-point": that
            }).append(group)
        },
        getTooltipParams: function(location) {
            var height, that = this,
                graphic = that.graphic;
            if (!graphic) {
                return
            }
            height = graphic.getBBox().height;
            return {
                x: that.x,
                y: height < MIN_BUBBLE_HEIGHT || "edge" === location ? this.y - height / 2 : this.y,
                offset: 0
            }
        },
        _getLabelFormatObject: function() {
            var formatObject = symbolPoint._getLabelFormatObject.call(this);
            formatObject.size = this.initialSize;
            return formatObject
        },
        _updateData: function(data) {
            symbolPoint._updateData.call(this, data);
            this.size = this.initialSize = data.size
        },
        _getGraphicBbox: function() {
            var that = this;
            return that._getSymbolBbox(that.x, that.y, that.bubbleSize)
        },
        _updateMarker: function(animationEnabled, style) {
            var that = this;
            style = style || that._getStyle();
            if (!animationEnabled) {
                style = $.extend({
                    r: that.bubbleSize,
                    translateX: that.x,
                    translateY: that.y
                }, style)
            }
            that.graphic.attr(style)
        },
        _getFormatObject: function(tooltip) {
            var formatObject = symbolPoint._getFormatObject.call(this, tooltip);
            formatObject.sizeText = tooltip.formatValue(this.initialSize);
            return formatObject
        },
        _storeTrackerR: function() {
            return this.bubbleSize
        },
        _getLabelCoords: function(label) {
            var coords;
            if ("inside" === label.getLayoutOptions().position) {
                coords = this._getLabelCoordOfPosition(label, "inside")
            } else {
                coords = symbolPoint._getLabelCoords.call(this, label)
            }
            return coords
        }
    })
});
