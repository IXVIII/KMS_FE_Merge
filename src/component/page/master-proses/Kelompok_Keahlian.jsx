import React, { useEffect, useState } from "react";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import Icon from "../../part/Icon";
import CardKK from "../../part/CardKelompokKeahlian2";
import { API_LINK } from "../../util/Constants";

export default function SubKKIndex({ onChangePage }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [listKK, setListKK] = useState([]);

  const getKKAndPrograms = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const username = "fadli.h";
        setIsError({ error: false, message: "" });
        setIsLoading(true);

        let kkData = await UseFetch(API_LINK + "Program/GetDataKKByPIC", {
          username,
        });
        // console.log("KK Data:", kkData);

        if (kkData === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data Kelompok Keahlian."
          );
        }

        const kkWithPrograms = [];

        for (const kk of kkData) {
          const programData = await UseFetch(
            API_LINK + "Program/GetProgramByKK",
            { kk: kk.Key }
          );
          // console.log("Program Data for KK:", kk.Key, programData);

          if (programData === "ERROR") {
            throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
          }

          const anggotaCountData = await UseFetch(
            API_LINK + "Program/CountAnggotaByKK",
            { p1: kk.Key }
          );
          // console.log("Anggota Count Data for KK:", kk.Key, anggotaCountData);

          if (anggotaCountData === "ERROR") {
            throw new Error(
              "Terjadi kesalahan: Gagal menghitung jumlah anggota."
            );
          }

          const anggotaCount = anggotaCountData.length;
          // console.log("Member Count for KK:", kk.Key, anggotaCount);

          const programCountData = await UseFetch(
            API_LINK + "Program/CountProgramByKK",
            { p1: kk.Key }
          );
          // console.log("Program Count Data for KK:", kk.Key, programCountData);

          if (programCountData === "ERROR") {
            throw new Error(
              "Terjadi kesalahan: Gagal menghitung jumlah anggota."
            );
          }

          const programCount = programCountData.length;
          // console.log("Program Count for KK:", kk.Key, programCount);

          const programsWithCategories = [];

          for (const program of programData) {
            const categoryData = await UseFetch(
              API_LINK + "Program/GetKategoriByProgram",
              { p1: program.Key }
            );

            const categoriesWithMaterialCounts = await Promise.all(
              categoryData.map(async (category) => {
                const materialCountData = await UseFetch(
                  API_LINK + "Program/CountMateriByKategori",
                  { p1: category.Key }
                );
                return { ...category, materialCount: materialCountData.length };
              })
            );

            programsWithCategories.push({
              ...program,
              categories: categoriesWithMaterialCounts,
            });
          }

          kkWithPrograms.push({
            ...kk,
            programs: programsWithCategories,
            AnggotaCount: anggotaCount,
            ProgramCount: programCount,
          });
        }

        // console.log("KK with Programs:", kkWithPrograms);
        setListKK(kkWithPrograms);
        setIsLoading(false);
        return kkWithPrograms;
      } catch (error) {
        console.error("Error fetching KK and Programs data:", error);
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          setIsLoading(false);
          throw error;
        }
      }
    }
  };
  /*
  const getKKAndPrograms = async (retries = 3, delay = 1000) => {
    const username = "fadli.h";
    setIsError({ error: false, message: "" });
    setIsLoading(true); // Set isLoading to true before fetching data
  
    try {
      const kkData = await UseFetch(API_LINK + "Program/GetDataKKByPIC", { username });
      console.log("KK Data:", kkData);
  
      if (kkData === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data Kelompok Keahlian.");
      }
  
      const kkWithPrograms = [];
  
      for (const kk of kkData) {
        const programData = await UseFetch(API_LINK + "Program/GetProgramByKK", { kk: kk.Key });
        console.log("Program Data for KK:", kk.Key, programData);
  
        if (programData === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
        }
  
        const anggotaCountData = await UseFetch(API_LINK + "Program/CountAnggotaByKK", { p1: kk.Key });
        console.log("Anggota Count Data for KK:", kk.Key, anggotaCountData);
  
        if (anggotaCountData === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menghitung jumlah anggota.");
        }
  
        const anggotaCount = anggotaCountData.length;
        console.log("Member Count for KK:", kk.Key, anggotaCount);
  
        const programCountData = await UseFetch(API_LINK + "Program/CountProgramByKK", { p1: kk.Key });
        console.log("Program Count Data for KK:", kk.Key, programCountData);
  
        if (programCountData === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menghitung jumlah program.");
        }
  
        const programCount = programCountData.length;
        console.log("Program Count for KK:", kk.Key, programCount);
  
        // Fetch programs with categories, passing isLoading state
        const programsWithCategories = await fetchProgramsWithCategories(kk.Key, programData, retries, delay);
        
        kkWithPrograms.push({
          ...kk,
          programs: programsWithCategories,
          AnggotaCount: anggotaCount,
          ProgramCount: programCount
        });
      }
  
      console.log("KK with Programs:", kkWithPrograms);
      setListKK(kkWithPrograms);
      setIsLoading(false); // Set isLoading to false after all data is fetched and processed
      return kkWithPrograms;
  
    } catch (error) {
      console.error("Error fetching KK and Programs data:", error);
      setIsLoading(false); // Set isLoading to false if there is an error
      setIsError({ error: true, message: error.message });
      throw error; // Propagate the error to the caller
    }
  };
  
  const fetchProgramsWithCategories = async (kkKey, programData, retries = 3, delay = 1000) => {
    try {
      const programsWithCategories = [];
  
      for (let i = 0; i < retries; i++) {
        try {
          let allCategoriesSuccessfullyFetched = true; // Flag to track if all categories fetched successfully
  
          for (const program of programData) {
            const categoryData = await UseFetch(API_LINK + "Program/GetKategoriByProgram", { p1: program.Key });
  
            const categoriesWithMaterialCounts = await Promise.all(
              categoryData.map(async (category) => {
                try {
                  console.log(`Fetching material count for category ${category.Key}...`);
                  const materialCountData = await UseFetch(API_LINK + "Program/CountMateriByKategori", { p1: category.Key });
                  console.log(`Material count data for category ${category.Key}:`, materialCountData);
  
                  if (!Array.isArray(materialCountData)) {
                    throw new Error(`Unexpected data format for material count data: ${JSON.stringify(materialCountData)}`);
                  }
  
                  const materialCount = materialCountData.length;
  
                  console.log(`Material count for category ${category.Key}: ${materialCount}`);
  
                  return { ...category, materialCount };
                } catch (error) {
                  console.error(`Error fetching material count for category ${category.Key}:`, error);
                  allCategoriesSuccessfullyFetched = false; // Set flag to false if any category fails
                  throw error; // Propagate the error to retry for this category
                }
              })
            );
  
            programsWithCategories.push({ ...program, categories: categoriesWithMaterialCounts });
          }
  
          // If all categories are successfully fetched, return the result
          if (allCategoriesSuccessfullyFetched) {
            return programsWithCategories;
          }
  
        } catch (error) {
          console.error(`Error fetching categories (attempt ${i + 1}/${retries})`, error);
          if (i < retries - 1) {
            console.log(`Retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw new Error("Terjadi kesalahan: Gagal mengambil data kategori atau materi.");
          }
        }
      }
  
    } catch (error) {
      throw error; // Propagate the error to the calling function
    }
  };
  */

  const isDataReadyTemp = "";
  const materiIdTemp = "";
  const isOpenTemp = true;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await getKKAndPrograms(); // Call the updated function
        if (isMounted) {
          setListKK(data); // Update listKK state
        }
      } catch (error) {
        if (isMounted) {
          setIsError(true);
        }
        console.error("Fetch error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // useEffect(() => {
  //   getKKAndPrograms();
  // }, []);

  return (
    <>
      {isLoading && <Loading />}
      {isError.error && <Alert type="danger" message={isError.message} />}
      <div className="d-flex flex-column">
        {/* <div className="flex-fill">
          <div className="input-group">
            <Input forInput="pencarianProduk" placeholder="Cari" />
            <Button iconName="search" classType="primary px-4" title="Search" />
          </div>
        </div> */}
        <div className="flex-fill d-flex flex-wrap justify-content-center align-items-center">
          {listKK.map((kk, index) => (
            <CardKK key={index} kk={kk} onChangePage={onChangePage} />
          ))}
        </div>
      </div>
    </>
  );
}
