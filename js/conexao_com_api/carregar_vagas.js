document.addEventListener('DOMContentLoaded', function () {
	var grid = document.getElementById('vagasGrid');
	if (!grid) {
		return;
	}

	var listaCompleta = [];

	var status = document.createElement('p');
	status.className = 'usuario-empty-state';
	status.setAttribute('aria-live', 'polite');
	status.textContent = 'Carregando vagas...';
	grid.appendChild(status);

	function escapeHtml(value) {
		return String(value == null ? '' : value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function formatarTempo(dataTexto) {
		if (!dataTexto) {
			return '';
		}

		var data = new Date(dataTexto);
		if (Number.isNaN(data.getTime())) {
			return '';
		}

		var diffMs = Date.now() - data.getTime();
		var diffMin = Math.floor(diffMs / 60000);
		if (diffMin < 1) {
			return 'Agora mesmo';
		}
		if (diffMin < 60) {
			return 'Há ' + diffMin + ' min';
		}
		var diffHoras = Math.floor(diffMin / 60);
		if (diffHoras < 24) {
			return 'Há ' + diffHoras + ' h';
		}
		var diffDias = Math.floor(diffHoras / 24);
		return 'Há ' + diffDias + ' d';
	}

	function converterPeriodoParaDias(periodo) {
		if (!periodo) {
			return 0;
		}

		var valor = String(periodo).trim().toLowerCase();
		if (/^\d+$/.test(valor)) {
			return Number(valor);
		}

		if (valor === 'hoje') {
			return 1;
		}

		if (valor === 'semana') {
			return 7;
		}

		if (valor === 'mes') {
			return 30;
		}

		if (valor === 'ano') {
			return 365;
		}

		return 0;
	}

	function filtrarPorTempo(vagas, periodo, diasPersonalizados) {
		var limiteDias = 0;
		var valor = String(periodo || '').trim().toLowerCase();

		if (valor === 'dias') {
			limiteDias = Number(diasPersonalizados) || 0;
		} else {
			limiteDias = converterPeriodoParaDias(valor);
		}

		if (!limiteDias) {
			return vagas;
		}

		var agora = Date.now();
		var limiteMs = limiteDias * 24 * 60 * 60 * 1000;

		return vagas.filter(function (vaga) {
			var data = new Date(vaga.criado_em);
			if (Number.isNaN(data.getTime())) {
				return false;
			}

			return (agora - data.getTime()) <= limiteMs;
		});
	}

	function filtrarPorCategoria(vagas, categoria) {
		var valor = String(categoria || '').trim().toLowerCase();
		if (!valor) {
			return vagas;
		}

		return vagas.filter(function (vaga) {
			return String(vaga.nome_categoria || '').trim().toLowerCase() === valor;
		});
	}

	function formatarLocalizacao(localizacao) {
		var texto = String(localizacao == null ? '' : localizacao).trim();

		if (!texto) {
			return '';
		}

		texto = texto.replace(/\s+Over\s+.*$/i, '').trim();

		var partes = texto.split(',').map(function (parte) {
			return parte.trim();
		}).filter(Boolean);

		if (!partes.length) {
			return '';
		}

		if (partes.length === 1) {
			return partes[0];
		}

		return partes[0] + ', ' + partes[partes.length - 1];
	}

	function normalizarUrl(url) {
		if (!url) {
			return '';
		}

		if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
			return url;
		}

		if (url.charAt(0) === '/') {
			return ip_api + url;
		}

		return url;
	}

	function criarCard(vaga) {
		var article = document.createElement('article');
		article.className = 'vaga-card';

		var link = normalizarUrl(vaga.link_original || vaga.link_guest || '#');
		if (link && link !== '#') {
			article.addEventListener('click', function () {
				window.open(link, '_blank', 'noopener');
			});
			article.setAttribute('role', 'link');
			article.setAttribute('tabindex', '0');
			article.addEventListener('keydown', function (event) {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					window.open(link, '_blank', 'noopener');
				}
			});
		}

		var foto = vaga.foto_perfil ? normalizarUrl(vaga.foto_perfil) : 'img/userProfilepreto.png';
		var chip = vaga.nome_categoria || 'Vaga';
		var tempo = formatarTempo(vaga.criado_em);
		var empresa = vaga.empresa || 'Empresa não informada';
		var localizacao = formatarLocalizacao(vaga.localizacao);
		var descricao = vaga.descricao || '';

		article.innerHTML =
			'<div class="vaga-card__topo">' +
			'<span class="vaga-card__chip">' + escapeHtml(chip) + '</span>' +
			'<span class="vaga-card__tempo">' + escapeHtml(tempo) + '</span>' +
			'</div>' +
			'<h3>' + escapeHtml(vaga.titulo || 'Título da vaga') + '</h3>' +
			'<div class="vaga-card__meta">' +
			'<span class="vaga-card__autor"><img src="' + escapeHtml(foto) + '" alt="" aria-hidden="true">' + escapeHtml(vaga.nome || 'Usuário') + '</span>' +
			'<span class="vaga-card__local"><img src="img/icons/local.svg" alt="" aria-hidden="true">' + escapeHtml(empresa + (localizacao ? ' - ' + localizacao : '')) + '</span>' +
			'</div>' +
			'<p>' + escapeHtml(descricao) + '</p>' +
			'<div class="vaga-card__rodape">' +
			'<span class="vaga-card__salario">Vaga externa</span>' +
			'<span class="vaga-card__views">Abrir vaga <img src="img/icons/olho.svg" alt="" aria-hidden="true"></span>' +
			'</div>';

		return article;
	}

	function renderizarLista(vagas) {
		grid.innerHTML = '';

		if (!Array.isArray(vagas) || !vagas.length) {
			status.textContent = 'Nenhuma vaga disponível no momento.';
			grid.appendChild(status);
			return;
		}

		vagas.forEach(function (vaga) {
			grid.appendChild(criarCard(vaga));
		});
	}

	async function carregarVagas() {
		try {
			var filtro = window.seekVagasFilterState || { categoria: '', tempo: '', dias: '' };
			var usarListaCompleta = !!(filtro.categoria && filtro.tempo);
			var endpoint = '/postsvagas';

			if (!usarListaCompleta) {
				if (filtro.categoria && !filtro.tempo) {
					endpoint = '/postsvagas/categoria/' + encodeURIComponent(filtro.categoria);
				} else if (!filtro.categoria && filtro.tempo) {
					endpoint = '/postsvagas/tempo/' + encodeURIComponent(filtro.tempo === 'dias' ? String(filtro.dias || '') : filtro.tempo);
				}
			}

			var response = await fetch(ip_api + endpoint);
			if (!response.ok) {
				throw new Error('Falha ao carregar vagas');
			}

			var vagas = await response.json();
			if (!Array.isArray(vagas)) {
				vagas = [];
			}

			if (usarListaCompleta) {
				vagas = filtrarPorCategoria(vagas, filtro.categoria);
				vagas = filtrarPorTempo(vagas, filtro.tempo, filtro.dias);
			}

			listaCompleta = vagas.slice();
			renderizarLista(vagas);
		} catch (error) {
			grid.innerHTML = '';
			status.textContent = 'Nao foi possivel carregar as vagas agora.';
			grid.appendChild(status);
			console.error(error);
		}
	}

	window.seekVagasRecarregarLista = carregarVagas;

	carregarVagas();
});