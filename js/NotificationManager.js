const NotificationManager = (() => {
    const ROOT_ID = 'seek-notifications-root';
    const DEFAULT_DURATION = 4000;

    function getRoot() {
        let root = document.getElementById(ROOT_ID);
        if (!root) {
            root = document.createElement('div');
            root.id = ROOT_ID;
            root.className = 'seek-notifications';
            root.setAttribute('aria-live', 'polite');
            root.setAttribute('aria-relevant', 'additions');
            document.body.appendChild(root);
        }
        return root;
    }

    function close(element) {
        if (!element || !element.isConnected) return;
        element.classList.add('is-closing');
        element.addEventListener('transitionend', () => element.remove(), { once: true });
        window.setTimeout(() => element.remove(), 250);
    }

    function showSimple(message, options = {}) {
        const root = getRoot();
        const notification = document.createElement('div');
        notification.className = 'seek-notification seek-notification--simple';
        notification.setAttribute('role', options.role || 'status');

        const text = document.createElement('span');
        text.className = 'seek-notification__message';
        text.textContent = String(message ?? '');
        notification.appendChild(text);

        if (options.dismissible !== false) {
            const closeButton = document.createElement('button');
            closeButton.className = 'seek-notification__close';
            closeButton.type = 'button';
            closeButton.setAttribute('aria-label', 'Fechar notificação');
            closeButton.textContent = '×';
            closeButton.addEventListener('click', () => close(notification));
            notification.appendChild(closeButton);
        }

        root.appendChild(notification);
        const duration = options.duration ?? DEFAULT_DURATION;
        if (Number(duration) > 0) {
            window.setTimeout(() => close(notification), Number(duration));
        }
        return notification;
    }

    function showModal(message, options = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'seek-notification-overlay';
        overlay.setAttribute('role', 'presentation');

        const dialog = document.createElement('section');
        dialog.className = 'seek-notification seek-notification--modal';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-label', options.title || 'Notificação');

        if (options.title) {
            const title = document.createElement('h2');
            title.className = 'seek-notification__title';
            title.textContent = String(options.title);
            dialog.appendChild(title);
        }

        const text = document.createElement('p');
        text.className = 'seek-notification__message';
        text.textContent = String(message ?? '');
        dialog.appendChild(text);

        const buttons = Array.isArray(options.buttons) ? options.buttons.slice(0, 2) : [];
        if (buttons.length) {
            const actions = document.createElement('div');
            actions.className = 'seek-notification__actions';

            buttons.forEach((button) => {
                const action = document.createElement('button');
                action.type = 'button';
                action.className = 'seek-notification__button' + (button.variant === 'secondary' ? ' seek-notification__button--secondary' : '');
                action.textContent = String(button.text || 'OK');
                action.addEventListener('click', async () => {
                    action.disabled = true;
                    try {
                        if (typeof button.onClick === 'function') await button.onClick();
                    } finally {
                        close(overlay);
                    }
                });
                actions.appendChild(action);
            });

            dialog.appendChild(actions);
        }

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        let onKeyDown;
        const closeModal = () => {
            close(overlay);
            if (onKeyDown) document.removeEventListener('keydown', onKeyDown);
        };
        if (options.closeOnOverlay === true) {
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) closeModal();
            });
        }
        if (options.closeOnEscape !== false) {
            onKeyDown = (event) => {
                if (event.key === 'Escape') {
                    closeModal();
                }
            };
            document.addEventListener('keydown', onKeyDown);
        }
        const firstButton = dialog.querySelector('button');
        if (firstButton) firstButton.focus();
        return overlay;
    }

    return {
        show(message, options = {}) {
            return options.type === 'modal' ? showModal(message, options) : showSimple(message, options);
        },
        simple: showSimple,
        modal: showModal,
        close
    };
})();

export default NotificationManager;

if (typeof window !== 'undefined') {
    window.NotificationManager = NotificationManager;
    window.seekNotificar = window.seekNotificar || ((message, options) => NotificationManager.simple(message, options));
}
