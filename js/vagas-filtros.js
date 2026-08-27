document.addEventListener('DOMContentLoaded', function () {
    const categoriasList = document.getElementById('vagasCategoriasList');
    const categoriasStatus = document.getElementById('vagasCategoriasStatus');
    const range = document.getElementById('vagasTempoRange');
    const maxText = document.getElementById('vagasTempoMax');
    const unitText = document.getElementById('vagasTempoUnidade');
    const unitRadios = document.querySelectorAll('input[name="tempo-postagem"]');

    if (!categoriasList || !categoriasStatus || !range || !maxText || !unitText || !unitRadios.length) {
        return;
    }

    // O estado agora guarda o ID da categoria
    const filterState = {
        categoriaId: null, 
        dias: 7 
    };

    function notifyChange() {
        if (typeof window.seekVagasRecarregar === 'function') {
            window.seekVagasRecarregar();
        }
    }

    function setCategoriasStatus(texto) {
        categoriasStatus.textContent = texto;
    }

    function renderCategorias(categorias) {
        categoriasList.innerHTML = '';

        if (!Array.isArray(categorias) || !categorias.length) {
            setCategoriasStatus('Nenhuma categoria encontrada.');
            return;
        }

        setCategoriasStatus('');

        categorias.forEach(categoria => {
            const id = categoria.id;
            const nome = categoria.nome;
            const quantidade = categoria.quantidade_vagas || 0;

            if (!id || !nome) return;

            const label = document.createElement('label');
            label.className = 'filtro-opcao';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = 'categoria-vaga';
            input.value = id;
            input.checked = (filterState.categoriaId === id);

            const texto = document.createElement('span');
            texto.textContent = `${nome} (${quantidade})`;

            label.appendChild(input);
            label.appendChild(texto);

            label.addEventListener('click', (e) => {
                // Impede clique duplo por borbulhamento do checkbox
                if (e.target.tagName !== 'INPUT') return; 
                
                // Toggle do ID da categoria
                filterState.categoriaId = input.checked ? id : null;
                
                // Desmarca os outros checkboxes
                document.querySelectorAll('input[name="categoria-vaga"]').forEach(cb => {
                    if (cb !== input) cb.checked = false;
                });

                syncStateGlobal();
                notifyChange();
            });

            categoriasList.appendChild(label);
        });
    }

    function syncTempoControls() {
        const selected = document.querySelector('input[name="tempo-postagem"]:checked');
        const unit = selected ? selected.value : 'dias';
        const isCustomDays = unit === 'dias';

        // Mapeia o valor para dias
        let totalDias = 365; // Padrão "Todos" / "Ano"
        if (unit === 'hoje') totalDias = 1;
        else if (unit === 'semana') totalDias = 7;
        else if (unit === 'mes') totalDias = 30;
        else if (isCustomDays) {
            totalDias = Number(range.value) || 7;
        }

        // Configurações do input range
        range.max = isCustomDays ? '365' : String(totalDias);
        if (!isCustomDays) {
            range.value = range.max;
        }

        filterState.dias = totalDias;
        maxText.textContent = range.value;
        unitText.textContent = isCustomDays ? 'dias' : unit;

        syncStateGlobal();
    }

    function syncStateGlobal() {
        if (window.seekVagasFilterState) {
            window.seekVagasFilterState.categoriaId = filterState.categoriaId;
            window.seekVagasFilterState.dias = filterState.dias;
        }
    }

    range.addEventListener('input', function () {
        maxText.textContent = range.value;
        const selectedTempo = document.querySelector('input[name="tempo-postagem"]:checked');
        if (selectedTempo && selectedTempo.value === 'dias') {
            syncTempoControls();
            notifyChange();
        }
    });

    unitRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            syncTempoControls();
            notifyChange();
        });
    });

    window.seekVagasFilterState = filterState;

    window.seekVagasRecarregar = function () {
        if (typeof window.seekVagasRecarregarLista === 'function') {
            window.seekVagasRecarregarLista();
        }
    };

    // Inicializa valores da tela
    syncTempoControls();

    // Carregar as categorias mais utilizadas da API
    fetch(ip_api + '/vagas/mais-utilizados', {
        method: "GET",
        credentials: "include" // Importante em rotas protegidas
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data) {
            renderCategorias(data.data);
        } else {
            setCategoriasStatus('Nenhuma categoria disponível.');
        }
    })
    .catch(error => {
        console.error("Erro ao carregar top categorias:", error);
        setCategoriasStatus('Não foi possível carregar as categorias.');
    });
});