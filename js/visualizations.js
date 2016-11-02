/**
 * 	File:   visualization.js
 *  Author: Rubin Trailor
 *
 * 	Resources:
 * 		- Mike Bostock's visualization on Parallel Coordinates
 * 	 	  Link: http://bl.ocks.org/mbostock/1341021
 */

/**
 * Redraws all the objects so that the selected object is in the front.
 * Resource: http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
 */
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

/**
 * Creates string object for the translate function
 * @method translate
 * @param  {number} x   Input for the x-coord
 * @param  {number} y   Input for the y-coord
 * @return {String}     Translate delcaration in a String format
 */
var translate = function(x, y) {
    return "translate(" + String(x) + ", " + String(y) + ")";
};

var data = []; // Where all of our processed data from our dataset will be stored

/**
 *	Heatmap Setup
 *
 */
var teamMap = {};

var margin = {
    top: 110,
    right: 80,
    bottom: 80,
    left: 180
};

var width        = 740 - margin.left - margin.right;
var height       = 500 - margin.top - margin.bottom;
var detailWidth  = width;
var detailHeight = 150;

var heatmapsvg = d3.select("body").select("#heatmap")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", translate(0, 0));

var heatmapDetailsvg = d3.select("body").select("#heatmap-details")
    .attr("width", detailWidth + margin.left + margin.right)
    .attr("height", detailHeight)
  .append("g")
    .attr("transform", translate(0, 0));

var plot = heatmapsvg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(margin.left, margin.top));

var xScale = d3.scale.ordinal()
    .rangeBands([0, width], 0, 0);

var yScale = d3.scale.ordinal()
    .rangeBands([height, 0], 0, 0);

var color = d3.scale.linear()
    .range(["#FF0000", "#FFFFFF", "#00FF00"]);

/**
 *	Stacked Bar Chart Setup
 *
 */
var teamAccuracyMap = {};

 var bcMargin = {
     top: 20,
     right: 70,
     bottom: 70,
     left: 100
 }

 var bcWidth  = 740 - bcMargin.left - bcMargin.right;
 var bcHeight = 500 - bcMargin.top - bcMargin.bottom;

var svgBC = d3.select("body").select("#bar-chart")
    .attr("width", bcWidth + bcMargin.left + bcMargin.right)
    .attr("height", bcHeight + bcMargin.top + bcMargin.bottom)
    .append("g")
    .attr("transform", translate(bcMargin.left, bcMargin.top));

var bcColor = d3.scale.ordinal()
    .range(["#32CD32", "#FF4040"])
    .domain(["on", "off"]);

var formatPercent = d3.format(".0%");

var xBC = d3.scale.linear()
        .range([0, bcWidth])
        // .domain([0, 450])
        .domain([0, 1])
        .nice();

var yBC = d3.scale.ordinal()
        .rangeRoundBands([bcHeight, 0], 0.1);

var xAxisBC = d3.svg.axis()
        .scale(xBC)
        .orient("bottom")
        .tickFormat(formatPercent);

var yAxisBC = d3.svg.axis()
        .scale(yBC)
        .orient("left");

/**
 *	Parallel Coordinates Setup
 *
 */
var teamShotTimeMap = {};

var marginPC = {
    top: 20,
    right: 0,
    bottom: 35,
    left: 0
}

var widthPC = 740 - marginPC.left - marginPC.right;
var heightPC = 500 - marginPC.top - marginPC.bottom;

var xPC = d3.scale.ordinal()
    .rangePoints([0, widthPC], 1);

var yPC = {};

var linePC = d3.svg.line();

var axisPC = d3.svg.axis()
    .orient("left");

var svgPC = d3.select("body").select("#parallel")
    .attr("width", widthPC + marginPC.left + marginPC.right)
    .attr("height", heightPC + marginPC.top + marginPC.bottom)
  .append("g")
    .attr("transform", "translate(" + marginPC.left + "," + marginPC.top + ")");

/**
 *	Bubble Plot Setup
 *
 */
var teamDefenseMap = {}; // Map for all the team's defense statistics

var marginBP = {
    top   : 20,
    right : 20,
    bottom: 50,
    left  : 50
}

var widthBP  = 740 - marginBP.left - marginBP.right;
var heightBP = 500 - marginBP.top - marginBP.bottom;
var radius   = { min: 10, max: 50 }; // radius for the bubbles
var fill     = { min: "#F7FCB9", max: "#31A354" }; // the color range for our bubbles

var legendBP = {
    width : 200,
    height: 20
}

// Columns for the visualization
var columns = {
    x   : "clearances",
    y   : "saves",
    area: "opponentShots",
    fill: "blocks"
}

// Scales for each component of the visualization
var scales = {
    x: d3.scale.linear().range([0, widthBP]),
    y: d3.scale.linear().range([heightBP, 0]),
    area: d3.scale.sqrt().range([radius.min, radius.max]),
    fill: d3.scale.linear().range([fill.min, fill.max])
}

var svgBP = d3.select("body").select("#bubble-plot")
    .attr("width", widthBP + marginBP.left + marginBP.right)
    .attr("height", heightBP + marginBP.top + marginBP.bottom);

/**
 *	Data set processing
 *
 * 	We'll use an accessor to process every row and pull the information we want.
 * 	Then, we'll analyze every row and update our maps for each visualization.
 */
d3.csv("data/premier-league-season-1516.csv",
    function(d) {
        var row = {};

        // Away Stats
        row.awayTeam           = d["away_team"];
        row.awayAssists        = +d["assists_away_team"];
        row.awayGoals          = +d["away_goals"];
        row.awayGoalsDetails    = d["away_goals_details"];
        row.awayBlocks         = +d["blocks_away_team"]
        row.awayClearances     = +d["clearances_away_team"];
        row.awayCorners        = +d["corners_away_team"];
        row.awayCrosses        = +d["crosses_away_team"];
        row.awayFreeKicks      = +d["free_kicks_away_team"];
        row.awaySaves          = +d["saves_away_team"];
        row.awayShotsOffTarget = +d["shots_off_target_away_team"];
        row.awayShotsOnTarget  = +d["shots_on_target_away_team"];
        row.awayTotalShots     = +d["total_shots_away_team"];

        // Home Stats
        row.homeTeam           = d["home_team"];
        row.homeAssists        = +d["home_away_team"];
        row.homeGoals          = +d["home_goals"];
        row.homeGoalsDetails    = d["home_goals_details"];
        row.homeBlocks         = +d["blocks_home_team"]
        row.homeClearances     = +d["clearances_home_team"];
        row.homeCorners        = +d["corners_home_team"];
        row.homeCrosses        = +d["crosses_home_team"];
        row.homeFreeKicks      = +d["free_kicks_home_team"];
        row.homeSaves          = +d["saves_home_team"];
        row.homeShotsOffTarget = +d["shots_off_target_home_team"];
        row.homeShotsOnTarget  = +d["shots_on_target_home_team"];
        row.homeTotalShots     = +d["total_shots_home_team"];

        // Other Stats
        row.date               = d["date"];
        row.attendance         = +d["attendance"];
        row.score              = [row.homeGoals, row.awayGoals];

        if (row.homeGoals < row.awayGoals) {
            row.winner = "Away";
            row.score = row.awayGoals;
        }
        else if (row.homeGoals > row.awayGoals) {
            row.winner = "Home";
            row.score = row.awayGoals;
        }
        else {
            row.winner = "Tie";
            row.score = 0;
        }

        return row;
    },
    function(error, rows) {
        if (error) throw error;

        data = rows;
        console.log("data", data);

        // Map for the Team vs Team performance heatmap
        teamMap = d3.nest()
            // .key(function(d) { return d.date; })
            .key(function(d) { return d.homeTeam; } )
            .key(function(d) { return d.awayTeam; } )
            .rollup(function(d) {
                return 0;
            })
            .map(rows, d3.map);

        console.log(teamMap);

        teamAccuracyMap = d3.nest()
            .key(function(d) { return d.homeTeam; })
            .rollup(function(d) {
                return {
                    shotsOffTarget: 0,
                    shotsOnTarget: 0
                };
            })
            .map(rows, d3.map);

        console.log("team acc map", teamAccuracyMap);

        // Map for the goal times
        teamShotTimeMap = d3.nest()
            .key(function(d) { return d.homeTeam; })
            .rollup(function(d) {
                return {
                    "0-15": 0,
                    "15-30": 0,
                    "30-45": 0,
                    "45+extra": 0,
                    "45-60": 0,
                    "60-75": 0,
                    "75-90": 0,
                    "90+extra": 0
                };
            })
            .map(rows, d3.map);

        console.log("team shot time map", teamShotTimeMap);

        // Map for the defense stats
        teamDefenseMap = d3.nest()
            .key(function(d) { return d.homeTeam; })
            .rollup(function(d) {
                return {
                    opponentShots: 0,  // Only record on target shots
                    saves: 0,
                    clearances: 0,
                    blocks: 0
                }
            })
            .map(rows, d3.map);
        console.log("Defense map", teamDefenseMap);

        // This is all done in order to get a map of the teams with consistent points
        var teamNames = d3.nest()
            .key(function(d) { return d.homeTeam; })
            .map(rows, d3.map);

        teamNames = teamNames.keys();
        teamNames = teamNames.sort();

        // This is where we process each game in the dataset and add the necessary
        // information into its particular data structure
        data.forEach(function(d) {
            var aTeam = d.awayTeam;
            var hTeam = d.homeTeam;
            /*
                Getting data for performance evaluation
             */
            var winner;
            var winnerObj;
            var loser;
            var results;
            if (d.homeGoals < d.awayGoals) {
                winner = d.awayTeam;
                loser = d.homeTeam;
                results = d.awayGoals - d.homeGoals;
            } else if (d.homeGoals > d.awayGoals) {
                winner = d.homeTeam;
                loser = d.awayTeam;
                results = d.homeGoals - d.awayGoals;
            }
            else {
                winner = d.homeTeam;
                loser = d.awayTeam;
                results = 0;
            }

            if (typeof teamMap.get(winner).get(loser) === "undefined") {
                teamMap.get(winner).set(loser, 0);
            }
            if (typeof teamMap.get(loser).get(winner) === "undefined") {
                teamMap.get(loser).set(winner, 0);
            }

            var winScore = teamMap.get(winner).get(loser) + results;
            var loseScore = teamMap.get(loser).get(winner) - results;
            teamMap.get(winner).set(loser, winScore);
            teamMap.get(loser).set(winner, loseScore);

            /*
                Data for accuracy evaluation
             */
            teamAccuracyMap.get(d.awayTeam).shotsOffTarget += d.awayShotsOffTarget;
            teamAccuracyMap.get(d.awayTeam).shotsOnTarget += d.awayShotsOnTarget;
            teamAccuracyMap.get(d.homeTeam).shotsOffTarget += d.homeShotsOffTarget;
            teamAccuracyMap.get(d.homeTeam).shotsOnTarget += d.homeShotsOnTarget;

            /*
                Data for Scoring
             */
            // var pattern = /([\D]*)\s*(\(\d*\W?\d?\)|\(\d*\s*OG\)|\(\d*\s*Pen\)|\(\d*,\s*\d*\sPen\))(,?)/g;
            // var pattern = /\(\d*\)|\(\d*\+\d*\)|\(\d*\sOG\)|\(\d*\sPen\)/g;
            var pattern = /(\d+\+\d+,?|\d+,?\s?)/g;
            if (d.homeGoalsDetails !== "") {
                var s = d.homeGoalsDetails;
                var test = s.match(pattern);
                // console.log("home", s);
                if (test != null) {
                    // console.log("test 1", test);
                    test.forEach(function(d) {
                        var num = d.trim();
                        var key;
                        if (d.includes("+")) {
                            var num1 = parseInt(d.substring(0, 2));
                            if (num1 == 45) {
                                key = "45+extra"
                            }
                            else {
                                key = "90+extra"
                            }
                        }
                        else if (num >= 0 && num < 15) {
                            key = "0-15";
                        }
                        else if (num >= 15 && num < 30) {
                            key = "15-30";
                        }
                        else if (num >= 30 && num < 45) {
                            key = "30-45";
                        }
                        else if (num >= 45 && num < 60) {
                            key = "45-60";
                        }
                        else if (num >= 60 && num < 75) {
                            key = "60-75";
                        }
                        else if (num >= 75 && num < 90) {
                            key = "75-90";
                        }
                        // console.log(typeof teamShotTimeMap.get(hTeam)[d]);
                        if (typeof teamShotTimeMap.get(hTeam)[key] === "undefined") {
                            teamShotTimeMap.get(hTeam)[key] = 0;
                        }
                        teamShotTimeMap.get(hTeam)[key] += 1;
                    });
                }

            }
            if (d.awayGoalsDetails !== "") {
                var s = d.awayGoalsDetails;
                var test = s.match(pattern);
                // console.log("home", s);
                if (test != null) {
                    // console.log("test 1", test);
                    test.forEach(function(d) {
                        var num = d.trim();
                        var key;
                        if (d.includes("+")) {
                            var num1 = parseInt(d.substring(0, 2));
                            if (num1 == 45) {
                                key = "45+extra"
                            }
                            else {
                                key = "90+extra"
                            }
                            // num = parseInt(d.substring(0, 2)) + parseInt(d.substring(3));
                            // console.log("num", num);
                        }
                        else if (num >= 0 && num < 15) {
                            key = "0-15";
                        }
                        else if (num >= 15 && num < 30) {
                            key = "15-30";
                        }
                        else if (num >= 30 && num < 45) {
                            key = "30-45";
                        }
                        else if (num >= 45 && num < 60) {
                            key = "45-60";
                        }
                        else if (num >= 60 && num < 75) {
                            key = "60-75";
                        }
                        else if (num >= 75 && num < 90) {
                            key = "75-90";
                        }
                        // console.log(typeof teamShotTimeMap.get(hTeam)[d]);
                        if (typeof teamShotTimeMap.get(hTeam)[key] === "undefined") {
                            teamShotTimeMap.get(hTeam)[key] = 0;
                        }
                        teamShotTimeMap.get(hTeam)[key] += 1;
                    });
                }
            }

            // Process data for the bubble chart
            teamDefenseMap.get(d.awayTeam).opponentShots += d.homeShotsOnTarget;
            teamDefenseMap.get(d.awayTeam).saves += d.awaySaves;
            teamDefenseMap.get(d.awayTeam).clearances += d.awayClearances;
            teamDefenseMap.get(d.awayTeam).blocks += d.awayBlocks;
            teamDefenseMap.get(d.homeTeam).opponentShots += d.awayShotsOnTarget;
            teamDefenseMap.get(d.homeTeam).saves += d.homeSaves;
            teamDefenseMap.get(d.homeTeam).clearances += d.homeClearances;
            teamDefenseMap.get(d.homeTeam).blocks += d.homeBlocks;
        });

        console.log("updated tmap", teamMap);
        console.log("updated acc tmap", teamAccuracyMap);
        console.log("updated shot time map", teamShotTimeMap);
        console.log("updated defense map", teamDefenseMap);

        // Domain for the team names axis
        xScale.domain(teamNames);
        yScale.domain(teamNames.reverse());

        // Domain for the color scale for the heatmap
        var max = 7;
        var min = -7;
        color.domain([min, 0, max]);

        // Domain for y axis of the stacked bar chart
        yBC.domain(teamNames);

        // Call of the visualization drawing functions
        drawHeatmap();
        drawBarChart();
        drawParallelCoordinates();
        drawBubbleChart();
    }
);

var drawHeatmap = function() {
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("top")
        .tickPadding(0);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickPadding(0);

    plot.append("g")
        .attr("class", "x axis")
        .attr("tranform", translate(0, height))
        .call(xAxis)
      .selectAll("text")
        .attr("y", -5)
        .attr("x", 15)
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "start");

    plot.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .selectAll("text")
        .attr("x", -10);

    // Label for x axis
    heatmapsvg.append("text")
        .attr("id", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", (width + margin.left + margin.right + 120) / 2)
        .attr("y", 15)
        .text("Opponent");

    // Label for y axis
    heatmapsvg.append("text")
        .attr("id", "y-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -300)
        .attr("y", 40)
        .text("Team Being Analyzed");

    // Tooltip for when we hover over cells
    var tooltip = heatmapDetailsvg.append("text")
        .attr("id", "tooltip")
        .attr("text-anchor", "end")
        .attr("x", detailWidth / 2 + 140)
        .attr("y", detailHeight / 2)
        .attr("dx", "30px")
        .attr("dy", "40px")
        .text("");

    var team = heatmapDetailsvg.append("text")
        .attr("id", "tooltip")
        .attr("text-anchor", "end")
        .attr("x", detailWidth / 2 + 140)
        .attr("y", detailHeight / 2)
        .attr("dx", "-50px")
        .attr("dy", "-4px")
        .text("");

    var teamImg = heatmapDetailsvg.append("image")
        .attr("id", "team-img")
        .attr("x", 105)
        .attr("y", 30)
        .attr("width", 80)
        .attr("height", 80)
        .attr("xlink:href", "");

    var opponent = heatmapDetailsvg.append("text")
        .attr("id", "tooltip")
        .attr("text-anchor", "start")
        .attr("x", detailWidth / 2 - 15)
        .attr("y", detailHeight / 2)
        .attr("dx", "200px")
        .attr("dy", "-4px")
        .text("");

    var opponentImg = heatmapDetailsvg.append("image")
        .attr("id", "oppoent-img")
        .attr("x", 605)
        .attr("y", 30)
        .attr("width", 80)
        .attr("height", 80)
        .attr("xlink:href", "");

    var rows = plot.append("g")
        .attr("class", "heatmap")
        .selectAll("g")
        .data(teamMap.entries())
      .enter()
        .append("g")
        .attr("id", function(d) { return d.key; })
        .attr("transform", function(d) { return translate(0, yScale(d.key)) })
        .on("mouseover", function(d) {
            team.text("Team: " + d.key);
            team.style("visibility", "visible");
            // Update the badge image
            teamImg.attr("xlink:href", getTeamBadge(d.key));
        })
        .on("mouseout", function(d) {
            team.text("");
            team.style("visibility", "hidden");
            // Update the badge image
            teamImg.attr("xlink:href", "");
        });

    var cells = rows.selectAll("rect")
        .data(function(d) { return d.value.entries(); })
      .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return xScale(d.key); })
        .attr("y", 0)
        .attr("width", xScale.rangeBand())
        .attr("height", yScale.rangeBand())
        .style("fill", function(d) {
            return color(d.value);
        })
        .on("mouseover", function(d) {
            opponent.text("Opponent: " + d.key);
            opponent.style("visibility", "visible");

            tooltip.text("Value: " + d.value);
            tooltip.style("visibility", "visible");

            // Update the badge image
            opponentImg.attr("xlink:href", getTeamBadge(d.key));
        })
        .on("mouseout", function(d) {
            tooltip.text("");
            tooltip.style("visibility", "hidden");
            opponent.text("");
            opponent.style("visibility", "hidden");
            // Update the badge image
            opponentImg.attr("xlink:href", "");
        });

    var percentScale = d3.scale.linear()
        .domain(d3.extent(color.domain()))
        .rangeRound([0, 100]);

    heatmapsvg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .selectAll("stop")
        .data(color.domain())
      .enter()
        .append("stop")
        .attr("offset", function(d) {
            return "" + percentScale(d) + "%";
        })
        .attr("stop-color", function(d) {
            return color(d);
        })

    var legendGroup = heatmapsvg.append("g")
        .attr("id", "legend");

    legendGroup.append("rect")
        .attr("id", "legend-rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 100)
        .attr("height", 20)
        .attr("fill", "url(#gradient)");

    var legendScale = d3.scale.linear()
        .domain(percentScale.domain())
        .range([0, 100]);

    var legendAxis = d3.svg.axis()
        .scale(legendScale)
        .orient("bottom")
        .innerTickSize(4)
        .outerTickSize(4)
        .tickPadding(4)
        .tickValues(color.domain());

    legendGroup.append("g")
        .attr("id", "color-axis")
        .attr("class", "legend")
        .attr("transform", translate(0, 20))
        .call(legendAxis);

    // var bounds = legendGroup.node().getBBox();
    var xshift = width / 2 + 100;
    var yshift = height + 140;
    legendGroup.attr("transform", translate(xshift, yshift));

    // Helper function to get the badge image location of the corresponding
    // team.
    function getTeamBadge(name) {
        if (name === "Arsenal") {
            return "images/badges/arsenal.png";
        }
        else if (name === "Aston Villa") {
            return "images/badges/aston-villa.png";
        }
        else if (name === "Bournemouth") {
            return "images/badges/bournemouth.png";
        }
        else if (name === "Chelsea") {
            return "images/badges/chelsea.png";
        }
        else if (name === "Crystal Palace") {
            return "images/badges/crystal-palace.png";
        }
        else if (name === "Everton") {
            return "images/badges/everton.png";
        }
        else if (name === "Leicester") {
            return "images/badges/leicester.png";
        }
        else if (name === "Liverpool") {
            return "images/badges/liverpool.png";
        }
        else if (name === "Man City") {
            return "images/badges/manchester-city.jpg"; // Using new badge
        }
        else if (name === "Man Utd") {
            return "images/badges/manchester-united.png";
        }
        else if (name === "Newcastle") {
            return "images/badges/newcastle.png";
        }
        else if (name === "Norwich") {
            return "images/badges/norwich.png";
        }
        else if (name === "Southampton") {
            return "images/badges/southampton.png";
        }
        else if (name === "Spurs") {
            return "images/badges/spurs.png";
        }
        else if (name === "Stoke") {
            return "images/badges/stoke.png";
        }
        else if (name === "Sunderland") {
            return "images/badges/sunderland.png";
        }
        else if (name === "Swansea") {
            return "images/badges/swansea.png";
        }
        else if (name === "Watford") {
            return "images/badges/watford.png";
        }
        else if (name === "West Brom") {
            return "images/badges/west-brom.png";
        }
        else if (name === "West Ham") {
            return "images/badges/west-ham.png";
        }
    }
}

var drawBarChart = function() {
    // Add our shots into an array that's easier to process
    // for the bar chart
    var shotArray = [];
    var shotEnt = teamAccuracyMap.entries();
    shotEnt.forEach(function(d) {
        // Stacked
        // var objOnTarg = { key: d.key, target: "on", x0: 0, x1: d.value.shotsOnTarget, val: d.value.shotsOnTarget }
        // var objOffTarg = { key: d.key, target: "off", x0: objOnTarg.val, x1: d.value.shotsOffTarget, val: d.value.shotsOffTarget }
        // Normalized
        var total = d.value.shotsOnTarget + d.value.shotsOffTarget;
        var objOnTarg = { key: d.key, target: "on", x0: 0, x1: d.value.shotsOnTarget / total, val: d.value.shotsOnTarget }
        var objOffTarg = { key: d.key, target: "off", x0: objOnTarg.x1, x1: d.value.shotsOffTarget / total, val: d.value.shotsOffTarget }
        shotArray.push(objOnTarg);
        shotArray.push(objOffTarg);
    });

    svgBC.append("g")
        .attr("class", "bc x axis")
        .attr("transform", translate(0, bcHeight))
        .call(xAxisBC)
        .append("text")
            .attr("id", "x-label")
            .attr("x", (bcWidth / 2) - 60)
            .attr("y", 40)
            .text("Shot Percentage");;

    svgBC.append("g")
        .attr("class", "bc y axis")
        .attr("transform", translate(0, 0))
        .call(yAxisBC);

    var plotBC = svgBC.selectAll(".plot")
        .data(shotArray)
        .enter()
      .append("g")
        .attr("id", "plotBC")
        .attr("transform", translate(bcMargin.left, bcMargin.top));

    var bars = plotBC.selectAll("rect")
        .data(shotArray)
        .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
            return xBC(d.x0) - 98;
        })
        .attr("y", function(d) {
            return yBC(d.key) - 20;
        })
        .attr("width", function(d) {
            return xBC(d.x1);
        })
        .attr("height", yBC.rangeBand())
        .attr("transform", translate(0, 0))
        .style("fill", function(d) {
            return bcColor(d.target);
        });

    var tooltipBC = svgBC.append("text")
        .attr("class", "tooltip-bc")
        .attr("text-anchor", "start")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("dx", "-4px")
        .attr("dy", "-4px")
        .style("visibility", "hidden")
        .text("");

    bars.on("mouseover", function(d) {
        tooltipBC.style("visibility", "visible");
        tooltipBC.attr("x", xBC(d.x0) + 30);
        tooltipBC.attr("y", yBC(d.key) + 17);

        // Formatting the text
        var text = "Total Count: " + d.val + "   " +
            "Percentage: " + d.x1.toFixed(2)[2] + d.x1.toFixed(2)[3] + "%";

        tooltipBC.text(text);
    })
    .on("mouseout", function(d) {
        tooltipBC.style("visibility", "hidden");
        tooltipBC.text("");
    });
}

var drawParallelCoordinates = function() {
    // Arrays for each key so that we can use them for the domains later.
    var extents = {
        "0-15": [],
        "15-30": [],
        "30-45": [],
        "45+extra": [],
        "45-60": [],
        "60-75": [],
        "75-90": [],
        "90+extra": []
    }

    // Go through the shot time map and put each value in the corresponding
    // array.
    teamShotTimeMap.values().forEach(function(d) {
        extents["0-15"].push(d["0-15"]);
        extents["15-30"].push(d["15-30"]);
        extents["30-45"].push(d["30-45"]);
        extents["45+extra"].push(d["45+extra"]);
        extents["45-60"].push(d["45-60"]);
        extents["60-75"].push(d["60-75"]);
        extents["75-90"].push(d["75-90"]);
        extents["90+extra"].push(d["90+extra"]);
    });

    // Make the extent object into a map for easier processing
    extents = d3.map(extents);

    // Set the domain for the x-axis as the keys for the y-axis
    xPC.domain(extents.keys());

    // Set the domain and range for each y-axis based on their corresponding
    // extent values.
    extents.entries().forEach(function(d) {
        yPC[d.key] = d3.scale.linear()
            .domain(d3.extent(d.value))
            .range([heightPC, 0]);
    });

    // We need to create this array since the ID's we create for some of the
    // teams will not match their original name. This is important for brushing,
    // and will help us avoid weird bugs.
    var idArray = []

    // Creating the id array with the new ID's
    teamShotTimeMap.entries().forEach(function(d) {
        idArray.push(getTeamID(d.key));
    })

    // Color scale for each team. The colors won't tell us much but it will help
    // show which lines are different from each other.
    var colorPC = d3.scale.category20()
        .domain(idArray);

    // tooltip for the lines in the visualization
    var tooltipPC = d3.select("body").append("div")
        .attr("class", "tooltip-pc")
        .style("visibility", "hidden");

    var coordLines = svgPC.append("g")
        .attr("class", "coordLines")
      .selectAll("path")
        .data(teamShotTimeMap.entries())
        .enter()
      .append("path")
        .attr("class", "line")
        .attr("id", function(d) { return getTeamID(d.key); })
        .attr("d", path)
        .style("stroke", function(d) { return colorPC(getTeamID(d.key)); })
        .on("click", function(d) {
            var name = getTeamID(d.key);
            var selectedLine = d3.select("path#" + name);

            // Get all the other teams
            var otherLines = d3.select("#parallel").select(".coordLines").selectAll("path").filter(function(d) {
                return getTeamID(d.key) !== name;
            });

            if (selectedLine.attr("class").indexOf("selected") < 0) {
                // select current line and set it to selected
                // then keep the color
                selectedLine.transition().style("stroke", colorPC(name))
                selectedLine.classed( {"selected": true});
                selectedLine.moveToFront();
                // set the other lines to false and update their color to light gray
                otherLines.classed({ "selected": false });
                otherLines.transition().style("stroke", "#EEEEEE");
            }
            else {
                // select current line and reset it
                selectedLine.transition().style("stroke", colorPC(name));
                selectedLine.classed({"selected": false});

                // select the other lines and reset their colors
                d3.select("#parallel").select(".coordLines").selectAll("path").filter(function(d) {
                    return getTeamID(d.key) !== name;
                }).each(function(d) {
                    // update line colors
                    var other = d3.select("path#" + getTeamID(d.key));
                    other.transition().style("stroke", colorPC(getTeamID(d.key)));
                })
            }
        })
        .on("mouseover", function(d) {
            tooltipPC.style("visibility", "visible");
            tooltipPC.html(d.key)
                .style("left", (d3.event.pageX + 10) + "px") // Move the tooltip over so
                .style("top", (d3.event.pageY + 10) + "px"); // it doesn't obstruct
        })
        .on("mouseout", function(d) {
            tooltipPC.style("visibility", "hidden");
        });

    var g = svgPC.selectAll(".dimensions")
        .data(extents.keys())
      .enter()
        .append("g")
        .attr("class", "dimensions")
        .attr("transform", function(d) { return "translate(" + xPC(d) + ")";});

    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axisPC.scale(yPC[d])); })
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; });

    // Helper function to get the path for each team
    function path(d) {
        return linePC(extents.keys().map(function(p) { return [ xPC(p), yPC[p](d.value[p]) ]; }));
    };

    // Helper function to get the id for teach team.
    // Specifically helpful for those teams whose name's have two words
    function getTeamID(name) {
        if (name === "Aston Villa") {
            return "AV"
        }
        if (name === "Crystal Palace") {
            return "CP"
        }
        if (name === "Man City") {
            return "MC"
        }
        if (name === "Man Utd") {
            return "MU"
        }
        if (name === "West Brom") {
            return "WB"
        }
        if (name === "West Ham") {
            return "WH"
        }
        return name;
    };
}


var drawBubbleChart = function() {
    // Create arrays that will be used to check for the extents for each value.
    var extents = {
        "opponentShots": [],
        "saves": [],
        "clearances": [],
        "blocks": []
    }

    // For each team, push their values to their corresponding extent arrays
    teamDefenseMap.values().forEach(function(d) {
        extents.opponentShots.push(d.opponentShots);
        extents.saves.push(d.saves);
        extents.clearances.push(d.clearances);
        extents.blocks.push(d.blocks);
    });

    // Iterate through our scales to set their domains
    for (var key in columns) {
        var col = columns[key];
        scales[key].domain(
            d3.extent(extents[col]) // get the corresponding extent array
        );
    }

    // Setup the tooltip
    var tooltipBP = d3.select("body").append("div")
        .attr("class", "tooltip-bp")
        .style("visibility", "hidden");

    // Now we actually start drawing the visualization
    var plotBP = svgBP.append("g")
        .attr("id", "plotBP")
        .attr("transform", translate(marginBP.left, marginBP.top));

    var xRange = scales.x.range();
    var xDomain = scales.x.domain();
    var xShift = (radius.max + 5) / (xRange[1] - xRange[0]);
    xShift = xShift * (xDomain[1] - xDomain[0]);
    scales.x.domain([xDomain[0] - xShift, xDomain[1] + xShift]);

    var yRange = scales.y.range();
    var yDomain = scales.y.domain();
    var yShift = (radius.max + 5) / (yRange[0] - yRange[1]);
    yShift = yShift * (yDomain[1] - yDomain[0]);
    scales.y.domain([yDomain[0] - yShift, yDomain[1] + yShift]);

    // Drawing the axis lines
    var xAxis = d3.svg.axis()
        .scale(scales.x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(scales.y)
        .orient("left");

    plotBP.append("g")
        .attr("id", "xBP")
        .attr("class", "axis")
        .attr("transform", translate(0, heightBP))
        .call(xAxis)
        .append("text")
        .attr("x", d3.max(scales.x.range()) / 2)
        .attr("y", 50)
        .attr("dx", 0)
        .attr("dy", "-5px")
        .text("Clearances");

    plotBP.append("g")
        .attr("id", "yBP")
        .attr("class", "axis")
        .call(yAxis)
        .append("text")
        .attr("text-anchor", "end")
        .attr("x", -200)
        .attr("y", -55)
        .attr("dx", 0)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90,0," + d3.min(scales.y.range()) + ")")
        .text("Saves");

    // Drawing the circles
    var bubbles = plotBP.append("g")
        .attr("class", "bubbles")
        .selectAll("g")
        .data(teamDefenseMap.entries())
        .enter()
      .append("g")
        .attr("id", function(d) { return d.key; });

    // Creating the bubbles
    bubbles.append("circle")
        .attr("cx", function(d) {
            return scales.x(d.value[columns.x]);
        })
        .attr("cy", function(d) {
            return scales.y(d.value[columns.y]);
        })
        .attr("r", function(d) {
            return scales.area(d.value[columns.area]);
        })
        .style("fill", function(d) {
            return scales.fill(d.value[columns.fill]);
        });

    // Appending the team names to the corresponding bubbles
    bubbles.append("text")
        .attr("x", function(d) {
            return scales.x(d.value[columns.x]);
        })
        .attr("y", function(d) {
            return scales.y(d.value[columns.y])
        })
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("overflow", "hidden")
        .text(function(d) { return d.key; });

    // Adding interactivity with the tooltip and the bubbles
    bubbles.on("mouseover", function(d) {
            tooltipBP.style("visibility", "visible");

            // Formatting the text
            var text = d.key + "<br/ >" +
                "Saves: " + d.value.saves + "<br/ >" +
                "Clearances: " + d.value.clearances + "<br/ >" +
                "Opponent Shots: " + d.value.opponentShots + "<br/ >" +
                "Blocks: " + d.value.blocks;

            tooltipBP.html(text)
            .style("left", (d3.event.pageX + 10) + "px") // Move the tooltip over so
            .style("top", (d3.event.pageY + 10) + "px"); // it doesn't obstruct
        })
        .on("mouseout", function(d) {
            tooltipBP.style("visibility", "hidden");
        });

    // Draw area legend
    var areaLegend = plotBP.append("g")
        .attr("id", "area-legend")
        .attr("class", "legend");

    areaLegend.append("text")
        .attr("text-anchor", "middle")
        .attr("x", radius.max)
        .attr("y", radius.max + radius.max)
        .attr("dx", 0)
        .attr("dy", "12px")
        .text(columns.area);

    areaLegend.append("circle")
        .attr("cx", radius.max)
        .attr("cy", radius.max)
        .attr("r", radius.max);

    areaLegend.append("text")
        .attr("text-anchor", "middle")
        .attr("x", radius.max)
        .attr("y", 0)
        .attr("dx", 0)
        .attr("dy", "12px")
        .text(Math.round(scales.area.invert(radius.max)));

    var mid = radius.min + (radius.max - radius.min) / 2;

    areaLegend.append("circle")
        .attr("cx", radius.max)
        .attr("cy", radius.max + radius.max - mid)
        .attr("r", mid);

    areaLegend.append("text")
        .attr("text-anchor", "middle")
        .attr("x", radius.max)
        .attr("y", radius.max + radius.max - mid - mid)
        .attr("dx", 0)
        .attr("dy", "12px")
        .text(Math.round(scales.area.invert(mid)));

    // Place the area legend in the lower right corner
    areaLegend.attr("transform", translate(d3.max(scales.x.range()) - 100, heightBP - 120));

    // Draw the fill legend
    var percentScaleBP = d3.scale.linear()
        .domain(d3.extent(scales.fill.domain()))
        .rangeRound([0, 100]);

    svgBP.append("defs")
        .append("linearGradient")
        .attr("id", "gradientBP")
        .selectAll("stop")
        .data(scales.fill.domain())
        .enter()
      .append("stop")
        .attr("offset", function(d) {
            return "" + percentScaleBP(d) + "%";
        })
        .attr("stop-color", function(d) {
            return scales.fill(d);
        });

    var fillLegend = svgBP.append("g")
        .attr("id", "fill-legend");

    fillLegend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendBP.width)
        .attr("height", legendBP.height)
        .attr("fill", "url(#gradientBP)");

    var legendScaleBP = d3.scale.linear()
        .domain(percentScaleBP.domain())
        .range([0, legendBP.width]);

    var legendAxisBP = d3.svg.axis()
        .scale(legendScaleBP)
        .orient("bottom")
        .innerTickSize(4)
        .outerTickSize(4)
        .tickPadding(4)
        .tickValues(scales.fill.domain());

    fillLegend.append("g")
        .attr("id", "fill")
        .attr("class", "axis")
        .attr("transform", translate(0, legendBP.height))
        .call(legendAxisBP);

    fillLegend.select("g#fill")
        .append("text")
        .attr("class", "axis")
        .attr("text-anchor", "middle")
        .attr("x", legendBP.width / 2.0)
        .attr("y", 8)
        .attr("dx", 0)
        .attr("dy", ".71em")
        .text(columns.fill);

    // Put the fill legend in the top right corner
    fillLegend.attr("transform", translate(100, 25));
}
