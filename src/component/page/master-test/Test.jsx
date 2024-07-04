import { useEffect, useRef, useState } from "react";
import { useLocation} from 'react-router-dom';
import { object, string } from "yup";
import { API_LINK, ROOT_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import KMS_Sidebar from '../../part/KMS_SideBar';
import Sidebar from '../../backbone/SideBar';
import styled from 'styled-components';
import KMS_Uploader from "../../part/KMS_Uploader";
import axios from "axios";
import Swal from 'sweetalert2';
import AppContext_test from "./TestContext";
import { RFC_2822 } from "moment/moment";

const ButtonContainer = styled.div`
  position: fixed;
  bottom: 35px;
  left: 30%;
  transform: translateX(-37%);
  z-index: 999;
`;

export default function PengerjaanTest({ onChangePage, quizType, materiId }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [questionNumbers, setQuestionNumbers] = useState(0);
  const [nilai, setNilai] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(false);
  const formDataRef = useRef({
    karyawanId:AppContext_test.activeUser,
    quizId: AppContext_test.quizId,
    nilai: "", 
    status: "Not Reviewed",
    answers: [],
    createdBy: AppContext_test.displayName,
    jumlahBenar: "",
  });
  const [formDataRef2, setFormData2] = useState([]);
  
  useEffect(() => {
  }, [quizType, materiId]);
  const formUpdate = useRef({
    idMateri:AppContext_test.materiId,
    karyawanId: AppContext_test.activeUser,
    totalProgress: "0", 
    statusMateri_PDF: "",
    statusMateri_Video: "",
    statusSharingExpert_PDF: "",
    statusSharingExpert_Video: "",
    createdBy: AppContext_test.activeUser,
  });
  function convertEmptyToNull(obj) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = value === "" ? null : value;
    }
    return newObj;
  }
  
  const processedFormUpdate = convertEmptyToNull(formUpdate);
  const fileInputRef = useRef(null);

  const userSchema = object({
    gambar: string(),
  });

  const handleSubmitConfirmation = () => {
    Swal.fire({
      title: 'Apakah anda yakin sudah selesai?',
      text: 'Jawaban akan disimpan dan tidak dapat diubah lagi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, submit',
      cancelButtonText: 'Tidak',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleAdd();
        handleSubmitAction();
      }
    });
  };

  
  useEffect(() => {
    if (timeRemaining == true){
        handleAdd();
        handleSubmitAction();
    }
  }, [timeRemaining]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  function handleSubmitAction() {
    if (quizType == "Pretest"){
      onChangePage("pretest", true, materiId)
      AppContext_test.refreshPage = "pretest";
    } else if (quizType == "Posttest"){
      onChangePage("posttest", true, materiId)
      AppContext_test.refreshPage = "posttest";
    }
  }

  const handleTextareaChange = (event, index, itemId) => {
    const value = event.target.value;
    handleValueAnswer("", "", "", "essay", index, value, itemId);

    console.log(event, index, itemId)
  };


  const handleFileChange = async (ref, extAllowed, fileUpload, currentIndex, id_question) => {
    handleValueAnswer("", "", "", "", currentIndex, fileUpload, id_question);
  };

  useEffect(() => {
    const checkStatus = () => {
      const hasEssayOrPraktikum = currentData.some(item => item.type === "Essay" || item.type === "Praktikum");
      formDataRef.current.status = hasEssayOrPraktikum ? "Not Reviewed" : "Reviewed";
    };

    checkStatus();
  }, [currentData]);

  const handleAdd = async (e) => {
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
    let countBenar = 0;
    const totalNilai = answers.reduce((accumulator, currentValue) => {
      const nilaiSelected = parseFloat(currentValue.nilaiSelected) || 0;
      if (nilaiSelected !== 0) {
        countBenar += 1;
      }
      return accumulator + nilaiSelected;
    }, 0);
    formDataRef.current.nilai = totalNilai;
    formDataRef.current.answers = submittedAnswers;
    formDataRef.current.jumlahBenar = countBenar;
    let responseSave = false;
    let maxRetries = 10; 
    let retryCount = 0;

    while ((!responseSave) && retryCount < maxRetries) {
      try {
        const [response1] = await Promise.all([
          UseFetch(API_LINK + "Quiz/SaveTransaksiQuiz", formDataRef.current)
        ]);
        if (response1.data != 0){
          responseSave = true;
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };


  const retryRequest = async (url, data, maxRetries = 100, delay = 50) => {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const response = await axios.post(url, data);
        return response.data;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw new Error("Max retries reached");
        }
        console.log(`Attempt ${attempts} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const selectPreviousQuestion = () => {
    if (selectedQuestion > 1) {
      setSelectedQuestion(selectedQuestion - 1);
    } else {
      setSelectedQuestion(selectedQuestion + questionNumbers - 1);
    }
  };

  const selectNextQuestionOrSubmit = () => {
    if (selectedQuestion < questionNumbers) {
      setSelectedQuestion(selectedQuestion + 1);
    } else {
      handleSubmitConfirmation();

    }
  };

  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);

  useEffect(() => {
  }, [AppContext_test.arrayAnswerQuiz]);

  const handleValueAnswer = (urutan, idSoal, answer, nilaiSelected, index, file, id_question) => {
    setSelectedOption(answer);
    const updatedAnswers = [...answers];
    const submitAnswer = [...submittedAnswers];
    const existingAnswerIndex = updatedAnswers.findIndex(
      (ans) => ans.idSoal === idSoal 
    );
    console.log("ds", updatedAnswers)
    if (file != undefined || file != null){
      const uploadPromises = [];
      const existingAnswerNonPilgan = updatedAnswers.findIndex(
        (ans) => ans.id_question === id_question 
      );
      uploadPromises.push(
        UploadFile(file.target).then((data) => {
          if (nilaiSelected != "essay") {
            if (existingAnswerNonPilgan !== -1) {
              updatedAnswers[existingAnswerNonPilgan] = {urutan,id_question,answer,nilaiSelected};
              submitAnswer[existingAnswerNonPilgan] = [urutan,id_question,data.newFileName];
            }else{
              updatedAnswers.push({urutan,id_question,answer,nilaiSelected});
              submitAnswer.push ([urutan,id_question,data.newFileName]) ;
            }
          } else {
            if (existingAnswerNonPilgan !== -1) {
              updatedAnswers[existingAnswerNonPilgan] = {nilaiSelected,id_question,answer,nilaiSelected};
              submitAnswer[existingAnswerNonPilgan] = [nilaiSelected,id_question,file];
            }else{
              updatedAnswers.push({nilaiSelected,id_question,answer,nilaiSelected});
              submitAnswer.push ([nilaiSelected,id_question,file]) ;
            }
          }
        })
      )
    }else{
      if (existingAnswerIndex !== -1) {
        updatedAnswers[existingAnswerIndex] = {urutan,idSoal,answer,nilaiSelected};
        submitAnswer[existingAnswerIndex] = [urutan,idSoal];
      } else {
        updatedAnswers.push({urutan,idSoal,answer,nilaiSelected});
        submitAnswer.push ([urutan,idSoal]) ;
      }
    }
      idSoal = index;

    setAnswers(updatedAnswers);
    setSubmittedAnswers(submitAnswer);
    console.log(submitAnswer)
    AppContext_test.indexTest = index;
  };
  
  useEffect(() => {
  }, [submittedAnswers]);

  useEffect(() => {
    setAnswerStatus((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[AppContext_test.indexTest - 1] = "answered";
      return newStatus;
    });
  }, [answers, AppContext_test.indexTest]);


  const [answerStatus, setAnswerStatus] = useState([]);

  useEffect(() => {
    const initialAnswerStatus = Array(questionNumbers).fill(null);
    setAnswerStatus(initialAnswerStatus);
  }, [questionNumbers]);


  const [gambar, setGambar] = useState();
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(API_LINK + "Quiz/GetDataQuestion", {
          idMateri: AppContext_test.materiId,
          status: 'Aktif',
          quizType: quizType,
        });
        const checkIsDone = await axios.post(API_LINK + "Quiz/GetDataResultQuiz", {
          materiId: AppContext_test.materiId,
          karyawanId: AppContext_test.activeUser,
        });
        if (checkIsDone.data && Array.isArray(checkIsDone.data)) {
          if (checkIsDone.data.length == 0) {
          } else {
          }
        }

        if (response.data && Array.isArray(response.data)) {
        AppContext_test.quizId = response.data[0].ForeignKey;
        const questionMap = new Map();
        const filePromises = [];

        const transformedData = response.data.map((item) => {
          const { Soal, TipeSoal, Jawaban, UrutanJawaban, NilaiJawaban, ForeignKey, Key, Gambar } = item;
          if (!questionMap.has(Soal)) {
            questionMap.set(Soal, true);
            const question = {
              id: Key,
              type: TipeSoal,
              question: Soal,
              correctAnswer: Jawaban,
              answerStatus: "none",
              gambar: Gambar ? "" : null,
            };

            if (Gambar) {
              const gambarPromise = fetch(API_LINK + `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(Gambar)}`)
                .then((response) => response.blob())
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  question.gambar = url;
                })
                .catch((error) => {
                  console.error("Error fetching gambar:", error);
                });
              filePromises.push(gambarPromise);
            }

            if (TipeSoal === "Pilgan") {
              question.options = response.data
                .filter(choice => choice.Key === item.Key)
                .map(choice => ({
                  value: choice.Jawaban,
                  urutan: choice.UrutanJawaban,
                  nomorSoal: choice.Key,
                  nilai: choice.NilaiJawaban,
                }));
              question.correctAnswer = question.options.find(option => option.value === Jawaban && option.nilai !== "0");
            }

            return question;
          }
          return null;
        }).filter(item => item !== null);

        await Promise.all(filePromises);

        setCurrentData(transformedData);
        setQuestionNumbers(transformedData.length);
      } else {
        throw new Error("Data format is incorrect");
      }
      } catch (error) {
        setIsError(true);
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    formDataRef.current.quizId = AppContext_test.quizId
  }, [AppContext_test.quizId]);

  const getSubmittedAnswer = (itemId) => {
    // Cari nilai yang sesuai dalam submittedAnswers
    const answer = submittedAnswers.find(
      (answer) => answer[1] === itemId
    );
    // Jika ditemukan, kembalikan nilai yang sesuai, jika tidak kembalikan string kosong
    return answer ? answer[2] : "";
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
    const sidebarMenuElement = document.querySelector('.sidebarMenu');
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add('sidebarMenu-hidden');
    }
  }, []);

  

  return (
  <>
    <div className="d-flex">
      <KMS_Sidebar
        questionNumbers={questionNumbers}
        selectedQuestion={selectedQuestion}
        setSelectedQuestion={setSelectedQuestion}
        answerStatus={answerStatus}
        checkMainContent="test"
        setTimeRemaining={setTimeRemaining}
      />
      <div className="flex-fill p-3 d-flex flex-column" style={{ marginLeft: "21vw" }}>
        <div className="mb-3 d-flex flex-wrap" style={{ overflowX: 'auto' }}>
          {currentData.map((item, index) => {
            const key = `${item.question}_${index}`;
            if (index + 1 !== selectedQuestion) return null;
            const currentIndex = index + 1;
            console.log(item)
            return (
              <div key={key} className="mb-3" style={{ display: 'block', minWidth: '300px', marginRight: '20px' }}>
                {/* Soal */}
                <div className="mb-3">
                  <h4 style={{ wordWrap: 'break-word', overflowWrap: 'break-word', textAlign:'justify' }}>
                    <div dangerouslySetInnerHTML={{ __html: item.question }} /> 
                  </h4>
                {(item.type === "Essay" || item.type === "Praktikum") && item.gambar && (
                  <div>
                    <img
                      id="image"
                      src={item.gambar}
                      alt="gambar"
                      className="img-fluid"
                      style={{
                        maxWidth: '300px',
                        maxHeight: '300px',
                        overflow: 'hidden',
                        marginLeft: '10px'
                      }}
                    />
                  </div>
                )}
                </div>

                {/* Jawaban */}
                {item.type === "Praktikum" ? (
                  <FileUpload
                    forInput="jawaban_file"
                    label="Jawaban (.zip)"
                    formatFile=".zip"
                    onChange={(event) => handleFileChange(fileInputRef, "zip", event, index + 1, item.id)}
                    style={{ width: '145vh' }}
                  />
                ) : item.type === "Essay" ? (
                  <Input
                    name="essay_answer"
                    type="textarea"
                    label="Jawaban Anda:"
                    value={getSubmittedAnswer(item.id)}
                    onChange={(event) => handleTextareaChange(event, index + 1, item.id)}
                    style={{ width: '145vh' }}
                  />
                ) : (
                  <div className="d-flex flex-column">
                    {item.options.map((option, index) => {
                      const isCorrect = option === item.correctAnswer;
                      const isSelected = answers.some(
                        (ans) => ans.idSoal == option.nomorSoal && ans.urutan == option.urutan
                      );

                      let borderColor1 = '';
                      let backgroundColor1 = '';

                      if (isSelected) {
                        borderColor1 = isCorrect ? '#28a745' : '#dc3545';
                        backgroundColor1 = isCorrect ? '#e9f7eb' : '#ffe3e6';
                      } else if (isCorrect && isSelected) {
                        borderColor1 = '#28a745';
                        backgroundColor1 = '#e9f7eb';
                      }

                      return (
                        <div key={option.urutan} className="mt-4 mb-2" style={{ display: "flex", alignItems: "center" }}>
                          <input
                            type="radio"
                            id={`option-${option.urutan}`}
                            name={`question-${selectedQuestion}`}
                            onChange={() => handleValueAnswer(option.urutan, option.nomorSoal, option.value, option.nilai, currentIndex)}
                            checked={isSelected}
                            style={{ display: "none" }}
                          />
                          <label
                            htmlFor={`option-${option.urutan}`}
                            className={`btn btn-outline-primary ${isSelected ? 'active' : ''}`}
                            style={{
                              width: "40px",
                              height: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {String.fromCharCode(65 + index)}
                          </label>
                          <span className="ms-2" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{option.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleAdd}>
          <div className="float-start my-4 mx-1">
            <ButtonContainer>
              <Button
                classType="secondary me-2 px-4 py-2"
                label="Sebelumnya"
                onClick={selectPreviousQuestion}
              />
              <Button
                classType="primary ms-2 px-4 py-2"
                label={selectedQuestion < questionNumbers ? "Berikutnya" : "Selesai"}
                onClick={selectNextQuestionOrSubmit}
              />
            </ButtonContainer>
          </div>
        </form>
      </div>
    </div>
  </>
);

}