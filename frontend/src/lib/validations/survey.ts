import * as z from "zod";

export const newSurveyFormSchema = z.object({
  title: z.string().min(1, "Survey title is required"),
  questions: z
    .array(z.string().min(1, "Question cannot be empty"))
    .length(5, "Exactly 5 questions are required"),
});

export const createSurveySchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const addQuestionsSchema = z.object({
  surveyId: z.string().min(1),
  questions: z
    .array(
      z.object({
        question_text: z.string().min(1),
        order: z.number().int().min(0),
      }),
    )
    .length(5),
});

export type NewSurveyFormValues = z.infer<typeof newSurveyFormSchema>;
export type CreateSurveyPayload = z.infer<typeof createSurveySchema>;
export type AddQuestionsPayload = z.infer<typeof addQuestionsSchema>;
