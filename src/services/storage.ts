import { Project } from "../models/types";

const STORAGE_KEY = "test-project-stands";

export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const loadProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
