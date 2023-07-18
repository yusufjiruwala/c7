sap.ui.jsfragment("bin.forms.gl.jv", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = Util.nvl(oController.code, "");
        this.timeInLong = (new Date()).getTime();
        this.joApp = new sap.m.SplitApp({ mode: sap.m.SplitAppMode.HideMode });
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
        this.joApp.displayBack = function () {
            that.frm.refreshDisplay();
        };
        // UtilGen.setFormTitle(this.oController.getForm(), "Journal Voucher", this.mainPage);
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
        var dmlSq = "select acvoucher2.*,acvoucher2.descr2 acname,cc.title csname from acvoucher2,accostcent1 cc " +
            " where vou_code=" + this.vars.vou_code + " " +
            // " and type=" + this.vars.type + " " +
            " and acvoucher2.keyfld=':keyfld' " +
            " and cc.code(+)=acvoucher2.costcent order by acvoucher2.pos";
        Util.destroyID("cmdA" + this.timeInLong, this.view);
        UtilGen.clearPage(this.mainPage);
        this.frm;
        var js = {
            form: {
                title: "Journal Voucher",
                toolbarBG: "lightgreen",
                customDisplay: function (vbHeader) {
                    Util.destroyID("numtxt" + thatForm.timeInLong, thatForm.view);
                    Util.destroyID("txtMsg" + thatForm.timeInLong, thatForm.view);
                    var txtMsg = new sap.m.Text(thatForm.view.createId("txtMsg" + thatForm.timeInLong)).addStyleClass("redMiniText blinking");
                    var txt = new sap.m.Text(thatForm.view.createId("numtxt" + thatForm.timeInLong, { text: "0.000" }));
                    var hb = new sap.m.Toolbar({
                        content: [txt, new sap.m.ToolbarSpacer(), txtMsg]
                    });
                    txt.addStyleClass("totalVoucherTxt titleFontWithoutPad");
                    vbHeader.addItem(hb);
                },
                print_templates: [
                    {
                        title: "Print",
                        reportFile: "vouchers/jv",
                    }
                ],
                events: {
                    afterLoadQry: function (qry) {
                        qry.formview.setFieldValue("pac", qry.formview.getFieldValue("keyfld"));
                        if (qry.name == "qry1") {
                            thatForm.view.byId("txtMsg" + thatForm.timeInLong).setText("");
                            var kf = qry.formview.getFieldValue("keyfld");
                            var dt = Util.execSQL("select flag,USERNM,CREATDT,POSTED_BY,POSTED_DATE from acvoucher1 where keyfld=" + kf);
                            if (dt.ret == "SUCCESS" && dt.data.length > 0) {
                                var dtx = JSON.parse("{" + dt.data + "}").data;
                                if (dtx.length > 0 && dtx[0].FLAG != undefined && dtx[0].FLAG != 1) {
                                    setTimeout(function () {
                                        qry.formview.setFormReadOnly();
                                        sap.m.MessageToast.show("This JV is posted !");
                                    });
                                    thatForm.view.byId("txtMsg" + thatForm.timeInLong).setText("Posted by :" + dtx[0].POSTED_BY + " Posted time: " + dtx[0].POSTED_DATE);
                                } else qry.formview.form.readonly = Util.nvl(js.form.readonly, false);
                                if (dtx.length > 0) {
                                    qry.formview.setFieldValue("createdBy", dtx[0].USERNM, dtx[0].USERNM, true);
                                    qry.formview.setFieldValue("createdOn", dtx[0].CREATDT, dtx[0].CREATDT, true);
                                }
                            }
                            UtilGen.Vouchers.attachLoadQry(that2, qry);

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
                    afterSaveForm: function (frm, nxtStatus) {
                        // frm.loadData(undefined, FormView.RecordStatus.NEW);

                        frm.setQueryStatus(undefined, Util.nvl(nxtStatus, FormView.RecordStatus.NEW));
                    },
                    beforeSaveQry: function (qry, sqlRow, rowno) {

                        UtilGen.Vouchers.getNewKF(qry, sqlRow, rowno);
                        UtilGen.Vouchers.validateDetails(qry, sqlRow, rowno);

                        if (qry.name == "qry1") {
                            UtilGen.Vouchers.validateTotDrTotCr(qry, sqlRow, rowno);
                            UtilGen.Vouchers.validatePostedVocher(qry, sqlRow, rowno);
                            UtilGen.Vouchers.attachSaveQry(that2);

                        }
                        return "";
                    },
                    afterNewRow: function (qry, idx, ld) {

                        if (qry.name == "qry2") {
                            (thatForm.view.byId("txtMsg" + thatForm.timeInLong) != undefined) ?
                                thatForm.view.byId("txtMsg" + thatForm.timeInLong).setText("") : '';
                        }
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
                            that2.fileUpload = undefined;
                            var kfld = Util.getSQLValue("select nvl(max(keyfld),0)+1 from acvoucher1");
                            qry.formview.setFieldValue("qry1.keyfld", kfld, kfld, true);

                            var vno = Util.getSQLValue("select nvl(max(no),0)+1 " +
                                " from acvoucher1 where vou_code=" + thatForm.vars.vou_code + " and " +
                                " type=" + thatForm.vars.type);

                            qry.formview.setFieldValue("qry1.no", vno, vno, true);
                            var dt = thatForm.view.today_date.getDateValue();
                            qry.formview.setFieldValue("qry1.vou_date", new Date(dt.toDateString()), new Date(dt.toDateString()), true);


                        }


                    },
                    beforeDeleteValidate: function (frm) {
                        var kf = frm.getFieldValue("keyfld");
                        var dt = Util.execSQL("select flag from acvoucher1 where keyfld=" + kf);
                        if (dt.ret == "SUCCESS" && dt.data.length > 0) {
                            var dtx = JSON.parse("{" + dt.data + "}").data;
                            if (dtx.length > 0 && dtx[0].FLAG != undefined && dtx[0].FLAG != 1) {
                                FormView.err("This JV is posted !");
                            }
                        }
                    },
                    beforeDelRow: function (qry, idx, ld, data) {

                    },
                    afterDelRow: function (qry, ld, data) {
                        var delAdd = "";
                        if (qry.name == "qry1")
                            delAdd += "delete from c7_attach where keyfld=:qry1.keyfld ;";

                        if (qry.name == "qry2" && qry.insert_allowed && ld != undefined && ld.rows.length == 0)
                            qry.obj.addRow();
                        return delAdd;
                    },
                    onCellRender: function (qry, rowno, colno, currentRowContext) {
                        if (qry.status == "edit" && qry.name == "qry2" && colno == 4) {
                            var oModel = qry.obj.getControl().getModel();
                            var cellVal = oModel.getProperty("CUST_CODE", currentRowContext)
                            qry.obj.getControl().getRows()[rowno].getCells()[4].setEnabled(true);
                            if (cellVal != "" && cellVal != undefined)
                                qry.obj.getControl().getRows()[rowno].getCells()[4].setEnabled(false);

                        }
                    },
                    beforePrint: function (rptName, params) {
                        return params + "&_para_VOU_TITLE=Journal Voucher";
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
                        update_exclude_fields: ['keyfld', 'attachment'],
                        insert_exclude_fields: ['attachment'],
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
                            "CRDAMT": ":qry2.totalcredit",


                        },
                        update_default_values: {
                            "DEBAMT": ":qry2.totaldebit",
                            "CRDAMT": ":qry2.totalcredit",


                        },
                        table_name: "ACVOUCHER1",
                        edit_allowed: true,
                        insert_allowed: true,
                        delete_allowed: false,
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
                                other_settings: { editable: false, width: "20%" },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            attachment: {
                                colname: "attachment",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Attachment\",\"width\":\"50%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_BEGIN",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    showValueHelp: true,
                                    editable: false,
                                    width: "20%",
                                    valueHelpRequest: function (e) {
                                        if (that2.frm.objs["qry1"].status != FormView.RecordStatus.EDIT &&
                                            that2.frm.objs["qry1"].status != FormView.RecordStatus.NEW)
                                            return;
                                        UtilGen.Vouchers.attachShowUpload(that2);
                                    }
                                },

                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            no: {
                                colname: "no",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"From A/c\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "No",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "20%" },
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
                                other_settings: { width: "20%" },
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
                                other_settings: { width: "90%" },
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
                            "CREDIT": ":FCCREDIT",
                            "FLAG": 1,
                            "FC_MAIN": sett["DEFAULT_CURRENCY"],
                            "FC_MAIN_RATE": 1,
                            "FCCODE": sett["DEFAULT_CURRENCY"],
                            "FCRATE": 1,
                        },
                        update_default_values: {
                            "DESCR2": ":ACNAME",
                            "DEBIT": ":FCDEBIT",
                            "CREDIT": ":FCCREDIT",
                        },
                        table_name: "ACVOUCHER2",
                        before_add_table: function (scrollObjs, qrj) {
                            UtilGen.Vouchers.before_add_table(scrollObjs, qrj, that2.vars);
                        },
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
                            if (cx.mColName == "FCDEBIT" && isNaN(damt))
                                FormView.err("Value err !");
                            if (cx.mColName == "FCCREDIT" && isNaN(camt))
                                FormView.err("Value err !");
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
                            if (des == "")
                                oModel.setProperty(currentRowoIndexContext.sPath + '/DESCR', that.frm.getFieldValue("qry1.descr"));
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
                            if (thatForm.view.byId("numtxt" + thatForm.timeInLong) != undefined)
                                thatForm.view.byId("numtxt" + thatForm.timeInLong).setText("Amount : " + df.format(sumDr));
                        },
                        summary: {
                            totdebit: {
                                colname: "totaldebit",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Total DR\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "Total DR",
                                canvas: "default_canvas",
                                display_width: sumSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: sett["FORMAT_MONEY_1"],
                                other_settings: { width: "30%" },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            totcredit: {
                                colname: "totalcredit",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Total CR\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "   Total CR",
                                canvas: "default_canvas",
                                display_width: sumSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "30%" },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            totDiff: {
                                colname: "totDiff",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Difference \",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "Difference",
                                canvas: "default_canvas",
                                display_width: sumSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "redText",
                                display_format: "",
                                other_settings: { width: "30%" },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            createdBy: {
                                colname: "createdBy",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Created By\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: sumSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "redText",
                                display_format: "",
                                other_settings: { enabled: false, width: "30%" },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: false
                            },
                            createdOn: {
                                colname: "createdOn",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Created On\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: sumSpan2,
                                display_align: "ALIGN_RIGHT",
                                display_style: "redText",
                                display_format: "",
                                other_settings: { enabled: false, width: "30%" },
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
                        name: "cmdAttach",
                        canvas: "default_canvas",
                        title: "Attachment",

                        obj: new sap.m.Button({
                            icon: "sap-icon://pdf-attachment",
                            press: function () {
                                UtilGen.Vouchers.attachShowUpload(that2, false);
                            }
                        })
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
                    },

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

});



