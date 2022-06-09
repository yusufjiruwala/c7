sap.ui.define("sap/ui/ce/generic/ReportView", ["./QueryView"],
    function (QueryView) {
        'use strict';

        function ReportView(pg) {
            this.pg = pg;
            this.objs = {};
            this.savedParas = {};
            this.selectedRep = "";
            this.repStr = "";
            // this.rep = {};
            this.timeInLong = (new Date()).getTime();
            this.defaultParas = {};
            this.reportVars = {
                showParaForm: true

            }
        };

        ReportView.ObjTypes = {
            PARAMETER: "parameter",
            QUERY: "query",
            FIELD: "field",
            COMMAND_BUTTON: "command_button",
            CANVAS: "canvas",
            LISTS: "lists",

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
            throw  msg;
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
            this.title = json.title;
            for (var r = 0; r < rps.length; r++) {
                var rep = {};
                rep.name = rps[r].name;
                rep.code = rps[r].code;
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
                    pm.rep = rps[r];
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
                    qr.objType = ReportView.ObjTypes.QUERY;
                    qr.applyCol = Util.nvl(qrys[i].applyCol, "");
                    qr.name = Util.nvl(qrys[i].name, "");
                    qr.parent = Util.nvl(qrys[i].parent, "");
                    qr.code = Util.nvl(qrys[i].code, "");
                    qr.title = Util.nvl(qrys[i].title, "");
                    qr.type = qrys[i].type;
                    qr.dml = Util.nvl(qrys[i].dml, "");
                    qr.main_query = qrys[i].main_query;
                    qr.eventCalc = Util.nvl(qrys[i].eventCalc, undefined);
                    qr.dispRecords = Util.nvl(qrys[i].dispRecords, 10);
                    qr.fields = {};
                    qr.summary = {};
                    qr.rep = rps[r];
                    qr.execOnShow = Util.nvl(qrys[i].execOnShow, false);
                    qr.obj = undefined;
                    qr.beforeLoadQry = Util.nvl(qrys[i].beforeLoadQry, undefined);
                    qr.onCustomValueFields = Util.nvl(qrys[i].onCustomValueFields, undefined);
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
                        fd.canvas = "default_canvas";
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
                        fd.grouped = Util.nvl(met[f].grouped, false);
                        fd.commandLinkClick = Util.nvl(met[f].commandLinkClick, undefined);
                        fd.onPrintField = Util.nvl(met[f].onPrintField, undefined);
                        fd.beforeAddObject = Util.nvl(met[f].beforeAddObject, undefined);
                        fd.afterAddOBject = Util.nvl(met[f].afterAddOBject, undefined);
                        fd.onSetField = Util.nvl(met[f].onSetField, undefined);
                        fd.rep = rps[r];
                        qr.fields[met[f].colname] = fd;
                        this.objs[rps[r].code + "@" + fd.name] = fd;
                    }
                    rep.db.push(qr);
                    this.objs[rps[r].code + "@" + qrys[i].name] = qr;


                }
                // canvases
                rep.canvases = [{name: "para_canvas", obj: undefined, objType: FormView.ObjTypes.CANVAS},
                    {name: "default_canvas", obj: undefined, objType: FormView.ObjTypes.CANVAS}];

                this.objs["para_canvas"] = rep.canvases[0];
                this.objs["default_canvas"] = rep.canvases[1];

                var cnvs = Util.nvl(rps[r].rep.canvases, []);
                for (var i in cnvs) {
                    var cnv = {};
                    this._duplicate_para(cnvs[i].name);
                    cnv.name = cnvs[i].name;
                    cnv.obj = Util.nvl(cnvs[i].obj, undefined);
                    cnv.objType = FormView.ObjTypes.CANVAS;
                    rep.canvases.push(cnv);

                    this.objs[cnvs[i].name] = cnv;
                }
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

        ReportView.prototype.createView = function (clearPage, pRptNo) {
            var thatForm = this;
            var rptNo = Util.nvl(pRptNo, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];

            if (this.pg == undefined)
                this.err("No page is declared !");

            this.view = Util.nvl(this.view, this.pg.getParent());
            if (this.view == undefined)
                this.err("No View is defined  !");

            this.sc = undefined;
            this.dispCanvases = {};
            var scrollObjs = [];
            this.defaultCommands = {};
            this.firstObj = undefined;
            var groupCol = false;
            this.reportMenus = [...rep.print_templates];
            this.bt_Reports.setVisible(this.reportMenus.length > 0);

            if (Util.nvl(clearPage, false)) {
                UtilGen.clearPage(this.pg);
            }


            var flds = rep.parameters;
            if (this.lstRepGroups != undefined)
                this.lstRepGroups.destroy();
            this.lstRepGroups = undefined;
            for (var f in flds)
                if (Util.nvl(flds[f].canvas, "") != "") {
                    this.dispCanvases[flds[f].canvas]
                        = Util.nvl(this.dispCanvases[flds[f].canvas],
                        []);
                    var set = {};
                    if (flds[f].display_width != "")
                        set["layoutData"] = new sap.ui.layout.GridData({span: flds[f].display_width})
                    // if (flds[f].dispInPara)
                    //     set["visible"] = false;
                    if (Object.keys(flds[f].other_settings).length > 0) {
                        set = {...set, ...flds[f].other_settings};
                    }
                    // if (flds[f].obj == undefined) {
                    flds[f].dataSetDone = undefined;
                    flds[f].obj = UtilGen.addControl(this.dispCanvases[flds[f].canvas],
                        flds[f].title, eval(flds[f].class_name),
                        "rep" + rptNo + "_" + flds[f].name.replace(".", '') + this.timeInLong,
                        set, flds[f].data_type,
                        flds[f].display_format, this.view, undefined, flds[f].list);
                    // this.dispCanvases[flds[f].canvas].push(flds[f].obj);
                    flds[f].obj.addStyleClass(flds[f].display_style);

                    if (this.savedParas[flds[f].colname] != undefined) {
                        try {
                            thatForm.setFieldValue(flds[f], this.savedParas[flds[f].colname], this.savedParas[flds[f].colname], true);
                        } catch (e) {
                        }
                    }
                    else if (Util.nvl(flds[f].default_value, "") != "") {
                        var vl = Util.nvl(UtilGen.parseDefaultValue(flds[f].default_value), '');
                        thatForm.setFieldValue(flds[f], vl, vl, true);
                    }

                    if (this.firstObj == undefined && flds[f].obj instanceof sap.m.InputBase)
                        this.firstObj = flds[f].obj;
                    if (flds[f].obj instanceof sap.m.Text) {
                        flds[f].obj.setValue = function (vl) {
                            this.setText(vl);
                        }
                        flds[f].obj.getValue = function (vl) {
                            return this.getText();
                        }

                    }

                    // } else {
                    //     this.dispCanvases[flds[f].title];
                    //     this.dispCanvases[flds[f].canvas].push(flds[f].obj);
                    // }
                }


            for (var q in rep.db) {
                if (rep.db[q].showType == FormView.QueryShowType.FORM) {
                    var flds = rep.db[q].fields;
                    for (var f in flds)
                        if (Util.nvl(flds[f].canvas, "") != "") {
                            this.dispCanvases[flds[f].canvas]
                                = Util.nvl(this.dispCanvases[flds[f].canvas],
                                []);
                            var set = {};
                            if (flds[f].display_width != "")
                                set["layoutData"] = new sap.ui.layout.GridData({span: flds[f].display_width})
                            if (Object.keys(flds[f].other_settings).length > 0) {
                                set = {...set, ...flds[f].other_settings};
                            }

                            // trigger before adding object
                            if (flds[f].hasOwnProperty("beforeAddObject") && flds[f].beforeAddObject != undefined)
                                flds[f].beforeAddObject();
                            flds[f].dataSetDone = undefined;
                            flds[f].obj = UtilGen.addControl(this.dispCanvases[flds[f].canvas],
                                flds[f].title, eval(flds[f].class_name),
                                "rep" + rptNo + flds[f].name.replace(".", '') + this.timeInLong,
                                set, flds[f].data_type,
                                flds[f].display_format, this.view, undefined, flds[f].list);

                            // trigger after adding object
                            if (flds[f].hasOwnProperty("afterAddOBject") && flds[f].afterAddOBject != undefined)
                                flds[f].afterAddOBject();
                            if (flds[f].hasOwnProperty("onSetField") && flds[f].onSetField != undefined)
                                flds[f].obj.onSetField = flds[f].onSetField;


                            flds[f].obj.addStyleClass(flds[f].display_style);
                            if (this.firstObj == undefined && flds[f].obj instanceof sap.m.InputBase)
                                this.firstObj = flds[f].obj;
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
                } else if (rep.db[q].showType == FormView.QueryShowType.QUERYVIEW) {
                    var qr = rep.db[q];
                    qr.obj = new QueryView(qr.name + "_" + this.timeInLong);

                    if (Util.nvl(qr.parent, "") != "") {
                        qr.obj.mColCode = qr.code;
                        qr.obj.mColName = qr.title;
                        qr.obj.mColParent = qr.parent;
                        qr.obj.switchType("tree");
                    }


                    qr.obj.getControl().view = this.view;
                    qr.obj.getControl().addStyleClass("sapUiSizeCondensed reportTable");
                    qr.obj.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
                    qr.obj.getControl().setSelectionMode(sap.ui.table.SelectionMode.None);
                    qr.obj.getControl().setAlternateRowColors(false);
                    qr.obj.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);

                    if (Util.nvl(qr.dispRecords, -1) == -1) {
                        qr.obj.getControl().setVisibleRowCount(12);
                        setTimeout(function () {
                            var h = thatForm.pg.$().height();
                            var rowHeight = Util.nvl(qr.obj.getControl().getRowHeight(), 25);
                            if (rowHeight == 0) rowHeight = 25;
                            // var fs = (thatForm.objs["default_canvas"].obj == undefined ? 0 :
                            //     thatForm.objs["default_canvas"].obj.$().height());
                            // h = h - fs;
                            // h = h - 100;
                            if (h < 0) return;
                            if (qr.obj.getControl().getAggregation("rows")[0] != undefined)
                                rowHeight = $(qr.obj.getControl().getAggregation("rows")[0].getDomRef()).height();
                            var sTop = $("#" + qr.obj.getControl().getId()).offset().top;
                            h = h - (rowHeight * 3);
                            var rows = Math.trunc((h - sTop) / rowHeight);

                            //
                            // var r = 12;
                            // r = (h > 400 && h < 500 ? 12 :
                            //     h > 500 && h < 630 ? 18 :
                            //         h > 630 && h < 800 ? 21 :
                            //             h > 800 && h < 1000 ? 30 :
                            //                 h > 1000 ? 30 : 12);
                            qr.obj.getControl().setVisibleRowCount(rows);
                        }, 600);
                    }
                    else
                        qr.obj.getControl().setVisibleRowCount(Util.nvl(qr.dispRecords, 12));

                    qr.obj.editable = false;
                    if (Util.nvl(qr.execOnShow, false))
                        thatForm.loadQueryView(qr, true);

                    if (Object.keys(qr.fields).length > 0 && qr.fields[Object.keys(qr.fields)[0]].grouped) {

                        this.lstRepGroups = UtilGen.createControl(sap.m.ComboBox, this.view, "lstRepGroup" + this.timeInLong, {
                            customData: [{key: ""}],
                            width: "40%",
                            items: {
                                path: "/",
                                template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                                templateShareable: true
                            },
                            selectionChange: function (event) {
                                thatForm.doQuickFilterData(qr);
                            }
                        }, "string", undefined, undefined, "@");
                        this.lstRepGroups.addStyleClass("reportTable");
                        // Util.fillCombo(this.lstRepGroups, cdt);
                        scrollObjs.push(this.lstRepGroups);
                    }

                    scrollObjs.push(qr.obj.getControl());

                    if (this.firstObj == undefined)
                        this.firstObj = qr.obj.getControl();
                    qr.sumObj = undefined;
                    var flds = rep.db[q].summary;
                    var fe = [];

                    if (qr.summary != undefined)
                        for (var f in flds) {
                            var set = {};
                            if (flds[f].display_width != "")
                                set["layoutData"] = new sap.ui.layout.GridData({span: flds[f].display_width})
                            if (Object.keys(flds[f].other_settings).length > 0) {
                                set = {...set, ...flds[f].other_settings};
                            }
                            // if (flds[f].obj == undefined) {
                            flds[f].dataSetDone = undefined;
                            flds[f].obj = UtilGen.addControl(fe,
                                flds[f].title, eval(flds[f].class_name),
                                "rep" + rptNo + flds[f].name.replace(".", '') + this.timeInLong,
                                set, flds[f].data_type,
                                flds[f].display_format, this.view, undefined, flds[f].list);
                            flds[f].obj.addStyleClass(flds[f].display_style);
                            // }
                        }

                    qr.sumObj = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
                    qr.sumObj.setToolbar(undefined);
                    qr.sumObj.destroyToolbar();
                    scrollObjs.push(qr.sumObj);
                }
            }

            if (Util.nvl(this.dispCanvases["para_canvas"], []).length > 0)
                this.dispCanvases["para_canvas"].push(new sap.m.Button({
                    width: "100px",
                    text: "Details", press: function () {
                        thatForm.loadData();
                    }
                }));

            if (Util.nvl(this.dispCanvases["para_canvas"], []).length > 0)
                this.objs["para_canvas"].obj = UtilGen.formCreate("", true, this.dispCanvases["para_canvas"], undefined, undefined, [1, 1, 1]);

            if (Util.nvl(this.dispCanvases["default_canvas"], []).length > 0)
                this.objs["default_canvas"].obj = UtilGen.formCreate("", true, this.dispCanvases["default_canvas"], undefined, undefined, [1, 1, 1]);

            // if (Util.nvl(clearPage, false)) {
            //     UtilGen.clearPage(this.pg);
            // }
            this.sc = new sap.m.ScrollContainer();

            if (Util.nvl(this.dispCanvases["para_canvas"], []).length > 0)
                this.sc.addContent(this.objs["para_canvas"].obj);

            if (Util.nvl(this.dispCanvases["default_canvas"], []).length > 0)
                this.sc.addContent(this.objs["default_canvas"].obj);

            this.pg.addContent(this.sc);

            if (Util.nvl(this.dispCanvases["para_canvas"], []).length > 0) {
                this.objs["para_canvas"].obj.setToolbar(undefined);
                this.objs["para_canvas"].obj.destroyToolbar();
            }

            if (Util.nvl(this.dispCanvases["default_canvas"], []).length > 0) {
                this.objs["default_canvas"].obj.setToolbar(undefined);
                this.objs["default_canvas"].obj.destroyToolbar();
            }

            // this.objs["default_canvas"].obj.getToolbar().addContent(this.lstRep);

            // if (this.dispCanvases["dispInPara"].length > 0) {
            this.txtFilter = new sap.m.Text().addStyleClass("redText smallFont");

            Util.destroyID("adv" + this.timeInLong, this.view);
            var tx = new sap.m.Button(this.view.createId("adv" + this.timeInLong), {
                text: "Setup..",
                icon: "sap-icon://settings",
                press: function (ev) {
                    thatForm.showDispInPara(this);
                }
            }).addStyleClass("linkLabel darkBlueText");
            //
            // tx.attachBrowserEvent("click", function (oEvent) {
            //     thatForm.showDispInPara(this);
            // });

            this.tbMain.addContentLeft(tx);

            // sap.m.MessageToast.show(UtilGen.getControlValue(this.txtFilter));

            // var tb = new sap.m.Toolbar({
            //         content: [
            //             // tx,
            //             new sap.m.ToolbarSpacer(),
            //             this.txtFilter,
            //             new sap.m.Text({width: "100px"})
            //
            //         ]
            //     }
            // );

            // this.sc.addContent(tb);
            // this.sc.addContent(this.txtFilter);

            if (thatForm.reportVars.showParaForm && Util.nvl(this.dispCanvases["para_canvas"], []).length == 0)
                setTimeout(function () {
                    thatForm.showDispInPara(tx, undefined, true);
                }, 100);

            // }


            for (var i in scrollObjs)
                this.sc.addContent(scrollObjs[i]);


            Util.navEnter(this.dispCanvases["default_canvas"], function (lastObj) {
                thatForm.firstObj.focus();
            });

            // focus on first object after showing form
            if (this.firstObj != undefined) {
                this.pg.addEventDelegate({
                    onAfterShow: function (evt) {
                        setTimeout(function () {
                            thatForm.firstObj.focus();
                        }, 700);
                    },
                });
            }
        }
        ;

        ReportView.prototype.loadData = function (qryName, pRptno, strParas, pFetchQueryFromServer) {
            var qryObj = undefined;
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            var fetchQryServer = Util.nvl(pFetchQueryFromServer, true);
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;
            var qrys = (qryObj != undefined ? [qryObj] : rep.db);

            this.reportVars.showParaForm = true;

            if (strParas != undefined)
                this.parseParas(rptNo, strParas);

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
                    this.saveParas(qryObj);
                    this.fillQuickFilterData(qryObj);
                } else if (!fetchQryServer && qryObj.showType == FormView.QueryShowType.QUERYVIEW)
                    qryObj.obj.updateDataToControl();


            }
        };

        ReportView.prototype.fetchQuery = function (qryName, execBeforeSql) {
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            if (qryObj == undefined && qryObj.objType != FormView.ObjTypes.QUERY)
                this.err("Cant fetch query on  " + qryName);

            var sql = this.parseString(qryObj.dml);
            if (Util.nvl(execBeforeSql, false))
                sql = qryObj.beforeLoadQry(sql, qryObj);
            sql = this.parseString(sql);
            if (sql != "") {
                var dt = Util.execSQL(sql);
                if (dt.ret == "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    if (dtx.length > 0)
                        this._loadDataFromJson(qryObj, dtx[0], true);

                }
            } else if (qryObj.hasOwnProperty("onCustomValueFields") && qryObj.onCustomValueFields != undefined)
                qryObj.onCustomValueFields(qryObj);

            if (sql == "")
                for (var key in qryObj.fields) {
                    if (qryObj.fields[key].obj != undefined && qryObj.fields[key].hasOwnProperty("onSetField") &&
                        qryObj.fields[key].onSetField != undefined)
                        qryObj.fields[key].onSetField("User");

                }

        };

        ReportView.prototype._loadDataFromJson = function (qry, dtx, executeChange) {
            var subs = qry.fields;
            for (var key in subs) {
                var vl = dtx[key.toUpperCase()];
                if (subs[key].obj != undefined)
                    UtilGen.setControlValue(subs[key].obj, "", "", false);
                if (subs[key].obj != undefined && vl != undefined)
                    UtilGen.setControlValue(subs[key].obj, vl, vl, Util.nvl(executeChange, false));

            }

        };

        ReportView.prototype.fillQuickFilterData = function (qryName, pRptno) {
            var that = this;
            var qr = undefined;
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            if (typeof qryName == "string")
                qr = this.objs[qryName];
            else qr = qryName;

            if (this.lstRepGroups != undefined) {
                var cdt = [];
                var ld = qr.obj.mLctb;
                var lastVal = "";
                cdt.push({CODE: "", NAME: "ALL"});
                for (var l = 0; l < ld.rows.length; l++) {

                    var cd = {CODE: "", NAME: ""};
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
                Util.fillCombo(this.lstRepGroups, cdt);
                this.lstRepGroups.setSelectedItem(this.lstRepGroups.getItems()[0]);
            }

        };
        ReportView.prototype.doQuickFilterData = function (qryName, pRptno) {
            var that = this;
            var qr = undefined;
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            if (typeof qryName == "string")
                qr = this.objs[qryName];
            else qr = qryName;
            var flt = "";
            if (this.lstRepGroups != undefined) {
                var lval = UtilGen.getControlValue(this.lstRepGroups);
                if (lval != 'ALL' && lval != "")
                    flt = qr.obj.mLctb.cols[0].mColName + "=" + lval;
            }
            // this.filterData = {};
            var newFlt = "";

            if (Util.nvl(this.filterData[rptNo], "") != "") {
                var spl = this.filterData[rptNo].split("&&");

                for (var i in spl)
                    if (spl[i].trim() != "" && !spl[i].trim().startsWith(qr.obj.mLctb.cols[0].mColName))
                        newFlt = newFlt.trim() + (newFlt.trim() != "" ? " && " : "") + spl[i].trim();
            }

            this.filterData[rptNo] = newFlt.trim() + (newFlt.trim() != "" ? " && " : "") + flt;

            qr.obj.mViewSettings["filterStr"] = this.filterData[this.reports[rptNo].db.indexOf(qr)];
            qr.obj.updateDataToControl();
            // this.loadQueryView(qr);
        };
        ReportView.prototype.loadQueryView = function (qryObj) {
            var thatForm = this;
            if (qryObj.showType != FormView.QueryShowType.QUERYVIEW)
                return;
            if (qryObj.obj == undefined)
                return;
            var sq = qryObj.dml;
            if (qryObj.hasOwnProperty("beforeLoadQry") && qryObj.beforeLoadQry != undefined)
                sq = qryObj.beforeLoadQry(sq, qryObj);
            sq = this.parseString(sq);
            Util.doAjaxJson("sqlmetadata?saveQryName=" + qryObj.rep.code + "@" + qryObj.name, {sql: sq}, false).done(function (data) {
                if (data.ret == "SUCCESS") {
                    qryObj.obj.setJsonStrMetaData("{" + data.data + "}");
                    if (Util.nvl(qryObj.applyCol, "") != "") {
                        // UtilGen.applyCol();
                        if (qryObj.when_validate_field != undefined) {
                            var ld = qryObj.obj.mLctb;
                            for (var fi = 0; fi < ld.cols.length; fi++)
                                ld.cols[fi].whenValidate = qryObj.when_validate_field;
                        }
                        if (qryObj.eventCalc != undefined)
                            qryObj.obj.eventCalc = qryObj.eventCalc;

                        UtilGen.applyCols(qryObj.applyCol, qryObj.obj, this);
                    } else {
                        thatForm.applyColThis(qryObj);
                    }

                    if (thatForm.filterData != undefined) {
                        // var str = thatForm.filterData[qryObj.rep.rep.db.indexOf(qryObj)];
                        var str = thatForm.filterData[0];

                        qryObj.obj.mViewSettings["filterStr"] = str;
                        if (thatForm.txtFilter != undefined)
                            thatForm.txtFilter.setText(str);
                    }

                    qryObj.obj.mLctb.parse("{" + data.data + "}", true);
                    qryObj.obj.mLctb.updateRecStatus(LocalTableData.RowStatus.QUERY);
                    qryObj.obj.loadData();


                    // if (qryObj.status != FormView.RecordStatus.VIEW && Util.nvl(qryObj.addRowOnEmpty, false) && qryObj.obj.mLctb.rows.length == 0)
                    //     qryObj.obj.addRow();
                    // if (qryObj.status == FormView.RecordStatus.VIEW)
                    //     qryObj.obj.editable = false;


                }
            });

        };

        ReportView.prototype.saveParas = function (qryName, pRptno) {
            var that = this;
            var qr = undefined;
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            if (typeof qryName == "string")
                qr = this.objs[qryName];
            else qr = qryName;
            var pars = Util.nvl(this.reports[rptNo].parameters, []);
            for (var p in pars)
                this.savedParas[pars[p].colname] = UtilGen.getControlValue(pars[p].obj);

        };

        ReportView.prototype.initView = function () {
            var str = "";
            var thatRV = this;
            var rps = Util.nvl(this.reports, []);
            for (var i = 0; i < rps.length; i++)
                str += (str.length > 0 ? "," : "") + (i + "/" + rps[i].name);
            str = "@" + str;
            var fe = [];
            this.lstRep = UtilGen.addControl(fe, "Sub Reps", sap.m.ComboBox, "subrep",
                {
                    items: {
                        path: "/",
                        template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                        templateShareable: true
                    },
                    selectionChange: function (ev) {
                        thatRV.filterData = {};
                        thatRV.createView(true);
                        thatRV.loadData();
                    }
                }, "string", undefined, this.view, undefined, str);
            this.lstRep.setSelectedItem(this.lstRep.getItems()[0]);
            this.mnus = [];
            for (var i = 0; i < rps.length; i++) {
                var mnu = new sap.m.MenuItem({
                    text: rps[i].name,
                    icon: "sap-icon://menu2",
                    customData: {key: i + ""},
                    press: function () {
                        var cd = this.getCustomData()[0].getKey();
                        UtilGen.setControlValue(thatRV.lstRep, cd, cd, true);
                        thatRV.filterData = {};
                        bt.setText(this.getText());
                        thatRV.createView(true);
                        setTimeout(function () {
                            thatRV.tbMain.$().css("background-color", "lightblue");
                        }, 100);

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
                    customData: {key: i + ""},
                    press: function () {

                        thatRV.showHTML();
                    }
                }));
            this.mnusExp.push(
                new sap.m.MenuItem({
                    text: "Excel",
                    icon: "sap-icon://excel-attachment",
                    customData: {key: i + ""},
                    press: function () {
                        thatRV.showXLS();
                    }
                }));


            var bt = new sap.m.Button({
                icon: "sap-icon://megamenu",
                text: this.lstRep.getValue(),
                press: function () {
                    thatRV.mnu.openBy(this);
                }
            });

            var bt2 = new sap.m.Button({
                icon: "sap-icon://print",
                text: "Export/Print",
                press: function () {
                    thatRV.mnuE.openBy(this);
                }
            });

            this.bt_Reports = new sap.m.Button({
                icon: "sap-icon://print",
                text: "Templates",
                visible: false,
                press: function () {
                    if (Util.nvl(thatRV.reportMenus, []).length <= 0) return;
                    var ms = thatRV.reportMenus;
                    var mnus = [];
                    for (var i in ms)
                        mnus.push(new sap.m.MenuItem({
                            text: ms[i].title,
                            icon: "sap-icon://attachment-html",
                            customData: {key: ms[i].reportFile},
                            press: function () {
                                var cd = this.getCustomData()[0].getKey();
                                thatRV.printReport(cd);
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

            this.tbMain = new sap.m.Bar({
                contentLeft: [
                    bt,
                ],
                contentMiddle: [
                    new sap.m.Title({text: this.title})
                ],
                contentRight: [
                    this.bt_Reports,
                    bt2
                ]
            }).addStyleClass("");

            this.pg.removeAllHeaderContent();
            this.pg.setShowNavButton(false);
            this.pg.setShowSubHeader(false);
            this.pg.setShowHeader(true);
            this.pg.addHeaderContent(this.tbMain);
            setTimeout(function () {
                thatRV.tbMain.$().css("background-color", "lightblue");
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
                    var blob = new Blob([this.response], {type: "application/pdf"});
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.target = "_blank";
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.download = rpt + new Date() + ".pdf";
                    link.click();
                    document.body.removeChild(link);

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
                if (dtx[col].display_type != "INVISIBLE") {
                    cx.mHideCol = false;
                    visibleCol.push(cx);
                }
                cx.mColClass = Util.nvl(dtx[col].class_name, "sap.m.Label");
                cx.mUIHelper.display_align = Util.nvl(dtx[col].display_align, "center");
                cx.mUIHelper.display_format = Util.nvl(dtx[col].display_format, "");
                cx.mUIHelper.display_width = Util.nvl(dtx[col].display_width, "30");
                cx.mUIHelper.display_style = Util.nvl(dtx[col].display_style, "");
                cx.mTitle = Util.nvl(dtx[col].title, dtx[col].colname);
                cx.mTitleParent = Util.nvl(dtx[col].parentTitle, "");
                cx.mTitleParentSpan = Util.nvl(dtx[col].parentSpan, 1);
                cx.commandLink = Util.nvl(dtx[col].commandLink, "");
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
                        vl = Util.toOraDateTimeString(vl);

                    sst = sst.replaceAll(lst[i], vl);
                }
            }
            return sst;
        };
        ReportView.prototype.getFieldValue = function (pvr) {
            var vl = undefined;
            var repCode = this.reports[UtilGen.getControlValue(this.lstRep)].code;
            var vr = repCode + "@" + pvr;

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

            return vl;

        };
        ReportView.prototype.setFieldValue = function (vr, pvl, lbl, validate) {


            var fldObj = this._findFieldObj(vr);
            if (Util.nvl(validate, false) && !this.isFieldEditable(fldObj))
                return false;
            if (fldObj != undefined)
                UtilGen.setControlValue(fldObj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
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
                    this.dispCanvases[flds[f].canvas]
                        = Util.nvl(this.dispCanvases[flds[f].canvas],
                        []);
                    var set = {};
                    if (flds[f].display_width != "")
                        set["layoutData"] = new sap.ui.layout.GridData({span: flds[f].display_width})
                    // if (flds[f].dispInPara)
                    //     set["visible"] = false;
                    if (Object.keys(flds[f].other_settings).length > 0) {
                        set = {...set, ...flds[f].other_settings};
                    }
                    var prev;
                    if (flds[f].obj != undefined) {
                        prev = UtilGen.getControlValue(flds[f].obj);
                        flds[f].obj.destroy();
                    }

                    var obj = UtilGen.addControl(fe,
                        flds[f].title, eval(flds[f].class_name),
                        "rep" + rptNo + "_" + flds[f].name.replace(".", '') + "Para" + this.timeInLong,
                        set, flds[f].data_type,
                        flds[f].display_format, this.view, undefined, flds[f].list);

                    this.dispCanvases[flds[f].canvas].push(flds[f].obj);
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
            return {metadata: md, data: data};
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
                report_info: {report_name: Util.nvl(rep.title, "Query")}
            };
            var ht = "<div class='company'>" + sett["COMPANY_NAME"] + "</div> " +
                "<div class='reportTitle'>" + rep.title +
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
                newWin.document.write(ht);
                $("<link>", {rel: "stylesheet", href: "css/print.css"}).appendTo(newWin.document.head);
                setTimeout(function () {
                    newWin.print();
                }, 1000);
            }

        };
        ReportView.prototype.showXLS = function (pRptno) {
            var that = this;
            var rptNo = Util.nvl(pRptno, UtilGen.getControlValue(this.lstRep));
            var rep = this.reports[rptNo];
            var html = "";
            that.view.colData = {};
            that.view.reportsData = {
                report_info: {report_name: Util.nvl(rep.title, "Query")}
            };

            for (var q in rep.db) {
                var ht = "";
                if (rep.db[q].showType == FormView.QueryShowType.QUERYVIEW) {
                    ht = rep.db[q].obj.getHTMLTable(that.view, "para");
                    break;
                }
            }

            if (ht != "")
                var sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(ht));
        };


        ReportView.prototype.parseParas = function (rptno, strParas) {
            var that = this;
            if (rptno == undefined || strParas == undefined) return;
            var rptCode = this.reports[rptno].code;
            var tokens = strParas.split(",");
            // first copy all paras in savedParas
            for (var i in tokens) {
                var tk = tokens[i].split("=");

                if (tk[0].startsWith("para_")) {
                    var pr = tk[0].replace("para_", "");
                    var vl = tk[1];
                    if (pr == "PARAFORM") {
                        if (vl == "TRUE")
                            this.reportVars.showParaForm = true;
                        else
                            this.reportVars.showParaForm = false;
                    } else {
                        var parType = this.objs[rptCode + "@" + pr].data_type;

                        if (parType == FormView.DataType.Date)
                            vl = new Date(vl);
                        if (parType == FormView.DataType.Number)
                            vl = new parseFloat(vl);
                        this.savedParas[pr] = vl;
                    }
                }
            }
            /// for filter string
            var fltstr = "";
            for (var i in tokens) {
                if (tokens[i].startsWith("filter_")) {
                    var pr = tokens[i].replace(/filter_/g, "");
                    fltstr += pr
                }
                this.filterData[rptno] = fltstr;
            }

        }


        return ReportView;
    }
);



