import { useState } from "react";
import MasterProsesIndex from "./Index";
// PreTest
import MasterPreTestAdd from "./master-pretest/PreTestAdd";
import MasterPreTestEdit from "./master-pretest/PreTestEdit";
import MasterPreTestDetail from "./master-pretest/PreTestDetail";
// Materi
import MasterMateriAdd from "./master-materi/MateriAdd";
import MasterMateriEdit from "./master-materi/MateriEdit";
import MasterMateriDetail from "./master-materi/MateriDetail";
import MasterMateriReviewJawaban from "./master-materi/MateriReviewJawaban";
// Sharing Expert
import MasterSharingAdd from "./master-sharing/SharingAdd";
import MasterSharingDetailNot from "./master-sharing/SharingDetailNot";
import MasterSharingEditNot from "./master-sharing/SharingEditNot";
import MasterSharingEdit from "./master-sharing/SharingEdit";
import MasterSharingDetail from "./master-sharing/SharingDetail";
// Forum
import MasterForumAdd from "./master-forum/ForumAdd";
import MasterForumDetailNot from "./master-forum/ForumDetailNot";
import MasterForumEditNot from "./master-forum/ForumEditNot";
import MasterForumEdit from "./master-forum/ForumEdit";
import MasterForumDetail from "./master-forum/ForumDetail";
// Post Test
import MasterPostTestAdd from "./master-posttest/PostTestAdd";
import MasterPostTestEdit from "./master-posttest/PostTestEdit";
import MasterPostTestDetail from "./master-posttest/PostTestDetail";
// Kelompok Keahlian
import PilihKelompokKeahlian from "./Kelompok_Keahlian";
// import Masterpustakaa from "./pustaka";

//
import "../../../index.css";


export default function MasterProses() {
  const [pageMode, setPageMode] = useState("kk");
  const [dataID, setDataID] = useState();
  const [dataID2, setDataID2] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterProsesIndex 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "reviewjawaban":
        return <MasterMateriReviewJawaban
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "pretestAdd":
        return <MasterPreTestAdd 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "pretestEdit":
        return <MasterPreTestEdit 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "pretestDetail":
        return <MasterPreTestDetail 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "materiAdd":
        return <MasterMateriAdd 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "materiEdit":
        return <MasterMateriEdit 
              onChangePage={handleSetPageMode}             
              withID={dataID}/>;
      case "materiDetail":
        return <MasterMateriDetail 
                onChangePage={handleSetPageMode}             
                withID={dataID}/>;
      case "sharingAdd":
        return <MasterSharingAdd 
                onChangePage={handleSetPageMode}
                withID={dataID}
               />;
      case "sharingDetailNot":
        return <MasterSharingDetailNot 
                onChangePage={handleSetPageMode}
                withID={dataID}
               />;
      case "sharingEdit":
        return <MasterSharingEdit 
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      case "sharingEditNot":
        return <MasterSharingEditNot 
                onChangePage={handleSetPageMode}
                withID={dataID}
                />;
      case "sharingDetail":
        return <MasterSharingDetail 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "forumAdd":
        return <MasterForumAdd 
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      case "forumDetailNot":
        return <MasterForumDetailNot
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      case "forumEditNot":
        return <MasterForumEditNot
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      case "forumEdit":
        return <MasterForumEdit 
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      case "forumDetail":
        return <MasterForumDetail 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "posttestAdd":
        return <MasterPostTestAdd 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "posttestEdit":
        return <MasterPostTestEdit 
                onChangePage={handleSetPageMode}
                withID={dataID}/>;
      case "posttestDetail":
        return <MasterPostTestDetail 
                onChangePage={handleSetPageMode} 
                withID={dataID}/>;
      case "kk":
        return <PilihKelompokKeahlian 
                onChangePage={handleSetPageMode} />;
        //         case "pustaka":
        // return <Masterpustakaa 
        //         onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID,withIDKategori) {
    setDataID(withID);
    setDataID2(withIDKategori);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}