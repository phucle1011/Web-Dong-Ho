import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Constants from "../../../../Constants";

function CartDetailPage() {
  const { id } = useParams();
  const [cartItem, setCartItem] = useState(null);

  useEffect(() => {
    fetchCartDetail();
  }, [id]);

  const fetchCartDetail = async () => {
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/cart/${id}`);
      setCartItem(response.data.data || null);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết giỏ hàng:", error);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <div className="card-body">
          <h4 className="card-title mb-4">Chi tiết giỏ hàng #{id}</h4>

          <div className="mb-4">
            <Link to="/admin/carts/getAll" className="btn btn-secondary">
              Quay lại
            </Link>
          </div>

          {cartItem ? (
            <div className="mb-4 border p-3 rounded">
              <div className="mb-3">
                <label className="form-label fw-bold">ID giỏ hàng</label>
                <input type="text" className="form-control" value={cartItem.id || ""} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Tên người dùng</label>
                <input type="text" className="form-control" value={cartItem.user?.name || ""} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Email người dùng</label>
                <input type="text" className="form-control" value={cartItem.user?.email || ""} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">SKU sản phẩm</label>
                <input type="text" className="form-control" value={cartItem.variant?.sku || ""} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Tên sản phẩm</label>
                <input
                  type="text"
                  className="form-control"
                  value={cartItem.variant?.product?.name || ""}
                  disabled
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Giá</label>
                  <input
                    type="text"
                    className="form-control"
                    value={
                      cartItem.variant?.price
                        ? Number(cartItem.variant.price).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })
                        : ""
                    }
                    disabled
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Số lượng</label>
                  <input type="number" className="form-control" value={cartItem.quantity || 0} disabled />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Ngày tạo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={new Date(cartItem.created_at).toLocaleString() || ""}
                    disabled
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Cập nhật lần cuối</label>
                  <input
                    type="text"
                    className="form-control"
                    value={new Date(cartItem.updated_at).toLocaleString() || ""}
                    disabled
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">Không tìm thấy giỏ hàng này.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDetailPage;
