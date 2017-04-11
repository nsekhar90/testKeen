
var client;
var compute;

function initializeKeen() {
    client = new KeenAsync({
        projectId: '58ebd3cc90b3659264951b59',
        writeKey: '339FA57EE268E3C07029E7BC8F36F8A423EC01EF32B29F64A9A0936A1279E4A93CAE83E88F93926556CC2CC9A98DD62F62F05AB00E06D405BD035B1C39FE934456F0FF66C4E87756305BA6CCEE0826683764BA6265BED9D91D9B33A5096C52EF',
        readKey : '2113F0C8201118F1E52F85F94E2E98760601FEE9A729790B45C77DAE32335C7C7A68A4F8527685C26B168AA8D836BD2D19C0A714E76E1EF33B1A8D6C83D3AF437EEE624E5088AA07BB12F48EE4032B9127374A544C9D382DCC829B3D116DA600'
    });

    compute = new Keen( {
        projectId: '58ebd3cc90b3659264951b59',
        readKey : '2113F0C8201118F1E52F85F94E2E98760601FEE9A729790B45C77DAE32335C7C7A68A4F8527685C26B168AA8D836BD2D19C0A714E76E1EF33B1A8D6C83D3AF437EEE624E5088AA07BB12F48EE4032B9127374A544C9D382DCC829B3D116DA600'
    });

    //base event
    client.extendEvents(function(){
        return {
            presentation: {
                'id':  "35",
                ownerKey : 123324543
            }
        }
    });

    // Record an event
    client.recordEvent('presentationViews', {
        title: document.title
    });

    recordPresentationCompletionEvent(0);
}

function recordPresentationCompletionEvent(percentVisited) {
    client.recordEvent('presentationInteraction', {
        property_type: 'viewBenchmark',
        benchmark : percentVisited
    });
}

function recordCallToActionClicked(actionType) {
    client.recordEvent('CallToActionClicked', {
        id : Math.random(),
        ownerKey : Math.random(),
        actionType : actionType
    })
}

function getCallToActionAnalytics(presentationId) {
    var count = new Keen.Query("count", {
        event_collection: "CallToActionClicked",
        timeframe: "this_7_days",
        group_by: "actionType"
    });

    compute.run(count, function(err, response){
        // if (err) handle the error
        console.log("call to action count");
        console.log(response.result);
    });

    var pageviews_static = new Keen.Query("count", {
        event_collection: "CallToActionClicked",
        timeframe: "this_7_days",
        group_by: "actionType"
    });

    compute.draw(pageviews_static, document.getElementById("chart-02"), {
        chartType: "piechart",
        title: "Call To Action Stats",
        height: 250,
        width: "auto",
        chartOptions: {
            chartArea: {
                height: "85%",
                left: "5%",
                top: "5%",
                width: "100%"
            },
            pieHole: .4
        }
    });

    var presentationViews = new Keen.Query("count", {
        event_collection: "presentationViews",
        timeframe: "this_14_days"
    });

    compute.draw(presentationViews, document.getElementById("count-pageviews-metric"), {
        chartType: "metric",
        title: "Total Presentation Views",
        colors: ["#49c5b1"]
    });

    // compute.draw(pageviews_static, document.getElementById("column-chart"), {
    //     chartType: "columnchart",
    //     title: "Column Chart for call-to-action",
    //     chartOptions: {
    //         isStacked: true
    //     }
    // });
}

function computeFunnel() {
    var presentationCompletionQuery = new Keen.Query("funnel", {
        steps: [
            {
                "actor_property": "35",
                "event_collection": "presentationInteraction",
                "timeframe": "this_7_days",
                filters: [
                    {
                        "operator": "eq",
                        "property_name": "benchmark",
                        "property_value": 0
                    }
                ],
            },
            {
                "actor_property": "35",
                "event_collection": "presentationInteraction",
                "timeframe": "this_7_days",
                filters: [
                    {
                        "operator": "eq",
                        "property_name": "benchmark",
                        "property_value": 25
                    }
                ],
            },
            {
                "actor_property": "35",
                "event_collection": "presentationInteraction",
                "timeframe": "this_7_days",
                filters: [
                    {
                        "operator": "eq",
                        "property_name": "benchmark",
                        "property_value": 50
                    }
                ],
            },
            {
                "actor_property": "35",
                "event_collection": "presentationInteraction",
                "timeframe": "this_7_days",
                filters: [
                    {
                        "operator": "eq",
                        "property_name": "benchmark",
                        "property_value": 75
                    }
                ],
            },
            {
                "actor_property": "35",
                "event_collection": "presentationInteraction",
                "timeframe": "this_7_days",
                filters: [
                    {
                        "operator": "eq",
                        "property_name": "benchmark",
                        "property_value": 100
                    }
                ],
            },
        ]
    });

    compute.run(presentationCompletionQuery, function(err, response){
        console.log("funnel query");
        if (err) {
            console.log(err);
        }
        console.log("funnel result");
        console.log(response.result);
    });


    compute.draw(presentationCompletionQuery, document.getElementById("column-chart"), {
        library: "google",
        chartType: "barchart",
        height: 340,
        title: null,
        colors: ["#79CDCD"],
        labels: [ "Presentation Opened", "25% Completed", "50% Completed", "75% Completed", "100% Completed" ],
        chartOptions: {
            chartArea: { height: "85%", left: "20%", top: "5%" },
            legend: { position: "none" }
        }
    });
}
