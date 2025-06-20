firebase.initializeApp(window.firebaseConfig);

const matchId = localStorage.getItem("currentMatchId");
if (matchId) {
  const matchIdElement = document.getElementById("match-id");
  if (matchIdElement) {
    matchIdElement.textContent = `ID Partita: ${matchId}`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Controlla se la partita è in corso
  if (localStorage.getItem("gameInProgress") === "true") {
    window.location.href = "match.html"; // Se la partita è in corso, vai direttamente alla pagina match
  } else {
    document.body.classList.remove("hidden"); // Mostra il contenuto solo se l'utente rimane su index.html
  }

  // Recupera i dati salvati e li inserisce nei campi
  const savedSettings = JSON.parse(localStorage.getItem("matchSettings"));
  if (savedSettings) {
    document.getElementById("nameMatch").value = savedSettings.nameMatch || "";
    document.getElementById("nameP1").value = savedSettings.nameP1 || "";
    document.getElementById("nameP2").value = savedSettings.nameP2 || "";
    document.getElementById("game").value = savedSettings.gameCount || "";
    document.getElementById("set").value = savedSettings.setCount || "";
    document.getElementById("tieBreak").value = savedSettings.tieBreak || "";
  }

  // Alterna tra i form "Nuova Partita" e "Allenamento"
  const buttons = document.querySelectorAll(".top-button");
  const buttonNewMatch = document.getElementById("buttonTop-newMatch");
  const buttonAllenamento = document.getElementById("buttonTop-allenamento");
  const h2 = document.querySelector("h2");
  const matchLabel = document.querySelector('label[for="impNomeMatch"]');
  const startMatchButton = document.getElementById("start-match");

  // Funzione per gestire l'evidenziazione
  function highlightButton(button) {
    buttons.forEach((btn) => btn.classList.remove("active")); // Rimuovi la classe 'active' da tutti i bottoni
    button.classList.add("active"); // Aggiungi la classe 'active' al bottone cliccato
  }

  // Imposta "Nuova Partita" come selezionato all'apertura
  highlightButton(buttonNewMatch);

  buttonNewMatch.addEventListener("click", function () {
    highlightButton(buttonNewMatch); // Evidenzia il bottone "Nuova Partita"
    h2.textContent = "Nuova Partita";
    matchLabel.textContent = "Match";
    startMatchButton.textContent = "Avvia Partita";
  });

  buttonAllenamento.addEventListener("click", function () {
    highlightButton(buttonAllenamento); // Evidenzia il bottone "Allenamento"
    h2.textContent = "Allenamento";
    matchLabel.textContent = "Training";
    startMatchButton.textContent = "Avvia Allenamento";
  });
});

// Funzione per salvare i dati mentre vengono inseriti
function saveInputData() {
  const nameMatch = document
    .getElementById("nameMatch")
    .value.trim()
    .toUpperCase();
  const nameP1 = document.getElementById("nameP1").value.trim().toUpperCase();
  const nameP2 = document.getElementById("nameP2").value.trim().toUpperCase();
  const gameCount = document.getElementById("game").value;
  const setCount = document.getElementById("set").value;
  const tieBreak = document.getElementById("tieBreak").value;

  localStorage.setItem(
    "matchSettings",
    JSON.stringify({ nameMatch, nameP1, nameP2, gameCount, setCount, tieBreak })
  );
}

// Aggiunge un event listener a ogni campo per salvare i dati mentre l'utente digita
document.getElementById("nameMatch").addEventListener("input", saveInputData);
document.getElementById("nameP1").addEventListener("input", saveInputData);
document.getElementById("nameP2").addEventListener("input", saveInputData);
document.getElementById("game").addEventListener("input", saveInputData);
document.getElementById("set").addEventListener("input", saveInputData);
document.getElementById("tieBreak").addEventListener("input", saveInputData);

const startMatchButton = document.getElementById("start-match");

// // Funzione per generare un numero casuale di 6 cifre come stringa
function generateNumericId(length = 6) {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += Math.floor(Math.random() * 10);
  }
  return id;
}

// // Funzione per generare un ID numerico di 6 cifre NON duplicato su Firebase
async function generateUniqueMatchId() {
  let matchId;
  let exists = true;
  while (exists) {
    matchId = generateNumericId(6);
    const snapshot = await firebase
      .database()
      .ref("matches/" + matchId)
      .once("value");
    exists = snapshot.exists();
  }
  return matchId;
}
startMatchButton.addEventListener("click", async () => {
  const matchId = await generateUniqueMatchId();
  localStorage.setItem("currentMatchId", matchId);
  // Raccogli i dati inseriti dall'utente
  const nameMatch = document
    .getElementById("nameMatch")
    .value.trim()
    .toUpperCase();
  const nameP1 = document.getElementById("nameP1").value.trim().toUpperCase();
  const nameP2 = document.getElementById("nameP2").value.trim().toUpperCase();
  const gameCount = document.getElementById("game").value;
  const setCount = document.getElementById("set").value;
  const tieBreak = document.getElementById("tieBreak").value;
  const modalitaGioco = document.querySelector(
    'input[name="modalita-gioco"]:checked'
  )?.value;

  // Verifica che i campi obbligatori siano compilati
  if (
    !nameMatch ||
    !nameP1 ||
    !nameP2 ||
    !setCount ||
    !tieBreak ||
    !modalitaGioco
  ) {
    alert("Per favore, completa tutti i campi obbligatori.");
    return;
  }

  // Salva i dati nel localStorage
  localStorage.setItem(
    "matchSettings",
    JSON.stringify({
      nameMatch,
      nameP1,
      nameP2,
      gameCount: parseInt(gameCount, 10),
      setCount: parseInt(setCount, 10),
      tieBreak: parseInt(tieBreak, 10),
      modalitaGioco,
    })
  );

  // Imposta che la partita è iniziata
  // localStorage.setItem("gameInProgress", "true");
  localStorage.removeItem("currentService");
  localStorage.removeItem("matchFinished");

  // Controlla se il bottone è impostato su "Avvia Allenamento"
  if (startMatchButton.textContent === "Avvia Allenamento") {
    localStorage.setItem("isTieBreak", "true"); // Imposta il tie-break
  } else {
    localStorage.removeItem("isTieBreak"); // Rimuovi il tie-break per la modalità normale
  }
  // Reindirizza alla pagina match.html
  window.location.href = "match.html";
});

document
  .querySelectorAll('input[name="colore-campo"]')
  .forEach((input, index) => {
    input.addEventListener("change", function () {
      // Trova il colore associato alla color-box corrispondente
      const colore = input.nextElementSibling.style.backgroundColor;
      localStorage.setItem("campoColor", colore);
    });
  });

document.getElementById("guarda-live").addEventListener("click", function () {
  window.location.href = "live.html";
});
