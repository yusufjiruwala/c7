sap.ui.jsfragment("bin.forms.testRep4", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode,});
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
            showHeader: false,
            showNavButton: false,
            enableScroll: true,
            height: "100%",
            content: []
        });
        this.pgMaster = new sap.m.Page({
            showHeader: false,
            showFooter: true,
            showNavButton: false,
            enableScroll: true,
            height: "100%",
            content: [new sap.m.Title({text: "Settings"})]
        });
        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        this.joApp.addMasterPage(this.pgMaster);
        setTimeout(function () {
            that.joApp.showMaster();
        }, 10);

        this.joApp.to(this.mainPage, "show");
        // this.joApp.hideMaster();
        this.joApp.setMasterButtonText("Setup");
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
        var colSpan = "XL2 L2 M2 S12";
        var sumSpan = "XL2 L2 M2 S12";
        var cmdLink = function (obj, rowno, colno, lctb, frm) {
            var vcd = lctb.getFieldValue(rowno, "VOU_CODE");
            var kfld = lctb.getFieldValue(rowno, "KEYFLD");
            var jvpos = lctb.getFieldValue(rowno, "JVPOS");
            if (vcd == 1) {
                UtilGen.execCmd("gl.jv formType=dialog formSize=100%,80% status=view keyfld=" + kfld + " jvpos=" + jvpos, thatForm.view, obj, undefined);
            } else {
                sap.m.MessageToast.show("Not a JV..");
            }
        }
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
            title: "SOA",
            reports: [
                {
                    code: "01",
                    code: "01",
                    name: "SOA",
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    rep: {
                        parameters: {
                            fromdate: {
                                colname: "fromdate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: "From Date",
                                title2: "",
                                canvas: "para_canvas",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "$FIRSTDATEOFYEAR",
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
                                canvas: "para_canvas",
                                display_width: colSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "$TODAY",
                                other_settings: {},
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                            paccno: {
                                colname: "paccno",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.SEARCHFIELD,
                                title: "Acc No",
                                title2: "",
                                canvas: "para_canvas",
                                display_width: fullSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    customData: [{key: ""}],
                                    search: function (event) {
                                        if (event != undefined
                                            && (event.getParameters().clearButtonPressed
                                                || event.getParameters().refreshButtonPressed)) {
                                            // UtilGen.setControlValue(event.oSource, "", "", true);
                                            thatForm.frm.setFieldValue("01@parameter.paccno", "", "", true);
                                            return;
                                        }
                                        Util.showSearchList("select accno,name from acaccount order by path", "NAME", "ACCNO", function (valx, val) {
                                            thatForm.frm.setFieldValue("01@parameter.paccno", valx, val, true);
                                            sap.m.MessageToast.show(thatForm.frm.getFieldValue("01@parameter.paccno"));
                                        });

                                    },
                                    change: function (event) {
                                        var vl = event.oSource.getValue();
                                        thatForm.frm.setFieldValue("01@parameter.paccno", vl, vl, true);
                                    }


                                },
                                list: "select accno,name from acaccount order by path",
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                            pcc: {
                                colname: "pcc",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.SEARCHFIELD,
                                title: "Cost Center",
                                title2: "",
                                canvas: "para_canvas",
                                display_width: fullSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    customData: [{key: ""}],
                                    search: function (event) {
                                        if (event != undefined
                                            && (event.getParameters().clearButtonPressed
                                                || event.getParameters().refreshButtonPressed)) {
                                            thatForm.frm.setFieldValue("01@parameter.pcc", "", "", true);
                                            return;
                                        }
                                        Util.showSearchList("select code,title name from accostcent1 order by path", "NAME", "CODE", function (valx, val) {
                                            // UtilGen.setControlValue(obj, val, valx, true);
                                            thatForm.frm.setFieldValue("01@parameter.pcc", valx, val, true);
                                            sap.m.MessageToast.show(thatForm.frm.getFieldValue("01@parameter.pcc"));
                                        });

                                    },
                                    change: function (event) {
                                        var vl = event.oSource.getValue();
                                        thatForm.frm.setFieldValue("01@parameter.pcc", vl, vl, true);
                                    }


                                },
                                list: "",
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                            pref: {
                                colname: "pref",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.SEARCHFIELD,
                                title: "Reference",
                                title2: "",
                                canvas: "para_canvas",
                                display_width: fullSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                default_value: "",
                                other_settings: {
                                    customData: [{key: ""}],
                                    search: function (event) {
                                        if (event != undefined
                                            && (event.getParameters().clearButtonPressed
                                                || event.getParameters().refreshButtonPressed)) {
                                            thatForm.frm.setFieldValue("01@parameter.pref", "", "", true);
                                            return;
                                        }
                                        Util.showSearchList("select code,name from c_ycust order by path", "NAME", "CODE", function (valx, val) {
                                            thatForm.frm.setFieldValue("01@parameter.pref", valx, val, true);
                                            sap.m.MessageToast.show(thatForm.frm.getFieldValue("01@parameter.pref"));
                                        });

                                    },
                                    change: function (event) {
                                        var vl = event.oSource.getValue();
                                        thatForm.frm.setFieldValue("01@parameter.pref", vl, vl, true);
                                    }
                                },
                                list: "",
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                dispInPara: true,
                            },
                        },
                        print_templates: [
                            {
                                title: "Format 1",
                                reportFile: "trans_1",
                            }
                        ],
                        canvas: [],
                        db: [
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
                                    var sq = "select field1 accno,field2 name,field19 parentacc,field17 path," +
                                        " to_number(field9) - to_number(field10) DR from temporary " +
                                        " where idno=66601 and usernm='01'  and to_number(field16)=1" +
                                        " and to_number(field9) - to_number(field10)!=0" +
                                        " order by field17 ";
                                    ;

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
                                                    name: "Closing Bal",
                                                    value: "{DR}"
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
                                                    'values': ["Closing Bal"]
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
                                        }
                                        ,
                                        afterAddOBject: function () {
                                            Util.destroyID("graphAccnoPop" + thatForm.timeInLong, view);
                                            Util.destroyID("graphAccno" + thatForm.timeInLong, view);
                                            this.obj.removeAllContent();
                                            this.obj.addContent(
                                                new sap.viz.ui5.controls.Popover(view.createId("graphAccnoPop" + thatForm.timeInLong)));
                                            this.obj.addContent(
                                                new sap.viz.ui5.controls.VizFrame(view.createId("graphAccno" + thatForm.timeInLong), {
                                                    uiConfig: {applicationSet: 'fiori'},
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
                                        ,
                                    }
                                    ,
                                    htmlPanel: {
                                        colname: "htmlPanel",
                                        data_type:
                                        FormView.DataType.String,
                                        class_name:
                                        ReportView.ClassTypes.HTML,
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
                                        bat7OnSetFieldAddQry: function (qryObj, ps) {
                                            var ret = true;
                                            var sq="select GRPNAME_A , sum(debit-credit) total_transaction from acc_transaction " +
                                                " where vou_date>=:parameter.fromdate and vou_date<=:parameter.todate " +
                                                " and (cust_code=':parameter.pref' or ':parameter.pref' is null ) and " +
                                                " (accno=':parameter.paccno' or ':parameter.paccno' is null) " +
                                                " group by grpname_a ";
                                            // var sq = "select field1 accno,field2 name,field19 parentacc,field17 path," +
                                            //     " to_number(field9) - to_number(field10) DR from temporary " +
                                            //     " where idno=66601 and usernm='01'  and to_number(field16)=1" +
                                            //     " and to_number(field9) - to_number(field10)!=0" +
                                            //     " order by field17 ";
                                            // ;
                                            sq = thatForm.frm.parseString(sq);

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
                                                qrNo: 1002,

                                            }, false).done(function (data) {
                                                if (!data.ret == "SUCCESS") {
                                                    ret = false;
                                                }

                                            });
                                            return ret;

                                        },
                                        bat7OnSetFieldGetData: function (qryObj) {
                                            var thatObj=this;
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
                                                qrNo: 1002,
                                            }, false).done(function (dt) {
                                                if (dt.ret == "SUCCESS") {
                                                    var ob = view.byId("graphAccno" + thatForm.timeInLong);//thatForm.frm.getObject("01@qry3.accno").obj.getContent()[0];
                                                    var dtx11 = JSON.parse("{" + dt.data + "}");
                                                    var h = UtilGen.toHTMLTableFromData(dtx11);
                                                    thatObj.obj.setContent(h);
                                                }
                                            });

                                        },

                                        onSetField:
                                            function (pvl) {
                                            }

                                        ,

                                        onPrintField: function () {
                                            return this.obj.$().outerHTML();
                                        }
                                        ,
                                        beforeAddObject: function () {
                                            // Util.destroyID("graphAccnoPop" + thatForm.timeInLong);


                                        }
                                        ,
                                        other_settings: {
                                            height: "300px",

                                        }
                                        ,

                                    }
                                }
                            },
                            {
                                type: "query",
                                name: "qry2",
                                disp_class: "paddingLR5P",
                                showType: FormView.QueryShowType.QUERYVIEW,
                                dispRecords: 20,
                                execOnShow: false,
                                dml: "select '01' accno , 'do it' descr from dual",
                                // parent: "PARENTACC",
                                code: "ACCNO",
                                title: "NAME",
                                beforeLoadQry: function (sql) {
                                    var sq =
                                        "BEGIN C6_STATMENT(:parameter.fromdate,:parameter.todate,':parameter.paccno',':parameter.pcc',':parameter.pref'); COMMIT; END;";
                                    sq = thatForm.frm.parseString(sq);
                                    Util.doAjaxJson("sqlmetadata?", {
                                        sql: sq,
                                        ret: "NONE",
                                        data: null
                                    }, false).done(function (data) {
                                    });
                                    return "select *from C6_GL2 where 1=1 and usernm=c6_session.get_user_session order by pos";
                                },
                                fields: {
                                    vou_date: {
                                        colname: "vou_date",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Date",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        canvas: "default_canvas",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "SHORT_DATE_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        // commandLink: "gl.jv formSize=100%,550px status=view keyfld=:keyfld",
                                        commandLinkClick: cmdLink
                                    },
                                    balance: {
                                        colname: "balance",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Balance",
                                        title2: "",
                                        parentTitle: undefined,
                                        parentSpan: 1,
                                        canvas: "default_canvas",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    debit: {
                                        colname: "debit",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Debit",
                                        title2: "",
                                        parentTitle: undefined,
                                        parentSpan: 1,
                                        canvas: "default_canvas",
                                        display_width: "120",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    credit: {
                                        colname: "credit",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Credit",
                                        title2: "",
                                        parentTitle: undefined,
                                        parentSpan: 1,
                                        canvas: "default_canvas",
                                        display_width: "120",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    descr: {
                                        colname: "DESCR",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Descr",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        canvas: "default_canvas",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    vou_no: {
                                        colname: "VOU_NO",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Vou No",
                                        title2: "",
                                        parentTitle: undefined,
                                        parentSpan: 1,
                                        canvas: "default_canvas",
                                        display_width: "100",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    accno: {
                                        colname: "ACCNO",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "AC NO",
                                        title2: "",
                                        parentTitle: undefined,
                                        parentSpan: 1,
                                        canvas: "default_canvas",
                                        display_width: "120",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    name: {
                                        colname: "NAME",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Name",
                                        title2: "",
                                        parentTitle: undefined,
                                        parentSpan: 1,
                                        canvas: "default_canvas",
                                        display_width: "200",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        display_type: "NONE",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    type_descr: {
                                        colname: "TYPE_DESCR",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "Trans Type",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        canvas: "default_canvas",
                                        display_width: "150",
                                        display_align: "ALIGN_RIGHT",
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },

                                }
                            },
                        ]

                    }
                },
                {
                    code: "02",
                    name: "Summary by Ac",
                    showFilterCols: true,
                    rep: {
                        parameters: {
                            fromdate: {
                                colname: "fromdate",
                                data_type: FormView
                                    .DataType.Date,
                                class_name:
                                FormView.ClassTypes.DATEFIELD,
                                title:
                                    "From Date",
                                title2:
                                    "",
                                canvas:
                                    "para_canvas",
                                display_width:
                                colSpan,
                                display_align:
                                    "ALIGN_RIGHT",
                                display_style:
                                    "",
                                display_format:
                                    "",
                                default_value:
                                    "#DATE_10/01/2020",
                                other_settings:
                                    {}
                                ,
                                list: undefined,
                                edit_allowed:
                                    true,
                                insert_allowed:
                                    true,
                                require:
                                    true,
                                dispInPara: true,
                            },
                            todate: {
                                colname: "todate",
                                data_type:
                                FormView.DataType.Date,
                                class_name:
                                FormView.ClassTypes.DATEFIELD,
                                title:
                                    "@To Date",
                                title2:
                                    "",
                                canvas:
                                    "para_canvas",
                                display_width:
                                colSpan,
                                display_align:
                                    "ALIGN_RIGHT",
                                display_style:
                                    "",
                                display_format:
                                    "",
                                default_value:
                                    "#DATE_11/01/2020",
                                other_settings:
                                    {}
                                ,
                                list: undefined,
                                edit_allowed:
                                    true,
                                insert_allowed:
                                    true,
                                require:
                                    true,
                                dispInPara: true,
                            }
                            ,
                            jvtype: {
                                colname: "jvtype",
                                data_type:
                                FormView.DataType.Number,
                                class_name:
                                FormView.ClassTypes.COMBOBOX,
                                title:
                                    "JV Type",
                                title2:
                                    "",
                                canvas:
                                    "default_canvas",
                                display_width:
                                colSpan,
                                display_align:
                                    "ALIGN_RIGHT",
                                display_style:
                                    "",
                                display_format:
                                    "",
                                default_value:
                                    "#NUMBER_-1",
                                other_settings:
                                    {
                                        customData: [{key: ""}],
                                        items:
                                            {
                                                path: "/",
                                                template:
                                                    new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                                                templateShareable:
                                                    true
                                            }
                                        ,
                                    }
                                ,
                                list: "@-1/All,1/General,2/Purchases,3/Sales",
                                edit_allowed:
                                    true,
                                insert_allowed:
                                    true,
                                require:
                                    true,
                                dispInPara:
                                    true,
                            }
                            ,
                        },
                        canvas: [],
                        db:
                            [
                                {
                                    type: "query",
                                    name: "qry1",
                                    showType: FormView.QueryShowType.QUERYVIEW,
                                    dispRecords: -1,
                                    execOnShow: false,
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
                    name:
                        "Account List",
                    showFilterCols: true,
                    rep:
                        {
                            parameters: {
                                levelno: {
                                    colname: "levelno",
                                    data_type:
                                    FormView.DataType.Number,
                                    class_name:
                                    FormView.ClassTypes.TEXTFIELD,
                                    title:
                                        "Level",
                                    title2:
                                        "",
                                    canvas:
                                        "default_canvas",
                                    display_width:
                                    colSpan,
                                    display_align:
                                        "ALIGN_RIGHT",
                                    display_style:
                                        "",
                                    display_format:
                                        "",
                                    default_value:
                                        "#NUMBER_0",
                                    other_settings:
                                        {}
                                    ,
                                    list: undefined,
                                    edit_allowed:
                                        true,
                                    insert_allowed:
                                        true,
                                    require:
                                        true,
                                }

                            }
                            ,
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
        this.frm.pgMaster = this.pgMaster;
        this.frm.app = this.joApp;
        this.frm.parseRep(js);
        this.frm.parasAsLabels = true;
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



