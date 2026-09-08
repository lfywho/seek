document.addEventListener('DOMContentLoaded', () => {
    const navigation = document.querySelector('.main-nav');
    const links = [...(navigation?.querySelectorAll('a[href^="#"]') || [])];
    const sections = [...document.querySelectorAll('main > section[id]')];

    if (!navigation || !links.length) {
        return;
    }

    const setActiveSection = (section) => {
        const link = links.find((item) => item.getAttribute('href') === `#${section.id}`);
        if (!link) {
            return;
        }

        const navigationBox = navigation.getBoundingClientRect();
        const linkBox = link.getBoundingClientRect();
        navigation.style.setProperty('--indicator-left', `${linkBox.left - navigationBox.left}px`);
        navigation.style.setProperty('--indicator-width', `${linkBox.width}px`);
        links.forEach((item) => item.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'page');
        navigation.classList.add('indicator-ready');
    };

    const observer = new IntersectionObserver((entries) => {
        const visibleSection = entries
            .filter((entry) => entry.isIntersecting)
            .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
        if (visibleSection) {
            setActiveSection(visibleSection.target);
        }
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, .25, .5, .75, 1] });

    sections.forEach((section) => observer.observe(section));
    setActiveSection(document.querySelector('[aria-current="page"]')?.closest('section') || sections[0]);

    window.addEventListener('resize', () => {
        const activeLink = navigation.querySelector('[aria-current="page"]');
        const activeSection = sections.find((section) => `#${section.id}` === activeLink?.getAttribute('href'));
        if (activeSection) {
            setActiveSection(activeSection);
        }
    });
});
