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
    var artesCategoria = [
        { termos: ['fotografia', 'foto'], imagem: '../img/categories/fotografia.png', posicao: 'center 48%' },
        { termos: ['3d', 'animacao', 'game art', 'render'], imagem: '../img/categories/arte-3d.png', posicao: 'center 46%' },
        { termos: ['ui', 'ux'], imagem: '../img/categories/ui-ux.png', posicao: 'center 52%' },
        { termos: ['produto', 'arquitetura'], imagem: '../img/categories/design-produtos.png', posicao: 'center 52%' },
        { termos: ['moda'], imagem: '../img/categories/moda.png', posicao: 'center 46%' },
        {
            termos: ['todos', 'design', 'desenho', 'branding', 'marca', 'logotipo', 'tipografia', 'lettering', 'ilustracao', 'concept', 'urbano', 'storyboard', 'motion', 'editorial', 'direcao de arte'],
            imagem: '../img/categories/design-grafico.png',
            posicao: 'center 48%'
        }
    ];

    if (!track || !prev || !next) {
        return;
    }

    function getCorCategoria(index) {
        return cores[index % cores.length];
    }

    function normalizarCategoria(nome) {
        return String(nome || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function aplicarArteCategoria(botao, nome, cor) {
        var nomeNormalizado = normalizarCategoria(nome);
        var arte = artesCategoria.find(function (item) {
            return item.termos.some(function (termo) {
                return nomeNormalizado.indexOf(termo) !== -1;
            });
        });

        botao.style.setProperty('--category-fallback', 'linear-gradient(135deg, ' + cor[0] + ', ' + cor[1] + ')');

        if (arte) {
            botao.style.setProperty('--category-image', 'url("' + arte.imagem + '")');
            botao.style.setProperty('--category-position', arte.posicao);
        }
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
        aplicarArteCategoria(btn, 'Todos', cor);
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
        aplicarArteCategoria(btn, nome, cor);
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

        var categoriasComPosts = categorias.filter(function (categoria) {
            if (!categoria || categoria.id == null) return false;

            var quantidade = categoria.total_usos ?? categoria.total_posts ?? categoria.quantidade_posts ?? categoria.posts_count;
            // Sem contagem explícita, preserva compatibilidade com respostas antigas da API.
            return quantidade == null || Number(quantidade) > 0;
        });

        categoriasComPosts.forEach(function (categoria, index) {
            // ATUALIZAÇÃO: Verificando 'id' em vez de 'id_categoria'
            track.appendChild(criarCardCategoria(categoria, index + 1));
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
