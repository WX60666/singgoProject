/** 
 * DevExtreme (localization/ja/widgets-base.ja.js)
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
                "dxLookup-searchPlaceholder": "最低文字数: {0}",
                "dxList-pullingDownText": "引っ張って更新…",
                "dxList-pulledDownText": "指を離して更新…",
                "dxList-refreshingText": "更新中…",
                "dxList-pageLoadingText": "読み込み中…",
                "dxList-nextButtonText": "もっと表示する",
                "dxList-selectAll": "すべてを選択",
                "dxListEditDecorator-delete": "削除",
                "dxListEditDecorator-more": "もっと",
                "dxScrollView-pullingDownText": "引っ張って更新…",
                "dxScrollView-pulledDownText": "指を離して更新…",
                "dxScrollView-refreshingText": "更新中…",
                "dxScrollView-reachBottomText": "読み込み中",
                "dxDateBox-simulatedDataPickerTitleTime": "時刻を選択してください。",
                "dxDateBox-simulatedDataPickerTitleDate": "日付を選択してください。",
                "dxDateBox-simulatedDataPickerTitleDateTime": "日付と時刻を選択してください。",
                "dxDateBox-validation-datetime": "日付または時刻を指定してください。",
                "dxFileUploader-selectFile": "ファイルを選択",
                "dxFileUploader-dropFile": "またはファイルをこちらにドロップしてください。",
                "dxFileUploader-bytes": "バイト",
                "dxFileUploader-kb": "kb",
                "dxFileUploader-Mb": "Mb",
                "dxFileUploader-Gb": "Gb",
                "dxFileUploader-upload": "アップロード",
                "dxFileUploader-uploaded": "アップロード済み",
                "dxFileUploader-readyToUpload": "アップロードの準備中",
                "dxFileUploader-uploadFailedMessage": "アップロードに失敗しました",
                "dxRangeSlider-ariaFrom": "から",
                "dxRangeSlider-ariaTill": "まで",
                "dxSwitch-onText": "オン",
                "dxSwitch-offText": "オフ",
                "dxForm-optionalMark": "任意",
                "dxForm-requiredMessage": "{0} は必須フィールドです",
                "dxNumberBox-invalidValueMessage": "数値を指定してください。"
            }
        })
    })
});
