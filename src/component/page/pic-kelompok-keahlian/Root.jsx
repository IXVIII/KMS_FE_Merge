import { useState } from "react";
import PICKKIndex from "./Index";
import PICKKEdit from "./Edit";
import PICKKDetailPublish from "./Detail";

export default function PICKK() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <PICKKIndex onChangePage={handleSetPageMode} />;
      case "edit":
        return <PICKKEdit onChangePage={handleSetPageMode} withID={dataID} />;
        case "detail":
        return <PICKKDetailPublish onChangePage={handleSetPageMode} withID={dataID} />;
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
