<?php
include_once('../utils/db.php');

$database = new Database();
$connection = $database->getConnection();

if ($connection->connect_errno) {
    echo "Failed to connect to MySQL: " . $connection->connect_error;
    exit();
}

if (isset($_GET["read"])) {
    $whereClause = "WHERE";
    if (isset($_GET["id"])) {
        $whereClause = " WHERE products.id=" . $_GET["id"] . " AND ";
    }
    $limitClause = "";
    if (isset($_GET["base"]) && isset($_GET["count"])) {
        $limitClause = " LIMIT " . $_GET["base"] . "," . $_GET["count"];
    }

    $category = isset($_GET["category"]) ? $_GET["category"] : ''; // Get the category parameter

    $countQuery = "SELECT COUNT(*) as total_no_of_items 
                   FROM products 
                   INNER JOIN categories ON products.category_id = categories.id 
                   " . $whereClause . " categories.name LIKE '$category'";

    $countResult = $connection->query($countQuery);
    if ($countResult && $item = $countResult->fetch_array()) {
        $nTotalNoOfItems = $item['total_no_of_items'];
    } else {
        $nTotalNoOfItems = 0;
    }

    $countResult->close();

    $query = "SELECT 
                    products.id as id,  
                    products.producator as producator, 
                    products.model as model,
                    products.pret as pret,
                    products.creation_date as creation_date,
                    products.image as image,
                    GROUP_CONCAT(category_prop.prop_name) AS properties_names,
                    GROUP_CONCAT(product_properties.prop_value) AS properties_values,
                    categories.name as category
                FROM products 
                INNER JOIN categories ON products.category_id = categories.id 
                LEFT JOIN product_properties ON products.id = product_properties.product_id
                LEFT JOIN category_prop ON product_properties.category_prop_id = category_prop.id
                    " . $whereClause . " categories.name LIKE '$category' 
                GROUP BY products.id
                ORDER BY products.id " . $limitClause;

    $items = $connection->query($query);
    $nNoOfItems = $items->num_rows;
    $index = 0;
    echo '{"items" : [';
    while ($item = $items->fetch_array()) {
        // Check if the properties_names and properties_values are not null
        $propertiesNames = isset($item['properties_names']) ? explode(',', trim($item['properties_names'])) : [];
        $propertiesValues = isset($item['properties_values']) ? explode(',', trim($item['properties_values'])) : [];

        echo json_encode([
            'id' => (int) $item['id'],
            'producator' => $item['producator'],
            'model' => $item['model'],
            'pret' => (float) $item['pret'],
            'creation_date' => $item['creation_date'],
            'image' => base64_encode($item['image']), // Convert BLOB to base64
            'properties_names' => $propertiesNames,
            'properties_values' => $propertiesValues,
            'category' => $item['category'],
        ]);

        if ($index != $nNoOfItems - 1) {
            echo ",\n";
        }
        $index++;
    }
    echo '], "total_no_of_items" : ' . $nTotalNoOfItems . ' }';

    $items->close();
}

$connection->close();
?>