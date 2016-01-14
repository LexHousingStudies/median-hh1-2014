var map = L.map('map', {
    attributionControl: false
})
    .setView([38.046408, -84.497083], 11);

L.control.attribution().addAttribution("<a href='http://www.census.gov/' target='_blank'>United States Census Bureau</a>").addTo(map);

var base = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

var grapi;
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = (props ?
        '<h3>Tract ' + props.NAME + '</h3><hr /><b>Median Household Income:</b> $' 
        + props.medianHhi + '<br><b>80% of Median Household Income:</b> ' + (props.medianHhi*0.8).toFixed(2))
        : 'Hover over a tract');
};

info.addTo(map)

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 1.5,
        color: '#FFFF33',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
	grapi.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function getColor(d) {
	return d > 58200 ? "#b2182b": 
        d > 48200 ? "#ef8a62":
		d > 38200 ? "#fddbc7":
		d > 28200 ? "#d1e5f0":
		d > 18200 ? "#67a9cf":
		d >= 0 ? "#2166ac":
			"#fff";
}

function style(feature) {
	return {
		fillColor:getColor(feature.properties.medianHhi),
		weight: 1,
		opacity: 1,
		color: "white",
		fillOpacity: 0.6
	}
}

grapi = new L.GeoJSON.AJAX("medianHhi_2014.geojson", {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend'),
	grades = [0, 18200, 28200, 38200, 48200, 58200],
	labels = [];
	div.innerHTML = '<h4>Median Household Income, 2014 ($)</h4>'
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML += '<i style="background:' + getColor(grades[i]+1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i+1] + '<br>' : '+');
	}

	return div;
};
legend.addTo(map);
