"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetSurveySubmissions } from "@/hooks/api/survey";

export default function SurveySubmissionsPage() {
  const params = useParams();
  const surveyId = params.surveyId as string;

  const { data: submissions, isLoading } = useGetSurveySubmissions({
    variables: { surveyId },
  });

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Survey Submissions
        </h2>
        <p className="text-muted-foreground">
          All responses recorded for this survey.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>

        <CardContent>
          {!submissions?.length ? (
            <div className="text-center text-muted-foreground py-8">
              No submissions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{s.id}</p>

                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(s.started_at).toLocaleString()}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Score: {s.overall_score ?? "-"}
                    </p>
                  </div>

                  <Button variant="secondary" asChild>
                    <Link href={`/surveys/${surveyId}/submissions/${s.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
