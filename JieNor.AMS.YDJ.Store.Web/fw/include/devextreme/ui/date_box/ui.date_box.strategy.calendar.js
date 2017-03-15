/** 
 * DevExtreme (ui/date_box/ui.date_box.strategy.calendar.js)
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
        Calendar = require("../calendar"),
        DateBoxStrategy = require("./ui.date_box.strategy"),
        dateUtils = require("../../core/utils/date"),
        commonUtils = require("../../core/utils/common"),
        dateLocalization = require("../../localization/date"),
        messageLocalization = require("../../localization/message");
    var CalendarStrategy = DateBoxStrategy.inherit({
        NAME: "Calendar",
        supportedKeys: function() {
            return {
                rightArrow: function() {
                    if (this.option("opened")) {
                        return true
                    }
                },
                leftArrow: function() {
                    if (this.option("opened")) {
                        return true
                    }
                },
                enter: $.proxy(function(e) {
                    if (this.dateBox.option("opened")) {
                        e.preventDefault();
                        if (this._widget.option("zoomLevel") === this._widget.option("maxZoomLevel")) {
                            var contouredDate = this._widget._view.option("contouredDate");
                            contouredDate && this.dateBoxValue(contouredDate);
                            this.dateBox.close();
                            this.dateBox._valueChangeEventHandler(e)
                        } else {
                            return true
                        }
                    }
                }, this)
            }
        },
        getDisplayFormat: function(displayFormat) {
            return displayFormat || dateLocalization.getPatternByFormat("shortdate")
        },
        _getWidgetName: function() {
            return Calendar.publicName()
        },
        _getWidgetOptions: function() {
            return $.extend(this.dateBox.option("calendarOptions"), {
                value: this.dateBoxValue() || null,
                _keyboardProcessor: this._widgetKeyboardProcessor,
                min: this.dateBox.dateOption("min"),
                max: this.dateBox.dateOption("max"),
                onValueChanged: $.proxy(this._valueChangedHandler, this),
                onCellClick: $.proxy(this._cellClickHandler, this),
                tabIndex: null,
                maxZoomLevel: this.dateBox.option("maxZoomLevel"),
                minZoomLevel: this.dateBox.option("minZoomLevel"),
                onContouredChanged: $.proxy(this._refreshActiveDescendant, this),
                hasFocus: function() {
                    return true
                }
            })
        },
        _refreshActiveDescendant: function(e) {
            this.dateBox.setAria("activedescendant", e.actionValue)
        },
        popupConfig: function(popupConfig) {
            var toolbarItems = popupConfig.toolbarItems,
                buttonsLocation = this.dateBox.option("buttonsLocation");
            var position = [];
            if ("default" !== buttonsLocation) {
                position = commonUtils.splitPair(buttonsLocation)
            } else {
                position = ["bottom", "center"]
            }
            if ("useButtons" === this.dateBox.option("applyValueMode")) {
                toolbarItems.unshift({
                    widget: "dxButton",
                    toolbar: position[0],
                    location: "after" === position[1] ? "before" : position[1],
                    options: {
                        onClick: $.proxy(function() {
                            this._widget._toTodayView()
                        }, this),
                        text: messageLocalization.format("dxCalendar-todayButtonText"),
                        type: "today"
                    }
                })
            }
            return $.extend(true, popupConfig, {
                toolbarItems: toolbarItems,
                position: {
                    collision: "flipfit flip"
                }
            })
        },
        _valueChangedHandler: function(e) {
            var dateBox = this.dateBox,
                value = e.value,
                prevValue = e.previousValue;
            if (dateUtils.sameDate(value, prevValue)) {
                return
            }
            if ("instantly" === dateBox.option("applyValueMode")) {
                this.dateBoxValue(this.getValue())
            }
        },
        _updateValue: function() {
            if (!this._widget) {
                return
            }
            this._widget.option("value", this.dateBoxValue())
        },
        textChangedHandler: function() {
            if (this.dateBox.option("opened") && this._widget) {
                this._updateValue(true)
            }
        },
        _cellClickHandler: function() {
            var dateBox = this.dateBox;
            if ("instantly" === dateBox.option("applyValueMode")) {
                dateBox.option("opened", false);
                this.dateBoxValue(this.getValue())
            }
        },
        dispose: function() {
            this.dateBox.off("optionChanged");
            this.callBase()
        }
    });
    module.exports = CalendarStrategy
});
