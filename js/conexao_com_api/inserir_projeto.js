window.apiProjeto = {
    
    // Busca usuários por GET passando os query params
    buscarUsuarios: async (termo) => {
        try {
            const url = new URL(ip_api + "/usuarios/pesquisar");
            url.searchParams.append("termo", termo);
            url.searchParams.append("historico", "false");

            const response = await fetch(url.toString(), {
                method: "GET",
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return data.data; // Retorna o array de usuários
                }
            } else if (response.status === 401) {
                (window.seekNotificar || window.alert)("Sua sessão expirou. Faça login novamente.");
            }
            return null;
        } catch (error) {
            console.error("Erro na requisição de busca de usuários:", error);
            return null;
        }
    },

    // Envia o formData preparado (multipart/form-data automático pelo navegador)
    enviarProjeto: async (formData) => {
        try {
            const response = await fetch(ip_api + "/posts", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return true;
            } else if (response.status === 401) {
                (window.seekNotificar || window.alert)("Sessão expirada. Faça login novamente.");
                return false;
            } else {
                (window.seekNotificar || window.alert)("Erro ao publicar: " + (data.message || "Tente novamente."));
                return false;
            }
        } catch (error) {
            console.error("Erro na comunicação com a API ao postar projeto:", error);
            (window.seekNotificar || window.alert)("Erro de comunicação com o servidor.");
            return false;
        }
    }
};
