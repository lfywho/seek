document.addEventListener('DOMContentLoaded', function () {
    var range = document.getElementById('vagasTempoRange');
    var maxText = document.getElementById('vagasTempoMax');
    var unitText = document.getElementById('vagasTempoUnidade');
    var unitRadios = document.querySelectorAll('input[name="tempo-postagem"]');

    if (!range || !maxText || !unitText || !unitRadios.length) {
        return;
    }

    var limits = {
        horas: 24,
        dias: 20
    };

    function getSelectedUnit() {
        var selected = document.querySelector('input[name="tempo-postagem"]:checked');
        return selected ? selected.value : 'dias';
    }

    function syncRangeLimit() {
        var unit = getSelectedUnit();
        var limit = limits[unit] || 20;

        range.max = String(limit);
        if (Number(range.value) > limit) {
            range.value = String(limit);
        }

        unitText.textContent = unit;
        maxText.textContent = range.value;
    }

    range.addEventListener('input', function () {
        maxText.textContent = range.value;
    });

    unitRadios.forEach(function (radio) {
        radio.addEventListener('change', syncRangeLimit);
    });

    syncRangeLimit();
});
