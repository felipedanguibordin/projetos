<?php
session_start();

if ( !isset($_SESSION['tasks']) ) {
    $_SESSION['tasks'] = array();
}

if ( isset($_GET)['task_name'] ) {
    array_push($_SESSION['tasks'], $_GET['task_name']);
    unset($_GET['task_name']);
}

var_dump($_SESSION['tasks']);   

if ( isset($_SESSION['tasks']) ) {
    echo "<ul>";

    foreach ( $_SESSION['tasks'] as $key => $task) {
        echo "<li>$task</li>"
    }

    echo "</ul>";
}