document.addEventListener('DOMContentLoaded', function () {
    var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.usuario-tab'));
    var tabPanel = document.getElementById('usuarioTabPanel');
    var currentTabKey = 'trabalhos';

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
        vagas: [
            {
                chip: 'Design gráfico',
                tempo: 'Há 5 horas',
                titulo: 'Título da vaga',
                autor: 'Nome do autor',
                local: 'chiquichiqui, Bahia',
                descricao: 'Uma descrição breve do que se trata a vaga em questão, tendo suas principais informações necessárias para o usuário poder se interessar',
                salario: 'R$ 1000 - 1500 mês',
                views: '3,5mil'
            },
            {
                chip: 'UI/UX Design',
                tempo: 'Há 2 dias',
                titulo: 'Vaga para design de produto',
                autor: 'Nome do autor',
                local: 'São Paulo, SP',
                descricao: 'Uma vaga focada em interface, experiência do usuário e prototipação visual para times de produto.',
                salario: 'R$ 2000 - 2800 mês',
                views: '2,1mil'
            },
            {
                chip: 'Branding',
                tempo: 'Há 1 semana',
                titulo: 'Direção de arte para marca',
                autor: 'Nome do autor',
                local: 'Curitiba, PR',
                descricao: 'Projeto para criação e manutenção de identidade visual com foco em campanhas e comunicação.',
                salario: 'R$ 3000 - 4500 mês',
                views: '1,4mil'
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

    function normalizeTabKey(tabKey) {
        if (tabKey === 'Posts') {
            return 'trabalhos';
        }

        return tabKey;
    }

    function getPostImage(post) {
        if (Array.isArray(post.imagens) && post.imagens.length > 0) {
            return post.imagens[0];
        }

        return 'img/logo.png';
    }

    function getPostAuthor(post) {
        return post.user && post.user.nome ? post.user.nome : 'Usuário';
    }

    function getPostAuthorPhoto(post) {
        return post.user && post.user.foto ? post.user.foto : 'img/userProfile.png';
    }

    function getRelativeTime(value) {
        if (!value) {
            return '';
        }

        var date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        var diffMs = Date.now() - date.getTime();
        if (diffMs < 0) {
            diffMs = 0;
        }

        var seconds = Math.floor(diffMs / 1000);
        if (seconds < 60) {
            return 'agora mesmo';
        }

        var minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return minutes === 1 ? 'há 1 minuto' : 'há ' + minutes + ' minutos';
        }

        var hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return hours === 1 ? 'há 1 hora' : 'há ' + hours + ' horas';
        }

        var days = Math.floor(hours / 24);
        if (days < 30) {
            return days === 1 ? 'há 1 dia' : 'há ' + days + ' dias';
        }

        var months = Math.floor(days / 30);
        if (months < 12) {
            return months === 1 ? 'há 1 mês' : 'há ' + months + ' meses';
        }

        var years = Math.floor(months / 12);
        return years === 1 ? 'há 1 ano' : 'há ' + years + ' anos';
    }

    function formatDate(value) {
        if (!value) {
            return '';
        }

        var date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    function buildFeedCard(post) {
        var article = document.createElement('article');
        article.className = 'feedCard';
        article.dataset.postId = String(post.id);

        article.tabIndex = 0;
        article.setAttribute('role', 'button');
        article.setAttribute('aria-label', 'Abrir post ' + (post.titulo || ''));

        function openPostModalFromProfile() {
            if (typeof window.seekOpenPostModal !== 'function') {
                return;
            }
            window.seekOpenPostModal(post);
        }

        article.addEventListener('click', function () {
            openPostModalFromProfile();
        });

        article.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPostModalFromProfile();
            }
        });

        article.innerHTML =
            '<div class="feedImg">' +
            '<img src="' + getPostImage(post) + '" alt="' + (post.titulo || 'Post') + '">' +
            '</div>' +
            '<div class="infoPost">' +
            '<div class="feedInfoLeft">' +
            '<span class="feedPostTitle">' + (post.titulo || 'Sem título') + '</span>' +
            '<div class="logoName">' +
            '<img class="logoUser" src="' + getPostAuthorPhoto(post) + '" alt="' + getPostAuthor(post) + '">' +
            '<span class="userName">' + getPostAuthor(post) + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="likeView">' +
            '<span class="feedPostTime">' + (getRelativeTime(post.criado_em) || formatDate(post.criado_em)) + '</span>' +
            '</div>' +
            '</div>';

        return article;
    }

    function buildVagaCard(vaga) {
        var article = document.createElement('article');
        article.className = 'vaga-card';
        article.innerHTML =
            '<div class="vaga-card__topo">' +
            '<span class="vaga-card__chip">' + (vaga.chip || 'Vaga') + '</span>' +
            '<span class="vaga-card__tempo">' + (vaga.tempo || '') + '</span>' +
            '</div>' +
            '<h3>' + (vaga.titulo || 'Título da vaga') + '</h3>' +
            '<div class="vaga-card__meta">' +
            '<span class="vaga-card__autor"><img src="img/userProfilepreto.png" alt="" aria-hidden="true">' + (vaga.autor || 'Usuário') + '</span>' +
            '<span class="vaga-card__local"><img src="img/icons/local.svg" alt="" aria-hidden="true">' + (vaga.local || '') + '</span>' +
            '</div>' +
            '<p>' + (vaga.descricao || '') + '</p>' +
            '<div class="vaga-card__rodape">' +
            '<span class="vaga-card__salario">' + (vaga.salario || '') + '</span>' +
            '<span class="vaga-card__views">' + (vaga.views || '') + ' <img src="img/icons/olho.svg" alt="" aria-hidden="true"></span>' +
            '</div>';

        return article;
    }

    function renderPostsTab(posts) {
        var listaPosts = Array.isArray(posts) ? posts : [];

        tabPanel.innerHTML = '';

        if (window.usuarioPerfilPostsLoading) {
            tabPanel.innerHTML = '<p class="usuario-empty-state">Carregando posts...</p>';
            return;
        }

        if (!listaPosts.length) {
            tabPanel.innerHTML = '<p class="usuario-empty-state">Nenhum post disponível para este perfil.</p>';
            return;
        }

        var grid = document.createElement('div');
        grid.className = 'feedImgs usuario-feedImgs';

        listaPosts.forEach(function (post) {
            grid.appendChild(buildFeedCard(post));
        });

        tabPanel.appendChild(grid);
    }

    function renderTab(tabKey) {
        var normalizedTabKey = normalizeTabKey(tabKey);

        if (normalizedTabKey === 'trabalhos') {
            renderPostsTab(window.usuarioPerfilPosts || []);
            return;
        }

        if (normalizedTabKey === 'vagas') {
            var vagasItems = tabs.vagas || [];
            tabPanel.innerHTML = '';

            if (!vagasItems.length) {
                tabPanel.innerHTML = '<p class="usuario-empty-state">Nenhuma vaga disponível para este perfil.</p>';
                return;
            }

            var vagasGrid = document.createElement('div');
            vagasGrid.className = 'vagas-grid';

            vagasItems.forEach(function (vaga) {
                vagasGrid.appendChild(buildVagaCard(vaga));
            });

            tabPanel.appendChild(vagasGrid);
            return;
        }

        var items = tabs[normalizedTabKey] || [];
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
        currentTabKey = tabKey;
        var normalizedTabKey = normalizeTabKey(tabKey);

        tabButtons.forEach(function (button) {
            var isActive = button.dataset.tab === tabKey;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            button.tabIndex = isActive ? 0 : -1;
        });

        renderTab(normalizedTabKey);
    }

    window.usuarioPerfilPosts = Array.isArray(window.usuarioPerfilPosts) ? window.usuarioPerfilPosts : [];
    window.usuarioPerfilPostsLoading = !!window.usuarioPerfilPostsLoading;
    window.renderUsuarioPerfilPosts = function (posts) {
        window.usuarioPerfilPosts = Array.isArray(posts) ? posts : [];
        window.usuarioPerfilPostsLoading = false;

        if (normalizeTabKey(currentTabKey) === 'trabalhos') {
            renderTab('trabalhos');
        }
    };

    tabButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            setActiveTab(button.dataset.tab);
        });
    });

    setActiveTab('Posts');
});
