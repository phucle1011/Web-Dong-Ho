import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Constants from "../../../../Constants.jsx";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from 'sweetalert2';

function PromotionList() {
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (selectedPromotionId) {
      fetchCustomersByPromotion(selectedPromotionId);
    } else {
      setCustomers([]);
    }
    setSelectedCustomerIds([]);
    setCurrentPage(1);
    setSearchTerm("");
    setSearchInput("");
  }, [selectedPromotionId]);

  const fetchPromotions = async () => {
    setLoadingPromotions(true);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotions/list`);
      const data = res.data.data || [];
      const specialPromotions = data.filter((promo) => promo.special_promotion);
      setPromotions(specialPromotions);
      if (specialPromotions.length > 0) setSelectedPromotionId(specialPromotions[0].id);
    } catch (err) {
      toast.error("Không thể tải danh sách mã giảm.");
    } finally {
      setLoadingPromotions(false);
    }
  };

  const fetchCustomersByPromotion = async (promotionId) => {
    setLoadingCustomers(true);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotionusers/list`, {
        params: { promotionId },
      });
      setCustomers(res.data.data || []);
    } catch {
      toast.error("Không thể tải danh sách khách hàng.");
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (cus) =>
        cus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cus.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  const handleCheckboxChange = (id) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    const idsOnPage = paginatedCustomers
      .filter((c) => !c.promotions.some((p) => p.promotionId === selectedPromotionId && p.used && p.isSpecialPromotion))
      .map((c) => c.id);
    if (e.target.checked) {
      setSelectedCustomerIds((prev) => [...new Set([...prev, ...idsOnPage])]);
    } else {
      setSelectedCustomerIds((prev) => prev.filter((id) => !idsOnPage.includes(id)));
    }
  };

  const handleSendEmails = async (useDefault = false) => {
    let subject = emailSubject;
    let content = emailContent;
    if (useDefault) {
      if (!selectedPromotion) return;
      subject = `Khuyến mãi: ${selectedPromotion.name || "Mã không tên"}`;
      content = `<p>Bạn nhận được khuyến mãi đặc biệt: <strong>${selectedPromotion.name}</strong></p>`;
    }

    if (!subject.trim() || !content.trim()) {
      toast.warning("Vui lòng nhập tiêu đề và nội dung email.");
      return;
    }
    if (selectedCustomerIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một khách hàng.");
      return;
    }

    if (selectedPromotion.status === 'expired' || selectedPromotion.status === 'inactive') {
      toast.error("Không thể gửi email vì mã giảm giá không hoạt động.");
      return;
    }

    setSendingEmail(true);
    try {
      await axios.post(`${Constants.DOMAIN_API}/admin/send-promotion-emails`, {
        customerIds: selectedCustomerIds,
        subject,
        content,
        promotionId: selectedPromotionId,
      });

      toast.success("Gửi email thành công!");
      setCustomers((prev) =>
        prev.map((c) =>
          selectedCustomerIds.includes(c.id)
            ? {
              ...c,
              promotions: c.promotions.map((p) =>
                p.promotionId === selectedPromotionId
                  ? { ...p, emailSent: true }
                  : p
              ),
            }
            : c
        )
      );
      setSelectedCustomerIds([]);
      setEmailSubject("");
      setEmailContent("");
      setIsEmailModalOpen(false);
    } catch {
      toast.error("Không thể gửi email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleQuickSendEmail = async (customerId) => {
    if (!selectedPromotionId) return;
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    if (selectedPromotion.status === 'expired' || selectedPromotion.status === 'inactive') {
      toast.error("Không thể gửi email vì mã giảm giá không hoạt động.");
      return;
    }

    const promotionStatus = customer.promotions.find((p) => p.promotionId === selectedPromotionId);
    if (promotionStatus?.used) {
      toast.error("Không thể gửi email vì khách hàng đã sử dụng mã giảm giá này.");
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận gửi mail',
      text: `Gửi mail khuyến mãi tới ${customer.name} (${customer.email})?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Gửi',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) return;

    setSendingEmail(true);
    try {
      await axios.post(`${Constants.DOMAIN_API}/admin/send-promotion-emails`, {
        customerIds: [customerId],
        subject: `Khuyến mãi: ${selectedPromotion?.name || ""}`,
        content: `<p>Bạn nhận được khuyến mãi đặc biệt: <strong>${selectedPromotion?.name}</strong></p>`,
        promotionId: selectedPromotionId,
      });
      toast.success(`Đã gửi mail cho ${customer.email}`);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
              ...c,
              promotions: c.promotions.map((p) =>
                p.promotionId === selectedPromotionId
                  ? { ...p, emailSent: true }
                  : p
              ),
            }
            : c
        )
      );
    } catch (err) {
      toast.error("Không thể gửi email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const selectedPromotion = promotions.find((p) => p.id === selectedPromotionId);
  const promotionTitle = selectedPromotion
    ? `cho mã giảm (${selectedPromotion.name || "Mã không tên"} - ${selectedPromotion.status})`
    : "";

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow rounded-lg flex gap-8 min-h-[600px]">
      <div className="w-1/3 border rounded-lg shadow-sm p-4 flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">
          Danh sách mã giảm giá đặc biệt
        </h3>
        {loadingPromotions ? (
          <div className="text-center text-gray-500 mt-10">Đang tải...</div>
        ) : promotions.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Không có mã giảm đặc biệt.</div>
        ) : (
          <ul className="overflow-auto max-h-[460px] custom-scrollbar pr-2">
            {promotions.map((promo) => (
              <li
                key={promo.id}
                onClick={() => setSelectedPromotionId(promo.id)}
                className={`cursor-pointer p-3 mb-2 rounded-lg transition-colors ${selectedPromotionId === promo.id ? "bg-blue-100 shadow" : "hover:bg-blue-50"
                  } ${promo.status === 'expired' || promo.status === 'inactive' ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-base text-blue-900">
                      {promo.name || "Mã không tên"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {promo.discount_value !== undefined
                        ? promo.discount_type === "percentage"
                          ? `Giảm ${promo.discount_value}%`
                          : `Giảm ${promo.discount_value.toLocaleString()}đ`
                        : "Chưa xác định"}
                      <div className="text-xs text-gray-500">
                        Trạng thái: {promo.status}
                        {promo.code && (
                          <div className="text-xs text-blue-600">
                            Mã: <span className="font-medium">{promo.code}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {promo.status === 'expired' && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Hết hạn
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="w-2/3 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Danh sách khách hàng {promotionTitle}
          </h3>
          <div className="flex gap-2">
            <button
              className={`bg-blue-600 text-white px-3 py-2 rounded-md font-semibold transition-opacity ${selectedCustomerIds.length === 0 ||
                selectedPromotion?.status === 'expired' ||
                selectedPromotion?.status === 'inactive'
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
                }`}
              onClick={() => handleSendEmails(true)}
              disabled={
                selectedCustomerIds.length === 0 ||
                selectedPromotion?.status === 'expired' ||
                selectedPromotion?.status === 'inactive'
              }
            >
              Gửi Email ({selectedCustomerIds.length})
            </button>
            <button
              className={`bg-green-600 text-white px-3 py-2 rounded-md font-semibold transition-opacity ${selectedCustomerIds.length === 0 ||
                selectedPromotion?.status === 'expired' ||
                selectedPromotion?.status === 'inactive'
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-700"
                }`}
              onClick={() => setIsEmailModalOpen(true)}
              disabled={
                selectedCustomerIds.length === 0 ||
                selectedPromotion?.status === 'expired' ||
                selectedPromotion?.status === 'inactive'
              }
            >
              Soạn Email ({selectedCustomerIds.length})
            </button>
          </div>
        </div>

        <div className="flex mb-3 gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow p-2 border rounded-md"
            placeholder="Tìm kiếm theo tên hoặc email..."
          />
          <button
            onClick={handleSearch}
            className="bg-[#073272] hover:bg-[#05224f] text-white px-4 py-2 text-sm rounded"
          >
            Tìm kiếm
          </button>
        </div>
        {loadingCustomers ? (
          <div className="text-center text-gray-500 mt-10">Đang tải...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center text-gray-400 mt-16">Không tìm thấy khách hàng.</div>
        ) : (
          <>
            <div className="overflow-auto border rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="border p-2 w-10">#</th>
                    <th className="p-3 text-center w-12">
                      <input
                        type="checkbox"
                        checked={paginatedCustomers
                          .filter((c) => !c.promotions.some((p) => p.promotionId === selectedPromotionId && p.used && p.isSpecialPromotion))
                          .every((c) => selectedCustomerIds.includes(c.id))}
                        onChange={handleSelectAll}
                        disabled={selectedPromotion?.status === 'expired' || selectedPromotion?.status === 'inactive'}
                      />
                    </th>
                    <th className="border p-2">Tên</th>
                    <th className="border p-2">Email</th>
                    <th className="border p-2">Số điện thoại</th>
                    <th className="border p-2 w-32">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedCustomers.map((cus, index) => (
                    <tr
                      key={cus.id}
                      className={`hover:bg-gray-50 ${selectedCustomerIds.includes(cus.id) ? "bg-blue-50" : ""}`}
                    >
                      <td className="border p-1 text-center">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCustomerIds.includes(cus.id)}
                          onChange={() => handleCheckboxChange(cus.id)}
                          disabled={
                            selectedPromotion?.status === 'expired' ||
                            selectedPromotion?.status === 'inactive' ||
                            cus.promotions.some(
                              (p) => p.promotionId === selectedPromotionId && p.used && p.isSpecialPromotion
                            )
                          }
                        />
                      </td>
                      <td className="border p-2 text-center">{cus.name}</td>
                      <td className="border p-2 text-center">{cus.email}</td>
                      <td className="border p-2 text-center">{cus.phone}</td>
                      <td className="border p-1 text-center">
                        {cus.promotions.some(
                          (p) => p.promotionId === selectedPromotionId && p.used && p.isSpecialPromotion
                        ) ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Đã sử dụng
                          </span>
                        ) : cus.promotions.some(
                          (p) => p.promotionId === selectedPromotionId && p.emailSent
                        ) ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Đã gửi
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickSendEmail(cus.id)}
                            className={`px-3 py-1 rounded text-sm text-white ${selectedPromotion?.status === 'expired' ||
                              selectedPromotion?.status === 'inactive' ||
                              cus.promotions.some((p) => p.promotionId === selectedPromotionId && p.used && p.isSpecialPromotion)
                              ? "bg-gray-500 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                              }`}
                            disabled={
                              selectedPromotion?.status === 'expired' ||
                              selectedPromotion?.status === 'inactive' ||
                              cus.promotions.some((p) => p.promotionId === selectedPromotionId && p.used && p.isSpecialPromotion)
                            }
                          >
                            Gửi email
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-2 border rounded-md bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <FaAngleDoubleLeft />
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-2 border rounded-md bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <FaChevronLeft />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (page >= currentPage - 1 && page <= currentPage + 1) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-md ${page === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  return null;
                })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 py-2 border rounded-md bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <FaChevronRight />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-2 border rounded-md bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <FaAngleDoubleRight />
                </button>
              </div>
            </div>
          </>
        )}

        {isEmailModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-auto">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Soạn email {promotionTitle}</h3>
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề email"
                  disabled={selectedPromotion?.status === 'expired' || selectedPromotion?.status === 'inactive'}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-1">Nội dung</label>
                <ReactQuill
                  theme="snow"
                  value={emailContent}
                  onChange={setEmailContent}
                  className="h-48"
                  readOnly={selectedPromotion?.status === 'expired' || selectedPromotion?.status === 'inactive'}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
                  onClick={() => setIsEmailModalOpen(false)}
                  disabled={sendingEmail}
                >
                  Hủy bỏ
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-white ${selectedPromotion?.status === 'expired' || selectedPromotion?.status === 'inactive' || sendingEmail
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  onClick={() => handleSendEmails(false)}
                  disabled={
                    selectedPromotion?.status === 'expired' || selectedPromotion?.status === 'inactive' || sendingEmail
                  }
                >
                  {sendingEmail ? "Đang gửi..." : "Gửi email"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromotionList;