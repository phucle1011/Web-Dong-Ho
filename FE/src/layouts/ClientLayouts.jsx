import { useState } from "react";
import { Outlet } from "react-router-dom"; 
import DrawerThree from "../pages/client/Mobile/DrawerThree";

export default function ClientLayout({ childrenClasses, type }) {
  const [drawer, setDrawer] = useState(false);
  return (
    <>
      <DrawerThree open={drawer} action={() => setDrawer(!drawer)} />
      <div className="w-full overflow-x-hidden">
        <div type={3} drawerAction={() => setDrawer(!drawer)} />
        <div className={`w-full  ${childrenClasses || " pb-[60px]"}`}>
          <Outlet />
        </div>
       
        <div type={type} />
      </div>
    </>
  );
}
