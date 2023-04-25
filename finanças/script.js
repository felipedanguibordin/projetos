// Variáveis globais
const transactionForm = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description-input");
const amountInput = document.getElementById("amount-input");
const typeSelect = document.getElementById("type-select");
const transactionList = document.getElementById("transaction-list");
const totalBalance = document.getElementById("total-balance");

let transactions = [];

if (window.localStorage.getItem("valores") != undefined) {
  transactions = JSON.parse(window.localStorage.getItem("valores"));
}

updateTransactionList();
updateTotalBalance();

// window.localStorage.setItem("valores", JSON.stringify(transactions));

// Função para adicionar transação
function addTransaction() {
  if (!descriptionInput.value || !amountInput.value) {
    alert("Por favor, preencha todos os campos");
    return;
  }

  const transaction = {
    id: generateId(),
    description: descriptionInput.value,
    tipo: typeSelect.value,
    amount: +amountInput.value,
    type: typeSelect.value,
  };

  transactions.push(transaction);

  window.localStorage.setItem("valores", JSON.stringify(transactions));

  updateTransactionList();
  updateTotalBalance();

  descriptionInput.value = "";
  amountInput.value = "";
  typeSelect.value = "Receita";
}

// Função para gerar ID único
function generateId() {
  return Math.floor(Math.random() * 1000000000);
}

// Função para atualizar a lista de transações
function updateTransactionList() {
  transactionList.innerHTML = "";

  transactions.forEach((transaction) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${transaction.description}</span>
      <span>${transaction.tipo}</span>
      <span>${
        transaction.type === "Receita" ? "+" : "-"
      } R$ ${transaction.amount.toFixed(2)}</span>
      <button class="btn btn-danger"  onclick="deleteTransaction(${
        transaction.id
      })">Deletar</button>
    `;
    transactionList.appendChild(li);
  });
}

// Função para atualizar o saldo total
function updateTotalBalance() {
  const income = transactions
    .filter((transaction) => transaction.type === "Receita")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "Despesa")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const investments = transactions
    .filter((transaction) => transaction.type === "Investimento")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const total = income - expenses - investments;

  totalBalance.textContent = `Saldo Total: R$ ${total.toFixed(2)}`;
}

// Função para excluir transação
function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateTransactionList();
  updateTotalBalance();
}

// Event listeners
transactionForm.addEventListener("submit", addTransaction);
