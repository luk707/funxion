import React, { useState, useMemo, createContext } from "react";
import { render } from "react-dom";
import DataGrid, { Column, TextEditor, FormatterProps } from "react-data-grid";
import Funxion from "../index";

const test = "abcdefghijklmnop".split("");

// const CellFormatter = (props: FormatterProps<Row>) => {
//   const parsedFunxion = useMemo(
//     () => Funxion.parse(props.row[props.rowIdx]),
//     [props.row, props.rowIdx]
//   );
//   // get vars
//   const result = useMemo(
//     () => Funxion.exec(parsedFunxion, {}),
//     [parsedFunxion]
//   );
//   return;
// };

const columns: readonly Column<Row>[] = [
  {
    key: "id",
    name: "",
    frozen: true,
  },
  ...test.map((x) => ({
    key: x,
    name: x.toUpperCase(),
    editor: TextEditor,
  })),
];

interface Row {
  id: string;
  [key: string]: string;
}

function rowKeyGetter(row: Row) {
  return row.id;
}

const Spreadsheet = () => {
  const [rows, setRows] = useState<Row[]>(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map<Row>((i) => ({
      id: i.toString(),
      ...([test.reduce((acc, cur) => ({ ...acc, [cur]: "" }), {})] as {}),
    }))
  );

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      rowKeyGetter={rowKeyGetter}
      onRowsChange={setRows}
    />
  );
};

render(<Spreadsheet />, document.getElementById("root"));
