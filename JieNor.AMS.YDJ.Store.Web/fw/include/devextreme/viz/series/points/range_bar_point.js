/** 
 * DevExtreme (viz/series/points/range_bar_point.js)
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
        barPoint = require("./bar_point"),
        rangeSymbolPointMethods = require("./range_symbol_point"),
        _extend = $.extend;
    module.exports = _extend({}, barPoint, {
        deleteLabel: rangeSymbolPointMethods.deleteLabel,
        _getFormatObject: rangeSymbolPointMethods._getFormatObject,
        clearVisibility: function() {
            var graphic = this.graphic;
            if (graphic && graphic.attr("visibility")) {
                graphic.attr({
                    visibility: null
                })
            }
            this._topLabel.clearVisibility();
            this._bottomLabel.clearVisibility()
        },
        setInvisibility: function() {
            var graphic = this.graphic;
            if (graphic && "hidden" !== graphic.attr("visibility")) {
                graphic.attr({
                    visibility: "hidden"
                })
            }
            this._topLabel.hide();
            this._bottomLabel.hide()
        },
        getTooltipParams: function(location) {
            var x, y, that = this,
                edgeLocation = "edge" === location;
            if (that._options.rotated) {
                x = edgeLocation ? that.x + that.width : that.x + that.width / 2;
                y = that.y + that.height / 2
            } else {
                x = that.x + that.width / 2;
                y = edgeLocation ? that.y : that.y + that.height / 2
            }
            return {
                x: x,
                y: y,
                offset: 0
            }
        },
        _translate: function(translator) {
            var that = this,
                barMethods = barPoint;
            barMethods._translate.call(that, translator);
            if (that._options.rotated) {
                that.width = that.width || 1
            } else {
                that.height = that.height || 1
            }
        },
        _updateData: rangeSymbolPointMethods._updateData,
        _getLabelPosition: rangeSymbolPointMethods._getLabelPosition,
        _getLabelMinFormatObject: rangeSymbolPointMethods._getLabelMinFormatObject,
        _updateLabelData: rangeSymbolPointMethods._updateLabelData,
        _updateLabelOptions: rangeSymbolPointMethods._updateLabelOptions,
        getCrosshairData: rangeSymbolPointMethods.getCrosshairData,
        _createLabel: rangeSymbolPointMethods._createLabel,
        _checkOverlay: rangeSymbolPointMethods._checkOverlay,
        _checkLabelsOverlay: rangeSymbolPointMethods._checkLabelsOverlay,
        _getOverlayCorrections: rangeSymbolPointMethods._getOverlayCorrections,
        _drawLabel: rangeSymbolPointMethods._drawLabel,
        _getLabelCoords: rangeSymbolPointMethods._getLabelCoords,
        _getGraphicBbox: function(location) {
            var isTop = "top" === location,
                bbox = barPoint._getGraphicBbox.call(this);
            if (!this._options.rotated) {
                bbox.y = isTop ? bbox.y : bbox.y + bbox.height;
                bbox.height = 0
            } else {
                bbox.x = isTop ? bbox.x + bbox.width : bbox.x;
                bbox.width = 0
            }
            return bbox
        },
        getLabel: rangeSymbolPointMethods.getLabel,
        getLabels: rangeSymbolPointMethods.getLabels,
        getBoundingRect: $.noop
    })
});
