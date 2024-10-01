<template>
  <div class="countdown-background">
    <div class="countdown-container">
      <div v-if="count > 0" class="countdown-number">
        {{ count }}
      </div>
      <div v-else class="countdown-message">
        <h1>✨ Пусть начнётся магия! ✨</h1>
      </div>
    </div>
    <div class="sparkles"></div>
  </div>
</template>

<script>
export default {
  name: 'MagicCountdown',
  data() {
    return {
      count: 5,
      countdownInterval: null,
    };
  },
  mounted() {
    this.startCountdown();
  },
  beforeUnmount() {
    clearInterval(this.countdownInterval);
  },
  methods: {
    startCountdown() {
      this.countdownInterval = setInterval(() => {
        if (this.count > 1) {
          this.count--;
        } else {
          clearInterval(this.countdownInterval);
          this.count = 0;
          // Trigger any action after countdown finishes
          // For example, navigate to the next page:
          // this.$router.push('/next-page');
        }
      }, 1000);
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Quicksand:wght@400;600&display=swap');

.countdown-background {
  /* background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); */
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.countdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.countdown-number {
  font-family: 'Great Vibes', cursive;
  font-size: 10px;
  color: #ffffff;
  animation: pulse 1s infinite;
}

.countdown-message h1 {
  font-family: 'Great Vibes', cursive;
  font-size: 200px;
  color: #ffffff;
  animation: fadeIn 2s forwards;
}

.sparkles {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3), transparent 70%);
  animation: rotate 60s linear infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  70% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .countdown-number {
    font-size: 300px;
  }
  .countdown-message h1 {
    font-size: 50px;
  }
}
</style>
