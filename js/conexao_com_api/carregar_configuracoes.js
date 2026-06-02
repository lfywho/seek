document.addEventListener('DOMContentLoaded', function () {
	var fotoPerfil = document.getElementById('configuracoesPerfilFoto');
	var nomePerfil = document.getElementById('configuracoesPerfilNome');
	var localizacaoPerfil = document.getElementById('configuracoesPerfilLocalizacao');
	var fotoInput = document.getElementById('configuracoesFotoInput');
	var bannerInput = document.getElementById('configuracoesBannerInput');
	var nomeInput = document.getElementById('configuracoesNomeInput');
	var usernameInput = document.getElementById('configuracoesUsernameInput');
	var descricaoInput = document.getElementById('configuracoesDescricaoInput');
	var salvarInformacoesButton = document.getElementById('configuracoesSalvarInformacoes');
	var informacoesFeedback = document.getElementById('configuracoesInformacoesFeedback');
	var notificacoesLista = document.getElementById('configuracoesNotificacoesLista');
	var usuarioAtual = null;
	var textosNotificacoes = {
		receber_comentarios: {
			titulo: 'Comentários',
			descricao: 'Receba avisos quando alguem comentar nos seus posts.'
		},
		receber_likes: {
			titulo: 'Curtidas',
			descricao: 'Receba avisos quando alguem curtir seus posts.'
		},
		receber_login: {
			titulo: 'Login',
			descricao: 'Receba avisos sobre acessos e atividades de login.'
		},
		receber_seguidores: {
			titulo: 'Seguidores',
			descricao: 'Receba avisos quando alguem comecar a seguir voce.'
		}
	};

	if (!fotoPerfil || !nomePerfil || !localizacaoPerfil) {
		return;
	}

	function aplicarDadosNoAside(usuario) {
		var nome = usuario.nome || usuario.nome_de_usuario || 'Usuario';
		var foto = usuario.foto || 'img/userProfilepreto.png';
		var localizacao = usuario.localizacao || usuario.cidade || usuario.endereco || 'Sao Paulo - Matao';

		nomePerfil.textContent = nome;
		fotoPerfil.src = foto;
		fotoPerfil.alt = 'Foto de perfil de ' + nome;
		localizacaoPerfil.textContent = localizacao;
	}

	function preencherFormularioInformacoes(usuario) {
		if (nomeInput) {
			nomeInput.value = usuario.nome || '';
		}

		if (usernameInput) {
			usernameInput.value = usuario.nome_de_usuario || '';
		}

		if (descricaoInput) {
			descricaoInput.value = usuario.descricao || '';
		}
	}

	function mostrarFeedbackInformacoes(mensagem, erro) {
		if (!informacoesFeedback) {
			return;
		}

		informacoesFeedback.textContent = mensagem;
		informacoesFeedback.style.color = erro ? '#b91c1c' : '#166534';
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

	async function atualizarUsuarioNaApi(idUsuario, formData) {
		var response = await fetch(ip_api + '/usuarios/' + idUsuario, {
			method: 'PUT',
			body: formData
		});

		if (!response.ok) {
			throw new Error('Nao foi possivel atualizar usuario');
		}

		return response.json();
	}

	async function carregarPreferenciasNotificacoesDaApi(idUsuario) {
		var response = await fetch(ip_api + '/usuarios/preferencias-notificacoes/' + idUsuario);

		if (!response.ok) {
			throw new Error('Nao foi possivel carregar preferencias de notificacoes');
		}

		return response.json();
	}

	async function atualizarPreferenciaNotificacaoNaApi(idUsuario, nomeNotificacao, preferencia) {
		var response = await fetch(ip_api + '/usuarios/preferencias-notificacoes/' + idUsuario, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				nome_notificacao: nomeNotificacao,
				preferencia: String(preferencia)
			})
		});

		if (!response.ok) {
			throw new Error('Nao foi possivel atualizar preferencia de notificacao');
		}

		return response.json();
	}

	function getTextoNotificacao(nomeNotificacao) {
		if (textosNotificacoes[nomeNotificacao]) {
			return textosNotificacoes[nomeNotificacao];
		}

		return {
			titulo: nomeNotificacao.replace(/_/g, ' '),
			descricao: 'Ative ou desative esta preferencia de notificacao.'
		};
	}

	function renderizarPreferenciasNotificacoes(preferencias) {
		if (!notificacoesLista) {
			return;
		}

		notificacoesLista.innerHTML = '';

		if (!Array.isArray(preferencias) || !preferencias.length) {
			notificacoesLista.innerHTML = '<p class="field-note">Nenhuma preferencia de notificacao encontrada.</p>';
			return;
		}

		preferencias.forEach(function (preferencia) {
			var texto = getTextoNotificacao(preferencia.nome_notificacao);
			var row = document.createElement('div');
			var content = document.createElement('div');
			var titulo = document.createElement('strong');
			var descricao = document.createElement('span');
			var label = document.createElement('label');
			var input = document.createElement('input');
			var slider = document.createElement('span');

			row.className = 'panel-row panel-row--split';
			titulo.textContent = texto.titulo;
			descricao.textContent = texto.descricao;

			label.className = 'toggle';
			input.type = 'checkbox';
			input.checked = Number(preferencia.preferencia) === 1;
			input.dataset.nomeNotificacao = preferencia.nome_notificacao;

			label.appendChild(input);
			label.appendChild(slider);
			content.appendChild(titulo);
			content.appendChild(descricao);
			row.appendChild(content);
			row.appendChild(label);
			notificacoesLista.appendChild(row);
		});
	}

	async function carregarPreferenciasNotificacoes(idUsuario) {
		if (!notificacoesLista || !idUsuario) {
			return;
		}

		notificacoesLista.innerHTML = '<p class="field-note">Carregando preferencias de notificacoes...</p>';

		try {
			var preferencias = await carregarPreferenciasNotificacoesDaApi(idUsuario);
			renderizarPreferenciasNotificacoes(preferencias);
		} catch (error) {
			notificacoesLista.innerHTML = '<p class="field-note">Nao foi possivel carregar suas preferencias de notificacoes.</p>';
		}
	}

	async function alterarPreferenciaNotificacao(event) {
		var input = event.target;

		if (!input || input.type !== 'checkbox' || !input.dataset.nomeNotificacao || !usuarioAtual || !usuarioAtual.id) {
			return;
		}

		var valorAnterior = input.checked ? 0 : 1;
		var novoValor = input.checked ? 1 : 0;

		input.disabled = true;

		try {
			await atualizarPreferenciaNotificacaoNaApi(usuarioAtual.id, input.dataset.nomeNotificacao, novoValor);
		} catch (error) {
			input.checked = Number(valorAnterior) === 1;
			alert('Nao foi possivel atualizar esta preferencia de notificacao.');
		} finally {
			input.disabled = false;
		}
	}

	function montarFormDataAlteracoes() {
		var formData = new FormData();
		var possuiAlteracao = false;

		if (fotoInput && fotoInput.files && fotoInput.files[0]) {
			formData.append('foto', fotoInput.files[0]);
			possuiAlteracao = true;
		}

		if (bannerInput && bannerInput.files && bannerInput.files[0]) {
			formData.append('banner', bannerInput.files[0]);
			possuiAlteracao = true;
		}

		if (nomeInput && nomeInput.value !== (usuarioAtual.nome || '')) {
			formData.append('nome', nomeInput.value);
			possuiAlteracao = true;
		}

		if (usernameInput && usernameInput.value !== (usuarioAtual.nome_de_usuario || '')) {
			formData.append('nome_de_usuario', usernameInput.value);
			possuiAlteracao = true;
		}

		if (descricaoInput && descricaoInput.value !== (usuarioAtual.descricao || '')) {
			formData.append('descricao', descricaoInput.value);
			possuiAlteracao = true;
		}

		return possuiAlteracao ? formData : null;
	}

	function atualizarUsuarioLogado(usuarioAtualizado) {
		if (typeof setUsuarioLogado !== 'function' || typeof getUsuarioLogado !== 'function') {
			return;
		}

		var usuarioLocal = getUsuarioLogado() || {};
		setUsuarioLogado({
			id: usuarioAtualizado.id,
			nome: usuarioAtualizado.nome,
			foto: usuarioAtualizado.foto,
			tema: usuarioAtualizado.tema,
			token: usuarioLocal.token || ''
		});
	}

	async function salvarInformacoesUsuario() {
		if (!usuarioAtual || !usuarioAtual.id) {
			mostrarFeedbackInformacoes('Usuario nao encontrado. Faca login novamente.', true);
			return;
		}

		var formData = montarFormDataAlteracoes();
		if (!formData) {
			mostrarFeedbackInformacoes('Nenhuma alteracao para salvar.', false);
			return;
		}

		if (salvarInformacoesButton) {
			salvarInformacoesButton.disabled = true;
			salvarInformacoesButton.textContent = 'Salvando...';
		}

		mostrarFeedbackInformacoes('', false);

		try {
			await atualizarUsuarioNaApi(usuarioAtual.id, formData);

			var usuarioAtualizado = await carregarUsuarioDaApi(usuarioAtual.id);
			usuarioAtual = usuarioAtualizado;
			aplicarDadosNoAside(usuarioAtualizado);
			preencherFormularioInformacoes(usuarioAtualizado);
			atualizarUsuarioLogado(usuarioAtualizado);

			if (fotoInput) {
				fotoInput.value = '';
			}

			if (bannerInput) {
				bannerInput.value = '';
			}

			mostrarFeedbackInformacoes('Informacoes salvas com sucesso.', false);
		} catch (error) {
			mostrarFeedbackInformacoes('Nao foi possivel salvar suas informacoes.', true);
		} finally {
			if (salvarInformacoesButton) {
				salvarInformacoesButton.disabled = false;
				salvarInformacoesButton.textContent = 'Salvar';
			}
		}
	}

	async function carregarConfiguracoesUsuario() {
		if (typeof getUsuarioLogado !== 'function') {
			return;
		}

		var usuarioLocal = getUsuarioLogado();
		if (!usuarioLocal || !usuarioLocal.id) {
			return;
		}

		usuarioAtual = usuarioLocal;
		aplicarDadosNoAside(usuarioLocal);
		preencherFormularioInformacoes(usuarioLocal);
		carregarPreferenciasNotificacoes(usuarioLocal.id);

		try {
			var usuarioApi = await carregarUsuarioDaApi(usuarioLocal.id);
			usuarioAtual = usuarioApi;
			aplicarDadosNoAside(usuarioApi);
			preencherFormularioInformacoes(usuarioApi);
		} catch (error) {
			usuarioAtual = usuarioLocal;
			aplicarDadosNoAside(usuarioLocal);
			preencherFormularioInformacoes(usuarioLocal);
		}
	}

	if (salvarInformacoesButton) {
		salvarInformacoesButton.addEventListener('click', salvarInformacoesUsuario);
	}

	if (notificacoesLista) {
		notificacoesLista.addEventListener('change', alterarPreferenciaNotificacao);
	}

	carregarConfiguracoesUsuario();
});
