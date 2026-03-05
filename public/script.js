const API = "/books";

async function loadBooks(url = API) {
  const res = await fetch(url);
  const books = await res.json();

  const list = document.getElementById("bookList");
  list.innerHTML = "";

  books.forEach(book => {
    list.innerHTML += `
      <div class="book">
        <h3>${book.title}</h3>
        <p><b>Author:</b> ${book.author}</p>
        <p><b>Status:</b> ${book.status}</p>
        <p>${book.description}</p>
        <small>${book.date}</small><br>
        <button onclick="toggleStatus('${book.id}')">Toggle Status</button>
        <button onclick="deleteBook('${book.id}')">Delete</button>
      </div>
    `;
  });
}

async function addBook() {
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const descInput = document.getElementById("description");

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const description = descInput.value.trim();

  if (!title || !author) {
    showError("Title and Author are required");
    return;
  }

  const res = await fetch("/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author, description })
  });

  const data = await res.json();

  if (!res.ok) {
    showError(data.error || "Something went wrong");
    return;
  }

  clearError();

  titleInput.value = "";
  authorInput.value = "";
  descInput.value = "";

  loadBooks();
}

async function toggleStatus(id) {
  await fetch(`${API}/${id}/status`, { method: "PUT" });
  loadBooks();
}

async function deleteBook(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadBooks();
}

function filterBooks(status) {
  loadBooks(`${API}?status=${status}`);
}

function searchBooks() {
  const value = document.getElementById("search").value;
  loadBooks(`${API}?search=${value}`);
}

function showError(message) {
  document.getElementById("errorMsg").innerText = message;
}

function clearError() {
  document.getElementById("errorMsg").innerText = "";
}

// Initial load
loadBooks();