import React from "react";
import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import DropDown from "../../part/Dropdown";
import Filter from "../../part/Filter";
import CardKK from "../../part/CardKelompokKeahlian";
import Icon from "../../part/Icon";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const dataFilterSort = [
  { Value: "[Nama Kelompok Keahlian] asc", Text: "Nama Kelompok Keahlian [↑]" },
  {
    Value: "[Nama Kelompok Keahlian] desc",
    Text: "Nama Kelompok Keahlian  [↓]",
  },
];

const dataFilterStatus = [
  { Value: "", Text: "Semua" },
  { Value: "Menunggu", Text: "Menunggu PIC Prodi" },
  { Value: "Draft", Text: "Draft" },
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function KKIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] asc",
    status: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: searchFilterStatus.current.value,
      };
    });
  }

  const getListKK = async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KKs/GetDataKK", currentFilter);
        console.log("HALOHA", currentFilter);
        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
          );
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else if (data === "data kosong") {
          setCurrentData(data);
          break;
        } else {
          const formattedData = data.map((value) => {
            return {
              ...value,
              config: { footer: value.Status },
              data: {
                id: value.Key,
                title: value["Nama Kelompok Keahlian"],
                prodi: { key: value["Kode Prodi"], nama: value.Prodi },
                pic: { key: value["Kode Karyawan"], nama: value.PIC },
                desc: value.Deskripsi,
                status: value.Status,
                members: value.Members || [],
                memberCount: value.Count || 0,
              },
            };
          });
          setCurrentData(formattedData);
          console.log(formattedData);
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
  }, [currentFilter]);

  // DELETE PERMANEN DATA DRAFT
  function handleDelete(id) {
    setIsError(false);

    SweetAlert(
      "Konfirmasi Hapus",
      "Anda yakin ingin <b>menghapus permanen</b> data ini?",
      "warning",
      "Hapus"
    ).then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "KKs/DeleteKK", {
          idKK: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert("Sukses", "Data berhasil dihapus.", "success");
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  // MENGUBAH STATUS
  function handleSetStatus(data, status) {
    setIsError(false);

    let message;

    if (data.status === "Draft" && !data.pic.key)
      message = "Apakah anda yakin ingin mengirimkan data ini ke Prodi?";
    else if (data.status === "Draft")
      message = "Apakah anda yakin ingin mempublikasikan data ini?";
    else if (data.status === "Aktif")
      message =
        "Apakah anda yakin ingin <b>menonaktifkan</b> data ini? <b>Semua anggota keahlian akan dikeluarkan secara otomatis</b> jika data ini dinonaktifkan";
    else if (data.status === "Tidak Aktif")
      message = "Apakah anda yakin ingin mengaktifkan data ini?";

    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "KKs/SetStatusKK", {
          idKK: data.id,
          status: status,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              let messageResponse;
              if (data[0].Status === "Menunggu") {
                messageResponse =
                  "Sukses! Data sudah dikirimkan ke Prodi. Menunggu Prodi menentukan PIC Kelompok Keahlian..";
              } else if (data[0].Status === "Aktif") {
                messageResponse =
                  "Sukses! Data berhasil dipublikasi. PIC Kelompok Keahlian dapat menentukan kerangka Program Belajar..";
              }
              SweetAlert("Sukses", messageResponse, "success");
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  useEffect(() => {
    const legendTopElement = document.getElementById("legend-top");
    if (legendTopElement) {
      legendTopElement.innerHTML = `
        <div class="d-flex fixed">
          <p class="mb-0 me-3">
            <span
              style="
                padding: 0px 10px;
                margin: 0px 10px;
                background-color: #67ACE9;
              "
            ></span>
            Aktif / Sudah dipublikasi
          </p>
          <p class="mb-0 me-3">
            <span
              style="
                padding: 0px 10px;
                margin: 0px 10px;
                background-color: #6c757d;
              "
            ></span>
            Draft / Menunggu PIC Prodi
          </p>
        </div>
      `;
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-logo-astra">
          <div className="input-group fixed">
            <Button
              iconName="add"
              classType="success"
              label="Tambah"
              onClick={() => onChangePage("add")}
            />
            <Input
              ref={searchQuery}
              forInput="pencarianProduk"
              placeholder="Cari"
            />
            <Button
              iconName="search"
              classType="primary px-4"
              title="Cari"
              onClick={handleSearch}
            />
            <Filter>
              <DropDown
                ref={searchFilterSort}
                forInput="ddUrut"
                label="Urut Berdasarkan"
                type="none"
                arrData={dataFilterSort}
                defaultValue="[Nama Kelompok Keahlian] asc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="none"
                arrData={dataFilterStatus}
                defaultValue=""
              />
            </Filter>
          </div>
          <div className="container">
            {currentData[0].Message ? (
              <Alert
                type="warning mt-3"
                message="Tidak ada data! Silahkan klik tombol tambah kelompok keahlian diatas.."
              />
            ) : (
              <div className="row mt-0 gx-4">
                {!currentFilter.status ? (
                  <div className="my-3">
                    <span className="badge fw-normal fs-6 text-dark-emphasis bg-primary-subtle">
                      <Icon name="arrow-down" /> Data Aktif / Menunggu PIC dari
                      Prodi
                    </span>
                  </div>
                ) : (
                  ""
                )}
                {currentData
                  .filter((value) => {
                    return (
                      value.config.footer != "Draft" &&
                      value.config.footer != "Menunggu"
                    );
                  })
                  .map((value) => (
                    <CardKK
                      key={value.data.id}
                      config={value.config}
                      data={value.data}
                      onChangePage={onChangePage}
                      onChangeStatus={handleSetStatus}
                    />
                  ))}
                {currentData
                  .filter((value) => {
                    return value.config.footer === "Menunggu";
                  })
                  .map((value) => (
                    <CardKK
                      key={value.data.id}
                      config={value.config}
                      data={value.data}
                      onChangePage={onChangePage}
                    />
                  ))}

                {!currentFilter.status ? (
                  <div className="my-3">
                    <span className="badge fw-normal fs-6 text-dark-emphasis bg-dark-subtle">
                      <Icon name="arrow-down" /> Data Draft / Belum dikirimkan
                      ke Prodi / Belum dipublikasi
                    </span>
                  </div>
                ) : (
                  ""
                )}
                {currentData
                  .filter((value) => {
                    return value.config.footer === "Draft";
                  })
                  .map((value) => (
                    <CardKK
                      key={value.data.id}
                      config={value.config}
                      data={value.data}
                      onChangePage={onChangePage}
                      onDelete={handleDelete}
                      onChangeStatus={handleSetStatus}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
