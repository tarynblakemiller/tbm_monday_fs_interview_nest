import { Button } from "monday-ui-react-core";
import PropTypes from "prop-types";

const OrderButton = ({ text, ...props }) => {
  return (
    <Button {...props} size={Button.sizes.MEDIUM}>
      {text}
    </Button>
  );
};

OrderButton.propTypes = {
  text: PropTypes.string.isRequired,
};

export default OrderButton;
