import { useState, useEffect } from "react";
import { object, string } from "yup";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import Button from "../../../part/Button";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import UseFetch from "../../../util/UseFetch";
import { API_LINK } from "../../../util/Constants";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import { Editor } from '@tinymce/tinymce-react';
import Swal from 'sweetalert2';
import axios from "axios";
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

const userSchema = object({
  forumJudul: string().max(100, "maksimum 100 karakter").required("harus diisi"),
  forumIsi: string().required("harus diisi"),
});

export default function MasterForumAddNot({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [formData, setFormData] = useState({
    // materiId: AppContext_test.dataIDMateri,
    materiId:AppContext_test.DetailMateri?.Key || "",
    karyawanId: AppContext_test.activeUser,
    forumJudul: AppContext_test.ForumForm?.forumJudul || "",
    forumIsi: AppContext_test.ForumForm?.forumIsi || "",
    forumStatus: "Aktif",
    forumCreatedBy: AppContext_test.displayName,
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const resetForm = () => {
    setFormData({
      materiId:AppContext_test.DetailMateri?.Key || "",
      karyawanId: AppContext_test.activeUser,
      forumJudul: "",
      forumIsi: "",
      forumStatus: "Aktif",
      forumCreatedBy: AppContext_test.displayName,
    });
    setErrors({});
    setIsError({ error: false, message: "" });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(formData, userSchema, setErrors);
    const isEmptyData = Object.values(formData).some(value => value === "");

    if (isEmptyData) {
      setIsError({
        error: true,
        message: "Data tidak boleh kosong",
      });
      return;
    }

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});
    }

    try {
      console.log("Data yang dikirim ke backend:", formData);
      const response = await axios.post(API_LINK + "Forum/SaveDataForum", formData);

      if (response === "ERROR") {
        setIsError({ error: true, message: "Terjadi kesalahan: Gagal menyimpan data Sharing." });
      } else {
        
        Swal.fire({
          title: 'Sukses',
          text: 'Data Forum berhasil disimpan',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
          onChangePage("forumDetail", AppContext_test.DetailMateri);
          }
        });
      }
    } catch (error) {
      setIsError({
        error: true,
        message: "Failed to save forum data: " + error.message,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (AppContext_test.ForumForm && AppContext_test.ForumForm.current && Object.keys(AppContext_test.ForumForm.current).length > 0) {
      formData.current = { ...formData.current, ...AppContext_test.ForumForm.current };
    }

    if (AppContext_test.formSavedForum === false) {
      setIsFormDisabled(false);
    }
  }, [AppContext_test.ForumForm, AppContext_test.formSavedForum]);

  const [activeStep, setActiveStep] = useState(3);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
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
            Tambah Forum
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-12">
                <Input
                  type="text"
                  forInput="forumJudul"
                  label="Judul Forum"
                  value={formData.forumJudul}
                  onChange={handleInputChange}
                  errorMessage={errors.forumJudul}
                  isRequired
                  disabled={isFormDisabled } 
                />
              </div>
              <div className="col-lg-12">
                <div className="form-group">
                  <label htmlFor="forumIsi" className="form-label fw-bold">
                    Isi Forum <span style={{ color: 'Red' }}> *</span>
                  </label>
                  <Editor
                    id="forumIsi"
                    value={formData.forumIsi}
                    onEditorChange={(content) => handleInputChange({ target: { name: 'forumIsi', value: content } })}
                    apiKey='ci4fa00c13rk9erot37prff8jjekb93mdcwji9rtr2envzvi'
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount'
                      ],
                      toolbar:
                        'undo redo | formatselect | bold italic backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help'
                    }}
                    disabled={isFormDisabled} 
                  />
                  {errors.forumIsi && (
                    <div className="invalid-feedback">{errors.forumIsi}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("sharingDetail")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
          />
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("posttestDetail")}
          />
        </div>
      </form>
    </>
  );
}
