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
      let data = await UseFetch(API_LINK + "KKs/GetDataKKbyProdi");

      if (data === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil daftar Kelompok Keahlian."
        );
      } else if (data.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await getListKK(); // Retry if no data
      } else {
        setCurrentData(data);
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError({ error: true, message: e.message });
    }
  };

  const getListAnggotaOld = async (idKK, index) => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      let data = await await axios.post(API_LINK + "AnggotaKK/GetAnggotaKK", {
        page: 1,
        query: "",
        sort: "[Nama Anggota] ASC",
        status: "",
        kke_id: idKK,
      });

      if (data.data[0] === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
      } else if (data.data.length < 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await getListAnggota(idKK, index);
      } else {
        setListAnggota((prevListAnggota) => {
          const newListAnggota = [...prevListAnggota];
          newListAnggota[index] =
            data.data[0] === "data kosong" ? [] : data.data;
          return newListAnggota;
        });
        console.log("terpanggil " + idKK + "di index " + index);
        if (currentData.length === index + 1) {
          console.log("berenti");
          setIsLoading(false);
        }
      }

      // while (true) {
      //   let data = await UseFetch(API_LINK + "AnggotaKK/GetAnggotaKK", {
      //     page: 1,
      //     query: "",
      //     sort: "[Nama Anggota] ASC",
      //     status: "",
      //     kke_id: idKK,
      //   });

      //   if (data === "ERROR") {
      //     throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
      //   } else if (data.length === 0) {
      //     await new Promise((resolve) => setTimeout(resolve, 2000));
      //   } else {
      //     setListAnggota((prevListAnggota) => {
      //       const newListAnggota = [...prevListAnggota];
      //       newListAnggota[index] = data[0] === "data kosong" ? [] : data;
      //       return newListAnggota;
      //     });
      //     console.log(data);
      //     break;
      //   }
      // }
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

  const getListAnggota = (idKK, index) => {
    return new Promise(async (resolve, reject) => {
      setIsError({ error: false, message: "" });

      try {
        let data = await axios.post(API_LINK + "AnggotaKK/GetAnggotaKK", {
          page: 1,
          query: "",
          sort: "[Nama Anggota] ASC",
          status: "",
          kke_id: idKK,
        });

        if (data.data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
        } else if (data.data.length < 1 || data.status === 500) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await getListAnggota(idKK, index);
        } else {
          setListAnggota((prevListAnggota) => {
            const newListAnggota = [...prevListAnggota];
            newListAnggota[index] =
              data.data[0] === "data kosong" ? [] : data.data;
            return newListAnggota;
          });
          console.log("terpanggil " + idKK + "di index " + index);
        }

        resolve();
      } catch (e) {
        console.log(e.message);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: e.message,
        }));
        reject(e);
      }
    });
  };

  useEffect(() => {
    getListKK();
  }, []);

  useEffect(() => {
    if (currentData.length > 0) {
      setIsLoading(true);
      const promises = currentData.map((val, index) =>
        getListAnggota(val.Key, index)
      );
      Promise.all(promises)
        .then(() => {
          setIsLoading(false);
        })
        .catch((e) => {
          console.log(e.message);
          setIsError({
            error: true,
            message: e.message,
          });
          setIsLoading(false);
        });
    }
  }, [currentData]);

  useEffect(() => {
    const legendTopElement = document.getElementById("legend-top");
    if (legendTopElement) {
      legendTopElement.innerHTML = `
        <div className="mb-3 d-flex">
              <p className="mb-0 me-3">
                <span
                  style={{
                    padding: "0px 10px 0px 10px",
                    margin: "0px 10px",
                    backgroundColor: "#67ACE9",
                  }}
                ></span>
                Tidak ada pengajuan anggota
              </p>
              <p className="mb-0 me-3">
                <span
                  style={{
                    padding: "0px 10px 0px 10px",
                    margin: "0px 10px",
                    backgroundColor: "#FFC107",
                  }}
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
                  .map((value, index) => (
                    <CardKonfirmasi
                      key={value.Key}
                      data={value}
                      anggotas={listAnggota[index] || []}
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
