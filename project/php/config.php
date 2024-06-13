<?php
$mysqli = new mysqli("localhost", "root", "", "web_app_db");

// Check connection
if ($mysqli === false) {
    die("ERROR: Could not connect. " . $mysqli->connect_error);
}
?>

