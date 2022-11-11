sap.ui.jsfragment("bin.forms.gl.pvc", {

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
            vou_code: 3,
            type: 2,
            type_2: 7
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

        this.joApp.displayBack = function () {
            that.frm.refreshDisplay();
        };
        setTimeout(function () {
            if (that.oController.getForm().getParent() instanceof sap.m.Dialog)
                that.oController.getForm().getParent().setShowHeader(false);

        }, 10);
        setTimeout(function () {
            if (that.oController.getForm().getParent() instanceof sap.m.Dialog)
                that.oController.getForm().getParent().setShowHeader(false);

        }, 10);

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
        var sumSpan2 = "XL2 L6 M6 S12";
        var span1 = "XL2 L1 M1 S12";
        var span23 = "XL2 L2 M3 S12";
        var span4 = "XL4 L4 M4 S12";
        var dmlSq = "select acvoucher2.*,acvoucher2.descr2 acname,cc.title csname from acvoucher2,accostcent1 cc " +
            " where vou_code=" + this.vars.vou_code + " " +
            " and acvoucher2.type=" + this.vars.type + " " +
            " and acvoucher2.keyfld=':keyfld' " +
            " and cc.code(+)=acvoucher2.costcent order by acvoucher2.pos";
        Util.destroyID("cmdA" + this.timeInLong, this.view);
        UtilGen.clearPage(this.mainPage);
        this.frm;
        var js = {
                form: {
                    title: "Cash Payment Voucher",
                    toolbarBG: "darkkhaki",
                    formSetting: {
                        width: {"S": 500, "M": 650, "L": 750},
                        cssText: [
                            "padding-left:10px;" +
                            "padding-top:20px;" +
                            "border-width: thin;" +
                            "border-style: solid;" +
                            "border-color: darkkhaki;" +
                            "margin: 10px;" +
                            "border-radius:25px;"
                            // "background-color:khaki;"
                        ]
                    },
                    customDisplay: function (vbHeader) {
                        Util.destroyID("numtxt" + thatForm.timeInLong, thatForm.view);
                        Util.destroyID("txtMsg" + thatForm.timeInLong, thatForm.view);
                        var txtMsg = new sap.m.Text(thatForm.view.createId("txtMsg" + thatForm.timeInLong)).addStyleClass("redMiniText blinking");
                        var txt = new sap.m.Text(thatForm.view.createId("numtxt" + thatForm.timeInLong, {text: "0.000"}));
                        var hb = new sap.m.Toolbar({
                            content: [txt, new sap.m.ToolbarSpacer(), txtMsg]
                        });
                        txt.addStyleClass("totalVoucherTxt titleFontWithoutPad");
                        vbHeader.addItem(hb);
                    },
                    print_templates: [
                        {
                            title: "Print",
                            reportFile: "vouchers/rptVou_992",
                        }
                    ],
                    events: {
                        afterLoadQry: function (qry) {
                            qry.formview.setFieldValue("pac", qry.formview.getFieldValue("keyfld"));

                            if (qry.name == "qry1") {
                                UtilGen.Search.getLOVSearchField("select name from salesp where no = :CODE ", qry.formview.objs["qry1.slsmn"].obj, undefined, that.frm.objs["qry1.slsmnname"].obj);
                                UtilGen.Search.getLOVSearchField("select title from accostcent1 where code = ':CODE' ", qry.formview.objs["qry1.costcent"].obj, undefined, that.frm.objs["qry1.costcentname"].obj);
                                UtilGen.Search.getLOVSearchField("select name from acaccount where accno = ':CODE'", qry.formview.objs["qry1.code"].obj, undefined, that.frm.objs["qry1.codename"].obj);
                                thatForm.view.byId("txtMsg" + thatForm.timeInLong).setText("");
                                var kf = qry.formview.getFieldValue("keyfld");
                                var dt = Util.execSQL("select flag,USERNM,CREATDT,POSTED_BY,POSTED_DATE from acvoucher1 where keyfld=" + kf);
                                if (dt.ret == "SUCCESS" && dt.data.length > 0) {
                                    var dtx = JSON.parse("{" + dt.data + "}").data;
                                    if (dtx.length > 0 && dtx[0].FLAG != undefined && dtx[0].FLAG != 1) {
                                        setTimeout(function () {
                                            qry.formview.setFormReadOnly();
                                            sap.m.MessageToast.show("This P.V. is posted !");
                                        });
                                        thatForm.view.byId("txtMsg" + thatForm.timeInLong).setText("Posted by :" + dtx[0].POSTED_BY + " Posted time: " + dtx[0].POSTED_DATE);
                                    } else qry.formview.form.readonly = Util.nvl(js.form.readonly, false);
                                    if (dtx.length > 0) {
                                        qry.formview.setFieldValue("createdBy", dtx[0].USERNM, dtx[0].USERNM, true);
                                        qry.formview.setFieldValue("createdOn", dtx[0].CREATDT, dtx[0].CREATDT, true);
                                    }

                                }


                            }

                            if (qry.name == "qry2" && thatForm.oController.jvpos != undefined) {
                                var rn = qry.obj.mLctb.find("POS", thatForm.oController.jvpos);
                                if (rn >= 0) {
                                    thatForm.oController.jvpos = undefined;
                                    qry.obj.getControl().setSelectedIndex(rn);
                                    if (rn > 1) {
                                        qry.obj.getControl().setFirstVisibleRow(rn - 1);
                                    } else
                                        qry.obj.getControl().setFirstVisibleRow(rn);
                                }
                            }
                        },
                        beforeLoadQry: function (qry, sql) {
                            return sql;
                        },
                        afterSaveQry: function (qry) {

                        },
                        afterSaveForm: function (frm) {
                            // frm.loadData(undefined, FormView.RecordStatus.NEW);
                            frm.setQueryStatus(undefined, FormView.RecordStatus.NEW);
                        },
                        beforeSaveQry: function (qry, sqlRow, rowno) {

                            if (qry.name == "qry1") {

                                UtilGen.Vouchers.validateTotDrTotCr(qry, sqlRow, rowno);
                                UtilGen.Vouchers.validatePostedVocher(qry, sqlRow, rowno);

                                UtilGen.Vouchers.validateFieldsBeforeSave(qry, sqlRow, rowno);

                            }

                            UtilGen.Vouchers.getNewKF(qry, sqlRow, rowno);
                            UtilGen.Vouchers.validateDetails(qry, sqlRow, rowno);

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
                        beforeDeleteValidate: function (frm) {
                            var kf = frm.getFieldValue("keyfld");
                            var dt = Util.execSQL("select flag from acvoucher1 where keyfld=" + kf);
                            if (dt.ret == "SUCCESS" && dt.data.length > 0) {
                                var dtx = JSON.parse("{" + dt.data + "}").data;
                                if (dtx.length > 0 && dtx[0].FLAG != undefined && dtx[0].FLAG != 1) {
                                    FormView.err("This P.V. is posted !");
                                }
                            }
                        },
                        beforeDelRow: function (qry, idx, ld, data) {


                        },
                        afterDelRow: function (qry, ld, data) {
                            if (qry.insert_allowed && ld.rows.length == 0)
                                qry.obj.addRow();

                        },
                        onCellRender(qry, rowno, colno, currentRowContext) {
                            if (qry.status == "edit" && qry.name == "qry2" && colno == 3) {
                                var oModel = qry.obj.getControl().getModel();
                                var cellVal = oModel.getProperty("CUST_CODE", currentRowContext)
                                if (cellVal != "" && cellVal != undefined) {
                                    qry.obj.getControl().getRows()[rowno].getCells()[3].setEnabled(false);
                                }
                            }
                        },

                        beforeExeSql: function (frm, sq) {
                            var sql = sq;
                            var kf = frm.getFieldValue("keyfld");
                            var dsq = "delete from acvoucher2 where keyfld=" + kf + " and type=" + thatForm.vars.type_2;
                            var insq = UtilGen.getInsertRowStringByObj(
                                "ACVOUCHER2",
                                {
                                    "DESCR2": "(select name from acaccount where accno=':qry1.code')",
                                    "KEYFLD": ":qry1.keyfld",
                                    "NO": ":qry1.no",
                                    "VOU_DATE": ":qry1.vou_date",
                                    "PERIODCODE": Util.quoted(sett["CURRENT_PERIOD"]),
                                    "VOU_CODE": thatForm.vars.vou_code,
                                    "TYPE": thatForm.vars.type_2,
                                    "CREATDT": "sysdate",
                                    "DEBIT": 0,
                                    "CREDIT": Util.extractNumber(frm.getFieldValue("qry2.totaldebit")),
                                    "FCCREDIT": 0,
                                    "FLAG": 1,
                                    "FC_MAIN": Util.quoted(sett["DEFAULT_CURRENCY"]),
                                    "FC_MAIN_RATE": 1,
                                    "FCCODE": Util.quoted(sett["DEFAULT_CURRENCY"]),
                                    "FCRATE": 1,
                                    "POS": "(select nvl(max(pos),0)+1 from acvoucher2 where keyfld=:qry1.keyfld)",
                                    "FCCREDIT": Util.extractNumber(frm.getFieldValue("qry2.totaldebit")),
                                    "FCDEBIT": 0,
                                    "ACCNO": "':qry1.code'",
                                    "DESCR": "':qry1.descr'",
                                    "COSTCENT": "':qry1.costcent'",

                                }
                            );
                            insq = frm.parseString(insq);
                            return sql + dsq + ";" + insq + ";";
                        }


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
                            update_exclude_fields: ['keyfld', "codename", "costcentname", "slsmnname"],
                            insert_exclude_fields: ["codename", "costcentname", "slsmnname"],
                            insert_default_values: {
                                "PERIODCODE": Util.quoted(sett["CURRENT_PERIOD"]),
                                "VOU_CODE": this.vars.vou_code,
                                "TYPE": this.vars.type,
                                "CREATDT": "sysdate",
                                "FLAG": 1,
                                "USERNM": Util.quoted(sett["LOGON_USER"]),
                                "FCCODE": Util.quoted(sett["DEFAULT_CURRENCY"]),
                                "FCRATE": 1,
                                "FC_MAIN_1": Util.quoted(sett["DEFAULT_CURRENCY"]),
                                "FC_MAIN_RATE_1": 1,
                                "DEBAMT": ":qry2.totaldebit",
                                "CRDAMT": ":qry2.totaldebit",


                            },
                            update_default_values: {
                                "DEBAMT": ":qry2.totaldebit",
                                "CRDAMT": ":qry2.totaldebit",
                            },
                            table_name: "ACVOUCHER1",
                            edit_allowed: true,
                            insert_allowed: true,
                            delete_allowed: false,
                            labelSpan: [12, 0, 0, 0],  //S,l,L,XL
                            emptySpan: [-1, 0, 0, 0],//S,M,L,XL
                            columnsSpan: [1, 1, -1], //M,L,XL
                            fields: {
                                keyfld: {
                                    colname: "keyfld",
                                    data_type: FormView.DataType.Number,
                                    class_name: FormView.ClassTypes.LABEL,
                                    title: '{\"text\":\"Key ID\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: codSpan,
                                    display_align: "ALIGN_CENTER",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {width: "30%"},
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: true
                                },
                                no: {
                                    colname: "no",
                                    data_type: FormView.DataType.Number,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "No",
                                    title: '{\"text\":\"No\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                    canvas: "default_canvas",
                                    display_width: codSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {width: "15%"},
                                    edit_allowed: false,
                                    insert_allowed: true,
                                    require: true
                                },
                                vou_date: {
                                    colname: "vou_date",
                                    data_type: FormView.DataType.Date,
                                    class_name: FormView.ClassTypes.DATEFIELD,
                                    title: '@{\"text\":\"Vou Date\",\"width\":\"50%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: codSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {width: "20%"},
                                    list: undefined,
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: true,
                                },
                                descr: {
                                    colname: "descr",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: '{\"text\":\"Descr\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: fullSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {width: "85%"},
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: true
                                },
                                code: {
                                    colname: "code",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: '{\"text\":\"Cash/Bank\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: fullSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {
                                        width: "15%",
                                        showValueHelp: true,
                                        change: function (e) {
                                            UtilGen.Search.getLOVSearchField("select name from acaccount where isbankcash='Y' and accno = ':CODE'", that.frm.objs["qry1.code"].obj, undefined, that.frm.objs["qry1.codename"].obj);

                                        },
                                        valueHelpRequest: function (e) {

                                            UtilGen.Search.do_quick_search(e, this,
                                                "select Accno code,Name title from acaccount where childcount=0 and isbankcash='Y' order by path ",
                                                "select accno code,name title from acaccount where accno=:CODE", that.frm.objs["qry1.codename"].obj);
                                        }
                                    },
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: true
                                },
                                codename: {
                                    colname: "codename",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: fullSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {
                                        width: "19%",
                                    },
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: true
                                },
                                rcvfrom: {
                                    colname: "rcvfrom",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: '@{\"text\":\"Pay To\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: fullSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {width: "35%"},
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: true
                                },
                                slsmn: {
                                    colname: "slsmn",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: '{\"text\":\"Sales Person\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: fullSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {
                                        width: "15%",
                                        showValueHelp: true,
                                        change: function (e) {
                                            UtilGen.Search.getLOVSearchField("select name from salesp where no = :CODE ", that.frm.objs["qry1.slsmn"].obj, undefined, that.frm.objs["qry1.slsmnname"].obj);

                                        },
                                        valueHelpRequest: function (e) {
                                            UtilGen.Search.do_quick_search(e, this,
                                                "select no code,name title from salesp  order by no",
                                                "select no code,name title from salesp  where no=:CODE", that.frm.objs["qry1.slsmnname"].obj);
                                        }
                                    },
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: false
                                },
                                slsmnname: {
                                    colname: "slsmnname",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: fullSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {
                                        width: "19%",
                                    },
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: false
                                },
                                costcent: {
                                    colname: "costcent",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: '@{\"text\":\"Cost Center\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: fullSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {
                                        width: "15%",
                                        showValueHelp: true,
                                        change: function (e) {
                                            UtilGen.Search.getLOVSearchField("select title from accostcent1 where code = ':CODE' ", that.frm.objs["qry1.costcent"].obj, undefined, that.frm.objs["qry1.costcentname"].obj);
                                        },
                                        valueHelpRequest: function (e) {
                                            UtilGen.Search.do_quick_search(e, this,
                                                "select code,title from accostcent1  order by path ",
                                                "select code,title from accostcent1  where code=:CODE", that.frm.objs["qry1.costcentname"].obj);
                                        }
                                    },
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: false
                                },
                                costcentname: {
                                    colname: "costcentname",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: fullSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {
                                        width: "19%",
                                    },
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: false
                                },
                            }

                        },
                        {
                            type: "query",
                            name: "qry2",
                            showType: FormView.QueryShowType.QUERYVIEW,
                            applyCol: "C7.PV1",
                            addRowOnEmpty: true,
                            dml: dmlSq,
                            edit_allowed: true,
                            insert_allowed: true,
                            delete_allowed: true,
                            delete_before_update: "delete from acvoucher2 where keyfld=':qry1.keyfld';",
                            where_clause: " keyfld=':keyfld' ",
                            update_exclude_fields: ['keyfld'],
                            insert_exclude_fields: ["ACNAME", "CSNAME"],
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
                                "CREDIT": 0,
                                "FCCREDIT": 0,
                                "FLAG": 1,
                                "FC_MAIN": sett["DEFAULT_CURRENCY"],
                                "FC_MAIN_RATE": 1,
                                "FCCODE": sett["DEFAULT_CURRENCY"],
                                "FCRATE": 1,
                            },
                            update_default_values: {
                                "DESCR2": ":ACNAME",
                                "DEBIT": ":FCDEBIT",
                                "CREDIT": 0,
                                "CREDIT": 0,
                            },
                            table_name: "ACVOUCHER2",
                            when_validate_field: function (table, currentRowoIndexContext, cx, rowno, colno) {
                                var sett = sap.ui.getCore().getModel("settings").getData();
                                var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
                                var oModel = currentRowoIndexContext.oModel;
                                var damt = parseFloat(oModel.getProperty(currentRowoIndexContext.sPath + '/FCDEBIT').replace(/[^\d\.],/g, '').replace(/,/g, ''));

                                var des = Util.nvl(oModel.getProperty(currentRowoIndexContext.sPath + '/DESCR'), "");
                                if (cx.mColName == "ACCNO" && des == "") {

                                    oModel.setProperty(currentRowoIndexContext.sPath + "/DESCR", that.frm.getFieldValue("qry1.descr"));
                                }

                                if (cx.mColName == "FCDEBIT" && damt < 0)
                                    FormView.err("Less than 0 not allowed !");
                                // if (cx.mColName == "FCDEBIT" && damt > 0)
                                //     oModel.setProperty(currentRowoIndexContext.sPath + '/FCCREDIT', df.format(0));
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
                                // thatForm.frm.setFieldValue('totalcredit', df.format(sumCr));
                                // thatForm.frm.setFieldValue('totDiff', df.format(sumDr - sumCr));
                                if (thatForm.view.byId("numtxt" + thatForm.timeInLong) != undefined)
                                    thatForm.view.byId("numtxt" + thatForm.timeInLong).setText("Amount : " + df.format(sumDr));


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
                                createdBy: {
                                    colname: "createdBy",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "Created By",
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: sumSpan,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "redText",
                                    display_format: "",
                                    other_settings: {enabled: false},
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: false
                                },
                                createdOn: {
                                    colname: "createdOn",
                                    data_type: FormView.DataType.String,
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "Created On ",
                                    title2: "",
                                    canvas: "default_canvas",
                                    display_width: sumSpan2,
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "redText",
                                    display_format: "",
                                    other_settings: {enabled: false},
                                    edit_allowed: false,
                                    insert_allowed: false,
                                    require: false
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
                            name: "cmdPrint",
                            canvas: "default_canvas",
                            title: "Print",
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

    }
    ,
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
        UtilGen.Vouchers.formLoadData(this);
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

})
;



