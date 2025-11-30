<template>
  <div class="home-page">
    <div class="hero-section">
      <h1 class="hero-title fade-in">🎫 ยินดีต้อนรับเข้าสู้ระบบจองสินค้าด้วย Blockchain</h1>
    </div>

    <div class="container">
      <!-- Wallet Connection Prompt -->
      <div v-if="!isConnected" class="connection-prompt fade-in">
        <div class="prompt-icon">🔒</div>
        <div class="Metamask-text">กรุณาเชื่อมต่อ MetaMask</div>

        <button @click="handleConnect" class="connect-button-large">
          🔗 Connect MetaMask
        </button>
      </div>

      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดสินค้า...</p>
      </div>

      <div v-else-if="products.length > 0" class="products-grid">
        <div
          v-for="(product, index) in products"
          :key="product.id"
          class="product-card fade-in"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="product-image-wrapper">
            <img
              :src="product.imageUrl"
              alt="Product Image"
              class="product-image"
              @error="handleImageError"
            />
            <div
              v-if="Number(product.bookedSlots) >= Number(product.maxSlots)"
              class="sold-out-badge"
            >
              สินค้าหมดแล้ว
            </div>
            <div v-else-if="!product.active" class="inactive-badge">
              INACTIVE
            </div>
          </div>

          <div class="product-content">
            <h3 class="product-name">{{ product.name }}</h3>

            <div class="product-details">
              <div class="detail-item">
                <span class="detail-label">💰 ราคา</span>
                <span class="detail-value"
                  >{{ formatEther(product.price) }} ETH</span
                >
              </div>

              <div class="detail-item">
                <span class="detail-label">📊 จำนวนที่มีอยู่</span>
                <div class="slots-info">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{
                        width: `${
                          (Number(product.bookedSlots) /
                            Number(product.maxSlots)) *
                          100
                        }%`,
                      }"
                    ></div>
                  </div>
                  <span class="slots-text" :class="getSlotClass(product)">
                    {{ product.bookedSlots.toString() }} /
                    {{ product.maxSlots.toString() }} ชิ้น
                  </span>
                </div>
              </div>
            </div>

            <button
              @click="goToBook(product.id)"
              :disabled="
                !product.active ||
                Number(product.bookedSlots) >= Number(product.maxSlots)
              "
              class="book-button"
              :class="{ 'is-sold-out': Number(product.bookedSlots) >= Number(product.maxSlots) }"
            >
              <span
                v-if="Number(product.bookedSlots) >= Number(product.maxSlots)"
                class="sold-out-text"
                >❌ หมดแล้วจ้า</span
              >
              <span v-else-if="!product.active">⏸️ Inactive</span>
              <span v-else>✨ จองเลยยยย</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>ไม่มีสินค้าที่มีอยู่</h3>
        <p>Check back later for new products!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ethers } from "ethers";
import abi from "../abi/BookingContract.json";
import { useWallet } from "../store/wallet";

const products = ref([]);
const loading = ref(true);
const router = useRouter();
const { isConnected, connectWallet } = useWallet();

const handleConnect = async () => {
  const success = await connectWallet();
  if (success) {
    fetchProducts();
  }
};

const formatEther = (value) => ethers.formatEther(value);

const getSlotClass = (product) => {
  const percentage =
    (Number(product.bookedSlots) / Number(product.maxSlots)) * 100;
  if (percentage >= 90) return "slots-critical";
  if (percentage >= 50) return "slots-warning";
  return "slots-available";
};

const handleImageError = (e) => {
  e.target.src =
    "https://via.placeholder.com/400x300/6366f1/ffffff?text=Product+Image";
};

const goToBook = (id) => {
  router.push(`/book/${id}`);
};

const fetchProducts = async () => {
  try {
    if (!window.ethereum) {
      alert("กรุณาติดตั้ง MetaMask เพื่อใช้งานระบบ");
      loading.value = false;
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

    const contract = new ethers.Contract(contractAddress, abi, provider);
    const data = await contract.getProducts();

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
    console.error("Error fetching products:", error);
    alert(
      "❌ ไม่สามารถโหลดข้อมูลได้\n\nกรุณาตรวจสอบ:\n1. MetaMask เชื่อมต่อแล้ว\n2. Contract Address ถูกต้อง\n3. เชื่อมต่อ Sepolia Network"
    );
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (isConnected.value) {
    fetchProducts();
  } else {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 3rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08) 0%,
    rgba(168, 85, 247, 0.08) 50%,
    rgba(6, 182, 212, 0.08) 100%
  );
  position: relative;
  overflow: hidden;
  margin-bottom: 3rem;
  border-bottom: 1px solid var(--border-color);
}

.hero-section::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.1) 0%,
    transparent 70%
  );
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  position: relative;
  z-index: 1;
  letter-spacing: -0.02em;
  text-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
}

.connection-prompt {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.connection-prompt::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%);
}

.prompt-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.4));
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.Metamask-text {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
  animation: wiggle 2s ease-in-out infinite;
  transform-origin: center;
}

@keyframes wiggle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  15% { transform: scale(1.05) rotate(-1deg); }
  30% { transform: scale(1.05) rotate(1deg); }
  45% { transform: scale(1.05) rotate(-0.5deg); }
  60% { transform: scale(1.05) rotate(0.5deg); }
  75% { transform: scale(1.05) rotate(-0.25deg); }
  90% { transform: scale(1.02) rotate(0.25deg); }
}

.connect-button-large {
  padding: 1.25rem 2.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.connect-button-large:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.5);
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.product-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1.75rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  position: relative;
}

.product-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(255, 255, 255, 1);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: brightness(0.9);
}

.product-card:hover .product-image {
  transform: scale(1.1) rotate(1deg);
  filter: brightness(1);
}

.sold-out-badge,
.inactive-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.sold-out-badge {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.inactive-badge {
  background: rgba(71, 85, 105, 0.9);
  color: white;
}

.product-content {
  padding: 1.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.product-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-heading);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.875rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: #f1f5f9;
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}

.detail-value {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
}

.slots-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--success) 0%,
    var(--warning) 50%,
    var(--danger) 100%
  );
  transition: width 0.3s ease;
  border-radius: 1rem;
}

.slots-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.slots-available {
  color: var(--success);
}

.slots-warning {
  color: var(--warning);
}

.slots-critical {
  color: var(--danger);
}

.book-button {
  width: 100%;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 1.125rem;
  font-size: 1.125rem;
  font-weight: 700;
  border: none;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.book-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.5);
  filter: brightness(1.1);
}

.book-button:disabled {
  background: var(--bg-input);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

/* Sold Out Button Style */
.book-button.is-sold-out {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
  opacity: 1 !important;
  border: none;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
  color: white !important;
}

.sold-out-text {
  color: white !important;
  font-weight: 800;
  font-size: 1.125rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.empty-state h3 {
  color: var(--text-heading);
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1.125rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
    padding: 0;
  }
}
</style>
