import { Outlet } from "react-router-dom";
// styles
import "./basePage.scss";

export function BasePage() {
  return (
    <div className="base-page flex min-height-page w-100 justify-center">
      <main className="main-page-content w-100 flex justify-center">
        <Outlet />
      </main>
    </div>
  );
}
