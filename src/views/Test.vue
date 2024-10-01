<template>
  <div class="countdown-background">
    <div class="countdown-container">
      <!-- Countdown Display -->
      <div v-if="count > 0" class="countdown-number">
        {{ count }}
      </div>

      <!-- Quiz Display -->
      <div v-else-if="showQuiz" class="quiz-container">
        <h2 class="quiz-question">{{ currentQuestion.question }}</h2>
        <ul class="quiz-options">
          <li v-for="(option, index) in currentQuestion.options" :key="index">
            <button @click="selectOption(index)" class="quiz-button">
              {{ option }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Final Message -->
      <div v-else class="countdown-message">
        <!-- <h1>✨ Пусть начнётся магия! ✨</h1> -->
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
      showQuiz: false,
      currentQuestion: {
        question: 'Что ты ценишь больше всего в нашем общении?',
        options: [
          'Открытость и честность ',
          'Общие интересы и хобби',
          'Поддержку и понимание',
          'Совместное чувство юмора',
        ],
      },
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
        if (this.count > 0) {
          this.count--;
        } else {
          clearInterval(this.countdownInterval);
          this.count = 0;
          this.showQuiz = true; // Show the quiz after countdown reaches 1
        }
      }, 1000);
    },
    selectOption(index) {
      // Handle the selected option
      const selectedOption = this.currentQuestion.options[index];
      console.log(`Вы выбрали: ${selectedOption}`);
      // Proceed to the next step, such as navigating to another page or showing the next question
      // For example:
      // this.$router.push('/next-question');
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
  padding: 0 20px;
  text-align: center;
}

.countdown-number {
  font-family: 'Great Vibes', cursive;
  font-size: 160px;
  color: #ffffff;
  animation: pulse 1s infinite;
}

.countdown-message h1 {
  font-family: 'Great Vibes', cursive;
  font-size: 64px;
  color: #ffffff;
  animation: fadeIn 2s forwards;
}

.quiz-container {
  background-color: rgba(0, 0, 0, 0.6); /* Dark semi-transparent background */
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  animation: fadeIn 1s forwards;
}

.quiz-question {
  font-family: 'Great Vibes', cursive;
  /* font-family: 'Quicksand', sans-serif; */
  font-size: 36px;
  color: #ffffff;
  padding: 20px;
  margin-bottom: 24px;
}

.quiz-options {
  list-style: none;
  padding: 0;
}

.quiz-options li {
  margin-bottom: 16px;
}

.quiz-button {
  background-color: rgba(255, 255, 255, 0.9);
  color: #355d87;
  padding: 14px 28px;
  font-size: 18px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Great Vibes', cursive;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.quiz-button:hover {
  background-color: #ffffff;
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

/* Responsive adjustments */
@media (max-width: 600px) {
  .countdown-number {
    font-size: 120px;
  }
  .countdown-message h1 {
    font-size: 48px;
  }
  .quiz-question {
    font-size: 36px;
  }
  .quiz-button {
    font-size: 24px;
    font-weight: 100;
  }
}
</style>
