import React from "react";
import socket from "./socket";
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router";
import Canvas from "./Canvas";
import "./Room.css"
import words from "../words.json"


function Room(){

    let {roomid} = useParams()
    let [content, setContent] = useState(null)
    let location = useLocation()
    let [members, setMembers] = useState([])
    let textMessage = useRef(null)
    let [messages, setMessages] = useState([])
    let chatEndRef = useRef(null)

    let settings = location.state.settings || {}
    let maxWords = settings.wordCount || 3
    let maxRounds = settings.rounds || 3
    let drawTime = settings.drawTime || 40

    let [seconds, setSeconds] = useState(drawTime)
    let [turns, setTurns] = useState(0)
    let [currentRound, setCurrentRound] = useState(1)
    let [currentDrawer, setCurrentDrawer] = useState(null)
    let [canDraw, setCanDraw] = useState(false)
    let [turnMessage, setTurnMessage] = useState("")
    let wordsJSON = Object.values(words).flat()
    let [randomWords, setRandomWords] = useState([])
    let [showWordModal, setShowWordModal] = useState(false)

    let [hint, setHint] = useState("")

    let [roundScores, setRoundScores] = useState([])
    let [showScoreboard, setShowScoreboard] = useState(false)
    let [gameOver, setGameOver] = useState(false)
    let [revealedWord, setRevealedWord] = useState("")
    let [liveScores, setLiveScores] = useState([])

    let [isHost, setIsHost] = useState(false)

    let [readyList, setReadyList] = useState({})

    let [gameStarted, setGameStarted] = useState(false)

    let [codeCopied, setCodeCopied] = useState(false)

    let hasJoinedRef = useRef(false)

    /*useEffect(() => {
        let secondInterval = setInterval(() => {
            setSeconds(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(secondInterval);
    }, []);*/

    useEffect(()=>{

        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

        if (!hasJoinedRef.current) {
            hasJoinedRef.current = true

            socket.emit("join_room", {
                roomcode: roomid,
                username: location.state.username,
                settings: settings
            })
        }

        socket.on('received_content', (data) => {
            setMembers(data.members)
        })

        socket.on('broadcast_message', (data)=>{
            setMessages(prev => [...prev, data])
        })

        socket.on("timer_update", (data)=>{
            setSeconds(data.seconds)
            if (data.rounds !== undefined) {
                setCurrentRound(data.rounds)
            }
        })

        socket.on('player_turn', (data) => {
            setCurrentDrawer(data.player);
            setCanDraw(data.player === location.state.username);
            
        });

        socket.on('round_scores', (data)=>{
            setRoundScores(data.scores)
            setRevealedWord(data.word)
            setShowScoreboard(true)

            setTimeout(() => {
                setShowScoreboard(false)
            }, 5000)
        })

        socket.on('game_over', (data)=>{
            setRoundScores(data.scores)
            setGameOver(true)
            setShowScoreboard(true)
        })

        socket.on('score_update', (data)=>{
            setLiveScores(data)
        })

        socket.on('lobby_update', (data) => {
            setIsHost(data.host === location.state.username)
            setReadyList(data.ready)
        })

        socket.on('game_started', () => {
            setGameStarted(true)
        })

        socket.on('word_hint', (data) => {
            setHint(data.hint)
        })

        return ()=>{
            socket.off('player_turn')
            socket.off('received_content')
            socket.off('broadcast_message')
            socket.off('timer_update')
            socket.off('round_scores')
            socket.off('game_over')
            socket.off('score_update')
            socket.off('lobby_update')
            socket.off('game_started')
            socket.off('word_hint')
        }

    }, [])

    useEffect(()=>{

        if (canDraw) {
            let selected = []

            for (let i = 0; i < maxWords; ) {
                let word = wordsJSON[Math.floor(Math.random() * wordsJSON.length)]

                if (selected.includes(word)) {
                    continue
                } else {
                    selected.push(word)
                    i++
                }
            }

            setRandomWords(selected)
            setShowWordModal(true);
        }else{

            setShowWordModal(false);

        }

    }, [canDraw])

    let chooseWord = (word) => {
        socket.emit("word_chosen", { roomcode: roomid, word: word });
        setShowWordModal(false);
    };

    let markReady = () => {
        socket.emit('player_ready', { roomcode: roomid, username: location.state.username })
    }

    let startGame = () => {
        socket.emit('start_game', {
            roomcode: roomid,
            username: location.state.username,
            settings: settings
        })
    }

    let copyRoomCode = () => {
        navigator.clipboard.writeText(roomid)
        setCodeCopied(true)
        setTimeout(() => setCodeCopied(false), 2000)
    }

    let sendMessage = ()=>{

        let text = textMessage.current.value
        socket.emit("send_message", {username: location.state.username, roomcode: roomid, message: text})

    }


    return(
        <>

        {showWordModal && (
        <div id="word-modal-overlay">
            <div id="word-modal">
                <h2>Choose a word to draw</h2>
                <div id="word-options">
                    {randomWords.map((word, index) => (
                        <button key={index} onClick={() => chooseWord(word)}>
                            {word}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )}

        {showScoreboard && (
        <div id="scoreboard-overlay">
            <div id="scoreboard">
                <h2>{gameOver ? "Final Scores" : "Scoreboard"}</h2>

                {!gameOver && revealedWord && (
                    <p>The word was: <b>{revealedWord}</b></p>
                )}

                <ul>
                    {roundScores.map((player, index) => {
                        let medal = ""
                        if (gameOver) {
                            if (index === 0) medal = "🥇 "
                            else if (index === 1) medal = "🥈 "
                            else if (index === 2) medal = "🥉 "
                        }

                        return (
                            <li key={index}>
                                <span>{medal}{player.username}</span>
                                <span>{player.score} pts</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )}

    {!gameStarted && (
        <div id="lobby-overlay">
            <div id="lobby">
                <h2>Waiting Room</h2>

                <div id="room-code-box">
                    <span>Room Code: <b>{roomid}</b></span>
                    <button onClick={copyRoomCode}>{codeCopied ? "Copied!" : "Copy"}</button>
                </div>

                <p>
                    Rounds: {maxRounds} | Draw Time: {drawTime}s | Word Choices: {maxWords}
                </p>

                <ul>
                    {members.map(member => (
                        <li key={member}>
                            <span>
                                {member}
                                {member === location.state.username && isHost && " (You — Host)"}
                            </span>
                            <span>
                                {member !== location.state.username && readyList[member] !== undefined && (
                                readyList[member] ? "Ready" : "Not Ready"
                                )}
                            </span>
                        </li>
                    ))}
                </ul>

                {!isHost && (
                    <button onClick={markReady}>I'm Ready</button>
                )}

                {isHost && (
                    <button onClick={startGame}>Start Game</button>
                )}
            </div>
        </div>
    )}

       {gameStarted && (
        <>
        <div id="top-info-bar">
            <span className="drawer-label">{currentDrawer} is drawing</span>
            <span className="round-label">Round {currentRound}/{maxRounds}</span>
            <span className="timer-label">⏱ {seconds}s</span>
            {!canDraw && hint && (
                <span className="hint-label">{hint}</span>
            )}
        </div>

        <div id = "main-container">
            <div id = "display-members">
                
                {members.map(member =>{
                    let rank = liveScores.findIndex(p => p.username === member) + 1
                    let playerData = liveScores.find(p => p.username === member)
                    let points = playerData ? playerData.score : 0

                    return (
                        <p key={member}>
                            {rank > 0 ? `#${rank}` : ""} {member} — {points} pts
                        </p>
                    )
                })}
            </div>
            <div id = "canvas-container">
                <Canvas isDrawer={canDraw}/>
            </div>
            <div id = "chat-container">
                <div id = "chats">
                    <div id="chats-inner">
                        {messages.map((msg, index) => (
                            msg.system ? (
                                <p key={index} className="system-message">{msg.message}</p>
                            ) : (
                                <p key={index}><b>{msg.username}:</b> {msg.message}</p>
                            )
                        ))}
                    <div ref={chatEndRef}/>
                </div>
    
                </div>
                <div id = "text-input">
                        <input type = "text" name = "message" id = "message-field" name = "Message..." ref={textMessage}/>
                        <button onClick={sendMessage}>Send</button>
                </div>    
            </div>   
        </div>
        </>
       )}
        </>
    );

}


export default Room