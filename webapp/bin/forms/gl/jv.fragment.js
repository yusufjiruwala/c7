sap.ui.jsfragment("bin.forms.gl.jv", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = Util.nvl(oController.code, "");
        this.timeInLong = (new Date()).getTime();
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            vou_code: 1,
            type: 1
        };

        // this.pgDetail = new sap.m.Page({showHeader: false});

        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");
        return this.joApp;
    },
    createView: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var that2 = this;
        var thatForm = this;
        var view = this.view;
        var fullSpan = "XL8 L8 M8 S12";
        var codSpan = "XL3 L3 M3 S12";
        var sumSpan = "XL2 L2 M2 S12";
        var dmlSq = "select acvoucher2.*,descr2 acname from acvoucher2 " +
            " where vou_code=" + this.vars.vou_code + " " +
            " and type=" + this.vars.type + " " +
            " and acvoucher2.keyfld=':keyfld' order by acvoucher2.pos";
        Util.destroyID("cmdA" + this.timeInLong, this.view);
        UtilGen.clearPage(this.mainPage);
        this.frm;
        var js = {
                form: {
                    events: {
                        afterLoadQry: function (qry) {
                            qry.formview.setFieldValue("pac", qry.formview.getFieldValue("keyfld"));
                        },
                        beforeLoadQry: function (qry, sql) {
                            return sql;
                        },
                        afterSaveQry: function (qry) {

                        },
                        afterSaveForm: function (frm) {
                            frm.loadData(undefined, FormView.RecordStatus.NEW);
                        },
                        beforeSaveQry: function (qry, df, rowno) {

                            if (qry.name == "qry1") {

                                var totdeb = qry.formview.getFieldValue("totaldebit");
                                var totcr = qry.formview.getFieldValue("totalcredit");
                                if (totdeb < 0 || totcr < 0)
                                    FormView.err("Total cant be less than zero !");
                                if (totdeb + totcr == 0)
                                    FormView.err("Total cant be zero !");
                                if (totdeb != totcr)
                                    FormView.err("Total is not matched !");
                                df["DRAMT"]=totdeb;
                                df["CRAMT"]=totcr;

                            }
                            if (qry.name == "qry1" && qry.status == FormView.RecordStatus.NEW) {
                                var kfld = Util.getSQLValue("select nvl(max(keyfld),0)+1 from acvoucher1");
                                qry.formview.setFieldValue("qry1.keyfld", kfld, kfld, true);
                                qry.formview.setFieldValue("pac", qry.formview.getFieldValue("keyfld"));
                            }
                            if (qry.name == "qry2") {
                                var ld = qry.obj.mLctb;
                                var chld = Util.getSQLValue("select childcount from acaccount where accno=" + Util.quoted(ld.getFieldValue(rowno, "ACCNO")));
                                if (chld == undefined || (typeof chld == "string" && chld == "") || chld > 0)
                                    FormView.err(ld.getFieldValue(rowno, "ACCNO") + " not a valid a/c !");
                            }
                            return "";
                        },
                        afterNewRow: function (qry, idx, ld) {
                            if (qry.name == "qry2") {

                                if (ld.rows.length == 1) {
                                    ld.setFieldValue(0, "FCDEBIT", 0);
                                    ld.setFieldValue(0, "FCCREDIT", 0);
                                    ld.setFieldValue(0, "DEBIT", 0);
                                    ld.setFieldValue(0, "CREDIT", 0);
                                    ld.setFieldValue(0, "DESCR", qry.formview.getFieldValue("qry1.descr"));
                                } else {
                                    var td = Util.extractNumber(thatForm.frm.getFieldValue('totDiff'));


                                    if (td > 0)
                                        ld.setFieldValue(idx, "FCCREDIT", td);
                                    else
                                        ld.setFieldValue(idx, "FCDEBIT", Math.abs(td));


                                }
                            }
                            if (qry.name == "qry1") {
                                var kfld = Util.getSQLValue("select nvl(max(keyfld),0)+1 from acvoucher1");
                                qry.formview.setFieldValue("qry1.keyfld", kfld, kfld, true);

                                var vno = Util.getSQLValue("select nvl(max(no),0)+1 " +
                                    " from acvoucher1 where vou_code=" + thatForm.vars.vou_code + " and " +
                                    " type=" + thatForm.vars.type);

                                qry.formview.setFieldValue("qry1.no", vno, vno, true);
                                qry.formview.setFieldValue("qry1.vou_date", new Date(new Date().toDateString()), new Date(new Date().toDateString()), true);


                            }


                        },
                        beforeDelRow: function (qry, idx, ld, data) {

                        },
                        afterDelRow: function (qry, ld, data) {
                            if (qry.insert_allowed && ld.rows.length == 0)
                                qry.obj.addRow();

                        },


                    },
                    parameters: [
                        {
                            para_name: "pac",
                            data_type: FormView.DataType.String,
                            value: ""
                        }
                    ],
                    db: [
                        {
                            type: "query",
                            name: "qry1",
                            dml: "select *from acvoucher1 where keyfld=:pac",
                            where_clause: " keyfld=':keyfld' ",
                            update_exclude_fields: ['keyfld'],
                            insert_exclude_fields: [],
                            insert_default_values: {
                                "PERIODCODE": Util.quoted(sett["CURRENT_PERIOD"]),
                                "VOU_CODE": this.vars.vou_code,
                                "TYPE": this.vars.type,
                                "CREATDT": "sysdate",
                                "FLAG": 1,
                                "USERNM": Util.quoted(sett["LOGON_USER"])
                            },
                            update_default_values: {},
                            table_name: "ACVOUCHER1",
                            edit_allowed: true,
                            insert_allowed: true,
                            delete_allowed: false,
                            fields: {
                                keyfld: {
                                    colname: "keyfld",
                                    data_type: FormView.DataType.Number,
                                    class_name: FormView.ClassTypes.LABEL,
                                    title: "Key ID",
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: codSpan,
                                    display_align: "ALIGN_CENTER",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {},
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: true
                                },
                                no: {
                                    colname: "no",
                                    data_type: FormView.DataType.Number,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "No",
                                    title2: "No",
                                    canvas: "default_canvas",
                                    display_width: codSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {},
                                    edit_allowed: false,
                                    insert_allowed: true,
                                    require: true
                                },
                                vou_date: {
                                    colname: "vou_date",
                                    data_type: FormView.DataType.Date,
                                    class_name: FormView.ClassTypes.DATEFIELD,
                                    title: "@Vou Date",
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: codSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {},
                                    list: undefined,
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: true,
                                },
                                descr: {
                                    colname: "descr",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "Descr",
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: fullSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {},
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: true
                                },
                            }

                        },
                        {
                            type: "query",
                            name: "qry2",
                            showType: FormView.QueryShowType.QUERYVIEW,
                            applyCol: "C7.JV",
                            addRowOnEmpty: true,
                            dml: dmlSq,
                            edit_allowed: true,
                            insert_allowed: true,
                            delete_allowed: true,
                            delete_before_update: "delete from acvoucher2 where keyfld=':qry1.keyfld';",
                            where_clause: " keyfld=':keyfld' ",
                            update_exclude_fields: ['keyfld'],
                            insert_exclude_fields: ["ACNAME"],
                            insert_default_values: {
                                "DESCR2": ":ACNAME",
                                "KEYFLD": ":qry1.keyfld",
                                "NO": ":qry1.no",
                                "VOU_DATE": ":qry1.vou_date",
                                "PERIODCODE": sett["CURRENT_PERIOD"],
                                "VOU_CODE": this.vars.vou_code,
                                "TYPE": this.vars.type,
                                "CREATDT": "sysdate",
                                "DEBIT": ":FCDEBIT",
                                "CREDIT": ":FCCREDIT",
                                "FLAG": 1,
                            },
                            update_default_values: {
                                "DESCR2": ":ACNAME",
                                "DEBIT": ":FCDEBIT",
                                "CREDIT": ":FCCREDIT",
                            },
                            table_name: "ACVOUCHER2",
                            when_validate_field: function (table, currentRowoIndexContext, cx, rowno, colno) {
                                var sett = sap.ui.getCore().getModel("settings").getData();
                                var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
                                var oModel = currentRowoIndexContext.oModel;
                                var damt = parseFloat(oModel.getProperty(currentRowoIndexContext.sPath + '/FCDEBIT').replace(/[^\d\.],/g, '').replace(/,/g, ''));
                                var camt = parseFloat(oModel.getProperty(currentRowoIndexContext.sPath + '/FCCREDIT').replace(/[^\d\.],/g, '').replace(/,/g, ''));
                                var des = Util.nvl(oModel.getProperty(currentRowoIndexContext.sPath + '/DESCR'), "");
                                if (cx.mColName == "ACCNO" && des == "") {

                                    oModel.setProperty(currentRowoIndexContext.sPath + "/DESCR", that.frm.getFieldValue("qry1.descr"));
                                }

                                if (cx.mColName == "FCDEBIT" && damt < 0)
                                    FormView.err("Less than 0 not allowed !");
                                if (cx.mColName == "FCCREDIT" && camt < 0)
                                    FormView.err("Less than 0 not allowed !");
                                if (cx.mColName == "FCDEBIT" && damt > 0)
                                    oModel.setProperty(currentRowoIndexContext.sPath + '/FCCREDIT', df.format(0));
                                else if (cx.mColName == "FCCREDIT" && camt > 0)
                                    oModel.setProperty(currentRowoIndexContext.sPath + '/FCDEBIT', df.format(0));
                                // if (cx.mColName == "ACCNO")
                                //     sap.m.MessageToast.show(".....selected acc");

                                return true;
                            },
                            eventCalc: function (qv, cx, rowno, reAmt) {
                                var sett = sap.ui.getCore().getModel("settings").getData();
                                var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);

                                if (reAmt)
                                    qv.updateDataToTable();

                                var ld = qv.mLctb;
                                var sumDr = 0;
                                var sumCr = 0;

                                for (var i = 0; i < ld.rows.length; i++) {
                                    sumDr += Util.nvl(Util.extractNumber(ld.getFieldValue(i, "FCDEBIT"), df), 0);
                                    sumCr += Util.nvl(Util.extractNumber(ld.getFieldValue(i, "FCCREDIT"), df), 0);
                                }
                                thatForm.frm.setFieldValue('totaldebit', df.format(sumDr));
                                thatForm.frm.setFieldValue('totalcredit', df.format(sumCr));
                                thatForm.frm.setFieldValue('totDiff', df.format(sumDr - sumCr));


                            },
                            summary: {
                                totdebit: {
                                    colname: "totaldebit",
                                    data_type: FormView.DataType.Number,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "Total DR",
                                    title2: "Total DR",
                                    canvas: "default_canvas",
                                    display_width: sumSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: sett["FORMAT_MONEY_1"],
                                    other_settings: {},
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: true
                                },
                                totcredit: {
                                    colname: "totalcredit",
                                    data_type: FormView.DataType.Number,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "Total CR",
                                    title2: "   Total CR",
                                    canvas: "default_canvas",
                                    display_width: sumSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {},
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: true
                                },
                                totDiff: {
                                    colname: "totDiff",
                                    data_type: FormView.DataType.Number,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "Difference ",
                                    title2: "Difference",
                                    canvas: "default_canvas",
                                    display_width: sumSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "redText",
                                    display_format: "",
                                    other_settings: {},
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: true
                                },
                            }

                        }
                    ],
                    canvas: [],
                    commands: [
                        {
                            name: "cmdSave",
                            canvas: "default_canvas",
                            onPress: function (e) {
                                // var ac = that2.frm.getFieldValue("accno");
                                // var ac = that2.frm.parseString("select from acaccount where accno=':pac'");
                                // var sv = that2.frm.getSQLUpdateString("qry1", undefined, ['code'], " CODE=':code' ");
                                // console.log(sv);
                                // sap.m.MessageToast.show("Saved...", {
                                //     my: sap.ui.core.Popup.Dock.RightBottom,
                                //     at: sap.ui.core.Popup.Dock.RightBottom
                                // });

                                return true;
                            }
                        },
                        {
                            name: "cmdDel",
                            canvas: "default_canvas",
                        }, {
                            name: "cmdEdit",
                            canvas: "default_canvas",
                        },
                        {
                            name: "cmdNew",
                            canvas: "default_canvas",
                            title: "New JV"
                        }, {
                            name: "cmdList",
                            canvas: "default_canvas",
                            list_name: "list1"
                        },
                        {
                            name: "cmdClose",
                            canvas: "default_canvas",
                            title: "Close",
                            obj: new sap.m.Button({
                                icon: "sap-icon://decline",
                                press: function () {
                                    that2.joApp.backFunction();
                                }
                            })
                        }
                    ],
                    lists: [
                        {
                            name: 'list1',
                            title: "List of JVs",
                            list_type: "sql",
                            cols: [
                                {
                                    colname: 'NO',
                                },
                                {
                                    colname: "VOU_DATE",
                                },
                                {
                                    colname: 'KEYFLD',
                                    return_field: "pac",
                                },
                                {
                                    colname: 'DR_AMOUNT'
                                },
                                {
                                    colname: 'DESCR'
                                },

                            ],  // [{colname:'code',width:'100',return_field:'pac' }]
                            sql: "select no,TO_CHAR(vou_date,'DD/MM/RRRR') VOU_DATE ,descr,keyfld ,DEBAMT DEBAMT" +
                            " from acvoucher1 where vou_code=" + that2.vars.vou_code +
                            " and type=" + that2.vars.type + " order by acvoucher1.vou_date desc,no desc",
                            afterSelect: function (data) {
                                that2.frm.loadData(undefined, "view");
                                that2.frm.loadData(undefined, "view");
                                return true;
                            }
                        }
                    ]

                }
            }
        ;
        this.frm = new FormView(this.mainPage);
        this.frm.view = view;
        this.frm.pg = this.mainPage;
        this.frm.parseForm(js);
        this.frm.createView();

        // this.mainPage.addContent(sc);

    },
    setFormEditable: function () {

    }
    ,

    createViewHeader: function () {
        var that = this;
        var fe = [];
        var titSpan = "XL2 L4 M4 S12";
        var codSpan = "XL3 L2 M2 S12";


        // this.cs = {};
        // this.cs.code = UtilGen.addControl(fe, "Code", sap.m.Input, "Cs" + this.timeInLong + "_",
        //     {
        //         enabled: true,
        //         layoutData: new sap.ui.layout.GridData({span: codSpan}),
        //     }, "string", undefined, this.view);
        // this.cs.title = UtilGen.addControl(fe, "@Title", sap.m.Input, "cs" + this.timeInLong + "_",
        //     {
        //         enabled: true,
        //         layoutData: new sap.ui.layout.GridData({span: titSpan}),
        //     }, "string", undefined, this.view);
        //
        //
        // return UtilGen.formCreate("", true, fe);
        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    }
    ,
    loadData: function () {
        // this.frm.setFieldValue("pac", "KWD");
        // this.frm.loadData("qry1");

        this.frm.setFieldValue('pac', Util.nvl(this.qryStr), "");
        this.frm.setQueryStatus(undefined, Util.nvl(this.oController.status, FormView.RecordStatus.NEW));
        if (this.qryStr != "")
            this.frm.loadData(undefined, this.oController.status);


    }
    ,
    validateSave: function () {

        return true;
    }
    ,
    save_data: function () {
    }
    ,
    get_emails_sel: function () {

    }

});



