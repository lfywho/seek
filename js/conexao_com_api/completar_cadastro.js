document.addEventListener("DOMContentLoaded", () => {
    verificarPrimeiroLogin();

    // Configura upload de foto para abrir a janela ao clicar na div
    configurarUploadAvatar("avatarEmpresaBox", "fotoEmpresa", "iconAvatarEmpresa");
    configurarUploadAvatar("avatarPessoaBox", "fotoPessoa", "iconAvatarPessoa");

    // Configura seleção de currículo PDF
    configurarUploadCurriculo();

    // Eventos de salvar
    const btnSalvarPessoa = document.getElementById("btnSalvarPessoa");
    if (btnSalvarPessoa) {
        btnSalvarPessoa.addEventListener("click", salvarPerfilPessoaFisica);
    }

    const btnSalvarEmpresa = document.getElementById("btnSalvarEmpresa");
    if (btnSalvarEmpresa) {
        btnSalvarEmpresa.addEventListener("click", salvarPerfilEmpresa);
    }
});

/**
 * Utilitário: Permite clicar na div do avatar para escolher uma imagem e exibe preview
 */
function configurarUploadAvatar(boxId, inputId, iconId) {
    const box = document.getElementById(boxId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!box || !input) return;

    box.addEventListener("click", () => input.click());

    input.addEventListener("change", function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                box.style.backgroundImage = `url('${e.target.result}')`;
                box.style.backgroundSize = "cover";
                box.style.backgroundPosition = "center";
                if (icon) icon.style.display = "none"; // Oculta o ícone de "+"
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
}

/**
 * Utilitário: Configura o botão para escolher o PDF do currículo
 */
function configurarUploadCurriculo() {
    const btnAnexarCurriculo = document.getElementById("btnAnexarCurriculo");
    const arquivoCurriculo = document.getElementById("arquivoCurriculo");
    const nomeArquivoCurriculo = document.getElementById("nomeArquivoCurriculo");

    if (!btnAnexarCurriculo || !arquivoCurriculo) return;

    btnAnexarCurriculo.addEventListener("click", (e) => {
        e.preventDefault();
        arquivoCurriculo.click();
    });

    arquivoCurriculo.addEventListener("change", function () {
        if (this.files && this.files.length > 0) {
            nomeArquivoCurriculo.textContent = this.files[0].name;
        } else {
            nomeArquivoCurriculo.textContent = "Nenhum arquivo selecionado";
        }
    });
}

/**
 * 1. Verifica se é o primeiro login do usuário
 */
async function verificarPrimeiroLogin() {
    try {
        const response = await fetch(`${ip_api}/usuarios/verificar-primeiro-login`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.warn("Usuário não autenticado. O modal não será aberto.");
            }
            return;
        }

        const data = await response.json();
        if (data.success && data.data && data.data.primeiro_login === true) {
            await abrirModalPorTipoUsuario();
        }

    } catch (erro) {
        console.error("Erro ao verificar primeiro login:", erro);
    }
}

/**
 * 2. Abre o modal correto baseado no tipo de usuário
 */
async function abrirModalPorTipoUsuario() {
    try {
        const response = await fetch(`${ip_api}/auth/me`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.success && data.data && data.data.usuario) {
            const tipoUsuario = data.data.usuario.tipo_usuario;
            const modalEmpresa = document.getElementById("modalEmpresa");
            const modalPessoa = document.getElementById("modalPessoa");

            if (tipoUsuario === "PF") {
                if (modalPessoa) modalPessoa.style.display = "block";
            } else {
                if (modalEmpresa) modalEmpresa.style.display = "block";
            }
        }
    } catch (erro) {
        console.error("Erro ao buscar o tipo de usuário:", erro);
    }
}

/**
 * 3. Envia os dados da Pessoa Física (agora como FormData para suportar o file do curriculo)
 */
async function salvarPerfilPessoaFisica(event) {
    event.preventDefault();
    const btn = event.target;
    const textoOriginal = btn.innerText || btn.textContent;
    btn.disabled = true;
    btn.innerText = "Salvando...";

    try {
        // Criar FormData para mesclar campos de texto e o arquivo do currículo
        const formData = new FormData();
        
        // Dados textuais
        formData.append("nome_usuario", document.getElementById("pessoaNomeUsuario")?.value || "");
        formData.append("sobre", document.getElementById("pessoaDescricao")?.value || "");
        formData.append("linkedin", document.getElementById("pessoaLinkedin")?.value || "");
        formData.append("github", document.getElementById("pessoaGithub")?.value || "");

        // Arquivo (currículo)
        const fileInputCurriculo = document.getElementById("arquivoCurriculo");
        if (fileInputCurriculo && fileInputCurriculo.files.length > 0) {
            formData.append("curriculo", fileInputCurriculo.files[0]);
        }

        const resPerfil = await fetch(`${ip_api}/usuarios/perfil-pessoa-fisica`, {
            method: "PUT",
            credentials: "include",
            body: formData // Não definimos Content-Type explícito
        });

        if (!resPerfil.ok) {
            const dataErr = await resPerfil.json();
            throw new Error(dataErr.message || "Erro ao salvar perfil.");
        }

        // Enviar Foto de Perfil (se selecionada)
        await enviarFotoPerfil("fotoPessoa");

        // Concluir cadastro
        await finalizarStatusCadastro();

        // Fechar Modal e dar feedback
        document.getElementById("modalPessoa").style.display = "none";
        console.log("Cadastro de Pessoa Física completo.");

    } catch (erro) {
        console.error(erro);
        alert(erro.message || "Ocorreu um erro ao concluir o cadastro.");
    } finally {
        btn.disabled = false;
        btn.innerText = textoOriginal;
    }
}

/**
 * 4. Envia os dados da Empresa (mantido em JSON) e completa o cadastro
 */
async function salvarPerfilEmpresa(event) {
    event.preventDefault();
    const btn = event.target;
    const textoOriginal = btn.innerText || btn.textContent;
    btn.disabled = true;
    btn.innerText = "Salvando...";

    try {
        const payload = {
            razao_social: document.getElementById("empresaRazaoSocial")?.value || "",
            nome_fantasia: document.getElementById("empresaNomeFantasia")?.value || "",
            telefone_comercial: document.getElementById("empresaTelefone")?.value || "",
            categoria_negocio: document.getElementById("empresaCategoria")?.value || "",
            numero_funcionarios: parseInt(document.getElementById("empresaFuncionarios")?.value) || 0,
            descricao: document.getElementById("empresaDescricao")?.value || "",
            site: document.getElementById("empresaSite")?.value || ""
        };

        const resPerfil = await fetch(`${ip_api}/usuarios/perfil-empresa`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!resPerfil.ok) {
            const dataErr = await resPerfil.json();
            throw new Error(dataErr.message || "Erro ao salvar perfil da empresa.");
        }

        // Enviar Foto de Perfil (se selecionada)
        await enviarFotoPerfil("fotoEmpresa");

        // Concluir cadastro
        await finalizarStatusCadastro();

        // Fechar Modal e dar feedback
        document.getElementById("modalEmpresa").style.display = "none";
        console.log("Cadastro de Empresa completo.");

    } catch (erro) {
        console.error(erro);
        alert(erro.message || "Ocorreu um erro ao concluir o cadastro.");
    } finally {
        btn.disabled = false;
        btn.innerText = textoOriginal;
    }
}

/**
 * Utilitário: Faz o envio da foto via FormData caso exista arquivo no input
 */
async function enviarFotoPerfil(inputId) {
    const fileInput = document.getElementById(inputId);
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        return; // Nenhuma foto selecionada, pula esta etapa
    }

    const formData = new FormData();
    formData.append("foto", fileInput.files[0]);

    const resFoto = await fetch(`${ip_api}/usuarios/foto-perfil`, {
        method: "PUT",
        credentials: "include",
        body: formData // Não defina Content-Type para FormData
    });

    if (!resFoto.ok) {
        console.warn("O perfil foi salvo, mas houve um erro ao enviar a foto.");
    }
}

/**
 * Utilitário: Chama a rota original que muda a flag no banco dizendo que o cadastro acabou
 */
async function finalizarStatusCadastro() {
    const resFinal = await fetch(`${ip_api}/usuarios/completar-cadastro`, {
        method: "PATCH",
        credentials: "include"
    });

    if (!resFinal.ok) {
        const dataFinal = await resFinal.json();
        throw new Error(dataFinal.message || "Erro ao atualizar status do cadastro.");
    }
}