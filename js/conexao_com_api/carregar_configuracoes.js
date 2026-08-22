// js/conexao_com_api/carregar_configuracoes.js

document.addEventListener('DOMContentLoaded', function () {
    const fotoPerfil = document.getElementById('configuracoesPerfilFoto');
    const nomePerfil = document.getElementById('configuracoesPerfilNome');
    const localizacaoPerfil = document.getElementById('configuracoesPerfilLocalizacao');
    const salvarInformacoesButton = document.getElementById('configuracoesSalvarInformacoes');
    const informacoesFeedback = document.getElementById('configuracoesInformacoesFeedback');
    const notificacoesLista = document.getElementById('configuracoesNotificacoesLista');
    
    let usuarioAtual = null;

    async function inicializar() {
        await carregarUsuario();
        await carregarPreferenciasNotificacoes();
    }

    async function carregarUsuario() {
        try {
            const response = await fetch(ip_api + '/auth/me', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }

            const res = await response.json();
            if (response.ok && res.success) {
                usuarioAtual = res.data.usuario;
                aplicarDadosNoAside(usuarioAtual);
                renderizarFormularioInformacoes(usuarioAtual);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }

    function aplicarDadosNoAside(usuario) {
        if (fotoPerfil) fotoPerfil.src = usuario.foto_perfil || 'img/userProfilepreto.png';
        if (nomePerfil) nomePerfil.textContent = usuario.nome || usuario.nome_fantasia || 'Usuário';
        
        if (localizacaoPerfil) {
            if (usuario.tipo_usuario === 'PF' && usuario.cidade) {
                localizacaoPerfil.textContent = `${usuario.cidade} - ${usuario.estado || ''}`;
            } else if (usuario.tipo_usuario === 'EMPRESA' && usuario.endereco_completo) {
                localizacaoPerfil.textContent = usuario.endereco_completo;
            } else {
                localizacaoPerfil.textContent = 'Localização não informada';
            }
        }
    }

    function renderizarFormularioInformacoes(usuario) {
        const panelForm = document.querySelector('.minhas-informações .panel-form');
        if (!panelForm) return;

        const inputsDeArquivo = Array.from(panelForm.querySelectorAll('.field-group--file'));
        panelForm.innerHTML = '';
        inputsDeArquivo.forEach(el => panelForm.appendChild(el));

        if (usuario.tipo_usuario === 'PF') {
            criarCampoTexto(panelForm, 'nome_usuario', 'Nome público', usuario.nome_usuario || usuario.nome);
            criarCampoTexto(panelForm, 'telefone', 'Telefone', usuario.telefone);
            criarCampoTexto(panelForm, 'cidade', 'Cidade', usuario.cidade);
            criarCampoTexto(panelForm, 'estado', 'Estado', usuario.estado);
            criarCampoTextarea(panelForm, 'sobre', 'Sobre mim', usuario.sobre);
            criarCampoTexto(panelForm, 'linkedin', 'LinkedIn URL', usuario.linkedin);
            criarCampoTexto(panelForm, 'github', 'GitHub URL', usuario.github);
            criarCampoTexto(panelForm, 'curriculo', 'Link do Currículo', usuario.curriculo);
        } else if (usuario.tipo_usuario === 'EMPRESA') {
            criarCampoTexto(panelForm, 'razao_social', 'Razão Social', usuario.razao_social);
            criarCampoTexto(panelForm, 'nome_fantasia', 'Nome Fantasia', usuario.nome_fantasia || usuario.nome);
            criarCampoTexto(panelForm, 'telefone_comercial', 'Telefone Comercial', usuario.telefone_comercial);
            criarCampoTexto(panelForm, 'categoria_negocio', 'Categoria de Negócio', usuario.categoria_negocio);
            criarCampoTexto(panelForm, 'numero_funcionarios', 'Número de Funcionários', usuario.numero_funcionarios, 'number');
            criarCampoTexto(panelForm, 'endereco_completo', 'Endereço Completo', usuario.endereco_completo);
            criarCampoTextarea(panelForm, 'descricao', 'Descrição da Empresa', usuario.descricao);
            criarCampoTexto(panelForm, 'site', 'Site', usuario.site);
        }
    }

    function criarCampoTexto(container, id, label, valor, type = 'text') {
        const div = document.createElement('div');
        div.className = 'field-group field-group--stack';
        div.innerHTML = `
            <span>${label}</span>
            <input id="input_${id}" type="${type}" placeholder="${label}" value="${valor || ''}">
        `;
        container.appendChild(div);
    }

    function criarCampoTextarea(container, id, label, valor) {
        const div = document.createElement('div');
        div.className = 'field-group field-group--stack';
        div.innerHTML = `
            <span>${label}</span>
            <textarea id="input_${id}" rows="4" placeholder="${label}">${valor || ''}</textarea>
        `;
        container.appendChild(div);
    }

    function mostrarFeedback(mensagem, ehErro) {
        if (!informacoesFeedback) return;
        informacoesFeedback.textContent = mensagem;
        informacoesFeedback.style.color = ehErro ? '#b91c1c' : '#166534'; 
    }

    async function salvarInformacoes() {
        if (!usuarioAtual) return;
        
        salvarInformacoesButton.disabled = true;
        salvarInformacoesButton.textContent = 'Salvando...';
        mostrarFeedback('', false);

        try {
            const fotoInput = document.getElementById('configuracoesFotoInput');
            if (fotoInput && fotoInput.files[0]) {
                const fdFoto = new FormData();
                fdFoto.append('foto', fotoInput.files[0]);
                await fetch(ip_api + '/usuarios/foto-perfil', {
                    method: 'PUT',
                    credentials: 'include',
                    body: fdFoto
                });
            }

            const bannerInput = document.getElementById('configuracoesBannerInput');
            if (bannerInput && bannerInput.files[0]) {
                const fdBanner = new FormData();
                fdBanner.append('banner', bannerInput.files[0]);
                await fetch(ip_api + '/usuarios/banner-perfil', {
                    method: 'PUT',
                    credentials: 'include',
                    body: fdBanner
                });
            }

            let corpoRequisicao = {};
            let endpoint = '';

            if (usuarioAtual.tipo_usuario === 'PF') {
                endpoint = '/usuarios/perfil-pessoa-física';
                corpoRequisicao = {
                    nome_usuario: document.getElementById('input_nome_usuario')?.value,
                    telefone: document.getElementById('input_telefone')?.value,
                    cidade: document.getElementById('input_cidade')?.value,
                    estado: document.getElementById('input_estado')?.value,
                    sobre: document.getElementById('input_sobre')?.value,
                    linkedin: document.getElementById('input_linkedin')?.value,
                    github: document.getElementById('input_github')?.value,
                    curriculo: document.getElementById('input_curriculo')?.value
                };
            } else {
                endpoint = '/usuarios/perfil-empresa';
                const inputNumFunc = document.getElementById('input_numero_funcionarios')?.value;
                corpoRequisicao = {
                    razao_social: document.getElementById('input_razao_social')?.value,
                    nome_fantasia: document.getElementById('input_nome_fantasia')?.value,
                    telefone_comercial: document.getElementById('input_telefone_comercial')?.value,
                    categoria_negocio: document.getElementById('input_categoria_negocio')?.value,
                    numero_funcionarios: inputNumFunc ? parseInt(inputNumFunc, 10) : null,
                    endereco_completo: document.getElementById('input_endereco_completo')?.value,
                    descricao: document.getElementById('input_descricao')?.value,
                    site: document.getElementById('input_site')?.value
                };
            }

            const response = await fetch(ip_api + endpoint, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corpoRequisicao)
            });

            const res = await response.json();

            if (response.ok) {
                mostrarFeedback('Configurações salvas com sucesso!', false);
                if(fotoInput) fotoInput.value = '';
                if(bannerInput) bannerInput.value = '';
                await carregarUsuario(); 
            } else {
                mostrarFeedback(res.message || 'Erro ao salvar as configurações.', true);
            }

        } catch (error) {
            console.error(error);
            mostrarFeedback('Falha na conexão com o servidor.', true);
        } finally {
            salvarInformacoesButton.disabled = false;
            salvarInformacoesButton.textContent = 'Salvar';
        }
    }

    if (salvarInformacoesButton) {
        salvarInformacoesButton.addEventListener('click', salvarInformacoes);
    }

    const dicNotificacoes = {
        email_like_post: { titulo: 'Curtidas', descricao: 'Avisos quando alguém curtir seus posts.' },
        email_novo_seguidor: { titulo: 'Seguidores', descricao: 'Avisos quando alguém começar a seguir você.' },
        email_login: { titulo: 'Login', descricao: 'Avisos sobre acessos e atividades na sua conta.' },
        email_comentarios: { titulo: 'Comentários', descricao: 'Avisos de comentários nos seus posts.' }
    };

    async function carregarPreferenciasNotificacoes() {
        if (!notificacoesLista) return;

        try {
            const response = await fetch(ip_api + '/preferencias-notificacoes', {
                method: 'GET',
                credentials: 'include'
            });

            const res = await response.json();
            if (response.ok && res.success && res.data) {
                renderizarListaNotificacoes(res.data);
            } else {
                notificacoesLista.innerHTML = '<p class="field-note">Não foi possível carregar as preferências.</p>';
            }
        } catch (error) {
            notificacoesLista.innerHTML = '<p class="field-note">Erro de conexão ao carregar preferências.</p>';
        }
    }

    function renderizarListaNotificacoes(preferencias) {
        notificacoesLista.innerHTML = '';
        
        for (const [chave, valor] of Object.entries(preferencias)) {
            const infoTextos = dicNotificacoes[chave] || { titulo: chave, descricao: 'Ative ou desative esta notificação.' };
            
            const row = document.createElement('div');
            row.className = 'panel-row panel-row--split';
            row.innerHTML = `
                <div>
                    <strong>${infoTextos.titulo}</strong>
                    <span>${infoTextos.descricao}</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" data-chave="${chave}" ${valor === true ? 'checked' : ''}>
                    <span></span>
                </label>
            `;
            notificacoesLista.appendChild(row);
        }

        notificacoesLista.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', alterarPreferenciaIndividual);
        });
    }

    async function alterarPreferenciaIndividual(event) {
        const input = event.target;
        const chave = input.dataset.chave;
        const novoValor = input.checked;
        
        input.disabled = true;

        try {
            const corpoRequisicao = {
                preferencias: {}
            };
            corpoRequisicao.preferencias[chave] = novoValor;

            const response = await fetch(ip_api + '/preferencias-notificacoes', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corpoRequisicao)
            });

            const res = await response.json();

            if (!response.ok || !res.success) {
                throw new Error(res.message || 'Erro ao atualizar preferência');
            }
        } catch (error) {
            console.error('Erro ao atualizar notificação:', error);
            input.checked = !novoValor;
            alert('Não foi possível alterar a configuração. Tente novamente.');
        } finally {
            input.disabled = false;
        }
    }

    inicializar();
});