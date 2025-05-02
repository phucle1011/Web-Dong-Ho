import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import Constants from "../../../../Constants";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const URL = Constants.DOMAIN_API;
const ENDPOINT = `admin/contact`;

function ContactEdit() {
    const { id } = useParams();
    const navigatore = useNavigate();
    const [hasReply, setHasReply] = useState(false);
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        mode: "onTouched",
    });

    useEffect(() => {
        if (id) {
            getById();
        }
    }, [id]);

    const getById = async () => {
        try {
            const res = await axios.get(`${URL}/${ENDPOINT}/getById/${id}`);
            setValue("fullName", res.data.data.fullName);
            setValue("email", res.data.data.email);
            setValue("question", res.data.data.question);
            setValue("reply", res.data.data.reply);
            if (res.data.data.reply) {
                setHasReply(true);
            }
        } catch (err) {
            console.error("Error:", err);
            if (err.response) {
                const errorMessage = err.response.data.message;
                toast.error(errorMessage);
            } else {
                toast.error("Lỗi kết nối đến server!");
            }
        }
    };


    const handleContact = async (data) => {
        console.log("Form data:", data);
        const formdata = {
            reply: data.reply,
        };
        try {
            const res = await axios.patch(`${URL}/${ENDPOINT}/update/${id}`, formdata);
            toast.success("Trả lời câu hỏi thành công!");
            navigatore("/admin/contact/getAll");
        } catch (err) {
            console.log(err);
            if (err.response) {
                const errorMessage = err.response.data.message;
                toast.error(errorMessage);
            } else {
                toast.error("Lỗi kết nối đến server!");
            }
        }
    };



    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-3">Liên Hệ</h3>
                <form onSubmit={handleSubmit(handleContact)} className="p-4 border rounded-md shadow-lg">
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Tên</label>
                        <input
                            {...register("fullName")}
                            disabled
                            type="text"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            {...register("email")}
                            disabled
                            type="email"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Câu hỏi</label>
                        <input
                            {...register("question")}
                            disabled
                            type="text"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Trả lời</label>
                        <textarea
                            {...register("reply", { required: "Nội dung không được để trống" })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.reply && <span className="text-red-500">{errors.reply.message}</span>}
                    </div>
                    {!hasReply && (
                        <button type="submit" className="px-4 py-2 bg-[#073272] text-white rounded">
                            Trả lời
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}

export default ContactEdit;