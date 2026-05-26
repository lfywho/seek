(function () {
    var traducoes = {
        pt: {
            navExplorar: 'Explorar',
            navAprender: 'Aprender',
            navVagas: 'Vagas',
            searchPlaceholder: 'Pesquisar',
            languageLabel: 'Idioma',
            recentTitle: 'Recentes',
            usersTitle: 'Usuários',
            projectsTrend: 'Tendências de projetos',
            explorarElementoH1: 'Explorar',
            messagesButtonAria: 'Mensagens',
            notificationsButtonAria: 'Notificações',
            profileButtonAria: 'Perfil',
            optionsButtonAria: 'Mais opções',
            messagesTitle: 'Caixa de mensagem',
            welcomeTitle: 'Bem-vindo ao seek!',
            welcomeMessage: 'Seja bem-vindo a nossa plataforma voltada para artistas visuais. Aqui você encontrará tudo tipo de arte visual, fotografias, desenhos digitais, logotipos branding, etc. Esperamos que gostem da nossa plataforma!',
            messagesAllButton: 'Ver todas as mensagens',
            notificationsTitle: 'Caixa de notificação',
            notificationsClearAll: 'Excluir todas',
            notificationsEmpty: 'Carregando notificações...',
            notificationsReload: 'Atualizar notificações',
            profileName: 'Nome do usuário',
            profileView: 'Ver perfil',
            profileEdit: 'Editar perfil',
            saved: 'Salvos',
            favorites: 'Favoritos',
            coursesEnrolled: 'Cursos inscritos',
            myJobs: 'Minhas vagas',
            myProjects: 'Meus projetos',
            myCourses: 'Meus cursos',
            settings: 'Configurações',
            logout: 'Sair',
            termsOfUse: 'Termos de uso',
            privacy: 'Privacidade',
            aboutUs: 'Sobre nós',
            help: 'Ajuda',
            instagram: 'Instagram',
            email: 'Email',
            behance: 'Behance'
        },
        eng: {
            navExplorar: 'Explore',
            navAprender: 'Learn',
            navVagas: 'Jobs',
            searchPlaceholder: 'Search',
            languageLabel: 'Language',
            recentTitle: 'Recent',
            usersTitle: 'Users',
            projectsTrend: 'Project trends',
            explorarElementoH1: 'Explore',
            messagesButtonAria: 'Messages',
            notificationsButtonAria: 'Notifications',
            profileButtonAria: 'Profile',
            optionsButtonAria: 'More options',
            messagesTitle: 'Message inbox',
            welcomeTitle: 'Welcome to seek!',
            welcomeMessage: 'Welcome to our platform for visual artists. Here you will find all kinds of visual art, photography, digital drawings, branding logos, and more. We hope you enjoy our platform!',
            messagesAllButton: 'View all messages',
            notificationsTitle: 'Notification inbox',
            notificationsClearAll: 'Clear all',
            notificationsEmpty: 'Loading notifications...',
            notificationsReload: 'Refresh notifications',
            profileName: 'User name',
            profileView: 'View profile',
            profileEdit: 'Edit profile',
            saved: 'Saved',
            favorites: 'Favorites',
            coursesEnrolled: 'Enrolled courses',
            myJobs: 'My jobs',
            myProjects: 'My projects',
            myCourses: 'My courses',
            settings: 'Settings',
            logout: 'Logout',
            termsOfUse: 'Terms of use',
            privacy: 'Privacy',
            aboutUs: 'About us',
            help: 'Help',
            instagram: 'Instagram',
            email: 'Email',
            behance: 'Behance'
        },
    };

    function getSelectedLanguage() {
        var stored = localStorage.getItem('selectedLanguage');
        return stored && traducoes[stored] ? stored : 'pt';
    }

    function saveSelectedLanguage(lang) {
        if (!traducoes[lang]) {
            lang = 'pt';
        }
        localStorage.setItem('selectedLanguage', lang);
        return lang;
    }

    function setText(selector, value) {
        var element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    function setAttribute(selector, attribute, value) {
        var element = document.querySelector(selector);
        if (element) {
            element.setAttribute(attribute, value);
        }
    }

    function translateElements(strings) {
        var nodes = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < nodes.length; i++) {
            var key = nodes[i].getAttribute('data-i18n');
            if (key && strings[key]) {
                nodes[i].textContent = strings[key];
            }
        }
    }

    window.aplicarIdioma = function () {
        var selectedLanguage = getSelectedLanguage();
        var strings = traducoes[selectedLanguage];

        var select = document.getElementById('idiomaSelect');
        if (select) {
            select.value = selectedLanguage;
        }

        if (selectedLanguage === 'eng') {
            document.documentElement.lang = 'en';
        } else if (selectedLanguage === 'esp') {
            document.documentElement.lang = 'es';
        } else {
            document.documentElement.lang = 'pt-BR';
        }

        setText('.navegarPaginas a[href="index.html"]', strings.navExplorar);
        setText('.navegarPaginas a[href="cursos.html"]', strings.navAprender);
        setText('.navegarPaginas a[href="vagas.html"]', strings.navVagas);
        setText('#idiomaLabel', strings.languageLabel);
        setText('#inputPesquisaDropdownTitle', strings.recentTitle);

        if (document.querySelector('.inputPesquisa')) {
            document.querySelector('.inputPesquisa').placeholder = strings.searchPlaceholder;
        }

        setAttribute('#messagesMenuButton', 'aria-label', strings.messagesButtonAria);
        setAttribute('#notificationsMenuButton', 'aria-label', strings.notificationsButtonAria);
        setAttribute('#perfilMenuButton', 'aria-label', strings.profileButtonAria);
        setAttribute('#optionsMenuButton', 'aria-label', strings.optionsButtonAria || 'Mais opções');

        translateElements(strings);

        var tendenciaElements = document.getElementsByClassName('Tmproj');
        for (var i = 0; i < tendenciaElements.length; i++) {
            tendenciaElements[i].textContent = strings.projectsTrend;
        }

        var explorarElemento = document.querySelector('[data-i18n="explorarElementoH1"]');
        if (explorarElemento) {
            explorarElemento.textContent = strings.explorarElementoH1;
        }
    };

    function initLanguageSelector() {
        var select = document.getElementById('idiomaSelect');
        if (!select) {
            return;
        }

        select.addEventListener('change', function () {
            var newLang = saveSelectedLanguage(select.value);
            if (newLang) {
                aplicarIdioma();
            }
        });
    }

    function init() {
        initLanguageSelector();
        aplicarIdioma();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();