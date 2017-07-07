				//////////////////// START SVG SETUP /////////////////////////

var width = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
var height = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;	

var svg = d3.select('body').append('svg')
  .attr('height', height)
  .attr('width', width);

var margin = {left: 50, right: 50, top: 50, bottom: 0};

var chartGroupBurn = svg.append('g')
	.attr('tranform', 'translate('+margin.left+','+margin.top+')')
	.attr('class', 'chartGroupBurn');

				//////////////////// END SVG SETUP ///////////////////////

				//////////////////// START DATA IMPORT ///////////////////

//Pull in etc csv file that Kyle prepared
var rawData = d3.csv("/BurndownChart/burnPlanned.csv").get(function(error,data){
//console.log(data);

					///////// START NESTING DATA ////////////

//Here we will nest the data using d3.nest functionality so that we can use rollup functions to sum planned and charged hours by task name and month.
var nestedData = d3.nest()
  .key(function(d){ return d.TaskName;})
  .key(function(d){ return d.variable;})
  .rollup(function(v) { 
    return {planned: d3.sum(v, function(d){ return d.planned ;}),
		    charged: d3.sum(v, function(d){ return d.charged ;})}
	})
  .entries(data);
    console.log(nestedData);

//Return default dropdown menue value
 var defaultTask = d3.select('select').property('value')
  
//Store # of records in the raw data
var rawRecordCount = data.length;
console.log('rawRecordCount: '+rawRecordCount);

//Create a list of task *names* from the raw data, to be used to populate the autocomplete function
var taskList = [];
  for (i = 0; i < rawRecordCount; i++)
    {taskList.push(data[i].TaskName);}
	
//Remove duplicate entries from the taskList array
taskList = taskList.filter( function( item, index, inputArray ) 
  { return inputArray.indexOf(item) == index;});

taskList = taskList.sort()
  console.log('taskList: '+taskList);

//Populate dropdown and create callback to reference selection
var select = d3.select('#dropdown')
    .attr('class','select')
	.on('change',onChange)

var options = select
  .selectAll('option')
  .data(taskList)
  .enter()
  .append('option')
    .text(function(d){ return d; });

updateGraph(defaultTask);

//Define the onChange function to feed the graph drawing function the right data upon dropdown selection
function onChange() {

var changeTask = d3.select('select').property('value')
  
  //Remove all elements on the svg so that each selection re-draws the chart for the new task
  chartGroupBurn.selectAll('*').remove();
  
//Call drawing function to make graph 
  updateGraph(changeTask);
}; //END onChange() CALLBACK, LINE 52

function updateGraph(data){
  
var selectedTask = d3.select('select').property('value')

//Pull the object that contains the data for the project that was selected
var selTaskData = [];
  for( i = 0; i < taskList.length; i++){
    if (nestedData[i].key === selectedTask) {
	  selTaskData.push(nestedData[i])
	}
  };
      console.log(selTaskData);

//Store the length of the months value and extract the months into a list to populate the x axis scale 
var selTaskLength = selTaskData[0].values.length;
  console.log(selTaskLength);
	
//Use the above length to extract all of the months into an array of dates for the selected task, which will be an array of strings of the YYYY-MM for which a task has planned and charged values
var selTaskDates = [];
  for(i = 0; i < selTaskLength; i++){
    selTaskDates.push(selTaskData[0].values[i].key)
};
  console.log(selTaskDates);

//Parse the dates using the timeParse function in D3 to change them from strings to actual dates. This is needed to take advantage of the scaleTime() function which will be used later to make the scale for the x-axis 
var dateParse = d3.timeParse("%Y-%m");

var newDates = [];
for( i = 0; i < selTaskDates.length; i++){
  newDates.push(dateParse(selTaskDates[i])); 
};
  console.log(newDates);
  
//Create two smaller arrays of objects for charged and planned data to be referenced when drawing the two separate lines. This includes a date-parsing function to convert date strings to actual date values

var plannedData = [];
  for(i = 0; i < selTaskLength; i++){
    plannedData.push({"planned": selTaskData[0].values[i].value.planned,
	"date": newDates[i]})
};  
  console.log(plannedData);
var chargedData = []; 
  for(i = 0; i < selTaskLength; i++){
    chargedData.push({"charged": selTaskData[0].values[i].value.charged,
	"date": newDates[i]})
};  
  console.log(chargedData);

//Next we need to find the maximum of the selected task hours to define the y-scale of our chart
var selChargedHours = [];
  for(i = 0; i < selTaskLength; i++){
    selChargedHours.push(selTaskData[0].values[i].value.charged)
};  
  console.log(selChargedHours);

var selPlannedHours = [];
  for(i = 0; i < selTaskLength; i++){
    selPlannedHours.push(selTaskData[0].values[i].value.planned)
};  
  console.log(selPlannedHours);

var allHours = selChargedHours.concat(selPlannedHours);

var maxHours = d3.max(allHours);
var minHours = d3.min(allHours);
  console.log(maxHours, minHours);
  
    					///////// START CONFIDENCE CALC/////////////
						
 //Create a copy of the plannedData dataset but omit entries with dates < today's date. Return today's date, the date the user is viewing the page, using the native javascript new Date() function. This dataset will be used to generate only the area for today's date going forward
var today = new Date();
  
confidenceData = [];
for( i = 0; i < selTaskLength; i++){
    if (plannedData[i].date >= today) {
	  confidenceData.push(plannedData[i]);
	}
  };
    console.log(confidenceData);

//Calculate the sample total, which is the sum of planned hours within the confidenceData dataset
var sampleTotal = d3.nest()
  .rollup(function(v){ return d3.sum(v, function(d){ return d.planned ;})
	})
  .entries(confidenceData);

//Calculate the standard error
var sampleMean = sampleTotal/confidenceData.length
  console.log(sampleMean);

//Calculate the deviations and square them
deviations = [];
for( i = 0; i < confidenceData.length; i++){
  deviations.push(Math.pow(confidenceData[i].planned - sampleMean,2));
}
  console.log(deviations)

//Sum the above deviations, divide by n-1, and square root the result
var standardDev = Math.sqrt(d3.sum(deviations)/(confidenceData.length - 1));
  console.log(standardDev);

//Divide by root of sample size
var standardError =  standardDev/Math.sqrt(confidenceData.length)
  console.log(standardError);

//Calculate the confidence interval width, using a 95% confidence level (Z=1.96)
var confIntWidth = 1.96 * standardError;
 console.log(confIntWidth); 
 
  					///////// END CONFIDENCE CALC ///////////
  
  					/////////// END NESTING DATA ////////////

					/////////// START SCALES ////////////////
					
//Define our x and y scales and their respective domains/ranges
var xScale = d3.scaleTime()
  .rangeRound([0+margin.left,width - (margin.right*2)])
  .domain(d3.extent(newDates));

var yScale = d3.scaleLinear()
  .domain([0,maxHours * 1.5]) //Multiplier here is to make sure confidence interval doesn't exceed the y scale 
  .rangeRound([height/2,0]);	
	
					////////////// END SCALES //////////////

					///////// START LINE GENERATORS ////////
//Define our line generators for both the planned and charged lines
var plannedLineGen = d3.line()
  .x(function(d){ return xScale(d.date);}) //Date grouping level
  .y(function(d){ return yScale(d.planned); });

var chargedLineGen = d3.line()
  .x(function(d){ return xScale(d.date);}) //Date grouping level
  .y(function(d){ return yScale(d.charged); });

					///////// END LINE GENERATORS //////////

					///////// START AXIS APPENDING //////////
//Append both our axes to our chartGroupBurn group using our x and y scales defined above
chartGroupBurn.append('g')
  .attr('transform', 'translate(0,'+ height/2 +')')
  .attr('class','xAxis')
  .call(d3.axisBottom(xScale)
    .ticks(newDates.length));
 
chartGroupBurn.append('g')
  .call(d3.axisLeft(yScale))
  	.attr('transform','translate(0'+margin.left+',0)')
  .append('text')
    .attr('fill', '#000')
	.attr('transform','rotate(-90)')
	.attr('y',6)
	.attr('dy','0.7em')
	.attr('text-anchor','middle')
	.text('Hours');

//Move the whole chart down a bit to prevent overlap with the selection box
chartGroupBurn.attr('transform','translate(0,30)')					
					
					///////// END AXIS APPENDING ////////
					
					///////// START LINE DRAW ///////////
//Planned line and label				
chartGroupBurn.append('path')
  .datum(plannedData)
  .attr('class','plannedLine')
  .attr('fill','none')
  .attr('stroke','steelblue')
  .attr('stroke-linejoin', 'round')
  .attr('stroke-linecap', 'round')
  .attr('stroke-width',1.5)
  .style('stroke-dasharray', ('4,4'))
  .attr('d', plannedLineGen);

//Return the width of the bounding box for the line path to determine the x position of the label
var translateWidthPlanned = document.getElementsByClassName("plannedLine")[0].getBBox().width;

chartGroupBurn.append("text")
  .attr("transform", "translate("+(translateWidthPlanned + 60) + "," + yScale(plannedData[(selTaskLength-1)].planned)+ ")")
  .attr("text-anchor", "start")
  .attr('font-size', '10pt')
  .style("fill", "steelblue")
  .text("Planned Hours")
	
//Charged line and label				
chartGroupBurn.append('path')
  .datum(chargedData)
  .attr('class','chargedLine')
  .attr('fill','none')
  .attr('stroke','green')
  .attr('stroke-linejoin', 'round')
  .attr('stroke-linecap', 'round')
  .attr('stroke-width',1.5)
  .attr('d', chargedLineGen);
				
var translateWidthCharged = document.getElementsByClassName("plannedLine")[0].getBBox().width;

chartGroupBurn.append("text")
  .attr("transform", "translate("+(translateWidthCharged + 60) + "," + yScale(chargedData[(selTaskLength-1)].charged)+ ")")
  .attr("text-anchor", "start")
  .attr('font-size', '10pt')
  .style("fill", "green")
  .text("Charged Hours")
  
					////////// END LINE DRAW ////////////
					
					/////// START CONFIDENCE DRAW //////

//Define an area generator to create our confidence interval for planned hours
var confidenceArea = d3.area()
  .x(function(d) { return xScale(d.date); })
  .y0(function(d){ return yScale(d.planned - confIntWidth); })
  .y1(function(d){ return yScale(d.planned + confIntWidth); })
  
//Draw the confidence interval area
chartGroupBurn.append('path')
  .datum(confidenceData)
  .attr('class','confInterval')
  .attr('d', confidenceArea)
  .attr('fill','lightsteelblue')
  .attr('opacity', '0.7');
  
					/////// END CONFIDENCE DRAW ///////
}; //END updateGraph function

}); //END DATA 
					///////// END DATA IMPORT //////////
