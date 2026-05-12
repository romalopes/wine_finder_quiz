import { useState, useEffect } from "react";

function Counter() {

    const [count, setCount] = useState(0);
    const [color, setColor] = useState("green");

    //call whenever it refreshes
    // useEffect(() => {
    //     document.title = 'Count:' + count;
    //     console.log("call whenever it refreshes");
    // });

    // // Call only when it mounts
    // useEffect(() => {
    //     document.title = 'Count:' + count;
    //     console.log("Call only when it mounts");
    // }, []);

    // Call when the page refreshes and when a specific value changes.  In this case, count
    useEffect(() => {
        document.title = 'Count:' + count + " Color:" + color;
        console.log("Call when the page refreshes and when a specific value changes.  In this case, count");

        return () => {
            // CLEAN UP CODE.
        }
    }, [count, color]);

    const increment = () => {
        // setCount(count + 1)
        setCount(count => count + 1)
        setCount(count => count + 1)
        setCount(count => count + 2)
    }
    const decrement = () => {
        setCount(count - 1)
    }

    const reset = () => {
        setCount(0)
    }

    const changeColor = () => {
        const newColor = color === "green" ? "red" : "green";
        setColor(c => (newColor))
        console.log(newColor);
    }

    return(
        <>
            <div className="counter-container">
                <p className="counter-display" style={{color: color}}>Count: {count}</p>
                <button className="counter-button" onClick={increment}>increment</button>
                <button className="counter-button" onClick={decrement}>decrement</button>
                <button className="counter-button" onClick={reset}>reset</button>
                <button className="counter-button" onClick={changeColor}>Change Color</button>

            </div>
        
        
        </>
    );
}

export default Counter ;