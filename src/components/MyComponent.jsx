import { useState, useEffect, useRef } from "react";

function MyComponent() {
    const [foods, setFoods] = useState(["Banana", "Apple", "Orange", "Strawberry"]);
    const [car, setCar] = useState({year: 2025, make: "Gurgel", model: "F3"});
    //-----
    const [cars, setCars] = useState([]);
    const [carYear, setCarYear] = useState(new Date().getFullYear());
    const [carMake, setCarMake] = useState("");
    const [carModel, setCarModel] = useState("");
    //-----
    const [name, setName] = useState("Guest");
    const [quantity, setQuantity] = useState(5);
    const [comment, setComment] = useState("");
    const [payment, setPayment] = useState("");
    const [shipping, setShipping] = useState("Delivery");
    const [age, setAge] = useState(0);
    const [isEmployed, setIsEmployed] = useState(false);

    ////////////
    // let [number, setNumber] = useState(0);
    const numberRef1 = useRef(null);
    const numberRef2 = useRef(null);
    const numberRef3 = useRef(null);

    useEffect(() => {
        console.log("COMPONENT RENDERED");
    }) ;
    function handleClickRef1() {
        // setNumber(n => n + 1);
        // numberRef.current++;
        numberRef1.current.focus();
        numberRef1.current.style.backgroundColor = "yellow";
        numberRef2.current.style.backgroundColor = "";
        numberRef3.current.style.backgroundColor = "";
        console.log(numberRef1.current);
    } 

    function handleClickRef2() {
        // setNumber(n => n + 1);
        // numberRef.current++;
        numberRef2.current.focus();
        numberRef2.current.style.backgroundColor = "yellow";
        numberRef1.current.style.backgroundColor = "";
        numberRef3.current.style.backgroundColor = "";
        console.log(numberRef2.current);
    } 

    function handleClickRef3() {
        // setNumber(n => n + 1);
        // numberRef.current++;
        numberRef3.current.focus();
        numberRef3.current.style.backgroundColor = "yellow";
        numberRef1.current.style.backgroundColor = "";
        numberRef2.current.style.backgroundColor = "";
        console.log(numberRef3.current);
    } 
    ///////////



    const updateName = () => {
        // name = "Anderson State"
        setName("Anderson State ")
        console.log(name)
    }
    const incrementAge = () => {
        setAge(age + 1)
        console.log(age)
    }
    const toggleEmployedStatus = () => {
        setIsEmployed(!isEmployed)
        console.log(isEmployed)
    }

    function handleNameChange(event) {
        setName(event.target.value)
    }

    function handleQuantityChange(event) {
        setQuantity(event.target.value)
    }

    function handleCommentChange(event) {
        setComment(event.target.value)
    }

    function handlePaymentChange(event) {
        setPayment(event.target.value)
    }

    function handleShippingChange(event) {
        setShipping(event.target.value)
    }

    function handleCarMakeChange(event) {
        setCar(car => ({...car, make: event.target.value}) )
    }

    function handleCarModelChange(event) {
        setCar(car => ({...car, model: event.target.value}) )
    }

    function handleCarYearChange(event) {
        setCar(car => ({...car, year: event.target.value}) )
    }

    function handleAddFood() {
        const newFood = document.getElementById("foodId").value;
        document.getElementById("foodId").value = "";

        setFoods(foods => [...foods, newFood]);
    }

    function handleRemoveFood(index) {
        setFoods(foods.filter((_, i) => i !== index));
    }

    //-----
    function handleAddCar() {
        const newCar = {year: carYear, make: carMake, model: carModel};
        setCars(cars => [...cars, newCar])
        setCarMake("");
        setCarModel("");
        setCarYear(new Date().getFullYear());
    }

    function handleRemoveCar(index) {
        setCars(cars.filter((_, i) => i !== index));
    }

    function handleIndividualCarMakeChange(event) {
        setCarMake(event.target.value);
        
    }

    function handleIndividualCarModelChange(event) {
        setCarModel(event.target.value);
    }

    function handleIndividualCarYearChange(event) {
        setCarYear(event.target.value);
    }
    //-----

    return(
        <div>
            <div>
                <hr/>
                <button onClick={handleClickRef1}>handleClickRef 1</button>
                <input ref={numberRef1}/>
                <button onClick={handleClickRef2}>handleClickRef 2</button>
                <input ref={numberRef2}/>
                <button onClick={handleClickRef3}>handleClickRef 3 </button>
                <input ref={numberRef3}/>
                <hr/>

            </div>
{/* ////// */}

            <h2>List of Foods</h2>
            <ul>
                {foods.map((food, index) => 
                                <li key={index}
                                    onDoubleClick={() => handleRemoveFood(index)}>
                                    {food}
                                </li>)}
                <input type="text" id="foodId" placeholder="Include the food"></input>
                <button onClick={handleAddFood}>Add Food</button>

            </ul>

            <hr></hr>
            <br/>
            <textarea value={comment} onChange = { (e) => handleCommentChange(e)} placeholder="Enter Delivery instructions"></textarea>
            <p>Comment: {comment}</p>

            <select value="{payment}" onChange={handlePaymentChange}>
                <option value="">Select an option</option>
                <option value="Master">Master</option>
                <option value="Visa">Visa</option>
                <option value="American">American</option>
                <option value="GiftCard">Gift Card</option>
                </select>
            <p>payment: {payment}</p>

            <label>
                <input type="radio"
                        value="Pick up"
                        checked={shipping === "Pick up"}
                        onChange={handleShippingChange} />
                Pick Up
            </label>
            <br/>
            <label>
                <input type="radio"
                        value="Delivery"
                        checked={shipping === "Delivery"}
                        onChange={handleShippingChange} /> 
                Delivery
            </label>
            <p>Shipping: {shipping}</p>

            <hr></hr>
            <p>Your car is {car.make}, {car.model} {car.year}</p>
            <input type="number" value={car.year} onChange={(e) => handleCarYearChange(e)}></input>
            <input type="text" value={car.make} onChange={handleCarMakeChange}></input>
            <input type="text" value={car.model} onChange={handleCarModelChange}></input>
            <hr></hr>


            <h1>List of Cars</h1>
            <ul>
                {cars.map((car, index) => 
                                <li key={index}
                                    onDoubleClick={() => handleRemoveCar(index)}>
                                    {car.model}, {car.make}, {car.year}
                                </li>)}

            </ul>            <input type="number" value={carYear} onChange={(e) => handleIndividualCarYearChange(e)} placeholder="Car Year"></input>
            <input type="text" value={carMake} onChange={handleIndividualCarMakeChange} placeholder="Car Make"></input>
            <input type="text" value={carModel} onChange={handleIndividualCarModelChange} placeholder="Car Model"></input>
            <button onClick={handleAddCar}>Add Car</button>
            <hr></hr>

            <input value={quantity} onChange = { (e) => handleQuantityChange(e)} type="number"></input>
            <p>Name: {quantity}</p>

            <input value={name} onChange = {(e) => handleNameChange(e)}></input>
            <p>Name: {name}</p>
            <button onClick={updateName}>Set Name</button>

            <p>Age: {age}</p>
            <button onClick={incrementAge}>Increment Age</button>

            <p>Is Employed: {isEmployed ? "Yes" : "No"}</p>
            <button onClick={toggleEmployedStatus}>Is Employed</button>
        </div>
    );
}

export default MyComponent ;