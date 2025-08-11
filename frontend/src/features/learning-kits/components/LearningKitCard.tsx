import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, MoreVertical, Pencil, Trash2 } from "lucide-react";

export function LearningKitCard({
  id,
  title,
  status = "active",
  updatedLabel = "Last updated 2 days ago",
  onEdit,
  onDelete,
}: {
  id: string;
  title: string;
  status?: "active" | "archived";
  updatedLabel?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card className="relative transition hover:shadow-sm hover:ring-1 hover:ring-border">
      <Link to={`/learning-kits/${id}`} className="absolute inset-0 z-0" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-10 h-8 w-8"
            aria-label="Actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CardHeader className="space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 pr-10 text-base font-medium">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "active" ? "bg-emerald-500" : "bg-muted-foreground"
            }`}
          />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        {updatedLabel}
      </CardContent>

      <CardFooter className="pt-2">
        <Button asChild size="sm" variant="secondary" className="z-10 w-full">
          <Link to={`/learning-kits/${id}`}>
            Open <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
