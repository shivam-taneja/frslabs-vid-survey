import * as z from "zod";

export const saveAnswersSchema = z.object({
  submissionId: z.string().min(1),
  answers: z
    .array(
      z.object({
        question_id: z.string().min(1),
        answer: z.enum(["yes", "no", "skipped"]),
        face_detected: z.boolean(),
        face_score: z.number().min(0).max(100),
      }),
    )
    .length(5),
});

export type SaveAnswersPayload = z.infer<typeof saveAnswersSchema>;
