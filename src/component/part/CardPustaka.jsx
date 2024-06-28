import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Icon from "../part/Icon";
import Input from "./Input";

function CardPustaka({
  pustakas,
  uploader,
  onStatus,
  onEdit = () => {},
  onDetail = () => {},
  MAX_DESCRIPTION_LENGTH = 150,
}) {
  const [expandDeskripsi, setExpandDeskripsi] = useState({});
  const handleExpandDescription = (bookId) => {
    setExpandDeskripsi((prevState) => ({
      prevState,
      [bookId]: !prevState[bookId],
    }));
  };

  const handleStatusChange = (book) => {
    console.log(`Status buku ${book.Key} diubah`);
    onStatus(book.Key);
  };

  return (
    <>
      {pustakas.map((book) => {
        if (book.Key == null) {
          return null;
        }
        return (
          <div className="mt-4 col-lg-6" key={book.Key}>
            <div
              className="card p-0 h-100"
              style={{
                border: "",
                borderRadius: "10px",
                borderBottomRightRadius: "0",
                borderBottomLeftRadius: "0",
              }}
            >
              <div className="card-body p-0">
                <h5
                  className="card-title card-title-pustaka px-3 py-2"
                  style={{
                    borderTopRightRadius: "10px",
                    borderTopLeftRadius: "10px",
                    backgroundColor:
                      // green success "#198754" :
                      // warning "#ffc107" :
                      book.Status === "Tidak Aktif"
                        ? "#6c757d"
                        : uploader === book.Uploader
                        ? "#198754"
                        : "#67ACE9",
                    cursor: "pointer",
                  }}
                  onClick={() => onDetail("detail", book)}
                >
                  {book.Judul}
                </h5>
                <div className="card-body d-flex align-items-start position-relative">
                  {/* Gambar */}
                  <img
                    src={book.Gambar}
                    alt="gambar"
                    style={{
                      width: "120px",
                      height: "120px",
                      minWidth: "120px",
                      marginRight: "0px",
                      paddingRight: "15px",
                    }}
                  />

                  {/* Garis Vertikal */}
                  <div
                    style={{
                      position: "absolute",
                      left: "140px", // Menyesuaikan dengan lebar gambar
                      top: "15px",
                      bottom: "15px",
                      width: "2px",
                      backgroundColor: "#ccc",
                    }}
                  ></div>

                  <div style={{ paddingLeft: "25px" }}>
                    {/* Nama Pengarang */}
                    <div
                      className="mb-1"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      <span
                        className="bg-primary me-2"
                        style={{ padding: "2px" }}
                      ></span>
                      <span>{book["Kelompok Keahlian"]}</span>
                    </div>
                    <div className="mb-1">
                      <FontAwesomeIcon
                        icon={faUser}
                        style={{
                          marginRight: "10px",
                          color: "gray",
                          fontSize: "14px",
                        }}
                      />
                      <span style={{ fontSize: "12px" }}>
                        {book.Uploader} • {book.Creadate.slice(0, 10)}
                      </span>
                    </div>
                    {/* Deskripsi Buku */}
                    <div>
                      <p
                        className="card-text p-0 m-0"
                        style={{ fontSize: "12px" }}
                      >
                        {book.Keterangan.length > MAX_DESCRIPTION_LENGTH &&
                        !expandDeskripsi[book.Key] ? (
                          <>
                            {book.Keterangan.slice(0, MAX_DESCRIPTION_LENGTH) +
                              " ..."}
                          </>
                        ) : (
                          <>{book.Keterangan}</>
                        )}
                      </p>
                      {book.Keterangan.length > MAX_DESCRIPTION_LENGTH && (
                        <a
                          className="btn btn-link text-decoration-none p-0"
                          onClick={() => handleExpandDescription(book.Key)}
                          style={{ fontSize: "12px" }}
                        >
                          {expandDeskripsi[book.Key] ? (
                            <>
                              Tutup <Icon name={"caret-up"} />
                            </>
                          ) : (
                            <>
                              Baca Selengkapnya <Icon name={"caret-down"} />
                            </>
                          )}
                        </a>
                      )}
                    </div>
                    {/* Tambahkan konten lainnya sesuai kebutuhan */}
                  </div>
                </div>
              </div>

              <hr className="m-0 p-0" style={{ color: "#67ACE9" }} />

              {/* Tampilkan icon edit dan switch hanya jika menu adalah "kelola" */}
              {uploader === book.Uploader && (
                <div className="p-1 m-1 d-flex align-items-center justify-content-end">
                  <Icon
                    name="edit"
                    type="Bold"
                    cssClass="btn px-2 py-0 text-primary"
                    title="Ubah pustaka"
                    onClick={() => onEdit("edit", book)}
                  />
                  <div
                    className="form-check form-switch py-0 ms-2"
                    style={{ width: "fit-content" }}
                  >
                    <Input
                      type="checkbox"
                      title="Aktif / Nonaktif"
                      className="form-check-input"
                      checked={book.Status === "Aktif"}
                      onChange={() => handleStatusChange(book)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexSwitchCheckDefault"
                    ></label>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default CardPustaka;
