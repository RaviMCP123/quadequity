import { Form } from "react-bootstrap";
import type { FC } from "react";

interface InputProps {
  message: string;
}

const Input: FC<InputProps> = ({ message }) => {
  return (
    <div>
      {message && (
        <Form.Control.Feedback
          type="invalid"
          className="text-sm text-rose-300 pl-1 pt-1"
        >
          {message}
        </Form.Control.Feedback>
      )}
    </div>
  );
};

export default Input;
