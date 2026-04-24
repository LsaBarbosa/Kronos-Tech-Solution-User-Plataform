export const formatSalary = (salary: number | undefined) => {
  if (salary === undefined || salary === null) return "N/A";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(salary);
};

export const formatPhone = (phone: string | undefined) => {
  if (!phone) return "N/A";
  const cleaned = `${phone}`.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  const matchShort = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (matchShort) {
    return `(${matchShort[1]}) ${matchShort[2]}-${matchShort[3]}`;
  }
  return phone;
};

export const getFirstName = (fullName: string | undefined): string => {
  if (!fullName) return "Usuário";
  return fullName.trim().split(/\s+/)[0];
};

export const getSecondName = (fullName: string | undefined): string => {
  if (!fullName) return "Usuário";
  return fullName.trim().split(/\s+/)[1] ?? "";
};

export const getThemeCardClasses = (baseColor: string, isClickable = false) => {
  let borderColor;
  let rawColor;

  switch (baseColor) {
    case "primary":
      borderColor = "border-l-4 border-l-primary";
      rawColor = "primary";
      break;
    case "destructive":
      borderColor = "border-l-4 border-l-destructive";
      rawColor = "destructive";
      break;
    case "success":
      borderColor = "border-l-4 border-l-green-600";
      rawColor = "green-600";
      break;
    case "yellow-600":
      borderColor = "border-l-4 border-l-yellow-600";
      rawColor = "yellow-600";
      break;
    default:
      borderColor = "border-l-4 border-l-border";
      rawColor = "primary";
  }

  const interactiveClasses = `
    shadow-card
    transition-all duration-300
    hover:shadow-xl
    hover:shadow-${rawColor}/20
    hover:border-l-primary/80
  `;

  const cursorClass = isClickable ? "cursor-pointer" : "cursor-default";

  return `${borderColor} ${interactiveClasses} ${cursorClass}`;
};
