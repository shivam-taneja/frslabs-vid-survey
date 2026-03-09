"use client";

import { useState } from "react";
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

  const {
    videoRef,
    mediaRecorderRef,
    recordedChunksRef,
    startStream,
    startRecording,
    stopStream,
  } = useSurveyRecorder();

  const isRecordingPhase = step === "recording" || step === "submitting";
  const { isFaceDetected, faceScore } = useFaceDetection(
    videoRef,
    isRecordingPhase,
  );

  const handleStart = async () => {
    setStep("permission");
    const streamSuccess = await startStream();

    if (streamSuccess) {
      try {
        const submission = await startSubmission.mutateAsync({ surveyId });
        setSubmissionId(submission.id);
        setStep("recording");
        startRecording();
      } catch {
        toast.error("Failed to initialize the survey on the server.");
        setStep("error");
      }
    } else {
      toast.error("Camera access was denied or unavailable.");
      setStep("error");
    }
  };

  const handleAnswer = async (answer: "yes" | "no") => {
    if (!isFaceDetected || !submissionId || !survey?.questions) return;

    setUploadError(null);
    setStep("submitting");

    const currentQuestion = survey.questions[currentQuestionIndex];
    const label = `q${currentQuestionIndex + 1}`;

    try {
      const imageFile = await captureSnapshot(videoRef.current!, label);
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
        }),
        uploadMedia.mutateAsync({
          submissionId,
          questionId: currentQuestion.id,
          type: "image",
          file: imageFile,
        }),
      ]);

      await saveAnswer.mutateAsync({
        submissionId,
        answers: [
          {
            question_id: currentQuestion.id,
            answer,
            face_detected: isFaceDetected,
            face_score: faceScore,
          },
        ],
      });

      const totalQuestions = survey.questions.length;
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setStep("recording");
        startRecording();
      } else {
        await completeSubmission.mutateAsync({ submissionId });
        stopStream();
        setStep("completed");
      }
    } catch (err) {
      setUploadError(
        (err as Error).message ||
          "An error occurred while uploading. Please try again.",
      );
      setStep("recording");
      startRecording();
    }
  };

  if (loadingSurvey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!survey || !survey.is_active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <CardTitle>Survey Unavailable</CardTitle>
            <CardDescription>
              This survey is either inactive or does not exist.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalQuestions = survey.questions?.length ?? 5;
  const progressPct = (currentQuestionIndex / totalQuestions) * 100;
  const isInteractionDisabled = step === "submitting" || !isFaceDetected;

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
      />

      {isRecordingPhase && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-0" />
      )}

      <div className="relative z-10 w-full max-w-2xl">
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
            }}
          />
        )}
      </div>
    </div>
  );
}
