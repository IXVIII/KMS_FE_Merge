import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import profilePicture from "../../../assets/tes.jpg";
import KMS_PDFViewer from "../../part/KMS_PDFViewer";
import KMS_Rightbar from "../../part/KMS_RightBar";
// import KMS_SB_RightBar from '../../part/KMS_SB_RightBar';
import AppContext_test from "./TestContext";
const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Kode Test": null,
    "Nama Test": null,
    "Alamat Test": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Kode Test] asc", Text: "Kode Test [↑]" },
  { Value: "[Kode Test] desc", Text: "Kode Test [↓]" },
  { Value: "[Nama Test] asc", Text: "Nama Test [↑]" },
  { Value: "[Nama Test] desc", Text: "Nama Test [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterTestIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Kode Test] asc",
    status: "Aktif",
  });
  const [marginRight, setMarginRight] = useState("5vh");

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  const formUpdate = useRef({
    materiId: AppContext_test.materiId,
    karyawanId: "1",
    totalProgress: "0", 
    statusMateri_PDF: "",
    statusMateri_Video: "",
    statusSharingExpert_PDF: "",
    statusSharingExpert_Video: "",
    createdBy: "Fahriel",
  });

  if (AppContext_test.progresMateri == "materi_pdf") {
    formUpdate.current.statusMateri_PDF = "Done";
  } else {
    formUpdate.current.statusSharingExpert_PDF = "Done";
  }

  async function saveProgress() {
    try {
      AppContext_test.refreshPage += 1;
      await axios.post("http://localhost:8080/Materis/SaveProgresMateri", formUpdate.current);
      fetchDataWithRetry_rightBar();
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }

  const fetchDataWithRetry_rightBar = async (retries = 10, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post("http://localhost:8080/Materis/GetProgresMateri", {
          materiId: AppContext_test.materiId,
          karyawanId: '1',
        });
        // const response = await UseFetch(
        //   API_LINK + "Materis/GetProgresMateri",
        //   {materiId: AppContext_test.materiId, karyawanId: '1',}
        // );
        if (response.data != 0) {
          AppContext_test.refreshPage += 1;
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching progres data:", error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  };

  useEffect(() => {
    saveProgress();
  }, []);

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: searchFilterStatus.current.value,
      };
    });
  }

  function handlePreTestClick_close() {
    setMarginRight("10vh");
  }

  function handlePreTestClick_open() {
    setMarginRight("48vh");
  }

  useEffect(() => {
    document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
    const sidebarMenuElement = document.querySelector('.sidebarMenu');
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add('sidebarMenu-hidden');
    }
  }, []);

  const circleStyle = {
    width: '50px',
    height: '50px',
    backgroundColor: 'lightgray',
    marginRight: '20px'
  };

  const pdfUrl = 'FILE_1716642860929.pdf';
  
  return (
    <>
      <div className="d-flex flex-column">
        {/* <KMS_Rightbar handlePreTestClick_close={handlePreTestClick_close} handlePreTestClick_open={handlePreTestClick_open}/> */}
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data Test."
            />
          </div>
        )}
        <div className="flex-fill"></div>
        <div className="mt-3">
          {/* {isLoading ? (
            <Loading />
          ) : ( */}
            <>
              <div style={{ marginRight: marginRight }}>
                <KMS_PDFViewer pdfFileName={pdfUrl}/>
              </div>
            </>
          {/* )} */}
        </div>
      </div>
    </>
  );
}
