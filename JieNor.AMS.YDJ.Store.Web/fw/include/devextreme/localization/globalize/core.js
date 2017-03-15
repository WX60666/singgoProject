/** 
 * DevExtreme (localization/globalize/core.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var Globalize = require("globalize");
    if (Globalize && Globalize.load) {
        var likelySubtags = {
            supplemental: {
                version: {
                    _cldrVersion: "28",
                    _unicodeVersion: "8.0.0",
                    _number: "$Revision: 11965 $"
                },
                likelySubtags: {
                    en: "en-Latn-US",
                    de: "de-Latn-DE",
                    ru: "ru-Cyrl-RU",
                    ja: "ja-Jpan-JP"
                }
            }
        };
        if (!Globalize.locale()) {
            Globalize.load(likelySubtags);
            Globalize.locale("en")
        }
    }
});
