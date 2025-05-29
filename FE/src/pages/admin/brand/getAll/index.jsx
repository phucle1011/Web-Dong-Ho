import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import { FaAngleDoubleLeft, FaChevronLeft, FaChevronRight, FaAngleDoubleRight, FaSearch } from 'react-icons/fa';

function BrandList() {
    const [brands, setBrands] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const limit = 10;
    const searchInputRef = useRef(null);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [deletingBrandId, setDeletingBrandId] = useState(null);
    const [brandCounts, setBrandCounts] = useState({ all: 0, active: 0, inactive: 0 });

    useEffect(() => {
        if (isSearching && searchTerm.trim() !== '') {
            handleSearchSubmit(currentPage);
        } else {
            fetchBrands(currentPage, filterStatus);
        }
    }, [currentPage, filterStatus, isSearching]);

    const fetchBrands = async (page, status = '') => {
        setLoading(true);
        let url = `${Constants.DOMAIN_API}/admin/brand/list?page=${page}&limit=${limit}`;
        if (status) {
            url = `${Constants.DOMAIN_API}/admin/brand/${status}?page=${page}&limit=${limit}`;
        }
        try {
            const res = await axios.get(url);
            setBrands(res.data.data);
            setTotalPages(res.data.totalPages);
            if (res.data.counts) {
                setBrandCounts(res.data.counts);
            }
            setSearchError('');
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thương hiệu:", error);
            toast.error("Lỗi khi tải danh sách thương hiệu");
            setBrands([]);
            setTotalPages(1);
            setBrandCounts({ all: 0, active: 0, inactive: 0 });
            setSearchError("Không thể tải danh sách thương hiệu.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (brandId, newStatus) => {
        const brand = brands.find(b => b.id === brandId);
        if (!brand) return;

        Swal.fire({
            title: 'Xác nhận đổi trạng thái',
            text: `Bạn có chắc chắn muốn đổi trạng thái của thương hiệu ${brand.name} thành ${getVietnameseStatus(newStatus)}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(`${Constants.DOMAIN_API}/admin/brand/update/${brandId}`, { status: newStatus })
                    .then(response => {
                        toast.success(`Cập nhật trạng thái thành công thành: ${getVietnameseStatus(newStatus)}`);
                        if (response.data.counts) {
                            setBrandCounts(response.data.counts);
                        }
                        if (isSearching) {
                            handleSearchSubmit(currentPage);
                        } else {
                            fetchBrands(currentPage, filterStatus);
                        }
                    })
                    .catch(error => {
                        console.error("Lỗi khi cập nhật trạng thái thương hiệu:", error);
                        toast.error("Lỗi khi cập nhật trạng thái thương hiệu");
                    });
            }
        });
    };

    const getVietnameseStatus = (englishStatus) => {
        switch (englishStatus) {
            case "active":
                return "Hoạt động";
            case "inactive":
                return "Ngừng hoạt động";
            default:
                return englishStatus;
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim() === '') {
            setIsSearching(false);
            setSearchError('');
            setCurrentPage(1);
            fetchBrands(1, filterStatus);
        }
    };

    const handleSearchSubmit = async (page = 1) => {
        if (searchTerm.trim() === '') {
            toast.warning("Vui lòng nhập tên hoặc quốc gia của thương hiệu cần tìm.");
            setIsSearching(false);
            setSearchError('');
            return;
        }

        setIsSearching(true);
        setCurrentPage(page);
        setLoading(true);

        try {
            // Truyền thêm status vào query string nếu có
            const params = new URLSearchParams({
                searchTerm,
                page,
                limit
            });

            if (filterStatus) {
                params.append('status', filterStatus); // Gửi status nếu đang lọc
            }

            const res = await axios.get(`${Constants.DOMAIN_API}/admin/brand/search?${params.toString()}`);

            setBrands(res.data.data);
            setTotalPages(res.data.totalPages);

            if (res.data.data.length === 0) {
                setSearchError("Không tìm thấy thương hiệu nào phù hợp.");
            } else {
                setSearchError('');
            }

            if (res.data.counts) {
                setBrandCounts(res.data.counts);
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm thương hiệu:", error);
            toast.error("Không tìm thấy thương hiệu");
            setBrands([]);
            setTotalPages(1);
            setSearchError("Lỗi khi tìm kiếm thương hiệu. Vui lòng thử lại.");
            setBrandCounts({ all: 0, active: 0, inactive: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
        setCurrentPage(1);
        fetchBrands(1, filterStatus);
        setSearchError('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const shortenDescription = (description, maxLength = 50) => {
        if (!description) return "";
        if (description.length > maxLength) {
            return description.substring(0, maxLength);
        }
        return description; // Nếu ngắn hơn maxLength → trả về đầy đủ, không có '...'
    };

    const openDescriptionDialog = (description) => {
        setSelectedDescription(description);
    };

    const closeDescriptionDialog = () => {
        setSelectedDescription(null);
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
        setIsSearching(false);
        setSearchTerm('');
        setSearchError('');
    };

    const handleDeleteBrand = (brandId) => {
        setDeletingBrandId(brandId);
        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa thương hiệu này? Thao tác này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Vâng, xóa!',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                performDeleteBrand(brandId);
            } else {
                setDeletingBrandId(null);
            }
        });
    };

    const performDeleteBrand = async (brandId) => {
        try {
            const response = await axios.delete(`${Constants.DOMAIN_API}/admin/brand/delete/${brandId}`);
            toast.success('Xóa thương hiệu thành công!');
            if (response.data.counts) {
                setBrandCounts(response.data.counts);
            }
            if (isSearching) {
                handleSearchSubmit(currentPage);
            } else {
                fetchBrands(currentPage, filterStatus);
            }
        } catch (error) {
            console.error('Lỗi khi xóa thương hiệu:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi xóa thương hiệu!';
            toast.error(errorMessage);
        } finally {
            setDeletingBrandId(null);
        }
    };

    return (
        <div className="container mx-auto p-2">
            <div className="bg-white p-4 shadow rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Danh sách thương hiệu</h2>
                    <Link
                        to="/admin/brand/Create"
                        className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
                    >
                        + Thêm thương hiệu
                    </Link>
                </div>

                {/* Thanh tìm kiếm */}
                <div className="mb-4 relative flex">
                    <input
                        type="text"
                        className="shadow border border-gray-300 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tìm kiếm theo tên hoặc quốc gia..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        ref={searchInputRef}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchSubmit();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="bg-blue-900 hover:bg-blue-800 text-white px-4 rounded ml-2"
                        onClick={() => handleSearchSubmit()}
                    >
                        <FaSearch className="w-5 h-5" />
                    </button>
                </div>

                {/* Các nút lọc trạng thái */}
                <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 px-6 py-4">
                    {[
                        { key: "", label: "Tất cả", color: "bg-gray-300", textColor: "text-gray-700", countKey: "all" },
                        { key: "active", label: "Hoạt động", color: "bg-green-300", textColor: "text-green-800", countKey: "active" },
                        { key: "inactive", label: "Ngừng hoạt động", color: "bg-red-300", textColor: "text-red-800", countKey: "inactive" },
                    ].map(({ key, label, color, textColor, countKey }) => (
                        <button
                            key={key}
                            onClick={() => handleFilterChange(key)}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${filterStatus === key ? "bg-blue-900 text-white" : "bg-white text-gray-700"}`}
                        >
                            <span>{label}</span>
                            <span className={`${color} ${textColor} rounded-md px-2 py-0.5 text-xs font-semibold leading-none`}>
                                {brandCounts[countKey] || 0}
                            </span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-4">Đang tải dữ liệu...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300 mt-3 text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="w-12 px-6 py-3 border border-gray-300">#</th>
                                        <th className="px-6 py-3 border border-gray-300 font-semibold cursor-pointer">Tên thương hiệu</th>
                                        <th className="px-6 py-3 border border-gray-300 font-semibold">Quốc gia</th>
                                        <th className="px-6 py-3 border border-gray-300 font-semibold">Logo</th>
                                        <th className="px-6 py-3 border border-gray-300 font-semibold">Mô tả</th>
                                        <th className="px-6 py-3 border border-gray-300 font-semibold">Trạng thái</th>
                                        <th className="px-6 py-3 border border-gray-300 font-semibold">Ngày tạo</th>
                                        <th className="px-6 py-3 border border-gray-300 font-semibold">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {brands.length > 0 ? (
                                        brands.map((brand, index) => (
                                            <tr key={brand.id} className="border-b">
                                                <td className="p-2 border border-gray-300">{(currentPage - 1) * limit + index + 1}</td>
                                                <td className="p-2 border border-gray-300">{brand.name}</td>
                                                <td className="p-2 border border-gray-300">{brand.country}</td>
                                                <td className="p-2 border border-gray-300">
                                                    {brand.logo ? (
                                                        <img
                                                            src={brand.logo}
                                                            alt={brand.name}
                                                            className="w-16 h-16 object-cover rounded-full"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-500">Không có logo</span>
                                                    )}
                                                </td>
                                                <td className="p-2 border border-gray-300">
                                                    {brand.description && brand.description.length > 50 ? (
                                                        <span
                                                            className="cursor-pointer hover:underline"
                                                            onClick={() => openDescriptionDialog(brand.description)}
                                                            title="Nhấn để xem đầy đủ mô tả"
                                                        >
                                                            {shortenDescription(brand.description)}...
                                                            <span className="text-blue-600 ml-1">Xem thêm</span>
                                                        </span>
                                                    ) : (
                                                        brand.description || ""
                                                    )}
                                                </td>
                                                <td className="p-2 border border-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={brand.status}
                                                            onChange={(e) => handleStatusChange(brand.id, e.target.value)}
                                                            className="capitalize border rounded px-2 py-1"
                                                        >
                                                            <option value="active">Hoạt động</option>
                                                            <option value="inactive">Ngừng hoạt động</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="p-2 border border-gray-300">{new Date(brand.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
                                                <td className="p-2 border border-gray-300 text-center align-middle">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            to={`/admin/brand/detail/${brand.id}`}
                                                            className="bg-blue-500 text-white py-1 px-3 rounded flex items-center justify-center"
                                                            title="Chi tiết"
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteBrand(brand.id)}
                                                            className="bg-red-500 text-white py-1 px-3 rounded"
                                                            disabled={deletingBrandId === brand.id}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="p-4 text-center text-red-600">
                                                {searchError || "Không có thương hiệu nào để hiển thị."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Phân trang */}
                        {totalPages >= 1 && (
                            <div className="flex justify-center mt-4 items-center">
                                <div className="flex items-center space-x-1">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(1)}
                                        className="px-2 py-1 border rounded disabled:opacity-50"
                                    >
                                        <FaAngleDoubleLeft />
                                    </button>
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className="px-2 py-1 border rounded disabled:opacity-50"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    {currentPage > 2 && (
                                        <>
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                className="px-3 py-1 border rounded"
                                            >
                                                1
                                            </button>
                                            {currentPage > 3 && <span className="px-2">...</span>}
                                        </>
                                    )}
                                    {[...Array(totalPages)].map((_, i) => {
                                        const page = i + 1;
                                        if (page >= currentPage - 1 && page <= currentPage + 1) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-1 border rounded ${currentPage === page
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-blue-100 text-black hover:bg-blue-200"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        }
                                        return null;
                                    })}
                                    {currentPage < totalPages - 1 && (
                                        <>
                                            {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                className="px-3 py-1 border rounded"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className="px-2 py-1 border rounded disabled:opacity-50"
                                    >
                                        <FaChevronRight />
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(totalPages)}
                                        className="px-2 py-1 border rounded disabled:opacity-50"
                                    >
                                        <FaAngleDoubleRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Dialog hiển thị mô tả đầy đủ */}
            {selectedDescription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-md p-6 w-1/2 max-w-lg">
                        <h2 className="text-lg font-semibold mb-2">Mô tả đầy đủ</h2>
                        <p className="text-gray-700 whitespace-pre-line">{selectedDescription}</p>
                        <button
                            onClick={closeDescriptionDialog}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mt-4"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BrandList;