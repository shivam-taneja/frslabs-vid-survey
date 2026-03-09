"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SurveyLiveCardProps = {
  surveyId: string;
};

export default function SurveyLiveCard({ surveyId }: SurveyLiveCardProps) {
  const url = `${window.location.origin}/survey/${surveyId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Public link copied");
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg text-primary">Survey is Live</CardTitle>

        <CardDescription>Share this link with participants</CardDescription>
      </CardHeader>

      <CardContent className="flex items-center space-x-2">
        <code className="flex-1 p-3 bg-background rounded border text-sm">
          {url}
        </code>

        <Button variant="outline" size="icon" onClick={copyLink}>
          <Copy className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" asChild>
          <a href={url} target="_blank">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
