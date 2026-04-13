document.addEventListener('DOMContentLoaded', function () {
	var cadastroForm = document.getElementById('cadastro-form');

	if (!cadastroForm) {
		return;
	}

	var nomeInput = document.getElementById('cadastro-nome') || document.getElementById('cadastroNome');
	var emailInput = document.getElementById('cadastro-email');
	var senhaInput = document.getElementById('cadastro-senha');
	var confirmarSenhaInput = document.getElementById('cadastro-confirmar-senha');
	var botaoCadastro = document.getElementById('cadastro-continuar') || cadastroForm.querySelector('button[type="submit"]');

	if (!nomeInput || !emailInput || !senhaInput || !confirmarSenhaInput || !botaoCadastro) {
		return;
	}

	var feedback = document.createElement('p');
	feedback.className = 'inicio-login__mensagem inicio-login__mensagem--oculta';
	feedback.setAttribute('aria-live', 'polite');
	botaoCadastro.insertAdjacentElement('afterend', feedback);

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

	var textoOriginalBotao = botaoCadastro.innerHTML;

	cadastroForm.addEventListener('submit', async function (e) {
		e.preventDefault();
		limparMensagem();

		if (senhaInput.value !== confirmarSenhaInput.value) {
			exibirMensagem('As senhas nao coincidem.', 'erro');
			return;
		}

		if (nomeInput.value.trim() === '') {
			exibirMensagem('Informe seu nome.', 'erro');
			return;
		}

		var dados = {
			nome: nomeInput.value.trim(),
			email: emailInput.value.trim(),
			senha: senhaInput.value
		};

		botaoCadastro.disabled = true;
		botaoCadastro.innerHTML = '<div class="loader"></div>';

		try {
			var response = await fetch(ip_api + '/usuarios', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(dados)
			});

			var data = await response.json();

			if (response.ok) {
				exibirMensagem('Conta criada com sucesso!', 'sucesso');
				cadastroForm.reset();
				return;
			}

			exibirMensagem('Erro ao criar conta: ' + (data.message || 'Erro desconhecido.'), 'erro');
		} catch (err) {
			exibirMensagem('Erro ao criar conta: ' + err.message, 'erro');
		} finally {
			botaoCadastro.disabled = false;
			botaoCadastro.innerHTML = textoOriginalBotao;
		}
	});
});
