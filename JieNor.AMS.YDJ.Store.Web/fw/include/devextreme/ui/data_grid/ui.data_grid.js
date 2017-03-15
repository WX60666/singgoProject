/** 
 * DevExtreme (ui/data_grid/ui.data_grid.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var DataGrid = require("./ui.data_grid.base");
    module.exports = DataGrid;
    require("./ui.data_grid.state_storing");
    require("./ui.data_grid.selection");
    require("./ui.data_grid.column_chooser_module");
    require("./ui.data_grid.grouping_module");
    require("./ui.data_grid.master_detail_module");
    require("./ui.data_grid.editing");
    require("./ui.data_grid.validation_module");
    require("./ui.data_grid.virtual_scrolling_module");
    require("./ui.data_grid.filter_row");
    require("./ui.data_grid.header_filter");
    require("./ui.data_grid.search");
    require("./ui.data_grid.pager");
    require("./ui.data_grid.columns_resizing_reordering_module");
    require("./ui.data_grid.keyboard_navigation");
    require("./ui.data_grid.summary_module");
    require("./ui.data_grid.fixed_columns");
    require("./ui.data_grid.adaptivity");
    require("./ui.data_grid.export_controller")
});
