import { useRef, useState, useEffect } from "react";
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
import { Stepper } from 'react-form-stepper';
import AppContext_test from "../MasterContext";
import axios from "axios";
import { Editor } from '@tinymce/tinymce-react';

export default function MasterCourseAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKategori, setListKategori] = useState([]);
  const [isFormDisabled, setIsFormDisabled] = useState(false); 

  const fileInputRef = useRef(null);
  const gambarInputRef = useRef(null);
  const vidioInputRef = useRef(null);

  const kategori = AppContext_test.KategoriIdByKK;
  // console.log("kategiri :"+ AppContext_test.KategoriIdByKK)
  // console.log("kategiri"+AppContext_test)

  // Referensi ke form data menggunakan useRef
  const formDataRef = useRef({
    kat_id: AppContext_test.KategoriIdByKK,
    mat_judul: "",
    mat_file_pdf: "",
    mat_file_video: "",
    mat_pengenalan: "",
    mat_keterangan: "",
    kry_id: "1",
    mat_kata_kunci: "",
    mat_gambar: "",
    createBy: "Kristina Hutajulu",
  });

  // Validasi skema menggunakan Yup
  const userSchema = object({
    kat_id: string(),
    mat_judul: string(),
    mat_file_pdf: string(),
    mat_file_video: string(),
    mat_pengenalan: string(),
    mat_keterangan: string(),
    kry_id: string(),
    mat_kata_kunci: string(),
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

  // Handle file change
  const handleFileChange = async (ref, extAllowed) => {

    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024 / 1024 > 100) error = "Berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "Format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
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
            hasPdfFile = true;
          })
        );
      }

      if (gambarInputRef.current && gambarInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(gambarInputRef.current).then((data) => {
            formDataRef.current["mat_gambar"] = data.newFileName;
          })
        );
      }

      if (vidioInputRef.current && vidioInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(vidioInputRef.current).then((data) => {
            formDataRef.current["mat_file_video"] = data.newFileName;
            hasVideoFile = true;
          })
        );
      }

      Promise.all(uploadPromises).then(() => {
        if (!hasPdfFile && !hasVideoFile) {
          setIsLoading(false);
          setIsError(prevError => ({
            ...prevError,
            error: true,
            message: "Harus memilih salah satu file PDF atau file video, tidak boleh keduanya kosong."
          }));
          return;
        }

        axios.post(API_LINK + "Materis/SaveDataMateri", formDataRef.current)
          .then(response => {
            const data = response.data;
            console.log("materiAdd ", data)
            if (data[0].hasil === "OK") {
              AppContext_test.dataIDMateri = data[0].newID;
              SweetAlert("Sukses", "Data Materi berhasil disimpan", "success");
              setIsFormDisabled(true);
              AppContext_test.formSavedMateri = true; 
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

  // Fetch data kategori
  {/*const fetchDataKategori = async (delay = 1000) => {
    while (true) {
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
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };
*/}
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
  if (AppContext_test.MateriForm && AppContext_test.MateriForm.current && Object.keys(AppContext_test.MateriForm.current).length > 0) {
    formDataRef.current = { ...formDataRef.current, ...AppContext_test.MateriForm.current };
  }

  if (AppContext_test.formSavedMateri === false) {
    setIsFormDisabled(false);
  }
}, [AppContext_test.MateriForm, AppContext_test.formSavedMateri]);

// Render form
const dataSaved = AppContext_test.formSavedMateri; // Menyimpan nilai AppContext_test.formSavedMateri untuk menentukan apakah form harus di-disable atau tidak

if (isLoading) return <Loading />;

  
  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        {/* Isi form dengan penambahan disabled={isFormDisabled || dataSaved} */}
        <div>
          <Stepper
            steps={[
              { label: 'Materi', onClick: () => onChangePage("courseAdd") },
              { label: 'Pretest', onClick: () => onChangePage("pretestAdd") },
              { label: 'Sharing Expert', onClick: () => onChangePage("sharingAdd") },
              { label: 'Forum', onClick: () => onChangePage("forumAdd") },
              { label: 'Post Test', onClick: () => onChangePage("posttestAdd") }
            ]}
            activeStep={0}
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
              <div className="col-lg-12">
                <div className="form-group">
                  <label htmlFor="pengenalanMateri" className="form-label fw-bold">
                    Pengenalan Materi <span style={{ color: 'Red' }}> *</span>
                  </label>
                  <Editor
                    id="mat_pengenalan"
                    value={formDataRef.current.mat_pengenalan}
                    onEditorChange={(content) => handleInputChange({ target: { name: 'mat_pengenalan', value: content } })}
                    apiKey='v5s2v6diqyjyw3k012z4k2o0epjmq6wil26i10xjh53bbk7y'
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
                    handleFileChange(gambarInputRef, "jpg,png")
                  }
                  errorMessage={errors.mat_gambar}
                  isRequired
                  disabled={isFormDisabled || dataSaved} 
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  ref={fileInputRef}
                  forInput="mat_file_pdf"
                  label="File Materi (.pdf)"
                  formatFile=".pdf"
                  onChange={() =>
                    handleFileChange(fileInputRef, "pdf")
                  }
                  errorMessage={errors.mat_file_pdf}
                  isRequired
                  disabled={isFormDisabled || dataSaved} 
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  ref={vidioInputRef}
                  forInput="mat_file_video"
                  label="File Materi (.mp4, .mov)"
                  formatFile=".mp4,.mov"
                  onChange={() =>
                    handleFileChange(vidioInputRef, "mp4,mov")
                  }
                  errorMessage={errors.mat_file_video}
                  isRequired
                  disabled={isFormDisabled || dataSaved}
                />
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
            disabled={isFormDisabled || dataSaved}
          />
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("pretestAdd", AppContext_test.MateriForm = formDataRef)}
          />
        </div>
      </form>
    </>
  );
}

