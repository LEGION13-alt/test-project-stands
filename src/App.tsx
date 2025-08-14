import React, { useState, useEffect } from "react";
import { Project } from "./models/types";
import { loadProjects, saveProjects } from "./services/storage";
import { mockProjects } from "./mockProjects";
import AppNav from "././components/AppNav";
import ProjectSelector from "././components/ProjectSelector";
import EstimateTable from "././components/Estimate/EstimateTable";
import WarehouseTable from "././components/Warehouse/WarehouseTable";
import ReportTable from "././components/Reports/ReportTable";
import { Typography, Box } from "@mui/material";

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "estimate" | "warehouse" | "report"
  >("estimate");

  // Функция для генерации уникальных ID
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    const loadedProjects = loadProjects();

    // Проверка и очистка от дубликатов
    const uniqueProjects =
      loadedProjects.length > 0
        ? loadedProjects.filter(
            (project, index, self) =>
              index === self.findIndex((p) => p.id === project.id)
          )
        : mockProjects;

    if (loadedProjects.length === 0) {
      saveProjects(mockProjects);
    }

    setProjects(uniqueProjects);
    setCurrentProjectId(uniqueProjects[0]?.id || null);
  }, []);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const handleProjectChange = (projectId: string) => {
    if (projects.some((p) => p.id === projectId)) {
      setCurrentProjectId(projectId);
    }
  };

  const handleProjectCreate = (newProject: Omit<Project, "id">) => {
    const newId = generateUniqueId();
    const project: Project = {
      ...newProject,
      id: newId,
      estimate: [],
      warehouse: [],
      locked: false,
      approved: false,
    };

    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setCurrentProjectId(newId);
  };

  // Общая функция для обновления проектов
  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    saveProjects(
      projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  return (
    <div className="app">
      {/* Обертка для лого и навигации */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          bgcolor: "background.paper",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mr: 3,
            fontWeight: "bold",
            color: "primary.main",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          FProduct
        </Typography>
        <AppNav activeTab={activeTab} onTabChange={setActiveTab} />
      </Box>

      <ProjectSelector
        projects={projects}
        currentProjectId={currentProjectId}
        onChange={handleProjectChange}
        onCreate={handleProjectCreate}
        showCreateButton={activeTab === "estimate"} //кнопка только на вкладке сметы!
      />
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        {currentProject && (
          <div className="tab-content">
            {activeTab === "estimate" && (
              <EstimateTable
                project={currentProject}
                onUpdate={handleProjectUpdate}
              />
            )}
            {activeTab === "warehouse" && (
              <WarehouseTable
                project={currentProject}
                onUpdate={handleProjectUpdate}
              />
            )}
            {activeTab === "report" && <ReportTable project={currentProject} />}
          </div>
        )}
      </Box>
    </div>
  );
};

export default App;
