// src/i18n.js
import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    title: "🌸 Let's Get to Know Each Other Better!",
    description: "👥 Enter your partner's username to begin your journey together:",
    inputPlaceholder: "@username",
    startGame: "Start Game 💖",
    errorUsernameStart: "Username must start with @.",
    errorUsernameFetch: "Error: Failed to retrieve your username.",
    errorGameStart: "Error starting the game. Please try again.",
    errorGeneral: "An error occurred: {error}.",
    
    // MagicCountdown Component Translations
    countdown: {
      waitingForPartner: "Waiting for partner to join...",
      nextButton: "Next",
      actionLabel: "⚡ Action:",
      waitingForPartnerNext: 'Waiting for your partner to press "Next"...',
      connectionLost: "Connection lost. Attempting to reconnect...",
    },
  },
  ru: {
    title: "🌸 Давайте лучше узнаем друг друга!",
    description: "👥 Введите юзернэйм вашего партнёра, чтобы начать ваше совместное путешествие:",
    inputPlaceholder: "@username",
    startGame: "Начать игру 💖",
    errorUsernameStart: "Юзернэйм должен начинаться с @.",
    errorUsernameFetch: "Ошибка: не удалось получить ваш юзернэйм.",
    errorGameStart: "Ошибка при начале игры. Попробуйте снова.",
    errorGeneral: "Произошла ошибка: {error}.",
    
    // MagicCountdown Component Translations
    countdown: {
      waitingForPartner: "Ожидание присоединения партнера...",
      nextButton: "Далее",
      actionLabel: "⚡ Действие:",
      waitingForPartnerNext: 'Ожидание, пока ваш партнер нажмет "Далее"...',
      connectionLost: "Соединение потеряно. Пытаемся переподключиться...",
    },
  },
  // Add more languages here
};

const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'en', // set default locale
  fallbackLocale: 'en', // Fallback to English
  messages,
});

export default i18n;
