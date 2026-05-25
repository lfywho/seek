const categorias = [
    'Design',
    'Ilustração',
    'Rascunhos',
    '3D Design',
    'HQ',
    'UI/UX',
    'Branding',
    'Logotipo',
    'Marca',
    'Pintura Digital',
    'Arte Digital',
    'Arte',
    'Arte Tradicional',
    'Escultura',
    'Ensaio Fotográfico',
    'Foto',
    'Moda',
    'Design de Moda',
    'Animação',
    'Redes sociais'
];

const ferramentas = [
    'Photoshop',
    'Illustrator',
    'Canva',
    'Figma',
    'Miro',
    'InDesign',
    'ProCreate',
    'ClipStudiio',
    'Gimp',
    'Premier',
    'Motion',
    'DaVinci Resolve',
    'Blender',
    '3D Max',
    'After Effects',
    'CorelDRAW',
    'Krita',
    'PaintTool SAI',
    'ZBrush',
    'SketchUp'
];

const chipsContainer = document.getElementById('chips-categorias');
const toolsContainer = document.getElementById('chips-ferramentas');
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
const categoriaPesquisaInput = document.querySelector('.adicionar-projeto__search-box input');
const sidebarProjeto = document.querySelector('.adicionar-projeto__sidebar');

const LIMITE_IMAGENS = 10;
const imagensProjeto = [];
let indiceEdicaoAtual = null;
let capaProjetoUrlAtual = '';

function obterCategoriaSelecionadaInterface() {
    if (!chipsContainer) {
        return '';
    }

    const chipAtivo = chipsContainer.querySelector('.adicionar-projeto__chip.is-active');
    return chipAtivo ? chipAtivo.textContent.trim() : '';
}

function obterCategoriaDigitadaInterface() {
    return categoriaPesquisaInput ? categoriaPesquisaInput.value.trim() : '';
}

function obterCategoriaParaEnvioInterface() {
    const categoriaDigitada = obterCategoriaDigitadaInterface();
    if (categoriaDigitada) {
        return categoriaDigitada;
    }

    return obterCategoriaSelecionadaInterface();
}

function limparEstadoInvalido(elemento) {
    if (!elemento) {
        return;
    }

    elemento.style.outline = '';
    elemento.style.outlineOffset = '';
    elemento.removeAttribute('aria-invalid');
}

function marcarEstadoInvalido(elemento) {
    if (!elemento) {
        return;
    }

    elemento.style.outline = '2px solid #d92d20';
    elemento.style.outlineOffset = '2px';
    elemento.setAttribute('aria-invalid', 'true');
}

function limparValidacaoVisualProjeto() {
    limparEstadoInvalido(tituloProjetoInput);
    limparEstadoInvalido(detalhesProjeto);
    limparEstadoInvalido(chipsContainer);
    limparEstadoInvalido(categoriaPesquisaInput);

    const blocoImagens = imagemProjetoPreviews ? imagemProjetoPreviews.closest('.adicionar-projeto__hero') : null;
    limparEstadoInvalido(blocoImagens || imagemProjetoInput);
}

function validarCamposObrigatoriosProjeto(dados) {
    const payload = dados || {};
    const faltantes = [];
    const titulo = (payload.titulo || '').trim();
    const legenda = (payload.legenda || '').trim();
    const categoria = (payload.categoria || '').trim();
    const quantidadeImagens = Number(payload.quantidadeImagens || 0);

    limparValidacaoVisualProjeto();

    if (!titulo) {
        faltantes.push('titulo');
        marcarEstadoInvalido(tituloProjetoInput);
    }

    if (!legenda) {
        faltantes.push('detalhes do projeto');
        marcarEstadoInvalido(detalhesProjeto);
    }

    if (!categoria) {
        faltantes.push('categoria');
        marcarEstadoInvalido(chipsContainer);
        marcarEstadoInvalido(categoriaPesquisaInput);
    }

    if (quantidadeImagens < 1 || quantidadeImagens > 10) {
        faltantes.push('imagens (minimo 1 e maximo 10)');
        const blocoImagens = imagemProjetoPreviews ? imagemProjetoPreviews.closest('.adicionar-projeto__hero') : null;
        marcarEstadoInvalido(blocoImagens || imagemProjetoInput);
    }

    if (faltantes.length) {
        return {
            ok: false,
            mensagem: 'Preencha os campos obrigatorios: ' + faltantes.join(', ') + '.'
        };
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

        if (sidebarProjeto) {
            sidebarProjeto.appendChild(feedback);
        }
    }

    return feedback;
}

function mostrarFeedbackProjeto(texto, tipo) {
    const feedback = criarOuObterFeedbackProjeto();

    if (!feedback) {
        return;
    }

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

    if (window.__toastProjetoTimeout) {
        clearTimeout(window.__toastProjetoTimeout);
    }

    window.__toastProjetoTimeout = setTimeout(() => {
        notificacao.style.opacity = '0';
        notificacao.style.transform = 'translateY(8px)';
    }, 2600);
}

function limparFormularioProjetoInterface() {
    if (tituloProjetoInput) {
        tituloProjetoInput.value = '';
    }

    if (detalhesProjeto) {
        detalhesProjeto.value = '';
        detalhesProjeto.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (imagensProjeto.length) {
        imagensProjeto.forEach(({ urlImagem }) => {
            URL.revokeObjectURL(urlImagem);
        });
        imagensProjeto.splice(0, imagensProjeto.length);
    }

    indiceEdicaoAtual = null;

    if (imagemProjetoInput) {
        imagemProjetoInput.value = '';
    }

    if (imagemProjetoPreviews) {
        imagemProjetoPreviews.innerHTML = '';
        imagemProjetoPreviews.hidden = true;
    }

    if (imagemProjetoEmptyState) {
        imagemProjetoEmptyState.hidden = false;
    }

    if (adicionarMidiaCard) {
        adicionarMidiaCard.hidden = true;
    }

    if (chipsContainer) {
        const chips = Array.from(chipsContainer.querySelectorAll('.adicionar-projeto__chip'));
        chips.forEach((chip) => {
            chip.classList.remove('is-active');
        });

        if (chips[0]) {
            chips[0].classList.add('is-active');
        }
    }

    if (categoriaPesquisaInput) {
        categoriaPesquisaInput.value = '';
    }

    const visibilidadeSelect = document.getElementById('visibilidade');
    if (visibilidadeSelect) {
        visibilidadeSelect.selectedIndex = 0;
    }

    const comentariosSelect = document.getElementById('comentarios');
    if (comentariosSelect) {
        comentariosSelect.selectedIndex = 0;
    }

    const radioNao18 = document.querySelector('input[name="conteudo18"][value="nao"]');
    if (radioNao18) {
        radioNao18.checked = true;
    }

    if (capaProjetoInput) {
        capaProjetoInput.value = '';
    }

    if (capaProjetoUrlAtual) {
        URL.revokeObjectURL(capaProjetoUrlAtual);
        capaProjetoUrlAtual = '';
    }

    if (capaProjetoPreviewImg) {
        capaProjetoPreviewImg.src = '';
    }

    if (capaProjetoPreview) {
        capaProjetoPreview.hidden = true;
    }

    if (capaProjetoPlaceholder) {
        capaProjetoPlaceholder.hidden = false;
    }

    limparValidacaoVisualProjeto();
}

window.seekProjetoUI = {
    obterCategoriaParaEnvio: obterCategoriaParaEnvioInterface,
    validarCamposObrigatorios: validarCamposObrigatoriosProjeto,
    mostrarFeedback: mostrarFeedbackProjeto,
    mostrarNotificacaoConfirmacao: mostrarNotificacaoConfirmacaoProjeto,
    limparFormulario: limparFormularioProjetoInterface,
    limparEstadoInvalido
};

if (chipsContainer) {
    categorias.forEach((categoria, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `adicionar-projeto__chip${index === 0 ? ' is-active' : ''}`;
        button.textContent = categoria;
        button.addEventListener('click', () => {
            const estavaAtivo = button.classList.contains('is-active');

            chipsContainer.querySelectorAll('.adicionar-projeto__chip').forEach((chip) => {
                chip.classList.remove('is-active');
            });

            if (!estavaAtivo) {
                button.classList.add('is-active');
            }
        });
        chipsContainer.appendChild(button);
    });
}

if (chipsContainer && categoriaPesquisaInput) {
    const removerCategoriaAtiva = () => {
        chipsContainer.querySelectorAll('.adicionar-projeto__chip').forEach((chip) => {
            chip.classList.remove('is-active');
        });
    };

    categoriaPesquisaInput.addEventListener('click', removerCategoriaAtiva);
    categoriaPesquisaInput.addEventListener('focus', removerCategoriaAtiva);
    categoriaPesquisaInput.addEventListener('input', () => {
        removerCategoriaAtiva();
        limparEstadoInvalido(categoriaPesquisaInput);
        limparEstadoInvalido(chipsContainer);
    });
}

if (tituloProjetoInput) {
    tituloProjetoInput.addEventListener('input', () => {
        limparEstadoInvalido(tituloProjetoInput);
    });
}

if (detalhesProjeto) {
    detalhesProjeto.addEventListener('input', () => {
        limparEstadoInvalido(detalhesProjeto);
    });
}

if (chipsContainer) {
    chipsContainer.addEventListener('click', () => {
        limparEstadoInvalido(chipsContainer);
        limparEstadoInvalido(categoriaPesquisaInput);
    });
}

if (toolsContainer) {
    ferramentas.forEach((ferramenta) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'adicionar-projeto__chip';
        button.textContent = ferramenta;
        toolsContainer.appendChild(button);
    });
}

if (detalhesProjeto && detalhesProjetoCounter) {
    const atualizarContador = () => {
        detalhesProjetoCounter.textContent = detalhesProjeto.value.length;
    };

    detalhesProjeto.addEventListener('input', atualizarContador);
    atualizarContador();
}

if (imagemProjetoInput && imagemProjetoEmptyState && imagemProjetoPreviews && adicionarMidiaCard) {
    const atualizarInterfaceMidias = () => {
        const possuiImagens = imagensProjeto.length > 0;

        imagemProjetoEmptyState.hidden = possuiImagens;
        imagemProjetoPreviews.hidden = !possuiImagens;
        adicionarMidiaCard.hidden = !possuiImagens;
    };

    const removerPreviewImagem = (indice) => {
        const imagem = imagensProjeto[indice];

        if (!imagem) {
            return;
        }

        URL.revokeObjectURL(imagem.urlImagem);
        imagem.preview.remove();
        imagensProjeto.splice(indice, 1);

        if (indiceEdicaoAtual !== null) {
            if (indiceEdicaoAtual === indice) {
                indiceEdicaoAtual = null;
            } else if (indiceEdicaoAtual > indice) {
                indiceEdicaoAtual -= 1;
            }
        }

        atualizarInterfaceMidias();
    };

    const iniciarEdicaoImagem = (indice) => {
        if (!imagensProjeto[indice]) {
            return;
        }

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

        const iconeEditar = document.createElement('img');
        iconeEditar.src = 'img/icons/lapisbranco.svg';
        iconeEditar.alt = '';

        const textoEditar = document.createElement('span');
        textoEditar.textContent = 'Editar';

        botaoEditar.appendChild(iconeEditar);
        botaoEditar.appendChild(textoEditar);

        const botaoExcluir = document.createElement('button');
        botaoExcluir.type = 'button';
        botaoExcluir.className = 'adicionar-projeto__hero-preview-button adicionar-projeto__hero-preview-button--danger';

        const iconeExcluir = document.createElement('img');
        iconeExcluir.src = 'img/icons/lixeirabranca.svg';
        iconeExcluir.alt = '';

        const textoExcluir = document.createElement('span');
        textoExcluir.textContent = 'Excluir';

        botaoExcluir.appendChild(iconeExcluir);
        botaoExcluir.appendChild(textoExcluir);

        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);

        const imagemRegistrada = imagemAnterior || { urlImagem, preview, imagem, botaoEditar, botaoExcluir };
        imagemRegistrada.urlImagem = urlImagem;
        imagemRegistrada.preview = preview;
        imagemRegistrada.imagem = imagem;
        imagemRegistrada.botaoEditar = botaoEditar;
        imagemRegistrada.botaoExcluir = botaoExcluir;

        botaoEditar.addEventListener('click', () => {
            const indiceImagem = imagensProjeto.indexOf(imagemRegistrada);

            if (indiceImagem !== -1) {
                iniciarEdicaoImagem(indiceImagem);
            }
        });

        botaoExcluir.addEventListener('click', () => {
            const indiceImagem = imagensProjeto.indexOf(imagemRegistrada);

            if (indiceImagem !== -1) {
                removerPreviewImagem(indiceImagem);
            }
        });

        if (indiceParaSubstituir !== null && imagensProjeto[indiceParaSubstituir]) {
            URL.revokeObjectURL(imagensProjeto[indiceParaSubstituir].urlImagem);

            imagensProjeto[indiceParaSubstituir].urlImagem = urlImagem;
            imagensProjeto[indiceParaSubstituir].preview = preview;
            imagensProjeto[indiceParaSubstituir].imagem = imagem;
            imagensProjeto[indiceParaSubstituir].botaoEditar = botaoEditar;
            imagensProjeto[indiceParaSubstituir].botaoExcluir = botaoExcluir;

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

        const arquivoSelecionado = arquivosSelecionados[0];

        if (indiceEdicaoAtual !== null && imagensProjeto[indiceEdicaoAtual]) {
            criarPreviewImagem(arquivoSelecionado, indiceEdicaoAtual);
            indiceEdicaoAtual = null;
            imagemProjetoInput.value = '';
            atualizarInterfaceMidias();
            return;
        }

        const espacoDisponivel = LIMITE_IMAGENS - imagensProjeto.length;
        const arquivosParaAdicionar = arquivosSelecionados.slice(0, espacoDisponivel);

        arquivosParaAdicionar.forEach((arquivo) => {
            criarPreviewImagem(arquivo);
        });

        imagemProjetoInput.value = '';
        indiceEdicaoAtual = null;
        atualizarInterfaceMidias();
    });

    window.addEventListener('beforeunload', () => {
        imagensProjeto.forEach(({ urlImagem }) => {
            URL.revokeObjectURL(urlImagem);
        });
    });

    atualizarInterfaceMidias();
}

if (capaProjetoInput && capaProjetoDropzone && capaProjetoPlaceholder && capaProjetoPreview && capaProjetoPreviewImg) {
    const mostrarCapaSelecionada = (arquivo) => {
        if (!arquivo || !arquivo.type.startsWith('image/')) {
            return;
        }

        if (capaProjetoUrlAtual) {
            URL.revokeObjectURL(capaProjetoUrlAtual);
        }

        capaProjetoUrlAtual = URL.createObjectURL(arquivo);
        capaProjetoPreviewImg.src = capaProjetoUrlAtual;
        capaProjetoPlaceholder.hidden = true;
        capaProjetoPreview.hidden = false;
    };

    const processarArquivosCapa = (arquivos) => {
        const arquivo = arquivos && arquivos[0];

        if (arquivo) {
            mostrarCapaSelecionada(arquivo);
        }

        capaProjetoInput.value = '';
    };

    const abrirSeletorCapa = () => {
        capaProjetoInput.click();
    };

    capaProjetoDropzone.addEventListener('click', abrirSeletorCapa);
    botaoAdicionarCapa.addEventListener('click', abrirSeletorCapa);

    capaProjetoDropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        capaProjetoDropzone.classList.add('is-dragover');
    });

    capaProjetoDropzone.addEventListener('dragleave', () => {
        capaProjetoDropzone.classList.remove('is-dragover');
    });

    capaProjetoDropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        capaProjetoDropzone.classList.remove('is-dragover');

        const arquivos = event.dataTransfer && event.dataTransfer.files;
        processarArquivosCapa(arquivos);
    });

    capaProjetoInput.addEventListener('change', () => {
        processarArquivosCapa(capaProjetoInput.files);
    });

    window.addEventListener('beforeunload', () => {
        if (capaProjetoUrlAtual) {
            URL.revokeObjectURL(capaProjetoUrlAtual);
        }
    });
}
