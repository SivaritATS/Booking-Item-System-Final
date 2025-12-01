<template>
  <div class="book-page">
    <div class="container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading product details...</p>
      </div>

      <div v-else-if="product" class="booking-card fade-in">
        <div class="card-header">
          <h1>🎫 ยืนยันการจอง</h1>
          <p>ตรวจสอบรายละเอียดก่อนการยืนยันการจอง</p>
        </div>

        <div class="product-showcase">
          <div class="showcase-image">
            <img
              :src="product.imageUrl"
              alt="Product Image"
              @error="handleImageError"
            />
          </div>

          <div class="showcase-details">
            <h2 class="product-title">{{ product.name }}</h2>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-icon">💰</div>
                <div class="info-content">
                  <span class="info-label">ราคา</span>
                  <span class="info-value"
                    >{{ formatEther(product.price) }} ETH</span
                  >
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">📊</div>
                <div class="info-content">
                  <span class="info-label">จำนวนที่มี</span>
                  <span class="info-value"
                    >{{ product.maxSlots - product.bookedSlots }} /
                    {{ product.maxSlots }}</span
                  >
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">🔒</div>
                <div class="info-content">
                  <span class="info-label">วิธีการชำระเงิน</span>
                  <span class="info-value">MetaMask (Sepolia)</span>
                </div>
              </div>
            </div>

            <div class="action-section">
              <button
                @click="bookProduct"
                :disabled="
                  booking ||
                  !product.active ||
                  product.bookedSlots >= product.maxSlots
                "
                class="confirm-button"
              >
                <span v-if="booking">⏳ Processing...</span>
                <span v-else
                  >✨ ยืนยันการจอง {{ formatEther(product.price) }} ETH</span
                >
              </button>

              <button @click="$router.push('/')" class="cancel-button">
                ← กลับหน้าแรก
              </button>
            </div>

            <p v-if="error" class="error-message">❌ {{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else class="error-state">
        <div class="error-icon">😕</div>
        <h3>สินค้าไม่พบ</h3>
        <p>สินค้าที่คุณกำลังมองหาไม่มีอยู่</p>
        <button @click="$router.push('/')" class="back-button">
          ← กลับหน้าแรก
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import abi from "../abi/BookingContract.json";

// ใช้สำหรับดึงค่าจาก URL และเปลี่ยนหน้า
const route = useRoute();
const router = useRouter();
const productId = route.params.id; // รับ ID สินค้าจาก URL

// ตัวแปรเก็บข้อมูลสินค้า
const product = ref(null);
const loading = ref(true); // สถานะโหลดข้อมูล
const booking = ref(false); // สถานะกำลังจอง
const error = ref(""); // เก็บข้อความ Error

// แปลงหน่วยเงินจาก Wei เป็น Ether
const formatEther = (value) => ethers.formatEther(value);

// จัดการกรณีรูปภาพโหลดไม่สำเร็จ
const handleImageError = (e) => {
  e.target.src =
    "https://via.placeholder.com/600x400/6366f1/ffffff?text=Product+Image";
};

// ดึงข้อมูลสินค้าจาก Blockchain
const fetchProduct = async () => {
  try {
    let provider;
    // ตรวจสอบว่ามี MetaMask หรือไม่
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      // ถ้าไม่มี MetaMask ให้ใช้ RPC URL สำรอง (ถ้ามี)
      const rpcUrl = import.meta.env.VITE_RPC_URL;
      if (rpcUrl && !rpcUrl.includes("YOUR_KEY")) {
        provider = new ethers.JsonRpcProvider(rpcUrl);
      } else {
        console.warn("No Web3 provider found");
        loading.value = false;
        return;
      }
    }

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // เรียกข้อมูลสินค้าชิ้นเดียวจาก Smart Contract
    const p = await contract.products(productId);

    // เก็บข้อมูลลงตัวแปร
    product.value = {
      id: p.id,
      name: p.name,
      price: p.price,
      maxSlots: p.maxSlots,
      bookedSlots: p.bookedSlots,
      imageUrl: p.imageUrl,
      active: p.active,
    };
  } catch (err) {
    console.error("Error fetching product:", err);
    error.value = "Failed to load product details.";
    Swal.fire({
      icon: 'error',
      title: 'ไม่สามารถโหลดข้อมูลสินค้า',
      text: 'กรุณาลองใหม่อีกครั้งในภายหลัง',
      confirmButtonColor: '#ef4444'
    });
  } finally {
    loading.value = false;
  }
};

// ฟังก์ชันจองสินค้า
const bookProduct = async () => {
  // ตรวจสอบ MetaMask ก่อน
  if (!window.ethereum) {
    Swal.fire({
      icon: 'error',
      title: 'ไม่พบ MetaMask',
      text: 'กรุณาติดตั้ง MetaMask เพื่อทำการจองสินค้า',
      confirmButtonColor: '#6366f1'
    });
    return;
  }

  booking.value = true;
  error.value = "";

  try {
    // เชื่อมต่อ Blockchain ผ่าน MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(); // ต้องใช้ Signer เพื่อทำธุรกรรม (จ่ายเงิน)
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // ส่ง transaction จองสินค้า พร้อมแนบเงิน (value) ไปด้วย
    const tx = await contract.bookProduct(productId, {
      value: product.value.price,
    });

    // แสดง popup รอ transaction
    Swal.fire({
      title: 'กำลังดำเนินการจอง...',
      text: 'กรุณารอสักครู่ Transaction กำลังถูกยืนยัน',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // รอให้ transaction เสร็จสมบูรณ์
    await tx.wait();

    // แจ้งเตือนสำเร็จและกลับหน้าแรก
    Swal.fire({
      icon: 'success',
      title: 'จองสำเร็จ!',
      text: 'ขอบคุณที่ใช้บริการ',
      confirmButtonColor: '#10b981',
      timer: 2000
    }).then(() => {
      router.push("/");
    });

  } catch (err) {
    console.error("Booking error:", err);
    error.value = err.reason || err.message || "Booking failed.";
    Swal.fire({
      icon: 'error',
      title: 'การจองล้มเหลว',
      text: error.value,
      confirmButtonColor: '#ef4444'
    });
  } finally {
    booking.value = false;
  }
};

// เมื่อหน้าเว็บโหลดเสร็จ ให้ดึงข้อมูลสินค้า
onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
.book-page {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.booking-card {
  max-width: 950px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 2.5rem;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.card-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 2.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  animation: rotate 15s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.card-header h1 {
  font-size: 2.25rem;
  margin-bottom: 0.625rem;
  color: white;
  font-weight: 800;
  position: relative;
  z-index: 1;
  letter-spacing: -0.01em;
}

.card-header p {
  opacity: 0.95;
  font-size: 1.125rem;
  position: relative;
  z-index: 1;
  font-weight: 500;
}

.product-showcase {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  padding: 2.5rem;
}

.showcase-image {
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  position: relative;
  background: #f1f5f9;
}

.showcase-image::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(168, 85, 247, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.showcase-image:hover::before {
  opacity: 1;
}

.showcase-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 450px;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.showcase-image:hover img {
  transform: scale(1.05);
}

.showcase-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-title {
  font-size: 2.25rem;
  color: var(--text-main);
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #f1f5f9;
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateX(5px);
}

.info-icon {
  font-size: 2.25rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 600;
}

.info-value {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: auto;
}

.confirm-button {
  width: 100%;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 1.375rem;
  font-size: 1.25rem;
  font-weight: 700;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.35);
  position: relative;
  overflow: hidden;
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 20px 45px rgba(99, 102, 241, 0.45);
  filter: brightness(1.1);
}

.confirm-button:disabled {
  background: var(--gray-700);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

.cancel-button,
.back-button {
  width: 100%;
  background: #f1f5f9;
  color: var(--text-main);
  padding: 1.125rem;
  font-size: 1rem;
  font-weight: 700;
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover,
.back-button:hover {
  background: #ffffff;
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  border-radius: 0.75rem;
  color: var(--danger);
  font-weight: 600;
  text-align: center;
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: var(--text-main);
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error-state p {
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .product-showcase {
    grid-template-columns: 1fr;
  }

  .showcase-image img {
    min-height: 250px;
  }

  .card-header h1 {
    font-size: 1.5rem;
  }

  .product-title {
    font-size: 1.5rem;
  }
}
</style>
