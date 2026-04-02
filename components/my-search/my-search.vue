<template>
  <app-search-bar :radius="radius" :background-color="bgcolor" @click="$emit('click')" />
</template>

<script>
import AppSearchBar from '@/components/app-search-bar/app-search-bar.vue'

export default {
  name: 'LegacyMySearch',
  components: {
    AppSearchBar,
  },
  props: {
    radius: {
      type: Number,
      default: 18,
    },
    bgcolor: {
      type: String,
      default: '#C00000',
    },
  },
}
</script>
