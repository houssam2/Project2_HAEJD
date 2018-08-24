"use strict";

if ( sessionStorage.getItem("login_status") == "fail" || 
    !sessionStorage.getItem("login_status")
   ) {
    document.body.style.display = "none";
}

const INTERVAL_MS = 1000;

let intervalId;
let current_day = 0;
let current_date;
let running = false;
let paused = false;

$(document).ready(function () {
    //Initialize side nav 
    $('.button-collapse').sideNav(); 
});
 

$("#start_btn").on("click", start);
$("#pause_btn").on("click", pause_toggle);
$("#stop_btn").on("click", stop);
$(".buy-btns").on("click", buy);

let userid = sessionStorage.getItem("userid");
init();

function init() {
    // Show all company cards
    $(".card").show();

    // Hide all portfolio cards
    $(".card-panel").hide();
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

    current_day = 0;
    clearInterval(intervalId);
    intervalId = setInterval(intervalProcessing, INTERVAL_MS);
    running = true;
}

function intervalProcessing() {
    ++current_day;
    console.log("IntervalProcessing() - Day: " + current_day);
    getPricesForDay();
}

let currentPrices = [];

function getPricesForDay() {
    $.get("api/prices/"+current_day, function(prices) {
 
        current_date = prices[0].date.substring(0,10); // just date, ignore time
        console.log(current_date);

        if (prices.length === 0) {
            stop();
        } else {
            currentPrices = prices;
            // Populate company cards with daily prices
            for (let p=0; p<prices.length; ++p) {
                    $("#"+prices[p].company.replace("&","\\&")).text(prices[p].close);
                //}
            }
        }
    });
}

let portfolio = [];
let owned_stock = {};

function buy() {
    console.log("buy");
    
    // Hide company card
    var buy_cmpy =  ($(this).attr("data-cmpy"));
    console.log(buy_cmpy);
    $("#"+buy_cmpy+"-card").hide();

    // Find company object from currentPrices array
    let cmpy_obj = {};
    for (let p=0; p<currentPrices.length; ++p) {
        if (currentPrices[p].company === buy_cmpy) {
            cmpy_obj = currentPrices[p];
        }
    }

    // Add bought stock to portfolio db table
    $.post("/api/buy", {
        userid: userid,
        companyid: cmpy_obj.id,
        stock_quantity: 1,
        buy_price: cmpy_obj.close
    }).then(function(data) {
        console.log(JSON.stringify(data));
    });

    // Add bought stock to local portfolio
    owned_stock.company_name = cmpy_obj.company;
    owned_stock.companyid = cmpy_obj.id;
    owned_stock.buy_price = cmpy_obj.close;
    owned_stock.stock_quantity = 1;
    portfolio.push(owned_stock);

    // TBD: Create portfolio card (use jquery)

}

function sell() {
    console.log("sell");

    // Show company card

    // Sell company stock. Updates portfolio table entry
    $.ajax({
        method: "PUT",
        url: "/api/sell",
        id: portfolioid, // TBD
        stock_quantity: 1
    }).then(getTodos);
  
    // TBD: Hide portfolio card
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

function stop() {
    if (!running) { return; }
    console.log("stop");
    running = false;
    clearInterval(intervalId);
    displayStats();
}

function displayStats() {
    console.log("displayStats");
    // alert("Simulation Finished: These are your stats!");
}

