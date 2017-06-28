////////////////////////////////////////////////////////////////////////////////// 							~ START CANVAS SETUP ~							  //
////////////////////////////////////////////////////////////////////////////////

//Define height and width variables for the svg canvas
var width = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
var height = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;	

//Create an svg canvas to which to add DOM elements
var canvas = d3.select('body').append('svg')
	.attr('height', height)
	.attr('width', "100%");

var margin = {left:50, right: 200, top:100, bottom:0};

//Create a chart group for both the radar chart and bar chart with which we can manipulate the entire chart, respectively
var chartGroupRadar = canvas.append('g')
	.attr('transform','translate('+margin.left+','+margin.top+')')
	.attr('class', 'chartGroupRadar');

var chartGroupBar = canvas.append('g')
	.attr('transform','translate('+margin.left+','+margin.top+')')
	.attr('class', 'chartGroupBar');
////////////////////////////////////////////////////////////////////////////////// 							~ END CANVAS SETUP ~							  //
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////// 						~ FILTER FUNCTIONALITY SECTION ~					  //
////////////////////////////////////////////////////////////////////////////////

//Pull in complete employee data file from downloaded json
var employeeData = d3.json("/RadarChart/employeeData.json").get(function(error,data){
	console.log(data);
	
//Create an array of all the employee names to eventually populate the filters
var employeeCount = data.length;

var employeeList = [];
	for (i = 0; i < employeeCount; i++)
	{employeeList.push(data[i].name) ;}

employeeList = employeeList.sort()
			
//Create an array of all the UNIQUE project names to eventually populate the filters
var projectList	= [];
	for (i = 0; i < employeeCount; i++){
		for(j = 0; j< data[i].projects.length; j++){
			projectList.push(data[i].projects[j].projectName);}
	}

//Remove duplicate entries from our projectList array using a javascript filter function. Then sort the array alphabetically using a simple array.sort() accessory function. Note that the array.sort only works because the projects are all in the same case format, title case.
projectList = projectList.filter( function( item, index, inputArray ) {
           return inputArray.indexOf(item) == index;
    });

projectList = projectList.sort()
		//console.log(projectList);

////////////////////////////////////////////////////////////////////////////////// 						~ END FILTER FUNCTIONALITY SECTION ~				  //
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////// 						~ START AUTOCOMPLETE FUNCTION SECTION ~				  //
////////////////////////////////////////////////////////////////////////////////

//This autocomplete function was pre-built and used, with permission, from http://www.brightpointinc.com/download/autocomplete-source-code/?source=d3js
	
//Variable to hold autocomplete options
	var keys;
	
//Load employee names as options from from the original employeeData.json file in the Filter Functionality Section, above 
	keys=data;
	start();
	
//Call back function to produce the right data based on dropdown selection
	function getByValue(data, value) {
			for (var i = 0; i < data.length; i++){
				if(data[i].name == value) return data[i];}
				console.log(data[i]);
	}
	
//Call back for when user selects an option
    function onSelect(d) {
        var selectedEmployee = (d.name);

selectedData = getByValue(data, selectedEmployee);
	console.log(selectedData);
	
	buildCharts(selectedData);

		;
	}


//Setup and render the autocomplete
function start() {
	var mc = autocomplete(document.getElementById('autoCompWrapper'))
			.keys(keys)
			.dataField("name")
			.placeHolder("Search Employees Registry - Start typing here")
			.width(500)
			.height(500)
			.onSelected(onSelect)
			.render();
    }
	
function autocomplete(parent) {
    var _data=null,
        _delay= 0,
        _selection,
        _margin = {top: 30, right: 10, bottom: 50, left: 80},
        __width = 420,
        __height = 420,
        _placeHolder = "Search",
        _width,
        _height,
        _matches,
        _searchTerm,
        _lastSearchTerm,
        _currentIndex,
        _keys,
        _selectedFunction=defaultSelected,
        _minLength = 1,
        _dataField = "dataField",
        _labelField = "labelField";

    _selection=d3.select(parent);

    function component() {
        _selection.each(function (data) {

//Select the svg element, if it exists.
            var container = d3.select(this).selectAll("#bp-ac").data([data]);
            var enter = container.enter()
                    .append("div")
                    .attr("id","bp-ac")
                    .attr("class","bp-ac")
                    .append("div")
                    .attr("class","padded-row")
                    .append("div")
                    .attr("class","bp-autocomplete-holder");

            container.attr("width", __width)
                .attr("height", __height);

            var input = enter.append("input")
                        .attr("class", "form-control")
                        .attr("placeholder",_placeHolder)
                        .attr("type","text")
                        .on("keyup",onKeyUp);

            var dropDown=enter.append("div").attr("class","bp-autocomplete-dropdown");

            var searching=dropDown.append("div").attr("class","bp-autocomplete-searching").text("Searching ...");

            hideSearching();
            hideDropDown();


            function onKeyUp() {
                _searchTerm=input.node().value;
                var e=d3.event;

                if (!(e.which == 38 || e.which == 40 || e.which == 13)) {
                    if (!_searchTerm || _searchTerm == "") {
                        showSearching("No results");
                    }
                    else if (isNewSearchNeeded(_searchTerm,_lastSearchTerm)) {
                        _lastSearchTerm=_searchTerm;
                        _currentIndex=-1;
                        _results=[];
                        showSearching();
                        search();
                        processResults();
                        if (_matches.length == 0) {
                            showSearching("No results");
                        }
                        else {
                            hideSearching();
                            showDropDown();
                        }

                    }

                }
                else {
                    e.preventDefault();
                }
            }

            function processResults() {

                var results=dropDown.selectAll(".bp-autocomplete-row").data(_matches, function (d) {
                    return d[_dataField];});
                results.enter()
                    .append("div").attr("class","bp-autocomplete-row")
                    .on("click",function (d,i) { row_onClick(d); })
                    .append("div").attr("class","bp-autocomplete-title")
                    .html(function (d) {
                        var re = new RegExp(_searchTerm, 'i');
                        var strPart = d[_dataField].match(re)[0];
                        return d[_dataField].replace(re, "<span class='bp-autocomplete-highlight'>" + strPart + "</span>");
                    });

                results.exit().remove();

//Update results

                results.select(".bp-autocomplete-title")
                    .html(function (d,i) {
                        var re = new RegExp(_searchTerm, 'i');
                        var strPart = _matches[i][_dataField].match(re);
                        if (strPart) {
                            strPart = strPart[0];
                            return _matches[i][_dataField].replace(re, "<span class='bp-autocomplete-highlight'>" + strPart + "</span>");
                        }

                    });


            }

            function search() {

                var str=_searchTerm;
                console.log("searching on " + _searchTerm);
                console.log("-------------------");

                if (str.length >= _minLength) {
                    _matches = [];
                    for (var i = 0; i < _keys.length; i++) {
                        var match = false;
                        match = match || (_keys[i][_dataField].toLowerCase().indexOf(str.toLowerCase()) >= 0);
                        if (match) {
                            _matches.push(_keys[i]);
                            //console.log("matches " + _keys[i][_dataField]);
                        }
                    }
                }
            }

            function row_onClick(d) {
                hideDropDown();
                input.node().value= d[_dataField];
                _selectedFunction(d);
            }

            function isNewSearchNeeded(newTerm, oldTerm) {
                return newTerm.length >= _minLength && newTerm != oldTerm;
            }

            function hideSearching() {
                searching.style("display","none");
            }

            function hideDropDown() {
                dropDown.style("display","none");
            }

            function showSearching(value) {
                searching.style("display","block");
                searching.text(value);
            }

            function showDropDown() {
                dropDown.style("display","block");
            }

        });
    }


    function measure() {
        _width=__width - _margin.right - _margin.left;
        _height=__height - _margin.top - _margin.bottom;
    }

    function defaultSelected(d) {
        console.log(d[_dataField] + " selected");
    }


    component.render = function() {
        measure();
        component();
        return component;
    }

    component.keys = function (_) {
        if (!arguments.length) return _keys;
        _keys = _;
        return component;
    }

    component.dataField = function (_) {
        if (!arguments.length) return _dataField;
        _dataField = _;
        return component;
    }

    component.labelField = function (_) {
        if (!arguments.length) return _labelField;
        _labelField = _;
        return component;
    }

    component.margin = function(_) {
        if (!arguments.length) return _margin;
        _margin = _;
        measure();
        return component;
    };

    component.width = function(_) {
        if (!arguments.length) return __width;
        __width = _;
        measure();
        return component;
    };

    component.height = function(_) {
        if (!arguments.length) return __height;
        __height = _;
        measure();
        return component;
    };

    component.delay = function(_) {
        if (!arguments.length) return _delay;
        _delay = _;
        return component;
    };

    component.keys = function(_) {
        if (!arguments.length) return _keys;
        _keys = _;
        return component;
    };

    component.placeHolder = function(_) {
        if (!arguments.length) return _placeHolder;
        _placeHolder = _;
        return component;
    };

    component.onSelected = function(_) {
        if (!arguments.length) return _selectedFunction;
        _selectedFunction = _;
        return component;
    };



    return component;

}

////////////////////////////////////////////////////////////////////////////////// 						~ END AUTOCOMPLETE FUNCTION SECTION ~				  //
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////// 							~ START CHART BUILDING ~						  //
////////////////////////////////////////////////////////////////////////////////

//Wrap all chart building code in a function which is invoked within the autocomplete function upon employee selection. The buildRadar function is invoked on line 82! 
function buildCharts(data) {	
	
// Fade then remove prior chartGroupRadar graphic so that there won't be overlapping charts.
//chartGroupRadar.selectAll('*')
//	.transition()
//	.duration(1000)
//	.style('opacity', 0)
//	.remove()
	
chartGroupRadar.selectAll('*').remove()	
chartGroupBar.selectAll('*').remove()

//Create an array of projects listed under the employee to determine the number and name of chart axes. 	
var projectCount = data.projects.length
var projectList = []; 
	for (i = 0; i < projectCount; i++){projectList.push(data.projects[i].projectName) ;} 
		//console.log(projectList);

//Create an array of charged hours using the same method as lines 20-24. Then convert the numbers from strings to numeric using the unary operator + 	
var chargedHours = [];
	for (i = 0; i < projectCount; i++)
	{chargedHours.push(+data.projects[i].chargedHours) ;}
		//console.log(chargedHours);
	
//Randomly impute an array of allotted hours from charged hours, for demonstration purposes. The data does not currently contain this info, which is why we are imputing here.
var randomArray = Array.from({length: projectCount}, () => Math.floor(Math.random() * 15) -10);
		//console.log(randomArray);

var allottedHours = [];
	for (i = 0; i < chargedHours.length; i++)
	{allottedHours.push(Math.abs(chargedHours[i] + randomArray[i])) ;}
		//console.log(allottedHours);

//Create a combines array of objects for both charged and allotted hours
var employeeHours = [];
	for (i = 0; i < projectCount; i++)
		{
		employeeHours.push({
			"charged":chargedHours[i],
			"allotted":allottedHours[i]
		});
	}

//Calculate the width of each slice of the chart in radians by dividing by the total number of segments	
var segmentAngle = Math.PI *2 / projectCount;
	console.log(segmentAngle);

//Append an axis group called axisGrid to the chartGroupRadar and give it a unique class called axisWrapper
var axisGrid = chartGroupRadar.append('g')
	.attr('class', 'axisWrapper');

//Find the max value to be displayed on the chart and save it to a variable. Then draw the background circles for the chart
if (d3.max(chargedHours) < d3.max(allottedHours)) {var backgroundMax = d3.max(allottedHours)}
	else {var backgroundMax = d3.max(chargedHours) };
		console.log(backgroundMax);

var chartRadius = 300;
var levels = 5
	
var radiusScale = d3.scaleLinear()
	.range([0, chartRadius])
	.domain([0, backgroundMax]);
	
axisGrid.selectAll('.levels')
	.data(d3.range(1,(levels+1)).reverse())
	.enter()
	.append('circle')
	.attr('class', 'gridCircle')
	.attr('r', function(d,i){ return (chartRadius/levels)*d; })
	.attr('fill', 'white')
	.attr('stroke', '#CDCDCD')
	.attr('fill-opacity', 0.1);

//Append text to mark the values of the levels	
axisGrid.selectAll('.axisLabel')
	.data(d3.range(1,(levels+1)).reverse())
	.enter()
	.append('text')
	.attr('class', 'axisLabel')
	.attr('x', 0)
	.attr('y', function(d){ return (-d*chartRadius)/levels; })
	.attr('dy', '0.9em')
	.attr('fill', '#white')
	.attr('font-size', '14px')
	.text(function(d,i){ return Math.round(backgroundMax * d/levels); });

//Create the lines for the different project axes	
var axes = 	axisGrid.selectAll('.axis')
	.data(projectList)
	.enter()
	.append('g')
	.attr('class','axis');

//Append the lines 
axes.append('line')
	.attr('x1', 0)
	.attr('y1', 0)
	.attr('x2', function(d,i){ return radiusScale(backgroundMax ) * Math.cos(segmentAngle * i - Math.PI/2);})
	.attr('y2', function(d,i){ return radiusScale(backgroundMax ) * Math.sin(segmentAngle * i - Math.PI/2);})
	.attr('class', 'line')
	.attr('stroke', '#CDCDCD')
	.attr('stroke-width', '1px');

//Append the axis labels and wraps them using a wrap function from http://bl.ocks.org/mbostock/7555321
function wrap(text, width) {
  text.each(function() {
	var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.4, // ems
		y = text.attr("y"),
		x = text.attr("x"),
		dy = parseFloat(text.attr("dy")),
		tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

	while (word = words.pop()) {
	  line.push(word);
	  tspan.text(line.join(" "));
	  if (tspan.node().getComputedTextLength() > width) {
		line.pop();
		tspan.text(line.join(" "));
		line = [word];
		tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	  }
	}
  });
}//wrap		
	
	
var labelShift = 1.25
var wrapWidth = 40 //The number of pixels after which the label will go on to a new line

axes.append('text')
	.attr('class','legend')
	.attr('font-size', '12px')
	.attr('text-anchor', 'middle')
	.attr('dy', '0.5em')
	.attr('x', function(d,i){ return radiusScale(backgroundMax * labelShift) * Math.cos(segmentAngle * i - Math.PI/2);})
	.attr('y', function(d,i){ return radiusScale(backgroundMax * labelShift) * Math.sin(segmentAngle * i - Math.PI/2);})
	.text(function(d){ return d;})
	.call(wrap, wrapWidth);

//Manually move chart onto the visible svg and center
chartGroupRadar.attr('transform', 'translate('+ width/2 +','+ height/2 +')');
	
//Create the line generator to draw the areas. Curve interpolation method of CatmullRomClosed is used to create areas without any "peninsulas"
chartGroupRadar.selectAll('.path')
	.data(employeeHours)
	.enter()
	.append('path')
	.attr('class','path')
	.attr('x', function(d,i){ return radiusScale(d['charged']) * Math.cos(segmentAngle * i - Math.PI/2); })
	.attr('y', function(d,i){ return radiusScale(d['charged']) * Math.sin(segmentAngle * i - Math.PI/2); })
	.attr('fill', '#CC333F')

var allottedLines = d3.line()
	.x(function(d,i){ return radiusScale(d['allotted']) * Math.cos(segmentAngle 	* i - Math.PI/2); })
	.y(function(d,i){ return radiusScale(d['allotted']) * Math.sin(segmentAngle 	* i - Math.PI/2); })
	.curve(d3.curveCatmullRomClosed);
	
var chargedLines = d3.line()
	.x(function(d,i){ return radiusScale(d['charged']) * Math.cos(segmentAngle * 	i - Math.PI/2); })
	.y(function(d,i){ return radiusScale(d['charged']) * Math.sin(segmentAngle * 	i - Math.PI/2); })
	.curve(d3.curveCatmullRomClosed);
	
chartGroupRadar.append('path')
	.data(employeeHours)
	.attr('class','path allotted')
	.attr('d', allottedLines(employeeHours))
	.attr('fill', '#CC333F')
	.attr('stroke', '#CC333F')
	.attr('stroke-width', '2px')
	.attr('fill-opacity','0.35')
	.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll("path")
				.transition().duration(200)
				.style('fill-opacity', 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style('fill-opacity', 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll('path')
				.transition().duration(200)
				.style('fill-opacity', 0.35); });

chartGroupRadar.append('path')
	.data(employeeHours)
	.attr('class','path charged')
	.attr('d', chargedLines(employeeHours))
	.attr('fill', '#00A0B0')
	.attr('stroke', '#00A0B0')
	.attr('stroke-width', '2px')
	.attr('fill-opacity','0.35')
	.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll("path")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll("path")
				.transition().duration(200)
				.style("fill-opacity", 0.35); });

//Create a wrapper for upcoming data points; this will allow all points to me manipulated/styled together and allow us to append our path
var pointWrapper = chartGroupRadar.selectAll('.pointWrapper')
	.data(employeeHours)
	.enter()
	.append('g')
	.attr('class', 'pointWrapper');

//Define a tooltip to show the value of the data points on hover
var tooltip = chartGroupRadar.append('text')
	.attr('class', 'tooltip')
	.attr('opacity', 0);
	
//Generated and place our data points, as well as the associated tool tip to show the point value on mouseover
pointWrapper.selectAll('.chargedPoints')
	.data(employeeHours)
	.enter()
	.append('circle')
	.attr('class','chargedPoints')
	.attr('r', '5px')
	.attr('cx', function(d,i){ return radiusScale(d['charged']) * Math.cos(segmentAngle * i - Math.PI/2); })
	.attr('cy', function(d,i){ return radiusScale(d['charged']) * Math.sin(segmentAngle * i - Math.PI/2); })
	.attr('fill', '#00A0B0')
	.attr('fill-opacity', 0.8)
	.on("mouseover", function(d,i) {
		newX =  parseFloat(d3.select(this).attr('cx')) - 10;
		newY =  parseFloat(d3.select(this).attr('cy')) - 10;
	
		tooltip.transition()
			.duration(200)
			.style('opacity', 0.9);
		tooltip.html('Charged:' + d['charged'])	
			.attr("x", newX)		
			.attr("y", newY);
            })
	.on("mouseout", function(d) {		
		tooltip.transition()		
			.duration(500)		
			.style("opacity", 0);});
	
pointWrapper.selectAll('.allottedPoints')
	.data(employeeHours)
	.enter()
	.append('circle')
	.attr('class','allottedPoints')
	.attr('r', '5px')
	.attr('cx', function(d,i){ return radiusScale(d['allotted']) * Math.cos(segmentAngle * i - Math.PI/2); })
	.attr('cy', function(d,i){ return radiusScale(d['allotted']) * Math.sin(segmentAngle * i - Math.PI/2); })
	.attr('fill', '#CC333F')
	.attr('fill-opacity', 0.8)
	.on("mouseover", function(d,i) {
		newX =  parseFloat(d3.select(this).attr('cx')) - 10;
		newY =  parseFloat(d3.select(this).attr('cy')) - 10;
	
		tooltip.transition()
			.duration(200)
			.style('opacity', 0.9);
		tooltip.html('Allotted:' + d['allotted'])	
			.attr("x", newX)		
			.attr("y", newY);
            })
	.on("mouseout", function(d) {		
		tooltip.transition()		
			.duration(500)		
			.style("opacity", 0);});	
	
//Invoke build legend function
	buildRadLegend();
	
/////////////////////////Begin building the bar chart///////////////////////////

//Consolidate projectList and employeeHours into a single data set

employeeBarData = [];
for (i = 0; i < projectCount; i++)
	{employeeBarData.push({
			"Charged Hours":chargedHours[i],
			"Allotted Hours":allottedHours[i],
			"project": projectList[i]
	});
	}

console.log(employeeBarData);

//Create x and y scales to generate the axes. The x0 function will create the 'big groups' of projects, while the x1 will create the subgroups showing charged and allotted hours within each project. The color scale will assign the same colors used in the radar chart to the charged and allotted bars
var x0 = d3.scaleBand()
	.rangeRound([0, width - margin.right])
	.paddingInner(0.3);
	
var x1 = d3.scaleBand()
	.padding(0.05);

var y = d3.scaleLinear()
	.rangeRound([height/2,0]);
	
var color = d3.scaleOrdinal()
	.range(['#00A0B0','#CC333F'])

//Extract the key names from employeeBarData 
var groupNames = d3.keys(employeeBarData[0]);
	
//Filter out the 'project' key so it doesn't show up in the clusters
groupNames = d3.keys(employeeBarData[0]).filter(function(key){return key!=="project"; })

//Append an array called 'groups' to each object within employeeBarData. These arrays contain two objects, one for the Charged Hours and its value, and one for Allotted Hours and its value
//employeeBarData.forEach(function(d){ d.groups = groupNames.map(function(groupName){ return {groupName: groupName, value: +d[groupName]};
//}); });

//Set and return the domain of the x0Scale function
x0.domain(employeeBarData.map(function(d){ return d.project;}));
//	console.log(x0.domain());
//	console.log(x0.range());

//Set and return the domain x1Scale function
x1.domain(groupNames).rangeRound([0,x0.bandwidth()]);

//Set and return domain of the yScale function
y.domain([0, d3.max(employeeBarData, function(d) { return d3.max(groupNames, function(key) { return d[key]; }); })]).nice();

//Append the groups that will house the data bars. One group is appended for each project in the data. This must come before the axis building so that an enter selection can be used to dynamically populate the groups.
chartGroupBar.append('g')
	.selectAll('g')
		.data(employeeBarData)
		.enter().append('g')
			.attr('transform', function(d){ return 'translate('+x0(d.project)+',0)'; })
	.selectAll('rect')
		.data(function(d) { return groupNames.map(function(key) { return {key: key, value: d[key]}; }); })
		.enter().append('rect')
			.attr('x', function(d){ return x1(d.key); })
			.attr('y', function(d){ return y(d.value); })
			.attr('width', x1.bandwidth())
			.attr('height', function(d){ return (height/2) - y(d.value); })
			.attr('fill', function(d){ return color(d.key); })
			.attr('class', 'bars')
			.style('opacity', 0.85);

//Append the axes using the above scales
chartGroupBar.append('g')
	.attr('class','axis axisX')
	.attr('transform', 'translate(0,' + (height/2) + ')')
	.call(d3.axisBottom(x0));
	
chartGroupBar.append('g')
	.attr('class', 'axis axisY')
	.call(d3.axisLeft(y).ticks(null, "s"))

//Invoke bar legend build function
buildBarLegend();



	

////////////////////////////////////////////////////////////////////////////////// 						   ~ START LEGEND BUILDING ~						  //
////////////////////////////////////////////////////////////////////////////////
	
function buildRadLegend() {
	
//Add a legend to our chart using the d3.legend function. I define a fabricated array with which to generate the legend mroe easily.
var legendData = ['Allotted Hours', 'Charged Hours'];	

var legend = chartGroupRadar.selectAll('.areaLegend')
	.data(legendData)
	.enter()
	.append('g')
	.attr('class','areaLegend');
	
legend.append('rect')
		.attr("rx", 6)
		.attr("ry", 6)
		.attr('x', 0)
		.attr('y', function(d,i) {return (i*40); })
		.attr('class', function(d,i) {return 'rect' + i;})
		.attr('width', '120px')
		.attr('height', '30px')
		.attr('fill', 'none')
		.attr('fill-opacity', '0.35')
		.attr('stroke', 'none')
		.attr('transform','translate(-400,-400)');
		
chartGroupRadar.selectAll('legendText')
	.data(legendData)
	.enter()
	.append('text')
		.attr('class', function(d,i){return 'legText'+ i;})
		.attr("x", 10)
		.attr("y", function(d, i) { return (i*40) ; })
		.text(function(d,i) {return d;})
		.attr('font-size', '14')
		.attr('fill', 'white')
		.attr('transform','translate(-400,-380)');

//Style the various legend components using their specific class names and attach interactive features
	d3.selectAll('.rect0')
		.attr('fill','#CC333F')
		.attr('stroke','#CC333F')
		.attr('stroke-width','1')
				.on('mouseover', function(){
			//Dim all blobs and legend rectangles
			d3.selectAll('path')
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7)
			d3.select('.allotted')
					.transition().duration(200)
					.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll('path, rect')
				.transition().duration(200)
				.style("fill-opacity", 0.35)
			d3.selectAll('rect').selectAll('.bars')
				.style('fill-opacity',0.85); })
	;

	d3.selectAll('.legText0')
				.on('mouseover', function(){
			//Dim all blobs and legend rectangles
			d3.selectAll('path')
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select('.rect0')
				.transition().duration(200)
				.style("fill-opacity", 0.7)
			d3.select('.allotted')
					.transition().duration(200)
					.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll('path, rect')
				.transition().duration(200)
				.style("fill-opacity", 0.35); })
	;	
	
	d3.selectAll('.rect1')
	.attr('fill','#00A0B0')
		.attr('stroke','#00A0B0')
		.attr('stroke-width','1')
				.on('mouseover', function(){
			//Dim all blobs and legend rectangles
			d3.selectAll('path')
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7)
			d3.select('.charged')
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll('path, rect')
				.transition().duration(200)
				.style("fill-opacity", 0.35) 
//			d3.selectAll('.bars')
//				.style("fill-opacity", 0.85)
				; });
	
	d3.selectAll('.legText1')
			.on('mouseover', function(){
		//Dim all blobs and legend rectangles
		d3.selectAll('path')
			.transition().duration(200)
			.style("fill-opacity", 0.1); 
		//Bring back the hovered over blob
		d3.select('.rect1')
			.transition().duration(200)
			.style("fill-opacity", 0.7)
		d3.select('.charged')
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
	})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll('path, rect')
				.transition().duration(200)
				.style("fill-opacity", 0.35)
//				d3.selectAll('.bars')
//				.style("fill-opacity", 0.85)
				; });	
	
	
};

//Build legeng for the bar chart
function buildBarLegend() {

var legend = chartGroupBar.append('g')
	.attr('font-size',10)
	.attr('text-anchor', 'end')
	.selectAll('g')
		.data(groupNames.slice().reverse())
		.enter().append('g')
			.attr('transform', function(d,i){ return 'translate(0,'+ i * 20 +')'; });
			
legend.append('rect')
	.attr('x', width - 100)
	.attr('width', 18)
	.attr('height', 18)
	.attr('fill', color);
	
legend.append('text')
	.attr('x',width - 110)
	.attr('y', 10)
	.attr('dy', '0.32em')
	.text(function(d){return d;});

};
////////////////////////////////////////////////////////////////////////////////// 						   ~ END LEGEND BUILDING ~						      //
////////////////////////////////////////////////////////////////////////////////

} // buildCHARTS function close

////////////////////////////////////////////////////////////////////////////////// 							~ END CHART BUILDING ~							  //
////////////////////////////////////////////////////////////////////////////////

}); //Filter function section closing

	$('#toggleChart').click(function() {
		$('.chartGroupRadar').fadeToggle();
		$('.chartGroupBar').fadeToggle();
	});


	
	
	
	
	
	
	
	
	
	
	
	
	
	