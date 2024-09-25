<template>
    <div v-if="showHint" class="overlay" @click.self="hide"> <!-- Close hint by clicking outside -->
      <div class="hint-box">
        {{ hint }} <!-- Display the passed hint here -->
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      hint: {  // Accept the hint prop from the parent component
        type: String,
        required: true,
      },
    },
    data() {
      return {
        showHint: false,  // Initially, the hint is hidden
      };
    },
    methods: {
      show() {
        this.showHint = true;  // Show the hint when called
      },
      hide(emitClose = true) {
        this.showHint = false;  // Hide the hint when clicking outside
        if (emitClose) {
            this.$emit('hint-closed');
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .hint-box {
    background-color: #0097b2;
    color: rgb(255, 255, 255);
    padding: 20px;
    border-radius: 20px;
    max-width: 80%;
    min-width: 50%;
    text-align: center;
    font-size: 1.2rem;
    font-weight: 700;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.5);
    overflow-wrap: break-word;  /* Ensure long words break and wrap */
  }
  </style>
  