document.addEventListener('DOMContentLoaded', function () {

    const paineis = document.querySelectorAll('[data-form-panel]');
    const alternadores = document.querySelectorAll('[data-toggle-form]');
    const botoesSenha = document.querySelectorAll('.inicio-login__toggle-senha');
    const cadastroForm = document.querySelector('#cadastro-form');
    const cadastroSenhaInput = document.querySelector('#cadastro-senha');
    const cadastroEmailInput = document.querySelector('#cadastro-email');
    const cadastroConfirmarSenhaInput = document.querySelector('#cadastro-confirmar-senha');
    const cadastroContinuarButton = document.querySelector('#cadastro-continuar');
    const dicasSenha = document.querySelector('#cadastro-dicas-senha');
    const abrirRecuperacao = document.querySelector('#abrir-recuperacao');
    const modalRecuperacao = document.querySelector('#modal-recuperacao');
    const formRecuperacao = document.querySelector('#form-recuperacao-senha');
    const subtituloRecuperacao = document.querySelector('#recuperacao-subtitulo');
    const botaoRecuperacao = document.querySelector('#recuperacao-continuar');
    const feedbackRecuperacao = document.querySelector('#recuperacao-feedback');
    const etapaRecuperacao1 = document.querySelector('[data-rec-etapa="1"]');
    const etapaRecuperacao2 = document.querySelector('[data-rec-etapa="2"]');
    const etapaRecuperacao3 = document.querySelector('[data-rec-etapa="3"]');
    const emailRecuperacaoInput = document.querySelector('#recuperacao-email');
    const codigoRecuperacaoInputs = Array.from(document.querySelectorAll('.inicio-login__codigo-input'));
    const novaSenhaRecuperacaoInput = document.querySelector('#recuperacao-senha');
    const confirmarSenhaRecuperacaoInput = document.querySelector('#recuperacao-confirmar-senha');
    const dicasSenhaRecuperacao = document.querySelector('#recuperacao-dicas-senha');
    const botaoReenviarCodigo = document.querySelector('#reenviar-codigo-btn');
    const timerRecuperacao = document.querySelector('#recuperacao-timer');
    const botoesFecharRecuperacao = document.querySelectorAll('[data-fechar-recuperacao]');
    let painelAtual = document.querySelector('.inicio-login__painel--ativo') || paineis[0];
    let etapaRecuperacaoAtual = 1;
    let intervaloCronometro = null;
    let tempoRestante = 0;

    function mostrarPainel(nomePainel) {
        const proximoPainel = document.querySelector('[data-form-panel="' + nomePainel + '"]');

        if (!proximoPainel || proximoPainel === painelAtual) {
            return;
        }

        painelAtual.hidden = true;
        painelAtual.classList.remove('inicio-login__painel--ativo', 'inicio-login__painel--entrando');

        proximoPainel.hidden = false;
        proximoPainel.classList.remove('inicio-login__painel--entrando');
        void proximoPainel.offsetWidth;
        proximoPainel.classList.add('inicio-login__painel--ativo', 'inicio-login__painel--entrando');

        painelAtual = proximoPainel;
    }

    alternadores.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            mostrarPainel(link.getAttribute('data-toggle-form'));
        });
    });

    botoesSenha.forEach(function (botao) {
        const campo = botao.closest('.inicio-login__campo-senha');
        const input = campo ? campo.querySelector('input') : null;
        const icone = botao.querySelector('img');

        if (!input || !icone) {
            return;
        }

        botao.addEventListener('click', function () {
            const mostrarSenha = input.type === 'password';

            input.type = mostrarSenha ? 'text' : 'password';
            botao.setAttribute('aria-pressed', mostrarSenha ? 'true' : 'false');
            botao.setAttribute('aria-label', mostrarSenha ? 'Ocultar senha' : 'Mostrar senha');
            icone.src = mostrarSenha
                ? 'img/icons/circle.svg'
                : 'img/icons/hide_circle.svg';
        });
    });

    if (cadastroForm && cadastroSenhaInput && cadastroConfirmarSenhaInput && cadastroContinuarButton && dicasSenha) {
        const regraTamanho = dicasSenha.querySelector('[data-regra="tamanho"]');
        const regraMaiusculaMinuscula = dicasSenha.querySelector('[data-regra="maiuscula-minuscula"]');
        const regraNumeroSimbolo = dicasSenha.querySelector('[data-regra="numero-simbolo"]');
        const regraSemEmail = dicasSenha.querySelector('[data-regra="sem-email"]');

        function senhaTemNumeroOuSimbolo(senha) {
            return /[0-9]|[^A-Za-z0-9\s]/.test(senha);
        }

        function validarBotaoCadastro() {
            const campos = cadastroForm.querySelectorAll('input[required]');
            const todosPreenchidos = Array.from(campos).every(function (campo) {
                return campo.value.trim() !== '';
            });
            const senhasIguais = cadastroSenhaInput.value !== '' && cadastroSenhaInput.value === cadastroConfirmarSenhaInput.value;

            cadastroContinuarButton.disabled = !(todosPreenchidos && senhasIguais);
        }

        function validarSenhaCadastro() {
            const senha = cadastroSenhaInput.value || '';
            const email = cadastroEmailInput ? cadastroEmailInput.value.trim().toLowerCase() : '';
            const senhaLower = senha.toLowerCase();
            const semEmail = email === '' || !senhaLower.includes(email);

            regraTamanho.classList.toggle('is-valid', senha.length >= 8);
            regraMaiusculaMinuscula.classList.toggle('is-valid', /[a-z]/.test(senha) && /[A-Z]/.test(senha));
            regraNumeroSimbolo.classList.toggle('is-valid', senhaTemNumeroOuSimbolo(senha));
            regraSemEmail.classList.toggle('is-valid', semEmail);
            validarBotaoCadastro();
        }

        cadastroSenhaInput.addEventListener('focus', function () {
            dicasSenha.hidden = false;
            validarSenhaCadastro();
        });

        cadastroSenhaInput.addEventListener('input', validarSenhaCadastro);
        cadastroConfirmarSenhaInput.addEventListener('input', validarBotaoCadastro);

        if (cadastroEmailInput) {
            cadastroEmailInput.addEventListener('input', validarSenhaCadastro);
        }

        cadastroForm.addEventListener('input', validarBotaoCadastro);

        cadastroSenhaInput.addEventListener('blur', function () {
            setTimeout(function () {
                if (document.activeElement !== cadastroSenhaInput) {
                    dicasSenha.hidden = true;
                }
            }, 0);
        });

        validarBotaoCadastro();
    }

    if (
        abrirRecuperacao &&
        modalRecuperacao &&
        formRecuperacao &&
        subtituloRecuperacao &&
        botaoRecuperacao &&
        feedbackRecuperacao &&
        etapaRecuperacao1 &&
        etapaRecuperacao2 &&
        etapaRecuperacao3 &&
        emailRecuperacaoInput &&
        codigoRecuperacaoInputs.length === 6 &&
        novaSenhaRecuperacaoInput &&
        confirmarSenhaRecuperacaoInput &&
        dicasSenhaRecuperacao
    ) {
        const regraRecuperacaoTamanho = dicasSenhaRecuperacao.querySelector('[data-regra="tamanho"]');
        const regraRecuperacaoMaiusculaMinuscula = dicasSenhaRecuperacao.querySelector('[data-regra="maiuscula-minuscula"]');
        const regraRecuperacaoNumeroSimbolo = dicasSenhaRecuperacao.querySelector('[data-regra="numero-simbolo"]');
        const regraRecuperacaoSemEmail = dicasSenhaRecuperacao.querySelector('[data-regra="sem-email"]');

        function atualizarMensagemRecuperacao(texto, tipo) {
            feedbackRecuperacao.textContent = texto;
            feedbackRecuperacao.classList.remove('inicio-login__mensagem--oculta', 'inicio-login__mensagem--erro', 'inicio-login__mensagem--sucesso');
            feedbackRecuperacao.classList.add(tipo === 'sucesso' ? 'inicio-login__mensagem--sucesso' : 'inicio-login__mensagem--erro');
        }

        function limparMensagemRecuperacao() {
            feedbackRecuperacao.textContent = '';
            feedbackRecuperacao.classList.remove('inicio-login__mensagem--erro', 'inicio-login__mensagem--sucesso');
            feedbackRecuperacao.classList.add('inicio-login__mensagem--oculta');
        }

        function atualizarEstadoBotaoRecuperacao() {
            if (etapaRecuperacaoAtual === 1) {
                botaoRecuperacao.disabled = !emailRecuperacaoInput.value.trim() || !emailRecuperacaoInput.checkValidity();
                return;
            }

            if (etapaRecuperacaoAtual === 2) {
                botaoRecuperacao.disabled = codigoRecuperacaoCompleto().length !== 6;
                return;
            }

            botaoRecuperacao.disabled = !novaSenhaRecuperacaoInput.value.trim() || !confirmarSenhaRecuperacaoInput.value.trim();
        }

        function iniciarCronometroCodigo() {
            tempoRestante = 60;
            botaoReenviarCodigo.disabled = true;
            timerRecuperacao.textContent = 'Reenviar em ' + tempoRestante + 's';

            if (intervaloCronometro) {
                clearInterval(intervaloCronometro);
            }

            intervaloCronometro = setInterval(function () {
                tempoRestante--;

                if (tempoRestante > 0) {
                    timerRecuperacao.textContent = 'Reenviar em ' + tempoRestante + 's';
                } else {
                    clearInterval(intervaloCronometro);
                    botaoReenviarCodigo.disabled = false;
                    timerRecuperacao.textContent = '';
                }
            }, 1000);
        }

        function atualizarEtapaRecuperacao(numeroEtapa) {
            etapaRecuperacaoAtual = numeroEtapa;
            etapaRecuperacao1.hidden = numeroEtapa !== 1;
            etapaRecuperacao2.hidden = numeroEtapa !== 2;
            etapaRecuperacao3.hidden = numeroEtapa !== 3;
            dicasSenhaRecuperacao.hidden = numeroEtapa !== 3;
            limparMensagemRecuperacao();

            if (numeroEtapa === 1) {
                subtituloRecuperacao.textContent = 'Digite o email associado a sua conta para que possamos enviar um codigo de recuperacao.';
                botaoRecuperacao.textContent = 'Continuar';
                atualizarEstadoBotaoRecuperacao();
                emailRecuperacaoInput.focus();
                return;
            }

            if (numeroEtapa === 2) {
                subtituloRecuperacao.textContent = 'Digite o codigo de 6 digitos que enviamos para seu email. Verifique a pasta de spam se nao encontrar a mensagem.';
                botaoRecuperacao.textContent = 'Continuar';
                atualizarEstadoBotaoRecuperacao();
                iniciarCronometroCodigo();
                codigoRecuperacaoInputs[0].focus();
                return;
            }

            subtituloRecuperacao.textContent = 'Crie uma nova senha com caracteres maiusculos, minusculos, numeros e simbolos para sua seguranca.';
            botaoRecuperacao.textContent = 'Redefinir senha';
            atualizarEstadoBotaoRecuperacao();
            novaSenhaRecuperacaoInput.focus();
        }

        function senhaRecuperacaoTemNumeroOuSimbolo(senha) {
            return /[0-9]|[^A-Za-z0-9\s]/.test(senha);
        }

        function validarRegrasSenhaRecuperacao() {
            var senha = novaSenhaRecuperacaoInput.value || '';
            var email = emailRecuperacaoInput ? emailRecuperacaoInput.value.trim().toLowerCase() : '';
            var senhaLower = senha.toLowerCase();
            var semEmail = email === '' || !senhaLower.includes(email);

            var regraTamanho = senha.length >= 8;
            var regraMaiusculaMinuscula = /[a-z]/.test(senha) && /[A-Z]/.test(senha);
            var regraNumeroSimbolo = senhaRecuperacaoTemNumeroOuSimbolo(senha);

            regraRecuperacaoTamanho.classList.toggle('is-valid', regraTamanho);
            regraRecuperacaoMaiusculaMinuscula.classList.toggle('is-valid', regraMaiusculaMinuscula);
            regraRecuperacaoNumeroSimbolo.classList.toggle('is-valid', regraNumeroSimbolo);
            regraRecuperacaoSemEmail.classList.toggle('is-valid', semEmail);

            return regraTamanho && regraMaiusculaMinuscula && regraNumeroSimbolo && semEmail;
        }

        function abrirModalRecuperacao() {
            modalRecuperacao.hidden = false;
            document.body.style.overflow = 'hidden';
            atualizarEtapaRecuperacao(1);
        }

        function fecharModalRecuperacao() {
            modalRecuperacao.hidden = true;
            document.body.style.overflow = '';
            formRecuperacao.reset();
            if (intervaloCronometro) {
                clearInterval(intervaloCronometro);
            }
            timerRecuperacao.textContent = '';
            atualizarEtapaRecuperacao(1);
        }

        function codigoRecuperacaoCompleto() {
            return codigoRecuperacaoInputs.map(function (input) {
                return input.value;
            }).join('');
        }

        codigoRecuperacaoInputs.forEach(function (input, index) {
            input.addEventListener('input', function () {
                var somenteDigito = input.value.replace(/\D/g, '').slice(0, 1);
                input.value = somenteDigito;

                if (somenteDigito && index < codigoRecuperacaoInputs.length - 1) {
                    codigoRecuperacaoInputs[index + 1].focus();
                }

                atualizarEstadoBotaoRecuperacao();
            });

            input.addEventListener('keydown', function (event) {
                if (event.key === 'Backspace' && input.value === '' && index > 0) {
                    codigoRecuperacaoInputs[index - 1].focus();
                }

                if (event.key === 'Backspace') {
                    setTimeout(atualizarEstadoBotaoRecuperacao, 0);
                }
            });

            input.addEventListener('paste', function (event) {
                var textoColado = (event.clipboardData || window.clipboardData).getData('text');
                var digitos = textoColado.replace(/\D/g, '').slice(0, 6);

                if (!digitos) {
                    return;
                }

                event.preventDefault();

                codigoRecuperacaoInputs.forEach(function (campo, indice) {
                    campo.value = digitos[indice] || '';
                });

                var indiceFoco = Math.min(digitos.length, 6) - 1;

                if (indiceFoco >= 0) {
                    codigoRecuperacaoInputs[indiceFoco].focus();
                }

                atualizarEstadoBotaoRecuperacao();
            });
        });

        novaSenhaRecuperacaoInput.addEventListener('focus', function () {
            dicasSenhaRecuperacao.hidden = false;
            validarRegrasSenhaRecuperacao();
        });

        novaSenhaRecuperacaoInput.addEventListener('input', function () {
            validarRegrasSenhaRecuperacao();
            atualizarEstadoBotaoRecuperacao();
        });

        confirmarSenhaRecuperacaoInput.addEventListener('input', atualizarEstadoBotaoRecuperacao);

        emailRecuperacaoInput.addEventListener('input', function () {
            if (etapaRecuperacaoAtual === 3) {
                validarRegrasSenhaRecuperacao();
            }

            atualizarEstadoBotaoRecuperacao();
        });

        novaSenhaRecuperacaoInput.addEventListener('blur', function () {
            setTimeout(function () {
                if (document.activeElement !== novaSenhaRecuperacaoInput) {
                    dicasSenhaRecuperacao.hidden = true;
                }
            }, 0);
        });

        abrirRecuperacao.addEventListener('click', function (event) {
            event.preventDefault();
            abrirModalRecuperacao();
        });

        botoesFecharRecuperacao.forEach(function (botao) {
            botao.addEventListener('click', function () {
                fecharModalRecuperacao();
            });
        });

        botaoReenviarCodigo.addEventListener('click', function (event) {
            event.preventDefault();
            atualizarMensagemRecuperacao('Codigo reenviado com sucesso! Confira seu email.', 'sucesso');
            iniciarCronometroCodigo();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !modalRecuperacao.hidden) {
                fecharModalRecuperacao();
            }
        });

        formRecuperacao.addEventListener('submit', function (event) {
            event.preventDefault();
            limparMensagemRecuperacao();

            if (etapaRecuperacaoAtual === 1) {
                if (!emailRecuperacaoInput.value.trim() || !emailRecuperacaoInput.checkValidity()) {
                    atualizarMensagemRecuperacao('Digite um email valido para continuar.', 'erro');
                    return;
                }

                atualizarEtapaRecuperacao(2);
                atualizarMensagemRecuperacao('Codigo enviado com sucesso! Verifique seu email nos proximos minutos.', 'sucesso');
                return;
            }

            if (etapaRecuperacaoAtual === 2) {
                if (codigoRecuperacaoCompleto().length !== 6) {
                    atualizarMensagemRecuperacao('Digite os 6 numeros do codigo recebido no email.', 'erro');
                    return;
                }

                atualizarEtapaRecuperacao(3);
                return;
            }

            if (!validarRegrasSenhaRecuperacao()) {
                dicasSenhaRecuperacao.hidden = false;
                atualizarMensagemRecuperacao('Sua senha nao atende todos os requisitos de seguranca. Complete todos os itens listados.', 'erro');
                return;
            }

            if (novaSenhaRecuperacaoInput.value !== confirmarSenhaRecuperacaoInput.value) {
                atualizarMensagemRecuperacao('As senhas digitadas nao coincidem. Digite a mesma senha nos dois campos.', 'erro');
                return;
            }

            atualizarMensagemRecuperacao('Sua senha foi redefinida com sucesso! Vous sera redirecione para fazer login com sua nova senha.', 'sucesso');

            if (emailInput) {
                emailInput.value = emailRecuperacaoInput.value.trim();
            }

            setTimeout(function () {
                fecharModalRecuperacao();
            }, 900);
        });

        atualizarEstadoBotaoRecuperacao();
    }

})();
