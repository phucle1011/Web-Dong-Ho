import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FaAngleDoubleLeft, FaChevronLeft, FaChevronRight, FaAngleDoubleRight, FaSearch, FaTrash } from 'react-icons/fa'; // Import FaTrash

function BrandList() {
    const [brands, setBrands] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const limit = 10;
    const searchInputRef = useRef(null);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [deletingBrandId, setDeletingBrandId] = useState(null); // State to store the ID of the brand being deleted

    useEffect(() => {
        fetchBrands(currentPage, filterStatus);
    }, [currentPage, filterStatus]);

    const fetchBrands = async (page, status = 'all') => {
        setLoading(true);
        let url = `${Constants.DOMAIN_API}/admin/brand/list?page=${page}&limit=${limit}`;
        if (status !== 'all') {
            url = `${Constants.DOMAIN_API}/admin/brand/${status}?page=${page}&limit=${limit}`;
        }
        try {
            const res = await axios.get(url);
            setBrands(res.data.data);
            setTotalPages(res.data.totalPages);
            if (!isSearching) {
                setSearchResults([]);
                setSearchError('');
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thương hiệu:", error);
            toast.error("Lỗi khi tải danh sách thương hiệu");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (brandId, newStatus) => {
        const brand = brands.find(b => b.id === brandId);
        if (!brand) return;

        Swal.fire({
            title: 'Xác nhận đổi trạng thái',
            text: `Bạn có chắc chắn muốn đổi trạng thái của thương hiệu "${brand.name}" thành "${getVietnameseStatus(newStatus)}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Vâng, đổi!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    axios.put(`${Constants.DOMAIN_API}/admin/brand/update/${brandId}`, { status: newStatus })
                        .then(response => {
                            toast.success(`Cập nhật trạng thái thành công thành: ${getVietnameseStatus(newStatus)}`);
                            fetchBrands(currentPage, filterStatus);
                        })
                        .catch(error => {
                            console.error("Lỗi khi cập nhật trạng thái thương hiệu:", error);
                            toast.error("Lỗi khi cập nhật trạng thái thương hiệu");
                        });
                } catch (error) {
                    console.error("Lỗi không mong muốn:", error);
                    toast.error("Đã có lỗi xảy ra");
                }
            }
        });
    };

    const getVietnameseStatus = (englishStatus) => {
        switch (englishStatus) {
            case "active":
                return "Hoạt động";
            case "inactive":
                return "Ngưng hoạt động";
            default:
                return englishStatus;
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsSearching(false);
    };

    const handleSearchSubmit = async () => {
        if (searchTerm.trim() === '') {
            toast.warning("Vui lòng nhập tên hoặc quốc gia của thương hiệu cần tìm.");
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        setCurrentPage(1);
        setLoading(true);
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/brand/search?searchTerm=${searchTerm}&page=${1}&limit=${limit}`);
            if (res.data.data.length === 0) {
                toast.warning("Không tìm thấy thương hiệu nào.");
                setSearchResults([]);
                setSearchError("Không tìm thấy thương hiệu nào.");
            } else {
                setSearchResults(res.data.data);
                setSearchError('');
            }
            setTotalPages(res.data.totalPages);
            setShowDropdown(false);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm thương hiệu:", error);
            toast.error("Không tìm thấy thương hiệu");
            setSearchResults([]);
            setTotalPages(1);
            setSearchError("Không tìm thấy thương hiệu.");
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setShowDropdown(false);
        setCurrentPage(1);
        setIsSearching(false);
        fetchBrands(1, filterStatus);
        setSearchError('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleSelectBrand = (brandId) => {
        navigate(`/admin/brand/detail/${brandId}`);
        setSearchTerm('');
        setSearchResults([]);
        setShowDropdown(false);
        setSearchError('');
        setIsSearching(false);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const shortenDescription = (description, maxLength = 50) => {
        if (!description) return "";
        if (description.length > maxLength) {
            return description.substring(0, maxLength) + "...";
        }
        return description;
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
    };

    const handleDeleteBrand = (brandId) => {
        setDeletingBrandId(brandId); // Set the ID of the brand to be deleted
        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa thương hiệu này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Vâng, xóa!',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                // User confirmed, proceed with deletion
                performDeleteBrand(brandId);
            } else {
                setDeletingBrandId(null); // Reset deletingBrandId if the user cancels
            }
        });
    };

    const performDeleteBrand = async (brandId) => {
        try {
            const response = await axios.delete(`${Constants.DOMAIN_API}/admin/brand/delete/${brandId}`);
            toast.success('Xóa thương hiệu thành công!');
            fetchBrands(currentPage, filterStatus); // Refresh the brand list
        } catch (error) {
            console.error('Lỗi khi xóa thương hiệu:', error);
            toast.error('Lỗi khi xóa thương hiệu!');
        } finally {
            setDeletingBrandId(null);
        }
    };

    return (
        <div className="container mx-auto p-2">
            <div className="bg-white p-4 shadow rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold mb-4">Danh sách thương hiệu</h2>
                    <Link
                        to="/admin/brand/Create"
                        className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
                    >
                        + Thêm thương hiệu
                    </Link>
                </div>
                <div className="mb-4 relative flex">
                    <input
                        type="text"
                        className="shadow border border-gray-300 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tìm kiếm theo tên hoặc quốc gia..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        ref={searchInputRef}
                    />
                    <button
                        type="button"
                        className="bg-blue-900 hover:bg-blue-800 text-white px-4 rounded ml-2"
                        onClick={handleSearchSubmit}
                    >
                        <FaSearch className="w-5 h-5" />
                    </button>

                    {searchTerm.trim() !== '' && isSearching && searchResults.length > 0 && (
                        <button
                            onClick={handleClearSearch}
                            className="ms-2 p-2 border flex gap-2 bg-blue-900 hover:bg-blue-800 text-white py-1 px-3 rounded"
                        >
                            Xem tất cả
                        </button>
                    )}
                </div>

                {/* Thêm các nút lọc trạng thái */}
                <div className="mb-4">
                    <button
                        onClick={() => handleFilterChange('all')}
                        className={`px-4 py-2 rounded ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => handleFilterChange('active')}
                        className={`px-4 py-2 rounded ml-2 ${filterStatus === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Hoạt động
                    </button>
                    <button
                        onClick={() => handleFilterChange('inactive')}
                        className={`px-4 py-2 rounded ml-2 ${filterStatus === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Ngừng hoạt động
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">Đang tải dữ liệu...</div>
                ) : (
                    <>
                        <table className="w-full border-collapse border border-gray-300 mt-3">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 border">#</th>
                                    <th className="p-2 border">Tên</th>
                                    <th className="p-2 border">Quốc gia</th>
                                    <th className="p-2 border">Logo</th>
                                    <th className="p-2 border">Mô tả</th>
                                    <th className="p-2 border">Trạng thái</th>
                                    <th className="p-2 border">Ngày tạo</th>
                                    <th className="p-2 border">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(isSearching ? searchResults : brands).map((brand, index) => (
                                    <tr key={brand.id} className="border-b">
                                        <td className="p-2 border">{(currentPage - 1) * limit + index + 1}</td>
                                        <td className="p-2 border">{brand.name}</td>
                                        <td className="p-2 border">{brand.country}</td>
                                        <td className="p-2 border">
                                            <img src={`${Constants.DOMAIN_API}/uploads/${brand.logo}`} alt={brand.name} className="w-16 h-16 object-cover rounded-full" />
                                        </td>
                                        <td
                                            className="p-2 border cursor-pointer"
                                            onClick={() => openDescriptionDialog(brand.description)}
                                            title="Nhấn để xem đầy đủ mô tả"
                                        >
                                            {shortenDescription(brand.description)}
                                        </td>
                                        <td className="p-2 border">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={brand.status}
                                                    onChange={(e) => handleStatusChange(brand.id, e.target.value)}
                                                    className="border rounded px-2 py-1"
                                                >
                                                    <option value="active">Hoạt động</option>
                                                    <option value="inactive">Ngưng hoạt động</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-2 border">{new Date(brand.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
                                        <td className="p-2 border text-center align-middle">
                                            <div className="flex items-center justify-center gap-2"> {/* Added a wrapping div for buttons */}
                                                <Link
                                                    to={`/admin/brand/detail/${brand.id}`}
                                                    className="bg-blue-500 text-white py-1 px-3 rounded"
                                                >
                                                    Xem
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
                                ))}
                                {searchError && isSearching && (
                                    <tr><td colSpan="8" className="p-4 text-center text-red-500">{searchError}</td></tr>
                                )}
                                {!isSearching && brands.length === 0 && !loading && (
                                    <tr><td colSpan="8" className="p-4 text-center">Không có thương hiệu nào.</td></tr>
                                )}
                                {isSearching && searchResults.length === 0 && !loading && searchError === '' && searchTerm.trim() !== '' && (
                                    <tr><td colSpan="8" className="p-4 text-center">Không tìm thấy thương hiệu nào.</td></tr>
                                )}
                            </tbody>
                        </table>

                        <div className="flex justify-center mt-4 items-center">
                            {!isSearching && totalPages > 1 && (
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
                            )}
                            {isSearching && searchResults.length > 0 && totalPages > 1 && (
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
                            )}
                        </div>
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
