import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Book from "./views/Book.vue";
import Admin from "./views/Admin.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/book/:id", component: Book },
  { path: "/admin", component: Admin, meta: { requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Route guard for admin pages
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    // Check if wallet is connected
    if (!window.ethereum) {
      alert("กรุณาติดตั้ง MetaMask เพื่อเข้าถึงหน้า Admin");
      next("/");
      return;
    }

    // Check if user is admin
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      const ADMIN_ADDRESS = "0x6e7BCbD91a8560E7Dc44F9c2179eae315B9BcDb4";
      if (
        accounts.length > 0 &&
        accounts[0].toLowerCase() === ADMIN_ADDRESS.toLowerCase()
      ) {
        next();
      } else {
        alert("คุณไม่มีสิทธิ์เข้าถึงหน้า Admin");
        next("/");
      }
    });
  } else {
    next();
  }
});

export default router;
