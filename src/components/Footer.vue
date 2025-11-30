<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-left">
        <div class="brand-icon">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill-rule="evenodd"
            clip-rule="evenodd"
            class="fill-current"
          >
            <path
              d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"
            ></path>
          </svg>
        </div>
        <p class="copyright-text">จัดทำโดย Sivarit ATS.</p>
      </div>

      <div class="footer-right">
        <!-- GitHub -->
        <a
          href="https://github.com/SivaritATS"
          target="_blank"
          class="social-link github"
          aria-label="GitHub"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 
              3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 
              0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.084-.729.084-.729 
              1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.304 3.492.997.108-.776.417-1.305.76-1.604-2.665-.3-5.466-1.334-5.466-5.93 
              0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 
              0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 
              1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 
              3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 
              1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 
              0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57 
              C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>
        </a>

        <!-- YouTube -->
        <a
          href="https://www.youtube.com/@LoiyZz"
          target="_blank"
          class="social-link youtube"
          aria-label="YouTube"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="fill-current"
          >
            <path
              d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
            ></path>
          </svg>
        </a>

        <!-- Facebook -->
        <a
          href="https://www.facebook.com/monsterloiy.z/"
          target="_blank"
          class="social-link facebook"
          aria-label="Facebook"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="fill-current"
          >
            <path
              d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
            ></path>
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.footer {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 1.5rem 0;
  width: 100%;
  margin-top: auto;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon svg {
  fill: var(--primary);
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.3));
}

.footer-right {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.social-link {
  color: var(--text-muted);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

/* Hover Effect per brand */
.social-link.github:hover {
  color: #000000; /* GitHub Black */
  transform: translateY(-2px);
}

.social-link.youtube:hover {
  color: #ff0000; /* YouTube Red */
  transform: translateY(-2px);
}

.social-link.facebook:hover {
  color: #1877f2; /* Facebook Blue */
  transform: translateY(-2px);
}

.fill-current {
  fill: currentColor;
}
</style>
