import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(createPinia())

// Auto-focus directive for modals
app.directive('focus', { mounted: (el) => el.focus() })

app.mount('#app')
