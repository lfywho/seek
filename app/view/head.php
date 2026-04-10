<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $titulopagina ?></title>
    <link rel="shortcut icon" href="../assets/imgs/favicon.png" type="image/x-icon">
    <?php for($g=0; $g<count($css); $g++): ?>
        <link rel="stylesheet" href="<?= $css[$g] ?>">
    <?php endfor; ?>
</head>
