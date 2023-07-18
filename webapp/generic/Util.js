sap.ui.define("sap/ui/ce/generic/Util", [],
    function () {
        "use strict";
        var Util = {
            ajaxPre: "",
            matchArray: function (str, array) {
                for (var a in array) {
                    var v = str.match(array[a]);
                    if (v != undefined && v.length > 0)
                        return v;
                }
                return null;
            },
            objToStr: function (obj) {
                var str = '';
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        str += p + '::' + obj[p] + '\n';
                    }
                }
                return str;
            },
            splitString: function (string, splitters) {
                var list = [string];
                for (var i = 0, len = splitters.length; i < len; i++) {
                    this.traverseList(list, splitters[i], 0);
                }
                return this.flatten(list);
            },
            traverseList: function (list, splitter, index) {
                //console.log("list="+list[index]);
                if (list[index]) {
                    if ((list.constructor !== String) && (list[index].constructor === String))
                        (list[index] != list[index].split(splitter)) ? list[index] = list[index].split(splitter) : null;
                    (list[index].constructor === Array) ? this.traverseList(list[index], splitter, 0) : null;
                    (list.constructor === Array) ? this.traverseList(list, splitter, index + 1) : null;
                }
            },
            flatten: function (arr) {
                var that = this;
                return arr.reduce(function (acc, val) {
                    //console.log("acc="+acc+" val="+val," val Array ? = "+(val.constructor === Array) );
                    return acc.concat(val.constructor === Array ? that.flatten(val) : val);
                }, []);
            },
            addDaysFromDate(dt, days) {
                var d = new Date(dt);
                if (days >= 0)
                    d.setDate(dt.getDate() + days);
                else
                    d.setDate(dt.getDate() - Math.abs(days));
                return d;
            },
            doAjaxGetSpin: function (path,
                content,
                async, fnDone, fnFail, chk) {
                if (chk == undefined || chk)
                    this.doSpin("Executing Query...");
                var that = this;
                setTimeout(function () {
                    that.doAjaxGet(path, content, async).done(fnDone);
                }, 100);
            },
            doAjaxGet: function (path,
                content,
                async) {
                var params = {
                    url: this.ajaxPre + path,
                    context: this,
                    cache: false
                };
                params["type"] = "GET";
                if (async === false) {
                    params["async"] = async;
                }
                if (content) {
                    params["data"] = content;
                }
                return jQuery.ajax(params);
            },
            doXhr: function (path,
                async, onld) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', path, async);
                xhr.responseType = 'arraybuffer';
                xhr.onload = onld;
                xhr.send();
                return xhr;
            },
            doXhrUpdateVouAttach: function (path,
                async, file, kf, descr) {
                var formData = new FormData();
                if (file != undefined) {
                    formData.append("data", file);
                    formData.append("keyfld", kf);
                    formData.append("descr", descr);
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', path, async);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                sap.m.MessageToast.show("File uploaded successfully!");
                            } else {
                                sap.m.MessageToast.show("Failed to upload file.");
                            }
                        }
                    };
                    xhr.send(formData);
                    return xhr;
                }
                else {
                    Util.execSQL("delete from c7_attach where keyfld=" + kf);
                }
                return ;
            },
            doAjaxPost: function (path,
                content,
                async) {
                var params = {
                    url: this.ajaxPre + path,
                    context: this,
                    cache: false
                };
                params["type"] = "POST";
                if (async === false) {
                    params["async"] = async;
                }
                if (content) {
                    params["data"] = content;
                }
                return jQuery.ajax(params);
            },
            doAjaxJson: function (path,
                content,
                async, saveQryName) {
                var params = {
                    url: this.ajaxPre + path,
                    context: this,
                    cache: false,
                    dataType: 'json',
                    contentType: 'application/json',
                    mimeType: 'application/json'
                };
                params["type"] = "POST";
                if (async === false) {
                    params["async"] = async;
                }
                if (content) {
                    params["data"] = JSON.stringify(content);
                }
                if (saveQryName) {
                    params["saveQryName"] = JSON.stringify(saveQryName);
                }
                // console.log(content);
                return jQuery.ajax(params);
            },
            getServerValue: function (str) {
                var ret;
                this.doAjaxGet(str, null, false).done(function (data) {
                    ret = JSON.parse(data).return;
                });
                return ret;
            },
            nvl: function (val1, val2) {
                if (typeof val1 == "function")
                    return val1;

                return ((val1 == null || val1 == undefined || val1.length == 0) ? val2 : val1);
            },
            nvlObjToStr: function (val1, val2) {
                return ((val1 == null || val1 == undefined || val1.length == 0) ? val2 + "" : val1 + "");
            },
            createBar: function (lblId, pBackMaster) {
                var backMaster = this.nvl(pBackMaster, true);
                var b = new sap.m.Button({
                    icon: "sap-icon://full-screen",
                    press: function () {
                        var app = sap.ui.getCore().byId("oSplitApp");
                        if (app.getMode() == sap.m.SplitAppMode.HideMode)
                            app.setMode(sap.m.SplitAppMode.ShowHideMode);
                        else
                            app.setMode(sap.m.SplitAppMode.HideMode);

                        if (window.$.browser.msie) {
                            setTimeout(that.afterUpdate, 0);
                        } else {
                            setTimeout(function () {
                                // resize must be registered on the element
                                window.dispatchEvent(new Event('resize'));

                            });

                        }
                    }
                });
                var flRight = new sap.m.FlexBox({ direction: sap.m.FlexDirection.Row, items: [b] });
                var flLeft = new sap.m.FlexBox({
                    direction: sap.m.FlexDirection.Row, items: [new sap.m.Button({
                        icon: "sap-icon://arrow-left",
                        press: function () {
                            var app = sap.ui.getCore().byId("oSplitApp");
                            if (!sap.ui.Device.system.phone) {
                                //app.toDetail(app.getDetailPages()[0]);
                                app.backDetail();
                                if (backMaster)
                                    app.toMaster(app.getMasterPages()[0]);
                            } else {
                                app.backMaster();
                                // if (backMaster)
                                //     app.showMaster();
                            }
                        }
                    })]
                });
                var flMiddle = new sap.m.FlexBox({
                    direction: sap.m.FlexDirection.Row, items: [new sap.m.Label({
                        text: lblId,
                        textAlign: "Center",
                        design: "Bold"
                    })]
                });

                var oBar = new sap.m.Bar({
                    contentLeft: [flLeft],
                    contentMiddle: [flMiddle],

                    contentRight: [flRight]

                }).addStyleClass("sapContrast sapMIBar");
                return oBar;
            },
            cssText: function (a) {

            },
            css: function (a) {
                var sheets = document.styleSheets, o = {};
                for (var i in sheets) {
                    var rules = sheets[i].rules || sheets[i].cssRules;
                    for (var r in rules) {
                        if (a.is(rules[r].selectorText)) {
                            o = $.extend(o, this.css2json(rules[r].style), this.css2json(a.attr('style')));
                        }
                    }
                }
                return o;
            },
            css2json: function (css) {
                var s = {};
                if (!css) return s;
                if (css instanceof CSSStyleDeclaration) {
                    for (var i in css) {
                        if ((css[i]).toLowerCase) {
                            s[(css[i]).toLowerCase()] = (css[css[i]]);
                        }
                    }
                } else if (typeof css == "string") {
                    css = css.split("; ");
                    for (var i in css) {
                        var l = css[i].split(": ");
                        s[l[0].toLowerCase()] = (l[1]);
                    }
                }
                return s;
            },

            cloneObj: function (obj) {
                if (null == obj || "object" != typeof obj) return obj;

                var copy = null;
                if (obj.prototype.constructor)
                    copy = obj.constructor();
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
                }
                return copy;
            },

            realStyle: function (_elem, _style) {
                var computedStyle;
                if (typeof _elem.currentStyle != 'undefined') {
                    computedStyle = _elem.currentStyle;
                } else {
                    computedStyle = document.defaultView.getComputedStyle(_elem, null);
                }

                return _style ? computedStyle[_style] : computedStyle;
            },
            copyComputedStyle: function (src, dest) {
                var s = this.realStyle(src);
                for (var i in s) {
                    // Do not use `hasOwnProperty`, nothing will get copied
                    if (typeof i == "string" && i != "cssText" && !/\d/.test(i)) {
                        // The try is for setter only properties
                        try {
                            dest.style[i] = s[i];
                            // `fontSize` comes before `font` If `font` is empty, `fontSize` gets
                            // overwritten.  So make sure to reset this property. (hackyhackhack)
                            // Other properties may need similar treatment
                            if (i == "font") {
                                dest.style.fontSize = s.fontSize;
                            }
                        } catch (e) {
                        }
                    }
                }
            },
            realStyle2: function (_elem, _style) {
                var computedStyle;
                if (typeof _elem.currentStyle != 'undefined') {
                    computedStyle = _elem.currentStyle;
                } else {
                    computedStyle = document.defaultView.getComputedStyle(_elem, null);
                }

                return _style ? computedStyle[_style] : computedStyle;
            },
            copyComputedStyle2: function (src, dest, ps) {
                var s = this.realStyle2(src);
                for (var i in s) {
                    // Do not use `hasOwnProperty`, nothing will get copied
                    if (typeof i == "string" && i != "cssText" && !/\d/.test(i)) {
                        // The try is for setter only properties
                        try {
                            dest.style[i] = s[i];
                            // `fontSize` comes before `font` If `font` is empty, `fontSize` gets
                            // overwritten.  So make sure to reset this property. (hackyhackhack)
                            // Other properties may need similar treatment
                            if (i == "font") {
                                dest.style.fontSize = s.fontSize;
                            }
                        } catch (e) {
                        }
                    }
                }
            },
            getAlignTable: function (cc) {
                var al = sap.ui.core.TextAlign.Begin;
                if (cc == "left" || cc == "ALIGN_LEFT")
                    al = sap.ui.core.TextAlign.Left;
                if (cc == "right" || cc == "ALIGN_RIGHT")
                    al = sap.ui.core.TextAlign.Right;
                if (cc == "center" || cc == "ALIGN_CENTER")
                    al = sap.ui.core.TextAlign.Center;
                if (cc == "end" || cc == "ALIGN_END")
                    al = sap.ui.core.TextAlign.End;
                if (cc == "begin" || cc == "ALIGN_BEGIN")
                    al = sap.ui.core.TextAlign.Begin;

                return al;
            },
            createParas: function (view, pg, st, idAdd, pShowAll, pWidth, forceshowGroups) {
                //declaring variables will be used in function
                var ia = Util.nvl(idAdd, "");
                var showAll = (pShowAll == undefined ? false : pShowAll);
                var query_para = {};
                if (sap.ui.getCore().getModel("query_para") != undefined)
                    query_para = sap.ui.getCore().getModel("query_para").getData();
                var thatView = view;
                var dtx = thatView.colData;
                var sett = sap.ui.getCore().getModel("settings").getData();
                var df = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
                var combobox = sap.m.ComboBox;
                var searchfield = sap.m.SearchField;
                var input = sap.m.Input;
                var datepicker = sap.m.DatePicker;
                var label = sap.ui.commons.Label;
                var checkbox = sap.m.CheckBox;
                var that = this;
                // adding groups header and detail,if groups found more than 2 otherwise forceshowGroups ==true
                if (forceshowGroups || dtx.groups.length > 2) {
                    (thatView.byId("txtGroupHeader") != undefined ? thatView.byId("txtGroupHeader").destroy() : null);
                    var txtGroupHeader = new sap.m.ComboBox(thatView.createId("txtGroupHeader"),
                        {
                            items: {
                                path: "/",
                                template: new sap.ui.core.ListItem({
                                    text: "{group_name}",
                                    key: "{group_name}"
                                }),
                                templateShareable: true
                            },
                            value: dtx.group1.default

                        }).addStyleClass(st);
                    (thatView.byId("lblgroupheader") != undefined ? thatView.byId("lblgroupheader").destroy() : null);
                    var lblG = new sap.m.Label(thatView.createId("lblgroupheader"), {
                        text: "Group Header",
                        labelFor: txtGroupHeader
                    }).addStyleClass(st);

                    (thatView.byId("txtGroupDetail") != undefined ? thatView.byId("txtGroupDetail").destroy() : null);
                    var txtGroupDetail = new sap.m.ComboBox(thatView.createId("txtGroupDetail"),
                        {
                            items: {
                                path: "/",
                                template: new sap.ui.core.ListItem({
                                    text: "{group_name}",
                                    key: "{group_name}"
                                }),
                                templateShareable: true
                            },
                            value: dtx.group2.default
                        }).addStyleClass(st);

                    (thatView.byId("lblgroupdetail") != undefined ? thatView.byId("lblgroupdetail").destroy() : null);
                    var lblD = new sap.m.Label(thatView.createId("lblgroupdetail"), {
                        text: "Group Details",
                        labelFor: txtGroupDetail
                    }).addStyleClass(st);

                    txtGroupDetail.setModel(new sap.ui.model.json.JSONModel(dtx.groups));
                    txtGroupHeader.setModel(new sap.ui.model.json.JSONModel(dtx.groups));

                    var e1 = Util.nvl(dtx.group1.exclude, "").split(",");
                    for (var e in e1)
                        txtGroupHeader.removeItem(this.findComboItem(txtGroupHeader, e1[e]));
                    var e2 = Util.nvl(dtx.group2.exclude, "").split(",");
                    for (var e in e2)
                        txtGroupDetail.removeItem(this.findComboItem(txtGroupDetail, e2[e]));

                    if (pg instanceof sap.m.FlexBox) {
                        if (dtx.group1.visible == 'TRUE') {
                            pg.addItem(lblG);
                            pg.addItem(txtGroupHeader);
                        }
                        if (dtx.group2.visible == 'TRUE') {
                            pg.addItem(lblD);
                            pg.addItem(txtGroupDetail);
                        }

                    } else {
                        if (dtx.group1.visible == 'TRUE') {
                            pg.addContent(lblG);
                            pg.addContent(txtGroupHeader);
                        }
                        if (dtx.group2.visible == 'TRUE') {
                            pg.addContent(lblD);
                            pg.addContent(txtGroupDetail);
                        }
                    }

                }
                // adding parameters ...
                var lval = ""
                    , cval = "", tit = "";
                for (var i = 0; i < Util.nvl(dtx.parameters, []).length; i++) {
                    var p, pl = undefined, vls;
                    cval = that.getLangDescrAR(dtx.parameters[i].PARA_DESCRARB, dtx.parameters[i].PARA_DESCRENG);
                    tit = that.getLangDescrAR(dtx.parameters[i].TITLE_GROUP, dtx.parameters[i].TITLE_GROUP_AR);
                    vls = "";
                    if (dtx.parameters[i].PARA_DEFAULT != undefined)
                        vls = dtx.parameters[i].PARA_DEFAULT;
                    if (query_para[dtx.parameters[i].PARAM_NAME] != undefined && query_para[dtx.parameters[i].PARAM_NAME] + "".length != 0)
                        vls = query_para[dtx.parameters[i].PARAM_NAME];
                    (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                    (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                    if (dtx.parameters[i].LISTNAME != undefined && dtx.parameters[i].LISTNAME.toString().trim().length > 0) {
                        var dtlist = dtx.parameters[i].LISTNAME;

                        p = new searchfield(thatView.createId("para_" + ia + i),
                            {
                                value: vls,
                                width: this.nvl(pWidth, dtx.parameters[i].WIDTH),
                                customData: [{ key: dtlist }],
                                search: function (e) {
                                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed)
                                        return;
                                    var src = e.getSource();
                                    var dtlist2 = src.getCustomData()[0].getKey();
                                    var q = e.getParameters("query").query;
                                    if ((q == undefined || q.trim() == "") && (thatView.searchNullFirstTime == undefined || thatView.searchNullFirstTime == false)) {
                                        thatView.searchNullFirstTime = true;
                                        return;
                                    }

                                    thatView.searchNullFirstTime = false;

                                    var v = dtlist2.replace(/&SEARCHTITLE/g, q).replace(/&SEARCHCODE/g, "%");
                                    if (q != undefined && q.endsWith("%")) {
                                        v = dtlist2.replace(/&SEARCHCODE/g, q);
                                        v = v.replace(/&SEARCHTITLE/g, '');
                                    }

                                    Util.doAjaxJson("sqlmetadata", {
                                        sql: v,
                                        ret: "NONE",
                                        data: null
                                    }, false).done(function (data) {
                                        console.log(data);
                                        var dt = JSON.parse("{" + data.data + "}").data;
                                        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(dt), "searchList");
                                        var t = {
                                            frag_liveChange: function (event) {
                                                var val = event.getParameter("value");
                                                var filter = new sap.ui.model.Filter("TITLE", sap.ui.model.FilterOperator.Contains, val);
                                                var binding = event.getSource().getBinding("items");
                                                binding.filter(filter);
                                            },
                                            frag_confirm: function (event) {
                                                var val = event.getParameters().selectedItem.getTitle();
                                                var valx = event.getParameters().selectedItem.getCustomData()[0];
                                                //console.log(valx+"- "+val);
                                                sap.m.MessageToast.show(valx.getKey());
                                                src.setValue(valx.getKey());

                                            }
                                        };
                                        var oFragment = sap.ui.jsfragment("bin.searchList", t);
                                        oFragment.open();
                                    });
                                }
                            }).addStyleClass(st);
                        if (lval != cval)
                            pl = new label(thatView.createId("lblpara_" + ia + i), {
                                text: cval,
                                // labelFor: p
                            }).addStyleClass(st);


                    } else {
                        if (dtx.parameters[i].PARA_DATATYPE !== "DATE" || dtx.parameters[i].PARA_DATATYPE !== "BOOLEAN") {
                            (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                            (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                            p = new input(thatView.createId("para_" + ia + i), {
                                placeholder: dtx.parameters[i].PARA_DESCRARB,
                                value: vls,
                                width: this.nvl(pWidth, dtx.parameters[i].WIDTH),
                            }).addStyleClass(st);
                            if (lval != cval)
                                pl = new label(thatView.createId("lblpara_" + ia + i), {
                                    text: cval,
                                    // labelFor: p
                                }).addStyleClass(st);
                        } // end if for PARA_DATATYPE !== "DATE" || PARA_DATATYPE !== "BOOLEAN"
                    }
                    if (dtx.parameters[i].PARA_DATATYPE === "DATE") {
                        var vl = null;
                        if (dtx.parameters[i].PARA_DEFAULT != undefined)
                            vl = dtx.parameters[i].PARA_DEFAULT;
                        if (vls != undefined)
                            vl = vls;
                        (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                        (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                        p = new datepicker(thatView.createId("para_" + ia + i), {
                            value: (vl != undefined ? vl : ""),
                            valueFormat: sett["ENGLISH_DATE_FORMAT"],
                            displayFormat: sett["ENGLISH_DATE_FORMAT"],
                            placeholder: cval,
                            width: this.nvl(pWidth, dtx.parameters[i].WIDTH),
                        }).addStyleClass(st);
                        if (lval != cval)
                            pl = new label(thatView.createId("lblpara_" + ia + i), {
                                text: cval,
                                // labelFor: p
                            }).addStyleClass(st);
                    }
                    if (dtx.parameters[i].PARA_DATATYPE === "BOOLEAN") {
                        (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                        (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);
                        p = new checkbox(thatView.createId("para_" + ia + i), {
                            selected: (vls == "TRUE" ? true : false),
                            //text: dtx.parameters[i].PARA_DESCRARB,
                            width: this.nvl(pWidth, dtx.parameters[i].WIDTH),
                        });
                        if (lval != cval)
                            pl = new label(thatView.createId("lblpara_" + ia + i), {
                                text: cval,
                                //                                labelFor: p
                            }).addStyleClass(st);

                    }
                    if (dtx.parameters[i].PARA_DATATYPE === "GROUP") {
                        var ls1 = dtx.parameters[i].LISTNAME.split(",");
                        var si = 0; // selected index...
                        var bts = [];
                        for (var l in ls1) {
                            var l2 = ls1[l].split("=");
                            var bt = new sap.m.RadioButton(
                                {
                                    text: l2[0], customData: [{ key: l2[1] }]
                                }
                            );
                            if (l2[1] == dtx.parameters[i].PARA_DEFAULT)
                                si = l;
                            bts.push(bt);
                        }

                        (thatView.byId("para_" + ia + i) != undefined ? thatView.byId("para_" + ia + i).destroy() : null);
                        (thatView.byId("lblpara_" + ia + i) != undefined ? thatView.byId("lblpara_" + ia + i).destroy() : null);

                        p = new sap.m.RadioButtonGroup(thatView.createId("para_" + ia + i), {
                            selectedIndex: (si != 0 ? Number(si) : si),
                            buttons: bts
                        });
                        if (lval != cval)
                            pl = new label(thatView.createId("lblpara_" + ia + i), {
                                text: cval,
                                // labelFor: p
                            }).addStyleClass(st);
                    }

                    if (showAll || dtx.parameters[i].PROMPT_TYPE != "A") {
                        if (pg instanceof sap.m.FlexBox) {
                            if (pl != undefined) pg.addItem(pl);
                            pg.addItem(p);
                        } else {
                            if (Util.nvl(tit, "").length > 0)
                                pg.addContent(new sap.ui.commons.Title({ text: tit }));
                            if (pl != undefined) pg.addContent(pl);
                            if (p != undefined) {
                                var lc = pg.getContent()[pg.getContent().length - 1];
                                pg.addContent(p);
                                if (pl == undefined) {
                                    p.setLayoutData(new sap.ui.layout.GridData({ span: "XL1 L2 M3 S4" }));
                                    lc.setLayoutData(new sap.ui.layout.GridData({ span: "XL1 L2 M3 S4" }));
                                }
                            }
                            //pg.addContent(pl);
                        }
                    }
                    lval = cval;
                    //else   // else dtx.parameter.prompt_type==="A"
                    //  view.advance_para.push({"label": pl, "input": p});

                }

            },  //ending here createParas function
            addMenuSubReps: function (view, oMenu, includeGraphOperation) {
                var menu11 = oMenu;
                if (includeGraphOperation) {
                    menu11 = new sap.m.MenuItem({
                        text: "Sub Reports",
                        icon: "sap-icon://column-chart-dual-axis",
                    });

                    var menu111 = new sap.m.MenuItem({
                        text: "Create new..",
                        icon: "images/add.png",
                        customData: [{ key: "graph_new" }]
                    });
                    menu11.addItem(menu111);
                }

                if (view.colData.subreps != undefined) {
                    var cols = [];
                    if (view.qv.mLctb != undefined)
                        for (var c in view.qv.mLctb.cols)
                            if (!view.qv.mLctb.cols[c].mGrouped)
                                cols.push(view.qv.mLctb.cols[c].mColName);
                    for (var i = 0; i < view.colData.subreps.length; i++) {
                        var dms = view.colData.subreps[i].DIMENSIONS.split(",");
                        var fnd = true;
                        if (view.colData.subreps[i].REP_TYPE == "DATASET") {
                            for (var d in dms)
                                if (cols.indexOf(dms[d]) <= -1) {
                                    fnd = false;
                                    break;
                                }
                            if (cols.indexOf(view.colData.subreps[i].MEASURES) <= -1)
                                fnd = false;
                        } else if (view.colData.subreps[i].REP_TYPE == "SQL" || view.colData.subreps[i].REP_TYPE == "PDF") {
                            fnd = true;
                        } else if (view.colData.subreps[i].REP_TYPE.startsWith("FIX_")) {
                            fnd = false;
                            //break;
                        }
                        if (fnd)
                            menu11.addItem(new sap.m.MenuItem({
                                text: this.getLangDescrAR(view.colData.subreps[i].REP_TITLE, view.colData.subreps[i].REP_TITLE_ARB),
                                customData: [{ key: "graph" }, { value: view.colData.subreps[i] }]
                            }));

                    }
                }
                if (oMenu != menu11)
                    oMenu.addItem(menu11);
            },
            charCount: function (ch, cnt) {
                var s = "";
                for (var i = 0; i < cnt; i++)
                    s += ch;

                return s;
            },
            toOraDateString: function (dt) {
                var sett = sap.ui.getCore().getModel("settings").getData();

                if (typeof dt == "string") {
                    return "to_date('" + dt + "','" + sett["ENGLISH_DATE_FORMAT_ORA"] + "')";
                } else if (dt instanceof Date) {
                    var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
                    return "to_date('" + sf.format(dt) + "','" + sett["ENGLISH_DATE_FORMAT_ORA"] + "')";
                }
            },
            quoted: function (qt) {
                return "'" + this.nvl(qt, "") + "'";
            },
            getSettings: function (qt) {
                var sett = sap.ui.getCore().getModel("settings").getData();
                return sett[qt];
            },
            toOraDateTimeString: function (dt) {
                var sett = sap.ui.getCore().getModel("settings").getData();

                if (typeof dt == "string") {
                    return "to_date('" + dt + "','" + Util.nvl(sett["ENGLISH_DATE_FORMAT_ORA"], "DD/MM/RRRR HH24.MI") + "')";
                } else if (dt instanceof Date) {
                    var sf = new simpleDateFormat(Util.nvl(sett["ENGLISH_DATE_FORMAT_LONG"], 'dd/MM/yyyy k.m'));
                    return "to_date('" + sf.format(dt) + "','" + Util.nvl(sett["ENGLISH_DATE_FORMAT_ORA_LONG"], "DD/MM/RRRR HH24.MI") + "')";
                }
            },
            createGrid2Obj: function (grid, layoutData1, layoutData2, lblStr, inputObjClass) {
                var ld1 = layoutData1, ld2 = layoutData2;
                if (typeof ld1 == "string")
                    ld1 = { span: ld1 };
                if (typeof ld2 == "string")
                    ld2 = { span: ld2 };

                var o = new inputObjClass({ width: "100%" });
                o.setLayoutData(new sap.ui.layout.GridData(ld2));
                var l = new sap.m.Label({ text: lblStr, layoutData: ld1 });
                grid.addContent(l);
                grid.addContent(o);
                return { label: l, obj: o };
            },
            findComboItem: function (combo, value) {
                for (var i = 0; i < combo.getItems().length; i++) {
                    if (combo.getItems()[i] != undefined && combo.getItems()[i].getKey() == value)
                        return combo.getItems()[i];
                }
            },
            fillCombo: function (combo, sq, async) {
                var sq2 = {
                    sql: sq,
                    ret: "NONE",
                    data: null
                };
                if (typeof sq == "string")
                    this.doAjaxJson("sqldata", sq2, (async == undefined ? false : async)).done(function (data) {
                        if (data.ret != "SUCCESS") {
                            sap.m.MessageToast.show(data.ret);
                            return;
                        }
                        for (var i = combo.getItems().length; i > -1; i--)
                            if (combo.getItems()[i] != undefined) combo.getItems()[i].destroy();
                        combo.removeAllItems();
                        combo.destroyItems();
                        combo.destroyAggregation("items");
                        var dtx = JSON.parse("{" + data.data + "}").data;
                        combo.setModel(null);
                        combo.setModel(new sap.ui.model.json.JSONModel(dtx));
                        var f1 = "", f2 = "", cnt = -1;
                        if (dtx != null && dtx.length > 0)
                            for (var k in dtx[0]) {
                                cnt++;
                                if (cnt == 0)
                                    f1 = k;
                                if (cnt == 1)
                                    f2 = k;
                            }
                        f2 = Util.nvl(f2, f1);
                        var k = new sap.ui.core.ListItem({ text: "{" + f2 + "}", key: "{" + f1 + "}" });
                        combo.bindAggregation("items", "/", k);
                        if (combo.getItems().length > 0)
                            combo.setSelectedItem(combo.getItems()[0]);
                    });
                if (typeof sq == "object") {
                    var dtx = sq;
                    var f1 = "", f2 = "", cnt = -1;
                    if (dtx.length > 0)
                        for (var k in dtx[0]) {
                            cnt++;
                            if (cnt == 0)
                                f1 = k;
                            if (cnt == 1)
                                f2 = k;
                        }
                    f2 = Util.nvl(f2, f1);
                    combo.setModel(new sap.ui.model.json.JSONModel(dtx));
                    var k = new sap.ui.core.ListItem({ text: "{" + f2 + "}", key: "{" + f1 + "}" });
                    combo.bindAggregation("items", "/", k);
                }
                if (combo.getItems().length > 0)
                    combo.setSelectedItem(combo.getItems()[0]);

            },
            setComboValue: function (combo, value) {
                for (var i = 0; i < combo.getItems().length; i++) {
                    if (combo.getItems()[i].getKey() == value) {
                        combo.setSelectedItem(combo.getItems()[i]);
                        combo.fireSelectionChange();
                        break;
                    }

                }
            },
            htmlEntities: function (str) {
                return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            },
            doSpin: function (str) {
                this.busyDialog = new sap.m.BusyDialog({
                    text: str,
                });
                this.busyDialog.open();

            },
            stopSpin: function () {
                if (this.busyDialog != undefined) {
                    this.busyDialog.close();
                    this.busyDialog.destroy();
                    this.busyDialog = undefined;
                }
            },
            getParsedJsonValue: function (vl, rawValue) {
                var rv = this.nvl(rawValue, false);

                if (!rv)
                    return (typeof vl == "number" ? vl :
                        '"' + Util.nvl(vl, "").replace(/\\n/g, "\\n")
                            .replace(/\\/g, "\\\\")
                            .replace(/\\'/g, "\\'")
                            .replace(/"/g, '\\"')
                            .replace(/\\&/g, "\\&")
                            .replace(/\\r/g, "\\r")
                            .replace(/\\t/g, "\\t")
                            .replace(/\\b/g, "\\b")
                            .replace(/\\f/g, "\\f")
                            .trim() + '"');

                return (typeof vl == "number" ? vl :
                    '' + Util.nvl(vl, "").replace(/\\n/g, "\\n")
                        .replace(/\\/g, "\\\\")
                        .replace(/\\'/g, "\\'")
                        .replace(/"/g, '\\"')
                        .replace(/\\&/g, "\\&")
                        .replace(/\\r/g, "\\r")
                        .replace(/\\t/g, "\\t")
                        .replace(/\\b/g, "\\b")
                        .replace(/\\f/g, "\\f")
                        .trim() + '');

                // if (!rv)
                //     return (typeof vl == "number" ? vl :
                //         '"' + Util.nvl(vl, "") + "".replace(/\"/g, "'").replace(/\n/, "\\r").replace(/\r/, "\\r").replace(/\\/g, "\\\\").trim() + '"');
                //
                // return (typeof vl == "number" ? vl :
                //     '' + Util.nvl(vl, "") + "".replace(/\"/g, "'").replace(/\n/, "\\r").replace(/\r/, "\\r").replace(/\\/g, "\\\\").trim() + '');
                //
            },
            getLangText: function (str) {
                return UtilGen.DBView.getModel("i18n").getResourceBundle().getText(str);
            },
            setLanguageModel: function (view) {
                var ResourceModel = sap.ui.model.resource.ResourceModel;
                var sLangu =
                    sap.ui.getCore().getConfiguration().getLanguage();
                var oLangu = new ResourceModel(
                    {
                        bundleUrl: (sLangu == "AR" ? "i18n/i18n_ar.properties" : "i18n/i18n.properties"),

                        "bundleLocale": sLangu
                    });

                view.setModel(oLangu, "i18n");
                view.sLangu = sLangu;

            },
            cookieGet: function (cname) {
                var name = cname + "=";
                var decodedCookie = decodeURIComponent(document.cookie);
                var ca = decodedCookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            },

            cookieSet: function setCookie(cname, cvalue, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
            },
            cookieDelete: function (cname) {
                document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            },
            cookiesClear: function () {
                var cookies = document.cookie.split(";");

                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i];
                    var eqPos = cookie.indexOf("=");
                    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                }
            },
            getLangCaption: function (str, optStr) {
                if (this.isCamelCase(str))
                    return this.getLangText(str);
                else
                    return this.nvl(optStr, str);

            },
            getLangDescrAR: function (enStr, otStr, sLang) {
                var s = Util.nvl(sLang, sap.ui.getCore().getConfiguration().getLanguage());
                return (s == "AR" ? this.nvl(otStr, enStr) : enStr);

            },
            isCamelCase: function (str) {
                //chatGPT
                // Check if string starts with a lowercase letter
                if (/^[a-z]/.test(str)) {
                    // Check if string contains any uppercase letters
                    if (/[A-Z]/.test(str)) {
                        // Check if string contains any underscores or spaces
                        if (/[_\s]/.test(str)) {
                            return false; // Not in camelCase format
                        } else {
                            return true; // In camelCase format
                        }
                    } else {
                        return false; // Not in camelCase format
                    }
                } else {
                    return false; // Not in camelCase format
                }
            },
            showSearchTable: function (sql, container, pflcol, fnOnselect, multiSelect, ppms, dta, jsCmd) {

                if (container instanceof sap.m.VBox)
                    container.removeAllItems();
                else
                    container.removeAllContent();
                var tm = new Date().getTime();
                var qv = new QueryView("searchTbl" + tm);
                qv.getControl().setFixedBottomRowCount(0);
                qv.getControl().addStyleClass("sapUiSizeCondensed");

                if (fnOnselect != undefined) {
                    qv.getControl().attachRowSelectionChange(undefined, function () {
                        fnOnselect();
                    });
                }
                var flcol = pflcol;
                var searchField = new sap.m.SearchField({
                    liveChange: function (event) {
                        var flts = [];
                        var val = event.getParameter("newValue");
                        for (var i in qv.mLctb.cols) {
                            if (flcol != undefined && flcol.indexOf(qv.mLctb.cols[i].mColName) > -1) {
                                if (qv.mLctb.cols[i].getMUIHelper().data_type == "STRING")
                                    flts.push(new sap.ui.model.Filter({
                                        path: qv.mLctb.cols[i].mColName,
                                        operator: sap.ui.model.FilterOperator.Contains,
                                        value1: val
                                    }));
                                if (qv.mLctb.cols[i].getMUIHelper().data_type == "NUMBER")
                                    flts.push(new sap.ui.model.Filter({
                                        path: qv.mLctb.cols[i].mColName,
                                        operator: sap.ui.model.FilterOperator.EQ,
                                        value1: val
                                    }));

                            }
                        }
                        var f = new sap.ui.model.Filter({
                            filters: flts,
                            and: false
                        });
                        var lst = qv.getControl();

                        var filter = new sap.ui.model.Filter(f, false);
                        var binding = lst.getBinding("rows");
                        binding.filter(filter);
                    }
                });
                if (container instanceof sap.m.VBox)
                    container.addItem(searchField);
                else
                    container.addHeaderContent(searchField);
                var dat = {};
                if (!sql.startsWith("@"))
                    dat = (dta != undefined ? dta : this.execSQL(sql));
                else dat = Util.getRowData(sql);
                if (dta != undefined || (dat.ret == "SUCCESS" && dat.data.length > 0)) {
                    if (dta == undefined) {
                        // qv.setJsonStr("{" + dat.data + "}");
                        qv.setJsonStrMetaData("{" + dat.data + "}");
                        var ld = qv.mLctb;
                        if (jsCmd != undefined && jsCmd.length > 0)
                            for (var gi in jsCmd) {
                                if (jsCmd[gi].hasOwnProperty("general"))
                                    continue;
                                var cn = Object.keys(jsCmd[gi])[0];
                                var prop = jsCmd[gi][cn];
                                for (var pp in prop) {
                                    if (pp == "display_format") {
                                        var c = ld.getColPos(cn);
                                        ld.cols[c].getMUIHelper().display_format = prop[pp];
                                    }
                                    if (pp == "hide") {
                                        var c = ld.getColPos(cn);
                                        ld.cols[c].mHideCol = prop[pp];
                                    }
                                }
                            }
                        qv.mLctb.parse("{" + dat.data + "}", true);
                    }
                    else
                        qv.mLctb = dta;

                    if (ppms != undefined && ppms.parent != "") {
                        qv.mColCode = ppms.code;
                        qv.mColName = ppms.name;
                        qv.mColParent = ppms.parent;
                        qv.switchType("tree");
                        qv.getControl().setFixedBottomRowCount(0);
                        qv.getControl().addStyleClass("sapUiSizeCondensed");
                        if (fnOnselect != undefined) {
                            qv.getControl().attachRowSelectionChange(undefined, function () {
                                fnOnselect();
                            });
                        }

                    }
                    qv.loadData();
                    if (qv.queryType == "tree")
                        qv.getControl().expandToLevel(10);
                    qv.autoResizeColumns("100%");
                    if (container instanceof sap.m.VBox)
                        container.addItem(qv.getControl());
                    else
                        container.addContent(qv.getControl());
                    if (!Util.nvl(multiSelect, false)) {
                        qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
                    }
                    qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
                    qv.getControl().setFirstVisibleRow(0);

                    if (flcol == undefined) {
                        flcol = [];
                        for (var ci in qv.mLctb.cols)
                            flcol.push(qv.mLctb.cols[ci].mColName);

                    }

                    return qv;
                }

                return null;
            },
            getRowData: function (sql) {
                var dtxx = [];
                var spt = sql.substring(1).split(",");
                for (var i1 in spt) {
                    var dttt = { CODE: "", TITLE: "" };
                    var sx = spt[i1].split("/");
                    dttt.CODE = "" + sx[0];
                    dttt.TITLE = "" + sx[1];
                    dtxx.push(dttt);
                }
                var md = '"metadata": [{"colname":"CODE","width":50,"data_type":"STRING"},{"colname":"TITLE","width":150,"data_type":"STRING"}]';
                var dt = JSON.stringify(dtxx);
                return { sql: sql, ret: "SUCCESS", data: md + ",\"data\":" + dt };
            },
            showSearchList: function (sql, colDes, colVal, fnConfirm, tit) {
                // if (e.getParameters().refreshButtonPressed)
                //     return;
                //
                // if (e.getParameters().clearButtonPressed) {
                //     that.subs.athlet_code.setValue("");
                //     return
                // }

                var v = sql;
                Util.doAjaxJson("sqlmetadata", {
                    sql: v,
                    ret: "NONE",
                    data: null
                }, false).done(function (data) {
                    // console.log(data);
                    var dt = JSON.parse("{" + data.data + "}").data;
                    sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(dt), "searchList");
                    var t = {
                        title: Util.nvl(tit, ""),
                        colDes: colDes,
                        colVal: colVal,
                        frag_liveChange: function (event) {
                            var val = event.getParameter("value");
                            var filter = new sap.ui.model.Filter(colDes, sap.ui.model.FilterOperator.Contains, val);
                            var binding = event.getSource().getBinding("items");
                            binding.filter(filter);
                        },
                        frag_confirm: function (event) {
                            var val = event.getParameters().selectedItem.getTitle();
                            var valx = event.getParameters().selectedItem.getCustomData()[0];
                            fnConfirm(valx.getKey(), val);
                            // that.subs.athlet_code.setValue(valx.getKey());
                            // that.subs.athlet_name.setValue(val);
                        }
                    };
                    var oFragment = sap.ui.jsfragment("bin.searchList", t);
                    oFragment.open();
                });
            },
            execSQL: function (sql) {
                var dtx = undefined;
                if (sql.toLowerCase().startsWith("select")) {
                    this.doAjaxJson("sqlmetadata", {
                        sql: sql,
                        ret: "NONE",
                        data: null
                    }
                        ,
                        false
                    ).done(function (data) {
                        dtx = data;
                    });
                }
                else {
                    var oSql = {
                        "sql": sql,
                        "ret": "NONE",
                        "data": null
                    };

                    this.doAjaxJson("sqlexe", oSql, false).done(function (data) {
                        dtx = data;
                    });
                }
                if (dtx == undefined || dtx.ret != "SUCCESS") {
                    console.log(sql);
                    if (dtx != undefined)
                        throw dtx.ret;
                    else
                        throw "Unexpected error in executing sql";
                }
                return dtx;
            },
            execSQLWithData: function (sql, errMsg) {
                var dt = this.execSQL(sql);
                var dtx = undefined;
                if (dt.ret == "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                } else {
                    sap.m.MessageToast.show(errMsg);
                }
                return dtx;
            }
            ,
            getSQLValue: function (sql) {
                var dat = this.execSQL(sql);
                if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                    var dtx = JSON.parse("{" + dat.data + "}").data;
                    if (dtx.length == 0) return "";
                    return dtx[0][Object.keys(dtx[0])[0]];
                    //return dtx[0].VALUE;
                }
                return "";
            },
            show_list: function (sql, cols, retCols, pfnSel, width, height, visibleRowCount, multiSelect, fnShowSel, pppms, dta, jsCmd) {
                // var vbox = new sap.m.VBox({width: "100%"});
                var vbox = new sap.m.Page({ showHeader: true });
                var ppms = Util.nvl(pppms, undefined);
                var fnSel = Util.nvl(pfnSel, undefined);
                if (jsCmd != undefined && jsCmd.length > 0)
                    for (var gi in jsCmd) {
                        if (jsCmd[gi].hasOwnProperty("general") && jsCmd[gi].general.hasOwnProperty("parentCol")) {
                            ppms = Util.nvl(ppms, {});
                            ppms.code = jsCmd[gi].general.parentCol.code;
                            ppms.name = jsCmd[gi].general.parentCol.name;
                            ppms.parent = jsCmd[gi].general.parentCol.parent;
                        }
                        // if (jsCmd[gi].hasOwnProperty("general") && typeof jsCmd[gi].general.onSelect == "function")
                        //     fnSel = jsCmd[gi].general.onSelect;
                    }

                var dlg = new sap.m.Dialog({
                    content: [vbox],
                    contentHeight: this.nvl(height, "500px"),
                    contentWidth: this.nvl(width, "400px")
                });
                dlg.attachBrowserEvent("keydown", function (e) {
                    if (e.key == 'Enter')
                        btn.firePress();

                });
                var btn1 = new sap.m.Button({
                    text: "Close",
                    press: function () {
                        dlg.close();
                    }
                });
                var btn = new sap.m.Button({
                    text: "Select", press: function () {
                        var sl = qv.getControl().getSelectedIndices();
                        if (sl.length <= 0 && !Util.nvl(multiSelect, false)) {
                            sap.m.MessageToast.show("Must select !");
                            return;
                        }
                        var data = [];
                        if (Util.nvl(multiSelect, false))
                            for (var i = 0; i < sl.length; i++) {
                                var odata = qv.getControl().getContextByIndex(sl[i]);
                                data.push(odata.getProperty(odata.getPath()))
                            }
                        else {
                            var odata = qv.getControl().getContextByIndex(sl[0]);
                            data = (odata.getProperty(odata.getPath()))
                        }
                        if (jsCmd != undefined && jsCmd.length > 0)
                            for (var gi in jsCmd) {
                                if (jsCmd[gi].hasOwnProperty("general") && jsCmd[gi].general.hasOwnProperty("onSelect")) {
                                    var ons = jsCmd[gi].general.onSelect.replaceAll("^^", ";");
                                    for (var di in data)
                                        ons = ons.replaceAll("%%" + di, data[di]);
                                    if (eval(ons)) {
                                        dlg.close();
                                        return;
                                    }
                                }

                            }
                        if (fnSel(data, sl[0]))
                            dlg.close();
                    }
                });
                var qv = this.showSearchTable(sql, vbox, cols, function () {
                    if (Util.nvl(multiSelect, false) == false) {
                        sap.m.MessageToast.show("selected !");
                        btn.firePress();
                    }
                }, Util.nvl(multiSelect, false), ppms, dta, jsCmd);

                qv.getControl().addStyleClass("noColumnBorder");
                // if (visibleRowCount != undefined) {
                //     qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
                //     qv.getControl().setVisibleRowCount(this.nvl(visibleRowCount, 6));
                // }

                if (qv == null) return;


                // fnShowSel purpose:  to locate records which is known to be selected.
                if (fnShowSel != undefined)
                    fnShowSel(qv);

                dlg.addButton(btn1);
                dlg.addButton(btn);
                dlg.open();
            },

            getCellColValue: function (tbl, rowno, colname) {
                var oModel = tbl.getModel();
                var cv = oModel.getProperty("/" + rowno + "/" + colname);
                return cv;
            },
            setCellColValue: function (tbl, rowno, colname, value) {
                var oModel = tbl.getModel();
                oModel.setProperty("/" + rowno + "/" + colname, value);
            },
            getCurrentCellColValue: function (tbl, colname) {
                if (tbl.getSelectedIndices().length == 0)
                    return undefined;
                var oModel = tbl.getModel();
                //                var rowVis = tbl.getFirstVisibleRow();
                var i = tbl.getSelectedIndices()[0];
                var cc = tbl.getContextByIndex(i);
                var cv = oModel.getProperty(cc.sPath + "/" + colname);
                return cv;
            },
            destroyID(id, view) {
                var ids = [];
                if (!Array.isArray(id))
                    ids = [id];
                else ids = id;
                for (var i in ids)
                    if (view != undefined)
                        (view.byId(ids[i]) != undefined ? view.byId(ids[i]).destroy() : null);
                    else
                        (sap.ui.getCore().byId(ids[i]) != undefined ? sap.ui.getCore().byId(ids[i]).destroy() : null);
            },
            isNull: function (vl) {
                return ((Util.nvl(vl, "") + "").trim().length == 0 ? true : false);
            },
            getWord: function (str, no) {

                // var sp = str.match(/\w+/g);
                var sp = str.match(/[\w;;=\"\',:<>.()&{}|^%]+/gm);

                //                var sp = str.split(' ');
                if (no > sp.length || no < 1)
                    return '';
                return sp[no - 1];
            },
            getFromWord: function (str, no) {

                var sp = str.match(/[\w;;=\"\',:<>.()&{}+-|^%]+/gm);

                //                var sp = str.split(' ');
                if (no > sp.length || no < 1)
                    return '';
                var ss = "";
                for (var n = no - 1; n < sp.length; n++)
                    ss += (ss.length > 0 ? " " : "") + sp[n];
                return ss;
            },
            // navigates by enter, ------- dontEnterFocus on object to not focus on pressing enter

            navEnter: function (flds, lastObjNext) {
                if (flds == undefined || flds.length <= 0) return;
                var fldsids = [];
                var flds2 = [];
                for (var i in flds)
                    if (typeof flds[i].getId === 'function' && flds[i].dontEnterFocus == undefined) {
                        fldsids.push(flds[i].getId());
                        flds2.push(flds[i]);
                    }

                for (var i = 0; i < flds2.length; i++) {
                    flds2[i].addEventDelegate({
                        onsapenter: function (event) {
                            var cf = fldsids.indexOf(event.currentTarget.id);
                            if (cf < 0) return;
                            var nx = cf;
                            if (cf + 1 >= flds2.length && lastObjNext != undefined) {
                                lastObjNext(flds2[cf]);
                                return;
                            }
                            else {
                                nx = (cf + 1 >= flds2.length ? 0 : cf + 1);
                                while (!(flds2[nx] instanceof sap.m.InputBase))
                                    nx = (nx + 1 >= flds2.length ? 0 : nx + 1);
                            }
                            setTimeout(function () {
                                flds2[nx].focus();
                                (flds2[nx].$().find("input")[0]).select();
                            });
                        },
                        onsapdown: function (event) {
                            var cf = fldsids.indexOf(event.currentTarget.id);
                            if (cf < 0) return;
                            var nx = (cf + 1 >= flds2.length ? 0 : cf + 1);
                            var pr = (cf - 1 < 0 ? flds2.length - 1 : cf - 1);
                            // var cntrl=($(event.currentTarget).find("input")[0]);
                            setTimeout(function () {
                                flds2[nx].focus();
                                (flds2[nx].$().find("input")[0]).select();
                                // cntrl.select();
                            });
                        },
                        onsapup: function (event) {
                            var cf = fldsids.indexOf(event.currentTarget.id);
                            if (cf < 0) return;
                            var nx = (cf - 1 < 0 ? flds2.length - 1 : cf - 1);
                            setTimeout(function () {
                                flds2[nx].focus();
                                (flds2[nx].$().find("input")[0]).select();
                            });
                        }
                    });

                    // flds2[i].$().on("keydown", function (event) {
                    //
                    // });
                }
            },

            extractNumber: function (pvr, df) {
                var vr = this.nvl(pvr, "");
                if (vr == "")
                    return null;
                var neg = (vr.toString().startsWith("-") ? "-" : "");
                var val = vr.toString().replace(/[^\d\.]/g, '').replace(/,/g, '');
                if (df != undefined)
                    val = parseFloat(neg + (df.formatBack(val)));
                else
                    val = parseFloat("" + neg + val);
                return val;
            },
            err: function (msg) {
                sap.m.MessageToast.show(msg, {
                    my: sap.ui.core.Popup.Dock.RightBottom,
                    at: sap.ui.core.Popup.Dock.RightBottom
                });

                var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
                oMessageToastDOM.css('color', "red");
                throw msg;
            },

            Notifications: {
                init: function (newNotificationInterval, sp, view) {
                    this.newNotificationInterval = newNotificationInterval;
                    this.sp = sp;
                    this.lastKeyfldRead = 0;
                    this.view = view;
                },
                checkNewNotifications: function () {
                    var that = this;
                    if (this.ntTimer != undefined)
                        clearInterval(this.ntTimer);
                    this.ntTimer = setInterval(function () {
                        var sett = sap.ui.getCore().getModel("settings").getData();
                        var n = that.sp.getNotificationsNumber();
                        var dt = Util.execSQL("select nvl(count(*),0) cnts from c7_notify where flag=1 and keyfld>" + that.lastKeyfldRead + " and touser=" + Util.quoted(sett["LOGON_USER"]));
                        if (dt.ret == "SUCCESS" && dt.data.length > 0) {
                            var dtx = JSON.parse("{" + dt.data + "}").data;
                            if (n != dtx[0].CNTS) {
                                that.sp.setNotificationsNumber(dtx[0].CNTS + "");
                                that.getNotificationData();
                            }
                        }
                    }, this.newNotificationInterval);

                },
                getNotificationData: function () {
                    var that = this;
                    var sett = sap.ui.getCore().getModel("settings").getData();
                    var dt = Util.execSQL("select *from c7_notify where flag=1 and keyfld>" +
                        that.lastKeyfldRead +
                        " and touser=" + Util.quoted(sett["LOGON_USER"]) +
                        " order by keyfld desc"
                    );

                    if (dt.ret == "SUCCESS" && dt.data.length > 0) {

                        if (that.notTable != undefined)
                            that.notTable.resetData();
                        that.notTable = new LocalTableData();
                        that.notTable.parse("{" + dt.data + "}", false);
                    }
                },
                showList: function (event, obj) {
                    var that = this;

                    if (this.notTable == undefined)
                        return;
                    if (this.notTable.rows.length <= 0)
                        return;

                    var lsgrp = new sap.m.NotificationListGroup({ title: "Reports" });
                    for (var i = 0; i < this.notTable.rows.length; i++) {
                        var des = this.notTable.getFieldValue(i, "DESCR");
                        var cmd = this.notTable.getFieldValue(i, "CMD");
                        var si = new sap.m.NotificationListItem(
                            {
                                description: des + ",  " + cmd,
                                customData: { key: i },
                                tap: function (event) {
                                    // sap.m.MessageToast.show("Cliked");
                                    var rn = this.getCustomData()[0].getKey();
                                    var cmd = that.notTable.getFieldValue(rn, "CMD");
                                    UtilGen.execCmd(cmd, that.view, that.view.txtExeCmd);
                                },
                                close: function (oEvent) {
                                    var oItem = oEvent.getSource(),
                                        oList = oItem.getParent();

                                    oList.removeItem(oItem);

                                    var rn = this.getCustomData()[0].getKey();
                                    var kf = that.notTable.getFieldValue(rn, "KEYFLD");
                                    Util.execSQL("update c7_notify set flag=2 where keyfld=" + kf);
                                }
                            });
                        lsgrp.addItem(si);
                    }
                    var vb = new sap.m.VBox({ items: [lsgrp] });
                    var oPopover = new sap.m.Popover({
                        title: "Parameters",
                        showHeader: true,
                        content: [vb],
                        modal: false,
                        footer: [],
                        contentHeight: "350px",
                        contentWidth: "350px",
                        placement: sap.m.PlacementType.Auto
                    }).addStyleClass("sapUiSizeCompact");
                    oPopover.openBy(obj);

                }


            },
            AlertSettings: {
                init: function (view, timeInLong) {
                    this.view = view;
                    this.timeInLong = Util.nvl(timeInLong, (new Date()).getTime());
                    this.titSpan = "XL2 L4 M4 S12";
                    this.codSpan = "XL3 L2 M2 S12";
                },
                createView: function () {
                    this.fe = [];
                    this.set.keyfld = UtilGen.addControl(this.fe, "Key ID", sap.m.Input, "Set" + this.timeInLong + "_",
                        {
                            enabled: true,
                            layoutData: new sap.ui.layout.GridData({ span: this.codSpan }),
                        }, "string", undefined, this.view);
                    this.set.username = UtilGen.addControl(this.fe, "@User Name", sap.m.Input, "Set" + this.timeInLong + "_",
                        {
                            enabled: true,
                            layoutData: new sap.ui.layout.GridData({ span: this.codSpan }),
                        }, "string", undefined, this.view);

                    this.set.setup_type = UtilGen.addControl(this.fe, "Setup Type", sap.m.ComboBox, "Set" + this.timeInLong + "_",
                        {
                            enabled: true,
                            layoutData: new sap.ui.layout.GridData({ span: this.codSpan }),
                            customData: [{ key: "" }],
                            items: {
                                path: "/",
                                template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                                templateShareable: true
                            },
                            value: "ACACCOUNT"
                        }, "string", undefined, this.view, undefined, "@ACACCOUNT/ACACCOUNT,JV_NEW/JV_NEW");

                    this.set.condition_str = UtilGen.addControl(this.fe, "Condition Str", sap.m.Input, "Set" + this.timeInLong + "_",
                        {
                            enabled: true,
                            layoutData: new sap.ui.layout.GridData({ span: this.codSpan }),
                        }, "string", undefined, this.view);
                },
                cmdAlert: function (txt, showSuccessMsg) {
                    var sett = sap.ui.getCore().getModel("settings").getData();
                    var usr = Util.quoted(sett["LOGON_USER"]);
                    if (!txt.trim().startsWith("alert"))
                        Util.err("must starts with 'alert' keyword !");
                    var w2 = Util.getWord(txt, 2);
                    if (!(w2 == "create" || w2 == "modify"))
                        Util.err("must have keyword create / modify ");
                    if (w2 == "create") {
                        var cond_str = "", set_typ = "";
                        var w3 = Util.getFromWord(txt, 3);
                        w3 == "" ?
                            Util.err("must specfiy parameters setup_type, condition_str!") : "";
                        var sp = w3.split(";;");
                        for (var i in sp) {
                            var sp2 = sp[i].split(":=");
                            if (sp2[0] == "condition_str")
                                cond_str = sp2[1];
                            if (sp2[0] == "setup_type")
                                set_typ = sp2[1];
                        }
                        if (cond_str == "" || set_typ == "")
                            Util.err("Err! , parameter not assigned setup_type/condition_str");
                        var delsq = "delete from c7_notify_setup where usernm=:USERNM and " +
                            " setup_type=:SETUP_TYPE AND " +
                            " CONDITION_STR=:CONDITION_STR; ";
                        var sq = "insert into c7_notify_setup ( " +
                            "KEYFLD, USERNM, POS, SETUP_TYPE," +
                            " TYPE_PARA_1, TYPE_PARA_2, TYPE_PARA_3, " +
                            "CONDITION_STR, FLAG, CREATED_BY, CREATED_TIME, " +
                            "MODIFIED_TIME, LAST_NOTIFIED_TIME, CMD ) values (" +
                            ":KEYFLD, :USERNM, :POS, :SETUP_TYPE," +
                            " :TYPE_PARA_1, :TYPE_PARA_2, :TYPE_PARA_3, " +
                            ":CONDITION_STR, 1, :CREATED_BY, :CREATED_TIME, " +
                            ":MODIFIED_TIME, :LAST_NOTIFIED_TIME, :CMD );";
                        sq = "begin " + delsq + sq + " end; ";

                        sq = sq.replaceAll(":KEYFLD", "(SELECT NVL(MAX(KEYFLD),0)+1 FROM c7_notify_setup )");
                        sq = sq.replaceAll(":USERNM", usr);
                        sq = sq.replaceAll(":POS", "(SELECT NVL(MAX(POS),0)+1 FROM c7_notify_setup WHERE USERNM=" + usr + ")");
                        sq = sq.replaceAll(":SETUP_TYPE", Util.quoted(set_typ));
                        sq = sq.replaceAll(":TYPE_PARA_1", "''");
                        sq = sq.replaceAll(":TYPE_PARA_2", "''");
                        sq = sq.replaceAll(":TYPE_PARA_3", "''");
                        sq = sq.replaceAll(":CONDITION_STR", Util.quoted(cond_str));
                        sq = sq.replaceAll(":CREATED_BY", Util.quoted(sett["LOGON_USER"]));
                        sq = sq.replaceAll(":CREATED_TIME", "sysdate");
                        sq = sq.replaceAll(":MODIFIED_TIME", "sysdate");
                        sq = sq.replaceAll(":LAST_NOTIFIED_TIME", "sysdate");
                        sq = sq.replaceAll(":CMD", "''");
                        try {
                            var dt = Util.execSQL(sq);
                            if (dt.ret != "SUCCESS")
                                Util.err("Err executing sql " + dt.ret);
                            Util.nvl(showSuccessMsg, true) ?
                                sap.m.MessageToast.show("Alert created successfully !") : "";
                        }
                        catch (e) {
                            Util.err(e);
                        }

                    }


                },

            },
            printPdf: function (url) {
                var iframe = this._printIframe;
                if (!this._printIframe) {
                    iframe = this._printIframe = document.createElement('iframe');
                    document.body.appendChild(iframe);

                    iframe.style.display = 'none';
                    iframe.onload = function () {
                        setTimeout(function () {
                            iframe.focus();
                            iframe.contentWindow.print();
                        }, 1);
                    };
                }

                iframe.src = url;
            },
            getLabelTxt: function (ptxt, pwidth, preText, styleText) {
                return Util.nvl(preText, "") + '{\"text\":\"' + ptxt + '\",\"width\":\"' + Util.nvl(pwidth, "15%") + '\","textAlign":"End","styleClass":"' + Util.nvl(styleText, "") + '"}'
            },
            abbreviateNumber: function (number) {
                var sett = sap.ui.getCore().getModel("settings").getData();
                if (sett["DEFAULT_CURRENCY"] == "INR")
                    return this.abbreviateNumberIndian(number);

                const SI_SYMBOLS = ['', 'k', 'M', 'G', 'T', 'P', 'E'];

                // Convert the number to absolute value
                const absNumber = Math.abs(number);

                // Determine the appropriate SI symbol index
                const tier = Math.log10(absNumber) / 3 | 0;

                // If the number is 0 or smaller than 1,000, return the number as is
                if (tier === 0) {
                    return number.toString();
                }

                // Calculate the scaled number and add the SI symbol
                const scaled = absNumber / Math.pow(10, tier * 3);
                const symbol = SI_SYMBOLS[tier];

                // Format the number with a maximum of 2 decimal places
                const formattedNumber = scaled.toFixed(2);

                // Return the abbreviated string
                return (number < 0 ? '-' : '') + formattedNumber + symbol;
            },
            abbreviateNumberIndian: function (value) {
                const val = Math.abs(value);
                if (val >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
                if (val >= 100000) return `${(value / 100000).toFixed(2)} Lac`;
                if (val >= 1000) return `${(value / 1000).toFixed(2)} k`;
                return value.toFixed(2);
            }


        };

        return Util;
    });

