import { useState } from "react";
import Icon from "@/components/ui/icon";
import BottomSheet from "@/components/BottomSheet";
import { toast } from "sonner";

type Lot = {
  id: number;
  name: string;
  art: string;
  price: number;
  icon: string;
  isPopular: boolean;
  wbUrl?: string;
  imageUrl?: string;
  pool?: number;
  poolMax?: number;
};

const POPULAR_LOTS: Lot[] = [
  {
    id: 1,
    name: "Наушники TWS Pro",
    art: "184729301",
    price: 4990,
    icon: "Headphones",
    isPopular: true,
    pool: 7,
    poolMax: 10,
  },
  {
    id: 2,
    name: "Умные часы X8",
    art: "209384712",
    price: 7490,
    icon: "Watch",
    isPopular: true,
    pool: 3,
    poolMax: 10,
  },
  {
    id: 3,
    name: "Рюкзак городской",
    art: "156023948",
    price: 2890,
    icon: "ShoppingBag",
    isPopular: true,
    pool: 9,
    poolMax: 10,
  },
  {
    id: 4,
    name: "Колонка JBL Mini",
    art: "198273645",
    price: 3590,
    icon: "Speaker",
    isPopular: true,
    pool: 5,
    poolMax: 10,
  },
];

const BOOSTERS = [
  {
    id: "safebet",
    icon: "Heart",
    emoji: "❤️",
    name: "SafeBet",
    desc: "Ставка не сгорает при проигрыше: если сектор не совпал, стоимость участия возвращается на баланс игрока",
    cost: 100,
    color: "#e91e63",
  },
  {
    id: "goldwin",
    icon: "Rocket",
    emoji: "🚀",
    name: "GoldWin",
    desc: "При выигрыше товара игрок может выбрать: оформить доставку товара или получить удвоенную стоимость товара на игровой счёт",
    cost: 200,
    color: "#ffa000",
  },
  {
    id: "powerspin",
    icon: "Zap",
    emoji: "⚡",
    name: "PowerSpin",
    desc: "В случае проигрыша игроку даётся одно дополнительное вращение барабана что увеличивает шанс на победу",
    cost: 200,
    color: "#7c4dff",
  },
  {
    id: "bonusdrum",
    icon: "Gift",
    emoji: "🎁",
    name: "BonusDrum",
    desc: "Активируется бонусный барабан где игрок сможет выиграть дополнительный гарантированный приз",
    cost: 100,
    color: "#00bcd4",
  },
];

const WCOIN_PACKS = [
  { amount: 100, price: "49 ₽", ton: "0.15 TON" },
  { amount: 250, price: "99 ₽", ton: "0.32 TON" },
  { amount: 500, price: "179 ₽", ton: "0.59 TON" },
  { amount: 1000, price: "299 ₽", ton: "0.98 TON" },
];

const TASKS = [
  { id: 1, title: "Подписаться на канал WHEEL", reward: 50, done: false },
  { id: 2, title: "Пригласить первого друга", reward: 100, done: false },
  { id: 3, title: "Сыграть 3 розыгрыша", reward: 75, done: false },
  { id: 4, title: "Посетить игру 7 дней подряд", reward: 150, done: false },
  { id: 5, title: "Подписаться на Instagram WHEEL", reward: 25, done: true },
  { id: 6, title: "Поделиться игрой в соцсетях", reward: 50, done: true },
];

interface ShopScreenProps {
  balance: number;
  onSelectLot: (lot: Lot) => void;
  onBalanceChange: (delta: number) => void;
  onGoConverter?: () => void;
}

const ShopScreen = ({
  balance,
  onSelectLot,
  onBalanceChange,
  onGoConverter,
}: ShopScreenProps) => {
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const [tasks, setTasks] = useState(TASKS);
  const [customAmount, setCustomAmount] = useState("");

  const SHOP_ITEMS = [
    {
      id: "popular",
      icon: "List",
      title: "Популярные лоты",
      sub: "горячая подборка товаров",
    },
    {
      id: "wheelshop",
      icon: "ShoppingBag",
      title: "WHEEL SHOP",
      sub: "прокачай удачу",
    },
    {
      id: "converter",
      icon: "ArrowLeftRight",
      title: "WHEEL конвертер",
      sub: "покупка игровой валюты",
    },
    {
      id: "tasks",
      icon: "Coins",
      title: "Получай WCOIN",
      sub: "выполняя задания",
    },
  ];

  const claimTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id && !t.done) {
          onBalanceChange(t.reward);
          toast.success(`+${t.reward} ₩ получено!`);
          return { ...t, done: true };
        }
        return t;
      }),
    );
  };

  const buyBooster = (booster: (typeof BOOSTERS)[0]) => {
    if (balance < booster.cost) {
      toast.error(`Недостаточно WCOIN. Купить монеты?`, {
        action: {
          label: "Купить",
          onClick: () => {
            setOpenSheet(null);
            setTimeout(() => setOpenSheet("converter"), 300);
          },
        },
      });
      return;
    }
    onBalanceChange(-booster.cost);
    toast.success(`${booster.emoji} ${booster.name} куплен!`);
  };

  const buyWcoin = (amount: number) => {
    onBalanceChange(amount);
    toast.success(`+${amount} ₩ зачислено!`);
  };

  const pendingTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  return (
    <div className="flex flex-col gap-2 overflow-y-auto animate-fade-in">
      {SHOP_ITEMS.map((item) => (
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
          <Icon
            name="ChevronRight"
            size={18}
            className="text-white/50 shrink-0"
          />
        </button>
      ))}

      {/* ===== POPULAR LOTS ===== */}
      <BottomSheet
        open={openSheet === "popular"}
        onClose={() => setOpenSheet(null)}
        title="Популярные лоты"
      >
        <div className="flex flex-col gap-4">
          {POPULAR_LOTS.map((lot) => (
            <div
              key={lot.id}
              className="app-card-inner p-4 flex flex-col gap-3"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Icon name={lot.icon} size={28} className="text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm leading-tight mb-1">
                    {lot.name}
                  </div>
                  <div className="text-xs text-white/60 mb-1">
                    Арт: {lot.art}
                  </div>
                  <div className="text-yellow-300 font-bold text-sm">
                    {Math.ceil(lot.price / 10).toLocaleString("ru")} ₩ —
                    стоимость розыгрыша
                  </div>
                </div>
              </div>

              {/* Pool bar */}
              {lot.pool !== undefined && lot.poolMax !== undefined && (
                <div>
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Пул игроков</span>
                    <span>
                      {lot.pool}/{lot.poolMax}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${(lot.pool / lot.poolMax) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    window.open(
                      `https://www.wildberries.ru/catalog/${lot.art}/detail.aspx`,
                      "_blank",
                    )
                  }
                  className="flex-1 py-2 rounded-xl bg-[#c2185b]/80 border border-[#e91e63]/50 text-xs font-bold active:scale-95 transition-transform"
                >
                  Посмотреть
                </button>
                <button
                  onClick={() => {
                    onSelectLot(lot);
                    setOpenSheet(null);
                    toast.success(`Лот выбран: ${lot.name}`);
                  }}
                  className="flex-1 py-2 rounded-xl bg-green-600 border border-green-400/50 text-xs font-bold active:scale-95 transition-transform"
                >
                  Выбрать
                </button>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* ===== WHEEL SHOP ===== */}
      <BottomSheet
        open={openSheet === "wheelshop"}
        onClose={() => setOpenSheet(null)}
        title="WHEEL SHOP"
      >
        <div className="flex flex-col gap-4">
          {/* Boosters */}
          <div className="text-xs font-bold text-white/60 uppercase tracking-wide">
            Бустеры
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BOOSTERS.map((b) => (
              <div
                key={b.id}
                className="app-card-inner p-3 flex flex-col items-center gap-2 text-center"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    background: b.color + "33",
                    border: `1.5px solid ${b.color}66`,
                  }}
                >
                  {b.emoji}
                </div>
                <div className="font-bold text-sm">{b.name}</div>
                <div className="text-xs text-white/60">{b.desc}</div>
                <div className="text-yellow-300 font-bold text-sm">
                  {b.cost} ₩
                </div>
                <button
                  onClick={() => buyBooster(b)}
                  className="w-full py-2 rounded-xl bg-green-600 border border-green-400/50 text-xs font-bold active:scale-95 transition-transform"
                >
                  Купить
                </button>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* ===== CONVERTER ===== */}
      <BottomSheet
        open={openSheet === "converter"}
        onClose={() => setOpenSheet(null)}
        title="WHEEL конвертер"
      >
        <div className="flex flex-col gap-4">
          <div className="app-card-inner p-4 text-center">
            <div className="text-4xl mb-2">💱</div>
            <div className="font-bold text-sm mb-1">Курс обмена</div>
            <div className="text-white/60 text-xs">
              1 WCOIN = 0.49 ₽ / 0.0015 TON
            </div>
          </div>

          <div className="text-xs font-bold text-white/60 uppercase tracking-wide">
            Выберите пакет
          </div>
          {WCOIN_PACKS.map((pack) => (
            <div
              key={pack.amount}
              className="app-card-inner px-4 py-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 coin-w text-[11px] shrink-0">
                {pack.amount >= 1000 ? "1K" : pack.amount}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{pack.amount} WCOIN</div>
                <div className="text-xs text-white/60">
                  {pack.price} · {pack.ton}
                </div>
              </div>
              <button
                onClick={() => buyWcoin(pack.amount)}
                className="px-4 py-2 rounded-xl bg-green-600 border border-green-400/50 text-xs font-bold active:scale-95 transition-transform"
              >
                Купить
              </button>
            </div>
          ))}

          <div className="text-xs font-bold text-white/60 uppercase tracking-wide mt-1">
            Произвольная сумма
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Введите кол-во WCOIN"
              className="flex-1 bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 placeholder:text-white/40"
            />
            <button
              onClick={() => {
                const n = parseInt(customAmount);
                if (!n || n < 10) {
                  toast.error("Минимум 10 WCOIN");
                  return;
                }
                buyWcoin(n);
                setCustomAmount("");
              }}
              className="px-4 py-2.5 rounded-xl bg-green-600 border border-green-400/50 text-sm font-bold active:scale-95 transition-transform whitespace-nowrap"
            >
              Купить
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* ===== TASKS ===== */}
      <BottomSheet
        open={openSheet === "tasks"}
        onClose={() => setOpenSheet(null)}
        title="Получай WCOIN"
      >
        <div className="flex flex-col gap-2">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="app-card-inner px-4 py-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight">
                  {task.title}
                </div>
              </div>
              <button
                onClick={() => claimTask(task.id)}
                className="px-3 py-2 rounded-xl bg-yellow-500/30 border border-yellow-400/50 text-yellow-300 text-xs font-bold whitespace-nowrap active:scale-95 transition-transform shrink-0"
              >
                +{task.reward} ₩
              </button>
            </div>
          ))}
          {doneTasks.length > 0 && (
            <>
              <div className="text-xs text-white/40 uppercase tracking-wide mt-2 px-1">
                Выполнено
              </div>
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="app-card-inner px-4 py-3 flex items-center gap-3 opacity-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-tight line-through">
                      {task.title}
                    </div>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white/10 text-white/50 text-xs font-bold whitespace-nowrap shrink-0">
                    Получено
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default ShopScreen;
