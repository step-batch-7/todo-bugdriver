const searchTodos = function(searchText) {
  return todoData.filter(todo => {
    return (
      todo.title.includes(searchText) ||
      todo.tasks.some(task => task.name.includes(searchText))
    );
  });
};

const createElement = (elementName, className) => {
  const element = document.createElement(elementName);
  element.classList.add(className);
  return element;
};

const highlightSearchedText = function(searchedText, text) {
  const highlightedText = `<span class="searched">${searchedText}</span>`;
  return text.replace(searchedText, highlightedText);
};

const createTasks = function(tasks, searchedText) {
  const taskList = createElement('ul');
  tasks.forEach(task => {
    const taskListItem = createElement('li');
    taskListItem.innerHTML = highlightSearchedText(searchedText, task.name);
    taskList.appendChild(taskListItem);
  });
  return taskList;
};

const createSearchResultBox = function(todo) {
  const searchResult = createElement('div', 'searchResult');
  const todoTitleBox = createElement('div', 'todoTitleBox');
  const todoTitle = createElement('span', 'todoTitle');
  todoTitle.innerHTML = highlightSearchedText(this, todo.title);
  todoTitleBox.appendChild(todoTitle);
  const todoTaskBox = createElement('div', 'todoTaskBox');
  const tasks = createTasks(todo.tasks, this);
  todoTaskBox.appendChild(tasks);
  searchResult.appendChild(todoTitleBox);
  searchResult.appendChild(todoTaskBox);
  return searchResult;
};

const handleSearch = function() {
  const searchText = getElement('todoSearchText');
  const searchedTodos = searchTodos(searchText.value);
  const resultNodes = searchedTodos.map(
    createSearchResultBox.bind(searchText.value)
  );
  const searchResults = document.querySelector('.searchResults');
  searchResults.innerHTML = '';
  resultNodes.forEach(node => searchResults.appendChild(node));
};
