import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import MobileNav from "./MobileNav.jsx";

const widths = {
  default: "max-w-[1280px]",
  narrow: "max-w-[1080px]",
  form: "max-w-[880px]",
};

export default function PageLayout({ children, width = "default", flush = false }) {
  return (
    <div className="flex min-h-screen flex-col bg-white pb-16 md:pb-0">
      <Header />
      <main
        className={`mx-auto w-full flex-1 px-6 md:px-10 ${widths[width]} ${flush ? "" : "py-8 md:py-12"}`}
      >
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
