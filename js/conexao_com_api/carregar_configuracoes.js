// js/conexao_com_api/carregar_configuracoes.js

document.addEventListener('DOMContentLoaded', function () {
    const fotoPerfil = document.getElementById('configuracoesPerfilFoto');
    const nomePerfil = document.getElementById('configuracoesPerfilNome');
    const localizacaoPerfil = document.getElementById('configuracoesPerfilLocalizacao');
    const salvarInformacoesButton = document.getElementById('configuracoesSalvarInformacoes');
    const informacoesFeedback = document.getElementById('configuracoesInformacoesFeedback');
    const notificacoesLista = document.getElementById('configuracoesNotificacoesLista');
    const emailInput = document.getElementById('configuracoesEmail');
    const senhaAtualInput = document.getElementById('configuracoesSenhaAtual');
    const novaSenhaInput = document.getElementById('configuracoesNovaSenha');
    const confirmarContaButton = document.getElementById('configuracoesConfirmarConta');
    const contaFeedback = document.getElementById('configuracoesContaFeedback');
    
    let usuarioAtual = null; // Dados básicos da sessão
    let perfilAtual = null;  // Dados detalhados do perfil (PF ou EMPRESA)

    function mostrarFeedbackConta(mensagem, ehErro) {
        if (!contaFeedback) return;
        contaFeedback.textContent = mensagem;
        contaFeedback.style.color = ehErro ? '#b91c1c' : '#166534';
    }

    async function obterNotificationManager() {
        if (window.NotificationManager) return window.NotificationManager;
        const modulo = await import('../NotificationManager.js');
        window.NotificationManager = modulo.default;
        return modulo.default;
    }

    async function confirmarAlteracao(titulo, mensagem) {
        const manager = await obterNotificationManager();
        return new Promise(function (resolve) {
            manager.modal(mensagem, {
                title: titulo,
                closeOnEscape: false,
                closeOnOverlay: false,
                buttons: [
                    {
                        text: 'Cancelar',
                        variant: 'secondary',
                        onClick: function () {
                            resolve(false);
                        }
                    },
                    {
                        text: 'Confirmar',
                        onClick: function () {
                            resolve(true);
                        }
                    }
                ]
            });
        });
    }

    async function solicitarCodigoEmail() {
        const manager = await obterNotificationManager();
        return new Promise(function (resolve) {
            manager.modal('Digite o código enviado para o novo e-mail para concluir a alteração.', {
                title: 'Confirmar novo e-mail',
                closeOnEscape: false,
                closeOnOverlay: false,
                input: {
                    label: 'Código de confirmação',
                    type: 'text',
                    inputMode: 'numeric',
                    autocomplete: 'one-time-code',
                    maxLength: 6
                },
                buttons: [
                    {
                        text: 'Cancelar',
                        variant: 'secondary',
                        onClick: function () {
                            resolve('');
                        }
                    },
                    {
                        text: 'Confirmar',
                        onClick: function (codigo) {
                            resolve(String(codigo || '').trim());
                        }
                    }
                ]
            });
        });
    }

    async function lerResposta(response) {
        try {
            return await response.json();
        } catch (error) {
            return {};
        }
    }

    async function alterarEmail() {
        const novoEmail = emailInput ? emailInput.value.trim() : '';
        const senhaAtual = senhaAtualInput ? senhaAtualInput.value : '';

        if (!novoEmail || !senhaAtual) {
            mostrarFeedbackConta('Informe o novo e-mail e a senha atual.', true);
            return false;
        }

        const confirmado = await confirmarAlteracao(
            'Confirmar alteração de e-mail',
            'Deseja solicitar a alteração do seu e-mail? Um código de confirmação será enviado para o novo endereço.'
        );
        if (!confirmado) return false;

        confirmarContaButton.disabled = true;
        mostrarFeedbackConta('Enviando código de confirmação...', false);

        try {
            const response = await fetch(ip_api + '/auth/email', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    novo_email: novoEmail,
                    senha_atual: senhaAtual
                })
            });
            const res = await lerResposta(response);

            if (!response.ok || !res.success) {
                throw new Error(res.message || 'Não foi possível solicitar a alteração do e-mail.');
            }

            const codigo = await solicitarCodigoEmail();
            if (!codigo || !codigo.trim()) {
                mostrarFeedbackConta('A alteração foi solicitada, mas o código não foi informado.', true);
                return false;
            }

            const confirmacaoResponse = await fetch(ip_api + '/auth/email/confirmar', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo: codigo.trim() })
            });
            const confirmacao = await lerResposta(confirmacaoResponse);

            if (!confirmacaoResponse.ok || !confirmacao.success) {
                throw new Error(confirmacao.message || 'Não foi possível confirmar o novo e-mail.');
            }

            if (usuarioAtual) usuarioAtual.email = novoEmail;
            mostrarFeedbackConta(confirmacao.message || 'E-mail alterado com sucesso.', false);
            if (!novaSenhaInput || !novaSenhaInput.value) {
                senhaAtualInput.value = '';
            }
            await carregarUsuarioSidebar();
            return true;
        } catch (error) {
            console.error('Erro ao alterar e-mail:', error);
            mostrarFeedbackConta(error.message || 'Falha na conexão com o servidor.', true);
            return false;
        } finally {
            confirmarContaButton.disabled = false;
        }
    }

    async function alterarSenha() {
        const senhaAtual = senhaAtualInput ? senhaAtualInput.value : '';
        const novaSenha = novaSenhaInput ? novaSenhaInput.value : '';

        if (!senhaAtual || !novaSenha) {
            mostrarFeedbackConta('Informe a senha atual e a nova senha.', true);
            return false;
        }

        const confirmado = await confirmarAlteracao(
            'Confirmar alteração de senha',
            'Deseja alterar sua senha? Você poderá precisar entrar novamente em outros dispositivos.'
        );
        if (!confirmado) return false;

        confirmarContaButton.disabled = true;
        mostrarFeedbackConta('Alterando senha...', false);

        try {
            const response = await fetch(ip_api + '/auth/password', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senha_atual: senhaAtual,
                    nova_senha: novaSenha
                })
            });
            const res = await lerResposta(response);

            if (!response.ok || !res.success) {
                throw new Error(res.message || 'Não foi possível alterar a senha.');
            }

            mostrarFeedbackConta(res.message || 'Senha alterada com sucesso.', false);
            senhaAtualInput.value = '';
            novaSenhaInput.value = '';
            return true;
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            mostrarFeedbackConta(error.message || 'Falha na conexão com o servidor.', true);
            return false;
        } finally {
            confirmarContaButton.disabled = false;
        }
    }

    async function alterarCredenciais() {
        mostrarFeedbackConta('', false);
        const novoEmail = emailInput ? emailInput.value.trim() : '';
        const senhaAtual = senhaAtualInput ? senhaAtualInput.value : '';
        const novaSenha = novaSenhaInput ? novaSenhaInput.value : '';

        const emailSeraAlterado = novoEmail && novoEmail !== String(usuarioAtual && usuarioAtual.email || '').trim();

        if (emailSeraAlterado) {
            const emailAlterado = await alterarEmail();
            if (!emailAlterado) return;
        }

        if (senhaAtual && novaSenha) {
            await alterarSenha();
        } else if (!emailSeraAlterado) {
            mostrarFeedbackConta('Informe um novo e-mail ou preencha os campos de senha.', true);
        }
    }

    async function inicializar() {
        const usuario = window.seekSessaoAutenticada
            ? await window.seekSessaoAutenticada
            : null;
        if (!usuario) return;

        usuarioAtual = usuario;
        aplicarDadosNoAside(usuarioAtual);
        if (emailInput) emailInput.value = usuarioAtual.email || '';
        await carregarDadosPerfil();
        await carregarPreferenciasNotificacoes();
    }

    // 1. Carrega dados básicos para a sidebar (mantido como estava)
    async function carregarUsuarioSidebar() {
        try {
            const response = await fetch(ip_api + '/auth/me', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }

            const res = await lerResposta(response);
            if (response.ok && res.success) {
                usuarioAtual = res.data.usuario;
                aplicarDadosNoAside(usuarioAtual);
            }
        } catch (error) {
            console.error('Erro ao carregar dados básicos do usuário:', error);
        }
    }

    // 2. NOVA FUNÇÃO: Busca os dados detalhados para preencher o formulário
    async function carregarDadosPerfil() {
        try {
            const response = await fetch(ip_api + '/usuarios/perfil', {
                method: 'GET',
                credentials: 'include'
            });

            const res = await lerResposta(response);
            
            if (response.ok && res.success) {
                perfilAtual = res.data;
                renderizarFormularioInformacoes(perfilAtual);
            } else {
                mostrarFeedback('Não foi possível carregar as informações do perfil.', true);
            }
        } catch (error) {
            console.error('Erro ao carregar perfil detalhado:', error);
            mostrarFeedback('Falha de conexão ao carregar perfil.', true);
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

    function escapeHtml(valor) {
        return String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // 3. Modificado para ler a estrutura de /usuarios/perfil
    function renderizarFormularioInformacoes(dadosPerfil) {
        const panelForm = document.querySelector('.minhas-informacoes .panel-form');
        if (!panelForm) return;

        const inputsDeArquivo = Array.from(panelForm.querySelectorAll('.field-group--file'));
        panelForm.innerHTML = '';
        inputsDeArquivo.forEach(el => panelForm.appendChild(el));

        if (dadosPerfil.tipo_usuario === 'PF' && dadosPerfil.perfil_pessoa_fisica) {
            const pf = dadosPerfil.perfil_pessoa_fisica;
            criarCampoTexto(panelForm, 'nome_usuario', 'Nome de usuario', 'Altera seu nome de usuario cadastrado', pf.nome_usuario, 'text', 'placeholder_do_usuario_atual_em_cinza');
            criarCampoTexto(panelForm, 'telefone', 'Telefone', 'Altera seu telefone de contato', pf.telefone, 'tel', 'placeholder_do_telefone_atual_em_cinza');
            criarCampoTexto(panelForm, 'cidade', 'Cidade', 'Altera sua cidade', pf.cidade, 'text', 'placeholder_da_cidade_atual_em_cinza');
            criarCampoTexto(panelForm, 'estado', 'Estado', 'Altera seu estado', pf.estado, 'text', 'placeholder_do_estado_atual_em_cinza');
            criarCampoTextarea(panelForm, 'sobre', 'Biografia', 'Modifica sua biografia', pf.sobre, 'Uma pequena descricao sobre voce, o que voce faz e com o que voce trabalha, sua jornada academica, etc...');
            criarCampoTexto(panelForm, 'linkedin', 'LinkedIn URL', 'Altera o link do seu LinkedIn', pf.linkedin, 'url', 'placeholder_linkedin_atual_em_cinza');
            criarCampoTexto(panelForm, 'github', 'GitHub URL', 'Altera o link do seu GitHub', pf.github, 'url', 'placeholder_github_atual_em_cinza');
            criarCampoTexto(panelForm, 'curriculo', 'Link do Curriculo', 'Altera o link do seu curriculo', pf.curriculo, 'url', 'placeholder_curriculo_atual_em_cinza');
        } else if (dadosPerfil.tipo_usuario === 'EMPRESA' && dadosPerfil.perfil_empresa) {
            const emp = dadosPerfil.perfil_empresa;
            criarCampoTexto(panelForm, 'razao_social', 'Razao Social', 'Altera a razao social da empresa', emp.razao_social, 'text', 'placeholder_da_razao_social_atual_em_cinza');
            criarCampoTexto(panelForm, 'nome_fantasia', 'Nome Fantasia', 'Altera o nome publico da empresa', emp.nome_fantasia, 'text', 'placeholder_do_nome_fantasia_atual_em_cinza');
            criarCampoTexto(panelForm, 'telefone_comercial', 'Telefone Comercial', 'Altera o telefone comercial', emp.telefone_comercial, 'tel', 'placeholder_do_telefone_atual_em_cinza');
            criarCampoTexto(panelForm, 'categoria_negocio', 'Categoria de Negocio', 'Altera a categoria de negocio', emp.categoria_negocio, 'text', 'placeholder_da_categoria_atual_em_cinza');
            criarCampoTexto(panelForm, 'numero_funcionarios', 'Numero de Funcionarios', 'Altera o tamanho da equipe', emp.numero_funcionarios, 'number', 'placeholder_numero_funcionarios_atual_em_cinza');
            criarCampoTexto(panelForm, 'endereco_completo', 'Endereco Completo', 'Altera o endereco da empresa', emp.endereco_completo, 'text', 'placeholder_do_endereco_atual_em_cinza');
            criarCampoTextarea(panelForm, 'descricao', 'Biografia', 'Modifica a descricao da empresa', emp.descricao, 'Uma pequena descricao sobre a empresa, o que faz e com o que trabalha...');
            criarCampoTexto(panelForm, 'site', 'Site', 'Altera o site da empresa', emp.site, 'url', 'placeholder_site_atual_em_cinza');
        }
    }

    function criarCampoTexto(container, id, label, nota, valor, type = 'text', placeholder = '') {
        const div = document.createElement('div');
        div.className = 'field-group field-group--stack';
        const campoId = escapeHtml(id);
        const campoType = escapeHtml(type);
        const campoLabel = escapeHtml(label);
        const campoNota = escapeHtml(nota);
        const campoPlaceholder = escapeHtml(placeholder || label);
        const campoValor = escapeHtml(valor);
        div.innerHTML = `
            <span>${campoLabel}</span>
            <p class="field-note">${campoNota}</p>
            <input id="input_${campoId}" type="${campoType}" placeholder="${campoPlaceholder}" value="${campoValor}">
        `;
        container.appendChild(div);
    }

    function criarCampoTextarea(container, id, label, nota, valor, placeholder = '') {
        const div = document.createElement('div');
        div.className = 'field-group field-group--stack';
        const campoId = escapeHtml(id);
        const campoLabel = escapeHtml(label);
        const campoNota = escapeHtml(nota);
        const campoPlaceholder = escapeHtml(placeholder || label);
        const campoValor = escapeHtml(valor);
        div.innerHTML = `
            <span>${campoLabel}</span>
            <p class="field-note">${campoNota}</p>
            <textarea id="input_${campoId}" rows="4" placeholder="${campoPlaceholder}">${campoValor}</textarea>
        `;
        container.appendChild(div);
    }

    function mostrarFeedback(mensagem, ehErro) {
        if (!informacoesFeedback) return;
        informacoesFeedback.textContent = mensagem;
        informacoesFeedback.style.color = ehErro ? '#b91c1c' : '#166534'; 
    }

    async function salvarInformacoes() {
        if (!perfilAtual) return;
        
        salvarInformacoesButton.disabled = true;
        salvarInformacoesButton.textContent = 'Salvando...';
        mostrarFeedback('', false);

        try {
            // Uploads de imagem (mantidos)
            const fotoInput = document.getElementById('configuracoesFotoInput');
            if (fotoInput && fotoInput.files[0]) {
                const fdFoto = new FormData();
                fdFoto.append('foto', fotoInput.files[0]);
                const respostaFoto = await fetch(ip_api + '/usuarios/foto-perfil', {
                    method: 'PUT',
                    credentials: 'include',
                    body: fdFoto
                });
                const resultadoFoto = await lerResposta(respostaFoto);
                if (!respostaFoto.ok || resultadoFoto.success === false) {
                    throw new Error(resultadoFoto.message || 'Não foi possível atualizar a foto de perfil.');
                }
            }

            const bannerInput = document.getElementById('configuracoesBannerInput');
            if (bannerInput && bannerInput.files[0]) {
                const fdBanner = new FormData();
                fdBanner.append('banner', bannerInput.files[0]);
                const respostaBanner = await fetch(ip_api + '/usuarios/banner-perfil', {
                    method: 'PUT',
                    credentials: 'include',
                    body: fdBanner
                });
                const resultadoBanner = await lerResposta(respostaBanner);
                if (!respostaBanner.ok || resultadoBanner.success === false) {
                    throw new Error(resultadoBanner.message || 'Não foi possível atualizar o banner.');
                }
            }

            let corpoRequisicao = {};
            let endpoint = '';

            if (perfilAtual.tipo_usuario === 'PF') {
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

            const res = await lerResposta(response);

            if (response.ok) {
                mostrarFeedback('Configurações salvas com sucesso!', false);
                if(fotoInput) fotoInput.value = '';
                if(bannerInput) bannerInput.value = '';
                
                // Recarrega tudo para manter o front sincronizado
                await carregarUsuarioSidebar(); 
                await carregarDadosPerfil();
            } else {
                mostrarFeedback(res.message || 'Erro ao salvar as configurações.', true);
            }

        } catch (error) {
            console.error(error);
            mostrarFeedback(error.message || 'Falha na conexão com o servidor.', true);
        } finally {
            salvarInformacoesButton.disabled = false;
            salvarInformacoesButton.textContent = 'Salvar';
        }
    }

    if (salvarInformacoesButton) {
        salvarInformacoesButton.addEventListener('click', salvarInformacoes);
    }

    if (confirmarContaButton) {
        confirmarContaButton.addEventListener('click', alterarCredenciais);
    }

    const dicNotificacoes = {
        email_like_post: { titulo: 'Nova curtidas', descricao: 'Ativa ou desativa as notificacoes de novas curtidas.' },
        email_novo_seguidor: { titulo: 'Novos seguidores', descricao: 'Ativa ou desativa as notificacoes de novos seguidores.' },
        email_login: { titulo: 'Ligar ou desligar as notificacoes', descricao: 'Tira completamente as notificacoes.' },
        email_comentarios: { titulo: 'Comentarios', descricao: 'Ativa ou desativa as notificacoes de comentarios.' }
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
            const titulo = escapeHtml(infoTextos.titulo);
            const descricao = escapeHtml(infoTextos.descricao);
            const chaveSegura = escapeHtml(chave);
            
            const row = document.createElement('div');
            row.className = 'panel-row panel-row--split';
            row.innerHTML = `
                <div>
                    <strong>${titulo}</strong>
                    <span>${descricao}</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" data-chave="${chaveSegura}" ${valor === true ? 'checked' : ''}>
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
            (window.seekNotificar || window.alert)('Não foi possível alterar a configuração. Tente novamente.');
        } finally {
            input.disabled = false;
        }
    }

    inicializar();
});
