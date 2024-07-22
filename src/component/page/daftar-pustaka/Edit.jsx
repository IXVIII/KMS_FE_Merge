import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { object, string } from "yup";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Select2Dropdown from "../../part/Select2Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import { API_LINK } from "../../util/Constants";
import Label from "../../part/Label";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";

const listKataKunci = [
  { Value: "Alat", Text: "Kat Kunci 1" },
  { Value: "Mesin", Text: "Kat Kunci 2" },
  { Value: "Perangkat Lunak", Text: "Kat Kunci 3" },
  { Value: "Lainnya", Text: "Kat Kunci 4" },
];

export default function MasterDaftarPustakaEdit({ onChangePage, withID }) {
  console.log("ID: " + JSON.stringify(withID));
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKK, setListKK] = useState([]);
  const [fileExtension, setFileExtension] = useState("");
  const [file, setFile] = useState("");

  const fileInputRef = useRef(null);
  const gambarInputRef = useRef(null);

  const formDataRef = useRef({
    pus_id: withID.Key,
    pus_judul: withID.Judul,
    kke_id: "",
    pus_file: withID.File,
    pus_keterangan: withID.Keterangan,
    pus_kata_kunci: withID["Kata Kunci"],
    pus_gambar: withID.gbr,
    pus_status: "Aktif",
  });

  const userSchema = object({
    pus_id: string(),
    pus_judul: string().required("Isi Judul Terlebih Dahulu"),
    kke_id: string().required("Pilih Terlebih Dahulu"),
    pus_file: string(),
    pus_keterangan: string().required("Isi Keterangan Terlebih Dahulu"),
    pus_kata_kunci: string().required("Isi Kata Kunci Terlebih Dahulu"),
    pus_gambar: string(),
    pus_status: string(),
  });

  const handleInputChange = async (e) => {
    console.log(
      "DADA: " + formDataRef.current.kke_id + formDataRef.current.pus_KK
    );
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

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  useEffect(() => {
    console.log(fileExtension);
    if (fileExtension === "mp4") {
      AppContext_test.urlMateri = withID.File;
    } else {
    fetch(
      API_LINK +
        `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
          withID.File
        )}`
    )
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setFile(url);
      })
      .catch((error) => {
        console.error("Error fetching file:", error);
      });
    }
  }, [fileExtension]);

  useEffect(() => {
    const fetchDataKK = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "KKs/GetDataKK", {
          page: 1,
          query: "",
          sort: "[Nama Kelompok Keahlian] asc",
          status: "Aktif",
        });
        // console.log("KK: " + JSON.stringify(data));

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else {
          // Mengubah data menjadi format yang diinginkan
          const formattedData = data.map((item) => ({
            Value: item["Key"],
            Text: item["Nama Kelompok Keahlian"],
          }));
          setListKK(formattedData);

          // Mencocokkan dengan nama Kelompok Keahlian dari withID
          const matchingItem = formattedData.find(
            (item) => item.Text === withID["Kelompok Keahlian"]
          );
          if (matchingItem) {
            formDataRef.current.kke_id = matchingItem.Value;
          }
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setListKK([]);
      }
    };

    fetchDataKK();
  }, [withID]);

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

      if (fileInputRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileInputRef.current).then(
            (data) => (formDataRef.current["pus_file"] = data.newFileName)
          )
        );
      }

      if (gambarInputRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(gambarInputRef.current).then(
            (data) => (formDataRef.current["pus_gambar"] = data.newFileName)
          )
        );
      }

      // console.log(fileInputRef.current);
      console.log("FORM: "+JSON.stringify(formDataRef.current));

      Promise.all(uploadPromises).then(() => {
        console.log("gambar"+formDataRef.current.pus_gambar);
        console.log("file"+formDataRef.current.pus_file);
        UseFetch(API_LINK + "Pustakas/UpdateDataPustaka", formDataRef.current)
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
              window.location.reload();
            }
          })
          .then(() => setIsLoading(false));
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
                  label="Judul Pustaka"
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
                  label="File/Bahan Ajar (.pdf, .mp4)"
                  formatFile=".pdf,.mp4"
                  onChange={() => handleFileChange(fileInputRef, "pdf,mp4")}
                  errorMessage={errors.pus_file}
                />
                <Label
                  // key={index}
                  title={"File Pustaka Sebelumnya"}
                  data={
                    file ? (
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Tampilkan Berkas
                      </a>
                    ) : (
                      "Tidak ada lampiran"
                    )
                  }
                />
              </div>
              <div className="col-lg-4 py-2">
                <FileUpload
                  ref={gambarInputRef}
                  forInput="pus_gambar"
                  label="Gambar Cover (.jpg, .png)"
                  formatFile=".pdf,.jpg,.png"
                  onChange={() => handleFileChange(gambarInputRef, "jpg,png")}
                  errorMessage={errors.pus_gambar}
                />
                <Label
                  // key={index}
                  title={"Gambar Cover Sebelumnya"}
                  data={
                    withID.Gambar ? (
                      <a
                        href={withID.Gambar}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Tampilkan Berkas
                      </a>
                    ) : (
                      "Tidak ada lampiran"
                    )
                  }
                />
              </div>
              <div className="col-lg-12">
                <Input
                  type="textarea"
                  forInput="pus_keterangan"
                  label="Keterangan Pustaka"
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
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN"
          />
        </div>
      </form>
    </>
  );
}
