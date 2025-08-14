import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { EstimateItem, CostType, Unit } from "../../models/types";
import { SelectChangeEvent } from "@mui/material";

interface EstimateFormProps {
  item?: EstimateItem;
  onSave: (item: EstimateItem | Omit<EstimateItem, "id">) => void;
  onCancel: () => void;
}

const costTypes: CostType[] = ["Материалы", "Аренда", "Трудозатраты", "Услуги"];
const units: Unit[] = ["м²", "м/п", "шт", "компл.", "чел/час"];

const EstimateForm: React.FC<EstimateFormProps> = ({
  item,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<EstimateItem, "id">>({
    section: "",
    name: "",
    costType: "Материалы",
    unit: "м²",
    plannedQuantity: 0,
    unitCost: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        section: item.section,
        name: item.name,
        costType: item.costType,
        unit: item.unit,
        plannedQuantity: item.plannedQuantity,
        unitCost: item.unitCost,
      });
    }
  }, [item]);

  //валидация

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.section.trim()) newErrors.section = "Укажите раздел";
    if (!formData.name.trim()) newErrors.name = "Укажите наименование";

    // Приводим plannedQuantity к числу и проверяем
    const plannedQuantity = Number(formData.plannedQuantity);
    if (isNaN(plannedQuantity)) {
      newErrors.plannedQuantity = "Введите число";
    } else if (plannedQuantity <= 0) {
      newErrors.plannedQuantity = "Количество должно быть положительным";
    }

    // Приводим unitCost к числу и проверяем
    const unitCost = Number(formData.unitCost);
    if (isNaN(unitCost)) {
      newErrors.unitCost = "Введите число";
    } else if (unitCost <= 0) {
      newErrors.unitCost = "Стоимость должна быть положительной";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextChange =
    (field: "section" | "name") => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSelectChange =
    (field: "costType" | "unit") => (e: SelectChangeEvent) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value as CostType | Unit,
      }));
    };

  const handleNumberChange =
    (field: "plannedQuantity" | "unitCost") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [field]: value === "" ? "" : parseFloat(value),
        }));
      }
    };

  const handleSubmit = () => {
    // Заменяем пустые строки на 0 перед сохранением
    const dataToSave = {
      ...formData,
      plannedQuantity:
        formData.plannedQuantity === "" ? 0 : Number(formData.plannedQuantity),
      unitCost: formData.unitCost === "" ? 0 : Number(formData.unitCost),
    };

    if (validate()) {
      item ? onSave({ ...dataToSave, id: item.id }) : onSave(dataToSave);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      fullScreen={window.innerWidth < 600}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {item ? "Редактирование строки" : "Добавление новой строки"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Раздел"
          value={formData.section}
          onChange={handleTextChange("section")}
          fullWidth
          margin="normal"
          error={!!errors.section}
          helperText={errors.section}
        />

        <TextField
          label="Наименование"
          value={formData.name}
          onChange={handleTextChange("name")}
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Вид затрат</InputLabel>
          <Select
            value={formData.costType}
            onChange={handleSelectChange("costType")}
            label="Вид затрат"
          >
            {costTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Количество"
          type="number"
          value={formData.plannedQuantity === 0 ? "" : formData.plannedQuantity}
          onChange={handleNumberChange("plannedQuantity")}
          fullWidth
          margin="normal"
          error={!!errors.plannedQuantity}
          helperText={errors.plannedQuantity}
          inputProps={{
            min: 0,
            step: 1,
            inputMode: "decimal",
          }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Ед. изм.</InputLabel>
          <Select
            value={formData.unit || ""}
            onChange={handleSelectChange("unit")}
            label="Ед. изм."
          >
            {units.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Стоимость за единицу (руб)"
          type="number"
          value={formData.unitCost === 0 ? "" : formData.unitCost}
          onChange={handleNumberChange("unitCost")}
          fullWidth
          margin="normal"
          error={!!errors.unitCost}
          helperText={errors.unitCost}
          inputProps={{
            min: 0,
            step: 0.01,
            inputMode: "decimal",
          }}
        />

        <TextField
          label="Сумма (руб)"
          value={(
            Number(formData.plannedQuantity) * Number(formData.unitCost)
          ).toFixed(2)}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Отмена
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EstimateForm;
