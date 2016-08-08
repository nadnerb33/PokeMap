var map = L.map('map').setView([51.3835,-2.3646], 13);



var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);


var overlay = L.control();

overlay.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'overlay'); // create a div with a class "info"
    this._div.innerHTML = '<div id="overlayContainer"><div id="pokeInfo"><div id="pokeImg"></div><div id="pokeStats"></div></div><div id="pokemonPickerContainer"></div></div>';
    L.DomEvent.disableClickPropagation(this._div);
	return this._div;
};

overlay.addTo(map);

$("#pokemonPicker").appendTo("#pokemonPickerContainer");

var heatGroup = L.layerGroup([]).addTo(map); //default layer
var spawnGroup = L.layerGroup([]);
var spawnGradGroup = L.layerGroup([]);

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
var mostCommonBySpawn = new L.geoJson(null,{
	onEachFeature: onEachFeaturePop	
})

var selectedPokemonLayer = new L.geoJson(null,{
	 onEachFeature: onEachFeature
}).addTo(spawnGroup);

var selectedPokemonGradLayer = new L.geoJson(null,{
	pointToLayer: function (feature, latlng) {
    	return new L.CircleMarker(latlng, gradStyle(feature.properties.count))
    		.bindPopup("<b>Sightings: </b>"+feature.properties.count);
	}
}).addTo(spawnGradGroup);

mapLayers = {
	"Heat Map": heatGroup,
	"Spawn Locations - By Pokemon (Images)": spawnGroup,
	"Spawn Locations - By Pokemon (Graduated)": spawnGradGroup,
	"Spawn Locations - All Pokemon (Graduated)": allSpawnGrad,
	"Spawn Locations - Most common Pokemon (Images)": mostCommonBySpawn
}


L.control.layers(null, mapLayers).addTo(map);

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
	$("#pokeImg").css("background-image", "url('b-PGO-mapscan-opt/res/icons/"+$(this).children(":selected").attr("id")+".png')");  
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
