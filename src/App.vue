<template>
  <div id="app">
    <!-- <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/test">Test</router-link>
    </nav> -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* Ensure the app container and the body take up the full height of the viewport */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* This will apply the background to the whole app */
#app {
  background-image: url('./assets/background.jpg');  /* Keep this line to check the image */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100%;  /* Ensure the app container takes full height */
  width: 100%;   /* Ensure the app container takes full width */
  margin: 0;
  padding: 0;
}

/* Additional styles for layout */
nav {
  margin-bottom: 20px;
}
router-link {
  margin-right: 10px;
  color: white;
  text-decoration: none;
}

body {
  font-family: Arial, sans-serif;
  color: white;
}
</style>
