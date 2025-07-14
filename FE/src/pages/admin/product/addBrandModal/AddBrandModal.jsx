import React from "react";
import BrandCreate from "../../brand/Create/index";

export default function AddBrandModal({ onClose, onSuccess }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>

        {/* Truyền callback nếu cần */}
        <BrandCreate onSuccess={onSuccess} isModal={true} />
      </div>
    </div>
  );
}
