import { useState, useRef, useCallback, useEffect } from "react";

export function useSurveyRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch {
      setError("Camera access denied or unavailable.");
      return false;
    }
  };

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    const recorder = new MediaRecorder(streamRef.current);
    recordedChunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.start(1000);
    mediaRecorderRef.current = recorder;
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  return {
    videoRef,
    mediaRecorderRef,
    recordedChunksRef,
    startStream,
    startRecording,
    stopStream,
    error,
  };
}
