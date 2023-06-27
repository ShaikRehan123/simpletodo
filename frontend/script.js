const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");

const url = "http://localhost:9090"; // Change the URL as needed

// Function to fetch all todos from the server
const fetchTodos = async () => {
  try {
    const response = await fetch(`${url}/todos/`);
    const data = await response.json();
    return data.todos;
  } catch (error) {
    console.log(error);
  }
};

// Function to create a new todo
const createTodo = async (todo) => {
  try {
    const response = await fetch(`${url}/todos/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ todo }),
    });
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.log(error);
  }
};

// Function to update the status of a todo
const toggleTodoStatus = async (todoId, status) => {
  try {
    await fetch(`${url}/todos/${todoId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.log(error);
  }
};

// Function to delete a todo
const deleteTodo = async (todoId) => {
  try {
    await fetch(`${url}/todos/${todoId}/`, {
      method: "DELETE",
    });
  } catch (error) {
    console.log(error);
  }
};

// Function to render todos on the page
const renderTodos = (todos) => {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    if (todo.status === "DONE") {
      li.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.status === "DONE";
    checkbox.addEventListener("change", async () => {
      const newStatus = checkbox.checked ? "DONE" : "TODO";
      await toggleTodoStatus(todo.id, newStatus);
      li.classList.toggle("completed");
    });

    const todoText = document.createElement("span");
    todoText.textContent = todo.todo;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", async () => {
      await deleteTodo(todo.id);
      li.remove();
    });

    li.appendChild(checkbox);
    li.appendChild(todoText);
    li.appendChild(deleteButton);
    todoList.appendChild(li);
  });
};

// Event listener for submitting the todo form
todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const todoText = todoInput.value.trim();
  if (todoText) {
    const newTodoId = await createTodo(todoText);
    if (newTodoId) {
      const todos = await fetchTodos();
      renderTodos(todos);
      todoInput.value = "";
    }
  }
});

// Initial setup: fetch and render todos
(async () => {
  const todos = await fetchTodos();
  renderTodos(todos);
})();
