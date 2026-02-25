/**
 * SEASONAL DECORATIONS
 * 
 * Beautiful, artistic decorations placed around portfolio edges
 * Each season has unique, creative visual elements
 */

import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import '../styles/seasonal-decorations.css'

// Decoration components for each season
const HalloweenDecorations = ({ colors }) => (
  <>
    {/* Jack-o-lantern top right */}
    <svg className="decoration decoration--top-right elegant-float" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pumpkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ff8c00', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ff6b00', stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id="pumpkinGlow" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Pumpkin body */}
      <ellipse cx="50" cy="60" rx="35" ry="40" fill="url(#pumpkin)" />
      <ellipse cx="44" cy="52" rx="28" ry="30" fill="url(#pumpkinGlow)" className="elegant-glow" />
      <path d="M30 60 Q40 40 50 35 Q60 40 70 60" fill="#ff8c00" stroke="#ff6b00" strokeWidth="2" />
      {/* Stem */}
      <rect x="45" y="20" width="10" height="15" fill="#228b22" rx="3" />
      {/* Eyes */}
      <path d="M35 55 L40 65 L30 60 Z" fill="#000" className="jack-o-eye" />
      <path d="M65 55 L70 65 L60 60 Z" fill="#000" className="jack-o-eye" />
      {/* Mouth */}
      <path d="M30 75 Q50 90 70 75" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>

    {/* Ghost floating bottom left */}
    <svg className="decoration decoration--bottom-left ghost-float" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ghostMist" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <g fill="url(#ghostMist)" stroke="#333" strokeWidth="1.5">
        {/* Ghost body */}
        <path d="M20 30 L20 70 Q20 85 35 85 L45 85 Q60 85 60 70 L60 30 Z" />
        {/* Head */}
        <circle cx="40" cy="40" r="18" />
        {/* Eyes */}
        <circle cx="32" cy="35" r="3" fill="#333" />
        <circle cx="48" cy="35" r="3" fill="#333" />
        {/* Mouth */}
        <path d="M35 45 Q40 48 45 45" fill="none" stroke="#333" strokeWidth="1" />
      </g>
    </svg>

    {/* Spiderweb top left */}
    <svg className="decoration decoration--top-left elegant-shimmer" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#999" strokeWidth="1.5" fill="none">
        {/* Web strings */}
        <line x1="60" y1="10" x2="60" y2="60" />
        <line x1="60" y1="10" x2="30" y2="40" />
        <line x1="60" y1="10" x2="90" y2="40" />
        <line x1="30" y1="40" x2="90" y2="40" />
        <line x1="30" y1="40" x2="20" y2="70" />
        <line x1="90" y1="40" x2="100" y2="70" />
        <line x1="20" y1="70" x2="100" y2="70" />
        {/* Circular web */}
        <circle cx="60" cy="50" r="15" stroke="#999" strokeWidth="1" />
        <circle cx="60" cy="50" r="25" stroke="#999" strokeWidth="1" />
      </g>
      {/* Spider */}
      <circle cx="60" cy="30" r="4" fill="#333" />
      <line x1="56" y1="32" x2="45" y2="25" stroke="#333" strokeWidth="2" />
      <line x1="56" y1="32" x2="50" y2="40" stroke="#333" strokeWidth="2" />
      <line x1="64" y1="32" x2="75" y2="25" stroke="#333" strokeWidth="2" />
      <line x1="64" y1="32" x2="70" y2="40" stroke="#333" strokeWidth="2" />
    </svg>
  </>
)

const WinterDecorations = ({ colors }) => (
  <>
    <svg className="decoration decoration--top-left winter-snowflakes" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" opacity="0.75">
        <g className="snowflake snowflake-1" transform="translate(28, 28)">
          <line x1="0" y1="-12" x2="0" y2="12" />
          <line x1="-12" y1="0" x2="12" y2="0" />
          <line x1="-9" y1="-9" x2="9" y2="9" />
          <line x1="-9" y1="9" x2="9" y2="-9" />
        </g>
        <g className="snowflake snowflake-2" transform="translate(76, 40)">
          <line x1="0" y1="-10" x2="0" y2="10" />
          <line x1="-10" y1="0" x2="10" y2="0" />
          <line x1="-7" y1="-7" x2="7" y2="7" />
          <line x1="-7" y1="7" x2="7" y2="-7" />
        </g>
      </g>
      <g fill={colors.secondary} opacity="0.6">
        <circle cx="30" cy="78" r="2" />
        <circle cx="58" cy="70" r="1.6" />
        <circle cx="86" cy="82" r="1.8" />
      </g>
    </svg>

    <svg className="decoration decoration--bottom-right winter-ice elegant-float" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="winterIce" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="winterIceInner" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M20 92 L40 18 L58 40 L74 12 L92 46 L62 92 Z" fill="url(#winterIce)" opacity="0.85" />
      <path d="M26 86 L42 28 L56 44 L72 20 L88 46 L64 88 Z" fill="url(#winterIceInner)" opacity="0.7" />
      <path className="winter-ice-shine" d="M34 84 L48 40 L58 50 L70 28 L82 48" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    </svg>
  </>
)

const ThanksgivingDecorations = ({ colors }) => (
  <>
    <svg className="decoration decoration--top-right thanksgiving-leaves elegant-float" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
      <g fill={colors.primary} opacity="0.75" className="thanksgiving-leaf-drift">
        <path d="M58 18 C44 20 34 34 36 48 C38 62 52 70 62 64 C72 58 78 44 74 32 C70 20 64 17 58 18 Z" />
        <path d="M26 58 C18 60 14 68 16 76 C18 86 30 92 38 86 C46 80 50 70 46 62 C42 54 34 56 26 58 Z" opacity="0.7" />
      </g>
      <path d="M56 28 Q58 44 52 64" stroke={colors.accent} strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round" />
    </svg>

    <svg className="decoration decoration--bottom-left thanksgiving-pumpkins" viewBox="0 0 130 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="thanksPumpkin" cx="40%" cy="35%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.9" />
        </radialGradient>
      </defs>
      <g opacity="0.9">
        <ellipse cx="44" cy="54" rx="24" ry="22" fill="url(#thanksPumpkin)" />
        <path d="M28 54 Q36 38 44 34 Q52 38 60 54" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.55" />
        <rect x="40" y="26" width="8" height="10" rx="2" fill="#228b22" opacity="0.85" />
      </g>
      <g opacity="0.85">
        <ellipse cx="92" cy="60" rx="20" ry="18" fill="url(#thanksPumpkin)" opacity="0.95" />
        <path d="M78 60 Q85 48 92 44 Q99 48 106 60" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.5" />
        <rect x="88" y="38" width="7" height="9" rx="2" fill="#228b22" opacity="0.85" />
      </g>
    </svg>
  </>
)

const ChineseNewYearDecorations = ({ colors }) => (
  <>
    <svg className="decoration decoration--top-left lantern-sway lantern-glow" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cnyLantern" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.78" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.62" />
        </linearGradient>
      </defs>
      <g>
        <path d="M45 6 Q55 10 60 22 Q66 38 60 56 Q55 78 45 88 Q35 78 30 56 Q24 38 30 22 Q35 10 45 6" fill="url(#cnyLantern)" opacity="0.95" />
        <path d="M40 10 Q45 8 50 10 Q58 16 55 26 Q52 34 45 36 Q38 34 35 26 Q32 16 40 10" fill={colors.primary} opacity="0.55" />
        <rect x="34" y="0" width="22" height="10" rx="4" fill={colors.accent} opacity="0.65" />
        <rect x="32" y="10" width="26" height="6" rx="3" fill={colors.accent} opacity="0.65" />
        <circle cx="45" cy="50" r="10" fill={colors.secondary} opacity="0.14" />
        <circle cx="38" cy="38" r="14" fill="#ffffff" opacity="0.08" className="elegant-glow" />
        <path d="M45 88 L45 103" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        <path d="M40 103 Q45 110 50 103" stroke={colors.accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75" />
      </g>
    </svg>

    <svg className="decoration decoration--bottom-right lantern-sway lantern-glow" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M45 6 Q55 10 60 22 Q66 38 60 56 Q55 78 45 88 Q35 78 30 56 Q24 38 30 22 Q35 10 45 6" fill={colors.primary} opacity="0.74" />
        <rect x="34" y="0" width="22" height="10" rx="4" fill={colors.accent} opacity="0.65" />
        <rect x="32" y="10" width="26" height="6" rx="3" fill={colors.accent} opacity="0.65" />
        <circle cx="45" cy="52" r="12" fill={colors.secondary} opacity="0.12" />
        <path d="M45 88 L45 103" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        <path d="M40 103 Q45 110 50 103" stroke={colors.accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75" />
      </g>
    </svg>

    <svg className="decoration decoration--right-edge dragon-glide" viewBox="0 0 220 520" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dragonBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.62" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="dragonGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.accent} stopOpacity="0.62" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <path d="M150 30 C170 40 182 62 172 82 C162 102 135 105 125 88 C112 66 120 45 150 30 Z" fill="url(#dragonBody)" />
      <path d="M164 58 Q172 50 180 56" stroke="url(#dragonGold)" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="155" cy="60" r="4" fill="#111" />
      <circle cx="156" cy="58" r="1.2" fill="#fff" opacity="0.6" />
      <path d="M145 75 Q155 82 165 75" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M126 70 Q110 66 96 74" stroke="url(#dragonGold)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M172 78 Q190 80 202 94" stroke="url(#dragonGold)" strokeWidth="4" fill="none" strokeLinecap="round" />

      <path d="M140 95 C175 120 120 160 160 190 C200 220 130 250 168 280 C205 310 140 340 170 372 C200 406 140 428 158 458" fill="none" stroke="url(#dragonBody)" strokeWidth="26" strokeLinecap="round" />
      <path d="M140 95 C175 120 120 160 160 190 C200 220 130 250 168 280 C205 310 140 340 170 372 C200 406 140 428 158 458" fill="none" stroke="url(#dragonGold)" strokeWidth="6" strokeLinecap="round" opacity="0.9" />

      <path
        className="dragon-shimmer"
        d="M140 95 C175 120 120 160 160 190 C200 220 130 250 168 280 C205 310 140 340 170 372 C200 406 140 428 158 458"
        fill="none"
        stroke="#ffffff"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.16"
        strokeDasharray="18 220"
      />

      <g fill="url(#dragonGold)" opacity="0.9">
        <circle cx="150" cy="118" r="2" />
        <circle cx="152" cy="160" r="2" />
        <circle cx="154" cy="204" r="2" />
        <circle cx="156" cy="246" r="2" />
        <circle cx="158" cy="290" r="2" />
        <circle cx="160" cy="332" r="2" />
        <circle cx="160" cy="376" r="2" />
        <circle cx="158" cy="418" r="2" />
      </g>

      <path d="M166 452 Q190 468 200 496" stroke="url(#dragonBody)" strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d="M166 452 Q190 468 200 496" stroke="url(#dragonGold)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
    </svg>

    <svg className="decoration decoration--bottom-center cny-sparkles" viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <g fill={colors.accent} opacity="0.45">
        <circle cx="50" cy="30" r="2" />
        <circle cx="80" cy="45" r="1.5" />
        <circle cx="115" cy="28" r="2" />
        <circle cx="140" cy="44" r="1.5" />
        <circle cx="170" cy="32" r="2" />
      </g>
    </svg>
  </>
)

const ChristmasDecorations = ({ colors }) => (
  <>
    {/* Snowman bottom left */}
    <svg className="decoration decoration--bottom-left elegant-float" viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
      {/* Body snowballs */}
      <circle cx="30" cy="75" r="18" fill="white" stroke="#e0e0e0" strokeWidth="2" />
      <circle cx="30" cy="45" r="15" fill="white" stroke="#e0e0e0" strokeWidth="2" />
      <circle cx="30" cy="20" r="12" fill="white" stroke="#e0e0e0" strokeWidth="2" />
      <circle cx="24" cy="16" r="10" fill="#ffffff" opacity="0.15" className="elegant-glow" />
      
      {/* Coal eyes */}
      <circle cx="25" cy="17" r="2" fill="#333" />
      <circle cx="35" cy="17" r="2" fill="#333" />
      
      {/* Coal mouth */}
      <circle cx="20" cy="22" r="1.5" fill="#333" />
      <circle cx="24" cy="23" r="1.5" fill="#333" />
      <circle cx="28" cy="23" r="1.5" fill="#333" />
      
      {/* Carrot nose */}
      <polygon points="30,20 30,24 38,22" fill="#ff8c00" />
      
      {/* Stick arms */}
      <line x1="15" y1="45" x2="5" y2="40" stroke="#8b4513" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="45" x2="8" y2="50" stroke="#8b4513" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="45" x2="55" y2="40" stroke="#8b4513" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="45" x2="52" y2="50" stroke="#8b4513" strokeWidth="2" strokeLinecap="round" />
      
      {/* Top hat */}
      <rect x="24" y="5" width="12" height="4" fill="#333" />
      <rect x="22" y="8" width="16" height="3" fill="#333" />
    </svg>

    {/* Ornament top right */}
    <svg className="decoration decoration--top-right ornament-swing" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ornamentShine" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* String */}
      <line x1="30" y1="0" x2="30" y2="12" stroke="#d4af37" strokeWidth="2" />
      {/* Cap */}
      <ellipse cx="30" cy="12" rx="8" ry="4" fill="#d4af37" />
      {/* Ornament */}
      <circle cx="30" cy="45" r="20" fill={colors.primary} opacity="0.8" />
      <circle cx="24" cy="38" r="16" fill="url(#ornamentShine)" className="elegant-glow" />
      <circle cx="30" cy="45" r="20" fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
      <circle cx="22" cy="35" r="4" fill="white" opacity="0.6" />
    </svg>

    {/* Candy canes bottom right */}
    <svg className="decoration decoration--bottom-right" viewBox="0 0 50 120" xmlns="http://www.w3.org/2000/svg">
      <g strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M20 10 Q10 20 10 40 Q10 60 20 70" stroke="white" />
        <path d="M20 10 Q10 20 10 40 Q10 60 20 70" stroke="#e41e3f" strokeWidth="2" strokeDasharray="4,2" />
        
        <path d="M40 40 Q30 50 30 70 Q30 90 40 100" stroke="white" />
        <path d="M40 40 Q30 50 30 70 Q30 90 40 100" stroke="#e41e3f" strokeWidth="2" strokeDasharray="4,2" />
      </g>
    </svg>

    {/* Snowbank bottom edge */}
    <svg className="decoration decoration--bottom-edge snowbank-wave" viewBox="0 0 800 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="snowBank" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e8f4f8" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        d="M0 95 C80 70 160 120 240 95 C320 70 400 120 480 95 C560 70 640 120 720 95 C760 82 780 85 800 95 L800 140 L0 140 Z"
        fill="url(#snowBank)"
      />
      <path
        className="snowbank-shine"
        d="M0 92 C80 65 160 118 240 92 C320 65 400 118 480 92 C560 65 640 118 720 92 C760 80 780 82 800 92"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  </>
)

const NewYearDecorations = ({ colors }) => (
  <>
    {/* Fireworks top left */}
    <svg className="decoration decoration--top-left firework-burst" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g className="firework-particles" fill={colors.accent}>
        <circle cx="50" cy="20" r="2" className="particle particle-1" />
        <circle cx="70" cy="30" r="2" className="particle particle-2" />
        <circle cx="80" cy="50" r="2" className="particle particle-3" />
        <circle cx="70" cy="70" r="2" className="particle particle-4" />
        <circle cx="50" cy="80" r="2" className="particle particle-5" />
        <circle cx="30" cy="70" r="2" className="particle particle-6" />
        <circle cx="20" cy="50" r="2" className="particle particle-7" />
        <circle cx="30" cy="30" r="2" className="particle particle-8" />
        <circle cx="50" cy="50" r="3" className="firework-center" />
      </g>
    </svg>

    {/* Firework trails top right */}
    <svg className="decoration decoration--top-right firework-trails" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="trailGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0" />
          <stop offset="60%" stopColor={colors.secondary} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" strokeWidth="4">
        <path className="trail trail-1" d="M15 105 Q40 78 62 58 Q78 44 105 30" stroke="url(#trailGold)" />
        <path className="trail trail-2" d="M5 92 Q34 70 56 54 Q70 44 98 22" stroke={colors.accent} opacity="0.7" />
        <path className="trail trail-3" d="M28 112 Q50 86 72 66 Q88 50 112 38" stroke={colors.primary} opacity="0.55" />
      </g>
      <g className="trail-sparkles" fill={colors.secondary} opacity="0.8">
        <circle cx="82" cy="46" r="2" />
        <circle cx="70" cy="58" r="1.6" />
        <circle cx="94" cy="34" r="1.6" />
      </g>
    </svg>

    {/* Balloons bottom right */}
    <svg className="decoration decoration--bottom-right elegant-float" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="balloonShine" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g>
        {/* Balloon 1 */}
        <circle cx="30" cy="30" r="12" fill={colors.primary} opacity="0.8" />
        <circle cx="27" cy="27" r="9" fill="url(#balloonShine)" className="elegant-glow" />
        <line x1="30" y1="42" x2="30" y2="90" stroke="#333" strokeWidth="1.5" />
        
        {/* Balloon 2 */}
        <circle cx="50" cy="35" r="12" fill={colors.accent} opacity="0.8" />
        <circle cx="47" cy="32" r="9" fill="url(#balloonShine)" className="elegant-glow" />
        <line x1="50" y1="47" x2="50" y2="90" stroke="#333" strokeWidth="1.5" />
        
        {/* Balloon 3 */}
        <circle cx="70" cy="32" r="12" fill={colors.secondary} opacity="0.8" />
        <circle cx="67" cy="29" r="9" fill="url(#balloonShine)" className="elegant-glow" />
        <line x1="70" y1="44" x2="70" y2="90" stroke="#333" strokeWidth="1.5" />
        
        {/* Confetti pieces */}
        <rect x="25" y="95" width="3" height="3" fill={colors.primary} opacity="0.6" />
        <rect x="48" y="100" width="3" height="3" fill={colors.accent} opacity="0.6" />
        <rect x="70" y="98" width="3" height="3" fill={colors.secondary} opacity="0.6" />
      </g>
    </svg>

    {/* Confetti scatter bottom center */}
    <svg className="decoration decoration--bottom-center confetti-burst" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <g fill={colors.primary} opacity="0.7" className="confetti-pieces">
        <rect x="30" y="20" width="4" height="6" transform="rotate(45 32 23)" />
        <rect x="60" y="30" width="4" height="6" transform="rotate(-30 62 33)" />
        <rect x="90" y="25" width="4" height="6" transform="rotate(60 92 28)" />
        <rect x="120" y="35" width="4" height="6" transform="rotate(-45 122 38)" />
        <rect x="150" y="28" width="4" height="6" transform="rotate(25 152 31)" />
        <rect x="170" y="40" width="4" height="6" transform="rotate(-60 172 43)" />
      </g>
    </svg>
  </>
)

const ValentineDecorations = ({ colors }) => (
  <>
    {/* Cupid top left */}
    <svg className="decoration decoration--top-left cupid-float" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="30" cy="20" r="10" fill="#f4a460" />
      {/* Body */}
      <ellipse cx="30" cy="40" rx="8" ry="12" fill="#fff5ee" />
      {/* Arms */}
      <rect x="10" y="36" width="20" height="4" fill="#f4a460" rx="2" />
      <rect x="30" y="36" width="20" height="4" fill="#f4a460" rx="2" />
      {/* Wings */}
      <path d="M20 35 Q15 20 20 25 Q22 30 20 35" fill="#ffb6c1" opacity="0.7" />
      <path d="M40 35 Q45 20 40 25 Q38 30 40 35" fill="#ffb6c1" opacity="0.7" />
      {/* Bow and arrow */}
      <line x1="50" y1="25" x2="55" y2="20" stroke="#d4af37" strokeWidth="2" />
      <path d="M50 25 Q53 30 55 35" stroke="#d4af37" strokeWidth="2" fill="none" />
    </svg>

    {/* Large decorative hearts bottom left */}
    <svg className="decoration decoration--bottom-left hearts-cluster" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heartShine" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Heart 1 */}
      <path d="M40 70 C10 50 5 35 5 28 C5 15 15 8 22 8 C28 8 35 15 40 22 C45 15 52 8 58 8 C65 8 75 15 75 28 C75 35 70 50 40 70 Z" 
            fill={colors.primary} opacity="0.6" className="heart-pulse" />
      <path d="M40 68 C14 50 10 38 10 30 C10 20 16 14 22 14 C28 14 34 20 40 26 C46 20 52 14 58 14 C64 14 70 20 70 30 C70 38 66 50 40 68 Z" fill="url(#heartShine)" opacity="0.9" className="elegant-glow" />
      {/* Heart 2 smaller */}
      <path d="M60 50 C45 40 42 30 42 25 C42 18 48 13 52 13 C55 13 60 17 63 22 C66 17 71 13 74 13 C78 13 85 18 85 25 C85 30 82 40 60 50 Z" 
            fill={colors.accent} opacity="0.7" className="heart-pulse" style={{animationDelay: '0.2s'}} />
    </svg>

    {/* Rose bottom right */}
    <svg className="decoration decoration--bottom-right rose-sway" viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
      {/* Stem */}
      <path d="M20 100 Q15 80 15 50 Q15 30 20 10" stroke="#228b22" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="10" cy="50" rx="5" ry="8" fill="#228b22" transform="rotate(-30 10 50)" />
      <ellipse cx="30" cy="60" rx="5" ry="8" fill="#228b22" transform="rotate(30 30 60)" />
      {/* Rose petals */}
      <circle cx="20" cy="15" r="6" fill="#c41e3a" />
      <circle cx="16" cy="12" r="5" fill="#dc143c" />
      <circle cx="24" cy="12" r="5" fill="#dc143c" />
      <circle cx="14" cy="18" r="5" fill="#dc143c" />
      <circle cx="26" cy="18" r="5" fill="#dc143c" />
      <circle cx="20" cy="10" r="3" fill="#8b0000" />
    </svg>
  </>
)

const EasterDecorations = ({ colors }) => (
  <>
    {/* Easter bunny top right */}
    <svg className="decoration decoration--top-right bunny-hop" viewBox="0 0 50 80" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <ellipse cx="20" cy="10" rx="4" ry="15" fill="#f5deb3" stroke="#d2b48c" strokeWidth="1" />
      <ellipse cx="30" cy="8" rx="4" ry="15" fill="#f5deb3" stroke="#d2b48c" strokeWidth="1" />
      <ellipse cx="20" cy="15" rx="2" ry="8" fill="#ffb6c1" />
      <ellipse cx="30" cy="13" rx="2" ry="8" fill="#ffb6c1" />
      
      {/* Head */}
      <circle cx="25" cy="30" r="8" fill="#f5deb3" stroke="#d2b48c" strokeWidth="1" />
      {/* Eyes */}
      <circle cx="21" cy="27" r="1.5" fill="#333" />
      <circle cx="29" cy="27" r="1.5" fill="#333" />
      {/* Nose */}
      <circle cx="25" cy="31" r="1" fill="#ffb6c1" />
      
      {/* Body */}
      <ellipse cx="25" cy="48" rx="7" ry="10" fill="#f5deb3" />
      {/* Tail */}
      <circle cx="25" cy="60" r="4" fill="white" stroke="#d2b48c" strokeWidth="1" />
    </svg>

    {/* Easter eggs bottom left */}
    <svg className="decoration decoration--bottom-left eggs-bounce" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="eggShine" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Egg 1 */}
      <ellipse cx="20" cy="35" rx="10" ry="15" fill={colors.primary} opacity="0.7" />
      <ellipse cx="17" cy="30" rx="8" ry="10" fill="url(#eggShine)" opacity="0.9" className="elegant-glow" />
      <path d="M15 30 L25 30 M15 35 L25 35 M15 40 L25 40" stroke="white" strokeWidth="1" />
      
      {/* Egg 2 */}
      <ellipse cx="50" cy="40" rx="10" ry="15" fill={colors.accent} opacity="0.7" />
      <ellipse cx="47" cy="35" rx="8" ry="10" fill="url(#eggShine)" opacity="0.9" className="elegant-glow" />
      <circle cx="45" cy="35" r="2" fill="white" />
      <circle cx="55" cy="37" r="2" fill="white" />
      
      {/* Egg 3 */}
      <ellipse cx="80" cy="32" rx="10" ry="15" fill={colors.secondary} opacity="0.7" />
      <ellipse cx="77" cy="27" rx="8" ry="10" fill="url(#eggShine)" opacity="0.9" className="elegant-glow" />
      <rect x="75" y="25" width="10" height="15" fill="none" stroke="white" strokeWidth="1" />
    </svg>

    {/* Flower bottom right */}
    <svg className="decoration decoration--bottom-right flower-sway" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      {/* Stem */}
      <path d="M20 60 Q18 45 18 30" stroke="#228b22" strokeWidth="1.5" fill="none" />
      {/* Petals */}
      <circle cx="20" cy="15" r="4" fill={colors.primary} opacity="0.8" />
      <circle cx="28" cy="20" r="4" fill={colors.accent} opacity="0.8" />
      <circle cx="28" cy="30" r="4" fill={colors.secondary} opacity="0.8" />
      <circle cx="20" cy="35" r="4" fill={colors.primary} opacity="0.8" />
      <circle cx="12" cy="30" r="4" fill={colors.accent} opacity="0.8" />
      <circle cx="12" cy="20" r="4" fill={colors.secondary} opacity="0.8" />
      {/* Center */}
      <circle cx="20" cy="25" r="3" fill="#ffd700" />
    </svg>
  </>
)

const SpringDecorations = ({ colors }) => (
  <>
    {/* Butterflies top corners */}
    <svg className="decoration decoration--top-left butterfly-float" viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="25" cy="20" rx="2" ry="8" fill="#333" />
      {/* Wings */}
      <ellipse cx="15" cy="15" rx="8" ry="10" fill={colors.primary} opacity="0.7" className="wing-flutter" />
      <ellipse cx="35" cy="15" rx="8" ry="10" fill={colors.accent} opacity="0.7" className="wing-flutter" />
      <ellipse cx="15" cy="28" rx="6" ry="8" fill={colors.secondary} opacity="0.7" className="wing-flutter" />
      <ellipse cx="35" cy="28" rx="6" ry="8" fill={colors.secondary} opacity="0.7" className="wing-flutter" />
    </svg>

    {/* Cherry blossoms bottom right */}
    <svg className="decoration decoration--bottom-right blossom-drift" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      {/* Flower 1 */}
      <g transform="translate(20, 20)">
        <circle cx="0" cy="-5" r="3" fill={colors.primary} opacity="0.7" />
        <circle cx="5" cy="-2" r="3" fill={colors.primary} opacity="0.7" />
        <circle cx="5" cy="3" r="3" fill={colors.primary} opacity="0.7" />
        <circle cx="0" cy="5" r="3" fill={colors.primary} opacity="0.7" />
        <circle cx="-5" cy="3" r="3" fill={colors.primary} opacity="0.7" />
        <circle cx="-5" cy="-2" r="3" fill={colors.primary} opacity="0.7" />
        <circle cx="0" cy="0" r="2" fill="#ffd700" />
      </g>
      {/* Flower 2 */}
      <g transform="translate(60, 50)">
        <circle cx="0" cy="-4" r="2.5" fill={colors.accent} opacity="0.7" />
        <circle cx="4" cy="-1" r="2.5" fill={colors.accent} opacity="0.7" />
        <circle cx="4" cy="3" r="2.5" fill={colors.accent} opacity="0.7" />
        <circle cx="0" cy="4" r="2.5" fill={colors.accent} opacity="0.7" />
        <circle cx="-4" cy="3" r="2.5" fill={colors.accent} opacity="0.7" />
        <circle cx="-4" cy="-1" r="2.5" fill={colors.accent} opacity="0.7" />
        <circle cx="0" cy="0" r="1.5" fill="#ffd700" />
      </g>
    </svg>
  </>
)

const SummerDecorations = ({ colors }) => (
  <>
    {/* Sun top left */}
    <svg className="decoration decoration--top-left sun-glow" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunCore" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Rays */}
      <g stroke="#FFD700" strokeWidth="3" strokeLinecap="round">
        <line x1="40" y1="5" x2="40" y2="15" />
        <line x1="65" y1="15" x2="58" y2="22" />
        <line x1="75" y1="40" x2="65" y2="40" />
        <line x1="65" y1="65" x2="58" y2="58" />
        <line x1="40" y1="75" x2="40" y2="65" />
        <line x1="15" y1="65" x2="22" y2="58" />
        <line x1="5" y1="40" x2="15" y2="40" />
        <line x1="15" y1="15" x2="22" y2="22" />
      </g>
      {/* Sun circle */}
      <circle cx="40" cy="40" r="18" fill="#FFD700" opacity="0.9" />
      <circle cx="35" cy="34" r="18" fill="url(#sunCore)" className="elegant-glow" />
      <circle cx="40" cy="40" r="18" fill="none" stroke="#FFA500" strokeWidth="1" opacity="0.5" />
    </svg>

    {/* Ice cream bottom left */}
    <svg className="decoration decoration--bottom-left ice-cream-tilt" viewBox="0 0 40 70" xmlns="http://www.w3.org/2000/svg">
      {/* Cone */}
      <polygon points="15,35 25,35 30,60 10,60" fill="#D2691E" stroke="#8B4513" strokeWidth="1" />
      {/* Cross pattern on cone */}
      <line x1="18" y1="40" x2="22" y2="50" stroke="#8B4513" strokeWidth="0.5" opacity="0.5" />
      <line x1="22" y1="40" x2="18" y2="50" stroke="#8B4513" strokeWidth="0.5" opacity="0.5" />
      
      {/* Ice cream scoops */}
      <circle cx="20" cy="30" r="10" fill={colors.primary} opacity="0.8" />
      <circle cx="20" cy="18" r="8" fill={colors.accent} opacity="0.8" />
      <circle cx="20" cy="8" r="6" fill={colors.secondary} opacity="0.8" />
      {/* Cherry on top */}
      <circle cx="20" cy="0" r="2" fill="#c41e3a" />
    </svg>

    {/* Beach ball bottom right */}
    <svg className="decoration decoration--bottom-right beach-ball-spin" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="25" fill={colors.primary} opacity="0.6" />
      <circle cx="30" cy="30" r="25" fill="none" stroke="#fff" strokeWidth="1" />
      <path d="M30 5 A25 25 0 0 1 55 30" fill={colors.accent} opacity="0.6" />
      <path d="M55 30 A25 25 0 0 1 30 55" fill={colors.secondary} opacity="0.6" />
      <path d="M30 55 A25 25 0 0 1 5 30" fill="white" opacity="0.4" />
      <path d="M5 30 A25 25 0 0 1 30 5" fill={colors.primary} opacity="0.4" />
      <circle cx="24" cy="22" r="10" fill="#ffffff" opacity="0.14" className="elegant-glow" />
    </svg>
  </>
)

const AutumnDecorations = ({ colors }) => (
  <>
    {/* Falling leaves top right */}
    <svg className="decoration decoration--top-right elegant-float" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g className="leaf-fall" fill={colors.primary} opacity="0.7">
        <path d="M20 20 Q25 15 30 20 Q28 25 25 28 Q22 25 20 20" className="leaf-float" style={{animationDelay: '0s'}} />
        <path d="M50 30 Q55 25 60 30 Q58 35 55 38 Q52 35 50 30" className="leaf-float" style={{animationDelay: '0.3s'}} />
        <path d="M70 40 Q75 35 80 40 Q78 45 75 48 Q72 45 70 40" className="leaf-float" style={{animationDelay: '0.6s'}} />
        <path d="M40 60 Q45 55 50 60 Q48 65 45 68 Q42 65 40 60" className="leaf-float" style={{animationDelay: '0.9s'}} />
      </g>
    </svg>

    {/* Pumpkins bottom left */}
    <svg className="decoration decoration--bottom-left" viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pumpkin-orange">
          <stop offset="0%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FF6B00', stopOpacity: 1 }} />
        </radialGradient>
      </defs>
      {/* Pumpkin 1 */}
      <ellipse cx="25" cy="40" rx="15" ry="18" fill="url(#pumpkin-orange)" />
      <path d="M18 40 Q22 30 25 25 Q28 30 32 40" fill="#FF8C00" stroke="#FF6B00" strokeWidth="1" />
      <rect x="22" y="22" width="6" height="4" fill="#228b22" rx="1" />
      
      {/* Pumpkin 2 */}
      <ellipse cx="60" cy="45" rx="12" ry="14" fill="url(#pumpkin-orange)" opacity="0.9" />
      <path d="M55" y1="45" x2="62" y2="35" fill="#FF8C00" stroke="#FF6B00" strokeWidth="1" />
      <rect x="57" y="32" width="5" height="3" fill="#228b22" rx="1" />
    </svg>
  </>
)

const DefaultDecorations = ({ colors }) => (
  <>
    {/* Default stars */}
    <svg className="decoration decoration--top-left stars-twinkle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g fill={colors.accent} className="star-group">
        <polygon points="30,10 35,25 50,25 38,35 43,50 30,40 17,50 22,35 10,25 25,25" className="star-twinkle" />
        <polygon points="70,20 73,32 85,32 76,40 79,52 70,44 61,52 64,40 55,32 67,32" className="star-twinkle" style={{animationDelay: '0.3s'}} opacity="0.7" />
        <polygon points="20,70 23,82 35,82 26,90 29,102 20,94 11,102 14,90 5,82 17,82" className="star-twinkle" style={{animationDelay: '0.6s'}} opacity="0.5" />
      </g>
      <circle cx="30" cy="28" r="18" fill="#ffffff" opacity="0.06" className="elegant-glow" />
    </svg>
  </>
)

export const SeasonalDecorations = () => {
  const { season, config: seasonConfig, animationsEnabled } = useSeasonContext()
  const { theme } = useTheme()

  if (!animationsEnabled) {
    return null
  }

  const colors = theme ? {
    primary: theme.primary_color || '#1a472a',
    background: theme.background_color || 'white',
    text: theme.text_color || 'black',
    secondary: theme.secondary_color || '#e8f4f8',
    accent: theme.accent_color || '#4da6ff'
  } : {
    primary: seasonConfig?.colors?.primary || '#1a472a',
    background: seasonConfig?.colors?.background || 'white',
    text: seasonConfig?.colors?.text || 'black',
    secondary: seasonConfig?.colors?.secondary || '#e8f4f8',
    accent: seasonConfig?.colors?.accent || '#4da6ff'
  }

  const decorationMap = {
    halloween: HalloweenDecorations,
    christmas: ChristmasDecorations,
    new_year: NewYearDecorations,
    newyear: NewYearDecorations,
    valentine: ValentineDecorations,
    easter: EasterDecorations,
    spring: SpringDecorations,
    summer: SummerDecorations,
    winter: WinterDecorations,
    autumn: AutumnDecorations,
    fall: AutumnDecorations,
    cny: ChineseNewYearDecorations,
    thanksgiving: ThanksgivingDecorations,
    default: DefaultDecorations,
  }

  const DecorationComponent = decorationMap[season] || DefaultDecorations

  return (
    <div className="seasonal-decorations" data-season={season}>
      <DecorationComponent colors={colors} />
    </div>
  )
}

export default SeasonalDecorations
