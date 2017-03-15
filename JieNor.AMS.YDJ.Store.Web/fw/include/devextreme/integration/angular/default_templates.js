/** 
 * DevExtreme (integration/angular/default_templates.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery");
    var TEMPLATE_GENERATORS = {};
    var TEMPLATE_WRAPPER_CLASS = "dx-template-wrapper";
    var baseElements = {
        container: function() {
            return $("<div>").addClass(TEMPLATE_WRAPPER_CLASS)
        },
        html: function() {
            return $("<div>").attr("ng-if", "dxTemplateModel.html").attr("ng-bind-html", "dxTemplateModel.html")
        },
        text: function(element) {
            element = element || "<div>";
            return $(element).attr("ng-if", "dxTemplateModel.text").attr("ng-if", "!dxTemplateModel.html").attr("ng-bind", "dxTemplateModel.text")
        },
        primitive: function() {
            return $("<div>").attr("ng-if", "dxTemplateModelIsPrimitive").attr("ng-bind", "'' + dxTemplateModel")
        }
    };
    var emptyTemplate = function() {
        return $()
    };
    TEMPLATE_GENERATORS.CollectionWidget = {
        item: function() {
            return baseElements.container().append(baseElements.html()).append(baseElements.text()).append(baseElements.primitive())
        },
        itemFrame: function() {
            var $container = $("<div>").attr("ng-class", "{ 'dx-state-invisible': !dxTemplateModel.visible && dxTemplateModel.visible != undefined, 'dx-state-disabled': !!dxTemplateModel.disabled }"),
                $placeholder = $("<div>").addClass("dx-item-content-placeholder");
            $container.append($placeholder);
            return $container
        }
    };
    var BUTTON_TEXT_CLASS = "dx-button-text";
    TEMPLATE_GENERATORS.dxButton = {
        content: function() {
            var $titleBinding = $("<span>").attr("ng-bind", "dxTemplateModel.text").attr("ng-class", "{ '" + BUTTON_TEXT_CLASS + "' : !!dxTemplateModel.text }"),
                icon = $("<dx-icon>");
            return baseElements.container().append(icon).append($titleBinding).append(baseElements.primitive())
        }
    };
    var LIST_ITEM_BADGE_CONTAINER_CLASS = "dx-list-item-badge-container",
        LIST_ITEM_BADGE_CLASS = "dx-list-item-badge",
        BADGE_CLASS = "dx-badge",
        LIST_ITEM_CHEVRON_CONTAINER_CLASS = "dx-list-item-chevron-container",
        LIST_ITEM_CHEVRON_CLASS = "dx-list-item-chevron";
    TEMPLATE_GENERATORS.dxList = {
        item: function() {
            return TEMPLATE_GENERATORS.CollectionWidget.item().append($("<div>").attr("ng-if", "dxTemplateModel.key").attr("ng-bind", "dxTemplateModel.key"))
        },
        itemFrame: function() {
            var $badgeContainer = $("<div>").addClass(LIST_ITEM_BADGE_CONTAINER_CLASS).attr("ng-if", "dxTemplateModel.badge"),
                $badge = $("<div>").addClass(LIST_ITEM_BADGE_CLASS).addClass(BADGE_CLASS).attr("ng-bind", "dxTemplateModel.badge");
            var $chevronContainer = $("<div>").addClass(LIST_ITEM_CHEVRON_CONTAINER_CLASS).attr("ng-if", "dxTemplateModel.showChevron"),
                $chevron = $("<div>").addClass(LIST_ITEM_CHEVRON_CLASS);
            return TEMPLATE_GENERATORS.CollectionWidget.itemFrame().append($badgeContainer.append($badge)).append($chevronContainer.append($chevron))
        },
        group: function() {
            var $keyBinding = $("<div>").attr("ng-if", "dxTemplateModel.key").attr("ng-bind", "dxTemplateModel.key");
            return baseElements.container().append($keyBinding).append(baseElements.primitive())
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
        item: function() {
            var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.item();
            var $details = $("<div>").addClass("dx-scheduler-appointment-content-details");
            $("<div>").attr("ng-if", "dxTemplateModel.allDay").addClass("dx-scheduler-appointment-content-allday").text(" All day: ").appendTo($details);
            $("<div>").attr("ng-if", "dxTemplateModel.startDate").addClass("dx-scheduler-appointment-content-date").text("{{dxTemplateModel.startDate | date : 'shortTime' }}").appendTo($details);
            $("<div>").attr("ng-if", "dxTemplateModel.endDate").addClass("dx-scheduler-appointment-content-date").text(" - ").appendTo($details);
            $("<div>").attr("ng-if", "dxTemplateModel.endDate").addClass("dx-scheduler-appointment-content-date").text("{{dxTemplateModel.endDate | date : 'shortTime' }}").appendTo($details);
            $details.appendTo($itemContent);
            $("<span>").attr("ng-if", "dxTemplateModel.recurrenceRule").addClass("dx-scheduler-appointment-recurrence-icon dx-icon-repeat").appendTo($itemContent);
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
        title: function() {
            var $titleBinding = $("<span>").attr("ng-if", "dxTemplateModel.title").attr("ng-bind", "dxTemplateModel.title"),
                icon = $("<dx-icon>");
            return baseElements.container().append(icon).append($titleBinding).append(baseElements.primitive())
        },
        content: TEMPLATE_GENERATORS.CollectionWidget.item
    };
    TEMPLATE_GENERATORS.dxPivotTabs = {
        item: function() {
            return baseElements.container().append($("<span>").attr("ng-if", "dxTemplateModel.title").attr("ng-bind", "dxTemplateModel.title")).append(baseElements.primitive())
        }
    };
    TEMPLATE_GENERATORS.dxPivot = {
        title: TEMPLATE_GENERATORS.dxPivotTabs.item,
        content: emptyTemplate
    };
    var PANORAMA_ITEM_TITLE_CLASS = "dx-panorama-item-title";
    TEMPLATE_GENERATORS.dxPanorama = {
        itemFrame: function() {
            return TEMPLATE_GENERATORS.CollectionWidget.itemFrame().prepend($("<div>").addClass(PANORAMA_ITEM_TITLE_CLASS).attr("ng-if", "dxTemplateModel.title").attr("ng-bind", "dxTemplateModel.title"))
        }
    };
    TEMPLATE_GENERATORS.dxActionSheet = {
        item: function() {
            return baseElements.container().append($("<div>").attr("dx-button", "{ bindingOptions: { text: 'dxTemplateModel.text', onClick: 'dxTemplateModel.onClick', type: 'dxTemplateModel.type', disabled: 'dxTemplateModel.disabled' } }"))
        }
    };
    TEMPLATE_GENERATORS.dxToolbarBase = {
        item: function() {
            var template = TEMPLATE_GENERATORS.CollectionWidget.item();
            $('<dx-polymorph-widget name="dxTemplateModel.widget" options="dxTemplateModel.options">').appendTo(template);
            return template
        },
        actionSheetItem: TEMPLATE_GENERATORS.dxActionSheet.item
    };
    TEMPLATE_GENERATORS.dxToolbarBase.menuItem = TEMPLATE_GENERATORS.dxToolbarBase.item;
    var GALLERY_IMAGE_CLASS = "dx-gallery-item-image";
    TEMPLATE_GENERATORS.dxGallery = {
        item: function() {
            return baseElements.container().append(baseElements.html()).append(baseElements.text()).append($("<img>").addClass(GALLERY_IMAGE_CLASS).attr("ng-if", "!dxTemplateModel.imageSrc").attr("ng-src", "{{'' + dxTemplateModel}}")).append($("<img>").addClass(GALLERY_IMAGE_CLASS).attr("ng-if", "dxTemplateModel.imageSrc").attr("ng-src", "{{dxTemplateModel.imageSrc}}").attr("ng-attr-alt", "{{dxTemplateModel.imageAlt}}"))
        }
    };
    var TABS_ITEM_TEXT_CLASS = "dx-tab-text";
    TEMPLATE_GENERATORS.dxTabs = {
        item: function() {
            var container = baseElements.container();
            var icon = $("<dx-icon>"),
                text = baseElements.text("<span>").addClass(TABS_ITEM_TEXT_CLASS);
            return container.append(baseElements.html()).append(icon).append(text).append(baseElements.primitive().addClass(TABS_ITEM_TEXT_CLASS))
        },
        itemFrame: function() {
            var $badge = $("<div>").addClass("dx-tabs-item-badge dx-badge").attr("ng-bind", "dxTemplateModel.badge").attr("ng-if", "dxTemplateModel.badge");
            return TEMPLATE_GENERATORS.CollectionWidget.itemFrame().append($badge)
        }
    };
    var NAVBAR_ITEM_BADGE_CLASS = "dx-navbar-item-badge";
    TEMPLATE_GENERATORS.dxNavBar = {
        itemFrame: function() {
            var $badge = $("<div>").addClass(NAVBAR_ITEM_BADGE_CLASS).addClass(BADGE_CLASS).attr("ng-if", "dxTemplateModel.badge").attr("ng-bind", "dxTemplateModel.badge");
            return TEMPLATE_GENERATORS.CollectionWidget.itemFrame().append($badge)
        }
    };
    TEMPLATE_GENERATORS.dxMenuBase = {
        item: function() {
            var container = baseElements.container();
            var text = $("<span>").attr("ng-if", "dxTemplateModel.text").addClass("dx-menu-item-text").attr("ng-bind", "dxTemplateModel.text"),
                icon = $("<dx-icon>"),
                popout = $("<span>").addClass("dx-menu-item-popout-container").attr("ng-if", "dxTemplateModel.items").append($("<div>").addClass("dx-menu-item-popout"));
            container.append(baseElements.html()).append(icon).append(text).append(popout).append(baseElements.primitive()).appendTo(container);
            return container
        }
    };
    TEMPLATE_GENERATORS.dxTreeView = {
        item: function() {
            var content = baseElements.container(),
                link = $("<span/>").attr("ng-bind", "dxTemplateModel.text"),
                icon = $("<dx-icon>");
            content.append(baseElements.html()).append(icon).append(link).append(baseElements.primitive());
            return content
        }
    };
    TEMPLATE_GENERATORS.dxTabPanel = {
        item: TEMPLATE_GENERATORS.CollectionWidget.item,
        title: function() {
            var content = TEMPLATE_GENERATORS.dxTabs.item();
            content.find(".dx-tab-text").eq(0).attr("ng-bind", "dxTemplateModel.title").attr("ng-if", "dxTemplateModel.title");
            content.find("[ng-if='dxTemplateModel.html']").remove();
            return content
        }
    };
    var popupTitleAndBottom = function() {
        return $("<div>").attr("dx-toolbar-base", "{ bindingOptions: { items: 'dxTemplateModel' } }")
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
        tag: function() {
            return $("<div>").addClass(TAGBOX_TAG_CONTENT_CLASS).append($("<span>").attr("ng-bind", "dxTemplateModel")).append($("<div>").addClass(TAGBOX_TAG_REMOVE_BUTTON_CLASS))
        }
    };
    module.exports = TEMPLATE_GENERATORS
});
