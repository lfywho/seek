document.addEventListener('DOMContentLoaded', () => {
    const navigation = document.querySelector('.main-nav');
    const currentLink = navigation?.querySelector('[aria-current="page"]');

    if (!navigation || !currentLink) {
        return;
    }

    const setIndicatorPosition = (link) => {
        const navigationBox = navigation.getBoundingClientRect();
        const linkBox = link.getBoundingClientRect();
        navigation.style.setProperty('--indicator-left', `${linkBox.left - navigationBox.left}px`);
        navigation.style.setProperty('--indicator-width', `${linkBox.width}px`);
    };

    requestAnimationFrame(() => {
        setIndicatorPosition(currentLink);
        navigation.classList.add('indicator-ready');
    });

    navigation.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', (event) => {
            if (link === currentLink || link.hash) {
                return;
            }

            event.preventDefault();
            setIndicatorPosition(link);
            navigation.classList.add('indicator-moving');

            window.setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        });
    });

    window.addEventListener('resize', () => setIndicatorPosition(currentLink));
});
