document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggle = document.querySelector('.theme-toggle');

    if (!toggle) {
        return;
    }

    const setTheme = (isLight) => {
        body.classList.toggle('light-mode', isLight);
        toggle.setAttribute('aria-pressed', String(isLight));
        toggle.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
        toggle.innerHTML = `<span aria-hidden="true">${isLight ? '☾' : '☼'}</span> ${isLight ? 'Modo escuro' : 'Modo claro'}`;
    };

    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('seek-theme');
    } catch (error) {
        savedTheme = null;
    }

    setTheme(savedTheme === 'light');

    toggle.addEventListener('click', () => {
        const isLight = !body.classList.contains('light-mode');
        setTheme(isLight);
        try {
            localStorage.setItem('seek-theme', isLight ? 'light' : 'dark');
        } catch (error) {
        }
    });
});