import React, { useState, useEffect } from "react";
import Button from "../../../part/Button";
import Alert from "../../../part/Alert";
import { Stepper } from "react-form-stepper";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import Loading from "../../../part/Loading";

export default function MasterSharingDetail({ onChangePage }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true); 
  const [pdfHeight, setPdfHeight] = useState("500px");
  // console.log('di detail ',AppContext_test.DetailMateri)

  // console.log('detail vidio: '+ Materi.Sharing_video)
  const Materi = AppContext_test.DetailMateri;

  const hasVideo = Materi.Sharing_video_url;
  const hasPDF = Materi.Sharing_pdf_url;
  // console.log('vidio : '+ hasPDF)
  // console.log('pdf : '+ hasPDF)
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    const calculatePdfHeight = () => {
      const videoElement = document.getElementById("video");

      if (videoElement) {
        const videoHeight = videoElement.clientHeight;
        setPdfHeight(`${videoHeight}px`);
      }
    };

    calculatePdfHeight();

    window.addEventListener("resize", calculatePdfHeight);

    return () => {
      window.removeEventListener("resize", calculatePdfHeight);
    };
  }, []);

  if (isLoading) return <Loading />;
  

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form>
        <div>
          <Stepper
            steps={[
              { label: 'Materi', onClick: () => onChangePage("courseAdd") },
              { label: 'Pretest', onClick: () => onChangePage("pretestAdd") },
              { label: "Sharing Expert", onClick: () => onChangePage("sharingDetail") },
              { label: "Forum", onClick: () => onChangePage("forumDetail") },
              { label: "Post Test", onClick: () => onChangePage("posttestDetail") },
            ]}
            activeStep={2}
            styleConfig={{
              activeBgColor: "#67ACE9",
              activeTextColor: "#FFFFFF",
              completedBgColor: "#67ACE9",
              completedTextColor: "#FFFFFF",
              inactiveBgColor: "#E0E0E0",
              inactiveTextColor: "#000000",
              size: "2em",
              circleFontSize: "1rem",
              labelFontSize: "0.875rem",
              borderRadius: "50%",
              fontWeight: 500,
            }}
            connectorStyleConfig={{
              completedColor: "#67ACE9",
              activeColor: "#67ACE9",
              disabledColor: "#BDBDBD",
              size: 1,
              stepSize: "2em",
              style: "solid",
            }}
          />
        </div>

        {hasPDF || hasVideo ? (
          <div className="row">
            {hasPDF && (
              <div className="col-lg-12">
                <div className="card mt-4" style={{ borderColor: "#67ACE9" }}>
                  <div className="card-header fw-medium text-white" style={{ backgroundColor: "#67ACE9" }}>
                    <h5 className="card-title">Sharing Expert (PDF)</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <object
                        data={Materi.Sharing_pdf_url}
                        type="application/pdf"
                        width="100%"
                        height={pdfHeight}
                        style={{ maxHeight: "70vh", marginBottom: "20px" }}
                      >
                        <p>
                          Maaf, browser Anda tidak mendukung preview file. Silakan{" "}
                          <a href={Materi.Sharing_pdf_url}>unduh file</a> untuk melihatnya.
                        </p>
                      </object>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {hasVideo && (
              <div className="col-lg-12">
                <div className="card mt-4" style={{ borderColor: "#67ACE9" }}>
                  <div className="card-header fw-medium text-white" style={{ backgroundColor: "#67ACE9" }}>
                    <h5 className="card-title">Sharing Expert Video</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <video
                        id="video"
                        controls
                        width="100%"
                        height="auto"
                        style={{ maxWidth: "100%", marginBottom: "20px" }}
                      >
                        <source src={Materi.Sharing_video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ borderColor: "#67ACE9" }}>
            <div className="card-header fw-medium text-white" style={{ backgroundColor: "#67ACE9" }}>
              Detail Sharing Expert
            </div>
            <div className="card-body">
              <Alert type="warning" message={(
                <span>
                  Data Sharing Expert belum ditambahkan. <a onClick={() => onChangePage("sharingDetailNot")} className="text-primary">Tambah Data</a>
                </span>
              )} />
              </div>
          </div>
        )}
        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("pretestDetail")}
          />
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("forumDetail")}
          />
        </div>
      </form>
    </>
  );
}
