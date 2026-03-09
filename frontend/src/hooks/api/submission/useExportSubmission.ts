import api from "@/lib/api";
import { createMutation } from "react-query-kit";

export const useExportSubmission = createMutation<
  Blob,
  { submissionId: string }
>({
  mutationFn: async ({ submissionId }) => {
    const res = await api.get(`/api/submissions/${submissionId}/export`, {
      responseType: "blob",
    });

    return res.data;
  },
});
