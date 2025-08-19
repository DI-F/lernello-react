// frontend/src/components/markdown-editor/Toolbar.tsx
import {
  Code,
  Bold,
  Italic,
  List,
  ListOrdered,
  TextQuote,
  Strikethrough,
  Link,
  Heading,
  Underline,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SyntaxType = "heading" | "codeblock" | "list" | "blockquote" | "inline";

interface ToolbarProps {
  insertSyntax: (syntax: string, type: SyntaxType) => void;
}

// Mock translation function
const t = (key: string) => key.split(".").pop()?.replace(/_/g, " ") || "";

export function Toolbar({ insertSyntax }: ToolbarProps) {
  const buttons = [
    {
      icon: Heading,
      title: t("textEditor.toolbar.heading"),
      onClick: () => insertSyntax("### {{selection}}", "heading"),
    },
    {
      icon: Bold,
      title: t("textEditor.toolbar.bold"),
      onClick: () => insertSyntax("**{{selection}}**", "inline"),
    },
    {
      icon: Italic,
      title: t("textEditor.toolbar.italic"),
      onClick: () => insertSyntax("*{{selection}}*", "inline"),
    },
    {
      icon: Underline,
      title: t("textEditor.toolbar.underline"),
      onClick: () => insertSyntax("__{{selection}}__", "inline"),
    },
    {
      icon: Strikethrough,
      title: t("textEditor.toolbar.strikethrough"),
      onClick: () => insertSyntax("~~{{selection}}~~", "inline"),
    },
    { isSeparator: true },
    {
      icon: Link,
      title: t("textEditor.toolbar.link"),
      onClick: () => insertSyntax("[{{selection}}](url)", "inline"),
    },
    {
      icon: Code,
      title: t("textEditor.toolbar.codeBlock"),
      onClick: () => insertSyntax("```\n{{selection}}\n```", "codeblock"),
    },
    { isSeparator: true },
    {
      icon: List,
      title: t("textEditor.toolbar.list"),
      onClick: () => insertSyntax("- {{selection}}", "list"),
    },
    {
      icon: ListOrdered,
      title: t("textEditor.toolbar.orderedList"),
      onClick: () => insertSyntax("1. {{selection}}", "list"),
    },
    {
      icon: TextQuote,
      title: t("textEditor.toolbar.quote"),
      onClick: () => insertSyntax("> {{selection}}", "blockquote"),
    },
  ];

  return (
    <div className="flex h-auto flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-input bg-transparent p-1">
      {buttons.map((btn, index) =>
        btn.isSeparator ? (
          <div key={`sep-${index}`} className="mx-1 h-6 w-px bg-border" />
        ) : (
          <Button
            key={btn.title}
            type="button"
            variant="ghost"
            size="icon"
            onClick={btn.onClick}
            title={btn.title}
            className="h-8 w-8"
          >
            <btn.icon className="h-5 w-5 text-muted-foreground" />
          </Button>
        ),
      )}
    </div>
  );
}
