/** 
 * DevExtreme (viz/core/layout_element.js)
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
        _round = Math.round,
        objectUtils = require("../../core/utils/object"),
        defaultOffset = {
            horizontal: 0,
            vertical: 0
        },
        alignFactors = {
            center: .5,
            right: 1,
            bottom: 1,
            left: 0,
            top: 0
        };

    function LayoutElement(options) {
        this._options = options
    }
    LayoutElement.prototype = {
        constructor: LayoutElement,
        position: function(options) {
            var that = this,
                ofBBox = options.of.getLayoutOptions(),
                myBBox = that.getLayoutOptions(),
                at = options.at,
                my = options.my,
                offset = options.offset || defaultOffset,
                shiftX = -alignFactors[my.horizontal] * myBBox.width + ofBBox.x + alignFactors[at.horizontal] * ofBBox.width + parseInt(offset.horizontal),
                shiftY = -alignFactors[my.vertical] * myBBox.height + ofBBox.y + alignFactors[at.vertical] * ofBBox.height + parseInt(offset.vertical);
            that.shift(_round(shiftX), _round(shiftY))
        },
        getLayoutOptions: $.noop,
        getVerticalCuttedSize: function(canvas) {
            var that = this,
                height = canvas.height,
                top = canvas.top,
                bottom = canvas.bottom,
                layoutOptions = that.getLayoutOptions();
            if (layoutOptions) {
                that.draw(canvas.width, canvas.height);
                layoutOptions = that.getLayoutOptions();
                if (layoutOptions) {
                    height -= layoutOptions.height;
                    if ("bottom" === layoutOptions.position.vertical) {
                        bottom += layoutOptions.height
                    } else {
                        top += layoutOptions.height
                    }
                }
            }
            return {
                left: canvas.left,
                right: canvas.right,
                top: top,
                bottom: bottom,
                width: canvas.width,
                height: height
            }
        }
    };

    function WrapperLayoutElement(renderElement, bbox) {
        this._renderElement = renderElement;
        this._cacheBBox = bbox
    }
    var wrapperLayoutElementPrototype = WrapperLayoutElement.prototype = objectUtils.clone(LayoutElement.prototype);
    wrapperLayoutElementPrototype.constructor = WrapperLayoutElement;
    wrapperLayoutElementPrototype.getLayoutOptions = function() {
        return this._cacheBBox || this._renderElement.getBBox()
    };
    wrapperLayoutElementPrototype.shift = function(shiftX, shiftY) {
        var bbox = this.getLayoutOptions();
        this._renderElement.move(_round(shiftX - bbox.x), _round(shiftY - bbox.y))
    };
    exports.LayoutElement = LayoutElement;
    exports.WrapperLayoutElement = WrapperLayoutElement
});
