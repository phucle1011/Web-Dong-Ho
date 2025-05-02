import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaSave } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router";
import Constants from "../../../../Constants";
import { toast } from 'react-toastify';

function BusTypeEdit() {
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors }
  } = useForm({
    mode: "onChange"
  });

  const handleChange = (field) => {
    trigger(field);
  };

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getBusTypeInfo(id);
    }
  }, [id]);

  const getBusTypeInfo = async (id) => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/busType/getId/${id}`);
      setValue("typeName", res.data.data.typeName);
      setValue("totalSeats", res.data.data.totalSeats);  
    } catch (e) {
      console.log(e);
    }
  };

  const handleRegister = async (props) => {
    try {
      if (id) {
        await axios.patch(`${Constants.DOMAIN_API}/admin/busType/update/${id}`, {
          typeName: props.typeName,
          totalSeats: props.totalSeats 
        });

        navigate('/admin/busType/getAll');
        toast.success("Cập nhật thành công!");
        return;
      }
    } catch (e) {
      console.log("Error", e);
      toast.error("Cập nhật thất bại!");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          Chỉnh sửa loại xe
        </h1>

        <form onSubmit={handleSubmit(handleRegister)}>
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
                onChange={(e) => {
                  setValue("typeName", e.target.value);
                  handleChange("typeName");
                }}
              />
              {errors.typeName && <p className="text-red-700">{errors.typeName.message}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Số ghế <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                ${errors.totalSeats ? '!border-red-500' : 'border-gray-300'}`}
                {...register("totalSeats", {
                  required: "Vui lòng nhập số ghế",
                  min: {
                    value: 1,
                    message: "Số ghế phải lớn hơn 0"
                  }
                })}
                onChange={(e) => {
                  setValue("totalSeats", e.target.value);
                  handleChange("totalSeats");
                }}
              />
              {errors.totalSeats && <p className="text-red-700">{errors.totalSeats.message}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4 border-t pt-4">
            <button 
              type="submit"
              className="flex items-center px-5 py-2.5 bg-[#073272] text-white rounded-md hover:bg-blue-900 transition-colors"
            >
              <FaSave className="mr-2" /> Cập nhật
            </button>
            <Link to="/admin/busType/getAll" className="bg-gray-400 text-white px-4 py-2 rounded">
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BusTypeEdit;
