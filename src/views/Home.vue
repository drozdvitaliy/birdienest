<template>
  <div class="home-container">
    <!-- Greeting text -->
    <h1>Здравствуйте, {{ firstName }}</h1>

    <!-- Green button with click event -->
    <div class="start-button-container">
      <button class="start-button" @click="goToTest">НАЧАТЬ</button>
    </div>

    <!-- Progress text at the bottom -->
    <p class="progress-text">Усвоено теории: {{ progress }}%</p>

    <!-- Optional: Display logs for debugging -->
    <!-- <div v-for="(log, index) in logs" :key="index">{{ log }}</div> -->
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      userId: '423268153',  // Default to '423268153', will be updated from Telegram
      firstName: 'User',    // Default name if not retrieved
      lastName: '',         // To store the Telegram user's last name
      username: '',         // To store the Telegram username
      progress: 0,          // User's progress percentage
      logs: []              // To store logs for debugging
    };
  },
  methods: {
    goToTest() {
      this.$router.push('/test');
    },
    extractTelegramData() {
      if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        this.log('Telegram object is available');

        const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
        const user = initDataUnsafe.user;

        this.userId = user ? user.id : this.userId; // Use default if not available
        this.firstName = user ? user.first_name : this.firstName;
        this.lastName = user ? user.last_name : '';
        this.username = user ? user.username : '';

        this.log('User ID: ' + this.userId);
        this.log('First Name: ' + this.firstName);
        this.log('Last Name: ' + this.lastName);
        this.log('Username: ' + this.username);

        // Fetch user data from Lambda
        this.getUserData();
      } else {
        this.log('Telegram object is not available');
      }
    },
    getUserData() {
      // Build the API endpoint
      const apiEndpoint = 'https://torx0u7d37.execute-api.eu-west-2.amazonaws.com/main/getuser';

      // Prepare the request body
      const requestBody = {
        UserID: this.userId
      };

      fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      .then(response => {
        if (!response.ok) {
          // Handle HTTP errors
          return response.json().then(errorData => {
            throw new Error(`Error ${response.status}: ${errorData.error || response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        this.log('Received data from Lambda:', data);

        // Update the component's data properties based on the response
        if (data && data.Name) {
          this.firstName = data.Name;
          this.log('Updated firstName:', this.firstName);
        }

        if (data && data.Progress !== undefined) {
          this.progress = data.Progress;
          this.log('Updated progress:', this.progress);
        } else {
          // If progress is not provided, default to 0
          this.progress = 0;
          this.log('Progress not provided in response, defaulting to 0.');
        }
      })
      .catch(error => {
        this.log('Error fetching user data from Lambda:', error.message);
        // Handle errors gracefully
        this.firstName = 'User';
        this.progress = 0;
      });
    },
    log(...messages) {
      // Simple log function to store messages in the logs array
      const message = messages.join(' ');
      this.logs.push(message);
      console.log(message); // Also log to console for debugging
    }
  },
  mounted() {
    this.extractTelegramData();
  }
};
</script>




<style scoped>
/* Main container to align everything vertically */
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100vh; /* Full height to ensure it covers the entire screen */
  color: white; /* Text color */
  padding: 15vw;
}

/* Greeting text */
h1 {
  font-size: 3rem; /* Adjust size to your preference */
  font-weight: 500;
  margin: 0 0 50vw 0; /* Space between greeting and button */
}

/* Button container */
.start-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: auto; /* Space between button and bottom text */
}

/* Button styling */
.start-button {
  background-color: #c5ff61; /* Green background */
  border: 5px solid #d46af8; /* Purple border */
  color: #d46af8; /* Purple text color */
  border-radius: 50%; /* Make the button round */
  width: 60vw; 
  height: 60vw;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem; /* Adjust text size inside the button */
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.3s ease; /* Button animation effect */
}

/* Button hover effect */
.start-button:hover {
  transform: scale(1.4); /* Slight zoom effect on hover */
}

/* Progress text at the bottom */
.progress-text {
  font-size: 6vw;
  font-weight: 700;
  margin-bottom: 30vw;
}
</style>
