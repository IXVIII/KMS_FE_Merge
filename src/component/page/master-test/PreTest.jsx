import { useEffect, useRef, useState, useContext } from "react";
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
import KMS_Rightbar from "../../part/KMS_RightBar";
import SideBar from "../../backbone/SideBar";
import axios from "axios";
import AppContext_test from "./TestContext";
export default function MasterTestPreTest({ onChangePage, CheckDataReady, materiId }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [marginRight, setMarginRight] = useState("0vh");
  const [currentData, setCurrentData] = useState();
  const [receivedMateriId, setReceivedMateriId] = useState();
  AppContext_test.refreshPage = true;
  function onStartTest() {
    onChangePage("pengerjaantest", "Pretest", materiId);
  }

  useEffect(() => {
    document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
    const sidebarMenuElement = document.querySelector('.sidebarMenu');
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add('sidebarMenu-hidden');
    }
  }, []);
    
  useEffect(() => {
    let isMounted = true;

    const fetchData_pretest = async (retries = 10, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      setIsLoading(true);
      try {
        const data = await fetchDataWithRetry_pretest();
        const dataQuiz = await getQuiz_pretest();
        setCurrentData(dataQuiz);
        if (isMounted) {
          if (data) {
            if (Array.isArray(data)) {
              if (data.length != 0) {
                onChangePage("hasiltest", "Pretest", data[0].IdQuiz);
                AppContext_test.quizType = "Pretest";
              }
            } else {
              console.error("Data is not an array:", data);
            }
          } else {
            // console.error("Response data is undefined or null");
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsError(true);
          console.error("Fetch error:", error);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            return;
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    };
  
    const fetchDataWithRetry_pretest = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post(API_LINK + "Quiz/GetDataResultQuiz", {
            quizId: AppContext_test.materiId,
            karyawanId: AppContext_test.activeUser,
            tipeQuiz: "Pretest",
          });
          if (response.data.length != 0) {
            return response.data;
          }
        } catch (error) {
          console.error("Error fetching quiz data:", error);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };

    const getQuiz_pretest = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post(API_LINK + "Quiz/GetDataQuiz", {
            quizId: AppContext_test.materiId,
            tipeQuiz: "Pretest",
          });
          if (response.data.length != 0) {
            return response.data;
          }
        } catch (error) {
          console.error("Error fetching quiz data:", error);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };

    fetchData_pretest();

    return () => {
      isMounted = false; 
    };
  }, [AppContext_test.materiId]);


  const circleStyle = {
    width: "50px",
    height: "50px",
    backgroundColor: "lightgray",
    marginRight: "20px",
  };
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const convertToMinutes = (duration) => {
      AppContext_test.durasiTest = duration;
      return Math.floor(duration / 60); 
  };


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
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <div style={{ marginRight: marginRight }}>
               <div
                  className="d-flex align-items-center mb-5"
                  >
                  <div
                    className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center"
                    style={circleStyle}
                  >
                    <img
                      className="align-self-start"
                      style={{
                        width: "450%",
                        height: "auto",
                        position: "relative",
                        right: "30px",
                        bottom: "40px",
                      }}
                    />
                  </div>
                
                  <h6 className="mb-0">{currentData[0].CreatedBy} - {formatDate(currentData[0].CreatedDate)}</h6>
                </div>
              <div className="text-center" style={{marginBottom: '100px'}}>
                <h2 className="font-weight-bold mb-4 primary">Post Test - {currentData[0].JudulQuiz}</h2>
                <p className="mb-5" style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '60px' }}>
                Tes ini terdiri dari {currentData[0].JumlahSoal} soal Anda hanya memiliki waktu {convertToMinutes(currentData[0].Durasi)} menit untuk mengerjakan semua soal, dimulai saat Anda mengklik tombol
                    "Mulai Post Test" di bawah ini.
                </p>
                  <Button
                    classType="primary ms-2 px-4 py-2"
                    label="Mulai Pre-Test"
                    onClick={onStartTest}
                  />
                  <div></div>
                </div>
              </div>
            </>
           )}
        </div>
      </div>
    </>
  );
}
