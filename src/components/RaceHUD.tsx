import React from 'react';
import { RaceGameState } from '../types/robot';
import { Trophy, Flame, AlertTriangle, RotateCcw, Clock, Shield, Flag } from 'lucide-react';

interface RaceHUDProps {
  gameState: RaceGameState;
  onRestart: () => void;
  onExitRace: () => void;
}

export const RaceHUD: React.FC<RaceHUDProps> = ({ gameState, onRestart, onExitRace }) => {
  const isRacing = gameState.status === 'racing';
  const isCountdown = gameState.status === 'countdown';
  const isVictory = gameState.status === 'victory';
  const isCrashed = gameState.status === 'crashed';
  const isTimeout = gameState.status === 'timeout';

  const timeRemaining = Math.max(0, gameState.timeLimit - gameState.timeElapsed);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4">
      {/* Top Race Scoreboard & Status Cluster */}
      <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto w-full">
        {/* Left: Health & Damage Gauge */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 shadow-xl pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className={`w-4 h-4 ${gameState.health > 40 ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="font-semibold text-slate-300">Độ bền khung:</span>
          </div>
          <div className="w-28 bg-slate-950 rounded-full h-3 border border-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                gameState.health > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : gameState.health > 25
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                  : 'bg-gradient-to-r from-red-600 to-rose-500'
              }`}
              style={{ width: `${gameState.health}%` }}
            ></div>
          </div>
          <span className="font-mono text-xs font-bold text-white tabular-nums">
            {gameState.health}%
          </span>
        </div>

        {/* Center: Timer & Checkpoints */}
        <div className="bg-slate-900/95 border border-cyan-800/80 rounded-2xl px-5 py-2 shadow-2xl pointer-events-auto flex items-center gap-6 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Thời gian còn lại
            </div>
            <div className={`font-mono text-lg font-black tabular-nums ${timeRemaining < 15 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
              {timeRemaining.toFixed(1)}s
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800"></div>

          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Flag className="w-3.5 h-3.5 text-emerald-400" /> Checkpoint
            </div>
            <div className="font-mono text-lg font-black text-emerald-300 tabular-nums">
              {gameState.currentCheckpoint} / {gameState.totalCheckpoints}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800"></div>

          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Điểm số
            </div>
            <div className="font-mono text-lg font-black text-yellow-400 tabular-nums">
              {gameState.score}
            </div>
          </div>
        </div>

        {/* Right: Quit Race button */}
        <div className="pointer-events-auto">
          <button
            onClick={onExitRace}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
          >
            Dừng Đua
          </button>
        </div>
      </div>

      {/* Countdown Big Display */}
      {isCountdown && (
        <div className="my-auto mx-auto text-center pointer-events-auto">
          <div className="text-slate-400 text-sm font-semibold mb-2 uppercase tracking-widest">
            CHUẨN BỊ XUẤT PHÁT
          </div>
          <div className="font-mono text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-yellow-400 animate-scale-in">
            {gameState.countdownNumber > 0 ? gameState.countdownNumber : 'GO!'}
          </div>
          <div className="mt-3 text-xs text-slate-300 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700 inline-block font-mono">
            Dùng phím W, A, S, D hoặc Mũi tên để lái vượt chướng ngại vật
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {isVictory && (
        <div className="my-auto mx-auto pointer-events-auto max-w-md w-full bg-slate-900 border-2 border-emerald-500 rounded-2xl p-6 shadow-2xl text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Trophy className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-black text-emerald-400 mb-1">CHIẾN THẮNG!</h3>
          <p className="text-slate-300 text-xs mb-4">
            Robot AMR đã vượt qua toàn bộ chướng ngại vật và cán đích an toàn!
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs mb-4 font-mono">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Thời gian hoàn thành</span>
              <span className="text-cyan-400 font-bold text-sm">{gameState.timeElapsed.toFixed(2)}s</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Độ bền còn lại</span>
              <span className="text-emerald-400 font-bold text-sm">{gameState.health}%</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Số lần va chạm</span>
              <span className="text-yellow-400 font-bold text-sm">{gameState.collisions}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Tổng điểm thưởng</span>
              <span className="text-purple-400 font-bold text-sm">{gameState.score} pts</span>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={onRestart}
              className="btn btn-primary d-flex align-items-center gap-1.5 text-xs px-4 py-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đua Lại
            </button>
            <button
              onClick={onExitRace}
              className="btn btn-outline-secondary text-slate-300 text-xs px-4 py-2"
            >
              Về Chế Độ Khám Phá 3D
            </button>
          </div>
        </div>
      )}

      {/* Crashed / Timeout Modal */}
      {(isCrashed || isTimeout) && (
        <div className="my-auto mx-auto pointer-events-auto max-w-md w-full bg-slate-900 border-2 border-red-500 rounded-2xl p-6 shadow-2xl text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <AlertTriangle className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-black text-red-400 mb-1">
            {isCrashed ? 'ROBOT BỊ HỎNG DO VA CHẠM!' : 'HẾT THỜI GIAN QUY ĐỊNH!'}
          </h3>
          <p className="text-slate-300 text-xs mb-4">
            {isCrashed
              ? 'Khung robot va chạm quá nhiều chướng ngại vật dẫn đến quá tải. Hãy lái khéo léo hơn!'
              : 'Thời gian hoàn thành chặng đua đã vượt quá giới hạn. Hãy tăng tốc độ điều khiển!'}
          </p>

          <div className="flex gap-2 justify-center">
            <button
              onClick={onRestart}
              className="btn btn-danger d-flex align-items-center gap-1.5 text-xs px-4 py-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Thử Lại Ngay
            </button>
            <button
              onClick={onExitRace}
              className="btn btn-outline-secondary text-slate-300 text-xs px-4 py-2"
            >
              Thoát Về Xem 3D
            </button>
          </div>
        </div>
      )}

      {/* Bottom Hint Line */}
      <div className="text-center text-[11px] font-mono text-slate-400">
        WASD / Mũi tên: Lái · Shift: Tăng tốc x2 (3s, hồi 13s) · Space: Phanh gấp · V: Góc nhìn xe (POV)
      </div>
    </div>
  );
};
