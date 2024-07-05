import { useEffect, useRef, useState } from "react";
import { useLocation } from 'react-router-dom';
import { object, string } from "yup";
import { API_LINK, ROOT_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import KMS_Sidebar from '../../part/KMS_SideBar';
import Sidebar from '../../backbone/SideBar';
import styled from 'styled-components';
import KMS_Uploader from "../../part/KMS_Uploader";
import KMS_Rightbar from "../../part/KMS_RightBar";
import axios from "axios";
import AppContext_test from "./TestContext";
export default function MasterTestHasilTest({ onChangePage, quizType, materiId }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [marginRight, setMarginRight] = useState("5vh");
  const [receivedMateriId, setReceivedMateriId] = useState();

  AppContext_test.refreshPage = "hasiltest";
  function lihatHasil() {
    onChangePage("detailtest", "Pretest", materiId);
  }
  function bacaMateri() {
    console.log('ddd', materiId)
    onChangePage("materipdf", true, materiId);
  }
  
  function formattingDate(rawDate) {
    let parsedDate = new Date(rawDate);
    let options = { day: 'numeric', month: 'long', year: 'numeric' };
    let formattedDate = new Intl.DateTimeFormat('id-ID', options).format(parsedDate);
    return formattedDate;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await fetchDataWithRetry();
        if (isMounted) {
          if (data && Array.isArray(data)) {
            if (data.length === 0) {
            } else {
              console.log("dsds", data)
              setCurrentData(data);
            }
          } else {
            // throw new Error("Data format is incorrect");
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsError(true);
          console.error("Fetch error:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchDataWithRetry = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post(API_LINK + "Quiz/GetDataResultQuiz", {
            quizId: AppContext_test.materiId,
            karyawanId: AppContext_test.activeUser,
            tipeQuiz: AppContext_test.quizType
          });

          if (response.data.length != 0) {
            AppContext_test.reviewQuizId = response.data[0].Key
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

    fetchData();

    return () => {
      isMounted = false; // cleanup flag
    };
  }, [AppContext_test.materiId]);

  useEffect(() => {
  }, [AppContext_test.materiId]);

  useEffect(() => {
    document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
    const sidebarMenuElement = document.querySelector('.sidebarMenu');
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add('sidebarMenu-hidden');
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        currentData.map((item) => (
          <div key={item.Key} style={{ marginRight: marginRight }}>
            {item.Status === "Reviewed" ? (
              <div>
                  <div 
                    style={{ 
                      display: 'flex-start', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontFamily: 'sans-serif' 
                    }}
                    >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                      <div 
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%', 
                          backgroundColor: 'lightgray', 
                          marginRight: '10px' 
                        }}
                      ></div>
                      <div style={{ fontSize: '14px', color: 'gray' }}>{item.CreatedBy} - {formattingDate(item.CreatedDate)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                        Selamat!, kamu mendapatkan nilai:
                      </div>
                      <div
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          borderRadius: '50%', 
                          border: '2px solid lightgray', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          margin: '0 auto 30px' 
                        }}
                      >
                        <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{item.Nilai}</div>
                      </div>
                      <div style={{ marginBottom: '10px' }}>Pre Test - Pemrograman 1</div>
                      <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                        Anda telah berhasil mengerjakan Pre Test, silahkan baca materi yang telah disediakan dan kerjakan Post Test.
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                          classType="secondary me-2 px-4 py-2" 
                          label="Lihat Hasil" 
                          onClick={lihatHasil}
                        />
                        {/* <Button 
                          classType="primary ms-2 px-4 py-2"
                          label="Baca Materi"
                          onClick={bacaMateri}
                        /> */}
                      </div>
                    </div>
                  </div>
              </div>
            ) : (
              <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: 'lightgray',
                        marginRight: '10px'
                      }}
                    ></div>
                    <div style={{ fontSize: '14px', color: 'gray' }}>{item.CreatedBy} - {formattingDate(item.CreatedDate)}</div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'sans-serif',
                      height: '50vh',
                      borderRadius: '10px',
                      padding: '20px',
                      margin: '20px'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          marginBottom: '40px',
                          fontSize: '24px',
                          color: '#856404',
                          fontWeight: 'bold',
                          border: '1px solid #ffeeba',
                          backgroundColor: '#fff3cd', 
                          padding: '15px',
                          borderRadius: '5px',
                          textAlign: 'center'
                        }}
                      >
                        Hasil akan direview oleh Tenaga Pendidik
                      </div>
                      <div style={{ fontSize: '16px', marginBottom: '20px', color: '#555' }}>
                        Anda telah berhasil mengerjakan Pre Test, silahkan baca materi yang telah disediakan dan kerjakan Post Test.
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {/* <Button
                          classType="secondary me-2 px-4 py-2"
                          label="Lihat Hasil"
                          onClick={lihatHasil}
                          style={{
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            color: '#333',
                            borderRadius: '5px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        /> */}
                        {/* <Button
                          classType="primary ms-2 px-4 py-2"
                          label="Baca Materi"
                          onClick={bacaMateri}
                          style={{
                            border: '1px solid #007bff',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            borderRadius: '5px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        /> */}
                      </div>
                    </div>
                  </div>
              </div>
            )}
            {/* <KMS_Rightbar handlePreTestClick_close={handlePreTestClick_close} handlePreTestClick_open={handlePreTestClick_open} /> */}
            
          </div>
        ))
      )}
    </>

  );
}