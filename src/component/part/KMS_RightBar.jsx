import React, { useState, useEffect, useContext } from "react";
import Button from "../part/Button";
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../util/Constants";
import Icon from "../part/Icon";
import UseFetch from "../util/UseFetch";
import KMS_ProgressBar from "../part/KMS_ProgressBar";
import axios from "axios";
import Loading from "../part/Loading";
import AppContext_test from "../page/master-test/TestContext";

export default function KMS_Rightbar({ handlePreTestClick_close, handlePreTestClick_open, onChangePage, isOpen, materiId }) {
  const [dropdowns, setDropdowns] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [widthDynamic, setwidthDynamic] = useState("");
  const [showElement, setShowElement] = useState(false);
  const [showMainContent_SideBar, setShowMainContent_SideBar] = useState(isOpen);
  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);
  const [currentDataMateri, setCurrentDataMateri] = useState([]);
  const [idMateri, setIdMateri] = useState("");
  useEffect(() => {
  }, [AppContext_test.materiId]);

  useEffect(() => {
    setShowMainContent_SideBar(isOpen);
  }, [isOpen]);

  const isDataReadyTemp = "";
  const materiIdTemp = "";
  const isOpenTemp = true;
  useEffect(() => {
    let isMounted = false;

    const fetchData_rightBar = async () => {
      setIsLoading(true);
      try {
        const dataMateri = await fetchDataMateri_rightBar();
        if (isMounted) {
          if (dataMateri) {
            setCurrentDataMateri(dataMateri);
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

    const fetchDataMateri_rightBar = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post("http://localhost:8080/Materis/GetDataMateriById", {
            materiId: AppContext_test.materiId,
          });
          if (response.data != 0) {
            isMounted = true;
            return response.data;
          }
        } catch (error) {
          console.error("Error fetching quiz data:", error);
          console.log("halo", AppContext_test.materiId)
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };

    fetchData_rightBar();

    return () => {
      isMounted = false; 
    };
  }, [AppContext_test.materiId, AppContext_test.refreshPage]);

  useEffect(() => {
    let isMounted = true;

    const fetchData_rightBar = async () => {
      setIsLoading(true);
      try {
        const dataMateri = await updateProgres();
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

    const updateProgres = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post("http://localhost:8080/Materis/UpdatePoinProgresMateri", {
            materiId: AppContext_test.materiId,
          });

          if (response.data != 0) {
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

    fetchData_rightBar();

    return () => {
      isMounted = false; 
    };
  }, [AppContext_test.materiId, AppContext_test.refreshPage]);

  useEffect(() => {
    let isMounted = true;

    const fetchData_rightBar = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDataWithRetry_rightBar();
        if (isMounted) {
          if (data) {
                setCurrentData(data);
                console.log(currentData)
          } else {
            // console.error("Response data is undefined or null");
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

    const fetchDataWithRetry_rightBar = async (retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post("http://localhost:8080/Materis/GetProgresMateri", {
            materiId: AppContext_test.materiId,
            karyawanId: '1',
          });
          if (response.data != 0) {
            return response.data;
          }
        } catch (error) {
          console.error("Error fetching progres data:", error);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };
    fetchData_rightBar();

    return () => {
      isMounted = false; 
    };
  }, [AppContext_test.materiId, AppContext_test.refreshPage]);

  const toggleDropdown = (name) => {
    setDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };


  const listOfLearningStyle = {
    paddingLeft: '20px',
    paddingRight: '20px',
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '7%'
  }

  const button_listOfLearningStyle = {
    backgroundColor: '#0275D8',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '40px',
    borderColor: '#0275D8'
  }

  const progressStyle = {
    paddingTop: "5%",
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '5%'
  }

  const contentSidebarStyle = {
    paddingTop: "7%",
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '7%',
    maxHeight: 'calc(100vh - 350px)',
    overflowY: 'auto'
  }

  const styles = {
    sidebarItem: {
      fontFamily: 'Arial, sans-serif',
      paddingBottom: '7%',
      paddingTop: "7%",
      width: "100%"
    },
    buttonDropdown: {
      cursor: 'pointer'
    },
    dropdownContent: {
      borderTop: 'none',
      backgroundColor: 'white',
      paddingLeft: '25px',
      paddingTop: '15px'
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      margin: '5px 0',
      padding: '10px'
    },
    radio: {
      marginRight: '10px',
    },
    link: {
      fontSize: '14px',
      color: 'black',
      textDecoration: 'none',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left'
    }
  };

  const handleItemClick = (page, url, updateProgres) => {
    onChangePage(page);
    AppContext_test.urlMateri = url;
    AppContext_test.refreshPage = page;
    AppContext_test.progresMateri = updateProgres;
  };

  const [dropdownData, setDropdownData] = useState([]);
  const [showPengenalan, setShowPengenalan] = useState(false);
  const [showPreTest, setShowPreTest] = useState(false);
  const [showForum, setShowForum] = useState(false);
  const [showPostTest, setShowPostTest] = useState(false);

  useEffect(() => {
    if (currentDataMateri && currentDataMateri.length > 0) {
      const updatedDropdownData = [
        ...(currentDataMateri[0]?.File_pdf != null || currentDataMateri[0]?.File_video != null ? [{
          name: 'Materi',
          items: [
            ...(currentDataMateri[0]?.File_pdf != null ? [{ label: 'Materi PDF', onClick: () => handleItemClick("materipdf", currentDataMateri[0]?.File_pdf, "materi_pdf") }] : []),
            ...(currentDataMateri[0]?.File_video != null ? [{ label: 'Materi Video', onClick: () => handleItemClick("materivideo", currentDataMateri[0]?.File_video, "materi_video") }] : [])
          ],
          countDone: 5
        }] : []),
        ...(currentDataMateri[0]?.Sharing_pdf != null || currentDataMateri[0]?.Sharing_video != null ? [{
          name: 'Sharing Expert',
          items: [
            ...(currentDataMateri[0]?.Sharing_pdf != null ? [{ label: 'Materi PDF', onClick: () => handleItemClick("materipdf", currentDataMateri[0]?.Sharing_pdf, "sharing_pdf") }] : []),
            ...(currentDataMateri[0]?.Sharing_video != null ? [{ label: 'Materi Video', onClick: () => handleItemClick("materivideo", currentDataMateri[0]?.Sharing_video, "sharing_video") }] : [])
          ],
          countDone: 2
        }] : [])
      ];

      setDropdownData(updatedDropdownData);
      setShowPengenalan(currentDataMateri[0]?.Pengenalan != null);
      setShowPreTest(currentDataMateri[0]?.PreTest != null);
      setShowForum(currentDataMateri[0]?.Forum != null);
      setShowPostTest(currentDataMateri[0]?.PostTest != null);
    }
  }, [currentDataMateri]);

  function handleOpenClick() {
    setShowElement(false);
    setShowMainContent_SideBar(true);
    setwidthDynamic("");
  }

  function handleCloseClick() {
    setShowMainContent_SideBar(false);
    setShowElement(true);
    setwidthDynamic("4%");
  }

  function handleCombinedClick_open() {
    handleOpenClick();
    handlePreTestClick_open();
  }

  function handleCombinedClick_close() {
    handleCloseClick();
    handlePreTestClick_close();
  }

  function onClick_exit() {
      onChangePage(
        "index"
      );
      AppContext_test.refreshPage = true;
    }

  function onClick_forum() {
    onChangePage(
        "forum", 
        isDataReadyTemp,
        materiIdTemp,
        isOpenTemp
      );
      AppContext_test.pageMode = "index";
      AppContext_test.refreshPage = "forum";
    }

  function onClick_postTest() {
    onChangePage(
        "posttest", 
        isDataReadyTemp,
        materiIdTemp,
        isOpenTemp
      );
      AppContext_test.refreshPage = "posttest";
    }

  function onClick_preTest() {
    onChangePage(
        "pretest", 
        isDataReadyTemp,
        materiIdTemp,
        isOpenTemp
      );
      AppContext_test.refreshPage = "pretest";
    }
  function onClick_pengenalan() {
    onChangePage(
        "pengenalan", 
        isDataReadyTemp,
        materiIdTemp,
        isOpenTemp
      );
      AppContext_test.refreshPage = "pengenalan";
    }
  return (
  <div className="h-100 pt-2 overflow-y-auto position-fixed" style={{ right: "10px", width: widthDynamic }}>
    <div className="px-2 collapseTrue">
      {showElement &&
        <div className="" style={button_listOfLearningStyle}>
          <Icon
            name="angle-left"
            type="Bold"
            cssClass="btn text-light ms-0"
            onClick={handleCombinedClick_open}
          />
        </div>
      }
    </div>
    {showMainContent_SideBar && (
      <div className="collapseFalse">
        <div style={listOfLearningStyle}>
          <div style={button_listOfLearningStyle}>
            <Icon
              name="angle-right"
              type="Bold"
              cssClass="btn text-light ms-0"
              onClick={handleCombinedClick_close}
            />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '22px' }}>
            Daftar Pembelajaran
          </span>
        </div>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="border-top border-bottom" style={{ ...progressStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <Button 
                style={{width:"100%"}}
                classType="btn btn-outline-primary py-2" 
                label="Keluar Materi" 
                onClick={onClick_exit}  
              />
            </div>
            <div className="border-top border-bottom" style={progressStyle}>
              {currentData.map((item) => (
                <div key={item.Key}>
                  <KMS_ProgressBar progress={item.TotalProgres} />
                  <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                    {item.TotalProgres}% Selesai
                  </span>
                </div>
              ))}
            </div>
            <div className="border-top" style={contentSidebarStyle}>
              {showPengenalan && (
                <div style={styles.sidebarItem}>
                  <button style={styles.link} onClick={onClick_pengenalan}>Pengenalan Materi</button>
                </div>
              )}
              {showPreTest && (
                <div style={styles.sidebarItem}>
                  <button style={styles.link} onClick={onClick_preTest}>Pre-Test</button>
                </div>
              )}
              <div className="dropDown_menu">
                {dropdownData.map((dropdown, index) => (
                  <div key={index} style={styles.sidebarItem}>
                    <div onClick={() => toggleDropdown(dropdown.name)} style={styles.buttonDropdown}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {dropdowns[dropdown.name] ?
                            <Icon
                              name="caret-up"
                              type="Bold"
                              cssClass="text-black ms-0"
                            />
                            :
                            <Icon
                              name="caret-down"
                              type="Bold"
                              cssClass="text-black ms-0"
                            />
                          }
                          <div style={{ paddingLeft: "20px", fontSize: '14px' }}>{dropdown.name}</div>
                        </div>
                      </div>
                    </div>
                    {dropdowns[dropdown.name] && (
                      <div style={styles.dropdownContent}>
                        {dropdown.items.map((item, itemIndex) => (
                          <label key={itemIndex} style={styles.item}>
                            {/* <Icon
                              name="check"
                              type="Bold"
                              cssClass="text-black ms-0"
                              style={{ paddingRight: '10px' }}
                            /> */}
                            <a href={item.href} style={styles.link} onClick={item.onClick}>{item.label}</a>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {showForum && (
                <div style={styles.sidebarItem}>
                  <button style={styles.link} onClick={onClick_forum}>Forum</button>
                </div>
              )}
              {showPostTest && (
                <div style={styles.sidebarItem}>
                  <button style={styles.link} onClick={onClick_postTest}>Post-Test</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )}
  </div>
);

}