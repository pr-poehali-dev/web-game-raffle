import { useState } from "react";
import Icon from "@/components/ui/icon";
import FortuneWheel from "@/components/FortuneWheel";
import { toast } from "sonner";

const WB_PRODUCT_URL = "https://functions.poehali.dev/c57573d7-b418-41d1-a1ea-735c2499505f";

type Tab = "profile" | "game" | "shop";

type Lot = {
  id: number;
  name: string;
  art: string;
  price: number;
  icon: string;
  isPopular: boolean;
  wbUrl?: string;
};

const POPULAR_LOTS: Lot[] = [
  { id: 1, name: "Наушники TWS Pro", art: "184729301", price: 4990, icon: "Headphones", isPopular: true },
  { id: 2, name: "Умные часы X8", art: "209384712", price: 7490, icon: "Watch", isPopular: true },
  { id: 3, name: "Рюкзак городской", art: "156023948", price: 2890, icon: "ShoppingBag", isPopular: true },
  { id: 4, name: "Колонка JBL Mini", art: "198273645", price: 3590, icon: "Speaker", isPopular: true },
];

const PROFILE_BUTTONS = [
  { icon: "User", title: "Профиль", sub: "Данные игрока" },
  {
    icon: "Wallet",
    title: "Подключай свой кошелёк TON",
    sub: "Привязка криптокошелька",
  },
  { icon: "Users", title: "Приглашай друзей", sub: "Реферальная программа" },
  {
    icon: "CalendarCheck",
    title: "Ежедневный вход",
    sub: "Бонус за активность",
  },
  {
    icon: "BarChart2",
    title: "Таблица лидеров",
    sub: "Отслеживай свой рейтинг",
  },
  {
    icon: "ShoppingCart",
    title: "Мои покупки",
    sub: "Бустеры и прочие покупки",
  },
  {
    icon: "Notebook",
    title: "История розыгрышей",
    sub: "Хронология событий игрока",
  },
];

const SHOP_BUTTONS = [
  { icon: "List", title: "Популярные лоты", sub: "горячая подборка товаров" },
  { icon: "ShoppingBag", title: "WHEEL SHOP", sub: "прокачай удачу" },
  {
    icon: "ArrowLeftRight",
    title: "WHEEL конвертер",
    sub: "покупка игровой валюты",
  },
  { icon: "Coins", title: "Получай WCOIN", sub: "выполняя задания" },
];

const Index = () => {
  const [tab, setTab] = useState<Tab>("game");
  const [article, setArticle] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [activeLot, setActiveLot] = useState<Lot | null>(null);
  const [prizeCost, setPrizeCost] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [bonusRotation, setBonusRotation] = useState(0);
  const [balance, setBalance] = useState(111050);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    const popularLot = POPULAR_LOTS.find((l) => l.art === article.trim());

    if (popularLot) {
      setActiveLot(popularLot);
      const cost = Math.ceil(popularLot.price / 10);
      setPrizeCost(cost);
      toast.success("Стоимость розыгрыша рассчитана!");
      return;
    }

    if (activeLot?.isPopular) {
      const cost = Math.ceil(activeLot.price / 10);
      setPrizeCost(cost);
      toast.success("Стоимость розыгрыша рассчитана!");
      return;
    }

    const art = article.trim();
    if (!art) {
      toast.error("Введите артикул товара WB");
      return;
    }

    const priceVal = parseFloat(manualPrice.replace(/\s/g, "").replace(",", "."));
    if (!manualPrice || isNaN(priceVal) || priceVal <= 0) {
      toast.error("Введите стоимость товара в рублях");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${WB_PRODUCT_URL}?article=${art}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Товар не найден");
        return;
      }
      const lot: Lot = {
        id: Date.now(),
        name: data.name,
        art,
        price: priceVal,
        icon: "Package",
        isPopular: false,
        wbUrl: data.url,
      };
      setActiveLot(lot);
      const cost = Math.ceil((priceVal * 1.1) / 10);
      setPrizeCost(cost);
      toast.success("Товар найден, стоимость рассчитана!");
    } catch {
      toast.error("Ошибка при запросе к WB");
    } finally {
      setLoading(false);
    }
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
              U
            </div>
            <div className="font-display font-black text-[15px] text-white drop-shadow-md leading-tight">
              user_nickname
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1a3a6e]/80 border border-[#4a7acc]/50 rounded-xl px-3 py-1.5">
            <div className="w-5 h-5 coin-w text-[9px] shrink-0">W</div>
            <span className="font-bold text-sm">
              {balance.toLocaleString("ru")}
            </span>
          </div>
        </header>

        {/* CONTENT CARD */}
        <div className="mx-3 mb-2 app-card flex-1 overflow-hidden flex flex-col p-3">
          {/* ===== GAME ===== */}
          {tab === "game" && (
            <div className="flex flex-col gap-3 h-full animate-fade-in">
              {/* Product block */}
              <div className="app-card-inner p-3 shrink-0">
                {/* Row 1: article + calculate */}
                <div className="flex gap-2 mb-2">
                  <input
                    value={article}
                    onChange={(e) => {
                      setArticle(e.target.value);
                      setActiveLot(null);
                      setPrizeCost(null);
                      setManualPrice("");
                    }}
                    placeholder="Артикул товара WB"
                    className="flex-1 bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/40"
                  />
                  <button
                    onClick={calculate}
                    disabled={loading}
                    className="bg-green-600 border border-green-400/60 px-3 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-transform whitespace-nowrap shrink-0 disabled:opacity-60"
                  >
                    {loading ? "..." : "Рассчитать"}
                  </button>
                </div>

                {/* Row 1b: manual price input (only for non-popular) */}
                {article.trim() && !POPULAR_LOTS.find(l => l.art === article.trim()) && !activeLot?.isPopular && (
                  <div className="mb-2">
                    <input
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      placeholder="Стоимость товара на WB (₽)"
                      type="number"
                      className="w-full bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/40"
                    />
                  </div>
                )}

                {/* Row 2: product preview */}
                <div className="flex gap-3 items-center bg-black/20 rounded-xl p-2.5">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Icon
                      name={activeLot ? activeLot.icon : "Package"}
                      size={22}
                      className={activeLot ? "text-white/80" : "text-white/30"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {activeLot ? activeLot.name : "Товар не выбран"}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">
                      {activeLot
                        ? `${activeLot.price.toLocaleString("ru")} ₽ на WB`
                        : "Введите артикул или выберите лот"}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const url = activeLot?.wbUrl || (activeLot ? `https://www.wildberries.ru/catalog/${activeLot.art}/detail.aspx` : null);
                      if (url) window.open(url, "_blank");
                    }}
                    disabled={!activeLot}
                    className="bg-[#c2185b] border border-[#e91e63]/60 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-40 active:scale-95 transition-transform whitespace-nowrap shrink-0"
                  >
                    Посмотреть
                  </button>
                </div>

                {/* Row 3: cost */}
                <div className="flex items-center justify-between mt-2.5 bg-black/20 rounded-xl px-3 py-2.5">
                  <span className="text-sm text-white/60">
                    Стоимость розыгрыша
                  </span>
                  <div className="flex items-center gap-2">
                    {prizeCost !== null ? (
                      <span className="font-display font-bold text-lg text-yellow-300">
                        {prizeCost.toLocaleString("ru")} ₩
                      </span>
                    ) : (
                      <span className="text-white/30 text-sm">—</span>
                    )}
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
                  Выбран сектор:{" "}
                  <span className="text-yellow-300 font-bold text-sm">
                    {selected}
                  </span>
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
                    <div className="font-bold text-sm leading-tight">
                      {btn.title}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                      {btn.sub}
                    </div>
                  </div>
                  <Icon
                    name="ChevronRight"
                    size={18}
                    className="text-white/50 shrink-0"
                  />
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
                    <div className="font-bold text-sm leading-tight">
                      {btn.title}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                      {btn.sub}
                    </div>
                  </div>
                  <Icon
                    name="ChevronRight"
                    size={18}
                    className="text-white/50 shrink-0"
                  />
                </button>
              ))}

              {/* Popular lots section */}
              <div className="mt-2">
                <div className="text-xs font-bold text-white/60 px-1 mb-2 uppercase tracking-wide">
                  Популярные лоты
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_LOTS.map((lot) => (
                    <button
                      key={lot.id}
                      onClick={() => {
                        setActiveLot(lot);
                        setArticle(lot.art);
                        setManualPrice("");
                        setPrizeCost(Math.ceil(lot.price / 10));
                        setTab("game");
                        toast.success(`Выбран лот: ${lot.name}`);
                      }}
                      className="app-card-inner p-3 text-left active:scale-95 transition-transform"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                        <Icon
                          name={lot.icon}
                          size={20}
                          className="text-white/80"
                        />
                      </div>
                      <div className="text-xs font-semibold leading-tight line-clamp-2 mb-1">
                        {lot.name}
                      </div>
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
            {[
              { id: "profile" as Tab, icon: "User", label: "Профиль" },
              { id: "game" as Tab, icon: "CirclePlay", label: "Игра" },
              { id: "shop" as Tab, icon: "Store", label: "Магазин" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl gap-1 transition-all active:scale-95 ${
                  tab === t.id ? "nav-tab-active" : "nav-tab-inactive"
                }`}
              >
                <Icon name={t.icon} size={22} className="text-white" />
                <span className="text-[10px] font-semibold text-white/80">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Index;