/** 
 * DevExtreme (client_exporter.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var fileSaver = require("./client_exporter/file_saver").fileSaver,
        _isFunction = require("./core/utils/common").isFunction;
    exports.export = function(data, options, getData) {
        if (!data) {
            return
        }
        var exportingAction = options.exportingAction,
            exportedAction = options.exportedAction,
            fileSavingAction = options.fileSavingAction,
            eventArgs = {
                fileName: options.fileName,
                format: options.format,
                cancel: false
            };
        _isFunction(exportingAction) && exportingAction(eventArgs);
        if (!eventArgs.cancel) {
            getData(data, options, function(blob) {
                _isFunction(exportedAction) && exportedAction();
                if (_isFunction(fileSavingAction)) {
                    eventArgs.data = blob;
                    fileSavingAction(eventArgs)
                }
                if (!eventArgs.cancel) {
                    fileSaver.saveAs(eventArgs.fileName, options.format, blob, options.proxyUrl)
                }
            })
        }
    };
    exports.fileSaver = fileSaver;
    exports.excel = {
        creator: require("./client_exporter/excel_creator").ExcelCreator,
        getData: require("./client_exporter/excel_creator").getData,
        formatConverter: require("./client_exporter/excel_creator").excelFormatConverter
    };
    exports.image = {
        creator: require("./client_exporter/image_creator").imageCreator,
        getData: require("./client_exporter/image_creator").getData
    };
    exports.pdf = {
        getData: require("./client_exporter/pdf_creator").getData
    };
    exports.svg = {
        creator: require("./client_exporter/svg_creator").svgCreator,
        getData: require("./client_exporter/svg_creator").getData
    }
});
