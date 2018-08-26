"use strict";

if ( sessionStorage.getItem("login_status") == "fail" || 
    !sessionStorage.getItem("login_status")
   ) {
    document.body.style.display = "none";
}

const INTERVAL_MS = 2000;
const PORTFOLIO_MAX = 6;

let userid = sessionStorage.getItem("userid");

let running = false;
let paused = false;
let intervalId;

let current_day;
let current_date;
let current_pl;

let first = true;


let stocks =[];


let currentPrices = [];
let portfolio = [];
let card_panels = []; for (let i=0; i<PORTFOLIO_MAX; ++i) { card_panels.push(false); }

$(document).ready(function () {
    //Initialize side nav 
    $('.button-collapse').sideNav(); 
});
 
$("#start_btn").on("click", start);
$("#pause_btn").on("click", pause_toggle);
$("#stop_btn").on("click", stop);
$(".buy-btns").on("click", buy);
$(".sell-btns").on("click", sell);

init();

function init() {
    // Initialize variables
    current_day = 0;
    current_date = "YYYY-MM-DD";
    current_pl = 0.0;

    currentPrices.length = 0;
    portfolio.length = 0;
    for (let i=0; i<card_panels.length; ++i) { card_panels[i] = false; }

    // Show all company cards
    $(".card").show();
    // Hide all portfolio cards
    $(".card-panel").hide();
    // Initialize summary data
    $("#current_day").text(current_day);
    $("#current_date").text(current_date);
    $("#current_pl").text("$"+current_pl);
}

function start() {
    if (running) { return; }
    console.log("start");

    // Delete portfolio table for this user
    $.ajax({
        method: "DELETE",
        url: "/api/portfolio/" + userid
    }).then(function() { 
        console.log("Delete portfolio for user" + userid)
    });
    
    init();

    // Since setInterval() will only call intervalProcessing() for the first time after the
    // interval has elapsed, we call it for the first time here before the interval starts
    intervalProcessing();

    clearInterval(intervalId);
    intervalId = setInterval(intervalProcessing, INTERVAL_MS);
    running = true;
}

function intervalProcessing() {
    ++current_day;
    //console.log("IntervalProcessing() - Day: " + current_day);
    getPricesForDay();
}

function getPricesForDay() {
    console.log("Enter getPricesForDay()");
    $.get("api/prices/"+current_day, function(prices) {
        console.log("ENTER GET api/prices/:current_day");
        if (prices.length === 0) {
            stop();
        } else {
            current_date = prices[0].date.substring(0,10); // just date, ignore time
            $("#current_day").text(current_day);
            $("#current_date").text(current_date);

            currentPrices = prices;  // save copy of current prices for later use

            // For each price received
            for (let p=0; p<prices.length; ++p) {

                if (first) {
                    stocks.push({
                        x: [], //day 
                        y: [], //closing price
                        mode: 'line',
                        price: 0.00,
                        company: ""
                    });

                }

                stocks[p].company = prices[p].company;
                stocks[p].price = prices[p].close;

                // Populate company card with daily price
                $("#"+prices[p].company.replace("&","\\&")).text(parseFloat(prices[p].close).toFixed(2));

                //supporting graph code
               // if(prices[p].company=="Amex"){//check card id for 
                    // let stock = {
                    //     x: [], //day 
                    //     y: [], //closing price
                    //     mode: 'line',
                    //     price: 0.00,
                    //     name: ""
                    // };    
                    
               
                    stocks[p].x.push(prices[p].day);
                    stocks[p].y.push(prices[p].close);
                    console.log("xaxis data "+stocks[p].x);
                    console.log("yaxis data "+stocks[p].y);



                    var data = [stocks[p]];

                    var layout = {
                        //title:'Line Plot',
                        width: 50,
                        height: 30,
                        xaxis: {
                          showticklabels: false
                        },
                        yaxis: {
                          showticklabels: false
                        },
                       // autosize: true,
                        margin: {
                          autoexpand: false,
                          l: 0,
                          r: 0,
                          t: 0,
                          b:0
                        },
                      };
                    
                    Plotly.newPlot(prices[p].company+"_graph", data, layout);

               // }
                //

                // If stock is in portfolio, update company's card-panel with daily price & P&L
                for (let j=0; j<card_panels.length; ++j) {
                    if (card_panels[j] && $("#name"+j).text() === prices[p].company) {
                        $("#curr_prc"+j).text(parseFloat(prices[p].close).toFixed(2));
                        let curr_prc = parseFloat(prices[p].close);
                        let buy_prc = parseFloat( $("#buy_prc"+j).text() );
                        let pl = curr_prc - buy_prc;
                        $("#pl"+j).text(pl.toFixed(2));
                    }
                }
            }
            first = false;
            console.log("Calling update_and_display_pl() from getPricesForDay()");
            update_and_display_pl();
        }
        console.log("EXIT GET api/prices/:current_day");
    });
    console.log("Exit getPricesForDay()");
}

function stop() {
    if (!running) { return; }
    console.log("stop");
    running = false;
    clearInterval(intervalId);
}

function buy() {
    if (!running) { return; }
    console.log("Enter buy()");

    let available_card_panel = get_empty_panel();
    if (available_card_panel === -1) {
        alert("Already have 6 stocks. Can't buy anymore!");
        return;
    }
    card_panels[available_card_panel] = true;
    console.log(card_panels);
    console.log(available_card_panel);

    // Get company name that we clicked on
    var buy_cmpy =  ($(this).attr("data-cmpy"));
    console.log(buy_cmpy);

    // Find company object from currentPrices array
    let cmpy_obj = {};
    for (let p=0; p<currentPrices.length; ++p) {
        if (currentPrices[p].company === buy_cmpy) {
            cmpy_obj = currentPrices[p];
        }
    }

    console.log("BUY: AJAX POST");
    // Add bought stock to portfolio db table
    $.post("/api/buy", {
        userid: userid,
        companyid: cmpy_obj.id,
        stock_quantity: 1,
        buy_price: cmpy_obj.close
    }).then(function(data) {
        console.log("ENTER POST /api/buy");
        console.log(JSON.stringify(data));

        // Add bought stock to local portfolio
        let stock_entry = {};
        stock_entry.portfolioid = data.id;
        stock_entry.company_name = cmpy_obj.company;
        stock_entry.companyid = cmpy_obj.id;
        stock_entry.buy_price = cmpy_obj.close;
        stock_entry.stock_quantity = 1;
        stock_entry.card_panel = available_card_panel;
        portfolio.push(stock_entry);

        // Hide company card, so we can't buy it again
        $("#"+buy_cmpy+"-card").hide();

        // Populate & show portfolio card
        $("#name"+available_card_panel).text(stock_entry.company_name);
        $("#buy_prc"+available_card_panel).text(parseFloat(stock_entry.buy_price).toFixed(2));
        $("#curr_prc"+available_card_panel).text(parseFloat(stock_entry.buy_price).toFixed(2));
        $("#pl"+available_card_panel).text("0.00");
        $("#card-panel"+available_card_panel).show();
        console.log("EXIT POST /api/buy");
    });
    console.log("Exit buy()");
}

// Find an empty card panel. 
// If found, return the number of the card panel.
// If not found, it means we already own 6 stocks, and it returns -1.
function get_empty_panel() {
    for (let i=0; i<card_panels.length; ++i) {
        if (!card_panels[i]) {
            return i;
        }
    }
    return -1;
}

function sell() {
    if (!running) { return; }
    console.log("Enter sell()");

    // Get the card panel that was clicked
    // var card_panel_number =  ($(this).attr("data-sell"));
    let card_panel_number =  ($(this).data("sell"));
    console.log(card_panels);
    console.log("card_panel_number="+card_panel_number);

    // Get company name from card panel
    let cmpy_name = $("#name"+card_panel_number).text();

    // Get portfolio entry and remove from portfolio
    let entry_ix = -1;
    for (let i=0; i<portfolio.length; ++i) {
        if (portfolio[i].company_name = cmpy_name) {
            entry_ix = i; // save portfolio entry for use when ajax call returns
        }
    }

    console.log("SELL: AJAX PUT");
    console.log("    *** id: "+portfolio[entry_ix].portfolioid);
    console.log("    *** stk_qty: "+portfolio[entry_ix].stock_quantity);
    // Sell company stock. Updates portfolio table entry
    $.ajax({
        method: "PUT",
        url: "/api/sell",
        data: {id: portfolio[entry_ix].portfolioid,
               stock_quantity: portfolio[entry_ix].stock_quantity
              }
    }).then(function(data) {
        console.log("ENTER SELL_RESPONSE: "+JSON.stringify(data));
        // Remove entry from portfolio array
        portfolio.splice(entry_ix,1);

        // Update current p&l
        console.log("**1: Get pl from card panel: " + card_panel_number);
        //let sell_pl_s = $("#pl"+card_panel_number).text();
        //console.log("**1.5: sell_pl_s="+sell_pl_s);
        //let sell_pl = parseFloat(sell_pl_s);
        let sell_pl = parseFloat($("#pl"+card_panel_number).text());
        console.log("     sell_pl="+sell_pl);
        current_pl += sell_pl;
        console.log("     current_pl="+current_pl);

        // Close out portfolio card-panel for stock
        console.log("**2: Hide card panel");
        card_panels[card_panel_number] = false;
        $("#card-panel"+card_panel_number).hide();

        // Show company card
        console.log("**3: Show company card");
        let card = "#"+cmpy_name+"-card";
        console.log("***** card="+card);
        $(card).show();

        console.log("**4: Calling update_and_display_pl() from sell()");
        update_and_display_pl();
        console.log("EXIT SELL_RESPONSE");
    });
    console.log("Exit sell()");
}

function update_and_display_pl() {
    console.log("Enter update_and_display_pl()");
    let current_portfolio_pl = 0.0;

    for (let i=0; i<card_panels.length; ++i) {
        console.log("    checking card_panel "+i+"   = "+card_panels[i]);
        if (card_panels[i]) {
            let card_panel_pl_s = $("#pl"+i).text();            console.log("      card_panel_pl_s="+card_panel_pl_s);
            let card_panel_pl = parseFloat(card_panel_pl_s);    console.log("      card_panel_pl"+card_panel_pl);
            current_portfolio_pl += card_panel_pl;              console.log("      current_portfolio_pl="+current_portfolio_pl);
        }
    }
    console.log("  current_pl="+current_pl);
    console.log("  current_portfolio_pl="+current_portfolio_pl);

    let total_current_pl = current_pl + current_portfolio_pl;

    console.log("  total_current_pl="+total_current_pl);

    $("#current_pl").text("$"+total_current_pl.toFixed(2));
    console.log("Exit update_and_display_pl()");
}

function pause_toggle() {
    if (!running) { return; }
    if (!paused) {
        // PAUSE
        console.log("Simulation paused");
        clearInterval(intervalId);
        paused = true;
    } else {
        // RESTART
        console.log("Simulation restarted");
        intervalId = setInterval(intervalProcessing, INTERVAL_MS);
        paused = false;
    }
}

