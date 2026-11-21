import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Plus, RotateCcw, Edit3, Trash2, Check, Sparkles, History, Zap } from 'lucide-react';

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'running', completed: false, isEdited: false },
    { id: 2, text: 'going', completed: true, isEdited: false },
    { id: 3, text: 'swim', completed: true, isEdited: false },
    { id: 4, text: 'read', completed: false, isEdited: false },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineText, setInlineText] = useState('');

  // 3D Card Tilt & Spotlight uchun ref va state
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, spotX: 50, spotY: 50 });

  // ==========================================================
  // INTERAKTIV JANGARI NEON CANVAS FON EFFEKTI
  // ==========================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: null,
      y: null,
      radius: 190,
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Harakatlanganda kursor izidan mayda uchqunlar chiqarish
      for (let i = 0; i < 2; i++) {
        trailParticles.push(new TrailParticle(e.clientX, e.clientY));
      }
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    // Ekran bosilganda zarba to'lqini (Shockwave + Portlash)
    const handleClick = (e) => {
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: 260,
        alpha: 1,
      });

      for (let i = 0; i < 22; i++) {
        trailParticles.push(new TrailParticle(e.clientX, e.clientY, true));
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    const darkColors = ['#6366f1', '#ec4899', '#06b6d4', '#a855f7', '#f43f5e'];
    const lightColors = ['#2563eb', '#f59e0b', '#0284c7', '#7c3aed', '#e11d48'];
    const palette = darkMode ? darkColors : lightColors;

    // Asosiy tarmoqlanuvchi zarrachalar
    class NodeParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.4;
        this.vy = (Math.random() - 0.5) * 1.4;
        this.size = Math.random() * 2.5 + 1.2;
        this.color = palette[Math.floor(Math.random() * palette.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mishka yaqinlashganda magnit tortishish va itarilish balansi
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 35) {
            this.x += (dx / dist) * 1.6;
            this.y += (dy / dist) * 1.6;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Kursor izidan uchadigan uchqunlar
    class TrailParticle {
      constructor(x, y, isExplosion = false) {
        this.x = x;
        this.y = y;
        const speed = isExplosion ? Math.random() * 7 + 2 : Math.random() * 2.5 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = isExplosion ? Math.random() * 3.5 + 1.5 : Math.random() * 2.5 + 1;
        this.alpha = 1;
        this.decay = isExplosion ? 0.025 : 0.035;
        this.color = palette[Math.floor(Math.random() * palette.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.alpha -= this.decay;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const nodeCount = Math.min(95, Math.floor((width * height) / 14000));
    const nodes = Array.from({ length: nodeCount }, () => new NodeParticle());
    let trailParticles = [];
    let shockwaves = [];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Kursor atrofida katta neon aura nuri
      if (mouse.x !== null && mouse.y !== null) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          240
        );
        if (darkMode) {
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
          gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.10)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(37, 99, 235, 0.22)');
          gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Zarrachalar va ular orasidagi lazer chiziqlar
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
        nodes[i].draw();

        // Zarrachalar o'zaro bog'lanishi
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 125) {
            ctx.beginPath();
            ctx.strokeStyle = darkMode
              ? `rgba(129, 140, 248, ${(1 - dist / 125) * 0.35})`
              : `rgba(37, 99, 235, ${(1 - dist / 125) * 0.28})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Kursor bilan zarracha orasidagi kuchli neon lazer to'ri
        if (mouse.x !== null && mouse.y !== null) {
          const dx = nodes[i].x - mouse.x;
          const dy = nodes[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            ctx.beginPath();
            ctx.strokeStyle = darkMode
              ? `rgba(236, 72, 153, ${(1 - dist / mouse.radius) * 0.85})`
              : `rgba(225, 29, 72, ${(1 - dist / mouse.radius) * 0.65})`;
            ctx.lineWidth = 1.6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // 3. Kursor uchqunlari
      trailParticles = trailParticles.filter((p) => p.alpha > 0);
      for (const p of trailParticles) {
        p.update();
        p.draw();
      }

      // 4. Klik bo'lgandagi zarba to'lqinlari (Shockwaves)
      shockwaves = shockwaves.filter((s) => s.alpha > 0.02);
      for (const s of shockwaves) {
        s.radius += 9;
        s.alpha *= 0.92;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.strokeStyle = darkMode
          ? `rgba(6, 182, 212, ${s.alpha})`
          : `rgba(37, 99, 235, ${s.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, [darkMode]);

  // Karta ustida mishka yurganda 3D Tilt va yorug'lik effekti
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    const spotX = (x / rect.width) * 100;
    const spotY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, spotX, spotY });
  };

  const handleCardMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, spotX: 50, spotY: 50 });
  };

  // ==========================================================
  // TODO FUNKSIYALARI
  // ==========================================================
  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (editingId !== null) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingId
            ? { ...todo, text: trimmed, isEdited: true }
            : todo
        )
      );
      setEditingId(null);
    } else {
      setTodos([
        { id: Date.now(), text: trimmed, completed: false, isEdited: false },
        ...todos,
      ]);
    }
    setInputValue('');
  };

  const handleReset = () => {
    setInputValue('');
    setEditingId(null);
    setInlineEditId(null);
    setTodos([]);
  };

  const handleDelete = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setInputValue('');
    }
  };

  const handleStartTopEdit = (todo) => {
    setEditingId(todo.id);
    setInputValue(todo.text);
    setInlineEditId(null);
  };

  // 1x check, 3x uncheck
  const handleCheckboxClick = (e, todo) => {
    if (!todo.completed) {
      setTodos(
        todos.map((item) =>
          item.id === todo.id ? { ...item, completed: true } : item
        )
      );
    } else if (e.detail === 3) {
      setTodos(
        todos.map((item) =>
          item.id === todo.id ? { ...item, completed: false } : item
        )
      );
    }
  };

  // 2x bosganda joyida edit
  const handleDoubleClick = (todo) => {
    setInlineEditId(todo.id);
    setInlineText(todo.text);
    setEditingId(null);
  };

  const handleInlineKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      const trimmed = inlineText.trim();
      if (trimmed) {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, text: trimmed, isEdited: true } : todo
          )
        );
      }
      setInlineEditId(null);
    } else if (e.key === 'Escape') {
      setInlineEditId(null);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    if (filter === 'edited') return todo.isEdited;
    return true;
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-700 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden select-none ${darkMode ? 'bg-[#050714] text-white' : 'bg-slate-100 text-slate-900'
        }`}
    >
      {/* ORQA FON WALLPAPER */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105 pointer-events-none"
        style={{
          backgroundImage: darkMode
            ? `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=2071&q=80')`
            : `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2070&q=80')`,
          opacity: darkMode ? 0.25 : 0.35,
        }}
      />

      {/* INTERAKTIV JANGARI NEON CANVAS */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* ASOSIY 3D NEON OYNA */}
      <div
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        style={{
          transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className={`relative z-10 w-full max-w-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-2xl border shadow-2xl overflow-hidden ${darkMode
            ? 'bg-slate-900/65 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.22)]'
            : 'bg-white/75 border-white shadow-[0_20px_50px_rgba(37,99,235,0.18)]'
          }`}
      >
        {/* Karta ichida mishka ortidan yuradigan Spotlight nuri */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: darkMode
              ? `radial-gradient(450px circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(99, 102, 241, 0.18), transparent 70%)`
              : `radial-gradient(450px circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(59, 130, 246, 0.15), transparent 70%)`,
          }}
        />

        {/* HEADER */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2.5">
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-500 bg-clip-text text-transparent">
                Todo List
              </span>
              <Zap className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
            </h1>
            <p
              className={`text-xs sm:text-sm mt-1 flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>2x bosib edit • 3x bosib uncheck • Ekranga bosib zarba bering</span>
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Tungi / Kunduzgi rejim"
            className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${darkMode
                ? 'bg-slate-800/90 border-indigo-500/40 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                : 'bg-white border-slate-200 text-indigo-600 shadow-md'
              }`}
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        {/* INPUT VA TUGMALAR */}
        <form onSubmit={handleAddOrUpdate} className="relative z-10 flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              editingId !== null
                ? 'Vazifani yangilang...'
                : 'Yangi vazifa yozing (todo...)'
            }
            className={`flex-1 px-4 py-3.5 rounded-xl border outline-none transition-all duration-300 text-base ${darkMode
                ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                : 'bg-white/95 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              } ${editingId !== null ? 'ring-2 ring-amber-500 border-amber-500' : ''}`}
          />

          <div className="flex gap-2.5">
            <button
              type="submit"
              className={`flex-1 sm:flex-none px-5 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-lg ${editingId !== null
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-indigo-500/30'
                }`}
            >
              {editingId !== null ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Edit todo</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add todo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-[0_0_20px_rgba(245,158,11,0.45)] shadow-lg flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </form>

        {/* FILTERLAR */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: todos.length },
            { key: 'active', label: 'Active', count: todos.filter((t) => !t.completed).length },
            { key: 'completed', label: 'Completed', count: todos.filter((t) => t.completed).length },
            { key: 'edited', label: 'Edited', count: todos.filter((t) => t.isEdited).length },
          ].map((btn) => {
            const isActive = filter === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-[0_0_18px_rgba(79,70,229,0.5)] scale-105'
                    : darkMode
                      ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/90 border border-slate-700/60'
                      : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300/80'
                  }`}
              >
                <span>{btn.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md ${isActive
                      ? 'bg-white/20 text-white'
                      : darkMode
                        ? 'bg-slate-900 text-slate-300'
                        : 'bg-white text-slate-600'
                    }`}
                >
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TODO RO'YXATI */}
        <div className="relative z-10 space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredTodos.length === 0 ? (
            <div
              className={`text-center py-12 rounded-2xl border border-dashed ${darkMode
                  ? 'border-slate-700 text-slate-400'
                  : 'border-slate-300 text-slate-500'
                }`}
            >
              Bu bo'limda vazifalar yo'q ✨
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 ${darkMode
                    ? 'bg-slate-800/60 border-slate-700/70 hover:border-cyan-400/60 hover:bg-slate-800/90 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                    : 'bg-white/95 border-slate-200 hover:border-indigo-400 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => handleCheckboxClick(e, todo)}
                    title={
                      todo.completed
                        ? 'Belgilangan! Ochish uchun 3 marta tez bosing'
                        : 'Belgilash uchun bosing'
                    }
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-200 cursor-pointer shrink-0 ${todo.completed
                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.75)]'
                        : darkMode
                          ? 'border-slate-500 hover:border-cyan-400 bg-slate-900/60'
                          : 'border-slate-400 hover:border-blue-500 bg-white'
                      }`}
                  >
                    {todo.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {inlineEditId === todo.id ? (
                    <input
                      type="text"
                      autoFocus
                      value={inlineText}
                      onChange={(e) => setInlineText(e.target.value)}
                      onKeyDown={(e) => handleInlineKeyDown(e, todo.id)}
                      onBlur={() => setInlineEditId(null)}
                      className={`w-full px-3 py-1 rounded-lg border outline-none text-base font-medium ${darkMode
                          ? 'bg-slate-950 border-cyan-400 text-white'
                          : 'bg-indigo-50 border-indigo-500 text-slate-900'
                        }`}
                    />
                  ) : (
                    <div
                      onDoubleClick={() => handleDoubleClick(todo)}
                      title="Joyida tahrirlash uchun 2 marta bosing"
                      className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                    >
                      <h4
                        className={`text-base sm:text-lg font-bold truncate transition-all duration-300 ${todo.completed
                            ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.55)]'
                            : darkMode
                              ? 'text-slate-100'
                              : 'text-slate-800'
                          }`}
                      >
                        {todo.text}
                      </h4>

                      {todo.isEdited && (
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1 ${darkMode
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-amber-100 text-amber-700 border border-amber-300'
                            }`}
                        >
                          <History className="w-2.5 h-2.5" />
                          edited
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartTopEdit(todo)}
                    className="px-3.5 py-1.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(todo.id)}
                    className="px-3.5 py-1.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}