// Seleciona o elemento body pelo id 'todo' e adiciona/gerencia a classe 'modo-escuro'
(function () {
	const body = document.getElementById('todo');

	function enableModoEscuro() {
		if (!body) return;
		body.classList.add('modo-escuro');
		try { localStorage.setItem('modoEscuro', '1'); } catch (e) {}
	}

	function disableModoEscuro() {
		if (!body) return;
		body.classList.remove('modo-escuro');
		try { localStorage.removeItem('modoEscuro'); } catch (e) {}
	}

	function toggleModoEscuro() {
		if (!body) return;
		body.classList.toggle('modo-escuro');
		try {
			if (body.classList.contains('modo-escuro')) localStorage.setItem('modoEscuro', '1');
			else localStorage.removeItem('modoEscuro');
		} catch (e) {}
	}

	// Inicializa a partir da preferência salva
	try {
		const pref = localStorage.getItem('modoEscuro');
		if (pref === '1' && body) body.classList.add('modo-escuro');
	} catch (e) {}

	// Expõe funções para uso em outros scripts ou botões
	window.modoEscuro = {
		enable: enableModoEscuro,
		disable: disableModoEscuro,
		toggle: toggleModoEscuro
	};

	if (!body) console.warn('Elemento com id "todo" não encontrado.');
})();
