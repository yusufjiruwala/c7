sap.ui.define("sap/ui/ce/generic/ReportUtils", [],
    function () {
        "use strict";
        var ReportUtils = {
            Parameters: {
                colSpan: "XL2 L2 M2 S12",
                getTodate: function () {
                    return {
                        colname: "todate",
                        data_type: FormView.DataType.Date,
                        class_name: FormView.ClassTypes.DATEFIELD,
                        title: '{\"text\":\"To\",\"width\":\"15%\","textAlign":"End"}',
                        title2: "",
                        display_width: this.colSpan,
                        display_align: "ALIGN_RIGHT",
                        display_style: "",
                        display_format: "",
                        default_value: "$TODAY",
                        other_settings: { width: "35%" },
                        list: undefined,
                        edit_allowed: true,
                        insert_allowed: true,
                        require: true,
                        dispInPara: true,
                    };
                },
                getPrefer: function (thatForm, preferObjStr, preferNameObjStr, ptxtWidth, pobjWidth) {
                    var txtWidth = Util.nvl(ptxtWidth, "15%");
                    var objWidth = Util.nvl(pobjWidth, "35%");
                    return {
                        colname: "prefer",
                        data_type: FormView.DataType.String,
                        class_name: FormView.ClassTypes.TEXTFIELD,
                        title: '{\"text\":\"itemCode\",\"width\":\"' + txtWidth + '\","textAlign":"End"}',
                        title2: "",
                        display_width: this.colSpan,
                        display_align: "ALIGN_RIGHT",
                        display_style: "",
                        display_format: "",
                        default_value: "",
                        other_settings: {
                            showValueHelp: true,
                            change: function (e) {

                                var vl = e.oSource.getValue();
                                thatForm.frm.setFieldValue(preferObjStr, vl, vl, false);
                                var vlnm = Util.getSQLValue("select descr from items where reference =" + Util.quoted(vl));
                                thatForm.frm.setFieldValue(preferNameObjStr, vlnm, vlnm, false);

                            },
                            valueHelpRequest: function (event) {
                                Util.showSearchList("select reference,descr from items where itprice4=0 order by path", "DESCR", "REFERENCE", function (valx, val) {
                                    thatForm.frm.setFieldValue(preferObjStr, valx, valx, true);
                                    thatForm.frm.setFieldValue(preferNameObjStr, val, val, true);
                                });

                            },
                            width: objWidth
                        },
                        list: undefined,
                        edit_allowed: true,
                        insert_allowed: true,
                        require: false,
                        dispInPara: true,
                    }
                },
                getPreferName: function (ptxtWidth, pobjWidth) {
                    var txtWidth = Util.nvl(ptxtWidth, "1%");
                    var objWidth = Util.nvl(pobjWidth, "49%");

                    return {
                        colname: "prefname",
                        data_type: FormView.DataType.String,
                        class_name: FormView.ClassTypes.TEXTFIELD,
                        title: '@{\"text\":\"\",\"width\":\"' + txtWidth + '\","textAlign":"End"}',
                        title2: "",
                        display_width: this.colSpan,
                        display_align: "ALIGN_LEFT",
                        display_style: "",
                        display_format: "",
                        default_value: "",
                        other_settings: { width: objWidth, editable: false },
                        list: undefined,
                        edit_allowed: false,
                        insert_allowed: false,
                        require: false,
                        dispInPara: true,
                    };
                },
                getLevelNo: function () {
                    return {
                        colname: "levelno",
                        data_type: FormView.DataType.Number,
                        class_name: FormView.ClassTypes.TEXTFIELD,
                        title: '{\"text\":\"levelNo\",\"width\":\"15%\","textAlign":"End"}',
                        title2: "",
                        display_width: this.colSpan,
                        display_align: "ALIGN_RIGHT",
                        display_style: "",
                        display_format: "",
                        default_value: "0",
                        other_settings: { width: "35%" },
                        list: undefined,
                        edit_allowed: true,
                        insert_allowed: true,
                        require: true,
                        dispInPara: true,
                    };
                },

                getRecalcChk: function () {

                },
                getShowBalChk: function () {
                    return {
                        colname: "showbal",
                        data_type: FormView.DataType.String,
                        class_name: FormView.ClassTypes.CHECKBOX,
                        title: '{\"text\":\"showBal\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                        title2: "",
                        display_width: this.colSpan,
                        display_align: "ALIGN_LEFT",
                        display_style: "",
                        display_format: "",
                        other_settings: { selected: true, width: "20%", trueValues: ["Y", "N"] },
                        edit_allowed: true,
                        insert_allowed: true,
                        require: false,
                        dispInPara: true,
                        trueValues: ["Y", "N"]
                    }
                },
                getCharFromNo: function () {
                    return {
                        colname: "fromno",
                        data_type: FormView.DataType.String,
                        class_name: FormView.ClassTypes.TEXTFIELD,
                        title: '{\"text\":\"fromNo\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                        title2: "",
                        display_width: this.colSpan,
                        display_align: "ALIGN_LEFT",
                        display_style: "",
                        display_format: "",
                        other_settings: { width: "20%" },
                        edit_allowed: true,
                        insert_allowed: true,
                        require: false,
                        dispInPara: true,
                    };
                },
                getCharToNo: function () {
                    return {
                        colname: "tono",
                        data_type: FormView.DataType.String,
                        class_name: FormView.ClassTypes.TEXTFIELD,
                        title: '{\"text\":\"toNo\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                        title2: "",
                        display_width: this.colSpan,
                        display_align: "ALIGN_LEFT",
                        display_style: "",
                        display_format: "",
                        other_settings: { width: "20%" },
                        edit_allowed: true,
                        insert_allowed: true,
                        require: false,
                        dispInPara: true,
                    }
                },
            },
            Fields: {
                getItemReference: function (obj) {
                    return {
                        ...{
                            colname: "reference",
                            data_type: FormView.DataType.String,
                            class_name: FormView.ClassTypes.LABEL,
                            title: "itemCode",
                            title2: "",
                            parentTitle: "",
                            parentSpan: 1,
                            display_width: "140",
                            display_align: "ALIGN_BEGIN",
                            grouped: false,
                            display_style: "",
                            display_format: "",
                            default_value: "",
                            other_settings: {},
                            commandLinkClick: undefined,
                        }, ...obj
                    };
                },
                getCustCode: function (obj) {
                    return {
                        ...{
                            colname: "code",
                            data_type: FormView.DataType.String,
                            class_name: FormView.ClassTypes.LABEL,
                            title: "custCode",
                            title2: "",
                            parentTitle: "",
                            parentSpan: 1,
                            display_width: "100",
                            display_align: "ALIGN_BEGIN",
                            grouped: false,
                            display_style: "",
                            display_format: "",
                            default_value: "",
                            other_settings: {},
                            commandLinkClick: undefined,
                        }, ...obj
                    };
                },
                getCustName: function (obj) {
                    return {
                        ...{
                            colname: "name",
                            data_type: FormView.DataType.String,
                            class_name: FormView.ClassTypes.LABEL,
                            title: "custName",
                            title2: "",
                            parentTitle: "",
                            parentSpan: 1,
                            display_width: "100",
                            display_align: "ALIGN_BEGIN",
                            grouped: false,
                            display_style: "",
                            display_format: "",
                            default_value: "",
                            other_settings: {},
                            commandLinkClick: undefined,
                        }, ...obj
                    };
                }
            }
        };

        return ReportUtils;
    });

