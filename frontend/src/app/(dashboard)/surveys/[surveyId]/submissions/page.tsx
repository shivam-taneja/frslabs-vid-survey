import type { Metadata } from "next";
import SurveySubmissionsPage from "./client-component";

export const metadata: Metadata = {
  title: "Survey Submissions",
};

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <SurveySubmissionsPage />
    </div>
  );
}
