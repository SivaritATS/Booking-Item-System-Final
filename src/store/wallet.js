import { reactive, computed } from "vue";

const ADMIN_ADDRESS = "0x6e7BCbD91a8560E7Dc44F9c2179eae315B9BcDb4";

const state = reactive({
  account: null,
  isConnected: false,
});

export const useWallet = () => {
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("กรุณาติดตั้ง MetaMask เพื่อใช้งานระบบ");
      return false;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      state.account = accounts[0];
      state.isConnected = true;

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          state.account = accounts[0];
        }
      });

      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("ไม่สามารถเชื่อมต่อกระเป๋าเงินได้");
      return false;
    }
  };

  const disconnectWallet = () => {
    state.account = null;
    state.isConnected = false;
  };

  const isAdmin = computed(() => {
    return state.account?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  });

  const shortAddress = computed(() => {
    if (!state.account) return "";
    return `${state.account.slice(0, 6)}...${state.account.slice(-4)}`;
  });

  return {
    account: computed(() => state.account),
    isConnected: computed(() => state.isConnected),
    isAdmin,
    shortAddress,
    connectWallet,
    disconnectWallet,
  };
};
