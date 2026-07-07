import React from "react";
import { useNavigate, useLocation } from "react-router";
import "./Joinroom.css" 


function Joinroom(){

    let location = useLocation()
    let user = location.state

    let navigate = useNavigate();

    let Join = async(e)=>{
        e.preventDefault()
        
        let roomcode = document.getElementById("room-code").value
        let data = {username: user.username, roomcode: roomcode}

        let response = await fetch('https://sketchguesser-backend.onrender.com/api/joinroom', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        let json;
        if(response.ok)
            json = await response.json()

        navigate(`/room/${json.code}`, {state : {code: json.code, username: json.username, settings: json.settings}})

    }

    return(
        <div id="join-page">
        <div id="join-card">
            <h2>Join a Room</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <input type="text" name="roomcode" id="room-code" placeholder="Room Code"/>
                <button type="button" id="join-btn" onClick={Join}>Join</button>
            </form>
        </div>
    </div>
    );


}


export default Joinroom