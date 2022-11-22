export function getFileType(text: string) {
    const fileType = text.split(".").pop();
    return fileType;
  }
  