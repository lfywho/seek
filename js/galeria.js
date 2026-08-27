document.addEventListener('DOMContentLoaded', function () {
    var categorias = document.querySelectorAll('[data-gallery-category]');
    var cards = document.querySelectorAll('.galeria-card');
    var cores = document.querySelectorAll('.galeria-cor');
    var filtroToggle = document.querySelector('.galeria-filtros__toggle');
    var filtrosConteudo = document.getElementById('galeriaFiltrosConteudo');
    var categoriaTrack = document.getElementById('galeriaCategorias');
    var botoesScroll = document.querySelectorAll('[data-gallery-scroll]');

    categorias.forEach(function (categoria) {
        categoria.addEventListener('click', function () {
            categorias.forEach(function (item) {
                item.classList.toggle('is-active', item === categoria);
                item.setAttribute('aria-pressed', item === categoria ? 'true' : 'false');
            });
        });
    });

    cards.forEach(function (card) {
        var salvar = card.querySelector('.galeria-card__save');

        if (!salvar) {
            return;
        }

        salvar.addEventListener('click', function () {
            var salvo = salvar.getAttribute('aria-pressed') === 'true';
            salvar.setAttribute('aria-pressed', salvo ? 'false' : 'true');
            salvar.classList.toggle('is-saved', !salvo);
        });
    });

    cores.forEach(function (cor) {
        cor.addEventListener('click', function () {
            var selecionada = cor.getAttribute('aria-pressed') === 'true';

            cores.forEach(function (item) {
                item.classList.remove('is-active');
                item.setAttribute('aria-pressed', 'false');
            });

            if (!selecionada) {
                cor.classList.add('is-active');
                cor.setAttribute('aria-pressed', 'true');
            }
        });
    });

    if (filtroToggle && filtrosConteudo) {
        filtroToggle.addEventListener('click', function () {
            var aberto = filtroToggle.getAttribute('aria-expanded') === 'true';
            filtroToggle.setAttribute('aria-expanded', aberto ? 'false' : 'true');
            filtrosConteudo.hidden = aberto;
        });
    }

    if (categoriaTrack) {
        botoesScroll.forEach(function (botao) {
            botao.addEventListener('click', function () {
                var direcao = botao.dataset.galleryScroll === 'previous' ? -1 : 1;
                categoriaTrack.scrollBy({
                    left: direcao * Math.max(220, categoriaTrack.clientWidth * 0.56),
                    behavior: 'smooth'
                });
            });
        });
    }
});
