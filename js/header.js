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
        ${buildNavItem('aprender', 'Aprender', 'cursos.html')}
        ${buildNavItem('vagas', 'Vagas', 'vagas.html')}
    </nav>

    <input class="inputPesquisa" type="search">

    <div class="menusHeader">
        <div class="messagesDropdown">
            <button type="button" class="menuHeaderButton" aria-label="Mensagens" aria-haspopup="menu"
                aria-expanded="false" id="messagesMenuButton">
                <img src="img/mail.png" alt="">
            </button>

            <div class="messagesDropdownMenu" id="messagesMenu" hidden>
                <div class="messagesDropdownTitle">Caixa de mensagem</div>

                <div class="messagesDropdownList">
                    <div class="notificationCard">
                        <img class="notificationAvatar" src="img/favicon.png" alt="">
                        <div class="notificationContent">
                            <strong>Bem-vindo ao seek!</strong>
                            <p>Seja bem-vindo a nossa plataforma voltada para artistas visuais. Aqui você encontrará tudo tipo de arte visual, fotografias, desenhos digitais, logotipos branding, etc. Esperamos que gostem da nossa plataforma!</p>
                        </div>
                    </div>
                </div>

                <button type="button" class="notificationsCTA">Ver todas as mensagens</button>
            </div>
        </div>

        <div class="notificationsDropdown">
            <button type="button" class="menuHeaderButton" aria-label="Notificações" aria-haspopup="menu"
                aria-expanded="false" id="notificationsMenuButton">
                <img src="img/bell.png" alt="">
            </button>

            <div class="notificationsDropdownMenu" id="notificationsMenu" hidden>
                <div class="notificationsDropdownHeader">
                    <div class="notificationsDropdownTitle">Caixa de notificação</div>
                    <button type="button" class="notificationsClearAllButton" id="notificationsClearAllButton">Excluir todas</button>
                </div>

                <div class="notificationsDropdownList" id="notificationsList">
                    <p class="notificationsEmpty">Carregando notificações...</p>
                </div>

                <button type="button" class="notificationsCTA" id="notificationsReloadButton">Atualizar notificações</button>
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
                        <strong>Nome do usuário</strong>
                        <div class="perfilDropdownLinks">
                            <button type="button">Ver perfil</button>
                            <span>•</span>
                            <button type="button">Editar perfil</button>
                        </div>
                    </div>
                </div>

                <div class="perfilDropdownGroup">
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/favoritos.svg" alt="">
                        <span>Salvos</span>
                    </button>
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/like.svg" alt="">
                        <span>Favoritos</span>
                    </button>
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/cursos.svg" alt="">
                        <span>Cursos inscritos</span>
                    </button>
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/vagas.svg" alt="">
                        <span>Minhas vagas</span>
                    </button>
                </div>

                <div class="perfilDropdownDivider"></div>

                <div class="perfilDropdownGroup">
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/favoritos.svg" alt="">
                        <span>Meus projetos</span>
                    </button>
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/meuscursos.svg" alt="">
                        <span>Meus cursos</span>
                    </button>
                </div>

                <div class="perfilDropdownDivider"></div>

                <div class="perfilDropdownGroup">
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/config.svg" alt="">
                        <span>Configurações</span>
                    </button>
                    <button type="button" class="perfilDropdownItem">
                        <img src="img/icons/sair.svg" alt="">
                        <span>Sair</span>
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
                        <span>Termos de uso</span>
                    </button>
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/privacidade.svg" alt="">
                        <span>Privacidade</span>
                    </button>
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/sobrenos.svg" alt="">
                        <span>Sobre nós</span>
                    </button>
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/ajuda.svg" alt="">
                        <span>Ajuda</span>
                    </button>
                </div>

                <div class="optionsDropdownDivider"></div>

                <div class="optionsDropdownGroup">
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/instagram.svg" alt="">
                        <span>Instagram</span>
                    </button>
                    <button type="button" class="optionsDropdownItem">
                        <img src="img/icons/email.svg" alt="">
                        <span>Email</span>
                    </button>
                    <button type="button" class="optionsDropdownItem">
                        <span class="optionsDropdownBrand">Bē</span>
                        <span>Behance</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', function () {
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
        return;
    }

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
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeAllDropdowns();
        }
    });

    window.addEventListener('scroll', function () {
        closeAllDropdowns();
    }, { passive: true });
});

montarHeader();