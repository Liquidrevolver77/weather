//jQuery.noConflict();
//no longer used

jQuery(function($) {

getLocation();

var x = document.getElementById("main");
var success;
var latitude;
var longitude;

var points = [];
var width;
var height;
var middle = 270;
var height = 300;
var tempMultiplier = 2;
var tempIndex = 0;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError, {maximumAge:600000,timeout:7000});
        success = 1;
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
        success = 0;
    }
}

function showPosition(position) {

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    //console.log('hit');
    ajaxify();
    
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
    success = 1;
}


function ajaxify(){
	if(success){
		$.ajax({
	      url: "getWeather.php",
	      type: "POST",
	      data: {lat: latitude, long: longitude},
	      success: function(response){
	         //alert(response);
	         var parsedData = JSON.parse(response);
	         inputData(parsedData);
	         console.log(parsedData);
	      }
	   });
	}else{

	}
}

function inputData(parsedData){
	//set up right now
	$('#todayWrapper .city').text(parsedData.right_now.city);
	$('#todayWrapper .state').text(parsedData.right_now.state);
	$('#todayWrapper .tempNow').text(parsedData.right_now.tempNow)+'°';
	$('#todayWrapper .iconNow').append('<span class="weatherIcon icon-'+parsedData.right_now.tempNowIcon+'"></span>');
	$('#todayWrapper .todaySummary').text(parsedData.right_now.tempNowSummary);
	console.log(parsedData.right_now.hourlyForecast);

	//add today and extra day max and min used for svg line
	$('.weekly .day.today').attr('data-high',parsedData.today.max);
	$('.weekly .day.today').attr('data-low',parsedData.today.min);
	$('.weekly .day.extraday').attr('data-high',parsedData.extra_day.max);
	$('.weekly .day.extraday').attr('data-low',parsedData.extra_day.min);

	//use bracket notation instead of dot so a variable can be used to access data
	$('.weekly .day:not(.hidden)').each( function( _i ) {
  	$(this).attr('data-high',parsedData['this_week'][+_i+1]['max']);
  	$(this).attr('data-low',parsedData['this_week'][+_i+1]['min']);
  	$(this).prepend('<span class="icon-'+parsedData['this_week'][+_i+1]['icon']+'"></span>');
  	$(this).find('.dayOfWeek').text(parsedData['this_week'][+_i+1]['day']);
  	$(this).find('.max').text('Max: '+parsedData['this_week'][+_i+1]['max']+'°');
  	$(this).find('.min').text('Min: '+parsedData['this_week'][+_i+1]['min']+'°');
	});
	setWidth();
	//create point array
	createPoints();
	//create svg and path
	createLine(0,points.slice(2, points.length-2));
	//add temps to line
	drawTemps(points.slice(4, points.length-2));
}



}); //jQuery(function($)