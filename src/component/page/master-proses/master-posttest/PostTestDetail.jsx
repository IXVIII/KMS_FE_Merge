import React, { useRef, useState, useEffect } from "react";
import Button from "../../../part/Button";
import { object, string } from "yup";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import { Stepper } from 'react-form-stepper';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import { API_LINK } from "../../../util/Constants";
import FileUpload from "../../../part/FileUpload";
import uploadFile from "../../../util/UploadImageQuiz";
import AppContext_test from "../MasterContext";
export default function MasterPreTestAdd({ onChangePage, withId }) {
  const [formContent, setFormContent] = useState([]);
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState('');

  const [formData, setFormData] = useState({
    quizId: '',
    materiId: '',
    quizJudul: '',
    quizDeskripsi: '',
    gambar: '',
    quizTipe: 'Posttest',
    tanggalAwal: '',
    tanggalAkhir: '',
    timer: '',
    status: 'Aktif',
    createdby: 'Admin',
  });

  formData.timer = timer;

  const convertSecondsToTimeFormat = (seconds) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDateIndonesian = (dateString) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const getDataQuiz = async () => {
    setIsLoading(true);

    try {
      while (true) {
        const data = await axios.post(API_LINK + 'Quiz/GetQuizByID', {
          id: AppContext_test.DetailMateri?.Key, tipe: "Posttest"
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data quiz.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const convertedData = {
            ...data.data[0],
            tanggalAwal: data.data[0]?.tanggalAwal ? new Date(data.data[0].tanggalAwal).toISOString().split('T')[0] : '',
            tanggalAkhir: data.data[0]?.tanggalAkhir ? new Date(data.data[0].tanggalAkhir).toISOString().split('T')[0] : '',
          };
          setTimer(data.data[0].timer ? convertSecondsToTimeFormat(data.data[0].timer) : '')
          setFormData(convertedData);
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

  const stripHtmlTags = (str) => {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const getDataQuestion = async () => {
    setIsLoading(true);

    try {
        while (true) {
            const { data } = await axios.post(API_LINK + 'Quiz/GetDataQuestion', {
                id: AppContext_test.DetailMateri?.Key, status: 'Aktif', Tipe: 'Posttest'
            });
            console.log(data);
            if (data === "ERROR") {
                throw new Error("Terjadi kesalahan: Gagal mengambil data quiz.");
            } else if (data.length === 0) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } else {
                const formattedQuestions = {};
                const filePromises = [];

                data.forEach((question) => {
                    if (question.Key in formattedQuestions) {
                        formattedQuestions[question.Key].options.push({
                            id: question.JawabanId,
                            label: question.Jawaban,
                            point: question.NilaiJawaban || 0,
                            key: question.Key,
                        });
                    } else {
                        formattedQuestions[question.Key] = {
                            type: question.TipeSoal,
                            text: question.Soal,
                            options: [],
                            gambar: question.Gambar ? question.Gambar : '',
                            point: question.NilaiJawaban || 0,
                            key: question.Key,
                        };

                        if (question.TipeSoal === 'Pilgan') {
                            formattedQuestions[question.Key].options.push({
                                id: question.JawabanId,
                                label: question.Jawaban,
                                point: question.NilaiJawaban || 0,
                                key: question.Key,
                            });
                        }

                        if (question.Gambar) {
                            const gambarPromise = fetch(
                                API_LINK + `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(question.Gambar)}`
                            )
                                .then((response) => response.blob())
                                .then((blob) => {
                                    const url = URL.createObjectURL(blob);
                                    formattedQuestions[question.Key].gbr = question.Gambar;
                                    formattedQuestions[question.Key].gambar = url;
                                })
                                .catch((error) => {
                                    console.error("Error fetching gambar:", error);
                                });
                            filePromises.push(gambarPromise);
                        }
                    }
                });

                await Promise.all(filePromises);

                const formattedQuestionsArray = Object.values(formattedQuestions);
                setFormContent(formattedQuestionsArray);
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
  useEffect(() => {
    getDataQuiz();
  }, [AppContext_test.DetailMateri?.Key]);
  
  useEffect(() => {
    if (formData.quizId) getDataQuestion();
  }, [formData.quizId]);
  
  if (isLoading) return <Loading />;
  
  return (
    <>
      <form id="myForm">
        <div>
          <Stepper
            steps={[
                { label: 'Materi', onClick: () => onChangePage("courseAdd") },
                { label: 'Pretest', onClick: () => onChangePage("pretestAdd") },
                { label: 'Sharing Expert', onClick: () => onChangePage("sharingDetail") },
                { label: 'Forum', onClick: () => onChangePage("forumDetail") },
                { label: 'Post Test', onClick: () => onChangePage("posttestDetail") }
            ]}
            activeStep={4}
            styleConfig={{
              activeBgColor: '#67ACE9',
              activeTextColor: '#FFFFFF',
              completedBgColor: '#67ACE9',
              completedTextColor: '#FFFFFF',
              inactiveBgColor: '#E0E0E0',
              inactiveTextColor: '#000000',
              size: '2em',
              circleFontSize: '1rem',
              labelFontSize: '0.875rem',
              borderRadius: '50%',
              fontWeight: 500
            }}
            connectorStyleConfig={{
              completedColor: '#67ACE9',
              activeColor: '#67ACE9',
              disabledColor: '#BDBDBD',
              size: 1,
              stepSize: '2em',
              style: 'solid'
            }}
          />
        </div>
        <div className="card mt-4" style={{ borderColor: "#67ACE9" }}>
          <div className="card-header fw-medium text-white" style={{ backgroundColor: "#67ACE9" }}>
            <h3 className="card-title">{formData.quizJudul}</h3>
          </div>
          <div className="card-body">
            <div className="row mt-3">
              <div className="col-md-12">
                <h4 className="mb-3 mt-0">Deskripsi</h4>
                <p className="pb-3">{formData.quizDeskripsi}</p>
                <h4 className="mb-3 mt-0">Tipe Quiz</h4>
                <p className="pb-3">{formData.quizTipe}</p>
                <h4 className="mb-3 mt-0">Durasi</h4>
                <p className="pb-3">{formData.timer}</p>
                <h4 className="mb-3 mt-0">Tanggal Dimulai</h4>
                <p className="pb-3">{formatDateIndonesian(formData.tanggalAwal)}</p>
                <h4 className="mb-3 mt-0">Tanggal Berakhir</h4>
                <p className="pb-3">{formatDateIndonesian(formData.tanggalAkhir)}</p>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-12">
                <h4 className="mb-3 mt-0">Pertanyaan</h4>
                {formContent.map((question, index) => (
                  <div key={index} className="mb-4">
                    <p style={{ fontSize: '0.75em', color: 'gray', marginBottom: '5px' }}>
        {question.type === "Essay" ? "(Essai)" : question.type === "Praktikum" ? "(Praktikum)" : "(Pilihan Ganda)"}
      </p>
                    <p>{index + 1}. {stripHtmlTags(question.text)}</p>
                    
                    {question.type === "Pilgan" && (
                      <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {question.options.map((option, optionIndex) => (
                          <li key={optionIndex}>
                            <input type="radio" disabled /> {option.label}
                            <span style={{ fontSize: '0.75em', marginLeft: '10px', color: 'gray' }}>({option.point} poin)</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {(question.type === "Essay" || question.type === "Praktikum") && ( // Periksa apakah ada gambar
                      <div>
                        
                      <img
                        id="image"
                        src={question.gambar}
                        alt="gambar"
                        className="img-fluid"
                        style={{
                          maxWidth: '300px', // Set maximum width for the image container
                          maxHeight: '300px', // Set maximum height for the image container
                          overflow: 'hidden', // Hide any overflow beyond the set dimensions
                          marginLeft: '10px'
                        }}
                      />
                      <span style={{ fontSize: '0.75em', marginLeft: '10px', color: 'gray' }}>({question.point} poin)</span>
                      </div>
                    )}
                    
                  </div>
                  
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("forumDetail")}
          />
        </div>
      </form>
    </>
  );
}
