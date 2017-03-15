/** 
 * DevExtreme (localization/ja/core.ja.js)
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
            ja: {
                Yes: "はい",
                No: "いいえ",
                Cancel: "キャンセル",
                Clear: "クリア",
                Done: "完了",
                Loading: "読み込み中…",
                Select: "選択…",
                Search: "検索",
                Back: "戻る",
                OK: "OK",
                "dxCollectionWidget-noDataText": "表示するデータがありません。",
                "validation-required": "必須",
                "validation-required-formatted": "{0} は必須です。",
                "validation-numeric": "数値を指定してください。",
                "validation-numeric-formatted": "{0} は数値でなければいけません。",
                "validation-range": "値が範囲外です",
                "validation-range-formatted": "{0} の長さが正しくありません。",
                "validation-stringLength": "値の長さが正しくありません。",
                "validation-stringLength-formatted": "{0} の長さが正しくありません",
                "validation-custom": "値が無効です。",
                "validation-custom-formatted": "{0} が無効です。",
                "validation-compare": "値が一致しません。",
                "validation-compare-formatted": " {0} が一致しません。",
                "validation-pattern": "値がパターンと一致しません",
                "validation-pattern-formatted": "{0} がパターンと一致しません",
                "validation-email": "電子メール アドレスが無効です。",
                "validation-email-formatted": "{0} が無効です。",
                "validation-mask": "値が無効です。"
            }
        })
    })
});
