/** 
 * DevExtreme (integration/angular/components.js)
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
        MemorizedCallbacks = require("../../core/memorized_callbacks"),
        ngModule = require("./module"),
        iconUtils = require("../../core/utils/icon"),
        inflector = require("../../core/utils/inflector"),
        errors = require("../../core/errors");
    ngModule.directive("dxIcon", ["$compile", function($compile) {
        return {
            restrict: "E",
            link: function($scope, $element, $attrs) {
                var html = iconUtils.getImageContainer($scope.dxTemplateModel.icon || $scope.dxTemplateModel.iconSrc);
                if (html) {
                    var e = $compile(html.get(0))($scope);
                    $element.replaceWith(e)
                }
            }
        }
    }]);
    ngModule.directive("dxPolymorphWidget", ["$compile", function($compile) {
        return {
            restrict: "E",
            scope: {
                name: "=",
                options: "="
            },
            link: function($scope, $element, $attrs) {
                var widgetName = $scope.name;
                if (!widgetName) {
                    return
                }
                if ("button" === widgetName || "tabs" === widgetName || "dropDownMenu" === widgetName) {
                    var depricatedName = widgetName;
                    widgetName = inflector.camelize("dx-" + widgetName);
                    errors.log("W0001", "dxToolbar - 'widget' item field", depricatedName, "16.1", "Use: '" + widgetName + "' instead")
                }
                var markup = $("<div " + inflector.dasherize(widgetName) + '="options">').get(0);
                $element.after(markup);
                $compile(markup)($scope)
            }
        }
    }]);
    ngModule.service("dxDigestCallbacks", ["$rootScope", function($rootScope) {
        var begin = new MemorizedCallbacks,
            end = new MemorizedCallbacks;
        var digestPhase = false;
        $rootScope.$watch(function() {
            if (digestPhase) {
                return
            }
            digestPhase = true;
            begin.fire();
            $rootScope.$$postDigest(function() {
                digestPhase = false;
                end.fire()
            })
        });
        return {
            begin: begin,
            end: end
        }
    }])
});
