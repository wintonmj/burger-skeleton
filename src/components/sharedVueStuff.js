'use strict';

// Stuff that is used both in the ordering system and in the kitchen
var sharedVueStuff = {
  data: function () {
    return {
      orders: {},
      ingredients: {},
      notDone: [],
      isDone: []
    }
  },
  computed: {
    uiLabels: function () {
      return this.$store.state.uiLabels;
    },
    lang: { get: function () {
      return this.$store.state.lang;
     },
     set: function (lang) {
      this.$store.commit('switchLang', lang);
     }
    }
  },
  created: function () {
    this.$store.state.socket.emit('pageLoaded');

    this.$store.state.socket.on('initialize', function (data) {
      this.orders = data.orders;
      this.$store.commit('setUiLabels', data.uiLabels);
      this.notDone = data.notDone;
      this.isDone = data.isDone;
      this.ingredients = data.ingredients;
      this.$store.state.ingredients=this.ingredients;
    }.bind(this));

    this.$store.state.socket.on('switchLang', function (data) {
      this.$store.commit('setUiLabels', data);
    }.bind(this));

    this.$store.state.socket.on('currentQueue', function (data) {
      this.orders = data.orders;
      this.notDone = data.notDone;
      this.isDone = data.isDone;
      if (typeof data.ingredients !== 'undefined') {
        this.ingredients = data.ingredients;
      }
    }.bind(this));
  },
  methods: {
    switchLang: function () {
      if (this.lang === "en") {
        this.lang = "sv";
      } else {
        this.lang = "en";
      }
      this.$store.state.socket.emit('switchLang', this.lang);
    }
  }
};

export default sharedVueStuff;
