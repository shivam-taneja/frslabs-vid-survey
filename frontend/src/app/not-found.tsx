"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          404
        </h1>

        <p className="mt-3 text-muted-foreground">Page Not Found!</p>

        <Button
          variant="outline"
          className="mt-6 gap-2"
          onClick={() => router.replace("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
