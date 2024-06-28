import { APPLICATION_NAME } from "../util/Constants";

export default function ContentTitle() {
  return (
    <>
      <div className="border-bottom py-3 fixed-when-scroll">
        <div className="d-flex justify-content-between">
          <div>
            <span className="fw-bold text-primary">{APPLICATION_NAME}</span>
            &nbsp;&nbsp;/&nbsp;&nbsp;<span id="spanMenu"></span>
            <span id="spanMenuRoute"></span>
          </div>
          <div style={{ paddingRight: "13rem" }} id="legend-top"></div>
        </div>
      </div>
    </>
  );
}
