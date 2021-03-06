import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: io(),
    uiLabels: {},
    lang: 'en',
    drinks: {},
    sides: {},
    cartCount: 0,
    close: false,
    selectedPremadeBurger:[],
    selectedBurger:[],
    orderedBurgers: [],
    orderedDrinks: [],
    orderedSides: [],
    orderedPremadeBurgers: [],
    finish: false,
    currentTab: 'Buns',
    ingredients: [],
    dO: ''
  },
  getters: {
    getSocket: state => state.socket
  },
  mutations: {
    setUiLabels: function (store, labels) {
      store.uiLabels = labels;
    },
    switchLang: function (store, lang) {
      store.lang = lang;
    },
    changeCurrentTab: function (store, tab) {
      store.currentTab = tab;
    },
    toggleClose: function (store) {
      store.close = !store.close;
    },
    toggleFinish: function (store) {
      store.finish = !store.finish;
    },
  },
  actions: {

  }
})
