<?php 

    //recebe o caminho desejado pelo usuario --- _SERVER recebe todas as informações do apache
    $caminho = $_SERVER['REQUEST_URI'];

    //separa o caminho de possíveis argumentos
    $vetorcaminho = parse_url($caminho);

    //pega apenas o caminho sem os argumentos
    $somentecaminho = $vetorcaminho['path'];

    //remove as barras do inicio e fim do caminho
    $somentecaminho = trim($somentecaminho, '/');

    //gerar um vetor a partir do caminho restante
    // considerar a barra como caractere para separação
    $vetorcaminho = explode('/', $somentecaminho);

    //captura apenas o primeiro indice do vetor
    $url = $vetorcaminho[0];

    if($url == ''){
        include __DIR__ . '/app/controller/inicioController.php';
    }else{
        include __DIR__ . '/app/controller/inexistenteController.php';
    }

?>