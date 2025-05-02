import { FaSave } from 'react-icons/fa';
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router";
import Constants from "../../../../Constants.jsx";
import { toast } from 'react-toastify';

function BusTypeCreate() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (props) => {
    console.log("Dữ liệu nhập vào:", props);

    try {
      let formData = new FormData();
      formData.append("typeName", props.typeName);
      formData.append("totalSeats", props.totalSeats);

      const res = await axios.post(`${Constants.DOMAIN_API}/admin/busType/add`, {
        typeName: props.typeName,
        totalSeats: props.totalSeats
      });
      console.log("Success", res);

      navigate('/admin/busType/getAll');
      toast.success("Thêm loại xe thành công!");
    } catch (e) {
      console.log("Error", e);
      toast.error("Thêm loại xe thất bại!");
    }
  };


  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Thêm loại xe</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Tên loại xe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                ${errors.typeName ? '!border-red-500' : 'border-gray-300'}`}
                {...register("typeName", {
                  required: "Vui lòng nhập loại xe"
                })}
                placeholder="Nhập tên loại xe"
              />
              {errors.typeName && <p className="text-red-700">{errors.typeName.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Tổng số ghế <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                ${errors.totalSeats ? '!border-red-500' : 'border-gray-300'}`}
                {...register("totalSeats", {
                  required: "Vui lòng nhập tổng số ghế",
                  min: {
                    value: 1,
                    message: "Số ghế phải lớn hơn 0"
                  }
                })}
                placeholder="Nhập tổng số ghế"
              />
              {errors.totalSeats && <p className="text-red-700">{errors.totalSeats.message}</p>}
            </div>

          </div>

          <div className="flex justify-end mt-6 space-x-4 border-t pt-4">

            <button
              type="submit"
              className="flex items-center px-5 py-2.5 bg-[#073272] text-white rounded-md hover:bg-blue-900 transition-colors"
            >
              <FaSave className="mr-2" /> Lưu lại
            </button>
            <Link to="/admin/busType/getAll" className="bg-gray-400 text-white px-4 py-2 rounded">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BusTypeCreate;
