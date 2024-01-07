<?php
include_once('../utils/db.php');

$database = new Database();
$connection = $database->getConnection();

if ($connection->connect_errno) {
    echo "Failed to connect to MySQL: " . $connection->connect_error;
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Assuming your form fields are named 'producator', 'model', 'pret', 'category', 'image', and 'id'
    $producator = $_POST['producator'];
    $model = $_POST['model'];
    $pret = $_POST['pret'];
    $category = $_POST['category'];
    $productId = $_POST['id'];

    // Check if a new image is uploaded
    if (!empty($_FILES['image']['tmp_name'])) {
        $newImage = file_get_contents($_FILES['image']['tmp_name']);

        // Update the product with the new image
        $updateQuery = "UPDATE products SET producator = ?, model = ?, pret = ?, category_id = (SELECT id FROM categories WHERE name = ?), image = ? WHERE id = ?";
        $updateStatement = $connection->prepare($updateQuery);

        if ($updateStatement) {
            $updateStatement->bind_param('ssissi', $producator, $model, $pret, $category, $newImage, $productId);
            $updateStatement->execute();
            $updateStatement->close();
            echo "Product updated successfully with a new image";
        } else {
            echo "Error preparing update statement: " . $connection->error;
        }
    } else {
        // Update the product without changing the existing image
        $updateQuery = "UPDATE products SET producator = ?, model = ?, pret = ?, category_id = (SELECT id FROM categories WHERE name = ?) WHERE id = ?";
        $updateStatement = $connection->prepare($updateQuery);

        if ($updateStatement) {
            $updateStatement->bind_param('ssisi', $producator, $model, $pret, $category, $productId);
            $updateStatement->execute();
            $updateStatement->close();
            echo "Product updated successfully without changing the image";
        } else {
            echo "Error preparing update statement: " . $connection->error;
        }
    }

    // Update the product properties
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
                    // Update the existing property entry
                    $updatePropertyQuery = "UPDATE product_properties SET prop_value = ? WHERE category_prop_id = ? AND product_id = ?";
                    $updatePropertyStatement = $connection->prepare($updatePropertyQuery);

                    if ($updatePropertyStatement) {
                        $updatePropertyStatement->bind_param('sii', $propertyValue, $propertyId, $productId);
                        $updatePropertyStatement->execute();
                        $updatePropertyStatement->close();
                    }
                }

                // Close the statement after fetching
                $getPropertyIdStatement->close();
            }
        }
    }

} else {
    echo "Invalid request method";
}

$connection->close();
?>