import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import { useParams } from "react-router-dom";

function CartDetailPage() {
  const [cartItems, setCartItems] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    fetchCartDetail();
  }, [id]);

  const fetchCartDetail = async () => {
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/cart/${id}`);
      setCartItems(response.data.data || []);
    } catch (error) {
      console.error("Error fetching cart detail:", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Chi tiết giỏ hàng #{id}</h5>

              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div className="border rounded p-3 mb-4" key={item.id}>
                    <div className="row mb-2">
                      <div className="col-md-3 fw-semibold">ID:</div>
                      <div className="col-md-9">{item.id}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-3 fw-semibold">Tên người dùng:</div>
                      <div className="col-md-9">{item.user_name}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-3 fw-semibold">Email:</div>
                      <div className="col-md-9">{item.user_email}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-3 fw-semibold">Sản phẩm:</div>
                      <div className="col-md-9">{item.product?.name}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-3 fw-semibold">Giá:</div>
                      <div className="col-md-9">{Number(item.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-3 fw-semibold">Số lượng:</div>
                      <div className="col-md-9">{item.quantity}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-3 fw-semibold">Tổng tiền:</div>
                      <div className="col-md-9">{Number(item.total_price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-3 fw-semibold">Thêm lúc:</div>
                      <div className="col-md-9">{new Date(item.created_at).toLocaleString()}</div>
                    </div>
                    <div className="row">
                      <div className="col-md-3 fw-semibold">Cập nhật lúc:</div>
                      <div className="col-md-9">{new Date(item.updated_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center">Giỏ hàng này chưa có sản phẩm</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartDetailPage;
