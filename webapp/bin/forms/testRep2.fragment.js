sap.ui.jsfragment("bin.forms.testRep2", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.App({mode: sap.m.SplitAppMode.HideMode});
        this.timeInLong = (new Date()).getTime();


        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
            onm: ""
        };
        // this.pgDetail = new sap.m.Page({showHeader: false});

        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: true,
            showNavButton: false,
            enableScroll: true,
            height: "100%",
            content: []
        });
        this.createView();
        this.loadData();
        this.joApp.addPage(this.mainPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");
        return this.joApp;
    },
    createView: function () {
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var that2 = this;
        var thatForm = this;
        var view = this.view;
        var fullSpan = "XL8 L8 M8 S12";
        var colSpan = "XL3 L3 M3 S12";
        var sumSpan = "XL2 L2 M2 S12";

        UtilGen.clearPage(this.mainPage);
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
            title: "Account Transaction",
            reports: [
                {
                    code: "01",
                    name: "Details by Ac",
                    rep: {
                        parameters: {
                            fromdate: {
                                colname: "fromdate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: "From Date",
                                title2: "",
                                canvas: "default_canvas",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "#DATE_10/01/2020",
                                other_settings: {},
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
                                title: "@To Date",
                                title2: "",
                                canvas: "default_canvas",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "#DATE_11/01/2020",
                                other_settings: {},
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                            jvtype: {
                                colname: "jvtype",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.COMBOBOX,
                                title: "JV Type",
                                title2: "",
                                canvas: "default_canvas",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "#NUMBER_-1",
                                other_settings: {
                                    customData: [{key: ""}],
                                    items: {
                                        path: "/",
                                        template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                                        templateShareable: true
                                    },
                                },
                                list: "@-1/All,1/General,2/Purchases,3/Sales",
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                        },
                        print_templates: [
                            {
                                title: "Transaction Report",
                                reportFile: "trans_1",
                            }
                        ],
                        canvas: [],
                        db: [
                            {
                                type: "query",
                                name: "qry1",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                dispRecords: -1,
                                execOnShow: false,
                                dml: "select no,keyfld,accno,descr2 descr,debit,credit," +
                                "  to_char(vou_date,'dd/mm/rrrr') vou_date " +
                                "  from acvoucher2 " +
                                " where vou_date>=:parameter.fromdate " +
                                " and vou_date<=:parameter.todate " +
                                " and (vou_code=:parameter.jvtype or :parameter.jvtype=-1)" +
                                " order by accno,keyfld",
                                fields: {
                                    accno: {
                                        colname: "accno",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Acc No",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        display_style: "linkLabel",
                                        display_format: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        commandLink: "bin.forms.gl.masterAc formSize=650px,350px status=view accno=:accno",
                                        grouped: true,
                                    },
                                    descr: {
                                        colname: "descr",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Descr",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "300",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        grouped: true,
                                    },
                                    no: {
                                        colname: "no",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "NO",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        display_style: "",
                                        display_format: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        grouped: false,
                                    },
                                    vou_date: {
                                        colname: "vou_date",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Date",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "200",
                                        display_align: "ALIGN_CENTER",
                                        display_style: "",
                                        display_format: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                    },
                                    debit: {
                                        colname: "debit",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "DEBIT",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        summary: "SUM",
                                        display_format: "MONEY_FORMAT",
                                        display_type: "NONE",
                                        other_settings: {},
                                    },
                                    credit: {
                                        colname: "credit",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Credit",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        display_type: "NONE",
                                        other_settings: {},
                                        summary: "SUM",
                                    }
                                }
                            }
                        ]

                    }
                },
                {
                    code: "02",
                    name: "Summary by Ac",
                    rep: {
                        parameters: {
                            fromdate: {
                                colname: "fromdate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: "From Date",
                                title2: "",
                                canvas: "default_canvas",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "#DATE_10/01/2020",
                                other_settings: {},
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                            },
                            todate: {
                                colname: "todate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: "@To Date",
                                title2: "",
                                canvas: "default_canvas",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "#DATE_11/01/2020",
                                other_settings: {},
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                            },
                            jvtype: {
                                colname: "jvtype",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.COMBOBOX,
                                title: "JV Type",
                                title2: "",
                                canvas: "default_canvas",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "#NUMBER_-1",
                                other_settings: {
                                    customData: [{key: ""}],
                                    items: {
                                        path: "/",
                                        template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                                        templateShareable: true
                                    },
                                },
                                list: "@-1/All,1/General,2/Purchases,3/Sales",
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                        },
                        canvas: [],
                        db: [
                            {
                                type: "query",
                                name: "qry1",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                dispRecords: -1,
                                execOnShow: true,
                                dml: "select accno,descr2 descr,sum(debit) debit,sum(credit) credit " +
                                "  from acvoucher2 " +
                                " where vou_date>=:parameter.fromdate " +
                                " and vou_date<=:parameter.todate " +
                                " and (vou_code=:parameter.jvtype or :parameter.jvtype=-1)" +
                                " group by accno,descr2 " +
                                " order by accno ",
                                fields: {
                                    accno: {
                                        colname: "accno",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Acc No",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "100",
                                        display_align: "ALIGN_CENTER",
                                        display_style: "linkLabel",
                                        display_format: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        // commandLink: "bin.forms.gl.masterAc formSize=650px,350px status=view accno=:accno",
                                        commandLinkClick: function (obj, rowno, colno, lctb, frm) {
                                            var mnu = new sap.m.MenuItem({
                                                text: "View A/C",
                                                icon: "sap-icon://feeder-arrow",
                                                customData: {
                                                    key: "" +
                                                    "stat"
                                                },
                                                press: function () {
                                                    var acno = lctb.getFieldValue(rowno, "ACCNO");

                                                    UtilGen.execCmd("bin.forms.gl.masterAc formSize=650px,350px status=view accno=" + acno, thatForm.view, obj, undefined);
                                                }
                                            });
                                            var mnu2 = new sap.m.MenuItem({
                                                text: "Details A/C",
                                                icon: "sap-icon://feeder-arrow",
                                                customData: {
                                                    key: "" +
                                                    "stat2"
                                                },
                                                press: function () {
                                                    var acno = lctb.getFieldValue(rowno, "ACCNO");
                                                    var descr = lctb.getFieldValue(rowno, "DESCR");
                                                    frm.reportVars.showParaForm = false;
                                                    UtilGen.setControlValue(frm.lstRep, 0, 0, true);
                                                    frm.createView(true, 0);
                                                    frm.loadData(undefined, 0, "para_PARAFORM=false,filter_ACCNO=" + acno + " - " + descr);
                                                    frm.reportVars.showParaForm = true;


                                                }
                                            });
                                            var mnu = new sap.m.Menu({
                                                title: "Reports",
                                                items: [mnu, mnu2]
                                            });


                                            mnu.openBy(obj);
                                        },
                                        grouped: false,
                                    },
                                    descr: {
                                        colname: "descr",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Descr",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "300",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        grouped: false,
                                    },
                                    debit: {
                                        colname: "debit",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "DEBIT",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        summary: "SUM",
                                        display_format: "MONEY_FORMAT",
                                        display_type: "NONE",
                                        other_settings: {},
                                    },
                                    credit: {
                                        colname: "credit",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Credit",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        display_type: "NONE",
                                        other_settings: {},
                                        summary: "SUM",
                                    }
                                }
                            }
                        ]

                    }
                },
                {
                    code: "03",
                    name: "Account List",
                    rep: {
                        parameters: {
                            levelno: {
                                colname: "levelno",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: "Level",
                                title2: "",
                                canvas: "default_canvas",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "#NUMBER_0",
                                other_settings: {},
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                            }

                        },
                        db: [
                            {
                                type: "query",
                                name: "qry1",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                dispRecords: -1,
                                execOnShow: true,
                                dml: "select accno,name,parentacc,path from acaccount where actype=0 order by path ",
                                parent: "PARENTACC",
                                code: "ACCNO",
                                title: "NAME",
                                fields: {
                                    accno: {
                                        colname: "accno",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Acc No",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "200",
                                        display_align: "ALIGN_CENTER",
                                        display_style: "linkLabel",
                                        display_format: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        // commandLink: "bin.forms.gl.masterAc formSize=650px,350px status=view accno=:accno",
                                        commandLinkClick: function (obj, rowno, colno, lctb, frm) {
                                            var mnu = new sap.m.MenuItem({
                                                text: "View A/C",
                                                icon: "sap-icon://feeder-arrow",
                                                customData: {
                                                    key: "" +
                                                    "stat"
                                                },
                                                press: function () {
                                                    // var tb=obj.getParent().getParent();
                                                    // var rn=tb.indexOfRow(obj.getParent());

                                                    var acno = UtilGen.getControlValue(obj);
                                                    UtilGen.execCmd("bin.forms.gl.masterAc formSize=650px,350px status=view accno=" + acno, thatForm.view, obj, undefined);
                                                }
                                            });
                                            var mnu = new sap.m.Menu({
                                                title: "Reports",
                                                items: [mnu]
                                            });


                                            mnu.openBy(obj);
                                        },
                                        grouped: false,
                                    },
                                    name: {
                                        colname: "name",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Descr",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "300",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        grouped: false,
                                    },
                                    parentacc: {
                                        colname: "parentacc",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "parentacc",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "300",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        display_type: "INVISIBLE",
                                        other_settings: {},
                                        grouped: false,
                                    },
                                    path: {
                                        colname: "path",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "path",
                                        title2: "",
                                        canvas: "default_canvas",
                                        display_width: "300",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        display_type: "INVISIBLE",
                                        other_settings: {},
                                        grouped: false,
                                    }
                                }
                            }
                        ]
                    }
                }
            ]

        };

        this.frm = new ReportView(this.mainPage);
        this.frm.view = view;
        this.frm.pg = this.mainPage;
        this.frm.parseRep(js);
        this.frm.createView();

// sc.addContent(this.frm);


// var hb = new sap.m.HBox();
//
// this.qv = new QueryView("qv" + this.timeInLong);
// this.qv.getControl().addStyleClass("sapUiSizeCondensed reportTable");
// this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
// this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.None);
// this.qv.getControl().setAlternateRowColors(false);
// this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
// that.qv.getControl().setVisibleRowCount(15);
// // this.qv.getControl().setFirstVisibleRow(0);
//
// this.qv.getControl().setFixedBottomRowCount(1);
// hb.addItem(new sap.m.VBox({width: "100px"}));
// hb.addItem(this.qv.getControl());
//
// sc.addContent(new sap.m.VBox({height: "100px"}));
//
// sc.addContent(hb);


// this.mainPage.addContent(sc);
        setTimeout(function () {
            that.mainPage.$().css("background-color", "white");
        }, 500);

    }
    ,
    loadData: function () {
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



