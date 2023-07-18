var view=this;
var thatForm=that;

var pop= new sap.viz.ui5.controls.Popover();


var ob=new sap.viz.ui5.controls.VizFrame( {
                                                    uiConfig: { applicationSet: 'fiori' },
                                                    vizType: "column",
                                                    height: "100%",
                                                    legendVisible: false

                                                });                                                

  var dt=Util.execSQL("select parentitem,parentitemdescr name,sum(pkcost*allqty) costvalue from joined_invoice group by parentitem,parentitemdescr order by parentitem");
  var dtx = JSON.parse("{" + dt.data + "}").data;



                                            var dimensions = [{
                                                name: "NAME",   
                                                value: "{NAME}"
                                            }];
                                            var measures = [

                                                {
                                                    name: Util.getLangText("totalText"),
                                                    value: "{COSTVALUE}"
                                                }];

                                            this.dataSetDone = (ob.getModel() != undefined);
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

                                                var formatPattern = sap.viz.ui5.format.DefaultPattern;

                                                var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                                                    'uid': "valueAxis",
                                                    'type': "Measure",
                                                    'values': [Util.getLangText("totalText")]
                                                });

                                                var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                                                    'uid': "categoryAxis",
                                                    'type': "Dimension",
                                                    'values': ["NAME"]
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
                                                        text: 'DR a/c '
                                                    }
                                                });
                                                //var pop = view.byId("graphAccnoPop" + thatForm.timeInLong);
                                                pop.connect(ob.getVizUid());
                                        
                                            new sap.m.VBox({items:[ob]});
                                                