mapboxToken = 'pk.eyJ1IjoibmFkbmVyYiIsImEiOiJOSFJxUmJZIn0.cl9khCzLqJK7UULvu08_Xg';

var map = L.map('map',{zoomControl:false}).setView([51.3835,-2.3646], 13);
L.control.zoom({position: 'topright'}).addTo(map);

var cartodb = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19,
	about: "Grey basemap (CartoDB)",
	displayName: "Map Labels" + '<span class="info-icon" layerName="cartodb">&nbsp;&nbsp;&nbsp;&nbsp;</span>'
})
cartodb_displayName = "Grey Basemap" + '<span class="info-icon" layerName="cartodb">&nbsp;&nbsp;&nbsp;&nbsp;</span>';
cartodb_about = "Grey basemap from CartoDB";

baseMaps={};

baseMaps[cartodb_displayName] = cartodb;

var CartoDB_PositronLabelsOnly = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
	minZoom: 0,
	maxZoom: 20,
	opacity:0.5
})
CartoDB_PositronLabelsOnly_displayName = "Map labels" + '<span class="info-icon" layerName="CartoDB_PositronLabelsOnly">&nbsp;&nbsp;&nbsp;&nbsp;</span>';
CartoDB_PositronLabelsOnly_about = "Place names etc";


if(mapboxToken != ''){
	var mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/nadnerb/cirmcq99k001mgtkr8apooq5s/tiles/256/{z}/{x}/{y}?access_token='+mapboxToken,{
		maxZoom: 19,
		opacity:0.5
	}).addTo(map);
	mapbox_displayName = "Pokemon Go Style Basemap" + '<span class="info-icon" layerName="mapbox">&nbsp;&nbsp;&nbsp;&nbsp;</span>';
	mapbox_about = "Pokemon Go style basemap made with Mapbox";
	baseMaps[mapbox_displayName]= mapbox;
}else{
	cartodb.addTo(map);
}



var overlay = L.control({position: 'topleft'});

overlay.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'overlay'); // create a div with a class "info"
    this._div.innerHTML = '<div id="overlayContainer"><div id="pokeInfo"><div id="pokeImg"></div><div id="pokeStats"></div></div><div id="pokemonPickerContainer"></div></div>';
    L.DomEvent.disableClickPropagation(this._div);
	return this._div;
};

overlay.addTo(map);

$("#pokemonPicker").appendTo("#pokemonPickerContainer");

var heatGroup = L.layerGroup([]).addTo(map); //default layer
heatGroup_displayName = "Heatmap - By Pokemon" + '<span class="info-icon" layerName="heatGroup">&nbsp;&nbsp;&nbsp;&nbsp;</span>';
heatGroup_about = "Heatmap showing chance of an encounter with the selected Pokemon. Based on historical spawn data.";

var spawnGroup = L.layerGroup([]);
spawnGroup_displayName = "Spawn Locations - By Pokemon (Images)" + '<span class="info-icon" layerName="spawnGroup">&nbsp;&nbsp;&nbsp;&nbsp;</span>';
spawnGroup_about = "An icon for each historical spawn point for the selected Pokemon. Click to see how many times it has spawned at this location.";

var spawnGradGroup = L.layerGroup([]);
spawnGradGroup_displayName = "Spawn Locations - By Pokemon (Graduated)" + '<span class="info-icon" layerName="spawnGradGroup">&nbsp;&nbsp;&nbsp;&nbsp;</span>';
spawnGradGroup_about = "Graduated symbol showing where the selected Pokemon has historically spawned. Bigger = more, smaller = less.";


var allSpawnGrad = new L.geoJson(null,{
	pointToLayer: function (feature, latlng) {
		popupContent=[];
		pokes = feature.properties.pokes;
		$.each( pokes, function( key, value ) {
		  popupContent.push(key+" x"+value);
		});
    	return new L.CircleMarker(latlng, gradStyleAll(feature.properties.count))
    		.bindPopup("<b>Spawned at this location:</b><br>"+popupContent.join('<br>'));
	}
})
allSpawnGrad_displayName = "Spawn Locations - All Pokemon (Graduated)" + '<span class="info-icon" layerName="allSpawnGrad">&nbsp;&nbsp;&nbsp;&nbsp;</span>';
allSpawnGrad_about = "Graduated symbol showing the total number of Pokemon that have spawned at this location. Click to see how many of each Pokemon have been spawned here";


var mostCommonBySpawn = new L.geoJson(null,{
	onEachFeature: onEachFeaturePop	
})
mostCommonBySpawn_displayName = "Spawn Locations - Most common Pokemon (Images)" + '<span class="info-icon" layerName="mostCommonBySpawn">&nbsp;&nbsp;&nbsp;&nbsp;</span>';
mostCommonBySpawn_about = "An icon for each spawn point. The Pokemon shown is the most commonly spawned Pokemon at this location.";


var selectedPokemonLayer = new L.geoJson(null,{
	onEachFeature: onEachFeature
}).addTo(spawnGroup);

var selectedPokemonGradLayer = new L.geoJson(null,{
	pointToLayer: function (feature, latlng) {
    	return new L.CircleMarker(latlng, gradStyle(feature.properties.count))
    		.bindPopup("<b>Sightings: </b>"+feature.properties.count);
	}
}).addTo(spawnGradGroup);


var mapLayers = {};
mapLayers[heatGroup_displayName] = heatGroup;
mapLayers[spawnGroup_displayName] = spawnGroup;
mapLayers[spawnGradGroup_displayName] = spawnGradGroup;
mapLayers[allSpawnGrad_displayName] = allSpawnGrad;
mapLayers[mostCommonBySpawn_displayName] = mostCommonBySpawn;
mapLayers[CartoDB_PositronLabelsOnly_displayName] = CartoDB_PositronLabelsOnly;


L.control.layers(baseMaps, mapLayers,{position: 'topleft'}).addTo(map);

totalSightings = 0;
totalSpawnLocations = 0;

function onEachFeature(feature, layer) {
    layer.bindPopup("<b>Sightings: </b>"+feature.properties.count);
    heatData.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0],parseInt(feature.properties.count)]);
    totalSightings += parseInt(feature.properties.count);
    totalSpawnLocations ++;
    layer.setIcon(L.icon({
		iconUrl: 'icons/larger/'+$("#pokemonPicker").children(":selected").attr("id")+'.png',
		iconSize:     [40, 30],
		iconAnchor:   [20, 15],
		popupAnchor:  [0, -15],
	}));
}
function onEachFeaturePop(feature, layer) {
	for (firstPoke in feature.properties.pokes) break;
	firstPokeID = $('option[value="'+firstPoke+'"]').attr('id')
	firstPokeCount = feature.properties.pokes[Object.keys(feature.properties.pokes)[0]];
	firstPokePercent = parseInt((firstPokeCount/feature.properties.count)*100);
    layer.bindPopup("<b>Most common pokemon: </b><br>"+firstPoke+" x"+firstPokeCount +"<br>"+firstPokePercent+"% of "+feature.properties.count+" spawns here");
    layer.setIcon(L.icon({
		iconUrl: 'icons/larger/'+firstPokeID+'.png',
		iconSize:     [40, 30],
		iconAnchor:   [20, 15],
		popupAnchor:  [0, -15], 
	}));
}


function gradStyle(count){
	return{
		    radius: count >= 30  ? 11 :
           			count >= 20  ? 9 :
           			count >= 15  ? 7 :
          			count >= 5   ? 5 :
                                  3,
		    fillColor: "#A3BBC3",
		    color: "#0062AC",
		    weight: 1,
		    opacity: 1,
		    fillOpacity: 0.6
		   }
}
function gradStyleAll(count){
	return{
		    radius: count >= 60  ? 11 :
           			count >= 40  ? 9 :
           			count >= 30  ? 7 :
          			count >= 10   ? 5 :
                                  3,
		    fillColor: "#FF2F2A",
		    color: "#B2211D",
		    weight: 1,
		    opacity: 1,
		    fillOpacity: 0.6
		   }
}



$.ajax({
    type: "GET",
    url: "getPokeData.php?request=spawnLocations",
    dataType: 'json',
    success: function (response) {
        allSpawnGrad.addData(response);
    }
})
map.on('moveend', function() {
	if(mostCommonBySpawn && map.getZoom() > 14){
        getSpawnLocationsBoundsData(map.getBounds())
    }
});


map.on('overlayadd', function(e){
	if (e.layer === mostCommonBySpawn && map.getZoom()<15){
		map.setZoom(15);
	}
})

function getSpawnLocationsBoundsData(bounds){
	//mostCommonBySpawn.clearLayers()
	//uncomment above to remove all pokes after each map pan/zoom
	$.ajax({
	    type: "GET",
	    url: "getPokeData.php?request=spawnLocationsBounds",
	    data: { 
        "latMax": bounds.getNorth(), 
        "latMin": bounds.getSouth(), 
        "lngMax": bounds.getEast(),
        "lngMin": bounds.getWest()
    	},
	    dataType: 'json',
	    success: function (response) {
	        mostCommonBySpawn.addData(response);
	    }
	})
}


$('#pokemonPicker').change(function(){
	$("#pokeImg").css("background-image", "url('icons/"+$(this).children(":selected").attr("id")+".png')");  
	heatData = [];
	selectedPokemonLayer.clearLayers();
	selectedPokemonGradLayer.clearLayers();
	totalSightings = 0;
    totalSpawnLocations = 0;
	try{heatGroup.removeLayer(heatLayer);}catch(err){/*ignore*/}
	$.ajax({
    type: "GET",
    url: "getPokeData.php?name="+$(this).val(),
    dataType: 'json',
    success: function (response) {
        selectedPokemonLayer.addData(response);
        selectedPokemonGradLayer.addData(response);
        heatLayer = new L.heatLayer(heatData, {radius: 15}).addTo(heatGroup); 
        $('#pokeStats').html(numberWithCommas(totalSightings)+" sightings <br>"+numberWithCommas(totalSpawnLocations)+" spawn locations")
    }
});
})


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/******************* info popup *******************************/
//used to positon popups
var mouseX;
var mouseY;

$( document ).ready(function() {
	initInfoPopup();
	addInfoPopupEvents();

});

function initInfoPopup(){
		$(".info-icon").each(function(){
		//add the popup content to a div
		var layerName = $(this).attr("layerName");
		var popupCode = '<span class="hidePopUp info" id="popUp_'+ layerName +'">'+ window[layerName+"_about"] +'</span>';
		$('#infoPopUpDiv').append(popupCode);
	})

	$(".leaflet-control-layers-list").mousemove( function(e) {
		   mouseX = e.pageX;//- $("leaflet-control-layers-list").offset().left; 
		   mouseY = e.pageY;//- $("leaflet-control-layers-list").offset().top;
	});
}
function addInfoPopupEvents(){
		//add some event handlers
	$(".info-icon").on({
		click: function () {
	    	showPopUp($(this).attr("layerName"));
	    },
	    mouseover: function () {
	    	showPopUp($(this).attr("layerName"));
	    },
	    mouseleave: function () {
	       hidePopUp($(this).attr("layerName"));
	    }
	});
}
function showPopUp(popUpID) {
	$('#popUp_'+popUpID).css({'top':mouseY-15,'left':mouseX+20, 'display':'inline'}).show(); 
}
function holdPopUp(popUpID) {
	holdPopUpID = popUpID;
}

function hidePopUp(popUpID) {
	$('#popUp_'+popUpID).hide();
}

