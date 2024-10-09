<template>
    <div class="language-switcher-container" @click.stop>
      <button class="language-switcher" @click="toggleLanguage">
        {{ alternateLanguage }}
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LanguageSwitcher',
    data() {
      return {
        languages: {
          en: 'EN',
          ru: 'RU',
        },
      };
    },
    computed: {
      currentLanguage() {
        return this.$i18n.locale.toUpperCase();
      },
      alternateLanguage() {
        return this.$i18n.locale === 'en' ? this.languages.ru : this.languages.en;
      },
    },
    methods: {
      toggleLanguage() {
        const newLang = this.$i18n.locale === 'en' ? 'ru' : 'en';
        this.$i18n.locale = newLang;
        localStorage.setItem('locale', newLang);
      },
    },
  };
  </script>
  
  <style scoped>
  .language-switcher-container {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000; /* Ensure it stays on top */
  }
  
  .language-switcher {
    background: #355d87;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #c76d88;
    font-family: 'Noto Sans', sans-serif;
    transition: color 0.3s ease;
  }
  
  .language-switcher:hover {
    color: #a377b0;
  }
  </style>
  