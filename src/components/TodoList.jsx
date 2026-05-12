import { useState } from "react";

function TodoList() {

    const [tasks, setTasks] = useState(["Wake up", "Brush teeth", "Play BVB"]);
    const [newTask, setNewTask] = useState("");

    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    function addTask() {
        if(newTask.trim() !== "") {
            setTasks(tasks => [...tasks, newTask])
            setNewTask("");
        }
    }

    function deleteTask(index) {
        setTasks(tasks.filter((_, i) => i !== index));
    }

    function moveTaskUp(index) {
        if(index > 0) {
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index -1]] = [updatedTasks[index -1], updatedTasks[index]];
            setTasks(updatedTasks);
        }
    }

    function moveTaskDown(index) {
        if(index < tasks.length-1) {
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index +1]] = [updatedTasks[index +1], updatedTasks[index]];
            setTasks(updatedTasks);
        }

    }

    return(
       <>
        <hr></hr>
        <div className="todo-do-list">
            <h1>To do List</h1>
            <p>newTask: {newTask}</p>
            <input 
                type="text" 
                placeholder="Enter a task"
                value={newTask}
                onChange={handleInputChange}
            />
            <button className="add-button"
                    onClick={() => addTask()}>Add Task</button>

        </div>
        <ol>
            {tasks.map((task, index) => 
                <li key={index}> 
                    <span className="text">{task}</span>
                    <button className="delete-button"
                            onClick={() => deleteTask(index)}>
                        Delete
                    </button>
                    <button className="up-button"
                            onClick={() => moveTaskUp(index)}>
                        Up
                    </button>
                    <button className="down-button"
                            onClick={() => moveTaskDown(index)}>
                        Down
                    </button>
                </li>
            )}
        </ol>

       </>
    );
}

export default TodoList;