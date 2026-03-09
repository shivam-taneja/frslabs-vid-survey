"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useGetSurvey } from "@/hooks/api/survey";
import SurveyHeader from "@/components/survey/header";
import SurveyLiveCard from "@/components/survey/live-card";
import SurveyQuestionsCard from "@/components/survey/questions-card";

export default function SurveyDetailsPage() {
  const params = useParams();
  const surveyId = params.surveyId as string;

  const { data: survey, isLoading } = useGetSurvey({
    variables: { surveyId },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!survey) return <div>Survey not found</div>;

  return (
    <div className="flex-1 space-y-8 max-w-5xl mx-auto">
      <SurveyHeader survey={survey} />

      {survey.is_active && <SurveyLiveCard surveyId={survey.id} />}

      <SurveyQuestionsCard questions={survey.questions} />
    </div>
  );
}
