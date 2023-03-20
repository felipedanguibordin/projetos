function updateCPU() {
  const cpuBar = document.querySelector(".cpu-bar");
  const cpuPercentage = document.querySelector(".cpu-percentage");

  // Pega a porcentagem de uso da CPU
  const cpuUsage = performance.now() % 100;

  // Atualiza a barra de progresso da CPU
  cpuBar.style.width = `${cpuUsage}%`;

  // Atualiza a porcentagem de uso da CPU
  cpuPercentage.textContent = `${cpuUsage}%`;
}

// Chama a função "updateCPU" a cada 1 segundo
setInterval(updateCPU, 1000);
