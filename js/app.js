// js/app.js
// Логика приложения Flashcards MVP с улучшенной фильтрацией кликов

const STORAGE_KEY = 'flashcardsData';
let data = [];
let currentDeckId = null;
let studyIndex = 0;
let showingBack = false;

// DOM элементы
const views = document.querySelectorAll('.view');
const deckListView = document.getElementById('deck-list');
const cardListView = document.getElementById('card-list');
const studyView = document.getElementById('study-view');

const decksUl = document.getElementById('decks');
const newDeckForm = document.getElementById('new-deck-form');
const newDeckNameInput = document.getElementById('new-deck-name');

const backToDecksBtn = document.getElementById('back-to-decks');
const deckTitle = document.getElementById('deck-title');
const cardsUl = document.getElementById('cards');
const newCardForm = document.getElementById('new-card-form');
const cardFrontInput = document.getElementById('card-front');
const cardBackInput = document.getElementById('card-back');
const startStudyBtn = document.getElementById('start-study');

const backToCardsBtn = document.getElementById('back-to-cards');
const cardContainer = document.getElementById('card-container');
const cardFrontView = document.getElementById('card-front-view');
const cardBackView = document.getElementById('card-back-view');
const prevCardBtn = document.getElementById('prev-card');
const nextCardBtn = document.getElementById('next-card');
const progressSpan = document.getElementById('progress');

// Загрузка и сохранение данных
function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Переключение видов
function showView(view) {
  views.forEach(v => v.hidden = true);
  view.hidden = false;
}

// ************** Колоды **************
function renderDeckList() {
  decksUl.innerHTML = '';
  data.forEach(deck => {
    const li = document.createElement('li');
    li.textContent = deck.name;

    const btnWrap = document.createElement('div');
    btnWrap.style.display = 'flex'; btnWrap.style.gap = '0.5rem';

    const openBtn = document.createElement('button');
    openBtn.textContent = 'Открыть';
    openBtn.addEventListener('click', e => { e.stopPropagation(); openDeck(deck.id); });

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Удалить';
    delBtn.addEventListener('click', e => { e.stopPropagation(); deleteDeck(deck.id); });

    btnWrap.append(openBtn, delBtn);
    li.append(btnWrap);
    decksUl.append(li);
  });
}

function handleNewDeck(e) {
  e.preventDefault();
  const name = newDeckNameInput.value.trim();
  if (!name) return;
  data.push({ id: generateId(), name, cards: [] });
  saveData();
  newDeckNameInput.value = '';
  renderDeckList();
}

function deleteDeck(id) {
  // Удаляем колоду без окна подтверждения
  data = data.filter(d => d.id !== id);
  saveData();
  renderDeckList();
}

function openDeck(id) {
  currentDeckId = id;
  renderCardList();
  showView(cardListView);
}

function handleBackToDecks() {
  currentDeckId = null;
  showView(deckListView);
}

// ************** Карточки **************
function renderCardList() {
  const deck = data.find(d => d.id === currentDeckId);
  deckTitle.textContent = deck.name;

  cardsUl.innerHTML = '';
  deck.cards.forEach(card => {
    const li = document.createElement('li');
    li.textContent = card.front;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Удалить';
    delBtn.addEventListener('click', e => { e.stopPropagation(); deleteCard(card.id); });

    li.append(delBtn);
    cardsUl.append(li);
  });
}

function handleNewCard(e) {
  e.preventDefault();
  const front = cardFrontInput.value.trim();
  const back = cardBackInput.value.trim();
  if (!front || !back) return;
  const deck = data.find(d => d.id === currentDeckId);
  deck.cards.push({ id: generateId(), front, back });
  saveData();
  cardFrontInput.value = '';
  cardBackInput.value = '';
  renderCardList();
}

function deleteCard(cardId) {
  // Удаляем карточку без окна подтверждения
  const deck = data.find(d => d.id === currentDeckId);
  deck.cards = deck.cards.filter(c => c.id !== cardId);
  saveData();
  renderCardList();
}

// ************** Режим тренировки **************
function startStudy() {
  const deck = data.find(d => d.id === currentDeckId);
  if (deck.cards.length === 0) { alert('В колоде нет карточек'); return; }
  studyIndex = 0;
  showingBack = false;
  showView(studyView);
  updateStudy();
}

function updateStudy() {
  const deck = data.find(d => d.id === currentDeckId);
  const card = deck.cards[studyIndex];
  cardFrontView.textContent = card.front;
  cardBackView.textContent = card.back;
  cardFrontView.hidden = showingBack;
  cardBackView.hidden = !showingBack;
  progressSpan.textContent = `${studyIndex + 1} / ${deck.cards.length}`;
}

function toggleCard(e) {
  // Игнорировать клики, происходящие в кнопках или их текстовых узлах
  const path = e.composedPath();
  if (path.some(el => el.tagName === 'BUTTON')) return;
  showingBack = !showingBack;
  updateStudy();
}

function prevCard() {
  if (studyIndex > 0) {
    studyIndex--;
    showingBack = false;
    updateStudy();
  }
}

function nextCard() {
  const deck = data.find(d => d.id === currentDeckId);
  if (studyIndex < deck.cards.length - 1) {
    studyIndex++;
    showingBack = false;
    updateStudy();
  }
}

function handleBackToCards(e) {
  e.stopPropagation();
  showingBack = false;
  showView(cardListView);
}

// ************** Инициализация **************
document.addEventListener('DOMContentLoaded', () => {
  data = loadData();

  // Колоды
  newDeckForm.addEventListener('submit', handleNewDeck);
  backToDecksBtn.addEventListener('click', handleBackToDecks);

  // Карточки
  newCardForm.addEventListener('submit', handleNewCard);
  startStudyBtn.addEventListener('click', e => { e.stopPropagation(); startStudy(); });

  // Тренировка
  cardContainer.addEventListener('click', toggleCard);
  prevCardBtn.addEventListener('click', e => { e.stopPropagation(); prevCard(); });
  nextCardBtn.addEventListener('click', e => { e.stopPropagation(); nextCard(); });
  backToCardsBtn.addEventListener('click', handleBackToCards);

  // Старт
  renderDeckList();
  showView(deckListView);
});
