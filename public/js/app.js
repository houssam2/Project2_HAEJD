"use strict";

//sessionStorage.setItem("login_status", "success"); // Test only

if ( sessionStorage.getItem("login_status") == "fail" || 
    !sessionStorage.getItem("login_status")
   ) {
    document.body.style.display = "none";
}

const INTERVAL_MS = 1000;

let intervalId;
let day = 0;
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

//let userid = 1;  // Test, get from session variable
let userid = sessionStorage.getItem("userid");

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

    // TBD: show all company cards

    day = 0;
    clearInterval(intervalId);
    intervalId = setInterval(intervalProcessing, INTERVAL_MS);
    running = true;
}

function intervalProcessing() {
    ++day;
    console.log("IntervalProcessing() - Day: " + day);
    getPricesForDay(day);
}

let currentPrices = [];

function getPricesForDay(day) {
    $.get("api/prices/"+day, function(prices) {
        // console.log(JSON.stringify(prices));
        if (prices.length === 0) {
            stop();
        } else {
            currentPrices = prices;
            // Populate company tiles with daily prices
            //for (let p=0; p<prices.length; ++p) {
            for (let p=0; p<2; ++p) { // Test only
                // TBD
                //if (user owns company) {
                    // Update portfolio card
                //} else {
                    // Update company card
                    $("#"+prices[p].company).text(prices[p].close);
                //}
            }
        }
    });
}

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

    // Buy company stock. Creates portfolio table entry
    $.post("/api/buy", {
        userid: userid,
        companyid: cmpy_obj.id,
        stock_quantity: 1,
        buy_price: cmpy_obj.close
    }).then(function(data) {
        console.log(JSON.stringify(data));
    });

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

