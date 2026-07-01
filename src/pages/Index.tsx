import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import FortuneWheel from "@/components/FortuneWheel";
import ShopScreen from "@/components/ShopScreen";
import ProfileScreen from "@/components/ProfileScreen";
import { toast } from "sonner";

const WB_PRODUCT_URL = "https://functions.poehali.dev/c57573d7-b418-41d1-a1ea-735c2499505f";
const TELEGRAM_BOT_USERNAME = "wildwheelbot";
const TELEGRAM_AUTH_URL = "https://functions.poehali.dev/78b72379-2a23-4fec-a35b-b31afad8cdc4";

type Tab = "profile" | "game" | "shop";
type GamePhase = "idle" | "spinning" | "result";

type Lot = {
  id: number;
  name: string;
  art: string;
  price: number;
  icon: string;
  isPopular: boolean;
  wbUrl?: string;
};

type HistoryItem = {
  id: number;
  lotName: string;
  prizeCost: number;
  selectedSector: number;
  drawnSector: number;
  won: boolean;
  bonusPrize: BonusPrize | null;
  date: string;
};

type BonusPrize =
  | { type: "wcoin"; amount: number }
  | { type: "booster"; name: string };

const BONUS_PRIZES: BonusPrize[] = [
  { type: "wcoin", amount: 5 },
  { type: "wcoin", amount: 10 },
  { type: "wcoin", amount: 25 },
  { type: "wcoin", amount: 50 },
  { type: "wcoin", amount: 100 },
  { type: "wcoin", amount: 150 },
  { type: "wcoin", amount: 250 },
  { type: "wcoin", amount: 500 },
  { type: "wcoin", amount: 1000 },
  { type: "booster", name: "Удача ×2" },
];

const BOOSTER_COST = 500;

const POPULAR_LOTS: Lot[] = [
  {
    id: 1,
    name: "Наушники TWS Pro",
    art: "184729301",
    price: 4990,
    icon: "Headphones",
    isPopular: true,
  },
  {
    id: 2,
    name: "Умные часы X8",
    art: "209384712",
    price: 7490,
    icon: "Watch",
    isPopular: true,
  },
  {
    id: 3,
    name: "Рюкзак городской",
    art: "156023948",
    price: 2890,
    icon: "ShoppingBag",
    isPopular: true,
  },
  {
    id: 4,
    name: "Колонка JBL Mini",
    art: "198273645",
    price: 3590,
    icon: "Speaker",
    isPopular: true,
  },
];

type Player = {
  id: number;
  telegram_id: string | null;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
};

const Index = () => {
  const [tab, setTab] = useState<Tab>("game");
  const [article, setArticle] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [activeLot, setActiveLot] = useState<Lot | null>(null);
  const [prizeCost, setPrizeCost] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [rotation, setRotation] = useState(0);
  const [bonusRotation, setBonusRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [boosterActive, setBoosterActive] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Auth state
  const [player, setPlayer] = useState<Player | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // balance — локальный счётчик WCOIN
  const [balance, setBalance] = useState(1000);

  const loginViaTelegram = () => {
    window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}?start=web_auth`, "_blank");
  };

  const logout = () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      fetch(`${TELEGRAM_AUTH_URL}?action=logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("tg_user");
    setPlayer(null);
    setShowWelcome(false);
  };

  useEffect(() => {
    const stored = localStorage.getItem("tg_user");
    if (stored) {
      try {
        const p: Player = JSON.parse(stored);
        setPlayer(p);
        setShowWelcome(true);
      } catch {
        localStorage.removeItem("tg_user");
      }
    }
    setAuthLoading(false);
  }, []);

  // Result state
  const [resultWon, setResultWon] = useState(false);
  const [resultSector, setResultSector] = useState(0);
  const [resultBonus, setResultBonus] = useState<BonusPrize | null>(null);
  const [resultHandled, setResultHandled] = useState(false);

  const calculate = async () => {
    const popularLot = POPULAR_LOTS.find((l) => l.art === article.trim());

    if (popularLot) {
      setActiveLot(popularLot);
      setPrizeCost(Math.ceil(popularLot.price / 10));
      toast.success("Стоимость розыгрыша рассчитана!");
      return;
    }

    if (activeLot?.isPopular) {
      setPrizeCost(Math.ceil(activeLot.price / 10));
      toast.success("Стоимость розыгрыша рассчитана!");
      return;
    }

    const art = article.trim();
    if (!art) {
      toast.error("Введите артикул товара WB");
      return;
    }

    const priceVal = parseFloat(
      manualPrice.replace(/\s/g, "").replace(",", "."),
    );
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
      setPrizeCost(Math.ceil((priceVal * 1.1) / 10));
      toast.success("Товар найден, стоимость рассчитана!");
    } catch {
      toast.error("Ошибка при запросе к WB");
    } finally {
      setLoading(false);
    }
  };

  const addBooster = () => {
    if (phase !== "idle") return;
    if (boosterActive) {
      setBoosterActive(false);
      setBalance((b) => b + BOOSTER_COST);
      toast("Бустер отключён, WCOIN возвращены");
      return;
    }
    if (balance < BOOSTER_COST) {
      toast.error(`Недостаточно WCOIN. Нужно ${BOOSTER_COST} ₩`);
      return;
    }
    setBalance((b) => b - BOOSTER_COST);
    setBoosterActive(true);
    toast.success(`Бустер активирован! −${BOOSTER_COST} ₩`);
  };

  const startSpin = () => {
    if (selected === null) {
      toast.error("Выберите сектор на колесе");
      return;
    }
    if (!prizeCost) {
      toast.error("Сначала рассчитайте стоимость розыгрыша");
      return;
    }
    if (balance < prizeCost) {
      toast.error("Недостаточно WCOIN");
      return;
    }

    setBalance((b) => b - prizeCost);
    setPhase("spinning");
    setResultHandled(false);

    // Основное колесо
    const drawnIndex = Math.floor(Math.random() * 10);
    const segAngle = 36;
    const mainTarget = 360 * 8 + drawnIndex * segAngle + segAngle / 2;
    setRotation((prev) => prev + mainTarget);

    // Бонусный барабан
    const bonusPrizeIndex = Math.floor(Math.random() * BONUS_PRIZES.length);
    const bonusTarget = 360 * 6 + bonusPrizeIndex * segAngle + segAngle / 2;
    setBonusRotation((prev) => prev + bonusTarget);

    const won = drawnIndex === selected;

    setTimeout(() => {
      const drawnNum = drawnIndex;
      const bonus = boosterActive ? BONUS_PRIZES[bonusPrizeIndex] : null;

      if (bonus?.type === "wcoin") {
        setBalance((b) => b + bonus.amount);
      }

      setResultWon(won);
      setResultSector(drawnNum);
      setResultBonus(bonus);
      setBoosterActive(false);

      const item: HistoryItem = {
        id: Date.now(),
        lotName: activeLot?.name || "—",
        prizeCost,
        selectedSector: selected,
        drawnSector: drawnNum,
        won,
        bonusPrize: bonus,
        date: new Date().toLocaleTimeString("ru", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setHistory((h) => [item, ...h].slice(0, 50));
      setPhase("result");
    }, 4500);
  };

  const resetGame = () => {
    setPhase("idle");
    setSelected(null);
    setResultWon(false);
    setResultBonus(null);
    setResultHandled(false);
  };

  const handleDelivery = () => {
    setResultHandled(true);
    toast.success("Доставка оформлена! Ожидайте связи менеджера.");
  };

  const handleCashout = () => {
    if (!activeLot) return;
    setResultHandled(true);
    setBalance((b) => b + activeLot.price);
    toast.success(
      `+${activeLot.price.toLocaleString("ru")} ₩ зачислено на счёт!`,
    );
  };

  const displayName = player?.name || (player ? "Игрок" : "…");
  const avatarLetter = displayName[0]?.toUpperCase() || "?";

  if (authLoading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
          <div className="font-display font-bold text-lg">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg flex justify-center overflow-hidden">
      <div className="w-full max-w-md flex flex-col h-screen text-white">

        {/* LOGIN POPUP — если не авторизован */}
        {!player && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 text-center"
              style={{ background: "linear-gradient(135deg, hsl(214,60%,52%), hsl(218,65%,44%))", border: "1.5px solid hsl(210,65%,65%)" }}>
              <div className="text-5xl">🎰</div>
              <div className="font-display font-black text-2xl">Wild Wheel</div>
              <div className="text-sm text-white/80">
                Войди через Telegram чтобы начать играть и сохранять результаты
              </div>
              <button
                onClick={loginViaTelegram}
                className="w-full py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                style={{ background: "#0088cc" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg>
                Войти через Telegram
              </button>
            </div>
          </div>
        )}

        {/* WELCOME POPUP — после входа */}
        {showWelcome && player && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 text-center"
              style={{ background: "linear-gradient(135deg, hsl(214,60%,52%), hsl(218,65%,44%))", border: "1.5px solid hsl(210,65%,65%)" }}>
              <div className="text-5xl">👋</div>
              <div className="font-display font-black text-2xl">Привет, {player.name}!</div>
              <div className="text-sm text-white/80">
                Ты вошёл через Telegram. Тебе начислено <span className="font-bold text-yellow-300">1 000 ₩</span> на старт.
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full py-3 rounded-xl bg-green-600 border border-green-400/50 font-bold text-sm active:scale-95 transition-transform"
              >
                Играть!
              </button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            {player?.avatar_url ? (
              <img
                src={player.avatar_url}
                alt={displayName}
                className="w-12 h-12 rounded-full border-2 border-white/40 object-cover shrink-0 shadow-lg"
              />
            ) : (
              <div
                onClick={!player ? loginViaTelegram : undefined}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9b8ecf] to-[#7060b0] border-2 border-white/40 flex items-center justify-center font-display font-bold text-xl text-white shadow-lg shrink-0 cursor-pointer"
              >
                {avatarLetter}
              </div>
            )}
            <div>
              <div className="font-display font-black text-[15px] text-white drop-shadow-md leading-tight">
                {displayName}
              </div>
              {player && (
                <button onClick={logout} className="text-[10px] text-white/40 leading-tight hover:text-white/70 transition-colors">
                  Выйти
                </button>
              )}
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
            <div className="flex flex-col gap-3 h-full animate-fade-in relative">
              {/* Product block */}
              <div className="app-card-inner p-3 shrink-0">
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
                    disabled={phase !== "idle"}
                    className="flex-1 bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/40 disabled:opacity-50"
                  />
                  <button
                    onClick={calculate}
                    disabled={loading || phase !== "idle"}
                    className="bg-green-600 border border-green-400/60 px-3 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-transform whitespace-nowrap shrink-0 disabled:opacity-60"
                  >
                    {loading ? "..." : "Рассчитать"}
                  </button>
                </div>

                {article.trim() &&
                  !POPULAR_LOTS.find((l) => l.art === article.trim()) &&
                  !activeLot?.isPopular && (
                    <div className="mb-2">
                      <input
                        value={manualPrice}
                        onChange={(e) => setManualPrice(e.target.value)}
                        placeholder="Стоимость товара на WB (₽)"
                        type="number"
                        disabled={phase !== "idle"}
                        className="w-full bg-white/10 rounded-xl px-3 py-2.5 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors placeholder:text-white/40 disabled:opacity-50"
                      />
                    </div>
                  )}

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
                      const url =
                        activeLot?.wbUrl ||
                        (activeLot
                          ? `https://www.wildberries.ru/catalog/${activeLot.art}/detail.aspx`
                          : null);
                      if (url) window.open(url, "_blank");
                    }}
                    disabled={!activeLot}
                    className="bg-[#c2185b] border border-[#e91e63]/60 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-40 active:scale-95 transition-transform whitespace-nowrap shrink-0"
                  >
                    Посмотреть
                  </button>
                </div>

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
              <div className="flex-1 flex items-center justify-center min-h-0 relative">
                <FortuneWheel
                  selected={selected}
                  spinning={phase === "spinning"}
                  rotation={rotation}
                  bonusRotation={bonusRotation}
                  boosterActive={boosterActive}
                  onStart={startSpin}
                  onSelectSector={(n) => {
                    if (phase === "idle") setSelected(n);
                  }}
                  onBooster={addBooster}
                />
              </div>

              {/* Sector hint */}
              {selected !== null && phase === "idle" && (
                <div className="shrink-0 text-center text-xs text-white/60 pb-1">
                  Выбран сектор:{" "}
                  <span className="text-yellow-300 font-bold text-sm">
                    {selected}
                  </span>
                  {boosterActive && (
                    <span className="ml-2 text-green-400 font-bold">
                      + Бустер активен
                    </span>
                  )}
                </div>
              )}

              {/* RESULT OVERLAY */}
              {phase === "result" && (
                <div
                  className="absolute inset-0 z-50 flex items-end justify-center pb-6 px-4"
                  style={{
                    background: "rgba(0,0,0,0.75)",
                    borderRadius: "inherit",
                  }}
                >
                  <div className="w-full max-w-sm app-card-inner p-5 flex flex-col gap-4">
                    {/* Bonus result */}
                    {resultBonus && (
                      <div className="text-center bg-yellow-500/20 border border-yellow-400/40 rounded-xl py-2 px-3">
                        <div className="text-xs text-yellow-300/70 mb-0.5">
                          Бонусный барабан
                        </div>
                        <div className="font-bold text-yellow-300">
                          {resultBonus.type === "wcoin"
                            ? `+${resultBonus.amount} ₩ зачислено!`
                            : `Бустер «${resultBonus.name}» получен!`}
                        </div>
                      </div>
                    )}

                    {/* Main result */}
                    {resultWon ? (
                      <>
                        <div className="text-center">
                          <div className="text-4xl mb-1">🎉</div>
                          <div className="font-display font-black text-2xl text-green-400">
                            Победа!
                          </div>
                          <div className="text-sm text-white/70 mt-1">
                            Выпало{" "}
                            <span className="text-yellow-300 font-bold">
                              {resultSector}
                            </span>{" "}
                            — совпало с вашим выбором
                          </div>
                          <div className="text-sm font-semibold mt-1 truncate">
                            {activeLot?.name}
                          </div>
                        </div>

                        {!resultHandled ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={handleDelivery}
                              className="w-full py-3 rounded-xl bg-green-600 border border-green-400/60 font-bold text-sm active:scale-95 transition-transform"
                            >
                              Оформить доставку на ПВЗ
                            </button>
                            <button
                              onClick={handleCashout}
                              className="w-full py-3 rounded-xl bg-yellow-500/20 border border-yellow-400/50 font-bold text-sm text-yellow-300 active:scale-95 transition-transform"
                            >
                              Получить {activeLot?.price.toLocaleString("ru")} ₩
                              на счёт
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-green-400 text-sm font-bold py-2">
                            ✓ Выбор сделан
                          </div>
                        )}

                        <button
                          onClick={resetGame}
                          className="w-full py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-white/70 active:scale-95 transition-transform"
                        >
                          Новый розыгрыш
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <div className="text-4xl mb-1">😔</div>
                          <div className="font-display font-black text-2xl text-red-400">
                            Не повезло
                          </div>
                          <div className="text-sm text-white/70 mt-1">
                            Выпало{" "}
                            <span className="text-yellow-300 font-bold">
                              {resultSector}
                            </span>
                            , вы выбирали{" "}
                            <span className="text-white font-bold">
                              {selected}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={resetGame}
                          className="w-full py-3 rounded-xl bg-[#c2185b] border border-[#e91e63]/60 font-bold text-sm active:scale-95 transition-transform"
                        >
                          Попробовать ещё раз
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== PROFILE ===== */}
          {tab === "profile" && (
            <ProfileScreen
              balance={balance}
              history={history}
              player={player}
              onLoginClick={loginViaTelegram}
              onLogout={logout}
            />
          )}

          {/* ===== SHOP ===== */}
          {tab === "shop" && (
            <ShopScreen
              balance={balance}
              onSelectLot={(lot) => {
                setActiveLot(lot);
                setArticle(lot.art);
                setManualPrice("");
                setPrizeCost(Math.ceil(lot.price / 10));
                setTab("game");
              }}
              onBalanceChange={(delta) => setBalance((b) => b + delta)}
            />
          )}
        </div>

        {/* BOTTOM NAVIGATION */}
        <nav className="px-3 pb-3 shrink-0">
          <div className="flex gap-2">
            {[
              { id: "profile" as Tab, icon: "User", label: "Профиль" },
              { id: "game" as Tab, icon: "LoaderPinwheel", label: "Игра" },
              { id: "shop" as Tab, icon: "Store", label: "Магазин" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl gap-1 transition-all active:scale-95 ${tab === t.id ? "nav-tab-active" : "nav-tab-inactive"}`}
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