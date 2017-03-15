/** 
 * DevExtreme (localization/globalize/message.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    require("./core");
    var Globalize = require("globalize"),
        messageLocalization = require("../message");
    require("globalize/message");
    if (Globalize && Globalize.formatMessage) {
        var DEFAULT_LOCALE = "en";
        var originalLoadMessages = Globalize.loadMessages;
        Globalize.loadMessages = function(messages) {
            messageLocalization.load(messages)
        };
        var globalizeMessageLocalization = {
            ctor: function() {
                this.load(this._dictionary)
            },
            load: function(messages) {
                this.callBase(messages);
                originalLoadMessages(messages)
            },
            locale: function(locale) {
                if (!locale) {
                    return Globalize.locale().locale
                }
                Globalize.locale(locale)
            },
            getMessagesByLocales: function() {
                return Globalize.cldr.get("globalize-messages")
            },
            getFormatter: function(key, locale) {
                var currentLocale = locale || this.locale(),
                    formatter = this.callBase(key, locale);
                if (!formatter) {
                    formatter = this._formatterByGlobalize(key, locale)
                }
                if (!formatter && currentLocale !== DEFAULT_LOCALE) {
                    formatter = this.getFormatter(key, DEFAULT_LOCALE)
                }
                return formatter
            },
            _formatterByGlobalize: function(key, locale) {
                var result, currentGlobalize = !locale || locale === this.locale() ? Globalize : new Globalize(locale);
                if (this._messageLoaded(key, locale)) {
                    result = currentGlobalize.messageFormatter(key)
                }
                return result
            },
            _messageLoaded: function(key, locale) {
                var currentCldr = locale ? new Globalize(locale).cldr : Globalize.locale(),
                    value = currentCldr.get(["globalize-messages/{bundle}", key]);
                return void 0 !== value
            },
            _loadSingle: function(key, value, locale) {
                var data = {};
                data[locale] = {};
                data[locale][key] = value;
                this.load(data)
            }
        };
        messageLocalization.inject(globalizeMessageLocalization)
    }
});
