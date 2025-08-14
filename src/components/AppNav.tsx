import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

interface AppNavProps {
  activeTab: "estimate" | "warehouse" | "report";
  onTabChange: (tab: "estimate" | "warehouse" | "report") => void;
}

const AppNav: React.FC<AppNavProps> = ({ activeTab, onTabChange }) => {
  //навигация по вкладкам
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab label="Смета" value="estimate" />
        <Tab label="Склад" value="warehouse" />
        <Tab label="Отчет" value="report" />
      </Tabs>
    </Box>
  );
};

export default AppNav;
