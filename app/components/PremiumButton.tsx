"use client";

export default function PremiumButton() {
  const handleClick = async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
    });

    const data = await res.json();

    window.location.href = data.url;
  };

  return (
    <button onClick={handleClick}>
      プレミアム（月額680円）を始める
    </button>
  );
}