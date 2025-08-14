import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  TableContainer,
  Paper,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Project } from "../../models/types";
import WarehouseForm from "./WarehouseForm";
import { format } from "date-fns";

interface WarehouseTableProps {
  project: Project & {
    warehouse: Array<{
      id: string;
      projectId: string;
      date: string;
      itemId: string;
      actualQuantity: number;
      comment: string;
    }>;
  };
  onUpdate: (project: Project) => void;
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({
  project,
  onUpdate,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number | "">("");

  // оставляем только материалы из сметы
  const materialWarehouseEntries = project.warehouse.filter((entry) => {
    const material = project.estimate.find((item) => item.id === entry.itemId);
    return material && material.costType === "Материалы";
  });

  const handleAddEntry = (entry: {
    projectId: string;
    date: string;
    itemId: string;
    actualQuantity: number;
    comment: string;
  }) => {
    // проверка: материал существует в смете и является материалом
    const material = project.estimate.find(
      (item) => item.id === entry.itemId && item.costType === "Материалы"
    );

    if (!material) {
      alert("Выбранный материал не найден в смете проекта");
      return;
    }

    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    const updatedProject = {
      ...project,
      warehouse: [...project.warehouse, newEntry],
    };
    onUpdate(updatedProject);
    setIsAdding(false);
  };

  // Получаем информацию только о материалах из сметы
  const getMaterialInfo = (itemId: string) => {
    const item = project.estimate.find((i) => i.id === itemId);
    return item && item.costType === "Материалы" ? item : null;
  };

  const calculateEntrySum = (itemId: string, quantity: number) => {
    const material = getMaterialInfo(itemId);
    return material ? quantity * Number(material.unitCost) : 0;
  };

  const calculateTotalSum = () => {
    return materialWarehouseEntries.reduce((sum, entry) => {
      return sum + calculateEntrySum(entry.itemId, entry.actualQuantity);
    }, 0);
  };

  const handleEditStart = (entry: any) => {
    setEditingId(entry.id);
    setEditQuantity(entry.actualQuantity || "");
  };

  const handleEditSave = () => {
    if (!editingId) return;

    // Если значение пустое, сохраняем как 0
    const quantityToSave = editQuantity === "" ? 0 : Number(editQuantity);

    const updatedProject = {
      ...project,
      warehouse: project.warehouse.map((entry) =>
        entry.id === editingId
          ? { ...entry, actualQuantity: quantityToSave }
          : entry
      ),
    };
    onUpdate(updatedProject);
    setEditingId(null);
  };

  // Получаем плановое количество только для материалов
  const getPlannedQuantity = (itemId: string) => {
    const material = getMaterialInfo(itemId);
    return material ? material.plannedQuantity : 0;
  };

  // Расчет разницы между планом и фактом
  const calculateDifference = (itemId: string, actualQuantity: number) => {
    return Number(getPlannedQuantity(itemId)) - actualQuantity;
  };

  // Расчет общих плановых количеств только для материалов
  const totalPlannedQuantity = project.estimate
    .filter((item) => item.costType === "Материалы")
    .reduce((sum, item) => sum + Number(item.plannedQuantity), 0);

  // Расчет общего фактического количества только для материалов
  const totalActualQuantity = materialWarehouseEntries.reduce(
    (sum, entry) => sum + entry.actualQuantity,
    0
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => setIsAdding(true)}
        sx={{ marginLeft: 1, marginBottom: 2 }}
      >
        Добавить списание
      </Button>

      {isAdding && (
        <WarehouseForm
          project={project}
          onSave={handleAddEntry}
          onCancel={() => setIsAdding(false)}
        />
      )}

      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "100%",
          overflowX: "auto",
          "& .MuiTableCell-root": {
            padding: { xs: "8px", sm: "16px" },
            whiteSpace: "nowrap",
          },
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ backgroundColor: "rgb(245, 245, 245)" }}>
            <TableRow>
              <TableCell sx={{ minWidth: "120px", fontWeight: "bold" }}>
                Дата
              </TableCell>
              <TableCell sx={{ width: "200px", fontWeight: "bold" }}>
                Материал
              </TableCell>
              <TableCell sx={{ width: "100px", fontWeight: "bold" }}>
                Ед. изм.
              </TableCell>
              <TableCell sx={{ width: "100px", fontWeight: "bold" }}>
                План
              </TableCell>
              <TableCell sx={{ width: "150px", fontWeight: "bold" }}>
                Факт
              </TableCell>
              <TableCell sx={{ width: "150px", fontWeight: "bold" }}>
                Разница
              </TableCell>
              <TableCell sx={{ width: "120px", fontWeight: "bold" }}>
                Сумма
              </TableCell>
              <TableCell sx={{ minWidth: "200px", fontWeight: "bold" }}>
                Комментарий
              </TableCell>
              <TableCell sx={{ width: "150px", fontWeight: "bold" }}>
                Действия
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materialWarehouseEntries.map((entry) => {
              //изменить факт
              const material = getMaterialInfo(entry.itemId);
              const isEditing = editingId === entry.id;
              const plannedQty = getPlannedQuantity(entry.itemId);
              const difference = calculateDifference(
                entry.itemId,
                isEditing
                  ? editQuantity === ""
                    ? 0
                    : Number(editQuantity)
                  : entry.actualQuantity
              );

              const currentSum = calculateEntrySum(
                entry.itemId,
                isEditing
                  ? editQuantity === ""
                    ? 0
                    : Number(editQuantity)
                  : entry.actualQuantity
              );
              return (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.date), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell>
                    {material?.name || "Неизвестный материал"}
                  </TableCell>
                  <TableCell>{material?.unit || ""}</TableCell>
                  <TableCell>{plannedQty}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        value={editQuantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditQuantity(
                            value === "" ? "" : Math.max(0, Number(value))
                          );
                        }}
                        size="small"
                        sx={{ width: "80px" }}
                        inputProps={{ min: 0, step: 1 }}
                      />
                    ) : (
                      entry.actualQuantity
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: difference < 0 ? "error.main" : "inherit",
                      fontWeight: difference < 0 ? "bold" : "normal",
                    }}
                  >
                    {difference}
                  </TableCell>
                  <TableCell>{currentSum.toFixed(2)} руб.</TableCell>
                  <TableCell>{entry.comment}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleEditSave}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          Сохранить
                        </Button>
                        <Button size="small" onClick={() => setEditingId(null)}>
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditStart(entry)}
                      >
                        Изменить
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell colSpan={3} align="right">
                <strong>Итого:</strong>
              </TableCell>
              <TableCell>
                <strong>{totalPlannedQuantity}</strong>
              </TableCell>
              <TableCell>
                <strong>{totalActualQuantity}</strong>
              </TableCell>
              <TableCell
                sx={{
                  color:
                    totalPlannedQuantity - totalActualQuantity < 0
                      ? "error.main"
                      : "inherit",
                  fontWeight: "bold",
                }}
              >
                <strong>{totalPlannedQuantity - totalActualQuantity}</strong>
              </TableCell>
              <TableCell>
                <strong>{calculateTotalSum().toFixed(2)} руб.</strong>
              </TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default WarehouseTable;
