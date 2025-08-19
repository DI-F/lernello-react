import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Eye, Pencil, PencilOff } from "lucide-react";

const ToggleViewButton: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const previewMode = path.endsWith("/training");

  const handleValueChange = (value: string) => {
    if (value === "edit" && previewMode) {
      navigate(path.replace(/\/training$/, ""));
    } else if (value === "preview" && !previewMode) {
      navigate(`${path}/training`);
    }
  };

  function PencilState() {
    if (previewMode) {
      return <PencilOff />;
    } else {
      return <Pencil />;
    }
  }

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      className="btn-group preset-filled-surface-100-900"
      value={previewMode ? "preview" : "edit"}
      onValueChange={handleValueChange}
    >
      <ToggleGroupItem value="edit" aria-label="Toggle editor">
        <PencilState />
      </ToggleGroupItem>
      <ToggleGroupItem value="preview" aria-label="Toggle preview">
        <Eye />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ToggleViewButton;
