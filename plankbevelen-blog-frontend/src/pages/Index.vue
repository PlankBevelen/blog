<template>
    <header>
        <Header :class="{'show': showHeader, 'hide': !showHeader}" :style="{ backgroundColor: isTransparent ? 'transparent' : 'rgba(0, 0, 0, 0.55)'}"/>
    </header>
    <main>
        <router-view />
    </main>
    <footer>
        <Footer />
    </footer>
</template>

<script setup lang="ts">
import Header from '@/components/layouts/Header.vue'
import Footer from '@/components/layouts/Footer.vue'
import { ref, onMounted } from 'vue'
import { throttle } from 'lodash'

// 监听
const showHeader = ref(true);
const isTransparent = ref(true);
const lastScrollPos = ref(0);

const handleScroll = throttle(() => {
    const curScrollPos = window.scrollY;
    if(curScrollPos > lastScrollPos.value && curScrollPos > 0) {
        showHeader.value = false;
    } else {
        showHeader.value = true;
    }
    if (curScrollPos > 15) {
        isTransparent.value = false;
    }else {
        isTransparent.value = true;
    }
    lastScrollPos.value = curScrollPos;
}, 200);

onMounted(()=>{
    window.addEventListener('scroll', handleScroll);
})
</script>

<style scoped lang="less">

</style>
