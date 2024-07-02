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

export default function PICIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [message, setMessage] = useState("");

  const getListKK = async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "KKs/GetDataKKbyProdi");

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
          );
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const formattedData = data.map((value) => {
            let configValue;
            if (value.Status != "Menunggu") configValue = { footer: "Aktif" };
            else
              configValue = {
                footer: "Btn",
                icon: "user",
                className: "primary btn-sm",
                label: "Tambah PIC",
                page: "edit",
              };

            return {
              ...value,
              config: configValue,
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
  }, []);

  function handleSetStatus(data, status) {
    SweetAlert("Error", "Maaf, anda tidak memiliki akses!", "warning");
  }

  useEffect(() => {
    const legendTopElement = document.getElementById("legend-top");
    if (legendTopElement) {
      legendTopElement.innerHTML = `
        <div class="d-flex">
          <p class="mb-0 me-3">
            <span
              style="
                padding: 0px 10px;
                margin: 0px 10px;
                background-color: #6c757d;
              "
            ></span>
            Menunggu PIC Prodi
          </p>
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
        </div>
      `;
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="d-flex flex-column">
          <div className="flex-fill">
            <div className="container">
              <div className="row mt-0 gx-4">
                <div className="d-flex justify-content-between">
                  <div className="my-3">
                    <span className="badge fw-normal fs-6 text-dark-emphasis bg-secondary-subtle">
                      <Icon name="arrow-down" /> Menunggu PIC dari Prodi
                    </span>
                  </div>
                </div>
                {currentData
                  .filter((value) => {
                    return value.data.status === "Menunggu";
                  })
                  .map((value) => (
                    <CardKK
                      key={value.data.id}
                      config={value.config}
                      data={value.data}
                      onChangePage={onChangePage}
                    />
                  ))}
                <div className="my-3">
                  <span className="badge fw-normal fs-6 text-dark-emphasis bg-primary-subtle">
                    <Icon name="arrow-down" /> Kelompok Keahlian Lainnya
                  </span>
                </div>
                {currentData
                  .filter((value) => {
                    return value.data.status != "Menunggu";
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
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
