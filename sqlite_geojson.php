<?php
/**
 * SQLite to GeoJSON (Requires https://github.com/phayes/geoPHP)
 * Query a SQLite table or view (with a WKB GEOMETRY field) and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * @param       string      $filePath       The SQLite file *REQUIRED*
 * @param       string      $geotable       The SQLite table name *REQUIRED*
 * @param       string      $geomfield      The WKB GEOMETRY field *REQUIRED*
 * @param       string      $fields         Fields to be returned *OPTIONAL (If omitted, all fields will be returned)*
 * @param       string      $parameters     SQL WHERE clause parameters *OPTIONAL*
 * @param       string      $orderby        SQL ORDER BY constraint *OPTIONAL*
 * @param       string      $sort           SQL ORDER BY sort order (ASC or DESC) *OPTIONAL*
 * @param       string      $limit          Limit number of results returned *OPTIONAL*
 * @param       string      $offset         Offset used in conjunction with limit *OPTIONAL*
 * @return      string                  resulting geojson string
 */
# Include required geoPHP library and define wkb_to_json function
include_once('../geoPHP/geoPHP.inc');
function wkb_to_json($wkb) {
  $geom = geoPHP::load($wkb,'wkb');
  return $geom->out('json');
}
function escapeJsonString($value) { # list from www.json.org: (\b backspace, \f formfeed)
  $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c");
  $replacements = array("\\\\", "\\/", "\\\"", "\\n", "\\r", "\\t", "\\f", "\\b");
  $result = str_replace($escapers, $replacements, $value);
  return $result;
}

 
# Retrive URL variables
if (empty($_GET['filePath'])) {
    echo "missing required parameter: <i>filePath</i>";
    exit;
}else{
    $filePath = $_GET['filePath'];
}
if (empty($_GET['geotable'])) {
    echo "missing required parameter: <i>geotable</i>";
    exit;
} else
    $geotable = $_GET['geotable'];
/*if (empty($_GET['geomfield'])) {
    echo "missing required parameter: <i>geomfield</i>";
    exit;
} else
    $geomfield = $_GET['geomfield'];
*/
if (empty($_GET['fields'])) {
    $fields = '*';
} else
    $fields = $_GET['fields'];
    
if (empty($_GET['parameters'])) {
    $parameters = '';
} else
    $parameters = $_GET['parameters'];
if (empty($_GET['orderby'])) {
    $orderby = '';
} else
    $orderby = $_GET['orderby'];
if (empty($_GET['sort'])) {
    $sort = 'ASC';
} else
    $sort = $_GET['sort'];
    
if (empty($_GET['limit'])) {
    $limit = '';
} else
    $limit = $_GET['limit'];
if (empty($_GET['offset'])) {
    $offset = '';
} else
    $offset = $_GET['offset'];
if (empty($_GET['groupby'])) {
    $groupby = '';
} else
    $groupby = $_GET['groupby'];
# Build SQL SELECT statement and return the geometry as a GeoJSON element
$sql = "SELECT " . SQLite3::escapeString($fields) . " FROM " . SQLite3::escapeString($geotable);
if (strlen(trim($parameters)) > 0) {
    $sql .= " WHERE " . SQLite3::escapeString($parameters);
}
if (strlen(trim($groupby)) > 0) {
    $sql .= " GROUP BY " . SQLite3::escapeString($groupby);
}
if (strlen(trim($orderby)) > 0) {
    $sql .= " ORDER BY " . SQLite3::escapeString($orderby) . " " . $sort;
}
if (strlen(trim($limit)) > 0) {
    $sql .= " LIMIT " . SQLite3::escapeString($limit);
}
if (strlen(trim($offset)) > 0) {
    $sql .= " OFFSET " . SQLite3::escapeString($offset);
}
# Connect to SQLite database

$db = new PDO('sqlite:'.$filePath);


# Try query or error
$rs = $db->query($sql);
if (!$rs) {
    echo $sql."\n";
    echo "An SQL error occured.\n".$rs;
    exit;
}
# Build GeoJSON
#die( $sql);
$output    = '';
$rowOutput = '';
while ($row = $rs->fetch(PDO::FETCH_ASSOC)) {
    $geom_from_lat_lng = '{"type": "Point","coordinates": ['.$row['lng'].','.$row['lat'].']}';
    $rowOutput = (strlen($rowOutput) > 0 ? ',' : '') . '{"type": "Feature", "geometry": ' . $geom_from_lat_lng . ', "properties": {';
    $props = '';
    $id    = '';
    foreach ($row as $key => $val) {
        if ($key != "geojson") {
            $props .= (strlen($props) > 0 ? ',' : '') . '"' . $key . '":"' . escapeJsonString($val) . '"';
        }
        if ($key == "id") {
            $id .= ',"id":"' . escapeJsonString($val) . '"';
        }
    }
    
    $rowOutput .= $props . '}';
    $rowOutput .= $id;
    $rowOutput .= '}';
    $output .= $rowOutput;
}
$output = '{ "type": "FeatureCollection", "features": [ ' . $output . ' ]}';
echo $output;
$db = NULL;
?>