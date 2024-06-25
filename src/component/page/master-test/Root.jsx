import { useState, createContext, useContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import KMS_Rightbar from "../../backbone/KMS_RightBar";
import KMS_Rightbar from "../../part/KMS_RightBar"
import MasterTestIndex from "./Index";
import MasterTestPostTest from "./PostTest";
import MasterTestPreTest from "./PreTest";
import MasterTestPengerjaanTest from "./Test";
import MasterTestHasilTest from "./HasilTest";
import MasterTestDetailTest from "./DetailTest";
import MasterTestForum from "./Forum";
import MasterTestMateriPDF from "./MateriPDF";
import MasterTestMateriVideo from "./MateriVideo";
import MasterTestPengenalan from "./Pengenalan";
import AppContext_test from "./TestContext";

export default function MasterTest() {
  
  const [pageMode, setPageMode] = useState("index");
  const [marginRight, setMarginRight] = useState("40vh");
  const [isDataReady, setIsDataReady] = useState(false); 
  const [materiId, setMateriId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [quizType, setQuizType] = useState("");
  const [isOpen, setIsOpen] = useState();

  function handlePreTestClick_close() {
    setMarginRight("0vh");
  }

  function handlePreTestClick_open() {
    setMarginRight("40vh");
  }

  useEffect(() => {
    if (pageMode === "index" || pageMode === "pengerjaantest" || pageMode === "detailtest") {
      setMarginRight("0vh");
      setIsOpen(false);
    } else {
      setMarginRight("43vh");
      setIsOpen(true);
    }
  }, [pageMode]);

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return (
          <MasterTestIndex 
            onChangePage={handleSetPageMode} 
            isOpen={isOpen}
          />
        );
      case "pengenalan":
        return (
          <MasterTestPengenalan
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "pretest":
        return (
          <MasterTestPreTest
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "posttest":
          return <MasterTestPostTest onChangePage={handleSetPageMode} />;
      case "pengerjaantest":
        return <MasterTestPengerjaanTest 
          onChangePage={handleSetPageMode} 
          quizType={quizType}
          materiId={materiId}
        />;
      case "detailtest":
        return (
          <MasterTestDetailTest 
            onChangePage={handleSetPageMode} 
            quizType={quizType}
            materiId={materiId}
            quizId={quizId}
          />
        );
      case "hasiltest":
        return (
          <MasterTestHasilTest
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
          />
        );
      case "forum":
        return (
          <MasterTestForum 
            onChangePage={handleSetPageMode} 
            isOpen={isOpen}
          />
        );
      case "materipdf":
        return <MasterTestMateriPDF onChangePage={handleSetPageMode} />;
      case "materivideo":
        return <MasterTestMateriVideo onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(newPageMode, dataReady = false, key = "", isOpen = false, quizType = "") {
    setPageMode(newPageMode);
    setIsDataReady(dataReady);
    setMateriId(key);
    setIsOpen(isOpen);
    setQuizType(quizType);
  }
  function handleSetPageMode(newPageMode, quizType = "", key = "", quizKey = "") {
    setPageMode(newPageMode);
    setQuizType(quizType);
    setMateriId(key);
    setQuizId(quizKey);
  }

  return (
  <div style={{ marginRight: marginRight }}>
    <KMS_Rightbar
      handlePreTestClick_close={handlePreTestClick_close}
      handlePreTestClick_open={handlePreTestClick_open}
      isOpen={isOpen}
      onChangePage={handleSetPageMode}
      materiId={materiId}
    />
    {getPageMode()}
  </div>
  );

}
