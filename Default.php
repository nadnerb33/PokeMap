<html>
	<head>
		<title>PokeMap</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
		<link rel="stylesheet" href="https://npmcdn.com/leaflet@0.7.7/dist/leaflet.css" />
		<script src="https://npmcdn.com/leaflet@0.7.7/dist/leaflet.js"></script>
		<script src="https://code.jquery.com/jquery-3.1.0.min.js"   integrity="sha256-cCueBR6CsyA4/9szpPfrX3s49M9vUU5BgtiJj06wt/s="   crossorigin="anonymous"></script>
		<script src="http://leaflet.github.io/Leaflet.heat/dist/leaflet-heat.js"></script>
		<link rel="stylesheet" href="css/map.css">
	</head>
	<body>
		<select id="pokemonPicker" class="form-control">
		<option id="0" value="null">Pick a Pokemon </option>';
		<?php
			$pokemonList = json_decode(file_get_contents("pokemon.json"));
			$i=1;
			foreach(array_slice( $pokemonList, 1, 151, true) as $pokemon){
			    print '<option id="'.$i.'" value="'.$pokemon.'">'.$pokemon.'</option>';
			   	$i++;
			}        
		?>
		</select>
		<div id="map-container">
			<div id="map"></div>
			<div id="infoPopUpDiv"></div>
		</div>
	</body>
	<script src="js/map.js"></script>
</html>
