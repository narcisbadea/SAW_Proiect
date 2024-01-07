<?php

include_once('../utils/db.php');

$database = new Database();
$connection = $database->getConnection();

if ($connection->connect_errno) {
    echo "Failed to connect to MySQL: " . $connection->connect_error;
    exit();
}

// Ensure that the category parameter is set
if (!isset($_GET["category"])) {
    echo json_encode(["error" => "Category parameter is missing."]);
    exit();
}

$category = $_GET["category"];

// Fetch category properties for the given category
$query = "SELECT prop_name FROM category_prop WHERE category_id = (SELECT id FROM categories WHERE name = ?)";
$stmt = $connection->prepare($query);

if ($stmt) {
    $stmt->bind_param("s", $category);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($prop_name);

        $properties = [];

        while ($stmt->fetch()) {
            $properties[] = [
                "prop_name" => $prop_name
            ];
        }

        echo json_encode(["items" => $properties]);
    } else {
        echo json_encode(["items" => []]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Error preparing statement."]);
}

$connection->close();

?>
