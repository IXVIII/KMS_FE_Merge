import { useEffect, useState, useRef } from "react";
import KMS_Rightbar from "../../part/KMS_RightBar";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import axios from "axios";
import Input from "../../part/Input";
import { object, string } from "yup";
import AppContext_test from "./TestContext";
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../../util/Constants";
export default function Forum({ onChangePage, isOpen }) {
  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [marginRight, setMarginRight] = useState("6vh");
  const [widthReply, setWidthReply] = useState("75%");
  const [replyMessage, setReplyMessage] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [tempItem, setTempItem] = useState([]);
  const formDataRef = useRef({
    forumId:currentData[0]?.Key,
    karyawanId: AppContext_test.activeUser, 
    isiDetailForum: "",
    statusDetailForum: "Aktif",
    createdBy: AppContext_test.displayName,
    detailId: currentData[0]?.Key,
  });
  const handleReply = (item) => {
    formDataRef.current = {
      forumId: item.Key,
      karyawanId: AppContext_test.activeUser,
      isiDetailForum: "",
      statusDetailForum: "Aktif",
      createdBy: AppContext_test.displayName,
      detailId: item.ChildDetailId,
    };
    setReplyMessage(`Membalas: ${item.IsiDetailForum}`); 
    setShowReplyInput(true); 
  };

  const [visibleCommentIndex, setVisibleCommentIndex] = useState(0);
  const [visibleReplies, setVisibleReplies] = useState([]);

  const handleCancelReply = () => {
    setReplyMessage(""); 
    formDataRef.current = {
      forumId:currentData[0]?.Key,
      karyawanId: AppContext_test.activeUser, 
      isiDetailForum: "",
      statusDetailForum: "Aktif",
      createdBy: AppContext_test.displayName,
      detailId: currentData[0]?.Key,
    };
    setShowReplyInput(false); 
  };

  const userSchema = object({
    isiDetailForum: string(),
  });


  function handlePreTestClick_close() {
    setMarginRight("10vh");
    setWidthReply("93%")
  }

  function handlePreTestClick_open() {
    setMarginRight("48vh");
    setWidthReply("75%")
  }
  
  const handleSendReply = async (e) => {
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
      setErrors({});
    }
    // console.log("Data yang dikirim ke backend:", formDataRef.current);
    try {
      const response = await axios.post(
        API_LINK + "Forum/SaveTransaksiForum",
        formDataRef.current
      );
      const updatedForumData = await fetchDataWithRetry();
      setCurrentData(updatedForumData); 
      formDataRef.current.isiDetailForum = "";
      handleCancelReply()
      } catch (error) {
        console.error("Error sending reply:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
  useEffect(() => {
    if (currentData) {
      formDataRef.current.forumId = currentData[0]?.Key;
      formDataRef.current.detailId = currentData[0]?.Key;
    }
  }, [currentData]);
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDataWithRetry();
        if (isMounted) {
          if (data) {
            if (Array.isArray(data)) {
              if (data.length === 0) {
              } else {
                setCurrentData(data);
              }
              return;
            } else {
              console.error("Data is not an array:", data);
            }
          } else {
            console.error("Response data is undefined or null");
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsError(true);
          console.error("Fetch error:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; 
    };
  }, [AppContext_test.materiId]);
  // }, [materiId]);

  const fetchDataWithRetry = async (retries = 10, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post(API_LINK + "Forum/GetDataForum", {
            materiId: AppContext_test.materiId,
          });
          if (response.data.length != 0) {
            setCurrentData(response.data)
            return response.data;
          }
        } catch (error) {
          console.error("Error fetching quiz data:", error);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleShowMoreReplies = () => {
    setVisibleCommentIndex((prevIndex) => prevIndex + 3);
  };

  const renderMessages = () => {
  return currentData
    .filter((item) => item.ChildDetailId === item.Key)
    .map((item) => {
      const replyCount = currentData.filter(reply => reply.ChildDetailId === item.DetailId).length;

      return (
        <div key={item.DetailId} className="text-right">
          <div className="card p-3 mb-3">
            <div className="d-flex align-items-center mb-3">
              <div
                className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center"
                style={{ ...circleStyle, ...profileStyle }}
              >
                {/* <img
                  alt="Profile Picture"
                  className="align-self-start"
                  style={{
                    width: "680%",
                    height: "auto",
                    position: "relative",
                    right: "25px",
                    bottom: "40px",
                  }}
                /> */}
              </div>
              <div>
                <h6 className="mb-0" style={{ fontSize: "14px", style:"bold"}}>
                </h6>
                
                  {item.CreatedByDetailForum} - {formatDate(item.CreatedDateDetailForum)}
              </div>
            </div>
            <div>
              <p
                className="mb-0"
                style={{
                  maxWidth: "1500px",
                  marginBottom: "0px",
                  fontSize: "14px",
                  textAlign: "left",
                  marginLeft: "10px",
                  flex: 1
                }}
              >
              </p>
            </div>
            <div>
              {item.IsiDetailForum}

            </div>
            <div style={{ display: "flex", justifyContent: "flex-start", marginLeft: "10px", paddingTop:"10px", paddingBottom:"10px" }}>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleReply(item)}
              >
                Balas
              </button>
            </div>

            {currentData
              .filter((reply) => reply.ChildDetailId == item.DetailId)
              .map((reply) => (
                <div key={reply.DetailId} style={{ marginLeft: "30px"}}>
                  {
                console.log(currentData, item)}
                  {visibleReplies.includes(reply.DetailId) && (
                    <div style={{paddingBottom:"20px" }}>
                      <div className="d-flex align-items-center " >
                        <div
                          className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center"
                          style={{ ...circleStyle, ...profileStyle }}
                        >
                          {/* <img
                            alt="Profile Picture"
                            className="align-self-start"
                            style={{
                              width: "680%",
                              height: "auto",
                              position: "relative",
                              right: "25px",
                              bottom: "40px",
                            }}
                          /> */}
                        </div>
                        <div>
                          <h6 className="mb-1" style={{ fontSize: "14px" }}>
                            {/* Membalas: {reply.IsiDetailForum} */}
                            {reply.CreatedByDetailForum} - {formatDate(reply.CreatedDateDetailForum)}
                          </h6>
                          {/* <h6 className="mb-0" style={nameStyle}>
                            {reply.CreatedByDetailForum} - {formatDate(reply.CreatedDateDetailForum)}
                          </h6> */}
                        </div>
                      </div>
                      <div
                        className="mb-0"
                        style={{
                          maxWidth: "1500px",
                          marginBottom: "0px",
                          fontSize: "14px",
                          textAlign: "left",
                          marginLeft: "10px",
                        }}
                      >
                        <div>
                          <div dangerouslySetInnerHTML={{ __html: reply.IsiDetailForum }} />
                        </div>
                      </div>

                      <i
                        className="btn btn-outline-primary btn-sm mt-2" 
                        onClick={() => handleReply(reply)}
                      >
                        Balas
                      </i>
                    </div>
                  )}
                </div>
              ))}

            {currentData.some(
              (reply) =>
                reply.ChildDetailId === item.DetailId &&
                !visibleReplies.includes(reply.DetailId)
            ) ? (
              <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleShowReplies(item.DetailId)}>
                <hr style={{ flex: 1, borderColor: "#0000EE", color:"#0000EE"}} />
                <span style={{ marginLeft: "10px", color: "#0000EE" }}>{`Balasan Lainnya (${replyCount})`}</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleHideReplies(item.DetailId)}>
                <hr style={{ flex: 1, borderColor: "#0000EE" }} />
                <span style={{ marginLeft: "10px", color: "#0000EE" }}>Sembunyikan balasan</span>
              </div>
            )}
          </div>
        </div>
      );
    });
};

const handleShowReplies = (detailId) => {
  setVisibleReplies((prevReplies) => [
    ...prevReplies,
    ...currentData
      .filter((reply) => reply.ChildDetailId === detailId)
      .map((reply) => reply.DetailId),
  ]);
};

const handleHideReplies = (detailId) => {
  setVisibleReplies((prevReplies) =>
    prevReplies.filter(
      (replyId) =>
        !currentData
          .filter((reply) => reply.ChildDetailId === detailId)
          .map((reply) => reply.DetailId)
          .includes(replyId)
    )
  );
};

  const renderJudulForum = () => {
    return currentData.slice(0,1).map((item) => (
      <div key={item.DetailId} className="text-right">
        <div className="card p-3 mb-3" style={{position:"sticky"}}>
          <div className="d-flex align-items-center mb-3">
            <div
              className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center"
              style={{ ...circleStyle, ...profileStyle }}
            >
              {/* <img
                src=""
                alt="Profile Picture"
                className="align-self-start"
                style={{
                  width: "680%",
                  height: "auto",
                  position: "relative",
                  right: "25px",
                  bottom: "40px",
                }}
              /> */}
            </div>
            <div>
              <h6 className="mb-0" style={{ fontSize: "24px" }}>
                
                <div dangerouslySetInnerHTML={{ __html: item.JudulForum }} />
              </h6>
              <h6 className="mb-0" style={nameStyle}>
                {item.CreatedByForum} - {formatDate(item.CreatedDateForum)}
              </h6>
            </div>
          </div>
          <div
            className="mb-0"
            style={{
              maxWidth: "1500px",
              marginBottom: "0px",
              fontSize: "14px",
              textAlign: "left",
              marginLeft: "10px",
            }}
          >
            <div>
              <div dangerouslySetInnerHTML={{ __html: item.IsiForum }} />
            </div>
          </div>
        </div>
      </div>
    ));
  };


  const circleStyle = {
    width: "30px",
    height: "30px",
    backgroundColor: "lightgray",
    marginRight: "20px",
  };

  const profileStyle = {
    backgroundColor: "lightgray",
    padding: "5px",
    borderRadius: "50%",
  };

  const nameStyle = {
    fontSize: "12px",
    marginBottom: "15px",
    color:'grey',
  };

  const textBoxStyle = {
    width: "1170px",
    height: "100px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    marginTop: "10px",
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
    const sidebarMenuElement = document.querySelector('.sidebarMenu');
    if (sidebarMenuElement) {
      sidebarMenuElement.classList.add('sidebarMenu-hidden');
    }
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    };

    return new Intl.DateTimeFormat('id-ID', options).format(date);
  };


  return (
    <>
      <div className="d-flex flex-column">
        <KMS_Rightbar
          handlePreTestClick_close={handlePreTestClick_close}
          handlePreTestClick_open={handlePreTestClick_open}
        />
        <div className="mt-3 ">
          <>
              <div style={{ marginRight: marginRight }}>
                {renderJudulForum()}
                {renderMessages()}
                <div style={{marginTop:'100px'}}></div>
                {showReplyInput && (
                  <div className="reply-batal input-group mb-3" style={{ position: 'fixed', bottom: '60px', left: '15px', zIndex: '999', maxWidth:widthReply, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)', borderRadius: '8px', backgroundColor: '#ffffff', padding: '10px', display: 'flex', alignItems: 'center' }}>
                    <p style={{ marginBottom: '20px', color: 'gray', flex:'1' }}>
                      <div dangerouslySetInnerHTML={{ __html: replyMessage }} />  
                    </p>
                    
                    <div className="input-group-append">
                      <button
                        className="btn btn-danger btn-sm flex-end"
                        type="button"
                        onClick={handleCancelReply}
                        style={{  marginLeft:'100px', marginBottom:'20px'}}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
                <div className="reply input-group mb-3" style={{ position: 'fixed', bottom: '20px', left: '15px', zIndex: '999', maxWidth:widthReply, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)', borderRadius: '8px', backgroundColor: '#ffffff', padding: '10px', display: 'flex', alignItems: 'center' }}>
                  <Input
                    type="text"
                    forInput="isiDetailForum"
                    className="form-control"
                    placeholder="Ketik pesan..."
                    value={formDataRef.current.isiDetailForum}
                    errorMessage={errors.isiDetailForum}
                    onChange={handleInputChange}
                    style={{ flex: '1', marginRight: '10px' }}
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleSendReply}
                      style={{ minWidth: '80px' }}
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
          </>
        </div>
      </div>
    </>
  );
}
