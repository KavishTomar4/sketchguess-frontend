import { io } from 'socket.io-client';

let URL =  'https://sketchguesser-backend.onrender.com';

let socket = io(URL, {
    withCredentials: true
});

export default socket;