sap.ui.jsfragment("bin.forms.rp.in.ia", {
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
            var fromdt = sdf.format(frm.getFieldValue("parameter.fromdate"));

            // var rowid = mdl.getProperty("_rowid", cont);
            // var it = Util.nvl(lctb.getFieldValue(rowid, "ACCNO"), "");            
            var it = tbl.getRows()[rr].getCells()[0].getText();
            UtilGen.execCmd("rp.in.st formType=dialog formSize=100%,100% repno=1 para_PARAFORM=false para_EXEC_REP=true prefer=" + it + " fromdate=@" + fromdt, UtilGen.DBView, obj, UtilGen.DBView.newPage);
            
        }
        // UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];

        var sc = new sap.m.ScrollContainer();

        var js = {
            title: "Report Title",
            title2: "",
            show_para_pop: false,
            reports: [
                {
                    code: "R001",
                    name: Util.getLangText("iaRepName1"),
                    descr: Util.getLangText("iaRepDescr1"),
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    showCustomPara: function (vbPara, rep) {

                    },
                    onSubTitHTML: function () {

                        var tbstr = Util.getLangText("iaRepName1");
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
                                dml: "",
                                parent: "PARENTITEM",
                                levelCol: "LEVELNO",
                                code: "REFER",
                                title: "DESCR",
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["REFER", "DESCR"],
                                canvasType: ReportView.CanvasType.VBOX,
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
                                beforeLoadQry: function (sql) {
                                    // --fld1..2,3,4:  1.parentitem, 2.refer, 3.descr, 4. packd, 5.pack_cost, 6.pack_qty,
                                    // 7.amount,8.levelno, 9.childcount,10.pack,11 pos
                                    var sq = "select field1 parentitem,field2 refer,field3 descr,field4 packd,to_number(field5) pkcost , to_number(field6) pkqty," +
                                        " to_number(field7) amount,to_number(field8) levelno,to_number(field9) childcount,to_number(field10) pack,to_number(field11) itempos" +
                                        " from temporary where idno=98701 order by to_number(field11)";
                                    var sq2 = "begin exec_rep_item_asm(:parameter.fromdate,:parameter.todate); end; ";
                                    sq2 = thatForm.frm.parseString(sq2);
                                    var dt = Util.execSQL(sq2);
                                    if (dt.ret != "SUCCESS")
                                        FormView.err("Err ! executing on server ");

                                    return sq;

                                },
                                fields: {
                                    refer: {
                                        colname: "refer",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCode",
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
                                    descr: {
                                        colname: "descr",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemDescr",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "200",
                                        display_align: "ALIGN_LEFT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    packd: {
                                        colname: "packd",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackD",
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
                                        display_align: "ALIGN_RIGHT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
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
                                        display_align: "ALIGN_RIGHT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        summary: "SUM",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    }

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



