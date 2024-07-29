import React, { useRef, useState, useEffect } from "react";
import Button from "../../../part/Button";
import { object, string } from "yup";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import * as XLSX from 'xlsx';
import axios from 'axios';
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import { API_LINK } from "../../../util/Constants";
import FileUpload from "../../../part/FileUpload";
import uploadFile from "../../../util/UploadImageQuiz";
import { Editor } from '@tinymce/tinymce-react';
import Swal from 'sweetalert2';
import AppContext_test from "../../master-test/TestContext";
import Alert from "../../../part/Alert";
import { Stepper, Step, StepLabel } from '@mui/material';

const steps = ['Materi', 'Pretest', 'Sharing Expert', 'Forum', 'Post Test'];

function getStepContent(stepIndex) {
    switch (stepIndex) {
        case 0:
            return 'materiAdd';
        case 1:
            return 'pretestAdd';
        case 2:
            return 'sharingAdd';
        case 3:
            return 'forumAdd';
        case 4:
            return 'posttestAdd';
        default:
            return 'Unknown stepIndex';
    }
}
export default function MasterPreTestEdit({ onChangePage, withID }) {
    const [formContent, setFormContent] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [isError, setIsError] = useState({ error: false, message: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [timer, setTimer] = useState('');
    const [minimumScore, setMinimumScore] = useState();
    const gambarInputRef = useRef(null);

    const [formData, setFormData] = useState({
        quizId: '',
        materiId: '',
        quizJudul: '',
        quizDeskripsi: '',
        quizTipe: 'Pretest',
        tanggalAwal: '',
        tanggalAkhir: '',
        timer: '',
        status: 'Aktif',
        modifby: 'Admin',
    });

    // const [formQuestion, setFormQuestion] = useState({
    //     quizId: '',
    //     soal: '',
    //     tipeQuestion: 'Essay',
    //     gambar: '',
    //     questionDeskripsi: '',
    //     status: 'Aktif',
    //     quemodifby: 'Admin',
    // });

    formData.timer = timer;

    const [formChoice, setFormChoice] = useState({
        urutanChoice: '',
        isiChoice: '',
        questionId: '',
        nilaiChoice: '',
        quemodifby: 'Admin',
    });

    const userSchema = object({
        quizId: string(),
        materiId: string(),
        quizJudul: string(),
        quizDeskripsi: string().required('Quiz deskripsi harus diisi'),
        quizTipe: string(),
        tanggalAwal: string().required('Tanggal awal harus diisi'),
        tanggalAkhir: string().required('Tanggal akhir harus diisi'),
        timer: string().required('Durasi harus diisi'),
        status: string(),
        createdby: string(),
    });

    const initialFormQuestion = {
        quizId: '',
        soal: '',
        tipeQuestion: 'Essay',
        gambar: '',
        questionDeskripsi: '',
        status: 'Aktif',
        quemodifby: 'Admin',
    };

    /* ----- Handle Function Start ---- */

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

        console.log(formContent)
    };

    const handleOptionPointChange = (e, questionIndex, optionIndex) => {
        const { value } = e.target;

        // Parse value to integer
        const pointValue = parseInt(value, 10) || 0;

        // Create a copy of formContent
        const updatedFormContent = formContent.map((question, qIndex) => {
            if (qIndex === questionIndex) {
                // Update the specific option's point value
                const updatedOptions = question.options.map((option, oIndex) => {
                    if (oIndex === optionIndex) {
                        return {
                            ...option,
                            point: pointValue
                        };
                    }
                    return option;
                });

                // Calculate total points for the question
                const totalPoints = updatedOptions.reduce((acc, opt) => acc + opt.point, 0);

                // Return updated question with updated options and total points
                return {
                    ...question,
                    options: updatedOptions,
                    point: totalPoints
                };
            }
            return question;
        });

        // Update formContent state
        setFormContent(updatedFormContent);
    };


    const addQuestion = (questionType) => {
        const newQuestion = {
            type: questionType,
            text: `Question ${formContent.length + 1}`,
            options: [],
            point: 0,
            correctAnswer: "", // Default correctAnswer
        };
        setFormContent([...formContent, newQuestion]);
        setSelectedOptions([...selectedOptions, ""]);
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

    const isStartDateBeforeEndDate = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return start <= end;
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        formData.timer = convertTimeToSeconds(timer);

        const validationErrors = await validateAllInputs(
            formData,
            userSchema,
            setErrors
        );
        console.log('tes', validationErrors)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            Swal.fire({
                title: 'Gagal!',
                text: 'Pastikan semua data terisi dengan benar!.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!isStartDateBeforeEndDate(formData.tanggalAwal, formData.tanggalAkhir)) {
            Swal.fire({
                title: 'Error!',
                text: 'Tanggal awal tidak boleh lebih dari tanggal akhir.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

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

        const totalQuestionPoint = formContent.reduce((total, question) => {
            if (question.type !== 'Pilgan') {
                total = total + parseInt(question.point)
            }
            return total;
        }, 0);

        const totalOptionPoint = formContent.reduce((total, question) => {
            if (question.type === 'Pilgan') {
                return total + question.options.reduce((optionTotal, option) => optionTotal + parseInt(option.point || 0), 0);
            }
            return total;
        }, 0);

        if (totalQuestionPoint + totalOptionPoint !== 100) {

            setResetStepper((prev) => !prev + 1);
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
            const response = await axios.post(API_LINK + 'Quiz/UpdateDataQuiz', formData);
            console.log("api 1 = ", response)
            if (response.data.length === 0) {
                alert('Gagal menyimpan data');
                return;
            }

            const quizId = response.data[0].hasil;
            for (let i = 0; i < formContent.length; i++) {
                const question = formContent[i];
                const formQuestion = {
                    questionId: question.key,
                    quizId: quizId,
                    soal: question.text,
                    tipeQuestion: question.type,
                    gambar: question.selectedFile,
                    questionDeskripsi: '',
                    status: 'Aktif',
                    quemodifby: 'Admin',
                };
                if (question.type === 'Essay' || question.type === 'Praktikum') {
                    if (question.selectedFile) {
                        try {
                            const uploadResult = await uploadFile(question.selectedFile);
                            console.log("Image Upload Response:", JSON.stringify(uploadResult.newFileName));
                            formQuestion.gambar = uploadResult.newFileName;
                        } catch (uploadError) {
                            console.error('Gagal mengunggah gambar:', uploadError);
                            Swal.fire({
                                title: 'Gagal!',
                                text: 'Gagal untuk mengunggah gambar',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                            return;
                        }
                    } else {
                        formQuestion.gambar = '';
                    }
                } else if (question.type === 'Pilgan') {
                    formQuestion.gambar = '';
                }
                // console.log("hasil questionn")
                // console.log(formQuestion);

                try {
                    console.log("ini soal", formQuestion)
                    const questionResponse = await axios.post(API_LINK + 'Questions/UpdateDataQuestion', formQuestion);
                    //   console.log('Pertanyaan berhasil disimpan:', questionResponse.data);

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
                    console.log("ques id : " + questionId)
                    if (question.type === 'Essay' || question.type === 'Praktikum') {
                        const answerData = {
                            urutanChoice: '1', // Pastikan menggunakan correctAnswer dari question
                            questionId: questionId,
                            nilaiChoice: question.point,
                            quemodifby: 'Admin',
                            type: 'Essay'
                        };

                        try {
                            const answerResponse = await axios.post(API_LINK + 'Choices/UpdateDataChoice', answerData);
                            //   console.log('Jawaban essay berhasil disimpan:', answerResponse.data);
                        } catch (error) {
                            console.error('Gagal menyimpan jawaban essay:', error);
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
                                quemodifby: 'Admin',
                            };

                            //   console.log("hasil multiple choice")
                            //   console.log(answerData);

                            try {
                                console.log(answerData)
                                const answerResponse = await axios.post(API_LINK + 'Choices/UpdateDataChoice', answerData);
                                // console.log('Jawaban multiple choice berhasil disimpan:', answerResponse.data);
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
                    onChangePage("materiEdit");
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
            return {
                text: row[1],
                type: row[2].toLowerCase() === 'Essay' ? 'Essay' : 'Pilgan',
                options: options.map((option, idx) => ({ label: option, value: String.fromCharCode(65 + idx) })),
                point: row[4],
                correctAnswer: row[5],
            };
        }).filter(Boolean); // Filter out null values

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
                // Tidak ada pilihan awal untuk pertanyaan essay
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
        setFormContent(updatedFormContent);
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


    const handleTimerChange = (e) => {
        const { value } = e.target;
        setTimer(value);
        // console.log(convertTimeToSeconds(timer))

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
    const Materi = AppContext_test.DetailMateriEdit;
    const hasTest = Materi.Pretest !== null && Materi.Pretest !== "";

    const getDataQuiz = async () => {
        setIsLoading(true);
        try {
            while (true) {
                const data = await axios.post(API_LINK + 'Quiz/GetQuizByID', {
                    id: AppContext_test.DetailMateriEdit?.Key, tipe: "Pretest"
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

    const getDataQuestion = async () => {
        setIsLoading(true);

        try {
            while (true) {
                const { data } = await axios.post(API_LINK + 'Quiz/GetDataQuestion', {
                    id: formData.materiId, status: 'Aktif', tipe: 'Pretest'
                });
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
    }, [withID]);

    useEffect(() => {
        if (formData.quizId) getDataQuestion();
    }, [formData.quizId]);

    const convertTimeToSeconds = () => {
        return parseInt(hours) * 3600 + parseInt(minutes) * 60;
    };

    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');

    const handleHoursChange = (e) => {
        setHours(e.target.value);
    };

    const handleMinutesChange = (e) => {
        setMinutes(e.target.value);
    };

    const convertSecondsToTimeFormat = (seconds) => {
        const formatHours = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const formatMinutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');

        setHours(formatHours);
        setMinutes(formatMinutes);
        return `${formatHours}:${formatMinutes}`;
    };

    const [activeStep, setActiveStep] = useState(1);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
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
                    <Stepper activeStep={activeStep}>
                        {steps.map((label, index) => (
                            <Step key={label} onClick={() => onChangePage(getStepContent(index))}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <div>
                        {activeStep === steps.length ? (
                            <div>
                                <Button onClick={handleReset}>Reset</Button>
                            </div>
                        ) : (
                            <div>
                                <Button disabled={activeStep === 0} onClick={handleBack}>
                                    Back
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleNext}>
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card">
                    <div className="card-header bg-outline-primary fw-medium text-black">
                        Edit Pretest
                    </div>
                    <div className="card-body p-4">
                        {hasTest ? (
                            <div>
                                <div className="row mb-4">
                                    <div className="col-lg">
                                        <Input
                                            type="text"
                                            label="Deskripsi Quiz"
                                            forInput="quizDeskripsi"
                                            value={formData.quizDeskripsi}
                                            onChange={handleInputChange}
                                            isRequired={true}
                                        />
                                    </div>
                                </div>
                                <div className="row mb-4">
                                    <div className="col-lg-4">
                                        <label htmlFor="waktuInput" className="form-label">
                                            <span style={{ fontWeight: 'bold' }}>Durasi:</span>
                                            <span style={{ color: 'red' }}> *</span>
                                        </label>

                                        <div className="d-flex align-items-center">
                                            <div className="d-flex align-items-center me-3">
                                                <select
                                                    className="form-select me-2"
                                                    name="hours"
                                                    value={hours}
                                                    onChange={handleHoursChange}
                                                >
                                                    {[...Array(24)].map((_, i) => (
                                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                                            {i.toString().padStart(2, '0')}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span>Jam</span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <select
                                                    className="form-select me-2"
                                                    name="minutes"
                                                    value={minutes}
                                                    onChange={handleMinutesChange}
                                                >
                                                    {[...Array(60)].map((_, i) => (
                                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                                            {i.toString().padStart(2, '0')}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span>Menit</span>
                                            </div>
                                        </div>
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
                                </div>
                                {formContent.map((question, index) => (
                                    <div key={index} className="card mb-4">
                                        <div className="card-header bg-white fw-medium text-black d-flex justify-content-between align-items-center">
                                            <span>Pertanyaan</span>
                                            <span>
                                                Skor: {(question.type === 'Essay' || question.type === 'Praktikum' ?
                                                    parseInt(question.point) : 0) + (question.type === 'Pilgan' ? (question.options || []).reduce((acc, option) => acc + parseInt(option.point), 0) : 0)}
                                            </span>                                    <div className="col-lg-2">
                                                <select className="form-select" aria-label="Default select example"
                                                    value={question.type}
                                                    onChange={(e) => handleQuestionTypeChange(e, index)}
                                                    disabled>
                                                    <option value="Essay">Essay</option>
                                                    <option value="Pilgan">Pilihan Ganda</option>
                                                    <option value="Praktikum">Praktikum</option>
                                                </select>
                                            </div>

                                        </div>
                                        <div className="card-body p-4">

                                            <div className="row">
                                                <div className="col-lg-12 question-input">

                                                    <label htmlFor="deskripsiMateri" className="form-label fw-bold">
                                                        Pertanyaan <span style={{ color: "Red" }}> *</span>
                                                    </label>
                                                    <Editor
                                                        forInput={'pertanyaan_${index}'}
                                                        value={question.text}
                                                        onEditorChange={(content) => {
                                                            const updatedFormContent = [...formContent];
                                                            updatedFormContent[index].text = content;
                                                            setFormContent(updatedFormContent);
                                                        }}
                                                        apiKey="ci4fa00c13rk9erot37prff8jjekb93mdcwji9rtr2envzvi"
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

                                                {/* Tampilkan tombol gambar dan PDF hanya jika type = essay */}
                                                {(question.type === "Essay" || question.type === "Praktikum") && (
                                                    <div className="col-lg-12 d-flex align-items-center form-check">
                                                        <div className="d-flex flex-column w-100">
                                                            <FileUpload
                                                                forInput={`fileInput_${index}`}
                                                                formatFile=".jpg,.png"
                                                                label={<span className="file-upload-label">Gambar (.jpg, .png)</span>}
                                                                onChange={(e) => handleFileChange(e, index)} // Memanggil handleFileChange dengan indeks
                                                                //hasExisting={question.gambar}
                                                                style={{ fontSize: '12px' }}
                                                            />{/* Tampilkan preview gambar jika ada gambar yang dipilih */}
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
                                                            {question.gambar && !question.selectedFile && (
                                                                <div style={{
                                                                    maxWidth: '300px', // Set maximum width for the image container
                                                                    maxHeight: '300px', // Set maximum height for the image container
                                                                    overflow: 'hidden', // Hide any overflow beyond the set dimensions
                                                                    marginLeft: '10px'
                                                                }}>
                                                                    <img
                                                                        src={question.gambar}
                                                                        alt="Preview Gambar"
                                                                        style={{
                                                                            width: '100%', // Ensure image occupies full width of container
                                                                            height: 'auto', // Maintain aspect ratio
                                                                            objectFit: 'contain' // Fit image within container without distortion
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="mt-2">
                                                                <label className="form-label fw-bold">
                                                                    Point <span style={{ color: "Red" }}> *</span>
                                                                </label> {/* Memberikan margin atas kecil untuk jarak yang rapi */}
                                                                <Input
                                                                    type="number"
                                                                    value={question.point}
                                                                    onChange={(e) => handlePointChange(e, index)}
                                                                />
                                                            </div>
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
                                                                {/* <Button
                                                                    iconName="delete"
                                                                    classType="btn-sm ms-2 px-2 py-0"
                                                                    onClick={() => handleDeleteOption(index, optionIndex)}
                                                                    style={{ marginRight: '10px' }}
                                                                /> */}
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
                                                        {/* <Button
                                                            onClick={() => handleAddOption(index)}
                                                            iconName="add"
                                                            classType="success btn-sm ms-2 px-3 py-1"
                                                            label="Opsi Baru"
                                                        /> */}
                                                    </div>
                                                )}
                                                <div className="d-flex justify-content-between my-2 mx-1">
                                                    <div>

                                                    </div>
                                                    {/* <div>
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

                                                    </div> */}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Alert type="warning" message={(
                                <span>
                                    Pre Test belum ditambahkan. <a onClick={() => onChangePage("pretestAddNot")} className="text-primary">Tambah Data</a>
                                </span>
                            )} />
                        )}
                    </div>
                </div>
                <div className="float my-4 mx-1">
                    <Button
                        classType="outline-secondary me-2 px-4 py-2"
                        label="Kembali"
                        onClick={() => onChangePage("materiEdit")}
                    />
                    {hasTest ? (
                        <Button
                            classType="primary ms-2 px-4 py-2"
                            type="submit"
                            label="Simpan"
                        />
                    ) : (
                        null
                    )}
                    <Button
                        classType="dark ms-3 px-4 py-2"
                        label="Berikutnya"
                        onClick={() => onChangePage("sharingEdit")}
                    />

                </div>
            </form>
        </>
    );
}