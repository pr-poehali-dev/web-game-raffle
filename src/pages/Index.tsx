import { useState } from "react";
import Icon from "@/components/ui/icon";
import FortuneWheel from "@/components/FortuneWheel";
import { toast } from "sonner";

type Tab = "profile" | "game" | "shop";

const POPULAR_LOTS: { id: number; name: string; art: string; price: number; icon: string }[] = [
  { id: 1, name: "Наушники TWS Pro", art: "184729301", price: 4990, icon: "Headphones" },
  { id: 2, name: "Умные часы X8", art: "209384712", price: 7490, icon: "Watch" },
  { id: 3, name: "Рюкзак городской", art: "156023948", price: 2890, icon: "ShoppingBag" },
  { id: 4, name: "Колонка JBL Mini", art: "198273645", price: 3590, icon: "Speaker" },
];

const PROFILE_BUTTONS = [
  { icon: "Wallet", title: "Подключай свой кошелёк TON", sub: "Привязка криптокошелька" },
  { icon: "Users", title: "Приглашай друзей и поднимай уровень", sub: "Реферальная программа" },
  { icon: "CalendarCheck", title: "Заходи каждый день за бонусами", sub: "Ежедневный бонус" },
  { icon: "BarChart2", title: "Отслеживай свой рейтинг", sub: "Таблица лидеров" },
  { icon: "ShoppingCart", title: "Мои покупки и бонусы в игре", sub: "Бустеры и покупки" },
  { icon: "Send", title: "Официальная группа в Telegram", sub: "Новости и события" },
];

const SHOP_BUTTONS = [
  { icon: "ShoppingBag", title: "WHEEL SHOP", sub: "прокачай удачу" },
  { icon: "ArrowLeftRight", title: "WHEEL конвертер", sub: "покупка и обмен игровой валюты" },
  { icon: "Coins", title: "Получай WCOIN", sub: "выполняя задания" },
  { icon: "TrendingUp", title: "Повысил уровень?", sub: "Забирай бонусы!" },
  { icon: "Newspaper", title: "WCOIN новости", sub: "будь в курсе всех событий" },
];

const Index = () => {
  const [tab, setTab] = useState<Tab>("game");
  const [article, setArticle] = useState("");
  const [activeLot, setActiveLot] = useState<(typeof POPULAR_LOTS)[0] | null>(null);
  const [prizeCost, setPrizeCost] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [bonusRotation, setBonusRotation] = useState(0);
  const [balance, setBalance] = useState(111050);
  const [showSettings, setShowSettings] = useState(false);

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
      toast.error("Сначала рассчитайте стоимость розыгрыша");
      return;
    }
    if (balance < prizeCost) {
      toast.error("Недостаточно WCOIN");
      return;
    }
    setSpinning(true);
    setBalance((b) => b - prizeCost);

    const SECTORS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const winIndex = Math.floor(Math.random() * 10);
    const segAngle = 36;
    const mainTarget = 360 * 8 + winIndex * segAngle + segAngle / 2;
    setRotation(mainTarget);

    const bonusWinIndex = Math.floor(Math.random() * 10);
    const bonusTarget = 360 * 6 + bonusWinIndex * segAngle + segAngle / 2;
    setBonusRotation(bonusTarget);

    setTimeout(() => {
      setSpinning(false);
      const won = SECTORS[winIndex] === selected;
      if (won) {
        toast.success(`Победа! Вы выиграли ${activeLot?.name || "приз"}!`);
      } else {
        toast(`Выпало ${SECTORS[winIndex]}. Попробуйте ещё!`);
      }
    }, 4200);
  };

  return (
    <div className="min-h-screen app-bg flex justify-center overflow-hidden">
      <div className="w-full max-w-md flex flex-col h-screen text-white">

        {/* HEADER */}
        <header className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9b8ecf] to-[#7060b0] border-2 border-white/40 flex items-center justify-center font-display font-bold text-xl text-white shadow-lg shrink-0">
              R
            </div>
            <div className="font-display font-black text-[15px] text-white drop-shadow-md leading-tight">
              bananet_support
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1a3a6e]/80 border border-[#4a7acc]/50 rounded-xl px-3 py-1.5">
            <div className="w-5 h-5 coin-w text-[9px] shrink-0">W</div>
            <span className="font-bold text-sm">{balance.toLocaleString("ru")}</span>
          </div>
        </header>

        {/* CONTENT CARD */}
        <div className="mx-3 mb-2 app-card flex-1 overflow-hidden flex flex-col p-3">

          {/* ===== GAME ===== */}
          {tab === "game" && (
            <div className="flex flex-col gap-3 h-full animate-fade-in">

              {/* Product block */}
              <div className="app-card-inner p-3 shrink-0">
                {/* Row 1: input + buttons */}
                <div className="flex gap-2 mb-3">
                  <input
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    placeholder="Артикул товара WB"
                    className="flex-1 bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/40"
                  />
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-10 h-10 app-card-inner rounded-xl flex items-center justify-center active:scale-95 transition-transform shrink-0"
                  >
                    <Icon name="Settings" size={18} className="text-white/80" />
                  </button>
                </div>

                {/* Settings panel */}
                {showSettings && (
                  <div className="mb-3 bg-white/5 rounded-xl p-2.5 text-xs text-white/70 space-y-2">
                    <div className="font-bold text-white/90 mb-1">Настройки игры</div>
                    <div className="flex justify-between"><span>Звук</span><span className="text-white/50">вкл</span></div>
                    <div className="flex justify-between"><span>Вибрация</span><span className="text-white/50">вкл</span></div>
                    <div className="flex justify-between"><span>Язык</span><span className="text-white/50">RU</span></div>
                  </div>
                )}

                {/* Row 2: product preview */}
                <div className="flex gap-3 items-center bg-black/20 rounded-xl p-2.5">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    {activeLot
                      ? <Icon name={activeLot.icon} size={22} className="text-white/80" />
                      : <Icon name="Package" size={22} className="text-white/30" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {activeLot ? activeLot.name : "Товар не выбран"}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">
                      {activeLot ? `${activeLot.price.toLocaleString("ru")} ₽ на WB` : "Выберите лот в магазине"}
                    </div>
                  </div>
                  <button
                    onClick={() => toast("Переход на WB")}
                    disabled={!activeLot}
                    className="bg-[#c2185b] border border-[#e91e63]/60 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-40 active:scale-95 transition-transform whitespace-nowrap shrink-0"
                  >
                    Посмотреть
                  </button>
                </div>

                {/* Row 3: cost + calculate */}
                <div className="flex items-center justify-between mt-2.5 bg-black/20 rounded-xl px-3 py-2.5">
                  <span className="text-sm text-white/60">Стоимость розыгрыша</span>
                  <div className="flex items-center gap-2">
                    {prizeCost !== null && (
                      <span className="font-display font-bold text-lg text-yellow-300">
                        {prizeCost.toLocaleString("ru")} ₩
                      </span>
                    )}
                    {prizeCost === null && <span className="text-white/30 text-sm">—</span>}
                    <button
                      onClick={calculate}
                      className="bg-green-600 border border-green-400/60 px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-transform whitespace-nowrap"
                    >
                      Рассчитать
                    </button>
                  </div>
                </div>
              </div>

              {/* Fortune Wheel */}
              <div className="flex-1 flex items-center justify-center min-h-0">
                <FortuneWheel
                  selected={selected}
                  spinning={spinning}
                  rotation={rotation}
                  bonusRotation={bonusRotation}
                  onStart={startSpin}
                  onSelectSector={setSelected}
                  onBooster={() => toast("Выберите бустер в магазине")}
                />
              </div>

              {/* Selected hint */}
              {selected !== null && (
                <div className="shrink-0 text-center text-xs text-white/60 pb-1">
                  Выбран сектор: <span className="text-yellow-300 font-bold text-sm">{selected}</span>
                </div>
              )}
            </div>
          )}

          {/* ===== PROFILE ===== */}
          {tab === "profile" && (
            <div className="flex flex-col gap-2 overflow-y-auto animate-fade-in">
              {PROFILE_BUTTONS.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => toast(btn.title)}
                  className="app-btn w-full flex items-center gap-3 px-4 py-3.5 active:scale-[0.98] transition-transform text-left shrink-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Icon name={btn.icon} size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm leading-tight">{btn.title}</div>
                    <div className="text-xs text-white/60 mt-0.5">{btn.sub}</div>
                  </div>
                  <Icon name="ChevronRight" size={18} className="text-white/50 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* ===== SHOP ===== */}
          {tab === "shop" && (
            <div className="flex flex-col gap-2 overflow-y-auto animate-fade-in">
              {SHOP_BUTTONS.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => toast(btn.title)}
                  className="app-btn w-full flex items-center gap-3 px-4 py-3.5 active:scale-[0.98] transition-transform text-left shrink-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Icon name={btn.icon} size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm leading-tight">{btn.title}</div>
                    <div className="text-xs text-white/60 mt-0.5">{btn.sub}</div>
                  </div>
                  <Icon name="ChevronRight" size={18} className="text-white/50 shrink-0" />
                </button>
              ))}

              {/* Popular lots section */}
              <div className="mt-2">
                <div className="text-xs font-bold text-white/60 px-1 mb-2 uppercase tracking-wide">Популярные лоты</div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_LOTS.map((lot) => (
                    <button
                      key={lot.id}
                      onClick={() => {
                        setActiveLot(lot);
                        setArticle(lot.art);
                        setPrizeCost(Math.ceil(lot.price / 10));
                        setTab("game");
                        toast.success(`Выбран лот: ${lot.name}`);
                      }}
                      className="app-card-inner p-3 text-left active:scale-95 transition-transform"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                        <Icon name={lot.icon} size={20} className="text-white/80" />
                      </div>
                      <div className="text-xs font-semibold leading-tight line-clamp-2 mb-1">{lot.name}</div>
                      <div className="text-[11px] text-yellow-300 font-bold">
                        {Math.ceil(lot.price / 10).toLocaleString("ru")} ₩
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION */}
        <nav className="px-3 pb-3 shrink-0">
          <div className="flex gap-2">
            {([
              { id: "profile" as Tab, icon: "User", label: "Профиль" },
              { id: "game" as Tab, icon: "Disc3", label: "Игра" },
              { id: "shop" as Tab, icon: "Store", label: "Магазин" },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl gap-1 transition-all active:scale-95 ${
                  tab === t.id ? "nav-tab-active" : "nav-tab-inactive"
                }`}
              >
                <Icon name={t.icon} size={22} className="text-white" />
                <span className="text-[10px] font-semibold text-white/80">{t.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Index;
