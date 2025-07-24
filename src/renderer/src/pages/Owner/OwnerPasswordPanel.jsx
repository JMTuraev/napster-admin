import React, { useEffect, useState } from 'react'

export default function OwnerPasswordPanel() {
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    window.api.invoke('get-owner-password').then(setCurrent)
  }, [])

  const handleSave = async () => {
    if (!newPass || newPass.length < 4) {
      setMsg('Минимум 4 символа')
      return
    }
    await window.api.invoke('set-owner-password', newPass)
    setCurrent(newPass)
    setNewPass('')
    setMsg('Пароль успешно сохранён!')
    setTimeout(() => setMsg(''), 1800)
  }

  return (
    <div style={{
      maxWidth: 210,
      minHeight: 320,
      margin: '54px 0 0 45px',
      background: 'rgba(20,24,44,0.97)',
      borderRadius: 16,
      padding: '24px 18px 22px 18px',
      boxShadow: '0 8px 28px #181b30cc',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      fontFamily: 'inherit'
    }}>
      <div style={{
        fontWeight: 500,
        fontSize: 17,
        marginBottom: 3,
        color: '#fff',
        letterSpacing: '0.01em',
        textAlign: 'left'
      }}>
        Пароль владельца{' '}
        <span style={{
          fontWeight: 400,
          fontSize: 12,
          color: '#a9b5de'
        }}>(для клиента)</span>
      </div>

      <div style={{ position: 'relative', marginBottom: 18, marginTop: 16 }}>
        <input
          type={show ? 'text' : 'password'}
          value={current}
          disabled
          style={{
            width: '100%',
            fontSize: 16,
            padding: '8px 29px 8px 10px',
            borderRadius: 7,
            background: '#191c2e',
            color: '#f7fafc',
            border: '1px solid #34406a',
            fontWeight: 500,
            letterSpacing: '0.07em',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color .15s'
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            fontSize: 16,
            cursor: 'pointer',
            padding: 0,
            color: '#9db6e7',
            lineHeight: 1,
            outline: 'none'
          }}>
          {show
            ? <span style={{ fontSize: 16 }}>🙈</span>
            : <span style={{ fontSize: 16 }}>👁️</span>
          }
        </button>
      </div>
      <label
        style={{
          color: '#c4ceef',
          fontWeight: 500,
          fontSize: 15,
          display: 'block',
          marginBottom: 7,
          marginLeft: 1,
        }}>
        Изменить пароль:
      </label>
      <input
        type="password"
        placeholder="Новый пароль"
        value={newPass}
        onChange={e => setNewPass(e.target.value)}
        style={{
          width: '100%',
          fontSize: 16,
          padding: '7px 9px',
          borderRadius: 6,
          background: '#181c2b',
          color: '#f0f3ff',
          border: '1px solid #2a3251',
          marginBottom: 12,
          outline: 'none',
          fontWeight: 500,
          boxSizing: 'border-box'
        }}
      />
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          background: 'linear-gradient(90deg,#347cff 0%,#4bb0fa 100%)',
          color: '#fff',
          fontWeight: 700, // faqat button jirniy
          fontSize: 15,
          borderRadius: 8,
          padding: '8px 0',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 1,
          boxShadow: '0 2px 12px 0 #347cff22'
        }}>
        Сохранить
      </button>
      {msg && <div style={{
        color: '#8cfca6',
        fontWeight: 500,
        marginTop: 9,
        textAlign: 'center',
        fontSize: 13
      }}>{msg}</div>}
    </div>
  )
}
