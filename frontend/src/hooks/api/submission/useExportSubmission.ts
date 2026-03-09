import api from "@/lib/api";
import { createMutation } from "react-query-kit";

export const useExportSubmissionMutation = createMutation<
  void,
  { submissionId: string }
>({
  mutationFn: async ({ submissionId }) => {
    const res = await api.get(`/api/submissions/${submissionId}/export`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${submissionId}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
});
