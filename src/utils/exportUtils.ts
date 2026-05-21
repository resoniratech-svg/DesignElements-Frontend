/**
 * Global Export Utilities covering CSV, JSON, and mock file downloads 
 * as well as helper wrappers around window.print() for PDF exports.
 */

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]).join(",");
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const csvContent = `${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
};

export const exportToJSON = (data: any, filename: string) => {
  if (!data) return;
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
};

export const downloadMockFile = (filename: string, content: string = "Placeholder content for generated file export.") => {
  // If the content is actually a URL, trigger a real download
  if (content.startsWith('http') || content.startsWith('/uploads')) {
    const link = document.createElement("a");
    link.href = content;
    link.download = filename;
    link.target = "_blank";
    link.click();
    return;
  }

  const extension = filename.split('.').pop()?.toLowerCase();
  let type = "text/plain";
  
  if (extension === "pdf") type = "application/pdf";
  else if (extension === "png") type = "image/png";
  else if (extension === "jpg" || extension === "jpeg") type = "image/jpeg";

  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
};

export const printDocument = () => {
  // Triggers the native browser print dialog, allowing easy "Save as PDF" 
  window.print();
};

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
