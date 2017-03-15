/** 
 * DevExtreme (ui/collection/ui.data_helper.js)
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
        DataSource = require("../../data/data_source/data_source").DataSource,
        normalizeDataSourceOptions = require("../../data/data_source/data_source").normalizeDataSourceOptions;
    var DATA_SOURCE_OPTIONS_METHOD = "_dataSourceOptions",
        DATA_SOURCE_CHANGED_METHOD = "_dataSourceChangedHandler",
        DATA_SOURCE_LOAD_ERROR_METHOD = "_dataSourceLoadErrorHandler",
        DATA_SOURCE_LOADING_CHANGED_METHOD = "_dataSourceLoadingChangedHandler";
    var DataHelperMixin = {
        postCtor: function() {
            this.on("disposing", function() {
                this._disposeDataSource()
            })
        },
        _refreshDataSource: function() {
            this._initDataSource();
            this._loadDataSource()
        },
        _initDataSource: function() {
            var widgetDataSourceOptions, dataSourceType, dataSourceOptions = this.option("dataSource");
            this._disposeDataSource();
            if (dataSourceOptions) {
                if (dataSourceOptions instanceof DataSource) {
                    this._isSharedDataSource = true;
                    this._dataSource = dataSourceOptions
                } else {
                    widgetDataSourceOptions = DATA_SOURCE_OPTIONS_METHOD in this ? this[DATA_SOURCE_OPTIONS_METHOD]() : {};
                    dataSourceType = this._dataSourceType ? this._dataSourceType() : DataSource;
                    this._dataSource = new dataSourceType($.extend(true, {}, widgetDataSourceOptions, normalizeDataSourceOptions(dataSourceOptions)))
                }
                this._addDataSourceHandlers()
            }
        },
        _addDataSourceHandlers: function() {
            if (DATA_SOURCE_CHANGED_METHOD in this) {
                this._addDataSourceChangeHandler()
            }
            if (DATA_SOURCE_LOAD_ERROR_METHOD in this) {
                this._addDataSourceLoadErrorHandler()
            }
            if (DATA_SOURCE_LOADING_CHANGED_METHOD in this) {
                this._addDataSourceLoadingChangedHandler()
            }
            this._addReadyWatcher()
        },
        _addReadyWatcher: function() {
            this._dataSource.on("loadingChanged", $.proxy(function(isLoading) {
                this._ready && this._ready(!isLoading)
            }, this))
        },
        _addDataSourceChangeHandler: function() {
            var dataSource = this._dataSource;
            this._proxiedDataSourceChangedHandler = $.proxy(function() {
                this[DATA_SOURCE_CHANGED_METHOD](dataSource.items())
            }, this);
            dataSource.on("changed", this._proxiedDataSourceChangedHandler)
        },
        _addDataSourceLoadErrorHandler: function() {
            this._proxiedDataSourceLoadErrorHandler = $.proxy(this[DATA_SOURCE_LOAD_ERROR_METHOD], this);
            this._dataSource.on("loadError", this._proxiedDataSourceLoadErrorHandler)
        },
        _addDataSourceLoadingChangedHandler: function() {
            this._proxiedDataSourceLoadingChangedHandler = $.proxy(this[DATA_SOURCE_LOADING_CHANGED_METHOD], this);
            this._dataSource.on("loadingChanged", this._proxiedDataSourceLoadingChangedHandler)
        },
        _loadDataSource: function() {
            if (this._dataSource) {
                var dataSource = this._dataSource;
                if (dataSource.isLoaded()) {
                    this._proxiedDataSourceChangedHandler && this._proxiedDataSourceChangedHandler()
                } else {
                    dataSource.load()
                }
            }
        },
        _loadSingle: function(key, value) {
            key = "this" === key ? this._dataSource.key() || "this" : key;
            return this._dataSource.loadSingle(key, value)
        },
        _isLastPage: function() {
            return !this._dataSource || this._dataSource.isLastPage() || !this._dataSource._pageSize
        },
        _isDataSourceLoading: function() {
            return this._dataSource && this._dataSource.isLoading()
        },
        _disposeDataSource: function() {
            if (this._dataSource) {
                if (this._isSharedDataSource) {
                    delete this._isSharedDataSource;
                    this._proxiedDataSourceChangedHandler && this._dataSource.off("changed", this._proxiedDataSourceChangedHandler);
                    this._proxiedDataSourceLoadErrorHandler && this._dataSource.off("loadError", this._proxiedDataSourceLoadErrorHandler);
                    this._proxiedDataSourceLoadingChangedHandler && this._dataSource.off("loadingChanged", this._proxiedDataSourceLoadingChangedHandler)
                } else {
                    this._dataSource.dispose()
                }
                delete this._dataSource;
                delete this._proxiedDataSourceChangedHandler;
                delete this._proxiedDataSourceLoadErrorHandler;
                delete this._proxiedDataSourceLoadingChangedHandler
            }
        }
    };
    module.exports = DataHelperMixin
});
