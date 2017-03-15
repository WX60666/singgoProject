/** 
 * DevExtreme (ui/validation/validation_mixin.js)
 * Version: 16.1.8
 * Build date: Mon Nov 14 2016
 *
 * Copyright (c) 2012 - 2016 Developer Express Inc. ALL RIGHTS RESERVED
 * EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
 * MAY BE USED WITH: DevExtreme Complete, DevExtreme Mobile, DevExtreme Web
 */
"use strict";
define(function(require, exports, module) {
    var ValidationMixin = {
        _findGroup: function() {
            var $dxGroup, group = this.option("validationGroup");
            if (!group) {
                $dxGroup = this.element().parents(".dx-validationgroup:first");
                if ($dxGroup.length) {
                    group = $dxGroup.dxValidationGroup("instance")
                } else {
                    group = this._modelByElement(this.element())
                }
            }
            return group
        }
    };
    module.exports = ValidationMixin
});
