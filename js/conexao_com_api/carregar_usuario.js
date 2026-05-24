document.addEventListener('DOMContentLoaded', function () {
    var aside = document.querySelector('.usuario-profile-card');
    var bannerImage = document.getElementById('usuarioBannerImagem');
    var avatarImage = document.getElementById('usuarioAvatarImagem');
    var nomeElement = document.querySelector('.usuario-profile-card__header h1');
    var usuarioElement = document.querySelector('.usuario-profile-card__header p');
    var descricaoElement = document.querySelector('.usuario-profile-card__description');
    var statsValues = document.querySelectorAll('.usuario-profile-card__stats dd');
    var statsButtons = document.querySelectorAll('.usuario-profile-card__stats button');
    var tabPanel = document.getElementById('usuarioTabPanel');
    var vagasTabButton = document.querySelector('.usuario-tab[data-tab="vagas"]');
    var seguirContainer = document.getElementById('container-seguir-mensagem');
    var seguirButton = seguirContainer ? seguirContainer.querySelector('.usuario-btn--primary') : null;
    var mensagemButton = seguirContainer ? seguirContainer.querySelector('.usuario-btn--secondary') : null;
    var usuarioLogado = getUsuarioLogado();
    var idUsuarioLogado = usuarioLogado && usuarioLogado.id ? String(usuarioLogado.id) : null;
    var idUsuarioPaginaAtual = null;
    var estaSeguindoUsuario = false;
    var modalRelacionamentos = null;
    var modalRelacionamentosTitle = null;
    var modalRelacionamentosList = null;
    var modalRelacionamentosEmpty = null;
    var modalRelacionamentosCloseButton = null;
    var relacionamentoEmExibicao = null;

    if (!aside || !bannerImage || !avatarImage || !nomeElement || !usuarioElement || !descricaoElement || !statsValues.length) {
        return;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function criarModalRelacionamentos() {
        if (modalRelacionamentos) {
            return;
        }

        var modal = document.createElement('div');
        modal.className = 'usuario-relacionamentos-modal';
        modal.hidden = true;
        modal.innerHTML =
            '<div class="usuario-relacionamentos-modal__overlay" data-close-relacionamentos></div>' +
            '<section class="usuario-relacionamentos-modal__content" role="dialog" aria-modal="true" aria-labelledby="usuarioRelacionamentosTitle">' +
            '<button type="button" class="usuario-relacionamentos-modal__close" aria-label="Fechar modal" data-close-relacionamentos>&times;</button>' +
            '<h2 id="usuarioRelacionamentosTitle" class="usuario-relacionamentos-modal__title">Seguidores</h2>' +
            '<div class="usuario-relacionamentos-modal__list" id="usuarioRelacionamentosList"></div>' +
            '<p class="usuario-relacionamentos-modal__empty" id="usuarioRelacionamentosEmpty" hidden>Nenhum usuário encontrado.</p>' +
            '</section>';

        document.body.appendChild(modal);

        modalRelacionamentos = modal;
        modalRelacionamentosTitle = modal.querySelector('#usuarioRelacionamentosTitle');
        modalRelacionamentosList = modal.querySelector('#usuarioRelacionamentosList');
        modalRelacionamentosEmpty = modal.querySelector('#usuarioRelacionamentosEmpty');
        modalRelacionamentosCloseButton = modal.querySelector('.usuario-relacionamentos-modal__close');

        modal.addEventListener('click', function (event) {
            if (event.target && event.target.hasAttribute('data-close-relacionamentos')) {
                fecharModalRelacionamentos();
            }
        });

        modalRelacionamentosCloseButton.addEventListener('click', fecharModalRelacionamentos);

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modalRelacionamentos && !modalRelacionamentos.hidden) {
                fecharModalRelacionamentos();
            }
        });
    }

    function abrirModalRelacionamentos(titulo) {
        criarModalRelacionamentos();

        relacionamentoEmExibicao = titulo;
        modalRelacionamentosTitle.textContent = titulo;
        modalRelacionamentos.hidden = false;
        document.body.classList.add('usuario-relacionamentos-aberto');
        document.documentElement.classList.add('usuario-relacionamentos-aberto');
    }

    function fecharModalRelacionamentos() {
        if (!modalRelacionamentos) {
            return;
        }

        modalRelacionamentos.hidden = true;
        relacionamentoEmExibicao = null;
        document.body.classList.remove('usuario-relacionamentos-aberto');
        document.documentElement.classList.remove('usuario-relacionamentos-aberto');
    }

    function renderizarRelacionamentos(lista) {
        if (!modalRelacionamentosList || !modalRelacionamentosEmpty) {
            return;
        }

        var usuarios = Array.isArray(lista) ? lista : [];
        modalRelacionamentosList.innerHTML = '';

        if (!usuarios.length) {
            modalRelacionamentosEmpty.hidden = false;
            modalRelacionamentosEmpty.textContent = 'Nenhum usuário encontrado.';
            return;
        }

        modalRelacionamentosEmpty.hidden = true;

        usuarios.forEach(function (usuario) {
            var link = document.createElement('a');
            link.className = 'usuario-relacionamentos-modal__item';
            link.href = 'usuario.html?id=' + encodeURIComponent(usuario.id);
            link.innerHTML =
                '<img class="usuario-relacionamentos-modal__avatar" src="' + escapeHtml(usuario.foto || 'img/userProfile.png') + '" alt="Foto de ' + escapeHtml(usuario.nome || 'Usuário') + '">' +
                '<span class="usuario-relacionamentos-modal__nome">' + escapeHtml(usuario.nome || 'Usuário') + '</span>';

            link.addEventListener('click', function () {
                fecharModalRelacionamentos();
            });

            modalRelacionamentosList.appendChild(link);
        });
    }

    async function carregarRelacionamentos(tipoRelacionamento) {
        if (!idUsuarioPaginaAtual) {
            return;
        }

        criarModalRelacionamentos();
        abrirModalRelacionamentos(tipoRelacionamento === 'seguindo' ? 'Seguindo' : 'Seguidores');
        modalRelacionamentosEmpty.hidden = false;
        modalRelacionamentosEmpty.textContent = 'Carregando...';
        modalRelacionamentosList.innerHTML = '';

        var endpoint = tipoRelacionamento === 'seguindo'
            ? '/usuarios/lista-seguindo/' + encodeURIComponent(idUsuarioPaginaAtual)
            : '/usuarios/lista-seguidores/' + encodeURIComponent(idUsuarioPaginaAtual);

        try {
            var response = await fetch(ip_api + endpoint);

            if (!response.ok) {
                throw new Error('Falha ao carregar relacionamentos');
            }

            var lista = await response.json();
            renderizarRelacionamentos(lista);
        } catch (error) {
            console.error(error);
            modalRelacionamentosEmpty.hidden = false;
            modalRelacionamentosEmpty.textContent = 'Nao foi possivel carregar a lista.';
        }
    }

    function getIdUsuarioPagina() {
        var params = new URLSearchParams(window.location.search);
        var idUser = params.get('iduser') || params.get('id');

        if (idUser) {
            return idUser;
        }

        if (idUsuarioLogado) {
            return idUsuarioLogado;
        }

        return null;
    }

    function atualizarBotaoSeguir() {
        if (!seguirButton) {
            return;
        }

        seguirButton.textContent = estaSeguindoUsuario ? 'Deixar de seguir' : 'Seguir';
        seguirButton.classList.toggle('is-following', estaSeguindoUsuario);
        seguirButton.setAttribute('aria-pressed', estaSeguindoUsuario ? 'true' : 'false');
    }

    function ajustarTotalSeguidores(delta) {
        if (!statsValues[0]) {
            return;
        }

        var atual = parseInt(statsValues[0].textContent, 10);
        if (Number.isNaN(atual)) {
            atual = 0;
        }

        var novoTotal = atual + delta;
        if (novoTotal < 0) {
            novoTotal = 0;
        }

        statsValues[0].textContent = String(novoTotal);
    }

    function esconderAcoesDoProprioPerfil(isProprioPerfil) {
        if (!seguirContainer) {
            return;
        }

        seguirContainer.style.display = isProprioPerfil ? 'none' : '';
        if (mensagemButton) {
            mensagemButton.style.display = isProprioPerfil ? 'none' : '';
        }

        var menuPopover = document.querySelector('.usuario-profile-card__menu-popover');
        if (menuPopover) {
            var itens = menuPopover.children;

            if (itens[0]) {
                itens[0].style.display = isProprioPerfil ? 'none' : '';
            }

            if (itens[1]) {
                itens[1].style.display = isProprioPerfil ? 'none' : '';
            }
        }
    }

    async function verificarSeSegueUsuario(idLogado, idPagina) {
        var response = await fetch(ip_api + '/usuarios/verificarsesegue/' + encodeURIComponent(idLogado) + '/' + encodeURIComponent(idPagina));

        if (!response.ok) {
            throw new Error('Falha ao verificar se segue o usuario');
        }

        var data = await response.json();
        return !!(data && data.segue);
    }

    async function alternarSeguimentoUsuario(idLogado, idPagina) {
        var response = await fetch(ip_api + '/usuarios/seguir-usuario/' + encodeURIComponent(idLogado) + '/' + encodeURIComponent(idPagina), {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Falha ao alternar seguimento');
        }

        return response.json();
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

    function renderPostsUsuario(posts) {
        var listaPosts = Array.isArray(posts) ? posts : [];

        window.usuarioPerfilPosts = listaPosts;
        window.usuarioPerfilPostsLoading = false;

        if (typeof window.renderUsuarioPerfilPosts === 'function') {
            window.renderUsuarioPerfilPosts(listaPosts);
            return;
        }

        if (!tabPanel) {
            return;
        }

        tabPanel.innerHTML = '';

        if (!listaPosts.length) {
            tabPanel.innerHTML = '<p class="usuario-empty-state">Nenhum conteúdo disponível para esta aba.</p>';
            return;
        }

        var grid = document.createElement('div');
        grid.className = 'feedImgs';

        listaPosts.forEach(function (post) {
            var article = document.createElement('article');
            article.className = 'feedCard';
            article.dataset.postId = String(post.id);

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

            grid.appendChild(article);
        });

        tabPanel.appendChild(grid);
    }

    async function carregarPostsDoUsuario(idUsuario) {
        if (!idUsuario) {
            window.usuarioPerfilPosts = [];
            window.usuarioPerfilPostsLoading = false;
            renderPostsUsuario([]);
            return;
        }

        window.usuarioPerfilPostsLoading = true;

        if (tabPanel) {
            tabPanel.innerHTML = '<p class="usuario-empty-state">Carregando posts...</p>';
        }

        try {
            var response = await fetch(ip_api + '/posts/usuario/' + idUsuario);

            if (!response.ok) {
                throw new Error('Falha ao carregar posts do usuário');
            }

            var posts = await response.json();
            renderPostsUsuario(posts);
        } catch (error) {
            window.usuarioPerfilPosts = [];
            window.usuarioPerfilPostsLoading = false;

            if (tabPanel) {
                tabPanel.innerHTML = '<p class="usuario-empty-state">Nao foi possivel carregar os posts.</p>';
            }

            console.error(error);
        }
    }

    function aplicarDadosNoAside(usuario) {
        var nome = usuario.nome || 'Nome do Usuário';
        var nomeUsuario = usuario.nome_de_usuario || '';
        var descricao = usuario.descricao || 'Este usuário ainda não adicionou uma descrição.';
        var foto = usuario.foto || 'img/userProfile.png';
        var banner = usuario.banner || 'img/bannervagas.jpg';
        var tipoUsuario = String(usuario.tipo_usuario || usuario.tipo || '').toLowerCase();

        bannerImage.src = banner;
        bannerImage.alt = 'Banner de ' + nome;
        avatarImage.src = foto;
        avatarImage.alt = 'Foto de perfil de ' + nome;
        nomeElement.textContent = nome;
        usuarioElement.textContent = nomeUsuario ? '@' + nomeUsuario : 'Perfil do usuário';
        descricaoElement.textContent = descricao;

        if (statsValues[0]) {
            statsValues[0].textContent = String(usuario.total_seguidores ?? 0);
        }

        if (statsValues[1]) {
            statsValues[1].textContent = String(usuario.total_seguindo ?? 0);
        }

        if (statsValues[2]) {
            statsValues[2].textContent = String(usuario.total_posts ?? 0);
        }

        if (vagasTabButton) {
            vagasTabButton.style.display = tipoUsuario === 'padrao' ? 'none' : '';
        }
    }

    if (statsButtons.length >= 2) {
        statsButtons[0].addEventListener('click', function () {
            carregarRelacionamentos('seguidores');
        });

        statsButtons[1].addEventListener('click', function () {
            carregarRelacionamentos('seguindo');
        });
    }

    async function inicializarBotaoSeguir() {
        if (!seguirButton || !idUsuarioLogado || !idUsuarioPaginaAtual) {
            return;
        }

        if (String(idUsuarioLogado) === String(idUsuarioPaginaAtual)) {
            esconderAcoesDoProprioPerfil(true);
            return;
        }

        esconderAcoesDoProprioPerfil(false);
        seguirButton.disabled = true;

        try {
            estaSeguindoUsuario = await verificarSeSegueUsuario(idUsuarioLogado, idUsuarioPaginaAtual);
            atualizarBotaoSeguir();
        } catch (error) {
            console.error(error);
            estaSeguindoUsuario = false;
            atualizarBotaoSeguir();
        } finally {
            seguirButton.disabled = false;
        }
    }

    if (seguirButton) {
        seguirButton.addEventListener('click', async function () {
            if (!idUsuarioLogado || !idUsuarioPaginaAtual) {
                return;
            }

            if (String(idUsuarioLogado) === String(idUsuarioPaginaAtual)) {
                return;
            }

            seguirButton.disabled = true;

            try {
                var resposta = await alternarSeguimentoUsuario(idUsuarioLogado, idUsuarioPaginaAtual);
                estaSeguindoUsuario = !!(resposta && resposta.seguindo);
                atualizarBotaoSeguir();

                if (estaSeguindoUsuario) {
                    ajustarTotalSeguidores(1);
                } else {
                    ajustarTotalSeguidores(-1);
                }
            } catch (error) {
                console.error(error);
            } finally {
                seguirButton.disabled = false;
            }
        });
    }

    async function carregarAsideUsuario() {
        var idUsuario = getIdUsuarioPagina();

        if (!idUsuario) {
            return;
        }

        idUsuarioPaginaAtual = String(idUsuario);

        try {
            var response = await fetch(ip_api + '/usuarios/perfil/' + idUsuario);

            if (!response.ok) {
                throw new Error('Falha ao carregar perfil do usuário');
            }

            var usuario = await response.json();
            aplicarDadosNoAside(usuario);
            carregarPostsDoUsuario(idUsuario);
            await inicializarBotaoSeguir();
        } catch (error) {
            console.error(error);
        }
    }

    carregarAsideUsuario();
});
