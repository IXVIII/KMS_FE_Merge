import { useEffect, useRef, useState } from "react";
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
import axios from "axios";
import AppContext_master from "../master-proses/MasterContext";
import AppContext_test from "./TestContext";

export default function MasterTestIndex({  onChangePage, CheckDataReady, materiId  }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState();
  const [marginRight, setMarginRight] = useState("5vh");

  AppContext_test.refreshPage = "pengenalan";
  useEffect(() => {
    document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
    const sidebarMenuElement = document.querySelector('.sidebarMenu');
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add('sidebarMenu-hidden');
    }
  }, []);

  async function updateProgres() {
    let success = false;
    let retryCount = 0;
    let maxRetries = 10; 

    while (!success && retryCount < maxRetries) {
      try {
        const response = await axios.post(API_LINK + "Materis/UpdatePoinProgresMateri", {
          materiId: AppContext_test.materiId,
        });

        if (response.status === 200){
          success = true;
          console.log('ds', response)
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
        retryCount += 1;
        if (retryCount >= maxRetries) {
          console.error("Max retries reached. Stopping attempts to save progress.");
        }
      }
    }
  };

  function handleStartPostTest() {
    onChangePage("pengerjaantest", "Posttest", materiId);
  }

  const [tableData, setTableData] = useState([]);

  function handleDetailAction(action, key) {
    if (action === "detail") {
      onChangePage("detailtest", "Posttest", AppContext_test.materiId, key);
      AppContext_test.QuizType = "Posttest";
    }
  }



  useEffect(() => {
    let isMounted = true;

    const fetchData_posttest = async (retries = 10, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        setIsLoading(true);
        try {
          const [dataQuiz] = await Promise.all([getMateri()]);
          if (isMounted) {
            setCurrentData(dataQuiz);
          }
        } catch (error) {
          if (isMounted) {
            setIsError(true);
            console.error("Fetch error:", error);
            if (i < retries - 1) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              return; // Exit function if max retries reached
            }
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    };

    const getMateri = async (retries = 10, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post(API_LINK + "Materis/GetDataMateriById", {
            materiId: AppContext_test.materiId,
          });
          if (response.data.length !== 0) {
            return response.data;
          }
        } catch (error) {
          console.error("Error fetching materi data:", error);
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw error; // Throw error if max retries reached
          }
        }
      }
    };

    fetchData_posttest();

    return () => {
      isMounted = false;
    };
  }, [AppContext_test.materiId]);


  useEffect(() => {
    updateProgres();
  }, [currentData]);


  const circleStyle = {
    width: '50px',
    height: '50px',
    backgroundColor: 'lightgray',
    marginRight: '20px'
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <>
      <div className="d-flex flex-column">
        {/* <KMS_Rightbar handleposttestClick_close={handleposttestClick_close} handleposttestClick_open={handleposttestClick_open}/> */}
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data Test."
            />
          </div>
        )}
        <div className="flex-fill">
          
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <>
            <div style={{ marginRight: marginRight }}>
               <div
                  className="d-flex align-items-center mb-4"
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
                
                  <h6 className="mb-0">{currentData[0].Uploader} - {formatDate(currentData[0].Creadate)}</h6>
                </div>
              <div className="text-left" style={{marginLeft:"6%", marginRight:"6%"}}>
                <div dangerouslySetInnerHTML={{ __html: currentData[0].Pengenalan }} />
                <div>
              </div>
              </div>
            </div>
          </>
          )} 
        </div>
      </div>
    </>
  );
}
