  function mostrar(classe) {
      document.querySelectorAll('.Esquerda > div').forEach(div => {
        div.style.display = 'none';
      });
      document.querySelector('.' + classe).style.display = 'block';
    }