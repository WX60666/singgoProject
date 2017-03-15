/** 
 * DevExtreme (data/custom_store.js)
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
        dataUtils = require("./utils"),
        errors = require("./errors").errors,
        Store = require("./abstract_store");
    var TOTAL_COUNT = "totalCount",
        LOAD = "load",
        BY_KEY = "byKey",
        INSERT = "insert",
        UPDATE = "update",
        REMOVE = "remove";

    function isPromise(obj) {
        return obj && $.isFunction(obj.then)
    }

    function trivialPromise(value) {
        return $.Deferred().resolve(value).promise()
    }

    function ensureRequiredFuncOption(name, obj) {
        if (!$.isFunction(obj)) {
            throw errors.Error("E4011", name)
        }
    }

    function throwInvalidUserFuncResult(name) {
        throw errors.Error("E4012", name)
    }

    function createUserFuncFailureHandler(pendingDeferred) {
        function errorMessageFromXhr(promiseArguments) {
            var xhr = promiseArguments[0],
                textStatus = promiseArguments[1];
            if (!xhr || !xhr.getResponseHeader) {
                return null
            }
            return dataUtils.errorMessageFromXhr(xhr, textStatus)
        }
        return function(arg) {
            var error;
            if (arg instanceof Error) {
                error = arg
            } else {
                error = new Error(errorMessageFromXhr(arguments) || arg && String(arg) || "Unknown error")
            }
            pendingDeferred.reject(error)
        }
    }
    var CustomStore = Store.inherit({
        ctor: function(options) {
            options = options || {};
            this.callBase(options);
            this._useDefaultSearch = !!options.useDefaultSearch;
            this._loadFunc = options[LOAD];
            this._totalCountFunc = options[TOTAL_COUNT];
            this._byKeyFunc = options[BY_KEY];
            this._insertFunc = options[INSERT];
            this._updateFunc = options[UPDATE];
            this._removeFunc = options[REMOVE]
        },
        createQuery: function() {
            throw errors.Error("E4010")
        },
        _totalCountImpl: function(options) {
            var userResult, userFunc = this._totalCountFunc,
                d = $.Deferred();
            ensureRequiredFuncOption(TOTAL_COUNT, userFunc);
            userResult = userFunc.apply(this, [options]);
            if (!isPromise(userResult)) {
                userResult = Number(userResult);
                if (!isFinite(userResult)) {
                    throwInvalidUserFuncResult(TOTAL_COUNT)
                }
                userResult = trivialPromise(userResult)
            }
            userResult.then(function(count) {
                d.resolve(Number(count))
            }, createUserFuncFailureHandler(d));
            return this._addFailHandlers(d.promise())
        },
        _loadImpl: function(options) {
            var userResult, userFunc = this._loadFunc,
                d = $.Deferred();
            ensureRequiredFuncOption(LOAD, userFunc);
            userResult = userFunc.apply(this, [options]);
            if ($.isArray(userResult)) {
                userResult = trivialPromise(userResult)
            } else {
                if (null === userResult || void 0 === userResult) {
                    userResult = trivialPromise([])
                } else {
                    if (!isPromise(userResult)) {
                        throwInvalidUserFuncResult(LOAD)
                    }
                }
            }
            userResult.then(function(data, extra) {
                d.resolve(data, extra)
            }, createUserFuncFailureHandler(d));
            return this._addFailHandlers(d.promise())
        },
        _byKeyImpl: function(key, extraOptions) {
            var userResult, userFunc = this._byKeyFunc,
                d = $.Deferred();
            ensureRequiredFuncOption(BY_KEY, userFunc);
            userResult = userFunc.apply(this, [key, extraOptions]);
            if (!isPromise(userResult)) {
                userResult = trivialPromise(userResult)
            }
            userResult.then(function(obj) {
                d.resolve(obj)
            }, createUserFuncFailureHandler(d));
            return d.promise()
        },
        _insertImpl: function(values) {
            var userResult, userFunc = this._insertFunc,
                d = $.Deferred();
            ensureRequiredFuncOption(INSERT, userFunc);
            userResult = userFunc.apply(this, [values]);
            if (!isPromise(userResult)) {
                userResult = trivialPromise(userResult)
            }
            userResult.then(function(newKey) {
                d.resolve(values, newKey)
            }, createUserFuncFailureHandler(d));
            return d.promise()
        },
        _updateImpl: function(key, values) {
            var userResult, userFunc = this._updateFunc,
                d = $.Deferred();
            ensureRequiredFuncOption(UPDATE, userFunc);
            userResult = userFunc.apply(this, [key, values]);
            if (!isPromise(userResult)) {
                userResult = trivialPromise()
            }
            userResult.then(function() {
                d.resolve(key, values)
            }, createUserFuncFailureHandler(d));
            return d.promise()
        },
        _removeImpl: function(key) {
            var userResult, userFunc = this._removeFunc,
                d = $.Deferred();
            ensureRequiredFuncOption(REMOVE, userFunc);
            userResult = userFunc.apply(this, [key]);
            if (!isPromise(userResult)) {
                userResult = trivialPromise()
            }
            userResult.then(function() {
                d.resolve(key)
            }, createUserFuncFailureHandler(d));
            return d.promise()
        }
    });
    module.exports = CustomStore
});
