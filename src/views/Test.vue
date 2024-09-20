<template>
  <div class="quiz-container" :key="componentKey">
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: progressBarWidth + '%' }"></div>
    </div>

    <!-- Conditionally display the question and options after the timer starts -->
    <div v-if="showQuestion">
      <div class="question">
        {{ questionText }}
      </div>

      <div class="options">
        <button
          v-for="(option, index) in options"
          :key="index"
          class="option-button"
          :class="[selectedOption === index && isAnswerCorrect ? 'correct-option' : '', selectedOption === index && !isAnswerCorrect ? 'incorrect-option' : '']"
          @click="selectOption(index)"
          :disabled="timeExpired || selectedOption !== null"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <!-- Feedback message -->
    <div v-if="showFeedback" class="feedback">
      <p v-if="selectedOption !== null">
        <span v-if="isAnswerCorrect" class="correct-feedback">Правильно!</span>
        <span v-else class="incorrect-feedback">Неправильно!</span>
      </p>
      <p v-else class="timeout-feedback">Время вышло!</p>
    </div>

    <!-- Hint component with close event listener -->
    <Hint ref="hintComponent" :hint="currentHint" @close="onHintClosed" />

    <div class="footer">
      <button class="hint-button" @click="showHint">Подсказка</button>
    </div>
  </div>
</template>

<script>
import Hint from './Hint.vue';

export default {
  components: {
    Hint,
  },
  data() {
    return {
      componentKey: 0, // This is the key that will force the component to re-render
      questionText: '',
      options: [],
      originalOptions: [],
      currentHint: '',
      correctOption: null,
      originalCorrectOption: null,
      selectedOption: null,
      countdown: 15,
      progressBarWidth: 100,
      timeExpired: false,
      countdownInterval: null,
      isAnswerCorrect: null,
      showFeedback: false,
      showQuestion: false,
    };
  },
  async mounted() {
    await this.fetchQuestion();
    this.startCountdown();
  },
  methods: {
    async fetchQuestion() {
      // Clear existing question data
      this.questionText = '';
      this.options = [];
      this.currentHint = '';
      this.correctOption = null;
      this.originalCorrectOption = null;
      this.isAnswerCorrect = null;
      this.selectedOption = null;
      this.timeExpired = false;
      this.showFeedback = false;
      this.showQuestion = false;

      // Simulate an API call delay
      const simulatedApiResponse = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            questionText: "Что следует сделать при проезде пешеходного перехода?",
            options: [
              "Продолжить движение на той же скорости.",
              "Остановиться и уступить дорогу пешеходам.",
              "Просигналить пешеходам, чтобы они ускорились.",
              "Объехать пешеходов по тротуару.",
            ],
            hint: "Остановитесь и пропустите пешеходов на переходе.",
            correctOption: 1,
          });
        }, 1000); // Simulate a 1-second delay
      });

      this.questionText = simulatedApiResponse.questionText;
      this.originalOptions = simulatedApiResponse.options.slice();
      this.originalCorrectOption = simulatedApiResponse.correctOption;
      this.options = this.shuffleOptions(this.originalOptions);
      this.currentHint = simulatedApiResponse.hint;

      if (this.$refs.hintComponent) {
        this.$refs.hintComponent.hide(false);
      }
    },

    shuffleOptions(options) {
      const shuffledOptions = [...options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      const correctAnswerText = this.originalOptions[this.originalCorrectOption];
      this.correctOption = shuffledOptions.findIndex((option) => option === correctAnswerText);

      return shuffledOptions;
    },

    selectOption(index) {
      if (!this.timeExpired && this.selectedOption === null) {
        this.selectedOption = index;
        clearInterval(this.countdownInterval);
        this.timeExpired = true;
        this.isAnswerCorrect = index === this.correctOption;
        this.showFeedback = true;

        if (this.isAnswerCorrect) {
          setTimeout(() => {
            this.resetStateForNextQuestion();
          }, 2000);
        } else {
          setTimeout(() => {
            this.showHint();
          }, 2000);
        }
      }
    },

    showHint() {
      if (this.$refs.hintComponent) {
        this.$refs.hintComponent.show();
      }
    },

    onHintClosed() {
      this.resetStateForSameQuestion();
    },

    startCountdown() {
      console.log('startCountdown called');

      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }

      const countdownFunction = () => {
        if (this.countdown >= 0) {
          this.progressBarWidth = (this.countdown / 15) * 100;
          console.log(`Progress Bar Width: ${this.progressBarWidth}%, Countdown: ${this.countdown}`);
          this.countdown--;
        } else if (this.progressBarWidth == 0){
          this.progressBarWidth = 0;
          clearInterval(this.countdownInterval);
          this.timeExpired = true;
          this.showFeedback = true;
          setTimeout(() => {
            this.showHint();
          }, 1000);
        }
      };

      // Increment key to fully reset the component
      this.componentKey += 1;
      this.showQuestion = true;
      this.selectedOption = null;
      this.countdown = 15;
      this.progressBarWidth = 100;
      this.timeExpired = false;
      this.isAnswerCorrect = null;
      this.showFeedback = false;

      // Start the countdown immediately
      this.countdownInterval = setInterval(countdownFunction, 1000);
      countdownFunction();
    },

    resetStateForSameQuestion() {

      this.options = this.shuffleOptions(this.originalOptions);

      if (this.$refs.hintComponent) {
        this.$refs.hintComponent.hide(false);
      }

      this.$nextTick(() => {
        this.startCountdown();
      });
    },

    async resetStateForNextQuestion() {

      await this.fetchQuestion();

      this.$nextTick(() => {
        this.startCountdown();
      });
    },
  },
};
</script>







<style scoped>
.quiz-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
  padding: 20px;
  color: white;
  font-family: Arial, sans-serif;
}

.progress-bar-container {
  width: 100%;
  height: 10px;
  background-color: #c1c1c1;
  border-radius: 5px;
  margin-bottom: 0px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #c1ff72;
  transition: width 1s linear;
}

.content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

.question {
  text-align: center;
  font-size: 1.3rem;
  font-weight: 700;
  margin-top: 10px;
  margin-bottom: 20px;
  height: 30%;
  overflow: auto;
}

.options {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.option-button {
  background-color: #545454ad;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  margin: 10px 0;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  height: 18vw;
  transition: background-color 0.3s ease;
}

/* .option-button:hover {
  background-color: #ffbd59;
} */

.correct-option {
  background-color: green !important;
  color: white;
}

.incorrect-option {
  background-color: red !important;
  color: white;
}

.feedback {
  text-align: center;
  margin-bottom: 0px;
  margin-bottom: -7vh;
}

.correct-feedback {
  color: green;
  font-size: 1.5rem;
  font-weight: bold;
}

.incorrect-feedback {
  color: red;
  font-size: 1.5rem;
  font-weight: bold;
}

.timeout-feedback {
  color: orange;
  font-size: 1.5rem;
  font-weight: bold;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin-bottom: 7vh;
  flex-shrink: 0;
}

.hint-button {
  background-color: #cb6ce6;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  width: 19vh;
  height: 6vh;
  font-size: 1.3rem;
  font-weight: 700;
}
</style>
