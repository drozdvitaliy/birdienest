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
          :class="[
            selectedOption === index && isAnswerCorrect ? 'correct-option' : '',
            selectedOption === index && !isAnswerCorrect ? 'incorrect-option' : ''
          ]"
          @click="selectOption(index, $event)"
          :disabled="timeExpired || selectedOption !== null"
          :style="(timeExpired || selectedOption !== null) ? { 'pointer-events': 'none' } : {}"
        >
          {{ option.text }}
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

    <!-- Hint component -->
    <Hint ref="hintComponent" :hint="currentHint" />

    <div class="footer">
      <button class="hint-button" @click="showHint" v-if="!showHintOnWrongAnswer">Подсказка</button>
    </div>

    <!-- Full-screen overlay to capture clicks and touches -->
    <div
      v-if="waitingForNextQuestion"
      class="click-overlay"
      @click="onScreenClick"
      @touchend="onScreenClick"
    ></div>
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
      componentKey: 0,
      questionText: '',
      options: [],
      correctOptionId: null,
      selectedOption: null,
      countdown: 15,
      progressBarWidth: 100,
      timeExpired: false,
      countdownInterval: null,
      isAnswerCorrect: null,
      showFeedback: false,
      showQuestion: false,
      userId: '',
      topicId: null,
      subtopicId: null,
      difficultyLevel: null,
      currentHint: '',
      showHintOnWrongAnswer: false,
      waitingForNextQuestion: false,
      questionStartTime: null,
    };
  },
  async mounted() {
    this.userId = localStorage.getItem('userId') || '423268153';
    await this.fetchQuestion();
    this.startCountdown();
  },
  methods: {
    async fetchQuestion() {
      this.resetQuestionData();

      // Fetch question from the API
      try {
        const response = await fetch(
          'https://torx0u7d37.execute-api.eu-west-2.amazonaws.com/main/choose_questione',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              UserID: this.userId,
            }),
          }
        );
        const data = await response.json();

        // Extract topicId and subtopicId from question_id
        const questionIdParts = data.question_id.split('-');
        this.topicId = questionIdParts[0]; // e.g., "01"
        this.subtopicId = `${questionIdParts[0]}-${questionIdParts[1]}`; // e.g., "01-04"

        // Store difficulty level
        this.difficultyLevel = data.difficulty;

        this.questionText = data.question_text;

        this.options = data.options.map((option) => ({
          text: option.text,
          optionId: option.option_id,
        }));

        this.correctOptionId = data.correct_option;
        this.currentHint = data.theory || '';

        // Shuffle the options
        this.options = this.shuffleOptions(this.options);

        if (this.$refs.hintComponent) {
          this.$refs.hintComponent.hide(false);
        }
      } catch (error) {
        console.error('Failed to fetch the question:', error);
      }
    },

    resetQuestionData() {
      this.questionText = '';
      this.options = [];
      this.correctOptionId = null;
      this.isAnswerCorrect = null;
      this.selectedOption = null;
      this.timeExpired = false;
      this.showFeedback = false;
      this.showQuestion = false;
      this.showHintOnWrongAnswer = false;
      this.waitingForNextQuestion = false;
      this.questionStartTime = null;
      this.topicId = null;
      this.subtopicId = null;
      this.difficultyLevel = null;
    },

    async selectOption(index, event) {
      event.stopPropagation();
      if (!this.timeExpired && this.selectedOption === null) {
        this.selectedOption = index;
        clearInterval(this.countdownInterval);
        this.timeExpired = true;
        this.isAnswerCorrect = this.options[index].optionId === this.correctOptionId;
        this.showFeedback = true;

        // Calculate time taken
        const timeTaken = (Date.now() - this.questionStartTime) / 1000;

        // Send POST request
        await this.sendResponseData(this.isAnswerCorrect, timeTaken);

        this.waitingForNextQuestion = true;
        if (!this.isAnswerCorrect) {
          setTimeout(() => {
            this.showHint();
            this.showHintOnWrongAnswer = true;
          }, 2000);
        }
      }
    },

    // Send response data to the server
    async sendResponseData(responseCorrect, timeTaken) {
      const postData = {
        user_id: this.userId,
        response_correct: responseCorrect,
        time_taken: timeTaken,
        difficulty_level: this.difficultyLevel,
        topic_id: this.topicId,
        subtopic_id: this.subtopicId,
      };

      try {
        const response = await fetch(
          'https://torx0u7d37.execute-api.eu-west-2.amazonaws.com/main/update_level',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
          }
        );
        const data = await response.json();
        console.log('Response from update_level:', data);
      } catch (error) {
        console.error('Failed to update level:', error);
      }
    },

    // Handle time expired scenario
    async handleTimeExpired() {
      // Time expired, so time taken is the full countdown duration
      const timeTaken = 15;

      // Send POST request with response_correct: false
      await this.sendResponseData(false, timeTaken);

      setTimeout(() => {
        this.showHint();
      }, 1000);

      this.waitingForNextQuestion = true;
    },

    onScreenClick(event) {
      event.stopPropagation();
      this.resetStateForNextQuestion();
      this.waitingForNextQuestion = false;
    },

    showHint() {
      if (this.$refs.hintComponent) {
        this.$refs.hintComponent.show();
      }
    },

    shuffleOptions(options) {
      const shuffledOptions = [...options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      return shuffledOptions;
    },

    startCountdown() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }

      this.questionStartTime = Date.now(); // Initialize the start time

      const countdownFunction = () => {
        if (this.countdown >= 0) {
          this.progressBarWidth = (this.countdown / 15) * 100;
          this.countdown--;
        } else {
          this.progressBarWidth = 0;
          clearInterval(this.countdownInterval);
          this.timeExpired = true;
          this.showFeedback = true;

          // Handle time expired
          this.handleTimeExpired();
        }
      };

      this.componentKey += 1;
      this.showQuestion = true;
      this.selectedOption = null;
      this.countdown = 15;
      this.progressBarWidth = 100;
      this.timeExpired = false;
      this.isAnswerCorrect = null;
      this.showFeedback = false;

      this.countdownInterval = setInterval(countdownFunction, 1000);
      countdownFunction();
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

.click-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

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
