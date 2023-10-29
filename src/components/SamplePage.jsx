import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const RECORD_TIME = 10;
const PREPARE_TIME = 5;

const SamplePage = ({ samples }) => {
  const { sampleTitle } = useParams();
  const sample = samples.find(s => s.title.toLowerCase() === decodeURIComponent(sampleTitle).toLowerCase());

  const [status, setStatus] = useState('Ready to Start');
  const [phase, setPhase] = useState('idle');
  const [prepareTime, setPrepareTime] = useState(PREPARE_TIME);
  const [recordTime, setRecordTime] = useState(RECORD_TIME);
  const [recordings, setRecordings] = useState([]);
  const [speechText, setSpeechText] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const activeStream = useRef(null); 

  const query = async (audioBlob) => {
    const response = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large-v2", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/octet-stream",
      },
      body: audioBlob,
    });
    const result = await response.json();
    return result;
  };

  const sendToBackend = async (recentRecording) => {
    try {
      const response = await query(recentRecording);
      console.log("Hugging Face API response:", response);
      setSpeechText(response.text);
    } catch (error) {
      console.log("Error in sending data to backend:", error);
    }
  };

  const toggleRecording = async () => {
    if (phase === 'idle') {
      navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        activeStream.current = stream;
        const newMediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(newMediaRecorder);
      })
      .catch(err => {
        console.log("Error initializing media recorder: ", err);
      });
      setPhase('preparing');
    } else if (phase === 'recording' || phase === 'preparing') {
      setPhase('idle');

      if (activeStream.current) {
        activeStream.current.getTracks().forEach(track => track.stop());
        activeStream.current = null;
      }
    }
  };

  useEffect(() => {
    if (mediaRecorder) {
      let audioChunks = [];
  
      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };
  
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings(prevRecordings => [...prevRecordings, audioUrl]);
        sendToBackend(audioBlob);
        audioChunks = [];
      };
    }
  }, [mediaRecorder]);
  
  useEffect(() => {
    let timer;
  
    if (phase === 'preparing') {
      setStatus('Preparing...');
      setPrepareTime(PREPARE_TIME);
      timer = setInterval(() => {
        setPrepareTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setPhase('recording');
            return PREPARE_TIME;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (phase === 'recording') {
      setStatus('Recording...');
      setRecordTime(RECORD_TIME);
      if (mediaRecorder && mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
      }
      timer = setInterval(() => {
        setRecordTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
            setPhase('idle');
            return RECORD_TIME;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (phase === 'idle') {
      if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'inactive')) {
        mediaRecorder.stop();
        setStatus('Stop');
      }
    } else {
      setStatus('Ready to Start');
    }
  
    return () => clearInterval(timer);
  }, [phase, mediaRecorder]);
    

  if (!sample) return <div>Sample not found</div>;

  return (
    <div className="SamplePage">
      <h1>{sample.title}</h1>
      <p>{sample.content}</p>
      <p>Converted Text: {speechText}</p>
      <button onClick={toggleRecording}>
        {phase === 'idle' ? 'Start' : (phase === 'preparing' ? 'Preparing...' : 'Stop')}
      </button>
      <p>Status: {status}</p>
      {phase === 'preparing' && (
        <div>
          <progress value={prepareTime} max={PREPARE_TIME}></progress>
          <span> Time left: {prepareTime}s </span>
        </div>
      )}
      {phase === 'recording' && (
        <div>
          <progress value={recordTime} max={RECORD_TIME}></progress>
          <span> Time left: {recordTime}s </span>
        </div>
      )}
      <ul>
        {recordings.map((recording, index) => (
          <li key={index}>
            <audio controls src={recording}></audio>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SamplePage;