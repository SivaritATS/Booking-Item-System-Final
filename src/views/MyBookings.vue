<template>
  <div class="my-bookings-page">
    <div class="container">
      <div class="page-header fade-in">
        <div class="header-content">
          <div class="header-icon">🎒</div>
          <div class="header-text">
            <h1>กระเป๋าของฉัน</h1>
            <p>รายการสินค้าที่คุณได้ทำการจองไว้</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="!isConnected" class="connect-prompt">
        <div class="prompt-icon">🔒</div>
        <h3>กรุณาเชื่อมต่อกระเป๋าเงิน</h3>
        <p>เพื่อดูรายการสินค้าที่คุณจอง</p>
        <button @click="connectWallet" class="connect-btn">
          🔗 Connect MetaMask
        </button>
      </div>

      <div v-else-if="bookings.length > 0" class="bookings-grid">
        <div
          v-for="(booking, index) in bookings"
          :key="index"
          class="booking-card slide-in"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="booking-image-wrapper">
            <img
              :src="booking.product.imageUrl"
              alt="Product Image"
              class="booking-image"
              @error="handleImageError"
            />
            <div class="booking-badge">
              ✅ จองแล้ว
            </div>
          </div>

          <div class="booking-content">
            <h3 class="product-name">{{ booking.product.name }}</h3>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="label">ราคาที่จ่าย:</span>
                <span class="value">{{ formatEther(booking.product.price) }} ETH</span>
              </div>
              <div class="detail-row">
                <span class="label">วันที่จอง:</span>
                <span class="value">{{ formatDate(booking.timestamp) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Transaction ID:</span>
                <a 
                  v-if="booking.txHash"
                  :href="`https://sepolia.etherscan.io/tx/${booking.txHash}`" 
                  target="_blank" 
                  class="tx-link"
                  title="View on Etherscan"
                >
                  {{ booking.txHash.slice(0, 6) }}...{{ booking.txHash.slice(-4) }} ↗
                </a>
                <span v-else class="value">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🛍️</div>
        <h3>ยังไม่มีรายการจอง</h3>
        <p>คุณยังไม่ได้จองสินค้าใดๆ</p>
        <button @click="$router.push('/')" class="browse-btn">
          ไปเลือกซื้อสินค้า
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { ethers } from "ethers";
import abi from "../abi/BookingContract.json";
import { useWallet } from "../store/wallet";

const { account, isConnected, connectWallet } = useWallet();

const bookings = ref([]);
const loading = ref(true);

const formatEther = (value) => ethers.formatEther(value);

const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleImageError = (e) => {
  e.target.src = "https://via.placeholder.com/400x300/6366f1/ffffff?text=Product+Image";
};

const fetchBookings = async () => {
  if (!isConnected.value || !account.value) {
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // 1. ดึงข้อมูลสินค้าทั้งหมดก่อน เพื่อเอามา map รายละเอียด
    const allProducts = await contract.getProducts();
    const productsMap = {};
    allProducts.forEach((p) => {
      productsMap[p.id] = {
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
      };
    });

    // 2. ดึงข้อมูล Events เพื่อหา Transaction Hash
    // ใช้ Event Logs แทน getUserBookings เพราะต้องการ Transaction Hash
    const filter = contract.filters.ProductBooked(null, account.value);
    const events = await contract.queryFilter(filter);

    // 3. Map ข้อมูลการจองเข้ากับรายละเอียดสินค้า
    bookings.value = events.map((event) => {
      const pid = event.args[0]; // productId
      // const user = event.args[1]; // user address
      const timestamp = event.args[2]; // timestamp
      
      return {
        productId: pid,
        timestamp: timestamp,
        txHash: event.transactionHash, // ดึง Transaction Hash จาก Event Log
        product: productsMap[pid] || {
          name: "Unknown Product",
          price: 0,
          imageUrl: "",
        },
      };
    }).reverse(); // เรียงจากล่าสุดไปเก่าสุด

  } catch (error) {
    console.error("Error fetching bookings:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (isConnected.value) {
    fetchBookings();
  } else {
    loading.value = false;
  }
});

watch(account, (newAccount) => {
  if (newAccount) {
    fetchBookings();
  } else {
    bookings.value = [];
  }
});
</script>

<style scoped>
.my-bookings-page {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.header-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.header-text h1 {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.header-text p {
  color: var(--text-muted);
  font-size: 1.125rem;
}

.bookings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.booking-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.booking-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
}

.booking-image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.booking-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.booking-card:hover .booking-image {
  transform: scale(1.05);
}

.booking-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.875rem;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.booking-content {
  padding: 1.5rem;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-heading);
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 1rem;
  border: 1px solid var(--border-color);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.label {
  color: var(--text-muted);
  font-weight: 600;
}

.value {
  color: var(--text-main);
  font-weight: 700;
}

.tx-link {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.875rem;
}

.tx-link:hover {
  text-decoration: underline;
}

.loading-state,
.empty-state,
.connect-prompt {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2rem;
  margin: 0 auto;
  max-width: 500px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border: 4px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon,
.prompt-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.connect-btn,
.browse-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.connect-btn:hover,
.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

@media (max-width: 768px) {
  .bookings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
