import React, { forwardRef } from "react";
import Icon from "./Icon";
import Input from "./Input";

const CardKategoriProgram = ({
  data,
  onChangePage,
  onChangeStatus,
  onDelete,
  index,
}) => {
  const handleStatusChange = (data, status) => {
    onChangeStatus(data, status);
  };

  const handleDeleteClick = (data) => {
    onDelete(data.Key);
  };
  return (
    <div className="col">
      <div className="card card-kategori-program mt-3">
        {data.Status === "Draft" ? (
          <span
            className="text-danger bg-white px-2 ms-2 mb-0"
            style={{
              marginTop: "-12px",
              width: "fit-content",
              fontSize: "14px",
            }}
          >
            Draft
          </span>
        ) : (
          ""
        )}
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <h6 className="card-title">
              {index}
              {". "}
              {data["Nama Kategori"]}
            </h6>
            <div>
              <Icon
                name="file"
                cssClass="text-primary me-1"
                title="Materi sudah publikasi"
              />
              <span className="text-primary">{data.MateriCount}</span>
            </div>
          </div>
          <div className="d-flex mt-2">
            <div className="me-2 bg-primary ps-1"></div>
            <p className="card-subtitle" style={{ textAlign: "justify" }}>
              {data.Deskripsi}
            </p>
          </div>
          {data.Status === "Draft" ? (
            <div className="d-flex justify-content-end mt-3">
              <Icon
                name="edit"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Ubah data"
                onClick={() => onChangePage("editKategori", data)}
              />
              <Icon
                name="trash"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Hapus data permanen"
                onClick={() => handleDeleteClick(data)}
              />
              <Icon
                name="paper-plane"
                type="Bold"
                cssClass="btn px-1 py-0 text-primary"
                title="Publikasi mata kuliah"
                onClick={() => handleStatusChange(data, "Aktif")}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-end mt-3">
              <Icon
                name="edit"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Ubah data"
                onClick={() => onChangePage("editKategori", data)}
              />
              {/* <Icon
                name="check"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Sudah di Publikasi"
              /> */}
              <div
                class="form-check form-switch py-0 ms-2"
                style={{ width: "fit-content" }}
              >
                <Input
                  type="checkbox"
                  forInput=""
                  label=""
                  className="form-check-input"
                  checked={data.Status === "Aktif"}
                  onChange={() =>
                    handleStatusChange(
                      data,
                      data.Status === "Aktif" ? "Tidak Aktif" : "Aktif"
                    )
                  }
                />
                <label
                  className="form-check-label"
                  for="flexSwitchCheckDefault"
                ></label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardKategoriProgram;
