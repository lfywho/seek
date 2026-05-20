document.addEventListener('DOMContentLoaded', function () {
    var aside = document.querySelector('.usuario-profile-card');
    var bannerImage = document.getElementById('usuarioBannerImagem');
    var avatarImage = document.getElementById('usuarioAvatarImagem');
    var nomeElement = document.querySelector('.usuario-profile-card__header h1');
    var usuarioElement = document.querySelector('.usuario-profile-card__header p');
    var descricaoElement = document.querySelector('.usuario-profile-card__description');
    var statsValues = document.querySelectorAll('.usuario-profile-card__stats dd');
    var tabPanel = document.getElementById('usuarioTabPanel');
    var vagasTabButton = document.querySelector('.usuario-tab[data-tab="vagas"]');

    if (!aside || !bannerImage || !avatarImage || !nomeElement || !usuarioElement || !descricaoElement || !statsValues.length) {
        return;
    }

    function getIdUsuarioParaPerfil() {
        var params = new URLSearchParams(window.location.search);
        var idUser = params.get('iduser') || params.get('id');
        var usuarioLogado = getUsuarioLogado();

        if (idUser) {
            return idUser;
        }

        if (usuarioLogado && usuarioLogado.id) {
            document.getElementById('container-seguir-mensagem').style.display = 'none';
            document.querySelector('.usuario-profile-card__menu-popover').children[0].style.display = 'none';
            document.querySelector('.usuario-profile-card__menu-popover').children[1].style.display = 'none';

            return usuarioLogado.id;
        }

        return null;
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

    async function carregarAsideUsuario() {
        var idUsuario = getIdUsuarioParaPerfil();

        if (!idUsuario) {
            return;
        }

        try {
            var response = await fetch(ip_api + '/usuarios/perfil/' + idUsuario);

            if (!response.ok) {
                throw new Error('Falha ao carregar perfil do usuário');
            }

            var usuario = await response.json();
            aplicarDadosNoAside(usuario);
            carregarPostsDoUsuario(idUsuario);
        } catch (error) {
            console.error(error);
        }
    }

    carregarAsideUsuario();
});
