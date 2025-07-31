import "./basePage.scss";

export function BasePage({ children }) {
  return (
    <div className="base-page flex min-height-page w-100 justify-center">
      <main className="main-page-content w-100 flex justify-center">
        {children}
      </main>
    </div>
  );
}
