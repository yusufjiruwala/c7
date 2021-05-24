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

            };
        };

        FormView.aligns = {
            "ALIGN_LEFT": "left",
            "ALIGN_RIGHT": "right",
            "ALIGN_CENTER": "center"
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
            "ICON": "sap.ui.core.Icon"
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
            this.canvascounts = {default: 0};

            this.form.events = {};
            var evs = Util.nvl(json.form.events, {});
            this.form.events = {...evs};
            // adding parameters;
            this.form.parameters = [];
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

                qr.objType = FormView.ObjTypes.QUERY;
                qr.status = "new";
                qr.name = Util.nvl(qrys[i].name, "");
                qr.type = qrys[i].type;
                qr.dml = Util.nvl(qrys[i].dml, "");
                qr.table_name = qrys[i].table_name;
                qr.where_clause = qrys[i].where_clause;
                qr.main_query = qrys[i].main_query;
                qr.update_exclude_fields = Util.nvl(qrys[i].update_exclude_fields, []);
                qr.insert_exclude_fields = Util.nvl(qrys[i].insert_exclude_fields, []);
                qr.insert_default_values = Util.nvl(qrys[i].insert_default_values, {});
                qr.update_default_values = Util.nvl(qrys[i].update_default_values, {});
                qr.fields = {};
                //ADDING FIELDS
                if (qrys[i].fields == undefined && qr.dml != "") {
                    Util.doAjaxJson("sqlmetadata", {sql: qr.dml}, false).done(function (data) {
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
                        qr.fields[met[f].colname] = fd;

                        this.objs[fd.name] = fd;
                    }
                }
                this.form.db.push(qr);
                this.objs[qrys[i].name] = qr;


            }
            // canvases
            this.form.canvases = [{name: "default_canvas", obj: undefined, objType: FormView.ObjTypes.CANVAS}];
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
            if (this.pg == undefined)
                this.err("No page is declared !")

            this.view = Util.nvl(this.view, this.pg.getParent());
            if (this.view == undefined)
                this.err("No View is defined  !");
            this.initView();
            this.sc = undefined;
            this.dispCanvases = {};
            this.defaultCommands = {};
            for (var q in this.form.db) {
                var flds = this.form.db[q].fields;
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
                        if (flds[f].obj == undefined) {
                            flds[f].obj = UtilGen.addControl(this.dispCanvases[flds[f].canvas],
                                flds[f].title, eval(FormView.ClassTypes[flds[f].class_name]),
                                flds[f].name.replace(".", '') + this.timeInLong,
                                set, flds[f].data_type,
                                flds[f].display_format, this.view, undefined, flds[f].list);
                            // this.dispCanvases[flds[f].canvas].push(flds[f].obj);
                        }

                    }
            }
            this.objs["default_canvas"].obj = UtilGen.formCreate("", true, this.dispCanvases["default_canvas"], undefined, undefined, [1, 1, 1]);
            this.sc = new sap.m.ScrollContainer();
            this.sc.addContent(this.objs["default_canvas"].obj);

            for (var c in this.form.commands) {
                var cmd = this.form.commands[c];
                cmd.obj = Util.nvl(cmd.obj, this.cmdButtons[cmd.name]);
                if (cmd.obj != undefined && cmd.canvas == "default_canvas") {
                    this.objs["default_canvas"].obj.getToolbar().addContent(cmd.obj);
                    cmd.obj.setText(Util.nvl(cmd.title, cmd.obj.getText()));
                }

            }


            this.pg.addContent(this.sc);
            // displaying all fields.
            // if (this.objs["default_canvas"].frm
            // adding command buttons on toolbar.

        };

        FormView.prototype.initView = function () {
            var that = this;
            if (this.view == undefined)
                return;

            Util.destroyID("cmdSave" + this.timeInLong, this.view);
            this.cmdButtons.cmdSave = new sap.m.Button(this.view.createId("cmdSave" + this.timeInLong), {
                icon: "sap-icon://save",
                text: "Save",
                press: function (e) {
                    var ob = that.getObjectByObj(this);
                    if (ob.onPress != undefined)
                        if (ob.onPress(e)) {
                            that.save_data();
                            return;
                        } else return;

                    that.save_data();
                }
            });

            Util.destroyID("cmdDel" + this.timeInLong, this.view);
            this.cmdButtons.cmdDel = new sap.m.Button(this.view.createId("cmdDel" + this.timeInLong), {
                icon: "sap-icon://delete",
                text: "Del",
                press: function () {
                    that.delete_data();
                }
            });

            Util.destroyID("cmdList" + this.timeInLong, this.view);
            this.cmdButtons.cmdList = new sap.m.Button(this.view.createId("cmdList" + this.timeInLong), {
                icon: "sap-icon://list",
                text: "List",
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
                text: "Edit",
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
                text: "New",
                press: function () {
                    var ob = that.getObjectByObj(this);
                    if (ob.onPress != undefined)
                        if (ob.onPress(e)) {
                            that.save_data();
                            return;
                        } else return;

                    that.setQueryStatus(undefined, FormView.RecordStatus.NEW);
                    if (that.cmdButtons.cmdEdit != undefined) {
                        that.cmdButtons.cmdEdit.setEnabled(false);
                        that.cmdButtons.cmdEdit.setPressed(false);
                    }
                }
            });

        }
        FormView.prototype.getObjectByObj = function (obj) {
            for (var i in this.objs) {
                if (this.objs[i].obj == obj) return this.objs[i];
            }
        };
        FormView.prototype.parseString = function (str) {
            var lst = str.match(":[a-zA-Z0-9]*");
            var sst = str;
            for (var i = 0; i < Util.nvl(lst, []).length; i++) {
                var vl = this.getFieldValue(lst[i].replaceAll(':', ''));
                sst = sst.replaceAll(lst[i], vl);
            }
            return sst;
        };
        FormView.prototype.getFieldValue = function (vr) {
            var vl = undefined;
            if (this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.PARAMETER))
                vl = this.objs[vr].value;

            if (vl == undefined && this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.FIELD))
                vl = UtilGen.getControlValue(this.objs[vr].value);

            if (vl == undefined)
                for (var i in this.objs) {
                    if (this.objs[i].objType == FormView.ObjTypes.FIELD &&
                        i.endsWith("." + vr))
                        vl = UtilGen.getControlValue(this.objs[i].obj);
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
            if (this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.PARAMETER)) {
                this.objs[vr].value = pvl;
                return true;
            }

            if (this.objs[vr] != undefined &&
                (this.objs[vr].objType == FormView.ObjTypes.FIELD)) {
                if (Util.nvl(validate, false) && !this.isFieldEditable(this.objs[vr]))
                    return false;
                UtilGen.setControlValue(this.objs[vr].obj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
                return true;
            }

            for (var i in this.objs)
                if (this.objs[i].objType == FormView.ObjTypes.FIELD &&
                    i.endsWith("." + vr)) {
                    if (Util.nvl(validate, false) && !this.isFieldEditable(this.objs[i]))
                        return false;
                    UtilGen.setControlValue(this.objs[i].obj, Util.nvl(lbl, pvl), pvl, Util.nvl(validate, false));
                    return true;
                }


            return false;

        };


        FormView.prototype.loadData = function (qryName, status) {
            var that = this;
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;
            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            for (var o in qrys) {
                qryObj = qrys[o];
                var sqb = false;
                if (this.form.events.hasOwnProperty("beforeLoadQry"))
                    sqb = true;
                this.fetchQuery(qryObj, sqb);
                this.setQueryStatus(qryObj, Util.nvl(status, FormView.RecordStatus.VIEW));
                if (this.form.events.hasOwnProperty("afterLoadQry"))
                    this.form.events.afterLoadQry(qryObj);
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
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    this._loadDataFromJson(qryObj, dtx[0], true);

                }
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
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            var sv = 0;
            for (var o in qrys) {
                qryObj = qrys[o];
                if (qryObj.status == FormView.RecordStatus.VIEW ||
                    qryObj.status == FormView.RecordStatus.EDIT) {
                    var sq = "delete from " + qryObj.table_name + " where " + qryObj.where_clause;
                    sq = this.parseString(sq);
                    var dat = Util.execSQL(sq);
                    if (dat.ret == "SUCCESS") {
                        this.setQueryStatus(qryObj, FormView.RecordStatus.NEW);
                        sv++;
                    }

                }
            }
            return sv;
        };
        FormView.prototype.setQueryStatus = function (qryName, status) {
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            for (var o in qrys) {
                qryObj = qrys[o];
                qryObj.status = status;
                if (status == FormView.RecordStatus.VIEW) {
                    this._setQryDisableForEditing(qryObj);
                    this.cmdButtons.cmdEdit.setPressed(false);
                    this.cmdButtons.cmdEdit.setEnabled(true);
                    this.cmdButtons.cmdDel.setEnabled(true);
                }
                if (status == FormView.RecordStatus.EDIT) {
                    this._setQryEnableForEditing(qryObj);
                    this.cmdButtons.cmdDel.setEnabled(true);
                    this.cmdButtons.cmdEdit.setPressed(true);
                    this.cmdButtons.cmdEdit.setEnabled(true);


                }
                if (status == FormView.RecordStatus.NEW) {
                    this.resetQryData(qryObj);
                    this._setQryEnableForEditing(qryObj);
                    this.cmdButtons.cmdEdit.setPressed(false);
                    this.cmdButtons.cmdEdit.setEnabled(false);
                    this.cmdButtons.cmdDel.setEnabled(false);
                }


            }

        };
        FormView.prototype._setQryEnableForEditing = function (qryName) {
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            for (var o in qrys) {
                qryObj = qrys[o];
                this._setQryDisableForEditing(qryObj);
                var flds = Util.nvl(qryObj.fields, []);
                for (var i in flds) {
                    var fld = flds[i].obj;
                    if (fld != undefined && qryObj.status == FormView.RecordStatus.EDIT &&
                        Util.nvl(flds[i].edit_allowed, true))
                        this._setQryEditableObj(fld, true);
                    if (fld != undefined && qryObj.status == FormView.RecordStatus.NEW &&
                        Util.nvl(flds[i].insert_allowed, true))
                        this._setQryEditableObj(fld, true);

                }
            }

        }
        ;
        FormView.prototype._setQryDisableForEditing = function (qryName) {
            var qryObj = undefined;
            if (typeof qryName == "string")
                qryObj = this.objs[qryName];
            else qryObj = qryName;

            var qrys = (qryObj != undefined ? [qryObj] : this.form.db);
            for (var o in qrys) {
                qryObj = qrys[o];
                var flds = Util.nvl(qryObj.fields, []);
                for (var i in flds) {
                    var fld = flds[i].obj;
                    this._setQryEditableObj(fld, false);
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
                var flds = Util.nvl(qryObj.fields, []);
                for (var i in flds) {
                    var fld = flds[i].obj;
                    UtilGen.setControlValue(fld, "", "", false);
                }

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
        FormView.prototype.save_data = function (qryName) {
            var qryObj = undefined;
            var thatForm = this;
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
                if (qryObj.status == FormView.RecordStatus.EDIT) {
                    if (!this.validate_data(qryObj))
                        return false;
                    sq2 = this.getSQLUpdateString(qryObj,
                        undefined,
                        qryObj.update_exclude_fields,
                        qryObj.where_clause);
                }
                else if (qryObj.status == FormView.RecordStatus.NEW) {
                    if (!this.validate_data(qryObj))
                        return false;

                    sq2 = this.getSQLInsertString(qryObj,
                        undefined,
                        qryObj.insert_exclude_fields
                    );
                }
                sq += sq2 + (sq2.length == 0 ? "" : ";");
                sv = sv + (sq2.length == 0 ? 0 : 1);

            }
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

                if (data == undefined)
                    thatForm.err("unexpected err, check server admin");


                if (data.ret != "SUCCESS")
                    thatForm(data.ret);

                sap.m.MessageToast.show("Saved Successfully ,# " + sv + ",  Sqls executed..!");
                for (var o in qrys) {
                    qryObj = qrys[o];
                    thatForm.loadData(qryObj);
                }
            });
        };

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
                        val = tbl[key].getValue();
                    if (tbl[key].field_type != undefined && tbl[key].field_type == "money")
                        val = df.parse(tbl[key].getValue());

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



