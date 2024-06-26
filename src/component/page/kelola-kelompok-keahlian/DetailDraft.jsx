import { useState, useEffect } from "react";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function KKDetailDraft({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    key: "",
    nama: "",
    programStudi: "",
    personInCharge: "",
    deskripsi: "",
    status: "",
  });

  useEffect(() => {
    if (withID) {
      setFormData({
        key: withID.id,
        nama: withID.title,
        programStudi: withID.prodi.nama,
        personInCharge: withID.pic.nama,
        deskripsi: withID.desc,
        status: withID.status,
      });
    }
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Lihat Kelompok Keahlian{" "}
            <span className="badge text-bg-dark">Draft</span>
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-12">
                <Input
                  type="text"
                  forInput="nama"
                  label="Nama Kelompok Keahlian"
                  value={formData.nama}
                  readOnly
                />
              </div>
              <div className="col-lg-12">
                <label style={{ paddingBottom: "5px", fontWeight: "bold" }}>
                  Deskripsi/Ringkasan Mengenai Kelompok Keahlian
                </label>
                <textarea
                  className="form-control mb-3"
                  style={{ height: "200px" }}
                  id="deskripsi"
                  name="deskripsi"
                  value={formData.deskripsi}
                  readOnly
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="programStudi"
                  label="Program Studi"
                  value={formData.programStudi}
                  readOnly
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="personInCharge"
                  label="PIC Kelompok Keahlian"
                  value={formData.personInCharge || "-"}
                  readOnly
                />
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
        </div>
      </form>
    </>
  );
}
