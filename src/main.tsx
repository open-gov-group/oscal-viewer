import { render } from 'preact'
import { App } from './app'
import './styles/base.css'
import { registerSW } from 'virtual:pwa-register'

render(<App />, document.getElementById('app')!)

registerSW({
  onNeedRefresh() {
    const toast = document.createElement('div')
    toast.className = 'pwa-toast'
    toast.setAttribute('role', 'status')
    toast.textContent = 'New version available. Reload to update.'
    const btn = document.createElement('button')
    btn.textContent = 'Reload'
    btn.onclick = () => location.reload()
    toast.appendChild(btn)
    document.body.appendChild(toast)
  },
})
