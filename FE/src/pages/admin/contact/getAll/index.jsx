import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FormDelete from "../../../../components/formDelete";
import axios from "axios";
import { toast } from "react-toastify";
import { Tab, Tabs, Box, CircularProgress } from "@mui/material";
import Constants from "../../../../Constants";
import ReactPaginate from "react-paginate";

const URL = Constants.DOMAIN_API;
const ENDPOIND = `admin/contact`;

function ContactGetAll() {
  const [data, setData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  const [currentItems, setCurrentItems] = useState([]);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    contactData();
  }, []);

  useEffect(() => {
    setItemOffset(0);
    contactData();
  }, [tabIndex]);

  const contactData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/${ENDPOIND}/list`);
      setData(res.data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const pendingContacts = data.filter(contact => contact.status === 0);
  const respondedContacts = data.filter(contact => contact.status === 1);

  const displayedData = tabIndex === 0 ? pendingContacts : respondedContacts;
  const endOffset = itemOffset + itemsPerPage;
  const pageCount = Math.ceil(displayedData.length / itemsPerPage);

  useEffect(() => {
    setCurrentItems(displayedData.slice(itemOffset, endOffset));
  }, [data, itemOffset, tabIndex]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    contactData();

  };

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % displayedData.length;
    setItemOffset(newOffset);
    contactData();

  };

  const handleDelete = async ({ id }) => {
    try {
      await axios.delete(`${URL}/${ENDPOIND}/${id}`);
      toast.success("Yêu cầu đã được xóa thành công!");
      contactData();
      setSelectedContact(null);
    } catch (err) {
      toast.error("Có lỗi khi xóa .");
    }
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-bold mb-3">Quản lý Liên Hệ</h2>

        <Box sx={{ width: "100%" }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Contact Tabs">
            <Tab label="Chưa trả lời" />
            <Tab label="Đã trả lời" />
          </Tabs>

          <div>
            <Box sx={{ paddingTop: 2 }}>
              {loading ? (
                <div className="flex justify-center items-center mt-10">
                  <CircularProgress />
                </div>
              ) : (
                <>
                  {tabIndex === 0 && (
                    <table className="w-full border-collapse border border-gray-300 mt-3">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="p-2 border">#</th>
                          <th className="p-2 border">Tên</th>
                          <th className="p-2 border">Email</th>
                          <th className="p-2 border">Câu hỏi</th>
                          <th className="p-2 border">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((contact, index) => (
                          <tr key={contact.id} className="border-b">
                            <td className="p-2 border">{itemOffset + index + 1}</td>
                            <td className="p-2 border">{contact.fullName}</td>
                            <td className="p-2 border">{contact.email}</td>
                            <td className="p-2 border max-w-[30%] truncate whitespace-nowrap overflow-hidden">{contact.question}</td>
                            <td className="p-2 border flex gap-2">
                              <Link
                                to={`/admin/contact/edit/${contact.id}`}
                                className="bg-green-500 text-white py-2 px-3 rounded flex items-center gap-2"
                              >
                                <i className="fa-solid fa-reply text-md"></i>
                                Trả lời
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {tabIndex === 1 && (
                    <table className="w-full border-collapse border border-gray-300 mt-3">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="p-2 border">#</th>
                          <th className="p-2 border">Tên</th>
                          <th className="p-2 border">Email</th>
                          <th className="p-2 border">Câu hỏi</th>
                          <th className="p-2 border">Trả lời</th>
                          <th className="p-2 border">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((contact, index) => (
                          <tr key={contact.id} className="border-b">
                            <td className="p-2 border">{itemOffset + index + 1}</td>
                            <td className="p-2 border">{contact.fullName}</td>
                            <td className="p-2 border">{contact.email}</td>
                            <td className="p-2 border max-w-[30%] truncate whitespace-nowrap overflow-hidden">{contact.question}</td>
                            <td className="p-2 border max-w-[30%] truncate whitespace-nowrap overflow-hidden">{contact.reply}</td>
                            <td className="p-2 border flex gap-2">
                              <Link
                                to={`/admin/contact/edit/${contact.id}`}
                                className="bg-blue-500 text-white py-2 px-3 rounded flex items-center gap-2"
                              >
                                <i className="fa-solid fa-eye text-md"></i>
                                Xem
                              </Link>
                              <button
                                onClick={() => setSelectedContact(contact)}
                                className="bg-red-500 text-white py-2 px-3 rounded flex items-center gap-2"
                              >
                                <i className="fa-solid fa-trash text-md"></i>
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </Box>
          </div>
        </Box>

        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel="<"
          containerClassName="flex justify-center gap-2 mt-4"
          pageClassName="px-3 py-1 border rounded hover:bg-gray-200"
          activeClassName="bg-blue-500 text-white"
          previousClassName="px-3 py-1 border rounded"
          nextClassName="px-3 py-1 border rounded"
        />
      </div>

      {selectedContact && (
        <FormDelete
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          onConfirm={handleDelete}
          Id={selectedContact?.id}
          message={`Bạn có chắc chắn muốn xóa câu hỏi "${selectedContact.question}" không?`}
        />
      )}
    </div>
  );
}

export default ContactGetAll;
