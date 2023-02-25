sap.ui.jsfragment("bin.forms.yd.dl", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.SplitApp({ mode: sap.m.SplitAppMode.HideMode });
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
            onm: ""
        };
        this.weekEngDays = ['Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'];
        this.weekArbDays = ['الأحد',
            'الاثنين',
            'الثلاثاء',
            'الأربعاء',
            'الخميس',
            'الجمعه',
            'السبت'];
        this.timeInLong = (new Date()).getTime();
        // this.pgDetail = new sap.m.Page({showHeader: false});

        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");
        return this.joApp;
    },
    createView: function () {
        var that = this;
        var view = this.view;

        UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];
        this.frm = this.createViewHeader();
        this.frm.getToolbar().addContent(this.bk);
        this.frm.getToolbar().addContent(new sap.m.Title({ text: "Delivery Daily" }));
        // that.createScrollCmds(this.frm.getToolbar());
        this.qv = new QueryView("qrDlv" + that.timeInLong);
        that.qv.getControl().view = this.view;
        this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        this.qv.getControl().setAlternateRowColors(false);

        // var sc = new sap.m.ScrollContainer();

        // sc.addContent(this.frm);
        // sc.addContent(this.qv.getControl());
        this.mainPage.addContent(this.frm);
        this.mainPage.addContent(this.qv.getControl());

    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        this.o1 = {};
        var tl = "XL3 L2 M2 S12";
        this.o1.fromdate = UtilGen.addControl(fe, "Date", sap.m.DatePicker, "dayFromDate",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" })
            }, "date", undefined, this.view);

        this.o1.salesp = UtilGen.addControl(fe, "Driver", sap.m.ComboBox, "lstDriver",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" }),
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{NO}" }),
                    templateShareable: true
                },

            }, "driver", undefined, this.view, undefined, "select no,name from salesp order by no");

        var dt = new Date();
        var fr = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

        UtilGen.setControlValue(this.o1.fromdate, fr);

        this.o1._cmdExe = new sap.m.Button({
            text: "Exe Query", press: function () {
                that.loadData();
            },
            layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" })
        });
        this.o1._cmdPrint = new sap.m.Button({
            text: "Save & Print", press: function () {
                that.printData();
            },
            layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" })
        });
        this.o1._cmdReport = new sap.m.Button({
            text: "Report", press: function () {
                that.printReport();
            },
            layoutData: new sap.ui.layout.GridData({ span: "XL2 L2 M2 S12" })
        });

        fe.push(this.o1._cmdExe);
        fe.push(this.o1._cmdPrint);
        fe.push(this.o1._cmdReport);

        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        var fr = UtilGen.getControlValue(this.o1.fromdate);

        var sq = "select keyfld,ord_no,ord_refnm,delivery_date,week_no,day_no,sub_address,sub_mobileno,DES_BREAKFAST, DES_LUNCH, DES_DINNER, DES_SALAD, DES_SNACK, DES_SOUP " +
            " from sub_cust_plan2 " +
            " where delivery_date=" + Util.toOraDateString(fr)
        " order by ord_no ";

        this.qv.getControl().setEditable(false);
        Util.doAjaxJson("sqlmetadata", { sql: sq }, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");

                // var c = that.qv.mLctb.getColPos("AMOUNT");
                // that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                // that.qv.mLctb.getColByName("AMOUNT").mSummary = "SUM";

                // c = that.qv.mLctb.getColPos("TOTAL_CASH");
                // that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                // that.qv.mLctb.getColByName("TOTAL_CASH").mSummary = "SUM";

                // var c = that.qv.mLctb.getColPos("TOTAL_KNET");
                // that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
                // that.qv.mLctb.getColByName("TOTAL_KNET").mSummary = "SUM";

                var c = that.qv.mLctb.getColPos("DELIVERY_DATE");
                that.qv.mLctb.cols[c].getMUIHelper().display_format = "SHORT_DATE_FORMAT";
                that.qv.mLctb.cols[c].getMUIHelper().display_width = "100";

                c = that.qv.mLctb.getColPos("ORD_NO");
                that.qv.mLctb.cols[c].getMUIHelper().display_width = "75";

                c = that.qv.mLctb.getColPos("KEYFLD");
                that.qv.mLctb.cols[c].getMUIHelper().display_width = "0";

                c = that.qv.mLctb.getColPos("ORD_REFNM");
                that.qv.mLctb.cols[c].commandLink = "bin.forms.yd.cp ord_no=:ORD_NO formType=dialog formSize=100%,100%";

                that.qv.mLctb.parse("{" + data.data + "}", true);
                that.qv.loadData();
                // view.byId("poOpenInv").setEnabled(true);


            }
        });
    }
    ,
    validateSave: function () {

        return true;
    }
    ,
    save_data: function () {
    },
    get_emails_sel: function () {

    },
    printData: function () {
        var that = this;
        var sl = UtilGen.getControlValue(this.o1.salesp);
        if (Util.nvl(sl, "") == "")
            FormView.err("Err !, assign driver ..");

        that.showDelivery();



    },
    printReport: function () {
        var that = this;
        that.view.colData = {};
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        var fr = sdf.format(UtilGen.getControlValue(this.o1.fromdate));
        that.view.reportsData = {
            report_info: {
                report_name: "Daily Delivery",
                report_other: "Date : " + fr
            },
        };
        that.qv.printHtml(that.view, "");
    },
    showDelivery: function () {
        var kflds = "";
        var that = this;
        var mTable = that.qv.getControl();
        var selectedIndices = mTable.getSelectedIndices();
        var dlvdt = undefined;
        if (selectedIndices.length == 0) return;
        for (var i = 0; i < selectedIndices.length; i++) {
            var oData = mTable.getContextByIndex(selectedIndices[i]);
            var data = oData.getProperty(oData.getPath());
            if (Util.nvl(data["KEYFLD"], "") != "")
                kflds += ' "' + data["KEYFLD"] + '"';
        }
        if (that.qv.mLctb.rows.length > 0)
            dlvdt = new Date(that.qv.mLctb.getFieldValue(0, "DELIVERY_DATE").replaceAll(".", ":"));

        if (kflds.trim() == "") FormView.err("No delivery selected !");
        var sl = UtilGen.getControlValue(this.o1.salesp);
        var sq = "update order_cust_plan set driver_no=" + Util.quoted(sl) + " , DELIVER_TIME=sysdate " +
            " where " + Util.quoted(kflds) + " like '%'||keyfld||'%'";
        var dt = Util.execSQL(sq);
        if (dt.ret == "SUCCESS")
            sap.m.MessageToast.show(selectedIndices.length + " # Delivery Updated");
        var ps = "_para_KEYFLDS=" + kflds + "&";
        ps += "_para_DAYENG=" + that.weekEngDays[dlvdt.getDay()] + "&";
        ps += "_para_DAYARB=" + that.weekArbDays[dlvdt.getDay()] + "&";
        Util.doXhr("report?reportfile=sub_delivery2&" + ps, true, function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/pdf" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.target = "_blank";
                link.style.display = "none";
                document.body.appendChild(link);
                link.download = "sub_delivery2" + new Date() + ".pdf";
                Util.printPdf(link.href);
                dlg.close();
                that.show_menu_items();
            }

        });
    }

});



