document.addEventListener('DOMContentLoaded', function () {
	var avatarBotao = document.querySelector('#perfilMenuButton img');
	var avatarMenu = document.querySelector('.perfilDropdownTop img');
	var nomeMenu = document.querySelector('.perfilDropdownInfo strong');
	var notificationsList = document.getElementById('notificationsList');
	var notificationsClearAllButton = document.getElementById('notificationsClearAllButton');
	var notificationsReloadButton = document.getElementById('notificationsReloadButton');
	var notificationsMenuButton = document.getElementById('notificationsMenuButton');
	var usuarioAtualId = null;

	if (!avatarBotao || !avatarMenu || !nomeMenu) {
		return;
	}

	function buscarBotaoSairOuEntrar() {
		var itens = document.querySelectorAll('.perfilDropdownItem');

		for (var i = 0; i < itens.length; i++) {
			var span = itens[i].querySelector('span');
			if (!span) {
				continue;
			}

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

		if (span) {
			span.textContent = 'Entrar';
		}

		if (icon) {
			icon.src = 'img/icons/email.svg';
		}

		botao.onclick = function (event) {
			event.preventDefault();
			window.location.href = '/login.html';
		};
	}

	function configurarSair(botao) {
		botao.onclick = function (event) {
			event.preventDefault();
			limparUsuarioLogado();
			window.location.href = '/login.html';
		};
	}

	function aplicarDadosNoHeader(usuario) {
		var nome = usuario.nome || usuario.nome_de_usuario || 'Usuario';
		var foto = usuario.foto || 'img/userProfile.png';

		nomeMenu.textContent = nome;
		avatarBotao.src = foto;
		avatarMenu.src = foto;
	}

	async function carregarUsuarioDaApi(idUsuario) {
		var response = await fetch(ip_api + '/usuarios/' + idUsuario);
		if (!response.ok) {
			throw new Error('Nao foi possivel carregar usuario');
		}

		var data = await response.json();
		if (!Array.isArray(data) || !data[0]) {
			throw new Error('Usuario nao encontrado');
		}

		return data[0];
	}

	function aplicarModoDeslogado() {
		nomeMenu.textContent = 'Visitante';
		avatarBotao.src = 'img/userProfile.png';
		avatarMenu.src = 'img/userProfilepreto.png';
		usuarioAtualId = null;

		var botao = buscarBotaoSairOuEntrar();
		if (botao) {
			trocarParaEntrar(botao);
		}

		if (notificationsList) {
			notificationsList.innerHTML = '<p class="notificationsEmpty">Faca login para visualizar suas notificacoes.</p>';
		}

		if (notificationsClearAllButton) {
			notificationsClearAllButton.disabled = true;
		}

		if (notificationsReloadButton) {
			notificationsReloadButton.disabled = true;
		}
	}

	function mensagemTipoNotificacao(notificacao) {
		if (notificacao.tipo === 'comentario') {
			return 'comentou no seu post';
		}

		if (notificacao.tipo === 'resposta') {
			return 'respondeu um comentario seu';
		}

		if (notificacao.tipo === 'like') {
			return 'curtiu seu post';
		}

		return 'enviou uma notificacao';
	}

	function renderizarNotificacoes(notificacoes) {
		if (!notificationsList) {
			return;
		}

		notificationsList.innerHTML = '';

		if (!Array.isArray(notificacoes) || !notificacoes.length) {
			notificationsList.innerHTML = '<p class="notificationsEmpty">Nenhuma notificacao encontrada.</p>';
			return;
		}

		notificacoes.forEach(function (notificacao) {
			var card = document.createElement('article');
			card.className = 'notificationCard';
			card.dataset.notificationId = String(notificacao.id);
			card.dataset.read = String(notificacao.lida);

			if (Number(notificacao.lida) === 0) {
				card.classList.add('is-unread');
			}

			var remetenteNome = notificacao.remetente_nome || 'Usuario';
			var remetenteFoto = notificacao.remetente_foto || 'img/userProfile.png';

			card.innerHTML =
				'<img class="notificationAvatar" src="' + remetenteFoto + '" alt="">' +
				'<div class="notificationContent">' +
				'<strong>' + remetenteNome + '</strong>' +
				'<p>' + mensagemTipoNotificacao(notificacao) + '</p>' +
				'</div>' +
				'<button type="button" class="notificationDeleteButton" data-delete-id="' + notificacao.id + '" aria-label="Excluir notificacao">' +
				'<img src="img/icons/lixeira.svg" alt="">' +
				'</button>';

			notificationsList.appendChild(card);
		});
	}

	async function buscarNotificacoes(idUsuario) {
		var response = await fetch(ip_api + '/notificacoes/' + idUsuario);

		if (!response.ok) {
			throw new Error('Falha ao carregar notificacoes');
		}

		return response.json();
	}

	async function marcarNotificacaoLida(idNotificacao, idUsuario) {
		await fetch(ip_api + '/notificacoes/' + idNotificacao + '/lida', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				destinatario_id: idUsuario
			})
		});
	}

	async function excluirNotificacao(idNotificacao, idUsuario) {
		await fetch(ip_api + '/notificacoes/' + idNotificacao, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				destinatario_id: idUsuario
			})
		});
	}

	async function excluirTodasNotificacoes(idUsuario) {
		await fetch(ip_api + '/notificacoes/usuario/' + idUsuario, {
			method: 'DELETE'
		});
	}

	async function carregarNotificacoes(idUsuario) {
		if (!notificationsList || !idUsuario) {
			return;
		}

		notificationsList.innerHTML = '<p class="notificationsEmpty">Carregando notificacoes...</p>';

		try {
			var lista = await buscarNotificacoes(idUsuario);
			renderizarNotificacoes(lista);
		} catch (error) {
			notificationsList.innerHTML = '<p class="notificationsEmpty">Nao foi possivel carregar notificacoes.</p>';
		}
	}

	async function iniciarHeaderUsuario() {
		var usuarioLocal = getUsuarioLogado();

		if (!usuarioLocal || !usuarioLocal.id) {
			aplicarModoDeslogado();
			return;
		}

		var botao = buscarBotaoSairOuEntrar();
		if (botao) {
			configurarSair(botao);
		}

		try {
			var usuarioApi = await carregarUsuarioDaApi(usuarioLocal.id);
			aplicarDadosNoHeader(usuarioApi);
			usuarioAtualId = usuarioApi.id;

			setUsuarioLogado({
				id: usuarioApi.id,
				nome: usuarioApi.nome,
				foto: usuarioApi.foto,
				tema: usuarioApi.tema,
				token: usuarioLocal.token || ''
			});

			if (notificationsClearAllButton) {
				notificationsClearAllButton.disabled = false;
			}

			if (notificationsReloadButton) {
				notificationsReloadButton.disabled = false;
			}

			carregarNotificacoes(usuarioAtualId);
		} catch (error) {
			aplicarDadosNoHeader(usuarioLocal);
			usuarioAtualId = usuarioLocal.id;
			carregarNotificacoes(usuarioAtualId);
		}
	}

	if (notificationsList) {
		notificationsList.addEventListener('click', async function (event) {
			if (!usuarioAtualId) {
				return;
			}

			var deleteButton = event.target.closest('.notificationDeleteButton');
			if (deleteButton) {
				event.preventDefault();
				event.stopPropagation();

				var notificationId = deleteButton.dataset.deleteId;
				if (!notificationId) {
					return;
				}

				await excluirNotificacao(notificationId, usuarioAtualId);
				carregarNotificacoes(usuarioAtualId);
				return;
			}

			var card = event.target.closest('.notificationCard');
			if (!card) {
				return;
			}

			if (card.dataset.read === '0') {
				var id = card.dataset.notificationId;
				if (id) {
					await marcarNotificacaoLida(id, usuarioAtualId);
					card.dataset.read = '1';
					card.classList.remove('is-unread');
				}
			}
		});
	}

	if (notificationsClearAllButton) {
		notificationsClearAllButton.addEventListener('click', async function () {
			if (!usuarioAtualId) {
				return;
			}

			await excluirTodasNotificacoes(usuarioAtualId);
			carregarNotificacoes(usuarioAtualId);
		});
	}

	if (notificationsReloadButton) {
		notificationsReloadButton.addEventListener('click', function () {
			if (!usuarioAtualId) {
				return;
			}

			carregarNotificacoes(usuarioAtualId);
		});
	}

	if (notificationsMenuButton) {
		notificationsMenuButton.addEventListener('click', function () {
			if (!usuarioAtualId) {
				return;
			}

			carregarNotificacoes(usuarioAtualId);
		});
	}

	iniciarHeaderUsuario();
});
