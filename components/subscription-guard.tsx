
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdPlayer } from "./ad-player";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

export function SubscriptionGuard({ children, requirePremium = false }: SubscriptionGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAd, setShowAd] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastAdTime, setLastAdTime] = useState<number>(0);

  useEffect(() => {
    if (status === "authenticated") {
      checkSubscription();
      checkWelcomeStatus();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const checkWelcomeStatus = async () => {
    try {
      const response = await fetch("/api/user/welcome");
      if (response.ok) {
        const data = await response.json();
        if (!data.hasSeenWelcome) {
          router.push("/welcome");
        }
      }
    } catch (error) {
      console.error("Error checking welcome status:", error);
    }
  };

  const checkSubscription = async () => {
    try {
      const response = await fetch("/api/subscription/status");
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium);
        
        // Show ad for free users every 3 minutes
        if (!data.isPremium) {
          const now = Date.now();
          if (now - lastAdTime > 180000) { // 3 minutes
            setShowAd(true);
            setLastAdTime(now);
          }
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (requirePremium && !isPremium && status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Premium Feature</h2>
          <p className="text-slate-600 dark:text-slate-400">
            This feature requires a premium subscription
          </p>
          <button
            onClick={() => router.push("/subscription-choice")}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {!isPremium && status === "authenticated" && (
        <AdPlayer
          open={showAd}
          onClose={() => setShowAd(false)}
          adType="non-skippable"
        />
      )}
    </>
  );
}
