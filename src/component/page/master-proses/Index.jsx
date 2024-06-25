import { useEffect, useRef, useState } from "react";
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
import "../../../index.css";
// Definisikan beberapa data contoh untuk tabel
import AppContext_test from "./MasterContext";

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
    Sharing_pdf: null,
    Sharing_vidio: null,
    Status: "Aktif",
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Judul] ASC", Text: "Nama Materi [↑]" },
  { Value: "[Judul] DESC", Text: "Nama Materi [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterProsesIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    status: "Semua",
    query: "",
    sort: "Judul",
    order: "asc",
    kategori:AppContext_test.KategoriIdByKK,
  });
  console.log(currentData)
  // AppContext_test.kategoriId = withID;
  // const kategori = withID;
  const searchQuery = useRef(null);
  const searchFilterSort = useRef(null);
  const searchFilterStatus = useRef(null);

  function handleSetStatus(id) {
    setIsError(false);

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
      // status: newStatus,
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
    const fetchData = async () => {
        setIsError(false);
        setIsLoading(true);

        try {
            const data = await UseFetch(
                API_LINK + "Materis/GetDataMateriByKategori",
                currentFilter
            );

            if (data === "ERROR") {
                setIsError(true);
            } else if (data.length === 0) {
                setCurrentData(inisialisasiData);
            } else {
                //Mengosongkan isi form materi&forum
                AppContext_test.MateriForm = "";
                AppContext_test.ForumForm = "";
                AppContext_test.formSavedMateri = false; 
                AppContext_test.formSavedForum = false; 
                const formattedData = data.map((value) => ({
                    ...value,
                }));
                const promises = formattedData.map((value) => {
                    const filePromises = [];

                    // Fetch image
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
                                console.error("Error fetching gambar:", error);
                                return value;
                            });
                        filePromises.push(gambarPromise);
                    }

                    // Fetch video
                    if (value.File_video) {
                        const videoPromise = fetch(
                            API_LINK +
                            `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.File_video
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.vid = value.File_video;
                                value.File_video_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching video:", error);
                                return value;
                            });
                        filePromises.push(videoPromise);
                    }

                    // Fetch PDF
                    if (value.File_pdf) {
                        const pdfPromise = fetch(
                            API_LINK +
                            `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.File_pdf
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.pdf = value.File_pdf;
                                value.File_pdf_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching PDF:", error);
                                return value;
                            });
                        filePromises.push(pdfPromise);
                    }

                    // Fetch Sharing PDF
                    if (value.Sharing_pdf) {
                        const sharingPdfPromise = fetch(
                            API_LINK +
                            `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.Sharing_pdf
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.Sharing_pdf_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching sharing PDF:", error);
                                return value;
                            });
                        filePromises.push(sharingPdfPromise);
                    }

                    // Fetch Sharing Video
                    if (value.Sharing_video) {
                        const sharingVideoPromise = fetch(
                            API_LINK +
                            `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.Sharing_video
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.Sharing_video_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching sharing video:", error);
                                return value;
                            });
                        filePromises.push(sharingVideoPromise);
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
            setIsError(true);
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
}, [currentFilter]);

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
              <Button
                iconName="add"
                classType="success"
                title="Tambah Materi"
                label="Tambah Materi"
                onClick={() => onChangePage("materiAdd")}
              />
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
                {currentFilter.status === "Semua" ? (
                  <>
                    <CardMateri
                      materis={currentData}
                      onDetail={onChangePage}
                      onEdit={onChangePage}
                      onStatus={handleSetStatus}
                      isNonEdit={false}
                    onReviewJawaban={onChangePage}
                    />
                  </>
                ) : (
                  <CardMateri
                    materis={currentData.filter(materi => materi.Status === currentFilter.status)}
                    onDetail={onChangePage}
                    onEdit={onChangePage}
                    onStatus={handleSetStatus}
                      isNonEdit={false}
                    onReviewJawaban={onChangePage}
                  />
                )}
              </div>
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