// Adicionar classe 'active' ao item de menu clicado
document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll("nav ul li a");
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuItems.forEach((item) => item.classList.remove("active"));
      this.classList.add("active");
    });
  });
});

// Modifica dinamicamente o valor dos votos de Pedro Pacu e Luiz Neto
document.getElementById("pedro-votes").textContent = "50%"; // Valor inicial
