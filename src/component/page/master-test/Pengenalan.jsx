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
export default function MasterTestIndex({  onChangePage, CheckDataReady, materiId  }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState();
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Kode Test] asc",
    status: "Aktif",
  });
  const [marginRight, setMarginRight] = useState("5vh");

  useEffect(() => {
    document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
    const sidebarMenuElement = document.querySelector('.sidebarMenu');
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add('sidebarMenu-hidden');
    }
  }, []);

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
        const dataQuiz = await getMateri();
        setCurrentData(dataQuiz);
        isMounted = true;
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

    const getMateri = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post("http://localhost:8080/Materis/GetDataMateriById", {
            materiId: AppContext_test.materiId,
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

    fetchData_posttest();

    return () => {
      isMounted = false; 
    };
  }, [materiId]);

  useEffect(() => {
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
