/** 
 * DevExtreme (viz/range_selector/theme_manager.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var BaseThemeManager = require("../core/base_theme_manager").BaseThemeManager;
    exports.ThemeManager = BaseThemeManager.inherit({
        _themeSection: "rangeSelector",
        _fontFields: ["scale.label.font", "sliderMarker.font", "loadingIndicator.font", "export.font", "title.font", "title.subtitle.font"]
    })
});
