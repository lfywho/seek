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
                <div class="inputPesquisaSugestaoRow">
                    <button type="button" class="inputPesquisaSugestaoItem">Design gráfico</button>
                    <button type="button" class="inputPesquisaExcluirButton" aria-label="Excluir recente">X</button>
                </div>
                <div class="inputPesquisaSugestaoRow">
                    <button type="button" class="inputPesquisaSugestaoItem">Ilustração</button>
                    <button type="button" class="inputPesquisaExcluirButton" aria-label="Excluir recente">X</button>
                </div>
                <div class="inputPesquisaSugestaoRow">
                    <button type="button" class="inputPesquisaSugestaoItem">Concept art</button>
                    <button type="button" class="inputPesquisaExcluirButton" aria-label="Excluir recente">X</button>
                </div>
                <div class="inputPesquisaSugestaoRow">
                    <button type="button" class="inputPesquisaSugestaoItem">Art 3D</button>
                    <button type="button" class="inputPesquisaExcluirButton" aria-label="Excluir recente">X</button>
                </div>
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

                <div class="perfilDropdownGroup">
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/favoritos.svg" alt="">
                        <span data-i18n="saved">Salvos</span>
                    </button>
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/like.svg" alt="">
                        <span data-i18n="favorites">Favoritos</span>
                    </button>
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/vagas.svg" alt="">
                        <span data-i18n="myJobs">Minhas vagas</span>
                    </button>
                </div>

                <div class="perfilDropdownDivider"></div>

                <div class="perfilDropdownGroup">
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/favoritos.svg" alt="">
                        <span data-i18n="myProjects">Meus projetos</span>
                    </button>
                </div>

                <div class="perfilDropdownDivider"></div>

                <div class="perfilDropdownGroup">
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/config.svg" alt="">
                        <span data-i18n="settings">Configurações</span>
                    </button>
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
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/termos.svg" alt="">
                        <span data-i18n="termsOfUse">Termos de uso</span>
                    </button>
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/privacidade.svg" alt="">
                        <span data-i18n="privacy">Privacidade</span>
                    </button>
                    <a href="sobrenos.html">
                        <button type="button" class="optionsDropdownItem">
                            <img src="img/icons/sobrenos.svg" alt="">
                            <span data-i18n="aboutUs">Sobre nós</span>
                        </button>
                    </a>
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/ajuda.svg" alt="">
                        <span data-i18n="help">Ajuda</span>
                    </button>
                </div>


                <div class="optionsDropdownGroup">
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/instagram.svg" alt="">
                        <span data-i18n="instagram">Instagram</span>
                    </button>
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/email.svg" alt="">
                        <span data-i18n="email">Email</span>
                    </button>
                    <button type="button" class="optionsDropdownItem">
                        <span class="optionsDropdownBrand">Bē</span>
                        <span data-i18n="behance">Behance</span>
                    </button>
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
    const userSearchApiUrl = 'http://localhost:4500/pesquisa/usuarios/';
    const recentSearches = ['Design gráfico', 'Ilustração', 'Concept art', 'Art 3D'];

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

    const renderRecentSearches = function () {
        const itemsHtml = recentSearches.length
            ? recentSearches.map(function (term) {
                return '<div class="inputPesquisaSugestaoRow">' +
                    '<button type="button" class="inputPesquisaSugestaoItem" data-term="' + escapeHtml(term) + '">' + escapeHtml(term) + '</button>' +
                    '<button type="button" class="inputPesquisaExcluirButton" aria-label="Excluir recente">X</button>' +
                    '</div>';
            }).join('')
            : '<p class="inputPesquisaEstadoVazio">Nenhuma pesquisa recente.</p>';

        setSearchPanel('Recentes', itemsHtml);
    };

    const renderSearchMessage = function (title, message) {
        setSearchPanel(title, '<p class="inputPesquisaEstadoVazio">' + escapeHtml(message) + '</p>');
    };

    const renderSearchUsers = function (users) {
        if (!users.length) {
            renderSearchMessage('Usuários', 'Nenhum usuário encontrado.');
            return;
        }

        const itemsHtml = users.map(function (user) {
            const userId = escapeHtml(user.id);
            const userName = escapeHtml(user.nome || 'Usuário');
            const userPhoto = escapeHtml(user.foto || 'img/userProfile.png');

            return '<a class="inputPesquisaResultadoItem" href="usuario.html?id=' + userId + '">' +
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

    const searchUsers = function (term) {
        cancelPendingSearch();

        const requestToken = searchRequestToken;
        searchRequestController = new AbortController();

        renderSearchMessage('Usuários', 'Carregando usuários...');

        fetch(userSearchApiUrl + encodeURIComponent(term), {
            signal: searchRequestController.signal
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Falha ao consultar a pesquisa de usuários.');
                }

                return response.json();
            })
            .then(function (users) {
                if (requestToken !== searchRequestToken) {
                    return;
                }

                renderSearchUsers(Array.isArray(users) ? users : []);
            })
            .catch(function (error) {
                if (error && error.name === 'AbortError') {
                    return;
                }

                renderSearchMessage('Usuários', 'Não foi possível carregar os usuários.');
            })
            .finally(function () {
                if (requestToken === searchRequestToken) {
                    searchRequestController = null;
                }
            });
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
        renderRecentSearches();

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

            if (!deleteButton) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const row = deleteButton.closest('.inputPesquisaSugestaoRow');
            if (row) {
                const termButton = row.querySelector('.inputPesquisaSugestaoItem');
                if (termButton) {
                    const term = termButton.dataset.term || termButton.textContent.trim();
                    const index = recentSearches.indexOf(term);

                    if (index !== -1) {
                        recentSearches.splice(index, 1);
                    }
                }

                row.remove();

                if (!recentSearches.length) {
                    renderRecentSearches();
                }
            }

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