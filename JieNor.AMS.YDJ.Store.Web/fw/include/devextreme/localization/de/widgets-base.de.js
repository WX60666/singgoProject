/** 
 * DevExtreme (localization/de/widgets-base.de.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: 
 */
"use strict";
define(function(require, exports, module) {
    ! function(root, factory) {
        if ("function" === typeof define && define.amd) {
            define(function(require, exports, module) {
                factory(require("../message"))
            })
        } else {
            factory(DevExpress.localization.message)
        }
    }(this, function(message) {
        message.load({
            de: {
                "dxLookup-searchPlaceholder": "Minimale Anzahl Zeichen: {0}",
                "dxList-pullingDownText": "Zum Aktualisieren nach unten ziehen",
                "dxList-pulledDownText": "Zum Aktualisieren loslassen",
                "dxList-refreshingText": "Aktualisiere...",
                "dxList-pageLoadingText": "Laden...",
                "dxList-nextButtonText": "Mehr",
                "dxList-selectAll": "Alles auswählen",
                "dxListEditDecorator-delete": "Entfernen",
                "dxListEditDecorator-more": "Mehr",
                "dxScrollView-pullingDownText": "Zum Aktualisieren nach unten ziehen",
                "dxScrollView-pulledDownText": "Zum Aktualisieren loslassen",
                "dxScrollView-refreshingText": "Aktualisiere...",
                "dxScrollView-reachBottomText": "Laden...",
                "dxDateBox-simulatedDataPickerTitleTime": "Zeit auswählen",
                "dxDateBox-simulatedDataPickerTitleDate": "Datum auswählen",
                "dxDateBox-simulatedDataPickerTitleDateTime": "Datum und Zeit auswählen",
                "dxDateBox-validation-datetime": "Der Wert muss ein Datum oder eine Uhrzeit sein",
                "dxFileUploader-selectFile": "Datei auswählen",
                "dxFileUploader-dropFile": "oder hierher ziehen",
                "dxFileUploader-bytes": "Bytes",
                "dxFileUploader-kb": "kb",
                "dxFileUploader-Mb": "Mb",
                "dxFileUploader-Gb": "Gb",
                "dxFileUploader-upload": "Hochladen",
                "dxFileUploader-uploaded": "Hochgeladen",
                "dxFileUploader-readyToUpload": "Bereit zum hochladen",
                "dxFileUploader-uploadFailedMessage": "Fehler beim hochladen",
                "dxRangeSlider-ariaFrom": "Von",
                "dxRangeSlider-ariaTill": "Bis",
                "dxSwitch-onText": "EIN",
                "dxSwitch-offText": "AUS",
                "dxForm-optionalMark": "optional",
                "dxForm-requiredMessage": "{0} ist ein Pflichtfeld",
                "dxNumberBox-invalidValueMessage": "Der Wert muss eine Zahl sein"
            }
        })
    })
});
