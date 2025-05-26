import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Constants from "../../../Constants.jsx";
import { FaUsers, FaListAlt, FaCoffee, FaComments, FaShoppingCart, FaTag } from 'react-icons/fa';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function Dashboard() {
  const [counts, setCounts] = useState({
    total_user: 0,
    total_category: 0,
    total_product: 0,
    total_comment: 0,
    total_order: 0,
    total_revenue: 0,
    revenueCurrentMonth: 0,
    revenueLastMonth: 0,
    revenueCurrentYear: 0,
    revenueLastYear: 0,
    total_promotion: 0,
  });

  const [timeRange, setTimeRange] = useState('month');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [{
      label: 'Doanh thu',
      data: [],
      backgroundColor: '#007bff',
      borderColor: '#007bff',
      borderWidth: 1
    }]
  });

  const formatVND = (number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
  };

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/dashboard/counts`);
        if (res.data.status === 200) {
          setCounts(res.data.data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thống kê:', err);
      }
    }
    fetchCounts();
  }, []);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        let params = {};
        if (timeRange === 'custom') {
          if (!customRange.from || !customRange.to) {
            setRevenueData({
              labels: [],
              datasets: [{
                label: 'Doanh thu',
                data: [],
                backgroundColor: '#007bff',
                borderColor: '#007bff',
                borderWidth: 1
              }]
            });
            return;
          }
          params = { from: customRange.from, to: customRange.to };
        } else {
          params = { range: timeRange };
        }

        const res = await axios.get(`${Constants.DOMAIN_API}/admin/dashboard/revenue`, { params });
        if (res.data.status === 200 && res.data.data) {
          const data = res.data.data;
          setRevenueData({
            labels: data.labels,
            datasets: [{
              label: 'Doanh thu',
              data: data.data,
              backgroundColor: 'rgba(0, 123, 255, 0.5)',
              borderColor: 'rgba(0, 123, 255, 1)',
              borderWidth: 1,
            }]
          });
        }
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', err);
      }
    }

    fetchRevenue();
  }, [timeRange, customRange]);

  const pieData = {
    labels: ['Người dùng', 'Loại sản phẩm', 'Sản phẩm', 'Bình luận', 'Đơn hàng', 'Khuyến mãi'],
    datasets: [{
      label: 'Số lượng',
      data: [
        counts.total_user,
        counts.total_category,
        counts.total_product,
        counts.total_comment,
        counts.total_order,
        counts.total_promotion,
      ],
      backgroundColor: [
        '#007bff', '#28a745', '#ffc107', '#dc3545', '#6610f2', '#212529'
      ],
      borderWidth: 1,
    }],
  };

  const totalStats = {
    labels: ['Người dùng', 'Loại sản phẩm', 'Sản phẩm', 'Bình luận', 'Đơn hàng', 'Khuyến mãi'],
    datasets: [{
      label: 'Số lượng',
      data: [
        counts.total_user,
        counts.total_category,
        counts.total_product,
        counts.total_comment,
        counts.total_order,
        counts.total_promotion || 0,
      ],
      backgroundColor: [
        '#007bff', '#28a745', '#ffc107', '#dc3545', '#6610f2', '#212529',
      ],
      borderRadius: 5,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: ctx => ` ${ctx.parsed.y} mục`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Số lượng' },
      },
      x: {
        title: { display: true, text: 'Loại thống kê' },
      },
    },
  };

  const statsCards = [
    { key: 'total_user', icon: <FaUsers size={24} />, label: 'Người dùng', bg: 'bg-info' },
    { key: 'total_category', icon: <FaListAlt size={24} />, label: 'Loại sản phẩm', bg: 'bg-success' },
    { key: 'total_product', icon: <FaCoffee size={24} />, label: 'Sản phẩm', bg: 'bg-warning' },
    { key: 'total_comment', icon: <FaComments size={24} />, label: 'Bình luận', bg: 'bg-danger' },
    { key: 'total_order', icon: <FaShoppingCart size={24} />, label: 'Đơn hàng', bg: 'bg-secondary' },
    { key: 'total_promotion', icon: <FaTag size={24} />, label: 'Khuyến mãi', bg: 'bg-dark' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-breadcrumb">
        <div className="row">
          <div className="col-12 d-flex no-block align-items-center">
            <div className="ms-auto text-end">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Thống kê</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row g-3">
          {statsCards.map(({ key, icon, label, bg }, idx) => (
            <div className="col-6 col-md-4 col-lg-2" key={idx}>
              <div className="card border-0 shadow-sm rounded-2">
                <div
                  className={`text-white text-center ${bg} rounded-2 py-3`}
                  title={label}
                  onMouseEnter={(e) => {
                    e.currentTarget.classList.add('shadow');
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transition = 'all 0.2s ease';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.classList.remove('shadow');
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                    <span className="fs-4">{counts[key]}</span>
                    <span>{icon}</span>
                  </div>
                  <div className="text-uppercase fw-semibold small">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card h-100">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="mb-0">Biểu đồ doanh thu</h5>
                <div>
                  <select className="form-select form-select-sm" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} >
                    <option value="month">Theo tháng</option>
                    <option value="year">Theo năm</option>
                    <option value="custom">Tùy chọn</option>
                  </select>
                </div>
              </div>

              <div className="card-body">
                {timeRange === 'custom' && (
                  <div className="mb-3 row g-2 align-items-center">
                    <div className="col-auto">
                      <label htmlFor="fromDate" className="col-form-label">Từ ngày:</label>
                    </div>
                    <div className="col-auto">
                      <input type="date" id="fromDate" className="form-control form-control-sm" value={customRange.from} onChange={e => setCustomRange(prev => ({ ...prev, from: e.target.value }))} />
                    </div>
                    <div className="col-auto">
                      <label htmlFor="toDate" className="col-form-label">Đến ngày:</label>
                    </div>
                    <div className="col-auto">
                      <input type="date" id="toDate" className="form-control form-control-sm" value={customRange.to} onChange={e => setCustomRange(prev => ({ ...prev, to: e.target.value }))} />
                    </div>
                  </div>
                )}

                <Bar data={revenueData} options={barOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">Biểu đồ phân phối</div>
              <div className="card-body">
                <Pie data={pieData} />
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">Biểu đồ tổng quan số lượng</div>
              <div className="card-body">
                <Bar data={totalStats} options={barOptions} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;