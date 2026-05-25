document.addEventListener('DOMContentLoaded', function () {
	var tituloInput = document.getElementById('tituloProjeto');
	var legendaInput = document.getElementById('detalhesProjeto');
	var imagensInput = document.getElementById('imagemProjetoInput');
	var previewsContainer = document.getElementById('imagemProjetoPreviews');
	var chipsCategorias = document.getElementById('chips-categorias');
	var categoriaDigitadaInput = document.querySelector('.adicionar-projeto__search-box input');
	var ui = window.seekProjetoUI || null;

	if (!tituloInput || !legendaInput || !imagensInput || !previewsContainer || !chipsCategorias) {
		return;
	}

	var botoesAcao = Array.from(document.querySelectorAll('.adicionar-projeto__sidebar-button'));

	if (!botoesAcao.length) {
		return;
	}

	function obterUsuarioId() {
		if (typeof getUsuarioLogado !== 'function') {
			return null;
		}

		var usuario = getUsuarioLogado();
		return usuario && usuario.id ? usuario.id : null;
	}

	function obterCategoriaFallback() {
		var categoriaDigitada = categoriaDigitadaInput ? categoriaDigitadaInput.value.trim() : '';

		if (categoriaDigitada) {
			return categoriaDigitada;
		}

		var chipAtivo = chipsCategorias.querySelector('.adicionar-projeto__chip.is-active');
		return chipAtivo ? chipAtivo.textContent.trim() : '';
	}

	async function blobUrlParaArquivo(blobUrl, indice) {
		var resposta = await fetch(blobUrl);
		var blob = await resposta.blob();

		var extensao = 'jpg';
		if (blob.type && blob.type.includes('/')) {
			extensao = blob.type.split('/')[1] || 'jpg';
		}

		return new File([blob], 'projeto-' + indice + '.' + extensao, {
			type: blob.type || 'image/jpeg'
		});
	}

	async function obterImagensParaEnvio() {
		var arquivosDoInput = Array.from(imagensInput.files || []).filter(function (arquivo) {
			return arquivo.type && arquivo.type.indexOf('image/') === 0;
		});

		if (arquivosDoInput.length) {
			return arquivosDoInput.slice(0, 10);
		}

		var imagensPreview = Array.from(previewsContainer.querySelectorAll('.adicionar-projeto__hero-preview-media img'));
		var arquivos = [];

		for (var i = 0; i < imagensPreview.length && i < 10; i += 1) {
			var src = imagensPreview[i].getAttribute('src') || '';

			if (!src) {
				continue;
			}

			if (src.indexOf('blob:') === 0) {
				var arquivoConvertido = await blobUrlParaArquivo(src, i + 1);
				arquivos.push(arquivoConvertido);
				continue;
			}

			var respostaHttp = await fetch(src);
			var blobHttp = await respostaHttp.blob();
			arquivos.push(new File([blobHttp], 'projeto-' + (i + 1) + '.jpg', { type: blobHttp.type || 'image/jpeg' }));
		}

		return arquivos;
	}

	function mostrarFeedback(texto, tipo) {
		if (ui && typeof ui.mostrarFeedback === 'function') {
			ui.mostrarFeedback(texto, tipo);
		}
	}

	async function enviarProjeto(tipoAcao) {
		var usuarioId = obterUsuarioId();

		if (!usuarioId) {
			mostrarFeedback('Usuario nao autenticado. Faca login novamente.', 'erro');
			return;
		}

		var titulo = tituloInput.value.trim();
		var legenda = legendaInput.value.trim();
		var categoria = ui && typeof ui.obterCategoriaParaEnvio === 'function'
			? ui.obterCategoriaParaEnvio()
			: obterCategoriaFallback();
		var imagens = await obterImagensParaEnvio();

		var validacao = ui && typeof ui.validarCamposObrigatorios === 'function'
			? ui.validarCamposObrigatorios({
				titulo: titulo,
				legenda: legenda,
				categoria: categoria,
				quantidadeImagens: imagens.length
			})
			: { ok: !!(titulo && legenda && categoria && imagens.length >= 1 && imagens.length <= 10), mensagem: 'Preencha os campos obrigatorios.' };

		if (!validacao.ok) {
			mostrarFeedback(validacao.mensagem, 'erro');
			return;
		}

		var formData = new FormData();
		formData.append('userId', String(usuarioId));
		formData.append('userld', String(usuarioId));
		formData.append('legenda', legenda);
		formData.append('titulo', titulo);
		formData.append('categoriaInput', categoria);

		imagens.forEach(function (imagem) {
			formData.append('imagens', imagem);
		});

		var botaoAtivo = tipoAcao === 'publicar' ? botoesAcao[1] : botoesAcao[0];
		var textoOriginal = botaoAtivo ? botaoAtivo.innerHTML : '';

		if (botaoAtivo) {
			botaoAtivo.disabled = true;
			botaoAtivo.innerHTML = '<span>Enviando...</span>';
		}

		try {
			var headers = {};
			var usuario = typeof getUsuarioLogado === 'function' ? getUsuarioLogado() : null;
			if (usuario && usuario.token) {
				headers.Authorization = 'Bearer ' + usuario.token;
			}

			var resposta = await fetch('http://localhost:4500/posts', {
				method: 'POST',
				headers: headers,
				body: formData
			});

			var dados = null;
			try {
				dados = await resposta.json();
			} catch (_erroJson) {
				dados = null;
			}

			if (!resposta.ok) {
				var mensagemErro = (dados && (dados.message || dados.erro)) || 'Erro ao enviar projeto.';
				throw new Error(mensagemErro);
			}

			mostrarFeedback('Projeto enviado com sucesso.', 'sucesso');

			if (tipoAcao === 'publicar') {
				if (ui && typeof ui.limparFormulario === 'function') {
					ui.limparFormulario();
				}

				if (ui && typeof ui.mostrarNotificacaoConfirmacao === 'function') {
					ui.mostrarNotificacaoConfirmacao('Projeto publicado com sucesso.');
				}
			}
		} catch (erro) {
			mostrarFeedback('Falha ao enviar projeto: ' + erro.message, 'erro');
		} finally {
			if (botaoAtivo) {
				botaoAtivo.disabled = false;
				botaoAtivo.innerHTML = textoOriginal;
			}
		}
	}

	var botaoSalvar = botoesAcao[0] || null;
	var botaoPublicar = botoesAcao[1] || null;

	if (botaoSalvar) {
		botaoSalvar.addEventListener('click', function () {
			enviarProjeto('salvar');
		});
	}

	if (botaoPublicar) {
		botaoPublicar.addEventListener('click', function () {
			enviarProjeto('publicar');
		});
	}

});
