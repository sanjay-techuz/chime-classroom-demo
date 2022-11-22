export function getFileName(text: string) {
    const fileName = text.split("/").pop();
    return fileName;
  }
  