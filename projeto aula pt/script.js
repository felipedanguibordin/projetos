// Aguarde o carregamento do documento
document.addEventListener("DOMContentLoaded", function () {
  // Obtenha o botão "Criar"
  var criarButton = document.querySelector("button.btn.btn-outline-secondary");

  // Adicione um evento de clique ao botão
  criarButton.addEventListener("click", function () {
    // Obtenha o valor do campo "Nome do RPG"
    var nomeRPGInput = document.querySelector("#exampleFormControlInput1");
    var nomeRPG = nomeRPGInput.value;

    // Obtenha o valor do campo "Tipo"
    var tipoRPGSelect = document.querySelector("#tipoRPG");
    var tipoRPG = tipoRPGSelect.selectedOptions[0].text;

    // Crie a URL da nova página com os parâmetros
    var url =
      "cria_historia.html" +
      "?nomeRPG=" +
      encodeURIComponent(nomeRPG) +
      "&tipoRPG=" +
      encodeURIComponent(tipoRPG);

    // Redirecione para a nova página
    window.location.href = url;
  });
});
