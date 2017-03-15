/** 
 * DevExtreme (ui/context_menu/ui.context_menu.js)
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
        Guid = require("../../core/guid"),
        registerComponent = require("../../core/component_registrator"),
        commonUtils = require("../../core/utils/common"),
        fx = require("../../animation/fx"),
        clickEvent = require("../../events/click"),
        positionUtils = require("../../animation/position"),
        devices = require("../../core/devices"),
        eventUtils = require("../../events/utils"),
        contextmenuEvent = require("../../events/contextmenu"),
        Overlay = require("../overlay"),
        MenuBase = require("./ui.menu_base");
    var DX_MENU_CLASS = "dx-menu",
        DX_MENU_ITEM_CLASS = DX_MENU_CLASS + "-item",
        DX_MENU_ITEM_EXPANDED_CLASS = DX_MENU_ITEM_CLASS + "-expanded",
        DX_MENU_PHONE_CLASS = "dx-menu-phone-overlay",
        DX_MENU_ITEMS_CONTAINER_CLASS = DX_MENU_CLASS + "-items-container",
        DX_MENU_ITEM_WRAPPER_CLASS = DX_MENU_ITEM_CLASS + "-wrapper",
        DX_SUBMENU_CLASS = "dx-submenu",
        DX_CONTEXT_MENU_CLASS = "dx-context-menu",
        DX_HAS_CONTEXT_MENU_CLASS = "dx-has-context-menu",
        DX_STATE_DISABLED_CLASS = "dx-state-disabled",
        FOCUS_UP = "up",
        FOCUS_DOWN = "down",
        FOCUS_LEFT = "left",
        FOCUS_RIGHT = "right",
        FOCUS_FIRST = "first",
        FOCUS_LAST = "last",
        ACTIONS = ["onShowing", "onShown", "onHiding", "onHidden", "onPositioning", "onLeftFirstItem", "onLeftLastItem", "onCloseRootSubmenu", "onExpandLastSubmenu"],
        LOCAL_SUBMENU_DIRECTIONS = [FOCUS_UP, FOCUS_DOWN, FOCUS_FIRST, FOCUS_LAST];
    var ContextMenu = MenuBase.inherit({
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                alternativeInvocationMode: {
                    enabled: false,
                    invokingElement: null
                },
                position: {
                    at: "top left",
                    my: "top left"
                },
                onShowing: null,
                onShown: null,
                onHiding: null,
                onHidden: null,
                onPositioning: null,
                submenuDirection: "auto",
                visible: false,
                target: window,
                onLeftFirstItem: null,
                onLeftLastItem: null,
                onCloseRootSubmenu: null,
                onExpandLastSubmenu: null
            })
        },
        _initActions: function() {
            this._actions = {};
            $.each(ACTIONS, $.proxy(function(index, action) {
                this._actions[action] = this._createActionByOption(action) || $.noop
            }, this))
        },
        _setOptionsByReference: function() {
            this.callBase();
            $.extend(this._optionsByReference, {
                animation: true,
                selectedItem: true
            })
        },
        _focusInHandler: $.noop,
        _itemContainer: function() {
            return this._overlay ? this._overlay.content() : $()
        },
        _eventBindingTarget: function() {
            return this._itemContainer()
        },
        itemsContainer: function() {
            return this._overlay ? this._overlay.content() : void 0
        },
        _supportedKeys: function() {
            var selectItem = function(e) {
                var $item = this.option("focusedElement");
                this.hide();
                if (!$item || !this._isSelectionEnabled()) {
                    return
                }
                this.selectItem($item[0])
            };
            return $.extend(this.callBase(), {
                space: selectItem,
                esc: this.hide
            })
        },
        _moveFocus: function(location) {
            var $newTarget, $items = this._getItemsByLocation(location),
                $oldTarget = this._getActiveItem(true),
                $focusedItem = this.option("focusedElement");
            switch (location) {
                case FOCUS_UP:
                    $newTarget = $focusedItem ? this._prevItem($items) : $items.last();
                    if ($oldTarget.is($items.first())) {
                        this._actions.onLeftFirstItem($oldTarget)
                    }
                    break;
                case FOCUS_DOWN:
                    $newTarget = $focusedItem ? this._nextItem($items) : $items.first();
                    if ($oldTarget.is($items.last())) {
                        this._actions.onLeftLastItem($oldTarget)
                    }
                    break;
                case FOCUS_RIGHT:
                    $newTarget = this.option("rtlEnabled") ? this._hideSubmenuHandler($items) : this._expandSubmenuHandler($items, location);
                    break;
                case FOCUS_LEFT:
                    $newTarget = this.option("rtlEnabled") ? this._expandSubmenuHandler($items, location) : this._hideSubmenuHandler($items);
                    break;
                case FOCUS_FIRST:
                    $newTarget = $items.first();
                    break;
                case FOCUS_LAST:
                    $newTarget = $items.last();
                    break;
                default:
                    return this.callBase(location)
            }
            if (0 !== $newTarget.length) {
                this.option("focusedElement", $newTarget)
            }
        },
        _getItemsByLocation: function(location) {
            var $items, $activeItem = this._getActiveItem(true),
                expandedLocation = this.option("rtlEnabled") ? FOCUS_LEFT : FOCUS_RIGHT;
            if ($.inArray(location, LOCAL_SUBMENU_DIRECTIONS) >= 0) {
                $items = $activeItem.closest("." + DX_MENU_ITEMS_CONTAINER_CLASS).children().children()
            } else {
                $items = this._itemElements();
                if (location !== expandedLocation) {
                    $items = $items.filter(":visible")
                }
            }
            return $items
        },
        _getAriaTarget: function() {
            return this.element()
        },
        _refreshActiveDescendant: function() {
            if (!this._overlay) {
                return
            }
            var id = this.getFocusedItemId();
            this.setAria("activedescendant", "", this._overlay.content());
            this.setAria("activedescendant", id, this._overlay.content())
        },
        _hideSubmenuHandler: function($items) {
            var $curItem = this._getActiveItem(true),
                $parentItem = $curItem.parents("." + DX_MENU_ITEM_EXPANDED_CLASS).first();
            if ($parentItem.length) {
                this._hideSubmenusOnSameLevel($parentItem);
                this._hideSubmenu($curItem.closest("." + DX_SUBMENU_CLASS));
                return $parentItem
            }
            this._actions.onCloseRootSubmenu($curItem);
            return $curItem
        },
        _expandSubmenuHandler: function($items, location) {
            var $curItem = this._getActiveItem(true),
                node = this._dataAdapter.getNodeByItem(this._getItemData($curItem)),
                isItemHasSubmenu = this._hasSubmenu(node),
                $submenu = $curItem.children("." + DX_SUBMENU_CLASS);
            if (isItemHasSubmenu && !$curItem.hasClass(DX_STATE_DISABLED_CLASS)) {
                if (!$submenu.length || "hidden" === $submenu.css("visibility")) {
                    this._showSubmenu($curItem)
                }
                return this._nextItem(this._getItemsByLocation(location))
            }
            this._actions.onExpandLastSubmenu($curItem);
            return $curItem
        },
        _clean: function() {
            if (this._overlay) {
                this._overlay.element().remove();
                this._overlay = null
            }
            this._detachShowContextMenuEvents($(this.option("target")));
            this.option("templatesRenderAsynchronously") && clearTimeout(this._drawSubmenuTimeout);
            this.callBase()
        },
        _render: function() {
            this.element().addClass(DX_HAS_CONTEXT_MENU_CLASS);
            this.callBase();
            this.setAria("role", "menu")
        },
        _renderContentImpl: function() {
            this._detachShowContextMenuEvents(this.option("target"));
            this._attachShowContextMenuEvents();
            this._attachInvokeContextMenuEvents()
        },
        _renderContextMenuOverlay: function() {
            if (this._overlay) {
                return
            }
            var $overlayContent, overlayOptions = this._getOverlayOptions(),
                $overlayElement = $("<div>");
            this._overlay = this._createComponent($overlayElement.appendTo(this._$element), Overlay, overlayOptions);
            $overlayContent = this._overlay.content();
            $overlayContent.addClass(DX_CONTEXT_MENU_CLASS);
            this._addCustomCssClass($overlayContent);
            this._addPlatformDependentClass($overlayContent);
            this._attachContextMenuEvent()
        },
        _itemContextMenuHandler: function(e) {
            this.callBase(e);
            e.stopPropagation()
        },
        _addPlatformDependentClass: function($element) {
            if (devices.current().phone) {
                $element.addClass(DX_MENU_PHONE_CLASS)
            }
        },
        _detachShowContextMenuEvents: function(target) {
            var eventName = eventUtils.addNamespace(contextmenuEvent.name, this.NAME);
            if (this._showContextMenuEventHandler) {
                $(document).off(eventName, this._getTargetSelector(target), this._showContextMenuEventHandler)
            } else {
                $(target).off(eventName)
            }
        },
        _attachShowContextMenuEvents: function() {
            var that = this,
                target = this.option("target"),
                eventName = eventUtils.addNamespace(contextmenuEvent.name, this.NAME),
                contextMenuAction = this._createAction($.proxy(function(e) {
                    if (!that.option("alternativeInvocationMode").enabled) {
                        that._show(e.jQueryEvent)
                    }
                }, this), {
                    validatingTargetName: "target"
                }),
                handler = function(e) {
                    contextMenuAction({
                        jQueryEvent: e,
                        target: $(e.currentTarget)
                    })
                };
            contextMenuAction = this._createAction(contextMenuAction);
            if (target instanceof $) {
                this._showContextMenuEventHandler = void 0;
                target.on(eventName, handler)
            } else {
                this._showContextMenuEventHandler = handler;
                $(document).on(eventName, target, this._showContextMenuEventHandler)
            }
        },
        _getTargetSelector: function(target) {
            return target instanceof $ ? target.selector : target
        },
        _attachInvokeContextMenuEvents: function() {
            var that = this,
                eventName = eventUtils.addNamespace(clickEvent.name, this.NAME),
                contextMenuAction = this._createAction($.proxy(function() {
                    that.toggle()
                }, this), {
                    validatingTargetName: "target"
                });
            if (this.option("alternativeInvocationMode").enabled && this._getInvokeTarget()) {
                $(this._getInvokeTarget()).off(eventName).on(eventName, $.proxy(function(e) {
                    contextMenuAction({
                        jQueryEvent: e,
                        target: $(e.target)
                    })
                }, this))
            }
        },
        _getInvokeTarget: function() {
            return this.option("alternativeInvocationMode").invokingElement
        },
        _hoverEndHandler: function(e) {
            e.stopPropagation()
        },
        _renderDimensions: $.noop,
        _renderContainer: function($wrapper, submenuContainer) {
            var $itemsContainer, $holder = submenuContainer || this._itemContainer();
            $wrapper = $("<div>");
            $wrapper.appendTo($holder).addClass(DX_SUBMENU_CLASS).css("visibility", submenuContainer ? "hidden" : "visible");
            $itemsContainer = this.callBase($wrapper);
            if (submenuContainer) {
                return $itemsContainer
            }
            if (this.option("width")) {
                return $itemsContainer.css("min-width", this.option("width"))
            }
            if (this.option("height")) {
                return $itemsContainer.css("min-height", this.option("height"))
            }
            return $itemsContainer
        },
        _renderSubmenuItems: function(node, $itemFrame) {
            this._renderItems(this._getChildNodes(node), $itemFrame)
        },
        _getOverlayOptions: function() {
            var position = this.option("position"),
                overlayAnimation = this.option("animation"),
                overlayOptions = {
                    focusStateEnabled: this.option("focusStateEnabled"),
                    animation: overlayAnimation,
                    closeOnOutsideClick: $.proxy(this._closeOnOutsideClickHandler, this),
                    closeOnTargetScroll: true,
                    deferRendering: false,
                    position: {
                        at: position.at,
                        my: position.my,
                        of: this.option("target"),
                        collision: "flipfit"
                    },
                    shading: false,
                    showTitle: false,
                    height: "auto",
                    width: "auto",
                    visible: this.option("visible"),
                    onShown: $.proxy(this._overlayShownActionHandler, this),
                    onHiding: $.proxy(this._overlayHidingActionHandler, this),
                    onHidden: $.proxy(this._overlayHiddenActionHandler, this),
                    onPositioned: $.proxy(this._overlayPositionedActionHandler, this)
                };
            return overlayOptions
        },
        _overlayShownActionHandler: function(arg) {
            this._actions.onShown(arg)
        },
        _overlayHidingActionHandler: function(arg) {
            this._actions.onHiding(arg);
            if (!arg.cancel) {
                this._hideAllShownSubmenus();
                this._setOptionSilent("visible", false)
            }
        },
        _overlayHiddenActionHandler: function(arg) {
            this._actions.onHidden(arg)
        },
        _overlayPositionedActionHandler: $.noop,
        _closeOnOutsideClickHandler: function(e) {
            var $clickedItem, $activeItemContainer, $itemContainers, $rootItem, isRootItemClicked, isInnerOverlayClicked, isInvokeTarget = $(e.target).closest(this._getInvokeTarget());
            if (e.target === document) {
                return true
            }
            if (isInvokeTarget && isInvokeTarget.length) {
                return false
            }
            $activeItemContainer = this._getActiveItemsContainer(e.target);
            $itemContainers = this._getItemsContainers();
            $clickedItem = this._searchActiveItem(e.target);
            $rootItem = this.element().parents("." + DX_MENU_ITEM_CLASS);
            isRootItemClicked = $clickedItem[0] === $rootItem[0] && $clickedItem.length && $rootItem.length;
            isInnerOverlayClicked = this._isIncludeOverlay($activeItemContainer, $itemContainers) && $clickedItem.length;
            if (isInnerOverlayClicked || isRootItemClicked) {
                if ("onClick" === this._getShowSubmenuMode()) {
                    this._hideAllShownChildSubmenus($clickedItem)
                }
                return false
            }
            return true
        },
        _getActiveItemsContainer: function(target) {
            return $(target).closest("." + DX_MENU_ITEMS_CONTAINER_CLASS)
        },
        _getItemsContainers: function() {
            return this._overlay._$content.find("." + DX_MENU_ITEMS_CONTAINER_CLASS)
        },
        _searchActiveItem: function(target) {
            return $(target).closest("." + DX_MENU_ITEM_CLASS).eq(0)
        },
        _isIncludeOverlay: function($activeOverlay, $allOverlays) {
            var isSame = false;
            $.each($allOverlays, function(index, $overlay) {
                if ($activeOverlay.is($overlay) && !isSame) {
                    isSame = true
                }
            });
            return isSame
        },
        _hideAllShownChildSubmenus: function($clickedItem) {
            var $context, that = this,
                $submenuElements = $clickedItem.find("." + DX_SUBMENU_CLASS),
                shownSubmenus = $.extend([], this._shownSubmenus);
            if ($submenuElements.length > 0) {
                $.each(shownSubmenus, function(index, $submenu) {
                    $context = that._searchActiveItem($submenu.context).parent();
                    if ($context.parent().is($clickedItem.parent().parent()) && !$context.is($clickedItem.parent())) {
                        that._hideSubmenu($submenu)
                    }
                })
            }
        },
        _showSubmenu: function($item) {
            var isSubmenuVisible, node = this._dataAdapter.getNodeByItem(this._getItemData($item)),
                isItemHasSubmenu = this._hasSubmenu(node);
            this._hideSubmenusOnSameLevel($item);
            if (isItemHasSubmenu) {
                this.callBase($item);
                if (!$item.children("." + DX_SUBMENU_CLASS).length) {
                    this._renderSubmenuItems(node, $item, 2)
                }
                isSubmenuVisible = this._isSubmenuVisible($item.children("." + DX_SUBMENU_CLASS));
                if (!isSubmenuVisible) {
                    $item.addClass(DX_MENU_ITEM_EXPANDED_CLASS);
                    this._drawSubmenu($item)
                }
            }
        },
        _hideSubmenusOnSameLevel: function($item) {
            var $expandedItems = $item.parent("." + DX_MENU_ITEM_WRAPPER_CLASS).siblings().find("." + DX_MENU_ITEM_EXPANDED_CLASS);
            if ($expandedItems.length) {
                $expandedItems.removeClass(DX_MENU_ITEM_EXPANDED_CLASS);
                this._hideSubmenu($expandedItems.find("." + DX_SUBMENU_CLASS))
            }
        },
        _hideSubmenuGroup: function($submenu) {
            if (this._isSubmenuVisible($submenu)) {
                this._hideSubmenuCore($submenu)
            }
        },
        _isSubmenuVisible: function($submenu) {
            return "visible" === $submenu.css("visibility")
        },
        _drawSubmenu: function($itemElement) {
            var animation = this.option("animation") ? this.option("animation").show : {},
                $submenu = $itemElement.children("." + DX_SUBMENU_CLASS),
                submenuPosition = this._getSubmenuPosition($itemElement);
            if (this._overlay && this._overlay.option("visible")) {
                if (!commonUtils.isDefined(this._shownSubmenus)) {
                    this._shownSubmenus = []
                }
                if ($.inArray($submenu, this._shownSubmenus)) {
                    this._shownSubmenus.push($submenu)
                }
                if (animation) {
                    fx.stop($submenu)
                }
                if (this.option("templatesRenderAsynchronously")) {
                    this._drawSubmenuTimeout = setTimeout(function() {
                        positionUtils.setup($submenu, submenuPosition)
                    })
                } else {
                    positionUtils.setup($submenu, submenuPosition)
                }
                if (animation) {
                    if ($.isPlainObject(animation.to)) {
                        animation.to.position = submenuPosition
                    }
                    this._animate($submenu, animation)
                }
                $submenu.css("visibility", "visible")
            }
        },
        _animate: function($container, options) {
            fx.animate($container, options)
        },
        _getSubmenuPosition: function($rootItem) {
            var submenuDirection = this.option("submenuDirection").toLowerCase(),
                $rootItemWrapper = $rootItem.parent("." + DX_MENU_ITEM_WRAPPER_CLASS),
                position = {
                    collision: "flip",
                    of: $rootItemWrapper,
                    offset: {
                        h: 0,
                        v: -1
                    }
                };
            switch (submenuDirection) {
                case "left":
                    position.at = "left top";
                    position.my = "right top";
                    break;
                case "right":
                    position.at = "right top";
                    position.my = "left top";
                    break;
                default:
                    if (this.option("rtlEnabled")) {
                        position.at = "left top";
                        position.my = "right top"
                    } else {
                        position.at = "right top";
                        position.my = "left top"
                    }
            }
            return position
        },
        _updateSubmenuVisibilityOnClick: function(actionArgs) {
            var $itemElement, itemData, node, renderSubmenu, $submenuElement, notCloseMenuOnItemClick;
            if (!actionArgs.args.length) {
                return
            }
            actionArgs.args[0].jQueryEvent.stopPropagation();
            $itemElement = actionArgs.args[0].itemElement;
            itemData = actionArgs.args[0].itemData;
            node = this._dataAdapter.getNodeByItem(itemData);
            if (!node) {
                return
            }
            renderSubmenu = node.internalFields.childrenKeys.length && !$itemElement.find("." + DX_SUBMENU_CLASS).length;
            renderSubmenu && this._renderSubmenuItems(node, $itemElement, 2);
            notCloseMenuOnItemClick = itemData && false === itemData.closeMenuOnClick;
            $submenuElement = $itemElement.children("." + DX_SUBMENU_CLASS);
            if ($itemElement.context === $submenuElement.context && "visible" === $submenuElement.css("visibility")) {
                return
            }
            if (!itemData || itemData.disabled || notCloseMenuOnItemClick) {
                return
            }
            this._updateSelectedItemOnClick(actionArgs);
            if (0 === $submenuElement.length) {
                var $prevSubmenu = $($itemElement.parents("." + DX_SUBMENU_CLASS)[0]);
                this._hideSubmenu($prevSubmenu);
                if (!actionArgs.canceled && this._overlay && this._overlay.option("visible")) {
                    this.option("visible", false)
                }
            } else {
                if (this._shownSubmenus && this._shownSubmenus.length > 0) {
                    if (this._shownSubmenus[0].is($submenuElement) || 1 === this._shownSubmenus[0].has($submenuElement).length) {
                        this._hideSubmenu($submenuElement)
                    } else {
                        this._hideAllShownSubmenus()
                    }
                }
                this._showSubmenu($itemElement)
            }
        },
        _hideSubmenu: function($curSubmenu) {
            var that = this,
                shownSubmenus = $.extend([], that._shownSubmenus);
            $.each(shownSubmenus, function(index, $submenu) {
                if ($curSubmenu.is($submenu) || $curSubmenu.has($submenu).length) {
                    $submenu.parent().removeClass(DX_MENU_ITEM_EXPANDED_CLASS);
                    that._hideSubmenuCore($submenu)
                }
            })
        },
        _hideSubmenuCore: function($submenu) {
            var index = $.inArray($submenu, this._shownSubmenus),
                animation = this.option("animation") ? this.option("animation").hide : null;
            if (index >= 0) {
                this._shownSubmenus.splice(index, 1)
            }
            this._stopAnimate($submenu);
            animation && this._animate($submenu, animation);
            $submenu.css("visibility", "hidden")
        },
        _stopAnimate: function($container) {
            fx.stop($container, true)
        },
        _hideAllShownSubmenus: function() {
            var that = this,
                shownSubmenus = $.extend([], that._shownSubmenus),
                $expandedItems = this._overlay.content().find("." + DX_MENU_ITEM_EXPANDED_CLASS);
            $expandedItems.removeClass(DX_MENU_ITEM_EXPANDED_CLASS);
            $.each(shownSubmenus, function(_, $submenu) {
                that._hideSubmenuCore($submenu)
            })
        },
        _visibilityChanged: function(visible) {
            if (visible) {
                this._detachShowContextMenuEvents(this.option("target"));
                this._attachShowContextMenuEvents();
                this._attachInvokeContextMenuEvents()
            }
        },
        _optionChanged: function(args) {
            if (this._cancelOptionChange === args.name) {
                return
            }
            if ($.inArray(args.name, ACTIONS) > -1) {
                this._initActions();
                return
            }
            switch (args.name) {
                case "visible":
                    this._toggleVisibility(args.value);
                    break;
                case "alternativeInvocationMode":
                case "position":
                case "submenuDirection":
                    this._invalidate();
                    break;
                case "target":
                    args.previousValue && this._detachShowContextMenuEvents(args.previousValue);
                    this.option("position").of = null;
                    this._invalidate();
                    break;
                default:
                    this.callBase(args)
            }
        },
        _toggleVisibility: function(showing) {
            showing ? this._show() : this._hide()
        },
        _show: function(jQEvent, position) {
            var args = {
                jQEvent: jQEvent
            };
            !position && this._actions.onShowing(args);
            if (args.cancel) {
                return $.Deferred().reject().promise()
            }
            var promise, id = new Guid;
            position = position || this._positionContextMenu(jQEvent);
            if (position) {
                if (this._overlay) {
                    this._setOptionSilent("visible", true);
                    this._overlay.option("position", position);
                    promise = this._overlay.show();
                    this._overlay.content().attr({
                        id: id,
                        role: "menu"
                    });
                    this.setAria("owns", id)
                } else {
                    this._renderContextMenuOverlay();
                    this._overlay.content().addClass(this._widgetClass());
                    this._renderFocusState();
                    this._attachHoverEvents();
                    this._attachClickEvent();
                    this._renderItems(this._dataAdapter.getRootNodes());
                    this._show(jQEvent, position)
                }
            }
            return promise || $.Deferred().reject().promise()
        },
        _positionContextMenu: function(jQEvent) {
            var actionArgs, position = this.option("position"),
                positioningAction = this._createActionByOption("onPositioning", actionArgs);
            if (jQEvent && jQEvent.preventDefault) {
                position = {
                    at: "top left",
                    my: "top left",
                    of: jQEvent
                }
            }
            if (!position.of) {
                position.of = this.option("target")
            }
            actionArgs = {
                position: position,
                jQueryEvent: jQEvent
            };
            positioningAction(actionArgs);
            if (actionArgs.cancel) {
                position = null
            } else {
                if (actionArgs.jQueryEvent) {
                    actionArgs.jQueryEvent.cancel = true;
                    jQEvent.preventDefault()
                }
            }
            return position
        },
        _hide: function() {
            var promise;
            if (this._overlay) {
                this._overlay.content().removeAttr("id");
                promise = this._overlay.hide();
                this._setOptionSilent("visible", false)
            }
            this.setAria("owns", void 0);
            return promise || $.Deferred().reject().promise()
        },
        toggle: function(showing) {
            var visible = this.option("visible");
            showing = void 0 === showing ? !visible : showing;
            return showing ? this._show() : this._hide()
        },
        show: function() {
            return this.toggle(true)
        },
        hide: function() {
            return this.toggle(false)
        }
    });
    registerComponent("dxContextMenu", ContextMenu);
    module.exports = ContextMenu
});
