import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', () => {
  const backgroundColor = ref<string>('#F0EAD6')

  return { backgroundColor }
})
