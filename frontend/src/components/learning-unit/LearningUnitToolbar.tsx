import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import Select from "@/components/ui/select.tsx";
import ToggleViewButton from "@/components/learning-unit/ToggleViewButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx"; // Note: Using lucide-react instead of lucide-svelte

interface LearningUnitToolbarProps {
  onLanguageSelect: (language: string) => void;
  onSave: () => void;
}

const localeToLanguageValue: Record<string, string> = {
  en: "ENGLISH",
  de: "GERMAN",
  fr: "FRENCH",
  it: "ITALIAN",
  "de-CH": "GERMAN",
};

export default function LearningUnitToolbar({
  onLanguageSelect,
  onSave,
}: LearningUnitToolbarProps) {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    localeToLanguageValue[i18n.language] || "ENGLISH",
  );

  const languageOptions = [
    { value: "ENGLISH", label: t("common.english") },
    { value: "GERMAN", label: t("common.german") },
    { value: "FRENCH", label: t("common.french") },
    { value: "ITALIAN", label: t("common.italian") },
  ];

  // Update selected language when i18n language changes
  useEffect(() => {
    setSelectedLanguage(localeToLanguageValue[i18n.language] || "ENGLISH");
  }, [i18n.language]);

  const handleSelect = (value: string) => {
    setSelectedLanguage(value);
    onLanguageSelect(value);
  };

  return (
    <Card className="w-full p-2">
      <div className="flex justify-between">
        <div className="flex items-center">
          <ToggleViewButton />
          <Button
            variant="outline"
            onClick={onSave}
            className="ml-2 cursor-pointer"
            aria-label={t("common.save")}
          >
            <Save />
          </Button>
        </div>
        <Select
          options={languageOptions}
          selected={selectedLanguage}
          onSelect={handleSelect}
        />
      </div>
    </Card>
  );
}
