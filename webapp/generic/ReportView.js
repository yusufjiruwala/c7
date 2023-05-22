sap.ui.define("sap/ui/ce/generic/ReportView", ["./QueryView"],
    function (QueryView) {
        'use strict';

        function ReportView(pg, pRepClsId) {
            this.pg = pg;
            this.objs = {};
            this.savedParas = {};
            this.selectedRep = "";
            this.repStr = "";
            // this.rep = {};
            this.timeInLong = (new Date()).getTime();
            this.defaultParas = {};
            this.reportVars = {
                showParaForm: true, // PARAMFORM in string Parameters
                clearReportImmediate: false, // CLEAR_REP in string parameters
                saveRepBeforeClear: true,
                hideTemplates: false, // HIDE_TEMPL in string parameters
            };
            this.repClassID = "";
            this.initHelperFunctions();
        };

        ReportView.getTitleFromField = function (fld) {
            var tit = fld.title;
            if (tit.startsWith("@") || tit.startsWith("#"))
                tit = tit.substr(1);
            try {
                tit = JSON.parse(tit);
                tit = Util.nvl(tit.text, "");
            } catch (e) {
                tit = fld.title;
            }
            if (Util.isCamelCase(tit))
                tit = Util.getLangText(tit);
            return tit;
        };

        ReportView.ObjTypes = {
            PARAMETER: "parameter",
            QUERY: "query",
            FIELD: "field",
            COMMAND_BUTTON: "command_button",
            CANVAS: "canvas",
            LISTS: "lists",

        };

        ReportView.CanvasType = {
            VBOX: "VBOX",
            HBOX: "HBOX",
            FORMCREATE2: "FORMCREATE2",
            FORMCREATE: "FORMCREATE",
        };

        ReportView.ClassTypes = {
            "TEXTFIELD": "sap.m.Input",
            "DATEFIELD": "sap.m.DatePicker",
            "DATETIMEFIELD": "sap.m.DateTimePicker",
            "TIMEFIELD": "sap.m.TimePicker",
            "COMBOBOX": "sap.m.ComboBox",
            "CHECKBOX": "sap.m.CheckBox",
            // "SEARCHFIELD": "SearchText",
            "SEARCHFIELD": "sap.m.SearchField",
            "LABEL": "sap.m.Text",
            "LINK": "sap.m.Link",
            "ICON": "sap.ui.core.Icon",
            "PANEL": "sap.m.Panel",
            "HTML": "sap.ui.core.HTML",
        };

        ReportView.err = function (msg) {
            sap.m.MessageToast.show(msg, {
                my: sap.ui.core.Popup.Dock.RightBottom,
                at: sap.ui.core.Popup.Dock.RightBottom
            });

            var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
            oMessageToastDOM.css('color', "red");
            throw msg;
        };


        ReportView.err = function (msg, align) {
            sap.m.MessageToast.show(msg, {
                my: Util.nvl(align, sap.ui.core.Popup.Dock.CenterBottom),
                at: Util.nvl(align, sap.ui.core.Popup.Dock.CenterBottom)
            });
            var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
            oMessageToastDOM.css('color', "red");
            throw "ReportView Error: " + msg;
        };

        ReportView.create = function (pg) {
            var q = new ReportView(pg);
            q.parentPage = pg;
            return q;
        };

        ReportView.prototype.constructor = ReportView;

        ReportView.prototype.setParent = function (parent) {
            this.parent = parent;
        };

        ReportView.prototype.parseRep = function (json) {

            var that = this;
            if (json.reports == undefined)
                return;
            this.reports = [];
            var rps = Util.nvl(json.reports, []);
            this.objs = {};
            this.title = Util.getLangCaption(json.title);
            this.title2 = Util.nvl(json.title2, json.title);
            this.show_para_pop = Util.nvl(json.show_para_pop, false);
            for (var r = 0; r < rps.length; r++) {
                var rep = {};
                rep.name = Util.getLangCaption(rps[r].name);
                rep.nameAR = Util.nvl(rps[r].nameAR, rps[r].name);
                rep.descr = Util.getLangCaption(Util.nvl(rps[r].descr, rps[r].name));
                rep.descrAR = Util.nvl(rps[r].descrAR, rps[r].descr);
                rep.code = rps[r].code;
                rep.isCrossTb = Util.nvl(rps[r].isCrossTb, "N");
                rep.rptNo = r;
                rep.showSQLWhereClause = Util.nvl(rps[r].showSQLWhereClause, false);
                rep.mainParaContainerSetting = Util.nvl(rps[r].mainParaContainerSetting, {});
                rep.clearCatchReportImmediate = Util.nvl(rps[r].clearCatchReportImmediate, false);
                rep.saveReportBeforeClear = Util.nvl(rps[r].saveReportBeforeClear, false);
                this.reportVars.saveRepBeforeClear = Util.nvl(rps[r].saveReportBeforeClear, false);
                rep.showFilterCols = Util.nvl(rps[r].showFilterCols, false);
                rep.showCustomPara = Util.nvl(rps[r].showCustomPara, undefined);
                rep.onSubTitHTML = Util.nvl(rps[r].onSubTitHTML, undefined);
                rep.parameters = [];
                var pms = Util.nvl(rps[r].rep.parameters, []);
                for (var i in pms) {
                    var pm = {};
                    that._duplicate_para(rps[r].code + "@" + "parameter." + pms[i].colname);
                    var cnv = "para_canvas";
                    if (Util.nvl(pms[i].dispInPara, false))
                        cnv = "dispInPara";
                    pm.colname = pms[i].colname;
                    pm.objType = ReportView.ObjTypes.FIELD;
                    pm.name = "parameter." + pms[i].colname;
                    pm.data_type = pms[i].data_type;
                    pm.class_name = Util.nvl(pms[i].class_name, "sap.m.Label");
                    pm.require = Util.nvl(pms[i].require, false);
                    pm.class_type = sap.m.Input;
                    pm.obj = undefined;
                    pm.list = Util.nvl(pms[i].list, "");
                    pm.title = Util.nvl(pms[i].title, pms[i].colname);
                    pm.title2 = Util.nvl(pms[i].title2, pms[i].colname);
                    pm.canvas = cnv;
                    pm.display_width = Util.nvl(pms[i].display_width, "");
                    pm.display_align = Util.nvl(pms[i].display_align, "").replace("ALIGN_", "").toLowerCase();
                    pm.display_style = Util.nvl(pms[i].display_style, "");
                    pm.display_format = Util.nvl(pms[i].display_format, "");
                    pm.other_settings = Util.nvl(pms[i].other_settings, {});
                    pm.edit_allowed = Util.nvl(pms[i].edit_allowed, true);
                    pm.default_value = Util.nvl(pms[i].default_value, "");
                    pm.insert_allowed = Util.nvl(pms[i].insert_allowed, true);
                    pm.dispInPara = Util.nvl(pms[i].dispInPara, false);
                    pm.showInPreview = Util.nvl(pms[i].showInPreview, true);
                    pm.rep = rps[r];
                    pm.trueValues = Util.nvl(pms[i].trueValues, undefined);
                    that.objs[rps[r].code + "@" + pm.name] = pm;

                    rep.parameters.push(pm);
                }

                rep.print_templates = [];
                var pls = Util.nvl(rps[r].rep.print_templates, []);
                for (var i in pls) {
                    var pt = {};
                    pt.title = pls[i].title;
                    pt.reportFile = pls[i].reportFile;
                    rep.print_templates.push(pt);
                }

                rep.db = [];
                var qrys = Util.nvl(rps[r].rep.db, []);

                for (var i in qrys) {
                    var qr = {};
                    this._duplicate_para(rps[r].code + "@" + qrys[i].name);
                    if (Util.nvl(qrys[i].name, "") == "")
                        this.err("Name is null !");

                    if (qrys[i].type != "query")
                        this.err("Err !  query # " + qrys[i].name);

                    qr.reportview = this;
                    qr.showType = Util.nvl(qrys[i].showType, FormView.QueryShowType.QUERYVIEW);
                    qr.disp_class = Util.nvl(qrys[i].disp_class, "reportTable");
                    qr.objType = ReportView.ObjTypes.QUERY;
                    qr.applyCol = Util.nvl(qrys[i].applyCol, "");
                    qr.name = Util.nvl(qrys[i].name, "");
                    qr.parent = Util.nvl(qrys[i].parent, "");
                    qr.code = Util.nvl(qrys[i].code, "");
                    qr.title = Util.nvl(qrys[i].title, "");
                    qr.levelCol = Util.nvl(qrys[i].levelCol, "");
                    qr.fixedCols = Util.nvl(qrys[i].fixedCols, 0);
                    qr.type = qrys[i].type;
                    qr.dml = Util.nvl(qrys[i].dml, "");
                    qr.isMaster = Util.nvl(qrys[i].isMaster, false);
                    qr.main_query = qrys[i].main_query;
                    qr.eventCalc = Util.nvl(qrys[i].eventCalc, undefined);
                    qr.eventAfterQV = Util.nvl(qrys[i].eventAfterQV, undefined);
                    qr.dispRecords = Util.nvl(qrys[i].dispRecords, 10);
                    qr.onRowRender = Util.nvl(qrys[i].onRowRender, undefined);
                    qr.dispRecords = UtilGen.dispTblRecsByDevice(qr.dispRecords);
                    qr.fields = {};
                    qr.canvas = Util.nvl(qrys[i].canvas, "default_canvas");
                    qr.canvasType = Util.nvl(qrys[i].canvasType, ReportView.CanvasType.FORMCREATE2);
                    qr.canvasSett = Util.nvl(qrys[i].canvasSett, {
                        width: {
                            "S": 400,
                            "M": 600,
                            "L": 800
                        }
                    });
                    qr.canvasStyle = Util.nvl(qrys[i].canvasStyle, "");
                    qr.summary = {};
                    qr.rep = rps[r];
                    qr.repNo = parseInt(r);
                    qr.qrNo = i;
                    qr.execOnShow = Util.nvl(qrys[i].execOnShow, false);
                    qr.showToolbar = Util.nvl(qrys[i].showToolbar, false);
                    qr.filterCols = Util.nvl(qrys[i].filterCols, []);
                    qr.masterToolbarInMain = Util.nvl(qrys[i].masterToolbarInMain, false);
                    qr.masterDetailRelation = Util.nvl(qrys[i].masterDetailRelation, "");
                    qr.masterQry = Util.nvl(qrys[i].masterQry, "");
                    qr.obj = undefined;
                    qr.beforeLoadQry = Util.nvl(qrys[i].beforeLoadQry, undefined);
                    qr.afterApplyCols = Util.nvl(qrys[i].afterApplyCols, undefined);
                    qr.onCustomValueFields = Util.nvl(qrys[i].onCustomValueFields, undefined);
                    qr.bat7CustomAddQry = Util.nvl(qrys[i].bat7CustomAddQry, undefined);
                    qr.bat7CustomGetData = Util.nvl(qrys[i].bat7CustomGetData, undefined);
                    qr.masterTable = undefined;
                    var met = qrys[i].fields;
                    for (var f in met) {
                        var fd = {};
                        this._duplicate_para(rps[r].code + "@" + qrys[i].name + "." + met[f].colname);
                        fd.objType = ReportView.ObjTypes.FIELD;
                        fd.query_name = qrys[i].name;
                        fd.colname = met[f].colname;
                        fd.name = qrys[i].name + "." + met[f].colname;
                        fd.data_type = met[f].data_type;
                        fd.class_name = Util.nvl(met[f].class_name, "LABEL");
                        // fd.class_type = sap.m.Input;
                        fd.title = Util.nvl(met[f].title, fd.colname);
                        fd.title2 = Util.nvl(met[f].title2, fd.colname);
                        fd.parentTitle = Util.nvl(met[f].parentTitle, "");
                        fd.parentSpan = Util.nvl(met[f].parentSpan, 1);
                        fd.canvas = Util.nvl(met[f].canvas, qr.canvas);
                        fd.canvasType = Util.nvl(met[f].canvasType, qr.canvasType);
                        fd.canvasSett = Util.nvl(met[f].canvasSett, qr.canvasSett);
                        fd.canvasStyle = Util.nvl(met[f].canvasStyle, qr.canvasStyle);
                        fd.list = Util.nvl(met[f].list, "");
                        fd.require = Util.nvl(met[f].require, false);
                        fd.display_width = Util.nvl(met[f].display_width, "");
                        fd.display_align = Util.nvl(met[f].display_align, "").replace("ALIGN_", "").toLowerCase();
                        fd.display_style = Util.nvl(met[f].display_style, "");
                        fd.display_type = Util.nvl(met[f].display_type, "NONE");
                        fd.display_format = Util.nvl(met[f].display_format, undefined);
                        fd.summary = Util.nvl(met[f].summary, "");
                        fd.default_value = Util.nvl(met[f].default_value, "");
                        fd.other_settings = Util.nvl(met[f].other_settings, {});
                        fd.commandLink = Util.nvl(met[f].commandLink, "");
                        fd.valOnZero = met[f].valOnZero;
                        fd.grouped = Util.nvl(met[f].grouped, false);
                        fd.commandLinkClick = Util.nvl(met[f].commandLinkClick, undefined);
                        fd.onPrintField = Util.nvl(met[f].onPrintField, undefined);
                        fd.beforeAddObject = Util.nvl(met[f].beforeAddObject, undefined);
                        fd.afterAddOBject = Util.nvl(met[f].afterAddOBject, undefined);
                        fd.onSetField = Util.nvl(met[f].onSetField, undefined);
                        fd.bat7OnSetFieldAddQry = Util.nvl(met[f].bat7OnSetFieldAddQry, undefined);
                        fd.bat7OnSetFieldGetData = Util.nvl(met[f].bat7OnSetFieldGetData, undefined);
                        fd.onTemplField = Util.nvl(met[f].onTemplField, undefined);
                        fd.rep = rps[r];
                        qr.fields[met[f].colname] = fd;
                        this.objs[rps[r].code + "@" + fd.name] = fd;
                    }
                    rep.db.push(qr);
                    this.objs[rps[r].code + "@" + qrys[i].name] = qr;


                }
                // canvases
                rep.canvases = [{ name: "para_canvas", obj: undefined, objType: FormView.ObjTypes.CANVAS },
                { name: "default_canvas", obj: undefined, objType: FormView.ObjTypes.CANVAS }];

                // this.objs["para_canvas"] = rep.canvases[0];
                // this.objs["default_canvas"] = rep.canvases[1];
                var cnvs = [];
                rep.dispCanvases = {};
                // this.dispCanvases["para_canvas"] = [];
                // this.dispCanvases["default_canvas"] = [];

                for (var ci in this.objs)
                    if (this.objs[ci].hasOwnProperty("rep") &&
                        this.objs[ci].rep.code == rep.code &&
                        this.objs[ci].canvas != undefined && cnvs.indexOf(this.objs[ci].canvas) <= -1) {
                        var cnv = {
                            name: this.objs[ci].canvas,
                            canvasType: this.objs[ci].canvasType,
                            objType: FormView.ObjTypes.CANVAS,
                            cavasSett: this.objs[ci].canvasSett,
                            obj: undefined,

                        };
                        this.objs[this.objs[ci].canvas] = cnv;
                        rep.canvases.push(cnv);
                        cnvs.push(this.objs[ci].canvas);
                        rep.dispCanvases[this.objs[ci].canvas] = [];
                    }

                // var cnvs = Util.nvl(rps[r].rep.canvases, []);
                // for (var i in cnvs) {
                //     var cnv = {};
                //     this._duplicate_para(cnvs[i].name);
                //     cnv.name = cnvs[i].name;
                //     cnv.canvasType = this.objs[cnvs[i].name].canvasType;
                //     cnv.obj = Util.nvl(cnvs[i].obj, undefined);
                //     cnv.objType = FormView.ObjTypes.CANVAS;
                //     rep.canvases.push(cnv);
                //     this.objs[cnvs[i].name] = cnv;
                // }
                this.reports.push(rep);
            } // r for loop

            this.initView();
        }

        ReportView.prototype._duplicate_para = function (name) {
            if (Object.keys(this.objs).indexOf(name) > -1)
                this.err(name + " duplicate found !");

        };
        ReportView.prototype.err = function (msg) {
            sap.m.MessageToast.show("ReportView Error " + msg, {
                my: sap.ui.core.Popup.Dock.RightBottom,
                at: sap.ui.core.Popup.Dock.RightBottom
            });
            var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
            oMessageToastDOM.css('color', "red");
            throw "ReportView Error: " + msg;
        };


        ReportView.prototype.initHelperFunctions = function () {
            var thatRV1 = this;
            this.helperFunctions = {
                init: function (thatRV) {
                    this.thatRV = thatRV;
                    this.masterDetails.init(thatRV);
                    this.view.init(thatRV);
                    this.load.init(thatRV);
                    this.misc.init(thatRV);
                    this.batch.init(thatRV);
                    this.reports.init(thatRV);
                    this.mainPop.init(thatRV);
                },
                destoryRV: function () {
                    var thatRV = this.thatRV;
                    if (thatRV.rcv_data_timer != undefined)
                        clearInterval(thatRV.rcv_data_timer);
                },
                reports: {
                    init: function (thatRV) {
                        this.thatRV = thatRV;
                    },
                    saveReport: function (pRptNo) {
                        var thatRV = this.thatRV;
                        var rptNo = Util.nvl(pRptNo, UtilGen.getControlValue(thatRV.lstRep));
                        var rep = thatRV.reports[rptNo];
                        Util.doAjaxJson("bat7SaveToTemp", {
                            sql: "",
                            ret: "",
                            data: "",
                            repCode: rep.code,
                            repNo: rptNo,
                            command: "",
                            scheduledAt: "",
                            p1: "",
                            p2: "",

                        }, false).done(function (data) {
                            if (data.ret == "SUCCESS") {
                                // sap.m.MessageToast.show("saved report on server !");
                            }
                        });
                    },
                    clearReport: function (pRptno, fnOnSuccess) {
                        var thatRV = this.thatRV;
                        var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(thatRV.lstRep));
                        var rep = thatRV.reports[rptNo];
                        Util.doAjaxJson("bat7ClrRep", {
                            sql: "",
                            ret: "",
                            data: "",
                            repCode: rep.code,
                            repNo: rptNo,
                            command: "",
                            scheduledAt: "",
                            p1: (thatRV.reportVars.saveRepBeforeClear ? "true" : "false"),
                            p2: "",

                        }, false).done(function (data) {
                            if (data.ret == "SUCCESS") {
                                if (fnOnSuccess != undefined)
                                    fnOnSuccess(data);

                            }
                        });


                    }

                },
                batch: {
                    init: function (thatRV) {
                        this.thatRV = thatRV;
                    },
                    startRcvDataTimer: function (rep, rptNo) {
                        var thatRV = this.thatRV;
                        if (thatRV.rcv_data_timer != undefined)
                            clearInterval(thatRV.rcv_data_timer);

                        if (!Util.nvl(thatRV.ERROR_ON_RCV_DATA, false))
                            thatRV.rcv_data_timer = setInterval(function () {
                                thatRV._rcvData(rep.code, rptNo);
                                if (thatRV.ERROR_ON_RCV_DATA == true)
                                    clearInterval(thatRV.rcv_data_timer);
                            }, 1000);

                    },
                },
                misc: {
                    init: function (thatRV) {
                        this.thatRV = thatRV;
                    },
                    getObjectByObj: function (obj) {
                        var thatRV = this.thatRV;
                        for (var i in thatRV.objs) {
                            if (thatRV.objs[i].obj == obj) return thatRV.objs[i];
                        }
                    },
                    showDisplayRecs: function (pRptno) {
                        var thatRV = this.thatRV;
                        var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(thatRV.lstRep));
                        var rep = thatRV.reports[rptNo];
                        var msg = ":qry fetched # :filtered records \n";
                        var msg2 = "";
                        for (var i in Util.nvl(rep.db, []))
                            if (rep.db[i].showType == FormView.QueryShowType.QUERYVIEW)
                                msg2 += msg.replaceAll(":qry", rep.db[i].name).replaceAll(":filtered", rep.db[i].obj.mLctb.rows.length);
                        if (Util.nvl(msg2, "").trim() != "")
                            sap.m.MessageToast.show(msg2, {
                                my: sap.ui.core.Popup.Dock.RightBottom,
                                at: sap.ui.core.Popup.Dock.RightBottom
                            });

                        var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
                        oMessageToastDOM.css('color', "red");

                    },
                    filterQueries: function (pRptno) {
                        var thatForm = this.thatRV;
                        thatForm.filterData = {};
                        var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(thatForm.lstRep));
                        var rep = thatForm.reports[rptNo];
                        var str = "";
                        for (var i in Util.nvl(rep.db, [])) {
                            var qryObj = rep.db[i];
                            var qvtb = sap.ui.getCore().byId("qvFilter" + i + thatForm.timeInLong + "table");
                            if (qvtb == undefined)
                                continue;
                            var qvf = qvtb.qv; // get query view from table control

                            qvf.updateDataToTable();
                            for (var j = 0; j < qvf.mLctb.rows.length; j++) {
                                var coln = qvf.mLctb.getFieldValue(j, "columns");
                                var s = qvf.mLctb.getFieldValue(j, "filter");
                                if (s == "")
                                    continue;
                                var op = "%%";
                                op = (s.startsWith("=") ? "=" :
                                    s.startsWith("!=") ? "!=" :
                                        s.startsWith("<>") ? "<>" :
                                            s.startsWith(">=") ? ">=" :
                                                s.startsWith("<=") ? "<=" :
                                                    s.startsWith(">") ? ">" :
                                                        s.startsWith("<") ? "<" : "%%");
                                if (s.startsWith(op))
                                    s = s.substring(op.length);
                                str += (str.length > 0 ? " && " : "") + qvf.mLctb.getFieldValue(j, "columns") + op + s;
                            }
                            // qryObj.obj.mViewSettings["filterStr"] = str;
                            thatForm.filterData[i] = str;
                            if (qryObj.showType == FormView.QueryShowType.QUERYVIEW) {
                                qryObj.obj.mViewSettings["filterStr"] = str;
                                qryObj.obj.updateDataToControl();
                            }
                        }

                    },
                    showFilterColsCmd: function (vbPara, rep) {
                        var thatRV = this.thatRV;
                        thatRV.tbf = [];

                        for (var q in rep.db) {
                            if (rep.db[q].showType == FormView.QueryShowType.QUERYVIEW) {
                                var tbx = new sap.m.IconTabFilter({
                                    text: rep.db[q].name,
                                    key: (parseInt(q)),
                                    content: []
                                });
                                thatRV.tbf.push(tbx);
                            }
                        }
                        thatRV.tbs = new sap.m.IconTabBar({
                            items: thatRV.tbf
                        }).addStyleClass("sapUiSizeCompact");

                        thatRV.dispFilter(thatRV.tbf);

                        // this.vbPara.addItem(this.tbs);


                        // var bt = new sap.m.Button({
                        //     text: "Filter",
                        //     press: function () {
                        //         var dlg = new sap.m.Dialog({
                        //             contentHeight: "60%",
                        //             contentWidth: "50%",
                        //             content: [thatRV.tbs],
                        //             buttons: [
                        //                 new sap.m.Button({
                        //                     text: "Cancel", press: function () {
                        //                         dlg.close();
                        //                     }
                        //                 }),
                        //                 new sap.m.Button({
                        //                     text: "Filter", press: function () {
                        //                         thatRV.helperFunctions.misc.filterQueries();
                        //                         thatRV.helperFunctions.misc.showDisplayRecs(rep.rptNo);
                        //                     }
                        //                 })
                        //             ]
                        //         });
                        //         dlg.open();
                        //     }
                        // });
                        // vbPara.addItem(bt);

                    },
                    enableParas: function (enable) {
                        return;
                        var thatRV = this.thatRV;
                        var rptNo = Util.nvl(undefined, UtilGen.getControlValue(thatRV.lstRep));

                        var pars = thatRV.reports[rptNo].parameters;
                        for (var i in pars) {
                            pars[i].obj.setEnabled(enable);
                            if (pars[i].obj.paraObj != undefined)
                                pars[i].obj.paraObj.setEnabled(enable);
                        }
                        if (thatRV.txtSQLWhere != undefined)
                            thatRV.txtSQLWhere.setEnabled(enable);

                    },
                    fillQuickFilterData: function (qryName, pRptno) {
                        var thatRV = this.thatRV
                        var qr = undefined;
                        var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(thatRV.lstRep));
                        if (typeof qryName == "string")
                            qr = thatRV.objs[qryName];
                        else qr = qryName;

                        if (thatRV.lstRepGroups != undefined) {
                            var cdt = [];
                            var ld = qr.obj.mLctb;
                            var lastVal = "";
                            cdt.push({ CODE: "", NAME: "ALL" });
                            for (var l = 0; l < ld.rows.length; l++) {
                                var cd = { CODE: "", NAME: "" };
                                var cval = ld.getFieldValue(l, ld.cols[0].mColName);
                                var nmval = cval;
                                if (ld.cols.length > 1 && ld.cols[1].mGrouped)
                                    nmval = cval + "-" + Util.nvl(ld.getFieldValue(l, ld.cols[1].mColName), "");
                                if (lastVal != cval) {
                                    cd.CODE = cval;
                                    cd.NAME = nmval;
                                    lastVal = cval;
                                    cdt.push(cd);
                                }
                            }
                            Util.fillCombo(thatRV.lstRepGroups, cdt);
                            thatRV.lstRepGroups.setSelectedItem(thatRV.lstRepGroups.getItems()[0]);
                        }

                    },
                    doQuickFilterData: function (qryName, pRptno) {
                        var thatRV = this.thatRV;
                        var qr = undefined;
                        var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(thatRV.lstRep));
                        if (typeof qryName == "string")
                            qr = thatRV.objs[qryName];
                        else qr = qryName;
                        var flt = "";
                        if (thatRV.lstRepGroups != undefined) {
                            var lval = UtilGen.getControlValue(thatRV.lstRepGroups);
                            if (lval != 'ALL' && lval != "")
                                flt = qr.obj.mLctb.cols[0].mColName + "=" + lval;
                        }
                        // this.filterData = {};
                        var newFlt = "";

                        if (Util.nvl(thatRV.filterData[rptNo], "") != "") {
                            var spl = thatRV.filterData[rptNo].split("&&");

                            for (var i in spl)
                                if (spl[i].trim() != "" && !spl[i].trim().startsWith(qr.obj.mLctb.cols[0].mColName))
                                    newFlt = newFlt.trim() + (newFlt.trim() != "" ? " && " : "") + spl[i].trim();
                        }

                        thatRV.filterData[rptNo] = newFlt.trim() + (newFlt.trim() != "" ? " && " : "") + flt;

                        qr.obj.mViewSettings["filterStr"] = thatRV.filterData[thatRV.reports[rptNo].db.indexOf(qr)];
                        qr.obj.updateDataToControl();
                        // this.loadQueryView(qr);
                    },


                    saveParas: function (qryName, pRptno) {
                        var thatRV = this.thatRV;
                        var qr = undefined;
                        var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(thatRV.lstRep));
                        if (typeof qryName == "string")
                            qr = thatRV.objs[qryName];
                        else qr = qryName;
                        var pars = Util.nvl(thatRV.reports[rptNo].parameters, []);
                        for (var p in pars)
                            thatRV.savedParas[pars[p].colname] = UtilGen.getControlValue(pars[p].obj);

                    },
                    setReport: function (rptno) {
                        var thatRV = this.thatRV;
                        UtilGen.setControlValue(thatRV.lstRep, rptno, rptno, true);
                        thatRV.btRep.setText(thatRV.lstRep.getValue());
                    }

                },
                mainPop: {
                    init: function (thatRV) {
                        this.thatRV = thatRV;
                    },
                    enableParas: function (enable) {
                        return;
                        var thatRV = this.thatRV;
                        var rptNo = Util.nvl(undefined, UtilGen.getControlValue(this.lstRep));

                        var pars = thatRV.reports[rptNo].parameters;
                        for (var i in pars) {
                            pars[i].obj.setEnabled(enable);
                            if (pars[i].obj.mainObj != undefined)
                                pars[i].obj.mainObj.setEnabled(enable);
                        }
                        if (this.txtSQLWhere != undefined)
                            this.txtSQLWhere.setEnabled(enable);

                    },
                    createView: function (pg, pRptNo) {
                        if (pg == undefined)
                            Util.err("Page not defined");
                        this.pg = pg;
                        var that = this;
                        var thatRV = this.thatRV;
                        var rps = Util.nvl(thatRV.reports, []);
                        UtilGen.clearPage(this.pg);
                        this.vbPara = new sap.m.VBox();
                        var str = "";
                        var ff = [];
                        this.lstRepTbl = new QueryView("lstRepTbl" + thatRV.timeInLong);
                        this.lstRepTbl.getControl().addStyleClass("sapUiSizeCondensed lstRepTable");
                        this.lstRepTbl.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);
                        this.lstRepTbl.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
                        this.lstRepTbl.getControl().setAlternateRowColors(false);
                        this.lstRepTbl.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
                        this.lstRepTbl.getControl().setFixedBottomRowCount(0);
                        this.lstRepTbl.getControl().setVisibleRowCount(3);


                        var md = [
                            {
                                colname: "CODE",
                                width: 200
                            },
                            {
                                colname: "TITLE",
                                width: 200
                            }


                        ];
                        var data = [];
                        for (var i = 0; i < rps.length; i++) {
                            str += (str.length > 0 ? "," : "") + (i + "/" + Util.getLangDescrAR(rps[i].name, rps[i].nameAR));
                            var dt = {
                                "CODE": UtilGen.DBView.sLangu == "AR" ? rps[i].nameAR : rps[i].name,
                                "TITLE": UtilGen.DBView.sLangu == "AR" ? rps[i].descrAR : Util.nvl(rps[i].descr, rps[i].name),
                            };
                            data.push(dt);

                        }
                        str = "@" + str;
                        md = { metadata: md, data: data };
                        this.lstRepTbl.setJsonStrMetaData(JSON.stringify(md));
                        this.lstRepTbl.mLctb.parse(JSON.stringify(md), true);
                        this.lstRepTbl.mLctb.cols[
                            this.lstRepTbl.mLctb.getColPos("CODE")]
                            .mUIHelper.display_width = "175";
                        this.lstRepTbl.mLctb.cols[
                            this.lstRepTbl.mLctb.getColPos("TITLE")]
                            .mUIHelper.display_width = "400";
                        this.lstRepTbl.loadData();
                        this.lstRepTbl.getControl().attachRowSelectionChange(undefined, function () {
                            var sl = that.lstRepTbl.getControl().getSelectedIndices();
                            var odata = that.lstRepTbl.getControl().getContextByIndex(sl[0]);
                            if (odata == undefined) return;
                            var data = (odata.getProperty(odata.getPath()));
                            that.lstRep.setSelectedItem(that.lstRep.getItems()[sl[0]]);
                            that.lstRep.fireSelectionChange();


                        });

                        ff.push(this.lstRepTbl);


                        this.lstRep = UtilGen.addControl([], "Sub Reps", sap.m.ComboBox, "subrepMain",
                            {
                                visible: false,

                                items: {
                                    path: "/",
                                    template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                                    templateShareable: true
                                },
                                selectionChange: function (ev) {
                                    var cd = UtilGen.getControlValue(this);
                                    UtilGen.setControlValue(thatRV.lstRep, cd, cd, true);
                                    var nm = this.getValue();
                                    thatRV.filterData = {};
                                    thatRV.btRep.setText(nm);
                                    thatRV.createView(true);
                                    thatRV.showDispInMaster(cd);
                                    setTimeout(function () {
                                        thatRV.tbMain.$().css("background-color", "lightblue");
                                    }, 100);

                                    if (thatRV.rcv_data_timer != undefined)
                                        clearInterval(thatRV.rcv_data_timer);

                                    thatRV.helperFunctions.batch.startRcvDataTimer(thatRV.reports[cd], cd);
                                    that.showDispInMaster();
                                }
                            }, "string", undefined, thatRV.view, undefined, str);

                        if (thatRV.oController != undefined && thatRV.oController.repno != undefined) {
                            thatRV.lstRep.setSelectedItem(thatRV.lstRep.getItems()[thatRV.oController.repno]);
                            this.lstRep.setSelectedItem(this.lstRep.getItems()[thatRV.oController.repno]);
                        }
                        else {
                            this.lstRep.setSelectedItem(this.lstRep.getItems()[0]);
                            thatRV.lstRep.setSelectedItem(this.lstRep.getItems()[0]);
                        }
                        this.lstRepTbl.getControl().setSelectedIndex(parseInt(thatRV.lstRep.getSelectedKey()));
                        var tb = new sap.m.Toolbar({
                            content: [
                                new sap.m.Title({ text: Util.getLangDescrAR(thatRV.title, thatRV.title2) }),
                                new sap.m.ToolbarSpacer(),
                                new sap.m.Button({
                                    icon: "sap-icon://decline",
                                    text: Util.getLangText("cmdClose"),
                                    visible: true,
                                    press: function () {
                                        thatRV.frag.jp.backFunction();
                                    }
                                })
                            ]
                        }).addStyleClass("reportMainPageToolbar");
                        this.pg.addContent(tb);
                        this.pg.addContent(new sap.m.Title({ text: Util.getLangText("reportCaption1") + " " + Util.getLangDescrAR(thatRV.title, thatRV.title2) }).addStyleClass("sapUiMediumMarginTop sapUiLargeMarginBegin"));
                        this.pg.addContent(this.lstRep);
                        this.pg.addContent(this.lstRepTbl.getControl());
                        this.pg.addContent(new sap.m.Title({ text: "Parameters:" }).addStyleClass("sapUiLargeMarginBegin"));
                        this.pg.addContent(this.vbPara);
                        var rptNo = Util.nvl(pRptNo, UtilGen.getControlValue(thatRV.lstRep));
                        var rep = thatRV.reports[rptNo];

                        // thatRV.helperFunctions.view.createParaFields(rptNo, "");
                        this.showDispInMaster();

                    },
                    showDispInMaster: function (pRptNo) {
                        var thatForm = this.thatRV;
                        var that = this;
                        var scrollObjs = [];
                        this.defaultCommands = {};
                        this.firstObj = undefined;
                        var rptNo = Util.nvl(pRptNo, UtilGen.getControlValue(this.lstRep));
                        var rep = thatForm.reports[rptNo];
                        this.vbPara.removeAllItems();
                        var flds = rep.parameters;
                        var fe = [];
                        var paras = {};
                        for (var f in flds)
                            if (Util.nvl(flds[f].canvas, "") == "dispInPara") {
                                rep.dispCanvases[flds[f].canvas]
                                    = Util.nvl(rep.dispCanvases[flds[f].canvas],
                                        []);
                                var set = {};
                                if (flds[f].display_width != "")
                                    set["layoutData"] = new sap.ui.layout.GridData({ span: flds[f].display_width })
                                // if (flds[f].dispInPara)
                                //     set["visible"] = false;
                                if (Object.keys(flds[f].other_settings).length > 0) {
                                    set = { ...set, ...flds[f].other_settings };
                                }
                                var prev;
                                if (flds[f].obj.mainObj != undefined) {
                                    prev = UtilGen.getControlValue(flds[f].obj);
                                    flds[f].obj.mainObj.destroy();
                                }

                                var obj = UtilGen.addControl(fe,
                                    flds[f].title, eval(flds[f].class_name),
                                    "rep" + rptNo + "_" + flds[f].name.replace(".", '') + "main" + thatForm.timeInLong,
                                    set, flds[f].data_type,
                                    flds[f].display_format, thatForm.view, undefined, flds[f].list);
                                if (set.hasOwnProperty("trueValues"))
                                    obj.trueValues = set["trueValues"];
                                rep.dispCanvases[flds[f].canvas].push(flds[f].obj);
                                UtilGen.setControlValue(obj, prev, prev, true);
                                // var obj = flds[f].obj;
                                // fe.push(flds[f].title);
                                // fe.push(flds[f].obj);
                                obj.addStyleClass(flds[f].display_style);
                                flds[f].obj.mainObj = obj;
                                flds[f].obj.mainObj.parentObj = thatForm.objs[rep.code + "@" + flds[f].name].obj;  //flds[f].obj;
                                // flds[f].obj.mainObj.paraObj = flds[f].obj.paraObj;
                                // if (set.hasOwnProperty("trueValues")) {
                                //     obj.trueValues = set["trueValues"];
                                //     flds[f].obj.trueValues = set["trueValues"];
                                //     flds[f].obj.mainObj.paraObj.trueValues = set["trueValues"];
                                //     flds[f].obj.mainObj.trueValues = set["trueValues"];
                                // }
                                paras[flds[f].colname] = obj;
                                var vl = thatForm.getFieldValue(flds[f].name);
                                if (flds[f].data_type == FormView.DataType.Number)
                                    vl = parseFloat(vl);
                                UtilGen.setControlValue(obj, vl, vl, true);

                                if (this.firstObj == undefined && obj instanceof sap.m.InputBase)
                                    this.firstObj = obj;

                                if (obj instanceof sap.m.Text) {
                                    obj.setValue = function (vl) {
                                        this.setText(vl);
                                    }
                                    obj.getValue = function (vl) {
                                        return this.getText();
                                    }
                                }


                            }


                        // var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
                        var frm = UtilGen.formCreate2("", true, fe, undefined, sap.m.ScrollContainer, rep.mainParaContainerSetting, undefined);
                        frm.addStyleClass("sapUiSizeCondensed");
                        // frm.setToolbar(undefined);
                        // frm.destroyToolbar();

                        var ms = thatForm.reportMenus;
                        var rs = [];
                        for (var i in ms) {
                            rs.push(new sap.m.Button({
                                icon: "sap-icon://pdf-attachment",
                                text: ms[i].title,
                                customData: { key: ms[i].reportFile },
                                press: function () {
                                    var cd = this.getCustomData()[0].getKey();
                                    var pms = "";
                                    var sett = sap.ui.getCore().getModel("settings").getData();
                                    thatForm.helperFunctions.reports.saveReport();
                                    /*
                                    var dt = Util.execSQL("select *from temporary where idno=8.1 and usernm=" +
                                        Util.quoted(sett["LOGON_USER"]) + " and  field1='" + rep.code + "-" + rep.rptNo + "-999" + "'");
                                    if (dt != undefined && dt.ret == "SUCCESS") {
                                        var dtx = JSON.parse("{" + dt.data + "}").data;
                                        for (var d in dtx[0]) {
                                            if (d == "IDNO" || d == "USERNM" || d == "FIELD1" || d == "FIELD2")
                                                continue;
                                            var ss = dtx[0][d].split("==");
                                            pms += (pms.length > 0 ? "," : "") + ss[1] + "=" + ss[0];
                                        }
            
            
                                    }
                                    */
                                    thatForm.printReport(cd, undefined);
                                }
                            }));
                        }

                        this.cmdShowQry = new sap.m.Button({
                            text: Util.getLangText("showQuery"),
                            icon: "sap-icon://details",
                            enabled: true,
                            press: function () {
                                thatForm.navApp.to(thatForm.frag.joApp);
                            }
                        });
                        this.cmdExe = new sap.m.Button({
                            text: Util.getLangText("executeTxt"),
                            tooltip: Util.getLangText("executeTooltip"),
                            icon: "sap-icon://begin",
                            // enabled: false,
                            press: function () {
                                // for (var fld in paras) {
                                //     var vl = UtilGen.getControlValue(paras[fld]);
                                //     UtilGen.setControlValue(paras[fld].parentObj, vl, vl, true);
                                //     UtilGen.setControlValue(paras[fld].parentObj.paraObj, vl, vl, true);
                                //     // if (paras[fld] instanceof sap.m.CheckBox)
                                //     //     paras[fld].mainObj.paraObj.setSelected(paras[fld].getSelected());
                                // }
                                for (var fld in paras) {

                                    var vl = UtilGen.getControlValue(paras[fld]);
                                    // var pid = thatForm.view.byId("rep" + rptNo + "_parameter" + fld + thatForm.timeInLong);
                                    var parent = thatForm.view.byId("rep" + rptNo + "_parameter" + fld + thatForm.timeInLong);
                                    var para = thatForm.view.byId("rep" + rptNo + "_parameter" + fld + "Para" + thatForm.timeInLong);
                                    UtilGen.setControlValue(parent, vl, vl, true);
                                    UtilGen.setControlValue(para, vl, vl, true);

                                    if (Util.nvl(vl, "") == "" && thatForm.helperFunctions.misc.getObjectByObj(parent).require) {
                                        UtilGen.errorObj(paras[fld]);
                                        ReportView.err(thatForm.helperFunctions.misc.getObjectByObj(parent).colname + " field rquired a value !");
                                    }

                                    // var fx=thatForm.view.byId("rep" + rptNo + "_" + flds[f].name.replace(".", '')  + this.timeInLong)
                                    // thatForm.setFieldValue(paras[fld].parentObj, vl, vl, true);
                                }
                                thatForm.executeSetup();
                                thatForm.dispFilter(thatForm.tbf);
                                setTimeout(function () {
                                    // thatForm.app.hideMaster();
                                    thatForm.navApp.to(thatForm.frag.joApp);
                                }, 10);

                                // thatForm.cmdExe.firePress();
                                // }
                                // this.setEnabled(false);
                                // thatForm.navApp.to(thatForm.frag.joApp);
                            }
                        });
                        this.cmdClr = new sap.m.Button({
                            text: Util.getLangText("resetTxt"),
                            icon: "sap-icon://reset",
                            enabled: false,
                            press: function () {

                                Util.doAjaxJson("bat7ClrRep", {
                                    sql: "",
                                    ret: "",
                                    data: "",
                                    repCode: rep.code,
                                    repNo: rptNo,
                                    command: "",
                                    scheduledAt: "",
                                    p1: "",
                                    p2: "",

                                }, false).done(function (data) {
                                    if (data.ret == "SUCCESS") {

                                        thatForm.helperFunctions.batch.startRcvDataTimer(rep, rptNo);


                                    }
                                });

                            }
                        });

                        Util.navEnter(fe, function (lastObj) {
                            thatForm.cmdExe.focus();
                        });

                        // if (this.vbPara == undefined)
                        //     this.vbPara = new sap.m.VBox();
                        this.vbPara.removeAllItems();
                        if (this.vbSQLWhere != undefined)
                            this.vbSQLWhere.removeAllItems();
                        this.txtMsg = new sap.m.Text({}).addStyleClass("redMiniText");
                        this.vbPara.addItem(this.txtMsg);
                        this.vbPara.addItem(frm);

                        this.pg.setFloatingFooter(false);

                        var ttb = new sap.m.Toolbar({
                            content: [...rs,
                            new sap.m.ToolbarSpacer(),
                            that.cmdShowQry,
                            that.cmdExe,
                            that.cmdClr
                            ]
                        });
                        // this.pg.setSubHeader(ttb);
                        this.vbPara.addItem(ttb);
                        this.vbPara.addItem(new sap.m.VBox({ height: "100px" }));

                    }
                    ,
                },
                view:
                {
                    init: function (thatRV) {
                        this.thatRV = thatRV;
                    }
                    ,
                    showRepHeaderHTML: function () {
                        var thatRV = this.thatRV;
                        var sett = sap.ui.getCore().getModel("settings").getData();
                        var rptNo = Util.nvl(undefined, UtilGen.getControlValue(thatRV.lstRep));
                        var rep = thatRV.reports[rptNo];
                        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

                        if (thatRV.txtMsg2 != undefined) {
                            thatRV.txtMsg2.destroy();
                            thatRV.txtMsg2 = new sap.m.Text({}).addStyleClass("redMiniText");
                        } else
                            thatRV.txtMsg2 = new sap.m.Text({}).addStyleClass("redMiniText");

                        thatRV.vbHtml.removeAllItems();
                        var ht = "<div class='company'>" + sett["COMPANY_NAME"] + "</div> ";
                        var h2 = "";
                        var flds = rep.parameters;
                        var pvl = "";
                        if (rep.onSubTitHTML != undefined)
                            h2 += rep.onSubTitHTML(rep);
                        for (var f in flds)
                            if (Util.nvl(flds[f].showInPreview, true)) {
                                pvl = (flds[f].obj instanceof sap.m.CheckBox) ?
                                    (flds[f].obj.getSelected() ?
                                        flds[f].obj.trueValues[0] : flds[f].obj.trueValues[1])
                                    : flds[f].obj.getValue();
                                if (flds[f].data_type == FormView.DataType.Date)
                                    pvl = sf.format(UtilGen.getControlValue(flds[f].obj));
                                if (UtilGen.nvl(pvl, "") != "")
                                    h2 += "<td class='paraLabel'>" + ReportView.getTitleFromField(flds[f]) + "</td>:<td class='paraText'>" + pvl + ", </td>";
                            }
                        ht += "<div class='paras'>" + h2 + "</div>";
                        setTimeout(function () {
                            thatRV.tbMain.$().css("background-color", "lightblue");
                        }, 100);

                        thatRV.vbHtml.addItem(new sap.ui.core.HTML({ content: ht }));
                        thatRV.vbHtml.addItem(thatRV.txtMsg2);

                    }
                    ,
                    setScrollObjs: function (scrollObjs, scrollObjsH) {
                        this.scrollObjs = scrollObjs;
                        this.scrollObjsH = scrollObjsH;
                    }
                    ,
                    createHeaderReport: function () {
                        var thatRV = this.thatRV;
                        this.thatRV.vbHtml = new sap.m.VBox({ width: "100%" });
                        this.scrollObjsH.push(this.thatRV.vbHtml);
                        var bt2 = new sap.m.Button({
                            icon: "sap-icon://print",
                            text: Util.getLangText("exportPrint"),
                            press: function () {
                                thatRV.mnuE.openBy(this);
                            }
                        });

                        thatRV.tbMain = new sap.m.Bar({
                            contentLeft: [new sap.m.Button({
                                icon: "sap-icon://menu2",
                                press: function () {
                                    setTimeout(function () {
                                        thatRV.frag.joApp.showMaster();
                                    }, 10);

                                }
                            })
                            ],
                            contentMiddle: [
                                new sap.m.Title({ text: Util.nvl(thatRV.title2, thatRV.title) })
                            ],
                            contentRight: [
                                thatRV.bt_Reports,
                                bt2,
                                thatRV.bt_paraform,
                                thatRV.bt_close

                            ]
                        }).addStyleClass("");
                        thatRV.pg.setSubHeader(thatRV.tbMain);
                    }
                    ,
                    createParaFields: function (pRptNo, parStr) {
                        var thatForm = this.thatRV;
                        var rptNo = Util.nvl(pRptNo, UtilGen.getControlValue(thatForm.lstRep));
                        var rep = thatForm.reports[rptNo];

                        var flds = rep.parameters;
                        if (thatForm.lstRepGroups != undefined)
                            thatForm.lstRepGroups.destroy();
                        thatForm.lstRepGroups = undefined;
                        var fe = [];
                        for (var f in flds)
                            if (Util.nvl(flds[f].canvas, "") != "") {
                                rep.dispCanvases[flds[f].canvas]
                                    = Util.nvl(rep.dispCanvases[flds[f].canvas],
                                        []);
                                var set = {};
                                if (flds[f].display_width != "")
                                    set["layoutData"] = new sap.ui.layout.GridData({ span: flds[f].display_width })
                                // if (flds[f].dispInPara)
                                //     set["visible"] = false;
                                if (Object.keys(flds[f].other_settings).length > 0) {
                                    set = { ...set, ...flds[f].other_settings };
                                }
                                // if (flds[f].obj == undefined) {
                                flds[f].dataSetDone = undefined;
                                var obj = UtilGen.addControl(rep.dispCanvases[flds[f].canvas],
                                    flds[f].title, eval(flds[f].class_name),
                                    "rep" + rptNo + "_" + flds[f].name.replace(".", '') + parStr + thatForm.timeInLong,
                                    set, flds[f].data_type,
                                    flds[f].display_format, thatForm.view, undefined, flds[f].list);
                                if (set.hasOwnProperty("trueValues"))
                                    obj.trueValues = set["trueValues"];

                                rep.dispCanvases[flds[f].canvas].push(obj);
                                fe.push(obj);
                                if (parStr == "Para") {
                                    flds[f].obj.paraObj = obj;
                                    flds[f].obj.paraObj.parentObj = flds[f].obj;
                                }
                                else
                                    flds[f].obj = obj;

                                obj.addStyleClass(flds[f].display_style);

                                if (thatForm.savedParas[flds[f].colname] != undefined) {
                                    try {
                                        thatForm.setFieldValue(flds[f], thatForm.savedParas[flds[f].colname], thatForm.savedParas[flds[f].colname], true);
                                    } catch (e) {
                                    }
                                }

                                else if (Util.nvl(flds[f].default_value, "") != "") {
                                    var vl = Util.nvl(UtilGen.parseDefaultValue(flds[f].default_value), '');
                                    thatForm.setFieldValue(flds[f], vl, vl, true);
                                }

                                if (thatForm.firstObj == undefined && obj instanceof sap.m.InputBase)
                                    thatForm.firstObj = obj;
                                if (obj instanceof sap.m.Text) {
                                    obj.setValue = function (vl) {
                                        this.setText(vl);
                                    }
                                    obj.getValue = function (vl) {
                                        this.getText();
                                    }

                                }
                            }

                    }
                    ,
                    createReport: function (rep) {
                        var thatRV = this.thatRV;
                        var rptNo = thatRV.reports.indexOf(rep);
                        this.scrollObjs = [];
                        var sett = sap.ui.getCore().getModel("settings").getData();
                        // //create default canvases and para canvases
                        // if (thatRV.dispCanvases["default_canvas"] == undefined) {
                        //     // thatRV.objs["default_canvas"].obj = new sap.m.VBox({width: "100%"});
                        //     thatRV.dispCanvases["default_canvas"]
                        //         = Util.nvl(thatRV.dispCanvases["default_canvas"],
                        //         []);
                        // }
                        for (var q in rep.db) {

                            if (rep.db[q].showType == FormView.QueryShowType.FORM) {
                                var flds = rep.db[q].fields;
                                if (rep.db[q].isMaster) {
                                    var hbscrol = thatRV.helperFunctions.masterDetails.getMasterButtonsinHB(rep.db[q]);
                                    if (rep.db[q].masterToolbarInMain)
                                        thatRV.tbMain.addContentLeft(hbscrol);
                                    else
                                        rep.dispCanvases[rep.db[q].canvas].push(hbscrol);

                                }
                                if (rep.db[q].masterQry != "") {
                                    var mst = thatRV.objs[rep.db[q].masterQry];
                                    var mstName = rep.code + "@" + qr.name;
                                    if (thatRV.detailObjs == undefined) thatRV.detailObjs = Util.nvl(thatRV.detailObjs, {});
                                    thatRV.detailObjs[mstName] = Util.nvl(thatRV.detailObjs[rep.db[q].masterQry], [thatRV.objs[rep.db[q].masterQry]]);
                                }

                                for (var f in flds) {
                                    if (Util.nvl(flds[f].canvas, "") != "") {
                                        rep.dispCanvases[flds[f].canvas]
                                            = Util.nvl(rep.dispCanvases[flds[f].canvas],
                                                []);
                                        var set = {};
                                        if (flds[f].display_width != "")
                                            set["layoutData"] = new sap.ui.layout.GridData({ span: flds[f].display_width })
                                        if (Object.keys(flds[f].other_settings).length > 0) {
                                            set = { ...set, ...flds[f].other_settings };
                                        }

                                        // trigger before adding object
                                        if (flds[f].hasOwnProperty("beforeAddObject") && flds[f].beforeAddObject != undefined)
                                            flds[f].beforeAddObject();
                                        flds[f].dataSetDone = undefined;
                                        flds[f].obj = UtilGen.addControl(rep.dispCanvases[flds[f].canvas],
                                            flds[f].title, eval(flds[f].class_name),
                                            "rep" + rptNo + flds[f].name.replace(".", '') + thatRV.timeInLong,
                                            set, flds[f].data_type,
                                            flds[f].display_format, thatRV.view, undefined, flds[f].list);
                                        if (set.hasOwnProperty("trueValues"))
                                            flds[f].obj.trueValues = set["trueValues"];

                                        // trigger after adding object
                                        if (flds[f].hasOwnProperty("afterAddOBject") && flds[f].afterAddOBject != undefined)
                                            flds[f].afterAddOBject();
                                        if (flds[f].hasOwnProperty("onSetField") && flds[f].onSetField != undefined)
                                            flds[f].obj.onSetField = flds[f].onSetField;
                                        if (flds[f].hasOwnProperty("bat7OnSetFieldAddQry") && flds[f].bat7OnSetFieldAddQry != undefined)
                                            flds[f].obj.bat7OnSetFieldAddQry = flds[f].bat7OnSetFieldAddQry;
                                        if (flds[f].hasOwnProperty("bat7OnSetFieldGetData") && flds[f].bat7OnSetFieldGetData != undefined)
                                            flds[f].obj.bat7OnSetFieldGetData = flds[f].bat7OnSetFieldGetData;


                                        flds[f].obj.addStyleClass(flds[f].display_style);
                                        if (thatRV.firstObj == undefined && flds[f].obj instanceof sap.m.InputBase)
                                            thatRV.firstObj = flds[f].obj;
                                        if (flds[f].obj instanceof sap.m.Text) {
                                            flds[f].obj.setValue = function (vl) {
                                                this.setText(vl);
                                            }
                                            flds[f].obj.getValue = function (vl) {
                                                return this.getText();
                                            }

                                        }

                                        // }

                                    }
                                }
                            }
                            else if (rep.db[q].showType == FormView.QueryShowType.QUERYVIEW) {
                                var qr = rep.db[q];
                                qr.obj = new QueryView(qr.name + "_" + thatRV.timeInLong);
                                qr.obj.qrNo = q;
                                if (qr.eventAfterQV != undefined)
                                    qr.eventAfterQV(qr);
                                if (qr.showToolbar) {
                                    if (Util.nvl(qr.parent, "") != "") {
                                        qr.obj.showToolbar.showExpand = qr.obj.showToolbar.showCollapse = true;
                                    }
                                    qr.obj.createToolbar(qr.disp_class, qr.filterCols,
                                        // EVENT ON APPLY PERSONALIZATION
                                        function (prsn, qv) {
                                            var cod = rep.code + "-" + rptNo + "-" + qv.qrNo;
                                            var jstr = JSON.stringify(prsn).replaceAll(":", "->");
                                            var sq = "begin delete from c7_prsn_qry where usernm=':usernm' and qry_code=':qry_code';" +
                                                " insert into c7_prsn_qry(KEYFLD, USERNM, QRY_CODE, JS_STR) " +
                                                " values " +
                                                "((select nvl(max(keyfld),0)+1 from c7_prsn_qry), " +
                                                "':usernm', ':qry_code', ':js_str') ; end; ";
                                            sq = sq.replaceAll(":usernm", sett["LOGON_USER"]);
                                            sq = sq.replaceAll(":qry_code", cod);
                                            sq = sq.replaceAll(":js_str", jstr);

                                            var dt = Util.execSQL(sq);
                                            if (dt.ret == "SUCCESS")
                                                sap.m.MessageToast.show("Saved personalization to this query");
                                        },
                                        // EVENT ON REVERT PERSONALIZATION TO ORIGINAL
                                        function (qv) {

                                            var cod = rep.code + "-" + rptNo + "-" + qv.qrNo;
                                            var sq = "begin delete from c7_prsn_qry where usernm=':usernm' and qry_code=':qry_code';end; ";
                                            sq = sq.replaceAll(":usernm", sett["LOGON_USER"]);
                                            sq = sq.replaceAll(":qry_code", cod);
                                            var dt = Util.execSQL(sq);
                                            if (dt.ret == "SUCCESS") {
                                                sap.m.MessageToast.show("Revert to original !");
                                                thatRV.showPersonalizeQueries();
                                            }
                                        }
                                    );
                                }
                                if (rep.db[q].masterQry != "") {
                                    var mst = thatRV.objs[rep.db[q].masterQry];

                                    var mstName = rep.db[q].masterQry;
                                    var detName = rep.code + "@" + qr.name;
                                    if (thatRV.detailObjs == undefined) thatRV.detailObjs = Util.nvl(thatRV.detailObjs, {});
                                    thatRV.detailObjs[mstName] = Util.nvl(thatRV.detailObjs[detName], [thatRV.objs[detName]]);
                                }

                                if (Util.nvl(qr.parent, "") != "") {
                                    qr.obj.mColCode = qr.code;
                                    qr.obj.mColName = qr.title;
                                    qr.obj.mColParent = qr.parent;
                                    qr.obj.mColLevel = qr.levelCol;
                                    qr.obj.switchType("tree");
                                }
                                if (qr.fixedCols > 0)
                                    qr.obj.getControl().setFixedColumnCount(qr.fixedCols);


                                qr.obj.getControl().view = thatRV.view;
                                qr.obj.getControl().addStyleClass("sapUiSizeCondensed " + rep.db[q].disp_class);
                                qr.obj.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
                                qr.obj.getControl().setSelectionMode(sap.ui.table.SelectionMode.None);
                                qr.obj.getControl().setAlternateRowColors(false);
                                qr.obj.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);

                                if (qr.onRowRender != undefined)
                                    qr.obj.onRowRender = qr.onRowRender;

                                if (Util.nvl(qr.dispRecords, -1) == -1) {
                                    qr.obj.getControl().setVisibleRowCount(12);
                                    setTimeout(function () {
                                        var h = thatRV.pg.$().height();
                                        var rowHeight = Util.nvl(qr.obj.getControl().getRowHeight(), 25);
                                        if (rowHeight == 0) rowHeight = 25;
                                        if (h < 0) return;
                                        if (qr.obj.getControl().getAggregation("rows")[0] != undefined)
                                            rowHeight = $(qr.obj.getControl().getAggregation("rows")[0].getDomRef()).height();
                                        var sTop = $("#" + qr.obj.getControl().getId()).offset().top;
                                        // h = h - (rowHeight * 3);
                                        var rows = Math.trunc((h - (sTop)) / rowHeight) - 3;
                                        qr.obj.getControl().setVisibleRowCount(rows);
                                    }, 600);
                                }
                                else
                                    qr.obj.getControl().setVisibleRowCount(Util.nvl(qr.dispRecords, 12));

                                qr.obj.editable = false;
                                if (Util.nvl(qr.execOnShow, false))
                                    thatRV.helperFunctions.load.loadQueryView(qr, true);

                                // this.scrollObjs.push(qr.obj.showToolbar.toolbar);
                                // this.scrollObjs.push(qr.obj.getControl());
                                rep.dispCanvases[qr.canvas].push(qr.obj.showToolbar.toolbar);
                                rep.dispCanvases[qr.canvas].push(qr.obj.getControl());

                                if (thatRV.firstObj == undefined)
                                    thatRV.firstObj = qr.obj.getControl();
                                qr.sumObj = undefined;
                                var flds = rep.db[q].summary;
                                var fe = [];

                                if (qr.summary != undefined && Object.keys(qr.summary).length > 0)
                                    for (var f in flds) {
                                        var set = {};
                                        if (flds[f].display_width != "")
                                            set["layoutData"] = new sap.ui.layout.GridData({ span: flds[f].display_width })
                                        if (Object.keys(flds[f].other_settings).length > 0) {
                                            set = { ...set, ...flds[f].other_settings };
                                        }
                                        // if (flds[f].obj == undefined) {
                                        flds[f].dataSetDone = undefined;
                                        flds[f].obj = UtilGen.addControl(fe,
                                            flds[f].title, eval(flds[f].class_name),
                                            "rep" + rptNo + flds[f].name.replace(".", '') + thatRV.timeInLong,
                                            set, flds[f].data_type,
                                            flds[f].display_format, thatRV.view, undefined, flds[f].list);
                                        if (set.hasOwnProperty("trueValues"))
                                            flds[f].obj.trueValues = set["trueValues"];

                                        flds[f].obj.addStyleClass(flds[f].display_style);
                                        // }
                                    }

                                // qr.sumObj = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
                                // qr.sumObj.setToolbar(undefined);
                                // qr.sumObj.destroyToolbar();
                                // this.scrollObjs.push(qr.sumObj);
                                // this.dispCanvases[qr.canvas].push(qr.sumObj);
                            }

                        }
                        if (Util.nvl(rep.dispCanvases["para_canvas"], []).length > 0) {
                            thatRV.cmdDet = new sap.m.Button({
                                width: "100px",
                                text: "Details", press: function () {
                                    thatRV.cmdExe.firePress();
                                }
                            });
                            rep.dispCanvases["para_canvas"].push(thatRV.cmdDet);
                        }
                        if (Util.nvl(rep.dispCanvases["para_canvas"], []).length > 0) {
                            thatRV.objs["para_canvas"].obj = UtilGen.formCreate2("", true, rep.dispCanvases["para_canvas"], {}, sap.m.ScrollContainer, undefined, "reportForm");
                            this.scrollObjs.push(thatRV.objs["para_canvas"].obj);
                        }
                        for (var ci in rep.dispCanvases) {
                            if (ci == "para_canvas" || ci == "dispInPara")
                                continue;
                            if (thatRV.objs[ci].canvasType == ReportView.CanvasType.VBOX) {
                                thatRV.objs[ci].obj = new sap.m.VBox({ width: "100%" });
                                for (var di in rep.dispCanvases[ci])
                                    if (rep.dispCanvases[ci][di] instanceof sap.ui.core.Control)
                                        thatRV.objs[ci].obj.addItem(rep.dispCanvases[ci][di]);
                                this.scrollObjs.push(thatRV.objs[ci].obj);
                            }
                            if (thatRV.objs[ci].canvasType == ReportView.CanvasType.HBOX) {
                                thatRV.objs[ci].obj = new sap.m.HBox({});
                                for (var di in rep.dispCanvases[ci])
                                    if (rep.dispCanvases[ci][di] instanceof sap.ui.core.Control)
                                        thatRV.objs[ci].obj.addItem(rep.dispCanvases[ci][di]);
                                this.scrollObjs.push(thatRV.objs[ci].obj);
                            }
                            if (thatRV.objs[ci].canvasType == ReportView.CanvasType.FORMCREATE2) {
                                thatRV.objs[ci].obj = UtilGen.formCreate2("", true, rep.dispCanvases[ci], {}, sap.m.ScrollContainer, thatRV.objs[ci].canvasSett, "reportForm");
                                this.scrollObjs.push(thatRV.objs[ci].obj);
                            }
                            if (thatRV.objs[ci].canvasType == ReportView.CanvasType.FORMCREATE) {
                                thatRV.objs[ci].obj = UtilGen.formCreate("", true, rep.dispCanvases[ci], undefined, undefined, [1, 1, 1]);
                                this.scrollObjs.push(thatRV.objs[ci].obj);
                            }
                        }

                        // thatRV.objs["para_canvas"].obj = UtilGen.formCreate("", true, thatRV.dispCanvases["para_canvas"], undefined, undefined, [1, 1, 1]);

                        // if (Util.nvl(thatRV.dispCanvases["default_canvas"], []).length > 0) {
                        //     thatRV.objs["default_canvas"].obj = UtilGen.formCreate2("", true, thatRV.dispCanvases["default_canvas"], undefined, sap.m.ScrollContainer, {width: "600px"}, "reportForm");
                        //     this.scrollObjs.push(thatRV.objs["default_canvas"].obj);
                        // }
                        // thatRV.objs["default_canvas"].obj = UtilGen.formCreate("", true, thatRV.dispCanvases["default_canvas"], undefined, undefined, [1, 1, 1]);

                    }
                    ,
                    fillReport: function () {
                        var sc = new sap.m.VBox();
                        var thatRV = this.thatRV;
                        var rptNo = Util.nvl(undefined, UtilGen.getControlValue(thatRV.lstRep));
                        var rep = thatRV.reports[rptNo];
                        for (var i in this.scrollObjsH)
                            if (this.scrollObjs[i] instanceof sap.ui.core.Control)
                                thatRV.pg.addContent(this.scrollObjsH[i]);


                        // if (Util.nvl(thatRV.dispCanvases["para_canvas"], []).length > 0)
                        //     sc.addContent(thatRV.objs["para_canvas"].obj);
                        //
                        // if (Util.nvl(thatRV.dispCanvases["default_canvas"], []).length > 0)
                        //     sc.addContent(thatRV.objs["default_canvas"].obj);

                        // thatRV.pg.addContent(sc);

                        // if (Util.nvl(thatRV.dispCanvases["para_canvas"], []).length > 0) {
                        //     thatRV.objs["para_canvas"].obj.setToolbar(undefined);
                        //     thatRV.objs["para_canvas"].obj.destroyToolbar();
                        // }

                        // if (Util.nvl(thatRV.dispCanvases["default_canvas"], []).length > 0) {
                        //     thatRV.objs["default_canvas"].obj.setToolbar(undefined);
                        //     thatRV.objs["default_canvas"].obj.destroyToolbar();
                        // }

                        // this.objs["default_canvas"].obj.getToolbar().addContent(this.lstRep);

                        // if (this.dispCanvases["dispInPara"].length > 0) {
                        thatRV.txtFilter = new sap.m.Text().addStyleClass("redText smallFont");

                        Util.destroyID("adv" + thatRV.timeInLong, thatRV.view);

                        for (var i in this.scrollObjs)
                            if (this.scrollObjs[i] instanceof sap.ui.core.Control)
                                thatRV.pg.addContent(this.scrollObjs[i]);

                        thatRV.pg.addContent(new sap.m.VBox({ height: "150px" }));

                        Util.navEnter(Object.keys(rep.dispCanvases)[0], function (lastObj) {
                            thatRV.firstObj.focus();
                        });

                        // thatRV.pg.addContent(new sap.m.VBox({height: "20px"}));
                        // focus on first object after showing form
                        if (this.firstObj != undefined) {
                            this.pg.addEventDelegate({
                                onAfterShow: function (evt) {
                                    setTimeout(function () {
                                        thatRV.firstObj.focus();
                                    }, 700);
                                },
                            });
                        }

                    }

                }
                ,

                load: {
                    init: function (thatRV) {
                        this.thatRV = thatRV;
                    }
                    ,
                    loadQueries: function (qrys, fetchQryServer, pRptno) {
                        var qryObj;
                        var thatRV = this.thatRV;
                        var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(thatRV.lstRep));
                        var rep = thatRV.reports[rptNo];

                        // loop all queries to add queries on server for batch execution later.
                        for (var o in qrys) {
                            qryObj = qrys[o];

                            if (fetchQryServer && qryObj.showType == FormView.QueryShowType.FORM) {
                                var sqb = false;
                                if (qryObj.hasOwnProperty("beforeLoadQry"))
                                    sqb = true;
                                this.fetchQuery(qryObj, sqb);
                            }
                            if (fetchQryServer && qryObj.showType == FormView.QueryShowType.QUERYVIEW) {
                                this.loadQueryView(qryObj, true);
                                thatRV.helperFunctions.misc.saveParas(qryObj);
                                thatRV.helperFunctions.misc.fillQuickFilterData(qryObj);
                            } else if (!fetchQryServer && qryObj.showType == FormView.QueryShowType.QUERYVIEW)
                                qryObj.obj.updateDataToControl();


                        }

                        Util.doAjaxJson("bat7exeRep", {
                            sql: "",
                            ret: "",
                            data: "",
                            repCode: rep.code,
                            repNo: rptNo,
                            command: "",
                            scheduledAt: "",
                            p1: rep.name,
                            p2: "testRep5 repno=" + rptNo,
                            whereClause: UtilGen.getControlValue(thatRV.txtSQLWhere)

                        }, false).done(function (data) {
                            if (data.ret == "SUCCESS") {
                                thatRV.ERROR_ON_RCV_DATA = false;
                                thatRV.helperFunctions.batch.startRcvDataTimer(rep, rptNo);
                            }
                        });

                        setTimeout(function () {
                            thatRV.tbMain.$().css("background-color", "lightblue");
                        }, 100);

                    }
                    ,
                    fetchQuery: function (qryName, execBeforeSql) {
                        var thatRV = this.thatRV;
                        var qryObj = undefined;
                        var sett = sap.ui.getCore().getModel("settings").getData();
                        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
                        if (typeof qryName == "string")
                            qryObj = thatRV.objs[qryName];
                        else qryObj = qryName;

                        if (qryObj == undefined && qryObj.objType != FormView.ObjTypes.QUERY)
                            thatRV.err("Cant fetch query on  " + qryName);

                        var sql = thatRV.parseString(qryObj.dml);
                        if (Util.nvl(execBeforeSql, false) && qryObj.beforeLoadQry != undefined)
                            sql = qryObj.beforeLoadQry(sql, qryObj);
                        sql = thatRV.parseString(sql);

                        var pars = Util.nvl(qryObj.rep.rep.parameters, []);
                        var ps = "";
                        for (var i in pars) {
                            var vl = thatRV.getFieldValue("parameter." + pars[i].colname);
                            if (pars[i].data_type == FormView.DataType.Date)
                                vl = "@" + sdf.format(thatRV.getFieldValue("parameter." + pars[i].colname));
                            ps += (ps.length > 0 ? "&" : "") + "_para_" + pars[i].colname + "=" + vl;
                        }

                        if (sql != "") {
                            Util.doAjaxJson("bat7addQry?" + ps, {
                                sql: sql,
                                ret: "",
                                data: "",
                                repCode: qryObj.rep.code,
                                repNo: qryObj.repNo,
                                command: "",
                                scheduledAt: "",
                                p1: "",
                                p2: "",
                                qrNo: qryObj.qrNo,

                            }, false).done(function (data) {
                                if (data.ret == "SUCCESS") {
                                } else {
                                    sap.m.MessageToast.show(data.ret)
                                    console.log(data);
                                }
                            });

                        }
                        if (qryObj.hasOwnProperty("bat7CustomAddQry") && qryObj.bat7CustomAddQry != undefined)
                            qryObj.bat7CustomAddQry(qryObj, ps);

                        if (sql == "")
                            for (var key in qryObj.fields) {
                                if (qryObj.fields[key].obj != undefined && qryObj.fields[key].hasOwnProperty("bat7OnSetFieldAddQry") &&
                                    qryObj.fields[key].bat7OnSetFieldAddQry != undefined)
                                    qryObj.fields[key].bat7OnSetFieldAddQry(qryObj, ps);

                            }

                    }
                    ,
                    _loadDataFromJson: function (qry, dtx, executeChange) {
                        var subs = qry.fields;
                        for (var key in subs) {
                            var vl = dtx[key.toUpperCase()];
                            if (subs[key].obj != undefined)
                                UtilGen.setControlValue(subs[key].obj, "", "", false);
                            if (subs[key].obj != undefined && vl != undefined)
                                UtilGen.setControlValue(subs[key].obj, vl, vl, Util.nvl(executeChange, false));

                        }

                    }
                    ,
                    loadQueryView: function (qryObj) {
                        var thatRV = this.thatRV;
                        var sett = sap.ui.getCore().getModel("settings").getData();
                        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

                        if (qryObj.showType != FormView.QueryShowType.QUERYVIEW)
                            return;
                        if (qryObj.obj == undefined)
                            return;
                        var sq = qryObj.dml;
                        if (qryObj.hasOwnProperty("beforeLoadQry") && qryObj.beforeLoadQry != undefined)
                            sq = qryObj.beforeLoadQry(sq, qryObj);
                        var sw = Util.nvl(UtilGen.getControlValue(thatRV.txtSQLWhere), "");
                        if (sw != "" && sq.indexOf("where") >= 0)
                            sq = sq.replace(/where 1=1/i, "where " + sw);

                        sq = thatRV.parseString(sq);
                        var pars = Util.nvl(qryObj.rep.rep.parameters, []);
                        var ps = "";
                        for (var i in pars) {
                            var vl = thatRV.getFieldValue("parameter." + pars[i].colname);
                            if (pars[i].data_type == FormView.DataType.Date)
                                vl = "@" + sdf.format(thatRV.getFieldValue("parameter." + pars[i].colname));
                            ps += (ps.length > 0 ? "&" : "") + "_para_" + pars[i].colname + "=" + vl;
                        }

                        // Util.doAjaxJson("sqlmetadata?saveQryName=" + qryObj.rep.code + "@" + qryObj.name, {sql: sq}, false).done(function (data) {
                        // Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {

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
                            qrNo: qryObj.qrNo,

                        }, false).done(function (data) {
                            if (data.ret == "SUCCESS") {

                            }
                        });
                        if (qryObj.hasOwnProperty("bat7CustomAddQry") && qryObj.bat7CustomAddQry != undefined)
                            qryObj.bat7CustomAddQry(qryObj, ps);

                    }
                    ,
                }
                ,

                masterDetails: {
                    init: function (thatRV) {
                        this.thatRV = thatRV;
                    }
                    ,

                    loadMasterRecordDataFromCursor: function (qryObj) {
                        var thatRV = this.thatRV;
                        var dtx = {};
                        if (qryObj.masterTable.cursorNo < 0 || qryObj.masterTable == undefined || qryObj.masterTable.rows.length <= 0) {
                            return;
                        }
                        for (var cl = 0; cl < qryObj.masterTable.cols.length; cl++)
                            dtx[qryObj.masterTable.cols[cl].mColName.toUpperCase()] =
                                qryObj.masterTable.getFieldValue(qryObj.masterTable.cursorNo, qryObj.masterTable.cols[cl].mColName);
                        thatRV.helperFunctions.load._loadDataFromJson(qryObj, dtx, true);
                    }
                    ,
                    clearMasterRecordFromCursor: function (qryObj) {
                        var thatRV = this.thatRV;
                        var dtx = [];
                        for (var cl = 0; cl < qryObj.masterTable.cols.length; cl++)
                            dtx[qryObj.masterTable.cols[cl].mColName.toUpperCase()] = "";
                        thatRV.helperFunctions.load._loadDataFromJson(qryObj, dtx, true);

                    }
                    ,
                    loadDetailsData: function (qryObj) {
                        var thatRV = this.thatRV;
                        var mstName = qryObj.rep.code + "@" + qryObj.name
                        var qrDets = Util.nvl(thatRV.detailObjs[mstName], []);

                        for (var i in qrDets) {
                            if (qrDets[i].showType == FormView.QueryShowType.FORM) {
                                if (qrDets[i].hasOwnProperty("bat7CustomGetData") && qrDets[i].bat7CustomGetData != undefined)
                                    qrDets[i].bat7CustomGetData(qryObj);
                                for (var key in qrDets[i].fields) {
                                    if (qrDets[i].fields[key].obj != undefined && qrDets[i].fields[key].hasOwnProperty("bat7OnSetFieldGetData") &&
                                        qrDets[i].fields[key].bat7OnSetFieldGetData != undefined)
                                        qrDets[i].fields[key].bat7OnSetFieldGetData(qrDets[i]);

                                }
                            }
                            if (qrDets[i].showType == FormView.QueryShowType.QUERYVIEW) {
                                var sp = qrDets[i].masterDetailRelation.split("==");
                                var qryMast = qryObj;
                                var vl = qryMast.masterTable.getFieldValue(qryMast.masterTable.cursorNo, sp[1]);
                                qrDets[i].obj.mLctb.showDataByCondition(sp[0] + "==" + vl, true);
                                qrDets[i].obj.loadData();
                                if (qrDets[i].hasOwnProperty("bat7CustomGetData") && qrDets[i].bat7CustomGetData != undefined)
                                    qrDets[i].bat7CustomGetData(qryObj);
                            }
                        }
                    }
                    ,

                    setCursorMove: function (mov, qryObj, showData) {
                        var thatRV = this.thatRV;
                        if (qryObj.masterTable == undefined) return -1;
                        var cc = qryObj.masterTable.cursorNo + mov;
                        if (cc < 0) cc = 0;
                        if (cc >= qryObj.masterTable.rows.length) cc = qryObj.masterTable.rows.length - 1;
                        qryObj.masterTable.cursorNo = cc;

                        thatRV.view.byId("mstRecs" + qryObj.rep.code + "_" + qryObj.qrNo).setText((cc + 1) + "/" + qryObj.masterTable.rows.length)
                        if (Util.nvl(showData, false)) {
                            thatRV.helperFunctions.masterDetails.loadMasterRecordDataFromCursor(qryObj);
                            thatRV.helperFunctions.masterDetails.loadDetailsData(qryObj);
                        }

                        thatRV.helperFunctions.misc.showDisplayRecs();
                        return cc;
                    }
                    ,
                    getMasterButtonsinHB: function (qryObj) {
                        var thatRV = this.thatRV;
                        var q = qryObj.qrNo;
                        Util.destroyID("mstRecs" + qryObj.rep.code + "_" + q, thatRV.view);
                        Util.destroyID("mstRecsBts" + qryObj.rep.code + "_" + q, thatRV.view);
                        var hbscrol = new sap.m.HBox(thatRV.view.createId("mstRecsBts" + qryObj.rep.code + "_" + q), {
                            items: [
                                new sap.m.Button({
                                    text: "", width: "25px",
                                    icon: "sap-icon://list",
                                    customData: { key: q },
                                    press: function () {
                                        // var qrno = this.getCustomData()[0].getKey()
                                        // thatRV.helperFunctions.masterDetails.searchMaster(qryObj);
                                        Util.show_list("", undefined, undefined, function (data, idxno) {
                                            sap.m.MessageToast.show("selected");
                                            //moving to new position according to index no
                                            qryObj.masterTable.cursorNo = 0;
                                            thatRV.helperFunctions.masterDetails.setCursorMove(idxno, qryObj, true);
                                            return true;
                                        }, "100%", "100%", -1, false, undefined, undefined, qryObj.masterTable);
                                    }
                                }),
                                new sap.m.Button({
                                    text: "<<", width: "25px",
                                    customData: { key: q },
                                    press: function () {
                                        // var qrno = this.getCustomData()[0].getKey()
                                        thatRV.helperFunctions.masterDetails.setCursorMove(0 - qryObj.masterTable.cursorNo, qryObj, true);
                                    }
                                }),
                                new sap.m.Button({
                                    text: "<", width: "25px",
                                    customData: { key: q },
                                    press: function () {
                                        // var qrno = this.getCustomData()[0].getKey()
                                        thatRV.helperFunctions.masterDetails.setCursorMove(-1, qryObj, true);
                                    }
                                }),
                                new sap.m.Text(thatRV.view.createId("mstRecs" + qryObj.rep.code + "_" + q), {
                                    text: "1/"
                                }),
                                new sap.m.Button({
                                    text: ">", width: "25px",
                                    customData: { key: q },
                                    press: function () {
                                        thatRV.helperFunctions.masterDetails.setCursorMove(1, qryObj, true);
                                    }

                                }),
                                new sap.m.Button({
                                    text: ">>", width: "25px",
                                    customData: { key: q },
                                    press: function () {
                                        // var qrno = this.getCustomData()[0].getKey()
                                        thatRV.helperFunctions.masterDetails.setCursorMove(qryObj.masterTable.rows.length - qryObj.masterTable.cursorNo, qryObj, true);
                                    }
                                }),


                            ]
                        });
                        thatRV.view.byId("mstRecs" + qryObj.rep.code + "_" + q).addStyleClass("smallFont")
                        return hbscrol;
                    }
                }
            }
            this.helperFunctions.init(thatRV1);
        };


        ReportView.prototype.createViewMain = function (frag, js) {

            var thatForm = this;
            this.frag = frag;
            // UtilGen.closeWorking();
            frag.navApp = new sap.m.NavContainer();
            frag.joApp = new sap.m.SplitApp({ mode: sap.m.SplitAppMode.HideMode, });
            frag.joApp2 = new sap.m.App();
            this.view = frag.view;
            this.oController = frag.oController;

            this.app = frag.joApp;
            this.app2 = frag.joApp2;
            this.navApp = frag.navApp;

            frag.mainPage = new sap.m.Page({
                showHeader: false,
                showNavButton: false,
                enableScrolling: true,
                height: "100%",
                content: []
            });

            frag.mainParaPg = new sap.m.Page({
                showHeader: false,
                showNavButton: false,
                enableScrolling: true,
                height: "100%",
                content: []
            });

            frag.pgMaster = new sap.m.Page({
                showHeader: false,
                showFooter: true,
                showNavButton: false,
                enableScrolling: true,
                height: "100%",
                content: [new sap.m.Title({ text: "Settings" })]
            });

            this.pgMaster = frag.pgMaster;
            this.paraPg = frag.mainParaPg;
            this.pg = frag.mainPage;

            // setTimeout(function () {
            //     frag.mainPage.$().css("background-color", "white");
            // }, 500);


            // this.helperFunctions.mainPop.dispCanvases = {};
            // this.dispCanvases = {};
            // this.helperFunctions.mainPop.defaultCommands = {};
            // this.helperFunctions.mainPop.firstObj = undefined;
            // this.helperFunctions.mainPop.reportMenus = thatForm.reportVars.hideTemplates ? [] : [...rep.print_templates];
            // this.helperFunctions.mainPop.bt_Reports.setVisible(this.reportMenus.length > 0);
            frag.joApp.addDetailPage(frag.mainPage);
            frag.joApp.addMasterPage(frag.pgMaster);

            this.app2.addPage(frag.mainParaPg);
            this.parseRep(js);
            // this.initView();
            this.createView();

            var rptNo = Util.nvl(undefined, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            this.helperFunctions.mainPop.dispCanvases = rep.dispCanvases;
            this.helperFunctions.mainPop.firstObj = undefined;
            this.helperFunctions.mainPop.reportMenus = thatForm.reportVars.hideTemplates ? [] : [...rep.print_templates];
            // this.helperFunctions.mainPop.bt_Reports.setVisible(this.reportMenus.length > 0)

            this.helperFunctions.mainPop.createView(this.paraPg);

            this.navApp.addPage(this.app2);
            this.navApp.addPage(this.app);

            var para_repno = frag.oController.repno;
            var sm = Util.nvl(frag.oController.para_show_main, false);
            var er = Util.nvl(frag.oController.para_EXEC_REP, false);
            if (typeof sm == "string" && sm.toUpperCase() == "TRUE")
                sm = true; else sm = false;
            if (typeof er == "string" && er.toUpperCase() == "TRUE")
                er = true; else er = false;

            if (sm && !er)
                this.show_para_pop = true;

            if (/*para_repno == undefined &&*/Util.nvl(frag.oController.para_EXEC_REP, false) == false && this.show_para_pop) {
                this.navApp.to(this.app2);
            }
            else {
                setTimeout(function () {
                    var pf = Util.nvl(thatForm.oController.para_PARAFORM, "TRUE").toUpperCase() == "FALSE" ? false : true;
                    if (pf)
                        frag.joApp.showMaster();
                }, 1000);
                this.navApp.to(this.app);
            }


            setTimeout(function () {
                if (thatForm.oController.getForm().getParent() instanceof sap.m.Dialog)
                    thatForm.oController.getForm().getParent().setShowHeader(false);
                // thatForm.oController.getForm().getParent().setTitle(thatForm.title2);

            }, 10);
            var para_er = Util.nvl(frag.oController.para_EXEC_REP, false);

            if (para_er) {
                var txx = "";
                for (var i in frag.oController) {
                    if (typeof frag.oController[i] == "string") {
                        txx += (txx.length > 0 ? "," : "") + i + "=" + frag.oController[i];
                    }
                }
                this.loadData(undefined, para_repno, txx);

            } else
                this.helperFunctions.batch.startRcvDataTimer(rep, rptNo);


            return this.navApp;

        };

        ReportView.prototype.createView = function (clearPage, pRptNo) {
            var thatForm = this;
            var sett = sap.ui.getCore().getModel("settings").getData();
            UtilGen.closeWorking();
            // resetting report vars.
            this.reportVars.showParaForm = true;
            this.reportVars.clearReportImmediate = false;
            this.reportVars.hideTemplates = false;


            var rptNo = Util.nvl(pRptNo, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            if (rep.showMain)
                thatForm.ERROR_ON_RCV_DATA = false;
            if (this.pg == undefined)
                this.err("No page is declared !");

            this.view = Util.nvl(this.view, this.pg.getParent());
            if (this.view == undefined)
                this.err("No View is defined  !");

            this.sc = undefined;
            // this.dispCanvases = {};
            var scrollObjs = [];
            var scrollObjsH = [];
            this.defaultCommands = {};
            this.firstObj = undefined;
            var groupCol = false;
            this.reportMenus = thatForm.reportVars.hideTemplates ? [] : [...rep.print_templates];
            this.bt_Reports.setVisible(this.reportMenus.length > 0);

            if (Util.nvl(clearPage, false)) {
                UtilGen.clearPage(this.pg);
                this.scrollObjs = [];
                for (var ii in rep.dispCanvases)
                    rep.dispCanvases[ii] = [];
            }

            // this.helperFunctions.view.setParameters(this.oController);

            this.helperFunctions.view.setScrollObjs(scrollObjs, scrollObjsH); // set scrool container for header and content.
            this.helperFunctions.view.createParaFields(rptNo, ""); // create objects for parameter fields for field.obj

            this.helperFunctions.view.createHeaderReport(rep); // create toolbar commands , title , templates print and
            this.helperFunctions.view.createReport(rep);

            this.helperFunctions.view.fillReport();

        };

        ReportView.prototype.loadData = function (qryName, pRptno, strParas, pFetchQueryFromServer) {
            var qryObj = undefined;
            var thatRV = this;
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            var sett = sap.ui.getCore().getModel("settings").getData();
            var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

            var fetchQryServer = Util.nvl(pFetchQueryFromServer, true);
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;
            var qrys = (qryObj != undefined ? [qryObj] : rep.db);

            this.reportVars.showParaForm = true;
            this.reportVars.clearReportImmediate = false;
            this.reportVars.hideTemplates = false;

            if (Util.nvl(strParas, "") != "")
                this.parseParas(rptNo, strParas);

            // if (this.reportVars.clearReportImmediate || rep.clearCatchReportImmediate)
            thatRV.helperFunctions.reports.clearReport(rptNo);

            this.bt_Reports.setVisible(!this.reportVars.hideTemplates);


            thatRV.helperFunctions.view.showRepHeaderHTML();
            thatRV.helperFunctions.misc.enableParas(true);
            thatRV.helperFunctions.mainPop.enableParas(true);
            thatRV.helperFunctions.load.loadQueries(qrys, fetchQryServer, pRptno);


        };

        ReportView.prototype._rcvData = function (pRepCode, pRepNo) {
            var thatRV = this;
            thatRV.ERROR_ON_RCV_DATA = false;
            var rptNo = Util.nvl(undefined, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            if (rptNo != pRepNo || pRepCode != rep.code) {
                thatRV.helperFunctions.batch.startRcvDataTimer(rep, rptNo);
                return;
            }
            // get status of report
            var stat = "";
            thatRV.cmdExe.setEnabled(true);
            thatRV.cmdClr.setEnabled(false);

            if (thatRV.helperFunctions.mainPop.cmdExe != undefined)
                thatRV.helperFunctions.mainPop.cmdExe.setEnabled(true);

            if (thatRV.helperFunctions.mainPop.cmdClr != undefined)
                thatRV.helperFunctions.mainPop.cmdClr.setEnabled(false);

            if (thatRV.cmdDet != undefined)
                thatRV.cmdDet.setEnabled(true);


            try {
                Util.doAjaxJson("bat7getStat", {
                    sql: "",
                    ret: "",
                    data: "",
                    repCode: rep.code,
                    repNo: rptNo,
                    command: "",
                    scheduledAt: "",
                    p1: "",
                    p2: "",

                }, false).done(function (data) {

                    if (data.ret == "SUCCESS") {
                        stat = data.data;
                    } else {
                        stat = 'ERROR';
                    }

                });

                thatRV.status_of_rep = stat;
                thatRV.helperFunctions.mainPop.cmdExe.setEnabled(true);
                if (thatRV.helperFunctions.mainPop.cmdExe != undefined)
                    thatRV.helperFunctions.mainPop.cmdExe.setEnabled(true);


                if (stat == "NONE")
                    if (thatRV.rcv_data_timer != undefined)
                        clearInterval(thatRV.rcv_data_timer);
                if (stat == "START") {
                    thatRV.bat7GetParas(rep.code, rptNo);
                    thatRV.txtMsg.setText("Executing..");
                    thatRV.helperFunctions.mainPop.txtMsg.setText("Executing..");
                    thatRV.txtMsg2.setText("Executing..");
                    thatRV.txtMsg2.addStyleClass("blinking");
                    thatRV.txtMsg.addStyleClass("blinking");
                    thatRV.helperFunctions.mainPop.txtMsg.addStyleClass("blinking");
                    // Util.doWorking("Working..");
                    UtilGen.showWorking(thatRV.pg, "Executing");
                    return;
                }
                if (stat == "END") {
                    if (thatRV.txtMsg2 != undefined)
                        thatRV.txtMsg2.removeStyleClass("blinking");
                    if (thatRV.txtMsg != undefined)
                        thatRV.txtMsg.removeStyleClass("blinking");
                    if (thatRV.helperFunctions.mainPop.txtMsg != undefined)
                        thatRV.helperFunctions.mainPop.txtMsg.removeStyleClass("blinking");
                    if (sap.m.MessageBox == undefined)
                        jQuery.sap.require("sap.m.MessageBox");
                    var fnRetrieveData = function () {
                        var qryObj;
                        var qrys = rep.db;
                        for (var o in qrys) {
                            qryObj = qrys[o];
                            if (qryObj.showType == FormView.QueryShowType.FORM) {
                                if (qryObj.dml != "") {
                                    Util.doAjaxJson("bat7getData", {
                                        sql: qryObj.dml,
                                        ret: "",
                                        data: "",
                                        repCode: qryObj.rep.code,
                                        repNo: qryObj.repNo,
                                        command: "",
                                        scheduledAt: "",
                                        p1: "",
                                        p2: "",
                                        qrNo: qryObj.qrNo,
                                    }, false).done(function (data) {
                                        if (data.ret == "SUCCESS") {
                                            thatRV.bat7GetParas(qryObj.rep.code, qryObj.repNo);
                                            UtilGen.closeWorking(thatRV.pg);

                                            var dtx = JSON.parse("{" + data.data + "}");
                                            thatRV.helperFunctions.load._loadDataFromJson(qryObj, dtx.data[0], true);
                                        }

                                    });

                                } else {
                                    thatRV.bat7GetParas(qryObj.rep.code, qryObj.repNo);
                                    UtilGen.closeWorking(thatRV.pg);
                                    if (qryObj.hasOwnProperty("bat7CustomGetData") && qryObj.bat7CustomGetData != undefined)
                                        qryObj.bat7CustomGetData(qryObj);
                                    for (var key in qryObj.fields) {
                                        if (qryObj.fields[key].obj != undefined && qryObj.fields[key].hasOwnProperty("bat7OnSetFieldGetData") &&
                                            qryObj.fields[key].bat7OnSetFieldGetData != undefined)
                                            qryObj.fields[key].bat7OnSetFieldGetData(qryObj);
                                    }
                                }
                                if (qryObj.isMaster) {
                                    if (qryObj.masterTable == undefined)
                                        qryObj.masterTable = new LocalTableData();
                                    Util.doAjaxJson("bat7getData", {
                                        sql: qryObj.dml,
                                        ret: "",
                                        data: "",
                                        repCode: qryObj.rep.code,
                                        repNo: qryObj.repNo,
                                        command: "",
                                        scheduledAt: "",
                                        p1: "",
                                        p2: "",
                                        qrNo: qryObj.qrNo,
                                    }, false).done(function (data) {
                                        if (data.ret == "SUCCESS") {
                                            qryObj.masterTable.parse("{" + data.data + "}", false);
                                            qryObj.masterTable.cursorNo = 0;
                                            thatRV.helperFunctions.masterDetails.loadMasterRecordDataFromCursor(qryObj);
                                        }

                                    });

                                }
                            }
                            if (qryObj.showType == FormView.QueryShowType.QUERYVIEW) {
                                UtilGen.showWorking(thatRV.pg, "Fetching");
                                Util.doAjaxJson("bat7getData", {
                                    sql: qryObj.dml,
                                    ret: "",
                                    data: "",
                                    repCode: qryObj.rep.code,
                                    repNo: qryObj.repNo,
                                    command: "",
                                    scheduledAt: "",
                                    p1: "",
                                    p2: "",
                                    qrNo: qryObj.qrNo,
                                }, false).done(function (data) {

                                    if (data.ret == "SUCCESS") {

                                        thatRV.bat7GetParas(qryObj.rep.code, qryObj.repNo);
                                        thatRV.txtMsg.setText("Executed on  " + data.p1);
                                        thatRV.txtMsg2.setText("Executed on  " + data.p1);
                                        UtilGen.closeWorking(thatRV.pg);
                                        qryObj.obj.setJsonStrMetaData("{" + data.data + "}");
                                        if (Util.nvl(qryObj.applyCol, "") != "") {
                                            if (qryObj.when_validate_field != undefined) {
                                                var ld = qryObj.obj.mLctb;
                                                for (var fi = 0; fi < ld.cols.length; fi++)
                                                    ld.cols[fi].whenValidate = qryObj.when_validate_field;
                                            }
                                            if (qryObj.eventCalc != undefined)
                                                qryObj.obj.eventCalc = qryObj.eventCalc;

                                            UtilGen.applyCols(qryObj.applyCol, qryObj.obj, this);
                                        } else {
                                            thatRV.applyColThis(qryObj);
                                            if (qryObj.eventCalc != undefined)
                                                qryObj.obj.eventCalc = qryObj.eventCalc;
                                        }

                                        if (qryObj.afterApplyCols != undefined)
                                            qryObj.afterApplyCols(qryObj);

                                        var detfil = "";
                                        if (thatRV.filterData != undefined) {
                                            var str = thatRV.filterData[0];

                                            qryObj.obj.mViewSettings["filterStr"] = str;
                                            if (thatRV.txtFilter != undefined)
                                                thatRV.txtFilter.setText(str);
                                        }

                                        qryObj.obj.mLctb.parse("{" + data.data + "}", true);
                                        var sp = qryObj.masterDetailRelation.split("==");
                                        var qryMast = thatRV.objs[qryObj.masterQry];

                                        if (qryObj.masterQry != "" && qryObj.masterDetailRelation != "") {
                                            if (qryMast.masterTable.cursorNo < 0 || qryMast.masterTable == undefined || qryMast.masterTable.rows.length <= 0) {

                                            } else {
                                                var vl = qryMast.masterTable.getFieldValue(qryMast.masterTable.cursorNo, sp[1]);

                                                qryObj.obj.mLctb.showDataByCondition(sp[0] + "==" + vl, true);

                                                if (Util.nvl(qryObj.obj.mViewSettings["filterStr"], "") != "") {
                                                    var df = new QueryView.DataFilter();
                                                    df.filterString = Util.nvl(qryObj.obj.mViewSettings["filterStr"], "");
                                                    df.doFilter(qryMast.masterTable);
                                                    if (qryMast.masterTable.rows.length > 0) {
                                                        thatRV.helperFunctions.masterDetails.loadMasterRecordDataFromCursor(qryMast);
                                                        var vl = qryMast.masterTable.getFieldValue(qryMast.masterTable.cursorNo, sp[1]);
                                                        qryObj.obj.mLctb.showDataByCondition(sp[0] + "==" + vl, true);
                                                    } else {
                                                        thatRV.helperFunctions.masterDetails.clearMasterRecordFromCursor(qryMast);
                                                        var vl = "";
                                                        qryObj.obj.mLctb.showDataByCondition(sp[0] + "==" + vl, true);
                                                    }
                                                }
                                            }
                                        }

                                        qryObj.obj.mLctb.updateRecStatus(LocalTableData.RowStatus.QUERY);
                                        qryObj.obj.loadData();

                                    } else {
                                        thatRV.ERROR_ON_RCV_DATA = true;
                                    }
                                    UtilGen.closeWorking();
                                });
                                if (qryObj.hasOwnProperty("bat7CustomGetData") && qryObj.bat7CustomGetData != undefined)
                                    qryObj.bat7CustomGetData(qryObj);

                            }

                        }


                        if (rep.showFilterCols) {
                            thatRV.helperFunctions.misc.showFilterColsCmd(thatRV.vbPara, rep);
                        }
                        thatRV.helperFunctions.misc.showDisplayRecs(rep.rptNo);


                        // clearing report from server in case parameter passed in CLEAR_REP=true
                        if (thatRV.reportVars.clearReportImmediate || rep.clearCatchReportImmediate) {
                            thatRV.helperFunctions.reports.clearReport(rptNo, function () {
                                sap.m.MessageToast.show("Report cleared from server catch !");
                                thatRV.reportVars.clearReportImmediate = false;
                            })
                        }
                        thatRV.showPersonalizeQueries(rptNo);
                        if (thatRV.rcv_data_timer != undefined)
                            clearInterval(thatRV.rcv_data_timer);
                    }
                    if (thatRV.initV && Util.nvl(thatRV.frag.oController.para_EXEC_REP, 'false') != 'true') {
                        sap.m.MessageBox.confirm(Util.getLangText("msgLastRepSaved"), {
                            title: "Confirm",                                    // default
                            onClose: function (oAction) {
                                if (oAction == sap.m.MessageBox.Action.OK) {
                                    fnRetrieveData();
                                    thatRV.navApp.to(thatRV.frag.joApp);
                                } else {
                                    thatRV.helperFunctions.reports.clearReport(undefined, function () {
                                        if (thatRV.rcv_data_timer != undefined)
                                            clearInterval(thatRV.rcv_data_timer);
                                        thatRV.helperFunctions.batch.startRcvDataTimer(rep, rptNo);
                                    });
                                }
                            },                                       // default
                            styleClass: "",                                      // default
                            initialFocus: null,                                  // default
                            textDirection: sap.ui.core.TextDirection.Inherit     // default
                        });
                        thatRV.initV = false;
                    } else {
                        fnRetrieveData();
                        this.initV = false;
                        thatRV.navApp.to(thatRV.frag.joApp);
                    }

                } // if "END"

                if (stat == "ERROR") {
                    thatRV.createView(true);
                    thatRV.showDispInMaster(rptNo);
                    thatRV.helperFunctions.mainPop.showDispInMaster(rptNo);
                    if (thatRV.rcv_data_timer != undefined)
                        clearInterval(thatRV.rcv_data_timer);
                    setTimeout(function () {
                        thatRV.tbMain.$().css("background-color", "lightblue");
                    }, 100);

                }

                if (thatRV.rcv_data_timer != undefined)
                    clearInterval(thatRV.rcv_data_timer);

                this.initV = false;

            } catch (e) {
                console.log(e)
                thatRV.ERROR_ON_RCV_DATA = true;
                clearInterval(thatRV.rcv_data_timer);
            }
        }
            ;
        ReportView.prototype.showPersonalizeQueries = function () {
            var rptNo = Util.nvl(undefined, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            setTimeout(function () {
                var sett = sap.ui.getCore().getModel("settings").getData();
                for (var q in rep.db)
                    if (rep.db[q].showType == FormView.QueryShowType.QUERYVIEW) {
                        var qr = rep.db[q];
                        var cod = rep.code + "-" + rptNo + "-" + q;
                        var dt = Util.execSQL("select *from c7_prsn_qry " +
                            " where usernm=" + Util.quoted(sett["LOGON_USER"]) + " AND " +
                            " qry_code=" + Util.quoted(cod));
                        if (dt != undefined && dt.ret == "SUCCESS") {
                            var dtx = JSON.parse("{" + dt.data + "}").data;
                            if (dtx.length > 0) {
                                var jstr = dtx[0].JS_STR.replaceAll("->", ":");
                                var prs = JSON.parse(jstr);
                                qr.obj.personalize(prs);
                            } else if (qr.obj.prsnOrigin != undefined)
                                qr.obj.personalize(qr.obj.prsnOrigin);
                        }
                    }
            });
        };
        ReportView.prototype.bat7GetParas = function (repCode, repNo) {
            var thatRV = this;

            Util.doAjaxJson("bat7getPara", {
                sql: "",
                ret: "",
                data: "",
                repCode: repCode,
                repNo: repNo,
                command: "",
                scheduledAt: "",
                p1: "",
                p2: "",
                qrNo: "",


            }, false).done(function (data) {
                var sett = sap.ui.getCore().getModel("settings").getData();
                var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
                if (data.ret == "SUCCESS") {
                    // thatRV.cmdExe.setEnabled(false);
                    thatRV.cmdClr.setEnabled(true);
                    // if (thatRV.helperFunctions.mainPop.cmdExe != undefined)
                    //     thatRV.helperFunctions.mainPop.cmdExe.setEnabled(false);

                    if (thatRV.helperFunctions.mainPop.cmdClr != undefined)
                        thatRV.helperFunctions.mainPop.cmdClr.setEnabled(true);

                    if (thatRV.cmdDet != undefined)
                        thatRV.cmdDet.setEnabled(false);
                    var dtx = JSON.parse("{" + data.data + "}");
                    if (Util.nvl(data.whereClause, "") != "")
                        thatRV.txtSQLWhere.setValue(data.whereClause);
                    for (var dt in dtx) {
                        var pm = repCode + "@" + dt.replace("_para_", "parameter.");
                        var vl = dtx[dt];
                        if (vl.startsWith("@")) {
                            var parts = vl.substr(1).split("/");
                            var d1 = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));

                            thatRV.setFieldValue(pm, d1);
                        } else
                            thatRV.setFieldValue(pm, vl);
                    }
                    thatRV.helperFunctions.view.showRepHeaderHTML();
                    thatRV.helperFunctions.misc.enableParas(false);
                    thatRV.helperFunctions.mainPop.enableParas(false);

                }
            });


        };


        ReportView.prototype.initView = function (pRcvData) {
            var str = "";
            var thatRV = this;
            var rcvData = Util.nvl(pRcvData, true);
            var rps = Util.nvl(this.reports, []);
            for (var i = 0; i < rps.length; i++)
                str += (str.length > 0 ? "," : "") + (i + "/" + Util.getLangDescrAR(rps[i].name, rps[i].nameAR));
            str = "@" + str;
            var fe = [];
            this.initV = true;
            this.lstRep = UtilGen.addControl(fe, "Sub Reps", sap.m.ComboBox, "subrep",
                {
                    items: {
                        path: "/",
                        template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                        templateShareable: true
                    },
                    selectionChange: function (ev) {
                        thatRV.filterData = {};
                        thatRV.createView(true);
                        thatRV.showDispInMaster();
                        thatRV.loadData();

                    }
                }, "string", undefined, this.view, undefined, str);
            if (this.oController != undefined && this.oController.repno != undefined) {
                this.lstRep.setSelectedItem(this.lstRep.getItems()[this.oController.repno]);
            }
            else
                this.lstRep.setSelectedItem(this.lstRep.getItems()[0]);

            this.mnus = [];
            for (var i = 0; i < rps.length; i++) {
                var mnu = new sap.m.MenuItem({
                    text: Util.getLangDescrAR(rps[i].name, rps[i].nameAR),
                    icon: "sap-icon://menu2",
                    customData: { key: i + "" },
                    press: function () {
                        var cd = this.getCustomData()[0].getKey();
                        UtilGen.setControlValue(thatRV.lstRep, cd, cd, true);
                        thatRV.filterData = {};
                        thatRV.btRep.setText(this.getText());
                        // thatRV.createParaFields(cd, "");
                        thatRV.createView(true);
                        thatRV.showDispInMaster(cd);
                        setTimeout(function () {
                            thatRV.tbMain.$().css("background-color", "lightblue");
                        }, 100);

                        if (thatRV.rcv_data_timer != undefined)
                            clearInterval(thatRV.rcv_data_timer);
                        thatRV.helperFunctions.batch.startRcvDataTimer(thatRV.reports[cd], cd);
                        // thatRV.loadData();
                    }
                });
                thatRV.mnus.push(mnu);
            }
            this.mnusExp = [];
            this.mnusReports = [];

            this.mnusExp.push(
                new sap.m.MenuItem({
                    text: "Html",
                    icon: "sap-icon://attachment-html",
                    customData: { key: i + "" },
                    press: function () {

                        thatRV.showHTML();
                    }
                }));
            this.mnusExp.push(
                new sap.m.MenuItem({
                    text: "Excel",
                    icon: "sap-icon://excel-attachment",
                    customData: { key: i + "" },
                    press: function () {

                        thatRV.showXLS();

                        // var rptNo = Util.nvl('', UtilGen.getControlValue(thatRV.lstRep));
                        // var rep = thatRV.reports[rptNo];

                        // Util.doAjaxJson("bat7SaveToTemp", {
                        //     sql: "",
                        //     ret: "",
                        //     data: "",
                        //     repCode: rep.code,
                        //     repNo: rptNo,
                        //     command: "",
                        //     scheduledAt: "",
                        //     p1: "",
                        //     p2: "",
                        //
                        // }, false).done(function (data) {
                        //     if (data.ret == "SUCCESS") {
                        //         sap.m.MessageToast.show("saved report on server !");
                        //     }
                        // });
                        //

                    }
                }));


            this.btRep = new sap.m.Button({
                icon: "sap-icon://megamenu",
                text: this.lstRep.getValue(),
                width: "100%",
                press: function () {
                    thatRV.mnu.openBy(this);
                }
            });

            // var bt2 = new sap.m.Button({
            //     icon: "sap-icon://print",
            //     text: "Export/Print",
            //     press: function () {
            //         thatRV.mnuE.openBy(this);
            //     }
            // });
            this.bt_paraform = new sap.m.Button({
                icon: "sap-icon://arrow-right",
                text: "",
                visible: true,
                press: function () {
                    thatRV.navApp.to(thatRV.frag.joApp2);
                }
            });
            this.bt_close = new sap.m.Button({
                icon: "sap-icon://decline",
                text: Util.getLangText("cmdClose"),
                visible: true,
                press: function () {
                    thatRV.frag.jp.backFunction();
                }
            });
            this.bt_Reports = new sap.m.Button({
                icon: "sap-icon://print",
                text: Util.getLangText("templTxt"),
                visible: false,
                press: function () {
                    if (Util.nvl(thatRV.reportMenus, []).length <= 0) return;
                    var ms = thatRV.reportMenus;
                    var mnus = [];
                    for (var i in ms)
                        mnus.push(new sap.m.MenuItem({
                            text: ms[i].title,
                            icon: "sap-icon://attachment-html",
                            customData: { key: ms[i].reportFile },
                            press: function () {
                                var cd = this.getCustomData()[0].getKey();
                                var pms = "";
                                var sett = sap.ui.getCore().getModel("settings").getData();
                                thatRV.helperFunctions.reports.saveReport();
                                // var dt = Util.execSQL("select *from temporary where idno=8.1 and usernm=" +
                                //     Util.quoted(sett["LOGON_USER"]) + " and  field1=" + Util.quoted(rep.code + "-" + rep.rptNo + "-999"));
                                // if (dt != undefined && dt.ret == "SUCCESS") {
                                //     var dtx = JSON.parse("{" + dt.data + "}").data;
                                //     for (var d in dtx[0]) {
                                //         if (d == "IDNO" || d == "USERNM" || d == "FIELD1" || d == "FIELD2")
                                //             continue;
                                //         var ss = dtx[0][d].split("==");
                                //         pms += (pms.length > 0 ? "," : "") + ss[1] + "=" + ss[0];
                                //     }
                                //
                                //
                                // }
                                thatRV.printReport(cd, undefined);
                            }
                        }));
                    new sap.m.Menu({
                        title: "",
                        items: mnus
                    }).openBy(this);

                }
            });


            this.mnu = new sap.m.Menu({
                title: "Reports",
                items: thatRV.mnus
            });

            this.mnuE = new sap.m.Menu({
                title: "Export",
                items: thatRV.mnusExp
            });

            // this.tbMain = new sap.m.Bar({
            //     contentLeft: [],
            //     contentMiddle: [
            //         new sap.m.Title({text: this.title})
            //     ],
            //     contentRight: [
            //         this.bt_Reports,
            //         bt2
            //     ]
            // }).addStyleClass("");
            var vb = new sap.m.VBox({
                items: [
                    // new sap.m.Text({text: "Sub-Reports"}),
                    this.btRep]
            });
            this.pgMaster.removeStyleClass("repPage");
            this.pgMaster.addStyleClass("repPage");
            this.pgMaster.addContent(vb);
            this.pg.setShowSubHeader(true);

            if (this.vbPara == undefined) {
                this.vbPara = new sap.m.VBox();
                this.pgMaster.addContent(this.vbPara);

            }
            if (this.vbSQLWhere == undefined) {
                this.vbSQLWhere = new sap.m.VBox();
                this.pgMaster.addContent(this.vbSQLWhere);
            }

            setTimeout(function () {
                thatRV.showDispInMaster();
            });
            // this.pg.addContent(this.tbMain);
            //  this.pg.addHeaderContent(this.tbMain);

            if (thatRV.rcv_data_timer != undefined)
                clearInterval(thatRV.rcv_data_timer);
            var rptNo = Util.nvl(undefined, UtilGen.getControlValue(thatRV.lstRep));
            var rep = thatRV.reports[rptNo];

            setTimeout(function () {
                // thatRV.tbMain.$().css("background-color", "lightblue");
            }, 100);

        };
        ReportView.prototype.printReport = function (rpt, pRptno) {
            var that = this;
            var sett = sap.ui.getCore().getModel("settings").getData();
            var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            var ps = "";
            for (var i in rep.parameters) {
                var s = UtilGen.getControlValue(rep.parameters[i].obj);
                var k = "_para_" + rep.parameters[i].colname;
                var s = k + "=" + s;
                if (rep.parameters[i].data_type == FormView.DataType.Date)
                    s = k + "=@" + sdf.format(UtilGen.getControlValue(rep.parameters[i].obj));
                if (rep.parameters[i].data_type == FormView.DataType.Number)
                    s = k + "=" + df.formatBack(UtilGen.getControlValue(rep.parameters[i].obj));

                ps = ps + (ps.length > 0 ? "&" : "") + s;
            }

            Util.doXhr("report?reportfile=" + rpt + "&" + ps, true, function (e) {
                if (this.status == 200) {
                    var blob = new Blob([this.response], { type: "application/pdf" });
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.target = "_blank";
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.download = rpt + new Date() + ".pdf";
                    Util.printPdf(link.href);
                    // link.click();
                    // document.body.removeChild(link);

                }
            });
        };

        ReportView.prototype.applyColThis = function (qryObj) {
            var thatForm = this;
            if (qryObj.obj == undefined)
                return;
            var qv = qryObj.obj;
            var cls = {
                "TEXTFIELD": "sap.m.Input",
                "DATEFIELD": "sap.m.DatePicker",
                "DATETIMEFIELD": "sap.m.DateTimePicker",
                "TIMEFIELD": "sap.m.TimePicker",
                "COMBOBOX": "SelectText",
                "CHECKBOX": "sap.m.CheckBox",
                // "SEARCHFIELD": "SearchText",
                "SEARCHFIELD": "sap.m.Input",
                "LABLE": "sap.m.Label",
                "ICON": "sap.ui.core.Icon"
            };
            var aligns = {
                "ALIGN_LEFT": "left",
                "ALIGN_RIGHT": "right",
                "ALIGN_CENTER": "center"
            };

            var visibleCol = [], invisibleCol = []; // visible and invisible column to arrange first visible and then invisible in localtabledata

            for (var col in qv.mLctb.cols)
                qv.mLctb.cols[col].mHideCol = true;
            var dtx = Util.nvl(qryObj.fields, []);
            for (var col in dtx) {
                var cx = qv.mLctb.getColByName(dtx[col].colname);

                if (cx == undefined && dtx[col].onTemplField == undefined)
                    cx = qv.mLctb.addColumn(dtx[col].colname);
                else if (cx == undefined && dtx[col].onTemplField != undefined) {
                    dtx[col].onTemplField(qryObj, visibleCol);
                    continue;
                }

                if (typeof dtx[col].display_type == "string" && dtx[col].display_type != "INVISIBLE") {
                    cx.mHideCol = false;
                    visibleCol.push(cx);
                } else if (typeof dtx[col].display_type == "function" && dtx[col].display_type() != "INVISIBLE") {
                    cx.mHideCol = false;
                    visibleCol.push(cx);
                }

                cx.mColClass = Util.nvl(dtx[col].class_name, "sap.m.Label");
                cx.mUIHelper.data_type = Util.nvl(dtx[col].data_type, "String").toUpperCase();
                cx.mUIHelper.display_align = Util.nvl(dtx[col].display_align, "center");
                cx.mUIHelper.display_format = Util.nvl(dtx[col].display_format, "");
                cx.mUIHelper.display_width = Util.nvl(dtx[col].display_width, "30");
                cx.mUIHelper.display_style = Util.nvl(dtx[col].display_style, "");
                cx.mTitle = Util.nvl(dtx[col].title, dtx[col].colname);
                cx.mTitleParent = Util.nvl(dtx[col].parentTitle, "");
                cx.mTitleParentSpan = Util.nvl(dtx[col].parentSpan, 1);
                cx.commandLink = Util.nvl(dtx[col].commandLink, "");
                cx.valOnZero = dtx[col].valOnZero;
                cx.commandLinkClick2 = dtx[col].commandLinkClick;
                cx.commandLinkClick = (dtx[col].commandLinkClick != undefined ? function (obj, rowno, col, lctb) {
                    this.commandLinkClick2(obj, rowno, col, lctb, thatForm);
                } : undefined);
                cx.mSummary = Util.nvl(dtx[col].summary, "");
                cx.mSearchSQL = "";
                cx.mLookUpCols = "";
                cx.mRetValues = "";
                cx.eOther = "";
                cx.mDefaultValue = "";
                cx.mGrouped = Util.nvl(dtx[col].grouped, false);
            }

            for (var col in qv.mLctb.cols)
                if (qv.mLctb.cols[col].mHideCol)
                    invisibleCol.push(qv.mLctb.cols[col]);
            qv.mLctb.cols = [];

            if (qryObj.generateDynamicCols != undefined)
                qryObj.generateDynamicCols(visibleCol, invisibleCol);

            for (var i in visibleCol) {
                visibleCol[i].mColpos = parseInt(i) + 1;
                qv.mLctb.cols.push(visibleCol[i]);
            }
            var tr = qv.mLctb.cols.length - 1;
            for (var i in invisibleCol) {
                invisibleCol[i].mColpos = tr + parseInt(i) + 1;
                qv.mLctb.cols.push(invisibleCol[i]);
            }
        };
        ReportView.prototype.parseString = function (str) {
            var lst = str.match(/:[a-zA-Z0-9_.]*/gi);
            var sst = str;
            for (var i = 0; i < Util.nvl(lst, []).length; i++) {
                if (lst[i] != ":=" && lst[i] != ":") {
                    var vl = this.getFieldValue(lst[i].replaceAll(':', ''));
                    if (vl instanceof Date)
                        vl = Util.toOraDateString(vl);

                    sst = sst.replaceAll(lst[i], vl);
                }
            }
            return sst;
        };
        ReportView.prototype.getFieldValue = function (pvr) {
            var vl = undefined;
            var repCode = this.reports[UtilGen.getControlValue(this.lstRep)].code;
            var vr = pvr;
            var fldObj = this._findFieldObj(vr);
            if (fldObj == undefined)
                vr = repCode + "@" + pvr;

            if (this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.PARAMETER))
                vl = this.objs[vr].value;

            if (vl == undefined && this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.FIELD))
                vl = UtilGen.getControlValue(this.objs[vr].obj);


            if (vl == undefined)
                for (var i in this.objs) {
                    if (this.objs[i].objType == FormView.ObjTypes.FIELD &&
                        i.endsWith("." + vr) && i.startsWith(repCode + "@"))
                        vl = UtilGen.getControlValue(this.objs[i].obj);
                }
            // var vl = undefined;
            // var fldObj = this._findFieldObj(pvr);
            // if (fldObj != undefined)
            //     vl = UtilGen.getControlValue(fldObj);
            return vl;

        };
        ReportView.prototype.setFieldValue = function (vr, pvl, lbl, validate) {
            var rptNo = UtilGen.getControlValue(this.lstRep);
            var fldObj = this._findFieldObj(vr);
            if (Util.nvl(validate, false) && !this.isFieldEditable(fldObj))
                return false;
            if (fldObj != undefined)
                UtilGen.setControlValue(fldObj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
            var fld = this._findField(vr);
            if (fld != undefined) {
                var obj = this.view.byId("rep" + rptNo + "_" + fld.name.replace(".", '') + "Para" + this.timeInLong,)
                var mobj = this.view.byId("rep" + rptNo + "_" + fld.name.replace(".", '') + "main" + this.timeInLong,)
                if (obj != undefined)
                    UtilGen.setControlValue(obj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
                if (mobj != undefined)
                    UtilGen.setControlValue(mobj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
            }
            return true;

        };
        ReportView.prototype.getObject = function (vr) {
            var repCode = this.reports[UtilGen.getControlValue(this.lstRep)].code;
            // var vr = repCode + "@" + pvr;
            if (typeof vr == "object" && (vr.objType == ReportView.ObjTypes.FIELD || vr.objType == ReportView.ObjTypes.PARAMETER))
                return vr.obj;

            if (this.objs[vr] != undefined && typeof vr == "string" && (
                (this.objs[vr].objType == ReportView.ObjTypes.PARAMETER) ||
                (this.objs[vr].objType == ReportView.ObjTypes.FIELD))) {
                return this.objs[vr];
            }
            return undefined;

        };
        ReportView.prototype._findFieldObj = function (vr) {

            var repCode = this.reports[UtilGen.getControlValue(this.lstRep)].code;
            // var vr = repCode + "@" + pvr;

            if (typeof vr == "object" && (vr.objType == ReportView.ObjTypes.FIELD || vr.objType == ReportView.ObjTypes.PARAMETER))
                return vr.obj;

            if (this.objs[vr] != undefined && typeof vr == "string" &&
                (this.objs[vr].objType == ReportView.ObjTypes.PARAMETER)) {
                return this.objs[repCode + "@" + vr];
            }

            if (this.objs[vr] != undefined &&
                (this.objs[vr].objType == ReportView.ObjTypes.FIELD)) {
                // if (Util.nvl(validate, false) && !this.isFieldEditable(this.objs[vr]))
                //     return false;
                // UtilGen.setControlValue(this.objs[vr].obj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
                return this.objs[vr].obj;
            }

            return undefined;
            for (var i in this.objs)
                if (this.objs[i].objType == ReportView.ObjTypes.FIELD &&
                    i.endsWith("." + vr) && i.startsWith(repCode + "@")) {
                    return this.objs[i].obj;
                }
            // if  not found then search in QUERYVIEW fields

        };

        ReportView.prototype._findField = function (vr) {

            var repCode = this.reports[UtilGen.getControlValue(this.lstRep)].code;
            // var vr = repCode + "@" + pvr;

            if (typeof vr == "object" && (vr.objType == ReportView.ObjTypes.FIELD || vr.objType == ReportView.ObjTypes.PARAMETER))
                return vr;

            if (this.objs[vr] != undefined && typeof vr == "string" &&
                (this.objs[vr].objType == ReportView.ObjTypes.PARAMETER)) {
                return this.objs[repCode + "@" + vr];
            }

            if (this.objs[vr] != undefined &&
                (this.objs[vr].objType == ReportView.ObjTypes.FIELD)) {
                // if (Util.nvl(validate, false) && !this.isFieldEditable(this.objs[vr]))
                //     return false;
                // UtilGen.setControlValue(this.objs[vr].obj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
                return this.objs[vr];
            }

            return undefined;
            for (var i in this.objs)
                if (this.objs[i].objType == ReportView.ObjTypes.FIELD &&
                    i.endsWith("." + vr) && i.startsWith(repCode + "@")) {
                    return this.objs[i];
                }
            // if  not found then search in QUERYVIEW fields

        };


        ReportView.prototype.isFieldEditable = function (fld) {
            if (fld == undefined)
                return false;
            // if (fld.objType == FormView.ObjTypes.PARAMETER)
            //     return true;
            if (fld.objType == ReportView.ObjTypes.FIELD &&
                fld.obj != undefined && (
                    fld.obj.getEditable() == false ||
                    fld.obj.getEnabled() == false))
                return false;

            return true;


        };
        ReportView.prototype.showDispInMaster = function (pRptNo) {
            var thatForm = this;
            var scrollObjs = [];
            // var showModal = Util.nvl(pshowModal, false);
            this.defaultCommands = {};
            this.firstObj = undefined;
            var rptNo = Util.nvl(pRptNo, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];

            var flds = rep.parameters;
            var fe = [];
            var paras = {};
            for (var f in flds)
                if (Util.nvl(flds[f].canvas, "") == "dispInPara") {
                    rep.dispCanvases[flds[f].canvas]
                        = Util.nvl(rep.dispCanvases[flds[f].canvas],
                            []);
                    var set = {};
                    if (flds[f].display_width != "")
                        set["layoutData"] = new sap.ui.layout.GridData({ span: flds[f].display_width })
                    // if (flds[f].dispInPara)
                    //     set["visible"] = false;
                    if (Object.keys(flds[f].other_settings).length > 0) {
                        set = { ...set, ...flds[f].other_settings };
                    }
                    var prev;
                    if (flds[f].obj.paraObj != undefined) {
                        prev = UtilGen.getControlValue(flds[f].obj);
                        if (flds[f].obj.paraObj != undefined)
                            try {
                                flds[f].obj.paraObj.desroy();
                            }
                            catch (e) { }
                    }
                    if (set.hasOwnProperty("trueValues"))
                        flds[f].obj.trueValues = set["trueValues"];

                    var obj = UtilGen.addControl(fe,
                        flds[f].title, eval(flds[f].class_name),
                        "rep" + rptNo + "_" + flds[f].name.replace(".", '') + "Para" + this.timeInLong,
                        set, flds[f].data_type,
                        flds[f].display_format, this.view, undefined, flds[f].list);

                    if (set.hasOwnProperty("trueValues"))
                        obj.trueValues = set["trueValues"];

                    rep.dispCanvases[flds[f].canvas].push(flds[f].obj);
                    UtilGen.setControlValue(obj, prev, prev, true);
                    // var obj = flds[f].obj;
                    // fe.push(flds[f].title);
                    // fe.push(flds[f].obj);
                    obj.addStyleClass(flds[f].display_style);
                    thatForm.objs[rep.code + "@" + flds[f].name].obj.paraObj = obj;
                    // flds[f].obj.paraObj = obj;
                    // flds[f].obj.mainObj.paraObj = obj;
                    // flds[f].obj.paraObj.parentObj = thatForm.objs[rep.code + "@" + flds[f].name].obj;//flds[f].obj;
                    paras[flds[f].colname] = obj;
                    var vl = thatForm.getFieldValue(flds[f].name);
                    if (flds[f].data_type == FormView.DataType.Number)
                        vl = parseFloat(vl);
                    UtilGen.setControlValue(obj, vl, vl, true);

                    if (this.firstObj == undefined && obj instanceof sap.m.InputBase)
                        this.firstObj = obj;

                    if (obj instanceof sap.m.Text) {
                        obj.setValue = function (vl) {
                            this.setText(vl);
                        }
                        obj.getValue = function (vl) {
                            return this.getText();
                        }
                    }


                }


            var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
            // var frm = UtilGen.formCreate2("", true, fe, undefined, sap.m.VBox);
            frm.addStyleClass("sapUiSizeCondensed");
            frm.setToolbar(undefined);
            frm.destroyToolbar();

            this.cmdExe = new sap.m.Button({
                text: Util.getLangText("executeTxt"),
                tooltip: Util.getLangText("executeTooltip"),
                icon: "sap-icon://begin",
                press: function () {
                    for (var fld in paras) {

                        var vl = UtilGen.getControlValue(paras[fld]);
                        // var pid = thatForm.view.byId("rep" + rptNo + "_parameter" + fld + thatForm.timeInLong);
                        var parent = thatForm.view.byId("rep" + rptNo + "_parameter" + fld + thatForm.timeInLong);
                        var main = thatForm.view.byId("rep" + rptNo + "_parameter" + fld + "main" + thatForm.timeInLong);

                        UtilGen.setControlValue(parent, vl, vl, true);
                        UtilGen.setControlValue(main, vl, vl, true);

                        if (Util.nvl(vl, "") == "" && thatForm.helperFunctions.misc.getObjectByObj(parent).require) {
                            UtilGen.errorObj(paras[fld]);
                            ReportView.err(thatForm.helperFunctions.misc.getObjectByObj(parent).colname + " field rquired a value !");
                        }

                        // var fx=thatForm.view.byId("rep" + rptNo + "_" + flds[f].name.replace(".", '')  + this.timeInLong)
                        // thatForm.setFieldValue(paras[fld].parentObj, vl, vl, true);
                    }
                    // thatForm.loadData();
                    thatForm.executeSetup();
                    thatForm.dispFilter(thatForm.tbf);
                    setTimeout(function () {
                        thatForm.app.hideMaster();
                    }, 10);
                    // thatForm.executeSetup();
                }
            });
            this.cmdClr = new sap.m.Button({
                text: Util.getLangText("resetTxt"),
                icon: "sap-icon://reset",
                enabled: false,
                press: function () {
                    Util.doAjaxJson("bat7ClrRep", {
                        sql: "",
                        ret: "",
                        data: "",
                        repCode: rep.code,
                        repNo: rptNo,
                        command: "",
                        scheduledAt: "",
                        p1: "",
                        p2: "",

                    }, false).done(function (data) {
                        if (data.ret == "SUCCESS") {

                            thatForm.helperFunctions.batch.startRcvDataTimer(rep, rptNo);


                        }
                    });

                }
            });

            Util.navEnter(fe, function (lastObj) {
                thatForm.cmdExe.focus();
            });

            // if (this.vbPara == undefined)
            //     this.vbPara = new sap.m.VBox();
            this.vbPara.removeAllItems();
            this.vbSQLWhere.removeAllItems();
            thatForm.txtMsg = new sap.m.Text({}).addStyleClass("redMiniText");
            this.vbPara.addItem(this.txtMsg);
            this.vbPara.addItem(frm);


            if (rep.showSQLWhereClause) {

                this.txtSQLWhere = new sap.m.TextArea({ width: "100%" }).addStyleClass("paddingLR5P");

                this.vbSQLWhere.addItem(new sap.m.Text({ text: "SQL Where Clause" }).addStyleClass("paddingLR5P"));
                this.vbSQLWhere.addItem(this.txtSQLWhere);
                this.vbPara.addItem(this.vbSQLWhere);
            }

            if (rep.showCustomPara != undefined) {
                rep.showCustomPara(this.vbPara, rep);
            }

            this.pgMaster.setFloatingFooter(false);
            var ttb = new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),
                    // thatForm.cmdRefresh,
                    thatForm.cmdExe,
                    thatForm.cmdClr
                ]
            }).addStyleClass("repPage");
            this.pgMaster.setSubHeader(ttb);
            this.vbPara.addItem(new sap.m.VBox({ height: "100px" }));

        };

        ReportView.prototype.showDispInPara = function (showMoreObj, pRptNo, pshowModal) {
            var thatForm = this;
            var scrollObjs = [];
            var showModal = Util.nvl(pshowModal, false);
            this.defaultCommands = {};
            this.firstObj = undefined;
            var rptNo = Util.nvl(pRptNo, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];

            var flds = rep.parameters;
            var fe = [];
            var paras = {};
            for (var f in flds)
                if (Util.nvl(flds[f].canvas, "") == "dispInPara") {
                    rep.dispCanvases[flds[f].canvas]
                        = Util.nvl(rep.dispCanvases[flds[f].canvas],
                            []);
                    var set = {};
                    if (flds[f].display_width != "")
                        set["layoutData"] = new sap.ui.layout.GridData({ span: flds[f].display_width })
                    // if (flds[f].dispInPara)
                    //     set["visible"] = false;
                    if (Object.keys(flds[f].other_settings).length > 0) {
                        set = { ...set, ...flds[f].other_settings };
                    }
                    var prev;
                    if (flds[f].obj != undefined) {
                        prev = UtilGen.getControlValue(flds[f].obj);
                        //flds[f].obj.destroy();
                    }

                    var obj = UtilGen.addControl(fe,
                        flds[f].title, eval(flds[f].class_name),
                        "rep" + rptNo + "_" + flds[f].name.replace(".", '') + "Para" + this.timeInLong,
                        set, flds[f].data_type,
                        flds[f].display_format, this.view, undefined, flds[f].list);
                    if (set.hasOwnProperty("trueValues"))
                        obj.trueValues = set["trueValues"];

                    rep.dispCanvases[flds[f].canvas].push(flds[f].obj);
                    UtilGen.setControlValue(obj, prev, prev, true);
                    // var obj = flds[f].obj;
                    // fe.push(flds[f].title);
                    // fe.push(flds[f].obj);
                    obj.addStyleClass(flds[f].display_style);
                    flds[f].obj = obj;
                    paras[flds[f].colname] = obj;
                    var vl = thatForm.getFieldValue(flds[f].name);
                    if (flds[f].data_type == FormView.DataType.Number)
                        vl = parseFloat(vl);
                    UtilGen.setControlValue(obj, vl, vl, true);

                    if (this.firstObj == undefined && obj instanceof sap.m.InputBase)
                        this.firstObj = obj;
                    if (obj instanceof sap.m.Text) {
                        obj.setValue = function (vl) {
                            this.setText(vl);
                        }
                        obj.getValue = function (vl) {
                            return this.getText();
                        }
                    }


                }


            var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
            frm.addStyleClass("sapUiSizeCondensed");
            frm.setToolbar(undefined);
            frm.destroyToolbar();

            var hb = new sap.m.HBox();
            hb.addItem(
                new sap.m.Button({
                    text: "Refresh",
                    press: function () {
                        for (var fld in paras) {
                            var vl = UtilGen.getControlValue(paras[fld]);
                            thatForm.setFieldValue(fld, vl, vl, true);
                        }
                        // thatForm.loadData();
                        thatForm.executeSetup();
                        if (showModal)
                            oPopover.close();
                    }
                })
            );
            var tbPara = new sap.m.IconTabFilter({
                text: "Parameters",
                key: -1,
                content: frm
            });

            var tbf = [];
            tbf.push(tbPara);
            for (var q in rep.db) {
                if (rep.db[q].showType == FormView.QueryShowType.QUERYVIEW) {
                    var tbx = new sap.m.IconTabFilter({
                        text: rep.db[q].name,
                        key: (parseInt(q)),
                        content: []
                    });
                    tbf.push(tbx);
                }
            }
            var tbs = new sap.m.IconTabBar({
                items: tbf
            }).addStyleClass("sapUiSizeCompact");

            thatForm.dispFilter(tbf);

            var oPopover = new sap.m.Popover({
                title: "Parameters",
                showHeader: true,
                content: [tbs],
                modal: showModal,
                footer: [hb],
                contentHeight: "350px",
                contentWidth: "350px",
                placement: sap.m.PlacementType.Auto
            }).addStyleClass("sapUiSizeCompact");

            Util.navEnter(fe, function (lastObj) {
                hb.getItems()[0].focus();
                // oPopover.close();
            });

            // if (oAppointment.$().position().left > $(window).width() - 600)
            //     o = this.o1.fromdate;


            oPopover.openBy(showMoreObj);
        };
        ReportView.prototype.dispFilter = function (tbf, pRptno) {
            var thatForm = this;
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];

            for (var i in Util.nvl(tbf, [])) {
                if (tbf[i].getKey() < 0)
                    continue;
                if (tbf[i].getContent().length > 0 && tbf[i].getContent()[0].getContent()[0].qv.mLctb.rows.length > 0)
                    continue;
                if (tbf[i].getContent().length > 0) {
                    tbf[i].getContent()[0].removeAllContent();
                    tbf[i].removeAllContent();
                }
                var scr = new sap.m.ScrollContainer();
                var qv = new QueryView("qvFilter" + tbf[i].getKey() + this.timeInLong);
                qv.getControl().addStyleClass("sapUiSizeCondensed");
                qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
                qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.None);
                qv.getControl().setAlternateRowColors(false);
                qv.getControl().setFixedBottomRowCount(0);
                qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
                qv.getControl().setVisibleRowCount(7);
                qv.editable = true;
                scr.addContent(qv.getControl());
                tbf[i].addContent(scr);
                var md = thatForm.getMetaDataOfQry(rep.db[tbf[i].getKey()]);
                qv.setJsonStrMetaData(JSON.stringify(md));
                qv.mLctb.parse(JSON.stringify(md), true);
                var c = qv.mLctb.getColPos("FILTER");
                qv.mLctb.cols[c].mColClass = "sap.m.Input";
                qv.loadData();
            }

        };
        ReportView.prototype.getMetaDataOfQry = function (qryObj) {
            var thatForm = this;
            if (qryObj.obj == undefined)
                return;
            var md = [
                {
                    colname: "columns",
                    width: 30
                },
                {
                    colname: "filter",
                    width: 30
                }

            ];
            var data = [];


            var ld = qryObj.obj.mLctb;
            for (var i = 0; i < ld.cols.length; i++) {
                if (ld.cols[i].mHideCol)
                    continue;
                var dt = {
                    "columns": ld.cols[i].mColName,
                    "filter": ""
                };
                data.push(dt);
            }
            return { metadata: md, data: data };
        };
        ReportView.prototype.executeSetup = function (pRptno) {
            var thatForm = this;
            this.filterData = {};
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            var str = "";
            for (var i in Util.nvl(rep.db, [])) {
                var qryObj = rep.db[i];
                var qvtb = sap.ui.getCore().byId("qvFilter" + i + this.timeInLong + "table");
                if (qvtb == undefined)
                    continue;
                var qvf = qvtb.qv; // get query view from table control

                qvf.updateDataToTable();
                for (var j = 0; j < qvf.mLctb.rows.length; j++) {
                    var coln = qvf.mLctb.getFieldValue(j, "columns");
                    var s = qvf.mLctb.getFieldValue(j, "filter");
                    if (s == "")
                        continue;
                    var op = "%%";
                    op = (s.startsWith("=") ? "=" :
                        s.startsWith("!=") ? "!=" :
                            s.startsWith("<>") ? "<>" :
                                s.startsWith(">=") ? ">=" :
                                    s.startsWith("<=") ? "<=" :
                                        s.startsWith(">") ? ">" :
                                            s.startsWith("<") ? "<" : "%%");
                    if (s.startsWith(op))
                        s = s.substring(op.length);
                    str += (str.length > 0 ? " && " : "") + qvf.mLctb.getFieldValue(j, "columns") + op + s;
                }
                // qryObj.obj.mViewSettings["filterStr"] = str;
                this.filterData[i] = str;
            }
            thatForm.loadData();
        };

        ReportView.prototype.loadFromQry = function (qryCode, pTit) {
            var that = this;
            var json = {};
            var title = pTit;
            var hvChild = 0;
            var dt = Util.execSQL("select *from c6_qry1 where code=" + Util.quoted(qryCode));
            if (dt != undefined && dt.ret == "SUCCESS") {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                title = Util.nvl(pTit, dtx[0].TITLEARB);
                hvChild = Util.getSQLValue("select nvl(count(*),0) from c6_qry1 where PARENTREP=" + Util.quoted(dtx[0].CODE));
            }
            if (hvChild = 0)
                dt = Util.execSQL("select *from c6_qry1 where code=" + Util.Quoted(qryCode))
            else
                dt = Util.execSQL("select *from c6_qry1 where parentrep=" + Util.Quoted(qryCode) + " order by code");

            if (dt != undefined && dt.ret == "SUCCESS") {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                var reports = [];
                for (var i = 0; i < dt.length; i++) {

                }
            }
        };
        ReportView.prototype.showHTML = function (pRptno) {
            var that = this;
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var sett = sap.ui.getCore().getModel("settings").getData();
            var rep = this.reports[rptNo];
            var html = "";
            that.view.colData = {};
            that.view.reportsData = {
                report_info: { report_name: Util.nvl(Util.getLangDescrAR(rep.title, rep.title2), "Query") }
            };
            var ht = "<div class='company'>" + sett["COMPANY_NAME"] + "</div> " +
                "<div class='reportTitle'>" + Util.getLangDescrAR(rep.title, rep.title2) +
                "</div>";

            for (var q in rep.db) {
                if (rep.db[q].showType == FormView.QueryShowType.QUERYVIEW) {
                    ht = ht + rep.db[q].obj.getHTMLTable(that.view, "para", false);
                } else if (rep.db[q].showType == FormView.QueryShowType.FORM) {
                    var flds = rep.db[q].fields;
                    for (var f in flds) {
                        if (flds[f].hasOwnProperty("onPrintField") && flds[f].onPrintField != undefined)
                            ht = ht + flds[f].onPrintField();
                        else
                            ht = ht + "<b>" + flds[f].title + " : </b>" + " " + UtilGen.getControlValue(flds[f].obj) + "<br>";
                    }
                }
            }

            if (ht != "") {
                var newWin = window.open("");
                var dir = UtilGen.DBView.sLangu == "AR" ? " style=\" direction:rtl;\"" : "";
                ht = "<html" + dir + ">" + ht + "</html>";
                newWin.document.write(ht);
                $("<link>", { rel: "stylesheet", href: "css/print.css" }).appendTo(newWin.document.head);
                setTimeout(function () {
                    newWin.print();
                }, 1000);
            }

        };
        ReportView.prototype.showXLS = function (pRptno) {
            var that = this;
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var sett = sap.ui.getCore().getModel("settings").getData();
            var rep = this.reports[rptNo];
            var html = "";
            that.view.colData = {};
            that.view.reportsData = {
                report_info: { report_name: Util.nvl(Util.getLangDescrAR(rep.title, rep.title2), "Query") }
            };
            var ht = "<div class='company'>" + sett["COMPANY_NAME"] + "</div> " +
                "<div class='reportTitle'>" + Util.getLangDescrAR(rep.title, rep.title2) +
                "</div>";

            for (var q in rep.db) {
                if (rep.db[q].showType == FormView.QueryShowType.QUERYVIEW) {
                    ht = ht + rep.db[q].obj.getHTMLTable(that.view, "para", false);
                } else if (rep.db[q].showType == FormView.QueryShowType.FORM) {
                    var flds = rep.db[q].fields;
                    for (var f in flds) {
                        if (flds[f].hasOwnProperty("onPrintField") && flds[f].onPrintField != undefined)
                            ht = ht + flds[f].onPrintField();
                        else
                            ht = ht + "<b>" + flds[f].title + " : </b>" + " " + UtilGen.getControlValue(flds[f].obj) + "<br>";
                    }
                }
            }

            if (ht != "")
                var sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(ht));
        };


        ReportView.prototype.parseParas = function (rptno, strParas, pStrSep) {
            var that = this;
            if (rptno == undefined || strParas == undefined) return;
            var rptCode = this.reports[rptno].code;
            var strSep = Util.nvl(pStrSep, ",");
            var tokens = strParas.split(strSep);
            // first copy all paras in savedParas
            var exerep = false;
            for (var i in tokens) {
                var tk = tokens[i].split("=");

                var pr = tk[0].replace("para_", "");
                var vl = tk[1];
                if (tk[0].startsWith("para_")) {

                    if (pr == "PARAFORM") {
                        if (vl.toUpperCase() == "TRUE")
                            this.reportVars.showParaForm = true;
                        else
                            this.reportVars.showParaForm = false;
                    } else if (pr == "CLEAR_REP") {
                        if (vl.toUpperCase() == "TRUE")
                            this.reportVars.clearReportImmediate = true;
                        else
                            this.reportVars.clearReportImmediate = false;
                    }
                    else if (pr == "HIDE_TEMPL") {
                        if (vl.toUpperCase() == "TRUE")
                            this.reportVars.hideTemplates = true;
                        else
                            this.reportVars.hideTemplates = false;

                    }
                    /*else if (pr == "EXEC_REP") {
                        if (vl.toUpperCase() == "TRUE")
                            this.reportVars.hideTemplates = true;
                        else
                            this.reportVars.hideTemplates = false;
                        exerep = true;
                    }*/

                }
                else if (!pr.startsWith("filter_") && this.objs[rptCode + "@" + pr] != undefined) {
                    var parType = this.objs[rptCode + "@" + pr].data_type;

                    if (parType == FormView.DataType.Date) {
                        vl = vl.replace("@", "");
                        vl = vl.substr(3, 2) + "/" + vl.substr(0, 2) + "/" + vl.substr(6);
                        vl = new Date(vl);
                    }
                    if (parType == FormView.DataType.Number)
                        vl = new parseFloat(vl);
                    this.savedParas[pr] = vl;
                    this.setFieldValue(rptCode + "@" + pr, vl, vl, true);
                } else if (this.getFieldValue(rptCode + "@parameter." + pr) != undefined) {
                    this.setFieldValue(rptCode + "@parameter." + pr, vl, vl, true);
                }
            }

            /// for filter string
            var fltstr = "";
            for (var i in tokens) {
                if (tokens[i].startsWith("filter_")) {
                    var pr = tokens[i].replace(/filter_/g, "");
                    fltstr += pr
                }
                if (this.filterData != undefined)
                    this.filterData[rptno] = fltstr;
            }

        }


        return ReportView;
    }
)
    ;



