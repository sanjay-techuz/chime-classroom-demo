export function rosterSize(elHeight: number, attdLength: number, isMobileView: boolean) {
  const maxCols = 7;
  let cols = 1;
  for (cols; cols <= maxCols; cols++) {
    if (attdLength <= cols * cols) {
      break;
    }
  }
  let row = Math.ceil(attdLength / cols);
  if (isMobileView && row === 1) {
    row = 2;
  }
  const dd = 100 / cols - 1;
  const Twidth = `${dd}%`;
  const Theight = `${elHeight / row}px`;
  return { width: Twidth, height: Theight };
}
