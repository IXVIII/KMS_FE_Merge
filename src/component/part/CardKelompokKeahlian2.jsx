import React, { useState ,useEffect} from "react";
import Button from "./Button";
import Icon from "./Icon";
import CardProgram from "./CardProgram2";

const MAX_DESCRIPTION_LENGTH = 300;

const CardKK = ({ kk, onChangePage }) => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [expandDeskripsi, setExpandDeskripsi] = useState({});
  const [cardHeight, setCardHeight] = useState("auto");
  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  const handleExpandDescription = (key) => {
    setExpandDeskripsi({ ...expandDeskripsi, [key]: !expandDeskripsi[key] });
  };
  useEffect(() => {
    const descriptionLength = kk.Deskripsi.length;
    if (descriptionLength > MAX_DESCRIPTION_LENGTH) {
      setCardHeight("auto"); 
    }
  }, [kk.Deskripsi]);
  return (
    <div className="col-md-12 mb-3" >
      <div className="card p-0 mb-3" style={{ borderRadius: "10px", height: cardHeight }}> {/* Set tinggi kartu */}
        <div className="card-body p-0">
          <h5
            className="card-title text-white px-3 py-2"
            style={{
              borderTopRightRadius: "10px",
              borderTopLeftRadius: "10px",
              backgroundColor: "#67ACE9"
            }}
          >
            {kk["Nama Kelompok Keahlian"]}
          </h5>
          <div className="card-body px-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="card-programtitle mb-0">
                <Icon name="align-left" type="Bold" cssClass="btn px-2 py-0 text-primary" title="Program" />
                <span>
                  <a href="#" className="text-decoration-underline text-dark">{kk.ProgramCount} Program</a>
                </span>
                <Icon name="users" type="Bold" cssClass="btn px-2 py-0 text-primary ms-3" title="Anggota Kelompok Keahlian" />
                <span>
                  <a href="#" className="text-decoration-underline text-dark">{kk.AnggotaCount} Anggota</a>
                </span>
              </h6>
              <div className="ps-3" style={{ borderLeft: "solid grey 1px" }}>
                <Button
                  iconName={isContentVisible ? "caret-up" : "caret-down"}
                  classType="outline-primary btn-sm px-3"
                  onClick={toggleContentVisibility}
                  title="Detail Kelompok Keahlian"
                />
              </div>
            </div>
            <hr style={{ opacity: "0.1" }} />
            <p
              className="lh-sm mb-0"
              style={{
                width: "95%",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                fontSize: "15px",
                maxHeight: expandDeskripsi ? "none" : "75px",
                overflow: "hidden",
                textAlign:'justify'
              }}  
            >
              {kk.Deskripsi.length > MAX_DESCRIPTION_LENGTH && !expandDeskripsi[kk.Key] ? (
                <>
                  {kk.Deskripsi.slice(0, MAX_DESCRIPTION_LENGTH) + " ..."}
                  <a
                    className="btn btn-link text-decoration-none p-0"
                    onClick={() => handleExpandDescription(kk.Key)}
                    style={{ fontSize: "12px" }}
                  >
                    Baca Selengkapnya <Icon name={"caret-down"} />
                  </a>
                </>
              ) : (
                <>
                  {kk.Deskripsi}
                  {expandDeskripsi[kk.Key] && (
                    <a
                      className="btn btn-link text-decoration-none p-0"
                      onClick={() => handleExpandDescription(kk.Key)}
                      style={{ fontSize: "12px" }}
                    >
                      Tutup <Icon name={"caret-up"} />
                    </a>
                  )}
                </>
              )}
            </p>
            {isContentVisible && (
              <>
                {kk.programs.map((program) => (
                  <CardProgram key={program.Key} program={program} onChangePage={onChangePage} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardKK;
