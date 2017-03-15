/** 
 * DevExtreme (ui/form/ui.form.js)
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
        registerComponent = require("../../core/component_registrator"),
        Guid = require("../../core/guid"),
        utils = require("../../core/utils/common"),
        stringUtils = require("../../core/utils/string"),
        errors = require("../widget/ui.errors"),
        domUtils = require("../../core/utils/dom"),
        messageLocalization = require("../../localization/message"),
        Widget = require("../widget/ui.widget"),
        windowUtils = require("../../core/utils/window"),
        ValidationEngine = require("../validation_engine"),
        TabPanel = (require("./ui.form.layout_manager"), require("../tab_panel")),
        Scrollable = require("../scroll_view/ui.scrollable").default;
    require("../validation_summary");
    require("../validation_group");
    var FORM_CLASS = "dx-form",
        FIELD_ITEM_CLASS = "dx-field-item",
        FIELD_ITEM_LABEL_TEXT_CLASS = "dx-field-item-label-text",
        FORM_GROUP_CLASS = "dx-form-group",
        FORM_GROUP_CONTENT_CLASS = "dx-form-group-content",
        FORM_GROUP_WITH_CAPTION_CLASS = "dx-form-group-with-caption",
        FORM_GROUP_CAPTION_CLASS = "dx-form-group-caption",
        HIDDEN_LABEL_CLASS = "dx-layout-manager-hidden-label",
        FIELD_ITEM_LABEL_CLASS = "dx-field-item-label",
        FIELD_ITEM_LABEL_CONTENT_CLASS = "dx-field-item-label-content",
        FIELD_ITEM_TAB_CLASS = "dx-field-item-tab",
        FORM_FIELD_ITEM_COL_CLASS = "dx-col-",
        GROUP_COL_COUNT_CLASS = "dx-group-colcount-",
        FIELD_ITEM_CONTENT_CLASS = "dx-field-item-content",
        FORM_VALIDATION_SUMMARY = "dx-form-validation-summary",
        WIDGET_CLASS = "dx-widget";
    var Form = Widget.inherit({
        _init: function() {
            this.callBase();
            this._groupsColCount = []
        },
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                formID: new Guid,
                formData: {},
                colCount: 1,
                screenByWidth: null,
                colCountByScreen: void 0,
                labelLocation: "left",
                readOnly: false,
                onFieldDataChanged: null,
                customizeItem: null,
                onEditorEnterKey: null,
                minColWidth: 200,
                alignItemLabels: true,
                alignItemLabelsInAllGroups: true,
                showColonAfterLabel: true,
                showRequiredMark: true,
                showOptionalMark: false,
                requiredMark: "*",
                optionalMark: messageLocalization.format("dxForm-optionalMark"),
                requiredMessage: messageLocalization.getFormatter("dxForm-requiredMessage"),
                showValidationSummary: false,
                items: void 0,
                scrollingEnabled: false
            })
        },
        _setOptionsByReference: function() {
            this.callBase();
            $.extend(this._optionsByReference, {
                formData: true
            })
        },
        _getColCount: function($element) {
            var $cols, index = 0,
                isFinding = true;
            while (isFinding) {
                $cols = $element.find("." + FORM_FIELD_ITEM_COL_CLASS + index);
                if (!$cols.length) {
                    isFinding = false
                } else {
                    index++
                }
            }
            return index
        },
        _createHiddenElement: function(rootLayoutManager) {
            this._$hiddenElement = $("<div/>").addClass(WIDGET_CLASS).addClass(HIDDEN_LABEL_CLASS).appendTo(document.body);
            var $hiddenLabel = rootLayoutManager._renderLabel({
                text: " ",
                location: this.option("labelLocation")
            }).appendTo(this._$hiddenElement);
            this._hiddenLabelText = $hiddenLabel.find("." + FIELD_ITEM_LABEL_TEXT_CLASS)[0]
        },
        _removeHiddenElement: function() {
            this._$hiddenElement.remove();
            this._hiddenLabelText = null
        },
        _getLabelWidthByText: function(text) {
            this._hiddenLabelText.innerHTML = text;
            return this._hiddenLabelText.offsetWidth
        },
        _getLabelsSelectorByCol: function(index, options) {
            options = options || {};
            var cssExcludeTabbedSelector = options.excludeTabbed ? ":not(." + FIELD_ITEM_TAB_CLASS + ")" : "";
            return "." + (options.inOneColumn ? FIELD_ITEM_CLASS : FORM_FIELD_ITEM_COL_CLASS + index) + cssExcludeTabbedSelector + "> ." + FIELD_ITEM_LABEL_CLASS + " > ." + FIELD_ITEM_LABEL_CONTENT_CLASS
        },
        _getLabelText: function(labelText) {
            var child, i, length = labelText.children.length,
                result = "";
            for (i = 0; i < length; i++) {
                child = labelText.children[i];
                result += !stringUtils.isEmpty(child.innerText) ? child.innerText : child.innerHTML
            }
            return result
        },
        _applyLabelsWidthByCol: function($container, index, options) {
            var labelWidth, i, $labelTexts = $container.find(this._getLabelsSelectorByCol(index, options)),
                $labelTextsLength = $labelTexts.length,
                maxWidth = 0;
            for (i = 0; i < $labelTextsLength; i++) {
                labelWidth = this._getLabelWidthByText(this._getLabelText($labelTexts[i]));
                if (labelWidth > maxWidth) {
                    maxWidth = labelWidth
                }
            }
            for (i = 0; i < $labelTextsLength; i++) {
                $labelTexts[i].style.width = maxWidth + "px"
            }
        },
        _applyLabelsWidth: function($container, excludeTabbed, inOneColumn) {
            var i, colCount = inOneColumn ? 1 : this._getColCount($container),
                applyLabelsOptions = {
                    excludeTabbed: excludeTabbed,
                    inOneColumn: inOneColumn
                };
            for (i = 0; i < colCount; i++) {
                this._applyLabelsWidthByCol($container, i, applyLabelsOptions)
            }
        },
        _getGroupElementsInColumn: function($container, columnIndex, colCount) {
            var cssColCountSelector = utils.isDefined(colCount) ? "." + GROUP_COL_COUNT_CLASS + colCount : "";
            return $container.find("." + FORM_FIELD_ITEM_COL_CLASS + columnIndex + " > ." + FIELD_ITEM_CONTENT_CLASS + " > ." + FORM_GROUP_CLASS + cssColCountSelector)
        },
        _applyLabelsWidthWithGroups: function($container, colCount, excludeTabbed) {
            var i, j, $groups, groupColCount, $groupsByCol, alignItemLabelsInAllGroups = this.option("alignItemLabelsInAllGroups"),
                applyLabelsOptions = {
                    excludeTabbed: excludeTabbed
                };
            if (alignItemLabelsInAllGroups) {
                for (i = 0; i < colCount; i++) {
                    $groupsByCol = this._getGroupElementsInColumn($container, i);
                    this._applyLabelsWidthByCol($groupsByCol, 0, applyLabelsOptions);
                    for (j = 0; j < this._groupsColCount.length; j++) {
                        $groupsByCol = this._getGroupElementsInColumn($container, i, this._groupsColCount[j]);
                        groupColCount = this._getColCount($groupsByCol);
                        for (var k = 1; k < groupColCount; k++) {
                            this._applyLabelsWidthByCol($groupsByCol, k, applyLabelsOptions)
                        }
                    }
                }
            } else {
                $groups = this.element().find("." + FORM_GROUP_CLASS);
                for (i = 0; i < $groups.length; i++) {
                    this._applyLabelsWidth($groups.eq(i), excludeTabbed)
                }
            }
        },
        _alignLabelsInColumn: function(options) {
            this._createHiddenElement(options.layoutManager);
            if (options.inOneColumn) {
                this._applyLabelsWidth(options.$container, options.excludeTabbed, true)
            } else {
                if (this._checkGrouping(options.items)) {
                    this._applyLabelsWidthWithGroups(options.$container, options.layoutManager._getColCount(), options.excludeTabbed)
                } else {
                    this._applyLabelsWidth(options.$container, options.excludeTabbed)
                }
            }
            this._removeHiddenElement()
        },
        _render: function() {
            this._clearEditorInstances();
            this.callBase();
            this.element().addClass(FORM_CLASS);
            this._cachedScreenFactor = windowUtils.getCurrentScreenFactor(this.option("screenByWidth"))
        },
        _clearEditorInstances: function() {
            this._editorInstancesByField = {}
        },
        _alignLabels: function(layoutManager, inOneColumn) {
            this._alignLabelsInColumn({
                $container: this.element(),
                layoutManager: layoutManager,
                excludeTabbed: true,
                items: this.option("items"),
                inOneColumn: inOneColumn
            })
        },
        _clean: function() {
            this.callBase();
            this._groupsColCount = []
        },
        _renderContentImpl: function() {
            this.callBase();
            this._renderForm();
            this._renderValidationGroup();
            if (this.option("scrollingEnabled")) {
                this._renderScrollable()
            }
            this._renderLayout();
            this._renderValidationSummary()
        },
        _renderScrollable: function() {
            var useNativeScrolling = this.option("useNativeScrolling");
            this._scrollable = new Scrollable(this._$form, {
                useNative: !!useNativeScrolling,
                useSimulatedScrollbar: !useNativeScrolling,
                useKeyboard: false,
                direction: "both",
                bounceEnabled: false
            })
        },
        _getContent: function() {
            return this.option("scrollingEnabled") ? this._scrollable.content() : this._$form
        },
        _renderForm: function() {
            var $element = this.element();
            this._$form = $("<form>").appendTo($element);
            this.setAria("role", "form", $element)
        },
        _renderValidationGroup: function() {
            this._$form.dxValidationGroup()
        },
        _renderValidationSummary: function() {
            var that = this,
                $validationSummary = that._$form.find("." + FORM_VALIDATION_SUMMARY);
            if ($validationSummary.length > 0) {
                $validationSummary.remove()
            }
            if (this.option("showValidationSummary")) {
                $("<div/>").addClass(FORM_VALIDATION_SUMMARY).dxValidationSummary({
                    validationGroup: that
                }).appendTo(that._getContent())
            }
        },
        _prepareItems: function(items, isTabbed) {
            if (items) {
                var i, item, clonedItem, that = this,
                    extendedItems = [];
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    clonedItem = utils.isObject(item) ? $.extend({}, item) : item;
                    that._prepareGroupItem(clonedItem);
                    that._prepareTabbedItem(clonedItem);
                    that._prepareItemTemplate(clonedItem);
                    if (utils.isObject(clonedItem)) {
                        if (isTabbed) {
                            clonedItem.cssItemClass = FIELD_ITEM_TAB_CLASS
                        }
                        clonedItem.items = this._prepareItems(clonedItem.items, isTabbed)
                    }
                    extendedItems.push(clonedItem)
                }
                return extendedItems
            }
        },
        _prepareGroupItem: function(item) {
            if ("group" === item.itemType) {
                item.alignItemLabels = utils.ensureDefined(item.alignItemLabels, true);
                if (item.template) {
                    item.groupContentTemplate = this._getTemplate(item.template)
                }
                item.template = $.proxy(this._itemGroupTemplate, this, item)
            }
        },
        _prepareTabbedItem: function(item) {
            if ("tabbed" === item.itemType) {
                item.template = $.proxy(this._itemTabbedTemplate, this, item);
                item.tabs = this._prepareItems(item.tabs, true)
            }
        },
        _prepareItemTemplate: function(item) {
            if (item.template) {
                item.template = this._getTemplate(item.template)
            }
        },
        _checkGrouping: function(items) {
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if ("group" === item.itemType) {
                        return true
                    }
                }
            }
        },
        _renderLayout: function() {
            var that = this,
                items = that.option("items"),
                $content = that._getContent();
            items = that._prepareItems(items);
            that._rootLayoutManager = that._renderLayoutManager(items, $content, {
                colCount: that.option("colCount"),
                width: this.option("width"),
                alignItemLabels: that.option("alignItemLabels"),
                screenByWidth: this.option("screenByWidth"),
                colCountByScreen: this.option("colCountByScreen"),
                onLayoutChanged: function(inOneColumn) {
                    $.proxy(that._alignLabels, that)(that._rootLayoutManager, inOneColumn)
                },
                onContentReady: function(e) {
                    that._alignLabels(e.component, e.component.isLayoutChanged())
                }
            })
        },
        _itemTabbedTemplate: function(item, e, $container) {
            var that = this,
                $tabPanel = $("<div/>").appendTo($container),
                tabPanelOptions = $.extend({}, item.tabPanelOptions, {
                    dataSource: item.tabs,
                    onItemRendered: function(args) {
                        domUtils.triggerShownEvent(args.itemElement)
                    },
                    itemTemplate: function(itemData, e, $container) {
                        var layoutManager, alignItemLabels = utils.ensureDefined(itemData.alignItemLabels, true);
                        layoutManager = that._renderLayoutManager(itemData.items, $container, {
                            colCount: itemData.colCount,
                            alignItemLabels: alignItemLabels,
                            screenByWidth: this.option("screenByWidth"),
                            colCountByScreen: itemData.colCountByScreen,
                            cssItemClass: itemData.cssItemClass,
                            onLayoutChanged: function(inOneColumn) {
                                $.proxy(that._alignLabelsInColumn, that)({
                                    $container: $container,
                                    layoutManager: layoutManager,
                                    items: itemData.items,
                                    inOneColumn: inOneColumn
                                })
                            }
                        });
                        if (alignItemLabels) {
                            $.proxy(that._alignLabelsInColumn, that)({
                                $container: $container,
                                layoutManager: layoutManager,
                                items: itemData.items,
                                inOneColumn: layoutManager.isLayoutChanged()
                            })
                        }
                    }
                });
            that._createComponent($tabPanel, TabPanel, tabPanelOptions)
        },
        _itemGroupTemplate: function(item, e, $container) {
            var $groupContent, colCount, layoutManager, $group = $("<div/>").appendTo($container).toggleClass(FORM_GROUP_WITH_CAPTION_CLASS, utils.isDefined(item.caption) && item.caption.length).addClass(FORM_GROUP_CLASS);
            if (item.caption) {
                $("<span/>").addClass(FORM_GROUP_CAPTION_CLASS).text(item.caption).appendTo($group)
            }
            $groupContent = $("<div/>").addClass(FORM_GROUP_CONTENT_CLASS).appendTo($group);
            if (item.groupContentTemplate) {
                var data = {
                    formData: this.option("formData"),
                    component: this
                };
                item.groupContentTemplate.render({
                    model: data,
                    container: $groupContent
                })
            } else {
                layoutManager = this._renderLayoutManager(item.items, $groupContent, {
                    colCount: item.colCount,
                    colCountByScreen: item.colCountByScreen,
                    alignItemLabels: item.alignItemLabels,
                    cssItemClass: item.cssItemClass
                });
                colCount = layoutManager._getColCount();
                if ($.inArray(colCount, this._groupsColCount) === -1) {
                    this._groupsColCount.push(colCount)
                }
                $group.addClass(GROUP_COL_COUNT_CLASS + colCount)
            }
        },
        _renderLayoutManager: function(items, $rootElement, options) {
            var instance, $element = $("<div />"),
                that = this,
                config = $.extend(that._getLayoutManagerDefaultConfig(), {
                    items: items,
                    onContentReady: function(args) {
                        that._updateEditorInstancesFromLayoutManager(args.component._editorInstancesByField);
                        options.onContentReady && options.onContentReady(args)
                    },
                    colCount: options.colCount,
                    alignItemLabels: options.alignItemLabels,
                    cssItemClass: options.cssItemClass,
                    colCountByScreen: options.colCountByScreen,
                    onLayoutChanged: options.onLayoutChanged,
                    width: options.width
                });
            $element.appendTo($rootElement);
            instance = that._createComponent($element, "dxLayoutManager", config);
            that._attachSyncSubscriptions(instance);
            return instance
        },
        _getLayoutManagerDefaultConfig: function() {
            var that = this;
            return {
                form: that,
                showRequiredMark: that.option("showRequiredMark"),
                showOptionalMark: that.option("showOptionalMark"),
                requiredMark: that.option("requiredMark"),
                optionalMark: that.option("optionalMark"),
                requiredMessage: that.option("requiredMessage"),
                screenByWidth: that.option("screenByWidth"),
                layoutData: that.option("formData"),
                labelLocation: that.option("labelLocation"),
                customizeItem: that.option("customizeItem"),
                minColWidth: that.option("minColWidth"),
                showColonAfterLabel: that.option("showColonAfterLabel"),
                onEditorEnterKey: that.option("onEditorEnterKey"),
                onFieldDataChanged: function(args) {
                    that._triggerOnFieldDataChanged(args)
                },
                validationBoundary: that.option("scrollingEnabled") ? that.element() : void 0
            }
        },
        _updateEditorInstancesFromLayoutManager: function(instancesByDataFields) {
            $.extend(this._editorInstancesByField, instancesByDataFields)
        },
        _createComponent: function($element, type, config) {
            var that = this;
            config = config || {};
            that._extendConfig(config, {
                readOnly: that.option("readOnly")
            });
            return that.callBase($element, type, config)
        },
        _attachSyncSubscriptions: function(instance) {
            var that = this;
            that.on("optionChanged", function(args) {
                if (utils.isDefined(that.option("items")) && "formData" === args.fullName) {
                    instance.updateData(args.value)
                }
                if ("readOnly" === args.name) {
                    instance.option(args.fullName, args.value)
                }
            })
        },
        _optionChanged: function(args) {
            var rootNameOfComplexOption = this._getRootLevelOfExpectedComplexOption(args.fullName, ["formData", "items"]);
            if (rootNameOfComplexOption) {
                this._customHandlerOfComplexOption(args, rootNameOfComplexOption);
                return
            }
            switch (args.name) {
                case "formData":
                    if (!utils.isDefined(this._options.items)) {
                        this._invalidate();
                        this._triggerOnFieldDataChangedByDataSet(args.value)
                    } else {
                        if ($.isEmptyObject(args.value)) {
                            this._resetValues()
                        }
                    }
                    break;
                case "items":
                case "colCount":
                case "onFieldDataChanged":
                case "onEditorEnterKey":
                case "labelLocation":
                case "alignItemLabels":
                case "showColonAfterLabel":
                case "customizeItem":
                case "alignItemLabelsInAllGroups":
                case "showRequiredMark":
                case "showOptionalMark":
                case "requiredMark":
                case "optionalMark":
                case "requiredMessage":
                case "scrollingEnabled":
                case "formID":
                case "colCountByScreen":
                case "screenByWidth":
                    this._invalidate();
                    break;
                case "showValidationSummary":
                    this._renderValidationSummary();
                    break;
                case "minColWidth":
                    if ("auto" === this.option("colCount")) {
                        this._invalidate()
                    }
                    break;
                case "readOnly":
                    break;
                case "width":
                    this.callBase(args);
                    this._rootLayoutManager.option(args.name, args.value);
                    this._alignLabels(this._rootLayoutManager, this._rootLayoutManager.isLayoutChanged());
                    break;
                case "visible":
                    this.callBase(args);
                    if (args.value) {
                        domUtils.triggerShownEvent(this.element())
                    }
                    break;
                default:
                    this.callBase(args)
            }
        },
        _getRootLevelOfExpectedComplexOption: function(fullOptionName, expectedRootNames) {
            var result, splitedFullName = fullOptionName.split(".");
            if (splitedFullName.length > 1) {
                var i, rootOptionName = splitedFullName[0];
                for (i = 0; i < expectedRootNames.length; i++) {
                    if (rootOptionName.search(expectedRootNames[i]) !== -1) {
                        result = expectedRootNames[i]
                    }
                }
            }
            return result
        },
        _customHandlerOfComplexOption: function(args, rootOptionName) {
            var nameParts = args.fullName.split(".");
            switch (rootOptionName) {
                case "items":
                    var instance, items, name, itemPath = this._getItemPath(nameParts),
                        item = this.option(itemPath);
                    if (args.fullName.search("editorOptions") !== -1) {
                        instance = this.getEditor(item.dataField);
                        instance && instance.option(item.editorOptions)
                    } else {
                        if (item) {
                            name = args.fullName.replace(itemPath + ".", "");
                            this._changeItemOption(item, name, args.value);
                            items = this._generateItemsFromData(this.option("items"));
                            this.option("items", items)
                        }
                    }
                    break;
                case "formData":
                    var dataField = nameParts.slice(1).join(".");
                    this._triggerOnFieldDataChanged({
                        dataField: dataField,
                        value: args.value
                    })
            }
        },
        _getItemPath: function(nameParts) {
            var i, itemPath = nameParts[0];
            for (i = 1; i < nameParts.length; i++) {
                if (nameParts[i].search("items") !== -1) {
                    itemPath += "." + nameParts[i]
                } else {
                    break
                }
            }
            return itemPath
        },
        _triggerOnFieldDataChanged: function(args) {
            this._createActionByOption("onFieldDataChanged")(args)
        },
        _triggerOnFieldDataChangedByDataSet: function(data) {
            var that = this;
            if (data && utils.isObject(data)) {
                $.each(data, function(dataField, value) {
                    that._triggerOnFieldDataChanged({
                        dataField: dataField,
                        value: value
                    })
                })
            }
        },
        _updateFieldValue: function(dataField, value) {
            if (utils.isDefined(this.option("formData"))) {
                var editor = this.getEditor(dataField);
                this.option("formData." + dataField, value);
                if (editor) {
                    var editorValue = editor.option("value");
                    if (editorValue !== value) {
                        editor.option("value", value)
                    }
                }
            }
        },
        _generateItemsFromData: function(items) {
            var formData = this.option("formData"),
                result = [];
            if (!items && utils.isDefined(formData)) {
                $.each(formData, function(dataField, value) {
                    result.push({
                        dataField: dataField
                    })
                })
            }
            if (items) {
                $.each(items, function(index, item) {
                    if (utils.isObject(item)) {
                        result.push(item)
                    } else {
                        result.push({
                            dataField: item
                        })
                    }
                })
            }
            return result
        },
        _getItemByField: function(field, items) {
            var resultItem, that = this,
                fieldParts = utils.isObject(field) ? field : that._getFieldParts(field),
                fieldName = fieldParts.fieldName,
                fieldPath = fieldParts.fieldPath;
            if (items.length) {
                $.each(items, function(index, item) {
                    var itemType = item.itemType;
                    if (fieldPath.length) {
                        var path = fieldPath.slice();
                        item = that._getItemByFieldPath(path, fieldName, item)
                    } else {
                        if ("group" === itemType && !item.caption || "tabbed" === itemType) {
                            var subItemsField = that._getSubItemField(itemType);
                            item.items = that._generateItemsFromData(item.items);
                            item = that._getItemByField({
                                fieldName: fieldName,
                                fieldPath: fieldPath
                            }, item[subItemsField])
                        }
                    }
                    if (item && (item.dataField === fieldName || item.name === fieldName || that._getTextWithoutSpaces(item.title) === fieldName || "group" === item.itemType && that._getTextWithoutSpaces(item.caption) === fieldName)) {
                        resultItem = item;
                        return false
                    }
                })
            }
            return resultItem
        },
        _getFieldParts: function(field) {
            var fieldSeparator = ".",
                fieldName = field,
                separatorIndex = fieldName.indexOf(fieldSeparator),
                resultPath = [];
            while (separatorIndex !== -1) {
                resultPath.push(fieldName.substr(0, separatorIndex));
                fieldName = fieldName.substr(separatorIndex + 1);
                separatorIndex = fieldName.indexOf(fieldSeparator)
            }
            return {
                fieldName: fieldName,
                fieldPath: resultPath.reverse()
            }
        },
        _getItemByFieldPath: function(path, fieldName, item) {
            var result, that = this,
                itemType = item.itemType,
                subItemsField = that._getSubItemField(itemType),
                isItemWithSubItems = "group" === itemType || "tabbed" === itemType || item.title;
            do {
                if (isItemWithSubItems) {
                    var pathNode, isGroupWithCaption = utils.isDefined(item.caption || item.title),
                        captionWithoutSpaces = that._getTextWithoutSpaces(item.caption || item.title);
                    item[subItemsField] = that._generateItemsFromData(item[subItemsField]);
                    if (isGroupWithCaption) {
                        pathNode = path.pop()
                    }
                    if (!path.length) {
                        result = that._getItemByField(fieldName, item[subItemsField]);
                        if (result) {
                            break
                        }
                    }
                    if (!isGroupWithCaption || isGroupWithCaption && captionWithoutSpaces === pathNode) {
                        if (path.length) {
                            result = that._searchItemInEverySubitem(path, fieldName, item[subItemsField])
                        }
                    }
                } else {
                    break
                }
            } while (path.length && false !== result);
            return result
        },
        _getSubItemField: function(itemType) {
            return "tabbed" === itemType ? "tabs" : "items"
        },
        _searchItemInEverySubitem: function(path, fieldName, items) {
            var result, that = this;
            $.each(items, function(index, groupItem) {
                result = that._getItemByFieldPath(path, fieldName, groupItem);
                if (result) {
                    return false
                }
            });
            if (!result) {
                result = false
            }
            return result
        },
        _getTextWithoutSpaces: function(text) {
            return text ? text.replace(" ", "") : void 0
        },
        _changeItemOption: function(item, option, value) {
            if (utils.isObject(item)) {
                item[option] = value
            }
        },
        _dimensionChanged: function() {
            var currentScreenFactor = windowUtils.getCurrentScreenFactor(this.option("screenByWidth"));
            if (this._cachedScreenFactor !== currentScreenFactor) {
                this._cachedScreenFactor = currentScreenFactor;
                this._refresh();
                return
            }
            if ("auto" === this.option("colCount")) {
                this._refresh()
            }
        },
        _refresh: function() {
            this.element().find(".dx-state-focused input, .dx-state-focused textarea").trigger("change");
            this.callBase()
        },
        _resetValues: function() {
            var validationGroup = ValidationEngine.getGroupConfig(this);
            validationGroup && validationGroup.reset();
            $.each(this._editorInstancesByField, function(dataField, editor) {
                editor.reset();
                editor.option("isValid", true)
            })
        },
        _updateData: function(data, value, isComplexData) {
            var that = this,
                _data = isComplexData ? value : data;
            if (utils.isObject(_data)) {
                $.each(_data, function(dataField, fieldValue) {
                    that._updateData(isComplexData ? data + "." + dataField : dataField, fieldValue, utils.isObject(fieldValue))
                })
            } else {
                if (utils.isString(data)) {
                    that._updateFieldValue(data, value)
                }
            }
        },
        registerKeyHandler: function(key, handler) {
            this.callBase(key, handler);
            $.each(this._editorInstancesByField, function(dataField, editor) {
                editor.registerKeyHandler(key, handler)
            })
        },
        _focusTarget: function() {
            return this.element().find(".dx-field-item-content [tabindex]").first()
        },
        resetValues: function() {
            this._resetValues()
        },
        updateData: function(data, value) {
            this._updateData(data, value)
        },
        getEditor: function(field) {
            return this._editorInstancesByField[field]
        },
        updateDimensions: function() {
            var that = this,
                deferred = $.Deferred();
            if (that._scrollable) {
                that._scrollable.update().done(function() {
                    deferred.resolveWith(that)
                })
            } else {
                deferred.resolveWith(that)
            }
            return deferred.promise()
        },
        itemOption: function(field, option, value) {
            var that = this,
                argsCount = arguments.length,
                items = that._generateItemsFromData(that.option("items")),
                item = that._getItemByField(field, items);
            if (1 === argsCount) {
                return item
            } else {
                if (3 === argsCount) {
                    that._changeItemOption(item, option, value)
                } else {
                    if (utils.isObject(option)) {
                        $.each(option, function(optionName, optionValue) {
                            that._changeItemOption(item, optionName, optionValue)
                        })
                    }
                }
                this.option("items", items)
            }
        },
        validate: function() {
            try {
                return ValidationEngine.validateGroup(this)
            } catch (e) {
                errors.log("E1036", e.message)
            }
        }
    });
    registerComponent("dxForm", Form);
    module.exports = Form
});
