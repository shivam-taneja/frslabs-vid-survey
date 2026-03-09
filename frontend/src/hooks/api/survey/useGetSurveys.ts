import api from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { Survey } from "@/types/survey";
import { createQuery } from "react-query-kit";

export const useGetSurveys = createQuery<Survey[], void>({
  queryKey: ["surveys-list"],
  fetcher: async () => {
    const res = await api.get<ApiResponse<Survey[]>>("/api/surveys");
    return res.data.data!;
  },
});
