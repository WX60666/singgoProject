/** 
 * DevExtreme (integration/knockout/default_templates.js)
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
    var createElementWithBindAttr = function(tagName, bindings, closeTag, additionalProperties) {
        closeTag = void 0 === closeTag ? true : closeTag;
        var bindAttr = $.map(bindings, function(value, key) {
            return key + ":" + value
        }).join(",");
        additionalProperties = additionalProperties || "";
        return "<" + tagName + ' data-bind="' + bindAttr + '" ' + additionalProperties + ">" + (closeTag ? "</" + tagName + ">" : "")
    };
    var defaultKoTemplateBasicBindings = {
        css: "{ 'dx-state-disabled': $data.disabled, 'dx-state-invisible': !($data.visible === undefined || ko.unwrap($data.visible)) }"
    };
    var emptyTemplate = function() {
        return ""
    };
    TEMPLATE_GENERATORS.CollectionWidget = {
        itemFrame: function() {
            var markup = [createElementWithBindAttr("div", defaultKoTemplateBasicBindings, false), "<div class='dx-item-content-placeholder'></div>", "</div>"];
            return markup.join("")
        },
        item: function() {
            var htmlBinding = createElementWithBindAttr("div", {
                    html: "html"
                }),
                textBinding = createElementWithBindAttr("div", {
                    text: "text"
                }),
                primitiveBinding = createElementWithBindAttr("div", {
                    text: "String($data)"
                });
            var markup = ["<div>", "<!-- ko if: $data.html -->", htmlBinding, "<!-- /ko -->", "<!-- ko if: !$data.html && $data.text -->", textBinding, "<!-- /ko -->", "<!-- ko ifnot: jQuery.isPlainObject($data) -->", primitiveBinding, "<!-- /ko -->", "</div>"];
            return markup.join("")
        }
    };
    var BUTTON_TEXT_CLASS = "dx-button-text";
    TEMPLATE_GENERATORS.dxButton = {
        content: function() {
            var textBinding = createElementWithBindAttr("span", {
                text: "$data.text",
                css: "{ '" + BUTTON_TEXT_CLASS + "' : !!$data.text }"
            });
            var markup = ["<div>", "<!-- ko dxIcon: $data.icon || $data.iconSrc --><!-- /ko -->", textBinding, "</div>"];
            return markup.join("")
        }
    };
    var LIST_ITEM_BADGE_CONTAINER_CLASS = "dx-list-item-badge-container",
        LIST_ITEM_BADGE_CLASS = "dx-list-item-badge",
        BADGE_CLASS = "dx-badge",
        LIST_ITEM_CHEVRON_CONTAINER_CLASS = "dx-list-item-chevron-container",
        LIST_ITEM_CHEVRON_CLASS = "dx-list-item-chevron";
    TEMPLATE_GENERATORS.dxList = {
        item: function() {
            var template = TEMPLATE_GENERATORS.CollectionWidget.item(),
                keyBinding = createElementWithBindAttr("div", {
                    text: "key"
                });
            template = [template.substring(0, template.length - 6), "<!-- ko if: $data.key -->" + keyBinding + "<!-- /ko -->", "</div>"];
            return template.join("")
        },
        itemFrame: function() {
            var template = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(),
                badgeBinding = createElementWithBindAttr("div", {
                    text: "badge"
                }, true, 'class="' + LIST_ITEM_BADGE_CLASS + " " + BADGE_CLASS + '"');
            var markup = [template.substring(0, template.length - 6), "<!-- ko if: $data.badge -->", '<div class="' + LIST_ITEM_BADGE_CONTAINER_CLASS + '">', badgeBinding, "</div>", "<!-- /ko -->", "<!-- ko if: $data.showChevron -->", '<div class="' + LIST_ITEM_CHEVRON_CONTAINER_CLASS + '">', '<div class="' + LIST_ITEM_CHEVRON_CLASS + '"></div>', "</div>", "<!-- /ko -->", "</div>"];
            return markup.join("")
        },
        group: function() {
            var keyBinding = createElementWithBindAttr("div", {
                    text: "key"
                }),
                primitiveBinding = createElementWithBindAttr("div", {
                    text: "String($data)"
                });
            var markup = ["<div>", "<!-- ko if: $data.key -->", keyBinding, "<!-- /ko -->", "<!-- ko ifnot: jQuery.isPlainObject($data) -->", primitiveBinding, "<!-- /ko -->", "</div>"];
            return markup.join("")
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
            var template = TEMPLATE_GENERATORS.CollectionWidget.item(),
                startDateBinding = createElementWithBindAttr("div class='dx-scheduler-appointment-content-date'", {
                    dxShorttimeDate: "$data.startDate"
                }),
                endDateBinding = createElementWithBindAttr("div class='dx-scheduler-appointment-content-date'", {
                    dxShorttimeDate: "$data.endDate"
                }),
                allDayBinding = createElementWithBindAttr("div class='dx-scheduler-appointment-content-allday'", {
                    text: "' All day: '"
                }),
                dash = createElementWithBindAttr("div class='dx-scheduler-appointment-content-date'", {
                    text: "' - '"
                });
            template = [template.substring(0, template.length - 6), "<div class='dx-scheduler-appointment-content-details'>", "<!-- ko if: $data.allDay -->" + allDayBinding + "<!-- /ko -->", "<!-- ko if: $data.startDate -->" + startDateBinding + "<!-- /ko -->", "<!-- ko if: $data.endDate -->" + dash + "<!-- /ko -->", "<!-- ko if: $data.endDate -->" + endDateBinding + "<!-- /ko -->", "</div>", "<!-- ko if: $data.recurrenceRule --><span class='dx-scheduler-appointment-recurrence-icon dx-icon-repeat'></span><!-- /ko -->", "</div>"];
            return template.join("")
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
            var titleBinding = createElementWithBindAttr("span", {
                text: "jQuery.isPlainObject($data) ? $data.title : String($data)"
            });
            var markup = ["<div>", "<!-- ko dxIcon: $data.icon || $data.iconSrc --><!-- /ko -->", titleBinding, "</div>"];
            return markup.join("")
        },
        item: TEMPLATE_GENERATORS.CollectionWidget.item
    };
    TEMPLATE_GENERATORS.dxResponsiveBox = {
        item: TEMPLATE_GENERATORS.CollectionWidget.item
    }, TEMPLATE_GENERATORS.dxPivotTabs = {
        item: function() {
            var titleBinding = createElementWithBindAttr("span", {
                    text: "title"
                }),
                primitiveBinding = createElementWithBindAttr("div", {
                    text: "String($data)"
                });
            var markup = ["<div>", "<!-- ko if: $data.title -->", titleBinding, "<!-- /ko -->", "<!-- ko ifnot: $data.title || jQuery.isPlainObject($data) -->", primitiveBinding, "<!-- /ko -->", "</div>"];
            return markup.join("")
        }
    };
    TEMPLATE_GENERATORS.dxPivot = {
        title: TEMPLATE_GENERATORS.dxPivotTabs.item,
        content: emptyTemplate
    };
    var PANORAMA_ITEM_TITLE_CLASS = "dx-panorama-item-title";
    TEMPLATE_GENERATORS.dxPanorama = {
        itemFrame: function() {
            var template = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(),
                headerBinding = createElementWithBindAttr("div", {
                    text: "title"
                }, true, 'class="' + PANORAMA_ITEM_TITLE_CLASS + '"');
            var divInnerStart = template.indexOf(">") + 1;
            template = [template.substring(0, divInnerStart), "<!-- ko if: $data.title -->", headerBinding, "<!-- /ko -->", template.substring(divInnerStart, template.length)];
            return template.join("")
        }
    };
    TEMPLATE_GENERATORS.dxActionSheet = {
        item: function() {
            return ["<div>", createElementWithBindAttr("div", {
                dxButton: "{ text: $data.text, onClick: $data.clickAction || $data.onClick, type: $data.type, disabled: !!ko.unwrap($data.disabled) }"
            }), "</div>"].join("")
        }
    };
    TEMPLATE_GENERATORS.dxToolbarBase = {
        item: function() {
            var template = TEMPLATE_GENERATORS.CollectionWidget.item();
            template = [template.substring(0, template.length - 6), "<!-- ko if: $data.widget -->"];
            template.push("<!-- ko dxPolymorphWidget: { name: $data.widget, options: $data.options } --><!-- /ko -->");
            template.push("<!-- /ko -->");
            return template.join("")
        },
        actionSheetItem: TEMPLATE_GENERATORS.dxActionSheet.item
    };
    TEMPLATE_GENERATORS.dxToolbarBase.menuItem = TEMPLATE_GENERATORS.dxToolbarBase.item;
    var GALLERY_IMAGE_CLASS = "dx-gallery-item-image";
    TEMPLATE_GENERATORS.dxGallery = {
        item: function() {
            var template = TEMPLATE_GENERATORS.CollectionWidget.item(),
                primitiveBinding = createElementWithBindAttr("div", {
                    text: "String($data)"
                }),
                imgBinding = createElementWithBindAttr("img", {
                    attr: "{ src: String($data) }"
                }, false, 'class="' + GALLERY_IMAGE_CLASS + '"');
            template = [template.substring(0, template.length - 6).replace(primitiveBinding, imgBinding), "<!-- ko if: $data.imageSrc -->", createElementWithBindAttr("img", {
                attr: "{ src: $data.imageSrc, alt: $data.imageAlt }"
            }, false, 'class="' + GALLERY_IMAGE_CLASS + '"'), "<!-- /ko -->"].join("");
            return template
        }
    };
    TEMPLATE_GENERATORS.dxTabs = {
        item: function() {
            var template = TEMPLATE_GENERATORS.CollectionWidget.item(),
                basePrimitiveBinding = createElementWithBindAttr("div", {
                    text: "String($data)"
                }),
                primitiveBinding = '<span class="dx-tab-text" data-bind="text: String($data)"></span>',
                baseTextBinding = createElementWithBindAttr("div", {
                    text: "text"
                }),
                textBinding = '<!-- ko dxIcon: $data.icon || $data.iconSrc --><!-- /ko --><span class="dx-tab-text" data-bind="text: $data.text"></span>';
            template = template.replace("<!-- ko if: !$data.html && $data.text -->", "<!-- ko if: !$data.html && ($data.text || $data.icon || $data.iconSrc) -->").replace(basePrimitiveBinding, primitiveBinding).replace(baseTextBinding, textBinding);
            return template
        },
        itemFrame: function() {
            var template = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(),
                badgeBinding = createElementWithBindAttr("div", {
                    attr: "{ 'class': 'dx-tabs-item-badge dx-badge' }",
                    text: "badge"
                });
            var markup = [template.substring(0, template.length - 6), "<!-- ko if: $data.badge -->", badgeBinding, "<!-- /ko -->", "</div>"];
            return markup.join("")
        }
    };
    TEMPLATE_GENERATORS.dxTabPanel = {
        item: TEMPLATE_GENERATORS.CollectionWidget.item,
        title: function() {
            var template = TEMPLATE_GENERATORS.dxTabs.item(),
                htmlBinding = "<!-- ko if: $data.html -->" + createElementWithBindAttr("div", {
                    html: "html"
                }) + "<!-- /ko -->";
            return template.replace(/\$data\.text/g, "$data.title").replace(/\!\$data\.html\ \&\&\ /, "").replace(htmlBinding, "")
        }
    };
    var NAVBAR_ITEM_BADGE_CLASS = "dx-navbar-item-badge";
    TEMPLATE_GENERATORS.dxNavBar = {
        itemFrame: function() {
            var template = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(),
                badgeBinding = createElementWithBindAttr("div", {
                    text: "badge"
                }, true, 'class="' + NAVBAR_ITEM_BADGE_CLASS + " " + BADGE_CLASS + '"');
            var markup = [template.substring(0, template.length - 6), "<!-- ko if: $data.badge -->", badgeBinding, "<!-- /ko -->", "</div>"];
            return markup.join("")
        }
    };
    TEMPLATE_GENERATORS.dxMenuBase = {
        item: function() {
            var template = [createElementWithBindAttr("div", defaultKoTemplateBasicBindings, false)],
                textBinding = createElementWithBindAttr("span", {
                    text: "text",
                    css: "{ 'dx-menu-item-text': true }"
                }),
                primitiveBinding = createElementWithBindAttr("span", {
                    text: "String($data)",
                    css: "{ 'dx-menu-item-text': true }"
                }),
                popout = "<span class='dx-menu-item-popout-container'><div class='dx-menu-item-popout'></div></span>";
            template.push("<!-- ko dxIcon: $data.icon || $data.iconSrc --><!-- /ko -->", "<!-- ko if: $data.text -->", textBinding, "<!-- /ko -->", "<!-- ko ifnot: jQuery.isPlainObject($data) || $data.text -->", primitiveBinding, "<!-- /ko -->", "<!-- ko if: $data.items -->", popout, "<!-- /ko -->", "</div>");
            return template.join("")
        }
    };
    TEMPLATE_GENERATORS.dxTreeView = {
        item: function() {
            var node = [],
                link = createElementWithBindAttr("span", {
                    text: "text"
                }, true),
                htmlBinding = createElementWithBindAttr("div", {
                    html: "html"
                });
            node.push("<div>", "<!-- ko if: $data.html && !$data.text -->", htmlBinding, "<!-- /ko -->", "<!-- ko dxIcon: $data.icon || $data.iconSrc --><!-- /ko -->", "<!-- ko if: !$data.html && $data.text -->" + link + "<!-- /ko -->", "</div>");
            return node.join("")
        }
    };
    var popupTitleAndBottom = function() {
        return ["<div>", createElementWithBindAttr("div", {
            dxToolbarBase: "{ items: $data }"
        }), "</div>"].join("")
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
            return ["<div>", "<div class=" + TAGBOX_TAG_CONTENT_CLASS + ">", createElementWithBindAttr("span", {
                text: "$data"
            }), "<div class=" + TAGBOX_TAG_REMOVE_BUTTON_CLASS + "></div>", "</div>", "</div>"].join("")
        }
    };
    module.exports = TEMPLATE_GENERATORS
});
