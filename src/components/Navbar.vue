<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo Section -->
      <router-link to="/" class="nav-brand">
        <div class="brand-icon">🎫</div>
        <span class="brand-text">ระบบจองสินค้าด้วย Blockchain</span>
      </router-link>

      <!-- Navigation Links -->
      <div class="nav-menu">
        <router-link 
          to="/" 
          class="nav-link"
          :class="{ 'active': isHomePage }"
        >
          <span class="nav-icon">🏠</span>
          <span class="nav-text">หน้าหลัก</span>
        </router-link>

        <router-link 
          v-if="isAdmin" 
          to="/admin" 
          class="nav-link admin-link"
          :class="{ 'active': isAdminPage }"
        >
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">Admin</span>
        </router-link>
      </div>

      <!-- Wallet Section -->
      <div class="nav-wallet">
        <div v-if="isConnected" class="wallet-info">
          <div class="wallet-status">
            <span class="status-dot"></span>
            <span class="status-text">Connected</span>
          </div>
          <div class="wallet-address">
            {{ shortAddress }}
          </div>
          <button @click="disconnectWallet" class="disconnect-btn" title="ตัดการเชื่อมต่อ">
            <span>🔌</span>
          </button>
        </div>
        <button v-else @click="connectWallet" class="connect-btn">
          <span class="btn-icon">🔗</span>
          <span class="btn-text">Connect Wallet</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
/**
 * ============================================
 * NAVBAR COMPONENT
 * ============================================
 * แถบนำทางหลัก ประกอบด้วย:
 * 1. โลโก้และชื่อแอป
 * 2. เมนูนำทาง (Home, Admin)
 * 3. ข้อมูล Wallet และปุ่มเชื่อมต่อ
 */

import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useWallet } from '../store/wallet';

const route = useRoute();
const { isConnected, isAdmin, shortAddress, connectWallet, disconnectWallet } = useWallet();

// ตรวจสอบว่าอยู่หน้าไหน เพื่อ highlight เมนู
const isHomePage = computed(() => route.path === '/');
const isAdminPage = computed(() => route.path === '/admin');
</script>

<style scoped>
/* ============================================
   NAVBAR LAYOUT
   โครงสร้างหลักของ Navbar
   ============================================ */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* ============================================
   BRAND/LOGO SECTION
   โลโก้และชื่อแอป
   ============================================ */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-brand:hover {
  transform: translateY(-2px);
}

.brand-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

/* ============================================
   NAVIGATION MENU
   เมนูนำทาง
   ============================================ */
.nav-menu {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Hover effect */
.nav-link::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-link:hover::before {
  opacity: 1;
}

.nav-link:hover {
  color: var(--text-heading);
  transform: translateY(-2px);
}

/* Active state - เมนูที่กำลังเปิดอยู่ */
.nav-link.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  color: var(--primary);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
  border-radius: 2px 2px 0 0;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}

/* Admin link - สีพิเศษ */
.admin-link {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%);
  border: 1px solid rgba(245, 158, 11, 0.15);
}

.admin-link:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.12) 100%);
  border-color: rgba(245, 158, 11, 0.25);
}

.admin-link.active {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%);
  border-color: rgba(245, 158, 11, 0.35);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
}

.admin-link.active::after {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

.nav-icon {
  font-size: 1.25rem;
}

.nav-text {
  font-size: 1rem;
}

/* ============================================
   WALLET SECTION
   ส่วนแสดงข้อมูล Wallet
   ============================================ */
.nav-wallet {
  display: flex;
  align-items: center;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.625rem 1rem;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 0.75rem;
}

.wallet-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.status-text {
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 600;
}

.wallet-address {
  font-family: "Courier New", monospace;
  font-size: 0.875rem;
  color: var(--text-main);
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  background: #f1f5f9;
  border-radius: 0.5rem;
}

.disconnect-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.disconnect-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

/* Connect Button */
.connect-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.connect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.btn-icon {
  font-size: 1.25rem;
}

/* ============================================
   RESPONSIVE DESIGN
   ปรับแต่งสำหรับหน้าจอขนาดเล็ก
   ============================================ */
@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .nav-link {
    flex: 1;
    justify-content: center;
  }

  .nav-text {
    display: none;
  }

  .nav-icon {
    font-size: 1.5rem;
  }

  .brand-text {
    font-size: 1.25rem;
  }

  .wallet-info {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }

  .wallet-address {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  .status-text {
    display: none;
  }

  .connect-btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .btn-text {
    display: none;
  }

  .btn-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 1rem;
  }

  .brand-icon {
    font-size: 1.5rem;
  }

  .brand-text {
    font-size: 1rem;
  }
}
</style>
