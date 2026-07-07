import React from "react";
import { Link } from "react-router";
import { useRef, useState } from "react";
import "./Titlepage.css" 


function Titlepage(){

    let [inputValue, setInputValue] = useState('');

    let guestNumberRef = useRef(Math.floor(Math.random() * 1000))

    let handleChange = (event) => {
        setInputValue(event.target.value); 
    };

    let playerName = inputValue !== '' ? inputValue : `Player ${guestNumberRef.current}`

    return(
        <div id="title-page">
            <div id="title-card">
                <h2>Enter your name to play</h2>

                <input
                    type="text"
                    id="username-input"          
                    name="username"
                    placeholder="Your name"       
                    value={inputValue}
                    onChange={handleChange}
                />

                <div className="button-row">      
                    <Link to='/createroom' state={{username: playerName}}>
                        <button id="create-room">Create Room</button>
                    </Link>
                    <Link to='/joinroom' state={{username: playerName}}>
                        <button id="join-room">Join Room</button>
                    </Link>
                </div>
            </div>
        </div>
    );

}


export default Titlepage