document.addEventListener('DOMContentLoaded', function () {
    const tituloInput = document.getElementById('tituloVaga');
    const descricaoInput = document.getElementById('descricaoVaga');
    const descricaoCounter = document.getElementById('descricaoVagaCounter');
    const pesquisaCategoriaInput = document.getElementById('pesquisaCategoriaVaga');
    const chipsContainer = document.getElementById('chips-categorias-vaga');
    const linkInput = document.getElementById('linkVaga');
    const botaoPublicar = document.getElementById('publicarVaga');
    
    // Elementos do Modal
    const modalSistema = document.getElementById('modalSistema');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalMensagem = document.getElementById('modalMensagem');
    const modalBtnCancelar = document.getElementById('modalBtnCancelar');
    const modalBtnConfirmar = document.getElementById('modalBtnConfirmar');

    if (!botaoPublicar) return;

    const categoriasDisponiveis = [
        'TI', 'Design', 'Administração', 'Vendas', 'Marketing', 'Finanças', 
        'Engenharia', 'Recursos Humanos', 'Suporte', 'Dados'
    ];
    let categoriasSelecionadas = [];

    // --- CONTROLE DO MODAL ---
    function exibirModal(titulo, mensagem, exibirCancelar, callbackConfirmar) {
        modalTitulo.textContent = titulo;
        modalMensagem.textContent = mensagem;
        modalSistema.classList.remove('hidden');
        modalSistema.setAttribute('aria-hidden', 'false');

        // Configura botão Cancelar
        if (exibirCancelar) {
            modalBtnCancelar.classList.remove('hidden');
            modalBtnCancelar.onclick = fecharModal;
        } else {
            modalBtnCancelar.classList.add('hidden');
            modalBtnCancelar.onclick = null;
        }

        // Configura botão Confirmar
        modalBtnConfirmar.onclick = () => {
            fecharModal();
            if (callbackConfirmar && typeof callbackConfirmar === 'function') {
                callbackConfirmar();
            }
        };
    }

    function fecharModal() {
        modalSistema.classList.add('hidden');
        modalSistema.setAttribute('aria-hidden', 'true');
    }

    // Atualiza contador de caracteres
    descricaoInput.addEventListener('input', () => {
        descricaoCounter.textContent = descricaoInput.value.length;
    });

    // Renderiza os chips de categorias
    function renderizarCategorias(lista) {
        chipsContainer.innerHTML = '';
        
        lista.forEach(categoria => {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.textContent = categoria;
            
            if (categoriasSelecionadas.includes(categoria)) {
                botao.className = 'adicionar-projeto__chip is-active';
            } else {
                botao.className = 'adicionar-projeto__chip';
            }

            botao.addEventListener('click', () => {
                const index = categoriasSelecionadas.indexOf(categoria);
                if (index > -1) {
                    categoriasSelecionadas.splice(index, 1);
                } else {
                    categoriasSelecionadas.push(categoria);
                }
                renderizarCategorias(filtrarCategorias(pesquisaCategoriaInput.value));
            });

            chipsContainer.appendChild(botao);
        });
    }

    function filtrarCategorias(termo) {
        const texto = (termo || '').trim().toLowerCase();
        if (!texto) return categoriasDisponiveis;
        return categoriasDisponiveis.filter(cat => cat.toLowerCase().includes(texto));
    }

    pesquisaCategoriaInput.addEventListener('input', () => {
        renderizarCategorias(filtrarCategorias(pesquisaCategoriaInput.value));
    });

    // --- LÓGICA DE PUBLICAÇÃO E INTEGRAÇÃO ---
    async function processarEnvioVaga() {
        const url = linkInput.value.trim();

        // Bloqueia botão durante o envio
        const textoOriginal = botaoPublicar.innerHTML;
        botaoPublicar.disabled = true;
        botaoPublicar.innerHTML = '<span>Enviando...</span>';

        const payload = {
            titulo: tituloInput.value.trim(),
            descricao: descricaoInput.value.trim(),
            url: url,
            categorias: categoriasSelecionadas
        };

        const resposta = await apiCriarVaga(payload);

        // Restaura botão
        botaoPublicar.disabled = false;
        botaoPublicar.innerHTML = textoOriginal;

        if (resposta.status === 401) {
            exibirModal("Atenção", "Sessão expirada ou usuário não autenticado. Por favor, faça login novamente.", false);
            return;
        }

        if (resposta.success) {
            // Sucesso!
            exibirModal("Sucesso", resposta.message || "Vaga criada com sucesso!", false, () => {
                // Limpa o formulário apenas depois que o usuário der OK no sucesso
                tituloInput.value = '';
                descricaoInput.value = '';
                linkInput.value = '';
                categoriasSelecionadas = [];
                pesquisaCategoriaInput.value = '';
                descricaoCounter.textContent = '0';
                renderizarCategorias(categoriasDisponiveis);
            });
        } else {
            // Erro vindo da API (ex: LinkedIn inválido, vaga indisponível, falha de scrape)
            exibirModal("Erro", resposta.message || "Não foi possível criar a vaga.", false);
        }
    }

    botaoPublicar.addEventListener('click', () => {
        const url = linkInput.value.trim();

        // Validações locais (frontend)
        if (!url) {
            exibirModal("Campo Obrigatório", "Por favor, informe a URL da vaga.", false);
            return;
        }
        try {
            new URL(url);
        } catch (_) {
            exibirModal("Link Inválido", "Informe uma URL válida começando com https://", false);
            return;
        }
        if (categoriasSelecionadas.length === 0) {
            exibirModal("Categoria Necessária", "Selecione pelo menos uma categoria para a vaga.", false);
            return;
        }

        // Validação inteligente de Título e Descrição
        const tituloVazio = tituloInput.value.trim() === '';
        const descricaoVazia = descricaoInput.value.trim() === '';

        if (tituloVazio || descricaoVazia) {
            // Exibe alerta informando que será buscado no LinkedIn, pede confirmação
            const mensagem = "O título e/ou a descrição da vaga estão vazios. O sistema buscará essas informações automaticamente no link do LinkedIn fornecido. Deseja continuar?";
            exibirModal("Busca Automática", mensagem, true, processarEnvioVaga);
        } else {
            // Se tudo estiver preenchido, envia direto para a API sem avisar nada
            processarEnvioVaga();
        }
    });

    // Inicialização da tela
    renderizarCategorias(categoriasDisponiveis);
});