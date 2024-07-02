import React from "react";
import { useState } from "react";
import Icon from "./Icon";
import Button from "./Button";

function CardKonfirmasi({ data, onChangePage, isShow }) {
  const [showAllText, setShowAllText] = useState(isShow);

  const handleToggleText = () => {
    setShowAllText(!showAllText);
  };

  return (
    <>
      <div className="col-lg-4 mb-3">
        <div
          className="card p-0 h-100"
          style={{
            border: "",
            borderRadius: "0",
          }}
        >
          <div className="card-body p-0">
            <h5
              className="card-title text-white px-3 pt-2 pb-3 mb-0"
              style={{
                backgroundColor: data.MenungguCount > 0 ? "#ffcc00" : "#67ACE9",
              }}
            >
              {data["Nama Kelompok Keahlian"]}
            </h5>
            <div className="card-body p-3">
              <div>
                <Icon
                  name="users"
                  type="Bold"
                  cssClass="btn px-0 pb-1 text-primary"
                  title="Anggota Kelompok Keahlian"
                />{" "}
                <span>
                  <a
                    href=""
                    className="fw-semibold text-dark text-decoration-none"
                  >
                    {data.AnggotaAktifCount} Anggota Aktif
                  </a>
                </span>
              </div>
              <div>
                <Icon
                  name="clock"
                  type="Bold"
                  cssClass="btn px-0 pb-1 text-primary"
                  title="Anggota Kelompok Keahlian"
                />{" "}
                <span>
                  <a
                    href=""
                    className="fw-semibold text-dark text-decoration-none"
                  >
                    {data.MenungguCount} Menunggu Persetujuan
                  </a>
                </span>
              </div>
              <p
                className="lh-sm mt-2"
                style={{
                  display: showAllText ? "block" : "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textAlign: "justify",
                }}
              >
                {data.Deskripsi}
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <a
                  href="#"
                  className="text-decoration-none"
                  onClick={handleToggleText}
                >
                  <span className="fw-semibold">
                    {showAllText ? "Ringkas" : "Selengkapnya"}
                  </span>{" "}
                  <Icon
                    name={showAllText ? "arrow-up" : "arrow-right"}
                    type="Bold"
                    cssClass="btn px-0 pb-1 text-primary"
                    title="Baca Selengkapnya"
                  />
                </a>
                <Button
                  iconName="user"
                  classType="primary btn-sm"
                  label="Lihat Semua"
                  onClick={() => onChangePage("detail", data)}
                  title="Lihat detail Persetujuan Anggota Keahlian"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CardKonfirmasi;
