"use client";

import Link from "next/link";
import { FileText, QrCode, MessageSquare, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      titleKey: "featurePdfTitle" as const,
      descriptionKey: "featurePdfDesc" as const,
      icon: FileText,
      href: "/pdf-tools",
      color: "from-blue-600 to-indigo-600",
      featureKeys: [
        "pdfFeature1" as const,
        "pdfFeature2" as const,
        "pdfFeature3" as const,
        "pdfFeature4" as const,
        "pdfFeature5" as const,
        "pdfFeature6" as const,
      ],
    },
    {
      titleKey: "featureQrTitle" as const,
      descriptionKey: "featureQrDesc" as const,
      icon: QrCode,
      href: "/qr-generator",
      color: "from-purple-600 to-pink-600",
      featureKeys: [
        "qrFeature1" as const,
        "qrFeature2" as const,
        "qrFeature3" as const,
        "qrFeature4" as const,
        "qrFeature5" as const,
        "qrFeature6" as const,
      ],
    },
    {
      titleKey: "featureAiTitle" as const,
      descriptionKey: "featureAiDesc" as const,
      icon: MessageSquare,
      href: "/chat",
      color: "from-emerald-600 to-teal-600",
      featureKeys: [
        "aiFeature1" as const,
        "aiFeature2" as const,
        "aiFeature3" as const,
        "aiFeature4" as const,
        "aiFeature5" as const,
        "aiFeature6" as const,
      ],
    },
  ];

  const benefits = [
    {
      icon: Zap,
      titleKey: "benefit1Title" as const,
      descriptionKey: "benefit1Desc" as const,
    },
    {
      icon: Shield,
      titleKey: "benefit2Title" as const,
      descriptionKey: "benefit2Desc" as const,
    },
    {
      icon: Sparkles,
      titleKey: "benefit3Title" as const,
      descriptionKey: "benefit3Desc" as const,
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
          {t("heroTitle")}
          <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("heroSubtitle")}
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          {t("heroDescription")}
        </p>
      </div>

      {/* Main Features */}
      <div className="mb-16 grid gap-8 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.titleKey}
              className="group overflow-hidden border-2 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <CardHeader>
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">{t(feature.titleKey)}</CardTitle>
                <CardDescription className="text-base">
                  {t(feature.descriptionKey)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-2">
                  {feature.featureKeys.map((key) => (
                    <li key={key} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <Link href={feature.href}>
                  <Button
                    className={`w-full bg-gradient-to-r ${feature.color} text-white shadow-md transition-all hover:shadow-lg`}
                  >
                    {t("getStarted")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">{t("benefitsTitle")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.titleKey} className="border-2">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{t(benefit.titleKey)}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t(benefit.descriptionKey)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="border-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <CardContent className="py-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">{t("ctaTitle")}</h2>
          <p className="mb-6 text-lg opacity-90">
            {t("ctaDescription")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pdf-tools">
              <Button size="lg" variant="secondary" className="shadow-lg">
                <FileText className="mr-2 h-5 w-5" />
                {t("pdfTools")}
              </Button>
            </Link>
            <Link href="/qr-generator">
              <Button size="lg" variant="secondary" className="shadow-lg">
                <QrCode className="mr-2 h-5 w-5" />
                {t("qrGenerator")}
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="secondary" className="shadow-lg">
                <MessageSquare className="mr-2 h-5 w-5" />
                {t("aiChat")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
