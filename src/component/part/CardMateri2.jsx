import { useState } from "react";
import Icon from "./Icon.jsx";
import Button from "./Button.jsx";
import AppContext_master from "../page/master-proses/MasterContext.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AppContext_test from "../page/master-test/TestContext.jsx";
function CardMateri({ 
  materis, 
  onStatus,
  onEdit,
  onReviewJawaban,
  onBacaMateri,
  onDetail,
  MAX_DESCRIPTION_LENGTH = 100,
  isNonEdit,
}) {
  const [expandDeskripsi, setExpandDeskripsi] = useState({});
  
  const handleExpandDescription = (bookId) => {
    setExpandDeskripsi((prevState) => ({
      ...prevState,
      [bookId]: !prevState[bookId]
    }));
  };

  const handleStatusChange = (book) => {
    console.log(`Status buku ${book.Key} diubah`);
    onStatus(book.Key);
  };

  const handleBacaMateri = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    // console.log(AppContext_test.materiId)
    AppContext_test.refreshPage += 1;
    onBacaMateri("pengenalan", true, book.Key, true);
  };
  const handleReviewJawaban = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    // console.log(AppContext_test.materiId)
    onReviewJawaban("reviewjawaban", true, book.Key, true);
  };

  return (
    <>
      {materis.map((book) => {
        if (book.Key == null) {
          return null;
        }
        return (
          <div className="mt-4 col-lg-6" key={book.Key}>
            <div className="card" style={{ borderColor: book.Status === "Aktif" ? "blue" : "grey", height: "auto" }}>
              
            <div className="card-body d-flex align-items-start position-relative">
                <img  
                  src={book.Gambar}
                  alt="gambar"
                  style={{
                    width: "120px",
                    height: "120px",
                    minWidth: "120px",
                    marginRight: "15px",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "140px", // Menyesuaikan dengan lebar gambar
                    top: "15px",
                    bottom: "15px",
                    width: "2px",
                    backgroundColor: "#ccc"
                  }}
                ></div>
                <div style={{ paddingLeft: "25px" }}>
                  <button className="btn btn-link p-0 text-decoration-none" onClick={() =>  onDetail("materiDetail", AppContext_test.DetailMateri = book, AppContext_master.DetailMateri = book)}>
                    <h5 className="card-title mb-1">{book.Judul}</h5>
                  </button>
                  <div className="mb-1" style={{fontSize:"12px"}}>
                    <span
                      className="bg-primary me-2"
                      style={{ padding: "2px" }}
                    ></span>
                    <span>{book.Kategori}</span>
                  </div>
                  <div className="mb-1">
                    <FontAwesomeIcon icon={faUser} style={{ marginRight: "10px", color: "gray" }} />
                    <span style={{ fontSize: "12px" }}> {book.Uploader} • {book.Creadate?.slice(0, 10)}</span>
                  </div>
                  <div>
                     {/* textAlign: 'right' */}
                     {/* textAlign: 'left' */}
                     {/* textAlign: 'center' */}
                    <p className="card-text p-0 m-0" style={{ fontSize: "12px", maxHeight: "75px", overflow: "hidden", textAlign: 'justify' }}>
                      {book.Keterangan.length > MAX_DESCRIPTION_LENGTH && !expandDeskripsi[book.Key] ? (
                        <>
                          {book.Keterangan.slice(0, MAX_DESCRIPTION_LENGTH) + " ..."}
                          <a
                            className="btn btn-link text-decoration-none p-0"
                            onClick={() => handleExpandDescription(book.Key)}
                            style={{ fontSize: "12px" }}
                          >
                            Baca Selengkapnya <Icon name={"caret-down"} />
                          </a>
                        </>
                      ) : (
                        <>
                          {book.Keterangan}
                          {expandDeskripsi[book.Key] && (
                            <a
                              className="btn btn-link text-decoration-none p-0"
                              onClick={() => handleExpandDescription(book.Key)}
                              style={{ fontSize: "12px" }}
                            >
                              Tutup <Icon name={"caret-up"} />
                            </a>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <hr className="m-0 p-0" style={{ color: "#67ACE9" }} />

              <div className="card-footer d-flex justify-content-end bg-white">
                {isNonEdit === false ? (
                  <>
                    {book.Status === "Aktif" && (
                      <button
                        className="btn btn-sm text-primary"
                        title="Edit Materi"
                        onClick={() => onEdit("materiEdit", AppContext_test.DetailMateriEdit = book, AppContext_test.DetailMateri = book, AppContext_master.DetailMateri = book)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    )}
                    {/* <button
                      className="btn btn-sm text-primary"
                      title="Detail Materi"
                      onClick={() =>
                    >
                      {console.log("data context materi dari index:", AppContext_test.DetailMateri)}

                      <i className="fas fa-list"></i>
                    </button> */}
                    <button
                      className="btn btn-circle"
                      onClick={() => handleStatusChange(book)}
                    >
                      {book.Status === "Aktif" ? (
                        <i
                          className="fas fa-toggle-on text-primary"
                          style={{ fontSize: '20px' }}
                        ></i>
                      ) : (
                        <i
                          className="fas fa-toggle-off text-red"
                          style={{ fontSize: '20px' }}
                        ></i>
                      )}
                    </button>
                    <button
                      className="btn btn-sm text-primary"
                      title="Review Jawaban"
                      onClick={() => {handleReviewJawaban(book)}}
                    >
                      <i className="fas fa-file"></i>
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={() => {
                      handleBacaMateri(book);
                    }}
                  >
                    Baca Materi
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default CardMateri;
