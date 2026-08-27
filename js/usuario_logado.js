document.addEventListener('DOMContentLoaded', function () {
    var avatarBotao = document.querySelector('#perfilMenuButton img');
    var avatarMenu = document.querySelector('.perfilDropdownTop img');
    var nomeMenu = document.querySelector('.perfilDropdownInfo strong');
    var notificationsList = document.getElementById('notificationsList');
    var notificationsClearAllButton = document.getElementById('notificationsClearAllButton');
    var notificationsReloadButton = document.getElementById('notificationsReloadButton');
    var notificationsMenuButton = document.getElementById('notificationsMenuButton');
    
    // Variavel de controle para evitar multiplas chamadas simultaneas
    var isFetchingNotifications = false;

    if (!avatarBotao || !avatarMenu || !nomeMenu) {
        return;
    }

    // =========================================================
    // UTILITÁRIOS DA INTERFACE
    // =========================================================

    function buscarBotaoSairOuEntrar() {
        var itens = document.querySelectorAll('.perfilDropdownItem');
        for (var i = 0; i < itens.length; i++) {
            var span = itens[i].querySelector('span');
            if (!span) continue;

            var label = span.textContent.trim().toLowerCase();
            if (label === 'sair' || label === 'entrar') {
                return itens[i];
            }
        }
        return null;
    }

    function trocarParaEntrar(botao) {
        var span = botao.querySelector('span');
        var icon = botao.querySelector('img');

        if (span) span.textContent = 'Entrar';
        if (icon) icon.src = 'img/icons/email.svg';

        botao.onclick = function (event) {
            event.preventDefault();
            window.location.href = '/login.html';
        };
    }

    function configurarSair(botao) {
        var span = botao.querySelector('span');
        if (span) span.textContent = 'Sair';

        botao.onclick = async function (event) {
            event.preventDefault();
            try {
                // Rota padrão de logout conforme as instruções
                await fetch(ip_api + "/auth/logout", {
                    method: "POST",
                    credentials: "include"
                });
            } catch (error) {
                console.error("Erro ao realizar logout:", error);
            } finally {
                window.location.href = '/login.html';
            }
        };
    }

    function aplicarDadosNoHeader(usuario) {
        var nome = usuario.nome || 'Usuário';
        var foto = usuario.foto_perfil || 'img/userProfile.png';

        nomeMenu.textContent = nome;
        avatarBotao.src = foto;
        avatarMenu.src = foto;
    }

    function aplicarModoDeslogado() {
        nomeMenu.textContent = 'Visitante';
        avatarBotao.src = 'img/userProfile.png';
        avatarMenu.src = 'img/userProfilepreto.png';

        var botao = buscarBotaoSairOuEntrar();
        if (botao) {
            trocarParaEntrar(botao);
        }

        if (notificationsList) {
            notificationsList.innerHTML = '<p class="notificationsEmpty">Faça login para visualizar suas notificações.</p>';
        }

        if (notificationsClearAllButton) notificationsClearAllButton.disabled = true;
        if (notificationsReloadButton) notificationsReloadButton.disabled = true;
        if (notificationsMenuButton) notificationsMenuButton.classList.remove('has-unread');
    }

    function atualizarIndicadorNotificacoesNaoLidas(possuiNaoLidas) {
        if (!notificationsMenuButton) return;
        notificationsMenuButton.classList.toggle('has-unread', !!possuiNaoLidas);
    }

    // =========================================================
    // INTEGRAÇÃO COM A API - NOTIFICAÇÕES
    // =========================================================

    function renderizarNotificacoes(notificacoes) {
        if (!notificationsList) return;
        notificationsList.innerHTML = '';

        if (!Array.isArray(notificacoes) || !notificacoes.length) {
            notificationsList.innerHTML = '<p class="notificationsEmpty">Nenhuma notificação encontrada.</p>';
            atualizarIndicadorNotificacoesNaoLidas(false);
            return;
        }

        var possuiNaoLidas = false;

        notificacoes.forEach(function (notificacao) {
            var card = document.createElement('article');
            card.className = 'notificationCard';
            card.dataset.notificationId = String(notificacao.id);
            card.dataset.read = notificacao.lida ? '1' : '0';

            if (!notificacao.lida) {
                card.classList.add('is-unread');
                possuiNaoLidas = true;
            }

            // Como a nova API não retorna a foto do remetente, usamos um ícone padrão ou baseamos no tipo
            var iconePadrao = 'img/icons/sino.svg'; 
            
            card.innerHTML =
                '<img class="notificationAvatar" src="' + iconePadrao + '" alt="Notificação">' +
                '<div class="notificationContent">' +
                '<strong>' + (notificacao.titulo || 'Notificação') + '</strong>' +
                '<p>' + (notificacao.mensagem || '') + '</p>' +
                '</div>' +
                '<button type="button" class="notificationDeleteButton" data-delete-id="' + notificacao.id + '" aria-label="Excluir notificação">' +
                '<img src="img/icons/lixeira.svg" alt="Excluir">' +
                '</button>';

            notificationsList.appendChild(card);
        });

        atualizarIndicadorNotificacoesNaoLidas(possuiNaoLidas);
    }

    async function carregarNotificacoes() {
        if (!notificationsList || isFetchingNotifications) return;

        isFetchingNotifications = true;
        notificationsList.innerHTML = '<p class="notificationsEmpty">Carregando notificações...</p>';

        try {
            var response = await fetch(ip_api + '/notificacoes', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    aplicarModoDeslogado();
                    return;
                }
                throw new Error('Falha HTTP ao carregar notificações');
            }

            var data = await response.json();
            if (data.success && data.data) {
                renderizarNotificacoes(data.data);
            } else {
                throw new Error(data.message || 'Erro ao buscar notificações');
            }
        } catch (error) {
            console.error(error);
            notificationsList.innerHTML = '<p class="notificationsEmpty">Não foi possível carregar as notificações.</p>';
            atualizarIndicadorNotificacoesNaoLidas(false);
        } finally {
            isFetchingNotifications = false;
        }
    }

    async function marcarNotificacaoLida(idNotificacao) {
        try {
            var response = await fetch(ip_api + '/notificacoes/' + idNotificacao + '/lida', {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Falha ao marcar como lida');
            var data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Erro ao marcar notificação:', error);
            return false;
        }
    }

    async function excluirNotificacao(idNotificacao, btnExcluir) {
        btnExcluir.disabled = true; // Impede múltiplos cliques
        try {
            var response = await fetch(ip_api + '/notificacoes/' + idNotificacao, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await carregarNotificacoes();
            } else {
                throw new Error('Falha ao excluir notificação');
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
            btnExcluir.disabled = false;
        }
    }

    async function excluirTodasNotificacoes() {
        if (notificationsClearAllButton) notificationsClearAllButton.disabled = true;
        try {
            var response = await fetch(ip_api + '/notificacoes', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await carregarNotificacoes();
            } else {
                throw new Error('Falha ao limpar notificações');
            }
        } catch (error) {
            console.error('Erro ao limpar todas as notificações:', error);
        } finally {
            if (notificationsClearAllButton) notificationsClearAllButton.disabled = false;
        }
    }

    // =========================================================
    // INTEGRAÇÃO COM A API - USUÁRIO LOGADO E INICIALIZAÇÃO
    // =========================================================

    async function iniciarHeaderUsuario() {
        try {
            var response = await fetch(ip_api + '/auth/me', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                // Se for 401, o cookie não existe ou expirou
                aplicarModoDeslogado();
                return;
            }

            var data = await response.json();
            
            if (data.success && data.data && data.data.usuario) {
                aplicarDadosNoHeader(data.data.usuario);

                var botao = buscarBotaoSairOuEntrar();
                if (botao) {
                    configurarSair(botao);
                }

                if (notificationsClearAllButton) notificationsClearAllButton.disabled = false;
                if (notificationsReloadButton) notificationsReloadButton.disabled = false;

                carregarNotificacoes();
            } else {
                aplicarModoDeslogado();
            }
        } catch (error) {
            console.error("Erro ao verificar autenticação:", error);
            aplicarModoDeslogado();
        }
    }

    // =========================================================
    // EVENT LISTENERS DE NOTIFICAÇÕES
    // =========================================================

    if (notificationsList) {
        notificationsList.addEventListener('click', async function (event) {
            var deleteButton = event.target.closest('.notificationDeleteButton');
            
            if (deleteButton) {
                event.preventDefault();
                event.stopPropagation();

                var notificationId = deleteButton.dataset.deleteId;
                if (notificationId) {
                    await excluirNotificacao(notificationId, deleteButton);
                }
                return;
            }

            var card = event.target.closest('.notificationCard');
            if (card && card.dataset.read === '0') {
                var id = card.dataset.notificationId;
                if (id) {
                    var sucesso = await marcarNotificacaoLida(id);
                    if (sucesso) {
                        card.dataset.read = '1';
                        card.classList.remove('is-unread');

                        var aindaPossuiNaoLidas = !!notificationsList.querySelector('.notificationCard.is-unread');
                        atualizarIndicadorNotificacoesNaoLidas(aindaPossuiNaoLidas);
                    }
                }
            }
        });
    }

    if (notificationsClearAllButton) {
        notificationsClearAllButton.addEventListener('click', async function () {
            await excluirTodasNotificacoes();
        });
    }

    if (notificationsReloadButton) {
        notificationsReloadButton.addEventListener('click', function () {
            carregarNotificacoes();
        });
    }

    if (notificationsMenuButton) {
        notificationsMenuButton.addEventListener('click', function () {
            // Recarrega as notificações ao abrir o menu
            carregarNotificacoes();
        });
    }

    // Inicializa verificando a sessão do usuário no backend
    iniciarHeaderUsuario();
});document.addEventListener('DOMContentLoaded', function () {
    var avatarBotao = document.querySelector('#perfilMenuButton img');
    var avatarMenu = document.querySelector('.perfilDropdownTop img');
    var nomeMenu = document.querySelector('.perfilDropdownInfo strong');
    var notificationsList = document.getElementById('notificationsList');
    var notificationsClearAllButton = document.getElementById('notificationsClearAllButton');
    var notificationsReloadButton = document.getElementById('notificationsReloadButton');
    var notificationsMenuButton = document.getElementById('notificationsMenuButton');
    
    // Variavel de controle para evitar multiplas chamadas simultaneas
    var isFetchingNotifications = false;

    if (!avatarBotao || !avatarMenu || !nomeMenu) {
        return;
    }

    // =========================================================
    // UTILITÁRIOS DA INTERFACE
    // =========================================================

    function buscarBotaoSairOuEntrar() {
        var itens = document.querySelectorAll('.perfilDropdownItem');
        for (var i = 0; i < itens.length; i++) {
            var span = itens[i].querySelector('span');
            if (!span) continue;

            var label = span.textContent.trim().toLowerCase();
            if (label === 'sair' || label === 'entrar') {
                return itens[i];
            }
        }
        return null;
    }

    function trocarParaEntrar(botao) {
        var span = botao.querySelector('span');
        var icon = botao.querySelector('img');

        if (span) span.textContent = 'Entrar';
        if (icon) icon.src = 'img/icons/email.svg';

        botao.onclick = function (event) {
            event.preventDefault();
            window.location.href = '/login.html';
        };
    }

    function configurarSair(botao) {
        var span = botao.querySelector('span');
        if (span) span.textContent = 'Sair';

        botao.onclick = async function (event) {
            event.preventDefault();
            try {
                // Rota padrão de logout conforme as instruções
                await fetch(ip_api + "/auth/logout", {
                    method: "POST",
                    credentials: "include"
                });
            } catch (error) {
                console.error("Erro ao realizar logout:", error);
            } finally {
                window.location.href = '/login.html';
            }
        };
    }

    function aplicarDadosNoHeader(usuario) {
        var nome = usuario.nome || 'Usuário';
        var foto = usuario.foto_perfil || 'img/userProfile.png';

        nomeMenu.textContent = nome;
        avatarBotao.src = foto;
        avatarMenu.src = foto;
    }

    function aplicarModoDeslogado() {
        nomeMenu.textContent = 'Visitante';
        avatarBotao.src = 'img/userProfile.png';
        avatarMenu.src = 'img/userProfilepreto.png';

        var botao = buscarBotaoSairOuEntrar();
        if (botao) {
            trocarParaEntrar(botao);
        }

        if (notificationsList) {
            notificationsList.innerHTML = '<p class="notificationsEmpty">Faça login para visualizar suas notificações.</p>';
        }

        if (notificationsClearAllButton) notificationsClearAllButton.disabled = true;
        if (notificationsReloadButton) notificationsReloadButton.disabled = true;
        if (notificationsMenuButton) notificationsMenuButton.classList.remove('has-unread');
    }

    function atualizarIndicadorNotificacoesNaoLidas(possuiNaoLidas) {
        if (!notificationsMenuButton) return;
        notificationsMenuButton.classList.toggle('has-unread', !!possuiNaoLidas);
    }

    // =========================================================
    // INTEGRAÇÃO COM A API - NOTIFICAÇÕES
    // =========================================================

    function renderizarNotificacoes(notificacoes) {
        if (!notificationsList) return;
        notificationsList.innerHTML = '';

        if (!Array.isArray(notificacoes) || !notificacoes.length) {
            notificationsList.innerHTML = '<p class="notificationsEmpty">Nenhuma notificação encontrada.</p>';
            atualizarIndicadorNotificacoesNaoLidas(false);
            return;
        }

        var possuiNaoLidas = false;

        notificacoes.forEach(function (notificacao) {
            var card = document.createElement('article');
            card.className = 'notificationCard';
            card.dataset.notificationId = String(notificacao.id);
            card.dataset.read = notificacao.lida ? '1' : '0';

            if (!notificacao.lida) {
                card.classList.add('is-unread');
                possuiNaoLidas = true;
            }

            // Como a nova API não retorna a foto do remetente, usamos um ícone padrão ou baseamos no tipo
            var iconePadrao = 'img/icons/sino.svg'; 
            
            card.innerHTML =
                '<img class="notificationAvatar" src="' + iconePadrao + '" alt="Notificação">' +
                '<div class="notificationContent">' +
                '<strong>' + (notificacao.titulo || 'Notificação') + '</strong>' +
                '<p>' + (notificacao.mensagem || '') + '</p>' +
                '</div>' +
                '<button type="button" class="notificationDeleteButton" data-delete-id="' + notificacao.id + '" aria-label="Excluir notificação">' +
                '<img src="img/icons/lixeira.svg" alt="Excluir">' +
                '</button>';

            notificationsList.appendChild(card);
        });

        atualizarIndicadorNotificacoesNaoLidas(possuiNaoLidas);
    }

    async function carregarNotificacoes() {
        if (!notificationsList || isFetchingNotifications) return;

        isFetchingNotifications = true;
        notificationsList.innerHTML = '<p class="notificationsEmpty">Carregando notificações...</p>';

        try {
            var response = await fetch(ip_api + '/notificacoes', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    aplicarModoDeslogado();
                    return;
                }
                throw new Error('Falha HTTP ao carregar notificações');
            }

            var data = await response.json();
            if (data.success && data.data) {
                renderizarNotificacoes(data.data);
            } else {
                throw new Error(data.message || 'Erro ao buscar notificações');
            }
        } catch (error) {
            console.error(error);
            notificationsList.innerHTML = '<p class="notificationsEmpty">Não foi possível carregar as notificações.</p>';
            atualizarIndicadorNotificacoesNaoLidas(false);
        } finally {
            isFetchingNotifications = false;
        }
    }

    async function marcarNotificacaoLida(idNotificacao) {
        try {
            var response = await fetch(ip_api + '/notificacoes/' + idNotificacao + '/lida', {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Falha ao marcar como lida');
            var data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Erro ao marcar notificação:', error);
            return false;
        }
    }

    async function excluirNotificacao(idNotificacao, btnExcluir) {
        btnExcluir.disabled = true; // Impede múltiplos cliques
        try {
            var response = await fetch(ip_api + '/notificacoes/' + idNotificacao, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await carregarNotificacoes();
            } else {
                throw new Error('Falha ao excluir notificação');
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
            btnExcluir.disabled = false;
        }
    }

    async function excluirTodasNotificacoes() {
        if (notificationsClearAllButton) notificationsClearAllButton.disabled = true;
        try {
            var response = await fetch(ip_api + '/notificacoes', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                await carregarNotificacoes();
            } else {
                throw new Error('Falha ao limpar notificações');
            }
        } catch (error) {
            console.error('Erro ao limpar todas as notificações:', error);
        } finally {
            if (notificationsClearAllButton) notificationsClearAllButton.disabled = false;
        }
    }

    // =========================================================
    // INTEGRAÇÃO COM A API - USUÁRIO LOGADO E INICIALIZAÇÃO
    // =========================================================

    async function iniciarHeaderUsuario() {
        try {
            var response = await fetch(ip_api + '/auth/me', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                // Se for 401, o cookie não existe ou expirou
                aplicarModoDeslogado();
                return;
            }

            var data = await response.json();
            
            if (data.success && data.data && data.data.usuario) {
                aplicarDadosNoHeader(data.data.usuario);

                var botao = buscarBotaoSairOuEntrar();
                if (botao) {
                    configurarSair(botao);
                }

                if (notificationsClearAllButton) notificationsClearAllButton.disabled = false;
                if (notificationsReloadButton) notificationsReloadButton.disabled = false;

                carregarNotificacoes();
            } else {
                aplicarModoDeslogado();
            }
        } catch (error) {
            console.error("Erro ao verificar autenticação:", error);
            aplicarModoDeslogado();
        }
    }

    // =========================================================
    // EVENT LISTENERS DE NOTIFICAÇÕES
    // =========================================================

    if (notificationsList) {
        notificationsList.addEventListener('click', async function (event) {
            var deleteButton = event.target.closest('.notificationDeleteButton');
            
            if (deleteButton) {
                event.preventDefault();
                event.stopPropagation();

                var notificationId = deleteButton.dataset.deleteId;
                if (notificationId) {
                    await excluirNotificacao(notificationId, deleteButton);
                }
                return;
            }

            var card = event.target.closest('.notificationCard');
            if (card && card.dataset.read === '0') {
                var id = card.dataset.notificationId;
                if (id) {
                    var sucesso = await marcarNotificacaoLida(id);
                    if (sucesso) {
                        card.dataset.read = '1';
                        card.classList.remove('is-unread');

                        var aindaPossuiNaoLidas = !!notificationsList.querySelector('.notificationCard.is-unread');
                        atualizarIndicadorNotificacoesNaoLidas(aindaPossuiNaoLidas);
                    }
                }
            }
        });
    }

    if (notificationsClearAllButton) {
        notificationsClearAllButton.addEventListener('click', async function () {
            await excluirTodasNotificacoes();
        });
    }

    if (notificationsReloadButton) {
        notificationsReloadButton.addEventListener('click', function () {
            carregarNotificacoes();
        });
    }

    if (notificationsMenuButton) {
        notificationsMenuButton.addEventListener('click', function () {
            // Recarrega as notificações ao abrir o menu
            carregarNotificacoes();
        });
    }

    // Inicializa verificando a sessão do usuário no backend
    iniciarHeaderUsuario();
});