import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Element Plus
import ElementPlus from 'element-plus'
import ru from 'element-plus/dist/locale/ru.mjs'

// Styles
import 'element-plus/dist/index.css'
import './assets/styles/index.scss'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, {
	locale: ru,
})

app.mount('#app')
