<?php

    require_once("./db.php");

    function login($userData) {

        try {

            $db = new DB();
            $connection = $db->getConnection();

            $username = $userData["username"];
            $password = $userData["password"];

            $sql = "SELECT * FROM users where username = :username";

            $stmt = $connection->prepare($sql);
            $stmt->execute(["username" => $username]);

            if ($stmt->rowCount() == 1) {

                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!password_verify($password, $user["password"])) {
                    return false;
                } else {
                    return $user;
                }

            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }

    }


?>