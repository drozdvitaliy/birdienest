<template>
    <div class="app-background">
      <div class="waiting-screen">
        <h1>⏳ Ожидаем игрока {{ partnerUsername }} ...</h1>
        <div class="loader"></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        partnerUsername: '', // Юзернэйм партнёра, которого ожидаем
        socket: null,        // WebSocket объект
      };
    },
    mounted() {
      // Извлекаем юзернэйм партнёра из localStorage
      const storedPartnerUsername = localStorage.getItem('partnerUsername');
      if (storedPartnerUsername) {
        this.partnerUsername = storedPartnerUsername;
      }
  
      // Извлечение gameId из localStorage
      const gameId = localStorage.getItem('gameId');
      console.log('Текущий gameId: ' + gameId);
  
      // Подключение к WebSocket API
      this.connectToWebSocket(gameId);
    },
    methods: {
      connectToWebSocket(gameId) {
        const wsUrl = 'wss://g6ke9kpddl.execute-api.eu-west-2.amazonaws.com/production/'; // WebSocket URL
        this.socket = new WebSocket(wsUrl);
  
        this.socket.onopen = () => {
          console.log('WebSocket соединение установлено');
          // Отправляем gameId через WebSocket после подключения
          this.sendGameId(gameId);
        };
  
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Получено сообщение через WebSocket:', message);
  
            // Сохраняем connectionId в localStorage
            if (message.connectionId) {
              localStorage.setItem('connectionId', message.connectionId);
              console.log('connectionId сохранен: ', message.connectionId);
            }
  
            // Если статус игры изменился на ready, перенаправляем на страницу теста
            if (message.status === 'ready') {
              console.log('Game ready, redirecting to /test');
              this.$router.push(`/test?gameId=${message.gameId}`);
            }
          } catch (err) {
            console.error('Ошибка при обработке сообщения:', err, 'Данные:', event.data);
          }
        };
  
        this.socket.onclose = () => {
          console.log('WebSocket соединение закрыто');
        };
  
        this.socket.onerror = (error) => {
          console.log('WebSocket ошибка: ', error);
        };
      },
      sendGameId(gameId) {
        // Отправка идентификатора игры через WebSocket после подключения
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          const connectionId = localStorage.getItem('connectionId');
          const payload = JSON.stringify({
            action: 'sendGameId',
            gameId: gameId,
            connectionId: connectionId
          });
          console.log('Отправляем данные через WebSocket:', payload);
          this.socket.send(payload);
        } else {
          console.log('WebSocket не готов для отправки сообщений');
        }
      }
    },
    beforeDestroy() {
      // Закрытие WebSocket соединения при уходе со страницы
      if (this.socket) {
        this.socket.close();
      }
    }
  };
  </script>
  
  
  <style scoped>
  .app-background {
    background-size: cover;
    background-position: center;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 16px;
  }
  
  .waiting-screen {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 15px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 420px;
    box-sizing: border-box;
  }
  
  /* Стиль для заголовка */
  h1 {
    font-family: 'Quicksand', sans-serif;
    font-weight: 600;
    color: #4a4a4a;
    margin-bottom: 24px;
    font-size: 24px;
    letter-spacing: 1px;
  }
  
  /* Стили для анимации загрузки */
  .loader {
    border: 6px solid #da0d95;
    border-top: 6px solid #4a4a4a;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
  
  /* Анимация вращения */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  