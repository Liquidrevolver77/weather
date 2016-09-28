//jQuery.noConflict();

jQuery(function($) {


var points = [];
var width;
var height;
//var c;
//var ctx;
var middle = 270;
var height = 300;
var tempMultiplier = 2;
var tempIndex = 0;

var success;
var latitude;
var longitude;
var init = false;

var google_api_key='AIzaSyDZoh4yZUjJFqVPlPBahd81lzOAooQRk8s';

//$(document).ready(function() {
	//resize to current window
	getLocation();
	//setWidth();
	//create point array
	//createPoints();
	//create svg and path
	//createLine(0,points.slice(2, points.length-2));
	//add temps to line
	//drawTemps(points.slice(4, points.length-2));

//}); //end document.ready

window.addEventListener("resize", function() {
	setWidth();
	if(width>=1000 && init){
		createPoints();
		createLine(1,points.slice(2, points.length-2));
		redrawTemps(points.slice(4, points.length-2));
	}
}); //end window.resize


function Point(x, y) {
  this.x = x;
  this.y = y;
}

function drawTemps(pts){
   for (i = 0; i < pts.length - 2; i+=2){
      addTemp(pts[i],pts[i+1]);
   }
}

function redrawTemps(pts){
	tempIndex = 0;

   for (i = 0; i < pts.length - 2; i+=2){
      updateTemp(pts[i],pts[i+1]);
      //console.log(pts[i]);
   }
}

function createPoints(){
	points = [];
	$('.day').each( function( index ) {
  	var high = middle - $(this).data('high') * tempMultiplier;
  	var low = middle - $(this).data('low') * tempMultiplier;
  	//var high = $(this).data('high');
  	//var low = $(this).data('low');
  	var xpointlow = Math.round((index-0.75) * (width/5));
  	var xpointhigh = Math.round((index-0.25) * (width/5));

  	//points.push(new Point(xpointlow,high));
  	//points.push(new Point(xpointhigh,low));
  	points.push(xpointlow, high);
  	points.push(xpointhigh, low);
  	//console.log('high: '+$(this).data('high')+' low: '+$(this).data('low'));
	});
}

function addTemp(x,y){
	//for svg
	var svgNS = "http://www.w3.org/2000/svg";
	var newText = document.createElementNS(svgNS,"text");
	newText.setAttributeNS(null,"font-size","30");
	newText.setAttributeNS(null,"id","temp"+tempIndex);
	newText.setAttributeNS(null,"font-family","Arial");
	tempIndex++;

	//ctx.font = "30px Arial";
	//get real temp
	var realTemp = (middle-y)/tempMultiplier;
	//center it
	if(realTemp >=100){
		var moveLeft = 30;
	}else{
		var moveLeft = 15;
	}
	newText.setAttributeNS(null,"x",x - moveLeft);
	//position temp
	if(realTemp > 140){
		newText.setAttributeNS(null,"y",0); 
	}else if( realTemp > 115){
		newText.setAttributeNS(null,"y",y+40); 
	}else if(realTemp < -20){
		newText.setAttributeNS(null,"y",290);
	}else{
		newText.setAttributeNS(null,"y",y-15); 
	}
	var textNode = document.createTextNode(realTemp+'°');
	newText.appendChild(textNode);
	document.getElementById("mySVG").appendChild(newText);

}

function updateTemp(x,y){
	var currTemp = document.getElementById("temp"+tempIndex);
	//currTemp.textContent = "new Value";
	var realTemp = (middle-y)/tempMultiplier;
	currTemp.textContent = realTemp+'°';
	tempIndex++;
	if(realTemp >=100){
		var moveLeft = 30;
	}else{
		var moveLeft = 15;
	}
	currTemp.setAttributeNS(null,"x",x - moveLeft);
	//position temp
	if(realTemp > 140){
		currTemp.setAttributeNS(null,"y",0); 
	}else if( realTemp > 115){
		currTemp.setAttributeNS(null,"y",y+40); 
	}else if(realTemp < -20){
		currTemp.setAttributeNS(null,"y",290);
	}else{
		currTemp.setAttributeNS(null,"y",y-15); 
	}

}


function setWidth() {
	width = window.innerWidth;
}

//from weather.js
function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError, {maximumAge:600000,timeout:7000});
      success = 1;
  } else {
      console.log("Geolocation is not supported by this browser.");;
      success = 0;
  }
}

function showPosition(position, falsified) {
	if(falsified){
		latitude = position.latitude;
  	longitude = position.longitude;
	}else{
  	latitude = position.coords.latitude;
  	longitude = position.coords.longitude;
  	//console.log('hit');
	}
  ajaxify(latitude, longitude);

}

function showError(error) {
	console.log(error);
  switch(error.code) {
      case error.PERMISSION_DENIED:
          console.log("User denied the request for Geolocation.");
          var position=[];
          position.latitude=42.7821814;
          position.longitude=-71.499945;
          showPosition(position, 1);
          break;
      case error.POSITION_UNAVAILABLE:
          console.log("Location information is unavailable.");
          break;
      case error.TIMEOUT:
          console.log("The request to get user location timed out.");
          break;
      case error.UNKNOWN_ERROR:
          console.log("An unknown error occurred.");
          break;
  }
  success = 1;
}


function ajaxify(lat, long){
	if(success){
		$.ajax({
	      url: "getWeather.php",
	      type: "POST",
	      data: {lat: lat, long: long},
	      success: function(response){
	        var parsedData = JSON.parse(response);
	        inputData(parsedData);
	        //console.log(parsedData);
	        $('#location').val('');
    			$('#location').blur();
    			$('.sk-cube-grid').hide();
	      }
	   });
	}else{

	}
}

//click function
$( "#locationSubmit" ).submit(function( e ) {
  e.preventDefault();
  console.log('submitted');
  var inputVal = $('#location').val();
  inputValSAfe = inputVal.replace(/ /g,"+");
  $.get('https://maps.googleapis.com/maps/api/geocode/json?address='+inputValSAfe+'&key='+google_api_key, function(data) {
    //console.log(data['results'][0]['geometry']['location']);
    newLat = data['results'][0]['geometry']['location']['lat'];
    newLong = data['results'][0]['geometry']['location']['lng'];
    //console.log('lat: '+newLat + 'long: '+newLong);
    ajaxify(newLat, newLong);
    $('.sk-cube-grid').show();
	});
	//reset input
	
});

$(document).ready(function(){
	$( ".toggleHourly" ).click(function( e ) {
	  e.preventDefault();
	  $('.hourlyWrapper').slideToggle();
	});
})

function normalizeTemps(hourly) {
	var hourlyHTML='';
	for (var key in hourly) {
		if (hourly.hasOwnProperty(key)) {
			var obj = hourly[key];
			//console.log(obj);
			hourlyHTML+='<div class="hourly__item">'+obj.niceTime+' <br> '+obj.hourlyForecast+'</div>';
		}
	}
	//console
	return hourlyHTML;
}



function inputData(parsedData){
	//set up right now
	$('#todayWrapper .city').text(parsedData.right_now.city);
	$('#todayWrapper .state').text(parsedData.right_now.state);
	$('#todayWrapper .tempNow').text(parsedData.right_now.tempNow+'°');
	$('#todayWrapper .iconNow span').remove();
	$('#todayWrapper .iconNow').append('<span class="weatherIcon icon-'+parsedData.right_now.tempNowIcon+'"></span>');
	$('#todayWrapper .todaySummary').text(parsedData.right_now.tempNowSummary);
	$('#todayWrapper .laterToday').text('Later Today: '+parsedData.today.summary);
	$('.hourly').html( normalizeTemps(parsedData.right_now.hourly) );

	//add today and extra day max and min used for svg line
	$('.weekly .day.today').data('high',parsedData.today.max);
	$('.weekly .day.today').data('low',parsedData.today.min);
	$('.weekly .day.extraday').data('high',parsedData.extra_day.max);
	$('.weekly .day.extraday').data('low',parsedData.extra_day.min);

	//use bracket notation instead of dot so a variable can be used to access data
	$('.weekly .day:not(.hidden)').each( function( _i ) {
  	$(this).data('high',parsedData['this_week'][+_i+1]['max']);
  	$(this).data('low',parsedData['this_week'][+_i+1]['min']);
  	$(this).find('span[class^="icon-"]').remove();
  	$(this).prepend('<span class="icon-'+parsedData['this_week'][+_i+1]['icon']+'"></span>');
  	$(this).find('.dayOfWeek').text(parsedData['this_week'][+_i+1]['day']);
  	$(this).find('.max').text('Max: '+parsedData['this_week'][+_i+1]['max']+'°');
  	$(this).find('.min').text('Min: '+parsedData['this_week'][+_i+1]['min']+'°');
  	$(this).find('.summary').text(parsedData['this_week'][+_i+1]['summary']);
	});
	setWidth();
	//create point array
	createPoints();
	//console.log(points);
	//create svg and path
	if(init){
		createLine(1,points.slice(2, points.length-2));
		redrawTemps(points.slice(4, points.length-2));
	}else{
		createLine(0,points.slice(2, points.length-2));
		drawTemps(points.slice(4, points.length-2));
	}

	init = true;
}


}); //jQuery(function($)
