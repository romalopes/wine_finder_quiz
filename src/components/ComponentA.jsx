import { useState, createContext } from "react";
import ComponentB from "./ComponentB";

export const AgeContext = createContext();

function ComponentA() {
  const [user, setUser] = useState("Anderson");
  const [age, setAge] = useState(50);
  return (
    <>
      <div className="box">
        <h1>ComponentA</h1>
        <h2>
          Hello {user} - {age}
        </h2>
        <AgeContext.Provider value={age}>
          <ComponentB user={user}></ComponentB>
        </AgeContext.Provider>
      </div>
    </>
  );
}

export default ComponentA;
