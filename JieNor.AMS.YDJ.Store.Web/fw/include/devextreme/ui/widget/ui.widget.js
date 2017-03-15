/** 
 * DevExtreme (ui/widget/ui.widget.js)
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
        errors = require("./ui.errors"),
        Action = require("../../core/action"),
        commonUtils = require("../../core/utils/common"),
        domUtils = require("../../core/utils/dom"),
        devices = require("../../core/devices"),
        DOMComponent = require("../../core/dom_component"),
        TemplateBase = require("./ui.template_base"),
        DynamicTemplate = require("./ui.template.dynamic"),
        EmptyTemplate = require("./ui.template.empty"),
        MoveTemplate = require("./ui.template.move"),
        TemplateProvider = require("./jquery.template_provider"),
        KeyboardProcessor = require("./ui.keyboard_processor"),
        selectors = require("./jquery.selectors"),
        eventUtils = require("../../events/utils"),
        hoverEvents = require("../../events/hover"),
        feedbackEvents = require("../../events/core/emitter.feedback"),
        clickEvent = require("../../events/click");
    var UI_FEEDBACK = "UIFeedback",
        WIDGET_CLASS = "dx-widget",
        ACTIVE_STATE_CLASS = "dx-state-active",
        DISABLED_STATE_CLASS = "dx-state-disabled",
        INVISIBLE_STATE_CLASS = "dx-state-invisible",
        HOVER_STATE_CLASS = "dx-state-hover",
        FOCUSED_STATE_CLASS = "dx-state-focused",
        FEEDBACK_SHOW_TIMEOUT = 30,
        FEEDBACK_HIDE_TIMEOUT = 400,
        FOCUS_NAMESPACE = "Focus",
        ANONYMOUS_TEMPLATE_NAME = "template",
        TEXT_NODE = 3,
        TEMPLATE_SELECTOR = "[data-options*='dxTemplate']",
        TEMPLATE_WRAPPER_CLASS = "dx-template-wrapper";
    var beforeActivateExists = void 0 !== document.onbeforeactivate;
    var Widget = DOMComponent.inherit({
        _supportedKeys: function() {
            return {}
        },
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                disabled: false,
                visible: true,
                hint: void 0,
                activeStateEnabled: false,
                onContentReady: null,
                hoverStateEnabled: false,
                focusStateEnabled: false,
                tabIndex: 0,
                accessKey: null,
                onFocusIn: null,
                onFocusOut: null,
                watchMethod: $.noop,
                _keyboardProcessor: void 0,
                templateProvider: TemplateProvider,
                _templates: {}
            })
        },
        _feedbackShowTimeout: FEEDBACK_SHOW_TIMEOUT,
        _feedbackHideTimeout: FEEDBACK_HIDE_TIMEOUT,
        _init: function() {
            this.callBase();
            this._tempTemplates = [];
            this._dynamicTemplates = {};
            this._initTemplates();
            this._initContentReadyAction()
        },
        _initTemplates: function() {
            this._extractTemplates();
            this._extractAnonymousTemplate()
        },
        _extractTemplates: function() {
            var templates = this.option("_templates"),
                templateElements = this.element().contents().filter(TEMPLATE_SELECTOR);
            var templatesMap = {};
            templateElements.each(function(_, template) {
                var templateOptions = domUtils.getElementOptions(template).dxTemplate;
                if (!templateOptions) {
                    return
                }
                if (!templateOptions.name) {
                    throw errors.Error("E0023")
                }
                $(template).addClass(TEMPLATE_WRAPPER_CLASS).detach();
                templatesMap[templateOptions.name] = templatesMap[templateOptions.name] || [];
                templatesMap[templateOptions.name].push(template)
            });
            $.each(templatesMap, $.proxy(function(templateName, value) {
                var deviceTemplate = this._findTemplateByDevice(value);
                if (deviceTemplate) {
                    templates[templateName] = this._createTemplate(deviceTemplate, this)
                }
            }, this))
        },
        _findTemplateByDevice: function(templates) {
            var suitableTemplate = commonUtils.findBestMatches(devices.current(), templates, function(template) {
                return domUtils.getElementOptions(template).dxTemplate
            })[0];
            $.each(templates, function(index, template) {
                if (template !== suitableTemplate) {
                    $(template).remove()
                }
            });
            return suitableTemplate
        },
        _extractAnonymousTemplate: function() {
            var templates = this.option("_templates"),
                anonymousTemplateName = this._getAnonymousTemplateName(),
                $anonymousTemplate = this.element().contents().detach();
            var $notJunkTemplateContent = $anonymousTemplate.filter(function(_, element) {
                    var isTextNode = element.nodeType === TEXT_NODE,
                        isEmptyText = $.trim($(element).text()).length < 1;
                    return !(isTextNode && isEmptyText)
                }),
                onlyJunkTemplateContent = $notJunkTemplateContent.length < 1;
            if (!templates[anonymousTemplateName] && !onlyJunkTemplateContent) {
                templates[anonymousTemplateName] = this._createTemplate($anonymousTemplate, this)
            }
        },
        _getAriaTarget: function() {
            return this._focusTarget()
        },
        _getAnonymousTemplateName: function() {
            return ANONYMOUS_TEMPLATE_NAME
        },
        _getTemplateByOption: function(optionName) {
            return this._getTemplate(this.option(optionName))
        },
        _getTemplate: function(templateSource) {
            if ($.isFunction(templateSource)) {
                var that = this;
                return new DynamicTemplate(function(options) {
                    var args = [];
                    if ("model" in options) {
                        args.push(options.model)
                    }
                    if ("index" in options) {
                        args.push(options.index)
                    }
                    args.push(options.container);
                    var templateSourceResult = templateSource.apply(that, args);
                    if (commonUtils.isDefined(templateSourceResult)) {
                        return that._acquireTemplate(templateSourceResult, this, true)
                    } else {
                        return new EmptyTemplate
                    }
                }, this)
            }
            return this._acquireTemplate(templateSource, this)
        },
        _acquireTemplate: function(templateSource, owner, preferRenderer) {
            if (null == templateSource) {
                return this._createTemplate(domUtils.normalizeTemplateElement(templateSource), owner)
            }
            if (templateSource instanceof TemplateBase || commonUtils.isFunction(templateSource.render)) {
                return templateSource
            }
            if (templateSource.nodeType || templateSource.jquery) {
                templateSource = $(templateSource);
                if (preferRenderer && !templateSource.is("script")) {
                    return new MoveTemplate(templateSource, owner)
                }
                return this._createTemplate(templateSource, owner)
            }
            if ("string" === typeof templateSource) {
                var userTemplate = this.option("_templates")[templateSource];
                if (userTemplate) {
                    return userTemplate
                }
                var dynamicTemplate = this._dynamicTemplates[templateSource];
                if (dynamicTemplate) {
                    return dynamicTemplate
                }
                var defaultTemplate = this.option("templateProvider").getTemplates(this)[templateSource];
                if (defaultTemplate) {
                    return defaultTemplate
                }
                return this._createTemplate(domUtils.normalizeTemplateElement(templateSource), owner)
            }
            return this._acquireTemplate(templateSource.toString(), owner)
        },
        _createTemplate: function(element, owner) {
            var template = this.option("templateProvider").createTemplate(element, owner);
            this._tempTemplates.push(template);
            return template
        },
        _cleanTemplates: function() {
            var that = this;
            $.each(this.option("_templates"), function(_, template) {
                if (that === template.owner()) {
                    template.dispose()
                }
            });
            $.each(this._tempTemplates, function(_, template) {
                template.dispose()
            })
        },
        _initContentReadyAction: function() {
            this._contentReadyAction = this._createActionByOption("onContentReady", {
                excludeValidators: ["designMode", "disabled", "readOnly"]
            })
        },
        _render: function() {
            this.element().addClass(WIDGET_CLASS);
            this.callBase();
            this._toggleDisabledState(this.option("disabled"));
            this._toggleVisibility(this.option("visible"));
            this._renderHint();
            this._renderContent();
            this._renderFocusState();
            this._attachFeedbackEvents();
            this._attachHoverEvents()
        },
        _renderHint: function() {
            domUtils.toggleAttr(this.element(), "title", this.option("hint"))
        },
        _renderContent: function() {
            var that = this;
            commonUtils.deferRender(function() {
                that._renderContentImpl()
            });
            that._fireContentReadyAction()
        },
        _renderContentImpl: $.noop,
        _fireContentReadyAction: function() {
            this._contentReadyAction()
        },
        _dispose: function() {
            this._cleanTemplates();
            this._contentReadyAction = null;
            this.callBase()
        },
        _clean: function() {
            this._cleanFocusState();
            this.callBase();
            this.element().empty()
        },
        _toggleVisibility: function(visible) {
            this.element().toggleClass(INVISIBLE_STATE_CLASS, !visible);
            this.setAria("hidden", !visible || void 0)
        },
        _renderFocusState: function() {
            if (!this.option("focusStateEnabled") || this.option("disabled")) {
                return
            }
            this._renderFocusTarget();
            this._attachFocusEvents();
            this._attachKeyboardEvents();
            this._renderAccessKey()
        },
        _renderAccessKey: function() {
            var focusTarget = this._focusTarget();
            focusTarget.attr("accesskey", this.option("accessKey"));
            var clickNamespace = eventUtils.addNamespace(clickEvent.name, UI_FEEDBACK);
            focusTarget.off(clickNamespace);
            this.option("accessKey") && focusTarget.on(clickNamespace, $.proxy(function(e) {
                if (eventUtils.isFakeClickEvent(e)) {
                    e.stopImmediatePropagation();
                    this.focus()
                }
            }, this))
        },
        _eventBindingTarget: function() {
            return this.element()
        },
        _focusTarget: function() {
            return this._getActiveElement()
        },
        _getActiveElement: function() {
            var activeElement = this._eventBindingTarget();
            if (this._activeStateUnit) {
                activeElement = activeElement.find(this._activeStateUnit).not("." + DISABLED_STATE_CLASS)
            }
            return activeElement
        },
        _renderFocusTarget: function() {
            this._focusTarget().attr("tabindex", this.option("tabIndex"))
        },
        _keyboardEventBindingTarget: function() {
            return this._eventBindingTarget()
        },
        _detachFocusEvents: function() {
            var $element = this._focusTarget(),
                namespace = this.NAME + FOCUS_NAMESPACE,
                focusEvents = eventUtils.addNamespace("focusin", namespace);
            focusEvents = focusEvents + " " + eventUtils.addNamespace("focusout", namespace);
            if (beforeActivateExists) {
                focusEvents = focusEvents + " " + eventUtils.addNamespace("beforeactivate", namespace)
            }
            $element.off(focusEvents)
        },
        _attachFocusEvents: function() {
            var namespace = this.NAME + FOCUS_NAMESPACE,
                focusInEvent = eventUtils.addNamespace("focusin", namespace),
                focusOutEvent = eventUtils.addNamespace("focusout", namespace);
            this._focusTarget().on(focusInEvent, $.proxy(this._focusInHandler, this)).on(focusOutEvent, $.proxy(this._focusOutHandler, this));
            if (beforeActivateExists) {
                var beforeactivateEvent = eventUtils.addNamespace("beforeactivate", namespace);
                this._focusTarget().on(beforeactivateEvent, function(e) {
                    if (!$(e.target).is(selectors.focusable)) {
                        e.preventDefault()
                    }
                })
            }
        },
        _refreshFocusEvent: function() {
            this._detachFocusEvents();
            this._attachFocusEvents()
        },
        _focusInHandler: function(e) {
            var that = this;
            that._createActionByOption("onFocusIn", {
                beforeExecute: function() {
                    that._updateFocusState(e, true)
                },
                excludeValidators: ["readOnly"]
            })({
                jQueryEvent: e
            })
        },
        _focusOutHandler: function(e) {
            var that = this;
            that._createActionByOption("onFocusOut", {
                beforeExecute: function() {
                    that._updateFocusState(e, false)
                },
                excludeValidators: ["readOnly", "disabled"]
            })({
                jQueryEvent: e
            })
        },
        _updateFocusState: function(e, isFocused) {
            var target = e.target;
            if ($.inArray(target, this._focusTarget()) !== -1) {
                this._toggleFocusClass(isFocused, $(target))
            }
        },
        _toggleFocusClass: function(isFocused, $element) {
            var $focusTarget = $element && $element.length ? $element : this._focusTarget();
            $focusTarget.toggleClass(FOCUSED_STATE_CLASS, isFocused)
        },
        _hasFocusClass: function(element) {
            var $focusTarget = $(element || this._focusTarget());
            return $focusTarget.hasClass(FOCUSED_STATE_CLASS)
        },
        _attachKeyboardEvents: function() {
            var processor = this.option("_keyboardProcessor") || new KeyboardProcessor({
                element: this._keyboardEventBindingTarget(),
                focusTarget: this._focusTarget()
            });
            this._keyboardProcessor = processor.reinitialize(this._keyboardHandler, this)
        },
        _keyboardHandler: function(options) {
            var e = options.originalEvent,
                key = options.key;
            var keys = this._supportedKeys(),
                func = keys[key];
            if (void 0 !== func) {
                var handler = $.proxy(func, this);
                return handler(e) || false
            } else {
                return true
            }
        },
        _refreshFocusState: function() {
            this._cleanFocusState();
            this._renderFocusState()
        },
        _cleanFocusState: function() {
            var $element = this._focusTarget();
            this._detachFocusEvents();
            this._toggleFocusClass(false);
            $element.removeAttr("tabindex");
            if (this._keyboardProcessor) {
                this._keyboardProcessor.dispose()
            }
        },
        _attachHoverEvents: function() {
            var that = this,
                hoverableSelector = that._activeStateUnit,
                nameStart = eventUtils.addNamespace(hoverEvents.start, UI_FEEDBACK),
                nameEnd = eventUtils.addNamespace(hoverEvents.end, UI_FEEDBACK);
            that._eventBindingTarget().off(nameStart, hoverableSelector).off(nameEnd, hoverableSelector);
            if (that.option("hoverStateEnabled")) {
                var startAction = new Action(function(args) {
                    that._hoverStartHandler(args.event);
                    var $target = args.element;
                    that._refreshHoveredElement($target)
                }, {
                    excludeValidators: ["readOnly"]
                });
                that._eventBindingTarget().on(nameStart, hoverableSelector, function(e) {
                    startAction.execute({
                        element: $(e.target),
                        event: e
                    })
                }).on(nameEnd, hoverableSelector, function(e) {
                    that._hoverEndHandler(e);
                    that._forgetHoveredElement()
                })
            } else {
                that._toggleHoverClass(false)
            }
        },
        _hoverStartHandler: $.noop,
        _hoverEndHandler: $.noop,
        _attachFeedbackEvents: function() {
            var feedbackAction, feedbackActionDisabled, that = this,
                feedbackSelector = that._activeStateUnit,
                activeEventName = eventUtils.addNamespace(feedbackEvents.active, UI_FEEDBACK),
                inactiveEventName = eventUtils.addNamespace(feedbackEvents.inactive, UI_FEEDBACK);
            that._eventBindingTarget().off(activeEventName, feedbackSelector).off(inactiveEventName, feedbackSelector);
            if (that.option("activeStateEnabled")) {
                var feedbackActionHandler = function(args) {
                    var $element = args.element,
                        value = args.value,
                        jQueryEvent = args.jQueryEvent;
                    that._toggleActiveState($element, value, jQueryEvent)
                };
                that._eventBindingTarget().on(activeEventName, feedbackSelector, {
                    timeout: that._feedbackShowTimeout
                }, function(e) {
                    feedbackAction = feedbackAction || new Action(feedbackActionHandler), feedbackAction.execute({
                        element: $(e.currentTarget),
                        value: true,
                        jQueryEvent: e
                    })
                }).on(inactiveEventName, feedbackSelector, {
                    timeout: that._feedbackHideTimeout
                }, function(e) {
                    feedbackActionDisabled = feedbackActionDisabled || new Action(feedbackActionHandler, {
                        excludeValidators: ["disabled", "readOnly"]
                    }), feedbackActionDisabled.execute({
                        element: $(e.currentTarget),
                        value: false,
                        jQueryEvent: e
                    })
                })
            }
        },
        _toggleActiveState: function($element, value) {
            this._toggleHoverClass(!value);
            $element.toggleClass(ACTIVE_STATE_CLASS, value)
        },
        _refreshHoveredElement: function(hoveredElement) {
            var selector = this._activeStateUnit || this._eventBindingTarget();
            this._forgetHoveredElement();
            this._hoveredElement = hoveredElement.closest(selector);
            this._toggleHoverClass(true)
        },
        _forgetHoveredElement: function() {
            this._toggleHoverClass(false);
            delete this._hoveredElement
        },
        _toggleHoverClass: function(value) {
            if (this._hoveredElement) {
                this._hoveredElement.toggleClass(HOVER_STATE_CLASS, value && this.option("hoverStateEnabled"))
            }
        },
        _toggleDisabledState: function(value) {
            this.element().toggleClass(DISABLED_STATE_CLASS, Boolean(value));
            this._toggleHoverClass(!value);
            this.setAria("disabled", value || void 0)
        },
        _setWidgetOption: function(widgetName, args) {
            if (!this[widgetName]) {
                return
            }
            if ($.isPlainObject(args[0])) {
                $.each(args[0], $.proxy(function(option, value) {
                    this._setWidgetOption(widgetName, [option, value])
                }, this));
                return
            }
            var optionName = args[0];
            var value = args[1];
            if (1 === args.length) {
                value = this.option(optionName)
            }
            var widgetOptionMap = this[widgetName + "OptionMap"];
            this[widgetName].option(widgetOptionMap ? widgetOptionMap(optionName) : optionName, value)
        },
        _createComponent: function(element, name, config) {
            config = config || {};
            this._extendConfig(config, {
                templateProvider: this.option("templateProvider"),
                _templates: this.option("_templates")
            });
            return this.callBase(element, name, config)
        },
        _optionChanged: function(args) {
            switch (args.name) {
                case "disabled":
                    this._toggleDisabledState(args.value);
                    this._refreshFocusState();
                    break;
                case "hint":
                    this._renderHint();
                    break;
                case "activeStateEnabled":
                    this._attachFeedbackEvents();
                    break;
                case "hoverStateEnabled":
                    this._attachHoverEvents();
                    break;
                case "tabIndex":
                case "_keyboardProcessor":
                case "focusStateEnabled":
                    this._refreshFocusState();
                    break;
                case "onFocusIn":
                case "onFocusOut":
                    break;
                case "accessKey":
                    this._renderAccessKey();
                    break;
                case "visible":
                    var visible = args.value;
                    this._toggleVisibility(visible);
                    if (this._isVisibilityChangeSupported()) {
                        this._checkVisibilityChanged(args.value ? "shown" : "hiding")
                    }
                    break;
                case "onContentReady":
                    this._initContentReadyAction();
                    break;
                case "_templates":
                case "templateProvider":
                    break;
                default:
                    this.callBase(args)
            }
        },
        _isVisible: function() {
            return this.callBase() && this.option("visible")
        },
        beginUpdate: function() {
            this._ready(false);
            this.callBase()
        },
        endUpdate: function() {
            this.callBase();
            if (this._initialized) {
                this._ready(true)
            }
        },
        _ready: function(value) {
            if (0 === arguments.length) {
                return this._isReady
            }
            this._isReady = value
        },
        setAria: function() {
            var setAttribute = function(option) {
                var attrName = "role" === option.name || "id" === option.name ? option.name : "aria-" + option.name,
                    attrValue = option.value;
                if (null === attrValue || void 0 === attrValue) {
                    attrValue = void 0
                } else {
                    attrValue = attrValue.toString()
                }
                domUtils.toggleAttr(option.target, attrName, attrValue)
            };
            if (!$.isPlainObject(arguments[0])) {
                setAttribute({
                    name: arguments[0],
                    value: arguments[1],
                    target: arguments[2] || this._getAriaTarget()
                })
            } else {
                var $target = arguments[1] || this._getAriaTarget();
                $.each(arguments[0], function(key, value) {
                    setAttribute({
                        name: key,
                        value: value,
                        target: $target
                    })
                })
            }
        },
        isReady: function() {
            return this._ready()
        },
        repaint: function() {
            this._refresh()
        },
        focus: function() {
            this._focusTarget().focus()
        },
        registerKeyHandler: function(key, handler) {
            var currentKeys = this._supportedKeys(),
                addingKeys = {};
            addingKeys[key] = handler;
            this._supportedKeys = function() {
                return $.extend(currentKeys, addingKeys)
            }
        }
    });
    module.exports = Widget
});
