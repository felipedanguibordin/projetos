const button = document.querySelector(".button-add-task");
const input = document.querySelector(".input-task");
const lista = document.querySelector(".list-tasks");

let list = [];
function addTaks() {
  list.push({
    tarefa: input.value,
    concluida: false,
  });

  input.value = "";

  showTask();
}

function showTask() {
  let novaLista = "";

  list.forEach((item, index) => {
    novaLista =
      novaLista +
      `
        <li class="task ${item.concluida && "done"}">
          <img src="./img/checked.png" onclick="concluirTarefa(${index})" />
          <p class="text">${item.tarefa}</p>
          <img src="./img/trash.png" alt="Excluir" onclick="excluirTarefa(${index})" />
        </li>
        `;
  });
  lista.innerHTML = novaLista;

  localStorage.setItem("lista", JSON.stringify(list));
}

function concluirTarefa(index) {
  list[index].concluida = !list[index].concluida;

  showTask();
}

function excluirTarefa(index) {
  list.splice(index, 1);

  showTask();
}

function getItem() {
  const tarefasGuardadas = localStorage.getItem("lista");

  list = JSON.parse(tarefasGuardadas);

  showTask();
}

getItem();
button.addEventListener("click", addTaks);
window.addEventListener("keyup", function (event) {
  if (event.keyCode == 13) {
    addTaks();
  }
});
