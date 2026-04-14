// variável global
var ip_api = "http://192.168.1.16:4500";

function getStorageJSON(chave) {
	try {
		var raw = localStorage.getItem(chave);
		return raw ? JSON.parse(raw) : null;
	} catch (error) {
		return null;
	}
}

function getUsuarioLogado() {
	return getStorageJSON('usuarioLogado');
}

function setUsuarioLogado(usuario) {
	localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
}

function limparUsuarioLogado() {
	localStorage.removeItem('usuarioLogado');
}