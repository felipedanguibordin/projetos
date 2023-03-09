const frases = [
  "Se você quer algo que nunca teve, precisa fazer algo que nunca fez.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Acredite em si próprio e todo o resto virá por acréscimo.",
  "Não é o que você olha que importa, é o que você vê.",
  "O caminho para o sucesso é feito de pequenos passos dados com determinação.",
  "A única forma de fazer um bom trabalho é amando o que você faz.",
  "Não deixe que o medo de cair impeça você de voar.",
  "A persistência é o caminho do êxito.",
  "O sucesso não é final, o fracasso não é fatal: é a coragem de continuar que conta.",
  "Acredite em seus sonhos e nos seus potenciais porque só assim suas metas serão alcançáveis.",
];

const btn = document.getElementById("btn");
const frase = document.getElementById("frase");

btn.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * frases.length);
  frase.textContent = frases[randomIndex];
});
