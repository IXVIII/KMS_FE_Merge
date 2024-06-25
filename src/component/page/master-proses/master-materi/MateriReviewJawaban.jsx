import { useState, useEffect } from "react";
import { Stepper } from 'react-form-stepper';
import Loading from "../../../part/Loading";
import Icon from "../../../part/Icon";
import { Card, ListGroup, Button, Badge, Form } from "react-bootstrap";
import LocalButton from "../../../part/Button";
import axios from "axios";
import AppContext_test from "../../master-test/TestContext";
import { API_LINK } from "../../../util/Constants";
import Swal from 'sweetalert2';
import Alert from "../../../part/Alert";
import SweetAlert from "../../../util/SweetAlert";
export default function MasterMateriReviewJawaban({ onChangePage, status, withID }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [currentRespondentIndex, setCurrentRespondentIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentAnswers, setCurrentAnswers] = useState([]);
  // const [badges, setBadges] = useState([]); // Add state for badges
  // const [reviewStatus, setReviewStatus] = useState([]);
  const [badges, setBadges] = useState([]);
  const [reviewStatus, setReviewStatus] = useState([]);

  const [formDataReview, setFormDataReview] = useState([]);

  const handleSubmitAction = async () => {
    try {
      setIsLoading(true);
      for (const review of formDataReview) {
        const { idSoal, isCorrect, materiId, idKaryawan, idQuiz, idTransaksi } = review;
        const response = await axios.post("http://localhost:8080/Quiz/SaveReviewQuiz", {
          p1: idTransaksi,
          p2: idSoal,
          p3: isCorrect.toString(),
          p4: materiId,
          p5: idKaryawan,
          p6: idQuiz,
        });
        SweetAlert(
          "Sukses",
          "Review jawaban telah berhasil disimpan!",
          "success"
        );
      }
      setIsLoading(false); 
      onChangePage("index")
    } catch (error) {
      setIsLoading(false);
      console.error("Error saving review:", error);
    }
  };

  const handleSaveReview = () => {
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
        handleSubmitAction();
      }
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await fetchDataWithRetry();
        if (isMounted) {
          if (data && Array.isArray(data)) {
            if (!data || data.length === 0) {
              setIsError(true);
              setIsLoading(false);
              return;
            } else {
              setCurrentData(data);
              // Initialize badges array
              setBadges(Array(data.length).fill(null));
              setReviewStatus(Array(data.length).fill(null).map(() => Array(currentQuestions.length).fill(false)));
              await fetchQuestions(data[0].qui_tipe);
              await fetchAnswers(data[0].qui_tipe, data[0].kry_id);
            }
          } else {
            throw new Error("Data format is incorrect");
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsError(true);
          console.error("Fetch error:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchDataWithRetry = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          setIsLoading(true)
          const response = await axios.post("http://localhost:8080/Quiz/GetDataTransaksiReview", {
            quizId: AppContext_test.materiId,
          });
          if (response.data.length !== 0) {
            setIsLoading(false)
            const filteredTransaksi = response.data.filter(transaksi =>
              transaksi.trq_status === "Not Reviewed"
            );
            return filteredTransaksi;
          }
        } catch (error) {
          console.error("Error fetching quiz data:", error);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };
    fetchData();

    return () => {
      isMounted = false; // cleanup flag
    };
  }, [AppContext_test.materiId, AppContext_test.refresh]);

  const fetchQuestions = async (questionType, retries = 10, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post("http://localhost:8080/Quiz/GetDataQuestion", {
          quizId: AppContext_test.materiId,
          status: "Aktif",
          questionType: questionType,
        });
        if (response.data.length !== 0) {
          const filteredQuestions = response.data.filter(question =>
            question.TipeSoal === "Essay" || question.TipeSoal === "Praktikum"
          );

          setCurrentQuestions(filteredQuestions);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  };

  const fetchAnswers = async (questionType, karyawanId, retries = 10, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
      try {
        setIsLoading(true);
        const response = await axios.post("http://localhost:8080/Quiz/GetDataResultQuiz", {
          quizId: AppContext_test.materiId,
          idKaryawan: karyawanId,
          questionType: questionType,
        });
        if (response.data.length !== 0) {
          const filteredAnswer = response.data.filter(answer =>
            answer.Status === "Not Reviewed"
          );
          setIsLoading(false);
          setCurrentAnswers(filteredAnswer);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  };


  useEffect(() => {
    if (currentData.length > 0) {
      fetchQuestions(currentData[currentRespondentIndex].qui_tipe);
      fetchAnswers(currentData[currentRespondentIndex].qui_tipe, currentData[currentRespondentIndex].kry_id);
    }
  }, [currentRespondentIndex, currentData]);

  const handlePreviousRespondent = () => {
    setCurrentRespondentIndex(
      (currentRespondentIndex - 1 + currentData.length) % currentData.length
    );
  };

  const handleNextRespondent = () => {
    setCurrentRespondentIndex(
      (currentRespondentIndex + 1) % currentData.length
    );
  };

  const handleReview = (idSoal, isCorrect, karyawanId, quizId, transaksiId) => {
    const updatedRespondent = { ...currentData[currentRespondentIndex] };

    // Update reviewStatus object
    // setReviewStatus({
    //   ...reviewStatus,
    //   [idSoal]: true
    // });
    const updatedReviewStatus = [...reviewStatus];
    updatedReviewStatus[currentRespondentIndex][idSoal] = true;
    setReviewStatus(updatedReviewStatus);

    const updatedBadges = [...badges];
    updatedBadges[idSoal] = isCorrect ? 'success' : 'danger';
    setBadges(updatedBadges);

    const detail = {
      idSoal: idSoal,
      isCorrect: isCorrect,
      materiId: AppContext_test.materiId,
      idKaryawan: karyawanId,
      idQuiz: quizId,
      idTransaksi: transaksiId,
    };

    setFormDataReview([...formDataReview, detail]);

    setCurrentData(
      currentData.map((respondent, index) =>
        index === currentRespondentIndex ? updatedRespondent : respondent
      )
    );
  };
  // useEffect(() => {
  //   // console.log(formDataReview)
  // }, [formDataReview]);


  const handleAnswerChange = (questionIndex, value) => {
    const updatedRespondent = { ...currentData[currentRespondentIndex] };
    updatedRespondent.trq_jawaban_pengguna[questionIndex].Jawaban = value;
    setCurrentData(
      currentData.map((respondent, index) =>
        index === currentRespondentIndex ? updatedRespondent : respondent
      )
    );
  };

   const handleCancelReview = (idSoal) => {
      const updatedReviewStatus = [...reviewStatus];
      updatedReviewStatus[currentRespondentIndex] = Array(currentQuestions.length).fill(false);
      setReviewStatus(updatedReviewStatus);
      const index = formDataReview.findIndex(detail => detail.idSoal === idSoal);
      if (index !== -1) {
        formDataReview.splice(index, 1); 
      }

      badges[idSoal] = null;
    };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
    <div className="flex-fill">
        <Alert
        type="warning"
        message="Belum terdapat peserta yang mengerjakan test"
        />
        <div className="float my-4 mx-1">
        <LocalButton
          classType="outline-secondary me-2 px-4 py-2"
          label="Kembali"
          onClick={() => onChangePage("index")}
        />
    </div>
    </div>
    
    );
  }


  const currentRespondent = currentData[currentRespondentIndex];
  // console.log("cel ", currentData)
  const jawabanPenggunaStr = currentRespondent.trq_jawaban_pengguna;
  const jawabanPengguna = jawabanPenggunaStr
      .slice(1, -1)  
      .split('], [')  
      .map(item => item.replace(/[\[\]]/g, '').split(','));
  const validJawabanPengguna = jawabanPengguna.filter(item => item.length === 3);

  // Map the filtered array to the desired format
  const formattedAnswers = validJawabanPengguna.map(item => ({
    idSoal: item[1],
    namaFile: item[2]
  }));


  const downloadFile = async (namaFile) => {
    try {
      const response = await axios.get(`${API_LINK}Utilities/Upload/DownloadFile`, {
            params: {
              namaFile 
            },
            responseType: 'arraybuffer' 
          }); 

          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = namaFile;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (
    <div className="container mt-4">
      {/* {isLoading ? (
        <Loading />
      ) : ( */}
      <Card className="mb-4">
        <Card.Header className="bg-primary text-light d-flex align-items-center justify-content-between">
          <div className="header-left">
            <h3>{currentRespondent.qui_judul} - {currentRespondent.qui_tipe}</h3>
          </div>
          <div className="header-right" style={{ marginLeft: 'auto'}}>
            <select
              className="form-select me-4 mt-4 "
              value={currentRespondent.trq_created_by}
              onChange={(e) =>
                setCurrentRespondentIndex(
                  currentData.findIndex(
                    (respondent) => respondent.trq_created_by === e.target.value
                  )
                )
              }
              style={{ flex: '1' }}
            >
              {currentData.map((respondent, index) => (
                <option key={respondent.trq_id} value={respondent.trq_created_by}>
                  {respondent.trq_created_by}
                </option>
              ))}
            </select>
            <span className="text-light">
              <span className="ms-3">
                <i className="bi bi-caret-right-fill"></i>
              </span>
              <span className="ms-3">
                <i className="bi bi-three-dots"></i>
              </span>
            </span>
          </div>
          <div className="d-flex" style={{marginLeft:"30px"}}>
            <Button
              variant="outline-light"
              onClick={handlePreviousRespondent}
              disabled={currentRespondentIndex === 0}
            >
              <Icon name={"caret-left"} />
            </Button>
            <Button
              variant="outline-light"
              className="ms-2"
              onClick={handleNextRespondent}
              disabled={currentRespondentIndex === currentData.length - 1}
            >
              <Icon name={"caret-right"} />
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {currentQuestions.map((question, questionIndex) => {
            const matchedAnswer = formattedAnswers.find(answer => answer.idSoal === question.Key);
            return (
              <Card key={question.Key} className="mb-4">
                <Card.Header className="d-flex align-items-center">
                  <div className="d-flex flex-column align-items-start">
                    <div className="d-flex align-items-center mb-2">
                      <Badge bg="secondary" className="me-2">
                        {question.TipeSoal === "Essay" ? "Essay" : "Praktikum"}
                      </Badge>
                      {badges[question.Key] && 
                        <Badge bg={badges[question.Key]} className="me-2">
                          {badges[question.Key] === 'success' ? 'Benar' : 'Salah'}
                        </Badge>
                      }
                    </div>
                    
                    <div dangerouslySetInnerHTML={{ __html: question.Soal }} /> 
                    
                  </div>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Label>Jawaban:</Form.Label>
                    {question.TipeSoal === "Essay" ? (
                      <Form.Group controlId={`jawaban-${question.Key}`}>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={matchedAnswer ? matchedAnswer.namaFile : ""}
                          onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                          disabled={true}
                        />
                      </Form.Group>
                    ) : (
                      <Form.Group controlId={`file-${question.Key}`} className="">
                        <Button className="btn btn-primary" 
                          onClick={() => downloadFile(matchedAnswer ? matchedAnswer.namaFile : "Tidak ada file")}>
                          <i className="fi fi-rr-file-download me-2"></i>
                          {matchedAnswer ? matchedAnswer.namaFile : "Tidak ada file"}
                        </Button>
                      </Form.Group>
                    )}
                  </Form>
                </Card.Body>
                <Card.Footer className="text-end">
                {!reviewStatus[currentRespondentIndex][question.Key] ? (
                  <>
                    <Button
                      variant="success"
                      className="me-2"
                      onClick={() => handleReview(question.Key, true, currentRespondent.kry_id, currentRespondent.qui_id, currentRespondent.trq_id)}
                    >
                      Benar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReview(question.Key, false, currentRespondent.kry_id, currentRespondent.qui_id, currentRespondent.trq_id)}
                    >
                      Salah
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline-danger"
                    onClick={() => handleCancelReview(question.Key)}
                  >
                    Batal
                  </Button>
                )}
              </Card.Footer>
              </Card>
            );
          })}
        </Card.Body>
      </Card>
      {/* )} */}
    <div className="float my-4 mx-1">
      <LocalButton
        classType="outline-secondary me-2 px-4 py-2"
        label="Kembali"
        onClick={() => onChangePage("index")}
      />
      <LocalButton
        classType="primary ms-2 px-4 py-2"
        type="submit"
        label="Simpan"
        onClick={handleSaveReview}
      />
    </div>
    </div>
  );
}