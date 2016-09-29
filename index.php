<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Weather App</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="css/main.css" rel="stylesheet" type="text/css">
		<!--<style type="text/css">@import url(css/main.css)</style>-->
		<link rel='shortcut icon' href='favicon.ico' type='image/x-icon'/ >
	</head>
	<body>
		<a href="#main"><span class="visually-hidden">Jump To Content</span></a>
		<main id="main" tabindex="-1">

			<?php

				include('Forecast/Forecast.php');
				$api_key = 'ef9f041b200ed14aa26171a2a4ff0038';
				$google_api_key='AIzaSyDZoh4yZUjJFqVPlPBahd81lzOAooQRk8s';
				$units = 'us';
				$lang = 'en';
				date_default_timezone_set('America/New_York');
				$today = date('F j, Y');
				$forecast = new ForecastIO($api_key, $units, $lang);
				$defaultLocation = 'New York, NY';
				if( !isset($_GET['location']) ){
					$_GET['location'] = $defaultLocation;
				}
				$incomingCity = str_replace(' ', '+', $_GET['location']);
				$request_url = 'https://maps.googleapis.com/maps/api/geocode/json?address='.$incomingCity.'&key='.$google_api_key;
				$location = file_get_contents($request_url);
				$json_output = json_decode($location);
				$lat = $json_output->results[0]->geometry->location->lat;
		    $long = $json_output->results[0]->geometry->location->lng;
		    $addComp = $json_output->results[0]->address_components;
				$niceName = str_replace(', USA', '', $json_output->results[0]->formatted_address);
				$condition = $forecast->getCurrentConditions($lat, $long);
				$conditions_week = $forecast->getForecastWeek($lat, $long);			
			?>
			<div class="topWrapper">
				<?php print getTodayHTML($niceName, $condition, $conditions_week, $today) ?>
				<?php print getFormHTML(); ?>
			</div>
			<?php print getDaysHTML($conditions_week, $today); ?>

			<?php
				function getTodayHTML($niceName, $dataNow, $dataLater, $today){
					foreach($dataLater as $conditions) {
						if($conditions->getTime('F j, Y') == $today){
							$laterToday = $conditions->getSummary();
						}
					}
					$todayHTML .= '<div id="todayWrapper">';
					$todayHTML .= '<div class="today">';
					$todayHTML .= '<div class="todayText">';
					$todayHTML .= '<h1 class="locationName">'.$niceName.'</h1>';
					$todayHTML .= '<span class="tempNow">'.round($dataNow->getTemperature()).'&deg;</span>';
					$todayHTML .= '<h2 class="todaySummary">'.$dataNow->getSummary().'</h2>';
					$todayHTML .= '<p class="laterToday">'.$laterToday.'</p>';
					$todayHTML .= '</div>';
					$todayHTML .= '<span class="iconNow"><span class="weatherIcon icon-'.$dataNow->getIcon().'"></span></span>';
					$todayHTML .= '</div>';
					$todayHTML .= '</div>';

					return $todayHTML;
				}

				function getFormHTML(){
					$formHTML  = '<div class="locationInput">';
					$formHTML .= '<div class="middleAlign">';
					$formHTML .= '		<h3>Enter Another Location</h3>';
					$formHTML .= '		<form name="locationSubmit" id="locationSubmit" autocomplete="off" action="new.php">';
					$formHTML .= '		<div class="form-item">';
					$formHTML .= '			<label for="location" class="visually-hidden">Enter City and State or Zip</label>';
					$formHTML .= '			<input type="text" maxlength="255" name="location" id="location" required placeholder="Enter City and State or Zip">';
					$formHTML .= '			<span class="styledSideLines"></span>';
					$formHTML .= '			<span class="styledTopLines"></span>';
					$formHTML .= '		</div>';
					$formHTML .= '		<button type="submit">Find Weather</button>';
					$formHTML .= '	</form>';
					$formHTML .= '	</div>';
					$formHTML .= '</div>';
					return $formHTML;
				}

				function getDaysHTML($data, $today){
					$counter = 1;
					$daysHTML = '<ul class="weekly">';
					foreach($data as $conditions) {
						if($conditions->getTime('F j, Y') == $today){
							$daysHTML .= '<li class="hidden day today" data-high="'.round($conditions->getMaxTemperature()).'" data-low="'.round($conditions->getMinTemperature()).'">';
							$daysHTML .= '<span class="dayOfWeek">'.$conditions->getTime('l').'</span>';
							$daysHTML .=	'<p class="summary">'.$conditions->getSummary().'</p>';
							$daysHTML .=	'<p class="max">Max: '.round($conditions->getMaxTemperature()).'&deg;</p>';
							$daysHTML .=	'<p class="min">Min: '.round($conditions->getMinTemperature()).'&deg;</p>';
							$daysHTML .= '</li>';
						}
						if($conditions->getTime('F j, Y') != $today && $counter <= 5){
							$daysHTML .= '<li class="day day'.$counter.'" data-high="'.round($conditions->getMaxTemperature()).'" data-low="'.round($conditions->getMinTemperature()).'">';
							$daysHTML .= '<span class="icon-'.$conditions->getIcon().'"></span>';
							$daysHTML .= '<span class="dayOfWeek">'.$conditions->getTime('l').'</span>';
							$daysHTML .=	'<p class="summary">'.$conditions->getSummary().'</p>';
							$daysHTML .=	'<p class="max">Max: '.round($conditions->getMaxTemperature()).'&deg;</p>';
							$daysHTML .=	'<p class="min">Min: '.round($conditions->getMinTemperature()).'&deg;</p>';
							$daysHTML .= '</li>';
					    
					    $counter++;
					  }

					  if($counter == 6){
					  	$daysHTML .= '<li class="hidden day extraday" data-high="'.round($conditions->getMaxTemperature()).'" data-low="'.round($conditions->getMinTemperature()).'">';
							$daysHTML .= '<span class="dayOfWeek">'.$conditions->getTime('l').'</span>';
							$daysHTML .=	'<p class="summary">'.$conditions->getSummary().'</p>';
							$daysHTML .=	'<p class="max">Max: '.round($conditions->getMaxTemperature()).'&deg;</p>';
							$daysHTML .=	'<p class="min">Min: '.round($conditions->getMinTemperature()).'&deg;</p>';
							$daysHTML .= '</li>';

							$counter++;
						}
					}
					$daysHTML .= '</ul>';

					return $daysHTML;

				}

			?>
			<div id="svgHolder"></div>
			<div class="poweredBy"><a href="https://darksky.net/poweredby/" target="_blank" >Powered by Dark Sky</a></div>
		</main>
		<div class="sk-cube-grid">
		  <div class="sk-cube sk-cube1"></div>
		  <div class="sk-cube sk-cube2"></div>
		  <div class="sk-cube sk-cube3"></div>
		  <div class="sk-cube sk-cube4"></div>
		  <div class="sk-cube sk-cube5"></div>
		  <div class="sk-cube sk-cube6"></div>
		  <div class="sk-cube sk-cube7"></div>
		  <div class="sk-cube sk-cube8"></div>
		  <div class="sk-cube sk-cube9"></div>
		</div>
		<script src="js/main.min.js"></script>
		<!--<script src="js/curve.min.js"></script>
		<script src="js/main.js"></script>-->
		<script>
		document.addEventListener("DOMContentLoaded", function(event) { 
		  setWidth();
		  createPoints();
			createLine(0,points.slice(2, points.length-2));
			drawTemps(points.slice(4, points.length-2));
			init = true;
		});
			
		</script>
	</body>
</html>