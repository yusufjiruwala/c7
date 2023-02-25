sap.ui.jsfragment("bin.forms.rp.pl", {
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
            var mdl = frm.objs["PL001@qry2"].obj.getControl().getModel();
            var rr = frm.objs["PL001@qry2"].obj.getControl().getRows().indexOf(obj.getParent());
            var cont = frm.objs["PL001@qry2"].obj.getControl().getContextByIndex(rr);
            var rowid = mdl.getProperty("_rowid", cont);
            // var ac = Util.nvl(lctb.getFieldValue(rowid, "ACCNO"), "");
            var ac = frm.objs["PL001@qry2"].obj.getControl().getRows()[rr].getCells()[0].getText();

            var mnu = new sap.m.Menu();
            mnu.removeAllItems();

            mnu.addItem(new sap.m.MenuItem({
                text: "SOA A/c -" + ac,
                customData: { key: ac },
                press: function () {
                    var accno = this.getCustomData()[0].getKey();
                    UtilGen.execCmd("testRep5 formType=dialog formSize=100%,80% repno=1 para_PARAFORM=false para_EXEC_REP=true fromacc=" + accno + " toacc=" + accno + " fromdate=@01/01/2020", UtilGen.DBView, obj, UtilGen.DBView.newPage);
                }
            }));
            mnu.addItem(new sap.m.MenuItem({
                text: "View A/c -" + ac,
                customData: { key: ac },
                press: function () {
                    var accno = this.getCustomData()[0].getKey();
                    UtilGen.execCmd("bin.forms.gl.masterAc formType=dialog formSize=650px,300px status=view accno=" + accno, UtilGen.DBView, obj, UtilGen.DBView.newPage);
                }
            }));
            mnu.openBy(obj);

        }
        // UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];

        var sc = new sap.m.ScrollContainer();

        var js = {
            title: "P&L",
            title2: "Profit & Loss",
            show_para_pop: false,
            reports: [
                {
                    code: "PL001",
                    name: "Profit & Loss",
                    descr: "Simple Profit and loss by accounts and levels",
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
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
                            fromdate: {
                                colname: "fromdate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '{\"text\":\"From Date\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
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
                                title: '@{\"text\":\"To\",\"width\":\"15%\","textAlign":"End"}',
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
                            accno: {
                                colname: "accno",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"A/c No\",\"width\":\"15%\","textAlign":"End"}',
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
                                        thatForm.frm.setFieldValue("PL001@parameter.accno", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select name from acaccount where actype=1 and accno =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("PL001@parameter.acname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select accno,name from acaccount where actype=1 order by path", "NAME", "ACCNO", function (valx, val) {
                                            thatForm.frm.setFieldValue("PL001@parameter.accno", valx, valx, true);
                                            thatForm.frm.setFieldValue("PL001@parameter.acname", val, val, true);
                                        });

                                    },
                                    width: "35%"
                                },
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                            acname: {
                                colname: "acname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: { width: "49%", editable: false },
                                list: undefined,
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true,
                                dispInPara: true,
                            },
                            levelno: {
                                colname: "levelno",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Level\",\"width\":\"15%\","textAlign":"End"}',
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
                        },
                        print_templates: [
                            {
                                title: "PL Report",
                                reportFile: "trans_1",
                            }
                        ],
                        canvas: [],
                        db: [
                            {
                                type: "query",
                                name: "qry2",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                disp_class: "reportTable2",
                                dispRecords: { "S": 10, "M": 14, "L": 18 },
                                execOnShow: false,
                                dml: "select '01' accno , 'do it' descr from dual",
                                parent: "PARENTACC",
                                levelCol: "LEVELNO",
                                code: "ACCNO",
                                title: "NAME",
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["ACCNO", "NAME"],
                                canvasType: ReportView.CanvasType.VBOX,
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    var oModel = this.getControl().getModel();
                                    var ac = oModel.getProperty("ACCNO", currentRowContext);
                                    var flg = oModel.getProperty("FLG", currentRowContext)
                                    if (ac == "-")
                                        for (var i = startCell; i < endCell; i++) {
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("background-color", "#ffffe0");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("color", "maroon");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("background-color", "#ffffe0");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().css("background-color", "#ffffe0");
                                        }

                                    if (flg == "1")
                                        for (var i = startCell; i < endCell; i++) {
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("background-color", "#e6e6fa");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("color", "darkgreen");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("background-color", "#e6e6fa");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().css("background-color", "#e6e6fa");
                                        }


                                },
                                beforeLoadQry: function (sql) {
                                    var sq =
                                        "begin " +
                                        "  cp_acc_pl.plevelno:=:parameter.levelno;" +
                                        "  cp_acc_pl.pfromdt:=:parameter.fromdate;" +
                                        "  cp_acc_pl.ptodt:=:parameter.todate; " +
                                        "  cp_acc_pl.pfromacc:=':parameter.accno'; " +
                                        "  cp_acc_pl.build_gl('01'); " +
                                        "  commit; " +
                                        "end;";
                                    sq = thatForm.frm.parseString(sq);
                                    Util.doAjaxJson("sqlmetadata?", {
                                        sql: sq,
                                        ret: "NONE",
                                        data: null
                                    }, false).done(function (data) {
                                    });
                                    return "select field1 accno,field2 name,field19 parentacc,field17 path," +
                                        " to_number(field5) bdeb,to_number(field6) bcrd," +
                                        " to_number(field7) tdeb, to_number(field8) tcrd, " +
                                        " to_number(field13) cdeb, to_number(field14) ccrd, " +
                                        " to_number(FIELD16) levelno,field20 flg" +
                                        " from temporary " +
                                        " where idno=66602 and usernm='01' and (:parameter.levelno=0 or to_number(FIELD16)<=:parameter.levelno )  order by field17 ";
                                },
                                bat7CustomAddQry: function (qryObj, ps) {

                                },
                                fields: {
                                    accno: {
                                        colname: "accno",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Acc No",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "220",
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
                                        title: "Name",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "375",
                                        display_align: "ALIGN_LEFT",
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    parentacc: {
                                        colname: "parentacc",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "parentacc",
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
                                    cdeb: {
                                        colname: "cdeb",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Debit",
                                        title2: "",
                                        parentTitle: "Balance",
                                        parentSpan: 2,

                                        display_width: "200",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "color:green;",
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
                                        title: "Credit",
                                        title2: "",
                                        parentTitle: "Balance",
                                        parentSpan: 2,
                                        display_width: "200",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "color:red;",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    flg: {
                                        colname: "flg",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "FLAG",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        display_type: "INVISIBLE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },

                                }
                            }
                        ]
                    }
                },
                {
                    code: "PL002",
                    name: "Profit & Loss By Month",
                    descr: "Monthly Profit and loss by accounts and levels",
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
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
                            fromdate: {
                                colname: "fromdate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '{\"text\":\"From Date\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
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
                                title: '@{\"text\":\"To\",\"width\":\"15%\","textAlign":"End"}',
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
                            accno: {
                                colname: "accno",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"A/c No\",\"width\":\"15%\","textAlign":"End"}',
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
                                        thatForm.frm.setFieldValue("PL002@parameter.accno", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select name from acaccount where actype=1 and accno =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("PL002@parameter.acname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select accno,name from acaccount where actype=1 order by path", "NAME", "ACCNO", function (valx, val) {
                                            thatForm.frm.setFieldValue("PL002@parameter.accno", valx, valx, true);
                                            thatForm.frm.setFieldValue("PL002@parameter.acname", val, val, true);
                                        });

                                    },
                                    width: "35%"
                                },
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                            acname: {
                                colname: "acname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
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
                                title: '{\"text\":\"Level\",\"width\":\"15%\","textAlign":"End"}',
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
                        },
                        print_templates: [
                            {
                                title: "PL Report",
                                reportFile: "trans_1",
                            }
                        ],
                        canvas: [],
                        db: [
                            {
                                type: "query",
                                name: "qry2",
                                showType: FormView.QueryShowType.FORM,
                                disp_class: "",
                                dispRecords: -1,
                                execOnShow: false,
                                dml: "",
                                parent: "",
                                levelCol: "",
                                code: "",
                                title: "",
                                isMaster: false,
                                isCrossTb: "N",
                                showToolbar: false,
                                masterToolbarInMain: false,
                                filterCols: [],
                                canvasType: ReportView.CanvasType.VBOX,
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    var oModel = this.getControl().getModel();
                                    var cl = qv.getControl().getColumns();
                                    for (var ci in cl) {
                                        var ac = oModel.getProperty("ACCNO", currentRowContext);
                                        var flg = oModel.getProperty("FLG", currentRowContext)
                                        if (ac == "-")
                                            for (var i = startCell; i < endCell; i++) {
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("background-color", "#ffffe0");
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("color", "maroon");
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("background-color", "#ffffe0");
                                                qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().css("background-color", "#ffffe0");
                                            }
                                        
                                        if (cl[ci].name.endsWith("__BALANCE")) {
                                            var bl = oModel.getProperty(cl[ci].name, currentRowContext);
                                            if (bl >= 0)
                                                qv.getControl().getRows()[dispRow].getCells()[i].$().css("color", "green");
                                            else
                                                qv.getControl().getRows()[dispRow].getCells()[i].$().css("color", "red");
                                        }

                                    }

                                },
                                bat7CustomAddQry: function (qryObj, ps) {

                                },
                                fields: {
                                    accno: {
                                        colname: "accno",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.VBOX,
                                        title: '',
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        onPrintField: function () {
                                            return thatForm.qr.getHTMLTable(that.view, "para", false);
                                        },
                                        afterAddOBject: function () {
                                            thatForm.qr = new QueryView("qry" + thatForm.timeInLong);

                                            thatForm.qr.createToolbar("reportTable2", ["ACCNO", "NAME"], function (prsn, qv) { }, function (qv) { });

                                            thatForm.qr.isCrossTb = "Y";
                                            thatForm.qr.mColParent = "PARENTACC";
                                            thatForm.qr.mColCode = "ACCNO";
                                            thatForm.qr.mColName = "NAME";
                                            thatForm.qr.mColLevel = "LEVELNO";
                                            thatForm.qr.switchType("tree");

                                            this.obj.addItem(thatForm.qr.showToolbar.toolbar);
                                            this.obj.addItem(thatForm.qr.getControl());
                                            thatForm.qr.getControl().view = thatForm.view;

                                            thatForm.qr.getControl().addStyleClass("sapUiSizeCondensed reportTable2");
                                            thatForm.qr.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);
                                            thatForm.qr.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
                                            thatForm.qr.getControl().setAlternateRowColors(false);
                                            thatForm.qr.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
                                            thatForm.qr.getControl().setFixedBottomRowCount(1);
                                            thatForm.qr.getControl().setFixedColumnCount(2);

                                            var dispRecs = UtilGen.dispTblRecsByDevice({ "S": 10, "M": 14, "L": 18 });
                                            thatForm.qr.getControl().setVisibleRowCount(dispRecs);
                                        },
                                        bat7OnSetFieldAddQry: function (qryObj, ps) {
                                            var ret = true;
                                            var ag = thatForm.frm.getFieldValue("PL002@parameter.accno");
                                            if (ag == "NONE") {
                                                this.obj.setVisible(false);
                                                return;
                                            }
                                            var sq =
                                                "begin " +
                                                "  cp_acc_pl_monthly.plevelno:=:parameter.levelno;" +
                                                "  cp_acc_pl_monthly.pfromdt:=:parameter.fromdate;" +
                                                "  cp_acc_pl_monthly.ptodt:=:parameter.todate; " +
                                                "  cp_acc_pl_monthly.pfromacc:=':parameter.accno'; " +
                                                "  cp_acc_pl_monthly.build_gl('01'); " +
                                                "  commit; " +
                                                "end;";
                                            sq = thatForm.frm.parseString(sq);
                                            Util.doAjaxJson("sqlmetadata?", {
                                                sql: sq,
                                                ret: "NONE",
                                                data: null
                                            }, false).done(function (data) {
                                            });
                                            sq = "SELECT ACCNO,NAME,PARENTACC,LEVELNO,MNTH||'__BALANCE' MNTH_BAL, TDEB-TCRD BALANCE FROM " +
                                                " (select REPLACE(FIELD30,'/','_') MNTH,field1 accno,field2 name,field19 parentacc,field17 path, " +
                                                "to_number(field5) bdeb,to_number(field6) bcrd, " +
                                                "to_number(field7) tdeb, to_number(field8) tcrd," +
                                                "to_number(field13) cdeb, to_number(field14) ccrd," +
                                                "to_number(FIELD16) levelno,field20 flg " +
                                                " from temporary " +
                                                " where idno=66602 and usernm='01' and (0=0 or to_number(FIELD16)<=0 )  order by TO_NUMBER(FIELD15)) ";
                                            sq = thatForm.frm.parseString(sq);
                                            var pars = Util.nvl(qryObj.rep.rep.parameters, []);

                                            Util.doAjaxJson("bat7addQry?" + ps, {
                                                sql: sq,
                                                ret: "",
                                                data: "",
                                                repCode: qryObj.rep.code,
                                                repNo: qryObj.repNo,
                                                command: "",
                                                scheduledAt: "",
                                                p1: "",
                                                p2: "",
                                                qrNo: 1001,
                                            }, false).done(function (data) {
                                                if (!data.ret == "SUCCESS") {
                                                    ret = false;
                                                }
                                            });
                                            return ret;
                                        },
                                        bat7OnSetFieldGetData: function (qryObj) {
                                            var thatObj = this;
                                            Util.doAjaxJson("bat7getData", {
                                                sql: "",
                                                ret: "",
                                                data: "",
                                                repCode: qryObj.rep.code,
                                                repNo: qryObj.repNo,
                                                command: "",
                                                scheduledAt: "",
                                                p1: "",
                                                p2: "",
                                                qrNo: 1001,
                                            }, false).done(function (dt) {
                                                if (dt.ret == "SUCCESS" && thatForm.qr != undefined) {
                                                    // var dtx = JSON.parse("{" + dt.data + "}").data;

                                                    thatForm.qr.setJsonStrMetaData("{" + dt.data + "}");
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("ACCNO")].ct_row = "Y";
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("NAME")].ct_row = "Y";
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("PARENTACC")].ct_row = "Y";
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("LEVELNO")].ct_row = "Y";

                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("MNTH_BAL")].ct_col = "Y";
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("MNTH_BAL")].ct_col = "Y";

                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("BALANCE")].ct_val = "Y";
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("BALANCE")].data_type = "number";
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("BALANCE")].mUIHelper.display_format = "MONEY_FORMAT";
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("BALANCE")].mSummary = "SUM";
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("BALANCE")].mUIHelper.display_style = "";

                                                    thatForm.qr.mLctb.parse("{" + dt.data + "}", true);
                                                    thatForm.qr.mLctb.do_cross_tab();

                                                    thatForm.qr.switchType("tree");
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("PARENTACC")].mHideCol = true;
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("LEVELNO")].mHideCol = true;
                                                    thatForm.qr.mLctb.cols[thatForm.qr.mLctb.getColPos("tot__BALANCE")].mUIHelper.display_style = "background-color:lightgrey;";
                                                    thatForm.qr.loadData();
                                                }
                                            });
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

    }
    ,
    loadData: function () {
        //alert(sap.ui.Device.resize.height);
        // var that = this;
        // var sq = "select accno,name,debit,credit from acc_balance_1 order by path";
        // Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
        //     if (data.ret == "SUCCESS") {
        //         that.qv.setJsonStrMetaData("{" + data.data + "}");
        //         var c = that.qv.mLctb.getColPos("DEBIT");
        //         that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
        //         that.qv.mLctb.cols[c].mSummary = "SUM";
        //         c = that.qv.mLctb.getColPos("CREDIT");
        //         that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
        //         that.qv.mLctb.cols[c].mSummary = "SUM";
        //
        //         that.qv.mLctb.parse("{" + data.data + "}", true);
        //         that.qv.loadData();
        //         // that.qv.getControl().setVisibleRowCount(that.qv.mLctb.rows.length + 3);
        //     }
        // });

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



