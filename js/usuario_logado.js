document.addEventListener('DOMContentLoaded', function () {
	var avatarBotao = document.querySelector('#perfilMenuButton img');
	var avatarMenu = document.querySelector('.perfilDropdownTop img');
	var nomeMenu = document.querySelector('.perfilDropdownInfo strong');
	var notificationsList = document.getElementById('notificationsList');
	var notificationsClearAllButton = document.getElementById('notificationsClearAllButton');
	var notificationsReloadButton = document.getElementById('notificationsReloadButton');
	var notificationsMenuButton = document.getElementById('notificationsMenuButton');
	var usuarioAtualId = null;
	var onboardingModalAtual = null;

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

	function getJsonLocal(chave) {
		try {
			var raw = localStorage.getItem(chave);
			return raw ? JSON.parse(raw) : null;
		} catch (error) {
			return null;
		}
	}

	function escapeHtml(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function normalizarTipoConta(usuario, fallback) {
		var tipo = String(
			(usuario && (usuario.tipo_usuario || usuario.tipo || usuario.tipo_conta)) ||
			fallback ||
			'padrao'
		).toLowerCase();

		if (tipo === 'empresa' || tipo === 'empresarial' || tipo === 'company') {
			return 'empresarial';
		}

		return 'padrao';
	}

	function usuarioTemOnboardingPendenteNaApi(usuario) {
		if (!usuario) {
			return false;
		}

		return usuario.onboarding_pendente === true ||
			usuario.onboardingPendente === true ||
			usuario.primeiro_acesso === true ||
			usuario.primeiro_login === true;
	}

	function getOnboardingParaUsuario(usuario, usuarioLocal) {
		if (!usuario || !usuario.id) {
			return null;
		}

		var chaveConcluido = 'seekOnboardingConcluido:' + usuario.id;
		var onboardingMarcado = getJsonLocal('seekOnboardingMostrar');

		try {
			if (localStorage.getItem(chaveConcluido) === '1') {
				if (onboardingMarcado && String(onboardingMarcado.id) === String(usuario.id)) {
					localStorage.removeItem('seekOnboardingMostrar');
				}
				return null;
			}
		} catch (error) {
			return null;
		}

		if (onboardingMarcado && String(onboardingMarcado.id) === String(usuario.id)) {
			return {
				id: usuario.id,
				tipo: normalizarTipoConta(usuario, onboardingMarcado.tipo || (usuarioLocal && usuarioLocal.tipo_usuario))
			};
		}

		if (usuarioTemOnboardingPendenteNaApi(usuario)) {
			return {
				id: usuario.id,
				tipo: normalizarTipoConta(usuario, usuarioLocal && usuarioLocal.tipo_usuario)
			};
		}

		return null;
	}

	function montarModalUsuarioPadrao(usuario) {
		var nomeUsuario = escapeHtml(usuario.nome_de_usuario || usuario.nome || '');
		var descricao = escapeHtml(usuario.descricao || '');
		var foto = escapeHtml(usuario.foto || 'img/icons/capaprojetopreto.svg');

		return '' +
			'<section class="primeiro-acesso-modal__card primeiro-acesso-modal__card--padrao" role="dialog" aria-modal="true" aria-labelledby="primeiroAcessoTitulo">' +
			'<header class="primeiro-acesso-modal__header">' +
			'<h2 id="primeiroAcessoTitulo">BEM-VINDO(A)</h2>' +
			'<button type="button" class="primeiro-acesso-modal__close" aria-label="Fechar" data-primeiro-acesso-fechar>&times;</button>' +
			'</header>' +
			'<form class="primeiro-acesso-modal__body">' +
			'<p class="primeiro-acesso-modal__subtitle">Antes de prosseguir, preencha os dados abaixo</p>' +
			'<div class="primeiro-acesso-form primeiro-acesso-form--padrao">' +
			'<aside class="primeiro-acesso-form__side">' +
			'<label class="primeiro-acesso-avatar">' +
			'<input type="file" accept="image/*" data-primeiro-acesso-foto>' +
			'<span class="primeiro-acesso-avatar__circle">' +
			'<img class="primeiro-acesso-avatar__preview" src="' + foto + '" alt="">' +
			'<span class="primeiro-acesso-avatar__plus">+</span>' +
			'</span>' +
			'<span>Adicionar foto de perfil</span>' +
			'</label>' +
			'<label class="primeiro-acesso-field primeiro-acesso-field--required">' +
			'<span>Obrigatorio *</span>' +
			'<input type="text" name="nome_de_usuario" value="' + nomeUsuario + '" placeholder="Nome de Usuario" data-onboarding-field required>' +
			'</label>' +
			'<label class="primeiro-acesso-field">' +
			'<input type="text" name="profissao" placeholder="Sua Profissao" data-onboarding-field>' +
			'</label>' +
			'</aside>' +
			'<div class="primeiro-acesso-form__divider" aria-hidden="true"></div>' +
			'<div class="primeiro-acesso-form__main">' +
			'<fieldset class="primeiro-acesso-fieldset">' +
			'<legend>Possui alguma deficiencia?</legend>' +
			'<label><input type="radio" name="possui_deficiencia" value="sim" data-onboarding-field> sim</label>' +
			'<label><input type="radio" name="possui_deficiencia" value="nao" data-onboarding-field checked> nao</label>' +
			'</fieldset>' +
			'<fieldset class="primeiro-acesso-fieldset primeiro-acesso-fieldset--muted">' +
			'<legend>Qual tipo?</legend>' +
			'<label><input type="checkbox" name="deficiencia_tipo" value="motora" data-onboarding-field> motora</label>' +
			'<label><input type="checkbox" name="deficiencia_tipo" value="fisica" data-onboarding-field> fisica</label>' +
			'<label><input type="checkbox" name="deficiencia_tipo" value="neurodivergente" data-onboarding-field> neurodivergente</label>' +
			'</fieldset>' +
			'<label class="primeiro-acesso-select">' +
			'<span>Qual seria?</span>' +
			'<select name="qual_deficiencia" data-onboarding-field>' +
			'<option value=""></option>' +
			'<option value="baixa_visao">Baixa visao</option>' +
			'<option value="daltonismo">Daltonismo</option>' +
			'<option value="mobilidade_reduzida">Mobilidade reduzida</option>' +
			'<option value="tdah">TDAH</option>' +
			'<option value="autismo">Autismo</option>' +
			'</select>' +
			'</label>' +
			'<fieldset class="primeiro-acesso-fieldset primeiro-acesso-fieldset--compact">' +
			'<legend>Quer usar barra de acessibilidade?</legend>' +
			'<label><input type="radio" name="usa_barra_acessibilidade" value="sim" data-onboarding-field> sim</label>' +
			'<label><input type="radio" name="usa_barra_acessibilidade" value="nao" data-onboarding-field> nao</label>' +
			'</fieldset>' +
			'<label class="primeiro-acesso-textarea">' +
			'<span>Descricao</span>' +
			'<textarea name="descricao" data-onboarding-field>' + descricao + '</textarea>' +
			'</label>' +
			'<div class="primeiro-acesso-section-row">' +
			'<span>Certificados</span>' +
			'<button type="button" class="primeiro-acesso-pill-button" data-primeiro-acesso-secoes>Adicionar secao ao perfil</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'<div class="primeiro-acesso-section-menu" hidden>' +
			'<h3>Adicionar secao</h3>' +
			'<button type="button">Adicionar Cargo</button>' +
			'<button type="button">Adicionar Experiencia</button>' +
			'<button type="button">Adicionar Cursos</button>' +
			'<button type="button">Adicionar Formacao Academica</button>' +
			'<button type="button">Adicionar Certificados</button>' +
			'</div>' +
			'<button type="submit" class="primeiro-acesso-next" aria-label="Concluir cadastro inicial">&rarr;</button>' +
			'</form>' +
			'</section>';
	}

	function montarModalEmpresa(usuario) {
		var nome = escapeHtml(usuario.nome || '');
		var descricao = escapeHtml(usuario.descricao || '');
		var cnpj = escapeHtml(usuario.cnpj || '');
		var foto = escapeHtml(usuario.foto || 'img/icons/capaprojetopreto.svg');

		return '' +
			'<section class="primeiro-acesso-modal__card primeiro-acesso-modal__card--empresa" role="dialog" aria-modal="true" aria-labelledby="primeiroAcessoTitulo">' +
			'<header class="primeiro-acesso-modal__header">' +
			'<h2 id="primeiroAcessoTitulo">BEM-VINDO(A)</h2>' +
			'<button type="button" class="primeiro-acesso-modal__close" aria-label="Fechar" data-primeiro-acesso-fechar>&times;</button>' +
			'</header>' +
			'<form class="primeiro-acesso-modal__body">' +
			'<p class="primeiro-acesso-modal__subtitle">Antes de prosseguir, preencha os dados abaixo</p>' +
			'<div class="primeiro-acesso-form primeiro-acesso-form--empresa">' +
			'<aside class="primeiro-acesso-form__side">' +
			'<label class="primeiro-acesso-avatar">' +
			'<input type="file" accept="image/*" data-primeiro-acesso-foto>' +
			'<span class="primeiro-acesso-avatar__circle">' +
			'<img class="primeiro-acesso-avatar__preview" src="' + foto + '" alt="">' +
			'<span class="primeiro-acesso-avatar__plus">+</span>' +
			'</span>' +
			'<span>Adicionar foto de perfil</span>' +
			'</label>' +
			'<label class="primeiro-acesso-textarea primeiro-acesso-textarea--empresa">' +
			'<span>Descricao</span>' +
			'<textarea name="descricao" data-onboarding-field>' + descricao + '</textarea>' +
			'</label>' +
			'</aside>' +
			'<div class="primeiro-acesso-form__divider" aria-hidden="true"></div>' +
			'<div class="primeiro-acesso-form__main">' +
			'<h3 class="primeiro-acesso-company-title">Informacao</h3>' +
			'<div class="primeiro-acesso-company-grid">' +
			'<label class="primeiro-acesso-field primeiro-acesso-field--required">' +
			'<span>Obrigatorio *</span>' +
			'<input type="text" name="nome" value="' + nome + '" placeholder="Nome da Empresa" data-onboarding-field required>' +
			'</label>' +
			'<label class="primeiro-acesso-field primeiro-acesso-field--required">' +
			'<span>Obrigatorio *</span>' +
			'<input type="text" name="categoria_negocio" placeholder="Categoria de Negocio" data-onboarding-field required>' +
			'</label>' +
			'<label class="primeiro-acesso-field primeiro-acesso-field--required">' +
			'<span>Obrigatorio *</span>' +
			'<input type="tel" name="telefone" placeholder="Telefone" data-onboarding-field required>' +
			'</label>' +
			'<label class="primeiro-acesso-field primeiro-acesso-field--required">' +
			'<span>Obrigatorio *</span>' +
			'<input type="text" name="cnpj" value="' + cnpj + '" placeholder="CNPJ" data-onboarding-field required>' +
			'</label>' +
			'<label class="primeiro-acesso-field primeiro-acesso-field--with-action">' +
			'<input type="text" name="endereco" placeholder="Adicionar Endereco" data-onboarding-field>' +
			'<strong>+</strong>' +
			'</label>' +
			'<label class="primeiro-acesso-field">' +
			'<input type="text" name="data_fundacao" placeholder="Data de fundacao" data-onboarding-field>' +
			'</label>' +
			'</div>' +
			'<div class="primeiro-acesso-company-footer">' +
			'<span>Complementar</span>' +
			'<button type="button" class="primeiro-acesso-pill-button" data-primeiro-acesso-secoes>Adicionar secao ao perfil</button>' +
			'<button type="button" class="primeiro-acesso-add-floating" data-primeiro-acesso-secoes aria-label="Adicionar secao">+</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'<div class="primeiro-acesso-section-menu" hidden>' +
			'<h3>Adicionar secao</h3>' +
			'<button type="button">Adicionar Vagas</button>' +
			'<button type="button">Adicionar Projetos</button>' +
			'<button type="button">Adicionar Equipe</button>' +
			'<button type="button">Adicionar Certificados</button>' +
			'</div>' +
			'<button type="submit" class="primeiro-acesso-next" aria-label="Concluir cadastro inicial">&rarr;</button>' +
			'</form>' +
			'</section>';
	}

	function configurarPreviewFoto(modal) {
		var inputFoto = modal.querySelector('[data-primeiro-acesso-foto]');
		var preview = modal.querySelector('.primeiro-acesso-avatar__preview');

		if (!inputFoto || !preview) {
			return;
		}

		inputFoto.addEventListener('change', function () {
			var arquivo = inputFoto.files && inputFoto.files[0];
			if (!arquivo) {
				return;
			}

			var reader = new FileReader();
			reader.onload = function (event) {
				preview.src = event.target.result;
				preview.classList.add('has-custom-image');
			};
			reader.readAsDataURL(arquivo);
		});
	}

	function coletarDadosOnboarding(modal) {
		var formData = new FormData();
		var possuiDados = false;
		var inputFoto = modal.querySelector('[data-primeiro-acesso-foto]');
		var campos = modal.querySelectorAll('[data-onboarding-field]');

		if (inputFoto && inputFoto.files && inputFoto.files[0]) {
			formData.append('foto', inputFoto.files[0]);
			possuiDados = true;
		}

		campos.forEach(function (campo) {
			if (!campo.name) {
				return;
			}

			if ((campo.type === 'checkbox' || campo.type === 'radio') && !campo.checked) {
				return;
			}

			var valor = String(campo.value || '').trim();
			if (!valor) {
				return;
			}

			formData.append(campo.name, valor);
			possuiDados = true;
		});

		return possuiDados ? formData : null;
	}

	async function salvarOnboardingMelhorEsforco(usuario, modal) {
		var dados = coletarDadosOnboarding(modal);

		if (!dados || !usuario || !usuario.id) {
			return;
		}

		try {
			await fetch(ip_api + '/usuarios/' + usuario.id, {
				method: 'PUT',
				body: dados
			});
		} catch (error) {
			console.warn('Nao foi possivel salvar os dados do primeiro acesso.', error);
		}
	}

	function fecharOnboardingPrimeiroAcesso(idUsuario) {
		if (!onboardingModalAtual) {
			return;
		}

		try {
			localStorage.setItem('seekOnboardingConcluido:' + idUsuario, '1');
			localStorage.removeItem('seekOnboardingMostrar');
		} catch (error) {
			// Sem localStorage, apenas fecha o modal desta sessao.
		}

		onboardingModalAtual.remove();
		onboardingModalAtual = null;
		document.body.classList.remove('primeiro-acesso-aberto');
		document.documentElement.classList.remove('primeiro-acesso-aberto');
	}

	function abrirOnboardingPrimeiroAcesso(usuario, usuarioLocal) {
		var onboarding = getOnboardingParaUsuario(usuario, usuarioLocal);

		if (!onboarding || onboardingModalAtual) {
			return;
		}

		var modal = document.createElement('div');
		modal.className = 'primeiro-acesso-modal';
		modal.innerHTML =
			'<div class="primeiro-acesso-modal__backdrop" aria-hidden="true"></div>' +
			(onboarding.tipo === 'empresarial' ? montarModalEmpresa(usuario) : montarModalUsuarioPadrao(usuario));

		document.body.appendChild(modal);
		document.body.classList.add('primeiro-acesso-aberto');
		document.documentElement.classList.add('primeiro-acesso-aberto');
		onboardingModalAtual = modal;

		configurarPreviewFoto(modal);

		modal.addEventListener('click', function (event) {
			var botaoFechar = event.target.closest('[data-primeiro-acesso-fechar]');
			var botaoSecoes = event.target.closest('[data-primeiro-acesso-secoes]');
			var menuSecoes = modal.querySelector('.primeiro-acesso-section-menu');

			if (botaoFechar) {
				fecharOnboardingPrimeiroAcesso(usuario.id);
				return;
			}

			if (botaoSecoes && menuSecoes) {
				menuSecoes.hidden = !menuSecoes.hidden;
			}
		});

		var form = modal.querySelector('form');
		if (form) {
			form.addEventListener('submit', async function (event) {
				event.preventDefault();

				var botao = form.querySelector('.primeiro-acesso-next');
				if (botao) {
					botao.disabled = true;
				}

				await salvarOnboardingMelhorEsforco(usuario, modal);
				fecharOnboardingPrimeiroAcesso(usuario.id);
			});
		}

		document.addEventListener('keydown', function fecharComEscape(event) {
			if (!onboardingModalAtual) {
				document.removeEventListener('keydown', fecharComEscape);
				return;
			}

			if (event.key === 'Escape') {
				fecharOnboardingPrimeiroAcesso(usuario.id);
				document.removeEventListener('keydown', fecharComEscape);
			}
		});

		var primeiroCampo = modal.querySelector('input:not([type="file"]), textarea, select, button');
		if (primeiroCampo) {
			primeiroCampo.focus();
		}
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

		if (notificationsMenuButton) {
			notificationsMenuButton.classList.remove('has-unread');
		}
	}

	function atualizarIndicadorNotificacoesNaoLidas(possuiNaoLidas) {
		if (!notificationsMenuButton) {
			return;
		}

		notificationsMenuButton.classList.toggle('has-unread', !!possuiNaoLidas);
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
			atualizarIndicadorNotificacoesNaoLidas(false);
			return;
		}

		var possuiNaoLidas = false;

		notificacoes.forEach(function (notificacao) {
			var card = document.createElement('article');
			card.className = 'notificationCard';
			card.dataset.notificationId = String(notificacao.id);
			card.dataset.read = String(notificacao.lida);

			if (Number(notificacao.lida) === 0) {
				card.classList.add('is-unread');
				possuiNaoLidas = true;
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

		atualizarIndicadorNotificacoesNaoLidas(possuiNaoLidas);
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
			atualizarIndicadorNotificacoesNaoLidas(false);
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
				tipo_usuario: usuarioApi.tipo_usuario || usuarioApi.tipo || usuarioLocal.tipo_usuario || '',
				token: usuarioLocal.token || ''
			});

			abrirOnboardingPrimeiroAcesso(usuarioApi, usuarioLocal);

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
			abrirOnboardingPrimeiroAcesso(usuarioLocal, usuarioLocal);
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

					var aindaPossuiNaoLidas = !!notificationsList.querySelector('.notificationCard.is-unread');
					atualizarIndicadorNotificacoesNaoLidas(aindaPossuiNaoLidas);
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
