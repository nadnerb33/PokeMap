<?php
$name = urlencode($_GET['name']);
$request = urlencode($_GET['request']);
$latMax = $_GET['latMax'];
$latMin = $_GET['latMin'];
$lngMax = $_GET['lngMax'];
$lngMin = $_GET['lngMin'];

$filePath = "Spawns.sqlite";
$currentURL = "http".( ($_SERVER["HTTPS"] == "on")?'s':'' )."://".$_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF'])."/";
#echo $name;
if (isset($_GET['name'])){
	echo file_get_contents($currentURL."sqlite_geojson.php?geotable=vw_Pokemon_Encounters_By_Location_Example&fields=lat,lng,count(*)as%22count%22&parameters=name%3D%22".$name."%22&groupby=SpawnID&filePath=".urlencode($filePath));
}else{
	$dir = 'sqlite:'.$filePath;
	$dbh = new PDO($dir) or die("cannot open database");
	if($request=="total"){
		$query = "SELECT count(*) FROM vw_Pokemon_Encounters_By_Location_Example";
		foreach ($dbh->query($query) as $row) {
			echo $row[0];
		}
	}
	if($request=="spawnLocations"){
		$result = file_get_contents($currentURL."sqlite_geojson.php?geotable=vw_Pokemon_Encounters_By_Location_Example&fields=SpawnID,count(*)as%22count%22,lat,lng,group_concat(name,%22,%22)as%22pokes%22&groupby=SpawnID&filePath=".urlencode($filePath));
		$resultArr = json_decode($result, TRUE);
		$resultArrFormatted = $resultArr;
		$resultArrFormatted['features'] = []; //clear the old features
		//print_r(array_count_values($resultArr));
		foreach($resultArr['features'] as $feature) {
			$pokeArray = array_count_values(str_getcsv($feature['properties']['pokes'],",")); //count of poke names
			arsort($pokeArray); //sort by count
			$feature['properties']['pokes'] = $pokeArray;
			array_push($resultArrFormatted['features'], $feature); //add new formatted feature
		}
		echo json_encode($resultArrFormatted); //return formatted results
	}
	if($request=="spawnLocationsBounds"){
		$parameters = "lat<".$latMax." and lat>".$latMin." and lng<".$lngMax." and lng>".$lngMin;
		$result = file_get_contents($currentURL."sqlite_geojson.php?geotable=vw_Pokemon_Encounters_By_Location_Example&fields=SpawnID,count(*)as%22count%22,lat,lng,group_concat(name,%22,%22)as%22pokes%22&groupby=SpawnID&filePath=".urlencode($filePath)."&parameters=".urlencode($parameters));
		$resultArr = json_decode($result, TRUE);
		$resultArrFormatted = $resultArr;
		$resultArrFormatted['features'] = []; //clear the old features
		//print_r(array_count_values($resultArr));
		foreach($resultArr['features'] as $feature) {
			$pokeArray = array_count_values(str_getcsv($feature['properties']['pokes'],",")); //count of poke names
			arsort($pokeArray); //sort by count
			$feature['properties']['pokes'] = $pokeArray;
			array_push($resultArrFormatted['features'], $feature); //add new formatted feature
		}
		echo json_encode($resultArrFormatted); //return formatted results
	}
}
?>


