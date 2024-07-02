import React from "react";
import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
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

export default function AnggotaKKIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [message, setMessage] = useState("");
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Kelompok Keahlian] asc",
    status: "Aktif",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: "Aktif",
      };
    });
  }

  const getListKK = async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KKs/GetDataKK", currentFilter);

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
          );
        } else if (data === "data kosong") {
          setCurrentData([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const formattedData = data.map((value) => {
            return {
              ...value,
              config: {
                footer: "Btn",
                icon: "users",
                className: "primary btn-sm",
                label: "Lihat Semua Anggota",
                page: "show",
              },
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
    console.log(currentData);
  }, [currentFilter]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="d-flex flex-column bg-logo-astra">
          <div className="flex-fill">
            <div className="input-group">
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
              </Filter>
            </div>
            <div className="container">
              <div className="row mt-3 gx-4">
                {currentData[0]?.Message ? (
                  <Alert
                    type="warning"
                    message="Tidak ada Kelompok Keahlian. PIC perlu ditetapkan agar Kelompok Keahlian aktif."
                  />
                ) : (
                  currentData.map((value) => (
                    <CardKK
                      key={value.data.id}
                      config={value.config}
                      data={value.data}
                      onChangePage={onChangePage}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
