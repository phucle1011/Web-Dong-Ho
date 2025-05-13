import { useEffect, useState } from "react";
import {
  profitChartOptions,
  breakupChartOptions,
  earningChartOptions,
  renderChart
} from "../../../styles/admin/js/dashboard.js";

function Dashboard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2025);
  const [revenue, setRevenue] = useState(0);

  const fetchRevenue = async () => {
    try {
      const res = await fetch(`http://localhost:5000/admin/revenue?month=${month}&year=${year}`);
      const data = await res.json();
      console.log("Kết quả JSON:", data);
      setRevenue(data.revenue);
    } catch (err) {
      console.error("Lỗi khi fetch doanh thu:", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [month, year]);

  // Gọi chart render
  useEffect(() => {
    const profitChart = renderChart({ selector: "#chart", options: profitChartOptions });
    profitChart?.render();

    const breakupChart = renderChart({ selector: "#breakup", options: breakupChartOptions });
    breakupChart?.render();

    const earningChart = renderChart({ selector: "#earning", options: earningChartOptions });
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
              <div className="row align-items-center mb-3">
                <div className="col-md-6">
                  <h5 className="card-title fw-semibold mb-0">Tổng Quan Doanh Thu</h5>
                </div>
                <div className="col-md-6 text-md-end mt-2 mt-md-0">
                  <select
                    className="form-select w-auto d-inline-block"
                    onChange={(e) => {
                      const [thang, nam] = e.target.value.split(',');
                      setMonth(Number(thang));
                      setYear(Number(nam));
                    }}
                    value={`${month},${year}`}
                  >
                    <option value="1,2025">Tháng 1, 2025</option>
                    <option value="2,2025">Tháng 2, 2025</option>
                    <option value="3,2025">Tháng 3, 2025</option>
                    <option value="4,2025">Tháng 4, 2025</option>
                    <option value="5,2025">Tháng 5, 2025</option>
                    <option value="6,2025">Tháng 6, 2025</option>
                    <option value="7,2025">Tháng 7, 2025</option>
                    <option value="8,2025">Tháng 8, 2025</option>
                    <option value="9,2025">Tháng 9, 2025</option>
                    <option value="10,2025">Tháng 10, 2025</option>
                    <option value="11,2025">Tháng 11, 2025</option>
                    <option value="12,2025">Tháng 12, 2025</option>
                  </select>
                </div>
              </div>

              <div className="alert alert-primary fw-bold text-center mb-0" role="alert">
  Tổng doanh thu tháng {month}, {year}: {revenue.toLocaleString('vi-VN')} VNĐ
</div>
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
                          <span className="fs-2">2025</span>
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

            {/* Doanh thu tháng */}
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-start">
                    <div className="col-8">
                      <h5 className="card-title mb-9 fw-semibold">Doanh Thu Tháng</h5>
                      <h4 className="fw-semibold mb-3">{revenue.toLocaleString('vi-VN')} VND</h4>
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

      {/* Các phần khác giữ nguyên... */}
    </div>
  );
}

export default Dashboard;
