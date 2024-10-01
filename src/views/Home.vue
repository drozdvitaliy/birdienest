<template>
  <div class="app-background">
    <div class="start-screen">
      <h1>🌸 Время лучше узнать друг друга!</h1>
      <p>👥 Введите юзернэйм вашего партнёра, чтобы начать ваше совместное путешествие:</p>
      
      <!-- Поле для ввода юзернэйма партнёра -->
      <input
        ref="partnerInput"
        type="text"
        v-model="partnerUsername"
        placeholder="@username"
        @keyup.enter="startGame" 
      />
      
      <!-- Кнопка запуска игры -->
      <button @click="startGame">Начать игру 💖</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '@Vitaliy_Drozd',  // Юзернэйм текущего пользователя (из Telegram)
      partnerUsername: '',         // Юзернэйм партнёра (вводится пользователем)
      errorMessage: '',            // Сообщение об ошибке
    };
  },
  mounted() {
    // Извлекаем данные о текущем пользователе через Telegram API при загрузке страницы
    this.extractTelegramData();
  },
  methods: {
    extractTelegramData() {
      if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
        const user = initDataUnsafe.user;

        this.username = user ? `@${user.username}` : '@Vitaliy_Drozd';
        console.log('Текущий юзернэйм: ' + this.username);
      } else {
        console.log('Telegram WebApp object не доступен');
      }
    },
    
    async startGame() {
      // Dismiss the keyboard by blurring the input
      this.$refs.partnerInput.blur();

      if (!this.partnerUsername.startsWith('@')) {
        this.errorMessage = 'Юзернэйм должен начинаться с @.';
        return;
      }

      if (!this.username) {
        this.errorMessage = 'Ошибка: не удалось получить ваш юзернэйм.';
        return;
      }

      try {
        const response = await fetch('https://udaejtcmj5.execute-api.eu-west-2.amazonaws.com/main/gamecreation', {
          method: 'POST',
          body: JSON.stringify({
            username: this.username,               // Юзернэйм текущего пользователя
            partnerUsername: this.partnerUsername, // Юзернэйм партнёра
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();  // Получаем ответ от Lambda

        if (response.ok) {
          const { gameId, status } = data;

          // Сохраняем gameId и юзернэйм партнёра в localStorage
          localStorage.setItem('gameId', gameId);
          localStorage.setItem('partnerUsername', this.partnerUsername);

          // Перенаправляем пользователя в зависимости от статуса
          if (status === 'waiting') {
            this.$router.push(`/waiting?gameId=${gameId}`);
          } else if (status === 'ready') {
            this.$router.push(`/test?gameId=${gameId}`);
          }
        } else {
          this.errorMessage = 'Ошибка при начале игры. Попробуйте снова.';
        }
      } catch (error) {
        this.errorMessage = 'Произошла ошибка: ' + error.message;
      }
    },
  },
};
</script>




<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&family=Roboto:wght@400&display=swap');

.app-background {
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  justify-content: center;  /* Горизонтальное выравнивание по центру */
  align-items: center;      /* Вертикальное выравнивание по центру */
  padding: 0 16px;          /* Отступы по бокам */
}

/* Основной экран */
.start-screen {
  background: rgba(255, 255, 255, 0.9); /* Прозрачный белый блок */
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
}

/* Заголовок */
h1 {
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  color: #4a4a4a;
  margin-bottom: 24px;
  font-size: 26px;
  letter-spacing: 1px;
}

/* Описание */
p {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

/* Поле для ввода */
input {
  padding: 14px;
  font-size: 16px;
  border: 2px solid #d1d1e0;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 24px;
  transition: border-color 0.3s ease;
  font-family: 'Roboto', sans-serif;
}

/* Изменение цвета поля при фокусе */
input:focus {
  border-color: #b48ec1;
  outline: none;
}

/* Кнопка начала игры */
button {
  background-color: #b48ec1;
  color: white;
  padding: 14px 28px;
  font-size: 18px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Quicksand', sans-serif;
  transition: background-color 0.3s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Кнопка при наведении */
button:hover {
  background-color: #a377b0;
}

/* Сообщение об ошибке */
.error {
  color: #e74c3c;
  font-size: 14px;
  margin-top: -12px;
  font-family: 'Roboto', sans-serif;
}

</style>
