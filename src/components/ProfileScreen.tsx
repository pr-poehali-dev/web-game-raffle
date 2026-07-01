import { useState } from "react";
import Icon from "@/components/ui/icon";
import BottomSheet from "@/components/BottomSheet";
import { toast } from "sonner";

type HistoryItem = {
  id: number;
  lotName: string;
  prizeCost: number;
  selectedSector: number;
  drawnSector: number;
  won: boolean;
  date: string;
};

type Player = {
  id: number;
  telegram_id: string | null;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
};

interface ProfileScreenProps {
  balance: number;
  history: HistoryItem[];
  player: Player | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

const LEADERS = [
  { place: 1, name: "WheelKing", balance: 98500, games: 312 },
  { place: 2, name: "LuckyOne", balance: 87200, games: 278 },
  { place: 3, name: "SpinMaster", balance: 72100, games: 245 },
  { place: 4, name: "GoldRush", balance: 65300, games: 201 },
  { place: 5, name: "FortunaX", balance: 58900, games: 189 },
  { place: 6, name: "JackpotPro", balance: 51200, games: 167 },
  { place: 7, name: "WinStreak", balance: 44700, games: 143 },
  { place: 8, name: "TopSpin", balance: 38100, games: 128 },
  { place: 9, name: "RichGame", balance: 31500, games: 112 },
  { place: 10, name: "Wheelie", balance: 24300, games: 98 },
];

const ProfileScreen = ({ balance, history, player, onLoginClick, onLogout }: ProfileScreenProps) => {
  const [openSheet, setOpenSheet] = useState<string | null>(null);

  const displayName = player?.name || "Игрок";
  const avatarLetter = displayName[0]?.toUpperCase() || "?";

  const gamesPlayed = history.length;
  const gamesWon = history.filter((h) => h.won).length;
  const gamesLost = gamesPlayed - gamesWon;

  const PROFILE_ITEMS = [
    { id: "profile", icon: "User", title: "Профиль", sub: "Данные игрока" },
    { id: "friends", icon: "Users", title: "Приглашай друзей", sub: "Реферальная программа" },
    { id: "leaders", icon: "BarChart2", title: "Таблица лидеров", sub: "Отслеживай свой рейтинг" },
    { id: "history", icon: "Notebook", title: "История розыгрышей", sub: "Хронология событий игрока" },
  ];

  return (
    <div className="flex flex-col gap-2 overflow-y-auto animate-fade-in">
      {PROFILE_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setOpenSheet(item.id)}
          className="app-btn w-full flex items-center gap-3 px-4 py-3.5 active:scale-[0.98] transition-transform text-left shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Icon name={item.icon} size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-tight">{item.title}</div>
            <div className="text-xs text-white/60 mt-0.5">{item.sub}</div>
          </div>
          <div className="flex items-center gap-2">
            {item.id === "history" && history.length > 0 && (
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{history.length}</span>
            )}
            <Icon name="ChevronRight" size={18} className="text-white/50 shrink-0" />
          </div>
        </button>
      ))}

      {/* Кнопка входа/выхода */}
      {!player ? (
        <button
          onClick={onLoginClick}
          className="w-full py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2"
          style={{ background: "#0088cc" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg>
          Войти через Telegram
        </button>
      ) : (
        <button
          onClick={onLogout}
          className="w-full py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-white/60 active:scale-95 transition-transform mt-2"
        >
          Выйти из аккаунта
        </button>
      )}

      {/* ===== PROFILE SHEET ===== */}
      <BottomSheet open={openSheet === "profile"} onClose={() => setOpenSheet(null)} title="Профиль">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {player?.avatar_url ? (
              <img src={player.avatar_url} alt={displayName}
                className="w-16 h-16 rounded-full border-2 border-white/40 object-cover shrink-0 shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9b8ecf] to-[#7060b0] border-2 border-white/40 flex items-center justify-center font-display font-black text-2xl text-white shadow-lg shrink-0">
                {avatarLetter}
              </div>
            )}
            <div className="flex-1">
              <div className="font-bold text-base">{displayName}</div>
              {player?.telegram_id && (
                <div className="text-white/60 text-sm">TG ID: {player.telegram_id}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Баланс", value: `${balance.toLocaleString("ru")} ₩` },
              { label: "Игр", value: gamesPlayed },
              { label: "Побед", value: gamesWon },
              { label: "Поражений", value: gamesLost },
              { label: "ID", value: `#${player?.id ?? "—"}` },
            ].map((s) => (
              <div key={s.label} className="app-card-inner p-2.5 text-center">
                <div className="font-bold text-sm text-yellow-300 truncate">{s.value}</div>
                <div className="text-[10px] text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* ===== LEADERS SHEET ===== */}
      <BottomSheet open={openSheet === "leaders"} onClose={() => setOpenSheet(null)} title="Таблица лидеров">
        <div className="flex flex-col gap-2">
          {LEADERS.map((l) => (
            <div key={l.place} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${l.place <= 3 ? "bg-yellow-400/10 border border-yellow-400/30" : "app-card-inner"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${l.place === 1 ? "bg-yellow-400 text-black" : l.place === 2 ? "bg-gray-300 text-black" : l.place === 3 ? "bg-amber-600 text-white" : "bg-white/15 text-white"}`}>
                {l.place}
              </div>
              <div className="flex-1 font-bold text-sm">{l.name}</div>
              <div className="text-right">
                <div className="font-bold text-sm text-yellow-300">{l.balance.toLocaleString("ru")} ₩</div>
                <div className="text-[10px] text-white/50">{l.games} игр</div>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* ===== FRIENDS SHEET ===== */}
      <BottomSheet open={openSheet === "friends"} onClose={() => setOpenSheet(null)} title="Приглашай друзей">
        <div className="flex flex-col gap-3 text-center">
          <div className="text-4xl">👥</div>
          <div className="font-bold text-lg">Реферальная программа</div>
          <div className="text-sm text-white/70">Приглашай друзей и получай бонусы за каждого нового игрока.</div>
          <button onClick={() => { toast("Скоро!"); setOpenSheet(null); }}
            className="w-full py-3 rounded-xl bg-blue-600/60 border border-blue-400/40 font-bold text-sm active:scale-95 transition-transform">
            Скоро
          </button>
        </div>
      </BottomSheet>

      {/* ===== HISTORY SHEET ===== */}
      <BottomSheet open={openSheet === "history"} onClose={() => setOpenSheet(null)} title="История розыгрышей">
        <div className="flex flex-col gap-2">
          {history.length === 0 ? (
            <div className="text-center text-white/50 py-8">Ещё нет розыгрышей</div>
          ) : (
            history.map((h) => (
              <div key={h.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${h.won ? "bg-green-500/15 border border-green-400/30" : "app-card-inner"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 ${h.won ? "bg-green-500/30" : "bg-white/10"}`}>
                  {h.won ? "🏆" : "💫"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{h.lotName}</div>
                  <div className="text-[11px] text-white/50">{h.date} · −{h.prizeCost} ₩</div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${h.won ? "bg-green-500/30 text-green-300" : "bg-white/10 text-white/60"}`}>
                  {h.won ? "Победа" : "Нет"}
                </div>
              </div>
            ))
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default ProfileScreen;
