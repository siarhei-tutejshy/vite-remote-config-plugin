<template>
  <div>
    Open browser devtools!
  </div>
  <div>
    Mode: {{ mode }}
  </div>
  <div>
    Env variable: {{ prop }}
  </div>
</template>

<script setup>
const mode = import.meta.env.MODE;
const prop = import.meta.env.VITE_EVN_PROP;
</script>
