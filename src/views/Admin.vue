<template>
  <div class="admin-page">
    <div class="container">
      <!-- ============================================
           HEADER SECTION
           แสดงหัวข้อหน้าและคำอธิบาย
           ============================================ -->
      <div class="page-header fade-in">
        <div class="header-content">
          <div class="header-icon">⚙️</div>
          <div class="header-text">
            <h1>Admin Panel</h1>
            <p>จัดการสินค้าและดูสถานะการขาย</p>
          </div>
        </div>
      </div>

      <!-- ============================================
           ADD PRODUCT FORM
           ฟอร์มสำหรับเพิ่มสินค้าใหม่เข้า Blockchain
           ============================================ -->
      <div class="form-card slide-in">
        <div class="card-title">
          <span class="title-icon">➕</span>
          <h2>เพิ่มสินค้าใหม่</h2>
        </div>
        
        <form @submit.prevent="addProduct" class="product-form">
          <div class="form-grid">
            <!-- ชื่อสินค้า -->
            <div class="form-group">
              <label>
                <span class="label-icon">📝</span>
                ชื่อสินค้า
              </label>
              <input
                v-model="newProduct.name"
                placeholder="เช่น VIP Concert Ticket"
                required
              />
            </div>

            <!-- ราคา (ETH) -->
            <div class="form-group">
              <label>
                <span class="label-icon">💰</span>
                ราคา (ETH)
              </label>
              <input
                v-model="newProduct.price"
                placeholder="0.01"
                type="number"
                step="0.0001"
                required
              />
            </div>

            <!-- จำนวนสินค้า -->
            <div class="form-group">
              <label>
                <span class="label-icon">📊</span>
                จำนวนสินค้า
              </label>
              <input
                v-model="newProduct.maxSlots"
                placeholder="1-100"
                type="number"
                min="1"
                required
              />
            </div>

            <!-- URL รูปภาพ -->
            <div class="form-group full-width">
              <label>
                <span class="label-icon">🖼️</span>
                URL รูปภาพ
              </label>
              <input
                v-model="newProduct.imageUrl"
                placeholder="https://example.com/image.jpg"
                type="url"
                required
              />
            </div>
          </div>

          <!-- ปุ่มเพิ่มสินค้า -->
          <button type="submit" :disabled="adding" class="submit-button">
            <span v-if="adding">
              <span class="spinner-small"></span>
              กำลังเพิ่มสินค้า...
            </span>
            <span v-else>✨ เพิ่มสินค้า</span>
          </button>

          <!-- แสดง Error (ถ้ามี) -->
          <p v-if="addError" class="error-message">❌ {{ addError }}</p>
        </form>
      </div>

      <!-- ============================================
           PRODUCTS LIST
           แสดงรายการสินค้าทั้งหมดจาก Smart Contract
           พร้อมฟังก์ชันจัดการสถานะ
           ============================================ -->
      <div class="products-card slide-in" style="animation-delay: 0.2s">
        <div class="card-header">
          <div class="card-title">
            <span class="title-icon">📦</span>
            <h2>รายการสินค้าทั้งหมด</h2>
          </div>
          <button @click="loadProducts" class="refresh-button" :disabled="loading">
            <span v-if="loading" class="spinner-small"></span>
            <span v-else>🔄</span>
            รีเฟรช
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>กำลังโหลดข้อมูลจาก Blockchain...</p>
        </div>

        <!-- Products Table -->
        <div v-else-if="products.length > 0" class="table-wrapper">
          <table class="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>สินค้า</th>
                <th>ราคา</th>
                <th>ยอดขาย</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="product in products" 
                :key="product.id"
                :class="{ 'row-inactive': !product.active }"
              >
                <!-- ID Column -->
                <td>
                  <span class="id-badge">#{{ product.id.toString() }}</span>
                </td>
                
                <!-- Product Info Column -->
                <td class="product-info-cell">
                  <div class="product-mini-info">
                    <img 
                      v-if="product.imageUrl" 
                      :src="product.imageUrl" 
                      alt="Product" 
                      class="product-thumb"
                      @error="handleImageError"
                    />
                    <span class="product-name">{{ product.name }}</span>
                  </div>
                </td>

                <!-- Price Column -->
                <td class="price-cell">
                  {{ formatEther(product.price) }} ETH
                </td>

                <!-- Sales Progress Column -->
                <td>
                  <div class="slots-cell">
                    <div class="mini-progress">
                      <div
                        class="mini-progress-fill"
                        :class="getProgressBarClass(product)"
                        :style="{
                          width: `${
                            (Number(product.bookedSlots) /
                              Number(product.maxSlots)) *
                            100
                          }%`,
                        }"
                      ></div>
                    </div>
                    <span class="slots-text">
                      {{ product.bookedSlots.toString() }} /
                      {{ product.maxSlots.toString() }}
                    </span>
                  </div>
                </td>

                <!-- Status Column -->
                <td>
                  <span
                    class="status-badge"
                    :class="getStatusClass(product)"
                  >
                    {{ getStatusText(product) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">🔭</div>
          <h3>ยังไม่มีสินค้า</h3>
          <p>เริ่มต้นโดยเพิ่มสินค้าแรกของคุณด้านบน</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ============================================
 * ADMIN PANEL COMPONENT
 * ============================================
 * หน้านี้ใช้สำหรับ:
 * 1. เพิ่มสินค้าใหม่เข้า Smart Contract
 * 2. แสดงรายการสินค้าทั้งหมด
 * 3. จัดการสถานะสินค้า (Activate/Deactivate)
 * 4. ดูสถิติการขาย
 */

import { ref, onMounted } from "vue";
import { ethers } from "ethers";
import abi from "../abi/BookingContract.json";

// ============================================
// STATE MANAGEMENT
// จัดการ state ต่างๆ ของ component
// ============================================
const products = ref([]);           // เก็บรายการสินค้าทั้งหมด
const loading = ref(false);         // สถานะการโหลดข้อมูล
const adding = ref(false);          // สถานะการเพิ่มสินค้า
const updatingStatus = ref(null);   // ID ของสินค้าที่กำลังอัพเดทสถานะ
const addError = ref("");           // ข้อความ error จากการเพิ่มสินค้า

// ข้อมูลสินค้าใหม่ที่จะเพิ่ม
const newProduct = ref({
  name: "",
  price: "",
  maxSlots: "",
  imageUrl: "",
});

// ============================================
// UTILITY FUNCTIONS
// ฟังก์ชันช่วยเหลือต่างๆ
// ============================================

/**
 * แปลงค่า Wei เป็น Ether
 */
const formatEther = (value) => ethers.formatEther(value);

/**
 * ตรวจสอบว่าสินค้าหมดหรือไม่
 */
const isOutOfStock = (product) => {
  return Number(product.bookedSlots) >= Number(product.maxSlots);
};

/**
 * ดึงข้อความสถานะของสินค้า
 */
const getStatusText = (product) => {
  if (!product.active) return "⏸️ ปิดการขาย";
  if (isOutOfStock(product)) return "❌ สินค้าหมด";
  return "✅ เปิดขาย";
};

/**
 * ดึง CSS class สำหรับ badge สถานะ
 */
const getStatusClass = (product) => {
  if (!product.active) return "status-inactive";
  if (isOutOfStock(product)) return "status-outofstock";
  return "status-active";
};

/**
 * ดึง CSS class สำหรับ progress bar
 */
const getProgressBarClass = (product) => {
  const percentage = (Number(product.bookedSlots) / Number(product.maxSlots)) * 100;
  if (percentage >= 100) return "bg-danger";
  if (percentage >= 75) return "bg-warning";
  return "bg-success";
};

/**
 * จัดการ error รูปภาพ
 */
const handleImageError = (e) => {
  e.target.src = "https://via.placeholder.com/60x60/6366f1/ffffff?text=No+Image";
};

// ============================================
// BLOCKCHAIN INTERACTIONS
// ฟังก์ชันสำหรับติดต่อกับ Smart Contract
// ============================================

/**
 * โหลดรายการสินค้าจาก Smart Contract
 */
const loadProducts = async () => {
  loading.value = true;
  try {
    if (!window.ethereum) {
      alert("❌ กรุณาติดตั้ง MetaMask เพื่อใช้งานระบบ");
      loading.value = false;
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // ดึงข้อมูลสินค้าทั้งหมด
    const data = await contract.getProducts();

    // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้งานง่าย
    products.value = data.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      maxSlots: p.maxSlots,
      bookedSlots: p.bookedSlots,
      imageUrl: p.imageUrl,
      active: p.active,
    }));
  } catch (error) {
    console.error("Error loading products:", error);
    alert(
      "❌ ไม่สามารถโหลดข้อมูลได้\n\nกรุณาตรวจสอบ:\n1. MetaMask เชื่อมต่อแล้ว\n2. เชื่อมต่อ Sepolia Network\n3. Contract Address ถูกต้อง"
    );
  } finally {
    loading.value = false;
  }
};

/**
 * เพิ่มสินค้าใหม่เข้า Smart Contract
 */
const addProduct = async () => {
  if (!window.ethereum) {
    alert("❌ กรุณาติดตั้ง MetaMask");
    return;
  }

  adding.value = true;
  addError.value = "";

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // แปลงราคาจาก ETH เป็น Wei
    const priceInWei = ethers.parseEther(newProduct.value.price.toString());

    // ส่ง transaction ไปยัง blockchain
    const tx = await contract.addProduct(
      newProduct.value.name,
      priceInWei,
      newProduct.value.maxSlots,
      newProduct.value.imageUrl
    );

    // รอให้ transaction ถูก confirm
    await tx.wait();

    alert("🎉 เพิ่มสินค้าสำเร็จ!");
    
    // รีเซ็ตฟอร์ม
    newProduct.value = { name: "", price: "", maxSlots: "", imageUrl: "" };
    
    // โหลดรายการสินค้าใหม่
    loadProducts();
  } catch (err) {
    console.error("Error adding product:", err);
    addError.value = err.reason || err.message || "ไม่สามารถเพิ่มสินค้าได้";
  } finally {
    adding.value = false;
  }
};

/**
 * เปิด/ปิดการขายสินค้า (Toggle Active Status)
 */
const toggleProductStatus = async (productId, newStatus) => {
  if (!window.ethereum) {
    alert("❌ กรุณาติดตั้ง MetaMask");
    return;
  }

  updatingStatus.value = productId;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // เรียกฟังก์ชัน setProductActive ใน Smart Contract
    const tx = await contract.setProductActive(productId, newStatus);
    
    // รอให้ transaction ถูก confirm
    await tx.wait();

    const statusText = newStatus ? "เปิดการขาย" : "ปิดการขาย";
    alert(`✅ ${statusText}สำเร็จ!`);
    
    // โหลดข้อมูลใหม่
    loadProducts();
  } catch (err) {
    console.error("Error toggling product status:", err);
    alert(`❌ ไม่สามารถอัพเดทสถานะได้: ${err.reason || err.message}`);
  } finally {
    updatingStatus.value = null;
  }
};

// ============================================
// LIFECYCLE HOOKS
// โหลดข้อมูลเมื่อ component ถูก mount
// ============================================
onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
/* ============================================
   MAIN LAYOUT & BACKGROUND
   พื้นหลังและโครงสร้างหลักของหน้า
   ============================================ */
.admin-page {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
}

/* Animated background effect */
.admin-page::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.08) 0%,
    transparent 70%
  );
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-30px, 30px); }
}

/* ============================================
   HEADER SECTION
   ส่วนหัวของหน้า
   ============================================ */
.page-header {
  text-align: center;
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.header-icon {
  font-size: 4rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.header-text h1 {
  font-size: 3rem;
  background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.header-text p {
  font-size: 1.125rem;
  color: var(--text-muted);
}

/* ============================================
   CARD COMPONENTS
   การ์ดสำหรับแสดงเนื้อหา
   ============================================ */
.form-card,
.products-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-card:hover,
.products-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
}

/* Gradient border on top */
.form-card::before,
.products-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.title-icon {
  font-size: 1.75rem;
}

.card-title h2 {
  font-size: 1.75rem;
  color: var(--text-heading);
  font-weight: 800;
  margin: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

/* ============================================
   FORM STYLING
   สไตล์ของฟอร์ม
   ============================================ */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.label-icon {
  font-size: 1.1rem;
}

.form-group input {
  padding: 1rem 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-input);
  color: var(--text-main);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  background: #ffffff;
}

.form-group input::placeholder {
  color: #94a3b8;
}

/* ============================================
   BUTTON STYLING
   สไตล์ของปุ่มต่างๆ
   ============================================ */
.submit-button {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 1.125rem;
  font-size: 1.125rem;
  font-weight: 700;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(79, 70, 229, 0.4);
}

.submit-button:disabled {
  background: var(--bg-input);
  cursor: not-allowed;
  opacity: 0.6;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-input);
  color: var(--text-main);
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #ffffff;
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================
   ACTION BUTTONS
   ปุ่มจัดการสินค้า (Activate/Deactivate)
   ============================================ */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.activate-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.activate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.deactivate-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.deactivate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================
   TABLE STYLING
   ตารางแสดงรายการสินค้า
   ============================================ */
.table-wrapper {
  overflow-x: auto;
  border-radius: 1rem;
  border: 1px solid var(--border-color);
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-main);
}

.products-table th {
  background: #f1f5f9;
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  white-space: nowrap;
}

.products-table td {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
  vertical-align: middle;
}

.products-table tr {
  transition: all 0.2s ease;
}

.products-table tbody tr:hover {
  background: #f8fafc;
}

.row-inactive {
  opacity: 0.6;
}

/* ============================================
   TABLE CELL CONTENT
   เนื้อหาในแต่ละ cell ของตาราง
   ============================================ */
.id-badge {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
}

.product-info-cell {
  min-width: 200px;
}

.product-mini-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-thumb {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  object-fit: cover;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
}

.product-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-heading);
}

.price-cell {
  font-family: "Courier New", monospace;
  font-weight: 700;
  color: var(--secondary);
  white-space: nowrap;
}

/* Progress Bar สำหรับแสดงยอดขาย */
.slots-cell {
  min-width: 140px;
}

.mini-progress {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.mini-progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.bg-success { background: var(--success); }
.bg-warning { background: var(--warning); }
.bg-danger { background: var(--danger); }

.slots-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  white-space: nowrap;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.8rem;
  white-space: nowrap;
}

.status-active {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-inactive {
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-muted);
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.status-outofstock {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* ============================================
   LOADING & EMPTY STATES
   สถานะการโหลดและไม่มีข้อมูล
   ============================================ */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h3 {
  color: var(--text-heading);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  opacity: 0.8;
}

/* Error Message */
.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  border-radius: 0.75rem;
  color: var(--danger);
  font-weight: 600;
  text-align: center;
  margin-top: 1rem;
}

/* ============================================
   ANIMATIONS
   Animation effects
   ============================================ */
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.slide-in {
  animation: slideIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ============================================
   RESPONSIVE DESIGN
   ปรับแต่งสำหรับหน้าจอขนาดเล็ก
   ============================================ */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .refresh-button {
    width: 100%;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-icon {
    font-size: 3rem;
  }

  .header-text h1 {
    font-size: 2rem;
  }

  .table-wrapper {
    font-size: 0.875rem;
  }

  .products-table th,
  .products-table td {
    padding: 0.75rem;
  }
}
</style>
