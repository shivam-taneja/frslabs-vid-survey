"use client";

import Link from "next/link";
import { Plus, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetSurveys } from "@/hooks/api/survey";

export default function SurveysPage() {
  const { data: surveys, isLoading } = useGetSurveys();

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Surveys</h2>
          <p className="text-muted-foreground">
            Manage your video survey campaigns.
          </p>
        </div>
        <Button asChild>
          <Link href="/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Survey
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Surveys</CardTitle>
          <CardDescription>
            View and manage all your created surveys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !surveys || surveys.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <p>No surveys found. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {surveys.map((survey) => (
                <Card key={survey.id} className="flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    <CardDescription>
                      {survey.is_active ? (
                        <span className="text-green-600 font-medium">
                          Published
                        </span>
                      ) : (
                        <span className="text-orange-500 font-medium">
                          Draft
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="secondary" className="w-full" asChild>
                      <Link href={`/surveys/${survey.id}`}>Manage</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
