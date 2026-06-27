import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import FortuneWheel from "@/components/FortuneWheel";
import { toast } from "sonner";

type Tab = "profile" | "game" | "shop";

const POPULAR_LOTS = [
  { id: 1, name: "Наушники TWS Pro", art: "184729301", price: 4990, emoji: "🎧" },
  { id: 2, name: "Умные часы X8", art: "209384712", price: 7490, emoji: "⌚" },
  { id: 3, name: "Рюкзак городской", art: "156023948", price: 2890, emoji: "🎒" },
  { id: 4, name: "Колонка JBL Mini", art: "198273645", price: 3590, emoji: "🔊" },
];

const PROFILE_BUTTONS = [
  { icon: "Wallet", title: "Подключай свой кошелёк TON", sub: "Привязка криптокошелька", emoji: "👛" },
  { icon: "Users", title: "Приглашай друзей и поднимай свой уровень в игре", sub: "Реферальная программа", emoji: "👥" },
  { icon: "CalendarCheck", title: "Заходи каждый день и получай дополнительные бонусы", sub: "Ежедневный бонус", emoji: "📋" },
  { icon: "BarChart2", title: "Отслеживай свой рейтинг", sub: "Таблица лидеров", emoji: "📊" },
  { icon: "ShoppingCart", title: "Мои покупки и бонусы в игре", sub: "Бустеры и покупки", emoji: "🛒" },
  { icon: "Send", title: "Официальная группа в Telegram", sub: "Новости и события", emoji: "✈️" },
];

const SHOP_BUTTONS = [
  { icon: "ShoppingBag", title: "WHEEL SHOP", sub: "прокачай удачу", emoji: "🛍️" },
  { icon: "ArrowLeftRight", title: "WHEEL конвертер", sub: "покупка и обмен игровой волюты", emoji: "💸" },
  { icon: "Coins", title: "Получай WCOIN", sub: "выполняя задания", emoji: "🪙" },
  { icon: "TrendingUp", title: "Повысил уровень?", sub: "Забирай бонусы!", emoji: "📈" },
  { icon: "Newspaper", title: "WCOIN новости", sub: "будь в курсе всех событий", emoji: "📰" },
];

const MULTIPLIERS = [1, 2, 3, 5, 10];

const Index = () => {
  const [tab, setTab] = useState<Tab>("game");
  const [article, setArticle] = useState("");
  const [activeLot, setActiveLot] = useState<(typeof POPULAR_LOTS)[0] | null>(null);
  const [prizeCost, setPrizeCost] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [balanceW, setBalanceW] = useState(111050);
  const [balanceB, setBalanceB] = useState(436001);
  const [multiplierIdx, setMultiplierIdx] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [currency, setCurrency] = useState<"W" | "B">("W");

  const multiplier = MULTIPLIERS[multiplierIdx];

  const prevMultiplier = () => setMultiplierIdx((i) => Math.max(0, i - 1));
  const nextMultiplier = () => setMultiplierIdx((i) => Math.min(MULTIPLIERS.length - 1, i + 1));

  const calculate = () => {
    const lot = POPULAR_LOTS.find((l) => l.art === article) || activeLot;
    if (!lot) {
      toast.error("Введите артикул или выберите лот");
      return;
    }
    setActiveLot(lot);
    setPrizeCost(Math.ceil(lot.price / 10));
    toast.success("Стоимость розыгрыша рассчитана!");
  };

  const startSpin = () => {
    if (selected === null) {
      toast.error("Нажмите на сектор колеса, чтобы выбрать число");
      return;
    }
    if (prizeCost === null) {
      toast.error("Сначала нажмите «Проверить и рассчитать»");
      return;
    }
    const cost = prizeCost * multiplier;
    if (currency === "W" && balanceW < cost) {
      toast.error("Недостаточно WCOIN");
      return;
    }
    if (currency === "B" && balanceB < cost) {
      toast.error("Недостаточно BCOIN");
      return;
    }
    setSpinning(true);
    if (currency === "W") setBalanceW((b) => b - cost);
    else setBalanceB((b) => b - cost);

    const SECTORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    const winIndex = Math.floor(Math.random() * 10);
    const segAngle = 36;
    const target = 360 * 8 + (winIndex * segAngle + segAngle / 2);
    setRotation(target);

    setTimeout(() => {
      setSpinning(false);
      const won = SECTORS[winIndex] === selected;
      if (won) {
        toast.success(`🎉 Победа! Вы выиграли ${activeLot?.name || "приз"}!`);
      } else {
        toast(`Выпало число ${SECTORS[winIndex]}. Попробуйте ещё!`);
      }
    }, 4200);
  };

  return (
    <div className="min-h-screen app-bg flex justify-center">
      <div className="w-full max-w-md relative pb-24 text-white">

        {/* ===== HEADER ===== */}
        <header className="flex items-center justify-between px-4 py-3">
          {/* Avatar + nick */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#9b8ecf] to-[#7060b0] border-2 border-white/40 flex items-center justify-center font-display font-bold text-2xl text-white shadow-lg">
              R
            </div>
            <div>
              <div className="font-display font-black text-base text-white drop-shadow-md leading-tight">
                bananet_support
              </div>
            </div>
          </div>

          {/* Balances */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 bg-[#1a3a6e]/80 border border-[#3060a0]/60 rounded-xl px-3 py-1 min-w-[120px]">
              <div className="w-5 h-5 coin-w text-[9px] shrink-0">W</div>
              <span className="font-bold text-sm">{balanceW.toLocaleString("ru")}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1a3a6e]/80 border border-[#3060a0]/60 rounded-xl px-3 py-1 min-w-[120px]">
              <div className="w-5 h-5 coin-b text-[9px] shrink-0">B</div>
              <span className="font-bold text-sm">{balanceB.toLocaleString("ru")}</span>
            </div>
          </div>
        </header>

        {/* ===== CONTENT AREA ===== */}
        <div className="mx-3 app-card p-3 min-h-[calc(100vh-160px)]">

          {/* ===== GAME ===== */}
          {tab === "game" && (
            <div className="space-y-3 animate-fade-in">

              {/* Top controls row */}
              <div className="flex items-center gap-2">
                {/* Multiplier */}
                <div className="flex-1 app-card-inner flex items-center gap-1 px-2 py-2">
                  <button
                    onClick={prevMultiplier}
                    disabled={multiplierIdx === 0}
                    className="w-8 h-8 rounded-lg bg-red-500 border border-red-400 flex items-center justify-center font-bold text-white disabled:opacity-40 active:scale-95 transition-transform"
                  >
                    ◀
                  </button>
                  <div className="flex-1 text-center font-display font-bold text-lg">
                    x{multiplier}
                  </div>
                  <button
                    onClick={nextMultiplier}
                    disabled={multiplierIdx === MULTIPLIERS.length - 1}
                    className="w-8 h-8 rounded-lg bg-green-500 border border-green-400 flex items-center justify-center font-bold text-white disabled:opacity-40 active:scale-95 transition-transform"
                  >
                    ▶
                  </button>
                </div>
                {/* Settings */}
                <button
                  onClick={() => toast("Настройки")}
                  className="w-10 h-10 app-card-inner rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Icon name="Settings" size={20} />
                </button>
              </div>

              {/* Currency selector */}
              <div className="app-card-inner flex rounded-xl overflow-hidden border-0 p-0">
                <button
                  onClick={() => setCurrency("W")}
                  className={`flex-1 py-2.5 font-display font-bold text-base transition-all ${
                    currency === "W"
                      ? "bg-white text-[#1a3a7a]"
                      : "text-white/70"
                  }`}
                >
                  W
                </button>
                <button
                  onClick={() => setCurrency("B")}
                  className={`flex-1 py-2.5 font-display font-bold text-base transition-all ${
                    currency === "B"
                      ? "bg-white text-[#1a3a7a]"
                      : "text-white/70"
                  }`}
                >
                  B
                </button>
              </div>

              {/* Bet amount */}
              <div className="app-card-inner flex items-center gap-2 px-2 py-2">
                <button
                  onClick={() => setBetAmount((v) => Math.max(10, v - 10))}
                  className="w-9 h-9 rounded-lg bg-red-500 border border-red-400 flex items-center justify-center font-bold text-white text-lg active:scale-95 transition-transform"
                >
                  −
                </button>
                <div className="flex-1 text-center font-display font-bold text-xl">
                  {betAmount}
                </div>
                <button
                  onClick={() => setBetAmount((v) => v + 10)}
                  className="w-9 h-9 rounded-lg bg-green-500 border border-green-400 flex items-center justify-center font-bold text-white text-lg active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>

              {/* Win amount display */}
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="w-10 h-10 coin-w text-[11px] font-black shadow-lg">W</div>
                <span className="font-display font-black text-5xl text-white drop-shadow-lg tracking-tight">
                  {prizeCost !== null
                    ? (prizeCost * multiplier).toLocaleString("ru")
                    : "0.00"}
                </span>
              </div>

              {/* Fortune Wheel */}
              <div className="relative">
                <FortuneWheel
                  selected={selected}
                  spinning={spinning}
                  rotation={rotation}
                  onStart={startSpin}
                  onSelectSector={setSelected}
                />

                {/* Add booster button */}
                <button
                  onClick={() => toast("Выберите бустер в магазине")}
                  className="absolute bottom-2 left-2 w-12 h-12 rounded-full bg-green-500 border-4 border-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform z-20"
                >
                  <Icon name="Plus" size={22} className="text-white" />
                </button>
              </div>

              {/* Article input */}
              <div className="app-card-inner p-3 space-y-2">
                <div className="text-xs text-white/70 font-semibold">Артикул товара WB</div>
                <div className="flex gap-2">
                  <input
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    placeholder="Введите артикул..."
                    className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/40"
                  />
                  <button
                    onClick={calculate}
                    className="bg-green-500 border border-green-400 px-4 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                  >
                    Рассчитать
                  </button>
                </div>

                {activeLot && (
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
                    <div className="text-2xl">{activeLot.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{activeLot.name}</div>
                      <div className="text-xs text-white/60">{activeLot.price.toLocaleString("ru")} ₽</div>
                    </div>
                    <button
                      onClick={() => toast("Переход на WB")}
                      className="bg-[#c2185b] px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-transform"
                    >
                      Посмотреть
                    </button>
                  </div>
                )}
              </div>

              {/* Popular lots */}
              <div className="space-y-2">
                <div className="text-xs text-white/70 font-semibold px-1">Популярные лоты</div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_LOTS.map((lot) => (
                    <button
                      key={lot.id}
                      onClick={() => {
                        setActiveLot(lot);
                        setArticle(lot.art);
                        setPrizeCost(Math.ceil(lot.price / 10));
                      }}
                      className={`app-card-inner p-3 text-left active:scale-95 transition-transform ${
                        activeLot?.id === lot.id ? "border-yellow-400/80 bg-yellow-400/10" : ""
                      }`}
                    >
                      <div className="text-2xl mb-1">{lot.emoji}</div>
                      <div className="text-xs font-semibold leading-tight line-clamp-2">{lot.name}</div>
                      <div className="text-[10px] text-yellow-300 font-bold mt-1">
                        {Math.ceil(lot.price / 10).toLocaleString("ru")} ₩
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== PROFILE ===== */}
          {tab === "profile" && (
            <div className="space-y-2.5 animate-fade-in">
              {PROFILE_BUTTONS.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => toast(btn.title)}
                  className="app-btn w-full flex items-center gap-3 px-4 py-4 active:scale-98 transition-transform text-left"
                >
                  <span className="text-3xl shrink-0">{btn.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm leading-tight">{btn.title}</div>
                  </div>
                  <Icon name="ChevronRight" size={18} className="text-white/60 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* ===== SHOP ===== */}
          {tab === "shop" && (
            <div className="space-y-2.5 animate-fade-in">
              {SHOP_BUTTONS.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => toast(btn.title)}
                  className="app-btn w-full flex items-center gap-3 px-4 py-4 active:scale-98 transition-transform text-left"
                >
                  <span className="text-3xl shrink-0">{btn.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm leading-snug">{btn.title}</div>
                    <div className="text-xs text-white/60 mt-0.5">{btn.sub}</div>
                  </div>
                  <Icon name="ChevronRight" size={18} className="text-white/60 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== BOTTOM NAVIGATION ===== */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-3 pb-3 pt-1 z-40">
          <div className="flex gap-2">
            {([
              { id: "profile", emoji: "📋", label: "Профиль" },
              { id: "game", emoji: "🎡", label: "Игра" },
              { id: "shop", emoji: "🛒", label: "Магазин" },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all active:scale-95 ${
                  tab === t.id ? "nav-tab-active" : "nav-tab-inactive"
                }`}
              >
                <span className="text-2xl">{t.emoji}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Index;
