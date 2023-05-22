sap.ui.jsfragment("bin.forms.rp.tb", {
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
            var tbl = obj.getParent().getParent();
            var mdl = tbl.getModel();
            var rr = tbl.getRows().indexOf(obj.getParent());
            var cont = tbl.getContextByIndex(rr);
            var rowid = mdl.getProperty("_rowid", cont);
            // var ac = Util.nvl(lctb.getFieldValue(rowid, "ACCNO"), "");
            var ac = tbl.getRows()[rr].getCells()[0].getText();

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
                    UtilGen.execCmd("bin.forms.gl.masterAc formType=dialog formSize=650px,400px status=view accno=" + accno, UtilGen.DBView, obj, UtilGen.DBView.newPage);
                }
            }));
            mnu.openBy(obj);

        }
        // UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];

        // this.frm = this.createViewHeader();
        // this.frm.getToolbar().addContent(this.bk);

        // Util.destroyID("poCmdSave", this.view);
        // this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
        //     icon: "sap-icon://save", press: function () {
        //         that.save_data();
        //     }
        // }));
        //
        // Util.destroyID("poCmdDel", this.view);
        // this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdDel"), {
        //     icon: "sap-icon://delete", press: function () {
        //         that.delete_data();
        //     }
        // }));
        // that.createScrollCmds(this.frm.getToolbar());

        var sc = new sap.m.ScrollContainer();

        var js = {
            title: Util.getLangText("trialBalance"),
            title2: "",
            show_para_pop: false,
            reports: [
                {
                    code: "TB001",
                    name: "Trial Balance",
                    nameAR: "ميزان المراجعة",
                    descr: "Standard Trial balance with debit/credit transaction on give period",
                    descrAR: "ميزان المراجعة مع المعاملات في فترة معينة",
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    showCustomPara: function (vbPara, rep) {

                    },
                    onSubTitHTML: function () {
                        var up = thatForm.frm.getFieldValue("parameter.unposted");
                        var tbstr = Util.getLangText("trialBalance");
                        var ua = Util.getLangText("unAudited");
                        var cs = thatForm.frm.getFieldValue("parameter.costcent");
                        var csnm = thatForm.frm.getFieldValue("parameter.csname");
                        var ht = "<div class='reportTitle'>" + tbstr + (up == "Y" ? " (" + ua + ") " : "") + "</div > ";
                        if (cs != "")
                            ht += "<div class='reportTitle2'>" + Util.getLangText("costCent") + " : " + cs + "-" + csnm + "</div > ";
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
                            accno: {
                                colname: "accno",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"accNo\",\"width\":\"15%\","textAlign":"End"}',
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
                                        thatForm.frm.setFieldValue("TB001@parameter.accno", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select name from acaccount where accno =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("TB001@parameter.acname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select accno,name from acaccount where actype=0 order by path", "NAME", "ACCNO", function (valx, val) {
                                            thatForm.frm.setFieldValue("TB001@parameter.accno", valx, valx, true);
                                            thatForm.frm.setFieldValue("TB001@parameter.acname", val, val, true);
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
                            acname: {
                                colname: "acname",
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
                            costcent: {
                                colname: "costcent",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"costCent\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                showInPreview: false,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    showValueHelp: true,
                                    change: function (e) {

                                        var vl = e.oSource.getValue();
                                        thatForm.frm.setFieldValue("TB001@parameter.costcent", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select title from accostcent1 where CODE =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("TB001@parameter.csname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select code,title from accostcent1 order by path", "TITLE", "CODE", function (valx, val) {
                                            thatForm.frm.setFieldValue("TB001@parameter.costcent", valx, valx, true);
                                            thatForm.frm.setFieldValue("TB001@parameter.csname", val, val, true);
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
                            csname: {
                                colname: "csname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                showInPreview: false,
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
                            incrp: {
                                colname: "incrp",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"inclRP\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_LEFT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "20%", trueValues: ["Y", "N"] },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false,
                                dispInPara: true,
                                trueValues: ["Y", "N"]
                            },
                            unposted: {
                                colname: "unposted",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"unAudited\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                showInPreview: false,
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
                                levelCol: "LEVELNO",
                                code: "ACCNO",
                                title: "NAME",
                                fixedCols: 2,
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["ACCNO", "NAME"],
                                canvasType: ReportView.CanvasType.VBOX,
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    var oModel = this.getControl().getModel();
                                    var cc = oModel.getProperty("CHILDCOUNT", currentRowContext);
                                    if (cc > 0)
                                        for (var i = startCell; i < endCell; i++) {
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("font-weight", "bold");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("font-weight", "bold");
                                        }
                                },
                                beforeLoadQry: function (sql) {
                                    var sq =
                                        "begin " +
                                        "  cp_acc.plevelno:=:parameter.levelno;" +
                                        "  cp_acc.pfromdt:=:parameter.fromdate;" +
                                        "  cp_acc.ptodt:=:parameter.todate; " +
                                        "  cp_acc.pfromacc:=':parameter.accno'; " +
                                        "  cp_acc.prnp:=':parameter.incrp'; " +
                                        "  cp_acc.pcc:=':parameter.costcent'; " +
                                        "  cp_acc.punposted:=':parameter.unposted'; " +
                                        "  cp_acc.build_gl('01'); " +
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
                                        " to_number(field5) bdeb,to_number(field6) bcrd," +
                                        " to_number(field7) tdeb, to_number(field8) tcrd, " +
                                        " to_number(field13) cdeb, to_number(field14) ccrd, " +
                                        " to_number(FIELD16) levelno , to_number(field18) childcount " +
                                        " from temporary " +
                                        " where idno=66601 " +
                                        (ez == "Y" ? " and to_number(field7)-to_number(field8)!=0  " : "") +
                                        " and usernm='01' order by field17 ";
                                },
                                fields: {
                                    accno: {
                                        colname: "accno",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "accNo",
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
                                        title: "titleTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "300",
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
                                        title: "debitTxt",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "openBal",
                                        parentSpan: 2,
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
                                        title: "creditTxt",
                                        valOnZero: "",
                                        title2: "",
                                        parentTitle: "openBal",
                                        parentSpan: 2,
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: UtilGen.DBView.style_credit_numbers + ";",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    tdeb: {
                                        colname: "tdeb",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "debitTxt",
                                        title2: "",
                                        parentTitle: "transTxt",
                                        parentSpan: 2,
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
                                        title: "creditTxt",
                                        title2: "",
                                        parentTitle: "transTxt",
                                        parentSpan: 2,
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
                                    cdeb: {
                                        colname: "cdeb",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "debitTxt",
                                        title2: "",
                                        parentTitle: "closeBal",
                                        parentSpan: 2,
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
                                        title: "creditTxt",
                                        title2: "",
                                        parentTitle: "closeBal",
                                        parentSpan: 2,
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

                                }
                            }
                        ]
                    }
                },
                {
                    code: "TB002",
                    name: "Trial Balance",
                    descr: "Standard Trial Balance with closing balances",
                    nameAR: "ميزان المراجعة",
                    descrAR: "ميزان المراجعة مع الأرصدة الختامية",
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    onSubTitHTML: function () {
                        var up = thatForm.frm.getFieldValue("parameter.unposted");
                        var tbstr = Util.getLangText("trialBalance");
                        var ua = Util.getLangText("unAudited");
                        var cs = thatForm.frm.getFieldValue("parameter.costcent");
                        var csnm = thatForm.frm.getFieldValue("parameter.csname");
                        var ht = "<div class='reportTitle'>" + tbstr + (up == "Y" ? " (" + ua + ") " : "") + "</div > ";
                        if (cs != "")
                            ht += "<div class='reportTitle2'>" + Util.getLangText("costCent") + " : " + cs + "-" + csnm + "</div > ";
                        return ht;

                    },
                    showCustomPara: function (vbPara, rep) {

                    },
                    mainParaContainerSetting: {
                        width: "600px",
                        css: {
                            "padding-left": "50px",
                            // "padding-top:20px;",
                            "border-style": "inset",
                            // "margin-left: 10%;",
                            // "margin-right: 10%;",
                            // "border-radius:25px;",
                            "background-color": "#dcdcdc"
                        }
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
                            accno: {
                                colname: "accno",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"accNo\",\"width\":\"15%\","textAlign":"End"}',
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
                                        thatForm.frm.setFieldValue("TB002@parameter.accno", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select name from acaccount where accno =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("TB002@parameter.acname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select accno,name from acaccount where actype=0 order by path", "NAME", "ACCNO", function (valx, val) {
                                            thatForm.frm.setFieldValue("TB002@parameter.accno", valx, valx, true);
                                            thatForm.frm.setFieldValue("TB002@parameter.acname", val, val, true);
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
                            acname: {
                                colname: "acname",
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
                            costcent: {
                                colname: "costcent",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"costCent\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                showInPreview: false,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    showValueHelp: true,
                                    change: function (e) {

                                        var vl = e.oSource.getValue();
                                        thatForm.frm.setFieldValue("TB001@parameter.costcent", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select title from accostcent1 where CODE =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("TB001@parameter.csname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select code,title from accostcent1 order by path", "TITLE", "CODE", function (valx, val) {
                                            thatForm.frm.setFieldValue("TB001@parameter.costcent", valx, valx, true);
                                            thatForm.frm.setFieldValue("TB001@parameter.csname", val, val, true);
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
                            csname: {
                                colname: "csname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End"}',
                                title2: "",
                                showInPreview: false,
                                display_width: colSpan,
                                showInPreview: false,
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
                            unposted: {
                                colname: "unposted",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"unAudited\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                display_width: colSpan,
                                showInPreview: false,
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
                            exclzero: {
                                colname: "exclzero",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"exclZero\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
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
                                levelCol: "LEVELNO",
                                code: "ACCNO",
                                title: "NAME",
                                fixedCols: 0,
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["ACCNO", "NAME"],
                                canvasType: ReportView.CanvasType.VBOX,
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    var oModel = this.getControl().getModel();
                                    var cc = oModel.getProperty("CHILDCOUNT", currentRowContext);
                                    if (cc > 0)
                                        for (var i = startCell; i < endCell; i++) {
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("font-weight", "bold");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("font-weight", "bold");
                                        }
                                },
                                beforeLoadQry: function (sql) {
                                    var sq =
                                        "begin " +
                                        "  cp_acc.plevelno:=:parameter.levelno;" +
                                        "  cp_acc.pfromdt:=:parameter.fromdate;" +
                                        "  cp_acc.ptodt:=:parameter.todate; " +
                                        "  cp_acc.pcc:=':parameter.costcent'; " +
                                        "  cp_acc.pfromacc:=':parameter.accno'; " +
                                        "  cp_acc.punposted:=':parameter.unposted'; " +
                                        "  cp_acc.build_gl('01'); " +
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
                                        " to_number(field5) bdeb,to_number(field6) bcrd," +
                                        " to_number(field7) tdeb, to_number(field8) tcrd, " +
                                        " to_number(field13) cdeb, to_number(field14) ccrd, " +
                                        " to_number(FIELD16) levelno ,to_number(field18) childcount" +
                                        " from temporary " +
                                        " where idno=66601 " +
                                        (ez == "Y" ? " and to_number(field13)-to_number(field14)!=0  " : "") +
                                        " and usernm='01' order by field17 ";
                                },
                                fields: {
                                    accno: {
                                        colname: "accno",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "accNo",
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
                                        title: "titleTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "300",
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
                                    childcount: {
                                        colname: "childcount",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "childcount",
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
                                        title: "debitTxt",
                                        title2: "",
                                        parentTitle: "closeBal",
                                        parentSpan: 2,
                                        valOnZero: "",
                                        display_width: "150",
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
                                        title: "creditTxt",
                                        title2: "",
                                        parentTitle: "closingBal",
                                        parentSpan: 2,
                                        valOnZero: "",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: UtilGen.DBView.style_credit_numbers + ";",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },

                                }
                            }
                        ]
                    }
                },
                {
                    code: "TB003",
                    name: "Trial balance transaction",
                    descr: "Accounts transaction summary",
                    nameAR: "عملية ميزان المراجعة",
                    descrAR: "إجمالي عمليات الحسابات",
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    onSubTitHTML: function () {
                        var up = thatForm.frm.getFieldValue("parameter.unposted");
                        var tbstr = Util.getLangText("trialBalance");
                        var ua = Util.getLangText("unAudited");
                        var cs = thatForm.frm.getFieldValue("parameter.costcent");
                        var csnm = thatForm.frm.getFieldValue("parameter.csname");
                        var ht = "<div class='reportTitle'>" + tbstr + (up == "Y" ? " (" + ua + ") " : "") + "</div > ";
                        if (cs != "")
                            ht += "<div class='reportTitle2'>" + Util.getLangText("costCent") + " : " + cs + "-" + csnm + "</div > ";
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
                            accno: {
                                colname: "accno",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"accNo\",\"width\":\"15%\","textAlign":"End"}',
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
                                        thatForm.frm.setFieldValue("TB003@parameter.accno", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select name from acaccount where accno =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("TB003@parameter.acname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select accno,name from acaccount where actype=0 order by path", "NAME", "ACCNO", function (valx, val) {
                                            thatForm.frm.setFieldValue("TB003@parameter.accno", valx, valx, true);
                                            thatForm.frm.setFieldValue("TB003@parameter.acname", val, val, true);
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
                            acname: {
                                colname: "acname",
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
                            costcent: {
                                colname: "costcent",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"costCent\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                showInPreview: false,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    showValueHelp: true,
                                    change: function (e) {

                                        var vl = e.oSource.getValue();
                                        thatForm.frm.setFieldValue("TB001@parameter.costcent", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select title from accostcent1 where CODE =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("TB001@parameter.csname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select code,title from accostcent1 order by path", "TITLE", "CODE", function (valx, val) {
                                            thatForm.frm.setFieldValue("TB001@parameter.costcent", valx, valx, true);
                                            thatForm.frm.setFieldValue("TB001@parameter.csname", val, val, true);
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
                            csname: {
                                colname: "csname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                showInPreview: false,
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
                            unposted: {
                                colname: "unposted",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"unAudited\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                display_width: colSpan,
                                showInPreview: false,
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
                                levelCol: "LEVELNO",
                                code: "ACCNO",
                                title: "NAME",
                                fixedCols: 2,
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["ACCNO", "NAME"],
                                canvasType: ReportView.CanvasType.VBOX,
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    var oModel = this.getControl().getModel();
                                    var bal = parseFloat(oModel.getProperty("BALANCE", currentRowContext));
                                    if (bal >= 0)
                                        qv.getControl().getRows()[dispRow].getCells()[4].$().parent().parent().find("*").css("cssText", UtilGen.DBView.style_debit_numbers + ";text-align:end;");
                                    else
                                        qv.getControl().getRows()[dispRow].getCells()[4].$().parent().parent().find("*").css("cssText", UtilGen.DBView.style_credit_numbers + ";text-align:end;");

                                    var cc = oModel.getProperty("CHILDCOUNT", currentRowContext);
                                    if (cc > 0)
                                        for (var i = startCell; i < endCell; i++) {
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("font-weight", "bold");
                                            qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("font-weight", "bold");
                                        }


                                },
                                beforeLoadQry: function (sql) {
                                    var sq =
                                        "begin " +
                                        "  cp_acc.plevelno:=:parameter.levelno;" +
                                        "  cp_acc.pfromdt:=:parameter.fromdate;" +
                                        "  cp_acc.ptodt:=:parameter.todate; " +
                                        "  cp_acc.pfromacc:=':parameter.accno'; " +
                                        "  cp_acc.pcc:=':parameter.costcent'; " +
                                        "  cp_acc.punposted:=':parameter.unposted'; " +
                                        "  cp_acc.build_gl('01'); " +
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
                                        " to_number(field5) bdeb,to_number(field6) bcrd," +
                                        " to_number(field7) tdeb, to_number(field8) tcrd, " +
                                        " to_number(field7)-to_number(field8) balance," +
                                        " to_number(FIELD16) levelno , to_number(field18) childcount " +
                                        " from temporary " +
                                        " where idno=66601 " +
                                        (ez == "Y" ? " and to_number(field7)-to_number(field8)!=0 " : "") +
                                        " and usernm='01' order by field17 ";
                                },
                                fields: {
                                    accno: {
                                        colname: "accno",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "accNo",
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
                                        title: "titleTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "300",
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
                                    childcount: {
                                        colname: "childcount",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "childcount",
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
                                    tdeb: {
                                        colname: "tdeb",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "debitTxt",
                                        title2: "",
                                        parentTitle: "transTxt",
                                        parentSpan: 2,
                                        valOnZero: "",
                                        display_width: "150",
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
                                        title: "Credit",
                                        title2: "",
                                        parentTitle: "transTxt",
                                        parentSpan: 2,
                                        valOnZero: "",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: UtilGen.DBView.style_credit_numbers + ";",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    },
                                    balance: {
                                        colname: "balance",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "balanceTxt",
                                        title2: "",
                                        parentTitle: "summaryBalTxt",
                                        parentSpan: 2,
                                        valOnZero: "",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        summary: "SUM",
                                        other_settings: {},
                                    }

                                }
                            }
                        ]
                    }
                },
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



