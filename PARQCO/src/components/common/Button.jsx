// variant: "primary" | "secondary" | "danger"
function Button({ children, variant = "primary", size = "md", type = "button", disabled = false, onClick, title }) {
  const classes = ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : ""].filter(Boolean).join(" ");
  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} title={title}>
      {children}
    </button>
  );
}

export default Button;
