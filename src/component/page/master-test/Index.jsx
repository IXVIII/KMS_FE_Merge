import { useEffect, useRef, useState, useContext } from "react";
import SweetAlert from "../../util/SweetAlert";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import CardMateri from "../../part/CardMateri2";
import UseFetch from "../../util/UseFetch";
import { API_LINK } from "../../util/Constants";
import '@fortawesome/fontawesome-free/css/all.css';
import axios from "axios";
import "../../../index.css";
import AppContext_master from "../master-proses/MasterContext";
import AppContext_test from "./TestContext";
// Definisikan beberapa data contoh untuk tabel

const inisialisasiData = [
  {
    Key: null,
    No: null,
    Kategori: null,
    Judul: null,
    File_pdf: null,
    File_vidio: null,
    Pengenalan: null,
    Keterangan: null,
    "Kata Kunci": null,
    Gambar: null,
    Status: "Aktif",
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Judul] ASC", Text: "Nama Materi [↑]" },
  { Value: "[Judul] DESC", Text: "Nama Materi [↓]" },
];

const dataFilterJenis = [
  { Value: "Pemrograman", Text: "Pemrograman" },
  { Value: "Basis Data", Text: "Basis Data" },
  { Value: "Jaringan Komputer", Text: "Jaringan Komputer" },
  // Tambahkan jenis lainnya jika diperlukan
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterProsesIndex({ onChangePage, withID, isOpen }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    status: "Semua",
    query: "",
    sort: "Judul",
    order: "asc",
  });
  const searchQuery = useRef(null);
  const searchFilterSort = useRef(null);
  const searchFilterStatus = useRef(null);
  
  function handleSetStatus(id) {
    setIsError(false);
    console.log("Index ID: " + id);

    SweetAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin mengubah status data Materi?",
      "warning",
      "Ya",
    ).then((confirmed) => {
      if (confirmed) {
        UseFetch(API_LINK + "Materis/setStatusMateri", {
          mat_id: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert(
                "Sukses",
                "Status data Materi berhasil diubah menjadi " + data[0].Status,
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      } else {
        console.log("Operasi dibatalkan.");
      }
    });
  }

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    const searchTerm = searchQuery.current.value.toLowerCase();
    const statusFilterValue = searchFilterStatus.current.value;
    const isStatusFilterSelected = statusFilterValue !== "" && statusFilterValue !== "Semua";

    const newStatus = isStatusFilterSelected ? statusFilterValue : "Semua";
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      query: searchTerm,
      status: newStatus,
    }));
  }

  function handleStatusChange(event) {
    const { value } = event.target;
    const newStatus = value === "" ? "Semua" : value;
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
    }));
  }

  function handleSortChange(event) {
    const { value } = event.target;
    const [sort, order] = value.split(" ");
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      sort,
      order,
    }));
  } 

  
  useEffect(() => {
    document.documentElement.style.setProperty('--responsiveContainer-margin-left', '13vw');
    const sidebarMenuElement = document.querySelector('.sidebarMenu');
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.remove('sidebarMenu-hidden');
    }
  }, []);

  useEffect(() => {
    const fetchData = async (retries = 3, delay = 1000) => {
      setIsError(false);
      setIsLoading(true);
      for (let i = 0; i < retries; i++) {
        try {
          const data = await UseFetch(
            API_LINK + "Materis/GetDataMateri",
            currentFilter
          );
          if (data.length != 0) {
            setCurrentData(inisialisasiData);
            const formattedData = data.map((value) => ({
              ...value,
            }));
            const promises = formattedData.map((value) => {
              const filePromises = [];

              if (value.Gambar) {
                const gambarPromise = fetch(
                  API_LINK +
                    `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                      value.Gambar
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
                    // console.error("Error fetching gambar:", error);
                    // return value;
                  });
                filePromises.push(gambarPromise);
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
        } catch (error) {
          // setIsError(true);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        } finally {
          setIsLoading(false);
        }
      }
      
    };

    fetchData();
  }, [AppContext_test.refreshPage]);
  
  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          {isError && (
            <div className="flex-fill">
              <Alert
                type="warning"
                message="Terjadi kesalahan: Gagal mengambil data materi."
              />
            </div>
          )}
          <div className="flex-fill">
            <div className="input-group">
              <Input
                ref={searchQuery}
                forInput="pencarianMateri"
                placeholder="Search"
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
                  // onChange={handleSortChange}
                />
                <DropDown
                  ref={searchFilterStatus}
                  forInput="ddStatus"
                  label="Status"
                  type="semua"
                  arrData={dataFilterStatus}
                  defaultValue="Semua"
                  // onChange={handleStatusChange}
                />
              </Filter>
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Loading />
            ) : (
              <div className="row">
                {currentFilter.status === "Semua" && (
                  <CardMateri
                    materis={currentData.filter(materi => materi.Status === "Aktif")}
                    onDetail={onChangePage}
                    onEdit={onChangePage}
                    onReviewJawaban={onChangePage}
                    onStatus={handleSetStatus}
                    isNonEdit={true}
                    onBacaMateri={onChangePage}
                  />
                )}
              </div>
            )}
            {currentData.length > 0 && currentData[0].Count > 20 && (
              <Paging
                totalItems={currentData[0].Count}
                itemsPerPage={20}
                currentPage={currentFilter.page}
                onPageChange={handleSetCurrentPage}
                className="mt-3"
              />
            )}
          </div>
        </div>
      </div>
      <div className="float my-4 mx-1">
        <Button
          classType="outline-secondary me-2 px-4 py-2"
          label="Kembali"
          onClick={() => onChangePage("kk")}
        />
      </div>
    </div>
  );
}
