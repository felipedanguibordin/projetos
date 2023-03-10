// Define a data e hora do ano novo
var newYear = new Date("Oct 20, 2023 00:00:00").getTime();

// Atualiza a contagem regressiva a cada segundo
var x = setInterval(function () {
  // Obtém a data e hora atual
  var now = new Date().getTime();

  // Calcula a diferença entre a data e hora atual e o ano novo
  var distance = newYear - now;

  // Calcula o tempo restante em dias, horas, minutos e segundos
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Exibe a contagem regressiva no HTML
  document.getElementById("days").innerHTML = days + " dias";
  document.getElementById("hours").innerHTML = hours + " horas";
  document.getElementById("minutes").innerHTML = minutes + " minutos";
  document.getElementById("seconds").innerHTML = seconds + " segundos";

  // Quando a contagem regressiva chegar a zero, exibe uma mensagem
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("countdown").innerHTML = "Feliz Aniversário!";
  }
}, 1000);
