document.addEventListener('DOMContentLoaded', function () {
	var painelLogin = document.querySelector('[data-form-panel="login"]');
	var loginForm = painelLogin ? painelLogin.querySelector('form') : null;

	if (!loginForm) {
		return;
	}

	var botaoEntrar = loginForm.querySelector('button[type="submit"]');
	var emailInput = loginForm.querySelector('#email');
	var senhaInput = loginForm.querySelector('#senha');

	if (!botaoEntrar || !emailInput || !senhaInput) {
		return;
	}

	var feedback = document.createElement('p');
	feedback.className = 'inicio-login__mensagem inicio-login__mensagem--oculta';
	feedback.setAttribute('aria-live', 'polite');
	botaoEntrar.insertAdjacentElement('afterend', feedback);

	function exibirMensagem(texto, tipo) {
		feedback.textContent = texto;
		feedback.classList.remove('inicio-login__mensagem--oculta', 'inicio-login__mensagem--erro', 'inicio-login__mensagem--sucesso');
		feedback.classList.add(tipo === 'sucesso' ? 'inicio-login__mensagem--sucesso' : 'inicio-login__mensagem--erro');
	}

	function limparMensagem() {
		feedback.textContent = '';
		feedback.classList.remove('inicio-login__mensagem--erro', 'inicio-login__mensagem--sucesso');
		feedback.classList.add('inicio-login__mensagem--oculta');
	}

	function normalizarEmail(valor) {
		return String(valor || '').trim().toLowerCase();
	}

	function getJsonLocal(chave) {
		try {
			var raw = localStorage.getItem(chave);
			return raw ? JSON.parse(raw) : null;
		} catch (error) {
			return null;
		}
	}

	function prepararOnboardingPrimeiroAcesso(email, usuario) {
		var cadastroPendente = getJsonLocal('seekOnboardingCadastroPendente');
		var emailLogin = normalizarEmail(email);
		var tipoUsuario = String(
			usuario.tipo_usuario ||
			usuario.tipo ||
			(cadastroPendente && cadastroPendente.tipo) ||
			'padrao'
		).toLowerCase();

		if (tipoUsuario === 'empresa') {
			tipoUsuario = 'empresarial';
		}

		if (cadastroPendente && normalizarEmail(cadastroPendente.email) === emailLogin) {
			try {
				localStorage.setItem('seekOnboardingMostrar', JSON.stringify({
					id: usuario.id,
					tipo: tipoUsuario === 'empresarial' ? 'empresarial' : 'padrao',
					criadoEm: Date.now()
				}));
				localStorage.removeItem('seekOnboardingCadastroPendente');
			} catch (error) {
				// O login deve seguir mesmo se nao for possivel gravar o estado local.
			}
		}
	}

	var textoOriginalBotao = botaoEntrar.innerHTML;

	loginForm.addEventListener('submit', async function (e) {
		e.preventDefault();
		limparMensagem();

		botaoEntrar.disabled = true;
		botaoEntrar.innerHTML = 'Carregando...';

		var email = emailInput.value.trim();
		var senha = senhaInput.value;

		try {
			var response = await fetch(ip_api + '/usuarios/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email, senha: senha })
			});

			var data = await response.json();

			if (response.ok && data.usuario && data.token) {
				exibirMensagem('Login realizado com sucesso. Redirecionando...', 'sucesso');

				var usuarioSeguro = {
					id: data.usuario.id,
					nome: data.usuario.nome,
					foto: data.usuario.foto,
					tema: data.usuario.tema,
					tipo_usuario: data.usuario.tipo_usuario || data.usuario.tipo || '',
					token: data.token
				};

				prepararOnboardingPrimeiroAcesso(email, data.usuario);
				localStorage.setItem('usuarioLogado', JSON.stringify(usuarioSeguro));
				window.location.href = '/index.html';
				return;
			}

			exibirMensagem('Email ou senha invalidos.', 'erro');
		} catch (err) {
			exibirMensagem('Erro na requisicao: ' + err.message, 'erro');
		} finally {
			botaoEntrar.disabled = false;
			botaoEntrar.innerHTML = textoOriginalBotao;
		}
	});
});
