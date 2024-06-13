<?php
session_start();
require_once "config.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);

    $sql = "INSERT INTO users (username,email, password) VALUES (?, ?, ?)";
    if ($stmt = $mysqli->prepare($sql)) {
        $stmt->bind_param("sss", $username, $email, password_hash($password, PASSWORD_DEFAULT));
        if ($stmt->execute()) {
            header("location: ../login.html");
        } else {
            echo "Something went wrong. Please try again later.";
        }
        $stmt->close();
    }
    $mysqli->close();
}
?>

