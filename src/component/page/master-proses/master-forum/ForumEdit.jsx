import { useState, useEffect } from "react";
import { object, string } from "yup";
import SweetAlert from "../../../util/SweetAlert";
import Button from "../../../part/Button";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import { Stepper } from 'react-form-stepper';
import axios from "axios";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import { Editor } from '@tinymce/tinymce-react';
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
const userSchema = object({
  forumJudul: string().max(100, "Maksimum 100 karakter").required("Harus diisi"),
  forumIsi: string().required("Harus diisi"),
});

export default function MasterForumEdit({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    forumJudul: "",
    forumIsi: "",
    // modifBY:"ika",
  });
  const [forumDataExists, setForumDataExists] = useState(false);
  const Materi = AppContext_test.DetailMateriEdit;

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const data = await UseFetch(API_LINK + "Forum/GetDataForumByMateri", {
          p1: Materi.Key
        });

        if (data === "ERROR") {
          setIsError(true);
        } else {
          if (data.length > 0) {
            setFormData({
              forumJudul: data[0]["Nama Forum"] || "",
              forumIsi: data[0]["Isi Forum"] || "",
            });
            setForumDataExists(true);
          } else {
            setForumDataExists(false);
          }
        }
      } catch (error) {
        setIsError(true);
        console.error("Error fetching forum data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [Materi]);

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await userSchema.validate(formData, { abortEarly: false })
      .then(() => ({ forumJudul: '', forumIsi: '' }))
      .catch((err) => {
        const errors = err.inner.reduce((acc, current) => {
          acc[current.path] = current.message;
          return acc;
        }, {});
        setErrors(errors);
        return errors;
      });

    setIsLoading(true);
    setIsError(false);

    try {
      console.log("FormData being sent:", formData);
      const response = await axios.post(API_LINK + "Forum/EditDataForum", {
        p1: Materi.Key,
        p2: formData.forumJudul,
        p3: formData.forumIsi,
        p4: 'ika',
      });

      if (response.status === 200) {
        SweetAlert("Berhasil", "Data forum berhasil diubah!", "success");
        // onChangePage("forumEdit");
      } else {
        throw new Error("Gagal untuk menyimpan data forum");
      }
    } catch (error) {
      setIsError(true);
      console.error("Error saving forum data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Alert type="danger" message="Error fetching data." />;
  }

  return (
    <>
      <form onSubmit={handleAdd}>
        <div>
          <Stepper
            steps={[
              { label: 'Materi', onClick: () => onChangePage("courseAdd") },
              { label: 'Pretest', onClick: () => onChangePage("pretestAdd") },
              { label: 'Sharing Expert', onClick: () => onChangePage("sharingEdit") },
              { label: 'Forum', onClick: () => onChangePage("forumEdit") },
              { label: 'Post Test', onClick: () => onChangePage("posttestEdit") }
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
            Edit Forum
          </div>
          
          {/* Handling different scenarios */}
          {isLoading && (
            <div className="card-body">
              <Loading />
            </div>
          )}
  
          {!isLoading && !forumDataExists && (
            <div className="card-body">
              <Alert type="warning" message={(
                <span>
                  Data Forum belum ditambahkan. <a onClick={() => onChangePage("forumEditNot")} className="text-primary">Tambah Data</a>
                </span>
              )} />
            </div>
          )}
  
          {!isLoading && forumDataExists && (
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
                      onEditorChange={(content) => setFormData({ ...formData, forumIsi: content })}
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
                    />
                    {errors.forumIsi && (
                      <div className="invalid-feedback">{errors.forumIsi}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
  
        </div>
        
        {/* Render the save button only if forumDataExists */}
          <div className="float my-4 mx-1">
            <Button
              classType="outline-secondary me-2 px-4 py-2"
              label="Kembali"
              onClick={() => onChangePage("sharingEdit")}
            />
            {forumDataExists && (
              <Button
                classType="primary ms-2 px-4 py-2"
                type="submit"
                label="Simpan"
              />
            )}
            <Button
              classType="dark ms-3 px-4 py-2"
              label="Berikutnya"
              onClick={() => onChangePage("posttestEdit")}
            />
          </div>
        
      </form>
    </>
  );
}
