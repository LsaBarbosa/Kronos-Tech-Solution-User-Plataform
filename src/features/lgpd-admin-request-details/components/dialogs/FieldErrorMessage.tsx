interface FieldErrorMessageProps {
  id: string;
  message?: string;
}

export const FieldErrorMessage = ({ id, message }: FieldErrorMessageProps) => {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-[#B91C1C]" role="alert">
      {message}
    </p>
  );
};

export default FieldErrorMessage;
