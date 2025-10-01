
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import Image from "next/image";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleContinue = async () => {
    try {
      await fetch("/api/user/welcome", { method: "POST" });
      router.push("/subscription-choice");
    } catch (error) {
      console.error("Error:", error);
      router.push("/subscription-choice");
    }
  };

  const userName = session?.user?.name?.split(" ")[0] || t("user");

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/register_background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      <Card className="relative z-10 max-w-2xl w-full p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t("welcomeTitle", { name: userName })}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {t("welcomeMessage")}
            </p>
          </div>

          <div className="space-y-3 text-left">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("welcomeFeatures")}
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mr-2" />
                {t("welcomeFeature1")}
              </li>
              <li className="flex items-center text-sm">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mr-2" />
                {t("welcomeFeature2")}
              </li>
              <li className="flex items-center text-sm">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mr-2" />
                {t("welcomeFeature3")}
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              size="lg"
            >
              {t("continue")}
            </Button>
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("autoRedirect", { seconds: countdown })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
