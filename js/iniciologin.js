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
    let painelAtual = document.querySelector('.inicio-login__painel--ativo') || paineis[0];

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
                ? '/assets/imgs/icons/circle.svg'
                : '/assets/imgs/icons/hide_circle.svg';
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
})();
