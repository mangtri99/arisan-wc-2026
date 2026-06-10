import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { inject } from '@vercel/analytics'
import App from './App.vue'
import './style.css'

inject()
createApp(App).use(createPinia()).mount('#app')
