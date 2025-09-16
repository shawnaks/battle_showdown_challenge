"use client";
import Image from "next/image";
import Jack from "../../public/jack.png";
import Snowman from "../../public/snowman.png";
import React, { useState } from "react";

export default function Home() {
  const [snowmanHealth, setSnowmanHealth] = useState(100);
  const [jackHealth, setJackHealth] = useState(100);
  const [turn, setTurn] = useState<"jack" | "snowman">("jack");
  const [auraShieldActive, setAuraShieldActive] = useState(false);
  const [doubleRizzUsed, setDoubleRizzUsed] = useState(false);

  const [winner, setWinner] = useState<"jack" | "snowman" | null>(null);
  const [loser, setLoser] = useState<"jack" | "snowman" | null>(null);
  const [showWinScreen, setShowWinScreen] = useState(false);

  const [jackDamaged, setJackDamaged] = useState(false);
  const [snowmanDamaged, setSnowmanDamaged] = useState(false);

  const JACK_ATTACK = 15;
  const MELT_PERCENT = 0.3;
  const SNOWMAN_ATTACK = 12;
  const SHIELD_REDUCTION = 0.5;

  function checkWinner(newJackHealth: number, newSnowmanHealth: number) {
    if (newJackHealth <= 0) {
      setLoser("jack");
      setWinner("snowman");
      setTimeout(() => setShowWinScreen(true), 1000);
    } else if (newSnowmanHealth <= 0) {
      setLoser("snowman");
      setWinner("jack");
      setTimeout(() => setShowWinScreen(true), 1000);
    }
  }

  function triggerDamage(target: "jack" | "snowman") {
    if (target === "jack") {
      setJackDamaged(true);
      setTimeout(() => setJackDamaged(false), 600);
    } else {
      setSnowmanDamaged(true);
      setTimeout(() => setSnowmanDamaged(false), 600);
    }
  }

  function handleAuraShield() {
    if (turn !== "jack") return;
    setAuraShieldActive(true);
    setTurn("snowman");
    setTimeout(() => handleSnowmanAttack(), 800);
  }

  function handleRizz() {
    if (turn !== "jack") return;
    setSnowmanHealth((prev) => {
      const newHealth = Math.max(prev - JACK_ATTACK, 0);
      triggerDamage("snowman");
      checkWinner(jackHealth, newHealth);
      if (newHealth > 0) {
        setTurn("snowman");
        setTimeout(() => handleSnowmanAttack(), 800);
      }
      return newHealth;
    });
  }

  function handleMelt() {
    if (turn !== "jack") return;
    setSnowmanHealth((prev) => {
      const newHealth = Math.max(Math.round(prev * (1 - MELT_PERCENT)), 0);
      triggerDamage("snowman");
      checkWinner(jackHealth, newHealth);
      if (newHealth > 0) {
        setTurn("snowman");
        setTimeout(() => handleSnowmanAttack(), 800);
      }
      return newHealth;
    });
  }

  function handleDoubleRizz() {
    if (turn !== "jack" || doubleRizzUsed) return;

    setDoubleRizzUsed(true);

    setSnowmanHealth((prev) => {
      const newHealth = Math.max(prev - JACK_ATTACK * 2, 0);
      triggerDamage("snowman");
      checkWinner(jackHealth, newHealth);
      if (newHealth > 0) {
        setTurn("snowman");
        setTimeout(() => handleSnowmanAttack(), 800);
      }
      return newHealth;
    });
  }

  function handleSnowmanAttack() {
    setJackHealth((prev) => {
      let newHealth;
      if (auraShieldActive) {
        setAuraShieldActive(false);
        newHealth = Math.max(
          prev - Math.round(SNOWMAN_ATTACK * SHIELD_REDUCTION),
          0
        );
      } else {
        newHealth = Math.max(prev - SNOWMAN_ATTACK, 0);
      }
      triggerDamage("jack");
      checkWinner(newHealth, snowmanHealth);
      return newHealth;
    });
    setTurn("jack");
  }

  function resetGame() {
    setJackHealth(100);
    setSnowmanHealth(100);
    setTurn("jack");
    setAuraShieldActive(false);
    setDoubleRizzUsed(false);
    setWinner(null);
    setLoser(null);
    setShowWinScreen(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-100 relative">
      <h1 className="text-4xl font-bold text-center mt-8 mb-4">Battle Simulator</h1>

      {/* WIN SCREEN */}
      {showWinScreen && winner && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50 text-center p-6">
          <h2 className="text-5xl font-bold text-white mb-6">
            {winner === "jack" ? "Jack" : "Snowman"} won!!!
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4">Final Score</h3>
            <p className="text-lg font-semibold">Jack: {jackHealth} HP</p>
            <p className="text-lg font-semibold">Snowman: {snowmanHealth} HP</p>
          </div>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-green-400 text-white font-bold rounded-xl hover:bg-green-500 shadow-lg"
          >
            Restart Game
          </button>
        </div>
      )}

      <div className="flex flex-row flex-1 items-stretch relative">
        {/* Jack Side */}
        <div className="w-1/2 flex flex-col items-center justify-start border-r-2 border-gray-300 bg-white p-8 h-full">
          <span className="text-xl font-semibold mb-2">Jack</span>
          <div className="relative flex flex-col items-center">
            <div
              className={`relative p-2 rounded-full transition-transform duration-700 ${
                auraShieldActive ? "ring-4 ring-blue-300 animate-pulse" : ""
              } ${loser === "jack" ? "rotate-90" : ""}`}
            >
              <Image src={Jack} alt="Jack" width={200} height={100} />
              {jackDamaged && (
                <div className="absolute -right-10 top-1/3 animate-bounce text-red-600 text-4xl font-bold">
                  ↓↓
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center w-full mt-2">
            <div className="w-3/4 h-6 bg-gray-200 rounded mr-2">
              <div
                className="h-6 bg-green-500 rounded"
                style={{ width: `${jackHealth}%`, transition: "width 0.3s" }}
              />
            </div>
            <span className="font-bold text-lg">{jackHealth} HP</span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-start mt-6 space-y-4">
            <div className="flex items-center">
              <button
                className="bg-green-200 px-4 py-2 rounded border border-green-300 hover:bg-green-100 disabled:opacity-50"
                onClick={handleRizz}
                disabled={turn !== "jack" || jackHealth === 0 || snowmanHealth === 0}
              >
                Rizz
              </button>
              <span className="ml-3 font-bold text-red-500">-{JACK_ATTACK}</span>
            </div>

            <div className="flex items-center">
              <button
                className="bg-green-200 px-4 py-2 rounded border border-green-300 hover:bg-green-100 disabled:opacity-50"
                onClick={handleDoubleRizz}
                disabled={turn !== "jack" || jackHealth === 0 || snowmanHealth === 0 || doubleRizzUsed}
              >
                Double Rizz
              </button>
              <span className="ml-3 font-bold text-red-500">
                -{JACK_ATTACK * 2} (1 use per game)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="bg-green-200 px-4 py-2 rounded border border-green-300 hover:bg-green-100 disabled:opacity-50"
                onClick={handleMelt}
                disabled={turn !== "jack" || jackHealth === 0 || snowmanHealth === 0}
              >
                Melt
              </button>
              <span className="ml-3 font-bold text-red-500">-30%</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="bg-green-200 px-4 py-2 rounded border border-green-300 hover:bg-green-100 disabled:opacity-50"
                onClick={handleAuraShield}
                disabled={turn !== "jack" || jackHealth === 0 || snowmanHealth === 0 || auraShieldActive}
              >
                Aura Shield
              </button>
              <span className="ml-3 font-bold text-blue-500">50% Shield</span>
            </div>
          </div>

          {auraShieldActive && (
            <div className="mt-4 text-green-600 font-semibold">Aura Shield active!</div>
          )}
          <div className="mt-4 text-sm text-gray-500">
            {turn === "jack" ? "Jack's turn" : "Snowman's turn..."}
          </div>
        </div>

        {/* VS Symbol */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <span className="bg-red-200 px-4 py-2 rounded-full text-2xl font-bold shadow-lg border-2 border-red-400">
            VS
          </span>
        </div>

        {/* Snowman Side */}
        <div className="w-1/2 flex flex-col items-center justify-start bg-white p-8 h-full">
          <span className="text-xl font-semibold mb-2">Snowman</span>
          <div className="relative flex flex-col items-center">
            <div className={`relative transition-transform duration-700 ${loser === "snowman" ? "rotate-90" : ""}`}>
              <Image src={Snowman} alt="Snowman" width={200} height={100} />
              {snowmanDamaged && (
                <div className="absolute -left-10 top-1/3 animate-bounce text-red-600 text-4xl font-bold">
                  ↓↓
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center w-full mt-2">
            <div className="w-3/4 h-6 bg-gray-200 rounded mr-2">
              <div
                className="h-6 bg-blue-500 rounded"
                style={{ width: `${snowmanHealth}%`, transition: "width 0.3s" }}
              />
            </div>
            <span className="font-bold text-lg">{snowmanHealth} HP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
