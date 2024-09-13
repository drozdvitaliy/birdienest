
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'; // Import your components
import Test from '../views/Test.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/test',
    name: 'Test',
    component: Test,
  },
];

const router = createRouter({
  history: createWebHistory(),  // Using default history mode without custom BASE_URL
  routes,
});

export default router;