
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Play } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";

interface AdPlayerProps {
  open: boolean;
  onClose: () => void;
  adType: "skippable" | "non-skippable" | "rewarded";
  onComplete?: () => void;
}

export function AdPlayer({ open, onClose, adType, onComplete }: AdPlayerProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(adType === "non-skippable" ? 15 : 5);
  const [canSkip, setCanSkip] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (open) {
      setCountdown(adType === "non-skippable" ? 15 : 5);
      setCanSkip(false);
      setCompleted(false);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (adType === "skippable") {
              setCanSkip(true);
            } else {
              handleAdComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, adType]);

  const handleAdComplete = async () => {
    if (completed) return;

    setCompleted(true);

    try {
      await fetch("/api/ads/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adType,
          completed: true,
        }),
      });

      if (adType === "rewarded") {
        toast({
          title: t("adRewardTitle"),
          description: t("adRewardDesc"),
        });
      }

      onComplete?.();
      onClose();
    } catch (error) {
      console.error("Error recording ad view:", error);
      onClose();
    }
  };

  const handleSkip = async () => {
    try {
      await fetch("/api/ads/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adType,
          completed: false,
        }),
      });
    } catch (error) {
      console.error("Error recording ad skip:", error);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="sr-only">{t("advertisement")}</DialogTitle>
        
        <div className="space-y-4">
          {/* Ad placeholder */}
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-16 w-16 text-white opacity-50" />
            </div>
            
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
              {t("advertisement")}
            </div>

            {countdown > 0 && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                {t("adCountdown", { seconds: countdown })}
              </div>
            )}

            {canSkip && adType === "skippable" && (
              <div className="absolute bottom-4 right-4">
                <Button
                  onClick={handleSkip}
                  size="sm"
                  variant="secondary"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("skipAd")}
                </Button>
              </div>
            )}
          </div>

          {/* Ad info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {adType === "rewarded"
                ? t("watchRewardedAdDesc")
                : adType === "non-skippable"
                ? t("watchNonSkippableAdDesc")
                : t("watchSkippableAdDesc")}
            </p>

            {adType === "rewarded" && countdown === 0 && (
              <Button
                onClick={handleAdComplete}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                {t("claimReward")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
