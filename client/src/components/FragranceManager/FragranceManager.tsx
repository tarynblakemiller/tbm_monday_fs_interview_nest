import { useState, FormEvent, useMemo, useEffect } from "react";
import { fragranceApi } from "../../services/api";
import useFragrances from "../../hooks/useFragrances/useFragrances";
import { Button, Dropdown, TextField } from "monday-ui-react-core";
import {
  Fragrance,
  FormData,
  UseFragrancesReturn,
  FragranceManagerProps,
  Category,
} from "./types";

import "./FragranceManager.css";
import ErrorMessage from "../Error/Error.js";

const INITIAL_FORM_STATE: FormData = {
  id: "",
  fragrance_id: "",
  name: "",
  category: "",
  description: "",
};

const FragranceManager: React.FC<FragranceManagerProps> = () => {
  const {
    data: fragrances,
    categories,
    refetch,
    nextIds,
  } = useFragrances(true) as UseFragrancesReturn;

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.value === formData.category) || null,
    [categories, formData.category]
  );

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
  };

  const handleDropdownChange = (value: Category | null) => {
    if (!value) {
      setFormData((prev) => ({ ...prev, category: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, category: value.value }));
  };

  const handleTextChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.category) {
        setErrorMessage("Name and category are required");
        return;
      }
      const payload: Partial<Fragrance> = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        image_url: "https://example.com/placeholder.jpg",
      };
      console.log("PAYLOAD", payload);

      if (editingId) {
        await fragranceApi.update(editingId, formData);
      } else {
        const payload = {
          name: formData.name,
          category: formData.category,
          description: formData.description,
          image_url: "https://example.com/placeholder.jpg",
        };
        await fragranceApi.create(payload);
      }
      resetForm();
      await refetch();
      setErrorMessage(null);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error handling fragrance");
      }
      console.error("Error handling fragrance:", error);
    }
  };

  const handleEdit = (fragrance: Fragrance): void => {
    setEditingId(fragrance.id);
    setFormData({
      id: fragrance.id,
      fragrance_id: fragrance.fragrance_id,
      name: fragrance.name,
      category: fragrance.category,
      description: fragrance.description,
    });
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await fragranceApi.delete(id);
      await refetch();
      setErrorMessage(null);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error deleting fragrance");
      }
      console.error("Error deleting fragrance:", error);
    }
  };

  return (
    <div className="fragrance-manager">
      <div className="fragrance-header">
        {errorMessage && <ErrorMessage message={errorMessage} />}

        <Button
          onClick={() => setShowForm(!showForm)}
          kind={Button.kinds.SECONDARY}
          size={Button.sizes.XS}
        >
          {showForm ? "Hide Form" : "Add New Fragrance"}
        </Button>
      </div>

      <div className="fragrance-content">
        {showForm && (
          <form onSubmit={handleSubmit} className="fragrance-form">
            <TextField
              name="id"
              placeholder="ID"
              value={editingId ? formData.id : nextIds.id}
              onChange={handleTextChange("id")}
              size={TextField.sizes.MEDIUM}
              disabled
              readonly
            />
            <TextField
              name="fragrance_id"
              placeholder="Fragrance ID"
              value={editingId ? formData.fragrance_id : nextIds.fragrance_id}
              onChange={handleTextChange("fragrance_id")}
              size={TextField.sizes.MEDIUM}
              disabled
              readonly
            />
            <TextField
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleTextChange("name")}
              size={TextField.sizes.MEDIUM}
              required
            />
            <Dropdown
              placeholder="Select Category"
              options={categories}
              value={selectedCategory}
              onChange={handleDropdownChange}
              required
            />
            <TextField
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleTextChange("description")}
              size={TextField.sizes.MEDIUM}
              required
            />
            <Button
              type="submit"
              kind={Button.kinds.SECONDARY}
              size={Button.sizes.XS}
            >
              {editingId ? "Update" : "Add"} Fragrance
            </Button>
            <Button
              type="button"
              kind={Button.kinds.TERTIARY}
              size={Button.sizes.XS}
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancel
            </Button>
          </form>
        )}
        <div className="fragrance-list">
          {fragrances?.map((fragrance: Fragrance) => (
            <div key={fragrance.id} className="fragrance-row">
              <div className="fragrance-details">
                <div className="fragrance-id">ID: {fragrance.id}</div>
                <div className="fragrance-main">
                  <strong>Name: {fragrance.name}</strong>
                  <span>Category: {fragrance.category}</span>
                </div>
                <div className="fragrance-desc">
                  Description: {fragrance.description}
                </div>
              </div>
              <div className="fragrance-actions">
                <Button
                  kind={Button.kinds.SECONDARY}
                  size={Button.sizes.XS}
                  onClick={() => {
                    handleEdit(fragrance);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(fragrance.id)}
                  kind={Button.kinds.TERTIARY}
                  size={Button.sizes.XS}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default FragranceManager;
