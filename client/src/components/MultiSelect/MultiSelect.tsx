import PropTypes from "prop-types";
import { useState, useMemo, useCallback } from "react";
import Dropdown from "monday-ui-react-core/dist/Dropdown";
import TextWithHighlight from "monday-ui-react-core/dist/TextWithHighlight";
import useFragrances from "../../hooks/useFragrances/useFragrances";
import "./MultiSelect.css";

export const MultiSelect = ({
  onChange,
  error: customError,
  maxSelections = 3,
  value = [],
  label = "Select Options",
}) => {
  const [errors, setErrors] = useState({
    invalid: false,
    duplicate: false,
  });

  const { data: fragrances, categories, loading, error } = useFragrances(true);

  const selectedOptions = useMemo(() => {
    if (!value?.length || !categories?.length) return [];
    return categories.filter((option) =>
      value.some((selected) => selected?.id === option?.id)
    );
  }, [value, categories]);

  const handleSelection = useCallback(
    (selected) => {
      if (!selected) {
        setErrors({ invalid: true, duplicate: false });
        onChange([]);
        return;
      }

      const categories = selected.map((option) => option.category);
      const hasDuplicates = categories.length !== new Set(categories).size;

      if (hasDuplicates) {
        setErrors((prev) => ({ ...prev, duplicate: true }));
        return;
      }

      const validSelection = selected.slice(0, maxSelections);
      setErrors({
        duplicate: false,
        invalid: validSelection.length !== maxSelections,
      });

      const mondayFormat = validSelection.map((option) => ({
        id: option.value,
        name: option.label,
      }));

      onChange(mondayFormat);
    },
    [maxSelections, onChange]
  );

  if (loading) {
    return <div className="multi-select-loading">Loading options...</div>;
  }

  if (error) {
    return (
      <div className="multi-select-error">
        Error loading options: {error.message}
      </div>
    );
  }

  const showError = customError || errors.invalid || errors.duplicate;

  return (
    <>
      <div className="multi-select-container">
        <Dropdown
          value={selectedOptions}
          onChange={handleSelection}
          options={categories}
          multi
          multiline
          size={Dropdown.sizes.MEDIUM}
          className="multi-select-dropdown"
          placeholder={`${label} (up to ${maxSelections})`}
          error={showError}
        />
        {showError && (
          <TextWithHighlight
            className="multi-select-error"
            text={`Please select exactly ${maxSelections} options`}
            type="danger"
          />
        )}
      </div>
      <div></div>
    </>
  );
};

MultiSelect.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  maxSelections: PropTypes.number,
  label: PropTypes.string,
};

export default MultiSelect;
