"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { useGetSurvey } from "@/hooks/api/survey";
import {
  useCompleteSubmission,
  useSaveAnswer,
  useStartSubmission,
  useUploadMedia,
} from "@/hooks/api/submission";
import { captureSnapshot, stopRecorderAndGetFile } from "@/lib/media";
import { useFaceDetection, useSurveyRecorder } from "@/hooks/survey";
import {
  WelcomeStep,
  PermissionStep,
  RecordingStep,
  CompletedStep,
  ErrorStep,
} from "@/components/survey/steps";
import { SurveyStep } from "@/types/survey";
import { cn } from "@/lib/utils";

const MAX_RETRIES = 2;
const QUESTION_TIME_LIMIT = 30;

export default function TakeSurveyPage() {
  const params = useParams();
  const surveyId = params.surveyId as string;

  const { data: survey, isLoading: loadingSurvey } = useGetSurvey({
    variables: { surveyId },
  });
  const startSubmission = useStartSubmission();
  const saveAnswer = useSaveAnswer();
  const uploadMedia = useUploadMedia();
  const completeSubmission = useCompleteSubmission();

  const [step, setStep] = useState<SurveyStep>("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [retryCount, setRetryCount] = useState(0);
  const [isTimingOut, setIsTimingOut] = useState(false);

  const {
    videoRef,
    mediaRecorderRef,
    recordedChunksRef,
    startStream,
    startRecording,
    stopStream,
    isStreamHealthy,
  } = useSurveyRecorder();

  const isRecordingPhase = step === "recording" || step === "submitting";

  const { isFaceDetected, faceScore } = useFaceDetection(
    videoRef,
    isRecordingPhase,
  );

  useEffect(() => {
    const stored = localStorage.getItem(`survey_${surveyId}`);
    if (stored) {
      try {
        const { submissionId: storedId, questionIndex } = JSON.parse(stored);
        setSubmissionId(storedId);
        setCurrentQuestionIndex(questionIndex);
        // Don't auto-jump to recording — camera isn't started yet.
        // The user will need to re-grant camera permission via handleStart.
        toast.info(
          "Previous progress found. Starting from where you left off.",
        );
      } catch {
        localStorage.removeItem(`survey_${surveyId}`);
      }
    }
  }, [surveyId]);

  useEffect(() => {
    if (submissionId) {
      localStorage.setItem(
        `survey_${surveyId}`,
        JSON.stringify({ submissionId, questionIndex: currentQuestionIndex }),
      );
    }
  }, [submissionId, currentQuestionIndex, surveyId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step === "recording" || step === "submitting") {
        e.preventDefault();
        return "Survey progress will be lost if you leave.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step]);

  useEffect(() => {
    if (
      "orientation" in screen &&
      screen.orientation &&
      typeof screen.orientation.lock === "function"
    ) {
      screen.orientation.lock("portrait").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!isRecordingPhase) return;

    const check = setInterval(() => {
      if (!isStreamHealthy()) {
        setStep("error");
        toast.error("Camera stream lost. Please retry.");
      }
    }, 2000);

    return () => clearInterval(check);
  }, [isRecordingPhase, isStreamHealthy]);

  useEffect(() => {
    if (step !== "recording" || isTimingOut) {
      setTimeLeft(QUESTION_TIME_LIMIT);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step, isTimingOut]);

  const handleAnswer = useCallback(
    async (answer: "yes" | "no" | null) => {
      // Allow null (skip) even without face. Block yes/no if no face.
      if (!isFaceDetected && answer !== null) return;
      if (!submissionId || !survey?.questions) return;

      setUploadError(null);
      setStep("submitting");

      const currentQuestion = survey.questions[currentQuestionIndex];
      const label = `q${currentQuestionIndex + 1}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        // Capture snapshot first (before stopping recorder)
        const imageFile = await captureSnapshot(videoRef.current!, label);

        // Stop recorder and collect video — onstop is set inside before stop()
        const videoFile = await stopRecorderAndGetFile(
          mediaRecorderRef.current!,
          recordedChunksRef.current,
          label,
        );

        await Promise.all([
          uploadMedia.mutateAsync({
            submissionId,
            questionId: currentQuestion.id,
            type: "video",
            file: videoFile,
            signal: controller.signal,
          }),
          uploadMedia.mutateAsync({
            submissionId,
            questionId: currentQuestion.id,
            type: "image",
            file: imageFile,
            signal: controller.signal,
          }),
        ]);

        await saveAnswer.mutateAsync({
          submissionId,
          answers: [
            {
              question_id: currentQuestion.id,
              answer: answer ?? "skipped",
              face_detected: isFaceDetected,
              face_score: faceScore,
            },
          ],
        });

        // Reset retry counter on success
        setRetryCount(0);

        const isLastQuestion =
          currentQuestionIndex >= survey.questions.length - 1;

        if (!isLastQuestion) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setStep("recording");
          startRecording();
        } else {
          await completeSubmission.mutateAsync({ submissionId });
          stopStream();
          localStorage.removeItem(`survey_${surveyId}`);
          setStep("completed");
        }
      } catch (err) {
        const isAbort = (err as Error).name === "AbortError";
        const message = isAbort
          ? "Upload timed out. Please check your connection."
          : (err as Error).message || "Upload failed. Retrying...";

        setUploadError(message);

        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);

        if (nextRetry > MAX_RETRIES) {
          // Auto-advance: skip this question after too many failures
          setRetryCount(0);
          const isLastQuestion =
            currentQuestionIndex >= (survey.questions?.length ?? 0) - 1;
          if (!isLastQuestion) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setStep("recording");
            startRecording();
          } else {
            await completeSubmission.mutateAsync({ submissionId });
            stopStream();
            localStorage.removeItem(`survey_${surveyId}`);
            setStep("completed");
          }
        } else {
          setStep("recording");
          startRecording();
        }
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [
      isFaceDetected,
      submissionId,
      survey,
      currentQuestionIndex,
      faceScore,
      retryCount,
      surveyId,
      videoRef,
      mediaRecorderRef,
      recordedChunksRef,
      uploadMedia,
      saveAnswer,
      completeSubmission,
      startRecording,
      stopStream,
    ],
  );

  const handleTimeout = useCallback(async () => {
    if (isTimingOut) return;
    setIsTimingOut(true);

    const recorder = mediaRecorderRef.current;

    // Gracefully stop the recorder before discarding
    if (recorder && recorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => {
          recorder.onstop = null;
          resolve();
        };
        recorder.stop();
      });
    }

    // Clear stale chunks for the next segment
    recordedChunksRef.current = [];

    setUploadError("Time limit exceeded.");
    setIsTimingOut(false);

    const nextRetry = retryCount + 1;
    setRetryCount(nextRetry);

    if (nextRetry > MAX_RETRIES) {
      // Too many timeouts — skip this question entirely
      await handleAnswer(null);
    } else {
      setTimeLeft(QUESTION_TIME_LIMIT);
      setStep("recording");
      startRecording();
    }
  }, [
    isTimingOut,
    retryCount,
    mediaRecorderRef,
    recordedChunksRef,
    handleAnswer,
    startRecording,
  ]);

  useEffect(() => {
    if (timeLeft === 0 && step === "recording" && !isTimingOut) {
      handleTimeout();
    }
  }, [timeLeft, step, isTimingOut, handleTimeout]);

  const handleStart = async () => {
    setStep("permission");
    const streamSuccess = await startStream();

    if (!streamSuccess) {
      toast.error("Camera access was denied or unavailable.");
      setStep("error");
      return;
    }

    try {
      // If resuming, skip creating a new submission
      if (!submissionId) {
        const submission = await startSubmission.mutateAsync({ surveyId });
        setSubmissionId(submission.id);
      }
      setStep("recording");
      startRecording();
    } catch {
      toast.error("Failed to initialize the survey on the server.");
      setStep("error");
    }
  };

  if (loadingSurvey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!survey || !survey.is_active || survey.questions?.length !== 5) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <CardTitle>Survey Unavailable</CardTitle>
            <CardDescription>
              This survey is either inactive, does not exist, or has invalid
              questions.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalQuestions = 5;
  const progressPct = (currentQuestionIndex / totalQuestions) * 100;
  const isInteractionDisabled =
    step === "submitting" ||
    !isFaceDetected ||
    timeLeft <= 0 ||
    isTimingOut ||
    retryCount > MAX_RETRIES;

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
          isRecordingPhase
            ? "opacity-40 dark:opacity-30"
            : "opacity-0 pointer-events-none",
        )}
        aria-label="Live camera feed for face detection"
      />

      {isRecordingPhase && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-0" />
      )}

      <div className="relative z-20 w-full max-w-2xl">
        {step === "welcome" && (
          <WelcomeStep
            survey={survey}
            onStart={handleStart}
            isPending={startSubmission.isPending}
          />
        )}
        {step === "permission" && <PermissionStep />}
        {isRecordingPhase && (
          <RecordingStep
            survey={survey}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            progressPct={progressPct}
            uploadError={uploadError}
            isFaceDetected={isFaceDetected}
            step={step}
            isInteractionDisabled={isInteractionDisabled}
            onAnswer={handleAnswer}
            timeLeft={timeLeft}
            retryCount={retryCount}
            maxRetries={MAX_RETRIES}
          />
        )}
        {step === "completed" && <CompletedStep />}
        {step === "error" && (
          <ErrorStep
            onRetry={() => {
              setStep("welcome");
              setCurrentQuestionIndex(0);
              setSubmissionId(null);
              setUploadError(null);
              setRetryCount(0);
              setTimeLeft(QUESTION_TIME_LIMIT);
            }}
          />
        )}
      </div>
    </div>
  );
}
