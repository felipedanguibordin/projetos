const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskText = taskInput.value;
  const newTask = document.createElement("li");
  newTask.innerHTML = `<span class="task">${taskText}</span><button class="delete-button">Excluir</button>`;
  taskList.appendChild(newTask);

  taskInput.value = "";

  const deleteButton = newTask.querySelector(".delete-button");
  deleteButton.addEventListener("click", function () {
    newTask.remove();
  });
});
