/** 
 * DevExtreme (viz/core/android.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var ANDROID5_LIGHT = "android5.light",
        themeModule = require("../themes"),
        registerThemeAlias = themeModule.registerThemeAlias,
        SECONDARY_TEXT_COLOR = "#767676",
        BORDER_COLOR = "#e8e8e8",
        BLACK = "#000000";
    themeModule.registerTheme({
        name: ANDROID5_LIGHT,
        backgroundColor: "#ffffff",
        primaryTitleColor: "#232323",
        secondaryTitleColor: SECONDARY_TEXT_COLOR,
        axisColor: "#d3d3d3",
        axisLabelColor: SECONDARY_TEXT_COLOR,
        tooltip: {
            color: BORDER_COLOR,
            font: {
                color: SECONDARY_TEXT_COLOR
            }
        },
        legend: {
            font: {
                color: BLACK
            }
        },
        pieIE8: {
            commonSeriesSettings: {
                pie: {
                    hoverStyle: {
                        border: {
                            color: BORDER_COLOR
                        }
                    },
                    selectionStyle: {
                        border: {
                            color: BORDER_COLOR
                        }
                    }
                },
                donut: {
                    hoverStyle: {
                        border: {
                            color: BORDER_COLOR
                        }
                    },
                    selectionStyle: {
                        border: {
                            color: BORDER_COLOR
                        }
                    }
                },
                doughnut: {
                    hoverStyle: {
                        border: {
                            color: BORDER_COLOR
                        }
                    },
                    selectionStyle: {
                        border: {
                            color: BORDER_COLOR
                        }
                    }
                }
            }
        },
        rangeSelector: {
            scale: {
                tick: {
                    color: BLACK,
                    opacity: .17
                },
                minorTick: {
                    color: BLACK,
                    opacity: .05
                }
            }
        }
    }, "generic.light");
    registerThemeAlias("android", ANDROID5_LIGHT);
    registerThemeAlias("android.holo-dark", ANDROID5_LIGHT);
    registerThemeAlias("android.holo-light", ANDROID5_LIGHT);
    registerThemeAlias("android.dark", ANDROID5_LIGHT);
    registerThemeAlias("android.light", ANDROID5_LIGHT)
});
