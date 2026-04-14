document.addEventListener('DOMContentLoaded', function () {
    var duracaoRange = document.getElementById('duracaoRange');
    var duracaoValor = document.getElementById('duracaoValor');

    if (!duracaoRange || !duracaoValor) {
        return;
    }

    function atualizarDuracao() {
        duracaoValor.textContent = duracaoRange.value;
    }

    duracaoRange.addEventListener('input', atualizarDuracao);
    atualizarDuracao();
});
