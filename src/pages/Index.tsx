import { useState } from "react";
import Icon from "@/components/ui/icon";
import FortuneWheel from "@/components/FortuneWheel";
import { toast } from "sonner";

type Tab = "profile" | "game" | "shop";

const POPULAR_LOTS = [
  {
    id: 1,
    name: "Наушники TWS Pro",
    art: "184729301",
    price: 4990,
    emoji: "🎧",
  },
  { id: 2, name: "Умные часы X8", art: "209384712", price: 7490, emoji: "⌚" },
  {
    id: 3,
    name: "Рюкзак городской",
    art: "156023948",
    price: 2890,
    emoji: "🎒",
  },
  {
    id: 4,
    name: "Колонка JBL Mini",
    art: "198273645",
    price: 3590,
    emoji: "🔊",
  },
];

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

const Index = () => {
  const [tab, setTab] = useState<Tab>("game");
  const [article, setArticle] = useState("");
  const [activeLot, setActiveLot] = useState<(typeof POPULAR_LOTS)[0] | null>(
    null,
  );
  const [prizeCost, setPrizeCost] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [balance, setBalance] = useState(111050);

  const pickLot = (lot: (typeof POPULAR_LOTS)[0]) => {
    setActiveLot(lot);
    setArticle(lot.art);
    setPrizeCost(null);
    setTab("game");
  };

  const calculate = () => {
    const lot = POPULAR_LOTS.find((l) => l.art === article) || activeLot;
    if (!lot) {
      toast.error("Введите артикул или выберите лот");
      return;
    }
    setActiveLot(lot);
    setPrizeCost(Math.round(lot.price / 10));
    toast.success("Стоимость розыгрыша рассчитана!");
  };

  const startSpin = () => {
    if (selected === null) return;
    if (prizeCost === null) {
      toast.error("Сначала нажмите «Проверить и рассчитать»");
      return;
    }
    if (balance < prizeCost) {
      toast.error("Недостаточно WCOIN");
      return;
    }
    setSpinning(true);
    setBalance((b) => b - prizeCost);
    const winIndex = Math.floor(Math.random() * 10);
    const segAngle = 36;
    const target = 360 * 6 - (winIndex * segAngle + segAngle / 2);
    setRotation((r) => r - (r % 360) + target);
    setTimeout(() => {
      setSpinning(false);
      const won = NUMBERS[winIndex] === selected;
      if (won) {
        toast.success(`🎉 Победа! Вы выиграли ${activeLot?.name}!`);
      } else {
        toast(`Выпало число ${NUMBERS[winIndex]}. Попробуйте ещё!`);
      }
    }, 4200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d1a] via-[#141428] to-[#0d0d1a] flex justify-center">
      <div className="w-full max-w-md relative pb-24 text-white">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-30 bg-[#0d0d1a]/90 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center font-display font-bold text-lg shadow-[0_0_15px_rgba(168,85,247,0.6)]">
              N
            </div>
            /div>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-yellow-400/40">
            <div className="w-5 h-5 rounded-full bg-yellow-400 text-black text-xs font-bold flex items-center justify-center">
              ₩
            </div>
            <span className="font-bold text-sm">
              {balance.toLocaleString("ru")}
            </span>
          </div>
        </header>

        {/* ===== GAME ===== */}
        {tab === "game" && (
          <main className="px-4 pt-4 space-y-5 animate-fade-in">
            {/* Article input + product */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex gap-2 mb-3">
                <input
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  placeholder="Артикул товара WB"
                  className="flex-1 bg-black/40 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/10 focus:border-violet-500 transition-colors"
                />
                <button
                  onClick={calculate}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                >
                  Рассчитать
                </button>
              </div>

              {/* Product preview */}
              <div className="flex gap-3 items-center bg-black/30 rounded-xl p-3">
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-3xl shrink-0">
                  {activeLot ? activeLot.emoji : "🛍️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {activeLot ? activeLot.name : "Товар не выбран"}
                  </div>
                  <div className="text-xs text-white/50">
                    {activeLot
                      ? `${activeLot.price.toLocaleString("ru")} ₽ на WB`
                      : "Выберите лот ниже"}
                  </div>
                </div>
                <button
                  disabled={!activeLot}
                  onClick={() => toast("Переход на карточку товара WB")}
                  className="bg-pink-600 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-40 active:scale-95 transition-transform"
                >
                  Посмотреть
                </button>
              </div>

              {/* Prize cost */}
              <div className="mt-3 flex items-center justify-between bg-gradient-to-r from-yellow-400/20 to-amber-500/10 rounded-xl px-4 py-3 border border-yellow-400/30">
                <span className="text-sm text-white/70">
                  Стоимость розыгрыша
                </span>
                <span className="font-display font-bold text-xl text-yellow-400">
                  {prizeCost !== null
                    ? `${prizeCost.toLocaleString("ru")} ₩`
                    : "—"}
                </span>
              </div>
            </div>

            {/* Number picker */}
            <div>
              <div className="text-xs text-white/50 mb-2 text-center">
                Выберите сектор и крутите барабан
              </div>
              <div className="grid grid-cols-5 gap-2">
                {NUMBERS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelected(n)}
                    className={`aspect-square rounded-xl font-display font-bold text-lg transition-all ${
                      selected === n
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-600 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.7)]"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Wheel */}
            <div className="py-2">
              <FortuneWheel
                selected={selected}
                spinning={spinning}
                rotation={rotation}
                onStart={startSpin}
              />
            </div>

            {/* Booster */}
            <button
              onClick={() => toast("Бустеры доступны в магазине")}
              className="w-full flex items-center justify-center gap-2 bg-green-500/20 border border-green-400/40 rounded-2xl py-3 font-bold text-green-300 active:scale-95 transition-transform"
            >
              <Icon name="Plus" size={18} /> Добавить бустер к игре
            </button>
          </main>
        )}

        {/* ===== PROFILE ===== */}
        {tab === "profile" && (
          <main className="px-4 pt-4 space-y-3 animate-fade-in">
            {[
              {
                icon: "User",
                title: "Профиль",
                sub: "Данные игрока",
              },
              {
                icon: "Wallet",
                title: "Подключи свой кошелёк TON",
                sub: "Привязка криптокошелька",
              },
              {
                icon: "Users",
                title: "Приглашай друзей",
                sub: "Реферальная программа",
              },
              {
                icon: "CalendarCheck",
                title: "Ежедневный вход",
                sub: "Бонус за активность",
              },
              {
                icon: "TrendingUp",
                title: "Таблица лидеров",
                sub: "Отслеживай свой рейтинг",
              },
              {
                icon: "ShoppingBag",
                title: "Мои покупки",
                sub: "Бустеры и прочие покупки",
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => toast(item.title)}
                className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-600/40 to-blue-800/30 rounded-2xl p-4 border border-blue-400/20 active:scale-[0.98] transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/40 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm">{item.title}</div>
                  <div className="text-xs text-white/50">{item.sub}</div>
                </div>
                <Icon
                  name="ChevronRight"
                  size={18}
                  className="ml-auto text-white/40"
                />
              </button>
            ))}

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-2">
              <div className="text-sm font-bold mb-2">История розыгрышей</div>
              {POPULAR_LOTS.slice(0, 3).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-xl">{l.emoji}</span>
                  <span className="text-sm flex-1">{l.name}</span>
                  <span className="text-xs text-white/40">
                    {Math.round(l.price / 10)} ₩
                  </span>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ===== SHOP ===== */}
        {tab === "shop" && (
          <main className="px-4 pt-4 space-y-3 animate-fade-in">
            <div className="text-xs uppercase tracking-wider text-white/40 mt-2">
              Популярные лоты
            </div>
            <div className="grid grid-cols-2 gap-3">
              {POPULAR_LOTS.map((lot) => (
                <button
                  key={lot.id}
                  onClick={() => pickLot(lot)}
                  className="bg-white/5 rounded-2xl p-3 border border-white/10 active:scale-95 transition-transform text-left hover:border-violet-500/50"
                >
                  <div className="aspect-square rounded-xl bg-white/10 flex items-center justify-center text-4xl mb-2">
                    {lot.emoji}
                  </div>
                  <div className="font-semibold text-sm truncate">
                    {lot.name}
                  </div>
                  <div className="text-xs text-white/50">
                    {lot.price.toLocaleString("ru")} ₽
                  </div>
                  <div className="text-xs font-bold text-yellow-400 mt-1">
                    Розыгрыш: {Math.round(lot.price / 10)} ₩
                  </div>
                </button>
              ))}
            </div>

            <div className="text-xs uppercase tracking-wider text-white/40 mt-4">
              Прокачай игру
            </div>
            {[
              {
                icon: "ShoppingCart",
                title: "WHEEL SHOP",
                sub: "Прокачай свою удачу",
              },
              {
                icon: "Repeat",
                title: "WHEEL конвертер",
                sub: "Покупка игровой валюты",
              },
              {
                icon: "Coins",
                title: "Получай WCOIN",
                sub: "Доп. задания за вознаграждение",
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => toast(item.title)}
                className="w-full flex items-center gap-3 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 rounded-2xl p-4 border border-violet-400/20 active:scale-[0.98] transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/40 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm">{item.title}</div>
                  <div className="text-xs text-white/50">{item.sub}</div>
                </div>
                <Icon
                  name="ChevronRight"
                  size={18}
                  className="ml-auto text-white/40"
                />
              </button>
            ))}
          </main>
        )}

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0d0d1a]/95 backdrop-blur-md border-t border-white/10 flex">
          {[
            { id: "profile" as Tab, icon: "User" },
            { id: "game" as Tab, icon: "Disc3" },
            { id: "shop" as Tab, icon: "Store" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                tab === t.id ? "text-violet-400" : "text-white/40"
              }`}
            >
              <Icon name={t.icon} size={22} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Index;