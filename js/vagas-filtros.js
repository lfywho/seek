document.addEventListener('DOMContentLoaded', function () {
    var categoriasList = document.getElementById('vagasCategoriasList');
    var categoriasStatus = document.getElementById('vagasCategoriasStatus');
    var range = document.getElementById('vagasTempoRange');
    var maxText = document.getElementById('vagasTempoMax');
    var unitText = document.getElementById('vagasTempoUnidade');
    var unitRadios = document.querySelectorAll('input[name="tempo-postagem"]');

    if (!categoriasList || !categoriasStatus || !range || !maxText || !unitText || !unitRadios.length) {
        return;
    }

    var filterState = {
        categoria: '',
        tempo: 'dias',
        dias: ''
    };

    function notifyChange() {
        if (typeof window.seekVagasRecarregar === 'function') {
            window.seekVagasRecarregar();
        }
    }

    function setCategoriasStatus(texto) {
        categoriasStatus.textContent = texto;
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderCategorias(categorias) {
        categoriasList.innerHTML = '';

        if (!Array.isArray(categorias) || !categorias.length) {
            setCategoriasStatus('Nenhuma categoria encontrada.');
            return;
        }

        setCategoriasStatus('');

        categorias.forEach(function (categoria) {
            var nome = categoria && categoria.nome_categoria ? String(categoria.nome_categoria) : '';
            if (!nome) {
                return;
            }

            var label = document.createElement('label');
            label.className = 'filtro-opcao';

            var input = document.createElement('input');
            input.type = 'checkbox';
            input.name = 'categoria-vaga';
            input.checked = filterState.categoria === nome;

            var texto = document.createElement('span');
            texto.textContent = nome;

            label.appendChild(input);
            label.appendChild(texto);

            label.addEventListener('click', function () {
                filterState.categoria = filterState.categoria === nome ? '' : nome;
                renderCategorias(categorias);
                notifyChange();
            });

            categoriasList.appendChild(label);
        });
    }

    function syncTempoControls() {
        var selected = document.querySelector('input[name="tempo-postagem"]:checked');
        var unit = selected ? selected.value : 'dias';
        var isCustomDays = unit === 'dias';
        var diasValor = isCustomDays ? String(range.value || '7') : '';

        range.max = isCustomDays ? '365' : (unit === 'hoje' ? '1' : unit === 'semana' ? '7' : unit === 'mes' ? '30' : unit === 'ano' ? '365' : '365');
        if (isCustomDays && (!range.value || Number(range.value) < 1)) {
            range.value = '7';
            diasValor = '7';
        }
        if (!isCustomDays) {
            range.value = range.max;
        }

        filterState.tempo = unit;
        filterState.dias = diasValor;
        maxText.textContent = range.value;
        unitText.textContent = isCustomDays ? 'dias' : unit;

        if (window.seekVagasFilterState) {
            window.seekVagasFilterState.categoria = filterState.categoria;
            window.seekVagasFilterState.tempo = filterState.tempo;
            window.seekVagasFilterState.dias = filterState.dias;
        }
    }

    range.addEventListener('input', function () {
        maxText.textContent = range.value;
        var selectedTempo = document.querySelector('input[name="tempo-postagem"]:checked');
        if (selectedTempo && selectedTempo.value === 'dias') {
            syncTempoControls();
            notifyChange();
        }
    });

    unitRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            syncTempoControls();
            notifyChange();
        });
    });

    window.seekVagasFilterState = filterState;

    window.seekVagasAtualizarCategorias = function (categorias) {
        renderCategorias(categorias);
    };

    window.seekVagasRecarregar = function () {
        if (typeof window.seekVagasRecarregarLista === 'function') {
            window.seekVagasRecarregarLista();
        }
    };

    syncTempoControls();

    fetch(ip_api + '/postsvagas/top-categorias')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Falha ao carregar categorias');
            }

            return response.json();
        })
        .then(function (categorias) {
            renderCategorias(categorias);
        })
        .catch(function () {
            setCategoriasStatus('Nao foi possivel carregar as categorias.');
        });
});
