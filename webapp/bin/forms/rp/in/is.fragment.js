sap.ui.jsfragment("bin.forms.rp.in.is", {
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
            title: Util.getLangText("isRepTit"),
            title2: "",
            show_para_pop: false,
            reports: [
                {
                    code: "IS001",
                    name: Util.getLangText("isRepName1"),
                    descr: Util.getLangText("isRepDescr1"),
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    showCustomPara: function (vbPara, rep) {

                    },
                    onSubTitHTML: function () {

                        var tbstr = Util.getLangText("isRepName1");
                        var ht = "<div class='reportTitle'>" + tbstr + "</div > ";
                        return ht;
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
                            invtype: {
                                colname: "invtype",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.COMBOBOX,
                                title: '{\"text\":\"stkVouType\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "-1",
                                other_settings: {
                                    width: "35%",
                                    items: {
                                        path: "/",
                                        template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                                        templateShareable: true
                                    },
                                    selectedKey: "-1",
                                },
                                list: "@-1/All,11/Purchase/,19/Adj.In,17/Assembly In,12/Sales Ret,1/BF,13/SRVs,25/Issues,21/Sales,29/Adj.Out,27/Assembly Out,28/Samples,22/Pur.Ret,26/Imapired,30/POS",
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                            grpby: {
                                colname: "grpby",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.COMBOBOX,
                                title: '{\"text\":\"grpByTxt\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    width: "35%",
                                    items: {
                                        path: "/",
                                        template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                                        templateShareable: true
                                    },
                                    selectedKey: "1",
                                },
                                list: "@1/None,2/Date,3/Locations",
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
                                name: "qry2",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                disp_class: "reportTable2",
                                dispRecords: { "S": 10, "M": 16, "L": 20 },
                                execOnShow: false,
                                dml: "SELECT LOCATION_NAME,LOCATION_CODE,INVOICE_NO,INVOICE_DATE,MEMO,SHORT_NAME,COSTCENT,CS_NAME,itempos,sum(PKCOST*pack) pkcost,SUM(PKCOST*ALLQTY) AMOUNT FROM JOINED_INVOICE " +
                                    " where (type=:parameter.invtype or :parameter.invtype='-1' ) and invoice_date>=:parameter.fromdate and invoice_date<=:parameter.todate " +
                                    " GROUP BY  LOCATION_NAME,LOCATION_CODE,INVOICE_NO,INVOICE_DATE,MEMO,SHORT_NAME,COSTCENT,CS_NAME,itempos order by location_code,invoice_no,itempos ",
                                parent: "",
                                levelCol: "",
                                code: "",
                                title: "",
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["MEMO", "LOCATION_NAME", "SHORT_NAME", "COSTCENT", "CS_NAME"],
                                canvasType: ReportView.CanvasType.VBOX,
                                eventAfterQV: function (qryObj) {
                                    // var iq = thatForm.frm.getFieldValue("parameter.grpby");
                                    qryObj.obj.showToolbar.showGroupFilter = true;//!(iq == "1");
                                },
                                afterApplyCols: function (qryObj) {
                                    if (qryObj.name == "qry2") {
                                        var iq = thatForm.frm.getFieldValue("parameter.grpby");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("INVOICE_DATE")].mGrouped = iq == "2";
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("LOCATION_NAME")].mGrouped = iq == "3";

                                    }
                                },
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    // var oModel = this.getControl().getModel();
                                    // var bal = parseFloat(oModel.getProperty("BALANCE", currentRowContext));
                                    // if (bal >= 0)
                                    //     qv.getControl().getRows()[dispRow].getCells()[3].$().css("color", "green");
                                    // else
                                    //     qv.getControl().getRows()[dispRow].getCells()[3].$().css("color", "red");


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
                                        display_width: "120",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "SHORT_DATE_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    invoice_no: {
                                        colname: "invoice_no",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "transNo",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    location_name: {
                                        colname: "location_name",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "locName",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "130",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    short_name: {
                                        colname: "short_name",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "transType",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "130",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    costcent: {
                                        colname: "costcent",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "costCent",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    cs_name: {
                                        colname: "cs_name",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "titleTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "130",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    memo: {
                                        colname: "memo",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "memoTxt",
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
                                    amount: {
                                        colname: "amount",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "amountTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "120",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        summary: "SUM",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },                                    
                                }
                            }
                        ]
                    }
                },
                {
                    code: "IS002",
                    name: Util.getLangText("isRepName2"),
                    descr: Util.getLangText("isRepDescr2"),
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
                            invtype: {
                                colname: "invtype",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.COMBOBOX,
                                title: '{\"text\":\"stkVouType\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "-1",
                                other_settings: {
                                    width: "35%",
                                    items: {
                                        path: "/",
                                        template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                                        templateShareable: true
                                    },
                                    selectedKey: "-1",
                                },
                                list: "@-1/All,11/Purchase/,19/Adj.In,17/Assembly In,12/Sales Ret,1/BF,13/SRVs,25/Issues,21/Sales,29/Adj.Out,27/Assembly Out,28/Samples,22/Pur.Ret,26/Imapired,30/POS",
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                            grpby: {
                                colname: "grpby",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.COMBOBOX,
                                title: '{\"text\":\"grpByTxt\",\"width\":\"15%\","textAlign":"End"}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    width: "35%",
                                    items: {
                                        path: "/",
                                        template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                                        templateShareable: true
                                    },
                                    selectedKey: "1",
                                },
                                list: "@1/None,3/Locations,4/Group Items,5/Items",
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
                                name: "qry2",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                disp_class: "reportTable2",
                                dispRecords: { "S": 10, "M": 16, "L": 20 },
                                execOnShow: false,
                                dml: "SELECT LOCATION_NAME,LOCATION_CODE,SHORT_NAME,PARENTITEM,PARENTITEMDESCR,REFER,DESCR, (SUM(PKCOST*ALLQTY)/SUM(ALLQTY))*(ITPACK) PKCOST ,(SUM(ALLQTY)/(ITPACK)) PKQTY, SUM(PKCOST*ALLQTY) AMOUNT FROM JOINED_INVOICE " +
                                    " where (type=:parameter.invtype or :parameter.invtype='-1' ) and invoice_date>=:parameter.fromdate and invoice_date<=:parameter.todate " +
                                    " GROUP BY  REFER,DESCR,ITPACKD,ITPACKD,ITPACK,PARENTITEM,PARENTITEMDESCR,LOCATION_NAME,LOCATION_CODE,SHORT_NAME having sum(allqty)>0 order by location_code,refer",
                                parent: "",
                                levelCol: "",
                                code: "",
                                title: "",
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["MEMO", "LOCATION_NAME", "SHORT_NAME", "COSTCENT", "CS_NAME", "PARENTITEM", "PARENTITEMDESCR", "REFER", "DESCR"],
                                canvasType: ReportView.CanvasType.VBOX,
                                eventAfterQV: function (qryObj) {
                                    // var iq = thatForm.frm.getFieldValue("parameter.grpby");
                                    qryObj.obj.showToolbar.showGroupFilter = true;//!(iq == "1");
                                },
                                afterApplyCols: function (qryObj) {
                                    if (qryObj.name == "qry2") {
                                        var iq = thatForm.frm.getFieldValue("parameter.grpby");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("LOCATION_NAME")].mGrouped = iq == "3";
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("PARENTITEM")].mGrouped = iq == "4";
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("PARENTITEMDESCR")].mGrouped = iq == "4";
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("REFER")].mGrouped = iq == "5";
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("DESCR")].mGrouped = iq == "5";

                                    }
                                },
                                onRowRender: function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                                    // var oModel = this.getControl().getModel();
                                    // var bal = parseFloat(oModel.getProperty("BALANCE", currentRowContext));
                                    // if (bal >= 0)
                                    //     qv.getControl().getRows()[dispRow].getCells()[3].$().css("color", "green");
                                    // else
                                    //     qv.getControl().getRows()[dispRow].getCells()[3].$().css("color", "red");


                                },
                                bat7CustomAddQry: function (qryObj, ps) {

                                },
                                fields: {
                                    location_name: {
                                        colname: "location_name",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "locName",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "130",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    short_name: {
                                        colname: "short_name",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "transType",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "130",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    parentitem: {
                                        colname: "parentitem",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "parentTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    parentitemdescr: {
                                        colname: "parentitemdescr",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "parentItemDescr",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "120",
                                        display_align: "ALIGN_LEFT",
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
                                        display_width: "80",
                                        display_align: "ALIGN_LEFT",
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
                                        display_width: "140",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
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
                                        display_width: "80",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pkcost: {
                                        colname: "pkcost",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackCost",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        summary: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pkqty: {
                                        colname: "pkqty",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackQty",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
                                        default_value: "",
                                        summary: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    amount: {
                                        colname: "amount",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "amountTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        summary: "SUM",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
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



