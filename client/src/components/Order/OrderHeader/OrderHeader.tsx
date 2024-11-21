import { IconButton } from "monday-ui-react-core";
import { Heading } from "monday-ui-react-core/next";
import Filter from "monday-ui-react-core/dist/icons/Filter";
import PropTypes from "prop-types";

export const OrderHeader = ({ onFilterClick }) => {
  return (
    <>
      <div className="order-maker-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Heading type="h2">Order Maker</Heading>
          <IconButton
            icon={Filter}
            ariaLabel="Filter the widget by everything"
            size={IconButton.sizes.SMALL}
            isClickable={true}
            onClick={onFilterClick}
          />
        </div>

        <button className="meatball-button">⋯</button>
      </div>
    </>
  );
};

OrderHeader.propTypes = {
  onFilterClick: PropTypes.func,
};
