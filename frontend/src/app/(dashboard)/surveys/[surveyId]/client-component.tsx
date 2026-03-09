"use client";

import { useParams } from "next/navigation";
import {
  Loader2,
  CheckCircle,
  Copy,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetSurvey, usePublishSurvey } from "@/hooks/api/survey";
import { toast } from "sonner";

export default function SurveyDetailsPage() {
  const params = useParams();
  const surveyId = params.surveyId as string;

  const {
    data: survey,
    isLoading,
    refetch,
  } = useGetSurvey({ variables: { surveyId } });
  const publishMutation = usePublishSurvey();

  const handlePublish = async () => {
    await publishMutation.mutateAsync({ surveyId });
    refetch();
  };

  const copyLink = () => {
    const url = `${window.location.origin}/survey/${surveyId}`;

    navigator.clipboard.writeText(url);
    toast.success("Public link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!survey) return <div>Survey not found</div>;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{survey.title}</h2>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {survey.is_active ? (
              <span className="flex items-center text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4 mr-1" /> Published
              </span>
            ) : (
              <span className="flex items-center text-sm text-orange-500 font-medium">
                <AlertCircle className="w-4 h-4 mr-1" /> Draft
              </span>
            )}
          </div>
        </div>

        {!survey.is_active && (
          <Button onClick={handlePublish} disabled={publishMutation.isPending}>
            {publishMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Publish Survey
          </Button>
        )}
      </div>

      {survey.is_active && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">
              Survey is Live!
            </CardTitle>
            <CardDescription>
              Share this link with your participants.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <code className="flex-1 p-3 bg-background rounded border text-sm">
              {typeof window !== "undefined"
                ? `${window.location.origin}/survey/${surveyId}`
                : ""}
            </code>
            <Button variant="outline" size="icon" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={`/survey/${surveyId}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            The 5 Yes/No questions attached to this survey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {survey.questions?.map((q, i) => (
              <li
                key={q.id}
                className="p-4 border rounded-lg flex gap-4 items-center"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-sm">
                  {i + 1}
                </div>
                <p className="font-medium">{q.question_text}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
