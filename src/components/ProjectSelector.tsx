import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { Project } from "../models/types";

interface ProjectSelectorProps {
  projects: Project[];
  currentProjectId: string | null;
  onChange: (projectId: string) => void;
  onCreate: (project: Omit<Project, "id">) => void;
  showCreateButton?: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  currentProjectId,
  onChange,
  onCreate,
  showCreateButton = false,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, "id">>({
    name: "",
    preparedBy: "",
    preparationDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    estimate: [],
    warehouse: [],
    locked: false,
    approved: false,
  });

  const handleCreate = () => {
    onCreate(newProject);
    setIsCreating(false);
    setNewProject({
      name: "",
      preparedBy: "",
      preparationDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      estimate: [],
      warehouse: [],
      locked: false,
      approved: false,
    });
  };

  return (
    <Box
      sx={{
        margin: "20px 0",
        display: "flex",
        alignItems: "center",
        marginLeft: 1,
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1, sm: 2 },
        width: "100%",
      }}
    >
      <FormControl
        variant="outlined"
        sx={{
          minWidth: 200,
          mr: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <InputLabel>Проект</InputLabel>
        <Select
          value={currentProjectId || ""}
          onChange={(e) => onChange(e.target.value as string)}
          label="Проект"
        >
          {projects.map((project) => (
            <MenuItem key={`${project.id}-${project.name}`} value={project.id}>
              {project.name} {project.locked && " (утвержден)"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showCreateButton && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsCreating(true)}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Новый проект
        </Button>
      )}

      <Dialog open={isCreating} onClose={() => setIsCreating(false)}>
        <DialogTitle>Создать новый проект</DialogTitle>
        <DialogContent>
          <TextField
            label="Название проекта"
            fullWidth
            margin="normal"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            required
            error={!newProject.name.trim()}
            helperText={!newProject.name.trim() ? "Обязательное поле" : ""}
          />
          <TextField
            label="Составитель сметы"
            fullWidth
            margin="normal"
            value={newProject.preparedBy}
            onChange={(e) =>
              setNewProject({ ...newProject, preparedBy: e.target.value })
            }
          />
          <TextField
            label="Дата составления"
            type="date"
            fullWidth
            margin="normal"
            value={newProject.preparationDate}
            onChange={(e) =>
              setNewProject({ ...newProject, preparationDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreating(false)}>Отмена</Button>
          <Button
            onClick={handleCreate}
            color="primary"
            disabled={!newProject.name}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectSelector;
