
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function SubscriptionCancelledPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {t("subscriptionCancelled")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {t("subscriptionCancelledDesc")}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/subscription-choice")}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              size="lg"
            >
              {t("tryAgain")}
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {t("continueFree")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
