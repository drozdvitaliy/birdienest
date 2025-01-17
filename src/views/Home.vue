<template>
  <div class="app-background" @click="handleGlobalClick">
    <!-- Language Switcher -->
    <LanguageSwitcher />
    <!-- Start Screen -->
    <div class="start-screen" @click.stop>
      <h1>{{ $t('title') }}</h1>
      <p>{{ $t('description') }}</p>
      
      <!-- Partner Username Input -->
      <input
        ref="partnerInput"
        type="text"
        v-model="partnerUsername"
        placeholder="@username"
        @focus="onInputFocus"
        @keyup.enter="startGame" 
      />
      
      <!-- Start Game Button -->
      <button @click="startGame">{{ $t('startGame') }}</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import LanguageSwitcher from './LanguageSwitcher.vue';

export default {
  data() {
    return {
      username: '@Vitaliy_Drozd',  // Current user's username (from Telegram)
      partnerUsername: '',         // Partner's username (user input)
      errorMessage: '',            // Error message
    };
  },
  components: {
    LanguageSwitcher,
  },
  mounted() {
    // Extract user data via Telegram API on page load
    this.extractTelegramData();
    
    // Add global click listeners to detect clicks outside the language switcher
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('touchstart', this.handleClickOutside);
  },
  beforeUnmount() {
    // Remove the event listeners when the component is destroyed
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('touchstart', this.handleClickOutside);
  },
  methods: {
    extractTelegramData() {
      if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
        const user = initDataUnsafe.user;

        // Extract the username
        this.username = user ? `@${user.username}` : '@Vitaliy2';
        console.log('Current username: ' + this.username);

        // Extract the language code
        const supportedLanguages = ['en', 'ru']; // List of supported language codes
        const userLanguageCode = user && user.language_code ? user.language_code : 'en';

        // Check if the user's language is supported; if not, default to English
        this.$i18n.locale = supportedLanguages.includes(userLanguageCode) ? userLanguageCode : 'en';
        console.log('Current language: ' + this.$i18n.locale);
      } else {
        console.log('Telegram WebApp object not available');
      }
    },
    
    setLanguage(locale) {
      if (this.$i18n) {
        this.$i18n.locale = locale;
        console.log(`App language set to: ${locale}`);
      } else {
        console.warn('vue-i18n is not configured.');
      }
    },
    
    async startGame() {
      // Dismiss the keyboard by blurring the input
      if (this.$refs.partnerInput) {
        this.$refs.partnerInput.blur();
      }

      if (!this.partnerUsername.startsWith('@')) {
        this.errorMessage = this.$t('errorUsernameStart');
        return;
      }

      if (!this.username) {
        this.errorMessage = this.$t('errorUsernameFetch');
        return;
      }

      try {
        const response = await fetch('https://udaejtcmj5.execute-api.eu-west-2.amazonaws.com/main/gamecreation', {
          method: 'POST',
          body: JSON.stringify({
            username: this.username,               // Current user's username
            partnerUsername: this.partnerUsername, // Partner's username
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();  // Get response from Lambda

        if (response.ok) {
          const { gameId, status } = data;

          // Save gameId and partner's username in localStorage
          localStorage.setItem('gameId', gameId);
          localStorage.setItem('username', this.username);
          localStorage.setItem('partnerUsername', this.partnerUsername);

          // Redirect user based on status
          this.$router.push(`/test?gameId=${gameId}`);
        } else {
          this.errorMessage = this.$t('errorGameStart');
        }
      } catch (error) {
        this.errorMessage = this.$t('errorGeneral', { error: error.message });
      }
    },
    
    handleClickOutside(event) {
      // Optional: Implement if needed for other elements
    },

    onInputFocus() {
      if (this.$refs.partnerInput) {
        this.$refs.partnerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600&family=Noto+Serif:wght@600&display=swap');

/* General Styles */
.app-background {
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  position: relative; /* To position the language switcher */
  padding: 0 16px;          /* Side padding */
  overflow-y: auto;         /* Allow vertical scrolling */
}

/* Start Screen */
.start-screen {
  margin: 100px auto 0 auto; /* Center horizontally with top margin */
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
}

/* Heading */
h1 {
  font-family: 'Noto Serif', serif;
  font-weight: 600;
  color: #4a4a4a;
  margin-bottom: 24px;
  font-size: 26px;
  letter-spacing: 1px;
}

/* Description */
p {
  font-family: 'Noto Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

/* Input Field */
input {
  padding: 14px;
  font-size: 16px;
  border: 2px solid #d1d1e0;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 24px;
  transition: border-color 0.3s ease;
  font-family: 'Noto Sans', sans-serif;
}

/* Input Focus */
input:focus {
  border-color: #b48ec1;
  outline: none;
}

/* Start Game Button */
button {
  background-color: #355d87;
  color: white;
  padding: 14px 28px;
  font-size: 18px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Noto Sans', sans-serif;
  transition: background-color 0.3s ease;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

/* Error Message */
.error {
  color: #e74c3c;
  font-size: 18px;
  margin-top: 10px;
  font-family: 'Noto Sans', sans-serif;
}
</style>
