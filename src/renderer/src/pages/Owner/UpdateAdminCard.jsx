import React, { useState, useEffect } from 'react'
import { Loader2, DownloadCloud, UploadCloud, RefreshCcw } from 'lucide-react'

export default function UpdateAdminCard() {
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [message, setMessage] = useState('')
  const [fileExists, setFileExists] = useState(false)

  const checkUpdate = () => {
    window.api.invoke('check-admin-update-file').then((exists) => setFileExists(!!exists))
  }
  useEffect(() => {
    checkUpdate()
    const timer = setInterval(checkUpdate, 3000)
    return () => clearInterval(timer)
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    setMessage('')
    try {
      const url = 'https://github.com/JMTuraev/downloads/releases/download/v1.0.1/napster-admin.Setup.1.0.1.exe'
      const fileName = 'admin-setup-2.2.1.exe'
      await window.api.invoke('download-admin-installer', { url, fileName })
      setMessage('✅ Файл успешно загружен!')
      checkUpdate()
    } catch (err) {
      let errorText = typeof err === 'string' ? err : (err?.message || 'Неизвестная ошибка')
      setMessage(`❌ Ошибка загрузки: ${errorText}`)
    } finally {
      setDownloading(false)
    }
  }

  const handleUpdateAdmin = async () => {
    setLoading(true)
    setMessage('')
    try {
      const result = await window.api.invoke('run-admin-update')
      if (result.success) {
        setMessage('✅ Обновление успешно запущено!')
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (err) {
      setMessage(`❌ Ошибка: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'none',
      boxShadow: 'none',
      border: 'none',
      borderRadius: 0,
      padding: 0,
      margin: 0,
      minWidth: 0,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch'
    }}>
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
          <UploadCloud style={{ width: 27, height: 27, color: '#f7d94c' }} />
          <span>Обновление администратора</span>
        </span>
        <button
          style={{
            background: 'linear-gradient(90deg,#fcb23e 0%,#f8e643 100%)',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#222',
            fontWeight: 700,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 8px #ffe83a33',
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.7 : 1
          }}
          disabled={downloading}
          onClick={handleDownload}
          title="Скачать"
        >
          {downloading ? <Loader2 style={{ width: 19, height: 19 }} className="animate-spin" /> : <DownloadCloud style={{ width: 19, height: 19 }} />}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Скачать</span>
        </button>
      </div>

      <div style={{
        fontSize: 12,
        color: '#d4bb74',
        marginBottom: 18,
        textAlign: 'center',
        marginTop: 2
      }}>
        <span>Файл для обновления admin</span>
      </div>

      <button
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: 10,
          background: !fileExists || loading
            ? '#343844'
            : 'linear-gradient(90deg,#ffb84b 0%,#fff600 100%)',
          color: '#282c39',
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          cursor: !fileExists || loading ? 'not-allowed' : 'pointer',
          boxShadow: !fileExists || loading ? 'none' : '0 2px 12px 0 #ffe98e66',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all .18s'
        }}
        disabled={!fileExists || loading}
        onClick={handleUpdateAdmin}
      >
        {loading
          ? <Loader2 style={{ width: 21, height: 21, marginRight: 2 }} className="animate-spin" />
          : <RefreshCcw style={{ width: 21, height: 21, marginRight: 2 }} />}
        {fileExists ? 'Обновить' : 'Файл не найден'}
      </button>

      <div style={{
        fontSize: 13,
        color: '#ddc56a',
        marginTop: 8,
        textAlign: 'center'
      }}>
        {fileExists
          ? 'Файл загружен'
          : 'Файл не найден'}
      </div>

      {message && (
        <div style={{
          color: message.startsWith('✅') ? '#93fca6' : '#fd8a93',
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
