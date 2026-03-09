import type { Metadata } from "next";
import SurveysPage from "./client-component";

export const metadata: Metadata = {
  title: "Surveys",
};

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <SurveysPage />
    </div>
  );
}
