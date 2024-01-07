<?php
include_once('../utils/db.php');

$database = new Database();
$connection = $database->getConnection();

if ($connection->connect_errno) {
    echo "Failed to connect to MySQL: " . $connection->connect_error;
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $productId = $_POST['id'];
    $deleteQuery = "DELETE FROM products WHERE id = ?";
    $deleteStatement = $connection->prepare($deleteQuery);

    if ($deleteStatement) {
        $deleteStatement->bind_param('i', $productId);
        $deleteStatement->execute();
        $deleteStatement->close();
        echo "Product deleted successfully";
    } else {
        echo "Error preparing delete statement: " . $connection->error;
    }
} else {
    echo "Invalid request method";
}

$connection->close();
?>
