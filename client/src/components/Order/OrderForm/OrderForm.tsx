import axios from "axios";
import PropTypes from "prop-types";
import { useState, FormEvent } from "react";
import {
  TabList,
  Flex,
  Tab,
  TabPanel,
  Divider,
  TextField,
} from "monday-ui-react-core";
import OrderButton from "../Button/OrderButton";
import { OrderHeader } from "../OrderHeader/OrderHeader";
import MultiSelect from "../../MultiSelect/MultiSelect";
import Error from "../../Error/Error";
import FragranceManager from "../../FragranceManager/FragranceManager";
import { FormData, Label, initialState } from "./types";

import ErrorMessage from "../../Error/Error";

import "./OrderForm.css";
import useFragrances from "../../../hooks/useFragrances/useFragrances";
import { generateOrderId } from "../../../utils/generators";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const OrderForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { data, loading, error: fragranceError } = useFragrances(true);
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const handleChange = (fieldName: string, value: string | Label[]) => {
    setFormData((prev) => {
      let updatedValues = { ...prev.columnValues };
      console.log("UPDATED VALUES", updatedValues);
      switch (fieldName) {
        case "firstName":
          updatedValues.text = value as string;
          break;
        case "lastName":
          updatedValues.text6 = value as string;
          break;
        case "quantity":
          updatedValues.numbers = parseInt(value as string) || 0;
          break;
        case "fragrances": {
          updatedValues.dropdown = {
            labels: value as Label[],
          };
          break;
        }
      }

      return {
        ...prev,
        columnValues: updatedValues,
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const columnValues = {
        text: formData.columnValues.text,
        text6: formData.columnValues.text6,
        numbers: formData.columnValues.numbers,
        dropdown: {
          labels: formData.columnValues.dropdown.labels.map(
            (label) => label.id
          ),
        },
        status: { label: "New Order" },
        date_1: { date: new Date().toISOString().split("T")[0] },
      };

      console.log(columnValues);

      const mondayResponse = await apiClient.post("/orders", {
        boardId: formData.boardId,
        itemName: generateOrderId(),
        columnValues,
        groupId: "topics",
      });
      console.log("Monday Response:", mondayResponse);

      const { data, status } = mondayResponse;
      if (status === 200) {
        console.log(data.data.create_item.id);
        setFormData(initialState);
        return data.data.create_item.id;
      } else {
        return undefined;
      }
      setErrorMessage(null);
    } catch (error) {
      if (error instanceof Error) {
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
        console.error("Unhandled error:", error);
      }
    }
  };

  return (
    <div className="order-wrapper">
      {errorMessage && <ErrorMessage message={errorMessage} />}
      <Flex
        justify={Flex.justify.START}
        align={Flex.align.CENTER}
        className="order-header"
      >
        <OrderHeader onFilterClick={() => console.log("Filter clicked")} />
        <TabList
          activeTabId={activeTab}
          onTabChange={handleTabChange}
          className="order-tabs"
        >
          <Tab tabInnerClassName="no-underline">Order Details</Tab>
          <Tab tabInnerClassName="no-underline">Manage Fragrances</Tab>
        </TabList>
      </Flex>
      <Divider direction="horizontal" />

      {activeTab === 0 ? (
        <TabPanel id={0}>
          <div className="order-maker-container">
            {errorMessage && <Error message={errorMessage} />}
            <form onSubmit={handleSubmit} className="input-field-container">
              <div className="input-grid-container">
                <div className="input-item">
                  <TextField
                    name="firstName"
                    title="Client First Name"
                    placeholder="Taryn"
                    value={formData.columnValues.text}
                    onChange={(value) => handleChange("firstName", value)}
                    size={TextField.sizes.SMALL}
                    required
                  />
                </div>
                <TextField
                  title="Client Last Name"
                  placeholder="Miller"
                  value={formData.columnValues.text6}
                  onChange={(value) => handleChange("lastName", value)}
                  size={TextField.sizes.SMALL}
                  required
                />
                <TextField
                  name="quantity"
                  title="Quantity"
                  placeholder="0"
                  value={formData.columnValues.numbers.toString()}
                  onChange={(value) => handleChange("quantity", value)}
                  type="number"
                  min="1"
                  max="3"
                  size={TextField.sizes.SMALL}
                  required
                />
              </div>
              <div>
                <MultiSelect
                  value={formData.columnValues.dropdown.labels}
                  onChange={(selected) => handleChange("fragrances", selected)}
                  maxSelections={3}
                  label="Select Scents"
                  options={data}
                  loading={loading}
                  error={!!fragranceError}
                />
              </div>
              <div className="order-btn-container">
                <OrderButton onClick={handleSubmit} text={"Start Order"} />
              </div>
            </form>
          </div>
        </TabPanel>
      ) : (
        <TabPanel key="fragrance-manager">
          <div className="fragrance-manager-container">
            <FragranceManager onClose={() => setActiveTab(0)} />
          </div>
        </TabPanel>
      )}
    </div>
  );
};

OrderForm.propTypes = {
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
};

export default OrderForm;
