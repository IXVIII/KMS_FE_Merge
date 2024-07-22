import React from "react";
import Icon from "./Icon";
import Input from "./Input";
import Button from "./Button";

function CardKelompokKeahlian({
  config = { footer: "", icon: "", className: "", label: "", page: "" },
  data = {
    id: "",
    title: "",
    prodi: { key: "", nama: "" },
    pic: { key: "", nama: "" },
    desc: "",
    status: "",
    members: [],
    memberCount: 0,
  },
  onChangePage,
  onChangeStatus,
  onDelete,
}) {
  const handleStatusChange = (data, status) => {
    onChangeStatus(data, status);
  };

  const handleDeleteClick = (data) => {
    onDelete(data.id);
  };

  const members = data.members || []; // memastikan members selalu berupa array

  let personInCharge;
  if (data.status === "Draft" && !data.pic.key) {
    personInCharge = (
      <div className="pt-2 ps-2">
        <Icon
          name="user"
          cssClass="p-0 ps-1 text-dark"
          title="PIC Kelompok Keahlian"
        />{" "}
        <span>PIC : -</span>
      </div>
    );
  } else {
    personInCharge = (
      <div className="pt-2 ps-2">
        <Icon
          name="user"
          cssClass="p-0 ps-1 text-dark"
          title="PIC Kelompok Keahlian"
        />{" "}
        <span>
          PIC :{" "}
          {data.pic.key ? (
            data.pic.nama
          ) : (
            <span className="text-danger-emphasis fw-bold">
              Menunggu PIC dari Prodi
            </span>
          )}
        </span>
      </div>
    );
  }

  let footerStatus;
  if (data.status === "Draft" && !data.pic.key) {
    footerStatus = (
      <p className="mb-0 text-secondary">Draft - Belum dikirimkan ke Prodi</p>
    );
  } else if (data.status === "Draft" && data.pic.key) {
    footerStatus = (
      <p className="mb-0 text-secondary">Draft - Belum dipublikasi</p>
    );
  } else if (data.status === "Menunggu" && !data.pic.key) {
    footerStatus = (
      <p className="mb-0 text-secondary">Menunggu PIC dari Prodi</p>
    );
  }

  let cardContent;
  if (config.footer === "Btn") {
    cardContent = (
      <div className="d-flex justify-content-between">
        <div>
          {/* <Icon
            name="users"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Anggota Kelompok Keahlian"
          />{" "}
          <span className="fw-semibold">{data.memberCount} Anggota</span> */}
        </div>
        <Button
          iconName={config.icon}
          classType={config.className}
          label={config.label}
          onClick={() => onChangePage(config.page, data)}
        />
      </div>
    );
  } else if (config.footer === "Draft") {
    cardContent = (
      <div className="d-flex justify-content-between">
        {footerStatus}
        <div className="d-flex justify-content-end">
          <Icon
            name="edit"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Ubah data"
            onClick={() => onChangePage("edit", data)}
          />
          <Icon
            name="trash"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Hapus data permanen"
            onClick={() => handleDeleteClick(data)}
          />
          <Icon
            name="list"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Lihat detail Kelompok Keahlian"
            onClick={() => onChangePage("detailDraft", data)}
          />
          {data.pic.key ? (
            <Icon
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Publikasi Kelompok Keahlian"
              onClick={() => handleStatusChange(data, "Aktif")}
            />
          ) : (
            <Icon
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Kirim ke Prodi bersangkutan untuk menentukan PIC"
              onClick={() => handleStatusChange(data, "Menunggu")}
            />
          )}
        </div>
      </div>
    );
  } else if (config.footer === "Menunggu") {
    cardContent = (
      <div className="d-flex justify-content-between">
        {footerStatus}
        <div className="d-flex justify-content-end">
          <Icon
            name="edit"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Ubah data"
            onClick={() => onChangePage("edit", data)}
          />
          <Icon
            name="trash"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Hapus data permanen"
          />
          <Icon
            name="list"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Lihat detail Kelompok Keahlian"
            onClick={() => onChangePage("detailDraft", data)}
          />
          {data.pic.key ? (
            <Icon
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Kirim ke Prodi bersangkutan untuk menentukan PIC"
            />
          ) : (
            ""
          )}
        </div>
      </div>
    );
  } else {
    cardContent = (
      <div className="d-flex justify-content-between">
        {data.members ? (
          <div className="img-container" style={{ width: "28%" }}>
            {members.map((person, index) => (
              <div style={{ width: "55%", marginLeft: "-10px" }}>
                <p className="lh-sm mb-0">
                  {members.map((person, index) => (
                    <span key={index}>
                      <a
                        href={person.link}
                        className="fw-bold text-dark text-decoration-none"
                      >
                        {person.name}
                        {", "}
                      </a>
                    </span>
                  ))}
                  dan {data.memberCount} Lainnya sudah bergabung!
                </p>
              </div>
            ))}
          </div>
        ) : (
          ""
        )}
        <div className="d-flex" style={{ width: "20%" }}>
          <Icon
            name="edit"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Ubah data"
            onClick={() => onChangePage("edit", data)}
          />
          <Icon
            name="list"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Lihat detail Kelompok Keahlian"
            onClick={() => onChangePage("detailPublish", data)}
          />
          <div
            className="form-check form-switch py-0 ms-2"
            style={{ width: "fit-content" }}
          >
            <Input
              type="checkbox"
              title="Aktif / Nonaktif"
              className="form-check-input"
              checked={data.status === "Aktif"}
              onChange={() =>
                handleStatusChange(
                  data,
                  data.status === "Aktif" ? "Tidak Aktif" : "Aktif"
                )
              }
            />
            <label
              className="form-check-label"
              htmlFor="flexSwitchCheckDefault"
            ></label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-md-6 mb-3" key={data.id}>
      <div
        className="card p-0 h-100"
        style={{
          border: "",
          borderRadius: "10px",
          borderBottomRightRadius: "0",
          borderBottomLeftRadius: "0",
          backgroundColor: "transparent",
        }}
      >
        <div className="card-body p-0 card-content">
          <h5
            className="card-title text-white px-3 py-2"
            style={{
              borderTopRightRadius: "10px",
              borderTopLeftRadius: "10px",
              backgroundColor:
                data.status === "Draft" || data.status === "Menunggu"
                  ? "#6c757d"
                  : "#67ACE9",
            }}
          >
            {data.title}
          </h5>
          <div className="card-body px-3">
            <h6 className="card-subtitle">
              <span
                className="bg-primary me-2"
                style={{ padding: "2px" }}
              ></span>
              {data.prodi.nama}
            </h6>
            {personInCharge}
            <hr style={{ opacity: "0.1" }} />
            <p
              className="lh-sm"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textAlign: "justify",
              }}
            >
              {data.desc}
            </p>
            <hr style={{ opacity: "0.1" }} />
            {cardContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardKelompokKeahlian;
