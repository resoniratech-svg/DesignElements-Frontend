
/**
 * Utility to handle base64 file downloads and previews
 */
export const downloadBase64File = (base64String: string, fileName: string) => {
  if (!base64String || !base64String.startsWith('data:')) {
    console.error('Invalid base64 string');
    return;
  }

  try {
    // 1. Extract MIME type
    const parts = base64String.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (!mimeMatch) return;
    
    const mimeType = mimeMatch[1];
    
    // 2. Map common MIME types to extensions if the filename doesn't have one or has wrong one
    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'text/plain': 'txt',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    };

    let actualExt = mimeToExt[mimeType] || mimeType.split('/')[1] || 'bin';
    
    // Clean up filename: remove existing extension if any, and add the correct one
    let baseName = fileName.replace(/\.[^/.]+$/, "");
    const finalFileName = `${baseName}.${actualExt}`;

    // 3. Create Blob
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mimeType });
    
    // 4. Create Object URL
    const fileURL = URL.createObjectURL(blob);
    
    // 5. Action: For images and PDFs, opening in new tab is often better for "viewing"
    // For others, download is better.
    const viewableTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
    
    if (viewableTypes.includes(mimeType)) {
      window.open(fileURL, '_blank');
    } else {
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Clean up URL after some time
    setTimeout(() => URL.revokeObjectURL(fileURL), 60000);
    
  } catch (err) {
    console.error('Error processing file:', err);
    // Fallback: original simple download if blob creation fails
    const link = document.createElement("a");
    link.href = base64String;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
