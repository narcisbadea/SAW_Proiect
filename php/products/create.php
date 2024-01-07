<?php
include_once('../utils/db.php');

$database = new Database();
$connection = $database->getConnection();

if ($connection->connect_errno) {
    echo "Failed to connect to MySQL: " . $connection->connect_error;
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $producator = $_POST['producator'];
    $model = $_POST['model'];
    $pret = $_POST['pret'];
    $category = $_POST['category'];
    $image = file_get_contents($_FILES['image']['tmp_name']);

    // Insert product
    $insertProductQuery = "INSERT INTO products (producator, model, pret, category_id, image) VALUES (?, ?, ?, (SELECT id FROM categories WHERE name = ?), ?)";
    $insertProductStatement = $connection->prepare($insertProductQuery);

    if ($insertProductStatement) {
        $insertProductStatement->bind_param('ssiss', $producator, $model, $pret, $category, $image);
        $insertProductStatement->execute();

        // Get the ID of the inserted product
        $productId = $insertProductStatement->insert_id;

        $insertProductStatement->close();

        echo "Product inserted successfully with ID: $productId";

        // Insert new product properties
        foreach ($_POST as $key => $value) {
            if (strpos($key, 'prop_') === 0) {
                $propertyName = substr($key, 5);
                $propertyValue = $value;

                // Find the category_prop.id based on property name
                $getPropertyIdQuery = "SELECT id FROM category_prop WHERE prop_name = ?";
                $getPropertyIdStatement = $connection->prepare($getPropertyIdQuery);

                if ($getPropertyIdStatement) {
                    $getPropertyIdStatement->bind_param('s', $key);
                    $getPropertyIdStatement->execute();

                    // Store the result before fetching
                    $getPropertyIdStatement->store_result();

                    // Bind the result
                    $getPropertyIdStatement->bind_result($propertyId);

                    if ($getPropertyIdStatement->fetch()) {
                        // Insert new property entry
                        $insertPropertyQuery = "INSERT INTO product_properties (category_prop_id, prop_value, product_id) VALUES (?, ?, ?)";
                        $insertPropertyStatement = $connection->prepare($insertPropertyQuery);

                        if ($insertPropertyStatement) {
                            $insertPropertyStatement->bind_param('isi', $propertyId, $propertyValue, $productId);
                            $insertPropertyStatement->execute();
                            $insertPropertyStatement->close();
                        }
                    }

                    // Close the statement after fetching
                    $getPropertyIdStatement->close();
                }
            }
        }
    } else {
        echo "Error preparing insert statement: " . $connection->error;
    }
} else {
    echo "Invalid request method";
}
function console_log($output, $with_script_tags = true)
{
    $js_code = 'console.log(' . json_encode($output, JSON_HEX_TAG) .
        ');';
    if ($with_script_tags) {
        $js_code = '<script>' . $js_code . '</script>';
    }
    echo $js_code;
}
$connection->close();
?>