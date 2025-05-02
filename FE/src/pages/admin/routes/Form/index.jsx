import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@mui/material";
import axios from "axios";
import useMapbox from "../../../../hooks/mapbox";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import Constants from '../../../../Constants';


const URL = Constants.DOMAIN_API;
const ENDPOINT = `admin/routes`;

function RoutesCreate() {
    const navigate = useNavigate();
    const [queryParams] = useSearchParams();
    const id = queryParams.get("id");
    const [startFull, setStartFull] = useState("");
    const [endFull, setEndFull] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    const [provinces, setProvinces] = useState([]);
    const [startDistricts, setStartDistricts] = useState([]);
    const [startWards, setStartWards] = useState([]);
    const [endDistricts, setEndDistricts] = useState([]);
    const [endWards, setEndWards] = useState([]);
    const { getDistance } = useMapbox();

    const startProvince = watch("startProvince");
    const startDistrict = watch("startDistrict");
    const startWard = watch("startWard");
    const endProvince = watch("endProvince");
    const endDistrict = watch("endDistrict");
    const endWard = watch("endWard");

    const getProvinceName = (list, id) => {
        const item = list.find(i => i.ProvinceID == id);
        return item?.ProvinceName || '';
    };

    const getDistrictName = (list, id) => {
        const item = list.find(i => i.DistrictID == id);
        return item?.DistrictName || '';
    };

    const getWardName = (list, id) => {
        const item = list.find(i => i.WardCode == id);
        return item?.WardName || '';
    };

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get(`${URL}/apiRoutes/provinces`);
                setProvinces(res.data);
            

                if (id) {
                    await getUseInfo(res.data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchProvinces();
    }, [id]);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (startProvince) {
                try {
                    const res = await axios.get(`${URL}/apiRoutes/districts?provinceId=${startProvince}`);
                    setStartDistricts(res.data);
                    setValue("startDistrict", "");
                    setStartWards([]);
                    setValue("startWard", "");
                } catch (error) {
                    console.error("Error fetching districts:", error);
                }
            }
        };

        fetchDistricts();
    }, [startProvince]);


    useEffect(() => {
        const fetchWards = async () => {
            if (startDistrict) {
                try {
                    const res = await axios.get(`${URL}/apiRoutes/wards?districtId=${startDistrict}`);
                    setStartWards(res.data);
                    setValue("startWard", "");
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchWards();
    }, [startDistrict]);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (endProvince) {
                try {
                    const res = await axios.get(`${URL}/apiRoutes/districts?provinceId=${endProvince}`);
                    setEndDistricts(res.data);
                    setValue("endDistrict", "");
                    setEndWards([]);
                    setValue("endWard", "");
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchDistricts();
    }, [endProvince]);

    useEffect(() => {
        const fetchWards = async () => {
            if (endDistrict) {
                try {
                    const res = await axios.get(`${URL}/apiRoutes/wards?districtId=${endDistrict}`);
                    setEndWards(res.data);
                    setValue("endWard", "");
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchWards();
    }, [endDistrict]);

    useEffect(() => {
        const calculateDistance = async () => {
            if (startProvince && startDistrict && startWard && endProvince && endDistrict && endWard) {
                const startFull = `${getProvinceName(provinces, startProvince)},${getDistrictName(startDistricts, startDistrict)},${getWardName(startWards, startWard)}`;
                const endFull = `${getProvinceName(provinces, endProvince)},${getDistrictName(endDistricts, endDistrict)},${getWardName(endWards, endWard)}`;

                setStartFull(startFull);
                setEndFull(endFull);

                const result = await getDistance(startFull, endFull);
                if (result) {
                    setValue("distance", result.km);
                    setValue("time", result.hours);
                }
            }
        };

        calculateDistance();
    }, [startProvince, startDistrict, startWard, endProvince, endDistrict, endWard]);

    const getUseInfo = async (provincesData = provinces) => {
        try {
            const res = await axios.get(`${URL}/${ENDPOINT}/getId/?id=${id}`);
            const data = res.data.data;

            setValue("startProvince", data.startProvinceID);
            setValue("endProvince", data.endProvinceID);

            if (data.startProvinceID) {
                const districtsRes = await axios.get(`${URL}/apiRoutes/districts?provinceId=${data.startProvinceID}`);
                setStartDistricts(districtsRes.data);
                setValue("startDistrict", data.startDistrictID);

                if (data.startDistrictID) {
                    const wardsRes = await axios.get(`${URL}/apiRoutes/wards?districtId=${data.startDistrictID}`);
                    setStartWards(wardsRes.data);
                    setValue("startWard", data.startWardID);
                }
            }

            if (data.endProvinceID) {
                const districtsRes = await axios.get(`${URL}/apiRoutes/districts?provinceId=${data.endProvinceID}`);
                setEndDistricts(districtsRes.data);
                setValue("endDistrict", data.endDistrictID);

                if (data.endDistrictID) {
                    const wardsRes = await axios.get(`${URL}/apiRoutes/wards?districtId=${data.endDistrictID}`);
                    setEndWards(wardsRes.data);
                    setValue("endWard", data.endWardID);
                }
            }

            setValue("distance", data.distance);
            setValue("time", data.time);

            const startProvinceName = getProvinceName(provincesData, data.startProvinceID);
            const startDistrictName = getDistrictName(startDistricts, data.startDistrictID);
            const startWardName = getWardName(startWards, data.startWardID);

            const endProvinceName = getProvinceName(provincesData, data.endProvinceID);
            const endDistrictName = getDistrictName(endDistricts, data.endDistrictID);
            const endWardName = getWardName(endWards, data.endWardID);

            setStartFull(`${startProvinceName},${startDistrictName},${startWardName}`);
            setEndFull(`${endProvinceName},${endDistrictName},${endWardName}`);

        } catch (err) {
            console.error("Error fetching route info:", err);
        }
    };

    const handleCreate = async (data) => {
        const startProvinceName = getProvinceName(provinces, data.startProvince);
        const startDistrictName = getDistrictName(startDistricts, data.startDistrict);
        const startWardName = getWardName(startWards, data.startWard);

        const endProvinceName = getProvinceName(provinces, data.endProvince);
        const endDistrictName = getDistrictName(endDistricts, data.endDistrict);
        const endWardName = getWardName(endWards, data.endWard);

        const formData = {
            startProvinceID: data.startProvince,
            startDistrictID: data.startDistrict,
            startWardID: data.startWard,
            endProvinceID: data.endProvince,
            endDistrictID: data.endDistrict,
            endWardID: data.endWard,
            distance: data.distance,
            time: data.time,
            startPoint: `${startProvinceName},${startDistrictName},${startWardName}`,
            endPoint: `${endProvinceName},${endDistrictName},${endWardName}`,
            id: id
        };

        try {
            if (id) {
                await axios.patch(`${URL}/${ENDPOINT}/update/${id}`, formData);
                toast.success("Cập nhật tuyến đường thành công");
            } else {
                await axios.post(`${URL}/${ENDPOINT}/add`, formData);
                toast.success("Tạo tuyến đường thành công")
            }
            navigate('/admin/routes/getAll');
        } catch (err) {
            console.error(err);
            toast.error("Có lỗi xảy ra ");
        }
    };

    return (
        <main className="flex-1 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl text-gray-800 font-bold mb-8 mt-2">Thông tin tuyến đường</h2>
            <form onSubmit={handleSubmit(handleCreate)} className="space-y-8">
                <div>
                    <label className="text-gray-600 block font-bold text-xl">Điểm xuất phát</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                        <div>
                            <label className="block mb-2">Tỉnh/Thành phố</label>
                            <select
                                {...register("startProvince", { required: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Chọn Tỉnh/Thành phố</option>
                                {provinces.map((p) => (
                                    <option key={p.ProvinceID} value={p.ProvinceID}>
                                        {p.ProvinceName}
                                    </option>
                                ))}
                            </select>
                            {errors.startProvince && <p className="text-red-500 mt-1 text-sm">Vui lòng chọn tỉnh thành.</p>}
                        </div>

                        <div>
                            <label className="block mb-2">Quận/Huyện</label>
                            <select
                                {...register("startDistrict", { required: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!startDistricts.length}
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {startDistricts.map((d) => (
                                    <option key={d.DistrictID} value={d.DistrictID}>
                                        {d.DistrictName}
                                    </option>
                                ))}
                            </select>
                            {errors.startDistrict && <p className="text-red-500 mt-1 text-sm">Vui lòng chọn quận huyện.</p>}
                        </div>

                        <div>
                            <label className="block mb-2">Xã/Phường</label>
                            <select
                                {...register("startWard", { required: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!startWards.length}
                            >
                                <option value="">Chọn Xã/Phường</option>
                                {startWards.map((w) => (
                                    <option key={w.WardCode} value={w.WardCode}>
                                        {w.WardName}
                                    </option>
                                ))}
                            </select>
                            {errors.startWard && <p className="text-red-500 mt-1 text-sm">Vui lòng chọn xã phường.</p>}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-gray-500 block font-bold text-xl">Điểm đến</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                        <div>
                            <label className="block mb-2">Tỉnh/Thành phố</label>
                            <select
                                {...register("endProvince", { required: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Chọn Tỉnh/Thành phố</option>
                                {provinces.map((p) => (
                                    <option key={p.ProvinceID} value={p.ProvinceID}>
                                        {p.ProvinceName}
                                    </option>
                                ))}
                            </select>
                            {errors.endProvince && <p className="text-red-500 mt-1 text-sm">Vui lòng chọn tỉnh thành.</p>}
                        </div>

                        <div>
                            <label className="block mb-2">Quận/Huyện</label>
                            <select
                                {...register("endDistrict", { required: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!endDistricts.length}
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {endDistricts.map((d) => (
                                    <option key={d.DistrictID} value={d.DistrictID}>
                                        {d.DistrictName}
                                    </option>
                                ))}
                            </select>
                            {errors.endDistrict && <p className="text-red-500 mt-1 text-sm">Vui lòng chọn quận huyện.</p>}
                        </div>

                        <div>
                            <label className="block mb-2">Xã/Phường</label>
                            <select
                                {...register("endWard", { required: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!endWards.length}
                            >
                                <option value="">Chọn Xã/Phường</option>
                                {endWards.map((w) => (
                                    <option key={w.WardCode} value={w.WardCode}>
                                        {w.WardName}
                                    </option>
                                ))}
                            </select>
                            {errors.endWard && <p className="text-red-500 mt-1 text-sm">Vui lòng chọn xã phường.</p>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                    <div>
                        <label className="block mb-2 text-gray-700 font-medium">Quãng đường (km)</label>
                        <div className="relative">
                            <input
                                type="text"
                                {...register("distance")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="VD: 120"
                                disabled
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">km</span>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-gray-700 font-medium">Thời gian dự kiến</label>
                        <div className="relative">
                            <input
                                type="text"
                                {...register("time")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="VD: 2.5"
                                disabled
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">giờ</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        variant="contained"
                        color="warning"
                        type="submit"
                        className="px-6 py-2 rounded-lg shadow-md hover:bg-[#e65100]"
                    >
                        {id ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </div>
            </form>
        </main>
    );
}

export default RoutesCreate;