sap.ui.jsfragment("bin.forms.rp.in.sa", {
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
            if (obj == undefined) return;
            var sett = sap.ui.getCore().getModel("settings").getData();
            var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

            var tbl = obj.getParent().getParent();
            var mdl = tbl.getModel();
            var rr = tbl.getRows().indexOf(obj.getParent());
            var cont = tbl.getContextByIndex(rr);
            var fromdt = sdf.format(frm.getFieldValue("parameter.fromdate"));

            // var rowid = mdl.getProperty("_rowid", cont);
            // var it = Util.nvl(lctb.getFieldValue(rowid, "ACCNO"), "");
            var it = tbl.getRows()[rr].getCells()[0].getText();
            UtilGen.execCmd("rp.in.st formType=dialog formSize=100%,100% repno=1 para_PARAFORM=false para_EXEC_REP=true prefer=" + it + " fromdate=@" + fromdt, UtilGen.DBView, obj, UtilGen.DBView.newPage);
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
            title: Util.getLangText("saRep1Tit"),
            title2: "",
            show_para_pop: false,
            reports: [
                {
                    code: "SA001",
                    name: Util.getLangText("saRepName1"),
                    descr: Util.getLangText("saRepDescr1"),
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    showCustomPara: function (vbPara, rep) {
                        var chk = new sap.m.CheckBox({
                            text: "Exclude zero qty",
                            select: function (ev) {
                                if (ev.getParameters().selected) {
                                    rep.db[0].obj.mViewSettings["filterStr"] = "totqty>0";
                                    rep.db[0].obj.loadData();
                                    that2.frm.helperFunctions.misc.showDisplayRecs(rep.rptNo);
                                }
                                else {
                                    rep.db[0].obj.mViewSettings["filterStr"] = "";
                                    rep.db[0].obj.loadData();
                                    that2.frm.helperFunctions.misc.showDisplayRecs(rep.rptNo);

                                }

                            }
                        });
                        var vb = new sap.m.VBox({
                            selected: true,
                            items: [
                                chk
                            ]
                        });
                        vbPara.addItem(vb);
                        vbPara.addItem(new sap.m.Text({ height: "100px" }));
                    },
                    onSubTitHTML: function () {
                        return "";
                    },
                    mainParaContainerSetting: {
                        width: "600px",
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
                    rep: {
                        parameters: {
                            fromdate: {
                                colname: "fromdate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '{\"text\":\"fromDate\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "$FIRSTDATEOFYEAR",
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
                                title: '@{\"text\":\"toDate\",\"width\":\"15%\","textAlign":"End"}',
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
                                        thatForm.frm.setFieldValue("SA001@parameter.prefer", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select descr from items where reference =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("SA001@parameter.prefname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select reference,descr from items where itprice4=0 order by path", "DESCR", "REFERENCE", function (valx, val) {
                                            thatForm.frm.setFieldValue("SA001@parameter.prefer", valx, valx, true);
                                            thatForm.frm.setFieldValue("SA001@parameter.prefname", val, val, true);
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
                            levelno: {
                                colname: "levelno",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"levelNo\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
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
                            },
                            inclQty: {
                                colname: "inclQty",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"incQty\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_LEFT",
                                display_style: "",
                                display_format: "",
                                other_settings: { selected: true, width: "20%", trueValues: ["Y", "N"] },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false,
                                dispInPara: true,
                                trueValues: ["Y", "N"]
                            },
                        },
                        print_templates: [
                            {
                                title: "PDF",
                                reportFile: "tb001",
                            }
                        ],
                        canvas: [],
                        db: [
                            {
                                type: "query",
                                name: "qry2",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                disp_class: "reportTable2",
                                dispRecords: { "S": 10, "M": 14, "L": 20 },
                                execOnShow: false,
                                dml: "select reference,descr, descr2,parentitem, childcounts childcount,packd,levelno, 0 avgcost," +
                                    "pack,unitd,0 b30,0 bq30,0 b60,0 bq60,0 b90,0 bq90,0 b120 ,0 bq120,0 totcost,0 totqty " +
                                    "from items where descr2 like ((select nvl(max(DESCR2),'')||'%' from items where items.reference=':parameter.prefer' )) " +
                                    " order by descr2 "
                                ,
                                parent: "PARENTITEM",
                                levelCol: "LEVELNO",
                                code: "REFERENCE",
                                title: "DESCR",
                                fixedCols: 4,
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["REFERENCE", "DESCR",],
                                canvasType: ReportView.CanvasType.VBOX,
                                afterApplyCols: function (qryObj) {
                                    thatForm.dtxQry = undefined;
                                    if (qryObj.name == "qry2") {
                                        var iq = thatForm.frm.getFieldValue("parameter.inclQty");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("BQ30")].mHideCol = (iq != "Y");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("BQ60")].mHideCol = (iq != "Y");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("BQ90")].mHideCol = (iq != "Y");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("BQ120")].mHideCol = (iq != "Y");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("BQ150")].mHideCol = (iq != "Y");

                                    }

                                },
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    var oModel = this.getControl().getModel();
                                    var ta = Util.getLangDescrAR(";text-align:end;", ";text-align:begin;");
                                    var fx = qv.getControl().getFixedBottomRowCount();
                                    if (dispRow >= qv.getControl().getVisibleRowCount() - fx) return;


                                    var qt = parseFloat(Util.nvl(oModel.getProperty("B150", currentRowContext), 0));
                                    if (qt != 0) {
                                        var css = (qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "B150");
                                    }

                                    var qt = parseFloat(Util.nvl(oModel.getProperty("BQ150", currentRowContext), 0));
                                    if (qt != 0) {
                                        var css = (qt != 0 && qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "BQ150");
                                    }


                                    qt = parseFloat(Util.nvl(oModel.getProperty("B120", currentRowContext), "0").replaceAll(",", ""));
                                    if (qt != 0) {
                                        var css = (qt != 0 && qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "B120");
                                    }
                                    qt = parseFloat(Util.nvl(oModel.getProperty("BQ120", currentRowContext), "0").replaceAll(",", ""));

                                    if (qt != 0) {
                                        var css = (qt != 0 && qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "BQ120");
                                    }

                                    qt = parseFloat(Util.nvl(oModel.getProperty("B90", currentRowContext), "0").replaceAll(",", ""));
                                    if (qt != 0) {
                                        var css = (qt != 0 && qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "B90");
                                    }

                                    qt = parseFloat(Util.nvl(oModel.getProperty("BQ90", currentRowContext), "0").replaceAll(",", ""));
                                    if (qt != 0) {
                                        var css = (qt != 0 && qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "BQ90");
                                    }

                                    qt = parseFloat(Util.nvl(oModel.getProperty("B60", currentRowContext), "0").replaceAll(",", ""));
                                    if (qt != 0) {
                                        var css = (qt != 0 && qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "B60");
                                    }

                                    qt = parseFloat(Util.nvl(oModel.getProperty("BQ60", currentRowContext), "0").replaceAll(",", ""));
                                    if (qt != 0) {
                                        var css = (qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "BQ60");
                                    }

                                    qt = parseFloat(Util.nvl(oModel.getProperty("B30", currentRowContext), "0").replaceAll(",", ""));
                                    if (qt != 0) {
                                        var css = (qt != 0 && qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "B30");
                                    }

                                    qt = parseFloat(Util.nvl(oModel.getProperty("BQ30", currentRowContext), "0").replaceAll(",", ""));
                                    if (qt != 0) {
                                        var css = (qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "BQ30");
                                    }

                                    qt = parseFloat(Util.nvl(oModel.getProperty("TOTCOST", currentRowContext), "0").replaceAll(",", ""));
                                    if (qt != 0) {
                                        var css = (qt != 0 && qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "TOTCOST");
                                    }

                                    qt = parseFloat(Util.nvl(oModel.getProperty("TOTQTY", currentRowContext), "0").replaceAll(",", ""));
                                    if (qt != 0) {
                                        var css = (qt > 0 ? UtilGen.DBView.style_debit_numbers + ta : UtilGen.DBView.style_credit_numbers + ta);
                                        UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "TOTQTY");
                                    }

                                },
                                eventCalc: function (qv, cx, rowno, reAmt) {
                                    var sett = sap.ui.getCore().getModel("settings").getData();
                                    var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
                                    if (rowno >= 0) return;

                                    var ld = qv.mLctb;
                                    var iq = thatForm.frm.getFieldValue("parameter.inclQty");
                                    var iq = thatForm.frm.getFieldValue("parameter.inclQty");
                                    if (thatForm.dtxQry == undefined) {
                                        var sq = "SELECT   REFER, invoice_date,nvl(descr,descra) DESCRA, ITPACKD, " +
                                            " NVL (SUM ( (PKCOST) * (qtyin)), 0) TOTIN," +
                                            " NVL (SUM ( (PKCOST) * (qtyout)), 0) TOTOUT," +
                                            " NVL (SUM (ROUND ( (qtyin - qtyout), 3) / PACK), 0) qtyx,max(0) pack_cost,  " +
                                            " PKAVER, NVL (SUM ( (PKCOST) * (qtyin - qtyout)), 0) costamt, descr2," +
                                            " NVL (SUM (qtyin), 0) qtyin," +
                                            " NVL (SUM ( qtyout), 0) qtyout," +
                                            " PARENTITEM , PARENTITEMDESCR " +
                                            " FROM   JOINED_INVOICE  WHERE  ITPRICE4=0 and (STRA = 0 or 0=0 ) " +
                                            " AND invoice_date<=:parameter.todate " +
                                            " GROUP BY   REFER, invoice_date,descr2,  nvl(descr,descra) , ITPACKD,PKAVER,PARENTITEM , PARENTITEMDESCR  " +
                                            " ORDER BY  descr2 ";
                                        sq = thatForm.frm.parseString(sq);
                                        var dt = Util.execSQL(sq);
                                        if (dt.ret == "SUCCESS") {
                                            thatForm.dtxQry = new LocalTableData();
                                            thatForm.dtxQry.parse("{" + dt.data + "}", false);
                                        }
                                    }
                                    for (var ri = 0; ri < ld.rows.length; ri++) {

                                        // for  cost 
                                        var cl = thatForm.calcAge(thatForm.frm.getFieldValue("parameter.todate"), thatForm.dtxQry, {
                                            colDebit: "TOTIN",
                                            colCredit: "TOTOUT",
                                            colDate: "INVOICE_DATE",
                                            pathCol: "DESCR2"
                                        }, ld.getFieldValue(ri, "DESCR2"));
                                        qv.mLctb.setFieldValue(ri, "B30", cl.b30);
                                        qv.mLctb.setFieldValue(ri, "B60", cl.b60);
                                        qv.mLctb.setFieldValue(ri, "B90", cl.b90);
                                        qv.mLctb.setFieldValue(ri, "B120", cl.b120);
                                        qv.mLctb.setFieldValue(ri, "B150", cl.b150);
                                        qv.mLctb.setFieldValue(ri, "TOTCOST", cl.b150 + cl.b120 + cl.b90 + cl.b60 + cl.b30);

                                        // for quanitty
                                        // if (iq == "Y") {    
                                        var cl = thatForm.calcAge(thatForm.frm.getFieldValue("parameter.todate"), thatForm.dtxQry, {
                                            colDebit: "QTYIN",
                                            colCredit: "QTYOUT",
                                            colDate: "INVOICE_DATE",
                                            pathCol: "DESCR2"
                                        }, ld.getFieldValue(ri, "DESCR2"));
                                        qv.mLctb.setFieldValue(ri, "BQ30", cl.b30);
                                        qv.mLctb.setFieldValue(ri, "BQ60", cl.b60);
                                        qv.mLctb.setFieldValue(ri, "BQ90", cl.b90);
                                        qv.mLctb.setFieldValue(ri, "BQ120", cl.b120);
                                        qv.mLctb.setFieldValue(ri, "BQ150", cl.b150);
                                        qv.mLctb.setFieldValue(ri, "TOTQTY", cl.b150 + cl.b120 + cl.b90 + cl.b60 + cl.b30);

                                        // qryObj.obj.loadData();

                                        // }
                                    }
                                },
                                fields: {
                                    reference: {
                                        colname: "reference",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCode",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
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
                                        title: "itemDescr",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "220",
                                        display_align: "ALIGN_LEFT",
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    packd: {
                                        colname: "packd",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackD",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "80",
                                        display_align: "ALIGN_RIGHT",
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
                                        display_style: "background-color:lightyellow;",
                                        display_format: "MONEY_FORMAT",
                                        display_type: "NONE",
                                        other_settings: {},
                                        grouped: false,
                                    },
                                    parentitem: {
                                        colname: "parentitem",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "parentItem",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "300",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        display_type: "INVISIBLE",
                                        other_settings: {},
                                        grouped: false,
                                    },
                                    childcount: {
                                        colname: "childcount",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "childcount",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "10",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        display_type: "INVISIBLE",
                                        other_settings: {},
                                        grouped: false,
                                    },
                                    b30: {
                                        colname: "b30",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCostAmt",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b30Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    bq30: {
                                        colname: "bq30",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackQty",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b30Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    b60: {
                                        colname: "b60",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCostAmt",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b60Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    bq60: {
                                        colname: "bq60",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackQty",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b60Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    b90: {
                                        colname: "b90",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCostAmt",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b90Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    bq90: {
                                        colname: "bq90",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackQty",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b90Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    b120: {
                                        colname: "b120",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCostAmt",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b120Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    bq120: {
                                        colname: "bq120",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackQty",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b120Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    b150: {
                                        colname: "b150",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCostAmt",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b150Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    bq150: {
                                        colname: "bq150",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackQty",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "b150Txt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    totcost: {
                                        colname: "totcost",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "totalCost",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "totalTxt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    totqty: {
                                        colname: "totqty",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "totalQty",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "totalTxt",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
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

    }
    ,
    calcAge: function (currDate, ld, sett, pth) {
        var b150, b120, b90, b60, b30 = 0;
        if (ld.rows.length == 0) return;
        var totdebit = 0, totcredit = 0, balance = 0;
        var getBal = function () {
            var tot = 0;
            var dta_processed = false; // processed the data once then break 
            for (var i = 0; i < ld.rows.length; i++) {
                if (!ld.getFieldValue(i, sett.pathCol).startsWith(pth) && dta_processed)
                    break;
                if (!ld.getFieldValue(i, sett.pathCol).startsWith(pth))
                    continue;
                else {
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
                    dta_processed = true;
                }
            }
            balance = tot;
            return tot;
        };
        var getDebitByDate = function (fromdt, todt) {
            var dr = 0;
            var dta_processed = false; // processed the data once then break 
            for (var i = 0; i < ld.rows.length; i++) {
                if (!ld.getFieldValue(i, sett.pathCol).startsWith(pth) && dta_processed)
                    break;
                if (!ld.getFieldValue(i, sett.pathCol).startsWith(pth))
                    continue;
                else {
                    var dt = new Date(ld.getFieldValue(i, sett.colDate).replaceAll(".", ":"));
                    if ((fromdt == undefined || dt.setHours(0, 0, 0, 0) >= fromdt.setHours(0, 0, 0, 0)) && dt.setHours(0, 0, 0, 0) <= todt.setHours(0, 0, 0, 0))
                        if (sett.colDebit == sett.colCredit)
                            dr += (ld.getFieldValue(i, sett.colDebit) > 0 ? ld.getFieldValue(i, sett.colDebit) : 0);
                        else
                            dr += ld.getFieldValue(i, sett.colDebit);
                }
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
        };
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
    },
    loadData: function () {
    }

})
    ;



