/** 
 * DevExtreme (viz/core/data_source.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var dataSourceBaseModule = require("../../data/data_source/data_source"),
        _isArray = require("../../core/utils/common").isArray;

    function createDataSource(options) {
        var ops = dataSourceBaseModule.normalizeDataSourceOptions(options);
        "paginate" in ops || (ops.paginate = false);
        return new dataSourceBaseModule.DataSource(ops)
    }

    function DataSource(callback) {
        this._callback = callback;
        this._items = this._ds = null;
        this._isShared = false
    }
    DataSource.prototype = {
        constructor: DataSource,
        dispose: function() {
            this._reset()
        },
        isLoaded: function() {
            return !this._ds || this._ds.isLoaded()
        },
        items: function() {
            return this._ds ? this._ds.items() : this._items
        },
        _reset: function() {
            var that = this;
            that._items = null;
            if (that._ds) {
                if (that._isShared) {
                    that._ds.off("changed", that._callback);
                    that._ds.off("loadError", that._callback)
                } else {
                    that._ds.dispose()
                }
                that._ds = null;
                that._isShared = false
            }
        },
        update: function(value) {
            var that = this;
            that._reset();
            if (!value || _isArray(value)) {
                that._items = value || null;
                that._callback()
            } else {
                that._isShared = value instanceof dataSourceBaseModule.DataSource;
                that._ds = that._isShared ? value : createDataSource(value);
                that._ds.on({
                    changed: that._callback,
                    loadError: that._callback
                });
                if (that._ds.isLoaded()) {
                    that._callback()
                } else {
                    that._ds.load()
                }
            }
        }
    };
    exports.DataSource = DataSource;
    exports.plugin = {
        name: "data_source",
        init: function() {
            var that = this;
            that._dataSource = new exports.DataSource(function() {
                that._dataSourceChangedHandler()
            })
        },
        dispose: function() {
            this._dataSource.dispose()
        },
        members: {
            _updateDataSource: function() {
                this._dataSource.update(this.option("dataSource"))
            }
        }
    }
});
