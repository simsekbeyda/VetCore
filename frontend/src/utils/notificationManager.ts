/**
 * Tarayıcı Bildirimleri Yardımcısı
 * Web Notifications API'sini kullanarak desktop bildirimleri gösterir
 */

export interface NotificationOptions {
  title: string
  options?: NotificationOptions
}

export interface BrowserNotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{ action: string; title: string }>
  data?: Record<string, any>
}

class NotificationManager {
  private permission: NotificationPermission = 'default'

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission
    }
  }

  /**
   * Bildirim izni iste
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirim desteklemiyor')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission === 'denied') {
      return false
    }

    try {
      this.permission = await Notification.requestPermission()
      return this.permission === 'granted'
    } catch (error) {
      console.error('Bildirim izni alınırken hata:', error)
      return false
    }
  }

  /**
   * Bildirim göster
   */
  async notify(title: string, options?: BrowserNotificationOptions): Promise<Notification | null> {
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirim desteklemiyor')
      return null
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        console.warn('Bildirim izni reddedildi')
        return null
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/badge.png',
        ...options,
      })

      // Bildirim tıklandığında
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // Varsayılan olarak 5 saniye sonra kapat
      setTimeout(() => notification.close(), 5000)

      return notification
    } catch (error) {
      console.error('Bildirim gösterilirken hata:', error)
      return null
    }
  }

  /**
   * Başarı bildirimi
   */
  success(title: string, body?: string): Promise<Notification | null> {
    return this.notify(title, {
      body,
      badge: '✅',
    })
  }

  /**
   * Uyarı bildirimi
   */
  warning(title: string, body?: string): Promise<Notification | null> {
    return this.notify(title, {
      body,
      badge: '⚠️',
      requireInteraction: true,
    })
  }

  /**
   * Hata bildirimi
   */
  error(title: string, body?: string): Promise<Notification | null> {
    return this.notify(title, {
      body,
      badge: '❌',
      requireInteraction: true,
    })
  }

  /**
   * Bilgi bildirimi
   */
  info(title: string, body?: string): Promise<Notification | null> {
    return this.notify(title, {
      body,
      badge: 'ℹ️',
    })
  }

  /**
   * İlaç hatırlatması bildirimi
   */
  medicationReminder(petName: string, drugName: string, dose?: string): Promise<Notification | null> {
    const body = dose ? `${petName} için ${drugName} — ${dose}` : `${petName} için ${drugName}`
    return this.notify('💊 İlaç Zamanı', {
      body,
      requireInteraction: true,
    })
  }

  /**
   * Veteriner randevusu hatırlatması
   */
  appointmentReminder(petName: string, vetName?: string): Promise<Notification | null> {
    const body = vetName ? `${petName} için ${vetName} ile randevun yaklaşıyor` : `${petName} için veteriner randevusu yaklaşıyor`
    return this.notify('📅 Randevu Hatırlatması', {
      body,
      requireInteraction: true,
    })
  }

  /**
   * İzin durumunu kontrol et
   */
  isGranted(): boolean {
    return this.permission === 'granted'
  }

  /**
   * İzin durumunu al
   */
  getPermission(): NotificationPermission {
    return this.permission
  }
}

// Singleton instance
export const notificationManager = new NotificationManager()

// Default export
export default notificationManager
