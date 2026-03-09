import { useEffect, useState, useRef } from "react";
import type {
  FaceDetection as FaceDetectionType,
  Results,
} from "@mediapipe/face_detection";

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean,
) {
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [faceScore, setFaceScore] = useState(0);
  const [faceBox, setFaceBox] = useState<FaceBox | null>(null);

  const detectorRef = useRef<FaceDetectionType | null>(null);
  const animFrameRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      isRunningRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
      setIsFaceDetected(false);
      setFaceScore(0);
      setFaceBox(null);
      return;
    }

    let cancelled = false;

    const initAndRun = async () => {
      try {
        const { FaceDetection } = await import("@mediapipe/face_detection");

        const detector = new FaceDetection({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`,
        });

        detector.setOptions({
          model: "short",
          minDetectionConfidence: 0.5,
        });

        detector.onResults((results: Results) => {
          if (cancelled) return;

          const detections = results?.detections ?? [];
          const hasSingleFace = detections.length === 1;

          setIsFaceDetected(hasSingleFace);

          if (hasSingleFace) {
            const bbox = detections[0].boundingBox;
            setFaceBox({
              x: bbox.xCenter - bbox.width / 2,
              y: bbox.yCenter - bbox.height / 2,
              width: bbox.width,
              height: bbox.height,
            });

            const area = bbox.width * bbox.height;
            const areaScore = Math.min(area * 4, 1); // normalize: ~0.25 area = full score
            const score = Math.round((0.5 + areaScore * 0.5) * 100); // range: 50–100

            setFaceScore(score);
          } else {
            setFaceBox(null);
            setFaceScore(0);
          }
        });

        await detector.initialize();

        if (cancelled) {
          detector.close();
          return;
        }

        detectorRef.current = detector;
        isRunningRef.current = true;

        // rAF loop — calls send() to push a frame, results arrive via onResults()
        const runDetection = async () => {
          if (!isRunningRef.current || cancelled) return;

          const video = videoRef.current;

          if (
            video &&
            video.readyState >= 2 && // HAVE_CURRENT_DATA
            video.videoWidth > 0 &&
            !video.paused &&
            !video.ended
          ) {
            try {
              // send() triggers onResults() — do NOT await a return value
              await detector.send({ image: video });
            } catch {
              // Single bad frame — skip silently
            }
          }

          animFrameRef.current = requestAnimationFrame(runDetection);
        };

        animFrameRef.current = requestAnimationFrame(runDetection);
      } catch (err) {
        console.error("Failed to initialize face detector:", err);
      }
    };

    initAndRun();

    return () => {
      cancelled = true;
      isRunningRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
      detectorRef.current?.close();
      detectorRef.current = null;
    };
  }, [isActive, videoRef]);

  return { isFaceDetected, faceScore, faceBox };
}
