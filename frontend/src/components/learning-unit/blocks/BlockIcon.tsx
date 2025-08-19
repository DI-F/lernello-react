import type { FC } from "react";
import {
  BookOpen,
  FileQuestion,
  CircleHelp,
  ListChecks,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockResType } from "@/lib/schemas/response/BlockRes";

const iconMap: Record<BlockResType | "help", React.ElementType> = {
  THEORY: BookOpen,
  MULTIPLE_CHOICE: ListChecks,
  QUESTION: FileQuestion,
  help: CircleHelp,
};

interface BlockIconProps extends LucideProps {
  iconType: BlockResType;
}

export const BlockIcon: FC<BlockIconProps> = ({
  iconType,
  className,
  ...props
}) => {
  const IconComponent = iconMap[iconType] || iconMap["help"];

  return (
    <IconComponent
      className={cn("h-6 w-6 text-muted-foreground", className)}
      {...props}
    />
  );
};
