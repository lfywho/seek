const categorias = [
    'Design', 'Ilustração', 'Rascunhos', '3D Design', 'HQ', 'UI/UX', 'Branding', 
    'Logotipo', 'Marca', 'Pintura Digital', 'Arte Digital', 'Arte', 'Arte Tradicional', 
    'Escultura', 'Ensaio Fotográfico', 'Foto', 'Moda', 'Design de Moda', 'Animação', 'Redes sociais'
];

// Elementos de UI
const chipsContainer = document.getElementById('chips-categorias');
const tituloProjetoInput = document.getElementById('tituloProjeto');
const detalhesProjeto = document.getElementById('detalhesProjeto');
const detalhesProjetoCounter = document.getElementById('detalhesProjetoCounter');
const imagemProjetoInput = document.getElementById('imagemProjetoInput');
const imagemProjetoEmptyState = document.getElementById('imagemProjetoEmptyState');
const imagemProjetoPreviews = document.getElementById('imagemProjetoPreviews');
const adicionarMidiaCard = document.getElementById('adicionarMidiaCard');
const capaProjetoInput = document.getElementById('capaProjetoInput');
const capaProjetoDropzone = document.getElementById('capaProjetoDropzone');
const capaProjetoPlaceholder = document.getElementById('capaProjetoPlaceholder');
const capaProjetoPreview = document.getElementById('capaProjetoPreview');
const capaProjetoPreviewImg = document.getElementById('capaProjetoPreviewImg');
const botaoAdicionarCapa = document.getElementById('botaoAdicionarCapa');
const inputAdicionarCategoria = document.getElementById('inputAdicionarCategoria'); // Atualizado
const sidebarProjeto = document.querySelector('.adicionar-projeto__sidebar');

// Elementos do Modal de Colaboradores
const modalColaboradores = document.getElementById('modalColaboradores');
const btnAbrirModalColaborador = document.getElementById('btnAbrirModalColaborador');
const btnFecharModalColaboradores = document.getElementById('btnFecharModalColaboradores');
const inputBuscaColaborador = document.getElementById('inputBuscaColaborador');
const resultadosBuscaColaboradores = document.getElementById('resultadosBuscaColaboradores');
const listaColaboradoresSelecionados = document.getElementById('listaColaboradoresSelecionados');
const btnPublicarProjeto = document.getElementById('btnPublicarProjeto') || Array.from(document.querySelectorAll('.adicionar-projeto__sidebar-button')).find(b => b.textContent.includes('Publicar'));

const LIMITE_IMAGENS = 10;
const MAX_COLABORADORES = 10;
const imagensProjeto = []; 
let indiceEdicaoAtual = null;
let capaProjetoUrlAtual = '';
let capaProjetoArquivo = null; 
let colaboradoresSelecionados = []; 

// Retorna um ARRAY com todas as categorias marcadas como ativas
function obterCategoriasSelecionadasInterface() {
    if (!chipsContainer) return [];
    const chipsAtivos = Array.from(chipsContainer.querySelectorAll('.adicionar-projeto__chip.is-active'));
    return chipsAtivos.map(chip => chip.textContent.trim());
}

function limparEstadoInvalido(elemento) {
    if (!elemento) return;
    elemento.style.outline = '';
    elemento.style.outlineOffset = '';
    elemento.removeAttribute('aria-invalid');
}

function marcarEstadoInvalido(elemento) {
    if (!elemento) return;
    elemento.style.outline = '2px solid #d92d20';
    elemento.style.outlineOffset = '2px';
    elemento.setAttribute('aria-invalid', 'true');
}

function limparValidacaoVisualProjeto() {
    limparEstadoInvalido(tituloProjetoInput);
    limparEstadoInvalido(detalhesProjeto);
    limparEstadoInvalido(chipsContainer);
    limparEstadoInvalido(inputAdicionarCategoria);
    const blocoImagens = imagemProjetoPreviews ? imagemProjetoPreviews.closest('.adicionar-projeto__hero') : null;
    limparEstadoInvalido(blocoImagens || imagemProjetoInput);
}

function validarCamposObrigatoriosProjeto(dados) {
    const payload = dados || {};
    const faltantes = [];
    const titulo = (payload.titulo || '').trim();
    const legenda = (payload.legenda || '').trim();
    const categorias = payload.categorias || [];
    const quantidadeImagens = Number(payload.quantidadeImagens || 0);

    limparValidacaoVisualProjeto();

    if (!titulo) { faltantes.push('titulo'); marcarEstadoInvalido(tituloProjetoInput); }
    if (!legenda) { faltantes.push('detalhes do projeto'); marcarEstadoInvalido(detalhesProjeto); }
    
    // Verifica se pelo menos 1 categoria foi selecionada
    if (categorias.length === 0) { 
        faltantes.push('pelo menos uma categoria'); 
        marcarEstadoInvalido(chipsContainer); 
        marcarEstadoInvalido(inputAdicionarCategoria); 
    }
    
    if (quantidadeImagens < 1 || quantidadeImagens > 10) {
        faltantes.push('imagens (mínimo 1 e máximo 10)');
        const blocoImagens = imagemProjetoPreviews ? imagemProjetoPreviews.closest('.adicionar-projeto__hero') : null;
        marcarEstadoInvalido(blocoImagens || imagemProjetoInput);
    }
    if (!payload.capa) {
        faltantes.push('capa do projeto');
    }

    if (faltantes.length) {
        return { ok: false, mensagem: 'Preencha os campos obrigatórios: ' + faltantes.join(', ') + '.' };
    }
    return { ok: true };
}

function criarOuObterFeedbackProjeto() {
    let feedback = document.getElementById('feedbackInserirProjeto');
    if (!feedback) {
        feedback = document.createElement('p');
        feedback.id = 'feedbackInserirProjeto';
        feedback.style.marginTop = '12px';
        feedback.style.fontSize = '14px';
        feedback.style.lineHeight = '1.4';
        if (sidebarProjeto) sidebarProjeto.appendChild(feedback);
    }
    return feedback;
}

function mostrarFeedbackProjeto(texto, tipo) {
    const feedback = criarOuObterFeedbackProjeto();
    if (!feedback) return;
    feedback.textContent = texto;
    feedback.style.color = tipo === 'erro' ? '#b42318' : '#107c10';
}

function mostrarNotificacaoConfirmacaoProjeto(texto) {
    let notificacao = document.getElementById('notificacaoProjetoPublicado');
    if (!notificacao) {
        notificacao = document.createElement('div');
        notificacao.id = 'notificacaoProjetoPublicado';
        notificacao.setAttribute('role', 'status');
        notificacao.setAttribute('aria-live', 'polite');
        notificacao.style.position = 'fixed';
        notificacao.style.right = '20px';
        notificacao.style.bottom = '20px';
        notificacao.style.maxWidth = '320px';
        notificacao.style.padding = '12px 14px';
        notificacao.style.borderRadius = '10px';
        notificacao.style.background = '#107c10';
        notificacao.style.color = '#ffffff';
        notificacao.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
        notificacao.style.zIndex = '9999';
        notificacao.style.opacity = '0';
        notificacao.style.transform = 'translateY(8px)';
        notificacao.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        document.body.appendChild(notificacao);
    }

    notificacao.textContent = texto;
    notificacao.style.opacity = '1';
    notificacao.style.transform = 'translateY(0)';

    if (window.__toastProjetoTimeout) clearTimeout(window.__toastProjetoTimeout);
    window.__toastProjetoTimeout = setTimeout(() => {
        notificacao.style.opacity = '0';
        notificacao.style.transform = 'translateY(8px)';
    }, 2600);
}

function limparFormularioProjetoInterface() {
    if (tituloProjetoInput) tituloProjetoInput.value = '';
    if (detalhesProjeto) {
        detalhesProjeto.value = '';
        detalhesProjeto.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (imagensProjeto.length) {
        imagensProjeto.forEach(({ urlImagem }) => URL.revokeObjectURL(urlImagem));
        imagensProjeto.splice(0, imagensProjeto.length);
    }

    indiceEdicaoAtual = null;

    if (imagemProjetoInput) imagemProjetoInput.value = '';
    if (imagemProjetoPreviews) { imagemProjetoPreviews.innerHTML = ''; imagemProjetoPreviews.hidden = true; }
    if (imagemProjetoEmptyState) imagemProjetoEmptyState.hidden = false;
    if (adicionarMidiaCard) adicionarMidiaCard.hidden = true;

    // Desmarca todas as categorias
    if (chipsContainer) {
        const chips = Array.from(chipsContainer.querySelectorAll('.adicionar-projeto__chip'));
        chips.forEach((chip) => chip.classList.remove('is-active'));
        if (chips[0]) chips[0].classList.add('is-active'); // Deixa a primeira ativa como padrão
    }

    if (inputAdicionarCategoria) inputAdicionarCategoria.value = '';

    const visibilidadeSelect = document.getElementById('visibilidade');
    if (visibilidadeSelect) visibilidadeSelect.selectedIndex = 0;

    const comentariosSelect = document.getElementById('comentarios');
    if (comentariosSelect) comentariosSelect.selectedIndex = 0;

    const radioNao18 = document.querySelector('input[name="conteudo18"][value="nao"]');
    if (radioNao18) radioNao18.checked = true;

    if (capaProjetoInput) capaProjetoInput.value = '';
    if (capaProjetoUrlAtual) { URL.revokeObjectURL(capaProjetoUrlAtual); capaProjetoUrlAtual = ''; }
    if (capaProjetoPreviewImg) capaProjetoPreviewImg.src = '';
    if (capaProjetoPreview) capaProjetoPreview.hidden = true;
    if (capaProjetoPlaceholder) capaProjetoPlaceholder.hidden = false;
    capaProjetoArquivo = null;

    colaboradoresSelecionados = [];
    if(listaColaboradoresSelecionados) listaColaboradoresSelecionados.innerHTML = '';
    if(btnAbrirModalColaborador) btnAbrirModalColaborador.style.display = 'block';

    limparValidacaoVisualProjeto();
}

window.seekProjetoUI = {
    obterCategoriasSelecionadas: obterCategoriasSelecionadasInterface,
    validarCamposObrigatorios: validarCamposObrigatoriosProjeto,
    mostrarFeedback: mostrarFeedbackProjeto,
    mostrarNotificacaoConfirmacao: mostrarNotificacaoConfirmacaoProjeto,
    limparFormulario: limparFormularioProjetoInterface,
    limparEstadoInvalido
};

// ==========================================
// CHIPS E NOVA LÓGICA DE CATEGORIAS
// ==========================================
if (chipsContainer) {
    // Renderiza as categorias padrão
    categorias.forEach((categoria, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        // A primeira vem marcada por padrão
        button.className = `adicionar-projeto__chip${index === 0 ? ' is-active' : ''}`;
        button.textContent = categoria;
        
        button.addEventListener('click', () => {
            // Agora apenas alterna a classe, permitindo múltiplas
            button.classList.toggle('is-active');
            limparEstadoInvalido(chipsContainer);
            limparEstadoInvalido(inputAdicionarCategoria);
        });
        chipsContainer.appendChild(button);
    });
}

// Lógica de adicionar categoria via Input (Pressionando Enter)
if (chipsContainer && inputAdicionarCategoria) {
    inputAdicionarCategoria.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Impede possível submit do formulário se houver

            const novaCategoria = inputAdicionarCategoria.value.trim();
            
            if (novaCategoria) {
                // Checa se já existe um chip com esse nome para não duplicar
                const chipsExistentes = Array.from(chipsContainer.querySelectorAll('.adicionar-projeto__chip'));
                const chipIgual = chipsExistentes.find(chip => chip.textContent.toLowerCase() === novaCategoria.toLowerCase());

                if (!chipIgual) {
                    // Cria e insere o novo chip já marcado como ativo
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'adicionar-projeto__chip is-active';
                    button.textContent = novaCategoria;
                    
                    button.addEventListener('click', () => {
                        button.classList.toggle('is-active');
                        limparEstadoInvalido(chipsContainer);
                    });
                    
                    chipsContainer.appendChild(button);
                } else {
                    // Se a categoria já existe, apenas garante que ela fique ativa
                    chipIgual.classList.add('is-active');
                }

                inputAdicionarCategoria.value = '';
                limparEstadoInvalido(chipsContainer);
                limparEstadoInvalido(inputAdicionarCategoria);
            }
        }
    });

    inputAdicionarCategoria.addEventListener('input', () => {
        limparEstadoInvalido(inputAdicionarCategoria);
        limparEstadoInvalido(chipsContainer);
    });
}

if (tituloProjetoInput) tituloProjetoInput.addEventListener('input', () => limparEstadoInvalido(tituloProjetoInput));
if (detalhesProjeto) detalhesProjeto.addEventListener('input', () => limparEstadoInvalido(detalhesProjeto));

if (detalhesProjeto && detalhesProjetoCounter) {
    const atualizarContador = () => { detalhesProjetoCounter.textContent = detalhesProjeto.value.length; };
    detalhesProjeto.addEventListener('input', atualizarContador);
    atualizarContador();
}

// ==========================================
// IMAGENS DO PROJETO
// ==========================================
if (imagemProjetoInput && imagemProjetoEmptyState && imagemProjetoPreviews && adicionarMidiaCard) {
    const atualizarInterfaceMidias = () => {
        const possuiImagens = imagensProjeto.length > 0;
        imagemProjetoEmptyState.hidden = possuiImagens;
        imagemProjetoPreviews.hidden = !possuiImagens;
        adicionarMidiaCard.hidden = !possuiImagens;
    };

    const removerPreviewImagem = (indice) => {
        const imagem = imagensProjeto[indice];
        if (!imagem) return;
        URL.revokeObjectURL(imagem.urlImagem);
        imagem.preview.remove();
        imagensProjeto.splice(indice, 1);

        if (indiceEdicaoAtual !== null) {
            if (indiceEdicaoAtual === indice) indiceEdicaoAtual = null;
            else if (indiceEdicaoAtual > indice) indiceEdicaoAtual -= 1;
        }
        atualizarInterfaceMidias();
    };

    const iniciarEdicaoImagem = (indice) => {
        if (!imagensProjeto[indice]) return;
        indiceEdicaoAtual = indice;
        imagemProjetoInput.click();
    };

    const criarPreviewImagem = (arquivo, indiceParaSubstituir = null) => {
        const urlImagem = URL.createObjectURL(arquivo);
        const imagemAnterior = indiceParaSubstituir !== null ? imagensProjeto[indiceParaSubstituir] : null;
        const preview = imagemAnterior ? imagemAnterior.preview : document.createElement('div');
        preview.className = 'adicionar-projeto__hero-preview';

        let media = preview.querySelector('.adicionar-projeto__hero-preview-media');
        if (!media) {
            media = document.createElement('div');
            media.className = 'adicionar-projeto__hero-preview-media';
            preview.appendChild(media);
        }

        let imagem = media.querySelector('img');
        if (!imagem) {
            imagem = document.createElement('img');
            media.appendChild(imagem);
        }
        imagem.src = urlImagem;
        imagem.alt = arquivo.name ? `Pré-visualização de ${arquivo.name}` : 'Pré-visualização da imagem do projeto';

        let acoes = preview.querySelector('.adicionar-projeto__hero-preview-actions');
        if (!acoes) {
            acoes = document.createElement('div');
            acoes.className = 'adicionar-projeto__hero-preview-actions';
            preview.appendChild(acoes);
        }
        acoes.replaceChildren();

        const botaoEditar = document.createElement('button');
        botaoEditar.type = 'button';
        botaoEditar.className = 'adicionar-projeto__hero-preview-button';
        botaoEditar.innerHTML = '<img src="img/icons/lapisbranco.svg" alt=""><span>Editar</span>';

        const botaoExcluir = document.createElement('button');
        botaoExcluir.type = 'button';
        botaoExcluir.className = 'adicionar-projeto__hero-preview-button adicionar-projeto__hero-preview-button--danger';
        botaoExcluir.innerHTML = '<img src="img/icons/lixeirabranca.svg" alt=""><span>Excluir</span>';

        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);

        const imagemRegistrada = imagemAnterior || { urlImagem, preview, imagem, botaoEditar, botaoExcluir, arquivo };
        imagemRegistrada.urlImagem = urlImagem;
        imagemRegistrada.arquivo = arquivo;
        imagemRegistrada.preview = preview;
        imagemRegistrada.imagem = imagem;
        imagemRegistrada.botaoEditar = botaoEditar;
        imagemRegistrada.botaoExcluir = botaoExcluir;

        botaoEditar.addEventListener('click', () => {
            const indiceImagem = imagensProjeto.indexOf(imagemRegistrada);
            if (indiceImagem !== -1) iniciarEdicaoImagem(indiceImagem);
        });

        botaoExcluir.addEventListener('click', () => {
            const indiceImagem = imagensProjeto.indexOf(imagemRegistrada);
            if (indiceImagem !== -1) removerPreviewImagem(indiceImagem);
        });

        if (indiceParaSubstituir !== null && imagensProjeto[indiceParaSubstituir]) {
            URL.revokeObjectURL(imagensProjeto[indiceParaSubstituir].urlImagem);
            imagensProjeto[indiceParaSubstituir] = imagemRegistrada;
            imagemProjetoPreviews.appendChild(preview);
            return;
        }

        imagensProjeto.push(imagemRegistrada);
        imagemProjetoPreviews.appendChild(preview);
    };

    imagemProjetoInput.addEventListener('change', () => {
        const blocoImagens = imagemProjetoPreviews.closest('.adicionar-projeto__hero');
        limparEstadoInvalido(blocoImagens || imagemProjetoInput);

        const arquivosSelecionados = Array.from(imagemProjetoInput.files || []).filter((arquivo) => arquivo.type.startsWith('image/'));

        if (!arquivosSelecionados.length) {
            imagemProjetoInput.value = '';
            indiceEdicaoAtual = null;
            return;
        }

        if (indiceEdicaoAtual !== null && imagensProjeto[indiceEdicaoAtual]) {
            criarPreviewImagem(arquivosSelecionados[0], indiceEdicaoAtual);
            indiceEdicaoAtual = null;
            imagemProjetoInput.value = '';
            atualizarInterfaceMidias();
            return;
        }

        const espacoDisponivel = LIMITE_IMAGENS - imagensProjeto.length;
        const arquivosParaAdicionar = arquivosSelecionados.slice(0, espacoDisponivel);

        arquivosParaAdicionar.forEach((arquivo) => criarPreviewImagem(arquivo));
        imagemProjetoInput.value = '';
        indiceEdicaoAtual = null;
        atualizarInterfaceMidias();
    });

    window.addEventListener('beforeunload', () => {
        imagensProjeto.forEach(({ urlImagem }) => URL.revokeObjectURL(urlImagem));
    });

    atualizarInterfaceMidias();
}

// ==========================================
// CAPA DO PROJETO
// ==========================================
if (capaProjetoInput && capaProjetoDropzone && capaProjetoPlaceholder && capaProjetoPreview && capaProjetoPreviewImg) {
    const mostrarCapaSelecionada = (arquivo) => {
        if (!arquivo || !arquivo.type.startsWith('image/')) return;
        if (capaProjetoUrlAtual) URL.revokeObjectURL(capaProjetoUrlAtual);
        
        capaProjetoArquivo = arquivo; 
        capaProjetoUrlAtual = URL.createObjectURL(arquivo);
        capaProjetoPreviewImg.src = capaProjetoUrlAtual;
        capaProjetoPlaceholder.hidden = true;
        capaProjetoPreview.hidden = false;
    };

    const processarArquivosCapa = (arquivos) => {
        const arquivo = arquivos && arquivos[0];
        if (arquivo) mostrarCapaSelecionada(arquivo);
        capaProjetoInput.value = '';
    };

    const abrirSeletorCapa = () => capaProjetoInput.click();

    capaProjetoDropzone.addEventListener('click', abrirSeletorCapa);
    botaoAdicionarCapa.addEventListener('click', abrirSeletorCapa);

    capaProjetoDropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        capaProjetoDropzone.classList.add('is-dragover');
    });

    capaProjetoDropzone.addEventListener('dragleave', () => capaProjetoDropzone.classList.remove('is-dragover'));

    capaProjetoDropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        capaProjetoDropzone.classList.remove('is-dragover');
        const arquivos = event.dataTransfer && event.dataTransfer.files;
        processarArquivosCapa(arquivos);
    });

    capaProjetoInput.addEventListener('change', () => processarArquivosCapa(capaProjetoInput.files));

    window.addEventListener('beforeunload', () => {
        if (capaProjetoUrlAtual) URL.revokeObjectURL(capaProjetoUrlAtual);
    });
}

// ==========================================
// LÓGICA DO MODAL DE COLABORADORES
// ==========================================
if (modalColaboradores && btnAbrirModalColaborador && btnFecharModalColaboradores) {
    const abrirModalColaboradores = () => {
        modalColaboradores.hidden = false;
        if(inputBuscaColaborador) inputBuscaColaborador.focus();
    };

    const fecharModalColaboradores = () => {
        modalColaboradores.hidden = true;
        if(inputBuscaColaborador) inputBuscaColaborador.value = '';
        if(resultadosBuscaColaboradores) resultadosBuscaColaboradores.innerHTML = '';
    };

    btnAbrirModalColaborador.addEventListener('click', abrirModalColaboradores);
    btnFecharModalColaboradores.addEventListener('click', fecharModalColaboradores);

    window.addEventListener('click', (e) => {
        if (e.target === modalColaboradores) fecharModalColaboradores();
    });

    const renderizarColaboradoresSelecionados = () => {
        if (!listaColaboradoresSelecionados) return;
        listaColaboradoresSelecionados.innerHTML = '';
        
        colaboradoresSelecionados.forEach(user => {
            const div = document.createElement('div');
            div.className = 'colaborador-selecionado';
            div.innerHTML = `
                <div class="colaborador-info">
                    <img class="colaborador-avatar" src="${user.foto_perfil || 'img/default_avatar.png'}" alt="Avatar">
                    <span class="colaborador-nome">${user.nome}</span>
                </div>
                <button class="btn-remover-colaborador" type="button" aria-label="Remover">&times;</button>
            `;
            div.querySelector('.btn-remover-colaborador').addEventListener('click', () => {
                colaboradoresSelecionados = colaboradoresSelecionados.filter(c => c.id !== user.id);
                renderizarColaboradoresSelecionados();
            });
            listaColaboradoresSelecionados.appendChild(div);
        });

        btnAbrirModalColaborador.style.display = colaboradoresSelecionados.length >= MAX_COLABORADORES ? 'none' : 'block';
    };

    const renderizarResultadosBusca = (usuarios) => {
        if (!resultadosBuscaColaboradores) return;
        resultadosBuscaColaboradores.innerHTML = '';
        
        if (!usuarios || usuarios.length === 0) {
            resultadosBuscaColaboradores.innerHTML = '<p style="text-align: center; color: var(--ModoEscuroMesc);">Nenhum usuário encontrado.</p>';
            return;
        }

        usuarios.forEach(user => {
            const isSelected = colaboradoresSelecionados.some(c => c.id === user.id);
            const div = document.createElement('div');
            div.className = `colaborador-card ${isSelected ? 'is-selected' : ''}`;
            div.innerHTML = `
                <div class="colaborador-info">
                    <img class="colaborador-avatar" src="${user.foto_perfil || 'img/default_avatar.png'}">
                    <div>
                        <div class="colaborador-nome">${user.nome}</div>
                        <div class="colaborador-email">${user.email}</div>
                    </div>
                </div>
                ${isSelected ? '<span style="color:var(--ModoEscuroFontV); font-weight: bold;">✓</span>' : ''}
            `;

            if (!isSelected) {
                div.addEventListener('click', () => {
                    if (colaboradoresSelecionados.length >= MAX_COLABORADORES) {
                        return alert(`Você pode adicionar no máximo ${MAX_COLABORADORES} colaboradores.`);
                    }
                    colaboradoresSelecionados.push(user);
                    renderizarColaboradoresSelecionados();
                    fecharModalColaboradores();
                });
            }
            resultadosBuscaColaboradores.appendChild(div);
        });
    };

    let debounceTimer;
    if (inputBuscaColaborador) {
        inputBuscaColaborador.addEventListener('input', (e) => {
            const termo = e.target.value.trim();
            clearTimeout(debounceTimer);
            if (termo.length < 2) {
                resultadosBuscaColaboradores.innerHTML = '';
                return;
            }
            resultadosBuscaColaboradores.innerHTML = '<p style="text-align:center;">Buscando...</p>';
            debounceTimer = setTimeout(async () => {
                if (window.apiProjeto && window.apiProjeto.buscarUsuarios) {
                    const usuarios = await window.apiProjeto.buscarUsuarios(termo);
                    renderizarResultadosBusca(usuarios);
                }
            }, 500);
        });
    }
}

// ==========================================
// INTEGRAÇÃO DE ENVIO COM A API
// ==========================================
if (btnPublicarProjeto) {
    btnPublicarProjeto.addEventListener('click', async () => {
        // Obter os valores
        const titulo = tituloProjetoInput ? tituloProjetoInput.value.trim() : '';
        const legenda = detalhesProjeto ? detalhesProjeto.value.trim() : '';
        const categoriasSelecionadas = obterCategoriasSelecionadasInterface(); // Agora é um array
        
        const visibilidadeCombo = document.getElementById('visibilidade');
        let visibilidade = 'privado';
        if (visibilidadeCombo) {
            visibilidade = visibilidadeCombo.value.toLowerCase().includes('público') ? 'publico' : 'privado';
        }
        
        const comentariosCombo = document.getElementById('comentarios');
        const permissao_comentarios = comentariosCombo ? comentariosCombo.value : 'TODOS';

        // Validação utilizando as funções da UI
        const payloadValidacao = { 
            titulo, 
            legenda, 
            categorias: categoriasSelecionadas, 
            quantidadeImagens: imagensProjeto.length, 
            capa: capaProjetoArquivo 
        };
        const validacao = validarCamposObrigatoriosProjeto(payloadValidacao);
        
        if (!validacao.ok) {
            mostrarFeedbackProjeto(validacao.mensagem, 'erro');
            return;
        }

        // Bloqueia o botão para evitar duplos envios
        btnPublicarProjeto.disabled = true;
        btnPublicarProjeto.style.opacity = '0.7';
        mostrarFeedbackProjeto('Publicando o seu projeto...', 'info');

        // Construindo o FormData
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descricao', legenda);
        formData.append('visibilidade', visibilidade);
        formData.append('permissao_comentarios', permissao_comentarios);
        
        // Categoria (agora pode enviar mais de uma no array `categorias[]`)
        categoriasSelecionadas.forEach((cat) => {
            formData.append('categorias[]', cat); 
        });
        
        // Imagens
        imagensProjeto.forEach((img) => {
            formData.append('imagens', img.arquivo);
        });

        // Capa
        formData.append('capa', capaProjetoArquivo);

        // Colaboradores
        colaboradoresSelecionados.forEach((user) => {
            formData.append('colaboradores[]', user.id);
        });

        // Requisição para a API
        if (window.apiProjeto && window.apiProjeto.enviarProjeto) {
            const resposta = await window.apiProjeto.enviarProjeto(formData);
            
            if (resposta?.ok && resposta?.data?.success) {
                mostrarNotificacaoConfirmacaoProjeto(resposta?.data?.message || 'Projeto publicado com sucesso!');
                limparFormularioProjetoInterface();
                mostrarFeedbackProjeto('', '');
            } else if (resposta?.status === 401) {
                mostrarFeedbackProjeto('Sessão expirada. Faça login para continuar.', 'erro');
            } else {
                mostrarFeedbackProjeto(resposta?.data?.message || 'Ocorreu um erro ao publicar o projeto.', 'erro');
            }
        } else {
            mostrarFeedbackProjeto('Módulo de conexão com a API não carregado.', 'erro');
        }

        // Restaura botão
        btnPublicarProjeto.disabled = false;
        btnPublicarProjeto.style.opacity = '1';
    });
}   