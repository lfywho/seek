document.addEventListener('DOMContentLoaded', function () {
    // Referências do DOM
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
    
    // Variáveis de Estado
    var idUsuarioPaginaAtual = null;
    var estaSeguindoUsuario = false;
    var modalRelacionamentos = null;
    var modalRelacionamentosTitle = null;
    var modalRelacionamentosList = null;
    var modalRelacionamentosEmpty = null;
    var modalRelacionamentosCloseButton = null;

    if (!aside || !bannerImage || !avatarImage || !nomeElement || !descricaoElement || !statsValues.length) {
        return; // Elementos vitais não encontrados na página
    }

    // --- FUNÇÕES UTILITÁRIAS ---

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // NOVA FUNÇÃO: Obtém da URL ou da API (se logado)
    async function obterIdUsuario() {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('iduser') || params.get('id');

        if (id) {
            return id;
        }

        // Fallback: Se não tem ID na URL, busca o ID do próprio usuário autenticado via Cookie HttpOnly
        try {
            var response = await fetch(ip_api + '/auth/id', {
                method: 'GET',
                credentials: 'include' // Garante o envio do cookie JWT
            });

            var result = await response.json();

            if (response.ok && result.success && result.data && result.data.id) {
                return result.data.id;
            }
        } catch (error) {
            console.error('Erro ao buscar o ID do usuário logado:', error);
        }

        return null;
    }

    // --- MODAL DE RELACIONAMENTOS (SEGUIDORES / SEGUINDO) ---

    function criarModalRelacionamentos() {
        if (modalRelacionamentos) return;

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

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modalRelacionamentos && !modalRelacionamentos.hidden) {
                fecharModalRelacionamentos();
            }
        });
    }

    function abrirModalRelacionamentos(titulo) {
        criarModalRelacionamentos();
        modalRelacionamentosTitle.textContent = titulo;
        modalRelacionamentos.hidden = false;
        document.body.classList.add('usuario-relacionamentos-aberto');
    }

    function fecharModalRelacionamentos() {
        if (!modalRelacionamentos) return;
        modalRelacionamentos.hidden = true;
        document.body.classList.remove('usuario-relacionamentos-aberto');
    }

    function renderizarRelacionamentos(lista) {
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
            link.href = 'usuario.html?iduser=' + encodeURIComponent(usuario.id);
            link.innerHTML =
                '<img class="usuario-relacionamentos-modal__avatar" src="' + escapeHtml(usuario.foto_perfil || 'img/userProfile.png') + '" alt="Foto de ' + escapeHtml(usuario.nome) + '">' +
                '<span class="usuario-relacionamentos-modal__nome">' + escapeHtml(usuario.nome) + '</span>';

            link.addEventListener('click', fecharModalRelacionamentos);
            modalRelacionamentosList.appendChild(link);
        });
    }

    async function carregarRelacionamentos(tipoRelacionamento) {
        if (!idUsuarioPaginaAtual) return;

        criarModalRelacionamentos();
        abrirModalRelacionamentos(tipoRelacionamento === 'seguindo' ? 'Seguindo' : 'Seguidores');
        modalRelacionamentosEmpty.hidden = false;
        modalRelacionamentosEmpty.textContent = 'Carregando...';
        modalRelacionamentosList.innerHTML = '';

        var endpoint = tipoRelacionamento === 'seguindo'
            ? '/seguidores/seguindo/' + encodeURIComponent(idUsuarioPaginaAtual)
            : '/seguidores/seguidores/' + encodeURIComponent(idUsuarioPaginaAtual);

        try {
            var response = await fetch(ip_api + endpoint, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.status === 401) {
                modalRelacionamentosEmpty.textContent = 'Você precisa estar logado para ver isso.';
                return;
            }

            var result = await response.json();
            
            if (response.ok && result.success) {
                renderizarRelacionamentos(result.data);
            } else {
                throw new Error(result.message || 'Falha ao carregar relacionamentos');
            }
        } catch (error) {
            console.error(error);
            modalRelacionamentosEmpty.hidden = false;
            modalRelacionamentosEmpty.textContent = 'Não foi possível carregar a lista.';
        }
    }

    // --- CONTROLE DE UI DO PERFIL ---

    function esconderAcoesDoProprioPerfil(isProprioPerfil) {
        if (seguirContainer) seguirContainer.style.display = isProprioPerfil ? 'none' : '';
        if (mensagemButton) mensagemButton.style.display = isProprioPerfil ? 'none' : '';

        var menuPopover = document.querySelector('.usuario-profile-card__menu-popover');
        if (menuPopover) {
            Array.from(menuPopover.children).forEach(function(item) {
                item.style.display = isProprioPerfil ? 'none' : '';
            });
        }
    }

    function atualizarBotaoSeguir() {
        if (!seguirButton) return;
        seguirButton.textContent = estaSeguindoUsuario ? 'Deixar de seguir' : 'Seguir';
        seguirButton.classList.toggle('is-following', estaSeguindoUsuario);
        seguirButton.setAttribute('aria-pressed', estaSeguindoUsuario ? 'true' : 'false');
    }

    function ajustarTotalSeguidores(delta) {
        if (!statsValues[0]) return;
        var atual = parseInt(statsValues[0].textContent, 10) || 0;
        statsValues[0].textContent = String(Math.max(0, atual + delta));
    }

    // --- INTEGRAÇÃO DA API: AÇÕES DE SEGUIR ---

    async function inicializarBotaoSeguir() {
        if (!seguirButton || !idUsuarioPaginaAtual) return;

        seguirButton.disabled = true;

        try {
            var response = await fetch(ip_api + '/seguidores/status/' + encodeURIComponent(idUsuarioPaginaAtual), {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                var result = await response.json();
                if (result.success && result.data) {
                    estaSeguindoUsuario = !!result.data.seguindo;
                }
            } else if (response.status === 401) {
                // Usuário não logado, mantém o botão desabilitado ou exibe alert ao clicar
                estaSeguindoUsuario = false;
            }
        } catch (error) {
            console.error(error);
        } finally {
            atualizarBotaoSeguir();
            seguirButton.disabled = false;
        }
    }

    if (seguirButton) {
        seguirButton.addEventListener('click', async function () {
            if (!idUsuarioPaginaAtual) return;
            seguirButton.disabled = true;

            try {
                // Define o método dependendo do status atual (POST = Seguir, DELETE = Deixar de seguir)
                var metodo = estaSeguindoUsuario ? 'DELETE' : 'POST';
                var response = await fetch(ip_api + '/seguidores/' + encodeURIComponent(idUsuarioPaginaAtual), {
                    method: metodo,
                    credentials: 'include'
                });

                if (response.status === 401) {
                    alert('Você precisa estar logado para seguir um usuário.');
                    return;
                }

                var result = await response.json();

                if (response.ok && result.success) {
                    estaSeguindoUsuario = !estaSeguindoUsuario;
                    atualizarBotaoSeguir();
                    ajustarTotalSeguidores(estaSeguindoUsuario ? 1 : -1);
                } else {
                    alert(result.message || 'Ocorreu um erro ao processar sua solicitação.');
                }
            } catch (error) {
                console.error(error);
                alert('Erro de comunicação com o servidor.');
            } finally {
                seguirButton.disabled = false;
            }
        });
    }

    // --- INTEGRAÇÃO DA API: POSTS ---

    function renderPostsUsuario(posts) {
        var listaPosts = Array.isArray(posts) ? posts : [];

        if (!tabPanel) return;
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

            // Resolução da imagem: Usa a capa se existir, senão pega a primeira do array imagens.
            var imgSrc = post.capa || (Array.isArray(post.imagens) && post.imagens.length > 0 ? post.imagens[0] : 'img/logo.png');
            var authorName = post.criador && post.criador.nome ? post.criador.nome : 'Usuário';
            var authorPhoto = post.criador && post.criador.foto_perfil ? post.criador.foto_perfil : 'img/userProfile.png';

            article.innerHTML =
                '<div class="feedImg">' +
                '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(post.titulo || 'Post') + '">' +
                '</div>' +
                '<div class="infoPost">' +
                '<div class="feedInfoLeft">' +
                '<span class="feedPostTitle">' + escapeHtml(post.titulo || 'Sem título') + '</span>' +
                '<div class="logoName">' +
                '<img class="logoUser" src="' + escapeHtml(authorPhoto) + '" alt="' + escapeHtml(authorName) + '">' +
                '<span class="userName">' + escapeHtml(authorName) + '</span>' +
                '</div>' +
                '</div>' +
                '<div class="likeView">' +
                '<span class="feedPostTime">' + escapeHtml(post.tempo_atras || '') + '</span>' +
                '</div>' +
                '</div>';

            grid.appendChild(article);
        });

        tabPanel.appendChild(grid);
    }

    async function carregarPostsDoUsuario(idUsuario) {
        if (!idUsuario) {
            renderPostsUsuario([]);
            return;
        }

        if (tabPanel) tabPanel.innerHTML = '<p class="usuario-empty-state">Carregando posts...</p>';

        try {
            var response = await fetch(ip_api + '/posts/usuario/' + encodeURIComponent(idUsuario), {
                method: 'GET',
                credentials: 'include'
            });

            var result = await response.json();

            if (response.ok && result.success) {
                renderPostsUsuario(result.data);
            } else {
                throw new Error(result.message || 'Falha ao carregar posts');
            }
        } catch (error) {
            console.error(error);
            if (tabPanel) {
                tabPanel.innerHTML = '<p class="usuario-empty-state">Não foi possível carregar os posts.</p>';
            }
        }
    }

    // --- INTEGRAÇÃO DA API: CARREGAMENTO INICIAL (PERFIL) ---

    function aplicarDadosNoAside(usuario) {
        var nome = usuario.nome || 'Usuário';
        var descricao = usuario.descricao || 'Este usuário ainda não adicionou uma descrição.';
        var foto = usuario.foto || 'img/userProfile.png';
        var banner = usuario.banner || 'img/bannervagas.jpg';
        var tipoUsuario = String(usuario.tipo_usuario || '').toUpperCase();

        bannerImage.src = banner;
        bannerImage.alt = 'Banner de ' + nome;
        avatarImage.src = foto;
        avatarImage.alt = 'Foto de perfil de ' + nome;
        nomeElement.textContent = nome;
        
        if (usuarioElement) usuarioElement.textContent = 'Perfil do usuário'; 
        
        descricaoElement.textContent = descricao;

        if (statsValues[0]) statsValues[0].textContent = String(usuario.total_seguidores ?? 0);
        if (statsValues[1]) statsValues[1].textContent = String(usuario.total_seguindo ?? 0);
        if (statsValues[2]) statsValues[2].textContent = String(usuario.total_posts ?? 0);

        if (vagasTabButton) {
            vagasTabButton.style.display = tipoUsuario !== 'PJ' && tipoUsuario !== 'EMPRESA' ? 'none' : '';
        }

        if (usuario.edit === true) {
            esconderAcoesDoProprioPerfil(true);
        } else {
            esconderAcoesDoProprioPerfil(false);
            inicializarBotaoSeguir();
        }
    }

    async function carregarAsideUsuario() {
        // Agora aguardamos a função assíncrona que buscará na URL ou via /auth/id
        var idUsuario = await obterIdUsuario();

        if (!idUsuario) {
            console.error("ID do usuário não fornecido na URL e usuário não está logado.");
            if (nomeElement) nomeElement.textContent = "Usuário não encontrado";
            if (descricaoElement) descricaoElement.textContent = "Não foi possível carregar o perfil sem um ID válido.";
            esconderAcoesDoProprioPerfil(true);
            return;
        }

        idUsuarioPaginaAtual = String(idUsuario);

        try {
            var response = await fetch(ip_api + '/usuarios/' + encodeURIComponent(idUsuarioPaginaAtual), {
                method: 'GET',
                credentials: 'include' // Obrigatório para a API verificar se o perfil pertence ao usuário da sessão
            });

            var result = await response.json();

            if (response.ok && result.success) {
                aplicarDadosNoAside(result.data);
                carregarPostsDoUsuario(idUsuarioPaginaAtual);
            } else {
                throw new Error(result.message || 'Falha ao carregar perfil do usuário');
            }
        } catch (error) {
            console.error(error);
            alert("Não foi possível carregar as informações do perfil.");
        }
    }

    // --- LISTENERS DOS BOTÕES DE ESTATÍSTICA ---
    if (statsButtons.length >= 2) {
        statsButtons[0].addEventListener('click', function () {
            carregarRelacionamentos('seguidores');
        });

        statsButtons[1].addEventListener('click', function () {
            carregarRelacionamentos('seguindo');
        });
    }

    // Inicia o processo
    carregarAsideUsuario();
});