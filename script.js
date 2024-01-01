/*************O SOM DO FOGO DE ARTIFICIO PEGUEI NO SITE******************
 ***https://pixabay.com/pt/sound-effects/search/fogos%20de%20artifício/***
 *********************O NOME DO SOM É -> single firework******************/

var c = document.getElementById("Canvas");
var ctx = c.getContext("2d");

var cwidth, cheight;
var shells = [];
var pass = [];

var colors = [
   "#FF5252",
   "#FF4081",
   "#E040FB",
   "#7C4DFF",
   "#536DFE",
   "#448AFF",
   "#40C4FF",
   "#18FFFF",
   "#64FFDA",
   "#69F0AE",
   "#B2FF59",
   "#EEFF41",
   "#FFFF00",
   "#FFD740",
   "#FFAB40",
   "#FF6E40",
];

var audioPaths = [
   "fogo.mp3",
   // Adicione mais caminhos conforme necessário
];

var audioContext;
var audioBuffers = [];
var currentAudioIndex = 0;

function initAudioContext() {
   audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function loadAudio() {
   var promises = audioPaths.map(function (path) {
      return fetch(path)
         .then((response) => response.arrayBuffer())
         .then((data) => audioContext.decodeAudioData(data))
         .then((buffer) => audioBuffers.push(buffer))
         .catch((error) => console.error("Erro ao carregar áudio:", error));
   });

   return Promise.all(promises);
}

function playRandomSound() {
   if (audioBuffers.length === 0) {
      console.warn("Nenhum arquivo de áudio carregado.");
      return;
   }

   var source = audioContext.createBufferSource();
   source.buffer = audioBuffers[currentAudioIndex];
   source.connect(audioContext.destination);

   source.start(0);
   currentAudioIndex = (currentAudioIndex + 1) % audioBuffers.length;
}

function explode(shell) {
   for (var i = 0; i < 30; i++) {
      var explosionParticle = {
         x: shell.x * cwidth,
         y: shell.y * cheight,
         xoff: (Math.random() - 0.5) * 5,
         yoff: (Math.random() - 0.5) * 5,
         color: shell.color,
         size: Math.random() * 3 + 1,
         alpha: 1.0,
         fade: Math.random() * 0.05 + 0.02,
      };
      pass.push(explosionParticle);
   }
}

function newShell() {
   var left = Math.random() > 0.5;
   var shell = {
      x: left ? 1 : 0,
      y: 1,
      xoff: (0.01 + Math.random() * 0.007) * (left ? 1 : -1),
      yoff: 0.01 + Math.random() * 0.007,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
   };

   shells.push(shell);
}

function newPass(shell) {
   var pasCount = Math.ceil(Math.pow(shell.size, 2) * Math.PI);

   for (var i = 0; i < pasCount; i++) {
      var pas = {
         x: shell.x * cwidth,
         y: shell.y * cheight,
         xoff: 0,
         yoff: 0,
         color: shell.color,
         size: Math.sqrt(shell.size),
      };

      pass.push(pas);
   }
}

function reset() {
   cwidth = window.innerWidth;
   cheight = window.innerHeight;
   c.width = cwidth;
   c.height = cheight;
}

var lastRun = 0;

function Run() {
   var dt = 1;
   if (lastRun !== 0) {
      dt = Math.min(50, performance.now() - lastRun);
   }
   lastRun = performance.now();

   ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
   ctx.fillRect(0, 0, cwidth, cheight);

   if (shells.length < 10 && Math.random() > 0.96) {
      newShell();
   }

   for (var ix = 0; ix < shells.length; ix++) {
      var shell = shells[ix];

      ctx.beginPath();
      ctx.arc(shell.x * cwidth, shell.y * cheight, shell.size, 0, 2 * Math.PI);
      ctx.fillStyle = shell.color;
      ctx.fill();

      shell.x -= shell.xoff;
      shell.y -= shell.yoff;
      shell.xoff -= shell.xoff * dt * 0.001;
      shell.yoff -= (shell.yoff + 0.2) * dt * 0.00005;

      if (shell.yoff < -0.005) {
         explode(shell);
         shells.splice(ix, 1);

         playRandomSound();
      }
   }

   for (var ix = 0; ix < pass.length; ix++) {
      var pas = pass[ix];

      ctx.beginPath();
      ctx.arc(pas.x, pas.y, pas.size, 0, 2 * Math.PI);
      ctx.fillStyle = pas.color;
      ctx.fill();

      pas.x -= pas.xoff;
      pas.y -= pas.yoff;
      pas.xoff -= pas.xoff * dt * 0.001;
      pas.yoff -= (pas.yoff + 5) * dt * 0.0005;

      pas.size -= dt * 0.01 * Math.random();

      if (pas.y > cheight || pas.y < -50 || pas.size <= 0) {
         pass.splice(ix, 1);
      }
   }

   requestAnimationFrame(Run);
}

// Inicializar o contexto de áudio e carregar os áudios
initAudioContext();
loadAudio().then(function () {
   reset();
   Run();
});

// Reproduzir áudio automaticamente ao carregar a página
playRandomSound();
