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
const detalhesProjeto = document.getElementById('detalhesProjeto');
const detalhesProjetoCounter = document.getElementById('detalhesProjetoCounter');
const imagemProjetoInput = document.getElementById('imagemProjetoInput');
const videoProjetoInput = document.getElementById('videoProjetoInput');
const botaoAdicionarImagem = document.getElementById('botaoAdicionarImagem');
const botaoAdicionarVideo = document.getElementById('botaoAdicionarVideo');
const botaoAdicionarImagemCard = document.getElementById('botaoAdicionarImagemCard');
const botaoAdicionarVideoCard = document.getElementById('botaoAdicionarVideoCard');
const botaoEditarImagem = document.getElementById('botaoEditarImagem');
const botaoExcluirImagem = document.getElementById('botaoExcluirImagem');
const imagemProjetoEmptyState = document.getElementById('imagemProjetoEmptyState');
const imagemProjetoPreview = document.getElementById('imagemProjetoPreview');
const imagemProjetoPreviewMedia = document.getElementById('imagemProjetoPreviewMedia');
const imagemProjetoPreviewImg = document.getElementById('imagemProjetoPreviewImg');
const imagemProjetoPreviewVideo = document.getElementById('imagemProjetoPreviewVideo');

let imagemProjetoUrlAtual = '';
let tipoMidiaAtual = '';

if (chipsContainer) {
    categorias.forEach((categoria, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `adicionar-projeto__chip${index === 0 ? ' is-active' : ''}`;
        button.textContent = categoria;
        button.addEventListener('click', () => {
            chipsContainer.querySelectorAll('.adicionar-projeto__chip').forEach((chip) => {
                chip.classList.remove('is-active');
            });
            button.classList.add('is-active');
        });
        chipsContainer.appendChild(button);
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

if (imagemProjetoInput && videoProjetoInput && botaoAdicionarImagem && botaoAdicionarVideo && botaoEditarImagem && botaoExcluirImagem && imagemProjetoEmptyState && imagemProjetoPreview && imagemProjetoPreviewMedia && imagemProjetoPreviewImg && imagemProjetoPreviewVideo) {
    const mostrarPreview = (url, tipoMidia) => {
        if (tipoMidia === 'video') {
            imagemProjetoPreviewImg.hidden = true;
            imagemProjetoPreviewVideo.hidden = false;
            imagemProjetoPreviewVideo.src = url;
        } else {
            imagemProjetoPreviewVideo.hidden = true;
            imagemProjetoPreviewVideo.removeAttribute('src');
            imagemProjetoPreviewImg.hidden = false;
            imagemProjetoPreviewImg.src = url;
        }

        imagemProjetoEmptyState.hidden = true;
        imagemProjetoPreview.hidden = false;
    };

    const limparPreview = () => {
        if (imagemProjetoUrlAtual) {
            URL.revokeObjectURL(imagemProjetoUrlAtual);
            imagemProjetoUrlAtual = '';
        }

        tipoMidiaAtual = '';

        imagemProjetoInput.value = '';
        videoProjetoInput.value = '';
        imagemProjetoPreviewImg.removeAttribute('src');
        imagemProjetoPreviewVideo.removeAttribute('src');
        imagemProjetoPreviewImg.hidden = false;
        imagemProjetoPreviewVideo.hidden = true;
        imagemProjetoPreview.hidden = true;
        imagemProjetoEmptyState.hidden = false;
    };

    const selecionarImagem = () => {
        imagemProjetoInput.click();
    };

    const selecionarVideo = () => {
        videoProjetoInput.click();
    };

    const editarMidiaAtual = () => {
        if (tipoMidiaAtual === 'video') {
            selecionarVideo();
            return;
        }

        selecionarImagem();
    };

    botaoAdicionarImagem.addEventListener('click', selecionarImagem);
    botaoAdicionarVideo.addEventListener('click', selecionarVideo);
    if (botaoAdicionarImagemCard) {
        botaoAdicionarImagemCard.addEventListener('click', selecionarImagem);
    }
    if (botaoAdicionarVideoCard) {
        botaoAdicionarVideoCard.addEventListener('click', selecionarVideo);
    }
    botaoEditarImagem.addEventListener('click', editarMidiaAtual);
    botaoExcluirImagem.addEventListener('click', limparPreview);

    imagemProjetoInput.addEventListener('change', () => {
        const arquivo = imagemProjetoInput.files && imagemProjetoInput.files[0];

        if (!arquivo) {
            limparPreview();
            return;
        }

        if (imagemProjetoUrlAtual) {
            URL.revokeObjectURL(imagemProjetoUrlAtual);
        }

        imagemProjetoUrlAtual = URL.createObjectURL(arquivo);
        tipoMidiaAtual = 'image';
        mostrarPreview(imagemProjetoUrlAtual, tipoMidiaAtual);
    });

    videoProjetoInput.addEventListener('change', () => {
        const arquivo = videoProjetoInput.files && videoProjetoInput.files[0];

        if (!arquivo) {
            limparPreview();
            return;
        }

        if (imagemProjetoUrlAtual) {
            URL.revokeObjectURL(imagemProjetoUrlAtual);
        }

        imagemProjetoUrlAtual = URL.createObjectURL(arquivo);
        tipoMidiaAtual = 'video';
        mostrarPreview(imagemProjetoUrlAtual, tipoMidiaAtual);
    });
}
