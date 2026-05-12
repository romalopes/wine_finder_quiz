import React, {useContext} from "react";
import { AgeContext } from "./ComponentA";

function ComponentD(props) {
    const age = useContext(AgeContext);

    return(
        <>
            <div className="box">
                <h1>ComponentD</h1>
                <h2>Hello {props.user} - {age}</h2>
            </div>
        </>
    );
}

export default ComponentD;