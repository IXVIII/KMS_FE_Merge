import { useState, useEffect } from "react";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Filter from "../../part/Filter";
import Icon from "../../part/Icon";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";

export default function PICKKDetailPublish({ onChangePage, withID }) {
    console.log("SDA : ",JSON.stringify(withID));
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listAnggota, setListAnggota] = useState([]);
  const [listProgram, setListProgram] = useState([]);

  const [formData, setFormData] = useState({
    key: "",
    nama: "",
    programStudi: "",
    personInCharge: "",
    deskripsi: "",
    status: "",
    members: [],
    memberCount: "",
  });

  const getListAnggota = async () => {
    console.log("heree");
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "AnggotaKK/GetAnggotaKK", {
          page: 1,
          query: "",
          sort: "[Nama Anggota] asc",
          status: "Aktif",
          kke_id: withID.id,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
        } else if (data === "data kosong") {
          setListAnggota([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListAnggota(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  const getListProgram = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Program/GetProgram", {
          page: 1,
          query: "",
          sort: "[Nama Program] ASC",
          status: "Aktif",
          KKid: withID.id,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data program.");
        } else if (data === "data kosong") {
          setListProgram([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListProgram(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError({ error: true, message: e.message });
    }
  };

  useEffect(() => {
    if (withID) {
      setFormData({
        key: withID.id,
        nama: withID.title,
        programStudi: withID.prodi.nama,
        personInCharge: withID.pic.nama,
        deskripsi: withID.desc,
        status: withID.status,
        members: withID.members,
        memberCount: withID.memberCount,
      });
      getListAnggota();
      getListProgram();
    }
  }, [withID]);

  useEffect(() => {
    if (document.getElementById("spanMenuRoute")) {
      document.getElementById("spanMenuRoute").innerHTML =
        "<strong> - Detail</strong>";
    }
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Kelompok Keahlian
        </div>
        <div className="card-body">
          <div className="row pt-2">
            <div className="col-lg-7 px-4">
              <h3 className="mb-3 fw-semibold">{formData.nama}</h3>
              <h6 className="fw-semibold">
                <span
                  className="bg-primary me-2"
                  style={{ padding: "2px" }}
                ></span>
                {formData.programStudi}
              </h6>
              <div className="pt-2 ps-2">
                <Icon
                  name="user"
                  cssClass="p-0 ps-1 text-dark"
                  title="PIC Kelompok Keahlian"
                />{" "}
                <span>PIC : {formData.personInCharge}</span>
              </div>
              <hr className="mb-0" style={{ opacity: "0.2" }} />
              <p className="py-3" style={{ textAlign: "justify" }}>
                {formData.deskripsi}
              </p>
            </div>
            <div className="col-lg-5">
              {listAnggota.length > 0 ? (
                listAnggota[0].Message ? (
                  <p>Tidak Ada Anggota Aktif</p>
                ) : (
                  listAnggota.map((ag, index) => (
                    <div
                      className="card-profile mb-3 d-flex justify-content-between shadow-sm"
                      key={ag.Key}
                    >
                      <div className="d-flex w-100">
                        <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold text-primary">
                          {index + 1}
                        </p>
                        <div
                          className="bg-primary"
                          style={{ width: "1.5%" }}
                        ></div>
                        <div className="p-1 ps-2 d-flex">
                          <img
                            src="https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg"
                            alt={ag["Nama Anggota"]}
                            className="img-fluid rounded-circle"
                            width="45"
                          />
                          <div className="ps-3">
                            <p className="mb-0">{ag["Nama Anggota"]}</p>
                            <p className="mb-0" style={{ fontSize: "13px" }}>
                              {ag.Prodi}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <p>Tidak Ada Anggota Aktif</p>
              )}
              <div className="text-end">
                <Button
                  classType="light btn-sm text-primary text-decoration-underline px-3 mt-2"
                  type="submit"
                  label="Lihat Semua"
                  data-bs-toggle="modal"
                  data-bs-target="#modalAnggota"
                />
              </div>
            </div>
          </div>
          <h5 className="text-primary pt-2">
            Daftar Program dalam Kelompok Keahlian{" "}
            <strong>{formData.nama}</strong>
          </h5>
          {listProgram.length > 0 ? (
            listProgram[0].Message ? (
              <p>Tidak Ada Program</p>
            ) : (
              listProgram.map((data, index) => (
                <div
                  key={data.Key}
                  className="card card-program mt-3 border-secondary"
                >
                  <div className="card-body d-flex justify-content-between align-items-center border-bottom border-secondary">
                    <p className="fw-medium mb-0" style={{ width: "20%" }}>
                      {index + 1}
                      {". "}
                      {data["Nama Program"]}
                    </p>
                    <p
                      className="mb-0 pe-3"
                      style={{
                        width: "80%",
                      }}
                    >
                      {data.Deskripsi}
                    </p>
                  </div>
                </div>
              ))
            )
          ) : (
            <p>Tidak Ada Program</p>
          )}
        </div>
      </div>
      <div className="float-end my-4 mx-1">
        <Button
          classType="secondary me-2 px-4 py-2"
          label="Kembali"
          onClick={() => onChangePage("index")}
        />
      </div>

      <div
        class="modal fade"
        id="modalAnggota"
        tabindex="-1"
        aria-labelledby="Anggota Kelompok Keahlian"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="modalAnggotaKK">
                Anggota Kelompok Keahlian
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div className="input-group mb-4">
                <Input
                  //   ref={searchQuery}
                  forInput="pencarianProduk"
                  placeholder="Cari"
                />
                <Button
                  iconName="search"
                  classType="primary px-4"
                  title="Cari"
                  //   onClick={handleSearch}
                />
                <Filter>
                  <DropDown
                    // ref={searchFilterSort}
                    forInput="ddUrut"
                    label="Urut Berdasarkan"
                    type="none"
                    // arrData={dataFilterSort}
                    defaultValue="[Kode Produk] asc"
                  />
                  <DropDown
                    // ref={searchFilterJenis}
                    forInput="ddJenis"
                    label="Jenis Produk"
                    type="semua"
                    // arrData={dataFilterJenis}
                    defaultValue=""
                  />
                  <DropDown
                    // ref={searchFilterStatus}
                    forInput="ddStatus"
                    label="Status"
                    type="none"
                    // arrData={dataFilterStatus}
                    defaultValue="Aktif"
                  />
                </Filter>
              </div>
              {listAnggota.length > 0 ? (
                listAnggota[0].Message ? (
                  <p>Tidak Ada Anggota Aktif</p>
                ) : (
                  listAnggota.map((ag, index) => (
                    <div
                      className="card-profile mb-3 d-flex justify-content-between shadow-sm"
                      key={ag.Key}
                    >
                      <div className="d-flex w-100">
                        <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold text-primary">
                          {index + 1}
                        </p>
                        <div
                          className="bg-primary"
                          style={{ width: "1.5%" }}
                        ></div>
                        <div className="p-1 ps-2 d-flex">
                          <img
                            src="https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg"
                            alt={ag["Nama Anggota"]}
                            className="img-fluid rounded-circle"
                            width="45"
                          />
                          <div className="ps-3">
                            <p className="mb-0">{ag["Nama Anggota"]}</p>
                            <p className="mb-0" style={{ fontSize: "13px" }}>
                              {ag.Prodi}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <p>Tidak Ada Anggota Aktif</p>
              )}
            </div>
            <div className="modal-footer">
              <Button
                classType="secondary btn-sm px-3 mt-2"
                type="submit"
                label="Kelola"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
