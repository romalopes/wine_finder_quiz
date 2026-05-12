import ComponentD from "./ComponentD";
import React, {useContext} from "react";
import { AgeContext } from "./ComponentA";

function ComponentC(props) {
    const age = useContext(AgeContext);
    return(
        <>
            <div className="box">
                <h1>ComponentC</h1>
                <h2>Hello {props.user} -  {age}</h2>
                <ComponentD user={props.user}></ComponentD>
            </div>
        </>
    );
}

export default ComponentC;