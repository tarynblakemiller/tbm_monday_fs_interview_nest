export const generateOrderId = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `ORD-${year}${month}${day}-${randomChars}`;
};
