/** 
 * DevExtreme (localization/ru/widgets-base.ru.js)
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
            ru: {
                "dxLookup-searchPlaceholder": "Минимальное количество символов: {0}",
                "dxList-pullingDownText": "Потяните, чтобы обновить...",
                "dxList-pulledDownText": "Отпустите, чтобы обновить...",
                "dxList-refreshingText": "Обновление...",
                "dxList-pageLoadingText": "Загрузка...",
                "dxList-nextButtonText": "Далее",
                "dxList-selectAll": "Выбрать все",
                "dxListEditDecorator-delete": "Удалить",
                "dxListEditDecorator-more": "Еще",
                "dxScrollView-pullingDownText": "Потяните, чтобы обновить...",
                "dxScrollView-pulledDownText": "Отпустите, чтобы обновить...",
                "dxScrollView-refreshingText": "Обновление...",
                "dxScrollView-reachBottomText": "Загрузка...",
                "dxDateBox-simulatedDataPickerTitleTime": "Выберите время",
                "dxDateBox-simulatedDataPickerTitleDate": "Выберите дату",
                "dxDateBox-simulatedDataPickerTitleDateTime": "Выберите дату и время",
                "dxDateBox-validation-datetime": "Значение должно быть датой/временем",
                "dxFileUploader-selectFile": "Выберите файл",
                "dxFileUploader-dropFile": "или Перетащите файл сюда",
                "dxFileUploader-bytes": "байт",
                "dxFileUploader-kb": "кБ",
                "dxFileUploader-Mb": "МБ",
                "dxFileUploader-Gb": "ГБ",
                "dxFileUploader-upload": "Загрузить",
                "dxFileUploader-uploaded": "Загружено",
                "dxFileUploader-readyToUpload": "Готово к загрузке",
                "dxFileUploader-uploadFailedMessage": "Загрузка не удалась",
                "dxRangeSlider-ariaFrom": "От",
                "dxRangeSlider-ariaTill": "До",
                "dxSwitch-onText": "ВКЛ",
                "dxSwitch-offText": "ВЫКЛ",
                "dxForm-optionalMark": "необязательный",
                "dxForm-requiredMessage": " Поле {0} должно быть заполнено",
                "dxNumberBox-invalidValueMessage": "Значение должно быть числом"
            }
        })
    })
});
