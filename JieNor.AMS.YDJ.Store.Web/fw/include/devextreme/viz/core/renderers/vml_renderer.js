/** 
 * DevExtreme (viz/core/renderers/vml_renderer.js)
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
        svgRendererModule = require("./svg_renderer"),
        commonUtils = require("../../../core/utils/common"),
        doc = document,
        math = Math,
        mathMin = math.min,
        mathMax = math.max,
        mathFloor = math.floor,
        mathSin = math.sin,
        mathCos = math.cos,
        isDefined = commonUtils.isDefined,
        _each = $.each,
        _normalizeEnum = require("../utils").normalizeEnum,
        baseElementPrototype = svgRendererModule.SvgElement.prototype,
        documentFragment = doc.createDocumentFragment(),
        STROKEWIDTH = "stroke-width",
        XMLNS = "urn:schemas-microsoft-com:vml",
        DEFAULT_STYLE = {
            behavior: "url(#default#VML)",
            display: "inline-block",
            position: "absolute"
        },
        DEFAULT_ATTRS = {
            xmlns: XMLNS
        },
        INHERITABLE_PROPERTIES = {
            stroke: true,
            fill: true,
            opacity: true,
            "stroke-width": true,
            align: true,
            dashStyle: true,
            "stroke-opacity": true,
            "fill-opacity": true,
            rotate: true,
            rotateX: true,
            rotateY: true
        },
        stub = function() {},
        stubReturnedThis = function() {
            return this
        },
        svgToVmlConv = {
            circle: "oval",
            g: "div",
            path: "shape",
            text: "span"
        },
        FONT_HEIGHT_OFFSET_K = .775,
        DEFAULTS = {
            scaleX: 1,
            scaleY: 1
        },
        pathAttr = svgRendererModule._createPathAttr(vmlAttr),
        arcAttr = svgRendererModule._createArcAttr(vmlAttr, buildArcPath),
        rectAttr = svgRendererModule._createRectAttr(vmlAttr),
        applyEllipsis = svgRendererModule._getEllipsis(prepareLines, setNewText, removeTextSpan);

    function extend(a, b) {
        for (var key in b) {
            a[key] = b[key]
        }
        return a
    }

    function inArray(array, elem) {
        var i = 0;
        for (; i < array.length; i++) {
            if (elem === array[i]) {
                return i
            }
        }
        return -1
    }

    function buildArcPath(x, y, innerR, outerR, startAngleCos, startAngleSin, endAngleCos, endAngleSin, isCircle, longFlag, noArc) {
        var xOuterStart = x + outerR * startAngleCos,
            yOuterStart = y - outerR * startAngleSin,
            xOuterEnd = x + outerR * endAngleCos,
            yOuterEnd = y - outerR * endAngleSin,
            xInnerStart = x + innerR * endAngleCos,
            yInnerStart = y - innerR * endAngleSin,
            xInnerEnd = x + innerR * startAngleCos,
            yInnerEnd = y - innerR * startAngleSin;
        return !noArc ? ["wr", mathFloor(x - innerR), mathFloor(y - innerR), mathFloor(x + innerR), mathFloor(y + innerR), mathFloor(xInnerStart), mathFloor(yInnerStart), mathFloor(xInnerEnd), mathFloor(yInnerEnd), isCircle ? "wr " : "at ", mathFloor(x - outerR), mathFloor(y - outerR), mathFloor(x + outerR), mathFloor(y + outerR), mathFloor(xOuterStart), mathFloor(yOuterStart), mathFloor(xOuterEnd), mathFloor(yOuterEnd), "x e"].join(" ") : "m 0 0 x e"
    }

    function getInheritSettings(settings) {
        var prop, value, result = {};
        for (prop in INHERITABLE_PROPERTIES) {
            value = settings[prop];
            void 0 !== value && (result[prop] = value)
        }
        return result
    }

    function correctBoundingRectWithStrokeWidth(rect, strokeWidth) {
        strokeWidth = Math.ceil(parseInt(strokeWidth) / 2);
        if (strokeWidth && strokeWidth > 1) {
            rect.left -= strokeWidth;
            rect.top -= strokeWidth;
            rect.right += strokeWidth;
            rect.bottom += strokeWidth
        }
        return rect
    }

    function shapeBBox() {
        var i, value, points = (this._settings.d || "").match(/[-0-9]+/g),
            resultRect = {};
        for (i = 0; i < points.length; i++) {
            value = parseInt(points[i]);
            if (i % 2) {
                resultRect.top = void 0 === resultRect.top || value < resultRect.top ? value : resultRect.top;
                resultRect.bottom = void 0 === resultRect.bottom || value > resultRect.bottom ? value : resultRect.bottom
            } else {
                resultRect.left = void 0 === resultRect.left || value < resultRect.left ? value : resultRect.left;
                resultRect.right = void 0 === resultRect.right || value > resultRect.right ? value : resultRect.right
            }
        }
        resultRect.left = resultRect.left || 0;
        resultRect.top = resultRect.top || 0;
        resultRect.right = resultRect.right || 0;
        resultRect.bottom = resultRect.bottom || 0;
        return correctBoundingRectWithStrokeWidth(resultRect, this._fullSettings[STROKEWIDTH])
    }

    function baseAttr(that, attrs, inh) {
        var value, key, appliedAttr, elem, element = that.element,
            settings = that._settings,
            fullSettings = that._fullSettings,
            params = {
                style: {}
            };
        if ("string" === typeof attrs) {
            if (attrs in settings) {
                return settings[attrs]
            }
            if (attrs in DEFAULTS) {
                return DEFAULTS[attrs]
            }
            return 0
        }
        if (attrs && "transparent" === attrs.fill) {
            attrs.fill = "none"
        }
        for (key in attrs) {
            value = attrs[key];
            if (void 0 === value) {
                continue
            }
            appliedAttr = fullSettings[key];
            !inh && (settings[key] = value);
            fullSettings[key] = value;
            if (INHERITABLE_PROPERTIES[key]) {
                value = null === value ? that._parent && that._parent._fullSettings[key] || value : value
            }
            appliedAttr !== value && that.processAttr(element, key, value, params)
        }
        that._applyTransformation(params);
        that.css(params.style);
        for (var i = 0; i < that._children.length; i++) {
            elem = that._children[i];
            elem !== that._clipRect && elem.attr(extend(getInheritSettings(that._fullSettings), elem._settings), true);
            elem._applyStyleSheet()
        }!inh && that._applyStyleSheet();
        if (element) {
            if (element.strokecolor && "none" !== element.strokecolor.value && element.strokeweight) {
                element.stroked = "t"
            } else {
                element.stroked = "f"
            }
        }
        return that
    }

    function vmlAttr(that, attrs, inh) {
        var elem = that.element,
            result = baseAttr(that, attrs, inh);
        for (var i = 0; i < elem.childNodes.length; i++) {
            elem.childNodes[i].xmlns = XMLNS;
            elem.childNodes[i].style.behavior = "url(#default#VML)";
            elem.childNodes[i].style.display = "inline-block"
        }
        return result
    }

    function processVmlAttr(element, attr, value, params) {
        switch (attr) {
            case "stroke":
                value = value || "none";
                attr += "color";
                break;
            case "fill":
                value = value || "none";
                element.filled = "none" === value ? "f" : "t";
                attr += "color";
                break;
            case STROKEWIDTH:
                attr = "strokeweight";
                value += "px";
                break;
            case "stroke-linejoin":
                element.stroke.joinstyle = value;
                return;
            case "stroke-linecap":
                element.stroke.endcap = "butt" === value ? "flat" : value;
                return;
            case "opacity":
                value = adjustOpacityValue(value);
                element.fill.opacity = value;
                element.stroke.opacity = value;
                return;
            case "fill-opacity":
                element.fill.opacity = adjustOpacityValue(value);
                return;
            case "stroke-opacity":
                element.stroke.opacity = adjustOpacityValue(value);
                return;
            case "dashStyle":
                if (null === value) {
                    element.stroke[attr] = ""
                } else {
                    value = _normalizeEnum(value);
                    if ("solid" === value || "none" === value) {
                        value = ""
                    } else {
                        value = value.replace(/longdash/g, "8,3,").replace(/dash/g, "4,3,").replace(/dot/g, "1,3,").replace(/,$/, "")
                    }
                    element.stroke[attr] = value
                }
                return;
            case "d":
                attr = "path";
                value = _normalizeEnum(value).replace("z", "x e").replace(/([.]\d+)/g, "");
                break;
            case "href":
                attr = "src";
                break;
            case "width":
            case "height":
            case "visibility":
                params.style[attr] = value || "";
                return;
            case "class":
                attr += "Name";
                break;
            case "translateX":
            case "translateY":
            case "rotate":
            case "rotateX":
            case "rotateY":
            case "scale":
            case "scaleX":
            case "scaleY":
            case "x":
            case "y":
                return
        }
        element[attr] = value
    }

    function adjustOpacityValue(value) {
        return value >= .002 ? value : null === value ? 1 : .002
    }

    function createElement(tagName) {
        var element = document.createElement(tagName);
        return documentFragment.appendChild(element)
    }
    var VmlElement = function() {
        this.ctor.apply(this, arguments)
    };

    function processAttr(element, attr, value, params) {
        if (!INHERITABLE_PROPERTIES[attr]) {
            if ("visibility" === attr) {
                params.style[attr] = value || ""
            } else {
                if ("width" === attr || "height" === attr) {
                    params.style[attr] = value
                } else {
                    if ("clipId" === attr) {
                        this.applyClipID(value)
                    } else {
                        if ("translateX" === attr || "translateY" === attr || "x" === attr || "y" === attr) {
                            return
                        } else {
                            if ("class" === attr) {
                                element.className = value
                            } else {
                                element[attr] = value
                            }
                        }
                    }
                }
            }
        }
    }

    function prepareLines(element) {
        var lines = [{
                commonLength: 0,
                parts: []
            }],
            lineIndex = 0;
        _each(element.childNodes || [], function(i, text) {
            if ("BR" !== text.nodeName) {
                var length = lines[lineIndex].commonLength,
                    textContent = $(text).text();
                lines[lineIndex].parts.push({
                    span: text,
                    startIndex: length ? length + 1 : 0,
                    endIndex: length + textContent.length
                });
                lines[lineIndex].commonLength += textContent.length
            } else {
                lines.push({
                    commonLength: 0,
                    parts: []
                });
                lineIndex++
            }
        });
        return lines
    }

    function setNewText(text, index) {
        var newText = $(text.span).text().substr(0, index) + "...";
        if ("#text" === text.span.nodeName) {
            text.span.data = newText
        } else {
            text.span.innerHTML = newText
        }
    }

    function removeTextSpan(text) {
        text.span.parentNode.removeChild(text.span)
    }
    var elementMixin = {
        div: {
            processAttr: processAttr,
            attr: function(attrs, inh) {
                return baseAttr(this, attrs, inh)
            },
            _applyTransformation: function(params) {
                var style = params.style,
                    settings = this._settings,
                    fullSettings = this._fullSettings;
                if (fullSettings.rotate) {
                    fullSettings.rotateX = fullSettings.rotateX || 0;
                    fullSettings.rotateY = fullSettings.rotateY || 0
                }
                style.left = (settings.x || 0) + (settings.translateX || 0);
                style.top = (settings.y || 0) + (settings.translateY || 0)
            },
            _getBBox: function() {
                var child, translateX, translateY, childBBox, childSettings, left = 1 / 0,
                    top = 1 / 0,
                    right = -(1 / 0),
                    bottom = -(1 / 0),
                    i = 0,
                    children = this._children;
                if (!children.length) {
                    left = top = bottom = right = 0
                } else {
                    for (; i < children.length; i++) {
                        child = children[i];
                        if (child === this._clipRect) {
                            continue
                        }
                        translateX = child._fullSettings.translateX || 0;
                        translateY = child._fullSettings.translateY || 0;
                        childSettings = child._fullSettings;
                        childBBox = child._getBBox();
                        left = mathMin(left, childBBox.left + translateX);
                        right = mathMax(right, childBBox.right + translateX);
                        top = mathMin(top, childBBox.top + translateY);
                        bottom = mathMax(bottom, childBBox.bottom + translateY)
                    }
                }
                return {
                    left: left,
                    right: right,
                    top: top,
                    bottom: bottom
                }
            },
            defaultAttrs: {},
            defaultStyle: {
                position: "absolute"
            }
        },
        shape: {
            defaultAttrs: extend({
                coordsize: "1,1",
                "stroke-linejoin": "miter"
            }, DEFAULT_ATTRS),
            defaultStyle: extend({
                width: 1,
                height: 1
            }, DEFAULT_STYLE),
            _getBBox: shapeBBox
        },
        image: {
            processAttr: function(element, attr, value, params) {
                if ("fill" === attr || "stroke" === attr) {
                    return
                }
                processVmlAttr(element, attr, value, params)
            }
        },
        oval: {
            processAttr: function(element, attr, value, params) {
                if ("cx" === attr || "cy" === attr) {
                    attr = attr[1]
                } else {
                    if ("r" === attr) {
                        value *= 2;
                        processVmlAttr(element, "width", value, params);
                        attr = "height"
                    } else {
                        if ("x" === attr || "y" === attr) {
                            return
                        }
                    }
                }
                processVmlAttr(element, attr, value, params)
            },
            _getBBox: function() {
                var settings = this._fullSettings,
                    x = settings.cx || 0,
                    y = settings.cy || 0,
                    r = settings.r || 0;
                return correctBoundingRectWithStrokeWidth({
                    left: x - r,
                    top: y - r,
                    right: x + r,
                    bottom: y + r
                }, settings[STROKEWIDTH] || 1)
            }
        },
        span: {
            defaultAttrs: {},
            defaultStyle: {
                position: "absolute",
                whiteSpace: "nowrap"
            },
            processAttr: function(element, attr, value, params) {
                if ("text" === attr) {
                    value = isDefined(value) ? value.toString().replace(/\r/g, "") : "";
                    if (this.renderer.encodeHtml) {
                        value = value.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    }
                    element.innerHTML = value.replace(/\n/g, "<br/>");
                    this.css({
                        filter: ""
                    });
                    this._bbox = null
                } else {
                    processAttr(element, attr, value, params)
                }
            },
            attr: function(attrs, inh) {
                return baseAttr(this, attrs, inh)
            },
            applyEllipsis: applyEllipsis,
            _applyTransformation: function(params) {
                this.element.offsetHeight;
                var radianAngle, that = this,
                    style = params.style,
                    settings = that._fullSettings,
                    x = isDefined(settings.x) ? settings.x : 0,
                    y = isDefined(settings.y) ? settings.y : 0,
                    bbox = that._bbox || that.element.getBoundingClientRect(),
                    textHeight = bbox.bottom - bbox.top,
                    textWidth = bbox.right - bbox.left,
                    rotateAngle = settings.rotate,
                    cos = 1,
                    sin = 0,
                    rotateX = isDefined(settings.rotateX) ? settings.rotateX : x,
                    rotateY = isDefined(settings.rotateY) ? settings.rotateY : y,
                    marginLeft = 0,
                    marginTop = 0,
                    fontHeightOffset = textHeight * FONT_HEIGHT_OFFSET_K,
                    filter = "",
                    alignMultiplier = {
                        center: .5,
                        right: 1
                    }[settings.align],
                    opacity = this._styles.opacity || settings.opacity || settings["fill-opacity"];
                if (textHeight && textWidth) {
                    if (rotateAngle) {
                        radianAngle = rotateAngle * Math.PI / 180;
                        cos = mathCos(radianAngle);
                        sin = mathSin(radianAngle);
                        marginLeft = (x - rotateX) * cos - (y - rotateY) * sin + rotateX - x;
                        marginTop = (x - rotateX) * sin + (y - rotateY) * cos + rotateY - y;
                        filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11 = " + cos.toFixed(5) + ", M12 = " + (-sin).toFixed(5) + ", M21 = " + sin.toFixed(5) + ", M22 = " + cos.toFixed(5) + ")"
                    }
                    if (rotateAngle < 90) {
                        marginTop -= fontHeightOffset * cos;
                        marginLeft -= (textHeight - fontHeightOffset) * sin
                    } else {
                        if (rotateAngle < 180) {
                            marginTop += (textHeight - fontHeightOffset) * cos;
                            marginLeft += textWidth * cos - (textHeight - fontHeightOffset) * sin
                        } else {
                            if (rotateAngle < 270) {
                                marginTop += (textHeight - fontHeightOffset) * cos + textWidth * sin;
                                marginLeft += textWidth * cos + fontHeightOffset * sin
                            } else {
                                marginTop += textWidth * sin - fontHeightOffset * cos;
                                marginLeft += fontHeightOffset * sin
                            }
                        }
                    }
                    if (rotateAngle && this.renderer.rtl) {
                        marginLeft -= textWidth - (textHeight * Math.abs(sin) + textWidth * Math.abs(cos))
                    }
                    if (alignMultiplier) {
                        marginLeft -= textWidth * alignMultiplier * cos;
                        marginTop -= textWidth * alignMultiplier * sin
                    }
                    if (isDefined(opacity)) {
                        filter += " progid:DXImageTransform.Microsoft.Alpha(Opacity=" + 100 * opacity + ")"
                    }
                    x += marginLeft;
                    y += marginTop;
                    this._bbox = bbox;
                    style.filter = (style.filter || "") + filter;
                    style.left = x + (settings.translateX || 0);
                    style.top = y + (settings.translateY || 0)
                }
            },
            _getBBox: function() {
                var element = this.element,
                    settings = this._fullSettings,
                    parentRect = (element.parentNode && element.parentNode.getBoundingClientRect ? element.parentNode : this.renderer.root.element).getBoundingClientRect(),
                    boundingRect = element.getBoundingClientRect(),
                    left = boundingRect.left - (settings.translateX || 0) - parentRect.left,
                    top = boundingRect.top - (settings.translateY || 0) - parentRect.top;
                return {
                    left: left,
                    top: top,
                    right: left + element.offsetWidth,
                    bottom: top + element.offsetHeight
                }
            }
        }
    };
    extend(VmlElement.prototype, baseElementPrototype);
    extend(VmlElement.prototype, {
        defaultStyle: DEFAULT_STYLE,
        defaultAttrs: DEFAULT_ATTRS,
        ctor: function(renderer, tagName, type) {
            var that = this,
                tagPrefix = "<";
            that.renderer = renderer;
            that.type = type || "line";
            that._children = [];
            that._settings = {};
            that._fullSettings = {};
            that._styles = {};
            if ("div" !== tagName && "span" !== tagName) {
                tagPrefix = "<vml:"
            }
            if ("shape" === tagName) {
                if ("arc" === that.type) {
                    that.attr = arcAttr
                } else {
                    that.attr = pathAttr
                }
            } else {
                if ("rect" === tagName) {
                    that.attr = rectAttr
                }
            }
            extend(that, elementMixin[tagName]);
            that.element = createElement(tagPrefix + tagName + "/>");
            that.css(that.defaultStyle).attr(that.defaultAttrs);
            that._$element = $(that.element)
        },
        dispose: function() {
            this.remove();
            this._$element.remove();
            return this
        },
        attr: function(attrs, inh) {
            return vmlAttr(this, attrs, inh)
        },
        processAttr: processVmlAttr,
        css: function(css) {
            var value, appliedValue, key, elem = this.element;
            for (key in css) {
                appliedValue = this._styles[key];
                value = css[key];
                if (!isDefined(value)) {
                    continue
                }
                this._styles[key] = value;
                if (appliedValue === value) {
                    continue
                }
                switch (key) {
                    case "fill":
                        key = "color";
                        break;
                    case "font-size":
                        key = "fontSize";
                        if ("number" === typeof value) {
                            value += "px"
                        }
                        break;
                    case "font-weight":
                        key = "fontWeight";
                        break;
                    case "z-index":
                        key = "zIndex";
                        break;
                    case "opacity":
                        continue
                }
                try {
                    elem.style[key] = value
                } catch (_) {
                    continue
                }
            }
            return this
        },
        applyClipID: function(id) {
            var clipRect, cssValue, renderer = this.renderer;
            clipRect = renderer.getClipRect(id);
            if (clipRect) {
                cssValue = clipRect.getValue();
                clipRect.addElement(this)
            } else {
                cssValue = "rect(-9999px 9999px 9999px -9999px)"
            }
            this._clipRect = this._clipRect || renderer.rect(0, 0, 0, 0).attr({
                "class": "dxc-vml-clip",
                fill: "none",
                opacity: .001
            });
            this._clipRect.attr({
                width: renderer.root.attr("width"),
                height: renderer.root.attr("height")
            });
            this.css({
                clip: cssValue,
                width: renderer.root.attr("width"),
                height: renderer.root.attr("height")
            })
        },
        _onAppended: function(parent) {
            var that = this;
            if (parent._children) {
                that._parent = parent;
                if (inArray(parent._children, that) === -1) {
                    parent._children.push(that)
                }
                that.attr(extend(getInheritSettings(parent._fullSettings), that._settings), true)
            }
            that._applyStyleSheet();
            if (parent._clipRect && that !== parent._clipRect) {
                parent._clipRect.append(parent)
            }
        },
        append: function(parent) {
            baseElementPrototype.append.apply(this, arguments);
            this._onAppended(parent || this.renderer.root);
            return this
        },
        _insert: function(parent) {
            baseElementPrototype._insert.apply(this, arguments);
            this._onAppended(parent)
        },
        _applyTransformation: function(params) {
            var that = this,
                style = params.style,
                element = that.element,
                settings = that._fullSettings,
                x = "arc" !== that.type ? settings.x || settings.cx - settings.r || 0 : 0,
                y = "arc" !== that.type ? settings.y || settings.cy - settings.r || 0 : 0;
            if (settings.rotate) {
                var radianAngle = settings.rotate * Math.PI / 180,
                    rotateX = isDefined(settings.rotateX) ? settings.rotateX : x,
                    rotateY = isDefined(settings.rotateY) ? settings.rotateY : y,
                    rx = x + (settings.width || 0 || parseInt(element.style.width || 0)) / 2,
                    ry = y + (settings.height || 0 || parseInt(element.style.height || 0)) / 2,
                    cos = mathCos(radianAngle),
                    sin = mathSin(radianAngle),
                    marginLeft = (rx - rotateX) * cos - (ry - rotateY) * sin + rotateX - rx,
                    marginTop = (rx - rotateX) * sin + (ry - rotateY) * cos + rotateY - ry;
                x += marginLeft;
                y += marginTop;
                style.rotation = settings.rotate
            }
            style.left = x + (settings.translateX || 0);
            style.top = y + (settings.translateY || 0)
        },
        remove: function() {
            var parent = this._parent;
            parent && parent._children.splice(inArray(parent._children, this), 1);
            this._parent = null;
            return baseElementPrototype.remove.apply(this, arguments)
        },
        clear: function() {
            this._children = [];
            return baseElementPrototype.clear.apply(this, arguments)
        },
        getBBox: function() {
            var clientRect = this._getBBox(),
                x = clientRect.left,
                y = clientRect.top,
                width = clientRect.right - x,
                height = clientRect.bottom - y;
            return {
                x: x,
                y: y,
                width: width,
                height: height,
                isEmpty: !x && !y && !width && !height
            }
        },
        _getBBox: function() {
            var element = this.element,
                settings = this._fullSettings,
                x = settings.x || 0,
                y = settings.y || 0,
                width = parseInt(element.style.width || 0),
                height = parseInt(element.style.height || 0);
            return correctBoundingRectWithStrokeWidth({
                left: x,
                top: y,
                right: x + width,
                bottom: y + height
            }, settings[STROKEWIDTH] || 1)
        },
        _applyStyleSheet: function() {
            if (this._useCSSTheme) {
                this.attr(getInheritSettings(this.element.currentStyle), true)
            }
        },
        setTitle: function(text) {
            this.element.setAttribute("title", text)
        }
    });
    var ClipRect = function() {
        this.ctor.apply(this, arguments)
    };
    extend(ClipRect.prototype, VmlElement.prototype);
    extend(ClipRect.prototype, {
        ctor: function(renderer, id) {
            this._settings = this._fullSettings = {};
            this.renderer = renderer;
            this._children = [];
            this._elements = [];
            this.id = id
        },
        attr: function(attrs, inh) {
            var element, i, result = baseAttr(this, attrs, inh),
                elements = this._elements.slice();
            if (result === this) {
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    if (element._fullSettings.clipId === this.id) {
                        elements[i].applyClipID(this.id)
                    } else {
                        this.removeElement(element)
                    }
                }
            }
            return result
        },
        processAttr: stub,
        _applyTransformation: stub,
        append: stubReturnedThis,
        dispose: function() {
            this._elements = null;
            this.renderer.removeClipRect(this.id);
            return this
        },
        addElement: function(element) {
            var elements = this._elements;
            if (inArray(elements, element) === -1) {
                elements.push(element)
            }
        },
        removeElement: function(element) {
            var index = inArray(this._elements, element);
            index > -1 && this._elements.splice(index, 1)
        },
        getValue: function() {
            var settings = this._settings,
                left = (settings.x || 0) + (settings.translateX || 0),
                top = (settings.y || 0) + (settings.translateY || 0);
            return "rect(" + top + "px, " + (left + (settings.width || 0)) + "px, " + (top + (settings.height || 0)) + "px, " + left + "px)"
        },
        css: stubReturnedThis,
        remove: stubReturnedThis
    });

    function VmlRenderer() {
        svgRendererModule.SvgRenderer.apply(this, arguments)
    }
    extend(VmlRenderer.prototype, svgRendererModule.SvgRenderer.prototype);
    extend(VmlRenderer.prototype, {
        constructor: VmlRenderer,
        _rootTag: "div",
        _rootAttr: {
            fill: "none",
            stroke: "none",
            "stroke-width": 0
        },
        _rootCss: {
            position: "relative",
            display: "inline-block",
            overflow: "hidden"
        },
        _init: function() {
            this._clipRects = [];
            this._animationController = {
                dispose: stubReturnedThis
            };
            this._animation = {
                enabled: false
            };
            this._defs = {
                clear: stubReturnedThis,
                remove: stubReturnedThis,
                append: stubReturnedThis,
                dispose: stubReturnedThis
            }
        },
        setOptions: function() {
            svgRendererModule.SvgRenderer.prototype.setOptions.apply(this, arguments);
            this.root.css({
                direction: this.rtl ? "rtl" : "ltr"
            });
            return this
        },
        _createElement: function(tagName, attr, type) {
            tagName = svgToVmlConv[tagName] || tagName;
            var elem = new exports.VmlElement(this, tagName, type);
            attr && elem.attr(attr);
            return elem
        },
        shadowFilter: function() {
            return {
                ref: null,
                append: stubReturnedThis,
                dispose: stubReturnedThis,
                attr: stubReturnedThis,
                css: stubReturnedThis
            }
        },
        clipRect: function(x, y, width, height) {
            var clipRects = this._clipRects,
                id = clipRects.length,
                clipRect = new ClipRect(this, id).attr({
                    x: x || 0,
                    y: y || 0,
                    width: width || 0,
                    height: height || 0
                });
            clipRects.push(clipRect);
            return clipRect
        },
        getClipRect: function(id) {
            return this._clipRects[id]
        },
        removeClipRect: function(id) {
            delete this._clipRects[id]
        },
        pattern: function(color) {
            return {
                id: color,
                append: stubReturnedThis,
                remove: stubReturnedThis,
                dispose: stubReturnedThis
            }
        },
        image: function(x, y, w, h, href, location) {
            var image = this._createElement("image", {
                x: x || 0,
                y: y || 0,
                width: w || 0,
                height: h || 0,
                location: location,
                href: href
            });
            return image
        },
        rect: function(x, y, width, height) {
            return this._createElement("rect", {
                x: x || 0,
                y: y || 0,
                width: width || 0,
                height: height || 0
            })
        },
        path: function(points, type) {
            return this._createElement("path", {
                points: points || []
            }, type)
        },
        arc: function(x, y, innerRadius, outerRadius, startAngle, endAngle) {
            return this._createElement("path", {
                x: x || 0,
                y: y || 0,
                innerRadius: innerRadius || 0,
                outerRadius: outerRadius || 0,
                startAngle: startAngle || 0,
                endAngle: endAngle || 0
            }, "arc")
        },
        text: function(text, x, y) {
            return this._createElement("text", {
                text: text,
                x: x || 0,
                y: y || 0
            })
        },
        updateAnimationOptions: stubReturnedThis,
        stopAllAnimations: stubReturnedThis,
        svg: function() {
            return ""
        },
        onEndAnimation: function(callback) {
            callback()
        }
    });
    exports.VmlRenderer = VmlRenderer;
    exports.VmlElement = VmlElement
});
