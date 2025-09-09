export async function recordAudio(onStop) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })

  let chunks = []
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data)

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: "audio/webm" })
    onStop(blob)
  }

  mediaRecorder.start()
  return mediaRecorder
}

export function playBase64Audio(base64Audio) {
  const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`)
  audio.play()
}
