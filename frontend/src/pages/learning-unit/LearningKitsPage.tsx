import { useState } from "react";
import { Plus } from "lucide-react";
import { LearningKitCard } from "@/features/learning-kits/components/LearningKitCard";
import { CreateLearningKitCard } from "@/features/learning-kits/components/CreateLearningKitCard";
import {
  CreateLearningKitDialog,
  type CreateLearningKitValues,
} from "@/features/learning-kits/components/CreateLearningKitDialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Fab } from "@/components/fab.tsx";

type Kit = {
  id: string;
  title: string;
  status?: "active" | "archived";
  updatedAt: number;
};

// TODO Replace with real data from backend API
const HARD_CODED: Kit[] = [
  {
    id: "1",
    title: "Ausrüstung",
    status: "active",
    updatedAt: Date.now() - 2 * 864e5,
  },
  { id: "2", title: "Erste Hilfe", updatedAt: Date.now() - 3 * 864e5 },
  {
    id: "3",
    title: "Sicherheitsgrundlagen",
    updatedAt: Date.now() - 864e5,
  },
  { id: "4", title: "Kommunikation", updatedAt: Date.now() - 4 * 864e5 },
];

export function LearningKitsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [kits, setKits] = useState<Kit[]>(HARD_CODED);

  // TODO Handle with Backend API in real app
  function handleCreate(values: CreateLearningKitValues) {
    setKits((prev) => [
      {
        id: String(Date.now()),
        title: values.title,
        status: "active",
        updatedAt: Date.now(),
      },
      ...prev,
    ]);
  }

  return (
    <div className="space-y-6 max-w-screen-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Learning Kits</h1>
          <Badge variant="secondary">{kits.length}</Badge>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kits.map((k) => (
          <LearningKitCard
            key={k.id}
            id={k.id}
            title={k.title}
            status={k.status}
            updatedLabel={`Last updated ${Math.round((Date.now() - k.updatedAt) / 864e5)} days ago`}
            onEdit={() => console.log("edit", k.id)}
            onDelete={() => console.log("delete", k.id)}
          />
        ))}
        <CreateLearningKitCard onClick={() => setDialogOpen(true)} />
      </div>

      <Fab onClick={() => setDialogOpen(true)} aria-label="Create learning kit">
        <Plus className="h-5 w-5" />
      </Fab>

      <CreateLearningKitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
