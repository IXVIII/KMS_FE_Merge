import React, { useState } from "react";
import Button from "./Button";
import CardKategoriProgram from "./CardKategoriProgram2";
import Icon from "./Icon";
import AppContext_test from "../page/master-test/TestContext";

const MAX_DESCRIPTION_LENGTH = 200; // Sesuaikan dengan panjang maksimum yang diinginkan

const CardProgram = ({ program, onChangePage }) => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [expandDeskripsi, setExpandDeskripsi] = useState(false);
  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };
  AppContext_test.KeyKelompokKeahlian = program["Kode KK"];
  const handleExpandDescription = () => {
    setExpandDeskripsi(!expandDeskripsi);
  };

  return (
    <div className={`card card-program mt-3 ${isContentVisible ? "border-primary" : ""}`}>
      <div className={`card-body d-flex justify-content-between ${isContentVisible ? "align-items-center border-bottom border-primary" : ""}`}>
        <p className="fw-medium mb-0" style={{ width: "15%" }}>
          {program["Nama Program"]}
        </p>
        <p
          className="lh-sm mb-0"
          style={{
            width: "70%",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            fontSize: "15px",
            maxHeight: expandDeskripsi ? "none" : "75px",
            overflow: "hidden",
            textAlign:'justify'
          }}
        >
          {program.Deskripsi.length > MAX_DESCRIPTION_LENGTH && !expandDeskripsi ? (
            <>
              {program.Deskripsi.slice(0, MAX_DESCRIPTION_LENGTH) + " ..."}
              <a
                className="btn btn-link text-decoration-none p-0"
                onClick={handleExpandDescription}
                style={{ fontSize: "12px" }}
              >
                Baca Selengkapnya <Icon name={"caret-down"} />
              </a>
            </>
          ) : (
            <>
              {program.Deskripsi}
              {expandDeskripsi && (
                <a
                  className="btn btn-link text-decoration-none p-0"
                  onClick={handleExpandDescription}
                  style={{ fontSize: "12px" }}
                >
                  Tutup <Icon name={"caret-up"} />
                </a>
              )}
            </>
          )}
        </p>
        <div
          className="ps-3"
          style={{
            borderLeft: "solid grey 1px",
          }}
        >
          <Button
            iconName={isContentVisible ? "caret-up" : "caret-down"}
            classType="outline-primary btn-sm px-3"
            onClick={toggleContentVisibility}
            title="Detail Program"
          />
        </div>
      </div>
      {isContentVisible && (
        <div className="mt-3 card-kategori-program-container"> 
          {program.categories.map((kategori) => (
            <CardKategoriProgram 
              key={kategori.Key} 
              kategori={kategori} 
              onChangePage={onChangePage} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardProgram;
