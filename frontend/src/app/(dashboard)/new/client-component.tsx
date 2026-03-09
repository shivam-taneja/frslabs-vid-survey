"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useAddQuestion, useCreateSurvey } from "@/hooks/api/survey";
import {
  newSurveyFormSchema,
  type NewSurveyFormValues,
} from "@/lib/validations/survey";

export default function NewSurveyPage() {
  const router = useRouter();
  const createSurvey = useCreateSurvey();
  const addQuestions = useAddQuestion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewSurveyFormValues>({
    resolver: zodResolver(newSurveyFormSchema),
    defaultValues: {
      title: "",
      questions: ["", "", "", "", ""],
    },
    mode: "onChange",
  });

  const onSubmit = async (data: NewSurveyFormValues) => {
    try {
      const survey = await createSurvey.mutateAsync({ title: data.title });

      await addQuestions.mutateAsync({
        surveyId: survey.id,
        questions: data.questions.map((q, idx) => ({
          question_text: q,
          order: idx,
        })),
      });

      toast.success("Survey created successfully!");
      router.push(`/surveys/${survey.id}`);
    } catch (error) {
      console.error("Failed to create survey: ", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create survey",
      );
    }
  };

  const isSubmitting = createSurvey.isPending || addQuestions.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create New Survey</h2>
        <p className="text-muted-foreground">
          Setup a privacy-first video survey with exactly 5 Yes/No questions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
            <CardDescription>
              All questions must be answerable with a simple Yes or No.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Survey Title</FieldLabel>
              <Input
                id="title"
                placeholder="e.g., Remote Work Environment Check"
                {...register("title")}
                aria-invalid={!!errors.title}
              />
              {errors.title && <FieldError>{errors.title.message}</FieldError>}
            </Field>

            <div className="space-y-4 pt-4 border-t">
              <Label className="font-semibold">The 5 Questions</Label>
              <FieldGroup>
                {[...Array(5)].map((_, index) => {
                  const error = errors.questions?.[index];

                  return (
                    <Field key={index} data-invalid={!!error}>
                      <Input
                        placeholder={`Question ${index + 1}`}
                        {...register(`questions.${index}` as const)}
                        aria-invalid={!!error}
                      />
                      {error && <FieldError>{error.message}</FieldError>}
                    </Field>
                  );
                })}
              </FieldGroup>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create & Save Questions
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
