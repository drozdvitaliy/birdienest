<template>
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>
  </template>
  
  <script>
  import confetti from 'canvas-confetti';
  
  export default {
    name: 'Confetti',
    mounted() {
      // Adjust the canvas size to cover the entire viewport
      const canvas = this.$refs.confettiCanvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  
      // Listen for window resize to adjust canvas size
      window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      handleResize() {
        const canvas = this.$refs.confettiCanvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      },
      launchConfetti() {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d87e97', '#355d87', '#ffffff'],
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .confetti-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Allows clicks to pass through */
    z-index: 9999; /* Ensures confetti appears above all other elements */
  }
  </style>
  