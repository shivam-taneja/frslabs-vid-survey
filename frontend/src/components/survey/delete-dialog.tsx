"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeleteSurvey, useGetSurvey } from "@/hooks/api/survey";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

type DeleteSurveyDialogProps = {
  surveyId: string;
};

export default function DeleteSurveyDialog({
  surveyId,
}: DeleteSurveyDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteSurvey = useDeleteSurvey({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useGetSurvey.getKey({ surveyId }),
      });
    },
  });

  const handleDelete = async () => {
    await deleteSurvey.mutateAsync({ surveyId });

    toast.success("Survey deleted");

    router.push("/surveys");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this survey permanently?</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
