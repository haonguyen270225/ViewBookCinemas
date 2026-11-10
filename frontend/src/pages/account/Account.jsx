
import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

//========================= Import CSS ========================

import "./Account.css";

//========================= Component Account ========================

function Account() {
    return (
        <>
            <Navbar />

            <main className="account-page">
                <div className="container py-5">
                    <h1>Tài khoản của tôi</h1>
                    <p>Chào mừng bạn đến với trang quản lý tài khoản ViewBookCinemas.</p>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Account;
