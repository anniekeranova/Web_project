<?php
session_start();
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    die("You are not logged in.");
}

if (!isset($_SESSION["id"])) {
    die("User ID is not set in session.");
}


$conn = new mysqli("localhost", "root", "", "web_app_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$table_check = $conn->query("SHOW TABLES LIKE 'history'");
if ($table_check->num_rows == 0) {
    die("Table 'history' doesn't exist in the database.");
}

$stmt = $conn->prepare("SELECT filename, converted_at FROM history WHERE user_id = ? ORDER BY converted_at DESC");
if ($stmt === false) {
    die("Prepare failed: " . $conn->error);
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->store_result();

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Files History</title>
    <link rel="stylesheet" href="css/history.css">
</head>
<body>
    <div class="container">
        <h1>History of Converted Files</h1>
        <p><a href="home.php">Back to Home</a></p>
        <div id="history-content">
            <?php
            if ($stmt->num_rows === 0) {
                echo "There is no current history.";
            } else {
                echo "<table>";
                $stmt->bind_result($filename, $converted_at);
                while ($stmt->fetch()) {
                    echo "<tr><td>" . htmlspecialchars($filename) . "</td><td>" . htmlspecialchars($converted_at) . "</td></tr>";
                }
                echo "</table>";
            }
            ?>
        </div>
    </div>
</body>
</html>

<?php
$stmt->close();
$conn->close();
?>
