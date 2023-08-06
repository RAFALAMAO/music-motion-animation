import React, { useEffect, useRef, useState } from 'react';

const MusicRhythmComponent = () => {
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const boxRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const bufferLength = 128; // Adjust the buffer size for analysis

  // Function to update the component's position based on the music rhythm
  const updatePosition = (dataArray) => {
    // Calculate the average amplitude of the audio data for a specific frequency range
    const frequencyData = dataArray.slice(0, bufferLength / 4); // Use only the first quarter of the data
    const sum = frequencyData.reduce((acc, val) => acc + val, 0);
    const avgAmplitude = sum / frequencyData.length;

    // Map the average amplitude to the container width
    const containerWidth = boxRef.current.clientWidth;
    const newPosition = (avgAmplitude / 256) * containerWidth * 3;
    setPosition(newPosition);
  };

  // Function to start the animation loop
  const startAnimationLoop = () => {
    const dataArray = new Uint8Array(bufferLength);

    animationRef.current = requestAnimationFrame(function loop() {
      analyserRef.current.getByteFrequencyData(dataArray);
      updatePosition(dataArray);

      animationRef.current = requestAnimationFrame(loop);
    });
  };

  // Function to stop the animation loop
  const stopAnimationLoop = () => {
    cancelAnimationFrame(animationRef.current);
  };

  // Toggle play/pause of the audio
  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
      stopAnimationLoop();
    } else {
      audioRef.current.play();
      startAnimationLoop();
    }
    setIsPlaying(!isPlaying);
  };

  // Initialize the audio context and analyser
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    audioRef.current = new Audio('space-odyssey.mp3');
    const audioSource = audioContext.createMediaElementSource(audioRef.current);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = bufferLength * 2;
    analyserRef.current = analyser;

    // Clean up the audio context on component unmount
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      stopAnimationLoop();
      analyser.disconnect();
      audioSource.disconnect();
      audioContext.close();
    };
  }, []);

  // Update the box position with the component's position
  useEffect(() => {
    const box = boxRef.current;
    box.style.transform = `translateX(${position}px)`;
  }, [position]);

  return (
    <div>
      <div
        ref={boxRef}
        style={{
          width: '400px',
          height: '400px',
          position: 'relative',
          transition: 'transform 50ms ease-in-out',
        }}
      >
        <img src='space-ship.png' alt='mario' style={{width: '400px'}}/>
      </div>
      <button onClick={toggleAudio}>{isPlaying ? 'Pause' : 'Play'}</button>
    </div>
  );
};

export default MusicRhythmComponent;
