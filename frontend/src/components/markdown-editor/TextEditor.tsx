// frontend/src/components/markdown-editor/TextEditor.tsx
import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Toolbar } from "./TextEditorToolbar";
import {
  handleMarkdownSyntaxInsertion,
  handleEnterKeyForListsAndBlockquotes,
  type MarkdownModificationResult,
} from "./markdownEditorLogic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Mock dependencies
const useTranslation = () => ({
  t: (key: string) => key.split(".").pop() || "",
});
const useToaster = () => ({
  create: (toast: { description: string; type: string }) =>
    console.warn(`Toast: [${toast.type}] ${toast.description}`),
});

const INSTRUCTOR_ROLE = "INSTRUCTOR";
type RoleType = "INSTRUCTOR" | "TRAINEE";

interface TextEditorProps {
  content: string;
  onUpdate?: (content: string) => void;
  role: RoleType;
}

export function TextEditor({
  content: initialContent,
  onUpdate,
  role,
}: TextEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const scrollPositions = useRef({ pageScrollY: 0, editorScrollTop: 0 });
  const { t } = useTranslation();
  const toaster = useToaster();

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (onUpdate) {
      onUpdate(content);
    }
  }, [content, onUpdate]);

  const generatePreview = async () => {
    setIsLoadingPreview(true);
    try {
      const parsed = await marked.parse(content, { breaks: true });
      setPreviewHtml(DOMPurify.sanitize(parsed));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Preview generation failed";
      setPreviewHtml(`<div class="text-destructive">${message}</div>`);
      toaster.create({ description: message, type: "error" });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const saveScrollPositions = () => {
    if (editorRef.current) {
      scrollPositions.current = {
        pageScrollY: window.scrollY,
        editorScrollTop: editorRef.current.scrollTop,
      };
    }
  };

  const restoreScrollPositionsAndFocus = (
    newSelectionStart: number,
    newSelectionEnd: number,
  ) => {
    setTimeout(() => {
      if (editorRef.current) {
        window.scrollTo(window.scrollX, scrollPositions.current.pageScrollY);
        editorRef.current.scrollTop = scrollPositions.current.editorScrollTop;
        editorRef.current.focus();
        editorRef.current.setSelectionRange(newSelectionStart, newSelectionEnd);
      }
    }, 0);
  };

  const applySyntaxResult = (result: MarkdownModificationResult | null) => {
    if (result) {
      setContent(result.newContent);
      restoreScrollPositionsAndFocus(
        result.newSelectionStart,
        result.newSelectionEnd,
      );
    }
  };

  const insertSyntax = (
    syntaxString: string,
    type: "heading" | "codeblock" | "list" | "blockquote" | "inline",
  ) => {
    if (!editorRef.current) return;
    saveScrollPositions();
    const { selectionStart, selectionEnd } = editorRef.current;
    const result = handleMarkdownSyntaxInsertion(
      content,
      selectionStart,
      selectionEnd,
      syntaxString,
      type,
    );
    applySyntaxResult(result);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      if (!editorRef.current) return;
      saveScrollPositions();
      const { selectionStart, selectionEnd } = editorRef.current;
      const result = handleEnterKeyForListsAndBlockquotes(
        content,
        selectionStart,
        selectionEnd,
      );
      if (result?.preventDefault) {
        event.preventDefault();
      }
      applySyntaxResult(result);
    }
  };

  const editorClass =
    "block h-[300px] min-h-[300px] w-full resize-y rounded-md border border-input bg-transparent p-2.5 focus:ring-0 focus:outline-none focus:border-primary";

  if (role !== INSTRUCTOR_ROLE) {
    return (
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(marked.parse(content)),
        }}
      />
    );
  }

  return (
    <Tabs defaultValue="edit" className="w-full">
      <TabsList>
        <TabsTrigger value="edit">{t("common.edit")}</TabsTrigger>
        <TabsTrigger value="preview" onClick={generatePreview}>
          {t("common.preview")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <Toolbar insertSyntax={insertSyntax} />
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(editorClass, "rounded-t-none border-t-0")}
          placeholder={t("markdownEditor.placeholder")}
        />
      </TabsContent>
      <TabsContent
        value="preview"
        className="min-h-[300px] rounded-md border p-4"
      >
        {isLoadingPreview ? (
          <div>{t("common.loading")}...</div>
        ) : (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
