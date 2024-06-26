import { useEffect, useRef, useState } from "react";
import Button from "../../part/Button";
import Input from "../../part/Input";
import axios from "axios";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Icon from "../../part/Icon";
import Loading from "../../part/Loading";
import CardPustaka from "../../part/CardPustaka";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import SweetAlert from "../../util/SweetAlert";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Kelompok Keahlian": null,
    Judul: null,
    File: null,
    Keterangan: null,
    "Kata Kunci": null,
    Gambar: null,
    Uploader: null,
    Creadate: null,
    Status: "Aktif",
    Count: 0,
  },
];

export default function MasterDaftarPustakaIndex({ onChangePage, withID }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [listKK, setListKK] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    status: "Aktif",
    sort: "[Judul] ASC",
    kk: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();
  const searchFilterKK = useRef();

  const dataFilterSort = [
    { Value: "[Judul] ASC", Text: "Judul Pustaka [↑]" },
    { Value: "[Judul] DESC", Text: "Judul Pustaka [↓]" },
  ];

  const dataFilterStatus = [
    { Value: "Aktif", Text: "Aktif" },
    { Value: "Tidak Aktif", Text: "Tidak Aktif" },
  ];

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        status: searchFilterStatus.current.value,
        sort: searchFilterSort.current.value,
        kk: searchFilterKK.current.value,
      };
    });
  }

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSetStatus(id) {
    setIsError(false);

    SweetAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin mengubah status data Pustaka?",
      "warning",
      "Ya"
    ).then((confirmed) => {
      if (confirmed) {
        UseFetch(API_LINK + "Pustakas/SetStatusPustaka", {
          idPustaka: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert(
                "Sukses",
                "Status data Pustaka berhasil diubah menjadi " + data[0].Status,
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  const getListPustaka = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "Pustakas/GetDataPustaka",
          currentFilter
        );

        console.log(data);

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setIsLoading(true);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else if (data === "data kosong") {
          setCurrentData([]);
          setIsLoading(false);
          break;
        } else {
          const formattedData = data.map((value) => ({
            ...value,
          }));

          const promises = formattedData.map((value) => {
            const filePromises = [];

            if (value["Gambar"]) {
              const gambarPromise = fetch(
                API_LINK +
                  `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                    value["Gambar"]
                  )}`
              )
                .then((response) => response.blob())
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  value.gbr = value.Gambar;
                  value.Gambar = url;
                  return value;
                })
                .catch((error) => {
                  console.error("Error fetching gambar:", error);
                  return value;
                });
              filePromises.push(gambarPromise);
            }

            if (value["File"]) {
              const filePromise = fetch(
                API_LINK +
                  `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                    value["File"]
                  )}`
              )
                .then((response) => response.blob())
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  value.fls = value.File;
                  value.File = url;
                  return value;
                })
                .catch((error) => {
                  console.error("Error fetching file:", error);
                  return value;
                });
              filePromises.push(filePromise);
            }

            return Promise.all(filePromises).then((results) => {
              const updatedValue = results.reduce(
                (acc, curr) => ({ ...acc, ...curr }),
                value
              );
              return updatedValue;
            });
          });

          Promise.all(promises)
            .then((updatedData) => {
              setCurrentData(updatedData);
            })
            .catch((error) => {
              console.error("Error updating currentData:", error);
            });
        }
        setIsLoading(false);
        break;
      }
    } catch (error) {
      setIsError(true);
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getListPustaka();
  }, [currentFilter]);

  useEffect(() => {
    if (currentData.length === 0) setIsLoading(true);
  }, [currentData]);

  const getListKK = async () => {
    setIsError(false);

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
          break;
        }
      }
    } catch (e) {
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
    getListPustaka();
  }, []);

  useEffect(() => {
    if (document.getElementById("legend-top")) {
      document.getElementById("legend-top").innerHTML = `
        <div class="d-flex">
          <p class="mb-0 me-3">
            <span
              style="
                padding: 0px 10px;
                margin: 0px 10px;
                background-color: #198754;
              "
            ></span>
            Pustaka saya
          </p>
          <p class="mb-0 me-3">
            <span
              style="
                padding: 0px 10px;
                margin: 0px 10px;
                background-color: #67ACE9;
              "
            ></span>
            Aktif / Publik
          </p>
          <p class="mb-0 me-3">
            <span
              style="
                padding: 0px 10px;
                margin: 0px 10px;
                background-color: #6c757d;
              "
            ></span>
            Tidak Aktif
          </p>
        </div>`;
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="d-flex flex-column">
          {/* Tombol Tambah */}
          <div className="flex-fill">
            <div className="input-group">
              <Button
                iconName="add"
                classType="success"
                label={"Tambah"}
                onClick={() => onChangePage("add")}
              />
              <Input
                ref={searchQuery}
                forInput="pencarianAlatMesin"
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
                  defaultValue="[Judul] ASC"
                />
                <DropDown
                  ref={searchFilterKK}
                  forInput="ddJenis"
                  label="Kelompok Keahlian"
                  type="semua"
                  arrData={listKK}
                  defaultValue=""
                />
                <DropDown
                  ref={searchFilterStatus}
                  forInput="ddStatus"
                  label="Status"
                  type="none"
                  arrData={dataFilterStatus}
                  defaultValue="Aktif"
                />
              </Filter>
            </div>
            {/* <div className="mt-3 d-flex">
              <p className="mb-0 me-3">
                <span
                  style={{
                    padding: "0px 10px 0px 10px",
                    margin: "0px 10px",
                    backgroundColor: "#198754",
                  }}
                ></span>
                Pustaka saya
              </p>
              <p className="mb-0 me-3">
                <span
                  style={{
                    padding: "0px 10px 0px 10px",
                    margin: "0px 10px",
                    backgroundColor: "#67ACE9",
                  }}
                ></span>
                Aktif / Publik
              </p>
              <p className="mb-0 me-3">
                <span
                  style={{
                    padding: "0px 10px 0px 10px",
                    margin: "0px 10px",
                    backgroundColor: "#6c757d",
                  }}
                ></span>
                Tidak Aktif
              </p>
            </div> */}
            {currentData.length === 0 || currentData[0].Message ? (
              <Alert type="warning mt-3" message="Tidak ada data!" />
            ) : (
              <div
                className="row"
                style={{
                  maxWidth: "100%",
                }}
              >
                <CardPustaka
                  pustakas={currentData}
                  onDetail={onChangePage}
                  onEdit={onChangePage}
                  uploader={activeUser}
                  onStatus={handleSetStatus}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
