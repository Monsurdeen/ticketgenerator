export function Button({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-md disabled:cursor-not-allowed disabled:opacity-60 ${className}`}>
      {children}
    </button>
  );
}
