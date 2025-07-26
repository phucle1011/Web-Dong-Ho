import axios from "axios";
import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { BiMoneyWithdraw, BiPlusCircle } from "react-icons/bi";
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
  const [banks, setBanks] = useState([]);
  const [showTopUpInput, setShowTopUpInput] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  useEffect(() => {
    fetchWallets();
    fetchBanks();
  }, []);

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

  const fetchBanks = async () => {
    try {
      const res = await axios.get("https://api.vietqr.io/v2/banks");
      if (res.data.code === "00") {
        setBanks(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách ngân hàng:", err);
    }
  };

  const formatCurrency = (amount) => {
    return parseInt(amount).toLocaleString("vi-VN") + " ₫";
  };

  const handleTopUp = async () => {
    const amountInt = parseInt(topUpAmount);

    if (!topUpAmount || isNaN(amountInt)) {
      toast.warning('Vui lòng nhập số tiền hợp lệ.');
      return;
    }

    if (amountInt < 13000) {
      toast.warning('Vui lòng nhập số tiền tối thiểu 13,000₫ để nạp.');
      return;
    }

    if (amountInt > 99999999) {
      toast.warning('Số tiền tối đa cho mỗi lần nạp là 99,999,999₫.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `${Constants.DOMAIN_API}/wallet/topup`,
        { amount: parseInt(topUpAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Lỗi tạo phiên Stripe:", error);
      toast.error("Không thể tạo phiên thanh toán Stripe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !selectedBank || !bankAccount) {
      toast.warning("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (!/^\d{6,20}$/.test(bankAccount)) {
      toast.warning("Số tài khoản ngân hàng không hợp lệ.");
      return;
    }

    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.warning("Số tiền rút không hợp lệ.");
      return;
    }

    if (amount > balance - pending) {
      toast.warning(`Số tiền rút vượt quá số dư khả dụng: ${formatCurrency(balance - pending)}.`);
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
          <p>Bạn xác nhận thông tin rút tiền là <strong>chính xác</strong>?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      reverseButtons: true,
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
        { headers: { Authorization: `Bearer ${token}` } }
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

const handleChange = (e) => {
  const raw = e.target.value;
  const unformatted = raw.replace(/\D/g, "");
  const formatted = formatCurrency(unformatted);
   setValue("amount", formatted);}

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <header className="bg-orange-500 text-white px-6 py-6 rounded-b-3xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
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
      </header>

      <section className="bg-white shadow-lg rounded-xl -mt-4 mx-4 sm:mx-auto max-w-2xl flex justify-center text-center">
        <ActionButton
          icon={<BiPlusCircle size={22} />}
          label="Nạp tiền"
          onClick={() => setShowTopUpInput((prev) => !prev)}
        />

        <ActionButton icon={<BiMoneyWithdraw size={22} />} label="Rút tiền" />
      </section>

      {showTopUpInput && (
        <div className="mt-4 max-w-2xl mx-auto px-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Nhập số tiền cần nạp</h3>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Nhập số tiền"
              className="border border-gray-300 rounded px-3 py-2 w-full mb-3"
              min="13000"
              step="1000"
              max="99999999"
            />
            
            <div className="flex gap-2 justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => {
                  setShowTopUpInput(false);
                  setTopUpAmount('');
                }}
              >
                Hủy
              </button>
              <button
                className="bg-[#1868D5] text-white px-4 py-2 rounded hover:opacity-90"
                onClick={handleTopUp}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mt-8 px-4 sm:px-0 max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-center mb-6">Thông tin ví</h2>

          {withdrawRequests.filter(req => req.status === "pending").length > 0 ? (
            <ul className="mt-2 divide-y text-xs text-gray-600 border rounded overflow-hidden max-h-[250px] overflow-y-auto">
              {withdrawRequests
                .filter(req => req.status === "pending")
                .slice()
                .reverse()
                .map((req) => (
                  <li key={req.id} className="px-3 py-2 bg-white flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">Ngân hàng: {req.bank_name?.toUpperCase()}</p>
                      <p className="text-gray-500">STK: {req.bank_account}</p>
                      {req.note && <p className="text-gray-400 italic text-xs">"{req.note}"</p>}
                      <p className="text-gray-500">Hình thức: {getTypeLabel(req.type)}</p>
                    </div>
                    <span className="font-semibold text-yellow-600">{formatCurrency(req.amount)}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-xs">Không có yêu cầu đang chờ.</p>
          )}

          <hr className="my-6" />

          <div className="space-y-3">
            <input
              type="number"
              placeholder="Số tiền cần rút..."
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full rounded border px-3 py-2"
            >
              <option value="">Chọn ngân hàng</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.shortName || bank.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Số tài khoản"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <textarea
              placeholder="Ghi chú (không bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            <button
              className={`w-full rounded px-4 py-2 text-white ${hasPendingWithdraw ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
              onClick={handleWithdraw}
              disabled={isSubmitting || hasPendingWithdraw}
            >
              {hasPendingWithdraw
                ? "Đang chờ duyệt..."
                : isSubmitting
                  ? "Đang xử lý..."
                  : "Rút tiền"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      className="flex flex-col items-center gap-1 py-5 hover:text-orange-500 w-full"
      onClick={onClick}
    >
      <div className="w-11 h-11 flex items-center justify-center bg-orange-100 rounded-full">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}