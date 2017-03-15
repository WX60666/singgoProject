/** 
 * DevExtreme (localization/de/core.de.js)
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
                Yes: "Ja",
                No: "Nein",
                Cancel: "Abbrechen",
                Clear: "Löschen",
                Done: "Fertig",
                Loading: "Laden...",
                Select: "Auswählen...",
                Search: "Suchen...",
                Back: "Zurück",
                OK: "OK",
                "dxCollectionWidget-noDataText": "Keine Daten verfügbar",
                "validation-required": "Pflichtfeld",
                "validation-required-formatted": "{0} ist ein Pflichtfeld",
                "validation-numeric": "Der Wert muss eine Zahl sein",
                "validation-numeric-formatted": "{0} muss eine Zahl sein",
                "validation-range": "Der Wert ist nicht im gültigen Bereich",
                "validation-range-formatted": "{0} ist nicht im gültigen Bereich",
                "validation-stringLength": "Die Länge des Wertes ist nicht korrekt",
                "validation-stringLength-formatted": "Die Länge von {0} ist nicht korrekt",
                "validation-custom": "Der Wert ist ungültig",
                "validation-custom-formatted": "{0} ist ungültig",
                "validation-compare": "Der Wert ist unpassend",
                "validation-compare-formatted": "{0} ist unpassend",
                "validation-pattern": "Der Wert passt nicht zum Muster",
                "validation-pattern-formatted": "{0} passt nicht zum Muster",
                "validation-email": "Die Email-Adresse ist ungültig",
                "validation-email-formatted": "{0} ist ungültig",
                "validation-mask": "Der Wert ist ungültig"
            }
        })
    })
});
