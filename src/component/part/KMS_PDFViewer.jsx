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
  if (AppContext_test.urlMateri) {
    setIsLoading(true); // Set loading state to true
    const fetchData = async () => {
      
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
        setIsLoading(false); // Set loading state to false
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
        console.error("Error fetching file:", error); 
      }
    };

    fetchData(); // Call the function to fetch data
  } else {
    setIsError(true);
    setIsLoading(true);
  }
}, [fileName]); 
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
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
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