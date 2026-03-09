import { useState, useRef, useCallback, useEffect } from "react";

export function useSurveyRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Picks the best supported mimeType for this browser
  const getSupportedMimeType = (): string => {
    const candidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];
    return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
  };

  const startStream = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait until the video element has enough data to render frames,
        // so MediaPipe / canvas ops don't fire on a blank frame.
        await new Promise<void>((resolve) => {
          const v = videoRef.current!;
          if (v.readyState >= 2) {
            resolve();
          } else {
            v.onloadeddata = () => resolve();
          }
        });
      }

      return true;
    } catch {
      setError("Camera access denied or unavailable.");
      return false;
    }
  };

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    // Always clear previous chunks before a new segment starts
    recordedChunksRef.current = [];

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(
      streamRef.current,
      mimeType ? { mimeType } : undefined,
    );

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    // Collect a chunk every second so we always have partial data
    // even if stop() fires before the first chunk would otherwise arrive
    recorder.start(1000);
    mediaRecorderRef.current = recorder;
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const isStreamHealthy = useCallback((): boolean => {
    if (!streamRef.current) return false;
    return streamRef.current
      .getTracks()
      .every((track) => track.readyState === "live");
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopStream]);

  return {
    videoRef,
    canvasRef,
    mediaRecorderRef,
    recordedChunksRef,
    startStream,
    startRecording,
    stopStream,
    error,
    isStreamHealthy,
  };
}
