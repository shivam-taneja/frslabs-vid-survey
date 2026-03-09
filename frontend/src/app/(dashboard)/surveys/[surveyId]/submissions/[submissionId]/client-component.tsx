"use client";

import { useParams } from "next/navigation";
import { Loader2, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useGetSubmission,
  useGetSubmissionAnswers,
  useExportSubmission,
} from "@/hooks/api/submission";
import Image from "next/image";

export default function SubmissionDetailsPage() {
  const params = useParams();
  const submissionId = params.submissionId as string;

  const { data: submission, isLoading } = useGetSubmission({
    variables: { submissionId },
  });

  const { data: answers } = useGetSubmissionAnswers({
    variables: { submissionId },
  });

  const exportMutation = useExportSubmission();

  const handleExport = async () => {
    const blob = await exportMutation.mutateAsync({ submissionId });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${submissionId}.zip`;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!submission) return <div>Submission not found</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Submission Details
          </h2>
          <p className="text-muted-foreground">
            Submission ID: {submission.id}
          </p>
        </div>

        <Button onClick={handleExport} disabled={exportMutation.isPending}>
          {exportMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export ZIP
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission Info</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <b>Survey ID:</b> {submission.survey_id}
          </div>

          <div>
            <b>Score:</b> {submission.overall_score ?? "-"}
          </div>

          <div>
            <b>Started:</b> {new Date(submission.started_at).toLocaleString()}
          </div>

          <div>
            <b>Completed:</b>{" "}
            {submission.completed_at
              ? new Date(submission.completed_at).toLocaleString()
              : "-"}
          </div>

          <div>
            <b>Browser:</b> {submission.browser ?? "-"}
          </div>

          <div>
            <b>OS:</b> {submission.os ?? "-"}
          </div>

          <div>
            <b>Device:</b> {submission.device ?? "-"}
          </div>

          <div>
            <b>Location:</b> {submission.location ?? "-"}
          </div>

          <div>
            <b>IP Address:</b> {submission.ip_address ?? "-"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answers</CardTitle>
        </CardHeader>

        <CardContent>
          {!answers?.length ? (
            <div className="text-muted-foreground">No answers recorded.</div>
          ) : (
            <div className="space-y-4">
              {answers.map((a) => (
                <div key={a.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      Question: {a.question_text ?? a.question_id}
                    </span>

                    <span className="text-sm">
                      Answer: <b>{a.answer}</b>
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Face detected: {a.face_detected ? "Yes" : "No"} | Score:{" "}
                    {a.face_score}
                  </div>

                  {a.face_image_path && (
                    <Image
                      src={`/media/${a.face_image_path}`}
                      alt="Face capture"
                      width={320}
                      height={200}
                      className="rounded border max-h-40 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
