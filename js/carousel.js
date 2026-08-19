document.addEventListener('DOMContentLoaded', function () {
    var track = document.getElementById('categoriesTrack');
    var prev = document.querySelector('.carousel-btn.prev');
    var next = document.querySelector('.carousel-btn.next');
    var cores = [
        ['#1b1b1b', '#2f2f2f'],
        ['#2d2a4a', '#5c4d7d'],
        ['#444', '#6a6a6a'],
        ['#3a3f47', '#6d727c'],
        ['#5b3300', '#9a5c0b'],
        ['#2c2c2c', '#555'],
        ['#303030', '#4d4d4d'],
        ['#262626', '#404040']
    ];

    if (!track || !prev || !next) {
        return;
    }

    function getCorCategoria(index) {
        return cores[index % cores.length];
    }

    function setCategoriaAtiva(botaoAtivo) {
        track.querySelectorAll('.category-card').forEach(function (botao) {
            botao.classList.toggle('is-active', botao === botaoAtivo);
        });
    }

    function criarCardTodos() {
        var cor = getCorCategoria(0);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'category-card is-active';
        btn.style.background = 'linear-gradient(135deg, ' + cor[0] + ', ' + cor[1] + ')';
        btn.setAttribute('aria-label', 'Ver todos os posts');
        btn.innerHTML = '<span>Todos</span>';
        btn.addEventListener('click', function () {
            setCategoriaAtiva(btn);
            if (typeof window.seekCarregarPosts === 'function') {
                window.seekCarregarPosts('/posts');
            }
        });

        return btn;
    }

    function criarCardCategoria(categoria, index) {
        // ATUALIZAÇÃO: Buscando as chaves corretas do novo JSON ('nome' e 'total_usos')
        var nome = categoria.nome || 'Categoria';
        var totalUsos = Number(categoria.total_usos) || 0;
        var cor = getCorCategoria(index);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'category-card';
        btn.style.background = 'linear-gradient(135deg, ' + cor[0] + ', ' + cor[1] + ')';
        btn.setAttribute('aria-label', 'Ver categoria ' + nome);

        // Atualizado para refletir usos/posts no hover do botão
        btn.title = nome + ' (' + totalUsos + ' usos)';
        btn.innerHTML = '<span>' + nome + '</span>';

        btn.addEventListener('click', function () {
            setCategoriaAtiva(btn);
            if (typeof window.seekCarregarPosts === 'function') {
                // ATUALIZADO: Agora aponta para a nova rota da API
                window.seekCarregarPosts('/posts/categoria/' + encodeURIComponent(categoria.id));
            }
        });

        return btn;
    }

    function updateButtons() {
        var maxScroll = track.scrollWidth - track.clientWidth - 1;
        prev.classList.toggle('disabled', track.scrollLeft <= 0);
        next.classList.toggle('disabled', track.scrollLeft >= maxScroll);
    }

    function renderizarCategorias(categorias) {
        track.innerHTML = '';
        track.appendChild(criarCardTodos());

        categorias.forEach(function (categoria, index) {
            // ATUALIZAÇÃO: Verificando 'id' em vez de 'id_categoria'
            if (categoria && categoria.id != null) {
                track.appendChild(criarCardCategoria(categoria, index + 1));
            }
        });

        updateButtons();
    }

    async function carregarCategorias() {
        track.innerHTML = '<span class="category-card" aria-hidden="true">Carregando...</span>';
        updateButtons();

        try {
            // ATUALIZAÇÃO: Requisição para a nova rota
            var response = await fetch(ip_api + '/categorias/populares', {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar categorias');
            }

            var responseData = await response.json();

            // ATUALIZAÇÃO: Lendo 'success' e passando o array de 'data'
            if (responseData.success && Array.isArray(responseData.data)) {
                renderizarCategorias(responseData.data);
            } else {
                throw new Error(responseData.message || 'Estrutura de dados inválida');
            }
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            track.innerHTML = '<span class="category-card" aria-hidden="true">Categorias indisponíveis</span>';
            updateButtons();
        }
    }

    function getScrollStep() {
        var cards = Array.from(track.querySelectorAll('.category-card'));
        if (!cards.length) {
            return 0;
        }

        var styles = window.getComputedStyle(track);
        var gap = parseFloat(styles.columnGap || styles.gap || '0');
        var cardWidth = cards[0].offsetWidth + gap;
        var visibleCards = window.innerWidth < 768 ? 2 : 4;
        return cardWidth * visibleCards;
    }

    prev.addEventListener('click', function () {
        track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });

    next.addEventListener('click', function () {
        track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);

    // Inicializa a requisição
    carregarCategorias();

    // CAIXA DE BEM VINDO

    function toggleDef() {
        const ativo = document.getElementById('def-sim').checked;
        document.getElementById('def-nao').checked = !ativo;

        document.querySelectorAll('.tipo-cb').forEach(cb => cb.disabled = !ativo);
        document.querySelectorAll('.tipo-label').forEach(el => {
            el.style.color = ativo ? '#374151' : '#9ca3af';
        });
        document.getElementById('qual-select').disabled = !ativo;
    }

    function toggleNao() {
        const nao = document.getElementById('def-nao').checked;
        document.getElementById('def-sim').checked = !nao;
        toggleDef();
    }
});
