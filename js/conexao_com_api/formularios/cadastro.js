document.addEventListener('DOMContentLoaded', function () {
	var cadastroForm = document.getElementById('cadastro-form');

	if (!cadastroForm) {
		return;
	}

	var nomeInput = document.getElementById('cadastro-nome') || document.getElementById('cadastroNome');
	var emailInput = document.getElementById('cadastro-email');
	var senhaInput = document.getElementById('cadastro-senha');
	var confirmarSenhaInput = document.getElementById('cadastro-confirmar-senha');
	var tipoCadastroInput = document.getElementById('cadastro-tipo');
	var cnpjInput = document.getElementById('cadastro-cnpj');
	var botaoCadastro = document.getElementById('cadastro-continuar') || cadastroForm.querySelector('button[type="submit"]');

	if (!nomeInput || !emailInput || !senhaInput || !confirmarSenhaInput || !botaoCadastro) {
		return;
	}

	var feedback = document.createElement('p');
	feedback.className = 'inicio-login__mensagem inicio-login__mensagem--oculta';
	feedback.setAttribute('aria-live', 'polite');
	botaoCadastro.insertAdjacentElement('afterend', feedback);

	function senhaAtendeRequisitos(senha, email) {
		var senhaNormalizada = String(senha || '');
		var emailNormalizado = String(email || '').trim().toLowerCase();

		if (senhaNormalizada.length < 8) {
			return false;
		}

		if (!/[a-z]/.test(senhaNormalizada) || !/[A-Z]/.test(senhaNormalizada)) {
			return false;
		}

		if (!/[0-9]|[^A-Za-z0-9\s]/.test(senhaNormalizada)) {
			return false;
		}

		if (emailNormalizado && senhaNormalizada.toLowerCase().includes(emailNormalizado)) {
			return false;
		}

		return true;
	}

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

	function limparCnpj(valor) {
		return String(valor || '').replace(/\D/g, '');
	}

	var textoOriginalBotao = botaoCadastro.innerHTML;

	cadastroForm.addEventListener('submit', async function (e) {
		e.preventDefault();
		limparMensagem();

		if (senhaInput.value !== confirmarSenhaInput.value) {
			exibirMensagem('As senhas nao coincidem.', 'erro');
			return;
		}

		if (!senhaAtendeRequisitos(senhaInput.value, emailInput.value)) {
			exibirMensagem('A senha nao atende aos requisitos.', 'erro');
			return;
		}

		if (nomeInput.value.trim() === '') {
			exibirMensagem('Informe seu nome.', 'erro');
			return;
		}

		var tipoCadastro = String(tipoCadastroInput ? tipoCadastroInput.value : '').toLowerCase();
		var cadastroEmpresarial = tipoCadastro === 'empresarial';
		var cnpjLimpo = limparCnpj(cnpjInput ? cnpjInput.value : '');

		if (cadastroEmpresarial && cnpjLimpo === '') {
			exibirMensagem('Informe o CNPJ para criar conta empresarial.', 'erro');
			return;
		}

		var dados = {
			nome: nomeInput.value.trim(),
			email: emailInput.value.trim(),
			senha: senhaInput.value
		};

		if (cadastroEmpresarial) {
			dados.cnpj = cnpjLimpo;
		}

		var endpointCadastro = cadastroEmpresarial
			? '/usuarios/criar-conta-empresa'
			: '/usuarios';

		botaoCadastro.disabled = true;
		botaoCadastro.innerHTML = '<div class="loader"></div>';

		try {
			var response = await fetch(ip_api + endpointCadastro, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(dados)
			});

			var data = await response.json();

			if (response.ok) {
				exibirMensagem(cadastroEmpresarial ? 'Conta empresarial criada com sucesso!' : 'Conta criada com sucesso!', 'sucesso');
				cadastroForm.reset();
				var linkLogin = document.querySelector('[data-toggle-form="login"]');
				if (linkLogin) {
					linkLogin.click();
				}
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
