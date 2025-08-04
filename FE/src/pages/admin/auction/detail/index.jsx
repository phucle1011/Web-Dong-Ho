import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";

export default function AdminAuctionWinnerOnly() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [winnerData, setWinnerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${Constants.DOMAIN_API}/admin/auctions/winners/${id}`
                );
                const data = res.data.data;
                setAuction(data.auction);
                setWinnerData(data.winner ? { winner: data.winner, winningBid: data.winningBid } : null);
            } catch (err) {
                setError(err.response?.data?.message || "Lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    if (loading) return <div className="p-4 text-center">Đang tải...</div>;
    if (error) return <div className="p-4 text-center text-red-600">Lỗi: {error}</div>;

    return (
        <>
            <div className="container mx-auto p-4">
                <h2 className="text-xl font-semibold mb-4">
                    Phiên đấu giá #{id}
                </h2>

                {auction && auction.variant && auction.variant.product && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                        <p>
                            <strong>Sản phẩm:</strong>{" "}
                            {auction.variant.product.name}{" "}
                            <span className="text-sm text-gray-600">( {auction.variant.sku.trim()})</span>
                        </p>
                        <p>
                            <strong>Thời gian kết thúc:</strong>{" "}
                            {auction.end_time.replace("T", " ").substring(0, 19)}
                        </p>
                        <p>
                            <strong>Bước giá:</strong>{" "}
                            {Number(auction.priceStep).toLocaleString("vi-VN")}₫
                        </p>
                    </div>
                )}

                {winnerData ? (
                    <table className="w-full border-collapse border text-center">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">Tên người chiến thắng</th>
                                <th className="border p-2">Email</th>
                                <th className="border p-2">Số tiền thắng</th>
                                <th className="border p-2">Thời gian đặt giá</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-4 py-2">{winnerData.winner.name}</td>
                                <td className="border px-4 py-2">{winnerData.winner.email}</td>
                                <td className="border px-4 py-2">
                                    {Number(winnerData.winningBid.bidAmount).toLocaleString("vi-VN")}₫
                                </td>
                                <td className="border px-4 py-2">
                                    {winnerData.winningBid.bidTime.replace("T", " ").substring(0, 19)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                        Không có người chiến thắng
                    </div>
                )}
            </div>
            <div className="mt-4 flex gap-4 no-print">
                <button
                    onClick={() => navigate("/admin/auctions/getAll")}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ms-3"
                >
                    Quay lại
                </button>
            </div>
        </>
    );
}
