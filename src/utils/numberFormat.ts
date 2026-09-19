/**
 * Formats a numeric input string with thousand separators (commas),
 * while preserving ongoing user typing (e.g. trailing decimal points).
 */
export function formatWithCommas(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value).replace(/,/g, "");
  
  // Remove any character that isn't a digit or dot, keeping only the first dot
  const cleanStr = str.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
  if (!cleanStr) return "";

  const parts = cleanStr.split(".");
  const intPart = parts[0];
  const decPart = parts.length > 1 ? parts[1] : undefined;

  // Format integer part with commas
  const formattedInt = intPart === "" ? "0" : Number(intPart).toLocaleString("en-US");

  if (decPart !== undefined) {
    return `${formattedInt}.${decPart}`;
  }
  return formattedInt;
}

/**
 * Strips commas from a formatted string and returns clean numeric string.
 */
export function stripCommas(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "";
  return String(value).replace(/,/g, "").trim();
}
