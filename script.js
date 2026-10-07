/**
 * ==========================================================================
 * MUNDO FÚTBOL - SCRIPT INTERACTIVO Y MOTOR TÁCTICO (2026 EDITION)
 * Características:
 * 1. Pizarra táctica con selector de formaciones (4-3-3, 4-4-2, 3-5-2)
 * 2. Motor de audio con Web Audio API (silbato, patada de balón, victoria)
 * 3. Rotador de palabras dinámicas en Hero
 * 4. Contador animado de estadísticas (Count-Up)
 * 5. Mini Quiz con barra de progreso y generador de confeti en Canvas
 * 6. Sincronización de Barra Móvil Inferior (Mobile Dock) y Menú Lateral
 * 7. Filtros instantáneos de cartas de jugadores
 * 8. Respaldo inteligente de imágenes
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de módulos
  initAudioEngine();
  initHeroDynamicWords();
  initCountUpStats();
  initMobileNavigation();
  initScrollSpyAndDocks();
  initSmoothScroll();
  initTacticalPitchBoard();
  initPlayerFilters();
  initInteractiveQuiz();
  initImageFallbacks();
});

/* ==========================================================================
   1. MOTOR DE AUDIO (Web Audio API - Cero Dependencias Externas)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioEngine() {
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');

  if (!soundToggle) return;

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle('muted', !soundEnabled);
    soundIcon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';

    if (soundEnabled) {
      playSound('kick');
    }
  });
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'kick') {
    // Sonido sordo y potente de golpe a balón
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } else if (type === 'whistle') {
    // Doble tono agudo de silbato arbitral
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(2600, now);
    osc2.frequency.setValueAtTime(2850, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.19);
    osc2.stop(now + 0.19);
  } else if (type === 'celebration') {
    // Acorde alegre de campana / triunfo futbolero
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do agudo
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + (idx * 0.08);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.52);
    });
  }
}

/* ==========================================================================
   2. ROTADOR DE PALABRAS DINÁMICAS EN HERO
   ========================================================================== */
function initHeroDynamicWords() {
  const dynamicWord = document.getElementById('dynamicWord');
  if (!dynamicWord) return;

  const words = ['PASIÓN', 'MAGIA', 'TÁCTICA', 'HISTORIA', 'GLORIA', 'EMOCIÓN'];
  let wordIndex = 0;

  setInterval(() => {
    dynamicWord.style.opacity = '0';
    dynamicWord.style.transform = 'translateY(-12px)';

    setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      dynamicWord.textContent = words[wordIndex];
      dynamicWord.style.opacity = '1';
      dynamicWord.style.transform = 'translateY(0)';
    }, 300);
  }, 2800);
}

/* ==========================================================================
   3. CONTADOR ANIMADO DE ESTADÍSTICAS (Count-Up)
   ========================================================================== */
function initCountUpStats() {
  const counters = document.querySelectorAll('.count-up');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1600;
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target >= 1000 ? `+${target.toLocaleString()}M` : target;
              clearInterval(timer);
            } else {
              counter.textContent = target >= 1000 ? `+${Math.floor(current).toLocaleString()}M` : Math.floor(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) observer.observe(statsSection);
}

/* ==========================================================================
   4. NAVEGACIÓN MÓVIL Y OVERLAY
   ========================================================================== */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobileToggle');
  const toggleIcon = document.getElementById('toggleIcon');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');
  const allLinks = document.querySelectorAll('.nav-link, .nav-cta-btn');

  if (!toggleBtn || !navLinks) return;

  function toggleMenu(open) {
    navLinks.classList.toggle('open', open);
    if (navOverlay) navOverlay.classList.toggle('active', open);
    toggleIcon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.contains('open');
    toggleMenu(!isOpen);
    playSound('kick');
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', () => toggleMenu(false));
  }

  allLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

/* ==========================================================================
   5. SCROLLSPY Y DOCK INFERIOR PARA CELULAR
   ========================================================================== */
function initScrollSpyAndDocks() {
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-links a');
  const dockItems = document.querySelectorAll('.dock-item');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Clase compacta de navbar al bajar
    if (scrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Botón volver arriba
    if (backToTop) {
      if (scrollY > 450) {
        backToTop.style.opacity = '1';
        backToTop.style.pointerEvents = 'auto';
        backToTop.style.transform = 'translateY(0)';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.pointerEvents = 'none';
        backToTop.style.transform = 'translateY(12px)';
      }
    }

    // Identificar sección visible
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    // Actualizar enlaces desktop
    desktopNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentId}`);
    });

    // Actualizar dock móvil
    dockItems.forEach(item => {
      const href = item.getAttribute('href');
      item.classList.toggle('active', href === `#${currentId}`);
    });
  });
}

/* ==========================================================================
   6. DESPLAZAMIENTO SUAVE EXACTO (OFFSET SCROLL)
   ========================================================================== */
function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        playSound('kick');

        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 70;
        const targetPos = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ==========================================================================
   7. PIZARRA TÁCTICA Y SELECTOR DE FORMACIONES (4-3-3, 4-4-2, 3-5-2)
   ========================================================================== */
const formationsCoordinates = {
  '433': {
    gk:  { bottom: '8%',  left: '50%' },
    cb1: { bottom: '24%', left: '33%' },
    cb2: { bottom: '24%', left: '67%' },
    lb:  { bottom: '33%', left: '14%' },
    rb:  { bottom: '33%', left: '86%' },
    mcd: { bottom: '46%', left: '50%' },
    mc1: { bottom: '58%', left: '28%' },
    mc2: { bottom: '58%', left: '72%' },
    lw:  { bottom: '74%', left: '16%' },
    cf:  { bottom: '84%', left: '50%' },
    rw:  { bottom: '74%', left: '84%' }
  },
  '442': {
    gk:  { bottom: '8%',  left: '50%' },
    cb1: { bottom: '24%', left: '33%' },
    cb2: { bottom: '24%', left: '67%' },
    lb:  { bottom: '33%', left: '14%' },
    rb:  { bottom: '33%', left: '86%' },
    mcd: { bottom: '48%', left: '35%' },
    mc1: { bottom: '48%', left: '65%' },
    mc2: { bottom: '58%', left: '15%' }, // Volante Izquierdo
    lw:  { bottom: '58%', left: '85%' }, // Volante Derecho
    cf:  { bottom: '82%', left: '38%' }, // Delantero 1
    rw:  { bottom: '82%', left: '62%' }  // Delantero 2
  },
  '352': {
    gk:  { bottom: '8%',  left: '50%' },
    cb1: { bottom: '23%', left: '26%' }, // Stopper Izquierdo
    cb2: { bottom: '21%', left: '50%' }, // Líbero Central
    lb:  { bottom: '23%', left: '74%' }, // Stopper Derecho
    rb:  { bottom: '46%', left: '12%' }, // Carrilero Izquierdo
    mcd: { bottom: '44%', left: '50%' }, // Pivote
    mc1: { bottom: '46%', left: '88%' }, // Carrilero Derecho
    mc2: { bottom: '60%', left: '34%' }, // Interior 1
    lw:  { bottom: '60%', left: '66%' }, // Interior 2
    cf:  { bottom: '84%', left: '38%' }, // Punta 1
    rw:  { bottom: '84%', left: '62%' }  // Punta 2
  }
};

const positionsData = {
  gk: {
    category: 'Guardameta',
    catKey: 'gk',
    dorsal: '#1',
    title: 'Portero / Guardameta',
    summary: 'El guardián absoluto de la portería y primer constructor de juego. Es el único futbolista con autorización para usar las manos en su área penal y posee la visión panorámica más completa del terreno.',
    inPossession: 'Inicia la construcción con pases seguros a centrales y rompe líneas de presión con pases largos medidos a bandas.',
    outPossession: 'Achica mano a mano, domina el juego aéreo en córners, ordena a la defensa y cubre la espalda de la zaga como líbero.',
    skills: ['Reflejos felinos', 'Juego con ambos pies', 'Dominio del área chica', 'Comando de voz'],
    legends: 'Lev Yashin, Iker Casillas, Gianluigi Buffon, Manuel Neuer, Thibaut Courtois, Emiliano Martínez.',
    tactics: 94,
    physical: 98
  },
  cb1: {
    category: 'Línea Defensiva',
    catKey: 'def',
    dorsal: '#4',
    title: 'Defensa Central',
    summary: 'El pilar que blinda el área de peligro. Encargado de anticipar delanteros, ganar duelos por arriba y mantener la coordinación milimétrica del fuera de juego.',
    inPossession: 'Pase filtrado hacia mediocampistas y cambios de frente cruzados hacia los extremos desmarcados.',
    outPossession: 'Intercepción de pases entre líneas, barridas limpias en último recurso y despejes aéreos contundentes.',
    skills: ['Cabezazo defensivo', 'Entrada a ras de césped', 'Pase de salida', 'Marcaje férreo'],
    legends: 'Paolo Maldini, Sergio Ramos, Franz Beckenbauer, Carles Puyol, Virgil van Dijk, Franco Baresi.',
    tactics: 90,
    physical: 95
  },
  cb2: {
    category: 'Línea Defensiva',
    catKey: 'def',
    dorsal: '#2',
    title: 'Defensa Central',
    summary: 'Compañero de saga en el corazón del área. Debe mantener sincronía exacta para cortar transiciones rápidas y proteger la espalda del lateral que se proyecta al ataque.',
    inPossession: 'Distribución en corto y salida limpia bajo presión alta del rival.',
    outPossession: 'Fuerza en duelos individuales, coberturas a banda y bloqueo de remates frontales a portería.',
    skills: ['Fuerza en el choque', 'Lectura de juego', 'Concentración total', 'Liderazgo'],
    legends: 'Fabio Cannavaro, Alessandro Nesta, Gerard Piqué, Ronald Koeman, Rúben Dias.',
    tactics: 88,
    physical: 92
  },
  lb: {
    category: 'Línea Defensiva',
    catKey: 'def',
    dorsal: '#3',
    title: 'Lateral Izquierdo',
    summary: 'Un todoterreno por la banda zurda. Debe frenar a extremos vertiginosos y desdoblarse al ataque para ensanchar la cancha con centros milimétricos al área.',
    inPossession: 'Profundidad en línea de cal, triangulaciones con el extremo y centros con comba peligrosa.',
    outPossession: 'Repliegue inmediato a máxima velocidad, contención del 1 vs 1 y cierre del segundo palo.',
    skills: ['Velocidad de repliegue', 'Resistencia aeróbica', 'Centros venenosos', 'Desborde'],
    legends: 'Roberto Carlos, Marcelo, Paolo Maldini, Ashley Cole, Alphonso Davies.',
    tactics: 86,
    physical: 96
  },
  rb: {
    category: 'Línea Defensiva',
    catKey: 'def',
    dorsal: '#22',
    title: 'Lateral Derecho',
    summary: 'El guardián y atacante del carril diestro. Soporta la presión por banda y se convierte en una opción constante de desahogo y superioridad numérica en ataque.',
    inPossession: 'Llegada sorpresiva a línea de fondo, pase atrás al punto penal y apoyo en salida.',
    outPossession: 'Cierre de espacios interiores y entradas al suelo con timing perfecto.',
    skills: ['Aceleración explosiva', 'Asistencias en carrera', 'Presión alta', 'Agilidad'],
    legends: 'Dani Alves, Cafú, Javier Zanetti, Philipp Lahm, Dani Carvajal, Trent Alexander-Arnold.',
    tactics: 85,
    physical: 95
  },
  mcd: {
    category: 'Mediocampo',
    catKey: 'mid',
    dorsal: '#5',
    title: 'Mediocentro Defensivo (Pivote)',
    summary: 'El cerebro táctico y equilibrio del equipo. Destruye las transiciones enemigas, recupera balones divididos y distribuye con criterio para oxigenar el juego.',
    inPossession: 'Giro rápido bajo acoso rival, cambio de orientación y pase entre líneas a los atacantes.',
    outPossession: 'Cobertura de los espacios vacíos dejados por laterales y faltas tácticas inteligentes.',
    skills: ['Ubicación espacial', 'Recuperación limpia', 'Pase de seguridad', 'Transición rápida'],
    legends: 'Sergio Busquets, Claude Makélélé, Casemiro, Rodri, N\'Golo Kanté, Fernando Redondo.',
    tactics: 98,
    physical: 91
  },
  mc1: {
    category: 'Mediocampo',
    catKey: 'mid',
    dorsal: '#8',
    title: 'Interior Izquierdo (Box-to-Box)',
    summary: 'El pulmón del centro del campo con despliegue de área a área. Asfixia al adversario en defensa y llega de segunda línea para disparar al arco o meter el pase de gol.',
    inPossession: 'Conducción que rompe líneas, remate de media distancia y paredes en tres cuartos de cancha.',
    outPossession: 'Presión tras pérdida instantánea e intercepción en el primer tercio del campo rival.',
    skills: ['Despliegue total', 'Disparo potente', 'Visión periférica', 'Pase filtrado'],
    legends: 'Andrés Iniesta, Xavi Hernández, Luka Modrić, Steven Gerrard, Paul Scholes, Toni Kroos.',
    tactics: 95,
    physical: 90
  },
  mc2: {
    category: 'Mediocampo',
    catKey: 'mid',
    dorsal: '#10',
    title: 'Enganche / Mediapunta (MCO)',
    summary: 'El artista y arquitecto de ocasiones. Se mueve libremente entre los centrales y volantes rivales para dar el último toque mágico que deja al delantero mano a mano.',
    inPossession: 'Regate en espacio reducido, temporización, pase bombeado al hueco y tiro a colocar.',
    outPossession: 'Primer obstáculo en salida rival y bloqueo de líneas de pase centrales.',
    skills: ['Gambeta mágica', 'Último pase', 'Remate quirúrgico', 'Creatividad pura'],
    legends: 'Zinedine Zidane, Diego Maradona, Ronaldinho, Kevin De Bruyne, Kaká, Juan Román Riquelme.',
    tactics: 97,
    physical: 85
  },
  lw: {
    category: 'Delantera',
    catKey: 'att',
    dorsal: '#11',
    title: 'Extremo Izquierdo',
    summary: 'Un puñal vertical por banda zurda. Especialista en encarar mano a mano, desbordar hacia afuera para centrar o recortar hacia adentro con su pierna hábil para disparar.',
    inPossession: 'Aceleración punzante, tiro al segundo poste, diagonales al espacio y remates al primer toque.',
    outPossession: 'Presión al lateral contrario para forzar el error o el despeje largo e impreciso.',
    skills: ['Desequilibrio 1 vs 1', 'Explosividad', 'Definición cruzada', 'Cambio de ritmo'],
    legends: 'Cristiano Ronaldo, Neymar Jr., Ryan Giggs, Eden Hazard, Vinícius Júnior.',
    tactics: 84,
    physical: 96
  },
  cf: {
    category: 'Delantera',
    catKey: 'att',
    dorsal: '#9',
    title: 'Centrodelantero (Delantero Centro)',
    summary: 'El cazagoles letal. Su hábitat natural es el área penal. Posee la frialdad y el instinto asesino para convertir medio metro de ventaja en gol de derecha, zurda o cabeza.',
    inPossession: 'Remate de primera intención, juego de espaldas para descargar a compañeros y desmarques de ruptura.',
    outPossession: 'Tapar la salida del central más peligroso del rival y presionar al arquero en balones cedidos.',
    skills: ['Definición letal', 'Instinto goleador', 'Juego de espaldas', 'Potencia física'],
    legends: 'Ronaldo Nazário, Erling Haaland, Robert Lewandowski, Karim Benzema, Marco van Basten, Luis Suárez.',
    tactics: 89,
    physical: 94
  },
  rw: {
    category: 'Delantera',
    catKey: 'att',
    dorsal: '#7',
    title: 'Extremo Derecho',
    summary: 'Velocidad supersónica, fintas y amenaza constante por el sector diestro. Descompone a la defensa adversaria mediante combinaciones rápidas y remates letales.',
    inPossession: 'Diagonal hacia portería, centros tensos rasantes y paredes de primera intención.',
    outPossession: 'Tapona el carril del lateral zurdo adversario y repliega en bloque medio.',
    skills: ['Conducción en velocidad', 'Asistencias letales', 'Finta en seco', 'Tiro con comba'],
    legends: 'Lionel Messi, Mohamed Salah, Arjen Robben, David Beckham, Lamine Yamal, Garrincha.',
    tactics: 92,
    physical: 95
  }
};

function initTacticalPitchBoard() {
  const pins = document.querySelectorAll('.pitch-pin');
  const catBtns = document.querySelectorAll('.pos-btn');
  const formationBtns = document.querySelectorAll('.formation-btn');

  // Elementos de la ficha táctica
  const posCategory = document.getElementById('posCategory');
  const posDorsal = document.getElementById('posDorsal');
  const posTitle = document.getElementById('posTitle');
  const posSummary = document.getElementById('posSummary');
  const posInPossession = document.getElementById('posInPossession');
  const posOutPossession = document.getElementById('posOutPossession');
  const posSkills = document.getElementById('posSkills');
  const posLegends = document.getElementById('posLegends');
  const meterTactics = document.getElementById('meterTactics');
  const meterPhysical = document.getElementById('meterPhysical');
  const valTactics = document.getElementById('valTactics');
  const valPhysical = document.getElementById('valPhysical');
  const posDetails = document.getElementById('posDetails');

  // 1. Manejo de Formaciones
  formationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playSound('whistle');

      const formationKey = btn.getAttribute('data-formation');
      applyFormation(formationKey);
    });
  });

  function applyFormation(key) {
    const coords = formationsCoordinates[key];
    if (!coords) return;

    for (const [posId, posStyle] of Object.entries(coords)) {
      const pinElement = document.getElementById(`pin-${posId}`);
      if (pinElement) {
        pinElement.style.bottom = posStyle.bottom;
        pinElement.style.left = posStyle.left;
      }
    }
  }

  // 2. Actualización de Ficha de Posición
  function updatePositionView(key) {
    const data = positionsData[key];
    if (!data) return;

    playSound('kick');

    // Resaltar pin en el césped
    pins.forEach(p => p.classList.remove('active'));
    const currentPin = document.querySelector(`.pitch-pin[data-pos="${key}"]`);
    if (currentPin) currentPin.classList.add('active');

    // Sincronizar botones de categoría rápida
    catBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-pos-cat') === data.catKey);
    });

    // Animación suave de transición
    posDetails.style.opacity = '0.3';
    posDetails.style.transform = 'translateY(6px)';

    setTimeout(() => {
      posCategory.textContent = data.category;
      posDorsal.textContent = data.dorsal;
      posTitle.textContent = data.title;
      posSummary.textContent = data.summary;
      if (posInPossession) posInPossession.textContent = data.inPossession;
      if (posOutPossession) posOutPossession.textContent = data.outPossession;
      posLegends.textContent = data.legends;

      // Lista de habilidades
      posSkills.innerHTML = '';
      data.skills.forEach(skill => {
        const span = document.createElement('span');
        span.textContent = skill;
        posSkills.appendChild(span);
      });

      // Medidores porcentuales
      meterTactics.style.width = `${data.tactics}%`;
      meterPhysical.style.width = `${data.physical}%`;
      if (valTactics) valTactics.textContent = `${data.tactics}%`;
      if (valPhysical) valPhysical.textContent = `${data.physical}%`;

      posDetails.style.opacity = '1';
      posDetails.style.transform = 'translateY(0)';
      posDetails.style.transition = 'all 0.25s ease';
    }, 100);
  }

  // Clic en pins de la cancha
  pins.forEach(pin => {
    pin.addEventListener('click', () => {
      const posKey = pin.getAttribute('data-pos');
      updatePositionView(posKey);
    });
  });

  // Clic en botones rápidos de categoría
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-pos-cat');
      if (cat === 'gk') updatePositionView('gk');
      else if (cat === 'def') updatePositionView('cb1');
      else if (cat === 'mid') updatePositionView('mcd');
      else if (cat === 'att') updatePositionView('cf');
    });
  });
}

/* ==========================================================================
   8. FILTRO DINÁMICO DE JUGADORES
   ========================================================================== */
function initPlayerFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const playerCards = document.querySelectorAll('.player-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playSound('kick');

      const filterValue = btn.getAttribute('data-filter');

      playerCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');

        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transition = 'opacity 0.35s ease';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   9. MINI QUIZ FUTBOLERO CON CONFETI
   ========================================================================== */
const quizQuestions = [
  {
    question: '¿Qué selección nacional ostenta más títulos de Copa Mundial de la FIFA en la historia?',
    options: ['Alemania (4 títulos)', 'Brasil (5 títulos)', 'Italia (4 títulos)', 'Argentina (3 títulos)'],
    correct: 1,
    explanation: '¡Golazo! Brasil es el pentacampeón indiscutible del fútbol mundial (1958, 1962, 1970, 1994 y 2002).'
  },
  {
    question: '¿A qué distancia exacta de la línea de meta se coloca el balón para un tiro penal?',
    options: ['9.15 metros', '10.5 metros', '11 metros (12 yardas)', '12 metros exactos'],
    correct: 2,
    explanation: '¡Exacto! El punto de penal se sitúa a 11 metros reglamentarios frente al centro de la portería.'
  },
  {
    question: '¿Quién es el único futbolista en ganar 8 Balones de Oro en la historia del fútbol?',
    options: ['Cristiano Ronaldo', 'Johan Cruyff', 'Lionel Messi', 'Zinedine Zidane'],
    correct: 2,
    explanation: '¡Brillante! Lionel Messi ostenta el récord absoluto e histórico con 8 Balones de Oro en sus vitrinas.'
  },
  {
    question: '¿En qué año y país se disputó la primera Copa Mundial de la FIFA de la historia?',
    options: ['1930 en Uruguay', '1924 en Francia', '1934 en Italia', '1950 en Brasil'],
    correct: 0,
    explanation: '¡Historia pura! Se celebró en 1930 en Montevideo, Uruguay, donde la selección anfitriona fue campeona.'
  },
  {
    question: '¿Qué club europeo ostenta el récord histórico de más títulos de UEFA Champions League?',
    options: ['F.C. Barcelona (5 títulos)', 'A.C. Milan (7 títulos)', 'Bayern Múnich (6 títulos)', 'Real Madrid C.F. (15 títulos)'],
    correct: 3,
    explanation: '¡El Rey de Europa! El Real Madrid encabeza la tabla con 15 Orejonas en su mítico palmarés.'
  }
];

function initInteractiveQuiz() {
  let currentIdx = 0;
  let score = 0;

  const quizCard = document.getElementById('quizCard');
  const quizResult = document.getElementById('quizResult');
  const questionEl = document.getElementById('quizQuestion');
  const optionsEl = document.getElementById('quizOptions');
  const feedbackEl = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNextBtn');
  const progressFill = document.getElementById('quizProgress');
  const stepText = document.getElementById('quizStepText');
  const scoreBadge = document.getElementById('quizScoreBadge');
  const restartBtn = document.getElementById('quizRestartBtn');
  const resultScoreText = document.getElementById('resultScoreText');
  const resultDescText = document.getElementById('resultDescText');
  const resultTitleText = document.getElementById('resultTitleText');

  if (!questionEl || !optionsEl) return;

  function loadQuestion() {
    const q = quizQuestions[currentIdx];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    feedbackEl.style.display = 'none';
    feedbackEl.className = 'quiz-feedback';
    nextBtn.style.display = 'none';

    stepText.innerHTML = `<i class="fa-regular fa-circle-question text-green"></i> Pregunta ${currentIdx + 1} de ${quizQuestions.length}`;
    scoreBadge.innerHTML = `<i class="fa-solid fa-star text-yellow"></i> Puntos: ${score}`;
    progressFill.style.width = `${((currentIdx + 1) / quizQuestions.length) * 100}%`;

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.innerHTML = `<span>${optText}</span> <i class="fa-regular fa-circle"></i>`;
      btn.addEventListener('click', () => selectAnswer(index, btn));
      optionsEl.appendChild(btn);
    });
  }

  function selectAnswer(selectedIndex, selectedBtn) {
    const q = quizQuestions[currentIdx];
    const buttons = optionsEl.querySelectorAll('.quiz-option');

    // Deshabilitar todos los botones para evitar trampas
    buttons.forEach(b => b.disabled = true);

    if (selectedIndex === q.correct) {
      score++;
      playSound('kick');
      selectedBtn.classList.add('correct');
      selectedBtn.querySelector('i').className = 'fa-solid fa-circle-check';
      feedbackEl.className = 'quiz-feedback correct';
      feedbackEl.innerHTML = `<i class="fa-solid fa-check"></i> ${q.explanation}`;
    } else {
      playSound('whistle');
      selectedBtn.classList.add('wrong');
      selectedBtn.querySelector('i').className = 'fa-solid fa-circle-xmark';
      
      const correctBtn = buttons[q.correct];
      if (correctBtn) {
        correctBtn.classList.add('correct');
        correctBtn.querySelector('i').className = 'fa-solid fa-circle-check';
      }

      feedbackEl.className = 'quiz-feedback wrong';
      feedbackEl.innerHTML = `<i class="fa-solid fa-xmark"></i> Respuesta incorrecta. ${q.explanation}`;
    }

    scoreBadge.innerHTML = `<i class="fa-solid fa-star text-yellow"></i> Puntos: ${score}`;
    feedbackEl.style.display = 'block';

    if (currentIdx < quizQuestions.length - 1) {
      nextBtn.innerHTML = `Siguiente Pregunta <i class="fa-solid fa-arrow-right"></i>`;
    } else {
      nextBtn.innerHTML = `Ver Resultados Finales <i class="fa-solid fa-trophy"></i>`;
    }
    nextBtn.style.display = 'inline-flex';
  }

  nextBtn.addEventListener('click', () => {
    currentIdx++;
    if (currentIdx < quizQuestions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  });

  function showResults() {
    quizCard.style.display = 'none';
    quizResult.style.display = 'block';

    resultScoreText.textContent = `Acertaste ${score} de ${quizQuestions.length} preguntas`;

    if (score === 5) {
      playSound('celebration');
      launchConfetti();
      resultTitleText.textContent = '¡NIVEL BALÓN DE ORO MUNDIAL!';
      resultDescText.textContent = '¡Puntaje perfecto! Eres una enciclopedia viva del balompié internacional. Tienes madera de Director Técnico legendario. ⚽🏆';
    } else if (score >= 3) {
      playSound('celebration');
      launchConfetti();
      resultTitleText.textContent = '¡TITULAR INDISCUTIBLE!';
      resultDescText.textContent = '¡Gran partido! Tu conocimiento táctico e histórico está en la élite. Con un toque más de entrenamiento llegarás al podio.';
    } else {
      resultTitleText.textContent = '¡EL FÚTBOL SIEMPRE DA REVANCHA!';
      resultDescText.textContent = '¡Buen intento! Repasa las secciones de la Cancha Táctica y las Leyendas de Mundo Fútbol y vuelve a intentarlo.';
    }
  }

  restartBtn.addEventListener('click', () => {
    currentIdx = 0;
    score = 0;
    quizResult.style.display = 'none';
    quizCard.style.display = 'block';
    loadQuestion();
  });

  // Newsletter con feedback visual
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playSound('kick');
      const email = document.getElementById('newsletterEmail')?.value;
      alert(`¡Bienvenido a Mundo Fútbol! Hemos registrado ${email} para recibir las mejores novedades tácticas. ⚽`);
      newsletterForm.reset();
    });
  }

  // Carga inicial
  loadQuestion();
}

/* ==========================================================================
   10. GENERADOR DE CONFETI EN CANVAS NATIVO (Sin Librerías Pesadas)
   ========================================================================== */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const numberOfPieces = 120;
  const colors = ['#00ff88', '#ffffff', '#facc15', '#38bdf8', '#059669', '#39ff14'];

  for (let i = 0; i < numberOfPieces; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      rotation: Math.random() * 360,
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 4 + 3,
      speedX: Math.random() * 3 - 1.5,
      rotationSpeed: Math.random() * 6 - 3
    });
  }

  let animationFrame;
  let startTime = Date.now();

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let stillActive = false;

    pieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      if (p.y < canvas.height) {
        stillActive = true;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (stillActive && Date.now() - startTime < 4500) {
      animationFrame = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  render();
}

/* ==========================================================================
   11. RESPALDO INTELIGENTE DE IMÁGENES
   ========================================================================== */
function initImageFallbacks() {
  const images = document.querySelectorAll('img');
  const svgPlaceholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0%%" y1="0%%" x2="100%%" y2="100%%"><stop offset="0%%" stop-color="%2306190e"/><stop offset="100%%" stop-color="%230c3721"/></linearGradient></defs><rect width="800" height="500" fill="url(%23g)"/><circle cx="400" cy="250" r="95" stroke="%2300ff88" stroke-width="4" fill="none" opacity="0.45"/><circle cx="400" cy="250" r="42" fill="%2300ff88"/><text x="50%%" y="73%%" font-family="sans-serif" font-size="28" font-weight="900" fill="%23ffffff" text-anchor="middle">MUNDO FÚTBOL</text></svg>`;

  images.forEach(img => {
    img.addEventListener('error', function() {
      if (this.src !== svgPlaceholder) {
        this.src = svgPlaceholder;
      }
    });
  });
}
