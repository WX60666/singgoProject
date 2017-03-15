/** 
 * DevExtreme (client_exporter/pdf_creator.js)
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
        VERSION = require("../core/version"),
        imageCreator = require("./image_creator").imageCreator,
        isFunction = require("../core/utils/common").isFunction,
        mainPageTpl = "%PDF-1.3\r\n2 0 obj\r\n<</ProcSet[/PDF/ImageB/ImageC/ImageI]/XObject<</I0 5 0 R>>>>\r\nendobj\r\n4 0 obj\r\n<</Type/Pages/Kids[1 0 R]/Count 1>>\r\nendobj\r\n7 0 obj\r\n<</OpenAction[1 0 R /FitH null]/Type/Catalog/Pages 4 0 R/PageLayout/OneColumn>>\r\nendobj\r\n1 0 obj\r\n<</Type/Page/Resources 2 0 R/MediaBox[0 0 _width_ _height_]/Contents 3 0 R/Parent 4 0 R>>\r\nendobj\r\n",
        contentTpl = "3 0 obj\r\n<</Length 52>>stream\r\n0.20 w\n0 G\nq _width_ 0 0 _height_ 0.00 0.00 cm /I0 Do Q\r\nendstream\r\nendobj\r\n",
        infoTpl = "6 0 obj\r\n<</CreationDate _date_/Producer(DevExtreme _version_)>>\r\nendobj\r\n",
        imageStartTpl = "5 0 obj\r\n<</Type/XObject/Subtype/Image/Width _width_/Height _height_/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length _length_>>stream\r\n",
        imageEndTpl = "\r\nendstream\r\nendobj\r\n",
        trailerTpl = "trailer\r\n<<\r\n/Size 8\r\n/Root 7 0 R\r\n/Info 6 0 R\r\n>>\r\nstartxref\r\n_length_\r\n%%EOF",
        xrefTpl = "xref\r\n0 8\r\n0000000000 65535 f\r\n0000000241 00000 n\r\n0000000010 00000 n\r\n_main_ 00000 n\r\n0000000089 00000 n\r\n_image_ 00000 n\r\n_info_ 00000 n\r\n0000000143 00000 n\r\n",
        DEFAULT_MARGIN_X = 60,
        DEFAULT_MARGIN_Y = 40;
    var pad = function(str, len) {
        return str.length < len ? pad("0" + str, len) : str
    };
    var composePdfString = function(imageString, options, curDate) {
        var width = options.width + DEFAULT_MARGIN_X,
            height = options.height + DEFAULT_MARGIN_Y,
            widthPt = (.75 * width).toFixed(2),
            heightPt = (.75 * height).toFixed(2);
        var mainPage = mainPageTpl.replace("_width_", widthPt).replace("_height_", heightPt),
            content = contentTpl.replace("_width_", widthPt).replace("_height_", heightPt),
            info = infoTpl.replace("_date_", curDate).replace("_version_", VERSION),
            image = imageStartTpl.replace("_width_", width).replace("_height_", height).replace("_length_", imageString.length) + imageString + imageEndTpl,
            xref = getXref(mainPage.length, content.length, info.length);
        var mainContent = mainPage + content + info + image,
            trailer = trailerTpl.replace("_length_", mainContent.length);
        return mainContent + xref + trailer
    };
    var getXref = function(mainPageLength, contentLength, infoLength) {
        return xrefTpl.replace("_main_", pad(mainPageLength + "", 10)).replace("_info_", pad(mainPageLength + contentLength + "", 10)).replace("_image_", pad(mainPageLength + contentLength + infoLength + "", 10))
    };
    var getCurDate = function() {
        return new Date
    };
    var getBlob = function(binaryData) {
        var i = 0,
            dataArray = new Uint8Array(binaryData.length);
        for (; i < binaryData.length; i++) {
            dataArray[i] = binaryData.charCodeAt(i)
        }
        return new Blob([dataArray.buffer], {
            type: "application/pdf"
        })
    };
    var getBase64 = function(binaryData) {
        return window.btoa(binaryData)
    };
    exports.getData = function(data, options, callback) {
        var imageData = imageCreator.getImageData(data, $.extend({}, options, {
                format: "jpeg"
            })),
            blob = $.Deferred();
        blob.done(callback);
        $.when(imageData).done(function(imageString) {
            var binaryData = composePdfString(imageString, options, getCurDate()),
                pdfData = isFunction(window.Blob) ? getBlob(binaryData) : getBase64(binaryData);
            blob.resolve(pdfData)
        })
    }
});
