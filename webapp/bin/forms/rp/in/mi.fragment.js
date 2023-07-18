sap.ui.jsfragment("bin.forms.rp.in.mi", {
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

    addStores: function (qryObj, col, visibleCol) {
        var thatForm = this;
        var qv = qryObj.obj;
        var ss = thatForm.frm.getFieldValue("parameter.showstoreqty");
        if (ss == "-1") return;
        var align = (ss == "0" ? "center" : "end");
        var dispForm = (ss == "0" ? "QTY_FORMAT" : "MONEY_FORMAT");
        var sumVal = (ss == "0" ? "" : "SUM");
        var titlCol = (ss == "0" ? "strByQty" : "strByCost");
        var dt = Util.execSQL("select no , name from store order  by no");
        if (dt != undefined && dt.ret == "SUCCESS") {
            var dtx = JSON.parse("{" + dt.data + "}").data;
            for (var d in dtx) {
                var i = dtx[d].NO;
                cx = qv.mLctb.addColumn("store" + i);
                cx.mHideCol = false;
                visibleCol.push(cx);
                cx.mColClass = Util.nvl(col.class_name, "sap.m.Label");
                cx.mUIHelper.data_type = Util.nvl(col.data_type, "String").toUpperCase();
                cx.mUIHelper.display_align = Util.nvl(align, "center");
                cx.mUIHelper.display_format = Util.nvl(dispForm, "");
                cx.mUIHelper.display_width = Util.nvl(col.display_width, "30");
                cx.mUIHelper.display_style = Util.nvl(col.display_style, "");
                cx.mTitle = dtx[d].NAME;
                cx.mTitleParent = Util.nvl(titlCol, "");
                cx.mTitleParentSpan = dtx.length;
                cx.commandLink = Util.nvl(col.commandLink, "");
                cx.valOnZero = col.valOnZero;
                cx.commandLinkClick2 = col.commandLinkClick;
                cx.commandLinkClick = (col.commandLinkClick != undefined ? function (obj, rowno, col, lctb) {
                    this.commandLinkClick2(obj, rowno, col, lctb, thatForm.frm);
                } : undefined);
                cx.mSummary = Util.nvl(sumVal, "");
                cx.mSearchSQL = "";
                cx.mLookUpCols = "";
                cx.mRetValues = "";
                cx.eOther = "";
                cx.mDefaultValue = "";
                cx.mGrouped = Util.nvl(col.grouped, false);
            }
        }

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
            UtilGen.execCmd("rp.in.st formType=dialog formSize=100%,100% repno=1 para_PARAFORM=false para_EXEC_REP=true prefer=" + it + " fromdate=@" + fromdate + " todate=@" + todate, UtilGen.DBView, obj, UtilGen.DBView.newPage);

        }
        // UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];

        var sc = new sap.m.ScrollContainer();

        var js = {
            title: Util.getLangText("miRepTit"),
            title2: "",
            show_para_pop: false,
            reports: [
                {
                    code: "MI001",
                    name: Util.getLangText("miRepName1Items"),
                    descr: Util.getLangText("miRepDescr1Items"),
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    showCustomPara: function (vbPara, rep) {

                    },
                    onSubTitHTML: function () {
                        var tbstr = Util.getLangText("miRepName1Items");
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
                            prefer: ReportUtils.Parameters.getPrefer(thatForm, "MI001@parameter.prefer", "MI001@parameter.prefname"),
                            prefname: ReportUtils.Parameters.getPreferName(),
                            levelno: ReportUtils.Parameters.getLevelNo(),
                            incmf: {
                                colname: "incmf",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"inclMF\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
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
                            recalc: {
                                colname: "recalc",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"reCalc\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
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
                            showbal: {
                                colname: "showbal",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"showBal\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
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
                            showstoreqty: {
                                colname: "showstoreqty",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.COMBOBOX,
                                title: '{\"text\":\"showDetailsCol\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                display_width: colSpan,
                                display_align: "ALIGN_LEFT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "20%",
                                    items: {
                                        path: "/",
                                        template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                                        templateShareable: true
                                    },
                                    selectedKey: "-1",
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false,
                                dispInPara: true,
                                list: "@-1/None,0/Qty in Store,1/Cost in Store"
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
                                code: "REFERENCE",
                                title: "DESCR",
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["REFERENCE", "DESCR", "MFCODE", "MFNAME"],
                                canvasType: ReportView.CanvasType.VBOX,
                                afterApplyCols: function (qryObj) {
                                    if (qryObj.name == "qry2") {

                                        var iq = thatForm.frm.getFieldValue("parameter.incmf");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("MFCODE")].mHideCol = (iq != "Y");

                                        var showbal = thatForm.frm.getFieldValue("parameter.showbal");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("QTYX")].mHideCol = (showbal != "Y");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("PACK_COST")].mHideCol = (showbal != "Y");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("COSTAMT")].mHideCol = (showbal != "Y");

                                        //                                        var sq = thatForm.frm.getFieldValue("parameter.showstoreqty");
                                    }
                                },
                                beforeLoadQry: function (sql) {
                                    var re = thatForm.frm.getFieldValue("parameter.recalc");
                                    var ac = (re == "Y" ? "get_item_cost(items.reference) pkaver  " : "pkaver/pack pkaver");
                                    var showbal = thatForm.frm.getFieldValue("parameter.showbal");
                                    var bal = (showbal == "Y" ? "(select nvl(sum(qtyin-qtyout),0) from invoice2 where refer=items.reference ) qty  " : "0 qty");

                                    var sq = "select items.reference,items.descr,descr2,items.packd,items.unitd||'x'||items.pack unitdd ,items.pack," +
                                        "items.price1,items.lsprice,items.remark,items.parentitem,items.childcounts,items.levelno,mfcode," +
                                        "cu.name mfname , 0 pack_cost,0 qtyx,0 costamt, " + ac + "," + bal + " from items, c_ycust cu " +
                                        "where  cu.code(+)=mfcode and  items.descr2 like ((select nvl(max(DESCR2),'')||'%' from items where items.reference=':parameter.prefer' )) order by descr2";
                                    sq = thatForm.frm.parseString(sq);
                                    return sq;
                                },
                                eventCalc: function (qv, cx, rowno, reAmt) {
                                    var sett = sap.ui.getCore().getModel("settings").getData();
                                    var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
                                    if (rowno >= 0) return;
                                    for (var i = 0; i < qv.mLctb.rows.length; i++) {
                                        var pkaver = qv.mLctb.getFieldValue(i, "PKAVER");
                                        var pkq = qv.mLctb.getFieldValue(i, "QTY");
                                        var cstamt = pkaver * pkq;
                                        var pack_cost = pkaver / qv.mLctb.getFieldValue(i, "PACK");
                                        var qtyx = pkq / qv.mLctb.getFieldValue(i, "PACK");
                                        qv.mLctb.setFieldValue(i, "COSTAMT", cstamt);
                                        qv.mLctb.setFieldValue(i, "PACK_COST", pack_cost);
                                        qv.mLctb.setFieldValue(i, "QTYX", qtyx);
                                    }
                                    var getBal = function (pth) {
                                        var cst = 0, qt = 0, fnd = false; // fnd variable just to find take sum and break loop for performance
                                        for (var i = 0; i < qv.mLctb.rows.length; i++)
                                            if (qv.mLctb.getFieldValue(i, "DESCR2").startsWith(pth)) {
                                                cst += qv.mLctb.getFieldValue(i, "COSTAMT");
                                                qt += qv.mLctb.getFieldValue(i, "QTY");
                                                fnd = true;
                                            } else if (fnd) break;
                                        return { costamt: cst, qty: qt };
                                    }
                                    for (var i = 0; i < qv.mLctb.rows.length; i++) {
                                        var chld = qv.mLctb.getFieldValue(i, "CHILDCOUNTS");
                                        if (chld > 0) {
                                            var c = getBal(qv.mLctb.getFieldValue(i, "DESCR2"));
                                            var qty = c.qty;
                                            var costamt = c.costamt;
                                            var pack_cost = (c.costamt / qty) * qv.mLctb.getFieldValue(i, "PACK");
                                            qv.mLctb.setFieldValue(i, "COSTAMT", costamt);
                                            qv.mLctb.setFieldValue(i, "PACK_COST", pack_cost);
                                            qv.mLctb.setFieldValue(i, "QTYX", qty / qv.mLctb.getFieldValue(i, "PACK"));

                                        }
                                    }

                                    qv.updateDataToControl();



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
                                    var ss = thatForm.frm.getFieldValue("parameter.showstoreqty");
                                    if (ss == "-1") return;
                                    var sq = "select stra,refer,sum(qtyin-qtyout) qty from invoice2 group by stra,refer order by refer,stra";
                                    if (ss == "1")
                                        sq = "select stra,refer,sum(pkcost*(qtyin-qtyout)) qty from invoice2 group by stra,refer order by refer,stra";

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
                                            thatForm.storeQtyData = new LocalTableData();
                                            thatForm.storeQtyData.parse("{" + dt.data + "}", false);
                                            var sd = thatForm.storeQtyData;
                                            var ld = thatForm.frm.objs["MI001@qry2"].obj.mLctb;
                                            for (var si = 0; si < sd.rows.length; si++) {
                                                var rw = ld.find("REFERENCE", sd.getFieldValue(si, "REFER"));
                                                if (rw < 0) continue;
                                                var cnm = "STORE" + sd.getFieldValue(si, "STRA");
                                                if (ld.getColPos(cnm) < 0) continue;
                                                var qt = sd.getFieldValue(si, "QTY") / ld.getFieldValue(rw, "PACK");
                                                ld.setFieldValue(rw, cnm, qt);
                                                if (ld.getFieldValue(rw, "PARENTITEM") != "") {
                                                    var rwP = ld.find("REFERENCE", ld.getFieldValue(rw, "PARENTITEM"));
                                                    if (rwP >= 0) {
                                                        var amt = Util.nvl(ld.getFieldValue(rwP, cnm), 0);
                                                        ld.setFieldValue(rwP, cnm, (amt + qt));
                                                    }
                                                }
                                            }
                                        }
                                    });
                                },

                                fields: {
                                    reference: ReportUtils.Fields.getItemReference({ commandLinkClick: cmdLink }),
                                    descr: {
                                        colname: "descr",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemDescr",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "220",
                                        display_align: "ALIGN_BEGIN",
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
                                        display_width: "120",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    unitdd: {
                                        colname: "unitdd",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPack",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "120",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    pack_cost: {
                                        colname: "pack_cost",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackCost",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "90",
                                        display_align: "ALIGN_RIGHT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        display_type: function () { return thatForm.frm.getFieldValue("parameter.showbal") == "Y" ? "NONE" : "INVISIBLE"; },
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    qtyx: {
                                        colname: "qtyx",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPackQty",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "90",
                                        display_align: "ALIGN_END",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        display_type: function () { return thatForm.frm.getFieldValue("parameter.showbal") == "Y" ? "NONE" : "INVISIBLE"; },
                                        commandLinkClick: cmdLink
                                    },
                                    costamt: {
                                        colname: "costamt",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCostAmt",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "90",
                                        display_align: "ALIGN_RIGHT",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        summary: "SUM",
                                        default_value: "",
                                        display_type: function () { return thatForm.frm.getFieldValue("parameter.showbal") == "Y" ? "NONE" : "INVISIBLE"; },
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    stores: {
                                        colname: "stores",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "storeNo",
                                        title2: "",
                                        parentTitle: "Stores by Qty",
                                        parentSpan: 1,
                                        display_width: "90",
                                        display_align: "ALIGN_CENTER",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "QTY_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        display_type: "NONE",
                                        onTemplField: function (qryObj, visibleCol) {
                                            thatForm.addStores(qryObj, this, visibleCol);
                                        },
                                        commandLinkClick: cmdLink
                                    },
                                    price1: {
                                        colname: "price1",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPrice",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "120",
                                        display_align: "ALIGN_END",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    lsprice: {
                                        colname: "lsprice",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemLSPrice",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_END",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    mfcode: {
                                        colname: "mfcode",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemMFNCode",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "80",
                                        display_align: "ALIGN_BEGIN",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    mfname: {
                                        colname: "mfname",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemMFNName",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "150",
                                        display_align: "ALIGN_BEGIN",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
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
                                },
                                bat7CustomGetData: function (qryObj) {
                                    var thatObj = this;

                                    if (thatForm.frm.getFieldValue("parameter.showbal") != "Y") {
                                        Util.destroyID("graphAccnoPop" + thatForm.timeInLong, view);
                                        Util.destroyID("graphAccno" + thatForm.timeInLong, view);

                                        return;
                                    }
                                    thatForm.addGraphObj(thatForm.frm.objs["MI001@qry3.accno"]);

                                    var ob = view.byId("graphAccno" + thatForm.timeInLong);//thatForm.frm.getObject("01@qry3.accno").obj.getContent()[0];
                                    var dtit = thatForm.frm.objs["MI001@qry2"].obj.mLctb.getData(true);
                                    var dtx = [];
                                    for (var i = 0; i < dtit.length; i++) {
                                        if (dtit[i].LEVELNO == 1)
                                            dtx.push(
                                                {
                                                    DESCR: dtit[i].DESCR, COSTAMT: dtit[i].COSTAMT
                                                });

                                    }
                                    var dimensions = [{
                                        name: "DESCR",
                                        value: "{DESCR}"
                                    }];
                                    var measures = [

                                        {
                                            name: Util.getLangText("totalText"),
                                            value: "{COSTAMT}"
                                        }];

                                    thatObj.dataSetDone = (ob.getModel() != undefined);
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

                                    if (Util.nvl(thatObj.dataSetDone, false) == false) {
                                        var formatPattern = sap.viz.ui5.format.DefaultPattern;

                                        var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                                            'uid': "valueAxis",
                                            'type': "Measure",
                                            'values': [Util.getLangText("totalText")]
                                        });

                                        var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                                            'uid': "categoryAxis",
                                            'type': "Dimension",
                                            'values': ["DESCR"]
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
                                                text: 'AMOUNT '
                                            }
                                        });
                                        var pop = view.byId("graphAccnoPop" + thatForm.timeInLong);
                                        pop.connect(ob.getVizUid());
                                        thatObj.dataSetDone = true;
                                    }


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
                                            thatForm.addGraphObj(this);
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
                },
                {
                    code: "MI002",
                    name: Util.getLangText("miRepName2Items"),
                    descr: Util.getLangText("miRepDescr2Items"),
                    paraColSpan: undefined,
                    hideAllPara: false,
                    paraLabels: undefined,
                    showSQLWhereClause: true,
                    showFilterCols: true,
                    showDispCols: true,
                    showCustomPara: function (vbPara, rep) {

                    },
                    onSubTitHTML: function () {
                        var tbstr = Util.getLangText("miRepNameItems");
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
                                        thatForm.frm.setFieldValue("MI001@parameter.prefer", vl, vl, false);
                                        var vlnm = Util.getSQLValue("select descr from items where reference =" + Util.quoted(vl));
                                        thatForm.frm.setFieldValue("SA001@parameter.prefname", vlnm, vlnm, false);

                                    },
                                    valueHelpRequest: function (event) {
                                        Util.showSearchList("select reference,descr from items where itprice4=0 order by path", "DESCR", "REFERENCE", function (valx, val) {
                                            thatForm.frm.setFieldValue("MI001@parameter.prefer", valx, valx, true);
                                            thatForm.frm.setFieldValue("MI001@parameter.prefname", val, val, true);
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
                            incmf: {
                                colname: "incmf",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"inclMF\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
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
                                dml: "select items.reference,items.descr,items.price1,items.lsprice,items.remark,items.parentitem,items.childcounts,items.levelno,mfcode,cu.name mfname from items,c_ycust cu where  cu.code(+)=mfcode and  items.descr2 like ((select nvl(max(DESCR2),'')||'%' from items where items.reference=':parameter.prefer' )) order by descr2",
                                parent: "PARENTITEM",
                                levelCol: "LEVELNO",
                                code: "REFERENCE",
                                title: "DESCR",
                                isMaster: false,
                                showToolbar: true,
                                masterToolbarInMain: false,
                                filterCols: ["REFERENCE", "DESCR", "MFCODE", "MFNAME"],
                                canvasType: ReportView.CanvasType.VBOX,
                                afterApplyCols: function (qryObj) {
                                    if (qryObj.name == "qry2") {
                                        var iq = thatForm.frm.getFieldValue("parameter.incmf");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("MFCODE")].mHideCol = (iq != "Y");
                                        qryObj.obj.mLctb.cols[qryObj.obj.mLctb.getColPos("MFNAME")].mHideCol = (iq != "Y");
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
                                    reference: {
                                        colname: "reference",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemCode",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "140",
                                        display_align: "ALIGN_BEGIN",
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
                                        display_width: "220",
                                        display_align: "ALIGN_BEGIN",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    price1: {
                                        colname: "price1",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemPrice",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "120",
                                        display_align: "ALIGN_END",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    lsprice: {
                                        colname: "lsprice",
                                        data_type: FormView.DataType.Number,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemLSPrice",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "100",
                                        display_align: "ALIGN_END",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "MONEY_FORMAT",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    mfcode: {
                                        colname: "mfcode",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemMFNCode",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "80",
                                        display_align: "ALIGN_BEGIN",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
                                        other_settings: {},
                                        commandLinkClick: cmdLink
                                    },
                                    mfname: {
                                        colname: "mfname",
                                        data_type: FormView.DataType.String,
                                        class_name: FormView.ClassTypes.LABEL,
                                        title: "itemMFNName",
                                        title2: "",
                                        parentTitle: "",
                                        parentSpan: 1,
                                        display_width: "150",
                                        display_align: "ALIGN_BEGIN",
                                        grouped: false,
                                        display_style: "",
                                        display_format: "",
                                        default_value: "",
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
    addGraphObj: function (fld) {
        Util.destroyID("graphAccnoPop" + this.timeInLong, this.view);
        Util.destroyID("graphAccno" + this.timeInLong, this.view);
        fld.obj.removeAllContent();
        if (this.frm.getFieldValue("parameter.showbal") == "Y") {
            fld.obj.addContent(
                new sap.viz.ui5.controls.Popover(this.view.createId("graphAccnoPop" + this.timeInLong)));
            fld.obj.addContent(
                new sap.viz.ui5.controls.VizFrame(this.view.createId("graphAccno" + this.timeInLong), {
                    uiConfig: { applicationSet: 'fiori' },
                    vizType: "column",
                    height: "100%",
                    legendVisible: false

                }));
        }
    },
    loadData: function () {
    }

})
    ;



