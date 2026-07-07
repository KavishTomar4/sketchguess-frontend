import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
import "./Createpage.css"   

function Createpage(){

    let location = useLocation()
    let user = location.state

    let navigate = useNavigate();

    let [maxPlayers, setMaxPlayers] = useState(8)
    let [rounds, setRounds] = useState(3)
    let [drawTime, setDrawTime] = useState(60)
    let [wordCount, setWordCount] = useState(3)

    let roomCreate = async(e)=>{
        e.preventDefault();

        let data = {
            username: user.username,
            settings: {
                maxPlayers: maxPlayers,
                rounds: rounds,
                drawTime: drawTime,
                wordCount: wordCount
            }
        }

        let response = await fetch('https://sketchguesser-backend.onrender.com/api/createroom', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            console.log("Failed to create room:", response.status)
            return
        }

        let json = await response.json();

        navigate(`/room/${json.code}`, {state : {code: json.code, username: json.username, settings: data.settings}})
    }


    return(
        
        <div id="create-page">
            <div id="create-card">
                <h2>Room Settings</h2>

                <form onSubmit={(e) => e.preventDefault()}>

                   
                    <div className="setting-field">
                        <label>Max Players (2-20)</label>
                        <input
                            type="number"
                            min="2"
                            max="20"
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(Number(e.target.value))}
                        />
                    </div>

                    <div className="setting-field">
                        <label>Rounds (2-10)</label>
                        <input
                            type="number"
                            min="2"
                            max="10"
                            value={rounds}
                            onChange={(e) => setRounds(Number(e.target.value))}
                        />
                    </div>

                    <div className="setting-field">
                        <label>Draw Time in seconds (15-240)</label>
                        <input
                            type="number"
                            min="15"
                            max="240"
                            value={drawTime}
                            onChange={(e) => setDrawTime(Number(e.target.value))}
                        />
                    </div>

                    <div className="setting-field">
                        <label>Word Choices (1-5)</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={wordCount}
                            onChange={(e) => setWordCount(Number(e.target.value))}
                        />
                    </div>

                    <button type="button" id="sbt-btn" onClick={roomCreate}>Create Room</button>
                </form>
            </div>
        </div>
    );

}

export default Createpage;