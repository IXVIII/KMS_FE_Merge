import { useState } from "react";
import ProgramIndex from "./Index";
import ProgramAdd from "./AddProgram";
import KategoriProgramAdd from "./AddKategoriProgram";
import ProgramEdit from "./EditProgram";
import KategoriProgramEdit from "./EditKategoriProgram";
import KKDetailProgram from "./DetailKK";

export default function Program() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <ProgramIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <ProgramAdd onChangePage={handleSetPageMode} withID={dataID} />;
      case "addKategori":
        return (
          <KategoriProgramAdd
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
        case "detailPublish":
        return (
          <KKDetailProgram
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return <ProgramEdit onChangePage={handleSetPageMode} withID={dataID} />;
      case "editKategori":
        return (
          <KategoriProgramEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
