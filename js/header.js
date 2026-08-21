function montarHeader() {
    var activeNav = (document.body && document.body.dataset.activeNav ? document.body.dataset.activeNav : 'explorar').toLowerCase();

    function buildNavItem(chave, label, href) {
        if (activeNav === chave) {
            return '<div class="abaAtiva"><a href="' + href + '">' + label + '</a></div>';
        }

        return '<a href="' + href + '">' + label + '</a>';
    }

    const header = document.querySelector('header');
    header.innerHTML = `
    <div class="logo">
        <a href="index.html"><img src="img/logo.png" alt=""></a>
    </div>

    <nav class="navegarPaginas">
        ${buildNavItem('explorar', 'Explorar', 'index.html')}
        ${buildNavItem('galeria', 'Galeria', 'galeria.html')}
        ${buildNavItem('vagas', 'Vagas', 'vagas.html')}
        ${buildNavItem('criar', 'Criar', 'adicionarprojeto.html')}
    </nav>

    <div class="inputPesquisaWrapper">
        <button type="button" class="inputPesquisaIconButton inputPesquisaIconLeft" aria-label="Pesquisar">
            <img class="inputPesquisaIcon" src="img/icons/lupapreta.svg" alt="">
        </button>
        <input class="inputPesquisa" type="search">
        <button type="button" class="inputPesquisaIconButton inputPesquisaIconRight" aria-label="Abrir filtros">
            <img class="inputPesquisaIcon" src="img/icons/filtroinputpreto.svg" alt="">
        </button>

        <div class="inputPesquisaDropdown" id="inputPesquisaDropdown" hidden>
            <div class="inputPesquisaDropdownTitle" id="inputPesquisaDropdownTitle">Recentes</div>
            <div class="inputPesquisaDropdownList" id="inputPesquisaDropdownList">
                <p class="inputPesquisaEstadoVazio">Carregando histórico...</p>
            </div>
        </div>
    </div>

    <div class="menusHeader">
        <div class="messagesDropdown">
            <button type="button" class="menuHeaderButton" aria-label="Mensagens" aria-haspopup="menu"
                aria-expanded="false" id="messagesMenuButton">
                <img src="img/mail.png" alt="">
            </button>

            <div class="messagesDropdownMenu" id="messagesMenu" hidden>
                <div class="messagesDropdownTitle" data-i18n="messagesTitle">Caixa de mensagem</div>

                <div class="messagesDropdownList">
                    <div class="notificationCard">
                        <img class="notificationAvatar" src="img/favicon.png" alt="">
                        <div class="notificationContent">
                            <strong data-i18n="welcomeTitle">Bem-vindo ao seek!</strong>
                            <p data-i18n="welcomeMessage">Seja bem-vindo a nossa plataforma voltada para artistas visuais. Aqui você encontrará tudo tipo de arte visual, fotografias, desenhos digitais, logotipos branding, etc. Esperamos que gostem da nossa plataforma!</p>
                        </div>
                    </div>
                </div>

                <button type="button" class="notificationsCTA" data-i18n="messagesAllButton">Ver todas as mensagens</button>
            </div>
        </div>

        <div class="notificationsDropdown">
            <button type="button" class="menuHeaderButton" aria-label="Notificações" aria-haspopup="menu"
                aria-expanded="false" id="notificationsMenuButton">
                <img src="img/bell.png" alt="">
            </button>

            <div class="notificationsDropdownMenu" id="notificationsMenu" hidden>
                <div class="notificationsDropdownHeader">
                    <div class="notificationsDropdownTitle" data-i18n="notificationsTitle">Caixa de notificação</div>
                    <button type="button" class="notificationsClearAllButton" id="notificationsClearAllButton" data-i18n="notificationsClearAll">Excluir todas</button>
                </div>

                <div class="notificationsDropdownList" id="notificationsList">
                    <p class="notificationsEmpty" data-i18n="notificationsEmpty">Carregando notificações...</p>
                </div>

                <button type="button" class="notificationsCTA" id="notificationsReloadButton" data-i18n="notificationsReload">Atualizar notificações</button>
            </div>
        </div>

        <div class="perfilDropdown">
            <button type="button" class="menuHeaderButton" aria-label="Perfil" aria-haspopup="menu"
                aria-expanded="false" id="perfilMenuButton">
                <img src="img/userProfile.png" alt="">
            </button>

            <div class="perfilDropdownMenu" id="perfilMenu" hidden>
                <div class="perfilDropdownTop">
                    <img src="img/userProfilepreto.png" alt="">
                    <div class="perfilDropdownInfo">
                        <strong data-i18n="profileName">Nome do usuário</strong>
                        <div class="perfilDropdownLinks">
                            <a href="usuario.html" type="button" data-i18n="profileView">Ver perfil</a>
                            <span>•</span>
                            <button type="button" data-i18n="profileEdit">Editar perfil</button>
                        </div>
                    </div>
                </div>

                <div class="perfilDropdownDivider"></div> 

                <div class="perfilDropdownGroup">
                    <a href="configuracaoes.html" class="perfilDropdownItem">
                        <img src="img/icons/config.svg" alt="">
                        <span data-i18n="settings">Configurações</span>
                    </a>
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/sair.svg" alt="">
                        <span data-i18n="logout">Sair</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="optionsDropdown">
            <button type="button" class="menuHeaderButton" aria-label="Mais opções" aria-haspopup="menu"
                aria-expanded="false" id="optionsMenuButton">
                <img src="img/options.png" alt="">
            </button>

            <div class="optionsDropdownMenu" id="optionsMenu" hidden>
                <div class="optionsDropdownGroup">
                    <a href="sobrenos.html">
                        <button type="button" class="optionsDropdownItem">
                            <img src="img/icons/sobrenos.svg" alt="">
                            <span data-i18n="aboutUs">Sobre nós</span>
                        </button>
                    </a>
                    <a href="ajuda.html">
                        <button type="button" class="optionsDropdownItem">
                            <img src="img/icons/ajuda.svg" alt="">
                            <span data-i18n="help">Ajuda</span>
                        </button>
                    </a>
                </div>

                <div class="optionsDropdownGroup">
                    <a href="https://www.instagram.com/seek_brasil" target="_blank" rel="noopener noreferrer">
                        <button type="button" class="optionsDropdownItem">
                            <img src="img/icons/instagram.svg" alt="">
                            <span data-i18n="instagram">Instagram</span>
                        </button>
                    </a>
                    <a href="mailto:seek.arts.ink@gmail.com">
                        <button type="button" class="optionsDropdownItem">
                            <img src="img/icons/email.svg" alt="">
                            <span data-i18n="email">Email</span>
                        </button>
                    </a>
                </div>
            </div>
        </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', function () {
    const searchWrapper = document.querySelector('.inputPesquisaWrapper');
    const searchInput = document.querySelector('.inputPesquisa');
    const searchDropdown = document.getElementById('inputPesquisaDropdown');
    const searchDropdownTitle = document.getElementById('inputPesquisaDropdownTitle');
    const searchDropdownList = document.getElementById('inputPesquisaDropdownList');
    const searchIconButtons = searchWrapper ? searchWrapper.querySelectorAll('.inputPesquisaIconButton') : [];

    const userSearchApiUrl = ip_api + '/usuarios/pesquisar';
    const historySearchApiUrl = ip_api + '/usuarios/historico-pesquisas';
    
    let recentSearches = []; // Agora armazena objetos da API { id, termo_pesquisa }

    let searchDebounceTimer = null;
    let searchRequestController = null;
    let searchRequestToken = 0;

    const dropdowns = [
        {
            root: document.querySelector('.messagesDropdown'),
            button: document.getElementById('messagesMenuButton'),
            menu: document.getElementById('messagesMenu')
        },
        {
            root: document.querySelector('.notificationsDropdown'),
            button: document.getElementById('notificationsMenuButton'),
            menu: document.getElementById('notificationsMenu')
        },
        {
            root: document.querySelector('.perfilDropdown'),
            button: document.getElementById('perfilMenuButton'),
            menu: document.getElementById('perfilMenu')
        },
        {
            root: document.querySelector('.optionsDropdown'),
            button: document.getElementById('optionsMenuButton'),
            menu: document.getElementById('optionsMenu')
        }
    ].filter(function (dropdown) {
        return dropdown.root && dropdown.button && dropdown.menu;
    });

    if (!dropdowns.length) {
        if (!(searchWrapper && searchInput && searchDropdown)) {
            return;
        }
    }

    const escapeHtml = function (value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const setSearchPanel = function (title, contentHtml) {
        if (!searchDropdownTitle || !searchDropdownList) {
            return;
        }

        searchDropdownTitle.textContent = title;
        searchDropdownList.innerHTML = contentHtml;
    };

    // --- CARREGAR HISTÓRICO DE PESQUISA ---
    const loadRecentSearches = async function () {
        try {
            const response = await fetch(historySearchApiUrl, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    recentSearches = result.data || [];
                    renderRecentSearches();
                }
            } else {
                // Caso falhe (ex: 401 Unauthorized), exibe estado vazio padrão silenciosamente
                recentSearches = [];
                renderRecentSearches();
            }
        } catch (error) {
            console.error('Erro ao carregar histórico de pesquisas:', error);
            recentSearches = [];
            renderRecentSearches();
        }
    };

    // --- DELETAR HISTÓRICO DE PESQUISA ---
    const deleteSearchHistory = async function (id, rowElement) {
        const deleteBtn = rowElement.querySelector('.inputPesquisaExcluirButton');
        if (deleteBtn) deleteBtn.disabled = true; // Impede múltiplos cliques

        try {
            const response = await fetch(historySearchApiUrl + '/' + id, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Atualiza o array local
                recentSearches = recentSearches.filter(item => String(item.id) !== String(id));
                
                // Atualiza a interface
                rowElement.remove();
                if (!recentSearches.length) {
                    renderRecentSearches();
                }
            } else {
                console.error(result.message || 'Erro ao deletar histórico.');
                if (deleteBtn) deleteBtn.disabled = false;
            }
        } catch (error) {
            console.error('Erro na requisição de exclusão:', error);
            if (deleteBtn) deleteBtn.disabled = false;
        }
    };

    const renderRecentSearches = function () {
        const itemsHtml = recentSearches.length
            ? recentSearches.map(function (item) {
                const term = item.termo_pesquisa;
                const id = item.id;
                return '<div class="inputPesquisaSugestaoRow" data-id="' + id + '">' +
                    '<button type="button" class="inputPesquisaSugestaoItem" data-term="' + escapeHtml(term) + '">' + escapeHtml(term) + '</button>' +
                    '<button type="button" class="inputPesquisaExcluirButton" aria-label="Excluir recente" data-id="' + id + '">X</button>' +
                    '</div>';
            }).join('')
            : '<p class="inputPesquisaEstadoVazio">Nenhuma pesquisa recente.</p>';

        setSearchPanel('Recentes', itemsHtml);
    };

    const renderSearchMessage = function (title, message) {
        setSearchPanel(title, '<p class="inputPesquisaEstadoVazio">' + escapeHtml(message) + '</p>');
    };

    const renderSearchUsers = function (users) {
        if (!users || !users.length) {
            renderSearchMessage('Usuários', 'Nenhum usuário encontrado.');
            return;
        }

        const itemsHtml = users.map(function (user) {
            const userId = escapeHtml(user.id);
            const userName = escapeHtml(user.nome || 'Usuário');
            const userPhoto = escapeHtml(user.foto_perfil || 'img/userProfile.png');

            return '<a class="inputPesquisaResultadoItem" href="usuario.html?iduser=' + userId + '">' +
                '<img class="inputPesquisaResultadoFoto" src="' + userPhoto + '" alt="">' +
                '<span class="inputPesquisaResultadoNome">' + userName + '</span>' +
                '</a>';
        }).join('');

        setSearchPanel('Usuários', itemsHtml);
    };

    const cancelPendingSearch = function () {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = null;

        if (searchRequestController) {
            searchRequestController.abort();
            searchRequestController = null;
        }

        searchRequestToken += 1;
    };

    const searchUsers = async function (term) {
        cancelPendingSearch();

        const requestToken = searchRequestToken;
        searchRequestController = new AbortController();

        renderSearchMessage('Usuários', 'Carregando usuários...');

        try {
            const urlBusca = userSearchApiUrl + '?termo=' + encodeURIComponent(term);
            const response = await fetch(urlBusca, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: searchRequestController.signal
            });

            const result = await response.json();

            if (requestToken !== searchRequestToken) {
                return;
            }

            if (response.ok && result.success) {
                renderSearchUsers(result.data || []);
            } else {
                renderSearchMessage('Usuários', result.message || 'Falha ao buscar usuários.');
            }
        } catch (error) {
            if (error && error.name === 'AbortError') {
                return;
            }
            renderSearchMessage('Usuários', 'Não foi possível carregar os usuários.');
        } finally {
            if (requestToken === searchRequestToken) {
                searchRequestController = null;
            }
        }
    };

    const syncSearchState = function () {
        if (!(searchWrapper && searchInput && searchDropdown)) {
            return;
        }

        const term = searchInput.value.trim();

        openSearchDropdown();
        cancelPendingSearch();

        if (!term.length) {
            renderRecentSearches();
            return;
        }

        if (term.length < 3) {
            renderSearchMessage('Usuários', 'Digite pelo menos 3 letras para pesquisar usuários.');
            return;
        }

        renderSearchMessage('Usuários', 'Pesquisando usuários...');
        searchDebounceTimer = setTimeout(function () {
            searchUsers(term);
        }, 300);
    };

    const setSearchIcons = function (isOpen) {
        if (!searchWrapper) {
            return;
        }

        const leftIcon = searchWrapper.querySelector('.inputPesquisaIconLeft .inputPesquisaIcon');
        const rightIcon = searchWrapper.querySelector('.inputPesquisaIconRight .inputPesquisaIcon');

        if (leftIcon) {
            leftIcon.src = 'img/icons/lupapreta.svg';
        }

        if (rightIcon) {
            rightIcon.src = 'img/icons/filtroinputpreto.svg';
        }
    };

    const openSearchDropdown = function () {
        if (!(searchWrapper && searchInput && searchDropdown)) {
            return;
        }

        closeAllDropdowns();
        searchWrapper.classList.add('is-open');
        searchInput.setAttribute('aria-expanded', 'true');
        searchDropdown.hidden = false;
        setSearchIcons(true);
    };

    const closeSearchDropdown = function () {
        if (!(searchWrapper && searchInput && searchDropdown)) {
            return;
        }

        cancelPendingSearch();
        searchWrapper.classList.remove('is-open');
        searchInput.setAttribute('aria-expanded', 'false');
        searchDropdown.hidden = true;
        setSearchIcons(false);
    };

    const closeDropdown = function (dropdown) {
        dropdown.root.classList.remove('is-open');
        dropdown.button.setAttribute('aria-expanded', 'false');
        dropdown.menu.hidden = true;
    };

    const openDropdown = function (dropdown) {
        dropdowns.forEach(function (item) {
            if (item !== dropdown) {
                closeDropdown(item);
            }
        });

        dropdown.root.classList.add('is-open');
        dropdown.button.setAttribute('aria-expanded', 'true');
        dropdown.menu.hidden = false;
    };

    const closeAllDropdowns = function () {
        dropdowns.forEach(closeDropdown);
    };

    if (searchWrapper && searchInput && searchDropdown) {
        searchInput.setAttribute('aria-expanded', 'false');
        
        // Dispara requisição inicial para buscar histórico quando a página carrega
        loadRecentSearches();

        searchInput.addEventListener('focus', syncSearchState);
        searchInput.addEventListener('click', syncSearchState);
        searchInput.addEventListener('input', syncSearchState);
        searchWrapper.addEventListener('click', function () {
            openSearchDropdown();
            if (!searchInput.value.trim().length) {
                renderRecentSearches();
            }
        });

        searchIconButtons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                syncSearchState();
            });
        });

        searchDropdown.addEventListener('click', function (event) {
            const deleteButton = event.target.closest('.inputPesquisaExcluirButton');

            // Caso seja botão de deletar o histórico
            if (deleteButton) {
                event.preventDefault();
                event.stopPropagation();

                const id = deleteButton.getAttribute('data-id');
                const row = deleteButton.closest('.inputPesquisaSugestaoRow');

                if (id && row) {
                    deleteSearchHistory(id, row);
                }
                return;
            }

            // Caso seja botão de sugestão (texto pesquisado)
            const searchItemButton = event.target.closest('.inputPesquisaSugestaoItem');
            if (searchItemButton) {
                const term = searchItemButton.dataset.term || searchItemButton.textContent.trim();
                searchInput.value = term;
                syncSearchState();
            }
        });
    }

    dropdowns.forEach(function (dropdown) {
        dropdown.button.addEventListener('click', function (event) {
            event.stopPropagation();

            if (dropdown.root.classList.contains('is-open')) {
                closeDropdown(dropdown);
                return;
            }

            openDropdown(dropdown);
        });
    });

    document.addEventListener('click', function (event) {
        dropdowns.forEach(function (dropdown) {
            if (!dropdown.root.contains(event.target)) {
                closeDropdown(dropdown);
            }
        });

        if (searchWrapper && !searchWrapper.contains(event.target)) {
            closeSearchDropdown();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeAllDropdowns();
            closeSearchDropdown();
        }
    });

    window.addEventListener('scroll', function () {
        closeAllDropdowns();
        closeSearchDropdown();
    }, { passive: true });
});

montarHeader();