
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Crown, Tv } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionChoicePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePremium = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: t("error"),
        description: t("subscriptionError"),
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleFree = () => {
    router.push("/");
  };

  const plans = [
    {
      id: "free",
      name: t("freePlan"),
      price: t("free"),
      description: t("freePlanDesc"),
      icon: Tv,
      color: "from-slate-600 to-slate-700",
      features: [
        { text: t("freeFeature1"), included: true },
        { text: t("freeFeature2"), included: true },
        { text: t("freeFeature3"), included: true },
        { text: t("freeFeature4"), included: false },
        { text: t("freeFeature5"), included: false },
      ],
      action: handleFree,
      buttonText: t("continueFree"),
    },
    {
      id: "premium",
      name: t("premiumPlan"),
      price: "$5",
      priceUnit: t("perMonth"),
      description: t("premiumPlanDesc"),
      icon: Crown,
      color: "from-purple-600 to-pink-600",
      popular: true,
      features: [
        { text: t("premiumFeature1"), included: true },
        { text: t("premiumFeature2"), included: true },
        { text: t("premiumFeature3"), included: true },
        { text: t("premiumFeature4"), included: true },
        { text: t("premiumFeature5"), included: true },
      ],
      action: handlePremium,
      buttonText: t("subscribePremium"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {t("chooseYourPlan")}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t("choosePlanDesc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden border-2 transition-all hover:shadow-xl ${
                  plan.popular ? "border-purple-600 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-semibold">
                    {t("popular")}
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.priceUnit && (
                      <span className="text-slate-600 dark:text-slate-400 ml-2">
                        {plan.priceUnit}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-slate-500"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={plan.action}
                    disabled={loading && plan.id === "premium"}
                    className={`w-full ${
                      plan.popular
                        ? `bg-gradient-to-r ${plan.color} text-white`
                        : ""
                    }`}
                    size="lg"
                  >
                    {loading && plan.id === "premium" ? t("loading") : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
