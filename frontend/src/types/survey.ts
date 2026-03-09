export interface Survey {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  order: number;
}

export interface SurveyWithQuestions extends Survey {
  questions: SurveyQuestion[];
}

export type SurveyStep =
  | "welcome"
  | "permission"
  | "recording"
  | "submitting"
  | "completed"
  | "error";
