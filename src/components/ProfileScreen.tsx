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

type TgUser = {
  name: string;
  username: string;
  avatarLetter: string;
};

interface ProfileScreenProps {
  balance: number;
  history: HistoryItem[];
  tgUser: TgUser;
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

const BOOSTERS_SHOP = [
  { id: "safebet", emoji: "❤️", name: "SafeBet", owned: 2, max: 5 },
  { id: "goldwin", emoji: "🚀", name: "GoldWin", owned: 0, max: 5 },
  { id: "powerspin", emoji: "⚡", name: "PowerSpin", owned: 5, max: 5 },
  { id: "bonusdrum", emoji: "🎁", name: "BonusDrum", owned: 1, max: 5 },
];

const ProfileScreen = ({ balance, history, tgUser }: ProfileScreenProps) => {
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const [dailyDay, setDailyDay] = useState(3);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: "", lastName: "", city: "", pvz: "" });

  const gamesPlayed = history.length;
  const gamesWon = history.filter((h) => h.won).length;
  const gamesLost = gamesPlayed - gamesWon;

  const PROFILE_ITEMS = [
    { id: "profile", icon: "User", title: "Профиль", sub: "Данные игрока" },
    { id: "ton", icon: "Wallet", title: "Подключай свой кошелёк TON", sub: "Привязка криптокошелька" },
    { id: "friends", icon: "Users", title: "Приглашай друзей", sub: "Реферальная программа" },
    { id: "daily", icon: "CalendarCheck", title: "Ежедневный вход", sub: "Бонус за активность" },
    { id: "leaders", icon: "BarChart2", title: "Таблица лидеров", sub: "Отслеживай свой рейтинг" },
    { id: "purchases", icon: "ShoppingCart", title: "Мои покупки", sub: "Бустеры и прочие покупки" },
    { id: "history", icon: "Notebook", title: "История розыгрышей", sub: "Хронология событий игрока" },
  ];

  const claimDaily = () => {
    if (dailyClaimed) return;
    setDailyClaimed(true);
    const reward = DAILY_REWARDS[dailyDay - 1];
    if (typeof reward === "number") {
      toast.success(`+${reward} ₩ за день ${dailyDay}!`);
    } else {
      toast.success("Бустер получен!");
    }
  };

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
            {item.id === "daily" && !dailyClaimed && (
              <span className="w-2 h-2 rounded-full bg-green-400" />
            )}
            <Icon name="ChevronRight" size={18} className="text-white/50 shrink-0" />
          </div>
        </button>
      ))}

      {/* ===== PROFILE ===== */}
      <BottomSheet open={openSheet === "profile"} onClose={() => setOpenSheet(null)} title="Профиль">
        <div className="flex flex-col gap-4">
          {/* Avatar + nickname */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9b8ecf] to-[#7060b0] border-2 border-white/40 flex items-center justify-center font-display font-black text-2xl text-white shadow-lg shrink-0">
              {tgUser.avatarLetter}
            </div>
            <div>
              <div className="font-bold text-base">{tgUser.name}</div>
              <div className="text-white/60 text-sm">@{tgUser.username}</div>
            </div>
            <button
              className="ml-auto w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center active:scale-90 transition-transform"
              onClick={() => toast("Настройки")}
            >
              <Icon name="Settings" size={18} className="text-white" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Баланс", value: `${balance.toLocaleString("ru")} ₩` },
              { label: "Игр", value: gamesPlayed },
              { label: "Побед", value: gamesWon },
              { label: "Поражений", value: gamesLost },
              { label: "Друзей", value: 0 },
              { label: "Дней в игре", value: 1 },
            ].map((s) => (
              <div key={s.label} className="app-card-inner p-2.5 text-center">
                <div className="font-bold text-sm text-yellow-300">{s.value}</div>
                <div className="text-[10px] text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="text-xs font-bold text-white/60 uppercase tracking-wide">Личные данные</div>
          {[
            { key: "firstName", label: "Имя", placeholder: "Введите имя" },
            { key: "lastName", label: "Фамилия", placeholder: "По желанию" },
            { key: "city", label: "Город", placeholder: "Ваш город" },
            { key: "pvz", label: "Адрес ПВЗ Wildberries", placeholder: "Для получения выигрыша" },
          ].map((field) => (
            <div key={field.key}>
              <div className="text-xs text-white/60 mb-1">{field.label}</div>
              <input
                value={profileData[field.key as keyof typeof profileData]}
                onChange={(e) => setProfileData((p) => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/40"
              />
            </div>
          ))}
          <button
            onClick={() => toast.success("Данные сохранены")}
            className="w-full py-3 rounded-xl bg-green-600 border border-green-400/50 font-bold text-sm active:scale-95 transition-transform"
          >
            Сохранить
          </button>
        </div>
      </BottomSheet>

      {/* ===== TON ===== */}
      <BottomSheet open={openSheet === "ton"} onClose={() => setOpenSheet(null)} title="Кошелёк TON">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-5xl">💎</div>
          <div className="text-center">
            <div className="font-bold text-base mb-1">Подключите TON Wallet</div>
            <div className="text-sm text-white/60">Для покупки WCOIN и вывода выигрышей</div>
          </div>
          <button
            onClick={() => toast("Открытие TON Connect...")}
            className="w-full py-3 rounded-xl bg-[#0098ea] border border-[#0098ea]/50 font-bold text-sm active:scale-95 transition-transform"
          >
            Подключить TON Wallet
          </button>
        </div>
      </BottomSheet>

      {/* ===== FRIENDS ===== */}
      <BottomSheet open={openSheet === "friends"} onClose={() => setOpenSheet(null)} title="Приглашай друзей">
        <div className="flex flex-col gap-4">
          <div className="app-card-inner p-4 text-center">
            <div className="text-3xl mb-2">🎁</div>
            <div className="font-bold text-sm mb-1">Вы получаете 100 ₩ за каждого друга</div>
            <div className="text-xs text-white/60">Друг получает 50 ₩ при регистрации</div>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText("https://t.me/WheelBot?start=ref_USER123"); toast.success("Ссылка скопирована!"); }}
            className="w-full py-3 rounded-xl bg-green-600 border border-green-400/50 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Icon name="Link" size={16} />
            Скопировать ссылку
          </button>
          <div className="text-xs font-bold text-white/60 uppercase tracking-wide">Приглашённые друзья</div>
          <div className="app-card-inner p-4 text-center text-white/40 text-sm">
            Пока никого нет. Пригласите первого друга!
          </div>
        </div>
      </BottomSheet>

      {/* ===== DAILY ===== */}
      <BottomSheet open={openSheet === "daily"} onClose={() => setOpenSheet(null)} title="Ежедневный вход">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-white/70 text-center">
            День <span className="text-yellow-300 font-bold">{dailyDay}</span> из 7
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {DAILY_REWARDS.map((reward, i) => {
              const dayNum = i + 1;
              const isPast = dayNum < dailyDay;
              const isCurrent = dayNum === dailyDay;
              const isFuture = dayNum > dailyDay;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${
                    isPast ? "bg-green-500/20 border-green-400/40 opacity-70"
                    : isCurrent ? "bg-yellow-500/30 border-yellow-400/60"
                    : "bg-white/5 border-white/10 opacity-40"
                  }`}
                >
                  <div className="text-[10px] text-white/60">День {dayNum}</div>
                  <div className="text-base">{typeof reward === "number" ? `${reward}` : reward}</div>
                  {typeof reward === "number" && (
                    <div className="text-[9px] text-yellow-300">₩</div>
                  )}
                  {isPast && <Icon name="Check" size={10} className="text-green-400" />}
                </div>
              );
            })}
          </div>
          <button
            onClick={claimDaily}
            disabled={dailyClaimed}
            className={`w-full py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform ${
              dailyClaimed
                ? "bg-white/10 border border-white/20 text-white/40"
                : "bg-yellow-500/30 border border-yellow-400/50 text-yellow-300"
            }`}
          >
            {dailyClaimed ? "Уже получено сегодня ✓" : `Получить награду дня ${dailyDay}`}
          </button>
        </div>
      </BottomSheet>

      {/* ===== LEADERS ===== */}
      <BottomSheet open={openSheet === "leaders"} onClose={() => setOpenSheet(null)} title="Таблица лидеров">
        <div className="flex flex-col gap-2">
          {LEADERS.map((l) => (
            <div
              key={l.place}
              className={`app-card-inner px-4 py-3 flex items-center gap-3 ${l.place <= 3 ? "border-yellow-400/40" : ""}`}
            >
              <div className={`w-8 text-center font-black text-sm shrink-0 ${
                l.place === 1 ? "text-yellow-400" : l.place === 2 ? "text-gray-300" : l.place === 3 ? "text-orange-400" : "text-white/50"
              }`}>
                {l.place <= 3 ? ["🥇", "🥈", "🥉"][l.place - 1] : `#${l.place}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{l.name}</div>
                <div className="text-xs text-white/50">{l.games} игр</div>
              </div>
              <div className="text-yellow-300 font-bold text-sm shrink-0">
                {l.balance.toLocaleString("ru")} ₩
              </div>
            </div>
          ))}
          <div className="mt-2 app-card-inner px-4 py-3 flex items-center gap-3 border-white/30">
            <div className="w-8 text-center text-white/50 font-black text-sm shrink-0">#∞</div>
            <div className="flex-1">
              <div className="font-bold text-sm">Вы ({tgUser.username})</div>
              <div className="text-xs text-white/50">{gamesPlayed} игр</div>
            </div>
            <div className="text-yellow-300 font-bold text-sm shrink-0">
              {balance.toLocaleString("ru")} ₩
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* ===== PURCHASES ===== */}
      <BottomSheet open={openSheet === "purchases"} onClose={() => setOpenSheet(null)} title="Мои покупки">
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-white/60 uppercase tracking-wide">Бустеры</div>
          <div className="grid grid-cols-2 gap-2">
            {BOOSTERS_SHOP.map((b) => (
              <div key={b.id} className="app-card-inner p-3 flex flex-col items-center gap-2 text-center">
                <div className="text-2xl">{b.emoji}</div>
                <div className="font-bold text-xs">{b.name}</div>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: b.max }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border ${i < b.owned ? "bg-yellow-400 border-yellow-300" : "bg-white/10 border-white/20"}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-white/60">{b.owned}/{b.max}</div>
                {b.owned < b.max && (
                  <button
                    onClick={() => { setOpenSheet(null); setTimeout(() => toast("Переход в WHEEL SHOP..."), 200); }}
                    className="w-full py-1.5 rounded-lg bg-green-600/80 border border-green-400/40 text-xs font-bold active:scale-95 transition-transform"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* ===== HISTORY ===== */}
      <BottomSheet open={openSheet === "history"} onClose={() => setOpenSheet(null)} title="История розыгрышей">
        <div className="flex flex-col gap-2">
          {history.length === 0 ? (
            <div className="text-center text-white/40 text-sm py-8">Розыгрышей пока нет</div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="app-card-inner px-3 py-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.won ? "bg-green-500/30" : "bg-red-500/30"}`}>
                  <Icon name={item.won ? "Trophy" : "X"} size={16} className={item.won ? "text-green-400" : "text-red-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{item.lotName}</div>
                  <div className="text-[10px] text-white/50 mt-0.5">
                    {item.date} · сектор {item.selectedSector} → выпало {item.drawnSector}
                  </div>
                  <div className="text-[10px] text-white/50">
                    Стоимость: {item.prizeCost.toLocaleString("ru")} ₩
                  </div>
                </div>
                <div className={`text-xs font-bold shrink-0 ${item.won ? "text-green-400" : "text-red-400"}`}>
                  {item.won ? "Победа" : "Проигрыш"}
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
