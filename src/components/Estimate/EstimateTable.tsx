import React, { useState } from "react";
import { EstimateItem } from "../../models/types";
import { Project } from "../../models/types";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  TableContainer,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EstimateForm from "./EstimateForm";
import { Typography } from "@mui/material";
import { calculateEstimateTotals } from "../../services/calculations";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { exportProjectToExcel } from "../../utils/exportToExel";
import { Box } from "@mui/material";

interface EstimateTableProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

const EstimateTable: React.FC<EstimateTableProps> = ({ project, onUpdate }) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() => {
    const initialSections: Record<string, boolean> = {};
    const sections = Array.from(
      new Set(project.estimate.map((item) => item.section))
    );
    sections.forEach((section) => {
      initialSections[section] = false; // разделы  закрыты
    });
    return initialSections;
  });

  const [editingItem, setEditingItem] = useState<EstimateItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false); //утвердить смету?

  //калькулятор отчета
  const calculateTotals = () => calculateEstimateTotals(project.estimate);
  const totals = calculateTotals();

  const toggleSection = (section: string) => {
    //открыть раздел
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddItem = (item: Omit<EstimateItem, "id">) => {
    const newItem: EstimateItem = {
      ...item,
      id: Date.now().toString(),
    };
    const updatedProject: Project = {
      ...project,
      estimate: [...project.estimate, newItem],
    };
    onUpdate(updatedProject);
    setIsAdding(false);
  };

  const handleUpdateItem = (item: EstimateItem | Omit<EstimateItem, "id">) => {
    // Если пришел объект без id (новый элемент), добавляем id
    const updatedItem =
      "id" in item ? item : { ...item, id: Date.now().toString() };

    const updatedProject = {
      ...project,
      estimate: project.estimate.map((i) =>
        i.id === updatedItem.id ? updatedItem : i
      ),
    };
    onUpdate(updatedProject);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    const updatedProject = {
      ...project,
      estimate: project.estimate.filter((item) => item.id !== id),
    };
    onUpdate(updatedProject);
  };

  const handleApproveEstimate = () => {
    onUpdate({
      ...project,
      locked: true,
      approved: true,
    });
    setApproveDialogOpen(false); // Закрываем попап после подтверждения
  };

  // Группировка по разделам
  const sections = Array.from(
    new Set(project.estimate.map((item) => item.section))
  );

  //экспорт в эксель
  const handleExportToExcel = async () => {
    await exportProjectToExcel(project);
  };

  return (
    <div>
      {/* Информация о проекте */}
      <div
        style={{
          marginBottom: 20,
          padding: 16,
          backgroundColor: "#f5f5f5",
          borderRadius: 4,
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          <strong>Проект:</strong> {project.name}
        </Typography>
        <Box component="div" sx={{ mb: 2 }}>
          <strong>Составитель сметы:</strong>
          <TextField
            value={project.preparedBy}
            onChange={(e) =>
              onUpdate({ ...project, preparedBy: e.target.value })
            }
            disabled={project.locked}
            size="small"
            style={{ marginLeft: 10, width: 250 }}
            placeholder="Введите ФИО"
          />
        </Box>
        <Box component="div">
          <strong>Дата составления:</strong>
          <TextField
            type="date"
            value={
              project.preparationDate || new Date().toISOString().split("T")[0]
            }
            onChange={(e) =>
              onUpdate({ ...project, preparationDate: e.target.value })
            }
            disabled={project.locked}
            size="small"
            style={{ marginLeft: 10, marginBottom: 10 }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <div>
          <Button
            startIcon={<CheckCircleIcon />}
            variant="contained"
            sx={{
              backgroundColor: "#4caf50",
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
            onClick={() => setApproveDialogOpen(true)}
            disabled={project.locked}
          >
            Утвердить смету
          </Button>
          {/* Диалог подтверждения */}
          <Dialog
            sx={{
              "& .MuiDialog-paper": {
                minWidth: "400px",
                padding: "20px",
              },
            }}
            open={approveDialogOpen}
            onClose={() => setApproveDialogOpen(false)}
          >
            <DialogTitle>Подтверждение утверждения сметы</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Вы действительно хотите утвердить смету проекта "{project.name}
                "? После утверждения редактирование будет невозможно.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setApproveDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleApproveEstimate} autoFocus>
                Утвердить
              </Button>
            </DialogActions>
          </Dialog>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportToExcel}
            style={{ marginLeft: 10 }}
          >
            Экспорт в Excel
          </Button>
        </div>
      </div>
      {/* Кнопка добавления и формы */}
      <Button
        variant="contained"
        color="primary"
        style={{ marginLeft: 1, marginBottom: 10 }}
        startIcon={<AddIcon />}
        onClick={() => setIsAdding(true)}
        disabled={project.locked}
      >
        Добавить строку
      </Button>

      {isAdding && (
        <EstimateForm
          onSave={handleAddItem}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {editingItem && (
        <EstimateForm
          item={editingItem}
          onSave={handleUpdateItem}
          onCancel={() => setEditingItem(null)}
        />
      )}
      {/* Таблица сметы */}
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "100%",
          overflowX: "auto",
          "& .MuiTableCell-root": {
            padding: { xs: "8px", sm: "16px" },
          },
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableBody>
            {sections.map((section) => {
              const sectionItems = project.estimate.filter(
                (item) => item.section === section
              );
              const isExpanded = expandedSections[section];

              return (
                <React.Fragment key={section}>
                  {/* Строка с заголовком раздела */}
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => toggleSection(section)}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <Typography variant="subtitle1">{section}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Заголовки таблицы, показываемые только при раскрытом разделе */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>№</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Раздел</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Наименование
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Вид затрат
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Ед. изм.
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Кол-во</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Стоимость 1 ед.
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Сумма</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Действия
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Раскрывающиеся строки раздела */}
                  {isExpanded &&
                    sectionItems.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{item.section}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.costType}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.plannedQuantity}</TableCell>
                        <TableCell>{item.unitCost}</TableCell>
                        <TableCell>
                          {Number(item.plannedQuantity) * Number(item.unitCost)}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => setEditingItem(item)}
                            disabled={project.locked}
                            size="small"
                          >
                            Редактировать
                          </Button>
                          <Button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={project.locked}
                            size="small"
                          >
                            Удалить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Блок с итогами */}
      <TableContainer
        component={Paper}
        sx={{
          mt: 3,
          mb: 3,
          maxWidth: { xs: "100%", sm: 600 },
          overflowX: "auto",
        }}
      >
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={2}
                sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Итоговые суммы
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Материалы</TableCell>
              <TableCell align="right">
                {totals.materialSum.toFixed(2)} руб.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Аренда</TableCell>
              <TableCell align="right">
                {totals.rentSum.toFixed(2)} руб.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Трудозатраты</TableCell>
              <TableCell align="right">
                {totals.laborSum.toFixed(2)} руб.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Услуги</TableCell>
              <TableCell align="right">
                {totals.servicesSum.toFixed(2)} руб.
              </TableCell>
            </TableRow>

            <TableRow sx={{ borderTop: "1px solid #e0e0e0" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Итого без НДС</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                {totals.totalWithoutVAT.toFixed(2)} руб.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>НДС 20%</TableCell>
              <TableCell align="right">{totals.vat.toFixed(2)} руб.</TableCell>
            </TableRow>

            <TableRow
              sx={{ "& td": { fontWeight: "bold", fontSize: "1.05rem" } }}
            >
              <TableCell>Всего с НДС</TableCell>
              <TableCell align="right">
                {totals.totalWithVAT.toFixed(2)} руб.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Непредвиденные расходы (5%)</TableCell>
              <TableCell align="right">
                {totals.contingency.toFixed(2)} руб.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default EstimateTable;
