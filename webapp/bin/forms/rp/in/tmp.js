var a = {
    type: "query",
    name: "qry3",
    showType: FormView.QueryShowType.FORM,
    dispRecords: -1,
    execOnShow: false,
    showToolbar: true,
    canvas: "qryMCanvas3",
    canvasType: ReportView.CanvasType.FORMCREATE2,
    isMaster: false,
    masterToolbarInMain: false,
    dml: "select 0 bal from dual",
    fields: {
        txtB30: {
            colname: "txtB30",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.LABEL,
            title: '{\"text\":\"b30Txt\",\"width\":\"19%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_RIGHT",
            display_style: "",
            display_format: "MONEY_FORMAT",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "1%",
                editable: false
            },
        },
        txtB60: {
            colname: "txtB60",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.LABEL,
            title: '@{\"text\":\"b60Txt\",\"width\":\"19%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_RIGHT",
            display_style: "",
            display_format: "",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "1%",
                editable: false
            },
        },
        txtB90: {
            colname: "txtB90",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.LABEL,
            title: '@{\"text\":\"b90Txt\",\"width\":\"19%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_RIGHT",
            display_style: "",
            display_format: "",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "1%",
                editable: false
            },
        },
        txtB120: {
            colname: "txtB120",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.LABEL,
            title: '@{\"text\":\"b120Txt\",\"width\":\"19%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_RIGHT",
            display_style: "",
            display_format: "",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "1%",
                editable: false
            },
        },
        txtB150: {
            colname: "txtB150",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.LABEL,
            title: '@{\"text\":\"b150Txt\",\"width\":\"19%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_RIGHT",
            display_style: "",
            display_format: "",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "1%",
                editable: false
            },
        },
        b30: {
            colname: "b30",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.TEXTFIELD,
            title: '{\"text\":\"\",\"width\":\"5%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_CENTER",
            display_style: "",
            display_format: "MONEY_FORMAT",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "19%",
                editable: false
            },
        },
        b60: {
            colname: "b60",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.TEXTFIELD,
            title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_CENTER",
            display_style: "",
            display_format: "",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "19%",
                editable: false
            },
        },
        b90: {
            colname: "b90",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.TEXTFIELD,
            title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_CENTER",
            display_style: "",
            display_format: "",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "19%",
                editable: false
            },
        },
        b120: {
            colname: "b120",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.TEXTFIELD,
            title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_CENTER",
            display_style: "",
            display_format: "",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "19%",
                editable: false
            },
        },
        b150: {
            colname: "b150",
            data_type: FormView.DataType.String,
            class_name: ReportView.ClassTypes.TEXTFIELD,
            title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
            title2: "",
            display_width: colSpan,
            display_align: "ALIGN_CENTER",
            display_style: "",
            display_format: "",
            default_value: "",
            onPrintField: function () {
                return this.obj.$().outerHTML();
            },
            other_settings: {
                width: "19%",
                editable: false
            },
        },
    }
}