import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import UploadFile from "../../../util/UploadFile";
import Button from "../../../part/Button";
import DropDown from "../../../part/Dropdown";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import FileUpload from "../../../part/FileUpload";
import uploadFile from "../../../util/UploadFile";
import { Stepper, Step, StepLabel } from '@mui/material';

const steps = ['Materi', 'Pretest', 'Sharing Expert', 'Forum', 'Post Test'];

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case 0:
      return 'materiAdd';
    case 1:
      return 'pretestAdd';
    case 2:
      return 'sharingAdd';
    case 3:
      return 'forumAdd';
    case 4:
      return 'posttestAdd';
    default:
      return 'Unknown stepIndex';
  }
}
export default function MasterSharingAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const gambarInputRef = useRef(null);
  const vidioInputRef = useRef(null);

  const Materi = AppContext_test.DetailMateriEdit;

  const formDataRef = useRef({
    mat_id: Materi.Key,
    mat_sharing_expert_pdf: Materi.Sharing_pdf || "",
    mat_sharing_expert_video: Materi.Sharing_video || "",
  });

  const userSchema = object({
    mat_id: string(),
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
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024 / 1024 > 100) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  let hasPdfFile = false;
  let hasVideoFile = false;
  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    const hasPDF = Materi.Sharing_pdf !== null && Materi.Sharing_pdf !== "";
    const hasVideo = Materi.Sharing_video !== null && Materi.Sharing_video !== "";

    if (!hasPDF && !hasVideo) {
      return;
    }

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      const uploadPromises = [];

      if (fileInputRef.current && fileInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(fileInputRef.current).then((data) => {
            formDataRef.current["mat_sharing_expert_pdf"] = data.newFileName;
          })
        );
        hasPdfFile = true;
      }

      if (vidioInputRef.current && vidioInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(vidioInputRef.current).then((data) => {
            formDataRef.current["mat_sharing_expert_video"] = data.newFileName;
          })
        );
        hasVideoFile = true;
      }
      console.log(hasPdfFile, hasVideoFile)
      if (!hasPdfFile && !hasVideoFile) {
        setIsLoading(false);
        setIsError(prevError => ({
          ...prevError,
          error: true,
          message: "Harus memilih salah satu file PDF atau file video, tidak boleh keduanya kosong."
        }));
        return;
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
              // onChangePage("index");
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

  const hasPDF = Materi.Sharing_pdf !== null && Materi.Sharing_pdf !== "";
  const hasVideo = Materi.Sharing_video !== null && Materi.Sharing_video !== "";
const [activeStep, setActiveStep] = useState(2);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label} onClick={() => onChangePage(getStepContent(index))}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div>
            {activeStep === steps.length ? (
              <div>
                <Button onClick={handleReset}>Reset</Button>
              </div>
            ) : (
              <div>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" color="primary" onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header bg-outline-primary fw-medium text-black">
            Edit Sharing Expert
          </div>
          <div className="card-body p-4">
            {hasPDF || hasVideo ? (
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
            ) : (
              <Alert type="warning" message={(
                <span>
                  Data Sharing Expert belum ditambahkan. <a onClick={() => onChangePage("sharingEditNot")} className="text-primary">Tambah Data</a>
                </span>
              )} />
            )}
          </div>
        </div>

        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("pretestEdit")}
          />
          {hasPDF || hasVideo ? (
              <Button
                  classType="primary ms-2 px-4 py-2"
                  type="submit"
                  label="Simpan"
              />
          ) : (
            null  
          )}
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("forumEdit")}
          />
        </div>
      </form>
    </>
  );
}
