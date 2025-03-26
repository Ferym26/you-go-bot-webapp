import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ru from 'element-plus/dist/locale/ru.mjs'

import './assets/styles/index.scss'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, {
	locale: ru,
})

app.mount('#app')
