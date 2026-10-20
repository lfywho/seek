document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const termo = (params.get('q') || '').trim();
    const summary = document.getElementById('pesquisaSummary');
    const lista = document.getElementById('resultadoPesquisa');

    function escaparHtml(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, function (caractere) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[caractere];
        });
    }

    function exibirVazio(mensagem) {
        if (summary) summary.textContent = mensagem;
        if (lista) lista.innerHTML = '<div class="pesquisa-page__vazio">' + escaparHtml(mensagem) + '</div>';
    }

    function renderizarUsuarios(usuarios) {
        if (!Array.isArray(usuarios) || usuarios.length === 0) {
            exibirVazio('Nenhum usuário encontrado para a busca atual.');
            return;
        }

        if (summary) summary.textContent = 'Resultados para "' + termo + '" (' + usuarios.length + ')';
        if (!lista) return;

        lista.innerHTML = usuarios.map(function (usuario) {
            const id = escaparHtml(usuario.id);
            const nome = escaparHtml(usuario.nome || usuario.nome_fantasia || 'Usuário');
            const especialidade = escaparHtml(usuario.especialidade || usuario.tipo_usuario || '');
            const foto = escaparHtml(usuario.foto_perfil || 'img/userProfile.png');

            return '<a class="pesquisa-page__usuario" href="usuario.html?iduser=' + id + '">' +
                '<img class="pesquisa-page__usuario-foto" src="' + foto + '" alt="Foto de ' + nome + '">' +
                '<span class="pesquisa-page__usuario-info">' +
                '<span class="pesquisa-page__usuario-nome">' + nome + '</span>' +
                '<span class="pesquisa-page__usuario-area">' + especialidade + '</span>' +
                '</span>' +
                '</a>';
        }).join('');
    }

    if (!termo) {
        exibirVazio('Digite um termo na barra de pesquisa para encontrar usuários.');
        return;
    }

    if (summary) summary.textContent = 'Buscando usuários para "' + termo + '"...';
    if (typeof ip_api === 'undefined') {
        exibirVazio('Não foi possível conectar ao serviço de pesquisa.');
        return;
    }

    try {
        const url = new URL(ip_api + '/usuarios/pesquisar');
        url.searchParams.set('termo', termo);
        url.searchParams.set('historico', 'true');

        const response = await fetch(url.toString(), {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error('A API de pesquisa não retornou JSON.');
        }
        const resultado = await response.json();

        if (!response.ok || !resultado.success) {
            exibirVazio(resultado.message || 'Não foi possível buscar usuários.');
            return;
        }

        renderizarUsuarios(resultado.data || []);
    } catch (error) {
        console.error('Erro ao pesquisar usuários:', error);
        exibirVazio('Não foi possível carregar os resultados da pesquisa.');
    }
});
