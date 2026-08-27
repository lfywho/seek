/**
 * Realiza a requisição para a API para criar uma vaga.
 * @param {Object} dados - Corpo da requisição (titulo, descricao, url, categorias)
 * @returns {Promise<Object>} Resposta JSON da API.
 */
async function apiCriarVaga(dados) {
    try {
        const response = await fetch(ip_api + "/vagas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include", // Obrigatório para enviar o JWT no cookie HttpOnly
            body: JSON.stringify(dados)
        });

        const data = await response.json();
        
        return {
            ok: response.ok,
            status: response.status,
            ...data
        };
    } catch (error) {
        console.error("Erro na requisição para criar vaga:", error);
        return {
            success: false,
            message: "Erro de conexão com o servidor. Tente novamente mais tarde."
        };
    }
}