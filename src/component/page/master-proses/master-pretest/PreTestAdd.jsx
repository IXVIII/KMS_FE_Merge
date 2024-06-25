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
import Swal from 'sweetalert2';
import { Editor } from '@tinymce/tinymce-react';
import AppContext_test from "../MasterContext";

export default function MasterPreTestAdd({ onChangePage }) {
  const [formContent, setFormContent] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [timer, setTimer] = useState('');
  const gambarInputRef = useRef(null);

  const handleChange = (name, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handlePointChange = (e, index) => {
    const { value } = e.target;

    // Update point pada formContent
    const updatedFormContent = [...formContent];
    updatedFormContent[index].point = value;
    setFormContent(updatedFormContent);

    // Update nilaiChoice pada formChoice
    setFormChoice((prevFormChoice) => ({
      ...prevFormChoice,
      nilaiChoice: value,
    }));
  };

  const addQuestion = (questionType) => {
    const newQuestion = {
      type: questionType,
      text: `Pertanyaan ${formContent.length + 1}`,
      options: [],
      point: 0,
      correctAnswer: "", // Default correctAnswer
    };
    setFormContent([...formContent, newQuestion]);
    setSelectedOptions([...selectedOptions, ""]);
  };
  const [formData, setFormData] = useState({
    materiId: AppContext_test.dataIDMateri,
    quizJudul: '',
    quizDeskripsi: '',
    quizTipe: 'Pretest',
    tanggalAwal: '',
    tanggalAkhir: '',
    timer: '',
    status: 'Aktif',
    createdby: 'Admin',
  });

  const [formQuestion, setFormQuestion] = useState({
    quizId: '',
    soal: '',
    tipeQuestion: 'Essay',
    gambar: null,
    questionDeskripsi: '',
    status: 'Aktif',
    quecreatedby: 'Admin',
  });

  formData.timer = timer;

  const [formChoice, setFormChoice] = useState({
    urutanChoice: '',
    isiChoice: '',
    questionId: '',
    nilaiChoice: '',
    quecreatedby: 'Admin',
  });

  const userSchema = object({
    quizJudul: string(),
  });

  const initialFormQuestion = {
    quizId: '',
    soal: '',
    tipeQuestion: 'Essay',
    gambar: null,
    questionDeskripsi: '',
    status: 'Aktif',
    quecreatedby: 'Admin',
  };

  const handleQuestionTypeChange = (e, index) => {
    const updatedFormContent = [...formContent];
    updatedFormContent[index].type = e.target.value;
    setFormContent(updatedFormContent);
  };

  const handleAddOption = (index) => {
    const updatedFormContent = [...formContent];
    if (updatedFormContent[index].type === "Pilgan") {
      updatedFormContent[index].options.push({ label: "", value: "", point: 0 });
      setFormContent(updatedFormContent);
    }
  };

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();

    // Check if all "Pilgan" type questions have more than one option
    for (let question of formContent) {
      if (question.type === 'Pilgan' && question.options.length < 2) {
          Swal.fire({
            title: 'Gagal!',
            text: 'Opsi pilihan ganda harus lebih dari satu',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
      }
    }
  
    // Hitung total point dari semua pertanyaan dan opsi
    const totalQuestionPoint = formContent.reduce((total, question) => total + parseInt(question.point), 0);
    const totalOptionPoint = formContent.reduce((total, question) => {
      if (question.type === 'Pilgan') {
        return total + question.options.reduce((optionTotal, option) => optionTotal + parseInt(option.point || 0), 0);
      }
      return total;
    }, 0);
    
    // Total point dari semua pertanyaan dan opsi harus berjumlah 100, tidak kurang dan tidak lebih
    if (totalQuestionPoint + totalOptionPoint !== 100) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Total skor harus berjumlah 100',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    try {
      formData.timer = convertTimeToSeconds(timer)
  console.log(formData)
      const response = await axios.post(API_LINK + 'Quiz/SaveDataQuiz', formData);
      if (response.data.length === 0) {
        Swal.fire({
          title: 'Gagal!',
          text: 'Data yang dimasukkan tidak valid atau kurang',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }
  
      const quizId = response.data[0].hasil;
  
      for (let i = 0; i < formContent.length; i++) {
        const question = formContent[i];
        const formQuestion = {
          quizId: quizId,
          soal: question.text,
          tipeQuestion: question.type,
          gambar: question.gambar,
          questionDeskripsi: '',
          status: 'Aktif',
          quecreatedby: 'Admin',
        };
        if (question.type === 'Essay' || question.type === 'Praktikum') {
          if (question.selectedFile) {
            try {
              const uploadResult = await uploadFile(question.selectedFile);
              console.log("Image Upload Response:", JSON.stringify(uploadResult.newFileName));
              formQuestion.gambar = uploadResult.newFileName;
            } catch (uploadError) {
              console.error('Gagal mengunggah gambar:', uploadError);
              alert('Gagal mengunggah gambar untuk pertanyaan: ' + question.text);
              return;
            }
          } else {
            // Jika tidak ada file yang dipilih, atur question.gambar menjadi null
            formQuestion.gambar = null;
          }
        } else if (question.type === 'Pilgan') {
          formQuestion.gambar = '';
        }
  
        console.log("hasil questionn")
        console.log(formQuestion);
  
        try {
          const questionResponse = await axios.post(API_LINK + 'Questions/SaveDataQuestion', formQuestion);
          console.log('Pertanyaan berhasil disimpan:', questionResponse.data);
  
          if (questionResponse.data.length === 0) {
            Swal.fire({
              title: 'Gagal!',
              text: 'Data yang dimasukkan tidak valid atau kurang',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            return
          }
  
          const questionId = questionResponse.data[0].hasil;
  
          if (question.type === 'Essay' || question.type === 'Praktikum') {
            const answerData = {
              urutanChoice: '',
              answerText: question.correctAnswer, // Pastikan menggunakan correctAnswer dari question
              questionId: questionId,
              nilaiChoice: question.point,
              quecreatedby: 'Admin',
            };
  
            try {
              const answerResponse = await axios.post(API_LINK + 'Choices/SaveDataChoice', answerData);
              console.log('Jawaban Essay berhasil disimpan:', answerResponse.data);
            } catch (error) {
              console.error('Gagal menyimpan jawaban Essay:', error);
              Swal.fire({
                title: 'Gagal!',
                text: 'Data yang dimasukkan tidak valid atau kurang',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
          } else if (question.type === 'Pilgan') {
            for (const [optionIndex, option] of question.options.entries()) {
              const answerData = {
                urutanChoice: optionIndex + 1,
                answerText: option.label,
                questionId: questionId,
                nilaiChoice: option.point || 0,
                quecreatedby: 'Admin',
              };
  
              console.log("hasil multiple choice")
              console.log(answerData);
  
              try {
                const answerResponse = await axios.post(API_LINK + 'Choices/SaveDataChoice', answerData);
                console.log('Jawaban multiple choice berhasil disimpan:', answerResponse.data);
              } catch (error) {
                console.error('Gagal menyimpan jawaban multiple choice:', error);
                Swal.fire({
                  title: 'Gagal!',
                  text: 'Data yang dimasukkan tidak valid atau kurang',
                  icon: 'error',
                  confirmButtonText: 'OK'
                });
              }
            }
          }
        } catch (error) {
          console.error('Gagal menyimpan pertanyaan:', error);
          Swal.fire({
            title: 'Gagal!',
            text: 'Data yang dimasukkan tidak valid atau kurang',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
  
      // Tampilkan pesan sukses atau lakukan tindakan lain yang diperlukan setelah semua data berhasil disimpan
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pretest berhasil ditambahkan',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          setFormContent([]);
          setSelectedOptions([]);
          setErrors({});
          setSelectedFile(null);
          setTimer('');
          setIsButtonDisabled(true);
        }
      });
  
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan data.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  // const handleQuestionTypeChange = (e, index) => {
  //   const { value } = e.target;
  //   const updatedFormContent = [...formContent];
  //   updatedFormContent[index] = {
  //     ...updatedFormContent[index],
  //     type: value,
  //     options: value === "Essay" ? [] : updatedFormContent[index].options,
  //   };
  //   setFormContent(updatedFormContent);

  //   // Pastikan tipeQuestion diperbarui dengan benar di formQuestion
  //   updateFormQuestion('tipeQuestion', value);
  // };

  const handleQuestionTextChange = (e, index) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    updatedFormContent[index].text = value;
    setFormContent(updatedFormContent);
  };

  const handleOptionLabelChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options[optionIndex].label = value;
    setFormContent(updatedFormContent);
  };

  const handleOptionChange = (e, index) => {
    const { value } = e.target;

    // Update correctAnswer pada formContent
    const updatedFormContent = [...formContent];
    updatedFormContent[index].correctAnswer = value;
    setFormContent(updatedFormContent);

    // Update selectedOptions untuk radio button yang dipilih
    const updatedSelectedOptions = [...selectedOptions];
    updatedSelectedOptions[index] = value;
    setSelectedOptions(updatedSelectedOptions);
  };

  // const handleAddOption = (index) => {
  //   const updatedFormContent = [...formContent];
  //   if (updatedFormContent[index].type === "Pilgan") {
  //     updatedFormContent[index].options.push({ label: "", value: "" });
  //     setFormContent(updatedFormContent);
  //   }
  // };

  const handleChangeQuestion = (index) => {
  const updatedFormContent = [...formContent];
  const question = updatedFormContent[index];

  if (question.type === "Essay") {
    // Simpan jawaban benar untuk pertanyaan Essay ke state
    setCorrectAnswers((prevCorrectAnswers) => ({
      ...prevCorrectAnswers,
      [index]: question.correctAnswer,
    }));
  }

    const newType =
      question.type !== "answer"
        ? question.options.length > 0
          ? "answer"
          : "answer"
        : question.options.length > 0
          ? "Pilgan"
          : "Pilgan";

  updatedFormContent[index] = {
    ...question,
    type: newType,
    options: newType === "Essay" ? [] : question.options,
  };

  setFormContent(updatedFormContent);
  console.log(updatedFormContent)
};

  const handleDuplicateQuestion = (index) => {
    const duplicatedQuestion = { ...formContent[index] };
    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent.splice(index + 1, 0, duplicatedQuestion);
      return updatedFormContent;
    });
    setSelectedOptions((prevSelectedOptions) => {
      const updatedSelectedOptions = [...prevSelectedOptions];
      updatedSelectedOptions.splice(index + 1, 0, selectedOptions[index]);
      return updatedSelectedOptions;
    });
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options.splice(optionIndex, 1);
    setFormContent(updatedFormContent);
  };

  const handleDeleteQuestion = (index) => {
    const updatedFormContent = [...formContent];
    updatedFormContent.splice(index, 1);
    setFormContent(updatedFormContent);
    const updatedSelectedOptions = [...selectedOptions];
    updatedSelectedOptions.splice(index, 1);
    setSelectedOptions(updatedSelectedOptions);
    // Hapus correctAnswer dari state saat pertanyaan dihapus
    const updatedCorrectAnswers = { ...correctAnswers };
    delete updatedCorrectAnswers[index];
    setCorrectAnswers(updatedCorrectAnswers);
  };

  const parseExcelData = (data) => {
    const questions = data.map((row, index) => {
      // Skip header row (index 0) and the row below it (index 1)
      if (index < 2) return null;

      const options = row[3] ? row[3].split(',') : [];
      const points = typeof row[4] === 'string' ? row[4].split(',') : [];
      
      return {
        text: row[1],
        type: row[2].toLowerCase() === 'essay' ? 'Essay' : (row[2].toLowerCase() === 'praktikum' ? 'Praktikum' : 'Pilgan'),
        options: options.map((option, idx) => ({ label: option, value: String.fromCharCode(65 + idx), point: points[idx] ? points[idx].trim() : null })),
        point: row[5],
       
      };
    }).filter(Boolean); // Filter out null values

    const initialSelectedOptions = questions.map((question, index) => {
      if (question.type === 'Pilgan') {
        // Temukan indeks jawaban benar di dalam options
        const correctIndex = question.options.findIndex((option) => option.value === question.correctAnswer);

        if (correctIndex !== -1) {
          // Jika jawaban benar ditemukan, pilih radio button tersebut
          return question.options[correctIndex].value;
        } else {
          // Jika jawaban benar tidak ditemukan, tetapkan nilai kosong
          return "";
        }
      } else {
        // Tidak ada pilihan awal untuk pertanyaan Essay
        return "";
      }
    });

    setSelectedOptions(initialSelectedOptions);
    setFormContent(questions);
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    const updatedFormContent = [...formContent];
    updatedFormContent[index].selectedFile = file;
  
    // Buat objek FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        // Perbarui ukuran gambar dalam state
        updatedFormContent[index].imageWidth = image.width;
        updatedFormContent[index].imageHeight = image.height;
        setFormContent(updatedFormContent);
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileExcel = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUploadFile = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        parseExcelData(parsedData);
      };
      reader.readAsBinaryString(selectedFile);
      Swal.fire({
        title: 'Berhasil!',
        text: 'File Excel berhasil ditambahkan',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      alert("Pilih file Excel terlebih dahulu!");
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template.xlsx'; // Path to your template file in the public directory
    link.download = 'template.xlsx';
    link.click();
  };

  const convertTimeToSeconds = (time) => {
    // Pastikan nilai time dalam bentuk string dengan format "HH:MM"
    const timeString = typeof time === 'string' ? time.trim() : time.toLocaleTimeString();

    // Pisahkan string waktu menjadi jam dan menit
    const timeParts = timeString.split(':');

    // Periksa apakah ada 2 bagian (jam dan menit) setelah pemisahan
    if (timeParts.length !== 2) {
      console.error('Invalid time format:', timeString);
      return NaN;
    }

    // Ambil jam dan menit dari hasil pemisahan
    const [hours, minutes] = timeParts.map(Number);

    // Periksa apakah jam dan menit valid (tidak menghasilkan NaN)
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time format:', timeString);
      return NaN;
    }

    // Kembalikan total detik dari waktu yang diberikan
    return hours * 3600 + minutes * 60;
  };

  const updateFormQuestion = (name, value) => {
    setFormQuestion((prevFormQuestion) => ({
      ...prevFormQuestion,
      [name]: value,
    }));
  };

  const handleTimerChange = (e) => {
    const { value } = e.target;
    setTimer(value);
    console.log(convertTimeToSeconds(timer))

  };

  const handleOptionPointChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    
    console.log("point changes")
    console.log(value);
    // Clone the formContent state
    const updatedFormContent = [...formContent];

    // Update the specific option's point value
    updatedFormContent[questionIndex].options[optionIndex].point = parseInt(value);

    // Update the formContent state
    setFormContent(updatedFormContent);
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <style>
        {`
          .form-check input[type="radio"] {
            transform: scale(1.5);
            border-color: #000;
          }
          .file-name {
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            max-width: 100%;
          }
          .option-input {
            background: transparent;
            border: none;
            outline: none;
            border-bottom: 1px solid #000;
            margin-left: 20px;
          }
          .form-check {
            margin-bottom: 8px;
          }
          .question-input {
            margin-bottom: 12px;
          }
          .file-upload-label {
            font-size: 14px; /* Sesuaikan ukuran teks label */
          }
          .file-ket-label {
            font-size: 10px; /* Sesuaikan ukuran teks label */
          }
        `}
      </style>
      <form id="myForm" onSubmit={handleAdd}>
        <div>
          <Stepper
            steps={[
              { label: 'Materi', onClick: () => onChangePage("courseAdd") },
              { label: 'Pretest', onClick: () => onChangePage("pretestAdd") },
              { label: 'Sharing Expert', onClick: () => onChangePage("sharingAdd") },
              { label: 'Forum', onClick: () => onChangePage("forumAdd") },
              { label: 'Post Test', onClick: () => onChangePage("posttestAdd") }
            ]}
            activeStep={1}
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
        <div className="card">
          <div className="card-header bg-outline-primary fw-medium text-black">
            Tambah Pretest Baru
          </div>
          <div className="card-body p-4">
            <div className="row mb-4">

              <div className="col-lg">
                <Input
                  type="text"
                  label="Deskripsi"
                  forInput="quizDeskripsi"
                  value={formData.quizDeskripsi}
                  onChange={handleInputChange}
                  isRequired={true}
                />
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-lg-4">
                <Input
                  type="time"
                  name="timer"
                  label="Durasi (dalam menit)"
                  forInput="timerInput"
                  value={timer}
                  onChange={handleTimerChange}
                  isRequired={true}
                // stepSize="60"
                />
              </div>
              <div className="col-lg-4">
                <Input
                  label="Tanggal Dimulai:"
                  type="date"
                  value={formData.tanggalAwal}
                  onChange={(e) => handleChange('tanggalAwal', e.target.value)}
                  isRequired={true}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  label="Tanggal Berakhir:"
                  type="date"
                  value={formData.tanggalAkhir}
                  onChange={(e) => handleChange('tanggalAkhir', e.target.value)}
                  isRequired={true}
                />
              </div>
            </div>
            <div className="row mb-4">
              <div className="mb-2">
              </div>
              <div className="col-lg-4">
                <Button
                  title="Tambah Pertanyaan"
                  onClick={() => addQuestion("Essay")}
                  iconName="plus"
                  classType="primary btn-sm px-3 py-1"
                />
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={handleFileExcel }
                />
                <Button
                  title="Tambah File Excel"
                  iconName="upload"
                  classType="primary btn-sm mx-2 px-3 py-1"
                  onClick={() => document.getElementById('fileInput').click()} // Memicu klik pada input file
                />
                {/* Tampilkan nama file yang dipilih */}
                {selectedFile && <span>{selectedFile.name}</span>}
                <br></br>
                <br></br>
                <Button
                  title="Unggah File Excel"
                  iconName="paper-plane"
                  classType="primary btn-sm px-3 py-1"
                  onClick={handleUploadFile}
                  label="Unggah File"
                />

                <Button
                  iconName="download"
                  label="Unduh Template"
                  classType="warning btn-sm px-3 py-1 mx-2"
                  onClick={handleDownloadTemplate}
                  title="Unduh Template Excel"
                />

              </div>

            </div>
            {formContent.map((question, index) => (
              <div key={index} className="card mb-4">
                <div className="card-header bg-white fw-medium text-black d-flex justify-content-between align-items-center">
                  <span>Pertanyaan</span>
                  <span>
                    Skor: {
                      question.type === 'Pilgan' 
                        ? (question.options || []).reduce((acc, option) => acc + parseInt(option.point), 0)
                        : parseInt(question.point)
                    }
                  </span>

                  <div className="col-lg-2">
                    <select className="form-select" aria-label="Default select example"
                      value={question.type}
                      onChange={(e) => handleQuestionTypeChange(e, index)}>
                      <option value="Essay">Essay</option>
                      <option value="Pilgan">Pilihan Ganda</option>
                      <option value="Praktikum">Praktikum</option>
                    </select>
                  </div>
                </div>
                <div className="card-body p-4">
                  {question.type === "answer" ? (
                    <div className="row">
                      <div className="col-lg-12 question-input">
                        <Input
                          type="text"
                          label={`Question ${index + 1}`}
                          forInput={`questionText-${index}`}
                          value={question.text}
                          onChange={(e) => {
                            const updatedFormContent = [...formContent];
                            updatedFormContent[index].text = e.target.value;
                            setFormContent(updatedFormContent);
                            // Update formQuestion with the new question text
                            updateFormQuestion('soal', e.target.value);
                          }}
                          isRequired={true}
                        />
                      </div>

                      <div className="col-lg-12">
                        <div className="form-check">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} >
                              <input
                                type="radio"
                                id={`option_${index}_${optionIndex}`}
                                name={`option_${index}`}
                                value={option.value}
                                // Checked hanya jika value di selectedOptions sama dengan value dari option
                                checked={selectedOptions[index] === option.value}
                                onChange={(e) => handleOptionChange(e, index)}
                                style={{ marginRight: '5px' }}
                              />
                              <label htmlFor={`option_${index}_${optionIndex}`}>{option.label}</label>
                            </div>
                          ))}
                        </div>

                        <Input
                          type="number"
                          label="Point"
                          value={question.point}
                          onChange={(e) => handlePointChange(e, index)}
                        />
                        <Button
                          classType="primary btn-sm ms-2 px-3 py-1"
                          label="Done"
                          onClick={() => handleChangeQuestion(index)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-lg-12 question-input">
                      <label htmlFor="deskripsiMateri" className="form-label fw-bold">
                      Pertanyaan <span style={{color:"Red"}}> *</span>
                      </label>
                        {/* <textarea
                          id={`pertanyaan_${index}`}
                          value={question.text}
                          label="Pertanyaan"
                          onChange={(e) => {
                            const updatedFormContent = [...formContent];
                            updatedFormContent[index].text = e.target.value;
                            setFormContent(updatedFormContent);

                            // Update formQuestion.soal
                            setFormQuestion((prevFormQuestion) => ({
                              ...prevFormQuestion,
                              soal: e.target.value
                            }));
                          }}
                          className="form-control" // Optional: Add any necessary CSS classes
                          rows={4} // Optional: Adjust the number of rows for the textarea
                        /> */}
                        {/* <Editor
                          id={`pertanyaan_${index}`}
                          value={question.text}
                          label="Pertanyaan"
                          onChange={(e) => {
                            const updatedFormContent = [...formContent];
                            updatedFormContent[index].text = e.target.value;
                            setFormContent(updatedFormContent);

                            // Update formQuestion.soal
                            setFormQuestion((prevFormQuestion) => ({
                              ...prevFormQuestion,
                              soal: e.target.value
                            }));
                          }}
                          apiKey='la2hd1ehvumeir6fa5kxxltae8u2whzvx1jptw6dqm4dgf2g'
                          init={{
                            height: 300,
                            menubar: false,
                            plugins: [
                              'advlist autolink lists link image charmap print preview anchor',
                              'searchreplace visualblocks code fullscreen',
                              'insertdatetime media table paste code help wordcount'
                            ],
                            toolbar:
                              'undo redo | formatselect | bold italic backcolor | \
                              alignleft aligncenter alignright alignjustify | \
                              bullist numlist outdent indent | removeformat | help'
                          }}
                        /> */}
                        <Editor
                        id={`pertanyaan_${index}`}
                        value={question.text}
                        onEditorChange={(content) => {
                          const updatedFormContent = [...formContent];
                          updatedFormContent[index].text = content;
                          setFormContent(updatedFormContent);

                          // Update formQuestion.soal
                          setFormQuestion((prevFormQuestion) => ({
                            ...prevFormQuestion,
                            soal: content,
                          }));
                        }}
                        apiKey="la2hd1ehvumeir6fa5kxxltae8u2whzvx1jptw6dqm4dgf2g"
                        init={{
                          height: 300,
                          menubar: false,
                          plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount',
                          ],
                          toolbar:
                            'undo redo | formatselect | bold italic backcolor | ' +
                            'alignleft aligncenter alignright alignjustify | ' +
                            'bullist numlist outdent indent | removeformat | help',
                        }}
                      />
                      </div>

                      {/* Tampilkan tombol gambar dan PDF hanya jika type = Essay */}
                      {(question.type === "Essay" || question.type === "Praktikum") && (
                        
                        <div className="d-flex flex-column w-100">
                          <FileUpload
                            forInput={`fileInput_${index}`}
                            formatFile=".jpg,.png"
                            label={<span className="file-upload-label">Gambar (.jpg, .png)</span>}
                            onChange={(e) => handleFileChange(e, index)} // Memanggil handleFileChange dengan indeks
                            hasExisting={question.gambar}
                            style={{ fontSize: '12px' }}
                          />
                          {/* Tampilkan preview gambar jika ada gambar yang dipilih */}
                          {question.selectedFile && (
                            <div style={{
                              maxWidth: '300px', // Set maximum width for the image container
                              maxHeight: '300px', // Set maximum height for the image container
                              overflow: 'hidden', // Hide any overflow beyond the set dimensions
                              marginLeft: '10px'
                            }}>
                              <img
                                src={URL.createObjectURL(question.selectedFile)}
                                alt="Preview Gambar"
                                style={{
                                  width: '100%', // Ensure image occupies full width of container
                                  height: 'auto', // Maintain aspect ratio
                                  objectFit: 'contain' // Fit image within container without distortion
                                }}
                              />
                            </div>
                          )}
                          <div className="mt-2"> {/* Memberikan margin atas kecil untuk jarak yang rapi */}
                            <Input
                              type="number"
                              label="Skor"
                              value={question.point}
                              onChange={(e) => handlePointChange(e, index)}
                              isRequired={true}
                            />
                          </div>
                        </div>
                        
                      )}
                      {question.type === "Pilgan" && (
                        <div className="col-lg-12">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="form-check" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                              <input
                                type="radio"
                                id={`option_${index}_${optionIndex}`}
                                name={`option_${index}`}
                                value={option.value}
                                checked={selectedOptions[index] === option.value}
                                onChange={(e) => handleOptionChange(e, index)}
                                style={{ marginRight: '10px' }}
                              />
                              <input
                                type="text"
                                value={option.label}
                                onChange={(e) => handleOptionLabelChange(e, index, optionIndex)}
                                className="option-input"
                                readOnly={question.type === "answer"}
                                style={{ marginRight: '10px' }}
                              />
                              <Button
                                iconName="delete"
                                classType="btn-sm ms-2 px-2 py-0"
                                onClick={() => handleDeleteOption(index, optionIndex)}
                                style={{ marginRight: '10px' }}
                              />
                              <input
                                type="number"
                                id={`optionPoint_${index}_${optionIndex}`}
                                value={option.point}
                                className="btn-sm ms-2 px-2 py-0"
                                onChange={(e) => handleOptionPointChange(e, index, optionIndex)}
                                style={{ width: '50px' }}
                              />
                            </div>
                          ))}
                          <Button
                            onClick={() => handleAddOption(index)}
                            iconName="add"
                            classType="success btn-sm ms-2 px-3 py-1"
                            label="Opsi Baru"
                          />
                        </div>
                      )}
                      <div className="d-flex justify-content-between my-2 mx-1">
                        <div>

                        </div>
                        <div>
                          <Button
                            iconName="trash"
                            classType="btn-sm ms-2 px-3 py-1"
                            onClick={() => handleDeleteQuestion(index)}
                          />
                          <Button
                            iconName="duplicate"
                            classType="btn-sm ms-2 px-3 py-1"
                            onClick={() => handleDuplicateQuestion(index)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("materiAdd")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
            disabled={isButtonDisabled}
          />
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("sharingAdd")}
          />
        </div>
      </form>
    </>
  );
}