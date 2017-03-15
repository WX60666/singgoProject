/** 
 * DevExtreme (viz/gauges/theme_manager.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var $ = require("jquery"),
        _extend = $.extend,
        BaseThemeManager = require("../core/base_theme_manager").BaseThemeManager;
    var ThemeManager = BaseThemeManager.inherit({
        _themeSection: "gauge",
        _fontFields: ["scale.label.font", "valueIndicators.rangebar.text.font", "valueIndicators.textcloud.text.font", "title.font", "title.subtitle.font", "tooltip.font", "indicator.text.font", "loadingIndicator.font", "export.font"],
        _initializeTheme: function() {
            var subTheme, that = this;
            if (that._subTheme) {
                subTheme = _extend(true, {}, that._theme[that._subTheme], that._theme);
                _extend(true, that._theme, subTheme)
            }
            that.callBase.apply(that, arguments)
        }
    });
    module.exports = ThemeManager
});
