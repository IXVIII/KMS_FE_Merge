import { useEffect, useRef, useState, useContext } from "react";
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
import SideBar from "../../backbone/SideBar";
import KMS_VideoPlayer from "../../part/KMS_VideoPlayer";
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

  // console.log(materiId)
  
  
  const formUpdate = useRef({
    materiId: AppContext_test.materiId,
    karyawanId: AppContext_test.activeUser,
    totalProgress: "0", 
    statusMateri_PDF: "",
    statusMateri_Video: "",
    statusSharingExpert_PDF: "",
    statusSharingExpert_Video: "",
    createdBy: "Fahriel",
  });

  if (AppContext_test.progresMateri == "materi_video") {
    formUpdate.current.statusMateri_Video = "Done";
  } else {
    formUpdate.current.statusSharingExpert_Video = "Done";
  }

 async function saveProgress() {
    let success = false;
    let retryCount = 0;
    const maxRetries = 5; 

    while (!success && retryCount < maxRetries) {
      try {
        const response = await axios.post(API_LINK + "Materis/SaveProgresMateri", formUpdate.current);
        
        if (response.data != 0){
          success = true;
          console.log(response.data)
          AppContext_test.refreshPage += retryCount;
          console.log(AppContext_test.refreshPage, "DS")
          console.log('ds') 
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
        retryCount += 1;
        if (retryCount >= maxRetries) {
          console.error("Max retries reached. Stopping attempts to save progress.");
        }
      }
    }
  }

  // async function updateProgres() {
  //   let success = false;
  //   let retryCount = 0;
  //   const maxRetries = 5; 

  //   while (!success && retryCount < maxRetries) {
  //     try {
  //       const response = await axios.post(API_LINK + "Materis/UpdatePoinProgresMateri", {
  //         materiId: AppContext_test.materiId,
  //       });
  //     } catch (error) {
  //       console.error("Failed to save progress:", error);
  //       retryCount += 1;
  //       if (retryCount >= maxRetries) {
  //         console.error("Max retries reached. Stopping attempts to save progress.");
  //       }
  //     }
  //   }
  // };

  
  useEffect(() => {
    document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
    const sidebarMenuElement = document.querySelector('.sidebarMenu');
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add('sidebarMenu-hidden');
    }
  }, []);
  useEffect(() => {
    saveProgress();
    // updateProgres();
  }, []);

  const [marginRight, setMarginRight] = useState("5vh");


  const videoUrl = 'VideoDummy.mp4';

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
              <div style={{ marginRight: marginRight}}>
                  <KMS_VideoPlayer videoFileName={videoUrl} />
              </div>
            </>
          {/* )} */}
        </div>
      </div>
    </>
  );
}
