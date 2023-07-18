sap.ui.jsfragment("bin.forms.rp.in.ms", {
    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        // this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode,});
        // this.joApp2 = new sap.m.App();
        

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
            var fromdate = frm.getFieldValue("parameter.fromdate") == undefined ? "01/01/" + todate.substr(6) : sdf.format(frm.getFieldValue("parameter.fromdate"));

            var it = tbl.getRows()[rr].getCells()[0].getText();
            UtilGen.execCmd("rp.in.sb formType=dialog formSize=100%,100% repno=1 para_PARAFORM=false para_EXEC_REP=true strno=" + it + " fromdate=@" + fromdate + " todate=@" + todate, UtilGen.DBView, obj, UtilGen.DBView.newPage);

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
                    code: "MS001",
                    name: Util.getLangText("msRepName1"),
                    descr: Util.getLangText("msRepDescr1"),
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    showCustomPara: function (vbPara, rep) {

                    },
                    onSubTitHTML: function () {
                        var tbstr = Util.getLangText("msRepName1");
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
                            todate: ReportUtils.Parameters.getTodate(),
                            showbal: ReportUtils.Parameters.getShowBalChk(),
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
                                dispRecords: { "S": 5, "M": 10, "L": 14 },
                                execOnShow: false,
                                dml: "",
                                parent: "",
                                levelCol: "",
                                code: "",
                                title: "",
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["NAME"],
                                canvasType: ReportView.CanvasType.VBOX,
                                beforeLoadQry: function (sql) {
                                    var cst = "(SELECT NVL(SUM(PKCOST*(QTYIN-QTYOUT)),0)  FROM INVOICE2 WHERE STRA=STORE.NO) ";
                                    if (thatForm.frm.getFieldValue("parameter.showbal") != "Y")
                                        cst = "0 ";
                                    var sq = "select no,name ," + cst + " costvalue from store order by no";
                                    sq = thatForm.frm.parseString(sq);
                                    return sq;
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
                                    no: {
                                        colname: "no",
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
                                    name: {
                                        colname: "name",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "nameTxt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "200",
                                        display_align: "ALIGN_BEGIN",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    costvalue: {
                                        colname: "costvalue",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "totalCost",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "150",
                                        display_align: "ALIGN_END",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        display_type: "NONE",
                                        summary: "SUM",
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
                                dml: "",
                                beforeLoadQry: function (sql, qryObj) {
                                    return "";
                                },
                                bat7CustomAddQry: function (qryObj, ps) {
                                    var cst = "(SELECT NVL(SUM(PKCOST*(QTYIN-QTYOUT)),0)  FROM INVOICE2 WHERE STRA=STORE.NO) ";
                                    if (thatForm.frm.getFieldValue("parameter.showbal") != "Y")
                                        cst = "0 ";
                                    var sq = "select no,name ," + cst + " costvalue from store order by no";
                                    sq = thatForm.frm.parseString(sq);

                                    var ret = true;
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
                                bat7CustomGetData: function (qryObj) {
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
                                        if (dt.ret == "SUCCESS") {
                                            var ob = view.byId("graphAccno" + thatForm.timeInLong);//thatForm.frm.getObject("01@qry3.accno").obj.getContent()[0];
                                            var dtx = JSON.parse("{" + dt.data + "}").data;
                                            var dimensions = [{
                                                name: "NAME",
                                                value: "{NAME}"
                                            }];
                                            var measures = [

                                                {
                                                    name: Util.getLangText("totalText"),
                                                    value: "{COSTVALUE}"
                                                }];

                                            this.dataSetDone = (ob.getModel() != undefined);
                                            var oModel = new sap.ui.model.json.JSONModel();
                                            oModel.setData(dtx);
                                            ob.setModel(undefined);
                                            ob.setModel(oModel);


                                            ob.setDataset(new sap.viz.ui5.data.FlattenedDataset({
                                                dimensions: dimensions,
                                                measures: measures,
                                                data: {
                                                    path: "/"
                                                }
                                            }));

                                            if (Util.nvl(this.dataSetDone, false) == false) {
                                                var formatPattern = sap.viz.ui5.format.DefaultPattern;

                                                var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                                                    'uid': "valueAxis",
                                                    'type': "Measure",
                                                    'values': [Util.getLangText("totalText")]
                                                });

                                                var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                                                    'uid': "categoryAxis",
                                                    'type': "Dimension",
                                                    'values': ["NAME"]
                                                });
                                                ob.addFeed(feedCategoryAxis);
                                                ob.addFeed(feedValueAxis);

                                                ob.setVizProperties({
                                                    general: {
                                                        layout: {
                                                            padding: 0.04
                                                        }
                                                    },
                                                    valueAxis: {
                                                        label: {
                                                            formatString: '',
                                                        },
                                                        title: {
                                                            visible: true
                                                        }
                                                    },
                                                    categoryAxis: {
                                                        title: {
                                                            visible: false
                                                        }
                                                    },
                                                    plotArea: {
                                                        dataLabel: {
                                                            visible: true,
                                                            formatString: '',
                                                            style: {
                                                                color: null
                                                            }
                                                        }
                                                    },
                                                    legend: {
                                                        title: {
                                                            visible: false
                                                        }
                                                    },
                                                    title: {
                                                        visible: false,
                                                        text: 'DR a/c '
                                                    }
                                                });
                                                var pop = view.byId("graphAccnoPop" + thatForm.timeInLong);
                                                pop.connect(ob.getVizUid());
                                                this.dataSetDone = true;
                                            }
                                        }
                                        else this.dataSetDone = undefined;

                                    });
                                },
                                onCustomValueFields: function (qryObj) {

                                }

                                ,
                                fields: {
                                    accno: {
                                        colname: "accno",
                                        data_type:
                                            FormView.DataType.String,
                                        class_name:
                                            ReportView.ClassTypes.PANEL,
                                        title:
                                            " ",
                                        title2:
                                            "",
                                        canvas:
                                            "default_canvas",
                                        display_width:
                                            "XL10 L12 M12 S12",
                                        display_align:
                                            "ALIGN_RIGHT",
                                        display_style:
                                            "",
                                        display_format:
                                            "",
                                        default_value:
                                            "",
                                        onPrintField:
                                            function () {
                                                return this.obj.$().outerHTML();
                                            }
                                        ,
                                        beforeAddObject: function () {
                                            // Util.destroyID("graphAccnoPop" + thatForm.timeInLong);
                                        },
                                        afterAddOBject: function () {
                                            Util.destroyID("graphAccnoPop" + thatForm.timeInLong, view);
                                            Util.destroyID("graphAccno" + thatForm.timeInLong, view);
                                            this.obj.removeAllContent();
                                            this.obj.addContent(
                                                new sap.viz.ui5.controls.Popover(view.createId("graphAccnoPop" + thatForm.timeInLong)));
                                            this.obj.addContent(
                                                new sap.viz.ui5.controls.VizFrame(view.createId("graphAccno" + thatForm.timeInLong), {
                                                    uiConfig: { applicationSet: 'fiori' },
                                                    vizType: "column",
                                                    height: "100%",
                                                    legendVisible: false

                                                }));

                                        }
                                        ,
                                        other_settings: {
                                            height: "200px",
                                            headerText:
                                                "",
                                            headerToolbar:
                                                undefined,
                                            content:
                                                []

                                        }                                     
                                    }                                    
                                }
                            },
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



