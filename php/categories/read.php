<?php
include_once('../utils/db.php');

$database = new Database();
$connection = $database->getConnection();

if ($connection->connect_errno) {
    echo "Failed to connect to MySQL: " . $connection->connect_error;
    exit();
}

$whereClause = "";
if (isset($_GET["id"])) {
    $whereClause = "WHERE id=" . $_GET["id"];
}

$limitClause = "";
if (isset($_GET["base"]) && isset($_GET["count"])) {
    $limitClause = "LIMIT " . $_GET["base"] . "," . $_GET["count"];
}

$count = $connection->query("SELECT count(*) as total_no_of_items FROM categories");
if ($item = $count->fetch_array()) {
    $nTotalNoOfItems = $item['total_no_of_items'];
}
$count->close();

$items = $connection->query("SELECT * FROM categories " . $whereClause . " ORDER BY id " . $limitClause);
$nNoOfItems = $items->num_rows;

$index = 0;
echo '{"items" : [';
while ($item = $items->fetch_array()) {
    echo '{';
    echo '"id":' . '' . $item['id'] . '' . ' , ';
    echo '"name":"' . $item['NAME'] . '"' . ' , '; // Adjusted field name
    echo '"description":"' . $item['description'] . '"' . ' , '; // Adjusted field name
    echo '"creation_date":"' . $item['creation_date'] . '"' . '   ';
    echo '}';

    if ($index != $nNoOfItems - 1) {
        echo ",\n";
    }
    $index++;
}
echo '], "total_no_of_items" : ' . $nTotalNoOfItems . ' }';

$items->close();
$connection->close();
?>