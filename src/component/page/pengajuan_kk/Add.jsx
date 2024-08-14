import React, { useEffect, useRef, useState } from "react";
import Button from "../../part/Button";
import FileUpload from "../../part/FileUpload";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { array, object, string } from "yup";
import UseFetch from "../../util/UseFetch";
import uploadFile from "../../util/UploadFile";
import SweetAlert from "../../util/SweetAlert";
import Alert from "../../part/Alert";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";

export default function PengajuanAdd({ onChangePage, withID }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [lampiranCount, setLampiranCount] = useState(1);
  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

  const formDataRef = useRef({
    kke_id: withID["ID KK"],
    kry_id: userData.kry_id,
    status: "Menunggu Acc",
    creaby: activeUser,
    lampirans: [],
  });

  const userSchema = object({
    kke_id: string(),
    kry_id: string(),
    status: string(),
    creaby: string(),
    lampirans: array().of(string()).required("harus diisi"),
  });

  const [fileInfos, setFileInfos] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);

  const lampiranRefs = useRef([]);

  const handleTambahLampiran = () => {
    setLampiranCount((prevCount) => {
      lampiranRefs.current[prevCount] = React.createRef();
      return prevCount + 1;
    });
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const getUserKryID = async () => {
    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          param: activeUser,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setUserData(data[0]);
          formDataRef.current.kry_id = data[0].kry_id;
          setIsLoading(false);
          break;
        }
      }
    } catch (error) {
      setUserData(null);
      setIsLoading(true);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  };

  useEffect(() => {
    getUserKryID();
  }, []);

  const handleFileChange = async (ref, extAllowed, index) => {
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

    setFileErrors((prevErrors) => {
      const newErrors = [...prevErrors];
      newErrors[index] = error;
      return newErrors;
    });

    // Update fileInfos array
    if (!error) {
      setFileInfos((prevInfos) => {
        const newInfos = [...prevInfos];
        newInfos[index] = {
          fileName,
          fileSize: (fileSize / 1024 / 1024).toFixed(2) + " MB",
          fileExt,
        };
        return newInfos;
      });
    } else {
      setFileInfos((prevInfos) => {
        const newInfos = [...prevInfos];
        newInfos[index] = null;
        return newInfos;
      });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (fileInfos.length === 0) {
      SweetAlert(
        "Gagal",
        "Pengajuan gagal. Tolong lampirkan minimal 1 file",
        "warning"
      );
      return;
    }

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      SweetAlert(
        "Konfirmasi",
        "Apakah Anda yakin ingin mengirim pengajuan ini?",
        "info",
        "Ya"
      ).then(async (confirm) => {
        if (confirm) {
          setIsLoading(true);

          const uploadPromises = [];
          formDataRef.current.lampirans = [];

          lampiranRefs.current.forEach((ref) => {
            if (ref && ref.current && ref.current.files.length > 0) {
              uploadPromises.push(
                uploadFile(ref.current).then((data) => {
                  if (data !== "ERROR" && data.newFileName) {
                    formDataRef.current.lampirans.push({
                      pus_file: data.newFileName,
                    });
                  } else {
                    throw new Error("File upload failed");
                  }
                })
              );
            }
          });

          try {
            await Promise.all(uploadPromises);

            const response = await UseFetch(
              API_LINK + "Pengajuans/SaveAnggotaKK",
              formDataRef.current
            );
            if (response === "ERROR") {
              setIsError({
                error: true,
                message:
                  "Terjadi kesalahan: Gagal menyimpan data Pengajuan KK.",
              });
            } else {
              SweetAlert(
                "Sukses",
                "Data Pengajuan berhasil disimpan",
                "success"
              );
              window.location.reload();
            }
          } catch (error) {
            setIsError({
              error: true,
              message:
                "Terjadi kesalahan: Gagal mengupload file atau menyimpan data.",
            });
          } finally {
            setIsLoading(false);
          }
        }
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {isError.error && (
            <div className="flex-fill">
              <Alert type="danger" message={isError.message} />
            </div>
          )}
          <form onSubmit={handleAdd}>
            <div className="card">
              <div className="card-header bg-primary fw-medium text-white">
                Pengajuan Kelompok Keahlian
              </div>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-lg-6">
                    <Label title="Nama" data={userData.Nama} />
                  </div>
                  <div className="col-lg-6">
                    <Label
                      title="Kelompok Keahlian"
                      data={withID["Nama Kelompok Keahlian"]}
                    />
                  </div>
                  <div className="col-lg-12 mt-3">
                    <div className="card">
                      <div className="card-header fw-medium">
                        Lampiran Pendukung
                      </div>
                      <div className="card-body p-4">
                        <Alert
                          type="info fw-bold"
                          message="Notes: Lampiran dapat berupa Sertifikat Keahlian, Surat Tugas, atau
                          Berkas Lainnya yang berkaitan"
                        />
                        <p className="ps-3 mb-0">
                          Format Penamaan:
                          namafile_namakelompokkeahlian_namakaryawan (Opsional)
                        </p>
                        <p className="ps-3">
                          Contoh: SertifikasiMicrosoft_DataScience_CandraBagus
                        </p>
                        <Button
                          iconName="add"
                          classType="primary btn-sm mb-3"
                          label="Tambah Lampiran"
                          onClick={handleTambahLampiran}
                        />
                        {[...Array(lampiranCount)].map((_, index) => (
                          <div key={index}>
                            <FileUpload
                              isRequired="true"
                              forInput={`lampiran_${index}`}
                              label={`Lampiran ${index + 1}`}
                              errorMessage={fileErrors[index] ? fileErrors[index] : ""}
                              onChange={() =>
                                handleFileChange(
                                  lampiranRefs.current[index],
                                  "pdf",
                                  index
                                )
                              }
                              formatFile=".pdf"
                              ref={
                                lampiranRefs.current[index] ||
                                (lampiranRefs.current[index] =
                                  React.createRef())
                              }
                            />
                            {fileInfos[index] && (
                              <div className="mt-2">
                                <strong>File Info:</strong>
                                <ul>
                                  <li>Nama: {fileInfos[index].fileName}</li>
                                  <li>Ukuran: {fileInfos[index].fileSize}</li>
                                  <li>Ekstensi: {fileInfos[index].fileExt}</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="float-end my-4 mx-1">
              <Button
                classType="secondary me-2 px-4 py-2"
                label="Batal"
                onClick={() => onChangePage("index")}
              />
              <Button
                classType="primary ms-2 px-4 py-2"
                type="submit"
                label="Kirim Pengajuan"
              />
            </div>
          </form>
        </>
      )}
    </>
  );
}
