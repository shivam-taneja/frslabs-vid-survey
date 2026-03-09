import {
  Loader2,
  Camera,
  Check,
  X,
  AlertTriangle,
  ShieldCheck,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SurveyQuestion, SurveyStep } from "@/types/survey";

export interface SurveyData {
  title: string;
  questions: SurveyQuestion[];
}

export interface WelcomeStepProps {
  survey: SurveyData;
  onStart: () => void;
  isPending: boolean;
}

export interface RecordingStepProps {
  survey: SurveyData;
  currentQuestionIndex: number;
  totalQuestions: number;
  progressPct: number;
  uploadError: string | null;
  isFaceDetected: boolean;
  step: SurveyStep;
  isInteractionDisabled: boolean;
  onAnswer: (answer: "yes" | "no" | null) => void;
  timeLeft: number;
  retryCount: number;
  maxRetries: number;
}

export interface ErrorStepProps {
  onRetry: () => void;
}

export function WelcomeStep({ survey, onStart, isPending }: WelcomeStepProps) {
  return (
    <Card className="border-border/60 shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Camera className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-3xl font-semibold">{survey.title}</CardTitle>
        <CardDescription className="text-base mt-3 leading-relaxed">
          This survey requires camera access. A short video segment will be
          recorded per question for automated face detection. No personal
          information is stored.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/60 border border-border/40">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Privacy first.</span>{" "}
            We do not collect your name, email, or any personal identifiers.
            Only system metadata is recorded.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={onStart}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          Grant Camera Access & Begin
        </Button>
      </CardContent>
    </Card>
  );
}

export function PermissionStep() {
  return (
    <Card className="border-border/60 shadow-xl text-center p-12">
      <Loader2 className="w-12 h-12 mx-auto mb-5 animate-spin text-primary" />
      <CardTitle className="text-xl mb-2">Requesting Permissions…</CardTitle>
      <CardDescription>
        Please allow camera access in your browser prompt.
      </CardDescription>
    </Card>
  );
}

export function RecordingStep({
  survey,
  currentQuestionIndex,
  totalQuestions,
  progressPct,
  uploadError,
  isFaceDetected,
  step,
  isInteractionDisabled,
  onAnswer,
  timeLeft,
  retryCount,
  maxRetries,
}: RecordingStepProps) {
  return (
    <div className="space-y-5">
      <Progress value={progressPct} className="h-1.5" />
      <Card className="bg-background/85 backdrop-blur-xl border-border/50 shadow-2xl relative">
        <CardHeader className="text-center pb-6">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-destructive/10 text-destructive font-mono font-semibold text-sm px-3 py-1 rounded-full border border-destructive/20">
            <Timer className="w-3.5 h-3.5" />
            00:{timeLeft.toString().padStart(2, "0")}
          </div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
          <CardTitle className="text-2xl sm:text-3xl font-medium leading-snug">
            {survey.questions[currentQuestionIndex]?.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {uploadError && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-snug">{uploadError}</p>
            </div>
          )}
          {!isFaceDetected && step === "recording" && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">
                Face not clearly detected (or multiple faces). Please ensure a
                single face is visible.
              </p>
            </div>
          )}
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Retries: {retryCount}/{maxRetries}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-xl font-medium border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/60 transition-all duration-200 disabled:opacity-40"
              disabled={isInteractionDisabled}
              onClick={() => onAnswer("no")}
              aria-label="Answer No"
            >
              <X className="mr-2 w-5 h-5" />
              No
            </Button>
            <Button
              size="lg"
              className="h-20 text-xl font-medium border-2 border-transparent hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/50 transition-all duration-200 disabled:opacity-40"
              disabled={isInteractionDisabled}
              onClick={() => onAnswer("yes")}
              aria-label="Answer Yes"
            >
              <Check className="mr-2 w-5 h-5" />
              Yes
            </Button>
          </div>
          {step === "submitting" && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processing secure video segment…</span>
            </div>
          )}
        </CardContent>
      </Card>
      {step === "recording" && (
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            Recording
          </span>
        </div>
      )}
    </div>
  );
}

export function CompletedStep() {
  return (
    <Card className="border-border/60 shadow-xl text-center">
      <CardHeader className="pb-4">
        <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <CardTitle className="text-3xl font-semibold">
          Survey Complete
        </CardTitle>
        <CardDescription className="text-base mt-3 leading-relaxed">
          Thank you for your time. Your responses and video segments have been
          securely recorded. You may now close this window.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function ErrorStep({ onRetry }: ErrorStepProps) {
  return (
    <Card className="border-border/60 shadow-xl text-center">
      <CardHeader className="pb-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <CardTitle className="text-2xl font-semibold">
          Unable to Proceed
        </CardTitle>
        <CardDescription className="text-base mt-3 leading-relaxed">
          We could not access your camera. This survey requires video
          capabilities. Please check your browser permissions and retry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
