document.addEventListener("DOMContentLoaded", () => {
    verificarPrimeiroLogin();

    // Adiciona os eventos aos botões de salvar, que temporariamente 
    // apenas completam o cadastro sem enviar os dados do formulário
    const btnSalvarPessoa = document.getElementById("btnSalvarPessoa");
    if (btnSalvarPessoa) {
        btnSalvarPessoa.addEventListener("click", completarCadastro);
    }

    const btnSalvarEmpresa = document.getElementById("btnSalvarEmpresa");
    if (btnSalvarEmpresa) {
        btnSalvarEmpresa.addEventListener("click", completarCadastro);
    }
});

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
            } else {
                console.error("Erro na verificação de cadastro:", response.status);
            }
            return;
        }

        const data = await response.json();

        // Se a API retornar sucesso e a flag de primeiro login for true, abre o modal
        if (data.success && data.data && data.data.primeiro_login === true) {
            await abrirModalPorTipoUsuario();
        }

    } catch (erro) {
        console.error("Erro de comunicação ao verificar primeiro login:", erro);
    }
}

/**
 * Utilitário: Busca os dados do usuário para saber qual modal abrir (PF ou Empresa)
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
            const tipoUsuario = data.data.usuario.tipo_usuario; // "PF" ou outro tipo (PJ/Empresa)
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
        // Fallback de segurança para mostrar o de pessoa física
        const modalPessoa = document.getElementById("modalPessoa");
        if (modalPessoa) modalPessoa.style.display = "block";
    }
}

/**
 * 2. Atualiza o Status para "Cadastro Completo" e fecha o modal
 */
async function completarCadastro(event) {
    event.preventDefault(); // Previne reload caso o botão seja type="submit" num form

    const btn = event.target;
    const textoOriginal = btn.innerText || btn.textContent;
    
    // Desabilita o botão para evitar múltiplos cliques
    btn.disabled = true;
    btn.innerText = "Salvando...";

    try {
        const response = await fetch(`${ip_api}/usuarios/completar-cadastro`, {
            method: "PATCH",
            credentials: "include" // Importante: Garante envio do cookie
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Sucesso! Fechamos ambos os modais
            const modalPessoa = document.getElementById("modalPessoa");
            const modalEmpresa = document.getElementById("modalEmpresa");

            if (modalPessoa) modalPessoa.style.display = "none";
            if (modalEmpresa) modalEmpresa.style.display = "none";

            console.log(data.message); // Exibe no console "Cadastro completado com sucesso."
        } else {
            // Caso a API retorne success: false ou erro de validação
            alert(data.message || "Ocorreu um erro ao concluir o cadastro.");
        }
    } catch (erro) {
        console.error("Erro ao completar cadastro:", erro);
        alert("Erro de comunicação com o servidor. Tente novamente mais tarde.");
    } finally {
        // Restaura o estado do botão
        btn.disabled = false;
        btn.innerText = textoOriginal;
    }
}