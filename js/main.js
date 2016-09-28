//set up a quick query selector
window.query = document.querySelectorAll.bind(document);

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this === null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception. 
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

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

//kick things off
getLocation();

//add submit handler once the dom is loaded
document.addEventListener("DOMContentLoaded", function(event) { 
 attachSubmitHandler();
});

//redraw the graph on resize if we're over 1000px
window.addEventListener("resize", function() {
	setWidth();
	if(width>=1000 && init){
		createPoints();
		createLine(1,points.slice(2, points.length-2));
		redrawTemps(points.slice(4, points.length-2));
	}
}); //end window.resize

//util fucntion to set x and y on an object
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

	var days = query('.day');
	//conver html colletion to array to use foreach
	var daysArr = [].slice.call(days);
	daysArr.forEach( function( item, index ) {
  	var high = middle - item.getAttribute('data-high') * tempMultiplier;
  	var low = middle - item.getAttribute('data-low') * tempMultiplier;

  	var xpointlow = Math.round((index-0.75) * (width/5));
  	var xpointhigh = Math.round((index-0.25) * (width/5));

  	points.push(xpointlow, high);
  	points.push(xpointhigh, low);
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
  ajaxify(latitude, longitude, '');

}

function showError(error) {
	//console.log(error);
  switch(error.code) {
      case error.PERMISSION_DENIED:
          console.log("User denied the request for Geolocation.");
          //var position=[];
          //position.latitude=42.7821814;
          //position.longitude=-71.499945;
          //showPosition(position, 1);
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


function ajaxify(lat, long, location){
	if(success){
		var r = new XMLHttpRequest();
		r.open("POST", "getWeather.php", true);
		r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		r.onreadystatechange = function () {
			if (r.readyState != 4 || r.status != 200) return; 
			var parsedData = JSON.parse(r.responseText);
	        inputData(parsedData);
	        //console.log(parsedData);
	        query('#location')[0].value='';
    			query('#location')[0].blur();
    			query('.sk-cube-grid')[0].style.display = 'none';
    			query('.weekly')[0].setAttribute('class', 'weekly');
    			attachSubmitHandler();
		};
		var requestParams = "lat="+lat+"&long="+long+"&location="+location;
		r.send(requestParams);

	}else{

	}
}

//form submit function
function attachSubmitHandler(){
	document.forms["locationSubmit"].onsubmit = function( e ) {
	  e.preventDefault();
	  //console.log('submitted');
	  var inputVal = query('#location')[0].value;
	  inputValSAfe = inputVal.replace(/ /g,"+");

	  var request = new XMLHttpRequest();
		request.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address='+inputValSAfe+'&key='+google_api_key, true);

		request.onreadystatechange = function() {
		  if (this.readyState === 4) {
		    if (this.status >= 200 && this.status < 400) {
		    	var data = JSON.parse(this.responseText);
		    	console.log();
		    	var city;
		    	var state;
		    	var addComps = data['results'][0]['address_components'];

		    	var niceName = data['results'][0]['formatted_address'].replace(', USA', '');

		      newLat = data['results'][0]['geometry']['location']['lat'];
			    newLong = data['results'][0]['geometry']['location']['lng'];
			    ajaxify(newLat, newLong, niceName);
			    query('.sk-cube-grid')[0].style.display = 'block';
			    query('.weekly')[0].setAttribute('class', 'weekly sendingAjax');
		    } else {
		      // Error :(
		    }
		  }
		};

		request.send();
		request = null;
	}
}

/*
$(document).ready(function(){
	$( ".toggleHourly" ).click(function( e ) {
	  e.preventDefault();
	  $('.hourlyWrapper').slideToggle();
	});
})
*/

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
	//query('#todayWrapper .city')[0].textContent = parsedData.right_now.city;
	//query('#todayWrapper .state')[0].textContent = parsedData.right_now.state;
	query('.locationName')[0].textContent = parsedData.right_now.locationName;
	query('#todayWrapper .tempNow')[0].textContent = parsedData.right_now.tempNow+'°';
	var spanToRemove = query('#todayWrapper .iconNow span');
	//console.log(typeof spanToRemove);
	//console.log(typeof spanToRemove.parentNode);
	if(spanToRemove.length){
  	spanToRemove[0].parentNode.removeChild(spanToRemove[0]);
	}

	var iconNow = query('#todayWrapper .iconNow');
	var weatherIcon = document.createElement("span");
	weatherIcon.setAttribute("class", "weatherIcon icon-"+parsedData.right_now.tempNowIcon);
	//console.log(iconNow);
	iconNow[0].appendChild(weatherIcon);
	query('#todayWrapper .todaySummary')[0].textContent = parsedData.right_now.tempNowSummary;
	query('#todayWrapper .laterToday')[0].textContent = 'Later Today: '+parsedData.today.summary;
	//query('.hourly').html( normalizeTemps(parsedData.right_now.hourly) );

	//add today and extra day max and min used for svg line
	query('.weekly .day.today')[0].setAttribute('data-high',parsedData.today.max);
	query('.weekly .day.today')[0].setAttribute('data-low',parsedData.today.min);
	query('.weekly .day.extraday')[0].setAttribute('data-high',parsedData.extra_day.max);
	query('.weekly .day.extraday')[0].setAttribute('data-low',parsedData.extra_day.min);

	//use bracket notation instead of dot so a variable can be used to access data
	var nonHiddenDays = query('.weekly .day:not(.hidden)');
	//conver html colletion to array to use foreach
	var nonHiddenDaysArr = [].slice.call(nonHiddenDays);
	nonHiddenDaysArr.forEach( function( item, _i ) {

  	item.setAttribute('data-high', parsedData['this_week'][+_i+1]['max'])
  	item.setAttribute('data-low', parsedData['this_week'][+_i+1]['min']);
  	var toRemove = item.querySelectorAll('span[class^="icon-"]');
  	if(toRemove.length){
  		toRemove[0].parentNode.removeChild(toRemove[0]);
  	}

  	var dayIcon = document.createElement("span");
		dayIcon.setAttribute("class", "icon-"+parsedData['this_week'][+_i+1]['icon'] );
  	item.insertBefore(dayIcon, item.firstChild);
  	
  	item.querySelector('.dayOfWeek').textContent = parsedData['this_week'][+_i+1]['day'];
  	item.querySelector('.max').textContent = 'Max: '+parsedData['this_week'][+_i+1]['max']+'°';
  	item.querySelector('.min').textContent = 'Min: '+parsedData['this_week'][+_i+1]['min']+'°';
  	item.querySelector('.summary').textContent = parsedData['this_week'][+_i+1]['summary'];
	});
	setWidth();
	//create point array
	createPoints();
	//create svg and path
	if(init){
		createLine(1,points.slice(2, points.length-2));
		redrawTemps(points.slice(4, points.length-2));
	}else{
		createLine(0,points.slice(2, points.length-2));
		drawTemps(points.slice(4, points.length-2));
	}
}