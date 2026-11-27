
import {
    getAllUsers,
    getUserById,
    updateUserByAdmin,
    updateUserStatus,
    resetCustomerUsername,
    resetCustomerPassword
} from "./authService.js";

//=================== Lấy danh sách khách hàng ========================

export const getCustomers = async () => {
    const customers = getAllUsers();

    return customers.sort((a, b) => {
        return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
    });
};

//=================== Lấy khách hàng theo ID ========================

export const getCustomerById = async (id) => {
    return getUserById(id);
};

//=================== Cập nhật thông tin khách hàng ========================

export const updateCustomer = async (id, customerData) => {
    return updateUserByAdmin(id, customerData);
};

//=================== Đặt lại tên đăng nhập ========================

export const resetCustomerLoginName = async (id, newUsername) => {
    return resetCustomerUsername(id, newUsername);
};

//=================== Đặt lại mật khẩu ========================

export const resetCustomerLoginPassword = async (id) => {
    return resetCustomerPassword(id);
};

//=================== Cập nhật trạng thái khách hàng ========================

export const updateCustomerStatus = async (id, status) => {
    return updateUserStatus(id, status);
};

//=================== Thống kê khách hàng ========================

export const getCustomerStatistics = async () => {
    const customers = await getCustomers();

    const activeCustomers = customers.filter(
        customer => customer.status === "Active"
    );

    const inactiveCustomers = customers.filter(
        customer => customer.status === "Inactive"
    );

    const today = new Date();

    const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const newCustomersToday = customers.filter(customer => {
        if (!customer.createdAt) return false;

        return new Date(customer.createdAt) >= startOfToday;
    });

    return {
        total: customers.length,
        active: activeCustomers.length,
        inactive: inactiveCustomers.length,
        newToday: newCustomersToday.length
    };
};
