import { useEffect, useState, RefObject } from "react";

export function useFaceDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  isActive: boolean,
) {
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [faceScore, setFaceScore] = useState(0);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    let animationFrameId: number;

    const detectFace = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        // TODO: Replace with actual MediaPipe/face-api.js logic
        // Example logic:
        // const detections = await detector.detect(videoRef.current);
        // const hasFace = detections.length === 1;

        // Simulated logic:
        const hasFace = true;
        setIsFaceDetected(hasFace);
        setFaceScore(hasFace ? 95 : 0);
      }
      animationFrameId = requestAnimationFrame(detectFace);
    };

    detectFace();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, videoRef]);

  return { isFaceDetected, faceScore };
}
