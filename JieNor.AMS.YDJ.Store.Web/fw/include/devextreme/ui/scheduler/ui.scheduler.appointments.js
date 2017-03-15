/** 
 * DevExtreme (ui/scheduler/ui.scheduler.appointments.js)
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
        translator = require("../../animation/translator"),
        dateUtils = require("../../core/utils/date"),
        commonUtils = require("../../core/utils/common"),
        recurrenceUtils = require("./utils.recurrence"),
        registerComponent = require("../../core/component_registrator"),
        publisherMixin = require("./ui.scheduler.publisher_mixin"),
        Appointment = require("./ui.scheduler.appointment"),
        VerticalAppointmentsStrategy = require("./ui.scheduler.appointments.strategy.vertical"),
        HorizontalAppointmentsStrategy = require("./ui.scheduler.appointments.strategy.horizontal"),
        HorizontalMonthLineAppointmentsStrategy = require("./ui.scheduler.appointments.strategy.horizontal_month_line"),
        HorizontalMonthAppointmentsStrategy = require("./ui.scheduler.appointments.strategy.horizontal_month"),
        AgendaAppointmentsStrategy = require("./ui.scheduler.appointments.strategy.agenda"),
        eventUtils = require("../../events/utils"),
        FunctionTemplate = require("../widget/ui.template.function"),
        dblclickEvent = require("../../events/dblclick"),
        dateLocalization = require("../../localization/date"),
        CollectionWidget = require("../collection/ui.collection_widget.edit"),
        Draggable = require("../draggable");
    var COMPONENT_CLASS = "dx-scheduler-scrollable-appointments",
        APPOINTMENT_ITEM_CLASS = "dx-scheduler-appointment",
        DBLCLICK_EVENT_NAME = eventUtils.addNamespace(dblclickEvent.name, "dxSchedulerAppointment");
    var RENDERING_STRATEGIES = {
        horizontal: HorizontalAppointmentsStrategy,
        horizontalMonth: HorizontalMonthAppointmentsStrategy,
        horizontalMonthLine: HorizontalMonthLineAppointmentsStrategy,
        vertical: VerticalAppointmentsStrategy,
        agenda: AgendaAppointmentsStrategy
    };
    var SchedulerAppointments = CollectionWidget.inherit({
        _supportedKeys: function(e) {
            var parent = this.callBase();
            var tabHandler = function(e) {
                var appointments = this._getAccessAppointments(),
                    focusedAppointment = appointments.filter(".dx-state-focused"),
                    index = focusedAppointment.attr("sortedIndex"),
                    lastIndex = appointments.length - 1;
                if (index > 0 && e.shiftKey || index < lastIndex && !e.shiftKey) {
                    e.preventDefault();
                    e.shiftKey ? index-- : index++;
                    var $nextAppointment = this._getAppointmentByIndex(index);
                    this._resetTabIndex($nextAppointment);
                    $nextAppointment.focus()
                }
            };
            return $.extend(parent, {
                escape: $.proxy(function() {
                    this.moveAppointmentBack();
                    this._escPressed = true
                }, this),
                del: $.proxy(function(e) {
                    if (this.option("allowDelete")) {
                        e.preventDefault();
                        var data = this._getItemData(e.target);
                        this.notifyObserver("deleteAppointment", {
                            data: data,
                            target: e.target
                        });
                        this.notifyObserver("hideAppointmentTooltip")
                    }
                }),
                tab: tabHandler
            })
        },
        _getAppointmentByIndex: function(index) {
            var appointments = this._getAccessAppointments();
            return appointments.filter("[sortedIndex =" + index + "]").eq(0)
        },
        _getAccessAppointments: function() {
            return this._itemElements().filter(":visible").not(".dx-state-disabled")
        },
        _resetTabIndex: function($appointment) {
            this._focusTarget().attr("tabindex", -1);
            $appointment.attr("tabindex", this.option("tabIndex"))
        },
        _moveFocus: $.noop,
        _focusTarget: function() {
            return this._itemElements()
        },
        _renderFocusTarget: function() {
            var $appointment = this._getAppointmentByIndex(0);
            this._resetTabIndex($appointment)
        },
        _focusInHandler: function(e) {
            if (this._targetIsDisabled(e)) {
                e.stopPropagation();
                return
            }
            this.callBase.apply(this, arguments);
            this._$currentAppointment = $(e.target);
            this.option("focusedElement", $(e.target));
            var that = this;
            setTimeout(function() {
                that.notifyObserver("appointmentFocused")
            })
        },
        _targetIsDisabled: function(e) {
            return $(e.currentTarget).is(".dx-state-disabled, .dx-state-disabled *")
        },
        _focusOutHandler: function(e) {
            var $appointment = this._getAppointmentByIndex(0);
            this.option("focusedElement", $appointment);
            this.callBase.apply(this, arguments)
        },
        _eventBindingTarget: function() {
            return this._itemContainer()
        },
        _getDefaultOptions: function() {
            return $.extend(this.callBase(), {
                noDataText: null,
                activeStateEnabled: true,
                hoverStateEnabled: true,
                tabIndex: 0,
                appointmentDurationInMinutes: 30,
                fixedContainer: null,
                allDayContainer: null,
                renderingStrategy: "vertical",
                allowDrag: true,
                allowResize: true,
                allowAllDayResize: true,
                onAppointmentDblClick: null,
                dayDuration: 24
            })
        },
        _optionChanged: function(args) {
            switch (args.name) {
                case "renderingStrategy":
                    this._initRenderingStrategy();
                    break;
                case "fixedContainer":
                case "allDayContainer":
                case "onAppointmentDblClick":
                    break;
                case "allowDrag":
                case "allowResize":
                case "allowAllDayResize":
                case "dayDuration":
                case "appointmentDurationInMinutes":
                    this.repaint();
                    break;
                case "focusedElement":
                    this._resetTabIndex($(args.value));
                    this.callBase(args);
                    break;
                case "allowDelete":
                    break;
                default:
                    this.callBase(args)
            }
        },
        _itemClass: function() {
            return APPOINTMENT_ITEM_CLASS
        },
        _itemContainer: function() {
            var $container = this.callBase(),
                $result = $container,
                $allDayContainer = this.option("allDayContainer");
            if ($allDayContainer) {
                $result = $container.add($allDayContainer)
            }
            return $result
        },
        _cleanItemContainer: function() {
            this.callBase();
            var $allDayContainer = this.option("allDayContainer");
            if ($allDayContainer) {
                $allDayContainer.empty()
            }
            this._virtualAppointments = {}
        },
        _clean: function() {
            this.callBase();
            delete this._$currentAppointment;
            delete this._initialSize;
            delete this._initialCoordinates
        },
        _init: function() {
            this.callBase();
            this._initRenderingStrategy();
            this.element().addClass(COMPONENT_CLASS);
            this._preventSingleAppointmentClick = false;
            this._initDynamicTemplates()
        },
        _initRenderingStrategy: function() {
            var Strategy = RENDERING_STRATEGIES[this.option("renderingStrategy")];
            this._renderingStrategy = new Strategy(this)
        },
        _initDynamicTemplates: function() {
            this._dynamicTemplates.item = new FunctionTemplate($.proxy(function(itemData) {
                var text = this.invoke("getField", "text", itemData),
                    startDate = dateUtils.makeDate(this.invoke("getField", "startDate", itemData)),
                    endDate = dateUtils.makeDate(this.invoke("getField", "endDate", itemData)),
                    rrule = this.invoke("getField", "recurrenceRule", itemData),
                    $text = $("<div>").text(text),
                    $contentDetails = $("<div>").addClass("dx-scheduler-appointment-content-details"),
                    result = [];
                var apptStartTz = this.invoke("getField", "startDateTimeZone", itemData),
                    apptEndTz = this.invoke("getField", "endDateTimeZone", itemData);
                startDate = this.invoke("convertDateByTimezone", startDate, apptStartTz);
                endDate = this.invoke("convertDateByTimezone", endDate, apptEndTz);
                $("<div>").addClass("dx-scheduler-appointment-content-date").text(dateLocalization.format(startDate, "shorttime")).appendTo($contentDetails);
                $("<div>").addClass("dx-scheduler-appointment-content-date").text(" - ").appendTo($contentDetails);
                $("<div>").addClass("dx-scheduler-appointment-content-date").text(dateLocalization.format(endDate, "shorttime")).appendTo($contentDetails);
                result.push($text, $contentDetails);
                if (rrule) {
                    result.push($("<span>").addClass("dx-scheduler-appointment-recurrence-icon dx-icon-repeat"))
                }
                return result
            }, this))
        },
        _executeItemRenderAction: function(index, itemData, itemElement) {
            var action = this._getItemRenderAction();
            if (action) {
                action({
                    appointmentElement: itemElement,
                    appointmentData: itemData,
                    targetedAppointmentData: this.invoke("getTargetedAppointmentData", itemData, itemElement, index)
                })
            }
            delete this._currentAppointmentSettings
        },
        _getStartDate: function(appointment, skipNormalize) {
            var startDate = this.invoke("getField", "startDate", appointment),
                startDateTimeZone = this.invoke("getField", "startDateTimeZone", appointment);
            startDate = dateUtils.makeDate(startDate);
            startDate = this.invoke("convertDateByTimezone", startDate, startDateTimeZone);
            !skipNormalize && this.notifyObserver("updateAppointmentStartDate", {
                startDate: startDate,
                appointment: appointment,
                callback: function(result) {
                    startDate = result
                }
            });
            return startDate
        },
        _getEndDate: function(appointment) {
            var endDate = this.invoke("getField", "endDate", appointment);
            if (endDate) {
                var endDateTimeZone = this.invoke("getField", "endDateTimeZone", appointment);
                endDate = dateUtils.makeDate(endDate);
                endDate = this.invoke("convertDateByTimezone", endDate, endDateTimeZone);
                this.notifyObserver("updateAppointmentEndDate", {
                    endDate: endDate,
                    callback: function(result) {
                        endDate = result
                    }
                })
            }
            return endDate
        },
        _itemClickHandler: function(e) {
            this.callBase(e, {}, {
                afterExecute: $.proxy(function(e) {
                    this._processItemClick(e.args[0].jQueryEvent)
                }, this)
            })
        },
        _processItemClick: function(e) {
            var $target = $(e.currentTarget),
                data = this._getItemData($target);
            if (this._targetIsDisabled(e)) {
                e.stopPropagation();
                return
            }
            this._normalizeAppointmentDates(data);
            if ("keydown" === e.type || eventUtils.isFakeClickEvent(e)) {
                this.notifyObserver("showEditAppointmentPopup", {
                    data: data,
                    target: $target
                });
                return
            }
            this._appointmentClickTimeout = setTimeout($.proxy(function() {
                if (!this._preventSingleAppointmentClick) {
                    this.notifyObserver("showAppointmentTooltip", {
                        data: data,
                        target: $target
                    })
                }
                this._preventSingleAppointmentClick = false
            }, this), 300)
        },
        _normalizeAppointmentDates: function(appointmentData) {
            var startDate = dateUtils.makeDate(this.invoke("getField", "startDate", appointmentData)),
                endDate = dateUtils.makeDate(this.invoke("getField", "endDate", appointmentData));
            this.invoke("setField", "startDate", appointmentData, startDate);
            this.invoke("setField", "endDate", appointmentData, endDate)
        },
        _extendActionArgs: function() {
            var args = this.callBase.apply(this, arguments);
            return this._mapAppointmentFields(args)
        },
        _mapAppointmentFields: function(args) {
            var result = {
                appointmentData: args.itemData,
                appointmentElement: args.itemElement
            };
            if (args.itemData) {
                result.targetedAppointmentData = this.invoke("getTargetedAppointmentData", args.itemData, args.itemElement, args.itemIndex)
            }
            return result
        },
        _render: function() {
            this.callBase.apply(this, arguments);
            this._attachAppointmentDblClick()
        },
        _attachAppointmentDblClick: function() {
            var that = this,
                itemSelector = that._itemSelector();
            this._itemContainer().off(DBLCLICK_EVENT_NAME, itemSelector).on(DBLCLICK_EVENT_NAME, itemSelector, function(e) {
                that._itemJQueryEventHandler(e, "onAppointmentDblClick", {}, {
                    afterExecute: function(e) {
                        that._dblClickHandler(e.args[0].jQueryEvent)
                    }
                })
            })
        },
        _dblClickHandler: function(e) {
            var $targetAppointment = $(e.currentTarget),
                appointmentData = this._getItemData($targetAppointment);
            clearTimeout(this._appointmentClickTimeout);
            this._preventSingleAppointmentClick = true;
            this.notifyObserver("showEditAppointmentPopup", {
                data: appointmentData,
                target: $targetAppointment
            })
        },
        _renderItems: function(items) {
            if (this._isContainerInvisible()) {
                return
            }
            this.notifyObserver("getCellDimensions", {
                callback: $.proxy(function(width, height, allDayHeight) {
                    this._cellWidth = width;
                    this._cellHeight = height;
                    this._allDayCellHeight = allDayHeight
                }, this)
            });
            this._positionMap = this._renderingStrategy.createTaskPositionMap(items);
            this.callBase(items)
        },
        _isContainerInvisible: function() {
            var isContainerInvisible = false;
            this.notifyObserver("checkContainerVisibility", {
                callback: function(result) {
                    isContainerInvisible = result
                }
            });
            return isContainerInvisible
        },
        _renderItem: function(index, itemData) {
            var allDay = this._renderingStrategy.isAllDay(itemData),
                $container = this._getAppointmentContainer(allDay),
                appointmentSettings = this._positionMap[index],
                coordinateCount = appointmentSettings.length;
            for (var i = 0; i < coordinateCount; i++) {
                this._currentAppointmentSettings = appointmentSettings[i];
                this.callBase(index, itemData, $container)
            }
        },
        _getAppointmentContainer: function(allDay) {
            var $allDayContainer = this.option("allDayContainer"),
                $container = this.itemsContainer().not($allDayContainer);
            if (allDay && $allDayContainer) {
                $container = $allDayContainer
            }
            return $container
        },
        _postprocessRenderItem: function(args) {
            this._renderAppointment(args.itemElement, this._currentAppointmentSettings)
        },
        _renderAppointment: function($appointment, settings) {
            this._applyResourceDataAttr($appointment);
            var appointmentData = this._getItemData($appointment),
                geometry = this._renderingStrategy.getAppointmentGeometry(settings),
                allowResize = !settings.isCompact && this.option("allowResize") && (!commonUtils.isDefined(settings.skipResizing) || commonUtils.isString(settings.skipResizing)),
                allowDrag = this.option("allowDrag"),
                allDay = this._renderingStrategy.isAllDay(appointmentData),
                direction = "vertical" === this.option("renderingStrategy") && !allDay ? "vertical" : "horizontal";
            this.invoke("setCellDataCacheAlias", this._currentAppointmentSettings, geometry);
            this._createComponent($appointment, Appointment, {
                observer: this.option("observer"),
                data: appointmentData,
                geometry: geometry,
                direction: direction,
                allowResize: allowResize,
                allowDrag: allowDrag,
                allDay: allDay,
                reduced: settings.appointmentReduced,
                isCompact: settings.isCompact,
                sortedIndex: settings.sortedIndex,
                cellWidth: this._cellWidth,
                cellHeight: this._cellHeight,
                resizableConfig: this._resizableConfig(appointmentData, settings)
            });
            var deferredColor = this._paintAppointment($appointment, settings.groupIndex);
            if (settings.virtual) {
                deferredColor.done($.proxy(function(color) {
                    this._processVirtualAppointment(settings, $appointment, appointmentData, color)
                }, this))
            }
            this._renderDraggable($appointment)
        },
        _applyResourceDataAttr: function($appointment) {
            this.notifyObserver("getResourcesFromItem", {
                itemData: this._getItemData($appointment),
                callback: function(resources) {
                    if (resources) {
                        $.each(resources, function(name, values) {
                            var attr = "data-" + name.toLowerCase() + "-";
                            for (var i = 0; i < values.length; i++) {
                                $appointment.attr(attr + commonUtils.normalizeKey(values[i]), true)
                            }
                        })
                    }
                }
            })
        },
        _resizableConfig: function(appointmentData, itemSetting) {
            return {
                area: this._calculateResizableArea(itemSetting, appointmentData),
                onResizeStart: $.proxy(function(e) {
                    this._$currentAppointment = $(e.element);
                    this._initialSize = {
                        width: e.width,
                        height: e.height
                    };
                    this._initialCoordinates = translator.locate(e.element)
                }, this),
                onResizeEnd: $.proxy(function(e) {
                    if (this._escPressed) {
                        e.jQueryEvent.cancel = true;
                        return
                    }
                    this._resizeEndHandler(e)
                }, this)
            }
        },
        _calculateResizableArea: function(itemSetting, appointmentData) {
            var area = this.element().closest(".dx-scrollable-content"),
                allDay = this._renderingStrategy.isAllDay(appointmentData);
            this.notifyObserver("getResizableAppointmentArea", {
                coordinates: {
                    left: itemSetting.left,
                    top: 0
                },
                allDay: allDay,
                callback: function(result) {
                    if (result) {
                        area = result
                    }
                }
            });
            return area
        },
        _resizeEndHandler: function(e) {
            var itemData = this._getItemData(e.element),
                startDate = this._getStartDate(itemData),
                endDate = this._getEndDate(itemData);
            var dateRange = this._getDateRange(e, startDate, endDate);
            var updatedDates = {};
            this.invoke("setField", "startDate", updatedDates, new Date(dateRange[0]));
            this.invoke("setField", "endDate", updatedDates, new Date(dateRange[1]));
            var data = $.extend({}, itemData, updatedDates);
            this.notifyObserver("updateAppointmentAfterResize", {
                target: itemData,
                data: data,
                $appointment: e.element
            })
        },
        _getDateRange: function(e, startDate, endDate) {
            var itemData = this._getItemData(e.element),
                deltaTime = this._renderingStrategy.getDeltaTime(e, this._initialSize, itemData),
                renderingStrategy = this.option("renderingStrategy"),
                cond = false;
            if ("vertical" !== renderingStrategy || this._renderingStrategy.isAllDay(itemData)) {
                cond = this.option("rtlEnabled") ? e.handles.right : e.handles.left
            } else {
                cond = e.handles.top
            }
            var startTime = cond ? startDate.getTime() - deltaTime : startDate.getTime(),
                endTime = cond ? endDate.getTime() : endDate.getTime() + deltaTime;
            return [startTime, endTime]
        },
        _paintAppointment: function($appointment, groupIndex) {
            var res = $.Deferred();
            this.notifyObserver("getAppointmentColor", {
                itemData: this._getItemData($appointment),
                groupIndex: groupIndex,
                callback: function(d) {
                    d.done(function(color) {
                        if (color) {
                            $appointment.css("background-color", color)
                        }
                        res.resolve(color)
                    })
                }
            });
            return res.promise()
        },
        _renderDraggable: function($appointment) {
            if (!this.option("allowDrag")) {
                return
            }
            var draggableArea, that = this,
                appointmentData = that._getItemData($appointment),
                isAllDay = this._renderingStrategy.isAllDay(appointmentData),
                $fixedContainer = this.option("fixedContainer"),
                correctCoordinates = function($element, isFixedContainer) {
                    var coordinates = translator.locate($element);
                    that.notifyObserver("correctAppointmentCoordinates", {
                        coordinates: coordinates,
                        allDay: isAllDay,
                        isFixedContainer: isFixedContainer,
                        callback: function(result) {
                            if (result) {
                                coordinates = result
                            }
                        }
                    });
                    translator.move($appointment, coordinates)
                };
            this.notifyObserver("getDraggableAppointmentArea", {
                callback: function(result) {
                    if (result) {
                        draggableArea = result
                    }
                }
            });
            this._createComponent($appointment, Draggable, {
                area: draggableArea,
                boundOffset: that._calculateBoundOffset(),
                onDragStart: function(args) {
                    var e = args.jQueryEvent;
                    that._skipDraggableRestriction(e);
                    that.notifyObserver("hideAppointmentTooltip");
                    that.notifyObserver("getDragEventTargetElements", {
                        callback: function(result) {
                            if (result) {
                                e.targetElements = result
                            }
                        }
                    });
                    $fixedContainer.append($appointment);
                    that._$currentAppointment = $(args.element);
                    that._initialSize = {
                        width: args.width,
                        height: args.height
                    };
                    that._initialCoordinates = translator.locate(args.element)
                },
                onDrag: function(args) {
                    correctCoordinates(args.element)
                },
                onDragEnd: function(args) {
                    correctCoordinates(args.element, true);
                    var $container = that._getAppointmentContainer(isAllDay);
                    $container.append($appointment);
                    if (this._escPressed) {
                        args.jQueryEvent.cancel = true;
                        return
                    }
                    that._dragEndHandler(args)
                }
            })
        },
        _calculateBoundOffset: function() {
            var result = {
                top: 0
            };
            this.notifyObserver("getBoundOffset", {
                callback: function(offset) {
                    result = offset
                }
            });
            return result
        },
        _skipDraggableRestriction: function(e) {
            if (this.option("rtlEnabled")) {
                e.maxLeftOffset = null
            } else {
                e.maxRightOffset = null
            }
            e.maxBottomOffset = null
        },
        _dragEndHandler: function(e) {
            var itemData = this._getItemData(e.element),
                coordinates = this._initialCoordinates;
            this._normalizeAppointmentDates(itemData);
            this.notifyObserver("updateAppointmentAfterDrag", {
                data: itemData,
                $appointment: e.element,
                coordinates: coordinates
            })
        },
        _virtualAppointments: {},
        _processVirtualAppointment: function(appointmentSetting, $appointment, appointmentData, color) {
            var virtualAppointment = appointmentSetting.virtual,
                virtualGroupIndex = virtualAppointment.index;
            if (!commonUtils.isDefined(this._virtualAppointments[virtualGroupIndex])) {
                this._virtualAppointments[virtualGroupIndex] = {
                    coordinates: {
                        top: virtualAppointment.top,
                        left: virtualAppointment.left
                    },
                    items: {
                        data: [],
                        colors: []
                    },
                    isAllDay: virtualAppointment.isAllDay,
                    buttonColor: color
                }
            }
            this._virtualAppointments[virtualGroupIndex].items.data.push(appointmentData);
            this._virtualAppointments[virtualGroupIndex].items.colors.push(color);
            $appointment.remove()
        },
        _renderContentImpl: function() {
            this.callBase();
            this._renderDropDownAppointments()
        },
        _renderDropDownAppointments: function() {
            var buttonWidth = this._renderingStrategy.getCompactAppointmentGroupMaxWidth(),
                rtlOffset = 0,
                that = this;
            if (this.option("rtlEnabled")) {
                rtlOffset = buttonWidth
            }
            $.each(this._virtualAppointments, $.proxy(function(groupIndex, appointment) {
                var virtualGroup = this._virtualAppointments[groupIndex],
                    virtualItems = virtualGroup.items,
                    virtualCoordinates = virtualGroup.coordinates,
                    $container = virtualGroup.isAllDay ? this.option("allDayContainer") : this.element(),
                    left = virtualCoordinates.left;
                this.notifyObserver("renderDropDownAppointments", {
                    $container: $container,
                    coordinates: {
                        top: virtualCoordinates.top,
                        left: left + rtlOffset
                    },
                    items: virtualItems,
                    buttonColor: virtualGroup.buttonColor,
                    itemTemplate: this.option("itemTemplate"),
                    buttonWidth: buttonWidth,
                    onAppointmentClick: function(args) {
                        var mappedAppointmentFields = that._mapAppointmentFields(args);
                        that._itemJQueryEventHandler(args.jQueryEvent, "onItemClick", mappedAppointmentFields)
                    }
                })
            }, this))
        },
        _sortAppointmentsByStartDate: function(appointments) {
            appointments.sort($.proxy(function(a, b) {
                var result = 0,
                    firstDate = dateUtils.makeDate(this.invoke("getField", "startDate", a)).getTime(),
                    secondDate = dateUtils.makeDate(this.invoke("getField", "startDate", b)).getTime();
                if (firstDate < secondDate) {
                    result = -1
                }
                if (firstDate > secondDate) {
                    result = 1
                }
                return result
            }, this))
        },
        _processRecurrenceAppointment: function(appointment, index, skipLongAppointments) {
            var recurrenceRule = this.invoke("getField", "recurrenceRule", appointment),
                result = {
                    parts: [],
                    indexes: []
                };
            if (recurrenceRule) {
                var startDate = dateUtils.makeDate(this.invoke("getField", "startDate", appointment)),
                    endDate = dateUtils.makeDate(this.invoke("getField", "endDate", appointment)),
                    appointmentDuration = endDate.getTime() - startDate.getTime(),
                    recurrenceException = this.invoke("getField", "recurrenceException", appointment),
                    startViewDate = this.invoke("getStartViewDate"),
                    endViewDate = this.invoke("getEndViewDate"),
                    recurrentDates = recurrenceUtils.getDatesByRecurrence(recurrenceRule, startDate, startViewDate, endViewDate, recurrenceException),
                    recurrentDateCount = recurrentDates.length;
                for (var i = 0; i < recurrentDateCount; i++) {
                    var appointmentPart = this._applyStartDateToObj(recurrentDates[i], {
                        appointmentData: appointment
                    });
                    result.parts.push(appointmentPart);
                    this._applyEndDateToObj(new Date(recurrentDates[i].getTime() + appointmentDuration), appointmentPart);
                    if (!skipLongAppointments) {
                        this._processLongAppointment(appointmentPart, result)
                    }
                }
                result.indexes.push(index)
            }
            return result
        },
        _processLongAppointment: function(appointment, result) {
            var parts = this.splitAppointmentByDay(appointment),
                partCount = parts.length,
                endViewDate = this.invoke("getEndViewDate").getTime(),
                startViewDate = this.invoke("getStartViewDate").getTime(),
                startDateTimeZone = this.invoke("getField", "startDateTimeZone", appointment);
            result = result || {
                parts: []
            };
            if (partCount > 1) {
                for (var i = 1; i < partCount; i++) {
                    var startDate = this.invoke("getField", "startDate", parts[i]).getTime();
                    startDate = this.invoke("convertDateByTimezone", startDate, startDateTimeZone);
                    if (startDate < endViewDate && startDate > startViewDate) {
                        result.parts.push(parts[i])
                    }
                }
            }
            return result
        },
        _reduceRecurrenceAppointments: function(recurrenceIndexes, appointments) {
            $.each(recurrenceIndexes, function(i, index) {
                appointments.splice(index - i, 1)
            })
        },
        _combineAppointments: function(appointments, additionalAppointments) {
            if (additionalAppointments.length) {
                $.merge(appointments, additionalAppointments)
            }
            this._sortAppointmentsByStartDate(appointments);
            $.each(appointments, function(i, appointment) {
                if (appointment.appointmentData) {
                    appointments[i] = appointment.appointmentData
                }
            })
        },
        _applyStartDateToObj: function(startDate, obj) {
            if (obj.appointmentData.appointmentData) {
                obj = obj.appointmentData
            }
            this.invoke("setField", "startDate", obj, startDate);
            return obj
        },
        _applyEndDateToObj: function(endDate, obj) {
            if (obj.appointmentData.appointmentData) {
                obj = obj.appointmentData
            }
            this.invoke("setField", "endDate", obj, endDate);
            return obj
        },
        updateDraggablesBoundOffsets: function() {
            if (this.option("allowDrag")) {
                this.element().find("." + APPOINTMENT_ITEM_CLASS).each($.proxy(function(_, appointmentElement) {
                    var $appointment = $(appointmentElement),
                        appointmentData = this._getItemData($appointment);
                    if (!this._renderingStrategy.isAllDay(appointmentData)) {
                        Draggable.getInstance($appointment).option("boundOffset", this._calculateBoundOffset())
                    }
                }, this))
            }
        },
        moveAppointmentBack: function() {
            var $appointment = this._$currentAppointment,
                size = this._initialSize,
                coords = this._initialCoordinates;
            if ($appointment) {
                if (coords) {
                    translator.move($appointment, coords);
                    delete this._initialSize
                }
                if (size) {
                    $appointment.outerWidth(size.width);
                    $appointment.outerHeight(size.height);
                    delete this._initialCoordinates
                }
            }
        },
        focus: function() {
            var $appointment = this._$currentAppointment;
            if ($appointment) {
                this.option("focusedElement", $appointment);
                this.option("focusedElement").focus()
            }
        },
        splitAppointmentByDay: function(appointment) {
            var startDate = dateUtils.makeDate(this.invoke("getField", "startDate", appointment)),
                endDate = dateUtils.makeDate(this.invoke("getField", "endDate", appointment)),
                startDateTimeZone = this.invoke("getField", "startDateTimeZone", appointment),
                endDateTimeZone = this.invoke("getField", "endDateTimeZone", appointment),
                maxAllowedDate = this.invoke("getEndViewDate");
            startDate = this.invoke("convertDateByTimezone", startDate, startDateTimeZone);
            endDate = this.invoke("convertDateByTimezone", endDate, endDateTimeZone);
            var result = [this._applyStartDateToObj(new Date(startDate), {
                appointmentData: appointment
            })];
            var currentDate = startDate.getDate();
            startDate.setHours(startDate.getHours() + 1);
            while (startDate.getTime() < endDate.getTime() - 1 && startDate.getTime() < maxAllowedDate.getTime()) {
                if (currentDate !== startDate.getDate()) {
                    result.push(this._applyStartDateToObj(new Date(startDate), {
                        appointmentData: appointment
                    }))
                }
                currentDate = startDate.getDate();
                startDate.setHours(startDate.getHours() + 1)
            }
            return result
        }
    }).include(publisherMixin);
    registerComponent("dxSchedulerAppointments", SchedulerAppointments);
    module.exports = SchedulerAppointments
});
