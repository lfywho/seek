document.addEventListener("DOMContentLoaded", () => {
    verificarCadastro();
});

async function verificarCadastro() {

    try {

        const usuario = getUsuarioLogado();

        if (!usuario) return;

        const usuarioId =
            usuario.id ||
            usuario.usuario_id ||
            usuario.usuario?.id;

        if (!usuarioId) {
            console.error("ID do usuário não encontrado");
            return;
        }

        const response = await fetch(
            `${ip_api}/usuarios/verificarcaixa/${usuarioId}`
        );

        const dados = await response.json();

        if (!dados.length) return;

        const cadastro = dados[0];

        if (cadastro.cadastro_completo == 1) {
            return;
        }

        if (cadastro.tipo === "empresa") {
            document.getElementById("modalEmpresa").style.display = "block";
        } else {
            document.getElementById("modalPessoa").style.display = "block";
        }

    } catch (erro) {
        console.error(erro);
    }

}

async function completarColunaCadastro(usuarioId) {

    await fetch(
        `${ip_api}/usuarios/completarcoluna-cadastro/${usuarioId}`,
        {
            method: "PUT"
        }
    );

}

document
    .getElementById("btnSalvarPessoa")
    ?.addEventListener("click", salvarPessoa);

async function salvarPessoa() {

    try {

        const usuario = getUsuarioLogado();

        const usuarioId =
            usuario.id ||
            usuario.usuario_id ||
            usuario.usuario?.id;

        const body = {
            usuario_id: usuarioId,
            nome_de_usuario: document.getElementById("pessoaNomeUsuario").value,
            profissao: document.getElementById("pessoaProfissao").value,
            descricao: document.getElementById("pessoaDescricao").value
        };

        const response = await fetch(
            `${ip_api}/usuarios/completar-cadastro-padrao`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao salvar cadastro");
        }

        await completarColunaCadastro(usuarioId);

        document.getElementById("modalPessoa").style.display = "none";

    } catch (erro) {
        console.error(erro);
        alert("Erro ao salvar cadastro.");
    }

}

document
    .getElementById("btnSalvarEmpresa")
    ?.addEventListener("click", salvarEmpresa);

async function salvarEmpresa() {

    try {

        const usuario = getUsuarioLogado();

        const usuarioId =
            usuario.id ||
            usuario.usuario_id ||
            usuario.usuario?.id;

        const body = {
            usuario_id: usuarioId,
            razao_social: document.getElementById("empresaRazaoSocial").value,
            nome_fantasia: document.getElementById("empresaNomeFantasia").value,
            cnpj: document.getElementById("empresaCnpj").value,
            telefone_comercial: document.getElementById("empresaTelefone").value,
            categoria_negocio: document.getElementById("empresaCategoria").value,
            numero_funcionarios: document.getElementById("empresaFuncionarios").value,
            endereco_completo: "",
            descricao: document.getElementById("empresaDescricao").value
        };

        const response = await fetch(
            `${ip_api}/usuarios/completar-cadastro-empresa`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao salvar cadastro");
        }

        await completarColunaCadastro(usuarioId);

        document.getElementById("modalEmpresa").style.display = "none";

    } catch (erro) {
        console.error(erro);
        alert("Erro ao salvar cadastro.");
    }

}