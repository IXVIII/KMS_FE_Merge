import { useState, useEffect } from "react";
import { object, string } from "yup";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import Button from "../../../part/Button";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import { Stepper } from 'react-form-stepper';
import UseFetch from "../../../util/UseFetch";
import { API_LINK } from "../../../util/Constants";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import { Editor } from '@tinymce/tinymce-react';

const userSchema = object({
  forumJudul: string().max(100, "maksimum 100 karakter").required("harus diisi"),
  forumIsi: string().required("harus diisi"),
});

export default function MasterForumAddNot({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [formData, setFormData] = useState({
    // materiId: AppContext_test.dataIDMateri,
    materiId:AppContext_test.DetailMateri?.Key || "",
    karyawanId: "040",
    forumJudul: AppContext_test.ForumForm?.forumJudul || "",
    forumIsi: AppContext_test.ForumForm?.forumIsi || "",
    forumCreatedBy: "ika",
    forumStatus: "Aktif",
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const resetForm = () => {
    setFormData({
      materiId:AppContext_test.DetailMateri?.Key || "",
      karyawanId: "040",
      forumJudul: "",
      forumIsi: "",
      forumCreatedBy: "ika",
      forumStatus: "Aktif",
    });
    setErrors({});
    setIsError({ error: false, message: "" });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(formData, userSchema, setErrors);
    const isEmptyData = Object.values(formData).some(value => value === "");

    if (isEmptyData) {
      setIsError({
        error: true,
        message: "Data tidak boleh kosong",
      });
      return;
    }

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});
    }

    try {
      console.log("Data yang dikirim ke backend:", formData);
      const response = await UseFetch(API_LINK + "Forum/SaveDataForum", formData);

      if (response === "ERROR") {
        setIsError({ error: true, message: "Terjadi kesalahan: Gagal menyimpan data Sharing." });
      } else {
        SweetAlert("Sukses", "Data Forum berhasil disimpan", "success")
        .then(() => {
          onChangePage("forumDetail", AppContext_test.DetailMateri);
        })
        .catch((error) => {
          console.error("SweetAlert encountered an error:", error);
        });
      }
    } catch (error) {
      setIsError({
        error: true,
        message: "Failed to save forum data: " + error.message,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (AppContext_test.ForumForm && AppContext_test.ForumForm.current && Object.keys(AppContext_test.ForumForm.current).length > 0) {
      formData.current = { ...formData.current, ...AppContext_test.ForumForm.current };
    }

    if (AppContext_test.formSavedForum === false) {
      setIsFormDisabled(false);
    }
  }, [AppContext_test.ForumForm, AppContext_test.formSavedForum]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div>
          <Stepper
            steps={[
              { label: 'Materi', onClick: () => onChangePage("courseAdd") },
              { label: 'Pretest', onClick: () => onChangePage("pretestAdd") },
              { label: 'Sharing Expert', onClick: () => onChangePage("sharingAdd") },
              { label: 'Forum', onClick: () => onChangePage("forumAdd") },
              { label: 'Post Test', onClick: () => onChangePage("posttestAdd") }
            ]}
            activeStep={3}
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
            Tambah Forum
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-12">
                <Input
                  type="text"
                  forInput="forumJudul"
                  label="Judul Forum"
                  value={formData.forumJudul}
                  onChange={handleInputChange}
                  errorMessage={errors.forumJudul}
                  isRequired
                  disabled={isFormDisabled } 
                />
              </div>
              <div className="col-lg-12">
                <div className="form-group">
                  <label htmlFor="forumIsi" className="form-label fw-bold">
                    Isi Forum <span style={{ color: 'Red' }}> *</span>
                  </label>
                  <Editor
                    id="forumIsi"
                    value={formData.forumIsi}
                    onEditorChange={(content) => handleInputChange({ target: { name: 'forumIsi', value: content } })}
                    apiKey='v5s2v6diqyjyw3k012z4k2o0epjmq6wil26i10xjh53bbk7y'
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
                    disabled={isFormDisabled} 
                  />
                  {errors.forumIsi && (
                    <div className="invalid-feedback">{errors.forumIsi}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="float my-4 mx-1">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("sharingDetail")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
          />
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("posttestDetail")}
          />
        </div>
      </form>
    </>
  );
}
