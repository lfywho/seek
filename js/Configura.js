// js/configura.js

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

// Comportamento do Dropdown
document.addEventListener('click', function(e) {
  const toggle = e.target.closest('.dropdown-toggle');
  if (toggle) {
    const dropdown = toggle.closest('.dropdown');
    const isOpen = dropdown.classList.contains('show');
    
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

  const item = e.target.closest('.dropdown-item');
  if (item) {
    const dropdown = item.closest('.dropdown');
    const type = dropdown.getAttribute('data-dropdown');
    const label = item.textContent.trim();
    const val = item.getAttribute('data-value') || '';
    const selectedEl = dropdown.querySelector('.dropdown-selected');
    
    if (selectedEl) {
      selectedEl.textContent = label;
      dropdown.dataset.selected = val;
    } else if (type === 'silenciar') {
      const toggleBtn = dropdown.querySelector('.dropdown-toggle');
      toggleBtn.textContent = '\u2713'; 
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
    
    document.querySelectorAll('.dropdown.show').forEach(d => {
      d.classList.remove('show');
      d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
    return;
  }

  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown.show').forEach(d => {
      d.classList.remove('show');
      d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  }
});