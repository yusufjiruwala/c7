sap.ui.jsfragment("bin.forms.gl.acclist", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.mode = "acc";
        that.current_det_ac = "";
        this.timeInLong = (new Date()).getTime();
        this.joApp = new sap.m.SplitContainer();
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

        this.pgDetail = new sap.m.Page({
            showHeader: true,
            showFooter: false,
            content: []
        });
        this.pgMaster = new sap.m.Page({
            showHeader: true,
            enableScrolling: false,
            content: []
        });

        this.pgMain = new sap.m.Page({
            showHeader: true,
            content: [this.joApp]
        }).addStyleClass("acclist");
        this.pathLbl = new sap.m.Label({});

        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.pgDetail);
        this.joApp.addMasterPage(this.pgMaster);
        this.joApp.toDetail(this.pgDetail, "show");
        this.joApp.toMaster(this.pgMaster, "show");
        this.app = new sap.m.App({ height: "90%", pages: this.pgMain });
        return this.app;
    },
    createView: function () {
        var that = this;
        var that2 = this;
        var view = this.view;
        that2.clicks = 0;
        that2.selectedIndex = -1;

        UtilGen.clearPage(this.pgDetail);
        UtilGen.clearPage(this.pgMaster);

        // UtilGen.clearPage(this.pgMain);
        var srch = new sap.m.Toolbar({
            content: [
                new sap.m.SearchField({
                    liveChange: function (e) {
                        UtilGen.doFilterLiveTable(e, that.acqv, ["ACCNO", "ACNAME"]);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://negative",
                    press: function () {
                        that.acqv.getControl().collapseAll();
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://positive",
                    press: function () {
                        that.acqv.getControl().expandToLevel(255);
                    }
                })
            ]
        });
        this.modeList = UtilGen.createControl(sap.m.ComboBox, this.view, "ord_type", {
            customData: [{ key: "" }],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                templateShareable: true
            },
            selectedKey: "acc",
            selectionChange: function (event) {
                var mod = UtilGen.getControlValue(that2.modeList);
                that2.loadData(mod);

            }
        }, "string", undefined, undefined, "@acc/Ledgers,cc/Cost Centers,rp/Rec-Pay");

        this.pgMain.attachBrowserEvent("keydown", function (e) {
            if (e.key == 'F1') {
                UtilGen.execCmd("main",
                    that2.view);
            }
        });

        var tb = new sap.m.Toolbar({
            content: [
                this.modeList,
                new sap.m.ToggleButton({
                    icon: "sap-icon://graph",
                    pressed: false,
                    text: "Graph",
                    press: function (e) {
                        if (this.pressed)
                            that2.hideGraphFooter();
                        else
                            that2.showGraphFooter();

                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://create-form",
                    text: Util.getLangText("newAc"),
                    press: function (e) {
                        UtilGen.execCmd("bin.forms.gl.masterAc formSize=650px,400px status=new",
                            that2.view, e.getSource());
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://refresh",
                    text: Util.getLangText("refresh"),
                    press: function () {
                        var ca = that2.current_ac;
                        var sq = "select childcount from acaccount where accno=" + Util.quoted(ca);
                        if (that2.mode == "cc")
                            sq = "select childcount from accostcent1 where code=" + Util.quoted(ca)
                        else if (that2.mode == "rp")
                            sq = "select childcount from c_ycust where code=" + Util.quoted(ca)

                        var ch = Util.getSQLValue(sq);
                        that2.loadData();
                        that2.loadData_details(ca, ch);
                    }
                }),
                new sap.m.ToolbarSpacer(),
                new sap.m.Button({
                    text: Util.getLangText("cmdClose"),
                    icon: "sap-icon://decline",
                    press: function () {
                        that2.app.backFunction();
                    }
                })
            ]
        })
            ;
        that2.pgMain.removeAllHeaderContent();
        that2.pgMain.addHeaderContent(tb);


        this.sc = new sap.m.ScrollContainer({
            width: "100%",
            height: '100%',
            vertical: true
        });
        that2.pgMaster.removeHeaderContent();
        that2.pgMaster.addHeaderContent(srch);
        // that2.pgMaster.addContent(srch);
        // that2.pgMaster.addContent(this.);
        // that2.pgMaster.addContent(this.sc);
        // this.sc.addContent(srch);


        this.acqv = new QueryView("aclistAccs" + this.timeInLong);
        // this.acDet = new QueryView("aclistAccDet" + this.timeInLong);
        this.acDet = new QueryView("aclistAccTrans" + this.timeInLong);

        this.acqv.switchType("tree", this.pgMaster);
        this.acqv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.acqv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.acqv.getControl().setFixedBottomRowCount(0);

        this.acqv.getControl().addStyleClass("noColumnBorder");
        this.acqv.getControl().addStyleClass("sapUiSizeCondensed");

        this.acDet.getControl().addStyleClass("sapUiSizeCondensed");
        this.acDet.getControl().addStyleClass("noColumnBorder");

        this.acDet.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.acDet.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.acDet.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);

        this.acDet.showToolbar.showBar = true;
        this.acDet.showToolbar.showFilter = false;
        this.acDet.showToolbar.filterCols = false;
        this.acDet.showToolbar.showPersonalization = false;

        this.acDet.createToolbar("", ["ACCNO", "NAME"],
            // EVENT ON APPLY PERSONALIZATION
            function (prsn, qv) {
            },
            // EVENT ON REVERT PERSONALIZATION TO ORIGINAL
            function (qv) {
            }
        );
        this.acDet.showToolbar.toolbar.addContent(new sap.m.Button({
            icon: "sap-icon://sys-prev-page",
            tooltip: "Up a/c",
            press: function () {
                if (that2.current_ac != "") {
                    // var sq =
                    //     "select ac.parentacc," +
                    //     "(select childcount from acaccount where acaccount.accno=ac.parentacc ) childcount" +
                    //     " from acaccount ac where ac.accno=" + that2.current_ac
                    // if (that2.mode == "cc")
                    //     sq =
                    //         "select ac.parentcostcent parentacc," +
                    //         "(select childcount from accostcent1 where accostcent1.code=ac.parentcostcent ) childcount" +
                    //         " from accostcent1 ac where ac.code=" + that2.current_ac;
                    // else if (that2.mode == "rp")
                    //     sq =
                    //         "select ac.parentcustomer parentacc," +
                    //         "(select childcount from c_ycust where c_ycust.code=ac.parentcustomer ) childcount" +
                    //         " from c_ycust ac where ac.code=" + that2.current_ac;
                    // var dt = Util.execSQLWithData(sq);
                    if (that.acqv.getControl().getSelectedIndices().length > 0) {
                        var n = that.acqv.getControl().getSelectedIndices()[0];
                        var oData = that.acqv.getControl().getContextByIndex(n);
                        var sp = oData.getPath().split("/");
                        var prntSp = "", fnd = false;

                        for (var ss in sp)
                            if (ss != sp.length - 1)
                                prntSp += (prntSp.length > 0 ? "/" : "") + sp[ss];
                        for (var si = n; si > 0; si--) {
                            if (that.acqv.getControl().getContextByIndex(si).getPath() == "/" + prntSp) {
                                that.acqv.getControl().setSelectedIndex(si);
                                // that.acqv.getControl().setFirstVisibleRow(si);
                                fnd = true;
                                break;
                            }

                        }
                        if (!fnd) {
                            that.acqv.getControl().setSelectedIndex(0);
                            that.acqv.getControl().setFirstVisibleRow(0);
                        }
                    }

                    // if (dt != "" && dt.length > 0 && Util.nvl(dt[0].PARENTACC, "") != "") {

                    //     that2.loadData_details(dt[0].PARENTACC, dt[0].CHILDCOUNT);
                    // }
                }


            }
        }));
        this.acDet.showToolbar.toolbar.addContent(new sap.m.Button({
            icon: "sap-icon://print",
            tooltip: "Print",
            press: function () {
                that.view.colData = {};
                that.view.reportsData = {
                    report_info: { report_name: "Account Details" }
                };
                that.acDet.printHtml(that.view, "para");
            }
        }));
        Util.destroyID("chkUnpost", that.view);
        this.acDet.showToolbar.toolbar.addContent(new sap.m.CheckBox(that.view.createId("chkUnpost"), {
            text: Util.getLangText("auditedTxt"),
            select: function () {
                that.loadData();
            }
        }));

        this.acqv.mColCode = "ACCNO";
        this.acqv.mColName = "NAME";
        this.acqv.mColParent = "PARENTACC";
        this.acqv.mColLevel = "LEVELNO";
        this.acqv.getControl().attachRowSelectionChange(function (ev) {
            // var indicOF = that2.acqv.getControl().getBinding("rows").aIndices;            
            var indic = that2.acqv.getControl().getSelectedIndices();
            var oData = that2.acqv.getControl().getContextByIndex(indic[0]);
            if (oData == undefined || indic.length <= 0) return;
            var accno = oData.getProperty(oData.getPath())[that2.mColCode];
            var childs = oData.getProperty(oData.getPath())["CHILDCOUNT"];
            var acname = oData.getProperty(oData.getPath())[that2.mColCodName];
            sap.m.MessageToast.show(acname);
            that.loadData_details(accno, childs);
        })
        this.pgDetail.removeAllHeaderContent();
        this.pgDetail.addHeaderContent(this.acDet.showToolbar.toolbar);
        this.pgDetail.addContent(this.acDet.getControl());

        // this.acDet.getControl().attachBrowserEvent("click", function () {
        //     that2.clicks++;
        //     if (that2.clicks == 1) {
        //         setTimeout(function () {
        //             that2.clicks = 0;
        //             that2.selectedIndex = -1;
        //         }, 500);
        //     } else if (that2.clicks == 2) {
        //         if (that2.acqv.getControl().getSelectedIndices().length <= 0) return;
        //         that2.selectedIndex = that2.acDet.getControl().getSelectedIndices()[0];
        //     }
        // });
        // this.acDet.getControl().attachBrowserEvent("dblclick", function (e) {
        //     if (that2.selectedIndex <= -1) return;
        //     var oData = that2.acDet.getControl().getContextByIndex(that2.selectedIndex);
        //     var accno = oData.getProperty(oData.getPath())[that2.mColCode];
        //     var acname = oData.getProperty(oData.getPath())[that2.mColName];
        //     var childs = oData.getProperty(oData.getPath())["CHILDCOUNT"];
        //     if (accno == undefined) return;
        //     sap.m.MessageToast.show(acname);
        //     that.loadData_details(accno, childs);

        // });

        this.acqv.getControl().setContextMenu(new sap.m.Menu());
        this.acqv.getControl().attachBeforeOpenContextMenu(function (e) {
            var rn = e.getParameter("rowIndex");
            if (rn <= -1) {
                return false;
            }

            var oData = that2.acqv.getControl().getContextByIndex(rn);
            var childs = oData.getProperty(oData.getPath())["CHILDCOUNT"];
            var usecount = oData.getProperty(oData.getPath())["USECOUNT"];
            var accno = oData.getProperty(oData.getPath())[that2.mColCode];

            var mnu = e.getParameter("contextMenu");
            mnu.removeAllItems();
            if (usecount == 0)
                mnu.addItem(new sap.m.MenuItem({
                    text: "Add child AC",
                    press: function () {
                        var fv = Util.nvl(that.acqv.getControl().getFirstVisibleRow(), 0);
                        UtilGen.execCmd("bin.forms.gl.masterAc formSize=650px,400px status=new parentacc=" + accno, that2.view, e.getSource().getParent().getParent(), undefined, function () {
                            that.loadData();
                            var iin = that.acqv.mLctb.find("ACCNO", accno);
                            // that.acqv.getControl().addSelectionInterval(iin, iin);
                            // that.acqv.getControl().fireRowSelectionChange();
                        });
                    }
                }));
            mnu.addItem(new sap.m.MenuItem({
                text: "View A/c", press: function () {
                    UtilGen.execCmd("bin.forms.gl.masterAc formSize=650px,400px status=view accno=" + accno, that2.view, e.getSource().getParent().getParent());
                }
            }));
            mnu.addItem(new sap.m.MenuItem({
                text: "Edit A/c", press: function () {
                    UtilGen.execCmd("bin.forms.gl.masterAc formSize=650px,400px status=edit accno=" + accno, that2.view, e.getSource().getParent().getParent());
                }
            }));

            return true;
        });

    },
    loadData: function (pmod) {
        var that = this;
        var mod = Util.nvl(pmod, this.mode);
        this.mColCodName = "ACNAME";
        this.mColCode = "ACCNO";
        this.mColName = "NAME";
        this.mColParent = "PARENTACC";
        var mColLevel = "";
        var sq = "select acaccount.accno, acaccount.name, acaccount.parentacc ,acaccount.path,acaccount.childcount,acaccount.usecount,  " +
            "accno||'-'||name acname from acaccount order by path";
        if (mod == "cc") {
            sq = "select cc.*,CODE||'-'||TITLE acname  from accostcent1 cc order by path";
            this.mColCodName = "ACNAME";
            this.mColCode = "CODE";
            this.mColName = "TITLE";
            this.mColParent = "PARENTCOSTCENT";
        } else if (mod == "rp") {
            sq = "select y.code,y.name,y.parentcustomer,y.childcount,y.usecount," +
                " y.path ,CODE||'-'||name acname from c_ycust y order by path";
            this.mColCodName = "ACNAME";
            this.mColCode = "CODE";
            this.mColName = "NAME";
            this.mColParent = "PARENTCUSTOMER";
        }

        var dt = Util.execSQL(sq);
        if (dt.ret == "SUCCESS") {
            this.acqv.setJsonStr("{" + dt.data + "}");
            this.acqv.switchType("tree", this.pgMaster);
            var ld = this.acqv.mLctb;
            for (var i in ld.cols)
                if ((ld.cols[i].mColName != "ACNAME"))
                    ld.cols[i].mHideCol = true;

            var c = ld.getColPos(this.mColCodName);
            ld.cols[c].getMUIHelper().display_width = 300;
            ld.cols[c].mColTitle = "Account";
            this.acqv.setTreeColsType();
            this.acqv.mColCode = this.mColCode;
            this.acqv.mColName = this.mColName;
            this.acqv.mColParent = this.mColParent;
            // this.acqv.mColLevel = "LEVELNO";
            this.acqv.loadData();
            this.mode = mod;
        }
        that.current_det_ac = "";
        this.acqv.getControl().setSelectedIndex(0);
        //this.loadData_details('', 1);
        this.acqv.getControl().fireRowSelectionChange();
    }
    ,
    loadData_details: function (pacn, childs) {
        var that = this;
        var pacc = Util.nvl(pacn, "");
        var cs = Util.nvl(childs, 0);
        var up = that.view.byId("chkUnpost").getSelected() ? 2 : 0;

        var sql = "select ac.accno,ac.name,ac.childcount, (select sum(debit-credit) from ACC_TRANSACTION_UP where " + " (flag=" + up + " or " + up + "=0" + ") and path like ac.path||'%') balance" +
            "  from acaccount ac" +
            " where ac.parentacc=" + Util.quoted(pacc) + " order by ac.path";
        if (cs > 0)
            if (this.mode == "rp") {
                sql = "select y.code,y.name ,y.childcount ," +
                    " (select sum(debit-credit) from ACC_TRANSACTION_cust ay " +
                    " where ay.custpath like y.path||'%' " + " and (flag=" + up + " or " + up + "=0" + ") ) balance" +
                    "  from c_ycust y" +
                    " where y.parentcustomer=" + Util.quoted(pacc) + " order by y.path";
            } else if (this.mode == "cc") {
                sql = "select cc.costcent,cc.title name ,cc.childcount childcount, " +
                    "(select sum(debit-credit) from ACC_TRANSACTION_UP " +
                    " where cspath like cc.path||'%' and " + " and (ACC_TRANSACTION_UP.flag=" + up + " or " + up + "=0" + ") ) balance" +
                    "  from accostcent1 cc" +
                    " where cc.parentcostcent=" + Util.quoted(pacc) + " order by cc.path";
            }

        if (cs == 0) {
            sql = "select vou_date,nvl(STAT_NAME_2,STAT_NAME_1) jv_type,no,descr,debit,credit,vou_code,type vou_type,pos jvpos ,keyfld from ACC_TRANSACTION_UP where accno=" + Util.quoted(pacc) + " and (flag=" + up + " or " + up + "=0" + ") order by vou_date, keyfld";
            if (this.mode == "rp")
                sql = "select vou_date,nvl(STAT_NAME_2,STAT_NAME_1) jv_type,no,descr,debit,credit ,vou_code,type vou_type,pos jvpos ,keyfld from acc_transaction_cust where code=" + Util.quoted(pacc) + " and (flag=" + up + " or " + up + "=0" + ") order by vou_date,keyfld";
            else if (this.mode == "cc")
                sql = "select vou_date,nvl(STAT_NAME_2,STAT_NAME_1) jv_type,no,descr,debit,credit, vou_code,type vou_type,pos jvpos ,keyfld from acc_transaction where costcent=" + Util.quoted(pacc) + " and (flag=" + up + " or " + up + "=0" + ") order by vou_date,keyfld";
        }
        var dat = Util.execSQL(sql);
        var cmdLink = function (obj, rowno, colno, lctb, frm) {
            var vcd = lctb.getFieldValue(rowno, "VOU_CODE");
            var accno = lctb.getFieldValue(rowno, "ACCNO");
            var acname = lctb.getFieldValue(rowno, "NAME");
            var childs = parseFloat(lctb.getFieldValue(rowno, "CHILDCOUNT"));
            if (accno == undefined) return;
            sap.m.MessageToast.show(acname);
            if (that.acqv.getControl().getSelectedIndices().length > 0) {
                var n = that.acqv.getControl().getSelectedIndices()[0];
                that.acqv.getControl().expand(n);
                var oData = that.acqv.getControl().getContextByIndex(n);
                var kys = Object.keys(oData.getObject());
                var n1 = 1;
                for (var ki in kys) {
                    if (kys[ki].startsWith("childeren_")) {
                        if (oData.getObject()[kys[ki]]["ACCNO"] == accno) {
                            that.acqv.getControl().expand(n + n1);
                            that.acqv.getControl().setSelectedIndex(n + n1);
                            break;
                        } else n1++;
                    }
                }

            }
            // that.loadData_details(accno, childs);


        };
        var cmdLink2 = function (obj, rowno, colno, lctb, frm) {
            var vcd = lctb.getFieldValue(rowno, "VOU_CODE");
            var typ = lctb.getFieldValue(rowno, "VOU_TYPE");
            var kfld = lctb.getFieldValue(rowno, "KEYFLD");
            var jvpos = lctb.getFieldValue(rowno, "JVPOS");
            if (vcd == 1) {
                UtilGen.execCmd("gl.jv formType=dialog formSize=100%,80% status=view keyfld=" + kfld + " jvpos=" + jvpos, that.view, obj, undefined);
            } else if (vcd == 3 && (typ == 1 || typ == 6)) {
                UtilGen.execCmd("gl.pv formType=dialog formSize=100%,80% status=view keyfld=" + kfld + " jvpos=" + jvpos, that.view, obj, undefined);
            } else if (vcd == 3 && (typ == 2 || typ == 7)) {
                UtilGen.execCmd("gl.pvc formType=dialog formSize=100%,80% status=view keyfld=" + kfld + " jvpos=" + jvpos, that.view, obj, undefined);
            } else if (vcd == 2 && (typ == 1 || typ == 6)) {
                UtilGen.execCmd("gl.rv formType=dialog formSize=100%,80% status=view keyfld=" + kfld + " jvpos=" + jvpos, that.view, obj, undefined);
            } else if (vcd == 3 && (typ == 2 || typ == 7)) {
                UtilGen.execCmd("gl.rvc formType=dialog formSize=100%,80% status=view keyfld=" + kfld + " jvpos=" + jvpos, that.view, obj, undefined);
            }
            else {
                sap.m.MessageToast.show("Not a JV..");
            }
        };
        if (dat.ret == "SUCCESS") {
            that.acDet.setJsonStr("{" + dat.data + "}");
            if (cs > 0) {
                var c = that.acDet.mLctb.getColPos("BALANCE");
                that.acDet.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                that.acDet.mLctb.cols[c].mSummary = "SUM";
                c = that.acDet.mLctb.getColPos("CHILDCOUNT");
                that.acDet.mLctb.cols[c].mHideCol = true;
                c = that.acDet.mLctb.getColPos("ACCNO");
                that.acDet.mLctb.cols[c].commandLinkClick = cmdLink;
                c = that.acDet.mLctb.getColPos("NAME");
                that.acDet.mLctb.cols[c].commandLinkClick = cmdLink;


            } else {

                var c = that.acDet.mLctb.getColPos("DEBIT");
                that.acDet.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                that.acDet.mLctb.cols[c].mSummary = "SUM";

                c = that.acDet.mLctb.getColPos("CREDIT");
                that.acDet.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                that.acDet.mLctb.cols[c].mSummary = "SUM";

                c = that.acDet.mLctb.getColPos("VOU_DATE");
                that.acDet.mLctb.cols[c].getMUIHelper().display_format = "SHORT_DATE_FORMAT";
                that.acDet.mLctb.cols[c].commandLinkClick = cmdLink2;

                c = that.acDet.mLctb.getColPos("JV_TYPE");
                that.acDet.mLctb.cols[c].getMUIHelper().display_width = "100";
                that.acDet.mLctb.cols[c].commandLinkClick = cmdLink2;

                c = that.acDet.mLctb.getColPos("KEYFLD");
                that.acDet.mLctb.cols[c].getMUIHelper().mHideCol = true;

                c = that.acDet.mLctb.getColPos("VOU_CODE");
                that.acDet.mLctb.cols[c].getMUIHelper().mHideCol = true;

                c = that.acDet.mLctb.getColPos("VOU_TYPE");
                that.acDet.mLctb.cols[c].getMUIHelper().mHideCol = true;

                c = that.acDet.mLctb.getColPos("JVPOS");
                that.acDet.mLctb.cols[c].getMUIHelper().mHideCol = true;

                // that.acDet.mLctb.cols[c].commandLinkClick = cmdLink;

            }
            //colring of negative and positive balance column
            that.acDet.onRowRender = function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
                var oModel = this.getControl().getModel();
                if (oModel.getProperty("BALANCE", currentRowContext) != undefined) {
                    var bal = parseFloat(oModel.getProperty("BALANCE", currentRowContext));
                    if (bal >= 0)
                        qv.getControl().getRows()[dispRow].getCells()[2].$().parent().parent().find("*").css("cssText", UtilGen.DBView.style_debit_numbers + ";text-align:end;");
                    else
                        qv.getControl().getRows()[dispRow].getCells()[2].$().parent().parent().find("*").css("cssText", UtilGen.DBView.style_credit_numbers + ";text-align:end;");
                }
                if (oModel.getProperty("DEBIT", currentRowContext) != undefined) {
                    qv.getControl().getRows()[dispRow].getCells()[4].$().parent().parent().find("*").css("cssText", UtilGen.DBView.style_debit_numbers + ";text-align:end;");
                    qv.getControl().getRows()[dispRow].getCells()[5].$().parent().parent().find("*").css("cssText", UtilGen.DBView.style_credit_numbers + ";text-align:end;");
                }
            };

            that.acDet.loadData();
            that.current_ac = pacc;
            var sq = "select name from acaccount where accno=" + Util.quoted(pacc);
            if (that.mode == "cc")
                sq = "select title from accostcent1 where code=" + Util.quoted(pacc);
            else if (that.mode == "rp")
                sq = "select name from c_ycust where code=" + Util.quoted(pacc);

            that.current_ac_name = Util.getSQLValue(sq);
            that.pgMain.setTitle(pacc + " - " + that.current_ac_name);

        }
    }
    ,
    validateSave: function () {

        return true;
    }
    ,
    save_data: function () {
    }
    ,
    hideGraphFooter: function () {

    },
    showGraphFooter: function () {

    }


});



