"use strict";

// Get HTML elements
const transactionForm = document.getElementById("transactionForm");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");

const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");
const balance = document.getElementById("balance");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");

// Edit form elements
const editSection = document.getElementById("editSection");
const editForm = document.getElementById("editForm");

const editDescription = document.getElementById("editDescription");
const editAmount = document.getElementById("editAmount");
const editType = document.getElementById("editType");
const editCategory = document.getElementById("editCategory");
const editDate = document.getElementById("editDate");

const cancelEdit = document.getElementById("cancelEdit");

// Track the transaction being edited
let editingId = null;

// Store transactions
let transactions = [];
transactionForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const transaction = {
    id: Date.now(),
    description: descriptionInput.value.trim(),
    amount: Number(amountInput.value),
    type: typeInput.value,
    category: categoryInput.value,
    date: dateInput.value
  };

  transactions.push(transaction);
  saveTransactions();

  displayTransactions();
  updateSummary();

  transactionForm.reset();
});

function displayTransactions() {
  const visibleTransactions = getVisibleTransactions();

  if (visibleTransactions.length === 0) {
    if (transactions.length === 0) {
      transactionList.innerHTML = "<p>No transactions yet.</p>";
    } else {
      transactionList.innerHTML = "<p>No matching transactions found.</p>";
    }
    return;
  }

  transactionList.innerHTML = visibleTransactions.map(function(transaction) {
    return `
      <div class="transaction-card">
        <h3>${transaction.description}</h3>
        <p>Category: ${transaction.category}</p>
        <p>Date: ${transaction.date}</p>
        <p>Type: ${transaction.type}</p>
        <strong>₦${transaction.amount.toLocaleString()}</strong>

        <button class="edit-btn" data-id="${transaction.id}">
          Edit
        </button>

        <button class="delete-btn" data-id="${transaction.id}">
          Delete
        </button>
      </div>
    `;
  }).join("");
}
function updateSummary() {
  const income = transactions
    .filter(function(transaction) {
      return transaction.type === "income";
    })
    .reduce(function(total, transaction) {
      return total + transaction.amount;
    }, 0);

  const expenses = transactions
    .filter(function(transaction) {
      return transaction.type === "expense";
    })
    .reduce(function(total, transaction) {
      return total + transaction.amount;
    }, 0);

  const currentBalance = income - expenses;

  totalIncome.textContent = `₦${income.toLocaleString("en-NG", {
    minimumFractionDigits: 2
  })}`;

  totalExpenses.textContent = `₦${expenses.toLocaleString("en-NG", {
    minimumFractionDigits: 2
  })}`;

  balance.textContent = `₦${currentBalance.toLocaleString("en-NG", {
    minimumFractionDigits: 2
  })}`;
}

function getVisibleTransactions() {
  const searchText = searchInput.value.toLowerCase().trim();
  const selectedType = filterType.value;

  return transactions.filter(function(transaction) {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchText) ||
      transaction.category.toLowerCase().includes(searchText);

    const matchesType =
      selectedType === "all" || transaction.type === selectedType;

    return matchesSearch && matchesType;
  });
}

searchInput.addEventListener("input", displayTransactions);

filterType.addEventListener("change", displayTransactions);

transactionList.addEventListener("click", function(event) {
  const deleteButton = event.target.closest(".delete-btn");

  if (!deleteButton) {
    return;
  }

  const id = Number(deleteButton.dataset.id);

  transactions = transactions.filter(function(transaction) {
    return transaction.id !== id;
  });
  saveTransactions();

  displayTransactions();
  updateSummary();
});

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
  const savedTransactions = localStorage.getItem("transactions");

  if (savedTransactions) {
    transactions = JSON.parse(savedTransactions);
  }

  displayTransactions();
  updateSummary();
}
loadTransactions();

transactionList.addEventListener("click", function(event) {
  const editButton = event.target.closest(".edit-btn");

  if (!editButton) {
    return;
  }

  editingId = Number(editButton.dataset.id);

  const transaction = transactions.find(function(item) {
    return item.id === editingId;
  });

  if (!transaction) {
    return;
  }

  editDescription.value = transaction.description;
  editAmount.value = transaction.amount;
  editType.value = transaction.type;
  editCategory.value = transaction.category;
  editDate.value = transaction.date;

  editSection.style.display = "block";

  editSection.scrollIntoView({
    behavior: "smooth"
  });
});

editForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const transaction = transactions.find(function(item) {
    return item.id === editingId;
  });

  if (!transaction) {
    return;
  }

  transaction.description = editDescription.value.trim();
  transaction.amount = Number(editAmount.value);
  transaction.type = editType.value;
  transaction.category = editCategory.value;
  transaction.date = editDate.value;

  saveTransactions();
  displayTransactions();
  updateSummary();

  editForm.reset();
  editSection.style.display = "none";
  editingId = null;
});

cancelEdit.addEventListener("click", function() {
  editForm.reset();

  editSection.style.display = "none";

  editingId = null;
});
