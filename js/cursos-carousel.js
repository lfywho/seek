document.addEventListener('DOMContentLoaded', function () {
    var categorias = [
        { nome: 'Fotografia', cor: ['#1f1f1f', '#2e2e2e'] },
        { nome: 'Arte 3D', cor: ['#3a3954', '#56556c'] },
        { nome: 'Design gráfico', cor: ['#595959', '#777777'] },
        { nome: 'UI/UX', cor: ['#4b4f54', '#767b81'] },
        { nome: 'Design de produtos', cor: ['#5b3808', '#9a6118'] },
        { nome: 'Moda', cor: ['#3d3932', '#5b574f'] },
        { nome: 'Concept art', cor: ['#3f3f3f', '#585858'] },
        { nome: 'Urbano', cor: ['#292929', '#434343'] },
        { nome: 'Arquitetura', cor: ['#474747', '#676767'] },
        { nome: 'Branding', cor: ['#38504f', '#4a6564'] },
        { nome: 'Marca', cor: ['#253a68', '#365895'] },
        { nome: 'Logotipo', cor: ['#080808', '#242424'] },
        { nome: 'Ilustração', cor: ['#2c2c3a', '#4c4c69'] },
        { nome: 'Tipografia', cor: ['#1f1f1f', '#3b3b3b'] },
        { nome: 'Motion', cor: ['#2a2a2a', '#4f4f4f'] },
        { nome: 'Animação', cor: ['#1d2f3d', '#33546b'] },
        { nome: 'Editorial', cor: ['#44403a', '#6e675d'] },
        { nome: 'Game Art', cor: ['#1f273f', '#354066'] },
        { nome: 'Storyboard', cor: ['#3f3429', '#6b553f'] },
        { nome: 'Lettering', cor: ['#362a2a', '#5b4444'] },
        { nome: 'Render', cor: ['#2e3b3f', '#51656b'] },
        { nome: 'Produto', cor: ['#3f2f1f', '#6a5032'] },
        { nome: 'Direção de arte', cor: ['#2f2f2f', '#505050'] }
    ];
    var artesCategoria = [
        { termos: ['fotografia', 'foto'], imagem: '../img/categories/fotografia.png', posicao: 'center 48%' },
        { termos: ['3d', 'animacao', 'game art', 'render'], imagem: '../img/categories/arte-3d.png', posicao: 'center 46%' },
        { termos: ['ui', 'ux'], imagem: '../img/categories/ui-ux.png', posicao: 'center 52%' },
        { termos: ['produto', 'arquitetura'], imagem: '../img/categories/design-produtos.png', posicao: 'center 52%' },
        { termos: ['moda'], imagem: '../img/categories/moda.png', posicao: 'center 46%' },
        {
            termos: ['design', 'desenho', 'branding', 'marca', 'logotipo', 'tipografia', 'lettering', 'ilustracao', 'concept', 'urbano', 'storyboard', 'motion', 'editorial', 'direcao de arte'],
            imagem: '../img/categories/design-grafico.png',
            posicao: 'center 48%'
        }
    ];

    var track = document.getElementById('categoriesTrack');
    if (!track) {
        return;
    }

    function normalizarCategoria(nome) {
        return String(nome || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function aplicarArteCategoria(card, categoria) {
        var nomeNormalizado = normalizarCategoria(categoria.nome);
        var arte = artesCategoria.find(function (item) {
            return item.termos.some(function (termo) {
                return nomeNormalizado.indexOf(termo) !== -1;
            });
        });

        card.style.setProperty('--category-fallback', 'linear-gradient(135deg, ' + categoria.cor[0] + ', ' + categoria.cor[1] + ')');

        if (arte) {
            card.style.setProperty('--category-image', 'url("' + arte.imagem + '")');
            card.style.setProperty('--category-position', arte.posicao);
        }
    }

    categorias.forEach(function (categoria) {
        var card = document.createElement('button');
        card.className = 'category-card';
        card.type = 'button';
        aplicarArteCategoria(card, categoria);
        card.setAttribute('aria-label', 'Filtrar por ' + categoria.nome);
        card.innerHTML = '<span>' + categoria.nome + '</span>';
        track.appendChild(card);
    });

    var prev = document.querySelector('.carousel-btn.prev');
    var next = document.querySelector('.carousel-btn.next');
    var cards = Array.from(track.querySelectorAll('.category-card'));

    if (!prev || !next || cards.length === 0) {
        return;
    }

    function getScrollStep() {
        var styles = window.getComputedStyle(track);
        var gap = parseFloat(styles.columnGap || styles.gap || '0');
        var cardWidth = cards[0].offsetWidth + gap;
        var visibleCards = window.innerWidth < 768 ? 2 : 5;
        return cardWidth * visibleCards;
    }

    function updateButtons() {
        var maxScroll = track.scrollWidth - track.clientWidth - 1;
        prev.classList.toggle('disabled', track.scrollLeft <= 0);
        next.classList.toggle('disabled', track.scrollLeft >= maxScroll);
    }

    prev.addEventListener('click', function () {
        track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });

    next.addEventListener('click', function () {
        track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    updateButtons();
});
