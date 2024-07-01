import React, { useEffect, useState } from "react";
import { API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import DropDown from "../../part/Dropdown";
import Filter from "../../part/Filter";
import CardKonfirmasi from "../../part/CardKonfirmasi";
import Icon from "../../part/Icon";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import axios from "axios";

export default function KonfrimasiAnggotaIndex({ onChangePage }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [listAnggota, setListAnggota] = useState([]);

  const getListKK = async () => {
    setIsError({ error: false, message: "" });
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
          setCurrentData(data);
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
    getListKK();
  }, []);

  useEffect(() => {
    const legendTopElement = document.getElementById("legend-top");
    if (legendTopElement) {
      legendTopElement.innerHTML = `
        <div class="d-flex">
          <p class="mb-0 me-3">
            <span
              style="padding: 0px 10px 0px 10px; margin: 0px 10px; background-color: #67ACE9;"
            ></span>
            Tidak ada pengajuan anggota
          </p>
          <p class="mb-0 me-3">
            <span
              style="padding: 0px 10px 0px 10px; margin: 0px 10px; background-color: #FFC107;"
            ></span>
            Menunggu persetujuan
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
          {isError.error && (
            <div className="flex-fill">
              <Alert type="danger" message={isError.message} />
            </div>
          )}
          <div className="flex-fill">
            <div className="container">
              <div className="row mt-0 gx-4">
                {currentData
                  .filter((value) => {
                    return value.Status === "Aktif";
                  })
                  .map((value) => (
                    <CardKonfirmasi
                      key={value.Key}
                      data={value}
                      onChangePage={onChangePage}
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
