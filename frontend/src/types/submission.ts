export interface Submission {
  id: string;
  survey_id: string;
  ip_address?: string;
  browser?: string;
  device?: string;
  os?: string;
  location?: string;
  started_at: string;
  completed_at?: string | null;
  overall_score?: number | null;
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

export type Answer = {
  id: string;
  submission_id: string;
  question_id: string;
  question_text?: string;
  answer: "yes" | "no" | "skipped";
  face_detected: boolean;
  face_score: number;
  face_image_path?: string | null;
};