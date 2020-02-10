const searchTodos = function() {
  const searchText = getElement('todoSearchText');
  return todoData.filter(todo => {
    return (
      todo.title.includes('buy') ||
      todo.tasks.some(task => task.name.includes(searchText.value))
    );
  });
};

const createElement = (elementName, className) => {
  const element = document.createElement(elementName);
  element.classList.add(className);
  return element;
};

const createTasks = function(tasks) {
  const taskList = createElement('ul');
  tasks.forEach(task => {
    const taskListItem = createElement('li');
    taskListItem.innerText = task.name;
    taskList.appendChild(taskListItem);
  });
  return taskList;
};

const createSearchResultBox = function(todo) {
  const searchResult = createElement('div', 'searchResult');
  const todoTitleBox = createElement('div', 'todoTitleBox');
  const todoTitle = createElement('span', 'todoTitle');
  todoTitle.innerText = todo.title;
  todoTitleBox.appendChild(todoTitle);
  const todoTaskBox = createElement('div', 'todoTaskBox');
  const tasks = createTasks(todo.tasks);
  todoTaskBox.appendChild(tasks);
  searchResult.appendChild(todoTitleBox);
  searchResult.appendChild(todoTaskBox);
  return searchResult;
};

const handleSearch = function() {
  const searchedTodos = searchTodos();
  const resultNodes = searchedTodos.map(createSearchResultBox);
  const searchResults = document.querySelector('.searchResults');
  searchResults.innerHTML = '';
  resultNodes.forEach(node => searchResults.appendChild(node));
};
