  function mostrar(classe, elemento) {
      document.querySelectorAll('.Esquerda > div').forEach(div => {
        div.style.display = 'none';
        div.classList.remove('active');
      });
      document.querySelectorAll('.sidebar__menu-item').forEach(item => {
        item.classList.remove('active');
      });
      if (elemento) {
        elemento.closest('li')?.classList.add('active');
      }
      const painel = document.querySelector('.' + classe);
      if (painel) {
        painel.style.display = 'block';
        painel.classList.add('active');
        painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

  // Dropdown behavior for panel actions
  document.addEventListener('click', function(e) {
    // toggle dropdown when clicking its button
    const toggle = e.target.closest('.dropdown-toggle');
    if (toggle) {
      const dropdown = toggle.closest('.dropdown');
      const isOpen = dropdown.classList.contains('show');
      // close any open dropdowns
      document.querySelectorAll('.dropdown.show').forEach(d => {
        d.classList.remove('show');
        d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        dropdown.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    // clicking a dropdown item
    const item = e.target.closest('.dropdown-item');
    if (item) {
      const menu = item.closest('.dropdown-menu');
      const dropdown = item.closest('.dropdown');
      const type = dropdown.getAttribute('data-dropdown');
      const label = item.textContent.trim();
      const val = item.getAttribute('data-value') || '';
      // if there is a dropdown-selected element inside, update it
      const selectedEl = dropdown.querySelector('.dropdown-selected');
      if (selectedEl) {
        selectedEl.textContent = label;
        dropdown.dataset.selected = val;
      } else if (type === 'silenciar') {
        // fallback behavior for silenciar when there is no selected element
        const toggleBtn = dropdown.querySelector('.dropdown-toggle');
        toggleBtn.textContent = '\u2713'; // checkmark as feedback
        let created = dropdown.querySelector('.dropdown-selected');
        if (!created) {
          created = document.createElement('div');
          created.className = 'dropdown-selected';
          created.style.fontSize = '13px';
          created.style.color = '#475569';
          created.style.marginLeft = '8px';
          dropdown.parentElement.appendChild(created);
        }
        created.textContent = label;
        dropdown.dataset.selected = val;
      }
      // close dropdown after selection
      document.querySelectorAll('.dropdown.show').forEach(d => {
        d.classList.remove('show');
        d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
      return;
    }

    // click outside: close all
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.show').forEach(d => {
        d.classList.remove('show');
        d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });