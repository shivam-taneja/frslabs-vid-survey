"use client";

import { Loader2, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetSurvey, useUpdateSurvey } from "@/hooks/api/survey";
import { toast } from "sonner";
import {
  createSurveySchema,
  type CreateSurveyPayload,
} from "@/lib/validations/survey";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Survey } from "@/types/survey";
import { useQueryClient } from "@tanstack/react-query";

type EditSurveyDialogProps = {
  survey: Survey;
};

export default function EditSurveyDialog({ survey }: EditSurveyDialogProps) {
  const queryClient = useQueryClient();
  const updateSurvey = useUpdateSurvey({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useGetSurvey.getKey({ surveyId: survey.id }),
      });
    },
  });
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSurveyPayload>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: { title: survey.title },
  });

  const onSubmit = async (data: CreateSurveyPayload) => {
    try {
      await updateSurvey.mutateAsync({
        surveyId: survey.id,
        payload: data,
      });

      toast.success("Survey updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update survey");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Survey</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Survey Title</FieldLabel>

            <Input id="title" {...register("title")} />

            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={updateSurvey.isPending}>
              {updateSurvey.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
