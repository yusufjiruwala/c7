sap.ui.define("sap/ui/ce/generic/FormView", ["./QueryView"],
    function (QueryView) {
        'use strict'

        function FormView(pg) {
            this.timeInLong = (new Date()).getTime();
            var that = this;
            this.mode = "new";
            this.viewCreated = false;
            this.mainCmds = [];
            this.objs = {};
            this.postInsert = undefined;
            this.preInsert = undefined;
            this.onSave = undefined;
            this.sc = undefined;
            this.dispCanvases = {};
            this.defaultCommands = {};
            this.status = FormView.RecordStatus.NEW;
            this.pg = pg;
            this.setParent(pg);
            this.forms = {};
            this.cmdButtons = {
                "cmdDel": undefined,
                "cmdSave": undefined,
                "cmdList": undefined,
                "cmdEdit": undefined,
                "cmdNew": undefined,
                "cmdPrint": undefined,
            };
        };
        FormView.err = function (msg) {
            sap.m.MessageToast.show(msg, {
                my: sap.ui.core.Popup.Dock.RightBottom,
                at: sap.ui.core.Popup.Dock.RightBottom
            });
            var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
            oMessageToastDOM.css('color', "red");
            throw msg;
        };

        FormView.QueryShowType = {
            FORM: "form",
            QUERYVIEW: "QueryView"
        };

        FormView.aligns = {
            "ALIGN_LEFT": "left",
            "ALIGN_RIGHT": "right",
            "ALIGN_CENTER": "center"
        };

        FormView.DataType = {
            "Number": "number",
            "String": "string",
            "Date": "date"

        };

        FormView.RecordStatus = {
            NEW: "new",
            EDIT: "edit",
            DELETE: "delete",
            VIEW: "view"
        };

        FormView.ClassTypes = {
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
            "VBOX": "sap.m.VBox"
        };
        FormView.ObjTypes = {
            PARAMETER: "parameter",
            QUERY: "query",
            FIELD: "field",
            COMMAND_BUTTON: "command_button",
            CANVAS: "canvas",
            LISTS: "lists",

        };
        FormView.ListTypes = {
            SQL: "sql",
            STATIC: "static"
        };

        FormView.err = function (msg, align) {
            sap.m.MessageToast.show(msg, {
                my: Util.nvl(align, sap.ui.core.Popup.Dock.CenterBottom),
                at: Util.nvl(align, sap.ui.core.Popup.Dock.CenterBottom)
            });
            var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
            oMessageToastDOM.css('color', "red");
            throw "FormView Error: " + msg;
        };

        FormView.create = function (pg) {
            var q = new FormView(pg);
            q.parentPage = pg;
            return q;
        };

        FormView.prototype.constructor = FormView;

        FormView.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        FormView.prototype.parseForm = function (json) {
            var that = this;
            if (json.form == undefined)
                return;
            this.form = {};
            this.objs = {};
            this.canvascounts = { default: 0 };

            this.form.events = {};
            var evs = Util.nvl(json.form.events, {});
            this.form.events = { ...evs };
            this.form.hideTemplates = Util.nvl(json.form.hideTemplates, false);
            this.form.print_templates = [];
            var pls = Util.nvl(json.form.print_templates, []);
            for (var i in pls) {
                var pt = {};
                pt.title = pls[i].title;
                pt.reportFile = pls[i].reportFile;
                this.form.print_templates.push(pt);
            }

            // adding parameters;
            this.form.readonly = Util.nvl(json.form.readonly, false);
            this.form.title = Util.nvl(json.form.title, "");
            this.form.customDisplay = Util.nvl(json.form.customDisplay, undefined);
            this.form.toolbarBG = Util.nvl(json.form.toolbarBG, "lightgrey");
            this.form.parameters = [];
            this.form.formSetting = Util.nvl(json.form.formSetting, {});
            var pms = Util.nvl(json.form.parameters, []);
            for (var i in pms) {
                var pm = {};
                this._duplicate_para(pms[i].para_name);
                if (pms[i].para_name == "default_canvas")
                    this.err("Cant name parameter #default_canvas !");
                pm.name = pms[i].para_name;
                pm.data_type = pms[i].data_type;
                pm.value = pms[i].value;
                pm.objType = FormView.ObjTypes.PARAMETER;
                this.form.parameters.push(pm);
                this.objs[pms[i].para_name] = pm;
            }
            // adding queries and saving for table data name
            this.form.db = [];
            var qrys = Util.nvl(json.form.db, []);
            for (var i in qrys) {
                var qr = {};
                this._duplicate_para(qrys[i].name);
                if (Util.nvl(qrys[i].name, "") == "")
                    this.err("Name is null !");

                if (qrys[i].type != "query")
                    this.err("Err !  query # " + qrys[i].name);
                qr.formview = this;
                qr.objType = FormView.ObjTypes.QUERY;
                qr.showType = Util.nvl(qrys[i].showType, FormView.QueryShowType.FORM);
                qr.applyCol = Util.nvl(qrys[i].applyCol, "");
                qr.status = "new";
                qr.addRowOnEmpty = Util.nvl(qrys[i].addRowOnEmpty, false);
                qr.name = Util.nvl(qrys[i].name, "");
                qr.type = qrys[i].type;
                qr.dml = Util.nvl(qrys[i].dml, "");
                qr.table_name = qrys[i].table_name;
                qr.where_clause = qrys[i].where_clause;
                qr.main_query = qrys[i].main_query;
                qr.labelSpan = Util.nvl(qrys[i].labelSpan, undefined);
                qr.emptySpan = Util.nvl(qrys[i].emptySpan, undefined);
                qr.columnsSpan = Util.nvl(qrys[i].columnsSpan, [1, 1, 1]);

                qr.update_exclude_fields = Util.nvl(qrys[i].update_exclude_fields, []);
                qr.insert_exclude_fields = Util.nvl(qrys[i].insert_exclude_fields, []);
                qr.insert_default_values = Util.nvl(qrys[i].insert_default_values, {});
                qr.delete_before_update = Util.nvl(qrys[i].delete_before_update, {});
                qr.update_default_values = Util.nvl(qrys[i].update_default_values, {});
                qr.when_validate_field = Util.nvl(qrys[i].when_validate_field, undefined);
                qr.before_add_table = Util.nvl(qrys[i].before_add_table, undefined);
                qr.eventCalc = Util.nvl(qrys[i].eventCalc, undefined);
                qr.edit_allowed = Util.nvl(qrys[i].edit_allowed, true);
                qr.insert_allowed = Util.nvl(qrys[i].insert_allowed, true);
                qr.delete_allowed = Util.nvl(qrys[i].delete_allowed, true);
                qr.fields = {};
                qr.summary = {};
                qr.obj = undefined;
                //ADDING FIELDS
                if (qrys[i].fields == undefined && qr.dml != "") {
                    Util.doAjaxJson("sqlmetadata", { sql: qr.dml }, false).done(function (data) {
                        if (data.ret == "SUCCESS") {
                            var met = JSON.parse("{" + data.data + "}").metadata;
                            for (var f in met) {
                                var fd = {};
                                that._duplicate_para(qrys[i].name + "." + met[f].colname);
                                fd.colname = met[f].colname;
                                fd.objType = FormView.ObjTypes.FIELD;
                                fd.query_name = qrys[i].name;
                                fd.name = qrys[i].name + "." + met[f].colname;
                                fd.data_type = met[f].data_type;
                                fd.class_name = "TEXTFIELD";
                                fd.require = Util.nvl(met[f].require, false);
                                fd.class_type = sap.m.Input;
                                fd.obj = undefined;
                                fd.list = Util.nvl(met[f].list, "");
                                fd.title = Util.nvl(met[f].descr, met[f].colname);
                                fd.title2 = Util.nvl(met[f].descrar, met[f].colname);
                                fd.canvas = "default_canvas";
                                fd.display_width = Util.nvl(met[f].display_width, "");
                                fd.display_align = Util.nvl(met[f].display_align, "").replace("ALIGN_", "").toLowerCase();
                                fd.display_style = Util.nvl(met[f].display_style, "");
                                fd.display_format = Util.nvl(met[f].display_format, "");
                                fd.default_value = Util.nvl(met[f].default_value, "");
                                fd.other_settings = Util.nvl(met[f].other_settings, {});
                                fd.edit_allowed = Util.nvl(met[f].edit_allowed, true);
                                fd.insert_allowed = Util.nvl(met[f].insert_allowed, true);
                                qr.fields[met[f].colname] = fd;
                                that.objs[fd.name] = fd;
                            }
                        }
                    });
                } else {  // adding user based fields
                    var met = qrys[i].fields;
                    for (var f in met) {
                        var fd = {};
                        this._duplicate_para(qrys[i].name + "." + met[f].colname);
                        fd.objType = FormView.ObjTypes.FIELD;
                        fd.query_name = qrys[i].name;
                        fd.colname = met[f].colname;
                        fd.name = qrys[i].name + "." + met[f].colname;
                        fd.data_type = met[f].data_type;
                        fd.class_name = Util.nvl(met[f].class_name, "TEXTFIELD");
                        // fd.class_type = sap.m.Input;
                        fd.title = Util.nvl(met[f].title, fd.colname);
                        fd.title2 = Util.nvl(met[f].title2, fd.colname);
                        fd.canvas = "default_canvas";
                        fd.list = Util.nvl(met[f].list, "");
                        fd.require = Util.nvl(met[f].require, false);
                        fd.display_width = Util.nvl(met[f].display_width, "");
                        fd.display_align = Util.nvl(met[f].display_align, "").replace("ALIGN_", "").toLowerCase();
                        fd.display_style = Util.nvl(met[f].display_style, "");
                        fd.display_format = Util.nvl(met[f].display_format, undefined);
                        fd.other_settings = Util.nvl(met[f].other_settings, {});
                        fd.edit_allowed = Util.nvl(met[f].edit_allowed, true);
                        fd.insert_allowed = Util.nvl(met[f].insert_allowed, true);
                        fd.default_value = Util.nvl(met[f].default_value, "");
                        fd.showValueHelp = Util.nvl(met[f].showValueHelp, "");
                        fd.trueValues = Util.nvl(met[f].trueValues, undefined);
                        qr.fields[met[f].colname] = fd;

                        this.objs[fd.name] = fd;
                    }
                }
                if (qrys[i].summary != undefined) {
                    var met = qrys[i].summary;
                    for (var f in met) {
                        var fd = {};
                        this._duplicate_para(qrys[i].name + "." + met[f].colname);
                        fd.objType = FormView.ObjTypes.FIELD;
                        fd.query_name = qrys[i].name;
                        fd.colname = met[f].colname;
                        fd.name = qrys[i].name + "." + met[f].colname;
                        fd.data_type = met[f].data_type;
                        fd.class_name = Util.nvl(met[f].class_name, "TEXTFIELD");
                        // fd.class_type = sap.m.Input;
                        fd.title = Util.nvl(met[f].title, fd.colname);
                        fd.title2 = Util.nvl(met[f].title2, fd.colname);
                        fd.canvas = "default_canvas";
                        fd.list = Util.nvl(met[f].list, "");
                        fd.require = Util.nvl(met[f].require, false);
                        fd.display_width = Util.nvl(met[f].display_width, "");
                        fd.display_align = Util.nvl(met[f].display_align, "").replace("ALIGN_", "").toLowerCase();
                        fd.display_style = Util.nvl(met[f].display_style, "");
                        fd.display_format = Util.nvl(met[f].display_format, undefined);
                        fd.other_settings = Util.nvl(met[f].other_settings, {});
                        fd.edit_allowed = Util.nvl(met[f].edit_allowed, true);
                        fd.insert_allowed = Util.nvl(met[f].insert_allowed, true);
                        fd.showValueHelp = Util.nvl(met[f].showValueHelp, "");
                        qr.summary[met[f].colname] = fd;
                        this.objs[fd.name] = fd;
                    }
                }

                this.form.db.push(qr);
                this.objs[qrys[i].name] = qr;


            }
            // canvases
            this.form.canvases = [{ name: "default_canvas", obj: undefined, objType: FormView.ObjTypes.CANVAS }];
            this.objs["default_canvas"] = this.form.canvases[0];
            var cnvs = Util.nvl(json.form.canvases, []);

            for (var i in cnvs) {
                var cnv = {};
                this._duplicate_para(cnvs[i].name);
                cnv.name = cnvs[i].name;
                cnv.obj = Util.nvl(cnvs[i].obj, undefined);
                cnv.objType = FormView.ObjTypes.CANVAS;
                this.form.canvases.push(cnv);

                this.objs[cnvs[i].name] = cnv;
            }
            // commands .
            this.form.commands = [];
            var cmds = Util.nvl(json.form.commands, []);

            for (var i in cmds) {
                var cmd = {};
                this._duplicate_para(cmds[i].name);
                cmd.name = cmds[i].name;
                cmd.canvas = Util.nvl(cmds[i].canvas, "default_canvas");
                cmd.title = cmds[i].title;
                cmd.objType = FormView.ObjTypes.COMMAND_BUTTON;
                cmd.obj = Util.nvl(cmds[i].obj, undefined);
                cmd.onPress = Util.nvl(cmds[i].onPress, undefined);
                cmd.list_name = Util.nvl(cmds[i].list_name, undefined);
                this.form.commands.push(cmd);
                this.objs[cmds[i].name] = cmd;
            }

            this.form.lists = [];
            var lsts = Util.nvl(json.form.lists, []);
            for (var i in lsts) {
                var lst = {};
                this._duplicate_para(lsts[i].name);
                lst.name = lsts[i].name;
                lst.title = lsts[i].title;
                lst.list_type = lsts[i].list_type;
                lst.cols = lsts[i].cols;  // [{colname:'code',width:'100',return_field:'pac' }]
                lst.objType = FormView.ObjTypes.LISTS;
                lst.sql = lsts[i].sql;
                lst.obj = undefined;
                lst.mLctb = undefined;
                lst.afterSelect = Util.nvl(lsts[i].afterSelect, undefined);
                this.form.lists.push(lst);
                this.objs[lsts[i].name] = lst;

            }


            console.log(this.form);
        };
        FormView.prototype._duplicate_para = function (name) {
            if (Object.keys(this.objs).indexOf(name) > -1)
                this.err(name + " duplicate found !");

        };
        FormView.prototype.err = function (msg) {
            sap.m.MessageToast.show("FormView Error " + msg, {
                my: sap.ui.core.Popup.Dock.RightBottom,
                at: sap.ui.core.Popup.Dock.RightBottom
            });
            var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
            oMessageToastDOM.css('color', "red");
            throw "FormView Error: " + msg;
        };

        FormView.prototype.createView = function () {
            var thatForm = this;
            if (this.pg == undefined)
                this.err("No page is declared !");

            this.view = Util.nvl(this.view, this.pg.getParent());
            if (this.view == undefined)
                this.err("No View is defined  !");
            this.initView();
            this.sc = undefined;
            this.dispCanvases = {};
            var scrollObjs = [];
            var scrollObjs1 = [];
            this.defaultCommands = {};
            this.reportMenus = thatForm.form.hideTemplates ? [] : [...thatForm.form.print_templates];
            this.firstObj = undefined;
            // thatForm.txtMsg = new sap.m.Text({width: "100%"}).addStyleClass("redMiniText");
            // scrollObjs1.push(thatForm.txtMsg);
            for (var q in this.form.db) {
                if (this.form.db[q].showType == FormView.QueryShowType.FORM) {
                    var flds = this.form.db[q].fields;
                    for (var f in flds)
                        if (Util.nvl(flds[f].canvas, "") != "") {
                            this.dispCanvases[flds[f].canvas]
                                = Util.nvl(this.dispCanvases[flds[f].canvas],
                                    []);
                            var set = {};
                            if (flds[f].display_width != "")
                                set["layoutData"] = new sap.ui.layout.GridData({ span: flds[f].display_width })
                            if (Object.keys(flds[f].other_settings).length > 0) {
                                set = { ...set, ...flds[f].other_settings };
                            }
                            if (flds[f].obj == undefined) {
                                flds[f].obj = UtilGen.addControl(this.dispCanvases[flds[f].canvas],
                                    flds[f].title, eval(flds[f].class_name),
                                    flds[f].name.replace(".", '') + this.timeInLong,
                                    set, flds[f].data_type,
                                    flds[f].display_format, this.view, undefined, flds[f].list);
                                if (set.hasOwnProperty("trueValues"))
                                    flds[f].obj.trueValues = set["trueValues"];
                                if (flds[f].hasOwnProperty("trueValues"))
                                    flds[f].obj.trueValues = flds[f].trueValues;

                                if (flds[f].obj instanceof sap.m.Input && flds[f].obj.getShowValueHelp()) {
                                    flds[f].obj.attachBrowserEvent("keydown", function (oEvent) {
                                        if (oEvent.key == 'F9') {
                                            this.fireValueHelpRequest(oEvent);
                                        }
                                    });
                                }
                                // this.dispCanvases[flds[f].canvas].push(flds[f].obj);
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

                            }

                        }
                } else if (this.form.db[q].showType == FormView.QueryShowType.QUERYVIEW) {
                    var qr = this.form.db[q];
                    qr.obj = new QueryView(qr.name + "_" + this.timeInLong);
                    qr.obj.getControl().view = this;
                    qr.obj.getControl().addStyleClass("sapUiSizeCondensed");
                    qr.obj.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
                    qr.obj.getControl().setFixedBottomRowCount(0);
                    qr.obj.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
                    qr.obj.getControl().setVisibleRowCount(7);
                    qr.obj.getControl().setVisibleRowCount(7);
                    qr.obj.insertable = qr.insert_allowed;
                    qr.obj.deletable = qr.delete_allowed;
                    thatForm.loadQueryView(qr, true);

                    if (qr.hasOwnProperty("before_add_table") && qr.before_add_table != undefined) {
                        qr.before_add_table(scrollObjs, qr.obj);
                    }

                    scrollObjs.push(qr.obj.getControl());

                    if (this.firstObj == undefined)
                        this.firstObj = qr.obj.getControl();
                    qr.obj.onAddRow = function (idx, ld) {
                        if (thatForm.form.events.hasOwnProperty("afterNewRow")) {
                            thatForm.form.events.afterNewRow(qr, idx, ld);
                        }

                    };
                    qr.obj.beforeDelRow = function (idx, ld, dt) {
                        if (thatForm.form.events.hasOwnProperty("beforeDelRow")) {
                            thatForm.form.events.beforeDelRow(qr, idx, ld, dt);
                        }

                    };
                    qr.obj.afterDelRow = function (ld, dt) {
                        if (thatForm.form.events.hasOwnProperty("afterDelRow")) {
                            thatForm.form.events.afterDelRow(qr, ld, dt);
                        }

                    };
                    qr.obj.onCellRender = function (rowno, colno, currentRowContext) {
                        if (thatForm.form.events.hasOwnProperty("onCellRender") && thatForm.form.events.onCellRender != undefined) {
                            thatForm.form.events.onCellRender(qr, rowno, colno, currentRowContext);
                        }
                    }

                    qr.sumObj = undefined;
                    var flds = this.form.db[q].summary;
                    var fe = []
                    if (qr.summary != undefined)
                        for (var f in flds) {
                            var set = {};
                            if (flds[f].display_width != "")
                                set["layoutData"] = new sap.ui.layout.GridData({ span: flds[f].display_width })
                            if (Object.keys(flds[f].other_settings).length > 0) {
                                set = { ...set, ...flds[f].other_settings };
                            }
                            if (flds[f].obj == undefined) {
                                flds[f].obj = UtilGen.addControl(fe,
                                    flds[f].title, eval(flds[f].class_name),
                                    flds[f].name.replace(".", '') + this.timeInLong,
                                    set, flds[f].data_type,
                                    flds[f].display_format, this.view, undefined, flds[f].list);
                                flds[f].obj.addStyleClass(flds[f].display_style);
                            }

                        }
                    // qr.sumObj = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
                    qr.sumObj = UtilGen.formCreate2("", true, fe, undefined, sap.m.ScrollContainer, {}, "sapUiSizeCondensed", "5px");
                    // qr.sumObj.setToolbar(undefined);
                    // qr.sumObj.destroyToolbar();
                    scrollObjs.push(qr.sumObj);
                }

            }


            Util.navEnter(this.dispCanvases["default_canvas"], function (lastObj) {
                if (thatForm.form.db.length > 1) {
                    if (thatForm.form.db[1].showType == FormView.QueryShowType.QUERYVIEW) {
                        thatForm.form.db[1].obj.getControl().focus();
                        if (thatForm.form.db[1].obj.getControl().getRows()[0].getCells()[0] != undefined)
                            thatForm.form.db[1].obj.getControl().getRows()[0].getCells()[0].focus();
                    }
                }

            })
            this.sc = this.pg;// new sap.m.ScrollContainer();
            for (var si in scrollObjs1)
                this.sc.addContent(scrollObjs1[si]);
            //
            this.vbCustom = new sap.m.VBox().addStyleClass("sapUiSizeCompact");

            if (this.form.customDisplay != undefined) {
                this.form.customDisplay(this.vbCustom);
                this.sc.addContent(this.vbCustom);
            }
            // this.objs["default_canvas"].obj = UtilGen.formCreate("", true, this.dispCanvases["default_canvas"], qr.labelSpan, qr.emptySpan, qr.columnsSpan);
            this.objs["default_canvas"].obj = UtilGen.formCreate2("", true, this.dispCanvases["default_canvas"], undefined, sap.m.ScrollContainer, this.form.formSetting, "sapUiSizeCondensed", "10px");
            this.sc.addContent(this.objs["default_canvas"].obj);

            // this.objs["default_canvas"].obj.setToolbar(undefined);
            // this.objs["default_canvas"].obj.destroyToolbar();
            this.tbHeader = new sap.m.Toolbar();
            this.pg.setShowSubHeader(true);
            this.pg.setSubHeader(this.tbHeader);
            for (var c in this.form.commands) {
                var cmd = this.form.commands[c];
                cmd.obj = Util.nvl(cmd.obj, this.cmdButtons[cmd.name]);
                if (cmd.obj != undefined && cmd.canvas == "default_canvas") {
                    // this.objs["default_canvas"].obj.getToolbar().addContent(cmd.obj);
                    this.tbHeader.addContent(cmd.obj);
                    cmd.obj.setText(Util.nvl(cmd.title, cmd.obj.getText()));
                }
            }
            this.tbHeader.addContent(new sap.m.ToolbarSpacer());
            this.tbHeader.addContent(new sap.m.Title({ text: this.form.title }));


            // focus on first object after showing form
            // this.pg.addContent(this.sc);


            for (var i in scrollObjs)
                this.sc.addContent(scrollObjs[i]);

            this.sc.addContent(new sap.m.VBox({ height: "100px" }));

            if (this.firstObj != undefined) {
                this.pg.addEventDelegate({
                    onAfterShow: function (evt) {
                        setTimeout(function () {
                            thatForm.firstObj.focus();
                        }, 700);

                    },
                });
            }

            thatForm.refreshDisplay();
            // displaying all fields.
            // if (this.objs["default_canvas"].frm
            // adding command buttons on toolbar.

        }
            ;
        FormView.prototype.refreshDisplay = function () {
            var thatForm = this;
            setTimeout(function () {
                // thatForm.objs["default_canvas"].obj.$().css("background-color", "blue");
                if (thatForm.tbHeader != undefined) {
                    thatForm.tbHeader.$().css("cssText", "background-color:" + thatForm.form.toolbarBG + " !important;");
                    thatForm.tbHeader.$().css("cssText", "background-color:" + thatForm.form.toolbarBG + " !important;");
                }
                if (thatForm.objs["default_canvas"].obj != undefined) {
                    var ar = [].concat(thatForm.form.formSetting["cssText"]);
                    thatForm.objs["default_canvas"].obj.$().css("cssText", ar);
                }
                // thatForm.objs["default_canvas"].obj.getToolbar().addStyleClass(thatForm.form.toolbarBG);
                // $($(".sapUiFormResGrid , .sapUiFormToolbar")[0]).css("cssText", "background-color:" + thatForm.form.toolbarBG + " !important;");
                // $(".sapUiFormResGrid , .sapUiFormToolbar").css("cssText", "background-color:" + thatForm.form.toolbarBG + " !important;")

            }, 500);
        };
        FormView.prototype.loadQueryView = function (qryObj, applyCols) {
            var thatForm = this;
            if (qryObj.showType != FormView.QueryShowType.QUERYVIEW)
                return;
            if (qryObj.obj == undefined)
                return;
            var sq = this.parseString(qryObj.dml);
            Util.doAjaxJson("sqlmetadata", { sql: sq }, false).done(function (data) {
                if (data.ret == "SUCCESS") {
                    if (applyCols) {
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
                            // when validation of field.

                        }
                    }
                    qryObj.obj.mLctb.parse("{" + data.data + "}", true);
                    qryObj.obj.mLctb.updateRecStatus(LocalTableData.RowStatus.UPDATED);
                    qryObj.obj.loadData();
                    if (thatForm.form.events.hasOwnProperty("afterLoadQry"))
                        thatForm.form.events.afterLoadQry(qryObj);

                    if (qryObj.status != FormView.RecordStatus.VIEW && Util.nvl(qryObj.addRowOnEmpty, false) && qryObj.obj.mLctb.rows.length == 0)
                        qryObj.obj.addRow();
                    if (qryObj.status == FormView.RecordStatus.VIEW)
                        qryObj.obj.editable = false;


                }
            });

        };
        FormView.prototype.initView = function () {
            var that = this;
            if (this.view == undefined)
                return;

            Util.destroyID("cmdSave" + this.timeInLong, this.view);
            this.cmdButtons.cmdSave = new sap.m.Button(this.view.createId("cmdSave" + this.timeInLong), {
                icon: "sap-icon://save",
                text: Util.getLangText("saveRec"),
                press: function (e) {
                    that.save_data();
                    // that.cmdButtons.cmdNew.firePress();
                }
            });

            Util.destroyID("cmdDel" + this.timeInLong, this.view);
            this.cmdButtons.cmdDel = new sap.m.Button(this.view.createId("cmdDel" + this.timeInLong), {
                icon: "sap-icon://delete",
                text: Util.getLangText("delRec"),
                press: function () {
                    that.delete_data();
                }
            });

            Util.destroyID("cmdList" + this.timeInLong, this.view);
            this.cmdButtons.cmdList = new sap.m.Button(this.view.createId("cmdList" + this.timeInLong), {
                icon: "sap-icon://list",
                text: Util.getLangText("listRec"),
                press: function () {
                    var ob = that.getObjectByObj(this);
                    if (ob.list_name == undefined)
                        this.err("list name not defined !");
                    that.showList(ob.list_name);
                }
            });
            Util.destroyID("cmdEdit" + this.timeInLong, this.view);
            this.cmdButtons.cmdEdit = new sap.m.ToggleButton(this.view.createId("cmdEdit" + this.timeInLong), {
                icon: "sap-icon://edit",
                text: Util.getLangText("editRec"),
                pressed: false,
                press: function () {
                    var ob = that.getObjectByObj(this);
                    if (ob.onPress != undefined)
                        if (ob.onPress(e)) {
                            that.save_data();
                            return;
                        } else return;

                    if (this.getPressed()) {
                        that.setQueryStatus(undefined, FormView.RecordStatus.EDIT);
                    }
                    else
                        that.setQueryStatus(undefined, FormView.RecordStatus.VIEW);
                }
            });

            Util.destroyID("cmdNew" + this.timeInLong, this.view);
            this.cmdButtons.cmdNew = new sap.m.Button(this.view.createId("cmdNew" + this.timeInLong), {
                icon: "sap-icon://add-document",
                text: Util.getLangText("newRec"),
                press: function (e) {
                    that.form.readonly = false;
                    var ob = that.getObjectByObj(this);
                    if (ob.onPress != undefined)
                        ob.onPress(e);

                    that.setQueryStatus(undefined, FormView.RecordStatus.NEW);
                    if (that.cmdButttons.cmdEdit != undefined) {
                        that.cmdButtons.cmdEdit.setEnabled(false);
                        that.cmdButtons.cmdEdit.setPressed(false);
                    }

                }
            });
            Util.destroyID("cmdPrint" + this.timeInLong, this.view);
            this.cmdButtons.cmdPrint = new sap.m.Button(this.view.createId("cmdPrint" + this.timeInLong), {
                icon: "sap-icon://print",
                text: Util.getLangText("printRec"),
                visible: true,
                press: function (e) {

                    var ob = that.getObjectByObj(this);
                    if (ob.onPress != undefined) {
                        ob.onPress(e);
                        return;
                    }


                    if (Util.nvl(that.reportMenus, []).length <= 0) return;

                    if (that.reportMenus.length > 1) {
                        var ms = that.reportMenus;
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
                                    that.printReport(cd, true);
                                }
                            }));
                        new sap.m.Menu({
                            title: "",
                            items: mnus
                        }).openBy(this);
                    } else {
                        var cd = that.reportMenus[0].reportFile;
                        var pms = "";
                        var sett = sap.ui.getCore().getModel("settings").getData();
                        that.printReport(cd, true);

                    }


                }
            });


        };
        FormView.prototype.printReport = function (rpt, saveData) {
            var that = this;
            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            var qryObj;
            if (Util.nvl(saveData, false)) {
                var comp = true;
                for (var o in qrys) {
                    qryObj = qrys[o];
                    if (qryObj.status == FormView.RecordStatus.EDIT || qryObj.status == FormView.RecordStatus.NEW) {
                        var kf = this.getFieldValue("qry1.keyfld");
                        that.save_data(undefined, FormView.RecordStatus.VIEW);
                        comp = false;
                        break;
                    }
                }
                if (!comp)
                    for (var o in qrys) {
                        qryObj = qrys[o];
                        if (qryObj.status == FormView.RecordStatus.EDIT || qryObj.status == FormView.RecordStatus.NEW) {
                            FormView.err("Failed to save data !");
                        }
                    }
            }
            var sett = sap.ui.getCore().getModel("settings").getData();
            var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);

            var ps = "";
            var rep = this.form;
            for (var i in rep.parameters) {
                var s = rep.parameters[i].value;
                var k = "_para_" + rep.parameters[i].name;
                var s = k + "=" + s;
                if (rep.parameters[i].data_type == FormView.DataType.Date)
                    s = k + "=@" + sdf.format(UtilGen.getControlValue(rep.parameters[i].value));
                if (rep.parameters[i].data_type == FormView.DataType.Number)
                    s = k + "=" + df.formatBack(UtilGen.getControlValue(rep.parameters[i].value));

                ps = ps + (ps.length > 0 ? "&" : "") + s;
            }
            if (this.form.events.hasOwnProperty("beforePrint") && this.form.events.beforePrint != undefined)
                ps = Util.nvl(this.form.events.beforePrint(rpt, ps), ps);


            Util.doXhr("report?reportfile=" + rpt + "&" + ps, true, function (e) {
                if (this.status == 200) {
                    var blob = new Blob([this.response], { type: "application/pdf" });
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.target = "_blank";
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.download = "rptVou" + new Date() + ".pdf";
                    Util.printPdf(link.href);

                }
            });
        }
            ;

        FormView.prototype.getObjectByObj = function (obj) {
            for (var i in this.objs) {
                if (this.objs[i].obj == obj) return this.objs[i];
            }
        };

        FormView.prototype.parseString = function (str) {
            var lst = str.match(/:[a-zA-Z0-9_.]*/gi);
            var sst = str;
            for (var i = 0; i < Util.nvl(lst, []).length; i++) {
                var vl = this.getFieldValue(lst[i].replaceAll(':', ''));
                if (vl instanceof Date) {
                    if (vl.getTime() === vl.setHours(0, 0, 0, 0))
                        vl = Util.toOraDateString(vl);
                    else
                        vl = Util.toOraDateTimeString(vl);
                }
                sst = sst.replaceAll(lst[i], vl);
            }
            return sst;
        };

        FormView.prototype.getFieldValue = function (vr) {
            var vl = undefined;
            if (this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.PARAMETER)) {
                vl = this.objs[vr].value;
                if (this.objs[vr].data_type == FormView.DataType.Number)
                    vl = Util.extractNumber(vl);
            }

            if (vl == undefined && this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.FIELD)) {
                vl = UtilGen.getControlValue(this.objs[vr].obj);
                if (this.objs[vr].data_type == FormView.DataType.Number)
                    vl = Util.extractNumber(vl);

            }

            if (vl == undefined)
                for (var i in this.objs) {
                    if (this.objs[i].objType == FormView.ObjTypes.FIELD &&
                        i.endsWith("." + vr)) {
                        vl = UtilGen.getControlValue(this.objs[i].obj);
                        if (this.objs[i].data_type == FormView.DataType.Number)
                            vl = Util.extractNumber(vl);
                    }
                }

            return vl;

        };
        FormView.prototype.isFieldEditable = function (fld) {
            if (fld == undefined)
                return false;
            // if (fld.objType == FormView.ObjTypes.PARAMETER)
            //     return true;
            if (fld.objType == FormView.ObjTypes.FIELD &&
                fld.obj != undefined && (
                    fld.obj.getEditable() == false ||
                    fld.obj.getEnabled() == false))
                return false;

            return true;


        };
        FormView.prototype.setFieldValue = function (vr, pvl, lbl, validate) {
            var fldObj = this._findFieldObj(vr);
            if (Util.nvl(validate, false) && !this.isFieldEditable(fldObj))
                return false;
            if (fldObj != undefined)
                UtilGen.setControlValue(fldObj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
            return true;

        };

        FormView.prototype._findFieldObj = function (vr) {
            if (this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.PARAMETER)) {
                return this.objs[vr];
            }

            if (this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.FIELD)) {
                // if (Util.nvl(validate, false) && !this.isFieldEditable(this.objs[vr]))
                //     return false;
                // UtilGen.setControlValue(this.objs[vr].obj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
                return this.objs[vr].obj;
            }

            for (var i in this.objs)
                if (this.objs[i].objType == FormView.ObjTypes.FIELD &&
                    i.endsWith("." + vr)) {
                    return this.objs[i].obj;
                }
            // if  not found then search in QUERYVIEW fields

        };
        FormView.prototype.isFormEditable = function () {
            var frmEdit = false;
            var qrys = this.form.db;
            for (var o in qrys) {
                if (qrys[o].status == FormView.RecordStatus.NEW ||
                    qrys[o].status == FormView.RecordStatus.EDIT)
                    frmEdit = true;
            }
            return frmEdit;
        };
        FormView.prototype.loadData = function (qryName, status2, pSetStatus) {
            var that = this;
            var setStatus = Util.nvl(pSetStatus, true);
            var qryObj = undefined;
            var status = Util.nvl(status2, "");
            if (FormView.RecordStatus[status.toUpperCase()] == undefined)
                status = FormView.RecordStatus.VIEW;

            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;
            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            for (var o in qrys) {
                qryObj = qrys[o];
                if (qryObj.showType == FormView.QueryShowType.FORM) {
                    var sqb = false;
                    if (this.form.events.hasOwnProperty("beforeLoadQry"))
                        sqb = true;
                    this.fetchQuery(qryObj, sqb);
                    if (setStatus)
                        this.setQueryStatus(qryObj, Util.nvl(status, FormView.RecordStatus.VIEW));
                    if (this.form.events.hasOwnProperty("afterLoadQry"))
                        this.form.events.afterLoadQry(qryObj);
                } else if (qryObj.showType == FormView.QueryShowType.QUERYVIEW) {
                    this.loadQueryView(qryObj, true);
                    if (setStatus)
                        this.setQueryStatus(qryObj, Util.nvl(status, FormView.RecordStatus.VIEW));
                }
            }
        };

        FormView.prototype.fetchQuery = function (qryName, execBeforeSql) {
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            if (qryObj == undefined && qryObj.objType != FormView.ObjTypes.QUERY)
                this.err("Cant fetch query on  " + qryName);

            var sql = this.parseString(qryObj.dml);
            if (Util.nvl(execBeforeSql, false))
                sql = this.form.events.beforeLoadQry(qryObj, sql);
            var dt = Util.execSQL(sql);
            if (dt.ret == "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                this._loadDataFromJson(qryObj, dtx[0], false);
            }

        };

        FormView.prototype._loadDataFromJson = function (qry, dtx, executeChange) {
            var subs = qry.fields;
            for (var key in subs) {
                var vl = dtx[key.toUpperCase()];
                if (subs[key].obj != undefined)
                    UtilGen.setControlValue(subs[key].obj, "", "", false);
                if (subs[key].obj != undefined && vl != undefined)
                    UtilGen.setControlValue(subs[key].obj, vl, vl, Util.nvl(executeChange, false));

            }

        };


        FormView.prototype.delete_data = function () {
            var thatForm = this;
            if (sap.m.MessageBox == undefined)
                jQuery.sap.require("sap.m.MessageBox");
            if (this.form.readonly)
                FormView.err("This form is read only !");
            if (thatForm.form.events.hasOwnProperty("beforeDeleteValidate")) {
                thatForm.form.events.beforeDeleteValidate(this);
            }

            sap.m.MessageBox.confirm("Are you sure to DELETE ?  ", {
                title: "Confirm",                                    // default
                onClose: function (oAction) {
                    if (oAction == sap.m.MessageBox.Action.OK) {
                        var sv = thatForm.deleteQryData();
                        sap.m.MessageToast.show("Query data deleted thorugh # " + sv + " SQL(s) ")
                    }
                },                                       // default
                styleClass: "",                                      // default
                initialFocus: null,                                  // default
                textDirection: sap.ui.core.TextDirection.Inherit     // default
            });
        };

        FormView.prototype.deleteQryData = function (qryName) {
            var qryObj = undefined;
            var thatForm = this;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            var sv = 0;
            var sql = "";
            for (var o in qrys) {
                qryObj = qrys[o];
                if (qryObj.status == FormView.RecordStatus.VIEW ||
                    qryObj.status == FormView.RecordStatus.EDIT) {
                    var sq = "delete from " + qryObj.table_name +
                        ((Util.nvl(qryObj.where_clause, "") != "") ? " where " + qryObj.where_clause + ";" : "");
                    sql += this.parseString(sq);
                    if (thatForm.form.events.hasOwnProperty("afterDelRow")) {
                        var sqAdd = Util.nvl(thatForm.form.events.afterDelRow(qryObj), "");
                        sqAdd = this.parseString(sqAdd);
                        sql += sqAdd
                    }
                    sv++;
                }
            }


            var sql = "begin " + sql + " end;";
            var dat = Util.execSQL(sql);
            if (dat.ret == "SUCCESS") {
                this.setQueryStatus(undefined, FormView.RecordStatus.NEW);

            }


            return sv;
        };
        FormView.prototype.setFormReadOnly = function () {
            var qryObj = undefined;
            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);

            for (var o in qrys) {
                qryObj = qrys[o];
                this._setQryDisableForEditing(qryObj);
                this.cmdButtons.cmdEdit.setPressed(false);
                this.cmdButtons.cmdEdit.setEnabled(false);
                this.cmdButtons.cmdDel.setEnabled(false);
            }
            this.form.readonly = true;

        };
        FormView.prototype.setQueryStatus = function (qryName, status2) {
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;
            var status = Util.nvl(status2, "");
            status = this.form.readonly ? FormView.RecordStatus.VIEW : status;
            var thatForm = this;
            if (FormView.RecordStatus[status.toUpperCase()] == undefined)
                status = FormView.RecordStatus.VIEW;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            for (var o in qrys) {
                qryObj = qrys[o];
                var oldStat = qryObj.status;
                qryObj.status = status;
                if (status == FormView.RecordStatus.VIEW) {
                    this.loadData(qryObj, status, false);
                    this._setQryDisableForEditing(qryObj);
                    this.cmdButtons.cmdEdit.setPressed(false);
                    this.cmdButtons.cmdEdit.setEnabled(!this.form.readonly);
                    this.cmdButtons.cmdDel.setEnabled(!this.form.readonly);
                    if (this.form.events.hasOwnProperty("afterViewRow"))
                        this.form.events.afterViewRow(qryObj, -1, undefined);


                }
                if (!this.form.readonly && status == FormView.RecordStatus.EDIT) {
                    if (qryObj.edit_allowed == false) {
                        this._setQryDisableForEditing(qryObj);
                        // this.cmdButtons.cmdEdit.setPressed(false);
                        // this.cmdButtons.cmdEdit.setEnabled(false);
                        // qryObj.status = FormView.RecordStatus.VIEW;
                        qryObj.status = oldStat;
                        sap.m.MessageToast.show(Util.quoted(qryObj.name) + ": Unable to set EDIT mode !");
                        continue;
                        // status = "view";
                        // return;
                    }
                    this._setQryEnableForEditing(qryObj);
                    this.loadData(qryObj, status, false);
                    this.cmdButtons.cmdDel.setEnabled(true);
                    this.cmdButtons.cmdEdit.setPressed(true);
                    this.cmdButtons.cmdEdit.setEnabled(true);

                    if (this.form.events.hasOwnProperty("afterEditRow"))
                        this.form.events.afterEditRow(qryObj, -1, undefined);


                }
                if (!this.form.readonly && status == FormView.RecordStatus.NEW) {
                    if (qryObj.insert_allowed == false) {
                        // this.cmdButtons.cmdEdit.setPressed(false);
                        // this.cmdButtons.cmdEdit.setEnabled(false);
                        // this.cmdButtons.cmdDel.setEnabled(false);
                        // this.cmdButtons.cmdNew.setEnabled(false);
                        this._setQryDisableForEditing(qryObj);
                        qryObj.status = oldStat;
                        sap.m.MessageToast.show(Util.quoted(qryObj.name) + ":Unable to set INSERT mode !");
                        continue;
                        // status = "view";
                    }


                    this.resetQryData(qryObj);
                    this._setQryEnableForEditing(qryObj);
                    this.cmdButtons.cmdEdit.setPressed(false);
                    this.cmdButtons.cmdEdit.setEnabled(false);
                    this.cmdButtons.cmdDel.setEnabled(false);

                    if (qryObj.showType == FormView.QueryShowType.FORM &&
                        this.form.events.hasOwnProperty("afterNewRow"))
                        this.form.events.afterNewRow(qryObj, -1, undefined);

                    if (this.firstObj != undefined) {
                        setTimeout(function () {
                            thatForm.firstObj.focus();
                            thatForm.firstObj.$().find("input").select();
                        }, 700);
                    }
                }

            }
        }
            ;
        FormView.prototype._setQryEnableForEditing = function (qryName) {
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            for (var o in qrys) {
                qryObj = qrys[o];
                if (qryObj.showType == FormView.QueryShowType.FORM) {
                    this._setQryDisableForEditing(qryObj);
                    var flds = { ...Util.nvl(qryObj.fields, []), ...Util.nvl(qryObj.summary, {}) };
                    for (var i in flds) {
                        var fld = flds[i].obj;
                        if (fld != undefined && qryObj.status == FormView.RecordStatus.EDIT &&
                            Util.nvl(flds[i].edit_allowed, true))
                            this._setQryEditableObj(fld, true);
                        if (fld != undefined && qryObj.status == FormView.RecordStatus.NEW &&
                            Util.nvl(flds[i].insert_allowed, true))
                            this._setQryEditableObj(fld, true);

                    }
                } else if (qryObj.showType == FormView.QueryShowType.QUERYVIEW) {
                    qryObj.obj.editable = true;
                    var flds = { ...Util.nvl(qryObj.fields, []), ...Util.nvl(qryObj.summary, {}) };
                    for (var i in flds) {
                        var fld = flds[i].obj;
                        this._setQryEditableObj(fld, true);
                    }
                }
            }

        }

        FormView.prototype._setQryDisableForEditing = function (qryName) {
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            for (var o in qrys) {
                qryObj = qrys[o];
                if (qryObj.showType == FormView.QueryShowType.FORM) {
                    var flds = { ...Util.nvl(qryObj.fields, []), ...Util.nvl(qryObj.summary, {}) };
                    for (var i in flds) {
                        var fld = flds[i].obj;
                        this._setQryEditableObj(fld, false);
                    }
                } else if (qryObj.showType == FormView.QueryShowType.QUERYVIEW) {
                    qryObj.obj.editable = false;
                    var flds = { ...Util.nvl(qryObj.fields, []), ...Util.nvl(qryObj.summary, {}) };
                    for (var i in flds) {
                        var fld = flds[i].obj;
                        this._setQryEditableObj(fld, false);
                    }
                    // this.loadQueryView(qryObj, true);
                }
            }
        };

        FormView.prototype._setQryEditableObj = function (fld, ed) {
            if (fld == undefined) return;

            if (fld instanceof sap.m.InputBase)
                fld.setEditable(Util.nvl(ed, true));
            else if (fld instanceof sap.m.SearchField)
                fld.setEnabled(Util.nvl(ed, true));
            else if (fld instanceof sap.m.CheckBox)
                fld.setEditable(Util.nvl(ed, true));
            else if (fld instanceof sap.m.ComboBox)
                fld.setEditable(Util.nvl(ed, true));
            else if (fld.hasOwnProperty('setEnabled'))
                fld.setEnabled(Util.nvl(ed, true));
            else if (fld.hasOwnProperty('setEditable'))
                fld.setEnabled(Util.nvl(ed, true));

        };
        FormView.prototype.resetQryData = function (qryName) {
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            for (var o in qrys) {
                qryObj = qrys[o];
                if (qryObj.showType == FormView.QueryShowType.FORM) {
                    var flds = Util.nvl(qryObj.fields, []);
                    for (var i in flds) {
                        var fld = flds[i].obj;
                        if (fld != undefined) {
                            UtilGen.setControlValue(fld, "", "", false);
                        }
                    }
                } else if (qryObj.showType == FormView.QueryShowType.QUERYVIEW)
                    this.loadQueryView(qryObj, true);


            }
        };
        FormView.prototype.showList = function (listname) {
            var thatFormView = this;
            if (listname == "" || this.objs[listname] == undefined)
                this.err(' List not defined  # ' + Util.nvl(listname, ''));

            var lstObj;
            if (typeof listname == "string")
                lstObj = this.objs[listname];
            else lstObj = listname;


            if (lstObj.list_type == FormView.ListTypes.SQL && Util.nvl(lstObj.sql, "") == "")
                this.err("SQL not defined !");
            var sq = this.parseString(lstObj.sql);

            var cols = [];

            for (var i in Util.nvl(lstObj.cols, []))
                cols.push(lstObj.cols[i].colname);

            Util.show_list(sq, cols, "", function (data) {
                // var ss = "";
                // for (var i in data)
                //     ss += (ss.length > 0 ? "," : "") + data[i].CODE;

                if (data.length <= 0) return false;
                for (var i in Util.nvl(lstObj.cols, []))
                    if (Util.nvl(lstObj.cols[i].return_field, "") != "") {
                        if (!thatFormView.setFieldValue(
                            lstObj.cols[i].return_field,
                            data[lstObj.cols[i].colname],
                            data[lstObj.cols[i].colname], true))
                            thatFormView.err("Cant set value  : " + lstObj.cols[i].return_field);
                    }

                if (lstObj.hasOwnProperty("afterSelect"))
                    if (!lstObj.afterSelect(data))
                        return false;

                return true;
            }, "100%", "100%", undefined, Util.nvl(lstObj.multiSelect, false));

        };
        FormView.prototype.validate_data = function (qryName) {
            var qryObj = undefined;
            var thatForm = this;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);

            var robjs = [];
            for (var o in qrys) {
                qryObj = qrys[o];
                var flds = Util.nvl(qryObj.fields, []);
                for (var i in flds) {
                    if (flds[i].obj != undefined && flds[i].require)
                        robjs.push(flds[i].obj);
                }

            }
            if (UtilGen.showErrorNoVal(robjs) > 0) {
                this.err("Some mandatory values are blank !");
                return false;
            }

            return true;
        };
        FormView.prototype.save_data = function (qryName, nxtStatus) {
            var qryObj = undefined;
            var thatForm = this;
            if (this.form.readonly)
                sap.m.MessageToast.err("This form is read only !");
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            var sq = "";
            var sq2 = "";

            var sv = 0;
            for (var o in qrys) {
                qryObj = qrys[o];
                sq2 = "";
                if (qryObj.status == FormView.RecordStatus.EDIT && qryObj.edit_allowed) {
                    if (!this.validate_data(qryObj))
                        return false;
                    if (qryObj.showType == FormView.QueryShowType.FORM) {
                        if (this.form.events.hasOwnProperty("beforeSaveQry")) {
                            var er = this.form.events.beforeSaveQry(qryObj, qryObj.update_default_values)
                            if (er != "")
                                this.err();
                        }
                        if (this.form.events.hasOwnProperty("addSqlBeforeUpdate")) {
                            var adSq = this.form.events.addSqlBeforeUpdate(qryObj, undefined)
                            sq2 = sq2 + adSq;
                        }
                        sq2 += this.getSQLUpdateString(qryObj,
                            qryObj.update_default_values,
                            qryObj.update_exclude_fields,
                            qryObj.where_clause);
                        sq2 = this.parseString(sq2) + ";";
                        if (this.form.events.hasOwnProperty("addSqlAfterUpdate")) {
                            var adSq = this.form.events.addSqlAfterUpdate(qryObj, undefined)
                            // if (er != "")
                            sq2 = sq2 + adSq;
                        }

                    }
                    else if (qryObj.showType == FormView.QueryShowType.QUERYVIEW) {
                        qryObj.obj.updateDataToTable();
                        // execute trigger before saev
                        sq2 += this.parseString(qryObj.delete_before_update);
                        for (var i = 0; i < qryObj.obj.mLctb.rows.length; i++) {
                            var sqlRow = UtilGen.getInsertRowString(qryObj.obj.mLctb,
                                qryObj.table_name, i,
                                qryObj.insert_exclude_fields,
                                qryObj.insert_default_values, true);
                            if (this.form.events.hasOwnProperty("beforeSaveQry"))
                                sqlRow = Util.nvl(this.form.events.beforeSaveQry(qryObj, sqlRow, i), sqlRow);
                            sqlRow = this.parseString(sqlRow) + ";";
                            sq2 += sqlRow;
                            if (this.form.events.hasOwnProperty("addSqlAfterInsert")) {
                                var adSq = this.form.events.addSqlAfterInsert(qryObj, undefined)
                                sq2 = sq2 + adSq;
                            }
                        }
                    }
                }
                else if (qryObj.status == FormView.RecordStatus.NEW && qryObj.insert_allowed) {
                    if (!this.validate_data(qryObj))
                        return false;
                    if (qryObj.showType == FormView.QueryShowType.FORM) {
                        if (this.form.events.hasOwnProperty("beforeSaveQry")) {
                            var er = this.form.events.beforeSaveQry(qryObj, qryObj.insert_default_values)
                            if (er != "")
                                this.err();
                        }
                        if (this.form.events.hasOwnProperty("addSqlBeforeInsert")) {
                            var adSq = this.form.events.addSqlBeforeInsert(qryObj, undefined)
                            sq2 = sq2 + adSq;
                        }
                        sq2 += this.getSQLInsertString(qryObj,
                            qryObj.insert_default_values,
                            qryObj.insert_exclude_fields
                        ) + ";";
                        if (this.form.events.hasOwnProperty("addSqlAfterInsert")) {
                            var adSq = this.form.events.addSqlAfterInsert(qryObj, undefined)
                            // if (er != "")
                            sq2 = sq2 + adSq;
                        }
                    }
                    else if (qryObj.showType == FormView.QueryShowType.QUERYVIEW) {
                        qryObj.obj.updateDataToTable();
                        sq2 += this.parseString(qryObj.delete_before_update);
                        for (var i = 0; i < qryObj.obj.mLctb.rows.length; i++) {
                            var sqlRow = UtilGen.getInsertRowString(qryObj.obj.mLctb,
                                qryObj.table_name, i,
                                qryObj.insert_exclude_fields,
                                qryObj.insert_default_values, true);
                            if (this.form.events.hasOwnProperty("beforeSaveQry"))
                                sqlRow = Util.nvl(this.form.events.beforeSaveQry(qryObj, sqlRow, i), sqlRow);
                            sqlRow = this.parseString(sqlRow) + ";";
                            sq2 += sqlRow;
                            if (this.form.events.hasOwnProperty("addSqlAfterInsert")) {
                                var adSq = this.form.events.addSqlAfterInsert(qryObj, undefined)
                                // if (er != "")
                                sq2 = sq2 + adSq;
                            }
                        }
                    }
                }
                sq += sq2;
                sv = sv + (sq2.length == 0 ? 0 : 1);
            }
            if (this.form.events.hasOwnProperty("beforeExeSql"))
                sq = Util.nvl(this.form.events.beforeExeSql(thatForm, sq));

            if (sq == "")
                this.err('No any changes to save !');

            var k = "begin " + sq + " end;";
            console.log(sq);
            var oSql = {
                "sql": k,
                "ret": "NONE",
                "data": null
            };
            Util.doAjaxJson("sqlexe", oSql, false).done(function (data) {
                console.log(data);

                if (data == undefined || data == null)
                    thatForm.err("unexpected err, check server admin");


                if (data.ret != "SUCCESS")
                    thatForm.err(data.ret);


                if (thatForm.form.events.hasOwnProperty("afterExeSql"))
                    if (thatForm.form.events.afterExeSql(oSql));


                // sap.m.MessageToast.show("Saved Successfully ,# " + sv + ",  Sqls executed..!");


                for (var o in qrys) {
                    qryObj = qrys[o];
                    thatForm.loadData(qryObj, FormView.RecordStatus.VIEW);
                }

                if (thatForm.form.events.hasOwnProperty("afterSaveForm"))
                    thatForm.form.events.afterSaveForm(thatForm, nxtStatus);

                return true;
            });
            return true;

        }
            ;

        FormView.prototype.getSQLInsertString = function (qryName, flds, excFlds) {

            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;


            var hma = "";
            var ohma = "";
            // hma = " h mm a";
            // ohma = " HH MI AM";


            var sett = sap.ui.getCore().getModel("settings").getData();
            var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + hma);
            var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);

            var kys = [];
            var str = "";
            var vl = "";

            if (flds != undefined)
                for (var key in flds) {
                    str += (str.length == 0 ? "" : ",") + key;
                    vl += (vl.length == 0 ? "" : ",") + flds[key];
                }
            var tbl = {};

            for (var i in Util.nvl(qryObj.fields, []))
                tbl[qryObj.fields[i].colname] = qryObj.fields[i].obj;


            for (var key in tbl) {

                if (!key.startsWith("_") && (excFlds == undefined || excFlds.indexOf(key) < 0)) {
                    str += (str.length == 0 ? "" : ",") + key;
                    var val = UtilGen.getControlValue(tbl[key]);

                    val = "'" + (val + "").replace("'", "''") + "'";

                    if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() != undefined)
                        val = "to_date('" + sdf.format(tbl[key].getDateValue()) + "','" + sett["ENGLISH_DATE_FORMAT"] + ohma + "')";
                    if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() == undefined)
                        val = "null";
                    if (tbl[key].field_type != undefined && tbl[key].field_type == "number")
                        val = Util.extractNumber(tbl[key].getValue());
                    if (tbl[key].field_type != undefined && tbl[key].field_type == "money")
                        val = Util.extractNumber(tbl[key].getValue());//df.parse(tbl[key].getValue());

                    vl += (vl.length == 0 ? "" : ",") + val;
                }
            }
            return this.parseString("insert into " + qryObj.table_name + " (" + str + ') values (' + vl + ")");


        };

        FormView.prototype.getSQLUpdateString = function (qryName, flds, excFlds, where) {

            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;


            var hma = "";
            var ohma = "";
            // hma = " h mm a";
            // ohma = " HH MI AM";


            var sett = sap.ui.getCore().getModel("settings").getData();
            var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + hma);
            var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);

            var kys = [];
            var str = "";
            var vl = "";

            var tbl_name = qryObj.table_name;

            if (flds != undefined)
                for (var key in flds)
                    str += (str.length == 0 ? "" : ",") + key + "=" + flds[key];

            var tbl = {};

            for (var i in Util.nvl(qryObj.fields, []))
                tbl[qryObj.fields[i].colname] = qryObj.fields[i].obj;


            for (var key in tbl) {
                if (!key.startsWith("_") && (excFlds == undefined || excFlds.indexOf(key) < 0)) {
                    var val = UtilGen.getControlValue(tbl[key]);

                    val = "'" + (val + "").replace("'", "''") + "'";

                    if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() != undefined)
                        val = "to_date('" + sdf.format(tbl[key].getDateValue()) + "','" + sett["ENGLISH_DATE_FORMAT"] + ohma + "')";
                    if (tbl[key] instanceof sap.m.DatePicker && tbl[key].getDateValue() == undefined)
                        val = "null";
                    if (tbl[key].field_type != undefined && tbl[key].field_type == "number")
                        val = tbl[key].getValue();
                    if (tbl[key].field_type != undefined && tbl[key].field_type == "money")
                        val = df.parse(tbl[key].getValue());

                    str += (str.length == 0 ? "" : ",") + key + "=" + val;

                }
            }

            return this.parseString("update " + tbl_name + " set " + str + (Util.nvl(where, "").length == 0 ? "" : " where ") + Util.nvl(where, ""));


        };
        return FormView;
    }
)
    ;



