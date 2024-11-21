interface ErrorMessageProps {
  message?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className="error-message"
      style={{ color: "red", marginBottom: "10px" }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
