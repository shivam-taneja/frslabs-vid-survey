import type { Metadata } from "next";
import NewSurvey from "./client-component";

export const metadata: Metadata = {
  title: "New Survey",
};

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <NewSurvey />
    </div>
  );
}
