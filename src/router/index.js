
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'; // Import your components
import Test from '../views/Test.vue';
import Waiting from '../views/Waiting.vue';

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
  {
    path: '/waiting',
    name: 'Waiting',
    component: Waiting,
  },
];

const router = createRouter({
  history: createWebHistory(),  // Using default history mode without custom BASE_URL
  routes,
});

export default router;