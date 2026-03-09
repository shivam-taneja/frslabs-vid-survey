"use client";

import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToggleSurvey } from "@/hooks/api/survey";
import { useGetSurvey } from "@/hooks/api/survey";
import EditSurveyDialog from "./edit-dialog";
import DeleteSurveyDialog from "./delete-dialog";
import { SurveyWithQuestions } from "@/types/survey";
import { toast } from "sonner";

type SurveyHeaderProps = {
  survey: SurveyWithQuestions;
};

export default function SurveyHeader({ survey }: SurveyHeaderProps) {
  const queryClient = useQueryClient();
  const toggleSurvey = useToggleSurvey({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useGetSurvey.getKey({ surveyId: survey.id }),
      });
    },
  });

 const handleToggle = async () => {
  try {
    await toggleSurvey.mutateAsync({ surveyId: survey.id });

    toast.success(
      survey.is_active ? "Survey unpublished" : "Survey published"
    );
  } catch (error) {
    toast.error((error as Error).message);
  }
};

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{survey.title}</h2>

        <div className="flex items-center mt-2 space-x-2">
          <span className="text-sm text-muted-foreground">Status:</span>

          {survey.is_active ? (
            <span className="flex items-center text-sm text-green-600 font-medium">
              <CheckCircle className="w-4 h-4 mr-1" />
              Published
            </span>
          ) : (
            <span className="flex items-center text-sm text-orange-500 font-medium">
              <AlertCircle className="w-4 h-4 mr-1" />
              Draft
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleToggle} disabled={toggleSurvey.isPending}>
          {toggleSurvey.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}

          {survey.is_active ? "Unpublish" : "Publish"}
        </Button>

        <Button variant="secondary" asChild>
          <Link href={`/surveys/${survey.id}/submissions`}>
            View Submissions
          </Link>
        </Button>

        {!survey.is_active && (
          <>
            <EditSurveyDialog survey={survey} />

            <DeleteSurveyDialog surveyId={survey.id} />
          </>
        )}
      </div>
    </div>
  );
}
