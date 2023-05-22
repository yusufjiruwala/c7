sap.ui.jsfragment("bin.forms.rp.in.ss", {
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
            var sdf = new simpleDateFormat("MM/dd/yyyy");

            var tbl = obj.getParent().getParent();
            var mdl = tbl.getModel();
            var rr = tbl.getRows().indexOf(obj.getParent());
            var cont = tbl.getContextByIndex(rr);
            var todate = sdf.format(frm.getFieldValue("parameter.todate"));
            var fromdate = frm.getFieldValue("parameter.todate" == undefined) ? "01/01/" + todate.substr(6) : sdf.format(frm.getFieldValue("parameter.fromdate"));


            // var rowid = mdl.getProperty("_rowid", cont);
            // var it = Util.nvl(lctb.getFieldValue(rowid, "ACCNO"), "");
            var it = tbl.getRows()[rr].getCells()[0].getText();
            UtilGen.execCmd("rp.in.st formType=dialog formSize=100%,100% repno=1 para_PARAFORM=false para_EXEC_REP=true prefer=" + it + " fromdate=@" + fromdate + " todate=@" + todate, UtilGen.DBView, obj, UtilGen.DBView.newPage);
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
            title: Util.getLangText("ssRepTit"),
            title2: "",
            show_para_pop: false,
            reports: [
                {
                    code: "SS001",
                    name: Util.getLangText("ssRep1Name"),
                    descr: Util.getLangText("ssRep1Descr"),
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    showCustomPara: function (vbPara, rep) {

                    },
                    onSubTitHTML: function () {
                        var tbstr = Util.getLangText("ssRep1Name");
                        var ht = "<div class='reportTitle'>" + tbstr + "</div > ";
                        return ht;

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
                                        thatForm.frm.setFieldValue("SS001@parameter.prefer", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select descr from items where reference =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("SS001@parameter.acname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select reference,descr from items where itprice4=0 order by path", "DESCR", "REFERENCE", function (valx, val) {
                                            thatForm.frm.setFieldValue("SS001@parameter.prefer", valx, valx, true);
                                            thatForm.frm.setFieldValue("SS001@parameter.prefname", val, val, true);
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
                            exclzero: {
                                colname: "exclzero",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"exclZero\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
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
                                dml: "select '01' accno , 'do it' descr from dual",
                                parent: "PARENTACC",
                                levelCol: "",
                                code: "ACCNO",
                                title: "NAME",
                                fixedCols: 4,
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["ACCNO", "NAME"],
                                canvasType: ReportView.CanvasType.VBOX,
                                afterApplyCols: function (qryObj) {
                                    if (qryObj.name == "qry2") {
                                        var iq = thatForm.frm.getFieldValue("parameter.inclQty");
                                        var c = qryObj.obj.mLctb.getColPos("CQTY");
                                        var b = qryObj.obj.mLctb.getColPos("BQTY");
                                        var t = qryObj.obj.mLctb.getColPos("TQTY");
                                        if (iq == "Y") {
                                            qryObj.obj.mLctb.cols[c].mHideCol = false;
                                            qryObj.obj.mLctb.cols[b].mHideCol = false;
                                            qryObj.obj.mLctb.cols[t].mHideCol = false;
                                        }
                                        else {
                                            qryObj.obj.mLctb.cols[b].mHideCol = true;
                                            qryObj.obj.mLctb.cols[c].mHideCol = true;
                                            qryObj.obj.mLctb.cols[t].mHideCol = true;
                                        }
                                    }
                                },
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    var oModel = this.getControl().getModel();
                                    var cc = oModel.getProperty("CHILDCOUNT", currentRowContext);
                                    if (cc > 0)
                                        for (var i = startCell; i < endCell; i++) {
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("font-weight", "bold");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("background-color", "lightgrey");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("font-weight", "bold");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("background-color", "lightgrey");
                                        }

                                    var qt = parseFloat(oModel.getProperty("BQTY", currentRowContext));
                                    var css = (qt > 0 ? UtilGen.DBView.style_debit_numbers + ";text-align:center;" : UtilGen.DBView.style_credit_numbers + ";text-align:center;");
                                    UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "BQTY");

                                    qt = parseFloat(oModel.getProperty("TQTY", currentRowContext));
                                    css = (qt > 0 ? UtilGen.DBView.style_debit_numbers + ";text-align:center;" : UtilGen.DBView.style_credit_numbers + ";text-align:center;");
                                    UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "TQTY");

                                    qt = parseFloat(oModel.getProperty("CQTY", currentRowContext));
                                    css = (qt > 0 ? UtilGen.DBView.style_debit_numbers + ";text-align:center;" : UtilGen.DBView.style_credit_numbers + ";text-align:center;");
                                    UtilGen.setColorCellDrCr(qv, startCell, endCell, dispRow, css, "CQTY");

                                },
                                beforeLoadQry: function (sql) {
                                    var sq =
                                        "begin " +
                                        "  cp_items.plevelno:=:parameter.levelno;" +
                                        "  cp_items.pfromdt:=:parameter.fromdate;" +
                                        "  cp_items.ptodt:=:parameter.todate; " +
                                        "  cp_items.pfromrefer:=':parameter.prefer'; " +
                                        "  cp_items.build_gl('01'); " +
                                        "  commit; " +
                                        "end;";
                                    sq = thatForm.frm.parseString(sq);
                                    Util.doAjaxJson("sqlmetadata?", {
                                        sql: sq,
                                        ret: "NONE",
                                        data: null
                                    }, false).done(function (data) {
                                    });
                                    var ez = thatForm.frm.getFieldValue("parameter.exclzero");
                                    return "select field1 accno,field2 name,field19 parentacc,field17 path," +
                                        " to_number(field22)*items.pack avgcost , to_number(field5) bdeb, " +
                                        " to_number(field23)-to_number(field24) bqty ,to_number(field6) bcrd ," +
                                        " to_number(field7) tdeb, to_number(field8) tcrd, " +
                                        " to_number(field25)-to_number(field26) tqty ," +
                                        " to_number(field13) cdeb, to_number(field14) ccrd , " +
                                        " (to_number(field23)+to_number(field25))-(to_number(field24)+to_number(field26)) cqty ," +
                                        " to_number(FIELD16) levelno , to_number(field18) childcount ,items.packd " +
                                        " from temporary , items where field1 =reference" +
                                        " and idno=99901 " +
                                        (ez == "Y" ? " and to_number(field13)-to_number(field14)!=0  " : "") +
                                        " and usernm='01' order by field17 ";
                                },
                                fields: {
                                    accno: {
                                        colname: "accno",
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
                                    name: {
                                        colname: "name",
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
                                    parentacc: {
                                        colname: "parentacc",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "parentItemDescr",
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
                                    bdeb: {
                                        colname: "bdeb",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "inCost",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "openBal",
                                        parentSpan: 3,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: UtilGen.DBView.style_debit_numbers + ";",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    bcrd: {
                                        colname: "bcrd",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "outCost",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "openBal",
                                        parentSpan: 3,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: UtilGen.DBView.style_credit_numbers + ";",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    bqty: {
                                        colname: "bqty",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "netQty",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "openBal",
                                        parentSpan: 3,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    tdeb: {
                                        colname: "tdeb",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "inCost",
                                        title2: "",
                                        parentTitle: "transTxt",
                                        parentSpan: 3,
                                        valOnZero: "",
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: UtilGen.DBView.style_debit_numbers + ";",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    tcrd: {
                                        colname: "tcrd",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "outCost",
                                        title2: "",
                                        parentTitle: "transTxt",
                                        parentSpan: 3,
                                        valOnZero: "",
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: UtilGen.DBView.style_credit_numbers + ";",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    tqty: {
                                        colname: "tqty",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "netQty",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "transTxt",
                                        parentSpan: 3,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    cdeb: {
                                        colname: "cdeb",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "inCost",
                                        title2: "",
                                        parentTitle: "closeBal",
                                        parentSpan: 3,
                                        valOnZero: "",
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: UtilGen.DBView.style_debit_numbers + ";",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    ccrd: {
                                        colname: "ccrd",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "outCost",
                                        title2: "",
                                        parentTitle: "summaryBalTxt",
                                        parentSpan: 3,
                                        valOnZero: "",
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: UtilGen.DBView.style_credit_numbers + ";",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    cqty: {
                                        colname: "cqty",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "netQty",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "summaryBalTxt",
                                        parentSpan: 3,
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
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
    loadData: function () {
    }

})
    ;



