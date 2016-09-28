<?php

function test($lat, $long, $niceName){

include('Forecast/Forecast.php');
$api_key = 'ef9f041b200ed14aa26171a2a4ff0038';
$google_api_key='AIzaSyDZoh4yZUjJFqVPlPBahd81lzOAooQRk8s';


$units = 'us';  // Can be set to 'us', 'si', 'ca', 'uk' or 'auto' (see forecast.io API); default is auto
$lang = 'en'; // Can be set to 'en', 'de', 'pl', 'es', 'fr', 'it', 'tet' or 'x-pig-latin' (see forecast.io API); default is 'en'
date_default_timezone_set('America/New_York');
$today = date('F j, Y');
$data = [];

$forecast = new ForecastIO($api_key, $units, $lang);

//grap location
if( ($niceName == '' || $niceName == 'undefined')  ){
	$request_url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='.$lat.','.$long.'&key='.$google_api_key;

	$location = file_get_contents($request_url);
	$json_output = json_decode($location);

	$niceName = str_replace(', USA', '', $json_output->results[0]->formatted_address);
}
/*

*/
	//get current conditions
	$condition = $forecast->getCurrentConditions($lat, $long);
	$hourly = $forecast->getForecastToday($lat, $long);
	$data['right_now'] = array(
		'locationName' => $niceName,
		//'state' => $state,
		'tempNow' => round($condition->getTemperature()),
		'tempNowSummary' => $condition->getSummary(),
    'tempNowIcon' => $condition->getIcon(),
    //'hourlyForecast' => $hourly
   );
	foreach($hourly as $hour) {
		$timeKey = $hour->getTime();
		$data['right_now']['hourly'][$timeKey] = array(
			'niceTime' => $hour->getTime('ga'),
   		'hourlyForecast' => round($hour->getTemperature()),
  	);
	}

	//get 5 day forecast
	$conditions_week = $forecast->getForecastWeek($lat, $long);
	$counter = 1;
	foreach($conditions_week as $conditions) {
		if($conditions->getTime('F j, Y') == $today){
			$data['today'] = array(
				'max' => round($conditions->getMaxTemperature()),
				'min' => round($conditions->getMinTemperature()),
				'summary' => $conditions->getSummary()
				);
		}
		if($conditions->getTime('F j, Y') != $today && $counter <= 5){
			$data['this_week'][$counter] = array(
				'max' => round($conditions->getMaxTemperature()),
				'min' => round($conditions->getMinTemperature()),
				'icon' => $conditions->getIcon(),
				'day' => $conditions->getTime('l'),
				'summary' => $conditions->getSummary()
				);
	    $counter++;
	  }
	  if($counter == 6){
			$data['extra_day'] = array(
				'max' => round($conditions->getMaxTemperature()),
				'min' => round($conditions->getMinTemperature()),
				);
			$counter++;
		}
	}
	
	$data = json_encode($data);

	return $data;
	//return $location;
}
//echo 'test';
//echo 'lat: '.$_POST['lat'].'long: '.$_POST['long'];
echo test($_POST['lat'],$_POST['long'], $_POST['location']);