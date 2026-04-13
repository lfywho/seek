document.addEventListener('DOMContentLoaded', () => {

    const categorias = [
        { nome: 'Fotografia', cor: ['#1b1b1b', '#2f2f2f'] },
        { nome: 'Arte 3D', cor: ['#2d2a4a', '#5c4d7d'] },
        { nome: 'Design gráfico', cor: ['#444', '#6a6a6a'] },
        { nome: 'UI/UX', cor: ['#3a3f47', '#6d727c'] },
        { nome: 'Design de produtos', cor: ['#5b3300', '#9a5c0b'] },
        { nome: 'Moda', cor: ['#2c2c2c', '#555'] },
        { nome: 'Concept art', cor: ['#303030', '#4d4d4d'] },
        { nome: 'Urbano', cor: ['#262626', '#404040'] },
        { nome: 'Arquitetura', cor: ['#3b3b3b', '#5f5f5f'] },
        { nome: 'Branding', cor: ['#2f2f2f', '#5a5a5a'] },
        { nome: 'Marca', cor: ['#2b2f45', '#4f5670'] },
        { nome: 'Ilustração', cor: ['#2c2c3a', '#4c4c69'] },
        { nome: 'Tipografia', cor: ['#1f1f1f', '#3b3b3b'] },
        { nome: 'Motion', cor: ['#2a2a2a', '#4f4f4f'] },
    ];

    const track = document.getElementById('categoriesTrack');

    // 🔥 cria os cards (equivalente ao foreach do PHP)
    categorias.forEach(categoria => {
        const btn = document.createElement('button');
        btn.className = 'category-card';
        btn.style.background = `linear-gradient(135deg, ${categoria.cor[0]}, ${categoria.cor[1]})`;
        btn.setAttribute('aria-label', `Ver categoria ${categoria.nome}`);

        btn.innerHTML = `<span>${categoria.nome}</span>`;

        track.appendChild(btn);
    });

    // =========================
    // CARROSSEL (seu código)
    // =========================

    const prev = document.querySelector('.carousel-btn.prev');
    const next = document.querySelector('.carousel-btn.next');
    const cards = Array.from(track.querySelectorAll('.category-card'));

    const getScrollStep = () => {
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap || '0');
        const cardWidth = cards[0].offsetWidth + gap;
        const visibleCards = window.innerWidth < 768 ? 2 : 4;
        return cardWidth * visibleCards;
    };

    const updateButtons = () => {
        const maxScroll = track.scrollWidth - track.clientWidth - 1;
        prev.classList.toggle('disabled', track.scrollLeft <= 0);
        next.classList.toggle('disabled', track.scrollLeft >= maxScroll);
    };

    prev.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
        track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);

    updateButtons();
});