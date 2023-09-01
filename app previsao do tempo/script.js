const key = "005e1fc9750e4d6dd3e9a8936b2538ce";

function insereDados(dados) {
  document.querySelector(".nome-cidade").innerHTML = "Tempo em " + dados.name;
  document.querySelector(".temp").innerHTML =
    Math.floor(dados.main.temp) + "°C";
  document.querySelector(".texto-previsao").innerHTML =
    dados.weather[0].description;
  document.querySelector(".umidade").innerHTML = dados.main.humidity + "%";

  document.querySelector(
    ".img-previsao"
  ).src = `https://openweathermap.org/img/wn/${dados.weather[0].icon}.png`;
}

async function buscaCidade(cidade) {
  const dados = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${key}&lang=pt_br&units=metric`
  ).then((resp) => resp.json());
  insereDados(dados);
}

function clickBotao() {
  const cidade = document.querySelector(".input-cidade").value;

  buscaCidade(cidade);
}

const inputCidade = document.querySelector(".input-cidade");
inputCidade.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    const cidade = inputCidade.value;
    buscaCidade(cidade);
  }
});
