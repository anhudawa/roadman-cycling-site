import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #210140 0%, #252526 100%)',
          borderRadius: '36px',
        }}
      >
        {/* Bold angular R lettermark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              fontSize: '120px',
              fontWeight: 900,
              fontFamily: 'sans-serif',
              background: 'linear-gradient(135deg, #F16363, #4C1273)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1,
              letterSpacing: '-4px',
            }}
          >
            R
          </span>
          {/* Coral speed line */}
          <div
            style={{
              width: '80px',
              height: '4px',
              background: '#F16363',
              borderRadius: '2px',
              marginTop: '-8px',
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
