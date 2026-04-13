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

	var textoOriginalBotao = botaoEntrar.innerHTML;

	loginForm.addEventListener('submit', async function (e) {
		e.preventDefault();
		limparMensagem();

		botaoEntrar.disabled = true;
		botaoEntrar.innerHTML = '<div class="loader"></div>';

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
					tema: data.usuario.tema,
					token: data.token
				};

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
