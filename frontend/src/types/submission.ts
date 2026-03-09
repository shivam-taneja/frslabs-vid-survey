export interface Submission {
  id: string;
  survey_id: string;
  started_at: string;
}

export interface SubmissionAnswer {
  question_id: string;
  answer: "yes" | "no";
  face_detected: boolean;
  face_score: number;
  face_image: File;
}

export interface SaveAnswersPayload {
  submissionId: string;
  answers: Omit<SubmissionAnswer, "face_image">[];
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
