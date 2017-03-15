/** 
 * DevExtreme (integration/angular/component_registrator.js)
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
        Class = require("../../core/class"),
        Locker = require("../../core/utils/locker"),
        Widget = require("../../ui/widget/ui.widget"),
        Editor = require("../../ui/editor/editor"),
        NgTemplateProvider = require("./template_provider"),
        ngModule = require("./module"),
        removeEvent = require("../../core/remove_event"),
        CollectionWidget = require("../../ui/collection/ui.collection_widget.edit"),
        commonUtils = require("../../core/utils/common"),
        compileSetter = require("../../core/utils/data").compileSetter,
        compileGetter = require("../../core/utils/data").compileGetter,
        extendFromObject = require("../../core/utils/object").extendFromObject;
    var ITEM_ALIAS_ATTRIBUTE_NAME = "dxItemAlias",
        DEFAULT_MODEL_ALIAS = "dxTemplateModel",
        MODEL_IS_PRIMITIVE_FLAG_NAME = "dxTemplateModelIsPrimitive",
        SKIP_APPLY_ACTION_CATEGORIES = ["rendering"];
    var safeApply = function(func, scope) {
        if (scope.$root.$$phase) {
            return func(scope)
        } else {
            return scope.$apply(function() {
                return func(scope)
            })
        }
    };
    var ComponentBuilder = Class.inherit({
        ctor: function(options) {
            this._componentDisposing = $.Callbacks();
            this._optionChangedCallbacks = $.Callbacks();
            this._ngLocker = new Locker;
            this._scope = options.scope;
            this._$element = options.$element;
            this._$templates = options.$templates;
            this._componentClass = options.componentClass;
            this._parse = options.parse;
            this._compile = options.compile;
            this._itemAlias = options.itemAlias;
            this._transcludeFn = options.transcludeFn;
            this._digestCallbacks = options.dxDigestCallbacks;
            this._normalizeOptions(options.ngOptions);
            this._initComponentBindings();
            this._initComponent(this._scope);
            if (!options.ngOptions) {
                this._addOptionsStringWatcher(options.ngOptionsString)
            }
        },
        _addOptionsStringWatcher: function(optionsString) {
            var that = this;
            var clearOptionsStringWatcher = that._scope.$watch(optionsString, function(newOptions) {
                if (!newOptions) {
                    return
                }
                clearOptionsStringWatcher();
                that._normalizeOptions(newOptions);
                that._initComponentBindings();
                that._component.option(that._evalOptions(that._scope))
            });
            that._componentDisposing.add(clearOptionsStringWatcher)
        },
        _normalizeOptions: function(options) {
            var that = this;
            that._ngOptions = extendFromObject({}, options);
            if (!options) {
                return
            }
            if (!options.hasOwnProperty("bindingOptions") && options.bindingOptions) {
                that._ngOptions.bindingOptions = options.bindingOptions
            }
            if (options.bindingOptions) {
                $.each(options.bindingOptions, function(key, value) {
                    if ("string" === $.type(value)) {
                        that._ngOptions.bindingOptions[key] = {
                            dataPath: value
                        }
                    }
                })
            }
        },
        _initComponent: function(scope) {
            this._component = new this._componentClass(this._$element, this._evalOptions(scope));
            this._component._isHidden = true;
            this._handleDigestPhase()
        },
        _handleDigestPhase: function() {
            var that = this,
                beginUpdate = function() {
                    that._component.beginUpdate()
                },
                endUpdate = function() {
                    that._component.endUpdate()
                };
            that._digestCallbacks.begin.add(beginUpdate);
            that._digestCallbacks.end.add(endUpdate);
            that._componentDisposing.add(function() {
                that._digestCallbacks.begin.remove(beginUpdate);
                that._digestCallbacks.end.remove(endUpdate)
            })
        },
        _initComponentBindings: function() {
            var that = this,
                optionDependencies = {};
            if (!that._ngOptions.bindingOptions) {
                return
            }
            $.each(that._ngOptions.bindingOptions, function(optionPath, value) {
                var prevWatchMethod, clearWatcher, separatorIndex = optionPath.search(/\[|\./),
                    optionForSubscribe = separatorIndex > -1 ? optionPath.substring(0, separatorIndex) : optionPath,
                    valuePath = value.dataPath,
                    deepWatch = true,
                    forcePlainWatchMethod = false;
                if (void 0 !== value.deep) {
                    forcePlainWatchMethod = deepWatch = !!value.deep
                }
                if (!optionDependencies[optionForSubscribe]) {
                    optionDependencies[optionForSubscribe] = {}
                }
                optionDependencies[optionForSubscribe][optionPath] = valuePath;
                var watchCallback = function(newValue, oldValue) {
                    if (that._ngLocker.locked(optionPath)) {
                        return
                    }
                    that._ngLocker.obtain(optionPath);
                    that._component.option(optionPath, newValue);
                    updateWatcher();
                    if (that._component._optionValuesEqual(optionPath, oldValue, newValue) && that._ngLocker.locked(optionPath)) {
                        that._ngLocker.release(optionPath)
                    }
                };
                var updateWatcher = function() {
                    var watchMethod = $.isArray(that._scope.$eval(valuePath)) && !forcePlainWatchMethod ? "$watchCollection" : "$watch";
                    if (prevWatchMethod !== watchMethod) {
                        if (clearWatcher) {
                            clearWatcher()
                        }
                        clearWatcher = that._scope[watchMethod](valuePath, watchCallback, deepWatch);
                        prevWatchMethod = watchMethod
                    }
                };
                updateWatcher();
                that._componentDisposing.add(clearWatcher)
            });
            that._optionChangedCallbacks.add(function(args) {
                var optionName = args.name,
                    fullName = args.fullName,
                    component = args.component;
                if (that._ngLocker.locked(fullName)) {
                    that._ngLocker.release(fullName);
                    return
                }
                if (!optionDependencies || !optionDependencies[optionName]) {
                    return
                }
                that._ngLocker.obtain(fullName);
                safeApply(function(scope) {
                    $.each(optionDependencies[optionName], function(optionPath, valuePath) {
                        var value = component.option(optionPath);
                        that._parse(valuePath).assign(that._scope, value);
                        var scopeValue = that._parse(valuePath)(that._scope);
                        if (scopeValue !== value) {
                            that._component.option(optionPath, scopeValue)
                        }
                    })
                }, that._scope);
                var releaseOption = function() {
                    if (that._ngLocker.locked(fullName)) {
                        that._ngLocker.release(fullName)
                    }
                    that._digestCallbacks.end.remove(releaseOption)
                };
                that._digestCallbacks.end.add(releaseOption)
            })
        },
        _compilerByTemplate: function(template) {
            var that = this,
                scopeItemsPath = this._getScopeItemsPath();
            return function(options) {
                var $resultMarkup = $(template).clone(),
                    dataIsScope = options.model && options.model.constructor === that._scope.$root.constructor,
                    templateScope = dataIsScope ? options.model : options.noModel ? that._scope : that._createScopeWithData(options.model);
                if (scopeItemsPath) {
                    that._synchronizeScopes(templateScope, scopeItemsPath, options.index)
                }
                $resultMarkup.appendTo(options.container);
                if (!options.noModel) {
                    $resultMarkup.on("$destroy", function() {
                        var destroyAlreadyCalled = !templateScope.$parent;
                        if (destroyAlreadyCalled) {
                            return
                        }
                        templateScope.$destroy()
                    })
                }
                that._applyAsync(that._compile($resultMarkup, that._transcludeFn), templateScope);
                return $resultMarkup
            }
        },
        _applyAsync: function(func, scope) {
            var that = this;
            func(scope);
            if (!scope.$root.$$phase) {
                clearTimeout(that._renderingTimer);
                that._renderingTimer = setTimeout(function() {
                    scope.$apply()
                });
                that._componentDisposing.add(function() {
                    clearTimeout(that._renderingTimer)
                })
            }
        },
        _getScopeItemsPath: function() {
            if (this._componentClass.subclassOf(CollectionWidget) && this._ngOptions.bindingOptions && this._ngOptions.bindingOptions.items) {
                return this._ngOptions.bindingOptions.items.dataPath
            }
        },
        _createScopeWithData: function(data) {
            var newScope = this._scope.$new(),
                modelIsPrimitive = commonUtils.isDefined(data) && "object" !== typeof data && "function" !== typeof data;
            newScope[DEFAULT_MODEL_ALIAS] = data;
            newScope[MODEL_IS_PRIMITIVE_FLAG_NAME] = modelIsPrimitive;
            if (this._itemAlias) {
                newScope[this._itemAlias] = data
            }
            return newScope
        },
        _synchronizeScopes: function(itemScope, parentPrefix, itemIndex) {
            var that = this,
                fieldsToSynchronize = [DEFAULT_MODEL_ALIAS];
            if (that._itemAlias && "object" !== typeof itemScope[that._itemAlias]) {
                fieldsToSynchronize.push(that._itemAlias)
            }
            $.each(fieldsToSynchronize, function(i, fieldPath) {
                that._synchronizeScopeField({
                    parentScope: that._scope,
                    childScope: itemScope,
                    fieldPath: fieldPath,
                    parentPrefix: parentPrefix,
                    itemIndex: itemIndex
                })
            })
        },
        _synchronizeScopeField: function(args) {
            var parentScope = args.parentScope,
                childScope = args.childScope,
                fieldPath = args.fieldPath,
                parentPrefix = args.parentPrefix,
                itemIndex = args.itemIndex;
            var optionOuterPath, innerPathSuffix = fieldPath === (this._itemAlias || DEFAULT_MODEL_ALIAS) ? "" : "." + fieldPath,
                collectionField = void 0 !== itemIndex,
                optionOuterBag = [parentPrefix];
            if (collectionField) {
                optionOuterBag.push("[", itemIndex, "]")
            }
            optionOuterBag.push(innerPathSuffix);
            optionOuterPath = optionOuterBag.join("");
            var clearParentWatcher = parentScope.$watch(optionOuterPath, function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    compileSetter(fieldPath)(childScope, newValue)
                }
            });
            var clearItemWatcher = childScope.$watch(fieldPath, function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    if (collectionField && !compileGetter(parentPrefix)(parentScope)[itemIndex]) {
                        clearItemWatcher();
                        return
                    }
                    compileSetter(optionOuterPath)(parentScope, newValue)
                }
            });
            this._componentDisposing.add([clearParentWatcher, clearItemWatcher])
        },
        _evalOptions: function(scope) {
            var result = extendFromObject({}, this._ngOptions);
            delete result.bindingOptions;
            if (this._ngOptions.bindingOptions) {
                $.each(this._ngOptions.bindingOptions, function(key, value) {
                    result[key] = scope.$eval(value.dataPath)
                })
            }
            result._optionChangedCallbacks = this._optionChangedCallbacks;
            result._disposingCallbacks = this._componentDisposing;
            result.templateProvider = NgTemplateProvider;
            result.templateCompiler = $.proxy(function($template) {
                return this._compilerByTemplate($template)
            }, this);
            result.onActionCreated = function(component, action, config) {
                if (config && $.inArray(config.category, SKIP_APPLY_ACTION_CATEGORIES) > -1) {
                    return action
                }
                var wrappedAction = function() {
                    var that = this,
                        args = arguments;
                    if (!scope || !scope.$root || scope.$root.$$phase) {
                        return action.apply(that, args)
                    }
                    return safeApply(function() {
                        return action.apply(that, args)
                    }, scope)
                };
                return wrappedAction
            };
            result.nestedComponentOptions = function(component) {
                return {
                    templatesRenderAsynchronously: true,
                    templateCompiler: component.option("templateCompiler"),
                    modelByElement: component.option("modelByElement"),
                    onActionCreated: component.option("onActionCreated"),
                    nestedComponentOptions: component.option("nestedComponentOptions")
                }
            };
            result.templatesRenderAsynchronously = true;
            result.watchMethod = function(watchValue, callback, options) {
                var skipCallback = options.skipImmediate;
                var disposeWatcher = scope.$watch(watchValue, function(newValue) {
                    if (!skipCallback) {
                        callback(newValue)
                    }
                    skipCallback = false
                }, options.deep);
                $(options.disposeWithElement).on(removeEvent, function() {
                    disposeWatcher()
                })
            };
            result.modelByElement = function() {
                return scope
            };
            return result
        }
    });
    ComponentBuilder = ComponentBuilder.inherit({
        ctor: function(options) {
            this._componentName = options.componentName;
            this._ngModel = options.ngModel;
            this._ngModelController = options.ngModelController;
            this.callBase.apply(this, arguments)
        },
        _isNgModelRequired: function() {
            return this._componentClass.subclassOf(Editor) && this._ngModel
        },
        _initComponentBindings: function() {
            this.callBase.apply(this, arguments);
            this._initNgModelBinding()
        },
        _initNgModelBinding: function() {
            if (!this._isNgModelRequired()) {
                return
            }
            var that = this;
            var clearNgModelWatcher = this._scope.$watch(this._ngModel, function(newValue, oldValue) {
                if (that._ngLocker.locked(that._ngModelOption())) {
                    return
                }
                if (newValue === oldValue) {
                    return
                }
                that._component.option(that._ngModelOption(), newValue)
            });
            that._optionChangedCallbacks.add(function(args) {
                that._ngLocker.obtain(that._ngModelOption());
                try {
                    if (args.name !== that._ngModelOption()) {
                        return
                    }
                    that._ngModelController.$setViewValue(args.value)
                } finally {
                    that._ngLocker.release(that._ngModelOption())
                }
            });
            this._componentDisposing.add(clearNgModelWatcher)
        },
        _ngModelOption: function() {
            if ($.inArray(this._componentName, ["dxFileUploader", "dxTagBox"]) > -1) {
                return "values"
            }
            return "value"
        },
        _evalOptions: function() {
            if (!this._isNgModelRequired()) {
                return this.callBase.apply(this, arguments)
            }
            var result = this.callBase.apply(this, arguments);
            result[this._ngModelOption()] = this._parse(this._ngModel)(this._scope);
            return result
        }
    });
    var registeredComponents = {};
    var registerComponentDirective = function(name) {
        var priority = "dxValidator" !== name ? 1 : 10;
        ngModule.directive(name, ["$compile", "$parse", "dxDigestCallbacks", function($compile, $parse, dxDigestCallbacks) {
            return {
                restrict: "A",
                require: "^?ngModel",
                priority: priority,
                compile: function($element) {
                    var componentClass = registeredComponents[name],
                        $content = componentClass.subclassOf(Widget) ? $element.contents().detach() : null;
                    return function(scope, $element, attrs, ngModelController, transcludeFn) {
                        $element.append($content);
                        safeApply(function() {
                            new ComponentBuilder({
                                componentClass: componentClass,
                                componentName: name,
                                compile: $compile,
                                parse: $parse,
                                $element: $element,
                                scope: scope,
                                ngOptionsString: attrs[name],
                                ngOptions: attrs[name] ? scope.$eval(attrs[name]) : {},
                                ngModel: attrs.ngModel,
                                ngModelController: ngModelController,
                                transcludeFn: transcludeFn,
                                itemAlias: attrs[ITEM_ALIAS_ATTRIBUTE_NAME],
                                dxDigestCallbacks: dxDigestCallbacks
                            })
                        }, scope)
                    }
                }
            }
        }])
    };
    registerComponent.callbacks.add(function(name, componentClass) {
        if (!registeredComponents[name]) {
            registerComponentDirective(name)
        }
        registeredComponents[name] = componentClass
    })
});
