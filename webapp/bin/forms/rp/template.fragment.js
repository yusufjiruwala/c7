sap.ui.jsfragment("bin.forms.rp.cage", {
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
            title: "Report Title",
            title2: "",
            show_para_pop: false,
            reports: [
                {
                    code: "R001",
                    name: "Sub Report Title",
                    descr: "Sub Repot description",
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
                            // todate: {
                            //     colname: "todate",
                            //     data_type: FormView.DataType.Date,
                            //     class_name: FormView.ClassTypes.DATEFIELD,
                            //     title: '{\"text\":\"To\",\"width\":\"15%\","textAlign":"End"}',
                            //     title2: "",
                            //     display_width: colSpan,
                            //     display_align: "ALIGN_RIGHT",
                            //     display_style: "",
                            //     display_format: "",
                            //     default_value: "$TODAY",
                            //     other_settings: { width: "35%" },
                            //     list: undefined,
                            //     edit_allowed: true,
                            //     insert_allowed: true,
                            //     require: true,
                            //     dispInPara: true,
                            // },

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
                                dml: "select ...",
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
                                },
                                fields: {
                                    // code: {
                                    //     colname: "code",
                                    //     data_type: FormView.DataType.String,
                                    //     class_name: FormView.ClassTypes.LABEL,
                                    //     title: "Code",
                                    //     title2: "",
                                    //     parentTitle: "",
                                    //     parentSpan: 1,
                                    //     display_width: "100",
                                    //     display_align: "ALIGN_CENTER",
                                    //     grouped: false,
                                    //     display_style: "",
                                    //     display_format: "",
                                    //     default_value: "",
                                    //     other_settings: {},
                                    //     commandLinkClick: cmdLink
                                    // }

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



