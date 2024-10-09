<template>
  <div class="countdown-background">
    <div class="countdown-container">
      <!-- Countdown Display -->
      <div v-if="count > 0" class="countdown-number">
        {{ count }}
      </div>

      <!-- Waiting for Opponent -->
      <div v-else-if="waitingForOpponent" class="waiting-container">
        <h2 class="waiting-message">{{ $t('countdown.waitingForPartner') }}</h2>
      </div>


      <!-- Quiz Display -->
      <div v-else-if="showQuiz" class="quiz-container">
        <div class="quiz-content">
          <h2 class="quiz-question">{{ currentQuestion[dataLocale].question }}</h2>
          <ul class="quiz-options">
            <li v-for="(option, index) in currentQuestion[dataLocale].options" :key="index">
              <button 
                @click="selectOption(index)" 
                class="quiz-button"
                :class="getButtonClasses(index)"
                :disabled="selectedOptionIndex !== null || isReconnecting"
              >
                {{ option }}
              </button>
            </li>
          </ul>
        </div>
        <!-- Next Question Button -->
        <button 
          v-if="showNextButton" 
          @click="goToNextQuestion" 
          class="next-question-button"
          :disabled="nextButtonPressed"
        >
          {{ $t('countdown.nextButton') }}
        </button>
      </div>


      <!-- Action Display -->
      <div v-else-if="showAction" class="quiz-container">
        <div class="quiz-content">
          <!-- Action Label -->
          <div class="action-header">
            <h3 class="action-label">{{ $t('countdown.actionLabel') }}</h3>
          </div>
          
          <!-- Action Content -->
          <h2 class="quiz-question">{{ currentAction[dataLocale] }}</h2>
        </div>
        
        <!-- Next Question Button -->
        <button 
          v-if="showNextButton" 
          @click="goToNextQuestion" 
          class="next-question-button"
          :disabled="nextButtonPressed"
        >
          {{ $t('countdown.nextButton') }}
        </button>
      </div>

      <!-- Waiting for Opponent to Press "Next" -->
      <div v-else-if="waitingForOpponentNext" class="waiting-container">
        <h2 class="waiting-message">{{ $t('countdown.waitingForPartnerNext') }}</h2>
      </div>

      <!-- Final Message -->
      <div v-else class="countdown-message">
      </div>
    </div>
    <div class="sparkles"></div>
    <!-- Confetti Component -->
    <Confetti ref="confetti" />
    
    <!-- Connection Status Overlay -->
    <div v-if="isReconnecting" class="connection-overlay">
      <div class="overlay-content">
        <p>{{ $t('countdown.connectionLost') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Confetti from './Confetti.vue'; // Adjust the path as necessary

export default {
  name: 'MagicCountdown',
  components: {
    Confetti,
  },
  data() {
    return {
      count: 5,
      countdownInterval: null,
      showQuiz: false,
      showAction: false,
      waitingForOpponent: false,
      currentQuestion: {},
      currentAction: {},
      selectedOptionIndex: null,
      opponentAnswerIndex: null, // Tracks opponent's selected option index
      websocket: null,
      sessionId: null,
      gameId: null,
      username: null,
      isConfettiLaunched: false, // Prevent multiple confetti launches
      // Reconnection properties
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectInterval: 2000, // Start with 2 seconds
      isReconnecting: false,
      // New properties
      showNextButton: false,
      nextButtonPressed: false, // To prevent multiple presses
      startTime: null, // For tracking question start time
      userHasPressedNext: false, // Track if user pressed "Next"
      opponentHasPressedNext: false, // Track if opponent pressed "Next"
      lambdaInvoked: false, // Prevent multiple Lambda invocations
      waitingForOpponentNext: false, // Track if waiting for opponent after pressing "Next"
    };
  },
  computed: {
    // Determine the current language ('ru' or 'en') based on Vue I18n's locale
    dataLocale() {
      const locale = this.$i18n.locale.startsWith('ru') ? 'ru' : 'en';
      console.log('Current Locale:', locale);
      return locale;
    }
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
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        // If the quiz is already showing, ensure the user rejoins
        if (this.showQuiz || this.showAction) {
          this.joinGame();
        }
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', event.data);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Errors are also handled by onclose
      };

      this.websocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.reason);
        if (!this.isReconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnection();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          alert(this.$t('countdown.connectionLost')); // Use translated text
        }
      };
    },
    attemptReconnection() {
      this.isReconnecting = true;
      this.reconnectAttempts++;
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

      console.log(`Reconnection attempt ${this.reconnectAttempts} in ${delay / 1000} seconds...`);

      setTimeout(() => {
        this.initWebSocket();
      }, delay);
    },
    joinGame() {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        const payload = {
          action: 'join_game',
          data: {
            gameId: this.gameId,
            username: this.username,
          },
        };
        this.websocket.send(JSON.stringify(payload));
        console.log(`Sent join_game for gameId: ${this.gameId}, username: ${this.username}`);
        this.waitingForOpponent = true;
      } else {
        console.error('WebSocket is not open. Cannot join game.');
        // Optionally, initiate reconnection if not already attempting
        if (!this.isReconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnection();
        }
      }
    },
    handleWebSocketMessage(message) {
      console.log('Received message:', message); // Add a general log for all messages

      switch (message.action) { // Changed from message.action to message.type
        case 'session_start':
          this.sessionId = message.data.gameId;
          console.log('Session started with gameId:', this.sessionId);
          this.waitingForOpponent = false;
          // Optionally, request the first question immediately
          this.requestQuestion();
          break;
        case 'waiting_for_opponent':
          this.waitingForOpponent = true;
          console.log('Waiting for partner to join...');
          break;
        case 'question':
          if (message.data && typeof message.data === 'object') {
            const { ru, en } = message.data; // Destructure ru and en
            if (ru && en && ru.question && ru.options && en.question && en.options) {
              this.currentQuestion = {
                ru: {
                  question: ru.question,
                  options: ru.options,
                },
                en: {
                  question: en.question,
                  options: en.options,
                },
              };
              this.showQuiz = true;
              this.showAction = false;
              this.selectedOptionIndex = null;
              this.opponentAnswerIndex = null;
              this.isConfettiLaunched = false;
              this.showNextButton = false;
              this.nextButtonPressed = false;
              this.startTime = Date.now();
              this.userHasPressedNext = false;
              this.opponentHasPressedNext = false;
              this.lambdaInvoked = false;
              this.waitingForOpponentNext = false;
              console.log('Received question:', this.currentQuestion);
            } else {
              console.warn('Invalid question data format:', message.data);
            }
          }
          break;

        case 'action':
          // Handle the new action message structure
          if (message.data && typeof message.data === 'object') {
            const { ru, en } = message.data;
            if (typeof ru === 'string' && typeof en === 'string') {
              this.currentAction = {
                ru: ru,
                en: en,
              };
              this.showQuiz = false;
              this.showAction = true;
              this.selectedOptionIndex = null;
              this.opponentAnswerIndex = null; // Reset opponent's answer for new action
              this.isConfettiLaunched = false; // Reset confetti launch flag
              this.showNextButton = true; // Show the "Next" button
              this.nextButtonPressed = false; // Reset button pressed flag
              this.startTime = Date.now(); // Record start time
              this.userHasPressedNext = false;
              this.opponentHasPressedNext = false;
              this.waitingForOpponentNext = false;
              console.log('Received action:', this.currentAction);
            } else {
              console.warn('Invalid data format for action:', message.data);
              // Optionally, handle differently
            }
          } else {
            console.warn('Invalid action message format:', message);
          }
          break;
          case 'opponent_answer':
            const opponentAnswer = message.data.answer;
            const opponentIndex = this.currentQuestion[this.dataLocale].options.indexOf(opponentAnswer); // Correct access
            if (opponentIndex !== -1) {
              this.opponentAnswerIndex = opponentIndex;
              console.log(`Opponent selected option index: ${opponentIndex}`);
              // Check if user has already answered
              if (this.selectedOptionIndex !== null) {
                this.showNextButton = true;
              }
              this.checkForMatchingAnswers();
            } else {
              console.warn('Opponent selected an invalid option.');
            }
            break;
        case 'opponent_next_pressed':
          // Handle opponent pressing "Next" if necessary
          // Uncomment and implement if needed
          /*
          this.opponentHasPressedNext = true;
          console.log('Opponent has pressed "Next".');
          this.hideQuizAndWait();
          this.checkBothNextPressed();
          */
          break;
        case 'next_question_ready':
          // Extract the username from the message
          const receivedUsername = message.data.message;
          console.log(`Received next_question_ready for username: ${receivedUsername}`);

          // Compare with the current user's username
          if (receivedUsername === this.username) {
            // Execute the desired function
            this.requestQuestion();
            console.log('Usernames match. Proceeding to the next question.');
          } else {
            console.log('Usernames do not match. No action taken.');
          }
          break;
        case 'update_connection':
          // Server sends updated connection level
          const updatedCL = message.data.connectionLevel;
          console.log(`Connection Level updated to: ${updatedCL}`);
          // Optionally, update a display or state
          break;
        case 'error':
          console.error('Error from server:', message.data.message);
          alert(`Error: ${message.data.message}`);
          break;
        case 'opponent_disconnected':
          alert('Your opponent has disconnected.');
          // Optionally, reset the quiz state or redirect the user
          this.resetQuiz();
          break;
        default:
          console.warn('Unknown type:', message.type);
      }
    },
    requestQuestion() {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        const payload = {
          action: 'send_question',
          data: {
            gameId: this.gameId,
          },
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
      const selectedOption = this.currentQuestion[this.dataLocale].options[index]; // Correct access
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

      // Check if opponent has already answered
      if (this.opponentAnswerIndex !== null) {
        this.showNextButton = true;
      }
    },
    resetQuiz() {
      this.showQuiz = false;
      this.showAction = false; // Reset showAction as well
      this.currentQuestion = {};
      this.currentAction = {}; // Reset currentAction
      this.selectedOptionIndex = null;
      this.opponentAnswerIndex = null;
      this.waitingForOpponent = false;
      this.isConfettiLaunched = false;
      this.isReconnecting = false;
      this.reconnectAttempts = 0;
      this.showNextButton = false;
      this.nextButtonPressed = false;
      this.startTime = null;
      this.userHasPressedNext = false;
      this.opponentHasPressedNext = false;
      this.lambdaInvoked = false;
      this.waitingForOpponentNext = false;
      // Optionally, reset the countdown or navigate away
      this.startCountdown();
      this.initWebSocket();
    },
    getButtonClasses(index) {
      return {
        selected: this.selectedOptionIndex === index,
        'opponent-selected': this.opponentAnswerIndex === index && this.selectedOptionIndex !== index,
        matched: this.selectedOptionIndex === index && this.opponentAnswerIndex === index,
      };
    },
    checkForMatchingAnswers() {
      if (this.selectedOptionIndex === this.opponentAnswerIndex && this.selectedOptionIndex !== null) {
        // Both users selected the same option
        this.launchConfetti();
        // Call Lambda function to log the match
        // this.logMatchingAnswers();
        this.matchingresponses = true;
      }
    },
    launchConfetti() {
      if (this.isConfettiLaunched) return; // Prevent multiple confetti launches
      this.isConfettiLaunched = true;
      this.$refs.confetti.launchConfetti();
      console.log('Confetti launched for matching answers!');
    },
    goToNextQuestion() {
      if (this.nextButtonPressed) return; // Prevent multiple presses
      this.nextButtonPressed = true; // Mark as pressed
      this.userHasPressedNext = true; // Track that user has pressed "Next"

      // Calculate time spent on the question
      const endTime = Date.now();
      const timeSpent = (endTime - this.startTime) / 1000; // Time in seconds
      console.log(`Time spent on question: ${timeSpent} seconds`);

      // Hide the quiz UI and show waiting message
      this.hideQuizAndWait();

      // Prepare data to send to the backend via WebSocket
      const payload = {
        action: 'user_next_pressed',
        data: {
          gameId: this.gameId,
          username: this.username,
          timeSpent: timeSpent, // Include timeSpent in the payload
          matchingresponses: this.matchingresponses,
        },
      };

      // Send data to the backend via WebSocket
      this.websocket.send(JSON.stringify(payload));
      console.log('Sent user_next_pressed payload to backend.');
    },

    hideQuizAndWait() {
      this.showQuiz = false;
      this.showAction = false; // Hide action display as well
      this.waitingForOpponentNext = true;
    },
  },
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Quicksand:wght@400;600&display=swap');

.countdown-background {
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

  /* Enable scrolling if content overflows */
  max-height: 100vh;
  overflow-y: auto;
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
  padding: 20px;

  /* Flex layout to separate content and button */
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  /* Set maximum height and hide overflow to enable internal scrolling */
  max-height: 80vh; /* Adjust as needed */
  overflow: hidden; /* Hide overall overflow to manage scrolling within .quiz-content */
}

.quiz-content {
  overflow-y: auto;
  max-height: 70vh; /* Adjust to leave space for the "Next" button */
  scroll-behavior: smooth;
}

.quiz-question {
  font-family: 'Great Vibes', cursive;
  font-size: 36px;
  color: #ffffff;
  margin-bottom: 24px;
}

.action-label {
  font-family: 'Quicksand', sans-serif;
  font-size: 24px;
  color: #d87e97; /* A distinct color to differentiate from the question */
  margin-bottom: 10px; /* Space between label and action content */
  text-transform: uppercase; /* Optional: Makes the label uppercase */
  letter-spacing: 1px; /* Optional: Adds spacing between letters */
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
  transition: background-color 0.3s ease, color 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.quiz-button:hover {
  background-color: #ffffff;
}

.quiz-button.selected {
  background-color: #355d87;
  color: #ffffff;
}

.quiz-button.opponent-selected {
  background-color: #d87e97;
  color: #ffffff;
}

.quiz-button.matched {
  background: linear-gradient(45deg, #355d87, #d87e97);
  color: #ffffff;
}

.next-question-button {
  background: #355d87;
  color: #ffffff;
  padding: 10px 0px;
  font-size: 20px;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Quicksand', sans-serif;
  transition: transform 0.2s ease, box-shadow 0.3s ease, background 0.3s ease;
  margin-top: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 120px;
  align-self: center;
}

.next-question-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #c76d88, #2c4e6a);
}

.next-question-button:active {
  transform: translateY(1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.next-question-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(216, 126, 151, 0.5);
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

.connection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.overlay-content {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px 40px;
  border-radius: 10px;
  font-family: 'Quicksand', sans-serif;
  color: #355d87;
  font-size: 18px;
  text-align: center;
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
    font-size: 28px;
  }
  .quiz-button {
    font-size: 20px;
    padding: 10px 20px;
  }
}

.quiz-content::-webkit-scrollbar {
  width: 8px;
}

.quiz-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.quiz-content::-webkit-scrollbar-track {
  background: transparent;
}

</style>
