<script setup lang="ts">
const colorMode = useColorMode()

const modes = ['system', 'light', 'dark'] as const
type Mode = (typeof modes)[number]

const icons: Record<Mode, string> = {
  system: 'i-lucide:monitor',
  light: 'i-lucide:sun',
  dark: 'i-lucide:moon',
}

const labels: Record<Mode, string> = {
  system: 'Switch to light mode',
  light: 'Switch to dark mode',
  dark: 'Switch to system mode',
}

const currentIndex = computed(() => {
  const idx = modes.indexOf(colorMode.preference as Mode)
  return idx === -1 ? 0 : idx
})

const nextMode = computed(() => modes[(currentIndex.value + 1) % modes.length])

function toggle() {
  colorMode.preference = nextMode.value
}
</script>

<template>
  <ClientOnly>
    <UButton
      :icon="icons[colorMode.preference as Mode] || icons.system"
      :aria-label="labels[colorMode.preference as Mode] || labels.system"
      variant="ghost"
      color="neutral"
      square
      @click="toggle"
    />
    <template #fallback>
      <UButton
        :icon="icons.system"
        aria-label="Color mode"
        variant="ghost"
        color="neutral"
        square
        disabled
      />
    </template>
  </ClientOnly>
</template>
