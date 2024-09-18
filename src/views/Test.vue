<template>
  <div class="quiz-container">
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: progressBarWidth + '%' }"></div>
    </div>
    
    <div class="question">
      Вы едете по общественной дороге и видите впереди группу велосипедистов, которые занимают всю полосу движения. Как вам следует поступить?
    </div>
    
    <div class="options">
      <button
        v-for="(option, index) in options"
        :key="index"
        class="option-button"
        :class="{'selected': selectedOption === index}"
        @click="selectOption(index)"
      >
        {{ option }}
      </button>
    </div>
    
    <div class="footer">
      <button class="hint-button">Подсказка</button>
      <button class="next-button">Далее</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      options: [
        "Продолжить движение с обычной скоростью, так как они должны уступить вам путь.",
        "Снизить скорость и быть готовым остановиться.",
        "Просигналить, чтобы велосипедисты отошли на обочину.",
        "Объехать велосипедистов, выехав на встречную полосу."
      ],
      selectedOption: null,
      countdown: 15,
      progressBarWidth: 100,
    };
  },
  mounted() {
    this.startCountdown();
  },
  methods: {
    selectOption(index) {
      this.selectedOption = index;
    },
    startCountdown() {
      const interval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
          this.progressBarWidth = (this.countdown / 15) * 100;
        } else {
          clearInterval(interval);
        }
      }, 1000);
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
  /* background: linear-gradient(to bottom, #5d7fc1, #96cdf7); */
  color: white;
  font-family: Arial, sans-serif;
}

.progress-bar-container {
  width: 100%;
  height: 15px;
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

.question {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.options {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  margin-bottom: 0px;
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

.option-button:hover {
  background-color: #ffbd59;
}

.selected {
  background-color: #ffbd59;
  color: white;
}

.footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 500px;
  margin-bottom: 7vh;
}

.hint-button, .next-button {
  background-color: #cb6ce6;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  width: 17vh; /* Set a fixed width */
  height: 6vh; /* Set a fixed height */
  font-size: 1.3rem;
  font-weight: 700;
}

.hint-button {
  background-color: #cb6ce6;
}

.hint-button:hover {
  background-color: #cb6ce6;
}

.next-button {
  background-color: #cb6ce6;
}

.next-button:hover {
  background-color: #cb6ce6;
}
</style>
