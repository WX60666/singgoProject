/** 
 * DevExtreme (ui/widget/jquery.default_templates.js)
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
        inflector = require("../../core/utils/inflector"),
        iconUtils = require("../../core/utils/icon"),
        dateUtils = require("../../core/utils/date"),
        commonUtils = require("../../core/utils/common"),
        errors = require("../../core/errors"),
        dateLocalization = require("../../localization/date");
    var TEMPLATE_GENERATORS = {};
    var emptyTemplate = function() {
        return $()
    };
    var ITEM_CONTENT_PLACEHOLDER_CLASS = "dx-item-content-placeholder";
    TEMPLATE_GENERATORS.CollectionWidget = {
        item: function(itemData) {
            var $itemContent = $("<div>");
            if ($.isPlainObject(itemData)) {
                if (itemData.text) {
                    $itemContent.text(itemData.text)
                }
                if (itemData.html) {
                    $itemContent.html(itemData.html)
                }
            } else {
                $itemContent.text(String(itemData))
            }
            return $itemContent
        },
        itemFrame: function(itemData) {
            var $itemFrame = $("<div>");
            $itemFrame.toggleClass("dx-state-invisible", void 0 !== itemData.visible && !itemData.visible);
            $itemFrame.toggleClass("dx-state-disabled", !!itemData.disabled);
            var $placeholder = $("<div>").addClass(ITEM_CONTENT_PLACEHOLDER_CLASS);
            $itemFrame.append($placeholder);
            return $itemFrame
        }
    };
    var BUTTON_TEXT_CLASS = "dx-button-text";
    TEMPLATE_GENERATORS.dxButton = {
        content: function(itemData) {
            var $itemContent = $("<div>"),
                $iconElement = iconUtils.getImageContainer(itemData.icon),
                $textContainer = itemData.text ? $("<span>").text(itemData.text).addClass(BUTTON_TEXT_CLASS) : void 0;
            $itemContent.append($iconElement).append($textContainer);
            return $itemContent
        }
    };
    var LIST_ITEM_BADGE_CONTAINER_CLASS = "dx-list-item-badge-container",
        LIST_ITEM_BADGE_CLASS = "dx-list-item-badge",
        BADGE_CLASS = "dx-badge",
        LIST_ITEM_CHEVRON_CONTAINER_CLASS = "dx-list-item-chevron-container",
        LIST_ITEM_CHEVRON_CLASS = "dx-list-item-chevron";
    TEMPLATE_GENERATORS.dxList = {
        item: function(itemData) {
            var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.item(itemData);
            if (itemData.key) {
                var $key = $("<div>").text(itemData.key);
                $key.appendTo($itemContent)
            }
            return $itemContent
        },
        itemFrame: function(itemData) {
            var $itemFrame = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(itemData);
            if (itemData.badge) {
                var $badgeContainer = $("<div>").addClass(LIST_ITEM_BADGE_CONTAINER_CLASS),
                    $badge = $("<div>").addClass(LIST_ITEM_BADGE_CLASS).addClass(BADGE_CLASS);
                $badge.text(itemData.badge);
                $badgeContainer.append($badge).appendTo($itemFrame)
            }
            if (itemData.showChevron) {
                var $chevronContainer = $("<div>").addClass(LIST_ITEM_CHEVRON_CONTAINER_CLASS),
                    $chevron = $("<div>").addClass(LIST_ITEM_CHEVRON_CLASS);
                $chevronContainer.append($chevron).appendTo($itemFrame)
            }
            return $itemFrame
        },
        group: function(groupData) {
            var $groupContent = $("<div>");
            if ($.isPlainObject(groupData)) {
                if (groupData.key) {
                    $groupContent.text(groupData.key)
                }
            } else {
                $groupContent.html(String(groupData))
            }
            return $groupContent
        }
    };
    TEMPLATE_GENERATORS.dxDropDownMenu = {
        item: TEMPLATE_GENERATORS.dxList.item,
        content: TEMPLATE_GENERATORS.dxButton.content
    };
    TEMPLATE_GENERATORS.dxDropDownList = {
        item: TEMPLATE_GENERATORS.dxList.item
    };
    TEMPLATE_GENERATORS.dxRadioGroup = {
        item: TEMPLATE_GENERATORS.CollectionWidget.item
    };
    TEMPLATE_GENERATORS.dxScheduler = {
        item: function(itemData) {
            var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.item(itemData);
            var $details = $("<div>").addClass("dx-scheduler-appointment-content-details");
            if (itemData.allDay) {
                $("<div>").text(" All day: ").addClass("dx-scheduler-appointment-content-allday").appendTo($details)
            }
            if (itemData.startDate) {
                $("<div>").text(dateLocalization.format(dateUtils.makeDate(itemData.startDate), "shorttime")).addClass("dx-scheduler-appointment-content-date").appendTo($details)
            }
            if (itemData.endDate) {
                $("<div>").text(" - ").addClass("dx-scheduler-appointment-content-date").appendTo($details);
                $("<div>").text(dateLocalization.format(dateUtils.makeDate(itemData.endDate), "shorttime")).addClass("dx-scheduler-appointment-content-date").appendTo($details)
            }
            $details.appendTo($itemContent);
            if (itemData.recurrenceRule) {
                $("<span>").addClass("dx-scheduler-appointment-recurrence-icon dx-icon-repeat").appendTo($itemContent)
            }
            return $itemContent
        },
        appointmentTooltip: emptyTemplate,
        appointmentPopup: emptyTemplate
    };
    TEMPLATE_GENERATORS.dxOverlay = {
        content: emptyTemplate
    };
    TEMPLATE_GENERATORS.dxSlideOutView = {
        menu: emptyTemplate,
        content: emptyTemplate
    };
    TEMPLATE_GENERATORS.dxSlideOut = {
        menuItem: TEMPLATE_GENERATORS.dxList.item,
        menuGroup: TEMPLATE_GENERATORS.dxList.group,
        content: emptyTemplate
    };
    TEMPLATE_GENERATORS.dxAccordion = {
        title: function(titleData) {
            var $titleContent = $("<div>"),
                icon = titleData.icon,
                iconSrc = titleData.iconSrc,
                $iconElement = iconUtils.getImageContainer(icon || iconSrc);
            if ($.isPlainObject(titleData)) {
                if (titleData.title) {
                    $titleContent.text(titleData.title)
                }
            } else {
                $titleContent.html(String(titleData))
            }
            $iconElement && $iconElement.prependTo($titleContent);
            return $titleContent
        },
        item: TEMPLATE_GENERATORS.CollectionWidget.item
    };
    TEMPLATE_GENERATORS.dxActionSheet = {
        item: function(itemData) {
            return $("<div>").append($("<div>").dxButton($.extend({
                onClick: itemData.click
            }, itemData)))
        }
    };
    var GALLERY_IMAGE_CLASS = "dx-gallery-item-image";
    TEMPLATE_GENERATORS.dxGallery = {
        item: function(itemData) {
            var $itemContent = $("<div>"),
                $img = $("<img>").addClass(GALLERY_IMAGE_CLASS);
            if ($.isPlainObject(itemData)) {
                $img.attr({
                    src: itemData.imageSrc,
                    alt: itemData.imageAlt
                }).appendTo($itemContent)
            } else {
                $img.attr("src", String(itemData)).appendTo($itemContent)
            }
            return $itemContent
        }
    };
    var DX_MENU_ITEM_CAPTION_CLASS = "dx-menu-item-text",
        DX_MENU_ITEM_POPOUT_CLASS = "dx-menu-item-popout",
        DX_MENU_ITEM_POPOUT_CONTAINER_CLASS = "dx-menu-item-popout-container";
    TEMPLATE_GENERATORS.dxMenuBase = {
        item: function(itemData) {
            var $itemContent = $("<div>"),
                icon = itemData.icon,
                iconSrc = itemData.iconSrc,
                $iconElement = iconUtils.getImageContainer(icon || iconSrc);
            $iconElement && $iconElement.appendTo($itemContent);
            var $itemCaption;
            if (!commonUtils.isPrimitive(itemData) && itemData.text) {
                $itemCaption = $("<span>").addClass(DX_MENU_ITEM_CAPTION_CLASS).text(itemData.text)
            } else {
                if (!$.isPlainObject(itemData)) {
                    $itemCaption = $("<span>").addClass(DX_MENU_ITEM_CAPTION_CLASS).html(String(itemData))
                }
            }
            $itemContent.append($itemCaption);
            var $popOutImage, $popOutContainer;
            if (itemData.items && itemData.items.length > 0) {
                $popOutContainer = $("<span>").addClass(DX_MENU_ITEM_POPOUT_CONTAINER_CLASS).appendTo($itemContent);
                $popOutImage = $("<div>").addClass(DX_MENU_ITEM_POPOUT_CLASS).appendTo($popOutContainer)
            }
            return $itemContent
        }
    };
    var PANORAMA_ITEM_TITLE_CLASS = "dx-panorama-item-title";
    TEMPLATE_GENERATORS.dxPanorama = {
        itemFrame: function(itemData) {
            var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(itemData);
            if (itemData.title) {
                var $itemHeader = $("<div>").addClass(PANORAMA_ITEM_TITLE_CLASS).text(itemData.title);
                $itemContent.prepend($itemHeader)
            }
            return $itemContent
        }
    };
    TEMPLATE_GENERATORS.dxPivotTabs = {
        item: function(itemData) {
            var $itemContent = $("<div>");
            var $itemText;
            if (itemData && itemData.title) {
                $itemText = $("<span>").text(itemData.title)
            } else {
                $itemText = $("<span>").text(String(itemData))
            }
            $itemContent.html($itemText);
            return $itemContent
        }
    };
    TEMPLATE_GENERATORS.dxPivot = {
        title: TEMPLATE_GENERATORS.dxPivotTabs.item,
        content: emptyTemplate
    };
    var TABS_ITEM_TEXT_CLASS = "dx-tab-text";
    TEMPLATE_GENERATORS.dxTabs = {
        item: function(itemData) {
            var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.item(itemData);
            if (itemData.html) {
                return $itemContent
            }
            var icon = itemData.icon,
                iconSrc = itemData.iconSrc,
                $iconElement = iconUtils.getImageContainer(icon || iconSrc);
            if (!itemData.html) {
                $itemContent.wrapInner($("<span>").addClass(TABS_ITEM_TEXT_CLASS))
            }
            $iconElement && $iconElement.prependTo($itemContent);
            return $itemContent
        },
        itemFrame: function(itemData) {
            var $badge = $(),
                $itemFrame = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(itemData);
            if (itemData.badge) {
                $badge = $("<div>", {
                    "class": "dx-tabs-item-badge dx-badge"
                }).text(itemData.badge)
            }
            $itemFrame.append($badge);
            return $itemFrame
        }
    };
    TEMPLATE_GENERATORS.dxTabPanel = {
        item: TEMPLATE_GENERATORS.CollectionWidget.item,
        title: function(itemData) {
            var itemTitleData = itemData;
            if ($.isPlainObject(itemData)) {
                itemTitleData = $.extend({}, itemData, {
                    text: itemData.title,
                    html: null
                })
            }
            var $title = TEMPLATE_GENERATORS.dxTabs.item(itemTitleData);
            return $title
        }
    };
    var NAVBAR_ITEM_BADGE_CLASS = "dx-navbar-item-badge";
    TEMPLATE_GENERATORS.dxNavBar = {
        itemFrame: function(itemData) {
            var $itemFrame = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(itemData);
            if (itemData.badge) {
                var $badge = $("<div>").addClass(NAVBAR_ITEM_BADGE_CLASS).addClass(BADGE_CLASS);
                $badge.text(itemData.badge);
                $badge.appendTo($itemFrame)
            }
            return $itemFrame
        }
    };
    TEMPLATE_GENERATORS.dxToolbarBase = {
        item: function(itemData) {
            var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.item(itemData);
            var widgetName = itemData.widget;
            if (widgetName) {
                var widgetElement = $("<div>").appendTo($itemContent),
                    options = itemData.options || {};
                if ("button" === widgetName || "tabs" === widgetName || "dropDownMenu" === widgetName) {
                    var depricatedName = widgetName;
                    widgetName = inflector.camelize("dx-" + widgetName);
                    errors.log("W0001", "dxToolbar - 'widget' item field", depricatedName, "16.1", "Use: '" + widgetName + "' instead")
                }
                widgetElement[widgetName](options)
            } else {
                if (itemData.text) {
                    $itemContent.wrapInner("<div>")
                }
            }
            return $itemContent
        },
        actionSheetItem: TEMPLATE_GENERATORS.dxActionSheet.item
    };
    TEMPLATE_GENERATORS.dxToolbarBase.menuItem = TEMPLATE_GENERATORS.dxToolbarBase.item;
    TEMPLATE_GENERATORS.dxTreeView = {
        item: function(itemData) {
            var $itemContent = $("<div>"),
                icon = itemData.icon,
                iconSrc = itemData.iconSrc,
                $iconElement = iconUtils.getImageContainer(icon || iconSrc);
            if (itemData.html) {
                $itemContent.html(itemData.html)
            } else {
                $iconElement && $iconElement.appendTo($itemContent);
                $("<span>").text(itemData.text).appendTo($itemContent)
            }
            return $itemContent
        }
    };
    var popupTitleAndBottom = function(itemData) {
        return $("<div>").append($("<div>").dxToolbarBase({
            items: itemData
        }))
    };
    TEMPLATE_GENERATORS.dxPopup = {
        title: popupTitleAndBottom,
        bottom: popupTitleAndBottom
    };
    TEMPLATE_GENERATORS.dxLookup = {
        title: TEMPLATE_GENERATORS.dxPopup.title,
        group: TEMPLATE_GENERATORS.dxList.group
    };
    var TAGBOX_TAG_CONTENT_CLASS = "dx-tag-content",
        TAGBOX_TAG_REMOVE_BUTTON_CLASS = "dx-tag-remove-button";
    TEMPLATE_GENERATORS.dxTagBox = {
        tag: function(itemData, index, $tag) {
            var $tagContent = $("<div>").addClass(TAGBOX_TAG_CONTENT_CLASS);
            $("<span>").text(itemData).appendTo($tagContent);
            $("<div>").addClass(TAGBOX_TAG_REMOVE_BUTTON_CLASS).appendTo($tagContent);
            return $("<div>").append($tagContent)
        }
    };
    TEMPLATE_GENERATORS.dxCalendar = {
        cell: function(itemData) {
            return $("<div>").append($("<span>").text(itemData.text || String(itemData)))
        }
    };
    module.exports = TEMPLATE_GENERATORS
});
