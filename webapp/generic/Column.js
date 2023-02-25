sap.ui.define(["./DataCell"], function (DataCell) {
    'use strict';

    function Column() {
        this.parentmLcTb;
        this.mUIHelper = {
            canEdit: false,
            data_type: "string",
            default_value: null,
            display_format: "",
            styleName: "",
            display_width: "300px",
            isVisible: true,
            display_align: "begin",
            display_style: ""
        };
        this.mColpos = 0;
        this.mColName = "";
        this.mList = "";
        this.mColClass = "";
        this.mTitle = "";
        this.mTitleAr = "";
        this.mGrouped = false;
        this.mSummary = "";
        this.mQtreeType = "";
        this.mHideCol = false;
        this.mCfOperator = "";
        this.mCfValue = "";
        this.mCfTrue = "";
        this.mCfFalse = "";
        this.mTitleParent = "";
        this.mTitleParentSpan = 1;
        this.eValidateColumn;
        this.eOther;
        this.eOnSearch;
        this.mSearchSQL;
        this.mSearchSQLMultiSelect = "N";
        this.mLookUpCols;
        this.mRetValues;
        this.mDefaultValue;
        this.mEnabled = true;
        this.beforeSearchEvent = undefined;
        this.mSearchColParent = "";
        this.mSearchColCode = "";
        this.mSearchColTitle = "";
        this.mSearchColTitle = "";
        this.mSearchColChildCount = "";
        this.valOnZero = undefined;
        this.whenValidate = undefined;
        this.eventCalc = undefined;
        this.commandLink = undefined;
        this.commandLinkClick = undefined;
        this.ct_row = "N";
        this.ct_col = "N";
        this.ct_val = "N";


    }

    Column.prototype = {
        constructor: Column,
        getMUIHelper: function () {
            return this.mUIHelper
        },
        getParent: function () {
            return this.parentmLcTb;
        },
        getClone: function () {
            var cl = new Column();
            for (var i in this)
                if (i != "mUIHelper")
                    cl[i] = this[i];
            cl["mUIHelper"] = {};
            for (var i in this.mUIHelper)
                cl["mUIHelper"][i] = this.mUIHelper[i];
            return cl;
        }

    }

    return Column;
});
