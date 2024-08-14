import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Select2Dropdown from "../../part/Select2Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import { useNavigate } from "react-router-dom";
import uploadFile from "../../util/UploadFile";

export default function MasterDaftarPustakaAdd({ onChangePage, withID }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKK, setListKK] = useState([]);

  const fileInputRef = useRef(null);
  const gambarInputRef = useRef(null);

  const formDataRef = useRef({
    kke_id: withID,
    pus_file: "",
    pus_judul: "",
    pus_keterangan: "",
    pus_kata_kunci: "",
    pus_gambar: "",
    pus_status: "Aktif",
  });

  const userSchema = object({
    kke_id: string().required("Pilih Terlebih Dahulu"),
    pus_file: string().required("Pilih File Pustaka Terlebih Dahulu"),
    pus_judul: string().required("Isi Judul Terlebih Dahulu"),
    pus_kata_kunci: string().required("Isi Kata Kunci Terlebih Dahulu"),
    pus_keterangan: string().required("Isi Keterangan Terlebih Dahulu"),
    pus_gambar: string(),
    pus_status: string(),
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

    if (fileSize / 1024576 > 5) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    formDataRef.current[name] = fileName;

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

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

      console.log(fileInputRef.current.files[0]);
      if (fileInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(fileInputRef.current).then((data) => {
            formDataRef.current["pus_file"] = data.newFileName;
          })
        );
      }

      if (gambarInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(gambarInputRef.current).then((data) => {
            formDataRef.current["pus_gambar"] = data.newFileName;
          })
        );
      }

      Promise.all(uploadPromises).then(() => {
        console.log(formDataRef.current.pus_gambar);
        console.log(formDataRef.current.pus_file);
        console.log(formDataRef.current.kke_id);
        
        UseFetch(API_LINK + "Pustakas/SaveDataPustaka", formDataRef.current)
          .then((data) => {
            if (data === "ERROR") {
              setIsError((prevError) => {
                return {
                  ...prevError,
                  error: true,
                  message: "Terjadi kesalahan: Gagal menyimpan data Pustaka.",
                };
              });
            } else {
              SweetAlert("Sukses", "Data Pustaka berhasil disimpan", "success");
              onChangePage("index");
            }
          })
          .then(() => setIsLoading(false));
      });
    }
  };

  const getListKK = async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KKs/GetDataKK", {
          page: 1,
          query: "",
          sort: "[Nama Kelompok Keahlian] asc",
          status: "Aktif",
        });

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
          );
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else if (data === "data kosong") {
          setListKK(data);
          break;
        } else {
          const formattedData = data.map((item) => ({
            Value: item["Key"],
            Text: item["Nama Kelompok Keahlian"],
          }));
          setListKK(formattedData);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(true);
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  useEffect(() => {
    getListKK();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Tambah Pustaka Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="pus_judul"
                  label="Judul / Nama File Pustaka"
                  isRequired
                  value={formDataRef.current.pus_judul}
                  onChange={handleInputChange}
                  errorMessage={errors.pus_judul}
                />
              </div>
              <div className="col-lg-4">
                <Select2Dropdown
                  forInput="kke_id"
                  label="Kelompok Keahlian"
                  arrData={listKK}
                  isRequired
                  value={formDataRef.current.kke_id}
                  onChange={handleInputChange}
                  errorMessage={errors.kke_id}
                />
              </div>
              <div className="col-lg-4">
                {/* Dijadikan text biasa */}
                <Input
                  type="text"
                  forInput="pus_kata_kunci"
                  label="Kata Kunci"
                  isRequired
                  value={formDataRef.current.pus_kata_kunci}
                  onChange={handleInputChange}
                  errorMessage={errors.pus_kata_kunci}
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  ref={fileInputRef}
                  forInput="pus_file"
                  label="File Pustaka (.pdf, .docx, .xlsx, .pptx, .mp4)"
                  formatFile=".pdf,.docx,.xlsx,.pptx,.mp4"
                  onChange={() => handleFileChange(fileInputRef, "pdf,docx,xlsx,pptx,mp4")}
                  errorMessage={errors.pus_file}
                  isRequired
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  ref={gambarInputRef}
                  forInput="pus_gambar"
                  label="Gambar Cover (.jpg, .png) Ukuran( 3x5 )"
                  formatFile=".pdf,.jpg,.png"
                  onChange={() => handleFileChange(gambarInputRef, "jpg,png")}
                  errorMessage={errors.pus_gambar}
                  isRequired
                />
              </div>
              <div className="col-lg-12">
                <Input
                  type="textarea"
                  forInput="pus_keterangan"
                  label="Sinopsis / Ringkasan Pustaka"
                  isRequired
                  value={formDataRef.current.pus_keterangan}
                  onChange={handleInputChange}
                  errorMessage={errors.pus_keterangan}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("index", withID)}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
          />
        </div>
      </form>
    </>
  );
}
