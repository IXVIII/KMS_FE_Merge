import React, { useState, useEffect } from "react";
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../util/Constants";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Alert from "../part/Alert";
import Loading from "../part/Loading";
import uploadFile from "../util/UploadFile";
import axios from "axios";
import AppContext_test from "../page/master-test/TestContext";
export default function KMS_PDFViewer({ pdfFileName }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileName, setFileName] = useState(null); // State for storing file name
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  
  useEffect(() => {
    let isMounted = true;

    const fetchData_file = async (retries = 10, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      setIsLoading(true);
      try {
        const data = await fetchData();
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
  
    const fetchData = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.get(`${API_LINK}Utilities/Upload/PreviewFile`, { 
            params: {
              namaFile: AppContext_test.urlMateri 
            },
            responseType: 'arraybuffer' 
          });  

          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setIsLoading(false); 
          return false;
        } catch (error) {
          console.error("Error fetching file:", error);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };

    fetchData_file();

    return () => {
      isMounted = false; 
    };
  }, [AppContext_test.urlMateri]);

    const [pdfHeight, setPdfHeight] = useState("500px");
  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data PDF."
            />
          </div>
        )}
        <div className="flex-fill">
          
        </div>
        <div className="mt-3" >
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {pdfUrl && (
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                <div style={{ height: '750px' }}>
                    <Viewer 
                        fileUrl={pdfUrl} 
                        plugins={[defaultLayoutPluginInstance]}
                    />
                </div>
                </Worker>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}