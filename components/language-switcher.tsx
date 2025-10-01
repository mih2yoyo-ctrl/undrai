
"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={toggleLanguage}
      title={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
      className="min-w-[60px] font-semibold"
    >
      {language === "en" ? "AR" : "EN"}
    </Button>
  );
}
