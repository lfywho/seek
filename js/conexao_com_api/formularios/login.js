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
		feedback.classList.remove(
			'inicio-login__mensagem--oculta',
			'inicio-login__mensagem--erro',
			'inicio-login__mensagem--sucesso'
		);

		feedback.classList.add(
			tipo === 'sucesso'
				? 'inicio-login__mensagem--sucesso'
				: 'inicio-login__mensagem--erro'
		);
	}

	function limparMensagem() {
		feedback.textContent = '';
		feedback.classList.remove(
			'inicio-login__mensagem--erro',
			'inicio-login__mensagem--sucesso'
		);
		feedback.classList.add('inicio-login__mensagem--oculta');
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
			var response = await fetch(ip_api + '/auth/login', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: email,
					senha: senha
				})
			});

			var data;

			try {
				data = await response.json();
			} catch (jsonError) {
				data = {};
			}

			if (response.ok && data.success && data.data && data.data.usuario) {
				exibirMensagem(
					data.message || 'Login realizado com sucesso. Redirecionando...',
					'sucesso'
				);
				window.location.href = '/index.html';
				return;
			}

			var mensagemErro = data.message || 'Email ou senha invalidos.';
			var contaNaoVerificada =
				response.status === 403 &&
				mensagemErro.toLowerCase().includes('conta') &&
				mensagemErro.toLowerCase().includes('verificada');

			if (
				contaNaoVerificada &&
				typeof window.abrirModalVerificacaoConta === 'function'
			) {
				window.abrirModalVerificacaoConta(email);
				return;
			}

			exibirMensagem(mensagemErro, 'erro');

		} catch (err) {
			exibirMensagem(
				'Erro na requisicao: ' + err.message,
				'erro'
			);
		} finally {
			botaoEntrar.disabled = false;
			botaoEntrar.innerHTML = textoOriginalBotao;
		}
	});
});
