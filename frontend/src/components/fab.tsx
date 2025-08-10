import { Button } from "@/components/ui/button";
import type { ComponentProps, PropsWithChildren } from "react";

type FabProps = PropsWithChildren<
  {
    onClick?: () => void;
    "aria-label"?: string;
  } & Omit<ComponentProps<typeof Button>, "onClick" | "size">
>;

// This component is a Floating Action Button (FAB) that can be used for quick actions in the UI.
export function Fab({ onClick, children, ...rest }: FabProps) {
  return (
    <Button
      {...rest}
      size="icon"
      className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
