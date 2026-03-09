import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { SurveyQuestion } from "@/types/survey";

type SurveyQuestionsCardProps = {
  questions: SurveyQuestion[];
};

export default function SurveyQuestionsCard({
  questions,
}: SurveyQuestionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions</CardTitle>

        <CardDescription>
          The 5 Yes/No questions attached to this survey.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-4">
          {questions?.map((q, i: number) => (
            <li
              key={q.id}
              className="p-4 border rounded-lg flex gap-4 items-center"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-sm">
                {i + 1}
              </div>

              <p className="font-medium">{q.question_text}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
