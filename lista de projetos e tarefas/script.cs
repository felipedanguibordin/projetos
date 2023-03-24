const form = document.querySelector('form');
const input = document.getElementById('sonho-input');
const lista = document.getElementById('lista-sonhos');

form.addEventListener('submit', function(event) {
  event.preventDefault(); // previne o comportamento padrão de recarregar a página

  const novoSonho = input.value;
  input.value = ''; // limpa o input

  const novoItem = document.createElement('li');
  novoItem.innerText = novoSonho;

  const botaoExcluir = document.createElement('button');
  botaoExcluir.innerText = 'Excluir';
  botaoExcluir.classList.add('excluir');

  novoItem.appendChild(botaoExcluir);
  lista.appendChild(novoItem);
});

lista.addEventListener('click', function(event) {
  if (event.target.classList.contains('excluir')) {
    event.target.parentNode.remove();
  }
});