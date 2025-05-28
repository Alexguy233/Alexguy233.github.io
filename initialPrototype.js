//npx serve . to run in terminal. Only works in cmd prompt, not powershell
//Runs out of localhost:3000, the database is 33060 port. There is an extra
//zero so the database tool mysql tools knows its local. 
//Sql username is root and password is password
//import {
//   addUser
//} from './database.js';

const mic_btn = document.querySelector('#mic');
const playback = document.querySelector('.playback');
const apiUrl = 'http://localhost:8080';
const submit_btn = document.querySelector('#submit');

mic_btn.addEventListener('click', ToggleMic);
submit_btn.addEventListener('click', submitToDB);

let can_record = false;
let is_recording = false;

let recorder = null;//your microphone

let chunks = [];

let blobRecording = new Blob([], {type: "audio/ogg; codecs=opus"});
setupAudio();

 //Gets us access to the microphone
function setupAudio(){
    console.log("Setup");
    //checking if these exist and media api is available and we can access mic
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(SetupStream)
        .catch(err => {console.error(err)})
    }
}

function SetupStream(stream) {
    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = e => {
        chunks.push(e.data); //creates a chunk of data pushing every so often
    }

    recorder.onstop = e => {
        blobRecording = new Blob(chunks, {type: "audio/ogg; codecs=opus"}); //set compression and filetype of whats saved
        chunks = [];
        const audioURL = window.URL.createObjectURL(blobRecording);
        playback.src = audioURL;
    }

    can_record = true;
}

function ToggleMic() {
    if(!can_record) return;

    is_recording = !is_recording;

    if(is_recording){
        recorder.start(); //plays animation
        mic_btn.classList.add("is-recording");
    }
    else {
        recorder.stop();
        mic_btn.classList.remove("is-recording");
    }
}

//measures is the first and last name
async function submitToDB(){
    //console.log("submit pressed");
    //check if a recording exists
    //if(blobRecording === null){
        console.log("within submittodb");
        let firstName = document.querySelector('#firstname').value;
        let lastName = document.querySelector('#lastname').value;
        let voiceRecording = blobToBytea(blobRecording);
        if(firstName !=="" && lastName !==""){    
            let measures =[firstName, lastName];
            let recording = [firstName, lastName, voiceRecording];
            try {
                //Submit user first and last name
                console.log("about to fetch");
                await fetch("/submituser", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(measures)
                });
                
                //Submit Audio Recording
                console.log("about to fetch recording");
                await fetch('/submitrecording', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(recording)
                });
            } catch (error) {
                console.error('Error:', error);
            }
        }
    //}
}

async function blobToBytea(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return uint8Array;
}