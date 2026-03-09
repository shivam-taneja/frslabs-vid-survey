import type { Metadata } from "next";
import SurveyPage from "./client-component";

export const metadata: Metadata = {
  title: "Survey | VidSurvey",
};

export default function Page() {
  return <SurveyPage />;
}
