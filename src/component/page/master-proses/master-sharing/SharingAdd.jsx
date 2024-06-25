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
import AppContext_test from "../MasterContext";
import uploadFile from "../../../util/UploadFile";

export default function MasterSharingAdd({ onChangePage}) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const vidioInputRef = useRef(null);
  const formDataRef = useRef({
    mat_id: AppContext_test.dataIDMateri,
    mat_sharing_expert_pdf: "",
    mat_sharing_expert_video: "",
  });
  // console.log("Materi Form di sahring", AppContext_test.MateriForm)
  const userSchema = object({
    mat_id: string().required("ID Materi tidak boleh kosong"),
    mat_sharing_expert_pdf: string(),
    mat_sharing_expert_video: string(),
  });

  console.log("forum di sharing",AppContext_test.ForumForm)

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

    if (Object.values(validationErrors).every((error) => !error) && (!isPdfEmpty || !isVideoEmpty)) {
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

      Promise.all(uploadPromises).then(() => {
        UseFetch(
          API_LINK + "SharingExperts/SaveDataSharing",
          formDataRef.current
        )
          .then((data) => {
            if (data === "ERROR") {
              setIsError({ error: true, message: "Terjadi kesalahan: Gagal menyimpan data Sharing." });
            } else {
              SweetAlert("Sukses", "Data Sharing Expert berhasil disimpan", "success");
              // onChangePage("index", kategori);
            }
          })
          .catch((err) => {
            setIsError({ error: true, message: "Terjadi kesalahan: " + err.message });
          })
          .finally(() => setIsLoading(false));
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
            onClick={() => onChangePage("pretestAdd")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
          />
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("forumAdd")}
          />
        </div>
      </form>
    </>
  );
}
