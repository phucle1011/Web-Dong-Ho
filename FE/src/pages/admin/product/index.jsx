import React, { useState } from 'react';

function DynamicTable() {
  // Khởi tạo state lưu dữ liệu các dòng trong bảng
  // Mỗi dòng là object có id, category (giá trị select), detail và comment (2 ô input)
  const [rows, setRows] = useState([
    { id: 1, category: '', detail: '', comment: '' },
  ]);

  // Các giá trị để chọn trong dropdown select
  const categories = ['Fruit', 'Vegetable', 'Meat'];

  // Hàm xử lý khi thay đổi giá trị select trong 1 dòng
  // Cập nhật lại category, nếu chọn rỗng thì xóa detail và comment (cho 2 ô input ẩn)
  const handleSelectChange = (id, value) => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === id
          ? { ...row, category: value, detail: value ? row.detail : '', comment: value ? row.comment : '' }
          : row
      )
    );
  };

  // Hàm xử lý khi thay đổi giá trị input (detail hoặc comment)
  // Truyền vào id dòng, tên trường (field), và giá trị mới
  const handleInputChange = (id, field, value) => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === id
          ? { ...row, [field]: value }  // Cập nhật trường tương ứng
          : row
      )
    );
  };

  // Hàm thêm dòng mới vào bảng
  // Mỗi dòng mới có id tăng dần, các trường rỗng ban đầu
  const addRow = () => {
    setRows(prevRows => [
      ...prevRows,
      { id: prevRows.length + 1, category: '', detail: '', comment: '' },
    ]);
  };

  return (
    <div>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Category (select)</th>
            <th>Detail (input hiện khi chọn category)</th>
            <th>Comment (input hiện khi chọn category)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td>
                {/* Dropdown select, value lấy từ row.category */}
                <select
                  value={row.category}
                  onChange={e => handleSelectChange(row.id, e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {/* Hiển thị các option từ mảng categories */}
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </td>
              <td>
                {/* Chỉ hiện input detail khi đã chọn category */}
                {row.category && (
                  <input
                    type="text"
                    value={row.detail}
                    onChange={e => handleInputChange(row.id, 'detail', e.target.value)}
                    placeholder="Enter detail"
                  />
                )}
              </td>
              <td>
                {/* Chỉ hiện input comment khi đã chọn category */}
                {row.category && (
                  <input
                    type="text"
                    value={row.comment}
                    onChange={e => handleInputChange(row.id, 'comment', e.target.value)}
                    placeholder="Enter comment"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Nút thêm dòng mới */}
      <button onClick={addRow} style={{ marginTop: '10px' }}>
        Add Row
      </button>
    </div>
  );
}

export default DynamicTable;
