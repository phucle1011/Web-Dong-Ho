import { useEffect } from "react";
import {
  profitChartOptions,
  breakupChartOptions,
  earningChartOptions,
  renderChart
} from "../../../styles/admin/js/dashboard.js";

function Dashboard() {
  useEffect(() => {
    const profitChart = renderChart({
      selector: "#chart",
      options: profitChartOptions
    });
    profitChart?.render();

    const breakupChart = renderChart({
      selector: "#breakup",
      options: breakupChartOptions
    });
    breakupChart?.render();

    const earningChart = renderChart({
      selector: "#earning",
      options: earningChartOptions
    });
    earningChart?.render();

    return () => {
      profitChart?.destroy();
      breakupChart?.destroy();
      earningChart?.destroy();
    };
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-8 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body">
              <div className="d-sm-flex d-block align-items-center justify-content-between mb-9">
                <div className="mb-3 mb-sm-0">
                  <h5 className="card-title fw-semibold">Tổng Quan Doanh Thu</h5>
                </div>
                <div>
                  <select className="form-select">
                    <option value="1">Tháng 3, 2023</option>
                    <option value="2">Tháng 4, 2023</option>
                    <option value="3">Tháng 5, 2023</option>
                    <option value="4">Tháng 6, 2023</option>
                  </select>
                </div>
              </div>
              <div id="chart"></div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="row">
            <div className="col-lg-12">
              <div className="card overflow-hidden">
                <div className="card-body p-4">
                  <h5 className="card-title mb-9 fw-semibold">Tổng Kết Năm</h5>
                  <div className="row align-items-center">
                    <div className="col-8">
                      <h4 className="fw-semibold mb-3">36.358 vé</h4>
                      <div className="d-flex align-items-center mb-3">
                        <span className="me-1 rounded-circle bg-light-success round-20 d-flex align-items-center justify-content-center">
                          <i className="ti ti-arrow-up-left text-success"></i>
                        </span>
                        <p className="text-dark me-1 fs-3 mb-0">+9%</p>
                        <p className="fs-3 mb-0">so với năm trước</p>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="me-4">
                          <span className="round-8 bg-primary rounded-circle me-2 d-inline-block"></span>
                          <span className="fs-2">2023</span>
                        </div>
                        <div>
                          <span className="round-8 bg-light-primary rounded-circle me-2 d-inline-block"></span>
                          <span className="fs-2">2024</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex justify-content-center">
                        <div id="breakup"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-start">
                    <div className="col-8">
                      <h5 className="card-title mb-9 fw-semibold">Doanh Thu Tháng</h5>
                      <h4 className="fw-semibold mb-3">6.820.000 VND</h4>
                      <div className="d-flex align-items-center pb-1">
                        <span className="me-2 rounded-circle bg-light-danger round-20 d-flex align-items-center justify-content-center">
                          <i className="ti ti-arrow-down-right text-danger"></i>
                        </span>
                        <p className="text-dark me-1 fs-3 mb-0">-5%</p>
                        <p className="fs-3 mb-0">so với năm trước</p>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex justify-content-end">
                        <div className="text-white bg-secondary rounded-circle p-6 d-flex align-items-center justify-content-center">
                          <i className="ti ti-currency-dollar fs-6"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="earning"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-4 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <div className="mb-4">
                <h5 className="card-title fw-semibold">Giao dịch gần đây</h5>
              </div>
              <ul className="timeline-widget mb-0 position-relative mb-n5">
                <li className="timeline-item d-flex position-relative overflow-hidden">
                  <div className="timeline-time flex-shrink-0 text-end text-green-700">Hoàn thành</div>
                  <div className="timeline-badge-wrap d-flex flex-column align-items-center">
                    <span className="timeline-badge border-2 border border-primary flex-shrink-0 my-8"></span>
                    <span className="timeline-badge-border d-block flex-shrink-0"></span>
                  </div>
                  <div className="timeline-desc fs-3 mt-n1">Nguyễn thị A thanh toán 385.000 VND</div>
                </li>
                <li className="timeline-item d-flex position-relative overflow-hidden">
                  <div className="timeline-time flex-shrink-0 text-end text-red-600">Đã hủy</div>
                  <div className="timeline-badge-wrap d-flex flex-column align-items-center">
                    <span className="timeline-badge border-2 border border-info flex-shrink-0 my-8"></span>
                    <span className="timeline-badge-border d-block flex-shrink-0"></span>
                  </div>
                  <div className="timeline-desc fs-3 text-dark mt-n1 fw-semibold">Đặt nhầm chuyến <a href="javascript:void(0)" className="text-primary d-block fw-normal">#-3467</a></div>
                </li>
                <li className="timeline-item d-flex position-relative overflow-hidden">
                  <div className="timeline-time text-dark flex-shrink-0 text-end text-green-800">Hoàn thành</div>
                  <div className="timeline-badge-wrap d-flex flex-column align-items-center">
                    <span className="timeline-badge border-2 border border-success flex-shrink-0 my-8"></span>
                    <span className="timeline-badge-border d-block flex-shrink-0"></span>
                  </div>
                  <div className="timeline-desc fs-3 text-dark mt-n1">Nguyễn Van A thanh toán 185.000 VND</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-8 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Giao Dịch Gần Đây</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th><h6 className="fw-semibold mb-0">Mã</h6></th>
                      <th><h6 className="fw-semibold mb-0">Nhân Viên</h6></th>
                      <th><h6 className="fw-semibold mb-0">Khách Hàng</h6></th>
                      <th><h6 className="fw-semibold mb-0">Trạng Thái</h6></th>
                      <th><h6 className="fw-semibold mb-0">Giá Vé</h6></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><h6 className="fw-semibold mb-0">1</h6></td>
                      <td><h6 className="fw-semibold mb-1">Lê Minh</h6><span className="fw-normal">Nhân viên bán vé</span></td>
                      <td><p className="mb-0 fw-normal">Nguyễn Văn B</p></td>
                      <td><span className="badge bg-primary rounded-3 fw-semibold">Đã xác nhận</span></td>
                      <td><h6 className="fw-semibold mb-0 fs-4">350.000 VND</h6></td>
                    </tr>
                    <tr>
                      <td><h6 className="fw-semibold mb-0">2</h6></td>
                      <td><h6 className="fw-semibold mb-1">Trần Văn C</h6><span className="fw-normal">Nhân viên bán vé</span></td>
                      <td><p className="mb-0 fw-normal">Trần Thị D</p></td>
                      <td><span className="badge bg-secondary rounded-3 fw-semibold">Chờ xác nhận</span></td>
                      <td><h6 className="fw-semibold mb-0 fs-4">450.000 VND</h6></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;