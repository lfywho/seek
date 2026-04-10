<?php
include __DIR__ . "/config/variaveisgerais.php";

//variavel nativa do php que contem informaçoes da url
$url = $_SERVER["REQUEST_URI"];

//variavel que remove parametros da url
$divisao = parse_url($url);

//pega apenas uma parte da url
$caminho = $divisao["path"];

//remove a ultima barra na string 
$caminho = trim($caminho, "/");

//divite a string toda vez que aparece uma barra (/)
$divisao = explode("/", $caminho);

// pega apenas a primeira chave do array
$url = $divisao[0];


//array com todas as rotas
require __DIR__ . "/app/core/Rotas.php";


//verifica se a string da variavel url existe no array rotas
if (array_key_exists($url, $rotas)) {
    //armazena em uma variavel a cheve que corresponde a variavel url
    $nomecontrolador = $rotas[$url];
    //redireciona o usuario para a pagina desejada
    include __DIR__ . "/app/controller/$nomecontrolador.php";
} else {
    //caso não exista a pagina digitada redireciona para a pagina de erro
    include __DIR__ . "/app/controller/inexistenteController.php";
}


?>