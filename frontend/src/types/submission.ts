export interface Submission {
  id: string;
  survey_id: string;
  started_at: string;
}
export interface UploadMediaPayload {
  submissionId: string;
  questionId: string;
  type: "video" | "image";
  file: File;
}

export interface CompletedSubmission {
  id: string;
  survey_id: string;
  started_at: string;
  completed_at: string;
  overall_score: number;
}
