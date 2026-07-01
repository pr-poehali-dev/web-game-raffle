import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TELEGRAM_AUTH_URL = "https://functions.poehali.dev/78b72379-2a23-4fec-a35b-b31afad8cdc4";

const TelegramCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setErrorMsg("Токен не найден");
      setStatus("error");
      return;
    }

    fetch(`${TELEGRAM_AUTH_URL}?action=callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("tg_user", JSON.stringify(data.user));
          navigate("/", { replace: true });
        } else {
          setErrorMsg(data.error || "Ошибка авторизации");
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg("Ошибка соединения");
        setStatus("error");
      });
  }, [navigate]);

  return (
    <div className="min-h-screen app-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white text-center px-6">
        {status === "loading" ? (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            <div className="font-bold text-lg">Входим через Telegram...</div>
          </>
        ) : (
          <>
            <div className="text-5xl">❌</div>
            <div className="font-bold text-lg">{errorMsg}</div>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="mt-2 px-6 py-2 rounded-xl bg-white/20 border border-white/30 text-sm"
            >
              На главную
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TelegramCallback;
