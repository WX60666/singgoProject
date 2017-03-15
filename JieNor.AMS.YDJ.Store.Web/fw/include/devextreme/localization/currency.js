/** 
 * DevExtreme (localization/currency.js)
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
        numberLocalization = require("./number");
    numberLocalization.inject({
        _formatNumberCore: function(value, format, formatConfig) {
            if ("currency" === format) {
                formatConfig.precision = formatConfig.precision || 0;
                return this.getCurrencySymbol().symbol + this.format(value, $.extend({}, formatConfig, {
                    type: "fixedpoint"
                }))
            }
            return this.callBase.apply(this, arguments)
        },
        getCurrencySymbol: function(currency) {
            return {
                symbol: "$"
            }
        },
        getOpenXmlCurrencyFormat: function(currency) {
            return "$#,##0{0}_);\\($#,##0{0}\\)"
        }
    })
});
