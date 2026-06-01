document.addEventListener('DOMContentLoaded', function () {
	var tituloInput = document.getElementById('tituloVaga');
	var descricaoInput = document.getElementById('descricaoVaga');
	var descricaoCounter = document.getElementById('descricaoVagaCounter');
	var categoriaInput = document.getElementById('categoriaVaga');
	var pesquisaCategoriaInput = document.getElementById('pesquisaCategoriaVaga');
	var chipsContainer = document.getElementById('chips-categorias-vaga');
	var linkInput = document.getElementById('linkVaga');
	var botaoSalvar = document.getElementById('salvarRascunhoVaga');
	var botaoPublicar = document.getElementById('publicarVaga');
	var visibilidadeSelect = document.getElementById('visibilidadeVaga');

	if (!tituloInput || !descricaoInput || !descricaoCounter || !categoriaInput || !pesquisaCategoriaInput || !chipsContainer || !linkInput || !botaoSalvar || !botaoPublicar) {
		return;
	}

	var categorias = [
		'Design', 'Ilustração', 'Rascunhos', '3D Design', 'HQ', 'UI/UX', 'Branding',
		'Logotipo', 'Marca', 'Pintura Digital', 'Arte Digital', 'Arte', 'Arte Tradicional',
		'Escultura', 'Ensaio Fotográfico', 'Foto', 'Moda', 'Design de Moda', 'Animação', 'Redes sociais'
	];
	var categoriaSelecionada = '';

	var feedback = document.createElement('p');
	feedback.className = 'adicionar-projeto__helper';
	feedback.setAttribute('aria-live', 'polite');
	feedback.style.marginTop = '12px';
	feedback.style.fontWeight = '600';
	botaoPublicar.insertAdjacentElement('afterend', feedback);

	function mostrarFeedback(texto, tipo) {
		feedback.textContent = texto;
		feedback.style.color = tipo === 'erro' ? '#b00020' : '#166534';
	}

	function limparFeedback() {
		feedback.textContent = '';
	}

	function obterUsuarioId() {
		if (typeof getUsuarioLogado !== 'function') {
			return null;
		}

		var usuario = getUsuarioLogado();
		return usuario && usuario.id ? String(usuario.id) : null;
	}

	function atualizarContador() {
		descricaoCounter.textContent = String(descricaoInput.value.length);
	}

	function filtrarCategorias(termo) {
		var texto = (termo || '').trim().toLowerCase();

		if (!texto) {
			return categorias;
		}

		return categorias.filter(function (categoria) {
			return categoria.toLowerCase().indexOf(texto) !== -1;
		});
	}

	function renderizarCategorias(lista) {
		chipsContainer.innerHTML = '';

		lista.forEach(function (categoria) {
			var botao = document.createElement('button');
			botao.type = 'button';
			botao.className = 'adicionar-projeto__chip' + (categoria === categoriaSelecionada ? ' is-active' : '');
			botao.textContent = categoria;

			botao.addEventListener('click', function () {
				categoriaSelecionada = categoriaSelecionada === categoria ? '' : categoria;
				categoriaInput.value = categoriaSelecionada;
				renderizarCategorias(filtrarCategorias(pesquisaCategoriaInput.value));
			});

			chipsContainer.appendChild(botao);
		});
	}

	function validarCampos() {
		var titulo = tituloInput.value.trim();
		var descricao = descricaoInput.value.trim();
		var categoria = categoriaInput.value.trim();
		var url = linkInput.value.trim();

		if (!titulo || !descricao || !categoria || !url) {
			return {
				ok: false,
				mensagem: 'Preencha titulo, descricao, categoria e URL.'
			};
		}

		try {
			new URL(url);
		} catch (_error) {
			return {
				ok: false,
				mensagem: 'Informe uma URL valida.'
			};
		}

		return {
			ok: true
		};
	}

	async function criarVaga(tipoAcao) {
		limparFeedback();

		var idUsuario = obterUsuarioId();
		if (!idUsuario) {
			mostrarFeedback('Usuario nao autenticado. Faça login novamente.', 'erro');
			return;
		}

		var validacao = validarCampos();
		if (!validacao.ok) {
			mostrarFeedback(validacao.mensagem, 'erro');
			return;
		}

		var botaoAtivo = tipoAcao === 'publicar' ? botaoPublicar : botaoSalvar;
		var textoOriginal = botaoAtivo.innerHTML;
		botaoSalvar.disabled = true;
		botaoPublicar.disabled = true;
		botaoAtivo.innerHTML = '<span>Enviando...</span>';

		try {
			var resposta = await fetch(ip_api + '/postsvagas', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					idUsuario: idUsuario,
					titulo: tituloInput.value.trim(),
					categoria: categoriaInput.value.trim(),
					url: linkInput.value.trim(),
					descricao: descricaoInput.value.trim()
				})
			});

			var dados = null;
			try {
				dados = await resposta.json();
			} catch (_erroJson) {
				dados = null;
			}

			if (!resposta.ok) {
				var mensagemErro = dados && (dados.message || dados.erro) ? (dados.message || dados.erro) : 'Erro ao criar vaga.';
				throw new Error(mensagemErro);
			}

			mostrarFeedback(tipoAcao === 'publicar' ? 'Vaga publicada com sucesso.' : 'Rascunho salvo com sucesso.', 'sucesso');

			if (tipoAcao === 'publicar') {
				tituloInput.value = '';
				descricaoInput.value = '';
				categoriaInput.value = '';
				linkInput.value = '';
				categoriaSelecionada = '';
				visibilidadeSelect.value = 'Não publicado';
				renderizarCategorias(filtrarCategorias(pesquisaCategoriaInput.value));
				atualizarContador();
			}
		} catch (erro) {
			mostrarFeedback(erro.message ? erro.message : 'Falha ao enviar vaga.', 'erro');
		} finally {
			botaoSalvar.disabled = false;
			botaoPublicar.disabled = false;
			botaoAtivo.innerHTML = textoOriginal;
		}
	}

	descricaoInput.addEventListener('input', atualizarContador);
	pesquisaCategoriaInput.addEventListener('input', function () {
		renderizarCategorias(filtrarCategorias(pesquisaCategoriaInput.value));
	});

	botaoSalvar.addEventListener('click', function () {
		criarVaga('salvar');
	});

	botaoPublicar.addEventListener('click', function () {
		criarVaga('publicar');
	});

	atualizarContador();
	renderizarCategorias(categorias);
});