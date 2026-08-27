document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('vagasGrid');
    if (!grid) return;

    let status = document.createElement('p');
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
        if (!dataTexto) return '';
        const data = new Date(dataTexto);
        if (Number.isNaN(data.getTime())) return '';

        const diffMs = Date.now() - data.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        
        if (diffMin < 1) return 'Agora mesmo';
        if (diffMin < 60) return 'Há ' + diffMin + ' min';
        
        const diffHoras = Math.floor(diffMin / 60);
        if (diffHoras < 24) return 'Há ' + diffHoras + ' h';
        
        const diffDias = Math.floor(diffHoras / 24);
        return 'Há ' + diffDias + ' d';
    }

    // Função utilitária para converter Date em string YYYY-MM-DD
    function formatarDataIso(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }

    // Filtro local para fallback quando categoria e data são selecionados simultaneamente
    function filtrarVagasPorTempoLocal(vagas, dias) {
        if (!dias || dias <= 0) return vagas;
        const limiteMs = dias * 24 * 60 * 60 * 1000;
        const agora = Date.now();

        return vagas.filter(vaga => {
            const dataVaga = new Date(vaga.data_criacao);
            if (Number.isNaN(dataVaga.getTime())) return false;
            return (agora - dataVaga.getTime()) <= limiteMs;
        });
    }

    function criarCard(vaga) {
        const article = document.createElement('article');
        article.className = 'vaga-card';

        const link = vaga.link_linkedin || '#';
        if (link && link !== '#') {
            article.addEventListener('click', () => window.open(link, '_blank', 'noopener'));
            article.setAttribute('role', 'link');
            article.setAttribute('tabindex', '0');
            article.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.open(link, '_blank', 'noopener');
                }
            });
        }

        // Pega o nome da primeira categoria, se houver
        const chip = (vaga.categorias && vaga.categorias.length > 0) ? vaga.categorias[0].nome : 'Vaga';
        const tempo = formatarTempo(vaga.data_criacao);
        const empresa = vaga.empresa_nome || 'Empresa não informada';
        const descricao = vaga.descricao || '';
        
        // Mantendo fallback para imagem preta caso não tenha foto específica na API
        const foto = 'img/userProfilepreto.png'; 

        article.innerHTML = `
            <div class="vaga-card__topo">
                <span class="vaga-card__chip">${escapeHtml(chip)}</span>
                <span class="vaga-card__tempo">${escapeHtml(tempo)}</span>
            </div>
            <h3>${escapeHtml(vaga.titulo || 'Título da vaga')}</h3>
            <div class="vaga-card__meta">
                <span class="vaga-card__autor"><img src="${foto}" alt="" aria-hidden="true">${escapeHtml(empresa)}</span>
                <span class="vaga-card__local"><img src="img/icons/local.svg" alt="" aria-hidden="true">Remoto / Híbrido</span>
            </div>
            <p>${escapeHtml(descricao)}</p>
            <div class="vaga-card__rodape">
                <span class="vaga-card__salario">Vaga externa</span>
                <span class="vaga-card__views">Abrir no LinkedIn <img src="img/icons/olho.svg" alt="" aria-hidden="true"></span>
            </div>
        `;

        return article;
    }

    function renderizarLista(vagas) {
        grid.innerHTML = '';

        if (!Array.isArray(vagas) || !vagas.length) {
            status.textContent = 'Nenhuma vaga disponível com os filtros selecionados.';
            grid.appendChild(status);
            return;
        }

        vagas.forEach(vaga => {
            grid.appendChild(criarCard(vaga));
        });
    }

    async function carregarVagas() {
        try {
            // Limpa e mostra status de carregamento
            grid.innerHTML = '';
            status.textContent = 'Carregando vagas...';
            grid.appendChild(status);

            const filtro = window.seekVagasFilterState || { categoriaId: null, dias: 0 };
            
            let url = ip_api + '/vagas';
            let precisaFiltrarTempoLocal = false;

            // Define a rota baseada nos filtros
            if (filtro.categoriaId) {
                // Filtro de categoria selecionado
                url = `${ip_api}/vagas/categoria/${filtro.categoriaId}`;
                
                // Se também houver filtro de data, fazemos no frontend (pois a API não combinou as rotas no exemplo)
                if (filtro.dias > 0 && filtro.dias < 365) {
                    precisaFiltrarTempoLocal = true;
                }
            } else if (filtro.dias > 0 && filtro.dias < 365) {
                // Apenas filtro de tempo selecionado
                const dataFim = new Date();
                const dataInicio = new Date();
                dataInicio.setDate(dataFim.getDate() - filtro.dias);
                
                const inicioStr = formatarDataIso(dataInicio);
                const fimStr = formatarDataIso(dataFim);
                url = `${ip_api}/vagas/data?inicio=${inicioStr}&fim=${fimStr}`;
            }

            // Realiza a requisição protegida por cookie HttpOnly
            const response = await fetch(url, {
                method: "GET",
                credentials: "include" 
            });

            const respostaJson = await response.json();

            if (!response.ok || !respostaJson.success) {
                throw new Error(respostaJson.message || 'Falha ao carregar vagas');
            }

            let vagasApi = respostaJson.data || [];

            // Aplica filtro local de dias se categoria também foi filtrada
            if (precisaFiltrarTempoLocal) {
                vagasApi = filtrarVagasPorTempoLocal(vagasApi, filtro.dias);
            }

            renderizarLista(vagasApi);
        } catch (error) {
            grid.innerHTML = '';
            status.textContent = error.message || 'Não foi possível carregar as vagas agora.';
            grid.appendChild(status);
            console.error("Erro ao carregar vagas:", error);
        }
    }

    // Expõe a função para ser chamada pelo vagas-filtros.js
    window.seekVagasRecarregarLista = carregarVagas;

    // Primeira carga
    carregarVagas();
});