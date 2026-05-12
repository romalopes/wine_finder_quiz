import ComponentC from "./ComponentC";
import React, {useContext} from "react";
import { AgeContext } from "./ComponentA";

function ComponentB(props) {
    const age = useContext(AgeContext);
    return(
        <>
            <div className="box">
                <h1>ComponentB</h1>
                <h2>Hello {props.user} - {age}</h2>
                <ComponentC user={props.user}></ComponentC>
            </div>
        </>
    );
}

export default ComponentB ;