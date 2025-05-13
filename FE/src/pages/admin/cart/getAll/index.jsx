// import { useEffect, useState } from "react";
// import axios from "axios";
// import Constants from "../../../../Constants";
// import { Link } from "react-router-dom";

// function CartPage() {
//   const [cartItems, setCartItems] = useState([]);

//   useEffect(() => {
//     fetchAllCart();
//   }, []);

//   const fetchAllCart = async () => {
//     try {
//       const response = await axios.get(`${Constants.DOMAIN_API}/admin/cart/list`);
//       setCartItems(response.data.data || []);
//     } catch (error) {
//       console.error("Error fetching cart:", error);
//     }
//   };

//   return (
//     <div className="container-fluid">
//       <div className="row">
//         <div className="col-12 d-flex align-items-stretch">
//           <div className="card w-100">
//             <div className="card-body p-4">
//               <h5 className="card-title fw-semibold mb-4">Danh sách giỏ hàng</h5>
//               <div className="table-responsive">
//                 <table className="table text-nowrap mb-0 align-middle">
//                   <thead className="text-dark fs-4">
//                     <tr>
//                       <th><h6 className="fw-semibold mb-0">ID</h6></th>
//                       <th><h6 className="fw-semibold mb-0">Người dùng</h6></th>
//                       <th><h6 className="fw-semibold mb-0">Sản phẩm</h6></th>
//                       <th><h6 className="fw-semibold mb-0">Tổng</h6></th>
//                       <th><h6 className="fw-semibold mb-0">Chi tiết</h6></th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {cartItems.map((item) => (
//                       <tr key={item.id}>
//                         <td><h6 className="fw-normal mb-0">{item.id}</h6></td>
//                         <td><h6 className="fw-normal mb-0">{item.user_name}</h6></td>
//                         <td><h6 className="fw-normal mb-0">{item.product_name}</h6></td>
//                         <td><h6 className="fw-normal mb-0">{Number(item.total_price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</h6></td>
//                         <td>
//                           <Link to={`/admin/carts/detail/${item.id}`} className="btn btn-info btn-sm">
//                             Xem
//                           </Link>
//                         </td>
//                       </tr>
//                     ))}
//                     {cartItems.length === 0 && (
//                       <tr>
//                         <td colSpan="9" className="text-center">Không có dữ liệu giỏ hàng</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CartPage;
