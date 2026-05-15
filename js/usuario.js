document.addEventListener('DOMContentLoaded', function () {
    var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.usuario-tab'));
    var tabPanel = document.getElementById('usuarioTabPanel');

    if (!tabButtons.length || !tabPanel) {
        return;
    }

    var avatarImage = document.getElementById('usuarioAvatarImagem');
    var bannerImage = document.getElementById('usuarioBannerImagem');
    var menuButton = document.querySelector('.usuario-profile-card__menu');
    var menuPopover = document.getElementById('usuarioProfileMenu');

    if (bannerImage) {
        bannerImage.loading = 'eager';
        bannerImage.decoding = 'async';
    }

    if (avatarImage) {
        avatarImage.loading = 'eager';
        avatarImage.decoding = 'async';
    }

    function closeMenuPopover() {
        if (!menuButton || !menuPopover) {
            return;
        }

        menuPopover.hidden = true;
        menuButton.setAttribute('aria-expanded', 'false');
    }

    function openMenuPopover() {
        if (!menuButton || !menuPopover) {
            return;
        }

        menuPopover.hidden = false;
        menuButton.setAttribute('aria-expanded', 'true');
    }

    if (menuButton && menuPopover) {
        menuButton.addEventListener('click', function (event) {
            event.stopPropagation();

            if (menuPopover.hidden) {
                openMenuPopover();
                return;
            }

            closeMenuPopover();
        });

        menuPopover.addEventListener('click', function (event) {
            var target = event.target;

            if (target && target.classList && target.classList.contains('usuario-profile-card__menu-item')) {
                closeMenuPopover();
            }
        });

        document.addEventListener('click', function (event) {
            if (!menuPopover.contains(event.target) && event.target !== menuButton) {
                closeMenuPopover();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeMenuPopover();
            }
        });
    }

    function thumbnailSvg(options) {
        var width = 760;
        var height = 608;
        var accent = options.accent;
        var accentSoft = options.accentSoft;
        var secondary = options.secondary;
        var bg = options.bg;
        var text = options.text;
        var style = options.style;

        var svg = '' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '">' +
            '<defs>' +
            '<linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="' + bg[0] + '" />' +
            '<stop offset="100%" stop-color="' + bg[1] + '" />' +
            '</linearGradient>' +
            '<linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="' + accent + '" />' +
            '<stop offset="100%" stop-color="' + accentSoft + '" />' +
            '</linearGradient>' +
            '</defs>' +
            '<rect width="100%" height="100%" fill="url(#g1)" />' +
            '<circle cx="83" cy="82" r="66" fill="rgba(255,255,255,0.14)" />' +
            '<circle cx="670" cy="110" r="78" fill="rgba(255,255,255,0.1)" />' +
            '<rect x="44" y="56" width="214" height="168" rx="34" fill="' + secondary + '" opacity="0.9" />' +
            '<rect x="110" y="100" width="142" height="92" rx="20" fill="rgba(255,255,255,0.16)" />' +
            '<rect x="260" y="286" width="234" height="188" rx="28" fill="rgba(255,255,255,0.14)" />' +
            '<circle cx="388" cy="350" r="70" fill="' + accent + '" opacity="0.95" />' +
            '<rect x="474" y="86" width="184" height="150" rx="24" fill="rgba(255,255,255,0.88)" />' +
            '<rect x="512" y="118" width="102" height="86" rx="18" fill="' + accent + '" />' +
            '<path d="M62 454h170l42 52H20z" fill="rgba(0,0,0,0.16)" />' +
            '<path d="M574 418h144l42 70H534z" fill="rgba(255,255,255,0.18)" />' +
            '<rect x="564" y="270" width="134" height="134" rx="26" fill="rgba(255,255,255,0.12)" />' +
            '<circle cx="162" cy="154" r="42" fill="url(#g2)" />' +
            '<circle cx="584" cy="158" r="34" fill="url(#g2)" />' +
            '<g fill="rgba(255,255,255,0.88)">' +
            '<rect x="96" y="514" width="530" height="18" rx="9" opacity="0.34" />' +
            '<rect x="134" y="548" width="404" height="14" rx="7" opacity="0.22" />' +
            '</g>' +
            '<text x="50%" y="88%" fill="rgba(255,255,255,0.9)" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" text-anchor="middle" letter-spacing="1">' + text + '</text>' +
            '<style>' + style + '</style>' +
            '</svg>';

        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    var thumbnails = {
        purple: thumbnailSvg({
            accent: '#b5a8ff',
            accentSoft: '#6f5cff',
            secondary: '#23232f',
            bg: ['#7d6cff', '#b68cff'],
            text: 'BRAND / 3D',
            style: '.title{font:700 28px Arial}'
        }),
        dark: thumbnailSvg({
            accent: '#1dd7d7',
            accentSoft: '#0c9dc0',
            secondary: '#0e1117',
            bg: ['#0a0f14', '#151d2b'],
            text: 'LANDING',
            style: '.title{font:700 28px Arial}'
        }),
        green: thumbnailSvg({
            accent: '#3ecf66',
            accentSoft: '#23a94f',
            secondary: '#e8ece8',
            bg: ['#f3f5f2', '#dce7db'],
            text: 'STUDIO',
            style: '.title{font:700 28px Arial}'
        })
    };

    var tabs = {
        trabalhos: [
            {
                author: 'Nome do autor',
                rating: '80%',
                likes: '3,5mil',
                views: '3,5mil',
                image: thumbnails.purple
            },
            {
                author: 'Nome do autor',
                rating: '80%',
                likes: '3,5mil',
                views: '3,5mil',
                image: thumbnails.dark
            },
            {
                author: 'Nome do autor',
                rating: '80%',
                likes: '3,5mil',
                views: '3,5mil',
                image: thumbnails.green
            },
            {
                author: 'Nome do autor',
                rating: '80%',
                likes: '3,5mil',
                views: '3,5mil',
                image: thumbnails.purple
            },
            {
                author: 'Nome do autor',
                rating: '80%',
                likes: '3,5mil',
                views: '3,5mil',
                image: thumbnails.dark
            },
            {
                author: 'Nome do autor',
                rating: '80%',
                likes: '3,5mil',
                views: '3,5mil',
                image: thumbnails.green
            }
        ],
        cursos: [
            {
                author: 'Nome do autor',
                rating: '96%',
                likes: '1,8mil',
                views: '4,1mil',
                image: thumbnails.dark
            },
            {
                author: 'Nome do autor',
                rating: '94%',
                likes: '2,2mil',
                views: '5,3mil',
                image: thumbnails.purple
            },
            {
                author: 'Nome do autor',
                rating: '92%',
                likes: '1,6mil',
                views: '3,7mil',
                image: thumbnails.green
            }
        ],
        avaliacoes: [
            {
                author: 'Nome do autor',
                rating: '98%',
                likes: '4,9mil',
                views: '8,3mil',
                image: thumbnails.green
            },
            {
                author: 'Nome do autor',
                rating: '97%',
                likes: '4,1mil',
                views: '7,9mil',
                image: thumbnails.dark
            },
            {
                author: 'Nome do autor',
                rating: '95%',
                likes: '3,8mil',
                views: '6,5mil',
                image: thumbnails.purple
            }
        ]
    };

    function buildCard(item) {
        var article = document.createElement('article');
        article.className = 'usuario-work-card';
        article.innerHTML =
            '<div class="usuario-work-card__media">' +
            '<img src="' + item.image + '" alt="Projeto de ' + item.author + '">' +
            '</div>' +
            '<div class="usuario-work-card__info">' +
            '<div class="usuario-work-card__author"><img src="img/icons/usuario.svg" alt="" aria-hidden="true"><span>' + item.author + '</span></div>' +
            '<div class="usuario-work-card__metrics">' +
            '<span class="usuario-work-card__metric"><img src="img/icons/estrela.svg" alt="" aria-hidden="true">' + item.rating + '</span>' +
            '<span class="usuario-work-card__metric"><img src="img/icons/like.svg" alt="" aria-hidden="true">' + item.likes + '</span>' +
            '<span class="usuario-work-card__metric"><img src="img/icons/olho.svg" alt="" aria-hidden="true">' + item.views + '</span>' +
            '</div>' +
            '</div>';

        return article;
    }

    function renderTab(tabKey) {
        var items = tabs[tabKey] || [];
        tabPanel.innerHTML = '';

        if (!items.length) {
            var empty = document.createElement('p');
            empty.className = 'usuario-empty-state';
            empty.textContent = 'Nenhum conteúdo disponível para esta aba.';
            tabPanel.appendChild(empty);
            return;
        }

        var grid = document.createElement('div');
        grid.className = 'usuario-projects-grid';

        items.forEach(function (item) {
            grid.appendChild(buildCard(item));
        });

        tabPanel.appendChild(grid);
    }

    function setActiveTab(tabKey) {
        tabButtons.forEach(function (button) {
            var isActive = button.dataset.tab === tabKey;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            button.tabIndex = isActive ? 0 : -1;
        });

        renderTab(tabKey);
    }

    tabButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            setActiveTab(button.dataset.tab);
        });
    });

    setActiveTab('trabalhos');
});
