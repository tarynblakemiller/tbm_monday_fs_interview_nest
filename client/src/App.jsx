import { Fragment } from "react";
import "vibe-storybook-components/index.css";
import "monday-ui-react-core/tokens";
import "monday-ui-react-core/dist/main.css";
import OrderForm from "./components/Order/OrderForm/OrderForm";
import "./App.css";

function App() {
  return (
    <Fragment>
      <div className="container">
        <OrderForm />
      </div>
    </Fragment>
  );
}

export default App;
