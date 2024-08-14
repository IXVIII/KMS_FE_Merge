import { useRef, useState, useEffect, lazy } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button";
import DropDown from "../../../part/Dropdown";
import Input from "../../../part/Input";
import FileUpload from "../../../part/FileUpload";
import uploadFile from "../../../util/UploadFile";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
// import { Stepper } from 'react-form-stepper';
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import axios from "axios";
import { Editor } from '@tinymce/tinymce-react';

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

export default function MastermateriAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKategori, setListKategori] = useState([]);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [resetStepper, setResetStepper] = useState(0);
  const fileInputRef = useRef(null);
  const gambarInputRef = useRef(null);
  const vidioInputRef = useRef(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const previewFile = async (namaFile) => {
    try {
      namaFile = namaFile.trim();
      const response = await axios.get(`${API_LINK}Utilities/Upload/DownloadFile`, {
        params: {
          namaFile 
        },
        responseType: 'arraybuffer' 
      }); 

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
    }
  };


  const kategori = AppContext_master.KategoriIdByKK;

  // Referensi ke form data menggunakan useRef
  const formDataRef = useRef({
    kat_id: AppContext_master.KategoriIdByKK,
    mat_judul: "",
    mat_file_pdf: "",
    mat_file_video: "",
    mat_pengenalan: "",
    mat_keterangan: "",
    kry_id: AppContext_test.activeUser,
    mat_kata_kunci: "",
    mat_gambar: "",
    createBy: AppContext_test.displayName,
  });

  // Validasi skema menggunakan Yup
  const userSchema = object({
    kat_id: string(),
    mat_judul: string().required('Judul materi harus diisi'),
    mat_file_pdf: string(),
    mat_file_video: string(),
    mat_pengenalan: string().required('Pengenalan materi harus diisi'),
    mat_keterangan: string().required('Keterangan materi harus diisi'),
    kry_id: string(),
    mat_kata_kunci: string().required('Kata kunci materi harus diisi'),
    mat_gambar: string(),
    createBy: string(),
  });

  // Handle input change
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleGambarChange = () => handleFileChange(gambarInputRef, "jpg,png", 5);
  const handlePdfChange = () => handleFileChange(fileInputRef, "pdf", 5);
  const handleVideoChange = () => handleFileChange(vidioInputRef, "mp4,mov", 100);

  const handleFileChange = async (ref, extAllowed, maxFileSize) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024 / 1024 > maxFileSize) {
      error = `Berkas terlalu besar, maksimal ${maxFileSize}MB`;
      SweetAlert("Error", error, "error");
    } else if (!extAllowed.split(",").includes(fileExt)) {
      error = "Format berkas tidak valid";
      SweetAlert("Error", error, "error");
    }

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  
  const fetchDataMateriById = async (id) => {
    try {
      const response = await axios.post(API_LINK + "Materis/GetDataMateriById", id);
      return response.data;
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil data materi:', error);
      throw error;
    }
  };

  // Handle form submit
  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsFormSubmitted(true);
      setIsLoading(true);
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
      setErrors({});

      const uploadPromises = [];

      let hasPdfFile = false;
      let hasVideoFile = false;

      if (fileInputRef.current && fileInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(fileInputRef.current).then((data) => {
            formDataRef.current["mat_file_pdf"] = data.newFileName;
            AppContext_test.materiPdf = data.newFileName;
            hasPdfFile = true;
          })
        );
      }

      if (gambarInputRef.current && gambarInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(gambarInputRef.current).then((data) => {
            formDataRef.current["mat_gambar"] = data.newFileName;
            AppContext_test.materiGambar = data.newFileName;
          })
        );
      }

      if (vidioInputRef.current && vidioInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(vidioInputRef.current).then((data) => {
            formDataRef.current["mat_file_video"] = data.newFileName;
            AppContext_test.materiVideo = data.newFileName;
            hasVideoFile = true;
          })
        );
      }

      Promise.all(uploadPromises).then(() => {
        if (!hasPdfFile && !hasVideoFile) {
          setIsLoading(false);
          SweetAlert("Terjadi Kesalahan!", "Harus memilih salah satu file PDF atau file video, tidak boleh keduanya kosong.", "error");
          return;
        }
        axios.post(API_LINK + "Materis/SaveDataMateri", formDataRef.current)
          .then(response => {
            const data = response.data;
            if (data[0].hasil === "OK") {
              AppContext_master.dataIDMateri = data[0].newID;
              SweetAlert("Sukses", "Data Materi berhasil disimpan", "success");
              setIsFormDisabled(true);
              AppContext_master.formSavedMateri = true;
            } else {
              setIsError(prevError => ({
                ...prevError,
                error: true,
                message: "Terjadi kesalahan: Gagal menyimpan data Materi."
              }));
            }
          })
          .catch(error => {
            console.error('Terjadi kesalahan:', error);
            setIsError(prevError => ({
              ...prevError,
              error: true,
              message: "Terjadi kesalahan: " + error.message
            }));
          })
          .finally(() => setIsLoading(false));
      });
    }
  };

  const fetchDataKategori = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const data = await UseFetch(API_LINK + "Program/GetKategoriKKById", { kategori });
        const mappedData = data.map(item => ({
          value: item.Key,
          label: item["Nama Kategori"],
          idKK: item.idKK,
          namaKK: item.namaKK
        }));
        return mappedData;
      } catch (error) {
        console.error("Error fetching kategori data:", error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsError({ error: false, message: '' });
      setIsLoading(true);
      try {
        const data = await fetchDataKategori();
        if (isMounted) {
          setListKategori(data);
        }
      } catch (error) {
        if (isMounted) {
          setIsError({ error: true, message: error.message });
          setListKategori([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [kategori]);
  useEffect(() => {
    if (AppContext_master.MateriForm && AppContext_master.MateriForm.current && Object.keys(AppContext_master.MateriForm.current).length > 0) {
      formDataRef.current = { ...formDataRef.current, ...AppContext_master.MateriForm.current };
    }

    if (AppContext_master.formSavedMateri === false) {
      setIsFormDisabled(false);
    }
  }, [AppContext_master.MateriForm, AppContext_master.formSavedMateri]);
  // Render form
  const dataSaved = AppContext_master.formSavedMateri; // Menyimpan nilai AppContext_master.formSavedMateri untuk menentukan apakah form harus di-disable atau tidak

  const [activeStep, setActiveStep] = useState(0);

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
      <style>
        {`
          .mce-notification {
            display: none !important;
          }
        `}
      </style>
      <form onSubmit={handleAdd}>
        <div>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
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
            Tambah Materi Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="namaKK"
                  label="Kelompok Keahlian"
                  value={listKategori.find((item) => item.value === formDataRef.current.kat_id)?.namaKK || ""}
                  disabled
                  errorMessage={errors.namaKK}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="kat_id"
                  label="Kategori Program"
                  value={listKategori.find((item) => item.value === formDataRef.current.kat_id)?.label || ""}
                  disabled
                  errorMessage={errors.kat_id}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="mat_judul"
                  label="Judul Materi"
                  placeholder="Judul Materi"
                  value={formDataRef.current.mat_judul}
                  onChange={handleInputChange}
                  errorMessage={errors.mat_judul}
                  isRequired
                  disabled={isFormDisabled || dataSaved}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="mat_kata_kunci"
                  label="Kata Kunci Materi"
                  placeholder="Kata Kunci Materi"
                  value={formDataRef.current.mat_kata_kunci}
                  onChange={handleInputChange}
                  errorMessage={errors.mat_kata_kunci}
                  isRequired
                  disabled={isFormDisabled || dataSaved}
                />
              </div>
              <div className="col-lg-12">
                <Input
                  type="textarea"
                  forInput="mat_keterangan"
                  label="Keterangan Materi"
                  isRequired
                  value={formDataRef.current.mat_keterangan}
                  onChange={handleInputChange}
                  errorMessage={errors.mat_keterangan}
                  disabled={isFormDisabled || dataSaved}
                />
              </div>
              <div className="col-lg-12 pb-4" >
                <div className="form-group">
                  <label htmlFor="pengenalanMateri" className="form-label fw-bold">
                    Pengenalan Materi <span style={{ color: 'Red' }}> *</span>
                  </label>
                  <Editor
                    id="mat_pengenalan"
                    value={formDataRef.current.mat_pengenalan}
                    onEditorChange={(content) => handleInputChange({ target: { name: 'mat_pengenalan', value: content } })}
                    apiKey="ci4fa00c13rk9erot37prff8jjekb93mdcwji9rtr2envzvi"
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
                    disabled={isFormDisabled || dataSaved}
                  />
                  {errors.mat_pengenalan && (
                    <div className="invalid-feedback">{errors.mat_pengenalan}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-4">
                <FileUpload
                  ref={gambarInputRef}
                  forInput="mat_gambar"
                  label="Gambar Cover (.jpg, .png)"
                  formatFile=".jpg,.png"
                  onChange={() =>
                    handleGambarChange(gambarInputRef, "jpg,png")
                  }
                  errorMessage={errors.mat_gambar}
                  isRequired
                  disabled={isFormDisabled || dataSaved}
                />
                {AppContext_test.materiGambar && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault(); 
                      previewFile(AppContext_test.materiGambar); 
                    }}
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>
              <div className="col-lg-4">
                <FileUpload
                  ref={fileInputRef}
                  forInput="mat_file_pdf"
                  label="File Materi (.pdf)"
                  formatFile=".pdf"
                  onChange={() =>
                    handlePdfChange(fileInputRef, "pdf")
                  }
                  errorMessage={errors.mat_file_pdf}
                  isRequired
                  disabled={isFormDisabled || dataSaved}
                />
                {AppContext_test.materiPdf && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault(); 
                      previewFile(AppContext_test.materiPdf); 
                    }}
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>
              <div className="col-lg-4">
                <FileUpload
                  ref={vidioInputRef}
                  forInput="mat_file_video"
                  label="File Materi (.mp4, .mov)"
                  formatFile=".mp4,.mov"
                  maxFileSize={100}
                  onChange={() =>
                    handleVideoChange(vidioInputRef, "mp4,mov")
                  }
                  errorMessage={errors.mat_file_video}
                  isRequired
                  disabled={isFormDisabled || dataSaved}
                />
                {AppContext_test.materiVideo && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault(); 
                      previewFile(AppContext_test.materiVideo); 
                    }}
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
            isDisabled={isFormDisabled || dataSaved}
          />
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("pretestAdd", AppContext_master.MateriForm = formDataRef, AppContext_master.count += 1)}
            // isDisabled={!isFormSubmitted}
          />
        </div>
      </form>
    </>
  );
}

