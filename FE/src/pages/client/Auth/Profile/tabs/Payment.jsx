import axios from "axios";
import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiPlusCircle } from "react-icons/fi";
import { BiMoneyWithdraw } from "react-icons/bi";
import Constants from "../../../../../Constants.jsx";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function Payment() {
  const token = localStorage.getItem("token");

  const [showBalance, setShowBalance] = useState(false);
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [hasPendingWithdraw, setHasPendingWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawRequests, setWithdrawRequests] = useState([]);

  const fetchWallets = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/wallets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || [];

      if (data.length > 0) {
        const wallet = data[0];
        setBalance(parseInt(wallet.balance || 0));
        setWithdrawRequests(wallet.withdrawRequests || []);

        const pendingAmount = wallet.withdrawRequests
          ?.filter((req) => req.status === "pending" && req.type === "withdraw")
          .reduce((sum, req) => sum + parseInt(req.amount || 0), 0);

        setPending(pendingAmount || 0);

        const pendingWithdraw = wallet.withdrawRequests?.find(
          (req) => req.status === "pending" && req.type === "withdraw"
        );
        setHasPendingWithdraw(!!pendingWithdraw);
      }
    } catch (err) {
      console.error("Lỗi khi tải ví:", err);
      toast.error("Không thể tải thông tin ví.");
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const formatCurrency = (amount) => {
    return parseInt(amount).toLocaleString("vi-VN") + " ₫";
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !selectedBank || !bankAccount) {
      toast.warning("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (!/^\d{6,20}$/.test(bankAccount)) {
      toast.warning("Số tài khoản ngân hàng không hợp lệ. Phải là số và tối thiểu 6 chữ số.");
      return;
    }

    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.warning("Số tiền rút không hợp lệ.");
      return;
    }

    if (amount > balance - pending) {
      toast.warning(`Số tiền rút vượt quá số dư khả dụng. Số dư khả dụng: ${formatCurrency(balance - pending)}.`);
      return;
    }

    const confirm = await Swal.fire({
      title: "Xác nhận thông tin",
      icon: "warning",
      html: `
      <div style="text-align:left">
        <p><strong>Số tiền:</strong> ${formatCurrency(amount)}</p>
        <p><strong>Ngân hàng:</strong> ${selectedBank.toUpperCase()}</p>
        <p><strong>Số tài khoản:</strong> ${bankAccount}</p>
        <br/>
        <p>Bạn xác nhận thông tin rút tiền là <strong>chính xác</strong> và <strong>chịu trách nhiệm nếu sai</strong>?</p>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      reverseButtons: true
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `${Constants.DOMAIN_API}/wallets/transactions`,
        {
          amount,
          method: selectedBank,
          bank_account: bankAccount,
          bank_name: selectedBank,
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message || "Yêu cầu rút tiền đã gửi.");
      setWithdrawAmount("");
      setSelectedBank("");
      setBankAccount("");
      setNote("");
      fetchWallets();
    } catch (err) {
      console.error("Lỗi rút tiền:", err);
      toast.error("Rút tiền thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "withdraw":
        return "Rút tiền";
      case "refund":
        return "Hoàn tiền";
      default:
        return "Không xác định";
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <header className="bg-orange-500 text-white px-6 py-6 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-wide text-sm opacity-90">
              Tổng số dư&nbsp;&gt;
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowBalance(!showBalance)} className="p-0.5">
                {showBalance ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
              <p className="text-sm font-medium leading-none">
                {showBalance ? formatCurrency(balance) : "*** ₫"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white shadow-lg rounded-xl -mt-4 mx-4 sm:mx-auto max-w-2xl flex justify-center text-center">
        <ActionButton icon={<BiMoneyWithdraw size={22} />} label="Rút tiền" />
      </section>

      <main className="mt-8 px-4 sm:px-0 max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-center mb-6">Thông tin ví</h2>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Đang chờ xử lý:</span>
            </div>

            {withdrawRequests.filter(req => req.status === "pending").length > 0 ? (
              <ul className="mt-2 divide-y text-xs text-gray-600 border rounded overflow-hidden max-h-[250px] overflow-y-auto">
                {withdrawRequests
                  .filter(req => req.status === "pending")
                  .slice()
                  .reverse()
                  .map((req) => (
                    <li key={req.id} className="px-3 py-2 bg-white hover:bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">Tên ngân hàng: {req.bank_name?.toUpperCase() || "Ngân hàng"}</p>
                        <p className="text-gray-500">Số tài khoản: {req.bank_account}</p>
                        {req.note && <p className="text-gray-400 italic text-xs">Ghi chú: "{req.note}"</p>}
                        <p className="text-gray-500">Hình thức: {getTypeLabel(req.type)}</p>
                      </div>
                      <span className="text-right font-semibold text-yellow-600">
                        {formatCurrency(req.amount)}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic text-xs mt-1">Không có yêu cầu nào đang chờ.</p>
            )}
          </div>


          <hr className="my-6" />
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 text-sm mb-3">Yêu cầu rút tiền <span className="text-red-500">*</span>
            </span>
          </div>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Nhập số tiền cần rút..."
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full rounded-lg border px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#1868D5]"
            />

            <select
              className="w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#1868D5]"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              <option value="" disabled>
                Chọn ngân hàng
              </option>
              <option value="vietcombank">Vietcombank</option>
              <option value="techcombank">Techcombank</option>
              <option value="vpbank">VPBank</option>
              <option value="mbbank">MBBank</option>
              <option value="bidv">BIDV</option>
              <option value="acb">ACB</option>
              <option value="agribank">Agribank</option>
              <option value="sacombank">Sacombank</option>
              <option value="shb">SHB</option>
            </select>

            <input
              type="text"
              placeholder="Nhập số tài khoản ngân hàng"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full rounded-lg border px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#1868D5]"
            />

            <textarea
              placeholder="Ghi chú (không bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-lg border px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#1868D5]"
            />

            <button
              className={`w-full rounded-lg px-4 py-1.5 text-white ${hasPendingWithdraw
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1868D5] hover:bg-[#1456b0]"
                }`}
              onClick={handleWithdraw}
              disabled={isSubmitting || hasPendingWithdraw}
            >
              {hasPendingWithdraw
                ? "Đang chờ duyệt..."
                : isSubmitting
                  ? "Đang gửi..."
                  : "Rút"}
            </button>
            {hasPendingWithdraw && (
              <p className="text-red-500 text-sm text-center mt-2">
                Bạn đã gửi yêu cầu rút tiền và đang chờ xử lý. Vui lòng chờ duyệt trước khi gửi yêu cầu mới.
              </p>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

function ActionButton({ icon, label }) {
  return (
    <button className="flex flex-col items-center gap-1 py-5 hover:text-orange-500 w-full focus:outline-none">
      <div className="w-11 h-11 flex items-center justify-center bg-orange-100 rounded-full">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
