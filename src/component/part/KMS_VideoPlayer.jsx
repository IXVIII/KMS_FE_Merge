import ReactPlayer from 'react-player';
import React, { useState, useEffect } from "react";
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../util/Constants";
import Alert from "../part/Alert";
import Loading from "../part/Loading";
import axios from "axios";
import AppContext_test from '../page/master-test/TestContext';
import { faL } from '@fortawesome/free-solid-svg-icons';
export default function KMS_VideoViewer({ videoFileName }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null); // State for video URL
  useEffect(() => {
    if (AppContext_test.urlMateri) {
      setIsLoading(true); 

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
          setVideoUrl(url); 
          setIsError(false)
          setIsLoading(false); 
        } catch (error) {
          setIsError(true);
          setIsLoading(false);
          console.error("Error fetching video:", error); 
        }
      };

      fetchData(); 
    } else {
      setIsError(true);
      setIsLoading(false);
    }
  }, [videoFileName, AppContext_test.urlMateri, isError]); 

  return (
    <>
      <div className="d-flex flex-column" >
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data video."
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
              {videoUrl && ( 
                <ReactPlayer
                  url={videoUrl}
                  controls
                  width="100%"
                  height="100%"
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
