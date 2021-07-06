sap.ui.jsfragment("bin.forms.gl.currency", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = Util.nvl(oController.code, "");
        this.timeInLong = (new Date()).getTime();
        this.joApp = new sap.m.SplitApp({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {};
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
        var that2 = this;
        var view = this.view;
        Util.destroyID("cmdA" + this.timeInLong, this.view);
        UtilGen.clearPage(this.mainPage);
        this.frm;
        var js = {
                form: {
                    events: {
                        afterLoadQry: function (qry) {
                            console.log("executing after load...");
                            var nm = that2.frm.getFieldValue('name');
                            that2.frm.setFieldValue('qry1._name2', nm, nm, false);
                        },
                        beforeLoadQry: function (qry, sql) {

                            return sql;
                        },
                        afterSaveSqlQry: function (qry) {


                        },
                        beforeSaveQry: function (qry, sql) {

                        },

                    },
                    parameters: [
                        {
                            para_name: "pac",
                            data_type: "string",
                            value: ""
                        }
                    ],
                    db: [
                        {
                            type: "query",
                            name: "qry1",
                            dml: "select code,name from CURRENCY_MASTER where code=':pac'",
                            where_clause: " code=':code' ",
                            update_exclude_fields: ['code'],
                            insert_exclude_fields: [],
                            insert_default_values: {},
                            update_default_values: {},
                            table_name: "CURRENCY_MASTER",
                            fields: {
                                accno: {
                                    colname: "code",
                                    data_type: "string",
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "Code",
                                    title2: "Code",
                                    canvas: "default_canvas",
                                    display_width: "XL2 L4 M4 S12",
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {},
                                    edit_allowed: false,
                                    insert_allowed: true,
                                    require: true
                                },
                                name: {
                                    colname: "name",
                                    data_type: "string",
                                    class_name: FormView.ClassTypes.TEXTFIELD,
                                    title: "Name",
                                    title2: "Name",
                                    canvas: "default_canvas",
                                    display_width: "XL2 L8 M8 S12",
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {},
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: true
                                },
                                name2: {
                                    colname: "_name2",
                                    data_type: "string",
                                    class_name: FormView.ClassTypes.COMBOBOX,
                                    title: "Name2",
                                    title2: "Name2",
                                    canvas: "default_canvas",
                                    display_width: "XL2 L8 M8 S12",
                                    display_align: "ALIGN_RIGHT",
                                    display_style: "",
                                    display_format: "",
                                    other_settings: {
                                        customData: [{key: ""}],
                                        items: {
                                            path: "/",
                                            template: new sap.ui.core.ListItem({text: "{NAME}", key: "{CODE}"}),
                                            templateShareable: true
                                        },
                                    },
                                    // list: "select code,name from locations",
                                    list: "@1/Land,2/Sea,3/Air",
                                    edit_allowed: true,
                                    insert_allowed: true,
                                    require: false
                                }
                            }

                        },
                        // {
                        //     type: "query",
                        //     name: "qry2",
                        //     showType: FormView.QueryShowType.QUERYVIEW,
                        //     applyCol: "C7.CURR",
                        //     addRowOnEmpty: true,
                        //     dml: "select *from CURRENCY where code=':code'",
                        //     delete_before_update: "delete from currency where code=':code';",
                        //     where_clause: " code=':code' ",
                        //     update_exclude_fields: ['code'],
                        //     insert_exclude_fields: [],
                        //     insert_default_values: {"NAME": ":name"},
                        //     update_default_values: {},
                        //     table_name: "CURRENCY",
                        //
                        //
                        // }
                    ],
                    canvas: [],
                    commands: [
                        {
                            name: "cmdSave",
                            canvas: "default_canvas",
                            onPress: function (e) {
                                // var ac = that2.frm.getFieldValue("accno");
                                // var ac = that2.frm.parseString("select from acaccount where accno=':pac'");
                                // var sv = that2.frm.getSQLUpdateString("qry1", undefined, ['code'], " CODE=':code' ");
                                // console.log(sv);
                                sap.m.MessageToast.show("Saved...", {
                                    my: sap.ui.core.Popup.Dock.RightBottom,
                                    at: sap.ui.core.Popup.Dock.RightBottom
                                });

                                return true;
                            }
                        },
                        {
                            name: "cmdDel",
                            canvas: "default_canvas",
                        }, {
                            name: "cmdEdit",
                            canvas: "default_canvas",
                        },
                        {
                            name: "cmdNew",
                            canvas: "default_canvas",
                            title: "New Curr"
                        }, {
                            name: "cmdList",
                            canvas: "default_canvas",
                            list_name: "list1"
                        },
                        {
                            name: "cmdClose",
                            canvas: "default_canvas",
                            title: "Close",
                            obj: new sap.m.Button({
                                icon: "sap-icon://decline",
                                press: function () {
                                    that2.joApp.backFunction();
                                }
                            })
                        }
                    ],
                    lists: [
                        {
                            name: 'list1',
                            title: "S",
                            list_type: "sql",
                            cols: [
                                {
                                    colname: 'CODE',
                                    return_field: "pac",
                                },
                                {
                                    colname: "NAME",
                                }
                            ],  // [{colname:'code',width:'100',return_field:'pac' }]
                            sql: "select code,name from currency_master",
                            afterSelect: function (data) {
                                that2.frm.loadData(undefined, "view");
                                // that2.frm.objs["cmdEdit"].obj.getPressed(false);
                                return true;
                            }
                        }
                    ]

                }
            }
        ;
        this.frm = new FormView(this.mainPage);
        this.frm.view = view;
        this.frm.pg = this.mainPage;
        this.frm.parseForm(js);
        this.frm.createView();

        // this.mainPage.addContent(sc);

    },
    setFormEditable: function () {

    }
    ,

    createViewHeader: function () {
        var that = this;
        var fe = [];
        var titSpan = "XL2 L4 M4 S12";
        var codSpan = "XL3 L2 M2 S12";


        // this.cs = {};
        // this.cs.code = UtilGen.addControl(fe, "Code", sap.m.Input, "Cs" + this.timeInLong + "_",
        //     {
        //         enabled: true,
        //         layoutData: new sap.ui.layout.GridData({span: codSpan}),
        //     }, "string", undefined, this.view);
        // this.cs.title = UtilGen.addControl(fe, "@Title", sap.m.Input, "cs" + this.timeInLong + "_",
        //     {
        //         enabled: true,
        //         layoutData: new sap.ui.layout.GridData({span: titSpan}),
        //     }, "string", undefined, this.view);
        //
        //
        // return UtilGen.formCreate("", true, fe);
        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    }
    ,
    loadData: function () {
        // this.frm.setFieldValue("pac", "KWD");
        // this.frm.loadData("qry1");

        this.frm.setFieldValue('pac', Util.nvl(this.qryStr), "");
        this.frm.setQueryStatus(undefined, Util.nvl(this.oController.status, FormView.RecordStatus.NEW));
        if (this.qryStr != "")
            this.frm.loadData(undefined, this.oController.status);


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

});



