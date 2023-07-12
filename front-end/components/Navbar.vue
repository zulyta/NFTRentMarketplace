<template>
  <header class="header">
    <nav class="container">
      <div class="logo">
        <NuxtLink to="/">NFT Rent</NuxtLink>
      </div>
      <ul class="header-list">
        <li v-for="(url, i) in urls" :key="i">
          <NuxtLink :to="url.path">{{ url.name }}</NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
const urls = [
  { name: 'Publicar NFT', path: '/lend-nft' },
  { name: 'Perfil', path: '/profile' },
];
</script>
