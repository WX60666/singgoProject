/** 
 * DevExtreme (ui/popover.js)
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
        registerComponent = require("../core/component_registrator"),
        stringUtils = require("../core/utils/string"),
        translator = require("../animation/translator"),
        positionUtils = require("../animation/position"),
        commonUtils = require("../core/utils/common"),
        mathUtils = require("../core/utils/math"),
        Popup = require("./popup");
    var POPOVER_CLASS = "dx-popover",
        POPOVER_WRAPPER_CLASS = "dx-popover-wrapper",
        POPOVER_ARROW_CLASS = "dx-popover-arrow",
        POPOVER_WITHOUT_TITLE_CLASS = "dx-popover-without-title",
        POSITION_FLIP_MAP = {
            left: "right",
            top: "bottom",
            right: "left",
            bottom: "top",
            center: "center"
        },
        WEIGHT_OF_SIDES = {
            left: -1,
            top: -1,
            center: 0,
            right: 1,
            bottom: 1
        },
        POSITION_ALIASES = {
            top: {
                my: "bottom center",
                at: "top center",
                collision: "fit flip"
            },
            bottom: {
                my: "top center",
                at: "bottom center",
                collision: "fit flip"
            },
            right: {
                my: "left center",
                at: "right center",
                collision: "flip fit"
            },
            left: {
                my: "right center",
                at: "left center",
                collision: "flip fit"
            }
        };
    var Popover = Popup.inherit({
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                target: window,
                shading: false,
                position: "bottom",
                closeOnOutsideClick: true,
                animation: {
                    show: {
                        type: "fade",
                        from: 0,
                        to: 1
                    },
                    hide: {
                        type: "fade",
                        to: 0
                    }
                },
                showTitle: false,
                width: "auto",
                height: "auto",
                dragEnabled: false,
                resizeEnabled: false,
                fullScreen: false,
                closeOnTargetScroll: true,
                arrowPosition: "",
                arrowOffset: 0,
                boundaryOffset: {
                    h: 10,
                    v: 10
                }
            })
        },
        _defaultOptionsRules: function() {
            return [{
                device: {
                    platform: "ios"
                },
                options: {
                    arrowPosition: {
                        boundaryOffset: {
                            h: 20,
                            v: -10
                        },
                        collision: "fit"
                    }
                }
            }]
        },
        _init: function() {
            this.callBase();
            this._renderArrow();
            this.element().addClass(POPOVER_CLASS);
            this._wrapper().addClass(POPOVER_WRAPPER_CLASS)
        },
        _renderArrow: function() {
            this._$arrow = $("<div>").addClass(POPOVER_ARROW_CLASS).prependTo(this.overlayContent())
        },
        _documentDownHandler: function(e) {
            if (this._isOutsideClick(e)) {
                return this.callBase(e)
            }
        },
        _isOutsideClick: function(e) {
            return !$(e.target).closest(this.option("target")).length
        },
        _animate: function(animation) {
            if (animation && animation.to) {
                $.extend(animation.to, {
                    position: this._getContainerPosition()
                })
            }
            this.callBase.apply(this, arguments)
        },
        _stopAnimation: function() {
            this.callBase.apply(this, arguments)
        },
        _renderTitle: function() {
            this._wrapper().toggleClass(POPOVER_WITHOUT_TITLE_CLASS, !this.option("showTitle"));
            this.callBase()
        },
        _renderPosition: function() {
            this.callBase();
            this._renderOverlayPosition()
        },
        _renderOverlayBoundaryOffset: $.noop,
        _renderOverlayPosition: function() {
            this._resetOverlayPosition();
            this._updateContentSize();
            var contentPosition = this._getContainerPosition();
            var resultLocation = positionUtils.setup(this._$content, contentPosition);
            var positionSide = this._getSideByLocation(resultLocation);
            this._togglePositionClass("dx-position-" + positionSide);
            this._toggleFlippedClass(resultLocation.h.flip, resultLocation.v.flip);
            this._renderArrowPosition(positionSide)
        },
        _resetOverlayPosition: function() {
            this._setContentHeight(true);
            this._togglePositionClass("dx-position-" + this._positionSide);
            translator.move(this._$content, {
                left: 0,
                top: 0
            });
            this._$arrow.css({
                top: "auto",
                right: "auto",
                bottom: "auto",
                left: "auto"
            })
        },
        _updateContentSize: function() {
            if (!this._$popupContent) {
                return
            }
            var containerLocation = positionUtils.calculate(this._$content, this._getContainerPosition());
            if (containerLocation.h.oversize > 0 && this._isHorizontalSide() && !containerLocation.h.fit) {
                var newContainerWidth = this._$content.width() - containerLocation.h.oversize;
                this._$content.width(newContainerWidth)
            }
            if (containerLocation.v.oversize > 0 && this._isVerticalSide() && !containerLocation.v.fit) {
                var newOverlayContentHeight = this._$content.height() - containerLocation.v.oversize,
                    newPopupContentHeight = this._$popupContent.height() - containerLocation.v.oversize;
                this._$content.height(newOverlayContentHeight);
                this._$popupContent.height(newPopupContentHeight)
            }
        },
        _getContainerPosition: function() {
            var offset = stringUtils.pairToObject(this._position.offset || "");
            var hOffset = offset.h;
            var vOffset = offset.v;
            var isPopoverInside = this._isPopoverInside();
            var sign = (isPopoverInside ? -1 : 1) * WEIGHT_OF_SIDES[this._positionSide];
            var arrowSizeCorrection = this._getContentBorderWidth(this._positionSide);
            if (this._isVerticalSide()) {
                vOffset += sign * (this._$arrow.height() - arrowSizeCorrection)
            } else {
                if (this._isHorizontalSide()) {
                    hOffset += sign * (this._$arrow.width() - arrowSizeCorrection)
                }
            }
            return $.extend({}, this._position, {
                offset: hOffset + " " + vOffset
            })
        },
        _getContentBorderWidth: function(side) {
            var borderWidth = this._$content.css("border-" + side + "-width");
            return parseInt(borderWidth) || 0
        },
        _getSideByLocation: function(location) {
            var isFlippedByVertical = location.v.flip;
            var isFlippedByHorizontal = location.h.flip;
            return this._isVerticalSide() && isFlippedByVertical || this._isHorizontalSide() && isFlippedByHorizontal || this._isPopoverInside() ? POSITION_FLIP_MAP[this._positionSide] : this._positionSide
        },
        _togglePositionClass: function(positionClass) {
            this._$wrapper.removeClass("dx-position-left dx-position-right dx-position-top dx-position-bottom").addClass(positionClass)
        },
        _toggleFlippedClass: function(isFlippedHorizontal, isFlippedVertical) {
            this._$wrapper.toggleClass("dx-popover-flipped-horizontal", isFlippedHorizontal).toggleClass("dx-popover-flipped-vertical", isFlippedVertical)
        },
        _renderArrowPosition: function(side) {
            this._$arrow.css(POSITION_FLIP_MAP[side], -(this._isVerticalSide(side) ? this._$arrow.height() : this._$arrow.width()));
            var axis = this._isVerticalSide(side) ? "left" : "top";
            var sizeProperty = this._isVerticalSide(side) ? "outerWidth" : "outerHeight";
            var $target = $(this._position.of);
            var targetOffset = $target.offset() || {
                top: 0,
                left: 0
            };
            var contentOffset = this._$content.offset();
            var arrowSize = this._$arrow[sizeProperty]();
            var contentLocation = contentOffset[axis];
            var contentSize = this._$content[sizeProperty]();
            var targetLocation = targetOffset[axis];
            var targetSize = $target.get(0).preventDefault ? 0 : $target[sizeProperty]();
            var min = Math.max(contentLocation, targetLocation);
            var max = Math.min(contentLocation + contentSize, targetLocation + targetSize);
            var arrowLocation;
            if ("start" === this.option("arrowPosition")) {
                arrowLocation = min - contentLocation
            } else {
                if ("end" === this.option("arrowPosition")) {
                    arrowLocation = max - contentLocation - arrowSize
                } else {
                    arrowLocation = (min + max) / 2 - contentLocation - arrowSize / 2
                }
            }
            var borderWidth = this._getContentBorderWidth(side);
            var finalArrowLocation = mathUtils.fitIntoRange(arrowLocation - borderWidth + this.option("arrowOffset"), borderWidth, contentSize - arrowSize - 2 * borderWidth);
            this._$arrow.css(axis, finalArrowLocation)
        },
        _isPopoverInside: function() {
            var position = this._getPosition();
            var my = positionUtils.setup.normalizeAlign(position.my);
            var at = positionUtils.setup.normalizeAlign(position.at);
            return my.h === at.h && my.v === at.v
        },
        _getPosition: function() {
            var position = this.option("position");
            if (commonUtils.isString(position)) {
                position = $.extend({}, POSITION_ALIASES[position])
            }
            return position
        },
        _setContentHeight: function(fullUpdate) {
            if (fullUpdate) {
                this.callBase()
            }
        },
        _renderShadingPosition: function() {
            if (this.option("shading")) {
                this._$wrapper.css({
                    top: 0,
                    left: 0
                })
            }
        },
        _renderShadingDimensions: function() {
            if (this.option("shading")) {
                this._$wrapper.css({
                    width: "100%",
                    height: "100%"
                })
            }
        },
        _normalizePosition: function() {
            var position = $.extend({}, this._getPosition());
            if (!position.of) {
                position.of = this.option("target")
            }
            if (!position.collision) {
                position.collision = "flip"
            }
            if (!position.boundaryOffset) {
                position.boundaryOffset = this.option("boundaryOffset")
            }
            this._positionSide = this._getDisplaySide(position);
            this._position = position
        },
        _getDisplaySide: function(position) {
            var my = positionUtils.setup.normalizeAlign(position.my),
                at = positionUtils.setup.normalizeAlign(position.at);
            var weightSign = WEIGHT_OF_SIDES[my.h] === WEIGHT_OF_SIDES[at.h] && WEIGHT_OF_SIDES[my.v] === WEIGHT_OF_SIDES[at.v] ? -1 : 1,
                horizontalWeight = Math.abs(WEIGHT_OF_SIDES[my.h] - weightSign * WEIGHT_OF_SIDES[at.h]),
                verticalWeight = Math.abs(WEIGHT_OF_SIDES[my.v] - weightSign * WEIGHT_OF_SIDES[at.v]);
            return horizontalWeight > verticalWeight ? at.h : at.v
        },
        _isVerticalSide: function(side) {
            side = side || this._positionSide;
            return "top" === side || "bottom" === side
        },
        _isHorizontalSide: function(side) {
            side = side || this._positionSide;
            return "left" === side || "right" === side
        },
        _optionChanged: function(args) {
            switch (args.name) {
                case "showTitle":
                case "title":
                case "titleTemplate":
                    this.callBase(args);
                    this._renderGeometry();
                    break;
                case "target":
                case "boundaryOffset":
                case "arrowPosition":
                case "arrowOffset":
                    this._renderGeometry();
                    break;
                case "fullScreen":
                    if (args.value) {
                        this.option("fullScreen", false)
                    }
                    break;
                default:
                    this.callBase(args)
            }
        },
        show: function(target) {
            if (target) {
                this.option("target", target)
            }
            return this.callBase()
        }
    });
    registerComponent("dxPopover", Popover);
    module.exports = Popover
});
