// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    // 在客户端挂载后执行
    if (typeof window !== 'undefined') {
      router.onAfterRouteChanged = () => {
        setTimeout(removeVitePressText, 100)
      }
      
      // 初始挂载时执行一次
      setTimeout(removeVitePressText, 100)
      
      // 添加DOM变化监听，确保动态内容也被处理
      if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => {
          removeVitePressText()
        })
        
        setTimeout(() => {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          })
        }, 200)
      }
    }
  }
}

// 处理VitePress文本的函数
function removeVitePressText() {
  try {
    // 处理顶部导航栏中的VitePress文本
    const navBarTexts = document.querySelectorAll('.VPNavBarTitle, .VPNavBarAppearance .text')
    navBarTexts.forEach(el => {
      if (el.textContent.includes('VitePress')) {
        if (el.classList.contains('VPNavBarTitle')) {
          // 针对标题特殊处理
          const titleEl = el.querySelector('.title')
          if (titleEl && titleEl.textContent === 'VitePress') {
            titleEl.textContent = 'Iconifly'
          }
        } else {
          el.textContent = '主题'
        }
      }
    })
    
    // 处理VitePress相关链接
    const vitepressLinks = document.querySelectorAll('a[href^="https://vitepress.dev"]')
    vitepressLinks.forEach(link => {
      const parent = link.parentNode
      if (parent && parent.tagName !== 'PRE' && parent.tagName !== 'CODE') {
        // 找到包含"Powered by"的父元素并隐藏
        let container = parent
        while (container && !container.textContent.includes('Powered by') && container.tagName !== 'BODY') {
          container = container.parentNode
        }
        
        if (container && container.tagName !== 'BODY') {
          container.style.display = 'none'
        }
      }
    })
    
    // 处理移动设备视图中的VitePress文本
    const mobileTexts = document.querySelectorAll('.VPNavScreenAppearance .text')
    mobileTexts.forEach(el => {
      if (el.textContent.includes('VitePress') || el.textContent === 'Appearance') {
        el.textContent = '外观'
      }
    })
    
  } catch (e) {
    console.error('处理VitePress文本时出错:', e)
  }
}