document.addEventListener('DOMContentLoaded', function () {
	var cadastroForm = document.getElementById('cadastro-form');

	if (!cadastroForm) {
		return;
	}

	// ==========================================
	// CAMPOS DO CADASTRO
	// ==========================================

	var nomeInput = document.getElementById('cadastro-nome');
	var emailInput = document.getElementById('cadastro-email');
	var senhaInput = document.getElementById('cadastro-senha');
	var confirmarSenhaInput = document.getElementById('cadastro-confirmar-senha');
	var tipoCadastroInput = document.getElementById('cadastro-tipo');
	var cnpjInput = document.getElementById('cadastro-cnpj');

	var botaoCadastro =
		document.getElementById('cadastro-continuar') ||
		cadastroForm.querySelector('button[type="submit"]');

	if (
		!nomeInput ||
		!emailInput ||
		!senhaInput ||
		!confirmarSenhaInput ||
		!tipoCadastroInput ||
		!botaoCadastro
	) {
		return;
	}

	// ==========================================
	// MODAL DE VERIFICAÇÃO
	// ==========================================

	var modalVerificacao = document.getElementById('modal-verificacao');
	var fecharModal = document.getElementById('fechar-modal-verificacao');
	var emailVerificacao = document.getElementById('email-verificacao');
	var codigoVerificacao = document.getElementById('codigo-verificacao');
	var confirmarCodigo = document.getElementById('confirmar-codigo-verificacao');
	var reenviarCodigo = document.getElementById('reenviar-codigo-verificacao');
	var mensagemVerificacao = document.getElementById('mensagem-verificacao');
	var codigoVerificacaoCaixas = document.querySelectorAll(
		'.inicio-login__codigo-verificacao-caixas span'
	);

	var emailCadastroAtual = '';

	if (modalVerificacao && modalVerificacao.parentElement !== document.body) {
		document.body.appendChild(modalVerificacao);
	}

	function atualizarCaixasCodigo() {
		var digitos = String(codigoVerificacao.value || '')
			.replace(/\D/g, '')
			.slice(0, 6);

		if (codigoVerificacao.value !== digitos) {
			codigoVerificacao.value = digitos;
		}

		codigoVerificacaoCaixas.forEach(function (caixa, index) {
			caixa.textContent = digitos.charAt(index);
			caixa.classList.toggle('is-active', index === digitos.length);
			caixa.classList.toggle('is-filled', index < digitos.length);
		});
	}

	if (codigoVerificacao) {
		codigoVerificacao.addEventListener('input', atualizarCaixasCodigo);
		codigoVerificacao.addEventListener('focus', atualizarCaixasCodigo);
		codigoVerificacao.addEventListener('blur', atualizarCaixasCodigo);
	}

	// ==========================================
	// MENSAGEM DO CADASTRO
	// ==========================================

	var feedback = document.createElement('p');

	feedback.className =
		'inicio-login__mensagem inicio-login__mensagem--oculta';

	feedback.setAttribute('aria-live', 'polite');

	botaoCadastro.insertAdjacentElement('afterend', feedback);

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

		feedback.classList.add(
			'inicio-login__mensagem--oculta'
		);
	}

	// ==========================================
	// MENSAGEM DO MODAL
	// ==========================================

	function exibirMensagemVerificacao(texto, tipo) {
		mensagemVerificacao.textContent = texto;

		mensagemVerificacao.classList.remove(
			'inicio-login__mensagem--oculta',
			'inicio-login__mensagem--erro',
			'inicio-login__mensagem--sucesso'
		);

		mensagemVerificacao.classList.add(
			tipo === 'sucesso'
				? 'inicio-login__mensagem--sucesso'
				: 'inicio-login__mensagem--erro'
		);
	}

	function limparMensagemVerificacao() {
		mensagemVerificacao.textContent = '';

		mensagemVerificacao.classList.remove(
			'inicio-login__mensagem--erro',
			'inicio-login__mensagem--sucesso'
		);

		mensagemVerificacao.classList.add(
			'inicio-login__mensagem--oculta'
		);
	}

	// ==========================================
	// VALIDAÇÃO DA SENHA
	// ==========================================

	function senhaAtendeRequisitos(senha, email) {
		var senhaNormalizada = String(senha || '');
		var emailNormalizado = String(email || '')
			.trim()
			.toLowerCase();

		if (senhaNormalizada.length < 8) {
			return false;
		}

		if (
			!/[a-z]/.test(senhaNormalizada) ||
			!/[A-Z]/.test(senhaNormalizada)
		) {
			return false;
		}

		if (!/[0-9]|[^A-Za-z0-9\s]/.test(senhaNormalizada)) {
			return false;
		}

		if (
			emailNormalizado &&
			senhaNormalizada
				.toLowerCase()
				.includes(emailNormalizado)
		) {
			return false;
		}

		return true;
	}

	// ==========================================
	// LIMPAR CNPJ
	// ==========================================

	function limparCnpj(valor) {
		return String(valor || '').replace(/\D/g, '');
	}

	// ==========================================
	// ABRIR MODAL
	// ==========================================

	function abrirModalVerificacao(email) {
		emailCadastroAtual = email;

		emailVerificacao.textContent = email;

		codigoVerificacao.value = '';

		limparMensagemVerificacao();
		atualizarCaixasCodigo();

		modalVerificacao.hidden = false;

		codigoVerificacao.focus();
	}

	window.abrirModalVerificacaoConta = abrirModalVerificacao;

	// ==========================================
	// FECHAR MODAL
	// ==========================================

	if (fecharModal) {
		fecharModal.addEventListener('click', function () {
			modalVerificacao.hidden = true;
		});
	}

	// ==========================================
	// CADASTRO
	// ==========================================

	var textoOriginalBotao = botaoCadastro.innerHTML;

	cadastroForm.addEventListener('submit', async function (e) {
		e.preventDefault();

		limparMensagem();

		// --------------------------
		// Validações
		// --------------------------

		if (tipoCadastroInput.value === '') {
			exibirMensagem(
				'Selecione o tipo de usuario.',
				'erro'
			);
			return;
		}

		if (nomeInput.value.trim() === '') {
			exibirMensagem(
				'Informe seu nome.',
				'erro'
			);
			return;
		}

		if (emailInput.value.trim() === '') {
			exibirMensagem(
				'Informe seu email.',
				'erro'
			);
			return;
		}

		if (senhaInput.value !== confirmarSenhaInput.value) {
			exibirMensagem(
				'As senhas nao coincidem.',
				'erro'
			);
			return;
		}

		if (!senhaAtendeRequisitos(
			senhaInput.value,
			emailInput.value
		)) {
			exibirMensagem(
				'A senha nao atende aos requisitos.',
				'erro'
			);
			return;
		}

		// --------------------------
		// Tipo de usuário
		// --------------------------

		var tipoSelecionado =
			String(tipoCadastroInput.value).toLowerCase();

		var tipoUsuario;

		if (tipoSelecionado === 'padrao') {
			tipoUsuario = 'PF';
		} else if (tipoSelecionado === 'empresarial') {
			tipoUsuario = 'EMPRESA';
		} else {
			exibirMensagem(
				'Tipo de usuario invalido.',
				'erro'
			);
			return;
		}

		// --------------------------
		// CNPJ
		// --------------------------

		var cnpjLimpo = limparCnpj(
			cnpjInput ? cnpjInput.value : ''
		);

		if (
			tipoUsuario === 'EMPRESA' &&
			cnpjLimpo === ''
		) {
			exibirMensagem(
				'Informe o CNPJ para criar uma conta empresarial.',
				'erro'
			);
			return;
		}

		// --------------------------
		// Dados
		// --------------------------

		var dados = {
			tipo_usuario: tipoUsuario,
			nome: nomeInput.value.trim(),
			email: emailInput.value.trim(),
			senha: senhaInput.value
		};

		if (tipoUsuario === 'EMPRESA') {
			dados.cnpj = cnpjLimpo;
		}

		console.log(
			'Dados enviados para API:',
			dados
		);

		// --------------------------
		// Enviando
		// --------------------------

		botaoCadastro.disabled = true;

		botaoCadastro.innerHTML =
			'<div class="loader"></div>';

		try {
			var response = await fetch(
				ip_api + '/usuarios',
				{
					method: 'POST',

					headers: {
						'Content-Type': 'application/json'
					},

					body: JSON.stringify(dados)
				}
			);

			var data;

			try {
				data = await response.json();
			} catch (jsonError) {
				data = {};
			}

			console.log(
				'Resposta cadastro:',
				data
			);

			if (response.ok) {

				// Guarda o email que será usado
				// na verificação
				emailCadastroAtual =
					emailInput.value.trim();

				// Abre modal
				abrirModalVerificacao(
					emailCadastroAtual
				);

				return;
			}

			exibirMensagem(
				'Erro ao criar conta: ' +
				(data.message ||
					'Erro desconhecido.'),
				'erro'
			);

		} catch (err) {

			console.error(
				'Erro ao cadastrar:',
				err
			);

			exibirMensagem(
				'Nao foi possivel conectar com a API.',
				'erro'
			);

		} finally {

			botaoCadastro.disabled = false;

			botaoCadastro.innerHTML =
				textoOriginalBotao;
		}
	});

	// ==========================================
	// PERMITIR SOMENTE NÚMEROS NO CÓDIGO
	// ==========================================

	if (codigoVerificacao) {
		codigoVerificacao.addEventListener(
			'input',
			function () {
				this.value =
					this.value
						.replace(/\D/g, '')
						.slice(0, 6);
			}
		);
	}

	// ==========================================
	// CONFIRMAR CÓDIGO
	// ==========================================

	if (confirmarCodigo) {

		confirmarCodigo.addEventListener(
			'click',
			async function () {

				limparMensagemVerificacao();

				var codigo =
					codigoVerificacao.value.trim();

				if (codigo.length !== 6) {
					exibirMensagemVerificacao(
						'Digite o código de 6 dígitos.',
						'erro'
					);
					return;
				}

				confirmarCodigo.disabled = true;

				confirmarCodigo.innerHTML =
					'<div class="loader"></div>';

				try {

					var response =
						await fetch(
							ip_api +
							'/usuarios/verificar-codigo',
							{
								method: 'POST',

								headers: {
									'Content-Type':
										'application/json'
								},

								body: JSON.stringify({
									email:
										emailCadastroAtual,

									codigo:
										codigo
								})
							}
						);

					var data;

					try {
						data =
							await response.json();
					} catch (error) {
						data = {};
					}

					console.log(
						'Resposta verificação:',
						data
					);

					if (
						response.ok &&
						data.success === true
					) {

						exibirMensagemVerificacao(
							data.message ||
							'Conta verificada com sucesso.',
							'sucesso'
						);

						// Recarrega a página
						// depois de confirmar
						setTimeout(
							function () {
								window.location.reload();
							},
							1000
						);

						return;
					}

					exibirMensagemVerificacao(
						data.message ||
						'Código de verificação inválido.',
						'erro'
					);

				} catch (err) {

					console.error(
						'Erro ao verificar código:',
						err
					);

					exibirMensagemVerificacao(
						'Nao foi possivel conectar com a API.',
						'erro'
					);

				} finally {

					confirmarCodigo.disabled =
						false;

					confirmarCodigo.textContent =
						'Confirmar código';
				}
			}
		);
	}

	// ==========================================
	// REENVIAR CÓDIGO
	// ==========================================

	if (reenviarCodigo) {

		reenviarCodigo.addEventListener(
			'click',
			async function () {

				limparMensagemVerificacao();

				if (!emailCadastroAtual) {
					exibirMensagemVerificacao(
						'Email de cadastro não encontrado.',
						'erro'
					);
					return;
				}

				reenviarCodigo.disabled = true;

				reenviarCodigo.innerHTML =
					'<div class="loader"></div>';

				try {

					var response =
						await fetch(
							ip_api +
							'/usuarios/reenviar-codigo',
							{
								method: 'POST',

								headers: {
									'Content-Type':
										'application/json'
								},

								body: JSON.stringify({
									email:
										emailCadastroAtual
								})
							}
						);

					var data;

					try {
						data =
							await response.json();
					} catch (error) {
						data = {};
					}

					console.log(
						'Resposta reenvio:',
						data
					);

					if (
						response.ok &&
						data.success === true
					) {

						exibirMensagemVerificacao(
							data.message ||
							'Novo código enviado com sucesso.',
							'sucesso'
						);

						codigoVerificacao.value = '';
						atualizarCaixasCodigo();

					} else {

						exibirMensagemVerificacao(
							data.message ||
							'Não foi possível reenviar o código.',
							'erro'
						);
					}

				} catch (err) {

					console.error(
						'Erro ao reenviar código:',
						err
					);

					exibirMensagemVerificacao(
						'Nao foi possivel conectar com a API.',
						'erro'
					);

				} finally {

					reenviarCodigo.disabled =
						false;

					reenviarCodigo.textContent =
						'Reenviar código';
				}
			}
		);
	}
});
