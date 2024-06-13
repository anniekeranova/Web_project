<?php

    require_once("./login-func.php");

    $post = json_decode(file_get_contents("php://input"), true);

    if ($post && isset($post["username"]) && isset($post["password"])) {

        try {

            $user = login($post);

            if ($user) {

                session_start();
                $_SESSION["user"] = $user;

                setcookie("username", $post["username"], time() + 600);
                setcookie("password", $post["password"], time() + 600);

                echo json_encode(["status" => "SUCCESS", "message" => "Входът е успешен!"]); 

            } else {
                http_response_code(400);
                echo json_encode(["status" => "ERROR", "message" => "Входът е неуспешен!"]); 
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "ERROR", "message" => $e->getMessage()]); 
        }

    } else {
        http_response_code(400);
        echo json_encode(["status" => "ERROR", "message" => "Некоректни данни!"]); 
    }

?>