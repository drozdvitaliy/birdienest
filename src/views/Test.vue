<template>
  <div class="countdown-background">
    <div class="countdown-container">
      <!-- Countdown Display -->
      <div v-if="count > 0" class="countdown-number">
        {{ count }}
      </div>

      <!-- Waiting for Opponent -->
      <div v-else-if="waitingForOpponent" class="waiting-container">
        <h2 class="waiting-message">Waiting for opponent to join...</h2>
      </div>

      <!-- Quiz Display -->
      <div v-else-if="showQuiz" class="quiz-container">
        <h2 class="quiz-question">{{ currentQuestion.question }}</h2>
        <ul class="quiz-options">
          <li v-for="(option, index) in currentQuestion.options" :key="index">
            <button 
              @click="selectOption(index)" 
              class="quiz-button"
              :class="{ selected: selectedOptionIndex === index }" 
              :disabled="selectedOptionIndex !== null" 
            >
              {{ option }}
            </button>
          </li>
        </ul>
        <div v-if="opponentAnswer" class="opponent-response">
          <p>Opponent's Answer: {{ opponentAnswer }}</p>
        </div>
      </div>

      <!-- Final Message -->
      <div v-else class="countdown-message">
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
      waitingForOpponent: false,
      currentQuestion: {},
      selectedOptionIndex: null,
      opponentAnswer: null,
      websocket: null,
      sessionId: null,
      gameId: null,
      username: null,
    };
  },
  mounted() {
    // Retrieve gameId and username from localStorage
    this.gameId = localStorage.getItem('gameId');
    this.username = localStorage.getItem('username'); // Ensure this is set before mounting

    if (!this.gameId || !this.username) {
      console.error('Missing gameId or username in local storage.');
      alert('Game ID or Username not found. Please start or join a game first.');
      return;
    }

    this.startCountdown();
    this.initWebSocket();
  },
  beforeUnmount() {
    clearInterval(this.countdownInterval);
    if (this.websocket) {
      this.websocket.close();
    }
  },
  methods: {
    startCountdown() {
      this.countdownInterval = setInterval(() => {
        if (this.count > 0) {
          this.count--;
        } else {
          clearInterval(this.countdownInterval);
          this.count = 0;
          // After countdown, attempt to join the game
          this.joinGame();
        }
      }, 1000);
    },
    initWebSocket() {
      const wsUrl = 'wss://ayfcf5re9e.execute-api.eu-west-2.amazonaws.com/production/'; // Replace with your actual WebSocket URL
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket connection established.');
        // Optionally, you can send a greeting message or perform other actions
      };

      this.websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('WebSocket encountered an error. Please try again later.');
      };

      this.websocket.onclose = () => {
        console.log('WebSocket connection closed.');
        // Optionally, notify the user or attempt to reconnect
      };
    },
    joinGame() {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        const payload = {
          action: 'join_game',
          data: {
            gameId: this.gameId,
            username: this.username
          }
        };
        this.websocket.send(JSON.stringify(payload));
        console.log(`Sent join_game for gameId: ${this.gameId}, username: ${this.username}`);
        this.waitingForOpponent = true;
      } else {
        console.error('WebSocket is not open. Cannot join game.');
      }
    },
    handleWebSocketMessage(message) {
      switch (message.action) {
        case 'session_start':
          this.sessionId = message.data.gameId;
          console.log('Session started with gameId:', this.sessionId);
          this.waitingForOpponent = false;
          // Optionally, request the first question immediately
          this.requestQuestion();
          break;
        case 'waiting_for_opponent':
          this.waitingForOpponent = true;
          console.log('Waiting for opponent to join...');
          break;
        case 'question':
          this.currentQuestion = {
            question: message.data.question,
            options: message.data.options,
          };
          this.showQuiz = true;
          this.opponentAnswer = null; // Reset opponent's answer for new question
          console.log('Received question:', this.currentQuestion);
          break;
        case 'opponent_answer':
          this.opponentAnswer = message.data.answer;
          console.log('Received opponent\'s answer:', this.opponentAnswer);
          break;
        case 'opponent_disconnected':
          alert('Your opponent has disconnected.');
          // Optionally, reset the quiz state or redirect the user
          this.resetQuiz();
          break;
        case 'error':
          console.error('Error from server:', message.data.message);
          alert(`Error: ${message.data.message}`);
          break;
        default:
          console.warn('Unknown action:', message.action);
      }
    },
    requestQuestion() {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        const payload = {
          action: 'send_question',
          data: {
            gameId: this.gameId
          }
        };
        this.websocket.send(JSON.stringify(payload));
        console.log('Requested question for gameId:', this.gameId);
      } else {
        console.error('WebSocket is not open. Cannot request question.');
      }
    },
    selectOption(index) {
      if (this.selectedOptionIndex !== null) return; // Prevent multiple selections

      this.selectedOptionIndex = index; // Track the selected option
      const selectedOption = this.currentQuestion.options[index];
      console.log(`Selected option: ${selectedOption}`);

      // Send the selected option to the backend
      const payload = {
        action: 'receive_answer',
        data: {
          gameId: this.gameId,
          answer: selectedOption,
        },
      };
      this.websocket.send(JSON.stringify(payload));
      console.log('Sent answer to backend.');
    },
    resetQuiz() {
      this.showQuiz = false;
      this.currentQuestion = {};
      this.selectedOptionIndex = null;
      this.opponentAnswer = null;
      this.waitingForOpponent = false;
      // Optionally, reset the countdown or navigate away
    }
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
  position: relative; /* Added for z-index management */
  z-index: 1; /* Ensure it's above .sparkles */
}

.countdown-number {
  font-family: 'Great Vibes', cursive;
  font-size: 160px;
  color: #ffffff;
  animation: pulse 1s infinite;
}

.waiting-container {
  font-family: 'Quicksand', sans-serif;
  font-size: 24px;
  color: #ffffff;
}

.waiting-message {
  animation: fadeIn 2s forwards;
}

.countdown-message p {
  font-family: 'Quicksand', sans-serif;
  font-size: 24px;
  color: #ffffff;
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

.quiz-button.selected { /* Highlight selected option */
  background-color: #355d87;
  color: #ffffff;
}

.opponent-response {
  margin-top: 20px;
  font-family: 'Quicksand', sans-serif;
  font-size: 18px;
  color: #ffffff;
}

.sparkles {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3), transparent 70%);
  animation: rotate 60s linear infinite;
  pointer-events: none; /* Prevent .sparkles from intercepting clicks */
  z-index: 0; /* Ensure it's below .countdown-container */
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
    font-size: 120px;
  }
  .countdown-message p {
    font-size: 18px;
  }
  .quiz-question {
    font-size: 24px;
  }
  .quiz-button {
    font-size: 16px;
    padding: 10px 20px;
  }
}
</style>
