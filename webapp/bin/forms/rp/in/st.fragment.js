sap.ui.jsfragment("bin.forms.rp.in.st", {
    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        // this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode,});
        // this.joApp2 = new sap.m.App();
        this.timeInLong = (new Date()).getTime();

        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.jp = this.createView();

        this.loadData();
        this.jp.onWndClose = function () {
            sap.m.MessageToast.show("Closing the report !");
            that.frm.helperFunctions.destoryRV();
        };
        return this.jp;
    },
    createView: function () {
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var that2 = this;
        var thatForm = this;
        var view = this.view;
        var fullSpan = "XL8 L8 M8 S12";
        var colSpan = "XL2 L2 M2 S12";
        var sumSpan = "XL2 L2 M2 S12";
        var cmdLink = function (obj, rowno, colno, lctb, frm) {
            // var mdl = frm.objs["CAGE1@qry2"].obj.getControl().getModel();
            // var rr = frm.objs["CAGE1@qry2"].obj.getControl().getRows().indexOf(obj.getParent());
            // var cont = frm.objs["CAGE1@qry2"].obj.getControl().getContextByIndex(rr);
            // var rowid = mdl.getProperty("_rowid", cont);
            // var ac = Util.nvl(lctb.getFieldValue(rowid, "ACCNO"), "");
            // var ac = frm.objs["CAGE1@qry2"].obj.getControl().getRows()[rr].getCells()[0].getText();

            // var mnu = new sap.m.Menu();
            // mnu.removeAllItems();

            // mnu.addItem(new sap.m.MenuItem({
            //     text: "SOA A/c -" + ac,
            //     customData: { key: ac },
            //     press: function () {
            //         var accno = this.getCustomData()[0].getKey();
            //         UtilGen.execCmd("testRep5 formType=dialog formSize=100%,80% repno=1 para_PARAFORM=false para_EXEC_REP=true fromacc=" + accno + " toacc=" + accno + " fromdate=@01/01/2020", UtilGen.DBView, obj, UtilGen.DBView.newPage);
            //     }
            // }));
            // mnu.addItem(new sap.m.MenuItem({
            //     text: "View A/c -" + ac,
            //     customData: { key: ac },
            //     press: function () {
            //         var accno = this.getCustomData()[0].getKey();
            //         UtilGen.execCmd("bin.forms.gl.masterAc formType=dialog formSize=650px,300px status=view accno=" + accno, UtilGen.DBView, obj, UtilGen.DBView.newPage);
            //     }
            // }));
            // mnu.openBy(obj);

        }
        // UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];

        var sc = new sap.m.ScrollContainer();

        var js = {
            title: Util.getLangText("stkCardRepTit"),
            title2: "",
            show_para_pop: false,
            reports: [
                {
                    code: "ST001",
                    name: Util.getLangText("stkCardRep1"),
                    descr: Util.getLangText("stkCardRep1Descr"),
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    onSubTitHTML: function () {
                        var tbstr = Util.getLangText("stkCardRep1");
                        var ht = "<div class='reportTitle'>" + tbstr + "</div > ";
                        return ht;
                    },

                    showCustomPara: function (vbPara, rep) {

                    },
                    mainParaContainerSetting: {
                        width: "600px",
                        cssText: [
                            "padding-left:50px;" +
                            "padding-top:20px;" +
                            "border-style: inset;" +
                            "margin: 10px;" +
                            "border-radius:25px;" +
                            "background-color:#dcdcdc;"
                        ]
                    },
                    rep: {
                        parameters: {
                            prefer: {
                                colname: "prefer",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"itemCode\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    showValueHelp: true,
                                    change: function (e) {
                                        var vl = e.oSource.getValue();
                                        thatForm.frm.setFieldValue("ST001@parameter.prefer", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select descr from items where reference =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("ST001@parameter.prefname", vlnm, vlnm, false);
                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select reference,descr from items where itprice4=0 order by path", "DESCR", "REFERENCE", function (valx, val) {
                                            thatForm.frm.setFieldValue("ST001@parameter.prefer", valx, valx, true);
                                            thatForm.frm.setFieldValue("ST001@parameter.prefname", val, val, true);
                                        });
                                    },
                                    width: "35%"
                                },
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false,
                                dispInPara: true,
                            },
                            prefname: {
                                colname: "prefname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_LEFT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: { width: "49%", editable: false },
                                list: undefined,
                                edit_allowed: false,
                                insert_allowed: false,
                                require: false,
                                dispInPara: true,
                            },
                            fromdate: {
                                colname: "fromdate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '{\"text\":\"fromDate\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
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
                            },
                            todate: {
                                colname: "todate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '{\"text\":\"toDate\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
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
                            },

                        },
                        print_templates: [
                            {
                                title: "Jasper Template ",
                                reportFile: "trans_1",
                            }
                        ],
                        canvas: [],
                        db: [
                            {
                                type: "query",
                                name: "qry1",
                                showType: FormView.QueryShowType.FORM,
                                dispRecords: -1,
                                execOnShow: false,
                                showToolbar: true,
                                canvas: "qryMCanvas",
                                canvasType: ReportView.CanvasType.FORMCREATE2,
                                isMaster: false,
                                masterToolbarInMain: false,
                                dml: "select 0 bal from dual",
                                fields: {
                                    item: {
                                        colname: "item",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '{\"text\":\"itemTxt\",\"width\":\"15%\","textAlign":"End","styleClass":"boldText paddingBottom10px"}',
                                        title2: "",
                                        display_width: colSpan,
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "boldText paddingBottom10px",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        onPrintField: function () {
                                            return this.obj.$().outerHTML();
                                        },
                                        other_settings: {
                                            width: "50%",
                                            editable: false
                                        },
                                    },

                                    txtBfBal: {
                                        colname: "txtBfBal",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '{\"text\":\"B/F\",\"width\":\"20%\","textAlign":"End","styleClass":""}',
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
                                    txtTotIn: {
                                        colname: "txtTotIn",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '@{\"text\":\"txtTotIn\",\"width\":\"20%\","textAlign":"End","styleClass":""}',
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
                                    txtTotOut: {
                                        colname: "txtTotOut",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '@{\"text\":\"txtTotOut\",\"width\":\"20%\","textAlign":"End","styleClass":""}',
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
                                    txtBal: {
                                        colname: "txtBal",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '@{\"text\":\"balanceTxt\",\"width\":\"20%\","textAlign":"End","styleClass":"redText"}',
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
                                    bfBal: {
                                        colname: "bfBal",
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
                                            width: "20%",
                                            editable: false
                                        },
                                    },
                                    totIn: {
                                        colname: "totIn",
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
                                            width: "20%",
                                            editable: false
                                        },
                                    },
                                    totOut: {
                                        colname: "totOut",
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
                                            width: "20%",
                                            editable: false
                                        },
                                    },
                                    bal: {
                                        colname: "bal",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.TEXTFIELD,
                                        title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":"redText"}',
                                        title2: "",
                                        display_width: colSpan,
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "redText",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        onPrintField: function () {
                                            return this.obj.$().outerHTML();
                                        },
                                        other_settings: {
                                            width: "24%",
                                            editable: false
                                        },
                                    },
                                }
                            },
                            {
                                type: "query",
                                name: "qry2",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                disp_class: "reportTable2",
                                dispRecords: { "S": 7, "M": 10, "L": 14 },
                                execOnShow: false,
                                dml: "SELECT -1 KEYFLD,(select nvl(max(DESCR2),'') from items where items.reference=':parameter.prefer' ) DESCR2," +
                                    "   '' PARENTITEM,0 INVOICE_NO,-1 INVOICE_KEYFLD,:parameter.fromdate DAT,1 INVOICE_CODE ," +
                                    "   :parameter.fromdate INVOICE_DATE ,1 TYPE,':parameter.prefer' REFER,0 PRICE," +
                                    "   GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate-1) ALLQTY," +
                                    " (select max(PRD_DT) from items where items.reference=':parameter.prefer' ) PRD_DATE," +
                                    " (select max(EXP_DT) from items where items.reference=':parameter.prefer' ) EXP_DATE," +
                                    "  1 STRA,0 STRB,NULL DESCR,GET_ITEM_COST(':parameter.prefer',:parameter.fromdate-1) PKCOST," +
                                    " (select max(PACK) from items where items.reference=':parameter.prefer' ) PACK," +
                                    " (select max(PACKD) from items where items.reference=':parameter.prefer' ) PACKD," +
                                    " (select max(UNITD) from items where items.reference=':parameter.prefer' ) UNITD," +
                                    " (select max(PKAVER) from items where items.reference=':parameter.prefer' ) PKAVER," +
                                    " (select max(PACKD) from items where items.reference=':parameter.prefer' ) ITPACKD," +
                                    " (select max(UNITD) from items where items.reference=':parameter.prefer' ) ITUNITD," +
                                    " -1 ITEMPOS, (select max(PACK) from items where items.reference=':parameter.prefer' ) ITPACK," +
                                    " '' INV_REF, '' INV_REFNM, '' c_cus_no,null pur_inv_no,null pur_keyfld ," +
                                    " case when GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)>=0 then GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate-1) end QTYIN," +
                                    " case when GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)<0 then abs(GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)) end QTYOUT," +
                                    " 'B/F' CODE_NAMEE,'B/F' CODE_NAMEA," +
                                    " 1 INV_INVOICE_CODE,0 balance , '' ref_name," +
                                    " case when GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)>=0 then GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate-1)/ (select max(PACK) from items where items.reference=':parameter.prefer' ) else 0  end PKQTYIN," +
                                    " case when GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)<0 then abs(GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)) / (select max(PACK) from items where items.reference=':parameter.prefer' ) else 0 end PKQTYOUT " +
                                    " FROM DUAL UNION ALL" +
                                    " SELECT KEYFLD, DESCR2, PARENTITEM, INVOICE_NO, INVOICE_KEYFLD,  DAT, INVOICE_CODE," +
                                    "  INVOICE_DATE, TYPE, REFER, PRICE,  ALLQTY, PRD_DATE, EXP_DATE," +
                                    "  STRA, STRB, DESCR, PKCOST, PACK, PACKD,UNITD, PKAVER, ITPACKD, ITUNITD,ITEMPOS, ITPACK, " +
                                    "  INV_REF, INV_REFNM, c_cus_no,nvl(pur_inv_no,invoice_no) pur_inv_no,pur_keyfld, QTYIN, QTYOUT, CODE_NAMEE, CODE_NAMEA, " +
                                    "  INV_INVOICE_CODE , 0 balance, ref_name, QTYIN/PACK PKQTYIN,QTYOUT/PACK PKQTYOUT FROM C7_STK " +
                                    "  where descr2 like ((select nvl(max(DESCR2),'')||'%' from items where items.reference=':parameter.prefer' )) " +
                                    "   and invoice_date>=:parameter.fromdate and invoice_date<=:parameter.todate " +
                                    "   ORDER BY INVOICE_DATE,invoice_code,keyfld,itempos ",
                                parent: "",
                                levelCol: "",
                                code: "",
                                title: "",
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["COL1", "COL2"],
                                canvasType: ReportView.CanvasType.VBOX,
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    var oModel = this.getControl().getModel();
                                    var bal = parseFloat(oModel.getProperty("BALANCE", currentRowContext));
                                    if (bal < 0)
                                        for (var i = startCell; i < endCell; i++) {
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("cssText", UtilGen.DBView.style_credit_numbers + ";text-align:center;");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("cssText", UtilGen.DBView.style_credit_numbers + ";text-align:center;");

                                        }
                                    else
                                        for (var i = startCell; i < endCell; i++)
                                            if (qv.getControl()._getVisibleColumns()[i - startCell].tableCol.mColName == "BALANCE") {
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("cssText", UtilGen.DBView.style_debit_numbers + ";text-align:center;");
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("cssText", UtilGen.DBView.style_debit_numbers + ";text-align:center;");
                                            }

                                },
                                eventCalc: function (qv, cx, rowno, reAmt) {
                                    var sett = sap.ui.getCore().getModel("settings").getData();
                                    var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
                                    if (rowno >= 0) return;
                                    var bal = 0;
                                    var bfBal = 0, totin = 0, totout = 0;
                                    thatForm.frm.setFieldValue("ST001@qry1.bfBal", bfBal, bfBal, true);
                                    thatForm.frm.setFieldValue("ST001@qry1.totIn", totin, totin, true);
                                    thatForm.frm.setFieldValue("ST001@qry1.totOut", totout, totout, true);
                                    thatForm.frm.setFieldValue("ST001@qry1.bal", bal, bal, true);
                                    if (qv.mLctb.rows.length == 0) return;
                                    var pkd = qv.mLctb.getFieldValue(0, "PACKD");
                                    var ud = qv.mLctb.getFieldValue(0, "UNITD");
                                    for (var i = 0; i < qv.mLctb.rows.length; i++) {
                                        var pk = qv.mLctb.getFieldValue(i, "PACK");
                                        var qi = qv.mLctb.getFieldValue(i, "QTYIN");
                                        var qo = qv.mLctb.getFieldValue(i, "QTYOUT");
                                        var kf = qv.mLctb.getFieldValue(i, "KEYFLD");
                                        bal += (qi - qo) != 0 ? (qi - qo) / pk : 0;

                                        qv.mLctb.setFieldValue(i, "BALANCE", bal);
                                        if (kf == -1)
                                            bfBal = (qi - qo) != 0 ? (qi - qo) / pk : 0;

                                        totin += qi;
                                        totout += qo;

                                    }

                                    var pk = qv.mLctb.getFieldValue(0, "PACK");
                                    totin = totin != 0 ? (totin) / pk : 0;
                                    totout = totout != 0 ? (totout) / pk : 0;
                                    pkd = pkd + (pk > 1 ? " (" + ud + "x" + pk + ")" : "");
                                    var itm = thatForm.frm.getFieldValue("parameter.prefer") + "-" + thatForm.frm.getFieldValue("parameter.prefname");
                                    thatForm.frm.setFieldValue("ST001@qry1.bal", ((totin - totout) + " " + pkd), ((totin - totout) + " " + pkd), true);
                                    thatForm.frm.setFieldValue("ST001@qry1.item", itm, itm, true);
                                    thatForm.frm.setFieldValue("ST001@qry1.bfBal", bfBal, bfBal, true);
                                    thatForm.frm.setFieldValue("ST001@qry1.totIn", totin, totin, true);
                                    thatForm.frm.setFieldValue("ST001@qry1.totOut", totout, totout, true);
                                    thatForm.frm.setFieldValue("ST001@qry3.tit1", " pack = " + pkd, " pack = " + pkd, true);

                                    var cl = thatForm.calcAge(thatForm.frm.getFieldValue("parameter.todate"), qv.mLctb, {
                                        colDebit: "PKQTYIN",
                                        colCredit: "PKQTYOUT",
                                        colDate: "INVOICE_DATE"
                                    });

                                    thatForm.frm.setFieldValue("ST001@qry3.b30", cl.b30, cl.b30, true);
                                    thatForm.frm.setFieldValue("ST001@qry3.b60", cl.b60, cl.b60, true);
                                    thatForm.frm.setFieldValue("ST001@qry3.b90", cl.b90, cl.b90, true);
                                    thatForm.frm.setFieldValue("ST001@qry3.b120", cl.b120, cl.b120, true);
                                    thatForm.frm.setFieldValue("ST001@qry3.b150", cl.b150, cl.b150, true);

                                },

                                bat7CustomAddQry: function (qryObj, ps) {

                                },


                                fields: {
                                    invoice_date: {
                                        colname: "invoice_date",
                                        data_type: FormView.DataType.Date,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "transDate",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "SHORT_DATE_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    code_namee: {
                                        colname: "code_namee",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "transType",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "font-size:11px;",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pur_inv_no: {
                                        colname: "pur_inv_no",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "noTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pkqtyin: {
                                        colname: "pkqtyin",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "qtyIn",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: UtilGen.DBView.style_debit_numbers + ";",
                                        display_format: "",
                                        default_value: "",
                                        summary: "SUM",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pkqtyout: {
                                        colname: "pkqtyout",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "qtyOut",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: UtilGen.DBView.style_credit_numbers + ";",
                                        display_format: "",
                                        summary: "SUM",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    balance: {
                                        colname: "balance",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "balanceTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        summary: "LAST",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    itpackd: {
                                        colname: "itpackd",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackD",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    stra: {
                                        colname: "stra",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "storeNo",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        summary: "LAST",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    refer: {
                                        colname: "refer",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCode",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    descr: {
                                        colname: "descr",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "descrTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "150",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    c_cus_no: {
                                        colname: "c_cus_no",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "refCode",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    ref_name: {
                                        colname: "ref_name",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "refName",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "150",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                }
                            },
                            {
                                type: "query",
                                name: "qry3",
                                showType: FormView.QueryShowType.FORM,
                                dispRecords: -1,
                                execOnShow: false,
                                showToolbar: true,
                                canvas: "qryMCanvas3",
                                canvasType: ReportView.CanvasType.FORMCREATE2,
                                cavasSett: {
                                    width: "700px",
                                    cssText: [
                                        "padding-left:50px;" +
                                        "padding-top:20px;" +
                                        "border-style: inset;" +
                                        "margin-left: 10%;" +
                                        "margin-right: 10%;" +
                                        "border-radius:25px;" +
                                        "background-color:#dcdcdc;"
                                    ]
                                },
                                isMaster: false,
                                masterToolbarInMain: false,
                                dml: "select 0 bal from dual",
                                fields: {
                                    tit1: {
                                        colname: "tit1",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '{\"text\":\"stockAgeingTxt\",\"width\":\"25%\","textAlign":"Begin","styleClass":"boldText paddingBottom10px"}',
                                        title2: "",
                                        display_width: colSpan,
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "boldText paddingBottom10px",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        onPrintField: function () {
                                            return this.obj.$().outerHTML();
                                        },
                                        other_settings: {
                                            width: "25%",
                                            editable: false
                                        }
                                    },
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
                        ]
                    }
                },
                {
                    code: "ST002",
                    name: Util.getLangText("stkCardRep2"),
                    descr: Util.getLangText("stkCardRep2Descr"),
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    onSubTitHTML: function () {
                        var tbstr = Util.getLangText("stkCardRep2");
                        var ht = "<div class='reportTitle'>" + tbstr + "</div > ";
                        return ht;
                    },

                    showCustomPara: function (vbPara, rep) {

                    },
                    mainParaContainerSetting: {
                        width: "600px",
                        cssText: [
                            "padding-left:50px;" +
                            "padding-top:20px;" +
                            "border-style: inset;" +
                            "margin: 10px;" +
                            "border-radius:25px;" +
                            "background-color:#dcdcdc;"
                        ]
                    },
                    rep: {
                        parameters: {
                            prefer: {
                                colname: "prefer",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"itemCode\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    showValueHelp: true,
                                    change: function (e) {
                                        var vl = e.oSource.getValue();
                                        thatForm.frm.setFieldValue("ST001@parameter.prefer", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select descr from items where reference =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("ST001@parameter.prefname", vlnm, vlnm, false);
                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select reference,descr from items where itprice4=0 order by path", "DESCR", "REFERENCE", function (valx, val) {
                                            thatForm.frm.setFieldValue("ST001@parameter.prefer", valx, valx, true);
                                            thatForm.frm.setFieldValue("ST001@parameter.prefname", val, val, true);
                                        });
                                    },
                                    width: "35%"
                                },
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false,
                                dispInPara: true,
                            },
                            prefname: {
                                colname: "prefname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_LEFT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: { width: "49%", editable: false },
                                list: undefined,
                                edit_allowed: false,
                                insert_allowed: false,
                                require: false,
                                dispInPara: true,
                            },
                            fromdate: {
                                colname: "fromdate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '{\"text\":\"To\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
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
                            },
                            todate: {
                                colname: "todate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '{\"text\":\"To\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
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
                            },

                        },
                        print_templates: [
                            {
                                title: "Jasper Template ",
                                reportFile: "trans_1",
                            }
                        ],
                        canvas: [],
                        db: [
                            {
                                type: "query",
                                name: "qry1",
                                showType: FormView.QueryShowType.FORM,
                                dispRecords: -1,
                                execOnShow: false,
                                showToolbar: true,
                                canvas: "qryMCanvas",
                                canvasType: ReportView.CanvasType.FORMCREATE2,
                                isMaster: false,
                                masterToolbarInMain: false,
                                dml: "select 0 bal from dual",
                                fields: {
                                    item: {
                                        colname: "item",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '{\"text\":\"itemTxt\",\"width\":\"15%\","textAlign":"End","styleClass":"boldText paddingBottom10px"}',
                                        title2: "",
                                        display_width: colSpan,
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "boldText paddingBottom10px",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        onPrintField: function () {
                                            return this.obj.$().outerHTML();
                                        },
                                        other_settings: {
                                            width: "50%",
                                            editable: false
                                        },
                                    },

                                    txtBfBal: {
                                        colname: "txtBfBal",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '{\"text\":\"B/F\",\"width\":\"20%\","textAlign":"End","styleClass":""}',
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
                                    txtTotIn: {
                                        colname: "txtTotIn",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '@{\"text\":\"txtTotIn\",\"width\":\"20%\","textAlign":"End","styleClass":""}',
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
                                    txtTotOut: {
                                        colname: "txtTotOut",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '@{\"text\":\"txtTotOut\",\"width\":\"20%\","textAlign":"End","styleClass":""}',
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
                                    txtBal: {
                                        colname: "txtBal",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '@{\"text\":\"balanceTxt\",\"width\":\"20%\","textAlign":"End","styleClass":""}',
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
                                    txtCst: {
                                        colname: "txtCst",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '@{\"text\":\"avgCostAmt\",\"width\":\"24%\","textAlign":"End","styleClass":""}',
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
                                    bfBal: {
                                        colname: "bfBal",
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
                                            width: "20%",
                                            editable: false
                                        },
                                    },
                                    totIn: {
                                        colname: "totIn",
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
                                            width: "20%",
                                            editable: false
                                        },
                                    },
                                    totOut: {
                                        colname: "totOut",
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
                                            width: "20%",
                                            editable: false
                                        },
                                    },
                                    bal: {
                                        colname: "bal",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.TEXTFIELD,
                                        title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":"redText"}',
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
                                            width: "24%",
                                            editable: false
                                        },
                                    },
                                    cst: {
                                        colname: "cst",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.TEXTFIELD,
                                        title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":"redText"}',
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
                                            width: "24%",
                                            editable: false
                                        },
                                    },
                                }
                            },
                            {
                                type: "query",
                                name: "qry2",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                disp_class: "reportTable2",
                                dispRecords: { "S": 7, "M": 10, "L": 14 },
                                execOnShow: false,
                                dml: "SELECT -1 KEYFLD,(select nvl(max(DESCR2),'') from items where items.reference=':parameter.prefer' ) DESCR2," +
                                    "   '' PARENTITEM,0 INVOICE_NO,-1 INVOICE_KEYFLD,:parameter.fromdate DAT,1 INVOICE_CODE ," +
                                    "   :parameter.fromdate INVOICE_DATE ,1 TYPE,':parameter.prefer' REFER,0 PRICE," +
                                    "   GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate-1) ALLQTY," +
                                    " (select max(PRD_DT) from items where items.reference=':parameter.prefer' ) PRD_DATE," +
                                    " (select max(EXP_DT) from items where items.reference=':parameter.prefer' ) EXP_DATE," +
                                    "  1 STRA,0 STRB,NULL DESCR,GET_ITEM_COST(':parameter.prefer',:parameter.fromdate-1) PKCOST," +
                                    " (select max(PACK) from items where items.reference=':parameter.prefer' ) PACK," +
                                    " (select max(PACKD) from items where items.reference=':parameter.prefer' ) PACKD," +
                                    " (select max(UNITD) from items where items.reference=':parameter.prefer' ) UNITD," +
                                    " (select max(PKAVER) from items where items.reference=':parameter.prefer' ) PKAVER," +
                                    " (select max(PACKD) from items where items.reference=':parameter.prefer' ) ITPACKD," +
                                    " (select max(UNITD) from items where items.reference=':parameter.prefer' ) ITUNITD," +
                                    " -1 ITEMPOS, (select max(PACK) from items where items.reference=':parameter.prefer' ) ITPACK," +
                                    " '' INV_REF, '' INV_REFNM, '' c_cus_no,null pur_inv_no,null pur_keyfld ," +
                                    " case when GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)>=0 then GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate-1) end QTYIN," +
                                    " case when GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)<0 then abs(GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)) end QTYOUT," +
                                    " 'B/F' CODE_NAMEE,'B/F' CODE_NAMEA," +
                                    " 1 INV_INVOICE_CODE,0 balance , '' ref_name," +
                                    " case when GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)>=0 then GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate-1)/ (select max(PACK) from items where items.reference=':parameter.prefer' ) else 0  end PKQTYIN," +
                                    " case when GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)<0 then abs(GET_ITEM_ALLQTY(':parameter.prefer',:parameter.fromdate -1)) / (select max(PACK) from items where items.reference=':parameter.prefer' ) else 0 end PKQTYOUT, " +
                                    "0 pkcost2, 0 COST_AMT, 0 AVGCOST , 0 AVGCOST_AMT ,0 PKCOST_AMT " +
                                    " FROM DUAL UNION ALL " +
                                    " SELECT KEYFLD, DESCR2, PARENTITEM, INVOICE_NO, INVOICE_KEYFLD,  DAT, INVOICE_CODE," +
                                    "  INVOICE_DATE, TYPE, REFER, PRICE,  ALLQTY, PRD_DATE, EXP_DATE," +
                                    "  STRA, STRB, DESCR, PKCOST, PACK, PACKD,UNITD, PKAVER, ITPACKD, ITUNITD,ITEMPOS, ITPACK, " +
                                    "  INV_REF, INV_REFNM, c_cus_no,nvl(pur_inv_no,invoice_no) pur_inv_no,pur_keyfld, QTYIN, QTYOUT, CODE_NAMEE, CODE_NAMEA, " +
                                    "  INV_INVOICE_CODE , 0 balance, ref_name, QTYIN/PACK PKQTYIN,QTYOUT/PACK PKQTYOUT, " +
                                    "  pkcost*itpack pkcost2, 0 COST_AMT, 0 AVGCOST , 0 AVGCOST_AMT, 0 PKCOST_AMT   FROM C7_STK " +
                                    "  where descr2 like ((select nvl(max(DESCR2),'')||'%' from items where items.reference=':parameter.prefer' )) " +
                                    "   and invoice_date>=:parameter.fromdate and invoice_date<=:parameter.todate " +
                                    "   ORDER BY INVOICE_DATE,invoice_code,keyfld,itempos ",
                                parent: "",
                                levelCol: "",
                                code: "",
                                title: "",
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["COL1", "COL2"],
                                canvasType: ReportView.CanvasType.VBOX,
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    var oModel = this.getControl().getModel();
                                    var bal = parseFloat(oModel.getProperty("BALANCE", currentRowContext));
                                    var cstamt = parseFloat(oModel.getProperty("AVGCOST_AMT", currentRowContext));
                                    if (bal < 0)
                                        for (var i = startCell; i < endCell; i++) {
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("cssText", UtilGen.DBView.style_credit_numbers + ";text-align:center;");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("cssText", UtilGen.DBView.style_credit_numbers + ";text-align:center;");

                                        }
                                    else
                                        for (var i = startCell; i < endCell; i++)
                                            if (qv.getControl()._getVisibleColumns()[i - startCell].tableCol.mColName == "BALANCE") {
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("cssText", UtilGen.DBView.style_debit_numbers + ";text-align:center;");
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("cssText", UtilGen.DBView.style_debit_numbers + ";text-align:center;");
                                            }
                                    if (cstamt < 0) {
                                        for (var i = startCell; i < endCell; i++)
                                            if (qv.getControl()._getVisibleColumns()[i - startCell].tableCol.mColName == "AVGCOST_AMT") {
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("cssText", UtilGen.DBView.style_credit_numbers + ";text-align:right;");
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("cssText", UtilGen.DBView.style_credit_numbers + ";text-align:center;");
                                            }
                                    }
                                    else
                                        for (var i = startCell; i < endCell; i++)
                                            if (qv.getControl()._getVisibleColumns()[i - startCell].tableCol.mColName == "AVGCOST_AMT") {
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("cssText", UtilGen.DBView.style_debit_numbers + ";text-align:right;");
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("cssText", UtilGen.DBView.style_debit_numbers + ";text-align:center;");

                                            }
                                },
                                eventCalc: function (qv, cx, rowno, reAmt) {
                                    var sett = sap.ui.getCore().getModel("settings").getData();
                                    var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
                                    if (rowno >= 0) return;
                                    var bal = 0;
                                    var bfBal = 0, totin = 0, totout = 0;
                                    thatForm.frm.setFieldValue("ST002@qry1.bfBal", bfBal, bfBal, true);
                                    thatForm.frm.setFieldValue("ST002@qry1.totIn", totin, totin, true);
                                    thatForm.frm.setFieldValue("ST002@qry1.totOut", totout, totout, true);
                                    thatForm.frm.setFieldValue("ST002@qry1.bal", bal, bal, true);
                                    if (qv.mLctb.rows.length == 0) return;

                                    var pkd = qv.mLctb.getFieldValue(0, "PACKD");
                                    var ud = qv.mLctb.getFieldValue(0, "UNITD");
                                    var totcost = 0, totavgcst = 0;
                                    var rfrpk = qv.mLctb.getFieldValue(0, "PACK");
                                    for (var i = 0; i < qv.mLctb.rows.length; i++) {
                                        // if (qv.mLctb.getFieldValue(i, "KEYFLD") == -1 && i == 0 && qv.mLctb.getFieldValue(i, "INV_TYPE") == "B/F")
                                        //     qv.mLctb.setFIeldValue(i, "AVGCOST", qv.mLctb.getFieldValue(i, "PKCOST"));
                                        qv.mLctb.setFieldValue(i, "ITPACKD", pkd);
                                        var pk = qv.mLctb.getFieldValue(i, "PACK");
                                        var qi = qv.mLctb.getFieldValue(i, "QTYIN");
                                        var qo = qv.mLctb.getFieldValue(i, "QTYOUT");
                                        var kf = qv.mLctb.getFieldValue(i, "KEYFLD");

                                        var cst = qv.mLctb.getFieldValue(i, "PKCOST");
                                        totcost += (cst * (qi - qo));

                                        bal += (qi - qo) != 0 ? (qi - qo) / pk : 0;

                                        qv.mLctb.setFieldValue(i, "BALANCE", bal);

                                        totin += qi;
                                        totout += qo;
                                        var avgc = ((qi - qo) != 0) ? (totcost / (totin - totout)) * rfrpk : 0;
                                        qv.mLctb.setFieldValue(i, "AVGCOST", avgc);
                                        qv.mLctb.setFieldValue(i, "AVGCOST_AMT", avgc * ((totin - totout) != 0 ? (totin - totout) / rfrpk : 0));

                                        totavgcst = (avgc * ((totin - totout) != 0 ? (totin - totout) / rfrpk : 0));

                                        if (kf == -1) {
                                            bfBal = (qi - qo) != 0 ? (qi - qo) / rfrpk : 0;
                                            qv.mLctb.setFieldValue(i, "PKCOST_AMT", totavgcst);
                                            qv.mLctb.setFieldValue(i, "PKCOST", avgc);
                                            qv.mLctb.setFieldValue(i, "PKCOST2", avgc * rfrpk);
                                        } else
                                            qv.mLctb.setFieldValue(i, "PKCOST_AMT", (cst * (qi - qo)));

                                    }

                                    var pk = qv.mLctb.getFieldValue(0, "PACK");
                                    totin = totin != 0 ? (totin) / pk : 0;
                                    totout = totout != 0 ? (totout) / pk : 0;
                                    pkd = pkd + (pk > 1 ? " (" + ud + "x" + pk + ")" : "");
                                    var itm = thatForm.frm.getFieldValue("parameter.prefer") + "-" + thatForm.frm.getFieldValue("parameter.prefname");
                                    thatForm.frm.setFieldValue("ST002@qry1.bal", ((totin - totout) + " " + pkd), ((totin - totout) + " " + pkd), true);
                                    thatForm.frm.setFieldValue("ST002@qry1.cst", df.format(totavgcst), df.format(totavgcst), true);
                                    thatForm.frm.setFieldValue("ST002@qry1.item", itm, itm, true);
                                    thatForm.frm.setFieldValue("ST002@qry1.bfBal", bfBal, bfBal, true);
                                    thatForm.frm.setFieldValue("ST002@qry1.totIn", totin, totin, true);
                                    thatForm.frm.setFieldValue("ST002@qry1.totOut", totout, totout, true);
                                    thatForm.frm.setFieldValue("ST002@qry3.tit1", " pack = " + pkd, " pack = " + pkd, true);

                                    if (totavgcst >= 0) setTimeout(function () {
                                        thatForm.frm.objs["ST002@qry1.cst"].obj.$().find("*").css("cssText", UtilGen.DBView.style_debit_numbers + ";");
                                        thatForm.frm.objs["ST002@qry1.txtCst"].obj.$().css("cssText", UtilGen.DBView.style_debit_numbers + ";");
                                    });
                                    else setTimeout(function () {
                                        thatForm.frm.objs["ST002@qry1.cst"].obj.$().find("*").css("cssText", UtilGen.DBView.style_credit_numbers);
                                        thatForm.frm.objs["ST002@qry1.txtCst"].obj.$().css("cssText", UtilGen.DBView.style_credit_numbers);
                                    });

                                    var cl = thatForm.calcAge(thatForm.frm.getFieldValue("parameter.todate"), qv.mLctb, {
                                        colDebit: "PKQTYIN",
                                        colCredit: "PKQTYOUT",
                                        colDate: "INVOICE_DATE"
                                    });

                                    thatForm.frm.setFieldValue("ST002@qry3.b30", cl.b30, cl.b30, true);
                                    thatForm.frm.setFieldValue("ST002@qry3.b60", cl.b60, cl.b60, true);
                                    thatForm.frm.setFieldValue("ST002@qry3.b90", cl.b90, cl.b90, true);
                                    thatForm.frm.setFieldValue("ST002@qry3.b120", cl.b120, cl.b120, true);
                                    thatForm.frm.setFieldValue("ST002@qry3.b150", cl.b150, cl.b150, true);

                                    cl = thatForm.calcAge(thatForm.frm.getFieldValue("parameter.todate"), qv.mLctb, {
                                        colDebit: "PKCOST_AMT",
                                        colCredit: "PKCOST_AMT",
                                        colDate: "INVOICE_DATE"
                                    });

                                    thatForm.frm.setFieldValue("ST002@qry3.cb30", df.format(cl.b30), df.format(cl.b30), true);
                                    thatForm.frm.setFieldValue("ST002@qry3.cb60", df.format(cl.b60), df.format(cl.b60), true);
                                    thatForm.frm.setFieldValue("ST002@qry3.cb90", df.format(cl.b90), df.format(cl.b90), true);
                                    thatForm.frm.setFieldValue("ST002@qry3.cb120", df.format(cl.b120), df.format(cl.b120), true);
                                    thatForm.frm.setFieldValue("ST002@qry3.cb150", df.format(cl.b150), df.format(cl.b150), true);


                                },
                                // onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                // var oModel = this.getControl().getModel();
                                // var bal = parseFloat(oModel.getProperty("BALANCE", currentRowContext));
                                // if (bal >= 0)
                                //     qv.getControl().getRows()[dispRow].getCells()[3].$().css("color", "green");
                                // else
                                //     qv.getControl().getRows()[dispRow].getCells()[3].$().css("color", "red");


                                // },
                                bat7CustomAddQry: function (qryObj, ps) {

                                },

                                // beforeLoadQry: function (sql) {
                                // var sq =
                                //     "begin " +
                                //     "  cp_acc.plevelno:=:parameter.levelno;" +
                                //     "  cp_acc.pfromdt:=:parameter.fromdate;" +
                                //     "  cp_acc.ptodt:=:parameter.todate; " +
                                //     "  cp_acc.pfromacc:=':parameter.accno'; " +
                                //     "  cp_acc.build_gl('01'); " +
                                //     "  commit; " +
                                //     "end;";
                                // sq = thatForm.frm.parseString(sq);
                                // Util.doAjaxJson("sqlmetadata?", {
                                //     sql: sq,
                                //     ret: "NONE",
                                //     data: null
                                // }, false).done(function (data) {
                                // });
                                // return "select field1 accno,field2 name,field19 parentacc,field17 path," +
                                //     " to_number(field5) bdeb,to_number(field6) bcrd," +
                                //     " to_number(field7) tdeb, to_number(field8) tcrd, " +
                                //     " to_number(field13) cdeb, to_number(field14) ccrd, " +
                                //     " to_number(FIELD16) levelno" +
                                //     " from temporary " +
                                //     " where idno=66601 and usernm='01' order by field17 ";
                                // },
                                fields: {
                                    invoice_date: {
                                        colname: "invoice_date",
                                        data_type: FormView.DataType.Date,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "transDate",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "SHORT_DATE_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    code_namee: {
                                        colname: "code_namee",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "transType",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "font-size:11px;",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pur_inv_no: {
                                        colname: "pur_inv_no",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "noTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pkqtyin: {
                                        colname: "pkqtyin",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "qtyIn",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: UtilGen.DBView.style_debit_numbers + ";",
                                        display_format: "",
                                        default_value: "",
                                        summary: "SUM",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pkqtyout: {
                                        colname: "pkqtyout",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "qtyOut",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: UtilGen.DBView.style_credit_numbers + ";",
                                        display_format: "",
                                        summary: "SUM",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    balance: {
                                        colname: "balance",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "balanceTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        summary: "LAST",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },

                                    itpackd: {
                                        colname: "itpackd",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackD",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    avgcost: {
                                        colname: "avgcost",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "avgCost",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        summary: "LAST",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    avgcost_amt: {
                                        colname: "avgcost_amt",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "avgCostAmt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        summary: "LAST",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    stra: {
                                        colname: "stra",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "storeNo",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    refer: {
                                        colname: "refer",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCode",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    descr: {
                                        colname: "descr",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "descrTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "150",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    c_cus_no: {
                                        colname: "c_cus_no",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "refCode",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    ref_name: {
                                        colname: "ref_name",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "refName",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "150",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pkcost2: {
                                        colname: "pkcost2",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackCost",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        summary: "LAST",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    }
                                }
                            },
                            {
                                type: "query",
                                name: "qry3",
                                showType: FormView.QueryShowType.FORM,
                                dispRecords: -1,
                                execOnShow: false,
                                showToolbar: true,
                                canvas: "qryMCanvas3",
                                canvasType: ReportView.CanvasType.FORMCREATE2,
                                cavasSett: {
                                    width: "700px",
                                    cssText: [
                                        "padding-left:50px;" +
                                        "padding-top:20px;" +
                                        "border-style: inset;" +
                                        "margin-left: 10%;" +
                                        "margin-right: 10%;" +
                                        "border-radius:25px;" +
                                        "background-color:#dcdcdc;"
                                    ]
                                },
                                isMaster: false,
                                masterToolbarInMain: false,
                                dml: "select 0 bal from dual",
                                fields: {
                                    tit1: {
                                        colname: "tit1",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '{\"text\":\"stockAgeingTxt\",\"width\":\"25%\","textAlign":"Begin","styleClass":"boldText sapUiSmallMargin"}',
                                        title2: "",
                                        display_width: colSpan,
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "boldText paddingBottom10px",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        onPrintField: function () {
                                            return this.obj.$().outerHTML();
                                        },
                                        other_settings: {
                                            width: "25%",
                                            editable: false
                                        }
                                    },
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
                                    titC: {
                                        colname: "titC",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '{\"text\":\"stockAgeingCostTxt\",\"width\":\"25%\","textAlign":"Begin","styleClass":"boldText sapUiSmallMargin"}',
                                        title2: "",
                                        display_width: colSpan,
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "boldText paddingBottom10px",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        onPrintField: function () {
                                            return this.obj.$().outerHTML();
                                        },
                                        other_settings: {
                                            width: "25%",
                                            editable: false
                                        }
                                    },
                                    txtCB30: {
                                        colname: "txtCB30",
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
                                    txtCB60: {
                                        colname: "txtCB60",
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
                                    txtCB90: {
                                        colname: "txtCB90",
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
                                    txtCB120: {
                                        colname: "txtCB120",
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
                                    txtCB150: {
                                        colname: "txtCB150",
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
                                    cb30: {
                                        colname: "cb30",
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
                                    cb60: {
                                        colname: "cb60",
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
                                    cb90: {
                                        colname: "cb90",
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
                                    cb120: {
                                        colname: "cb120",
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
                                    cb150: {
                                        colname: "cb150",
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
                                    titD: {
                                        colname: "titD",
                                        data_type: FormView.DataType.String,
                                        class_name: ReportView.ClassTypes.LABEL,
                                        title: '{\"text\":\"\",\"width\":\"25%\","textAlign":"Begin","styleClass":"boldText sapUiSmallMargin"}',
                                        title2: "",
                                        display_width: colSpan,
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "boldText paddingBottom10px",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        onPrintField: function () {
                                            return this.obj.$().outerHTML();
                                        },
                                        other_settings: {
                                            width: "25%",
                                            editable: false
                                        }
                                    },

                                }
                            }
                        ]
                    }
                }
            ]
        };

        this.frm = new ReportView(this.mainPage);
        this.frm.parasAsLabels = true;
        return this.frm.createViewMain(this, js);

    },
    calcAge: function (currDate, ld, sett) {
        var b150, b120, b90, b60, b30 = 0;
        if (ld.rows.length == 0) return;
        var totdebit = 0, totcredit = 0, balance = 0;
        var getBal = function () {
            var tot = 0;
            for (var i = 0; i < ld.rows.length; i++) {
                tot += (ld.getFieldValue(i, sett.colDebit) - ld.getFieldValue(i, sett.colCredit));
                if (sett.colDebit != sett.colCredit) {
                    totdebit += ld.getFieldValue(i, sett.colDebit);
                    totcredit += ld.getFieldValue(i, sett.colCredit);
                } else {
                    if (ld.getFieldValue(i, sett.colDebit) > 0)
                        totdebit += ld.getFieldValue(i, sett.colDebit);
                    else
                        totcredit += Math.abs(ld.getFieldValue(i, sett.colCredit));
                }

            }
            balance = tot;
            return tot;
        };
        var getDebitByDate = function (fromdt, todt) {
            var dr = 0;
            for (var i = 0; i < ld.rows.length; i++) {
                var dt = new Date(ld.getFieldValue(i, sett.colDate).replaceAll(".", ":"));
                if ((fromdt == undefined || dt.setHours(0, 0, 0, 0) >= fromdt.setHours(0, 0, 0, 0)) && dt.setHours(0, 0, 0, 0) <= todt.setHours(0, 0, 0, 0))
                    if (sett.colDebit == sett.colCredit)
                        dr += (ld.getFieldValue(i, sett.colDebit) > 0 ? ld.getFieldValue(i, sett.colDebit) : 0);
                    else
                        dr += ld.getFieldValue(i, sett.colDebit);

            }
            return dr;
        };
        var getCreditByDate = function (fromdt, todt) {
            var cr = 0;
            for (var i = 0; i < ld.rows.length; i++) {
                var dt = new Date(ld.getFieldValue(i, sett.colDate).replaceAll(".", ":"));
                if ((fromdt == undefined || dt.setHours(0, 0, 0, 0) >= fromdt.setHours(0, 0, 0, 0)) && dt.setHours(0, 0, 0, 0) <= todt.setHours(0, 0, 0, 0))
                    if (sett.colDebit == sett.colCredit)
                        cr += (ld.getFieldValue(i, sett.colCredit) < 0 ? Math.abs(ld.getFieldValue(i, sett.colCredit)) : 0);
                    else
                        cr += ld.getFieldValue(i, sett.colCredit);

            }
            return cr;
        }
        balance = getBal();
        b150 = getDebitByDate(undefined, Util.addDaysFromDate(currDate, -121));
        if (b150 - totcredit < 0 && totcredit > 0) {
            totcredit = totcredit - b150;
            b150 = 0;
        } else {
            b150 = b150 - totcredit;
            totcredit = 0;
        }

        b120 = getDebitByDate(Util.addDaysFromDate(currDate, -120), Util.addDaysFromDate(currDate, -91));
        if (b120 - totcredit < 0 && totcredit > 0) {
            totcredit = totcredit - b120;
            b120 = 0;
        } else {
            b120 = b120 - totcredit;
            totcredit = 0;
        }

        b90 = getDebitByDate(Util.addDaysFromDate(currDate, -90), Util.addDaysFromDate(currDate, -61));
        if (b90 - totcredit < 0 && totcredit > 0) {
            totcredit = totcredit - b90;
            b90 = 0;
        } else {
            b90 = b90 - totcredit;
            totcredit = 0;
        }

        b60 = getDebitByDate(Util.addDaysFromDate(currDate, -60), Util.addDaysFromDate(currDate, -31));
        if (b60 - totcredit < 0 && totcredit > 0) {
            totcredit = totcredit - b60;
            b60 = 0;
        } else {
            b60 = b60 - totcredit;
            totcredit = 0;
        }

        b30 = getDebitByDate(Util.addDaysFromDate(currDate, -30), currDate);
        if (b30 - totcredit < 0 && totcredit > 0) {
            totcredit = totcredit - b30;
            b30 = 0;
        } else {
            b30 = b30 - totcredit;
            totcredit = 0;
        }

        return {
            "b150": b150,
            "b120": b120,
            "b90": b90,
            "b60": b60,
            "b30": b30
        };
    }
    ,
    loadData: function () {
    }

})
    ;



