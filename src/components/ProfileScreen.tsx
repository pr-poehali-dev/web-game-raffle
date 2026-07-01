import { useState } from "react";
import Icon from "@/components/ui/icon";
import BottomSheet from "@/components/BottomSheet";
import { toast } from "sonner";

const UPDATE_PROFILE_URL = "https://functions.poehali.dev/2d46409f-cea4-412e-8d4e-5ee7f83dccdc";

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
  tg_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  photo_url: string | null;
  balance: number;
  games_played: number;
  games_won: number;
  daily_streak: number;
  daily_last_claimed: string | null;
  city: string | null;
  pvz_address: string | null;
};

interface ProfileScreenProps {
  balance: number;
  history: HistoryItem[];
  player: Player | null;
  onPlayerUpdate: (p: Player) => void;
}

const DAILY_REWARDS = [10, 25, 50, 75, 100, 150, "🎁"];

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

const ProfileScreen = ({ balance, history, player, onPlayerUpdate }: ProfileScreenProps) => {
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: player?.first_name || "",
    lastName: player?.last_name || "",
    city: player?.city || "",
    pvz: player?.pvz_address || "",
  });

  const gamesPlayed = player?.games_played ?? history.length;
  const gamesWon = player?.games_won ?? history.filter((h) => h.won).length;
  const gamesLost = gamesPlayed - gamesWon;

  const displayName = player
    ? [player.first_name, player.last_name].filter(Boolean).join(" ")
    : "Игрок";
  const avatarLetter = player?.first_name?.[0]?.toUpperCase() || "?";

  const streak = player?.daily_streak ?? 0;
  const claimedToday = player?.daily_last_claimed === new Date().toISOString().slice(0, 10);

  const PROFILE_ITEMS = [
    { id: "profile", icon: "User", title: "Профиль", sub: "Данные игрока" },
    { id: "ton", icon: "Wallet", title: "Подключай свой кошелёк TON", sub: "Привязка криптокошелька" },
    { id: "friends", icon: "Users", title: "Приглашай друзей", sub: "Реферальная программа" },
    { id: "daily", icon: "CalendarCheck", title: "Ежедневный вход", sub: "Бонус за активность" },
    { id: "leaders", icon: "BarChart2", title: "Таблица лидеров", sub: "Отслеживай свой рейтинг" },
    { id: "purchases", icon: "ShoppingCart", title: "Мои покупки", sub: "Бустеры и прочие покупки" },
    { id: "history", icon: "Notebook", title: "История розыгрышей", sub: "Хронология событий игрока" },
  ];

  const saveProfile = async () => {
    if (!player) return;
    if (!profileData.firstName.trim()) { toast.error("Введите имя"); return; }
    setSavingProfile(true);
    try {
      const res = await fetch(UPDATE_PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: player.id,
          first_name: profileData.firstName.trim(),
          last_name: profileData.lastName.trim() || null,
          city: profileData.city.trim() || null,
          pvz_address: profileData.pvz.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { toast.error(data.error || "Ошибка сохранения"); return; }
      onPlayerUpdate({ ...player, first_name: data.first_name, last_name: data.last_name, city: data.city, pvz_address: data.pvz_address });
      toast.success("Данные сохранены!");
      setOpenSheet(null);
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto animate-fade-in">
      {PROFILE_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            if (item.id === "profile") {
              setProfileData({ firstName: player?.first_name || "", lastName: player?.last_name || "", city: player?.city || "", pvz: player?.pvz_address || "" });
            }
            setOpenSheet(item.id);
          }}
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
            {item.id === "daily" && !claimedToday && (
              <span className="w-2 h-2 rounded-full bg-green-400" />
            )}
            <Icon name="ChevronRight" size={18} className="text-white/50 shrink-0" />
          </div>
        </button>
      ))}

      {/* ===== PROFILE SHEET ===== */}
      <BottomSheet open={openSheet === "profile"} onClose={() => setOpenSheet(null)} title="Профиль">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {player?.photo_url ? (
              <img src={player.photo_url} alt={displayName} className="w-16 h-16 rounded-full border-2 border-white/40 object-cover shrink-0 shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9b8ecf] to-[#7060b0] border-2 border-white/40 flex items-center justify-center font-display font-black text-2xl text-white shadow-lg shrink-0">
                {avatarLetter}
              </div>
            )}
            <div className="flex-1">
              <div className="font-bold text-base">{displayName}</div>
              {player?.username && <div className="text-white/60 text-sm">@{player.username}</div>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Баланс", value: `${balance.toLocaleString("ru")} ₩` },
              { label: "Игр", value: gamesPlayed },
              { label: "Побед", value: gamesWon },
              { label: "Поражений", value: gamesLost },
              { label: "Серия дней", value: `${streak} д.` },
              { label: "ID", value: `#${player?.id ?? "—"}` },
            ].map((s) => (
              <div key={s.label} className="app-card-inner p-2.5 text-center">
                <div className="font-bold text-sm text-yellow-300 truncate">{s.value}</div>
                <div className="text-[10px] text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-white/50 font-semibold uppercase tracking-wide">Данные для доставки</div>
          <input value={profileData.firstName} onChange={(e) => setProfileData(p => ({ ...p, firstName: e.target.value }))}
            placeholder="Имя" className="bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors" />
          <input value={profileData.lastName} onChange={(e) => setProfileData(p => ({ ...p, lastName: e.target.value }))}
            placeholder="Фамилия" className="bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors" />
          <input value={profileData.city} onChange={(e) => setProfileData(p => ({ ...p, city: e.target.value }))}
            placeholder="Город" className="bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors" />
          <input value={profileData.pvz} onChange={(e) => setProfileData(p => ({ ...p, pvz: e.target.value }))}
            placeholder="Адрес пункта выдачи WB" className="bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors" />
          <button onClick={saveProfile} disabled={savingProfile}
            className="w-full py-3 rounded-xl bg-green-600 border border-green-400/50 font-bold text-sm active:scale-95 transition-transform disabled:opacity-60">
            {savingProfile ? "Сохраняю..." : "Сохранить"}
          </button>
        </div>
      </BottomSheet>

      {/* ===== DAILY SHEET ===== */}
      <BottomSheet open={openSheet === "daily"} onClose={() => setOpenSheet(null)} title="Ежедневный вход">
        <div className="flex flex-col gap-4">
          <div className="text-center text-sm text-white/70">Серия: <span className="font-bold text-yellow-300">{streak} дней</span></div>
          <div className="grid grid-cols-4 gap-2">
            {DAILY_REWARDS.map((r, i) => (
              <div key={i} className={`app-card-inner p-3 flex flex-col items-center gap-1 ${i < streak ? "border border-green-400/40 bg-green-500/10" : ""} ${i === streak && !claimedToday ? "border border-yellow-400/60 bg-yellow-400/10" : ""}`}>
                <div className="text-lg font-bold text-yellow-300">{typeof r === "number" ? `+${r}` : r}</div>
                <div className="text-[9px] text-white/50">День {i + 1}</div>
                {i < streak && <div className="text-green-400 text-xs">✓</div>}
              </div>
            ))}
          </div>
          {claimedToday ? (
            <div className="text-center text-white/50 text-sm">Уже получено сегодня. Возвращайся завтра!</div>
          ) : (
            <button onClick={() => { toast.success("Бонус получен!"); setOpenSheet(null); }}
              className="w-full py-3 rounded-xl bg-yellow-500/30 border border-yellow-400/50 font-bold text-sm active:scale-95 transition-transform">
              Получить бонус дня {streak + 1}
            </button>
          )}
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

      {/* ===== TON SHEET ===== */}
      <BottomSheet open={openSheet === "ton"} onClose={() => setOpenSheet(null)} title="Кошелёк TON">
        <div className="flex flex-col gap-3 text-center">
          <div className="text-4xl">💎</div>
          <div className="text-sm text-white/70">Привязка TON-кошелька для вывода призов — скоро!</div>
          <button onClick={() => setOpenSheet(null)} className="w-full py-3 rounded-xl bg-white/10 border border-white/20 font-bold text-sm">Закрыть</button>
        </div>
      </BottomSheet>

      {/* ===== PURCHASES SHEET ===== */}
      <BottomSheet open={openSheet === "purchases"} onClose={() => setOpenSheet(null)} title="Мои покупки">
        <div className="flex flex-col gap-3 text-center">
          <div className="text-4xl">🛒</div>
          <div className="text-sm text-white/70">История покупок бустеров появится здесь.</div>
          <button onClick={() => setOpenSheet(null)} className="w-full py-3 rounded-xl bg-white/10 border border-white/20 font-bold text-sm">Закрыть</button>
        </div>
      </BottomSheet>

      {/* ===== FRIENDS SHEET ===== */}
      <BottomSheet open={openSheet === "friends"} onClose={() => setOpenSheet(null)} title="Приглашай друзей">
        <div className="flex flex-col gap-3 text-center">
          <div className="text-4xl">👥</div>
          <div className="text-sm text-white/70">Реферальная программа — скоро!</div>
          <button onClick={() => setOpenSheet(null)} className="w-full py-3 rounded-xl bg-white/10 border border-white/20 font-bold text-sm">Закрыть</button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default ProfileScreen;
