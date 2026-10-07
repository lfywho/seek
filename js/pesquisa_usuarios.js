document.addEventListener('DOMContentLoaded', function () {
    const usuariosMockados = [
        { id: 1, nome: 'Ana Souza', foto_perfil: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', especialidade: 'Designer' },
        { id: 2, nome: 'Lucas Ferreira', foto_perfil: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', especialidade: 'Fotógrafo' },
        { id: 3, nome: 'Beatriz Costa', foto_perfil: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80', especialidade: 'Ilustradora' },
        { id: 4, nome: 'Mateus Ribeiro', foto_perfil: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', especialidade: 'Desenvolvedor' },
        { id: 5, nome: 'Carolina Lima', foto_perfil: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', especialidade: 'Artista visual' },
        { id: 6, nome: 'Rafael Almeida', foto_perfil: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80', especialidade: 'Motion designer' },
        { id: 7, nome: 'Isabela Mendes', foto_perfil: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', especialidade: 'Brand designer' },
        { id: 8, nome: 'Gabriel Nunes', foto_perfil: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=200&q=80', especialidade: 'UI/UX' }
    ];

    const params = new URLSearchParams(window.location.search);
    const termo = (params.get('q') || '').trim();
    const summary = document.getElementById('pesquisaSummary');
    const lista = document.getElementById('resultadoPesquisa');

    const resultado = !termo
        ? usuariosMockados
        : usuariosMockados.filter(function (usuario) {
            const nome = (usuario.nome || '').toLowerCase();
            const area = (usuario.especialidade || '').toLowerCase();
            const busca = termo.toLowerCase();
            return nome.includes(busca) || area.includes(busca);
        });

    if (summary) {
        summary.textContent = termo
            ? 'Resultados para "' + termo + '" (' + resultado.length + ')'
            : 'Mostrando usuários em destaque';
    }

    if (!lista) {
        return;
    }

    if (!resultado.length) {
        lista.innerHTML = '<div class="pesquisa-page__vazio">Nenhum usuário encontrado para a busca atual.</div>';
        return;
    }

    lista.innerHTML = resultado.map(function (usuario) {
        return '<a class="pesquisa-page__usuario" href="usuario.html?iduser=' + usuario.id + '">' +
            '<img class="pesquisa-page__usuario-foto" src="' + usuario.foto_perfil + '" alt="Foto de ' + usuario.nome + '">' +
            '<span class="pesquisa-page__usuario-info">' +
            '<span class="pesquisa-page__usuario-nome">' + usuario.nome + '</span>' +
            '<span class="pesquisa-page__usuario-area">' + usuario.especialidade + '</span>' +
            '</span>' +
            '</a>';
    }).join('');
});
