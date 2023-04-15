//console.log("hello world")

/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */

const APIs = (() => {
    const createTodo = (newTodo) => {
        return fetch("http://localhost:3000/todos", {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const deleteTodo = (id) => {
        return fetch("http://localhost:3000/todos/" + id, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const updateTodo = (id, currTodo) => {
        return fetch("http://localhost:3000/todos/" + id, {
            method: "PUT",
            //update DB with currTodo
            body: JSON.stringify(currTodo),
            headers: { "Content-Type": "application/json" }
        }).then((res) => {
            console.log(res);
            res.json()});
    };

    const getTodos = () => {
        return fetch("http://localhost:3000/todos").then((res) => res.json());
    };
    return { createTodo, deleteTodo, getTodos, updateTodo };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order


*/
const Model = (() => {
    class State {
        #todos; //private field
        #onChange; //function, will be called when setter function todos is called

        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        set todos(newTodos) {
            // reassign value
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
            console.log("setter function: ");
            console.log(this.#todos);
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo, updateTodo } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
        updateTodo,
    };
})();
/* 
    todos = [
        {
            id:1,
            content:"eat lunch"
        },
        {
            id:2,
            content:"eat breakfast"
        }
    ]

*/
const View = (() => {
    const todolistEl = document.querySelector(".todo-list"); //use to store all the pending tasks
    const completelistEl = document.querySelector(".complete-list"); //use to store all the completed tasks
    const submitBtnEl = document.querySelector(".submit-btn");
    const inputEl = document.querySelector(".input");

    const renderTodos = (todos) => {
        let todosTemplate = "";
        let completetemplate = "";
        todos.forEach((todo) => {
            if(todo.status === "pending") {
                const liTemplate = `<li><span name="${todo.id}">${todo.content}</span>
                <button class="edit-btn"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg></button>
                <button class="delete-btn" id="${todo.id}">
                <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg></button>
                <button class="right-arrow-btn" name="${todo.id}">
                <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small">
                <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg></button></li>`;
                todosTemplate += liTemplate;
            } else {
                const liTemplate = `<li><button class="left-arrow-btn" name="${todo.id}">
                <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg></button>
                <span name="${todo.id}">${todo.content}</span>
                <button class="edit-btn"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg></button>
                <button class="delete-btn" id="${todo.id}">
                <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg></button></li>`;
                completetemplate += liTemplate;
            }
        });
        if (todos.length === 0) {
            todosTemplate = "<h4>no task to display!</h4>";
        } else {
            todolistEl.innerHTML = todosTemplate;
            completelistEl.innerHTML = completetemplate;
        }
    };

    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, submitBtnEl, inputEl, clearInput, todolistEl, completelistEl };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                1. read the value from input
                2. post request
                3. update view
            */
            const inputValue = view.inputEl.value;
            //make the status to pending when create a new todo
            model.createTodo({ content: inputValue, status: "pending" }).then((data) => {
                state.todos = [data, ...state.todos];
                view.clearInput();
            });
        });
    };

    function editEventListner(event) {
        //event listerner function for the edit button
        if(event.target.className === "edit-btn") {
            event.target.className = "on_edit";
            //make the content field editable
            event.target.previousElementSibling.setAttribute("contenteditable", "true");
        } else if(event.target.className === "on_edit") {
            //close the content field and update info
            event.target.previousElementSibling.setAttribute("contenteditable", "false");
            event.target.className = "edit-btn";
            const id = event.target.previousElementSibling.getAttribute("name");
            currTodo = state.todos.find((todo) => todo.id === +id);
            currTodo.content = event.target.previousElementSibling.innerHTML;
            model.updateTodo(+id, currTodo).then((data) => {
                state.todos = state.todos.filter((todo) => todo.id !== +id);
                state.todos = [currTodo, ...state.todos];
            });
        }
    }

    const handleEdit =() => { 
        view.todolistEl.addEventListener("click", editEventListner); 
        view.completelistEl.addEventListener("click", editEventListner); 
    };

    function transferEventListner(event) {
        //event listerner function for the transfer arrow button
        if (event.target.className === "right-arrow-btn" || "left-arrow-btn") {
            const id = event.target.name;
            //find the todo in the list and update its status
            currTodo = state.todos.find((todo) => todo.id === +id);
            if(currTodo.status === "complete") {
                currTodo.status = "pending";
            } else {
                currTodo.status = "complete";
            }
            model.updateTodo(+id, currTodo).then((data) => {
                state.todos = state.todos.filter((todo) => todo.id !== +id);
                state.todos = [currTodo, ...state.todos];
            });
        } 
    }

    const handleTransfer = ()=> {
        view.todolistEl.addEventListener("click", transferEventListner);
        view.completelistEl.addEventListener("click", transferEventListner);
    };

    const handleDelete = () => {
        //event bubbling
        /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
        view.todolistEl.addEventListener("click", (event) => {

            if (event.target.className === "delete-btn" || event.target.contain) {
                const id = event.target.id;
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });

        view.completelistEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                console.log("id", typeof id);
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        handleTransfer();
        handleEdit();
        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
