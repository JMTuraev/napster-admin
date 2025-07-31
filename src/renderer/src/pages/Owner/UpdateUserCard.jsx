import React, { useState, useEffect } from 'react'
import { Loader2, Send, UploadCloud, DownloadCloud } from 'lucide-react'

export default function UpdateUserCard() {
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [message, setMessage] = useState('')
  const [fileExists, setFileExists] = useState(false)

  // Fayl bor-yo‘qligini tekshirish uchun
  const checkUpdate = () => {
    window.api.invoke('check-update-file').then((exists) => setFileExists(!!exists))
  }
  useEffect(() => {
    checkUpdate()
    const timer = setInterval(checkUpdate, 3000)
    return () => clearInterval(timer)
  }, [])

  // Download yangi versiyani (masalan, remote serverdan)
 const handleDownload = async () => {
  setDownloading(true)
  setMessage('')
  try {
    const url = 'https://www.python.org/ftp/python/3.13.5/python-3.13.5-amd64.exe'
    const fileName = 'user-setup-2.2.1.exe'
    await window.api.invoke('download-user-installer', { url, fileName })
    setMessage('✅ Yangi versiya muvaffaqiyatli yuklandi!')
    checkUpdate()
  } catch (err) {
    // Error xabarini aniq va qisqartirib ko‘rsatamiz
    let errorText = typeof err === 'string' ? err : (err?.message || 'Nomaʼlum xatolik')
    // Katta uzun stack trace emas, faqat foydalanuvchi uchun qisqa matn
    setMessage(`❌ Yuklashda xatolik: ${errorText}`)
  } finally {
    setDownloading(false)
  }
}


  // Update faylni userlarga yuborish
  const handleSendUpdate = async () => {
    setLoading(true)
    setMessage('')
    try {
      const result = await window.api.invoke('send-user-update')
      if (result.success) {
        setMessage(`✅ ${result.count} ta user'ga yuborildi`)
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (err) {
      setMessage(`❌ Xatolik: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: 350,
      minHeight: 245,
      margin: '42px 0 0 45px',
      background: 'rgba(22,26,48,0.99)',
      borderRadius: 18,
      padding: '26px 22px 24px 22px',
      boxShadow: '0 8px 28px #182b40cc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'inherit'
    }}>
      {/* ==== HEADER ROW ==== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontWeight: 600,
        fontSize: 17,
        marginBottom: 4,
        letterSpacing: '0.01em',
        color: '#fff',
        width: '100%',
        justifyContent: 'space-between'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UploadCloud style={{ width: 27, height: 27, color: '#4cb6f8' }} />
          <span>Foydalanuvchi uchun update fayl</span>
        </span>
        {/* Yangi versiyani yuklash tugmasi */}
        <button
          style={{
            background: 'linear-gradient(90deg,#346aff 0%,#4be1fa 100%)',
            border: 'none',
            borderRadius: 8,
            padding: '6px 11px 6px 11px',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 8px #37b3f944',
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.7 : 1
          }}
          disabled={downloading}
          onClick={handleDownload}
          title="Yangi versiyani yuklash"
        >
          {downloading ? <Loader2 style={{ width: 19, height: 19 }} className="animate-spin" /> : <DownloadCloud style={{ width: 19, height: 19 }} />}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Yuklash</span>
        </button>
      </div>

      <div style={{
        fontSize: 12,
        color: '#a7b2c7',
        marginBottom: 18,
        textAlign: 'center',
        marginTop: 2
      }}>
        <span>updates/user/ papkada joylashgan oxirgi installer avtomatik userlarga yuboriladi</span>
      </div>

      <button
        style={{
          width: '100%',
          padding: '11px 0',
          borderRadius: 10,
          background: !fileExists || loading
            ? '#262b3f'
            : 'linear-gradient(90deg,#357cfb 0%,#34d1fd 100%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          cursor: !fileExists || loading ? 'not-allowed' : 'pointer',
          boxShadow: !fileExists || loading ? 'none' : '0 2px 12px 0 #37b3f966',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all .18s'
        }}
        disabled={!fileExists || loading}
        onClick={handleSendUpdate}
      >
        {loading
          ? <Loader2 style={{ width: 21, height: 21, marginRight: 2 }} className="animate-spin" />
          : <Send style={{ width: 21, height: 21, marginRight: 2 }} />}
        {fileExists ? 'Yangi versiyani userlarga yuborish' : 'Update fayl topilmadi'}
      </button>

      <div style={{
        fontSize: 13,
        color: '#8da1d1',
        marginTop: 8,
        textAlign: 'center'
      }}>
        {fileExists
          ? 'Tayyor: update fayl yuklangan'
          : 'Diqqat: update fayl (user setup) yo‘q!'}
      </div>

      {message && (
        <div style={{
          color: message.startsWith('✅') ? '#8cfca6' : '#fd8a93',
          fontWeight: 600,
          fontSize: 14,
          marginTop: 13,
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
    </div>
  )
}
