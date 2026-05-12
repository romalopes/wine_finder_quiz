import PropTypes, { bool } from "prop-types";

function UserGreeting(props) {

    // if(props.isLoggedIn)
    // {
    //     return(
    //         <>
    //             <h2>Welcome {props.userName}</h2>
    //             <hr></hr>
    //         </>
    //      )
    // }
    // else {
    //     return(
    //     <>
    //         <h2>Not Logged in</h2>
    //         <hr></hr>
    //     </>
    //     );
    // }
    // return(props.isLoggedIn ? <h2>Welcome {props.userName}</h2> : <h2>Not Logged in</h2> );
    const welcomeMessage    = <h2 className="welcome-message">Welcome {props.userName}</h2>
    const loginPrompt       = <h2 className="login-prompt">Not Logged in {props.userName}</h2>
    return(
        <>
            {props.isLoggedIn ? welcomeMessage : loginPrompt} 
            <hr></hr>
        </>
    )
}
UserGreeting.PropTypes = {
    isLoggedIn: PropTypes.bool,
    userName: PropTypes.string,
}
export default UserGreeting ;