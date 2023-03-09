const addclass = document.querySelector(".site"),
  button = document.querySelector(".trigger");
buttonclose = document.querySelector(".close");

button.addEventListener("click", function () {
  addclass.classList.toggle("show");
});

buttonclose.addEventListener("click", function () {
  addclass.classList.remove("show");
});
