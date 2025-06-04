import React, { useState, useEffect } from "react";

export default function AddressesTab({ userId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    fetch(`http://localhost:5000/address/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch addresses");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setAddresses(data.data);
        } else {
          setError("No addresses found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>Loading addresses...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <>
      <div className="grid grid-cols-2 gap-[30px]">
        {addresses.length === 0 && <p>No addresses available.</p>}

        {addresses.map((address, idx) => (
          <div key={address.id} className="w-full bg-primarygray p-5 border">
            <div className="flex justify-between items-center">
              <p className="title text-[22px] font-semibold">Address #{idx + 1}</p>
              <button
                type="button"
                className="border border-qgray w-[34px] h-[34px] rounded-full flex justify-center items-center"
              >
                {/* Your delete icon SVG here */}
                <svg
                  width="17"
                  height="19"
                  viewBox="0 0 17 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.7768 5.95215C15.6991 6.9104 15.6242 7.84603 15.5471 8.78237C15.3691 10.9285 15.1917 13.0747 15.0108 15.2209C14.9493 15.9473 14.9097 16.6773 14.8065 17.3988C14.6963 18.1726 14.0716 18.7161 13.2929 18.7196C10.3842 18.7323 7.47624 18.7337 4.56757 18.7189C3.70473 18.7146 3.08639 18.0794 3.00795 17.155C2.78181 14.493 2.57052 11.8302 2.35145 9.16821C2.2716 8.19442 2.1875 7.22133 2.10623 6.24824C2.09846 6.15638 2.09563 6.06451 2.08998 5.95286C6.65579 5.95215 11.2061 5.95215 15.7768 5.95215ZM5.25375 8.05803C5.25234 8.05803 5.25163 8.05803 5.25022 8.05803C5.27566 8.4573 5.3011 8.85657 5.32583 9.25584C5.46717 11.5228 5.60709 13.7891 5.75125 16.0561C5.77245 16.3897 5.99081 16.6038 6.28196 16.6024C6.58724 16.601 6.80066 16.3636 6.8056 16.0159C6.80702 15.9339 6.80136 15.8512 6.79571 15.7692C6.65367 13.4789 6.51304 11.1886 6.36888 8.89826C6.33849 8.41702 6.31164 7.93507 6.26146 7.45524C6.22966 7.1549 6.0318 6.99732 5.73076 6.99802C5.44526 6.99873 5.24033 7.2185 5.23043 7.52873C5.22619 7.7054 5.24598 7.88207 5.25375 8.05803ZM12.6102 8.05521C12.6088 8.05521 12.6074 8.05521 12.606 8.05521C12.6152 7.89055 12.6321 7.7259 12.6307 7.56195C12.6286 7.24465 12.4399 7.02417 12.1622 6.99873C11.888 6.97329 11.6484 7.16268 11.5961 7.46443C11.5665 7.63756 11.5615 7.81494 11.5502 7.9909C11.4626 9.38799 11.3749 10.7851 11.2887 12.1822C11.2103 13.4499 11.1276 14.7184 11.0576 15.9869C11.0379 16.3431 11.2463 16.5819 11.5495 16.6003C11.8562 16.6194 12.088 16.4017 12.1099 16.0505C12.2788 13.3856 12.4441 10.7208 12.6102 8.05521ZM9.45916 11.814C9.45916 10.4727 9.45986 9.13147 9.45916 7.79091C9.45916 7.25101 9.28603 6.99449 8.92845 6.99661C8.56805 6.99802 8.40198 7.24819 8.40198 7.79586C8.40127 10.4664 8.40127 13.1369 8.40268 15.8074C8.40268 15.948 8.37088 16.1289 8.44296 16.2194C8.56946 16.3763 8.76591 16.5748 8.93198 16.5741C9.09805 16.5734 9.29309 16.3727 9.41746 16.2151C9.48955 16.124 9.45704 15.9431 9.45704 15.8032C9.46057 14.4725 9.45916 13.1432 9.45916 11.814Z"
                    fill="#EB5757"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-5">
              <table>
                <tbody>
                  <tr className="flex mb-3">
                    <td className="text-base text-qgraytwo w-[70px] block line-clamp-1">
                      <div>Name:</div>
                    </td>
                    <td className="text-base text-qblack line-clamp-1 font-medium">
                      {address.user?.name || "N/A"}
                    </td>
                  </tr>
                  <tr className="flex mb-3">
                    <td className="text-base text-qgraytwo w-[70px] block line-clamp-1">
                      <div>Email:</div>
                    </td>
                    <td className="text-base text-qblack line-clamp-1 font-medium">
                      {address.user?.email || "N/A"}
                    </td>
                  </tr>
                  <tr className="flex mb-3">
                    <td className="text-base text-qgraytwo w-[70px] block line-clamp-1">
                      <div>Address:</div>
                    </td>
                    <td className="text-base text-qblack line-clamp-1 font-medium">
                      {address.address_line}
                    </td>
                  </tr>
                  <tr className="flex mb-3">
                    <td className="text-base text-qgraytwo w-[70px] block line-clamp-1">
                      <div>District:</div>
                    </td>
                    <td className="text-base text-qblack line-clamp-1 font-medium">
                      {address.district}
                    </td>
                  </tr>
                  <tr className="flex mb-3">
                    <td className="text-base text-qgraytwo w-[70px] block line-clamp-1">
                      <div>Province:</div>
                    </td>
                    <td className="text-base text-qblack line-clamp-1 font-medium">
                      {address.province}
                    </td>
                  </tr>
                  <tr className="flex mb-3">
                    <td className="text-base text-qgraytwo w-[70px] block line-clamp-1">
                      <div>Phone:</div>
                    </td>
                    <td className="text-base text-qblack line-clamp-1 font-medium">
                      {address.phone}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
