import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button";
import FileUpload from "../../../part/FileUpload";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import { Stepper } from 'react-form-stepper';
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import uploadFile from "../../../util/UploadFile";

export default function MasterSharingDetailNot({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const vidioInputRef = useRef(null);
  console.log(AppContext_test.DetailMateri)
  // AppContext_test.ForumForm
  const formDataRef = useRef({
    mat_id: AppContext_test.DetailMateri?.Key || "",
    mat_sharing_expert_pdf: AppContext_test.DetailMateri?.Sharing_pdf||"",
    mat_sharing_expert_video: AppContext_test.DetailMateri?.Sharing_video||"",
  });
  // console.log("Materi Form di sahring", AppContext_test.MateriForm)
  const userSchema = object({
    mat_id: string().required("ID Materi tidak boleh kosong"),
    mat_sharing_expert_pdf: string(),
    mat_sharing_expert_video: string(),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleFileChange = async (ref, extAllowed) => {
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    let error = "";

    if (fileSize / 1024 / 1024 > 100) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt)) error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [ref.current.name]: error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const validationErrors = await validateAllInputs(
        formDataRef.current,
        userSchema,
        setErrors
    );

    const isPdfEmpty = !fileInputRef.current.files.length;
    const isVideoEmpty = !vidioInputRef.current.files.length;

    if (isPdfEmpty && isVideoEmpty) {
        setErrors((prevErrors) => ({
            ...prevErrors,
            mat_sharing_expert_pdf: "Pilih salah satu antara PDF atau Video",
            mat_sharing_expert_video: "Pilih salah satu antara PDF atau Video",
        }));
        return;
    }

    if (
        Object.values(validationErrors).every((error) => !error) &&
        (!isPdfEmpty || !isVideoEmpty)
    ) {
        setIsLoading(true);
        setIsError({ error: false, message: "" });
        setErrors({});

        const uploadPromises = [];

        if (fileInputRef.current && fileInputRef.current.files.length > 0) {
            uploadPromises.push(
                uploadFile(fileInputRef.current).then((data) => {
                    formDataRef.current.mat_sharing_expert_pdf = data.newFileName;
                })
            );
        }

        if (vidioInputRef.current && vidioInputRef.current.files.length > 0) {
            uploadPromises.push(
                uploadFile(vidioInputRef.current).then((data) => {
                    formDataRef.current.mat_sharing_expert_video = data.newFileName;
                })
            );
        }

        Promise.all(uploadPromises)
            .then(() => {
                console.log("Form Data:", formDataRef.current);
                return UseFetch(
                    API_LINK + "SharingExperts/SaveDataSharing",
                    formDataRef.current
                );
            })
            .then((data) => {
                if (data === "ERROR") {
                    setIsError({
                        error: true,
                        message: "Terjadi kesalahan: Gagal menyimpan data Sharing.",
                    });
                } else {
                    // Ambil data terbaru dari server setelah disimpan
                    return UseFetch(API_LINK + "Materis/GetDataMateriById", {
                        p1: formDataRef.current.mat_id,
                    });
                }
            })
            .then((responseData) => {
                // Konversi file PDF dan video menjadi blob
                const promises = responseData.map((value) => {
                    const filePromises = [];

                    // Fetch Gambar
                    if (value.Gambar) {
                        const gambarPromise = fetch(
                            `${API_LINK}Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.Gambar
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.Gambar = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching gambar:", error);
                                return value;
                            });
                        filePromises.push(gambarPromise);
                    }

                    // Fetch File Video
                    if (value.File_video) {
                        const videoPromise = fetch(
                            `${API_LINK}Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.File_video
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.File_video = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching video:", error);
                                return value;
                            });
                        filePromises.push(videoPromise);
                    }

                    // Fetch File PDF
                    if (value.File_pdf) {
                        const pdfPromise = fetch(
                            `${API_LINK}Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.File_pdf
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.File_pdf = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching PDF:", error);
                                return value;
                            });
                        filePromises.push(pdfPromise);
                    }

                    // Fetch Sharing PDF
                    if (value.Sharing_pdf) {
                        const sharingPdfPromise = fetch(
                            `${API_LINK}Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.Sharing_pdf
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.Sharing_pdf_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching sharing PDF:", error);
                                return value;
                            });
                        filePromises.push(sharingPdfPromise);
                    }

                    // Fetch Sharing Video
                    if (value.Sharing_video) {
                        const sharingVideoPromise = fetch(
                            `${API_LINK}Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.Sharing_video
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.Sharing_video_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching sharing video:", error);
                                return value;
                            });
                        filePromises.push(sharingVideoPromise);
                    }

                    return Promise.all(filePromises).then((results) => {
                        const updatedValue = results.reduce(
                            (acc, curr) => ({ ...acc, ...curr }),
                            value
                        );
                        return updatedValue;
                    });
                });

                return Promise.all(promises)
                    .then((updatedData) => {
                        console.log("Updated data with blobs:", updatedData);

                        if (AppContext_test.DetailMateri) {
                            const updatedDetailMateri = updatedData[0];
                            AppContext_test.DetailMateri.Sharing_pdf_url = updatedDetailMateri.Sharing_pdf_url || null;
                            AppContext_test.DetailMateri.Sharing_video_url = updatedDetailMateri.Sharing_video_url || null;
                        }
                        SweetAlert(
                          "Sukses",
                          "Data Sharing Expert berhasil disimpan",
                          "success"
                      ).then(() => {
                          onChangePage("sharingDetail", AppContext_test.DetailMateri);
                      });
                    })
                    .catch((error) => {
                        console.error("Error updating currentData:", error);
                    });
            })
            .catch((error) => {
                console.error("Error:", error);
                setIsError({
                    error: true,
                    message: "Terjadi kesalahan: Gagal menyimpan data atau mengambil data terbaru.",
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }
};


  

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div>
          <Stepper
            steps={[
              { label: 'Materi', onClick: () => onChangePage("courseAdd") },
              { label: 'Pretest', onClick: () => onChangePage("pretestAdd") },
              { label: 'Sharing Expert', onClick: () => onChangePage("sharingAdd") },
              { label: 'Forum', onClick: () => onChangePage("forumAdd") },
              { label: 'Post Test', onClick: () => onChangePage("posttestAdd") }
            ]}
            activeStep={2}
            styleConfig={{
              activeBgColor: '#67ACE9',
              activeTextColor: '#FFFFFF',
              completedBgColor: '#67ACE9',
              completedTextColor: '#FFFFFF',
              inactiveBgColor: '#E0E0E0',
              inactiveTextColor: '#000000',
              size: '2em',
              circleFontSize: '1rem',
              labelFontSize: '0.875rem',
              borderRadius: '50%',
              fontWeight: 500
            }}
            connectorStyleConfig={{
              completedColor: '#67ACE9',
              activeColor: '#67ACE9',
              disabledColor: '#BDBDBD',
              size: 1,
              stepSize: '2em',
              style: 'solid'
            }}
          />
        </div>

        <div className="card">
          <div className="card-header bg-outline-primary fw-medium text-black">
            Tambah Sharing Expert
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <FileUpload
                  ref={fileInputRef}
                  forInput="mat_sharing_expert_pdf"
                  label="File Sharing Expert (.pdf)"
                  formatFile=".pdf"
                  onChange={() => handleFileChange(fileInputRef, "pdf")}
                  errorMessage={errors.mat_sharing_expert_pdf}
                />
              </div>
              <div className="col-lg-6">
                <FileUpload
                  ref={vidioInputRef}
                  forInput="mat_sharing_expert_video"
                  label="Vidio Sharing Expert (.mp4, .mov)"
                  formatFile=".mp4,.mov"
                  onChange={() => handleFileChange(vidioInputRef, "mp4,mov")}
                  errorMessage={errors.mat_sharing_expert_video}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("pretestDetail")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
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
