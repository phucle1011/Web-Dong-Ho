import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from 'react-toastify';

function BusCreate() {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm();

    const navigate = useNavigate();
    const [busTypes, setBusTypes] = useState([]);
    const [selectedBusType, setSelectedBusType] = useState(null);
    const [errorMessage, setErrorMessage] = useState(""); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const busTypesRes = await axios.get(`${Constants.DOMAIN_API}/admin/busType/list`);

                if (Array.isArray(busTypesRes.data.data)) {
                    setBusTypes(busTypesRes.data.data);
                } else {
                    console.error("Dữ liệu busTypes không phải là mảng");
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu busTypes", error);
            }
        };

        fetchData();
    }, []);

    // Xử lý khi loại xe được chọn
    const handleBusTypeChange = (e) => {
        const selectedType = busTypes.find((type) => type.id === parseInt(e.target.value));
        setSelectedBusType(selectedType);

        if (selectedType) {
            // Cập nhật lại giá trị số ghế trong form
            setValue("totalSeats", selectedType.totalSeats); 
        }
    };

    const onSubmit = async (props) => {
        console.log("Dữ liệu nhập vào:", props);
    
        try {
            const res = await axios.post(`${Constants.DOMAIN_API}/admin/bus/add`, {
                plateNumber: props.plateNumber,
                busTypeId: `${props.busTypeId}`,
                status: props.status,
                totalSeats: props.totalSeats,
            });
    
            console.log("Success", res);
            navigate('/admin/bus/getAll');
            toast.success("Thêm thành công");
            setErrorMessage(""); // Reset lỗi khi thành công
        } catch (e) {
            console.error("Error", e);
            
            if (e.response && e.response.data && e.response.data.error) {
                toast.error(e.response.data.error); 
            } else {
                toast.error("Có lỗi xảy ra khi thêm xe. Vui lòng thử lại.");
            }
        }
    };
       

    return (
        <div className="container mx-auto p-4">
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold mb-2">Thêm xe Khách</h3>
        {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>} {/* Hiển thị thông báo lỗi chi tiết */}
        <form className="p-4 border rounded-md shadow-lg" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Biển số</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Vui lòng nhập biển số" id="plateNumber"
                    required
                    {...register("plateNumber", {
                        required: "Biển số không được để trống",
                    })}
                />
                {errors.plateNumber && <span className="text-danger">{errors.plateNumber.message}</span>}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Loại xe</label>
                <select className="w-full p-2 border rounded" id="busTypeId" required
                    {...register("busTypeId", {
                        required: "Loại xe không được để trống",
                    })}
                    onChange={handleBusTypeChange}>
                    <option value="">Chọn loại xe</option>
                    {busTypes.map((busType) => (
                        <option key={busType.id} value={busType.id}>
                            {busType.typeName}
                        </option>
                    ))}
                </select>
                {errors.busTypeId && <span className="text-danger">{errors.busTypeId.message}</span>}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Trạng thái</label>
                <select className="w-full p-2 border rounded" id="status" required
                    {...register("status", {
                        required: "Trạng thái không được để trống",
                    })}>
                    <option value="">Chọn trạng thái</option>
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Không hoạt động</option>
                </select>
                {errors.status && <span className="text-danger">{errors.status.message}</span>}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Số ghế</label>
                <input
                    type="number"
                    className="w-full p-2 border rounded"
                    placeholder="Vui lòng nhập số ghế"
                    id="totalSeats"
                    required
                    value={selectedBusType?.totalSeats || ''}
                    readOnly
                    {...register("totalSeats", {
                        required: "Số ghế không được để trống",
                        min: {
                            value: 1,
                            message: "Số ghế phải lớn hơn 0"
                        }
                    })}
                />
                {errors.totalSeats && <span className="text-danger">{errors.totalSeats.message}</span>}
            </div>
            <button type="submit" className="px-4 py-2 bg-[#073272] text-white rounded">
                Thêm xe
            </button>
        </form>
    </div>
</div>

    );
}

export default BusCreate;
