import { useEffect, useRef, useState } from 'react'
import './App.css'

type Nullable<T> = T | null

const iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
]

function App() {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const pcRef = useRef<Nullable<RTCPeerConnection>>(null)
  const localStreamRef = useRef<Nullable<MediaStream>>(null)

  const [localSdp, setLocalSdp] = useState('')
  const [remoteSdp, setRemoteSdp] = useState('')
  const [role, setRole] = useState<'caller' | 'callee' | ''>('')
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  async function startLocalMedia() {
    if (isStarted) return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    localStreamRef.current = stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }
    setIsStarted(true)
  }

  function ensurePeerConnection(): RTCPeerConnection {
    if (pcRef.current) return pcRef.current
    const pc = new RTCPeerConnection({ iceServers })
    pcRef.current = pc

    // 将本地流添加到连接
    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        pc.addTrack(track, localStreamRef.current)
      }
    }

    // 远端流渲染
    const remoteStream = new MediaStream()
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    }
    pc.addEventListener('track', (event) => {
      for (const track of event.streams[0].getTracks()) {
        remoteStream.addTrack(track)
      }
    })

    return pc
  }

  function waitIceGatheringComplete(pc: RTCPeerConnection): Promise<void> {
    if (pc.iceGatheringState === 'complete') return Promise.resolve()
    return new Promise((resolve) => {
      function checkState() {
        if (pc.iceGatheringState === 'complete') {
          pc.removeEventListener('icegatheringstatechange', checkState)
          resolve()
        }
      }
      pc.addEventListener('icegatheringstatechange', checkState)
    })
  }

  async function createOffer() {
    if (!isStarted) await startLocalMedia()
    setRole('caller')
    const pc = ensurePeerConnection()
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
    await pc.setLocalDescription(offer)
    await waitIceGatheringComplete(pc)
    setLocalSdp(JSON.stringify(pc.localDescription))
  }

  async function applyRemoteAnswer() {
    if (!pcRef.current) return
    if (!remoteSdp) return
    const desc: RTCSessionDescriptionInit = JSON.parse(remoteSdp)
    await pcRef.current.setRemoteDescription(desc)
  }

  async function setRemoteOfferAndCreateAnswer() {
    if (!isStarted) await startLocalMedia()
    setRole('callee')
    const pc = ensurePeerConnection()
    const desc: RTCSessionDescriptionInit = JSON.parse(remoteSdp)
    await pc.setRemoteDescription(desc)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await waitIceGatheringComplete(pc)
    setLocalSdp(JSON.stringify(pc.localDescription))
  }

  async function stopAll() {
    cleanup()
    setLocalSdp('')
    setRemoteSdp('')
    setRole('')
    setIsStarted(false)
  }

  function cleanup() {
    try {
      if (pcRef.current) {
        pcRef.current.getSenders().forEach((s) => {
          try { s.track && s.track.stop() } catch {}
        })
        pcRef.current.getReceivers().forEach((r) => {
          try { r.track && r.track.stop() } catch {}
        })
        pcRef.current.close()
      }
    } finally {
      pcRef.current = null
      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) track.stop()
        localStreamRef.current = null
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    }
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2>WebRTC 手动信令示例（复制粘贴 SDP）</h2>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span>本地视频</span>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: 320, height: 180, background: '#000' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span>远端视频</span>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 320, height: 180, background: '#000' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={startLocalMedia} disabled={isStarted}>开启本地媒体</button>
        <button onClick={createOffer}>创建 Offer（发起者）</button>
      
        <button onClick={applyRemoteAnswer} disabled={!remoteSdp || role !== 'caller'}>应用远端 Answer</button>
        <button onClick={setRemoteOfferAndCreateAnswer} disabled={!remoteSdp}>设置远端 Offer 并生成 Answer（应答者）</button>
        <button onClick={stopAll}>停止并清理</button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div>本地 SDP（复制给对端）</div>
          <textarea value={localSdp} onChange={(e) => setLocalSdp(e.target.value)} style={{ width: '100%', height: 180 }} />
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div>远端 SDP（粘贴对端 SDP 于此）</div>
          <textarea value={remoteSdp} onChange={(e) => setRemoteSdp(e.target.value)} style={{ width: '100%', height: 180 }} />
        </div>
      </div>

      <div style={{ color: '#888' }}>
        当前角色：{role || '未选择'}（发起者点击“创建 Offer”，应答者粘贴对端 Offer 后点击“设置远端 Offer 并生成 Answer”，最后发起者粘贴 Answer 并点击“应用远端 Answer”）
      </div>
    </div>
  )
}

export default App
