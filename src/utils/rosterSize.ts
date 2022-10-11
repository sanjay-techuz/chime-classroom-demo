export function rosterSize(elHeight: number, attdLength: number) {
  const maxCols = 7;
  let cols = 1;
  for (cols; cols <= maxCols; cols++) {
    if (attdLength <= cols * cols) {
      break;
    }
  }
  let row = Math.ceil(attdLength / cols);
  // if (row === 1) {
  //   row = 1.5;
  // }
  const dd = 100 / cols - 1;
  const Twidth = `${dd}%`;
  const Theight = `${elHeight / row}px`;
  return { width: Twidth, height: Theight };
}
